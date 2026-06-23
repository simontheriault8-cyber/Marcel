const fs = require('fs');

let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

// Function to remove a job by ID
function removeJob(jobId) {
    const jobStartStr = `{\n    "id": "${jobId}",`;
    let start = content.indexOf(jobStartStr);
    if (start === -1) {
        console.log(`Job ${jobId} not found.`);
        return;
    }
    
    // Look backwards to find the nearest `  },` to properly remove the element
    let commaBefore = content.lastIndexOf(`  },\n  {`, start);
    let commaAfter = content.indexOf(`\n  },\n  {\n`, start);
    
    if (commaAfter !== -1) {
        // delete from the start of this job to the next
        // the `\n  },\n  {\n` serves as the delimiter.
        // We can just cut from `start` up to `commaAfter + 7` which is `\n  {\n`
        content = content.substring(0, start) + content.substring(commaAfter + 7);
    } else {
         console.log('Could not find next job for boundary');
    }
}

removeJob("00191-02");
removeJob("00346");

// Update 00390
const p390 = `"id": "00390",\n    "title": "MÉDECIN SPÉCIALISTE",\n    "titleEn": "Medical Specialist",\n    "abbreviation": "MÉD SPÉC",\n    "requirements": "FORCE RÉGULIÈRE"`;

const r390 = `"id": "00390",\n    "title": "MÉDECIN SPÉCIALISTE",\n    "titleEn": "Medical Specialist",\n    "abbreviation": "MÉD SPÉC",\n    "urlFr": "https://forces.ca/fr/carriere/medecin/",\n    "urlEn": "https://forces.ca/en/career/medical-officer/",\n    "requirements": "FORCE RÉGULIÈRE"`;

content = content.replace(p390, r390);

fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
console.log("jobs-data.ts updated!");
