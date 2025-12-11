'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LanguageIcon } from '@heroicons/react/24/solid'

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'mg', label: 'Malagasy', flag: '🇲🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
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
        className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-dark-surface border-1 border-neutral-200 dark:border-dark-border hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Change language"
      >
        <span className="text-base">{currentLanguage.flag}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-neutral-200 dark:border-dark-border overflow-hidden animate-slide-down">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`
                w-full px-4 py-3 flex items-center gap-3
                transition-colors duration-200
                ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}