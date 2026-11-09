require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const { loadJobs, getRoleInfo, findSkillsInText } = require('./dataset');
const { askAI, askJSON, askText } = require('./ai');
const db = require('./db');
const { recommend, skillGap, CANDIDATE_ROLES } = require('./lib/recommend');
const { analyzeResume, chooseRole } = require('./lib/resume');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET is not set in .env (using an insecure default).');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------- helpers
const makeToken = (user) => jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in first.' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

const cleanList = (value, max = 40) =>
  (Array.isArray(value) ? value : [])
    .map((v) => String(v).trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, max);

// ---------------------------------------------------------------- auth
app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80);
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const data = db.read();
  if (data.users.some((u) => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' });

  const user = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, email, passwordHash: await bcrypt.hash(password, 10) };
  data.users.push(user);
  data.profiles[user.id] = { fullName: name, education: '', skills: [], interests: [], preferences: [] };
  db.write(data);

  res.status(201).json({ token: makeToken(user), user: { id: user.id, name, email } });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.read().users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

// ---------------------------------------------------------------- profile
app.get('/api/profile', requireAuth, (req, res) => {
  const profile = db.read().profiles[req.userId] || { fullName: '', education: '', skills: [], interests: [], preferences: [] };
  res.json({ profile });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const data = db.read();
  data.profiles[req.userId] = {
    fullName: String(req.body.fullName || '').trim().slice(0, 80),
    education: String(req.body.education || '').trim().slice(0, 60),
    skills: cleanList(req.body.skills),
    interests: cleanList(req.body.interests),
    preferences: cleanList(req.body.preferences),
  };
  db.write(data);
  res.json({ profile: data.profiles[req.userId] });
});

// ---------------------------------------------------------------- roadmap (dataset + AI, with skill gap and progress)
app.post('/api/roadmap', requireAuth, async (req, res) => {
  const role = String(req.body.role || '').trim().slice(0, 80);
  if (!role) return res.status(400).json({ error: 'Please enter a job role.' });

  const key = role.toLowerCase();
  const info = getRoleInfo(role);
  const data = db.read();

  // The AI part is cached per role: saves free quota and keeps steps stable for progress tracking
  let ai = data.roadmaps[key] && !req.body.refresh ? data.roadmaps[key].ai : null;
  if (!ai) {
    try {
      ai = await askAI(role, info ? info.topSkills : null);
      data.roadmaps[key] = { role, ai };
      db.write(data);
    } catch (err) {
      console.error('AI error:', err.message);
    }
  }

  if (!info && !ai) return res.status(500).json({ error: 'Could not get information for this role. Try again in a minute.' });

  const profile = data.profiles[req.userId];
  const hasProfileSkills = profile && profile.skills.length > 0;
  const gap = hasProfileSkills && info ? skillGap(profile.skills, info.topSkills) : null;

  res.json({
    role,
    key,
    fromDataset: !!info,
    jobCount: info ? info.jobCount : 0,
    topSkills: info ? info.topSkills : [],
    salary: info && info.salary
      ? { entry: info.salary.low, mid: info.salary.median, senior: info.salary.high, count: info.salary.count }
      : null,
    skillGap: gap,
    completed: (data.progress[req.userId] || {})[key] || [],
    aiAvailable: !!ai,
    ...(ai || {}),
  });
});

// ---------------------------------------------------------------- progress tracking
app.get('/api/progress', requireAuth, (req, res) => {
  const data = db.read();
  const mine = data.progress[req.userId] || {};
  const list = Object.keys(mine).map((key) => {
    const cached = data.roadmaps[key];
    return {
      key,
      role: cached ? cached.role : key,
      done: mine[key].length,
      total: cached && cached.ai && cached.ai.steps ? cached.ai.steps.length : 0,
    };
  });
  res.json({ progress: list });
});

app.put('/api/progress', requireAuth, (req, res) => {
  const key = String(req.body.key || '').toLowerCase().slice(0, 80);
  if (!key) return res.status(400).json({ error: 'Missing role.' });
  const data = db.read();
  data.progress[req.userId] = { ...(data.progress[req.userId] || {}), [key]: cleanList(req.body.completed, 30) };
  db.write(data);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- AI career recommendations
app.post('/api/recommendations', requireAuth, async (req, res) => {
  const profile = db.read().profiles[req.userId];
  if (!profile || profile.skills.length === 0) {
    return res.status(400).json({ error: 'Add your skills in the Profile page first.', needsProfile: true });
  }

  const results = recommend(profile, getRoleInfo, 5);
  if (!results.length) return res.status(404).json({ error: 'No matching roles found in the dataset for your skills.' });

  // Dataset decides the match %, AI only writes the explanation
  let summary = `Your skills (${profile.skills.slice(0, 5).join(', ')}) are compared with the most requested skills in real job postings.`;
  let reasons = {};
  try {
    const prompt = `You are a career advisor. User profile: education "${profile.education || 'not given'}", skills: ${profile.skills.join(', ')}, interests: ${profile.interests.join(', ') || 'none'}, preferred fields: ${profile.preferences.join(', ') || 'none'}.
Computed role matches (from real job postings): ${JSON.stringify(results.map((r) => ({ role: r.role, match: r.match, matched: r.matchedSkills, gaps: r.skillGaps })))}.
Reply with ONLY valid JSON: {"summary":"2-3 sentences about the user's strengths and best direction","reasons":{"<role name>":"1-2 sentences on why this role fits and what to learn next"}}. Include every role name exactly as given.`;
    const ai = await askJSON(prompt);
    if (ai.summary) summary = ai.summary;
    reasons = ai.reasons || {};
  } catch (err) {
    console.error('AI error:', err.message);
  }

  res.json({
    summary,
    recommendations: results.map((r) => ({
      ...r,
      why: reasons[r.role] || `You already have ${r.matchedSkills.length} of the most requested skills for this role.`,
    })),
  });
});

// ---------------------------------------------------------------- resume ATS analyzer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/resume/analyze', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Attach a PDF or DOCX resume.' });

  const name = req.file.originalname.toLowerCase();
  let text = '';
  try {
    if (name.endsWith('.pdf')) text = (await pdfParse(req.file.buffer)).text;
    else if (name.endsWith('.docx')) text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
    else return res.status(400).json({ error: 'Only PDF and DOCX files are supported.' });
  } catch (err) {
    console.error(err.message);
    return res.status(422).json({ error: 'Could not read this file.' });
  }

  if (!text || text.trim().length < 100) {
    return res.status(422).json({ error: 'Could not read text from this file. Scanned/image resumes are not supported.' });
  }

  const foundSkills = findSkillsInText(text);
  const chosen = chooseRole({
    targetRole: req.body.role,
    foundSkills,
    getRoleInfo,
    candidates: CANDIDATE_ROLES,
  });
  const analysis = analyzeResume(text, chosen.roleSkills, foundSkills);

  res.json({
    analysis: {
      ...analysis,
      role: chosen.role,
      requestedRole: chosen.requestedRole,
      inferred: chosen.inferred,
      basedOnJobs: chosen.jobCount,
      fileName: req.file.originalname,
    },
    resumeText: text.slice(0, 15000),
  });
});

app.post('/api/resume/optimize', requireAuth, async (req, res) => {
  const resumeText = String(req.body.resumeText || '').slice(0, 15000);
  const role = String(req.body.role || 'the target role').slice(0, 80);
  const missing = cleanList(req.body.missingKeywords, 15);
  if (resumeText.length < 100) return res.status(400).json({ error: 'No resume text to optimize. Analyze a resume first.' });

  const prompt = `You are a professional resume writer. Rewrite the resume below to be ATS-friendly for the role "${role}".
Rules:
- Keep ONLY facts present in the original. Do NOT invent employers, dates, degrees, numbers or skills.
- Use clear sections: SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION.
- Start bullets with strong action verbs and keep them short.
- These keywords are missing: ${missing.join(', ') || 'none'}. Only add one if the original content supports it. Otherwise write a placeholder like [ADD: Docker experience, if you have it].
- Where a result has no number, write a placeholder like [ADD: metric].
- Plain text only, no markdown symbols like ** or #.

RESUME:
${resumeText}`;

  try {
    res.json({ optimized: await askText(prompt) });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'AI could not optimize the resume right now. Try again in a minute.' });
  }
});

// ---------------------------------------------------------------- misc
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10 MB).' : err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

loadJobs()
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => console.error('Could not load dataset:', err.message));
