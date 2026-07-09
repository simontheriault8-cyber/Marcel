import { Injectable } from "@angular/core";

export interface EmailScenario {
  id: string;
  subjectFr: string;
  subjectEn: string;
  bodyHtml: string;
  bodyText: string;
}

@Injectable({
  providedIn: "root",
})
export class EmailScenariosService {
  private scenarios: Map<string, EmailScenario> = new Map();

  constructor() {
    this.initScenarios();
  }

  private initScenarios() {
    // SCENARIO: Parental Consent Required
    // Triggered by: 'naiss_parents' or 'emp_nom_parent'
    const parentalConsentHtml = `
      <div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">
        <p><strong>Subject: Consentement parental pour votre candidature des FAC / Parental Consent for your CAF Application</strong></p>
        <br>
        <p><span style="background-color: yellow;">English message will follow.</span></p>
        <p>Bonjour,</p>
        <p>Nous avons procédé à l'évaluation préliminaire de vos documents de candidature. <strong>Veuillez noter que ce courriel doit être consulté avec votre parent ou tuteur légal.</strong> Afin de compléter votre dossier, nous devons obtenir la confirmation du consentement parental. Sans cette validation, nous ne pouvons légalement traiter votre dossier. Voici les deux options qui s'offrent à vous :</p>
        <ul>
          <li><strong>OPTION 1 :</strong> Veuillez nous faire parvenir une copie de votre certificat de naissance « grand format » (celui incluant le nom des parents) <strong>en pièce jointe, directement en répondant à ce courriel.</strong></li>
          <li style="margin-top: 10px;"><strong>OPTION 2 :</strong> Le parent ou le tuteur signataire doit contacter un centre de recrutement des Forces canadiennes durant les heures d'ouverture. Il doit mentionner qu'il appelle afin de confirmer verbalement son consentement parental pour votre dossier.</li>
        </ul>
        <p>En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.</p>
        <p><strong>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</strong></p>
        <p>Cordialement,</p>
        <p>L’équipe de recrutement des Forces armées canadiennes<br>
        Centre de recrutement des Forces canadiennes Québec<br>
        Commandement du Personnel militaire / Forces armées canadiennes<br>
        <a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a></p>
        
        <br><p>______________________________________________________________________________</p><br>

        <p>Hello,</p>
        <p>We have conducted a preliminary evaluation of your application documents. <strong>Please note that this email must be reviewed with your parent or legal guardian.</strong></p>
        <p>To complete your file, we must obtain confirmation of parental consent. Without this validation, we cannot legally process your file. Here are the two options available to you:</p>
        <ul>
          <li><strong>OPTION 1:</strong> Please provide a copy of your "long-form" birth certificate (the one listing parents' names) as an attachment, by replying directly to this email.</li>
          <li style="margin-top: 10px;"><strong>OPTION 2:</strong> The signing parent or legal guardian must contact a Canadian Forces Recruiting Centre during business hours. They must state that they are calling to verbally confirm their parental consent for your application.</li>
        </ul>
        <p>Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.</p>
        <p><strong>If you do not take any action, your file will be automatically deactivated after 30 days.</strong></p>
        <p>Sincerely,</p>
        <p>The Canadian Armed Forces Recruiting Team<br>
        Canadian Forces Recruiting Centre Quebec<br>
        Military Personnel Command / Canadian Armed Forces<br>
        <a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre | Canadian Armed Forces</a></p>
      </div>
    `;

    const parentalConsentText = `Subject: Consentement parental pour votre candidature des FAC / Parental Consent for your CAF Application

English message will follow.

Bonjour,

Nous avons procédé à l'évaluation préliminaire de vos documents de candidature. Veuillez noter que ce courriel doit être consulté avec votre parent ou tuteur légal. Afin de compléter votre dossier, nous devons obtenir la confirmation du consentement parental. Sans cette validation, nous ne pouvons légalement traiter votre dossier. Voici les deux options qui s'offrent à vous :

• OPTION 1 : Veuillez nous faire parvenir une copie de votre certificat de naissance « grand format » (celui incluant le nom des parents) en pièce jointe, directement en répondant à ce courriel.

• OPTION 2 : Le parent ou le tuteur signataire doit contacter un centre de recrutement des Forces canadiennes durant les heures d'ouverture. Il doit mentionner qu'il appelle afin de confirmer verbalement son consentement parental pour votre dossier.

En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.

Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.

Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes

______________________________________________________________________________

Hello,

We have conducted a preliminary evaluation of your application documents. Please note that this email must be reviewed with your parent or legal guardian.

To complete your file, we must obtain confirmation of parental consent. Without this validation, we cannot legally process your file. Here are the two options available to you:

• OPTION 1: Please provide a copy of your "long-form" birth certificate (the one listing parents' names) as an attachment, by replying directly to this email.

• OPTION 2: The signing parent or legal guardian must contact a Canadian Forces Recruiting Centre during business hours. They must state that they are calling to verbally confirm their parental consent for your application.

Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.

If you do not take any action, your file will be automatically deactivated after 30 days.

Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre | Canadian Armed Forces`;

    this.scenarios.set("parental_consent_required", {
      id: "parental_consent_required",
      subjectFr: "Consentement parental pour votre candidature des FAC",
      subjectEn: "Parental Consent for your CAF Application",
      bodyHtml: parentalConsentHtml,
      bodyText: parentalConsentText,
    });

    // SCENARIO: General Reminder
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

    this.scenarios.set("general_reminder", {
      id: "general_reminder",
      subjectFr: "Action requise - Dossier de recrutement FAC",
      subjectEn: "Action required - CAF Recruiting File",
      bodyHtml: generalReminderHtml,
      bodyText: generalReminderText,
    });

    // SCENARIO: File closed due to basic academic requirements
    const fileClosedAcademicsHtml = `
      <div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">
        <p><span style="background-color: yellow;">English message will follow.</span></p>
        <p>Bonjour,</p>
        <p>L’évaluation des documents que vous avez fournis nous indique que vous n’êtes pas admissible à un enrôlement au sein des Forces armées canadiennes.</p>
        <p>Voici les 3 façons de répondre au critère d’entrée académique minimum :</p>
        <ul>
          <li>24 crédits de secondaire 4 ou 5 (les crédits de formation professionnelle ne sont pas acceptés dans le calcul)</li>
          <li>Diplôme d’étude professionnelles (DEP) complété.</li>
          <li>Attestation d’études de niveau secondaire (AENS)</li>
        </ul>
        <p><em>Remarque : La réussite du Test de développement général (TDG) n’est pas acceptée.</em></p>
        <p>Voici un lien qui pourrait vous être utile : <a href="https://www.challengeu.ca/">ChallengeU - Plateforme en ligne - Formation à distance</a></p>
        <p>Pour les études faites à l’étranger, communiquez avec un des six membres de l'Alliance canadienne des services d'évaluation de diplômes afin d’obtenir le rapport d’étude comparative avant de nous recontacter afin que nous puissions valider vos acquis scolaires.</p>
        <p>Pour obtenir de l’information additionnelle à ce sujet, consultez les liens suivants :</p>
        <ul>
          <li><a href="http://www.cicdi.ca">www.cicdi.ca</a></li>
          <li><a href="https://canalliance.org/">https://canalliance.org/</a></li>
        </ul>
        <p>Pour le moment vous ne répondez pas au critère d’entré académique minimum. Par conséquent, nous devons malheureusement procéder à la fermeture de votre dossier de candidature.</p>
        <p>Si vous répondez à ces critères un jour, vous devez appeler un centre de recrutement pour poursuivre votre demande d’enrôlement.</p>
        <p>Nous vous remercions de votre intérêt envers les Forces armées canadiennes et vous souhaitons du succès dans vos projets futurs.</p>
        <p><strong>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</strong></p>
        <p>Cordialement,</p>
        <p>L’équipe de recrutement des Forces armées canadiennes<br>
        Centre de recrutement des Forces canadiennes Québec<br>
        Commandement du Personnel militaire / Forces armées canadiennes<br>
        <a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a></p>
        
        <br><p>______________________________________________________________________________</p><br>

        <p>Hello,</p>
        <p>The evaluation of the documents you provided indicates that you are not eligible for enrollment in the Canadian Armed Forces.</p>
        <p>Here are the 3 ways to meet the minimum academic entry requirement:</p>
        <ul>
          <li>24 credits of Secondary 4 or 5 (vocational training credits are not accepted in the calculation)</li>
          <li>Completed Diploma of Vocational Studies (DVS)</li>
          <li>Secondary School Equivalency Attestation (TENS)</li>
        </ul>
        <p><em>Note: Successful completion of the General Development Test (GDT) is not accepted.</em></p>
        <p>Here is a link that might be useful: <a href="https://www.challengeu.ca/">ChallengeU - Online Platform - Distance Learning</a></p>
        <p>For studies completed abroad, please contact one of the six members of the Canadian Alliance of Credential Evaluation Services to obtain a comparative evaluation report before contacting us again so we can validate your educational background.</p>
        <p>For additional information on this subject, please consult the following links:</p>
        <ul>
          <li><a href="http://www.cicdi.ca">www.cicdi.ca</a></li>
          <li><a href="https://canalliance.org/">https://canalliance.org/</a></li>
        </ul>
        <p>At the moment you do not meet the minimum academic entry requirement. Therefore, we must unfortunately close your application file.</p>
        <p>If you meet these criteria in the future, you must contact a recruiting centre to pursue your enrollment application.</p>
        <p>We thank you for your interest in the Canadian Armed Forces and wish you success in your future endeavors.</p>
        <p><strong>If you do not take any action, your file will be automatically deactivated after 30 days.</strong></p>
        <p>Sincerely,</p>
        <p>The Canadian Armed Forces Recruiting Team<br>
        Canadian Forces Recruiting Centre Quebec<br>
        Military Personnel Command / Canadian Armed Forces<br>
        <a href="https://forces.ca/en/help-centre/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Help Centre | Canadian Armed Forces</a></p>
      </div>
    `;

    const fileClosedAcademicsText = `English message will follow.

Bonjour,

L’évaluation des documents que vous avez fournis nous indique que vous n’êtes pas admissible à un enrôlement au sein des Forces armées canadiennes.

Voici les 3 façons de répondre au critère d’entrée académique minimum :
- 24 crédits de secondaire 4 ou 5 (les crédits de formation professionnelle ne sont pas acceptés dans le calcul)
- Diplôme d’étude professionnelles (DEP) complété.
- Attestation d’études de niveau secondaire (AENS)

Remarque : La réussite du Test de développement général (TDG) n’est pas acceptée.

Voici un lien qui pourrait vous être utile : ChallengeU - Plateforme en ligne - Formation à distance (https://www.challengeu.ca/)

Pour les études faites à l’étranger, communiquez avec un des six membres de l'Alliance canadienne des services d'évaluation de diplômes afin d’obtenir le rapport d’étude comparative avant de nous recontacter afin que nous puissions valider vos acquis scolaires.

Pour obtenir de l’information additionnelle à ce sujet, consultez les liens suivants :
- www.cicdi.ca
- https://canalliance.org/

Pour le moment vous ne répondez pas au critère d’entré académique minimum. Par conséquent, nous devons malheureusement procéder à la fermeture de votre dossier de candidature.

Si vous répondez à ces critères un jour, vous devez appeler un centre de recrutement pour poursuivre votre demande d’enrôlement.

Nous vous remercions de votre intérêt envers les Forces armées canadiennes et vous souhaitons du succès dans vos projets futurs.

Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.

Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes

______________________________________________________________________________

Hello,

The evaluation of the documents you provided indicates that you are not eligible for enrollment in the Canadian Armed Forces.

Here are the 3 ways to meet the minimum academic entry requirement:
- 24 credits of Secondary 4 or 5 (vocational training credits are not accepted in the calculation)
- Completed Diploma of Vocational Studies (DVS)
- Secondary School Equivalency Attestation (TENS)

Note: Successful completion of the General Development Test (GDT) is not accepted.

Here is a link that might be useful: ChallengeU - Online Platform - Distance Learning (https://www.challengeu.ca/)

For studies completed abroad, please contact one of the six members of the Canadian Alliance of Credential Evaluation Services to obtain a comparative evaluation report before contacting us again so we can validate your educational background.

For additional information on this subject, please consult the following links:
- www.cicdi.ca
- https://canalliance.org/

At the moment you do not meet the minimum academic entry requirement. Therefore, we must unfortunately close your application file.

If you meet these criteria in the future, you must contact a recruiting centre to pursue your enrollment application.

We thank you for your interest in the Canadian Armed Forces and wish you success in your future endeavors.

If you do not take any action, your file will be automatically deactivated after 30 days.

Sincerely,

The Canadian Armed Forces Recruiting Team
Canadian Forces Recruiting Centre Quebec
Military Personnel Command / Canadian Armed Forces
Help Centre | Canadian Armed Forces`;

    this.scenarios.set("educ_non_admissible", {
      id: "educ_non_admissible",
      subjectFr:
        "Mise à jour importante de votre dossier de candidature - Fermeture",
      subjectEn: "Important Update on your Application - File Closure",
      bodyHtml: fileClosedAcademicsHtml,
      bodyText: fileClosedAcademicsText,
    });
  }

  getScenario(id: string): EmailScenario | undefined {
    return this.scenarios.get(id);
  }
}
