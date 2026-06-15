export interface PropertyImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface PropertyFeature {
  id: string
  name: string
  icon?: string
}

export interface PropertyMessage {
  id: string
  propertyId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface PropertyHistoryEvent {
  id: string
  propertyId: string
  type: string
  description: string
  createdAt: string
}

export interface Property {
  id: string
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
  latitude: number
  longitude: number
  images: PropertyImage[]
  features: PropertyFeature[]
  dpe?: string
  pricePerM2: number
  createdAt: string
  updatedAt: string
  status: 'draft' | 'pending' | 'estimation' | 'mandate' | 'available' | 'reserved' | 'under_offer' | 'sold' | 'cancelled'
  agency: string
  ownerId?: string | null
  staffId?: string | null
  staffName?: string | null
  isFavorite?: boolean
  messages?: PropertyMessage[]
  history?: PropertyHistoryEvent[]
  stats?: {
    totalViews: number
    totalClicks: number
    totalContacts: number
    totalFavorites: number
    dailyViews: Array<{ count: number; date: string }>
    dailyClicks: Array<{ count: number; date: string }>
  }
}

export interface PropertyPricePoint {
  date: string
  price: number
  pricePerM2: number
}

export interface PropertyPriceHistory {
  propertyId: string
  pricePoints: PropertyPricePoint[]
  predictedPrice?: number
  predictedPricePerM2?: number
  growthRate?: number
}

export interface PropertyListResponse {
  data: Property[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PropertyDetailResponse {
  property: Property
  priceHistory: PropertyPriceHistory | null
  similarProperties?: Property[]
}
