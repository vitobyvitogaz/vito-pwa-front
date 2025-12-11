'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/solid'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md animate-fade-up">
        {/* Contenu principal */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-dark-border">
          {/* En-tête avec dégradé */}
          <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MapPinIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Géolocalisation requise
            </h2>
            <p className="text-white/90 text-sm">
              Pour une expérience personnalisée
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Avantages */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Distances précises
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Calculez les trajets vers les revendeurs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Tri par proximité
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Trouvez les revendeurs les plus proches
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Carte centrée
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Visualisez votre position sur la carte
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton détail */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-center text-sm text-primary dark:text-primary-400 hover:underline"
              >
                {showDetails ? 'Masquer les détails' : 'Comment ça fonctionne ?'}
              </button>

              {/* Détails */}
              {showDetails && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-dark-border animate-slide-down">
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
            <div className="mt-8 space-y-3">
              <button
                onClick={handleEnable}
                disabled={isGeolocationLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                {isGeolocationLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Détection en cours...</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="w-5 h-5" />
                    <span>Activer la géolocalisation</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3.5 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl border-2 border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                Continuer sans géolocalisation
              </button>
            </div>

            {/* Note de confidentialité */}
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-6">
              Vous pourrez activer la géolocalisation à tout moment via le bouton en bas à droite de la carte.
            </p>
          </div>
        </div>

        {/* Bouton fermer (optionnel) */}
        <button
          onClick={handleSkip}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-neutral-200 dark:border-dark-border flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        </button>
      </div>
    </div>
  )
}