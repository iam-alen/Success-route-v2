// ATS-style resume scoring. No external packages needed.
// Total = Keywords 40 + Formatting 20 + Content 25 + Structure 15

const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'created', 'led', 'managed', 'improved',
  'optimized', 'automated', 'deployed', 'launched', 'analyzed', 'analysed', 'delivered', 'reduced', 'increased',
  'collaborated', 'integrated', 'engineered', 'achieved', 'streamlined', 'migrated', 'mentored'];

const DEFAULT_KEYWORDS = ['python', 'sql', 'git', 'javascript', 'communication', 'agile', 'problem solving',
  'excel', 'project management', 'leadership'];

const SECTIONS = {
  Summary: /\b(summary|objective|profile)\b/i,
  Education: /\beducation\b|\bacademic/i,
  Experience: /\b(experience|internship|employment|work history)\b/i,
  Skills: /\bskills\b/i,
  Projects: /\bprojects?\b/i,
};

const has = (text, word) => new RegExp('\\b' + word + '\\b', 'i').test(text);

function analyzeResume(text, roleSkills, foundSkills) {
  const words = (text.match(/\b\w+\b/g) || []).length;

  // ---- Keywords (40) ----
  const matched = roleSkills.filter((s) => foundSkills.includes(s));
  const missing = roleSkills.filter((s) => !foundSkills.includes(s));
  const keywords = roleSkills.length ? Math.round((matched.length / roleSkills.length) * 40) : 0;

  // ---- Formatting (20) ----
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const phone = /\+?\d[\d\s().-]{8,}\d/.test(text);
  const bullets = (text.match(/^\s*[•\-*–▪●]/gm) || []).length;
  let formatting = 0;
  if (email) formatting += 5;
  if (phone) formatting += 5;
  formatting += words >= 250 && words <= 900 ? 5 : words >= 150 && words <= 1200 ? 2 : 0;
  formatting += bullets >= 5 ? 5 : bullets >= 2 ? 2 : 0;

  // ---- Content (25) ----
  const verbs = ACTION_VERBS.filter((v) => has(text, v));
  const quantified = (text.match(/\b\d+(\.\d+)?\s*(%|percent|x)|\$\s?\d+|\b\d+\+?\s*(users|customers|clients|projects|requests|records)\b/gi) || []).length;
  const firstPerson = /\b(I|my|me)\b/.test(text);
  const content = Math.round((Math.min(verbs.length, 8) / 8) * 10)
    + Math.round((Math.min(quantified, 4) / 4) * 10)
    + (firstPerson ? 0 : 5);

  // ---- Structure (15) ----
  const present = Object.keys(SECTIONS).filter((k) => SECTIONS[k].test(text));
  const absent = Object.keys(SECTIONS).filter((k) => !present.includes(k));
  const structure = present.length * 3;

  const score = keywords + formatting + content + structure;
  const grade = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Needs work' : 'Poor match';

  const breakdown = [
    { name: 'Keywords', score: keywords, max: 40, note: `${matched.length} of ${roleSkills.length} target skills found.` },
    { name: 'Formatting', score: formatting, max: 20, note: `${words} words, ${bullets} bullet points, ${email ? 'email found' : 'no email'}, ${phone ? 'phone found' : 'no phone'}.` },
    { name: 'Content', score: content, max: 25, note: `${verbs.length} action verbs, ${quantified} quantified results${firstPerson ? ', uses first-person words' : ''}.` },
    { name: 'Structure', score: structure, max: 15, note: absent.length ? `Missing sections: ${absent.join(', ')}.` : 'All key sections present.' },
  ];

  const strengths = [];
  if (roleSkills.length && matched.length / roleSkills.length >= 0.6) strengths.push(`Strong keyword coverage (${matched.slice(0, 5).join(', ')}).`);
  if (quantified >= 2) strengths.push('Uses numbers to show impact.');
  if (verbs.length >= 6) strengths.push('Good use of action verbs.');
  if (!absent.length) strengths.push('Clear structure with all key sections.');
  if (email && phone) strengths.push('Contact details are present.');
  if (!strengths.length) strengths.push('Basic resume content detected. See the improvements below.');

  const improvements = [];
  if (missing.length) improvements.push(`Add these keywords where they are true for you: ${missing.slice(0, 6).join(', ')}.`);
  if (!email) improvements.push('Add an email address.');
  if (!phone) improvements.push('Add a phone number.');
  if (absent.length) improvements.push(`Add missing section(s): ${absent.join(', ')}.`);
  if (verbs.length < 6) improvements.push('Start bullet points with action verbs (built, deployed, improved, automated...).');
  if (quantified < 2) improvements.push('Quantify results, for example "reduced load time by 30%".');
  if (firstPerson) improvements.push('Remove "I", "my" and "me". Write in short bullet-style statements.');
  if (bullets < 5) improvements.push('Use bullet points to describe your projects and experience.');
  if (words < 250) improvements.push('The resume looks short. Add more detail about projects and achievements.');
  if (words > 900) improvements.push('The resume is long. Aim for one page (400-700 words) for early-career roles.');

  return {
    score, grade, breakdown, strengths, improvements,
    keywords: { matched, missing },
    suggestedSkills: missing.slice(0, 8),
    wordCount: words,
  };
}

// Decides which role's skills the resume is compared against
function chooseRole({ targetRole, foundSkills, getRoleInfo, candidates }) {
  const requested = targetRole ? String(targetRole).trim() : '';
  if (requested) {
    const info = getRoleInfo(requested);
    if (info && info.topSkills.length) {
      return { role: requested, requestedRole: requested, roleSkills: info.topSkills.map((s) => s.skill), jobCount: info.jobCount, inferred: false };
    }
  }

  let best = null;
  for (const r of candidates) {
    const info = getRoleInfo(r);
    if (!info || !info.topSkills.length) continue;
    const skills = info.topSkills.map((s) => s.skill);
    const overlap = skills.filter((s) => foundSkills.includes(s)).length;
    if (!best || overlap > best.overlap) best = { role: r, roleSkills: skills, jobCount: info.jobCount, overlap };
  }
  if (best && best.overlap > 0) return { ...best, requestedRole: requested || null, inferred: true };

  return { role: requested || 'General', requestedRole: requested || null, roleSkills: DEFAULT_KEYWORDS, jobCount: 0, inferred: !requested };
}

module.exports = { analyzeResume, chooseRole };
