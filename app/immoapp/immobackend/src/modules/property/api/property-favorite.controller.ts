import { Controller, Post, Delete, Get, Param } from '@nestjs/common'
import { FavoriteService } from '@/modules/auth/favorite.service'
import { PropertyService } from '../services/property.service'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@Controller('properties')
export class PropertyFavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly propertyService: PropertyService,
  ) {}

  @Post(':id/favorites')
  addFavorite(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.favoriteService.add(userId, id)
  }

  @Delete(':id/favorites')
  removeFavorite(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.favoriteService.remove(userId, id)
  }

  @Get('my-favorites')
  async myFavorites(@CurrentUser('id') userId: string) {
    const favs = await this.favoriteService.findByUser(userId)
    const ids = favs.map(f => f.propertyId)
    const properties = await Promise.all(
      ids.map(id => this.propertyService.findById(id).catch(() => null)),
    )
    return properties.filter(Boolean).map((p:any) => ({ ...p, isFavorite: true }))
  }
}
