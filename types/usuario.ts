// src/types/usuario.ts

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  avatar_url: string;
  empresa: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  prefixo_orcamento: string;
  numero_proximo_orcamento: string;
  criado_em: string;
  atualizado_em: string;
}

export interface CreateUsuarioData {
  profile_id: string;
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  avatar_url: string;
  empresa: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  prefixo_orcamento: string;
  numero_proximo_orcamento: string;
  criado_em: string;
  atualizado_em: string;
}

export interface UpdateUsuarioData {
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
  prefixo_orcamento?: string;
  numero_proximo_orcamento?: string;
  criado_em?: string;
  atualizado_em?: string;
}
