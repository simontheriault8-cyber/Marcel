const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const targetCheck = `        if (typeof checkResult === "boolean") {
            meetsRule = checkResult;
            if (!meetsRule) {
                missingFrList.push("Des exigences spécifiques (ex: DEP, Mathématiques ou Sciences) sont manquantes");
                missingEnList.push("Specific requirements (e.g. DEP, Math or Science) are missing");
            }
        }`;

const newCheck = `        if (typeof checkResult === "boolean") {
            meetsRule = checkResult;
            if (!meetsRule) {
                if (this.isOfficerJob(jobId)) {
                    missingFrList.push("Des études universitaires spécifiques sont manquantes");
                    missingEnList.push("Specific university studies are missing");
                } else {
                    missingFrList.push("Des exigences spécifiques (ex: DEP, Mathématiques ou Sciences) sont manquantes");
                    missingEnList.push("Specific requirements (e.g. DEP, Math or Science) are missing");
                }
            }
        }`;

code = code.replace(targetCheck, newCheck);

const targetMsg = `    if (!eduCheckSubmit.eligible) {
      isEducationAdmissible = false;
      if (this.isOfficerJob(jobId)) {
        educationReason = "Vous n'avez pas les études universitaires requises pour satisfaire aux exigences académiques.";
        educationReasonEn = "You do not have the required university education to meet the academic requirements.";
      } else if (eduCheckSubmit.missingFr) {`;

const newMsg = `    if (!eduCheckSubmit.eligible) {
      isEducationAdmissible = false;
      const specializedOfficers = ["00190", "00191", "00194", "00195", "00197", "00198", "00203", "00204", "00208", "00211", "00214", "00349", "00374", "00390", "00393", "00398"];
      if (this.isOfficerJob(jobId)) {
        if (specializedOfficers.includes(jobId) && eduCheckSubmit.missingFr) {
          educationReason = "Vous n'avez pas les études universitaires requises pour satisfaire aux exigences académiques (" + eduCheckSubmit.missingFr + ").";
          educationReasonEn = "You do not have the required university education to meet the academic requirements (" + eduCheckSubmit.missingEn + ").";
        } else {
          educationReason = "Vous n'avez pas les études universitaires requises pour satisfaire aux exigences académiques.";
          educationReasonEn = "You do not have the required university education to meet the academic requirements.";
        }
      } else if (eduCheckSubmit.missingFr) {`;

code = code.replace(targetMsg, newMsg);

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
console.log("Patched");
