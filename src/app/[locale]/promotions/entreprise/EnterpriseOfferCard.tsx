'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

interface EnterpriseSettings {
  title:      string
  subtitle:   string
  phone:      string
  show_phone: boolean
}

const DEFAULT_SETTINGS: EnterpriseSettings = {
  title:      "Votre entreprise a besoin de Gaz ?",
  subtitle:   "Découvrez notre offre partenariat conçu pour vous !",
  phone:      "032 07 218 95",
  show_phone: true,
}

export const EnterpriseOfferCard: React.FC = () => {
  const [settings, setSettings] = useState<EnterpriseSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/enterprise_offer_settings`)
        if (!res.ok) return
        const data = await res.json()
        const raw    = data?.setting_value ?? data?.value ?? data
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed && typeof parsed === 'object') {
          setSettings(prev => ({ ...prev, ...parsed }))
        }
      } catch {}
    }
    fetchSettings()
  }, [])

  // Formater le numéro pour le lien tel:
  const phoneLink = `tel:+261${settings.phone.replace(/\s/g, '').replace(/^0/, '')}`

  return (
    <div className="relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">

      {/* Header coloré */}
      <div style={{ backgroundColor: '#008B7F' }} className="px-8 py-10 flex flex-col items-center text-center">

        {/* Icône gaz */}
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2h4" />
            <path d="M12 2v2" />
            <path d="M8 6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
            <path d="M8 10h8" />
            <path d="M8 14h8" />
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {/* Titre */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans mb-2">
          {settings.title}
        </h2>

        {/* Ligne décorative rouge */}
        <div style={{ width: 60, height: 3, backgroundColor: '#E53E3E', borderRadius: 2, marginTop: 16, marginBottom: 16 }} />

        {/* Sous-titre */}
        <p className="text-white/80 text-base sm:text-lg font-sans leading-relaxed max-w-md">
          {settings.subtitle}
        </p>
      </div>

      {/* Corps */}
      <div className="px-8 py-8 flex flex-col items-center gap-6">

        {/* Bouton appel — toujours affiché, numéro conditionnel */}
        <a
          href={phoneLink}
          className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-base transition-all duration-200 shadow-lg shadow-primary/25 active:scale-95"
        >
          <Phone className="w-5 h-5" strokeWidth={1.5} />
          Appeler maintenant{settings.show_phone ? ` — ${settings.phone}` : ''}
        </a>

      </div>
    </div>
  )
}