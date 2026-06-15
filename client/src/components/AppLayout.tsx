import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Users, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/plans", label: "Plans", icon: ListChecks },
];

export function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col border-r p-4">
        <div className="mb-6 px-2 text-lg font-semibold">Vicky Cable</div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut />
          Logout
        </Button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
