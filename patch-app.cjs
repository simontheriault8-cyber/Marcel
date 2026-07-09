const fs = require('fs');

let code = fs.readFileSync('src/app.component.ts', 'utf8');

const regexTextFrNormal = /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*for \(const item of items\) \{\s*let docNameFr = item\.doc\.nameFr;\s*emailFr \+= `\\n    ◦ \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;\s*if \(docNameFr !== lastDocNameFr \|\| item\.reason\.instructionFr !== lastInstructionFr\) \{\s*emailFr \+= `\\n      → \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "\\n        "\)\}`;\s*lastInstructionFr = item\.reason\.instructionFr;\s*lastDocNameFr = docNameFr;\s*\}\s*\}/g;

const replacementTextFrNormal = `let lastInstructionFr = "";
        let lastDocNameFr = "";
        let printedLinksFr = new Set<string>();
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          if (docNameFr !== lastDocNameFr) {
            printedLinksFr.clear();
          }
          emailFr += \`\\n    ◦ \${docNameFr} : \${item.reason.labelFr}\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            emailFr += \`\\n      → \${item.reason.instructionFr.replace(/\\n/g, "\\n        ")}\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          if (item.reason.linkFr && !printedLinksFr.has(item.reason.linkFr)) {
            emailFr += \`\\n      🔗 \${item.reason.linkFr}\`;
            printedLinksFr.add(item.reason.linkFr);
          }
        }`;
code = code.replace(regexTextFrNormal, replacementTextFrNormal);

const regexTextFrConfirm = /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*for \(const item of items\) \{\s*let docNameFr = item\.doc\.nameFr;\s*emailFr \+= `\\n\\n• \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;\s*if \(docNameFr !== lastDocNameFr \|\| item\.reason\.instructionFr !== lastInstructionFr\) \{\s*emailFr \+= `\\n  → \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "\\n    "\)\}`;\s*lastInstructionFr = item\.reason\.instructionFr;\s*lastDocNameFr = docNameFr;\s*\}\s*\}/g;

const replacementTextFrConfirm = `let lastInstructionFr = "";
        let lastDocNameFr = "";
        let printedLinksFr = new Set<string>();
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          if (docNameFr !== lastDocNameFr) {
            printedLinksFr.clear();
          }
          emailFr += \`\\n\\n• \${docNameFr} : \${item.reason.labelFr}\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            emailFr += \`\\n  → \${item.reason.instructionFr.replace(/\\n/g, "\\n    ")}\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          if (item.reason.linkFr && !printedLinksFr.has(item.reason.linkFr)) {
            emailFr += \`\\n  🔗 \${item.reason.linkFr}\`;
            printedLinksFr.add(item.reason.linkFr);
          }
        }`;
code = code.replace(regexTextFrConfirm, replacementTextFrConfirm);

const regexTextEnNormal = /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*for \(const item of items\) \{\s*let docNameEn = item\.doc\.nameEn;\s*emailEn \+= `\\n    ◦ \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;\s*if \(docNameEn !== lastDocNameEn \|\| item\.reason\.instructionEn !== lastInstructionEn\) \{\s*emailEn \+= `\\n      → \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "\\n        "\)\}`;\s*lastInstructionEn = item\.reason\.instructionEn;\s*lastDocNameEn = docNameEn;\s*\}\s*\}/g;

const replacementTextEnNormal = `let lastInstructionEn = "";
        let lastDocNameEn = "";
        let printedLinksEn = new Set<string>();
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          if (docNameEn !== lastDocNameEn) {
            printedLinksEn.clear();
          }
          emailEn += \`\\n    ◦ \${docNameEn} : \${item.reason.labelEn}\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            emailEn += \`\\n      → \${item.reason.instructionEn.replace(/\\n/g, "\\n        ")}\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          if (item.reason.linkEn && !printedLinksEn.has(item.reason.linkEn)) {
            emailEn += \`\\n      🔗 \${item.reason.linkEn}\`;
            printedLinksEn.add(item.reason.linkEn);
          }
        }`;
code = code.replace(regexTextEnNormal, replacementTextEnNormal);

const regexTextEnConfirm = /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*for \(const item of items\) \{\s*let docNameEn = item\.doc\.nameEn;\s*emailEn \+= `\\n\\n• \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;\s*if \(docNameEn !== lastDocNameEn \|\| item\.reason\.instructionEn !== lastInstructionEn\) \{\s*emailEn \+= `\\n  → \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "\\n    "\)\}`;\s*lastInstructionEn = item\.reason\.instructionEn;\s*lastDocNameEn = docNameEn;\s*\}\s*\}/g;

const replacementTextEnConfirm = `let lastInstructionEn = "";
        let lastDocNameEn = "";
        let printedLinksEn = new Set<string>();
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          if (docNameEn !== lastDocNameEn) {
            printedLinksEn.clear();
          }
          emailEn += \`\\n\\n• \${docNameEn} : \${item.reason.labelEn}\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            emailEn += \`\\n  → \${item.reason.instructionEn.replace(/\\n/g, "\\n    ")}\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          if (item.reason.linkEn && !printedLinksEn.has(item.reason.linkEn)) {
            emailEn += \`\\n  🔗 \${item.reason.linkEn}\`;
            printedLinksEn.add(item.reason.linkEn);
          }
        }`;
code = code.replace(regexTextEnConfirm, replacementTextEnConfirm);

