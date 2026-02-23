'use client'

import { useState, useEffect } from 'react'
import { Truck, Loader2 } from 'lucide-react'
import { DeliveryCompanyCard } from '@/components/order/DeliveryCompanyCard'
import { 
  type DeliveryCompany,
  filterTypes, 
  filterCompanies, 
  sortCompanies 
} from '@/data/deliveryCompanies'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1';

export default function DeliveryPage() {
  const [deliveryCompanies, setDeliveryCompanies] = useState<DeliveryCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'name' | 'reviewCount'>('rating')
  const [filteredCompanies, setFilteredCompanies] = useState<DeliveryCompany[]>([])

  const stats = {
    totalCompanies: deliveryCompanies.length,
    averageRating: deliveryCompanies.length > 0 
      ? Number((deliveryCompanies.reduce((acc, c) => acc + c.rating, 0) / deliveryCompanies.length).toFixed(1))
      : 0,
    fastestDelivery: deliveryCompanies.length > 0
      ? Math.min(...deliveryCompanies.map(c => {
          const time = c.delivery_time ? parseInt(c.delivery_time.match(/\d+/)?.[0] || '999') : 999
          return time
        }))
      : 0,
    verifiedCount: deliveryCompanies.filter(c => c.is_verified).length
  }

  useEffect(() => {
    fetchDeliveryCompanies()
  }, [])

  useEffect(() => {
    let result = filterCompanies(deliveryCompanies, selectedFilter, searchQuery)
    result = sortCompanies(result, sortBy)
    setFilteredCompanies(result)
  }, [selectedFilter, searchQuery, sortBy, deliveryCompanies])

  const fetchDeliveryCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/delivery-companies`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      
      const data = await response.json()
      
      // Filtrer uniquement les sociétés actives
      const activeCompanies = data.filter((company: DeliveryCompany) => company.is_active)
      
      setDeliveryCompanies(activeCompanies)
      setError(null)
    } catch (err) {
      console.error('Erreur fetch delivery companies:', err)
      setError('Impossible de charger les sociétés de livraison')
      setDeliveryCompanies([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">Chargement des sociétés de livraison...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center">
            <Truck className="w-10 h-10 text-red-500" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
            {error}
          </h3>
          <button
            onClick={fetchDeliveryCompanies}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-xl bg-gradient-to-br from-primary to-primary-600 shadow-lg">
            <Truck className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight font-sans">
            Se faire livrer du gaz
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide font-sans">
              Comparez et contactez directement les meilleures sociétés de livraison de gaz près de chez vous
            </p>
            <div className="h-px w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent"></div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12">
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 text-center border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stats.totalCompanies}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">Sociétés</div>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 text-center border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{stats.averageRating}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">Note moyenne</div>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 text-center border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stats.fastestDelivery}h</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">Plus rapide</div>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 text-center border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{stats.verifiedCount}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">Vérifiées</div>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une société, une ville, un service..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans"
              >
                <option value="rating">Meilleures notes</option>
                <option value="deliveryTime">Plus rapide</option>
                <option value="reviewCount">Plus d'avis</option>
                <option value="name">Ordre alphabétique</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 pb-2 justify-center">
            {filterTypes.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`
                  relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300
                  after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
                  hover:after:w-full font-sans
                  ${
                    selectedFilter === filter.id
                      ? 'text-primary after:w-full'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm font-sans">
              {filteredCompanies.length} société{filteredCompanies.length > 1 ? 's' : ''} trouvée{filteredCompanies.length > 1 ? 's' : ''}
              {selectedFilter !== 'all' && ` • ${filterTypes.find(f => f.id === selectedFilter)?.label}`}
              {searchQuery && ` • Recherche : "${searchQuery}"`}
            </p>
            {selectedFilter !== 'all' && (
              <button
                onClick={() => setSelectedFilter('all')}
                className="text-sm font-medium text-primary hover:text-primary-600 transition-colors font-sans"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>

        {/* Company cards */}
        <div className="mb-12">
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <div key={company.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <DeliveryCompanyCard company={company} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
                <Truck className="w-10 h-10 text-neutral-400" strokeWidth={1} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
                Aucune société ne correspond à votre recherche
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-sans max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou utilisez des termes différents.
              </p>
              <button
                onClick={() => {
                  setSelectedFilter('all')
                  setSearchQuery('')
                }}
                className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
              >
                Voir toutes les sociétés
              </button>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-6 text-center font-sans">
            Comment se faire livrer ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2 font-sans">
                Choisissez une société
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Comparez les services, délais et avis des différentes sociétés de livraison.
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2 font-sans">
                Contactez directement
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Utilisez le moyen de contact de votre choix : téléphone, WhatsApp ou Messenger.
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2 font-sans">
                Recevez votre gaz
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                La société vous livre à domicile et peut même installer l'équipement si besoin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}