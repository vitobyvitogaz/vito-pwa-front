// src/components/notifications/NotificationToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { BellIcon, BellSlashIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'
import { zones } from '@/data/promotions'

export const NotificationToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [userZone, setUserZone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Charger la préférence utilisateur
    const savedPreference = localStorage.getItem('promo-notifications')
    
    // 2. Détecter la zone automatiquement (simplifié)
    detectUserZone()
    
    // 3. Vérifier les permissions
    checkNotificationPermission(savedPreference === 'true')
  }, [])

  const detectUserZone = async () => {
    try {
      // Méthode 1: Via géolocalisation (précise)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000
        })
      })
      
      // Ici, normalement vous auriez un service qui convertit lat/long → zone
      // Pour la démo, on simule avec localStorage
      const simulatedZone = localStorage.getItem('user-zone') || 'tana'
      setUserZone(simulatedZone)
      
    } catch (error) {
      // Méthode 2: Fallback sur IP ou sélection précédente
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
      // Demander la permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        // Fallback: notification in-app si les push sont refusées
        console.log('Notifications push refusées, on utilisera les notifications in-app')
        // Vous pourriez utiliser un système de notifications in-app à la place
      }
    }
    
    const newState = !isEnabled
    setIsEnabled(newState)
    localStorage.setItem('promo-notifications', String(newState))
    
    // Déclencher un événement personnalisé pour que d'autres composants réagissent
    window.dispatchEvent(new CustomEvent('notification-preference-changed', {
      detail: { enabled: newState }
    }))
  }

  const handleTestNotification = async () => {
    // 1. Activer les notifications si ce n'est pas déjà fait
    if (!isEnabled) {
      localStorage.setItem('promo-notifications', 'true')
      setIsEnabled(true)
    }
    
    // 2. Réinitialiser le cache (simule "je n'ai jamais vérifié")
    localStorage.setItem('last-promo-check', '0')
    
    // 3. Vérifier les permissions
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
    
    // 4. Envoyer une notification de test
    if (Notification.permission === 'granted') {
      const notification = new Notification('🎁 NOUVELLE PROMOTION !', {
        body: 'Test d\'ajout manuel de promotion - Réduction disponible',
        icon: '/icons/icon-192x192.png',
        tag: 'test-promo-' + Date.now()
      })
      
      // Quand on clique sur la notification
      notification.onclick = () => {
        window.focus()
        window.location.href = '/promotions'
        notification.close()
      }
      
      console.log('✅ Test de notification envoyé')
    }
  }

  const getZoneLabel = () => {
    if (!userZone) return 'Chargement...'
    const zone = zones.find(z => z.value === userZone)
    return zone ? zone.label : userZone
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 border border-neutral-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isEnabled 
                ? 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10' 
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}>
              {isEnabled ? (
                <BellIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <BellSlashIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              )}
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Alertes promotions
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPinIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {isLoading ? 'Détection de votre zone...' : getZoneLabel()}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-3">
            {isEnabled 
              ? `✅ Vous serez alerté des nouvelles promotions dans votre zone`
              : `🔕 Activez pour être notifié des offres près de chez vous`
            }
          </p>
          
          {/* Indicateur discret inspiré de Uber Eats */}
          {isEnabled && (
            <div className="inline-flex items-center gap-1 px-2 py-1 mt-2 bg-green-50 dark:bg-green-900/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-400">Prêt à recevoir les alertes</span>
            </div>
          )}
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${
            isEnabled 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-neutral-300 dark:bg-neutral-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Ligne informative (style app food) */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span className="text-xs">⚡</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 flex-1">
          Alertes en temps réel • Basé sur votre localisation • Notification push & in-app
        </p>
        <ChevronRightIcon className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
      </div>
      
      {/* BOUTON DE TEST - AJOUTÉ ICI */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleTestNotification}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <span className="text-lg">🧪</span>
          Tester l'ajout d'une promotion
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
          Simule ce qui se passe quand une nouvelle promotion est ajoutée
        </p>
      </div>
    </div>
  )
}