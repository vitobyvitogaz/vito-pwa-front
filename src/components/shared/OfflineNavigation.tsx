'use client'

import { useEffect } from 'react'

/**
 * Navigation hors ligne.
 *
 * Quand la connexion tombe alors qu'une page est ouverte, un clic sur un lien <Link> de
 * Next.js ne fait rien : le routeur essaie de récupérer la page en arrière-plan, échoue et
 * reste sur place. On force alors une navigation classique du navigateur : le service
 * worker sert la page déjà visitée depuis le cache (ou la page de secours).
 *
 * Sans effet tant que le navigateur est en ligne.
 */
export const OfflineNavigation: React.FC = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (navigator.onLine) return
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return

      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Lien d'ancre sur la même page : le comportement normal convient
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      event.preventDefault()
      event.stopPropagation()
      window.location.assign(url.href)
    }

    // Phase de capture : passe avant le gestionnaire de clic de <Link>
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
