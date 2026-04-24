const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

let Application, Job, store;

function getDataSource() {
  if (mongoose.connection.readyState === 1) {
    if (!Application) Application = require('../models').Application;
    if (!Job) Job = require('../models').Job;
    return 'mongo';
  }
  if (!store) store = require('../store');
  return 'memory';
}

// POST /apply
router.post('/', async (req, res) => {
  try {
    const { jobId, name, email, phone, resumeLink, coverLetter } = req.body;

    // Validate required fields
    if (!jobId || !name || !email || !resumeLink) {
      return res.status(400).json({ error: 'Missing required fields: jobId, name, email, resumeLink' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const ds = getDataSource();

    if (ds === 'mongo') {
      const job = await Job.findOne({ id: jobId });
      if (!job) return res.status(404).json({ error: 'Job not found' });

      // Check duplicate application
      const existing = await Application.findOne({ jobId, email });
      if (existing) return res.status(409).json({ error: 'You have already applied to this job' });

      const application = await Application.create({
        jobId,
        jobTitle: job.title,
        company: job.company,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        resumeLink: resumeLink.trim(),
        coverLetter: coverLetter?.trim(),
      });

      // Increment application count
      await Job.findOneAndUpdate({ id: jobId }, { $inc: { applicationCount: 1 } });

      return res.status(201).json({ message: 'Application submitted successfully!', id: application._id });
    }

    // In-memory fallback
    const job = store.jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const existing = store.applications.find(a => a.jobId === jobId && a.email === email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'You have already applied to this job' });

    const application = {
      id: uuidv4(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      resumeLink: resumeLink.trim(),
      coverLetter: coverLetter?.trim(),
      appliedAt: new Date().toISOString(),
      status: 'applied',
    };

    store.applications.push(application);
    const jobIdx = store.jobs.findIndex(j => j.id === jobId);
    if (jobIdx !== -1) store.jobs[jobIdx].applicationCount++;

    return res.status(201).json({ message: 'Application submitted successfully!', id: application.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

module.exports = router;
