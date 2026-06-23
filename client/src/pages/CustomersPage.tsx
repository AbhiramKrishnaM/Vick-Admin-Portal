import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { CustomerFormDialog } from "@/components/CustomerFormDialog";
import { ApiError, clearToken } from "@/lib/api";
import {
  deleteCustomer,
  formatConnectionTypes,
  formatPaymentMethod,
  listCustomers,
  type Customer,
} from "@/lib/customer";
import { toast } from "sonner";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      setCustomers(await listCustomers());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleDelete(customer: Customer) {
    if (!window.confirm(`Delete customer "${customer.name}"?`)) {
      return;
    }
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted");
      loadCustomers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      toast.error("Failed to delete customer");
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <CustomerFormDialog
          onSaved={loadCustomers}
          trigger={<Button>New Customer</Button>}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No customers yet.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    {customer.phone_number}
                    {customer.second_phone_number
                      ? ` / ${customer.second_phone_number}`
                      : ""}
                  </TableCell>
                  <TableCell>{formatConnectionTypes(customer.connection_types)}</TableCell>
                  <TableCell>{customer.plan_type}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span
                        className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                          customer.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {customer.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatPaymentMethod(customer.payment_method)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <CustomerFormDialog
                        customer={customer}
                        onSaved={loadCustomers}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
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
