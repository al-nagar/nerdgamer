'use client';

type AltName = {
  name: string;
  comment?: string;
  id?: number;
};

export default function AlternativeNamesList({ names }: { names?: (string | AltName)[] }) {
  if (!names || names.length === 0) {
    return null;
  }

  // Normalize the names to handle both string and object formats
  const normalizedNames = names.map((name) => {
    if (typeof name === 'string') {
      return { name, comment: '' };
    }
    return {
      name: name.name || '',
      comment: name.comment || ''
    };
  });

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Alternative Names</h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {normalizedNames.map((name, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            <strong>{name.name}</strong>
            {name.comment && (
              <span style={{ color: '#aaa', marginLeft: '8px' }}>({name.comment})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 