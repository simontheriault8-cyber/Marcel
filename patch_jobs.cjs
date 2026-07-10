const fs = require('fs');
let code = fs.readFileSync('src/services/job-database.service.ts', 'utf8');

const replacement = `  readonly RP_JOBS = new Set([`;

const newCode = `  // Set of Officer Jobs
  readonly OFFICER_JOBS = new Set([
      "00178", "00179", "00180", "00181", "00182", "00183", "00184", "00185",
      "00187", "00189", "00190", "00191", "00194", "00195", "00196", "00201",
      "00204", "00207", "00213", "00225", "00227", "00228", "00234", "00282",
      "00328", "00340", "00341", "00344", "00345", "00346", "00348", "00349",
      "00350", "00353", "00355", "00357", "00358", "00360", "00373", "00377",
      "00379", "00388", "00197", "00198", "00203", "00208", "00211", "00374", 
      "00389", "00390", "00393", "00398", "00214"
  ]);
  
  isOfficerJob(jobId: string): boolean {
    return this.OFFICER_JOBS.has(jobId);
  }

  readonly RP_JOBS = new Set([`;

code = code.replace(replacement, newCode);
fs.writeFileSync('src/services/job-database.service.ts', code);
console.log("Patched JobDatabaseService");
