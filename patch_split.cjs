const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const oldHtmlMethod = `  getCustomizedScenarioHtml(bodyHtml: string): string {
    let html = bodyHtml;
    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes<\\/p>/,
      \`<p>\` + this.getHtmlSignatureFr() + \`</p>\`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces<\\/p>/,
      \`<p>\` + this.getHtmlSignatureEn() + \`</p>\`
    );
    return html;
  }`;

const newHtmlMethod = `  getCustomizedScenarioHtml(bodyHtml: string): string {
    let html = bodyHtml;
    // Safe replacement using RegExp constructor to avoid TS compiler segfaults
    const regexFr = new RegExp("<p>Cordialement,<\\\\/p>[\\\\s\\\\S]*?Forces armées canadiennes(?:<\\\\/a>)?<\\\\/p>");
    html = html.replace(regexFr, "<p>" + this.getHtmlSignatureFr() + "</p>");
    
    const regexEn = new RegExp("<p>Sincerely,<\\\\/p>[\\\\s\\\\S]*?Canadian Armed Forces(?:<\\\\/a>)?<\\\\/p>");
    html = html.replace(regexEn, "<p>" + this.getHtmlSignatureEn() + "</p>");
    
    return html;
  }`;

code = code.replace(oldHtmlMethod, newHtmlMethod);
fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Patched shared-state.service.ts with RegExp constructors");
