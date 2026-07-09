const fs = require('fs');
let code = fs.readFileSync('src/app.component.ts', 'utf8');

// Replace normalTasks for text email FR
code = code.replace(
  /for \(const item of items\) {\s*let docNameFr = item\.doc\.nameFr;\s*emailFr \+= `\\n    ◦ \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;\s*emailFr \+= `\\n      → \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "\\n        "\)\}`;\s*}/g,
  `let lastInstructionFr = "";
        let lastDocNameFr = "";
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          emailFr += \`\\n    ◦ \${docNameFr} : \${item.reason.labelFr}\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            emailFr += \`\\n      → \${item.reason.instructionFr.replace(/\\n/g, "\\n        ")}\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
        }`
);

// Replace confirmationTasks for text email FR
code = code.replace(
  /for \(const item of items\) {\s*let docNameFr = item\.doc\.nameFr;\s*emailFr \+= `\\n\\n• \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;\s*emailFr \+= `\\n  → \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "\\n    "\)\}`;\s*}/g,
  `let lastInstructionFr = "";
        let lastDocNameFr = "";
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          emailFr += \`\\n\\n• \${docNameFr} : \${item.reason.labelFr}\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            emailFr += \`\\n  → \${item.reason.instructionFr.replace(/\\n/g, "\\n    ")}\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
        }`
);

// Replace normalTasks for text email EN
code = code.replace(
  /for \(const item of items\) {\s*let docNameEn = item\.doc\.nameEn;\s*emailEn \+= `\\n    ◦ \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;\s*emailEn \+= `\\n      → \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "\\n        "\)\}`;\s*}/g,
  `let lastInstructionEn = "";
        let lastDocNameEn = "";
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          emailEn += \`\\n    ◦ \${docNameEn} : \${item.reason.labelEn}\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            emailEn += \`\\n      → \${item.reason.instructionEn.replace(/\\n/g, "\\n        ")}\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
        }`
);

// Replace confirmationTasks for text email EN
code = code.replace(
  /for \(const item of items\) {\s*let docNameEn = item\.doc\.nameEn;\s*emailEn \+= `\\n\\n• \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;\s*emailEn \+= `\\n  → \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "\\n    "\)\}`;\s*}/g,
  `let lastInstructionEn = "";
        let lastDocNameEn = "";
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          emailEn += \`\\n\\n• \${docNameEn} : \${item.reason.labelEn}\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            emailEn += \`\\n  → \${item.reason.instructionEn.replace(/\\n/g, "\\n    ")}\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
        }`
);

// Replace normalTasks for HTML FR
code = code.replace(
  /for \(const item of items\) {\s*let docNameFr = item\.doc\.nameFr;\s*html \+= `<li style="margin-bottom: 10px;">`;\s*html \+= `<span style="background-color: yellow; padding: 0 2px;">\$\{docNameFr\} : <span style="color: #FF0000;">\$\{item\.reason\.labelFr\}<\/span><\/span>`;\s*html \+= `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*html \+= `<\/li>`;\s*}/g,
  `let lastInstructionFr = "";
        let lastDocNameFr = "";
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          html += \`<li style="margin-bottom: 10px;">\`;
          html += \`<span style="background-color: yellow; padding: 0 2px;">\${docNameFr} : <span style="color: #FF0000;">\${item.reason.labelFr}</span></span>\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionFr.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          html += \`</li>\`;
        }`
);

// Replace confirmationTasks for HTML FR
code = code.replace(
  /for \(const item of items\) {\s*let docNameFr = item\.doc\.nameFr;\s*html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameFr\} : <span style="color: #d97706;">\$\{item\.reason\.labelFr\}<\/span><\/span><\/strong>`;\s*html \+= `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionFr\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*html \+= `<\/li>`;\s*}/g,
  `let lastInstructionFr = "";
        let lastDocNameFr = "";
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          html += \`<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\${docNameFr} : <span style="color: #d97706;">\${item.reason.labelFr}</span></span></strong>\`;
          if (docNameFr !== lastDocNameFr || item.reason.instructionFr !== lastInstructionFr) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionFr.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionFr = item.reason.instructionFr;
            lastDocNameFr = docNameFr;
          }
          html += \`</li>\`;
        }`
);

// Replace normalTasks for HTML EN
code = code.replace(
  /for \(const item of items\) {\s*let docNameEn = item\.doc\.nameEn;\s*html \+= `<li style="margin-bottom: 10px;">`;\s*html \+= `<span style="background-color: yellow; padding: 0 2px;">\$\{docNameEn\} : <span style="color: #FF0000;">\$\{item\.reason\.labelEn\}<\/span><\/span>`;\s*html \+= `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*html \+= `<\/li>`;\s*}/g,
  `let lastInstructionEn = "";
        let lastDocNameEn = "";
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          html += \`<li style="margin-bottom: 10px;">\`;
          html += \`<span style="background-color: yellow; padding: 0 2px;">\${docNameEn} : <span style="color: #FF0000;">\${item.reason.labelEn}</span></span>\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            html += \`<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionEn.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          html += \`</li>\`;
        }`
);

// Replace confirmationTasks for HTML EN
code = code.replace(
  /for \(const item of items\) {\s*let docNameEn = item\.doc\.nameEn;\s*html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameEn\} : <span style="color: #d97706;">\$\{item\.reason\.labelEn\}<\/span><\/span><\/strong>`;\s*html \+= `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \$\{item\.reason\.instructionEn\.replace\(\/\\n\/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;"\)\}<\/span>`;\s*html \+= `<\/li>`;\s*}/g,
  `let lastInstructionEn = "";
        let lastDocNameEn = "";
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          html += \`<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\${docNameEn} : <span style="color: #d97706;">\${item.reason.labelEn}</span></span></strong>\`;
          if (docNameEn !== lastDocNameEn || item.reason.instructionEn !== lastInstructionEn) {
            html += \`<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; \${item.reason.instructionEn.replace(/\\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>\`;
            lastInstructionEn = item.reason.instructionEn;
            lastDocNameEn = docNameEn;
          }
          html += \`</li>\`;
        }`
);

fs.writeFileSync('src/app.component.ts', code);
