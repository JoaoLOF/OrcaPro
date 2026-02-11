// src/types/profile.ts

export interface UserProfile {
  id:string;
  name: string;
  phone: string:
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  id?: string;
  nome_completo?: string;
  email?: string;
  telefone?: string;
  avatar_url?: string;
  empresa?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  updated_at?: string;
}
