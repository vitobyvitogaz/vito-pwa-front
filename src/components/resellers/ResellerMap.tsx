'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Reseller } from '@/types/reseller'

interface ResellerMapProps {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  onSelectReseller: (reseller: Reseller) => void
  userLocation: { lat: number; lng: number } | null
}

const getColorForType = (type: Reseller['type']) => {
  switch (type) {
    case 'Quincaillerie':   return '#6B7280' // ← gris
    case 'Épicerie':        return '#008B7F'
    case 'Station Service': return '#FF8C00'
    case 'Libre Service':   return '#7C3AED'
    case 'Maison du gaz':   return '#0639a7ff'
    default:                return '#4B5563'
  }
}

const LEGEND_ITEMS = [
  { type: 'Station Service' as const, color: '#FF8C00', label: 'Station' },
  { type: 'Quincaillerie'   as const, color: '#6B7280', label: 'Quincaillerie' }, // ← gris
  { type: 'Épicerie'        as const, color: '#008B7F', label: 'Épicerie' },
  { type: 'Libre Service'   as const, color: '#7C3AED', label: 'Libre service' },
  { type: 'Maison du gaz'   as const, color: '#0639a7', label: 'Maison du gaz' },
]

const createResellerIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 28 : 20
  const borderColor = isSelected ? '#FFD700' : '#ffffff'
  const borderWidth = isSelected ? 3 : 2
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${size}px;height:${size}px;background-color:${color};border:${borderWidth}px solid ${borderColor};border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);${isSelected ? 'animation:bounce 0.7s;' : ''}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const createUserIcon = () => L.divIcon({
  className: 'custom-pin',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 30 40"><path d="M15 0C7.268 0 1 6.268 1 14c0 10.5 14 26 14 26S29 24.5 29 14C29 6.268 22.732 0 15 0z" fill="#EF4444" stroke="white" stroke-width="2.5" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"/><circle cx="15" cy="14" r="6" fill="white" opacity="0.95"/><circle cx="15" cy="14" r="3" fill="#EF4444"/></svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -38],
})

const MapController = ({
  resellers, selectedReseller, userLocation,
}: {
  resellers: Reseller[]
  selectedReseller: Reseller | null
  userLocation: { lat: number; lng: number } | null
}) => {
  const map = useMap()
  const [hasInitialCentering, setHasInitialCentering] = useState(false)

  useEffect(() => {
    if (userLocation && !hasInitialCentering) {
      map.setView([userLocation.lat, userLocation.lng], 15)
      setHasInitialCentering(true)
    }
  }, [userLocation, hasInitialCentering, map])

  useEffect(() => {
    if (!userLocation && resellers.length > 0 && !hasInitialCentering) {
      const bounds = L.latLngBounds(resellers.map((r) => [r.lat, r.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      setHasInitialCentering(true)
    }
  }, [userLocation, resellers, hasInitialCentering, map])

  useEffect(() => {
    if (hasInitialCentering && resellers.length > 0) {
      if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 13, { animate: true })
      } else {
        const bounds = L.latLngBounds(resellers.map((r) => [r.lat, r.lng]))
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
      }
    }
  }, [resellers, hasInitialCentering, userLocation, map])

  useEffect(() => {
    if (selectedReseller) {
      map.setView([selectedReseller.lat, selectedReseller.lng], 16, { animate: true })
    }
  }, [selectedReseller, map])

  return null
}

export const ResellerMap: React.FC<ResellerMapProps> = ({
  resellers, selectedReseller, onSelectReseller, userLocation,
}) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

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

  const defaultCenter: [number, number] = [-18.9137, 47.5236]

  return (
    <div className="relative h-full">
      <style jsx global>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .custom-pin { background: none !important; border: none !important; }
      `}</style>

      <MapContainer center={defaultCenter} zoom={12} className="h-full w-full" zoomControl scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController resellers={resellers} selectedReseller={selectedReseller} userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup><div className="text-sm font-medium">Votre position</div></Popup>
          </Marker>
        )}

        {resellers.map((reseller) => (
          <Marker
            key={reseller.id}
            position={[reseller.lat, reseller.lng]}
            icon={createResellerIcon(getColorForType(reseller.type), selectedReseller?.id === reseller.id)}
            eventHandlers={{ click: () => onSelectReseller(reseller) }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-neutral-900 mb-1">{reseller.name}</h3>
                <p className="text-sm text-neutral-600 mb-2">{reseller.address}</p>
                <span className="px-2 py-1 bg-neutral-100 rounded-lg text-xs">{reseller.type}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Légende horizontale compacte — bas de carte ── */}
      <div className="absolute bottom-3 left-3 right-3 lg:bottom-4 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-neutral-200/60 dark:border-neutral-800 z-[1000]">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-white/80 shadow-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200 dark:border-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 30 40" style={{ flexShrink: 0 }}>
              <path d="M15 0C7.268 0 1 6.268 1 14c0 10.5 14 26 14 26S29 24.5 29 14C29 6.268 22.732 0 15 0z" fill="#EF4444" stroke="white" strokeWidth="2.5" />
              <circle cx="15" cy="14" r="6" fill="white" opacity="0.95" />
              <circle cx="15" cy="14" r="3" fill="#EF4444" />
            </svg>
            <span className="text-[10px] text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap">Votre position</span>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-xl z-[1000]">
          <div>Markers: {resellers.length}</div>
          <div>User loc: {userLocation ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  )
}