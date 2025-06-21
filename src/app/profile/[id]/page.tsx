import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

async function getUserProfile(id: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/profile/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const data = await getUserProfile(id);
  if (!data || !data.user) return notFound();
  const user = data.user;
  // Avatar fallback to initials
  const initials = (user.name || user.username || 'U').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 60%)`;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-16 px-4 flex justify-center items-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-xl flex flex-col items-center border border-gray-700">
        <div className="relative mb-6">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid #3b82f6', background: '#222' }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: stringToColor(user.name || user.username || 'user'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 56,
                fontWeight: 'bold',
                border: '4px solid #3b82f6',
                boxShadow: '0 2px 16px #0004',
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-6">
          <section className="bg-gray-800 rounded-xl p-6 shadow mb-2 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">{user.name}</h1>
            <div className="text-gray-400 text-lg mb-2">@{user.username}</div>
            <div className="w-full">
              <div className="text-white text-lg font-semibold mb-2">About</div>
              <div className="text-gray-300 whitespace-pre-line min-h-[80px]">{user.about || <span className="italic text-gray-500">No bio provided.</span>}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 