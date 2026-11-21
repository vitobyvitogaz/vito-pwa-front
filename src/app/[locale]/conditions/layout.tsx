import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Les conditions d'utilisation de l'application Vito by Vitogaz.",
  alternates: { canonical: '/fr/conditions' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
