import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 9;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles?page=${page}&limit=${LIMIT}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger les actualités.');
        setLoading(false);
      });
  }, [page]);

  return (
    <>
      <SEO
        title="Actualités — Traiteur Maison Cherblanc Roanne"
        description="Suivez les actualités de Maison Cherblanc : nouvelles prestations, événements réalisés, conseils gastronomiques et inspirations pour votre mariage ou réception en Loire."
        canonical="/actualites"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Actualités Maison Cherblanc',
          url: 'https://maisoncherblanc.fr/actualites',
          author: { '@type': 'Organization', name: 'Maison Cherblanc' },
        }}
      />

      <div style={{ paddingTop: '72px' }} />

      <header className="page-header">
        <div className="container">
          <p className="page-header__eyebrow">Actualités & Inspirations</p>
          <h1 className="page-header__title">Le blog de Maison Cherblanc</h1>
          <p className="page-header__subtitle">
            Découvrez nos dernières réalisations, conseils gastronomiques
            et inspirations pour vos événements.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="flex-center" style={{ minHeight: '300px' }}>
              <div className="spinner" role="status" aria-label="Chargement des articles…" />
            </div>
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-16)' }}>{error}</p>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Aucun article publié pour le moment.
              </p>
              <Link to="/contact" className="btn btn--primary">Contactez-nous</Link>
            </div>
          ) : (
            <>
              <div className="news-grid">
                {articles.map((article, i) => (
                  <ScrollReveal key={article.id} delay={i * 60}>
                    <article className="card">
                      {article.image_url && (
                        <div className="card__image">
                          <img
                            src={article.image_url}
                            alt={`Actualité : ${article.title} — Maison Cherblanc Roanne`}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="card__body">
                        <p className="card__label">Actualité</p>
                        <h2 className="card__title">
                          <Link to={`/actualites/${article.slug}`} className="card-stretched-link">
                            {article.title}
                          </Link>
                        </h2>
                        {article.excerpt && <p className="card__excerpt">{article.excerpt}</p>}
                        <div className="card__meta">
                          <time dateTime={article.published_at}>
                            {formatDate(article.published_at)}
                          </time>
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>

              {/* Pagination */}
              {total > LIMIT && (
                <div className="flex-center" style={{ marginTop: 'var(--space-12)', gap: 'var(--space-3)' }}>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Précédent
                  </button>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Page {page} / {Math.ceil(total / LIMIT)}
                  </span>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * LIMIT >= total}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
