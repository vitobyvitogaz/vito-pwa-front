// Horaires d'un revendeur : résumé lisible et équivalent schema.org.

interface DaySchedule {
  open: string | null
  close: string | null
  closed: boolean
  breaks?: { start: string; end: string }[]
}

export interface Hours {
  default_schedule?: Record<string, DaySchedule | undefined>
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const clock = (value: string): string => {
  const [h, m] = value.split(':')
  return m && m !== '00' ? `${Number(h)}h${m}` : `${Number(h)}h`
}

const keyOf = (day: DaySchedule | undefined): string =>
  !day || day.closed || !day.open || !day.close
    ? 'closed'
    : `${day.open}-${day.close}|${(day.breaks ?? []).map((b) => `${b.start}-${b.end}`).join(',')}`

/** « Lun–Sam 7h–17h (pause 12h–14h), Dim fermé » ; null si aucun horaire exploitable. */
export function summarizeHours(hours: Hours | null | undefined): string | null {
  const schedule = hours?.default_schedule
  if (!schedule) return null

  const groups: { from: number; to: number; key: string }[] = []
  DAYS.forEach((name, index) => {
    const key = keyOf(schedule[name])
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.to = index
    else groups.push({ from: index, to: index, key })
  })

  if (groups.every((g) => g.key === 'closed')) return null

  return groups
    .map(({ from, to, key }) => {
      const range = from === to ? LABELS[from] : `${LABELS[from]}–${LABELS[to]}`
      if (key === 'closed') return `${range} fermé`
      const day = schedule[DAYS[from]]!
      const breaks = day.breaks ?? []
      const pause = breaks.length === 1 ? ` (pause ${clock(breaks[0].start)}–${clock(breaks[0].end)})` : ''
      return `${range} ${clock(day.open!)}–${clock(day.close!)}${pause}`
    })
    .join(', ')
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string
  opens: string
  closes: string
}

export function openingHoursSpecification(hours: Hours | null | undefined): OpeningHoursSpecification[] {
  const schedule = hours?.default_schedule
  if (!schedule) return []
  const result: OpeningHoursSpecification[] = []
  DAYS.forEach((name, index) => {
    const day = schedule[name]
    if (!day || day.closed || !day.open || !day.close) return
    result.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[index]}`,
      opens: day.open,
      closes: day.close,
    })
  })
  return result
}
