const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const target1 = `    // Safe replacement using RegExp constructor to avoid TS compiler segfaults
    const regexFr = new RegExp("<p>Cordialement,<\\\\/p>[\\\\s\\\\S]*?Forces armées canadiennes(?:<\\\\/a>)?<\\\\/p>");
    html = html.replace(regexFr, "<p>" + this.getHtmlSignatureFr() + "</p>");
    
    const regexEn = new RegExp("<p>Sincerely,<\\\\/p>[\\\\s\\\\S]*?Canadian Armed Forces(?:<\\\\/a>)?<\\\\/p>");
    html = html.replace(regexEn, "<p>" + this.getHtmlSignatureEn() + "</p>");`;

const replacement1 = `    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes(?:<\\/a>)?<\\/p>/,
      \`<p>\` + this.getHtmlSignatureFr() + \`</p>\`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces(?:<\\/a>)?<\\/p>/,
      \`<p>\` + this.getHtmlSignatureEn() + \`</p>\`
    );`;

const target2 = `    // Replace French plain text signature
    const regexFr = new RegExp("Cordialement,[\\\\s\\\\S]*?Centre d’assistance \\\\| Forces armées canadiennes");
    text = text.replace(regexFr, this.customSignatureFr());
    
    // Replace English plain text signature
    const regexEn = new RegExp("Sincerely,[\\\\s\\\\S]*?Help Centre \\\\| Canadian Armed Forces");
    text = text.replace(regexEn, this.customSignatureEn());`;

const replacement2 = `    // Replace French plain text signature
    text = text.replace(
      /Cordialement,[\\s\\S]*?Centre d’assistance \\| Forces armées canadiennes/,
      this.customSignatureFr()
    );
    // Replace English plain text signature
    text = text.replace(
      /Sincerely,[\\s\\S]*?Help Centre \\| Canadian Armed Forces/,
      this.customSignatureEn()
    );`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Reverted to normal regex literals");
