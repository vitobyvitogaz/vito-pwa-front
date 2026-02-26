'use client'

import { useState, useEffect } from 'react'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { Filter, ChevronLeft, ChevronRight, MapPin, X, Loader2, Tag as TagIcon } from 'lucide-react'
import type { Promotion } from '@/types/promotion'
import { filters, zones, sortOptions, ITEMS_PER_PAGE } from '@/data/promotions'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1';

export const PromotionsList: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('active')
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('discount_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/promotions`)
      if (!response.ok) throw new Error('Erreur lors du chargement')
      const data = await response.json()
      setPromotions(data)
      setError(null)
    } catch (err) {
      console.error('Erreur fetch promotions:', err)
      setError('Impossible de charger les promotions')
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPromos = promotions.filter(promo => {
    if (activeFilter === 'active' && !promo.is_active) return false
    if (activeFilter === 'expired' && promo.is_active) return false
    if (selectedZones.length > 0) {
      const hasMatchingZone = selectedZones.some(zone => promo.zones.includes(zone))
      if (!hasMatchingZone) return false
    }
    return true
  })

  const sortedPromos = [...filteredPromos].sort((a, b) => {
    switch (sortBy) {
      case 'discount_desc': return b.discount_value - a.discount_value
      case 'discount_asc': return a.discount_value - b.discount_value
      case 'newest': return new Date(b.valid_until).getTime() - new Date(a.valid_until).getTime()
      case 'expiring': return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime()
      default: return 0
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">Chargement des promotions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center">
          <TagIcon className="w-10 h-10 text-red-500" strokeWidth={1} />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">{error}</h3>
        <button
          onClick={fetchPromotions}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white font-sans mb-2">
            {sortedPromos.length} promotion{sortedPromos.length !== 1 ? 's' : ''} disponible{sortedPromos.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">
            Filtrez par zone et triez par réduction
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors duration-200 font-sans"
          >
            <Filter className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Filtres</span>
            {selectedZones.length > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {selectedZones.length}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
            className="px-4 py-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors font-sans"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 animate-fade-in">
          <h3 className="font-semibold text-neutral-800 dark:text-white mb-4 font-sans">Filtrer par zone</h3>
          <div className="flex flex-wrap gap-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => handleZoneToggle(zone.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 font-sans ${
                  selectedZones.includes(zone.value)
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {zone.label}
              </button>
            ))}
            {selectedZones.length > 0 && (
              <button
                onClick={() => setSelectedZones([])}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-sans transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick filters */}
      <div className="flex gap-2 mb-6 pb-2 justify-center">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`
              relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
              after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
              after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
              hover:after:w-full font-sans
              ${activeFilter === filter.id
                ? 'text-primary after:w-full'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Active filters indicators */}
      {(selectedZones.length > 0 || sortBy !== 'discount_desc') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedZones.length > 0 && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm flex items-center gap-2 border border-blue-200 dark:border-blue-800">
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              <span>Zones: {selectedZones.length}</span>
              <button onClick={() => setSelectedZones([])} className="text-blue-500 hover:text-blue-700">
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          )}
          {sortBy !== 'discount_desc' && (
            <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm flex items-center gap-2 border border-purple-200 dark:border-purple-800">
              <span>Tri: {sortOptions.find(s => s.id === sortBy)?.label}</span>
              <button onClick={() => setSortBy('discount_desc')} className="text-purple-500 hover:text-purple-700">
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Promotions grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedPromos.map((promo, index) => (
          <PromotionCard
            key={promo.id}
            promotion={promo}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 font-sans ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredPromos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
            <TagIcon className="w-10 h-10 text-neutral-400" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
            Aucune promotion ne correspond à vos critères
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-sans">
            Essayez de modifier vos filtres ou consultez toutes les promotions
          </p>
          <button
            onClick={() => { setActiveFilter('all'); setSelectedZones([]); setSortBy('discount_desc') }}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
          >
            Voir toutes les promotions
          </button>
        </div>
      )}
    </div>
  )
}