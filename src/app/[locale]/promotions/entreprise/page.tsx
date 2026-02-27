'use client'

import { useRouter, usePathname } from 'next/navigation'
import { EnterpriseOffersList } from './EnterpriseOffersList'
import { Sparkles, Building2, Users, Phone, Mail } from 'lucide-react'

export default function EntrepriseOffresPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight font-sans">
            Promotions & Offres
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide font-sans">
              Des offres adaptées à chaque profil, particuliers comme professionnels
            </p>
            <div className="h-px w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
          </div>
        </div>

        {/* Onglets niveau 1 */}
        <div className="flex justify-center">
            <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 mb-10 rounded-full p-1 gap-0">
            <button
                onClick={() => router.push(`/${locale}/promotions`)}
                className="flex items-center gap-2 px-6 py-3 rounded-l-full rounded-r-none text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all duration-300"
            >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Promos Grand Public
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-r-full rounded-l-none text-sm font-semibold bg-white dark:bg-dark-surface text-primary shadow-sm transition-all duration-300">
                <Building2 className="w-4 h-4" strokeWidth={1.5} />
                Offres Entreprise
            </button>
            </div>
        </div>
        {/* Bandeau intro */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Solutions professionnelles Vitogaz</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Des offres sur mesure pour les entreprises, industries et groupes hôteliers.
                  Tarifs préférentiels, service dédié et garantie d&apos;approvisionnement.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{'+ 200'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Entreprises clientes</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-2xl font-bold text-white">24h</p>
                <p className="text-xs text-slate-400 mt-0.5">Délai de livraison</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{'-20%'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Jusqu&apos;à sur tarif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <EnterpriseOffersList />
        </div>

        {/* Bloc contact */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Besoin d&apos;une offre personnalisée ?
              </h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              Notre équipe commerciale étudie votre cas et vous propose une solution adaptée à vos volumes et contraintes spécifiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              
               <a href="tel:+261340000000"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all duration-200"
              >
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                Appeler un conseiller
              </a>
              
              <a  href="mailto:entreprises@vitogaz.mg"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                entreprises@vitogaz.mg
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}