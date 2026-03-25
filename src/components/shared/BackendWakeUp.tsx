'use client'

import { useEffect } from 'react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

// ── Ping silencieux vers le backend au montage de l'app ──
// Render.com se met en veille après ~15min d'inactivité.
// Ce composant envoie une requête légère dès l'ouverture,
// avant que l'utilisateur arrive sur une page de contenu.
// Résultat : cold start réduit de 3-5s à <1s sur les pages suivantes.

export const BackendWakeUp: React.FC = () => {
  useEffect(() => {
    const ping = async () => {
      try {
        // Endpoint le plus léger disponible — on ignore la réponse
        await fetch(`${API_URL}/promotions`, {
          method: 'GET',
          // Signal d'abandon après 30s pour ne pas bloquer indéfiniment
          signal: AbortSignal.timeout(30000),
        })
      } catch {
        // Silencieux — erreur ignorée, c'est juste un wake-up
      }
    }

    // Délai de 500ms : laisse le rendu initial se terminer d'abord
    const timer = setTimeout(ping, 500)
    return () => clearTimeout(timer)
  }, [])

  // Aucun rendu — composant invisible
  return null
}