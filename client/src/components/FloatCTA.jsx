import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function FloatCTA() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [visible, setVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  if (!visible) return null;

  return (
    <div className="cta-float" role="complementary" aria-label="Contact rapide">
      <a href="tel:+33477711611" className="cta-float__btn cta-float__btn--call">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Appeler
      </a>
      <Link to="/contact" className="cta-float__btn cta-float__btn--contact">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        Devis
      </Link>
    </div>
  );
}
