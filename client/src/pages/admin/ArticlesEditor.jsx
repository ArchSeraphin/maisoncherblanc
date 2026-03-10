import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ArticlesEditor() {
  const { id } = useParams();
  const { authFetch, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content_html: '',
    image_url: '',
    published: false,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/admin', { replace: true }); return; }
    if (isEdit) loadArticle();
  }, [isLoggedIn, id]);

  async function loadArticle() {
    try {
      const res = await authFetch(`/admin/articles/${id}`);
      if (!res.ok) { navigate('/admin/dashboard', { replace: true }); return; }
      const data = await res.json();
      setForm({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content_html: data.content_html || '',
        image_url: data.image_url || '',
        published: Boolean(data.published),
      });
    } catch {
      setError('Impossible de charger l\'article.');
    } finally {
      setLoading(false);
    }
  }

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError('');

    try {
      const res = await authFetch('/admin/articles/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(f => ({ ...f, image_url: data.url }));
      } else {
        setError(data.error || 'Erreur upload');
      }
    } catch {
      setError('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = isEdit ? `/admin/articles/${id}` : '/admin/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isEdit ? 'Article mis à jour !' : 'Article créé !');
        if (!isEdit && data.id) navigate(`/admin/articles/${data.id}`, { replace: true });
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img src="/logo/logo-beige.png" alt="" style={{ height: '36px' }} />
          <h1 className="admin-header__title">
            {isEdit ? 'Modifier l\'article' : 'Nouvel article'}
          </h1>
        </div>
        <Link to="/admin/dashboard" className="btn btn--outline-light btn--sm">
          ← Retour
        </Link>
      </header>

      <main className="admin-main">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)', alignItems: 'start' }}>

            {/* Contenu principal */}
            <div>
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label" htmlFor="title">Titre *</label>
                <input
                  id="title" name="title" type="text"
                  className="form-input" value={form.title} onChange={update}
                  placeholder="Titre de l'article" required
                  style={{ fontSize: 'var(--text-xl)', padding: 'var(--space-4)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label" htmlFor="excerpt">Extrait / Résumé</label>
                <textarea
                  id="excerpt" name="excerpt"
                  className="form-textarea" value={form.excerpt} onChange={update}
                  placeholder="Court résumé affiché dans la liste des articles et les partages sociaux (150-200 mots max)"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content_html">
                  Contenu HTML
                  <span style={{ marginLeft: 'var(--space-2)', fontWeight: 400, color: 'var(--color-text-light)', textTransform: 'none', letterSpacing: 0 }}>
                    (balises autorisées : p, h2-h4, ul/ol/li, strong, em, a, img, blockquote)
                  </span>
                </label>
                <textarea
                  id="content_html" name="content_html"
                  className="form-textarea" value={form.content_html} onChange={update}
                  placeholder="<p>Contenu de l'article...</p>"
                  rows={18}
                  style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Panneau latéral */}
            <div>
              {/* Publication */}
              <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
                  Publication
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', marginBottom: 'var(--space-6)' }}>
                  <input
                    type="checkbox" name="published" checked={form.published} onChange={update}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Publié</span>
                </label>

                {error && (
                  <p className="form-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>
                )}
                {success && (
                  <div className="form-success" role="status" style={{ marginBottom: 'var(--space-4)' }}>{success}</div>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={saving}
                  style={{ width: '100%' }}
                >
                  {saving ? 'Sauvegarde…' : (isEdit ? 'Mettre à jour' : 'Créer l\'article')}
                </button>
              </div>

              {/* Image */}
              <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: 'var(--space-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
                  Image à la une
                </h3>

                {form.image_url && (
                  <div style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img
                      src={form.image_url}
                      alt="Aperçu de l'image à la une"
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor="image_url">URL de l'image</label>
                  <input
                    id="image_url" name="image_url" type="text"
                    className="form-input" value={form.image_url} onChange={update}
                    placeholder="/uploads/image.webp ou https://..."
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block' }}>
                    <span className="btn btn--outline" style={{ width: '100%', cursor: 'pointer', justifyContent: 'center' }}>
                      {uploading ? 'Conversion WebP…' : '📎 Uploader une image'}
                    </span>
                    <input
                      type="file" accept="image/*" onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
                    Convertie automatiquement en WebP (1200×800)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
