import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { BottomNav } from '@/components/shared/BottomNav'
import { ORGANIZATION_NAME, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/lib/site'

// Identité de l'entreprise pour les moteurs de recherche et les assistants IA.
// Le téléphone est volontairement absent tant que le numéro officiel n'est pas arrêté.
const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    alternateName: ['Vitogaz', SITE_NAME],
    url: SITE_URL,
    logo: `${SITE_URL}/logo-vitogaz.png`,
    description: SITE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Route digue 2, Andohatapenaka II, Andranoabo',
      postalCode: '101',
      addressLocality: 'Antananarivo',
      addressCountry: 'MG',
      postOfficeBoxNumber: '3984',
    },
    parentOrganization: { '@type': 'Organization', name: 'Rubis' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LOCALE,
  },
]

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Seule la langue publiée existe : toute autre adresse (/zzz, /robots.txt…) renvoie une vraie erreur 404
  // au lieu de la page d'accueil avec un code 200.
  if (locale !== SITE_LOCALE) notFound()

  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
      ))}
      {children}
      <BottomNav />
    </>
  )
}
