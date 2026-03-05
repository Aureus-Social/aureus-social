'use client';
import { useState, useMemo } from 'react';
const PROC_PREV={id:'plan_prevention',icon:'🔬',categorie:'bienetre',titre:"Plan de prévention & analyse des risques",resume:"Obligation légale : plan global de prévention (5 ans) + plan d'action annuel. Analyse des risques avec le SEPP. Document d'identification des dangers (physiques, chimiques, biologiques, psychosociaux, ergonomiques). Conseiller en prévention interne ou externe obligatoire.",
baseLegale:[{ref:"Loi 04/08/1996",desc:"Bien-être au travail — cadre général de prévention"},{ref:"AR 27/03/1998 (SIPPT)",desc:"Service interne de prévention et protection au travail"},{ref:"Code du bien-être au travail, Livre I",desc:"Principes généraux — analyse des risques, plans de prévention"}],
etapes:[
  {n:1,phase:'analyse',titre:"Analyse des risques — Identification des dangers",detail:`═══ OBLIGATION ═══
Tout employeur DOIT réaliser une analyse des risques.
Domaines couverts (loi bien-être) :
1. Sécurité au travail
2. Protection de la santé
3. Ergonomie
4. Hygiène du travail
5. Embellissement des lieux de travail
6. Aspects psychosociaux
7. Environnement (impact sur les travailleurs)

═══ MÉTHODE ═══
• Identification des dangers (inventaire systématique)
• Évaluation des risques (probabilité × gravité)
• Mesures de prévention (hiérarchie : élimination > substitution > protection collective > protection individuelle)
• Priorisation des actions

═══ QUI RÉALISE L'ANALYSE ? ═══
• L'employeur avec l'aide du conseiller en prévention
• Le SEPP pour les aspects spécialisés (médecine, psychosociaux)
• Participation des travailleurs (CE, CPPT, délégation syndicale)

═══ QUAND ? ═══
• À la création de l'entreprise
• Lors de tout changement (nouveau poste, nouvel équipement, réorganisation)
• Après chaque accident du travail
• Périodiquement (au moins tous les 5 ans)`,delai:"Dès le 1er travailleur — continu",formulaire:"Document d'analyse des risques",ou:null,obligatoire:true,duree_estimee:'4-16h selon la taille'},

  {n:2,phase:'plan',titre:"Plan global (5 ans) + Plan d'action annuel",detail:`═══ PLAN GLOBAL DE PRÉVENTION (5 ANS) ═══
Document stratégique couvrant 5 années civiles :
• Résultats de l'analyse des risques
• Objectifs prioritaires de prévention
• Activités et moyens pour atteindre les objectifs
• Missions et responsabilités des acteurs de prévention
• Budget prévisionnel
• Critères d'évaluation

═══ PLAN D'ACTION ANNUEL (PAA) ═══
Déclinaison annuelle du plan global :
• Actions concrètes pour l'année
• Calendrier de mise en œuvre
• Responsables désignés
• Budget détaillé
• Indicateurs de suivi

═══ AVIS OBLIGATOIRE ═══
• Le CPPT (ou la délégation syndicale, ou les travailleurs) doit donner un avis sur les plans
• L'avis est consultatif mais OBLIGATOIRE
• L'employeur doit motiver tout rejet de l'avis

═══ CONSEILLER EN PRÉVENTION INTERNE ═══
• OBLIGATOIRE dans toute entreprise
• <20 travailleurs : l'employeur peut être conseiller
• 20-199 travailleurs : conseiller niveau C minimum
• 200-499 : niveau B minimum
• ≥500 : niveau A (master + formation complémentaire)
• Le conseiller est PROTÉGÉ contre le licenciement`,delai:"Plan global : tous les 5 ans — PAA : chaque année",formulaire:"Plan global + plan d'action annuel",ou:null,obligatoire:true,duree_estimee:'2-4h/an'},
],
alertes:[
  {niveau:'critique',texte:"Plan global de prévention (5 ans) + plan d'action annuel OBLIGATOIRES. Absence = amende 400-4.000€ + responsabilité en cas d'accident."},
  {niveau:'critique',texte:"Conseiller en prévention interne OBLIGATOIRE. Le niveau dépend de la taille de l'entreprise. <20 : l'employeur peut assumer le rôle."},
  {niveau:'important',texte:"Analyse des risques à mettre à jour après chaque changement significatif et après chaque accident du travail."},
  {niveau:'attention',texte:"Le CPPT doit être consulté sur les plans. PME sans CPPT : consulter directement les travailleurs ou la délégation syndicale."},
],
simulation:{titre:"Coût prévention annuel (PME 10 travailleurs)",lignes:[
  {label:'SEPP (affiliation)',montant:'±1.000€/an',type:'neutre'},
  {label:'Examens médicaux',montant:'±500€/an',type:'neutre'},
  {label:'Formation prévention',montant:'±500€/an',type:'neutre'},
  {label:'EPI (équipements)',montant:'±200-2.000€/an',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Total prévention',montant:'±2.200-4.000€/an',type:'vert_bold'},
  {label:'Amende si absent',montant:'400-4.000€ + responsabilité',type:'vert'},
]},
faq:[
  {q:"Le plan de prévention est-il contrôlé ?",r:"Oui. L'inspection du bien-être au travail peut demander à voir les plans à tout moment. En cas d'accident grave, le contrôle est systématique."},
  {q:"Faut-il un conseiller en prévention séparé dans chaque filiale ?",r:"Chaque entité juridique doit avoir son propre SIPPT. Mais le conseiller peut être partagé entre petites entités si un accord existe."},
],
formulaires:[{nom:"SPF Emploi — Bien-être au travail",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail",type:'en_ligne'}]};
export default function ProcedurePlanPrevention(){const P=PROC_PREV;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_PREV};
