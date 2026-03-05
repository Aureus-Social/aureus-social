'use client';
import { useState, useMemo } from 'react';
const PROC_BAR={id:'baremes',icon:'💶',categorie:'remuneration',titre:"Barèmes salariaux & salaire minimum",resume:"RMMMG (salaire minimum national), barèmes sectoriels par CP, classification de fonctions, ancienneté. L'employeur DOIT respecter le minimum sectoriel. Vérification obligatoire à chaque embauche et indexation.",
baseLegale:[{ref:"CCT 43 (CNT)",desc:"Revenu minimum mensuel moyen garanti (RMMMG) — montants et conditions"},{ref:"Loi 05/12/1968",desc:"Conventions collectives de travail — force obligatoire des barèmes sectoriels"},{ref:"CCT sectorielles (par CP)",desc:"Barèmes spécifiques par commission paritaire et classification de fonctions"}],
etapes:[
  {n:1,phase:'vérification',titre:"RMMMG — Salaire minimum national",detail:`═══ RMMMG 2026 (indicatif — vérifier indexation) ═══
Le RMMMG est le salaire MINIMUM absolu en Belgique.
Aucun travailleur à temps plein ne peut gagner moins.

• 18 ans et + : ±2.029,88€ brut/mois (montant indexé)
• 19 ans avec 6 mois d'ancienneté : ±2.081,66€ brut/mois
• 20 ans avec 12 mois d'ancienneté : ±2.109,47€ brut/mois

═══ ATTENTION ═══
Le RMMMG est un PLANCHER. La plupart des commissions paritaires fixent des barèmes SUPÉRIEURS au RMMMG.

═══ TEMPS PARTIEL ═══
Le RMMMG est calculé au prorata du temps de travail.
• Mi-temps (19h/38h) : ±1.014,94€ brut/mois
• 4/5 (30,4h/38h) : ±1.623,90€ brut/mois

═══ ÉTUDIANTS ═══
Pas de RMMMG spécifique pour les étudiants, mais le barème sectoriel minimum s'applique.

═══ FLEXI-JOB ═══
Salaire minimum flexi : ±12,29€/h (indexé) + 7,67% pécule de vacances = ±13,23€/h tout compris.`,delai:"Vérification à chaque embauche",formulaire:null,ou:null,obligatoire:true,duree_estimee:'15 min'},

  {n:2,phase:'application',titre:"Barèmes sectoriels par commission paritaire",detail:`═══ PRINCIPE ═══
Chaque commission paritaire (CP) fixe ses propres barèmes minimums.
Ces barèmes sont SUPÉRIEURS au RMMMG et s'imposent à l'employeur.

═══ EXEMPLES DE CP COURANTES ═══

CP 200 (employés — CPNAE) — la plus courante :
• Classe 1 (exécution) : ±2.029,88€ → ±2.445,52€ selon ancienneté
• Classe 2 (qualifié) : ±2.189,47€ → ±2.784,12€
• Classe 3 (spécialisé) : ±2.389,28€ → ±3.198,44€
• Classe 4 (direction) : ±2.844,21€ → ±3.842,15€
(montants indicatifs — vérifier les derniers barèmes publiés)

CP 302 (horeca) :
• Cat I (nettoyage) : ±2.096€
• Cat II (service) : ±2.186€
• Cat III (cuisine) : ±2.277€
• Cat IV (chef) : ±2.530€

═══ CLASSIFICATION DE FONCTIONS ═══
Le travailleur doit être classé dans la bonne catégorie :
• Description de fonction → classification → barème minimum
• Contestation possible devant la commission paritaire
• Si le salaire réel < barème : l'employeur doit régulariser RÉTROACTIVEMENT

═══ ANCIENNETÉ ═══
Les barèmes augmentent avec l'ancienneté (tous les 1-2 ans en général).
L'ancienneté sectorielle peut être reprise d'un employeur précédent (même CP).`,delai:"À chaque embauche + chaque année (ancienneté)",formulaire:"Grille barémique de la CP applicable",ou:null,obligatoire:true,duree_estimee:'30 min'},

  {n:3,phase:'contrôle',titre:"Vérification et régularisation",detail:`═══ QUAND VÉRIFIER ? ═══
1. À l'embauche : le salaire proposé ≥ barème minimum applicable
2. À chaque indexation : recalculer le barème indexé
3. À chaque anniversaire d'ancienneté : passage au barème supérieur
4. Si changement de fonction : vérifier la nouvelle classification

═══ OUTILS ═══
• SPF Emploi → outil de calcul des barèmes par CP
• Commissions paritaires → publications au Moniteur belge
• Aureus Social Pro → intégration des barèmes par CP

═══ SANCTIONS ═══
• Salaire < barème = dette de l'employeur → régularisation rétroactive
• Le travailleur peut réclamer les arriérés sur 5 ans (prescription)
• L'inspection sociale peut constater l'infraction → PV → amende
• Amende : 200€ à 2.000€ × nombre de travailleurs concernés

═══ BONNES PRATIQUES ═══
• Mentionner la classification dans le contrat de travail
• Conserver une trace des augmentations barémiques
• Vérifier les barèmes au moins 2× par an (indexation + ancienneté)`,delai:"Continu — au moins 2× par an",formulaire:null,ou:null,obligatoire:true,duree_estimee:'15 min/vérification'},
],
alertes:[
  {niveau:'critique',texte:"Le salaire DOIT être ≥ au barème sectoriel minimum (pas juste le RMMMG). Salaire < barème = dette rétroactive sur 5 ans."},
  {niveau:'critique',texte:"L'ancienneté barémique augmente le minimum automatiquement. Oublier = underpayment accumulé."},
  {niveau:'important',texte:"Classification de fonctions : le travailleur doit être dans la bonne catégorie. Mauvaise classification = barème incorrect."},
  {niveau:'attention',texte:"Flexi-job : salaire minimum spécifique de ±12,29€/h + 7,67% pécule. Pas le barème CP normal."},
],
simulation:{titre:"Barèmes CP 200 — Exemple classe 2 (employé qualifié)",lignes:[
  {label:'Embauche (0 an)',montant:'±2.189,47€ brut',type:'neutre'},
  {label:'Après 2 ans',montant:'±2.298,32€ brut',type:'neutre'},
  {label:'Après 5 ans',montant:'±2.459,87€ brut',type:'neutre'},
  {label:'Après 10 ans',montant:'±2.784,12€ brut',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Progression sur 10 ans',montant:'+27% automatique',type:'vert_bold'},
]},
faq:[
  {q:"Comment trouver les barèmes de ma CP ?",r:"SPF Emploi → 'Commissions paritaires' → recherche par numéro CP. Ou via le site de votre fédération sectorielle. Aureus Social Pro intègre les barèmes des principales CP."},
  {q:"Puis-je payer au-dessus du barème ?",r:"Oui, le barème est un MINIMUM. Vous pouvez payer plus (salaire réel). Attention : l'indexation s'applique au salaire réel, pas seulement au barème."},
],
formulaires:[{nom:"SPF Emploi — Barèmes par CP",url:"https://emploi.belgique.be/fr/themes/commissions-paritaires",type:'en_ligne'}]};
export default function ProcedureBaremes(){const P=PROC_BAR;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Barèmes',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_BAR};
