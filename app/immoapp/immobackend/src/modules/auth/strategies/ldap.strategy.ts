import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as ldap from 'ldapjs'

@Injectable()
export class LdapStrategy implements OnModuleInit {
  private readonly logger = new Logger(LdapStrategy.name)
  private readonly url: string
  private readonly baseDn: string
  private readonly bindDn: string
  private readonly bindPassword: string
  private readonly searchFilter: string
  private readonly attrFirstName: string
  private readonly attrLastName: string
  private readonly attrEmail: string

  constructor(config: ConfigService) {
    this.url = config.get<string>('ldap.url') || 'ldap://localhost:389'
    this.baseDn = config.get<string>('ldap.baseDn') || 'DC=company,DC=com'
    this.bindDn = config.get<string>('ldap.bindDn') || ''
    this.bindPassword = config.get<string>('ldap.bindPassword') || ''
    this.searchFilter =
      config.get<string>('ldap.searchFilter') || '(sAMAccountName={{username}})'
    this.attrFirstName = config.get<string>('ldap.attrFirstName') || 'givenName'
    this.attrLastName = config.get<string>('ldap.attrLastName') || 'sn'
    this.attrEmail = config.get<string>('ldap.attrEmail') || 'mail'
  }

  async onModuleInit() {
    this.logger.log(`🔍 Checking LDAP connection to ${this.url}...`)
    
    // Create client but immediately handle error event to prevent process crash
    const client = ldap.createClient({ url: this.url })
    client.on('error', (err) => {
      // Catch initial connection errors (ECONNREFUSED, etc.)
      this.logger.warn(`⚠️ LDAP connection error (on 'error' event): ${err.message}`)
    })

    try {
      await this.bindServiceAccount(client)
      this.logger.log('✅ LDAP connection successful (Service Account bound)')
    } catch (error) {
      this.logger.error(`❌ LDAP connection failed: ${error.message}`)
    } finally {
      client.destroy()
    }
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<{
    dn: string
    firstName?: string
    lastName?: string
    email?: string
  } | null> {
    const searchClient = ldap.createClient({ url: this.url })

    try {
      await this.bindServiceAccount(searchClient)
      const entry = await this.findUserDn(searchClient, username)
      if (!entry) return null

      const valid = await this.verifyPassword(username, password)
      if (!valid) return null

      const attrs: Record<string, string[]> = {}
      for (const attr of entry.attributes) {
        attrs[attr.type] = Array.isArray(attr.values) ? attr.values : [attr.values]
      }

      return {
        dn: String(entry.objectName),
        firstName: attrs[this.attrFirstName]?.[0],
        lastName: attrs[this.attrLastName]?.[0],
        email: attrs[this.attrEmail]?.[0],
      }
    } finally {
      searchClient.destroy()
    }
  }

  private bindServiceAccount(client: ldap.Client): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(this.bindDn, this.bindPassword, (err) => {
        if (err) reject(new Error(`LDAP bind failed: ${err.message}`))
        else resolve()
      })
    })
  }

  private findUserDn(
    client: ldap.Client,
    username: string,
  ): Promise<ldap.SearchEntry | null> {
    const filter = this.searchFilter.replace('{{username}}', username)
    const opts: ldap.SearchOptions = {
      scope: 'sub' as const,
      filter,
      timeLimit: 10,
    }

    return new Promise((resolve, reject) => {
      client.search(this.baseDn, opts, (err, res) => {
        if (err) return reject(err)

        res.on('searchEntry', (entry) => {
          resolve(entry)
        })
        res.on('error', (err) => reject(err))
        res.on('end', (result) => {
          if (result?.status !== 0) resolve(null)
          else resolve(null)
        })
      })
    })
  }

  private verifyPassword(
    username: string,
    password: string,
  ): Promise<boolean> {
    const domain = this.baseDn
      .split(',')
      .filter(p => p.startsWith('DC='))
      .map(p => p.slice(3))
      .join('.')

    const bindDn = username.includes('@')
      ? username
      : domain
        ? `${username}@${domain}`
        : username

    const client = ldap.createClient({ url: this.url})

    return new Promise((resolve) => {
      client.bind(String(bindDn), String(password), (err) => {
        client.destroy()
        resolve(!err)
      })
    })
  }
}
