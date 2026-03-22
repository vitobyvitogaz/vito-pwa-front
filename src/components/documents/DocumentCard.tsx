'use client'

import { useState } from 'react'
import type { Document } from '@/types/document'
import { Download, Eye, FileText, Cloud, Play } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface DocumentCardProps {
  document: Document
  onClick: () => void
  delay?: number
}

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

// Icône YouTube SVG
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  const isVideo = document.category === 'video'
  const videoUrl = document.video_url || document.file_url

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('medium')
    // Incrémenter le compteur de téléchargements
    fetch(`${API_URL}/documents/${document.id}/download`, { method: 'POST' }).catch(() => {})
    const link = window.document.createElement('a')
    link.href = document.file_url
    link.download = `${document.title}.pdf`
    link.click()
  }

  const handleView = () => {
    hapticFeedback('light')
    if (isVideo && videoUrl) {
      // Incrémenter le compteur de vues
      fetch(`${API_URL}/documents/${document.id}/view`, { method: 'POST' }).catch(() => {})
      window.open(videoUrl, '_blank')
    } else {
      onClick()
    }
  }

  const formatFileSize = (size: number | string | null): string => {
    if (!size) return 'N/A'
    if (typeof size === 'string') return size
    const mb = size / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-6 cursor-pointer transition-all duration-300 border border-neutral-100 dark:border-neutral-800 hover:border-primary/30 animate-slide-up"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: isHovered
          ? '0 20px 40px -20px rgba(0, 139, 127, 0.15), 0 0 0 1px rgba(0, 139, 127, 0.05)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/2 transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          {/* Icône — rounded-full */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${
            isVideo
              ? 'bg-red-50 dark:bg-red-950/30'
              : 'bg-gradient-to-br from-primary/10 to-primary/5'
          }`}>
            {isVideo
              ? <YoutubeIcon className="w-6 h-6 text-red-600" />
              : <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
            }
          </div>

          {!isVideo && document.is_offline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-medium font-sans">
              <Cloud className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Disponible hors ligne</span>
            </div>
          )}

          {isVideo && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium font-sans">
              <Play className="w-3 h-3 fill-current" />
              <span>Vidéo</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2.5 line-clamp-2 leading-snug tracking-tight group-hover:text-primary transition-colors duration-300 font-sans">
          {document.title}
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 line-clamp-2 leading-relaxed font-sans">
          {document.description || 'Aucune description disponible'}
        </p>

        {/* Métadonnées — masquées pour les vidéos */}
        {!isVideo && (
          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-500 mb-6 font-medium font-sans">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
              {document.page_count || 'N/A'} pages
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
              {formatFileSize(document.file_size)}
            </span>
          </div>
        )}

        {isVideo && <div className="mb-6" />}

        <div className="flex gap-3">
          {/* Bouton Consulter/Regarder — rounded-full */}
          <button
            onClick={handleView}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-full font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 font-sans text-white ${
              isVideo
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700'
            }`}
          >
            {isVideo
              ? <><Play className="w-4 h-4 fill-white" /><span>Regarder</span></>
              : <><Eye className="w-4 h-4" strokeWidth={2} /><span>Consulter</span></>
            }
          </button>

          {/* Bouton télécharger — rounded-full */}
          {!isVideo && (
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
            >
              <Download className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}