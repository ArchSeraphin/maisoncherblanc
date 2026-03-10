# Maison Cherblanc — Site vitrine + Dashboard Admin

Site vitrine et dashboard admin pour **Maison Cherblanc**, traiteur boucherie charcuterie à Roanne.

**Stack :** Node.js 18+ / Express 4 · React 18 + Vite 5 · MySQL 8 · Plesk (Passenger)

---

## Installation locale

### Prérequis
- Node.js 18+
- MySQL 8+

### 1. Cloner le dépôt
```bash
git clone https://github.com/ArchSeraphin/maisoncherblanc.git
cd maisoncherblanc
```

### 2. Variables d'environnement
```bash
cp .env.example .env
# Remplir toutes les variables dans .env
```

### 3. Installer les dépendances
```bash
npm install
cd client && npm install && cd ..
```

### 4. Créer les tables MySQL et le compte admin
```bash
node seed/seed.js admin@maisoncherblanc.fr MotDePasse!
```

### 5. Lancer en développement
```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend disponible sur http://localhost:5173
API backend sur http://localhost:3000

---

## Déploiement Plesk

### Workflow GitHub → Plesk

1. **GitHub** : push sur branch `main` (prod) ou `dev` (dev client)
2. **Plesk Git** : configurer le webhook GitHub → branche `main`
3. **Action de déploiement** :
   ```
   npm install && npm run build
   ```
4. **Startup file** : `app.js`
5. **Variables d'environnement** : configurer dans Plesk → Node.js → Environment Variables

### Checklist déploiement
- [ ] Créer base de données MySQL dans Plesk
- [ ] Configurer toutes les variables `.env` dans Plesk
- [ ] Lancer le seed :
  ```bash
  node seed/seed.js admin@maisoncherblanc.fr VotreMotDePasse!
  ```
- [ ] Restart App dans Plesk
- [ ] Vérifier https://maisoncherblanc.fr

---

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Hôte MySQL (localhost) |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_NAME` | Nom de la base de données |
| `DB_PORT` | Port MySQL (3306) |
| `JWT_SECRET` | Secret JWT access token (**min 32 caractères**) |
| `JWT_REFRESH_SECRET` | Secret JWT refresh token (**min 32 caractères, différent du précédent**) |
| `SMTP_HOST` | Hôte SMTP pour les emails |
| `SMTP_PORT` | Port SMTP (587 pour STARTTLS, 465 pour SSL) |
| `SMTP_USER` | Utilisateur SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `CONTACT_EMAIL` | Email de destination des formulaires de contact |
| `ALLOWED_ORIGIN` | URL du site en production (`https://maisoncherblanc.fr`) |
| `NODE_ENV` | `production` en prod, `development` en dev |
| `PORT` | Port Node.js (3000) |

---

## Structure du projet

```
maisoncherblanc/
├── app.js                      # Entry point Passenger
├── .env.example                # Template variables env
├── .htaccess                   # Sécurité + redirections
├── package.json
├── src/
│   ├── config/database.js      # Pool MySQL
│   ├── controllers/
│   │   ├── authController.js   # Login / refresh / logout
│   │   ├── contactController.js
│   │   └── articlesController.js
│   ├── middleware/
│   │   ├── auth.js             # requireAuth JWT
│   │   └── rateLimiter.js      # Rate limiters
│   └── routes/
│       ├── api.js              # Routes publiques /api
│       ├── admin.js            # Routes admin protégées
│       └── sitemap.js          # /sitemap.xml + /robots.txt
├── seed/seed.js                # Init tables + compte admin
├── uploads/                    # Images uploadées (gitignore)
└── client/                     # React + Vite
    ├── index.html
    ├── vite.config.js
    ├── public/
    │   ├── img/                # 46 photos SEO optimisées
    │   ├── logo/               # Logos Maison Cherblanc
    │   ├── favicon.png
    │   └── robots.txt
    └── src/
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ScrollReveal.jsx
        │   └── SEO.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── About.jsx
        │   ├── Services.jsx
        │   ├── Blog.jsx
        │   ├── BlogPost.jsx
        │   ├── Contact.jsx
        │   ├── Legal.jsx
        │   ├── NotFound.jsx
        │   └── admin/
        │       ├── Login.jsx
        │       ├── Dashboard.jsx
        │       └── ArticlesEditor.jsx
        └── styles/main.css
```

---

## URLs importantes

| URL | Description |
|-----|-------------|
| `/` | Page d'accueil |
| `/a-propos` | À propos |
| `/services` | Prestations traiteur |
| `/actualites` | Liste des articles |
| `/actualites/:slug` | Article détail |
| `/contact` | Formulaire de contact |
| `/mentions-legales` | Mentions légales + RGPD |
| `/admin` | Login admin |
| `/admin/dashboard` | Dashboard (protégé) |
| `/admin/articles` | Créer un article (protégé) |
| `/admin/articles/:id` | Modifier un article (protégé) |
| `/sitemap.xml` | Sitemap dynamique |
| `/robots.txt` | Robots.txt |

---

## API Endpoints

### Publics (`/api`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/contact` | Formulaire de contact |
| GET | `/api/articles` | Liste articles publiés |
| GET | `/api/articles/:slug` | Article par slug |

### Admin (Bearer token requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/admin/login` | Connexion |
| POST | `/admin/refresh` | Refresh token |
| POST | `/admin/logout` | Déconnexion |
| GET | `/admin/articles` | Tous les articles |
| GET | `/admin/articles/:id` | Article par ID |
| POST | `/admin/articles` | Créer article |
| PUT | `/admin/articles/:id` | Modifier article |
| DELETE | `/admin/articles/:id` | Supprimer article |
| POST | `/admin/articles/upload` | Upload image → WebP |

---

## SEO

- 46 photos renommées avec des noms SEO optimisés (traiteur roanne, mariage, etc.)
- Composant SEO.jsx avec title, description, canonical, Open Graph, Twitter Card
- Schema.org JSON-LD : LocalBusiness + Article + BreadcrumbList
- Sitemap.xml dynamique incluant toutes les pages statiques + articles publiés
- robots.txt : /admin exclu, sitemap référencé
- Scores cibles : Lighthouse Performance 90+, SEO 100, Accessibilité 90+

---

*Développé par Trinity Studio — mars 2026*
