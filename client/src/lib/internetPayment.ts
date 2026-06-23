import { apiFetch } from "@/lib/api";

export interface InternetPayment {
  id: number;
  customer_id: number;
  period_start: string;
  due_date: string;
  amount: number;
  status: "paid" | "unpaid";
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

export function listInternetPayments(customerId: number) {
  return apiFetch<InternetPayment[]>(`/internet-payments?customer_id=${customerId}`);
}

export function updateInternetPayment(id: number, data: Partial<Pick<InternetPayment, "status" | "payment_method" | "paid_at">>) {
  return apiFetch<InternetPayment>(`/internet-payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
