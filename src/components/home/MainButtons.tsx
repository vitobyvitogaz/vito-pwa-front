'use client'

import { useRouter } from 'next/navigation'
import { MapPin, ShoppingCart, Sparkle as Sparkles, CaretRight as ChevronRight } from '@phosphor-icons/react'
import { GasBottleIcon } from '@/components/icons/GasBottleIcon'
import { useState } from 'react'
import { hapticFeedback } from '@/lib/utils/haptic'

export const MainButtons: React.FC = () => {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  const buttons = [
    {
      id: 'resellers',
      title: 'Revendeurs',
      description: 'Près de chez vous',
      icon: MapPin,
      href: '/fr/revendeurs',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      hover: 'hover:bg-primary/20 dark:hover:bg-primary/20',
      pulse: true,
    },
    {
      id: 'order',
      title: 'Commander',
      description: 'Livraison à domicile',
      icon: ShoppingCart,
      href: '/fr/commander',
      color: 'text-navy',
      bg: 'bg-navy/10',
      border: 'border-navy/20',
      hover: 'hover:bg-navy/20 dark:hover:bg-navy/20',
      pulse: true,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Bonnes affaires du moment',
      icon: Sparkles,
      href: '/fr/promotions',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      hover: 'hover:bg-primary/20 dark:hover:bg-primary/20',
      pulse: true,
    },
    {
      id: 'produits',
      title: 'Produits',
      description: 'Notre gamme',
      icon: GasBottleIcon,
      href: '/fr/produits',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      hover: 'hover:bg-primary/20 dark:hover:bg-primary/20',
      pulse: true,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto animate-fade-in">
        {buttons.map((button) => {
          const Icon = button.icon

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
                group relative
                bg-white dark:bg-dark-surface
                rounded-2xl p-5 text-left
                transition-all duration-300
                border border-neutral-200/60 dark:border-neutral-800
                hover:border-primary/40
                shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60
                hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/15
                ${button.hover}
                ${activeId === button.id ? 'scale-95' : ''}
              `}
            >
              <div className="flex flex-col gap-4">
                <div className="relative w-14 h-14">
                  <div className={`
                    w-14 h-14 rounded-full ${button.bg} ${button.border}
                    flex items-center justify-center
                    transition-all duration-300 relative z-10
                    ${activeId === button.id ? 'scale-95' : ''}
                  `}>
                    <Icon className={`w-7 h-7 ${button.color}`} strokeWidth={2} />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-full overflow-hidden">
                  <h3 className="text-base sm:text-lg font-semibold font-display text-neutral-900 dark:text-white leading-snug tracking-tight truncate min-h-[24px] sm:min-h-[28px]">
                    {button.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2 h-8 sm:h-10">
                    {button.description}
                  </p>
                  <div className="hidden sm:flex items-center gap-2 pt-1">
                    <span className="text-sm font-display font-semibold text-primary">
                      Découvrir
                    </span>
                    <ChevronRight
                      className="w-4 h-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

