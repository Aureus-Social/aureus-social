'use client';
import { useState, useMemo } from 'react';
const PROC_VS={id:'voiture_societe',icon:'🚗',categorie:'remuneration',titre:"Voiture de société",resume:"Avantage en nature très courant en Belgique. ATN calculé sur base du CO₂ et de la valeur catalogue. Cotisation CO₂ employeur mensuelle. Carte carburant possible. Budget mobilité comme alternative depuis 2022. Impact fiscal pour le travailleur et l'employeur.",
baseLegale:[{ref:"Art. 36 CIR 1992",desc:"Avantage de toute nature — voiture de société"},{ref:"AR 28/02/2019 (cotisation CO₂)",desc:"Cotisation de solidarité CO₂ — calcul mensuel employeur"},{ref:"Loi 17/03/2019",desc:"Budget mobilité — alternative à la voiture de société"}],
etapes:[
  {n:1,phase:'mise_en_place',titre:"ATN voiture et cotisation CO₂",detail:`═══ AVANTAGE DE TOUTE NATURE (ATN) ═══
L'ATN voiture de société est un avantage IMPOSABLE pour le travailleur.

Formule ATN = Valeur catalogue × % CO₂ × 6/7 × coefficient d'âge

% CO₂ (2026) :
• Référence : 91g CO₂/km (essence) ou 78g CO₂/km (diesel)
• Base : 5,5% de la valeur catalogue
• +0,1% par g au-dessus de la référence
• -0,1% par g en dessous (min 4%)
• Électrique : ATN minimum forfaitaire (±1.600€/an en 2026)

Coefficient d'âge (dégressivité) :
• Année 1 : 100%
• Année 2 : 94%
• Année 3 : 88%
• Année 4 : 82%
• Année 5+ : 76% (minimum)
• Minimum absolu ATN : 1.600€/an (2026)

Exemple : BMW 330i, valeur catalogue 55.000€, 142g CO₂ essence, neuve
• % = 5,5% + (142-91) × 0,1% = 5,5% + 5,1% = 10,6%
• ATN = 55.000 × 10,6% × 6/7 = 4.994€/an = 416€/mois
• Le travailleur paie ±40% d'impôt sur 416€ = ±166€/mois d'impôt supplémentaire

═══ COTISATION CO₂ EMPLOYEUR (mensuelle) ═══
Cotisation de solidarité payée par l'employeur à l'ONSS.
• Essence : [(CO₂ × 9€) - 768€] / 12 × indice (min ±31€/mois)
• Diesel : [(CO₂ × 9€) - 600€] / 12 × indice (min ±26€/mois)
• Électrique : cotisation minimum (±31€/mois en 2026)
• Hybride : cotisation calculée sur le CO₂ (attention aux faux hybrides !)

Exemple BMW 330i (142g essence) :
• (142 × 9 - 768) / 12 = ±42€/mois avant indexation`,delai:"Dès la mise à disposition du véhicule",formulaire:"Fiche ATN + DmfA",ou:null,obligatoire:true,duree_estimee:'1h de calcul'},

  {n:2,phase:'gestion',titre:"Car policy + alternatives (budget mobilité)",detail:`═══ CAR POLICY ═══
Document interne définissant les règles :
• Catégories de véhicules par fonction/grade
• Budget maximum par catégorie
• Usage privé autorisé (oui/non, km max)
• Carte carburant (plafond mensuel)
• Entretien, assurance, pneus (pris en charge ou non)
• Restitution en cas de départ
• Contribution personnelle du travailleur (réduit l'ATN)

═══ BUDGET MOBILITÉ (depuis 2022) ═══
Alternative à la voiture de société — 3 PILIERS :

Pilier 1 : Voiture écologique
• Véhicule plus petit / électrique
• ATN réduit

Pilier 2 : Mobilité douce
• Transports en commun, vélo, trottinette
• Location, covoiturage
• Logement près du travail (loyer/intérêts hypothécaires)
• EXONÉRÉ d'ONSS et d'impôt

Pilier 3 : Solde en cash
• Ce qui reste du budget
• Cotisation spéciale 38,07%
• Pas d'ONSS ordinaire, pas de PP

═══ DÉDUCTIBILITÉ EMPLOYEUR ═══
• Voitures thermiques : déductibilité en baisse (0% dès 2028 pour nouvelles commandes)
• Électrique : 100% déductible (jusqu'en 2026), puis dégressif
• Bornes de recharge : déductibilité majorée (150%)`,delai:"Car policy à établir avant la mise à disposition",formulaire:"Car policy + avenant au contrat",ou:null,obligatoire:true,duree_estimee:'2-4h'},
],
alertes:[
  {niveau:'critique',texte:"L'ATN voiture est un revenu IMPOSABLE pour le travailleur. Il doit figurer sur la fiche de paie et la 281.10."},
  {niveau:'critique',texte:"Cotisation CO₂ employeur MENSUELLE obligatoire à l'ONSS. Oubli = redressement + majorations."},
  {niveau:'important',texte:"Déductibilité voitures thermiques en chute libre : 0% pour les nouvelles commandes dès 2028. Privilégier l'électrique."},
  {niveau:'attention',texte:"Le budget mobilité est une alternative avantageuse : le pilier 2 est totalement exonéré (ONSS + PP)."},
],
simulation:{titre:"Voiture de société — Coût annuel employeur (BMW 330i, 55.000€ catalogue)",lignes:[
  {label:'Leasing mensuel',montant:'±750€/mois = 9.000€/an',type:'neutre'},
  {label:'Carburant/charge',montant:'±200€/mois = 2.400€/an',type:'neutre'},
  {label:'Assurance + entretien',montant:'±150€/mois = 1.800€/an',type:'neutre'},
  {label:'Cotisation CO₂ ONSS',montant:'±42€/mois = 504€/an',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût total employeur',montant:'±13.704€/an',type:'vert_bold'},
  {label:'ATN travailleur',montant:'±4.994€/an (±166€/mois impôt)',type:'neutre'},
]},
faq:[
  {q:"Le travailleur peut-il refuser la voiture de société ?",r:"Oui. L'avantage voiture n'est pas obligatoire. Le travailleur peut préférer une augmentation de salaire ou le budget mobilité (si proposé par l'employeur)."},
  {q:"Que se passe-t-il si le travailleur quitte l'entreprise ?",r:"Le véhicule doit être restitué. La car policy prévoit généralement les modalités (délai, état du véhicule, km excédentaires)."},
],
formulaires:[{nom:"SPF Finances — ATN voiture",url:"https://finances.belgium.be/fr/particuliers/transport/voitures-de-societe",type:'en_ligne'}]};
export default function ProcedureVoitureSociete(){const P=PROC_VS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_VS};
