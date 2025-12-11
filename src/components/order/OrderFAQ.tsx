'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

const faqs = [
  {
    question: 'Quel est le délai de livraison ?',
    answer: 'En temps normal, la livraison se fait sous 2-4 heures à Antananarivo. Pour les autres villes, comptez 24-48h. Une livraison express (sous 2h) est disponible avec supplément.',
  },
  {
    question: 'Y a-t-il des frais de livraison ?',
    answer: 'La livraison est gratuite pour toute commande dans un rayon de 10km. Au-delà, des frais de 5 000 Ar s\'appliquent. Pour les autres villes, les frais varient selon la distance.',
  },
  {
    question: 'Puis-je annuler ma commande ?',
    answer: 'Oui, vous pouvez annuler gratuitement jusqu\'à 30 minutes après validation. Passé ce délai, contactez-nous par WhatsApp ou téléphone.',
  },
  {
    question: 'Comment savoir si mon quartier est desservi ?',
    answer: 'Tous les quartiers d\'Antananarivo sont desservis. Pour les autres zones, utilisez la carte des revendeurs ou contactez-nous directement pour confirmation.',
  },
  {
    question: 'Que faire si la bouteille est défectueuse ?',
    answer: 'Nous garantissons la qualité de nos bouteilles. En cas de problème, contactez-nous immédiatement et nous procéderons à un échange gratuit sous 24h.',
  },
]

export const OrderFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-dark-border shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-6 font-display">
        Questions fréquentes
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index

          return (
            <div
              key={index}
              className="border border-neutral-200 dark:border-dark-border rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200"
              >
                <span className="text-base font-semibold text-neutral-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}