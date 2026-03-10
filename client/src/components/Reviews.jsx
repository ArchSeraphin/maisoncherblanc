import { useState, useEffect } from 'react';

function StarRating({ rating }) {
  return (
    <span aria-label={`${rating} étoiles sur 5`} style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function Reviews() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => { if (d.reviews?.length > 0) setData(d); })
      .catch(() => {});
  }, []);

  if (!data || data.reviews.length === 0) return null;

  return (
    <section className="section section--warm" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-header section-header--center">
          <p className="section-label">Ce que disent nos clients</p>
          <h2 className="section-title" id="reviews-title">Ils nous font confiance</h2>
          {data.rating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <StarRating rating={Math.round(data.rating)} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>
                {data.rating.toFixed(1)}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                / 5 — {data.total} avis
              </span>
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {data.reviews.map((review) => (
            <article
              key={review.id}
              style={{
                background: 'white',
                border: '1px solid var(--color-border-light)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'var(--color-bg-warm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent)', fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 'var(--text-lg)', flexShrink: 0,
                }}>
                  {review.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                    {review.author_name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                    {new Date(review.review_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <StarRating rating={review.rating} />

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65, flex: 1 }}>
                {review.content.length > 200 ? review.content.slice(0, 200) + '…' : review.content}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 'var(--space-10)' }}>
          <a
            href="https://share.google/LCuStSCIvymTNlgFB"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
          >
            Laisser un avis Google
          </a>
        </div>
      </div>
    </section>
  );
}
