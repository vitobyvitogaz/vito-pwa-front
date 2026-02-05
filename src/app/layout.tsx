import { ReactNode } from 'react'
import { Inter, Montserrat } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'  // ← AJOUTEZ CETTE LIGNE

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
  title: 'Vito - Vitogaz Madagascar',
  description: 'Trouvez votre revendeur Vitogaz, commandez votre gaz',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#008B7F" />
      </head>
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