'use client';
import { useState } from 'react';
import ScreenshotGallery from './ScreenshotGallery';
import VideoPlayer from './VideoPlayer';

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

export default function MediaTabs({ screenshots, videos }: MediaTabsProps) {
  const [activeTab, setActiveTab] = useState('screenshots');

  const screenshotsCount = screenshots?.length || 0;
  const videosCount = videos?.source === 'igdb' ? videos.videos.length : (videos ? 1 : 0);

  return (
    <div className="bg-black/40 rounded-2xl p-4 shadow-2xl w-[98vw] h-[95vh] max-w-none mx-auto my-2 flex flex-col items-center justify-center">
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`px-8 py-3 text-2xl font-bold rounded-full transition-colors focus:outline-none shadow-sm border-2 ${
            activeTab === 'screenshots'
              ? 'bg-blue-600/90 border-blue-700 text-white shadow'
              : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/80'
          }`}
        >
          Screenshots <span className="ml-1 text-lg font-semibold">({screenshotsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-8 py-3 text-2xl font-bold rounded-full transition-colors focus:outline-none shadow-sm border-2 ${
            activeTab === 'videos'
              ? 'bg-blue-600/90 border-blue-700 text-white shadow'
              : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/80'
          }`}
        >
          Videos <span className="ml-1 text-lg font-semibold">({videosCount})</span>
        </button>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        {activeTab === 'screenshots' && <ScreenshotGallery screenshots={screenshots || []} />}
        {activeTab === 'videos' && <VideoPlayer data={videos} />}
      </div>
    </div>
  );
} 