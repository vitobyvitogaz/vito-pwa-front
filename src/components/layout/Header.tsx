'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ShoppingCart, Sparkles, FileText, Menu, X } from 'lucide-react'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { InstallButton } from '@/components/shared/InstallButton'

const navItems = [
  { href: '/fr/revendeurs', label: 'Revendeurs', icon: MapPin },
  { href: '/fr/commander', label: 'Commander', icon: ShoppingCart },
  { href: '/fr/promotions', label: 'Promotions', icon: Sparkles },
  { href: '/fr/documents', label: 'Documents', icon: FileText },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/60 dark:border-dark-border/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">

          {/* Logo */}
          <Link href="/fr" className="flex items-center transition-all duration-300 hover:opacity-90 flex-shrink-0">
            <Image
              src="/logo-vito-light.jpg"
              alt="Vito by Vitogaz Madagascar"
              width={120}
              height={67}
              priority
              className="h-auto w-auto max-h-[50px] object-contain block dark:hidden"
            />
            <Image
              src="/logo-vito-dark.png"
              alt="Vito by Vitogaz Madagascar"
              width={120}
              height={67}
              priority
              className="h-auto w-auto max-h-[50px] object-contain hidden dark:block"
            />
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">

            {/* Bouton Installer - Desktop */}
            <div className="hidden sm:block">
              <InstallButton />
            </div>

            <div className="hidden sm:block h-6 w-px bg-neutral-300/40 dark:bg-dark-border/40" />

            {/* ThemeSwitcher */}
            <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors">
              <ThemeSwitcher />
            </div>

            {/* Bouton Installer - Mobile */}
            <div className="sm:hidden">
              <InstallButton />
            </div>

            {/* Hamburger - Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors"
            >
              {menuOpen
                ? <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
                : <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200/60 dark:border-dark-border/60 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-border/20 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}