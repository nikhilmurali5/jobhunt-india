import React, { useState } from 'react';

const LOCATIONS = ['All', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Gurgaon', 'Noida', 'Remote'];
const JOB_TYPES = ['All', 'Full-time', 'Internship', 'Contract', 'Remote', 'Hybrid'];

export default function SearchFilters({ filters, onChange, totalResults, loading }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const hasActiveFilters = filters.location !== 'All' || filters.jobType !== 'All' || filters.minSalary || filters.maxSalary;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-4.5 h-4.5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          className="input pl-11 pr-4 py-3 text-sm shadow-sm"
          placeholder="Search jobs, companies, skills... (e.g. React, Swiggy, Bangalore)"
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
        />
        {filters.search && (
          <button
            onClick={() => handleChange('search', '')}
            className="absolute inset-y-0 right-3 flex items-center text-ink-300 hover:text-ink-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location */}
        <select
          className="input w-auto py-2 text-sm cursor-pointer"
          value={filters.location || 'All'}
          onChange={e => handleChange('location', e.target.value)}
        >
          {LOCATIONS.map(l => <option key={l} value={l}>{l === 'All' ? '📍 All Locations' : l}</option>)}
        </select>

        {/* Job Type */}
        <select
          className="input w-auto py-2 text-sm cursor-pointer"
          value={filters.jobType || 'All'}
          onChange={e => handleChange('jobType', e.target.value)}
        >
          {JOB_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? '💼 All Types' : t}</option>)}
        </select>

        {/* Sort */}
        <select
          className="input w-auto py-2 text-sm cursor-pointer"
          value={filters.sort || 'newest'}
          onChange={e => handleChange('sort', e.target.value)}
        >
          <option value="newest">🕐 Newest First</option>
          <option value="salary">💰 Highest Salary</option>
        </select>

        {/* More filters toggle */}
        <button
          onClick={() => setShowFilters(s => !s)}
          className={`btn-secondary text-sm py-2 flex items-center gap-1.5 ${hasActiveFilters && !showFilters ? 'border-saffron-400 text-saffron-600' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2"/>
          </svg>
          Salary Range
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-saffron-500"/>}
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ search: '', location: 'All', jobType: 'All', minSalary: '', maxSalary: '', sort: 'newest', page: 1 })}
            className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50 py-2"
          >
            Clear all
          </button>
        )}

        {/* Results count */}
        <div className="ml-auto text-sm text-ink-400">
          {loading ? (
            <span className="animate-pulse-soft">Searching...</span>
          ) : (
            <span><strong className="text-ink-700">{totalResults.toLocaleString('en-IN')}</strong> jobs found</span>
          )}
        </div>
      </div>

      {/* Salary range expanded */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-ink-100 animate-fade-in">
          <span className="text-sm text-ink-600 font-medium">Salary (LPA):</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input w-24 py-2 text-sm"
              placeholder="Min"
              min={0}
              value={filters.minSalary || ''}
              onChange={e => handleChange('minSalary', e.target.value)}
            />
            <span className="text-ink-300">—</span>
            <input
              type="number"
              className="input w-24 py-2 text-sm"
              placeholder="Max"
              min={0}
              value={filters.maxSalary || ''}
              onChange={e => handleChange('maxSalary', e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[[0,5],[5,10],[10,20],[20,50]].map(([min,max]) => (
              <button
                key={`${min}-${max}`}
                onClick={() => onChange({ ...filters, minSalary: String(min), maxSalary: String(max), page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  filters.minSalary === String(min) && filters.maxSalary === String(max)
                    ? 'bg-saffron-500 text-white border-saffron-500'
                    : 'border-ink-200 text-ink-600 hover:border-saffron-400'
                }`}
              >
                ₹{min}–{max} LPA
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
