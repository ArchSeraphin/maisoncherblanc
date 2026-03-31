import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SERVICES = [
  {
    id: 'cocktail',
    title: 'Cocktails dinatoires',
    icon: '🥂',
    img: '/img/buffet-cocktail-traiteur-roanne-maison-cherblanc.jpg',
    alt: 'Cocktail dinatoire traiteur Maison Cherblanc Roanne — buffet élaboré',
    description: 'Du vin d\'honneur à la soirée complète, nous concevons des cocktails dinatoires mémorables. Mini-burgers maison, verrines gourmandes, canapés, plateaux prestige…',
    details: ['De 20 à 500 personnes', 'Menu 100% personnalisable', 'Service inclus', 'Matériel fourni'],
  },
  {
    id: 'mariage',
    title: 'Mariage clé en main',
    icon: '💒',
    img: '/img/table-maries-decoration-mariage-traiteur-maison-cherblanc-roanne.jpg',
    alt: 'Prestation traiteur mariage clé en main Maison Cherblanc Roanne Loire',
    description: 'Vin d\'honneur, repas assis, pièce montée, soirée — nous prenons en charge l\'intégralité de votre restauration de mariage avec élégance et professionnalisme.',
    details: ['Vin d\'honneur & cocktail', 'Repas assis avec service', 'Fromages & desserts', 'Coordination complète'],
  },
  {
    id: 'barbecue',
    title: 'Barbecue & Broche',
    icon: '🥩',
    img: '/img/cuisson-cotes-boeuf-barbecue-traiteur-evenement-roanne.jpg',
    alt: 'Barbecue mobile IZILOC cuisson côtes de bœuf traiteur événement Roanne',
    description: 'Notre barbecue mobile IZILOC permet une cuisson spectaculaire en direct. Côtes de bœuf, jambons à la broche, pièces entières — un show culinaire impressionnant.',
    details: ['Barbecue mobile IZILOC', 'Cuisson en direct', 'Viandes sélectionnées', 'Chef sur place'],
  },
  {
    id: 'charcuterie',
    title: 'Charcuterie & Fromages',
    icon: '🧀',
    img: '/img/plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg',
    alt: 'Plateau charcuterie et fromages artisanaux Maison Cherblanc traiteur Roanne',
    description: 'Jambons fumés maison, saucissons artisanaux, plateaux de fromages affinés avec soin. Le meilleur du terroir français en service élégant.',
    details: ['Charcuterie artisanale maison', 'Fromages affinés sélectionnés', 'Dressage décoratif', 'Livraison incluse'],
  },
  {
    id: 'sandwichs',
    title: 'Plateaux repas & Sandwichs',
    icon: '🥪',
    img: '/img/plateau-sandwichs-cocktail-traiteur-roanne.jpg',
    alt: 'Plateau repas sandwichs cocktail traiteur Roanne — bagels wraps club sandwichs',
    description: 'Plateaux repas variés pour vos déjeuners d\'affaires, réunions ou pique-niques. Bagels, wraps, club-sandwichs, mini-burgers — tout est préparé le matin même.',
    details: ['Préparation du jour', 'Grande variété', 'Commande à partir de 10', 'Livraison possible'],
  },
  {
    id: 'desserts',
    title: 'Pièces montées & Desserts',
    icon: '🎂',
    img: '/img/croquembouche-mariage-traiteur-maison-cherblanc-roanne.jpg',
    alt: 'Croquembouche pièce montée mariage traiteur Maison Cherblanc Roanne',
    description: 'Croquembouche tradition, pièce montée aux fruits rouges, tour de macarons, gâteaux personnalisés… Des desserts d\'exception pour couronner votre événement.',
    details: ['Personnalisation complète', 'Inscriptions possibles', 'Livraison & installation', 'Sur commande'],
  },
  {
    id: 'association',
    title: 'Événements associatifs',
    icon: '🏘️',
    img: '/img/salle-reception-mariage-dressage-traiteur-roanne-loire.jpg',
    alt: 'Traiteur événement associatif repas salle réception Roanne Loire',
    description: 'Repas annuels, fêtes de village, galas associatifs… Nous nous adaptons à vos contraintes budgétaires tout en maintenant nos standards de qualité.',
    details: ['Tarifs adaptés associations', 'De 30 à 500 couverts', 'Repas assis ou buffet', 'Matériel fourni'],
  },
  {
    id: 'fromages-prestige',
    title: 'Plateaux fromages prestige',
    icon: '🥛',
    img: '/img/plateau-fromages-prestige-fruits-passion-mariage-traiteur-roanne.jpg',
    alt: 'Plateau fromages prestige fruits de la passion mariage traiteur Roanne',
    description: 'Pour vos événements haut de gamme : sélection de fromages d\'exception (camembert, brie, comté, roquefort, saint-marcellin) présentés avec fruits frais et accompagnements.',
    details: ['Fromages d\'exception', 'Sélection saisonnière', 'Dressage haut de gamme', 'Étiquetage inclus'],
  },
];

