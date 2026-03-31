import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import Reviews from '../components/Reviews.jsx';

const IconWine = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>
    <path d="M12 15a5 5 0 0 0 5-5c0-2-2-5-5-9-3 4-5 7-5 9a5 5 0 0 0 5 5z"/>
  </svg>
);
const IconFlame = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const IconUtensils = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const IconSparkles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3 4 6l-3 1 3 1 1 3 1-3 3-1-3-1-1-3z"/>
    <path d="M19 13l-.5 1.5-1.5.5 1.5.5.5 1.5.5-1.5 1.5-.5-1.5-.5-.5-1.5z"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const FEATURES = [
  {
    icon: <IconWine />,
    title: 'Cocktails dinatoires',
    text: 'Mini-burgers, verrines, canapés, plateaux prestige… Un cocktail dinatoire élaboré sur-mesure pour 20 à 500 convives.',
    img: '/img/plateau-aperitif-mini-burgers-verrines-traiteur-roanne.jpg',
    alt: 'Cocktail dinatoire traiteur Roanne — plateau mini-burgers et verrines',
  },
  {
    icon: <IconFlame />,
    title: 'Barbecue & Broche',
    text: 'Cuisson en direct sur notre barbecue mobile IZILOC : côtes de bœuf, jambons à la broche et pièces entières pour des repas spectaculaires.',
    img: '/img/cuisson-cotes-boeuf-barbecue-traiteur-evenement-roanne.jpg',
    alt: 'Cuisson côtes de bœuf barbecue mobile traiteur événement Roanne',
  },
  {
    icon: <IconUtensils />,
    title: 'Plateaux charcuterie & fromages',
    text: 'Sélection artisanale de charcuteries et fromages affinés, dressés avec soin sur plateaux décoratifs pour vos tables.',
    img: '/img/plateau-fromages-mariage-traiteur-cherblanc-roanne.jpg',
    alt: 'Plateau fromages mariage traiteur Cherblanc Roanne',
  },
  {
    icon: <IconHeart />,
    title: 'Mariage clé en main',
    text: 'Du vin d\'honneur au dessert, nous prenons en charge l\'intégralité de votre restauration de mariage avec élégance et professionnalisme.',
    img: '/img/salle-reception-mariage-dressage-traiteur-roanne-loire.jpg',
    alt: 'Salle de réception mariage dressée — Traiteur Maison Cherblanc Roanne',
  },
  {
    icon: <IconSparkles />,
    title: 'Pièces montées & Desserts',
    text: 'Croquembouche, pièce montée aux fruits, tour de macarons… Des desserts qui marquent les esprits et subliment votre table.',
    img: '/img/gateau-mariage-framboises-personnalise-traiteur-roanne.jpg',
    alt: 'Gâteau mariage framboises personnalisé traiteur Roanne',
  },
  {
    icon: <IconUsers />,
    title: 'Événements associatifs',
    text: 'Repas annuels, fêtes de village, séminaires d\'entreprise… Nous adaptons nos prestations à tous les formats et tous les budgets.',
    img: '/img/grande-table-buffet-traiteur-evenement-roanne-loire.jpg',
    alt: 'Grande table buffet pour événement associatif — Traiteur Roanne Loire',
  },
];

const GALLERY_IMAGES = [
  { src: '/img/plateau-petits-fours-canapes-roules-traiteur-roanne.jpg', alt: 'Plateau de petits fours et canapés — Traiteur Maison Cherblanc Roanne' },
  { src: '/img/service-cocktail-exterieur-charcuterie-traiteur-roanne.jpg', alt: 'Service cocktail extérieur charcuterie — Traiteur Maison Cherblanc Roanne' },
  { src: '/img/tour-macarons-dessert-reception-mariage-traiteur-roanne.jpg', alt: 'Tour de macarons pour réception mariage — Traiteur Roanne' },
  { src: '/img/table-cocktail-aperitif-mariage-traiteur-maison-cherblanc.jpg', alt: 'Table cocktail apéritif mariage — Traiteur Maison Cherblanc' },
  { src: '/img/preparation-buffet-traiteur-maison-cherblanc-roanne.jpg', alt: 'Préparation buffet en cuisine — Maison Cherblanc Roanne' },
  { src: '/img/buffet-cocktail-exterieur-reception-traiteur-roanne-loire.jpg', alt: 'Buffet cocktail extérieur réception — Traiteur Roanne Loire' },
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 'var(--space-2)' }}>
                <div style={{ gridRow: 'span 2', overflow: 'hidden' }}>
                  <img
                    src="/img/fumage-artisanal-viande-boucherie-maison-cherblanc-roanne.jpg"
                    alt="Fumage artisanal des viandes — Maison Cherblanc Roanne"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <img
                    src="/img/jambon-fume-artisanal-boucherie-cherblanc-roanne.jpg"
                    alt="Jambon fumé artisanal boucherie Cherblanc Roanne"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <img
                    src="/img/aperitif-charcuterie-artisanale-traiteur-maison-cherblanc-roanne.jpg"
                    alt="Apéritif charcuterie artisanale Maison Cherblanc Roanne"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
            {FEATURES.map(({ icon, title, text, img, alt }, i) => (
              <ScrollReveal key={title} delay={i * 80}>
                <article className="feature-item">
                  <div className="service-img-wrap">
                    <img
                      src={img}
                      alt={alt}
                      loading="lazy"
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
          height: 'clamp(350px, 55vw, 650px)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <img
          src="/img/chef-traiteur-fumoir-mobile-maison-cherblanc-roanne.jpg"
          alt=""
          style={{ position: 'absolute', inset: '-5%', width: '110%', height: '110%', objectFit: 'cover', filter: 'saturate(0.85)' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(22,13,3,0.5) 0%, rgba(22,13,3,0.65) 50%, rgba(22,13,3,0.5) 100%)',
        }} />
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', color: 'white', padding: 'var(--space-8)',
          }}
        >
          <ScrollReveal>
            <div>
              <p className="section-label" style={{ color: 'var(--color-accent)' }}>Notre engagement</p>
              <div style={{ width: '40px', height: '1px', background: 'var(--color-accent)', margin: '0 auto var(--space-6)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 500, lineHeight: 1.15, maxWidth: '700px', letterSpacing: '-0.01em' }}>
                Le goût authentique du terroir,<br />
                <em style={{ color: 'var(--color-secondary)', fontStyle: 'italic' }}>l'excellence du service artisanal</em>
              </h2>
            </div>
          </ScrollReveal>
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
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'white', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Voir</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galerie photo" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" aria-label="Fermer" onClick={() => setLightbox(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); prevImg(); }} aria-label="Image précédente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <img
            className="lightbox__img"
            src={GALLERY_IMAGES[lightbox].src}
            alt={GALLERY_IMAGES[lightbox].alt}
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); nextImg(); }} aria-label="Image suivante">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                04 77 71 16 11
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
