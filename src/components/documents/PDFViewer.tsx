'use client'

import { useEffect } from 'react'
import type { Document as DocumentType } from '@/types/document'
import { X, Download, FileText } from 'lucide-react'

interface PDFViewerProps {
  document: DocumentType
  onClose: () => void
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ document: doc, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = doc.file_url
    link.download = `${doc.title}.pdf`
    link.click()
  }

  const formatFileSize = (size: number | string | null): string => {
    if (!size) return 'N/A'
    
    // Si c'est déjà un string formaté (ex: "1.8 MB")
    if (typeof size === 'string') return size
    
    // Si c'est un number en bytes
    const mb = size / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50 dark:from-dark-surface dark:to-neutral-900/50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white truncate tracking-tight font-sans">
                {doc.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-sans">
                <span>{doc.page_count || 'N/A'} pages</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                <span>{formatFileSize(doc.file_size)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-3 rounded-xl border border-primary bg-primary text-white hover:bg-primary-600 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Télécharger"
            >
              <Download className="w-5 h-5" strokeWidth={2} />
            </button>
            
            <button
              onClick={onClose}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Fermer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={doc.file_url}
              className="w-full h-full bg-white"
              title={doc.title}
            />
          </div>
        </div>
      </div>
    </div>
  )
}