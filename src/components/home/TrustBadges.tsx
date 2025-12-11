'use client'

import { ShieldCheckIcon, TruckIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/solid'

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: ShieldCheckIcon,
      title: '69%',
      subtitle: 'de parts de marché',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      icon: TruckIcon,
      title: '24h',
      subtitle: 'Livraison express',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: ClockIcon,
      title: '25+ ans',
      subtitle: 'd\'expérience',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: SparklesIcon,
      title: '+100',
      subtitle: 'points de vente',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  return (
    //<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animation: `slideUp 0.6s ease-out ${index * 0.1}s both` }}
          >
            <div className={`${badge.bg} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-7 h-7 ${badge.color}`} />
            </div>
            <p className="text-xl font-bold text-neutral-600 dark:text-white mb-1">{badge.title}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{badge.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}