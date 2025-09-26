import { useEffect, useState } from "react";
import { FaUser, FaUsers, FaBox, FaExchangeAlt, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom"; // ✅ pakai Link
import DataTable from "react-data-table-component";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admins");
        console.log("API Admins:", res.data);

        // kalau backend return { data: [...] }
        const data = res.data.data || res.data;

        // tambahkan field "aktif" biar tabel tidak error
        const mapped = data.map((a) => ({
          ...a,
          aktif: true,
        }));

        setAdmins(mapped);
      } catch (err) {
        console.error("Gagal fetch admins:", err);
      }
    };

    fetchAdmins();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const columns = [
    { name: "ID Admin", selector: (row) => row.id_admin, sortable: true, center: true },
    { name: "Nama", selector: (row) => row.nama, sortable: true, center: true },
    {
      name: "Status Akun",
      cell: (row) =>
        row.aktif ? (
          <span className="badge bg-primary">Aktif</span>
        ) : (
          <span className="badge bg-secondary">Non-aktif</span>
        ),
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3 d-flex flex-column" style={{ width: "250px" }}>
        <h4 className="mb-4">Admin Panel</h4>
        <ul className="nav flex-column flex-grow-1">
          <li className="nav-item mb-2">
            <Link to="/admin/dashboard" className="nav-link text-white">
              <FaUser className="me-2" /> Admin
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/users" className="nav-link text-white">
              <FaUsers className="me-2" /> Users
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/products" className="nav-link text-white">
              <FaBox className="me-2" /> Stok Produk
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/transactions" className="nav-link text-white">
              <FaExchangeAlt className="me-2" /> Detail Transaksi
            </Link>
          </li>
        </ul>
        <button onClick={handleLogout} className="btn btn-danger mt-auto w-100">
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">Daftar Akun Admin</h2>
        <DataTable
          columns={columns}
          data={admins}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={{
            headCells: {
              style: { fontWeight: "bold", fontSize: "14px", textAlign: "center", justifyContent: "center" },
            },
            cells: {
              style: { fontSize: "13px", textAlign: "center", justifyContent: "center" },
            },
          }}
        />
      </div>
    </div>
  );
}
