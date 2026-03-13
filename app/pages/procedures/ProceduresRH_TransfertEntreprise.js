'use client';
import { useState, useMemo } from 'react';
const PROC_TE={id:'transfert_entreprise',icon:'🔄',categorie:'restructuration',titre:"Transfert d'entreprise (CCT 32bis)",resume:"En cas de cession, fusion, scission ou reprise : tous les contrats de travail sont transférés au repreneur. Les conditions sont intégralement maintenues. Licenciement interdit pour motif du transfert. Information et consultation des travailleurs obligatoires avant le transfert.",
baseLegale:[{ref:"CCT n°32bis du 7/06/1985",desc:"Transfert conventionnel d'entreprise — droits des travailleurs"},{ref:"Directive UE 2001/23 du 12/03/2001",desc:"Maintien des droits des travailleurs en cas de transfert"},{ref:"Loi du 5 décembre 1968",desc:"Conventions collectives de travail — force obligatoire"},{ref:"Art. 61-63 Loi du 3/07/1978",desc:"Transfert et cession du contrat de travail"}],
etapes:[
{n:1,phase:'definition',titre:"Qu'est-ce qu'un transfert d'entreprise ?",detail:`═══ OPÉRATIONS VISÉES ═══
• Cession d'entreprise (vente totale ou partielle)
• Fusion par absorption
• Scission d'entreprise
• Apport d'une branche d'activité
• Externalisation d'une activité (outsourcing)
• Reprise d'une activité après faillite (sous conditions)

═══ CE QUI N'EST PAS UN TRANSFERT CCT 32bis ═══
• Simple vente d'actions (les contrats restent chez l'employeur)
• Remplacement d'un prestataire de services (nettoyage, etc.) sauf si entité économique transférée
• Cession d'un immeuble sans activité

═══ TEST : ENTITÉ ÉCONOMIQUE ═══
Une entité économique est transférée si :
• Ensemble organisé de moyens (personnel + actifs)
• En vue de poursuivre une activité économique
• Identité économique maintenue après le transfert`,delai:"Analyse juridique avant la transaction",formulaire:"Avis juridique sur qualification CCT 32bis",ou:"Conseiller en droit social",obligatoire:true,duree_estimee:'4h analyse'},
{n:2,phase:'droits',titre:"Droits maintenus des travailleurs",detail:`═══ TRANSFERT AUTOMATIQUE DES CONTRATS ═══
• Tous les contrats de travail passent automatiquement au repreneur
• Sans accord du travailleur requis
• Avec TOUTES les conditions en vigueur

═══ CE QUI EST MAINTENU INTÉGRALEMENT ═══
• Salaire et tous les avantages (voiture, chèques-repas, etc.)
• Ancienneté acquise (pour calcul préavis, prime fin d'année, etc.)
• Fonctions et responsabilités
• Droits liés aux CCT sectorielles applicables
• Régimes de pension complémentaire (sous conditions)

═══ INTERDICTION DE LICENCIEMENT ═══
• Licenciement interdit si le motif est le transfert lui-même
• Exception : raisons économiques, techniques ou organisationnelles indépendantes du transfert
• L'employeur (cédant ou cessionnaire) doit prouver le motif`,delai:"Dès la date effective du transfert",formulaire:null,ou:"Inspection sociale si abus",obligatoire:true,duree_estimee:'2h'},
{n:3,phase:'information',titre:"Information et consultation obligatoires",detail:`═══ QUI DOIT INFORMER ? ═══
• Cédant ET cessionnaire sont solidairement responsables
• Obligation conjointe d'information

═══ QUI INFORMER ? ═══
• Conseil d'entreprise (CE) — si entreprise ≥ 100 travailleurs
• Délégation syndicale — si pas de CE
• CPPT (Comité PPT) — si risques pour la sécurité
• Si aucune représentation : informer directement les travailleurs

═══ QUAND INFORMER ? ═══
• En temps utile AVANT le transfert
• Pas de délai légal minimum mais pratique : au moins 30-60 jours
• Information préalable à la consultation

═══ CONTENU DE L'INFORMATION ═══
• Date et motifs du transfert
• Conséquences juridiques, économiques et sociales pour les travailleurs
• Mesures envisagées pour les travailleurs`,delai:"En temps utile avant le transfert",formulaire:"PV d'information CE/délégation syndicale",ou:"Organes de représentation des travailleurs",obligatoire:true,duree_estimee:'2h + réunion CE'},
],
alertes:[{niveau:'critique',texte:"Licenciement lié au transfert = interdit + nullité + indemnité. L'exception pour raisons ETO doit être prouvée par l'employeur."},{niveau:'critique',texte:"Information et consultation AVANT le transfert obligatoire. Défaut = délit pénal et responsabilité civile des deux parties."},{niveau:'important',texte:"L'ancienneté est intégralement maintenue chez le repreneur. Impact direct sur : préavis, prime fin d'année, crédit-temps."}],
simulation:{titre:"Impact RH — Transfert de 10 travailleurs",lignes:[{label:"Coût mise en conformité information/consultation",montant:"2-5h juridique",type:'neutre'},{label:"Maintien des conditions existantes",montant:"Coût = idem situation actuelle",type:'neutre'},{label:"Ancienneté maintenue (impact préavis)",montant:"Calculer sur ancienneté totale",type:'neutre'},{label:'',montant:'',type:'separateur'},{label:"Amende si information non faite",montant:"Délit pénal — amende variable",type:'vert_bold'}]},
faq:[{q:"Les travailleurs peuvent-ils refuser d'être transférés ?",r:"Le transfert est automatique et le travailleur ne peut pas le refuser. S'il refuse, cela peut être considéré comme une démission. Toutefois, si les conditions changent défavorablement après le transfert, le travailleur peut mettre fin au contrat aux torts du cessionnaire."},{q:"L'ancienneté est-elle vraiment maintenue en totalité ?",r:"Oui. Pour tous les droits liés à l'ancienneté (préavis, prime fin d'année, crédit-temps, etc.), l'ancienneté acquise chez le cédant continue chez le cessionnaire comme si les contrats n'avaient pas changé d'employeur."},{q:"Qu'arrive-t-il en cas de faillite du cédant ?",r:"La CCT 32bis ne s'applique pas automatiquement en cas de faillite. Il existe un régime spécial pour la reprise après faillite (loi du 31/01/2009) qui permet une reprise partielle avec conditions plus souples."},{q:"Les représentants syndicaux sont-ils transférés avec leurs mandats ?",r:"Non. Les mandats syndicaux prennent fin avec la clôture du cycle électoral. Les représentants transférés perdent leur mandat chez le cédant. Ils peuvent se présenter aux prochaines élections chez le cessionnaire."}],
formulaires:[{nom:"CNT — CCT n°32bis",url:"https://www.cnt-nar.be",type:'en_ligne'},{nom:"SPF Emploi — Transfert d'entreprise",url:"https://emploi.belgique.be/fr/themes/restructurations/transfert-dentreprise",type:'en_ligne'}]};
export default function ProcedureTransfertEntreprise(){const P=PROC_TE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}> {pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}> {v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Info'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>;})}
</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}{P.formulaires&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:700,color:'#94a3b8',marginBottom:8}}>📎 Formulaires officiels</h3>{P.formulaires.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'10px 14px',background:'#111827',borderRadius:8,marginBottom:6,color:'#60a5fa',fontSize:13,textDecoration:'none'}}>🔗 {f.nom}</a>)}</div>}</div>}</div>);}
export {PROC_TE};