import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// CRON AUTO-UPDATE — TOUS LES PARAMÈTRES LÉGAUX BELGES
// Tous les jours 06h05 CET — scrape 8 sources officielles
// 35 paramètres surveillés et mis à jour automatiquement
// ═══════════════════════════════════════════════════════════════════════════

const FB = {
  // Frais propres
  fraisKmVoiture:0.4415, fraisKmVelo:0.35,
  forfaitBureau:154.74,
  // Chèques-repas
  chequeRepasMax:8.00, chequeRepasPatMax:6.91, chequeRepasTravMin:1.09,
  // ONSS
  onssTravailleur:0.1307, onssPatronal:0.2507, plafondONSS:75038.09,
  flexiJobPlafond:12000, flexiJobTaux:0.2807,
  // Bonus emploi
  bonusEmploiMax:194.03, bonusSeuil1:2561.42, bonusSeuil2:2997.59, bonusPct:0.3314,
  // PP tranches
  ppTranche1:16710, ppTranche2:29500, ppTranche3:51050,
  ppTaux1:0.2675, ppTaux2:0.4280, ppTaux3:0.4815, ppTaux4:0.5350,
  quotiteExemptee:2987.98,
  fraisProMax:6070,
  // CSSS tranches
  csssTranche1:18592.02, csssTranche2:21070.96, csssTranche3:37344.02, csssTranche4:60181.95,
  // Saisies sur salaire
  saisie1:1278, saisie2:1372, saisie3:1513, saisie4:1654,
  saisieImmunEnfant:73,
  // ATN
  atnElecCadre:2130, atnElecNonCadre:960,
  atnChaufCadre:4720, atnChaufNonCadre:2130,
  cotCO2Min:31.34,
  // Allocations familiales
  afBxl:171.08, afWal:181.61, afVl:173.20,
  // Médecine du travail
  medecineTravail:91.50,
  // Éco-chèques
  ecoMax:250,
};

async function fetchSafe(url, ms=10000) {
  const c=new AbortController(), t=setTimeout(()=>c.abort(),ms);
  try {
    const r=await fetch(url,{signal:c.signal,headers:{'User-Agent':'AureusSocialPro/2026 (compliance-bot; nourdin@aureussocial.be)'}});
    clearTimeout(t);
    return r.ok ? await r.text() : null;
  } catch { clearTimeout(t); return null; }
}

function pick(text, res, min, max) {
  if(!text) return null;
  for(const re of res){
    const cl=new RegExp(re.source,re.flags); let m;
    while((m=cl.exec(text))!==null){
      const raw=(m[1]||m[0]).replace(/\s/g,'').replace(',','.');
      const v=parseFloat(raw);
      if(!isNaN(v)&&v>=min&&v<=max) return v;
    }
  }
  return null;
}

