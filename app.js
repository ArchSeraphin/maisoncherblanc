require('dotenv').config();

// ─── Validation d'environnement ──────────────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) { console.error('FATAL: ' + key + ' manquant'); process.exit(1); }
}
if (process.env.JWT_SECRET.length < 32) { console.error('FATAL: JWT_SECRET trop court (min 32 chars)'); process.exit(1); }
if (process.env.JWT_REFRESH_SECRET.length < 32) { console.error('FATAL: JWT_REFRESH_SECRET trop court (min 32 chars)'); process.exit(1); }

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const { apiLimiter } = require('./src/middleware/rateLimiter');
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');
const sitemapRoutes = require('./src/routes/sitemap');

const app = express();

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://maisoncherblanc.fr',
  credentials: true,
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Fichiers statiques ───────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, apiRoutes);
app.use('/admin', adminRoutes);
app.use('/', sitemapRoutes);

// ─── SPA React (prod) ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Gestion d'erreurs globale ────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur interne' : err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Maison Cherblanc — serveur démarré sur le port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
