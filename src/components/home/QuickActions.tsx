'use client'

import { Phone, MapPin, ChevronRight, Package, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { hapticFeedback } from '@/lib/utils/haptic'

const GasBottleIcon = ({ className, strokeWidth }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2h4" />
    <path d="M12 2v2" />
    <path d="M8 6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
    <path d="M8 10h8" />
    <path d="M8 14h8" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
)

type ActionItem = {
  id: string
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  bg: string
  border: string
  action: () => void
}

export const QuickActions: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const actions: ActionItem[] = [
    {
      id: 'position',
      icon: MapPin,
      title: 'Ma position',
      subtitle: 'Activer GPS',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-200 dark:border-violet-800',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Position:', position.coords)
              router.push(`/${locale}/revendeurs`)
            },
            (error) => console.error('Erreur GPS:', error)
          )
        }
      },
    },
    {
      id: 'produits',
      icon: GasBottleIcon,
      title: 'Produits',
      subtitle: 'Notre gamme',
      color: 'text-primary dark:text-primary',
      bg: 'bg-primary/10 dark:bg-primary/20',
      border: 'border-primary/20 dark:border-primary/30',
      action: () => router.push(`/${locale}/produits`),
    },
    {
      id: 'revendeur',
      icon: Briefcase,
      title: 'Devenir revendeur/Client professionnel',
      subtitle: 'Rejoignez notre reseau',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      action: () => router.push(`/${locale}/contact-pro`),
    },
    {
      id: 'assistance',
      icon: Phone,
      title: 'Assistance',
      subtitle: 'Contactez-nous',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      action: () => router.push(`/${locale}/assistance`),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-xl font-medium text-neutral-900 dark:text-white mb-5 tracking-tight">
        Actions rapides
      </p>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          const isHovered = hoveredId === action.id
          return (
            <button
              key={action.id}
              onClick={() => {
                hapticFeedback('light')
                action.action()
              }}
              onMouseEnter={() => setHoveredId(action.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-xl p-5 text-left transition-all duration-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
              style={{
                animationDelay: `${index * 0.05}s`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`relative flex-shrink-0 ${action.bg} ${action.border} w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300`}>
                  <Icon className={`w-6 h-6 ${action.color} transition-all duration-300`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-neutral-900 dark:text-white mb-1 tracking-tight">
                    {action.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {action.subtitle}
                  </p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-neutral-400 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                  strokeWidth={1.5}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}