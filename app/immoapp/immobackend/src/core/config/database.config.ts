import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'immopredict',
  password: process.env.DB_PASSWORD || 'immopredict',
  name: process.env.DB_NAME || 'immoapp',
}))
