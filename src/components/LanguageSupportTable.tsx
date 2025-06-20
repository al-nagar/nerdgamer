'use client';
import { useState } from 'react';

type LanguageInfo = {
  audio: boolean;
  subtitles: boolean;
  interface: boolean;
};
type LanguageData = Record<string, LanguageInfo>;

export default function LanguageSupportTable({ data }: { data: LanguageData }) {
  const [showAll, setShowAll] = useState(false);
  const languages = Object.keys(data).sort();

  if (languages.length === 0) {
    return null;
  }

  const visibleLanguages = showAll ? languages : languages.slice(0, 7);

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px' }}>Supported Languages</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: '10px' }}></th>
            <th style={{ fontSize: '0.9em', color: '#aaa', paddingBottom: '10px' }}>Audio</th>
            <th style={{ fontSize: '0.9em', color: '#aaa', paddingBottom: '10px' }}>Subtitles</th>
            <th style={{ fontSize: '0.9em', color: '#aaa', paddingBottom: '10px' }}>Interface</th>
          </tr>
        </thead>
        <tbody>
          {visibleLanguages.map(lang => (
            <tr key={lang}>
              <td style={{ padding: '8px 0' }}>{lang}</td>
              <td style={{ textAlign: 'center' }}>{data[lang].audio ? '✓' : ''}</td>
              <td style={{ textAlign: 'center' }}>{data[lang].subtitles ? '✓' : ''}</td>
              <td style={{ textAlign: 'center' }}>{data[lang].interface ? '✓' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {languages.length > 7 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', marginTop: '15px', padding: 0 }}
        >
          {showAll ? 'Show Less' : `Show All ${languages.length} Languages...`}
        </button>
      )}
    </div>
  );
} 