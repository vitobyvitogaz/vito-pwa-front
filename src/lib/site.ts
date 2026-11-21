// Identité publique du site : une seule source pour les balises, le plan du site et les données structurées.

export const SITE_URL = 'https://vitobyvitogaz.mg'
export const SITE_NAME = 'Vito by Vitogaz'
export const ORGANIZATION_NAME = 'Vitogaz Madagascar'

// Langue publiée. Les pages /en et /mg ne sont pas traduites : elles redirigent vers /fr (voir next.config.js).
export const SITE_LOCALE = 'fr'

export const SITE_DESCRIPTION =
  "Trouvez un revendeur de gaz Vitogaz, contactez une société de livraison à domicile, consultez les promotions et les conseils de sécurité à Madagascar."

/** Pages ouvertes aux moteurs de recherche et aux robots d'IA (chemins sans la langue). */
export const PUBLIC_PATHS = [
  '',
  '/revendeurs',
  '/commander',
  '/promotions',
  '/produits',
  '/documents',
  '/assistance',
  '/contact-pro',
  '/conditions',
  '/confidentialite',
] as const
