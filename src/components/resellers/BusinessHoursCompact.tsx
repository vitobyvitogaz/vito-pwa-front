'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import type { BusinessHours as BusinessHoursType } from '@/types/reseller'

interface BusinessHoursCompactProps {
  hours: BusinessHoursType
  currentDay?: string
  isOpen?: boolean
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const BusinessHoursCompact: React.FC<BusinessHoursCompactProps> = ({ 
  hours, 
  currentDay, 
  isOpen 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hours || !hours.default_schedule) {
    return null
  }

  const formatTime = (time: string) => time.replace(':', 'h')

  const todaySchedule = currentDay ? hours.default_schedule[currentDay] : null

  const renderCompactView = () => {
    if (!todaySchedule) return null

    if (todaySchedule.closed) {
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Fermé aujourd'hui
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            Aujourd'hui : {formatTime(todaySchedule.open!)} - {formatTime(todaySchedule.close!)}
          </span>
          {todaySchedule.breaks && todaySchedule.breaks.length > 0 && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Pause : {todaySchedule.breaks.map(b => `${formatTime(b.start)}-${formatTime(b.end)}`).join(', ')}
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderExpandedView = () => {
    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
        {DAYS_ORDER.map(day => {
          const schedule = hours.default_schedule[day]
          if (!schedule) return null

          const isToday = day === currentDay

          return (
            <div
              key={day}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                isToday
                  ? 'bg-primary/5 dark:bg-primary/10'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {isToday && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                )}
                <span className={`text-sm ${isToday ? 'font-semibold text-primary' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {DAY_LABELS[day]}
                </span>
              </div>

              <div className="text-right">
                {schedule.closed ? (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">Fermé</span>
                ) : (
                  <div className="space-y-0.5">
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">
                      {formatTime(schedule.open!)} - {formatTime(schedule.close!)}
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
        })}
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-white dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      {/* Compact View */}
      {renderCompactView()}

      {/* Expanded View */}
      {isExpanded && renderExpandedView()}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
      >
        <Calendar className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
        <span>{isExpanded ? 'Masquer les horaires' : 'Voir tous les horaires'}</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" strokeWidth={2} />
        )}
      </button>
    </div>
  )
}