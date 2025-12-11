'use client'

import { TruckIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/solid'

export const DeliveryInfo: React.FC = () => {
  const infos = [
    {
      icon: TruckIcon,
      title: 'Zones de livraison',
      items: [
        'Antananarivo (toutes zones)',
        'Antsirabe',
        'Toamasina',
        'Autres villes : nous consulter',
      ],
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: ClockIcon,
      title: 'Horaires de livraison',
      items: [
        'Lundi - Samedi : 8h - 18h',
        'Dimanche : 8h - 13h',
        'Livraison express : +2h',
      ],
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: CreditCardIcon,
      title: 'Modes de paiement',
      items: [
        'Espèces à la livraison',
        'Mobile Money (MVola, Orange Money)',
        'Virement bancaire',
      ],
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ]

  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-dark-border shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-6 font-display">
        Informations de livraison
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {infos.map((info, index) => {
          const Icon = info.icon
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`${info.bg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {info.title}
                </h3>
              </div>
              <ul className="space-y-2 ml-15">
                {info.items.map((item, i) => (
                  <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}