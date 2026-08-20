'use client'

/**
 * PAGE JETABLE — comparaison visuelle des librairies d'icônes.
 * À supprimer une fois la décision prise (avec la dépendance non retenue).
 * Route : /icons-poc
 */

import {
  MapPin as LuMapPin,
  ShoppingCart as LuCart,
  Tag as LuTag,
  Flame as LuFlame,
  Briefcase as LuBriefcase,
  FileText as LuFile,
  Phone as LuPhone,
} from 'lucide-react'

import {
  MapPin as PhMapPin,
  ShoppingCart as PhCart,
  Tag as PhTag,
  Flame as PhFlame,
  Briefcase as PhBriefcase,
  FileText as PhFile,
  Phone as PhPhone,
} from '@phosphor-icons/react'

import {
  IconMapPin,
  IconShoppingCart,
  IconTag,
  IconFlame,
  IconBriefcase,
  IconFileText,
  IconPhone,
} from '@tabler/icons-react'

import {
  MapPinIcon,
  ShoppingCartIcon,
  TagIcon,
  FireIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'

// Concepts de la home, dans l'ordre, avec la couleur de pastille (alternance teal/navy)
const rows = [
  { label: 'Revendeurs', tone: 'primary' as const, lu: LuMapPin, ph: PhMapPin, tb: IconMapPin, he: MapPinIcon },
  { label: 'Commander', tone: 'navy' as const, lu: LuCart, ph: PhCart, tb: IconShoppingCart, he: ShoppingCartIcon },
  { label: 'Promotions', tone: 'primary' as const, lu: LuTag, ph: PhTag, tb: IconTag, he: TagIcon },
  { label: 'Produits', tone: 'navy' as const, lu: LuFlame, ph: PhFlame, tb: IconFlame, he: FireIcon },
  { label: 'Partenaire', tone: 'primary' as const, lu: LuBriefcase, ph: PhBriefcase, tb: IconBriefcase, he: BriefcaseIcon },
  { label: 'Documents', tone: 'navy' as const, lu: LuFile, ph: PhFile, tb: IconFileText, he: DocumentTextIcon },
  { label: 'Assistance', tone: 'primary' as const, lu: LuPhone, ph: PhPhone, tb: IconPhone, he: PhoneIcon },
]

const columns = [
  { key: 'lucide', title: 'Lucide', note: 'Actuel · outline fin' },
  { key: 'phosphor', title: 'Phosphor', note: 'regular' },
  { key: 'phosphor-bold', title: 'Phosphor', note: 'bold' },
  { key: 'tabler', title: 'Tabler', note: 'couverture large' },
  { key: 'heroicons', title: 'Heroicons', note: 'déjà installé' },
]

function Pastille({ tone, children }: { tone: 'primary' | 'navy'; children: React.ReactNode }) {
  const bg = tone === 'primary' ? 'bg-primary/10' : 'bg-navy/10'
  return (
    <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
      {children}
    </div>
  )
}

export default function IconsPocPage() {
  const iconColor = (tone: 'primary' | 'navy') => (tone === 'primary' ? 'text-primary' : 'text-navy')

  return (
    <main className="max-w-6xl mx-auto px-6 py-10" style={{ paddingTop: 90 }}>
      <h1 className="text-2xl font-semibold font-display tracking-tight text-neutral-900 mb-2">
        Comparaison d'icônes — Vito home
      </h1>
      <p className="text-sm text-neutral-600 mb-8 max-w-2xl">
        Mêmes concepts que les cartes de la home, mêmes pastilles teal/navy, taille 28&nbsp;px,
        trait 2. Seule la <strong>forme du glyphe</strong> change d'une colonne à l'autre. Phosphor
        est montré en deux graisses (regular / bold) pour illustrer son atout.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-3">
                Concept
              </th>
              {columns.map(c => (
                <th key={c.key} className="text-center px-3">
                  <div className="text-sm font-semibold font-display text-neutral-900">{c.title}</div>
                  <div className="text-[11px] text-neutral-500">{c.note}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const Lu = row.lu
              const Ph = row.ph
              const Tb = row.tb
              const He = row.he
              const col = iconColor(row.tone)
              return (
                <tr key={row.label}>
                  <td className="text-sm font-medium text-neutral-700 px-3 whitespace-nowrap">
                    {row.label}
                  </td>
                  {/* Lucide */}
                  <td className="px-3">
                    <div className="flex justify-center">
                      <Pastille tone={row.tone}>
                        <Lu className={`w-7 h-7 ${col}`} strokeWidth={2} />
                      </Pastille>
                    </div>
                  </td>
                  {/* Phosphor regular */}
                  <td className="px-3">
                    <div className="flex justify-center">
                      <Pastille tone={row.tone}>
                        <Ph className={col} size={28} weight="regular" />
                      </Pastille>
                    </div>
                  </td>
                  {/* Phosphor bold */}
                  <td className="px-3">
                    <div className="flex justify-center">
                      <Pastille tone={row.tone}>
                        <Ph className={col} size={28} weight="bold" />
                      </Pastille>
                    </div>
                  </td>
                  {/* Tabler */}
                  <td className="px-3">
                    <div className="flex justify-center">
                      <Pastille tone={row.tone}>
                        <Tb className={col} size={28} stroke={2} />
                      </Pastille>
                    </div>
                  </td>
                  {/* Heroicons */}
                  <td className="px-3">
                    <div className="flex justify-center">
                      <Pastille tone={row.tone}>
                        <He className={`w-7 h-7 ${col}`} />
                      </Pastille>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-400 mt-8">
        Page de démonstration temporaire — sera supprimée après le choix, avec la librairie non retenue.
      </p>
    </main>
  )
}
