const fs = require('fs');
let code = fs.readFileSync('src/app/components/job-search-modal.component.ts', 'utf8');

const target1 = `  isJobRp(jobId: string): boolean {
    return this.jobService.isJobRp(jobId);
  }`;

const newTarget1 = `  isJobRp(jobId: string): boolean {
    return this.jobService.isJobRp(jobId);
  }

  isOfficerJob(jobId: string): boolean {
    return this.jobService.isOfficerJob(jobId);
  }`;

code = code.replace(target1, newTarget1);
fs.writeFileSync('src/app/components/job-search-modal.component.ts', code);
console.log("Patched modal ts");
