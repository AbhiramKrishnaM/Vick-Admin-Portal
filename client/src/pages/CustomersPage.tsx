import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { listCustomers, type Customer } from "@/lib/customer";
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

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <CustomerFormDialog onCreated={loadCustomers} />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No customers yet.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    {customer.phone_number}
                    {customer.second_phone_number
                      ? ` / ${customer.second_phone_number}`
                      : ""}
                  </TableCell>
                  <TableCell>{customer.connection_types.join(", ")}</TableCell>
                  <TableCell>{customer.plan_type}</TableCell>
                  <TableCell>{customer.status}</TableCell>
                  <TableCell>{customer.payment_method}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
