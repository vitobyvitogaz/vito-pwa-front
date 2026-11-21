'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, X } from '@phosphor-icons/react'
import { isPushSubscribed, isPushSupported } from '@/lib/webpush'
import {
  activatePush,
  afterShown,
  decideInvite,
  isBusyRoute,
  loadState,
  refreshSubscription,
  registerVisit,
  saveState,
  trackInviteEvent,
  type InviteSource,
} from '@/lib/pushInvite'

// Délai avant d'afficher l'invitation : on laisse d'abord la personne voir la page.
const SHOW_DELAY_MS = 4000
type Phase = 'idle' | 'asking' | 'done' | 'blocked' | 'failed'

const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const userZones = (): string[] => {
  try {
    const location = localStorage.getItem('user-location')
    return location ? [location.split(',')[0].trim()] : []
  } catch {
    return []
  }
}

export function PushInvite() {
  const pathname = usePathname()
  const [source, setSource] = useState<InviteSource | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [failedStep, setFailedStep] = useState('')
  const justInstalled = useRef(false)
  const sourceRef = useRef<InviteSource | null>(null)

  // Une fois par ouverture : compte la visite et répare silencieusement un abonnement existant.
  useEffect(() => {
    registerVisit()
    void refreshSubscription()
    const onInstalled = () => {
      justInstalled.current = true
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  // Évalue les règles à chaque changement de page, après un court délai.
  useEffect(() => {
    if (source || phase !== 'idle') return
    let cancelled = false

    const timer = setTimeout(async () => {
      if (!isPushSupported()) return
      const subscribed = await isPushSubscribed()
      if (cancelled) return

      const decision = decideInvite({
        now: Date.now(),
        state: loadState(),
        permission: Notification.permission,
        subscribed,
        online: navigator.onLine,
        isIOS: isIOS(),
        isStandalone: isStandalone(),
        justInstalled: justInstalled.current,
        busyRoute: isBusyRoute(pathname),
      })
      if (!decision) return

      saveState(afterShown(loadState(), decision, Date.now()))
      sourceRef.current = decision
      setSource(decision)
      trackInviteEvent(decision, 'shown')
    }, SHOW_DELAY_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [pathname, source, phase])

  const close = useCallback(() => {
    justInstalled.current = false
    setSource(null)
    setPhase('idle')
  }, [])

  const dismiss = () => {
    if (sourceRef.current) trackInviteEvent(sourceRef.current, 'dismissed')
    close()
  }

  const accept = async () => {
    const current = sourceRef.current
    if (!current || phase === 'asking') return
    const isRetry = phase === 'failed'
    setPhase('asking')
    if (!isRetry) trackInviteEvent(current, 'accepted')

    // Le clic est le geste exigé par le navigateur. Le temps que la personne met à répondre à sa demande
    // n'est pas borné ; seules les étapes techniques le sont (voir activatePush).
    const result = await activatePush(userZones())

    if (result.status === 'ok') {
      saveState({ ...loadState(), activationFailed: false })
      trackInviteEvent(current, 'granted')
      setPhase('done')
      setTimeout(close, 3000)
      return
    }
    if (result.status === 'denied') {
      trackInviteEvent(current, 'denied')
      setPhase('blocked')
      setTimeout(close, 6000)
      return
    }
    if (result.status === 'dismissed') {
      // Demande du navigateur fermée sans réponse : ce n'est pas une panne, on pourra reproposer plus tard.
      trackInviteEvent(current, 'dismissed')
      close()
      return
    }
    // Échec technique après l'autorisation : on le dit, avec le code de l'étape, et on propose de réessayer.
    saveState({ ...loadState(), activationFailed: true })
    trackInviteEvent(current, 'error')
    setFailedStep(result.step)
    setPhase('failed')
  }

  if (!source) return null

  return (
    <div className="fixed bottom-[88px] left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[1001] animate-fade-in">
      <section
        aria-label="Activer les notifications"
        className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface p-5 shadow-md font-sans"
      >
        {phase !== 'asking' && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            {phase === 'done' ? (
              <p role="status" className="text-sm font-semibold text-neutral-900 dark:text-white">
                Notifications activées
              </p>
            ) : phase === 'failed' ? (
              <p role="status" className="text-sm text-neutral-700 dark:text-neutral-300">
                L&apos;activation n&apos;a pas abouti. Vérifiez votre connexion, puis réessayez.{' '}
                <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">(code : {failedStep})</span>
              </p>
            ) : phase === 'blocked' ? (
              <p role="status" className="text-sm text-neutral-700 dark:text-neutral-300">
                Les notifications sont bloquées pour ce site. Vous pourrez les réactiver dans les réglages du
                navigateur, rubrique « Autorisations du site ».
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Restez informé
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Recevez une alerte pour les nouvelles promotions, les nouveaux revendeurs et les sociétés de
                  livraison.
                </p>
              </>
            )}
          </div>
        </div>

        {phase !== 'done' && phase !== 'blocked' && (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => void accept()}
              disabled={phase === 'asking'}
              className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors duration-200 active:scale-95 disabled:opacity-60"
            >
              {phase === 'asking' ? 'Activation…' : phase === 'failed' ? 'Réessayer' : 'Activer les notifications'}
            </button>
            <button
              type="button"
              onClick={dismiss}
              disabled={phase === 'asking'}
              className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 active:scale-95 disabled:opacity-60"
            >
              {phase === 'failed' ? 'Fermer' : 'Plus tard'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
