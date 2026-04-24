import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { submitApplication } from '../utils/api';

export default function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', resumeLink: '', coverLetter: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.resumeLink.trim()) e.resumeLink = 'Resume link is required';
    else if (!/^https?:\/\/.+/.test(form.resumeLink)) e.resumeLink = 'Must be a valid URL (https://...)';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await submitApplication({ jobId: job.id, ...form });
      setSubmitted(true);
      toast.success('Application submitted! 🎉', { duration: 4000 });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit. Please try again.';
      if (msg.includes('already applied')) {
        toast.error('You have already applied to this job.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="modal-backdrop flex items-end sm:items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-ink-100">
          <div>
            <h2 className="font-display font-semibold text-lg text-ink-900">Apply for this role</h2>
            <p className="text-sm text-ink-400 mt-0.5">{job.title} · {job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-100 text-ink-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-ink-900 mb-2">Application Sent!</h3>
            <p className="text-ink-500 text-sm mb-6">We'll let the company know. Good luck, {form.name.split(' ')[0]}! 🤞</p>
            <button onClick={onClose} className="btn-primary w-full">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Full Name *</label>
              <input
                className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="Priya Sharma"
                value={form.name}
                onChange={handleChange('name')}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="priya@example.com"
                value={form.email}
                onChange={handleChange('email')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange('phone')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Resume / Portfolio Link *</label>
              <input
                className={`input ${errors.resumeLink ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="https://drive.google.com/your-resume"
                value={form.resumeLink}
                onChange={handleChange('resumeLink')}
              />
              {errors.resumeLink && <p className="text-xs text-red-500 mt-1">{errors.resumeLink}</p>}
              <p className="text-[11px] text-ink-400 mt-1">Google Drive, LinkedIn, GitHub, or personal site</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Cover Letter <span className="text-ink-400 font-normal">(optional)</span></label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Tell the recruiter why you're a great fit..."
                value={form.coverLetter}
                onChange={handleChange('coverLetter')}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
