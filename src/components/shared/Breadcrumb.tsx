'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid'

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname()
  
  // Ne pas afficher sur l'accueil
  if (pathname === '/' || pathname === '/fr' || pathname === '/mg' || pathname === '/en') {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const locale = pathSegments[0] // fr, mg, ou en
  const segments = pathSegments.slice(1)

  const breadcrumbLabels: Record<string, string> = {
    revendeurs: 'Revendeurs',
    commander: 'Commander',
    promotions: 'Promotions',
    documents: 'Documents',
  }

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-dark-border mt-14 sm:mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
            >
              {/*<HomeIcon className="w-4 h-4" />*/}
              <span>Accueil</span>
            </Link>
          </li>
          
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const path = `/${locale}/${segments.slice(0, index + 1).join('/')}`
            const label = breadcrumbLabels[segment] || segment

            return (
              <li key={segment} className="flex items-center gap-2">
                <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
                {isLast ? (
                  <span className="text-neutral-900 dark:text-white font-semibold">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={path}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
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