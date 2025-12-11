'use client'

import { useState } from 'react'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import type { Promotion } from '@/types/promotion'
import { promotions, filters, zones, sortOptions, ITEMS_PER_PAGE } from '@/data/promotions'
import { useRouter } from 'next/navigation'

export const PromotionsList: React.FC = () => {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('active')
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('discount_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const filteredPromos = promotions.filter(promo => {
    // Filtre par statut
    if (activeFilter === 'active' && !promo.isActive) return false
    if (activeFilter === 'expired' && promo.isActive) return false

    // Filtre par zones
    if (selectedZones.length > 0) {
      const hasMatchingZone = selectedZones.some(zone => promo.zones.includes(zone))
      if (!hasMatchingZone) return false
    }

    return true
  })

  // Tri des promotions
  const sortedPromos = [...filteredPromos].sort((a, b) => {
    switch (sortBy) {
      case 'discount_desc':
        return b.discount - a.discount
      case 'discount_asc':
        return a.discount - b.discount
      case 'newest':
        return new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
      case 'expiring':
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(sortedPromos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPromos = sortedPromos.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    setCurrentPage(1)
  }

  const handleZoneToggle = (zoneId: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(z => z !== zoneId)
        : [...prev, zoneId]
    )
    setCurrentPage(1)
  }

  const handleViewDetails = (promotionId: string) => {
    router.push(`/promotions/${promotionId}`)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            {sortedPromos.length} promotion{sortedPromos.length !== 1 ? 's' : ''} disponible{sortedPromos.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Filtrez par zone et triez par réduction
          </p>
        </div>

        <div className="flex gap-3">
          {/* Bouton filtres avancés */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border hover:border-primary transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres</span>
            {selectedZones.length > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {selectedZones.length}
              </span>
            )}
          </button>

          {/* Sélecteur de tri */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres avancés (zones) */}
      {showFilters && (
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-dark-border animate-fade-in">
          <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Filtrer par zone</h3>
          <div className="flex flex-wrap gap-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => handleZoneToggle(zone.value)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedZones.includes(zone.value)
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }
                `}
              >
                {zone.label}
              </button>
            ))}
            {selectedZones.length > 0 && (
              <button
                onClick={() => setSelectedZones([])}
                className="px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filtres rapides */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 pl-4 -ml-4">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full
              font-semibold text-sm sm:text-base whitespace-nowrap
              transition-all duration-300 ml-4
              ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                  : 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border hover:border-orange-500 hover:text-orange-500'
              }
            `}
          >
            <span className="text-lg">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Indicateurs de filtres actifs */}
      {(selectedZones.length > 0 || sortBy !== 'discount_desc') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedZones.length > 0 && (
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
              <span>Zones: {selectedZones.length} sélectionnée(s)</span>
              <button
                onClick={() => setSelectedZones([])}
                className="text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          )}
          {sortBy !== 'discount_desc' && (
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1">
              <span>Tri: {sortOptions.find(s => s.id === sortBy)?.label}</span>
              <button
                onClick={() => setSortBy('discount_desc')}
                className="text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grille de promotions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {paginatedPromos.map((promo, index) => (
          <PromotionCard
            key={promo.id}
            promotion={promo}
            delay={index * 0.1}
            //ViewDetails={() => handleViewDetails(promo.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full font-semibold transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white scale-110'
                    : 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border hover:border-primary hover:text-primary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-full bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredPromos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Aucune promotion ne correspond à vos critères
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Essayez de modifier vos filtres ou consultez toutes les promotions
          </p>
          <button
            onClick={() => {
              setActiveFilter('all')
              setSelectedZones([])
              setSortBy('discount_desc')
            }}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Voir toutes les promotions
          </button>
        </div>
      )}
    </div>
  )
}