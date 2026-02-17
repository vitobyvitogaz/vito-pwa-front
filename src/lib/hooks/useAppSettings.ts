// src/lib/hooks/useAppSettings.ts
// VERSION COMPLÈTE avec hero content - CORRIGÉE

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
 */
export function useAppSettings(autoRefresh?: number): UseAppSettingsReturn {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching settings from backend API...');
      const data = await settingsService.getAllAsMap(true);
      console.log('✅ Settings loaded:', Object.keys(data));
      
      setSettings(data);
    } catch (err) {
      console.error('❌ Erreur chargement settings:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    if (autoRefresh && autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchSettings();
      }, autoRefresh);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
 * Hook spécialisé pour la bannière hero uniquement
 */
export function useHeroBanner() {
  const { settings, loading, error, getSettingValue } = useAppSettings();

  return {
    bannerUrl: getSettingValue('hero_banner_url', '/images/hero-banner.jpg'),
    loading,
    error,
  };
}

/**
 * Hook spécialisé pour TOUT le contenu hero
 * Bannière Desktop + Mobile + Titre + Sous-titre + Description + Stats
 */
export function useHeroContent() {
  const { settings, loading, error, getSettingValue } = useAppSettings();

  // Récupérer l'URL desktop pour servir de fallback au mobile
  const desktopUrl = getSettingValue('hero_banner_url', '/images/hero-banner.jpg');
  const mobileUrl = getSettingValue('hero_banner_url_mobile', desktopUrl);
  const title = getSettingValue('hero_title', 'VITO');
  const subtitle = getSettingValue('hero_subtitle', 'Rapide. Fiable. Centré sur l\'essentiel.');
  const description = getSettingValue(
    'hero_description',
    'VITO transforme votre expérience Vitogaz. Quatre boutons simples vous donnent un contrôle total : trouver un revendeur, commander en ligne, être au courant des promotions et gérer votre prêt PAMF pour acheter votre gaz.'
  );

  const stats = [
    {
      value: getSettingValue('stat_1_value', '+100'),
      label: getSettingValue('stat_1_label', 'Points de vente'),
    },
    {
      value: getSettingValue('stat_2_value', '24/7'),
      label: getSettingValue('stat_2_label', 'Service client'),
    },
    {
      value: getSettingValue('stat_3_value', '100%'),
      label: getSettingValue('stat_3_label', 'Sécurité garantie'),
    },
  ];

  // LOG POUR DEBUGGING
  console.log('🔍 Hero Content:', {
    desktopUrl,
    mobileUrl,
    title,
    loading,
    settingsCount: Object.keys(settings).length
  });

  return {
    // Bannière DESKTOP (paysage 1920x1080)
    bannerUrlDesktop: desktopUrl,

    // Bannière MOBILE (portrait 1080x1350) - fallback sur desktop si non définie
    bannerUrlMobile: mobileUrl,
    
    // Textes
    title,
    subtitle,
    description,
    
    // Statistiques
    stats,
    
    // États
    loading,
    error,
  };
}

/**
 * Hook spécialisé pour les informations de contact
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
 */
export function useMaintenanceMode() {
  const { settings, loading, getSettingValue } = useAppSettings();

  return {
    isMaintenanceMode: getSettingValue('maintenance_mode') === 'true',
    loading,
  };
}