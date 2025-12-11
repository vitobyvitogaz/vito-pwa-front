'use client'

import { useState, useEffect } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'

export const ThemeSwitcher: React.FC = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (theme === 'dark' || (!theme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-dark-surface border-1 border-neutral-200 dark:border-dark-border hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 sm:w-6 sm:h-6">
        <SunIcon
          className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 text-orange-500 transition-all duration-500 ${
            isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 transition-all duration-500 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
          }`}
        />
      </div>
    </button>
  )
}