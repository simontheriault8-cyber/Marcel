const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const target1 = `/<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes<\\/p>/`;
const replacement1 = `/<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes(?:<\\/a>)?<\\/p>/`;

const target2 = `/<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces<\\/p>/`;
const replacement2 = `/<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces(?:<\\/a>)?<\\/p>/`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Patched shared-state.service.ts regex");
