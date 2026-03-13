'use client';
import { useState, useMemo } from 'react';
const PROC_LA={id:'lanceurs_alerte',icon:'🚨',categorie:'legal',titre:"Lanceurs d'alerte (Loi 2022)",resume:"Protection des personnes signalant des violations du droit UE ou belge. Obligatoire pour entreprises ≥ 50 travailleurs : canal de signalement interne. Protection absolue contre les représailles. Loi du 28/11/2022. Amende jusqu'à 10.000€ pour représailles.",
baseLegale:[{ref:"Loi du 28 novembre 2022",desc:"Protection des lanceurs d'alerte — transposition directive UE 2019/1937"},{ref:"Directive UE 2019/1937 du 23/10/2019",desc:"Protection des personnes signalant des violations du droit de l'Union"},{ref:"AR du 22 décembre 2022",desc:"Modalités des canaux de signalement internes et externes"}],
etapes:[
{n:1,phase:'obligation',titre:"Obligation du canal interne (≥ 50 travailleurs)",detail:`═══ QUI EST OBLIGÉ ? ═══
• Entreprises du secteur privé avec ≥ 50 travailleurs : obligatoire
• Secteur public : toutes entités
• Entreprises < 50 travailleurs : fortement recommandé

═══ LE CANAL INTERNE DOIT PERMETTRE ═══
• Signalements ÉCRITS (formulaire sécurisé, email dédié)
• Signalements ORAUX (ligne téléphonique dédiée)
• Signalements en présentiel sur demande
• Confidentialité garantie de l'identité du signalant

═══ LE RESPONSABLE DU CANAL ═══
• Désigner une personne de confiance interne ou externe
• Formation spécifique recommandée
• Accusé de réception dans les 7 jours
• Retour d'information dans les 3 mois`,delai:"Mise en place immédiate si ≥ 50 travailleurs",formulaire:"Politique interne lanceurs d'alerte",ou:"SPF Justice — canal externe",obligatoire:true,duree_estimee:'4h mise en place'},
{n:2,phase:'protection',titre:"Protection absolue contre les représailles",detail:`═══ QUI EST PROTÉGÉ ? ═══
• Le lanceur d'alerte lui-même
• Les personnes qui l'ont aidé
• Les témoins
• Les collègues et proches liés à lui

═══ CE QUI CONSTITUE DES REPRÉSAILLES INTERDITES ═══
• Licenciement ou menace de licenciement
• Rétrogradation ou blocage de promotion
• Changement de fonctions non voulu
• Mise à l'écart, harcèlement
• Évaluation négative ou mauvaise référence
• Toute discrimination liée au signalement

═══ SANCTIONS EN CAS DE REPRÉSAILLES ═══
• Amende administrative : 250 à 10.000 €
• Nullité du licenciement si lié au signalement
• Indemnité : min 6 mois de salaire brut
• Réintégration possible`,delai:"Protection dès le signalement",formulaire:null,ou:"SPF Justice ou tribunal du travail",obligatoire:true,duree_estimee:'1h'},
{n:3,phase:'violations',titre:"Violations visées par la loi",detail:`═══ DOMAINES COUVERTS ═══
• Marchés publics et aides d'État
• Concurrence et aides d'État
• Droit financier et fiscal (fraude TVA, blanchiment)
• Sécurité des produits et transports
• Protection de l'environnement
• Sécurité nucléaire
• Protection de la vie privée (RGPD)
• Sécurité des réseaux et systèmes d'information
• Intérêts financiers de l'UE
• Droit social belge

═══ SIGNALEMENT EXTERNE ═══
• Autorité compétente selon le domaine
• Canal externe SPF Justice
• Possibilité de signalement public (media, etc.) en dernier recours`,delai:"Signalement possible à tout moment",formulaire:"Formulaire SPF Justice",ou:"www.whistleblowing.be",obligatoire:false,duree_estimee:'1h'},
],
alertes:[{niveau:'critique',texte:"Entreprises ≥ 50 travailleurs : canal interne OBLIGATOIRE depuis fin 2023. Absence = infraction à la loi du 28/11/2022."},{niveau:'critique',texte:"Représailles contre un lanceur d'alerte : amende 250-10.000€ + nullité licenciement + indemnité min 6 mois."},{niveau:'important',texte:"La personne de confiance/responsable du canal doit être désignée, formée et accessible. Confidentialité absolue de l'identité du signalant."}],
simulation:{titre:"Mise en conformité — Entreprise 50+ travailleurs",lignes:[{label:"Rédaction politique interne",montant:"2-4h juridique",type:'neutre'},{label:"Mise en place canal sécurisé",montant:"Logiciel dédié ou boîte mail chiffrée",type:'neutre'},{label:"Formation responsable canal",montant:"~500-1.000 €",type:'neutre'},{label:'',montant:'',type:'separateur'},{label:"Amende si non-conformité",montant:"Jusqu'à 10.000 €",type:'vert_bold'}]},
faq:[{q:"Quelles entreprises sont obligées d'avoir un canal interne ?",r:"Les entreprises du secteur privé comptant 50 travailleurs ou plus sont obligées de mettre en place un canal de signalement interne. En dessous de 50, c'est fortement recommandé mais pas obligatoire."},{q:"Un lanceur d'alerte peut-il rester anonyme ?",r:"Oui. Le canal interne doit permettre les signalements anonymes. La loi protège également les signalants non anonymes en garantissant la confidentialité de leur identité."},{q:"Que risque un employeur qui licencie un lanceur d'alerte ?",r:"Le licenciement est considéré comme nul s'il est lié au signalement. L'employeur risque une amende de 250 à 10.000€, doit verser une indemnité d'au moins 6 mois de salaire et peut être contraint à réintégrer le travailleur."},{q:"Un travailleur peut-il signaler directement à l'extérieur sans passer par le canal interne ?",r:"Oui, si le canal interne n'existe pas, n'a pas répondu dans les délais (3 mois), ou si le travailleur craint des représailles internes. Le signalement externe à l'autorité compétente est toujours possible."}],
formulaires:[{nom:"SPF Justice — Canaux de signalement externes",url:"https://www.whistleblowing.be",type:'en_ligne'},{nom:"Loi du 28 novembre 2022 — texte complet",url:"https://www.ejustice.just.fgov.be",type:'en_ligne'}]};
export default function ProcedureLanceursAlerte(){const P=PROC_LA;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}> {pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}> {v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Info'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>;})}
</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}{P.formulaires&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:700,color:'#94a3b8',marginBottom:8}}>📎 Formulaires officiels</h3>{P.formulaires.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'10px 14px',background:'#111827',borderRadius:8,marginBottom:6,color:'#60a5fa',fontSize:13,textDecoration:'none'}}>🔗 {f.nom}</a>)}</div>}</div>}</div>);}
export {PROC_LA};