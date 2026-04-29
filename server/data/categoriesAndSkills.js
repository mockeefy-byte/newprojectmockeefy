/**
 * Shared IT company categories and skills for seeding.
 * Used by: seedCategoriesAndSkills.js, dummySeed.js
 */

export const categoriesData = [
  { name: "IT", description: "Information Technology – general software and systems" },
  { name: "Software Development", description: "Core programming, OOP, algorithms, design patterns" },
  { name: "Web Development", description: "Frontend, backend, and full-stack web" },
  { name: "Mobile Development", description: "iOS, Android, and cross-platform apps" },
  { name: "DevOps & Cloud", description: "CI/CD, AWS, Azure, GCP, Docker, Kubernetes" },
  { name: "Data Science & ML", description: "Machine learning, NLP, data engineering, analytics" },
  { name: "Cybersecurity", description: "Application security, network security, compliance" },
  { name: "Database", description: "SQL, NoSQL, data modeling, performance" },
  { name: "QA & Testing", description: "Manual, automation, API and performance testing" },
  { name: "Agile & Project Management", description: "Scrum, Jira, leadership, delivery" },
  { name: "System Design", description: "Distributed systems, scalability, architecture" },
  { name: "AI", description: "Artificial Intelligence and machine learning" },
  { name: "HR", description: "Human Resources – recruitment and people ops" },
  { name: "Business", description: "Business analysis and strategy" },
  { name: "Design", description: "UI/UX and product design" },
];

export const skillsData = {
  IT: [
    "JavaScript", "Python", "Java", "C#", "C++", "Go", "Rust", "TypeScript",
    "React", "Node.js", "Angular", "Vue.js", "AWS", "Docker", "Kubernetes",
    "REST APIs", "GraphQL", "Git", "Linux", "SQL", "MongoDB", "System Design",
  ],
  "Software Development": [
    "Algorithms", "Data Structures", "OOP", "Design Patterns", "Clean Code",
    "Java", "Python", "C#", "C++", "Go", "Rust", "Scala", "Kotlin",
    "Code Review", "Refactoring", "Unit Testing", "TDD", "SOLID Principles",
  ],
  "Web Development": [
    "React", "Angular", "Vue.js", "Next.js", "JavaScript", "TypeScript",
    "HTML/CSS", "Tailwind CSS", "Node.js", "Express", "Django", "Flask",
    "REST APIs", "GraphQL", "WebSockets", "MERN Stack", "MEAN Stack",
    "Responsive Design", "Performance Optimization", "SEO Basics",
  ],
  "Mobile Development": [
    "React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Jetpack Compose",
    "iOS Development", "Android Development", "Cross-Platform", "Mobile UI/UX",
    "App Store Deployment", "Push Notifications", "Offline-First",
  ],
  "DevOps & Cloud": [
    "AWS", "Azure", "Google Cloud (GCP)", "Docker", "Kubernetes", "Terraform",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Ansible", "Linux",
    "Monitoring", "Logging", "Microservices", "Serverless", "Load Balancing",
  ],
  "Data Science & ML": [
    "Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Engineering",
    "SQL", "Spark", "ETL", "Data Visualization", "Statistics", "A/B Testing",
  ],
  Cybersecurity: [
    "Application Security", "Network Security", "OWASP Top 10", "Penetration Testing",
    "Secure Coding", "Authentication & Authorization", "Encryption", "Compliance",
    "Incident Response", "Security Audits", "Cloud Security",
  ],
  Database: [
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "DynamoDB",
    "Data Modeling", "Indexing", "Query Optimization", "Transactions",
    "NoSQL", "Elasticsearch", "Database Design",
  ],
  "QA & Testing": [
    "Manual Testing", "Selenium", "Cypress", "Playwright", "Jest", "JUnit",
    "API Testing", "Postman", "Performance Testing", "Load Testing",
    "Test Automation", "BDD", "Test Strategy", "Bug Tracking",
  ],
  "Agile & Project Management": [
    "Scrum", "Kanban", "Jira", "Sprint Planning", "Retrospectives",
    "Stakeholder Management", "Leadership", "Delivery", "Risk Management",
    "Agile Ceremonies", "Product Backlog", "User Stories",
  ],
  "System Design": [
    "Distributed Systems", "Scalability", "High Availability", "Load Balancing",
    "Caching", "Message Queues", "Microservices", "CAP Theorem",
    "Database Sharding", "CDN", "API Design", "System Architecture",
  ],
  AI: [
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow",
    "PyTorch", "LLMs", "Prompt Engineering", "MLOps", "Model Deployment",
  ],
  HR: [
    "Recruitment", "Employee Relations", "Payroll", "Conflict Resolution",
    "Performance Reviews", "Onboarding", "HR Policies",
  ],
  Business: [
    "Project Management", "Business Analysis", "Strategic Planning", "Leadership",
    "Stakeholder Communication", "Requirements Gathering",
  ],
  Design: [
    "UI Design", "UX Research", "Figma", "Adobe XD", "Prototyping",
    "Design Systems", "Accessibility", "User Testing",
  ],
};
