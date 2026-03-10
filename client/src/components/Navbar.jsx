import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/a-propos', label: 'À propos' },
  { to: '/services', label: 'Services' },
  { to: '/actualites', label: 'Actualités' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Transparent uniquement sur la home (hero dark derrière)
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // Toujours fond sombre sauf home non-scrollée
  const isDark = !isHome || scrolled;

  return (
    <>
      <nav
        className={`navbar ${isDark ? 'navbar--scrolled' : 'navbar--transparent'}`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="container">
          <div className="navbar__inner">
            <Link to="/" className="navbar__logo" onClick={closeMenu} aria-label="Maison Cherblanc — Accueil">
              <img
                src="/logo/logo-beige.png"
                alt="Logo Maison Cherblanc"
                style={{ height: '64px', width: 'auto' }}
              />
            </Link>

            <nav className="navbar__nav" aria-label="Menu principal">
              {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <Link to="/contact" className="navbar__cta">
              Devis gratuit
            </Link>

            <button
              className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      <div className={`navbar__mobile${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
        <Link to="/contact" className="btn btn--primary" onClick={closeMenu}>
          Devis gratuit
        </Link>
      </div>

      {/* Overlay menu mobile */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
