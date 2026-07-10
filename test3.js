const generalReminderText = `English message will follow.

Bonjour,

Il vous reste des tâches à compléter sur votre portail de recrutement.

Veuillez noter que nous attendons que vous complétiez ces tâches avant de pouvoir continuer le traitement de votre dossier.

En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.

Rendez-vous sur votre portail pour les compléter : https://www.cafoap-pclfac.forces.gc.ca/

Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.

Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes

______________________________________________________________________________

Hello,

You have pending tasks to complete on your recruiting portal.

Please note that we are waiting for you to complete these tasks before we can continue processing your file.

Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.

Please log in to your portal to complete them: https://www.cafoap-pclfac.forces.gc.ca/

If you do not take any action, your file will be automatically deactivated after 30 days.

Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre | Canadian Armed Forces`;

    let regex = /Cordialement,[\s\S]*?Centre d’assistance \| Forces armées canadiennes/;
    console.log("Fr plain match?", regex.test(generalReminderText));

    let enRegex = /Sincerely,[\s\S]*?Help Centre \| Canadian Armed Forces/;
    console.log("En plain match?", enRegex.test(generalReminderText));
