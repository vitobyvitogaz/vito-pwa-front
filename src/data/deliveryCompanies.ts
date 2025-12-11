export interface DeliveryCompany {
  id: number
  name: string
  logo: string // Chemin vers l'image
  description: string
  phone: string
  whatsapp: string
  messenger: string
  email: string
  areas: string[]
  deliveryTime: string
  rating: number // Note sur 5
  reviewCount: number
  features: string[]
  specialties: string[] // Pour les filtres
  verified: boolean // Badge vérifié
  minOrder?: string
  deliveryFee?: string
  workingHours: string
  website?: string
}

export const deliveryCompanies: DeliveryCompany[] = [
  {
    id: 1,
    name: "ProxiGaz",
    logo: "/images/delivery-logos/proxigaz.jpeg", // À remplacer par votre image
    description: "Plus 23 ans d’expérience dans la distribution de gaz",
    phone: "0340732499",
    whatsapp: "+261320723301",
    messenger: "https://m.me/proxigaz.mg",
    email: "proxigaz@agrico-group.com",
    areas: ["Antananarivo"],
    deliveryTime: "Quelques heures",
    rating: 4.8,
    reviewCount: 1,
    features: ["Tous les produits"],
    specialties: ["Ponctuel"],
    verified: true,
    minOrder: "1 bouteille",
    deliveryFee: "Nous contacter",
    workingHours: "Lundi au Vendredi : de 8h à 17h. Samedi : de 8h à 12h. Dimanche : Pas de livraison",
    website: "Indisponible"
  },
  {
    id: 2,
    name: "Bestplace.mg",
    logo: "/images/delivery-logos/bestplace.png",
    description: "Marketplace généraliste.",
    phone: "0349644234",
    whatsapp: "+261349644234",
    messenger: "https://m.me/www.bestplace.mg",
    email: "serviceclient@bestplace.mg",
    areas: ["Antananarivo"],
    deliveryTime: "24 heures",
    rating: 4.6,
    reviewCount: 1,
    features: ["Bouteilles 9kg & 12,5kg"],
    specialties: ["Marketplace généraliste"],
    verified: true,
    minOrder: "1 bouteilles",
    deliveryFee: "A partir de 8 000Ar",
    workingHours: "Lundi au Samedi : 7h à 18h. Samedi : Pas de livraison. Dimanche : Pas de livraison",
    website: "http://www.bestplace.mg/"
  },
]

// Types de filtres avec correspondance specialties
export const filterTypes = [
  { id: 'all', label: 'Tous', specialties: [] },
  { id: 'express', label: 'Livraison express', specialties: ['express'] },
  { id: '24h', label: 'Service 24h/24', specialties: ['24h'] },
]

// Fonction utilitaire pour filtrer
export const filterCompanies = (
  companies: DeliveryCompany[],
  selectedFilter: string,
  searchQuery: string
): DeliveryCompany[] => {
  let result = [...companies]

  // Filtre par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.description.toLowerCase().includes(query) ||
      company.areas.some(area => area.toLowerCase().includes(query)) ||
      company.features.some(feature => feature.toLowerCase().includes(query))
    )
  }

  // Filtre par catégorie
  if (selectedFilter !== 'all') {
    const filter = filterTypes.find(f => f.id === selectedFilter)
    if (filter) {
      if (filter.id === 'verified') {
        result = result.filter(company => company.verified)
      } else if (filter.specialties.length > 0) {
        result = result.filter(company =>
          filter.specialties.some(specialty => 
            company.specialties.includes(specialty)
          )
        )
      }
    }
  }

  return result
}

// Fonction pour trier par différents critères
export const sortCompanies = (
  companies: DeliveryCompany[],
  sortBy: 'rating' | 'deliveryTime' | 'name' | 'reviewCount'
): DeliveryCompany[] => {
  const sorted = [...companies]
  
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'deliveryTime':
      // Extraire le premier nombre du délai
      const extractTime = (time: string) => parseInt(time.match(/\d+/)?.[0] || '999')
      return sorted.sort((a, b) => extractTime(a.deliveryTime) - extractTime(b.deliveryTime))
    case 'reviewCount':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return sorted
  }
}