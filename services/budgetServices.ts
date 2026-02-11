import { supabase } from "./supabase";
import {
  BudgetStatus,
  BudgetItem,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
} from "../types/budget";

const toNumber = (value) => {
  if (value === undefined || value === null) return 0;

  const normalized = value
    .toString()
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");

  const result = Number(normalized);
  return isNaN(result) ? 0 : result;
};

export class BudgetService {
  async createBudgetWithItems(
    budgetData: CreateBudgetData,
    items: BudgetItem[] = [],
  ) {
    let budgetCreated: any = null;

    try {
      // 1️⃣ Criar o orçamento
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .insert([
          {
            user_id: budgetData.created_by,
            title: budgetData.title,
            description: budgetData.description,
            discount: budgetData.discount,
            total_value: budgetData.total_value,
            status: budgetData.status,
            created_at: budgetData.created_at,
            updated_at: budgetData.updated_at,
            client_id: budgetData.client_id,
          },
        ])
        .select("*")
        .single();

      if (budgetError) throw budgetError;

      budgetCreated = budget;

      // 2️⃣ Criar os itens

      if (!Array.isArray(items)) {
        throw new Error("Items não é um array válido");
      }

      if (Array.isArray(items) && items.length > 0) {
        const itemsToInsert = items
          .filter(Boolean) // remove null / undefined
          .map((item, index) => {
            return {
              budget_id: budget.id,
              name: item.name ?? "",
              quantity: toNumber(item.quantity ?? 0),
              unit_price: toNumber(item.unit_price ?? 0),
              total: toNumber(item.total ?? 0),
              created_at: budgetData.created_at,
            };
          });

        const { error: itemsError } = await supabase
          .from("budget_items")
          .insert(itemsToInsert);

        if (itemsError) {
          await supabase.from("budgets").delete().eq("id", budget.id);
          throw itemsError;
        }
      }

      return {
        budget,
        error: null,
      };
    } catch (err: any) {
      console.error("❌ Erro ao criar orçamento:", err);

      // 🛟 segurança extra: se criou o budget mas caiu em outro erro
      if (budgetCreated?.id) {
        await supabase.from("budgets").delete().eq("id", budgetCreated.id);
      }

      return {
        budget: null,
        error: err.message || "Erro ao criar orçamento",
      };
    }
  }

  async fetchUserBudgetsWithItems(userId: string) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
        *,
        items:budget_items(*)
      `,
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
  }

  async fetchBudgetById(budgetId: string) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
        *,
        items:budget_items(*)
      `,
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
  }

  async updateBudget(budgetId: string, data: UpdateBudgetData) {
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
  }

  async deleteBudget(budgetId: string) {
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
  }

  async updateBudgetStatus(budgetId: string, status: BudgetStatus) {
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
  }
}
