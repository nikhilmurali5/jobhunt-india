import React from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { getCompanyColor, getCompanyInitials } from '../utils/helpers';

export default function Bookmarks() {
  const { bookmarks, toggleBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-saffron-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-9 h-9 text-saffron-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </div>
        <h2 className="font-display font-semibold text-2xl text-ink-900 mb-2">No saved jobs yet</h2>
        <p className="text-ink-400 mb-6">Bookmark jobs you're interested in to revisit them later.</p>
        <Link to="/" className="btn-primary">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Saved Jobs</h1>
          <p className="text-ink-400 text-sm mt-0.5">{bookmarks.length} job{bookmarks.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Link to="/" className="btn-secondary text-sm">Browse More →</Link>
      </div>

      <div className="space-y-3">
        {bookmarks.map(b => (
          <div key={b.id} className="card p-4 flex items-center gap-4 animate-slide-up">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: getCompanyColor(b.company) }}
            >
              {getCompanyInitials(b.company)}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/jobs/${b.id}`} className="text-sm font-medium text-ink-800 hover:text-saffron-600 transition-colors block truncate">
                {b.title}
              </Link>
              <p className="text-xs text-ink-400">{b.company} · {b.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-emerald-600 hidden sm:block">{b.salary?.display}</span>
              <Link to={`/jobs/${b.id}`} className="btn-primary text-xs py-1.5 px-3">View</Link>
              <button
                onClick={() => toggleBookmark(b)}
                className="p-1.5 rounded-lg text-saffron-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
