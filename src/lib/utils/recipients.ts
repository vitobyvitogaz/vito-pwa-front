import { EMAIL_PATTERN } from '@/lib/utils/escapeHtml'

/**
 * Liste de destinataires à partir d'une variable d'environnement : adresses séparées par une virgule,
 * un point-virgule ou un espace. Les valeurs invalides sont ignorées ; si rien n'est valide,
 * on retombe sur la liste de secours.
 */
export function parseRecipients(raw: string | undefined, fallback: string[]): string[] {
  const list = (raw ?? '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const valid = list.filter((addr) => EMAIL_PATTERN.test(addr))
  if (valid.length !== list.length) {
    console.warn('CONTACT_TO_EMAIL : adresse(s) invalide(s) ignorée(s)')
  }
  return valid.length > 0 ? valid : fallback
}
