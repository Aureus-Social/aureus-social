'use client';
import { useState, useMemo } from 'react';
const PROC_RGPD={id:'rgpd',icon:'🔒',categorie:'formation',titre:"RGPD au travail",resume:"Le RGPD s'applique pleinement aux données des travailleurs. Registre des traitements obligatoire. Informations à fournir aux travailleurs. Caméras, géolocalisation, emails encadrés. DPO obligatoire dans certains cas. Amendes jusqu'à 4% du CA mondial.",
baseLegale:[{ref:"RGPD (Règlement UE 2016/679)",desc:"Protection des données personnelles — principes, droits, obligations"},{ref:"CCT n°68",desc:"Caméras de surveillance sur le lieu de travail"},{ref:"CCT n°81",desc:"Contrôle des données de communication électronique en réseau"}],
etapes:[
  {n:1,phase:'conformité',titre:"Obligations de l'employeur — Données RH",detail:`═══ DONNÉES RH TRAITÉES ═══
L'employeur traite de nombreuses données personnelles :
• Identité (nom, adresse, NISS, photo)
• Contrat de travail et conditions
• Données salariales et bancaires
• Évaluations de performance
• Données médicales (certificats, AT, médecine du travail)
• Données de présence et de temps de travail
• Communications (emails, internet)
• Images (caméras, badges)

═══ PRINCIPES RGPD APPLICABLES ═══
1. LICÉITÉ : base juridique pour chaque traitement
   • Exécution du contrat de travail
   • Obligation légale (ONSS, fisc, DIMONA)
   • Intérêt légitime (sécurité, gestion)
   • Consentement (RAREMENT valable en contexte RH !)

2. FINALITÉ : uniquement pour les buts annoncés
3. MINIMISATION : ne collecter que le nécessaire
4. EXACTITUDE : données à jour
5. LIMITATION DE CONSERVATION : durées définies
6. SÉCURITÉ : protection technique et organisationnelle

═══ REGISTRE DES TRAITEMENTS ═══
OBLIGATOIRE pour les entreprises ≥250 travailleurs.
Recommandé pour toutes. Contenu :
• Catégories de données traitées
• Finalités du traitement
• Base juridique
• Destinataires (ONSS, secrétariat social, etc.)
• Durées de conservation
• Mesures de sécurité`,delai:"Permanent — mise en conformité continue",formulaire:"Registre des traitements + politique de confidentialité",ou:null,obligatoire:true,duree_estimee:'4-8h mise en place'},

  {n:2,phase:'contrôle',titre:"Surveillance : caméras, emails, géolocalisation",detail:`═══ CAMÉRAS (CCT n°68) ═══
Utilisation autorisée UNIQUEMENT pour :
1. Sécurité et santé
2. Protection des biens
3. Contrôle du processus de production
4. Contrôle du travail du travailleur (le PLUS restrictif)

Obligations :
• Information préalable au CE (ou CPPT, ou travailleurs)
• Mention dans le règlement de travail
• Signalisation visible (pictogramme)
• Pas de surveillance permanente des travailleurs
• Pas de caméras dans les vestiaires, toilettes, locaux syndicaux

═══ EMAILS / INTERNET (CCT n°81) ═══
Le contrôle des communications électroniques est possible mais ENCADRÉ :
• Information préalable (règlement de travail ou politique IT)
• Finalités limitées (prévention d'actes illicites, protection secrets, sécurité réseau, respect règles)
• Contrôle COLLECTIF d'abord (statistiques anonymes)
• Individualisation uniquement si anomalie détectée
• Principe de proportionnalité

═══ GÉOLOCALISATION (GPS) ═══
• Autorisé si justifié (gestion de flotte, sécurité, facturation)
• Information préalable obligatoire
• Pas de suivi en dehors des heures de travail
• Désactivation possible le week-end / vacances
• Mention au règlement de travail

═══ DROITS DES TRAVAILLEURS ═══
• Droit d'accès à leurs données personnelles
• Droit de rectification
• Droit d'opposition (limité en contexte de travail)
• Droit à l'effacement (fin de la durée de conservation)
• Droit à la portabilité (données fournies par le travailleur)`,delai:"Politique à établir — contrôle continu",formulaire:"Politique IT + caméras + RGPD",ou:null,obligatoire:true,duree_estimee:'2-4h'},
],
alertes:[
  {niveau:'critique',texte:"Le consentement n'est PRESQUE JAMAIS une base valable en contexte RH (déséquilibre de pouvoir). Utiliser : contrat, obligation légale, intérêt légitime."},
  {niveau:'critique',texte:"Amendes RGPD : jusqu'à 20 millions € ou 4% du CA mondial. L'APD belge a déjà sanctionné des employeurs."},
  {niveau:'important',texte:"Caméras : information préalable + mention au règlement de travail + signalisation. Surveillance permanente des travailleurs interdite."},
  {niveau:'important',texte:"Emails : contrôle collectif d'abord, individualisation uniquement en cas d'anomalie. Informer les travailleurs de la politique."},
  {niveau:'attention',texte:"Conservation des données : définir des durées précises. Ex : candidatures non retenues = max 2 ans. Contrats terminés = 5 ans."},
],
simulation:{titre:"RGPD — Mise en conformité",lignes:[
  {label:'Audit RGPD initial',montant:'±2.000-5.000€',type:'neutre'},
  {label:'Registre des traitements',montant:'±500-1.000€',type:'neutre'},
  {label:'Politique de confidentialité',montant:'±500€',type:'neutre'},
  {label:'Formation personnel',montant:'±500-1.000€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Amende APD maximale',montant:'20M€ ou 4% CA mondial',type:'vert_bold'},
]},
faq:[
  {q:"Un DPO est-il obligatoire ?",r:"Le DPO (Data Protection Officer) est obligatoire si : traitement à grande échelle de données sensibles (santé, etc.) ou surveillance systématique à grande échelle. Pour la plupart des PME : pas obligatoire mais recommandé."},
  {q:"Puis-je lire les emails de mes employés ?",r:"Très encadré. Contrôle collectif d'abord (volumes, destinations). Individualisation uniquement si anomalie + proportionnalité + information préalable. Lire le contenu des emails privés = interdit."},
],
formulaires:[{nom:"APD — Autorité de protection des données",url:"https://www.autoriteprotectiondonnees.be",type:'en_ligne'}]};
export default function ProcedureRGPD(){const P=PROC_RGPD;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_RGPD};