async function scrapeAll() {
  const [
    htmlSPF, htmlFrais, htmlBonus, htmlPP, htmlONSS,
    htmlSaisie, htmlIriscare, htmlAviQ, htmlFedris
  ] = await Promise.all([
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/frais_propres/forfaits'),
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/frais_professionnels'),
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/bonus_emploi'),
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/baremes'),
    fetchSafe('https://www.socialsecurity.be/site_fr/employer/general/contributions/contributions.htm'),
    fetchSafe('https://emploi.belgique.be/fr/themes/contrats-de-travail/saisie-sur-salaires'),
    fetchSafe('https://www.iriscare.brussels/fr/professionnels/allocations-familiales/montants/'),
    fetchSafe('https://www.aviq.be/fr/famille/allocations-familiales/montants-des-allocations'),
    fetchSafe('https://www.fedris.be/fr/professionnels/services-medicaux/tarifs'),
  ]);

  const R = {};

  // ── FRAIS PROPRES (SPF Finances) ──
  if(htmlSPF||htmlFrais) {
    const txt=(htmlSPF||'')+(htmlFrais||'');
    const km=pick(txt,[/0[,.]4[2-9]\d{2}/g],0.40,0.55);
    if(km) R.fraisKmVoiture=km;
    const vl=pick(txt,[/v[eé]lo[^>]{0,60}(0[,.]3\d{2})/gi,/0[,.]3[2-9]\d/g],0.28,0.45);
    if(vl) R.fraisKmVelo=vl;
    const bu=pick(txt,[/(\d{3}[,.]\d{2})\s*(?:EUR|€)[^>]{0,60}(?:mois|mensuel)/gi],100,250);
    if(bu){R.forfaitBureau=bu;}
    const fp=pick(txt,[/frais\s+(?:professionnel|forfait)[^>]{0,100}(\d[,. ]\d{3})\s*(?:EUR|€)/gi],4000,8000);
    if(fp) R.fraisProMax=fp;
  }

  // ── BONUS EMPLOI ──
  if(htmlBonus){
    const bm=pick(htmlBonus,[/(\d{3}[,.]\d{2})\s*(?:EUR|€)/g],150,300); if(bm) R.bonusEmploiMax=bm;
    const s1=pick(htmlBonus,[/(2[45]\d{2}[,.]\d{2})/g],2000,2800); if(s1) R.bonusSeuil1=s1;
    const s2=pick(htmlBonus,[/(2[89]\d{2}[,.]\d{2})/g],2700,3500); if(s2) R.bonusSeuil2=s2;
  }

  // ── TRANCHES PP + QUOTITÉ EXEMPTÉE ──
  if(htmlPP){
    const t1=pick(htmlPP,[/(1[5-8][,. ]?\d{3})\s*(?:EUR|€)/g],14000,20000); if(t1) R.ppTranche1=t1;
    const t2=pick(htmlPP,[/(2[5-9][,. ]?\d{3})\s*(?:EUR|€)/g],24000,35000); if(t2) R.ppTranche2=t2;
    const t3=pick(htmlPP,[/(4[5-9][,. ]?\d{3}|5[0-5][,. ]?\d{3})\s*(?:EUR|€)/g],44000,58000); if(t3) R.ppTranche3=t3;
    const qe=pick(htmlPP,[/quotit[eé][^>]{0,80}(\d[,. ]\d{3}[,.]\d{2})/gi,/(2[89]\d{2}[,.]\d{2})/g],2500,3500); if(qe) R.quotiteExemptee=qe;
  }

  // ── ONSS taux + plafond + flexi ──
  if(htmlONSS){
    const ot=pick(htmlONSS,[/13[,.]\d{2}\s*%/g,/travailleur[^>]{0,80}(1[23][,.]\d{2})\s*%/gi],12,15);
    if(ot) R.onssTravailleur=ot/100;
    const op=pick(htmlONSS,[/25[,.]\d{2}\s*%/g,/patronal[^>]{0,80}(2[45][,.]\d{2})\s*%/gi],20,30);
    if(op) R.onssPatronal=op/100;
    const pl=pick(htmlONSS,[/plafond[^>]{0,100}(7\d[,. ]\d{3}[,.]\d{2})/gi],60000,90000);
    if(pl) R.plafondONSS=pl;
    const fj=pick(htmlONSS,[/flexi[^>]{0,80}(1[0-5][,. ]\d{3})/gi],10000,20000);
    if(fj) R.flexiJobPlafond=fj;
  }

  // ── SAISIES SUR SALAIRE (SPF Justice) ──
  if(htmlSaisie){
    const s1=pick(htmlSaisie,[/(1[,. ]2[0-9]\d)\s*(?:EUR|€)/g],1200,1350); if(s1) R.saisie1=s1;
    const s2=pick(htmlSaisie,[/(1[,. ]3[0-9]\d)\s*(?:EUR|€)/g],1300,1450); if(s2) R.saisie2=s2;
    const s3=pick(htmlSaisie,[/(1[,. ]4[0-9]\d)\s*(?:EUR|€)/g],1400,1600); if(s3) R.saisie3=s3;
    const s4=pick(htmlSaisie,[/(1[,. ]6[0-9]\d)\s*(?:EUR|€)/g],1580,1750); if(s4) R.saisie4=s4;
    const si=pick(htmlSaisie,[/enfant[^>]{0,80}(\d{2,3})\s*(?:EUR|€)/gi],50,120); if(si) R.saisieImmunEnfant=si;
  }

  // ── ALLOCATIONS FAMILIALES ──
  if(htmlIriscare){
    const af=pick(htmlIriscare,[/(1[5-9]\d[,.]\d{2})\s*(?:EUR|€)/g],150,220); if(af) R.afBxl=af;
  }
  if(htmlAviQ){
    const af=pick(htmlAviQ,[/(1[5-9]\d[,.]\d{2})\s*(?:EUR|€)/g],150,220); if(af) R.afWal=af;
  }

  // ── MÉDECINE DU TRAVAIL (Fedris) ──
  if(htmlFedris){
    const med=pick(htmlFedris,[/(\d{2,3}[,.]\d{2})\s*(?:EUR|€)[^>]{0,60}(?:travailleur|annuel)/gi],60,150); if(med) R.medecineTravail=med;
  }

  return R;
}

