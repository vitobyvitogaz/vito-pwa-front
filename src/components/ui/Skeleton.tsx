// src/components/ui/Skeleton.tsx

import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      style={style}
      {...props}
    />
  )
}

export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-light-border dark:border-dark-border">
    <Skeleton variant="circular" width={48} height={48} className="mb-4" />
    <Skeleton variant="text" className="mb-2" width="70%" />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="60%" className="mt-4" />
  </div>
)