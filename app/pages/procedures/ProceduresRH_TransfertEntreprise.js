'use client';
import { useState } from 'react';
const P={id:'transfert_entreprise',icon:'🔄',titre:"Transfert d'entreprise (CCT 32bis)",resume:"En cas de cession, fusion, scission ou reprise : tous les contrats de travail sont transférés au repreneur. Les conditions sont maintenues. Licenciement interdit pour le motif du transfert. Information et consultation des travailleurs obligatoires.",
etapes:[{n:1,titre:"Principe et conditions",detail:`═══ CCT n°32BIS (directive UE 2001/23/CE) ═══
Transfert conventionnel d'entreprise = transfert d'une entité économique qui maintient son identité.

═══ QUAND S'APPLIQUE LA CCT 32BIS ? ═══
• Cession d'entreprise (vente d'un fonds de commerce)
• Fusion et scission de sociétés
• Apport de branche d'activité
• Transfert sous autorité de justice (PRJ)
• Externalisation/insourcing avec transfert d'activité
• PAS : simple cession d'actions (pas de changement d'employeur)

═══ TRANSFERT AUTOMATIQUE DES CONTRATS ═══
• TOUS les contrats de travail sont transférés au cessionnaire
• Le travailleur ne peut PAS refuser le transfert
• Le cessionnaire ne peut PAS refuser de reprendre les travailleurs
• L'ancienneté est MAINTENUE intégralement
• Toutes les conditions de travail sont maintenues :
  → Salaire, primes, avantages
  → Fonction, horaire
  → Assurance groupe, hospitalisation
  → Chèques-repas, écochèques

═══ SOLIDARITÉ ═══
Le cédant et le cessionnaire sont SOLIDAIREMENT responsables des dettes salariales :
• Salaires impayés avant le transfert
• Pécule de vacances
• Indemnités de préavis en cours
• Pendant 1 AN après le transfert`,obligatoire:true},{n:2,titre:"Protection et information",detail:`═══ INTERDICTION DE LICENCIER ═══
• Le licenciement POUR LE MOTIF du transfert est INTERDIT
• Le cessionnaire peut licencier pour raisons économiques, techniques ou organisationnelles INDÉPENDANTES du transfert
• Charge de la preuve : sur l'employeur
• Indemnité si licenciement lié au transfert = indemnité de préavis + éventuels dommages et intérêts

═══ INFORMATION ET CONSULTATION ═══
L'employeur (cédant et cessionnaire) DOIT informer les travailleurs :
• Date (prévue) du transfert
• Motif du transfert
• Conséquences juridiques, économiques et sociales
• Mesures envisagées à l'égard des travailleurs
• Via le CE, la délégation syndicale ou les travailleurs directement

═══ MODIFICATION DES CONDITIONS ═══
• Le cessionnaire ne peut PAS modifier unilatéralement les conditions
• Modification possible UNIQUEMENT par accord mutuel (avenant)
• Si modification substantielle au détriment du travailleur → assimilé à un licenciement
• Le travailleur peut invoquer un acte équipollent à rupture

═══ CAS PARTICULIER : TRANSFERT SOUS AUTORITÉ DE JUSTICE ═══
En cas de PRJ (transfert sous autorité de justice) :
• Le repreneur peut choisir les travailleurs qu'il reprend
• Les conditions peuvent être adaptées (négociation)
• Le repreneur n'est PAS lié par les dettes du cédant
• Les travailleurs non repris sont licenciés par le cédant`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Transfert AUTOMATIQUE de tous les contrats. L'ancienneté et toutes les conditions sont maintenues."},{niveau:'critique',texte:"Licenciement pour motif du transfert = INTERDIT. Charge de la preuve sur l'employeur."},{niveau:'important',texte:"Solidarité cédant/cessionnaire pendant 1 AN pour les dettes salariales antérieures au transfert."},{niveau:'attention',texte:"PRJ : le repreneur peut choisir les travailleurs. Exception au principe de transfert automatique."}]};
export default function ProcedureTransfertEntreprise(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
