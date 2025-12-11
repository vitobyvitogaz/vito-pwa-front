'use client'

import { useRouter } from 'next/navigation'
import {
  MapPinIcon,
  ShoppingCartIcon,
  SparklesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid'
import {
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { hapticFeedback } from '@/lib/utils/haptic'

export const MainButtons: React.FC = () => {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  const buttons = [
    {
      id: 'resellers',
      title: 'Trouver un revendeur',
      description: 'Géolocalisation en temps réel',
      icon: MapPinIcon,
      href: '/fr/revendeurs',
      color: 'primary',
      colorClass: 'text-primary-500',
      bgClass: 'bg-primary-50 dark:bg-primary-900/20',
      hoverBg: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-500',
    },
    {
      id: 'order',
      title: 'Commander',
      description: 'Livraison express à domicile',
      icon: ShoppingCartIcon,
      href: '/fr/commander',
      color: 'accent',
      colorClass: 'text-accent-500',
      bgClass: 'bg-accent-50 dark:bg-accent-900/20',
      hoverBg: 'bg-accent-100 dark:bg-accent-900/30',
      iconColor: 'text-accent-500',
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Offres et réductions exclusives',
      icon: SparklesIcon,
      href: '/fr/promotions',
      color: 'secondary',
      colorClass: 'text-secondary-500',
      bgClass: 'bg-secondary-50 dark:bg-secondary-900/20',
      hoverBg: 'bg-secondary-100 dark:bg-secondary-900/30',
      iconColor: 'text-secondary-500',
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'PAMF, guides et ressources',
      icon: DocumentTextIcon,
      href: '/fr/documents',
      color: 'neutral',
      colorClass: 'text-neutral-700 dark:text-neutral-300',
      bgClass: 'bg-neutral-50 dark:bg-neutral-900/20',
      hoverBg: 'bg-neutral-100 dark:bg-neutral-900/30',
      iconColor: 'text-neutral-600 dark:text-neutral-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
      {buttons.map((button, index) => {
        const Icon = button.icon
        const isActive = activeId === button.id
        
        return (
          <button
            key={button.id}
            onClick={() => {
              hapticFeedback('light')
              router.push(button.href)
            }}
            onMouseDown={() => setActiveId(button.id)}
            onMouseUp={() => setActiveId(null)}
            onMouseLeave={() => setActiveId(null)}
            onTouchStart={() => setActiveId(button.id)}
            onTouchEnd={() => setActiveId(null)}
            className={`
              group relative overflow-hidden
              bg-white dark:bg-dark-surface
              rounded-xl
              p-6
              text-left
              transition-all duration-300
              border border-neutral-200 dark:border-dark-border
              hover:border-neutral-300 dark:hover:border-neutral-600
              ${isActive ? 'scale-[0.99] bg-neutral-50 dark:bg-neutral-900/30' : ''}
            `}
            style={{
              animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Effet de fond subtil au survol - style Tesla */}
            <div 
              className={`
                absolute inset-0
                ${button.bgClass}
                transition-all duration-500
                opacity-0 group-hover:opacity-100
                ${isActive ? 'opacity-100' : ''}
              `}
            />

            <div className="relative z-10 flex items-center gap-5">
              {/* Icône minimaliste Tesla */}
              <div className={`
                flex-shrink-0
                w-12 h-12
                rounded-lg
                ${button.bgClass}
                flex items-center justify-center
                transition-all duration-300
                group-hover:${button.hoverBg}
                ${isActive ? button.hoverBg : ''}
              `}>
                <Icon 
                  className={`
                    w-6 h-6
                    transition-all duration-300
                    ${button.iconColor}
                    ${isActive ? 'scale-105' : ''}
                  `}
                />
              </div>

              {/* Contenu texte - typographie Tesla */}
              <div className="flex-1">
                <h3 className={`
                  text-xl font-semibold mb-2
                  transition-colors duration-300
                  text-neutral-900 dark:text-white
                  group-hover:${button.colorClass}
                  ${isActive ? button.colorClass : ''}
                `}>
                  {button.title}
                </h3>
                
                <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                  {button.description}
                </p>
                
                {/* Lien discret style Tesla */}
                <div className="flex items-center gap-1">
                  <span className={`
                    text-sm font-medium
                    transition-colors duration-300
                    text-neutral-700 dark:text-neutral-300
                    group-hover:${button.colorClass}
                    ${isActive ? button.colorClass : ''}
                  `}>
                    Découvrir
                  </span>
                  <ArrowRightIcon className={`
                    w-4 h-4
                    transition-all duration-300
                    text-neutral-500 dark:text-neutral-500
                    group-hover:${button.colorClass}
                    group-hover:translate-x-1
                    ${isActive ? button.colorClass + ' translate-x-1' : ''}
                  `} strokeWidth={2} />
                </div>
              </div>
              
              {/* Flèche Tesla (discrete) */}
              <ArrowRightIcon className={`
                w-5 h-5
                transition-all duration-300
                text-neutral-400 dark:text-neutral-500
                group-hover:${button.colorClass}
                group-hover:translate-x-1
                opacity-0 group-hover:opacity-100
                ${isActive ? button.colorClass + ' translate-x-1 opacity-100' : ''}
              `} strokeWidth={2} />
            </div>

            {/* SUPPRIMÉ : Pas de bordure/ombre en bas */}
            {/* SUPPRIMÉ : Pas d'effet de brillance */}
          </button>
        )
      })}
    </div>
  )
}