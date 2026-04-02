'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Gift, Star, Clock, ChevronRight, Phone, ArrowLeft, Sparkles, Lock, ChevronLeft } from 'lucide-react'

const API_URL       = 'https://vito-backend-supabase.onrender.com/api/v1'
const PWA_PHONE_KEY = 'vito-user-phone'
const PWA_NAME_KEY  = 'vito-user-name'
const ITEMS_PER_PAGE = 10

interface PointsBalance { phone: string; name: string | null; total_points: number; used_points: number; available_points: number }
interface ScanHistory { id: string; promo_code: string; points_earned: number; scanned_at: string; promotions: { title: string; image_url: string | null; discount_value: number; discount_type: string } | null }

export default function MesAvantagesPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [phone, setPhone]           = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [pinInput, setPinInput]     = useState('')
  const [balance, setBalance]       = useState<PointsBalance | null>(null)
  const [history, setHistory]       = useState<ScanHistory[]>([])
  const [loading, setLoading]       = useState(false)
  const [verifying, setVerifying]   = useState(false)
  const [pinError, setPinError]     = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  const handlePINInput = (value: string) => {
    const filtered = value.replace(/\D/g, "").slice(0, 4)
    setPinInput(filtered)
    setPinError('')
  }

  const handlePhoneSubmit = async () => {
    if (!phoneInput.trim()) return
    if (pinInput.length !== 4) {
      setPinError('Code PIN à 4 chiffres requis')
      return
    }

    setVerifying(true)
    setPinError('')

    try {
      // Vérifier le PIN via l'endpoint points-exchange
      const res = await fetch(`${API_URL}/points-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          name: 'Verification',
          reward_item_id: '00000000-0000-0000-0000-000000000000', // Faux ID pour vérification
          pin: pinInput,
          verify_only: true
        })
      })

      if (res.status === 401 || res.status === 400) {
        setPinError('Code PIN incorrect')
        return
      }

      // Si le PIN n'existe pas encore, on laisse passer (nouveau utilisateur)
      if (res.status === 404) {
        localStorage.setItem(PWA_PHONE_KEY, phoneInput.trim())
        setPhone(phoneInput.trim())
        loadData(phoneInput.trim())
        return
      }

      if (!res.ok) {
        setPinError('Erreur de vérification')
        return
      }

      // PIN correct
      localStorage.setItem(PWA_PHONE_KEY, phoneInput.trim())
      setPhone(phoneInput.trim())
      loadData(phoneInput.trim())
    } catch (error) {
      setPinError('Erreur réseau')
    } finally {
      setVerifying(false)
    }
  }

  const handleGoToCatalog = () => {
    localStorage.setItem('vito_user_phone', phone)
    router.push(`/${locale}/reward-items`)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  // Pagination historique
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // ── Saisie téléphone + PIN ───────────────────────────────────────────────
  if (!phone) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg pt-14 pb-24 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Gift className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-2 text-center">Mes Avantages</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans text-center mb-8 max-w-xs">
          Entrez votre numéro de téléphone et votre code PIN pour accéder à vos avantages.
        </p>
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center gap-3 bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
            <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
              placeholder="+261 34 00 000 00"
              className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-sans" />
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
            <Lock className="w-5 h-5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <input 
              type="password" 
              inputMode="numeric"
              maxLength={4}
              value={pinInput} 
              onChange={e => handlePINInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              placeholder="Code PIN (4 chiffres)"
              className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-sans tracking-widest" />
          </div>

          {pinError && (
            <p className="text-sm text-red-500 font-sans text-center">{pinError}</p>
          )}

          <button onClick={handlePhoneSubmit}
            disabled={verifying}
            className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50">
            {verifying ? 'Vérification...' : 'Accéder à mes avantages'}
          </button>
          
          <p className="text-xs text-center text-neutral-400 font-sans">
            Premier accès ? Votre code PIN sera créé lors de votre premier échange.
          </p>
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
          <button onClick={() => { setPhone(''); localStorage.removeItem(PWA_PHONE_KEY); setPinInput(''); setPhoneInput('') }}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors font-sans">
            Déconnexion
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

          {(balance?.available_points || 0) > 0 && (
            <button onClick={handleGoToCatalog}
              className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold font-sans transition-colors flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" /> 
              Échanger mes points
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

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
            <>
              <div className="space-y-3">
                {paginatedHistory.map((scan) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs text-center text-neutral-400 font-sans mt-3">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, history.length)} sur {history.length} participation(s)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}