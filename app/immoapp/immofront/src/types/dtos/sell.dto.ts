export interface CreateSellPropertyDTO {
  title: string
  description: string
  surface: number
  rooms: number
  type: 'appartement' | 'maison' | 'local-commercial' | 'terrain'
  address: string
  city: string
  postalCode: string
  department: string
  images: string[]
  price?: number
}

export interface AssignStaffDTO {
  processId: string
  staffId: string
}

export interface SendMessageDTO {
  processId: string
  content: string
}
