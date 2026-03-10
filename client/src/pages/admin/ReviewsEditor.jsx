import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ReviewsEditor() {
  const { id } = useParams();
  const { authFetch, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && id !== 'new';

  const [form, setForm] = useState({
    author_name: '',
    rating: '5',
    content: '',
    review_date: new Date().toISOString().split('T')[0],
    published: false,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/admin', { replace: true }); return; }
    if (isEdit) loadReview();
  }, [isLoggedIn, id]);

  async function loadReview() {
    try {
      const res = await authFetch(`/admin/reviews/${id}`);
      if (!res.ok) { navigate('/admin/reviews', { replace: true }); return; }
      const data = await res.json();
      setForm({
        author_name: data.author_name || '',
        rating: String(data.rating || 5),
        content: data.content || '',
        review_date: data.review_date ? data.review_date.split('T')[0] : new Date().toISOString().split('T')[0],
        published: Boolean(data.published),
      });
    } catch {
      setError('Impossible de charger l\'avis.');
    } finally {
      setLoading(false);
    }
  }

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const url = isEdit ? `/admin/reviews/${id}` : '/admin/reviews';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: parseInt(form.rating) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isEdit ? 'Avis mis à jour !' : 'Avis créé !');
        if (!isEdit && data.id) navigate(`/admin/reviews/${data.id}`, { replace: true });
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
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const stars = parseInt(form.rating);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img src="/logo/logo-beige.png" alt="" style={{ height: '36px' }} />
          <h1 className="admin-header__title">
            {isEdit ? 'Modifier l\'avis' : 'Nouvel avis'}
          </h1>
        </div>
        <Link to="/admin/reviews" className="btn btn--outline-light btn--sm">← Retour</Link>
      </header>

      <main className="admin-main">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)', alignItems: 'start' }}>

            {/* Contenu */}
            <div>
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label" htmlFor="author_name">Nom de l'auteur *</label>
                <input
                  id="author_name" name="author_name" type="text"
                  className="form-input" value={form.author_name} onChange={update}
                  placeholder="Marie Dupont" required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label" htmlFor="content">Avis *</label>
                <textarea
                  id="content" name="content"
                  className="form-textarea" value={form.content} onChange={update}
                  placeholder="Contenu de l'avis client…"
                  rows={6} required style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="review_date">Date de l'avis *</label>
                  <input
                    id="review_date" name="review_date" type="date"
                    className="form-input" value={form.review_date} onChange={update}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rating">Note</label>
                  <select id="rating" name="rating" className="form-select" value={form.rating} onChange={update}>
                    <option value="5">⭐⭐⭐⭐⭐ — 5 étoiles</option>
                    <option value="4">⭐⭐⭐⭐ — 4 étoiles</option>
                    <option value="3">⭐⭐⭐ — 3 étoiles</option>
                    <option value="2">⭐⭐ — 2 étoiles</option>
                    <option value="1">⭐ — 1 étoile</option>
                  </select>
                </div>
              </div>

              {/* Aperçu */}
              <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-bg-warm)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Aperçu</p>
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{form.author_name || 'Auteur'}</div>
                <div style={{ color: '#f59e0b', marginBottom: 'var(--space-2)' }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{form.content || 'Contenu de l\'avis…'}</p>
              </div>
            </div>

            {/* Panneau latéral */}
            <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: 'var(--space-6)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
                Publication
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', marginBottom: 'var(--space-6)' }}>
                <input
                  type="checkbox" name="published" checked={form.published} onChange={update}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Publié (visible sur le site)</span>
              </label>

              {error && <p className="form-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
              {success && <div className="form-success" role="status" style={{ marginBottom: 'var(--space-4)' }}>{success}</div>}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving}
                style={{ width: '100%' }}
              >
                {saving ? 'Sauvegarde…' : (isEdit ? 'Mettre à jour' : 'Créer l\'avis')}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
