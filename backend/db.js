// A very small JSON-file "database" (users, profiles, cached roadmaps, progress).
// Good enough for a mini project. Can be swapped for MongoDB later.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'db.json');

function read() {
  try {
    const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return { users: [], profiles: {}, roadmaps: {}, progress: {}, ...db };
  } catch {
    return { users: [], profiles: {}, roadmaps: {}, progress: {} };
  }
}

function write(db) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

module.exports = { read, write };
