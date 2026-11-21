import type { MetadataRoute } from 'next'
import { getCitiesSafe } from '@/lib/seo/api'
import { PUBLIC_PATHS, SITE_LOCALE, SITE_URL } from '@/lib/site'

// Actualisé toutes les heures : les villes viennent des revendeurs enregistrés.
export const revalidate = 3600

// Pages publiques, sans date de modification inventée : on n'en indique une que lorsqu'on la connaît.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCitiesSafe()
  return [
    ...PUBLIC_PATHS.map((path) => `/${SITE_LOCALE}${path}`),
    ...cities.map((city) => `/${SITE_LOCALE}/revendeurs/${city.slug}`),
  ].map((path) => ({ url: `${SITE_URL}${path}` }))
}
