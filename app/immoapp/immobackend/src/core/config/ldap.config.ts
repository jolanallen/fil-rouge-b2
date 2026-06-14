import { registerAs } from '@nestjs/config'

export default registerAs('ldap', () => ({
  url: process.env.LDAP_URL || 'ldap://localhost:389',
  baseDn: process.env.LDAP_BASE_DN || 'DC=company,DC=com',
  bindDn: process.env.LDAP_BIND_DN || '',
  bindPassword: process.env.LDAP_BIND_PASSWORD || '',
  searchFilter: process.env.LDAP_SEARCH_FILTER || '(sAMAccountName={{username}})',
  attrFirstName: process.env.LDAP_ATTR_FIRSTNAME || 'givenName',
  attrLastName: process.env.LDAP_ATTR_LASTNAME || 'sn',
  attrEmail: process.env.LDAP_ATTR_EMAIL || 'mail',
}))
