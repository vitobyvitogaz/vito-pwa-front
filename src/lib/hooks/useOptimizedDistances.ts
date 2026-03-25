'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Reseller } from '@/types/reseller'

export type TravelMode = 'DRIVING' | 'WALKING'

export interface DistanceResult {
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
  isEstimated: boolean
}

const CACHE_DURATION = 24 * 60 * 60 * 1000
const PRECISE_LIMIT = 15
// Augmente de 5 a 8 : 15 revendeurs en 2 lots au lieu de 3
const PARALLEL_REQUESTS = 8

function calculateHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function estimateDuration(km: number, mode: TravelMode): number {
  const avgSpeed = mode === 'DRIVING' ? (km < 10 ? 40 : 60) : 5
  return (km / avgSpeed) * 3600
}

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

function getCacheKey(userLat: number, userLng: number, resellerId: string, travelMode: TravelMode): string {
  return `dist_${userLat.toFixed(3)}_${userLng.toFixed(3)}_${resellerId}_${travelMode}`
}

function loadFromCache(cacheKey: string): DistanceResult | null {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_DURATION) return data
    localStorage.removeItem(cacheKey)
    return null
  } catch {
    return null
  }
}

function saveToCache(cacheKey: string, data: DistanceResult) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (err) {
    console.warn('Cache save failed:', err)
  }
}

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

export function useOptimizedDistances(
  userLocation: { lat: number; lng: number } | null,
  resellers: Reseller[],
  travelMode: TravelMode = 'DRIVING'
) {
  const [distances, setDistances] = useState<Record<string, DistanceResult>>({})
  const [sortedResellers, setSortedResellers] = useState<Reseller[]>(resellers)
  const [isLoading, setIsLoading] = useState(false)
  const isCalculatingRef = useRef(false)

  // Cle stable basee sur les IDs — evite les recalculs sur reference instable
  // 620 revendeurs avec memes IDs = meme cle = pas de recalcul parasite
  const resellersKey = useMemo(
    () => resellers.map(r => r.id).join(','),
    [resellers]
  )

  // Reference stable vers le tableau courant sans le mettre en dependance
  const resellersRef = useRef(resellers)
  useEffect(() => { resellersRef.current = resellers }, [resellers])

  // Reinitialiser le verrou quand position ou mode change
  useEffect(() => {
    isCalculatingRef.current = false
  }, [userLocation, travelMode])

  const calculateDistances = useCallback(async () => {
    const currentResellers = resellersRef.current

    if (!userLocation || currentResellers.length === 0) {
      setDistances({})
      setSortedResellers(currentResellers)
      return
    }

    if (isCalculatingRef.current) return
    isCalculatingRef.current = true
    setIsLoading(true)

    console.log(`Calcul optimise pour ${currentResellers.length} revendeurs`)

    try {
      const result: Record<string, DistanceResult> = {}

      // ETAPE 1 : Haversine pour TOUS (instantane)
      const withHaversine = currentResellers.map(reseller => {
        const haversineKm = calculateHaversine(
          userLocation.lat,
          userLocation.lng,
          reseller.lat,
          reseller.lng
        )
        return { reseller, haversineKm, haversineMeters: haversineKm * 1000 }
      })

      // ETAPE 2 : Trier par Haversine
      withHaversine.sort((a, b) => a.haversineKm - b.haversineKm)

      // ETAPE 3 : Revendeurs tries
      const sorted = withHaversine.map(item => item.reseller)
      setSortedResellers(sorted)

      // ETAPE 4 : Estimations pour TOUS
      withHaversine.forEach(({ reseller, haversineMeters }) => {
        const estimatedDurationSec = estimateDuration(haversineMeters / 1000, travelMode)
        result[reseller.id] = {
          distance: formatDistance(haversineMeters),
          duration: formatDuration(estimatedDurationSec),
          distanceValue: haversineMeters,
          durationValue: estimatedDurationSec,
          isEstimated: true,
        }
      })

      setDistances({ ...result })

      // ETAPE 5 : OSRM precis pour les N plus proches (2 lots de 8 au lieu de 3 lots de 5)
      const closestResellers = withHaversine.slice(0, PRECISE_LIMIT)

      for (let i = 0; i < closestResellers.length; i += PARALLEL_REQUESTS) {
        const batch = closestResellers.slice(i, i + PARALLEL_REQUESTS)

        const promises = batch.map(async ({ reseller }) => {
          const cacheKey = getCacheKey(userLocation.lat, userLocation.lng, reseller.id, travelMode)
          const cached = loadFromCache(cacheKey)
          if (cached) return { resellerId: reseller.id, distance: cached }

          const osrmResult = await calculateWithOSRM(
            userLocation,
            { lat: reseller.lat, lng: reseller.lng },
            travelMode
          )

          if (osrmResult) {
            const distanceResult: DistanceResult = { ...osrmResult, isEstimated: false }
            saveToCache(cacheKey, distanceResult)
            return { resellerId: reseller.id, distance: distanceResult }
          }

          return null
        })

        const batchResults = await Promise.all(promises)
        batchResults.forEach(r => { if (r) result[r.resellerId] = r.distance })
        setDistances({ ...result })
      }

      // Re-trier avec distances OSRM precises
      const resellersWithFinalDistances = sorted.map(reseller => ({
        reseller,
        distanceValue: result[reseller.id]?.distanceValue ?? Infinity
      }))
      resellersWithFinalDistances.sort((a, b) => a.distanceValue - b.distanceValue)
      setSortedResellers(resellersWithFinalDistances.map(r => r.reseller))

    } catch (err) {
      console.error('Erreur calcul distances:', err)
      setSortedResellers(resellersRef.current)
    } finally {
      setIsLoading(false)
      isCalculatingRef.current = false
    }
  // resellersKey au lieu de resellers : stable si memes IDs, pas de recalcul parasite
  }, [userLocation, resellersKey, travelMode])

  useEffect(() => {
    const timer = setTimeout(calculateDistances, 300)
    return () => clearTimeout(timer)
  }, [calculateDistances])

  return { distances, isLoading, sortedResellers }
}