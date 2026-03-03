const fs=require('fs');
let c=fs.readFileSync('app/AureusSocialPro.js','utf8');
const expose='\n// ??? EXPOSE FUNCTIONS ON WINDOW FOR CROSS-MODULE ACCESS ???\nif(typeof window!=="undefined"){window.aureusDocHTML=aureusDocHTML;window.aureuspdf=aureuspdf;window.openForPDF=openForPDF;window.generateAttestationEmploi=generateAttestationEmploi;window.generateAttestationSalaire=generateAttestationSalaire;window.generateSoldeCompte=generateSoldeCompte;window.generateC4PDF=generateC4PDF;window.generatePayslipPDF=generatePayslipPDF;window.previewHTML=previewHTML;}\n';
c=c.replace('export default function AureusSocialPro',expose+'export default function AureusSocialPro');
fs.writeFileSync('app/AureusSocialPro.js',c,'utf8');
console.log('OK - window expose direct');
