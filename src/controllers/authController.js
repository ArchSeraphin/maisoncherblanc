const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(adminId) {
  const accessToken = jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: adminId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Email ou mot de passe invalide' });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const { accessToken, refreshToken } = generateTokens(admin.id);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [admin.id, tokenHash, expiresAt]
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function refresh(req, res) {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token manquant' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokenHash = hashToken(refreshToken);

    const [rows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()',
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }

    await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.id);
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [payload.id, newHash, expiresAt]
    );

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token invalide' });
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]).catch(() => {});
  }
  res.clearCookie('refresh_token');
  return res.json({ message: 'Déconnecté' });
}

module.exports = { login, refresh, logout, loginValidation };
