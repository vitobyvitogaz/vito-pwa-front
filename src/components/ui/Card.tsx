// src/components/ui/Card.tsx

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800',
        elevated: 'bg-white dark:bg-dark-surface shadow-sm',
        outlined: 'border border-primary bg-transparent',
        gradient: 'bg-gradient-to-br from-primary/10 to-primary/5',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:border-primary/50 hover:shadow-md',
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
}) => <div className={`mb-6 ${className || ''}`} {...props} />

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={`text-xl font-semibold text-neutral-900 dark:text-white tracking-tight ${
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
    className={`text-sm text-neutral-600 dark:text-neutral-400 ${className || ''}`}
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
}) => <div className={`mt-6 ${className || ''}`} {...props} />