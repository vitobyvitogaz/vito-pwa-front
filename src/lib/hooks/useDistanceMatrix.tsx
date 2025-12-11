'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Reseller } from '@/types/reseller'

// ✅ CORRECTION : Garder seulement DRIVING et WALKING
export type TravelMode = 'DRIVING' | 'WALKING'

export interface DistanceResult {
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
}

const MAX_DESTINATIONS_PER_REQUEST = 25
const CACHE_DURATION = 60 * 60 * 1000 // 1 heure

// Générer une clé de cache
const getCacheKey = (
  userLat: number,
  userLng: number,
  resellerIds: string[],
  travelMode: TravelMode
) => {
  return `distances_${userLat.toFixed(4)}_${userLng.toFixed(4)}_${resellerIds.join(',')}_${travelMode}`
}

// Charger depuis le cache
const loadFromCache = (cacheKey: string): Record<string, DistanceResult> | null => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Vérifier si le cache est encore valide
    if (now - timestamp < CACHE_DURATION) {
      console.log('✅ Distances chargées depuis le cache')
      return data
    } else {
      console.log('🗑️ Cache expiré, suppression')
      localStorage.removeItem(cacheKey)
      return null
    }
  } catch (err) {
    console.error('❌ Erreur lecture cache:', err)
    return null
  }
}

// Sauvegarder dans le cache
const saveToCache = (cacheKey: string, data: Record<string, DistanceResult>) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
    console.log('💾 Distances sauvegardées en cache')
  } catch (err) {
    console.error('❌ Erreur sauvegarde cache:', err)
  }
}

