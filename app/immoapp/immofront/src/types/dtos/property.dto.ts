export interface PropertySearchDTO {
  query?: string
  type?: 'appartement' | 'maison' | 'local-commercial' | 'terrain'
  minPrice?: number
  maxPrice?: number
  minSurface?: number
  maxSurface?: number
  city?: string
  department?: string
  rooms?: number
  page?: number
  limit?: number
  sortBy?: 'price' | 'surface' | 'date' | 'price_per_m2'
  sortOrder?: 'asc' | 'desc'
}

export interface CreatePropertyDTO {
  title: string
  description: string
  price: number
  surface: number
  rooms: number
  type: 'appartement' | 'maison' | 'local-commercial' | 'terrain'
  address: string
  city: string
  postalCode: string
  department: string
  latitude?: number
  longitude?: number
  images?: string[]
  features?: string[]
}

export interface ContactAgentDTO {
  propertyId: string
  name: string
  email: string
  phone?: string
  message: string
}
