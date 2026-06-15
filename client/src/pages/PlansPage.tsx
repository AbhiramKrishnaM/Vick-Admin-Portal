import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanFormDialog } from "@/components/PlanFormDialog";
import { ApiError, clearToken } from "@/lib/api";
import { PLAN_CATEGORIES, deletePlan, listPlans, type Plan } from "@/lib/plan";
import { toast } from "sonner";

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await listPlans());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  async function handleDelete(plan: Plan) {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) {
      return;
    }
    try {
      await deletePlan(plan.id);
      toast.success("Plan deleted");
      loadPlans();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      toast.error("Failed to delete plan");
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plans</h1>
        <PlanFormDialog
          onSaved={loadPlans}
          trigger={<Button>New Plan</Button>}
        />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-muted-foreground">No plans yet.</p>
      ) : (
        PLAN_CATEGORIES.map((category) => {
          const categoryPlans = plans.filter((plan) => plan.category === category.value);
          if (categoryPlans.length === 0) {
            return null;
          }
          return (
            <div key={category.value} className="rounded-md border">
              <div className="bg-amber-400 px-4 py-2 font-semibold">
                {category.label}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>FUP</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>{plan.speed}</TableCell>
                      <TableCell>{plan.fup}</TableCell>
                      <TableCell>{plan.validity ?? ""}</TableCell>
                      <TableCell className="text-right">{plan.amount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <PlanFormDialog
                            plan={plan}
                            onSaved={loadPlans}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pencil />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(plan)}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })
      )}
    </div>
  );
}
