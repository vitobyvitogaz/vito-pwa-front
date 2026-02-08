// src/components/map/ResellerCard.tsx

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getWhatsAppLink, getPhoneLink } from '@/lib/utils/whatsapp'
import { calculateDistance } from '@/lib/utils/geo'
import type { Reseller } from '@/types/reseller'
import type { Location } from '@/types'
import {
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

interface ResellerCardProps {
  reseller: Reseller
  isSelected: boolean
  onClick: () => void
  userLocation: Location | null
}

export const ResellerCard: React.FC<ResellerCardProps> = ({
  reseller,
  isSelected,
  onClick,
  userLocation,
}) => {
  const { t } = useTranslation()

  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        reseller.lat,
        reseller.lng
      )
    : null

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const message = `Bonjour, je souhaite commander du gaz. Je vous contacte depuis l'app Vito.`
    window.open(getWhatsAppLink(reseller.phone, message), '_blank')
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = getPhoneLink(reseller.phone)
  }

  return (
    <Card
      variant={isSelected ? 'outlined' : 'elevated'}
      interactive
      onClick={onClick}
      className={`transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary mb-1">
              {reseller.name}
            </h3>
            <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {reseller.address}
            </div>
          </div>
          {distance && (
            <div className="bg-primary-50 dark:bg-primary-900/30 text-primary px-3 py-1 rounded-full text-sm font-medium ml-2">
              {distance.toFixed(1)} km
            </div>
          )}
        </div>

        {/* Badge Ouvert/Fermé */}
        {reseller.business_status && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                reseller.business_status.isOpen
                  ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  reseller.business_status.isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {reseller.business_status.isOpen ? 'OUVERT' : 'FERMÉ'}
            </span>
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {reseller.business_status.message}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            }
            onClick={handleWhatsApp}
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<PhoneIcon className="w-5 h-5" />}
            onClick={handleCall}
          >
            {t('resellers.call')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}