require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');

const jobRoutes = require('./routes/jobs');
const applyRoutes = require('./routes/apply');
const adminRoutes = require('./routes/admin');
const jobs = require('./data/jobs');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Groq Client ──────────────────────────────────────────────────────────────
let groqClient = null;
function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// ─── Multer memory storage ────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ─── In-memory session store ──────────────────────────────────────────────────
const sessions = {};
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  Object.keys(sessions).forEach(id => {
    if (sessions[id]._createdAt < cutoff) delete sessions[id];
  });
}, 30 * 60 * 1000);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Existing routes (UNCHANGED) ─────────────────────────────────────────────
app.use('/jobs', jobRoutes);
app.use('/apply', applyRoutes);
app.use('/admin', adminRoutes);

app.get('/', (_req, res) => res.json({ message: 'JobHunt India API v1.0', status: 'running' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ═════════════════════════════════════════════════════════════════════════════
//  AI HELPERS
// ═════════════════════════════════════════════════════════════════════════════

const JOB_SCOPE_KEYWORDS = [
  'job', 'jobs', 'career', 'careers', 'resume', 'cv',
  'apply', 'application', 'hire', 'hiring', 'recruit',
  'skill', 'skills', 'experience', 'salary', 'work',
  'interview', 'internship', 'remote', 'role', 'roles',
  'company', 'opening', 'vacancy', 'suggest', 'recommend',
  'learn', 'course', 'certification', 'portfolio', 'linkedin',
  'fresher', 'placement', 'offer', 'letter', 'profile',
  'how to apply', 'what jobs', 'job portal', 'jobhunt',
  'about this', 'how does', 'how do i', 'what is this',
  'help', 'guide', 'start', 'begin', 'search', 'filter',
];

const OUT_OF_SCOPE_REPLY =
  "I'm here to help with job-related queries, resume analysis, and career guidance only. " +
  "Please ask me about jobs, your resume, career advice, or how to use this portal!";

function isJobRelated(message) {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return JOB_SCOPE_KEYWORDS.some(kw => lower.includes(kw));
}

function matchJobsToResume(resumeText) {
  const text = resumeText.toLowerCase();
  const scored = jobs.map(job => {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    const matched = jobSkills.filter(skill => text.includes(skill.toLowerCase()));
    const matchPercent = jobSkills.length
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary && job.salary.display ? job.salary.display : 'Not specified',
      jobType: job.jobType,
      matchPercent,
      reason: matched.length > 0
        ? 'Matched skills: ' + matched.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
        : 'General match — consider upskilling',
      skills: job.skills || [],
    };
  });
  return scored
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 8);
}

function buildResumeSummary(resumeText) {
  const text = resumeText.slice(0, 3000);
  const allSkills = new Set();
  jobs.forEach(job => {
    (job.skills || []).forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) allSkills.add(skill);
    });
  });
  return allSkills.size > 0
    ? 'Skills detected: ' + [...allSkills].slice(0, 30).join(', ') + '.'
    : 'Resume uploaded but specific skills could not be clearly identified.';
}

const SYSTEM_PROMPT = `You are an AI career assistant for JobHunt India, a job portal.

STRICT RULE: ONLY answer questions about:
- Job searching and job recommendations
- Resume review and improvement tips
- Career guidance and skill development
- How to use this job portal (apply, bookmark, search, filter)
- Interview preparation and salary negotiation

If ANY question is unrelated to jobs, resumes, or careers, respond EXACTLY:
"I'm here to help with job-related queries, resume analysis, and career guidance only."

Guidelines:
- Be concise, professional, and encouraging
- When resume data is available, personalise your advice
- Keep responses under 200 words
- Format lists with bullet points when helpful`;

