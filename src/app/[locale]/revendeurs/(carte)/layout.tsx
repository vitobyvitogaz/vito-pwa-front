import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import { CityLinks } from '@/components/seo/CityLinks'
import { getCitiesSafe } from '@/lib/seo/api'
import { RESELLERS_ACTIVE_URL } from '@/lib/api/resellers'

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
  // La carte a besoin de la liste des revendeurs : on demande au navigateur de la télécharger dès la lecture
  // du HTML, sans attendre que le JavaScript soit chargé et exécuté (la requête part sinon vers 3 s sur mobile).
  // Même mode CORS et sans identifiants que le fetch du store, pour que la réponse soit réutilisée.
  preload(RESELLERS_ACTIVE_URL, { as: 'fetch', crossOrigin: 'anonymous' })

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
