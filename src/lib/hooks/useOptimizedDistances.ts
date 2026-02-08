'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Reseller } from '@/types/reseller'

export type TravelMode = 'DRIVING' | 'WALKING'

export interface DistanceResult {
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
  isEstimated: boolean // true = Haversine, false = OSRM
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures
const PRECISE_LIMIT = 15 // Calculer précisément les 15 plus proches
const PARALLEL_REQUESTS = 5 // Nombre de requêtes OSRM en parallèle

// ============================================
// HAVERSINE - Distance à vol d'oiseau
// ============================================

function calculateHaversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Rayon Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance en km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Estimer la durée basée sur la distance Haversine
function estimateDuration(km: number, mode: TravelMode): number {
  const avgSpeed = mode === 'DRIVING' 
    ? (km < 10 ? 40 : 60) // Ville vs route
    : 5 // Marche à pied
  return (km / avgSpeed) * 3600 // Secondes
}

// ============================================
// FORMATAGE
// ============================================

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
}

// ============================================
// CACHE INDIVIDUEL PAR REVENDEUR
// ============================================

function getCacheKey(
  userLat: number,
  userLng: number,
  resellerId: string,
  travelMode: TravelMode
): string {
  return `dist_${userLat.toFixed(3)}_${userLng.toFixed(3)}_${resellerId}_${travelMode}`
}

function loadFromCache(cacheKey: string): DistanceResult | null {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    } else {
      localStorage.removeItem(cacheKey)
      return null
    }
  } catch {
    return null
  }
}

function saveToCache(cacheKey: string, data: DistanceResult) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (err) {
    console.warn('Cache save failed:', err)
  }
}

// ============================================
// OSRM API
// ============================================

async function calculateWithOSRM(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: TravelMode
): Promise<Omit<DistanceResult, 'isEstimated'> | null> {
  try {
    const profile = travelMode === 'DRIVING' ? 'car' : 'foot'
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
    
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data = await response.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return null
    
    const route = data.routes[0]
    
    return {
      distance: formatDistance(route.distance),
      duration: formatDuration(route.duration),
      distanceValue: route.distance,
      durationValue: route.duration,
    }
  } catch {
    return null
  }
}

// ============================================
// HOOK OPTIMISÉ
// ============================================

export function useOptimizedDistances(
  userLocation: { lat: number; lng: number } | null,
  resellers: Reseller[],
  travelMode: TravelMode = 'DRIVING'
) {
  const [distances, setDistances] = useState<Record<string, DistanceResult>>({})
  const [isLoading, setIsLoading] = useState(false)
  const isCalculatingRef = useRef(false)

  const calculateDistances = useCallback(async () => {
    if (!userLocation || resellers.length === 0) {
      setDistances({})
      return
    }

    if (isCalculatingRef.current) return
    isCalculatingRef.current = true
    setIsLoading(true)

    console.log(`🚀 Calcul optimisé pour ${resellers.length} revendeurs`)

    try {
      const result: Record<string, DistanceResult> = {}

      // ÉTAPE 1 : Calcul Haversine pour TOUS (instantané)
      const withHaversine = resellers.map(reseller => {
        const haversineKm = calculateHaversine(
          userLocation.lat,
          userLocation.lng,
          reseller.lat,
          reseller.lng
        )
        
        return {
          reseller,
          haversineKm,
          haversineMeters: haversineKm * 1000
        }
      })

      // ÉTAPE 2 : Trier par distance Haversine
      withHaversine.sort((a, b) => a.haversineKm - b.haversineKm)

      // ÉTAPE 3 : Créer distances estimées pour TOUS
      withHaversine.forEach(({ reseller, haversineMeters }) => {
        const estimatedDurationSec = estimateDuration(haversineMeters / 1000, travelMode)
        
        result[reseller.id] = {
          distance: formatDistance(haversineMeters),
          duration: formatDuration(estimatedDurationSec),
          distanceValue: haversineMeters,
          durationValue: estimatedDurationSec,
          isEstimated: true
        }
      })

      // Afficher immédiatement les estimations
      setDistances(result)
      console.log(`⚡ ${resellers.length} estimations Haversine affichées`)

      // ÉTAPE 4 : Calculer précisément les N plus proches avec OSRM
      const closestResellers = withHaversine.slice(0, PRECISE_LIMIT)
      console.log(`🎯 Calcul OSRM précis pour ${closestResellers.length} revendeurs proches`)

      // Calculer en parallèle par lots
      for (let i = 0; i < closestResellers.length; i += PARALLEL_REQUESTS) {
        const batch = closestResellers.slice(i, i + PARALLEL_REQUESTS)
        
        const promises = batch.map(async ({ reseller }) => {
          const cacheKey = getCacheKey(
            userLocation.lat,
            userLocation.lng,
            reseller.id,
            travelMode
          )

          // Vérifier le cache
          const cached = loadFromCache(cacheKey)
          if (cached) return { resellerId: reseller.id, distance: cached }

          // Calculer avec OSRM
          const osrmResult = await calculateWithOSRM(
            userLocation,
            { lat: reseller.lat, lng: reseller.lng },
            travelMode
          )

          if (osrmResult) {
            const distanceResult: DistanceResult = {
              ...osrmResult,
              isEstimated: false
            }
            
            // Sauvegarder en cache
            saveToCache(cacheKey, distanceResult)
            
            return { resellerId: reseller.id, distance: distanceResult }
          }

          return null
        })

        // Attendre le lot
        const batchResults = await Promise.all(promises)

        // Mettre à jour les distances avec les résultats OSRM
        batchResults.forEach(r => {
          if (r) {
            result[r.resellerId] = r.distance
          }
        })

        // Mettre à jour l'affichage après chaque lot
        setDistances({ ...result })
        console.log(`✅ Lot ${Math.floor(i / PARALLEL_REQUESTS) + 1} terminé`)
      }

      console.log(`🎉 Calcul terminé : ${closestResellers.length} distances OSRM précises`)

    } catch (err) {
      console.error('❌ Erreur calcul distances:', err)
    } finally {
      setIsLoading(false)
      isCalculatingRef.current = false
    }
  }, [userLocation, resellers, travelMode])

  useEffect(() => {
    const timer = setTimeout(calculateDistances, 300)
    return () => clearTimeout(timer)
  }, [calculateDistances])

  return { 
    distances, 
    isLoading,
    sortedResellers: resellers // Déjà triés par Haversine dans le calcul
  }
}