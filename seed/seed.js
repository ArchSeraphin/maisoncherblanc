require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node seed/seed.js admin@maisoncherblanc.fr MotDePasse!');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Le mot de passe doit faire au moins 8 caractères');
  process.exit(1);
}

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  console.log('Connecté à MySQL');

  // ─── Tables ────────────────────────────────────────────────────────────────
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token_hash (token_hash),
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      content_html LONGTEXT,
      image_url VARCHAR(512),
      published TINYINT(1) NOT NULL DEFAULT 0,
      published_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_published (published, published_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_name VARCHAR(200) NOT NULL,
      rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      review_date DATE NOT NULL,
      published TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_published (published, review_date)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key_name VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log('Tables créées');

  // ─── Admin ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await conn.execute('SELECT id FROM admins WHERE email = ?', [email]);
  if (existing.length) {
    await conn.execute('UPDATE admins SET password_hash = ? WHERE email = ?', [passwordHash, email]);
    console.log(`Admin mis à jour : ${email}`);
  } else {
    await conn.execute(
      'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    console.log(`Admin créé : ${email}`);
  }

  // ─── Article de démonstration ──────────────────────────────────────────────
  const [articles] = await conn.execute('SELECT id FROM articles LIMIT 1');
  if (!articles.length) {
    await conn.execute(`
      INSERT INTO articles (title, slug, excerpt, content_html, published, published_at)
      VALUES (?, ?, ?, ?, 1, NOW())
    `, [
      'Bienvenue chez Maison Cherblanc',
      'bienvenue-chez-maison-cherblanc',
      'Découvrez notre savoir-faire artisanal de traiteur, boucherie et charcuterie à Roanne.',
      '<p>Maison Cherblanc est votre partenaire gourmand pour tous vos événements à Roanne et dans la Loire. Nous mettons notre expertise au service de vos mariages, repas d\'associations et réceptions privées.</p><p>Découvrez notre gamme complète de prestations : cocktails dinatoires, plateaux de charcuterie et fromages, pièces de bœuf cuites au barbecue, et bien plus encore.</p>',
    ]);
    console.log('Article de démonstration créé');
  }

  await conn.end();
  console.log('\n✓ Seed terminé avec succès !');
  console.log(`\nAccès admin : email=${email}`);
}

seed().catch(err => {
  console.error('Erreur seed:', err.message);
  process.exit(1);
});
