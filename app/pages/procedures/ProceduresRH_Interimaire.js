'use client';
import { useState, useMemo } from 'react';

const PROC_INTERIMAIRE = {
  id:'interimaire', icon:'👷', categorie:'embauche',
  titre:"Intérimaire / Mise à disposition",
  resume:"Engagement d'un travailleur via une agence d'intérim agréée. L'agence est l'employeur juridique et gère toute l'administration sociale. L'entreprise utilisatrice paie un coefficient de facturation (1,8× à 2,5× le brut). Idéal pour les besoins temporaires, pics d'activité et pré-recrutement.",
  baseLegale:[
    {ref:"Loi 24/07/1987",desc:"Travail temporaire, travail intérimaire et mise à disposition — cadre légal principal"},
    {ref:"AR 08/07/2014",desc:"Conditions d'agrément des entreprises de travail intérimaire"},
    {ref:"CCT n° 36 (27/11/1981)",desc:"Conditions de travail intérimaire au CNT — obligations de l'utilisateur"},
    {ref:"CCT n° 108 (16/07/2013)",desc:"Motifs de recours au travail intérimaire — remplacement, surcroît, travail exceptionnel, insertion"},
    {ref:"Loi 26/06/2013",desc:"Introduction du motif 'insertion' — intérim comme période d'essai avant CDI (max 6 mois)"},
    {ref:"CP 322",desc:"Commission paritaire pour le travail intérimaire — conditions sectorielles"},
  ],
  eligibilite:{
    motifs_autorises:[
      "Remplacement d'un travailleur permanent absent (maladie, congé, maternité, crédit-temps)",
      "Surcroît temporaire de travail (pic saisonnier, commande exceptionnelle, projet ponctuel)",
      "Exécution d'un travail exceptionnel (déménagement, inventaire, salon professionnel)",
      "Motif d'insertion — période d'essai avant engagement CDI (max 6 mois / 3 tentatives max chez le même utilisateur)",
    ],
    agences_agreees:[
      "Randstad — www.randstad.be",
      "Adecco — www.adecco.be",
      "Manpower — www.manpower.be",
      "Agences intérim agréées — emploi.belgique.be",
      "Start People — www.startpeople.be",
      "Tempo-Team — www.tempo-team.be",
      "Accent Jobs — www.accentjobs.be",
      "Page Personnel / Michael Page — www.pagepersonnel.be",
      "Robert Half — www.roberthalf.be",
      "Unique — www.unique.be",
    ],
    interdictions:[
      "Remplacement de travailleurs en grève ou lock-out",
      "Travaux dangereux figurant sur la liste royale (sauf dérogation CP)",
      "Mise à disposition en cascade (l'intérimaire ne peut pas être re-mis à disposition)",
      "Intérim permanent pour des besoins structurels (abus → requalification en CDI)",
    ],
  },
  duree:"Variable selon motif : remplacement (durée absence), surcroît (max 6 mois renouvelable), insertion (max 6 mois non renouvelable chez le même utilisateur).",
  avantages:[
    {rang:"Zéro administration sociale",detail:"L'agence d'intérim gère TOUT : contrat, DIMONA, ONSS, DmfA, fiche de paie, PP, assurance AT, C4. L'utilisateur n'a aucune obligation administrative."},
    {rang:"Flexibilité immédiate",detail:"Candidats disponibles sous 24-48h. Pas de procédure de recrutement longue. Fin de mission = fin du contrat sans préavis ni indemnité."},
    {rang:"Remplacement instantané",detail:"Si l'intérimaire ne convient pas → l'agence le remplace immédiatement par un autre candidat. Pas de procédure de licenciement."},
    {rang:"Pré-recrutement (motif insertion)",detail:"Tester un candidat pendant max 6 mois avant de l'engager en CDI. Si ça ne convient pas → fin de mission. Si ça convient → engagement direct."},
    {rang:"Pas de risque juridique",detail:"L'agence est l'employeur juridique. En cas de litige social, c'est l'agence qui est responsable (sauf obligations bien-être)."},
    {rang:"Coût maîtrisé",detail:"Le coefficient de facturation est connu à l'avance. Pas de surprises (pécule, 13e mois, C4 = tout inclus dans le coefficient)."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Définir le besoin et le motif légal",
     detail:`Le recours à l'intérim est encadré par la loi — il faut un MOTIF LÉGAL valable.

═══ 4 MOTIFS AUTORISÉS ═══

1️⃣ REMPLACEMENT (motif le plus courant)
• Remplacer un travailleur permanent absent
• Maladie, accident, maternité, congé parental, crédit-temps, vacances
• Durée : tant que dure l'absence
• ⚠️ Nommer le travailleur remplacé dans le contrat de mise à disposition

2️⃣ SURCROÎT TEMPORAIRE DE TRAVAIL
• Pic saisonnier (Noël, été, soldes)
• Commande exceptionnelle, projet ponctuel
• Durée max : 6 mois (renouvelable avec accord syndical si CE/DS)
• ⚠️ Doit être réellement temporaire — pas un besoin permanent

3️⃣ TRAVAIL EXCEPTIONNEL
• Déménagement, inventaire annuel, salon professionnel
• Travaux non habituels pour l'entreprise
• Durée : limitée à la durée du travail exceptionnel

4️⃣ INSERTION (depuis 2013)
• Période d'essai avant engagement CDI
• Max 6 mois chez le même utilisateur
• Max 3 tentatives (3 intérimaires différents pour le même poste)
• Si engagement → ancienneté intérim déduite du préavis

═══ DÉFINIR LE PROFIL ═══
Préparer une description de poste :
• Fonction / titre
• Compétences requises (techniques, langues, permis)
• Horaire (temps plein/partiel, shifts, week-end)
• Durée estimée de la mission
• Rémunération souhaitée ou barème CP applicable
• Lieu de travail`,
     delai:"1 à 2 semaines avant le début souhaité",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1-2 jours'},

    {n:2,phase:'préparation',titre:"Choisir et contacter une agence d'intérim agréée",
     detail:`Seules les agences AGRÉÉES peuvent exercer l'activité de travail intérimaire en Belgique.

═══ PRINCIPALES AGENCES AGRÉÉES ═══
• Randstad — généraliste, plus grande agence en Belgique
• Adecco — généraliste, réseau international
• Manpower — généraliste, profils industriels
• Start People — PME, profils techniques et logistiques
• Tempo-Team — généraliste
• Accent Jobs — profils techniques et ouvriers
• Agences intérim agréées (liste sur emploi.belgique.be)
• Page Personnel / Michael Page — profils cadres et spécialisés
• Robert Half — finance, IT, juridique
• Unique — Flandre principalement

═══ VÉRIFICATION AGRÉMENT ═══
Chaque Région a sa propre liste d'agences agréées :
• Bruxelles : www.werk-economie-emploi.brussels
• Wallonie : www.emploi.wallonie.be
• Flandre : www.werk.be

═══ CRITÈRES DE CHOIX ═══
1. Spécialisation sectorielle (horeca, construction, IT, finance…)
2. Rapidité de mise à disposition
3. Coefficient de facturation proposé
4. Qualité du sourcing et du screening
5. Proximité géographique (bureau local)
6. Services complémentaires (testing, formation, payrolling)

═══ DEMANDER UN DEVIS ═══
L'agence propose un coefficient de facturation :
• Profils ouvriers : coefficient 1,8× à 2,2× le brut
• Profils employés : coefficient 2,0× à 2,5× le brut
• Profils cadres : coefficient 2,2× à 2,8× le brut
• Le coefficient inclut : salaire, ONSS, PP, pécule, assurances, marge agence`,
     delai:"1 à 2 semaines",formulaire:null,ou:"Agence d'intérim agréée de votre choix",obligatoire:true,duree_estimee:'1 semaine'},

    {n:3,phase:'préparation',titre:"Information et consultation des représentants du personnel",
     detail:`Si votre entreprise a un Conseil d'Entreprise (CE) ou une Délégation Syndicale (DS), vous devez les INFORMER ou les CONSULTER avant de recourir à l'intérim.

═══ OBLIGATION D'INFORMATION/CONSULTATION ═══

SI CE ou DS existe (≥50 travailleurs) :
• Informer le CE/DS du recours à l'intérim
• Communiquer : motif, nombre d'intérimaires, durée prévue, postes concernés
• Consultation obligatoire si surcroît > 6 mois (accord nécessaire)
• Le registre des intérimaires doit être tenu à disposition du CE/DS

SI pas de CE ni DS (<50 travailleurs) :
• Pas d'obligation de consultation
• Mais information au travailleur remplacé (si motif remplacement)

═══ REGISTRE DES INTÉRIMAIRES ═══
L'utilisateur doit tenir un registre des travailleurs intérimaires :
• Nom et prénom de l'intérimaire
• Agence d'intérim
• Dates de début et de fin de mission
• Motif légal
• Poste occupé
• Horaire de travail`,
     delai:"Avant le début de la mission",formulaire:"Registre des travailleurs intérimaires",ou:"CE / DS si existant",obligatoire:true,duree_estimee:'1-2 jours'},

    {n:4,phase:'engagement',titre:"Signer le contrat commercial avec l'agence",
     detail:`L'agence établit un contrat commercial de mise à disposition entre elle et l'entreprise utilisatrice.

═══ CONTENU DU CONTRAT COMMERCIAL ═══
1. Identité des parties (agence + utilisateur)
2. Motif légal de la mise à disposition
3. Durée de la mission (début + fin estimée)
4. Description du poste et compétences
5. Lieu de travail
6. Horaire de travail
7. Coefficient de facturation et tarif horaire/journalier
8. Conditions de facturation (mensuelle, bimensuelle)
9. Conditions de remplacement (si intérimaire ne convient pas)
10. Conditions de fin anticipée de mission
11. Clause d'engagement direct (fee de recrutement si engagement CDI)

═══ CLAUSE D'ENGAGEMENT (IMPORTANTE !) ═══
La plupart des agences prévoient une clause de "fee de recrutement" si vous engagez directement l'intérimaire :
• Pendant la mission : fee de 15% à 25% du salaire annuel brut
• Après la mission : fee dégressif (ex: 100% si <1 mois, 50% si 1-3 mois, 0% si >3-6 mois)
• Négociable ! Certaines agences suppriment le fee après X semaines de mission

⚠️ LIRE ATTENTIVEMENT cette clause avant de signer.

═══ L'AGENCE GÈRE ═══
• Contrat de travail intérimaire (entre l'agence et l'intérimaire)
• DIMONA
• Fiche de paie
• ONSS, PP
• Assurance accidents du travail
• C4 en fin de mission`,
     delai:"Avant le début de la mission",formulaire:"Contrat commercial de mise à disposition",ou:"Avec l'agence d'intérim",obligatoire:true,duree_estimee:'1-3 jours'},

    {n:5,phase:'engagement',titre:"Accueillir l'intérimaire — obligations de l'utilisateur",
     detail:`L'utilisateur a des obligations SPÉCIFIQUES envers l'intérimaire, même si l'agence est l'employeur juridique.

═══ OBLIGATIONS DE L'UTILISATEUR ═══

1. BIEN-ÊTRE AU TRAVAIL
• L'utilisateur est responsable du bien-être de l'intérimaire sur le lieu de travail
• Analyse des risques du poste (fiche de poste transmise à l'agence)
• Fourniture des EPI (équipements de protection individuelle)
• Information sur les risques spécifiques du poste
• Accès aux installations sanitaires, vestiaires, réfectoire

2. ACCUEIL
• Présentation aux collègues
• Visite des locaux
• Explication des tâches et consignes de sécurité
• Désignation d'un responsable de contact
• Remise du règlement de travail (parties applicables)

3. ÉGALITÉ DE TRAITEMENT
• L'intérimaire a droit aux MÊMES conditions de travail que les permanents :
  - Même rémunération pour le même poste (barème CP)
  - Mêmes horaires
  - Accès au réfectoire, parking, etc.
  - Chèques-repas si les permanents en bénéficient

4. FICHE DE POSTE
• Transmettre à l'agence une fiche de poste détaillée
• Risques identifiés, EPI nécessaires, aptitude médicale requise
• L'agence organise la visite médicale si poste à risque`,
     delai:"Le 1er jour de la mission",formulaire:"Fiche de poste de travail (pour l'agence)",ou:"Dans vos locaux",obligatoire:true,duree_estimee:'1/2 journée'},

    {n:6,phase:'gestion',titre:"Suivi de la mission + gestion des prestations",
     detail:`═══ SUIVI RÉGULIER ═══
• Évaluer les prestations de l'intérimaire régulièrement
• Communiquer les relevés de prestations (heures, jours) à l'agence
• L'agence facture sur base de ces relevés

═══ RELEVÉ DE PRESTATIONS ═══
Chaque semaine ou quinzaine :
• Nombre d'heures/jours prestés
• Heures supplémentaires éventuelles
• Absences (maladie, congé, etc.)
• Signature de l'intérimaire + responsable utilisateur

═══ FACTURATION ═══
L'agence facture mensuellement ou bimensuellement :
• Tarif = heures prestées × coefficient convenu
• TVA 21% applicable sur la facturation intérim
• Délai de paiement : 30 jours (sauf accord différent)

═══ EN CAS DE PROBLÈME ═══
1. Intérimaire ne convient pas → contacter l'agence → remplacement sous 24-48h
2. Accident du travail → appeler l'agence IMMÉDIATEMENT + premiers secours
3. Absence injustifiée → signaler à l'agence (c'est elle qui gère)
4. Conflit → contacter le consultant de l'agence comme médiateur

═══ PROLONGATION ═══
Si la mission doit être prolongée :
• Contacter l'agence pour extension du contrat commercial
• L'agence prolonge le contrat intérimaire
• Vérifier les limites légales (surcroît : 6 mois max sans accord syndical)`,
     delai:"Hebdomadaire (relevés) + mensuel (facturation)",formulaire:"Relevé de prestations (feuille d'heures)",ou:"En interne + transmission à l'agence",obligatoire:true,duree_estimee:'30 min/semaine'},

    {n:7,phase:'gestion',titre:"Coût intérimaire — Coefficient de facturation détaillé",
     detail:`Le coût intérimaire = coefficient × salaire brut. Ce coefficient intègre TOUS les coûts.

═══ COMPOSITION DU COEFFICIENT ═══

Exemple : employé à 3.000€ brut, coefficient 2,2×

Salaire brut mensuel : 3.000€
× Coefficient 2,2 = 6.600€ HT/mois + TVA 21% = 7.986€ TTC/mois

Le coefficient de 2,2× inclut :
• Salaire brut : 100% (3.000€)
• ONSS patronal (±25%) : 750€
• Pécule de vacances : ±250€ (provision mensuelle)
• 13e mois : ±250€ (provision mensuelle)
• Assurance AT : ±30€
• Cotisation fonds de sécurité d'existence CP 322 : ±60€
• Frais de gestion agence : ±200€
• Marge bénéficiaire agence : ±260€

═══ COMPARAISON AVEC ENGAGEMENT DIRECT ═══
Engagement direct du même profil à 3.000€ brut :
• Coût mensuel : ±4.200€ (brut + ONSS + provisions)
• Coût annuel : ±50.400€

Intérim (coefficient 2,2×) :
• Coût mensuel : 6.600€ HT
• Coût annuel : 79.200€ HT

Surcoût intérim : ±28.800€/an (+57%)
MAIS : flexibilité totale, zéro admin, zéro risque juridique, remplacement immédiat.

═══ NÉGOCIATION DU COEFFICIENT ═══
• Volume : plus vous utilisez l'intérim, plus le coefficient baisse
• Durée : missions longues = coefficient réduit
• Exclusivité : travailler avec une seule agence = meilleur tarif
• Secteur : certains secteurs ont des coefficients standards (CP 322)`,
     delai:"À négocier avant le début de la mission",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Négociation initiale'},

    {n:8,phase:'fin',titre:"Fin de mission — Options de continuation",
     detail:`═══ FIN DE MISSION ═══
• Le contrat intérimaire prend fin à la date convenue
• Pas de préavis de l'utilisateur vers l'intérimaire (c'est l'agence qui gère)
• L'agence délivre le C4 à l'intérimaire
• Informer l'agence au moins 1 semaine à l'avance (par courtoisie)

═══ OPTION 1 : ENGAGEMENT DIRECT ═══
Engager l'intérimaire en CDI directement :
• Vérifier la clause de fee de recrutement dans le contrat agence
• Négocier le fee (souvent 0% après 3-6 mois de mission)
• Avantage : l'ancienneté intérim (motif insertion) est déduite du préavis en cas de licenciement ultérieur
• Procédure : contrat de travail direct + DIMONA + toute la procédure d'engagement classique
• Possibilité de cumul avec aides : premier engagement, Activa (si conditions remplies)

═══ OPTION 2 : PROLONGATION INTÉRIM ═══
Prolonger la mission intérimaire :
• Nouvelle convention avec l'agence
• Vérifier les limites légales (motif surcroît : 6 mois max sans accord CE/DS)
• Le motif insertion est limité à 6 mois max (3 tentatives)

═══ OPTION 3 : FIN SANS SUITE ═══
La mission se termine, l'intérimaire retourne à l'agence.
• Aucune obligation de l'utilisateur
• L'agence peut réaffecter l'intérimaire ailleurs

═══ L'INTÉRIMAIRE COMPTE-T-IL DANS L'EFFECTIF ? ═══
⚠️ OUI pour le calcul du seuil premier engagement !
Les intérimaires mis à votre disposition comptent dans le nombre max de travailleurs occupés simultanément.
MAIS : ils ne comptent PAS pour le seuil CE (50 travailleurs) ni CPPT (50 travailleurs) car ils ne sont pas dans votre DIMONA/DmfA.`,
     delai:"1 semaine avant la fin souhaitée",formulaire:null,ou:"Contact avec l'agence d'intérim",obligatoire:true,duree_estimee:'1-2 jours'},
  ],
  alertes:[
    {niveau:'critique',texte:"Un MOTIF LÉGAL est OBLIGATOIRE pour recourir à l'intérim : remplacement, surcroît, travail exceptionnel ou insertion. Sans motif = requalification en CDI chez l'utilisateur."},
    {niveau:'critique',texte:"Les intérimaires COMPTENT dans le calcul du seuil premier engagement ONSS. Ne pas les oublier !"},
    {niveau:'important',texte:"L'utilisateur est RESPONSABLE du bien-être au travail de l'intérimaire : EPI, sécurité, analyse des risques. Pas l'agence."},
    {niveau:'important',texte:"Motif insertion : max 6 mois + max 3 tentatives chez le même utilisateur. Au-delà = obligation d'engagement CDI."},
    {niveau:'attention',texte:"Vérifier la clause de fee de recrutement avant de signer le contrat commercial. Peut coûter 15-25% du salaire annuel si engagement direct."},
    {niveau:'attention',texte:"Égalité de traitement : l'intérimaire a droit aux mêmes conditions (salaire, chèques-repas, horaires) que les permanents pour le même poste."},
    {niveau:'info',texte:"Le coefficient intérim inclut TOUT (salaire, ONSS, pécule, 13e mois, assurance, marge). Pas de coûts cachés."},
  ],
  simulation:{titre:"Coût intérim vs engagement direct — Employé 3.000€ brut",lignes:[
    {label:'Salaire brut mensuel',montant:'3.000,00€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'ENGAGEMENT DIRECT :',montant:'',type:'neutre'},
    {label:'  Coût mensuel (brut + ONSS + provisions)',montant:'±4.200€/mois',type:'neutre'},
    {label:'  Coût annuel',montant:'±50.400€/an',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'INTÉRIM (coefficient 2,2×) :',montant:'',type:'neutre'},
    {label:'  Coût mensuel HT',montant:'6.600€/mois',type:'neutre'},
    {label:'  Coût annuel HT',montant:'79.200€/an',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Surcoût intérim / an',montant:'+28.800€ (+57%)',type:'neutre'},
    {label:'MAIS : flexibilité, zéro admin, zéro risque',montant:'✓',type:'vert'},
    {label:'Remplacement immédiat si ne convient pas',montant:'✓',type:'vert'},
    {label:'Fee engagement après 6 mois mission',montant:'souvent 0€',type:'vert'},
  ]},
  faq:[
    {q:"L'intérimaire peut-il refuser une tâche ?",r:"Oui, si la tâche n'est pas prévue dans le contrat intérimaire ou présente un danger grave et immédiat. Sinon, il doit exécuter les tâches convenues."},
    {q:"Puis-je garder un intérimaire indéfiniment ?",r:"Techniquement oui (avec renouvellements successifs), mais un usage permanent peut être requalifié en CDI par le tribunal du travail. Limiter à 6-12 mois max recommandé."},
    {q:"L'intérimaire a-t-il droit aux chèques-repas de mon entreprise ?",r:"Oui ! Principe d'égalité de traitement : si vos permanents ont des chèques-repas pour le même poste, l'intérimaire aussi. L'agence les facturera."},
    {q:"Qui paie en cas de maladie de l'intérimaire ?",r:"L'agence paie le salaire garanti (généralement 7 jours pour les intérimaires contrats journaliers). La mutuelle prend ensuite le relais."},
    {q:"Je veux engager l'intérimaire — comment éviter le fee ?",r:"Négocier à l'avance dans le contrat commercial. Souvent : fee 0% après 750h ou 6 mois de mission. Sinon : laisser un délai de carence de 3-6 mois entre fin de mission et engagement."},
    {q:"L'agence peut-elle m'imposer un intérimaire ?",r:"Non. L'agence propose un ou plusieurs candidats, vous choisissez. Si le candidat ne convient pas, demandez un remplacement."},
  ],
  formulaires:[
    {nom:"Liste agences agréées Bruxelles",url:"https://www.werk-economie-emploi.brussels",type:'en_ligne'},
    {nom:"Liste agences agréées Wallonie",url:"https://www.emploi.wallonie.be",type:'en_ligne'},
    {nom:"Liste agences agréées Flandre",url:"https://www.werk.be",type:'en_ligne'},
    {nom:"SPF Emploi — Travail intérimaire",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/travail-interimaire",type:'en_ligne'},
  ],
};

export default function ProcedureInterimaire(){const P=PROC_INTERIMAIRE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'},{id:'fin',l:'Fin & suite',i:'🔄'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>💰 Avantages</h2>{P.avantages.map((a,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{a.rang}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{a.detail}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_INTERIMAIRE};
