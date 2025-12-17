export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: 'pamf' | 'security' | 'guides';
  file_url: string;
  file_size: number | null;
  page_count: number | null;
  is_offline: boolean;
  download_count: number;
  is_active: boolean;
  display_order: number;
  created_by_id: string | null;
  updated_by_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}