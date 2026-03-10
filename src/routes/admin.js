const express = require('express');
const multer = require('multer');
const router = express.Router();
const cookieParser = require('cookie-parser');

const { requireAuth } = require('../middleware/auth');
const { loginLimiter, adminCrudLimiter } = require('../middleware/rateLimiter');
const { login, refresh, logout, loginValidation } = require('../controllers/authController');
const {
  listAdmin, getById, create, update, remove, uploadImage, articleValidation,
} = require('../controllers/articlesController');

router.use(cookieParser());

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// ─── Articles (protégé) ───────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé'));
  },
});

router.get('/articles', requireAuth, listAdmin);
router.get('/articles/:id', requireAuth, getById);
router.post('/articles', requireAuth, adminCrudLimiter, articleValidation, create);
router.put('/articles/:id', requireAuth, adminCrudLimiter, articleValidation, update);
router.delete('/articles/:id', requireAuth, adminCrudLimiter, remove);
router.post('/articles/upload', requireAuth, adminCrudLimiter, upload.single('image'), uploadImage);

module.exports = router;
