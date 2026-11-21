import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getDeliveryCompanies } from '@/lib/seo/api'
import { jsonLd } from '@/lib/seo/jsonld'
import { SITE_LOCALE, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Commander du gaz livré à domicile',
  description: 'Trouvez une société de livraison de gaz à domicile et contactez-la par téléphone ou par WhatsApp.',
  alternates: { canonical: '/fr/commander' },
}

// Les sociétés sont affichées par la page après chargement ; on les décrit aussi dans le HTML pour les robots.
export default async function CommanderLayout({ children }: { children: ReactNode }) {
  const companies = await getDeliveryCompanies()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sociétés de livraison de gaz à domicile',
    url: `${SITE_URL}/${SITE_LOCALE}/commander`,
    numberOfItems: companies.length,
    itemListElement: companies.map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: company.name,
        ...(company.description ? { description: company.description } : {}),
        ...(company.phone ? { telephone: company.phone } : {}),
        ...(company.website ? { url: company.website } : {}),
        ...(company.service_areas && company.service_areas.length > 0
          ? { areaServed: company.service_areas.map((name) => ({ '@type': 'City', name })) }
          : {}),
      },
    })),
  }

  return (
    <>
      {companies.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      )}
      {children}
    </>
  )
}
