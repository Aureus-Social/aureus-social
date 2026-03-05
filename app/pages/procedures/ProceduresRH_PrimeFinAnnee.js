'use client';
import { useState } from 'react';
const P={id:'prime_fin_annee',icon:'💸',titre:"Prime de fin d'année (13e mois)",resume:"Pas d'obligation légale générale, mais imposée par quasi toutes les CCT sectorielles. CP 200 : 13e mois = salaire brut de décembre. Prorata si entrée/sortie en cours d'année. Soumis ONSS + PP. Payée en décembre.",
etapes:[{n:1,titre:"Base légale et calcul",detail:`═══ PAS D'OBLIGATION LÉGALE GÉNÉRALE ═══
La prime de fin d'année n'est PAS prévue par la loi !
Elle résulte de :
• CCT sectorielle (quasi tous les secteurs l'imposent)
• CCT d'entreprise
• Contrat individuel
• Usage constant (après 3 ans = obligation)

═══ CP 200 (EMPLOYÉS) ═══
• 13e mois = salaire brut mensuel de DÉCEMBRE
• Prorata si entrée en cours d'année : n/12 × salaire
• Conditions : être en service au 31 décembre (ou prorata si départ)
• Certaines CCT excluent les travailleurs avec <6 mois d'ancienneté

═══ CALCUL STANDARD ═══
• Base : dernier salaire mensuel brut
• Prorata : mois prestés / 12
• Périodes assimilées : maladie (1ère année), maternité, vacances, petit chômage
• Périodes non assimilées : crédit-temps, chômage temporaire (selon CCT)

Exemple : employé CP 200, 4.000€ brut, entré le 1er juillet
→ Prime = 4.000 × 6/12 = 2.000€ brut

═══ RÉGIME FISCAL ET SOCIAL ═══
• ONSS : 13,07% travailleur + ±25% patronal
• Précompte professionnel : taux SPÉCIAL (souvent ±35-40%)
• Net : environ 55-60% du brut
• Exemple : 4.000€ brut → ±2.300€ net`,obligatoire:true},{n:2,titre:"Cas particuliers et provision",detail:`═══ DÉPART EN COURS D'ANNÉE ═══
• Démission : prorata DÛ (si CCT le prévoit, ce qui est presque toujours le cas)
• Licenciement : prorata DÛ
• Licenciement motif grave : PAS de prorata (perte du droit)
• Fin CDD : prorata DÛ

═══ PROVISION COMPTABLE ═══
• L'employeur DOIT provisionner mensuellement 1/12 de la prime
• Comptablement : charge + provision = lissage du coût
• Poids : ±8,33% de la masse salariale brute annuelle (hors ONSS patron)

═══ ALTERNATIVES OPTIMISÉES ═══
Certaines entreprises remplacent (partiellement) le 13e mois par :
• Bonus CCT 90 (cotisation 33% vs ±50% ONSS)
• Warrants (taxe ±35% mais pas d'ONSS)
• Assurance groupe (cotisation 8,86%)
• Attention : ne peut pas remplacer une obligation CCT sectorielle !

═══ HORECA, CONSTRUCTION, etc. ═══
Chaque secteur a ses propres règles :
• Horeca : prime via fonds social
• Construction : prime via fonds sectoriel
• Intérim : pas de 13e mois (mais compensation salariale)`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Quasi toutes les CCT sectorielles imposent la prime de fin d'année. Vérifier la CCT applicable AVANT de recruter."},{niveau:'important',texte:"PP spécial ±35-40% sur la prime. Le net est nettement inférieur au salaire mensuel net habituel."},{niveau:'attention',texte:"L'usage constant (3 ans) crée une obligation. Si vous payez 3 ans de suite = vous devez continuer."}]};
export default function ProcedurePrimeFinAnnee(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
