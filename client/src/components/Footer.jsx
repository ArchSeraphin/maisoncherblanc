import { Link } from 'react-router-dom';

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

const CONTACT_ITEMS = [
  {
    icon: <IconMapPin />,
    label: 'Adresse',
    value: <>55 Rue Mulsant<br />42300 Roanne</>,
    href: 'https://maps.google.com/?q=55+Rue+Mulsant+42300+Roanne',
    external: true,
  },
  {
    icon: <IconPhone />,
    label: 'Téléphone',
    value: '04 77 71 16 11',
    href: 'tel:+33477711611',
  },
  {
    icon: <IconMail />,
    label: 'Email',
    value: 'contact@maisoncherblanc.fr',
    href: 'mailto:contact@maisoncherblanc.fr',
  },
  {
    icon: <IconClock />,
    label: 'Horaires',
    value: 'Lun–Sam : 9h–18h',
    href: null,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Marque */}
          <div>
            <img
              src="/logo/logo-beige.png"
              alt="Logo Maison Cherblanc"
              className="footer__brand-logo"
              loading="lazy"
            />
            <p className="footer__brand-desc">
              Traiteur artisanal, boucherie et charcuterie à Roanne.
              Nous créons des expériences gourmandes sur-mesure pour vos mariages,
              événements associatifs et réceptions privées en Loire et Rhône-Alpes.
            </p>
            <div className="footer__socials">
              <a
                href="https://www.facebook.com/maisoncherblanc"
                className="footer__social"
                aria-label="Page Facebook Maison Cherblanc"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/maisoncherblanc"
                className="footer__social"
                aria-label="Instagram Maison Cherblanc"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="footer__col-title">Navigation</h3>
            <ul className="footer__links">
              <li><Link to="/" className="footer__link">Accueil</Link></li>
              <li><Link to="/a-propos" className="footer__link">À propos</Link></li>
              <li><Link to="/services" className="footer__link">Nos services</Link></li>
              <li><Link to="/actualites" className="footer__link">Actualités</Link></li>
              <li><Link to="/contact" className="footer__link">Contact & Devis</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="footer__col-title">Prestations</h3>
            <ul className="footer__links">
              <li><Link to="/services" className="footer__link">Traiteur mariage</Link></li>
              <li><Link to="/services" className="footer__link">Cocktails dinatoires</Link></li>
              <li><Link to="/services" className="footer__link">Plateaux charcuterie</Link></li>
              <li><Link to="/services" className="footer__link">Barbecue & Broche</Link></li>
              <li><Link to="/services" className="footer__link">Pièces montées</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer__col-title">Contact</h3>
            {CONTACT_ITEMS.map(({ icon, label, value, href, external }) => (
              <div key={label} className="footer__contact-item">
                <div className="footer__contact-icon">{icon}</div>
                <div className="footer__contact-text">
                  <span className="footer__contact-label">{label}</span>
                  {href ? (
                    <a
                      href={href}
                      className="footer__contact-value"
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="footer__contact-value">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} Maison Cherblanc. Tous droits réservés.
          </p>
          <nav className="footer__legal-links" aria-label="Liens légaux">
            <Link to="/mentions-legales" className="footer__legal-link">Mentions légales</Link>
            <Link to="/mentions-legales#confidentialite" className="footer__legal-link">Confidentialité</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
