'use client';
import { C, CR_PAT, DPER, LB, LEGAL, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, ST, TX_ONSS_E, TX_ONSS_W, Tbl, calc, f0, f2, fmt, obf, quickNet, quickPP } from '@/app/lib/helpers';
import { useState, useEffect, useCallback } from 'react';

const COMMISSION_PER_FICHE = 2;

// Shared input styles (used across RelancesModule and CommissionsModule)
const INPUT_STYLE = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(198,163,78,0.2)', background:'rgba(0,0,0,0.3)', color:'#e8e6e0', fontSize:13, fontFamily:'inherit', outline:'none' };

// ═══ CONSTANTES DROIT BELGE — RELANCES ═══
const TAUX_INTERET_LEGAL = 0.08; // 8% annuel B2B (Loi 02/08/2002, Art. 5)
const CLAUSE_PENALE_PCT = 0.10;  // 10% du principal
const CLAUSE_PENALE_MIN = 20;    // Minimum forfaitaire €20
const DELAI_RELANCE_1 = 15;      // J+15
const DELAI_RELANCE_2 = 30;      // J+30
const DELAI_MISE_EN_DEMEURE = 45; // J+45
const DELAI_MED_JOURS = 8;       // 8 jours calendrier pour mise en demeure

const RELANCE_STORAGE_KEY = 'aureus_relances';

const STATUT_COLORS = {
  attente: { bg:'rgba(107,114,128,0.08)', border:'rgba(107,114,128,0.15)', text:'#6b7280', label:'En attente', icon:'⚫' },
  relance1: { bg:'rgba(234,179,8,0.08)', border:'rgba(234,179,8,0.15)', text:'#eab308', label:'Rappel envoyé', icon:'🟡' },
  relance2: { bg:'rgba(249,115,22,0.08)', border:'rgba(249,115,22,0.15)', text:'#f97316', label:'2e rappel', icon:'🟠' },
  miseEnDemeure: { bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.15)', text:'#ef4444', label:'Mise en demeure', icon:'🔴' },
  paye: { bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.15)', text:'#22c55e', label:'Payé', icon:'✅' },
};

function calcJoursRetard(dateEcheance) {
  const now = new Date(); now.setHours(0,0,0,0);
  const ech = new Date(dateEcheance); ech.setHours(0,0,0,0);
  return Math.floor((now - ech) / 86400000);
}

function calcInterets(montant, joursRetard) {
  if (joursRetard <= 0) return 0;
  return Math.round(montant * TAUX_INTERET_LEGAL * joursRetard / 365 * 100) / 100;
}

function calcClausePenale(montant) {
  return Math.max(CLAUSE_PENALE_MIN, Math.round(montant * CLAUSE_PENALE_PCT * 100) / 100);
}

function niveauRelanceSuggere(joursRetard, statut) {
  if (statut === 'paye') return null;
  if (joursRetard >= DELAI_MISE_EN_DEMEURE) return 3;
  if (joursRetard >= DELAI_RELANCE_2) return 2;
  if (joursRetard >= DELAI_RELANCE_1) return 1;
  return null;
}

// ═══ EMAILS RELANCE ═══
function emailRelance1(clientNom, factureId, montant, dateEcheance) {
  return {
    subject: `Rappel de paiement — Facture ${factureId}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#060810;padding:20px;border-bottom:3px solid #c6a34e">
        <div style="color:#c6a34e;font-size:20px;font-weight:700;font-family:Georgia,serif">AUREUS SOCIAL PRO</div>
      </div>
      <div style="padding:24px;background:#fff;color:#1a1a1a;line-height:1.8">
        <p>Cher/Chère <b>${clientNom}</b>,</p>
        <p>Nous n'avons pas encore reçu votre paiement concernant la facture ci-dessous :</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f8f7f4"><td style="padding:10px;font-weight:600">Facture</td><td style="padding:10px">${factureId}</td></tr>
          <tr><td style="padding:10px;font-weight:600">Montant</td><td style="padding:10px;color:#c6a34e;font-weight:700">${f2(montant)} EUR</td></tr>
          <tr style="background:#f8f7f4"><td style="padding:10px;font-weight:600">Date d'échéance</td><td style="padding:10px">${new Date(dateEcheance).toLocaleDateString('fr-BE')}</td></tr>
        </table>
        <p>Nous vous saurions gré de bien vouloir procéder au règlement dans les meilleurs délais.</p>
        <p>Si le paiement a déjà été effectué, nous vous prions de ne pas tenir compte de ce rappel.</p>
        <p style="margin-top:20px">Cordialement,<br><b>Aureus Social Pro</b><br>Aureus IA SPRL — BCE BE 1028.230.781</p>
      </div>
      <div style="background:#f8f7f4;padding:12px;text-align:center;font-size:11px;color:#999">
        IBAN: BE00 0000 0000 0000 · Communication: ${factureId}
      </div>
    </div>`
  };
}

function emailRelance2(clientNom, factureId, montant, dateEcheance, joursRetard) {
  const interets = calcInterets(montant, joursRetard);
  return {
    subject: `2e rappel — Facture impayée ${factureId}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#060810;padding:20px;border-bottom:3px solid #f97316">
        <div style="color:#c6a34e;font-size:20px;font-weight:700;font-family:Georgia,serif">AUREUS SOCIAL PRO</div>
      </div>
      <div style="padding:24px;background:#fff;color:#1a1a1a;line-height:1.8">
        <p>Cher/Chère <b>${clientNom}</b>,</p>
        <p><b>Malgré notre précédent rappel, votre facture reste impayée.</b></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f8f7f4"><td style="padding:10px;font-weight:600">Facture</td><td style="padding:10px">${factureId}</td></tr>
          <tr><td style="padding:10px;font-weight:600">Montant principal</td><td style="padding:10px;font-weight:700">${f2(montant)} EUR</td></tr>
          <tr style="background:#f8f7f4"><td style="padding:10px;font-weight:600">Jours de retard</td><td style="padding:10px;color:#f97316;font-weight:700">${joursRetard} jours</td></tr>
          <tr><td style="padding:10px;font-weight:600">Intérêts de retard (8%)</td><td style="padding:10px;color:#ef4444">${f2(interets)} EUR</td></tr>
        </table>
        <p>Conformément à la <b>Loi du 02/08/2002</b> concernant la lutte contre le retard de paiement dans les transactions commerciales (Art. 5), des <b>intérêts de retard au taux légal de 8% l'an</b> sont applicables de plein droit.</p>
        <p>Nous vous invitons à régulariser cette situation dans les plus brefs délais afin d'éviter toute procédure complémentaire.</p>
        <p style="margin-top:20px">Cordialement,<br><b>Aureus Social Pro</b><br>Aureus IA SPRL — BCE BE 1028.230.781</p>
      </div>
    </div>`
  };
}

