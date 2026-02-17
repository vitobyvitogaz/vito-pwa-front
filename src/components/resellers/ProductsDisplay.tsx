'use client'

import { useState } from 'react'
import { Package, ChevronDown, ChevronUp, Flame, Wrench } from 'lucide-react'
import type { Reseller } from '@/types/reseller'
import Image from 'next/image'

interface ProductsDisplayProps {
  reseller: Reseller
}

export const ProductsDisplay: React.FC<ProductsDisplayProps> = ({ reseller }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!reseller.reseller_products || reseller.reseller_products.length === 0) {
    return null
  }

  const products = reseller.reseller_products

  // Grouper par catégorie
  const productsByCategory = products.reduce((acc, rp) => {
    const category = rp.products.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(rp.products)
    return acc
  }, {} as Record<string, typeof products[0]['products'][]>)

  const categories = Object.keys(productsByCategory)
  const displayCategories = isExpanded ? categories : categories.slice(0, 2)

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('gaz') || category.toLowerCase().includes('bouteille')) {
      return Flame
    }
    return Wrench
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Prix sur demande'
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(price).replace('MGA', 'Ar')
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <h4 className="font-semibold text-neutral-900 dark:text-white">Produits disponibles</h4>
        </div>
        
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
          {products.length} article{products.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Products by Category */}
      <div className="space-y-4">
        {displayCategories.map(category => {
          const CategoryIcon = getCategoryIcon(category)
          const categoryProducts = productsByCategory[category]

          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-2.5">
                <CategoryIcon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
                <h5 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                  {category}
                </h5>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {categoryProducts.map(product => (
                  <div
                    key={product.id}
                    className="group relative bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-sm transition-all duration-300"
                  >
                    {/* Product Image */}
                    {product.image_url && (
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-2"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div>
                      <h6 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-1">
                        {product.name}
                      </h6>
                      
                      {/* Product Code Badge */}
                      {product.product_code && (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 mb-1.5">
                          {product.product_code}
                        </span>
                      )}

                      {/* Price */}
                      <p className="text-sm font-bold text-primary">
                        {formatPrice(product.price)}
                      </p>

                      {/* Description */}
                      {product.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          ⭐ Populaire
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Expand/Collapse Button */}
      {categories.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {isExpanded ? (
            <>
              <span>Voir moins</span>
              <ChevronUp className="w-4 h-4" strokeWidth={2} />
            </>
          ) : (
            <>
              <span>Voir tous les produits ({products.length})</span>
              <ChevronDown className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </button>
      )}
    </div>
  )
}