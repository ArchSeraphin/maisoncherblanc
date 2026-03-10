import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page introuvable — 404"
        description="Cette page n'existe pas ou a été déplacée."
        noindex={true}
      />

      <div style={{ paddingTop: '72px' }} />

      <section style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-warm)' }}>
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 700, color: 'var(--color-secondary)', lineHeight: 1 }}>
            404
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
            Page introuvable
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-10)', maxWidth: '400px', margin: '0 auto var(--space-10)' }}>
            Cette page n'existe pas ou a été déplacée.
            Revenez à l'accueil pour explorer notre site.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn--primary btn--lg">
              Retour à l'accueil
            </Link>
            <Link to="/contact" className="btn btn--outline btn--lg">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
