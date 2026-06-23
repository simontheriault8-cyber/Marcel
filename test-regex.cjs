const text = "Candidat civil 1, 2, 3";
const embeddedRegex = /(^|[^\p{L}\p{N}])(suivants|suivantes|libération|actuel|actuelle|précédent|précédents|précédente|précédentes|années|civil|agréé|accrédité|EDO|Autorisation|Canada|vitae|D\.M\.D\.|professionnelle|Pharmacie|entrée|tertiaires|MÉ|cycle|autorisé|social|restriction|territoriale|M\.S\.S\.|clinique|OAP|Sgt\/M|Sgt|règle|RECL|PSAC|Candidat|candidats|PFOR|PMEP|PFUMR|PFOEP|PIOSR|PNSCO|MÉC|TECH|SUR|SAP|ADJUC|baccalauréat|expérience|diplôme|certificat|programme|professionnel|cours|OFP|GÉNIE|santé|dentaire|ESNEM|Critique|PMED|PFDM|MSÉ)([^\p{L}\p{N}]{1,4}?)((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?=$|[^\p{L}\p{N}])/giu;

let match = embeddedRegex.exec(text);
console.log(match);

let formatted = text.replace(embeddedRegex, (m, prefix, keyword, space, notes) => {
  return prefix + keyword + space + `<sup class="...">` + notes + `</sup>`;
});
console.log("FORMATTED 1: " + formatted);

const endRegex = /\s+((?:[1-9]|1[0-9]|20)(?:,\s*(?:[1-9]|1[0-9]|20))*)(?:\s*:)?$/g;
formatted = formatted.replace(endRegex, (m, notes) => {
  return ` <sup class="...">` + notes + `</sup>`;
});
console.log("FORMATTED 2: " + formatted);
