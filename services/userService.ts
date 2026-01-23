import { createClient } from "@supabase/supabase-js";
import { LoginCredentials, AuthResponse } from "../types/auth";
import { supabase } from "./supabase";
import {
  CreateUsuarioData,
  UpdateUsuarioData,
  Usuario,
} from "../types/usuario";

/* 
  Realiza login com email e senha
*/
export const loginWithEmail = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        user: null,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        user: null,
        error: "Erro ao fazer login. Tente novamente.",
      };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
      },
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: "Erro de conexão. Verifique sua internet.",
    };
  }
};

/*
 Registra um novo usuário
*/
export const registerWithEmail = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", data.email)
      .single();

    if (existingUser) {
      return {
        user: null,
        error: "Este e-mail já está cadastrado",
      };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (authError) {
      return {
        user: null,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: "Erro ao criar conta. Tente novamente.",
      };
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        created_at: authData.user.created_at,
      },
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: "Erro de conexão. Verifique sua internet.",
    };
  }
};

/*
 Verifica se há uma sessão ativa
*/
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error("Erro ao buscar sessão:", err);
    return null;
  }
};

/*
 Busca orçamentos do usuário
*/
export const fetchUserBudgets = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      budgets: data || [],
      error: null,
    };
  } catch (err: any) {
    console.error("Erro ao buscar orçamentos:", err);
    return {
      budgets: [],
      error: err.message || "Erro ao carregar orçamentos",
    };
  }
};

/*
 Faz logout do usuário
*/
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
    return { success: false };
  }
};

/*
 Atualiza ou cria o perfil do usuário
*/
export const updateUserProfile = async (profileData: UpdateProfileData) => {
  try {
    console.log("💾 Salvando perfil...", profileData);

    // Tenta fazer update primeiro
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileData.id)
      .single();

    let result;

    if (existing) {
      // Update
      result = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", profileData.id)
        .select()
        .single();
    } else {
      // Insert
      result = await supabase
        .from("profiles")
        .insert([profileData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    console.log("✅ Perfil salvo com sucesso");

    return {
      profile: result.data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao salvar perfil:", err);
    return {
      profile: null,
      error: err.message || "Erro ao salvar perfil",
    };
  }
};

/*
 Busca o perfil do usuário
*/
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found
      throw error;
    }

    return {
      profile: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao buscar perfil:", err);
    return {
      profile: null,
      error: err.message || "Erro ao carregar perfil",
    };
  }
};
