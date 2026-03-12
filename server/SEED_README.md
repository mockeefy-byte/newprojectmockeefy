# Seed: Dummy Categories & Skills (IT Company)

This folder has **dummy categories and skills** for an IT company (mock interviews, consulting, sessions).

---

## What gets seeded

### Categories (15)

| Category | Description |
|----------|-------------|
| IT | Information Technology – general software and systems |
| Software Development | Core programming, OOP, algorithms, design patterns |
| Web Development | Frontend, backend, and full-stack web |
| Mobile Development | iOS, Android, and cross-platform apps |
| DevOps & Cloud | CI/CD, AWS, Azure, GCP, Docker, Kubernetes |
| Data Science & ML | Machine learning, NLP, data engineering, analytics |
| Cybersecurity | Application security, network security, compliance |
| Database | SQL, NoSQL, data modeling, performance |
| QA & Testing | Manual, automation, API and performance testing |
| Agile & Project Management | Scrum, Jira, leadership, delivery |
| System Design | Distributed systems, scalability, architecture |
| AI | Artificial Intelligence and machine learning |
| HR | Human Resources – recruitment and people ops |
| Business | Business analysis and strategy |
| Design | UI/UX and product design |

### Skills

- **200+ skills** across these categories (e.g. JavaScript, React, AWS, Selenium, Scrum, Machine Learning, etc.).
- Stored in `server/data/categoriesAndSkills.js` so you can edit the list there.

---

## Full process: how to run

### 1. Only categories and skills (no users/sessions)

Use this when you only want to reset and fill **Categories** and **Skills** (e.g. after clearing DB or for a fresh list).

```bash
cd server
npm run seed:categories-skills
```

- **Clears:** only `Category` and `Skill` collections.  
- **Does not touch:** Users, Sessions, Experts, etc.

### 2. Full dummy seed (categories + skills + experts + candidates + sessions)

Use this for a full dummy dataset: categories, skills, expert users, candidate users, and sessions.

```bash
cd server
npm run seed:dummy
```

- **Creates/updates:** Categories, Skills, 10 experts, 10 candidates, 15 sessions.  
- **Does not clear** existing users/sessions first; it finds-or-creates by email.

### 3. Edit categories or skills

- Open **`server/data/categoriesAndSkills.js`**.
- Edit `categoriesData` (name + description) and `skillsData` (category name → array of skill names).
- Run again:

```bash
npm run seed:categories-skills
# or
npm run seed:dummy
```

---

## Requirements

- **MONGO_URI** in `server/.env` (local or Atlas).
- Node run from **`server`** folder (or use the npm scripts above).

---

## Files involved

| File | Purpose |
|------|--------|
| `data/categoriesAndSkills.js` | Single source of categories and skills (IT company list). |
| `seedCategoriesAndSkills.js` | Clears and reseeds only Category + Skill. |
| `dummySeed.js` | Seeds categories, skills, experts, candidates, sessions (uses same data). |
