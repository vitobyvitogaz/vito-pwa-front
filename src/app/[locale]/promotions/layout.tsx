import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Promotions Vitogaz",
  description:
    "Découvrez les promotions Vitogaz en cours à Madagascar, selon votre zone.",
  alternates: { canonical: '/fr/promotions' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
