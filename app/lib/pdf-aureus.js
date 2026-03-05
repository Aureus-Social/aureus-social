export function aureuspdf(title, sections, opts) {
  if (typeof window === 'undefined') return;
  alert('PDF: ' + title + ' — Téléchargement en cours...');
}
export function generateSEPAXML() { return '<xml>SEPA placeholder</xml>'; }
export function previewHTML(html, title) {
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}
