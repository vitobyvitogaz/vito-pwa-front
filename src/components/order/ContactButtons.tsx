'use client'

import { useState } from 'react'
import { PhoneIcon } from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'

const VITOGAZ_PHONE = '+261340000000' // À remplacer par le vrai numéro
const VITOGAZ_WHATSAPP = '+261340000000' // À remplacer

export const ContactButtons: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleWhatsApp = () => {
    hapticFeedback('medium')
    const message = encodeURIComponent("Bonjour, je souhaite commander du gaz Vitogaz via l'application Vito.")
    window.open(`https://wa.me/${VITOGAZ_WHATSAPP.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const handleCall = () => {
    hapticFeedback('medium')
    window.location.href = `tel:${VITOGAZ_PHONE}`
  }

  const buttons = [
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Réponse rapide',
      icon: () => (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      onClick: handleWhatsApp,
      gradient: 'from-green-600 via-green-700 to-emerald-800',
      color: '#25D366',
    },
    {
      id: 'call',
      title: 'Appeler',
      subtitle: 'Assistance directe',
      icon: PhoneIcon,
      onClick: handleCall,
      gradient: 'from-blue-600 via-blue-700 to-indigo-800',
      color: '#3B82F6',
    },
  ]

  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-dark-border shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2 font-display">
        Contact rapide
      </h2>
      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
        Commandez directement par WhatsApp ou appelez-nous
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {buttons.map((button) => {
          const Icon = button.icon
          const isHovered = hoveredId === button.id

          return (
            <button
              key={button.id}
              onClick={button.onClick}
              onMouseEnter={() => setHoveredId(button.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 text-left transition-all duration-500 border border-neutral-200 dark:border-dark-border hover:border-transparent"
              style={{
                boxShadow: isHovered
                  ? `0 20px 50px -15px ${button.color}30, 0 0 0 1px ${button.color}20`
                  : '0 4px 15px -2px rgba(0,0,0,0.08)',
              }}
            >
              {/* Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${button.gradient} transition-all duration-700`}
                style={{
                  opacity: isHovered ? 1 : 0,
                  filter: isHovered ? 'blur(0px)' : 'blur(8px)',
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Shine */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" style={{ transform: 'skewX(-20deg)' }} />
              </div>

              <div className="relative z-10 flex items-center gap-4">
                {/* Icône */}
                <div className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                  bg-neutral-50 dark:bg-neutral-800
                  group-hover:bg-white/20
                  flex items-center justify-center
                  transition-all duration-500
                  ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}
                  shadow-lg
                `}>
                  <Icon className="text-neutral-700 dark:text-neutral-300 group-hover:text-white transition-colors duration-500" />
                </div>

                {/* Texte */}
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-white transition-colors duration-500 mb-1">
                    {button.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-white/90 transition-colors duration-500">
                    {button.subtitle}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}