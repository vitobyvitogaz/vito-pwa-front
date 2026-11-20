const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Neutralise le HTML d'une valeur saisie par un visiteur avant de l'insérer dans un e-mail. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c])
}

/** Valeur sur une seule ligne (objet de l'e-mail) : supprime sauts de ligne et caractères de contrôle. */
export function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').trim()
}

export const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
