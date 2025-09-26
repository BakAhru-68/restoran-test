import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaBox, FaExchangeAlt, FaSignOutAlt } from "react-icons/fa";
import { Container, Row, Col, Button, Table, Card } from "react-bootstrap";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <Container fluid className="vh-100">
      <Row className="h-100">
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white d-flex flex-column justify-content-between p-3">
          <div>
            <Button variant="light" className="w-100 mb-2 text-start">
              <FaUser /> Admin
            </Button>
            <Button variant="light" className="w-100 mb-2 text-start">
              <FaUsers /> Users
            </Button>
            <Button variant="light" className="w-100 mb-2 text-start">
              <FaBox /> Stok Produk
            </Button>
            <Button variant="light" className="w-100 mb-2 text-start">
              <FaExchangeAlt /> Detail Transaksi
            </Button>
          </div>
          <Button variant="danger" onClick={handleLogout} className="w-100 text-start">
            <FaSignOutAlt /> Logout
          </Button>
        </Col>

        {/* Main Content */}
        <Col md={10} className="bg-light p-4">
          {/* Top bar */}
          <div className="d-flex justify-content-end align-items-center mb-3">
            <FaUser className="me-2" /> <strong>Admin</strong>
          </div>

          {/* Content */}
          <Card>
            <Card.Body>
              <h5 className="mb-3">Daftar Admin</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID Admin</th>
                    <th>Nama</th>
                    <th>Status Akun</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1201212</td>
                    <td>admin</td>
                    <td><span className="badge bg-primary">Aktif</span></td>
                  </tr>
                  <tr>
                    <td>1203232</td>
                    <td>admin2</td>
                    <td><span className="badge bg-secondary">Non-aktif</span></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
