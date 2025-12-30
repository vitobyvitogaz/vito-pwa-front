// src/lib/services/settingsService.ts

import { AppSetting, SettingsMap } from '@/types/settings';

/**
 * URL de l'API Backend (NestJS sur Render.com)
 */
const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1';

/**
 * Cache en mémoire pour les settings
 * Évite les appels répétés à l'API
 */
let settingsCache: SettingsMap | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Service de gestion des paramètres de configuration
 */
export const settingsService = {
  /**
   * Récupérer tous les paramètres actifs depuis l'API
   */
  async getAll(): Promise<AppSetting[]> {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data: AppSetting[] = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des settings:', error);
      throw error;
    }
  },

  /**
   * Récupérer un paramètre spécifique par sa clé
   */
  async getByKey(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_URL}/settings/${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data: AppSetting = await response.json();
      return data.setting_value;
    } catch (error) {
      console.error(`Erreur lors du chargement du setting ${key}:`, error);
      return null;
    }
  },

  /**
   * Récupérer tous les settings sous forme de Map (clé → valeur)
   * Avec cache pour optimiser les performances
   */
  async getAllAsMap(useCache: boolean = true): Promise<SettingsMap> {
    // Vérifier le cache
    if (useCache && settingsCache && cacheTimestamp) {
      const now = Date.now();
      if (now - cacheTimestamp < CACHE_DURATION) {
        return settingsCache;
      }
    }

    // Charger depuis l'API
    try {
      const settings = await this.getAll();
      const map: SettingsMap = {};

      settings.forEach((setting) => {
        if (setting.is_active && !setting.deleted_at) {
          map[setting.setting_key] = setting.setting_value;
        }
      });

      // Mettre à jour le cache
      settingsCache = map;
      cacheTimestamp = Date.now();

      return map;
    } catch (error) {
      console.error('Erreur lors du chargement des settings:', error);
      // Retourner le cache même expiré en cas d'erreur
      return settingsCache || {};
    }
  },

  /**
   * Invalider le cache
   * À appeler après une modification des settings dans le back-office
   */
  clearCache(): void {
    settingsCache = null;
    cacheTimestamp = null;
  },

  /**
   * Récupérer la bannière hero
   * Méthode utilitaire pour faciliter l'accès
   */
  async getHeroBannerUrl(): Promise<string | null> {
    const map = await this.getAllAsMap();
    return map['hero_banner_url'] || null;
  },

  /**
   * Récupérer le titre hero
   */
  async getHeroTitle(): Promise<string> {
    const map = await this.getAllAsMap();
    return map['hero_title'] || 'VITO';
  },

  /**
   * Récupérer le sous-titre hero
   */
  async getHeroSubtitle(): Promise<string> {
    const map = await this.getAllAsMap();
    return map['hero_subtitle'] || 'Rapide. Fiable. Centré sur l\'essentiel.';
  },

  /**
   * Vérifier si le mode maintenance est activé
   */
  async isMaintenanceMode(): Promise<boolean> {
    const map = await this.getAllAsMap();
    return map['maintenance_mode'] === 'true';
  },

  /**
   * Vérifier si les popups de promotion sont activées
   */
  async isPromotionPopupEnabled(): Promise<boolean> {
    const map = await this.getAllAsMap();
    return map['enable_promotion_popup'] !== 'false'; // Activé par défaut
  },
};