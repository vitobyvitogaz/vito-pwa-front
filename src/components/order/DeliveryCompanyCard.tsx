'use client'

import { PhoneIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, MapPinIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import type { DeliveryCompany } from '@/data/deliveryCompanies'
import { RatingStars } from './RatingStars'
import Image from 'next/image'

interface DeliveryCompanyCardProps {
  company: DeliveryCompany
  animationDelay?: string
}

export const DeliveryCompanyCard: React.FC<DeliveryCompanyCardProps> = ({ company, animationDelay = '0s' }) => {
  const handlePhoneClick = () => {
    window.location.href = `tel:${company.phone}`
  }

  const handleWhatsAppClick = () => {
    const message = `Bonjour ${company.name}, je suis intéressé(e) par une livraison de gaz. Pouvez-vous me renseigner ?`
    window.open(`https://wa.me/${company.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const handleMessengerClick = () => {
    window.open(company.messenger, '_blank', 'noopener,noreferrer')
  }

  const handleEmailClick = () => {
    const subject = `Demande de livraison de gaz - ${company.name}`
    const body = `Bonjour,\n\nJe souhaiterais obtenir des informations concernant une livraison de gaz.\n\nPourriez-vous me contacter pour discuter des détails ?\n\nCordialement,`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div 
      className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden border border-neutral-200 dark:border-dark-border hover:shadow-xl transition-all duration-300 animate-fade-in-up group"
      style={{ animationDelay }}
    >
      {/* En-tête de la carte avec badge vérifié */}
      <div className="relative bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-dark-surface px-6 py-5 border-b border-neutral-200 dark:border-dark-border">
        {company.verified && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
            <CheckBadgeIcon className="w-3 h-3" />
            Vérifié
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Logo avec fallback */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl overflow-hidden flex items-center justify-center">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`Logo ${company.name}`}
                  width={64}
                  height={64}
                  className="object-contain p-2"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                        ${company.name.charAt(0)}
                      </div>
                    `
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                  {company.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display truncate">
                {company.name}
              </h3>
              <div className="mt-1">
                <RatingStars 
                  rating={company.rating} 
                  reviewCount={company.reviewCount}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {/* Description */}
        <p className="text-neutral-700 dark:text-neutral-300 mb-6 line-clamp-2">
          {company.description}
        </p>

        {/* Informations clés en grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Délai</span>
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white text-lg">{company.deliveryTime}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{company.workingHours}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Couverture</span>
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white text-lg">{company.areas.length} {company.areas.length > 1 ? 'zones' : 'zone'}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{company.deliveryFee || "Tarif variable"}</div>
          </div>
        </div>

        {/* Zones de livraison avec tooltip */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Zones desservies :
          </h4>
          <div className="flex flex-wrap gap-2">
            {company.areas.slice(0, 3).map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
              >
                {area}
              </span>
            ))}
            {company.areas.length > 3 && (
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full text-sm">
                +{company.areas.length - 3} autres
              </span>
            )}
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Services inclus :
          </h4>
          <ul className="space-y-1">
            {company.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Boutons de contact */}
        <div className="pt-6 border-t border-neutral-200 dark:border-dark-border">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Contacter :
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handlePhoneClick}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-xl transition-all group"
              aria-label={`Appeler ${company.name}`}
              title={`Tél: ${company.phone}`}
            >
              <PhoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Appeler</span>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-xl transition-all group"
              aria-label={`WhatsApp ${company.name}`}
              title={`WhatsApp: ${company.whatsapp}`}
            >
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.21c-.226.641-1.25 1.168-1.75 1.238-.389.054-.886.077-1.312-.077-.418-.153-1 .377-1.728.827-2.082-1.257-3.439-4.06-3.542-4.246-.103-.187-.827-1.258-.827-2.399 0-1.142.597-1.702.827-1.997.227-.296.505-.371.674-.371.173 0 .344.005.494.009.163.005.385-.049.598.73.207.76.707 2.632.77 2.823.063.192.104.415.03.642-.073.227-.115.371-.23.576-.115.205-.241.361-.363.541-.123.181-.257.403-.367.541-.115.136-.235.285-.102.56.135.274.604 1.16 1.297 1.876.893.914 1.646 1.203 1.919 1.333.273.13.432.108.593-.064.161-.172.693-.808.88-1.084.187-.277.373-.233.635-.139.262.094 1.667.785 1.954.928.288.143.478.214.547.335.07.121.07.688-.156 1.329z"/>
              </svg>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">WhatsApp</span>
            </button>

            <button
              onClick={handleMessengerClick}
              className="flex flex-col items-center justify-center p-3 bg-[#0084FF]/10 dark:bg-[#0084FF]/20 hover:bg-[#0084FF]/20 dark:hover:bg-[#0084FF]/30 border border-[#0084FF]/20 dark:border-[#0084FF]/30 rounded-xl transition-all group"
              aria-label={`Messenger ${company.name}`}
              title="Ouvrir Messenger"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#0084FF] dark:text-[#4DA6FF] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#006AFF] dark:text-[#4DA6FF]">Messenger</span>
            </button>

            <button
              onClick={handleEmailClick}
              className="flex flex-col items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-xl transition-all group"
              aria-label={`Email ${company.name}`}
              title={`Email: ${company.email}`}
            >
              <EnvelopeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}