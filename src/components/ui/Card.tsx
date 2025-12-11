// src/components/ui/Card.tsx

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border',
        elevated: 'bg-white dark:bg-dark-surface shadow-lg hover:shadow-xl',
        outlined: 'border-2 border-primary bg-transparent',
        gradient: 'bg-gradient-to-br from-primary to-primary-600 text-white',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cardVariants({ variant, padding, interactive, className })}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={`mb-4 ${className || ''}`} {...props} />

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={`text-xl font-semibold text-light-text-primary dark:text-dark-text-primary ${
      className || ''
    }`}
    {...props}
  />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={`text-sm text-light-text-secondary dark:text-dark-text-secondary ${
      className || ''
    }`}
    {...props}
  />
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={className} {...props} />

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={`mt-4 ${className || ''}`} {...props} />