// src/components/notifications/PromoToast.tsx
'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, BellAlertIcon } from '@heroicons/react/24/solid'

export const PromoToast: React.FC = () => {
  const [notification, setNotification] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      setNotification(event.detail)
      setIsVisible(true)
      
      // Auto-dismiss
      setTimeout(() => {
        setIsVisible(false)
      }, event.detail.duration || 5000)
    }

    window.addEventListener('show-toast-notification', handleShowToast as EventListener)
    
    return () => {
      window.removeEventListener('show-toast-notification', handleShowToast as EventListener)
    }
  }, [])

  const handleView = () => {
    if (notification?.action?.onClick) {
      notification.action.onClick()
    }
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible || !notification) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-slide-up">
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl shadow-2xl p-4 mx-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <BellAlertIcon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-white/90 text-xs mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleView}
                className="px-4 py-1.5 bg-white text-orange-600 rounded-full text-xs font-semibold hover:bg-white/90 transition-colors"
              >
                Voir la promotion
              </button>
              
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}