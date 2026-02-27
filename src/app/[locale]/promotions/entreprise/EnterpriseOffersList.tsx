'use client'

import { useState, useMemo } from 'react'
import { EnterpriseOfferCard } from './EnterpriseOfferCard'
import type { EnterpriseOffer } from './EnterpriseOfferCard'
import { Building2, Package } from 'lucide-react'

const ENTERPRISE_OFFERS: EnterpriseOffer[] = [
  {
    id: 'ent-1',
    badge: 'Contrat annuel',
    sector: 'Industrie',
    title: 'Pack Industrie Premium',
    subtitle: 'Pour les grandes industries & usines',
    description: 'Approvisionnement garanti en gaz industriel avec contrat de service dédié, livraison prioritaire et suivi en temps réel de votre consommation.',
    discount: '-18%',
    discountLabel: 'sur tarif',
    features: [
      'Volume minimum : 500 kg/mois',
      'Livraison dédiée J+1 garanti',
      'Gestionnaire de compte attitré',
      'Facturation mensuelle consolidée',
      'Reporting consommation mensuel',
      'Maintenance préventive incluse',
    ],
    cta: 'Demander un devis',
    ctaPhone: '+261340000000',
    ctaEmail: 'entreprises@vitogaz.mg',
    highlight: true,
    validUntil: '31 décembre 2025',
    isActive: true,
  },
  {
    id: 'ent-2',
    badge: 'Offre PME',
    sector: 'PME',
    title: 'Pack PME Essentiel',
    subtitle: 'Pour les petites et moyennes entreprises',
    description: 'Solution flexible et économique pour les PME avec engagement sur 6 mois. Tarifs préférentiels et service client prioritaire.',
    discount: '-12%',
    discountLabel: 'sur commandes',
    features: [
      'Volume minimum : 100 kg/mois',
      'Livraison sous 48h',
      'Accès portail client en ligne',
      'Paiement à 30 jours',
      'Assistance téléphonique dédiée',
    ],
    cta: 'Souscrire maintenant',
    ctaPhone: '+261340000000',
    ctaEmail: 'entreprises@vitogaz.mg',
    highlight: false,
    validUntil: '28 février 2026',
    isActive: true,
  },
  {
    id: 'ent-3',
    badge: 'Restauration & Hôtellerie',
    sector: 'HoReCa',
    title: 'Pack Restauration',
    subtitle: 'Hôtels, restaurants & traiteurs',
    description: 'Offre spécialement conçue pour le secteur HoReCa avec livraison flexible selon vos pics d\'activité et garantie de continuité de service.',
    discount: '-15%',
    discountLabel: 'dès 200 kg/mois',
    features: [
      'Livraison selon votre planning',
      'Stock de sécurité offert (1 mois)',
      'Intervention d\'urgence 7j/7',
      'Audit sécurité installations inclus',
      'Formation sécurité du personnel',
    ],
    cta: 'Contacter un conseiller',
    ctaPhone: '+261340000000',
    ctaEmail: 'entreprises@vitogaz.mg',
    highlight: false,
    validUntil: '30 juin 2026',
    isActive: true,
  },
  {
    id: 'ent-4',
    badge: 'Nouveau',
    sector: 'Multi-sites',
    title: 'Pack Multi-Sites',
    subtitle: 'Groupes & franchises avec plusieurs sites',
    description: 'Gestion centralisée de l\'approvisionnement pour vos multiples points de vente ou unités de production avec une seule facture consolidée.',
    discount: '-20%',
    discountLabel: 'volume global',
    features: [
      'Jusqu\'à 10 sites couverts',
      'Tableau de bord centralisé',
      'Un interlocuteur unique',
      'Facturation groupée mensuelle',
      'Optimisation des tournées',
      'Rapport ESG disponible',
    ],
    cta: 'Demander une démo',
    ctaPhone: '+261340000000',
    ctaEmail: 'entreprises@vitogaz.mg',
    highlight: false,
    validUntil: '31 mars 2026',
    isActive: true,
  },
  {
    id: 'ent-5',
    badge: 'Expirée',
    sector: 'Tous secteurs',
    title: 'Pack Lancement Entreprise',
    subtitle: 'Offre de bienvenue nouveaux clients pro',
    description: 'Offre exclusive réservée aux nouveaux clients professionnels lors de leur première commande avec Vitogaz Madagascar.',
    discount: '-25%',
    discountLabel: '1ère commande',
    features: [
      'Première commande uniquement',
      'Sans volume minimum',
      'Livraison offerte',
      'Kit sécurité inclus',
    ],
    cta: 'Offre expirée',
    highlight: false,
    validUntil: '31 octobre 2025',
    isActive: false,
  },
]

type TabType = 'active' | 'expired'

export const EnterpriseOffersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active')

  const activeOffers = useMemo(() => ENTERPRISE_OFFERS.filter(o => o.isActive), [])
  const expiredOffers = useMemo(() => ENTERPRISE_OFFERS.filter(o => !o.isActive), [])
  const displayedOffers = activeTab === 'active' ? activeOffers : expiredOffers

  return (
    <div className="space-y-8">

      {/* Onglets Actives / Expirées */}
      <div className="flex justify-center">
        <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 gap-0">
            <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-l-full rounded-r-none text-sm font-semibold transition-all duration-300 ${
                activeTab === 'active'
                    ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
            >
                <Building2 className="w-4 h-4" strokeWidth={1.5} />
                Offres actives
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'active'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}>
                {activeOffers.length}
                </span>
            </button>
            <button
                onClick={() => setActiveTab('expired')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-r-full rounded-l-none text-sm font-semibold transition-all duration-300 ${
                activeTab === 'expired'
                    ? 'bg-white dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
            >
                <Package className="w-4 h-4" strokeWidth={1.5} />
                Expirées
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'expired'
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}>
                {expiredOffers.length}
                </span>
            </button>
            </div>
        </div>

      {/* Grille */}
      {displayedOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedOffers.map((offer, index) => (
            <div
              key={offer.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <EnterpriseOfferCard offer={offer} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-neutral-400" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 font-sans">
            Aucune offre {activeTab === 'active' ? 'active' : 'expirée'}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 font-sans">
            {activeTab === 'active'
              ? 'De nouvelles offres entreprise arrivent bientôt.'
              : 'Aucune offre expirée pour le moment.'}
          </p>
        </div>
      )}
    </div>
  )
}