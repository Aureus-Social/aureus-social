'use client';
import { useState, useMemo } from 'react';
const PROC_CE={id:'clause_ecolage',icon:'🎓',categorie:'contrat',titre:"Clause d'écolage",resume:"Clause obligeant le travailleur à rester dans l'entreprise après une formation coûteuse, sous peine de rembourser une partie des frais. Salaire annuel brut > 43.335€ (2026). Durée max 3 ans. Montant dégressif. Obligatoirement par écrit. Nulle si mal rédigée.",
baseLegale:[{ref:"Art. 22bis loi 3/07/1978",desc:"Clause d'écolage — conditions de validité"},{ref:"CCT n°72 du 30/03/1999",desc:"Formation professionnelle en entreprise — protection travailleur"},{ref:"Seuil salarial 2026",desc:"Clause valide si salaire annuel brut > 43.335€ (indexé annuellement)"}],
etapes:[
{n:1,phase:'conditions',titre:"Conditions de validité",detail:`═══ CONDITIONS CUMULATIVES (art. 22bis) ═══
• Salaire annuel brut > 43.335 € (seuil 2026 — indexé)
• Formation d'une durée > 80 heures de travail
OU valeur de la formation > un certain seuil (à vérifier CCT)
• Contrat écrit OBLIGATOIRE (clause distincte du contrat principal)
• Avant le début de la formation

═══ LA CLAUSE DOIT MENTIONNER ═══
• Nature de la formation
• Coût total de la formation
• Durée d'engagement demandée (max 3 ans)
• Montant du remboursement (dégressif)

═══ NULLITÉ AUTOMATIQUE SI ═══
• Salaire < seuil légal
• Formation < 80h et valeur insuffisante
• Pas de contrat écrit
• Durée > 3 ans
• Montants non dégressifs
• Formation ne profite pas exclusivement à l'employeur`,delai:"Avant le début de la formation",formulaire:"Contrat écrit clause d'écolage",ou:"Conseiller juridique",obligatoire:true,duree_estimee:'2h'},
{n:2,phase:'remboursement',titre:"Calcul du remboursement dégressif",detail:`═══ SYSTÈME DÉGRESSIF OBLIGATOIRE ═══
Le remboursement doit diminuer au fil du temps.
Exemple pour une formation de 10.000€ avec engagement 3 ans :

• Départ dans l'année 1 : 80% = 8.000 €
• Départ dans l'année 2 : 50% = 5.000 €
• Départ dans l'année 3 : 20% = 2.000 €
• Après 3 ans : 0 € (engagement terminé)

═══ PLAFONDS (art. 22bis §2) ═══
• Max 80% du coût si durée engagement ≤ 1 an
• Max 50% si durée 1-2 ans
• Max 20% si durée 2-3 ans

═══ CAS OÙ PAS DE REMBOURSEMENT ═══
• Licenciement par l'employeur SANS motif grave
• Fin de CDD non renouvelé à l'initiative de l'employeur
• Rupture pour faute grave de l'employeur`,delai:"Au moment du départ du travailleur",formulaire:"Décompte remboursement",ou:"Service juridique",obligatoire:true,duree_estimee:'1h'},
{n:3,phase:'exceptions',titre:"Cas où la clause ne s'applique pas",detail:`═══ AUCUN REMBOURSEMENT DÛ SI ═══
• Licenciement par l'employeur (sauf motif grave)
• Rupture pour faute grave de l'employeur
• Fin de CDD : clause ne s'applique pas aux CDD
• Démission pour motif grave de l'employeur
• Retrait d'un permis nécessaire à l'exercice de la fonction

═══ REMBOURSEMENT POSSIBLE SI ═══
• Démission volontaire du travailleur
• Licenciement pour motif grave DU TRAVAILLEUR
• Dans les délais et limites définis dans la clause`,delai:"Vérifier le motif de départ avant toute réclamation",formulaire:null,ou:"Tribunal du travail si litige",obligatoire:true,duree_estimee:'1h'},
],
alertes:[{niveau:'critique',texte:"Nullité automatique si salaire < 43.335€ ou formation < 80h ou clause non écrite. Une clause invalide ne peut pas être exécutée."},{niveau:'critique',texte:"PAS de remboursement si l'employeur licencie sans motif grave. La clause ne protège que contre la démission volontaire."},{niveau:'important',texte:"Montants dégressifs OBLIGATOIRES. Une clause avec montant fixe sur 3 ans est nulle de plein droit (art. 22bis §2)."}],
simulation:{titre:"Clause écolage — Formation 10.000€, 3 ans",lignes:[{label:"Départ an 1 (80% max)",montant:"8.000 €",type:'neutre'},{label:"Départ an 2 (50% max)",montant:"5.000 €",type:'neutre'},{label:"Départ an 3 (20% max)",montant:"2.000 €",type:'neutre'},{label:'',montant:'',type:'separateur'},{label:"Après 3 ans",montant:"0 € — engagement terminé",type:'vert_bold'}]},
faq:[{q:"La clause d'écolage est-elle valable pour tous les travailleurs ?",r:"Non. Elle n'est valable que si le salaire annuel brut dépasse 43.335€ (2026). En dessous de ce seuil, la clause est nulle de plein droit, même si elle est rédigée correctement."},{q:"Que se passe-t-il si l'employeur licencie le travailleur ?",r:"Si l'employeur licencie sans motif grave, aucun remboursement ne peut être exigé. La clause ne protège que contre la démission volontaire du travailleur ou son licenciement pour motif grave."},{q:"La clause peut-elle porter sur plus de 3 ans ?",r:"Non. La durée maximale d'engagement est de 3 ans. Une clause prévoyant une durée plus longue est nulle dans son ensemble, pas seulement pour la partie excédentaire."},{q:"Faut-il toujours rédiger un document séparé ?",r:"Oui. La clause d'écolage doit figurer dans un document écrit DISTINCT du contrat de travail principal, signé avant le début de la formation. Une clause incluse dans le contrat sans être distincte est nulle."}],
formulaires:[{nom:"SPF Emploi — Clause d'écolage",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/clause-decolage",type:'en_ligne'}]};
export default function ProcedureClauseEcolage(){const P=PROC_CE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}> {pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}> {v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Info'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>;})}
</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}{P.formulaires&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:700,color:'#94a3b8',marginBottom:8}}>📎 Formulaires officiels</h3>{P.formulaires.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'10px 14px',background:'#111827',borderRadius:8,marginBottom:6,color:'#60a5fa',fontSize:13,textDecoration:'none'}}>🔗 {f.nom}</a>)}</div>}</div>}</div>);}
export {PROC_CE};