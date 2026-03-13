import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic   = 'force-dynamic';
export const maxDuration = 30;

// ── Supabase service ──────────────────────────────────────────────────────────
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ── Constantes belges 2026 ────────────────────────────────────────────────────
const TX_ONSS_W = 0.1307;
const TX_ONSS_E = 0.2507;
const TX_AT     = 0.0100;
const CR_TRAV   = 1.09;
const RMMMG     = 2070.48;
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function quickPP(brut) {
  const b   = parseFloat(brut) || 0;
  if (b <= 0) return 0;
  const ann = b * 12;
  let pp;
  if (ann <= 16710)      pp = ann * 0.2675;
  else if (ann <= 29500) pp = 4469.93 + (ann - 16710) * 0.4280;
  else if (ann <= 51050) pp = 9948.49 + (ann - 29500) * 0.4815;
  else                   pp = 20324.56 + (ann - 51050) * 0.5350;
  return Math.round(Math.max(0, pp - 2985) / 12 * 100) / 100;
}

function calcCSS(brut) {
  const t = brut * 3;
  if (t <= 6570)  return 0;
  if (t <= 8829)  return Math.round(t * 0.0764 * 100) / 100;
  if (t <= 13635) return Math.round((51.64 + (t - 8829) * 0.011) * 100) / 100;
  return 154.92;
}

