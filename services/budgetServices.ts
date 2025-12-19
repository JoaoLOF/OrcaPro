import { supabase } from "./supabase";

/**
 * Cria um novo orçamento
 */
export const createBudgetWithItems = async (budgetData: CreateBudgetData) => {
  try {
    console.log("📝 Criando orçamento...", budgetData);

    // 1. Criar o orçamento principal
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .insert([
        {
          nome: budgetData.client_name,
          telefone: budgetData.client_phone,
          email: budgetData.client_email || null,
          title: budgetData.title || null,
          description: budgetData.observations || null,
          status: budgetData.status,
          user_id: budgetData.user_id,
        },
      ])
      .select()
      .single();

    if (budgetError) throw budgetError;

    console.log("✅ Orçamento criado:", budget.id);

    // 2. Criar os itens do orçamento
    if (budgetData.items && budgetData.items.length > 0) {
      const itemsToInsert = budgetData.items.map((item, index) => ({
        budget_id: budget.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        position: index,
      }));

      const { error: itemsError } = await supabase
        .from("budget_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      console.log("✅ Itens criados:", itemsToInsert.length);
    }

    return {
      budget,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao criar orçamento:", err);
    return {
      budget: null,
      error: err.message || "Erro ao criar orçamento",
    };
  }
};

export const fetchUserBudgetsWithItems = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        items:budget_items(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      budgets: data || [],
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao buscar orçamentos:", err);
    return {
      budgets: [],
      error: err.message || "Erro ao carregar orçamentos",
    };
  }
};

export const fetchBudgetById = async (budgetId: string) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        items:budget_items(*)
      `
      )
      .eq("id", budgetId)
      .single();

    if (error) throw error;

    return {
      budget: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao buscar orçamento:", err);
    return {
      budget: null,
      error: err.message || "Erro ao carregar orçamento",
    };
  }
};

export const updateBudget = async (
  budgetId: string,
  data: UpdateBudgetData
) => {
  try {
    const { data: updated, error } = await supabase
      .from("budgets")
      .update(data)
      .eq("id", budgetId)
      .select()
      .single();

    if (error) throw error;

    return {
      budget: updated,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao atualizar orçamento:", err);
    return {
      budget: null,
      error: err.message || "Erro ao atualizar orçamento",
    };
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId);

    if (error) throw error;

    return {
      success: true,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao deletar orçamento:", err);
    return {
      success: false,
      error: err.message || "Erro ao deletar orçamento",
    };
  }
};

export const updateBudgetStatus = async (
  budgetId: string,
  status: BudgetStatus
) => {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .update({ status })
      .eq("id", budgetId)
      .select()
      .single();

    if (error) throw error;

    return {
      budget: data,
      error: null,
    };
  } catch (err: any) {
    console.error("❌ Erro ao atualizar status:", err);
    return {
      budget: null,
      error: err.message || "Erro ao atualizar status",
    };
  }
};
