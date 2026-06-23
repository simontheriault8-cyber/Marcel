const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const regex = /"candidates":\s*\[([^\]]+)\]/g;
let match;
while ((match = regex.exec(data)) !== null) {
  const candidates = match[1];
  // Check if any numbers are duplicated
  const parts = candidates.split('"').filter(p => p.trim() !== '' && p.trim() !== ',');
  for (const part of parts) {
    const numsMatch = part.match(/\d+/g);
    if (numsMatch) {
      const hasDups = new Set(numsMatch).size !== numsMatch.length;
      if (hasDups) {
        console.log("Found duplicate numbers in candidates: " + part);
      }
    }
  }
}
