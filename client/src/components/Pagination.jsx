import React from 'react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="btn-secondary py-2 px-3 text-sm disabled:opacity-40"
      >
        ← Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onChange(1)} className="btn-ghost text-sm w-9 h-9">1</button>
          {pages[0] > 2 && <span className="text-ink-300 px-1">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`text-sm w-9 h-9 rounded-xl font-medium transition-all ${
            p === page ? 'bg-saffron-500 text-white shadow-sm' : 'hover:bg-ink-100 text-ink-600'
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-ink-300 px-1">…</span>}
          <button onClick={() => onChange(totalPages)} className="btn-ghost text-sm w-9 h-9">{totalPages}</button>
        </>
      )}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="btn-secondary py-2 px-3 text-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
