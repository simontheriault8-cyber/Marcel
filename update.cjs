const fs = require('fs');
let content = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const htmlCheckboxesOld = `              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduFrenchSec4()" (change)="eduFrenchSec4.set(!eduFrenchSec4())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Français (Sec IV / 10e)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduEnglishSec4()" (change)="eduEnglishSec4.set(!eduEnglishSec4())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Anglais (Sec IV / 10e)</span>
              </label>`;

const htmlCheckboxesNew = `              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduFrenchSec4()" (change)="eduFrenchSec4.set(!eduFrenchSec4())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Français (Sec IV / 10e)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduFrenchSec5()" (change)="eduFrenchSec5.set(!eduFrenchSec5())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Français (Sec V / 11e)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduEnglishSec4()" (change)="eduEnglishSec4.set(!eduEnglishSec4())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Anglais (Sec IV / 10e)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" [checked]="eduEnglishSec5()" (change)="eduEnglishSec5.set(!eduEnglishSec5())" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                <span class="text-sm text-slate-700 group-hover:text-indigo-700">Anglais (Sec V / 11e)</span>
              </label>`;

content = content.replace(htmlCheckboxesOld, htmlCheckboxesNew);

const signalsOld = `  eduFrenchSec4 = signal(false);
  eduEnglishSec4 = signal(false);`;

const signalsNew = `  eduFrenchSec4 = signal(false);
  eduFrenchSec5 = signal(false);
  eduEnglishSec4 = signal(false);
  eduEnglishSec5 = signal(false);`;

content = content.replace(signalsOld, signalsNew);

const checkOld = `if (reqLanguageSec4 && !this.eduFrenchSec4() && !this.eduEnglishSec4() && !this.eduSec5() && !hasPostSec) { meetsGeneral = false; missingEducation.push("Langue Sec IV (FR ou ANG) requise"); }`;
const checkNew = `if (reqLanguageSec4 && !this.eduFrenchSec4() && !this.eduEnglishSec4() && !this.eduFrenchSec5() && !this.eduEnglishSec5() && !this.eduSec5() && !hasPostSec) { meetsGeneral = false; missingEducation.push("Langue Sec IV ou V (FR ou ANG) requise"); }`;

content = content.replace(checkOld, checkNew);

// Also update english translation if it exists
const transOld = `eng = eng.replace("Langue Sec IV (FR ou ANG) requise", "Grade 10 Language (FR or ENG) required");`;
const transNew = `eng = eng.replace("Langue Sec IV (FR ou ANG) requise", "Grade 10 Language (FR or ENG) required");
    eng = eng.replace("Langue Sec IV ou V (FR ou ANG) requise", "Grade 10 or 11 Language (FR or ENG) required");`;

content = content.replace(transOld, transNew);

fs.writeFileSync('src/app/components/reorientation.component.ts', content, 'utf8');
console.log('done');
