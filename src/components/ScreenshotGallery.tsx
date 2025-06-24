'use client';

import React, { useState } from 'react';

type Screenshot = {
  id: number | string;
  image: string;
};

export default function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return null; // Don't render if there are no screenshots
  }

  const openModal = (idx: number) => {
    setCurrentIndex(idx);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const prev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? screenshots.length - 1 : i - 1));
  };
  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((i) => (i === screenshots.length - 1 ? 0 : i + 1));
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen]);

  return (
    <div className="mt-10">
      <h2 className="mb-3 md:mb-5 text-xl md:text-2xl font-bold text-white">Screenshots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {screenshots.map((ss, idx) => (
          <div key={ss.id}>
            <button
              type="button"
              className="focus:outline-none"
              onClick={() => openModal(idx)}
              tabIndex={0}
            >
              <img
                src={ss.image}
                alt="Game screenshot"
                className="w-full h-40 object-cover rounded-lg shadow-md hover:opacity-80 transition"
              />
            </button>
          </div>
        ))}
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90"
          onClick={closeModal}
        >
          {/* Top bar with close button */}
          <div className="w-full flex justify-end items-center px-4 md:px-8 pt-4 md:pt-8">
            <button
              className="text-2xl md:text-3xl font-bold bg-white text-black border-2 border-black rounded-full p-2 md:p-3 shadow-lg focus:outline-none transition-all duration-200"
              onClick={closeModal}
              aria-label="Close"
              style={{ zIndex: 10 }}
            >
              &times;
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center w-full relative flex-col" style={{ minHeight: '0' }}>
            <div className="flex items-center justify-center w-full">
              {/* Left arrow */}
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-bold bg-white text-black border-2 border-black rounded-full p-2 md:p-4 shadow-lg focus:outline-none transition-all duration-200"
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="Previous"
                style={{ zIndex: 10 }}
              >
                &#8592;
              </button>
              {/* Image */}
              <img
                src={screenshots[currentIndex].image}
                alt="Game screenshot large"
                className="rounded-lg shadow-2xl"
                style={{
                  maxHeight: '60vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  margin: '0 16px',
                  background: '#111',
                }}
              />
              {/* Right arrow */}
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-bold bg-white text-black border-2 border-black rounded-full p-2 md:p-4 shadow-lg focus:outline-none transition-all duration-200"
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="Next"
                style={{ zIndex: 10 }}
              >
                &#8594;
              </button>
            </div>
            {/* Number below image in format 2/18 */}
            <div className="mt-2 md:mt-4 mb-4 md:mb-8 text-white text-lg md:text-2xl font-extrabold select-none drop-shadow-lg text-center" style={{textShadow: '0 2px 8px #000'}}>
              {currentIndex + 1}/{screenshots.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 