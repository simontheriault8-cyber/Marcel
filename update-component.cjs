const fs = require('fs');

let content = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const htmlBlockFrOld = `    if (eligibleList.length > 0) {
      for (const job of eligibleList) {
        const titleFr = job.urlFr ? \`<a href="\${job.urlFr}" style="color: blue; text-decoration: underline;">\${job.title}</a>\` : job.title;
        fr += \`- \${job.id} - \${titleFr}<br>\`;
      }
    } else {
       fr += "Malheureusement, aucun métier ne correspond présentement à vos critères.<br>";
    }`;

const htmlBlockFrNew = `    if (eligibleList.length > 0) {
      const ncmEligible = eligibleList.filter(j => !this.isOfficerJob(j.id));
      const officerEligible = eligibleList.filter(j => this.isOfficerJob(j.id));

      if (ncmEligible.length > 0) {
        fr += "<b><u>Métiers de militaire du rang :</u></b><br>";
        for (const job of ncmEligible) {
          const titleFr = job.urlFr ? \`<a href="\${job.urlFr}" style="color: blue; text-decoration: underline;">\${job.title}</a>\` : job.title;
          fr += \`- \${job.id} - \${titleFr}<br>\`;
        }
        fr += "<br>";
      }
      if (officerEligible.length > 0) {
        fr += "<b><u>Métiers d'officier :</u></b><br>";
        for (const job of officerEligible) {
          const titleFr = job.urlFr ? \`<a href="\${job.urlFr}" style="color: blue; text-decoration: underline;">\${job.title}</a>\` : job.title;
          fr += \`- \${job.id} - \${titleFr}<br>\`;
        }
        fr += "<br>";
      }
    } else {
       fr += "Malheureusement, aucun métier ne correspond présentement à vos critères.<br><br>";
    }`;

const htmlBlockEnOld = `    if (eligibleList.length > 0) {
      for (const job of eligibleList) {
        const titleEn = job.urlEn ? \`<a href="\${job.urlEn}" style="color: blue; text-decoration: underline;">\${this.translateJobTitle(job)}</a>\` : this.translateJobTitle(job);
        en += \`- \${job.id} - \${titleEn}<br>\`;
      }
    } else {
       en += "Unfortunately, no trades currently match your criteria.<br>";
    }`;

const htmlBlockEnNew = `    if (eligibleList.length > 0) {
      const ncmEligible = eligibleList.filter(j => !this.isOfficerJob(j.id));
      const officerEligible = eligibleList.filter(j => this.isOfficerJob(j.id));

      if (ncmEligible.length > 0) {
        en += "<b><u>Non-Commissioned Member Trades:</u></b><br>";
        for (const job of ncmEligible) {
          const titleEn = job.urlEn ? \`<a href="\${job.urlEn}" style="color: blue; text-decoration: underline;">\${this.translateJobTitle(job)}</a>\` : this.translateJobTitle(job);
          en += \`- \${job.id} - \${titleEn}<br>\`;
        }
        en += "<br>";
      }
      if (officerEligible.length > 0) {
        en += "<b><u>Officer Trades:</u></b><br>";
        for (const job of officerEligible) {
          const titleEn = job.urlEn ? \`<a href="\${job.urlEn}" style="color: blue; text-decoration: underline;">\${this.translateJobTitle(job)}</a>\` : this.translateJobTitle(job);
          en += \`- \${job.id} - \${titleEn}<br>\`;
        }
        en += "<br>";
      }
    } else {
       en += "Unfortunately, no trades currently match your criteria.<br><br>";
    }`;

const textBlockFrOld = `    if (eligibleList.length > 0) {
      for (const job of eligibleList) {
        fr += \`- \${job.id} - \${job.title}\\n\`;
      }
    } else {
       fr += "Malheureusement, aucun métier ne correspond présentement à vos critères.\\n";
    }`;

const textBlockFrNew = `    if (eligibleList.length > 0) {
      const ncmEligible = eligibleList.filter(j => !this.isOfficerJob(j.id));
      const officerEligible = eligibleList.filter(j => this.isOfficerJob(j.id));

      if (ncmEligible.length > 0) {
        fr += "Métiers de militaire du rang :\\n";
        for (const job of ncmEligible) {
          fr += \`- \${job.id} - \${job.title}\\n\`;
        }
        fr += "\\n";
      }
      if (officerEligible.length > 0) {
        fr += "Métiers d'officier :\\n";
        for (const job of officerEligible) {
          fr += \`- \${job.id} - \${job.title}\\n\`;
        }
        fr += "\\n";
      }
    } else {
       fr += "Malheureusement, aucun métier ne correspond présentement à vos critères.\\n\\n";
    }`;


const textBlockEnOld = `    if (eligibleList.length > 0) {
      for (const job of eligibleList) {
        en += \`- \${job.id} - \${this.translateJobTitle(job)}\\n\`;
      }
    } else {
       en += "Unfortunately, no trades currently match your criteria.\\n";
    }`;

const textBlockEnNew = `    if (eligibleList.length > 0) {
      const ncmEligible = eligibleList.filter(j => !this.isOfficerJob(j.id));
      const officerEligible = eligibleList.filter(j => this.isOfficerJob(j.id));

      if (ncmEligible.length > 0) {
        en += "Non-Commissioned Member Trades:\\n";
        for (const job of ncmEligible) {
          en += \`- \${job.id} - \${this.translateJobTitle(job)}\\n\`;
        }
        en += "\\n";
      }
      if (officerEligible.length > 0) {
        en += "Officer Trades:\\n";
        for (const job of officerEligible) {
          en += \`- \${job.id} - \${this.translateJobTitle(job)}\\n\`;
        }
        en += "\\n";
      }
    } else {
       en += "Unfortunately, no trades currently match your criteria.\\n\\n";
    }`;


content = content.replace(htmlBlockFrOld, htmlBlockFrNew);
content = content.replace(htmlBlockEnOld, htmlBlockEnNew);
content = content.replace(textBlockFrOld, textBlockFrNew);
content = content.replace(textBlockEnOld, textBlockEnNew);

const officerMethod = `
  isOfficerJob(jobId: string): boolean {
    const officerIds = ['00178', '00179', '00180', '00181', '00182', '00183', '00184', '00185', '00187', '00189', '00190', '00191', '00194', '00195', '00197', '00198', '00203', '00204', '00207', '00208', '00211', '00213', '00214', '00328', '00340', '00341', '00344', '00345', '00349', '00374', '00389', '00390', '00393', '00398'];
    return officerIds.includes(jobId);
  }
`;

// Insert the method just before fileJob1Id
content = content.replace("  // File existing jobs\n  fileJob1Id", officerMethod + "  // File existing jobs\n  fileJob1Id");

fs.writeFileSync('src/app/components/reorientation.component.ts', content, 'utf8');
console.log('Update finished');
