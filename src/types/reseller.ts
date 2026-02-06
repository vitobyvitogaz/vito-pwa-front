export interface Reseller {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  phone: string
  whatsapp?: string
  type: 'Quincaillerie' | 'Épicerie' | 'Station Service' | 'Libre Service' | 'Maison du gaz' | 'Autres'
  services: string[]
  hours?: string
  rating?: number
  reseller_products?: Array<{
    product_id: string
    products: {
      id: string
      name: string
      price: number
      category: string
      image_url?: string
      description?: string
      product_code?: string
      created_at?: string
      updated_at?: string
      deleted_at?: string | null
    }
  }>
}