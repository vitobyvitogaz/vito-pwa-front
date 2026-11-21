import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Documents et conseils de sécurité",
  description:
    "Vidéos, consignes de sécurité, guides et documentation PAMF de Vitogaz Madagascar.",
  alternates: { canonical: '/fr/documents' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
