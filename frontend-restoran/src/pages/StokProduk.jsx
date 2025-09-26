import { useEffect, useState } from "react";
import {
  FaUser,
  FaUsers,
  FaBox,
  FaExchangeAlt,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

export default function StokProduk() {
  const navigate = useNavigate();
  const [produk, setProduk] = useState([]);
  const [kategori, setKategori] = useState([]);

  const [namaProduk, setNamaProduk] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [idKategori, setIdKategori] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProduk();
    fetchKategori();
  }, []);

  const fetchProduk = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/produk");
      setProduk(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal fetch produk:", err);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/kategori");
      setKategori(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal fetch kategori:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Tambah atau Update Produk
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3000/api/produk/${editId}`, {
          nama_produk: namaProduk,
          harga: Number(harga),
          stok: Number(stok),
          id_kategori: Number(idKategori),
        });
      } else {
        await axios.post("http://localhost:3000/api/produk", {
          nama_produk: namaProduk,
          harga: Number(harga),
          stok: Number(stok),
          id_kategori: Number(idKategori),
        });
      }
      setNamaProduk("");
      setHarga("");
      setStok("");
      setIdKategori("");
      setEditId(null);
      fetchProduk();
    } catch (err) {
      console.error("Gagal simpan produk:", err);
    }
  };

  // ✅ Hapus Produk
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/produk/${id}`);
      fetchProduk();
    } catch (err) {
      console.error("Gagal hapus produk:", err);
    }
  };

  // ✅ Edit Produk
  const handleEdit = (item) => {
    setEditId(item.id_produk);
    setNamaProduk(item.nama_produk);
    setHarga(item.harga);
    setStok(item.stok);
    setIdKategori(item.id_kategori); // penting agar kategori terpilih saat edit
  };

  const columns = [
    { name: "ID", selector: (row) => row.id_produk, sortable: true, center: true },
    { name: "Nama Produk", selector: (row) => row.nama_produk, sortable: true, center: true },
    { name: "Kategori", selector: (row) => row.nama_kategori, sortable: true, center: true },
    {
      name: "Harga",
      selector: (row) => `Rp ${row.harga.toLocaleString("id-ID")}`,
      sortable: true,
      center: true,
    },
    { name: "Stok", selector: (row) => row.stok, sortable: true, center: true },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-sm btn-warning me-2"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id_produk)}
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3 d-flex flex-column"
        style={{ width: "250px" }}
      >
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
        <button
          onClick={handleLogout}
          className="btn btn-danger mt-auto w-100"
        >
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">📦 Dashboard Stok Produk</h2>

        {/* Form Tambah/Edit */}
        <form className="mb-3" onSubmit={handleSave}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nama Produk"
                value={namaProduk}
                onChange={(e) => setNamaProduk(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Harga"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Stok"
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={idKategori}
                onChange={(e) => setIdKategori(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {kategori.map((kat) => (
                  <option key={kat.id_kategori} value={kat.id_kategori}>
                    {kat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button
                type="submit"
                className={`btn ${editId ? "btn-warning" : "btn-success"} w-100`}
              >
                {editId ? "Update Produk" : (
                  <>
                    <FaPlus /> Tambah
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Tabel Produk */}
        <DataTable
          columns={columns}
          data={produk}
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
