'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BellOff, Tag, Building2, Truck, Megaphone,
  ChevronRight, Sparkles, Clock,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface StoredNotification {
  id:         number
  title:      string
  body:       string
  notifType:  string
  url:        string
  receivedAt: string
}

const TYPE_CONFIG: Record<string, {
  icon:  React.ReactNode
  color: string
  bg:    string
  label: string
}> = {
  PROMOTIONS: {
    icon:  <Tag className="w-4 h-4" strokeWidth={1.5} />,
    color: 'text-amber-600 dark:text-amber-400',
    bg:    'bg-amber-100 dark:bg-amber-900/30',
    label: 'Promotion',
  },
  RESELLERS: {
    icon:  <Building2 className="w-4 h-4" strokeWidth={1.5} />,
    color: 'text-primary',
    bg:    'bg-primary/10',
    label: 'Nouveau revendeur',
  },
  DELIVERY: {
    icon:  <Truck className="w-4 h-4" strokeWidth={1.5} />,
    color: 'text-blue-600 dark:text-blue-400',
    bg:    'bg-blue-100 dark:bg-blue-900/30',
    label: 'Livraison',
  },
  BROADCAST: {
    icon:  <Megaphone className="w-4 h-4" strokeWidth={1.5} />,
    color: 'text-purple-600 dark:text-purple-400',
    bg:    'bg-purple-100 dark:bg-purple-900/30',
    label: 'Info Vitogaz',
  },
  FEEDBACK: {
    icon:  <Sparkles className="w-4 h-4" strokeWidth={1.5} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg:    'bg-emerald-100 dark:bg-emerald-900/30',
    label: 'Feedback',
  },
}

const fmtRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return "À l'instant"
  if (mins  < 60) return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days  < 7)  return `Il y a ${days}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<StoredNotification[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Marquer comme lues
    try { localStorage.setItem('push-unread-count', '0') } catch {}
    window.dispatchEvent(new Event('push-unread-cleared'))

    // Charger l'historique (max 10)
    try {
      const raw = localStorage.getItem('push-notifications-history')
      const all: StoredNotification[] = raw ? JSON.parse(raw) : []
      setNotifications(all.slice(0, 10))
    } catch {
      setNotifications([])
    }
  }, [])

  const handleClick = (notif: StoredNotification) => {
    hapticFeedback('light')
    if (notif.url && notif.url !== '/fr') {
      router.push(notif.url)
    }
  }

  const handleClear = () => {
    hapticFeedback('medium')
    localStorage.removeItem('push-notifications-history')
    setNotifications([])
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl py-6">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-sans">
              Notifications
            </h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-sans"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Liste */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <BellOff className="w-7 h-7 text-neutral-400" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-neutral-600 dark:text-neutral-400 font-sans">
              Aucune notification
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 font-sans mt-1">
              Vos alertes apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 shadow-sm">
            {notifications.map((notif, i) => {
              const config = TYPE_CONFIG[notif.notifType] || TYPE_CONFIG.BROADCAST
              const isClickable = notif.url && notif.url !== '/fr'

              return (
                <button
                  key={notif.id || i}
                  onClick={() => handleClick(notif)}
                  disabled={!isClickable}
                  className="w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors disabled:cursor-default"
                >
                  {/* Icône type */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white font-sans leading-snug">
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3 text-neutral-400" strokeWidth={1.5} />
                        <span className="text-[10px] text-neutral-400 font-sans whitespace-nowrap">
                          {fmtRelative(notif.receivedAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5 leading-snug line-clamp-2">
                      {notif.body}
                    </p>
                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Chevron si cliquable */}
                  {isClickable && (
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-3" strokeWidth={1.5} />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Lien paramètres */}
        <button
          onClick={() => router.push('/fr/parametres')}
          className="mt-6 w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors shadow-sm"
        >
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
            Gérer les préférences de notification
          </p>
          <ChevronRight className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
        </button>

      </div>
    </main>
  )
}