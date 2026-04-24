import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJob } from '../utils/api';
import { useBookmarks } from '../context/BookmarkContext';
import ApplyModal from '../components/ApplyModal';
import { JobDetailSkeleton } from '../components/Skeletons';
import { timeAgo, getCompanyColor, getCompanyInitials, formatNumber } from '../utils/helpers';

const jobTypeBadge = {
  'Full-time': 'badge-blue',
  'Internship': 'badge-purple',
  'Contract': 'badge-saffron',
  'Remote': 'badge-green',
  'Hybrid': 'badge-gray',
};

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await fetchJob(id);
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Job not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <JobDetailSkeleton />;
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-ink-400 mb-4">{error}</p>
      <Link to="/" className="btn-primary">← Back to jobs</Link>
    </div>
  );
  if (!job) return null;

  const saved = isBookmarked(job.id);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-400 mb-6">
          <Link to="/" className="hover:text-saffron-500 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-ink-700 truncate">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: getCompanyColor(job.company) }}
                >
                  {getCompanyInitials(job.company)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">{job.title}</h1>
                  <p className="text-ink-500 font-medium">{job.company}</p>
                </div>
                <button
                  onClick={() => toggleBookmark(job)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    saved ? 'bg-saffron-50 border-saffron-200 text-saffron-500' : 'border-ink-200 text-ink-400 hover:border-saffron-300 hover:text-saffron-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-ink-50 rounded-xl">
                <MetaItem icon="📍" label="Location" value={job.location} />
                <MetaItem icon="💰" label="Salary" value={job.salary.display} green />
                <MetaItem icon="🎓" label="Experience" value={job.experience} />
                <MetaItem icon="📅" label="Posted" value={timeAgo(job.postedAt)} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={jobTypeBadge[job.jobType] || 'badge-gray'}>{job.jobType}</span>
                {job.isUrgent && <span className="badge bg-red-100 text-red-600">🔥 Urgent Hiring</span>}
                {job.isFeatured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
                {job.isRemote && <span className="badge-green">🏡 Remote OK</span>}
                <span className="badge-gray ml-auto">{formatNumber(job.applicationCount)} applicants</span>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">About this Role</h2>
                <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Skills card */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1.5 rounded-xl font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply CTA */}
            <div className="card p-6 text-center sticky top-20">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-sm"
                style={{ backgroundColor: getCompanyColor(job.company) }}>
                {getCompanyInitials(job.company)}
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-1">{job.title}</h3>
              <p className="text-sm text-ink-500 mb-1">{job.company}</p>
              <p className="text-sm font-medium text-emerald-600 mb-4">{job.salary.display}</p>

              <button
                onClick={() => setShowModal(true)}
                className="btn-primary w-full text-base py-3 mb-3"
              >
                Apply Now →
              </button>
              <button
                onClick={() => toggleBookmark(job)}
                className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  saved ? 'border-saffron-400 text-saffron-600 bg-saffron-50' : 'border-ink-200 text-ink-600 hover:border-saffron-300'
                }`}
              >
                {saved ? '✓ Saved' : '🔖 Save Job'}
              </button>

              <p className="text-[11px] text-ink-300 mt-3">{formatNumber(job.applicationCount)} people applied</p>
            </div>

            {/* Company info */}
            <div className="card p-5">
              <h3 className="font-medium text-ink-800 mb-3">Quick Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-400">Company</span>
                  <span className="text-ink-700 font-medium">{job.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Type</span>
                  <span className="text-ink-700">{job.jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Location</span>
                  <span className="text-ink-700">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Experience</span>
                  <span className="text-ink-700">{job.experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && <ApplyModal job={job} onClose={() => setShowModal(false)} />}
    </>
  );
}

function MetaItem({ icon, label, value, green }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-0.5">{icon} {label}</p>
      <p className={`text-sm font-medium ${green ? 'text-emerald-600' : 'text-ink-800'}`}>{value}</p>
    </div>
  );
}
