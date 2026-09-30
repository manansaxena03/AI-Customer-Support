import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTestAI = async () => {
    if (!message) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze', { message });
      setAnalysis(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', { subject, message, category });
      navigate('/tickets');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div className="card" style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Create New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <input className="input" type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Delivery">Delivery</option>
            <option value="Product Issue">Product Issue</option>
            <option value="Feedback">Feedback</option>
          </select>
          <textarea className="input" placeholder="Your message..." rows="6" value={message} onChange={e => setMessage(e.target.value)} required></textarea>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: 'var(--text-main)' }} onClick={handleTestAI} disabled={loading}>
              {loading ? 'Analyzing...' : 'Test AI Analysis'}
            </button>
            <button type="submit" className="btn">Submit Ticket</button>
          </div>
        </form>
      </div>

      {analysis && (
        <div className="card" style={{ flex: 1, background: '#F8FAFC' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>🤖 AI Analysis Preview</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Intent:</strong> {analysis.intent}</p>
            <p><strong>Category:</strong> {analysis.category}</p>
            <p>
              <strong>Sentiment:</strong> 
              <span className={`badge badge-${analysis.sentiment}`} style={{ marginLeft: '0.5rem' }}>{analysis.sentiment}</span>
            </p>
            <p>
              <strong>Priority:</strong> 
              <span className={`badge badge-${analysis.priority}`} style={{ marginLeft: '0.5rem' }}>{analysis.priority}</span>
            </p>
            <p><strong>Emotion:</strong> {analysis.emotion}</p>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>AI Suggested Agent Reply:</p>
            <p style={{ color: 'var(--text-muted)' }}>"{analysis.suggestedResponse}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
export default CreateTicket;