const fs = require('fs');
let code = fs.readFileSync('src/app.component.ts', 'utf8');

const regex = /toggleReason\(task: Task, doc: DocumentItem, reason: RejectionReason\) {[\s\S]*?const reasonKey = this\.getReasonKey\(doc, reason\);[\s\S]*?this\.setCompliantState\(task, doc, false\);[\s\S]*?this\.selectedRejectionKeys\.update\(\(set\) => {[\s\S]*?const newSet = new Set\(set\);[\s\S]*?if \(newSet\.has\(reasonKey\)\) {[\s\S]*?newSet\.delete\(reasonKey\);[\s\S]*?} else {[\s\S]*?newSet\.add\(reasonKey\);[\s\S]*?}[\s\S]*?return newSet;[\s\S]*?}\);[\s\S]*?}/;

const replacement = `toggleReason(task: Task, doc: DocumentItem, reason: RejectionReason) {
    const reasonKey = this.getReasonKey(doc, reason);

    // If we select a rejection, the document is no longer "Compliant"
    this.setCompliantState(task, doc, false);

    this.selectedRejectionKeys.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(reasonKey)) {
        newSet.delete(reasonKey);
      } else {
        newSet.add(reasonKey);
        
        // Uncheck others if "Inexistant au dossier" is selected, and vice versa
        if (reason.id.includes("inexist")) {
          // Uncheck all other reasons for this document
          doc.reasons.forEach(r => {
            if (r.id !== reason.id) {
               newSet.delete(this.getReasonKey(doc, r));
            }
          });
        } else {
          // If we check another reason, uncheck "Inexistant au dossier"
          doc.reasons.forEach(r => {
            if (r.id.includes("inexist")) {
               newSet.delete(this.getReasonKey(doc, r));
            }
          });
        }
      }
      return newSet;
    });
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app.component.ts', code);
