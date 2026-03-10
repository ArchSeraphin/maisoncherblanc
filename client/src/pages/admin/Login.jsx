import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard', { replace: true });
  }, [isLoggedIn, navigate]);

  const update = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-primary)',
    }}>
      <div style={{
        background: 'white',
        padding: 'clamp(2rem, 5vw, 3rem)',
        width: '100%',
        maxWidth: '420px',
        margin: 'var(--space-4)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <img
            src="/logo/logo-marron.png"
            alt="Logo Maison Cherblanc"
            style={{ height: '64px', margin: '0 auto var(--space-4)' }}
          />
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-2)',
          }}>
            Administration
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Maison Cherblanc — Espace privé
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className="form-input" value={form.email} onChange={update}
              required autoComplete="email" autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input
              id="password" name="password" type="password"
              className="form-input" value={form.password} onChange={update}
              required autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn--dark btn--lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
