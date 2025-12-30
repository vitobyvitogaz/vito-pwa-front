// src/lib/hooks/useAppSettings.ts

'use client';

import { useState, useEffect } from 'react';
import { settingsService } from '@/lib/services/settingsService';
import { SettingsMap } from '@/types/settings';

interface UseAppSettingsReturn {
  settings: SettingsMap;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getSettingValue: (key: string, defaultValue?: string) => string;
}

/**
 * Hook personnalisé pour charger et gérer les paramètres de l'application
 * 
 * @param autoRefresh - Rafraîchir automatiquement toutes les X minutes (optionnel)
 * @returns {UseAppSettingsReturn} État des settings avec loading, error et méthodes utilitaires
 * 
 * @example
 * ```tsx
 * function HomePage() {
 *   const { settings, loading, getSettingValue } = useAppSettings();
 *   
 *   if (loading) return <div>Chargement...</div>;
 *   
 *   const bannerUrl = getSettingValue('hero_banner_url');
 *   
 *   return <img src={bannerUrl} alt="Hero banner" />;
 * }
 * ```
 */
export function useAppSettings(autoRefresh?: number): UseAppSettingsReturn {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await settingsService.getAllAsMap(true);
      setSettings(data);
    } catch (err) {
      console.error('Erreur chargement settings:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les settings au montage
    fetchSettings();

    // Auto-refresh optionnel
    if (autoRefresh && autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchSettings();
      }, autoRefresh);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  /**
   * Récupérer la valeur d'un setting avec valeur par défaut
   */
  const getSettingValue = (key: string, defaultValue: string = ''): string => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    getSettingValue,
  };
}

/**
 * Hook spécialisé pour la bannière hero
 * 
 * @example
 * ```tsx
 * function HomePage() {
 *   const { bannerUrl, loading } = useHeroBanner();
 *   
 *   if (loading) return <Skeleton />;
 *   
 *   return <Image src={bannerUrl} alt="Hero" fill />;
 * }
 * ```
 */
export function useHeroBanner() {
  const { settings, loading, error, getSettingValue } = useAppSettings();

  return {
    bannerUrl: getSettingValue('hero_banner_url', '/images/hero-banner.jpg'), // Fallback
    title: getSettingValue('hero_title', 'VITO'),
    subtitle: getSettingValue('hero_subtitle', 'Rapide. Fiable. Centré sur l\'essentiel.'),
    loading,
    error,
  };
}

/**
 * Hook spécialisé pour les informations de contact
 * 
 * @example
 * ```tsx
 * function ContactSection() {
 *   const { phone, whatsapp, email } = useContactInfo();
 *   
 *   return (
 *     <div>
 *       <a href={`tel:${phone}`}>{phone}</a>
 *       <a href={`https://wa.me/${whatsapp}`}>WhatsApp</a>
 *     </div>
 *   );
 * }
 * ```
 */
export function useContactInfo() {
  const { getSettingValue } = useAppSettings();

  return {
    phone: getSettingValue('support_phone', '+261 00 00 000 00'),
    whatsapp: getSettingValue('support_whatsapp', '+261 00 00 000 00'),
    email: getSettingValue('support_email', 'support@vitogaz.mg'),
  };
}

/**
 * Hook spécialisé pour vérifier le mode maintenance
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { isMaintenanceMode, loading } = useMaintenanceMode();
 *   
 *   if (loading) return <Loading />;
 *   if (isMaintenanceMode) return <MaintenancePage />;
 *   
 *   return <NormalApp />;
 * }
 * ```
 */
export function useMaintenanceMode() {
  const { settings, loading, getSettingValue } = useAppSettings();

  return {
    isMaintenanceMode: getSettingValue('maintenance_mode') === 'true',
    loading,
  };
}