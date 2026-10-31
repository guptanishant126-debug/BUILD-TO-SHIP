import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initDb } from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import callRoutes from './routes/callRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import enterpriseRoutes from './routes/enterpriseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS Configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate Limiters
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const streamingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Audio stream rate limit reached.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', standardLimiter);
app.use('/api/call/session/:id/stream-chunk', streamingLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ACTIVE',
    service: 'AegisVoice AI Guardian Core',
    version: '2.5.0-production',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/call', callRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/enterprise', enterpriseRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized Error Boundary
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Server Initialization
export const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🛡  AegisVoice AI Guardian Server active on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🔐 Zero-Knowledge Biometric Enclave Online`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;


