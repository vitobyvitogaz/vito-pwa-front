'use client'

import { useEffect } from 'react'
import type { Document as DocumentType } from '@/types/document'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid'

interface PDFViewerProps {
  document: DocumentType
  onClose: () => void
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ document: doc, onClose }) => {  // Renommé "document" en "doc"
  useEffect(() => {
    // Maintenant "document" fait référence au DOM
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = doc.url
    link.download = `${doc.title}.pdf`
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full h-full max-w-6xl max-h-screen m-4 bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white truncate">
              {doc.title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {doc.pages} pages • {doc.size}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 sm:p-3 rounded-full bg-primary text-white hover:bg-primary-600 transition-colors duration-200"
              title="Télécharger"
            >
              <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 sm:p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
              title="Fermer"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-900 p-4">
          <iframe
            src={doc.url}
            className="w-full h-full rounded-lg bg-white"
            title={doc.title}
          />
        </div>
      </div>
    </div>
  )
}