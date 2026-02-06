'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Reseller } from '@/types/reseller'
import { RefreshCw } from 'lucide-react'

interface MapFiltersProps {
  resellers: Reseller[]
  onFilterChange: (filtered: Reseller[]) => void
}

export const MapFilters: React.FC<MapFiltersProps> = ({ resellers, onFilterChange }) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('all')

  const cities = Array.from(new Set(resellers.map(r => r.city))).sort()

  // Extraction dynamique des segments/types uniques
  const availableSegments = useMemo(() => {
    const segmentsSet = new Set(resellers.map(r => r.type).filter(Boolean))
    return Array.from(segmentsSet).sort()
  }, [resellers])

  // Extraction dynamique des produits uniques depuis reseller_products
  const availableProducts = useMemo(() => {
    const productsMap = new Map<string, { id: string; name: string; category: string }>()
    
    resellers.forEach(reseller => {
      if (Array.isArray(reseller.reseller_products)) {
        reseller.reseller_products.forEach(rp => {
          if (rp.products && !productsMap.has(rp.products.id)) {
            productsMap.set(rp.products.id, {
              id: rp.products.id,
              name: rp.products.name,
              category: rp.products.category || 'Autre'
            })
          }
        })
      }
    })

    // Tri alphabétique par nom
    return Array.from(productsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [resellers])

  const applyFilters = useCallback(() => {
    let filtered = resellers

    if (selectedSegment !== 'all') {
      filtered = filtered.filter(r => r.type === selectedSegment)
    }

    if (selectedProducts.length > 0) {
      filtered = filtered.filter(r => {
        if (!Array.isArray(r.reseller_products)) return false
        const resellerProductIds = r.reseller_products.map(rp => rp.product_id)
        return selectedProducts.every(productId => resellerProductIds.includes(productId))
      })
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(r => r.city === selectedCity)
    }

    console.log('🎯 Filtres appliqués:', filtered.length, 'revendeurs')
    onFilterChange(filtered)
  }, [selectedSegment, selectedProducts, selectedCity, resellers, onFilterChange])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const resetFilters = () => {
    setSelectedSegment('all')
    setSelectedProducts([])
    setSelectedCity('all')
  }

  const hasActiveFilters = selectedSegment !== 'all' || selectedProducts.length > 0 || selectedCity !== 'all'

  // Fonction pour obtenir la couleur du badge selon la catégorie produit
  const getProductCategoryColor = (category: string) => {
    switch (category) {
      case 'Bouteille':
      case 'Bouteilles':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'Accessoire':
      case 'Accessoires':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'Kit':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
    }
  }

  // Fonction pour obtenir la couleur du badge selon le segment
  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Station Service':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      case 'Quincaillerie':
      case 'Quincaillerie / Tranombarotra':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'Épicerie':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'Grande Surface / Libre Service':
      case 'Libre Service':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      case 'Maison du gaz':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
    }
  }

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex flex-wrap gap-3 overflow-x-auto py-2">
          {/* Segments (Types) */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 tracking-tight"
            >
              <option value="all">Tous les segments</option>
              {availableSegments.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
          </div>

          {/* Ville */}
          {cities.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 tracking-tight"
              >
                <option value="all">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          {/* Produits dynamiques */}
          {availableProducts.map(product => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border shrink-0 ${
                selectedProducts.includes(product.id)
                  ? 'bg-primary text-white border-primary'
                  : `${getProductCategoryColor(product.category)} hover:opacity-80`
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>

        {/* Bouton Réinitialiser */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300 shrink-0 flex items-center gap-2 hover:border-neutral-300 dark:hover:border-neutral-600"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Segments (Types) */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 tracking-tight"
            >
              <option value="all">Tous les segments</option>
              {availableSegments.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
          </div>

          {/* Ville */}
          {cities.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 tracking-tight"
              >
                <option value="all">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Produits en grille */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableProducts.map(product => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                selectedProducts.includes(product.id)
                  ? 'bg-primary text-white border-primary'
                  : `${getProductCategoryColor(product.category)} hover:opacity-80`
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>

        {/* Bouton Réinitialiser mobile */}
        {hasActiveFilters && (
          <div className="flex justify-center">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300 flex items-center gap-2 hover:border-neutral-300 dark:hover:border-neutral-600"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  )
}