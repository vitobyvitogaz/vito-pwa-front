// src/components/notifications/TestNotificationButton.tsx
'use client'

import { BellAlertIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export const TestNotificationButton: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  const sendTestNotification = async () => {
    setIsTesting(true)
    setTestResult('')
    
    try {
      // Vérifier les permissions
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setTestResult('❌ Veuillez autoriser les notifications pour tester')
          return
        }
      }

      // 1. Essayer d'abord avec Service Worker pour avoir les actions
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready
          
          // Créer une fausse promotion pour le test
          const testPromo = {
            id: 'test-' + Date.now(),
            title: '🎉 Promotion de test !',
            subtitle: 'Ceci est une notification de test',
            discount: 25,
            zones: ['tana']
          }
          
          // Options pour Service Worker (supportent les actions)
          const swOptions: any = {
            body: testPromo.subtitle,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'test-notification',
            data: {
              url: '/promotions?test=true',
              promoId: testPromo.id
            },
            // Actions uniquement supportées par Service Worker
            actions: [
              {
                action: 'view',
                title: 'Voir la promotion'
              },
              {
                action: 'dismiss',
                title: 'Fermer'
              }
            ],
            // Options additionnelles pour mobile
            vibrate: [200, 100, 200],
            requireInteraction: false
          }
          
          await registration.showNotification(`TEST: ${testPromo.title}`, swOptions)
          
          setTestResult('✅ Notification push envoyée avec succès via Service Worker')
          console.log('✅ Notification push envoyée avec succès')
          
        } catch (error) {
          console.error('Erreur avec Service Worker:', error)
          // Fallback à l'API Notification standard
          sendFallbackNotification()
        }
      } else {
        // Navigateur ne supporte pas Service Worker/Push
        sendFallbackNotification()
      }
    } catch (error) {
      console.error('Erreur générale:', error)
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const sendFallbackNotification = () => {
    // API Notification standard (pas d'actions)
    const notification = new Notification('🎉 Test Notification', {
      body: 'Ceci est une notification de test (API standard)',
      icon: '/icons/icon-192x192.png',
      // Les options suivantes sont standard et supportées
      tag: 'test-notification-fallback',
      requireInteraction: false,
      silent: false
    })
    
    // Gérer le clic sur la notification
    notification.onclick = () => {
      window.focus()
      window.location.href = '/promotions?test=true'
      notification.close()
    }
    
    setTestResult('✅ Notification envoyée (API standard sans actions)')
  }

  const simulateNewPromotion = () => {
    // Déclencher une notification in-app (toast)
    const event = new CustomEvent('show-toast-notification', {
      detail: {
        type: 'test',
        title: '🎁 NOUVELLE PROMOTION DÉTECTÉE !',
        message: 'Offre spéciale Vitogaz - 30% de réduction sur les kits complets',
        duration: 6000,
        action: {
          label: 'Découvrir',
          onClick: () => {
            window.location.href = '/promotions?test=true'
          }
        }
      }
    })
    window.dispatchEvent(event)
    setTestResult('✅ Notification in-app simulée (toast)')
  }

  const testMobileOptimized = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        const options: any = {
          body: 'Notification optimisée pour mobile avec vibration',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'mobile-test',
          vibrate: [200, 100, 200, 100, 200], // Pattern de vibration
          requireInteraction: false,
          data: {
            url: '/promotions',
            timestamp: Date.now()
          }
        }
        
        // Ajouter des actions si supporté
        if ('actions' in Notification.prototype) {
          options.actions = [
            { action: 'view', title: 'Voir' }
          ]
        }
        
        await registration.showNotification('📱 Test Mobile', options)
        setTestResult('✅ Notification mobile envoyée avec vibration')
      } catch (error) {
        console.error('Erreur mobile:', error)
        setTestResult('❌ Erreur avec notification mobile')
      }
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Bouton principal de test */}
      <button
        onClick={sendTestNotification}
        disabled={isTesting}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BellAlertIcon className="w-5 h-5" />
        <span className="font-medium">
          {isTesting ? 'Test en cours...' : 'Tester notification'}
        </span>
      </button>
      
      {/* Résultat du test */}
      {testResult && (
        <div className={`p-3 rounded-lg text-sm ${
          testResult.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {testResult}
        </div>
      )}
      
      {/* Options supplémentaires */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-3 shadow-lg border border-neutral-200 dark:border-dark-border">
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
          Options de test :
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={simulateNewPromotion}
            className="text-sm px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors"
          >
            Simuler nouvelle promo
          </button>
          <button
            onClick={testMobileOptimized}
            className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
          >
            Test mobile
          </button>
          <button
            onClick={() => {
              // Tester les permissions
              if (Notification.permission === 'granted') {
                setTestResult('✅ Permissions déjà accordées')
              } else {
                Notification.requestPermission().then(perm => {
                  setTestResult(`Permissions: ${perm}`)
                })
              }
            }}
            className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Vérifier permissions
          </button>
        </div>
        
        {/* Info sur le support */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Support: 
            <span className={`ml-2 ${'serviceWorker' in navigator ? 'text-green-600' : 'text-red-600'}`}>
              ServiceWorker: { 'serviceWorker' in navigator ? '✅' : '❌' }
            </span>
            <span className={`ml-2 ${'PushManager' in window ? 'text-green-600' : 'text-red-600'}`}>
              Push: { 'PushManager' in window ? '✅' : '❌' }
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}