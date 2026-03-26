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
  { href: '/fr/revendeurs', label: 'Revendeurs', icon: MapPin },
  { href: '/fr/commander',  label: 'Commander',  icon: GasBottleIcon as any },
  { href: '/fr/promotions', label: 'Promos',     icon: Sparkles },
  { href: '/fr/documents',  label: 'Guides',     icon: BookOpen },
  { href: '/fr/parametres', label: 'Paramètres', icon: Settings },
]

export const BottomNav: React.FC = () => {
  const pathname = usePathname()

  // ── InstallPrompt gardé mais déplacé en arrière-plan ──────────────────────
  // Le prompt natif Android se déclenche toujours si disponible,
  // mais n'est plus visible dans la bottom nav
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-[1002] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-neutral-200/60 dark:border-dark-border/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => hapticFeedback('light')}
                className="flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
              >
                <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-primary/10 dark:bg-primary/20' : ''
                }`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
                <span className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'
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