let sig = `Cordialement,

L’équipe de recrutement des Forces armées canadiennes
Centre de recrutement des Forces canadiennes Québec
Commandement du Personnel militaire / Forces armées canadiennes
Centre d’assistance | Forces armées canadiennes`;

let html = sig.replace(/\n/g, "<br>");
html = html.replace(
      "Centre d’assistance | Forces armées canadiennes",
      `<a href="https://forces.ca/fr/centre-dassistance/#/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Centre d’assistance</a> | <a href="https://forces.ca/fr/" target="_blank" class="text-blue-600 hover:underline" style="color: #2563eb; text-decoration: underline;">Forces armées canadiennes</a>`
);
console.log(html);
