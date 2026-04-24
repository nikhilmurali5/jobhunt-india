import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookmarkProvider } from './context/BookmarkContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Bookmarks from './pages/Bookmarks';
import Admin from './pages/Admin';

function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-saffron-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-ink-800">JobHunt India</span>
          </div>
          <p className="text-xs text-ink-400">Connecting talent with India's best opportunities · Built with ❤️ in India</p>
          <div className="flex gap-4 text-xs text-ink-400">
            <span>© 2024 JobHunt India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BookmarkProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-ink-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/post" element={<Admin />} />
              <Route path="*" element={
                <div className="text-center py-20">
                  <p className="text-6xl mb-4">🔍</p>
                  <h2 className="font-display text-2xl text-ink-800 mb-2">Page not found</h2>
                  <a href="/" className="btn-primary inline-block mt-4">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '12px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </BookmarkProvider>
  );
}
