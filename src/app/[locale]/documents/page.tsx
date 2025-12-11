'use client'

import { DocumentsList } from '@/components/documents/DocumentsList'
import { DocumentTextIcon } from '@heroicons/react/24/solid'

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg pt-14 sm:pt-16">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-3xl mb-4 sm:mb-6 shadow-xl">
            <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4 font-display">
            Documents & Ressources
          </h1>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Guides PAMF, consignes de sécurité et documentation disponibles hors ligne
          </p>
        </div>

        {/* Liste des documents */}
        <DocumentsList />
      </div>
    </div>
  )
}