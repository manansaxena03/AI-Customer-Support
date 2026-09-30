import { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user.role === 'admin' || user.role === 'agent') {
      fetchStats();
    }
  }, [user.role]);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Welcome, {user.name}</h1>
      
      {user.role === 'customer' ? (
        <div className="card">
          <h2>Customer Dashboard</h2>
          <p style={{ marginTop: '1rem' }}>Welcome to the customer support portal.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)' }}>Total Tickets</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalTickets || 0}</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)' }}>Open Tickets</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats?.openTickets || 0}</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)' }}>Avg Response</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.averageResponseTime || '-'}</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)' }}>Satisfaction</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats?.customerSatisfaction || '-'}</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(to right, #EEF2FF, #E0E7FF)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>💡 AI Insights</h3>
            <p><strong>Observation:</strong> 42% of recent complaints are related to delivery delays.</p>
            <p><strong>Recommendation:</strong> Review delivery tracking and customer notification processes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;