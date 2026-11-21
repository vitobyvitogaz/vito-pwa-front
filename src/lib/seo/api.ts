import { unstable_cache } from 'next/cache'
import { groupCities, type City } from '@/lib/seo/cities'
import type { Hours } from '@/lib/seo/hours'

// Appels côté serveur uniquement (rendu des pages pour les robots). API_URL est définie sur Vercel pour
// le serveur ; à défaut on utilise l'adresse publique du backend.
const API = process.env.API_URL || 'https://vito-backend-supabase.onrender.com/api/v1'

export interface PublicReseller {
  id: string
  name: string
  type: string | null
  address: string | null
  city: string | null
  phone: string | null
  latitude: number | string | null
  longitude: number | string | null
  hours: Hours | null
  is_active?: boolean
  deleted_at?: string | null
}

async function getJson<T>(path: string, init: RequestInit & { next?: { revalidate: number } } = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, init)
  if (!response.ok) throw new Error(`API ${path} : HTTP ${response.status}`)
  return response.json() as Promise<T>
}

/**
 * Liste des villes. Le backend n'a pas de route dédiée : on lit la liste complète (plusieurs Mo, trop grosse pour
 * le cache de fetch de Next, limité à 2 Mo : on ne lui demande donc pas de la garder) puis on conserve seulement
 * le résultat, léger, pendant une heure. Sans option « no-store », les pages restent générées statiquement.
 */
export const getCities = unstable_cache(
  async (): Promise<City[]> => groupCities(await getJson<PublicReseller[]>('/resellers')),
  ['seo-reseller-cities'],
  { revalidate: 3600 },
)

/** Villes, ou liste vide si le backend ne répond pas : une page publique ne doit jamais échouer pour ça. */
export async function getCitiesSafe(): Promise<City[]> {
  try {
    return await getCities()
  } catch (error) {
    console.error('[SEO] Villes indisponibles :', error)
    return []
  }
}

export async function getResellersOfCity(city: City): Promise<PublicReseller[]> {
  const lists = await Promise.all(
    city.raw.map((raw) =>
      getJson<PublicReseller[]>(`/resellers/city/${encodeURIComponent(raw)}`, { next: { revalidate: 3600 } }),
    ),
  )
  return lists
    .flat()
    .filter((r) => r.is_active !== false && !r.deleted_at)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export interface PublicDeliveryCompany {
  id: number | string
  name: string
  description: string | null
  phone: string | null
  website: string | null
  service_areas: string[] | null
  is_active: boolean
}

export interface PublicProduct {
  id: string
  name: string
  description: string | null
  category: string | null
  image_url: string | null
  is_active: boolean
}

export async function getDeliveryCompanies(): Promise<PublicDeliveryCompany[]> {
  try {
    const list = await getJson<PublicDeliveryCompany[]>('/delivery-companies', { next: { revalidate: 3600 } })
    return list.filter((c) => c.is_active)
  } catch (error) {
    console.error('[SEO] Sociétés de livraison indisponibles :', error)
    return []
  }
}

export async function getProducts(): Promise<PublicProduct[]> {
  try {
    const list = await getJson<PublicProduct[]>('/products', { next: { revalidate: 3600 } })
    return list.filter((p) => p.is_active)
  } catch (error) {
    console.error('[SEO] Produits indisponibles :', error)
    return []
  }
}
