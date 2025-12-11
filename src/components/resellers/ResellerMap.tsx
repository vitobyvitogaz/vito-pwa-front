'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Reseller } from '@/types/reseller'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface ResellerMapProps {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
  userLocation: { lat: number; lng: number } | null
}

const getColorForType = (type: Reseller['type']) => {
  switch (type) {
    case 'Quincaillerie':
      return '#C8102E'
    case 'Épicerie':
      return '#008B7F'
    case 'Station Service':
      return '#FF8C00'
    case 'Autres':
    default:
      return '#4B5563'
  }
}

export const ResellerMap: React.FC<ResellerMapProps> = ({
  resellers,
  selectedReseller,
  onSelectReseller,
  userLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastUserLocationRef = useRef<string>('')
  const lastResellersRef = useRef<string>('')
  const isInitialCenteringDoneRef = useRef(false)

  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current) {
      console.warn('Carte non disponible')
      return
    }

    if (resellers.length === 0) {
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      return
    }

    // Vérifier si les revendeurs ont changé
    const resellersKey = resellers.map(r => `${r.lat},${r.lng}`).join('|')
    if (resellersKey === lastResellersRef.current && markersRef.current.length > 0) {
      console.log('📍 Markers inchangés')
      return
    }

    // Supprimer les anciens markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Créer les nouveaux markers
    resellers.forEach((reseller) => {
      const marker = new google.maps.Marker({
        position: { lat: reseller.lat, lng: reseller.lng },
        map: mapInstanceRef.current,
        title: reseller.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getColorForType(reseller.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      marker.addListener('click', () => {
        onSelectReseller(reseller)
        mapInstanceRef.current?.panTo({ lat: reseller.lat, lng: reseller.lng })
        mapInstanceRef.current?.setZoom(15)
      })

      markersRef.current.push(marker)
    })

    // ✅ CORRECTION : Centrer sur les markers seulement si pas de position utilisateur
    if (markersRef.current.length > 0 && mapInstanceRef.current && !isInitialCenteringDoneRef.current) {
      const bounds = new google.maps.LatLngBounds()
      markersRef.current.forEach(marker => {
        const position = marker.getPosition()
        if (position) bounds.extend(position)
      })

      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds)
        
        google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
          const currentZoom = mapInstanceRef.current!.getZoom()
          if (currentZoom && currentZoom > 15) {
            mapInstanceRef.current!.setZoom(15)
          }
        })
      }
    }

    lastResellersRef.current = resellersKey
    console.log(`📍 ${markersRef.current.length} markers créés`)
  }, [resellers, onSelectReseller])

  // ✅ CORRECTION : Centrer sur la position utilisateur
  const centerOnUserLocation = useCallback((location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return

    const locationKey = `${location.lat},${location.lng}`
    if (locationKey === lastUserLocationRef.current) {
      console.log('📍 Position utilisateur déjà centrée')
      return
    }

    // Créer ou mettre à jour le marker utilisateur
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }

    userMarkerRef.current = new google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: 'Votre position',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      animation: google.maps.Animation.DROP,
    })

    // Centrer la carte sur l'utilisateur
    mapInstanceRef.current.panTo(location)
    mapInstanceRef.current.setZoom(14)
    
    isInitialCenteringDoneRef.current = true
    lastUserLocationRef.current = locationKey
    
    console.log('📍 Carte centrée sur position utilisateur')
  }, [])

  // Initialisation de la carte
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        if (!apiKey) {
          setError('Clé Google Maps manquante')
          setIsLoading(false)
          return
        }

        setOptions({ key: apiKey })

        const { Map } = await importLibrary('maps')

        if (!mapRef.current) {
          setError('Erreur de chargement de la carte')
          setIsLoading(false)
          return
        }

        // Centre par défaut basé sur les revendeurs
        const getDefaultCenter = () => {
          if (resellers.length > 0) {
            const avgLat = resellers.reduce((sum, r) => sum + r.lat, 0) / resellers.length
            const avgLng = resellers.reduce((sum, r) => sum + r.lng, 0) / resellers.length
            return { lat: avgLat, lng: avgLng }
          }
          return { lat: -18.9137, lng: 47.5236 } // Fallback
        }

        const map = new Map(mapRef.current, {
          center: getDefaultCenter(),
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        mapInstanceRef.current = map
        setIsLoading(false)

        // Créer les markers initiaux
        createMarkers()
        
      } catch (err) {
        console.error('Erreur initialisation map:', err)
        setError('Erreur de chargement de la carte')
        setIsLoading(false)
      }
    }

    initMap()
  }, [createMarkers, resellers])

  // ✅ CORRECTION : Mettre à jour les markers quand les revendeurs changent
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      createMarkers()
    }
  }, [resellers, isLoading, createMarkers])

  // ✅ CORRECTION : Centrer sur la position utilisateur quand elle change
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && !isLoading) {
      centerOnUserLocation(userLocation)
    }
  }, [userLocation, isLoading, centerOnUserLocation])

  // Mise en évidence du revendeur sélectionné
  useEffect(() => {
    if (!selectedReseller || markersRef.current.length === 0) return

    markersRef.current.forEach(marker => {
      const isSelected = marker.getTitle() === selectedReseller.name

      if (isSelected) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: getColorForType(selectedReseller.type),
          fillOpacity: 1,
          strokeColor: '#FFD700',
          strokeWeight: 3,
        })

        marker.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => marker.setAnimation(null), 1400)
      } else {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getColorForType(selectedReseller.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        })
      }
    })

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({
        lat: selectedReseller.lat,
        lng: selectedReseller.lng,
      })
      mapInstanceRef.current.setZoom(15)
    }
  }, [selectedReseller])

  // Nettoyage
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null))
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
      }
    }
  }, [])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{error}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Vérifiez votre clé API Google Maps
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Chargement de la carte...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && !isLoading && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg z-20">
          <div>Markers: {markersRef.current.length}</div>
          <div>User loc: {userLocation ? '✓' : '✗'}</div>
          <div>Centered: {isInitialCenteringDoneRef.current ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  )
}