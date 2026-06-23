const fs = require('fs');
let content = fs.readFileSync('src/app/components/reorientation.component.ts', 'utf8');

const noteOld = "Courriel de réo envoyé au postulant, en attente de sa réponse.";
const noteNew = "Courriel de réo envoyé au postulant avec un délai de 30 jours, en attente de sa réponse avant fermeture du dossier.";
content = content.replace(noteOld, noteNew);

const htmlFrOld = "<br>Votre dossier est présentement en attente. Votre candidature sera bloquée tant que nous n'aurons pas reçu de réponse de votre part avec vos nouveaux choix de métiers.<br><br>";
const htmlFrNew = "<br>Votre dossier est présentement en attente. Votre candidature sera bloquée tant que nous n'aurons pas reçu de réponse de votre part avec vos nouveaux choix de métiers. Veuillez noter que si nous ne recevons pas de réponse de votre part dans un délai de 30 jours, votre dossier sera fermé.<br><br>";
content = content.replace(htmlFrOld, htmlFrNew);

const txtFrOld = "\\nVotre dossier est présentement en attente. Votre candidature sera bloquée tant que nous n'aurons pas reçu de réponse de votre part avec vos nouveaux choix de métiers.\\n\\n";
const txtFrNew = "\\nVotre dossier est présentement en attente. Votre candidature sera bloquée tant que nous n'aurons pas reçu de réponse de votre part avec vos nouveaux choix de métiers. Veuillez noter que si nous ne recevons pas de réponse de votre part dans un délai de 30 jours, votre dossier sera fermé.\\n\\n";
content = content.replace(txtFrOld, txtFrNew);

const htmlEnOld = "<br>Your application is currently on hold. Your file will remain blocked until we receive a response from you regarding your new trade choices.<br><br>";
const htmlEnNew = "<br>Your application is currently on hold. Your file will remain blocked until we receive a response from you regarding your new trade choices. Please note that if we do not receive a response from you within 30 days, your file will be closed.<br><br>";
content = content.replace(htmlEnOld, htmlEnNew);

const txtEnOld = "\\nYour application is currently on hold. Your file will remain blocked until we receive a response from you regarding your new trade choices.\\n\\n";
const txtEnNew = "\\nYour application is currently on hold. Your file will remain blocked until we receive a response from you regarding your new trade choices. Please note that if we do not receive a response from you within 30 days, your file will be closed.\\n\\n";
content = content.replace(txtEnOld, txtEnNew);

fs.writeFileSync('src/app/components/reorientation.component.ts', content, 'utf8');
console.log('updated');
