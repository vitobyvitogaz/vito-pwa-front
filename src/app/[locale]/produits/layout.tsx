import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Produits Vitogaz",
  description:
    "Découvrez la gamme complète des produits Vitogaz.",
  alternates: { canonical: '/fr/produits' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
