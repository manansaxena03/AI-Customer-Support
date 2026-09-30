import { Outlet, Link, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>CX AI</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/tickets">🎫 Tickets</Link>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', marginTop: '2rem' }}>🚪 Logout</button>
        </nav>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
export default Layout;