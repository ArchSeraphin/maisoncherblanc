import { Link } from 'react-router-dom';

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
                f
              </a>
              <a
                href="https://www.instagram.com/maisoncherblanc"
                className="footer__social"
                aria-label="Instagram Maison Cherblanc"
                target="_blank"
                rel="noopener noreferrer"
              >
                IG
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
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">📍</span>
              <a href="https://maps.google.com/?q=55+Rue+Mulsant+42300+Roanne" className="footer__link" target="_blank" rel="noopener noreferrer">
                55 Rue Mulsant<br />42300 Roanne
              </a>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">📞</span>
              <a href="tel:+33477711611" className="footer__link">
                04 77 71 16 11
              </a>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">✉️</span>
              <a href="mailto:contact@maisoncherblanc.fr" className="footer__link">
                contact@maisoncherblanc.fr
              </a>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">🕐</span>
              <span>Lun–Sam : 9h–18h</span>
            </div>
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
