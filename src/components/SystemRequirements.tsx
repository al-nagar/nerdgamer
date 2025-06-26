import React from 'react';
import { FaMicrochip, FaMemory, FaHardDrive, FaWindows, FaApple, FaNetworkWired, FaQuestion, FaLinux, FaVolumeHigh, FaScrewdriverWrench, FaVideo, FaSdCard } from 'react-icons/fa6';
import { TbXboxXFilled } from "react-icons/tb";

interface SystemRequirementsProps {
  minimum?: string;
  recommended?: string;
}

// Map keywords to icons with distinct colors
const iconMap: { [key: string]: React.ReactNode } = {
  os: <FaWindows color="#ffffff" size={20} title="Operating System" />,
  mac: <FaApple color="#ffffff" size={20} title="MacOS" />,
  linux: <FaLinux color="#ffffff" size={20} title="Linux" />,
  processor: <FaMicrochip color="#ffffff" size={20} title="Processor" />,
  cpu: <FaMicrochip color="#ffffff" size={20} title="CPU" />,
  memory: <FaMemory color="#ffffff" size={20} title="Memory" />,
  ram: <FaMemory color="#ffffff" size={20} title="RAM" />,
  graphics: <FaVideo color="#ffffff" size={20} title="Graphics" />,
  video: <FaVideo color="#ffffff" size={20} title="Video Card" />,
  storage: <FaHardDrive color="#ffffff" size={20} title="Storage" />,
  hard: <FaHardDrive color="#ffffff" size={20} title="Hard Drive" />,
  network: <FaNetworkWired color="#ffffff" size={20} title="Network" />,
  sound: <FaVolumeHigh color="#ffffff" size={20} title="Sound Card" />,
  system: <FaScrewdriverWrench color="#ffffff" size={20} title="System" />,
};

function getIconForLine(line: string, idx: number) {
  const lower = line.toLowerCase();
  if (lower.includes('windows')) return iconMap.os;
  if (lower.includes('mac')) return iconMap.mac;
  if (lower.includes('linux')) return iconMap.linux;
  if (lower.includes('processor')) return iconMap.processor;
  if (lower.includes('cpu')) return iconMap.cpu;
  // VRAM
  if (lower.includes('vram')) return <FaSdCard color="#ffffff" size={20} title="VRAM" />;
  // RAM (but not VRAM)
  if (lower.includes('ram') && !lower.includes('vram')) return iconMap.ram;
  // GPU/Graphics
  if (lower.includes('gpu') || lower.includes('graphics')) return iconMap.graphics;
  // DirectX
  if (lower.includes('directx') || lower.includes('direct x')) return <TbXboxXFilled color="#ffffff" size={20} title="DirectX" />;
  // GFX Setting
  if (lower.includes('gfx setting')) return <FaScrewdriverWrench color="#ffffff" size={20} title="GFX Setting" />;
  if (lower.includes('video')) return iconMap.video;
  if (lower.includes('storage')) return iconMap.storage;
  if (lower.includes('hard')) return iconMap.hard;
  if (lower.includes('network')) return iconMap.network;
  if (lower.includes('sound')) return iconMap.sound;
  return <FaQuestion color="#888" size={20} title="Other" />;
}

function getTitleForLine(line: string, idx: number) {
  const lower = line.toLowerCase();
  if (lower.includes('windows') || lower.includes('os')) return 'OS';
  if (lower.includes('mac')) return 'OS';
  if (lower.includes('linux')) return 'OS';
  if (lower.includes('processor')) return 'Processor';
  if (lower.includes('cpu')) return 'CPU';
  // VRAM
  if (lower.includes('vram')) return 'VRAM';
  // RAM (but not VRAM)
  if (lower.includes('ram') && !lower.includes('vram')) return 'RAM';
  // GPU/Graphics
  if (lower.includes('gpu') || lower.includes('graphics')) return 'GPU';
  // DirectX
  if (lower.includes('directx') || lower.includes('direct x')) return 'DirectX';
  // GFX Setting
  if (lower.includes('gfx setting')) return 'GFX Setting';
  if (lower.includes('video')) return 'Video Card';
  if (lower.includes('storage')) return 'Storage';
  if (lower.includes('hard')) return 'Hard Drive';
  if (lower.includes('network')) return 'Network';
  if (lower.includes('sound')) return 'Sound Card';
  return null;
}