// ── HTML fiche de paie ────────────────────────────────────────────────────────
function buildPayslipHTML({ emp = {}, co = {}, period = {} }) {
  const brut     = parseFloat(emp.gross || emp.monthlySalary || emp.brut || 0);
  const regime   = parseFloat(emp.regime || 100);
  const brutR    = Math.round(brut * regime / 100 * 100) / 100;
  const isOuv    = (emp.statut || emp.status_type || '').toLowerCase().includes('ouvrier');
  const onssBase = isOuv ? brutR * 1.08 : brutR;
  const onssW    = Math.round(onssBase * TX_ONSS_W * 100) / 100;
  const onssE    = Math.round(brutR * TX_ONSS_E * 100) / 100;
  const atE      = Math.round(brutR * TX_AT * 100) / 100;
  const imposable = Math.round((brutR - onssW) * 100) / 100;
  const pp       = quickPP(brutR);
  const css      = calcCSS(brutR);
  const atn      = parseFloat(emp.atnVoiture || emp.atn || 0);
  const frais    = parseFloat(emp.frais || emp.fraisBureau || 0);
  const hasCR    = !!(emp.chequesRepas || emp.cr);
  const crVal    = parseFloat(emp.chequesRepasVal || 8.0);
  const crJours  = parseInt(emp.chequesRepasJours || 22);
  const crRetenu = hasCR ? Math.round(CR_TRAV * crJours * 100) / 100 : 0;
  const crPat    = hasCR ? Math.round((crVal - CR_TRAV) * crJours * 100) / 100 : 0;
  const net      = Math.round((brutR - onssW - pp - css - atn + frais - crRetenu) * 100) / 100;
  const coutEmp  = Math.round((brutR + onssE + atE + crPat) * 100) / 100;
  const pvSimple = Math.round(brutR * 0.1534 * 100) / 100;
  const pvDouble = Math.round(brutR * 0.92 * 100) / 100;

  const now  = new Date();
  const mm   = period.month  ?? (now.getMonth() + 1);
  const yyyy = period.year   ?? now.getFullYear();
  const mois = MOIS[mm - 1] || MOIS[now.getMonth()];
  const nm   = [(emp.fn || emp.first || emp.firstName || ''), (emp.ln || emp.last || emp.lastName || '')].filter(Boolean).join(' ') || '—';
  const f    = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
  const ref  = `PAY-${yyyy}${String(mm).padStart(2,'0')}-${(emp.id || 'XXX').toString().substring(0,6).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:9pt;color:#1a1a2e;background:#fff}
  @page{size:A4;margin:12mm 14mm}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #c6a34e;padding-bottom:10px;margin-bottom:12px}
  .logo-name{font-size:17pt;font-weight:900;color:#090c16;letter-spacing:-.5px}
  .logo-sub{font-size:7pt;color:#888}
  .logo-bce{font-size:7pt;color:#aaa;margin-top:2px}
  .doc-title h1{font-size:13pt;font-weight:800;color:#c6a34e;text-transform:uppercase;letter-spacing:1px;text-align:right}
  .doc-title .period{font-size:10pt;font-weight:600;color:#444;text-align:right;margin-top:3px}
  .doc-title .emission{font-size:7pt;color:#aaa;text-align:right;margin-top:2px}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px}
  .partie{padding:10px 12px;border:1px solid #e5e5e5;border-radius:6px;background:#fafafa}
  .partie-title{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#888;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:6px}
  .partie-line{display:flex;justify-content:space-between;margin-bottom:2px}
  .partie-label{font-size:7.5pt;color:#888}
  .partie-value{font-size:7.5pt;font-weight:600;color:#1a1a2e;text-align:right}
  .section-title{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#c6a34e;background:#fdf8ee;padding:5px 10px;border-left:3px solid #c6a34e;margin-bottom:0}
  table.rub{width:100%;border-collapse:collapse;margin-bottom:10px}
  table.rub th{font-size:7pt;font-weight:700;text-transform:uppercase;color:#888;padding:4px 8px;background:#f5f5f5;border-bottom:1.5px solid #ddd;text-align:left}
  table.rub th.r,table.rub td.r{text-align:right;font-variant-numeric:tabular-nums}
  table.rub td{font-size:8.5pt;padding:4px 8px;border-bottom:1px solid #f0f0f0}
  table.rub tr.sub td{font-weight:600;background:#fdf8ee;border-top:1.5px solid #e5d5a0}
  table.rub tr.neg td.r{color:#dc2626}
  table.rub tr.pos td.r{color:#16a34a}
  table.rub tr.dim td{color:#888;font-size:8pt}
  .net-zone{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#090c16,#131820);padding:14px 20px;border-radius:8px;margin:12px 0;border:1px solid #c6a34e30}
  .net-label{color:#9e9b93;font-size:9pt;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
  .net-value{color:#c6a34e;font-size:20pt;font-weight:900;letter-spacing:-1px}
  .net-sub{color:#5e5c56;font-size:7pt;margin-top:2px}
  .cout-zone{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:0 0 12px}
  .cout-box{padding:8px 10px;background:#fafafa;border:1px solid #eee;border-radius:5px;text-align:center}
  .cout-label{font-size:6.5pt;color:#aaa;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
  .cout-value{font-size:9pt;font-weight:700;color:#444}
  .ann-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0 12px}
  .ann-box{padding:7px 8px;background:#fafafa;border:1px solid #eee;border-radius:5px;text-align:center}
  .ann-box .al{font-size:6pt;color:#aaa;text-transform:uppercase}
  .ann-box .av{font-size:8pt;font-weight:700;color:#1a1a2e;margin-top:1px}
  .legal-bar{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
  .pill{padding:3px 8px;border-radius:12px;font-size:6.5pt;font-weight:600;background:#f0f0f0;color:#666}
  .sig{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px;padding-top:10px;border-top:1px solid #eee}
  .sig-box{text-align:center}
  .sig-line{border-bottom:1px solid #ccc;height:30px;margin-bottom:4px}
  .sig-label{font-size:7pt;color:#aaa}
  .footer{text-align:center;margin-top:12px;padding-top:8px;border-top:1px solid #f0f0f0;font-size:6.5pt;color:#bbb}
  .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:72pt;font-weight:900;color:rgba(198,163,78,.04);pointer-events:none;z-index:0;white-space:nowrap}
</style>
</head>
<body>
<div class="wm">CONFIDENTIEL</div>

<div class="header">
  <div>
    <div class="logo-name">${co.name || 'Aureus Social Pro'}</div>
    <div class="logo-sub">Secrétariat social digital — Powered by Aureus IA</div>
    <div class="logo-bce">BCE: ${co.vat || '—'} | ONSS: ${co.onss || '—'}</div>
  </div>
  <div class="doc-title">
    <h1>Fiche de Paie</h1>
    <div class="period">${mois} ${yyyy}</div>
    <div class="emission">Émis le ${now.toLocaleDateString('fr-BE')}</div>
  </div>
</div>

<div class="parties">
  <div class="partie">
    <div class="partie-title">👤 Travailleur</div>
    <div class="partie-line"><span class="partie-label">Nom</span><span class="partie-value">${nm}</span></div>
    <div class="partie-line"><span class="partie-label">NISS</span><span class="partie-value">${emp.niss || '—'}</span></div>
    <div class="partie-line"><span class="partie-label">Statut</span><span class="partie-value">${isOuv ? 'Ouvrier' : 'Employé'}</span></div>
    <div class="partie-line"><span class="partie-label">Commission Paritaire</span><span class="partie-value">CP ${emp.cp || '200'}</span></div>
    <div class="partie-line"><span class="partie-label">Régime travail</span><span class="partie-value">${regime}% (${Math.round(38 * regime / 100)}h/sem)</span></div>
    <div class="partie-line"><span class="partie-label">IBAN</span><span class="partie-value">${emp.iban ? emp.iban.replace(/(.{4})/g,'$1 ').trim() : '—'}</span></div>
  </div>
  <div class="partie">
    <div class="partie-title">🏢 Employeur</div>
    <div class="partie-line"><span class="partie-label">Société</span><span class="partie-value">${co.name || '—'}</span></div>
    <div class="partie-line"><span class="partie-label">BCE / TVA</span><span class="partie-value">${co.vat || '—'}</span></div>
    <div class="partie-line"><span class="partie-label">N° ONSS</span><span class="partie-value">${co.onss || '—'}</span></div>
    <div class="partie-line"><span class="partie-label">Adresse</span><span class="partie-value">${co.address || '—'}</span></div>
    <div class="partie-line"><span class="partie-label">Référence</span><span class="partie-value">${ref}</span></div>
    <div class="partie-line"><span class="partie-label">Période</span><span class="partie-value">${mois} ${yyyy}</span></div>
  </div>
</div>

<div class="section-title">Rémunérations</div>
<table class="rub">
  <thead><tr><th>Rubrique</th><th>Base</th><th>Taux</th><th class="r">Montant (€)</th></tr></thead>
  <tbody>
    <tr><td>Salaire de base${regime < 100 ? ' ('+regime+'%)' : ''}</td><td>38h/sem</td><td>100%</td><td class="r">${f(brutR)}</td></tr>
    ${hasCR ? `<tr class="pos"><td>Chèques-repas (part patronale)</td><td>${crJours}j</td><td>${f(crVal)} €/j</td><td class="r">${f(crPat + crRetenu)}</td></tr>` : ''}
    ${frais > 0 ? `<tr class="pos"><td>Frais propres employeur</td><td>forfait</td><td>—</td><td class="r">${f(frais)}</td></tr>` : ''}
    <tr class="sub"><td colspan="3"><strong>Brut imposable</strong></td><td class="r"><strong>${f(brutR)}</strong></td></tr>
  </tbody>
</table>

<div class="section-title">Retenues travailleur</div>
<table class="rub">
  <thead><tr><th>Rubrique</th><th>Base</th><th>Taux</th><th class="r">Montant (€)</th></tr></thead>
  <tbody>
    ${isOuv ? `<tr class="dim"><td>Base ONSS ouvrier (×108%)</td><td>${f(brutR)}</td><td>108%</td><td class="r">${f(onssBase)}</td></tr>` : ''}
    <tr class="neg"><td>ONSS travailleur</td><td>${f(onssBase)}</td><td>${(TX_ONSS_W*100).toFixed(2)}%</td><td class="r">- ${f(onssW)}</td></tr>
    <tr class="dim"><td>Rémunération imposable</td><td>—</td><td>—</td><td class="r">${f(imposable)}</td></tr>
    ${atn > 0 ? `<tr class="neg"><td>ATN (avantage toute nature)</td><td>—</td><td>—</td><td class="r">+ ${f(atn)}</td></tr>` : ''}
    <tr class="neg"><td>Précompte professionnel</td><td>${f(imposable + atn)}</td><td>barème SPF 2026</td><td class="r">- ${f(pp)}</td></tr>
    <tr class="neg"><td>Cotisation spéciale SS (CSSS)</td><td>${f(brutR * 3)}/trim.</td><td>variable</td><td class="r">- ${f(css)}</td></tr>
    ${hasCR ? `<tr class="neg"><td>Chèques-repas (retenue travailleur)</td><td>${crJours}j</td><td>${f(CR_TRAV)} €/j</td><td class="r">- ${f(crRetenu)}</td></tr>` : ''}
  </tbody>
</table>

<div class="net-zone">
  <div>
    <div class="net-label">Net à payer</div>
    <div class="net-sub">Virement SEPA vers ${emp.iban ? emp.iban.substring(0,12)+'...' : 'IBAN non renseigné'}</div>
  </div>
  <div style="text-align:right">
    <div class="net-value">${f(net)} €</div>
  </div>
</div>

<div class="cout-zone">
  <div class="cout-box"><div class="cout-label">Brut mensuel</div><div class="cout-value">${f(brutR)} €</div></div>
  <div class="cout-box"><div class="cout-label">ONSS patronal (${(TX_ONSS_E*100).toFixed(2)}%)</div><div class="cout-value">${f(onssE)} €</div></div>
  <div class="cout-box"><div class="cout-label">Coût total employeur</div><div class="cout-value">${f(coutEmp)} €</div></div>
</div>

<div class="section-title">Projections annuelles</div>
<div class="ann-grid">
  <div class="ann-box"><div class="al">Brut annuel</div><div class="av">${f(brutR * 12)} €</div></div>
  <div class="ann-box"><div class="al">Net annuel</div><div class="av">${f(net * 12)} €</div></div>
  <div class="ann-box"><div class="al">Pécule simple</div><div class="av">${f(pvSimple)} €</div></div>
  <div class="ann-box"><div class="al">Pécule double</div><div class="av">${f(pvDouble)} €</div></div>
  <div class="ann-box"><div class="al">Prime de fin d'année</div><div class="av">${f(brutR)} €</div></div>
  <div class="ann-box"><div class="al">ONSS trav. annuel</div><div class="av">${f(onssW * 12)} €</div></div>
  <div class="ann-box"><div class="al">PP annuel</div><div class="av">${f(pp * 12)} €</div></div>
  <div class="ann-box"><div class="al">Coût empl. annuel</div><div class="av">${f(coutEmp * 12)} €</div></div>
</div>

<div class="legal-bar">
  <span class="pill">⚖️ Art. 15 Loi 12/04/1965</span>
  <span class="pill">📋 ONSS: ${(TX_ONSS_W*100).toFixed(2)}% trav. / ${(TX_ONSS_E*100).toFixed(2)}% patr.</span>
  <span class="pill">🏦 RMMMG 2026: ${new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(RMMMG)} €</span>
  <span class="pill">📅 Barèmes SPF Finances 2026</span>
  <span class="pill">🔒 Document confidentiel</span>
</div>

<div class="sig">
  <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Signature employeur</div></div>
  <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Signature travailleur (pour acquit)</div></div>
</div>

<div class="footer">
  ${co.name || 'Aureus Social Pro'} — BCE ${co.vat || '—'} — ${co.address || ''}<br>
  Fiche générée le ${now.toLocaleDateString('fr-BE')} par Aureus Social Pro (Aureus IA SPRL, BCE BE 1028.230.781)<br>
  Document confidentiel — À conserver 5 ans (Art. 10 loi comptable belge)
</div>
</body>
</html>`;
}

