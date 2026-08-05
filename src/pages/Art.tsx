import { PageLayout } from '../components/PageLayout';

const placeholderStyle: React.CSSProperties = {
  aspectRatio: '1',
  borderRadius: '24px',
  background:
    'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7), rgba(167,139,250,0.75))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  color: 'var(--color-text)',
};

export function Art() {
  return (
    <PageLayout title="Art">
      <section className="card">
        <h2>Gallery</h2>
        <p>Placeholder — a grid for Kaavya's artwork. Swap these tiles for real images.</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={placeholderStyle}>
              Art {n}
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
