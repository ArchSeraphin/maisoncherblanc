import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Analytics() {
  const { authFetch, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [gaId, setGaId] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/admin', { replace: true }); return; }
    authFetch('/admin/settings')
      .then(r => r.json())
      .then(data => { if (data.ga_id) setGaId(data.ga_id); })
      .catch(() => {});
  }, [isLoggedIn]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/admin/settings/ga_id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: gaId.trim() }),
      });
      if (res.ok) setSuccess('ID Google Analytics enregistré !');
      else setError('Erreur lors de la sauvegarde');
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <img src="/logo/logo-beige.png" alt="" style={{ height: '36px' }} />
          <h1 className="admin-header__title">Google Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/admin/dashboard" className="btn btn--outline-light btn--sm">Articles</Link>
          <Link to="/admin/reviews" className="btn btn--outline-light btn--sm">Avis clients</Link>
        </div>
      </header>

      <main className="admin-main">
        <div style={{ maxWidth: '640px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
            Connecter Google Analytics
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
            Entrez votre identifiant de mesure Google Analytics 4 (format <code style={{ background: 'var(--color-bg-warm)', padding: '2px 6px', fontFamily: 'monospace' }}>G-XXXXXXXXXX</code>).
            Le script de suivi sera automatiquement injecté sur toutes les pages du site.
          </p>

          <form onSubmit={handleSave}>
            <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" htmlFor="ga_id">Measurement ID Google Analytics 4</label>
                <input
                  id="ga_id" type="text"
                  className="form-input"
                  value={gaId}
                  onChange={e => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  pattern="G-[A-Z0-9]+"
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-2)' }}>
                  Laisser vide pour désactiver le suivi Analytics.
                </p>
              </div>

              {error && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
              {success && <div className="form-success" style={{ marginBottom: 'var(--space-4)' }}>{success}</div>}

              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>

          <div style={{ background: 'var(--color-bg-warm)', border: '1px solid var(--color-border)', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Comment trouver votre Measurement ID ?
            </h3>
            <ol style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <li>Connectez-vous à <strong>analytics.google.com</strong></li>
              <li>Sélectionnez votre propriété GA4</li>
              <li>Allez dans <strong>Administration → Flux de données</strong></li>
              <li>Cliquez sur votre flux web → copiez le <strong>Measurement ID</strong> (G-XXXXXXXXXX)</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
