const generalReminderHtml = `
      <div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">
        <p><span style="background-color: yellow;">English message will follow.</span></p>
        <p>Bonjour,</p>
        <p>Il vous reste des tâches à compléter sur votre portail de recrutement.</p>
        <p>Veuillez noter que nous attendons que vous complétiez ces tâches avant de pouvoir continuer le traitement de votre dossier.</p>
        <p>En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.</p>
        <p>Rendez-vous sur votre portail pour les compléter : <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>
        <p><strong>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</strong></p>
        <p>Cordialement,</p>
        <p>L’équipe de recrutement des Forces armées canadiennes<br>
        Centre de recrutement des Forces canadiennes Québec<br>
        Commandement du Personnel militaire / Forces armées canadiennes<br>
        <a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a></p>
        
        <br><p>______________________________________________________________________________</p><br>

        <p>Hello,</p>
        <p>You have pending tasks to complete on your recruiting portal.</p>
        <p>Please note that we are waiting for you to complete these tasks before we can continue processing your file.</p>
        <p>Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.</p>
        <p>Please log in to your portal to complete them: <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>
        <p><strong>If you do not take any action, your file will be automatically deactivated after 30 days.</strong></p>
        <p>Sincerely,</p>
        <p>The Canadian Armed Forces Recruiting Team<br>
        Canadian Forces Recruiting Centre Quebec<br>
        Military Personnel Command / Canadian Armed Forces<br>
        <a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre | Canadian Armed Forces</a></p>
      </div>
    `;

    let html = generalReminderHtml;
    
    let regex = /<p>Cordialement,<\/p>[\s\S]*?Forces armées canadiennes<\/a><\/p>/;
    console.log("Fr Match?:", regex.test(html));

    let regex2 = /<p>Cordialement,<\/p>[\s\S]*?Forces armées canadiennes<\/p>/;
    console.log("Fr Match 2?:", regex2.test(html));

    let enRegex = /<p>Sincerely,<\/p>[\s\S]*?Canadian Armed Forces<\/a><\/p>/;
    console.log("En Match?:", enRegex.test(html));

    let enRegex2 = /<p>Sincerely,<\/p>[\s\S]*?Canadian Armed Forces<\/p>/;
    console.log("En Match 2?:", enRegex2.test(html));
