import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, MapPin, Phone } from '@phosphor-icons/react/dist/ssr'
import { CityLinks } from '@/components/seo/CityLinks'
import { getCities, getCitiesSafe, getResellersOfCity, type PublicReseller } from '@/lib/seo/api'
import { formatPhone, phoneHref, type City } from '@/lib/seo/cities'
import { openingHoursSpecification, summarizeHours } from '@/lib/seo/hours'
import { jsonLd } from '@/lib/seo/jsonld'
import { ORGANIZATION_NAME, SITE_LOCALE, SITE_URL } from '@/lib/site'

// Pages générées à la construction du site, puis actualisées toutes les heures.
export const revalidate = 3600

type Props = { params: Promise<{ locale: string; ville: string }> }

async function findCity(slug: string): Promise<City | undefined> {
  return (await getCitiesSafe()).find((c) => c.slug === slug)
}

export async function generateStaticParams() {
  try {
    return (await getCities()).map((city) => ({ locale: SITE_LOCALE, ville: city.slug }))
  } catch {
    return [] // backend indisponible à la construction : les pages seront créées à la première visite
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params
  const city = await findCity(ville)
  if (!city) return { title: 'Ville introuvable', robots: { index: false } }

  const plural = city.count > 1 ? 's' : ''
  return {
    title: `Revendeurs de gaz Vitogaz à ${city.name} (${city.count} point${plural} de vente)`,
    description: `Liste des ${city.count} point${plural} de vente de gaz Vitogaz à ${city.name} : adresses, types de commerce, téléphones et horaires.`,
    alternates: { canonical: `/${SITE_LOCALE}/revendeurs/${city.slug}` },
  }
}

const toNumber = (value: number | string | null): number | null => {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function typeBreakdown(resellers: PublicReseller[]): string {
  const counts = new Map<string, number>()
  for (const r of resellers) {
    const type = (r.type ?? '').trim()
    if (type) counts.set(type, (counts.get(type) ?? 0) + 1)
  }
  return Array.from(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => `${type} (${n})`)
    .join(', ')
}

function resellerNode(r: PublicReseller, cityName: string) {
  const lat = toNumber(r.latitude)
  const lng = toNumber(r.longitude)
  const hours = openingHoursSpecification(r.hours)
  return {
    '@type': 'LocalBusiness',
    name: r.name,
    ...(r.type ? { description: `${r.type}, point de vente de gaz Vitogaz` } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(r.address ? { streetAddress: r.address } : {}),
      addressLocality: cityName,
      addressCountry: 'MG',
    },
    ...(r.phone ? { telephone: r.phone } : {}),
    ...(lat !== null && lng !== null ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } } : {}),
    ...(hours.length > 0 ? { openingHoursSpecification: hours } : {}),
  }
}

export default async function CityPage({ params }: Props) {
  const { ville } = await params
  const [city, cities] = await Promise.all([findCity(ville), getCitiesSafe()])
  if (!city) notFound()

  const resellers = await getResellersOfCity(city)
  if (resellers.length === 0) notFound()

  const plural = resellers.length > 1 ? 's' : ''
  const breakdown = typeBreakdown(resellers)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/${SITE_LOCALE}` },
          { '@type': 'ListItem', position: 2, name: 'Revendeurs', item: `${SITE_URL}/${SITE_LOCALE}/revendeurs` },
          { '@type': 'ListItem', position: 3, name: city.name, item: `${SITE_URL}/${SITE_LOCALE}/revendeurs/${city.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Points de vente ${ORGANIZATION_NAME} à ${city.name}`,
        numberOfItems: resellers.length,
        itemListElement: resellers.map((r, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: resellerNode(r, city.name),
        })),
      },
    ],
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 sm:px-6 pt-8 pb-28 md:pb-12 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Revendeurs de gaz Vitogaz à {city.name}
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <span className="tabular-nums">{resellers.length}</span> point{plural} de vente Vitogaz à {city.name}.
        {breakdown ? ` Types de commerce : ${breakdown}.` : ''}
      </p>
      <Link
        href="/fr/revendeurs"
        className="mt-5 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors duration-200"
      >
        Voir la carte et les itinéraires
      </Link>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Liste des points de vente à {city.name}
      </h2>
      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {resellers.map((r) => {
          const hours = summarizeHours(r.hours)
          return (
            <li
              key={r.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">{r.name}</h3>
              {r.type && (
                <p className="mt-2 inline-block rounded-full bg-primary-50 dark:bg-primary-900/30 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                  {r.type}
                </p>
              )}
              <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                {r.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>
                      {r.address}, {city.name}
                    </span>
                  </p>
                )}
                {r.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                    <a href={phoneHref(r.phone)} className="tabular-nums text-primary-700 dark:text-primary-300 hover:underline">
                      {formatPhone(r.phone)}
                    </a>
                  </p>
                )}
                {hours && (
                  <p className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{hours}</span>
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-12">
        <CityLinks cities={cities} title="Revendeurs dans d'autres villes" exclude={city.slug} limit={12} />
      </div>
    </main>
  )
}
