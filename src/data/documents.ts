// src/data/documents.ts
import type { Document } from '@/types/document'

export const categories = [
  { id: 'pamf', label: 'PAMF', icon: '💳' },
  { id: 'security', label: 'Sécurité', icon: '🛡️' },
  { id: 'guides', label: 'Guides', icon: '📖' },
]

export const documents: Document[] = [
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