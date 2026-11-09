# 🚀 Success Route

> **Work backwards from your dream job.** Pick a target role and Success Route shows the skills, salary range and step-by-step path to reach it, recommends careers that match your skills, and scores your resume against real job-posting data.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google&logoColor=white)

## 📌 About

Most career guidance starts from where you are today. **Success Route starts from where you want to be** (the *Reverse Methodology*) and works backward to the skills, certifications and learning steps needed.

Skills and salaries come from **120,000+ real LinkedIn job postings**. A Gemini AI model fills in what the dataset can't (education, certifications, learning steps, project ideas) and handles roles that are not in the data.

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Accounts** | Sign up and sign in with email and password (bcrypt-hashed passwords, JWT sessions) |
| 👤 **Profile** | Save education, skills, interests and preferred career fields |
| 🎯 **AI Career Recommendations** | Roles ranked by how well your skills match real job postings, with skill gaps and salary range |
| 🛣️ **Reverse Roadmap** | Enter a target role to get salary levels, required skills, certifications, project ideas and an expandable step-by-step path |
| 🧠 **Skill Gap Analysis** | Compares your profile skills with the most requested skills for the role |
| ✅ **Progress Tracking** | Tick off roadmap steps; progress shows on your dashboard |
| 📄 **Resume ATS Analyzer** | Upload a PDF or DOCX for an ATS score with breakdown, missing keywords and improvement tips |
| ✨ **AI Resume Optimizer** | Rewrites your resume for the target role using only your own content (gaps appear as `[ADD: ...]` placeholders) |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Vite |
| Backend | Node.js, Express |
| AI | Google Gemini API |
| Auth | JSON Web Tokens, bcryptjs |
| Files | Multer, pdf-parse, mammoth |
| Data | LinkedIn Job Postings dataset (Kaggle), JSON-file storage for users |

## 📂 Project Structure

```
success-route/
├── backend/
│   ├── data/                # postings.csv goes here (not included)
│   ├── lib/
│   │   ├── recommend.js     # career matching and skill gap logic
│   │   └── resume.js        # ATS scoring logic
│   ├── ai.js                # Gemini helpers
│   ├── dataset.js           # reads the CSV, counts skills and salaries
│   ├── db.js                # JSON-file storage
│   ├── server.js            # Express API
│   └── .env                 # your keys (not committed)
└── frontend/
    └── src/
        ├── components/      # Navbar, TagInput
        ├── pages/           # Landing, AuthPage, Dashboard, Profile, CareerAdvice, Roadmap, Resume
        ├── api.js
        ├── AuthContext.jsx
        └── App.jsx
```

## ⚙️ Getting Started

**Prerequisites:** Node.js 18+, a free [Gemini API key](https://aistudio.google.com/apikey) and a free Kaggle account.

### 1. Clone

```bash
git clone https://github.com/iam-alen/success-route-v2.git
cd success-route-v2
```

### 2. Download the dataset

Download **[LinkedIn Job Postings](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings)** from Kaggle, unzip it and copy **`postings.csv`** into `backend/data/`. (The file is about 500 MB, so it is not stored in this repo.)

### 3. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
GEMINI_API_KEY=your-gemini-key
JWT_SECRET=any-long-random-text
```

```bash
node server.js
```

Wait 30–90 seconds until you see `Dataset loaded` and `Backend running on http://localhost:5000`.

### 4. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Create account / sign in |
| GET, PUT | `/api/profile` | Read / save profile |
| POST | `/api/recommendations` | Career matches for the profile |
| POST | `/api/roadmap` | Roadmap for a role |
| GET, PUT | `/api/progress` | Roadmap progress |
| POST | `/api/resume/analyze` | ATS score for an uploaded resume |
| POST | `/api/resume/optimize` | AI-optimized resume text |

All routes except register and login need `Authorization: Bearer <token>`.

## ⚠️ Limitations

- Job data is from **US LinkedIn postings**, so salaries are in USD and may not match other countries.
- Skills are detected by keyword from a fixed list (`SKILLS_TO_FIND` in `backend/dataset.js`).
- Resume analysis supports text-based PDF and DOCX only (not scanned images).
- Users are stored in a local JSON file. Use a real database before any production deployment.
- The ATS score is rule-based and is not a real employer ATS.

## 🗺️ Future Scope

- [ ] Move storage to MongoDB / PostgreSQL
- [ ] Deploy (Vercel + Render) with a pre-processed dataset
- [ ] Add soft-skill and certification data
- [ ] Learning resource links per skill
- [ ] Mobile-friendly app

## 👤 Author

**Alen KM AS** · [@iam-alen](https://github.com/iam-alen)

---

⭐ If you find this useful, consider starring the repo.
