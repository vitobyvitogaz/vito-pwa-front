'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Gift, Star, Clock, CheckCircle, ChevronRight, Phone, ArrowLeft, Sparkles, X } from 'lucide-react'

const API_URL       = 'https://vito-backend-supabase.onrender.com/api/v1'
const PWA_PHONE_KEY = 'vito-user-phone'
const PWA_NAME_KEY  = 'vito-user-name'

interface PointsBalance { phone: string; name: string | null; total_points: number; used_points: number; available_points: number }
interface ScanHistory { id: string; promo_code: string; points_earned: number; scanned_at: string; promotions: { title: string; image_url: string | null; discount_value: number; discount_type: string } | null }

export default function MesAvantagesPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [phone, setPhone]           = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [balance, setBalance]       = useState<PointsBalance | null>(null)
  const [history, setHistory]       = useState<ScanHistory[]>([])
  const [loading, setLoading]       = useState(false)
  const [showExchange, setShowExchange] = useState(false)
  const [exchangePoints, setExchangePoints] = useState('')
  const [exchangeReward, setExchangeReward] = useState('')
  const [exchanging, setExchanging] = useState(false)
  const [exchangeSuccess, setExchangeSuccess] = useState(false)
  const [exchangeError, setExchangeError]     = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(PWA_PHONE_KEY)
    if (saved) { setPhone(saved); loadData(saved) }
  }, [])

  const loadData = async (p: string) => {
    setLoading(true)
    try {
      const [balRes, histRes] = await Promise.all([
        fetch(`${API_URL}/scan/points/${encodeURIComponent(p)}`),
        fetch(`${API_URL}/scan/history?phone=${encodeURIComponent(p)}`),
      ])
      if (balRes.ok)  setBalance(await balRes.json())
      if (histRes.ok) setHistory(await histRes.json())
    } catch {} finally { setLoading(false) }
  }

  const handlePhoneSubmit = () => {
    if (!phoneInput.trim()) return
    localStorage.setItem(PWA_PHONE_KEY, phoneInput.trim())
    setPhone(phoneInput.trim())
    loadData(phoneInput.trim())
  }

  const handleExchange = async () => {
    if (!exchangePoints || !exchangeReward.trim()) { setExchangeError('Veuillez remplir tous les champs'); return }
    const pts = parseInt(exchangePoints)
    if (pts > (balance?.available_points || 0)) { setExchangeError('Points insuffisants'); return }
    setExchanging(true); setExchangeError(null)
    try {
      const res = await fetch(`${API_URL}/scan/exchange`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name:               localStorage.getItem(PWA_NAME_KEY) || '',
          points_requested:   pts,
          reward_description: exchangeReward.trim(),
        }),
      })
      if (!res.ok) { const d = await res.json(); setExchangeError(d.message || 'Erreur'); return }
      setExchangeSuccess(true)
      loadData(phone)
    } catch { setExchangeError('Erreur réseau') }
    finally { setExchanging(false) }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  // ── Saisie téléphone ──────────────────────────────────────────────────────
  if (!phone) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg pt-14 pb-24 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Gift className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-2 text-center">Mes Avantages</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans text-center mb-8 max-w-xs">
          Entrez votre numéro de téléphone pour consulter votre solde de points et votre historique de participations.
        </p>
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center gap-3 bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
            <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              placeholder="+261 34 00 000 00"
              className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-sans" />
          </div>
          <button onClick={handlePhoneSubmit}
            className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm hover:bg-primary/90 transition-colors active:scale-95">
            Consulter mes avantages
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg pt-14 pb-24">

      {/* Header */}
      <div className="sticky top-14 z-40 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="container mx-auto px-4 flex items-center justify-between h-12">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Retour
          </button>
          <button onClick={() => { setPhone(''); localStorage.removeItem(PWA_PHONE_KEY) }}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors font-sans">
            Changer de numéro
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-lg pt-6 space-y-5">

        {/* Solde de points */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
          <p className="text-sm font-medium opacity-80 mb-1 font-sans">Solde disponible</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-black font-display">{balance?.available_points || 0}</span>
            <span className="text-lg font-semibold opacity-80 mb-1">point{(balance?.available_points || 0) > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center justify-between text-xs opacity-70 font-sans">
            <span>Total gagné : {balance?.total_points || 0} pts</span>
            <span>Utilisé : {balance?.used_points || 0} pts</span>
          </div>

          {(balance?.available_points || 0) > 0 && !showExchange && (
            <button onClick={() => setShowExchange(true)}
              className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold font-sans transition-colors flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" /> Échanger mes points
            </button>
          )}
        </div>

        {/* Formulaire d'échange */}
        {showExchange && !exchangeSuccess && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold font-display text-neutral-900 dark:text-white">Demande d'échange</h3>
              <button onClick={() => { setShowExchange(false); setExchangeError(null) }} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-sans mb-1.5 block">
                Points à utiliser (max : {balance?.available_points || 0})
              </label>
              <input type="number" min="1" max={balance?.available_points || 0} value={exchangePoints}
                onChange={e => { setExchangePoints(e.target.value); setExchangeError(null) }}
                placeholder="Ex: 100"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-sans" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-sans mb-1.5 block">
                Récompense souhaitée
              </label>
              <input type="text" value={exchangeReward} onChange={e => { setExchangeReward(e.target.value); setExchangeError(null) }}
                placeholder="Ex: Bon d'achat 5000 Ar"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-sans" />
            </div>
            {exchangeError && <p className="text-sm text-red-500 font-sans">{exchangeError}</p>}
            <button onClick={handleExchange} disabled={exchanging}
              className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors active:scale-95">
              {exchanging ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        )}

        {exchangeSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 font-display mb-1">Demande envoyée !</p>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-500 font-sans">Notre équipe vous contactera pour valider l'échange.</p>
          </div>
        )}

        {/* Historique des participations */}
        <div>
          <h2 className="text-sm font-semibold font-display text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
            Historique des participations
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-dark-surface rounded-2xl">
              <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-neutral-500 font-sans">Aucune participation pour ce numéro.</p>
              <button onClick={() => router.push(`/${locale}/promotions`)}
                className="mt-3 text-sm text-primary font-medium font-sans hover:text-primary/80 transition-colors">
                Voir les promotions →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((scan) => (
                <div key={scan.id} className="bg-white dark:bg-dark-surface rounded-xl p-4 shadow-sm shadow-neutral-200/60 dark:shadow-neutral-900/40 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white font-display truncate">
                      {scan.promotions?.title || scan.promo_code}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">{fmtDate(scan.scanned_at)}</p>
                  </div>
                  {scan.points_earned > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">+{scan.points_earned}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}