import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
