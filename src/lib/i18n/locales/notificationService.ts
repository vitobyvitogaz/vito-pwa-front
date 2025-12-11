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
    this.setupServiceWorker()
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

  private async setupServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker enregistré pour les notifications')
      } catch (error) {
        console.error('Échec enregistrement Service Worker:', error)
      }
    }
  }

  public checkForNewPromotions(): void {
    if (!this.isEnabled || !this.userZone) return
    
    const now = Date.now()
    if (now - this.lastNotificationTime < this.COOLDOWN_MS) return
    
    const lastCheck = parseInt(localStorage.getItem('last-promo-check') || '0')
    
    promotions.forEach(promo => {
      const promoDate = new Date(promo.validUntil).getTime()
      
      if (promoDate > lastCheck && promo.zones.includes(this.userZone!)) {
        this.sendNotification(promo)
      }
    })
    
    localStorage.setItem('last-promo-check', now.toString())
    this.lastNotificationTime = now
  }

  private async sendNotification(promo: any): Promise<void> {
    // 1. Notification push via Service Worker (si disponible)
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Options pour Service Worker
        const swOptions: any = {
          body: promo.subtitle || `Nouvelle promotion de ${promo.discount}%`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `promo-${promo.id}`,
          // renotify est une propriété SW, pas standard
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
      // API Notification standard
      const notification = new Notification(`🎁 ${promo.title}`, {
        body: promo.subtitle || `Réduction de ${promo.discount}%`,
        icon: '/icons/icon-192x192.png',
        // Options standard (pas de renotify ni actions)
        tag: `promo-${promo.id}`,
        requireInteraction: false,
        silent: false
      })
      
      // Gérer le clic
      notification.onclick = () => {
        window.focus()
        window.location.href = '/promotions'
        notification.close()
      }
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
}

// Version alternative sans erreur TypeScript
export const useNotificationService = () => {
  if (typeof window === 'undefined') return
  
  const service = NotificationService.getInstance()
  service.startPolling(5)
  
  // Vérifier immédiatement au chargement
  setTimeout(() => service.checkForNewPromotions(), 2000)
}