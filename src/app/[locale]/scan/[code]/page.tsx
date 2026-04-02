'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, QrCode, Star, CheckCircle, Phone, User, Mail,
  Sparkles, Clock, AlertTriangle, Gift, CreditCard,
} from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'
const PWA_PHONE_KEY = 'vito-user-phone'
const PWA_NAME_KEY  = 'vito-user-name'

interface PromoInfo {
  id: string
  title: string
  subtitle: string | null
  description: string
  discount_value: number
  discount_type: string
  image_url: string | null
  valid_until: string
  promo_code: string
  conditions: string[]
  scan_points: number
  scan_confirmation_message: string | null
  scan_max_per_user: number
}

export default function ScanPage() {
  const params    = useParams()
  const router    = useRouter()
  const code      = params.code as string
  const locale    = params.locale as string

  const [promo, setPromo]           = useState<PromoInfo | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [cinNumber, setCinNumber]   = useState('')
  const [email, setEmail]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [pointsEarned, setPointsEarned]     = useState(0)
  const [formError, setFormError]   = useState<string | null>(null)

  // Pré-remplir depuis localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem(PWA_PHONE_KEY)
    const savedName  = localStorage.getItem(PWA_NAME_KEY)
    if (savedPhone) setPhone(savedPhone)
    if (savedName)  setName(savedName)
  }, [])

  // Charger la promo
  useEffect(() => {
    if (!code) return
    const fetchPromo = async () => {
      try {
        const res = await fetch(`${API_URL}/scan/code/${encodeURIComponent(code)}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.message || 'Promotion introuvable ou expirée')
          return
        }
        setPromo(await res.json())
      } catch {
        setError('Impossible de charger la promotion. Vérifiez votre connexion.')
      } finally {
        setLoading(false)
      }
    }
    fetchPromo()
  }, [code])

  const handleCinInput = (value: string) => {
    // Accepter seulement les chiffres, max 12
    const filtered = value.replace(/\D/g, "").slice(0, 12)
    setCinNumber(filtered)
    setFormError(null)
  }

  const handleSubmit = async () => {
    if (!name.trim())  { setFormError('Votre nom est obligatoire'); return }
    if (!phone.trim()) { setFormError('Votre numéro de téléphone est obligatoire'); return }
    
    // Validation CIN
    if (!cinNumber.trim()) {
      setFormError('Le numéro de CIN est obligatoire')
      return
    }
    if (cinNumber.length !== 12) {
      setFormError('Le numéro de CIN doit contenir exactement 12 chiffres')
      return
    }
    if (!/^\d{12}$/.test(cinNumber)) {
      setFormError('Le numéro de CIN ne peut contenir que des chiffres')
      return
    }

    setFormError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/scan/participate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ 
          promo_code: code, 
          name: name.trim(), 
          phone: phone.trim(), 
          cin_number: cinNumber.trim(),
          email: email.trim() || undefined 
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.message || 'Erreur lors de la participation'); return }

      // Sauvegarder pour les prochains scans
      localStorage.setItem(PWA_PHONE_KEY, phone.trim())
      localStorage.setItem(PWA_NAME_KEY,  name.trim())

      setConfirmMessage(data.message)
      setPointsEarned(data.points_earned || 0)
      setSubmitted(true)
    } catch {
      setFormError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const daysLeft = promo ? Math.max(0, Math.floor((new Date(promo.valid_until).getTime() - Date.now()) / 86400000)) : 0

  // ── Chargement ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 font-sans">Chargement de la promotion...</p>
        </div>
      </div>
    )
  }

  // ── Erreur / Promo invalide ─────────────────────────────────────────────
  if (error || !promo) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg flex flex-col items-center justify-center p-6 pt-16 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-3">
          Promotion introuvable
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-sans mb-8 max-w-sm">
          {error || 'Ce QR code ne correspond à aucune promotion active.'}
        </p>
        <button onClick={() => router.push(`/${locale}/promotions`)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Voir les promotions
        </button>
      </div>
    )
  }

  // ── Confirmation après participation ────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg flex flex-col items-center justify-center p-6 pt-16 text-center">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-4">
          Participation enregistrée !
        </h1>

        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60 max-w-sm w-full mb-6">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
            {confirmMessage}
          </p>
        </div>

        {pointsEarned > 0 && (
          <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl mb-6 max-w-sm w-full">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 font-display">
                +{pointsEarned} point{pointsEarned > 1 ? 's' : ''} gagnés !
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-500 font-sans">Consultez vos avantages</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {pointsEarned > 0 && (
            <button onClick={() => router.push(`/${locale}/mes-avantages`)}
              className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm hover:bg-primary/90 transition-colors">
              Voir mes avantages
            </button>
          )}
          <button onClick={() => router.push(`/${locale}/promotions`)}
            className="w-full py-3 text-neutral-500 dark:text-neutral-400 text-sm font-sans hover:text-neutral-700 transition-colors">
            Retour aux promotions
          </button>
        </div>
      </div>
    )
  }

  // ── Page principale de participation ────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg pt-14 pb-24">

      {/* Header */}
      <div className="sticky top-14 z-40 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="container mx-auto px-4 flex items-center justify-between h-12">
          <button onClick={() => router.push(`/${locale}/promotions`)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Promotions</span>
          </button>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-primary font-display">Participation</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-lg pt-6 space-y-5">

        {/* Card promotion */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60">
          {promo.image_url && (
            <div className="relative w-full aspect-[16/7] overflow-hidden">
              <Image src={promo.image_url} alt={promo.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 512px" quality={75} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {promo.discount_value > 0 && (
                <div className="absolute top-3 left-3">
                  <div className="bg-primary text-white rounded-xl px-3 py-1.5 shadow-lg">
                    <span className="text-base font-black font-sans">
                      {promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `-${promo.discount_value} Ar`}
                    </span>
                  </div>
                </div>
              )}
              {promo.scan_points > 0 && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 text-white rounded-full">
                    <Star className="w-3.5 h-3.5 fill-white" strokeWidth={0} />
                    <span className="text-xs font-bold">+{promo.scan_points} pts</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h1 className="text-xl font-bold text-white font-display leading-tight">{promo.title}</h1>
                {promo.subtitle && <p className="text-sm text-white/80 font-sans mt-0.5">{promo.subtitle}</p>}
              </div>
            </div>
          )}

          <div className="p-5 space-y-3">
            {!promo.image_url && (
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white font-display">{promo.title}</h1>
            )}
            {promo.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">{promo.description}</p>
            )}

            {/* Badge validité */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
              daysLeft > 7 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : daysLeft > 3 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              {daysLeft > 0 ? `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : "Expire aujourd'hui"}
            </div>

            {/* Conditions */}
            {promo.conditions && promo.conditions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Conditions</p>
                {promo.conditions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-600" strokeWidth={2} />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-snug">{c}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de participation */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60 space-y-4">
          <div>
            <h2 className="text-base font-semibold font-display text-neutral-900 dark:text-white mb-1">
              Votre participation
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
              Complétez les informations ci-dessous pour valider votre participation.
            </p>
          </div>

          {/* Nom */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
              <User className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setFormError(null) }}
              placeholder="Ex: Rakoto Jean"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-sans" />
          </div>

          {/* Téléphone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
              <Phone className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setFormError(null) }}
              placeholder="Ex: +261 34 00 000 00"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-sans" />
          </div>

          {/* Numéro de CIN */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
              <CreditCard className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              Numéro de CIN <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              inputMode="numeric"
              maxLength={12}
              value={cinNumber} 
              onChange={e => handleCinInput(e.target.value)}
              placeholder="12 chiffres (ex: 101234567890)"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-sans tracking-wider" />
            <p className="text-xs text-neutral-400 mt-1.5 font-sans">
              {cinNumber.length}/12 chiffres
            </p>
          </div>

          {/* Email optionnel */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
              <Mail className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              Email <span className="text-xs text-neutral-400 font-normal">(optionnel)</span>
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Ex: jean@example.com"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-sans" />
          </div>

          {formError && <p className="text-sm text-red-500 font-sans">{formError}</p>}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-primary text-white rounded-full font-semibold font-sans text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Valider ma participation</>
            )}
          </button>
        </div>

        {/* Points info */}
        {promo.scan_points > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Gift className="w-5 h-5 text-amber-600 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-sans">
              Cette participation vous rapporte <strong>+{promo.scan_points} point{promo.scan_points > 1 ? 's' : ''}</strong> échangeables contre des récompenses.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}