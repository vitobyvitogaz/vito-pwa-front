'use client'

import { Star } from '@phosphor-icons/react'

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
      {[...Array(fullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-amber-500 fill-amber-500`}
          strokeWidth={1.5}
        />
      ))}
      
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${sizeClasses[size]} text-amber-500`} strokeWidth={1.5} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeClasses[size]} text-amber-500 fill-amber-500`} strokeWidth={1.5} />
          </div>
        </div>
      )}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-neutral-300 dark:text-neutral-600`}
          strokeWidth={1.5}
        />
      ))}
      
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
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