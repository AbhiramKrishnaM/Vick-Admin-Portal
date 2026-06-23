import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONNECTION_TYPES,
  ID_PROOF_TYPES,
  PAYMENT_METHODS,
  createCustomer,
  updateCustomer,
  type Customer,
  type CustomerInput,
} from "@/lib/customer";
import { PLAN_CATEGORIES, listPlans, type Plan } from "@/lib/plan";
import { ApiError } from "@/lib/api";

const emptyForm: CustomerInput = {
  name: "",
  address: "",
  id_proof_type: "",
  phone_number: "",
  second_phone_number: "",
  connection_types: [],
  plan_type: "",
  status: "",
  payment_method: "",
  cable_amount: null,
};

function formFromCustomer(customer: Customer): CustomerInput {
  return {
    name: customer.name,
    address: customer.address,
    id_proof_type: customer.id_proof_type,
    phone_number: customer.phone_number,
    second_phone_number: customer.second_phone_number ?? "",
    connection_types: customer.connection_types,
    plan_type: customer.plan_type,
    status: customer.status,
    payment_method: customer.payment_method,
    cable_amount: customer.cable_amount,
  };
}

interface CustomerFormDialogProps {
  customer?: Customer;
  trigger: ReactNode;
  onSaved: () => void;
}

export function CustomerFormDialog({ customer, trigger, onSaved }: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerInput>(
    customer ? formFromCustomer(customer) : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planCategory, setPlanCategory] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const initialForm = customer ? formFromCustomer(customer) : emptyForm;
      setForm(initialForm);
      setError(null);
      listPlans()
        .then((loadedPlans) => {
          setPlans(loadedPlans);
          const matchedPlan = loadedPlans.find((plan) => plan.name === initialForm.plan_type);
          setPlanCategory(matchedPlan?.category ?? "");
        })
        .catch(() => setPlans([]));
    }
    setOpen(nextOpen);
  }

  const categoryPlans = plans.filter((plan) => plan.category === planCategory);

  function toggleConnectionType(value: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      connection_types: checked
        ? [...prev.connection_types, value]
        : prev.connection_types.filter((type) => type !== value),
      cable_amount: value === "cable" && !checked ? null : prev.cable_amount,
      plan_type: value === "internet" && !checked ? "" : prev.plan_type,
    }));
    if (value === "internet" && !checked) setPlanCategory("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: CustomerInput = { ...form };
      if (!payload.second_phone_number) {
        delete (payload as Partial<CustomerInput>).second_phone_number;
      }
      if (!payload.plan_type) {
        payload.plan_type = null;
      }
      if (customer) {
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
        setForm(emptyForm);
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>ID Proof</Label>
            <Select
              value={form.id_proof_type}
              onValueChange={(value) => setForm({ ...form, id_proof_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID proof" />
              </SelectTrigger>
              <SelectContent>
                {ID_PROOF_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="second_phone_number">Second Phone Number</Label>
            <Input
              id="second_phone_number"
              value={form.second_phone_number ?? ""}
              onChange={(e) =>
                setForm({ ...form, second_phone_number: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Connection Type</Label>
            <div className="flex gap-4">
              {CONNECTION_TYPES.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`connection-${option.value}`}
                    checked={form.connection_types.includes(option.value)}
                    onCheckedChange={(checked) =>
                      toggleConnectionType(option.value, checked === true)
                    }
                  />
                  <Label htmlFor={`connection-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {form.connection_types.includes("cable") && (
            <div className="flex flex-col gap-2">
              <Label>Cable Plan</Label>
              <Select
                value={form.cable_amount?.toString() ?? ""}
                onValueChange={(v) => setForm({ ...form, cable_amount: Number(v) })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cable plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">₹200 / month</SelectItem>
                  <SelectItem value="250">₹250 / month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {form.connection_types.includes("internet") && (
          <div className="flex flex-col gap-2">
            <Label>Plan Category</Label>
            <Select
              value={planCategory}
              onValueChange={(value) => {
                setPlanCategory(value);
                setForm({ ...form, plan_type: "" });
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan category" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}

          {form.connection_types.includes("internet") && planCategory && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan_type">Plan</Label>
            <Select
              value={form.plan_type}
              onValueChange={(value) => setForm({ ...form, plan_type: value })}
              disabled={!planCategory}
              required
            >
              <SelectTrigger id="plan_type">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {categoryPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.name}>
                    {plan.name} — {plan.speed} — ₹{plan.amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Not Active">Not Active</SelectItem>
              </SelectContent>
            </Select>
            {form.status && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    form.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      form.status === "Active"
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                  {form.status}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Payment Method</Label>
            <Select
              value={form.payment_method}
              onValueChange={(value) => setForm({ ...form, payment_method: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                loading ||
                form.connection_types.length === 0 ||
                (form.connection_types.includes("internet") && !form.plan_type) ||
                (form.connection_types.includes("cable") && !form.cable_amount)
              }
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
