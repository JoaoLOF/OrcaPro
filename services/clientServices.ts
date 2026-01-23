import { CreateClientData, UpdateClientData, Client } from "../types/client";
import { supabase } from "./supabase";

/*
 Cria um novo cliente
*/
export const createClient = async (clientData: CreateClientData) => {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;

    return {
      client: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao criar cliente:", err);
    return {
      client: null,
      error: err.message || "Erro ao criar cliente",
    };
  }
};

/*
 Busca clientes do usuário
*/
export const fetchUserClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("usuario_id", userId)
      .order("nome", { ascending: true });

    if (error) throw error;

    return {
      clients: data || [],
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao buscar clientes:", err);
    return {
      clients: [],
      error: err.message || "Erro ao carregar clientes",
    };
  }
};

/*
 Busca um cliente específico
*/
export const fetchClientById = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error) throw error;

    return {
      client: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao buscar cliente:", err);
    return {
      client: null,
      error: err.message || "Erro ao carregar cliente",
    };
  }
};

/*
 Atualiza um cliente
*/
export const updateClient = async (
  clientId: string,
  clientData: UpdateClientData
) => {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .update(clientData)
      .eq("id", clientId)
      .select()
      .single();

    if (error) throw error;

    return {
      client: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao atualizar cliente:", err);
    return {
      client: null,
      error: err.message || "Erro ao atualizar cliente",
    };
  }
};

/*
 Deleta um cliente
*/
export const deleteClient = async (clientId: string) => {
  try {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", clientId);

    if (error) throw error;

    return {
      success: true,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao deletar cliente:", err);
    return {
      success: false,
      error: err.message || "Erro ao deletar cliente",
    };
  }
};
