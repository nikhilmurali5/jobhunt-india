const { v4: uuidv4 } = require('uuid');

const companies = [
  // Indian Tech Giants
  'Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra',
  'Cognizant', 'Mphasis', 'Hexaware', 'Persistent Systems', 'NIIT Technologies',
  // Indian Startups / New-age
  'Razorpay', 'Zepto', 'Swiggy', 'Zomato', 'Ola', 'Ola Electric',
  'CRED', 'Groww', 'PhonePe', 'Paytm', 'Meesho', 'Nykaa', 'Freshworks',
  'Zoho', 'BrowserStack', 'Postman', 'Chargebee', 'CleverTap', 'Hasura',
  // MNCs in India
  'Google India', 'Microsoft India', 'Amazon India', 'Samsung R&D',
  'IBM India', 'Accenture', 'Capgemini', 'Deloitte India', 'PwC India',
  'Goldman Sachs', 'JP Morgan', 'Deutsche Bank', 'Barclays', 'HSBC India',
  'Adobe India', 'SAP India', 'Oracle India', 'Salesforce India', 'VMware India',
  'Intel India', 'Qualcomm India', 'Texas Instruments', 'Bosch India', 'Siemens India',
  // Fintech / Others
  'Juspay', 'BankBazaar', 'PolicyBazaar', 'Lendingkart', 'KreditBee',
  'Jupiter', 'Fi Money', 'Slice', 'NoBroker', 'Urban Company',
];

const locations = [
  'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai',
  'Delhi NCR', 'Gurgaon', 'Noida', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Remote', 'Bangalore / Remote', 'Hyderabad / Remote',
  'Pan India (Remote)',
];

const jobTypes = ['Full-time', 'Internship', 'Contract', 'Remote', 'Hybrid'];

const skillSets = {
  'Software Engineer': ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Docker', 'Kubernetes', 'REST APIs', 'Git'],
  'Frontend Developer': ['React.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Next.js', 'GraphQL', 'Webpack', 'Jest'],
  'Backend Developer': ['Node.js', 'Python', 'Django', 'PostgreSQL', 'Redis', 'AWS', 'REST APIs', 'MongoDB'],
  'Full Stack Developer': ['React.js', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'AWS', 'Docker', 'Git'],
  'Data Engineer': ['Python', 'Apache Spark', 'Hadoop', 'SQL', 'ETL', 'Airflow', 'AWS Glue', 'Kafka'],
  'Data Scientist': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Tableau', 'Statistics'],
  'Data Analyst': ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Google Analytics', 'Statistics'],
  'ML Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLflow', 'Docker', 'AWS SageMaker', 'Kubernetes'],
  'DevOps Engineer': ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'CI/CD', 'Linux', 'Python'],
  'Cloud Engineer': ['AWS', 'Azure', 'GCP', 'Terraform', 'CloudFormation', 'Kubernetes', 'Networking', 'IAM'],
  'Android Developer': ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'MVVM', 'Retrofit', 'Room DB'],
  'iOS Developer': ['Swift', 'Objective-C', 'UIKit', 'SwiftUI', 'Xcode', 'Core Data', 'ARKit'],
  'UI/UX Designer': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems', 'Zeplin'],
  'Product Manager': ['Agile', 'JIRA', 'Roadmapping', 'Analytics', 'User Stories', 'A/B Testing', 'SQL'],
  'Business Analyst': ['SQL', 'Excel', 'Power BI', 'Stakeholder Management', 'Process Mapping', 'JIRA'],
  'QA Engineer': ['Selenium', 'Java', 'TestNG', 'Cypress', 'API Testing', 'Performance Testing', 'JIRA'],
  'Cybersecurity Analyst': ['SIEM', 'Penetration Testing', 'OWASP', 'Network Security', 'Python', 'ISO 27001'],
  'Blockchain Developer': ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'NFT', 'DeFi', 'Hardhat'],
  'AI Engineer': ['Python', 'LLMs', 'OpenAI API', 'LangChain', 'RAG', 'Vector DBs', 'Prompt Engineering'],
  'Site Reliability Engineer': ['Linux', 'Python', 'Kubernetes', 'Prometheus', 'Grafana', 'On-call', 'Incident Management'],
};

