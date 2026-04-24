import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobhunt_bookmarks') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('jobhunt_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (job) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === job.id);
      if (exists) return prev.filter(b => b.id !== job.id);
      return [...prev, { id: job.id, title: job.title, company: job.company, location: job.location, salary: job.salary }];
    });
  };

  const isBookmarked = (id) => bookmarks.some(b => b.id === id);

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarkContext);
