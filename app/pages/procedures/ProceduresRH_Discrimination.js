'use client';
import { useState } from 'react';
const P={id:'discrimination',icon:'⚖️',titre:"Discrimination & égalité de traitement",resume:"19 critères protégés (âge, sexe, handicap, orientation sexuelle, etc.). Discrimination directe et indirecte interdites. Charge de la preuve partagée. Indemnité 6 mois de salaire. Action positive autorisée. Écart salarial H/F : rapport bisannuel obligatoire.",
etapes:[{n:1,titre:"Cadre légal et critères protégés",detail:`═══ 3 LOIS ANTI-DISCRIMINATION ═══
1. Loi du 10/05/2007 (anti-discrimination générale)
2. Loi du 10/05/2007 (genre — égalité H/F)
3. Loi du 30/07/1981 (racisme et xénophobie)

═══ 19 CRITÈRES PROTÉGÉS ═══
• Âge, orientation sexuelle, état civil, naissance
• Fortune, conviction religieuse/philosophique, conviction politique
• Conviction syndicale, langue, état de santé actuel/futur
• Handicap, caractéristique physique/génétique
• Origine sociale, nationalité, prétendue race, couleur de peau
• Ascendance, origine nationale/ethnique
• Sexe (incluant grossesse, accouchement, maternité, changement de sexe)

═══ TYPES DE DISCRIMINATION ═══
1. DIRECTE : traitement moins favorable basé sur un critère protégé
   Ex : "On n'embauche pas de femmes voilées"
2. INDIRECTE : mesure neutre en apparence mais impact disproportionné
   Ex : exiger un diplôme belge pour un poste ne le nécessitant pas
3. HARCÈLEMENT lié à un critère protégé
4. INJONCTION DE DISCRIMINER

═══ CHARGE DE LA PREUVE ═══
PARTAGÉE :
• Le travailleur présente des faits laissant présumer une discrimination
• L'employeur doit prouver l'ABSENCE de discrimination
• Éléments de preuve : statistiques, comparaisons, testing, témoignages`,obligatoire:true},{n:2,titre:"Sanctions et obligations spécifiques",detail:`═══ SANCTIONS ═══
• Indemnité forfaitaire : 6 MOIS de salaire brut (ou dommage réel si supérieur)
• Nullité de la clause/mesure discriminatoire
• Action en cessation (tribunal du travail)
• Sanctions pénales possibles (racisme : emprisonnement possible)

═══ ÉCART SALARIAL H/F ═══
Obligations légales :
• Rapport bisannuel sur l'écart salarial (CE ou délégation syndicale)
• Analyse par catégorie de fonctions
• Plan d'action si écart significatif
• Entreprises ≥50 : obligation d'un médiateur en cas d'écart

═══ OFFRES D'EMPLOI ═══
• INTERDICTION de mentionner le sexe, l'âge, l'origine
• "Jeune et dynamique" = discrimination par l'âge
• Exception : exigence professionnelle essentielle et déterminante

═══ ACTION POSITIVE ═══
• Autorisée par la loi sous conditions strictes
• Doit viser à éliminer une inégalité existante
• Proportionnée et temporaire
• AR requis pour certaines mesures

═══ UNIA et INSTITUT POUR L'ÉGALITÉ H/F ═══
• Organes de recours extrajudiciaire
• Peuvent agir en justice au nom de la victime
• Médiation et conciliation gratuite`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"19 critères protégés. Charge de la preuve PARTAGÉE. Indemnité forfaitaire = 6 MOIS de salaire si discrimination prouvée."},{niveau:'important',texte:"Rapport bisannuel écart salarial H/F obligatoire (≥50 travailleurs). Plan d'action si écart significatif."},{niveau:'attention',texte:"Offres d'emploi : JAMAIS de mention d'âge, sexe, origine. 'Jeune et dynamique' = discrimination illégale."}]};
export default function ProcedureDiscrimination(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
