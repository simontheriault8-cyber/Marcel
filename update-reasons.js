const fs = require('fs');

let content = fs.readFileSync('src/services/recruitment-data.service.ts', 'utf8');

// Fix floue -> flou
content = content.replace(/Le document est floue et illisible\. Veuillez prendre une nouvelle photo et la téléverser à nouveau\. Assurez vous que l’image est nette, sans reflet et que toutes les informations sont clairement visibles\./g, "Le document est flou et illisible. Veuillez prendre une nouvelle photo dans un endroit bien éclairé et la téléverser à nouveau. Assurez-vous que l'ensemble du document est bien cadré, que l'image est nette, sans reflet et que toutes les informations sont clairement lisibles.");

// Fix naiss_photocopie grammar
content = content.replace(/La photocopie du certificat de naissance le rend non valide\. Vous devez prendre une photo de votre documents et téléversé cette photo sur votre portail en ligne\. Assurez vous que l’image est nette, sans reflet et que toutes les informations sont clairement visibles\./g, "La photocopie de votre certificat de naissance n'est pas acceptée (un document original est exigé). Vous devez prendre une photo de votre document original et téléverser cette photo sur votre portail en ligne. Assurez-vous que l'image est nette et sans reflet.");

// Fix selfie_mauvaise
content = content.replace(/La pièce d'identité tenue ne correspond pas à celle soumise au dossier\. Veuillez téléverser une nouvelle photo de vous et de la pièce d’identité soumise au dossier\./g, "La pièce d'identité que vous tenez dans vos mains sur la photo ne correspond pas à celle que vous avez téléversée au dossier. Si vous avez soumis un permis de conduire, vous devez tenir ce même permis de conduire sur votre égoportrait (selfie). Veuillez téléverser une nouvelle photo correspondante.");

// Fix relev_ecole
content = content.replace(/Le bulletin scolaire n'est pas accepté; veuillez fournir le relevé de notes officiel du Ministère\./g, "Un simple bulletin scolaire émis par votre école n'est pas accepté comme preuve de scolarité. Vous devez nous fournir le relevé d'apprentissage officiel émis par le Ministère de l'Éducation (avec le sceau ou le format officiel du Ministère).");

// Fix eval_etrang
content = content.replace(/Le relevé de notes étranger n’est pas accepté et vous devez fournir une évaluation comparative officielle\. Pour vous aider à trouver des ressources pour cette étape, veuillez consulter le site suivant : https:\/\/canalliance\.org\/fr\//g, "Un relevé de notes provenant de l'extérieur du Canada nécessite une évaluation de ses équivalences. Un relevé étranger seul n’est pas accepté, vous devez fournir une évaluation comparative officielle. Pour trouver des ressources, consultez : https://canalliance.org/fr/");

// Fix id_invalide_rp
content = content.replace(/La carte de résident permanent n'est pas acceptée comme pièce d'identité pour cette étape\. Veuillez téléverser une pièce d’identité avec photo émise par un gouvernement provincial ou fédéral \(ex: permis de conduire, carte d'assurance maladie, passeport\)\./g, "La carte de résident permanent prouve votre statut, mais n'est pas acceptée comme pièce d'identité principale avec photo pour cette étape spécifique. Veuillez téléverser une autre pièce d’identité avec photo émise par un gouvernement provincial ou fédéral (ex: permis de conduire, carte d'assurance maladie provinciale, passeport canadien ou étranger).");

fs.writeFileSync('src/services/recruitment-data.service.ts', content);
console.log("File updated");
