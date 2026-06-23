const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');
const lines = data.split('\n');
let found = false;
lines.forEach((line, i) => {
  if (line.match(/^\s*"\d+\.\s+(\d+\.|Note\s*\d+:?|note\s*\d+:?)/i)) {
    console.log(`Line ${i+1}: ${line}`);
    found = true;
  }
});
if (!found) console.log("No double numbering found.");
