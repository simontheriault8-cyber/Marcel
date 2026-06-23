const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const lines = data.split('\n');
lines.forEach((line, i) => {
  if (line.match(/1\.\s*1\./i)) {
    console.log(`Line ${i+1}: ${line}`);
  }
});
