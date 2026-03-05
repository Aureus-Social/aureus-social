'use client';
import { useState, useMemo } from 'react';

const PROC_ALTERNANCE = {
  id:'alternance', icon:'📚', categorie:'embauche',
  titre:"Jeune en alternance (IFAPME / SFPME / EFP / Syntra)",
  resume:"Formation en alternance combinant cours théoriques (1-2 jours/semaine) et formation pratique en entreprise (3-4 jours/semaine). L'entreprise forme un jeune tout en bénéficiant de réductions ONSS et de primes régionales. Âge : 15-25 ans. Indemnité réduite versée au jeune.",
  baseLegale:[
    {ref:"Loi 19/07/1983",desc:"Apprentissage industriel — cadre légal initial de l'alternance en Belgique"},
    {ref:"Accord de coopération 24/10/2008",desc:"Accord entre Communautés et Régions pour harmoniser les contrats d'alternance"},
    {ref:"Décret wallon 20/02/2014",desc:"Contrat d'alternance unique en Wallonie — IFAPME/SFPME"},
    {ref:"Ordonnance bruxelloise 15/07/2015",desc:"Contrat d'alternance en Région de Bruxelles-Capitale — EFP (Espace Formation PME)"},
    {ref:"Décret flamand 10/06/2016",desc:"Duaal leren — système dual d'apprentissage en Flandre — Syntra/VDAB"},
    {ref:"AR 29/06/2014",desc:"Statut social des apprentis en alternance — cotisations ONSS réduites"},
    {ref:"Loi-programme 26/12/2013 art. 42-47",desc:"Réduction ONSS premier engagement applicable aux apprentis (sous conditions)"},
  ],
  eligibilite:{
    jeunes:[
      "Âge : 15 ans minimum (ou avoir terminé les 2 premières années du secondaire)",
      "Âge maximum : 25 ans (Wallonie/BXL) / 25 ans (Flandre)",
      "Inscrit dans un centre de formation en alternance agréé",
      "Obligation scolaire : respectée via la composante théorique de l'alternance",
    ],
    entreprises:[
      "Toute entreprise du secteur privé ou public peut être entreprise formatrice",
      "Agrément obligatoire comme entreprise formatrice par l'opérateur régional",
      "Désigner un tuteur/maître de stage dans l'entreprise",
      "Le tuteur doit avoir une expérience professionnelle suffisante (5 ans en général)",
      "L'entreprise doit disposer de l'infrastructure nécessaire pour la formation",
    ],
    organismes:[
      "🟡 Wallonie : IFAPME (Institut wallon de Formation en Alternance et des indépendants et PME) — www.ifapme.be",
      "🟡 Wallonie (germanophone) : IAWM (Institut für Aus- und Weiterbildung) — www.iawm.be",
      "🔵 Bruxelles : EFP/SFPME (Espace Formation PME / Service Formation PME) — www.efp-bxl.be",
      "🟠 Flandre : Syntra (réseau de centres de formation) — www.syntra.be + VDAB",
    ],
  },
  duree:"1 à 3 ans selon le métier et le niveau de qualification visé. Généralement : apprentissage = 3 ans, formation de chef d'entreprise = 2-3 ans.",
  avantages:[
    {rang:"Indemnité réduite (pas un salaire complet)",detail:"Le jeune reçoit une indemnité mensuelle progressive : ±340€/mois (1ère année), ±476€ (2e année), ±578€ (3e année) en Wallonie/BXL. Pas un salaire barémique complet."},
    {rang:"Cotisations ONSS réduites",detail:"Cotisations ONSS sur l'indemnité d'apprentissage uniquement (base réduite). Exonération ou réduction selon le statut exact du contrat."},
    {rang:"Prime régionale à l'entreprise",detail:"Wallonie : prime tuteur 750€/an + bonus réussite 750€. Bruxelles : prime de 1.750€/an. Flandre : prime de 500€ à 750€/an selon le parcours."},
    {rang:"Réduction premier engagement",detail:"L'apprenti ne compte PAS toujours dans le calcul du seuil premier engagement (vérifier avec l'ONSS selon le type de contrat exact)."},
    {rang:"Main-d'œuvre formée sur mesure",detail:"Le jeune est formé à VOS méthodes, VOS outils, VOTRE culture d'entreprise. Investissement dans le futur personnel qualifié."},
    {rang:"Engagement après alternance",detail:"À la fin de l'alternance, engagement en CDI avec un travailleur déjà formé et opérationnel. Possibilité d'aides Activa / premier engagement."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Contacter l'opérateur de formation en alternance",
     detail:`Prendre contact avec l'opérateur régional compétent pour votre zone géographique.

═══ QUI CONTACTER ═══

🟡 WALLONIE — IFAPME
• www.ifapme.be — tél. 0800 90 133
• 8 centres de formation en Wallonie
• Formations : +200 métiers (construction, horeca, commerce, IT, beauté, mécanique…)
• 2 filières : apprentissage (15-24 ans) + formation chef d'entreprise (18+ ans)

🔵 BRUXELLES — EFP/SFPME
• www.efp-bxl.be — tél. 02 370 60 40
• FR : EFP (Espace Formation PME)
• NL : SFPME (Syntra Brussel)
• Formations adaptées au marché bruxellois

🟠 FLANDRE — SYNTRA
• www.syntra.be — réseau de 5 campus
• Duaal leren (apprentissage dual)
• En coordination avec le VDAB

═══ INFORMATIONS À FOURNIR ═══
1. Secteur d'activité et commission paritaire
2. Métier/fonction pour le jeune en alternance
3. Nombre de places disponibles
4. Nom et qualifications du tuteur désigné
5. Infrastructure de formation disponible`,
     delai:"3 à 6 mois avant le début souhaité (rentrée septembre/janvier)",formulaire:null,ou:"IFAPME (WAL) / EFP (BXL) / Syntra (VL)",obligatoire:true,duree_estimee:'2-4 semaines'},

    {n:2,phase:'préparation',titre:"Obtenir l'agrément comme entreprise formatrice",
     detail:`L'entreprise doit être AGRÉÉE par l'opérateur régional pour accueillir un jeune en alternance.

═══ CONDITIONS D'AGRÉMENT ═══
1. L'entreprise est en règle avec la législation sociale et fiscale
2. L'entreprise dispose de l'infrastructure pour former le jeune
3. Un TUTEUR est désigné :
   • Expérience professionnelle de 5 ans minimum dans le métier
   • Ou diplôme dans le métier + 2 ans d'expérience
   • Formation pédagogique recommandée (proposée par l'opérateur)
4. L'entreprise s'engage à suivre le plan de formation
5. Pas de condamnation pour infractions sociales graves

═══ PROCÉDURE ═══
1. Remplir le formulaire de demande d'agrément
2. Visite de l'entreprise par un délégué à la tutelle de l'opérateur
3. Validation de l'agrément (4 à 8 semaines)
4. L'agrément est généralement valable pour 5 ans (renouvelable)

═══ DÉLÉGUÉ À LA TUTELLE ═══
L'opérateur désigne un délégué à la tutelle qui :
• Accompagne le trio entreprise-jeune-centre de formation
• Effectue des visites en entreprise (±3 par an)
• Médie en cas de conflit
• Valide les compétences acquises`,
     delai:"4 à 8 semaines pour l'agrément",formulaire:"Demande d'agrément entreprise formatrice",ou:"IFAPME / EFP / Syntra — service agrément",obligatoire:true,duree_estimee:'4-8 semaines'},

    {n:3,phase:'préparation',titre:"Sélectionner le jeune — matching avec le centre de formation",
     detail:`L'opérateur aide à trouver un jeune correspondant au profil recherché.

═══ COMMENT ÇA FONCTIONNE ═══
• L'opérateur propose des candidats inscrits dans la formation correspondante
• L'entreprise peut aussi recruter directement un jeune qui s'inscrira ensuite
• Entretien de sélection classique (motivations, aptitudes)
• Le centre de formation valide l'adéquation jeune/entreprise/formation

═══ PROFIL DES JEUNES EN ALTERNANCE ═══
• 15-18 ans : souvent sortie du secondaire, première expérience professionnelle
• 18-25 ans : parfois réorientation, formation chef d'entreprise, profils plus matures
• Motivés par l'apprentissage pratique (pas l'enseignement classique)
• Formations très variées : boulanger, coiffeur, électricien, mécanicien, comptable, informaticien, cuisinier…`,
     delai:"2 à 4 semaines",formulaire:null,ou:"Centre de formation + entretien en entreprise",obligatoire:true,duree_estimee:'2-4 semaines'},

    {n:4,phase:'engagement',titre:"Signer le contrat d'alternance",
     detail:`Le contrat d'alternance est un contrat TRIPARTITE : jeune + entreprise + opérateur de formation.

═══ TYPE DE CONTRAT ═══
Selon la Région et l'âge :
• Contrat d'alternance (Wallonie/BXL) — régi par le décret régional
• Overeenkomst alternerende opleiding (Flandre) — contrat dual
• Convention de stage (pour certaines formations spécifiques)

═══ CONTENU ═══
1. Identité des 3 parties (jeune, entreprise, opérateur)
2. Métier appris et plan de formation
3. Durée (1 à 3 ans)
4. Horaire : jours en entreprise + jours au centre de formation
5. Indemnité mensuelle progressive
6. Obligations de chaque partie
7. Conditions de rupture
8. Nom du tuteur en entreprise
9. Nom du formateur au centre

═══ INDEMNITÉS MENSUELLES (Wallonie/BXL 2026 — indicatif) ═══
• 1ère année : ±340€/mois
• 2e année : ±476€/mois
• 3e année : ±578€/mois
• Ces montants sont indexés annuellement
• En Flandre : indemnités similaires ou légèrement supérieures

═══ HORAIRE TYPE ═══
• 3-4 jours/semaine en entreprise (formation pratique)
• 1-2 jours/semaine au centre de formation (cours théoriques)
• Vacances scolaires : le jeune est en entreprise à temps plein
• Congés : 20 jours/an (comme tout travailleur)`,
     delai:"Avant le début de la formation (rentrée septembre ou janvier)",formulaire:"Contrat d'alternance tripartite",ou:"Opérateur (IFAPME/EFP/Syntra) + signature en entreprise",obligatoire:true,duree_estimee:'1-2 semaines'},

    {n:5,phase:'engagement',titre:"DIMONA + déclarations ONSS",
     detail:`L'apprenti en alternance doit être déclaré auprès de l'ONSS.

═══ DIMONA ═══
• Type : selon le contrat exact (apprentissage industriel, alternance…)
• NISS du jeune
• Date de début et de fin de la formation
• L'entreprise est EMPLOYEUR pour les aspects ONSS (pas l'opérateur)

═══ COTISATIONS ONSS ═══
Les cotisations sont calculées sur l'indemnité d'apprentissage :
• ONSS patronal : taux réduit (±25% sur une base faible)
• ONSS travailleur : 13,07% sur l'indemnité
• La base est TRÈS faible (340-578€/mois) → cotisations minimales

═══ RÉDUCTIONS POSSIBLES ═══
• Réduction premier engagement : l'apprenti ne compte pas toujours dans l'effectif (vérifier avec ONSS)
• Réduction structurelle : applicable sur la base réduite
• Pas de bonus emploi (indemnité trop basse)

═══ ASSURANCE ACCIDENTS DU TRAVAIL ═══
L'entreprise DOIT couvrir l'apprenti par son assurance AT.
Les accidents pendant les cours au centre sont couverts par l'opérateur.`,
     delai:"Avant le 1er jour en entreprise",formulaire:"DIMONA + DmfA trimestrielle",ou:"www.socialsecurity.be",obligatoire:true,duree_estimee:'30 min'},

    {n:6,phase:'gestion',titre:"Suivi de la formation + évaluations + primes régionales",
     detail:`═══ SUIVI EN ENTREPRISE ═══
Le tuteur assure le suivi quotidien :
• Transmission des compétences selon le plan de formation
• Évaluation régulière des progrès
• Carnet d'apprentissage à compléter (compétences acquises, en cours, à travailler)

═══ VISITES DU DÉLÉGUÉ À LA TUTELLE ═══
Le délégué de l'opérateur visite l'entreprise ±3 fois par an :
• Vérification du respect du plan de formation
• Entretien avec le tuteur et le jeune
• Médiation si difficultés
• Validation des compétences acquises

═══ ÉVALUATIONS ═══
• Évaluations semestrielles : progrès du jeune, ajustement du plan
• Examen final au centre de formation : obtention du certificat/diplôme
• Si échec : possibilité de prolonger d'1 an

═══ PRIMES RÉGIONALES À L'ENTREPRISE ═══

🟡 WALLONIE (IFAPME) :
• Prime tuteur : 750€/an
• Bonus réussite : 750€ à la fin si le jeune obtient son certificat
• Total potentiel : 1.500€/an × 3 ans = 4.500€

🔵 BRUXELLES (EFP) :
• Prime annuelle : 1.750€/an
• Total : 1.750€ × 3 ans = 5.250€

🟠 FLANDRE (Syntra) :
• Prime : 500€ à 750€/an selon parcours
• Bonus complémentaire si engagement après alternance

⚠️ Ces primes sont à DEMANDER auprès de l'opérateur — elles ne sont pas automatiques.`,
     delai:"Continu pendant toute la durée + demande annuelle de primes",formulaire:"Carnet d'apprentissage + demande de prime annuelle",ou:"IFAPME/EFP/Syntra — service primes",obligatoire:true,duree_estimee:'2-3h/mois'},

    {n:7,phase:'gestion',titre:"Obligations spécifiques — jeune mineur et bien-être",
     detail:`Si le jeune est mineur (<18 ans), des règles SPÉCIFIQUES s'appliquent.

═══ TEMPS DE TRAVAIL — MINEUR ═══
• Maximum 8h/jour et 38h/semaine (entreprise + centre cumulés)
• Interdiction travail de nuit (20h-6h) sauf exceptions (horeca, boulangerie)
• Interdiction travail du dimanche (sauf secteurs autorisés)
• Pause de 30 min obligatoire si travail > 4h30
• 12h de repos consécutives minimum entre 2 prestations

═══ TRAVAUX INTERDITS AUX MINEURS ═══
• Travaux en hauteur (>2m)
• Manipulation de machines dangereuses
• Exposition à des agents chimiques/biologiques dangereux
• Port de charges excessives
• Liste complète : AR 03/05/1999 relatif à la protection des jeunes au travail

═══ SURVEILLANCE MÉDICALE ═══
• Visite médicale d'embauche OBLIGATOIRE (via le SEPP de l'entreprise)
• Visites médicales périodiques annuelles
• Évaluation de santé adaptée au jeune âge

═══ BIEN-ÊTRE GÉNÉRAL ═══
• Accueil spécifique (le jeune découvre le monde du travail)
• Patience et pédagogie du tuteur
• Signalement immédiat de tout problème au délégué à la tutelle
• Le jeune a les mêmes droits au bien-être que tout travailleur`,
     delai:"Pendant toute la durée de l'alternance",formulaire:null,ou:"Interne + SEPP",obligatoire:true,duree_estimee:'Formation continue'},

    {n:8,phase:'fin',titre:"Fin de l'alternance — Engagement ou poursuite",
     detail:`═══ OBTENTION DU CERTIFICAT ═══
Si le jeune réussit sa formation :
• Délivrance d'un certificat d'apprentissage / certificat de qualification
• Le certificat est reconnu par la Communauté française/flamande/germanophone
• Accès au métier appris (certains métiers réglementés exigent ce certificat)

═══ OPTION 1 : ENGAGEMENT CDI ═══
Engager le jeune en CDI directement :
• Vous avez un travailleur FORMÉ et OPÉRATIONNEL
• Négocier le salaire selon le barème CP (passage du statut apprenti → salarié)
• Aides possibles : premier engagement, Activa, réduction groupe-cible jeune (<26 ans)
• La prime de réussite (750€ WAL) est versée à ce moment

═══ OPTION 2 : FIN SANS ENGAGEMENT ═══
Le contrat d'alternance prend fin naturellement.
• Le jeune peut chercher un emploi avec son certificat
• Il a droit aux allocations d'insertion (stage d'insertion ONEM de 310 jours)
• Aucune obligation pour l'entreprise

═══ OPTION 3 : POURSUITE EN FORMATION CHEF D'ENTREPRISE ═══
Le jeune continue en formation de chef d'entreprise (2-3 ans supplémentaires) :
• Niveau supérieur de qualification
• Contrat de formation chef d'entreprise
• Indemnité plus élevée
• À la fin : accès à la gestion d'entreprise (connaissances de gestion de base)

═══ RÉDUCTION GROUPE-CIBLE JEUNE (<26 ANS) ═══
Si engagement CDI du jeune <26 ans :
• Réduction ONSS patronale : -1.500€/trimestre pendant 8 trimestres
• Cumulable avec la réduction structurelle
• Le jeune a aussi droit au bonus emploi (si bas salaire)`,
     delai:"3 mois avant la fin de l'alternance — décision d'engagement",formulaire:null,ou:"Discussion avec le jeune + opérateur de formation",obligatoire:true,duree_estimee:'2-3 semaines'},
  ],
  alertes:[
    {niveau:'critique',texte:"L'agrément comme entreprise formatrice est OBLIGATOIRE avant d'accueillir un jeune. Former sans agrément = infraction sanctionnée."},
    {niveau:'critique',texte:"Le tuteur doit avoir 5 ans d'expérience minimum dans le métier. Si le tuteur quitte l'entreprise, en désigner un nouveau IMMÉDIATEMENT et informer l'opérateur."},
    {niveau:'important',texte:"Jeune mineur (<18 ans) : restrictions strictes sur les horaires, le travail de nuit, les travaux dangereux. Vérifier la liste des travaux interdits (AR 03/05/1999)."},
    {niveau:'important',texte:"Les primes régionales (750€-1.750€/an) doivent être DEMANDÉES auprès de l'opérateur. Elles ne sont pas automatiques."},
    {niveau:'attention',texte:"L'assurance accidents du travail de l'entreprise doit couvrir l'apprenti. Les accidents au centre de formation sont couverts par l'opérateur."},
    {niveau:'attention',texte:"Le contrat d'alternance est un contrat TRIPARTITE. Toute modification doit être validée par les 3 parties (jeune + entreprise + opérateur)."},
    {niveau:'info',texte:"Après l'alternance, le jeune <26 ans peut bénéficier de la réduction groupe-cible jeune : -1.500€/trim pendant 8 trimestres si engagement CDI."},
  ],
  simulation:{titre:"Coût alternance vs engagement classique (jeune 20 ans)",lignes:[
    {label:'ALTERNANCE (3 ans) :',montant:'',type:'neutre'},
    {label:'  Indemnité moyenne : ±465€/mois',montant:'16.740€/3 ans',type:'neutre'},
    {label:'  ONSS patronal sur indemnité',montant:'±4.186€/3 ans',type:'neutre'},
    {label:'  Coût total alternance',montant:'±20.926€/3 ans',type:'neutre'},
    {label:'  Primes reçues (WAL)',montant:'-4.500€',type:'vert'},
    {label:'  Coût NET alternance',montant:'±16.426€/3 ans',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'ENGAGEMENT CLASSIQUE (même durée) :',montant:'',type:'neutre'},
    {label:'  Coût employeur ±3.500€/mois × 36',montant:'126.000€/3 ans',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Économie alternance vs engagement',montant:'±109.574€/3 ans',type:'vert_bold'},
    {label:'+ Travailleur formé à VOS méthodes',montant:'✓',type:'vert'},
    {label:'+ Possibilité engagement CDI avec aides',montant:'✓',type:'vert'},
  ]},
  faq:[
    {q:"L'apprenti compte-t-il dans mon effectif pour le premier engagement ?",r:"Cela dépend du type exact de contrat. En général, les apprentis en alternance (contrat d'alternance régional) ne comptent PAS. Les apprentis industriels (ancien régime) comptent. Vérifier avec l'ONSS."},
    {q:"Le jeune peut-il faire des heures supplémentaires ?",r:"NON si mineur. Si majeur (18+) : oui, aux mêmes conditions que les autres travailleurs, mais déconseillé car l'objectif est la formation."},
    {q:"Que se passe-t-il si le jeune échoue à ses examens ?",r:"Il peut recommencer l'année (prolongation d'1 an maximum). Si échec répété, le contrat peut être rompu par l'opérateur après médiation."},
    {q:"Le jeune est malade — qui paie ?",r:"L'entreprise paie le salaire garanti (sur l'indemnité d'apprentissage). La mutuelle prend le relais ensuite."},
    {q:"Puis-je rompre le contrat d'alternance ?",r:"Oui, mais via une procédure encadrée par l'opérateur : médiation obligatoire, préavis (7 jours pendant les 3 premiers mois, puis 1 mois). Rupture unilatérale abusive = indemnité."},
    {q:"Le jeune est formé et je veux l'engager — aides disponibles ?",r:"Réduction groupe-cible jeune <26 ans : -1.500€/trim pendant 8 trim. + Premier engagement si c'est votre 1er travailleur (illimité). + Bonus emploi si bas salaire. Économie potentielle : ±25.000€ sur 3 ans."},
  ],
  formulaires:[
    {nom:"IFAPME — Devenir entreprise formatrice",url:"https://www.ifapme.be/entreprises",type:'en_ligne'},
    {nom:"EFP Bruxelles — Accueillir un apprenti",url:"https://www.efp-bxl.be",type:'en_ligne'},
    {nom:"Syntra Flandre — Duaal leren",url:"https://www.syntra.be",type:'en_ligne'},
    {nom:"SPF Emploi — Formation en alternance",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/contrats-de-formation-en-alternance",type:'en_ligne'},
  ],
};

export default function ProcedureAlternance(){const P=PROC_ALTERNANCE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
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
export {PROC_ALTERNANCE};
