const fs = require('fs');

let code = fs.readFileSync('src/app.component.ts', 'utf8');

function replaceBlock(regex, isHtml, isEn, isConfirm) {
  const emailVar = isHtml ? 'html' : (isEn ? 'emailEn' : 'emailFr');
  const langSuffix = isEn ? 'En' : 'Fr';
  const labelProp = 'label' + langSuffix;
  const docNameProp = 'name' + langSuffix;
  const instructionProp = 'instruction' + langSuffix;
  const linkProp = 'link' + langSuffix;
  const andWord = isEn ? 'and' : 'et';
  
  let paddingNormal = isHtml ? '<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">' : '\\n      ';
  let paddingConfirm = isHtml ? '<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">' : '\\n  ';
  let padding = isConfirm ? paddingConfirm : paddingNormal;
  
  let listElemStart = '';
  let listElemEnd = '';
  
  if (isHtml) {
    if (isConfirm) {
      listElemStart = `html += \`<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\${doc.${docNameProp}} : <span style="color: #d97706;">\${labelsStr}</span></span></strong>\`;`;
      listElemEnd = `html += \`</li>\`;`;
    } else {
      listElemStart = `html += \`<li style="margin-bottom: 10px;">\`;\n          html += \`<span style="background-color: yellow; padding: 0 2px;">\${doc.${docNameProp}} : <span style="color: #FF0000;">\${labelsStr}</span></span>\`;`;
      listElemEnd = `html += \`</li>\`;`;
    }
  } else {
    if (isConfirm) {
      listElemStart = `${emailVar} += \`\\n\\n• \${doc.${docNameProp}} : \${labelsStr}\`;`;
    } else {
      listElemStart = `${emailVar} += \`\\n    ◦ \${doc.${docNameProp}} : \${labelsStr}\`;`;
    }
  }
  
  let arrow = isHtml ? '&rarr;' : '→';
  let linkIcon = isHtml ? '&#128279;' : '🔗';
  let newlineReplace = isHtml ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;' : (isConfirm ? '\\n    ' : '\\n        ');
  let spanEnd = isHtml ? '</span>' : '';
  
  const replacement = `const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.${labelProp});
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = \`\${labels[0]} ${andWord} \${labels[1]}\`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' ${andWord} ' + labels[labels.length - 1];
          }
          
          ${listElemStart}
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.${instructionProp})) {
              uniqueInstructions.add(item.reason.${instructionProp});
              ${emailVar} += \`${padding}${arrow} \${item.reason.${instructionProp}.replace(/\\n/g, "${newlineReplace}")}${spanEnd}\`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.${linkProp} && !uniqueLinks.has(item.reason.${linkProp})) {
              uniqueLinks.add(item.reason.${linkProp});
              ${emailVar} += \`${padding}${linkIcon} \${item.reason.${linkProp}}${spanEnd}\`;
            }
          }
          ${listElemEnd}
        }`;
        
  code = code.replace(regex, replacement);
}

// TEXT FR NORMAL
replaceBlock(
  /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*let printedLinksFr = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?emailFr \+= `\\n    ◦ \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;[\s\S]*?printedLinksFr\.add\(item\.reason\.linkFr\);\s*}\s*}/,
  false, false, false
);

// TEXT FR CONFIRM
replaceBlock(
  /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*let printedLinksFr = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?emailFr \+= `\\n\\n• \$\{docNameFr\} : \$\{item\.reason\.labelFr\}`;[\s\S]*?printedLinksFr\.add\(item\.reason\.linkFr\);\s*}\s*}/,
  false, false, true
);

// TEXT EN NORMAL
replaceBlock(
  /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*let printedLinksEn = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?emailEn \+= `\\n    ◦ \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;[\s\S]*?printedLinksEn\.add\(item\.reason\.linkEn\);\s*}\s*}/,
  false, true, false
);

// TEXT EN CONFIRM
replaceBlock(
  /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*let printedLinksEn = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?emailEn \+= `\\n\\n• \$\{docNameEn\} : \$\{item\.reason\.labelEn\}`;[\s\S]*?printedLinksEn\.add\(item\.reason\.linkEn\);\s*}\s*}/,
  false, true, true
);

// HTML FR NORMAL
replaceBlock(
  /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*let printedLinksFr = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?html \+= `<li style="margin-bottom: 10px;">`;[\s\S]*?printedLinksFr\.add\(item\.reason\.linkFr\);\s*}\s*html \+= `<\/li>`;\s*}/,
  true, false, false
);

// HTML FR CONFIRM
replaceBlock(
  /let lastInstructionFr = "";\s*let lastDocNameFr = "";\s*let printedLinksFr = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameFr\} : <span style="color: #d97706;">\$\{item\.reason\.labelFr\}<\/span><\/span><\/strong>`;[\s\S]*?printedLinksFr\.add\(item\.reason\.linkFr\);\s*}\s*html \+= `<\/li>`;\s*}/,
  true, false, true
);

// HTML EN NORMAL
replaceBlock(
  /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*let printedLinksEn = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?html \+= `<li style="margin-bottom: 10px;">`;[\s\S]*?printedLinksEn\.add\(item\.reason\.linkEn\);\s*}\s*html \+= `<\/li>`;\s*}/,
  true, true, false
);

// HTML EN CONFIRM
replaceBlock(
  /let lastInstructionEn = "";\s*let lastDocNameEn = "";\s*let printedLinksEn = new Set<string>\(\);\s*for \(const item of items\) {[\s\S]*?html \+= `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">\$\{docNameEn\} : <span style="color: #d97706;">\$\{item\.reason\.labelEn\}<\/span><\/span><\/strong>`;[\s\S]*?printedLinksEn\.add\(item\.reason\.linkEn\);\s*}\s*html \+= `<\/li>`;\s*}/,
  true, true, true
);

fs.writeFileSync('src/app.component.ts', code);
