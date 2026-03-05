'use client';
import { useState, useMemo } from 'react';

const PROC_LICENCIEMENT_PREAVIS = {
  id:'licenciement_preavis', icon:'📨', categorie:'fin',
  titre:"Licenciement avec préavis",
  resume:"Rupture du contrat CDI par l'employeur moyennant un préavis ou une indemnité compensatoire. Délais de préavis unifiés depuis 2014 (statut unique). Obligation de motivation (CCT 109). Outplacement obligatoire si ≥30 semaines de préavis.",
  baseLegale:[
    {ref:"Loi 03/07/1978, art. 37-39",desc:"Délais de préavis — règles générales de rupture du contrat de travail"},
    {ref:"Loi 26/12/2013 (statut unique)",desc:"Harmonisation des délais de préavis ouvriers/employés — entrée en vigueur 01/01/2014"},
    {ref:"CCT n° 109 (12/02/2014)",desc:"Motivation du licenciement — droit du travailleur à connaître les motifs"},
    {ref:"Loi 05/09/2001",desc:"Outplacement obligatoire — accompagnement de reclassement professionnel"},
    {ref:"CCT n° 51 (10/02/1992)",desc:"Droit au congé de sollicitation pendant le préavis (1/2 jour ou 1 jour/semaine)"},
    {ref:"AR 09/03/2006",desc:"Indemnité compensatoire de préavis — calcul et modalités de paiement"},
    {ref:"Loi 19/03/1991",desc:"Protection contre le licenciement des délégués du personnel"},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier l'absence de protection contre le licenciement",
     detail:`AVANT de licencier, vérifier que le travailleur ne bénéficie PAS d'une protection spéciale.

═══ PROTECTIONS ABSOLUES (licenciement INTERDIT sauf motif grave) ═══
• Grossesse + 1 mois après retour (sanction : 6 mois d'indemnité)
• Congé de maternité (toute la durée + 1 mois)
• Congé parental (demande → 2 mois après la fin — 6 mois d'indemnité)
• Crédit-temps (3 mois avant → 3 mois après — 6 mois d'indemnité)
• Congé d'adoption (idem congé parental)
• Congé pour soins palliatifs
• Congé pour assistance médicale

═══ PROTECTIONS DES REPRÉSENTANTS DU PERSONNEL ═══
• Délégués syndicaux (loi 19/03/1991) — licenciement quasi impossible
• Membres du CE et du CPPT — protection renforcée
• Candidats aux élections sociales (même non élus — 2 ans)

═══ PROTECTIONS LIÉES À L'ÉTAT DE SANTÉ ═══
• Maladie : pas de protection MAIS licenciement discriminatoire interdit
• Mi-temps thérapeutique : protection contre discrimination
• Travailleur handicapé : aménagement raisonnable obligatoire

═══ CHECK-LIST ═══
☐ Pas de grossesse connue ?
☐ Pas de congé thématique en cours ?
☐ Pas de crédit-temps en cours ou demandé ?
☐ Pas de représentant du personnel ?
☐ Pas de candidat aux élections sociales ?
☐ Pas de plainte pour harcèlement en cours ?
☐ Pas de maladie professionnelle en cours de reconnaissance ?`,
     delai:"AVANT toute démarche de licenciement",formulaire:null,ou:"Vérification interne (RH + juridique)",obligatoire:true,duree_estimee:'1-2h'},

    {n:2,phase:'préparation',titre:"Calculer le délai de préavis — Statut unique 2014",
     detail:`Depuis le 01/01/2014, les délais de préavis sont UNIFIÉS (ouvriers = employés).

═══ TABLEAU DES PRÉAVIS (licenciement par l'employeur) ═══

Ancienneté → Préavis (en semaines)
0-3 mois → 1 semaine
3-6 mois → 3 semaines
6-9 mois → 4 semaines
9-12 mois → 5 semaines
12-15 mois → 6 semaines
15-18 mois → 7 semaines
18-21 mois → 8 semaines
21-24 mois → 9 semaines
2 ans → 10 semaines (on ne peut pas tout lister, mais…)
3 ans → 12 semaines
4 ans → 13 semaines
5 ans → 15 semaines
6 ans → 18 semaines
7 ans → 21 semaines
8 ans → 24 semaines
9 ans → 27 semaines
10 ans → 30 semaines
15 ans → 39 semaines
20 ans → 62 semaines
25 ans → 74 semaines

Au-delà de 20 ans : +3 semaines par année d'ancienneté commencée.

═══ ANCIENNETÉ AVANT 2014 (partie historique) ═══
Pour les travailleurs en service AVANT le 01/01/2014 :
• Partie 1 : ancienneté au 31/12/2013 → calculée selon l'ANCIEN régime
• Partie 2 : ancienneté à partir du 01/01/2014 → nouveau régime
• Le préavis TOTAL = Partie 1 + Partie 2 (système du "double calcul")

═══ ANCIENNETÉ ═══
L'ancienneté se calcule en service ININTERROMPU :
• Date d'entrée en service → date de notification du préavis
• Comprend : maladie, vacances, crédit-temps, congé parental
• Ne comprend PAS : période avant un CDD non prolongé
• Si reprise après licenciement : pas de cumul d'ancienneté

═══ INDEMNITÉ COMPENSATOIRE ═══
L'employeur peut opter pour une indemnité compensatoire AU LIEU du préavis :
• Montant = rémunération courante × nombre de semaines de préavis
• La rémunération inclut : brut + avantages en nature + chèques-repas + voiture + etc.
• L'indemnité est soumise à l'ONSS et au PP
• Effet immédiat : le contrat prend fin le jour de la notification`,
     delai:"Calcul avant notification",formulaire:"Calcul de préavis (Aureus Social Pro → module licenciement)",ou:null,obligatoire:true,duree_estimee:'1h'},

    {n:3,phase:'exécution',titre:"Notification du licenciement — Lettre recommandée",
     detail:`La notification doit respecter des règles de FORME strictes.

═══ MODES DE NOTIFICATION ═══
1. LETTRE RECOMMANDÉE (le plus courant)
   • Prend effet le 3e jour ouvrable suivant l'envoi
   • Exemple : envoi lundi → effet jeudi
   • Le préavis commence le LUNDI suivant la prise d'effet

2. EXPLOIT D'HUISSIER
   • Prend effet le jour même de la signification
   • Plus cher mais plus sûr (preuve irréfutable)
   • Le préavis commence le lundi suivant

3. REMISE EN MAIN PROPRE (avec accusé de réception)
   • Prend effet le jour même si signé par le travailleur
   • Risque : le travailleur peut refuser de signer

═══ CONTENU DE LA LETTRE ═══
Mentions OBLIGATOIRES :
1. Date d'envoi / de remise
2. Date de début du préavis
3. Durée du préavis (en semaines)
4. Date de fin du préavis
5. Signature de l'employeur (ou représentant mandaté)

Mentions RECOMMANDÉES :
6. Rappel du droit au congé de sollicitation
7. Information sur l'outplacement (si ≥30 semaines)
8. Référence au motif (si demandé ultérieurement — CCT 109)

═══ ERREURS FATALES ═══
❌ Préavis trop court → le travailleur peut réclamer la différence en indemnité
❌ Pas de date de début → notification nulle
❌ Préavis ne commençant pas un lundi → nul
❌ Lettre non signée → contestable`,
     delai:"Le jour de la décision — envoi recommandé",formulaire:"Lettre de licenciement avec préavis (modèle Aureus Social Pro)",ou:"Envoi par recommandé / huissier / remise en main propre",obligatoire:true,duree_estimee:'1h'},

    {n:4,phase:'exécution',titre:"Motivation du licenciement — CCT n° 109",
     detail:`Depuis 2014, le travailleur a le DROIT de connaître les motifs de son licenciement.

═══ PROCÉDURE CCT 109 ═══
1. Le travailleur envoie une demande de motivation PAR RECOMMANDÉ
   • Délai : dans les 2 mois suivant la fin du contrat
   • Ou dans les 6 mois suivant la notification du préavis (le premier atteint)

2. L'employeur DOIT répondre PAR RECOMMANDÉ dans les 2 mois
   • Exposer les motifs concrets du licenciement
   • Motifs liés au comportement, à l'aptitude, ou aux nécessités de l'entreprise

═══ LICENCIEMENT MANIFESTEMENT DÉRAISONNABLE ═══
Si le travailleur conteste, le tribunal peut juger le licenciement "manifestement déraisonnable" :
• Un employeur normal et raisonnable n'aurait PAS licencié pour ces motifs
• Indemnité : 3 à 17 semaines de rémunération (en plus du préavis)

═══ MOTIFS VALABLES ═══
✅ Comportement : retards répétés, insubordination, conflits
✅ Aptitude : performances insuffisantes, incompétence avérée
✅ Nécessités de l'entreprise : restructuration, suppression de poste, difficultés économiques
✅ Combinaison de motifs

═══ MOTIFS INVALIDES ═══
❌ Discrimination (origine, sexe, âge, handicap, religion, etc.)
❌ Représailles (plainte, action syndicale, témoignage)
❌ Grossesse, maladie, exercice d'un droit légal

═══ CONSEIL ═══
Documenter les motifs AVANT le licenciement : évaluations, avertissements écrits, objectifs non atteints. Constituer un dossier solide.`,
     delai:"Réponse dans les 2 mois suivant la demande du travailleur",formulaire:"Lettre de motivation du licenciement (réponse CCT 109)",ou:"Par lettre recommandée au travailleur",obligatoire:true,duree_estimee:'1-2h'},

    {n:5,phase:'exécution',titre:"Période de préavis — Droits et obligations",
     detail:`Pendant le préavis, le contrat continue normalement avec quelques particularités.

═══ CONGÉ DE SOLLICITATION (CCT 51) ═══
Le travailleur a le droit de s'absenter pour chercher un nouvel emploi :
• Les 26 dernières semaines du préavis : 1 jour/semaine ou 2 demi-jours
• Avant les 26 dernières semaines : 1/2 jour/semaine
• Avec maintien du salaire
• Exception : si outplacement → 1 jour/semaine pendant TOUT le préavis

═══ CONTRE-PRÉAVIS DU TRAVAILLEUR ═══
Le travailleur peut donner un contre-préavis pour quitter plus tôt :
• Ancienneté < 1 an → 1 semaine
• 1-5 ans → 2 semaines
• 5-10 ans → 3 semaines
• >10 ans → 4 semaines
• Le contre-préavis est plus court que le préavis initial

═══ OBLIGATIONS PENDANT LE PRÉAVIS ═══
Employeur :
• Verser le salaire normal
• Fournir du travail (pas de mise au placard)
• Respecter les droits du travailleur

Travailleur :
• Continuer à travailler normalement
• Respecter ses obligations contractuelles
• Pas de concurrence déloyale

═══ SUSPENSION DU PRÉAVIS ═══
Le préavis est SUSPENDU (la durée ne court pas) pendant :
• Maladie / accident
• Vacances annuelles
• Petit chômage
• Congé de maternité
• Jours fériés
⚠️ ATTENTION : la durée du préavis s'allonge d'autant !`,
     delai:"Pendant toute la durée du préavis",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Durée du préavis'},

    {n:6,phase:'exécution',titre:"Outplacement — Obligatoire si ≥30 semaines de préavis",
     detail:`L'outplacement est un accompagnement de reclassement professionnel.

═══ QUAND EST-IL OBLIGATOIRE ? ═══
• Préavis ou indemnité ≥ 30 semaines ET travailleur ≥ 45 ans : TOUJOURS obligatoire
• Préavis ou indemnité ≥ 30 semaines (quel que soit l'âge) : obligatoire depuis 2014
• Préavis < 30 semaines mais travailleur ≥ 45 ans avec 1 an d'ancienneté : obligatoire aussi

═══ PROCÉDURE ═══
1. L'employeur propose l'outplacement PAR ÉCRIT dans les 15 jours suivant la fin du contrat
2. Le travailleur a 4 semaines pour accepter ou refuser
3. Si acceptation → l'employeur finance un programme d'outplacement de 60 heures sur 12 mois
4. Si refus → le travailleur perd certains avantages (pas d'indemnité de reclassement)

═══ COÛT ═══
• L'outplacement est à charge de l'EMPLOYEUR
• Coût typique : 1.800€ à 5.000€ HT par travailleur
• Via un bureau d'outplacement agréé (Right Management, Lee Hecht Harrison, Randstad RiseSmart, etc.)

═══ DÉDUCTION SUR LE PRÉAVIS ═══
Si l'employeur paie une indemnité compensatoire :
• Il peut déduire 4 semaines d'indemnité pour financer l'outplacement
• Le travailleur reçoit l'indemnité - 4 semaines + l'outplacement

═══ SANCTIONS ═══
Si l'employeur ne propose pas l'outplacement obligatoire :
• Cotisation spéciale de 1.800€ à l'ONEM (fonds de reclassement)
• Le travailleur peut demander l'outplacement via le fonds sectoriel`,
     delai:"Proposition dans les 15 jours suivant la fin du contrat",formulaire:"Proposition d'outplacement (lettre recommandée)",ou:"Bureau d'outplacement agréé",obligatoire:true,duree_estimee:'12 mois (programme)'},

    {n:7,phase:'fin',titre:"Documents de fin de contrat — C4, solde, attestations",
     detail:`À la fin du préavis (ou du contrat si indemnité compensatoire), remettre tous les documents.

═══ DOCUMENTS OBLIGATOIRES ═══

1. FORMULAIRE C4 (attestation de chômage)
   • Rempli par l'employeur
   • Motif de fin de contrat : licenciement avec préavis / indemnité
   • Dates d'emploi
   • Rémunération
   • Remis le DERNIER JOUR de travail

2. FICHE DE PAIE FINALE
   • Solde de tout compte
   • Préavis presté ou indemnité compensatoire
   • Pécule de vacances de sortie (employés) ou attestation vacances (ouvriers)
   • Prorata 13e mois (si applicable)
   • Récupération avantages en nature (voiture, gsm, laptop)

3. ATTESTATION DE VACANCES
   • Nombre de jours de vacances pris et restants
   • Pécule de vacances versé ou à verser
   • Pour les employés : pécule de sortie = pécule simple + double non encore pris

4. FORMULAIRE 281.10 (fiche fiscale)
   • Revenus de l'année en cours
   • Précompte professionnel retenu
   • Avantages en nature

5. ATTESTATION D'OCCUPATION
   • Dates d'emploi
   • Fonction exercée
   • Temps de travail (temps plein / temps partiel)

═══ DIMONA OUT ═══
Déclarer la sortie via DIMONA le dernier jour de travail.

═══ RÉCUPÉRATION DU MATÉRIEL ═══
• Voiture de société : restitution le dernier jour
• GSM, laptop, badge, clés : récupérer
• Accès informatiques : désactiver le jour de départ`,
     delai:"Le dernier jour de travail effectif",formulaire:"C4 + fiche paie finale + attestation vacances + 281.10 + attestation d'occupation",ou:"Remise au travailleur le dernier jour",obligatoire:true,duree_estimee:'2-3h'},

    {n:8,phase:'fin',titre:"Solde de tout compte — Calcul détaillé",
     detail:`Le solde de tout compte comprend TOUS les montants dus au travailleur.

═══ COMPOSANTES ═══

1. SALAIRE DU MOIS EN COURS (prorata)
   Si fin de contrat le 15 du mois → 15 jours de salaire

2. INDEMNITÉ COMPENSATOIRE DE PRÉAVIS (si pas presté)
   Rémunération courante × semaines de préavis
   Inclut : brut + avantages (voiture, chèques-repas, etc.)
   Soumise à l'ONSS et au PP

3. PÉCULE DE VACANCES DE SORTIE (employés)
   = 15,34% de la rémunération brute de la période de référence
   Déjà payé en partie → calculer le solde

4. PRORATA 13E MOIS
   = mois prestés dans l'année / 12 × montant 13e mois
   Selon la CCT applicable

5. PRORATA PRIME DE FIN D'ANNÉE (si applicable)

6. INDEMNITÉ D'ÉVICTION (clause de non-concurrence)
   Si clause de non-concurrence activée :
   Minimum 50% du salaire brut × durée de la clause

7. DÉDUCTIONS
   - Récupération matériel non restitué
   - Trop-perçu de salaire ou d'avances
   - Chèques-repas pour les jours non prestés

═══ EXEMPLE ═══
Employé licencié après 8 ans, 3.200€ brut, indemnité compensatoire :

Préavis : 24 semaines → 24 × 3.200/4,33 = ±17.737€ brut
ONSS patronal (25%) : 4.434€
ONSS travailleur (13,07%) : 2.318€
PP : ±3.500€
NET indemnité : ±11.919€

+ Pécule vacances sortie : ±2.946€ brut
+ Prorata 13e mois (6/12) : ±1.600€ brut
= Coût total employeur : ±26.717€`,
     delai:"Versement dans les 15 jours suivant la fin du contrat",formulaire:"Solde de tout compte (décompte détaillé)",ou:null,obligatoire:true,duree_estimee:'2-3h de calcul'},
  ],
  alertes:[
    {niveau:'critique',texte:"Vérifier les PROTECTIONS avant de licencier. Grossesse, congé parental, crédit-temps, délégué syndical = indemnité de 6 mois supplémentaires si licenciement abusif."},
    {niveau:'critique',texte:"Le préavis commence TOUJOURS un LUNDI. La lettre recommandée prend effet le 3e jour ouvrable après envoi. Erreur de calcul = préavis nul."},
    {niveau:'important',texte:"CCT 109 : le travailleur peut demander les motifs dans les 2 mois. L'employeur DOIT répondre dans les 2 mois. Défaut = présomption de licenciement déraisonnable."},
    {niveau:'important',texte:"Outplacement obligatoire si préavis ≥30 semaines OU travailleur ≥45 ans. Non-proposition = cotisation de 1.800€ à l'ONEM."},
    {niveau:'attention',texte:"Le préavis est SUSPENDU pendant la maladie, les vacances, les jours fériés. La durée s'allonge d'autant. Anticiper !"},
    {niveau:'attention',texte:"Indemnité compensatoire : calculée sur la rémunération COURANTE = brut + TOUS les avantages. Ne pas oublier la voiture, le GSM, les chèques-repas."},
    {niveau:'info',texte:"Le travailleur peut donner un contre-préavis plus court pour partir plus tôt. C'est son droit — ne pas s'y opposer."},
  ],
  simulation:{titre:"Coût licenciement — Employé 3.200€ brut, 8 ans d'ancienneté",lignes:[
    {label:'Préavis : 24 semaines',montant:'',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'OPTION 1 — PRÉAVIS PRESTÉ :',montant:'',type:'neutre'},
    {label:'  Salaire normal pendant 24 semaines',montant:'±17.737€ brut',type:'neutre'},
    {label:'  + Congé sollicitation (24 jours)',montant:'Inclus',type:'neutre'},
    {label:'  Coût employeur total',montant:'±23.850€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'OPTION 2 — INDEMNITÉ COMPENSATOIRE :',montant:'',type:'neutre'},
    {label:'  Indemnité brute (24 sem)',montant:'±17.737€',type:'neutre'},
    {label:'  + ONSS patronal',montant:'±4.434€',type:'neutre'},
    {label:'  + Pécule vacances sortie',montant:'±2.946€',type:'neutre'},
    {label:'  + Prorata 13e mois',montant:'±1.600€',type:'neutre'},
    {label:'  + Outplacement',montant:'±3.000€',type:'neutre'},
    {label:'  COÛT TOTAL employeur',montant:'±29.717€',type:'vert_bold'},
  ]},
  faq:[
    {q:"Puis-je licencier pendant une maladie ?",r:"Oui, la maladie ne protège pas contre le licenciement. MAIS : le préavis est suspendu (la durée ne court pas). Et le motif ne peut PAS être la maladie elle-même (discrimination)."},
    {q:"Le travailleur refuse de signer l'accusé de réception — que faire ?",r:"Utiliser la lettre recommandée (preuve d'envoi suffit) ou un exploit d'huissier. La remise en main propre sans signature est risquée."},
    {q:"Je veux que le travailleur parte immédiatement — comment ?",r:"Payer une indemnité compensatoire de préavis. Le contrat prend fin immédiatement. L'indemnité = rémunération courante × semaines de préavis."},
    {q:"Le travailleur tombe malade pendant le préavis — que se passe-t-il ?",r:"Le préavis est SUSPENDU pendant la maladie. Il reprend à la reprise du travail. La durée totale du préavis s'allonge d'autant."},
    {q:"L'ancienneté avant 2014 se calcule comment ?",r:"Système du double calcul : Partie 1 (ancienneté au 31/12/2013) selon l'ancien régime + Partie 2 (à partir du 01/01/2014) selon le nouveau. Total = P1 + P2."},
    {q:"Le licenciement déraisonnable (CCT 109) — quel risque financier ?",r:"Indemnité de 3 à 17 semaines de rémunération, en PLUS du préavis. Le tribunal évalue au cas par cas. Toujours documenter les motifs."},
  ],
  formulaires:[
    {nom:"SPF Emploi — Préavis",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/preavis",type:'en_ligne'},
    {nom:"ONEM — Formulaire C4",url:"https://www.onem.be/fr/formulaires",type:'en_ligne'},
    {nom:"CNT — CCT 109 motivation",url:"https://www.cnt-nar.be",type:'en_ligne'},
  ],
};

export default function ProcedureLicenciementPreavis(){const P=PROC_LICENCIEMENT_PREAVIS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'exécution',l:'Exécution',i:'⚡'},{id:'fin',l:'Fin & docs',i:'📄'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_LICENCIEMENT_PREAVIS};
