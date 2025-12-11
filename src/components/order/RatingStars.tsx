'use client'

import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  reviewCount?: number
  className?: string
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  reviewCount,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Étoiles pleines */}
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon 
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`}
        />
      ))}
      
      {/* Demi-étoile */}
      {hasHalfStar && (
        <div className="relative">
          <StarOutlineIcon className={`${sizeClasses[size]} text-yellow-500`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <StarIcon className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} />
          </div>
        </div>
      )}
      
      {/* Étoiles vides */}
      {[...Array(emptyStars)].map((_, i) => (
        <StarOutlineIcon 
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-neutral-300 dark:text-neutral-600`}
        />
      ))}
      
      {/* Affichage numérique */}
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-neutral-500 dark:text-neutral-400 ml-1">
              ({reviewCount})
            </span>
          )}
        </span>
      )}
    </div>
  )
}