import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import { Poppins, EB_Garamond } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { OfflineNavigation } from '@/components/shared/OfflineNavigation'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { PushInvite } from '@/components/shared/PushInvite'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vito by Vitogaz : revendeurs et gaz à Madagascar',
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  alternates: { canonical: './' },
  // Vérification de la propriété du site dans Google Search Console (balise HTML)
  verification: { google: 'y5EkqrgB_jEAX7OOCYSLKx0FTvYSFi9493r59FAzOTA' },

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

  openGraph: {
    siteName: SITE_NAME,
    title: 'Vito by Vitogaz : revendeurs et gaz à Madagascar',
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'fr_MG',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary',
    title: 'Vito by Vitogaz : revendeurs et gaz à Madagascar',
    description: SITE_DESCRIPTION,
    images: ['/icons/icon-512x512.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#008B7F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // ── Mode clair par défaut. Le choix « sombre » du visiteur (Paramètres) est ré-appliqué par le
    // script du <head> avant le premier affichage ; suppressHydrationWarning : ce script ajoute la
    // classe `dark` à <html> avant l'hydratation de React.
    <html lang="fr" className={`${poppins.variable} ${ebGaramond.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={poppins.className}>
        <Header />
        <Breadcrumb />
        {children}
        <Footer />
        <ScrollToTop />
        <OfflineBanner />
        <ServiceWorkerRegister />
        <OfflineNavigation />
        <PushInvite />
      </body>
    </html>
  )
}
