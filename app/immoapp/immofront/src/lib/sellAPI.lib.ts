import { apiGet, apiPost, apiPut, mockDelay } from './api.lib'
import type { Property, PropertyListResponse } from '@/types/presenters/property.presenter'
import type { CreateSellPropertyDTO } from '@/types/dtos/sell.dto'

const now = new Date().toISOString()
const day = (d: number) => new Date(Date.now() - d * 86400000).toISOString().split('T')[0]

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'sell-1',
    title: 'Appartement 3 pièces Centre Ville',
    description: 'Bel appartement lumineux au 4ème étage avec ascenseur. Proche de toutes les commodités, transports, écoles et commerces.',
    price: 295000,
    surface: 72,
    rooms: 3,
    type: 'appartement',
    address: '12 Rue de la République',
    city: 'Aix-en-Provence',
    postalCode: '13100',
    department: '13',
    latitude: 43.5297,
    longitude: 5.4474,
    images: [
      { id: 'img-s1', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', alt: 'Salon', isPrimary: true }
    ],
    features: [
      { id: 'f-s1', name: 'Ascenseur' },
      { id: 'f-s2', name: 'Proche commerces' },
      { id: 'f-s3', name: 'Transport à proximité' },
    ],
    energyClass: 'C',
    pricePerM2: 4097,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    agency: 'Y-Plaza Aix-en-Provence',
    ownerId: '1',
    staffId: '2',
  },
  {
    id: 'sell-2',
    title: 'Maison avec Jardin',
    description: 'Charmante maison de ville avec jardin arboré. Garage, cave et combles aménageables.',
    price: 420000,
    surface: 110,
    rooms: 5,
    type: 'maison',
    address: '8 Avenue des Pins',
    city: 'Marseille',
    postalCode: '13008',
    department: '13',
    latitude: 43.2965,
    longitude: 5.3698,
    images: [
      { id: 'img-s2', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Façade', isPrimary: true }
    ],
    features: [
      { id: 'f-s4', name: 'Garage' },
      { id: 'f-s5', name: 'Cave' },
      { id: 'f-s6', name: 'Combles aménageables' },
      { id: 'f-s7', name: 'Jardin' },
    ],
    energyClass: 'D',
    pricePerM2: 3818,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    agency: 'Y-Plaza Marseille',
    ownerId: '1',
    staffId: null,
  },
  {
    id: 'sell-3',
    title: 'Terrain Constructible 800m²',
    description: 'Terrain plat, viabilisé, idéal pour construction de maison individuelle. Proche commodités.',
    price: 180000,
    surface: 800,
    rooms: 0,
    type: 'terrain',
    address: 'Chemin des Vignes',
    city: 'Bordeaux',
    postalCode: '33000',
    department: '33',
    latitude: 44.8378,
    longitude: -0.5792,
    images: [
      { id: 'img-s3', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Terrain', isPrimary: true }
    ],
    features: [
      { id: 'f-s8', name: 'Viabilisé' },
      { id: 'f-s9', name: 'Proche commodités' },
    ],
    pricePerM2: 225,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    agency: 'Y-Plaza Bordeaux',
    ownerId: '2',
    staffId: null,
  },
  {
    id: 'sell-4',
    title: 'Appartement Studio Centre',
    description: 'Studio rénové en hyper-centre. Idéal investissement locatif. Rendement estimé 7%.',
    price: 145000,
    surface: 28,
    rooms: 1,
    type: 'appartement',
    address: '3 Rue du Port',
    city: 'Lyon',
    postalCode: '69002',
    department: '69',
    latitude: 45.7640,
    longitude: 4.8357,
    images: [
      { id: 'img-s4', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', alt: 'Studio', isPrimary: true }
    ],
    features: [
      { id: 'f-s10', name: 'Rénové' },
      { id: 'f-s11', name: 'Hyper-centre' },
      { id: 'f-s12', name: 'Investissement locatif' },
    ],
    energyClass: 'B',
    pricePerM2: 5179,
    createdAt: now,
    updatedAt: now,
    status: 'available',
    agency: 'Y-Plaza Lyon',
    ownerId: '3',
    staffId: '2',
  },
  {
    id: 'sell-5',
    title: 'Local Commercial avec Vitrine',
    description: 'Local commercial de 90m² avec belle vitrine sur rue principale. Idéal commerce, bureau ou showroom.',
    price: 320000,
    surface: 90,
    rooms: 3,
    type: 'local-commercial',
    address: '15 Rue du Commerce',
    city: 'Nice',
    postalCode: '06000',
    department: '06',
    latitude: 43.7000,
    longitude: 7.2500,
    images: [
      { id: 'img-s5', url: 'https://images.unsplash.com/photo-1600607688965-1c2e6c8e4b9a?w=800&q=80', alt: 'Vitrine', isPrimary: true }
    ],
    features: [
      { id: 'f-s13', name: 'Belle vitrine' },
      { id: 'f-s14', name: 'Rue principale' },
      { id: 'f-s15', name: 'Idéal commerce' },
    ],
    energyClass: 'C',
    pricePerM2: 3556,
    createdAt: now,
    updatedAt: now,
    status: 'available',
    agency: 'Y-Plaza Nice',
    ownerId: '4',
    staffId: '2',
  },
]

const MOCK_MESSAGES: Record<string, Array<{ id: string; propertyId: string; senderId: string; senderName: string; senderRole: string; content: string; createdAt: string; isRead: boolean }>> = {
  'sell-1': [
    { id: 'msg-1', propertyId: 'sell-1', senderId: '2', senderName: 'Marie Laurent', senderRole: 'staff', content: 'Bonjour ! Je suis votre conseillère Y-Plaza pour la vente de votre bien.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), isRead: true },
    { id: 'msg-2', propertyId: 'sell-1', senderId: '1', senderName: 'Thomas Dubois', senderRole: 'client', content: 'Bonjour Marie, merci pour votre message.', createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: false },
  ],
  'sell-4': [
    { id: 'msg-3', propertyId: 'sell-4', senderId: '2', senderName: 'Marie Laurent', senderRole: 'staff', content: 'Bonjour, je m\'occupe de la mise en vente de votre studio.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), isRead: true },
  ],
  'sell-5': [
    { id: 'msg-4', propertyId: 'sell-5', senderId: '2', senderName: 'Pierre Martin', senderRole: 'staff', content: 'Le photographe passera demain à 9h.', createdAt: new Date(Date.now() - 3600000 * 6).toISOString(), isRead: true },
  ],
}

const MOCK_HISTORY: Record<string, Array<{ id: string; propertyId: string; type: string; description: string; createdAt: string }>> = {
  'sell-1': [
    { id: 'evt-1', propertyId: 'sell-1', type: 'created', description: 'Property submitted for sale', createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: 'evt-2', propertyId: 'sell-1', type: 'staff_assigned', description: 'Agent assigned to dossier', createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  ],
  'sell-4': [
    { id: 'evt-3', propertyId: 'sell-4', type: 'created', description: 'Property submitted for sale', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  ],
  'sell-5': [
    { id: 'evt-4', propertyId: 'sell-5', type: 'created', description: 'Property submitted for sale', createdAt: new Date(Date.now() - 86400000 * 21).toISOString() },
  ],
}

const MOCK_DEPARTMENT_PRICES: Record<string, { avgPricePerM2: number; city: string }[]> = {
  '13': [{ avgPricePerM2: 4235, city: 'Aix-en-Provence' }, { avgPricePerM2: 3650, city: 'Marseille' }],
  '75': [{ avgPricePerM2: 10250, city: 'Paris' }],
  '06': [{ avgPricePerM2: 5200, city: 'Nice' }],
  '33': [{ avgPricePerM2: 4800, city: 'Bordeaux' }],
  '69': [{ avgPricePerM2: 4500, city: 'Lyon' }],
}

export async function createSellProperty(data: CreateSellPropertyDTO): Promise<Property> {
  try {
    return await apiPost<Property>('/properties/request', {
      title: data.title,
      description: data.description,
      surface: data.surface,
      rooms: data.rooms,
      type: data.type,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      department: data.department,
      price: data.price,
      images: data.images,
    })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(600)
    const id = 'sell-' + (MOCK_PROPERTIES.length + 1)
    const deptPrices = MOCK_DEPARTMENT_PRICES[data.department] || [{ avgPricePerM2: 3500, city: data.city }]
    const cityPrice = deptPrices.find(p => p.city.toLowerCase() === data.city.toLowerCase()) || deptPrices[0]
    const prop: Property = {
      id,
      title: data.title,
      description: data.description,
      price: Math.round(cityPrice.avgPricePerM2 * data.surface),
      surface: data.surface,
      rooms: data.rooms,
      type: data.type,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      department: data.department,
      latitude: 0,
      longitude: 0,
      images: data.images.length ? data.images.map((url, i) => ({ id: `img-${id}-${i}`, url, alt: `Photo ${i + 1}`, isPrimary: i === 0 })) : [{ id: `img-${id}`, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Property', isPrimary: true }],
      features: [],
      pricePerM2: cityPrice.avgPricePerM2,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      agency: 'Y-Plaza ' + data.city,
      ownerId: '1',
      staffId: null,
    }
    MOCK_PROPERTIES.push(prop)
    return prop
  }
}

export async function getSellProcessesForUser(_userId: string): Promise<PropertyListResponse> {
  try {
    const raw = await apiGet<Property[]>('/properties/my-requests')
    return { data: raw || [], total: (raw || []).length, page: 1, limit: (raw || []).length, totalPages: 1 }
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay()
    const data = MOCK_PROPERTIES.filter(p => p.ownerId === _userId)
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 }
  }
}

export async function getAllSellProcesses(): Promise<PropertyListResponse> {
  try {
    return await apiGet<PropertyListResponse>('/properties/staff')
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay()
    return { data: [...MOCK_PROPERTIES], total: MOCK_PROPERTIES.length, page: 1, limit: MOCK_PROPERTIES.length, totalPages: 1 }
  }
}

export async function getSellProcessById(id: string): Promise<Property> {
  try {
    return await apiGet<Property>(`/properties/${id}/manage`)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay()
    const prop = MOCK_PROPERTIES.find(p => p.id === id)
    if (!prop) throw new Error('Property not found')
    return { ...prop }
  }
}

export async function assignStaffToProcess(processId: string, agentId?: string): Promise<Property> {
  try {
    return await apiPut<Property>(`/properties/${processId}/assign`, agentId ? { agentId } : {})
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay()
    const prop = MOCK_PROPERTIES.find(p => p.id === processId)
    if (!prop) throw new Error('Property not found')
    prop.staffId = agentId || '2'
    if (prop.status === 'pending' || prop.status === 'draft') {
      prop.status = 'estimation'
    }
    return { ...prop }
  }
}

export async function sendMessage(propertyId: string, content: string): Promise<{ id: string; propertyId: string; senderId: string; senderName: string; senderRole: string; content: string; createdAt: string; isRead: boolean }> {
  try {
    return await apiPost(`/properties/${propertyId}/messages`, { content })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(300)
    const msg = {
      id: 'msg-' + Date.now(),
      propertyId,
      senderId: '1',
      senderName: 'User',
      senderRole: 'client' as const,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    if (!MOCK_MESSAGES[propertyId]) MOCK_MESSAGES[propertyId] = []
    MOCK_MESSAGES[propertyId].push(msg)
    return msg
  }
}

export async function staffSendMessage(propertyId: string, content: string, staffName: string): Promise<{ id: string; propertyId: string; senderId: string; senderName: string; senderRole: string; content: string; createdAt: string; isRead: boolean }> {
  try {
    return await apiPost(`/properties/${propertyId}/messages`, { content })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(300)
    const msg = {
      id: 'msg-' + Date.now(),
      propertyId,
      senderId: '2',
      senderName: staffName,
      senderRole: 'staff' as const,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    if (!MOCK_MESSAGES[propertyId]) MOCK_MESSAGES[propertyId] = []
    MOCK_MESSAGES[propertyId].push(msg)
    return msg
  }
}

export async function getMessages(propertyId: string): Promise<Array<{ id: string; propertyId: string; senderId: string; senderName: string; senderRole: string; content: string; createdAt: string; isRead: boolean }>> {
  try {
    return await apiGet(`/properties/${propertyId}/messages`)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(200)
    return MOCK_MESSAGES[propertyId] || []
  }
}

export async function getHistory(propertyId: string): Promise<Array<{ id: string; propertyId: string; type: string; description: string; createdAt: string }>> {
  try {
    return await apiGet(`/properties/${propertyId}/history`)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(200)
    return MOCK_HISTORY[propertyId] || []
  }
}

export async function getAgencies(): Promise<{ id: string; name: string; city: string }[]> {
  try {
    return await apiGet('/properties/agencies')
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return [
      { id: '1', name: 'Y-Plaza Aix-en-Provence', city: 'Aix-en-Provence' },
      { id: '2', name: 'Y-Plaza Paris', city: 'Paris' },
      { id: '3', name: 'Y-Plaza Lyon', city: 'Lyon' },
      { id: '4', name: 'Y-Plaza Marseille', city: 'Marseille' },
      { id: '5', name: 'Y-Plaza Cannes', city: 'Cannes' },
      { id: '6', name: 'Y-Plaza Bordeaux', city: 'Bordeaux' },
    ]
  }
}

export async function updateSellPropertyStatus(processId: string, status: string): Promise<Property> {
  try {
    return await apiPut<Property>(`/properties/${processId}/status`, { status })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(200)
    const prop = MOCK_PROPERTIES.find(p => p.id === processId)
    if (!prop) throw new Error('Property not found')
    prop.status = status as Property['status']
    return { ...prop }
  }
}

export async function updateProcessTags(processId: string, tags: string[]): Promise<Property> {
  try {
    return await apiPut<Property>(`/properties/${processId}`, { tags })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(200)
    const prop = MOCK_PROPERTIES.find(p => p.id === processId)
    if (!prop) throw new Error('Property not found')
    return { ...prop }
  }
}

export async function updateSellProperty(processId: string, data: Record<string, any>): Promise<Property> {
  try {
    return await apiPut<Property>(`/properties/${processId}`, data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(300)
    const prop = MOCK_PROPERTIES.find(p => p.id === processId)
    if (!prop) throw new Error('Property not found')
    return { ...prop }
  }
}

export async function estimatePrice(department: string, surface: number, propertyType: string): Promise<{ pricePerM2: number; estimatedPrice: number }> {
  try {
    const result = await apiGet<any>(`/analysis/estimate?department=${department}&surface=${surface}&type=${propertyType}`)
    return { estimatedPrice: result.estimatedPrice, pricePerM2: result.estimatedPricePerM2 }
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    await mockDelay(300)
    const deptPrices = MOCK_DEPARTMENT_PRICES[department] || [{ avgPricePerM2: 3500, city: 'Ville' }]
    const typeMultiplier = propertyType === 'maison' ? 1.1 : propertyType === 'appartement' ? 1 : propertyType === 'local-commercial' ? 0.9 : 0.5
    const pricePerM2 = Math.round(deptPrices[0].avgPricePerM2 * typeMultiplier)
    return { pricePerM2, estimatedPrice: Math.round(pricePerM2 * surface) }
  }
}
