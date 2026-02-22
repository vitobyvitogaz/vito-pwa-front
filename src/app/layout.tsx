import { ReactNode } from 'react'
import { Inter, Montserrat } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  title: 'VitoByVitogaz',
  description: 'Votre compagnon pour utiliser du gaz tous les jours',
  manifest: '/manifest.json',
  
  // Icônes
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
  
  // Métadonnées PWA
  themeColor: '#008B7F',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  // Open Graph
  openGraph: {
    title: 'VitoByVitogaz',
    description: 'Votre compagnon pour utiliser du gaz tous les jours',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable}`}>
      <body className={inter.className}>
        <Header />
        <Breadcrumb />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  )
}