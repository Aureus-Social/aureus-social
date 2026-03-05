'use client';
import { useState } from 'react';
const P={id:'conge_aidant',icon:'🧑‍🤝‍🧑',titre:"Congé d'aidant proche",resume:"5 jours/an pour fournir des soins personnels à un membre du ménage ou de la famille souffrant d'un problème médical grave. Depuis 2023 (directive UE). Pas de rémunération obligatoire. Protection contre le licenciement.",
etapes:[{n:1,titre:"Conditions et durée",detail:`═══ CONGÉ D'AIDANT PROCHE (depuis 2023) ═══
Directive UE 2019/1158 transposée en droit belge.

• Durée : 5 JOURS ouvrables par an
• Non rémunéré (sauf disposition CCT plus favorable)
• Peut être pris en jours complets ou demi-jours
• PAS reportable d'une année à l'autre

═══ QUI PEUT EN BÉNÉFICIER ? ═══
Le travailleur qui fournit des soins à :
• Un membre du ménage (même adresse)
• OU un membre de la famille jusqu'au 2e degré (parents, enfants, frères/sœurs, grands-parents, petits-enfants)
• Souffrant d'un problème médical GRAVE

═══ DISTINCTION AVEC D'AUTRES CONGÉS ═══
• Congé pour assistance médicale (crédit-temps motif) : 1 mois → interruption complète
• Congé d'aidant proche reconnu : statut spécifique avec allocation ONEM
• Petit chômage : événements ponctuels, pas soins continus
Ce congé est COMPLÉMENTAIRE aux autres.

═══ FORMALITÉS ═══
• Demande à l'employeur : au moins 3 jours ouvrables à l'avance
• OU dès que possible si urgence
• Preuve : certificat médical attestant du problème médical grave
• L'employeur ne peut PAS refuser (mais peut demander la preuve)`,obligatoire:true},{n:2,titre:"Protection et alternatives",detail:`═══ PROTECTION CONTRE LE LICENCIEMENT ═══
• Protection dès la DEMANDE jusqu'à 2 MOIS après le dernier jour de congé
• Licenciement interdit sauf motif étranger au congé
• Indemnité si violation : 6 MOIS de salaire brut
• Charge de la preuve : sur l'employeur

═══ STATUT D'AIDANT PROCHE RECONNU ═══
Alternative plus longue :
• Reconnaissance par la mutuelle comme aidant proche
• Droit à une interruption de carrière (1-3 mois, renouvelable)
• Allocation ONEM : ±150-180€/mois (temps plein → mi-temps)
• Max : 6 mois sur l'ensemble de la carrière

═══ IMPACT SUR LE CONTRAT ═══
• Le contrat est SUSPENDU (pas rompu)
• Pas d'impact sur l'ancienneté
• Pas d'impact sur les droits aux vacances (période assimilée)
• L'employeur ne peut pas remplacer temporairement par un CDD de remplacement`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Protection 6 MOIS de salaire en cas de licenciement lié au congé d'aidant. Charge de la preuve sur l'employeur."},{niveau:'important',texte:"5 jours/an non rémunérés. L'employeur ne peut PAS refuser si la preuve médicale est fournie."},{niveau:'attention',texte:"Distinct du statut d'aidant proche reconnu (interruption de carrière plus longue avec allocation ONEM)."}]};
export default function ProcedureCongeAidant(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
