'use client'

import { useState } from 'react'
import type { Reseller } from '@/types/reseller'
//import { Phone, MapPin, Clock, Navigation, MessageCircle, Wrench, ShoppingBag, Truck, Store } from 'lucide-react'
import { Phone, MapPin, Clock, Navigation, MessageCircle, Wrench, ShoppingBag, Truck, Store, Fuel, ShoppingCart, Home } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'
import type { DistanceResult } from '@/lib/hooks/useDistanceMatrix'
import { BusinessHoursCompact } from './BusinessHoursCompact'
import { ProductsDisplayCompact } from './ProductsDisplayCompact'

interface ResellerCardProps {
  reseller: Reseller
  isSelected: boolean
  onClick: () => void
  delay?: number
  distance?: DistanceResult
}

export const ResellerCard: React.FC<ResellerCardProps> = ({
  reseller,
  isSelected,
  onClick,
  delay = 0,
  distance,
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

  const getBadgeColor = () => {
  switch (reseller.type) {
    case 'Quincaillerie': return '#C8102E'
    case 'Épicerie': return '#008B7F'
    case 'Station Service': return '#FF8C00'
    case 'Libre Service': return '#7C3AED'
    case 'Maison du gaz': return '#0EA5E9'
    default: return '#4B5563'
  }
}

const getTypeIcon = () => {
  switch (reseller.type) {
    case 'Quincaillerie': return Wrench
    case 'Épicerie': return ShoppingBag
    case 'Station Service': return Fuel
    case 'Libre Service': return ShoppingCart
    case 'Maison du gaz': return Home
    default: return Store
  }
}

  const TypeIcon = getTypeIcon()

  return (
    <div
      onClick={() => {
        hapticFeedback('light')
        onClick()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden bg-white dark:bg-dark-surface rounded-xl p-5 cursor-pointer
        transition-all duration-300 animate-slide-up border
        ${isSelected ? 'ring-2 ring-primary shadow-sm' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'}
      `}
      style={{
        animationDelay: `${delay}s`,
        transform: isHovered || isSelected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Badge type avec icône */}
      <div className="absolute top-4 right-4">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/40 text-white"
          style={{ backgroundColor: getBadgeColor() }}
        >
          <TypeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{reseller.type}</span>
        </div>
      </div>

      {/* Nom */}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 pr-28 tracking-tight leading-tight">
        {reseller.name}
      </h3>

      {/* Badge Ouvert/Fermé */}
      {reseller.business_status && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              reseller.business_status.isOpen
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                reseller.business_status.isOpen ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {reseller.business_status.isOpen ? 'OUVERT' : 'FERMÉ'}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {reseller.business_status.message}
          </span>
        </div>
      )}

      {/* Distance si disponible */}
      {distance && (
        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <Navigation className="w-4 h-4" strokeWidth={1.5} />
            <span>{distance.distance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span>{distance.duration}</span>
          </div>
        </div>
      )}

      {/* Adresse */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{reseller.address}</p>
      </div>

      {/* Horaires compacts */}
      {reseller.hours && (
        <div className="mb-3">
          <BusinessHoursCompact
            hours={reseller.hours}
            currentDay={reseller.business_status?.currentDay}
            isOpen={reseller.business_status?.isOpen}
          />
        </div>
      )}

      {/* Produits compacts */}
      <div className="mb-4">
        <ProductsDisplayCompact reseller={reseller} />
      </div>

      {/* Services */}
      {Array.isArray(reseller.services) && reseller.services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {reseller.services.map(service => (
            <span
              key={service}
              className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCall}
          disabled={!reseller.phone}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            reseller.phone
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Phone className="w-4 h-4" strokeWidth={1.5} />
          <span>Appeler</span>
        </button>

        <button
          onClick={handleWhatsApp}
          disabled={!reseller.whatsapp}
          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
            reseller.whatsapp
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
          }`}
          title={reseller.whatsapp ? 'Contacter via WhatsApp' : 'WhatsApp non disponible'}
        >
          <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <button
          onClick={handleDirections}
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
          title="Itinéraire"
        >
          <MapPin className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}