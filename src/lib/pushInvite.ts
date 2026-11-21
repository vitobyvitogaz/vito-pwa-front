// Invitation à activer les notifications : règles d'affichage, stockage local et compteurs anonymes.
//
// Deux moments (voir PushInvite.tsx) :
//  - « install » : à l'installation de l'application, ou au premier lancement de l'application installée ;
//  - « banner »  : bandeau récurrent pour les visiteurs pas encore abonnés, plafonné.
// La demande du navigateur n'est jamais déclenchée sans clic sur « Activer » (elle est refusée sans geste
// sur iPhone/Firefox, et un refus du navigateur est quasi définitif).

import {
  API_URL,
  DEFAULT_PREFERENCES,
  getStoredPreferences,
  isPushSupported,
  urlBase64ToUint8Array,
} from '@/lib/webpush'

export type InviteSource = 'install' | 'banner'
export type InviteEvent = 'shown' | 'accepted' | 'dismissed' | 'granted' | 'denied' | 'error'

export interface PushInviteState {
  /** Nombre de sessions (ouvertures) vues sur cet appareil. */
  visits: number
  /** Nombre de fois où le bandeau récurrent a été affiché. */
  bannerShown: number
  /** Dernier affichage (carte d'installation ou bandeau), en ms. */
  lastShownAt: number | null
  /** La carte d'installation a déjà été proposée sur cet appareil. */
  installAsked: boolean
  /** Une activation a échoué après l'autorisation : on peut reproposer même si la permission est accordée. */
  activationFailed: boolean
}

export interface InviteInput {
  now: number
  state: PushInviteState
  permission: NotificationPermission | 'unsupported'
  subscribed: boolean
  online: boolean
  isIOS: boolean
  isStandalone: boolean
  /** L'événement « appinstalled » vient de se produire. */
  justInstalled: boolean
  /** Page où l'on ne dérange pas (scan, commande, échanges, avis, paramètres, pages légales). */
  busyRoute: boolean
}

export const MIN_VISITS = 2
export const MAX_BANNER_SHOWS = 3
export const REPEAT_DELAY_MS = 14 * 24 * 60 * 60 * 1000

const STATE_KEY = 'push-invite-state'
const SESSION_KEY = 'push-invite-session'
const BUSY_ROUTE = /\/(scan|commander|mes-echanges|rating|parametres|conditions|confidentialite)(\/|$)/

export const emptyState = (): PushInviteState => ({
  visits: 0,
  bannerShown: 0,
  lastShownAt: null,
  installAsked: false,
  activationFailed: false,
})

export const isBusyRoute = (pathname: string): boolean => BUSY_ROUTE.test(pathname)

/** Décide s'il faut afficher l'invitation, et sous quelle forme. Fonction pure. */
export function decideInvite(i: InviteInput): InviteSource | null {
  // « default » = jamais répondu. « denied » = refusé : on n'insiste pas. « granted » sans abonnement :
  // on ne reproposera que si NOTRE dernière activation a échoué (sinon la personne s'est peut-être
  // désabonnée volontairement dans Paramètres).
  const retryAfterFailure = i.permission === 'granted' && i.state.activationFailed
  if (i.permission !== 'default' && !retryAfterFailure) return null
  if (i.subscribed || !i.online || i.busyRoute) return null
  // Sur iPhone, les notifications n'existent que dans l'application installée.
  if (i.isIOS && !i.isStandalone) return null

  if (i.justInstalled || (i.isStandalone && !i.state.installAsked)) return 'install'

  if (i.state.visits < MIN_VISITS) return null
  if (i.state.bannerShown >= MAX_BANNER_SHOWS) return null
  if (i.state.lastShownAt !== null && i.now - i.state.lastShownAt < REPEAT_DELAY_MS) return null
  return 'banner'
}

/** État après affichage d'une invitation. */
export function afterShown(state: PushInviteState, source: InviteSource, now: number): PushInviteState {
  return {
    ...state,
    lastShownAt: now,
    installAsked: source === 'install' ? true : state.installAsked,
    bannerShown: source === 'banner' ? state.bannerShown + 1 : state.bannerShown,
  }
}

// ── Stockage local (sans effet si le stockage est indisponible) ──────────────────────────────
export function loadState(): PushInviteState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) return { ...emptyState(), ...JSON.parse(raw) }
  } catch {}
  return emptyState()
}

