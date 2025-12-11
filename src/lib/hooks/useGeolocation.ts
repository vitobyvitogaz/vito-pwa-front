'use client'

import { useState, useEffect } from 'react'

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
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 [useGeolocation] Position obtenue:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        console.error('📍 [useGeolocation] Erreur:', error.message)
        setState({
          latitude: null,
          longitude: null,
          error: error.message,
          loading: false,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Augmenté à 10s
        maximumAge: 0,
      }
    )
  }

  return {
    ...state,
    getCurrentPosition,
  }
}