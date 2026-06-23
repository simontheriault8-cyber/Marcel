const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const regex = /"notes":\s*\[([\s\S]*?)\]/g;
let match;
let allNotes = [];
while ((match = regex.exec(data)) !== null) {
  const notesStr = match[1];
  const notesArray = notesStr.split('",').map(s => s.trim().replace(/^"/, '').replace(/"$/, ''));
  allNotes.push(...notesArray);
}

fs.writeFileSync('/all-notes.txt', allNotes.join('\n'));
