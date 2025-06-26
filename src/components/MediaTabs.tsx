'use client';
import { useState, useRef, useEffect } from 'react';
import { FaCamera, FaVideo } from 'react-icons/fa';

interface MediaTabsProps {
  screenshots?: Array<{ id: number | string; image: string }>;
  videos?: {
    source: 'igdb';
    videos: { name: string; video_id: string }[];
  } | {
    source: 'rawg';
    clip: {
      clip: string;
      preview: string;
    };
  };
}

// ScreenshotGallery inlined
function ScreenshotGallery({ screenshots }: { screenshots: { id: number | string; image: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasMounted = useRef(false);
  const prevIndex = useRef(currentIndex);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!screenshots || screenshots.length === 0) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(idx => (idx > 0 ? idx - 1 : screenshots.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(idx => (idx < screenshots.length - 1 ? idx + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenshots]);

  // Center selected thumbnail
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      prevIndex.current = currentIndex;
      return;
    }
    if (prevIndex.current !== currentIndex && thumbRefs.current[currentIndex]) {
      thumbRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    prevIndex.current = currentIndex;
  }, [currentIndex]);

  if (!screenshots || screenshots.length === 0) {
    return <div className="text-center text-gray-400 py-8">No screenshots available.</div>;
  }

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
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-[60vh] max-h-[70vh] min-h-[300px] bg-transparent flex items-center justify-center rounded-lg">
        <img
          src={screenshots[currentIndex].image}
          alt={`Game screenshot ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      <div className="mt-2 mb-4 text-white text-base font-semibold select-none text-center">
        {currentIndex + 1}/{screenshots.length}
      </div>
      {screenshots.length > 1 && (
        <div className="relative w-full flex justify-center items-center mx-auto" style={{ minHeight: 80 }}>
          <button
            className="absolute left-0 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all top-1/2 -translate-y-1/2"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            type="button"
            style={{ left: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto px-2 no-scrollbar py-2"
            tabIndex={0}
            aria-label="Screenshot thumbnails"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', outline: 'none' }}
          >
            {screenshots.map((ss, idx) => (
              <button
                key={ss.id}
                onClick={() => setCurrentIndex(idx)}
                ref={el => { thumbRefs.current[idx] = el; }}
                className={`cursor-pointer flex-shrink-0 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  currentIndex === idx
                    ? 'scale-105'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ width: '140px', height: '80px', padding: 0, border: 'none', background: 'none' }}
                aria-label={`View screenshot ${idx + 1}`}
              >
                <img
                  src={ss.image}
                  alt={`Screenshot ${idx + 1}`}
                  className={`w-full h-full object-cover rounded-lg ${currentIndex === idx ? 'ring-2 ring-blue-400' : ''}`}
                />
              </button>
            ))}
          </div>
          <button
            className="absolute right-0 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all top-1/2 -translate-y-1/2"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            type="button"
            style={{ right: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// VideoPlayer inlined
function VideoPlayer({ data }: { data?: MediaTabsProps['videos'] }) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasMountedVideos = useRef(false);
  const prevVideoId = useRef<string | null>(null);

  // Global keyboard navigation for videos
  useEffect(() => {
    if (!data || data.source !== 'igdb' || !data.videos.length) return;
    const videosArr = data.videos;
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIdx = selectedVideoId ? videosArr.findIndex(v => v.video_id === selectedVideoId) : 0;
      if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) setSelectedVideoId(videosArr[currentIdx - 1].video_id);
        else setSelectedVideoId(videosArr[videosArr.length - 1].video_id);
      } else if (e.key === 'ArrowRight') {
        if (currentIdx < videosArr.length - 1) setSelectedVideoId(videosArr[currentIdx + 1].video_id);
        else setSelectedVideoId(videosArr[0].video_id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, selectedVideoId]);

  // Center selected video thumbnail
  useEffect(() => {
    if (!data || data.source !== 'igdb' || !data.videos.length) return;
    if (!hasMountedVideos.current) {
      hasMountedVideos.current = true;
      prevVideoId.current = selectedVideoId || (data.videos[0]?.video_id ?? null);
      return;
    }
    const videosArr = data.videos;
    const currentIdx = selectedVideoId ? videosArr.findIndex(v => v.video_id === selectedVideoId) : 0;
    if (prevVideoId.current !== (selectedVideoId || videosArr[0]?.video_id) && thumbRefs.current[currentIdx]) {
      thumbRefs.current[currentIdx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    prevVideoId.current = selectedVideoId || (data.videos[0]?.video_id ?? null);
  }, [selectedVideoId, data]);

  if (!data) return <div className="text-center text-gray-400 py-8">No videos available.</div>;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.7;
    scrollRef.current.scrollTo({
      left: dir === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  // IGDB videos with thumbnails
  if (data.source === 'igdb' && data.videos.length > 0) {
    return (
      <div className="w-full flex flex-col items-center">
        {/* Main video player - match screenshots tab sizing and centering */}
        <div className="relative w-full h-[60vh] max-h-[70vh] min-h-[300px] bg-transparent flex items-center justify-center rounded-lg">
          <div className="max-w-3xl w-full h-full mx-auto flex items-center justify-center">
            <iframe
              key={selectedVideoId || data.videos[0].video_id}
              src={`https://www.youtube.com/embed/${selectedVideoId || data.videos[0].video_id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="object-contain rounded-lg w-full h-full"
              style={{ background: 'black' }}
            ></iframe>
          </div>
        </div>
        {/* Video index display - match screenshots tab */}
        <div className="mt-2 mb-4 text-white text-base font-semibold select-none text-center">
          {(selectedVideoId ? data.videos.findIndex(v => v.video_id === selectedVideoId) : 0) + 1}/{data.videos.length}
        </div>
        {/* Thumbnails row - match screenshots tab */}
        {data.videos.length > 1 && (
          <div className="relative w-full flex justify-center items-center mx-auto" style={{ minHeight: 80 }}>
            <button
              className="absolute left-0 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all top-1/2 -translate-y-1/2"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              type="button"
              style={{ left: 0 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto px-2 no-scrollbar py-2"
              tabIndex={0}
              aria-label="Video thumbnails"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', outline: 'none' }}
            >
              {data.videos.map((video, idx) => (
                <button
                  key={video.video_id}
                  onClick={() => setSelectedVideoId(video.video_id)}
                  ref={el => { thumbRefs.current[idx] = el; }}
                  className={`cursor-pointer flex-shrink-0 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    (selectedVideoId || data.videos[0].video_id) === video.video_id
                      ? 'scale-105'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ width: '140px', height: '80px', padding: 0, border: 'none', background: 'none' }}
                  aria-label={`Play video: ${video.name}`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                    alt={video.name}
                    className={`w-full h-full object-cover rounded-lg ${(selectedVideoId || data.videos[0].video_id) === video.video_id ? 'ring-2 ring-blue-400' : ''}`}
                  />
                </button>
              ))}
            </div>
            <button
              className="absolute right-0 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all top-1/2 -translate-y-1/2"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              type="button"
              style={{ right: 0 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // RAWG video (single video, no thumbnails) - match screenshots tab sizing and centering
  if (data.source === 'rawg' && data.clip) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full h-[60vh] max-h-[70vh] min-h-[300px] bg-transparent flex items-center justify-center rounded-lg">
          <div className="max-w-3xl w-full h-full mx-auto flex items-center justify-center">
            <video
              key={data.clip.clip}
              controls
              src={data.clip.clip}
              poster={data.clip.preview}
              className="object-contain rounded-lg w-full h-full"
              style={{ background: 'black' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="mt-2 mb-4 text-white text-base font-semibold select-none text-center">
          1/1
        </div>
      </div>
    );
  }

  // fallback
  return null;
}

export default function MediaTabs({ screenshots, videos }: MediaTabsProps) {
  const [activeTab, setActiveTab] = useState<'screenshots' | 'videos'>(
    screenshots && screenshots.length > 0 ? 'screenshots' : 'videos'
  );

  const screenshotsCount = screenshots?.length || 0;
  const videosCount = videos?.source === 'igdb' ? videos.videos.length : (videos ? 1 : 0);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md py-6 px-2 sm:px-6 mb-8">
      {/* Centered simple translucent tab bar at the top */}
      <div className="flex justify-center w-full mb-6">
        <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-4 py-1 rounded-full text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 border ${
              activeTab === 'screenshots'
                ? 'bg-blue-500/70 text-white border-blue-400'
                : 'bg-white/10 text-white border-transparent hover:bg-white/20'
            }`}
            aria-selected={activeTab === 'screenshots'}
            tabIndex={0}
          >
            Screenshots <span className="ml-1 text-base font-normal">({screenshotsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-1 rounded-full text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 border ${
              activeTab === 'videos'
                ? 'bg-blue-500/70 text-white border-blue-400'
                : 'bg-white/10 text-white border-transparent hover:bg-white/20'
            }`}
            aria-selected={activeTab === 'videos'}
            tabIndex={0}
          >
            Videos & Trailers <span className="ml-1 text-base font-normal">({videosCount})</span>
          </button>
        </div>
      </div>
      {/* Media content flush with background */}
      <div className="w-full">
        {activeTab === 'screenshots' && <ScreenshotGallery screenshots={screenshots || []} />}
        {activeTab === 'videos' && <VideoPlayer data={videos} />}
      </div>
    </div>
  );
} 