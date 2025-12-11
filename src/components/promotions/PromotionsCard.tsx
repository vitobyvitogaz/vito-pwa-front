// src/components/promotions/PromotionCard.tsx
'use client'

import { useState, useEffect } from 'react'
import type { Promotion } from '@/types/promotion'
import { 
  ClockIcon, 
  TagIcon, 
  CheckIcon, 
  ChevronDownIcon,
  CalendarDaysIcon,
  MapPinIcon,
  InformationCircleIcon,
  ShareIcon
} from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?: number
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, delay = 0 }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(promotion.validUntil).getTime()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('00:00:00:00')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const formatted = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setTimeLeft(formatted)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [promotion.validUntil])

  const handleCopyCode = () => {
    if (!promotion.code) return
    
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.code)
    setCopied(true)
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleExpand = () => {
    hapticFeedback('light')
    setIsAnimating(true)
    setIsExpanded(!isExpanded)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleShare = () => {
    hapticFeedback('medium')
    if (navigator.share) {
      navigator.share({
        title: promotion.title,
        text: `Découvrez cette promotion : ${promotion.description}`,
        url: window.location.href,
      })
    }
  }

  const getTimeColor = () => {
    if (isExpired) return 'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    
    const now = new Date().getTime()
    const end = new Date(promotion.validUntil).getTime()
    const diff = end - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 7) return 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
    if (days > 3) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ✅ CORRECTION : Utiliser des valeurs par défaut pour les propriétés optionnelles
  const validFrom = (promotion as any).validFrom || new Date()
  const conditions = (promotion as any).conditions || `Réduction de ${promotion.discount}% valable selon conditions`
  const fullDescription = promotion.description // Utiliser la description existante
  const resellers = (promotion as any).resellers || [] // Tableau vide par défaut

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-3xl transition-all duration-500 animate-slide-up group"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: isHovered
          ? '0 25px 60px -15px rgba(0,0,0,0.25)'
          : '0 10px 30px -10px rgba(0,0,0,0.15)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      {/* Carte principale */}
      <div className="relative">
        {/* Image de fond avec overlay - HAUTEUR AUGMENTÉE À h-80 */}
        <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
          <img
            src={promotion.image}
            alt={promotion.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: 'center center' }} // Centre l'image pour éviter le recadrage
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          {/* Badge réduction - SEULEMENT si discount > 0 */}
          {promotion.discount > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-600 rounded-2xl blur-md opacity-75" />
                <div className="relative bg-gradient-to-br from-accent to-accent-600 text-white rounded-2xl px-5 py-3 shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                  <div className="text-3xl font-bold leading-none">-{promotion.discount}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Badge statut */}
          {!promotion.isActive && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black/80 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-semibold border border-white/20">
                Expirée
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="bg-white dark:bg-dark-surface p-5 sm:p-6">
          {/* Titre et description */}
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2 font-display line-clamp-2">
              {promotion.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
              {promotion.description}
            </p>
          </div>

          {/* Informations rapides */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Timer */}
            {promotion.isActive && !isExpired && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getTimeColor()} text-sm font-semibold border`}>
                <ClockIcon className="w-4 h-4" />
                <span className="font-mono text-xs sm:text-sm">{timeLeft}</span>
              </div>
            )}

            {/* Date de validité */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800">
              <CalendarDaysIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Jusqu'au {new Date(promotion.validUntil).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Code promo avec bouton copier */}
          {promotion.code && (
            <div className="mb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Code promo
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-sm text-primary dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Partager</span>
                </button>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-full group/btn"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-2 border-primary/20 dark:border-primary/30 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="relative flex items-center justify-between p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-400 font-mono">
                          {promotion.code}
                        </div>
                        <div className="text-xs text-primary/70 dark:text-primary-300">
                          Cliquez pour copier
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {copied ? (
                        <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <CheckIcon className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-semibold">Copié !</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary dark:bg-primary-600 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Bouton accordéon */}
          <button
            onClick={handleToggleExpand}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300 border border-neutral-200 dark:border-dark-border"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary-400" />
              <span className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                Voir les détails
              </span>
            </div>
            <ChevronDownIcon 
              className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section accordéon (détails) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        } ${isAnimating ? 'pointer-events-none' : ''}`}
      >
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-dark-border">
          <div className="p-4 sm:p-6">
            {/* En-tête section détaillée */}
            <div className="mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-1 sm:mb-2">
                Détails de la promotion
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Toutes les informations importantes concernant cette offre
              </p>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Validité */}
              <div className="bg-white dark:bg-dark-surface rounded-xl p-3 sm:p-4 border border-neutral-200 dark:border-dark-border">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                      Validité
                    </h5>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Période d'application
                    </p>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-neutral-100 dark:border-dark-border">
                    <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Début</span>
                    <span className="font-medium text-neutral-900 dark:text-white text-xs sm:text-sm">
                      {new Date(validFrom).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Fin</span>
                    <span className="font-medium text-neutral-900 dark:text-white text-xs sm:text-sm">
                      {formatDate(promotion.validUntil)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white dark:bg-dark-surface rounded-xl p-3 sm:p-4 border border-neutral-200 dark:border-dark-border">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                      Conditions
                    </h5>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Règles d'application
                    </p>
                  </div>
                </div>
                <ul className="space-y-1 sm:space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      Réduction de {promotion.discount}% sur le produit concerné
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      {conditions}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Description complète */}
            {fullDescription && (
              <div className="mb-4 sm:mb-6">
                <h5 className="font-semibold text-neutral-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                  Description complète
                </h5>
                <div className="bg-white dark:bg-dark-surface rounded-xl p-3 sm:p-4 border border-neutral-200 dark:border-dark-border">
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
                    {fullDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Points de vente */}
            {resellers.length > 0 && (
              <div>
                <h5 className="font-semibold text-neutral-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                  Points de vente participants
                </h5>
                <div className="bg-white dark:bg-dark-surface rounded-xl p-3 sm:p-4 border border-neutral-200 dark:border-dark-border">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                        Cette promotion est disponible chez {resellers.length} revendeur{resellers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {resellers.slice(0, 5).map((reseller: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        {reseller}
                      </span>
                    ))}
                    {resellers.length > 5 && (
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full text-xs sm:text-sm font-medium text-primary dark:text-primary-400">
                        +{resellers.length - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bouton d'action principal */}
            {/*}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-200 dark:border-dark-border">
              <button
                onClick={handleCopyCode}
                disabled={isExpired || !promotion.isActive}
                className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 ${
                  isExpired || !promotion.isActive
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isExpired || !promotion.isActive ? (
                  'Offre expirée'
                ) : copied ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Code copié !</span>
                  </div>
                ) : (
                  'Utiliser cette promotion'
                )}
              </button>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  )
}