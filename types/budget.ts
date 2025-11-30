export enum BudgetStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export interface Budget {
  id: string;
  title: string;
  client_name: string;
  description: string;
  total_value: number;
  status: BudgetStatus;
  created_by: string;
  created_for?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetListItem {
  id: string;
  title: string;
  client_name: string;
  total_value: number;
  status: BudgetStatus;
  created_at: string;
}

export interface CreateBudgetData {
  title: string;
  client_name: string;
  description: string;
  total_value: number;
  created_by: string;
}
