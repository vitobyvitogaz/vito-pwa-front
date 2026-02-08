// Interface pour le statut d'ouverture
export interface BusinessStatus {
  isOpen: boolean;
  message: string;
  nextChange: string;
  currentDay: string;
  todaySchedule: {
    open: string | null;
    close: string | null;
    breaks: Array<{ start: string; end: string }>;
    closed: boolean;
  };
}

// Interface pour les horaires (JSONB structure)
export interface BusinessHours {
  timezone: string;
  default_schedule: {
    [day: string]: {
      open: string | null;
      close: string | null;
      breaks: Array<{ start: string; end: string }>;
      closed: boolean;
    };
  };
  holidays: Array<{
    date: string;
    name: string;
  }>;
}

export interface Reseller {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp?: string;
  type: 'Quincaillerie' | 'Épicerie' | 'Station Service' | 'Libre Service' | 'Maison du gaz' | 'Autres';
  services: string[];
  hours?: BusinessHours; // 👈 MODIFIÉ (était string)
  rating?: number;
  business_status?: BusinessStatus; // 👈 NOUVEAU
  segment_id?: number; // 👈 NOUVEAU
  reseller_products?: Array<{
    product_id: string;
    products: {
      id: string;
      name: string;
      price: number;
      category: string;
      image_url?: string;
      description?: string;
      product_code?: string;
      created_at?: string;
      updated_at?: string;
      deleted_at?: string | null;
    };
  }>;
}