'use client'

import { Shield, Truck, Clock, Sparkle as Sparkles } from '@phosphor-icons/react'
import { useState } from 'react'

export const TrustBadges: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const badges = [
    {
      icon: Shield,
      title: '69%',
      subtitle: 'de parts de marché',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      icon: Truck,
      title: '24h',
      subtitle: 'Livraison express',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800'
    },
    {
      icon: Clock,
      title: '25+ ans',
      subtitle: 'd\'expérience',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800'
    },
    {
      icon: Sparkles,
      title: '+100',
      subtitle: 'points de vente',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800'
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        
        return (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 text-center transition-all duration-300"
            style={{ 
              animationDelay: `${index * 0.05}s`,
              transform: hoveredIndex === index ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            {/* Icône */}
            <div className={`
              ${badge.bg}
              w-12 h-12 sm:w-14 sm:h-14
              rounded-xl
              flex items-center justify-center
              mx-auto mb-4
              transition-all duration-300
              border ${badge.border}
            `}>
              <Icon 
                className={`w-6 h-6 sm:w-7 sm:h-7 ${badge.color} transition-all duration-300`} 
                strokeWidth={1.5}
              />
            </div>

            {/* Texte */}
            <p className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
              {badge.title}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {badge.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}