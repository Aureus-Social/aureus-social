'use client';
import { useState, useMemo } from 'react';
const PROC_MALADIE={id:'maladie',icon:'🤒',categorie:'absence',titre:"Maladie — Incapacité de travail",resume:"Gestion complète de l'absence maladie : certificat médical, salaire garanti (30 jours employés, 30 jours ouvriers), passage à la mutuelle, contrôle médical, maladie de longue durée, trajet de réintégration. L'absence maladie est la cause d'absence la plus fréquente.",
baseLegale:[{ref:"Loi 03/07/1978, art. 31",desc:"Salaire garanti en cas d'incapacité de travail — 30 jours"},{ref:"AR 01/07/2006",desc:"Conditions du certificat médical et délai de remise"},{ref:"Loi AMI 14/07/1994",desc:"Assurance maladie-invalidité — indemnités mutuelle après le salaire garanti"},{ref:"Loi 13/06/1999",desc:"Médecine de contrôle — droit de l'employeur de faire vérifier l'incapacité"},{ref:"AR 28/10/2016",desc:"Trajet de réintégration des travailleurs en incapacité de longue durée"},{ref:"Code du bien-être au travail, Livre I Titre 4",desc:"Réintégration — obligations de l'employeur et du médecin du travail"}],
etapes:[
  {n:1,phase:'notification',titre:"Réception de l'avertissement maladie + certificat",detail:`═══ OBLIGATIONS DU TRAVAILLEUR ═══
1. AVERTIR immédiatement l'employeur (téléphone, SMS, email)
   • Délai : le 1er jour d'absence (ou dès que possible)
   • Pas de forme imposée par la loi MAIS le règlement de travail peut préciser

2. REMETTRE un certificat médical
   • Délai légal : 2 jours ouvrables (sauf si le règlement de travail prévoit autrement)
   • Le certificat mentionne : incapacité, durée probable, sortie autorisée ou non
   • Envoi par recommandé ou remise en main propre

═══ DISPENSE DE CERTIFICAT ═══
Depuis le 28/11/2022 : le travailleur peut être dispensé de certificat médical pour le 1er jour d'incapacité, 3 fois par an (entreprises >50 travailleurs).
Pour les entreprises ≤50 travailleurs : l'obligation de certificat peut être maintenue pour chaque absence via le règlement de travail.

═══ SI PAS DE CERTIFICAT ═══
• L'employeur peut refuser de payer le salaire garanti pour les jours non couverts
• Après mise en demeure, si toujours pas de certificat → salaire garanti refusé

═══ CERTIFICAT TARDIF ═══
Si le certificat arrive après le délai :
• Le salaire garanti n'est pas dû pour les jours avant la remise du certificat
• Sauf si le travailleur prouve un cas de force majeure`,delai:"Jour 1 : avertissement — Jour 2 : certificat",formulaire:"Certificat médical d'incapacité de travail",ou:null,obligatoire:true,duree_estimee:'Immédiat'},

  {n:2,phase:'salaire_garanti',titre:"Salaire garanti — 30 jours calendrier",detail:`L'employeur paie le salaire garanti pendant les 30 PREMIERS JOURS calendrier d'incapacité.

═══ EMPLOYÉS ═══
• Jours 1-30 : 100% du salaire normal → payé par l'EMPLOYEUR
• À partir du jour 31 : indemnités MUTUELLE (±60% du salaire plafonné)

═══ OUVRIERS ═══
• Jours 1-7 : 100% du salaire normal → EMPLOYEUR
• Jours 8-14 : 85,88% du salaire normal → EMPLOYEUR (25,88% + 60% via mutuelle, mais l'employeur avance)
• Jours 15-30 : 85,88% → EMPLOYEUR (même mécanisme)
• Réalité simplifiée : l'employeur paie 30 jours, avec des pourcentages variables

═══ CALCUL SALAIRE GARANTI ═══
Exemple : employé, 3.200€ brut/mois, absent du 5 au 20 février (16 jours)
• Salaire garanti = 16/20 × 3.200€ = 2.560€ brut (jours ouvrables dans la période)
• L'employeur paie la totalité (dans les 30 jours)

═══ RECHUTE ═══
Si le travailleur reprend le travail et retombe malade dans les 14 jours :
• MÊME maladie : pas de nouveau salaire garanti (continuation de la première période)
• AUTRE maladie (certificat médical différent) : nouveau salaire garanti de 30 jours

═══ CAS PARTICULIERS ═══
• CDD : salaire garanti limité à la durée restante du CDD
• Période d'essai (clause d'essai CDD 1re moitié) : salaire garanti normal
• Temps partiel : salaire garanti proportionnel à l'horaire habituel`,delai:"Jours 1 à 30 de l'incapacité",formulaire:"Fiche de paie avec salaire garanti",ou:null,obligatoire:true,duree_estimee:'Calcul mensuel'},

  {n:3,phase:'salaire_garanti',titre:"Contrôle médical — Droit de l'employeur",detail:`L'employeur a le droit de faire vérifier l'incapacité par un médecin-contrôleur.

═══ PROCÉDURE ═══
1. L'employeur mandate un médecin-contrôleur (à ses frais)
2. Le médecin se rend au domicile du travailleur (ou lieu de résidence indiqué)
3. Le travailleur DOIT se soumettre au contrôle (sinon → perte du salaire garanti)
4. Le médecin-contrôleur examine le travailleur et rédige un rapport

═══ RÉSULTATS POSSIBLES ═══
✅ Incapacité confirmée → salaire garanti maintenu
❌ Incapacité non confirmée → l'employeur peut suspendre le salaire garanti
⚠️ Désaccord → procédure d'arbitrage (médecin-arbitre dans les 2 jours)

═══ RÈGLES ═══
• Le contrôle se fait pendant les heures de sortie autorisées OU à tout moment si pas de sortie autorisée
• Le travailleur peut être obligé de rester à domicile (si certificat le mentionne)
• Le médecin-contrôleur ne peut PAS prescrire de traitement (uniquement vérifier l'incapacité)
• Coût : ±50-100€ par visite (à charge de l'employeur)

═══ MÉDECIN-ARBITRE ═══
En cas de désaccord entre le médecin traitant et le médecin-contrôleur :
• Un médecin-arbitre est désigné dans les 2 jours ouvrables
• Sa décision est contraignante pour les deux parties
• Frais à charge de la partie perdante`,delai:"Pendant la période de salaire garanti",formulaire:null,ou:"Médecin-contrôleur mandaté par l'employeur",obligatoire:false,duree_estimee:'1-2 jours'},

  {n:4,phase:'mutuelle',titre:"Passage à la mutuelle — Après 30 jours",detail:`Après 30 jours de salaire garanti, la mutuelle prend le relais.

═══ DÉCLARATION À LA MUTUELLE ═══
Le travailleur doit :
1. Transmettre le certificat médical à sa mutuelle (si pas encore fait)
2. Compléter les formulaires de demande d'indemnités
3. La mutuelle verse les indemnités à partir du 31e jour

═══ INDEMNITÉS MUTUELLE (AMI) ═══
Incapacité primaire (jour 31 → mois 12) :
• Avec charge de famille : 60% du salaire brut plafonné
• Isolé : 60%
• Cohabitant : 55%
• Plafond salarial ±4.500€ brut/mois (2026)

Invalidité (après 1 an) :
• Avec charge de famille : 65%
• Isolé : 55%
• Cohabitant : 40%

═══ OBLIGATIONS DE L'EMPLOYEUR ═══
• Compléter l'attestation de salaire pour la mutuelle
• Fournir les données salariales nécessaires (formulaire de la mutuelle)
• Maintenir le contrat de travail (suspendu, pas rompu)
• Continuer les déclarations DmfA (code absence maladie)

═══ IMPACT SUR LE CONTRAT ═══
Le contrat est SUSPENDU pendant la maladie :
• Pas de salaire (mutuelle prend le relais)
• L'ancienneté continue à courir
• Le travailleur reste dans l'effectif
• Les avantages extra-légaux : vérifier la police d'assurance groupe`,delai:"À partir du 31e jour d'incapacité",formulaire:"Attestation de salaire pour la mutuelle",ou:"Mutuelle du travailleur",obligatoire:true,duree_estimee:'1h'},

  {n:5,phase:'longue_duree',titre:"Maladie longue durée — Trajet de réintégration",detail:`Après 2 mois d'incapacité, le médecin du travail peut être impliqué.

═══ TRAJET DE RÉINTÉGRATION (AR 28/10/2016) ═══
Peut être initié par :
• Le travailleur (à tout moment)
• L'employeur (au plus tôt après 3 mois d'incapacité)
• Le médecin-conseil de la mutuelle

═══ PROCÉDURE ═══
1. Demande au médecin du travail (SEPP)
2. Le médecin du travail évalue le travailleur (dans les 40 jours)
3. 5 décisions possibles :
   A. Retour au même poste (éventuellement avec adaptation)
   B. Retour au même poste avec aménagement temporaire
   C. Retour à un autre poste (avec ou sans adaptation)
   D. Retour à un autre poste avec formation
   E. Incapacité définitive pour le poste → pas de retour possible

4. L'employeur établit un plan de réintégration (dans les 63 jours)
5. Le travailleur accepte ou refuse le plan

═══ DÉCISION E — INCAPACITÉ DÉFINITIVE ═══
Si le médecin du travail conclut à l'incapacité définitive :
• Le travailleur peut contester (dans les 21 jours)
• Si confirmé et si l'employeur démontre l'impossibilité → possibilité de rupture pour force majeure médicale
• MAIS : la force majeure médicale est très encadrée et souvent contestée

═══ FORCE MAJEURE MÉDICALE ═══
Depuis la réforme de 2022 :
• Le trajet de réintégration doit être terminé
• Le médecin du travail doit avoir conclu à l'incapacité définitive
• Le travailleur doit avoir épuisé ses recours
• L'employeur doit avoir démontré l'impossibilité de travail adapté
• La rupture est notifiée par recommandé
• Pas de préavis ni d'indemnité (c'est la force majeure)`,delai:"Après 3 mois d'incapacité (initiative employeur)",formulaire:"Demande de trajet de réintégration (SEPP)",ou:"Médecin du travail (SEPP / SPMT / Cohezio / etc.)",obligatoire:false,duree_estimee:'3-6 mois'},

  {n:6,phase:'longue_duree',titre:"Cotisation de responsabilisation — Maladie longue durée",detail:`Depuis 2022, l'employeur peut être soumis à une COTISATION DE RESPONSABILISATION si le taux de maladie de longue durée est excessif.

═══ PRINCIPE ═══
Les employeurs avec un taux d'incapacité de longue durée significativement supérieur à la moyenne du secteur et à la moyenne nationale sont soumis à une cotisation trimestrielle.

═══ CONDITIONS ═══
• Entreprise ≥50 travailleurs
• Nombre de travailleurs en invalidité (>1 an) excessif
• Comparaison avec le secteur et la moyenne nationale
• Calcul par l'ONSS sur base de la DmfA

═══ MONTANT ═══
• 0,625% de la masse salariale du trimestre par travailleur en excès
• Cotisation trimestrielle additionnelle
• Communication de l'ONSS à l'employeur

═══ COMMENT RÉDUIRE LE TAUX ═══
✅ Politique de prévention des risques psychosociaux
✅ Aménagement ergonomique des postes
✅ Trajets de réintégration proactifs
✅ Politique de bien-être au travail
✅ Suivi RH des absences (entretiens de retour)
✅ Programme de reprise progressive (mi-temps thérapeutique)`,delai:"Trimestriel (vérification ONSS automatique)",formulaire:null,ou:"ONSS — notification automatique",obligatoire:true,duree_estimee:'Prévention continue'},
],
alertes:[
  {niveau:'critique',texte:"Salaire garanti 30 jours OBLIGATOIRE. L'employeur ne peut PAS refuser sauf si pas de certificat médical dans le délai (2 jours ouvrables)."},
  {niveau:'critique',texte:"Le contrat est SUSPENDU pendant la maladie, PAS rompu. L'employeur ne peut PAS licencier POUR CAUSE de maladie (discrimination). Mais peut licencier pour un autre motif."},
  {niveau:'important',texte:"Rechute dans les 14 jours (même maladie) : pas de nouveau salaire garanti. Autre maladie = nouveau salaire garanti de 30 jours."},
  {niveau:'important',texte:"Depuis 2022 : dispense de certificat pour le 1er jour d'absence, 3×/an (entreprises >50 travailleurs)."},
  {niveau:'attention',texte:"Contrôle médical : le travailleur DOIT s'y soumettre. Refus = perte du salaire garanti pour les jours de refus."},
  {niveau:'attention',texte:"Cotisation de responsabilisation si taux maladie longue durée excessif (>50 travailleurs). Investir en prévention !"},
  {niveau:'info',texte:"La force majeure médicale ne peut être invoquée qu'après un trajet de réintégration complet. Procédure longue et encadrée."},
],
simulation:{titre:"Coût maladie pour l'employeur (3.200€ brut, 3 mois d'absence)",lignes:[
  {label:'SALAIRE GARANTI (30 jours) :',montant:'',type:'neutre'},
  {label:'  Brut + charges patronales',montant:'±4.300€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'APRÈS 30 JOURS (mutuelle) :',montant:'',type:'neutre'},
  {label:'  Coût direct employeur',montant:'0€ (mutuelle)',type:'vert'},
  {label:'  Coût indirect (remplacement)',montant:'±6.000-9.000€',type:'neutre'},
  {label:'  Médecin-contrôleur (optionnel)',montant:'±100€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'TOTAL coût direct (3 mois)',montant:'±4.400€',type:'vert_bold'},
  {label:'TOTAL avec coûts indirects',montant:'±10.000-13.000€',type:'vert_bold'},
]},
faq:[
  {q:"Puis-je licencier un travailleur en maladie de longue durée ?",r:"Oui, MAIS pas POUR CAUSE de maladie (discrimination). Le licenciement doit être motivé par un autre motif (réorganisation, suppression de poste). Le préavis est suspendu pendant la maladie."},
  {q:"Le travailleur doit-il fournir un certificat dès le 1er jour ?",r:"Non depuis 2022 : dispense de certificat pour le 1er jour, 3 fois/an (>50 travailleurs). Pour les autres : selon le règlement de travail (généralement 2 jours ouvrables)."},
  {q:"Comment calculer le salaire garanti pour un temps partiel ?",r:"Proportionnellement à l'horaire habituel. Mi-temps = 50% du salaire garanti d'un temps plein."},
  {q:"Le travailleur peut-il refuser le trajet de réintégration ?",r:"Oui. Mais le refus peut avoir des conséquences : la mutuelle peut réévaluer les indemnités, et l'employeur peut en tenir compte dans la gestion RH."},
],
formulaires:[{nom:"INAMI — Incapacité de travail",url:"https://www.inami.fgov.be/fr/themes/incapacite-travail",type:'en_ligne'},{nom:"SPF Emploi — Salaire garanti",url:"https://emploi.belgique.be/fr/themes/remuneration/salaire-garanti",type:'en_ligne'}]};

export default function ProcedureMaladie(){const P=PROC_MALADIE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'notification',l:'Notification',i:'📞'},{id:'salaire_garanti',l:'Salaire garanti',i:'💰'},{id:'mutuelle',l:'Mutuelle',i:'🏥'},{id:'longue_duree',l:'Longue durée',i:'📅'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_MALADIE};
