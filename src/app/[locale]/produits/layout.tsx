import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getProducts } from '@/lib/seo/api'
import { jsonLd } from '@/lib/seo/jsonld'
import { ORGANIZATION_NAME, SITE_LOCALE, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Produits Vitogaz',
  description: 'Découvrez la gamme complète des produits Vitogaz : bouteilles, accessoires et kits.',
  alternates: { canonical: '/fr/produits' },
}

// La gamme est affichée par la page après chargement ; on la décrit aussi dans le HTML pour les robots.
// Aucun prix n'est publié : on n'en invente pas.
export default async function ProduitsLayout({ children }: { children: ReactNode }) {
  const products = await getProducts()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gamme de produits Vitogaz',
    url: `${SITE_URL}/${SITE_LOCALE}/produits`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name.trim(),
        brand: { '@type': 'Brand', name: ORGANIZATION_NAME },
        ...(product.category ? { category: product.category } : {}),
        ...(product.description ? { description: product.description } : {}),
        ...(product.image_url ? { image: product.image_url } : {}),
      },
    })),
  }

  return (
    <>
      {products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      )}
      {children}
    </>
  )
}
