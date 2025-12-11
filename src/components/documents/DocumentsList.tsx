'use client'

import { useState } from 'react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { PDFViewer } from '@/components/documents/PDFViewer'
import type { Document } from '@/types/document'

const categories = [
  { id: 'pamf', label: 'PAMF', icon: '💳' },
  { id: 'security', label: 'Sécurité', icon: '🛡️' },
  { id: 'guides', label: 'Guides', icon: '📖' },
]

const documents: Document[] = [
  // PAMF
  {
    id: '1',
    title: 'Guide du prêt PAMF',
    description: 'Comment bénéficier du crédit gaz PAMF',
    category: 'pamf',
    url: '/documents/pamf/guide-pamf.pdf',
    size: '2.4 MB',
    pages: 12,
    offline: true,
  },
  {
    id: '2',
    title: 'Conditions et tarifs PAMF',
    description: 'Tableau des taux et conditions d\'éligibilité',
    category: 'pamf',
    url: '/documents/pamf/conditions-pret.pdf',
    size: '1.8 MB',
    pages: 8,
    offline: true,
  },
  {
    id: '3',
    title: 'Dossier d\'inscription PAMF',
    description: 'Formulaire et pièces à fournir',
    category: 'pamf',
    url: '/documents/pamf/dossier-inscription.pdf',
    size: '950 KB',
    pages: 5,
    offline: true,
  },
  
  // Sécurité
  {
    id: '4',
    title: 'Consignes de sécurité',
    description: 'Règles d\'utilisation et de stockage du gaz',
    category: 'security',
    url: '/documents/security/consignes-securite.pdf',
    size: '1.2 MB',
    pages: 6,
    offline: true,
  },
  {
    id: '5',
    title: 'Détection de fuite',
    description: 'Comment détecter et réagir en cas de fuite',
    category: 'security',
    url: '/documents/security/detection-fuite.pdf',
    size: '850 KB',
    pages: 4,
    offline: true,
  },
  {
    id: '6',
    title: 'Maintenance des équipements',
    description: 'Entretien des bouteilles et détendeurs',
    category: 'security',
    url: '/documents/security/maintenance.pdf',
    size: '1.5 MB',
    pages: 7,
    offline: true,
  },
  
  // Guides
  {
    id: '7',
    title: 'Installation d\'une bouteille',
    description: 'Guide pas à pas pour installer votre gaz',
    category: 'guides',
    url: '/documents/guides/installation.pdf',
    size: '2.1 MB',
    pages: 10,
    offline: false,
  },
  {
    id: '8',
    title: 'Économies d\'énergie',
    description: 'Conseils pour optimiser votre consommation',
    category: 'guides',
    url: '/documents/guides/economies.pdf',
    size: '1.3 MB',
    pages: 6,
    offline: false,
  },
]

export const DocumentsList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('pamf')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const filteredDocs = documents.filter(doc => doc.category === activeCategory)

  return (
    <div className="animate-slide-up">
      {/* Onglets de catégories */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full
              font-semibold text-sm sm:text-base whitespace-nowrap
              transition-all duration-300
              ${
                activeCategory === category.id
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border hover:border-primary hover:text-primary'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Liste des documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDocs.map((doc, index) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onClick={() => setSelectedDoc(doc)}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Message si vide */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">
            Aucun document disponible dans cette catégorie
          </p>
        </div>
      )}

      {/* Viewer PDF Modal */}
      {selectedDoc && (
        <PDFViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  )
}