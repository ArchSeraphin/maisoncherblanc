import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import Reviews from '../components/Reviews.jsx';

const GALLERY_IMAGES = [
  { src: '/img/plateau-petits-fours-canapes-roules-traiteur-roanne.jpg', alt: 'Plateau de petits fours et canapés — Traiteur Maison Cherblanc Roanne' },
  { src: '/img/plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg', alt: 'Plateau charcuterie et fromages artisanaux — Maison Cherblanc' },
  { src: '/img/tour-macarons-dessert-reception-mariage-traiteur-roanne.jpg', alt: 'Tour de macarons pour réception mariage — Traiteur Roanne' },
  { src: '/img/salle-reception-mariage-dressage-traiteur-roanne-loire.jpg', alt: 'Salle de réception mariage dressée — Traiteur Loire Rhône-Alpes' },
  { src: '/img/equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg', alt: 'Équipe Maison Cherblanc en service événement Roanne' },
  { src: '/img/grande-table-buffet-traiteur-evenement-roanne-loire.jpg', alt: 'Grande table buffet pour événement — Traiteur Roanne Loire' },
];

const SCHEMA_HOME = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Maison Cherblanc — Traiteur Boucherie Charcuterie Roanne',
  description: 'Traiteur artisanal à Roanne spécialisé mariages, cocktails et événements. Boucherie et charcuterie maison.',
  url: 'https://maisoncherblanc.fr',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maisoncherblanc.fr' }],
  },
};

