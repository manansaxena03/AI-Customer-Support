import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>CX AI — Smart Customer Experience</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
        AI-powered customer experience platform that helps businesses understand customers, respond faster, and identify sentiment.
      </p>
      <div>
        <Link to="/login" className="btn" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/register" className="btn" style={{ background: 'var(--text-main)' }}>Register</Link>
      </div>
    </div>
  );
}
export default Landing;