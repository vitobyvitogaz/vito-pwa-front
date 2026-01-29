'use client'

import { ProductsList } from '@/components/products/ProductsList'
import { Package } from 'lucide-react'

export default function ProduitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-lg">
            <Package className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight font-sans">
            Nos Produits
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide font-sans">
              Découvrez la gamme complète de produits Vitogaz
            </p>
            <div className="h-px w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent"></div>
          </div>
        </div>

        {/* Products list */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <ProductsList />
        </div>
      </div>
    </div>
  )
}