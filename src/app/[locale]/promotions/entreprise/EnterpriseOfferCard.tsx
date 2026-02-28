'use client'

import { Phone } from 'lucide-react'

export const EnterpriseOfferCard: React.FC = () => {
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
          Votre entreprise a besoin de Gaz ?
        </h2>

        {/* Ligne décorative rouge */}
        <div style={{ width: 60, height: 3, backgroundColor: '#E53E3E', borderRadius: 2, marginTop: 16, marginBottom: 16 }} />

        {/* Sous-titre */}
        <p className="text-white/80 text-base sm:text-lg font-sans leading-relaxed max-w-md">
          Découvrez notre offre partenariat conçu pour vous !
        </p>
      </div>

      {/* Corps */}
      <div className="px-8 py-8 flex flex-col items-center gap-6">

        {/* Info contact */}
        <div className="w-full flex flex-col sm:flex-row gap-4">
          
          <a href="tel:+261320721895"
            className="flex-1 flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-sans mb-0.5">Téléphone</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white font-sans">032 07 218 95</p>
            </div>
          </a>

          
          <a href="mailto:entreprises@vitogaz.mg"
            className="flex-1 flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-sans mb-0.5">Email</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white font-sans">entreprises@vitogaz.mg</p>
            </div>
          </a>
        </div>

        {/* CTA principal */}
        
         <a href="tel:+261320721895"
          className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
        >
          <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          Contactez-nous
        </a>

      </div>
    </div>
  )
}