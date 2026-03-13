'use client';
import { useState, useMemo } from 'react';
const PROC_DIS={id:'discrimination',icon:'⚖️',categorie:'legal',titre:"Discrimination & égalité de traitement",resume:"19 critères protégés (âge, sexe, handicap, orientation sexuelle, origine, etc.). Discrimination directe et indirecte interdites. Charge de la preuve partagée : le travailleur présente des faits qui font présumer la discrimination, l'employeur doit prouver l'absence de discrimination. Indemnité 6 mois de salaire minimum.",
baseLegale:[{ref:"Loi du 10 mai 2007 (loi anti-discrimination)",desc:"Protection contre la discrimination fondée sur 19 critères"},{ref:"Loi du 10 mai 2007 (loi genre)",desc:"Égalité hommes/femmes dans l'emploi"},{ref:"Loi du 30 juillet 1981 (loi racisme)",desc:"Protection contre le racisme et la xénophobie"},{ref:"AR du 14 juillet 1987",desc:"Égalité de rémunération H/F — obligation rapport bisannuel"}],
etapes:[
{n:1,phase:'criteres',titre:"Les 19 critères protégés",detail:`═══ CRITÈRES PROTÉGÉS (loi 10/05/2007) ═══
1. Âge
2. Orientation sexuelle
3. État civil
4. Naissance
5. Patrimoine
6. Conviction religieuse ou philosophique
7. Conviction politique
8. Langue
9. État de santé actuel ou futur
10. Handicap ou caractéristique physique
11. Caractéristique génétique
12. Origine sociale
13. Nationalité
14. Prétendue race
15. Couleur de peau
16. Ascendance
17. Origine nationale ou ethnique
18. Sexe (loi genre)
19. Critères liés à la maternité/grossesse (loi genre)

═══ DISCRIMINATION DIRECTE ═══
Traitement moins favorable basé directement sur un critère protégé.
Ex: refus d'embauche d'une femme enceinte

═══ DISCRIMINATION INDIRECTE ═══
Mesure neutre en apparence mais désavantageuse pour un groupe protégé.
Ex: condition de hauteur minimum qui exclut systématiquement les femmes`,delai:"Constatation immédiate",formulaire:"Plainte UNIA ou tribunal",ou:"UNIA (Centre Interfédéral Égalité)",obligatoire:true,duree_estimee:'2h analyse'},
{n:2,phase:'preuve',titre:"Charge de la preuve partagée",detail:`═══ MÉCANISME DE LA PREUVE ═══
1. Le travailleur présente des FAITS qui font PRÉSUMER la discrimination
   Ex: statistiques, comparaisons, comportement de l'employeur
   
2. L'EMPLOYEUR doit alors PROUVER qu'il n'y a pas eu discrimination
   Ex: justification objective et légitime, critère de sélection neutre

═══ CE QUI CONSTITUE UN INDICE DE DISCRIMINATION ═══
• Différence de traitement non expliquée entre personnes comparables
• Propos discriminatoires documentés
• Statistiques défavorables pour un groupe protégé
• Chronologie suspecte (licenciement juste après divulgation grossesse)
• Témoignages de collègues

═══ JUSTIFICATION POSSIBLE (discrimination indirecte seulement) ═══
• Objectif légitime
• Mesure appropriée et nécessaire à cet objectif
• Proportionnée au but poursuivi`,delai:"Constitution du dossier de preuves",formulaire:"Témoignages écrits + documents",ou:"Syndicat ou avocat spécialisé",obligatoire:true,duree_estimee:'4h'},
{n:3,phase:'sanctions',titre:"Sanctions et recours",detail:`═══ SANCTIONS CIVILES ═══
• Indemnité forfaitaire : 6 mois de salaire brut (si pas d'embauche ou licenciement)
• Ou réparation du préjudice réel si supérieur (avec preuve)
• Nullité de la décision discriminatoire (licenciement, refus embauche)

═══ SANCTIONS PÉNALES ═══
• Amende : 50 à 1.000 € par infraction × décimes additionnels
• Possibilité d'emprisonnement dans les cas les plus graves (harcèlement discriminatoire)

═══ RECOURS POSSIBLES ═══
• Plainte à UNIA (Centre Interfédéral pour l'Égalité des Chances)
• Institut pour l'Égalité des Femmes et des Hommes (IEFH) pour critère genre
• Inspection sociale SPF ETCS
• Tribunal du travail (action civile)
• Procureur du Roi (action pénale)

═══ RAPPORT BISANNUEL ÉCART SALARIAL H/F ═══
• Obligatoire pour entreprises ≥ 50 travailleurs tous les 2 ans
• Analyse des différences de rémunération H/F
• Présentation au CE ou délégation syndicale`,delai:"Plainte dans les 3 mois (UNIA) ou 5 ans (tribunal)",formulaire:"Formulaire de plainte UNIA",ou:"unia.be — 0800 12 800",obligatoire:true,duree_estimee:'4h+ si litige'},
],
alertes:[{niveau:'critique',texte:"Charge de la preuve partagée : dès qu'un travailleur présente des indices de discrimination, c'est à l'employeur de prouver l'absence de discrimination."},{niveau:'critique',texte:"Rapport bisannuel écart salarial H/F obligatoire pour entreprises ≥ 50 travailleurs. Non-respect = infraction."},{niveau:'important',texte:"Discriminer lors du recrutement est aussi illégal qu'en cours de contrat. Les annonces d'emploi discriminatoires (âge, sexe, etc.) sont interdites."}],
simulation:{titre:"Risque financier — Discrimination avérée",lignes:[{label:"Indemnité civile minimum",montant:"6 mois × salaire brut",type:'neutre'},{label:"Ex: salaire 3.000€ → indemnité",montant:"18.000 €",type:'neutre'},{label:"Frais de procédure (avocat + tribunal)",montant:"2.000-10.000 €",type:'neutre'},{label:'',montant:'',type:'separateur'},{label:"Coût total risque discrimination",montant:"20.000-30.000 €",type:'vert_bold'}]},
faq:[{q:"Un employeur peut-il demander l'âge lors d'un entretien d'embauche ?",r:"Non. L'âge est un critère protégé. Demander l'âge, la date de naissance, ou poser des questions qui permettent de le déduire est une pratique discriminatoire lors du recrutement."},{q:"La discrimination positive est-elle permise ?",r:"Oui. Les mesures d'action positive (ex: préférence à compétences égales pour un groupe sous-représenté) sont autorisées si elles sont temporaires, proportionnées et visent à rétablir une égalité réelle."},{q:"Que faire si un employé se plaint de discrimination ?",r:"Traiter la plainte sérieusement : enquête interne, entretien avec les parties, documentation. Contacter UNIA pour conseil. Éviter toute mesure de représailles contre le plaignant (protection spéciale)."},{q:"Le harcèlement est-il une forme de discrimination ?",r:"Le harcèlement basé sur un critère protégé (ex: harcèlement racial, harcèlement lié à l'orientation sexuelle) constitue une forme de discrimination au sens des lois anti-discrimination. Il peut aussi être poursuivi sous la loi sur le bien-être au travail."}],
formulaires:[{nom:"UNIA — Introduire une plainte",url:"https://www.unia.be/fr/introduire-plainte",type:'en_ligne'},{nom:"IEFH — Institut Égalité Femmes/Hommes",url:"https://igvm-iefh.belgium.be",type:'en_ligne'}]};
export default function ProcedureDiscrimination(){const P=PROC_DIS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}> {pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}> {v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Info'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>;})}
</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}{P.formulaires&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:700,color:'#94a3b8',marginBottom:8}}>📎 Formulaires officiels</h3>{P.formulaires.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'10px 14px',background:'#111827',borderRadius:8,marginBottom:6,color:'#60a5fa',fontSize:13,textDecoration:'none'}}>🔗 {f.nom}</a>)}</div>}</div>}</div>);}
export {PROC_DIS};