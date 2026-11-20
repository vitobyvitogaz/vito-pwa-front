import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — VitoByVitogaz',
  description:
    "Les données personnelles que l'application Vito by Vitogaz collecte, pourquoi, avec qui elles sont partagées et comment exercer vos droits.",
}

const lastUpdated = '20 novembre 2026'

interface Item {
  label: string
  text: string
}

interface Section {
  title: string
  paragraphs?: string[]
  items?: Item[]
  bullets?: string[]
  closing?: string[]
}

const sections: Section[] = [
  {
    title: '1. Qui est responsable de vos données ?',
    paragraphs: [
      "Le responsable du traitement est Vitogaz Madagascar, Route digue 2, Andohatapenaka II, Andranoabo, 101 Antananarivo, Madagascar – B.P. 3984.",
      "Pour toute question sur vos données : relationclient@vitogaz.mg ou 020 22 364 64.",
    ],
  },
  {
    title: '2. Les données que nous collectons',
    paragraphs: ["Nous ne collectons que ce qui est nécessaire à chaque fonction, selon ce que vous faites dans l'application :"],
    items: [
      {
        label: "Quand vous utilisez l'application.",
        text: "Comme tout service en ligne, nos hébergeurs enregistrent des journaux techniques (adresse IP, date et heure, type d'appareil et de navigateur), nécessaires au fonctionnement et à la sécurité du service.",
      },
      {
        label: 'Quand vous ouvrez un QR code Vitogaz.',
        text: "Nous enregistrons le passage : adresse IP, navigateur, système, type d'appareil, ainsi que le pays, la région et la ville estimés à partir de l'adresse IP. Ces informations servent à des statistiques d'usage.",
      },
      {
        label: 'Quand vous participez à une promotion (programme de fidélité).',
        text: "Votre nom, votre numéro de téléphone, votre numéro de CIN (12 chiffres), votre adresse e-mail si vous la donnez, le code promotionnel utilisé, la date et l'heure, votre adresse IP et votre navigateur. Vos points sont rattachés à votre numéro de téléphone. Le numéro de CIN est associé à votre compte de points pour vérifier votre identité et limiter la fraude.",
      },
      {
        label: 'Quand vous échangez des points.',
        text: "Votre nom, votre numéro de téléphone, l'article choisi et le code PIN que vous créez. Le code PIN est conservé sous une forme chiffrée irréversible : nous ne pouvons pas le lire.",
      },
      {
        label: "Quand vous contactez une société de livraison depuis l'application.",
        text: "Nous enregistrons que vous l'avez appelée ou contactée par WhatsApp, avec l'identifiant technique de votre appareil ; si vous avez activé les notifications, nous vous proposons ensuite de la noter. Si vous laissez un avis, votre note, votre commentaire et le nom que vous indiquez (ou « Anonyme ») sont affichés publiquement sur la fiche de la société.",
      },
      {
        label: "Quand vous écrivez à l'assistance ou à l'espace professionnel.",
        text: "Les informations saisies dans le formulaire (nom, adresse e-mail, téléphone, sujet et message ; ou, pour un contact professionnel, nom de l'entreprise et ville) sont envoyées par e-mail à notre service client.",
      },
      {
        label: 'Si vous activez la géolocalisation (facultatif).',
        text: "Votre position sert, sur votre appareil, à trouver les revendeurs proches, à calculer des distances et des itinéraires et à déterminer votre zone pour les notifications. Elle est mémorisée sur votre appareil et n'est pas enregistrée sur nos serveurs. Elle est en revanche transmise aux services cartographiques cités à l'article 4.",
      },
      {
        label: 'Si vous activez les notifications (facultatif).',
        text: "Nous enregistrons l'identifiant technique d'abonnement de votre navigateur, les zones et types de notifications choisis et votre type d'appareil. Vous pouvez les désactiver à tout moment dans Paramètres.",
      },
      {
        label: 'Sur votre appareil.',
        text: "L'application mémorise sur votre appareil votre nom et votre numéro de téléphone après une participation (pour pré-remplir les formulaires), votre position, vos préférences (thème, notifications) et des copies de pages, de documents et d'images pour fonctionner hors ligne. Ces copies ne contiennent aucune donnée personnelle. Le bouton « Vider le cache » de Paramètres supprime les copies hors ligne ; les autres informations s'effacent dans les réglages de votre navigateur.",
      },
    ],
  },
  {
    title: '3. Pourquoi nous utilisons ces données',
    bullets: [
      "fournir les services de l'application (revendeurs, promotions, documents, sociétés de livraison) ;",
      'gérer le programme de fidélité, vérifier les participations et limiter la fraude ;',
      'répondre à vos demandes et à vos messages ;',
      'envoyer les notifications que vous avez choisies ;',
      "mesurer l'usage de l'application (statistiques) ;",
      'assurer la sécurité et le bon fonctionnement du service.',
    ],
    closing: ["L'application ne contient ni publicité ni outil de suivi publicitaire, et n'utilise pas de cookies."],
  },
  {
    title: '4. Avec qui nous partageons vos données',
    paragraphs: [
      "Vos données sont accessibles à l'équipe Vitogaz habilitée (accès protégé par identifiant) et aux prestataires techniques ci-dessous, qui les traitent pour fournir leur service :",
    ],
    items: [
      {
        label: 'Vercel',
        text: "hébergement de l'application ; estimation du pays, de la région et de la ville à partir de votre adresse IP lors de l'ouverture d'un QR code (statistiques).",
      },
      { label: 'Render', text: "serveurs de l'application, situés à Francfort (Allemagne)." },
      { label: 'Supabase', text: 'base de données et stockage des fichiers.' },
      { label: 'Resend', text: "envoi des e-mails des formulaires de contact." },
      {
        label: 'OpenStreetMap (Nominatim, OSRM)',
        text: "fonds de carte, nom du lieu et calcul d'itinéraire à partir de coordonnées GPS.",
      },
      {
        label: 'ip-api.com',
        text: "estimation de votre ville à partir de votre adresse IP, uniquement si vous n'avez pas partagé votre position (affichage des promotions de votre zone).",
      },
      {
        label: 'Google Maps',
        text: "uniquement si vous ouvrez un itinéraire : Google reçoit alors la destination et votre position.",
      },
      {
        label: 'Services de notification des navigateurs',
        text: 'acheminement des notifications que vous avez activées (Google, Apple, Mozilla, Microsoft…).',
      },
      {
        label: 'WhatsApp, Messenger, YouTube, réseaux sociaux',
        text: "lorsque vous cliquez sur un lien ou un bouton, leurs propres règles s'appliquent.",
      },
    ],
    closing: [
      "Si vous appelez ou écrivez vous-même à une société de livraison, vous lui communiquez vos informations directement.",
    ],
  },
  {
    title: '5. Transferts hors de Madagascar',
    paragraphs: [
      "Ces prestataires sont situés hors de Madagascar (nos serveurs sont par exemple à Francfort, en Allemagne). Vos données peuvent donc être traitées à l'étranger.",
    ],
  },
  {
    title: '6. Combien de temps nous conservons vos données',
    paragraphs: [
      "Vos données de participation, de points et d'échange sont conservées tant que vous n'en demandez pas la suppression. Il en va de même des journaux de passage des QR codes et des avis publiés.",
      "Les copies enregistrées sur votre appareil restent jusqu'à ce que vous les supprimiez.",
    ],
  },
  {
    title: '7. Comment nous protégeons vos données',
    bullets: [
      "les échanges entre votre appareil et nos serveurs sont chiffrés (HTTPS) ;",
      "l'accès à l'administration est réservé à des comptes autorisés, selon leur rôle ;",
      'les codes PIN sont conservés sous une forme chiffrée irréversible ;',
      'les copies hors ligne se limitent à des contenus publics.',
    ],
    closing: ["Aucune méthode de transmission ou de stockage n'est totalement infaillible."],
  },
  {
    title: '8. Vos droits',
    paragraphs: ['Vous pouvez à tout moment :'],
    bullets: [
      'accéder aux données que nous détenons sur vous ;',
      'les faire corriger ;',
      'en demander la suppression ;',
      "vous opposer à certains usages ;",
      "retirer votre consentement : notifications dans Paramètres, géolocalisation dans les réglages de votre navigateur.",
    ],
    closing: [
      "Pour exercer vos droits, écrivez à relationclient@vitogaz.mg ou à l'adresse postale de l'article 10, en indiquant votre numéro de téléphone si votre demande concerne votre compte de points. Nous pouvons vous demander de justifier de votre identité.",
      "Vous pouvez aussi vous adresser à l'autorité malgache compétente en matière de protection des données personnelles.",
    ],
  },
  {
    title: '9. Modifications de cette politique',
    paragraphs: [
      "Nous pouvons mettre cette politique à jour. La version en vigueur est celle de cette page, avec sa date de mise à jour.",
    ],
  },
  {
    title: '10. Nous contacter',
    paragraphs: [
      'Vitogaz Madagascar\nRoute digue 2, Andohatapenaka II, Andranoabo, 101 Antananarivo – B.P. 3984',
      'Téléphone : 020 22 364 64 (lundi – vendredi, 8h – 18h ; samedi, 8h – 13h)\nE-mail : relationclient@vitogaz.mg',
    ],
  },
]

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-[65px] pb-24">
      <div className="container mx-auto px-4 max-w-2xl pt-8 pb-10">

        <Link
          href="/fr"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Accueil
        </Link>

        {/* ── En-tête ── */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white font-display tracking-tight leading-tight">
              Politique de confidentialité
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1">
              Vito by Vitogaz · Dernière mise à jour : {lastUpdated}
            </p>
          </div>
        </div>

        {/* ── Encart intro ── */}
        <div className="rounded-2xl p-4 mb-8 border border-primary-100 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
          <p className="text-sm font-sans leading-relaxed text-primary-700 dark:text-primary-300">
            Cette politique explique quelles données personnelles l&apos;application Vito by Vitogaz collecte, pourquoi, avec qui
            elles sont partagées et comment exercer vos droits. Elle complète les{' '}
            <Link href="/fr/conditions" prefetch={false} className="underline underline-offset-2 font-medium">
              conditions d&apos;utilisation
            </Link>
            .
          </p>
        </div>

        {/* ── Sections ── */}
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white font-display">{section.title}</h2>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
                {section.paragraphs?.map((p) => (
                  <p key={p} className="whitespace-pre-line">{p}</p>
                ))}
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <strong className="font-semibold text-neutral-900 dark:text-white">{item.label}</strong>{' '}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}
                {section.bullets && (
                  <ul className="list-disc pl-5 space-y-1.5">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.closing?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Pied de page ── */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">
            © {new Date().getFullYear()} Vitogaz Madagascar — Tous droits réservés
          </p>
        </div>

      </div>
    </div>
  )
}