const descriptions = {
  'Software Engineer': `We are looking for a passionate Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining high-quality software solutions. You'll collaborate with cross-functional teams to deliver features that delight our users. The ideal candidate has a strong foundation in computer science fundamentals, writes clean and testable code, and thrives in an agile environment. You will participate in code reviews, technical discussions, and contribute to architectural decisions.`,

  'Frontend Developer': `Join our product team as a Frontend Developer to build exceptional user interfaces that serve millions of users. You will work closely with our design and backend teams to create fast, accessible, and visually stunning web applications. You should have a deep understanding of modern JavaScript frameworks, performance optimization, and cross-browser compatibility. You will own frontend features end-to-end, from design handoff to production deployment, and contribute to our design system.`,

  'Backend Developer': `We're hiring a Backend Developer to build scalable, reliable APIs and services that power our platform. You'll design database schemas, write business logic, and ensure system reliability at scale. You should be comfortable with distributed systems, understand CAP theorem, and have experience with cloud infrastructure. You'll work closely with the product team to translate business requirements into technical solutions and participate in on-call rotations.`,

  'Data Scientist': `As a Data Scientist, you will use statistical modeling and machine learning to extract insights from large datasets and drive business decisions. You will collaborate with product and engineering teams to formulate problems, collect and analyze data, build predictive models, and communicate findings to stakeholders. The role requires strong analytical thinking, programming skills, and the ability to translate complex results into actionable recommendations.`,

  'DevOps Engineer': `We are seeking a skilled DevOps Engineer to improve our infrastructure, automate deployments, and ensure system reliability. You will manage our cloud infrastructure, build CI/CD pipelines, and work closely with development teams to streamline releases. You should have hands-on experience with container orchestration, infrastructure-as-code, and monitoring systems. You will play a key role in building a developer-friendly platform that enables fast, safe deployments.`,

  'Product Manager': `We're looking for a Product Manager to define and drive the product roadmap for our core platform. You will work at the intersection of business, technology, and user experience to ship products that customers love. You'll gather user feedback, analyze metrics, prioritize features, and work closely with engineering, design, and business teams. The ideal PM is data-driven, customer-obsessed, and can communicate complex ideas clearly to diverse stakeholders.`,

  'UI/UX Designer': `Join our design team to shape the visual and interaction design of our products used by millions. You will own the end-to-end design process from user research, wireframing, and prototyping to final pixel-perfect designs. You'll collaborate closely with engineers to ensure quality implementation. We're looking for someone who has a strong portfolio, a deep understanding of user-centered design principles, and can balance aesthetics with usability.`,

  'Data Analyst': `As a Data Analyst, you will transform raw data into meaningful insights that inform business strategy. You'll build dashboards, run ad-hoc analyses, and present findings to leadership. You will work with large datasets using SQL and visualization tools to identify trends, measure KPIs, and support data-driven decision making across the organization. Strong analytical thinking and excellent communication skills are essential.`,
};

const salaryRanges = [
  { min: 3, max: 6 },
  { min: 4, max: 8 },
  { min: 5, max: 10 },
  { min: 6, max: 12 },
  { min: 8, max: 15 },
  { min: 10, max: 18 },
  { min: 12, max: 20 },
  { min: 15, max: 25 },
  { min: 18, max: 30 },
  { min: 3, max: 5 }, // interns
];

const experienceLevels = ['0-1 years', '1-3 years', '2-4 years', '3-5 years', '4-7 years', '5+ years', 'Fresher'];

