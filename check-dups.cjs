const fs = require('fs');
const data = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const regex = /"notes":\s*\[([\s\S]*?)\]/g;
let match;
while ((match = regex.exec(data)) !== null) {
  const notesStr = match[1];
  const notesArray = notesStr.split('",').map(s => s.trim().replace(/^"/, '').replace(/"$/, ''));
  const set = new Set();
  notesArray.forEach(note => {
    if (set.has(note) && note.trim() !== "") {
      console.log("DUPLICATE NOTE: " + note);
    }
    set.add(note);
  });
}
