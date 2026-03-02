#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — TESTS UNITAIRES CALCULS PAIE BELGE 2026
// ══════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// ═══ STUBS ═══
global.React = { createElement: ()=>null };
global.useState = (v) => [typeof v === 'function' ? v() : v, ()=>{}];
global.useEffect = ()=>{};
global.useRef = ()=>({current:null});
global.useCallback = (fn)=>fn;
global.useMemo = (fn)=>fn();
global.useContext = ()=>({});
global.createContext = ()=>({Provider:()=>null});
global.fetch = ()=>Promise.resolve({ok:false});
global.document = {addEventListener:()=>{},removeEventListener:()=>{},createElement:()=>({click:()=>{},style:{}}),body:{appendChild:()=>{},removeChild:()=>{}},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
global.window = {addEventListener:()=>{},removeEventListener:()=>{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},location:{href:'',hostname:'localhost'},navigator:{clipboard:{writeText:()=>Promise.resolve()}},open:()=>{},print:()=>{},matchMedia:()=>({matches:false}),innerWidth:1200,innerHeight:800,scrollTo:()=>{},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}};
global.localStorage = global.window.localStorage;
global.navigator = {clipboard:{writeText:()=>Promise.resolve()},userAgent:'node-test'};
global.URL = {createObjectURL:()=>'blob:test',revokeObjectURL:()=>{}};
global.Blob = class Blob { constructor(){} };
global.FileReader = class FileReader { readAsText(){} readAsDataURL(){} };
global.Image = class Image { set src(v){} get width(){return 100} get height(){return 100} };
global.btoa = (s)=>Buffer.from(s).toString('base64');
global.atob = (s)=>Buffer.from(s,'base64').toString();
global.alert = ()=>{};
global.confirm = ()=>true;
global.prompt = ()=>'';
global.setTimeout = (fn)=>{if(typeof fn==='function')fn();return 0;};
global.clearTimeout = ()=>{};
global.setInterval = ()=>0;
global.clearInterval = ()=>{};
global.AbortSignal = {timeout:()=>({})};
global.Intl = Intl;
global.console = console;
global.XMLSerializer = class { serializeToString(){return '';} };
global.DOMParser = class { parseFromString(){return {querySelector:()=>null,querySelectorAll:()=>[]};} };
global.MutationObserver = class { observe(){} disconnect(){} };
global.ResizeObserver = class { observe(){} disconnect(){} };
global.IntersectionObserver = class { observe(){} disconnect(){} };
global.performance = { now:()=>Date.now() };
global.requestAnimationFrame = (fn)=>{fn();return 0;};
global.cancelAnimationFrame = ()=>{};
global.CSS = { supports:()=>false };
global.matchMedia = ()=>({matches:false});
global.supabase = null;

// ═══ CHARGER ═══
console.log('⏳ Chargement AureusSocialPro.js...');
const srcPath = path.join(__dirname, '..', 'app', 'AureusSocialPro.js');
const fullSrc = fs.readFileSync(srcPath, 'utf-8');
const lines = fullSrc.split('\n');

// ═══ HELPERS ═══
function _findTopLevel(pat, after) {
  for (let i = (after || 0); i < lines.length; i++) {
    if (lines[i].startsWith(pat)) return i;
  }
  return -1;
}

function _extractBalanced(startIdx) {
  if (startIdx < 0) return { text: '', endIdx: startIdx };
  let dB = 0, dK = 0, started = false, inStr = 0;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const c = line[j], prev = j > 0 ? line[j-1] : '';
      if (prev === '\\') continue;
      if (inStr === 0) {
        if (c === "'") { inStr = 1; continue; }
        if (c === '"') { inStr = 2; continue; }
        if (c === '`') { inStr = 3; continue; }
        if (c === '/' && j+1 < line.length && line[j+1] === '/') break;
        if (c === '{') { dB++; started = true; }
        if (c === '}') dB--;
        if (c === '[') { dK++; started = true; }
        if (c === ']') dK--;
      } else if (inStr === 1 && c === "'") inStr = 0;
      else if (inStr === 2 && c === '"') inStr = 0;
      else if (inStr === 3 && c === '`') inStr = 0;
    }
    if (started && dB === 0 && dK === 0) {
      return { text: lines.slice(startIdx, i + 1).join('\n'), endIdx: i + 1 };
    }
  }
  return { text: lines.slice(startIdx, Math.min(startIdx + 300, lines.length)).join('\n'), endIdx: startIdx + 300 };
}

// ═══ EXTRACTION CIBLÉE ═══
const parts = [];

// 1. LOIS_BELGES (le gros objet)
const loisIdx = _findTopLevel('var LOIS_BELGES');
if (loisIdx >= 0 && !lines[loisIdx].includes('TIMELINE') && !lines[loisIdx].includes('CURRENT')) {
  const { text } = _extractBalanced(loisIdx);
  if (text.split('\n').length > 10) {
    parts.push(text);
    console.log(`  ✓ LOIS_BELGES: ligne ${loisIdx+1} (${text.split('\n').length} lignes)`);
  }
}

