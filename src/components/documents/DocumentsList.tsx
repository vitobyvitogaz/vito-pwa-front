'use client'

import { useState, useEffect } from 'react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { PDFViewer } from '@/components/documents/PDFViewer'
import { FileText, Loader2 } from 'lucide-react'
import type { Document } from '@/types/document'

const categories = [
  { id: 'pamf', label: 'PAMF' },
  { id: 'security', label: 'Sécurité' },
  { id: 'guides', label: 'Guides' },
  { id: 'video', label: 'Vidéos' },
]

// ✅ TEMPORAIRE : URL hardcodée pour débug
const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

export const DocumentsList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('pamf')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/documents`)

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des documents')
        }

        const data = await response.json()
        setDocuments(data)
        setError(null)
      } catch (err) {
        console.error('Erreur fetch documents:', err)
        setError('Impossible de charger les documents')
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocs = documents.filter(
    (doc) => doc.category === activeCategory && doc.is_active
  )

  // Masquer l'onglet Vidéos s'il n'y a aucun document vidéo
  const hasVideos = documents.some((doc) => doc.category === 'video' && doc.is_active)
  const visibleCategories = categories.filter(
    (cat) => cat.id !== 'video' || hasVideos
  )

  return (
    <div className="animate-slide-up">
      <div className="flex gap-2 mb-8 sm:mb-12 pb-2 justify-center flex-wrap">
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
              after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
              after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
              hover:after:w-full font-sans
              ${
                activeCategory === category.id
                  ? 'text-primary after:w-full'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">
            Chargement des documents...
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-500" strokeWidth={1} />
          </div>
          <p className="text-red-500 dark:text-red-400 text-lg font-sans">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredDocs.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => setSelectedDoc(doc)}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredDocs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
            <FileText className="w-8 h-8 text-neutral-400" strokeWidth={1} />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg font-sans">
            Aucun document disponible dans cette catégorie
          </p>
        </div>
      )}

      {/* PDFViewer uniquement pour les documents non-vidéo */}
      {selectedDoc && selectedDoc.category !== 'video' && (
        <PDFViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  )
}