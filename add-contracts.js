import * as fs from 'fs';
import * as path from 'path';

const MR_CONTRACTS = {
  "00005": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00010": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00019": [{ program: "Enrôlement direct", duration: "7 ans" }],
  "00021": [{ program: "Enrôlement direct", duration: "6 ans" }],
  "00099": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00100": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00101": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00105": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00109": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00114": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00115": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00120": [{ program: "Enrôlement direct", duration: "6 ans" }],
  "00129": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00130": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00134": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00135": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00136": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00137": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00138": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00149": [{ program: "Enrôlement direct", duration: "9 ans" }],
  "00152": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "9 ans" }],
  "00153": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "9 ans" }],
  "00155": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "8 ans" }],
  "00161": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00164": [{ program: "Enrôlement direct", duration: "3 ans" }, { program: "PFS-MR", duration: "5 ans" }],
  "00165": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00166": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00167": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00168": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00169": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00170": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00171": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00238": [{ program: "Enrôlement direct", duration: "6 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00261": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00299": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00301": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "6 ans" }],
  "00302": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "6 ans" }],
  "00303": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00304": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "6 ans" }],
  "00305": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00306": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "6 ans" }],
  "00307": [], // S/O
  "00322": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00324": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00327": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "7 ans" }],
  "00335": [{ program: "Enrôlement direct", duration: "5 ans" }, { program: "PFS-MR", duration: "8 ans" }],
  "00337": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00339": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00342": [],
  "00343": [{ program: "Enrôlement direct", duration: "7 ans" }],
  "00357": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00363": [],
  "00366": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "6 ans" }],
  "00368": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00369": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00370": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00371": [{ program: "Enrôlement direct", duration: "7 ans" }],
  "00372": [{ program: "Enrôlement direct", duration: "6 ans" }, { program: "PFS-MR", duration: "9 ans" }],
  "00373": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00375": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00376": [{ program: "Enrôlement direct", duration: "3 ans" }],
  "00377": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00378": [{ program: "Enrôlement direct", duration: "6 ans" }, { program: "PFS-MR", duration: "8 ans" }],
  "00380": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00382": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00383": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00384": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00385": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00386": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00387": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00388": [],
  "00391": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00392": [{ program: "Enrôlement direct", duration: "5 ans" }],
  "00394": [{ program: "Enrôlement direct", duration: "4 ans" }],
  "00402": [{ program: "Enrôlement direct", duration: "1 an" }],
  "00404": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "8 ans" }],
  "00405": [{ program: "Enrôlement direct", duration: "4 ans" }, { program: "PFS-MR", duration: "8 ans" }],
  "00406": [{ program: "Enrôlement direct", duration: "6 ans" }, { program: "PFS-MR", duration: "9 ans" }],
  "00407": [{ program: "Enrôlement direct", duration: "3 ans" }]
};

const OF_CONTRACTS = {
  "00178": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00179": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00180": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00181": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00182": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "12 ans" }],
  "00183": [{ program: "EDO/PSAC", duration: "13 ans" }, { program: "PFOR", duration: "17 ans" }],
  "00184": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00185": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00187": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00189": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00190": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "SEELM/PFOS", duration: "9 ans" }],
  "00191": [{ program: "EDO", duration: "6 ans" }, { program: "PME-Dent/PFOS", duration: "10 ans" }],
  "00194": [{ program: "EDO/PSAC", duration: "4 ans" }, { program: "PMEP/PFOS", duration: "9 ans" }],
  "00195": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "11 ans" }],
  "00197": [{ program: "EDO/PSAC", duration: "9 ans" }],
  "00198": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "ES_PMNE/PFOS", duration: "9 ans" }],
  "00203": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00204": [{ program: "EDO", duration: "7 ans" }, { program: "PMED", duration: "12 ans" }],
  "00207": [{ program: "EDO/PSAC", duration: "8 ans" }, { program: "PFOR", duration: "12 ans" }],
  "00208": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00210": [{ program: "EDO/PSAC", duration: "6 ans" }],
  "00211": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00213": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00214": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00328": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00340": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00341": [{ program: "EDO/PSAC", duration: "9 ans" }, { program: "PFOR", duration: "13 ans" }],
  "00344": [{ program: "EDO/PSAC", duration: "8 ans" }, { program: "PFOR", duration: "12 ans" }],
  "00345": [{ program: "EDO/PSAC", duration: "8 ans" }, { program: "PFOR", duration: "12 ans" }],
  "00346": [],
  "00349": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "ES_PMNE/PFOS", duration: "12 ans" }],
  "00374": [{ program: "EDO/PSAC", duration: "5 ans" }, { program: "PFAMM/PFOS", duration: "9 ans" }],
  "00389": [{ program: "EDO/PSAC", duration: "6 ans" }, { program: "PFOR", duration: "10 ans" }],
  "00390": [{ program: "EDO", duration: "5 ans" }, { program: "PFOS", duration: "12 ans" }],
  "00393": [{ program: "EDO", duration: "5 ans" }, { program: "PMEM/PFOS", duration: "12 ans" }],
  "00398": [{ program: "EDO/PSAC", duration: "10 ans" }, { program: "PFOR", duration: "14 ans" }],
  "00401": [{ program: "EDO/PSAC", duration: "7 ans" }, { program: "PFOR", duration: "11 ans" }]
};

const ALL_CONTRACTS = { ...MR_CONTRACTS, ...OF_CONTRACTS };

const filePath = path.resolve('src/services/jobs-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Also update the interface
content = content.replace(
  /export interface JobEntry \{([\s\S]*?)\}/,
  (match, p1) => {
    if (!p1.includes('contracts?:')) {
      return `export interface JobEntry {${p1}  contracts?: { program: string; duration: string }[];\n}`;
    }
    return match;
  }
);


const arrayStartPrefix = "export const JOBS_DATA: JobEntry[] = ";
const startIndex = content.indexOf(arrayStartPrefix);

if (startIndex !== -1) {
    const arrayStart = startIndex + arrayStartPrefix.length;
    const endIndex = content.lastIndexOf('];') + 1;
    const arrayString = content.substring(arrayStart, endIndex);
    
    const jobs = eval('(' + arrayString + ')');
    
    jobs.forEach(job => {
      if (ALL_CONTRACTS[job.id]) {
        job.contracts = ALL_CONTRACTS[job.id];
      }
    });

    // Make sure we have 00005 at the top, since the user wants them sorted by ID
    jobs.sort((a, b) => {
        if (!a.id) return 1;
        if (!b.id) return -1;
        return a.id.localeCompare(b.id);
    });
    
    const sortedArrayString = JSON.stringify(jobs, null, 2);
    
    const newContent = content.substring(0, arrayStart) + sortedArrayString + ';\n';
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Successfully added contracts and saved.');
} else {
    console.error('Could not find JOBS_DATA array.');
}
