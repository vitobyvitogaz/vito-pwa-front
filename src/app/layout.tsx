import { ReactNode } from 'react'
import { Poppins, EB_Garamond } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'

// ── Police principale UI : Poppins (police officielle groupe Rubis) ──
// Non-variable → les graisses doivent être déclarées explicitement.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

// ── Police secondaire éditoriale : EB Garamond ──
// Réservée aux titres éditoriaux (hero, promotions, documents) via la classe `font-editorial`.
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

export const metadata = {
  title: 'VitoByVitogaz',
  description: 'Votre compagnon pour utiliser du gaz tous les jours',
  manifest: '/manifest.json',
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  themeColor: '#008B7F',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  openGraph: {
    title: 'VitoByVitogaz',
    description: 'Votre compagnon pour utiliser du gaz tous les jours',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // ── Mode clair par défaut — le ThemeSwitcher peut basculer en dark via JS ──
    <html lang="fr" className={`${poppins.variable} ${ebGaramond.variable}`}>
      <body className={poppins.className}>
        <Header />
        <Breadcrumb />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  )
}
