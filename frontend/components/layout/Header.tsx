import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Status', href: '/status' },
    { name: 'Unsubscribe', href: '/unsubscribe' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="backdrop-blur-lg bg-gradient-to-r from-white/80 via-blue-50/80 to-indigo-50/80 shadow-lg rounded-b-2xl border-b border-blue-100/60 mx-auto mt-2 max-w-5xl px-4 py-3 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
              VU Datesheet
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Notifier</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative font-semibold text-base text-gray-700 hover:text-blue-700 transition-colors duration-200 px-2 py-1 focus:outline-none focus:text-blue-700"
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-full hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-blue-100 transition-colors"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-br from-white/95 via-blue-50/95 to-indigo-50/95 shadow-2xl rounded-b-2xl border-b border-blue-100/60 mx-auto max-w-5xl px-4 pt-20 pb-8 flex flex-col items-center space-y-4 animate-slide-down">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="font-semibold text-lg text-gray-700 hover:text-blue-700 transition-colors duration-200 px-3 py-2 rounded-lg w-full text-center focus:outline-none focus:text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </header>
  );
};