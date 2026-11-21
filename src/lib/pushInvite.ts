// Invitation à activer les notifications : règles d'affichage, stockage local et compteurs anonymes.
//
// Deux moments (voir PushInvite.tsx) :
//  - « install » : à l'installation de l'application, ou au premier lancement de l'application installée ;
//  - « banner »  : bandeau récurrent pour les visiteurs pas encore abonnés, plafonné.
// La demande du navigateur n'est jamais déclenchée sans clic sur « Activer » (elle est refusée sans geste
// sur iPhone/Firefox, et un refus du navigateur est quasi définitif).

import { API_URL, getStoredPreferences, isPushSupported } from '@/lib/webpush'

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
})

export const isBusyRoute = (pathname: string): boolean => BUSY_ROUTE.test(pathname)

/** Décide s'il faut afficher l'invitation, et sous quelle forme. Fonction pure. */
export function decideInvite(i: InviteInput): InviteSource | null {
  // « default » = jamais répondu. « granted » = déjà autorisé, « denied » = refusé : on n'insiste pas.
  if (i.permission !== 'default') return null
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
