const fs = require('fs');

const urls = {
  "00178": ["https://forces.ca/fr/carriere/officier-blindes/", "https://forces.ca/en/career/armour-officer/"],
  "00179": ["https://forces.ca/fr/carriere/officier-artillerie/", "https://forces.ca/en/career/artillery-officer/"],
  "00180": ["https://forces.ca/fr/carriere/officier-infanterie/", "https://forces.ca/en/career/infantry-officer/"],
  "00181": ["https://forces.ca/fr/carriere/officier-genie/", "https://forces.ca/en/career/engineer-officer/"],
  "00182": ["https://forces.ca/fr/carriere/officier-systemes-combat/", "https://forces.ca/en/career/air-combat-systems-officer/"],
  "00183": ["https://forces.ca/fr/carriere/pilote/", "https://forces.ca/en/career/pilot/"],
  "00184": ["https://forces.ca/fr/carriere/officier-controle-aerospatial/", "https://forces.ca/en/career/aerospace-control-officer/"],
  "00185": ["https://forces.ca/fr/carriere/officier-genie-aerospatial/", "https://forces.ca/en/career/aerospace-engineering-officer/"],
  "00187": ["https://forces.ca/fr/carriere/officier-genie-electrique-mecanique/", "https://forces.ca/en/career/electrical-and-mechanical-engineering-officer/"],
  "00189": ["https://forces.ca/fr/carriere/officier-genie-construction/", "https://forces.ca/en/career/construction-engineering-officer/"],
  "00190": ["https://forces.ca/fr/carriere/physiotherapie/", "https://forces.ca/en/career/physiotherapy-officer/"],
  "00191": ["https://forces.ca/fr/carriere/dentiste-militaire/", "https://forces.ca/en/career/dental-officer/"],
  "00194": ["https://forces.ca/fr/carriere/pharmacien/", "https://forces.ca/en/career/pharmacy-officer/"],
  "00195": ["https://forces.ca/fr/carriere/soins-infirmiers/", "https://forces.ca/en/career/nursing-officer/"],
  "00197": ["https://forces.ca/fr/carriere/officier-sciences-biologiques/", "https://forces.ca/en/career/bioscience-officer/"],
  "00198": ["https://forces.ca/fr/carriere/travail-social/", "https://forces.ca/en/career/social-work-officer/"],
  "00203": ["https://forces.ca/fr/carriere/officier-affaires-publiques/", "https://forces.ca/en/career/public-affairs-officer/"],
  "00204": ["https://forces.ca/fr/carriere/avocat/", "https://forces.ca/en/career/legal-officer/"],
  "00207": ["https://forces.ca/fr/carriere/officier-guerre-navale/", "https://forces.ca/en/career/naval-warfare-officer/"],
  "00208": ["https://forces.ca/fr/carriere/officier-selection-personnel/", "https://forces.ca/en/career/personnel-selection-officer/"],
  "00211": ["https://forces.ca/fr/carriere/officier-developpement-instruction/", "https://forces.ca/en/career/training-development-officer/"],
  "00213": ["https://forces.ca/fr/carriere/officier-renseignement/", "https://forces.ca/en/career/intelligence-officer/"],
  "00214": ["https://forces.ca/fr/carriere/officier-police-militaire/", "https://forces.ca/en/career/military-police-officer/"],
  "00328": ["https://forces.ca/fr/carriere/officier-logistique/", "https://forces.ca/en/career/logistics-officer/"],
  "00340": ["https://forces.ca/fr/carriere/officier-genie-electronique-communications/", "https://forces.ca/en/career/communication-and-electronics-engineering-officer/"],
  "00341": ["https://forces.ca/fr/carriere/officier-transmissions/", "https://forces.ca/en/career/signals-officer/"],
  "00344": ["https://forces.ca/fr/carriere/officier-genie-systemes-combat-maritime/", "https://forces.ca/en/career/naval-combat-systems-engineering-officer/"],
  "00345": ["https://forces.ca/fr/carriere/officier-genie-systemes-marine/", "https://forces.ca/en/career/marine-systems-engineering-officer/"],
  "00349": ["https://forces.ca/fr/carriere/aumonier/", "https://forces.ca/en/career/chaplain/"],
  "00374": ["https://forces.ca/fr/carriere/adjoint-au-medecin/", "https://forces.ca/en/career/physician-assistant/"],
  "00389": ["https://forces.ca/fr/carriere/officier-des-operations-aeriennes/", "https://forces.ca/en/career/air-operations-officer/"],
  "00393": ["https://forces.ca/fr/carriere/medecin/", "https://forces.ca/en/career/medical-officer/"],
  "00398": ["https://forces.ca/fr/carriere/officier-gestion-services-sante/", "https://forces.ca/en/career/health-services-management-officer/"]
};

let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

for (const [id, [urlFr, urlEn]] of Object.entries(urls)) {
    // Look for where we match this id, capture everything up to abbreviation or titleEn.
    // If it already has urlFr or hasn't had it added, we'll try targeting abbreviation.
    const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"abbreviation":\\s*".*?",)`);
    content = content.replace(regex, `$1\n    "urlFr": "${urlFr}",\n    "urlEn": "${urlEn}",`);
}

fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
console.log('Update officers URLs complete');
