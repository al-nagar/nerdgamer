import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-t from-gray-900 via-gray-800 to-blue-900 py-8">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
        <Link href="/faq" className="flex items-center gap-2 px-8 py-4 rounded-lg bg-gray-700 text-white text-lg font-semibold shadow hover:bg-gray-600 transition-colors">
          <span role="img" aria-label="FAQ">❓</span> FAQ
        </Link>
        <Link href="/donate" className="flex items-center gap-2 px-8 py-4 rounded-lg bg-gray-700 text-white text-lg font-semibold shadow hover:bg-gray-600 transition-colors">
          <span role="img" aria-label="Donate">💖</span> Donate
        </Link>
        <Link href="/contact" className="flex items-center gap-2 px-8 py-4 rounded-lg bg-gray-700 text-white text-lg font-semibold shadow hover:bg-gray-600 transition-colors">
          <span role="img" aria-label="Contact">📬</span> Contact
        </Link>
        <Link href="/popular" className="flex items-center gap-2 px-8 py-4 rounded-lg bg-gray-700 text-white text-lg font-semibold shadow hover:bg-gray-600 transition-colors">
          <span role="img" aria-label="Popular">🔥</span> Popular
        </Link>
      </div>
      <div className="text-center text-gray-400 text-sm mt-8">&copy; {new Date().getFullYear()} NerdGamer. All rights reserved.</div>
    </footer>
  );
} 