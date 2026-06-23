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

  hasReassignedTasks = signal<boolean>(false);

  // Custom Signatures Signals
  customSignatureFr = signal<string>(
    localStorage.getItem("custom_signature_fr") || DEFAULT_SIG_FR
  );
  customSignatureEn = signal<string>(
    localStorage.getItem("custom_signature_en") || DEFAULT_SIG_EN
  );

  getHtmlSignatureFr(): string {
    return this.getHtmlSignature(this.customSignatureFr());
  }

  getHtmlSignatureEn(): string {
    return this.getHtmlSignature(this.customSignatureEn());
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
      /<p>Cordialement,<\/p>[\s\S]*?<a href="https:\/\/forces\.ca\/fr\/centre-dassistance\/#\/">Centre d’assistance<\/a> \| Forces armées canadiennes<\/p>/,
      `<p>` + this.getHtmlSignatureFr() + `</p>`
    );
    // Replace English HTML signature
    html = html.replace(
      /<p>Sincerely,<\/p>[\s\S]*?<a href="https:\/\/forces\.ca\/en\/help-centre\/#\/">Help Centre<\/a> \| Canadian Armed Forces<\/p>/,
      `<p>` + this.getHtmlSignatureEn() + `</p>`
    );
    return html;
  }
}
