const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const target1 = `  customCheck?: (
    selected: Set<string>,
    criteriaCoursSpecialiseIds: string[],
  ) => boolean;`;

const replacement1 = `  customCheck?: (
    selected: Set<string>,
    criteriaCoursSpecialiseIds: string[],
  ) => boolean | { passed: boolean; missingFr?: string; missingEn?: string };`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    console.log("Replaced interface");
}

const target2 = `        meetsRule = rule.customCheck(selected, coursSpecialisesIds);
        if (!meetsRule) {
            missingFrList.push("Des exigences spécifiques (ex: DEP, Mathématiques ou Sciences) sont manquantes");
            missingEnList.push("Specific requirements (e.g. DEP, Math or Science) are missing");
        }`;

const replacement2 = `        const checkResult = rule.customCheck(selected, coursSpecialisesIds);
        if (typeof checkResult === "boolean") {
            meetsRule = checkResult;
            if (!meetsRule) {
                missingFrList.push("Des exigences spécifiques (ex: DEP, Mathématiques ou Sciences) sont manquantes");
                missingEnList.push("Specific requirements (e.g. DEP, Math or Science) are missing");
            }
        } else {
            meetsRule = checkResult.passed;
            if (!meetsRule) {
                if (checkResult.missingFr) missingFrList.push(checkResult.missingFr);
                if (checkResult.missingEn) missingEnList.push(checkResult.missingEn);
            }
        }`;

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    console.log("Replaced logic");
}

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
