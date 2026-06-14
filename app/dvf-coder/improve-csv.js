#!/usr/bin/env node --max-old-space-size=8192
/* eslint camelcase: off */
require('dotenv').config()

const path = require('path')
const {createReadStream, createWriteStream, promises: fsP} = require('fs')
const {Transform, PassThrough} = require('stream')
const {pipeline} = require('stream/promises')
const bluebird = require('bluebird')
const {ensureDir} = require('fs-extra')
const csvParser = require('csv-parser')
const csvWriter = require('csv-write-stream')
const {createGunzip} = require('gunzip-stream')
const {groupBy} = require('lodash')
const pumpify = require('pumpify').obj
const getStream = require('get-stream')
const intoStream = require('into-stream')
const {createGzip} = require('zlib')
const centroid = require('@turf/centroid').default
const truncate = require('@turf/truncate').default
const {getCulturesMap, getCulturesSpecialesMap} = require('./lib/cultures')
const {getDateMutation, getIdParcelle, getCodeCommune, getPrefixeSection, getCodePostal, parseFloat} = require('./lib/parse')
const {getParcellesCommune, setLogFn: setParcellesLogFn} = require('./lib/parcelles')
const {getCommune, getCommuneActuelle, getCodeDepartement, getCommuneFromCadastre} = require('./lib/recog')

const BATCH_SIZE = 50000

const log = new ProgressLogger()

function convertRow(row, {culturesMap, culturesSpecialesMap}) {
  const dateMutation = getDateMutation(row)
  const codeCommune = getCodeCommune(row)
  const commune = getCommune(codeCommune, dateMutation)
  let deFusionCommune = null
  const communeActuelle = getCommuneActuelle(commune, process.env.COG_MILLESIME) || (deFusionCommune = commune.nom, commune)
  const idParcelle = getIdParcelle(row)

  const converted = {
    _de_fusion: deFusionCommune,
    id_mutation: '',
    date_mutation: dateMutation,
    numero_disposition: row['No disposition'],
    nature_mutation: row['Nature mutation'],
    valeur_fonciere: parseFloat(row['Valeur fonciere']) || '',
    adresse_numero: row['No voie'],
    adresse_suffixe: row['B/T/Q'],
    adresse_nom_voie: [row['Type de voie'], row.Voie].filter(Boolean).join(' '),
    adresse_code_voie: row['Code voie'] ? row['Code voie'].padStart(4, '0') : '',
    code_postal: getCodePostal(row) || '',
    code_commune: communeActuelle.code,
    nom_commune: communeActuelle.nom,
    code_departement: getCodeDepartement(communeActuelle.code),
    ancien_code_commune: '',
    ancien_nom_commune: '',
    id_parcelle: idParcelle,
    ancien_id_parcelle: '',
    numero_volume: row['No Volume'],
    lot1_numero: row['1er lot'],
    lot1_surface_carrez: parseFloat(row['Surface Carrez du 1er lot']) || '',
    lot2_numero: row['2eme lot'],
    lot2_surface_carrez: parseFloat(row['Surface Carrez du 2eme lot']) || '',
    lot3_numero: row['3eme lot'],
    lot3_surface_carrez: parseFloat(row['Surface Carrez du 3eme lot']) || '',
    lot4_numero: row['4eme lot'],
    lot4_surface_carrez: parseFloat(row['Surface Carrez du 4eme lot']) || '',
    lot5_numero: row['5eme lot'],
    lot5_surface_carrez: parseFloat(row['Surface Carrez du 5eme lot']) || '',
    nombre_lots: row['Nombre de lots'],
    code_type_local: row['Code type local'],
    type_local: row['Type local'],
    surface_reelle_bati: parseFloat(row['Surface reelle bati']) || '',
    nombre_pieces_principales: row['Nombre pieces principales'],
    code_nature_culture: row['Nature culture'],
    nature_culture: row['Nature culture'] in culturesMap ? culturesMap[row['Nature culture']] : '',
    code_nature_culture_speciale: row['Nature culture speciale'],
    nature_culture_speciale: row['Nature culture speciale'] in culturesSpecialesMap ? culturesSpecialesMap[row['Nature culture speciale']] : '',
    surface_terrain: parseFloat(row['Surface terrain']) || '',
    longitude: '',
    latitude: ''
  }

  if (commune !== communeActuelle) {
    converted.ancien_code_commune = commune.code
    converted.ancien_nom_commune = commune.nom
  }

  if (commune.code !== communeActuelle.code) {
    const ancienneCommune = getCommuneFromCadastre(codeCommune, getPrefixeSection(row))
    if (ancienneCommune) {
      const communeActuelleCadastre = getCommuneActuelle(ancienneCommune, process.env.CADASTRE_MILLESIME)
      if (communeActuelleCadastre && commune.code !== communeActuelleCadastre.code) {
        converted.ancien_id_parcelle = idParcelle
        converted.id_parcelle = `${communeActuelle.code}${commune.code.substr(2, 3)}${idParcelle.substr(8)}`
      }
    }
  }

  return converted
}