// Remove duplicate Processor/CPU lines if they appear consecutively or are semantically the same
function dedupeRequirements(lines: string[]): string[] {
  const deduped: string[] = [];
  let lastType: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const type = getTitleForLine(lines[i], i);
    // If this and the previous are both Processor/CPU, skip the second
    if ((type === 'Processor' || type === 'CPU') && (lastType === 'Processor' || lastType === 'CPU')) {
      continue;
    }
    deduped.push(lines[i]);
    lastType = type;
  }
  return deduped;
}

const RequirementLine = ({ icon, text, highlight, colorClass, title, idx }: { icon: React.ReactNode; text: string; highlight: boolean; colorClass: string; title: string | null; idx: number }) => {
  let content = text;
  // For the first line if it's 'System', don't show the label, just the value
  if (idx === 0 && title === 'System') {
    return (
      <div className="flex items-center gap-3 py-1">
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-white text-sm" style={{ lineHeight: 1.4 }}>{content}</span>
      </div>
    );
  }
  if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
    // Remove the title from the text for better highlighting
    content = text.slice(title.length).replace(/^[:\s-]+/, '');
  }
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex-shrink-0">{icon}</span>
      {title ? (
        <span className={`font-bold ${colorClass} mr-1`}>{title}:</span>
      ) : null}
      <span className="text-white text-sm" style={{ lineHeight: 1.4 }}>{content.trimStart()}</span>
    </div>
  );
};

const parseRequirements = (req?: string) => {
  if (!req) return [];
  return req
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !/^minimum:?$/i.test(line) && !/^recommended:?$/i.test(line)); // Remove 'Minimum:' and 'Recommended:' lines
};

const cardClass =
  'bg-gray-900/80 p-4 md:p-6 rounded-xl border border-gray-700 flex-1 min-w-[220px]';

const SystemRequirements: React.FC<SystemRequirementsProps> = ({ minimum, recommended }) => {
  let minimumRequirements = parseRequirements(minimum);
  let recommendedRequirements = parseRequirements(recommended);

  minimumRequirements = dedupeRequirements(minimumRequirements);
  recommendedRequirements = dedupeRequirements(recommendedRequirements);

  if (!minimumRequirements.length && !recommendedRequirements.length) {
    return (
      <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl border border-gray-700 flex flex-col items-center min-w-[220px]">
        <span className="text-gray-400 mb-2">Sorry, the system requirements are not available for this game.</span>
        <a
          href="https://www.systemrequirementslab.com/cyri"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300 font-semibold mt-2"
        >
          Try searching for this game on Can You Run It
        </a>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col md:flex-row gap-6">
      {/* Minimum */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold mb-4 text-blue-400">Minimum</h3>
        {minimumRequirements.length > 0 ? (
          minimumRequirements.map((line, idx) => (
            <RequirementLine
              key={idx}
              icon={getIconForLine(line, idx)}
              text={line}
              highlight={true}
              colorClass="text-blue-300"
              title={getTitleForLine(line, idx)}
              idx={idx}
            />
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
      {/* Recommended */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold mb-4 text-green-400">Recommended</h3>
        {recommendedRequirements.length > 0 ? (
          recommendedRequirements.map((line, idx) => (
            <RequirementLine
              key={idx}
              icon={getIconForLine(line, idx)}
              text={line}
              highlight={true}
              colorClass="text-green-300"
              title={getTitleForLine(line, idx)}
              idx={idx}
            />
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    </div>
  );
};

export default SystemRequirements; 