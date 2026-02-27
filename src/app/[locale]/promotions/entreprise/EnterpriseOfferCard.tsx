'use client'

import { useState } from 'react'
import { CheckCircle, Clock, ArrowRight, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react'

export interface EnterpriseOffer {
  id: string
  badge: string
  sector: string
  title: string
  subtitle: string
  description: string
  discount: string
  discountLabel: string
  features: string[]
  cta: string
  ctaPhone?: string
  ctaEmail?: string
  highlight: boolean
  validUntil: string
  isActive: boolean
}

// Couleur dérivée du secteur — géré dans la carte, pas dans les données
const getSectorStyle = (sector: string): string => {
  const map: Record<string, string> = {
    'Industrie':    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'PME':          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'HoReCa':       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Multi-sites':  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Nouveau':      'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  }
  return map[sector] ?? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
}

interface EnterpriseOfferCardProps {
  offer: EnterpriseOffer
}

export const EnterpriseOfferCard: React.FC<EnterpriseOfferCardProps> = ({ offer }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`relative flex flex-col bg-white dark:bg-dark-surface rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg h-full ${
        offer.highlight
          ? 'border-primary/40 shadow-md shadow-primary/10'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      {/* Barre top highlight */}
      {offer.highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-600" />
      )}

      {/* Badge meilleure offre */}
      {offer.highlight && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary text-white px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm">
          ★ Meilleure offre
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${getSectorStyle(offer.sector)}`}>
              {offer.badge}
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              {offer.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {offer.subtitle}
            </p>
          </div>
          {/* Remise */}
          <div className="flex-shrink-0 text-center bg-primary/10 dark:bg-primary/20 rounded-xl px-3 py-2 min-w-[64px]">
            <p className="text-xl font-black text-primary leading-none">{offer.discount}</p>
            <p className="text-[10px] text-primary/70 mt-0.5 leading-tight">{offer.discountLabel}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {offer.description}
        </p>

        {/* Features collapsible */}
        <div className="flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors mb-2"
          >
            {expanded
              ? <><ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />Masquer les avantages</>
              : <><ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />Voir les avantages ({offer.features.length})</>
            }
          </button>

          <ul className="space-y-1.5">
            {(expanded ? offer.features : offer.features.slice(0, 3)).map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">{feature}</span>
              </li>
            ))}
            {!expanded && offer.features.length > 3 && (
              <li className="text-xs text-neutral-400 dark:text-neutral-500 pl-5">
                +{offer.features.length - 3} autre{offer.features.length - 3 > 1 ? 's' : ''} avantage{offer.features.length - 3 > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>

        {/* Validité */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Offre valable jusqu&apos;au {offer.validUntil}
          </span>
        </div>

      </div>

      {/* Footer boutons — toujours collés en bas */}
      <div className="px-5 pb-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">

        {/* CTA principal */}
        
        <a href={offer.ctaPhone ? `tel:${offer.ctaPhone}` : offer.ctaEmail ? `mailto:${offer.ctaEmail}?subject=Demande - ${offer.title}` : '#'}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
            offer.highlight
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
          }`}
        >
          {offer.cta}
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </a>

        {/* Boutons contact secondaires */}
        {(offer.ctaPhone || offer.ctaEmail) && (
          <div className="grid grid-cols-2 gap-2">
            {offer.ctaPhone && (
              
            <a href={`tel:${offer.ctaPhone}`}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-200 group"
              >
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Appeler</span>
              </a>
            )}
            {offer.ctaEmail && (
              
            <a href={`mailto:${offer.ctaEmail}?subject=Demande - ${offer.title}`}
                className="flex flex-col items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl transition-all duration-200 group"
              >
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Email</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}