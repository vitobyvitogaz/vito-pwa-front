'use client'

import { useEffect, useState } from 'react'

/**
 * Vrai si l'écran atteint le point de rupture `lg` de Tailwind (1024 px).
 * `null` avant le premier rendu côté navigateur : on ne sait pas encore quelle mise en page est visible.
 * Sert à ne monter que la carte visible (les deux mises en page sont dans le DOM, l'une masquée par CSS).
 */
export function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isDesktop
}