function emailMiseEnDemeure(clientNom, factureId, montant, dateEcheance, joursRetard) {
  const interets = calcInterets(montant, joursRetard);
  const penalite = calcClausePenale(montant);
  const total = montant + interets + penalite;
  return {
    subject: `MISE EN DEMEURE — Facture ${factureId}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#060810;padding:20px;border-bottom:3px solid #ef4444">
        <div style="color:#c6a34e;font-size:20px;font-weight:700;font-family:Georgia,serif">AUREUS SOCIAL PRO</div>
        <div style="color:#ef4444;font-size:12px;font-weight:700;margin-top:4px">MISE EN DEMEURE</div>
      </div>
      <div style="padding:24px;background:#fff;color:#1a1a1a;line-height:1.8">
        <p>${clientNom},</p>
        <p><b>Faute de paiement malgré nos rappels précédents, la présente vaut mise en demeure formelle.</b></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;border:2px solid #ef4444">
          <tr style="background:#fef2f2"><td style="padding:10px;font-weight:600">Facture</td><td style="padding:10px">${factureId}</td></tr>
          <tr><td style="padding:10px;font-weight:600">Principal</td><td style="padding:10px;font-weight:700">${f2(montant)} EUR</td></tr>
          <tr style="background:#fef2f2"><td style="padding:10px;font-weight:600">Intérêts de retard (8% — ${joursRetard}j)</td><td style="padding:10px;color:#ef4444">${f2(interets)} EUR</td></tr>
          <tr><td style="padding:10px;font-weight:600">Clause pénale (10%)</td><td style="padding:10px;color:#ef4444">${f2(penalite)} EUR</td></tr>
          <tr style="background:#ef4444;color:#fff"><td style="padding:12px;font-weight:700;font-size:14px">TOTAL DÛ</td><td style="padding:12px;font-weight:700;font-size:14px">${f2(total)} EUR</td></tr>
        </table>
        <p><b>Faute de paiement dans les 8 jours calendrier</b> à compter de la réception de la présente, nous nous verrons dans l'obligation de procéder au <b>recouvrement judiciaire</b> de la créance, majorée de tous frais et dépens.</p>
        <p style="font-size:12px;color:#666;margin-top:16px">
          <b>Base légale :</b><br>
          — Intérêts : Loi du 02/08/2002, Art. 5 (taux légal 8% B2B)<br>
          — Clause pénale : Art. 1226 et s. Code Civil (max 10% + min. €20)<br>
          — Prescription : Art. 2262bis C.C. (5 ans créances commerciales)
        </p>
        <p style="margin-top:20px">Veuillez agréer nos salutations distinguées.<br><b>Aureus IA SPRL</b><br>BCE BE 1028.230.781 · Saint-Gilles, Bruxelles</p>
      </div>
    </div>`
  };
}

