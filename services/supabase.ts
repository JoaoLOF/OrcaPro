import { createClient } from "@supabase/supabase-js";
import { LoginCredentials, AuthResponse } from "../types/auth";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Realiza login com email e senha
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

/**
 * Registra um novo usuário
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

/**
 * Verifica se há uma sessão ativa
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

/**
 * Busca orçamentos do usuário
 */
export const fetchUserBudgets = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("created_by", userId)
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

/**
 * Cria um novo orçamento
 */
export const createBudget = async (budgetData: any) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .insert([budgetData])
      .select()
      .single();

    if (error) throw error;

    return {
      budget: data,
      error: null,
    };
  } catch (err: any) {
    console.error("Erro ao criar orçamento:", err);
    return {
      budget: null,
      error: err.message || "Erro ao criar orçamento",
    };
  }
};

/**
 * Faz logout do usuário
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
