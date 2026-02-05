'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Reseller } from '@/types/reseller'

export type TravelMode = 'DRIVING' | 'WALKING'

export interface DistanceResult {
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 heure
const BATCH_DELAY = 100 // Délai entre les requêtes (ms)

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

// Formater la distance
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

// Formater la durée
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} min`
}

// Calculer une distance avec OSRM
const calculateDistanceWithOSRM = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: TravelMode
): Promise<DistanceResult | null> => {
  try {
    // Choisir le profil OSRM selon le mode
    const profile = travelMode === 'DRIVING' ? 'car' : 'foot'
    
    // URL de l'API OSRM publique
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn(`⚠️ Erreur OSRM: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('⚠️ Pas de route trouvée')
      return null
    }
    
    const route = data.routes[0]
    const distanceMeters = route.distance
    const durationSeconds = route.duration
    
    return {
      distance: formatDistance(distanceMeters),
      duration: formatDuration(durationSeconds),
      distanceValue: distanceMeters,
      durationValue: durationSeconds,
    }
  } catch (err) {
    console.error('❌ Erreur calcul OSRM:', err)
    return null
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
    console.log('🔍 [useDistanceMatrix] Début du calcul avec OSRM', {
      userLocation,
      resellersCount: resellers.length,
      travelMode
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

    isCalculatingRef.current = true
    setIsLoading(true)
    setError(null)
    
    console.log(`🗺️ Calcul des distances pour ${resellers.length} revendeurs avec OSRM (${travelMode})`)

    try {
      const allDistances: Record<string, DistanceResult> = {}
      let successCount = 0
      let errorCount = 0

      // Calculer les distances une par une avec un délai
      for (let i = 0; i < resellers.length; i++) {
        const reseller = resellers[i]
        
        const result = await calculateDistanceWithOSRM(
          userLocation,
          { lat: reseller.lat, lng: reseller.lng },
          travelMode
        )
        
        if (result) {
          allDistances[reseller.id] = result
          successCount++
        } else {
          errorCount++
          console.warn(`⚠️ Impossible de calculer la distance pour ${reseller.name}`)
        }
        
        // Petit délai entre chaque requête pour éviter de surcharger l'API
        if (i < resellers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
        }
        
        // Afficher la progression tous les 5 revendeurs
        if ((i + 1) % 5 === 0 || i === resellers.length - 1) {
          console.log(`⏳ Progression: ${i + 1}/${resellers.length} revendeurs traités`)
        }
      }

      // Sauvegarder en cache
      if (Object.keys(allDistances).length > 0) {
        saveToCache(cacheKey, allDistances)
      }
      
      // Mettre à jour les références
      lastUserLocationRef.current = userLocationKey
      lastResellersRef.current = resellersKey
      lastTravelModeRef.current = travelMode
      
      // Mettre à jour l'état
      setDistances(allDistances)
      console.log(`✅ ${successCount} distances calculées (${errorCount} erreurs)`)
      
      if (errorCount > 0) {
        setError(`${errorCount} revendeur(s) non accessible(s)`)
      }
      
    } catch (err: any) {
      console.error('❌ Erreur calcul distances:', err)
      setError('Impossible de calculer les distances')
      setDistances({})
    } finally {
      setIsLoading(false)
      isCalculatingRef.current = false
    }
  }, [userLocation, resellers, travelMode, distances])

  useEffect(() => {
    console.log('🔄 [useDistanceMatrix] Dépendances changées')
    
    const timer = setTimeout(() => {
      calculateDistances()
    }, 500)

    return () => clearTimeout(timer)
  }, [calculateDistances])

  return { distances, isLoading, error, refetch: calculateDistances }
}