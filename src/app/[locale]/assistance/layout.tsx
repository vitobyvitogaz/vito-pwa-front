import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Service clients",
  description:
    "Écrivez au service clients de Vitogaz Madagascar : question, difficulté, suggestion.",
  alternates: { canonical: '/fr/assistance' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
