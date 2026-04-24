// In-memory data store (used when MongoDB is not configured)
const seedJobs = require('./data/jobs');

const store = {
  jobs: [...seedJobs],
  applications: [],
};

module.exports = store;
