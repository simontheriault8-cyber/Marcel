const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const target = `      // Auto-checking logic
      if (id === "cs_autre_dep") {
        current.add("sec4_24_credits");
      }

      if (id.startsWith("cs_")) {`;

const replacement = `      // Auto-checking logic
      if (id === "cs_autre_dep") {
        current.add("sec4_24_credits");
      }

      if (id === "chimie_sec5_11e" || id === "physique_sec5_11e") {
        current.add("sci_tech4_sci10");
      }

      if (id.startsWith("cs_")) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/components/reorientation.component.ts', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
