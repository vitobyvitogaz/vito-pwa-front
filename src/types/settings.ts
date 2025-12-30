// src/types/settings.ts

/**
 * Type des paramètres de configuration de l'application
 */
export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'url';
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Clés de settings prédéfinies
 */
export type SettingKey =
  | 'hero_banner_url'
  | 'hero_title'
  | 'hero_subtitle'
  | 'maintenance_mode'
  | 'enable_promotion_popup'
  | 'support_phone'
  | 'support_whatsapp'
  | 'support_email';

/**
 * Map des settings par clé
 */
export type SettingsMap = {
  [key: string]: string;
};

/**
 * Réponse de l'API settings
 */
export interface SettingsResponse {
  data: AppSetting[] | null;
  error: Error | null;
}