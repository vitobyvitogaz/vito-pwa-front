'use client'

import { useEffect, useRef, useState } from 'react'
import type { Document as DocumentType } from '@/types/document'
import { X, Download, FileText, ArrowSquareOut, CircleNotch as Loader2 } from '@phosphor-icons/react'
import { downloadPdf, fetchPdfBlob } from '@/lib/documents'

interface PDFViewerProps {
  document: DocumentType
  onClose: () => void
}

type ViewerStatus = 'loading' | 'ready' | 'error'

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export const PDFViewer: React.FC<PDFViewerProps> = ({ document: doc, onClose }) => {
  const [status, setStatus] = useState<ViewerStatus>('loading')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Chrome sur Android (et certains autres navigateurs mobiles) n'affiche pas les PDF dans une iframe
  const canInline = typeof navigator === 'undefined' ? true : navigator.pdfViewerEnabled !== false

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Chargement via fetch : le service worker met le PDF en cache, il se rouvre ensuite sans connexion
  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    fetchPdfBlob(doc.file_url)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc.file_url, attempt])

  // Fenêtre modale accessible : focus à l'ouverture et au retour, Échap pour fermer, Tab reste dans la fenêtre
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && window.document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && window.document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const retry = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  const formatFileSize = (size: number | string | null): string | null => {
    if (!size) return null
    if (typeof size === 'string') return size
    const mb = size / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const fileSize = formatFileSize(doc.file_size)
  const openLink = blobUrl ?? doc.file_url

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-viewer-title"
        className="relative w-full h-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] m-2 sm:m-4 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50 dark:from-dark-surface dark:to-neutral-900/50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icône — rounded-full */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="pdf-viewer-title"
                className="text-lg sm:text-2xl font-semibold text-neutral-900 dark:text-white truncate tracking-tight font-sans"
              >
                {doc.title}
              </h2>
              {(doc.page_count || fileSize) && (
                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-sans tabular-nums">
                  {doc.page_count ? <span>{doc.page_count} pages</span> : null}
                  {doc.page_count && fileSize ? (
                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                  ) : null}
                  {fileSize ? <span>{fileSize}</span> : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Bouton Download — rounded-full */}
            <button
              type="button"
              onClick={() => void downloadPdf(doc)}
              className="p-3 rounded-full border border-primary bg-primary text-white hover:bg-primary-600 transition-colors duration-200 active:scale-95"
              title="Télécharger"
              aria-label={`Télécharger ${doc.title}`}
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Bouton Fermer — rounded-full */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 active:scale-95"
              title="Fermer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-3 sm:p-6 flex flex-col gap-3">
          {status === 'loading' && (
            <div role="status" className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-neutral-600 dark:text-neutral-400 font-sans">
                Chargement du document...
              </span>
            </div>
          )}

          {status === 'error' && (
            <div role="alert" className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <p className="text-neutral-700 dark:text-neutral-300 font-sans max-w-md">
                Impossible de charger le document. Vérifiez votre connexion, puis réessayez.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={retry}
                  className="px-6 py-3 rounded-full bg-primary text-white font-medium text-sm font-sans hover:bg-primary-600 transition-colors duration-200 active:scale-95"
                >
                  Réessayer
                </button>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-sm font-sans hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                >
                  Ouvrir dans un nouvel onglet
                </a>
              </div>
            </div>
          )}

          {status === 'ready' && blobUrl && canInline && (
            <>
              <div className="w-full flex-1 min-h-0 rounded-2xl overflow-hidden shadow-md">
                <iframe src={blobUrl} className="w-full h-full bg-white" title={doc.title} />
              </div>
              <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 font-sans">
                Le PDF ne s&apos;affiche pas correctement ?{' '}
                <a
                  href={openLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
                >
                  Ouvrir dans un nouvel onglet
                </a>
              </p>
            </>
          )}

          {status === 'ready' && blobUrl && !canInline && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 font-sans max-w-md">
                Votre navigateur n&apos;affiche pas les PDF dans l&apos;application. Ouvrez le document avec le lecteur de votre téléphone.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={openLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium text-sm font-sans hover:bg-primary-600 transition-colors duration-200 active:scale-95"
                >
                  <ArrowSquareOut className="w-4 h-4" />
                  Ouvrir le PDF
                </a>
                <button
                  type="button"
                  onClick={() => void downloadPdf(doc)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-sm font-sans hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
