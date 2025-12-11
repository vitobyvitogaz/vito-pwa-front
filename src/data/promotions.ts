// src/data/promotions.ts
import type { Promotion } from '@/types/promotion'

export const filters = [
  { id: 'all', label: 'Toutes', icon: '🎁' },
  { id: 'active', label: 'Actives', icon: '✨' },
  { id: 'expired', label: 'Expirées', icon: '⏰' },
]

export const zones = [
  { id: 'tana', label: 'Antananarivo', value: 'tana' },
  { id: 'antsirabe', label: 'Antsirabe', value: 'antsirabe' },
  { id: 'majunga', label: 'Mahajanga', value: 'majunga' },
  { id: 'tamatave', label: 'Toamasina', value: 'tamatave' },
  { id: 'fianar', label: 'Fianarantsoa', value: 'fianar' },
  { id: 'tulear', label: 'Toliara', value: 'tulear' },
  { id: 'nosybe', label: 'Nosy Be', value: 'nosybe' },
  { id: 'diego', label: 'Antsiranana', value: 'diego' },
  { id: 'morondava', label: 'Morondava', value: 'morondava' },
  { id: 'fortDauphin', label: 'Fort-Dauphin', value: 'fortDauphin' },
  { id: 'manakara', label: 'Manakara', value: 'manakara' },
  { id: 'ambatolampy', label: 'Ambatolampy', value: 'ambatolampy' },
  { id: 'sambava', label: 'Sambava', value: 'sambava' },
  { id: 'antalaha', label: 'Antalaha', value: 'antalaha' },
  { id: 'andapa', label: 'Andapa', value: 'andapa' },
  { id: 'vohemar', label: 'Vohémar', value: 'vohemar' },
  { id: 'moramanga', label: 'Moramanga', value: 'moramanga' },
  { id: 'ambatondrazaka', label: 'Ambatondrazaka', value: 'ambatondrazaka' },
  { id: 'feneriveEst', label: 'Fénérive Est', value: 'feneriveEst' },
  { id: 'ambovombe', label: 'Ambovombe', value: 'ambovombe' },
  { id: 'ihosy', label: 'Ihosy', value: 'ihosy' },
]

export const productCategories = [
  { id: 'bouteille', label: 'Bouteilles de gaz', value: 'bouteille' },
  { id: 'detendeur', label: 'Détendeurs', value: 'detendeur' },
  { id: 'tuyau', label: 'Tuyaux', value: 'tuyau' },
  { id: 'kit1', label: 'Kits Fatapera', value: 'kit1' },
  { id: 'kit2', label: 'Kits connectiques', value: 'kit2' },
  { id: 'kit3', label: 'Kits complets', value: 'kit3' },
  { id: 'accessoire', label: 'Accessoires', value: 'accessoire' },
  { id: 'livraison', label: 'Livraison', value: 'livraison' },
]

export const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Fety Masaka',
    subtitle: 'Fety Masaka miaraka amin\'ny Vitogaz Madagascar, mandritra ny volana Desambra',
    description: 'Promotion amin\'ny tavoahangy 9 kg miaraka amin\'ireo accessoires : \n- Fatana Gaz : détendeur + pack tuyau\n- Kit fatapera',
    discount: 45,
    discountType: 'percentage',
    validUntil: '2025-12-31T23:59:59',
    image: '/images/promotions/promo_1.jpg',
    isActive: true,
    category: 'kit3',
    code: '',
    zones: ['tana', 'antsirabe', 'fianar', 'tulear', 'morondava', 'fortDauphin', 'manakara', 'ambatolampy', 'majunga', 'diego', 'sambava', 'antalaha', 'andapa', 'vohemar', 'tamatave', 'moramanga', 'ambatondrazaka', 'feneriveEst', 'ambovombe', 'ihosy'],
    products: ['bouteille', 'detendeur', 'tuyau', 'kit1'],
    conditions: [
      'Tsy misy condition !'
    ],
    usageCount: 342,
    maxUsage: 1000,
  },
  {
  id: "2",
  title: "Masao ny faran'ny taona",
  subtitle: " Faran'ny taona masaka be miaraka amin'ny 𝙑𝙞𝙩𝙤𝙜𝙖𝙯 sy 𝙅𝙤𝙫𝙚𝙣𝙖 !",
  description: "Manomboka ny 𝟮𝟵 𝗻𝗼𝘃𝗮𝗺𝗯𝗿𝗮 𝗵𝗮𝘁𝗿𝗮𝗺𝗶𝗻'𝗻𝘆 𝟯𝟭 𝗱𝗲𝘀𝗮𝗺𝗯𝗿𝗮, fihenam-bidy goavana be no miandry anao 😎😱\n🏷️ Bouteille 9kg + kit fatapera complet : 𝟭𝟱𝟬.𝟬𝟬𝟬 𝗔𝗿𝗶𝗮𝗿𝘆 (raha tokony ho 212.000 Ariary)\n🏷️ Bouteille 9kg + pack connectique : 𝟭𝟯𝟭.𝟬𝟬𝟬 𝗔𝗿𝗶𝗮𝗿𝘆 (raha tokony ho 184.000 Ariary)\nIanao sisa no andrasana 😉 tongava haingana eny amin'ny Jovena akaiky indrindra anao (Jovena rehetra eto Antananarivo anh 😉 )",
  discount: 30,
  discountType: "percentage",
  validUntil: "2025-12-31T23:59:59",
  image: "/images/promotions/promo_2.jpg",
  isActive: true,
  category: "kit3",
  code: "",
  zones: [
    "tana"
  ],
  "products": [
    "bouteille",
    "kit1",
    "kit2"
  ],
  "conditions": [
    "Manomboka ny 29 Desambra 2025 !"
  ],
  "usageCount": 342,
  "maxUsage": 1000
},
  {
    id: '3',
    title: 'Offre spéciale Vitogaz : Kit complets ',
    subtitle: 'Offre disponible dans les stations Shell Tamatave',
    description: 'Jusqu’au 07 décembre, profitez des prix remisés sur les bouteilles 9kg : Kit Fatapera et Pack Connectique.\n Votre gaz au meilleur prix, c’est maintenant.💛 \n Rendez-vous dans les stations Shell à Tamatave, Moramanga et Fenerive Est:  ',
    discount: 0,
    discountType: 'fixed',
    validUntil: '2025-12-07T23:59:59',
    image: '/images/promotions/promo_3.jpg',
    isActive: true,
    category: 'kit3',
    code: '',
    zones: [ 'tamatave'],
    products: ['bouteille', 'detendeur', 'tuyau', 'kit1'],
    conditions: [
      'Tsy misy condition !'
    ],
    usageCount: 342,
    maxUsage: 1000,
  },
]

export const ITEMS_PER_PAGE = 5

export const sortOptions = [
  { id: 'discount_desc', label: 'Plus haute réduction', value: 'discount_desc' },
  { id: 'discount_asc', label: 'Plus faible réduction', value: 'discount_asc' },
  { id: 'newest', label: 'Plus récentes', value: 'newest' },
  { id: 'expiring', label: 'Bientôt expirées', value: 'expiring' },
]