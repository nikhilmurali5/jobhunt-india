import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Session ID helper (no external uuid dep needed) ─────────────────────────
function getOrCreateSessionId() {
  const KEY = 'jh_chat_session';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // crypto.randomUUID is available in all modern browsers
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

const API_BASE = process.env.REACT_APP_API_URL || "https://jobhunt-india.onrender.com";

// ─── Suggested prompts shown when chat is empty ───────────────────────────────
const SUGGESTIONS = [
  { icon: '📄', label: 'Analyse my resume', prompt: 'Please analyse my uploaded resume and give feedback.' },
  { icon: '🎯', label: 'Suggest matching jobs', prompt: 'Suggest jobs that match my resume.' },
  { icon: '💡', label: 'Career advice', prompt: 'What skills should I learn to advance my career?' },
  { icon: '❓', label: 'How to apply?', prompt: 'How do I apply for a job on this portal?' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-ink-300 inline-block"
          style={{ animation: 'chatBounce 1.2s ease-in-out infinite', animationDelay: i * 0.2 + 's' }}
        />
      ))}
    </div>
  );
}

function MatchBar({ percent }) {
  const color = percent >= 70 ? '#10b981' : percent >= 40 ? '#f87c1e' : '#71717a';
  return (
    <div className="mt-1.5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-ink-400">Match</span>
        <span className="text-[11px] font-bold" style={{ color }}>{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: percent + '%', backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function JobCard({ job, onApply }) {
  return (
    <div className="bg-white border border-ink-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
          style={{ backgroundColor: stringToColor(job.company) }}
        >
          {(job.company || '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink-800 leading-tight truncate">{job.title}</p>
          <p className="text-[11px] text-ink-400 truncate">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span className="inline-flex items-center text-[10px] bg-ink-50 text-ink-500 px-1.5 py-0.5 rounded-md">
          📍 {job.location}
        </span>
        {job.jobType && (
          <span className="inline-flex items-center text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
            {job.jobType}
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">
            💰 {job.salary}
          </span>
        )}
      </div>

      <MatchBar percent={job.matchPercent} />

      <p className="text-[10px] text-ink-400 mt-1.5 mb-2.5 leading-relaxed line-clamp-2">
        {job.reason}
      </p>

      <button
        onClick={() => onApply(job.id)}
        className="w-full text-center text-xs font-semibold py-1.5 px-3 rounded-lg text-white transition-all duration-200 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f87c1e, #e96214)' }}
      >
        View & Apply →
      </button>
    </div>
  );
}

// simple deterministic colour from string
function stringToColor(str) {
  const palette = ['#f87c1e', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = (str || '').charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// Format plain text with basic markdown-lite
function FormattedText({ text }) {
  const lines = (text || '').split('\n');
  return (
    <div className="text-xs leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <div key={i} className="flex gap-1.5"><span className="text-saffron-500 mt-0.5 flex-shrink-0">•</span><span>{line.replace(/^[-•]\s/, '')}</span></div>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-ink-800">{line.slice(2, -2)}</p>;
        }
        // Bold inline text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isMinimised, setIsMinimised] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(getOrCreateSessionId());
  const inputRef = useRef(null);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimised, loading]);

  // ── Focus input when opened ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimised) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimised]);

  // ── Welcome message on first open ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        role: 'bot',
        text: "👋 Hi! I'm your **JobHunt AI Assistant**.\n\nI can help you with:\n- 📄 Resume analysis\n- 🎯 Job matching\n- 💡 Career guidance\n- ❓ Portal FAQs\n\nUpload your resume or ask me anything job-related!",
        type: 'text',
      }]);
    }
  }, [isOpen, messages.length]);

  // ── Apply navigate ────────────────────────────────────────────────────────────
  const handleApply = useCallback((jobId) => {
    navigate('/jobs/' + jobId);
    setIsOpen(false);
  }, [navigate]);

  // ── File selection ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      addBotMessage('Only PDF resumes are accepted. Please choose a .pdf file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addBotMessage('File is too large (max 5 MB). Please compress your PDF and try again.');
      return;
    }
    setPendingFile(file);
    addSystemMessage('📎 ' + file.name + ' selected — click Send to upload');
    // reset so same file can be re-selected
    e.target.value = '';
  };

  // ── Message adders ────────────────────────────────────────────────────────────
  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), role: 'system', text, type: 'text' }]);
  };
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text, type: 'text' }]);
    if (!isOpen) setUnreadCount(n => n + 1);
  };

  // ── Send ──────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text && !pendingFile) return;

    setLoading(true);

    // Add user message to UI
    if (text) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, type: 'text' }]);
    }
    setInput('');

    // Build form data
    const formData = new FormData();
    formData.append('message', text);
    formData.append('sessionId', sessionId.current);
    if (pendingFile) {
      formData.append('resume', pendingFile);
      setPendingFile(null);
    }

    try {
      const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 sec

const response = await fetch(API_BASE + '/ai/chat', {
  method: 'POST',
  body: formData,
  signal: controller.signal,
});

clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Server responded with ' + response.status);
      }

      const data = await response.json();

      if (data.jobs && Array.isArray(data.jobs)) {
        setResumeUploaded(true);
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'bot',
          type: 'jobs',
          jobs: data.jobs,
          text: 'Here are your top matched jobs:',
        }]);
      } else if (data.reply) {
        // Detect if resume was just uploaded successfully
        if (data.reply.toLowerCase().includes('resume uploaded') || data.reply.toLowerCase().includes('analysed')) {
          setResumeUploaded(true);
        }
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'bot',
          type: 'text',
          text: data.reply,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'bot',
          type: 'text',
          text: 'Something went wrong. Please try again.',
        }]);
      }
    } catch (err) {
      console.error('[Chatbot fetch error]', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'bot',
        type: 'text',
       text: 'Server is slow (Render free tier). Please wait 10–20 seconds and try again.'
      }]);
    }

    setLoading(false);
  }, [input, pendingFile]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    setIsMinimised(false);
  };

  const handleSuggestion = (prompt) => {
    sendMessage(prompt);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        .chat-window { animation: chatSlideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .chat-fab { animation: chatPulse 2.5s ease-in-out infinite; }
        .chat-fab:hover { animation: none; }
      `}</style>

      {/* ── FAB Button ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open AI Career Assistant"
          className="chat-fab fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f87c1e 0%, #c14c12 100%)' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="chat-window fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-ink-100 overflow-hidden"
          style={{ width: 360, height: isMinimised ? 60 : 580, maxHeight: 'calc(100vh - 100px)', transition: 'height 0.25s ease' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #f87c1e 0%, #c14c12 100%)' }}
            onClick={() => setIsMinimised(m => !m)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">AI Career Assistant</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                  <span className="text-[10px] text-white/70">Powered by Groq</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {resumeUploaded && (
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                  📄 Resume ready
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimised(m => !m); }}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                aria-label={isMinimised ? 'Expand' : 'Minimise'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  {isMinimised
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimised && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-ink-50">

                {/* Suggestion chips (only when only the welcome msg is shown) */}
                {messages.length === 1 && (
                  <div className="grid grid-cols-2 gap-1.5 mb-1">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s.label}
                        onClick={() => handleSuggestion(s.prompt)}
                        className="text-left text-[11px] bg-white border border-ink-200 hover:border-saffron-400 hover:bg-saffron-50 text-ink-600 hover:text-saffron-700 rounded-xl p-2.5 transition-all duration-150 leading-snug"
                      >
                        <span className="block text-base mb-0.5">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} className={
                    msg.role === 'user' ? 'flex justify-end' :
                    msg.role === 'system' ? 'flex justify-center' :
                    'flex justify-start'
                  }>
                    {/* Bot avatar */}
                    {msg.role === 'bot' && (
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-1.5 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #f87c1e, #c14c12)' }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                        </svg>
                      </div>
                    )}

                    <div className={
                      msg.role === 'system'
                        ? 'text-[10px] text-ink-400 bg-white border border-ink-100 px-3 py-1.5 rounded-full'
                        : msg.role === 'user'
                        ? 'max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm text-white text-xs shadow-sm'
                        : 'max-w-[88%] px-3 py-2 rounded-2xl rounded-tl-sm bg-white border border-ink-100 shadow-sm'
                    }
                    style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #f87c1e, #c14c12)' } : {}}
                    >
                      {msg.type === 'jobs' ? (
                        <div>
                          <p className="text-xs font-semibold text-ink-700 mb-2">{msg.text}</p>
                          <div className="space-y-2">
                            {(msg.jobs || []).slice(0, 5).map((job, idx) => (
                              <JobCard key={job.id || idx} job={job} onApply={handleApply} />
                            ))}
                          </div>
                          {(msg.jobs || []).length > 5 && (
                            <p className="text-[10px] text-ink-400 mt-2 text-center">
                              +{msg.jobs.length - 5} more matches available
                            </p>
                          )}
                        </div>
                      ) : (
                        <FormattedText text={msg.text} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-1.5"
                      style={{ background: 'linear-gradient(135deg, #f87c1e, #c14c12)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                      </svg>
                    </div>
                    <div className="bg-white border border-ink-100 rounded-2xl rounded-tl-sm shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pending file indicator */}
              {pendingFile && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-saffron-50 border-t border-saffron-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[11px] text-saffron-700 font-medium truncate">{pendingFile.name}</span>
                  </div>
                  <button onClick={() => setPendingFile(null)} className="text-saffron-400 hover:text-saffron-600 flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Input bar */}
              <div className="flex items-center gap-1.5 px-2 py-2 border-t border-ink-100 bg-white flex-shrink-0">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Attach button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  title="Upload PDF resume"
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-saffron-50 text-ink-400 hover:text-saffron-600 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={pendingFile ? 'Add a message (optional)...' : 'Ask about jobs, resume, career...'}
                  disabled={loading}
                  className="flex-1 text-xs bg-ink-50 border border-ink-200 rounded-xl px-3 py-2 text-ink-800 placeholder-ink-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  style={{ '--tw-ring-color': '#f87c1e' }}
                />

                {/* Send button */}
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || (!input.trim() && !pendingFile)}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-40 text-white"
                  style={{ background: 'linear-gradient(135deg, #f87c1e, #c14c12)' }}
                >
                  {loading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="px-3 py-1.5 bg-ink-50 border-t border-ink-100 flex-shrink-0">
                <p className="text-[9px] text-ink-300 text-center">
                  Restricted to job-related queries only • JobHunt India
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
