import { NextResponse } from 'next/server';

// Valeurs actuelles — fallback si scraping impossible
const FB = {
  fraisKmVoiture:0.4415, fraisKmVelo:0.35,
  chequeRepasMax:8.00, chequeRepasPatMax:6.91, chequeRepasTravMin:1.09,
  forfaitBureau:154.74,
  onssTravailleur:0.1307, onssPatronal:0.2507, plafondONSS:75038.09,
  bonusEmploiMax:194.03, bonusSeuil1:2561.42, bonusSeuil2:2997.59,
  indiceSante:125.60,
};

async function fetchSafe(url, ms=10000) {
  const c=new AbortController(), t=setTimeout(()=>c.abort(),ms);
  try {
    const r=await fetch(url,{signal:c.signal,headers:{'User-Agent':'AureusSocialPro/2026'}});
    clearTimeout(t);
    return r.ok ? await r.text() : null;
  } catch { clearTimeout(t); return null; }
}

function pick(text, res, min, max) {
  if(!text) return null;
  for(const re of res){
    const cl=new RegExp(re.source,re.flags); let m;
    while((m=cl.exec(text))!==null){
      const v=parseFloat((m[1]||m[0]).replace(/\s/g,'').replace(',','.'));
      if(!isNaN(v)&&v>=min&&v<=max) return v;
    }
  }
  return null;
}

async function scrapeAll() {
  const [htmlSPF,htmlStat,htmlCNT,htmlONSS,htmlBonus]=await Promise.all([
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/frais_propres/forfaits'),
    fetchSafe('https://statbel.fgov.be/fr/themes/prix-la-consommation/indice-sante'),
    fetchSafe('https://emploi.belgique.be/fr/themes/remunerations/cheques-repas'),
    fetchSafe('https://www.socialsecurity.be/site_fr/employer/general/contributions/contributions.htm'),
    fetchSafe('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/bonus_emploi'),
  ]);

  const R={};

  // Frais km voiture & vélo
  if(htmlSPF){
    const km=pick(htmlSPF,[/0[,.]4[2-9]\d{2}/g],0.40,0.55); if(km) R.fraisKmVoiture=km;
    const vl=pick(htmlSPF,[/v[eé]lo[^>]{0,60}(0[,.]3\d{2})/gi,/0[,.]3[0-9]\d/g],0.25,0.45); if(vl) R.fraisKmVelo=vl;
    const bu=pick(htmlSPF,[/(\d{3}[,.]\d{2})\s*(?:EUR|€)[^>]{0,40}mois/gi],100,250); if(bu){R.forfaitBureau=bu;}
  }

  // Indice santé
  if(htmlStat){
    const is=pick(htmlStat,[/\b(1[2-4]\d[.]\d{2})\b/g],120,145); if(is) R.indiceSante=is;
    const MOIS={janvier:'01',février:'02',mars:'03',avril:'04',mai:'05',juin:'06',juillet:'07',août:'08',septembre:'09',octobre:'10',novembre:'11',décembre:'12'};
    const rd=/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(202\d)/gi;
    let m, ld=null;
    while((m=rd.exec(htmlStat))!==null){ const mo=MOIS[m[2].toLowerCase()]; if(mo) ld=`${m[3]}-${mo}-${m[1].padStart(2,'0')}`; }
    if(ld) R.dateIndiceSante=ld;
  }

  // Chèques-repas
  if(htmlCNT){
    const cr=pick(htmlCNT,[/valeur[^>]{0,50}([7-9][,.]\d{2})\s*(?:EUR|€)/gi],6,15); if(cr){R.chequeRepasMax=cr; R.chequeRepasPatMax=parseFloat((cr-FB.chequeRepasTravMin).toFixed(2));}
  }

  // ONSS taux + plafond
  if(htmlONSS){
    const ot=pick(htmlONSS,[/travailleur[^>]{0,80}(1[23][,.]\d{2})\s*%/gi],12,15); if(ot) R.onssTravailleur=ot/100;
    const op=pick(htmlONSS,[/patronal[^>]{0,80}(2[45][,.]\d{2})\s*%/gi],20,30); if(op) R.onssPatronal=op/100;
    const pl=pick(htmlONSS,[/plafond[^>]{0,80}(7\d[,. ]\d{3}[,.]\d{2})/gi],60000,90000); if(pl) R.plafondONSS=pl;
  }

  // Bonus emploi
  if(htmlBonus){
    const bm=pick(htmlBonus,[/maximum[^>]{0,60}(\d{3}[,.]\d{2})\s*(?:EUR|€)/gi],100,300); if(bm) R.bonusEmploiMax=bm;
    const s1=pick(htmlBonus,[/(2[45]\d{2}[,.]\d{2})/g],2000,3000); if(s1) R.bonusSeuil1=s1;
    const s2=pick(htmlBonus,[/(2[89]\d{2}[,.]\d{2})/g],2500,3500); if(s2) R.bonusSeuil2=s2;
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

  for(const {pattern,replacement} of patches) content=content.replace(pattern,replacement);
  content=content.replace(/dateMAJ:\s*'[^']+'/, `dateMAJ: '${new Date().toISOString().split('T')[0]}'`);

  const pr=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`,{
    method:'PUT', headers:{'Authorization':`token ${TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({message:`auto(cron): ${msg} — ${new Date().toLocaleDateString('fr-BE')}`,content:Buffer.from(content).toString('base64'),sha:file.sha,branch:'main'})
  });
  if(!pr.ok){const e=await pr.json();throw new Error(`PUT ${pr.status}: ${e.message}`);}
  return (await pr.json()).commit?.sha?.substring(0,7);
}

