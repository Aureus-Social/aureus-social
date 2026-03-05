'use client';
import { useState, useMemo } from 'react';
const PROC_DOCSOC={id:'document_social',icon:'📂',categorie:'legal',titre:"Documents sociaux obligatoires",resume:"Registre du personnel, compte individuel, fiches de paie, C4, 281.10. Conservation 5 à 10 ans. DIMONA, DmfA trimestrielle. Obligations de l'employeur dès le 1er travailleur. Sanctions pénales si manquant.",
baseLegale:[{ref:"AR 08/08/1980",desc:"Registre du personnel — tenue et contenu obligatoire"},{ref:"AR 23/10/1978",desc:"Compte individuel — contenu et conservation (5 ans)"},{ref:"Loi 12/04/1965, art. 15",desc:"Fiche de paie — remise obligatoire à chaque paiement"},{ref:"AR 05/11/2002 (DIMONA)",desc:"Déclaration immédiate de l'emploi — avant le 1er jour de travail"},{ref:"AR 22/12/1967 (DmfA)",desc:"Déclaration multifonctionnelle — déclaration trimestrielle ONSS"}],
etapes:[
  {n:1,phase:'obligatoire',titre:"Registre du personnel",detail:`═══ OBLIGATION ═══
Tout employeur doit tenir un registre du personnel.
• Format : papier ou électronique
• Inscription AVANT le début des prestations
• Numérotation séquentielle et continue (pas de suppression)

═══ MENTIONS OBLIGATOIRES ═══
1. Numéro d'inscription (séquentiel)
2. Nom et prénom
3. Date de naissance
4. Sexe
5. Domicile
6. Nationalité
7. Date de début
8. Type de contrat (CDI, CDD, temps plein, temps partiel)
9. Date de fin (si applicable)
10. Numéro NISS (registre national)

═══ CONSERVATION ═══
• 5 ans après la dernière inscription
• Accessible sur le lieu de travail
• Présentable à l'inspection sociale à tout moment

═══ DISPENSE ═══
L'employeur qui utilise DIMONA est partiellement dispensé du registre papier (les données DIMONA font foi). Mais un registre reste recommandé.`,delai:"AVANT le 1er jour de travail de chaque travailleur",formulaire:"Registre du personnel (papier ou électronique)",ou:"Sur le lieu de travail",obligatoire:true,duree_estimee:'5 min/travailleur'},

  {n:2,phase:'obligatoire',titre:"DIMONA — Déclaration immédiate de l'emploi",detail:`═══ DIMONA IN ═══
Déclaration AVANT le début de chaque occupation :
• Via www.socialsecurity.be ou batch (logiciel social)
• Contenu : NISS travailleur, date début, type de contrat
• Types : OTH (ordinaire), STU (étudiant), FLX (flexi-job), etc.
• Confirmation : numéro DIMONA reçu

═══ DIMONA OUT ═══
Déclaration de fin d'occupation :
• Le dernier jour de travail effectif
• Contenu : date de fin, motif (fin CDD, licenciement, démission, etc.)

═══ DIMONA MODIFICATION ═══
Si erreur ou changement :
• Modification en ligne dans les délais

═══ SANCTIONS ═══
• Pas de DIMONA = travail au noir = amende 2.500€ à 12.500€ par travailleur
• DIMONA tardive = amende 200€ à 2.000€
• Le travailleur peut aussi être sanctionné (perte de droits)`,delai:"AVANT le 1er jour de travail — DIMONA OUT le dernier jour",formulaire:"DIMONA IN / OUT",ou:"www.socialsecurity.be",obligatoire:true,duree_estimee:'5 min'},

  {n:3,phase:'obligatoire',titre:"DmfA — Déclaration trimestrielle ONSS",detail:`═══ CONTENU ═══
Déclaration par travailleur et par trimestre :
• Rémunérations brutes
• Heures prestées / facteurs Q et S (temps partiel)
• Codes de prestation (travail, maladie, vacances, etc.)
• Cotisations ONSS calculées
• Réductions ONSS appliquées (premier engagement, Activa, etc.)

═══ DÉLAIS ═══
• T1 (jan-mars) : avant le 30 avril
• T2 (avr-juin) : avant le 31 juillet
• T3 (juil-sept) : avant le 31 octobre
• T4 (oct-déc) : avant le 31 janvier

═══ PAIEMENT ONSS ═══
• Cotisations provisoires : le 5 de chaque mois (ou le 15 selon la taille)
• Solde : dans le mois suivant la DmfA
• Majorations si retard : 10% + intérêts de retard

═══ IMPORTANCE ═══
La DmfA détermine les droits sociaux du travailleur :
• Pension (carrière calculée sur la DmfA)
• Chômage (jours prestés = jours ouvrant droit)
• Maladie / invalidité
• Vacances (pécule calculé sur les données DmfA)

Erreur dans la DmfA = impact direct sur les droits du travailleur.`,delai:"Trimestriel — voir délais ci-dessus",formulaire:"DmfA (via logiciel social)",ou:"www.socialsecurity.be",obligatoire:true,duree_estimee:'1-2h/trimestre'},

  {n:4,phase:'obligatoire',titre:"Fiche de paie + Compte individuel + 281.10",detail:`═══ FICHE DE PAIE (mensuelle) ═══
Remise à CHAQUE paiement de salaire. Mentions :
• Identité employeur et travailleur
• Période de paie
• Salaire brut
• Retenues ONSS et PP
• Salaire net
• Avantages en nature
• Heures prestées / supplémentaires

═══ COMPTE INDIVIDUEL (annuel) ═══
Établi pour chaque travailleur, pour chaque année civile :
• Récapitulatif de tous les salaires versés
• Cotisations ONSS
• Précompte professionnel
• Jours prestés
• Conservation : 5 ANS après la sortie du travailleur

Remise au travailleur : avant le 1er mars de l'année suivante.

═══ FICHE FISCALE 281.10 ═══
Pour chaque travailleur, pour chaque année civile :
• Revenus totaux de l'année
• Précompte professionnel retenu
• Cotisations sociales personnelles
• Avantages en nature
• Remise au travailleur + déclaration au SPF Finances via Belcotax
• Délai : avant le 1er mars de l'année suivante`,delai:"Fiche de paie : chaque mois — 281.10 : avant le 1er mars",formulaire:"Fiche de paie + compte individuel + 281.10 (Belcotax)",ou:null,obligatoire:true,duree_estimee:'Mensuel + annuel'},
],
alertes:[
  {niveau:'critique',texte:"DIMONA AVANT le 1er jour de travail. Pas de DIMONA = travail au noir = amende 2.500-12.500€ par travailleur."},
  {niveau:'critique',texte:"DmfA trimestrielle obligatoire. Erreur = impact sur les droits sociaux du travailleur (pension, chômage, maladie)."},
  {niveau:'important',texte:"Fiche de paie à CHAQUE paiement. Compte individuel et 281.10 avant le 1er mars de l'année suivante."},
  {niveau:'important',texte:"Conservation : registre du personnel 5 ans, compte individuel 5 ans, documents sociaux 5 ans après sortie."},
  {niveau:'attention',texte:"Aureus Social Pro automatise DIMONA, DmfA, fiches de paie et 281.10. Moins de risque d'erreur."},
],
simulation:{titre:"Documents sociaux — Calendrier annuel",lignes:[
  {label:'Mensuel : fiches de paie',montant:'Chaque mois',type:'neutre'},
  {label:'Trimestriel : DmfA + paiement ONSS',montant:'30 avr / 31 juil / 31 oct / 31 jan',type:'neutre'},
  {label:'Annuel : 281.10 + compte individuel',montant:'Avant 1er mars',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Amende DIMONA manquante',montant:'2.500-12.500€/travailleur',type:'vert_bold'},
  {label:'Amende documents manquants',montant:'200-2.000€',type:'vert_bold'},
]},
faq:[
  {q:"Aureus Social Pro gère-t-il tous ces documents ?",r:"Oui : DIMONA, DmfA, fiches de paie, compte individuel et 281.10 sont générés automatiquement par le logiciel."},
  {q:"Combien de temps conserver les documents ?",r:"5 ans après la fin du contrat pour la plupart. Le registre du personnel : 5 ans après la dernière inscription. Recommandé : 10 ans pour les documents fiscaux."},
],
formulaires:[{nom:"Sécurité sociale — DIMONA/DmfA",url:"https://www.socialsecurity.be",type:'en_ligne'},{nom:"Belcotax — 281.10",url:"https://www.belcotaxonweb.be",type:'en_ligne'}]};
export default function ProcedureDocumentSocial(){const P=PROC_DOCSOC;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Calendrier',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_DOCSOC};
