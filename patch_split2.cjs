const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const oldTextMethod = `  getCustomizedScenarioText(bodyText: string): string {
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

const newTextMethod = `  getCustomizedScenarioText(bodyText: string): string {
    let text = bodyText;
    // Replace French plain text signature
    const regexFr = new RegExp("Cordialement,[\\\\s\\\\S]*?Centre d’assistance \\\\| Forces armées canadiennes");
    text = text.replace(regexFr, this.customSignatureFr());
    
    // Replace English plain text signature
    const regexEn = new RegExp("Sincerely,[\\\\s\\\\S]*?Help Centre \\\\| Canadian Armed Forces");
    text = text.replace(regexEn, this.customSignatureEn());
    return text;
  }`;

code = code.replace(oldTextMethod, newTextMethod);
fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Patched shared-state.service.ts with RegExp constructors for text");