export default function Services() {
  return (
    <>
      <SEO
        title="Services traiteur Roanne — Mariage, Cocktail, Barbecue"
        description="Découvrez toutes les prestations de Maison Cherblanc : traiteur mariage, cocktails dinatoires, barbecue mobile, plateaux charcuterie et fromages à Roanne en Loire."
        canonical="/services"
        image="https://maisoncherblanc.fr/img/buffet-cocktail-traiteur-roanne-maison-cherblanc.jpg"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Traiteur événementiel',
          provider: {
            '@type': 'LocalBusiness',
            name: 'Maison Cherblanc',
            address: { '@type': 'PostalAddress', addressLocality: 'Roanne', addressRegion: 'Rhône-Alpes', addressCountry: 'FR' },
          },
          areaServed: ['Roanne', 'Loire', 'Rhône-Alpes'],
          url: 'https://maisoncherblanc.fr/services',
        }}
      />

      <div style={{ paddingTop: '80px' }} />

      <header className="page-header">
        <div className="container">
          <p className="page-header__eyebrow">Traiteur Roanne</p>
          <h1 className="page-header__title">Nos services & prestations</h1>
          <p className="page-header__subtitle">
            De l'intime au grandiose, nous concevons chaque prestation
            sur-mesure pour faire de votre événement un souvenir inoubliable.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {SERVICES.map(({ id, title, img, alt, description, details }, i) => (
            <ScrollReveal key={id}>
              <article
                id={id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: i % 2 === 0 ? '3fr 2fr' : '2fr 3fr',
                  gap: 'clamp(2rem, 5vw, 5rem)',
                  alignItems: 'center',
                  marginBottom: 'clamp(3rem, 8vw, 6rem)',
                  paddingBottom: 'clamp(3rem, 8vw, 6rem)',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <div style={{ order: i % 2 === 0 ? 0 : 1 }} className="aspect-ratio aspect-ratio--4-3">
                  <img src={img} alt={alt} loading="lazy" />
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <p className="section-label">Prestation</p>
                  <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>{title}</h2>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>{description}</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                    {details.map(d => (
                      <li key={d} className="service-check">
                        <span className="service-check__icon"><IconCheck /></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className="btn btn--primary">
                    Demander un devis
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="section section--dark">
        <div className="container text-center">
          <ScrollReveal>
            <p className="section-label">Votre événement mérite le meilleur</p>
            <h2 className="section-title" style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-4)' }}>
              Demandez votre devis gratuit
            </h2>
            <p style={{ color: 'rgba(224,209,183,0.75)', maxWidth: '560px', margin: '0 auto var(--space-10)', fontSize: 'var(--text-lg)' }}>
              Réponse personnalisée sous 48h. Aucun engagement.
            </p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Contactez-nous
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
