'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

// La source de vérité est la classe `dark` de <html> (posée avant le rendu par THEME_INIT_SCRIPT).
// On l'observe plutôt que de la recopier dans un état : l'interrupteur ne peut donc jamais
// afficher autre chose que ce que l'écran montre.
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const getSnapshot = (): boolean => document.documentElement.classList.contains('dark')

// Côté serveur : clair par défaut.
const getServerSnapshot = (): boolean => false

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Stockage indisponible : le thème s'applique pour la page en cours seulement.
    }
  }, [])

  const toggle = useCallback(() => setTheme(isDark ? 'light' : 'dark'), [isDark, setTheme])

  return { isDark, setTheme, toggle }
}
