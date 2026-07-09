const fs = require('fs');
let code = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

// 00301
code = code.replace(/jobs: \["00301"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("sec4_24_credits"\) &&\s*selected\.has\("base_math_10_app"\)\) \|\|\s*selected\.has\("cs_dep_refrigeration"\)\s*\);\s*\}/,
`jobs: ["00301"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_refrigeration")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou DEP en réfrigération)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or DEP in refrigeration)" };
      }`);

// 00302
code = code.replace(/jobs: \["00302"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*const option1 =[\s\S]*?return option1 \|\| option2 \|\| option3;\s*\}/,
`jobs: ["00302"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const option1 =
          selected.has("sec4_24_credits") && selected.has("base_math_10_app");
        const option2 = selected.has("cs_dep_electricite");
        const option3 =
          selected.has("des_12e_annee") &&
          selected.has("base_math_11_adv") &&
          selected.has("physique_sec5_11e");
        const passed = option1 || option2 || option3;
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou DEP en électricité, ou DES avec Math avancées de sec 5/11e et Physique de sec 5/11e)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or DEP in electricity, or High School Diploma with Grade 11 Advanced Math and Grade 11 Physics)" };
      }`);

// 00303
code = code.replace(/jobs: \["00303"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("sec4_24_credits"\) &&\s*selected\.has\("base_math_10_app"\)\) \|\|\s*selected\.has\("cs_dep_electricite"\)\s*\);\s*\}/,
`jobs: ["00303"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_electricite")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou DEP en électricité)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or DEP in electricity)" };
      }`);

// 00304
code = code.replace(/jobs: \["00304"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("sec4_24_credits"\) &&\s*selected\.has\("base_math_10_app"\)\) \|\|\s*selected\.has\("cs_dep_plomberie_chauffage"\)\s*\);\s*\}/,
`jobs: ["00304"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_plomberie_chauffage")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou DEP en plomberie et chauffage)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or DEP in plumbing and heating)" };
      }`);

// 00305
code = code.replace(/jobs: \["00305"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("sec4_24_credits"\) &&\s*selected\.has\("base_math_10_app"\)\) \|\|\s*selected\.has\("cs_aec_eaux"\)\s*\);\s*\}/,
`jobs: ["00305"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_aec_eaux")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou AEC en traitement des eaux)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or AEC in water treatment)" };
      }`);

// 00306
code = code.replace(/jobs: \["00306"\],\s*allowPR: true,\s*\/\/\s*RP\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("sec4_24_credits"\) &&\s*selected\.has\("base_math_10_app"\)\) \|\|\s*selected\.has\("cs_dep_charpenterie"\)\s*\);\s*\}/,
`jobs: ["00306"],
      allowPR: true, // RP
      customCheck: (selected) => {
        const passed = (
          (selected.has("sec4_24_credits") &&
            selected.has("base_math_10_app")) ||
          selected.has("cs_dep_charpenterie")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "24 crédits de sec 4 avec Math appliquées de sec 4/10e (ou DEP en charpenterie)", missingEn: "24 credits of Grade 10 with Applied Math Grade 10 (or DEP in carpentry)" };
      }`);

// 00370
code = code.replace(/jobs: \["00370"\],\s*allowPR: true,\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("des_12e_annee"\) && selected\.has\("base_math_11_app"\)\) \|\|\s*selected\.has\("cs_dep_arpentage_topo"\)\s*\);\s*\}/,
`jobs: ["00370"],
      allowPR: true,
      customCheck: (selected) => {
        const passed = (
          (selected.has("des_12e_annee") && selected.has("base_math_11_app")) ||
          selected.has("cs_dep_arpentage_topo")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "DES avec Math appliquées de sec 5/11e (ou DEP en arpentage et topographie)", missingEn: "High School Diploma with Applied Math Grade 11 (or DEP in surveying and topography)" };
      }`);

// 00378
code = code.replace(/jobs: \["00378"\],\s*allowPR: true,\s*customCheck: \(selected\) => \{\s*return \(\s*\(selected\.has\("des_12e_annee"\) && selected\.has\("base_math_11_adv"\)\) \|\|\s*\(selected\.has\("des_12e_annee"\) && selected\.has\("info_sec5_12e"\)\) \|\|\s*selected\.has\("cs_dip_cyber"\)\s*\);\s*\}/,
`jobs: ["00378"],
      allowPR: true,
      customCheck: (selected) => {
        const passed = (
          (selected.has("des_12e_annee") && selected.has("base_math_11_adv")) ||
          (selected.has("des_12e_annee") && selected.has("info_sec5_12e")) ||
          selected.has("cs_dip_cyber")
        );
        if (passed) return { passed: true };
        return { passed: false, missingFr: "DES avec Math avancées de sec 5/11e ou Informatique de sec 5/12e (ou Diplôme en cybersécurité)", missingEn: "High School Diploma with Advanced Math Grade 11 or Grade 12 Computer Science (or Diploma in cybersecurity)" };
      }`);

fs.writeFileSync('src/app/components/reorientation.component.ts', code);
