import { Injectable, signal } from "@angular/core";

export const DEFAULT_SIG_FR = `Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance (https://forces.ca/fr/centre-dassistance/#/) | Forces armées canadiennes`;

export const DEFAULT_SIG_EN = `Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre (https://forces.ca/en/help-centre/#/) | Canadian Armed Forces`;

@Injectable({
  providedIn: "root",
})
export class SharedStateService {
  includeLinkedEmail = signal<boolean>(false);

  // Stored output from Task panel
  taskNote = signal<string>("");
  taskEmailFr = signal<string>("");
  taskEmailEn = signal<string>("");
  taskEmailHtmlFr = signal<string>("");
  taskEmailHtmlEn = signal<string>("");
  taskEmailHtmlGeneral = signal<string>("");

  // Task bodies for Reorientation intelligent merge
  taskBodyHtmlFr = signal<string>("");
  taskBodyHtmlEn = signal<string>("");
  taskBodyPlainFr = signal<string>("");
  taskBodyPlainEn = signal<string>("");

  // Stored output from Reorientation panel for merging in App component
  reoMergedEmailHtml = signal<string>("");
  reoMergedEmailPlain = signal<string>("");
  reoMergedNote = signal<string>("");

  hasReassignedTasks = signal<boolean>(false);

  // Custom Signatures Signals
  customSignatureFr = signal<string>(
    localStorage.getItem("custom_signature_fr") || DEFAULT_SIG_FR
  );
  customSignatureEn = signal<string>(
    localStorage.getItem("custom_signature_en") || DEFAULT_SIG_EN
  );

  getHtmlSignatureFr(): string {
    const sig = this.customSignatureFr();
    if (sig === DEFAULT_SIG_FR) {
      return `Cordialement,<br><br>L’équipe de recrutement des Forces armées canadiennes<br>Centre de recrutement des Forces canadiennes Québec<br>Commandement du Personnel militaire / Forces armées canadiennes<br><a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a>`;
    }
    return this.getHtmlSignature(sig);
  }

  getHtmlSignatureEn(): string {
    const sig = this.customSignatureEn();
    if (sig === DEFAULT_SIG_EN) {
      return `Sincerely,<br><br>The Canadian Armed Forces Recruiting Team<br>Canadian Forces Recruiting Centre Quebec<br>Military Personnel Command / Canadian Armed Forces<br><a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre | Canadian Armed Forces</a>`;
    }
    return this.getHtmlSignature(sig);
  }

  getHtmlSignature(sig: string): string {
    // 1. Convert newlines to <br>
    let html = sig.replace(/\n/g, "<br>");

    // 2. Auto-link URLs
    html = html.replace(
      /(?<!href=")(https?:\/\/[^\s\)<>]+)/g,
      '<a href="$1" target="_blank" class="text-indigo-600 hover:underline">$1</a>'
    );
    return html;
  }

  saveSignatures(fr: string, en: string) {
    this.customSignatureFr.set(fr);
    this.customSignatureEn.set(en);
    localStorage.setItem("custom_signature_fr", fr);
    localStorage.setItem("custom_signature_en", en);
  }

  getCustomizedScenarioText(bodyText: string): string {
    let text = bodyText;
    // Replace French plain text signature
    text = text.replace(
      /Cordialement,[\s\S]*?Centre d’assistance \| Forces armées canadiennes/,
      this.customSignatureFr()
    );
    // Replace English plain text signature
    text = text.replace(
      /Sincerely,[\s\S]*?Help Centre \| Canadian Armed Forces/,
      this.customSignatureEn()
    );
    return text;
  }

  getCustomizedScenarioHtml(bodyHtml: string): string {
    let html = bodyHtml;
    // Replace French HTML signature
    html = html.replace(
      /<p>Cordialement,<\/p>[\s\S]*?Forces armées canadiennes<\/p>/,
      `<p>` + this.getHtmlSignatureFr() + `</p>`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\/p>[\s\S]*?Canadian Armed Forces<\/p>/,
      `<p>` + this.getHtmlSignatureEn() + `</p>`
    );
    return html;
  }
}
