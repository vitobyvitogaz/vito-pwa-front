'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from '@phosphor-icons/react'

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'en', label: 'English' },
]

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('fr')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Détecter la langue actuelle depuis l'URL
    const lang = pathname.split('/')[1]
    if (['fr', 'mg', 'en'].includes(lang)) {
      setCurrentLang(lang)
    }
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLanguage = (langCode: string) => {
    const newPath = pathname.replace(/^\/(fr|mg|en)/, `/${langCode}`)
    router.push(newPath)
    setIsOpen(false)
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-slide-up">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`
                w-full px-4 py-3 flex items-center gap-3 text-sm
                transition-all duration-200 font-sans
                ${
                  currentLang === lang.code
                    ? 'text-primary font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }
              `}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}