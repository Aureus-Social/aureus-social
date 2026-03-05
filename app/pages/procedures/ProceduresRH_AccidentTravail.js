'use client';
import { useState, useMemo } from 'react';
const PROC_AT={id:'accident_travail',icon:'⚠️',categorie:'absence',titre:"Accident du travail",resume:"Déclaration obligatoire dans les 8 jours. L'assurance AT (loi 1971) couvre les soins médicaux à 100% et les indemnités (90% du salaire plafonné). L'employeur paie le salaire garanti 30 jours puis l'assureur AT prend le relais. Déclaration même pour les accidents bénins.",
baseLegale:[{ref:"Loi 10/04/1971",desc:"Accidents du travail — couverture, indemnisation, obligations de l'employeur"},{ref:"AR 12/04/1984",desc:"Déclaration d'accident du travail — formulaire et délais"},{ref:"Loi 03/07/1978, art. 52-54",desc:"Salaire garanti en cas d'accident du travail"},{ref:"AR 13/06/1999",desc:"Accident sur le chemin du travail — couverture étendue"}],
etapes:[
  {n:1,phase:'urgence',titre:"Premiers secours + soins médicaux IMMÉDIATS",detail:`═══ PRIORITÉ 1 : SÉCURISER ═══
• Porter secours à la victime (premiers soins)
• Appeler les secours si nécessaire (112)
• Sécuriser la zone (éviter un sur-accident)
• Identifier les témoins
• NE PAS modifier la scène (preuve)

═══ SOINS MÉDICAUX ═══
• Diriger le travailleur vers le médecin du travail ou les urgences
• TOUS les soins sont couverts à 100% par l'assurance AT
• Le travailleur choisit son médecin (libre choix)
• Pas de ticket modérateur, pas d'avance de frais (sauf remboursement)

═══ REGISTRE DES PREMIERS SOINS ═══
Même pour un accident BÉNIN (sans incapacité) :
• Consigner dans le registre des premiers soins de l'entreprise
• Date, lieu, circonstances, identité de la victime, nature des lésions
• Témoin(s) si possible`,delai:"IMMÉDIAT",formulaire:"Registre des premiers soins",ou:"Sur le lieu de l'accident",obligatoire:true,duree_estimee:'Immédiat'},

  {n:2,phase:'déclaration',titre:"Déclaration d'accident du travail — 8 JOURS CALENDRIER",detail:`═══ DÉLAI ═══
L'employeur DOIT déclarer l'accident à son assureur AT dans les 8 JOURS CALENDRIER.
Le délai court à partir du jour suivant l'accident.

═══ FORMULAIRE ═══
Déclaration d'accident du travail (formulaire réglementaire) :
1. Identité de la victime
2. Date, heure, lieu de l'accident
3. Circonstances détaillées (description précise)
4. Nature des lésions
5. Témoins éventuels
6. Premiers soins administrés
7. Certificat médical de première constatation

═══ À QUI DÉCLARER ? ═══
• À l'assureur AT de l'entreprise (Ethias, AXA, AG, Baloise, Federale, etc.)
• Via le portail en ligne de l'assureur ou par courrier
• Copie au médecin du travail (SEPP)

═══ SANCTIONS SI PAS DE DÉCLARATION ═══
• Amende administrative : 400€ à 4.000€
• Responsabilité civile de l'employeur si le travailleur ne peut pas faire valoir ses droits
• L'assureur peut refuser la couverture si déclaration tardive

═══ ACCIDENT SUR LE CHEMIN DU TRAVAIL ═══
Le trajet normal domicile-travail est couvert :
• Le trajet habituel OU un détour raisonnable (crèche, école, station-service)
• Mêmes droits et obligations que l'accident sur le lieu de travail
• Déclaration identique`,delai:"8 JOURS CALENDRIER après l'accident",formulaire:"Déclaration d'accident du travail (formulaire assureur AT)",ou:"Assureur accidents du travail",obligatoire:true,duree_estimee:'1-2h'},

  {n:3,phase:'indemnisation',titre:"Salaire garanti + indemnités AT",detail:`═══ SALAIRE GARANTI (30 jours) ═══
L'employeur paie le salaire garanti pendant 30 jours calendrier :
• Employés : 100% les 30 premiers jours
• Ouvriers : selon le barème habituel (100%, 85,88%)
• L'assureur AT REMBOURSE l'employeur (90% du salaire plafonné)

═══ APRÈS 30 JOURS — INDEMNITÉS AT ═══
L'assureur AT verse directement au travailleur :
Incapacité temporaire TOTALE :
• 90% du salaire de base (plafonné ±54.000€/an en 2026)
• Versées par l'assureur AT (pas la mutuelle !)
• Pas d'impôt sur les indemnités AT

Incapacité temporaire PARTIELLE :
• Proportionnelle au taux d'incapacité fixé par le médecin
• Le travailleur peut reprendre partiellement

═══ SOINS MÉDICAUX ═══
• 100% pris en charge par l'assureur AT
• Médicaments, kinésithérapie, prothèses, etc.
• Pas de limite dans le temps
• Libre choix du praticien

═══ CONSOLIDATION ═══
Quand l'état de santé est stabilisé → consolidation :
• Le médecin fixe un taux d'IPP (Incapacité Permanente Partielle)
• L'assureur verse une rente ou un capital selon le taux
• 0% → pas de séquelles → pas de rente
• 5-15% → rente annuelle modeste
• >15% → rente significative`,delai:"Salaire garanti : 30 jours — AT ensuite",formulaire:"Certificats médicaux successifs → assureur AT",ou:"Assureur AT",obligatoire:true,duree_estimee:'Variable'},

  {n:4,phase:'suivi',titre:"Suivi, reprise et prévention",detail:`═══ REPRISE DU TRAVAIL ═══
• Le travailleur reprend quand le médecin l'autorise
• Visite de reprise obligatoire auprès du médecin du travail si absence >4 semaines
• Le médecin du travail vérifie l'aptitude au poste
• Adaptation du poste si nécessaire

═══ ANALYSE DE L'ACCIDENT ═══
L'employeur DOIT analyser l'accident :
• Rechercher les causes (matérielles, organisationnelles, humaines)
• Rédiger un rapport d'analyse (avec le conseiller en prévention)
• Mettre en place des mesures correctives
• Informer le CPPT (Comité pour la Prévention et la Protection au Travail)
• Accidents graves : enquête du SPF Emploi possible

═══ PRÉVENTION ═══
• Mise à jour du document unique d'évaluation des risques
• Formation du personnel (si risque identifié)
• Modification des équipements ou procédures
• Communication aux travailleurs

═══ RECHUTE ═══
Si le travailleur rechute de la même blessure :
• Nouvelle déclaration à l'assureur AT (rechute liée à l'AT initial)
• Couverture par l'assureur AT (pas un nouvel accident)
• Le travailleur a droit aux mêmes indemnités`,delai:"Visite de reprise si >4 semaines d'absence",formulaire:"Rapport d'analyse d'accident + visite de reprise",ou:"SEPP + conseiller en prévention",obligatoire:true,duree_estimee:'Variable'},
],
alertes:[
  {niveau:'critique',texte:"Déclaration OBLIGATOIRE dans les 8 JOURS CALENDRIER. Même pour un accident BÉNIN → registre des premiers soins. Défaut = amende 400-4.000€."},
  {niveau:'critique',texte:"TOUS les soins médicaux sont couverts à 100% par l'assurance AT. Le travailleur ne doit RIEN payer."},
  {niveau:'important',texte:"L'accident sur le chemin du travail est couvert au même titre que l'accident sur le lieu de travail."},
  {niveau:'important',texte:"Visite de reprise OBLIGATOIRE auprès du médecin du travail si absence >4 semaines."},
  {niveau:'attention',texte:"L'employeur doit analyser l'accident et mettre en place des mesures correctives. Obligation de sécurité."},
  {niveau:'info',texte:"Les indemnités AT (90%) ne sont PAS imposables. Le travailleur reçoit plus net qu'en maladie (60%)."},
],
simulation:{titre:"Accident du travail — Indemnisation (3.200€ brut)",lignes:[
  {label:'SALAIRE GARANTI (30 jours) :',montant:'',type:'neutre'},
  {label:'  Payé par employeur',montant:'±4.300€',type:'neutre'},
  {label:'  Remboursé par assureur (90%)',montant:'±3.870€',type:'vert'},
  {label:'  Coût net employeur',montant:'±430€',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'INDEMNITÉS AT (après 30 jours) :',montant:'',type:'neutre'},
  {label:'  90% du salaire plafonné',montant:'±2.880€/mois',type:'vert'},
  {label:'  NET (pas d\'impôt)',montant:'±2.880€/mois',type:'vert_bold'},
  {label:'  vs Maladie (60% imposable)',montant:'±1.120€ net',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Soins médicaux',montant:'100% assureur AT',type:'vert_bold'},
]},
faq:[
  {q:"Quelle différence entre accident du travail et maladie ?",r:"AT : couvert par l'assureur AT (90% net, soins 100%). Maladie : salaire garanti 30 jours puis mutuelle (60% imposable). L'AT est beaucoup plus favorable pour le travailleur."},
  {q:"Le travailleur peut-il choisir son médecin ?",r:"Oui, libre choix du médecin. Mais l'assureur AT peut demander un examen par un médecin de son choix pour vérifier l'incapacité."},
  {q:"Que faire si l'assureur AT conteste l'accident ?",r:"Le travailleur peut saisir le tribunal du travail. L'assureur doit prouver que l'accident n'est pas un accident du travail. La charge de la preuve est allégée pour le travailleur."},
],
formulaires:[{nom:"Fedris — Accidents du travail",url:"https://www.fedris.be/fr/professionnel/accidents-du-travail",type:'en_ligne'},{nom:"SPF Emploi — AT",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail/accidents-du-travail",type:'en_ligne'}]};
export default function ProcedureAccidentTravail(){const P=PROC_AT;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'urgence',l:'Urgence',i:'🚨'},{id:'déclaration',l:'Déclaration',i:'📝'},{id:'indemnisation',l:'Indemnisation',i:'💰'},{id:'suivi',l:'Suivi',i:'📆'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_AT};
