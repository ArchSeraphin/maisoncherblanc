const express = require('express');
const router = express.Router();
const { contactLimiter } = require('../middleware/rateLimiter');
const { sendContact, contactValidation } = require('../controllers/contactController');
const { listPublic, getBySlug } = require('../controllers/articlesController');

// ─── Contact ──────────────────────────────────────────────────────────────────
router.post('/contact', contactLimiter, contactValidation, sendContact);

// ─── Articles publics ─────────────────────────────────────────────────────────
router.get('/articles', listPublic);
router.get('/articles/:slug', getBySlug);

module.exports = router;