export async function GET(req) {
  const auth=req.headers.get('authorization');
  if(process.env.CRON_SECRET&&auth!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:'Unauthorized'},{status:401});

  const log=[`🕐 ${new Date().toISOString()} — Cron Paramètres Légaux`];
  const t0=Date.now(), changes=[], patches=[];

  log.push('🔍 Scraping 5 sources officielles...');
  const D=await scrapeAll();
  log.push(`📡 ${Object.keys(D).length} valeurs récupérées`);

  const check=(key, label, icon, buildPatches)=>{
    const cur=FB[key], nw=D[key];
    if(nw===undefined){ log.push(`  ${icon} ${label} : source indisponible`); return; }
    const changed=typeof nw==='number' ? Math.abs(nw-cur)>0.0001 : nw!==cur;
    if(changed){
      buildPatches(nw);
      changes.push(`${label}: ${cur} → ${nw}`);
      log.push(`  ${icon} ${label} : ${cur} → ${nw} ⬆`);
    } else {
      log.push(`  ${icon} ${label} : ${cur} ✅`);
    }
  };

  check('fraisKmVoiture','Frais km voiture','🚗',(v)=>{
    patches.push({pattern:/voiture:\s*[\d.]+(?=,\s*velo)/,replacement:`voiture: ${v}`});
    patches.push({pattern:/km:\s*[\d.]+(?=,\s*\n.*repas)/,replacement:`km: ${v}`});
  });
  check('fraisKmVelo','Frais km vélo','🚲',(v)=>{
    patches.push({pattern:/velo:\s*[\d.]+(?=,\s*transportCommun)/,replacement:`velo: ${v}`});
  });
  check('forfaitBureau','Forfait bureau/télétravail','🏠',(v)=>{
    patches.push({pattern:/forfaitBureau:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/teletravail:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/bureau:\s*[\d.]+(?=,\s*\n.*km)/,replacement:`bureau: ${v}`});
  });
  check('chequeRepasMax','Chèques-repas valeur max','🍽',(v)=>{
    patches.push({pattern:/valeurFaciale:\s*\{[^}]*max:\s*[\d.]+/,replacement:(m)=>m.replace(/max:\s*[\d.]+/,`max: ${v}`)});
    patches.push({pattern:/repas:\s*[\d.]+(?=,)/,replacement:`repas: ${v}`});
  });
  check('onssTravailleur','ONSS travailleur','👷',(v)=>{
    patches.push({pattern:/travailleur:\s*0\.\d{4}(?=,\s*\n.*employeur)/,replacement:`travailleur: ${v}`});
  });
  check('onssPatronal','ONSS patronal','🏢',(v)=>{
    patches.push({pattern:/total:\s*0\.\d{4}(?=,\s*detail)/,replacement:`total: ${v}`});
  });
  check('plafondONSS','Plafond ONSS annuel','📈',(v)=>{
    patches.push({pattern:/plafondONSS:\s*[\d.]+/,replacement:`plafondONSS: ${v}`});
  });
  check('bonusEmploiMax','Bonus emploi max','💼',(v)=>{
    patches.push({pattern:/maxMensuel:\s*[\d.]+/,replacement:`maxMensuel: ${v}`});
  });
  check('bonusSeuil1','Bonus emploi seuil 1','💼',(v)=>{
    patches.push({pattern:/seuilBrut1:\s*[\d.]+/,replacement:`seuilBrut1: ${v}`});
  });
  check('bonusSeuil2','Bonus emploi seuil 2','💼',(v)=>{
    patches.push({pattern:/seuilBrut2:\s*[\d.]+/,replacement:`seuilBrut2: ${v}`});
  });

  if(D.dateIndiceSante){
    patches.push({pattern:/dateDerniereIndex:\s*'[^']+'/,replacement:`dateDerniereIndex: '${D.dateIndiceSante}'`});
    changes.push(`Indice santé mis à jour: ${D.dateIndiceSante}`);
    log.push(`  📊 Indice santé : ${D.indiceSante} (${D.dateIndiceSante}) ⬆`);
  }

  let commitSha=null;
  if(patches.length>0&&changes.length>0){
    log.push(`\n📝 ${changes.length} changement(s) → push GitHub...`);
    try { commitSha=await pushGitHub(patches,`${changes.length} params: ${changes.slice(0,2).join(' · ')}`); log.push(`✅ Commit ${commitSha} — Vercel redéploie dans ~60s`); }
    catch(e){ log.push(`❌ GitHub: ${e.message}`); }
  } else {
    log.push(`\n✅ Tous les ${Object.keys(FB).length} paramètres sont à jour`);
  }

  log.push(`⏱ ${Date.now()-t0}ms`);
  return NextResponse.json({success:true,parametres:Object.keys(FB).length,changements:changes,commit:commitSha,log,timestamp:new Date().toISOString()});
}
