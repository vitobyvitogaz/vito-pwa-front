import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Trouver un revendeur de gaz Vitogaz",
  description:
    "Localisez le point de vente de gaz Vitogaz le plus proche sur la carte, avec les distances et l'itinéraire.",
  alternates: { canonical: '/fr/revendeurs' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
