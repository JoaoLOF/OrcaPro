// src/types/profile.ts

export interface UserProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url?: string | null;
  primary_color: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  user_id: string;
  company_name: string;
  logo_url?: string | null;
  primary_color: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  tax_id?: string;
}
