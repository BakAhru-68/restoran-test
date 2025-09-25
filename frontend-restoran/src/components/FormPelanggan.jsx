import { useState } from "react";
import "./FormPelanggan.css";

function FormPelanggan() {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [message, setMessage] = useState("");

  // ambil URL dari .env
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/pelanggan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, no_hp: noHp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Data pelanggan berhasil disimpan!");
        setNama("");
        setNoHp("");
      } else {
        setMessage(`❌ Error: ${data.error || "Gagal menyimpan data"}`);
      }
    } catch (err) {
      setMessage("⚠️ Terjadi kesalahan koneksi ke server");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Form Pelanggan</h2>
        <form onSubmit={handleSubmit}>
          <label>Nama</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <label>No HP</label>
          <input
            type="text"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
          />
          <button type="submit">Simpan</button>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}

export default FormPelanggan;
