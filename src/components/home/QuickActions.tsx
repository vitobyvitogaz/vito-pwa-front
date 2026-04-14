'use client'

import { Phone, MapPin, ChevronRight, Briefcase, Mail, X } from 'lucide-react'
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

// ── Icône Messenger officielle ────────────────────────────────────────────────
const MessengerIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.824 1.266 5.355 3.293 7.1v3.291l3.104-1.701A10.815 10.815 0 0 0 12 20.517c5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.018 12.465-2.545-2.668-4.996 2.668 5.478-5.793 2.606 2.668 4.935-2.668-5.478 5.793z"/>
  </svg>
)

// ── Modal Assistance ──────────────────────────────────────────────────────────
const AssistanceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const contacts = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: '020 22 364 64',
      href: 'tel:+261202236464',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'relationclient@vitogaz.mg',
      href: 'mailto:relationclient@vitogaz.mg',
    },
    {
      icon: MessengerIcon,
      label: 'Messenger',
      value: 'vitogazmadagascar',
      href: 'https://m.me/vitogazmadagascar',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: '122, rue Rainandriamampandry — B.P. 3984',
      href: 'https://maps.google.com/?q=122+rue+Rainandriamampandry+Faravohitra+Antananarivo',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Conteneur — bottom sheet mobile / modal centré desktop */}
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl
          sm:animate-[modalIn_0.2s_ease-out]"
        style={{
          backgroundColor: '#008B7F',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>

        {/* Handle — mobile uniquement */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
        </div>

        {/* Bouton fermer */}
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <X className="w-4 h-4 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Titre */}
        <div className="flex flex-col items-center pb-6 pt-1 sm:pt-2 px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase font-display">
            Assistance
          </h2>
          <div style={{ width: 56, height: 4, backgroundColor: '#E53E3E', borderRadius: 2, marginTop: 10 }} />
          <p className="text-white/60 text-sm font-sans mt-3 text-center hidden sm:block">
            Vitogaz Madagascar — Leader du gaz depuis plus de 25 ans
          </p>
        </div>

        {/* Contacts — liste mobile / grille 2×2 desktop */}
        <div className="px-5 pb-6 sm:pb-8 sm:px-8">

          {/* Mobile : liste verticale */}
          <div className="flex flex-col gap-4 sm:hidden">
            {contacts.map((c, i) => {
              const Icon = c.icon
              return (
                <a
                  key={i}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={() => hapticFeedback('light')}
                  className="flex items-center gap-4 active:opacity-70 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F6C90E' }}>
                    <Icon className="w-5 h-5" style={{ color: '#008B7F' }} strokeWidth={2} />
                  </div>
                  <p className="text-white font-semibold text-sm font-sans truncate">{c.value}</p>
                </a>
              )
            })}
          </div>

          {/* Desktop : grille 2×2 */}
          <div className="hidden sm:grid grid-cols-2 gap-4">
            {contacts.map((c, i) => {
              const Icon = c.icon
              return (
                <a
                  key={i}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={() => hapticFeedback('light')}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 active:scale-95 hover:opacity-90 group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#F6C90E' }}>
                    <Icon className="w-7 h-7" style={{ color: '#008B7F' }} strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-sans mb-1">{c.label}</p>
                    <p className="text-white font-bold text-sm font-sans leading-snug">{c.value}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Bouton fermer — mobile uniquement */}
        <div className="px-5 pb-6 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full font-semibold text-sm font-sans active:scale-95 transition-transform"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── QuickActions ──────────────────────────────────────────────────────────────
type ActionItem = {
  id: string
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  bg: string
  action: () => void
}

export const QuickActions: React.FC = () => {
  const [hoveredId, setHoveredId]           = useState<string | null>(null)
  const [showAssistance, setShowAssistance] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1]

  const actions: ActionItem[] = [
    {
      id: 'position',
      icon: MapPin,
      title: 'Ma position',
      subtitle: 'Activer GPS',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => router.push(`/${locale}/revendeurs`),
            err => console.error('Erreur GPS:', err)
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
      action: () => router.push(`/${locale}/produits`),
    },
    {
      id: 'revendeur',
      icon: Briefcase,
      title: 'Devenir partenaire',
      subtitle: 'Rejoignez notre réseau',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      action: () => router.push(`/${locale}/contact-pro`),
    },
    {
      id: 'assistance',
      icon: Phone,
      title: 'Assistance',
      subtitle: '020 22 364 64',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      action: () => setShowAssistance(true),
    },
  ]

  return (
    <>
      {showAssistance && <AssistanceModal onClose={() => setShowAssistance(false)} />}

      <div className="max-w-7xl mx-auto">
        <p className="text-xl font-semibold font-display text-neutral-900 dark:text-white mb-5 tracking-tight">
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
                  <div className={`relative flex-shrink-0 ${action.bg} w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300`}>
                    <Icon className={`w-6 h-6 ${action.color}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold font-display text-neutral-900 dark:text-white mb-0.5 tracking-tight">
                      {action.title}
                    </p>
                    <p className={`text-sm font-sans ${action.id === 'assistance' ? `font-bold ${action.color}` : 'text-neutral-500 dark:text-neutral-400'}`}>
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
    </>
  )
}