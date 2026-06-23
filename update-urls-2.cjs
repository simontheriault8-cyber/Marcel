const fs = require('fs');
let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

const updates = {
  "00402": {
    fr: "https://forces.ca/fr/programme-experience-de-la-marine/",
    en: "https://forces.ca/en/naval-experience-program/?slug=nep"
  },
  "00404": {
    fr: "https://forces.ca/fr/carriere/technicien-electricite-systemes/",
    en: "https://forces.ca/en/career/marine-systems-electrical-technician/"
  },
  "00405": {
    fr: "https://forces.ca/fr/carriere/technicien-mecanique-systemes/",
    en: "https://forces.ca/en/career/marine-systems-mechanical-technician/"
  }
};

for (const [id, urls] of Object.entries(updates)) {
  const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"abbreviation":\\s*".*?",)`);
  if (content.match(regex)) {
      content = content.replace(regex, `$1\n    "urlFr": "${urls.fr}",\n    "urlEn": "${urls.en}",`);
  }
}

fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
console.log('URLs updated!');
