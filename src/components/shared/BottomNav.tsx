'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Sparkles, BookOpen, Settings } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'
import { IOSInstallModal } from '@/components/shared/IOSInstallModal'

const GasBottleIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2h4" />
    <path d="M12 2v2" />
    <path d="M8 6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
    <path d="M8 10h8" />
    <path d="M8 14h8" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const navItems = [
  { href: '/fr/revendeurs', label: 'Revendeurs', icon: MapPin,               featured: true  },
  { href: '/fr/commander',  label: 'Commander',  icon: GasBottleIcon as any, featured: false },
  { href: '/fr/promotions', label: 'Promos',     icon: Sparkles,             featured: false },
  { href: '/fr/documents',  label: 'Guides',     icon: BookOpen,             featured: false },
  { href: '/fr/parametres', label: 'Paramètres', icon: Settings,             featured: false },
]

export const BottomNav: React.FC = () => {
  const pathname = usePathname()

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[1002] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-neutral-200/60 dark:border-dark-border/60 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            const isFeatured = item.featured

            // ── Revendeurs — traitement spécial ──────────────────────────────
            if (isFeatured) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => hapticFeedback('light')}
                  className="flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
                >
                  <div className={`
                    flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300
                    ${isActive
                      ? 'bg-primary shadow-md shadow-primary/30 dark:shadow-primary/20'
                      : 'bg-primary/15 dark:bg-primary/25'
                    }
                  `}>
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-primary'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className={`text-[10px] leading-none transition-colors duration-200 font-display ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-primary/70 dark:text-primary/60 font-medium'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            }

            // ── Autres items ─────────────────────────────────────────────────
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => hapticFeedback('light')}
                className="flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
              >
                <div className={`
                  flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300
                  ${isActive ? 'bg-primary/10 dark:bg-primary/20' : ''}
                `}>
                  <Icon
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'w-6 h-6 text-primary'
                        : 'w-5 h-5 text-neutral-500 dark:text-neutral-400'
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
                <span className={`text-[10px] leading-none transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-semibold font-display'
                    : 'text-neutral-500 dark:text-neutral-400 font-medium'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
    </>
  )
}