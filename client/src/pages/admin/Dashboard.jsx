import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

export default function Dashboard() {
  const { authFetch, logout, admin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/admin', { replace: true }); return; }
    loadArticles();
  }, [isLoggedIn]);

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await authFetch('/admin/articles');
      if (!res.ok) throw new Error();
      setArticles(await res.json());
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Supprimer l'article "${title}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    try {
      const res = await authFetch(`/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) setArticles(a => a.filter(x => x.id !== id));
      else alert('Erreur lors de la suppression');
    } catch {
      alert('Erreur réseau');
    } finally {
      setDeleting(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img src="/logo/logo-beige.png" alt="" style={{ height: '36px' }} />
          <h1 className="admin-header__title">Maison Cherblanc — Admin</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to="/admin/reviews" className="btn btn--outline-light btn--sm">Avis clients</Link>
            <Link to="/admin/analytics" className="btn btn--outline-light btn--sm">Analytics</Link>
          </div>
          {admin && (
            <span style={{ color: 'var(--color-secondary)', fontSize: 'var(--text-sm)' }}>
              {admin.email}
            </span>
          )}
          <button onClick={handleLogout} className="btn btn--outline-light btn--sm">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>
              Gestion des articles
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <Link to="/admin/articles" className="btn btn--primary">
            + Nouvel article
          </Link>
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
                  <th>Titre</th>
                  <th>Slug</th>
                  <th>Statut</th>
                  <th>Publié le</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
                      Aucun article. <Link to="/admin/articles" style={{ color: 'var(--color-accent)' }}>Créer le premier</Link>
                    </td>
                  </tr>
                ) : articles.map(article => (
                  <tr key={article.id}>
                    <td style={{ fontWeight: 500, maxWidth: '300px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {article.title}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                      {article.slug}
                    </td>
                    <td>
                      <span className={`status-badge ${article.published ? 'status-badge--published' : 'status-badge--draft'}`}>
                        {article.published ? '✓ Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDate(article.published_at)}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDate(article.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link
                          to={`/admin/articles/${article.id}`}
                          className="btn btn--outline btn--sm"
                        >
                          Modifier
                        </Link>
                        {article.published && (
                          <a
                            href={`/actualites/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--ghost btn--sm"
                          >
                            Voir
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deleting === article.id}
                          className="btn btn--sm"
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                        >
                          {deleting === article.id ? '…' : 'Suppr.'}
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
