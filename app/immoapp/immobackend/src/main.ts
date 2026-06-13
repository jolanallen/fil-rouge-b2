import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)

  app.useBodyParser('json', { limit: '50mb' })
  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: config.get<string[]>('app.corsOrigins'),
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const uploadDir = join(process.cwd(), 'uploads')
  app.useStaticAssets(uploadDir, { prefix: '/cdn' })

  const port = config.get<number>('app.port') || 3001
  await app.listen(port)
  console.log(`Immobackend running on http://localhost:${port}/api/v1`)
}
bootstrap()
