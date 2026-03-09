/**
 * Knowledge base: interview questions by field (role).
 * Each question has: text, difficulty ('easy'|'medium'|'hard'), topic.
 * Used to drive the AI mock interview at /ai-video.
 */
const questionsByField = {
    'Frontend Developer': [
        { text: 'How would you explain the Virtual DOM and why frameworks like React use it?', difficulty: 'medium', topic: 'Core concepts' },
        { text: 'What is the difference between state and props in React? When would you use each?', difficulty: 'easy', topic: 'React fundamentals' },
        { text: 'Describe how you would optimize a slow React application. What tools and strategies would you use?', difficulty: 'hard', topic: 'Performance' },
        { text: 'Explain the React lifecycle methods (or hooks equivalent). When would you use useEffect cleanup?', difficulty: 'medium', topic: 'Lifecycle' },
        { text: 'How do you handle accessibility (a11y) in a single-page application?', difficulty: 'medium', topic: 'Accessibility' },
        { text: 'What are the trade-offs between building a SPA vs SSR? When would you choose Next.js over plain React?', difficulty: 'hard', topic: 'Architecture' },
        { text: 'How would you structure state in a large React app? When do you use Context vs Redux vs local state?', difficulty: 'medium', topic: 'State management' },
        { text: 'Explain event delegation and how you might use it to improve performance.', difficulty: 'medium', topic: 'DOM & performance' },
    ],
    'Backend Developer': [
        { text: 'Explain the difference between REST and GraphQL. When would you choose one over the other?', difficulty: 'medium', topic: 'API design' },
        { text: 'How would you design an idempotent API for processing payments?', difficulty: 'hard', topic: 'System design' },
        { text: 'What is connection pooling and why is it important for database performance?', difficulty: 'medium', topic: 'Databases' },
        { text: 'Describe how you would implement rate limiting for an API.', difficulty: 'medium', topic: 'Security & reliability' },
        { text: 'Explain CAP theorem and how it influences database and system design choices.', difficulty: 'hard', topic: 'Distributed systems' },
        { text: 'How do you approach logging and monitoring in a production backend service?', difficulty: 'medium', topic: 'Observability' },
        { text: 'What is the difference between authentication and authorization? How would you implement JWT-based auth?', difficulty: 'medium', topic: 'Security' },
        { text: 'Describe a scenario where you would use a message queue. What problems does it solve?', difficulty: 'medium', topic: 'Async processing' },
    ],
    'Full Stack Developer': [
        { text: 'Walk me through how a request flows from the browser to your backend and back. Where would you add caching?', difficulty: 'medium', topic: 'End-to-end flow' },
        { text: 'How would you design a feature that works offline and syncs when the user is back online?', difficulty: 'hard', topic: 'Offline-first' },
        { text: 'What is the difference between SQL and NoSQL? Give an example when you would choose each.', difficulty: 'easy', topic: 'Databases' },
        { text: 'How do you ensure security on both frontend and backend when handling user data?', difficulty: 'medium', topic: 'Security' },
        { text: 'Describe your approach to API versioning and backward compatibility.', difficulty: 'medium', topic: 'API design' },
        { text: 'How would you implement real-time updates (e.g. live notifications) across web and mobile?', difficulty: 'hard', topic: 'Real-time' },
        { text: 'Explain CORS. Why does the browser block certain cross-origin requests and how do you fix it safely?', difficulty: 'medium', topic: 'Web fundamentals' },
        { text: 'What strategies do you use to keep the frontend and backend in sync when the API contract changes?', difficulty: 'medium', topic: 'Collaboration' },
    ],
    'Software Engineer': [
        { text: 'Describe a challenging bug you fixed. How did you debug and what was the root cause?', difficulty: 'medium', topic: 'Problem solving' },
        { text: 'How do you balance writing clean code with meeting deadlines?', difficulty: 'medium', topic: 'Practices' },
        { text: 'Explain the difference between unit, integration, and e2e tests. When do you use each?', difficulty: 'easy', topic: 'Testing' },
        { text: 'How would you approach refactoring a large legacy codebase with minimal risk?', difficulty: 'hard', topic: 'Refactoring' },
        { text: 'What does "clean code" mean to you? Give one or two concrete examples.', difficulty: 'easy', topic: 'Code quality' },
        { text: 'Describe a time you had to learn a new technology quickly. How did you prioritize?', difficulty: 'medium', topic: 'Learning' },
        { text: 'How do you handle disagreements about technical decisions with your team?', difficulty: 'medium', topic: 'Collaboration' },
        { text: 'What is your approach to code reviews? What do you look for when reviewing and when being reviewed?', difficulty: 'medium', topic: 'Process' },
    ],
    'DevOps Engineer': [
        { text: 'Explain the difference between CI and CD. What does a typical pipeline look like in your experience?', difficulty: 'medium', topic: 'CI/CD' },
        { text: 'How would you design a zero-downtime deployment strategy for a critical service?', difficulty: 'hard', topic: 'Deployments' },
        { text: 'What are containers and how do they differ from VMs? When would you use Kubernetes?', difficulty: 'medium', topic: 'Containers' },
        { text: 'Describe how you would troubleshoot a production incident where the service is slow or down.', difficulty: 'medium', topic: 'Incident response' },
        { text: 'How do you manage secrets and configuration across environments securely?', difficulty: 'medium', topic: 'Security' },
        { text: 'What is infrastructure as code? What tools have you used and what are the benefits?', difficulty: 'medium', topic: 'IaC' },
        { text: 'Explain load balancing strategies. When would you use round-robin vs least connections?', difficulty: 'medium', topic: 'Reliability' },
        { text: 'How would you implement monitoring and alerting so that you catch issues before users do?', difficulty: 'hard', topic: 'Observability' },
    ],
};

const defaultField = 'Software Engineer';

function getQuestionsForField(field) {
    const normalized = (field || defaultField).trim();
    return questionsByField[normalized] || questionsByField[defaultField];
}

function getNextQuestionForSession(transcript, config) {
    const field = config?.role || defaultField;
    const questions = getQuestionsForField(field);
    if (!questions || questions.length === 0) return null;

    const aiMessages = transcript.filter(m => m.sender === 'ai');
    const questionCount = aiMessages.length;
    if (questionCount >= Math.min(8, questions.length)) return null;

    const index = questionCount % questions.length;
    return questions[index];
}

export {
    questionsByField,
    getQuestionsForField,
    getNextQuestionForSession,
    defaultField,
};
