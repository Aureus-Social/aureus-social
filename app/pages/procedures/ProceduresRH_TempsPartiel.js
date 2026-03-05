'use client';
import { useState, useMemo } from 'react';

const PROC_TEMPS_PARTIEL = {
  id:'temps_partiel', icon:'⏰', categorie:'regime',
  titre:"Temps partiel — Mi-temps, 4/5, 3/4, tiers-temps",
  resume:"Organisation du travail à temps partiel : obligations légales, mentions contractuelles, horaires, publicité, droits sociaux proportionnels. Le temps partiel est très encadré en Belgique pour protéger le travailleur contre les abus.",
  baseLegale:[
    {ref:"Loi 03/07/1978, art. 11bis",desc:"Mentions obligatoires du contrat de travail à temps partiel"},
    {ref:"AR 25/06/1990",desc:"Assimilation du travail à temps partiel — droits sociaux proportionnels"},
    {ref:"Loi 05/03/2002",desc:"Principe de non-discrimination des travailleurs à temps partiel"},
    {ref:"CCT n° 35 (27/02/1981)",desc:"Conditions de travail à temps partiel — obligations de l'employeur (CNT)"},
    {ref:"AR 21/12/1992",desc:"Publicité des horaires à temps partiel — affichage et communication"},
    {ref:"Directive européenne 97/81/CE",desc:"Accord-cadre sur le travail à temps partiel — transposé en droit belge"},
    {ref:"Charte sociale européenne, art. 4§4",desc:"Droit à un temps de travail raisonnable et proportionnel"},
  ],
  fractions:[
    {type:'Mi-temps (1/2)',fraction:'50%',heures:'19h/sem (base 38h)',exemple:'Lu-Ma-Me matin ou 5 demi-journées',onss:'Cotisations sur salaire réel',droits:'Chômage : complément AGR si involontaire. Pension : proportionnelle.'},
    {type:'4/5e temps (4/5)',fraction:'80%',heures:'30,4h/sem',exemple:'4 jours pleins ou 5 jours × 6h',onss:'Cotisations sur salaire réel',droits:'Maintien de la plupart des droits sociaux. Pension quasi-complète.'},
    {type:'3/4 temps (3/4)',fraction:'75%',heures:'28,5h/sem',exemple:'3 jours pleins + 1 demi-journée',onss:'Cotisations sur salaire réel',droits:'Droits proportionnels. Pension impactée si longue durée.'},
    {type:'Tiers-temps (1/3)',fraction:'33%',heures:'12,67h/sem',exemple:'2 jours ou 5 × 2,5h',onss:'ATTENTION : minimum 1/3 temps obligatoire pour ONSS',droits:'Droits sociaux réduits. Pension très impactée. Chômage limité.'},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Déterminer la fraction de temps partiel et l'horaire",
     detail:`Le temps partiel doit respecter des SEUILS MINIMUMS légaux.

═══ SEUIL MINIMUM : 1/3 TEMPS ═══
La durée hebdomadaire ne peut être inférieure à 1/3 du temps plein de référence.
• Base 38h → minimum 12h40/semaine (≈12,67h)
• Exceptions : certaines CCT sectorielles permettent un seuil inférieur
• Dérogation possible via CCT d'entreprise (rare)

═══ SEUIL PAR PRESTATION : 3 HEURES ═══
Chaque période de travail ne peut être inférieure à 3 heures consécutives.
• Pas de prestation de 1h ou 2h isolée
• Minimum 3h par bloc de travail

═══ FRACTIONS COURANTES ═══
• 4/5e (80%) : 30,4h/sem → le plus courant, souvent via crédit-temps
• 3/4 (75%) : 28,5h/sem → fréquent dans le commerce et l'enseignement
• Mi-temps (50%) : 19h/sem → très courant, souvent combiné avec chômage
• Tiers-temps (33%) : 12,67h/sem → minimum légal

═══ TYPES D'HORAIRES ═══
1. HORAIRE FIXE : jours et heures identiques chaque semaine
   Ex : lundi-mardi-mercredi de 8h à 16h24
   → Le plus simple. L'horaire fait partie du contrat.

2. HORAIRE VARIABLE AVEC CYCLE : rotation sur X semaines
   Ex : semaine A = lu-ma-me / semaine B = me-je-ve
   → Le cycle complet doit être dans le contrat.

3. HORAIRE VARIABLE SANS CYCLE : l'employeur fixe l'horaire
   → Notification au travailleur min 5 jours ouvrables à l'avance
   → Publication dans un "avis" affiché dans l'entreprise
   → Très encadré par la loi`,
     delai:"Avant rédaction du contrat",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1-2h'},

    {n:2,phase:'préparation',titre:"Rédiger le contrat de travail à temps partiel — mentions obligatoires",
     detail:`Le contrat à temps partiel DOIT être ÉCRIT et contenir des mentions SPÉCIFIQUES.

═══ FORME ═══
• ÉCRIT OBLIGATOIRE pour chaque travailleur à temps partiel
• Signé au plus tard le jour de l'entrée en service
• Si pas d'écrit → le travailleur peut choisir l'horaire le plus favorable

═══ MENTIONS OBLIGATOIRES (art. 11bis Loi 03/07/1978) ═══
1. Le régime de travail à temps partiel convenu
2. L'horaire de travail convenu OU la référence au cycle d'horaires
3. Si horaire variable : les modalités et délai de notification (min 5 jours)

En plus des mentions classiques :
4. Identité des parties
5. Date de début (et fin si CDD)
6. Lieu de travail
7. Fonction
8. Rémunération (proportionnelle au temps plein)

═══ RÉMUNÉRATION PROPORTIONNELLE ═══
Le salaire est calculé au prorata de la fraction :
• Barème temps plein : 3.000€ brut
• Mi-temps : 3.000€ × 50% = 1.500€ brut
• 4/5e : 3.000€ × 80% = 2.400€ brut

═══ SANCTION SI PAS D'ÉCRIT ═══
Le travailleur peut :
• Choisir le régime et l'horaire les plus favorables parmi ceux appliqués dans l'entreprise
• Demander la requalification en temps plein (présomption réfragable)`,
     delai:"Signé au plus tard le 1er jour de travail",formulaire:"Contrat de travail à temps partiel",ou:"Modèle Aureus Social Pro → Contrats",obligatoire:true,duree_estimee:'1h'},

    {n:3,phase:'engagement',titre:"Publicité des horaires — Affichage obligatoire",
     detail:`L'employeur a des obligations STRICTES de publicité des horaires à temps partiel.

═══ HORAIRE FIXE ═══
• L'horaire figure dans le contrat ET dans le règlement de travail
• Un exemplaire du contrat est conservé sur le lieu de travail
• L'horaire est affiché dans un endroit apparent et accessible

═══ HORAIRE VARIABLE AVEC CYCLE ═══
• Le cycle complet est repris dans le contrat ET le règlement de travail
• Affichage du cycle dans l'entreprise
• Le travailleur sait à l'avance quand il travaille

═══ HORAIRE VARIABLE SANS CYCLE (le plus encadré) ═══
• L'employeur doit notifier l'horaire au moins 5 JOURS OUVRABLES à l'avance
• Publication dans un AVIS daté et signé par l'employeur
• L'avis est affiché dans l'entreprise OU communiqué individuellement
• L'avis indique : nom du travailleur, jours et heures de travail
• Les avis sont conservés pendant 1 AN sur le lieu de travail

═══ DOCUMENT DE DÉROGATION ═══
En cas de prestations en dehors de l'horaire publié :
• Le travailleur doit signer un document de dérogation
• Ou un système de pointage enregistre les heures réelles
• Les heures complémentaires doivent être traçables

═══ SANCTIONS ═══
Non-respect de la publicité :
• Présomption de travail à temps plein (amende 200-2.000€ × nombre de travailleurs)
• L'ONSS peut réclamer les cotisations sur base temps plein
• L'inspection sociale peut verbaliser`,
     delai:"Dès le 1er jour de travail — en continu",formulaire:"Avis de notification horaire (si horaire variable)",ou:"Affichage dans l'entreprise",obligatoire:true,duree_estimee:'15 min/modification'},

    {n:4,phase:'engagement',titre:"DIMONA + DmfA — Déclaration temps partiel",
     detail:`═══ DIMONA ═══
• DIMONA standard (pas de type spécifique)
• L'indication temps plein/temps partiel est dans la DmfA, pas la DIMONA

═══ DMFA — DÉCLARATION TRIMESTRIELLE ═══
Dans la DmfA, le temps partiel est déclaré via :
• Facteur Q : nombre d'heures/semaine du travailleur (ex: 19h pour mi-temps)
• Facteur S : nombre d'heures/semaine de référence temps plein (ex: 38h)
• Rapport Q/S = fraction (ex: 19/38 = 50%)

Le facteur Q est CRUCIAL pour :
• Le calcul des cotisations ONSS
• Les droits à la pension
• Les droits au chômage
• Les droits à l'assurance maladie

═══ HEURES COMPLÉMENTAIRES ═══
Les heures au-delà de l'horaire contractuel mais en-deçà du temps plein :
• Doivent être déclarées dans la DmfA
• Donnent droit à un sursalaire si >12h/mois (selon la CCT)
• Peuvent déclencher un droit à augmentation de la fraction (art. 153 Loi 03/07/1978)

═══ DROIT DE PRIORITÉ ═══
Le travailleur à temps partiel a un DROIT DE PRIORITÉ pour un emploi à temps plein ou à fraction plus élevée qui deviendrait vacant dans l'entreprise (CCT n° 35).
• L'employeur doit informer le travailleur des postes vacants
• Le travailleur peut postuler en priorité`,
     delai:"DIMONA avant le 1er jour — DmfA trimestrielle",formulaire:"DIMONA + DmfA (facteurs Q et S)",ou:"www.socialsecurity.be",obligatoire:true,duree_estimee:'15 min'},

    {n:5,phase:'gestion',titre:"Calcul de paie — Proportionnalité et particularités",
     detail:`═══ SALAIRE PROPORTIONNEL ═══
Le salaire est proportionnel à la fraction de temps partiel :

Exemple — Barème CP : 3.200€ brut temps plein

┌──────────────┬──────────┬──────────┬───────────┐
│ Fraction     │ Brut     │ ONSS 13% │ Net ±     │
├──────────────┼──────────┼──────────┼───────────┤
│ 4/5e (80%)   │ 2.560€   │ 334,59€  │ ±1.850€   │
│ 3/4 (75%)    │ 2.400€   │ 313,68€  │ ±1.735€   │
│ Mi-temps 50% │ 1.600€   │ 209,12€  │ ±1.250€   │
│ 1/3 temps    │ 1.066€   │ 139,33€  │ ±870€     │
└──────────────┴──────────┴──────────┴───────────┘

═══ PARTICULARITÉS ═══
1. PÉCULE DE VACANCES : proportionnel (simple + double)
2. 13E MOIS : proportionnel (si CCT le prévoit)
3. CHÈQUES-REPAS : par jour effectivement presté (pas proportionnel !)
4. JOURS FÉRIÉS : payés si tombent un jour habituellement presté
5. PETIT CHÔMAGE : uniquement les jours habituellement prestés
6. MALADIE salaire garanti : proportionnel à l'horaire

═══ PRÉCOMPTE PROFESSIONNEL ═══
Le PP est calculé sur le salaire réel (temps partiel).
⚠️ ATTENTION : le taux de PP est souvent plus élevé en % que le temps plein car le barème est progressif. Le travailleur peut demander un ajustement via le formulaire de réduction PP.

═══ BONUS EMPLOI (TRAVAILLEUR BAS SALAIRE) ═══
Le bonus emploi s'applique aussi aux temps partiels avec bas salaire.
Le calcul est proportionnel à la fraction.`,
     delai:"Chaque mois",formulaire:"Fiche de paie mensuelle",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'gestion',titre:"Droits sociaux du travailleur à temps partiel",
     detail:`Les droits sociaux sont PROPORTIONNELS mais certains ont des règles spécifiques.

═══ CHÔMAGE ═══
Le travailleur à temps partiel INVOLONTAIRE peut demander une Allocation de Garantie de Revenus (AGR) :
• Condition : le temps partiel n'est pas un choix libre
• Il doit être inscrit comme DE à temps plein auprès du service régional (Actiris/Forem/VDAB)
• L'AGR complète le salaire pour atteindre un revenu minimum
• Formulaire C131A (employeur) + inscription DE

Le travailleur à temps partiel VOLONTAIRE :
• Pas de droit à l'AGR
• Droits au chômage complet calculés sur les heures prestées (demi-allocations)

═══ PENSION ═══
• Calculée sur les rémunérations réelles (proportionnelles)
• Une année à mi-temps = une demi-année pour la pension
• Impact significatif sur le montant de la pension si durée longue
• Possibilité de racheter des périodes (Sigedis — onéreux)

═══ MALADIE / INVALIDITÉ ═══
• Salaire garanti : proportionnel à l'horaire habituel
• Indemnités mutuelle : proportionnelles
• Le travailleur à temps partiel avec AGR : combinaison maladie + AGR possible

═══ VACANCES ═══
• Jours de vacances : proportionnels aux jours prestés l'année précédente
• Pécule : proportionnel au salaire de l'année de référence
• Mi-temps toute l'année → 10 jours de vacances (au lieu de 20)

═══ FORMATION ═══
Droit à la formation proportionnel (jours de formation/an selon la fraction).`,
     delai:"Information au travailleur lors de l'engagement",formulaire:"C131A (si temps partiel involontaire → AGR)",ou:"ONEM / Actiris / Forem / VDAB",obligatoire:true,duree_estimee:'Information initiale'},

    {n:7,phase:'gestion',titre:"Modification de fraction — Augmentation ou diminution",
     detail:`═══ AUGMENTATION DE LA FRACTION ═══
Demande du travailleur ou décision de l'employeur :
• Avenant au contrat de travail
• Modification du facteur Q dans la DmfA
• Ajustement du salaire proportionnel
• Mise à jour du règlement de travail si nécessaire

DROIT DE PRIORITÉ (CCT n° 35) :
Le travailleur à temps partiel a PRIORITÉ pour un poste à fraction supérieure ou temps plein.
→ L'employeur DOIT l'informer des postes vacants correspondant à ses qualifications

═══ DIMINUTION DE LA FRACTION ═══
Demande du travailleur :
• Accord de l'employeur nécessaire (sauf crédit-temps = droit)
• Avenant au contrat
• Impact sur les droits sociaux (pension, chômage)

Décision de l'employeur :
• ⚠️ C'est une MODIFICATION UNILATÉRALE d'un élément essentiel du contrat
• Équivaut à un licenciement implicite (rupture pour acte équipollent)
• Le travailleur peut invoquer la rupture et réclamer une indemnité de préavis
• JAMAIS imposer une diminution sans accord écrit du travailleur

═══ PASSAGE TEMPS PLEIN → TEMPS PARTIEL ═══
• Toujours par ACCORD MUTUEL (avenant écrit)
• Expliquer l'impact sur les droits sociaux
• Le travailleur peut demander à revenir au temps plein (droit de priorité)`,
     delai:"Avenant avant la date effective du changement",formulaire:"Avenant au contrat de travail",ou:null,obligatoire:true,duree_estimee:'1h'},

    {n:8,phase:'gestion',titre:"Contrôle inspection sociale — Points de vigilance",
     detail:`L'inspection sociale vérifie particulièrement le respect des règles temps partiel.

═══ POINTS DE CONTRÔLE ═══
1. Contrat écrit avec mentions obligatoires (horaire, fraction)
2. Publicité des horaires (affichage, avis)
3. Registre des dérogations ou système de pointage
4. Conformité DmfA (facteurs Q/S corrects)
5. Respect du seuil minimum 1/3 temps
6. Respect du minimum 3h par prestation
7. Heures complémentaires correctement déclarées et payées

═══ SANCTIONS EN CAS D'INFRACTION ═══
• Présomption de travail à temps plein (charge de la preuve sur l'employeur)
• ONSS peut réclamer cotisations sur base temps plein rétroactivement (3 ans)
• Amende administrative : 200€ à 2.000€ × nombre de travailleurs concernés
• Amende pénale possible si récidive
• Régularisation des droits sociaux du travailleur (vacances, pension)

═══ COMMENT SE PROTÉGER ═══
✅ Contrat écrit détaillé avec horaire précis
✅ Affichage permanent des horaires
✅ Système de pointage fiable (Aureus Social Pro)
✅ Conservation des avis de modification d'horaire (1 an minimum)
✅ Conservation des contrats (5 ans après la fin)
✅ DmfA correcte (vérifier Q/S chaque trimestre)`,
     delai:"En continu — conservation 5 ans",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Vigilance permanente'},
  ],
  alertes:[
    {niveau:'critique',texte:"Contrat ÉCRIT obligatoire avec horaire précis. Sans écrit → présomption de temps plein + le travailleur choisit l'horaire le plus favorable."},
    {niveau:'critique',texte:"Minimum 1/3 temps (12h40/sem sur base 38h) et minimum 3h par prestation. En-dessous = infraction."},
    {niveau:'important',texte:"Publicité obligatoire des horaires variables : notification 5 jours ouvrables à l'avance + avis affiché. Défaut = présomption temps plein."},
    {niveau:'important',texte:"JAMAIS imposer une réduction de fraction sans accord écrit. C'est une modification essentielle = licenciement implicite."},
    {niveau:'attention',texte:"Droit de priorité (CCT 35) : le temps partiel a PRIORITÉ pour un poste à fraction supérieure. L'employeur DOIT informer des postes vacants."},
    {niveau:'attention',texte:"Les chèques-repas sont par jour presté (pas proportionnels). Un mi-temps 5 demi-journées → 5 chèques-repas. Un mi-temps 2,5 jours → 2 ou 3 chèques-repas."},
    {niveau:'info',texte:"Le travailleur à temps partiel involontaire peut demander l'AGR (Allocation de Garantie de Revenus) auprès de l'ONEM pour compléter son salaire."},
  ],
  simulation:{titre:"Coût employeur — Temps plein vs fractions (barème 3.200€ brut TP)",lignes:[
    {label:'Temps plein (100%)',montant:'±4.300€/mois',type:'neutre'},
    {label:'4/5e (80%)',montant:'±3.440€/mois',type:'neutre'},
    {label:'3/4 (75%)',montant:'±3.225€/mois',type:'neutre'},
    {label:'Mi-temps (50%)',montant:'±2.150€/mois',type:'neutre'},
    {label:'Tiers-temps (33%)',montant:'±1.430€/mois',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Économie mi-temps vs TP',montant:'2.150€/mois (-50%)',type:'vert_bold'},
    {label:'Économie 4/5e vs TP',montant:'860€/mois (-20%)',type:'vert'},
  ]},
  faq:[
    {q:"Le mi-temps a-t-il droit aux chèques-repas ?",r:"Oui ! Les chèques-repas sont attribués par JOUR effectivement presté, pas proportionnellement. Un mi-temps qui travaille 5 demi-journées reçoit 5 chèques-repas."},
    {q:"Puis-je imposer un passage au temps partiel ?",r:"NON. C'est une modification d'un élément essentiel du contrat. Le travailleur peut invoquer la rupture et réclamer une indemnité de préavis."},
    {q:"Le temps partiel impacte-t-il la pension ?",r:"Oui. La pension est calculée sur les rémunérations réelles. Un mi-temps pendant 10 ans = pension réduite pour ces 10 années. Impact significatif sur le montant final."},
    {q:"Horaire variable : quel délai de notification ?",r:"Minimum 5 jours ouvrables à l'avance. Le délai peut être allongé par CCT sectorielle. L'avis doit être daté, signé et affiché ou communiqué individuellement."},
    {q:"Le travailleur peut-il refuser des heures complémentaires ?",r:"Oui, si les heures complémentaires dépassent l'horaire contractuel et n'ont pas été prévues. Sauf si la CCT sectorielle prévoit une obligation limitée."},
    {q:"Comment calculer les jours de vacances d'un mi-temps ?",r:"Proportionnellement. 20 jours TP × 50% = 10 jours de vacances. Mais si le mi-temps travaille 5 demi-journées : 20 demi-journées de vacances."},
  ],
  formulaires:[
    {nom:"SPF Emploi — Travail à temps partiel",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/travail-temps-partiel",type:'en_ligne'},
    {nom:"ONEM — AGR temps partiel involontaire",url:"https://www.onem.be/fr/documentation/feuille-info/t28",type:'en_ligne'},
    {nom:"CCT n° 35 — Temps partiel (CNT)",url:"https://www.cnt-nar.be",type:'en_ligne'},
  ],
};

export default function ProcedureTempsPartiel(){const P=PROC_TEMPS_PARTIEL;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>📊 Fractions de temps partiel</h2>{P.fractions.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{f.type} — {f.fraction}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>Heures : {f.heures}<br/>Exemple : {f.exemple}<br/>ONSS : {f.onss}<br/>Droits : {f.droits}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_TEMPS_PARTIEL};