const regexHtmlFrNormal = /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*for \(const item of items\) \{\s*let docNameFr = item\.doc\.nameFr;\s*html \+= `<li style="margin-bottom: 10px;">`;\s*html \+= `<span style="background-color: yellow; padding: 0 2px;">\$\{docNameFr\} : <span style="color: #FF0000;">\$\{item\.reason\.labelFr\}<\/span><\/span>`;\s*if \(docNameFr !== lastDocNameFr \|\| item\.reason\.instructionFr !== lastInstructionFr\) \{\s*html \+= `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*lastInstructionFr = item\.reason\.instructionFr;\s*lastDocNameFr = docNameFr;\s*\}\s*html \+= `<\/li>`;\s*\}/g;

const replacementHtmlFrNormal = `let lastInstructionFr = "";
        let lastDocNameFr = "";
        let printedLinksFr = new Set<string>();
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          if (docNameFr !== lastDocNameFr) {
            printedLinksFr.clear();
          }
          html += \`<li style="margin-bottom: 10px;">\`;
          html += \`<span style="background-color: yellow; padding: 0 2px;">\${docNameFr} : <span style="color: #FF0000;">\${item.reason.labelFr}</span></span>\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionFr.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          if (item.reason.linkFr && !printedLinksFr.has(item.reason.linkFr)) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&#128279; \${item.reason.linkFr}</span>\`;
            printedLinksFr.add(item.reason.linkFr);
          }
          html += \`</li>\`;
        }`;
code = code.replace(regexHtmlFrNormal, replacementHtmlFrNormal);

const regexHtmlFrConfirm = /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*for \(const item of items\) \{\s*let docNameFr = item\.doc\.nameFr;\s*html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameFr\} : <span style="color: #d97706;">\$\{item\.reason\.labelFr\}<\/span><\/span><\/strong>`;\s*if \(docNameFr !== lastDocNameFr \|\| item\.reason\.instructionFr !== lastInstructionFr\) \{\s*html \+= `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*lastInstructionFr = item\.reason\.instructionFr;\s*lastDocNameFr = docNameFr;\s*\}\s*html \+= `<\/li>`;\s*\}/g;

const replacementHtmlFrConfirm = `let lastInstructionFr = "";
        let lastDocNameFr = "";
        let printedLinksFr = new Set<string>();
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          if (docNameFr !== lastDocNameFr) {
            printedLinksFr.clear();
          }
          html += \`<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\${docNameFr} : <span style="color: #d97706;">\${item.reason.labelFr}</span></span></strong>\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionFr.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          if (item.reason.linkFr && !printedLinksFr.has(item.reason.linkFr)) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&#128279; \${item.reason.linkFr}</span>\`;
            printedLinksFr.add(item.reason.linkFr);
          }
          html += \`</li>\`;
        }`;
code = code.replace(regexHtmlFrConfirm, replacementHtmlFrConfirm);

const regexHtmlEnNormal = /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*for \(const item of items\) \{\s*let docNameEn = item\.doc\.nameEn;\s*html \+= `<li style="margin-bottom: 10px;">`;\s*html \+= `<span style="background-color: yellow; padding: 0 2px;">\$\{docNameEn\} : <span style="color: #FF0000;">\$\{item\.reason\.labelEn\}<\/span><\/span>`;\s*if \(docNameEn !== lastDocNameEn \|\| item\.reason\.instructionEn !== lastInstructionEn\) \{\s*html \+= `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*lastInstructionEn = item\.reason\.instructionEn;\s*lastDocNameEn = docNameEn;\s*\}\s*html \+= `<\/li>`;\s*\}/g;

const replacementHtmlEnNormal = `let lastInstructionEn = "";
        let lastDocNameEn = "";
        let printedLinksEn = new Set<string>();
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          if (docNameEn !== lastDocNameEn) {
            printedLinksEn.clear();
          }
          html += \`<li style="margin-bottom: 10px;">\`;
          html += \`<span style="background-color: yellow; padding: 0 2px;">\${docNameEn} : <span style="color: #FF0000;">\${item.reason.labelEn}</span></span>\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionEn.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          if (item.reason.linkEn && !printedLinksEn.has(item.reason.linkEn)) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&#128279; \${item.reason.linkEn}</span>\`;
            printedLinksEn.add(item.reason.linkEn);
          }
          html += \`</li>\`;
        }`;
code = code.replace(regexHtmlEnNormal, replacementHtmlEnNormal);

const regexHtmlEnConfirm = /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*for \(const item of items\) \{\s*let docNameEn = item\.doc\.nameEn;\s*html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameEn\} : <span style="color: #d97706;">\$\{item\.reason\.labelEn\}<\/span><\/span><\/strong>`;\s*if \(docNameEn !== lastDocNameEn \|\| item\.reason\.instructionEn !== lastInstructionEn\) \{\s*html \+= `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*lastInstructionEn = item\.reason\.instructionEn;\s*lastDocNameEn = docNameEn;\s*\}\s*html \+= `<\/li>`;\s*\}/g;

const replacementHtmlEnConfirm = `let lastInstructionEn = "";
        let lastDocNameEn = "";
        let printedLinksEn = new Set<string>();
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          if (docNameEn !== lastDocNameEn) {
            printedLinksEn.clear();
          }
          html += \`<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\${docNameEn} : <span style="color: #d97706;">\${item.reason.labelEn}</span></span></strong>\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionEn.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          if (item.reason.linkEn && !printedLinksEn.has(item.reason.linkEn)) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&#128279; \${item.reason.linkEn}</span>\`;
            printedLinksEn.add(item.reason.linkEn);
          }
          html += \`</li>\`;
        }`;
code = code.replace(regexHtmlEnConfirm, replacementHtmlEnConfirm);

fs.writeFileSync('src/app.component.ts', code);
