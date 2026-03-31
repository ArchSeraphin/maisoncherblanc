import { useState } from 'react';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CONTACT_INFO = [
  { icon: <IconMapPin />, label: 'Adresse', value: '55 Rue Mulsant, 42300 Roanne', href: 'https://maps.google.com/?q=55+Rue+Mulsant+42300+Roanne' },
  { icon: <IconPhone />, label: 'Téléphone', value: '04 77 71 16 11', href: 'tel:+33477711611' },
  { icon: <IconMail />, label: 'Email', value: 'contact@maisoncherblanc.fr', href: 'mailto:contact@maisoncherblanc.fr' },
  { icon: <IconClock />, label: 'Horaires', value: 'Lundi–Samedi : 9h–18h', href: null },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', event_type: '', subject: '', message: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const update = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', event_type: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setStatus('error');
        setErrorMsg(data.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Impossible d\'envoyer le message. Vérifiez votre connexion.');
    }
  };

  return (
    <>
      <SEO
        title="Contact & Devis gratuit — Traiteur Maison Cherblanc Roanne"
        description="Contactez Maison Cherblanc pour un devis gratuit sous 48h. Traiteur mariage, cocktail dinatoire, barbecue, charcuterie à Roanne et en Loire. Réponse rapide et personnalisée."
        canonical="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Maison Cherblanc',
          url: 'https://maisoncherblanc.fr/contact',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maisoncherblanc.fr' },
              { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://maisoncherblanc.fr/contact' },
            ],
          },
        }}
      />

      <div style={{ paddingTop: '80px' }} />

      <header className="page-header">
        <div className="container">
          <p className="page-header__eyebrow">Demande de devis</p>
          <h1 className="page-header__title">Parlons de votre projet</h1>
          <p className="page-header__subtitle">
            Remplissez le formulaire ci-dessous et nous vous répondrons
            sous 48h avec un devis personnalisé et gratuit.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 'clamp(2rem, 6vw, 5rem)', alignItems: 'start' }}>

            {/* Coordonnées */}
            <ScrollReveal direction="left">
              <div>
                <p className="section-label">Nos coordonnées</p>
                <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>
                  Maison Cherblanc
                </h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}>
                  Traiteur artisanal, boucherie et charcuterie à Roanne.
                  N'hésitez pas à nous appeler directement ou à remplir le formulaire
                  pour toute demande de devis ou d'information.
                </p>

                {CONTACT_INFO.map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', alignItems: 'flex-start' }}>
                    <div className="contact-icon-box">
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>{label}</div>
                      {href ? (
                        <a
                          href={href}
                          className="contact-link"
                          {...(href.startsWith('https://maps') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >{value}</a>
                      ) : (
                        <span style={{ color: 'var(--color-text)' }}>{value}</span>
                      )}
                    </div>
                  </div>
                ))}

                <div className="aspect-ratio aspect-ratio--16-9" style={{ marginTop: 'var(--space-8)' }}>
                  <img
                    src="/img/buffet-cocktail-exterieur-reception-traiteur-roanne-loire.jpg"
                    alt="Buffet cocktail extérieur Maison Cherblanc — réception en Loire"
                    loading="lazy"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Formulaire */}
            <ScrollReveal direction="right">
              <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)', color: 'var(--color-primary)' }}>
                  Envoyer une demande
                </h2>

                {status === 'success' ? (
                  <div className="form-success" role="alert">
                    <strong>Message envoyé !</strong><br />
                    Merci pour votre demande. Nous vous répondrons dans les plus brefs délais (sous 48h).
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">Nom & Prénom *</label>
                        <input
                          id="name" name="name" type="text"
                          className="form-input" value={form.name} onChange={update}
                          placeholder="Marie Dupont" required minLength={2}
                          autoComplete="name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email *</label>
                        <input
                          id="email" name="email" type="email"
                          className="form-input" value={form.email} onChange={update}
                          placeholder="marie@exemple.fr" required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Téléphone</label>
                        <input
                          id="phone" name="phone" type="tel"
                          className="form-input" value={form.phone} onChange={update}
                          placeholder="06 XX XX XX XX"
                          autoComplete="tel"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="event_type">Type d'événement</label>
                        <select
                          id="event_type" name="event_type"
                          className="form-select" value={form.event_type} onChange={update}
                        >
                          <option value="">Sélectionner…</option>
                          <option value="mariage">Mariage</option>
                          <option value="association">Association</option>
                          <option value="entreprise">Entreprise</option>
                          <option value="particulier">Particulier</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                      <label className="form-label" htmlFor="subject">Sujet *</label>
                      <input
                        id="subject" name="subject" type="text"
                        className="form-input" value={form.subject} onChange={update}
                        placeholder="Demande de devis mariage — Juin 2026" required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                      <label className="form-label" htmlFor="message">Votre message *</label>
                      <textarea
                        id="message" name="message"
                        className="form-textarea" value={form.message} onChange={update}
                        placeholder="Décrivez votre événement : date, nombre de convives, lieu, vos envies…"
                        required minLength={10}
                        rows={5}
                      />
                    </div>

                    {status === 'error' && (
                      <p className="form-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn btn--primary btn--lg"
                      disabled={status === 'loading'}
                      style={{ width: '100%' }}
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                          Envoi en cours…
                        </>
                      ) : 'Envoyer ma demande'}
                    </button>

                    <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', textAlign: 'center' }}>
                      * Champs obligatoires — Réponse sous 48h
                    </p>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
