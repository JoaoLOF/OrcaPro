// src/types/client.ts

export interface Client {
  id: string;
  usuario_id: string;
  nome: string;
  cpf_cnpj?: string;
  email?: string | null;
  telefone?: string | null;
  tags?: string;
  ativo?: string;
  criado_em?: string;
  atualizado?: string;
}

export interface CreateClientData {
  nome: string;
  email?: string | null;
  cpf_cnpj?: string;
  telefone?: string | null;
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
