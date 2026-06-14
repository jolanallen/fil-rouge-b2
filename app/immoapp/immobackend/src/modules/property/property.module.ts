import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { StorageModule } from '@/core/storage/storage.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { PropertyController } from './api/property.controller'
import { PropertyService } from './services/property.service'
import { Property } from './entities/property.entity'
import { PropertyImage } from './entities/property-image.entity'
import { PropertyFeature } from './entities/property-feature.entity'
import { PropertyPriceHistory } from './entities/property-price-history.entity'
import { PropertyMessage } from './entities/property-message.entity'
import { PropertyHistory } from './entities/property-history.entity'
import { Agency } from './entities/agency.entity'
import { TypeormPropertyRepository } from './repositories/typeorm-property.repository'
import { PROPERTY_REPOSITORY } from './repositories/property-repository.interface'
import { PropertyStatController } from './api/property-stat.controller'
import { PropertyStatService } from './services/property-stat.service'
import { AgencyService } from './services/agency.service'
import { PropertyFavoriteController } from './api/property-favorite.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertyImage, PropertyFeature, PropertyPriceHistory, PropertyMessage, PropertyHistory, Agency]),
    StorageModule,
    MulterModule.register({ storage: memoryStorage() }),
    AuthModule,
  ],
  controllers: [PropertyFavoriteController, PropertyController, PropertyStatController],
  providers: [
    PropertyService,
    PropertyStatService,
    AgencyService,
    { provide: PROPERTY_REPOSITORY, useClass: TypeormPropertyRepository },
  ],
  exports: [AgencyService],
})
export class PropertyModule {}
