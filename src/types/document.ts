export interface Document {
  id: string
  title: string
  description: string
  category: 'pamf' | 'security' | 'guides'
  url: string
  size: string
  pages: number
  offline: boolean
}