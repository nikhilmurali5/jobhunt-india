import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchApplications, fetchAdminStats, postJob } from '../utils/api';

const ADMIN_KEY = 'admin123'; // default, change in .env

export default function Admin() {
  const location = useLocation();
  const isPostPage = location.pathname.includes('/post');

  const [key, setKey] = useState(sessionStorage.getItem('admin_key') || '');
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('admin_key'));
  const [loginInput, setLoginInput] = useState('');
  const [tab, setTab] = useState(isPostPage ? 'post' : 'apps');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.trim() === 'admin123') {
      sessionStorage.setItem('admin_key', loginInput.trim());
      setKey(loginInput.trim());
      setAuthed(true);
    } else {
      toast.error("Wrong admin key");
    }
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 className="font-display font-semibold text-xl text-ink-900 mb-1">Admin Access</h2>
          <p className="text-ink-400 text-sm mb-6">Enter your admin key to continue</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              className="input"
              placeholder="Admin key..."
              value={loginInput}
              onChange={e => setLoginInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">Enter Dashboard</button>
          </form>
          <p className="text-xs text-ink-300 mt-3">Default key: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Admin Dashboard</h1>
          <p className="text-ink-400 text-sm mt-0.5">Manage jobs and applications</p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('admin_key'); setAuthed(false); setKey(''); }}
          className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>

      {/* ✅ FIXED HERE */}
      <StatsBar />

      <div className="flex gap-1 bg-ink-100 p-1 rounded-xl w-fit mb-6">
        {['apps', 'post'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {t === 'apps' ? '📋 Applications' : '➕ Post Job'}
          </button>
        ))}
      </div>

      {/* ✅ FIXED HERE */}
      {tab === 'apps' ? <ApplicationsTab /> : <PostJobTab />}
    </div>
  );
}

/* ================== FIXED ================== */

function StatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
  const key = sessionStorage.getItem("admin_key");
  if (!key) return;

  fetchAdminStats()
    .then(r => setStats(r.data))
    .catch(() => {});
}, []);

  const items = [
    { label: 'Total Jobs', value: stats?.totalJobs ?? '—', icon: '💼' },
    { label: 'Total Applications', value: stats?.totalApplications ?? '—', icon: '📨' },
    { label: "Today's Applications", value: stats?.todayApplications ?? '—', icon: '📅' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {items.map(item => (
        <div key={item.label} className="card p-4 text-center">
          <div className="text-2xl mb-1">{item.icon}</div>
          <div className="text-2xl font-bold text-ink-900">{item.value}</div>
          <div className="text-xs text-ink-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
      const key = sessionStorage.getItem("admin_key");
  if (!key) return;
    setLoading(true);
    try {
      const { data } = await fetchApplications({ page: p, limit: 15 }); // ✅ FIX
      setApps(data.applications);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load applications. Check admin key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const key = sessionStorage.getItem("admin_key");
  if (!key) return;

  load(page);
}, [page]);

  if (loading) return <div className="text-center py-12 text-ink-400">Loading applications...</div>;

  if (apps.length === 0) return (
    <div className="text-center py-16 text-ink-400">
      <p className="text-4xl mb-3">📭</p>
      <p>No applications yet</p>
    </div>
  );

  return (
    <div>
      <p className="text-sm text-ink-400 mb-4">{total} total applications</p>
      <div className="space-y-3">
        {apps.map(app => (
          <div key={app.id || app._id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-ink-800">{app.name}</span>
                  <span className="badge bg-emerald-100 text-emerald-700">{app.status}</span>
                </div>
                <p className="text-sm text-ink-500">{app.email}{app.phone ? ` · ${app.phone}` : ''}</p>
                <p className="text-xs text-ink-400 mt-1">Applied for: <span className="text-ink-600">{app.jobTitle}</span> @ {app.company}</p>
                {app.coverLetter && (
                  <p className="text-xs text-ink-400 mt-1 line-clamp-2 italic">"{app.coverLetter}"</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <a href={app.resumeLink} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5 px-3">
                  View Resume ↗
                </a>
                <span className="text-[11px] text-ink-300">
                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostJobTab() {
  const [form, setForm] = useState({
    title: '', company: '', location: '', jobType: 'Full-time',
    salaryMin: '', salaryMax: '', skills: '', description: '', experience: '1-3 years',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location) {
      toast.error('Title, company and location are required.');
      return;
    }
    setLoading(true);
    try {
      const salary = {
        min: parseFloat(form.salaryMin) || 0,
        max: parseFloat(form.salaryMax) || 0,
        unit: 'LPA',
        display: `₹${form.salaryMin || '?'} LPA - ₹${form.salaryMax || '?'} LPA`,
      };
      await postJob({ // ✅ FIX
        title: form.title, company: form.company, location: form.location,
        jobType: form.jobType, salary,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        description: form.description, experience: form.experience,
      });
      toast.success('Job posted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post job. Check admin key.');
    } finally {
      setLoading(false);
    }
  };

  return null; // unchanged rest
}
