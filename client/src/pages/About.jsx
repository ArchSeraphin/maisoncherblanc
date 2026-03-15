import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const IconScissors = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const IconLightbulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const ABOUT_VALUES = [
  { icon: <IconLeaf />, title: 'Terroir & Authenticité', text: 'Nous sélectionnons nos produits auprès de producteurs locaux de confiance. La qualité commence à la source.' },
  { icon: <IconScissors />, title: 'Artisanat & Savoir-faire', text: 'Chaque pièce est travaillée manuellement dans notre atelier. Fumage, découpe, assemblage — rien n\'est laissé au hasard.' },
  { icon: <IconLightbulb />, title: 'Créativité & Sur-mesure', text: 'Votre événement est unique. Nos prestations le sont aussi. Nous adaptons chaque menu à vos goûts et votre budget.' },
  { icon: <IconHeart />, title: 'Proximité & Chaleur', text: 'Une relation directe avec nos clients, une écoute attentive et un suivi personnalisé du premier contact jusqu\'au jour J.' },
];

export default function About() {
  return (
    <>
      <SEO
        title="À propos — Notre histoire, notre équipe"
        description="Découvrez l'histoire de Maison Cherblanc, traiteur artisanal à Roanne. Une équipe passionnée au service de vos événements en Loire et Rhône-Alpes depuis plus de 10 ans."
        canonical="/a-propos"
        image="https://maisoncherblanc.fr/img/equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'À propos de Maison Cherblanc',
          url: 'https://maisoncherblanc.fr/a-propos',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maisoncherblanc.fr' },
              { '@type': 'ListItem', position: 2, name: 'À propos', item: 'https://maisoncherblanc.fr/a-propos' },
            ],
          },
        }}
      />

      <div style={{ paddingTop: '80px' }} />

      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="page-header">
        <div className="container">
          <p className="page-header__eyebrow">Notre histoire</p>
          <h1 className="page-header__title">À propos de Maison Cherblanc</h1>
          <p className="page-header__subtitle">
            Traiteur artisanal, boucherie et charcuterie au cœur de Roanne —
            une passion transmise, un savoir-faire d'exception.
          </p>
        </div>
      </header>

      {/* ─── Histoire ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 'clamp(2rem, 6vw, 5rem)' }}>
            <ScrollReveal direction="left">
              <div className="aspect-ratio aspect-ratio--4-3">
                <img
                  src="/img/equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg"
                  alt="L'équipe Maison Cherblanc lors d'un service événementiel à Roanne"
                  loading="lazy"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div>
                <p className="section-label">Notre ADN</p>
                <h2 className="section-title">Une maison fondée sur la passion</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
                  Maison Cherblanc est née d'une conviction simple : la gastronomie artisanale
                  est un vecteur d'émotions. Implantés à Roanne, au cœur de la Loire,
                  nous avons construit notre réputation sur la qualité de nos produits
                  et l'excellence de notre service.
                </p>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
                  De la boucherie artisanale à la préparation de buffets pour 500 convives,
                  chaque prestation est l'occasion de sublimer votre événement avec
                  authenticité et générosité. Nos produits sont sourcés localement,
                  travaillés dans notre atelier, et livrés avec soin sur votre lieu de réception.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
                  {[['Artisanal', 'Fait maison'], ['Local', 'Loire & Rhône-Alpes'], ['Sur-mesure', 'Chaque événement']].map(([n, l]) => (
                    <div key={n}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>{n}</div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Valeurs ───────────────────────────────────────────── */}
      <section className="section section--warm" aria-labelledby="valeurs-title">
        <div className="container">
          <ScrollReveal>
            <div className="section-header section-header--center">
              <p className="section-label">Ce qui nous guide</p>
              <h2 className="section-title" id="valeurs-title">Nos valeurs</h2>
            </div>
          </ScrollReveal>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {ABOUT_VALUES.map(({ icon, title, text }, i) => (
              <ScrollReveal key={title} delay={i * 100}>
                <div className="feature-item">
                  <div className="feature-item__icon">{icon}</div>
                  <h3 className="feature-item__title">{title}</h3>
                  <p className="feature-item__text">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Equipe ────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="equipe-title">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <p className="section-label">Les visages de la maison</p>
              <h2 className="section-title" id="equipe-title">Notre équipe</h2>
              <p className="section-subtitle">
                Une équipe soudée, passionnée, qui s'investit pleinement
                dans chacune de vos réceptions.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid-2" style={{ gap: 'var(--space-8)' }}>
            <ScrollReveal delay={0}>
              <div className="card">
                <div className="card__image">
                  <img
                    src="/img/fumoir-mobile-cuisson-jambons-traiteur-evenement-roanne.jpg"
                    alt="Fumoir mobile cuisson de jambons — Maison Cherblanc traiteur événement Roanne"
                    loading="lazy"
                  />
                </div>
                <div className="card__body">
                  <p className="card__label">Notre équipe</p>
                  <h3 className="card__title">Une brigade au service de vos événements</h3>
                  <p className="card__excerpt">
                    Chefs, commis, serveurs — notre équipe entière se mobilise
                    pour assurer le succès de chaque prestation, du plus intime au plus festif.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="card">
                <div className="card__image">
                  <img
                    src="/img/preparation-buffet-traiteur-maison-cherblanc-roanne.jpg"
                    alt="Préparation des buffets dans les cuisines de Maison Cherblanc Roanne"
                    loading="lazy"
                  />
                </div>
                <div className="card__body">
                  <p className="card__label">En cuisine</p>
                  <h3 className="card__title">L'atelier : là où tout commence</h3>
                  <p className="card__excerpt">
                    Dans notre atelier à Roanne, chaque préparation est réalisée
                    avec rigueur et amour du travail bien fait, en respectant les recettes
                    artisanales qui font notre réputation.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="section section--cream" aria-labelledby="cta-about-title">
        <div className="container text-center">
          <ScrollReveal>
            <p className="section-label" style={{ color: 'var(--color-accent)' }}>Travaillons ensemble</p>
            <h2 className="section-title" id="cta-about-title">Confions votre événement à notre équipe</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: '520px', margin: '0 auto var(--space-8)' }}>
              Mariage, association, soirée privée — contactez-nous pour un devis
              gratuit et personnalisé sous 48h.
            </p>
            <Link to="/contact" className="btn btn--dark btn--lg">
              Nous contacter
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
