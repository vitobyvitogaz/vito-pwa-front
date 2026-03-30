'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MapPin, ShoppingCart, Sparkles, BookOpen, Bell, Settings } from 'lucide-react'
import { InstallButton } from '@/components/shared/InstallButton'
import { getUnreadCount, clearUnreadCount } from '@/lib/webpush'

const navItems = [
  { href: '/fr/revendeurs', label: 'Revendeurs', icon: MapPin },
  { href: '/fr/commander',  label: 'Commander',  icon: ShoppingCart },
  { href: '/fr/promotions', label: 'Promotions', icon: Sparkles },
  { href: '/fr/documents',  label: 'Documents',  icon: BookOpen },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const router   = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(getUnreadCount())

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_RECEIVED') {
        // Incrémenter le compteur
        const next = getUnreadCount() + 1
        localStorage.setItem('push-unread-count', String(next))
        setUnreadCount(next)

        // Stocker la notification dans l'historique (max 20)
        const notif = event.data.notification
        if (notif) {
          try {
            const stored = JSON.parse(localStorage.getItem('push-notifications-history') || '[]')
            const updated = [notif, ...stored].slice(0, 20)
            localStorage.setItem('push-notifications-history', JSON.stringify(updated))
          } catch {}
        }
      }
    }

    const handleCleared = () => setUnreadCount(0)

    navigator.serviceWorker?.addEventListener('message', handleMessage)
    window.addEventListener('push-unread-cleared', handleCleared)

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
      window.removeEventListener('push-unread-cleared', handleCleared)
    }
  }, [])

  const handleBellClick = () => {
    clearUnreadCount()
    setUnreadCount(0)
    router.push('/fr/notifications')
  }

  const isParametres = pathname.startsWith('/fr/parametres')

  return (
    <header className="fixed top-0 left-0 right-0 z-[1001] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/60 dark:border-dark-border/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">

          {/* Logo */}
          <Link href="/fr" className="flex items-center transition-all duration-300 hover:opacity-90 flex-shrink-0">
            <Image src="/logo-vito-light.jpg" alt="Vito by Vitogaz Madagascar"
              width={120} height={67} priority
              className="h-auto w-auto max-h-[50px] object-contain block dark:hidden" />
            <Image src="/logo-vito-dark.png" alt="Vito by Vitogaz Madagascar"
              width={120} height={67} priority
              className="h-auto w-auto max-h-[50px] object-contain hidden dark:block" />
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold font-display transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-border/20 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              )
            })}

            {/* ── Lien Paramètres desktop ── */}
            <Link href="/fr/parametres"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold font-display transition-all duration-200 ${
                isParametres
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-border/20 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              Paramètres
            </Link>
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">

            {/* Cloche avec badge */}
            <button
              onClick={handleBellClick}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center"
              aria-label="Notifications et paramètres"
            >
              <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bouton Installer — mobile et desktop */}
            <InstallButton />

          </div>
        </div>
      </div>
    </header>
  )
}