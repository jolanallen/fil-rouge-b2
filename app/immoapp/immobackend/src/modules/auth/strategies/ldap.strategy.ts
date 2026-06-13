import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as ldap from 'ldapjs'

@Injectable()
export class LdapStrategy {
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

    try {
      await this.bindServiceAccount(client)
      const userDn = await this.findUserDn(client, username)
      if (!userDn) return null

      const attributes = await this.verifyCredentials(client, userDn, password)
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
          resolve(entry.objectName)
        })
        res.on('error', (err) => reject(err))
        res.on('end', (result) => {
          if (result?.status !== 0) resolve(null)
          else resolve(null)
        })
      })
    })
  }

  private verifyCredentials(
    client: ldap.Client,
    userDn: string,
    password: string,
  ): Promise<Record<string, string[]> | null> {
    return new Promise((resolve, reject) => {
      client.bind(userDn, password, (err) => {
        if (err) return resolve(null)

        const opts: ldap.SearchOptions = {
          scope: 'base' as const,
          attributes: [this.attrFirstName, this.attrLastName, this.attrEmail],
          timeLimit: 10,
        }

        client.search(userDn, opts, (err2, res) => {
          if (err2) return reject(err2)

          res.on('searchEntry', (entry) => {
            const attrs: Record<string, string[]> = {}
            for (const attr of entry.attributes) {
              attrs[attr.type] = Array.isArray(attr.values) ? attr.values : [attr.values]
            }
            resolve(attrs)
          })
          res.on('error', (err3) => reject(err3))
          res.on('end', () => resolve(null))
        })
      })
    })
  }
}
