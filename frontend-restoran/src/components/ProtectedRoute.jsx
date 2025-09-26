import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Belum login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role tidak sesuai
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
