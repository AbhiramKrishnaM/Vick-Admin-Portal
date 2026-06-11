import { useState } from "react";
import type { FormEvent } from "react";
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
  type CustomerInput,
} from "@/lib/customer";
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
};

export function CustomerFormDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleConnectionType(value: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      connection_types: checked
        ? [...prev.connection_types, value]
        : prev.connection_types.filter((type) => type !== value),
    }));
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
      await createCustomer(payload);
      setForm(emptyForm);
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Customer</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="plan_type">Plan Type</Label>
            <Input
              id="plan_type"
              value={form.plan_type}
              onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            />
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
              disabled={loading || form.connection_types.length === 0}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