// ── Génère PDF via puppeteer ──────────────────────────────────────────────────
async function makePDF(html) {
  let chromium, puppeteer;
  try {
    chromium  = (await import('@sparticuz/chromium')).default;
    puppeteer = (await import('puppeteer-core')).default;
  } catch {
    return null; // fallback HTML
  }
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' },
  });
  await browser.close();
  return pdf;
}

// ── POST /api/payslips/pdf ────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const u    = await getAuthUser(req).catch(() => null);
    const body = await req.json();
    const html = buildPayslipHTML(body);

    if (body.format === 'html') {
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const pdfBuf = await makePDF(html);
    if (!pdfBuf) {
      // fallback HTML si puppeteer absent
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Fallback': 'html' }
      });
    }

    // Sauvegarder dans fiches_paie si user connecté
    if (u) {
      const db = sb();
      if (db) {
        const emp = body.emp || {};
        const per = body.period || {};
        const now = new Date();
        await db.from('fiches_paie').insert([{
          user_id: u.id,
          eid: emp.id || null,
          ename: [(emp.fn || emp.first || ''), (emp.ln || emp.last || '')].filter(Boolean).join(' '),
          period: `${per.year || now.getFullYear()}-${String(per.month ?? now.getMonth() + 1).padStart(2,'0')}`,
          month: per.month ?? (now.getMonth() + 1),
          year:  per.year  ?? now.getFullYear(),
          gross: parseFloat(emp.gross || emp.monthlySalary || 0),
          at: now.toISOString(),
        }]).catch(() => {});
      }
    }

    const emp  = body.emp  || {};
    const per  = body.period || {};
    const now  = new Date();
    const mm   = String((per.month ?? now.getMonth() + 1)).padStart(2,'0');
    const yyyy = per.year ?? now.getFullYear();
    const nm   = [(emp.fn || emp.first || ''), (emp.ln || emp.last || '')].filter(Boolean).join('_') || 'employe';
    const filename = `fiche-paie_${nm}_${MOIS[(per.month ?? now.getMonth() + 1) - 1]}-${yyyy}.pdf`
      .toLowerCase().replace(/[éèê]/g,'e').replace(/[^a-z0-9_.-]/g,'_');

    return new NextResponse(pdfBuf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuf.length,
        'Cache-Control': 'no-store',
      }
    });
  } catch (err) {
    console.error('[payslips/pdf]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── GET /api/payslips/pdf?brut=3500 (preview test) ───────────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const brut = +(searchParams.get('brut') || 3500);
  const html = buildPayslipHTML({
    emp: { fn: 'Jean', ln: 'Dupont', niss: '85.07.15-123.45', gross: brut, iban: 'BE68 5390 0754 7034', cp: '200' },
    co:  { name: 'Test SPRL', vat: 'BE 0123.456.789', onss: '123-4567890-12', address: 'Rue de la Loi 1, 1000 Bruxelles' },
    period: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  });
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
