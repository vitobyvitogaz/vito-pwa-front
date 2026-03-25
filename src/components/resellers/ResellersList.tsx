'use client'

import { ResellerCard } from '@/components/resellers/ResellerCard'
import type { Reseller } from '@/types/reseller'
import type { DistanceResult } from '@/lib/hooks/useDistanceMatrix'
import { MapPin, SlidersHorizontal } from 'lucide-react'

interface ResellersListProps {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
  distances?: Record<string, DistanceResult>
  // ── Contexte GPS pour adapter le message d'empty state ──
  hasGps?: boolean
  isLoading?: boolean
}

export const ResellersList: React.FC<ResellersListProps> = ({
  resellers,
  selectedReseller,
  onSelectReseller,
  distances,
  hasGps = false,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {resellers.map((reseller, index) => (
        <ResellerCard
          key={reseller.id}
          reseller={reseller}
          isSelected={selectedReseller?.id === reseller.id}
          onClick={() => onSelectReseller(reseller)}
          delay={index * 0.05}
          distance={distances?.[reseller.id]}
        />
      ))}

      {resellers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-neutral-400 dark:text-neutral-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight font-sans">
            Aucun revendeur trouvé
          </h3>
          {hasGps ? (
            // ── Avec GPS : les filtres sont probablement trop restrictifs ──
            <div className="space-y-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans max-w-xs mx-auto">
                Aucun revendeur ne correspond à vos filtres dans cette zone.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-sans">
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                Essayez de modifier les filtres ci-dessus
              </div>
            </div>
          ) : (
            // ── Sans GPS : inviter à choisir une zone manuellement ──
            <div className="space-y-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans max-w-xs mx-auto">
                Activez le GPS pour trouver les revendeurs près de vous, ou sélectionnez une zone dans le filtre.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-sans">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Utilisez le filtre "Toutes les zones" pour choisir votre ville
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}