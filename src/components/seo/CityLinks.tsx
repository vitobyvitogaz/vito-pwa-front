import Link from 'next/link'
import { MapPin } from '@phosphor-icons/react/dist/ssr'
import type { City } from '@/lib/seo/cities'

interface CityLinksProps {
  cities: City[]
  title: string
  /** Ville à ne pas proposer (page courante). */
  exclude?: string
  limit?: number
}

/** Liens vers les pages locales : lisibles sans JavaScript, ils relient les pages entre elles pour les robots. */
export function CityLinks({ cities, title, exclude, limit }: CityLinksProps) {
  const list = cities.filter((c) => c.slug !== exclude).slice(0, limit)
  if (list.length === 0) return null

  return (
    <nav aria-label={title} className="font-sans">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">{title}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {list.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/fr/revendeurs/${city.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:border-primary/40 hover:text-primary-600 transition-colors duration-200"
            >
              <MapPin className="h-3.5 w-3.5" />
              {city.name}
              <span className="tabular-nums text-neutral-500 dark:text-neutral-400">({city.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
