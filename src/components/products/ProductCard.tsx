'use client'

import { useState } from 'react'
import { Package, Star, Tag } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface Product {
  id: string
  product_code: string
  name: string
  description: string | null
  category: string | null
  price: number | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  order_position: number
}

interface ProductCardProps {
  product: Product
  delay?: number
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    hapticFeedback('light')
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl transition-all duration-300 animate-slide-up group bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 cursor-pointer"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: isHovered 
          ? '0 20px 40px -20px rgba(0, 139, 127, 0.15), 0 0 0 1px rgba(0, 139, 127, 0.05)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-white">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-neutral-300 dark:text-neutral-600" strokeWidth={1} />
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 rounded-xl blur-md" />
              <div className="relative bg-amber-500 text-white rounded-xl px-3 py-2 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white" strokeWidth={1.5} />
                <span className="text-sm font-bold">Vedette</span>
              </div>
            </div>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm text-neutral-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
              {product.category}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          {/* Product code */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-mono font-semibold text-primary">
              {product.product_code}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 font-sans">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 font-sans">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        {product.price && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Prix indicatif
              </span>
              <div className="text-2xl font-bold text-primary font-sans">
                {product.price.toLocaleString()} Ar
              </div>
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-4">
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 group/btn">
            <Package className="w-5 h-5 text-primary group-hover/btn:scale-110 transition-transform" strokeWidth={1.5} />
            <span className="font-medium text-primary font-sans">
              Voir revendeurs
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}