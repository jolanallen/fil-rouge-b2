import { Property } from '../entities/property.entity'
import { PropertySearchDto } from '../dto/property-search.dto'

export const PROPERTY_REPOSITORY = 'PROPERTY_REPOSITORY'

export interface IPropertyRepository {
  findById(id: string, visibleOnly?: boolean): Promise<Property | null>
  findAll(dto: PropertySearchDto, includeInvisible?: boolean): Promise<{ data: Property[]; total: number }>
  findSimilar(property: Property, limit?: number): Promise<Property[]>
  findByOwner(ownerId: string): Promise<Property[]>
  save(property: Property): Promise<Property>
  delete(id: string): Promise<void>
}
