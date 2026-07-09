const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const target = `    let isEducationAdmissible = true;
    let educationReason = "";
    let educationReasonEn = "";
    const eduCheckSubmit = this.checkJobEducationEligibility(jobId);
    if (!eduCheckSubmit.eligible) {
      isEducationAdmissible = false;
      if (!this.isOfficerJob(jobId) && eduCheckSubmit.missingFr) {
        educationReason = "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales (" + eduCheckSubmit.missingFr + ").";
        educationReasonEn = "Your academic level or experience does not meet the minimum requirements (" + eduCheckSubmit.missingEn + ").";
      } else {
        educationReason = "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales.";
        educationReasonEn = "Your academic level or experience does not meet the minimum requirements.";
      }
    }`;

const replacement = `    let isEducationAdmissible = true;
    let educationReason = "";
    let educationReasonEn = "";
    const eduCheckSubmit = this.checkJobEducationEligibility(jobId);
    if (!eduCheckSubmit.eligible) {
      isEducationAdmissible = false;
      if (this.isOfficerJob(jobId)) {
        educationReason = "Vous n'avez pas les études universitaires requises pour satisfaire aux exigences académiques.";
        educationReasonEn = "You do not have the required university education to meet the academic requirements.";
      } else if (eduCheckSubmit.missingFr) {
        educationReason = "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales (" + eduCheckSubmit.missingFr + ").";
        educationReasonEn = "Your academic level or experience does not meet the minimum requirements (" + eduCheckSubmit.missingEn + ").";
      } else {
        educationReason = "Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales.";
        educationReasonEn = "Your academic level or experience does not meet the minimum requirements.";
      }
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/components/reorientation.component.ts', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
