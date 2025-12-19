import { createClient } from "@supabase/supabase-js";
import { LoginCredentials, AuthResponse } from "../types/auth";
import {
  CreateBudgetData,
  UpdateBudgetData,
  BudgetStatus,
} from "../types/budget";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
