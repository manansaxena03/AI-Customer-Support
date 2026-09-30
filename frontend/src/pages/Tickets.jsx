import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        setTickets(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Tickets</h1>
        {user.role === 'customer' && (
          <Link to="/tickets/new" className="btn">Create Ticket</Link>
        )}
      </div>

      <div className="card">
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0' }}>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '500' }}>{ticket.subject}</td>
                  <td>{ticket.category}</td>
                  <td><span className="badge badge-Neutral">{ticket.status}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default Tickets;