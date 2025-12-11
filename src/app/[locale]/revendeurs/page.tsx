'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { ResellerMap } from '@/components/resellers/ResellerMap'
import { ResellersList } from '@/components/resellers/ResellersList'
import { MapFilters } from '@/components/resellers/MapFilters'
import { GeolocationButton } from '@/components/resellers/GeolocationButton'
import { TravelModeSelector } from '@/components/resellers/TravelModeSelector'
import { GeolocationPrompt } from '@/components/resellers/GeolocationPrompt'
import { MapPinIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/solid'
import type { Reseller } from '@/types/reseller'
import { resellers } from '@/data/resellersData'
import { useDistanceMatrix, type TravelMode } from '@/lib/hooks/useDistanceMatrix'

const PAGE_SIZE = 10

export default function ResellersPage() {
  const [view, setView] = useState<'split' | 'list' | 'map'>('split')
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null)
  const [filteredResellers, setFilteredResellers] = useState(resellers)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING')
  const [hasGeolocationAttempted, setHasGeolocationAttempted] = useState(false)
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)
  const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(true)
  const [hasSkippedGeolocation, setHasSkippedGeolocation] = useState(false)

  // ✅ CORRECTION : Charger depuis localStorage au démarrage
  useEffect(() => {
    const loadUserLocation = () => {
      try {
        const savedLocation = localStorage.getItem('userLocation')
        if (savedLocation) {
          const location = JSON.parse(savedLocation)
          setUserLocation(location)
          console.log('📍 Position chargée depuis le stockage local:', location)
        }
      } catch (err) {
        console.error('❌ Erreur chargement position:', err)
      }
    }

    loadUserLocation()
  }, [])

  // ✅ CORRECTION : Sauvegarder la position dans localStorage
  const saveUserLocation = useCallback((location: { lat: number; lng: number }) => {
    try {
      localStorage.setItem('userLocation', JSON.stringify(location))
      console.log('💾 Position sauvegardée dans le stockage local')
    } catch (err) {
      console.error('❌ Erreur sauvegarde position:', err)
    }
  }, [])

  // Fonction pour gérer la géolocalisation
  const handleLocationFound = useCallback((location: { lat: number; lng: number }) => {
    console.log('📍 [page] Position GPS reçue:', {
      lat: location.lat.toFixed(6),
      lng: location.lng.toFixed(6)
    })
    
    // Sauvegarder la position
    setUserLocation(location)
    saveUserLocation(location)
    
    setHasGeolocationAttempted(true)
    setIsGeolocationLoading(false)
    setShowGeolocationPrompt(false)
    
    setTimeout(() => {
      console.log('✅ Géolocalisation activée! Calcul des distances en cours...')
    }, 500)
  }, [saveUserLocation])

  // ✅ CORRECTION : Fonction pour activer manuellement la géoloc
  const handleEnableGeolocation = useCallback(() => {
    console.log('📍 Activation manuelle de la géolocalisation')
    setIsGeolocationLoading(true)
    
    setTimeout(() => {
      const geolocButton = document.querySelector('[title="Utiliser ma position"]') as HTMLButtonElement
      if (geolocButton && !geolocButton.disabled) {
        geolocButton.click()
      } else {
        console.warn('⚠️ Bouton de géolocalisation non trouvé ou désactivé')
        setIsGeolocationLoading(false)
      }
    }, 100)
  }, [])

  // ✅ CORRECTION : Fonction pour ignorer la géolocalisation
  const handleSkipGeolocation = useCallback(() => {
    console.log('📍 Géolocalisation ignorée par l\'utilisateur')
    setHasSkippedGeolocation(true)
    setShowGeolocationPrompt(false)
    setIsGeolocationLoading(false)
  }, [])

  // Hook de calcul des distances
  const { distances, isLoading: isLoadingDistances, error: distanceError } = useDistanceMatrix(
    userLocation,
    filteredResellers,
    travelMode
  )

  // Log des distances pour debug
  useEffect(() => {
    if (distances && Object.keys(distances).length > 0) {
      console.log('📏 Distances calculées:', {
        count: Object.keys(distances).length,
        sample: Object.entries(distances).slice(0, 3)
      })
    }
  }, [distances])

  // Trier les revendeurs par distance
  const sortedResellers = useMemo(() => {
    // Si pas de position utilisateur, retourner les revendeurs filtrés sans tri
    if (!userLocation) {
      return filteredResellers
    }
    
    // Si pas de distances calculées, retourner les revendeurs filtrés
    if (!distances || Object.keys(distances).length === 0) {
      return filteredResellers
    }

    // Vérifier qu'on a des distances pour au moins certains revendeurs
    const revendeursAvecDistance = filteredResellers.filter(r => distances[r.id])
    const revendeursSansDistance = filteredResellers.filter(r => !distances[r.id])

    // Trier ceux qui ont une distance
    const tries = [...revendeursAvecDistance].sort((a, b) => {
      const distA = distances[a.id]?.distanceValue ?? Infinity
      const distB = distances[b.id]?.distanceValue ?? Infinity
      return distA - distB
    })

    // Ajouter ceux sans distance à la fin
    return [...tries, ...revendeursSansDistance]
  }, [filteredResellers, distances, userLocation])

  const handleFilterChange = useCallback((filtered: Reseller[]) => {
    console.log(`🎯 Filtres appliqués: ${filtered.length} revendeurs`)
    setFilteredResellers(filtered)
    setCurrentPage(1)
  }, [])

  // Pagination pour la vue liste seule
  const paginatedResellers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedResellers.slice(start, start + PAGE_SIZE)
  }, [sortedResellers, currentPage])

  // Liste des villes uniques
  const cities = useMemo(
    () => Array.from(new Set(resellers.map(r => r.city))).sort(),
    []
  )

  const handleTravelModeChange = useCallback((mode: TravelMode) => {
    console.log(`🚗 Mode de transport changé: ${mode}`)
    setTravelMode(mode)
  }, [])

  // ✅ CORRECTION : Afficher le prompt seulement si pas encore de position ET pas encore ignoré
  const shouldShowPrompt = showGeolocationPrompt && !userLocation && !hasSkippedGeolocation

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16">
      {/* ✅ CORRECTION : Nouveau prompt de géolocalisation */}
      {shouldShowPrompt && (
        <GeolocationPrompt
          onEnable={handleEnableGeolocation}
          onSkip={handleSkipGeolocation}
          isGeolocationLoading={isGeolocationLoading}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-dark-border">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white font-display">
                Trouver un revendeur
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                {filteredResellers.length} point{filteredResellers.length > 1 ? 's' : ''} de vente à proximité
              </p>
              {userLocation && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  <span>
                    Position: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                </p>
              )}
            </div>

            {/* Toggle pour les 3 modes d'affichage */}
            <div className="flex gap-2">
              {/* Desktop: 3 boutons */}
              <div className="hidden lg:flex gap-2">
                <button
                  onClick={() => setView('split')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    view === 'split'
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-md'
                  }`}
                  title="Vue partagée"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    view === 'list'
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-md'
                  }`}
                  title="Liste seule"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    view === 'map'
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-md'
                  }`}
                  title="Carte seule"
                >
                  <MapPinIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile: 2 boutons */}
              <div className="flex lg:hidden gap-2">
                <button
                  onClick={() => setView(view === 'map' ? 'list' : 'map')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    view === 'map'
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-md'
                  }`}
                >
                  {view === 'map' ? (
                    <ListBulletIcon className="w-5 h-5" />
                  ) : (
                    <MapPinIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-4">
            <MapFilters
              resellers={resellers}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Section des distances avec design amélioré */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-neutral-200 dark:border-dark-border shadow-sm">
            <div className="space-y-4">
              {/* En-tête avec statut GPS amélioré */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Calcul des distances
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {userLocation ? 'Personnalisé selon votre position' : 'Activez la géolocalisation'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {userLocation ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        GPS activé
                      </span>
                    </div>
                  ) : isGeolocationLoading ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        En cours...
                      </span>
                    </div>
                  ) : !hasSkippedGeolocation ? (
                    <button
                      onClick={handleEnableGeolocation}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-full border border-primary/20 dark:border-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <MapPinIcon className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Activer GPS
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        GPS désactivé
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* TravelModeSelector */}
              <div className="pt-2">
                <TravelModeSelector
                  mode={travelMode}
                  onChange={handleTravelModeChange}
                />
              </div>
              
              {/* États et messages */}
              <div className="space-y-2 pt-2">
                {isGeolocationLoading && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Détection de votre position
                      </p>
                      <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                        Autorisez l'accès à votre position dans le navigateur
                      </p>
                    </div>
                  </div>
                )}
                
                {isLoadingDistances && userLocation && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary dark:text-primary-400">
                        Calcul des distances en cours
                      </p>
                      <p className="text-xs text-primary/80 dark:text-primary-300/80">
                        Traitement de {filteredResellers.length} revendeurs
                      </p>
                    </div>
                  </div>
                )}
                
                {distanceError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Erreur de calcul
                        </p>
                        <p className="text-sm text-red-700/80 dark:text-red-400/80">
                          {distanceError}
                        </p>
                        {!userLocation && (
                          <button
                            onClick={handleEnableGeolocation}
                            className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Réessayer avec GPS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {!userLocation && hasSkippedGeolocation && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Géolocalisation désactivée
                        </p>
                        <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mb-2">
                          Les distances ne seront pas calculées
                        </p>
                        <button
                          onClick={handleEnableGeolocation}
                          className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Activer maintenant
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {distances && Object.keys(distances).length > 0 && userLocation && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          {Object.keys(distances).length} distances calculées
                        </p>
                        <p className="text-sm text-green-700/80 dark:text-green-400/80">
                          Les revendeurs sont triés par proximité
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative h-[calc(100vh-320px)] sm:h-[calc(100vh-360px)]">
        
        {/* Mode SPLIT (Partagé) */}
        {view === 'split' && (
          <div className="hidden lg:flex h-full">
            <div className="w-2/5 overflow-y-auto">
              <ResellersList
                resellers={sortedResellers}
                selectedReseller={selectedReseller}
                onSelectReseller={setSelectedReseller}
                distances={distances}
              />
            </div>

            <div className="w-3/5 relative">
              <ResellerMap
                resellers={filteredResellers}
                selectedReseller={selectedReseller}
                onSelectReseller={setSelectedReseller}
                userLocation={userLocation}
              />
              <GeolocationButton onLocationFound={handleLocationFound} />
            </div>
          </div>
        )}

        {/* Mode LIST (Liste seule) */}
        {view === 'list' && (
          <div className="h-full flex flex-col">
            <div className="bg-white dark:bg-dark-surface p-4 border-b border-neutral-200 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {sortedResellers.length} revendeur{sortedResellers.length > 1 ? 's' : ''}
                  </p>
                  {userLocation && distances && Object.keys(distances).length > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Triés par distance
                    </p>
                  )}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-500">
                  Page {currentPage} sur {Math.ceil(sortedResellers.length / PAGE_SIZE)}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ResellersList
                resellers={paginatedResellers}
                selectedReseller={selectedReseller}
                onSelectReseller={setSelectedReseller}
                distances={distances}
              />
            </div>

            {sortedResellers.length > PAGE_SIZE && (
              <div className="flex justify-center gap-2 p-4 bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Précédent
                </button>
                <button
                  disabled={currentPage === Math.ceil(sortedResellers.length / PAGE_SIZE)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center gap-2"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode MAP (Carte seule) */}
        {view === 'map' && (
          <div className="relative h-full">
            <ResellerMap
              resellers={filteredResellers}
              selectedReseller={selectedReseller}
              onSelectReseller={setSelectedReseller}
              userLocation={userLocation}
            />
            <GeolocationButton onLocationFound={handleLocationFound} />
          </div>
        )}

        {/* Mobile view */}
        <div className="lg:hidden h-full flex flex-col">
          {view === 'map' ? (
            <div className="relative h-full">
              <ResellerMap
                resellers={filteredResellers}
                selectedReseller={selectedReseller}
                onSelectReseller={setSelectedReseller}
                userLocation={userLocation}
              />
              <GeolocationButton onLocationFound={handleLocationFound} />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="bg-white dark:bg-dark-surface p-4 border-b border-neutral-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {sortedResellers.length} revendeur{sortedResellers.length > 1 ? 's' : ''}
                    </p>
                    {userLocation && distances && Object.keys(distances).length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Triés par distance
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <ResellersList
                  resellers={paginatedResellers}
                  selectedReseller={selectedReseller}
                  onSelectReseller={setSelectedReseller}
                  distances={distances}
                />
              </div>

              {sortedResellers.length > PAGE_SIZE && (
                <div className="flex justify-center gap-2 p-4 bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                  </button>
                  <button
                    disabled={currentPage === Math.ceil(sortedResellers.length / PAGE_SIZE)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center gap-2"
                  >
                    Suivant
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}