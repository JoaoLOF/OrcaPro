// src/types/client.ts

export interface Client {
  id: string;
  profile_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address_state?: string | null;
  address_city?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  profile_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address_state?: string | null;
  address_city?: string | null;
  address_street?: string | null;
  address_number?: string | null;
}

export interface UpdateClientData {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address_state?: string | null;
  address_city?: string | null;
  address_street?: string | null;
  address_number?: string | null;
}
