import type { Reseller } from '@/types/reseller'
import resellersJson from './resellers.json'

// Mapper les données en excluant le champ hours (maintenant géré par l'API)
export const resellers: Reseller[] = resellersJson.map((reseller: any) => ({
  id: reseller.id,
  name: reseller.name,
  address: reseller.address,
  city: reseller.city,
  lat: reseller.lat,
  lng: reseller.lng,
  phone: reseller.phone,
  whatsapp: reseller.whatsapp,
  type: reseller.type,
  services: reseller.services,
  rating: reseller.rating,
  reseller_products: reseller.reseller_products,
  segment_id: reseller.segment_id,
  // hours est maintenant fourni par l'API comme BusinessHours
  // business_status est calculé par le backend
}))