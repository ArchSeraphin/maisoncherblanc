import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (r.status === 404) { navigate('/404', { replace: true }); return null; }
        return r.json();
      })
      .then(data => {
        if (data) setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" role="status" aria-label="Chargement de l'article…" />
      </div>
    );
  }

  if (!article) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image_url || 'https://maisoncherblanc.fr/img/buffet-cocktail-traiteur-roanne-maison-cherblanc.jpg',
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': 'Organization', name: 'Maison Cherblanc' },
    publisher: {
      '@type': 'Organization',
      name: 'Maison Cherblanc',
      logo: { '@type': 'ImageObject', url: 'https://maisoncherblanc.fr/logo/logo-marron.png' },
    },
    url: `https://maisoncherblanc.fr/actualites/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maisoncherblanc.fr' },
        { '@type': 'ListItem', position: 2, name: 'Actualités', item: 'https://maisoncherblanc.fr/actualites' },
        { '@type': 'ListItem', position: 3, name: article.title, item: `https://maisoncherblanc.fr/actualites/${slug}` },
      ],
    },
  };

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || `Découvrez cet article de Maison Cherblanc, traiteur artisanal à Roanne.`}
        canonical={`/actualites/${slug}`}
        image={article.image_url || undefined}
        type="article"
        schema={schema}
      />

      <div style={{ paddingTop: '72px' }} />

      {article.image_url && (
        <div style={{ height: 'clamp(250px, 40vw, 480px)', overflow: 'hidden', position: 'relative' }}>
          <img
            src={article.image_url}
            alt={`Image de l'article : ${article.title} — Maison Cherblanc`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(22,13,3,0.5))' }} />
        </div>
      )}

      <article style={{ padding: 'clamp(2rem, 6vw, 4rem) 0' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-8)' }}>
              <ol style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', fontFamily: 'var(--font-ui)' }}>
                <li><Link to="/" style={{ color: 'inherit' }}>Accueil</Link></li>
                <li aria-hidden="true">›</li>
                <li><Link to="/actualites" style={{ color: 'inherit' }}>Actualités</Link></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" style={{ color: 'var(--color-text-muted)' }}>{article.title}</li>
              </ol>
            </nav>

            <p className="section-label">Actualité</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              {article.title}
            </h1>

            <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
              <time
                dateTime={article.published_at}
                style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', letterSpacing: '0.08em' }}
              >
                📅 Publié le {formatDate(article.published_at)}
              </time>
            </div>

            {article.excerpt && (
              <p style={{
                fontSize: 'var(--text-xl)',
                fontStyle: 'italic',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-8)',
                paddingLeft: 'var(--space-6)',
                borderLeft: '3px solid var(--color-accent)',
              }}>
                {article.excerpt}
              </p>
            )}

            <div className="divider--ornamental divider" style={{ marginBlock: 'var(--space-6)' }}>
              <span>✦</span>
            </div>
          </ScrollReveal>

          {/* Contenu HTML */}
          {article.content_html && (
            <div
              dangerouslySetInnerHTML={{ __html: article.content_html }}
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: 1.85,
                color: 'var(--color-text)',
              }}
              className="article-content"
            />
          )}

          <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/actualites" className="btn btn--outline">
              ← Retour aux actualités
            </Link>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="section section--warm">
        <div className="container text-center">
          <p className="section-label">Votre prochain événement ?</p>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-6)' }}>
            Faites confiance à Maison Cherblanc
          </h2>
          <Link to="/contact" className="btn btn--dark btn--lg">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </>
  );
}