const roles = Object.keys(skillSets);

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function generateJob(index) {
  const role = getRandom(roles);
  const company = getRandom(companies);
  const location = getRandom(locations);
  const jobType = getRandom(jobTypes);
  const salary = getRandom(salaryRanges);
  const skills = getRandomN(skillSets[role], Math.floor(Math.random() * 3) + 4);
  const experience = getRandom(experienceLevels);
  const isInternship = jobType === 'Internship';
  const internSalary = { min: 10000, max: 30000 }; // monthly stipend

  const descKey = Object.keys(descriptions).find(k => role.includes(k.split(' ')[0])) || 'Software Engineer';

  return {
    id: uuidv4(),
    title: isInternship ? `${role} Intern` : role,
    company,
    location,
    jobType,
    salary: isInternship
      ? { min: internSalary.min, max: internSalary.max, unit: 'month', display: `₹${internSalary.min.toLocaleString('en-IN')} - ₹${internSalary.max.toLocaleString('en-IN')}/mo` }
      : { min: salary.min, max: salary.max, unit: 'LPA', display: `₹${salary.min} LPA - ₹${salary.max} LPA` },
    skills,
    description: descriptions[descKey],
    experience,
    postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: Math.floor(Math.random() * 300),
    isRemote: location.includes('Remote'),
    isUrgent: Math.random() > 0.8,
    isFeatured: Math.random() > 0.85,
  };
}

// Generate extra specific jobs to ensure diversity
const specificJobs = [
  {
    id: uuidv4(),
    title: 'AI Engineer',
    company: 'Google India',
    location: 'Bangalore',
    jobType: 'Full-time',
    salary: { min: 30, max: 50, unit: 'LPA', display: '₹30 LPA - ₹50 LPA' },
    skills: ['Python', 'LLMs', 'LangChain', 'RAG', 'OpenAI API', 'Vector DBs', 'PyTorch'],
    description: descriptions['Software Engineer'],
    experience: '3-5 years',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: 520,
    isRemote: false,
    isUrgent: true,
    isFeatured: true,
  },
  {
    id: uuidv4(),
    title: 'Staff Engineer',
    company: 'Razorpay',
    location: 'Bangalore / Remote',
    jobType: 'Full-time',
    salary: { min: 40, max: 70, unit: 'LPA', display: '₹40 LPA - ₹70 LPA' },
    skills: ['Java', 'Distributed Systems', 'Kafka', 'AWS', 'System Design', 'Go'],
    description: descriptions['Software Engineer'],
    experience: '7+ years',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: 210,
    isRemote: true,
    isUrgent: false,
    isFeatured: true,
  },
  {
    id: uuidv4(),
    title: 'Founding Engineer',
    company: 'Stealth Fintech Startup',
    location: 'Bangalore',
    jobType: 'Full-time',
    salary: { min: 25, max: 45, unit: 'LPA', display: '₹25 LPA - ₹45 LPA + ESOP' },
    skills: ['Full Stack', 'React.js', 'Node.js', 'PostgreSQL', 'AWS', 'System Design'],
    description: descriptions['Software Engineer'],
    experience: '3-6 years',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: 89,
    isRemote: false,
    isUrgent: true,
    isFeatured: true,
  },
  {
    id: uuidv4(),
    title: 'SDE-1 (Fresher)',
    company: 'Swiggy',
    location: 'Bangalore',
    jobType: 'Full-time',
    salary: { min: 12, max: 18, unit: 'LPA', display: '₹12 LPA - ₹18 LPA' },
    skills: ['DSA', 'Java / Python', 'System Design Basics', 'SQL', 'Git'],
    description: descriptions['Software Engineer'],
    experience: 'Fresher',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: 1200,
    isRemote: false,
    isUrgent: false,
    isFeatured: false,
  },
  {
    id: uuidv4(),
    title: 'Summer Intern – Data Science',
    company: 'Flipkart',
    location: 'Bangalore',
    jobType: 'Internship',
    salary: { min: 25000, max: 50000, unit: 'month', display: '₹25,000 - ₹50,000/mo' },
    skills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Statistics'],
    description: descriptions['Data Scientist'],
    experience: 'Fresher',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: 950,
    isRemote: false,
    isUrgent: false,
    isFeatured: false,
  },
];

const jobs = [
  ...specificJobs,
  ...Array.from({ length: 155 }, (_, i) => generateJob(i)),
];

module.exports = jobs;
