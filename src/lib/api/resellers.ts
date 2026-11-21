// Adresse de la liste des revendeurs actifs, partagée par le store (requête) et la page carte (préchargement).
// Les deux doivent rester identiques pour que le navigateur réutilise la réponse préchargée.
export const RESELLERS_ACTIVE_URL = 'https://vito-backend-supabase.onrender.com/api/v1/resellers/active'
