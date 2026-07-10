const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const target = `    // Split eligible jobs into NCM and Officer
    const OFFICER_JOB_IDS = new Set([
      "00178",
      "00179",
      "00180",
      "00181",
      "00182",
      "00183",
      "00184",
      "00185",
      "00187",
      "00189",
      "00190",
      "00191",
      "00194",
      "00195",
      "00197",
      "00198",
      "00203",
      "00208",
      "00211",
      "00328",
      "00345",
      "00349",
      "00374",
      "00389",
      "00390",
      "00393",
      "00398",
      "00204",
      "00207",
      "00213",
      "00214",
      "00340",
      "00341",
      "00344",
    ]);

    const listNCM: string[] = [];
    const listOFF: string[] = [];
    for (const jId of jobIds) {
      if (OFFICER_JOB_IDS.has(jId)) {`;

const newCode = `    // Split eligible jobs into NCM and Officer
    const listNCM: string[] = [];
    const listOFF: string[] = [];
    for (const jId of jobIds) {
      if (this.isOfficerJob(jId)) {`;

code = code.replace(target, newCode);
fs.writeFileSync('src/app/components/reorientation.component.ts', code);
console.log("Patched listOFF");
