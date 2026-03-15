import SEO from '../components/SEO.jsx';

export default function Legal() {
  return (
    <>
      <SEO
        title="Mentions légales & Politique de confidentialité"
        description="Mentions légales et politique de confidentialité de Maison Cherblanc, traiteur artisanal à Roanne."
        canonical="/mentions-legales"
        noindex={true}
      />

      <div style={{ paddingTop: '80px' }} />

      <header className="page-header">
        <div className="container">
          <p className="page-header__eyebrow">Informations légales</p>
          <h1 className="page-header__title">Mentions légales</h1>
        </div>
      </header>

      <article className="section">
        <div className="container container--narrow">
          <div style={{ lineHeight: 1.8, color: 'var(--color-text-muted)' }}>

            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                1. Éditeur du site
              </h2>
              <p>Le site <strong>maisoncherblanc.fr</strong> est édité par :</p>
              <ul style={{ marginTop: 'var(--space-3)', paddingLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>Maison Cherblanc</strong></li>
                <li>Adresse : Roanne, Loire (42300), France</li>
                <li>Téléphone : 04 77 XX XX XX</li>
                <li>Email : contact@maisoncherblanc.fr</li>
                <li>SIRET : [À compléter]</li>
              </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                2. Hébergement
              </h2>
              <p>Ce site est hébergé par :</p>
              <ul style={{ marginTop: 'var(--space-3)', paddingLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Plesk (hébergement mutualisé)</li>
                <li>Serveur Linux — France</li>
              </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                3. Propriété intellectuelle
              </h2>
              <p>
                L'ensemble des contenus présents sur ce site (textes, images, logos, vidéos) sont la propriété exclusive
                de Maison Cherblanc ou de ses partenaires. Toute reproduction, même partielle, est interdite sans
                autorisation préalable écrite.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                4. Limitation de responsabilité
              </h2>
              <p>
                Maison Cherblanc s'efforce de maintenir les informations de ce site à jour et exactes.
                Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations
                diffusées. L'utilisation du site se fait sous votre seule responsabilité.
              </p>
            </section>

            <section id="confidentialite" style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                5. Politique de confidentialité
              </h2>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
                5.1 Données collectées
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Lors de l'utilisation du formulaire de contact, nous collectons :
                nom, adresse e-mail, numéro de téléphone (optionnel) et le contenu de votre message.
                Ces données sont utilisées uniquement pour répondre à votre demande.
              </p>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
                5.2 Conservation des données
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Vos données ne sont pas conservées au-delà du traitement de votre demande.
                Elles ne sont jamais vendues ni cédées à des tiers.
              </p>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
                5.3 Vos droits (RGPD)
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Conformément au Règlement Général sur la Protection des Données (RGPD),
                vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression
                de vos données personnelles. Pour exercer ces droits, contactez-nous :
                <a href="mailto:contact@maisoncherblanc.fr" style={{ color: 'var(--color-accent)', marginLeft: 'var(--space-1)' }}>
                  contact@maisoncherblanc.fr
                </a>
              </p>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
                5.4 Cookies
              </h3>
              <p>
                Ce site n'utilise que des cookies strictement nécessaires au fonctionnement
                (authentification sécurisée côté administration). Aucun cookie publicitaire
                ni traceur tiers n'est installé sans votre consentement explicite.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                6. Contact
              </h2>
              <p>
                Pour toute question concernant ces mentions légales, contactez-nous :
                <a href="mailto:contact@maisoncherblanc.fr" style={{ color: 'var(--color-accent)', marginLeft: 'var(--space-1)' }}>
                  contact@maisoncherblanc.fr
                </a>
              </p>
              <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                Dernière mise à jour : mars 2026
              </p>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
