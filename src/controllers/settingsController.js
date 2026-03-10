const db = require('../config/database');

const ALLOWED_PUBLIC_KEYS = ['ga_id'];

async function getPublic(req, res) {
  const { key } = req.params;
  if (!ALLOWED_PUBLIC_KEYS.includes(key)) return res.status(404).json({ error: 'Not found' });
  try {
    const [rows] = await db.execute('SELECT value FROM settings WHERE key_name = ?', [key]);
    res.json({ value: rows[0]?.value || null });
  } catch {
    res.json({ value: null });
  }
}

async function getAll(req, res) {
  try {
    const [rows] = await db.execute('SELECT * FROM settings ORDER BY key_name');
    const obj = {};
    rows.forEach(r => { obj[r.key_name] = r.value; });
    res.json(obj);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function upsert(req, res) {
  const { key } = req.params;
  const { value } = req.body;
  if (!key || typeof value === 'undefined') return res.status(400).json({ error: 'Paramètres manquants' });
  try {
    await db.execute(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      [key, value, value]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getPublic, getAll, upsert };
