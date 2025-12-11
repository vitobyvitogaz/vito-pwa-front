'use client'

import type { TravelMode } from '@/lib/hooks/useDistanceMatrix'

interface TravelModeSelectorProps {
  mode: TravelMode
  onChange: (mode: TravelMode) => void
}

// ✅ CORRECTION : Garder seulement DRIVING et WALKING
const modes = [
  { id: 'DRIVING' as TravelMode, label: 'Voiture', icon: '🚗' },
  { id: 'WALKING' as TravelMode, label: 'À pied', icon: '🚶' },
]

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({ mode, onChange }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-neutral-200 dark:border-dark-border mb-4">
      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
        Mode de transport
      </p>
      <div className="grid grid-cols-2 gap-2"> {/* ✅ CORRECTION : 2 colonnes au lieu de 4 */}
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              mode === m.id
                ? 'bg-primary text-white scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-xs font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}