import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';

export default function Navbar() {
  const { bookmarks } = useBookmarks();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Jobs' },
    { to: '/bookmarks', label: 'Saved', count: bookmarks.length },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-saffron-600 transition-colors">
              <svg className="w-4.5 h-4.5 text-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-lg text-ink-900">
              JobHunt <span className="text-saffron-500">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-saffron-50 text-saffron-600'
                    : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                }`}
              >
                {link.label}
                {link.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin/post" className="btn-primary text-sm py-2">
              Post a Job
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-xl text-ink-500 hover:bg-ink-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-ink-100 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium mb-1 ${
                  location.pathname === link.to
                    ? 'bg-saffron-50 text-saffron-600'
                    : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                {link.label}
                {link.count > 0 && <span className="badge-saffron">{link.count}</span>}
              </Link>
            ))}
            <Link to="/admin/post" onClick={() => setMenuOpen(false)} className="btn-primary text-sm w-full text-center mt-2 block">
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
