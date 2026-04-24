require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const jobRoutes = require('./routes/jobs');
const applyRoutes = require('./routes/apply');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/jobs', jobRoutes);
app.use('/apply', applyRoutes);
app.use('/admin', adminRoutes);

app.get('/', (_req, res) => res.json({ message: 'JobHunt India API v1.0', status: 'running' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── DB + Start ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection failed, falling back to in-memory store:', err.message);
      startWithFallback();
    });
} else {
  console.log('⚠️  No MONGO_URI found — using in-memory JSON store');
  startWithFallback();
}

function startWithFallback() {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (in-memory mode)`));
}
