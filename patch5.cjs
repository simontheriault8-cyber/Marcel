const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

// Replace in getEligibleJobs
const target1 = `      let meetsRule = false;
      if (rule.customCheck) {
        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
      } else if (`;
const replacement1 = `      let meetsRule = false;
      if (rule.customCheck) {
        const checkResult = rule.customCheck(selected, coursSpecialisesIds);
        meetsRule = typeof checkResult === "boolean" ? checkResult : checkResult.passed;
      } else if (`;

code = code.replace(target1, replacement1);
// Replace in getClosedButEligibleJobs (there might be two occurrences, so let's do global replace or just replace again)
code = code.replace(target1, replacement1);
code = code.replace(target1, replacement1);

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
