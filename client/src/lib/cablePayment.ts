import { apiFetch } from "@/lib/api";

export interface CablePayment {
  id: number;
  customer_id: number;
  period_start: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  pending: number;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

export function listCablePayments(customerId: number) {
  return apiFetch<CablePayment[]>(`/cable-payments?customer_id=${customerId}`);
}

export function recordCablePayment(customerId: number, amount: number, paymentMethod: string) {
  return apiFetch<CablePayment[]>("/cable-payments/record", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId, amount, payment_method: paymentMethod }),
  });
}
