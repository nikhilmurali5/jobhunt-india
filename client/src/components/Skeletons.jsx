import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 mb-2" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-ink-50">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="skeleton w-16 h-16 rounded-2xl" />
          <div className="flex-1">
            <div className="skeleton h-6 w-64 mb-2" />
            <div className="skeleton h-4 w-40 mb-1" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-4 mb-3" style={{width:`${70+i*5}%`}} />)}
      </div>
    </div>
  );
}
