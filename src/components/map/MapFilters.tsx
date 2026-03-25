'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Reseller } from '@/types/reseller'
import { MapPin, SlidersHorizontal } from 'lucide-react'

interface MapFiltersProps {
  resellers: Reseller[]
  onFilterChange: (filtered: Reseller[]) => void
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  resellers,
  onFilterChange,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedZone, setSelectedZone] = useState<string>('all')

  // ── Extraire les types uniques depuis les données réelles ──
  const types = useMemo(() => {
    const unique = Array.from(new Set(resellers.map(r => r.type).filter(Boolean)))
    return unique.sort()
  }, [resellers])

  // ── Extraire les zones/villes uniques depuis les données réelles ──
  // Utilise address pour déduire la ville (dernier segment après la dernière virgule)
  const zones = useMemo(() => {
    const cities = resellers
      .map(r => {
        if (!r.address) return null
        const parts = r.address.split(',')
        return parts[parts.length - 1]?.trim() || null
      })
      .filter((c): c is string => !!c && c.length > 1)
    const unique = Array.from(new Set(cities)).sort()
    return unique
  }, [resellers])

  // ── Appliquer les filtres dès que les sélections changent ──
  useEffect(() => {
    let result = [...resellers]

    if (selectedType !== 'all') {
      result = result.filter(r => r.type === selectedType)
    }

    if (selectedZone !== 'all') {
      result = result.filter(r =>
        r.address?.toLowerCase().includes(selectedZone.toLowerCase())
      )
    }

    onFilterChange(result)
  }, [selectedType, selectedZone, resellers, onFilterChange])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Icône indicateur */}
      <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
        <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm font-medium hidden sm:inline">Filtrer :</span>
      </div>

      {/* Filtre par type */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="flex-1 sm:flex-none px-3 py-2 rounded-full text-sm bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors font-sans"
      >
        <option value="all">Tous les segments</option>
        {types.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      {/* Filtre par zone/ville — fallback sans GPS ── */}
      {zones.length > 0 && (
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-full text-sm bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors font-sans"
        >
          <option value="all">Toutes les zones</option>
          {zones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      )}

      {/* Indicateur de filtres actifs */}
      {(selectedType !== 'all' || selectedZone !== 'all') && (
        <button
          onClick={() => { setSelectedType('all'); setSelectedZone('all') }}
          className="text-xs text-primary font-medium hover:text-primary/80 transition-colors font-sans px-2 py-1 rounded-full hover:bg-primary/10"
        >
          Effacer
        </button>
      )}
    </div>
  )
}