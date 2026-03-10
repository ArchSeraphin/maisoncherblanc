const express = require('express');
const router = express.Router();
const { contactLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { sendContact, contactValidation } = require('../controllers/contactController');
const { listPublic, getBySlug } = require('../controllers/articlesController');
const { listPublic: listReviewsPublic } = require('../controllers/reviewsController');
const { getPublic: getSettingPublic } = require('../controllers/settingsController');

// ─── Contact ──────────────────────────────────────────────────────────────────
router.post('/contact', contactLimiter, contactValidation, sendContact);

// ─── Articles publics ─────────────────────────────────────────────────────────
router.get('/articles', listPublic);
router.get('/articles/:slug', getBySlug);

// ─── Avis clients (publiés) ───────────────────────────────────────────────────
router.get('/reviews', listReviewsPublic);

// ─── Settings publics ─────────────────────────────────────────────────────────
router.get('/settings/:key', getSettingPublic);

module.exports = router;
