const fs = require('fs');

let content = fs.readFileSync('src/services/recruitment-data.service.ts', 'utf8');

const linkRegexFr = /(instructionFr:\s*")((?:[^"]|\\")*?)(Voici(?: le | un )lien(?:[^"]|\\")*<a href=\\"(?:[^"]|\\")+\\">(?:[^<]|\\<)+<\/a>(?:[^"]|\\")*)",/g;
const linkRegexEn = /(instructionEn:\s*")((?:[^"]|\\")*?)(Here is a link(?:[^"]|\\")*<a href=\\"(?:[^"]|\\")+\\">(?:[^<]|\\<)+<\/a>(?:[^"]|\\")*)",/g;
const imgRegexFr = /(instructionFr:\s*")((?:[^"]|\\")*?)(Voici une image(?:[^"]|\\")*<a href=\\"(?:[^"]|\\")+\\">(?:[^<]|\\<)+<\/a>(?:[^"]|\\")*)",/g;
const imgRegexEn = /(instructionEn:\s*")((?:[^"]|\\")*?)(Here is an image(?:[^"]|\\")*<a href=\\"(?:[^"]|\\")+\\">(?:[^<]|\\<)+<\/a>(?:[^"]|\\")*)",/g;

let count = 0;

content = content.replace(linkRegexFr, (match, prefix, before, link) => {
    count++;
    return prefix + before.trim() + `",\n              linkFr: "${link}",`;
});
content = content.replace(linkRegexEn, (match, prefix, before, link) => {
    count++;
    return prefix + before.trim() + `",\n              linkEn: "${link}",`;
});
content = content.replace(imgRegexFr, (match, prefix, before, link) => {
    count++;
    return prefix + before.trim() + `",\n              linkFr: "${link}",`;
});
content = content.replace(imgRegexEn, (match, prefix, before, link) => {
    count++;
    return prefix + before.trim() + `",\n              linkEn: "${link}",`;
});

console.log('Replaced ' + count + ' links');
fs.writeFileSync('src/services/recruitment-data.service.ts', content);