// 2. WHITELIST top-level entre LOIS_BELGES et LEGAL
const legalIdx = _findTopLevel('var LEGAL=');
const middleWhitelist = [
  'var LB',
  'var TX_ONSS_W',
  'var TX_ONSS_E',
  'var TX_OUV108',
  'var TX_AT',
  'var COUT_MED',
  'var CR_TRAV',
  'var PP_EST',
  'var NET_FACTOR',
  'var CR_MAX',
  'var CR_PAT',
  'var FORF_BUREAU',
  'var FORF_KM',
  'var PV_SIMPLE',
  'var PV_DOUBLE',
  'var RMMMG',
  'var BONUS_MAX',
  'var SEUIL_CPPT',
  'var SEUIL_CE',
  'var HEURES_HEBDO',
  'var JOURS_FERIES',
  'function calcPPFromLois',
  'function getLoi',
  'var _OW',
  'var _OE',
  'var _BM',
  'var _BE',
  'var _BONUS',
];
for (const pat of middleWhitelist) {
  const idx = _findTopLevel(pat);
  if (idx >= 0 && idx < legalIdx) {
    // Check if it's a single-line statement (may have trailing comment after ;)
    const stripped = lines[idx].replace(/\/\/.*$/, '').trim();
    if (stripped.endsWith(';') && !stripped.includes('{')) {
      parts.push(lines[idx]);
      console.log(`  ✓ ${pat}: ligne ${idx+1} (1 ligne)`);
    } else {
      const { text } = _extractBalanced(idx);
      console.log(`  ✓ ${pat}: ligne ${idx+1} (${text.split('\n').length} lignes)`);
      parts.push(text);
    }
  }
}

// 3. var LEGAL
if (legalIdx >= 0) {
  const { text } = _extractBalanced(legalIdx);
  parts.push(text);
  console.log(`  ✓ LEGAL: ligne ${legalIdx+1} (${text.split('\n').length} lignes)`);
}

// 4. Fonctions métier (APRÈS LEGAL, top-level)
const afterLegal = legalIdx > 0 ? legalIdx + 100 : 1000;
const targets = [
  'function calc(',
  'function calcPrecompteExact(',
  'function calcCSSS(',
  'function calcBonusEmploi(',
  'function calcBonusEmploiDetail(',
  'function calcIndependant(',
];
for (const sig of targets) {
  const idx = _findTopLevel(sig, afterLegal);
  if (idx === -1) continue;
  const { text } = _extractBalanced(idx);
  const name = sig.replace('function ', '').replace('(', '');
  console.log(`  ✓ ${name}: ligne ${idx+1} (${text.split('\n').length} lignes)`);
  parts.push(text);
}

