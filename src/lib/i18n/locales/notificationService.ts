// src/lib/notifications/notificationService.ts
import { promotions } from '@/data/promotions'

export class NotificationService {
  private static instance: NotificationService
  private userZone: string | null = null
  private isEnabled = false
  private lastNotificationTime = 0
  private readonly COOLDOWN_MS = 30000 // 30 secondes entre notifications

  private constructor() {
    this.loadPreferences()
    this.setupServiceWorker() // Toujours essayer d'enregistrer le SW
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private loadPreferences() {
    this.isEnabled = localStorage.getItem('promo-notifications') === 'true'
    this.userZone = localStorage.getItem('user-zone') || 'tana'
    
    window.addEventListener('notification-preference-changed', (event: any) => {
      this.isEnabled = event.detail.enabled
    })
  }

  private async setupServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('📱 Tentative d\'enregistrement du Service Worker...')
        
        // IMPORTANT: Enregistrer le SW même sans PushManager
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('✅ Service Worker enregistré avec succès:', registration.scope)
        
        // Vérifier l'état
        if (registration.installing) {
          console.log('📱 Service Worker en cours d\'installation...')
          registration.installing.addEventListener('statechange', () => {
            console.log('📱 État du SW:', registration.installing?.state)
            if (registration.installing?.state === 'activated') {
              console.log('✅ Service Worker activé et prêt')
            }
          })
        } else if (registration.waiting) {
          console.log('📱 Service Worker en attente')
        } else if (registration.active) {
          console.log('✅ Service Worker déjà actif')
        }
        
        // Stocker la référence pour usage futur
        (window as any).__SW_REGISTRATION = registration
        
        // Vérifier les permissions push séparément
        if ('PushManager' in window) {
          console.log('📱 PushManager disponible')
        } else {
          console.log('📱 PushManager non disponible - notifications push désactivées')
        }
        
        return registration
        
      } catch (error) {
        console.error('❌ Échec d\'enregistrement du Service Worker:', error)
        console.warn('⚠️ L\'application continuera sans Service Worker')
        return null
      }
    } else {
      console.warn('⚠️ Service Worker non supporté par ce navigateur')
      return null
    }
  }

  public async ensureServiceWorker(): Promise<boolean> {
    // Vérifier si le SW est déjà enregistré
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        console.log('✅ Service Worker déjà présent:', registration.scope)
        return true
      }
      
      // Sinon essayer de l'enregistrer
      const newRegistration = await this.setupServiceWorker()
      return !!newRegistration
    }
    return false
  }

  public checkForNewPromotions(): void {
    if (!this.isEnabled || !this.userZone) return
    
    const now = Date.now()
    if (now - this.lastNotificationTime < this.COOLDOWN_MS) return
    
    const lastCheck = parseInt(localStorage.getItem('last-promo-check') || '0')
    
    promotions.forEach(promo => {
      const promoDate = new Date(promo.valid_until).getTime()
      
      if (promoDate > lastCheck && promo.zones.includes(this.userZone!)) {
        this.sendNotification(promo)
      }
    })
    
    localStorage.setItem('last-promo-check', now.toString())
    this.lastNotificationTime = now
  }

  private async sendNotification(promo: any): Promise<void> {
    // Vérifier d'abord si le Service Worker est disponible
    let swAvailable = false
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      swAvailable = !!registration
    }
    
    // 1. Notification via Service Worker (si disponible ET permissions accordées)
    if (swAvailable && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Options pour Service Worker
        const swOptions: any = {
          body: promo.subtitle || `Nouvelle promotion de ${promo.discount_value}%`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `promo-${promo.id}`,
          renotify: true,
          data: {
            url: `/promotions`,
            promoId: promo.id
          }
        }
        
        // Ajouter actions seulement si supporté
        if ('actions' in Notification.prototype) {
          swOptions.actions = [
            {
              action: 'view',
              title: 'Voir'
            },
            {
              action: 'dismiss',
              title: 'Fermer'
            }
          ]
        }
        
        await registration.showNotification(`🎁 ${promo.title}`, swOptions)
        console.log('✅ Notification envoyée via Service Worker')
        
      } catch (error) {
        console.error('Erreur notification SW:', error)
        // Fallback à l'API standard
        this.sendFallbackNotification(promo)
      }
    } else {
      // 2. Notification standard (fallback)
      this.sendFallbackNotification(promo)
    }
    
    // 3. Notification in-app (toujours affichée)
    this.showInAppNotification(promo)
  }

  private sendFallbackNotification(promo: any): void {
    if (Notification.permission === 'granted') {
      try {
        // API Notification standard
        const notification = new Notification(`🎁 ${promo.title}`, {
          body: promo.subtitle || `Réduction de ${promo.discount_value}%`,
          icon: '/icons/icon-192x192.png',
          tag: `promo-${promo.id}`,
          requireInteraction: false,
          silent: false
        })
        
        console.log('✅ Notification standard envoyée')
        
        // Gérer le clic
        notification.onclick = () => {
          window.focus()
          window.location.href = '/promotions'
          notification.close()
        }
      } catch (error) {
        console.error('Erreur notification standard:', error)
      }
    } else {
      console.log('⚠️ Permissions notifications non accordées')
    }
  }

  private showInAppNotification(promo: any): void {
    const event = new CustomEvent('show-toast-notification', {
      detail: {
        type: 'promotion',
        title: '🎁 Nouvelle promotion disponible !',
        message: promo.title,
        duration: 5000,
        action: {
          label: 'Voir',
          onClick: () => window.location.href = '/promotions'
        }
      }
    })
    window.dispatchEvent(event)
  }

  public startPolling(intervalMinutes = 5): void {
    setInterval(() => this.checkForNewPromotions(), intervalMinutes * 60 * 1000)
  }

  // Méthode publique pour vérifier l'état PWA
  public async checkPWAStatus() {
    const status = {
      serviceWorker: false,
      pushManager: false,
      notifications: Notification.permission,
      manifest: !!document.querySelector('link[rel="manifest"]'),
      https: window.location.protocol === 'https:',
      displayMode: window.matchMedia('(display-mode: standalone)').matches
    }
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      status.serviceWorker = !!registration
    }
    
    status.pushManager = 'PushManager' in window
    
    console.log('📱 État PWA:', status)
    return status
  }
}

// Version alternative sans erreur TypeScript
export const useNotificationService = () => {
  if (typeof window === 'undefined') return
  
  const service = NotificationService.getInstance()
  
  // Vérifier l'état PWA au démarrage
  setTimeout(() => {
    service.checkPWAStatus()
    service.ensureServiceWorker()
  }, 2000)
  
  service.startPolling(5)
  
  // Vérifier immédiatement au chargement
  setTimeout(() => service.checkForNewPromotions(), 3000)
}