'use client'

import { useState, useEffect } from 'react'
// import { DeliveryInfo } from '@/components/order/DeliveryInfo'
// import { OrderFAQ } from '@/components/order/OrderFAQ'
import { TruckIcon } from '@heroicons/react/24/solid'
import { DeliveryCompanyCard } from '@/components/order/DeliveryCompanyCard'
import { 
  deliveryCompanies, 
  filterTypes, 
  filterCompanies, 
  sortCompanies 
} from '@/data/deliveryCompanies'

// Hook pour détecter les préférences de réduction de mouvement
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Vérifier si window est défini (éviter l'erreur SSR)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

export default function DeliveryPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'name' | 'reviewCount'>('rating')
  const [filteredCompanies, setFilteredCompanies] = useState(deliveryCompanies)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Calcul des délais d'animation conditionnels
  const getAnimationDelay = (index: number) => {
    if (prefersReducedMotion) return '0s'
    return `${index * 0.1}s`
  }

  const getAnimationClass = (index: number) => {
    if (prefersReducedMotion) return ''
    return `animate-fade-in-up`
  }

  // Calcul des statistiques
  const stats = {
    totalCompanies: deliveryCompanies.length,
    averageRating: Number((deliveryCompanies.reduce((acc, c) => acc + c.rating, 0) / deliveryCompanies.length).toFixed(1)),
    fastestDelivery: Math.min(...deliveryCompanies.map(c => parseInt(c.deliveryTime.match(/\d+/)?.[0] || '999'))),
    verifiedCount: deliveryCompanies.filter(c => c.verified).length
  }

  // Filtrer et trier les sociétés
  useEffect(() => {
    let result = filterCompanies(deliveryCompanies, selectedFilter, searchQuery)
    result = sortCompanies(result, sortBy)
    setFilteredCompanies(result)
  }, [selectedFilter, searchQuery, sortBy])

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg pt-14 sm:pt-16 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <div className={`text-center mb-10 sm:mb-14 ${getAnimationClass(0)}`} style={{ animationDelay: getAnimationDelay(0) }}>
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent to-accent-600 rounded-3xl mb-6 sm:mb-8 shadow-xl">
              <TruckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 sm:mb-6 font-display">
              Se faire livrer du gaz
            </h1>
            
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed sm:leading-loose">
              Comparez et contactez directement les meilleures sociétés de livraison de gaz près de chez vous
            </p>
          </div>

          {/* Statistiques avec données dynamiques */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 sm:mb-12 ${getAnimationClass(1)}`} style={{ animationDelay: getAnimationDelay(1) }}>
            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalCompanies}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Sociétés</div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.averageRating}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Note moyenne</div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.fastestDelivery}h</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Plus rapide</div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.verifiedCount}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Vérifiées</div>
            </div>
          </div>

          {/* Contrôles de recherche et tri */}
          <div className={`mb-10 sm:mb-12 ${getAnimationClass(2)}`} style={{ animationDelay: getAnimationDelay(2) }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une société, une ville, un service..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-bg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Sélecteur de tri */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-bg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                >
                  <option value="rating">Meilleures notes</option>
                  <option value="deliveryTime">Plus rapide</option>
                  <option value="reviewCount">Plus d'avis</option>
                  <option value="name">Ordre alphabétique</option>
                </select>
              </div>
            </div>

            {/* Filtres */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {filterTypes.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedFilter === filter.id
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {filteredCompanies.length} société{filteredCompanies.length > 1 ? 's' : ''} trouvée{filteredCompanies.length > 1 ? 's' : ''}
                {selectedFilter !== 'all' && ` • ${filterTypes.find(f => f.id === selectedFilter)?.label}`}
                {searchQuery && ` • Recherche : "${searchQuery}"`}
              </p>
              {selectedFilter !== 'all' && (
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="text-sm text-primary hover:text-primary-600 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>

          {/* Cartes des sociétés */}
          <div className={`mb-12 ${getAnimationClass(3)}`} style={{ animationDelay: getAnimationDelay(3) }}>
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company, index) => (
                  <DeliveryCompanyCard
                    key={company.id}
                    company={company}
                    animationDelay={getAnimationDelay(index + 4)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <TruckIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                  Aucune société ne correspond à votre recherche
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-4">
                  Essayez de modifier vos critères de recherche ou utilisez des termes différents.
                </p>
                <button
                  onClick={() => {
                    setSelectedFilter('all')
                    setSearchQuery('')
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Voir toutes les sociétés
                </button>
              </div>
            )}
          </div>

          {/* Comment ça marche */}
          <div className={`mb-12 ${getAnimationClass(10)}`} style={{ animationDelay: getAnimationDelay(10) }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-6 text-center font-display">
              Comment se faire livrer ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                  Choisissez une société
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Comparez les services, délais et avis des différentes sociétés de livraison.
                </p>
              </div>
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                  Contactez directement
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Utilisez le moyen de contact de votre choix : téléphone, WhatsApp ou Messenger.
                </p>
              </div>
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                  Recevez votre gaz
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  La société vous livre à domicile et peut même installer l'équipement si besoin.
                </p>
              </div>
            </div>
          </div>

          {/* Informations de livraison - TEMPORAIREMENT COMMENTÉ */}
          {/* <div 
            className="mb-12 animate-fade-in-up"
            style={{ animationDelay: getAnimationDelay(11) }}
          >
            <DeliveryInfo />
          </div> */}

          {/* FAQ - TEMPORAIREMENT COMMENTÉ */}
          {/* <div 
            className="animate-fade-in-up"
            style={{ animationDelay: getAnimationDelay(12) }}
          >
            <OrderFAQ />
          </div> */}
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          opacity: 0;
        }
        
        /* Optimisation pour les appareils mobiles */
        @media (max-width: 640px) {
          .animate-fade-in-up {
            animation-duration: 0.4s;
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        }
        
        /* Respect des préférences de réduction de mouvement */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  )
}