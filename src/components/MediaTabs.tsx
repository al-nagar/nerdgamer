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

  const tabStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    fontSize: '1.2rem'
  };
  
  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '3px solid #0070f3',
    color: '#fff'
  };

  const inactiveTabStyle = {
    ...tabStyle,
    color: '#9ca3af'
  };

  const screenshotsCount = screenshots?.length || 0;
  const videosCount = videos?.source === 'igdb' ? videos.videos.length : (videos ? 1 : 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`px-5 py-3 font-medium transition-colors ${
            activeTab === 'screenshots'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Screenshots ({screenshotsCount})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-3 font-medium transition-colors ${
            activeTab === 'videos'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Videos ({videosCount})
        </button>
      </div>
      
      <div className="mt-6">
        {activeTab === 'screenshots' && <ScreenshotGallery screenshots={screenshots || []} />}
        {activeTab === 'videos' && <VideoPlayer data={videos} />}
      </div>
    </div>
  );
} 