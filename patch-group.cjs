const fs = require('fs');

function groupItemsLogic(code, isHtml, isEn, isConfirm) {
  const emailVar = isHtml ? 'html' : (isEn ? 'emailEn' : 'emailFr');
  const langSuffix = isEn ? 'En' : 'Fr';
  const labelProp = 'label' + langSuffix;
  const docNameProp = 'name' + langSuffix;
  const instructionProp = 'instruction' + langSuffix;
  const linkProp = 'link' + langSuffix;
  const andWord = isEn ? 'and' : 'et';
  
  let targetRegex = /let lastInstruction(?:Fr|En) = "";[\s\S]*?printedLinks(?:Fr|En)\.add\(item\.reason\.link(?:Fr|En)\);\s*\}\s*?(?:html \+= `<\/li>`;)?\s*\}/;
  
  let paddingNormal = isHtml ? '<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">' : '\\n      ';
  let paddingConfirm = isHtml ? '<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">' : '\\n  ';
  
  let padding = isConfirm ? paddingConfirm : paddingNormal;
  
  let listElemStart = '';
  let listElemEnd = '';
  let titleFormat = '';
  
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
        
  // Note: We need to replace it one by one, there are multiple matches
  // So we will just write a custom script that finds all normal and confirm loops.
}
