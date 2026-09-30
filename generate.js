const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname);
const backendRoot = path.join(projectRoot, 'backend');
const frontendRoot = path.join(projectRoot, 'frontend');

const backendFiles = {
  'package.json': `{
  "name": "ai-cx-backend",
  "version": "1.0.0",
  "description": "Backend for AI Customer Experience",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}`,
  '.env': `PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=super_secret_jwt_key_12345
AI_API_KEY=your_ai_api_key
CLIENT_URL=http://localhost:5173
`,
  'README.md': `# AI Customer Experience - Backend\n\nRun \`npm install\` then \`npm run dev\`.`,
  'src/server.js': `require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
  'src/app.js': `const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Middleware
app.use(errorHandler);

module.exports = app;`,
  'src/middleware/errorMiddleware.js': `exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};`,
  'src/middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token failed' });
  }
};`,
  'src/routes/authRoutes.js': `const express = require('express');
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;`,
  'src/routes/ticketRoutes.js': `const express = require('express');
const { createTicket, getTickets, getTicketById } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);

module.exports = router;`,
  'src/routes/aiRoutes.js': `const express = require('express');
const { analyzeMessage } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeMessage);

module.exports = router;`,
  'src/routes/dashboardRoutes.js': `const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.get('/stats', getStats);

module.exports = router;`,
  'src/controllers/authController.js': `const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock Database
const users = [];

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = { id: Date.now(), name, email, password: hashedPassword, role: role || 'customer' };
    users.push(newUser);
    
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, message: 'Registered successfully', data: { token, user: { id: newUser.id, name, email, role: newUser.role } } });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, message: 'Logged in', data: { token, user: { id: user.id, name: user.name, email, role: user.role } } });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};`,
  'src/controllers/ticketController.js': `const tickets = [];

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message, category } = req.body;
    const newTicket = { id: Date.now(), customer_id: req.user.id, subject, message, category, status: 'Open', created_at: new Date() };
    tickets.push(newTicket);
    res.status(201).json({ success: true, message: 'Ticket created', data: newTicket });
  } catch (error) {
    next(error);
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const userTickets = req.user.role === 'customer' ? tickets.filter(t => t.customer_id === req.user.id) : tickets;
    res.status(200).json({ success: true, data: userTickets });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};`,
  'src/controllers/aiController.js': `const { analyzeTextMock } = require('../services/aiService');

exports.analyzeMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const analysis = analyzeTextMock(message);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};`,
  'src/controllers/dashboardController.js': `exports.getStats = async (req, res, next) => {
  try {
    const stats = {
      totalCustomers: 125,
      totalTickets: 84,
      openTickets: 12,
      resolvedTickets: 72,
      averageResponseTime: '2.4 hours',
      customerSatisfaction: '92%'
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};`,
  'src/services/aiService.js': `exports.analyzeTextMock = (text) => {
  const lowerText = text.toLowerCase();
  let sentiment = 'Neutral';
  let priority = 'Low';
  let intent = 'General Question';
  let category = 'Other';
  let emotion = 'Neutral';

  if (lowerText.includes('late') || lowerText.includes('delay') || lowerText.includes('hasn\\'t arrived')) {
    category = 'Delivery';
    sentiment = 'Negative';
    priority = 'High';
    intent = 'Delayed Order';
    emotion = 'Frustrated';
  } else if (lowerText.includes('broken') || lowerText.includes('not working')) {
    category = 'Product Issue';
    sentiment = 'Negative';
    priority = 'High';
    intent = 'Product Defect';
    emotion = 'Angry';
  } else if (lowerText.includes('excellent') || lowerText.includes('good') || lowerText.includes('great')) {
    sentiment = 'Positive';
    emotion = 'Happy';
    intent = 'Feedback';
    category = 'Feedback';
  }

  const suggestedResponse = sentiment === 'Negative' 
    ? "We sincerely apologize for the inconvenience. We understand how frustrating this can be. Our support team is checking into your issue and will provide an update as soon as possible."
    : "Thank you for reaching out! We are glad to hear from you. If you have any further questions, feel free to ask.";

  return {
    category,
    sentiment,
    priority,
    intent,
    emotion,
    summary: \`Customer is expressing \${sentiment.toLowerCase()} feedback regarding a \${category.toLowerCase()} issue.\`,
    suggestedResponse
  };
};`
};

const frontendFiles = {
  'package.json': `{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "chart.js": "^4.4.3",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}`,
  '.env': `VITE_API_URL=http://localhost:5000/api`,
  'src/index.css': `
:root {
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --bg-color: #F9FAFB;
  --card-bg: #FFFFFF;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border: #E5E7EB;
  --danger: #EF4444;
  --success: #10B981;
  --warning: #F59E0B;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
}
.btn {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.btn:hover { background: var(--primary-hover); }
.card {
  background: var(--card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
}
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid var(--border);
  padding: 1.5rem;
}
.sidebar a {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-main);
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}
.sidebar a:hover {
  background: var(--bg-color);
}
.main-content {
  flex: 1;
  padding: 2rem;
}
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-Negative { background: #FEE2E2; color: #991B1B; }
.badge-Positive { background: #D1FAE5; color: #065F46; }
.badge-Neutral { background: #F3F4F6; color: #374151; }
.badge-High { background: #FEF3C7; color: #92400E; }
  `,
  'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)`,
  'src/App.jsx': `import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes Wrapper could go here */}
      <Route path="/" element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
      </Route>
    </Routes>
  );
}

export default App;`,
  'src/layouts/Layout.jsx': `import { Outlet, Link, useNavigate } from 'react-router-dom';

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
export default Layout;`,
  'src/pages/Landing.jsx': `import { Link } from 'react-router-dom';

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
export default Landing;`,
  'src/pages/Login.jsx': `import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login to CX AI</h2>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;`,
  'src/pages/Register.jsx': `import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Register</h2>
        <form onSubmit={handleRegister}>
          <input className="input" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="agent">Support Agent</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
export default Register;`,
  'src/pages/Dashboard.jsx': `import { useEffect, useState } from 'react';
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
export default Dashboard;`,
  'src/pages/Tickets.jsx': `import { useEffect, useState } from 'react';
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
export default Tickets;`,
  'src/pages/CreateTicket.jsx': `import { useState } from 'react';
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
              <span className={\`badge badge-\${analysis.sentiment}\`} style={{ marginLeft: '0.5rem' }}>{analysis.sentiment}</span>
            </p>
            <p>
              <strong>Priority:</strong> 
              <span className={\`badge badge-\${analysis.priority}\`} style={{ marginLeft: '0.5rem' }}>{analysis.priority}</span>
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
export default CreateTicket;`,
  'src/services/api.js': `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

export default api;`
};

// Create dirs
function createDirs(basePath, fileMap) {
  const dirs = new Set();
  Object.keys(fileMap).forEach(file => {
    const dir = path.dirname(file);
    if (dir !== '.') {
      const fullDir = path.join(basePath, dir);
      if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
    }
  });
}

createDirs(backendRoot, backendFiles);
Object.entries(backendFiles).forEach(([file, content]) => {
  fs.writeFileSync(path.join(backendRoot, file), content.trim());
});

createDirs(frontendRoot, frontendFiles);
Object.entries(frontendFiles).forEach(([file, content]) => {
  fs.writeFileSync(path.join(frontendRoot, file), content.trim());
});

console.log('Project generated successfully!');
