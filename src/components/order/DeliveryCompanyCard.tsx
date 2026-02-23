'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { DeliveryCompany } from '@/data/deliveryCompanies'
import { RatingStars } from './RatingStars'
import Image from 'next/image'

interface DeliveryCompanyCardProps {
  company: DeliveryCompany
}

export const DeliveryCompanyCard: React.FC<DeliveryCompanyCardProps> = ({ company }) => {
  const [descExpanded, setDescExpanded] = useState(false)

  const handlePhoneClick = () => {
    window.location.href = `tel:${company.phone}`
  }

  const handleWhatsAppClick = () => {
    if (!company.whatsapp) return
    const message = `Bonjour ${company.name}, je suis intéressé(e) par une livraison de gaz. Pouvez-vous me renseigner ?`
    window.open(`https://wa.me/${company.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const handleMessengerClick = () => {
    if (!company.messenger) return
    window.open(company.messenger, '_blank', 'noopener,noreferrer')
  }

  const handleEmailClick = () => {
    if (!company.email) return
    const subject = `Demande de livraison de gaz - ${company.name}`
    const body = `Bonjour,\n\nJe souhaiterais obtenir des informations concernant une livraison de gaz.\n\nPourriez-vous me contacter pour discuter des détails ?\n\nCordialement,`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="flex flex-col bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:shadow-md transition-all duration-300 h-full">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-start gap-4">

          {/* Logo */}
          <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white flex-shrink-0">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`Logo ${company.name}`}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary bg-primary/10">
                {company.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Nom + rating + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white leading-tight">
                {company.name}
              </h3>
              {company.is_verified && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-xl text-xs font-medium">
                  <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                  Vérifié
                </div>
              )}
            </div>
            <div className="mt-1.5">
              <RatingStars
                rating={company.rating}
                reviewCount={company.review_count}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content — flex-1 pour pousser les boutons en bas */}
      <div className="flex-1 flex flex-col p-5 gap-4">

        {/* Description avec voir plus — hauteur fixe minimum */}
        <div className="min-h-[56px]">
          <p className={`text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed ${descExpanded ? '' : 'line-clamp-2'}`}>
            {company.description || 'Société de livraison de gaz à Madagascar.'}
          </p>
          {company.description && company.description.length > 120 && (
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
            >
              {descExpanded ? (
                <>Voir moins <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Voir plus <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Délai + Couverture avec zones intégrées */}
        <div className="grid grid-cols-2 gap-3">

          {/* Délai */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Délai</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {company.delivery_time || '—'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {company.working_hours || 'Horaires variables'}
            </p>
          </div>

          {/* Couverture + zones */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Couverture</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              {company.delivery_fee || 'Tarif variable'}
            </p>
            <div className="flex flex-wrap gap-1">
              {company.service_areas.slice(0, 3).map((area, index) => (
                <span key={index} className="px-2 py-0.5 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-xs border border-neutral-200 dark:border-neutral-600">
                  {area}
                </span>
              ))}
              {company.service_areas.length > 3 && (
                <span className="px-2 py-0.5 bg-white dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-full text-xs border border-neutral-200 dark:border-neutral-600">
                  +{company.service_areas.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Features — min-height pour aligner les cartes */}
        <div className="flex-1">
          {company.features.length > 0 && (
            <>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Services inclus</p>
              <ul className="space-y-1.5">
                {company.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{feature}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

      </div>

      {/* Contact buttons — toujours collés en bas */}
      <div className="px-5 pb-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Contacter</p>
        <div className="grid grid-cols-4 gap-2">

          {/* Téléphone */}
          <button
            onClick={handlePhoneClick}
            className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-200 group"
            title={`Tél: ${company.phone}`}
          >
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Appel</span>
          </button>

          {/* WhatsApp */}
          {company.whatsapp ? (
            <button
              onClick={handleWhatsAppClick}
              className="flex flex-col items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all duration-200 group"
              title={`WhatsApp: ${company.whatsapp}`}
            >
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">WhatsApp</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl opacity-40 cursor-not-allowed">
              <svg className="w-5 h-5 text-neutral-400 mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-medium text-neutral-400">WhatsApp</span>
            </div>
          )}

          {/* Messenger */}
          {company.messenger ? (
            <button
              onClick={handleMessengerClick}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-200 group"
              title="Ouvrir Messenger"
            >
              <svg className="w-5 h-5 text-[#0084FF] mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.626 0 12-4.975 12-11.111S18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
              </svg>
              <span className="text-xs font-medium text-[#006AFF] dark:text-[#4DA6FF]">Messenger</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl opacity-40 cursor-not-allowed">
              <svg className="w-5 h-5 text-neutral-400 mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.626 0 12-4.975 12-11.111S18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
              </svg>
              <span className="text-xs font-medium text-neutral-400">Messenger</span>
            </div>
          )}

          {/* Email */}
          {company.email ? (
            <button
              onClick={handleEmailClick}
              className="flex flex-col items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl transition-all duration-200 group"
              title={`Email: ${company.email}`}
            >
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Email</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl opacity-40 cursor-not-allowed">
              <Mail className="w-5 h-5 text-neutral-400 mb-1" strokeWidth={1.5} />
              <span className="text-xs font-medium text-neutral-400">Email</span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}