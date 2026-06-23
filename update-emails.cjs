const fs = require('fs');

let content = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const htmlFrOld = `    if (hasInadmissible) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer que vous n'êtes pas admissible pour le/les métier(s) que vous aviez sélectionné(s) :<br><br>";
      for (const item of inadmissibleJobs) {
        const titleFr = item.job.urlFr ? \`<a href="\${item.job.urlFr}" style="color: blue; text-decoration: underline;">\${item.job.title}</a>\` : item.job.title;
        fr += \`- \${item.job.id} - \${titleFr}<br>\`;
        for (const reason of item.admissibility.reasons) {
           fr += \`&nbsp;&nbsp;Raison : \${reason}<br>\`;
        }
        fr += \`<br>\`;
      }
      fr += "Cependant, b";
    } else {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer qu'une réorientation est requise. B";
    }`;

const htmlFrNew = `    const hasAnyJob = this.fileJobsAnalysis().length > 0;
    if (hasInadmissible) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer que vous n'êtes pas admissible pour le/les métier(s) que vous aviez sélectionné(s) :<br><br>";
      for (const item of inadmissibleJobs) {
        const titleFr = item.job.urlFr ? \`<a href="\${item.job.urlFr}" style="color: blue; text-decoration: underline;">\${item.job.title}</a>\` : item.job.title;
        fr += \`- \${item.job.id} - \${titleFr}<br>\`;
        for (const reason of item.admissibility.reasons) {
           fr += \`&nbsp;&nbsp;Raison : \${reason}<br>\`;
        }
        fr += \`<br>\`;
      }
      fr += "Cependant, b";
    } else if (hasAnyJob) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer qu'une réorientation est requise. B";
    } else {
      fr += "Suite à l'analyse de votre dossier, nous constatons que vous n'avez présentement aucun métier sélectionné. B";
    }`;

const htmlEnOld = `    if (hasInadmissible) {
      en += "Following the review of your file, we must inform you that you do not meet the requirements for the trade(s) you had selected:<br><br>";
      for (const item of inadmissibleJobs) {
        const titleEn = item.job.urlEn ? \`<a href="\${item.job.urlEn}" style="color: blue; text-decoration: underline;">\${this.translateJobTitle(item.job)}</a>\` : this.translateJobTitle(item.job);
        en += \`- \${item.job.id} - \${titleEn}<br>\`;
        for (const reason of item.admissibility.reasons) {
           en += \`&nbsp;&nbsp;Reason: \${this.translateReason(reason)}<br>\`;
        }
        en += "<br>";
      }
      en += "However, b";
    } else {
      en += "Following the review of your file, we must inform you that a reorientation is required. B";
    }`;

const htmlEnNew = `    if (hasInadmissible) {
      en += "Following the review of your file, we must inform you that you do not meet the requirements for the trade(s) you had selected:<br><br>";
      for (const item of inadmissibleJobs) {
        const titleEn = item.job.urlEn ? \`<a href="\${item.job.urlEn}" style="color: blue; text-decoration: underline;">\${this.translateJobTitle(item.job)}</a>\` : this.translateJobTitle(item.job);
        en += \`- \${item.job.id} - \${titleEn}<br>\`;
        for (const reason of item.admissibility.reasons) {
           en += \`&nbsp;&nbsp;Reason: \${this.translateReason(reason)}<br>\`;
        }
        en += "<br>";
      }
      en += "However, b";
    } else if (hasAnyJob) {
      en += "Following the review of your file, we must inform you that a reorientation is required. B";
    } else {
      en += "Following the review of your file, we note that you currently have no trades selected. B";
    }`;

const textFrOld = `    if (hasInadmissible) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer que vous n'êtes pas admissible pour le/les métier(s) que vous aviez sélectionné(s) :\\n\\n";
      for (const item of inadmissibleJobs) {
        fr += \`- \${item.job.id} - \${item.job.title}\\n\`;
        for (const reason of item.admissibility.reasons) {
           fr += \`  Raison : \${reason}\\n\`;
        }
        fr += \`\\n\`;
      }
      fr += "Cependant, b";
    } else {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer qu'une réorientation est requise. B";
    }`;

const textFrNew = `    const hasAnyJob = this.fileJobsAnalysis().length > 0;
    if (hasInadmissible) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer que vous n'êtes pas admissible pour le/les métier(s) que vous aviez sélectionné(s) :\\n\\n";
      for (const item of inadmissibleJobs) {
        fr += \`- \${item.job.id} - \${item.job.title}\\n\`;
        for (const reason of item.admissibility.reasons) {
           fr += \`  Raison : \${reason}\\n\`;
        }
        fr += \`\\n\`;
      }
      fr += "Cependant, b";
    } else if (hasAnyJob) {
      fr += "Suite à l'analyse de votre dossier, nous devons vous informer qu'une réorientation est requise. B";
    } else {
      fr += "Suite à l'analyse de votre dossier, nous constatons que vous n'avez présentement aucun métier sélectionné. B";
    }`;

const textEnOld = `    if (hasInadmissible) {
      en += "Following the review of your file, we must inform you that you do not meet the requirements for the trade(s) you had selected:\\n\\n";
      for (const item of inadmissibleJobs) {
        en += \`- \${item.job.id} - \${this.translateJobTitle(item.job)}\\n\`;
        for (const reason of item.admissibility.reasons) {
           en += \`  Reason: \${this.translateReason(reason)}\\n\`;
        }
        en += "\\n";
      }
      en += "However, b";
    } else {
      en += "Following the review of your file, we must inform you that a reorientation is required. B";
    }`;

const textEnNew = `    if (hasInadmissible) {
      en += "Following the review of your file, we must inform you that you do not meet the requirements for the trade(s) you had selected:\\n\\n";
      for (const item of inadmissibleJobs) {
        en += \`- \${item.job.id} - \${this.translateJobTitle(item.job)}\\n\`;
        for (const reason of item.admissibility.reasons) {
           en += \`  Reason: \${this.translateReason(reason)}\\n\`;
        }
        en += "\\n";
      }
      en += "However, b";
    } else if (hasAnyJob) {
      en += "Following the review of your file, we must inform you that a reorientation is required. B";
    } else {
      en += "Following the review of your file, we note that you currently have no trades selected. B";
    }`;


content = content.replace(htmlFrOld, htmlFrNew);
content = content.replace(htmlEnOld, htmlEnNew);
content = content.replace(textFrOld, textFrNew);
content = content.replace(textEnOld, textEnNew);

fs.writeFileSync('src/app/components/reorientation.component.ts', content, 'utf8');
console.log('Component updated');
