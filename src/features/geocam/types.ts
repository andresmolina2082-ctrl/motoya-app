export interface GeoCamCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  created_at: string;
}

export interface GeoCam {
  id: number;
  title: string;
  description?: string | null;
  photo_uri: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  category_id?: number | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;

  // Campos de la relación (JOIN con geocam_categories)
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
}

export interface CreateGeoCamDTO {
  title: string;
  description?: string | null;
  photo_uri: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  category_id?: number | null;
  user_id?: string | null;
}

export interface UpdateGeoCamDTO {
  title?: string;
  description?: string | null;
  category_id?: number | null;
}
