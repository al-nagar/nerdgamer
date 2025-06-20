interface Store {
  id: number;
  store: {
    id: number;
    name: string;
    slug: string;
    domain: string;
  };
  url: string;
}

interface StoreLinksProps {
  stores?: Store[];
}

const getStoreUrl = (store: Store): string => {
  // If we have a direct URL to the game, use it
  if (store.url) {
    return store.url;
  }

  // Otherwise, use the store's main domain
  switch (store.store.slug) {
    case 'steam':
      return 'https://store.steampowered.com';
    case 'gog':
      return 'https://www.gog.com';
    case 'epic-games':
      return 'https://store.epicgames.com';
    case 'xbox-store':
      return 'https://www.xbox.com/games/store';
    case 'playstation-store':
      return 'https://store.playstation.com';
    case 'nintendo':
      return 'https://www.nintendo.com/store';
    case 'itch':
      return 'https://itch.io';
    case 'humble':
      return 'https://www.humblebundle.com/store';
    default:
      return store.store.domain || '#';
  }
};

export default function StoreLinks({ stores }: StoreLinksProps) {
  if (!stores || stores.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Where to Buy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stores.map(store => (
          <a
            key={store.id}
            href={getStoreUrl(store)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            {store.store.name}
          </a>
        ))}
      </div>
    </div>
  );
} 