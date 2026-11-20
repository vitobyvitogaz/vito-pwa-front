'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { PDFViewer } from '@/components/documents/PDFViewer'
import { FileText, CircleNotch as Loader2 } from '@phosphor-icons/react'
import type { Document } from '@/types/document'
import { fetchDocuments, isPdfCached } from '@/lib/documents'

const categories = [
  { id: 'video', label: 'Vidéos' },
  { id: 'security', label: 'Sécurité' },
  { id: 'guides', label: 'Guides' },
  { id: 'pamf', label: 'PAMF' },
]

const PANEL_ID = 'documents-panel'

export const DocumentsList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set())
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSlow(false)
    // Le serveur (Render) peut être en veille : au-delà de 4 s on prévient l'utilisateur
    const slowTimer = setTimeout(() => setSlow(true), 4000)
    try {
      setDocuments(await fetchDocuments())
    } catch (err) {
      console.error('Erreur fetch documents:', err)
      setError(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'Pas de connexion. Réessayez une fois en ligne.'
          : 'Impossible de charger les documents'
      )
      setDocuments([])
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Le badge « Disponible hors ligne » n'est affiché que pour les PDF réellement présents dans un
  // cache du navigateur. Aujourd'hui aucun service worker n'en met en cache : le badge reste masqué
  // plutôt que de promettre une lecture hors ligne qui ne fonctionnerait pas.
  useEffect(() => {
    if (documents.length === 0) return
    let cancelled = false

    const detectCached = async () => {
      const cached = new Set<string>()
      for (const doc of documents) {
        if (doc.category === 'video' || !doc.is_active || !doc.file_url) continue
        if (await isPdfCached(doc.file_url)) cached.add(doc.id)
      }
      if (!cancelled) setCachedIds(cached)
    }

    void detectCached()
    return () => {
      cancelled = true
    }
  }, [documents])

  // Masquer l'onglet Vidéos s'il n'y a aucun document vidéo
  const hasVideos = documents.some((doc) => doc.category === 'video' && doc.is_active)
  const visibleCategories = categories.filter(
    (cat) => cat.id !== 'video' || hasVideos
  )

  // Onglet actif : le choix de l'utilisateur s'il est encore visible, sinon le premier onglet visible
  const activeCategory =
    selectedCategory && visibleCategories.some((cat) => cat.id === selectedCategory)
      ? selectedCategory
      : visibleCategories[0]?.id

  const filteredDocs = documents.filter(
    (doc) => doc.category === activeCategory && doc.is_active
  )

  // Navigation clavier entre onglets (flèches, Début, Fin)
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = visibleCategories.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    const id = visibleCategories[next].id
    setSelectedCategory(id)
    tabRefs.current[id]?.focus()
  }

  return (
    <div className="animate-slide-up">
      {/* Onglets affichés après le chargement : l'onglet Vidéos n'existe qu'une fois les documents connus */}
      {!loading && !error && (
        <div
          role="tablist"
          aria-label="Catégories de documents"
          className="flex gap-2 mb-8 sm:mb-12 pb-2 justify-center flex-wrap"
        >
          {visibleCategories.map((category, index) => {
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                ref={(el) => {
                  tabRefs.current[category.id] = el
                }}
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={PANEL_ID}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setSelectedCategory(category.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`
                  relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
                  hover:after:w-full font-sans
                  ${
                    isActive
                      ? 'text-primary after:w-full'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }
                `}
              >
                {category.label}
              </button>
            )
          })}
        </div>
      )}

      {loading && (
        <div role="status" className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">
              Chargement des documents...
            </span>
          </div>
          {slow && (
            <p className="mt-3 max-w-sm text-sm text-neutral-500 dark:text-neutral-400 font-sans">
              Le serveur démarre, cela peut prendre quelques secondes. Merci de patienter.
            </p>
          )}
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-500" strokeWidth={1} />
          </div>
          <p className="text-red-500 dark:text-red-400 text-lg font-sans mb-6">{error}</p>
          <button
            type="button"
            onClick={() => void loadDocuments()}
            className="px-6 py-3 rounded-full bg-primary text-white font-medium text-sm font-sans hover:bg-primary-600 transition-colors duration-200 active:scale-95"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        <div
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={activeCategory ? `tab-${activeCategory}` : undefined}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredDocs.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={() => setSelectedDoc(doc)}
                delay={index * 0.05}
                isCached={cachedIds.has(doc.id)}
              />
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <FileText className="w-8 h-8 text-neutral-400" strokeWidth={1} />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-lg font-sans">
                Aucun document disponible dans cette catégorie
              </p>
            </div>
          )}
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
