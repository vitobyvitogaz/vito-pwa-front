'use client'

import { useState } from 'react'
import { Package, ChevronRight, ShoppingCart } from 'lucide-react'
import type { Reseller } from '@/types/reseller'
import Image from 'next/image'

interface ProductsDisplayCompactProps {
  reseller: Reseller
}

export const ProductsDisplayCompact: React.FC<ProductsDisplayCompactProps> = ({ reseller }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!reseller.reseller_products || reseller.reseller_products.length === 0) {
    return null
  }

  const allProducts = reseller.reseller_products
  const featuredProducts = allProducts.filter(rp => rp.products.is_featured)
  const displayProducts = isExpanded 
    ? allProducts 
    : (featuredProducts.length > 0 ? featuredProducts.slice(0, 3) : allProducts.slice(0, 3))
  
  const remainingCount = allProducts.length - displayProducts.length

  const formatPrice = (price: number | null) => {
    if (!price) return 'Sur demande'
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
    }).format(price) + ' Ar'
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-white dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {allProducts.length} produit{allProducts.length > 1 ? 's' : ''}
          </span>
        </div>
        
        {!isExpanded && remainingCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            +{remainingCount} autre{remainingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Products Compact Display */}
      {!isExpanded && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayProducts.map(rp => {
            const product = rp.products
            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-24 group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-1.5 border border-neutral-200 dark:border-neutral-700 group-hover:border-primary/50 transition-all">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  )}
                  {product.is_featured && (
                    <div className="absolute top-1 right-1">
                      <span className="inline-block w-4 h-4 text-xs">⭐</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-neutral-900 dark:text-white line-clamp-1 mb-0.5">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Products Expanded Display */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {allProducts.map(rp => {
            const product = rp.products
            return (
              <div
                key={product.id}
                className="group relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2 border border-neutral-200 dark:border-neutral-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-sm transition-all duration-300"
              >
                {product.image_url && (
                  <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden bg-white dark:bg-neutral-700">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                )}
                
                <div>
                  <h6 className="text-xs font-semibold text-neutral-900 dark:text-white mb-0.5 line-clamp-1">
                    {product.name}
                  </h6>
                  
                  {product.product_code && (
                    <span className="inline-block text-xs font-medium px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 mb-1">
                      {product.product_code}
                    </span>
                  )}
                  
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                  
                  {product.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>
                
                {product.is_featured && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="text-xs">⭐</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
      >
        <ShoppingCart className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
        <span>{isExpanded ? 'Voir moins' : `Voir tous les produits (${allProducts.length})`}</span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} strokeWidth={2} />
      </button>
    </div>
  )
}