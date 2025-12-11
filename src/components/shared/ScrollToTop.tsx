'use client'

import { useState, useEffect } from 'react'
import { ArrowUpIcon } from '@heroicons/react/24/solid'

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-gradient-to-br from-primary to-primary-600
        text-white shadow-xl
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:scale-110 hover:shadow-2xl
        active:scale-95
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      aria-label="Retour en haut"
    >
      <ArrowUpIcon className="w-6 h-6" />
    </button>
  )
}