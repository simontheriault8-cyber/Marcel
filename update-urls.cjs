const fs = require('fs');

const urls = {
  "00099": ["https://forces.ca/fr/carriere/specialiste-renseignement/", "https://forces.ca/en/career/intelligence-operator/"],
  "00100": ["https://forces.ca/fr/carriere/technicien-meteorologie/", "https://forces.ca/en/career/meteorological-technician/"],
  "00105": ["https://forces.ca/fr/carriere/manoeuvrier/", "https://forces.ca/en/career/boatswain/"],
  "00109": ["https://forces.ca/fr/carriere/technicien-systemes-aerospatiales/", "https://forces.ca/en/career/aerospace-telecommunications-and-information-systems-technician/"],
  "00114": ["https://forces.ca/fr/carriere/operateur-equipement-information-combat/", "https://forces.ca/en/career/naval-combat-information-operator/"],
  "00115": ["https://forces.ca/fr/carriere/operateur-detecteurs-electroniques/", "https://forces.ca/en/career/naval-electronic-sensor-operator/"],
  "00120": ["https://forces.ca/fr/carriere/specialistes-du-renseignement-origine-electromagnetique/", "https://forces.ca/en/career/signals-intelligence-specialist/"],
  "00129": ["https://forces.ca/fr/carriere/technicien-de-vehicule/", "https://forces.ca/en/career/vehicle-technician/"],
  "00130": ["https://forces.ca/fr/carriere/technicien-armement/", "https://forces.ca/en/career/weapons-technician/"],
  "00134": ["https://forces.ca/fr/carriere/technicien-materiaux/", "https://forces.ca/en/career/materials-technician/"],
  "00135": ["https://forces.ca/fr/carriere/technicien-systemes-aeronautiques/", "https://forces.ca/en/career/aviation-systems-technician/"],
  "00136": ["https://forces.ca/fr/carriere/technicien-systeme-avionique/", "https://forces.ca/en/career/avionics-systems-technician/"],
  "00137": ["https://forces.ca/fr/carriere/technicien-imagerie/", "https://forces.ca/en/career/imagery-technician/"],
  "00138": ["https://forces.ca/fr/carriere/technicien-structure-aeronefs/", "https://forces.ca/en/career/aircraft-structures-technician/"],
  "00149": ["https://forces.ca/fr/carriere/pompier/", "https://forces.ca/en/career/firefighter/"],
  "00152": ["https://forces.ca/fr/carriere/technologue-laboratoire-medical/", "https://forces.ca/en/career/medical-laboratory-technologist/"],
  "00153": ["https://forces.ca/fr/carriere/technologue-radiologie-medicale/", "https://forces.ca/en/career/medical-radiation-technologist/"],
  "00155": ["https://forces.ca/fr/carriere/technologue-electronique-biomedicale/", "https://forces.ca/en/career/biomedical-electronics-technologist/"],
  "00161": ["https://forces.ca/fr/carriere/police-militaire/", "https://forces.ca/en/career/military-police/"],
  "00164": ["https://forces.ca/fr/carriere/cuisinier/", "https://forces.ca/en/career/cook/"],
  "00166": ["https://forces.ca/fr/carriere/musicien/", "https://forces.ca/en/career/musician/"],
  "00167": ["https://forces.ca/fr/carriere/commis-postes/", "https://forces.ca/en/career/postal-clerk/"],
  "00168": ["https://forces.ca/fr/carriere/technicien-gestion-materiel/", "https://forces.ca/en/career/materiel-management-technician/"],
  "00169": ["https://forces.ca/fr/carriere/technicien-de-munitions/", "https://forces.ca/en/career/ammunition-technician/"],
  "00170": ["https://forces.ca/fr/carriere/technicien-mouvements/", "https://forces.ca/en/career/traffic-technician/"],
  "00171": ["https://forces.ca/fr/carriere/conducteur-materiel-mobile-soutien/", "https://forces.ca/en/career/mobile-support-equipment-operator/"],
  "00238": ["https://forces.ca/fr/carriere/technicien-geomatique/", "https://forces.ca/en/career/geomatics-technician/"],
  "00261": ["https://forces.ca/fr/carriere/technicien-systemes-armement/", "https://forces.ca/en/career/air-weapons-systems-technician/"],
  "00299": ["https://forces.ca/fr/carriere/specialiste-communication-navales/", "https://forces.ca/en/career/naval-communicator/"],
  "00301": ["https://forces.ca/fr/carriere/technicien-en-refrigeration-et-mecanique/", "https://forces.ca/en/career/refrigeration-and-mechanical-technician/"],
  "00302": ["https://forces.ca/fr/carriere/technicien-distribution-electrique/", "https://forces.ca/en/career/electrical-distribution-technician/"],
  "00303": ["https://forces.ca/fr/carriere/technicien-des-groupes-electrogenes/", "https://forces.ca/en/career/electrical-generation-systems-technician/"],
  "00304": ["https://forces.ca/fr/carriere/technicien-plomberie-chauffage/", "https://forces.ca/en/career/plumbing-heat-technician/"],
  "00305": ["https://forces.ca/fr/carriere/technicien-eau-produits-petroliers-environnement/", "https://forces.ca/en/career/water-fuels-and-environment-technician/"],
  "00306": ["https://forces.ca/fr/carriere/technicien-construction/", "https://forces.ca/en/career/construction-technician/"],
  "00324": ["https://forces.ca/fr/carriere/operateur-sonar/", "https://forces.ca/en/career/sonar-operator/"],
  "00327": ["https://forces.ca/fr/carriere/technicien-elec-opto/", "https://forces.ca/en/career/electronic-optronic-technician/"],
  "00335": ["https://forces.ca/fr/carriere/technicien-dentaire/", "https://forces.ca/en/career/dental-technician/"],
  "00337": ["https://forces.ca/fr/carriere/operateur-controle-aerospatial/", "https://forces.ca/en/career/aerospace-control-operator/"],
  "00339": ["https://forces.ca/fr/carriere/sapeur-combat/", "https://forces.ca/en/career/combat-engineer/"],
  "00366": ["https://forces.ca/fr/carriere/technicien-genie-armes/", "https://forces.ca/en/career/weapons-engineering-technician/"],
  "00368": ["https://forces.ca/fr/carriere/artilleur/", "https://forces.ca/en/career/gunner/"],
  "00370": ["https://forces.ca/fr/carriere/technicien-dessin-arpentage/", "https://forces.ca/en/career/drafting-and-survey-technician/"],
  "00372": ["https://forces.ca/fr/carriere/technicien-bloc-operatoire/", "https://forces.ca/en/career/operating-room-technician/"],
  "00375": ["https://forces.ca/fr/carriere/administrateur-ressources-humaines/", "https://forces.ca/en/career/human-resources-administrator/"],
  "00376": ["https://forces.ca/fr/carriere/administrateur-services-financiers/", "https://forces.ca/en/career/financial-services-administrator/"],
  "00378": ["https://forces.ca/fr/carriere/cyber-operateur/", "https://forces.ca/en/career/cyber-operator/"],
  "00383": ["https://forces.ca/fr/carriere/operateur-des-transmissions/", "https://forces.ca/en/career/signal-operator/"],
  "00384": ["https://forces.ca/fr/carriere/technicien-des-lignes/", "https://forces.ca/en/career/line-technician/"],
  "00385": ["https://forces.ca/fr/carriere/technicien-des-transmissions/", "https://forces.ca/en/career/signal-technician/"],
  "00386": ["https://forces.ca/fr/carriere/techniciens-de-soutien-des-operations-aeriennes/", "https://forces.ca/en/career/air-operations-support-technician/"],
  "00387": ["https://forces.ca/fr/carriere/technicien-des-systemes-de-largage/", "https://forces.ca/en/career/air-drop-systems-technician/"],
  "00394": ["https://forces.ca/fr/carriere/technicien-en-systemes-information/", "https://forces.ca/en/career/information-systems-technician/"],
  "00406": ["https://forces.ca/fr/carriere/paramedicaux/", "https://forces.ca/en/career/paramedic/"],
  "00407": ["https://forces.ca/fr/carriere/personnel-medical-au-combat/", "https://forces.ca/en/career/combat-medic/"]
};

let content = fs.readFileSync('src/services/jobs-data.ts', 'utf8');

for (const [id, [urlFr, urlEn]] of Object.entries(urls)) {
    const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"abbreviation":\\s*".*?",)`);
    content = content.replace(regex, `$1\n    "urlFr": "${urlFr}",\n    "urlEn": "${urlEn}",`);
}

fs.writeFileSync('src/services/jobs-data.ts', content, 'utf8');
console.log('Done!');
