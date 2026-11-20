import type { Document } from '@/types/document'

// URL de l'API (valeur inchangée, centralisée ici pour les composants Documents)
export const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Récupère la liste des documents. Le backend (Render) peut être en veille :
 * le premier appel échoue ou traîne, donc on réessaie quelques fois.
 */
export async function fetchDocuments(retries = 2, delayMs = 2500): Promise<Document[]> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/documents`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return (await response.json()) as Document[]
    } catch (error) {
      lastError = error
      if (attempt < retries) await sleep(delayMs)
    }
  }
  throw lastError
}

/** Compteurs de vues / téléchargements (échec silencieux). */
export function trackDocumentEvent(id: string, kind: 'view' | 'download'): void {
  fetch(`${API_URL}/documents/${id}/${kind}`, { method: 'POST' }).catch(() => {})
}

/**
 * Récupère le PDF via fetch (et non par un lien direct). Cela permet un vrai
 * téléchargement : l'attribut `download` est ignoré par les navigateurs quand le
 * fichier est sur un autre domaine (Supabase), alors qu'il fonctionne avec un blob local.
 */
export async function fetchPdfBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const blob = await response.blob()
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
}

/**
 * Le PDF est-il dans un cache du navigateur (donc lisible hors ligne) ?
 * Le service worker met en cache les PDF ouverts ou préchargés (cache « vito-pdf-… »).
 */
export async function isPdfCached(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false
  try {
    return Boolean(await caches.match(url))
  } catch {
    return false
  }
}

interface NetworkInformationLike {
  saveData?: boolean
  type?: string
  effectiveType?: string
}

/**
 * Précharger des PDF sans consommer le forfait mobile : uniquement si le service worker
 * contrôle la page (sinon rien ne serait mis en cache), hors mode « économie de données »
 * et sur Wi-Fi / Ethernet (ou connexion 4G quand le navigateur ne distingue pas le type
 * de réseau, par exemple sur ordinateur).
 */
export function canPrefetch(): boolean {
  if (typeof navigator === 'undefined' || !navigator.onLine) return false
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (!connection || connection.saveData) return false
  if (connection.type) return connection.type === 'wifi' || connection.type === 'ethernet'
  return connection.effectiveType === '4g'
}

export async function downloadPdf(doc: Pick<Document, 'id' | 'title' | 'file_url'>): Promise<void> {
  trackDocumentEvent(doc.id, 'download')
  try {
    const blob = await fetchPdfBlob(doc.file_url)
    const objectUrl = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = objectUrl
    link.download = `${doc.title.replace(/[\\/:*?"<>|]/g, '-')}.pdf`
    window.document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch {
    // Hors ligne et non mis en cache, ou serveur indisponible : on laisse le navigateur essayer
    window.open(doc.file_url, '_blank', 'noopener,noreferrer')
  }
}
