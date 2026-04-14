'use client'

import { Phone, MapPin, ChevronRight, Briefcase, Mail, X, MessageCircle } from 'lucide-react'
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

// ── Modal Assistance ──────────────────────────────────────────────────────────
const AssistanceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const contacts = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: '020 22 364 64',
      sub: 'Lun-Ven 8h-17h · Sam 8h-13h',
      href: 'tel:+261202236464',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'relationclient@vitogaz.mg',
      sub: 'Réponse sous 24h',
      href: 'mailto:relationclient@vitogaz.mg',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: MessageCircle,
      label: 'Messenger',
      value: 'Vitogaz Madagascar',
      sub: 'Chat Facebook',
      href: 'https://m.me/vitogazmadagascar',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: '122, rue Rainandriamampandry',
      sub: 'Faravohitra — B.P. 3984',
      href: 'https://maps.google.com/?q=122+rue+Rainandriamampandry+Faravohitra+Antananarivo',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-dark-surface rounded-t-3xl sm:rounded-2xl shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle mobile */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-white font-display">Assistance</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Vitogaz Madagascar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Contacts */}
        <div className="px-4 py-4 space-y-3">
          {contacts.map((c, i) => {
            const Icon = c.icon
            return (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={() => hapticFeedback('light')}
                className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-200 active:scale-[0.98] hover:shadow-sm bg-white dark:bg-dark-surface"
              >
                <div className={`w-11 h-11 rounded-full ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.color}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans mb-0.5">{c.label}</p>
                  <p className={`text-sm font-semibold ${c.color} font-sans truncate`}>{c.value}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">{c.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" strokeWidth={1.5} />
              </a>
            )
          })}
        </div>

        {/* Bouton fermer */}
        <div className="px-4 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm font-sans active:scale-95 transition-transform"
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