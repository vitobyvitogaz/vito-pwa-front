'use client'

import { Truck, User } from 'lucide-react'
import type { TravelMode } from '@/lib/hooks/useDistanceMatrix'

interface TravelModeSelectorProps {
  mode: TravelMode
  onChange: (mode: TravelMode) => void
}

const modes = [
  { id: 'DRIVING' as TravelMode, label: 'Voiture', icon: Truck },
  { id: 'WALKING' as TravelMode, label: 'À pied', icon: User },
]

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({ mode, onChange }) => {
  return (
    // ── Compact : flex horizontal, moins de padding, pas de card wrapper ──
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex-shrink-0">
        Transport :
      </span>
      <div className="flex gap-1.5">
        {modes.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                mode === m.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {m.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}