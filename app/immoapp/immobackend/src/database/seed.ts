import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../modules/auth/entities/user.entity'
import { Credential } from '../modules/auth/entities/credential.entity'
import { Property } from '../modules/property/entities/property.entity'
import { PropertyFeature } from '../modules/property/entities/property-feature.entity'
import { PropertyImage } from '../modules/property/entities/property-image.entity'
import { PropertyPriceHistory } from '../modules/property/entities/property-price-history.entity'
import { PropertyMessage } from '../modules/property/entities/property-message.entity'
import { PropertyHistory } from '../modules/property/entities/property-history.entity'
import { Agency } from '../modules/property/entities/agency.entity'
import * as bcrypt from 'bcrypt'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)

  const userRepo = app.get(getRepositoryToken(User))
  const credentialRepo = app.get(getRepositoryToken(Credential))
  const propertyRepo = app.get(getRepositoryToken(Property))
  const featureRepo = app.get(getRepositoryToken(PropertyFeature))
  const imageRepo = app.get(getRepositoryToken(PropertyImage))
  const priceHistoryRepo = app.get(getRepositoryToken(PropertyPriceHistory))
  const messageRepo = app.get(getRepositoryToken(PropertyMessage))
  const historyRepo = app.get(getRepositoryToken(PropertyHistory))
  const agencyRepo = app.get(getRepositoryToken(Agency))

  const agencies = [
    { name: 'Y-Plaza Aix-en-Provence', department: '13', city: 'Aix-en-Provence', latitude: 43.5297, longitude: 5.4474 },
    { name: 'Y-Plaza Marseille', department: '13', city: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
    { name: 'Y-Plaza Paris', department: '75', city: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Y-Plaza Lyon', department: '69', city: 'Lyon', latitude: 45.7640, longitude: 4.8357 },
    { name: 'Y-Plaza Cannes', department: '06', city: 'Cannes', latitude: 43.5500, longitude: 7.0167 },
    { name: 'Y-Plaza Bordeaux', department: '33', city: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
    { name: 'Y-Plaza Lille', department: '59', city: 'Lille', latitude: 50.6292, longitude: 3.0573 },
    { name: 'Y-Plaza Toulouse', department: '31', city: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
    { name: 'Y-Plaza Strasbourg', department: '67', city: 'Strasbourg', latitude: 48.5734, longitude: 7.7521 },
    { name: 'Y-Plaza Nantes', department: '44', city: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
  ]
  for (const data of agencies) {
    const existing = await agencyRepo.findOneBy({ name: data.name })
    if (!existing) {
      await agencyRepo.save(data)
    }
  }

  async function findOrCreateUser(data: Partial<User>): Promise<User> {
    const existing = await userRepo.findOneBy({ email: data.email })
    if (existing) return existing
    return userRepo.save(data)
  }

  const clientUser = await findOrCreateUser({
    email: 'client@yplaza.fr',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '0612345678',
    role: 'client',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marie',
  })

  const staffUser = await findOrCreateUser({
    email: 'staff@yplaza.fr',
    firstName: 'Thomas',
    lastName: 'Lefebvre',
    phone: '0687654321',
    role: 'staff',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Thomas',
  })

  const client2 = await findOrCreateUser({
    email: 'sophie.bernard@email.com',
    firstName: 'Sophie',
    lastName: 'Bernard',
    phone: '0644556677',
    role: 'client',
  })

  const client3 = await findOrCreateUser({
    email: 'lucas.martin@email.com',
    firstName: 'Lucas',
    lastName: 'Martin',
    phone: '0677889900',
    role: 'client',
  })

  async function findOrCreateCredential(data: Partial<Credential>): Promise<void> {
    const existing = await credentialRepo.findOneBy({ providerId: data.providerId })
    if (!existing) {
      await credentialRepo.save(data)
    }
  }

  const hashedPassword = await bcrypt.hash('client123', 12)
  await findOrCreateCredential({
    userId: clientUser.id,
    provider: 'email',
    providerId: 'client@yplaza.fr',
    secret: hashedPassword,
  })

  const hashedStaffPassword = await bcrypt.hash('staff123', 12)
  await findOrCreateCredential({
    userId: staffUser.id,
    provider: 'email',
    providerId: 'staff@yplaza.fr',
    secret: hashedStaffPassword,
  })

  await findOrCreateCredential({
    userId: client2.id,
    provider: 'email',
    providerId: 'sophie.bernard@email.com',
    secret: hashedPassword,
  })

  await findOrCreateCredential({
    userId: client3.id,
    provider: 'email',
    providerId: 'lucas.martin@email.com',
    secret: hashedPassword,
  })

  // Properties
  const properties = [
    {
      title: 'Bastide Provençale avec Piscine',
      description: 'Magnifique bastide provençale entièrement rénovée située au cœur du pays d\'Aix. Cette propriété d\'exception offre des prestations haut de gamme, une vue imprenable sur la Sainte-Victoire et un parc arboré de 5000m².',
      price: 1250000,
      surface: 280,
      rooms: 7,
      type: 'maison' as const,
      address: '15 Chemin des Oliviers',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      department: '13',
      latitude: 43.5297,
      longitude: 5.4474,
      pricePerM2: 4464,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Aix-en-Provence',
      staffId: staffUser.id,
      features: ['Piscine chauffée', 'Garage 3 places', 'Cave à vin', 'Domotique', 'Climatisation réversible'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      ],
    },
    {
      title: 'Appartement Haussmannien Vue Tour Eiffel',
      description: 'Superbe appartement haussmannien au 6ème étage avec ascenseur, offrant une vue dégagée sur la Tour Eiffel. Parquet d\'origine, moulures, cheminée en marbre.',
      price: 895000,
      surface: 120,
      rooms: 4,
      type: 'appartement' as const,
      address: '42 Avenue Mozart',
      city: 'Paris',
      postalCode: '75016',
      department: '75',
      latitude: 48.8566,
      longitude: 2.2894,
      pricePerM2: 7458,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Paris',
      staffId: staffUser.id,
      features: ['Ascenseur', 'Cave', 'Gardien', 'Balcon filant'],
      images: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      ],
    },
    {
      title: 'Local Commercial Centre-Ville',
      description: 'Local commercial de prestige en plein cœur du centre-ville de Lyon. Vitrine sur rue de 8 mètres, cave de stockage, mezzanine aménagée.',
      price: 650000,
      surface: 180,
      rooms: 3,
      type: 'local-commercial' as const,
      address: '8 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      department: '69',
      latitude: 45.7640,
      longitude: 4.8357,
      pricePerM2: 3611,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Lyon',
      staffId: staffUser.id,
      features: ['Vitrine 8m', 'Mezzanine', 'Cave', 'Climatisation'],
      images: [
        'https://images.unsplash.com/photo-1600607688965-1c2e6c8e4b9a?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      ],
    },
    {
      title: 'Mas Provençal avec Oliviers',
      description: 'Authentique mas provençal restauré dans le respect des traditions. Toiture en tuiles canal, murs en pierre apparente, terrasse ombragée.',
      price: 980000,
      surface: 200,
      rooms: 5,
      type: 'maison' as const,
      address: 'Route de Rousset',
      city: 'Marseille',
      postalCode: '13008',
      department: '13',
      latitude: 43.2965,
      longitude: 5.3698,
      pricePerM2: 4900,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Marseille',
      staffId: staffUser.id,
      features: ['Piscine naturelle', 'Olivier centenaire', 'Puits', 'Terrasse 80m²'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
      ],
    },
    {
      title: 'Terrain Constructible Vue Mer',
      description: 'Magnifique terrain constructible de 1200m² avec vue mer imprenable sur la baie de Cannes. Permis de construire obtenu pour villa de 180m².',
      price: 450000,
      surface: 1200,
      rooms: 0,
      type: 'terrain' as const,
      address: 'Chemin de la Croix Rouge',
      city: 'Cannes',
      postalCode: '06400',
      department: '06',
      latitude: 43.5500,
      longitude: 7.0167,
      pricePerM2: 375,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Cannes',
      staffId: staffUser.id,
      features: ['Vue mer', 'Permis obtenu', 'Viabilisé'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      ],
    },
    {
      title: 'Appartement Moderne Centre Historique',
      description: 'Appartement récent dans une résidence de standing au cœur du centre historique de Bordeaux. Prestations haut de gamme, cuisine équipée, terrasse de 25m².',
      price: 520000,
      surface: 85,
      rooms: 3,
      type: 'appartement' as const,
      address: '5 Rue Sainte-Catherine',
      city: 'Bordeaux',
      postalCode: '33000',
      department: '33',
      latitude: 44.8378,
      longitude: -0.5792,
      pricePerM2: 6118,
      visible: true,
      status: 'available' as const,
      agency: 'Y-Plaza Bordeaux',
      staffId: staffUser.id,
      features: ['Parking sous-sol', 'Terrasse 25m²', 'Cuisine équipée'],
      images: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      ],
    },
  ]

  for (const data of properties) {
    const { features, images, ...propertyData } = data
    const saved = await propertyRepo.save(propertyData)

    if (features.length) {
      const featureEntities = features.map(name => {
        const f = new PropertyFeature()
        f.propertyId = saved.id
        f.name = name
        return f
      })
      await featureRepo.save(featureEntities)
    }

    if (images.length) {
      const imageEntities = images.map((url, i) => {
        const img = new PropertyImage()
        img.propertyId = saved.id
        img.url = url
        img.alt = `Image ${i + 1}`
        img.isPrimary = i === 0
        return img
      })
      await imageRepo.save(imageEntities)
    }

    const priceHistory = new PropertyPriceHistory()
    priceHistory.propertyId = saved.id
    priceHistory.date = new Date().toISOString().slice(0, 10)
    priceHistory.price = saved.price
    priceHistory.pricePerM2 = saved.pricePerM2!
    await priceHistoryRepo.save(priceHistory)
  }

  // Sell requests (client-owned properties)
  const sellProperties = [
    {
      title: 'Appartement 3 pièces Centre Ville',
      description: 'Bel appartement lumineux au 4ème étage avec ascenseur.',
      price: 295000,
      surface: 72,
      rooms: 3,
      type: 'appartement' as const,
      address: '12 Rue de la République',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      department: '13',
      pricePerM2: 4097,
      visible: false,
      status: 'pending' as const,
      agency: 'Y-Plaza Aix-en-Provence',
      ownerId: clientUser.id,
      staffId: staffUser.id,
      features: ['Ascenseur', 'Proche commerces', 'Transport à proximité'],
    },
    {
      title: 'Maison avec Jardin',
      description: 'Charmante maison de ville avec jardin arboré. Garage, cave et combles aménageables.',
      price: 420000,
      surface: 110,
      rooms: 5,
      type: 'maison' as const,
      address: '8 Avenue des Pins',
      city: 'Marseille',
      postalCode: '13008',
      department: '13',
      pricePerM2: 3818,
      visible: false,
      status: 'pending' as const,
      agency: 'Y-Plaza Marseille',
      ownerId: clientUser.id,
      staffId: null,
      features: ['Garage', 'Cave', 'Combles aménageables', 'Jardin'],
    },
    {
      title: 'Appartement Studio Centre',
      description: 'Studio rénové en hyper-centre. Idéal investissement locatif.',
      price: 145000,
      surface: 28,
      rooms: 1,
      type: 'appartement' as const,
      address: '3 Rue du Port',
      city: 'Lyon',
      postalCode: '69002',
      department: '69',
      pricePerM2: 5179,
      visible: false,
      status: 'pending' as const,
      agency: 'Y-Plaza Lyon',
      ownerId: client2.id,
      staffId: staffUser.id,
      features: ['Rénové', 'Hyper-centre', 'Investissement locatif'],
    },
    {
      title: 'Local Commercial avec Vitrine',
      description: 'Local commercial de 90m² avec belle vitrine sur rue principale.',
      price: 320000,
      surface: 90,
      rooms: 3,
      type: 'local-commercial' as const,
      address: '15 Rue du Commerce',
      city: 'Nice',
      postalCode: '06000',
      department: '06',
      pricePerM2: 3556,
      visible: false,
      status: 'pending' as const,
      agency: 'Y-Plaza Cannes',
      ownerId: client2.id,
      staffId: staffUser.id,
      features: ['Belle vitrine', 'Rue principale', 'Idéal commerce'],
    },
    {
      title: 'Terrain Constructible 800m²',
      description: 'Terrain plat, viabilisé, idéal pour construction de maison individuelle.',
      price: 180000,
      surface: 800,
      rooms: 0,
      type: 'terrain' as const,
      address: 'Chemin des Vignes',
      city: 'Bordeaux',
      postalCode: '33000',
      department: '33',
      pricePerM2: 225,
      visible: false,
      status: 'pending' as const,
      agency: 'Y-Plaza Bordeaux',
      ownerId: client3.id,
      staffId: null,
      features: ['Viabilisé', 'Proche commodités'],
    },
  ]

  for (const data of sellProperties) {
    const { features, ...propertyData } = data
    const saved = await propertyRepo.save(propertyData)

    if (features.length) {
      const featureEntities = features.map(name => {
        const f = new PropertyFeature()
        f.propertyId = saved.id
        f.name = name
        return f
      })
      await featureRepo.save(featureEntities)
    }

    await historyRepo.save({
      propertyId: saved.id,
      type: 'created',
      description: 'Property submitted for sale',
    })

    if (saved.staffId) {
      saved.status = 'estimation'
      await propertyRepo.save(saved)
      await historyRepo.save({
        propertyId: saved.id,
        type: 'staff_assigned',
        description: 'Agent assigned to dossier',
      })
    }
  }

  console.log('Seed completed successfully!')
  console.log('  Client: client@yplaza.fr / client123')
  console.log('  Staff:  staff@yplaza.fr / staff123')
  await app.close()
}

bootstrap().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
