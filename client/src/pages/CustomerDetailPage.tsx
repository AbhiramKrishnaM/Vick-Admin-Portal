import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, clearToken } from "@/lib/api";
import { getCustomerById, type Customer, PAYMENT_METHODS } from "@/lib/customer";
import {
  listInternetPayments,
  updateInternetPayment,
  type InternetPayment,
} from "@/lib/internetPayment";
import {
  listCablePayments,
  recordCablePayment,
  type CablePayment,
} from "@/lib/cablePayment";
import { toast } from "sonner";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Internet Tab ────────────────────────────────────────────────────────────

function InternetTab({ customerId }: { customerId: number }) {
  const [payments, setPayments] = useState<InternetPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPayments(await listInternetPayments(customerId));
    } catch {
      toast.error("Failed to load internet payments");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(payment: InternetPayment, status: string) {
    try {
      const updated = await updateInternetPayment(payment.id, {
        status: status as "paid" | "unpaid",
        paid_at: status === "paid" ? new Date().toISOString() : null,
      });
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? updated : p)));
      toast.success("Updated");
    } catch {
      toast.error("Failed to update payment");
    }
  }

  async function handleMethodChange(payment: InternetPayment, method: string) {
    try {
      const updated = await updateInternetPayment(payment.id, { payment_method: method });
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? updated : p)));
      toast.success("Updated");
    } catch {
      toast.error("Failed to update payment");
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period Start</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Paid At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No records yet.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDate(p.period_start)}</TableCell>
                <TableCell>{formatDate(p.due_date)}</TableCell>
                <TableCell>₹{p.amount}</TableCell>
                <TableCell>
                  <Select value={p.status} onValueChange={(v) => handleStatusChange(p, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={p.payment_method ?? ""}
                    onValueChange={(v) => handleMethodChange(p, v)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.paid_at ? formatDate(p.paid_at) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Cable Tab ────────────────────────────────────────────────────────────────

function RecordPaymentDialog({
  customerId,
  onRecorded,
}: {
  customerId: number;
  onRecorded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await recordCablePayment(customerId, Number(amount), method);
      toast.success("Payment recorded");
      setOpen(false);
      setAmount("");
      setMethod("");
      onRecorded();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Record Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Cable Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !method}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CableTab({ customerId }: { customerId: number }) {
  const [payments, setPayments] = useState<CablePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPayments(await listCablePayments(customerId));
    } catch {
      toast.error("Failed to load cable payments");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <RecordPaymentDialog customerId={customerId} onRecorded={load} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period Start</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Paid At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No records yet.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.period_start)}</TableCell>
                  <TableCell>{formatDate(p.due_date)}</TableCell>
                  <TableCell>₹{p.amount_due}</TableCell>
                  <TableCell>₹{p.amount_paid}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${p.pending > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      ₹{p.pending}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.payment_method ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.paid_at ? formatDate(p.paid_at) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerById(Number(id))
      .then(setCustomer)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login", { replace: true });
        } else {
          toast.error("Failed to load customer");
          navigate("/customers", { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!customer) return null;

  const hasInternet = customer.connection_types.includes("internet");
  const hasCable = customer.connection_types.includes("cable");
  const defaultTab = hasInternet ? "internet" : "cable";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4">
      <div className="flex items-center gap-3">
        <Link to="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">{customer.address}</p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {hasInternet && <TabsTrigger value="internet">Internet</TabsTrigger>}
          {hasCable && <TabsTrigger value="cable">Cable</TabsTrigger>}
        </TabsList>

        {hasInternet && (
          <TabsContent value="internet">
            <InternetTab customerId={customer.id} />
          </TabsContent>
        )}
        {hasCable && (
          <TabsContent value="cable">
            <CableTab customerId={customer.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
