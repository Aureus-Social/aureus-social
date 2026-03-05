'use client';
import { useState } from 'react';
const P={id:'conge_deuil',icon:'😢',titre:"Congé de deuil (10 jours)",resume:"Depuis 2023 : 10 jours de congé de deuil pour le décès du conjoint/cohabitant ou d'un enfant. 3 jours payés par l'employeur, 7 jours indemnisés par la mutuelle (82%). Distinct du petit chômage. Flexible sur 1 an.",
etapes:[{n:1,titre:"Durée et bénéficiaires",detail:`═══ CONGÉ DE DEUIL (depuis 01/02/2023) ═══
• 10 JOURS ouvrables pour le décès de :
  → Conjoint ou cohabitant légal/de fait
  → Enfant (biologique, adoptif, enfant du conjoint)

• RÉMUNÉRATION
  → 3 premiers jours : salaire normal (charge employeur)
  → 7 jours suivants : allocation mutuelle = 82% du salaire plafonné
  → Indemnité journalière mutuelle : ±65-100€/jour selon le salaire

• FLEXIBILITÉ
  → Les 10 jours peuvent être pris sur une PÉRIODE D'1 AN
  → Pas obligation de les prendre consécutivement
  → Accord avec l'employeur pour la planification (au-delà des 3 premiers jours)

═══ DISTINCTION AVEC LE PETIT CHÔMAGE ═══
Le petit chômage prévoit aussi des jours pour décès :
• Conjoint/enfant : absorbé dans les 10 jours de deuil
• Parents, beaux-parents : 3 jours (petit chômage, pas congé de deuil)
• Frère/sœur : 2 jours
• Oncle/tante, neveu/nièce : 1 jour
Ces jours de petit chômage sont DISTINCTS et s'ajoutent au congé de deuil si applicable.`,obligatoire:true},{n:2,titre:"Formalités et protection",detail:`═══ FORMALITÉS ═══
• Le travailleur informe l'employeur dès que possible
• Preuve : acte de décès (ou extrait)
• Formulaire mutuelle pour les 7 derniers jours
• L'employeur ne peut PAS refuser les 3 premiers jours

═══ PROTECTION ═══
• Pas de protection spécifique contre le licenciement (contrairement au congé de maternité)
• MAIS un licenciement pendant un congé de deuil serait très mal perçu par un tribunal
• Le contrat est SUSPENDU pendant le congé de deuil

═══ CAS PARTICULIERS ═══
• Mort-né (après 180 jours de grossesse) : le congé de deuil s'applique
• Enfant placé en accueil familial (longue durée) : assimilé à un enfant
• Cohabitant de fait : preuve de cohabitation (composition de ménage)
• Si le travailleur tombe malade pendant le congé de deuil : les jours de maladie ne se substituent PAS aux jours de deuil restants`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"10 jours de congé de deuil (conjoint/enfant) depuis 2023. 3j employeur + 7j mutuelle. Ne pas confondre avec le petit chômage."},{niveau:'important',texte:"Les 10 jours peuvent être étalés sur 1 AN. Flexibilité totale en accord avec l'employeur."},{niveau:'attention',texte:"Mort-né après 180 jours de grossesse : le congé de deuil s'applique aussi."}]};
export default function ProcedureCongeDeuil(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
