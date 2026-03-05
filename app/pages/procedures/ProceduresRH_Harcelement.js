'use client';
import { useState, useMemo } from 'react';
const PROC_HARC={id:'harcelement',icon:'🛑',categorie:'bienetre',titre:"Harcèlement & risques psychosociaux",resume:"Obligation de prévention du harcèlement moral, sexuel et de la violence au travail. Personne de confiance + conseiller en prévention obligatoires. Procédure interne formelle et informelle. Protection du plaignant contre le licenciement. Sanctions pénales si pas de prévention.",
baseLegale:[{ref:"Loi 04/08/1996, chap. Vbis",desc:"Bien-être au travail — prévention des risques psychosociaux"},{ref:"AR 10/04/2014",desc:"Prévention des risques psychosociaux — procédures"},{ref:"Code pénal social, art. 119-132",desc:"Sanctions en cas de harcèlement ou absence de prévention"}],
etapes:[
  {n:1,phase:'prévention',titre:"Cadre légal et obligations de l'employeur",detail:`═══ DÉFINITIONS LÉGALES ═══

HARCÈLEMENT MORAL :
Ensemble abusif de conduites (paroles, intimidations, actes, gestes, écrits unilatéraux) ayant pour objet ou effet de porter atteinte à la personnalité, la dignité ou l'intégrité physique/psychique d'un travailleur.

HARCÈLEMENT SEXUEL :
Comportement non désiré à connotation sexuelle ayant pour objet ou effet de porter atteinte à la dignité d'une personne (verbal, non verbal, physique).

VIOLENCE AU TRAVAIL :
Situation où un travailleur est menacé ou agressé psychiquement ou physiquement lors de l'exécution du travail (y compris par des tiers : clients, patients, etc.).

═══ OBLIGATIONS DE L'EMPLOYEUR ═══
1. Analyse des risques psychosociaux (avec le SEPP)
2. Mesures de prévention (plan global + plan annuel)
3. Désigner une personne de confiance (interne, recommandé)
4. Conseiller en prévention aspects psychosociaux (SEPP)
5. Procédure interne dans le règlement de travail
6. Information des travailleurs sur les procédures
7. Formation des managers à la détection et prévention`,delai:"Dès le 1er travailleur — continu",formulaire:"Analyse des risques + plan de prévention",ou:null,obligatoire:true,duree_estimee:'4-8h mise en place'},

  {n:2,phase:'procédure',titre:"Procédure interne — Informelle et formelle",detail:`═══ PHASE INFORMELLE ═══
Le travailleur peut s'adresser à :
• La personne de confiance (interne)
• Le conseiller en prévention psychosocial (SEPP)

Options :
1. ENTRETIEN PERSONNEL : écoute, conseil, orientation
2. INTERVENTION AUPRÈS D'UN TIERS : le conseiller contacte l'autre partie
3. CONCILIATION : réunir les parties pour trouver une solution

═══ PHASE FORMELLE ═══
Si l'informel échoue ou si la gravité l'exige :

1. DEMANDE FORMELLE écrite au conseiller en prévention
   • Identité, description des faits, dommage, mesures demandées
   • Le conseiller informe l'employeur de la demande

2. ANALYSE par le conseiller (3 MOIS max)
   • Entretien avec le demandeur et la personne mise en cause
   • Examen du contexte de travail
   • Avis motivé avec recommandations

3. AVIS remis à l'employeur
   • L'employeur DOIT prendre des mesures dans un délai raisonnable
   • Si pas de mesures → le conseiller peut saisir l'inspection sociale

4. SUIVI par le conseiller
   • Vérification de la mise en œuvre des mesures

═══ PROTECTION DU PLAIGNANT ═══
• Protection contre le licenciement dès la demande formelle
• Durée : 12 MOIS après la demande
• Licenciement pendant la protection = indemnité de 6 MOIS de salaire
• La protection s'étend aux témoins`,delai:"Informel : pas de délai — Formel : avis dans 3 mois",formulaire:"Demande d'intervention psychosociale formelle",ou:"Personne de confiance ou SEPP",obligatoire:true,duree_estimee:'Variable'},

  {n:3,phase:'sanctions',titre:"Sanctions et recours",detail:`═══ SANCTIONS DISCIPLINAIRES ═══
Si le harcèlement est avéré :
• Avertissement écrit
• Mutation de l'auteur
• Suspension
• Licenciement pour motif grave (si faits suffisamment graves)

═══ SANCTIONS PÉNALES ═══
• Harcèlement moral/sexuel : amende 600-6.000€ et/ou emprisonnement 6 mois-3 ans
• Pas de prévention par l'employeur : amende 400-4.000€

═══ RECOURS DU TRAVAILLEUR ═══
• Inspection sociale (contrôle du bien-être au travail)
• Tribunal du travail (demande de cessation + dommages et intérêts)
• Auditorat du travail (plainte pénale)
• Centre pour l'égalité des chances (si discrimination)

═══ REGISTRE DES FAITS DE TIERS ═══
Si violence de la part de tiers (clients, patients) :
• L'employeur tient un registre des faits
• Analyse et mesures de prévention spécifiques
• Formation du personnel exposé`,delai:null,formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},
],
alertes:[
  {niveau:'critique',texte:"Obligation de prévention : analyse des risques psychosociaux + personne de confiance + procédure au règlement de travail. Absence = amende 400-4.000€."},
  {niveau:'critique',texte:"Protection du plaignant : 12 mois après la demande formelle. Licenciement = indemnité 6 mois. La protection s'étend aux témoins."},
  {niveau:'important',texte:"Le conseiller en prévention a 3 MOIS pour rendre son avis. L'employeur DOIT prendre des mesures suite à l'avis."},
  {niveau:'important',texte:"Le harcèlement est une infraction PÉNALE : jusqu'à 3 ans d'emprisonnement et 6.000€ d'amende."},
  {niveau:'attention',texte:"Former les managers à la détection du harcèlement. 80% des cas se résolvent en phase informelle si détectés tôt."},
],
simulation:{titre:"Coûts liés au harcèlement non traité",lignes:[
  {label:'Indemnité protection plaignant',montant:'6 mois de salaire',type:'neutre'},
  {label:'Dommages tribunal du travail',montant:'5.000-50.000€',type:'neutre'},
  {label:'Amende pénale absence prévention',montant:'400-4.000€',type:'neutre'},
  {label:'Absentéisme lié au harcèlement',montant:'±30% d\'augmentation',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût prévention (formation + procédure)',montant:'±1.000-3.000€/an',type:'vert_bold'},
]},
faq:[
  {q:"La personne de confiance est-elle obligatoire ?",r:"Fortement recommandée. Obligatoire si un travailleur en fait la demande (entreprises >50 travailleurs). Dans les PME, le rôle peut être assumé par le conseiller en prévention du SEPP."},
  {q:"Un conflit entre collègues est-il du harcèlement ?",r:"Pas nécessairement. Le harcèlement suppose un caractère répétitif et abusif. Un conflit ponctuel n'est pas du harcèlement, mais il peut le devenir s'il n'est pas géré."},
],
formulaires:[{nom:"SPF Emploi — Risques psychosociaux",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail/risques-psychosociaux-au-travail",type:'en_ligne'}]};
export default function ProcedureHarcelement(){const P=PROC_HARC;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_HARC};
