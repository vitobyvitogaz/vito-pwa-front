'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Mail, User, MessageSquare, Tag, ArrowLeft, Send, CheckCircle, Clock, Facebook, ChevronDown, ChevronUp } from 'lucide-react'

const SUBJECTS = [
  'Commande de gaz',
  'Problème de livraison',
  'Facturation',
  'Devenir revendeur',
  'Problème technique',
  'Autre',
]

const MAX_CHARS = 500

const isServiceOpen = () => {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hour * 60 + minutes
  return day >= 1 && day <= 5 && totalMinutes >= 480 && totalMinutes < 1020
}

export default function AssistancePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const open = isServiceOpen()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    subject: false,
    message: false,
  })

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Nom requis'
    if (!form.email.trim()) errors.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalide'
    if (!form.subject) errors.subject = 'Sujet requis'
    if (!form.message.trim()) errors.message = 'Message requis'
    else if (form.message.trim().length < 10) errors.message = 'Message trop court (min. 10 caractères)'
    return errors
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field: string, value: string) => {
    if (field === 'message' && value.length > MAX_CHARS) return
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, subject: true, message: true })
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('Erreur serveur')
      setIsSuccess(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
            Message envoyé !
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Notre équipe vous répondra dans les plus brefs délais, du lundi au vendredi de 8h à 17h.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all duration-300"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16">

      {/* Header teal */}
      <div style={{ backgroundColor: '#008B7F' }} className="px-4 py-8">
        <div className="container mx-auto max-w-2xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </button>

          <p className="text-3xl font-bold text-white tracking-tight mb-1">
            SERVICE CLIENTS
          </p>

          {/* Ligne décorative rouge */}
          <div style={{ width: 60, height: 3, backgroundColor: '#E53E3E', borderRadius: 2, marginBottom: 24 }} />

          {/* Coordonnées */}
          <div className="space-y-4">
            <a href="mailto:relationclient@vitogaz.mg" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-white font-medium group-hover:text-white/80 transition-colors">
                relationclient@vitogaz.mg
              </p>
            </a>

            <a href="https://www.linkedin.com/company/vitogazmadagascar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <p className="text-white font-medium group-hover:text-white/80 transition-colors">
                vitogazmadagascar
              </p>
            </a>

            <a href="https://www.facebook.com/vitogazmadagascar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Facebook className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-white font-medium group-hover:text-white/80 transition-colors">
                Vitogaz Madagascar
              </p>
            </a>

            <a href="tel:+261202236464" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-white font-medium group-hover:text-white/80 transition-colors">
                020 22 364 64
              </p>
            </a>
          </div>

          {/* Horaires + statut ouvert/fermé */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/20">
            <Clock className="w-4 h-4 text-white/70 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-white/80 text-sm">Lun. au Ven. | 8h - 17h</p>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              open
                ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                : 'bg-red-400/20 text-red-200 border border-red-400/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {open ? 'Ouvert' : 'Fermé'}
            </div>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Bouton Envoyer un message */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm mb-6"
        >
          <Mail className="w-5 h-5" strokeWidth={1.5} />
          <span>Envoyer un message</span>
          {showForm
            ? <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
            : <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
          }
        </button>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Votre nom et prénom"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                      touched.name && errors.name ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {touched.name && errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="votre@email.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                      touched.email && errors.email ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {touched.email && errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Téléphone <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Phone className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+261 XX XX XXX XX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Tag className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <select
                    value={form.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none ${
                      touched.subject && errors.subject ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <option value="">Sélectionner un sujet</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {touched.subject && errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3">
                    <MessageSquare className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    placeholder="Décrivez votre demande en détail..."
                    rows={5}
                    className={`w-full pl-10 pr-16 py-3 rounded-xl border text-sm text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none ${
                      touched.message && errors.message ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className={`text-xs font-mono ${
                      form.message.length >= MAX_CHARS ? 'text-red-500' :
                      form.message.length >= MAX_CHARS * 0.8 ? 'text-amber-500' :
                      form.message.length >= 10 ? 'text-emerald-500' :
                      'text-neutral-400'
                    }`}>
                      {form.message.length}/{MAX_CHARS}
                    </span>
                  </div>
                </div>
                {touched.message && errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>

              {/* Erreur globale */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Les champs marqués <span className="text-red-500">*</span> sont obligatoires
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}