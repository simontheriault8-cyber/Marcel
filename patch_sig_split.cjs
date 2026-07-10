const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const targetHtml = `  getCustomizedScenarioHtml(bodyHtml: string): string {
    let html = bodyHtml;
    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\\/p>[\\s\\S]*?Forces armées canadiennes(?:<\\/a>)?<\\/p>/g,
      \`<p>\` + this.getHtmlSignatureFr() + \`</p>\`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\\/p>[\\s\\S]*?Canadian Armed Forces(?:<\\/a>)?<\\/p>/g,
      \`<p>\` + this.getHtmlSignatureEn() + \`</p>\`
    );
    
    return html;
  }`;

const newHtml = `  getCustomizedScenarioHtml(bodyHtml: string): string {
    let html = bodyHtml;
    // Basic string replace for HTML
    
    let regexFr = new RegExp("<p>Cordialement,<\\\\/p>[\\\\s\\\\S]*?Forces armées canadiennes(?:<\\\\/a>)?<\\\\/p>", "g");
    html = html.replace(regexFr, "<p>" + this.getHtmlSignatureFr() + "</p>");
    
    let regexEn = new RegExp("<p>Sincerely,<\\\\/p>[\\\\s\\\\S]*?Canadian Armed Forces(?:<\\\\/a>)?<\\\\/p>", "g");
    html = html.replace(regexEn, "<p>" + this.getHtmlSignatureEn() + "</p>");
    
    return html;
  }`;

const targetText = `  getCustomizedScenarioText(bodyText: string): string {
    let text = bodyText;
    // Replace French plain text signature
    text = text.replace(
      /Cordialement,[\\s\\S]*?Centre d’assistance \\| Forces armées canadiennes/,
      this.customSignatureFr()
    );
    // Replace English plain text signature
    text = text.replace(
      /Sincerely,[\\s\\S]*?Help Centre \\| Canadian Armed Forces/,
      this.customSignatureEn()
    );
    return text;
  }`;
  
const newText = `  getCustomizedScenarioText(bodyText: string): string {
    let text = bodyText;
    
    let regexFr = new RegExp("Cordialement,[\\\\s\\\\S]*?Centre d’assistance \\\\| Forces armées canadiennes", "g");
    text = text.replace(regexFr, this.customSignatureFr());
    
    let regexEn = new RegExp("Sincerely,[\\\\s\\\\S]*?Help Centre \\\\| Canadian Armed Forces", "g");
    text = text.replace(regexEn, this.customSignatureEn());
    
    return text;
  }`;

code = code.replace(targetHtml, newHtml);
code = code.replace(targetText, newText);

fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Patched shared-state.service.ts with dynamic regex to avoid esbuild segfault");
