// src/components/ui/Input.tsx

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-white dark:bg-dark-surface
              px-4 py-2.5 text-base
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-error focus:ring-error'
                  : 'border-light-border dark:border-dark-border focus:ring-primary'
              }
              text-light-text-primary dark:text-dark-text-primary
              placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${className || ''}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'