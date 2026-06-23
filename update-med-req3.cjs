const fs = require('fs');
let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');
const id393 = '"id": "00393",';
let start = content.indexOf(id393);
let end = content.indexOf(']', start);
let str = content.substring(start, end);
// console.log(str); // Find where requirements is
const regex = /("id":\\s*"00393",[\\s\\S]*?"requirements":\\s*")FORCE RÉGULIÈRE(")/m;
content = content.replace(regex, `$1FORCE RÉGULIÈRE: Doctorat en médecine$2`);
fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
