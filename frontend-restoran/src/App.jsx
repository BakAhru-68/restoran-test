import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UsersDashboard from "./pages/UsersDashboard";
import TransactionsDashboard from "./pages/TransactionsDashboard";
import StokProduk from "./pages/StokProduk";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard users */}
        <Route
          path="/users"
          element={
            <ProtectedRoute role="admin">
              <UsersDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard detail transaksi */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute role="admin">
              <TransactionsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard stok produk */}
        <Route
          path="/products"
          element={
            <ProtectedRoute role="admin">
              <StokProduk />
            </ProtectedRoute>
          }
        />

        {/* Default ke login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
