'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { hapticFeedback } from '@/lib/utils/haptic'
import { UserIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/solid'

export const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: '1',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    hapticFeedback('medium')

    try {
      // Envoyer via WhatsApp
      const message = `🔥 Nouvelle commande Vito\n\n👤 Nom: ${formData.name}\n📞 Tél: ${formData.phone}\n📍 Adresse: ${formData.address}\n🛒 Quantité: ${formData.quantity}\n📝 Notes: ${formData.notes || 'Aucune'}`
      
      const whatsappUrl = `https://wa.me/261340000000?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        quantity: '1',
        notes: '',
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-dark-border shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2 font-display">
        Formulaire de commande
      </h2>
      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
        Remplissez vos informations pour une livraison rapide
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nom complet"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          leftIcon={<UserIcon className="w-5 h-5" />}
          placeholder="Votre nom"
        />

        <Input
          label="Téléphone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          leftIcon={<PhoneIcon className="w-5 h-5" />}
          placeholder="+261 34 00 000 00"
        />

        <Input
          label="Adresse de livraison"
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          leftIcon={<MapPinIcon className="w-5 h-5" />}
          placeholder="Quartier, rue, repères..."
        />

        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            Quantité
          </label>
          <div className="relative">
            <ShoppingBagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <select
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface pl-10 pr-4 py-2.5 text-base text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            >
              <option value="1">1 bouteille</option>
              <option value="2">2 bouteilles</option>
              <option value="3">3 bouteilles</option>
              <option value="4">4 bouteilles</option>
              <option value="5+">5+ bouteilles</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            Notes supplémentaires <span className="text-neutral-400">(facultatif)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-2.5 text-base text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all duration-200"
            placeholder="Instructions de livraison, étage, etc."
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer la commande'}
        </Button>
      </form>
    </div>
  )
}