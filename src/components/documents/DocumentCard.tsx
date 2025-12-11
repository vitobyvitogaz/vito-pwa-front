'use client'

import { useState } from 'react'
import type { Document } from '@/types/document'
import { ArrowDownTrayIcon, EyeIcon, DocumentTextIcon, CloudArrowDownIcon } from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'

interface DocumentCardProps {
  document: Document
  onClick: () => void
  delay?: number
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('medium')
    
    // Télécharger le PDF
    const link = window.document.createElement('a')
    link.href = document.url
    link.download = `${document.title}.pdf`
    link.click()
  }

  const handleView = () => {
    hapticFeedback('light')
    onClick()
  }

  return (
    <div
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-500 border border-neutral-200 dark:border-dark-border hover:border-transparent animate-slide-up"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: isHovered
          ? '0 20px 50px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,139,127,0.1)'
          : '0 4px 15px -2px rgba(0,0,0,0.08)',
      }}
    >
      {/* Gradient au hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 transition-all duration-700"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Icône + Badge offline */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <DocumentTextIcon className="w-7 h-7 text-primary" />
          </div>
          
          {document.offline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
              <CloudArrowDownIcon className="w-3.5 h-3.5" />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Titre et description */}
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {document.title}
        </h3>
        
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
          {document.description}
        </p>

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          <span>{document.pages} pages</span>
          <span>{document.size}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition-colors duration-200"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Voir</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}