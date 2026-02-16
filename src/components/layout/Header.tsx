'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { InstallButton } from '@/components/shared/InstallButton'

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/60 dark:border-dark-border/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">
          
          {/* Logo avec switch light/dark */}
          <Link
            href="/fr"
            className="flex items-center transition-all duration-300 hover:opacity-90"
          >
            {/* Logo LIGHT - visible en mode clair */}
            <Image
              src="/logo-vito-light.jpg"
              alt="Vito by Vitogaz Madagascar"
              width={120}
              height={67}
              priority
              className="h-auto w-auto max-h-[50px] object-contain block dark:hidden"
            />
            
            {/* Logo DARK - visible en mode sombre */}
            <Image
              src="/logo-vito-dark.png"
              alt="Vito by Vitogaz Madagascar"
              width={120}
              height={67}
              priority
              className="h-auto w-auto max-h-[50px] object-contain hidden dark:block"
            />
          </Link>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            
            {/* Bouton Installer - Desktop */}
            <div className="hidden sm:block">
              <InstallButton />
            </div>
            
            {/* Séparateur */}
            <div className="hidden sm:block h-6 w-px bg-neutral-300/40 dark:bg-dark-border/40"></div>
            
            {/* Switchers */}
            <div className="flex items-center gap-2">
              
              {/* LanguageSwitcher - CACHÉ */}
              {/* 
              <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors">
                <LanguageSwitcher />
              </div>
              */}
              
              {/* ThemeSwitcher */}
              <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors">
                <ThemeSwitcher />
              </div>
            </div>
            
            {/* Bouton Installer - Mobile */}
            <div className="sm:hidden">
              <InstallButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}