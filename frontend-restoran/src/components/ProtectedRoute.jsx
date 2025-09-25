import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // kalau tidak ada token → lempar balik ke /login
    return <Navigate to="/login" replace />;
  }

  return children;
}
