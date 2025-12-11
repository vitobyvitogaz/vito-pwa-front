'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Reseller } from '@/types/reseller'

interface MapFiltersProps {
  resellers: Reseller[]
  onFilterChange: (filtered: Reseller[]) => void
}

export const MapFilters: React.FC<MapFiltersProps> = ({ resellers, onFilterChange }) => {
  const [selectedType, setSelectedType] = useState<'all' | Reseller['type']>('all')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('all')

  // Générer la liste unique des villes disponibles
  const cities = Array.from(new Set(resellers.map(r => r.city))).sort()

  // Mémoiser la fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = resellers

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType)
    }

    if (selectedServices.length > 0) {
      filtered = filtered.filter(r =>
        selectedServices.every(service => r.services.includes(service))
      )
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(r => r.city === selectedCity)
    }

    onFilterChange(filtered)
  }, [selectedType, selectedServices, selectedCity, resellers, onFilterChange])

  // Appeler applyFilters quand les filtres changent
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedType('all')
    setSelectedServices([])
    setSelectedCity('all')
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = selectedType !== 'all' || selectedServices.length > 0 || selectedCity !== 'all'

  return (
    <div className="w-full">
      {/* Desktop: Bouton à droite */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex flex-wrap gap-3 overflow-x-auto py-2">
          {/* Type */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Types Distrib</option>
              <option value="Quincaillerie">Quincailleries</option>
              <option value="Épicerie">Épiceries</option>
              <option value="Station Service">Stations-service</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          {/* Ville */}
          {cities.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          {/* Services */}
          {(['Bouteille 9kg', 'Bouteille 13kg', 'Kit Fatapera', 'Détendeur', 'Pack connectique'] as const).map(service => (
            <button
              key={service}
              onClick={() => toggleService(service)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                selectedServices.includes(service)
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Bouton Réinitialiser à droite sur desktop */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shrink-0 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Mobile: Tout en colonne */}
      <div className="md:hidden space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Type */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Types Distrib</option>
              <option value="Quincaillerie">Quincailleries</option>
              <option value="Épicerie">Épiceries</option>
              <option value="Station Service">Stations-service</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          {/* Ville - CORRECTION : Toujours visible sur mobile */}
          {cities.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Services sur mobile - en grille */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['Bouteille 9kg', 'Bouteille 13kg', 'Kit Fatapera', 'Détendeur', 'Pack connectique'] as const).map(service => (
            <button
              key={service}
              onClick={() => toggleService(service)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedServices.includes(service)
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Bouton Réinitialiser centré sur mobile */}
        {hasActiveFilters && (
          <div className="flex justify-center">
            <button
              onClick={resetFilters}
              className="px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  )
}