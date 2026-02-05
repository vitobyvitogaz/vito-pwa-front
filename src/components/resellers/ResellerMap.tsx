'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Reseller } from '@/types/reseller'
import { AlertCircle } from 'lucide-react'

interface ResellerMapProps {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
  userLocation: { lat: number; lng: number } | null
}

// Couleurs par type de revendeur
const getColorForType = (type: Reseller['type']) => {
  switch (type) {
    case 'Quincaillerie':
      return '#C8102E'
    case 'Épicerie':
      return '#008B7F'
    case 'Station Service':
      return '#FF8C00'
    case 'Libre service':
      return '#7C3AED'
    default:
      return '#4B5563'
  }
}

// Configuration de la légende
const LEGEND_ITEMS = [
  { type: 'Quincaillerie' as const, color: '#C8102E', label: 'Quincaillerie' },
  { type: 'Épicerie' as const, color: '#008B7F', label: 'Épicerie' },
  { type: 'Station Service' as const, color: '#FF8C00', label: 'Station Service' },
  { type: 'Libre service' as const, color: '#7C3AED', label: 'Libre service' },
]

// Créer une icône personnalisée pour les revendeurs
const createResellerIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 28 : 20
  const borderColor = isSelected ? '#FFD700' : '#ffffff'
  const borderWidth = isSelected ? 3 : 2

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: bounce 0.7s;' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Créer une icône pour l'utilisateur
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #3B82F6;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Composant pour gérer le centrage et le zoom de la carte
const MapController = ({
  resellers,
  selectedReseller,
  userLocation,
  isInitialCenteringDone,
  setIsInitialCenteringDone,
}: {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  userLocation: { lat: number; lng: number } | null
  isInitialCenteringDone: boolean
  setIsInitialCenteringDone: (value: boolean) => void
}) => {
  const map = useMap()

  // Centrer sur la position utilisateur avec zoom 2km
  useEffect(() => {
    if (userLocation && !isInitialCenteringDone) {
      // Zoom 15 = environ 2km de rayon
      map.setView([userLocation.lat, userLocation.lng], 15)
      setIsInitialCenteringDone(true)
      console.log('📍 Carte centrée sur position utilisateur (rayon 2km)')
    }
  }, [userLocation, isInitialCenteringDone, map, setIsInitialCenteringDone])

  // Centrer sur tous les markers si pas de position utilisateur
  useEffect(() => {
    if (!userLocation && resellers.length > 0 && !isInitialCenteringDone) {
      const bounds = L.latLngBounds(
        resellers.map((r) => [r.lat, r.lng])
      )
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      setIsInitialCenteringDone(true)
      console.log('📍 Carte centrée sur tous les revendeurs')
    }
  }, [userLocation, resellers, isInitialCenteringDone, map, setIsInitialCenteringDone])

  // Centrer sur le revendeur sélectionné
  useEffect(() => {
    if (selectedReseller) {
      map.setView([selectedReseller.lat, selectedReseller.lng], 15, {
        animate: true,
      })
    }
  }, [selectedReseller, map])

  return null
}

export const ResellerMap: React.FC<ResellerMapProps> = ({
  resellers,
  selectedReseller,
  onSelectReseller,
  userLocation,
}) => {
  const [isInitialCenteringDone, setIsInitialCenteringDone] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // S'assurer qu'on est côté client (pour éviter les erreurs SSR)
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  // Centre par défaut (Madagascar)
  const defaultCenter: [number, number] = [-18.9137, 47.5236]

  return (
    <div className="relative h-full">
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          resellers={resellers}
          selectedReseller={selectedReseller}
          userLocation={userLocation}
          isInitialCenteringDone={isInitialCenteringDone}
          setIsInitialCenteringDone={setIsInitialCenteringDone}
        />

        {/* Marker utilisateur */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-sm font-medium">Votre position</div>
            </Popup>
          </Marker>
        )}

        {/* Markers revendeurs */}
        {resellers.map((reseller) => (
          <Marker
            key={reseller.id}
            position={[reseller.lat, reseller.lng]}
            icon={createResellerIcon(
              getColorForType(reseller.type),
              selectedReseller?.id === reseller.id
            )}
            eventHandlers={{
              click: () => onSelectReseller(reseller),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {reseller.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  {reseller.address}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-neutral-100 rounded-lg">
                    {reseller.type}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-dark-surface rounded-xl p-3 shadow-lg border border-neutral-200 dark:border-neutral-800 z-[1000]">
        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white mb-2">
          Types de revendeurs
        </h4>
        <div className="space-y-2">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-neutral-700 dark:text-neutral-300">
                {item.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-700">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: '#3B82F6' }}
            />
            <span className="text-xs text-neutral-700 dark:text-neutral-300">
              Votre position
            </span>
          </div>
        </div>
      </div>

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-xl z-[1000]">
          <div>Markers: {resellers.length}</div>
          <div>User loc: {userLocation ? '✓' : '✗'}</div>
          <div>Centered: {isInitialCenteringDone ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  )
}