'use client';
import { useState, useMemo } from 'react';
const PROC_PFA={id:'prime_fin_annee',icon:'💸',categorie:'remuneration',titre:"Prime de fin d'année (13e mois)",resume:"Pas d'obligation légale générale, mais imposée par quasi toutes les CCT sectorielles. CP 200 (employés) : 13e mois = 1 mois de salaire brut de décembre. Prorata si entrée/sortie en cours d'année. Soumis ONSS + PP. Payée en novembre-décembre.",
baseLegale:[{ref:"CCT sectorielle applicable",desc:"Source principale de l'obligation de prime fin d'année"},{ref:"CCT n°90 du 20/12/2007",desc:"Prime collective (bonus CCT90) — alternative avantageuse"},{ref:"Art. 6 L. 3/07/1978",desc:"Conditions de travail — modifications unilatérales interdites"},{ref:"Jurisprudence constante",desc:"Prime devenue usage d'entreprise si accordée 3 années consécutives"}],
etapes:[
{n:1,phase:'source',titre:"Source de l'obligation — CCT ou usage",detail:`═══ VÉRIFIER LA SOURCE DE L'OBLIGATION ═══
• Étape 1 : Vérifier la CCT sectorielle de la CP applicable
• Étape 2 : Vérifier la CCT d'entreprise si pas de CCT sectorielle
• Étape 3 : Vérifier l'usage d'entreprise (3 années consécutives = droit acquis)
• Étape 4 : Vérifier le contrat de travail individuel

═══ CP 200 (EMPLOYÉS) — RÈGLE GÉNÉRALE ═══
• 13e mois = 1 mois de salaire brut de référence (décembre)
• Prorata : jours de travail effectif / 365 jours
• Assimilations : maladie, maternité, vacances = comptent comme prestations

═══ AUTRES CP — À VÉRIFIER INDIVIDUELLEMENT ═══
• CP 111 (construction) : barème spécifique via Fonds Social
• CP 124 (alimentation) : conditions particulières
• CP 140 (transport) : règles propres
• CP 220 (employés textile) : modalités propres`,delai:"Vérification CCT sectorielle avant le 1er engagement",formulaire:"CCT sectorielle — consultable sur CNT.be",ou:"CNT — Conseil National du Travail",obligatoire:true,duree_estimee:'1h'},
{n:2,phase:'calcul',titre:"Calcul et prorata",detail:`═══ FORMULE DE BASE ═══
Prime = Salaire brut × (jours prestés ou assimilés / 365)

Exemple : Entrée le 1er avril, salaire 3.500€
→ 275/365 jours = 75,3% de l'année
→ Prime = 3.500 × 75,3% = 2.635 €

═══ JOURS ASSIMILÉS (comptent comme prestations) ═══
• Vacances annuelles légales
• Jours fériés légaux
• Maladie : salaire garanti (employés = 30j; ouvriers = variable)
• Maternité, paternité, adoption
• Chômage temporaire (sous conditions CCT)
• Crédit-temps (sous conditions)

═══ JOURS NON ASSIMILÉS (réduisent le prorata) ═══
• Absences injustifiées
• Grève (sauf CCT contraire)
• Chômage économique prolongé (vérifier CCT)`,delai:"Calcul en novembre pour paiement décembre",formulaire:null,ou:"Service de paie",obligatoire:true,duree_estimee:'1h'},
{n:3,phase:'fiscalite',titre:"Fiscalité — ONSS et PP",detail:`═══ ONSS ═══
• La prime de fin d'année est soumise à l'ONSS normalement
• Cotisations personnelles : 13,07% sur le montant brut
• Cotisations patronales : ~27% sur le montant brut
• Pas d'exonération ONSS possible (contrairement au bonus CCT90)

═══ PRÉCOMPTE PROFESSIONNEL ═══
• Soumis au PP sur la fiche de paie du mois de paiement
• Taux PP souvent plus élevé car revenu exceptionnel
• Attention : le cumul salaire + prime peut faire sauter dans une tranche plus haute
• Option : étaler sur plusieurs mois si CCT le permet

═══ ALTERNATIVE AVANTAGEUSE : BONUS CCT90 ═══
• Max 3.948 € en 2026
• Cotisation spéciale 33% (employeur) au lieu de ~55% ONSS+PP normal
• Exonéré d'ONSS personnel et de PP pour le travailleur
• Doit être basé sur des objectifs collectifs mesurables`,delai:"Paiement en novembre ou décembre selon CCT",formulaire:"Plan de bonus CCT90 si applicable",ou:"CNT pour enregistrement CCT90",obligatoire:true,duree_estimee:'1h'},
],
alertes:[{niveau:'critique',texte:"Usage d'entreprise : si la prime a été accordée 3 années consécutives sans réserve, elle devient un droit acquis. Suppression = modification unilatérale du contrat."},{niveau:'important',texte:"Bonus CCT90 : alternative fiscalement avantageuse (33% cotisation spéciale vs ~55% normal). Max 3.948€/an exonéré ONSS+PP travailleur."},{niveau:'attention',texte:"Prorata : toujours vérifier les jours assimilés dans la CCT sectorielle. Maladie, maternité, vacances comptent généralement comme prestations."}],
simulation:{titre:"Prime fin d'année — Exemples 2026",lignes:[{label:"Employé 2.500€ — année complète",montant:"2.500 € brut",type:'neutre'},{label:"Net travailleur (après ONSS+PP ~38%)",montant:"~1.550 €",type:'neutre'},{label:"Coût total employeur (+ ONSS patronal 27%)",montant:"3.175 €",type:'neutre'},{label:'',montant:'',type:'separateur'},{label:"Si bonus CCT90 à la place (3.500€)",montant:"Cotis. 33% = 1.155€",type:'vert_bold'},{label:"Économie vs prime ordinaire",montant:"~700 € (employeur)",type:'vert_bold'}]},
faq:[{q:"La prime de fin d'année est-elle obligatoire pour tous les employeurs ?",r:"Non, il n'existe pas d'obligation légale générale. Mais la plupart des CCT sectorielles la prévoient. Vérifier la CCT de la CP de l'entreprise sur cnt.be ou via le SPF Emploi."},{q:"Comment calculer le prorata pour un travailleur entré en cours d'année ?",r:"En général : salaire brut × (nombre de jours prestés ou assimilés / 365). Les jours de maladie avec salaire garanti, vacances légales et jours fériés sont généralement assimilés à des prestations."},{q:"Peut-on remplacer le 13e mois par un bonus CCT90 ?",r:"Oui, si le 13e mois n'est pas imposé par la CCT sectorielle. Le bonus CCT90 est fiscalement plus avantageux. Mais si la CCT l'impose, on ne peut pas le remplacer sans accord des représentants des travailleurs."},{q:"Que se passe-t-il en cas de départ en cours d'année ?",r:"En principe, le travailleur a droit au prorata de la prime correspondant aux mois travaillés. Si le départ est pour motif grave, la CCT peut prévoir la perte de la prime. Vérifier la CCT sectorielle."}],
formulaires:[{nom:"CNT — Textes des CCT sectorielles",url:"https://www.cnt-nar.be/CCT-ORIG/cct-090.pdf",type:'en_ligne'},{nom:"SPF Emploi — Commissions paritaires",url:"https://emploi.belgique.be/fr/themes/commissions-paritaires",type:'en_ligne'}]};
export default function ProcedurePrimeFinAnnee(){const P=PROC_PFA;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}> {pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}> {v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Info'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>;})}
</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}{P.formulaires&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:700,color:'#94a3b8',marginBottom:8}}>📎 Formulaires officiels</h3>{P.formulaires.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'10px 14px',background:'#111827',borderRadius:8,marginBottom:6,color:'#60a5fa',fontSize:13,textDecoration:'none'}}>🔗 {f.nom}</a>)}</div>}</div>}</div>);}
export {PROC_PFA};