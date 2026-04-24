# 🇮🇳 JobHunt India — Full-Stack Job Application Platform

A production-ready MVP for the Indian job market. Built with React + Tailwind CSS, Node.js + Express, and MongoDB.

---

## 📁 Project Structure

```
jobhunt-india/
├── client/                         # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Sticky top nav with mobile menu
│   │   │   ├── JobCard.jsx         # Job listing card with bookmark
│   │   │   ├── SearchFilters.jsx   # Search + filter bar
│   │   │   ├── ApplyModal.jsx      # Application modal with validation
│   │   │   ├── Pagination.jsx      # Smart pagination component
│   │   │   └── Skeletons.jsx       # Loading skeleton states
│   │   ├── context/
│   │   │   └── BookmarkContext.jsx # Global bookmark state (localStorage)
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Job listings + hero section
│   │   │   ├── JobDetail.jsx       # Full job detail + apply
│   │   │   ├── Bookmarks.jsx       # Saved jobs page
│   │   │   └── Admin.jsx           # Admin dashboard
│   │   ├── utils/
│   │   │   ├── api.js              # Axios API client
│   │   │   └── helpers.js          # Utility functions
│   │   ├── App.js                  # Router + layout
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Tailwind + custom styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── server/                         # Node.js backend
│   ├── data/
│   │   └── jobs.js                 # 160+ generated job listings
│   ├── routes/
│   │   ├── jobs.js                 # GET /jobs, GET /jobs/:id
│   │   ├── apply.js                # POST /apply
│   │   └── admin.js                # Admin routes (protected)
│   ├── models.js                   # Mongoose schemas (Job, Application)
│   ├── store.js                    # In-memory fallback store
│   ├── index.js                    # Express app entry
│   ├── package.json
│   └── .env.example
│
├── package.json                    # Root convenience scripts
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/jobs` | List jobs with search/filter/pagination | — |
| GET | `/jobs/featured` | Get featured jobs | — |
| GET | `/jobs/:id` | Single job detail | — |
| POST | `/apply` | Submit application | — |
| GET | `/admin/applications` | View all applications | x-admin-key |
| POST | `/admin/job` | Post new job | x-admin-key |
| GET | `/admin/stats` | Dashboard stats | x-admin-key |
| GET | `/health` | Health check | — |

**Query params for GET /jobs:**
- `search` — text search (title, company, location, skills)
- `location` — filter by city
- `jobType` — Full-time / Internship / Contract / Remote / Hybrid
- `minSalary` / `maxSalary` — LPA range
- `sort` — `newest` (default) or `salary`
- `page` / `limit` — pagination

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone and install
git clone <your-repo>
cd jobhunt-india

# Install all dependencies
npm run install:all

# OR manually:
cd server && npm install
cd ../client && npm install
```

### Start Backend

```bash
cd server
cp .env     # Edit with your values
npm run dev              # Starts on http://localhost:5000
```

### Start Frontend (new terminal)

```bash
cd client
cp .env .env     # Set REACT_APP_API_URL=http://localhost:5000
npm start                # Starts on http://localhost:3000
```

> 💡 **No MongoDB?** The server works perfectly with its in-memory JSON store out of the box. Just don't set `MONGO_URI` in `.env`.

---

## 🌐 Deployment on Render.com

### Step 1: MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a **Free Tier Cluster** (M0 Sandbox)
3. Under **Database Access**: Add user with password
4. Under **Network Access**: Add IP `0.0.0.0/0` (allow all — for Render)
5. Click **Connect** → **Drivers** → Copy the connection string
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/jobhunt?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy Backend on Render

1. Push your code to GitHub (or GitLab)
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your repository
4. Configure:
   - **Name**: `jobhunt-india-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add **Environment Variables**:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/jobhunt
   ADMIN_KEY=your-secret-admin-key-here
   CLIENT_URL=https://your-frontend.onrender.com
   ```
6. Click **Create Web Service**
7. Wait for deploy → Note your backend URL (e.g., `https://jobhunt-india-api.onrender.com`)

---

### Step 3: Seed MongoDB (first run)

After backend is live, call:
```bash
curl https://jobhunt-india-api.onrender.com/health
```

The in-memory store seeds automatically. To persist to MongoDB on first call, hit any `/jobs` endpoint — but note: **the in-memory store resets on every Render restart**. To seed MongoDB:

1. Add this one-time seed route temporarily in `server/index.js` or run locally:

```javascript
// Add to server/index.js temporarily
app.get('/seed', async (req, res) => {
  const jobs = require('./data/jobs');
  const { Job } = require('./models');
  await Job.deleteMany({});
  await Job.insertMany(jobs);
  res.json({ message: `Seeded ${jobs.length} jobs` });
});
```

2. Visit `https://your-api.onrender.com/seed` once
3. Remove the seed route and redeploy

---

### Step 4: Deploy Frontend on Render

1. Go to Render → **New** → **Static Site**
2. Connect same repository
3. Configure:
   - **Name**: `jobhunt-india`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add **Environment Variable**:
   ```
   REACT_APP_API_URL=https://jobhunt-india-api.onrender.com
   ```
5. Click **Create Static Site**

---

### Step 5: Connect Frontend ↔ Backend

1. Once frontend is deployed, copy its URL (e.g., `https://jobhunt-india.onrender.com`)
2. Go to your **backend service** → **Environment** tab
3. Update `CLIENT_URL=https://jobhunt-india.onrender.com`
4. **Save** → backend will auto-redeploy

---

### Step 6: Admin Access

- Visit `https://your-frontend.onrender.com/admin`
- Enter the `ADMIN_KEY` you set in backend environment variables
- Default (local dev only): `admin123`

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 160+ realistic Indian job listings | ✅ |
| Search by title, company, skill | ✅ |
| Filter by location, job type, salary | ✅ |
| Pagination (12 jobs/page) | ✅ |
| Apply via modal (name, email, phone, resume link) | ✅ |
| Duplicate application prevention | ✅ |
| Bookmark / save jobs (localStorage) | ✅ |
| Admin: post new job | ✅ |
| Admin: view all applications | ✅ |
| Admin: dashboard stats | ✅ |
| Loading skeletons | ✅ |
| Toast notifications | ✅ |
| Mobile responsive | ✅ |
| MongoDB Atlas + in-memory fallback | ✅ |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS 3, custom fonts (Playfair Display, DM Sans) |
| HTTP client | Axios |
| Notifications | react-hot-toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose) with JSON fallback |
| Deployment | Render.com |

---

## 🔑 Environment Variables Summary

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://...         # Optional — falls back to in-memory
ADMIN_KEY=your-secret-key           # Required for admin routes
CLIENT_URL=http://localhost:3000    # CORS origin
```

### Client (`client/.env`)
```env
REACT_APP_API_URL=http://localhost:5000  # Points to backend
```

---

## 📝 Customization

- **Add more jobs**: Edit `server/data/jobs.js` — add to the `specificJobs` array
- **Change admin key**: Update `ADMIN_KEY` in server `.env`
- **Brand colors**: Edit `tailwind.config.js` — update `saffron` and `ink` color scales
- **Job types / locations**: Update arrays in `SearchFilters.jsx` and `jobs.js`

---

Built with ❤️ for India's job market. Good luck! 🚀
