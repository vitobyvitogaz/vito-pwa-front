'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Shield } from 'lucide-react'

const VITOGAZ_GREEN = '#008B7F'

const lastUpdated = '1er avril 2025'

const sections = [
  {
    title: '1. Présentation de l\'application',
    content: `Vito by Vitogaz (ci-après « l'Application ») est une application web progressive (PWA) éditée par Vitogaz Madagascar, société spécialisée dans la distribution de gaz butane et propane à Madagascar depuis plus de 25 ans.

L'Application a pour objet de permettre aux utilisateurs de :
• Consulter les promotions et offres commerciales de Vitogaz Madagascar ;
• Localiser les revendeurs agréés et les sociétés de livraison à domicile ;
• Participer à des programmes de fidélité via scan de QR codes en point de vente ;
• Recevoir des alertes et notifications commerciales ;
• Accéder aux documents et informations produits Vitogaz.`,
  },
  {
    title: '2. Acceptation des conditions',
    content: `L'accès et l'utilisation de l'Application impliquent l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation (ci-après « CGU »).

L'utilisateur qui n'accepte pas ces conditions doit cesser immédiatement toute utilisation de l'Application. Vitogaz Madagascar se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur l'Application.`,
  },
  {
    title: '3. Accès et disponibilité',
    content: `L'Application est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Vitogaz Madagascar met en œuvre les moyens nécessaires pour assurer la continuité du service, mais ne peut garantir une disponibilité ininterrompue.

Vitogaz Madagascar se réserve le droit de suspendre, modifier ou interrompre l'accès à tout ou partie de l'Application, notamment pour des raisons de maintenance, de mise à jour ou de force majeure, sans préavis ni indemnité.`,
  },
  {
    title: '4. Services proposés',
    content: `4.1 Consultation des promotions
L'Application affiche les offres promotionnelles en cours de Vitogaz Madagascar. Ces offres sont valables dans les limites de stocks disponibles et dans les zones géographiques indiquées. Vitogaz Madagascar se réserve le droit de modifier ou de retirer une promotion à tout moment sans préavis.

4.2 Localisation des revendeurs
Les informations de localisation des revendeurs agréés sont fournies à titre indicatif. Vitogaz Madagascar ne garantit pas leur exhaustivité ni leur exactitude en temps réel.

4.3 Programme de fidélité par scan QR
Certaines promotions permettent à l'utilisateur de participer à un programme de fidélité en scannant un QR code en point de vente. La participation implique la saisie volontaire d'informations personnelles (nom, téléphone, email optionnel). Les points accumulés sont échangeables selon les modalités définies par Vitogaz Madagascar et peuvent être modifiées à tout moment.

4.4 Notifications push
L'utilisateur peut activer des notifications push pour recevoir des alertes commerciales. Cette activation est volontaire et peut être désactivée à tout moment depuis les paramètres de l'Application ou du navigateur.`,
  },
  {
    title: '5. Collecte et traitement des données personnelles',
    content: `Vitogaz Madagascar, en tant que responsable de traitement, collecte les données suivantes :

• Données de navigation : adresse IP, type d'appareil, système d'exploitation, navigateur, localisation approximative (via adresse IP ou géolocalisation consentie) ;
• Données de participation : nom, numéro de téléphone, adresse email (optionnelle), lors des participations aux programmes de fidélité via QR code ;
• Données de notification : endpoint de subscription push, préférences de notification ;
• Données de localisation : position géographique approximative, uniquement avec le consentement explicite de l'utilisateur.

Ces données sont collectées dans le but de :
— Fournir et améliorer les services de l'Application ;
— Gérer les participations aux programmes promotionnels ;
— Envoyer des alertes commerciales consenties ;
— Réaliser des analyses statistiques anonymisées ;
— Prévenir la fraude et les abus.

Conformément aux lois malgaches applicables en matière de protection des données personnelles, l'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant Vitogaz Madagascar à l'adresse indiquée à l'article 10.`,
  },
  {
    title: '6. Géolocalisation',
    content: `L'Application peut demander l'accès à la position géographique de l'utilisateur dans le but unique de personnaliser l'affichage des promotions et des revendeurs disponibles dans sa zone.

Cette autorisation est strictement facultative. L'utilisateur peut refuser ou révoquer cette autorisation à tout moment depuis les paramètres de son navigateur ou de son appareil. Le refus de géolocalisation n'empêche pas l'utilisation des autres fonctionnalités de l'Application.`,
  },
  {
    title: '7. Propriété intellectuelle',
    content: `L'ensemble des éléments composant l'Application (textes, images, graphismes, logo, interface, code source, base de données) est la propriété exclusive de Vitogaz Madagascar ou fait l'objet d'une licence d'utilisation accordée à celle-ci.

Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, de ces éléments, par quelque procédé que ce soit, sans l'autorisation préalable et écrite de Vitogaz Madagascar, est strictement interdite et constituerait une violation des droits de propriété intellectuelle.`,
  },
  {
    title: '8. Comportement de l\'utilisateur',
    content: `L'utilisateur s'engage à utiliser l'Application de manière loyale, conformément à sa destination et aux présentes CGU. Il lui est notamment interdit de :

• Soumettre des informations personnelles fausses ou usurper l'identité d'un tiers lors des participations ;
• Utiliser des moyens automatisés (robots, scripts) pour interagir avec l'Application ;
• Tenter de contourner les mécanismes de sécurité de l'Application ;
• Participer frauduleusement à plusieurs reprises aux programmes de fidélité ;
• Utiliser l'Application à des fins illicites ou contraires à l'ordre public.`,
  },
  {
    title: '9. Limitation de responsabilité',
    content: `Vitogaz Madagascar s'efforce d'assurer l'exactitude des informations diffusées sur l'Application. Cependant, elle ne peut être tenue responsable :

• Des erreurs ou omissions dans le contenu de l'Application ;
• De l'indisponibilité temporaire de l'Application ;
• Des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser l'Application ;
• Du contenu des sites tiers vers lesquels l'Application pourrait rediriger ;
• Des interruptions de réseau ou de service indépendantes de sa volonté.

La responsabilité de Vitogaz Madagascar ne saurait être engagée en cas de force majeure au sens du droit malgache.`,
  },
  {
    title: '10. Droit applicable et juridiction',
    content: `Les présentes CGU sont régies par le droit malgache. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut de résolution amiable, les tribunaux compétents d'Antananarivo, Madagascar, seront seuls compétents.`,
  },
  {
    title: '11. Contact',
    content: `Pour toute question relative aux présentes CGU ou à l'utilisation de vos données personnelles, vous pouvez contacter Vitogaz Madagascar :

📞 Téléphone : 020 22 364 64
🕐 Horaires : Lundi – Vendredi, 8h00 – 17h00
🌐 Site : vitobyvitogaz.mg

Siège social : Vitogaz Madagascar, Antananarivo, Madagascar.`,
  },
]

