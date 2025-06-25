'use client';

import { useState, useRef } from 'react';

type VideoData =
  | {
      source: 'igdb';
      videos: { name: string; video_id: string }[];
    }
  | {
      source: 'rawg';
      clip: {
        clip: string;
        preview: string;
      };
    };

type Clip = {
  clip: string; // URL for the video
  video: string; // An ID string
  preview: string; // A preview image
};

export default function VideoPlayer({ data }: { data?: VideoData }) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

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
      <h2 className="mb-5 text-2xl font-bold text-white">Trailers & Videos</h2>
      {data.source === 'igdb' && data.videos.length > 0 && (
        <div className="main-video-player w-full flex items-center justify-center">
          <div className="relative w-full max-w-7xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#111' }}>
            <iframe
              key={selectedVideoId || data.videos[0].video_id}
              src={`https://www.youtube.com/embed/${selectedVideoId || data.videos[0].video_id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              style={{ borderRadius: '8px', backgroundColor: '#000' }}
            ></iframe>
          </div>
        </div>
      )}
      {data.source === 'rawg' && data.clip && (
        <div className="main-video-player w-full flex items-center justify-center">
          <div className="relative w-full max-w-7xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#111' }}>
            <video
              key={data.clip.clip}
              controls
              src={data.clip.clip}
              poster={data.clip.preview}
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ borderRadius: '8px', backgroundColor: '#000' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      {/* Thumbnails for IGDB videos */}
      {data.source === 'igdb' && data.videos.length > 1 && (
        <div className="relative mt-4 flex items-center">
          <button
            className="absolute left-0 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center transition-all duration-200 -translate-y-1/2 top-1/2"
            style={{ left: '-1.5rem' }}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            type="button"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-2 no-scrollbar"
            style={{ scrollBehavior: 'smooth', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}
          >
            {data.videos.map(video => (
              <div
                key={video.video_id}
                onClick={() => setSelectedVideoId(video.video_id)}
                className={`cursor-pointer flex-shrink-0 border-4 rounded-lg transition-all duration-200 ${
                  (selectedVideoId || data.videos[0].video_id) === video.video_id
                    ? 'border-blue-500 scale-105'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ width: '160px', height: '90px' }}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                  alt={video.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center transition-all duration-200 -translate-y-1/2 top-1/2"
            style={{ right: '-1.5rem' }}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            type="button"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}