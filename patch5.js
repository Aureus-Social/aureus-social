const fs=require('fs');
let c=fs.readFileSync('app/AureusSocialPro.js','utf8');
c=c.replace(
  "      await loadHtml2Pdf();\n      // Create temp container for html2pdf",
  "      // Try html2pdf with 3s timeout, fallback to print dialog\n      var html2pdfLoaded=false;try{await Promise.race([loadHtml2Pdf(),new Promise(function(_,r){setTimeout(function(){r('timeout')},3000)})]);html2pdfLoaded=true;}catch(e){html2pdfLoaded=false;}\n      if(!html2pdfLoaded){var ifr=overlay.querySelector('iframe');if(ifr&&ifr.contentWindow){btnPDF.textContent='Selectionnez Enregistrer en PDF';ifr.contentWindow.print();setTimeout(function(){btnPDF.textContent='Telecharger PDF';btnPDF.style.opacity='1';btnPDF.disabled=false;},3000);return;}throw new Error('html2pdf unavailable');}\n      // Create temp container for html2pdf"
);
fs.writeFileSync('app/AureusSocialPro.js',c,'utf8');
console.log('OK - PDF fallback print');
