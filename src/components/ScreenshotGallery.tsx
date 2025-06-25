'use client';

import React, { useState, useRef } from 'react';

type Screenshot = {
  id: number | string;
  image: string;
};

export default function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!screenshots || screenshots.length === 0) {
    return null; // Don't render if there are no screenshots
  }

  // Scroll thumbnail strip left/right
  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.7;
    scrollRef.current.scrollTo({
      left: dir === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mt-10">
      <h2 className="mb-3 md:mb-5 text-xl md:text-2xl font-bold text-white">Screenshots</h2>
      {/* Main large screenshot */}
      <div className="w-full flex items-center justify-center">
        <div className="relative w-full max-w-7xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#111', minHeight: '50vh' }}>
          <img
            src={screenshots[currentIndex].image}
            alt="Game screenshot large"
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
      {/* Number below image in format 2/18 */}
      <div className="mt-2 md:mt-4 mb-4 md:mb-8 text-white text-lg md:text-2xl font-extrabold select-none drop-shadow-lg text-center" style={{textShadow: '0 2px 8px #000'}}>
        {currentIndex + 1}/{screenshots.length}
      </div>
      {/* Thumbnails row */}
      {screenshots.length > 1 && (
        <div className="relative mt-2 flex items-center">
          <button
            className="absolute left-0 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 shadow-lg focus:outline-none flex items-center justify-center transition-all duration-200 -translate-y-1/2 top-1/2"
            style={{ left: '-1.5rem' }}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto px-2 no-scrollbar"
            style={{ scrollBehavior: 'smooth', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}
          >
            {screenshots.map((ss, idx) => (
              <div
                key={ss.id}
                onClick={() => setCurrentIndex(idx)}
                className={`cursor-pointer flex-shrink-0 border-4 rounded-lg transition-all duration-200 ${
                  currentIndex === idx
                    ? 'border-blue-500 scale-105'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ width: '180px', height: '100px' }}
              >
                <img
                  src={ss.image}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 shadow-lg focus:outline-none flex items-center justify-center transition-all duration-200 -translate-y-1/2 top-1/2"
            style={{ right: '-1.5rem' }}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}