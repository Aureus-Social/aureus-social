'use client';
import { useState, useMemo } from 'react';
const PROC_ECO={id:'ecocheques',icon:'🌿',categorie:'remuneration',titre:"Écochèques",resume:"Avantage extra-légal pour achats écologiques. Max 250€/an par travailleur (temps plein). Exonéré ONSS et impôts. Prévu par CCT sectorielle ou d'entreprise. Utilisable pour produits/services écologiques (bio, énergie verte, vélo, etc.).",
baseLegale:[{ref:"CCT n°98",desc:"Écochèques — conditions d'octroi et d'exonération"},{ref:"AR 14/04/2009",desc:"Liste des produits et services écologiques éligibles"},{ref:"CCT sectorielles",desc:"Nombreuses CP prévoient l'octroi obligatoire d'écochèques"}],
etapes:[
  {n:1,phase:'mise_en_place',titre:"Conditions d'exonération et montants",detail:`═══ CONDITIONS D'EXONÉRATION (CCT 98) ═══

1. PRÉVU PAR CCT sectorielle ou d'entreprise
   • Nombreuses CP l'imposent (vérifier votre CP !)
   • CP 200 : écochèques prévus par la CCT sectorielle

2. MONTANT MAXIMUM
   • 250€/an par travailleur (temps plein)
   • Prorata pour temps partiel et entrées/sorties en cours d'année
   • Valeur faciale max par chèque : 10€

3. AU NOM DU TRAVAILLEUR
   • Nominatifs, non cessibles, non échangeables
   • Carte électronique (Sodexo, Edenred, Monizze)

4. VALIDITÉ 24 MOIS
   • Les écochèques ont une validité de 24 mois
   • Plus longue que les chèques-repas (12 mois)

5. UTILISATION ÉCOLOGIQUE UNIQUEMENT
   • Produits bio et écologiques
   • Appareils économes en énergie (A+++ etc.)
   • Vélo, trottinette électrique
   • Panneaux solaires, isolation, pompes à chaleur
   • Arbres, plantes, semences
   • Produits d'entretien écologiques
   • Transport en commun (abonnements)

═══ SI CONDITIONS NON RESPECTÉES ═══
→ Requalification en salaire → ONSS + PP
→ Montant > 250€ : l'excédent est soumis à l'ONSS`,delai:"Annuel — selon CCT sectorielle",formulaire:"CCT d'entreprise ou application CCT sectorielle",ou:null,obligatoire:true,duree_estimee:'30 min'},

  {n:2,phase:'gestion',titre:"Attribution et prorata",detail:`═══ CALCUL DU PRORATA ═══
Le montant est proratisé selon :
• Le régime de travail (temps plein / temps partiel)
• La période d'occupation dans l'année

Exemple CP 200 : écochèques = 250€/an (temps plein)
• Travailleur mi-temps toute l'année : 250 × 50% = 125€
• Travailleur temps plein entré le 1er juillet : 250 × 6/12 = 125€
• Travailleur 4/5 entré le 1er avril : 250 × 80% × 9/12 = 150€

═══ PÉRIODE DE RÉFÉRENCE ═══
• Généralement l'année civile (jan-déc)
• Ou la période fixée par la CCT sectorielle
• Attribution : souvent en juin ou décembre (selon la CP)

═══ COMMANDE ═══
• Commande groupée auprès de l'émetteur
• Crédit sur la carte électronique du travailleur
• Frais émetteur : ±0,10-0,20€/chèque`,delai:"Selon la CCT — souvent juin ou décembre",formulaire:"Commande auprès de l'émetteur",ou:null,obligatoire:true,duree_estimee:'15 min/commande'},
],
alertes:[
  {niveau:'critique',texte:"Vérifier votre CP : les écochèques sont OBLIGATOIRES dans de nombreuses commissions paritaires (dont CP 200)."},
  {niveau:'important',texte:"Max 250€/an par travailleur temps plein. Dépassement = soumis à l'ONSS sur l'excédent."},
  {niveau:'attention',texte:"Validité 24 mois (plus longue que chèques-repas). Informer les travailleurs de la date d'expiration."},
  {niveau:'info',texte:"Les écochèques peuvent être convertis en avantage équivalent si une CCT d'entreprise le prévoit (ex: jours de congé supplémentaires)."},
],
simulation:{titre:"Écochèques — Coût annuel (5 employés temps plein)",lignes:[
  {label:'5 × 250€',montant:'1.250€',type:'neutre'},
  {label:'Frais émetteur',montant:'±25€',type:'neutre'},
  {label:'ONSS',montant:'0€ (exonéré)',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût employeur total',montant:'±1.275€/an',type:'vert_bold'},
  {label:'Pouvoir d\'achat travailleur',montant:'1.250€ net',type:'vert'},
]},
faq:[
  {q:"Peut-on remplacer les écochèques par du salaire ?",r:"Non, sauf si une CCT d'entreprise prévoit une conversion en avantage équivalent. Le travailleur ne peut pas exiger du salaire à la place."},
  {q:"Les écochèques sont-ils saisissables ?",r:"Non. Comme les chèques-repas, ils sont nominatifs et non saisissables."},
],
formulaires:[{nom:"SPF Emploi — Écochèques",url:"https://emploi.belgique.be/fr/themes/remuneration/ecocheques",type:'en_ligne'}]};
export default function ProcedureEcocheques(){const P=PROC_ECO;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_ECO};
