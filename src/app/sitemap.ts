import type { MetadataRoute } from 'next'
import { PUBLIC_PATHS, SITE_LOCALE, SITE_URL } from '@/lib/site'

// Pages publiques, sans date de modification inventée : on n'en indique une que lorsqu'on la connaît.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}/${SITE_LOCALE}${path}` }))
}
