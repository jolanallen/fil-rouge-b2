import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PROPERTY_REPOSITORY, IPropertyRepository } from '../repositories/property-repository.interface'
import { STORAGE_SERVICE, IStorageService } from '@/core/storage/storage.interface'
import { PropertySearchDto } from '../dto/property-search.dto'
import { CreatePropertyDto } from '../dto/create-property.dto'
import { UpdatePropertyStatusDto } from '../dto/update-property-status.dto'
import { SendMessageDto } from '../dto/send-message.dto'
import { Property } from '../entities/property.entity'
import { PropertyImage } from '../entities/property-image.entity'
import { PropertyFeature } from '../entities/property-feature.entity'
import { PropertyPriceHistory } from '../entities/property-price-history.entity'
import { PropertyMessage } from '../entities/property-message.entity'
import { PropertyHistory } from '../entities/property-history.entity'
import { AgencyService } from './agency.service'
import { FavoriteService } from '@/modules/auth/favorite.service'
import { USER_REPOSITORY, IUserRepository } from '@/modules/auth/repositories/user-repository.interface'

@Injectable()
export class PropertyService {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
    @InjectRepository(PropertyImage)
    private readonly imageRepo: Repository<PropertyImage>,
    @InjectRepository(PropertyFeature)
    private readonly featureRepo: Repository<PropertyFeature>,
    @InjectRepository(PropertyPriceHistory)
    private readonly priceHistoryRepo: Repository<PropertyPriceHistory>,
    @InjectRepository(Property)
    private readonly propertyRepoDirect: Repository<Property>,
    @InjectRepository(PropertyMessage)
    private readonly messageRepo: Repository<PropertyMessage>,
    @InjectRepository(PropertyHistory)
    private readonly historyRepo: Repository<PropertyHistory>,
    private readonly favoriteService: FavoriteService,
    private readonly agencyService: AgencyService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  private async findPropertyOrFail(id: string, visibleOnly = false) {
    const property = await this.propertyRepo.findById(id, visibleOnly)
    if (!property) throw new NotFoundException('Property not found')
    return property
  }

  private async authorizeAccess(propertyId: string, userId: string, userRole: string) {
    const property = await this.propertyRepo.findById(propertyId)
    if (!property) throw new NotFoundException('Property not found')
    if (userRole !== 'staff' && property.ownerId !== userId) {
      throw new ForbiddenException()
    }
    return property
  }

  private async addHistoryEvent(propertyId: string, type: string, description: string) {
    const event = new PropertyHistory()
    event.propertyId = propertyId
    event.type = type
    event.description = description
    return this.historyRepo.save(event)
  }

  private async resolveStaffName(property: Property) {
    if (!property.staffId) return
    const user = await this.userRepo.findById(property.staffId)
    if (user) {
      property.staffName = `${user.firstName} ${user.lastName}`
    }
  }

