const fs = require('fs');
const tsContent = fs.readFileSync('src/services/jobs-data.ts', 'utf8');
const startIndex = tsContent.indexOf('export const JOBS_DATA: JobEntry[] = ');
const dataStr = tsContent.slice(startIndex).replace('export const JOBS_DATA: JobEntry[] = ', '').replace(/;\s*$/, '');
let JOBS_DATA; eval('JOBS_DATA = ' + dataStr);

const embeddedRegex = /(^|[^\p{L}\p{N}])(NOC|NPC|QE|suivants|suivantes|libération|actuel|actuelle|précédent|précédente|précédentes|PM|AIMC|GPM|années|civil|FC|NQ|agréé|EDO|Autorisation|Canada|vitae|D\.M\.D\.|professionnelle|Pharmacie|entrée|tertiaires|MÉ|cycle|autorisé|social|restriction|territoriale|M\.S\.S\.|clinique|OAP|Sgt\/M|Sgt|règle|RECL|PSAC|Candidat|candidats|PFOR|PFUMR|PFOEP|PIOSR|PNSCO|MÉC|TECH|SUR|SAP|ADJUC|baccalauréat|expérience|diplôme|certificat|programme|professionnel|cours|OFP|GÉNIE)([^\p{L}\p{N}]{1,4}?)((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?=$|[^\p{L}\p{N}])/giu;
const endRegex = /\s+((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?:\s*:)?$/g;

let job = JOBS_DATA.find(j => j.id === "00005");
let numNotes = 3;
job.details[0].candidateGroups.forEach(cg => {
  const allStrings = [...cg.candidates, ...cg.requirements.flatMap(r => [...r.education, ...r.experience])];
  allStrings.forEach(str => {
    let str1 = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let textRem = str1.replace(embeddedRegex, '').replace(endRegex, '');
    const unhandledReg = /\b([1-9]|1[0-9]|20)\b/g;
    let m;
    while((m = unhandledReg.exec(textRem)) !== null) {
      const val = parseInt(m[1], 10);
      if (val > 0 && val <= numNotes) {
        console.log(`Unhandled: ${val} in "${str}" -> rem: "${textRem}"`);
      }
    }
  });
});
