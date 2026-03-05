'use client';
import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// PROCÉDURE 4/8 : CONTRAT ÉTUDIANT (600h/an)
// ═══════════════════════════════════════════════════════════════════════════════

const PROC_ETUDIANT = {
  id:'etudiant', icon:'🎓', categorie:'embauche',
  titre:"Contrat étudiant — Contingent 600h/an",
  resume:"Engagement d'un étudiant avec cotisations de solidarité réduites (5,42% au lieu de ±38%). L'étudiant conserve les allocations familiales et bénéficie d'un régime fiscal avantageux. Contingent de 600 heures par année civile depuis 2023.",
  baseLegale:[
    {ref:"Loi 03/07/1978, Titre VII (art. 120-130bis)",desc:"Contrat de travail d'étudiant — dispositions spécifiques du contrat de travail"},
    {ref:"AR 14/07/1995",desc:"Exclusion des étudiants de certaines dispositions de la loi sur le travail"},
    {ref:"Loi-programme 24/12/2002, art. 16-18",desc:"Cotisations de solidarité réduites pour étudiants dans le contingent"},
    {ref:"AR 05/11/2002",desc:"Application de la cotisation de solidarité aux étudiants jobistes"},
    {ref:"Loi 28/11/2022 (portant dispositions diverses)",desc:"Extension du contingent de 475h à 600h par année civile (entrée en vigueur 01/01/2023)"},
    {ref:"AR 10/11/2005",desc:"Conditions relatives au travail des étudiants — DIMONA étudiant"},
    {ref:"CIR/92, art. 143",desc:"Exonération fiscale : quotité exemptée pour étudiants jobistes"},
  ],
  eligibilite:{
    etudiants:[
      "Étudiant à titre principal dans l'enseignement secondaire, supérieur ou universitaire (Belgique ou étranger)",
      "Étudiant de 15 ans minimum (ou 16 ans si études secondaires non terminées)",
      "Pas de limite d'âge supérieure (mais attention aux allocations familiales : ≤25 ans)",
      "Étudiants en enseignement de promotion sociale (si ≥17h de cours/semaine)",
      "Étudiants en année de spécialisation ou master complémentaire",
      "Étudiants en formation en alternance : UNIQUEMENT pendant les périodes de vacances scolaires",
    ],
    exclusions:[
      "Étudiants qui travaillent depuis plus de 12 mois de façon ininterrompue chez le même employeur",
      "Étudiants en stage obligatoire rémunéré dans le cadre de leur cursus",
      "Étudiants en enseignement à horaire réduit (<17h/semaine de cours)",
      "Étudiants en formation en alternance pendant les périodes de travail en entreprise",
      "Étudiants qui suivent uniquement un enseignement du soir ou à distance (selon interprétation ONSS)",
    ],
  },
  duree:"Contingent de 600 heures par année civile (janvier-décembre). Heures décomptées via le compteur Student@Work de l'ONSS.",
  avantages:[
    {rang:"Cotisations réduites (dans le contingent 600h)",detail:"Cotisation de solidarité : 2,71% part patronale + 2,71% part étudiant = 5,42% TOTAL au lieu de ±38% (ONSS normal). Économie de ±32,5% sur le coût salarial."},
    {rang:"Pas de précompte professionnel",detail:"L'étudiant qui reste sous le plafond fiscal (±14.500€/an de revenus bruts imposables en 2026) ne paie PAS de précompte professionnel."},
    {rang:"Allocations familiales préservées",detail:"L'étudiant conserve ses allocations familiales tant qu'il ne dépasse pas 600h/an (avant : 475h)."},
    {rang:"Flexibilité totale",detail:"Vacances scolaires, week-ends, soirées — très flexible. Pas de durée minimum du contrat. Délais de préavis très courts."},
    {rang:"Pas de CSSS",detail:"Pas de Cotisation Spéciale de Sécurité Sociale dans le contingent."},
    {rang:"Hors contingent = cotisations normales",detail:"⚠️ Au-delà de 600h : cotisations ONSS normales (13,07% travailleur + ±25% patronal). Le coût triple."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier que le candidat est bien 'étudiant' au sens de la loi",
     detail:`L'ONSS utilise une définition STRICTE de l'étudiant. Vérifier AVANT l'engagement.

═══ EST ÉTUDIANT ═══
✅ Inscrit dans l'enseignement secondaire de plein exercice
✅ Inscrit dans l'enseignement supérieur (haute école, université)
✅ Inscrit en promotion sociale si ≥17h de cours/semaine
✅ Inscrit en enseignement artistique à horaire réduit + enseignement de plein exercice
✅ Âge : 15 ans minimum (ou 16 si pas encore terminé 2 premières années secondaire)

═══ N'EST PAS ÉTUDIANT (au sens ONSS) ═══
❌ Étudiant qui travaille depuis >12 mois sans interruption chez le même employeur
❌ Étudiant uniquement en cours du soir ou enseignement à distance
❌ Étudiant en stage rémunéré obligatoire
❌ Étudiant <15 ans
❌ Étudiant en formation en alternance (pendant les périodes en entreprise)

═══ DOCUMENTS À DEMANDER ═══
1. Carte d'identité (vérifier âge)
2. Attestation d'inscription dans l'établissement d'enseignement
3. Attestation Student@Work (heures restantes dans le contingent)

💡 L'attestation Student@Work est accessible sur www.studentatwork.be par l'étudiant lui-même.`,
     delai:"Avant engagement",formulaire:null,ou:"www.studentatwork.be — attestation du contingent",obligatoire:true,duree_estimee:'30 min'},

    {n:2,phase:'préparation',titre:"Vérifier le contingent Student@Work — heures restantes",
     detail:`L'étudiant dispose de 600 HEURES par année civile avec cotisations de solidarité réduites.

═══ COMPTEUR STUDENT@WORK ═══
• Site : www.studentatwork.be
• L'étudiant se connecte avec sa eID ou itsme
• Il consulte son solde d'heures restantes
• Il peut générer une ATTESTATION avec le nombre d'heures disponibles

═══ CE QUE L'EMPLOYEUR DOIT VÉRIFIER ═══
✅ Combien d'heures restantes dans le contingent ?
✅ L'attestation est-elle récente ? (max 1-2 semaines)
✅ Le nombre d'heures prévues ne dépasse-t-il pas le solde ?

═══ DÉCOMPTE ═══
• Chaque heure prestée EST décomptée automatiquement via la DIMONA étudiant
• Le compteur est mis à jour en temps réel
• Si le contingent est dépassé → cotisations ONSS normales AUTOMATIQUEMENT sur les heures excédentaires

═══ CONTINGENT ÉPUISÉ ? ═══
Si l'étudiant a déjà utilisé ses 600h :
→ Il peut toujours travailler MAIS avec cotisations ONSS normales (±38%)
→ Le coût pour l'employeur triple
→ L'étudiant perd ses allocations familiales pour le trimestre
→ Il devient soumis au précompte professionnel

💡 CONSEIL : toujours vérifier le solde AVANT de rédiger le contrat.`,
     delai:"Avant engagement — vérification indispensable",formulaire:"Attestation Student@Work (générée par l'étudiant)",ou:"www.studentatwork.be",obligatoire:true,duree_estimee:'15 min'},

    {n:3,phase:'engagement',titre:"Rédiger le contrat d'occupation d'étudiant",
     detail:`Le contrat étudiant a des règles SPÉCIFIQUES (Loi 03/07/1978, Titre VII).

═══ FORME ═══
• ÉCRIT OBLIGATOIRE — en 2 exemplaires signés
• Signé AU PLUS TARD le 1er jour de travail (si pas écrit → contrat ordinaire CDI !)

═══ MENTIONS OBLIGATOIRES SPÉCIFIQUES ═══
1. Identité des parties (nom, adresse, date de naissance, N° national)
2. Date de début et de FIN du contrat (toujours un CDD !)
3. Lieu de travail
4. Description sommaire de la fonction
5. Durée du travail journalière et hebdomadaire
6. Rémunération convenue (≥ SMMG ou barème sectoriel si plus élevé)
7. Période d'essai : 3 premiers jours ouvrables (automatique, pas besoin de clause)
8. Horaire de travail applicable
9. Commission paritaire applicable

═══ RÉMUNÉRATION MINIMUM ═══
L'étudiant a droit AU MINIMUM au SMMG selon son âge :
• 21 ans et + : 2.029,88€/mois (2026) → ±12,34€/h
• 20 ans : 100% du SMMG (le dégressif jeune est supprimé depuis 2015)
• 18-19 ans : 100% du SMMG
• Ou le barème de la CP si plus élevé

Si la CP prévoit des barèmes spécifiques étudiants → les appliquer.

═══ PÉRIODE D'ESSAI ═══
Les 3 premiers jours ouvrables = période d'essai automatique.
Pendant ces 3 jours : chaque partie peut rompre sans préavis ni indemnité.

═══ PRÉAVIS ═══
• Par l'employeur : 3 jours si ≤1 mois d'ancienneté, 7 jours si >1 mois
• Par l'étudiant : 1 jour si ≤1 mois, 3 jours si >1 mois
• Préavis calculés en jours CALENDRIER`,
     delai:"Signé au plus tard le 1er jour de travail",formulaire:"Contrat d'occupation d'étudiant (modèle spécifique)",ou:"Modèle Aureus Social Pro → Contrats Légaux / Secrétariat social",obligatoire:true,duree_estimee:'1 heure'},

    {n:4,phase:'engagement',titre:"DIMONA IN — Type 'STU' (étudiant)",
     detail:`La DIMONA étudiant a un type SPÉCIFIQUE : STU (Student).

═══ CONTENU DE LA DIMONA STU ═══
• Type de déclaration : IN
• Type de travailleur : STU (étudiant)
• NISS de l'étudiant
• Date de début
• Date de fin (obligatoire — c'est un CDD)
• Nombre d'heures planifiées dans le contrat
• Numéro ONSS employeur

═══ PARTICULARITÉS ═══
• La DIMONA STU décompte automatiquement les heures du contingent Student@Work
• Le compteur est mis à jour en temps réel
• Si le contingent est dépassé → l'ONSS bascule automatiquement en cotisations normales

═══ MODIFICATION ═══
Si les heures réelles diffèrent des heures planifiées :
→ Introduire une DIMONA UPDATE pour corriger le nombre d'heures
→ Le compteur Student@Work sera ajusté

═══ SANCTIONS ═══
Non-déclaration DIMONA STU :
• Amende 2.400€ à 24.000€
• Présomption de contrat de travail ordinaire (cotisations normales)`,
     delai:"AVANT le 1er jour de travail",formulaire:"DIMONA type STU (étudiant)",ou:"www.socialsecurity.be → DIMONA → type STU",obligatoire:true,duree_estimee:'15 min'},

    {n:5,phase:'engagement',titre:"Calcul de paie étudiant — Cotisations de solidarité",
     detail:`Le calcul de paie étudiant est SIMPLIFIÉ dans le contingent 600h.

═══ DANS LE CONTINGENT (600h) ═══

Cotisation de solidarité UNIQUEMENT :
• Part patronale : 2,71%
• Part étudiant : 2,71%
• TOTAL : 5,42%

Exemple — Étudiant à 13€/h brut, 80h dans le mois :

  Brut : 80h × 13€ = 1.040,00€
  ONSS étudiant (2,71%) : -28,18€
  Imposable : 1.011,82€
  Précompte professionnel : 0,00€ (sous le plafond fiscal)
  NET : 1.011,82€

  Coût employeur :
  Brut : 1.040,00€
  ONSS patronal (2,71%) : 28,18€
  TOTAL employeur : 1.068,18€

═══ HORS CONTINGENT (>600h) ═══

Cotisations ONSS normales :
• Part patronale : ±25% (selon CP)
• Part étudiant : 13,07%
• Précompte professionnel applicable
• CSSS applicable

Même exemple HORS contingent :
  Brut : 1.040,00€
  ONSS étudiant (13,07%) : -135,93€
  Imposable : 904,07€
  PP (±18%) : -162,73€
  NET : ±741,34€

  Coût employeur :
  Brut : 1.040,00€ + ONSS patronal ±260€ = ±1.300€

→ Le NET de l'étudiant passe de 1.011€ à 741€ (-27%)
→ Le coût employeur passe de 1.068€ à 1.300€ (+22%)`,
     delai:"À chaque paie",formulaire:"Fiche de paie étudiant",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'engagement',titre:"Règles spécifiques : horaires, travail de nuit, dimanche",
     detail:`Les étudiants sont soumis à des RÈGLES SPÉCIFIQUES en matière de temps de travail.

═══ DURÉE DU TRAVAIL ═══
• Maximum : 38h/semaine (ou durée sectorielle si inférieure)
• Maximum journalier : 9h (ou 8h pour les mineurs)
• Pas d'heures supplémentaires pour les mineurs (<18 ans)

═══ TRAVAIL DE NUIT (20h-6h) ═══
• INTERDIT pour les mineurs (sauf exceptions sectorielles : horeca, spectacle)
• Autorisé pour les étudiants majeurs (≥18 ans) aux mêmes conditions que les travailleurs ordinaires

═══ TRAVAIL DU DIMANCHE ═══
• Interdit pour les mineurs SAUF dans les secteurs autorisés (horeca, commerce de détail, etc.)
• Autorisé pour les majeurs si le secteur le permet

═══ JOURS FÉRIÉS ═══
• L'étudiant a droit au salaire des jours fériés tombant dans la période du contrat
• Si le jour férié tombe dans les 30 jours APRÈS la fin du contrat → aussi payé si le contrat a duré ≥15 jours

═══ PÉCULE DE VACANCES ═══
• L'étudiant dans le contingent n'a PAS droit au pécule de vacances (pas de cotisations vacances)
• Hors contingent : mêmes droits que les travailleurs ordinaires

═══ SÉCURITÉ ═══
• Analyse des risques obligatoire
• EPI fournis par l'employeur
• Pas de travaux dangereux pour les mineurs (liste AR)`,
     delai:"Pendant toute la durée du contrat",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Formation interne'},

    {n:7,phase:'gestion',titre:"Suivi du contingent — Monitoring des heures",
     detail:`Pendant toute la durée de l'occupation, surveiller le décompte des heures du contingent.

═══ MONITORING ═══
• Vérifier régulièrement le compteur Student@Work
• Comparer avec les heures effectivement prestées
• Anticiper le dépassement si l'étudiant travaille chez plusieurs employeurs

═══ ATTENTION : MULTI-EMPLOYEURS ═══
Le contingent de 600h est GLOBAL — il est partagé entre TOUS les employeurs.
Si l'étudiant travaille aussi ailleurs, ses heures sont cumulées.
→ Demander à l'étudiant une attestation à jour régulièrement

═══ EN CAS DE DÉPASSEMENT IMMINENT ═══
1. Prévenir l'étudiant
2. Décider ensemble : continuer avec cotisations normales ou arrêter
3. Si continuation : adapter la DIMONA et le calcul de paie
4. L'étudiant perd ses allocations familiales pour le trimestre du dépassement

═══ IMPACT SUR LES ALLOCATIONS FAMILIALES ═══
• Dans le contingent 600h : allocations familiales PRÉSERVÉES
• Hors contingent : perte pour le trimestre si >240h travaillées hors contingent
• Exception : 3e trimestre (juillet-septembre) : pas de limite en heures`,
     delai:"En continu — vérification régulière",formulaire:"Attestation Student@Work mise à jour",ou:"www.studentatwork.be",obligatoire:true,duree_estimee:'15 min/semaine'},

    {n:8,phase:'gestion',titre:"Fin du contrat étudiant — Documents de sortie",
     detail:`À la fin du contrat étudiant (CDD = fin automatique), quelques formalités.

═══ FIN AUTOMATIQUE DU CDD ═══
• Le contrat prend fin à la date convenue
• Pas de préavis nécessaire (c'est un CDD)
• Pas d'indemnité de fin de contrat

═══ DIMONA OUT ═══
Déclarer la sortie via DIMONA OUT (type STU).
Le compteur Student@Work est automatiquement ajusté.

═══ DOCUMENTS À REMETTRE ═══
1. Dernier décompte de salaire (fiche de paie finale)
2. Formulaire fiscal 281.10 (si revenus > seuil fiscal)
3. Attestation de travail (dates, fonction, heures prestées)
4. Formulaire C4 étudiant (si l'étudiant en a besoin — rare)

═══ JOURS FÉRIÉS APRÈS FIN ═══
Si le contrat a duré ≥15 jours consécutifs :
→ L'employeur doit payer les jours fériés tombant dans les 30 jours suivant la fin
→ Vérifier le calendrier !

═══ RÉ-ENGAGEMENT ═══
L'étudiant peut être ré-engagé :
• Chez le même employeur : nouveau contrat étudiant si heures disponibles
• Pas de délai d'attente entre deux contrats étudiants
• ATTENTION : >4 CDD successifs ou >3 ans → risque de requalification en CDI`,
     delai:"Le dernier jour du contrat + 30 jours (jours fériés)",formulaire:"DIMONA OUT type STU + fiche de paie finale + 281.10",ou:"www.socialsecurity.be → DIMONA OUT",obligatoire:true,duree_estimee:'1 heure'},
  ],
  alertes:[
    {niveau:'critique',texte:"CONTRAT ÉCRIT OBLIGATOIRE avant le 1er jour. Sans contrat écrit → requalification en contrat ordinaire CDI avec cotisations ONSS normales (±38%)."},
    {niveau:'critique',texte:"Au-delà de 600h/an → cotisations ONSS normales automatiques. Le coût TRIPLE. Toujours vérifier le compteur Student@Work AVANT l'engagement."},
    {niveau:'important',texte:"Le contingent 600h est GLOBAL entre tous les employeurs. Si l'étudiant travaille ailleurs, ses heures sont cumulées."},
    {niveau:'important',texte:"Étudiant mineur (<18 ans) : restrictions sur le travail de nuit, dimanche, jours fériés, travaux dangereux. Vérifier les règles sectorielles."},
    {niveau:'attention',texte:"DIMONA type STU obligatoire. Si type 'ordinaire' au lieu de 'STU' → cotisations normales appliquées et heures non décomptées du contingent."},
    {niveau:'attention',texte:"Jours fériés après fin du contrat : si contrat ≥15 jours → payer les fériés dans les 30 jours suivants. Piège fréquent !"},
    {niveau:'info',texte:"L'étudiant est exonéré de PP tant que ses revenus annuels bruts imposables restent sous ±14.500€ (2026). Au-delà → PP applicable."},
  ],
  simulation:{titre:"Comparaison — Étudiant (contingent) vs travailleur ordinaire — 80h à 13€/h",lignes:[
    {label:'Brut mensuel (80h × 13€)',montant:'1.040,00€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'ÉTUDIANT dans contingent :',montant:'',type:'neutre'},
    {label:'  ONSS patronal (2,71%)',montant:'28,18€',type:'vert'},
    {label:'  ONSS étudiant (2,71%)',montant:'28,18€',type:'vert'},
    {label:'  PP',montant:'0,00€',type:'vert'},
    {label:'  NET étudiant',montant:'1.011,82€',type:'vert_bold'},
    {label:'  Coût total employeur',montant:'1.068,18€',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'TRAVAILLEUR ORDINAIRE :',montant:'',type:'neutre'},
    {label:'  ONSS patronal (25%)',montant:'260,00€',type:'neutre'},
    {label:'  ONSS travailleur (13,07%)',montant:'135,93€',type:'neutre'},
    {label:'  PP (±18%)',montant:'±162,73€',type:'neutre'},
    {label:'  NET travailleur',montant:'±741,34€',type:'neutre'},
    {label:'  Coût total employeur',montant:'±1.300,00€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Économie employeur / mois',montant:'231,82€ (-17,8%)',type:'vert_bold'},
    {label:'Gain net étudiant vs ordinaire',montant:'+270,48€ (+36,5%)',type:'vert_bold'},
  ]},
  faq:[
    {q:"L'étudiant peut-il travailler pendant l'année scolaire ?",r:"Oui ! Le contingent de 600h est utilisable toute l'année : vacances scolaires, week-ends, soirées, et même pendant les périodes de cours (mais attention à ne pas compromettre les études)."},
    {q:"Qui vérifie le contingent d'heures restantes ?",r:"L'étudiant consulte son solde sur www.studentatwork.be. L'employeur doit demander une attestation récente. Le décompte est automatique via la DIMONA STU."},
    {q:"L'étudiant garde-t-il ses allocations familiales ?",r:"Oui, tant qu'il reste dans le contingent de 600h/an. Au-delà : perte des allocations pour le trimestre du dépassement (sauf T3 juillet-septembre : pas de limite)."},
    {q:"Puis-je engager un étudiant en CDI ?",r:"Non ! Le contrat étudiant est TOUJOURS un CDD avec date de fin. Un CDI serait requalifié en contrat ordinaire."},
    {q:"L'étudiant a 17 ans — restrictions ?",r:"Oui : pas de travail de nuit (20h-6h) sauf exceptions sectorielles, pas de travaux dangereux (liste AR), pas d'heures sup. Maximum 8h/jour."},
    {q:"L'étudiant dépasse le contingent — que se passe-t-il automatiquement ?",r:"Les cotisations ONSS normales s'appliquent automatiquement sur les heures excédentaires. Le coût triple pour l'employeur et le net diminue pour l'étudiant."},
  ],
  formulaires:[
    {nom:"Student@Work — compteur heures",url:"https://www.studentatwork.be",type:'en_ligne'},
    {nom:"DIMONA STU — déclaration étudiant",url:"https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm",type:'en_ligne'},
    {nom:"SPF Emploi — contrat étudiant (modèle)",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/contrat-doccupation-detudiants",type:'en_ligne'},
  ],
};

// ═══ COMPOSANT UI ═══
export default function ProcedureEtudiant(){const P=PROC_ETUDIANT;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}>
<div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p><div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>⏱️ {P.duree}</span><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>💰 Cotisations 5,42% au lieu de ±38%</span></div></div>
<div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t} étapes</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div>
<div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>💰 Avantages</h2>{P.avantages.map((a,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{a.rang}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{a.detail}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}<h3 style={{fontSize:16,fontWeight:700,color:'#f8fafc',marginTop:24,marginBottom:12}}>🔗 Liens</h3>{P.formulaires.map((f,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 0',borderBottom:'1px solid #1e293b'}}><span style={{fontSize:13,color:'#e2e8f0',flex:1}}>{f.nom}</span>{f.url&&<span style={{fontSize:12,color:'#3b82f6',fontFamily:'monospace'}}>{f.url}</span>}</div>)}</div>}
</div>)}
export {PROC_ETUDIANT};