export default function Home() {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openLightbox = (i) => setLightbox(i);
  const prevImg = () => setLightbox(l => (l - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  const nextImg = () => setLightbox(l => (l + 1) % GALLERY_IMAGES.length);

  return (
    <>
      <SEO
        title="Traiteur Boucherie Charcuterie Roanne"
        description="Maison Cherblanc — Traiteur artisanal à Roanne depuis des années. Cocktails dinatoires, plateaux charcuterie et fromages, barbecue, pièces montées pour vos mariages et événements en Loire."
        canonical="/"
        schema={SCHEMA_HOME}
      />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="hero" aria-label="Présentation Maison Cherblanc">
        <div
          className="hero__bg"
          style={{ backgroundImage: "url('/img/table-maries-decoration-mariage-traiteur-maison-cherblanc-roanne.jpg')" }}
          role="img"
          aria-label="Réception mariage élégante dressée par Maison Cherblanc Roanne"
        />
        <div className="hero__overlay" />
        <div className="container">
          <div className="hero__content">
            <p className="hero__eyebrow">Traiteur artisanal — Roanne, Loire</p>
            <h1 className="hero__title">
              L'art de recevoir,<br />
              <em>le goût de l'excellence</em>
            </h1>
            <p className="hero__subtitle">
              Maison Cherblanc crée des expériences gastronomiques sur-mesure
              pour vos mariages, réceptions et événements en Loire et Rhône-Alpes.
            </p>
            <div className="hero__actions">
              <Link to="/contact" className="btn btn--primary btn--lg">
                Demander un devis gratuit
              </Link>
              <Link to="/services" className="btn btn--outline-light btn--lg">
                Découvrir nos services
              </Link>
            </div>
          </div>
        </div>
        <button
          className="hero__scroll"
          onClick={() => document.getElementById('accroche')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Défiler vers le contenu"
        >
          <div className="hero__scroll-line" />
          <span>Découvrir</span>
        </button>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="stats-bar" id="accroche" aria-label="Chiffres clés Maison Cherblanc">
        <div className="stats-bar__item">
          <div className="stats-bar__number">10+</div>
          <div className="stats-bar__label">Années d'expertise</div>
        </div>
        <div className="stats-bar__item">
          <div className="stats-bar__number">500+</div>
          <div className="stats-bar__label">Événements réalisés</div>
        </div>
        <div className="stats-bar__item">
          <div className="stats-bar__number">100%</div>
          <div className="stats-bar__label">Fait maison</div>
        </div>
        <div className="stats-bar__item">
          <div className="stats-bar__number">Loire</div>
          <div className="stats-bar__label">& Rhône-Alpes</div>
        </div>
      </section>

      {/* ─── Accroche ──────────────────────────────────────────── */}
      <section className="section" aria-labelledby="accroche-title">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 'clamp(2rem, 6vw, 5rem)' }}>
            <ScrollReveal direction="left">
              <div>
                <p className="section-label">Notre savoir-faire</p>
                <h2 className="section-title" id="accroche-title">
                  Une maison artisanale au service de vos moments d'exception
                </h2>
                <p className="section-subtitle" style={{ marginBottom: 'var(--space-6)' }}>
                  Chez Maison Cherblanc, chaque prestation est conçue avec passion et rigueur.
                  De la boucherie artisanale à l'organisation de votre cocktail de mariage,
                  nous mettons notre expertise au service de vos plus beaux souvenirs.
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-8)' }}>
                  Basés à Roanne, nous intervenons sur toute la Loire et la région Rhône-Alpes.
                  Notre engagement : une qualité irréprochable, des produits sourcés localement,
                  et un service chaleureux qui fait toute la différence.
                </p>
                <Link to="/a-propos" className="btn btn--outline">
                  Notre histoire
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <div className="aspect-ratio aspect-ratio--4-3" style={{ gridRow: 'span 2' }}>
                  <img
                    src="/img/equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg"
                    alt="L'équipe Maison Cherblanc en service pour un événement à Roanne"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-ratio aspect-ratio--1-1">
                  <img
                    src="/img/plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg"
                    alt="Plateau charcuterie et fromages artisanaux Maison Cherblanc"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-ratio aspect-ratio--1-1">
                  <img
                    src="/img/jambon-fume-artisanal-boucherie-cherblanc-roanne.jpg"
                    alt="Jambon fumé artisanal boucherie Cherblanc Roanne"
                    loading="lazy"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Services ──────────────────────────────────────────── */}
      <section className="section section--warm" aria-labelledby="services-title">
        <div className="container">
          <ScrollReveal>
            <div className="section-header section-header--center">
              <p className="section-label">Ce que nous faisons</p>
              <h2 className="section-title" id="services-title">Nos prestations traiteur</h2>
              <p className="section-subtitle">
                Du cocktail dinatoire au repas de gala, nous orchestrons chaque détail
                pour que votre événement soit mémorable.
              </p>
            </div>
          </ScrollReveal>

          <div className="features-grid">
            {[
              {
                icon: '🥂',
                title: 'Cocktails dinatoires',
                text: 'Mini-burgers, verrines, canapés, plateaux prestige… Un cocktail dinatoire élaboré sur-mesure pour 20 à 500 convives.',
                img: '/img/plateau-aperitif-mini-burgers-verrines-traiteur-roanne.jpg',
                alt: 'Cocktail dinatoire traiteur Roanne — plateau mini-burgers et verrines',
              },
              {
                icon: '🥩',
                title: 'Barbecue & Broche',
                text: 'Cuisson en direct sur notre barbecue mobile IZILOC : côtes de bœuf, jambons à la broche et pièces entières pour des repas spectaculaires.',
                img: '/img/cuisson-cotes-boeuf-barbecue-traiteur-evenement-roanne.jpg',
                alt: 'Cuisson côtes de bœuf barbecue mobile traiteur événement Roanne',
              },
              {
                icon: '🧀',
                title: 'Plateaux charcuterie & fromages',
                text: 'Sélection artisanale de charcuteries et fromages affinés, dressés avec soin sur plateaux décoratifs pour vos tables.',
                img: '/img/plateau-fromages-mariage-traiteur-cherblanc-roanne.jpg',
                alt: 'Plateau fromages mariage traiteur Cherblanc Roanne',
              },
              {
                icon: '💒',
                title: 'Mariage clé en main',
                text: 'Du vin d\'honneur au dessert, nous prenons en charge l\'intégralité de votre restauration de mariage avec élégance et professionnalisme.',
                img: '/img/table-maries-decoration-mariage-traiteur-maison-cherblanc-roanne.jpg',
                alt: 'Table des mariés décorée mariage traiteur Maison Cherblanc Roanne',
              },
              {
                icon: '🎂',
                title: 'Pièces montées & Desserts',
                text: 'Croquembouche, pièce montée aux fruits, tour de macarons… Des desserts qui marquent les esprits et subliment votre table.',
                img: '/img/croquembouche-mariage-traiteur-maison-cherblanc-roanne.jpg',
                alt: 'Croquembouche mariage traiteur Maison Cherblanc Roanne',
              },
              {
                icon: '🏢',
                title: 'Événements associatifs',
                text: 'Repas annuels, fêtes de village, séminaires d\'entreprise… Nous adaptons nos prestations à tous les formats et tous les budgets.',
                img: '/img/salle-reception-mariage-dressage-traiteur-roanne-loire.jpg',
                alt: 'Salle de réception dressée pour événement associatif traiteur Roanne Loire',
              },
            ].map(({ icon, title, text, img, alt }, i) => (
              <ScrollReveal key={title} delay={i * 80}>
                <article className="feature-item">
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                    <img
                      src={img}
                      alt={alt}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                  <div className="feature-item__icon" aria-hidden="true">{icon}</div>
                  <h3 className="feature-item__title">{title}</h3>
                  <p className="feature-item__text">{text}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center" style={{ marginTop: 'var(--space-12)' }}>
              <Link to="/services" className="btn btn--dark btn--lg">
                Toutes nos prestations
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Section photo plein écran ─────────────────────────── */}
      <section
        style={{
          position: 'relative',
          height: 'clamp(300px, 50vw, 600px)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <img
          src="/img/chef-traiteur-fumoir-mobile-maison-cherblanc-roanne.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(22,13,3,0.55)' }} />
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', color: 'white', padding: 'var(--space-8)',
          }}
        >
          <div>
            <p className="section-label" style={{ color: 'var(--color-accent)' }}>Notre engagement</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 600, lineHeight: 1.2, maxWidth: '700px' }}>
              "Le goût authentique du terroir,<br />
              <em style={{ color: 'var(--color-secondary)' }}>l'excellence du service artisanal"</em>
            </h2>
          </div>
        </div>
      </section>

      {/* ─── Galerie ───────────────────────────────────────────── */}
      <section className="section" aria-labelledby="galerie-title">
        <div className="container">
          <ScrollReveal>
            <div className="section-header section-header--center">
              <p className="section-label">Nos réalisations</p>
              <h2 className="section-title" id="galerie-title">Quelques instants capturés</h2>
            </div>
          </ScrollReveal>

          <div className="gallery-masonry">
            {GALLERY_IMAGES.map(({ src, alt }, i) => (
              <button
                key={src}
                className="gallery-masonry__item"
                onClick={() => openLightbox(i)}
                aria-label={`Voir en grand : ${alt}`}
              >
                <img src={src} alt={alt} loading="lazy" />
                <div className="gallery-item__overlay">
                  <span style={{ fontSize: '2rem', color: 'white' }}>🔍</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galerie photo" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" aria-label="Fermer" onClick={() => setLightbox(null)}>✕</button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); prevImg(); }} aria-label="Image précédente">‹</button>
          <img
            className="lightbox__img"
            src={GALLERY_IMAGES[lightbox].src}
            alt={GALLERY_IMAGES[lightbox].alt}
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); nextImg(); }} aria-label="Image suivante">›</button>
        </div>
      )}

      {/* ─── Avis Google ───────────────────────────────────────── */}
      <Reviews />

      {/* ─── CTA Final ─────────────────────────────────────────── */}
      <section className="section section--dark" aria-labelledby="cta-title">
        <div className="container text-center">
          <ScrollReveal>
            <p className="section-label">Prêt à nous confier votre événement ?</p>
            <h2 className="section-title" id="cta-title" style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-4)' }}>
              Parlons de votre projet
            </h2>
            <p style={{ color: 'rgba(224,209,183,0.75)', fontSize: 'var(--text-lg)', maxWidth: '560px', margin: '0 auto var(--space-10)' }}>
              Devis gratuit et personnalisé sous 48h.
              Mariage, association, entreprise — nous sommes à votre écoute.
            </p>
            <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn--primary btn--lg">
                Demander un devis
              </Link>
              <a href="tel:+33477711611" className="btn btn--outline-light btn--lg">
                📞 04 77 71 16 11
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
