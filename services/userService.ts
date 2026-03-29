import { LoginCredentials, AuthResponse } from "../types/auth";
import { supabase } from "../services/supabase";
import { Settings, UpdateSettingsData } from "../types/settings";

export class UserService {
  async loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
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
  }

  async registerWithEmail(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }): Promise<AuthResponse> {
    let userId: string | null = null;

    try {
      console.log("🔵 Iniciando cadastro:", data.email);

      // 🔍 1️⃣ Verificar se email já existe em profiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", data.email)
        .maybeSingle();

      if (profileCheckError) {
        console.error("❌ Erro ao verificar profile:", profileCheckError);
        return {
          user: null,
          error: "Erro ao verificar usuário.",
        };
      }

      if (existingProfile) {
        console.log("⚠️ Email já cadastrado em profiles");

        return {
          user: null,
          error: "Este e-mail já está cadastrado",
        };
      }

      // 2️⃣ Criar usuário no Auth
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
        console.error("❌ Erro no auth:", authError);

        if (authError.message.includes("already registered")) {
          return {
            user: null,
            error: "Este e-mail já está cadastrado",
          };
        }

        return {
          user: null,
          error: authError.message,
        };
      }

      if (!authData.user) {
        console.error("❌ Usuário não retornado");
        return {
          user: null,
          error: "Erro ao criar conta. Tente novamente.",
        };
      }

      userId = authData.user.id;

      console.log("🟢 Usuário criado:", userId);

      // 3️⃣ Criar PROFILE
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        name: data.name,
        email: data.email,
      });

      if (profileError) {
        console.error("❌ Erro ao criar profile:", profileError);

        await supabase.from("profiles").delete().eq("id", userId);

        return {
          user: null,
          error: "Erro ao criar perfil do usuário.",
        };
      }

      console.log("🟢 Profile criado");

      // 4️⃣ Criar SETTINGS
      const { error: settingsError } = await supabase.from("settings").insert({
        user_id: userId,
        company_name: data.company_name,
        color_primary: "#3b83f6b9",
      });

      if (settingsError) {
        console.error("❌ Erro ao criar settings:", settingsError);

        await supabase.from("profiles").delete().eq("id", userId);
        await supabase.from("settings").delete().eq("user_id", userId);

        return {
          user: null,
          error: "Erro ao configurar conta.",
        };
      }

      console.log("🟢 Settings criado");

      console.log("✅ Cadastro finalizado");

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          created_at: authData.user.created_at,
        },
        error: null,
      };
    } catch (err) {
      console.error("🔥 Erro inesperado:", err);

      if (userId) {
        console.log("⚠️ Executando rollback...");

        await supabase.from("profiles").delete().eq("id", userId);
        await supabase.from("settings").delete().eq("user_id", userId);
      }

      return {
        user: null,
        error: "Erro inesperado. Tente novamente.",
      };
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.error("Erro ao buscar sessão:", err);
      return null;
    }
  }

  async fetchUserBudgets(userId: string) {
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
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      return { success: false };
    }
  }

  async updateUserProfile(profilesData, settingsData) {
    try {
      console.log("💾 Salvando perfil...", profilesData, settingsData);

      // Atualiza dados da tabela profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profilesData)
        .eq("id", profilesData.id);

      if (profileError) throw profileError;

      // Insere ou atualiza settings automaticamente
      const { data, error: settingsError } = await supabase
        .from("settings")
        .upsert(settingsData, { onConflict: "user_id" })
        .select()
        .single();

      if (settingsError) throw settingsError;

      console.log("✅ Perfil salvo com sucesso");

      return {
        profile: data,
        error: null,
      };
    } catch (err: any) {
      console.error("❌ Erro ao salvar perfil:", err);

      return {
        profile: null,
        error: err.message || "Erro ao salvar perfil",
      };
    }
  }

  async fetchUserProfile(userId: string) {
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
  }

  async fetchUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found
        throw error;
      }

      return {
        setting: data,
        error: null,
      };
    } catch (err: any) {
      console.error("❌ Erro ao buscar configurações:", err);
      return {
        profile: null,
        error: err.message || "Erro ao carregar configurações",
      };
    }
  }
}
