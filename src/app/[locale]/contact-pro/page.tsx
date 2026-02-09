'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Building2, Mail, Phone, MapPin, MessageSquare, User, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type RequestType = 'revendeur' | 'client_pro'

interface FormData {
  type: RequestType
  fullName: string
  company: string
  phone: string
  email: string
  city: string
  message: string
}

export default function ContactProPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    type: 'revendeur',
    fullName: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom est requis'
    if (!formData.company.trim()) newErrors.company = 'Le nom de l\'entreprise est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/professional`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur lors de l\'envoi')

      setSubmitStatus('success')
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setFormData({
          type: 'revendeur',
          fullName: '',
          company: '',
          phone: '',
          email: '',
          city: '',
          message: ''
        })
        setSubmitStatus('idle')
      }, 3000)

    } catch (error) {
      console.error('Erreur soumission:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }*/

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return

  setIsSubmitting(true)
  setSubmitStatus('idle')

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/contact/professional`
    console.log('🔍 URL complète:', apiUrl)
    console.log('📤 Données:', formData)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    console.log('📥 Status:', response.status)
    console.log('📥 OK:', response.ok)

    // ✅ AJOUT : Lire la réponse même en cas d'erreur
    const responseData = await response.json()
    console.log('📥 Réponse serveur:', responseData)

    if (!response.ok) {
      console.error('❌ Erreur serveur:', responseData)
      throw new Error(responseData.message || 'Erreur lors de l\'envoi')
    }

    setSubmitStatus('success')
    
    setTimeout(() => {
      setFormData({
        type: 'revendeur',
        fullName: '',
        company: '',
        phone: '',
        email: '',
        city: '',
        message: ''
      })
      setSubmitStatus('idle')
    }, 3000)

  } catch (error) {
    console.error('❌ Erreur complète:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                Devenir partenaire
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Rejoignez le réseau Vitogaz Madagascar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
          
          {/* Type de demande */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Type de demande
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'revendeur')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.type === 'revendeur'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <Briefcase className={`w-5 h-5 mx-auto mb-2 ${formData.type === 'revendeur' ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}`} strokeWidth={1.5} />
                <span className={`text-sm font-medium ${formData.type === 'revendeur' ? 'text-primary' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  Revendeur
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => handleChange('type', 'client_pro')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.type === 'client_pro'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <Building2 className={`w-5 h-5 mx-auto mb-2 ${formData.type === 'client_pro' ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}`} strokeWidth={1.5} />
                <span className={`text-sm font-medium ${formData.type === 'client_pro' ? 'text-primary' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  Client professionnel
                </span>
              </button>
            </div>
          </div>

          {/* Grille de champs */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.fullName 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  placeholder="Votre nom"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Entreprise / Commerce *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.company 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              {errors.company && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.company}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Téléphone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.phone 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  placeholder="034 00 000 00"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  placeholder="email@exemple.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Ville */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Ville *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.city 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-neutral-200 dark:border-neutral-700'
                } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="Antananarivo, Antsirabe, Toamasina..."
              />
            </div>
            {errors.city && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.city}</p>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Message (optionnel)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Parlez-nous de votre projet..."
              />
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 animate-slide-up">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Demande envoyée avec succès !
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Notre équipe vous recontactera sous 48h
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Erreur d'envoi
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                  Veuillez réessayer ou nous contacter directement
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || submitStatus === 'success'}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                <span>Envoi en cours...</span>
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                <span>Demande envoyée</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" strokeWidth={1.5} />
                <span>Envoyer ma demande</span>
              </>
            )}
          </button>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
            * Champs obligatoires
          </p>
        </form>

        {/* Info supplémentaire */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Bon à savoir :</strong> Nous recherchons activement des partenaires dans toutes les régions de Madagascar pour développer notre réseau.
          </p>
        </div>
      </div>
    </div>
  )
}