import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as nodemailer from 'nodemailer'
import { ContactMessage } from './entities/contact-message.entity'
import { ContactDto } from './dto/contact.dto'

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(
    @InjectRepository(ContactMessage)
    private readonly msgRepo: Repository<ContactMessage>,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get<string>('SMTP_HOST')
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT') || 587,
        secure: this.config.get<boolean>('SMTP_SECURE') ?? false,
        auth: {
          user: this.config.get<string>('SMTP_USER') || '',
          pass: this.config.get<string>('SMTP_PASS') || '',
        },
      })
    }
  }

  async submit(dto: ContactDto, propertyId?: string) {
    const msg = new ContactMessage()
    msg.name = dto.name
    msg.email = dto.email
    msg.subject = dto.subject
    msg.message = dto.message
    msg.propertyId = propertyId || null
    const saved = await this.msgRepo.save(msg)


    return saved
  }

  async getAll(limit: number, page: number) {
    return await this.msgRepo.find({
      take: limit,
      skip: (page - 1) * limit,
      withDeleted: false
    })
  }
}
