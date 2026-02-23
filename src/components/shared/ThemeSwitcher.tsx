'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

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
      className="w-10 h-10 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 text-amber-600 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          strokeWidth={1.5}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 text-indigo-600 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          strokeWidth={1.5}
        />
      </div>
    </button>
  )
}