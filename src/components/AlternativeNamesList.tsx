'use client';

import React from 'react';

interface AlternativeName {
  name: string;
  comment?: string;
}

interface AlternativeNamesListProps {
  names: AlternativeName[];
}

const AlternativeNamesList: React.FC<AlternativeNamesListProps> = ({ names }) => {
  if (!names || names.length === 0) return null;
  return (
    <ul className="w-full">
      {names.map((alt, idx) => (
        <li
          key={alt.name + (alt.comment || '')}
          className="flex justify-between items-center py-2 px-1"
          style={{
            borderBottom: idx !== names.length - 1 ? '1px solid #2a2a2a' : 'none',
          }}
        >
          <span className="font-semibold text-white mr-4" style={{ wordBreak: 'break-word' }}>{alt.name}</span>
          {alt.comment && (
            <span className="text-sm text-gray-400 ml-4" style={{ whiteSpace: 'nowrap' }}>
              ({alt.comment})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default AlternativeNamesList; 