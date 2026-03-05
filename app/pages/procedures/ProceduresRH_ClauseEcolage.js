'use client';
import { useState } from 'react';
const P={id:'clause_ecolage',icon:'🎓',titre:"Clause d'écolage",resume:"Clause obligeant le travailleur à rester dans l'entreprise après une formation coûteuse, sous peine de rembourser une partie des frais. Salaire min >43.335€. Durée max 3 ans. Montant dégressif. Écrit obligatoire.",
etapes:[{n:1,titre:"Conditions de validité",detail:`═══ CONDITIONS CUMULATIVES (toutes requises) ═══

1. SALAIRE MINIMUM : >43.335€ brut/an (2026)
   • Si salaire inférieur → clause NULLE

2. FORMATION QUALIFIANTE
   • Permet d'acquérir de nouvelles compétences professionnelles
   • Dure au minimum 80 HEURES sur l'année civile
   • OU coûte plus de 2× le RMMMG (±4.040€)
   • Formations obligatoires (sécurité, etc.) ne comptent PAS

3. ÉCRIT
   • Clause écrite AVANT le début de la formation
   • Individuelle (pas dans le règlement de travail seul)
   • Contenu obligatoire : description formation, coût, durée engagement, montant remboursement dégressif

4. MONTANT DÉGRESSIF
   • Max = coût réel de la formation (salaire pendant la formation inclus si ≥ journée complète)
   • Plafonné à 30% du salaire brut annuel
   • Dégressif : diminue avec le temps
   • Exemple : 12.000€ de formation, engagement 3 ans
     → Départ dans l'année 1 : 12.000€ (mais max 30% salaire)
     → Départ année 2 : 8.000€
     → Départ année 3 : 4.000€
     → Après 3 ans : 0€

═══ DURÉE D'ENGAGEMENT ═══
• Maximum : 3 ANS après la fin de la formation
• Proportionnelle au coût de la formation`,obligatoire:true},{n:2,titre:"Application et exceptions",detail:`═══ QUAND LE REMBOURSEMENT EST DÛ ═══
• Le travailleur DÉMISSIONNE avant la fin de la période d'engagement
• Le travailleur est licencié pour MOTIF GRAVE

═══ QUAND LE REMBOURSEMENT N'EST PAS DÛ ═══
• L'employeur licencie (même pour réorganisation)
• Le travailleur démissionne pour motif grave imputable à l'employeur
• Le contrat se termine de commun accord
• Fin de CDD arrivé à terme

═══ CLAUSE NULLE SI ═══
• Salaire <43.335€
• Formation <80h ou <2× RMMMG
• Pas de clause écrite avant la formation
• Montant non dégressif
• Durée >3 ans
• Formation obligatoire (réglementaire)

═══ REMBOURSEMENT ═══
• L'employeur peut retenir sur le solde de tout compte
• Si insuffisant : action en justice possible
• Le juge peut réduire le montant si disproportionné
• Prescription : 1 AN après la fin du contrat`,obligatoire:true}],
alertes:[{niveau:'critique',texte:"Salaire min 43.335€ ET formation min 80h OU >2× RMMMG. En dessous → clause TOUJOURS NULLE."},{niveau:'important',texte:"Montant dégressif OBLIGATOIRE. Plafonné à 30% du salaire brut annuel. Clause écrite AVANT la formation."},{niveau:'attention',texte:"Licenciement par l'employeur = PAS de remboursement. La clause ne joue qu'en cas de démission ou motif grave."}]};
export default function ProcedureClauseEcolage(){const[eo,sEo]=useState(null);const tg=n=>sEo(eo===n?null:n);return(<div style={{fontFamily:'-apple-system,sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'}}><h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{P.icon} {P.titre}</h1><p style={{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6}}>{P.resume}</p><div style={{marginTop:24}}>{P.etapes.map(e=><div key={e.n} style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,marginBottom:8,borderLeft:'4px solid #3b82f6'}}><div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>tg(e.n)}><div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:'#3b82f620',color:'#3b82f6'}}>{e.n}</div><span style={{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'}}>{e.titre}</span><span style={{color:'#64748b',fontSize:18,transform:eo===e.n?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{eo===e.n&&<div style={{padding:'0 16px 16px 60px',fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'}}>{e.detail}</div>}</div>)}</div><div style={{marginTop:24}}>{P.alertes.map((a,i)=><div key={i} style={{background:a.niveau==='critique'?'#dc262610':a.niveau==='important'?'#f9731620':'#eab30815',border:`1px solid ${a.niveau==='critique'?'#dc262640':a.niveau==='important'?'#f9731640':'#eab30830'}`,borderRadius:12,padding:16,marginBottom:8}}><div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:a.niveau==='critique'?'#ef4444':a.niveau==='important'?'#f97316':'#eab308',marginBottom:6}}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div></div>)}
