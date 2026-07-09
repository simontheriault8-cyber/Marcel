const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

// 00099
code = code.replace(/customCheck: \(selected, coursSpecialisesIds\) => \{\s*const hasDESAndLang =[\s\S]*?return hasDESAndLang \|\| hasCoursSpecialises \|\| has1erCycle;\s*\}/,
`customCheck: (selected, coursSpecialisesIds) => {
        const hasDESAndLang =
          selected.has("des_12e_annee") && selected.has("francais_sec5_11e");
        const hasCoursSpecialises = coursSpecialisesIds.some((id) =>
          selected.has(id),
        );
        const has1erCycle =
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"));

        if (hasDESAndLang || hasCoursSpecialises || has1erCycle) return { passed: true };
        return {
          passed: false,
          missingFr: "DES avec Français/Anglais de sec 5 (ou Cours spécialisé / Diplôme universitaire)",
          missingEn: "High School Diploma with Grade 11 English/French (or Specialized Course / University Degree)"
        };
      }`);

// 00100
code = code.replace(/jobs: \["00100"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*const hasDES = selected\.has\("des_12e_annee"\);\s*const hasMath11App = selected\.has\("base_math_11_app"\);\s*const hasChemOrPhys =[\s\S]*?return hasDES && hasMath11App && hasChemOrPhys;\s*\}/,
`jobs: ["00100"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const hasDES = selected.has("des_12e_annee");
        const hasMath11App = selected.has("base_math_11_app");
        const hasChemOrPhys =
          selected.has("chimie_sec5_11e") || selected.has("physique_sec5_11e");
        
        if (hasDES && hasMath11App && hasChemOrPhys) return { passed: true };

        const missingFr = [];
        const missingEn = [];
        if (!hasDES) {
          missingFr.push("DES ou 12e année");
          missingEn.push("High School Diploma or Grade 12");
        }
        if (!hasMath11App) {
          missingFr.push("Mathématiques de sec 5/11e (appliquées)");
          missingEn.push("Grade 11 Math (Applied)");
        }
        if (!hasChemOrPhys) {
          missingFr.push("Chimie ou Physique de sec 5/11e année");
          missingEn.push("Grade 11 Chemistry or Physics");
        }
        return {
          passed: false,
          missingFr: missingFr.join(" et "),
          missingEn: missingEn.join(" and "),
        };
      }`);

// 00120
code = code.replace(/jobs: \["00120"\],\s*allowPR: false,\s*\/\/\s*CC\s*customCheck: \(selected\) => \{\s*const has24PropsAndMath =[\s\S]*?return has24PropsAndMath \|\| has1erCycle;\s*\}/,
`jobs: ["00120"],
      allowPR: false, // CC
      customCheck: (selected) => {
        const has24PropsAndMath =
          selected.has("sec4_24_credits") && selected.has("base_math_10_app");
        const has1erCycle =
          selected.has("univ_1er_cycle_global") ||
          Array.from(selected).some((id) => id.startsWith("bacc_"));
        
        if (has24PropsAndMath || has1erCycle) return { passed: true };

        return {
            passed: false,
            missingFr: "24 crédits de sec 4 avec Mathématiques de sec 4/10e (appliquées) (ou Diplôme universitaire)",
            missingEn: "24 credits of Grade 10 with Grade 10 Math (Applied) (or University Degree)"
        };
      }`);

// 00137
code = code.replace(/jobs: \["00137"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*selected\.has\("des_12e_annee"\) \|\|[\s\S]*?selected\.has\("bacc_arts_communication_visuelle"\)\s*\);\s*\}/,
`jobs: ["00137"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          selected.has("des_12e_annee") ||
          selected.has("cs_photo_multimedia") ||
          selected.has("bacc_arts_communications") ||
          selected.has("bacc_arts_communication_visuelle")
        );
        if (passed) return { passed: true };
        return {
            passed: false,
            missingFr: "DES, Cours de spécialisation en Photographie/Multimédia, ou Bacc en Communications",
            missingEn: "High School Diploma, Specialized Course in Photography/Multimedia, or Bachelor's in Communications"
        };
      }`);

// 00149
code = code.replace(/jobs: \["00149"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*const hasEducation =[\s\S]*?return hasEducation \|\| hasFireTech;\s*\}/,
`jobs: ["00149"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const hasEducation =
          selected.has("des_12e_annee") && selected.has("base_math_10_app");
        const hasFireTech = selected.has("cs_sec_incendie");
        const passed = hasEducation || hasFireTech;
        if (passed) return { passed: true };
        return {
            passed: false,
            missingFr: "DES avec Mathématiques de sec 4/10e (appliquées) (ou Formation en sécurité incendie)",
            missingEn: "High School Diploma with Grade 10 Math (Applied) (or Fire Security Training)"
        };
      }`);

// 00164
code = code.replace(/jobs: \["00164"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \([\s\S]*?selected\.has\("cs_dep_cuisine"\)\s*\);\s*\}/,
`jobs: ["00164"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_gen")) ||
          selected.has("cs_dep_cuisine")
        );
        if (passed) return { passed: true };
        return {
            passed: false,
            missingFr: "24 crédits de sec 4 avec Mathématiques de sec 4/10e (générales) (ou DEP en cuisine)",
            missingEn: "24 credits of Grade 10 with Grade 10 Math (General) (or DEP in cooking)"
        };
      }`);

// 00166
code = code.replace(/jobs: \["00166"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*selected\.has\("des_12e_annee"\) \|\| selected\.has\("cs_etude_musique"\)\s*\);\s*\}/,
`jobs: ["00166"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          selected.has("des_12e_annee") || selected.has("cs_etude_musique")
        );
        if (passed) return { passed: true };
        return {
            passed: false,
            missingFr: "DES ou 12e année (ou Études en musique)",
            missingEn: "High School Diploma or Grade 12 (or Music Studies)"
        };
      }`);

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
