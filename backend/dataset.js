const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ✏️ These match postings.csv from the LinkedIn dataset
const FILE_NAME = 'postings.csv';
const TITLE_COLUMN = 'title';
const DESCRIPTION_COLUMN = 'description';

// ✏️ Add or remove any skills you want the app to look for
const SKILLS_TO_FIND = [
  'python', 'sql', 'java', 'javascript', 'typescript', 'c++', 'c#', 'react', 'node.js', 'angular',
  'html', 'css', 'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'terraform',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
  'nlp', 'statistics', 'excel', 'tableau', 'power bi', 'data visualization', 'etl', 'spark', 'hadoop',
  'mongodb', 'postgresql', 'mysql', 'rest api', 'agile', 'scrum', 'jira', 'project management',
  'risk management', 'stakeholder management', 'communication', 'leadership', 'problem solving',
  'ci/cd', 'jenkins', 'cybersecurity', 'figma', 'seo', 'salesforce',
];

let jobs = []; // each item: { title, skills: [...] }

function loadJobs() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'data', FILE_NAME))
      .pipe(csv())
      .on('data', (row) => {
        const title = (row[TITLE_COLUMN] || '').toLowerCase();
        if (!title) return;

        // clean the description so skills are easy to find
        const text = ' ' + (row[DESCRIPTION_COLUMN] || '')
          .toLowerCase()
          .replace(/\.(\s|$)/g, ' ')
          .replace(/[^a-z0-9+#./ -]/g, ' ') + ' ';

        const skills = SKILLS_TO_FIND.filter((skill) => text.includes(' ' + skill + ' '));
        results.push({ title, skills }); // we keep only this, not the long text
      })
      .on('end', () => {
        jobs = results;
        console.log(`Dataset loaded: ${jobs.length} job postings`);
        resolve();
      })
      .on('error', reject);
  });
}

function getRoleInfo(role) {
  const query = role.toLowerCase();
  const matches = jobs.filter((j) => j.title.includes(query));

  if (matches.length < 5) return null; // not enough data, the AI will handle it

  const counts = {};
  matches.forEach((j) => j.skills.forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));

  const topSkills = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([skill, count]) => ({ skill, count }));

  return { role, jobCount: matches.length, topSkills };
}

function findSkillsInText(raw) {
  const text = ' ' + String(raw).toLowerCase()
    .replace(/\.(\s|$)/g, ' ')
    .replace(/[^a-z0-9+#./ -]/g, ' ') + ' ';
  return SKILLS_TO_FIND.filter((skill) => text.includes(' ' + skill + ' '));
}

module.exports = { loadJobs, getRoleInfo, findSkillsInText, SKILLS_TO_FIND };