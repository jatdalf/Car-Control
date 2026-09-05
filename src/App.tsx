import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Combustible } from "./pages/Combustible/Combustible";
import { Gastos } from "./pages/Gastos/Gastos";
import { Mantenimiento } from "./pages/Mantenimiento/Mantenimiento";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/resumen" replace />} />
          <Route path="/resumen" element={<Dashboard />} />
          <Route path="/combustible" element={<Combustible />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
          <Route path="*" element={<Navigate to="/resumen" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;