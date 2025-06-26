'use client';

// Define the expected data structure
type ContentDescriptor = { id: number; description: string; };
type AgeRating = {
    id: number;
    organization: { name: string };
    rating_category: { rating: string };
    rating_content_descriptions_v2?: ContentDescriptor[];
};

// --- NEW HELPER FUNCTION TO GET RATING COLOR ---
const getRatingColor = (rating: string) => {
    const r = rating?.toUpperCase();
    if (r === 'M' || r === '18' || r === 'Z' || r === 'R18+' || r.includes('EIGHTEEN')) return '#c0392b'; // Red for Mature
    if (r === 'T' || r === '16' || r === '15+' || r.includes('TEEN')) return '#f39c12'; // Orange/Yellow for Teen
    if (r === 'E' || r === 'E10+' || r === '12' || r === '6') return '#27ae60'; // Green for Everyone
    return '#34495e'; // A default neutral color
};

// Helper to map age rating to a simple label (copied from GameHeader)
function getSimpleAgeRating(ageRatings?: any[]): string | null {
  if (!ageRatings || ageRatings.length === 0) return null;
  // Prefer ESRB, then PEGI, then any
  const priorities = ['ESRB', 'PEGI', 'CERO', 'USK', 'GRAC', 'CLASSIND', 'ACB'];
  let best: any = null;
  for (const org of priorities) {
    best = ageRatings.find(r => r.organization?.name?.toUpperCase().includes(org));
    if (best) break;
  }
  if (!best) best = ageRatings[0];
  const label = (best.rating_category?.rating || '').toLowerCase();
  // Map common labels to user-friendly ones
  if (label.includes('everyone 10')) return '+10';
  if (label.includes('everyone')) return 'Everyone';
  if (label.includes('teen')) return '+13';
  if (label.includes('mature')) return '+17';
  if (label.includes('adults only') || label.includes('adult')) return '+18';
  if (label.includes('pegi 3')) return '+3';
  if (label.includes('pegi 7')) return '+7';
  if (label.includes('pegi 12')) return '+12';
  if (label.includes('pegi 16')) return '+16';
  if (label.includes('pegi 18')) return '+18';
  // Handle single-letter ESRB codes
  if (label === 'e') return 'Everyone';
  if (label === 'e10+' || label === 'e 10+') return '+10';
  if (label === 't') return '+13';
  if (label === 'm') return '+17';
  if (label === 'ao') return '+18';
  if (label.match(/\d+/)) return `+${label.match(/\d+/)[0]}`;
  return best.rating_category?.rating || null;
}

export default function AgeRatingDisplay({ ratings }: { ratings?: AgeRating[] }) {
    const simpleLabel = getSimpleAgeRating(ratings);
    if (!ratings || ratings.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: '20px', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', padding: '0 12px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Age Rating</h3>
            {simpleLabel && (
                <div style={{ marginBottom: 14, textAlign: 'center' }}>
                    <span style={{
                        background: 'rgba(30,30,30,0.85)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '7px 22px',
                        fontWeight: 700,
                        fontSize: '1.18em',
                        letterSpacing: '0.04em',
                        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
                        display: 'inline-block',
                        marginTop: 0,
                    }}>{simpleLabel}</span>
                </div>
            )}
            <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
                Official content ratings as provided by international game rating boards.
            </div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: '22px',
                    maxWidth: 1100,
                    margin: '0 auto',
                }}
            >
                {ratings.map(rating => {
                    const ratingValue = rating.rating_category?.rating || 'N/A';
                    const ratingColor = getRatingColor(ratingValue);
                    return (
                        <div
                            key={rating.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(20,20,20,0.82)',
                                borderRadius: '15px',
                                boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
                                borderLeft: `7px solid ${ratingColor}`,
                                width: 170,
                                height: 100,
                                padding: '12px 0',
                                margin: 0,
                            }}
                        >
                            <div style={{
                                background: ratingColor,
                                color: 'white',
                                padding: '8px 22px',
                                borderRadius: '8px',
                                fontWeight: 900,
                                fontSize: '1.45em',
                                minWidth: 38,
                                letterSpacing: '0.04em',
                                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
                                marginBottom: 10,
                                marginTop: 4,
                            }}>{ratingValue}</div>
                            <div style={{ fontWeight: 700, fontSize: '1.13em', color: '#eee', letterSpacing: '0.01em', marginBottom: 0 }}>
                                {rating.organization?.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 