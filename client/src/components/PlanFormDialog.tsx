import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PLAN_CATEGORIES,
  createPlan,
  updatePlan,
  type Plan,
  type PlanInput,
} from "@/lib/plan";
import { ApiError } from "@/lib/api";

const emptyForm: PlanInput = {
  category: "",
  name: "",
  speed: "",
  fup: "",
  validity: "",
  amount: 0,
};

function formFromPlan(plan: Plan): PlanInput {
  return {
    category: plan.category,
    name: plan.name,
    speed: plan.speed,
    fup: plan.fup,
    validity: plan.validity ?? "",
    amount: plan.amount,
  };
}

interface PlanFormDialogProps {
  plan?: Plan;
  defaultCategory?: string;
  trigger: ReactNode;
  onSaved: () => void;
}

export function PlanFormDialog({ plan, defaultCategory, trigger, onSaved }: PlanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanInput>(
    plan ? formFromPlan(plan) : { ...emptyForm, category: defaultCategory ?? "" }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(plan ? formFromPlan(plan) : { ...emptyForm, category: defaultCategory ?? "" });
      setError(null);
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: PlanInput = { ...form };
      if (!payload.validity) {
        delete (payload as Partial<PlanInput>).validity;
      }
      if (plan) {
        await updatePlan(plan.id, payload);
      } else {
        await createPlan(payload);
        setForm({ ...emptyForm, category: defaultCategory ?? "" });
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
          <DialogTitle>{plan ? "Edit Plan" : "New Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="speed">Speed</Label>
            <Input
              id="speed"
              value={form.speed}
              onChange={(e) => setForm({ ...form, speed: e.target.value })}
              placeholder="e.g. 50Mbps"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fup">FUP</Label>
            <Input
              id="fup"
              value={form.fup}
              onChange={(e) => setForm({ ...form, fup: e.target.value })}
              placeholder="e.g. 4000Gb or UNLIMITED"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="validity">Validity / Notes</Label>
            <Input
              id="validity"
              value={form.validity ?? ""}
              onChange={(e) => setForm({ ...form, validity: e.target.value })}
              placeholder="e.g. FUP, 200 DAYS, 14 MONTH"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
