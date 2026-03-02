'use client'

import { useState } from 'react'
import { MapPin, X, CheckCircle, TrendingUp, Target } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface GeolocationPromptProps {
  onEnable: () => void
  onSkip: () => void
  isGeolocationLoading: boolean
}

export const GeolocationPrompt: React.FC<GeolocationPromptProps> = ({
  onEnable,
  onSkip,
  isGeolocationLoading,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const handleEnable = () => {
    hapticFeedback('medium')
    onEnable()
  }

  const handleSkip = () => {
    hapticFeedback('light')
    onSkip()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">

          {/* Header — bouton X à l'intérieur */}
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-dark-surface/80 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 border border-neutral-200 dark:border-neutral-800"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
            </button>

            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
              Géolocalisation requise
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Pour une expérience personnalisée
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="space-y-4">

              {/* Avantages */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">Distances précises</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs">Calculez les trajets vers les revendeurs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">Tri par proximité</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs">Trouvez les revendeurs les plus proches</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">Carte centrée</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs">Visualisez votre position sur la carte</p>
                  </div>
                </div>
              </div>

              {/* Bouton détail */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                {showDetails ? 'Masquer les détails' : 'Comment ça fonctionne ?'}
              </button>

              {/* Détails */}
              {showDetails && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 animate-slide-down">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    Nous utilisons votre position pour :
                  </p>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
                    <li>Calculer les distances de trajet</li>
                    <li>Trier les revendeurs du plus proche au plus loin</li>
                    <li>Centrer la carte sur votre position</li>
                    <li>Proposer des itinéraires précis</li>
                  </ul>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
                    Vos données de localisation sont traitées localement et ne sont pas stockées sur nos serveurs.
                  </p>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleEnable}
                disabled={isGeolocationLoading}
                className="w-full py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGeolocationLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Détection en cours...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" strokeWidth={1.5} />
                    <span>Activer la géolocalisation</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2.5 text-neutral-700 dark:text-neutral-300 font-medium rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-300"
              >
                Continuer sans géolocalisation
              </button>
            </div>

            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-4">
              Vous pourrez activer la géolocalisation à tout moment via le bouton en bas à droite de la carte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}