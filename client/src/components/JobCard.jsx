import React from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { timeAgo, getCompanyInitials, getCompanyColor } from '../utils/helpers';

export default function JobCard({ job, featured = false }) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const saved = isBookmarked(job.id);

  const jobTypeBadge = {
    'Full-time': 'badge-blue',
    'Internship': 'badge-purple',
    'Contract': 'badge-saffron',
    'Remote': 'badge-green',
    'Hybrid': 'badge-gray',
  }[job.jobType] || 'badge-gray';

  return (
    <div className={`card group p-5 flex flex-col gap-4 animate-slide-up ${featured ? 'border-saffron-200 shadow-saffron-100' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Company avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: getCompanyColor(job.company) }}
          >
            {getCompanyInitials(job.company)}
          </div>
          <div className="min-w-0">
            <Link
              to={`/jobs/${job.id}`}
              className="text-sm font-medium text-ink-800 hover:text-saffron-600 transition-colors line-clamp-2 leading-tight"
            >
              {job.title}
            </Link>
            <p className="text-xs text-ink-400 mt-0.5 truncate">{job.company}</p>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={() => toggleBookmark(job)}
          className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
            saved ? 'text-saffron-500 bg-saffron-50' : 'text-ink-300 hover:text-saffron-400 hover:bg-saffron-50'
          }`}
          title={saved ? 'Remove bookmark' : 'Save job'}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      {/* Location + Salary */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {job.location}
        </span>
        <span className="flex items-center gap-1 font-medium text-emerald-600">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {job.salary.display}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map(skill => (
          <span key={skill} className="badge-gray text-[11px]">{skill}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="badge-gray text-[11px]">+{job.skills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-ink-50">
        <div className="flex items-center gap-2">
          <span className={jobTypeBadge}>{job.jobType}</span>
          {job.isUrgent && <span className="badge bg-red-100 text-red-600">Urgent</span>}
          {job.isFeatured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-300">{timeAgo(job.postedAt)}</span>
          <Link
            to={`/jobs/${job.id}`}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Apply
          </Link>
        </div>
      </div>
    </div>
  );
}
