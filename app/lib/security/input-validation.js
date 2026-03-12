// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Validation & Sanitisation des inputs
// OWASP A03:2021 Injection · XSS · RGPD
// ═══════════════════════════════════════════════════════════════

// ── Sanitisation HTML (anti-XSS) ────────────────────────────
export function sanitizeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

// ── Supprimer les caractères dangereux (SQL, shell) ──────────
export function sanitizeInput(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[;\-\-]/g, '') // SQL injection basique
    .replace(/['"`]/g, '')   // quotes
    .replace(/[<>]/g, '')    // HTML tags
    .trim()
    .slice(0, 2000);         // longueur max
}

// ── Validateurs métier belges ────────────────────────────────
export const validate = {

  // NISS belge : YY.MM.DD-XXX.CC
  niss(v) {
    if (!v) return { ok: false, msg: 'NISS requis' };
    const digits = String(v).replace(/[.\-\s]/g, '');
    if (!/^\d{11}$/.test(digits)) return { ok: false, msg: 'NISS : 11 chiffres requis' };
    // Contrôle mod97
    const num = parseInt(digits.slice(0, 9));
    const check = parseInt(digits.slice(9, 11));
    // Avant 2000 : mod(97 - num % 97) ; après 2000 : mod(97 - (2000000000 + num) % 97)
    const mod = 97 - (num % 97);
    const mod2000 = 97 - ((2000000000 + num) % 97);
    if (check !== mod && check !== mod2000) return { ok: false, msg: 'NISS : clé de contrôle invalide' };
    return { ok: true };
  },

  // IBAN belge : BE + 14 chiffres
  iban(v) {
    if (!v) return { ok: false, msg: 'IBAN requis' };
    const s = String(v).replace(/\s/g, '').toUpperCase();
    if (!s.startsWith('BE')) return { ok: false, msg: 'IBAN belge requis (BE...)' };
    if (s.length !== 16) return { ok: false, msg: 'IBAN belge : 16 caractères (BE + 14 chiffres)' };
    if (!/^BE\d{14}$/.test(s)) return { ok: false, msg: 'IBAN : format invalide' };
    // Mod97 IBAN
    const rearranged = s.slice(4) + s.slice(0, 4);
    const numeric = [...rearranged].map(c => isNaN(c) ? (c.charCodeAt(0) - 55).toString() : c).join('');
    let remainder = 0;
    for (const ch of numeric) remainder = (remainder * 10 + parseInt(ch)) % 97;
    if (remainder !== 1) return { ok: false, msg: 'IBAN : checksum invalide' };
    return { ok: true };
  },

  // BCE belge : BE + 10 chiffres
  bce(v) {
    if (!v) return { ok: false, msg: 'BCE requis' };
    const s = String(v).replace(/[\s.]/g, '').toUpperCase();
    if (!s.startsWith('BE')) return { ok: false, msg: 'BCE belge requis (BE...)' };
    const digits = s.slice(2).replace(/\D/g, '');
    if (digits.length !== 10) return { ok: false, msg: 'BCE : 10 chiffres requis' };
    return { ok: true };
  },

  // Email
  email(v) {
    if (!v) return { ok: false, msg: 'Email requis' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(String(v))) return { ok: false, msg: 'Email invalide' };
    if (String(v).length > 254) return { ok: false, msg: 'Email trop long' };
    return { ok: true };
  },

  // Salaire : nombre positif raisonnable
  salary(v) {
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) return { ok: false, msg: 'Salaire invalide' };
    if (n < 1994.21) return { ok: false, msg: `Salaire < RMMMG 2026 (1.994,21 EUR)`, warning: true };
    if (n > 100000) return { ok: false, msg: 'Salaire > 100.000 EUR : vérifier' };
    return { ok: true };
  },

  // Date belge JJ/MM/AAAA ou AAAA-MM-JJ
  date(v) {
    if (!v) return { ok: false, msg: 'Date requise' };
    const d = new Date(v);
    if (isNaN(d.getTime())) return { ok: false, msg: 'Date invalide' };
    if (d.getFullYear() < 1900 || d.getFullYear() > 2100) return { ok: false, msg: 'Date hors plage' };
    return { ok: true };
  },

  // Texte libre — longueur + injection
  text(v, maxLen = 500) {
    if (!v) return { ok: true }; // optionnel
    const s = String(v);
    if (s.length > maxLen) return { ok: false, msg: `Texte trop long (max ${maxLen} caractères)` };
    if (/<script/i.test(s) || /javascript:/i.test(s) || /on\w+=/i.test(s))
      return { ok: false, msg: 'Contenu non autorisé détecté' };
    return { ok: true };
  },
};

// ── Validation d'un objet employé complet ───────────────────
export function validateEmployee(emp) {
  const errors = {};
  const nissR = validate.niss(emp.niss);
  if (!nissR.ok) errors.niss = nissR.msg;
  if (emp.iban) { const ibanR = validate.iban(emp.iban); if (!ibanR.ok) errors.iban = ibanR.msg; }
  if (emp.email) { const emailR = validate.email(emp.email); if (!emailR.ok) errors.email = emailR.msg; }
  if (emp.monthlySalary || emp.gross) {
    const salR = validate.salary(emp.monthlySalary || emp.gross);
    if (!salR.ok && !salR.warning) errors.salary = salR.msg;
  }
  if (emp.startDate) { const dR = validate.date(emp.startDate); if (!dR.ok) errors.startDate = dR.msg; }
  const textFields = ['first', 'last', 'function', 'address'];
  for (const f of textFields) {
    if (emp[f]) { const tR = validate.text(emp[f]); if (!tR.ok) errors[f] = tR.msg; }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

// ── Validation API route (server-side) ──────────────────────
export function validateApiBody(body, schema) {
  // schema : { field: { required, type, maxLen, validator } }
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const val = body[field];
    if (rules.required && (val === undefined || val === null || val === ''))
      { errors[field] = `${field} requis`; continue; }
    if (val === undefined || val === null || val === '') continue;
    if (rules.type === 'string' && typeof val !== 'string') errors[field] = `${field} doit être une chaîne`;
    if (rules.type === 'number' && typeof val !== 'number') errors[field] = `${field} doit être un nombre`;
    if (rules.maxLen && String(val).length > rules.maxLen) errors[field] = `${field} trop long`;
    if (rules.validator) { const r = rules.validator(val); if (!r.ok) errors[field] = r.msg; }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}
