import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, Not } from 'typeorm'
import { Property } from '../entities/property.entity'
import { PropertySearchDto } from '../dto/property-search.dto'
import { IPropertyRepository } from './property-repository.interface'

@Injectable()
export class TypeormPropertyRepository implements IPropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repo: Repository<Property>,
  ) {}

  async findById(id: string, visibleOnly?: boolean): Promise<Property | null> {
    const where = visibleOnly ? { id, visible: true } : { id }
    return this.repo.findOne({
      where,
      relations: ['images', 'features', 'priceHistory', 'messages', 'history'],
      order: {
        priceHistory: { date: 'DESC' as const },
        messages: { createdAt: 'ASC' as const },
        history: { createdAt: 'ASC' as const },
      },
    })
  }

  async findAll(
    dto: PropertySearchDto,
    includeInvisible = false,
  ): Promise<{ data: Property[]; total: number }> {
    const query = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.features', 'feat')

    if (!includeInvisible) {
      query.andWhere('p.visible = true')
    }

    if (dto.query) {
      query.andWhere(
        '(p.title LIKE :q OR p.description LIKE :q OR p.city LIKE :q)',
        { q: `%${dto.query}%` },
      )
    }
    if (dto.type) query.andWhere('p.type = :type', { type: dto.type })
    if (dto.minPrice)
      query.andWhere('p.price >= :minPrice', { minPrice: dto.minPrice })
    if (dto.maxPrice)
      query.andWhere('p.price <= :maxPrice', { maxPrice: dto.maxPrice })
    if (dto.minSurface)
      query.andWhere('p.surface >= :minSurface', { minSurface: dto.minSurface })
    if (dto.maxSurface)
      query.andWhere('p.surface <= :maxSurface', { maxSurface: dto.maxSurface })
    if (dto.city) query.andWhere('p.city = :city', { city: dto.city })
    if (dto.department)
      query.andWhere('p.department = :department', { department: dto.department })
    if (dto.rooms) query.andWhere('p.rooms = :rooms', { rooms: dto.rooms })

    const sortMap: Record<string, string> = {
      price: 'p.price',
      surface: 'p.surface',
      date: 'p.createdAt',
      price_per_m2: 'p.pricePerM2',
    }
    const sortBy = sortMap[dto.sortBy || 'date'] || 'p.createdAt'
    query.orderBy(sortBy, dto.sortOrder === 'asc' ? 'ASC' : 'DESC')

    const page = dto.page || 1
    const limit = Math.min(dto.limit || 20, 100)
    query.skip((page - 1) * limit).take(limit)

    const [data, total] = await query.getManyAndCount()
    return { data, total }
  }

  async findByOwner(ownerId: string): Promise<Property[]> {
    return this.repo.find({
      where: { ownerId },
      relations: ['images'],
      order: { createdAt: 'DESC' as const },
    })
  }

  async findSimilar(
    property: Property,
    limit = 6,
  ): Promise<Property[]> {
    const minPrice = Number(property.price) * 0.8
    const maxPrice = Number(property.price) * 1.2

    return this.repo.find({
      where: {
        city: property.city,
        type: property.type,
        price: Between(minPrice, maxPrice),
        id: Not(property.id),
        visible: true,
      },
      relations: ['images'],
      take: limit,
    })
  }

  async save(property: Property): Promise<Property> {
    return this.repo.save(property)
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id)
  }
}
