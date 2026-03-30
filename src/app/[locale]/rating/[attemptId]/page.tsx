'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, CheckCircle, ArrowLeft } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

export default function RatingPage() {
  const params    = useParams()
  const router    = useRouter()
  const attemptId = params.attemptId as string
  const locale    = params.locale as string

  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating]   = useState<number>(0)
  const [submitted, setSubmitted]           = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const ratingLabels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent']
  const activeRating = hoveredRating || selectedRating

  const handleSubmit = async () => {
    if (!selectedRating || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/feedback/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ attempt_id: attemptId, rating: selectedRating }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'envoi')
      setSubmitted(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-3">
            Merci pour votre avis !
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 font-sans leading-relaxed">
            Votre retour nous aide à améliorer la qualité des livraisons de gaz à Madagascar.
          </p>
          {/* Étoiles de confirmation */}
          <div className="flex justify-center gap-2 mb-8">
            {[1,2,3,4,5].map(s => (
              <Star
                key={s}
                className={`w-8 h-8 ${s <= selectedRating ? 'text-amber-500 fill-amber-500' : 'text-neutral-200 dark:text-neutral-700'}`}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <button
            onClick={() => router.push(`/${locale}/commander`)}
            className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm hover:bg-primary/90 transition-colors active:scale-95"
          >
            Retour aux livraisons
          </button>
        </div>
      </div>
    )
  }

  // ── Formulaire de notation ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-25 dark:bg-dark-bg pt-14 sm:pt-16 pb-24">
      <div className="container mx-auto px-4 max-w-sm pt-8">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Retour
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Star className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white mb-2">
            Votre avis compte
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-sans text-sm leading-relaxed">
            Comment s'est passée votre expérience avec cette société de livraison ?
          </p>
        </div>

        {/* Card étoiles */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 shadow-md shadow-neutral-200/80 dark:shadow-neutral-900/60 mb-6">
          <div className="flex justify-center gap-3 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform duration-150 hover:scale-110 active:scale-95"
                aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-150 ${
                    star <= activeRating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          {/* Label de la note */}
          <div className="h-6 text-center">
            {activeRating > 0 && (
              <p className={`text-sm font-semibold font-display transition-all ${
                activeRating >= 4
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activeRating >= 3
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {ratingLabels[activeRating]}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-4 font-sans">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedRating || submitting}
          className="w-full py-3.5 bg-primary text-white rounded-full font-semibold font-sans text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
        </button>

        <button
          onClick={() => router.push(`/${locale}/commander`)}
          className="w-full mt-3 py-3 text-neutral-500 dark:text-neutral-400 text-sm font-sans hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          Passer
        </button>

      </div>
    </div>
  )
}