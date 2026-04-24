const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let Job, store;

function getDataSource() {
  if (mongoose.connection.readyState === 1) {
    if (!Job) Job = require('../models').Job;
    return 'mongo';
  }
  if (!store) store = require('../store');
  return 'memory';
}

// GET /jobs — list with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      location = '',
      jobType = '',
      minSalary = '',
      maxSalary = '',
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const ds = getDataSource();

    if (ds === 'mongo') {
      // MongoDB query
      const query = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
        ];
      }
      if (location && location !== 'All') query.location = { $regex: location, $options: 'i' };
      if (jobType && jobType !== 'All') query.jobType = jobType;
      if (minSalary) query['salary.min'] = { $gte: parseFloat(minSalary) };
      if (maxSalary) query['salary.max'] = { $lte: parseFloat(maxSalary) };

      const sortObj = sort === 'salary' ? { 'salary.min': -1 } : { postedAt: -1 };
      const total = await Job.countDocuments(query);
      const jobs = await Job.find(query).sort(sortObj).skip(skip).limit(limitNum);
      return res.json({ jobs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }

    // In-memory fallback
    let jobs = [...store.jobs];
    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.location.toLowerCase().includes(s) ||
        j.skills.some(sk => sk.toLowerCase().includes(s))
      );
    }
    if (location && location !== 'All') {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (jobType && jobType !== 'All') {
      jobs = jobs.filter(j => j.jobType === jobType);
    }
    if (minSalary) jobs = jobs.filter(j => j.salary.unit === 'LPA' && j.salary.min >= parseFloat(minSalary));
    if (maxSalary) jobs = jobs.filter(j => j.salary.unit === 'LPA' && j.salary.max <= parseFloat(maxSalary));

    if (sort === 'salary') jobs.sort((a, b) => (b.salary.min || 0) - (a.salary.min || 0));
    else jobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    const total = jobs.length;
    const paginated = jobs.slice(skip, skip + limitNum);
    return res.json({ jobs: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /jobs/featured — featured jobs
router.get('/featured', async (req, res) => {
  try {
    const ds = getDataSource();
    if (ds === 'mongo') {
      const jobs = await Job.find({ isFeatured: true }).sort({ postedAt: -1 }).limit(6);
      return res.json(jobs);
    }
    const jobs = store.jobs.filter(j => j.isFeatured).slice(0, 6);
    return res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured jobs' });
  }
});

// GET /jobs/:id — single job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ds = getDataSource();

    if (ds === 'mongo') {
      const job = await Job.findOne({ id });
      if (!job) return res.status(404).json({ error: 'Job not found' });
      return res.json(job);
    }

    const job = store.jobs.find(j => j.id === id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;
