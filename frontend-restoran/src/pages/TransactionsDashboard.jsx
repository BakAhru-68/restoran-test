import { useEffect, useState } from "react";
import {
  FaUser,
  FaUsers,
  FaBox,
  FaExchangeAlt,
  FaSignOutAlt,
  FaPrint,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TransactionsDashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // filter waktu

  // Fetch data transaksi
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/transaksi");
        setTransactions(res.data.data || res.data || []);
      } catch (err) {
        console.error("Gagal fetch transaksi:", err);
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Filter data sesuai pilihan waktu
  const getFilteredTransactions = () => {
    if (filter === "all") return transactions;

    const now = new Date();
    return transactions.filter((trx) => {
      const trxDate = new Date(trx.tanggal);
      switch (filter) {
        case "day":
          return trxDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return trxDate >= weekAgo;
        case "month":
          return (
            trxDate.getMonth() === now.getMonth() &&
            trxDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return trxDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  // Cetak PDF dengan detail produk & total
  const handlePrintPDF = () => {
    const filtered = getFilteredTransactions();
    const doc = new jsPDF();
    doc.text("Laporan Transaksi", 14, 15);

    const tableColumn = [
      "ID Transaksi",
      "ID Pesanan",
      "Nama Produk",
      "Harga",
      "Qty",
      "Total",
      "Tanggal",
    ];
    const tableRows = [];

    let grandTotal = 0;

    filtered.forEach((trx) => {
      const total = trx.total ? Number(trx.total) : 0;
      grandTotal += total;

      const namaProduk =
        trx.items?.map((i) => i.nama_produk).join(", ") || "-";
      const hargaProduk =
        trx.items
          ?.map((i) => `Rp ${Number(i.harga).toLocaleString("id-ID")}`)
          .join(", ") || "-";
      const qtyProduk = trx.items?.map((i) => i.qty).join(", ") || "-";

      const trxData = [
        trx.id_transaksi,
        trx.id_pesanan,
        namaProduk,
        hargaProduk,
        qtyProduk,
        trx.total ? `Rp ${total.toLocaleString("id-ID")}` : "-",
        trx.tanggal
          ? new Date(trx.tanggal).toLocaleDateString("id-ID")
          : "-",
      ];
      tableRows.push(trxData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    // Tambahkan total di bawah tabel
    doc.text(
      `Total Semua Transaksi: Rp ${grandTotal.toLocaleString("id-ID")}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("laporan-transaksi.pdf");
  };

  // Kolom tabel
  const columns = [
    {
      name: "ID Transaksi",
      selector: (row) => row.id_transaksi,
      sortable: true,
      center: true,
    },
    {
      name: "ID Pesanan",
      selector: (row) => row.id_pesanan,
      sortable: true,
      center: true,
    },
    {
      name: "Nama Produk",
      selector: (row) =>
        row.items?.map((item) => item.nama_produk).join(", ") || "-",
      wrap: true,
      center: true,
    },
    {
      name: "Harga",
      selector: (row) =>
        row.items
          ? row.items
              .map((item) =>
                `Rp ${Number(item.harga).toLocaleString("id-ID")}`
              )
              .join(", ")
          : "-",
      wrap: true,
      center: true,
    },
    {
      name: "Qty",
      selector: (row) =>
        row.items?.map((item) => item.qty).join(", ") || "-",
      center: true,
    },
    {
      name: "Total",
      selector: (row) =>
        row.total ? Number(row.total).toLocaleString("id-ID") : "-",
      sortable: true,
      center: true,
    },
    {
      name: "Tanggal",
      selector: (row) =>
        row.tanggal
          ? new Date(row.tanggal).toLocaleDateString("id-ID")
          : "-",
      sortable: true,
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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Daftar Transaksi</h2>
          <div>
            {/* Pilihan filter */}
            <select
              className="form-select d-inline-block me-2"
              style={{ width: "200px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="day">Hari ini</option>
              <option value="week">1 Minggu</option>
              <option value="month">1 Bulan</option>
              <option value="year">1 Tahun</option>
            </select>
            <button
              className="btn btn-outline-dark"
              onClick={handlePrintPDF}
            >
              <FaPrint className="me-2" /> Cetak Laporan
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={getFilteredTransactions()}
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
