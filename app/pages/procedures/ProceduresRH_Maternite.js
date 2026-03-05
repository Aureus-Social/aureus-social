'use client';
import { useState, useMemo } from 'react';
const PROC_MATERNITE={id:'maternite',icon:'🤰',categorie:'absence',titre:"Congé de maternité",resume:"15 semaines de congé (6 prénatal + 9 postnatal, dont 1 obligatoire avant + 9 obligatoires après). Salaire garanti 30 jours puis indemnités mutuelle (82% puis 75%). Protection absolue contre le licenciement. Écartement prophylactique possible.",
baseLegale:[{ref:"Loi 16/03/1971, art. 39-43bis",desc:"Protection de la maternité — congé de maternité et écartement"},{ref:"AR 11/10/1991",desc:"Indemnités de maternité — montants et conditions AMI"},{ref:"Loi 03/07/1978, art. 40bis",desc:"Protection contre le licenciement pendant la grossesse"},{ref:"Code bien-être travail, Livre X Titre 5",desc:"Protection des travailleuses enceintes — risques et écartement"}],
etapes:[
  {n:1,phase:'préparation',titre:"La travailleuse informe l'employeur de sa grossesse",detail:`═══ NOTIFICATION ═══
• La travailleuse informe l'employeur (pas de délai légal, mais recommandé dès que possible)
• Certificat médical attestant la grossesse et la date présumée d'accouchement
• L'information déclenche la PROTECTION contre le licenciement

═══ PROTECTION CONTRE LE LICENCIEMENT ═══
Dès que l'employeur est informé :
• Protection ABSOLUE contre le licenciement
• Durée : de l'information jusqu'à 1 MOIS après la fin du congé postnatal
• Licenciement = indemnité forfaitaire de 6 MOIS de salaire brut (en plus du préavis)
• Exception : motif grave ou raison étrangère à la grossesse

═══ OBLIGATIONS DE L'EMPLOYEUR ═══
• Évaluation des risques pour la travailleuse enceinte
• Écartement des postes dangereux (travail de nuit, exposition chimique, charges lourdes)
• Adapter le poste si possible
• Si adaptation impossible → écartement prophylactique (mutuelle verse 78% du salaire)`,delai:"Dès que possible (recommandé avant la fin du 1er trimestre)",formulaire:"Certificat médical de grossesse",ou:null,obligatoire:true,duree_estimee:'Immédiat'},

  {n:2,phase:'congé',titre:"Calcul et organisation du congé de maternité — 15 semaines",detail:`═══ DURÉE : 15 SEMAINES (105 jours) ═══
Répartition flexible entre prénatal et postnatal :

PRÉNATAL (avant accouchement) : max 6 semaines
• 1 semaine OBLIGATOIRE avant la date présumée d'accouchement
• 5 semaines FACULTATIVES (la travailleuse peut les reporter après l'accouchement)

POSTNATAL (après accouchement) : min 9 semaines
• 9 semaines OBLIGATOIRES après l'accouchement
• + Les semaines prénatales non prises (reportées)
• + Si accouchement prématuré : les jours "perdus" sont ajoutés au postnatal

═══ FLEXIBILITÉ ═══
La travailleuse peut choisir de :
• Prendre 1 semaine avant + 14 semaines après (maximum de postnatal)
• Prendre 6 semaines avant + 9 semaines après (maximum de prénatal)
• Toute combinaison entre les deux

═══ NAISSANCE MULTIPLE ═══
En cas de naissance multiple : +2 semaines de congé prénatal (8 semaines max).
Total : 17 semaines (au lieu de 15).

═══ CONVERSION DES SEMAINES NON PRISES ═══
Les dernières 2 semaines du congé postnatal peuvent être converties en jours de repos postnatal (1 jour/semaine pendant 8 semaines) → reprise progressive.`,delai:"Le congé prénatal commence au plus tôt 6 semaines avant la DPA",formulaire:null,ou:null,obligatoire:true,duree_estimee:'15 semaines'},

  {n:3,phase:'congé',titre:"Indemnités de maternité — Mutuelle",detail:`═══ INDEMNITÉS ═══
30 PREMIERS JOURS :
• 82% du salaire brut NON PLAFONNÉ → payé par la MUTUELLE (pas l'employeur !)
• ⚠️ Contrairement à la maladie, l'employeur ne paie PAS de salaire garanti pour la maternité

À PARTIR DU 31e JOUR :
• 75% du salaire brut PLAFONNÉ (plafond ±4.500€ brut/mois en 2026)
• Payé par la mutuelle

═══ EXEMPLE (3.200€ brut) ═══
Jours 1-30 : 82% × 3.200€ = 2.624€ brut/mois
Jours 31-105 : 75% × 3.200€ = 2.400€ brut/mois
(Sous le plafond → pas de réduction)

═══ FORMALITÉS ═══
• La travailleuse transmet le certificat d'accouchement à sa mutuelle
• La mutuelle verse les indemnités directement
• L'employeur fournit une attestation de salaire à la mutuelle

═══ MAINTIEN DES AVANTAGES ═══
Pendant le congé de maternité :
• Chèques-repas : NON (pas de prestation)
• Assurance groupe : vérifier la police (souvent maintenue)
• Voiture de société : selon la politique de l'entreprise
• Ancienneté : continue à courir
• Vacances : le congé de maternité est assimilé pour le calcul du pécule`,delai:"Dès le 1er jour du congé de maternité",formulaire:"Attestation de salaire pour la mutuelle + certificat d'accouchement",ou:"Mutuelle",obligatoire:true,duree_estimee:'15 min'},

  {n:4,phase:'retour',titre:"Retour au travail — Visite de reprise + allaitement",detail:`═══ REPRISE ═══
• La travailleuse reprend le travail le jour suivant la fin du congé postnatal
• Visite de reprise OBLIGATOIRE auprès du médecin du travail (dans les 10 jours)
• Elle a droit de RETROUVER son poste ou un poste équivalent

═══ PAUSES D'ALLAITEMENT ═══
La travailleuse qui allaite a droit à des pauses d'allaitement :
• 2 × 30 minutes par jour (ou 1 × 60 minutes)
• Pendant 9 MOIS après l'accouchement
• Payées par la mutuelle (pas l'employeur)
• Local adapté à mettre à disposition si possible

═══ PROTECTION POST-CONGÉ ═══
La protection contre le licenciement court encore 1 MOIS après la fin du congé.
Licenciement pendant ce mois = 6 mois d'indemnité supplémentaire.

═══ CONGÉ PARENTAL ═══
Après le congé de maternité, la travailleuse peut enchaîner avec :
• Le congé parental (4 mois par enfant)
• Le crédit-temps avec motif "soins enfant < 8 ans"
• Le mi-temps thérapeutique (si complications)`,delai:"Le jour suivant la fin du congé postnatal",formulaire:"Visite de reprise (médecin du travail)",ou:"SEPP (médecin du travail)",obligatoire:true,duree_estimee:'1h'},
],
alertes:[
  {niveau:'critique',texte:"Protection ABSOLUE contre le licenciement : de l'information de la grossesse → 1 mois après le congé postnatal. Sanction : 6 MOIS de salaire brut."},
  {niveau:'critique',texte:"PAS de salaire garanti pour la maternité ! C'est la MUTUELLE qui paie dès le jour 1 (82% puis 75%). Erreur fréquente."},
  {niveau:'important',texte:"1 semaine de congé prénatal est OBLIGATOIRE. Les semaines non prises avant l'accouchement sont reportées en postnatal."},
  {niveau:'important',texte:"Visite de reprise OBLIGATOIRE auprès du médecin du travail dans les 10 jours suivant la reprise."},
  {niveau:'attention',texte:"Pauses d'allaitement : 2×30 min/jour pendant 9 mois. Payées par la mutuelle, pas l'employeur."},
  {niveau:'info',texte:"Les 2 dernières semaines du postnatal peuvent être converties en jours de repos (1 jour/semaine pendant 8 semaines)."},
],
simulation:{titre:"Congé de maternité — 15 semaines (3.200€ brut)",lignes:[
  {label:'JOURS 1-30 (mutuelle 82%) :',montant:'±2.624€/mois',type:'vert'},
  {label:'JOURS 31-105 (mutuelle 75%) :',montant:'±2.400€/mois',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'COÛT EMPLOYEUR :',montant:'',type:'neutre'},
  {label:'  Salaire garanti',montant:'0€ (mutuelle !)',type:'vert_bold'},
  {label:'  Remplacement (si nécessaire)',montant:'±8.000-15.000€',type:'neutre'},
  {label:'  Assurance groupe (maintien)',montant:'Variable',type:'neutre'},
]},
faq:[
  {q:"La travailleuse doit-elle informer l'employeur de sa grossesse ?",r:"Pas d'obligation légale, mais recommandé pour déclencher la protection et permettre l'évaluation des risques. La protection court dès l'information."},
  {q:"Que se passe-t-il si l'accouchement est prématuré ?",r:"Les jours de congé prénatal 'perdus' sont ajoutés au congé postnatal. La travailleuse ne perd pas de jours."},
  {q:"L'employeur doit-il maintenir la voiture de société ?",r:"Pas d'obligation légale. C'est une question de politique d'entreprise. Vérifier le car policy."},
],
formulaires:[{nom:"INAMI — Congé de maternité",url:"https://www.inami.fgov.be/fr/themes/grossesse-naissance/conge-maternite",type:'en_ligne'}]};
export default function ProcedureMaternite(){const P=PROC_MATERNITE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Notification',i:'📞'},{id:'congé',l:'Congé',i:'🤱'},{id:'retour',l:'Retour',i:'🔄'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_MATERNITE};
