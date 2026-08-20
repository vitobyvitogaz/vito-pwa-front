'use client'

/**
 * PAGE JETABLE — décision "bouteille de gaz" pour la migration Phosphor.
 * À supprimer une fois le choix figé. Route : /icons-poc
 */

import { GasBottleIcon } from '@/components/icons/GasBottleIcon'
import { GasCan, GasPump } from '@phosphor-icons/react'

const options = [
  {
    key: 'custom',
    label: 'Bouteille custom (actuelle)',
    note: 'SVG maison — icône métier signature',
    render: (cls: string) => <GasBottleIcon className={cls} />,
  },
  {
    key: 'gascan',
    label: 'Phosphor · GasCan',
    note: 'Jerrican — set 100% Phosphor',
    render: (cls: string) => <GasCan className={cls} />,
  },
  {
    key: 'gaspump',
    label: 'Phosphor · GasPump',
    note: 'Pompe à essence — set 100% Phosphor',
    render: (cls: string) => <GasPump className={cls} />,
  },
]

export default function IconsBottlePocPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10" style={{ paddingTop: 90 }}>
      <h1 className="text-2xl font-semibold font-display tracking-tight text-neutral-900 mb-2">
        Icône « bouteille de gaz » — choix
      </h1>
      <p className="text-sm text-neutral-600 mb-10 max-w-2xl">
        Trois options pour la carte « Produits », affichées comme dans l'app :
        en pastille navy (taille carte, 28&nbsp;px) et en grand (page Produits, 40&nbsp;px sur fond navy).
        Toutes les autres icônes de l'app sont déjà en Phosphor <strong>regular</strong> —
        parcours le reste du Preview pour les voir en contexte.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {options.map(opt => (
          <div key={opt.key} className="rounded-2xl border border-neutral-200 p-6 flex flex-col items-center text-center gap-5">
            {/* Pastille navy — taille carte */}
            <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center">
              {opt.render('w-7 h-7 text-navy')}
            </div>
            {/* Grand format sur fond navy — comme la page Produits */}
            <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center">
              {opt.render('w-10 h-10 text-white')}
            </div>
            <div>
              <div className="text-sm font-semibold font-display text-neutral-900">{opt.label}</div>
              <div className="text-xs text-neutral-500 mt-1">{opt.note}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400 mt-10">
        Page temporaire — supprimée après le choix.
      </p>
    </main>
  )
}
