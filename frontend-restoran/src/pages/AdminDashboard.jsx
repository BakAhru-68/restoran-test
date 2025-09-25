import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [pelanggan, setPelanggan] = useState([]);

  // Helper untuk kapitalisasi nama
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const fetchPelanggan = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:3000/api/pelanggan", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data pelanggan");

        const data = await res.json();
        console.log("Response pelanggan:", data);
        setPelanggan(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPelanggan();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin 👑</h1>
      <h2 className="text-xl mb-2">Daftar Pelanggan:</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Nama</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {pelanggan.map((p, index) => (
            <tr
              key={p.id_pelanggan ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-300 px-4 py-2">{p.id_pelanggan}</td>
              <td className="border border-gray-300 px-4 py-2">{capitalizeWords(p.nama)}</td>
              <td className="border border-gray-300 px-4 py-2">{p.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
