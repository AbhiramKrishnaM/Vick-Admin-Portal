import { apiFetch } from "@/lib/api";

export const PLAN_CATEGORIES = [
  { value: "fup_plans", label: "FUP Plans" },
  { value: "unlimited_plans", label: "Unlimited Plans" },
  { value: "pay_6_months_extra", label: "Pay 6 Months And Get 20 Days Extra" },
  { value: "one_year_plan", label: "1 Year Plan FUP & Unlimited" },
  { value: "lco_combo_plan", label: "LCO Combo Plan" },
] as const;

export interface Plan {
  id: number;
  category: string;
  name: string;
  speed: string;
  fup: string;
  validity: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export type PlanInput = Omit<Plan, "id" | "created_at" | "updated_at">;

export function listPlans() {
  return apiFetch<Plan[]>("/plans");
}

export function createPlan(data: PlanInput) {
  return apiFetch<Plan>("/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePlan(id: number, data: Partial<PlanInput>) {
  return apiFetch<Plan>(`/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deletePlan(id: number) {
  return apiFetch<void>(`/plans/${id}`, {
    method: "DELETE",
  });
}

const PLAN_CATEGORY_LABELS = Object.fromEntries(
  PLAN_CATEGORIES.map((option) => [option.value, option.label]),
);

export function formatPlanCategory(value: string) {
  return PLAN_CATEGORY_LABELS[value] ?? value;
}
