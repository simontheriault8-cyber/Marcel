const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');
const lines = data.split('\n');
lines.forEach((line, i) => {
  if (line.match(/^\s*"[^"]*(Note|note)\s*\d+/i)) {
    console.log(`Line ${i+1}: ${line}`);
  }
});