// ═══ PDF MISE EN DEMEURE ═══
function generateMiseEnDemeurePDF(facture, relancesData) {
  const { clientNom, montant, dateEcheance, factureId } = facture;
  const joursRetard = calcJoursRetard(dateEcheance);
  const interets = calcInterets(montant, joursRetard);
  const penalite = calcClausePenale(montant);
  const total = montant + interets + penalite;
  const dateJ8 = new Date(); dateJ8.setDate(dateJ8.getDate() + 8);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto;color:#1a1a1a;font-size:11px;line-height:1.7}
    .logo{font-size:24px;font-weight:800;color:#c6a34e;font-family:Georgia,serif;margin-bottom:4px}
    .sub{font-size:10px;color:#888}
    h1{font-size:18px;margin:20px 0 10px;color:#ef4444;text-transform:uppercase;letter-spacing:1px}
    h2{font-size:13px;margin:16px 0 6px;color:#1a365d}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    th{background:#f0ece3;padding:8px;text-align:left;font-size:10px}
    td{padding:8px;border-bottom:1px solid #eee}
    .r{text-align:right;font-family:monospace}
    .total-row{background:#fef2f2;font-weight:700;font-size:13px}
    .legal{font-size:9px;color:#666;margin-top:16px;padding:12px;background:#f9f9f9;border-left:3px solid #c6a34e}
    .footer{margin-top:30px;font-size:9px;color:#999;border-top:1px solid #eee;padding-top:10px}
    .stamp{margin-top:30px;display:flex;justify-content:space-between}
    .sig-box{width:45%;border-top:1px solid #999;padding-top:6px;font-size:9px;color:#666}
    @media print{button{display:none!important}}
  </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div class="logo">AUREUS SOCIAL PRO</div>
        <div class="sub">Aureus IA SPRL</div>
        <div class="sub">BCE BE 1028.230.781</div>
        <div class="sub">Saint-Gilles, Bruxelles</div>
        <div class="sub">info@aureus-ia.com</div>
      </div>
      <div style="text-align:right">
        <h1 style="margin:0;font-size:22px">MISE EN DEMEURE</h1>
        <div class="sub">Date: ${new Date().toLocaleDateString('fr-BE')}</div>
        <div class="sub">Ref: MED-${factureId}</div>
      </div>
    </div>

    <div style="margin:20px 0;padding:14px;background:#f8f7f4;border-radius:6px;border-left:4px solid #ef4444">
      <div style="font-weight:700;font-size:12px;margin-bottom:4px">DESTINATAIRE :</div>
      <div>${clientNom}</div>
    </div>

    <div style="margin:16px 0">
      <p>Madame, Monsieur,</p>
      <p style="margin-top:10px">Malgré nos précédents rappels, nous constatons que la (les) facture(s) ci-dessous reste(nt) impayée(s) à ce jour.</p>
      <p style="margin-top:10px"><b>La présente constitue une mise en demeure formelle de payer.</b></p>
    </div>

    <h2>DÉTAIL DE LA CRÉANCE</h2>
    <table>
      <tr><th>Description</th><th class="r">Montant</th></tr>
      <tr><td>Facture ${factureId} — Échéance ${new Date(dateEcheance).toLocaleDateString('fr-BE')}</td><td class="r">${f2(montant)} EUR</td></tr>
      <tr><td>Intérêts de retard — ${joursRetard} jours × 8% l'an (Loi 02/08/2002, Art. 5)</td><td class="r">${f2(interets)} EUR</td></tr>
      <tr><td>Clause pénale — 10% du principal (min. €20,00)</td><td class="r">${f2(penalite)} EUR</td></tr>
      <tr class="total-row"><td><b>TOTAL DÛ</b></td><td class="r" style="color:#ef4444;font-size:14px"><b>${f2(total)} EUR</b></td></tr>
    </table>

    <div style="margin:16px 0;padding:14px;background:#fef2f2;border:2px solid #ef4444;border-radius:6px;font-size:11px">
      <b>FAUTE DE PAIEMENT INTÉGRAL DANS LES 8 JOURS CALENDRIER</b> suivant la réception de la présente
      (soit au plus tard le <b>${dateJ8.toLocaleDateString('fr-BE')}</b>), nous nous verrons dans l'obligation
      d'engager une procédure de <b>recouvrement judiciaire</b>, sans autre avis ni mise en demeure préalable.
      Les frais de recouvrement, y compris les honoraires d'avocat, seront entièrement à votre charge.
    </div>

    <h2>MODALITÉS DE PAIEMENT</h2>
    <table>
      <tr><td style="font-weight:600">IBAN</td><td>${typeof window !== 'undefined' && window.__AUREUS_IBAN || 'À configurer dans les paramètres'}</td></tr>
      <tr><td style="font-weight:600">BIC</td><td>${typeof window !== 'undefined' && window.__AUREUS_BIC || 'À configurer dans les paramètres'}</td></tr>
      <tr><td style="font-weight:600">Communication</td><td>${factureId}</td></tr>
      <tr><td style="font-weight:600">Montant à virer</td><td style="font-weight:700;color:#ef4444">${f2(total)} EUR</td></tr>
    </table>

    <div class="legal">
      <b>Base légale applicable :</b><br>
      — <b>Intérêts de retard :</b> Loi du 02/08/2002 concernant la lutte contre le retard de paiement dans les transactions commerciales, Art. 5 — Taux d'intérêt légal B2B : 8% l'an.<br>
      — <b>Clause pénale :</b> Art. 1226 et suivants du Code Civil — Indemnité forfaitaire de 10% du montant principal impayé avec un minimum de €20,00.<br>
      — <b>Prescription :</b> Art. 2262bis du Code Civil — Les créances commerciales se prescrivent par 5 ans.<br>
      — <b>Délai mise en demeure :</b> 8 jours calendrier (usage commercial belge).
    </div>

    <div class="stamp">
      <div class="sig-box">
        <div>Fait à Bruxelles, le ${new Date().toLocaleDateString('fr-BE')}</div>
        <div style="margin-top:30px">Pour Aureus IA SPRL</div>
        <div style="margin-top:6px;font-style:italic">Le Gérant</div>
      </div>
    </div>

    <div class="footer">
      Aureus IA SPRL — BCE BE 1028.230.781 — TVA BE 1028.230.781<br>
      Ce document constitue une mise en demeure au sens de l'article 1153 du Code Civil.
    </div>

    <div style="text-align:center;margin-top:20px">
      <button onclick="window.print()" style="padding:10px 30px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">Imprimer / Enregistrer PDF</button>
    </div>
  </body></html>`;
  const w = window.open('','_blank');
  if(w){ w.document.write(html); w.document.close(); }
  else { alert('Le popup a été bloqué. Autorisez les popups pour générer le PDF de mise en demeure.'); }
}


// ═══ MODULE RELANCES ═══
function RelancesModule({ factures, sendEmailFn }) {
  const [relances, setRelances] = useState({});
  const [filter, setFilter] = useState('all');
  const [sending, setSending] = useState(null);

  useEffect(() => {
    try {
      const raw = null; // localStorage supprimé — données relances chargées depuis Supabase
      if(raw) setRelances(JSON.parse(raw));
    } catch(e) {}
  }, []);

  const saveRelances = useCallback((updated) => {
    setRelances(updated);
    // Relances persistées en mémoire uniquement — sync via Supabase
  }, []);

  // Synchroniser les factures existantes avec les relances
  const allFactures = (factures || []).map(f => {
    const existing = relances[f.id] || {};
    const joursRetard = calcJoursRetard(f.echeance);
    const statut = existing.statut || (f.status === 'paid' ? 'paye' : 'attente');
    return {
      factureId: f.id,
      clientId: f.clientId || f.id,
      clientNom: f.client || 'Client',
      clientEmail: f.clientEmail || '',
      montant: f.ttc || f.montant || 0,
      dateEcheance: f.echeance,
      joursRetard,
      relances: existing.relances || [],
      statut,
      datePaiement: existing.datePaiement || (f.status === 'paid' ? f.paidAt || new Date().toISOString() : null),
      niveauSuggere: statut === 'paye' ? null : niveauRelanceSuggere(joursRetard, statut),
    };
  });

  const envoyerRelance = async (facture, niveau) => {
    setSending(facture.factureId);
    let emailData;
    const joursRetard = calcJoursRetard(facture.dateEcheance);
    if (niveau === 1) {
      emailData = emailRelance1(facture.clientNom, facture.factureId, facture.montant, facture.dateEcheance);
    } else if (niveau === 2) {
      emailData = emailRelance2(facture.clientNom, facture.factureId, facture.montant, facture.dateEcheance, joursRetard);
    } else {
      emailData = emailMiseEnDemeure(facture.clientNom, facture.factureId, facture.montant, facture.dateEcheance, joursRetard);
    }

    const statutMap = { 1:'relance1', 2:'relance2', 3:'miseEnDemeure' };
    try {
      if (sendEmailFn && facture.clientEmail) {
        await sendEmailFn(facture.clientEmail, emailData.subject, emailData.html, []);
      }
    } catch(e) {}

    const updated = { ...relances };
    updated[facture.factureId] = {
      clientId: facture.clientId,
      clientNom: facture.clientNom,
      montant: facture.montant,
      dateEcheance: facture.dateEcheance,
      relances: [...(facture.relances || []), { niveau, date: new Date().toISOString(), envoyePar: 'admin' }],
      statut: statutMap[niveau],
      datePaiement: null,
    };
    saveRelances(updated);
    setSending(null);
  };

  const marquerPaye = (factureId) => {
    const updated = { ...relances };
    const existing = updated[factureId] || {};
    updated[factureId] = {
      ...existing,
      statut: 'paye',
      datePaiement: new Date().toISOString(),
    };
    saveRelances(updated);
  };

  const relancerTous = async () => {
    const aRelancer = allFactures.filter(f => f.statut !== 'paye' && f.niveauSuggere && f.joursRetard > 0);
    if (!aRelancer.length) return alert('Aucune facture à relancer.');
    if (!confirm(`Envoyer ${aRelancer.length} relance(s) automatique(s) ?`)) return;
    for (const f of aRelancer) {
      await envoyerRelance(f, f.niveauSuggere);
    }
  };

  // ═══ KPIs ═══
  const totalImpaye = allFactures.filter(f => f.statut !== 'paye').reduce((a, f) => a + f.montant, 0);
  const nbRelance1 = allFactures.filter(f => f.statut === 'relance1').length;
  const nbRelance2 = allFactures.filter(f => f.statut === 'relance2').length;
  const nbMED = allFactures.filter(f => f.statut === 'miseEnDemeure').length;
  const nbPaye = allFactures.filter(f => f.statut === 'paye').length;
  const tauxRecouvrement = allFactures.length > 0 ? Math.round(nbPaye / allFactures.length * 100) : 0;

  const filtered = filter === 'all' ? allFactures :
    filter === 'retard' ? allFactures.filter(f => f.joursRetard > 0 && f.statut !== 'paye') :
    allFactures.filter(f => f.statut === filter);

  const iS = INPUT_STYLE;

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#c6a34e', margin:0 }}>📨 Relances Facturation</h2>
          <p style={{ fontSize:12, color:'#9e9b93', margin:'4px 0 0' }}>
            Suivi des factures impayées — Droit belge (Loi 02/08/2002)
          </p>
        </div>
        <button onClick={relancerTous} style={{ padding:'10px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          📨 Relancer tous
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, margin:'20px 0' }}>
        {[
          { l:'Total impayé', v:fmt(totalImpaye), c: totalImpaye > 0 ? '#ef4444' : '#22c55e' },
          { l:'Relance 1', v:nbRelance1, c:'#eab308' },
          { l:'Relance 2', v:nbRelance2, c:'#f97316' },
          { l:'Mise en demeure', v:nbMED, c:'#ef4444' },
          { l:'Payé', v:nbPaye, c:'#22c55e' },
          { l:'Taux recouvrement', v:tauxRecouvrement+'%', c: tauxRecouvrement >= 80 ? '#22c55e' : tauxRecouvrement >= 50 ? '#eab308' : '#ef4444' },
        ].map((k,i) => (
          <div key={i} style={{ padding:'16px 14px', background:'rgba(198,163,78,0.04)', borderRadius:12, border:`1px solid ${k.c}20`, textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#5e5c56', textTransform:'uppercase', letterSpacing:1 }}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.c, marginTop:6 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { v:'all', l:'Toutes', c:allFactures.length },
          { v:'retard', l:'En retard', c:allFactures.filter(f=>f.joursRetard>0&&f.statut!=='paye').length },
          { v:'attente', l:'En attente', c:allFactures.filter(f=>f.statut==='attente').length },
          { v:'relance1', l:'Relance 1', c:nbRelance1 },
          { v:'relance2', l:'Relance 2', c:nbRelance2 },
          { v:'miseEnDemeure', l:'Mise en demeure', c:nbMED },
          { v:'paye', l:'Payé', c:nbPaye },
        ].map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)} style={{
            padding:'6px 14px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight: filter===t.v ? 600 : 400,
            border: filter===t.v ? '1px solid rgba(198,163,78,0.3)' : '1px solid rgba(255,255,255,0.06)',
            background: filter===t.v ? 'rgba(198,163,78,0.08)' : 'transparent',
            color: filter===t.v ? '#c6a34e' : '#5e5c56',
          }}>
            {t.l} ({t.c})
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ border:'1px solid rgba(198,163,78,0.1)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'180px 120px 100px 100px 90px 130px 1fr', padding:'10px 12px', background:'rgba(198,163,78,0.04)', fontSize:9, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.5 }}>
          <div>Client</div><div>Facture</div><div>Montant</div><div>Échéance</div><div>Jours retard</div><div>Statut relance</div><div>Actions</div>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'#5e5c56', fontSize:12 }}>
            Aucune facture dans cette catégorie.
          </div>
        )}

        {filtered.map((f, i) => {
          const st = STATUT_COLORS[f.statut] || STATUT_COLORS.attente;
          const isPaye = f.statut === 'paye';
          const interets = calcInterets(f.montant, f.joursRetard);
          const penalite = f.statut === 'miseEnDemeure' ? calcClausePenale(f.montant) : 0;
          return (
            <div key={f.factureId} style={{
              display:'grid', gridTemplateColumns:'180px 120px 100px 100px 90px 130px 1fr',
              padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.03)',
              fontSize:11, alignItems:'center',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ fontWeight:600, color:'#e8e6e0' }}>{f.clientNom}</div>
              <div style={{ color:'#c6a34e', fontWeight:600, fontSize:10 }}>{f.factureId}</div>
              <div>
                <div style={{ color:'#e8e6e0', fontWeight:600 }}>{f2(f.montant)}</div>
                {interets > 0 && !isPaye && <div style={{ fontSize:9, color:'#ef4444' }}>+{f2(interets)} int.</div>}
              </div>
              <div style={{ color:'#9e9b93', fontSize:10 }}>{new Date(f.dateEcheance).toLocaleDateString('fr-BE')}</div>
              <div style={{
                fontWeight:700, fontSize:12,
                color: isPaye ? '#22c55e' : f.joursRetard > 30 ? '#ef4444' : f.joursRetard > 15 ? '#f97316' : f.joursRetard > 0 ? '#eab308' : '#6b7280',
              }}>
                {isPaye ? '-' : f.joursRetard > 0 ? f.joursRetard+'j' : '-'}
              </div>
              <div>
                <span style={{
                  padding:'3px 10px', borderRadius:6, fontSize:9, fontWeight:600,
                  background:st.bg, border:`1px solid ${st.border}`, color:st.text,
                }}>
                  {st.icon} {st.label}
                </span>
                {f.relances.length > 0 && (
                  <div style={{ fontSize:8, color:'#5e5c56', marginTop:3 }}>
                    Dernière: {new Date(f.relances[f.relances.length-1].date).toLocaleDateString('fr-BE')}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {!isPaye && f.joursRetard > 0 && (
                  <>
                    {f.niveauSuggere === 1 && (
                      <button onClick={() => envoyerRelance(f, 1)} disabled={sending===f.factureId}
                        style={{ padding:'4px 8px', borderRadius:4, border:'none', background:'rgba(234,179,8,0.1)', color:'#eab308', fontSize:9, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                        {sending===f.factureId ? '...' : '📧 Rappel 1'}
                      </button>
                    )}
                    {f.niveauSuggere === 2 && (
                      <button onClick={() => envoyerRelance(f, 2)} disabled={sending===f.factureId}
                        style={{ padding:'4px 8px', borderRadius:4, border:'none', background:'rgba(249,115,22,0.1)', color:'#f97316', fontSize:9, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                        {sending===f.factureId ? '...' : '📧 Rappel 2'}
                      </button>
                    )}
                    {f.niveauSuggere === 3 && (
                      <>
                        <button onClick={() => envoyerRelance(f, 3)} disabled={sending===f.factureId}
                          style={{ padding:'4px 8px', borderRadius:4, border:'none', background:'rgba(239,68,68,0.1)', color:'#ef4444', fontSize:9, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                          {sending===f.factureId ? '...' : '📧 Mise en demeure'}
                        </button>
                        <button onClick={() => generateMiseEnDemeurePDF(f)}
                          style={{ padding:'4px 8px', borderRadius:4, border:'none', background:'rgba(239,68,68,0.06)', color:'#ef4444', fontSize:9, cursor:'pointer', fontFamily:'inherit' }}>
                          📄 PDF
                        </button>
                      </>
                    )}
                    {/* Toujours permettre les niveaux précédents si pas encore envoyés */}
                    {f.niveauSuggere > 1 && !f.relances.some(r=>r.niveau===1) && (
                      <button onClick={() => envoyerRelance(f, 1)} style={{ padding:'4px 6px', borderRadius:4, border:'none', background:'rgba(234,179,8,0.06)', color:'#eab308', fontSize:8, cursor:'pointer', fontFamily:'inherit' }}>
                        R1
                      </button>
                    )}
                    {f.niveauSuggere > 2 && !f.relances.some(r=>r.niveau===2) && (
                      <button onClick={() => envoyerRelance(f, 2)} style={{ padding:'4px 6px', borderRadius:4, border:'none', background:'rgba(249,115,22,0.06)', color:'#f97316', fontSize:8, cursor:'pointer', fontFamily:'inherit' }}>
                        R2
                      </button>
                    )}
                    <button onClick={() => marquerPaye(f.factureId)}
                      style={{ padding:'4px 8px', borderRadius:4, border:'none', background:'rgba(34,197,94,0.08)', color:'#22c55e', fontSize:9, cursor:'pointer', fontFamily:'inherit' }}>
                      ✅ Payé
                    </button>
                  </>
                )}
                {isPaye && f.datePaiement && (
                  <span style={{ fontSize:9, color:'#22c55e' }}>
                    Payé le {new Date(f.datePaiement).toLocaleDateString('fr-BE')}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Ligne total */}
        {filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'180px 120px 100px 100px 90px 130px 1fr', padding:'12px', background:'rgba(198,163,78,0.04)', fontSize:12, fontWeight:700, borderTop:'2px solid rgba(198,163,78,0.15)' }}>
            <div style={{ color:'#c6a34e' }}>TOTAL ({filtered.length})</div>
            <div></div>
            <div style={{ color:'#e8e6e0' }}>{f2(filtered.reduce((a,f)=>a+f.montant,0))}</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </div>

      {/* Légende droit belge */}
      <div style={{ marginTop:16, padding:12, background:'rgba(198,163,78,0.04)', borderRadius:8, border:'1px solid rgba(198,163,78,0.08)', fontSize:10, color:'#9e9b93', lineHeight:1.7 }}>
        <b style={{ color:'#c6a34e' }}>Droit belge applicable :</b><br/>
        J+15 = Rappel amical · J+30 = Rappel ferme + intérêts 8% (Loi 02/08/2002, Art. 5) · J+45 = Mise en demeure + clause pénale 10% (min. €20)<br/>
        Délai mise en demeure : 8 jours calendrier · Prescription créances commerciales : 5 ans (Art. 2262bis C.C.)
      </div>
    </div>
  );
}


export default function CommissionsModuleWrapped({ s, d, tab }) {
  const TAB_META = {
    checklistclient:  { icon:'✅', title:'Checklist Client',      sub:'Vérifications onboarding nouveau client', mainTab:'commissions' },
    comparatif:       { icon:'⚔️', title:'Comparatif Marché',     sub:'Analyse concurrentielle secrétariats sociaux', mainTab:'commissions' },
    fiduciaire:       { icon:'🏢', title:'Hub Fiduciaire',        sub:'Gestion du portefeuille fiduciaire', mainTab:'commissions' },
    guidecommercial:  { icon:'📊', title:'Guide Commercial',      sub:'Scripts et argumentaires de vente', mainTab:'commissions' },
    guidefiduciaire:  { icon:'📖', title:'Guide Fiduciaire',      sub:'Guide d\'intégration pour fiduciaires', mainTab:'commissions' },
    landing:          { icon:'🌐', title:'Page Commerciale',      sub:'Landing page et matériaux marketing', mainTab:'commissions' },
    parserConcurrent: { icon:'🔍', title:'Audit Concurrent',      sub:'Analyse des contrats concurrents', mainTab:'relances' },
    repriseclient:    { icon:'🔄', title:'Reprise Concurrent',    sub:'Processus de reprise client SD Worx / Securex', mainTab:'relances' },
  };
  const meta = TAB_META[tab];
  const mappedTab = meta?.mainTab || 'commissions';
  return (
    <div>
      {meta && (
        <div style={{marginBottom:12,padding:'10px 16px',background:'rgba(198,163,78,.03)',
          borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <h2 style={{color:'#c6a34e',margin:'0 0 2px',fontSize:16}}>{meta.icon} {meta.title}</h2>
          <p style={{color:'#5e5c56',margin:0,fontSize:11}}>{meta.sub}</p>
        </div>
      )}
      <CommissionsModule userRole="admin" user={s?.user} factures={s?.factures||[]} sendEmailFn={null} defaultTab={mappedTab} />
    </div>
  );
}

function CommissionsModule({ userRole, user, factures, sendEmailFn, defaultTab }) {
  const [commissions, setCommissions] = useState({});
  const [selectedCommercial, setSelectedCommercial] = useState(null);
  const [tab, setTab] = useState('pending');
  const [mainTab, setMainTab] = useState(defaultTab || 'commissions');
  const [showAddTest, setShowAddTest] = useState(false);
  const [testData, setTestData] = useState({ email:'', client:'', fiches:10, period:'' });
  const isAdmin = userRole==='admin' || userRole==='gestionnaire';
  const isCommercial = userRole==='commercial';
  const userEmail = user?.email?.toLowerCase() || '';

  useEffect(() => {
    // localStorage supprimé — commissions chargées depuis Supabase via props ou state parent
  }, []);

  const save = useCallback((updated) => {
    setCommissions(updated);
    // Commissions persistées en mémoire — sync Supabase via le state parent
  }, []);

  // Admin: marquer une commission comme payée (client a payé -> commission verte)
  const markPaid = (email, entryId) => {
    const updated = { ...commissions };
    if(!updated[email]) return;
    updated[email] = { ...updated[email],
      entries: updated[email].entries.map(e =>
        e.id===entryId ? { ...e, status:'paid', paidAt:new Date().toISOString() } : e
      )
    };
    updated[email].paid = updated[email].entries.filter(e=>e.status==='paid').reduce((a,e)=>a+e.amount,0);
    save(updated);
  };

  // Admin: payer toutes les commissions en attente d'un commercial
  const markAllPaid = (email) => {
    if(!confirm(`Marquer TOUTES les commissions de ${email} comme payées ?\n(= le client a payé ses factures)`)) return;
    const updated = { ...commissions };
    if(!updated[email]) return;
    const now = new Date().toISOString();
    updated[email] = { ...updated[email],
      entries: updated[email].entries.map(e => e.status==='pending' ? { ...e, status:'paid', paidAt:now } : e)
    };
    updated[email].paid = updated[email].entries.reduce((a,e)=>a+e.amount,0);
    save(updated);
  };

  // Admin: ajouter manuellement une commission (pour test ou rattrapage)
  const addCommission = () => {
    if(!testData.email.trim() || !testData.client.trim()) return alert('Email commercial + nom client requis');
    const email = testData.email.toLowerCase().trim();
    const entry = {
      id: 'COM_'+Date.now(),
      clientName: testData.client,
      period: testData.period || new Date().toLocaleDateString('fr-BE',{month:'long',year:'numeric'}),
      fichesCount: parseInt(testData.fiches)||1,
      amount: (parseInt(testData.fiches)||1) * COMMISSION_PER_FICHE,
      status: 'pending',
      date: new Date().toISOString(),
    };
    const updated = { ...commissions };
    if(!updated[email]) updated[email] = { total:0, paid:0, entries:[] };
    updated[email].entries.push(entry);
    updated[email].total = updated[email].entries.reduce((a,e)=>a+e.amount,0);
    updated[email].paid = updated[email].entries.filter(e=>e.status==='paid').reduce((a,e)=>a+e.amount,0);
    save(updated);
    setTestData({ email:'', client:'', fiches:10, period:'' });
    setShowAddTest(false);
    setSelectedCommercial(email);
  };

  const commercials = Object.entries(commissions);
  const myData = isCommercial ? commissions[userEmail] : null;
  const viewData = selectedCommercial ? commissions[selectedCommercial] : null;
  const globalTotal = commercials.reduce((a,[,c])=>a+(c.total||0),0);
  const globalPaid = commercials.reduce((a,[,c])=>a+(c.paid||0),0);
  const globalPending = globalTotal - globalPaid;
  const totalFiches = commercials.reduce((a,[,c])=>a+c.entries.reduce((b,e)=>b+e.fichesCount,0),0);

  const iS = INPUT_STYLE;

  const KPIs = (items) => (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)`, gap:12, marginBottom:24 }}>
      {items.map((k,i) => (<div key={i} style={{ padding:'16px 20px', background:'rgba(198,163,78,0.04)', borderRadius:12, border:'1px solid rgba(198,163,78,0.08)' }}><div style={{ fontSize:10, color:'#5e5c56', textTransform:'uppercase', letterSpacing:1 }}>{k.l}</div><div style={{ fontSize:22, fontWeight:700, color:k.c, marginTop:6 }}>{k.v}</div></div>))}
    </div>
  );

  const EntryRow = ({ e, showPay, email }) => {
    const isPaid = e.status==='paid';
    return (
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px 14px', marginBottom:6, borderRadius:10,
        background: isPaid ? 'rgba(34,197,94,0.04)' : 'rgba(234,179,8,0.04)',
        border: `1px solid ${isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)'}`,
      }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{isPaid ? '🟢' : '🟡'}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#e8e6e0' }}>{e.clientName}</div>
              <div style={{ fontSize:11, color:'#9e9b93' }}>
                {e.period} · {e.fichesCount} fiche{e.fichesCount>1?'s':''} × {COMMISSION_PER_FICHE}€
              </div>
              <div style={{ fontSize:10, color:'#5e5c56' }}>
                {new Date(e.date).toLocaleDateString('fr-BE')}
                {e.paidAt && <span style={{ color:'#22c55e', fontWeight:600 }}> · ✅ Client payé le {new Date(e.paidAt).toLocaleDateString('fr-BE')}</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:18, fontWeight:700, color: isPaid ? '#22c55e' : '#eab308' }}>
              {fmt(e.amount)}
            </div>
            <div style={{ fontSize:9, color: isPaid ? '#22c55e' : '#eab308', fontWeight:600 }}>
              {isPaid ? '✅ PAYÉ' : '⏳ EN ATTENTE'}
            </div>
          </div>
          {showPay && !isPaid && (
            <button onClick={() => markPaid(email, e.id)} title="Client a payé -> commission validée"
              style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'rgba(34,197,94,0.15)', color:'#22c55e', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              💸 Valider
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══ VUE COMMERCIAL ═══
  if(isCommercial) {
    const data = myData || { total:0, paid:0, entries:[] };
    const pending = data.total - data.paid;
    const pendingEntries = data.entries.filter(e=>e.status==='pending');
    const paidEntries = data.entries.filter(e=>e.status==='paid');
    return (
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#f97316', margin:'0 0 4px' }}>💰 Mes Commissions</h2>
        <p style={{ fontSize:12, color:'#9e9b93', margin:'0 0 20px' }}>{COMMISSION_PER_FICHE}€ par fiche de paie · 🟢 Vert = client a payé · 🟡 Jaune = en attente</p>
        {KPIs([
          { l:'Total gagné', v:fmt(data.total), c:'#f97316' },
          { l:'À recevoir', v:fmt(pending), c: pending>0?'#eab308':'#22c55e' },
          { l:'Déjà payé', v:fmt(data.paid), c:'#22c55e' },
          { l:'Fiches générées', v:data.entries.reduce((a,e)=>a+e.fichesCount,0), c:'#60a5fa' },
        ])}
        {pendingEntries.length>0 && <>
          <h3 style={{ fontSize:14, color:'#eab308', fontWeight:600, marginBottom:10 }}>🟡 En attente de paiement client ({pendingEntries.length})</h3>
          {pendingEntries.map(e => <EntryRow key={e.id} e={e}/>)}
        </>}
        {paidEntries.length>0 && <>
          <h3 style={{ fontSize:14, color:'#22c55e', fontWeight:600, marginBottom:10, marginTop:24 }}>🟢 Client a payé — Commission validée ({paidEntries.length})</h3>
          {paidEntries.map(e => <EntryRow key={e.id} e={e}/>)}
        </>}
        {data.entries.length===0 && <div style={{ background:'rgba(198,163,78,0.03)', border:'1px solid rgba(198,163,78,0.1)', borderRadius:12, textAlign:'center', padding:60, color:'#5e5c56' }}><div style={{ fontSize:48, marginBottom:12 }}>💰</div><div style={{ fontSize:16, fontWeight:600 }}>Pas encore de commissions</div><div style={{ fontSize:13, marginTop:8 }}>Elles apparaîtront quand les fiches de vos clients seront générées.</div></div>}
      </div>
    );
  }

  // ═══ VUE ADMIN — TABS COMMISSIONS / RELANCES ═══
  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      {/* Tab switcher */}
      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {[
          { v:'commissions', l:'💰 Commissions', c:'#f97316' },
          { v:'relances', l:'📨 Relances', c:'#ef4444' },
        ].map(t => (
          <button key={t.v} onClick={() => setMainTab(t.v)} style={{
            padding:'10px 24px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight: mainTab===t.v ? 700 : 400,
            border: mainTab===t.v ? `2px solid ${t.c}40` : '2px solid rgba(255,255,255,0.06)',
            background: mainTab===t.v ? `${t.c}10` : 'transparent',
            color: mainTab===t.v ? t.c : '#5e5c56',
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ═══ ONGLET RELANCES ═══ */}
      {mainTab === 'relances' && (
        <RelancesModule factures={factures} sendEmailFn={sendEmailFn} />
      )}

      {/* ═══ ONGLET COMMISSIONS ═══ */}
      {mainTab === 'commissions' && <>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#c6a34e', margin:0 }}>💰 Commissions Commerciales</h2>
          <button onClick={() => setShowAddTest(!showAddTest)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#c6a34e,#a68a3c)', color:'#0a0e1a', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {showAddTest ? '✕ Annuler' : '+ Ajouter commission'}
          </button>
        </div>
        <p style={{ fontSize:12, color:'#9e9b93', margin:'0 0 20px' }}>
          {COMMISSION_PER_FICHE}€/fiche · {commercials.length} commerciaux · 🟢 = client payé · 🟡 = en attente
        </p>

        {KPIs([
          { l:'Total commissions', v:fmt(globalTotal), c:'#f97316' },
          { l:'À payer', v:fmt(globalPending), c: globalPending>0?'#eab308':'#22c55e' },
          { l:'Déjà payé', v:fmt(globalPaid), c:'#22c55e' },
          { l:'Total fiches', v:totalFiches, c:'#60a5fa' },
        ])}

        {/* Formulaire ajout commission */}
        {showAddTest && (
          <div style={{ background:'rgba(198,163,78,0.03)', border:'2px solid rgba(198,163,78,0.3)', borderRadius:12, padding:24, marginBottom:20 }}>
            <h3 style={{ margin:'0 0 14px', color:'#c6a34e', fontSize:15 }}>➕ Ajouter une commission</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:14 }}>
              <div><label style={{ fontSize:11, color:'#9e9b93', display:'block', marginBottom:4 }}>Email commercial *</label><input value={testData.email} onChange={e=>setTestData({...testData,email:e.target.value})} placeholder="commercial@email.be" style={iS}/></div>
              <div><label style={{ fontSize:11, color:'#9e9b93', display:'block', marginBottom:4 }}>Nom client *</label><input value={testData.client} onChange={e=>setTestData({...testData,client:e.target.value})} placeholder="SPRL Dupont" style={iS}/></div>
              <div><label style={{ fontSize:11, color:'#9e9b93', display:'block', marginBottom:4 }}>Nombre fiches</label><input type="number" value={testData.fiches} onChange={e=>setTestData({...testData,fiches:e.target.value})} min="1" style={iS}/></div>
              <div><label style={{ fontSize:11, color:'#9e9b93', display:'block', marginBottom:4 }}>Période</label><input value={testData.period} onChange={e=>setTestData({...testData,period:e.target.value})} placeholder="Février 2026" style={iS}/></div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:'#f97316', fontWeight:600 }}>
                Commission: {(parseInt(testData.fiches)||1)} × {COMMISSION_PER_FICHE}€ = {fmt((parseInt(testData.fiches)||1)*COMMISSION_PER_FICHE)}
              </div>
              <button onClick={addCommission} style={{ padding:'8px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#c6a34e,#a68a3c)', color:'#0a0e1a', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                ✅ Ajouter
              </button>
            </div>
          </div>
        )}

        {commercials.length===0 && !showAddTest && <div style={{ background:'rgba(198,163,78,0.03)', border:'1px solid rgba(198,163,78,0.1)', borderRadius:12, textAlign:'center', padding:60, color:'#5e5c56' }}><div style={{ fontSize:48, marginBottom:12 }}>💰</div><div style={{ fontSize:16, fontWeight:600 }}>Aucune commission</div><div style={{ fontSize:13, marginTop:8 }}>Ajoutez manuellement ou elles seront créées lors de la distribution des fiches.</div></div>}

        {/* Liste commerciaux + détail */}
        <div style={{ display:'grid', gridTemplateColumns: selectedCommercial ? '1fr 1.2fr' : '1fr', gap:20 }}>
          <div>
            {commercials.map(([email, data]) => {
              const pending = data.total - data.paid;
              const pendingCount = data.entries.filter(e=>e.status==='pending').length;
              const paidCount = data.entries.filter(e=>e.status==='paid').length;
              return (
                <div key={email} onClick={() => setSelectedCommercial(selectedCommercial===email?null:email)} style={{
                  background:'rgba(198,163,78,0.03)', border:`1px solid ${selectedCommercial===email?'rgba(249,115,22,0.4)':'rgba(198,163,78,0.1)'}`,
                  borderRadius:12, padding:16, marginBottom:10, cursor:'pointer',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, color:'#e8e6e0' }}>📈 {email}</div>
                      <div style={{ display:'flex', gap:12, marginTop:6, fontSize:11 }}>
                        <span style={{ color:'#f97316' }}>Total: {fmt(data.total)}</span>
                        {pendingCount>0 && <span style={{ color:'#eab308' }}>🟡 {pendingCount} en attente ({fmt(pending)})</span>}
                        {paidCount>0 && <span style={{ color:'#22c55e' }}>🟢 {paidCount} payé{paidCount>1?'s':''}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:22, fontWeight:700, color:'#f97316' }}>{fmt(data.total)}</div>
                      {pendingCount>0 && <button onClick={e=>{e.stopPropagation();markAllPaid(email);}} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(34,197,94,0.12)', color:'#22c55e', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:4 }}>💸 Tout valider ({pendingCount})</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel détail */}
          {selectedCommercial && viewData && (
            <div style={{ background:'rgba(198,163,78,0.03)', border:'1px solid rgba(198,163,78,0.1)', borderRadius:12, padding:20, position:'sticky', top:20, alignSelf:'start', maxHeight:'85vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ margin:0, color:'#f97316', fontSize:16 }}>📈 {selectedCommercial}</h3>
                <button onClick={() => setSelectedCommercial(null)} style={{ background:'none', border:'none', color:'#5e5c56', cursor:'pointer', fontSize:18 }}>✕</button>
              </div>

              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {[{v:'pending',l:'🟡 En attente'},{v:'paid',l:'🟢 Payé'}].map(t => (
                  <button key={t.v} onClick={() => setTab(t.v)} style={{
                    padding:'6px 14px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:tab===t.v?600:400,
                    border: tab===t.v ? '1px solid rgba(198,163,78,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    background: tab===t.v ? 'rgba(198,163,78,0.08)' : 'transparent',
                    color: tab===t.v ? '#c6a34e' : '#5e5c56',
                  }}>
                    {t.l} ({viewData.entries.filter(e=>e.status===t.v).length})
                  </button>
                ))}
              </div>

              {viewData.entries.filter(e=>e.status===tab).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e =>
                <EntryRow key={e.id} e={e} showPay={true} email={selectedCommercial}/>
              )}

              {viewData.entries.filter(e=>e.status===tab).length===0 && (
                <div style={{ textAlign:'center', padding:30, color:'#5e5c56', fontSize:12 }}>
                  {tab==='pending' ? '✅ Aucune commission en attente' : 'Pas encore de paiements'}
                </div>
              )}
            </div>
          )}
        </div>
      </>}
    </div>
  );
}
