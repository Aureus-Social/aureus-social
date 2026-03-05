'use client';
import { useState } from 'react';
const P={id:'travail_nuit',icon:'🌙',titre:"Travail de nuit & dimanche",resume:"Travail entre 20h et 6h = travail de nuit (interdit sauf exceptions). Sursalaire dimanche/nuit selon CCT sectorielle. Surveillance médicale renforcée pour les travailleurs de nuit. Prime de nuit fréquente (non obligatoire légalement mais quasi toujours par CCT).",
etapes:[{n:1,titre:"Règles et exceptions",detail:`═══ TRAVAIL DE NUIT : INTERDIT PAR DÉFAUT ═══
• Nuit = période de 20h à 6h (ou 8h de repos incluant 20h-6h)
• Interdit SAUF exceptions prévues par la loi ou CCT

═══ EXCEPTIONS (travail de nuit autorisé) ═══
• Travail en équipes (rotation 2 ou 3 postes)
• Horeca (hôtellerie, restauration, cafés)
• Soins de santé (hôpitaux, maisons de repos)
• Surveillance et gardiennage
• Commerce de détail (boulangeries dès 4h, etc.)
• Transport et logistique
• Médias et spectacles
• E-commerce (CCT sectorielle requise)
• Travaux continus (industrie chimique, sidérurgie, etc.)

═══ SURSALAIRE ═══
• Pas de sursalaire LÉGAL pour le travail de nuit
• MAIS quasi toutes les CCT prévoient une PRIME DE NUIT
• CP 200 : pas de prime de nuit conventionnelle (à prévoir au contrat)
• Industrie : souvent +15-25% du salaire horaire
• Santé : +35% entre 20h et 6h
• Dimanche : sursalaire LÉGAL de +100% (loi du travail)

═══ TRAVAIL DU DIMANCHE ═══
• Interdit par défaut (repos dominical obligatoire)
• Exceptions similaires au travail de nuit
• Sursalaire : +100% du salaire horaire (LÉGAL)
• Repos compensatoire : dans les 6 jours suivants`,obligatoire:true},{n:2,titre:"Surveillance médicale et conditions",detail:`═══ SURVEILLANCE MÉDICALE ═══
• Travailleur de nuit = examen médical AVANT le début
• Évaluation de santé périodique : tous les ANS (vs 3-5 ans pour les autres)
• Le médecin du travail peut déclarer INAPTE au travail de nuit
• Le travailleur peut demander un transfert vers un poste de jour

═══ CONDITIONS SPÉCIALES ═══
• Transport de nuit : l'employeur doit assurer le transport si les transports en commun ne fonctionnent pas
• Femmes enceintes : pas de travail de nuit pendant la grossesse (dès 8 semaines avant l'accouchement)
• Jeunes travailleurs (<18 ans) : INTERDIT entre 20h et 6h (sauf exceptions limitées)

═══ AVANTAGE FISCAL (EMPLOYEUR) ═══
Dispense de versement de précompte professionnel :
• 22,8% de la rémunération imposable des travailleurs en équipes/nuit
• Condition : prime d'équipe/nuit ≥2% du salaire horaire
• Économie significative pour l'employeur (pas pour le travailleur)
• Calculé séparément dans la déclaration PP`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Travail de nuit et dimanche : INTERDITS par défaut. Autorisation uniquement par loi ou CCT. Dimanche = +100% sursalaire légal."},{niveau:'important',texte:"Surveillance médicale annuelle OBLIGATOIRE pour les travailleurs de nuit. Inapte = transfert vers poste de jour."},{niveau:'attention',texte:"Dispense PP employeur 22,8% pour travail en équipes/nuit. Avantage fiscal majeur à activer."}]};
export default function ProcedureTravailNuit(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
