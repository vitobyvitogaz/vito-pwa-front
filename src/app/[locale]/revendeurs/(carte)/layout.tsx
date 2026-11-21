import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { CityLinks } from '@/components/seo/CityLinks'
import { getCitiesSafe } from '@/lib/seo/api'

// Actualisé toutes les heures (liste des villes issue des revendeurs enregistrés)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Trouver un revendeur de gaz Vitogaz',
  description:
    'Localisez le point de vente de gaz Vitogaz le plus proche sur la carte, avec les distances et l\'itinéraire.',
  alternates: { canonical: '/fr/revendeurs' },
}

// Les pages par ville ont leur propre adresse : on ne duplique pas les titres de la carte, on les relie.
export default async function RevendeursLayout({ children }: { children: ReactNode }) {
  const cities = await getCitiesSafe()
  return (
    <>
      {children}
      {cities.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 pb-28 md:pb-12">
          <CityLinks cities={cities} title="Revendeurs par ville" />
        </section>
      )}
    </>
  )
}
