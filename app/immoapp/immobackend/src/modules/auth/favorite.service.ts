import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserFavorite } from './entities/user-favorite.entity'

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(UserFavorite)
    private readonly favRepo: Repository<UserFavorite>,
  ) {}

  async add(userId: string, propertyId: string) {
    const existing = await this.favRepo.findOneBy({ userId, propertyId })
    if (existing) return existing
    const fav = new UserFavorite()
    fav.userId = userId
    fav.propertyId = propertyId
    return this.favRepo.save(fav)
  }

  async remove(userId: string, propertyId: string) {
    await this.favRepo.delete({ userId, propertyId })
  }

  async findByUser(userId: string) {
    return this.favRepo.find({ where: { userId }, order: { createdAt: 'DESC' } })
  }

  async getFavoriteIds(userId: string): Promise<Set<string>> {
    const rows = await this.favRepo.find({ where: { userId }, select: ['propertyId'] })
    return new Set(rows.map(r => r.propertyId))
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const count = await this.favRepo.count({ where: { userId, propertyId } })
    return count > 0
  }
}
