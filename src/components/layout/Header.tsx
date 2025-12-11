'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { InstallButton } from '@/components/shared/InstallButton'

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/60 dark:border-dark-border/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">
          {/* Logo */}
            <Link
            href="/fr"
            className="group relative transition-all duration-300 hover:opacity-90"
            style={{ paddingBottom: '12px' }}
            >
            <div className="relative">
                {/* VITO */}
                <div className="pb-[-3px]"> {/* padding-bottom pour espace */}
                <span className="text-[24px] sm:text-[30px] font-bold text-primary dark:text-primary-400 font-display tracking-tight uppercase leading-none">
                    VITO
                </span>
                </div>
                
                {/* Bloc "By + logo" - Positionné ABSOLUMENT */}
                <div className="absolute top-full left-20 right-0 flex justify-end">
                <div className="flex items-start" style={{ marginTop: '-3px' , marginRight: '15px' }}>
                    {/* "By" */}
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-dark-text-tertiary leading-none mr-1">
                    By
                    </span>
                    
                    {/* Logo avec flamme qui dépasse */}
                    <div className="h-5 flex items-start relative" style={{ left: '-2px' }}>
                    <img 
                        src="/icons/logo-vitogaz.png"
                        alt="Vitogaz Madagascar"
                        className="h-full w-auto max-w-[65px] object-contain"
                        onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.outerHTML = `
                            <svg width="65" height="20" viewBox="0 0 65 20" class="h-full w-auto">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#008B7F;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#C8102E;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect width="65" height="20" fill="url(#gradient)" rx="3" />
                            <text x="32.5" y="12" text-anchor="middle" fill="white" font-size="7" font-weight="bold">VITOGAZ</text>
                            <text x="32.5" y="17" text-anchor="middle" fill="white" font-size="3.5">MADAGASCAR</text>
                            </svg>
                        `;
                        }}
                    />
                    </div>
                </div>
                </div>
            </div>
            </Link>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <InstallButton />
            </div>
            <div className="hidden sm:block h-6 w-px bg-neutral-300/40 dark:bg-dark-border/40"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors">
                <LanguageSwitcher />
              </div>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-border/20 transition-colors">
                <ThemeSwitcher />
              </div>
            </div>
            <div className="sm:hidden">
              <InstallButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}