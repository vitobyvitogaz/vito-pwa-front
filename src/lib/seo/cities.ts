// Regroupement des revendeurs par ville pour les pages locales (référencement).

export interface ResellerLite {
  city: string | null
}

export interface City {
  /** Fragment d'adresse : « nosy-be ». */
  slug: string
  /** Nom affiché : « Nosy Be ». */
  name: string
  count: number
  /** Écritures de la ville telles qu'elles figurent en base (« NOSY BE », « Nosy Be »…). */
  raw: string[]
}

export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** « NOSY BE » → « Nosy Be », « fort-dauphin » → « Fort-Dauphin ». */
export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/(^|[\s'’-])([a-zà-ÿ])/g, (_match, separator: string, letter: string) => separator + letter.toUpperCase())

export function groupCities(resellers: ResellerLite[]): City[] {
  const bySlug = new Map<string, { count: number; raw: Map<string, number> }>()

  for (const reseller of resellers) {
    const raw = (reseller.city ?? '').trim()
    const slug = slugify(raw)
    if (!slug) continue
    const entry = bySlug.get(slug) ?? { count: 0, raw: new Map<string, number>() }
    entry.count += 1
    entry.raw.set(raw, (entry.raw.get(raw) ?? 0) + 1)
    bySlug.set(slug, entry)
  }

  return Array.from(bySlug, ([slug, { count, raw }]) => {
    const spellings = Array.from(raw.keys())
    const mostUsed = [...raw].sort((a, b) => b[1] - a[1])[0][0]
    return { slug, name: titleCase(mostUsed), count, raw: spellings }
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
}

/** « 0320716042 » → « 032 07 160 42 » (format malgache) ; autre longueur : inchangé. */
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}` : phone.trim()
}

export const phoneHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`
