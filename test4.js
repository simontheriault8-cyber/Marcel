const generalReminderHtml = `
        <p>Cordialement,</p>
        <p>L’équipe de recrutement des Forces armées canadiennes<br>
        Centre de recrutement des Forces canadiennes Québec<br>
        Commandement du Personnel militaire / Forces armées canadiennes<br>
        <a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance | Forces armées canadiennes</a></p>
`;
const regexFr = new RegExp("<p>Cordialement,<\\\\/p>[\\\\s\\\\S]*?Forces armées canadiennes(?:<\\\\/a>)?<\\\\/p>");
console.log("HTML match:", regexFr.test(generalReminderHtml));

const generalReminderText = `
Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes
`;
const regexFrText = new RegExp("Cordialement,[\\\\s\\\\S]*?Centre d’assistance \\\\| Forces armées canadiennes");
console.log("Text match:", regexFrText.test(generalReminderText));
