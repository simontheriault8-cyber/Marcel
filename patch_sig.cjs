const fs = require('fs');
let code = fs.readFileSync('src/services/shared-state.service.ts', 'utf8');

const targetFr = `export const DEFAULT_SIG_FR = \`Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance (https://forces.ca/fr/centre-dassistance/#/) | Forces armées canadiennes\`;`;

const replaceFr = `export const DEFAULT_SIG_FR = \`Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes\`;`;

const targetEn = `export const DEFAULT_SIG_EN = \`Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre (https://forces.ca/en/help-centre/#/) | Canadian Armed Forces\`;`;

const replaceEn = `export const DEFAULT_SIG_EN = \`Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre | Canadian Armed Forces\`;`;

code = code.replace(targetFr, replaceFr);
code = code.replace(targetEn, replaceEn);

const targetHtmlFr = `  getHtmlSignatureFr(): string {
    const sig = this.customSignatureFr();
    if (sig === DEFAULT_SIG_FR) {
      return \`Cordialement,<br><br>L’équipe de recrutement des Forces armées canadiennes<br>Centre de recrutement des Forces canadiennes Québec<br>Commandement du Personnel militaire / Forces armées canadiennes<br><a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a>\`;
    }
    return this.getHtmlSignature(sig);
  }`;

const replaceHtmlFr = `  getHtmlSignatureFr(): string {
    const sig = this.customSignatureFr();
    let html = this.getHtmlSignature(sig);
    html = html.replace(
      "Centre d’assistance | Forces armées canadiennes",
      \`<a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance</a> | <a href="https://forces.ca/fr/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Forces armées canadiennes</a>\`
    );
    return html;
  }`;

const targetHtmlEn = `  getHtmlSignatureEn(): string {
    const sig = this.customSignatureEn();
    if (sig === DEFAULT_SIG_EN) {
      return \`Sincerely,<br><br>The Canadian Armed Forces Recruiting Team<br>Canadian Forces Recruiting Centre Quebec<br>Military Personnel Command / Canadian Armed Forces<br><a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre | Canadian Armed Forces</a>\`;
    }
    return this.getHtmlSignature(sig);
  }`;

const replaceHtmlEn = `  getHtmlSignatureEn(): string {
    const sig = this.customSignatureEn();
    let html = this.getHtmlSignature(sig);
    html = html.replace(
      "Help Centre | Canadian Armed Forces",
      \`<a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre</a> | <a href="https://forces.ca/en/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Canadian Armed Forces</a>\`
    );
    return html;
  }`;

code = code.replace(targetHtmlFr, replaceHtmlFr);
code = code.replace(targetHtmlEn, replaceHtmlEn);

fs.writeFileSync('src/services/shared-state.service.ts', code);
console.log("Patched shared-state.service.ts");
