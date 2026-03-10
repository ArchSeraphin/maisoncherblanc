const { body, validationResult } = require('express-validator');
const xss = require('xss');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const pool = require('../config/database');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(str) {
  return str ? str.replace(/<[^>]*>/g, '').trim() : '';
}

function validateId(id) {
  return /^\d+$/.test(id);
}

function validateImageUrl(url) {
  if (!url) return true;
  return /^(\/uploads\/|\/img\/|https:\/\/)/.test(url);
}

const xssOptions = {
  whiteList: {
    p: [], br: [], strong: [], b: [], em: [], i: [], u: [], s: [],
    h2: [], h3: [], h4: [], ul: [], ol: [], li: [],
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'width', 'height'],
    blockquote: [], pre: [], code: [],
  },
};

function sanitizeHtml(html) {
  return xss(html, xssOptions);
}

// ─── Validation ───────────────────────────────────────────────────────────────
const articleValidation = [
  body('title').trim().isLength({ min: 2, max: 255 }),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('content_html').optional().isString(),
  body('image_url').optional().trim(),
  body('published').optional().isBoolean(),
];

// ─── GET /api/articles ────────────────────────────────────────────────────────
async function listPublic(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 9);
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT id, title, slug, excerpt, image_url, published_at
       FROM articles
       WHERE published = 1
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM articles WHERE published = 1'
    );

    return res.json({ articles: rows, total, page, limit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── GET /api/articles/:slug ──────────────────────────────────────────────────
async function getBySlug(req, res) {
  const slug = req.params.slug?.toLowerCase().trim();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Slug invalide' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE slug = ? AND published = 1',
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Article introuvable' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── GET /admin/articles ──────────────────────────────────────────────────────
async function listAdmin(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, slug, published, published_at, created_at FROM articles ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── GET /admin/articles/:id ──────────────────────────────────────────────────
async function getById(req, res) {
  const { id } = req.params;
  if (!validateId(id)) return res.status(400).json({ error: 'ID invalide' });

  try {
    const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Article introuvable' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── POST /admin/articles ─────────────────────────────────────────────────────
async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Données invalides', details: errors.array() });

  let { title, excerpt, content_html, image_url, published } = req.body;

  if (!validateImageUrl(image_url)) return res.status(400).json({ error: 'URL image invalide' });

  title = stripHtml(title);
  excerpt = excerpt ? stripHtml(excerpt) : null;
  content_html = content_html ? sanitizeHtml(content_html) : null;

  const slug = await generateUniqueSlug(title);
  const isPublished = published ? 1 : 0;
  const publishedAt = isPublished ? new Date() : null;

  try {
    const [result] = await pool.execute(
      `INSERT INTO articles (title, slug, excerpt, content_html, image_url, published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt, content_html, image_url || null, isPublished, publishedAt]
    );
    return res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── PUT /admin/articles/:id ──────────────────────────────────────────────────
async function update(req, res) {
  const { id } = req.params;
  if (!validateId(id)) return res.status(400).json({ error: 'ID invalide' });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Données invalides', details: errors.array() });

  let { title, excerpt, content_html, image_url, published } = req.body;

  if (!validateImageUrl(image_url)) return res.status(400).json({ error: 'URL image invalide' });

  title = stripHtml(title);
  excerpt = excerpt ? stripHtml(excerpt) : null;
  content_html = content_html ? sanitizeHtml(content_html) : null;
  const isPublished = published ? 1 : 0;

  try {
    const [existing] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Article introuvable' });

    const publishedAt = isPublished && !existing[0].published_at ? new Date() : existing[0].published_at;

    await pool.execute(
      `UPDATE articles SET title=?, excerpt=?, content_html=?, image_url=?, published=?, published_at=?, updated_at=NOW()
       WHERE id=?`,
      [title, excerpt, content_html, image_url || null, isPublished, publishedAt, id]
    );
    return res.json({ message: 'Article mis à jour' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── DELETE /admin/articles/:id ───────────────────────────────────────────────
async function remove(req, res) {
  const { id } = req.params;
  if (!validateId(id)) return res.status(400).json({ error: 'ID invalide' });

  try {
    const [rows] = await pool.execute('SELECT image_url FROM articles WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Article introuvable' });

    // Supprimer l'image si uploadée
    const imageUrl = rows[0].image_url;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', imageUrl);
      fs.unlink(filePath, () => {});
    }

    await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    return res.json({ message: 'Article supprimé' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─── POST /admin/articles/upload ─────────────────────────────────────────────
async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });

  try {
    const filename = `article-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, '../../uploads', filename);

    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
  }
}

// ─── Helper : slug unique ─────────────────────────────────────────────────────
async function generateUniqueSlug(title) {
  let base = slugify(title, { lower: true, strict: true, locale: 'fr' });
  let slug = base;
  let i = 1;
  while (true) {
    const [rows] = await pool.execute('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (!rows.length) return slug;
    slug = `${base}-${i++}`;
  }
}

module.exports = {
  listPublic, getBySlug, listAdmin, getById,
  create, update, remove, uploadImage, articleValidation,
};
