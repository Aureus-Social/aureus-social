'use client';
import { useState } from 'react';
const P={id:'lanceurs_alerte',icon:'🚨',titre:"Lanceurs d'alerte (2023)",resume:"Protection des personnes signalant des violations du droit UE ou national. Obligatoire pour les entreprises ≥50 travailleurs : canal de signalement interne. Protection absolue contre les représailles. Loi du 28/11/2022.",
etapes:[{n:1,titre:"Obligations et canal de signalement",detail:`═══ LOI DU 28/11/2022 (secteur privé) ═══
Transposition de la directive UE 2019/1937.

═══ QUI EST CONCERNÉ ? ═══
• Entreprises ≥250 travailleurs : depuis 15/02/2023
• Entreprises 50-249 travailleurs : depuis 17/12/2023
• <50 travailleurs : pas d'obligation (sauf secteurs réglementés)

═══ CANAL DE SIGNALEMENT INTERNE ═══
L'employeur DOIT mettre en place :
1. Un canal sécurisé (écrit et/ou oral)
2. Un gestionnaire de signalements (interne ou externe)
3. Accusé de réception dans les 7 JOURS
4. Suivi et réponse dans les 3 MOIS
5. Registre des signalements (confidentiel)
6. Information aux travailleurs sur le canal

═══ QUI PEUT SIGNALER ? ═══
• Travailleurs (salariés, intérimaires, stagiaires)
• Anciens travailleurs et candidats
• Indépendants, sous-traitants, fournisseurs
• Actionnaires et membres d'organes de gestion
• Bénévoles

═══ QUOI SIGNALER ? ═══
• Violations du droit UE (marchés publics, environnement, santé publique, protection des consommateurs, vie privée, concurrence, etc.)
• Fraude fiscale, blanchiment, corruption
• Violations du droit national dans les mêmes domaines`,obligatoire:true},{n:2,titre:"Protection et sanctions",detail:`═══ PROTECTION ABSOLUE ═══
Le lanceur d'alerte est protégé contre TOUTE représaille :
• Licenciement
• Rétrogradation, non-promotion
• Transfert, changement de fonction
• Réduction de salaire
• Évaluation négative
• Harcèlement, intimidation
• Mise sur liste noire
• Rupture anticipée de contrat

═══ CONDITIONS DE PROTECTION ═══
• Motifs raisonnables de croire que l'info est vraie au moment du signalement
• Signalement via le canal interne, externe (autorité compétente), OU divulgation publique (en dernier recours)
• Bonne foi (pas d'abus)

═══ CHARGE DE LA PREUVE ═══
• RENVERSÉE : c'est l'employeur qui doit prouver que la mesure n'est PAS une représaille
• Indemnité en cas de représailles : 18-26 SEMAINES de salaire brut
• Sanctions pénales possibles contre l'auteur des représailles

═══ SANCTIONS POUR L'ENTREPRISE ═══
• Pas de canal de signalement = amende administrative
• Représailles = indemnité + sanctions pénales
• Entrave au signalement = sanctions`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Canal de signalement interne OBLIGATOIRE dès 50 travailleurs. Accusé de réception 7 jours, réponse 3 mois."},{niveau:'critique',texte:"Protection ABSOLUE du lanceur d'alerte. Représailles = 18-26 semaines de salaire + sanctions pénales."},{niveau:'attention',texte:"Charge de la preuve RENVERSÉE : l'employeur doit prouver que la mesure n'est pas une représaille."}]};
export default function ProcedureLanceursAlerte(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
