const fs = require('fs');

let content = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const regexSec10 = 'const reqSec10 = req.includes("10e année") || req.includes("secondaire iv") || req.includes("grade 10");';
const newSec10 = 'const reqSec10 = req.includes("10e année") || req.includes("11e année d\'études secondaires") || req.includes("secondaire iv") || req.includes("secondaires iv") || req.match(/sec\\s*iv/i) !== null || req.includes("grade 10") || req.includes("10th grade");';

const regexSec12 = 'const reqSec12 = req.includes("12e année") || req.includes("secondaire v") || req.includes("diplôme d\'études secondaires") || req.includes("grade 12");';
const newSec12 = 'const reqSec12 = req.includes("12e année") || req.includes("secondaire v") || req.includes("secondaires v") || req.match(/sec\\s*v/i) !== null || req.includes("diplôme d\'études secondaires") || req.includes("grade 12") || req.includes("12th grade");';

content = content.replace(regexSec10, newSec10);
content = content.replace(regexSec12, newSec12);

fs.writeFileSync('src/app/components/reorientation.component.ts', content, 'utf8');
console.log('Fixed Sec10 and Sec12 checks!');
