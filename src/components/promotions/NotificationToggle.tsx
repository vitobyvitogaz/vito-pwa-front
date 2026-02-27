'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, MapPin, ChevronRight, Zap } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'
import { zones } from '@/data/promotions'

export const NotificationToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [userZone, setUserZone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedPreference = localStorage.getItem('promo-notifications')
    detectUserZone()
    checkNotificationPermission(savedPreference === 'true')
  }, [])

  const detectUserZone = async () => {
    try {
      const savedZone = localStorage.getItem('user-zone') || 'tana'
      setUserZone(savedZone)
    } finally {
      setIsLoading(false)
    }
  }

  const checkNotificationPermission = (savedState: boolean) => {
    if (savedState && Notification.permission === 'granted') {
      setIsEnabled(true)
    } else if (Notification.permission === 'denied') {
      setIsEnabled(false)
      localStorage.setItem('promo-notifications', 'false')
    }
  }

  const handleToggle = async () => {
    hapticFeedback('medium')
    
    if (!isEnabled) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notifications push refusées')
      }
    }
    
    const newState = !isEnabled
    setIsEnabled(newState)
    localStorage.setItem('promo-notifications', String(newState))
    
    window.dispatchEvent(new CustomEvent('notification-preference-changed', {
      detail: { enabled: newState }
    }))
  }

  const handleTestNotification = async () => {
    if (!isEnabled) {
      localStorage.setItem('promo-notifications', 'true')
      setIsEnabled(true)
    }
    
    localStorage.setItem('last-promo-check', '0')
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Veuillez autoriser les notifications pour tester')
        return
      }
    }
    
    if (Notification.permission === 'denied') {
      alert('Les notifications sont bloquées. Débloquez-les dans les paramètres du navigateur.')
      return
    }
    
    if (Notification.permission === 'granted') {
      new Notification('Promotion disponible', {
        body: 'Test d\'ajout manuel de promotion - Réduction disponible',
        icon: '/icons/icon-192x192.png',
        tag: 'test-promo-' + Date.now()
      })
    }
  }

  const getZoneLabel = () => {
    if (!userZone) return 'Chargement...'
    const zone = zones.find(z => z.value === userZone)
    return zone ? zone.label : userZone
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEnabled 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}>
              {isEnabled ? (
                <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              ) : (
                <BellOff className="w-6 h-6 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-sans mb-1">
                Alertes promotions
              </h3>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                  {isLoading ? 'Détection de votre zone...' : getZoneLabel()}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3 font-sans">
            {isEnabled 
              ? `Vous serez alerté des nouvelles promotions dans votre zone`
              : `Activez pour être notifié des offres près de chez vous`
            }
          </p>
          
          {isEnabled && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-sans">Prêt à recevoir les alertes</span>
            </div>
          )}
        </div>
        
        {/* Toggle*/}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center ${
            isEnabled 
              ? 'bg-emerald-500' 
              : 'bg-neutral-300 dark:bg-neutral-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Info line */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 flex-1 font-sans">
          Alertes en temps réel • Basé sur votre localisation • Notification push & in-app
        </p>
        <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
      </div>
      
      {/* Test button */}
      {/*
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleTestNotification}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2 font-sans"
        >
          Tester l'ajout d'une promotion
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2 font-sans">
          Simule ce qui se passe quand une nouvelle promotion est ajoutée
        </p>
      </div>
    */}
    </div>
  )
}