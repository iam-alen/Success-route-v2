// Career recommendation + skill gap logic. No external packages needed.

const CANDIDATE_ROLES = [
  'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer',
  'Software Engineer', 'Full Stack Developer', 'Web Developer', 'Java Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Business Analyst', 'Project Manager',
  'Cybersecurity Analyst',
];

// Different spellings of the same skill
const ALIASES = {
  js: 'javascript', nodejs: 'node.js', node: 'node.js', 'react.js': 'react', reactjs: 'react',
  ml: 'machine learning', dl: 'deep learning', powerbi: 'power bi', postgres: 'postgresql',
  sklearn: 'scikit-learn', 'scikit learn': 'scikit-learn', 'amazon web services': 'aws',
  'google cloud': 'gcp', k8s: 'kubernetes', 'natural language processing': 'nlp',
  restapi: 'rest api', 'rest apis': 'rest api', 'ci cd': 'ci/cd', 'cicd': 'ci/cd',
  'ms excel': 'excel', 'microsoft excel': 'excel', mongo: 'mongodb', tf: 'tensorflow',
};

const canon = (s) => {
  const c = String(s).toLowerCase().trim().replace(/\s+/g, ' ');
  return ALIASES[c] || c;
};

const userHas = (userSkills, skill) => userSkills.map(canon).includes(canon(skill));

// Splits a role's top skills into "you have" and "you need"
function skillGap(userSkills, topSkills) {
  const have = [];
  const missing = [];
  (topSkills || []).forEach(({ skill }) => (userHas(userSkills, skill) ? have : missing).push(skill));
  return { have, missing };
}

function recommend(profile, getRoleInfo, limit = 5) {
  const userSkills = profile.skills || [];
  const words = [...(profile.interests || []), ...(profile.preferences || [])]
    .join(' ').toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);

  const out = [];
  for (const role of CANDIDATE_ROLES) {
    const info = getRoleInfo(role);
    if (!info || info.jobCount < 20 || !info.topSkills.length) continue;

    const total = info.topSkills.reduce((sum, s) => sum + s.count, 0);
    const got = info.topSkills.filter((s) => userHas(userSkills, s.skill)).reduce((sum, s) => sum + s.count, 0);
    let match = total ? Math.round((got / total) * 100) : 0;
    if (words.some((w) => role.toLowerCase().includes(w))) match = Math.min(100, match + 5);

    const gap = skillGap(userSkills, info.topSkills);
    out.push({
      role,
      match,
      jobCount: info.jobCount,
      matchedSkills: gap.have,
      skillGaps: gap.missing.slice(0, 4),
      salary: info.salary || null,
    });
  }
  return out.sort((a, b) => b.match - a.match).slice(0, limit);
}

module.exports = { recommend, skillGap, userHas, canon, CANDIDATE_ROLES };
