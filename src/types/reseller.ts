export interface Reseller {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  phone: string
  whatsapp?: string; // AJOUTEZ CETTE LIGNE
  type: 'Quincaillerie' | 'Épicerie' | 'Station Service' |'Autres'
  services: string[]
  hours?: string
  rating?: number
}