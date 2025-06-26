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
    <div
      style={{
        marginTop: '32px',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'rgba(20,20,20,0.82)',
        borderRadius: '18px',
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
        padding: '32px 0 28px 0',
        textAlign: 'center',
      }}
    >
      <h3 style={{ marginBottom: '10px', fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Supported Languages</h3>
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
        }}>{languages.length} Languages</span>
      </div>
      <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
        Audio, subtitles, and interface language support as provided by the game's developers.
      </div>
      <div style={{ overflowX: 'auto', margin: '0 auto', maxWidth: 700 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '10px', color: '#eee', fontWeight: 600, fontSize: '1.05em' }}></th>
              <th style={{ fontSize: '0.98em', color: '#aaa', paddingBottom: '10px', fontWeight: 500 }}>Audio</th>
              <th style={{ fontSize: '0.98em', color: '#aaa', paddingBottom: '10px', fontWeight: 500 }}>Subtitles</th>
              <th style={{ fontSize: '0.98em', color: '#aaa', paddingBottom: '10px', fontWeight: 500 }}>Interface</th>
            </tr>
          </thead>
          <tbody>
            {visibleLanguages.map(lang => (
              <tr key={lang} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '8px 0', color: '#fff', fontWeight: 500, textAlign: 'left' }}>{lang}</td>
                <td style={{ textAlign: 'center', color: data[lang].audio ? '#4ade80' : '#888', fontSize: '1.1em', fontWeight: 700 }}>{data[lang].audio ? '✓' : ''}</td>
                <td style={{ textAlign: 'center', color: data[lang].subtitles ? '#60a5fa' : '#888', fontSize: '1.1em', fontWeight: 700 }}>{data[lang].subtitles ? '✓' : ''}</td>
                <td style={{ textAlign: 'center', color: data[lang].interface ? '#fbbf24' : '#888', fontSize: '1.1em', fontWeight: 700 }}>{data[lang].interface ? '✓' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {languages.length > 7 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            marginTop: '18px',
            padding: 0,
            fontWeight: 600,
            fontSize: '1.08em',
            textDecoration: 'underline',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {showAll ? 'Show Less' : `Show All ${languages.length} Languages...`}
        </button>
      )}
    </div>
  );
} 