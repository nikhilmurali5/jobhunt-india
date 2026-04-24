const mongoose = require('mongoose');

// ─── Job Schema ───────────────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Internship', 'Contract', 'Remote', 'Hybrid'], default: 'Full-time' },
  salary: {
    min: Number,
    max: Number,
    unit: String,
    display: String,
  },
  skills: [String],
  description: String,
  experience: String,
  postedAt: { type: Date, default: Date.now },
  applicationCount: { type: Number, default: 0 },
  isRemote: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', location: 'text', skills: 'text' });

// ─── Application Schema ───────────────────────────────────────────────────────
const applicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  jobTitle: String,
  company: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  resumeLink: { type: String, required: true },
  coverLetter: String,
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['applied', 'screening', 'interview', 'offer', 'rejected'], default: 'applied' },
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

module.exports = { Job, Application };
