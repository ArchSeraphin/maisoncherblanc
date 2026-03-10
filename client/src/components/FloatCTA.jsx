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
        📞 Appeler
      </a>
      <Link to="/contact" className="cta-float__btn cta-float__btn--contact">
        ✉️ Devis
      </Link>
    </div>
  );
}
