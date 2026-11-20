'use client'

import type { Document } from '@/types/document'
import { Download, Eye, FileText, Cloud, Play, YoutubeLogo } from '@phosphor-icons/react'
import { hapticFeedback } from '@/lib/utils/haptic'
import { downloadPdf, trackDocumentEvent } from '@/lib/documents'

interface DocumentCardProps {
  document: Document
  onClick: () => void
  /** Le PDF est dans le cache du navigateur : il se lit sans connexion. */
  isCached?: boolean
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick, isCached = false }) => {
  const isVideo = document.category === 'video'
  const videoUrl = document.video_url || document.file_url

  const handleDownload = (e: React.MouseEvent) => {
    // Le bouton est dans la carte cliquable : on empêche le clic de remonter
    e.stopPropagation()
    hapticFeedback('medium')
    void downloadPdf(document)
  }

  // Unique point d'entrée : le clic sur la carte (le bouton « Consulter / Regarder »
  // n'a pas de gestionnaire propre, son clic remonte jusqu'ici).
  const handleView = () => {
    hapticFeedback('light')
    if (isVideo && videoUrl) {
      trackDocumentEvent(document.id, 'view')
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    } else {
      onClick()
    }
  }

  const formatFileSize = (size: number | string | null): string | null => {
    if (!size) return null
    if (typeof size === 'string') return size
    const mb = size / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const fileSize = formatFileSize(document.file_size)
  const hasMeta = !isVideo && Boolean(document.page_count || fileSize)

  return (
    <div
      onClick={handleView}
      className="group relative flex flex-col h-full overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-6 cursor-pointer border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-5">
        {/* Icône — rounded-full */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isVideo
            ? 'bg-accent-50 dark:bg-accent-900/30'
            : 'bg-primary-50 dark:bg-primary-900/30'
        }`}>
          {isVideo
            ? <YoutubeLogo className="w-6 h-6 text-accent" />
            : <FileText className="w-6 h-6 text-primary" />
          }
        </div>

        {/* Badge affiché seulement si le PDF est réellement disponible sans connexion */}
        {!isVideo && isCached && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-medium font-sans">
            <Cloud className="w-3.5 h-3.5" />
            <span>Disponible hors ligne</span>
          </div>
        )}

        {isVideo && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/30 border border-accent-100 dark:border-accent-800 text-accent-600 dark:text-accent-300 text-xs font-medium font-sans">
            <Play className="w-3 h-3 fill-current" />
            <span>Vidéo</span>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2.5 line-clamp-2 min-h-[2.75em] leading-snug tracking-tight group-hover:text-primary-600 transition-colors duration-200 font-sans">
        {document.title}
      </h3>

      {/* Toujours rendue : 2 lignes sont réservées même sans description, pour que toutes les cartes aient la même hauteur */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 line-clamp-2 min-h-[3.25em] leading-relaxed font-sans">
        {document.description}
      </p>

      {/* Métadonnées — seulement si elles existent (jamais « N/A ») */}
      <div className="flex items-center justify-between h-7 text-sm text-neutral-500 dark:text-neutral-400 mb-6 font-medium font-sans tabular-nums">
        {hasMeta && (
          <>
            {document.page_count ? <span>{document.page_count} pages</span> : <span />}
            {fileSize && (
              <span className="px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                {fileSize}
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        {/* Bouton Consulter/Regarder — rounded-full. Pas de onClick : le clic remonte à la carte. */}
        <button
          type="button"
          aria-label={isVideo ? `Regarder la vidéo ${document.title}` : `Consulter ${document.title}`}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-full font-medium text-sm transition-colors duration-200 active:scale-95 font-sans text-white ${
            isVideo
              ? 'bg-accent hover:bg-accent-600'
              : 'bg-primary hover:bg-primary-600'
          }`}
        >
          {isVideo
            ? <><Play className="w-4 h-4 fill-white" /><span>Regarder</span></>
            : <><Eye className="w-4 h-4" /><span>Consulter</span></>
          }
        </button>

        {/* Bouton télécharger — rounded-full */}
        {!isVideo && (
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Télécharger ${document.title}`}
            title="Télécharger"
            className="flex items-center justify-center w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-primary/50 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