  async findAll(dto: PropertySearchDto, userId?: string) {
    const { data, total } = await this.propertyRepo.findAll(dto)
    if (userId) {
      const ids = await this.favoriteService.getFavoriteIds(userId)
      data.forEach(p => { p.isFavorite = ids.has(p.id) })
    }
    await Promise.all(data.map(p => this.resolveStaffName(p)))
    const page = dto.page || 1
    const limit = Math.min(dto.limit || 20, 100)
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findAllStaff(dto: PropertySearchDto) {
    const { data, total } = await this.propertyRepo.findAll(dto, true)
    await Promise.all(data.map(p => this.resolveStaffName(p)))
    const page = dto.page || 1
    const limit = Math.min(dto.limit || 20, 100)
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findById(id: string, userId?: string) {
    const property = await this.findPropertyOrFail(id, true)
    if (userId) {
      property.isFavorite = await this.favoriteService.isFavorited(userId, id)
    }
    await this.resolveStaffName(property)
    return property
  }

  async findByIdStaff(id: string) {
    const property = await this.findPropertyOrFail(id)
    await this.resolveStaffName(property)
    return property
  }

  async findByIdForManage(id: string, userId: string, userRole: string) {
    const property = await this.findPropertyOrFail(id)
    if (userRole !== 'staff' && property.ownerId !== userId) {
      throw new ForbiddenException('Access denied')
    }
    await this.resolveStaffName(property)
    return property
  }

  async create(dto: CreatePropertyDto, userId: string) {
    const property = new Property()
    property.title = dto.title
    property.description = dto.description
    const price = dto.price ?? 0
    property.price = price
    property.surface = dto.surface
    property.rooms = dto.rooms
    property.type = dto.type
    property.address = dto.address
    property.city = dto.city
    property.postalCode = dto.postalCode
    property.department = dto.department
    property.latitude = dto.latitude ?? null
    property.longitude = dto.longitude ?? null
    property.pricePerM2 = price && dto.surface ? Math.round((price / dto.surface) * 100) / 100 : null
    const agency = await this.agencyService.findClosest(dto.department, dto.latitude, dto.longitude)
    property.agency = agency ? agency.name : ''
    property.visible = true
    property.status = 'available'
    property.staffId = userId

    const saved = await this.propertyRepo.save(property)

    if (dto.features?.length) {
      const features = dto.features.map(name => {
        const f = new PropertyFeature()
        f.property = {id: saved.id} as Property
        f.name = name
        return f
      })
      await this.featureRepo.save(features)
      saved.features = features
    }

    const history = new PropertyPriceHistory()
    history.propertyId = saved.id
    history.date = new Date().toISOString().slice(0, 10)
    history.price = price
    history.pricePerM2 = saved.pricePerM2!
    await this.priceHistoryRepo.save(history)
    saved.priceHistory = [history]

    return this.propertyRepo.findById(saved.id)
  }

  async update(id: string, dto: Partial<CreatePropertyDto>) {
    const property = await this.findPropertyOrFail(id)

    if (dto.title !== undefined) property.title = dto.title
    if (dto.description !== undefined) property.description = dto.description
    if (dto.type !== undefined) property.type = dto.type
    if (dto.address !== undefined) property.address = dto.address
    if (dto.city !== undefined) property.city = dto.city
    if (dto.postalCode !== undefined) property.postalCode = dto.postalCode
    if (dto.department !== undefined) property.department = dto.department
    if (dto.latitude !== undefined) property.latitude = dto.latitude
    if (dto.longitude !== undefined) property.longitude = dto.longitude
    if (dto.surface !== undefined) property.surface = dto.surface
    if (dto.rooms !== undefined) property.rooms = dto.rooms
    if (dto.agency !== undefined) property.agency = dto.agency
    if (dto.dpe !== undefined) property.dpe = dto.dpe

    const priceChanged = dto.price !== undefined && Number(dto.price) !== Number(property.price)
    if (dto.price !== undefined) property.price = dto.price

    if (dto.surface !== undefined || dto.price !== undefined) {
      const surf = Number(dto.surface ?? property.surface)
      property.pricePerM2 = surf > 0 ? Math.round((Number(property.price) / surf) * 100) / 100 : null
    }

    if (dto.features !== undefined) {
      await this.featureRepo.delete({property: {id: id}})
      const features = dto.features.map(name => {
        const f = new PropertyFeature()
        f.property = property
        f.name = name
        return f
      })
      await this.featureRepo.save(features)
      property.features = []
    }

    if (dto.images !== undefined) {
      const existingUrls = new Set(property.images.map(i => i.url))
      const incomingUrls = new Set(dto.images)

      for (const img of property.images) {
        if (!incomingUrls.has(img.url)) {
          try { await this.storage.delete(img.url) } catch {}
          await this.imageRepo.delete(img.id)
        }
      }

      for (const url of dto.images) {
        if (existingUrls.has(url)) continue
        if (!url.startsWith('data:')) continue
        const matches = url.match(/^data:(.+);base64,(.+)$/)
        if (!matches) continue
        const mimetype = matches[1]
        const ext = mimetype.split('/')[1] || 'jpg'
        const buffer = Buffer.from(matches[2], 'base64')
        const uploadedUrl = await this.storage.upload(
          { buffer, originalname: `image.${ext}`, mimetype, size: buffer.length },
          `properties/${property.id}`,
        )
        const image = new PropertyImage()
        image.property = property
        image.url = uploadedUrl
        image.alt = `Photo ${dto.images.indexOf(url) + 1}`
        image.isPrimary = dto.images.indexOf(url) === 0
        await this.imageRepo.save(image)
      }
      property.images = []
    }

    const saved = await this.propertyRepo.save(property)

    if (priceChanged && property.pricePerM2 != null) {
      const history = new PropertyPriceHistory()
      history.property = property
      history.date = new Date().toISOString().slice(0, 10)
      history.price = Number(property.price)
      history.pricePerM2 = property.pricePerM2
      await this.priceHistoryRepo.save(history)
    }

    return this.propertyRepo.findById(saved.id)
  }

  async delete(id: string) {
    const property = await this.findPropertyOrFail(id)
    for (const img of property.images) {
      try { await this.storage.delete(img.url) } catch {}
    }
    await this.propertyRepo.delete(id)
  }

  async createRequest(dto: CreatePropertyDto, ownerId: string) {
    const property = new Property()
    property.title = dto.title
    property.description = dto.description
    property.surface = dto.surface
    property.rooms = dto.rooms
    property.type = dto.type
    property.address = dto.address
    property.city = dto.city
    property.postalCode = dto.postalCode
    property.department = dto.department
    property.latitude = dto.latitude ?? null
    property.longitude = dto.longitude ?? null
    property.price = dto.price ?? 0
    property.pricePerM2 = dto.price && dto.surface ? Math.round((dto.price / dto.surface) * 100) / 100 : null
    const agency = await this.agencyService.findClosest(dto.department, dto.latitude, dto.longitude)
    property.agency = agency ? agency.name : ''
    property.ownerId = ownerId
    property.status = 'pending'
    property.visible = false

    const savedProperty = await this.propertyRepo.save(property)

    if (dto.features?.length) {
      const features = dto.features.map(name => {
        const f = new PropertyFeature()
        f.property = savedProperty
        f.name = name
        return f
      })
      await this.featureRepo.save(features)
    }

    if (dto.images?.length) {
      for (let i = 0; i < dto.images.length; i++) {
        const dataUrl = dto.images[i]
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
        if (!matches) continue
        const mimetype = matches[1]
        const ext = mimetype.split('/')[1] || 'jpg'
        const buffer = Buffer.from(matches[2], 'base64')
        const url = await this.storage.upload(
          { buffer, originalname: `image.${ext}`, mimetype, size: buffer.length },
          `properties/${savedProperty.id}`,
        )
        const image = new PropertyImage()
        image.property = savedProperty
        image.url = url
        image.alt = `Photo ${i + 1}`
        image.isPrimary = i === 0
        await this.imageRepo.save(image)
      }
    }

    await this.addHistoryEvent(savedProperty.id, 'created', 'Property submitted for sale')

    return this.propertyRepo.findById(savedProperty.id)
  }

  async findByOwner(ownerId: string) {
    return this.propertyRepo.findByOwner(ownerId)
  }

  async updateStatus(id: string, dto: UpdatePropertyStatusDto, staffId: string) {
    const property = await this.findPropertyOrFail(id)
    property.staffId = property.staffId || staffId
    property.status = dto.status

    const statusLabels: Record<string, string> = {
      pending: 'Awaiting review',
      estimation: 'Estimation scheduled',
      mandate: 'Mandate signed',
      available: 'Property listed for sale',
      reserved: 'Property reserved',
      under_offer: 'Property under offer',
      sold: 'Property sold',
      cancelled: 'Request cancelled',
    }

    property.visible = dto.status === 'available' || dto.status === 'sold'

    const saved = await this.propertyRepo.save(property)
    await this.addHistoryEvent(
      saved.id,
      dto.status,
      statusLabels[dto.status] || `Status changed to ${dto.status}`,
    )

    if (dto.status === 'sold') {
      const history = new PropertyPriceHistory()
      history.propertyId = saved.id
      history.date = new Date().toISOString().slice(0, 10)
      history.price = Number(saved.price)
      history.pricePerM2 = saved.pricePerM2!
      await this.priceHistoryRepo.save(history)
    }

    return this.propertyRepo.findById(saved.id)
  }

  async uploadImage(propertyId: string, userId: string, userRole: string, file: Express.Multer.File) {
    const property = await this.authorizeAccess(propertyId, userId, userRole)
    const url = await this.storage.upload(file, `properties/${propertyId}`)
    const image = new PropertyImage()
    image.property = property
    image.url = url
    image.alt = file.originalname
    image.isPrimary = property.images.length === 0
    return this.imageRepo.save(image)
  }

  async deleteImage(propertyId: string, imageId: string, userId: string, userRole: string) {
    await this.authorizeAccess(propertyId, userId, userRole)
    const image = await this.imageRepo.createQueryBuilder('img')
      .where('img.id = :imageId AND img.property_id = :propertyId', { imageId, propertyId })
      .getOne()
    if (!image) throw new NotFoundException('Image not found')
    try { await this.storage.delete(image.url) } catch {}
    await this.imageRepo.delete(imageId)
  }

  async findSimilar(id: string) {
    const property = await this.findPropertyOrFail(id, true)
    return this.propertyRepo.findSimilar(property)
  }

  async sendMessage(propertyId: string, dto: SendMessageDto, senderId: string, senderName: string, senderRole: string) {
    await this.authorizeAccess(propertyId, senderId, senderRole)
    const msg = new PropertyMessage()
    msg.propertyId = propertyId
    msg.senderId = senderId
    msg.senderName = senderName
    msg.senderRole = senderRole
    msg.content = dto.content
    return this.messageRepo.save(msg)
  }

  async getMessages(propertyId: string, userId: string, userRole: string) {
    const property = await this.authorizeAccess(propertyId, userId, userRole)
    return property.messages
  }

  async getHistory(propertyId: string, userId: string, userRole: string) {
    const property = await this.authorizeAccess(propertyId, userId, userRole)
    return property.history
  }

  async assignAgent(id: string, staffId: string, agentId?: string) {
    const property = await this.findPropertyOrFail(id)
    const targetId = agentId || staffId
    property.staffId = targetId
    if (property.status === 'draft' || property.status === 'pending') {
      property.status = 'estimation'
    }
    const saved = await this.propertyRepo.save(property)
    await this.addHistoryEvent(saved.id, 'staff_assigned', `Agent assigned to dossier`)
    return this.propertyRepo.findById(saved.id)
  }

  async getStats() {
    const counts = await this.propertyRepoDirect
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany()

    const toNum = (status: string) =>
      Number(counts.find(c => c.status === status)?.count || 0)

    return {
      pending: toNum('pending'),
      estimation: toNum('estimation'),
      mandate: toNum('mandate'),
      available: toNum('available'),
      reserved: toNum('reserved'),
      under_offer: toNum('under_offer'),
      sold: toNum('sold'),
      cancelled: toNum('cancelled'),
      draft: toNum('draft'),
      total: counts.reduce((sum, c) => sum + Number(c.count), 0),
    }
  }
}
