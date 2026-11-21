/** Sérialise des données structurées pour une balise <script> : « < » échappé, aucune injection possible. */
export const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