// ═════════════════════════════════════════════════════════════════════════════
//  POST /ai/chat
// ═════════════════════════════════════════════════════════════════════════════
app.post('/ai/chat', upload.single('resume'), async (req, res) => {
  try {
    const message = req.body.message || '';
    const sessionId = req.body.sessionId || 'default';

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        resumeText: '',
        resumeSummary: '',
        history: [],
        _createdAt: Date.now(),
      };
    }
    const session = sessions[sessionId];

    // ── Handle resume upload ─────────────────────────────────────────────────
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.json({ reply: 'Only PDF files are accepted. Please upload a .pdf resume.' });
      }
      try {
        const parsed = await pdfParse(req.file.buffer);
        const rawText = (parsed.text || '').trim();
        if (!rawText || rawText.length < 20) {
          session.resumeText = 'uploaded but text not extractable';
          session.resumeSummary = 'Resume uploaded (scanned/image PDF).';
          return res.json({
            reply: "Resume uploaded! It appears to be a scanned PDF so I couldn't extract text perfectly. I'll still try to help. Ask me to suggest jobs or describe your skills!",
          });
        }
        session.resumeText = rawText.toLowerCase();
        session.resumeSummary = buildResumeSummary(session.resumeText);
        session.history = [];
        return res.json({
          reply: 'Resume uploaded and analysed!\n\n' + session.resumeSummary + '\n\nYou can now ask me to suggest matching jobs, review your resume, or get career advice tailored to your profile.',
        });
      } catch (pdfErr) {
        console.error('[PDF PARSE ERROR]', pdfErr.message);
        session.resumeText = 'uploaded';
        session.resumeSummary = 'Resume uploaded (parsing encountered an issue).';
        return res.json({
          reply: "Resume uploaded! I had some trouble reading the content but I can still help. Try asking 'suggest jobs for me' or describe your skills.",
        });
      }
    }

    // ── Validate message ──────────────────────────────────────────────────────
    if (!message.trim()) {
      return res.json({ reply: 'Please type a message or upload your resume to get started.' });
    }

    // ── SCOPE GUARD (backend layer) ───────────────────────────────────────────
    if (!isJobRelated(message)) {
      return res.json({ reply: OUT_OF_SCOPE_REPLY });
    }

    // ── Job matching intent ───────────────────────────────────────────────────
    const lower = message.toLowerCase();
    const isJobMatchRequest =
      lower.includes('suggest') ||
      lower.includes('recommend') ||
      lower.includes('match') ||
      lower.includes('find job') ||
      lower.includes('find me') ||
      lower.includes('jobs for me') ||
      lower.includes('suitable job') ||
      lower.includes('best job') ||
      (lower.includes('job') && (lower.includes('my') || lower.includes('for me')));

    if (isJobMatchRequest) {
      if (!session.resumeText) {
        return res.json({
          reply: "I'd love to suggest matching jobs! Please upload your PDF resume first using the paperclip button, and I'll find the best opportunities for you.",
        });
      }
      const matchedJobs = matchJobsToResume(session.resumeText);
      return res.json({ jobs: matchedJobs });
    }

    // ── Groq LLM call ─────────────────────────────────────────────────────────
    const groq = getGroqClient();

    let contextNote = '';
    if (session.resumeSummary) {
      contextNote = '[User resume context: ' + session.resumeSummary + ']\n\n';
    }

    const trimmedHistory = session.history.slice(-6);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmedHistory,
      { role: 'user', content: contextNote + message.trim() },
    ];

    let aiReply = '';
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 400,
        temperature: 0.6,
      });
      aiReply = (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content)
        ? completion.choices[0].message.content.trim()
        : '';
    } catch (groqErr) {
      console.error('[GROQ ERROR]', groqErr.status, groqErr.message);
      if (groqErr.status === 401) {
        return res.json({ reply: 'AI service configuration error. Please contact support.' });
      }
      if (groqErr.status === 429) {
        return res.json({ reply: "I'm receiving too many requests right now. Please wait a moment and try again." });
      }
      return res.json({ reply: 'AI service is temporarily unavailable. Please try again shortly.' });
    }

    if (!aiReply) {
      aiReply = "I'm not sure how to answer that. Try asking about jobs, your resume, or career advice!";
    }

    session.history.push(
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: aiReply },
    );

    return res.json({ reply: aiReply });

  } catch (err) {
    console.error('[AI ROUTE ERROR]', err);
    return res.status(500).json({ reply: 'An unexpected error occurred. Please try again.' });
  }
});

// ─── 404 + Error handlers ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── DB + Start ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log('Server running on port ' + PORT));
    })
    .catch(err => {
      console.error('MongoDB connection failed, falling back to in-memory store:', err.message);
      startWithFallback();
    });
} else {
  console.log('No MONGO_URI — using in-memory JSON store');
  startWithFallback();
}

function startWithFallback() {
  app.listen(PORT, () => console.log('Server running on port ' + PORT + ' (in-memory mode)'));
}
