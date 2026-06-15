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
    const client = ldap.createClient({ url: this.url })
    client.on('error', (err) => {
      this.logger.error(`LDAP Client Error: ${err.message}`)
    })

    try {
      await this.bindServiceAccount(client)
      const userDn = await this.findUserDn(client, username)
      if (!userDn) return null

      const attributes = await this.verifyCredentials(userDn, password, username)
      if (!attributes) return null

      return {
        dn: userDn,
        firstName: attributes[this.attrFirstName]?.[0],
        lastName: attributes[this.attrLastName]?.[0],
        email: attributes[this.attrEmail]?.[0],
      }
    } finally {
      client.destroy()
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
  ): Promise<string | null> {
    const filter = this.searchFilter.replace('{{username}}', username)
    const opts: ldap.SearchOptions = {
      scope: 'sub' as const,
      filter,
      attributes: ['dn'],
      timeLimit: 10,
    }

    return new Promise((resolve, reject) => {
      client.search(this.baseDn, opts, (err, res) => {
        if (err) return reject(err)

        res.on('searchEntry', (entry) => {
          resolve(String(entry.objectName))
        })
        res.on('error', (err) => reject(err))
        res.on('end', (result) => {
          if (result?.status !== 0) resolve(null)
          else resolve(null)
        })
      })
    })
  }

  private async verifyCredentials(
    userDn: string,
    password: string,
    username: string,
  ): Promise<Record<string, string[]> | null> {
    const domain = this.baseDn
      .split(',')
      .filter(p => p.startsWith('DC='))
      .map(p => p.slice(3))
      .join('.')

    const identities = [userDn]
    if (username.includes('@')) {
      identities.push(username)
    } else if (domain) {
      identities.push(`${username}@${domain}`)
    }

    for (const identity of identities) {
      const attrs = await this.tryBindAndSearch(String(identity), password)
      if (attrs) return attrs
    }

    return null
  }

  private tryBindAndSearch(
    bindDn: string,
    password: string,
  ): Promise<Record<string, string[]> | null> {
    const client = ldap.createClient({ url: this.url })
    client.on('error', () => {})

    return new Promise((resolve) => {
      client.bind(bindDn, password, (err) => {
        if (err) {
          client.destroy()
          return resolve(null)
        }

        const opts: ldap.SearchOptions = {
          scope: 'base' as const,
          attributes: [this.attrFirstName, this.attrLastName, this.attrEmail],
          timeLimit: 10,
        }

        client.search(bindDn, opts, (err2, res) => {
          if (err2) {
            client.destroy()
            return resolve(null)
          }

          res.on('searchEntry', (entry) => {
            const attrs: Record<string, string[]> = {}
            for (const attr of entry.attributes) {
              attrs[attr.type] = Array.isArray(attr.values) ? attr.values : [attr.values]
            }
            client.destroy()
            resolve(attrs)
          })
          res.on('error', () => {
            client.destroy()
            resolve(null)
          })
          res.on('end', () => {
            client.destroy()
            resolve(null)
          })
        })
      })
    })
  }
}