export default function ConditionsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string || 'fr'

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 pb-24">

      {/* ── Barre nav sticky ── */}
      <div className="sticky top-14 z-40 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-2xl flex items-center h-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Paramètres
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl pt-8 pb-10">

        {/* ── En-tête ── */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${VITOGAZ_GREEN}15` }}>
            <Shield className="w-6 h-6" style={{ color: VITOGAZ_GREEN }} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-display leading-tight">
              Conditions d'utilisation
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1">
              Vito by Vitogaz · Dernière mise à jour : {lastUpdated}
            </p>
          </div>
        </div>

        {/* ── Encart intro ── */}
        <div className="rounded-2xl p-4 mb-8 border" style={{ backgroundColor: `${VITOGAZ_GREEN}08`, borderColor: `${VITOGAZ_GREEN}25` }}>
          <p className="text-sm font-sans leading-relaxed" style={{ color: VITOGAZ_GREEN }}>
            En utilisant l'application Vito by Vitogaz, vous acceptez les présentes conditions d'utilisation.
            Veuillez les lire attentivement avant toute utilisation des services.
          </p>
        </div>

        {/* ── Sections ── */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Titre de section */}
              <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                  {section.title}
                </h2>
              </div>
              {/* Contenu */}
              <div className="px-5 py-4">
                <div className="text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pied de page ── */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">
            © {new Date().getFullYear()} Vitogaz Madagascar — Tous droits réservés
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">
            Leader du gaz à Madagascar depuis plus de 25 ans
          </p>
        </div>

      </div>
    </div>
  )
}