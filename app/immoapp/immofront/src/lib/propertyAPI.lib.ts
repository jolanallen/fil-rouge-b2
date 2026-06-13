import { apiGet, apiPost, apiDelete, unwrap } from './api.lib'
import type { CreatePropertyDTO, PropertySearchDTO } from '@/types/dtos/property.dto'
import type { Property, PropertyImage, PropertyListResponse, PropertyDetailResponse, PropertyPriceHistory } from '@/types/presenters/property.presenter'

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Bastide Provençale avec Piscine',
    description: 'Magnifique bastide provençale entièrement rénovée située au cœur du pays d\'Aix. Cette propriété d\'exception offre des prestations haut de gamme, une vue imprenable sur la Sainte-Victoire et un parc arboré de 5000m².',
    price: 1250000,
    surface: 280,
    rooms: 7,
    type: 'maison',
    address: '15 Chemin des Oliviers',
    city: 'Aix-en-Provence',
    postalCode: '13100',
    department: '13',
    latitude: 43.5297,
    longitude: 5.4474,
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Façade de la bastide', isPrimary: true },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Piscine et jardin', isPrimary: false },
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', alt: 'Salon intérieur', isPrimary: false }
    ],
    features: [
      { id: 'f-1', name: 'Piscine chauffée', icon: 'pool' },
      { id: 'f-2', name: 'Garage 3 places', icon: 'garage' },
      { id: 'f-3', name: 'Cave à vin', icon: 'wine' },
      { id: 'f-4', name: 'Domotique', icon: 'smart' },
      { id: 'f-5', name: 'Climatisation réversible', icon: 'ac' }
    ],
    energyClass: 'B',
    pricePerM2: 4464,
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-05-10T14:00:00Z',
    status: 'available',
    agency: 'Y-Plaza Aix-en-Provence'
  },
  {
    id: 'prop-2',
    title: 'Appartement Haussmannien Vue Tour Eiffel',
    description: 'Superbe appartement haussmannien au 6ème étage avec ascenseur, offrant une vue dégagée sur la Tour Eiffel. Parquet d\'origine, moulures, cheminée en marbre. Prestations de prestige dans le 16ème arrondissement.',
    price: 895000,
    surface: 120,
    rooms: 4,
    type: 'appartement',
    address: '42 Avenue Mozart',
    city: 'Paris',
    postalCode: '75016',
    department: '75',
    latitude: 48.8566,
    longitude: 2.2894,
    images: [
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', alt: 'Salon haussmannien', isPrimary: true },
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80', alt: 'Chambre principale', isPrimary: false },
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', alt: 'Vue Tour Eiffel', isPrimary: false }
    ],
    features: [
      { id: 'f-6', name: 'Ascenseur', icon: 'elevator' },
      { id: 'f-7', name: 'Cave', icon: 'storage' },
      { id: 'f-8', name: 'Gardien', icon: 'security' },
      { id: 'f-9', name: 'Balcon filant', icon: 'balcony' }
    ],
    energyClass: 'C',
    pricePerM2: 7458,
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-05-12T11:00:00Z',
    status: 'available',
    agency: 'Y-Plaza Paris'
  },
  {
    id: 'prop-3',
    title: 'Local Commercial Centre-Ville',
    description: 'Local commercial de prestige en plein cœur du centre-ville de Lyon. Vitrine sur rue de 8 mètres, cave de stockage, mezzanine aménagée. Idéal pour commerce de luxe ou showroom.',
    price: 650000,
    surface: 180,
    rooms: 3,
    type: 'local-commercial',
    address: '8 Rue de la République',
    city: 'Lyon',
    postalCode: '69002',
    department: '69',
    latitude: 45.7640,
    longitude: 4.8357,
    images: [
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1600607688965-1c2e6c8e4b9a?w=800&q=80', alt: 'Vitrine du local', isPrimary: true },
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Intérieur spacieux', isPrimary: false }
    ],
    features: [
      { id: 'f-10', name: 'Vitrine 8m', icon: 'storefront' },
      { id: 'f-11', name: 'Mezzanine', icon: 'stairs' },
      { id: 'f-12', name: 'Cave', icon: 'storage' },
      { id: 'f-13', name: 'Climatisation', icon: 'ac' }
    ],
    energyClass: 'D',
    pricePerM2: 3611,
    createdAt: '2025-02-20T08:00:00Z',
    updatedAt: '2025-05-08T16:00:00Z',
    status: 'available',
    agency: 'Y-Plaza Lyon'
  },
  {
    id: 'prop-4',
    title: 'Mas Provençal avec Oliviers',
    description: 'Authentique mas provençal restauré dans le respect des traditions. Toiture en tuiles canal, murs en pierre apparente, terrasse ombragée. Terrain de 2 hectares avec oliveraie centenaire.',
    price: 980000,
    surface: 200,
    rooms: 5,
    type: 'maison',
    address: 'Route de Rousset',
    city: 'Marseille',
    postalCode: '13008',
    department: '13',
    latitude: 43.2965,
    longitude: 5.3698,
    images: [
      { id: 'img-9', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Façade du mas', isPrimary: true },
      { id: 'img-10', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Olivier centenaire', isPrimary: false },
      { id: 'img-11', url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80', alt: 'Piscine naturelle', isPrimary: false }
    ],
    features: [
      { id: 'f-14', name: 'Piscine naturelle', icon: 'pool' },
      { id: 'f-15', name: 'Olivier centenaire', icon: 'tree' },
      { id: 'f-16', name: 'Puits', icon: 'water' },
      { id: 'f-17', name: 'Terrasse 80m²', icon: 'terrace' }
    ],
    energyClass: 'B',
    pricePerM2: 4900,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-05-01T09:00:00Z',
    status: 'available',
    agency: 'Y-Plaza Marseille'
  },
  {
    id: 'prop-5',
    title: 'Terrain Constructible Vue Mer',
    description: 'Magnifique terrain constructible de 1200m² avec vue mer imprenable sur la baie de Cannes. Permis de construire obtenu pour villa de 180m². Viabilisé, zone calme et résidentielle.',
    price: 450000,
    surface: 1200,
    rooms: 0,
    type: 'terrain',
    address: 'Chemin de la Croix Rouge',
    city: 'Cannes',
    postalCode: '06400',
    department: '06',
    latitude: 43.5500,
    longitude: 7.0167,
    images: [
      { id: 'img-12', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Vue sur la baie', isPrimary: true },
      { id: 'img-13', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Terrain plat', isPrimary: false }
    ],
    features: [
      { id: 'f-18', name: 'Vue mer', icon: 'beach' },
      { id: 'f-19', name: 'Permis obtenu', icon: 'document' },
      { id: 'f-20', name: 'Viabilisé', icon: 'utilities' }
    ],
    energyClass: 'A',
    pricePerM2: 375,
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-04-28T12:00:00Z',
    status: 'pending',
    agency: 'Y-Plaza Cannes'
  },
  {
    id: 'prop-6',
    title: 'Appartement Moderne Centre Historique',
    description: 'Appartement récent dans une résidence de standing au cœur du centre historique de Bordeaux. Prestations haut de gamme, cuisine équipée, terrasse de 25m², parking sous-sol.',
    price: 520000,
    surface: 85,
    rooms: 3,
    type: 'appartement',
    address: '5 Rue Sainte-Catherine',
    city: 'Bordeaux',
    postalCode: '33000',
    department: '33',
    latitude: 44.8378,
    longitude: -0.5792,
    images: [
      { id: 'img-14', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', alt: 'Salon moderne', isPrimary: true },
      { id: 'img-15', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', alt: 'Terrasse', isPrimary: false }
    ],
    features: [
      { id: 'f-21', name: 'Parking sous-sol', icon: 'parking' },
      { id: 'f-22', name: 'Terrasse 25m²', icon: 'terrace' },
      { id: 'f-23', name: 'Cuisine équipée', icon: 'kitchen' }
    ],
    energyClass: 'A',
    pricePerM2: 6118,
    createdAt: '2025-04-15T11:00:00Z',
    updatedAt: '2025-05-13T15:00:00Z',
    status: 'available',
    agency: 'Y-Plaza Bordeaux'
  }
]

const MOCK_PRICE_HISTORY: Record<string, PropertyPriceHistory> = {
  'prop-1': {
    propertyId: 'prop-1',
    pricePoints: [
      { date: '2020-01', price: 980000, pricePerM2: 3500 },
      { date: '2021-01', price: 1020000, pricePerM2: 3643 },
      { date: '2022-01', price: 1100000, pricePerM2: 3929 },
      { date: '2023-01', price: 1160000, pricePerM2: 4143 },
      { date: '2024-01', price: 1200000, pricePerM2: 4286 },
      { date: '2025-01', price: 1250000, pricePerM2: 4464 }
    ],
    predictedPrice: 1315000,
    predictedPricePerM2: 4696,
    growthRate: 4.2
  },
  'prop-2': {
    propertyId: 'prop-2',
    pricePoints: [
      { date: '2020-01', price: 720000, pricePerM2: 6000 },
      { date: '2021-01', price: 755000, pricePerM2: 6292 },
      { date: '2022-01', price: 800000, pricePerM2: 6667 },
      { date: '2023-01', price: 840000, pricePerM2: 7000 },
      { date: '2024-01', price: 870000, pricePerM2: 7250 },
      { date: '2025-01', price: 895000, pricePerM2: 7458 }
    ],
    predictedPrice: 930000,
    predictedPricePerM2: 7750,
    growthRate: 3.8
  }
}

export async function getProperties(params?: PropertySearchDTO): Promise<PropertyListResponse> {
  try {
    return await apiGet<PropertyListResponse>('/properties', params as any)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    let filtered = [...MOCK_PROPERTIES]
    if (params) {
      if (params.type) filtered = filtered.filter(p => p.type === params.type)
      if (params.minPrice) filtered = filtered.filter(p => p.price >= params.minPrice!)
      if (params.maxPrice) filtered = filtered.filter(p => p.price <= params.maxPrice!)
      if (params.minSurface) filtered = filtered.filter(p => p.surface >= params.minSurface!)
      if (params.maxSurface) filtered = filtered.filter(p => p.surface <= params.maxSurface!)
      if (params.city) filtered = filtered.filter(p => p.city.toLowerCase().includes(params.city!.toLowerCase()))
      if (params.query) {
        const q = params.query.toLowerCase()
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      }
      if (params.rooms) filtered = filtered.filter(p => p.rooms >= params.rooms!)
    }
    const page = params?.page || 1
    const limit = params?.limit || 6
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    }
  }
}

export async function getPropertyById(id: string): Promise<PropertyDetailResponse> {
  try {
    const property = await apiGet<Property>(`/properties/${id}`)
    return { property, priceHistory: null, similarProperties: undefined }
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const property = MOCK_PROPERTIES.find(p => p.id === id)
    if (!property) throw new Error('Propriété non trouvée')
    const history = MOCK_PRICE_HISTORY[id] || {
      propertyId: id,
      pricePoints: [
        { date: '2020-01', price: property.price * 0.8, pricePerM2: Math.round(property.pricePerM2 * 0.8) },
        { date: '2021-01', price: property.price * 0.85, pricePerM2: Math.round(property.pricePerM2 * 0.85) },
        { date: '2022-01', price: property.price * 0.9, pricePerM2: Math.round(property.pricePerM2 * 0.9) },
        { date: '2023-01', price: property.price * 0.94, pricePerM2: Math.round(property.pricePerM2 * 0.94) },
        { date: '2024-01', price: property.price * 0.97, pricePerM2: Math.round(property.pricePerM2 * 0.97) },
        { date: '2025-01', price: property.price, pricePerM2: property.pricePerM2 }
      ],
      predictedPrice: Math.round(property.price * 1.05),
      predictedPricePerM2: Math.round(property.pricePerM2 * 1.05),
      growthRate: 4.5
    }
    return { property, priceHistory: history, similarProperties: MOCK_PROPERTIES.filter(p => p.id !== id).slice(0, 3) }
  }
}

export async function createProperty(data: CreatePropertyDTO): Promise<Property> {
  try {
    return await apiPost<Property>('/properties', data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const newProperty: Property = {
      id: 'prop-' + Date.now(),
      title: data.title,
      description: data.description || '',
      price: data.price || 0,
      surface: data.surface || 0,
      rooms: data.rooms || 0,
      type: (data.type as any) || 'appartement',
      address: data.address || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      department: data.department || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      images: [],
      features: [],
      energyClass: 'A',
      pricePerM2: data.price && data.surface ? Math.round(data.price / data.surface) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      agency: 'Y-Plaza',
      ownerId: null,
      staffId: null,
    }
    return newProperty
  }
}

export async function uploadPropertyImage(propertyId: string, _file: File): Promise<PropertyImage> {
  try {
    const formData = new FormData()
    formData.append('file', _file)
    const token = (() => {
      const stored = localStorage.getItem('auth')
      if (!stored) return null
      try { return JSON.parse(stored).accessToken } catch { return null }
    })()
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/properties/${propertyId}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return unwrap<PropertyImage>(res)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return { id: 'img-' + Date.now(), url: URL.createObjectURL(_file), alt: 'Uploaded image', isPrimary: false }
  }
}

export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  try {
    await apiDelete(`/properties/${propertyId}/images/${imageId}`)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
  }
}

export async function getSimilarProperties(propertyId: string): Promise<Property[]> {
  try {
    const detail = await apiGet<PropertyDetailResponse>(`/properties/${propertyId}`)
    return detail.similarProperties || []
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return MOCK_PROPERTIES.filter(p => p.id !== propertyId).slice(0, 3)
  }
}
