import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { IStorageService, UploadedFile } from './storage.interface'

@Injectable()
export class LocalStorageService implements IStorageService, OnModuleInit {
  private readonly uploadDir: string

  constructor(config: ConfigService) {
    this.uploadDir =
      config.get<string>('app.uploadDir') || path.join(process.cwd(), 'uploads')
  }

  async onModuleInit() {
    await fs.mkdir(this.uploadDir, { recursive: true })
  }

  async upload(file: UploadedFile, subPath: string): Promise<string> {
    const dir = path.join(this.uploadDir, subPath)
    await fs.mkdir(dir, { recursive: true })

    const ext = path.extname(file.originalname)
    const filename = `${randomUUID()}${ext}`
    const dest = path.join(dir, filename)

    await fs.writeFile(dest, file.buffer)
    return `/${subPath}/${filename}`
  }

  async delete(filePath: string): Promise<void> {
    const dest = path.join(this.uploadDir, filePath.replace(/^\//, ''))
    await fs.unlink(dest)
  }
}
