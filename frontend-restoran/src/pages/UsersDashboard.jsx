import { useEffect, useState } from "react";
import {
  FaUser,
  FaUsers,
  FaBox,
  FaExchangeAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

export default function UsersDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  // Fetch data dari backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/pelanggan");
        console.log("API Users:", res.data);

        // backend return array langsung (sudah ada field status)
        setUsers(res.data);
      } catch (err) {
        console.error("Gagal fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Toggle status user
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/pelanggan/${id}/status`, {
        status: !currentStatus,
      });

      // update state di frontend
      setUsers((prev) =>
        prev.map((u) =>
          u.id_pelanggan === id ? { ...u, status: !currentStatus } : u
        )
      );
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_pelanggan,
      sortable: true,
      center: true,
    },
    {
      name: "Nama",
      selector: (row) => row.nama,
      sortable: true,
      center: true,
    },
    { name: "Email", selector: (row) => row.email, sortable: true, center: true },
    { name: "No. HP", selector: (row) => row.no_hp, sortable: true, center: true },
    {
      name: "Status Akun",
      cell: (row) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            checked={row.status}
            onChange={() => handleToggleStatus(row.id_pelanggan, row.status)}
          />
          <label className="form-check-label">
            {row.status ? "Aktif" : "Non-aktif"}
          </label>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3 d-flex flex-column"
        style={{ width: "250px" }}
      >
        <h4 className="mb-4">User Panel</h4>
        <ul className="nav flex-column flex-grow-1">
          <li className="nav-item mb-2">
            <a href="/admin/dashboard" className="nav-link text-white">
              <FaUser className="me-2" /> Admin
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/users" className="nav-link text-white">
              <FaUsers className="me-2" /> Users
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/products" className="nav-link text-white">
              <FaBox className="me-2" /> Stok Produk
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/transactions" className="nav-link text-white">
              <FaExchangeAlt className="me-2" /> Detail Transaksi
            </a>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="btn btn-danger mt-auto w-100"
        >
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">Daftar Akun User</h2>
        <DataTable
          columns={columns}
          data={users}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={{
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
                textAlign: "center",
                justifyContent: "center",
              },
            },
            cells: {
              style: {
                fontSize: "13px",
                textAlign: "center",
                justifyContent: "center",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