function writeCsvFile(filePath, rows, includeHeader) {
  const writer = csvWriter({sendHeaders: includeHeader, separator: ','})
  const ws = createWriteStream(filePath, {flags: includeHeader ? 'w' : 'a'})
  return pipeline(
    intoStream.object(rows),
    writer,
    ws
  )
}

function applyParcelles(communeRows, parcelles) {
  communeRows.forEach(row => {
    if (row.ancien_id_parcelle in parcelles) {
      row.id_parcelle = row.ancien_id_parcelle
      row.ancien_id_parcelle = undefined
    }
    if (row.id_parcelle in parcelles) {
      const parcelle = parcelles[row.id_parcelle]
      const [lon, lat] = truncate(centroid(parcelle), {precision: 6}).geometry.coordinates
      row.longitude = lon
      row.latitude = lat
    }
  })
}

async function getCommunesWithParcelles(rows) {
  const groups = groupBy(rows, r => r.id_parcelle ? r.id_parcelle.substr(0, 5) : '')
  const deduped = new Map()
  for (const [code, codeRows] of Object.entries(groups)) {
    if (!code) continue
    if (!deduped.has(code)) deduped.set(code, [])
    deduped.get(code).push(...codeRows)
  }
  await bluebird.map([...deduped.entries()], async ([codeCommune, communeRows]) => {
    const parcelles = await getParcellesCommune(codeCommune)
    if (!parcelles) return
    applyParcelles(communeRows, parcelles)
  }, {concurrency: 16})
}

