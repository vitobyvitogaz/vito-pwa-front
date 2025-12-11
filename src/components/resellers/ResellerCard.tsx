'use client'

import { useState } from 'react'
import type { Reseller } from '@/types/reseller'
import { PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'
import type { DistanceResult } from '@/lib/hooks/useDistanceMatrix'

interface ResellerCardProps {
  reseller: Reseller
  isSelected: boolean
  onClick: () => void
  delay?: number
  distance?: DistanceResult // ✅ CORRECTION : Ajouter la prop distance
}

export const ResellerCard: React.FC<ResellerCardProps> = ({
  reseller,
  isSelected,
  onClick,
  delay = 0,
  distance, // ✅ CORRECTION : Recevoir la distance
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('medium')
    if (reseller.phone) {
      window.location.href = `tel:${reseller.phone}`
    }
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!reseller.whatsapp) return
    
    hapticFeedback('medium')
    const message = encodeURIComponent(
      `Bonjour ${reseller.name}, je souhaite commander du gaz via Vito.`
    )
    window.open(
      `https://wa.me/${reseller.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`,
      '_blank'
    )
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('light')
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${reseller.lat},${reseller.lng}`,
      '_blank'
    )
  }

  // 🟦 Badge dynamique par type
  const getBadgeStyle = () => {
    switch (reseller.type) {
      case 'Quincaillerie':
        return 'bg-red-100 text-red-600'
      case 'Épicerie':
        return 'bg-emerald-100 text-emerald-600'
      case 'Station Service':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getBadgeText = () => {
    switch (reseller.type) {
      case 'Quincaillerie':
        return '🛠️ Quincaillerie'
      case 'Épicerie':
        return '🛒 Épicerie'
      case 'Station Service':
        return '⛽ Station-service'
      default:
        return '🧩 Autres'
    }
  }

  return (
    <div
      onClick={() => {
        hapticFeedback('light')
        onClick()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-5 cursor-pointer
        transition-all duration-300 animate-slide-up
        ${isSelected ? 'ring-2 ring-primary shadow-xl' : 'border border-neutral-200 dark:border-dark-border hover:shadow-lg'}
      `}
      style={{
        animationDelay: `${delay}s`,
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Badge type */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyle()}`}>
          {getBadgeText()}
        </span>
      </div>

      {/* Nom */}
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 pr-24">
        {reseller.name}
      </h3>

      {/* ✅ CORRECTION : Afficher la distance si disponible */}
      {distance && (
        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1 text-primary font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{distance.distance}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{distance.duration}</span>
          </div>
        </div>
      )}

      {/* Adresse */}
      <div className="flex items-start gap-2 mb-3">
        <MapPinIcon className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{reseller.address}</p>
      </div>

      {/* Horaires */}
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-4 h-4 text-neutral-500" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{reseller.hours}</p>
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-2 mb-4">
        {reseller.services?.map(service => (
          <span
            key={service}
            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            {service === 'Bouteille 9kg' && 'Bouteille 9kg'}
            {service === 'Bouteille 13kg' && 'Bouteille 13kg'}
            {service === 'Kit Fatapera' && 'Kit Fatapera'}
            {service === 'Détendeur' && 'Détendeur'}
            {service === 'Pack connectique' && 'Pack connectique'}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCall}
          disabled={!reseller.phone}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            reseller.phone
              ? 'bg-primary text-white hover:bg-primary-600'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
          }`}
        >
          <PhoneIcon className="w-4 h-4" />
          <span>Appeler</span>
        </button>

        <button
          onClick={handleWhatsApp}
          disabled={!reseller.whatsapp}
          className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
            reseller.whatsapp
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
          }`}
          title={reseller.whatsapp ? 'Contacter via WhatsApp' : 'WhatsApp non disponible'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        <button
          onClick={handleDirections}
          className="flex items-center justify-center w-11 h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="Itinéraire"
        >
          <MapPinIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}