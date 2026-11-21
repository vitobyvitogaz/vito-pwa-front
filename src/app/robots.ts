import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Tous les robots (moteurs de recherche et assistants IA) peuvent lire les pages publiques.
// Les pages privées portent une balise « noindex » plutôt qu'un blocage ici : un robot bloqué ne verrait pas
// la balise. Seuls l'API et la redirection des QR codes sont exclues.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/qr'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
