const fs = require('fs');
let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const r390_old = `"id": "00390",\n    "title": "MÉDECIN SPÉCIALISTE",\n    "titleEn": "Medical Specialist",\n    "abbreviation": "MÉD SPÉC",\n    "urlFr": "https://forces.ca/fr/carriere/medecin/",\n    "urlEn": "https://forces.ca/en/career/medical-officer/",\n    "requirements": "FORCE RÉGULIÈRE"`;
const r390_new = `"id": "00390",\n    "title": "MÉDECIN SPÉCIALISTE",\n    "titleEn": "Medical Specialist",\n    "abbreviation": "MÉD SPÉC",\n    "urlFr": "https://forces.ca/fr/carriere/medecin/",\n    "urlEn": "https://forces.ca/en/career/medical-officer/",\n    "requirements": "FORCE RÉGULIÈRE: Doctorat en médecine"`;

const r393_old = `"id": "00393",\n    "title": "MÉDECIN",\n    "titleEn": "Medical Officer",\n    "abbreviation": "MM",\n    "urlFr": "https://forces.ca/fr/carriere/medecin/",\n    "urlEn": "https://forces.ca/en/career/medical-officer/",\n    "requirements": "FORCE RÉGULIÈRE"`;
const r393_new = `"id": "00393",\n    "title": "MÉDECIN",\n    "titleEn": "Medical Officer",\n    "abbreviation": "MM",\n    "urlFr": "https://forces.ca/fr/carriere/medecin/",\n    "urlEn": "https://forces.ca/en/career/medical-officer/",\n    "requirements": "FORCE RÉGULIÈRE: Doctorat en médecine"`;

content = content.replace(r390_old, r390_new);
content = content.replace(r393_old, r393_new);

fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
