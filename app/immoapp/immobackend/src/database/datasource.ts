import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'
config()

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  username: process.env.DB_USER || 'immopredict',
  password: process.env.DB_PASSWORD || 'immopredict',
  database: process.env.DB_NAME || 'immoapp',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
