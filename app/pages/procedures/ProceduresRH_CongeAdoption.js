'use client';
import { useState } from 'react';
const P={id:'conge_adoption',icon:'👨‍👩‍👧',titre:"Congé d'adoption",resume:"6 semaines par parent adoptif (+ 1 sem/3 ans). Les 3 premiers jours payés par l'employeur, ensuite mutuelle (82%). Protection contre le licenciement. Applicable aussi aux parents d'accueil de longue durée.",
etapes:[{n:1,titre:"Durée et conditions",detail:`═══ DURÉE DU CONGÉ D'ADOPTION ═══
• 6 SEMAINES par parent adoptif (mère ET père)
• +1 semaine supplémentaire par tranche de 3 ans (max +3 sem → 9 sem total)
• Prolongation progressive 2019-2027 selon planning légal
• Doit débuter dans les 2 MOIS suivant l'inscription au registre

═══ RÉMUNÉRATION ═══
• 3 premiers jours : salaire normal (charge employeur)
• À partir du 4e jour : allocation mutuelle = 82% du salaire plafonné
• Pas de jour de carence

═══ CONDITIONS ═══
• Adoption via un service agréé ou jugement d'adoption
• Attestation du tribunal ou du service d'adoption
• Notification à l'employeur : 1 MOIS avant le début du congé
• Preuve : jugement d'adoption ou attestation d'inscription au registre

═══ ACCUEIL DE LONGUE DURÉE ═══
• Placement familial de longue durée (>6 mois) : mêmes droits
• Attestation du tribunal de la jeunesse`,obligatoire:true},{n:2,titre:"Protection et formalités",detail:`═══ PROTECTION CONTRE LE LICENCIEMENT ═══
• Protection dès la DEMANDE du congé jusqu'à 2 MOIS après
• Licenciement interdit sauf motif ÉTRANGER à l'adoption
• Indemnité si licenciement illicite : 3 MOIS de salaire brut

═══ FORMALITÉS EMPLOYEUR ═══
1. Recevoir la demande écrite (1 mois avant)
2. Vérifier l'attestation d'adoption/placement
3. Compléter le formulaire mutuelle
4. Calculer le salaire garanti (3 jours)
5. DIMONA : pas de modification nécessaire
6. DmfA : code spécifique pour la période d'adoption

═══ CUMUL AVEC CONGÉ PARENTAL ═══
• Le congé d'adoption et le congé parental sont CUMULABLES
• Congé parental : 4 mois supplémentaires par enfant
• Total possible : 9 + 4 = 13 semaines par parent`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Protection contre le licenciement : dès la demande jusqu'à 2 mois après le retour. Indemnité 3 mois si violation."},{niveau:'important',texte:"3 premiers jours = employeur, ensuite mutuelle 82%. Notification 1 mois à l'avance obligatoire."},{niveau:'attention',texte:"Congé d'adoption et congé parental sont CUMULABLES. Jusqu'à 13 semaines au total par parent."}]};
export default function ProcedureCongeAdoption(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
