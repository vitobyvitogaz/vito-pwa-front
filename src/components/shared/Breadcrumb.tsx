'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname()

  if (pathname === '/' || pathname === '/fr' || pathname === '/mg' || pathname === '/en') {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const locale = pathSegments[0]
  const segments = pathSegments.slice(1)

  const breadcrumbLabels: Record<string, string> = {
    revendeurs:    'Revendeurs',
    commander:     'Commander',
    promotions:    'Promotions & Offres',
    documents:     'Documents',
    produits:      'Produits',
    assistance:    'Service Clients',
    'contact-pro': 'Devenir partenaire',
    profil:        'Mon profil',
    parametres:    'Paramètres',
  }

  // Segments qui sont des UUIDs → afficher un label générique selon le contexte
  const isUUID = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

  const getLabel = (segment: string, index: number): string => {
    if (breadcrumbLabels[segment]) return breadcrumbLabels[segment]
    if (isUUID(segment)) {
      // Déduire le contexte depuis le segment précédent
      const prev = segments[index - 1]
      if (prev === 'promotions') return "Détails de l'offre"
      if (prev === 'revendeurs') return "Fiche revendeur"
      return "Détail"
    }
    return segment
  }

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-neutral-800 mt-[64px] sm:mt-[70px]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <ol className="flex items-center gap-2 text-sm font-sans min-h-[3rem] py-3">
          <li className="flex items-center">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-all duration-300"
            >
              <Home className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="leading-none">Accueil</span>
            </Link>
          </li>

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const path = `/${locale}/${segments.slice(0, index + 1).join('/')}`
            const label = getLabel(segment, index)

            return (
              <li key={segment} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
                {isLast ? (
                  <span className="text-neutral-900 dark:text-white font-semibold leading-none">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={path}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary transition-all duration-300 leading-none"
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}