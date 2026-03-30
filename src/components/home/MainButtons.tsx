'use client'

import { useRouter } from 'next/navigation'
import { MapPin, ShoppingCart, Sparkles, FileText, ChevronRight } from 'lucide-react'
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
      pulse: false,
    },
    {
      id: 'order',
      title: 'Commander',
      // ── Corrigé : "Livré chez vous" → "Livraison à domicile" ──
      // Plus précis sur ce que la page propose réellement
      description: 'Livraison à domicile',
      icon: ShoppingCart,
      href: '/fr/commander',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      pulse: true,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Bonnes affaires du moment',
      icon: Sparkles,
      href: '/fr/promotions',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      pulse: false,
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Guides et conseils',
      icon: FileText,
      href: '/fr/documents',
      color: 'text-neutral-700 dark:text-neutral-300',
      bg: 'bg-neutral-100 dark:bg-neutral-800/50',
      border: 'border-neutral-200 dark:border-neutral-700',
      hover: 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      pulse: false,
    },
  ]

  return (
    <>
      <style>{`
        @keyframes vito-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .vito-pulse-ring {
          animation: vito-pulse-ring 2.5s ease-out infinite;
        }
      `}</style>

      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        {buttons.map((button, index) => {
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
                rounded-xl p-5 text-left aspect-square
                transition-all duration-300
                border border-neutral-200/60 dark:border-neutral-800
                hover:border-primary/40
                shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60
                hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/15
                ${button.hover}
                ${activeId === button.id ? 'scale-95' : ''}
                animate-slide-up
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="relative w-14 h-14">
                  {button.pulse && activeId !== button.id && (
                    <div className={`vito-pulse-ring absolute inset-0 rounded-xl ${button.bg} border ${button.border}`} />
                  )}
                  <div className={`
                    w-14 h-14 rounded-xl ${button.bg} ${button.border}
                    flex items-center justify-center
                    transition-all duration-300 relative z-10
                    ${activeId === button.id ? 'scale-95' : ''}
                  `}>
                    <Icon className={`w-7 h-7 ${button.color}`} strokeWidth={2} />
                  </div>
                </div>

                <div className="space-y-3 p-3 max-w-full overflow-hidden">
                  <h3 className="text-lg font-semibold font-display text-neutral-900 dark:text-white leading-snug tracking-tight truncate">
                    {button.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
                    {button.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`text-sm font-display font-semibold ${button.pulse ? 'text-blue-600 dark:text-blue-400' : 'text-primary'}`}>
                      Découvrir
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 ${button.pulse ? 'text-blue-600 dark:text-blue-400' : 'text-primary'} transition-transform duration-300 group-hover:translate-x-1`}
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