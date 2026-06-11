import { apiFetch } from "@/lib/api";

export const ID_PROOF_TYPES = [
  { value: "aadhar_card", label: "Aadhar Card" },
  { value: "pan_card", label: "PAN Card" },
  { value: "voter_id", label: "Voter ID" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "ration_card", label: "Ration Card" },
] as const;

export const CONNECTION_TYPES = [
  { value: "cable", label: "Cable" },
  { value: "internet", label: "Internet" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "debit_card", label: "Debit Card" },
  { value: "credit_card", label: "Credit Card" },
  { value: "net_banking", label: "Net Banking" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
] as const;

export interface Customer {
  id: number;
  name: string;
  address: string;
  id_proof_type: string;
  phone_number: string;
  second_phone_number: string | null;
  connection_types: string[];
  plan_type: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export type CustomerInput = Omit<Customer, "id" | "created_at" | "updated_at">;

export function listCustomers() {
  return apiFetch<Customer[]>("/customers");
}

export function createCustomer(data: CustomerInput) {
  return apiFetch<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
