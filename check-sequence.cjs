const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const regex = /"notes":\s*\[([\s\S]*?)\]/g;
let match;
while ((match = regex.exec(data)) !== null) {
  const notesStr = match[1];
  const notesArray = notesStr.split('",').map(s => s.trim().replace(/^"/, '').replace(/"$/, ''));
  const nums = notesArray.map(n => {
    const m = n.match(/^(\d+)/);
    return m ? parseInt(m[1]) : null;
  });
  
  const expected = nums.map((_, i) => i + 1);
  const isValid = nums.every((n, i) => n === expected[i]);
  if (!isValid && nums.length > 0 && nums[0] !== null) {
    console.log("BAD SEQUENCE: ", nums.join(', '));
  }
}