export const useDistanceMatrix = (
  userLocation: { lat: number; lng: number } | null,
  resellers: Reseller[],
  travelMode: TravelMode = 'DRIVING'
) => {
  const [distances, setDistances] = useState<Record<string, DistanceResult>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isCalculatingRef = useRef(false)
  const lastUserLocationRef = useRef<string>('')
  const lastResellersRef = useRef<string>('')
  const lastTravelModeRef = useRef<TravelMode>(travelMode)

  const calculateDistances = useCallback(async () => {
    console.log('🔍 [useDistanceMatrix] Début du calcul', {
      userLocation,
      resellersCount: resellers.length,
      travelMode,
      googleMapsReady: typeof google !== 'undefined' && google.maps?.DistanceMatrixService
    })

    if (!userLocation || resellers.length === 0) {
      console.log('⏸️ Pas de position utilisateur ou pas de revendeurs')
      setDistances({})
      return
    }

    // Vérifier si les données ont changé
    const userLocationKey = `${userLocation.lat.toFixed(6)}_${userLocation.lng.toFixed(6)}`
    const resellersKey = resellers.map(r => r.id).join(',')
    
    if (userLocationKey === lastUserLocationRef.current && 
        resellersKey === lastResellersRef.current &&
        travelMode === lastTravelModeRef.current &&
        Object.keys(distances).length > 0) {
      console.log('📦 Données inchangées, utilisation des distances existantes')
      return
    }

    // Empêcher les appels multiples simultanés
    if (isCalculatingRef.current) {
      console.log('⏸️ Calcul déjà en cours')
      return
    }

    // Vérifier le cache d'abord
    const cacheKey = getCacheKey(
      userLocation.lat,
      userLocation.lng,
      resellers.map(r => r.id),
      travelMode
    )

    const cachedDistances = loadFromCache(cacheKey)
    if (cachedDistances) {
      console.log('📦 Utilisation du cache:', Object.keys(cachedDistances).length, 'distances')
      setDistances(cachedDistances)
      lastUserLocationRef.current = userLocationKey
      lastResellersRef.current = resellersKey
      lastTravelModeRef.current = travelMode
      return
    }

    // Vérifier Google Maps
    if (typeof google === 'undefined') {
      console.error('❌ Google Maps non chargé')
      setError('Google Maps non disponible')
      return
    }

    if (!google.maps?.DistanceMatrixService) {
      console.error('❌ DistanceMatrixService non disponible')
      setError('Service de calcul non disponible')
      return
    }

    // ✅ CORRECTION : Vérifier que le mode est valide
    const validModes: TravelMode[] = ['DRIVING', 'WALKING']
    if (!validModes.includes(travelMode)) {
      console.error(`❌ Mode ${travelMode} non supporté`)
      setError(`Mode ${travelMode} non disponible`)
      return
    }

    isCalculatingRef.current = true
    setIsLoading(true)
    setError(null)
    
    console.log(`🗺️ Calcul des distances pour ${resellers.length} revendeurs (${travelMode})`)

    try {
      const service = new google.maps.DistanceMatrixService()
      const origin = new google.maps.LatLng(userLocation.lat, userLocation.lng)
      const allDistances: Record<string, DistanceResult> = {}

      // Diviser en batches
      const batches: Reseller[][] = []
      for (let i = 0; i < resellers.length; i += MAX_DESTINATIONS_PER_REQUEST) {
        batches.push(resellers.slice(i, i + MAX_DESTINATIONS_PER_REQUEST))
      }

      console.log(`📦 ${batches.length} batch(es) à traiter`)

      // Traiter chaque batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        console.log(`⏳ Batch ${batchIndex + 1}/${batches.length} (${batch.length} revendeurs)`)

        const destinations = batch.map(r => new google.maps.LatLng(r.lat, r.lng))

        const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: destinations,
              travelMode: google.maps.TravelMode[travelMode],
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (result, status) => {
              if (status === google.maps.DistanceMatrixStatus.OK && result) {
                resolve(result)
              } else {
                console.error(`❌ Erreur batch ${batchIndex + 1}:`, status)
                reject(new Error(`Erreur: ${status}`))
              }
            }
          )
        })

        // Traiter les résultats du batch
        response.rows[0].elements.forEach((element, index) => {
          const reseller = batch[index]
          if (element.status === 'OK') {
            allDistances[reseller.id] = {
              distance: element.distance.text,
              duration: element.duration.text,
              distanceValue: element.distance.value,
              durationValue: element.duration.value,
            }
          } else {
            console.warn(`⚠️ Pas de route pour ${reseller.name}: ${element.status}`)
          }
        })

        console.log(`✅ Batch ${batchIndex + 1} traité`)

        // Petite pause entre les batches
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      // Sauvegarder en cache
      saveToCache(cacheKey, allDistances)
      
      // Mettre à jour les références
      lastUserLocationRef.current = userLocationKey
      lastResellersRef.current = resellersKey
      lastTravelModeRef.current = travelMode
      
      // Mettre à jour l'état
      setDistances(allDistances)
      console.log(`✅ ${Object.keys(allDistances).length} distances calculées`)
      
    } catch (err: any) {
      console.error('❌ Erreur calcul distances:', err)
      
      // Gestion des erreurs spécifiques
      if (err.message.includes('OVER_QUERY_LIMIT')) {
        setError('Limite de requêtes dépassée')
        console.error('❌ Vérifiez votre quota Google Maps API')
      } else if (err.message.includes('REQUEST_DENIED')) {
        setError('Accès refusé - vérifiez la clé API')
      } else if (err.message.includes('INVALID_REQUEST')) {
        setError('Requête invalide')
      } else if (err.message.includes('UNKNOWN_ERROR')) {
        setError('Erreur inconnue, réessayez')
      } else {
        setError('Impossible de calculer les distances')
      }
      
      // Vider les distances en cas d'erreur
      setDistances({})
    } finally {
      setIsLoading(false)
      isCalculatingRef.current = false
    }
  }, [userLocation, resellers, travelMode, distances])

  // ✅ CORRECTION : Recréer les distances quand les paramètres changent
  useEffect(() => {
    console.log('🔄 [useDistanceMatrix] Dépendances changées:', {
      userLocation,
      resellersCount: resellers.length,
      travelMode
    })
    
    const timer = setTimeout(() => {
      calculateDistances()
    }, 500)

    return () => clearTimeout(timer)
  }, [calculateDistances])

  return { distances, isLoading, error, refetch: calculateDistances }
}