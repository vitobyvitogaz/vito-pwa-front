'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Filter, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1';
const ITEMS_PER_PAGE = 12;

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

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/products`)

      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }

      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      console.error('Erreur fetch produits:', err)
      setError('Impossible de charger les produits')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))]

  const filteredProducts = products.filter(product => {
    if (!product.is_active) return false
    if (selectedCategory === 'all') return true
    return product.category === selectedCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return a.order_position - b.order_position
  })

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center">
          <Package className="w-10 h-10 text-red-500" strokeWidth={1} />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
          {error}
        </h3>
        <button
          onClick={fetchProducts}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white font-sans mb-2">
            {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''} disponible{sortedProducts.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">
            Explorez notre gamme complète
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category || 'all')
              setCurrentPage(1)
            }}
            className={`
              relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
              after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
              after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
              hover:after:w-full font-sans
              ${
                selectedCategory === category
                  ? 'text-primary after:w-full'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }
            `}
          >
            {category === 'all' ? 'Tous les produits' : category}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 font-sans ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
            <Package className="w-10 h-10 text-neutral-400" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
            Aucun produit dans cette catégorie
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-sans">
            Consultez nos autres catégories
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200 font-sans"
          >
            Voir tous les produits
          </button>
        </div>
      )}
    </div>
  )
}