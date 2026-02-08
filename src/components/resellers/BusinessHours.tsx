'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { BusinessHours as BusinessHoursType } from '@/types/reseller'

interface BusinessHoursProps {
  hours: BusinessHoursType
  currentDay?: string
  isOpen?: boolean
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

export const BusinessHours: React.FC<BusinessHoursProps> = ({ hours, currentDay, isOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hours || !hours.default_schedule) {
    return null
  }

  const formatTime = (time: string) => {
    return time.replace(':', 'h')
  }

  const renderDaySchedule = (day: string) => {
    const schedule = hours.default_schedule[day]
    if (!schedule) return null

    const isToday = day === currentDay
    const isClosed = schedule.closed

    return (
      <div
        key={day}
        className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200 ${
          isToday
            ? 'bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isToday && isOpen
                ? 'bg-green-500 animate-pulse'
                : isToday && !isOpen
                ? 'bg-red-500'
                : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isToday
                ? 'text-primary dark:text-primary-400'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {DAY_LABELS[day]}
          </span>
        </div>

        <div className="text-right">
          {isClosed ? (
            <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">Fermé</span>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-neutral-900 dark:text-neutral-100">
                <span>{formatTime(schedule.open!)} - {formatTime(schedule.close!)}</span>
              </div>
              {schedule.breaks && schedule.breaks.length > 0 && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Pause : {schedule.breaks.map(b => `${formatTime(b.start)}-${formatTime(b.end)}`).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const todaySchedule = currentDay ? hours.default_schedule[currentDay] : null
  const displayDays = isExpanded ? DAYS_ORDER : DAYS_ORDER.slice(0, 3)

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-900/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <h4 className="font-semibold text-neutral-900 dark:text-white">Horaires d'ouverture</h4>
        </div>
        
        {todaySchedule && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isOpen
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {isOpen ? "Aujourd'hui" : 'Fermé'}
          </span>
        )}
      </div>

      {/* Schedule List */}
      <div className="space-y-1.5">
        {displayDays.map(renderDaySchedule)}
      </div>

      {/* Expand/Collapse Button */}
      {DAYS_ORDER.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {isExpanded ? (
            <>
              <span>Voir moins</span>
              <ChevronUp className="w-4 h-4" strokeWidth={2} />
            </>
          ) : (
            <>
              <span>Voir toute la semaine</span>
              <ChevronDown className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </button>
      )}

      {/* Holidays Notice */}
      {hours.holidays && hours.holidays.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            ⚠️ Fermé les jours fériés
          </p>
        </div>
      )}
    </div>
  )
}