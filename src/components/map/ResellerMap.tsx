// src/components/map/ResellerMap.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import type { Reseller } from '@/types/reseller'
import type { Location } from '@/types'

interface ResellerMapProps {
  resellers: Reseller[]
  userLocation: Location | null
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
}

export const ResellerMap: React.FC<ResellerMapProps> = ({
  resellers,
  userLocation,
  selectedReseller,
  onSelectReseller,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialiser Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => console.error('Erreur de chargement Google Maps')
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Créer la carte
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const defaultCenter = { lat: -18.8792, lng: 47.5079 } // Antananarivo

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: userLocation || defaultCenter,
      zoom: userLocation ? 13 : 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })
  }, [isLoaded, userLocation])

  // Ajouter marqueur utilisateur
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }

    userMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Votre position',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: 10,
      },
      zIndex: 1000,
    })

    mapInstanceRef.current.panTo(userLocation)
  }, [userLocation])

  // Ajouter marqueurs revendeurs
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    // Nettoyer anciens marqueurs
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Créer nouveaux marqueurs
    resellers.forEach((reseller) => {
      const marker = new window.google.maps.Marker({
        position: { lat: reseller.lat, lng: reseller.lng },
        map: mapInstanceRef.current!,
        title: reseller.name,
        icon: {
          url: '/icons/marker-vitogaz.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      })

      marker.addListener('click', () => {
        onSelectReseller(reseller)
      })

      markersRef.current.push(marker)
    })
  }, [resellers, isLoaded, onSelectReseller])

  // Centrer sur revendeur sélectionné
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReseller) return

    mapInstanceRef.current.panTo({
      lat: selectedReseller.lat,
      lng: selectedReseller.lng,
    })
    mapInstanceRef.current.setZoom(15)
  }, [selectedReseller])

  return (
    <div ref={mapRef} className="w-full h-full" />
  )
}