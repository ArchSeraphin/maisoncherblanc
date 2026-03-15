const db = require('../config/database');
const { validationResult } = require('express-validator');
const { body } = require('express-validator');

// ─── Validation ───────────────────────────────────────────────────────────────
const reviewValidation = [
  body('author_name').trim().isLength({ min: 2, max: 200 }).withMessage('Nom requis'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
  body('content').trim().isLength({ min: 10 }).withMessage('Avis trop court'),
  body('review_date').isDate().withMessage('Date invalide'),
  body('published').optional().isBoolean(),
];

// ─── Public : avis publiés ────────────────────────────────────────────────────
async function listPublic(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT id, author_name, rating, content, review_date FROM reviews WHERE published = 1 ORDER BY review_date DESC LIMIT 20'
    );
    const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : null;
    res.json({ reviews: rows, rating: avg ? parseFloat(avg) : null, total: rows.length });
  } catch (err) {
    console.error('[Reviews]', err);
    res.json({ reviews: [], rating: null, total: 0 });
  }
}

// ─── Admin : liste complète ───────────────────────────────────────────────────
async function listAdmin(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM reviews ORDER BY review_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── Admin : un avis ─────────────────────────────────────────────────────────
async function getById(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const [rows] = await db.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Avis introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── Admin : créer ────────────────────────────────────────────────────────────
async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });
  const { author_name, rating, content, review_date, published = false } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO reviews (author_name, rating, content, review_date, published) VALUES (?, ?, ?, ?, ?)',
      [author_name.trim(), parseInt(rating), content.trim(), review_date, published ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── Admin : modifier ─────────────────────────────────────────────────────────
async function update(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'ID invalide' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });
  const { author_name, rating, content, review_date, published = false } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE reviews SET author_name = ?, rating = ?, content = ?, review_date = ?, published = ? WHERE id = ?',
      [author_name.trim(), parseInt(rating), content.trim(), review_date, published ? 1 : 0, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Avis introuvable' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── Admin : supprimer ────────────────────────────────────────────────────────
async function remove(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    await db.execute('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listPublic, listAdmin, getById, create, update, remove, reviewValidation };
