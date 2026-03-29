// src/types/usuario.ts

export interface SettingsData {
  user_id: String;
  company_name: String;
  logo_url: String;
  color_primary: String;
  document_footer: String;
  created_at: String;
  updated_at: String;
}

export interface UpdateSettingsData {
  user_id: String;
  company_name: String;
  logo_url: String;
  color_primary: String;
  document_footer?: String;
  updated_at: String;
}
