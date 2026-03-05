'use client';
import { useState, useMemo } from 'react';
const PROC_DECO={id:'deconnexion',icon:'📵',categorie:'bienetre',titre:"Droit à la déconnexion",resume:"Depuis 2023, les entreprises de >20 travailleurs doivent conclure une CCT ou adapter le règlement de travail sur le droit à la déconnexion. Modalités d'utilisation des outils numériques en dehors des heures, formation, sensibilisation. Pas de sanction directe mais risque prud'homal.",
baseLegale:[{ref:"Loi 03/10/2022 (Deal pour l'emploi)",desc:"Droit à la déconnexion — obligation pour les entreprises ≥20 travailleurs"},{ref:"CCT n°162 (CNT 26/01/2023)",desc:"Cadre interprofessionnel du droit à la déconnexion"}],
etapes:[
  {n:1,phase:'mise_en_place',titre:"Obligation et contenu",detail:`═══ QUI EST CONCERNÉ ? ═══
• Entreprises de 20 travailleurs ou plus
• Calcul : moyenne des travailleurs sur les 4 trimestres précédents
• Si le seuil est atteint → obligation permanente (même si passage sous 20)

═══ CONTENU OBLIGATOIRE ═══
La CCT d'entreprise ou le règlement de travail doit prévoir :

1. MODALITÉS PRATIQUES de la déconnexion :
   • Pas d'obligation de répondre aux emails/appels en dehors des heures
   • Plages horaires de déconnexion (ex: 18h-8h, week-ends)
   • Exceptions : urgences, astreintes prévues au contrat

2. DIRECTIVES pour l'usage des outils numériques :
   • Bonnes pratiques pour les emails (envoi différé, etc.)
   • Gestion des notifications (téléphone pro, Teams, Slack)
   • Réunions tardives (interdites après une certaine heure ?)

3. FORMATION ET SENSIBILISATION :
   • Formation des managers et travailleurs
   • Sensibilisation aux risques du surconnexion (burn-out)

═══ PROCÉDURE ═══
• Via CCT d'entreprise (si délégation syndicale)
• OU via le règlement de travail (procédure de publicité 15 jours)
• Le CPPT doit être consulté (si existant)
• La CCT 162 fournit un cadre supplétif`,delai:"Depuis le 01/04/2023 — adaptation continue",formulaire:"CCT d'entreprise ou avenant au règlement de travail",ou:null,obligatoire:true,duree_estimee:'2-4h'},

  {n:2,phase:'gestion',titre:"Mise en œuvre et suivi",detail:`═══ BONNES PRATIQUES ═══
• Configurer l'envoi différé d'emails sur Outlook/Gmail
• Désactiver les notifications push après les heures de bureau
• Pop-up de rappel si email envoyé après 19h
• Pas de réunions après 17h30 (sauf accord)
• Signature email avec mention "Cet email ne requiert pas de réponse en dehors des heures de travail"

═══ EXCEPTIONS LÉGITIMES ═══
• Astreintes prévues contractuellement (rémunérées)
• Urgences exceptionnelles et imprévisibles
• Cadres dirigeants (mais même eux ont des limites)

═══ SUIVI ET ÉVALUATION ═══
• Évaluation annuelle au CPPT (ou CE)
• Indicateurs : nombre d'emails hors heures, réunions tardives
• Enquête de satisfaction des travailleurs
• Adaptation si nécessaire

═══ RISQUES EN CAS DE NON-RESPECT ═══
• Pas d'amende spécifique MAIS :
• Burn-out reconnu comme maladie professionnelle
• Responsabilité employeur si surcharge démontrée
• Tribunal du travail : dommages et intérêts
• Image employeur : attractivité et rétention`,delai:"Évaluation annuelle",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1h/an'},
],
alertes:[
  {niveau:'critique',texte:"Obligatoire depuis avril 2023 pour les entreprises ≥20 travailleurs. CCT d'entreprise ou adaptation du règlement de travail."},
  {niveau:'important',texte:"Former les managers : le droit à la déconnexion est un outil de prévention du burn-out. Le non-respect expose l'employeur."},
  {niveau:'attention',texte:"Les astreintes doivent être prévues contractuellement et rémunérées. Pas d'astreinte implicite."},
  {niveau:'info',texte:"La CCT 162 fournit un cadre supplétif : si l'entreprise n'a rien prévu, c'est la CCT interprofessionnelle qui s'applique."},
],
simulation:{titre:"Droit à la déconnexion — Impact",lignes:[
  {label:'Coût mise en place',montant:'Minimal (adaptation règlement)',type:'neutre'},
  {label:'Formation managers',montant:'±500-1.000€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Réduction absentéisme (burn-out)',montant:'-10 à -20%',type:'vert_bold'},
  {label:'Gain productivité',montant:'+5 à +15%',type:'vert'},
]},
faq:[
  {q:"Mon entreprise a 18 travailleurs — suis-je concerné ?",r:"Non, le seuil est de 20 travailleurs. Mais la CCT 162 s'applique à titre supplétif à toutes les entreprises. Et c'est une bonne pratique même sous le seuil."},
  {q:"Un travailleur peut-il être sanctionné s'il ne répond pas à un email le soir ?",r:"Non. C'est le principe même du droit à la déconnexion. Sauf si le contrat prévoit des astreintes spécifiques et rémunérées."},
],
formulaires:[{nom:"SPF Emploi — Droit à la déconnexion",url:"https://emploi.belgique.be/fr/themes/reglementation-du-travail/droit-la-deconnexion",type:'en_ligne'}]};
export default function ProcedureDeconnexion(){const P=PROC_DECO;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Impact',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_DECO};
