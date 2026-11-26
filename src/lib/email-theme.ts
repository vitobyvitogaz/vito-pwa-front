/**
 * Couleurs des e-mails de contact. Les e-mails sont du HTML en ligne : ils ne lisent pas Tailwind.
 * Ces valeurs reprennent les tokens de `tailwind.config.ts` (primary, neutral-50/200/600).
 */
export const EMAIL_COLORS = {
  brand:   '#007B71', // primary
  surface: '#F8F8F8', // neutral-50
  border:  '#E3E3E3', // neutral-200
  muted:   '#656565', // neutral-600
} as const