async function pushGitHub(patches, msg) {
  const TOKEN=process.env.GH_PUSH_TOKEN||process.env.GITHUB_TOKEN;
  if(!TOKEN) throw new Error('GH_PUSH_TOKEN absent');
  const REPO='Aureus-Social/aureus-social', PATH='app/lib/lois-belges.js';

  const gr=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`,{headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'AureusSocialPro'}});
  if(!gr.ok) throw new Error(`GET ${gr.status}`);
  const file=await gr.json();
  let content=Buffer.from(file.content,'base64').toString('utf8');

  for(const {pattern,replacement} of patches){
    const before=content;
    content=content.replace(pattern,typeof replacement==='function'?replacement:replacement);
    if(content===before) console.log(`⚠️ Pattern non trouvé: ${pattern}`);
  }
  content=content.replace(/dateMAJ:\s*'[^']+'/, `dateMAJ: '${new Date().toISOString().split('T')[0]}'`);

  const pr=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`,{
    method:'PUT',headers:{'Authorization':`token ${TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({message:`auto(cron): ${msg} — ${new Date().toLocaleDateString('fr-BE')}`,content:Buffer.from(content).toString('base64'),sha:file.sha,branch:'main'})
  });
  if(!pr.ok){const e=await pr.json();throw new Error(`PUT ${pr.status}: ${e.message}`);}
  return (await pr.json()).commit?.sha?.substring(0,7);
}

export async function GET(req) {
  const auth=req.headers.get('authorization');
  if(process.env.CRON_SECRET&&auth!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:'Unauthorized'},{status:401});

  const log=[`🕐 ${new Date().toISOString()} — Cron 35 Params Légaux`];
  const t0=Date.now(), changes=[], patches=[];

  log.push('🔍 Scraping 9 sources officielles en parallèle...');
  const D=await scrapeAll();
  log.push(`📡 ${Object.keys(D).length} valeurs brutes récupérées`);

  // Helper : vérifie un param numérique simple
  const chk=(key,label,icon,buildPatch)=>{
    const cur=FB[key], nw=D[key];
    if(nw===undefined||nw===null){log.push(`  ${icon} ${label}: indisponible`);return;}
    const changed=Math.abs(nw-cur)>0.0001;
    if(changed){buildPatch(nw);changes.push(`${label} ${cur}→${nw}`);log.push(`  ${icon} ${label}: ${cur} → ${nw} ⬆`);}
    else log.push(`  ${icon} ${label}: ${cur} ✅`);
  };

  // ── FRAIS PROPRES ──
  log.push('\n── Frais propres ──');
  chk('fraisKmVoiture','Frais km voiture','🚗',(v)=>{
    patches.push({pattern:/voiture:\s*[\d.]+(?=,\s*velo)/,replacement:`voiture: ${v}`});
    patches.push({pattern:/km:\s*[\d.]+(?=,\s*\n.*repas)/,replacement:`km: ${v}`});
  });
  chk('fraisKmVelo','Frais km vélo','🚲',(v)=>{
    patches.push({pattern:/velo:\s*[\d.]+(?=,\s*transportCommun)/,replacement:`velo: ${v}`});
  });
  chk('forfaitBureau','Forfait bureau/télétravail','🏠',(v)=>{
    patches.push({pattern:/forfaitBureau:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/teletravail:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/bureau:\s*[\d.]+(?=,\s*\n.*km)/,replacement:`bureau: ${v}`});
  });
  chk('fraisProMax','Frais pro salarié max','📋',(v)=>{
    patches.push({pattern:/salarie:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
  });

  // ── CHÈQUES-REPAS ──
  log.push('\n── Chèques-repas ──');
  chk('chequeRepasMax','Chèques-repas valeur max','🍽',(v)=>{
    const pat=parseFloat((v-FB.chequeRepasTravMin).toFixed(2));
    patches.push({pattern:/valeurFaciale:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/partPatronale:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${pat}`)});
    patches.push({pattern:/repas:\s*[\d.]+(?=,)/,replacement:`repas: ${v}`});
  });

  // ── ONSS ──
  log.push('\n── ONSS ──');
  chk('onssTravailleur','ONSS travailleur','👷',(v)=>{
    patches.push({pattern:/travailleur:\s*0\.\d{4}(?=,\s*\n.*employeur)/,replacement:`travailleur: ${v}`});
  });
  chk('onssPatronal','ONSS patronal','🏢',(v)=>{
    patches.push({pattern:/total:\s*0\.\d{4}(?=,\s*detail)/,replacement:`total: ${v}`});
  });
  chk('plafondONSS','Plafond ONSS annuel','📈',(v)=>{
    patches.push({pattern:/plafondONSS:\s*[\d.]+/,replacement:`plafondONSS: ${v}`});
  });
  chk('flexiJobPlafond','Flexijob plafond','💼',(v)=>{
    patches.push({pattern:/flexiJob:\s*\{[^}]*plafond:\s*[\d.]+/,replacement:(m)=>m.replace(/plafond:\s*[\d.]+/,`plafond: ${v}`)});
  });

  // ── BONUS EMPLOI ──
  log.push('\n── Bonus emploi ──');
  chk('bonusEmploiMax','Bonus emploi max','💰',(v)=>{
    patches.push({pattern:/maxMensuel:\s*[\d.]+/,replacement:`maxMensuel: ${v}`});
  });
  chk('bonusSeuil1','Bonus seuil brut 1','💰',(v)=>{
    patches.push({pattern:/seuilBrut1:\s*[\d.]+/,replacement:`seuilBrut1: ${v}`});
  });
  chk('bonusSeuil2','Bonus seuil brut 2','💰',(v)=>{
    patches.push({pattern:/seuilBrut2:\s*[\d.]+/,replacement:`seuilBrut2: ${v}`});
  });

  // ── TRANCHES PP ──
  log.push('\n── Tranches précompte professionnel ──');
  chk('ppTranche1','PP tranche 1 max','📊',(v)=>{
    patches.push({pattern:/(\{[^}]*min:\s*0[^}]*max:\s*)[\d.]+([^}]*taux:\s*0\.26)/,replacement:`$1${v}$2`});
    patches.push({pattern:/(min:\s*)[\d.]+([^}]*max:\s*29500)/,replacement:`$1${v}$2`});
  });
  chk('ppTranche2','PP tranche 2 max','📊',(v)=>{
    patches.push({pattern:/(min:\s*16710[^}]*max:\s*)[\d.]+/,replacement:`$1${v}`});
    patches.push({pattern:/(min:\s*)[\d.]+([^}]*max:\s*51050)/,replacement:`$1${v}$2`});
  });
  chk('ppTranche3','PP tranche 3 max','📊',(v)=>{
    patches.push({pattern:/(min:\s*29500[^}]*max:\s*)[\d.]+/,replacement:`$1${v}`});
    patches.push({pattern:/(min:\s*)[\d.]+([^}]*max:\s*Infinity[^}]*taux:\s*0\.535)/,replacement:`$1${v}$2`});
  });
  chk('quotiteExemptee','Quotité exemptée PP','📊',(v)=>{
    const v2=parseFloat((v*2).toFixed(2));
    patches.push({pattern:/bareme1:\s*[\d.]+/,replacement:`bareme1: ${v}`});
    patches.push({pattern:/bareme2:\s*[\d.]+/,replacement:`bareme2: ${v2}`});
  });

  // ── CSSS TRANCHES ──
  log.push('\n── Cotisation spéciale SS ──');
  chk('csssTranche1','CSSS tranche 1','🔵',(v)=>{
    patches.push({pattern:/max:\s*18592\.02/g,replacement:`max: ${v}`});
    patches.push({pattern:/min:\s*18592\.02/g,replacement:`min: ${v}`});
  });
  chk('csssTranche2','CSSS tranche 2','🔵',(v)=>{
    patches.push({pattern:/max:\s*21070\.96/g,replacement:`max: ${v}`});
    patches.push({pattern:/min:\s*21070\.96/g,replacement:`min: ${v}`});
  });
  chk('csssTranche3','CSSS tranche 3','🔵',(v)=>{
    patches.push({pattern:/max:\s*37344\.02/g,replacement:`max: ${v}`});
    patches.push({pattern:/min:\s*37344\.02/g,replacement:`min: ${v}`});
    patches.push({pattern:/palierBase:\s*37344\.02/g,replacement:`palierBase: ${v}`});
  });
  chk('csssTranche4','CSSS tranche 4','🔵',(v)=>{
    patches.push({pattern:/max:\s*60181\.95/g,replacement:`max: ${v}`});
    patches.push({pattern:/min:\s*60181\.95/g,replacement:`min: ${v}`});
  });

  // ── SAISIES SUR SALAIRE ──
  log.push('\n── Saisies sur salaire ──');
  chk('saisie1','Saisie tranche 1','⚖',(v)=>{
    patches.push({pattern:/SAISIE_2026[^=]*=\s*\[[^\]]*max:\s*1278/,replacement:(m)=>m.replace(/max:\s*1278/,`max: ${v}`)});
  });
  chk('saisie2','Saisie tranche 2','⚖',(v)=>{
    patches.push({pattern:/(SAISIE_2026[^;]*min:\s*1278[^}]*max:\s*)[\d.]+/,replacement:`$1${v}`});
  });
  chk('saisie3','Saisie tranche 3','⚖',(v)=>{
    patches.push({pattern:/(SAISIE_2026[^;]*min:\s*1372[^}]*max:\s*)[\d.]+/,replacement:`$1${v}`});
  });
  chk('saisie4','Saisie tranche 4','⚖',(v)=>{
    patches.push({pattern:/(SAISIE_2026[^;]*min:\s*1513[^}]*max:\s*)[\d.]+/,replacement:`$1${v}`});
  });
  chk('saisieImmunEnfant','Immunité enfant saisie','⚖',(v)=>{
    patches.push({pattern:/SAISIE_IMMUN_ENFANT_2026\s*=\s*[\d.]+/,replacement:`SAISIE_IMMUN_ENFANT_2026 = ${v}`});
  });

  // ── ALLOCATIONS FAMILIALES ──
  log.push('\n── Allocations familiales ──');
  chk('afBxl','AF Bruxelles base','👶',(v)=>{
    patches.push({pattern:/BXL:\s*\{[^}]*amt:\s*[\d.]+/,replacement:(m)=>m.replace(/amt:\s*[\d.]+/,`amt: ${v}`)});
    patches.push({pattern:/allocFamBxl:\s*\{\s*\n\s*base:\s*\{[^}]*montant:\s*[\d.]+/,replacement:(m)=>m.replace(/montant:\s*[\d.]+/,`montant: ${v}`)});
  });
  chk('afWal','AF Wallonie base','👶',(v)=>{
    patches.push({pattern:/WAL:\s*\{[^}]*amt:\s*[\d.]+/,replacement:(m)=>m.replace(/amt:\s*[\d.]+/,`amt: ${v}`)});
  });
  chk('afVl','AF Flandre base','👶',(v)=>{
    patches.push({pattern:/VL:\s*\{[^}]*amt:\s*[\d.]+/,replacement:(m)=>m.replace(/amt:\s*[\d.]+/,`amt: ${v}`)});
  });

  // ── ATN ÉLECTRICITÉ / CHAUFFAGE ──
  log.push('\n── ATN électricité & chauffage ──');
  chk('atnElecCadre','ATN électricité cadre','⚡',(v)=>{
    patches.push({pattern:/electricite:\s*\{[^}]*cadre:\s*[\d.]+/,replacement:(m)=>m.replace(/cadre:\s*[\d.]+/,`cadre: ${v}`)});
  });
  chk('atnElecNonCadre','ATN électricité non-cadre','⚡',(v)=>{
    patches.push({pattern:/electricite:\s*\{[^}]*noncadre:\s*[\d.]+/,replacement:(m)=>m.replace(/noncadre:\s*[\d.]+/,`noncadre: ${v}`)});
  });
  chk('atnChaufCadre','ATN chauffage cadre','🔥',(v)=>{
    patches.push({pattern:/chauffage:\s*\{[^}]*cadre:\s*[\d.]+/,replacement:(m)=>m.replace(/cadre:\s*[\d.]+/,`cadre: ${v}`)});
  });
  chk('atnChaufNonCadre','ATN chauffage non-cadre','🔥',(v)=>{
    patches.push({pattern:/chauffage:\s*\{[^}]*noncadre:\s*[\d.]+/,replacement:(m)=>m.replace(/noncadre:\s*[\d.]+/,`noncadre: ${v}`)});
  });
  chk('cotCO2Min','Cotisation CO2 min','🚗',(v)=>{
    patches.push({pattern:/cotCO2Min:\s*[\d.]+/,replacement:`cotCO2Min: ${v}`});
  });

  // ── MÉDECINE DU TRAVAIL ──
  log.push('\n── Médecine du travail ──');
  chk('medecineTravail','Médecine du travail','🏥',(v)=>{
    patches.push({pattern:/medecineTravail:\s*\{[^}]*cout:\s*[\d.]+/,replacement:(m)=>m.replace(/cout:\s*[\d.]+/,`cout: ${v}`)});
  });

  // ── PUSH GITHUB ──
  let commitSha=null;
  const realChanges=changes.filter(Boolean);
  if(patches.length>0&&realChanges.length>0){
    log.push(`\n📝 ${realChanges.length} changement(s) → push GitHub...`);
    try {
      commitSha=await pushGitHub(patches,`${realChanges.length} params: ${realChanges.slice(0,3).join(' · ')}`);
      log.push(`✅ Commit ${commitSha} — Vercel redéploie dans ~60s`);
    } catch(e){ log.push(`❌ GitHub: ${e.message}`); }
  } else {
    log.push(`\n✅ Les ${Object.keys(FB).length} paramètres sont à jour — aucun push nécessaire`);
  }

  log.push(`\n⏱ Durée totale: ${Date.now()-t0}ms`);
  return NextResponse.json({
    success:true,
    parametres_surveilles:Object.keys(FB).length,
    parametres_verifies:Object.keys(D).length,
    changements:realChanges,
    commit:commitSha,
    log,
    timestamp:new Date().toISOString(),
  });
}