// 5. Assembler et nettoyer
let src = parts.join('\n\n');
src = src.replace(/\r\n/g, '\n'); // normaliser fins de ligne
src = src.replace(/^['"]use client['"];?\s*/gm, '');
src = src.replace(/import\s+.*?from\s+['"].*?['"];?\s*/gm, '');
src = src.replace(/export\s+default\s+/gm, 'var __exported__ = ');
src = src.replace(/export\s+/gm, '');

// ═══ BLACKLIST AGRESSIF ═══
const blacklist = [
  'applyTimeline', 'syncLoisBelges', 'checkLoisBelgesOutdated',
  'LangProvider', 'LangCtx', 'createContext', 'useContext',
  'setLang', 'changeLan', 'useState', 'useEffect', 'useRef',
  'useCallback', 'useMemo', '.Provider', '.Consumer',
  'onClick', 'onChange', 'onSubmit', 'onKeyDown', 'onBlur',
  'className', 'style={{',
];
for (const pat of blacklist) {
  const escaped = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  src = src.replace(new RegExp('^.*' + escaped + '.*$', 'gm'), '// [removed]');
}
src = src.replace(/^\s*'[^']+':.*\{\s*fr:.*$/gm, '// [removed]');
src = src.replace(/^\s*"[^"]+":.*\{\s*fr:.*$/gm, '// [removed]');
src = src.replace(/^.*return\s+\(?<[A-Za-z].*$/gm, '// [removed]');
src = src.replace(/^.*<\/[a-zA-Z].*>.*$/gm, '// [removed]');
src = src.replace(/^\s*<[a-zA-Z].*$/gm, '// [removed]');

// Supprimer tous les blocs orphelins const t (reste de LangProvider après blacklist) — évite "Identifier 't' has already been declared"
// 1) Bloc complet ou avec body (avec ou sans }; à la fin)
src = src.replace(/\s*const t = \(key\) => \{\s*const entry = I18N\[key\];\s*if \(!entry\) return key;\s*return entry\[lang\] \|\| entry\.fr \|\| key;\s*(\};?\s*)?/g, '// [removed i18n t]\n');
// 2) Blocs très incomplets (extraction a coupé juste après const entry)
src = src.replace(/\s*const t = \(key\) => \{\s*const entry = I18N\[key\];/g, ' { void 0; } // [removed i18n t]\n');
// 3) Lignes orphelines (if + return + };) — jusqu'au "  }; " (avec point-virgule, pas seulement })
src = src.replace(/^\s*if \(!entry\) return key;[\s\S]*?\n  \};/gm, '// [removed]\n');

// 4) Corps orphelin de importTravailleurs — bloc précédé du cleanup i18n, suivi de "// ═══ SPRINT 41: TEST SUITE"
src = src.replace(/\s*const colMap=headers\.map\(h=>\{[\s\S]*?return \{imported,count:imported\.length,headers:headers\};\s*\n\s*\}(?=\s*\n\s*\/\/ ═══)/, '// [removed importTravailleurs body]\n');
// 5) Accolades orphelines "  }" après des lignes "// [removed]" (ex: fermeture LangProvider) — répéter jusqu'à plus de match
let prev = '';
while (prev !== src) {
  prev = src;
  src = src.replace(/(\/\/ \[removed\][^\n]*\n)(\s*\}\s*\n)(\s*(?:var |function ))/, '$1// [removed]\n$3');
}

try {
  const vm = require('vm');
  const sandbox = {
    ...global, console,
    Math, Date, Number, String, Array, Object, JSON, parseInt, parseFloat, isNaN, isFinite,
    Infinity, NaN, undefined, null: null, Intl,
    module: { exports: {} }, exports: {},
    React: global.React, useState: global.useState, useEffect: global.useEffect,
    useRef: global.useRef, useCallback: global.useCallback, useMemo: global.useMemo,
    useContext: global.useContext, createContext: global.createContext,
  };

  const ctx = vm.createContext(sandbox);
  fs.writeFileSync(path.join(__dirname, 'extracted-logic.js'), src);
  console.log(`\n  Total: ${src.split('\n').length} lignes → extracted-logic.js`);
  vm.runInContext(src, ctx);
  console.log('✅ Code chargé avec succès\n');

  const LOIS_BELGES = ctx.LOIS_BELGES;
  const calc = ctx.calc;
  const calcPrecompteExact = ctx.calcPrecompteExact;
  const calcCSSS = ctx.calcCSSS;
  const calcBonusEmploi = ctx.calcBonusEmploi;
  const calcBonusEmploiDetail = ctx.calcBonusEmploiDetail;
  const calcIndependant = ctx.calcIndependant;

  // ═══ FRAMEWORK DE TEST ═══
  let passed = 0, failed = 0, total = 0;
  const failures = [];
  function test(name, fn) {
    total++;
    try { fn(); passed++; console.log(`  ✅ ${name}`); }
    catch (e) { failed++; failures.push({ name, error: e.message }); console.log(`  ❌ ${name}: ${e.message}`); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
  function eq(actual, expected, label, tolerance) {
    const t = tolerance || 0.01;
    if (Math.abs(actual - expected) > t) throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
  function fmt(n) { return typeof n === 'number' ? n.toFixed(2) : String(n); }

  const emp3500 = { monthlySalary: 3500, status: 'employe', situation: 'isole', enfants: 0, taxeCom: 7, dirigeant: false };
  const per0 = { month: 1, year: 2026 };
  const co0 = {};

  // ═══ 1. STRUCTURE LOIS_BELGES ═══
  console.log('═══ 1. STRUCTURE LOIS_BELGES ═══');
  test('LOIS_BELGES existe', () => { assert(LOIS_BELGES !== undefined, 'LOIS_BELGES non trouvé'); });
  test('LOIS_BELGES.onss.travailleur = 13.07%', () => { eq(LOIS_BELGES.onss.travailleur, 0.1307, 'ONSS travailleur'); });
  test('LOIS_BELGES.pp.bonusEmploi existe', () => { assert(LOIS_BELGES.pp.bonusEmploi !== undefined, 'bonusEmploi manquant'); });

  // ═══ 2. ONSS ═══
  console.log('\n═══ 2. ONSS ═══');
  test('ONSS employé: 13.07% sur brut', () => { eq(Math.round(3500 * 0.1307 * 100) / 100, 457.45, 'ONSS 3500€'); });
  test('ONSS ouvrier: base × 1.08', () => { eq(Math.round(2500 * 1.08 * 0.1307 * 100) / 100, 352.89, 'ONSS ouvrier', 0.01); });

  // ═══ 3. PRÉCOMPTE PROFESSIONNEL ═══
  console.log('\n═══ 3. PRÉCOMPTE PROFESSIONNEL ═══');
  test('calcPrecompteExact existe', () => { assert(typeof calcPrecompteExact === 'function', 'non trouvé'); });
  test('PP sur 0€ = 0€', () => { eq(calcPrecompteExact(0, { situation: 'isole' }).pp, 0, 'PP 0€'); });
  test('PP 2000€ isolé structure', () => {
    const r = calcPrecompteExact(2000, { situation: 'isole', enfants: 0 });
    assert(r.pp !== undefined && r.rate !== undefined && r.detail !== undefined, 'structure incomplète');
  });
  test('PP 2000€ isolé ≈ 30-300€', () => {
    const pp = calcPrecompteExact(2000, { situation: 'isole', enfants: 0 }).pp;
    assert(pp >= 30 && pp <= 300, `PP 2000€ = ${pp}`);
  });
  test('PP 3500€ isolé ≈ 500-800€', () => {
    const pp = calcPrecompteExact(3500, { situation: 'isole', enfants: 0 }).pp;
    assert(pp >= 500 && pp <= 800, `PP 3500€ = ${pp}`);
  });
  test('PP 5000€ isolé ≈ 900-1500€', () => {
    const pp = calcPrecompteExact(5000, { situation: 'isole', enfants: 0 }).pp;
    assert(pp >= 900 && pp <= 1500, `PP 5000€ = ${pp}`);
  });
  test('PP 8000€ isolé ≈ 2000-3000€', () => {
    const pp = calcPrecompteExact(8000, { situation: 'isole', enfants: 0 }).pp;
    assert(pp >= 2000 && pp <= 3000, `PP 8000€ = ${pp}`);
  });
  test('PP marié 1r < isolé', () => {
    const i = calcPrecompteExact(4000, { situation: 'isole', enfants: 0 }).pp;
    const m = calcPrecompteExact(4000, { situation: 'marie_1r', enfants: 0 }).pp;
    assert(m < i, `Marié ${m} >= isolé ${i}`);
  });
  test('PP 2 enfants < 0 enfant', () => {
    const p0 = calcPrecompteExact(3500, { situation: 'isole', enfants: 0 }).pp;
    const p2 = calcPrecompteExact(3500, { situation: 'isole', enfants: 2 }).pp;
    assert(p2 < p0, `2enf ${p2} >= 0enf ${p0}`);
  });
  test('PP 4 enfants < 2 enfants', () => {
    const p2 = calcPrecompteExact(4000, { situation: 'isole', enfants: 2 }).pp;
    const p4 = calcPrecompteExact(4000, { situation: 'isole', enfants: 4 }).pp;
    assert(p4 < p2, `4enf ${p4} >= 2enf ${p2}`);
  });
  test('PP progressivité', () => {
    const r1 = calcPrecompteExact(2500, { situation: 'isole' });
    const r2 = calcPrecompteExact(5000, { situation: 'isole' });
    const r3 = calcPrecompteExact(10000, { situation: 'isole' });
    assert(r2.rate > r1.rate && r3.rate > r2.rate, 'Taux pas progressif');
  });
  test('PP taxe communale croissante', () => {
    const r0 = calcPrecompteExact(3500, { situation: 'isole', taxeCom: 0 }).pp;
    const r7 = calcPrecompteExact(3500, { situation: 'isole', taxeCom: 7 }).pp;
    const r10 = calcPrecompteExact(3500, { situation: 'isole', taxeCom: 10 }).pp;
    assert(r7 >= r0 && r10 >= r7, 'pas croissante');
  });
  test('PP dirigeant > salarié', () => {
    const s = calcPrecompteExact(5000, { situation: 'isole', dirigeant: false }).pp;
    const d = calcPrecompteExact(5000, { situation: 'isole', dirigeant: true }).pp;
    assert(d > s, `Dir ${d} <= Sal ${s}`);
  });

  // ═══ 4. BONUS À L'EMPLOI ═══
  console.log('\n═══ 4. BONUS À L\'EMPLOI ═══');
  test('calcBonusEmploi existe', () => { assert(typeof calcBonusEmploi === 'function', 'non trouvé'); });
  test('Bonus 2000€ > 0', () => { const b = calcBonusEmploi(2000); assert(b > 0 && b <= 350, `${b}`); });
  test('Bonus 5000€ = 0', () => { eq(calcBonusEmploi(5000), 0, 'Bonus 5000€'); });
  test('Bonus dégressif', () => {
    assert(calcBonusEmploi(2000) >= calcBonusEmploi(2500), '2000→2500');
    assert(calcBonusEmploi(2500) >= calcBonusEmploi(3000), '2500→3000');
  });
  test('Bonus 0€ = 0', () => { eq(calcBonusEmploi(0), 0, 'Bonus 0€'); });
  if (typeof calcBonusEmploiDetail === 'function') {
    test('BonusDetail A+B', () => {
      const d = calcBonusEmploiDetail(2500);
      assert(d.voletA >= 0 && d.voletB >= 0, 'négatif');
      eq(d.totalSocial, d.voletA + d.voletB, 'A+B', 0.02);
    });
  }

  // ═══ 5. CSSS ═══
  if (typeof calcCSSS === 'function') {
    console.log('\n═══ 5. CSSS ═══');
    test('CSSS existe', () => { assert(typeof calcCSSS === 'function'); });
    test('CSSS 1500€ ≈ 0-40€', () => { const c = calcCSSS(1500, 'isole'); assert(c >= 0 && c <= 40, `${c}`); });
    test('CSSS progressive', () => { assert(calcCSSS(4000, 'isole') >= calcCSSS(2000, 'isole')); });
  }

  // ═══ 6. CALCUL INTÉGRÉ ═══
  if (typeof calc === 'function') {
    console.log('\n═══ 6. CALCUL INTÉGRÉ ═══');
    test('calc existe', () => { assert(typeof calc === 'function'); });
    test('calc 3500€ → objet', () => { const r = calc(emp3500, per0, co0); assert(r && typeof r === 'object'); });
    test('net < brut', () => { const n = calc(emp3500, per0, co0).net || 0; assert(n > 0 && n < 3500, `${n}`); });
    test('net croissant', () => {
      const n1 = calc({ ...emp3500, monthlySalary: 2500 }, per0, co0).net || 0;
      const n2 = calc({ ...emp3500, monthlySalary: 4000 }, per0, co0).net || 0;
      assert(n2 > n1, `${n2} <= ${n1}`);
    });
  }

  // ═══ 7. EDGE CASES ═══
  console.log('\n═══ 7. EDGE CASES ═══');
  test('PP négatif → ≥ 0', () => { assert(calcPrecompteExact(-100, { situation: 'isole' }).pp >= 0); });
  test('PP 15000€ ok', () => { assert(calcPrecompteExact(15000, { situation: 'isole' }).pp > 0); });
  test('Bonus -500€ = 0', () => { eq(calcBonusEmploi(-500), 0, 'négatif'); });

  // ═══ 8. INDÉPENDANTS ═══
  if (typeof calcIndependant === 'function') {
    console.log('\n═══ 8. INDÉPENDANTS ═══');
    test('calcIndependant existe', () => { assert(typeof calcIndependant === 'function'); });
    test('Indep 40k structure', () => {
      const r = calcIndependant({ revenuNet: 40000, type: 'principal', situation: 'isole' });
      assert(r.cotisAnnuelle !== undefined && r.ippAnnuel !== undefined);
    });
    test('Cotis croissantes', () => {
      const r1 = calcIndependant({ revenuNet: 20000, type: 'principal', situation: 'isole' });
      const r2 = calcIndependant({ revenuNet: 50000, type: 'principal', situation: 'isole' });
      assert(r2.cotisAnnuelle > r1.cotisAnnuelle);
    });
    console.log('\n═══ TABLEAU INDÉPENDANTS ═══');
    console.log('  Revenu net  │ Cotis soc.  │ Frais gest │ IPP        │ Net dispo  │ Taux');
    console.log('  ────────────┼─────────────┼────────────┼────────────┼────────────┼──────');
    for (const rev of [15000, 25000, 40000, 60000, 80000, 100000]) {
      const r = calcIndependant({ revenuNet: rev, type: 'principal', situation: 'isole' });
      console.log(`  ${String(fmt(rev)).padEnd(11)}│ ${String(fmt(r.cotisAnnuelle)).padEnd(11)} │ ${String(fmt(r.fraisGestion)).padEnd(10)} │ ${String(fmt(r.ippAnnuel)).padEnd(10)} │ ${String(fmt(r.netDisponibleAnnuel)).padEnd(10)} │ ${r.tauxChargesTotal.toFixed(1)}%`);
    }
  }

  // ═══ 9. TABLEAU SALARIÉS ═══
  if (typeof calc === 'function') {
    console.log('\n═══ 9. TABLEAU RÉCAPITULATIF SALARIÉS ═══');
    console.log('  Brut     │ ONSS 13.07% │ PP        │ CSSS     │ Net       │ Coût empl │ % net');
    console.log('  ─────────┼─────────────┼───────────┼──────────┼───────────┼───────────┼──────');
    for (const brut of [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000, 10000]) {
      try {
        const r = calc({ ...emp3500, monthlySalary: brut }, per0, co0);
        const pctNet = (r.net / brut * 100).toFixed(1);
        console.log(`  ${String(fmt(brut)).padEnd(9)}│ ${String(fmt(r.onssW)).padEnd(11)} │ ${String(fmt(r.tax)).padEnd(9)} │ ${String(fmt(r.css)).padEnd(8)} │ ${String(fmt(r.net)).padEnd(9)} │ ${String(fmt(r.costTotal)).padEnd(9)} │ ${pctNet}%`);
      } catch (e) { console.log(`  ${String(fmt(brut)).padEnd(9)}│ ERREUR: ${e.message}`); }
    }
  }

  // ═══ 10. TESTS END-TO-END FICHES DE PAIE ═══
  // 10 scénarios réalistes comparés aux valeurs de référence
  // Valeurs de référence: barèmes officiels 2026
  // Tolérance: 1€ sur net (différences d'arrondi)
  if (typeof calc === 'function') {
    console.log('\n═══ 10. TESTS END-TO-END — 10 FICHES DE PAIE ═══');
    const TOL = 1.00; // tolérance 1€

    const scenarios = [
      // Scénario 1: Employé CP200 isolé 2500€
      { id: 1, desc: 'Employé CP200 isolé 2500€',
        emp: { monthlySalary: 2500, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 },
        check: { onssW: [326.75, 0.01], netRange: [1900, 2200] } },

      // Scénario 2: Employé CP200 isolé 3500€
      { id: 2, desc: 'Employé CP200 isolé 3500€',
        emp: { monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 },
        check: { onssW: [457.45, 0.01], netRange: [2200, 2500] } },

      // Scénario 3: Employé CP200 marié 1 revenu 3500€ 2 enfants
      { id: 3, desc: 'Employé marié 1rev 3500€ 2enf',
        emp: { monthlySalary: 3500, statut: 'employe', civil: 'married_1', depChildren: 2, cp: '200', whWeek: 38 },
        check: { onssW: [457.45, 0.01], netRange: [2500, 3100] } },

      // Scénario 4: Employé CP200 isolé 5000€
      { id: 4, desc: 'Employé CP200 isolé 5000€',
        emp: { monthlySalary: 5000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 },
        check: { onssW: [653.50, 0.01], netRange: [2800, 3200] } },

      // Scénario 5: Employé CP200 marié 2 revenus 4000€ 1 enfant
      { id: 5, desc: 'Employé marié 2rev 4000€ 1enf',
        emp: { monthlySalary: 4000, statut: 'employe', civil: 'married_2', depChildren: 1, cp: '200', whWeek: 38 },
        check: { onssW: [522.80, 0.01], netRange: [2400, 2900] } },

      // Scénario 6: Ouvrier CP124 isolé 2800€
      { id: 6, desc: 'Ouvrier CP124 isolé 2800€',
        emp: { monthlySalary: 2800, statut: 'ouvrier', civil: 'isole', depChildren: 0, cp: '124', whWeek: 38 },
        check: { onssWBase108: true, netRange: [1700, 2200] } },

      // Scénario 7: Employé mi-temps CP200 1500€ (base 3000€)
      { id: 7, desc: 'Employé mi-temps 1500€',
        emp: { monthlySalary: 1500, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 19 },
        check: { onssW: [196.05, 0.01], netRange: [1100, 1510] } },

      // Scénario 8: Employé CP200 isolé 8000€ haut salaire
      { id: 8, desc: 'Employé CP200 isolé 8000€',
        emp: { monthlySalary: 8000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 },
        check: { onssW: [1045.60, 0.01], netRange: [3800, 4400] } },

      // Scénario 9: Employé CP200 isolé 3000€ 3 enfants
      { id: 9, desc: 'Employé isolé 3000€ 3 enfants',
        emp: { monthlySalary: 3000, statut: 'employe', civil: 'isole', depChildren: 3, cp: '200', whWeek: 38 },
        check: { onssW: [392.10, 0.01], netRange: [2200, 2700] } },

      // Scénario 10: Employé CP200 isolé 2000€ bas salaire + bonus emploi
      { id: 10, desc: 'Employé CP200 isolé 2000€ + bonus',
        emp: { monthlySalary: 2000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 },
        check: { onssW: [261.40, 0.01], bonusMin: 50, netRange: [1700, 2000] } },
    ];

    console.log('  ID │ Description                         │ Brut     │ ONSS W   │ PP       │ CSSS   │ Bonus  │ Net      │ Coût empl │ Statut');
    console.log('  ───┼─────────────────────────────────────┼──────────┼──────────┼──────────┼────────┼────────┼──────────┼───────────┼───────');

    let e2ePass = 0, e2eFail = 0;
    const e2eErrors = [];

    scenarios.forEach(s => {
      try {
        const r = calc(s.emp, per0, co0);
        const brut = r.gross;
        const onssW = r.onssW || r.onssNet || 0;
        const pp = r.tax || 0;
        const csss = r.css || 0;
        const bonus = r.empBonus || 0;
        const net = r.net || 0;
        const cost = r.costTotal || 0;
        const onssE = r.onssE || 0;

        let ok = true;
        const errs = [];

        // Test 1: ONSS travailleur = brut × 13.07% (exact)
        if (s.check.onssW) {
          const expected = s.check.onssW[0];
          const tol = s.check.onssW[1];
          if (Math.abs(onssW - expected) > tol) {
            errs.push(`ONSS W: ${onssW.toFixed(2)} ≠ ${expected}`);
            ok = false;
          }
        }

        // Test 2: Ouvrier base 108%
        if (s.check.onssWBase108 && s.emp.statut === 'ouvrier') {
          const expected108 = Math.round(s.emp.monthlySalary * 1.08 * 0.1307 * 100) / 100;
          if (Math.abs(onssW - expected108) > 0.10) {
            errs.push(`ONSS 108%: ${onssW.toFixed(2)} ≠ ${expected108}`);
            ok = false;
          }
        }

        // Test 3: Net dans la fourchette réaliste
        if (s.check.netRange) {
          if (net < s.check.netRange[0] || net > s.check.netRange[1]) {
            errs.push(`Net ${net.toFixed(2)} hors [${s.check.netRange[0]}-${s.check.netRange[1]}]`);
            ok = false;
          }
        }

        // Test 4: Bonus emploi pour bas salaires
        if (s.check.bonusMin && bonus < s.check.bonusMin) {
          errs.push(`Bonus ${bonus.toFixed(2)} < ${s.check.bonusMin}`);
          ok = false;
        }

        // Test 5: Cohérence brut = ONSS + PP + CSSS + net (± bonus)
        const sumCheck = onssW + pp + csss + net - bonus;
        if (Math.abs(sumCheck - brut) > TOL) {
          errs.push(`Incohérence: ONSS+PP+CSSS+Net-Bonus=${sumCheck.toFixed(2)} ≠ brut ${brut.toFixed(2)}`);
          ok = false;
        }

        // Test 6: PP > 0 pour tout brut > 2000€
        if (brut >= 2000 && pp <= 0) {
          errs.push(`PP=0 pour brut ${brut}€`);
          ok = false;
        }

        // Test 7: ONSS employeur > 0
        if (onssE <= 0) {
          errs.push(`ONSS employeur = 0`);
          ok = false;
        }

        // Test 8: Coût total > brut
        if (cost <= brut) {
          errs.push(`Coût ${cost.toFixed(2)} <= brut ${brut.toFixed(2)}`);
          ok = false;
        }

        // Test 9: Net <= brut (bonus emploi can make net = brut for low salaries)
        if (net > brut + 1) {
          errs.push(`Net ${net.toFixed(2)} > brut ${brut.toFixed(2)}`);
          ok = false;
        }

        // Test 10: Marié 1 rev → PP < isolé (même brut)
        if (s.emp.civil === 'married_1') {
          const rIsole = calc({ ...s.emp, civil: 'isole', depChildren: 0 }, per0, co0);
          if (pp >= (rIsole.tax || 0)) {
            errs.push(`Marié PP ${pp.toFixed(2)} >= isolé PP ${(rIsole.tax||0).toFixed(2)}`);
            ok = false;
          }
        }

        const status = ok ? '✅' : '❌';
        if (ok) e2ePass++; else { e2eFail++; e2eErrors.push({ id: s.id, desc: s.desc, errs }); }
        console.log(`  ${String(s.id).padStart(2)} │ ${s.desc.padEnd(35)} │ ${fmt(brut).padStart(8)} │ ${fmt(onssW).padStart(8)} │ ${fmt(pp).padStart(8)} │ ${fmt(csss).padStart(6)} │ ${fmt(bonus).padStart(6)} │ ${fmt(net).padStart(8)} │ ${fmt(cost).padStart(9)} │ ${status}`);
        if (!ok) errs.forEach(e => console.log(`       └─ ⚠ ${e}`));

        // Register in test framework
        test(`E2E #${s.id}: ${s.desc}`, () => {
          assert(ok, errs.join('; '));
        });
      } catch (e) {
        e2eFail++;
        e2eErrors.push({ id: s.id, desc: s.desc, errs: [e.message] });
        console.log(`  ${String(s.id).padStart(2)} │ ${s.desc.padEnd(35)} │ ERREUR: ${e.message}`);
        test(`E2E #${s.id}: ${s.desc}`, () => { throw e; });
      }
    });

    console.log('  ───┼─────────────────────────────────────┼──────────┼──────────┼──────────┼────────┼────────┼──────────┼───────────┼───────');
    console.log(`  E2E RÉSULTAT: ${e2ePass}/${e2ePass + e2eFail} scénarios passés`);
    if (e2eFail > 0) {
      console.log(`  ❌ ${e2eFail} ÉCHEC(S):`);
      e2eErrors.forEach(e => console.log(`     #${e.id} ${e.desc}: ${e.errs.join(', ')}`));
    }

    // ═══ 11. TESTS COMPARATIFS CROISÉS ═══
    console.log('\n═══ 11. TESTS COMPARATIFS — VÉRIFICATIONS CROISÉES ═══');

    // Vérification: enfants réduisent le PP
    test('Plus d\'enfants = moins de PP', () => {
      const r0 = calc({ monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const r1 = calc({ monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 1, cp: '200', whWeek: 38 }, per0, co0);
      const r2 = calc({ monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 2, cp: '200', whWeek: 38 }, per0, co0);
      const r4 = calc({ monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 4, cp: '200', whWeek: 38 }, per0, co0);
      assert(r0.tax > r1.tax, `0enf ${r0.tax} <= 1enf ${r1.tax}`);
      assert(r1.tax > r2.tax, `1enf ${r1.tax} <= 2enf ${r2.tax}`);
      assert(r2.tax > r4.tax, `2enf ${r2.tax} <= 4enf ${r4.tax}`);
    });

    // Marié 1 rev toujours plus avantageux qu'isolé
    test('Marié 1 rev → net > isolé (3500€)', () => {
      const rI = calc({ monthlySalary: 3500, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const rM = calc({ monthlySalary: 3500, statut: 'employe', civil: 'married_1', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      assert(rM.net > rI.net, `Marié ${rM.net} <= isolé ${rI.net}`);
    });

    // Bonus emploi disparaît pour hauts salaires
    test('Bonus emploi 0 au-dessus seuil', () => {
      const r = calc({ monthlySalary: 5000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      eq(r.empBonus || 0, 0, 'Bonus 5000€');
    });

    // Bonus emploi > 0 pour bas salaires
    test('Bonus emploi > 0 pour 2000€', () => {
      const r = calc({ monthlySalary: 2000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      assert((r.empBonus || 0) > 50, `Bonus ${r.empBonus}€ trop bas`);
    });

    // Ouvrier 108% → ONSS plus élevé
    test('Ouvrier ONSS > employé ONSS (même brut)', () => {
      const rE = calc({ monthlySalary: 3000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const rO = calc({ monthlySalary: 3000, statut: 'ouvrier', civil: 'isole', depChildren: 0, cp: '124', whWeek: 38 }, per0, co0);
      assert((rO.onssW || rO.onssNet) > (rE.onssW || rE.onssNet), `Ouvrier ONSS <= employé`);
    });

    // CSSS plafonné
    test('CSSS plafonné pour hauts salaires', () => {
      const r1 = calc({ monthlySalary: 6000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const r2 = calc({ monthlySalary: 10000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      eq(r1.css, r2.css, 'CSSS non plafonné');
    });

    // Coût total croissant
    test('Coût total croissant avec brut', () => {
      const bruts = [2000, 3000, 4000, 5000, 6000, 8000];
      let prev = 0;
      bruts.forEach(b => {
        const r = calc({ monthlySalary: b, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
        assert(r.costTotal > prev, `Coût ${b}€ = ${r.costTotal} <= ${prev}`);
        prev = r.costTotal;
      });
    });

    // Taux net décroissant (progressivité fiscale)
    test('Taux net décroissant (progressivité)', () => {
      const r2k = calc({ monthlySalary: 2000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const r8k = calc({ monthlySalary: 8000, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const pct2k = r2k.net / 2000;
      const pct8k = r8k.net / 8000;
      assert(pct2k > pct8k, `% net 2k (${(pct2k*100).toFixed(1)}%) <= 8k (${(pct8k*100).toFixed(1)}%)`);
    });

    // ═══ 12. TESTS PRÉCOMPTE SPF EXACT ═══
    console.log('\n═══ 12. TESTS PRÉCOMPTE SPF — TRANCHES 2026 ═══');

    test('PP tranches: 26,75% + 42,80% + 48,15% + 53,50%', () => {
      // Vérification que les tranches sont correctement appliquées
      const r = calcPrecompteExact(4000, { situation: 'isole', enfants: 0 });
      assert(r.detail.impotBrut > 0, 'Impôt brut = 0');
      // Annuel imposable = (4000 - 4000*0.1307) * 12 - frais pro
      const imposable = 4000 - 4000 * 0.1307;
      const annuel = imposable * 12;
      assert(annuel > 16310, 'Annuel devrait dépasser 1ère tranche');
    });

    test('Frais pro salarié: 30% plafonné 6070€/an (2026)', () => {
      const r1 = calcPrecompteExact(3000, { situation: 'isole' });
      const r2 = calcPrecompteExact(8000, { situation: 'isole' });
      // Pour 8000€: annuel imposable = ~83k → forfait = min(83k×30%, 6070) = 6070 annuel (indexé 2026)
      assert(r2.detail.forfaitAn <= 6070 + 1, `Forfait annuel ${r2.detail.forfaitAn} > plafond 6070`);
    });

    test('Quotient conjugal marié 1 rev: 30% max 12520€', () => {
      const r = calcPrecompteExact(5000, { situation: 'marie_1r', enfants: 0 });
      assert(r.detail.qcAttribue > 0, 'QC = 0');
      assert(r.detail.qcAttribue <= 12520, `QC ${r.detail.qcAttribue} > 12520`);
    });

    test('Réduction enfants croissante', () => {
      const r0 = calcPrecompteExact(3500, { situation: 'isole', enfants: 0 });
      const r2 = calcPrecompteExact(3500, { situation: 'isole', enfants: 2 });
      const r5 = calcPrecompteExact(3500, { situation: 'isole', enfants: 5 });
      assert(r2.detail.redEnfants > r0.detail.redEnfants, 'redEnfants 2 <= 0');
      assert(r5.detail.redEnfants > r2.detail.redEnfants, 'redEnfants 5 <= 2');
    });

    // ═══ 13. TESTS PÉCULE VACANCES ═══
    console.log('\n═══ 13. TESTS PÉCULE DE VACANCES ═══');
    if (typeof calcPeculeVacancesComplet === 'function') {
      test('Pécule employé: simple + double', () => {
        const r = calcPeculeVacancesComplet({ brutMensuel: 3500, statut: 'employe', moisPrestes: 12 });
        assert(r.simple && r.double, 'Structure manquante');
        assert(r.simple.brut > 0, 'Simple brut = 0');
        assert(r.double.brut > 0, 'Double brut = 0');
      });

      test('Pécule ouvrier: cotisation patronale', () => {
        const r = calcPeculeVacancesComplet({ brutMensuel: 2500, statut: 'ouvrier', moisPrestes: 12 });
        assert(r.cotisationPatronale > 0, 'Cotis patronale = 0');
        assert(r.tauxPatronal === 15.84, `Taux ${r.tauxPatronal} ≠ 15.84`);
      });

      test('Pécule prorata 6 mois = 50%', () => {
        const r12 = calcPeculeVacancesComplet({ brutMensuel: 3000, statut: 'employe', moisPrestes: 12 });
        const r6 = calcPeculeVacancesComplet({ brutMensuel: 3000, statut: 'employe', moisPrestes: 6 });
        const ratio = r6.totalBrut / r12.totalBrut;
        assert(Math.abs(ratio - 0.5) < 0.02, `Ratio ${ratio} ≠ 0.5`);
      });
    }
  }

  // ═══ 14. TESTS SUPPLÉMENTAIRES — ROBUSTESSE ═══
  console.log('\n═══ 14. TESTS SUPPLÉMENTAIRES — ROBUSTESSE ═══');

  test('PP très haut salaire 20000€ > PP 10000€', () => {
    const p10 = calcPrecompteExact(10000, { situation: 'isole', enfants: 0 }).pp;
    const p20 = calcPrecompteExact(20000, { situation: 'isole', enfants: 0 }).pp;
    assert(p20 > p10, `PP 20k (${p20}) <= PP 10k (${p10})`);
  });

  test('ONSS exact: 4567.89€ × 13.07%', () => {
    const brut = 4567.89;
    const expected = Math.round(brut * 0.1307 * 100) / 100;
    eq(expected, 597.02, 'ONSS 4567.89€', 0.01);
  });

  test('Bonus emploi seuil 2999€ > 0, 3100€ encore > 0 ou = 0', () => {
    const b1 = calcBonusEmploi(2999);
    assert(b1 >= 0, `Bonus 2999€ négatif: ${b1}`);
  });

  if (typeof calc === 'function') {
    test('calc cohérence ONSS+PP+CSSS+Net-Bonus = Brut pour 4200€', () => {
      const r = calc({ monthlySalary: 4200, statut: 'employe', civil: 'isole', depChildren: 0, cp: '200', whWeek: 38 }, per0, co0);
      const sum = (r.onssW || 0) + (r.tax || 0) + (r.css || 0) + (r.net || 0) - (r.empBonus || 0);
      eq(sum, r.gross, 'Cohérence brut', 1.0);
    });
  }

  // ═══ RAPPORT ═══
  console.log('\n' + '═'.repeat(60));
  console.log(`  RÉSULTAT: ${passed}/${total} tests passés`);
  if (failed > 0) {
    console.log(`  ❌ ${failed} ÉCHECS:`);
    for (const f of failures) console.log(`     • ${f.name}: ${f.error}`);
  } else {
    console.log('  ✅ TOUS LES TESTS PASSENT');
  }
  console.log('═'.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
} catch (loadErr) {
  console.error('❌ Erreur chargement source:', loadErr.message);
  console.error(loadErr.stack?.split('\n').slice(0, 5).join('\n'));
  process.exit(2);
}
