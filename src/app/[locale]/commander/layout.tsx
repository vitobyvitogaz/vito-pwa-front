import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Commander du gaz livré à domicile",
  description:
    "Trouvez une société de livraison de gaz à domicile et contactez-la par téléphone ou par WhatsApp.",
  alternates: { canonical: '/fr/commander' },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
