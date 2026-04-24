const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

let Job, Application, store;

// Simple API key middleware for admin routes
const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'] || req.query.key;
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
  if (apiKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide valid admin key.' });
  }
  next();
};

function getDataSource() {
  if (mongoose.connection.readyState === 1) {
    if (!Job) Job = require('../models').Job;
    if (!Application) Application = require('../models').Application;
    return 'mongo';
  }
  if (!store) store = require('../store');
  return 'memory';
}

// POST /admin/job — add new job
router.post('/job', adminAuth, async (req, res) => {
  try {
    const { title, company, location, jobType, salary, skills, description, experience } = req.body;
    if (!title || !company || !location) {
      return res.status(400).json({ error: 'title, company, location are required' });
    }

    const ds = getDataSource();
    const newJob = {
      id: uuidv4(),
      title,
      company,
      location,
      jobType: jobType || 'Full-time',
      salary: salary || { min: 5, max: 10, unit: 'LPA', display: '₹5 LPA - ₹10 LPA' },
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()),
      description: description || '',
      experience: experience || 'Not specified',
      postedAt: new Date().toISOString(),
      applicationCount: 0,
      isRemote: location.toLowerCase().includes('remote'),
      isUrgent: false,
      isFeatured: false,
    };

    if (ds === 'mongo') {
      const job = await Job.create(newJob);
      return res.status(201).json({ message: 'Job posted successfully', job });
    }

    store.jobs.unshift(newJob);
    return res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// GET /admin/applications — view all applications
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, jobId = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const ds = getDataSource();

    if (ds === 'mongo') {
      const query = jobId ? { jobId } : {};
      const total = await Application.countDocuments(query);
      const applications = await Application.find(query)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum);
      return res.json({ applications, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }

    let apps = [...store.applications];
    if (jobId) apps = apps.filter(a => a.jobId === jobId);
    apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    const total = apps.length;
    return res.json({
      applications: apps.slice(skip, skip + limitNum),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const ds = getDataSource();
    if (ds === 'mongo') {
      const totalJobs = await Job.countDocuments();
      const totalApps = await Application.countDocuments();
      const todayApps = await Application.countDocuments({
        appliedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });
      return res.json({ totalJobs, totalApplications: totalApps, todayApplications: todayApps });
    }
    return res.json({
      totalJobs: store.jobs.length,
      totalApplications: store.applications.length,
      todayApplications: store.applications.filter(a =>
        new Date(a.appliedAt).toDateString() === new Date().toDateString()
      ).length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
