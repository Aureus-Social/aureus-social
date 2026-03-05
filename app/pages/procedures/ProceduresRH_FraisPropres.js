'use client';
import { useState, useMemo } from 'react';
const PROC_FP={id:'frais_propres',icon:'💰',categorie:'remuneration',titre:"Frais propres à l'employeur",resume:"Remboursement de frais professionnels exonéré d'ONSS et d'impôts. Forfaits ou frais réels. Indemnité bureau (télétravail) max 154,74€/mois (2026). Indemnité km voiture privée 0,4415€/km. Frais de représentation. Documentation obligatoire.",
baseLegale:[{ref:"Art. 31 CIR 1992",desc:"Remboursement de frais propres à l'employeur — exonération"},{ref:"Instruction ONSS 2020/1",desc:"Forfaits admis par l'ONSS — indemnités de bureau, km, représentation"},{ref:"Circulaire 2021/C/20 (SPF Finances)",desc:"Indemnité de bureau pour télétravail structurel"}],
etapes:[
  {n:1,phase:'forfaits',titre:"Forfaits ONSS admis — Les grands classiques",detail:`═══ INDEMNITÉ DE BUREAU (TÉLÉTRAVAIL) ═══
• Max 154,74€/mois (montant 2026 — indexé annuellement)
• Pour télétravail structurel (min 1 jour/semaine en moyenne)
• Couvre : chauffage, électricité, mobilier, internet, eau
• Exonéré ONSS + PP à 100%
• PAS cumulable avec le remboursement réel des mêmes frais

═══ INDEMNITÉ KILOMÉTRIQUE (voiture privée) ═══
• 0,4415€/km (montant 2026 — indexé trimestriellement)
• Pour déplacements professionnels (PAS domicile-travail !)
• Le domicile-travail a un régime fiscal distinct
• Maximum : le forfait fédéral (= même montant que fonctionnaires)
• Justificatif : relevé de km (date, destination, objet, km)

═══ FRAIS DE REPRÉSENTATION ═══
• Restaurant avec clients : frais réels (tickets + justificatifs)
• Cadeaux clients : forfait ou réels
• Déductibilité employeur : restaurant 69%, cadeaux 50%
• Pour le travailleur : exonéré si frais professionnels justifiés

═══ FORFAIT PETIT MATÉRIEL / GSM / INTERNET ═══
• Internet domicile (usage pro) : max 20€/mois forfait ONSS
• GSM / smartphone (usage pro) : max 20€/mois forfait ONSS (si pas pris en charge par l'employeur)
• PC / tablette (usage pro) : max 20€/mois forfait ONSS
• Cumulable avec l'indemnité de bureau

═══ FORFAIT VÊTEMENTS DE TRAVAIL ═══
• Vêtements obligatoires : frais réels ou forfait sectoriel
• Nettoyage : forfait admis (souvent ±5-10€/mois)`,delai:"Politique de frais à établir — application mensuelle",formulaire:"Politique de frais / note de frais",ou:null,obligatoire:true,duree_estimee:'1h mise en place'},

  {n:2,phase:'gestion',titre:"Frais réels vs forfaits — Choix et documentation",detail:`═══ CHOIX : FORFAIT OU FRAIS RÉELS ═══
L'employeur choisit pour CHAQUE catégorie de frais :
• Forfait ONSS (montants plafonnés) → pas de justificatif individuel
• Frais réels → justificatifs obligatoires (tickets, factures)

⚠️ PAS DE CUMUL : on ne peut pas cumuler forfait + frais réels pour la MÊME catégorie.
Ex : indemnité bureau 154,74€ + remboursement facture électricité = INTERDIT

═══ DOCUMENTATION OBLIGATOIRE ═══
Pour les forfaits :
• Politique de frais écrite (annexe au contrat ou règlement)
• Conditions clairement définies (qui, combien, quand)
• Registre des paiements

Pour les frais réels :
• Notes de frais détaillées
• Justificatifs originaux (tickets, factures)
• Approbation du manager / employeur
• Conservation 7 ans (fiscal)

═══ RISQUE DE REQUALIFICATION ═══
Si l'ONSS ou le fisc considère que les frais sont :
• Disproportionnés par rapport à la fonction
• Non justifiés ou mal documentés
• Cumulant forfait et réels pour la même catégorie
→ Requalification en RÉMUNÉRATION → ONSS + PP + amendes

═══ SIMULATION : PACKAGE FRAIS COMPLET ═══
Indemnité bureau : 154,74€/mois
+ Internet domicile : 20€/mois
+ GSM pro : 20€/mois
= 194,74€/mois EXONÉRÉ = 2.337€/an NET
Coût employeur : 2.337€ (pas de charges !)
Équivalent salaire brut : ±4.400€ (pour donner 2.337€ net)
Économie : ±2.063€/an/travailleur`,delai:"Mensuel — intégré à la fiche de paie",formulaire:"Notes de frais + justificatifs",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},
],
alertes:[
  {niveau:'critique',texte:"PAS DE CUMUL forfait + frais réels pour la même catégorie. Cumul = requalification en salaire."},
  {niveau:'critique',texte:"Documentation obligatoire : politique de frais écrite + justificatifs. Sans documentation = risque de redressement ONSS/fiscal."},
  {niveau:'important',texte:"Indemnité bureau télétravail : 154,74€/mois max (2026). Uniquement pour télétravail structurel (min 1j/semaine)."},
  {niveau:'important',texte:"Indemnité km : 0,4415€/km (2026). Uniquement pour déplacements PROFESSIONNELS (pas domicile-travail)."},
  {niveau:'attention',texte:"Les forfaits ONSS sont indexés. Vérifier les montants actualisés chaque année (janvier et parfois trimestriellement pour les km)."},
],
simulation:{titre:"Package frais — Économie annuelle (1 travailleur)",lignes:[
  {label:'Indemnité bureau',montant:'154,74€/mois',type:'neutre'},
  {label:'Internet pro',montant:'20€/mois',type:'neutre'},
  {label:'GSM pro',montant:'20€/mois',type:'neutre'},
  {label:'Total mensuel exonéré',montant:'194,74€/mois',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Total annuel NET travailleur',montant:'2.337€',type:'vert_bold'},
  {label:'Équivalent brut nécessaire',montant:'±4.400€ brut',type:'neutre'},
  {label:'Économie employeur/an',montant:'±2.063€',type:'vert_bold'},
]},
faq:[
  {q:"Le travailleur à temps partiel a-t-il droit au forfait bureau complet ?",r:"L'ONSS ne proratise pas automatiquement, mais un mi-temps télétravaillant 1j/sem peut recevoir le forfait. La proportionnalité doit être raisonnable par rapport à la réalité du télétravail."},
  {q:"L'indemnité km couvre-t-elle le trajet domicile-travail ?",r:"Non. Le forfait de 0,4415€/km couvre uniquement les déplacements professionnels. Le domicile-travail a un régime fiscal distinct (exonération partielle de l'intervention employeur)."},
],
formulaires:[{nom:"ONSS — Instructions frais propres",url:"https://www.socialsecurity.be/employer/instructions",type:'en_ligne'},{nom:"SPF Finances — Frais professionnels",url:"https://finances.belgium.be/fr/particuliers/declaration_impot/revenus/frais_professionnels",type:'en_ligne'}]};
export default function ProcedureFraisPropres(){const P=PROC_FP;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Économie',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_FP};
