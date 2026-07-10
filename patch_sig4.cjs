const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const target1 = `    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes(?:<\\/a>)?<\\/p>/,
      \`<p>\` + this.getHtmlSignatureFr() + \`</p>\`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces(?:<\\/a>)?<\\/p>/,
      \`<p>\` + this.getHtmlSignatureEn() + \`</p>\`
    );`;

const replacement1 = `    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes(?:<\\/a>)?<\\/p>/g,
      \`<p>\` + this.getHtmlSignatureFr() + \`</p>\`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces(?:<\\/a>)?<\\/p>/g,
      \`<p>\` + this.getHtmlSignatureEn() + \`</p>\`
    );`;

code = code.replace(target1, replacement1);
fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Reverted to global regex");