export function saveState(state: PushInviteState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {}
}

/** Compte une visite par session (et non à chaque page vue). */
export function registerVisit(): PushInviteState {
  const state = loadState()
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return state
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return state
  }
  const next = { ...state, visits: state.visits + 1 }
  saveState(next)
  return next
}

// ── Activation pas à pas ─────────────────────────────────────────────────────────────────────
// Reproduit le parcours éprouvé de la page Paramètres (enregistrement forcé du service worker, attente
// bornée) et indique l'étape en cas d'échec. Le temps de réponse de la personne à la demande du navigateur
// n'est JAMAIS borné : seules les étapes techniques le sont.
export type ActivationStep = 'permission' | 'worker' | 'key' | 'subscribe' | 'backend'
export type ActivationResult =
  | { status: 'ok' }
  | { status: 'denied' }
  | { status: 'dismissed' }
  | { status: 'failed'; step: ActivationStep; detail: string }

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('délai dépassé')), ms)),
  ])

const detailOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))

async function getWorker(): Promise<ServiceWorkerRegistration> {
  const registrations = await navigator.serviceWorker.getRegistrations()
  if (registrations.length === 0) await navigator.serviceWorker.register('/sw.js')
  return navigator.serviceWorker.ready
}

export async function activatePush(
  zones: string[],
  preferences: Record<string, boolean> = DEFAULT_PREFERENCES,
): Promise<ActivationResult> {
  if (!isPushSupported()) return { status: 'failed', step: 'permission', detail: 'navigateur non compatible' }

  // Appelé en premier, dans le clic : c'est le geste que le navigateur exige.
  let permission: NotificationPermission
  try {
    permission = await Notification.requestPermission()
  } catch (error) {
    return { status: 'failed', step: 'permission', detail: detailOf(error) }
  }
  if (permission === 'denied') return { status: 'denied' }
  if (permission !== 'granted') return { status: 'dismissed' }

  let step: ActivationStep = 'worker'
  try {
    const registration = await withTimeout(getWorker(), 10000)

    step = 'key'
    const keyResponse = await withTimeout(fetch(`${API_URL}/notifications/vapid-public-key`), 15000)
    if (!keyResponse.ok) throw new Error(`HTTP ${keyResponse.status}`)
    const { publicKey } = await keyResponse.json()
    if (!publicKey) throw new Error('clé absente')

    step = 'subscribe'
    const subscription = await withTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }),
      20000,
    )

    step = 'backend'
    const json = subscription.toJSON()
    const response = await withTimeout(
      fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          zones,
          preferences,
        }),
      }),
      15000,
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    try {
      localStorage.setItem('push-subscription-active', 'true')
      localStorage.setItem('push-subscription-endpoint', json.endpoint || '')
      localStorage.setItem('push-preferences', JSON.stringify(preferences))
    } catch {}
    return { status: 'ok' }
  } catch (error) {
    console.error(`[Push] Activation impossible (étape ${step}):`, error)
    return { status: 'failed', step, detail: detailOf(error) }
  }
}

// ── Compteurs anonymes ───────────────────────────────────────────────────────────────────────
// Un compteur agrégé par jour, sans identifiant, sans adresse e-mail ni donnée d'appareil.
export function trackInviteEvent(source: InviteSource, event: InviteEvent): void {
  try {
    void fetch(`${API_URL}/notifications/invite-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, event }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

// ── Réparation silencieuse de l'abonnement ───────────────────────────────────────────────────
// Si la permission est déjà accordée et que le navigateur détient bien un abonnement, on le renvoie au
// backend (qui le réactive s'il avait été désactivé). Aucune demande à l'utilisateur. On ne le fait que si
// les préférences et la zone enregistrées existent sur cet appareil, pour ne pas écraser ses choix.
export async function refreshSubscription(): Promise<void> {
  try {
    if (!isPushSupported() || Notification.permission !== 'granted') return
    if (!localStorage.getItem('push-preferences')) return
    const location = localStorage.getItem('user-location')
    if (!location) return

    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (!subscription) return

    const json = subscription.toJSON()
    await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        zones: [location.split(',')[0].trim()],
        preferences: getStoredPreferences(),
      }),
    })
  } catch {}
}