async function processYear(millesime, culturesMap, culturesSpecialesMap) {
  log.progress(`▶ ${millesime} — initialisation...`)

  process.env.COG_MILLESIME = `${millesime}-01-01`
  process.env.CADASTRE_MILLESIME = `${millesime}-01-01`

  const distDir = path.join(__dirname, 'dist', millesime)
  const tmpDir = path.join(__dirname, 'tmp', millesime)
  await ensureDir(tmpDir)

  /* Phase 1: Stream input in batches, writing per-commune files */

  log.log(`▶ ${millesime} — lecture et découpage par commune`)

  let valeurFonciere
  let dateMutation
  let idMutationSeq = 0
  let batch = []
  let batchCount = 0
  const communeHeadersWritten = new Set()
  const loggedDeFusions = new Set()

  const startedAt = Date.now()
  let totalRows = 0

  const transform = new Transform({
    objectMode: true,
    transform(row, enc, cb) {
      const converted = convertRow(row, {culturesMap, culturesSpecialesMap})

      if (converted._de_fusion && !loggedDeFusions.has(converted._de_fusion)) {
        loggedDeFusions.add(converted._de_fusion)
        log.log(`dé-fusion : ${converted._de_fusion}`)
      }
      delete converted._de_fusion

      if (converted.valeur_fonciere !== valeurFonciere || converted.date_mutation !== dateMutation) {
        idMutationSeq++
        valeurFonciere = converted.valeur_fonciere
        dateMutation = converted.date_mutation
      }

      converted.id_mutation = `${millesime}-${idMutationSeq}`

      batch.push(converted)
      totalRows++

      if (batch.length >= BATCH_SIZE) {
        batchCount++
        log.progress(`▶ ${millesime} — lot ${batchCount} (${(totalRows / 1000).toFixed(0)}k lignes, ${Math.round((Date.now() - startedAt) / 1000)}s)`)
        this.push({type: 'batch', data: batch})
        batch = []
      }

      cb()
    },

    flush(cb) {
      if (batch.length > 0) {
        batchCount++
        this.push({type: 'batch', data: batch})
        batch = []
      }
      cb()
    }
  })

  const writer = new Transform({
    objectMode: true,
    transform(packet, enc, cb) {
      if (packet.type !== 'batch') return cb()
      const grouped = groupBy(packet.data, 'code_commune')
      const promises = Object.entries(grouped).map(([codeCommune, rows]) => {
        const dept = getCodeDepartement(codeCommune)
        const dir = path.join(tmpDir, 'communes', dept)
        return ensureDir(dir).then(() => {
          const filePath = path.join(dir, `${codeCommune}.csv`)
          const includeHeader = !communeHeadersWritten.has(codeCommune)
          communeHeadersWritten.add(codeCommune)
          return writeCsvFile(filePath, rows, includeHeader)
        })
      })
      Promise.all(promises).then(() => cb()).catch(cb)
    }
  })

  await pipeline(
    createReadStream(path.join(__dirname, 'data', `valeursfoncieres-${millesime}.txt.gz`)),
    createGunzip(),
    csvParser({separator: '|'}),
    transform,
    writer
  )

  log.log(`✓ ${millesime} — ${(totalRows / 1000).toFixed(0)}k lignes traitées (${Math.round((Date.now() - startedAt) / 1000)}s)`)

  /* Phase 2: Geocoding per commune */

  if (process.env.DISABLE_GEOCODING !== '1') {
    log.log(`▶ ${millesime} — géocodage`)

    const loggedParcelles = new Set()
    setParcellesLogFn(msg => {
      if (!loggedParcelles.has(msg)) {
        loggedParcelles.add(msg)
        log.log(msg)
      }
    })

    const communeDirs = await fsP.readdir(path.join(tmpDir, 'communes'))
    const communeFiles = []
    for (const deptDir of communeDirs) {
      const dirPath = path.join(tmpDir, 'communes', deptDir)
      const stat = await fsP.stat(dirPath)
      if (!stat.isDirectory()) continue
      const files = (await fsP.readdir(dirPath))
        .filter(f => f.endsWith('.csv'))
        .map(f => path.join(dirPath, f))
      communeFiles.push(...files)
    }

    const geoStartedAt = Date.now()
    let geoDone = 0

    await bluebird.map(communeFiles, async filePath => {
      const rows = await getStream.array(pumpify(
        createReadStream(filePath),
        csvParser({separator: ','})
      ))
      if (rows.length === 0) return
      const hasParcelle = rows.some(r => r.id_parcelle)
      if (!hasParcelle) {
        geoDone++
        return
      }
      await getCommunesWithParcelles(rows)
      await writeCsvFile(filePath, rows, true)
      geoDone++
      log.progress(`▶ ${millesime} — géocodage ${geoDone}/${communeFiles.length} (${Math.round((Date.now() - geoStartedAt) / 1000)}s)`)
    }, {concurrency: 16})

    log.log(`✓ ${millesime} — géocodage terminé (${Math.round((Date.now() - geoStartedAt) / 1000)}s)`)
  }

  /* Phase 3: Export to final directories */

  log.log(`▶ ${millesime} — export des communes`)

  const communeDirs = await fsP.readdir(path.join(tmpDir, 'communes'))
  for (const deptDir of communeDirs) {
    const srcDir = path.join(tmpDir, 'communes', deptDir)
    const stat = await fsP.stat(srcDir)
    if (!stat.isDirectory()) continue
    const dstDir = path.join(distDir, 'communes', deptDir)
    await ensureDir(dstDir)
    const files = await fsP.readdir(srcDir)
    for (const file of files) {
      if (!file.endsWith('.csv')) continue
      await fsP.copyFile(path.join(srcDir, file), path.join(dstDir, file))
    }
  }

  log.log(`✓ ${millesime} — communes exportées`)

  /* Phase 4: Build department files from commune files */

  log.log(`▶ ${millesime} — export des départements`)

  const deptFiles = {}
  for (const deptDir of communeDirs) {
    const srcDir = path.join(tmpDir, 'communes', deptDir)
    const stat = await fsP.stat(srcDir)
    if (!stat.isDirectory()) continue
    const files = await fsP.readdir(srcDir)
    for (const file of files) {
      if (!file.endsWith('.csv')) continue
      const dept = getCodeDepartement(file.replace('.csv', ''))
      if (!deptFiles[dept]) deptFiles[dept] = []
      deptFiles[dept].push(path.join(srcDir, file))
    }
  }

  const departementsPath = path.join(distDir, 'departements')
  await ensureDir(departementsPath)

  const deptStartedAt = Date.now()
  const deptKeys = Object.keys(deptFiles)

  await bluebird.map(deptKeys, async (dept, idx) => {
    const outputPath = path.join(departementsPath, `${dept}.csv.gz`)
    const output = createWriteStream(outputPath)
    const gzip = createGzip()
    gzip.pipe(output)

    for (let i = 0; i < deptFiles[dept].length; i++) {
      const content = await fsP.readFile(deptFiles[dept][i], 'utf8')
      const lines = content.split('\n')
      const startLine = i === 0 ? 0 : 1
      const data = lines.slice(startLine).filter(Boolean).join('\n')
      if (data) gzip.write(data + '\n')
    }

    gzip.end()
    await new Promise((resolve, reject) => {
      output.on('finish', resolve)
      output.on('error', reject)
    })

    log.progress(`▶ ${millesime} — départements ${idx + 1}/${deptKeys.length} (${Math.round((Date.now() - deptStartedAt) / 1000)}s)`)
  }, {concurrency: 4})

  log.log(`✓ ${millesime} — ${deptKeys.length} départements exportés`)

  /* Phase 5: Build full file */

  log.log(`▶ ${millesime} — export complet`)

  const allFiles = Object.values(deptFiles).flat()
  if (allFiles.length > 0) {
    const fullPath = path.join(distDir, 'full.csv.gz')
    const output = createWriteStream(fullPath)
    const gzip = createGzip()
    gzip.pipe(output)

    for (let i = 0; i < allFiles.length; i++) {
      const content = await fsP.readFile(allFiles[i], 'utf8')
      const lines = content.split('\n')
      const startLine = i === 0 ? 0 : 1
      const data = lines.slice(startLine).filter(Boolean).join('\n')
      if (data) gzip.write(data + '\n')
    }

    gzip.end()
    await new Promise((resolve, reject) => {
      output.on('finish', resolve)
      output.on('error', reject)
    })
  }

  log.log(`✓ ${millesime} — terminé (${Math.round((Date.now() - startedAt) / 1000)}s)`)
}

async function main() {
  const culturesMap = await getCulturesMap()
  const culturesSpecialesMap = await getCulturesSpecialesMap()

  const years = process.env.ANNEES.split(',')
  log.log(`↻ années : ${years.join(', ')}`)

  await bluebird.each(years, async millesime => {
    await processYear(millesime, culturesMap, culturesSpecialesMap)
  })

  log.finalize()

  /* Cleanup tmp */
  for (const year of years) {
    const tmpPath = path.join(__dirname, 'tmp', year)
    if (require('fs').existsSync(tmpPath)) {
      require('fs').rmSync(tmpPath, {recursive: true, force: true})
    }
  }

  console.log('✓ Terminé')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
