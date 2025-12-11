// src/types/promotion.ts
export interface Promotion {
  id: string
  title: string
  subtitle?: string
  description: string
  discount: number
  discountType: 'percentage' | 'fixed'
  validUntil: string
  image: string
  isActive: boolean
  category: string
  code?: string
  zones: string[]
  products: string[]
  conditions: string[]
  usageCount: number
  maxUsage: number
}

export interface PromotionDetail extends Promotion {
  detailedDescription?: string
  termsAndConditions?: string[]
  featuredProducts?: string[]
  howToUse?: string[]
}