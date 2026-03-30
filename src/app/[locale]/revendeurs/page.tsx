'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ResellerMap = dynamic(
  () => import('@/components/resellers/ResellerMap').then(mod => ({ default: mod.ResellerMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
)

import { ResellersList } from '@/components/resellers/ResellersList'
import { MapFilters } from '@/components/resellers/MapFilters'
import { GeolocationButton } from '@/components/resellers/GeolocationButton'
import { TravelModeSelector } from '@/components/resellers/TravelModeSelector'
import { GeolocationPrompt } from '@/components/resellers/GeolocationPrompt'
import {
  MapPin, List, Grid3x3, AlertCircle, CheckCircle, Loader2,
  SlidersHorizontal, X, ChevronUp, Navigation, Search
} from 'lucide-react'
import type { Reseller } from '@/types/reseller'
import { useResellerStore } from '@/store/useResellerStore'
import { useOptimizedDistances, type TravelMode } from '@/lib/hooks/useOptimizedDistances'

const PAGE_SIZE = 10
type SheetState = 'quarter' | 'half' | 'full'

const NAVBAR_HEIGHT = 56
const BOTTOM_NAV_HEIGHT = 64

// ── Normalisation pour recherche insensible aux accents ──────────────────────
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function ResellersPage() {
  const { resellers, loading: isLoadingResellers, fetchResellers } = useResellerStore()
  const [view, setView] = useState<'split' | 'list' | 'map'>('split')
  const [sheetState, setSheetState] = useState<SheetState>('quarter')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null)
  const [filteredResellers, setFilteredResellers] = useState<Reseller[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING')
  const [hasGeolocationAttempted, setHasGeolocationAttempted] = useState(false)
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)
  const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(true)
  const [hasSkippedGeolocation, setHasSkippedGeolocation] = useState(false)
  // ── État de recherche textuelle ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchResellers() }, [fetchResellers])
  useEffect(() => {
    if (resellers.length > 0) setFilteredResellers(resellers)
  }, [resellers])

  const handleLocationFound = useCallback((location: { lat: number; lng: number }) => {
    setUserLocation(location)
    setHasGeolocationAttempted(true)
    setIsGeolocationLoading(false)
    setShowGeolocationPrompt(false)
  }, [])

  const handleEnableGeolocation = useCallback(() => {
    setIsGeolocationLoading(true)
    setTimeout(() => {
      const geolocButton = document.querySelector('[title="Utiliser ma position"]') as HTMLButtonElement
      if (geolocButton && !geolocButton.disabled) geolocButton.click()
      else setIsGeolocationLoading(false)
    }, 100)
  }, [])

  const handleSkipGeolocation = useCallback(() => {
    setHasSkippedGeolocation(true)
    setShowGeolocationPrompt(false)
    setIsGeolocationLoading(false)
  }, [])

  // ── Revendeurs filtrés par recherche textuelle ────────────────────────────
  const searchFilteredResellers = useMemo(() => {
    if (!searchQuery.trim()) return filteredResellers
    const q = normalize(searchQuery.trim())
    return filteredResellers.filter(r =>
      normalize(r.name || '').includes(q) ||
      normalize(r.address || '').includes(q) ||
      normalize(r.type || '').includes(q)
    )
  }, [filteredResellers, searchQuery])

  const { distances, sortedResellers, isLoading: isLoadingDistances } = useOptimizedDistances(
    userLocation, searchFilteredResellers, travelMode
  )

  const handleFilterChange = useCallback((filtered: Reseller[]) => {
    setFilteredResellers(filtered)
    setCurrentPage(1)
  }, [])

  // ── Réinitialiser la page quand la recherche change ───────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const paginatedResellers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedResellers.slice(start, start + PAGE_SIZE)
  }, [sortedResellers, currentPage])

  const handleTravelModeChange = useCallback((mode: TravelMode) => {
    setTravelMode(mode)
  }, [])

  const shouldShowPrompt = showGeolocationPrompt && !userLocation && !hasSkippedGeolocation

  // Ancrage en haut de la carte à l'ouverture
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const sheetHeights = {
    quarter: '18vh',
    half:    '42vh',
    full:    '88vh',
  }

  // La carte s'arrête exactement là où le sheet commence — pas de gap
  const mapBottoms = {
    quarter: '18vh',
    half:    '42vh',
    full:    '88vh',
  }

  if (isLoadingResellers) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Chargement des revendeurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 dark:bg-dark-bg">

      {shouldShowPrompt && (
        <GeolocationPrompt
          onEnable={handleEnableGeolocation}
          onSkip={handleSkipGeolocation}
          isGeolocationLoading={isGeolocationLoading}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP
      ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block pt-14 sm:pt-16">
        {userLocation && (
          <div className="bg-primary/5 border-b border-primary/10 px-4 py-2">
            <div className="container mx-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
              <span className="text-xs text-primary font-medium">
                Position détectée : {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Trouver un revendeur
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {sortedResellers.length} point{sortedResellers.length > 1 ? 's' : ''} de vente
                  {searchQuery && ` · "${searchQuery}"`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setView('split')} className={`p-2 rounded-full transition-all duration-300 ${view === 'split' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`} title="Vue partagée">
                  <Grid3x3 className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`} title="Liste seule">
                  <List className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setView('map')} className={`p-2 rounded-full transition-all duration-300 ${view === 'map' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`} title="Carte seule">
                  <MapPin className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* ── Champ de recherche desktop ── */}
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un revendeur, une adresse, un quartier..."
                className="w-full pl-11 pr-10 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-dark-surface text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-neutral-500" strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="mb-4">
              <MapFilters resellers={resellers} onFilterChange={handleFilterChange} />
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-neutral-900 dark:text-white">Calcul des distances</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {userLocation ? 'Personnalisé selon votre position' : 'Activez la géolocalisation'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {userLocation ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">GPS activé</span>
                      </div>
                    ) : isGeolocationLoading ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <Loader2 className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" strokeWidth={1.5} />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">En cours...</span>
                      </div>
                    ) : !hasSkippedGeolocation ? (
                      <button onClick={handleEnableGeolocation} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/20 transition-all duration-300">
                        <MapPin className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-medium text-primary">Activer GPS</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">GPS désactivé</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <TravelModeSelector mode={travelMode} onChange={handleTravelModeChange} />
                </div>
                <div className="space-y-2 pt-2">
                  {isGeolocationLoading && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Détection de votre position</p>
                        <p className="text-xs text-blue-700/80 dark:text-blue-400/80">Autorisez l'accès à votre position dans le navigateur</p>
                      </div>
                    </div>
                  )}
                  {isLoadingDistances && userLocation && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">Calcul optimisé en cours</p>
                        <p className="text-xs text-primary/80">Affichage instantané avec distances précises</p>
                      </div>
                    </div>
                  )}
                  {!userLocation && hasSkippedGeolocation && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-3 h-3 text-amber-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Géolocalisation désactivée</p>
                          <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mb-2">Utilisez la recherche ou le filtre par zone pour trouver les revendeurs de votre ville</p>
                          <button onClick={handleEnableGeolocation} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-xl hover:bg-amber-700 transition-all duration-300">
                            Activer maintenant
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {distances && Object.keys(distances).length > 0 && userLocation && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{Object.keys(distances).length} distances calculées</p>
                          <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">Revendeurs triés par proximité • ≈ = Distance estimée</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-[calc(100vh-320px)] sm:h-[calc(100vh-360px)]">
          {view === 'split' && (
            <div className="flex h-full">
              <div className="w-2/5 overflow-y-auto">
                <ResellersList
                  resellers={sortedResellers}
                  selectedReseller={selectedReseller}
                  onSelectReseller={setSelectedReseller}
                  distances={distances}
                  hasGps={!!userLocation}
                  isLoading={isLoadingResellers}
                />
              </div>
              <div className="w-3/5 relative">
                <ResellerMap resellers={searchFilteredResellers} selectedReseller={selectedReseller} onSelectReseller={setSelectedReseller} userLocation={userLocation} />
                <GeolocationButton onLocationFound={handleLocationFound} />
              </div>
            </div>
          )}
          {view === 'list' && (
            <div className="flex h-full flex-col">
              <div className="bg-white dark:bg-dark-surface p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{sortedResellers.length} revendeur{sortedResellers.length > 1 ? 's' : ''}</p>
                  <div className="text-xs text-neutral-500">Page {currentPage} sur {Math.ceil(sortedResellers.length / PAGE_SIZE)}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ResellersList
                  resellers={paginatedResellers}
                  selectedReseller={selectedReseller}
                  onSelectReseller={setSelectedReseller}
                  distances={distances}
                  hasGps={!!userLocation}
                  isLoading={isLoadingResellers}
                />
              </div>
              {sortedResellers.length > PAGE_SIZE && (
                <div className="flex justify-center gap-2 p-4 bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-neutral-800">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 transition-all duration-300">Précédent</button>
                  <button disabled={currentPage === Math.ceil(sortedResellers.length / PAGE_SIZE)} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 hover:bg-neutral-200 transition-all duration-300">Suivant</button>
                </div>
              )}
            </div>
          )}
          {view === 'map' && (
            <div className="relative h-full">
              <ResellerMap resellers={searchFilteredResellers} selectedReseller={selectedReseller} onSelectReseller={setSelectedReseller} userLocation={userLocation} />
              <GeolocationButton onLocationFound={handleLocationFound} />
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE
      ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden relative" style={{ height: '100dvh', overflow: 'hidden' }}>

        <div
          className="absolute left-0 right-0"
          style={{
            top: `${NAVBAR_HEIGHT}px`,
            bottom: mapBottoms[sheetState],
            zIndex: 1,
            transition: 'bottom 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <ResellerMap
            resellers={searchFilteredResellers}
            selectedReseller={selectedReseller}
            onSelectReseller={(reseller) => {
              setSelectedReseller(reseller)
              setSheetState('quarter')
            }}
            userLocation={userLocation}
          />
          <GeolocationButton onLocationFound={handleLocationFound} />
        </div>

        {/* Barre flottante haut droite */}
        <div
          className="absolute right-0 px-4 pointer-events-none"
          style={{ top: `${NAVBAR_HEIGHT + 12}px`, zIndex: 1000 }}
        >
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Filtres</span>
            </button>

            {userLocation && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">GPS actif</span>
              </div>
            )}

            {isLoadingDistances && userLocation && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" strokeWidth={1.5} />
                <span className="text-xs font-medium text-primary">Calcul...</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sheet */}
        <div
          className="absolute left-0 right-0 bg-white dark:bg-dark-surface rounded-t-3xl shadow-2xl flex flex-col"
          style={{
            bottom: 0,
            height: sheetHeights[sheetState],
            transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
            zIndex: 1000,
          }}
        >
          {/* Poignée + header */}
          <div
            className="flex-shrink-0 pt-3 pb-2 px-4"
            onTouchStart={(e) => { (e.currentTarget as any)._startY = e.touches[0].clientY }}
            onTouchEnd={(e) => {
              const startY = (e.currentTarget as any)._startY ?? 0
              const delta = e.changedTouches[0].clientY - startY
              if (delta < -60) {
                if (sheetState === 'quarter') setSheetState('half')
                else if (sheetState === 'half') setSheetState('full')
              } else if (delta > 60) {
                if (sheetState === 'full') setSheetState('half')
                else if (sheetState === 'half') setSheetState('quarter')
              }
            }}
          >
            <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {sortedResellers.length} revendeur{sortedResellers.length > 1 ? 's' : ''}
                </span>
                {userLocation && distances && Object.keys(distances).length > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">• triés par distance</span>
                )}
                {searchQuery && (
                  <span className="text-xs text-primary font-medium">• "{searchQuery}"</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!userLocation && !isGeolocationLoading && (
                  <button
                    onClick={handleEnableGeolocation}
                    className="flex items-center gap-1.5 px-3 h-11 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all duration-200 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-primary">Activer GPS</span>
                  </button>
                )}
                {isGeolocationLoading && (
                  <div className="flex items-center gap-1.5 px-3 h-11 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Localisation...</span>
                  </div>
                )}

                {(sheetState === 'half' || sheetState === 'full') && (
                  <button
                    onClick={() => setSheetState(sheetState === 'full' ? 'half' : 'quarter')}
                    className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <ChevronUp className="w-5 h-5 text-neutral-500 rotate-180" strokeWidth={2} />
                  </button>
                )}
                {(sheetState === 'quarter' || sheetState === 'half') && (
                  <button
                    onClick={() => setSheetState(sheetState === 'quarter' ? 'half' : 'full')}
                    className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <ChevronUp className="w-5 h-5 text-neutral-500" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Champ de recherche mobile — visible en half/full uniquement ── */}
            {(sheetState === 'half' || sheetState === 'full') && (
              <div className="relative mt-3">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Quartier, ville, nom du revendeur..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-neutral-500" strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4" style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + 16px)` }}>
              <div className="py-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
                <TravelModeSelector mode={travelMode} onChange={handleTravelModeChange} />
              </div>

              {distances && Object.keys(distances).length > 0 && userLocation && (
                <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">
                    {Object.keys(distances).length} distances calculées
                  </span>
                </div>
              )}

              {!userLocation && hasSkippedGeolocation && (
                <div className="flex items-center justify-between px-3 py-2.5 mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-amber-700 dark:text-amber-300">GPS désactivé — recherchez par ville ci-dessus</span>
                  <button onClick={handleEnableGeolocation} className="text-xs bg-amber-600 text-white px-2.5 py-1 rounded-lg flex-shrink-0 ml-2">
                    Activer
                  </button>
                </div>
              )}

              <ResellersList
                resellers={paginatedResellers}
                selectedReseller={selectedReseller}
                onSelectReseller={(reseller) => {
                  setSelectedReseller(reseller)
                  setSheetState('quarter')
                }}
                distances={distances}
                hasGps={!!userLocation}
                isLoading={isLoadingResellers}
              />

              {sortedResellers.length > PAGE_SIZE && (
                <div className="flex justify-center gap-2 pt-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 text-sm font-medium"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={currentPage === Math.ceil(sortedResellers.length / PAGE_SIZE)}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 text-sm font-medium"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Filtres */}
        {showMobileFilters && (
          <div
            className="absolute inset-0 bg-white dark:bg-dark-surface flex flex-col"
            style={{ zIndex: 1100 }}
          >
            <div
              className="flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800"
              style={{ paddingTop: `${NAVBAR_HEIGHT + 12}px`, paddingBottom: '16px' }}
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filtres</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MapFilters resellers={resellers} onFilterChange={handleFilterChange} />
            </div>
            <div
              className="p-4 border-t border-neutral-200 dark:border-neutral-800"
              style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 16px)` }}
            >
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3.5 bg-primary text-white rounded-full font-semibold text-sm"
              >
                Voir {sortedResellers.length} revendeur{sortedResellers.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}