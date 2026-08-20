'use client'

import { useState } from 'react'
import { Phone, ChatText as MessageSquare } from '@phosphor-icons/react'
import { hapticFeedback } from '@/lib/utils/haptic'

const VITOGAZ_PHONE = '+261340000000'
const VITOGAZ_WHATSAPP = '+261340000000'

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
      icon: MessageSquare,
      onClick: handleWhatsApp,
      color: 'text-emerald-600',
      hoverColor: 'bg-emerald-600',
    },
    {
      id: 'call',
      title: 'Appeler',
      subtitle: 'Assistance directe',
      icon: Phone,
      onClick: handleCall,
      color: 'text-primary',
      hoverColor: 'bg-primary',
    },
  ]

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 font-sans">
        Contact rapide
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 font-sans">
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
              className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-6 text-left transition-all duration-300 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50"
              style={{
                boxShadow: isHovered 
                  ? '0 20px 40px -20px rgba(0, 139, 127, 0.15), 0 0 0 1px rgba(0, 139, 127, 0.05)'
                  : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
              }}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 ${button.hoverColor} transition-opacity duration-300`}
                style={{ opacity: isHovered ? 0.1 : 0 }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl
                  ${isHovered ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800'}
                  flex items-center justify-center
                  transition-all duration-300
                  ${isHovered ? 'scale-110' : 'scale-100'}
                  border border-neutral-200 dark:border-neutral-700
                  group-hover:border-white/30
                `}>
                  <Icon className={`w-6 h-6 ${isHovered ? 'text-white' : button.color} transition-colors duration-300`} strokeWidth={1.5} />
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-white transition-colors duration-300 mb-1 font-sans">
                    {button.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-white/90 transition-colors duration-300 font-sans">
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