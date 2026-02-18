// src/lib/hooks/useAppSettings.ts
// VERSION SANS FALLBACKS - Si vide dans Supabase = vide sur le frontend

'use client';

import { useState, useEffect } from 'react';
import { settingsService } from '@/lib/services/settingsService';
import { SettingsMap } from '@/types/settings';

interface UseAppSettingsReturn {
  settings: SettingsMap;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getSettingValue: (key: string) => string;
}

/**
 * Hook personnalisé pour charger et gérer les paramètres de l'application
 * SANS valeurs par défaut - Si le champ est vide dans Supabase, on affiche vide
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

  // SANS fallback - retourne chaîne vide si pas de valeur
  const getSettingValue = (key: string): string => {
    return settings[key] || '';
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
    bannerUrl: getSettingValue('hero_banner_url'),
    loading,
    error,
  };
}

/**
 * Hook spécialisé pour TOUT le contenu hero
 * Bannière Desktop + Mobile + Titre + Sous-titre + Description + Stats
 * SANS FALLBACKS - Si vide = vide
 */
export function useHeroContent() {
  const { settings, loading, error, getSettingValue } = useAppSettings();

  // Récupérer les URLs des bannières (pas de fallback)
  const desktopUrl = getSettingValue('hero_banner_url');
  const mobileUrl = getSettingValue('hero_banner_url_mobile') || desktopUrl; // Fallback mobile sur desktop uniquement
  
  // Textes sans fallback
  const title = getSettingValue('hero_title');
  const subtitle = getSettingValue('hero_subtitle');
  const description = getSettingValue('hero_description');

  // Stats sans fallback
  const stats = [
    {
      value: getSettingValue('stat_1_value'),
      label: getSettingValue('stat_1_label'),
    },
    {
      value: getSettingValue('stat_2_value'),
      label: getSettingValue('stat_2_label'),
    },
    {
      value: getSettingValue('stat_3_value'),
      label: getSettingValue('stat_3_label'),
    },
  ].filter(stat => stat.value || stat.label); // Filtrer les stats complètement vides

  // LOG POUR DEBUGGING
  console.log('🔍 Hero Content:', {
    desktopUrl,
    mobileUrl,
    title,
    subtitle,
    description,
    statsCount: stats.length,
    loading,
    settingsCount: Object.keys(settings).length
  });

  return {
    // Bannière DESKTOP (paysage 1920x1080)
    bannerUrlDesktop: desktopUrl,

    // Bannière MOBILE (portrait 1080x1350) - fallback sur desktop si non définie
    bannerUrlMobile: mobileUrl,
    
    // Textes (vides si non définis)
    title,
    subtitle,
    description,
    
    // Statistiques (filtrées si vides)
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
    phone: getSettingValue('support_phone'),
    whatsapp: getSettingValue('support_whatsapp'),
    email: getSettingValue('support_email'),
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