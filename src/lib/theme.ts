/**
 * Thème clair / sombre — constantes partagées entre le layout (serveur) et le hook client.
 *
 * Règle : mode CLAIR par défaut (lisibilité en plein soleil). Le mode sombre n'est actif que
 * si le visiteur l'a choisi dans Paramètres ; son choix est conservé dans `localStorage`.
 */
export const THEME_STORAGE_KEY = 'theme'

export type Theme = 'light' | 'dark'

/**
 * Script exécuté dans le <head>, avant le premier affichage : applique la classe `dark`
 * pour que le choix du visiteur soit respecté dès le chargement, sans flash de la mauvaise couleur.
 * Aucun accès au stockage (navigation privée, stockage bloqué) ne doit faire échouer la page.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`
