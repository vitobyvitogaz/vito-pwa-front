'use client'

import { useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  })

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'La géolocalisation n\'est pas supportée' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    // watchPosition force une position fraîche, on l'arrête dès la première réponse
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('📍 [useGeolocation] Position fraîche obtenue:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        navigator.geolocation.clearWatch(watchId)
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        console.error('📍 [useGeolocation] Erreur:', error.message)
        navigator.geolocation.clearWatch(watchId)
        setState({
          latitude: null,
          longitude: null,
          error: error.message,
          loading: false,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  return { ...state, getCurrentPosition }
}