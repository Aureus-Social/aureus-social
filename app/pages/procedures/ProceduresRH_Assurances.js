'use client';
import { useState, useMemo } from 'react';
const PROC_ASSURANCES={id:'assurances',icon:'🛡️',categorie:'legal',titre:"Assurances obligatoires de l'employeur",resume:"Accident du travail (obligatoire dès le 1er travailleur), responsabilité civile, SEPP (Service Externe PPT), assurance groupe (si CCT). Sanctions pénales si assurance AT manquante. Fedris intervient en dernier recours.",
baseLegale:[{ref:"Loi 10/04/1971",desc:"Assurance accidents du travail — obligation de l'employeur"},{ref:"Loi 04/08/1996",desc:"Bien-être au travail — obligation SEPP"},{ref:"Code pénal social, art. 184",desc:"Sanctions en cas d'absence d'assurance accidents du travail"}],
etapes:[
  {n:1,phase:'obligatoire',titre:"Assurance accidents du travail (AT) — OBLIGATOIRE",detail:`═══ OBLIGATION ABSOLUE ═══
TOUT employeur DOIT souscrire une assurance AT AVANT d'engager le 1er travailleur.
Pas d'assurance AT = infraction PÉNALE.

═══ COUVERTURE ═══
• Accidents sur le lieu de travail
• Accidents sur le chemin du travail
• Soins médicaux : 100% pris en charge
• Incapacité temporaire : 90% du salaire plafonné
• Incapacité permanente : rente ou capital selon le taux d'IPP
• Décès : rente aux ayants droit

═══ ASSUREURS PRINCIPAUX ═══
Ethias, AXA, AG Insurance, Baloise, Federale, P&V, KBC

═══ COÛT ═══
Prime annuelle = pourcentage de la masse salariale :
• Bureau/administratif : 0,5% à 1%
• Commerce : 1% à 2%
• Construction : 3% à 8%
• Industrie lourde : 5% à 15%
Exemple : 5 employés × 40.000€ brut/an = 200.000€ masse salariale × 1% = 2.000€/an

═══ SANS ASSURANCE ═══
• Amende pénale : 400€ à 4.000€ × nombre de travailleurs
• Fedris (Agence fédérale) couvre les travailleurs NON assurés → récupère les coûts auprès de l'employeur
• L'employeur est personnellement responsable de TOUS les frais médicaux et indemnités`,delai:"AVANT le 1er jour du 1er travailleur",formulaire:"Police d'assurance AT",ou:"Assureur agréé (voir Fedris)",obligatoire:true,duree_estimee:'1-2h de souscription'},

  {n:2,phase:'obligatoire',titre:"SEPP — Service Externe de Prévention (médecine du travail)",detail:`═══ OBLIGATION ═══
Tout employeur DOIT s'affilier à un SEPP (Service Externe pour la Prévention et la Protection au Travail).

═══ SEPP PRINCIPAUX ═══
• Cohezio (Bruxelles, Wallonie)
• Mensura
• Liantis
• SPMT-ARISTA
• IDEWE (Flandre)
• SEPP agréé

═══ SERVICES ═══
• Médecine du travail (examens médicaux obligatoires)
• Conseiller en prévention niveau 1 ou 2
• Analyse des risques
• Visites de lieux de travail
• Soutien psychosocial (harcèlement, bien-être)
• Trajet de réintégration

═══ COÛT ═══
Cotisation annuelle par travailleur :
• Forfait unitaire de base : ±100€/travailleur/an (2026)
• Examens supplémentaires : selon le profil de risque
• Tarification forfaitaire pour PME <20 travailleurs

═══ EXAMENS OBLIGATOIRES ═══
• Embauche : examen médical avant la prise de fonction (si poste de sécurité/vigilance)
• Périodique : selon le poste (annuel pour les postes à risque)
• Reprise : après absence >4 semaines pour maladie/AT
• Préalable : travailleurs exposés à des risques spécifiques`,delai:"Affiliation AVANT le 1er travailleur",formulaire:"Contrat d'affiliation SEPP",ou:"SEPP de votre choix",obligatoire:true,duree_estimee:'1h'},

  {n:3,phase:'recommandé',titre:"Assurances recommandées (RC, groupe, hospitalisation)",detail:`═══ RC EXPLOITATION (recommandée) ═══
• Couvre les dommages causés à des tiers par l'entreprise
• Pas obligatoire légalement MAIS indispensable en pratique
• Coût : 200-1.000€/an selon le secteur

═══ ASSURANCE GROUPE (pension complémentaire) ═══
• 2e pilier de pension — très fréquent en Belgique
• Obligatoire si la CCT sectorielle le prévoit (vérifier la CP !)
• L'employeur cotise ±2-5% du salaire brut
• Avantage fiscal pour l'employeur (déductible) et le travailleur

═══ ASSURANCE HOSPITALISATION ═══
• Très populaire comme avantage extra-légal
• Coût : ±50-150€/travailleur/mois
• Souvent offert au travailleur + famille
• Pas obligatoire sauf si CCT le prévoit

═══ ASSURANCE REVENU GARANTI ═══
• Complète les indemnités mutuelle en cas de maladie longue durée
• Le travailleur reçoit un complément → maintien de ±80% du salaire net
• Coût : 1-3% du salaire brut`,delai:"Lors de l'affiliation ou de la mise en place",formulaire:"Polices d'assurance respectives",ou:"Assureur ou courtier",obligatoire:false,duree_estimee:'2-4h'},
],
alertes:[
  {niveau:'critique',texte:"Assurance AT OBLIGATOIRE dès le 1er travailleur. Sans assurance = infraction PÉNALE + responsabilité personnelle de l'employeur pour tous les frais."},
  {niveau:'critique',texte:"Affiliation SEPP OBLIGATOIRE. Le médecin du travail est un passage obligé pour certains examens (embauche, reprise, postes à risque)."},
  {niveau:'important',texte:"Vérifier la CCT sectorielle : l'assurance groupe (pension complémentaire) peut être OBLIGATOIRE dans certaines commissions paritaires."},
  {niveau:'info',texte:"L'assurance hospitalisation et le revenu garanti sont des avantages extra-légaux très appréciés pour attirer et fidéliser les talents."},
],
simulation:{titre:"Coût annuel assurances (5 employés, 200.000€ masse salariale)",lignes:[
  {label:'Assurance AT (1%)',montant:'±2.000€/an',type:'neutre'},
  {label:'SEPP (5 × 100€)',montant:'±500€/an',type:'neutre'},
  {label:'RC exploitation',montant:'±500€/an',type:'neutre'},
  {label:'Assurance groupe (3%)',montant:'±6.000€/an',type:'neutre'},
  {label:'Hospitalisation (5 × 100€/mois)',montant:'±6.000€/an',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Total obligatoire minimum',montant:'±2.500€/an',type:'vert_bold'},
  {label:'Total avec extras',montant:'±15.000€/an',type:'vert_bold'},
]},
faq:[
  {q:"Que se passe-t-il si je n'ai pas d'assurance AT ?",r:"Fedris couvre les travailleurs non assurés mais RÉCUPÈRE tous les coûts auprès de l'employeur + amende pénale. L'employeur est personnellement responsable."},
  {q:"Puis-je changer de SEPP ?",r:"Oui, avec un préavis. Le contrat SEPP peut être résilié selon les conditions contractuelles (généralement 3 mois de préavis)."},
],
formulaires:[{nom:"Fedris — Assurance AT",url:"https://www.fedris.be",type:'en_ligne'},{nom:"SPF Emploi — SEPP agréés",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail/services-externes-pour-la-prevention",type:'en_ligne'}]};
export default function ProcedureAssurances(){const P=PROC_ASSURANCES;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_ASSURANCES};
