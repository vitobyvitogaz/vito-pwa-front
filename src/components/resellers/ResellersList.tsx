'use client'

import { ResellerCard } from '@/components/resellers/ResellerCard'
import type { Reseller } from '@/types/reseller'
import type { DistanceResult } from '@/lib/hooks/useDistanceMatrix'

interface ResellersListProps {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
  distances?: Record<string, DistanceResult> // ✅ CORRECTION : Ajouter la prop distances
}

export const ResellersList: React.FC<ResellersListProps> = ({
  resellers,
  selectedReseller,
  onSelectReseller,
  distances, // ✅ CORRECTION : Recevoir les distances
}) => {
  return (
    <div className="p-4 space-y-4">
      {resellers.map((reseller, index) => (
        <ResellerCard
          key={reseller.id}
          reseller={reseller}
          isSelected={selectedReseller?.id === reseller.id}
          onClick={() => onSelectReseller(reseller)}
          delay={index * 0.05}
          distance={distances?.[reseller.id]} // ✅ CORRECTION : Passer la distance
        />
      ))}

      {resellers.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Aucun revendeur trouvé
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Essayez de modifier les filtres
          </p>
        </div>
      )}
    </div>
  )
}