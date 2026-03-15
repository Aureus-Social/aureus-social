// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CRON VEILLE LÉGALE BELGE — VERSION COMPLÈTE
// Vercel Cron : chaque jour à 06h15 CET (vercel.json: "15 5 * * *" UTC)
// 25 sources officielles surveillées — auto-patch lois-belges.js si changement
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET   = process.env.CRON_SECRET;
const ALERT_EMAIL   = 'info@aureus-ia.com';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const SOURCES = [
  // ONSS
  { id:'onss_cotisations', name:'ONSS — Taux cotisations (13,07%/25,07%)', url:'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/contributions/contributions.html', cat:'ONSS', impact:'TX_ONSS_W, TX_ONSS_E' },
  { id:'onss_indexation', name:'ONSS — Indexation & plafonds 2026', url:'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/contributions/indexation.html', cat:'ONSS', impact:'plafondONSS, indexation' },
  { id:'onss_reductions', name:'ONSS — Réductions groupes cibles', url:'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/reductions/structural.html', cat:'ONSS', impact:'réductions bas salaires, jeunes, seniors' },
  // PP
  { id:'spf_baremes_pp', name:'SPF Finances — Barèmes PP (tranches, quotité)', url:'https://finances.belgium.be/fr/particuliers/impots_sur_le_revenu/precompte_professionnel/tarifs', cat:'PP', impact:'ppTranche1/2/3, quotiteExemptee' },
  { id:'spf_pp_calcul', name:'SPF Finances — Méthode calcul PP (Annexe III)', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/calcul', cat:'PP', impact:'fraisPro max, reductionsEnfants' },
  { id:'spf_bonus_emploi', name:'SPF Finances — Bonus à l\'emploi', url:'https://finances.belgium.be/fr/particuliers/avantages_fiscaux/bonus-emploi', cat:'PP', impact:'bonusEmploiMax, seuilBrut1/2' },
  // Salaires
  { id:'rmmmg_cnt', name:'CNT — RMMMG salaire minimum (2.080,48€)', url:'https://cnt-nar.be/fr/salaires-baremes-primes/salaire-minimum-interprofessionnel', cat:'SALAIRES', impact:'RMMMG officiel' },
  { id:'spf_etcs_rmmmg', name:'SPF ETCS — Revenu Minimum garanti', url:'https://employment.belgium.be/fr/themes/remuneration/salaire-minimum', cat:'SALAIRES', impact:'RMMMG confirmation SPF' },
  // Commissions Paritaires
  { id:'cp200_employes', name:'CP 200 — Employés (général)', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-200', cat:'CP', impact:'barème min CP200, primes' },
  { id:'cp100_commerce', name:'CP 100 — Commerce (général)', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-100', cat:'CP', impact:'barème min CP100' },
  { id:'cp124_construction', name:'CP 124 — Construction', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-124', cat:'CP', impact:'barème min construction' },
  { id:'cp302_horeca', name:'CP 302 — Hôtellerie (HORECA)', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-302', cat:'CP', impact:'barème min HORECA' },
  { id:'cp140_transport', name:'CP 140 — Transport routier', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-140', cat:'CP', impact:'barème min transport' },
  { id:'cp308_nettoyage', name:'CP 308 — Nettoyage', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-308', cat:'CP', impact:'barème min nettoyage' },
  { id:'cp315_sante', name:'CP 315 — Soins de santé', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-315', cat:'CP', impact:'barème min soins de santé' },
  // Primes & Avantages
  { id:'cnt_cheques_repas', name:'CNT — Chèques-repas (8€/j max)', url:'https://cnt-nar.be/fr/avantages-extrasalariaux/cheques-repas', cat:'PRIMES', impact:'chequeRepasMax, chequeRepasPatMax' },
  { id:'spf_eco_cheques', name:'SPF ETCS — Éco-chèques (250€/an)', url:'https://employment.belgium.be/fr/themes/remuneration/avantages-non-salariaux/eco-cheques', cat:'PRIMES', impact:'ecoMax (250€)' },
  { id:'spf_cla90', name:'SPF Finances — CLA90 Bonus non-récurrent', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/cct-90-bonus-non-recurrent', cat:'PRIMES', impact:'cla90Max, cotPatCla90 (33%)' },
  // Frais
  { id:'spf_frais_propres', name:'SPF Finances — Frais propres (km, bureau)', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/frais_professionnels/frais_propres_a_lemployeur', cat:'FRAIS', impact:'fraisKmVoiture (0,4415€), fraisKmVelo (0,35€)' },
  // Flexi & Spéciaux
  { id:'spf_flexijobs', name:'SPF Finances — Flexi-jobs (28,07%, 12.000€)', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/flexi-jobs', cat:'SPECIAL', impact:'flexiJobTaux, flexiJobPlafond' },
  { id:'spf_heures_sup', name:'SPF Finances — Heures supplémentaires', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/heures_supplementaires', cat:'SPECIAL', impact:'contingent 130h/180h, dispense PP' },
  // Belcotax & Fiscal
  { id:'belcotax_news', name:'Belcotax — Mises à jour fiches 281.xx', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/belcotax/news', cat:'FISCAL', impact:'format XML 281.10/11/17/20' },
  // Chômage
  { id:'onem_chomage_temp', name:'ONEM — Chômage temporaire (C106)', url:'https://www.onem.be/fr/citoyen/chomage-temporaire', cat:'CHOMAGE', impact:'allocation ~70%, formulaire C106' },
  { id:'onem_credit_temps', name:'ONEM — Crédit-temps (CCT n°103)', url:'https://www.onem.be/fr/citoyen/credit-temps', cat:'CHOMAGE', impact:'allocation crédit-temps' },
  // Moniteur
  { id:'moniteur_lois_sociales', name:'Moniteur Belge — Lois sociales', url:'https://www.ejustice.just.fgov.be/loi/loi.htm', cat:'MONITEUR', impact:'nouvelles lois, CCT, AR' },
  // ── CP SUPPLÉMENTAIRES ────────────────────────────────────────
  { id:'cp111_metal', name:'CP 111 — Métal Flandre', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-111', cat:'CP', impact:'barème min métal' },
  { id:'cp112_garage', name:'CP 112 — Garage', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-112', cat:'CP', impact:'barème min garage' },
  { id:'cp201_commerce', name:'CP 201 — Commerce détail employés', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-201', cat:'CP', impact:'barème CP201' },
  { id:'cp218_assistants', name:'CP 218 — Assistants commerciaux', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-218', cat:'CP', impact:'barème CP218' },
  { id:'cp310_banques', name:'CP 310 — Banques', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-310', cat:'CP', impact:'barème CP310' },
  { id:'cp317_pharmacie', name:'CP 317 — Pharmacie', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-317', cat:'CP', impact:'barème CP317' },
  { id:'cp318_gardiennage', name:'CP 318 — Gardiennage', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-318', cat:'CP', impact:'barème CP318' },
  { id:'cp322_interimaires', name:'CP 322 — Intérimaires', url:'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-322', cat:'CP', impact:'barème CP322' },
  // ── SAISIES ───────────────────────────────────────────────────
  { id:'just_saisies', name:'SPF Justice — Saisies sur salaire art.1409', url:'https://justice.belgium.be/fr/themes_et_dossiers/saisie_-_cession_-_cede_en_paiement/montants_insaisissables', cat:'SAISIES', impact:'saisie1/2/3/4 mensuel' },
  // ── ALLOCATIONS FAMILIALES ────────────────────────────────────
  { id:'famiwal_af', name:'Famiwal — AF Wallonie', url:'https://www.famiwal.be/fr/montants-allocations-familiales', cat:'AF', impact:'afWal 2026' },
  { id:'kidslife_af', name:'Kidslife — AF Bruxelles', url:'https://www.kidslife.be/fr/nos-allocations/montants/', cat:'AF', impact:'afBxl 2026' },
  // ── DIMONA / DMFA ─────────────────────────────────────────────
  { id:'onss_dimona', name:'ONSS — Dimona IN/OUT', url:'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/various_topics/dimona.html', cat:'DIMONA', impact:'règles Dimona 2026' },
  { id:'onss_dmfa', name:'ONSS — DmfA trimestrielle', url:'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/general/intro.html', cat:'DMFA', impact:'DmfA instructions 2026' },
  // ── ATN & AVANTAGES ──────────────────────────────────────────
  { id:'spf_atn_voiture', name:'SPF Finances — ATN voitures société', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_de_toute_nature/voiture_de_societe', cat:'ATN', impact:'formule ATN CO2 2026' },
  { id:'spf_atn_autres', name:'SPF Finances — ATN GSM, PC, logement', url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_de_toute_nature/ordinateur_internet_gsm', cat:'ATN', impact:'atnGsm, atnPc forfaits' },
  // ── PENSION & INAMI ──────────────────────────────────────────
  { id:'inami_incapacite', name:'INAMI — Indemnités incapacité travail', url:'https://www.inami.fgov.be/fr/themes/incapacite-invalidite/Pages/default.aspx', cat:'INAMI', impact:'taux 60%, plafond INAMI' },
  { id:'fedris_at', name:'Fedris — Accidents du travail', url:'https://www.fedris.be/fr/professionnel/accidents-du-travail', cat:'AT', impact:'primes AT, taux sectoriels' },
  // ── ACTIRIS / AIDES EMPLOI ───────────────────────────────────
  { id:'actiris_activa', name:'Actiris — Activa.Brussels 2026', url:'https://www.actiris.brussels/fr/entreprises/activa-brussels/', cat:'AIDES', impact:'primes Activa, montants, conditions' },
  { id:'sprb_monbee', name:'SPRB — MonBEE prime recrutement', url:'https://economie-emploi.brussels/monbee', cat:'AIDES', impact:'MonBEE montant, conditions, deadline' },
];

const CAT_COLORS = {
  ONSS:'#dbeafe', PP:'#fef3c7', SALAIRES:'#d1fae5', CP:'#ede9fe',
  PRIMES:'#fce7f3', FRAIS:'#ecfdf5', SPECIAL:'#fff7ed', FISCAL:'#f0f9ff',
  CHOMAGE:'#fef9c3', MONITEUR:'#f9fafb'
};

function hashContent(str) {
  const s = str.replace(/\s+/g,' ').trim().slice(0,20000);
  let h = 0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);h>>>=0;}
  return h.toString(36);
}

async function fetchSource(src) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(),10000);
    const resp = await fetch(src.url,{signal:ctrl.signal,headers:{'User-Agent':'AureusSocialPro/2026 (legal-watch; info@aureus-ia.com)','Accept-Language':'fr-BE,fr;q=0.9'}});
    clearTimeout(t);
    if(!resp.ok) return {id:src.id,error:`HTTP ${resp.status}`,ok:false};
    const raw = await resp.text();
    const cleaned = raw.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    return {id:src.id,hash:hashContent(cleaned),length:cleaned.length,ok:true};
  } catch(e){return {id:src.id,error:e.message,ok:false};}
}

async function loadPreviousHashes() {
  if(!supabase) return {};
  try {
    const {data} = await supabase.from('legal_watch_hashes').select('source_id,hash,checked_at');
    const map={};
    for(const row of(data||[])) map[row.source_id]=row;
    return map;
  } catch(_){return {};}
}

async function saveHashes(results) {
  if(!supabase) return;
  const now=new Date().toISOString();
  const rows=results.filter(r=>r.ok).map(r=>({source_id:r.id,hash:r.hash,checked_at:now,updated_at:now}));
  if(!rows.length) return;
  try{await supabase.from('legal_watch_hashes').upsert(rows,{onConflict:'source_id'});}catch(_){}
}

async function triggerBaremesPatch() {
  try {
    const cronSecret=process.env.CRON_SECRET;
    const res=await fetch('https://app.aureussocial.be/api/cron/baremes',{headers:cronSecret?{'Authorization':`Bearer ${cronSecret}`}:{},signal:AbortSignal.timeout(55000)});
    const j=await res.json().catch(()=>({}));
    return {triggered:true,pushed:j.pushed,sha:j.sha,changes:j.changes};
  } catch(e){return {triggered:false,reason:e.message};}
}

async function sendAlertEmail(changes,errors,total) {
  if(!RESEND_API_KEY||!changes.length) return;
  const rows=changes.map(c=>{
    const s=SOURCES.find(x=>x.id===c.id)||{name:c.id,cat:'?',impact:'—',url:'#'};
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
        <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;background:${CAT_COLORS[s.cat]||'#f3f4f6'};color:#374151;">${s.cat}</span>
        <strong style="margin-left:8px;font-size:13px;">${s.name}</strong>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">${s.impact}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;"><a href="${s.url}" style="color:#1d4ed8;font-size:11px;">Source →</a></td>
    </tr>`;
  }).join('');

  const cats=[...new Set(changes.map(c=>SOURCES.find(s=>s.id===c.id)?.cat||'?'))].join(', ');

  await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{'Authorization':`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:'Aureus Veille Légale <noreply@aureus-ia.com>',
      to:[ALERT_EMAIL],
      subject:`[Veille Légale] ${changes.length} modification(s) — ${cats} — ${new Date().toLocaleDateString('fr-BE')}`,
      html:`<div style="font-family:Inter,Arial,sans-serif;max-width:700px;margin:0 auto;">
        <div style="background:#0d1117;padding:20px 24px;border-radius:8px 8px 0 0;">
          <div style="color:#c6a34e;font-weight:800;font-size:18px;letter-spacing:2px;">AUREUS</div>
          <div style="color:#6b7280;font-size:10px;letter-spacing:3px;">SOCIAL PRO — Veille Légale Automatique</div>
        </div>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px 24px;">
          <div style="font-weight:700;color:#92400e;font-size:15px;">⚠️ ${changes.length} source(s) modifiée(s) sur ${total} surveillées</div>
          <div style="color:#78350f;font-size:12px;margin-top:4px;">Mise à jour automatique déclenchée → lois-belges.js patché → Vercel redéploie l'app</div>
        </div>
        <div style="background:#fff;padding:16px 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">SOURCE</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">IMPACT</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">LIEN</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          ${errors.length?`<div style="margin-top:12px;padding:10px;background:#fef2f2;border-radius:6px;font-size:11px;color:#dc2626;">${errors.length} source(s) inaccessible(s): ${errors.map(e=>e.id).join(', ')}</div>`:''}
          <div style="margin-top:14px;padding:12px;background:#d1fae5;border-radius:6px;font-size:11px;color:#166534;">
            ✅ Vérifiez les nouvelles valeurs dans <a href="https://app.aureussocial.be" style="color:#166534;font-weight:700;">app.aureussocial.be</a> → Barèmes & Seuils après le redéploiement (≈2 min).
          </div>
        </div>
        <div style="background:#f9fafb;padding:10px 24px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;">
          Aureus IA SPRL · BCE BE 1028.230.781 · Veille légale 06h15 CET · ${total} sources · ${new Date().toISOString()}
        </div>
      </div>`
    })
  }).catch(()=>{});
}

export async function GET(request) {
  const auth=request.headers.get('authorization');
  if(CRON_SECRET&&auth!==`Bearer ${CRON_SECRET}`) return NextResponse.json({error:'Unauthorized'},{status:401});

  const t0=Date.now();
  const results=[];
  for(let i=0;i<SOURCES.length;i+=5){
    const batch=await Promise.all(SOURCES.slice(i,i+5).map(fetchSource));
    results.push(...batch);
  }

  const prevHashes=await loadPreviousHashes();
  const changes=results.filter(r=>r.ok&&prevHashes[r.id]&&prevHashes[r.id].hash!==r.hash);
  const errors=results.filter(r=>!r.ok);
  const okResults=results.filter(r=>r.ok);

  await saveHashes(okResults);

  let patchResult=null;
  if(changes.length>0){
    await sendAlertEmail(changes,errors,SOURCES.length);
    patchResult=await triggerBaremesPatch();
  }

  if(supabase){
    try{
      await supabase.from('audit_log').insert({
        action:'LEGAL_WATCH_CRON',table_name:'legal_watch_hashes',
        new_values:{sources_checked:okResults.length,sources_error:errors.length,changes_detected:changes.length,changed:changes.map(c=>c.id),patch_triggered:!!patchResult?.triggered,duration_ms:Date.now()-t0},
        created_at:new Date().toISOString()
      });
    }catch(_){}
  }

  return NextResponse.json({
    ok:true,sources_total:SOURCES.length,sources_checked:okResults.length,
    sources_error:errors.length,changes_detected:changes.length,
    changed_sources:changes.map(c=>({id:c.id,cat:SOURCES.find(s=>s.id===c.id)?.cat})),
    errors:errors.map(e=>({id:e.id,error:e.error})),
    patch:patchResult,duration_ms:Date.now()-t0
  });
}
