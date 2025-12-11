'use client'

import { Button } from '@/components/ui/Button'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface GeolocationButtonProps {
  onClick: () => void
  loading: boolean
  hasLocation: boolean
}

export const GeolocationButton: React.FC<GeolocationButtonProps> = ({
  onClick,
  loading,
  hasLocation,
}) => {
  return (
    <Button
      variant={hasLocation ? 'primary' : 'outline'}
      size="md"
      onClick={onClick}
      isLoading={loading}
      leftIcon={<MapPinIcon className="w-5 h-5" />}
    >
      Ma position
    </Button>
  )
}