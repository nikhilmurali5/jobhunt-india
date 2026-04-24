import React, { useState, useEffect, useCallback } from 'react';
import { fetchJobs } from '../utils/api';
import JobCard from '../components/JobCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import { JobCardSkeleton } from '../components/Skeletons';

const HERO_STATS = [
  { label: 'Live Jobs', value: '160+' },
  { label: 'Companies', value: '50+' },
  { label: 'Cities', value: '12+' },
];

const POPULAR_SEARCHES = ['Software Engineer', 'Data Scientist', 'Remote', 'Bangalore', 'AI Engineer', 'Fresher'];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', location: 'All', jobType: 'All',
    minSalary: '', maxSalary: '', sort: 'newest', page: 1,
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      if (filters.location === 'All') delete params.location;
      if (filters.jobType === 'All') delete params.jobType;
      const { data } = await fetchJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(loadJobs, filters.search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [loadJobs, filters]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-400 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"/>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-saffron-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs text-white/80 mb-5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
              160+ fresh jobs updated daily
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Find your next role<br />
              <span className="text-saffron-400">in India's top companies</span>
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Curated jobs from Bangalore to Hyderabad, top startups to MNCs.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              {HERO_STATS.map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/50">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Popular searches */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/40 self-center">Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => setFilters(f => ({ ...f, search: term, page: 1 }))}
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white px-3 py-1 rounded-full transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          totalResults={total}
          loading={loading}
        />

        {/* Job Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState onClear={() => setFilters({ search: '', location: 'All', jobType: 'All', minSalary: '', maxSalary: '', sort: 'newest', page: 1 })} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                onChange={p => { setFilters(f => ({ ...f, page: p })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-20 h-20 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-9 h-9 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-xl text-ink-800 mb-2">No jobs found</h3>
      <p className="text-ink-400 text-sm mb-6">Try different keywords or clear your filters</p>
      <button onClick={onClear} className="btn-primary">Clear all filters</button>
    </div>
  );
}
