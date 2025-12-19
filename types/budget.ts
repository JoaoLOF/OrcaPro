// src/types/budget.ts

export enum BudgetStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export interface BudgetItem {
  id?: string;
  budget_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  position: number;
}

export interface Budget {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  title?: string;
  observations?: string;
  total_value: number;
  status: BudgetStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: BudgetItem[];
}

export interface CreateBudgetData {
  client_name: string;
  client_phone: string;
  client_email?: string;
  title?: string;
  observations?: string;
  status: BudgetStatus;
  created_by: string;
  items: BudgetItem[];
}

export interface UpdateBudgetData {
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  title?: string;
  observations?: string;
  status?: BudgetStatus;
}
