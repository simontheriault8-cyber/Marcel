const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

// 1. Move OFFICER_JOB_IDS to a method
if (!code.includes('isOfficerJob(')) {
  code = code.replace('  checkJobEducationEligibility', `  isOfficerJob(jobId: string): boolean {
    const OFFICER_JOB_IDS = new Set([
      "00178", "00179", "00180", "00181", "00182", "00183", "00184", "00185",
      "00187", "00189", "00190", "00191", "00194", "00195", "00196", "00201",
      "00204", "00207", "00213", "00225", "00227", "00228", "00234", "00282",
      "00328", "00340", "00341", "00344", "00345", "00346", "00348", "00349",
      "00350", "00353", "00355", "00357", "00358", "00360", "00373", "00377",
      "00379", "00388"
    ]);
    return OFFICER_JOB_IDS.has(jobId);
  }

  checkJobEducationEligibility`);
}

// 2. Modify buildBilingualEmail where it defines OFFICER_JOB_IDS
code = code.replace(/const OFFICER_JOB_IDS = new Set\(\[\s*"00178",\s*"00179",[\s\S]*?"00388",\s*\]\);\s*const listNCM: string\[\] = \[\];\s*const listOFF: string\[\] = \[\];\s*for \(const jId of eligibleJobs\) \{\s*if \(OFFICER_JOB_IDS\.has\(jId\)\) \{/, `const listNCM: string[] = [];
    const listOFF: string[] = [];
    for (const jId of eligibleJobs) {
      if (this.isOfficerJob(jId)) {`);

// 3. Update checkJobEducationEligibility signature and logic
const checkJobRegex = /checkJobEducationEligibility\(jobId: string\): \{ eligible: boolean \} \{([\s\S]*?)return \{ eligible: false \};\n  \}/;
code = code.replace(checkJobRegex, `checkJobEducationEligibility(jobId: string): { eligible: boolean; missingFr?: string; missingEn?: string } {
    const rules = this.jobRules.filter((r) => r.jobs.includes(jobId));
    if (rules.length === 0) {
      return { eligible: true };
    }

    const rawSelected = this.selectedCriteriaIds();
    const selected = new Set(rawSelected);

    const allMathOptions = Object.values(this.MATH_COURSES).reduce(
      (acc, courses) => acc.concat(courses),
      [] as any[],
    );
    const selectedMaths = allMathOptions.filter((m) => selected.has(m.id));

    const hasMath = (grade: number, diff: number) => {
      return selectedMaths.some((m) => m.grade >= grade && m.diff >= diff);
    };

    if (hasMath(10, 1)) selected.add("base_math_10_gen");
    if (hasMath(10, 2)) selected.add("base_math_10_app");
    if (hasMath(10, 3)) selected.add("base_math_10_adv");
    if (hasMath(11, 1)) selected.add("base_math_11_gen");
    if (hasMath(11, 2)) selected.add("base_math_11_app");
    if (hasMath(11, 3)) selected.add("base_math_11_adv");
    if (hasMath(12, 1)) selected.add("base_math_12_gen");
    if (hasMath(12, 2)) selected.add("base_math_12_app");
    if (hasMath(12, 3)) selected.add("base_math_12_adv");

    const coursSpecialisesIds = this.criteriaCoursSpecialise().map((c) => c.id);

    const missingFrList: string[] = [];
    const missingEnList: string[] = [];

    const getLabel = (id: string, isFr: boolean) => {
        const crit = this.manualCriteria.find(c => c.id === id);
        if (crit) {
            if (id === "des_12e_annee") return isFr ? "DES ou 12e année" : "High School Diploma or Grade 12";
            if (id === "sec4_24_credits") return isFr ? "Sec 4 (24 crédits) ou 10e année" : "Grade 10 (24 credits)";
            if (id === "francais_sec4_10e") return isFr ? "Français/Anglais de sec 4 ou 10e année" : "Grade 10 English/French";
            if (id === "francais_sec5_11e") return isFr ? "Français/Anglais de sec 5 ou 11e année" : "Grade 11 English/French";
            if (id === "sci_tech4_sci10") return isFr ? "Science et technologie de sec 4 ou 10e année" : "Grade 10 Science";
            if (id === "chimie_sec5_11e") return isFr ? "Chimie de sec 5 ou 11e année" : "Grade 11 Chemistry";
            if (id === "physique_sec5_11e") return isFr ? "Physique de sec 5 ou 11e année" : "Grade 11 Physics";
            return crit.label;
        }
        if (id === "base_math_10_gen") return isFr ? "Mathématiques de sec 4/10e (générales)" : "Grade 10 Math (General)";
        if (id === "base_math_10_app") return isFr ? "Mathématiques de sec 4/10e (appliquées)" : "Grade 10 Math (Applied)";
        if (id === "base_math_10_adv") return isFr ? "Mathématiques de sec 4/10e (avancées)" : "Grade 10 Math (Advanced)";
        if (id === "base_math_11_gen") return isFr ? "Mathématiques de sec 5/11e (générales)" : "Grade 11 Math (General)";
        if (id === "base_math_11_app") return isFr ? "Mathématiques de sec 5/11e (appliquées)" : "Grade 11 Math (Applied)";
        if (id === "base_math_11_adv") return isFr ? "Mathématiques de sec 5/11e (avancées)" : "Grade 11 Math (Advanced)";
        if (id === "base_math_12_gen") return isFr ? "Mathématiques de 12e (générales)" : "Grade 12 Math (General)";
        if (id === "base_math_12_app") return isFr ? "Mathématiques de 12e (appliquées)" : "Grade 12 Math (Applied)";
        if (id === "base_math_12_adv") return isFr ? "Mathématiques de 12e (avancées)" : "Grade 12 Math (Advanced)";
        return id;
    };

    for (const rule of rules) {
      let meetsRule = false;
      if (rule.customCheck) {
        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
        if (!meetsRule) {
            missingFrList.push("Des exigences spécifiques (ex: DEP, Mathématiques ou Sciences) sont manquantes");
            missingEnList.push("Specific requirements (e.g. DEP, Math or Science) are missing");
        }
      } else if (
        rule.requiredCriteriaIds &&
        rule.requiredCriteriaIds.length > 0
      ) {
        const missingIds = rule.requiredCriteriaIds.filter((id) => !selected.has(id));
        if (missingIds.length === 0) {
            meetsRule = true;
        } else {
            missingFrList.push(missingIds.map(id => getLabel(id, true)).join(" et "));
            missingEnList.push(missingIds.map(id => getLabel(id, false)).join(" and "));
        }
      }

      if (meetsRule) {
        return { eligible: true };
      }
    }
    
    return { 
        eligible: false, 
        missingFr: Array.from(new Set(missingFrList)).join(" OU "),
        missingEn: Array.from(new Set(missingEnList)).join(" OR ")
    };
  }`);

// 4. Update evaluateJobAdmissibility
const evaluateJobRegex = /let isEducationAdmissible = true;\s*let educationReason = "";\s*const eduCheckSubmit = this.checkJobEducationEligibility\(jobId\);\s*if \(!eduCheckSubmit\.eligible\) \{\s*isEducationAdmissible = false;\s*educationReason = "Les critères requis ne sont pas rencontrés.";\s*\}/;

code = code.replace(evaluateJobRegex, `let isEducationAdmissible = true;
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
    }`);

// Also add educationReasonEn to the return type of evaluateJobAdmissibility and 00003 fallback
code = code.replace(/educationReason: "",\n\s*durationYears: 3,/, `educationReason: "",\n        educationReasonEn: "",\n        durationYears: 3,`);
code = code.replace(/educationReason,\n\s*durationYears,/, `educationReason,\n      educationReasonEn,\n      durationYears,`);

// 5. Replace usage in buildBilingualEmail
// "L'âge maximal est de 56 ans et votre âge ne permet pas..." => "Votre âge ne permet pas..."
code = code.replace(/`L'âge maximal est de 56 ans et votre âge ne permet pas de compléter le contrat initial \(\$\{s\.durationYears\} ans\) avant 60 ans\.`/g, 
  "`Votre âge ne permet pas de compléter le contrat initial (${s.durationYears} ans) avant 60 ans.`");

// Replace manual string pushes for education
code = code.replace(/reasonsFrList\.push\(\s*"Votre scolarité ou votre expérience ne satisfait pas aux exigences minimales\.",\s*\);/g, `reasonsFrList.push(s.educationReason);`);
code = code.replace(/reasonsEnList\.push\(\s*"Your academic level or experience does not meet the minimum requirements\.",\s*\);/g, `reasonsEnList.push(s.educationReasonEn);`);

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
