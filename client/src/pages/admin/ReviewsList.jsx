import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function StarRating({ rating }) {
  return (
    <span style={{ color: '#f59e0b' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function ReviewsList() {
  const { authFetch, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/admin', { replace: true }); return; }
    load();
  }, [isLoggedIn]);

  async function load() {
    setLoading(true);
    try {
      const res = await authFetch('/admin/reviews');
      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer l'avis de "${name}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    try {
      const res = await authFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) setReviews(a => a.filter(x => x.id !== id));
      else alert('Erreur lors de la suppression');
    } catch {
      alert('Erreur réseau');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img src="/logo/logo-beige.png" alt="" style={{ height: '36px' }} />
          <h1 className="admin-header__title">Avis clients</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/admin/dashboard" className="btn btn--outline-light btn--sm">← Articles</Link>
          <Link to="/admin/analytics" className="btn btn--outline-light btn--sm">Analytics</Link>
        </div>
      </header>

      <main className="admin-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>
              Gestion des avis
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              {reviews.length} avis au total
            </p>
          </div>
          <Link to="/admin/reviews/new" className="btn btn--primary">+ Nouvel avis</Link>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: 'var(--space-16)' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Auteur</th>
                  <th>Note</th>
                  <th>Avis</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
                      Aucun avis. <Link to="/admin/reviews/new" style={{ color: 'var(--color-accent)' }}>Ajouter le premier</Link>
                    </td>
                  </tr>
                ) : reviews.map(review => (
                  <tr key={review.id}>
                    <td style={{ fontWeight: 500 }}>{review.author_name}</td>
                    <td><StarRating rating={review.rating} /></td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {review.content}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDate(review.review_date)}
                    </td>
                    <td>
                      <span className={`status-badge ${review.published ? 'status-badge--published' : 'status-badge--draft'}`}>
                        {review.published ? '✓ Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link to={`/admin/reviews/${review.id}`} className="btn btn--outline btn--sm">Modifier</Link>
                        <button
                          onClick={() => handleDelete(review.id, review.author_name)}
                          disabled={deleting === review.id}
                          className="btn btn--sm"
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                        >
                          {deleting === review.id ? '…' : 'Suppr.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
