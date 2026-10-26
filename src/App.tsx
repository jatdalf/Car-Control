import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { AuthPage } from "./pages/Auth/AuthPage";
import { Combustible } from "./pages/Combustible/Combustible";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Gastos } from "./pages/Gastos/Gastos";
import { Mantenimiento } from "./pages/Mantenimiento/Mantenimiento";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/resumen" replace />}/>
              <Route path="/resumen" element={<Dashboard />} />
              <Route path="/combustible" element={<Combustible />}/>
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/mantenimiento" element={<Mantenimiento />}/>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/resumen" replace />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;