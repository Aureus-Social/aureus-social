'use client';
import { useState, useMemo } from 'react';
const PROC_CR={id:'cheques_repas',icon:'🍽️',categorie:'remuneration',titre:"Chèques-repas",resume:"Avantage extra-légal le plus populaire en Belgique. Max 8€/chèque (employeur max 6,91€ + travailleur min 1,09€). Exonéré ONSS et impôts si conditions respectées. 1 chèque par jour effectivement presté. Uniquement électronique depuis 2016.",
baseLegale:[{ref:"AR 12/10/2010",desc:"Chèques-repas — conditions d'exonération ONSS et fiscale"},{ref:"CCT n°119bis",desc:"Chèques-repas électroniques — modalités"},{ref:"Art. 38/1 CIR 1992",desc:"Exonération fiscale des chèques-repas"}],
etapes:[
  {n:1,phase:'mise_en_place',titre:"Conditions d'exonération — Les 5 règles d'or",detail:`Pour être EXONÉRÉS d'ONSS et d'impôts, les chèques-repas doivent respecter TOUTES ces conditions :

═══ LES 5 CONDITIONS CUMULATIVES ═══

1. PRÉVU PAR CCT OU CONTRAT
   • CCT d'entreprise (si délégation syndicale)
   • OU accord individuel écrit (si pas de DS)
   • Le règlement de travail peut y faire référence

2. MONTANT MAXIMUM
   • Valeur faciale MAXIMALE : 8,00€ / chèque
   • Intervention employeur : MAX 6,91€
   • Intervention travailleur : MIN 1,09€
   • La part travailleur est déduite du salaire net

3. UN CHÈQUE PAR JOUR EFFECTIVEMENT PRESTÉ
   • Pas de chèque pour les jours de maladie
   • Pas de chèque pour les jours de vacances
   • Pas de chèque pour les jours fériés
   • Télétravail = jour presté → chèque OK
   • Formation = jour presté → chèque OK

4. AU NOM DU TRAVAILLEUR
   • Chèques nominatifs (carte électronique personnelle)
   • Non cessibles, non échangeables contre espèces

5. UNIQUEMENT ÉLECTRONIQUE
   • Depuis le 01/01/2016 : plus de chèques papier
   • Carte électronique (Sodexo, Edenred, Monizze)
   • Validité : 12 MOIS à compter de la mise à disposition

═══ SI UNE CONDITION N'EST PAS RESPECTÉE ═══
→ Les chèques-repas deviennent de la RÉMUNÉRATION
→ Soumis à l'ONSS (±40% charges) et au précompte professionnel
→ Coût explosé pour l'employeur`,delai:"Avant la 1ère attribution — CCT ou accord écrit",formulaire:"CCT d'entreprise ou accord individuel",ou:null,obligatoire:true,duree_estimee:'1h mise en place'},

  {n:2,phase:'gestion',titre:"Calcul et attribution mensuelle",detail:`═══ CALCUL MENSUEL ═══
Nombre de chèques = nombre de jours effectivement prestés dans le mois

Exemple : travailleur temps plein, octobre 2026 = 23 jours ouvrables
• Jours prestés : 23 - 1 jour maladie - 2 jours vacances = 20 jours
• Chèques : 20 × 8,00€ = 160,00€ valeur faciale
• Part employeur : 20 × 6,91€ = 138,20€
• Part travailleur (déduite du net) : 20 × 1,09€ = 21,80€

═══ TEMPS PARTIEL ═══
• Même règle : 1 chèque par jour presté
• Mi-temps 5j/sem → 5 chèques/semaine (pas prorata du montant)
• Mi-temps 2,5j/sem → chèque pour chaque jour où au moins 1h est prestée

═══ ALTERNATIVE : COMPTEUR TRIMESTRIEL ═══
• Possibilité de calculer sur base trimestrielle
• Permet de lisser les variations mensuelles
• Doit être prévu dans la CCT ou l'accord

═══ ÉMETTEURS AGRÉÉS ═══
• Sodexo (carte Pass)
• Edenred (carte Ticket Restaurant)
• Monizze (carte Monizze)
• Commande mensuelle via plateforme émetteur
• Coût de gestion : ±0,10-0,20€/chèque (émetteur)`,delai:"Mensuel — crédité sur la carte du travailleur",formulaire:"Commande auprès de l'émetteur agréé",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

  {n:3,phase:'fiscal',titre:"Avantage fiscal — Simulation coût vs salaire",detail:`═══ COMPARAISON : 160€ EN CHÈQUES-REPAS vs 160€ EN SALAIRE BRUT ═══

OPTION A : SALAIRE BRUT +160€/mois
• Coût employeur : 160 + 40€ ONSS patron = 200€
• Le travailleur reçoit net : ±87€ (après ONSS 13,07% + PP ±40%)
• Coût employeur pour 87€ net au travailleur : 200€

OPTION B : CHÈQUES-REPAS 20 × 8€ = 160€/mois
• Coût employeur : 138,20€ (part employeur) + ±3€ frais émetteur = ±141€
• Le travailleur reçoit : 160€ en pouvoir d'achat (utilisable en alimentation)
• Part travailleur déduite : 21,80€
• Gain net travailleur : 138,20€ de pouvoir d'achat supplémentaire

═══ RÉSULTAT ═══
• Employeur économise : 200€ - 141€ = 59€/mois (±30% d'économie)
• Travailleur gagne plus net : 138€ vs 87€ (+59% de pouvoir d'achat)
• WIN-WIN employeur + travailleur

═══ DÉDUCTIBILITÉ EMPLOYEUR ═══
• La part employeur n'est PAS déductible à l'ISOC
• MAIS le gain ONSS compense largement
• Le coût réel est inférieur au salaire brut équivalent`,delai:null,formulaire:null,ou:null,obligatoire:false,duree_estimee:'Simulation'},
],
alertes:[
  {niveau:'critique',texte:"5 conditions CUMULATIVES pour l'exonération. Si une seule manque → requalification en salaire → ONSS + PP à payer."},
  {niveau:'critique',texte:"MAX 8€/chèque (employeur max 6,91€ + travailleur min 1,09€). Dépassement = perte totale de l'exonération."},
  {niveau:'important',texte:"1 chèque par jour EFFECTIVEMENT presté. Pas de chèque pour maladie, vacances, jours fériés."},
  {niveau:'important',texte:"Accord écrit OBLIGATOIRE (CCT d'entreprise ou accord individuel). Pas de chèques-repas sans base juridique."},
  {niveau:'attention',texte:"Validité 12 mois. Chèques non utilisés sont perdus (le travailleur doit être informé)."},
],
simulation:{titre:"Chèques-repas — Coût annuel (5 employés, 220 jours/an, 8€)",lignes:[
  {label:'Valeur faciale totale',montant:'5 × 220 × 8€ = 8.800€',type:'neutre'},
  {label:'Part employeur (6,91€)',montant:'5 × 220 × 6,91€ = 7.601€',type:'neutre'},
  {label:'Part travailleur (1,09€)',montant:'5 × 220 × 1,09€ = 1.199€',type:'neutre'},
  {label:'Frais émetteur (±0,15€)',montant:'5 × 220 × 0,15€ = 165€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût employeur total/an',montant:'±7.766€',type:'vert_bold'},
  {label:'Équivalent salaire brut',montant:'±11.000€ brut',type:'vert'},
  {label:'Économie employeur',montant:'±3.234€/an',type:'vert_bold'},
]},
faq:[
  {q:"Un stagiaire a-t-il droit aux chèques-repas ?",r:"Oui, si c'est prévu dans l'accord. Les stagiaires rémunérés ont droit aux mêmes avantages que les travailleurs si le contrat le prévoit."},
  {q:"Le montant peut-il être différent selon les catégories ?",r:"Oui, mais cela doit être prévu dans la CCT et être objectivement justifié (ancienneté, fonction). Attention à la discrimination."},
  {q:"Les chèques-repas sont-ils saisissables ?",r:"Non. Les chèques-repas ne sont pas saisissables et ne sont pas cessibles (ils sont nominatifs)."},
],
formulaires:[{nom:"SPF Emploi — Chèques-repas",url:"https://emploi.belgique.be/fr/themes/remuneration/cheques-repas",type:'en_ligne'}]};
export default function ProcedureChequesRepas(){const P=PROC_CR;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_CR};
