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
 * Aujourd'hui aucun service worker ne met les PDF en cache : la réponse est « non ».
 */
export async function isPdfCached(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false
  try {
    return Boolean(await caches.match(url))
  } catch {
    return false
  }
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
