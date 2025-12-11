'use client'

import { PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { hapticFeedback } from '@/lib/utils/haptic'  // ← AJOUTER CETTE LIGNE

export const QuickActions: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const actions = [
    {
      id: 'assistance',
      icon: PhoneIcon,
      title: 'Assistance',
      subtitle: 'Contactez-nous',
      gradient: 'from-blue-600 via-blue-700 to-indigo-800',
      color: '#3B82F6',
      lightBg: 'bg-blue-50',
      darkBg: 'bg-blue-950',
      phone: '+261340000000',
    },
    {
      id: 'position',
      icon: MapPinIcon,
      title: 'Ma position',
      subtitle: 'Activer GPS',
      gradient: 'from-violet-600 via-purple-700 to-fuchsia-800',
      color: '#8B5CF6',
      lightBg: 'bg-violet-50',
      darkBg: 'bg-violet-950',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Position:', position.coords)
              // Rediriger vers la page revendeurs avec la position
              window.location.href = '/fr/revendeurs'
            },
            (error) => console.error('Erreur GPS:', error)
          )
        }
      },
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4 sm:mb-6 px-2 font-display">
        Actions rapides
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          const isHovered = hoveredId === action.id

          return (
            <button
              key={action.id}
                onClick={() => {
                  hapticFeedback('light')
                  if (action.action) action.action()
              }}
            onMouseEnter={() => setHoveredId(action.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left transition-all duration-500 ease-out border border-neutral-200 dark:border-dark-border hover:border-transparent"
              style={{
                animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                boxShadow: isHovered
                  ? `0 20px 50px -15px ${action.color}30, 0 0 0 1px ${action.color}20`
                  : '0 4px 15px -2px rgba(0,0,0,0.08)',
              }}
            >
              {/* Gradient au hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} transition-all duration-700`}
                style={{
                  opacity: isHovered ? 1 : 0,
                  filter: isHovered ? 'blur(0px)' : 'blur(8px)',
                }}
              />

              {/* Overlay contraste */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  style={{ transform: 'skewX(-20deg)' }}
                />
              </div>

              <div className="relative z-10">
                {/* Icône */}
                <div
                  className={`
                  relative
                  ${action.lightBg} dark:${action.darkBg}
                  group-hover:bg-gradient-to-br group-hover:from-white/30 group-hover:to-white/10
                  backdrop-blur-sm
                  w-10 h-10 rounded-2xl flex items-center justify-center
                  mb-2
                  transition-all duration-500
                  ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
                  shadow-lg group-hover:shadow-2xl
                  border border-white/20 group-hover:border-white/40
                `}
                >
                  {/* Gradient intérieur */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <Icon
                    className="relative z-10 w-7 h-7 text-neutral-700 dark:text-neutral-300 group-hover:text-white transition-all duration-500"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                </div>

                {/* Texte */}
                <p className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-white transition-colors duration-500 mb-1 drop-shadow-none group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  {action.title}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-white/90 transition-colors duration-500 drop-shadow-none group-hover:drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  {action.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}