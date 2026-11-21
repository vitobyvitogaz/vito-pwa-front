import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Devenir partenaire Vitogaz",
  description:
    "Devenez revendeur ou client professionnel Vitogaz : envoyez votre demande.",
  alternates: { canonical: '/fr/contact-pro' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
