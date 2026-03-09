'use client';
import { useState, useEffect, useRef } from 'react';

// ═══════ TRANSLATIONS (condensed — FR only shown, others follow same structure) ═══════
const T = {
fr:{
  topbar:{country:'🇧🇪 Belgique',bce:'BCE BE 1028.230.781',contact:'Contact',client:'Espace client'},
  nav:{demo:'Demander une démo',login:'Connexion'},
  mega:{
    1:{label:'Indépendants',items:[['🚀','Se lancer','Statut, obligations, démarches ONSS','independant'],['🧮','Cotisations','Calcul ONSS trimestriel','independant'],['📋','Obligations','Dimona, DmfA, TVA, IPP','independant'],['🛡️','Protection sociale','Maladie, invalidité, pension','independant']]},
    2:{label:'Devenir employeur',items:[['👤','Premier employé','Immatriculation ONSS, contrat','employeur'],['📄','Contrat de travail','CDI, CDD — modèles conformes','employeur'],['⚡','Dimona automatique','Déclaration IN/OUT en 8 secondes','employeur'],['💶','Premiers salaires','Calcul paie, fiches, SEPA','employeur']]},
    3:{label:'Employeurs',items:[['🏢','Gestion de la paie','166 CP, barèmes, primes, ONSS','employeurs'],['📊','Déclarations trimestrielles','DmfA XML, Belcotax 281.10/20/30','employeurs'],['📁','Export comptable','WinBooks, BOB, Octopus, Exact Online','employeurs'],['🔐','Sécurité & RGPD','AES-256-GCM, audit trail, RLS','employeurs'],['👥','Portail employé','Fiches de paie, documents, congés','employeurs'],['✍️','Signature électronique','Yousign / DocuSign','employeurs']]},
    4:{label:'Formations',items:[['📚','Droit social belge','ONSS, paie, Dimona','formations'],['🧮','Calcul de paie avancé','CP, barèmes, PP Annexe III','formations'],['🏛','DmfA & Belcotax','Déclarations pas à pas','formations'],['🚀','Onboarding Aureus Pro','Prise en main complète','formations']]},
    5:{label:'Experts-comptables',items:[['🏛','Portail multi-clients','Tous vos dossiers centralisés','experts'],['🔗','API REST + Webhooks','Intégration ERP','experts'],['📤','Mandats ONSS','Génération Mahis/CSAM','experts'],['🔄','Migration assistée','Depuis SD Worx, Partena…','experts']]},
  },
  discover:'Découvrir',readmore:'Lire',
  hero:{badge:'Secrétariat social numérique — v18 en production',h1:'Votre partenaire\nsocial belge.\nEnfin numérique.',sub:"De la Dimona aux déclarations trimestrielles — tout ce dont vous avez besoin, en un seul endroit.",cta1:"Accéder à l'application",cta2:'Voir la démo',stats:[['166','Commissions paritaires'],['< 8s','Dimona soumise'],['132','Modules déployés'],['99.97%','Uptime production']]},
  logos:{title:'Ils ont fait confiance à Aureus Social Pro',items:['PME Bruxelles','Fiduciaire Dupont','Cabinet Janssen','RH Partners','Comptaflex','StartBE']},
  mockup:{badge:'Interface temps réel',title:'Tout votre cycle social\nen un tableau de bord.',sub:'Tableau de bord unifié, alertes ONSS en temps réel, export comptable en un clic.',features:['Fiche de paie générée en 3 clics','Dimona IN/OUT < 8 secondes','DmfA XML prête au 5 du mois','Backup nocturne chiffré AES-256']},
  testimonials:{ey:'Témoignages',title:'Ce que nos clients disent.',items:[
    {name:'Sophie Renard',role:'DRH — PME 12 employés, Bruxelles',text:"Nous avons quitté SD Worx après 8 ans. La migration a pris 3 jours et on économise 340€/mois. Le support répond en moins d'une heure.",stars:5,initials:'SR',color:'#B8913A'},
    {name:'Marc Janssen',role:'Expert-comptable — 23 dossiers',text:"Le portail multi-clients est exactement ce qu'il manquait. Je gère 23 employeurs depuis un seul tableau de bord. Les mandats Mahis sont générés automatiquement.",stars:5,initials:'MJ',color:'#1A5C42'},
    {name:'Amira Benali',role:'Indépendante, CP 200',text:"J'ai déclaré ma première Dimona en 7 secondes. Le calcul de paie est parfait — ONSS, précompte, bonus emploi. Tout est là.",stars:5,initials:'AB',color:'#18396A'},
  ]},
  roi:{ey:'Calculateur ROI',title:'Combien économisez-vous\nen quittant SD Worx ?',sub:'Estimez vos économies annuelles en 30 secondes.',employees:'Nombre d\'employés',current:'Prestataire actuel',providers:['SD Worx','Partena','Securex','Sodexo','Autre'],result:{saving:'Économie annuelle estimée',months:'Retour sur investissement',per:'par mois économisé',cta:'Demander une démo maintenant',note:'Estimation basée sur nos tarifs publics vs tarifs moyens du marché belge.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]},
  sol:{ey:'Nos solutions',h:'Pour chaque profil, la bonne solution.',sub:"Indépendant, employeur ou expert-comptable — Aureus Social Pro s'adapte.",items:[
    {ico:'🚀',title:'Se lancer comme indépendant',desc:"Statut, ONSS, obligations — tout pour démarrer sereinement.",page:'independant'},
    {ico:'👤',title:'Devenir employeur',desc:'Immatriculation, contrat, Dimona, premiers salaires.',page:'employeur',featured:true},
    {ico:'🏢',title:'Employeurs',desc:'Automatisez la paie, DmfA, exports comptables.',page:'employeurs'},
    {ico:'🏛',title:'Experts-comptables',desc:'Portail multi-clients, mandats Mahis/CSAM, API REST.',page:'experts'},
    {ico:'📊',title:'Déclarations & Belcotax',desc:'DmfA trimestrielle, fiches 281.10/20/30, MyMinfin.',page:'employeurs'},
    {ico:'📚',title:'Formations',desc:'Webinaires sur le droit social belge.',page:'formations'},
  ]},
  art:{ey:"Toujours prêt pour l'avenir",h:'Ressources & actualités',filters:[['tout','Tout'],['paie','Paie'],['rh','RH'],['legal','Législation'],['onss','ONSS']],items:[
    {cat:'paie',ico:'🧮',tag:'Paie',title:'Barèmes sectoriels 2026 : ce qui change',desc:'Mise à jour des 166 CP intégrée dans Aureus Social Pro avant le 1er janvier.'},
    {cat:'legal',ico:'⚖️',tag:'Législation',title:'Bonus emploi 2026 : nouveaux plafonds',desc:'Le plafond salarial a été révisé. Impact sur vos calculs.'},
    {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026 : délai et nouveautés',desc:'Date limite, nouveaux codes travailleurs et réduction structurelle.'},
    {cat:'rh',ico:'👥',tag:'RH',title:'Portail employé : fiches, documents, congés',desc:'Vos collaborateurs accèdent à leurs fiches sans solliciter le service paie.'},
    {cat:'paie',ico:'🏦',tag:'Paie',title:'SEPA pain.001 : automatisez vos virements',desc:'Fichiers virement batch ISO 20022.'},
    {cat:'legal',ico:'🔐',tag:'RGPD',title:'RGPD Art. 32 & paie belge',desc:'Chiffrement NISS, registre Art. 30, DPA — conformité complète.'},
  ]},
  nw:{ey:'Newsletter',h:'Ne manquez aucune actualité sociale.',sub:'Changements législatifs, barèmes mis à jour, conseils pratiques.',ph:'votre@email.be',btn:"S'inscrire",note:'Politique de confidentialité Aureus IA SPRL.',ok:'✓ Inscription confirmée — bienvenue !',feats:[['⚖️','Veille législative quotidienne','Alertes dès qu\'une loi impacte vos obligations'],['🧮','Barèmes 2026 mis à jour','Nouvelles grilles CP avant entrée en vigueur'],['💡',"Conseils d'experts","Fiches pratiques de nos juristes"]]},
  cta:{h:'Prêt à moderniser votre gestion sociale ?',sub:'Premier mois offert · Accès immédiat · Migration assistée',btn:'Accéder maintenant →'},
  ft:{col1:'Solutions',col2:'Produit',col3:'Légal',copy:'© 2026 Aureus IA SPRL · Tous droits réservés',links:['Disclaimer','Privacy','Cookie policy','CGU'],
    c1:[['Indépendants','independant'],['Devenir employeur','employeur'],['Employeurs','employeurs'],['Experts-comptables','experts'],['Formations','formations']],
    c2:[['Demander une démo','contact'],['Documentation',null],['Statut',null]],
    c3:[['Confidentialité',null],['CGU',null],['RGPD',null],['Disclaimer',null]]},
  cookie:{text:'Ce site utilise des cookies pour améliorer votre expérience et mesurer l\'audience.',accept:'Accepter',refuse:'Refuser',settings:'Paramètres'},
  ind:{ey:'Indépendants',bc:'Indépendants',h:'Se lancer comme\nindépendant\nen Belgique.',sub:'Le guide complet étape par étape.',c1:'Parler à un expert',c2:'Demander une démo',
    card:{label:'Aureus Social Pro',title:'Votre back-office social',sub:'Automatisez vos obligations.',stats:[['166','CP gérées'],['<8s','Dimona'],['100%','Conforme'],['24/7','Accès']]},
    sy:{ey:'Guide pas à pas',h:'Se lancer en 6 étapes',chk:['Dimona IN/OUT < 8s','Cotisations ONSS 13,07%','Fiches de paie PDF','DmfA XML trimestrielle','Belcotax 281.10','SEPA pain.001','Signature électronique'],chkH:"✅ Ce qu'Aureus automatise",
      tip:{h:'Bon à savoir',t:"En 2026, le premier employé bénéficie d'une exonération totale des cotisations patronales ONSS pendant 5 ans."},
      steps:[{n:1,t:'Choisir votre statut',b:'Indépendant principal ou complémentaire, société (SRL, SA…) ou unipersonnel.',tags:['SRL · SA · Unipersonnel'],tc:'vt-tag-au'},
        {n:2,t:"Numéro d'entreprise (BCE)",b:"Inscription au registre des personnes morales auprès du greffe du tribunal de l'entreprise.",tags:['BCE · Banque-Carrefour'],tc:'vt-tag-b'},
        {n:3,t:'Affiliation à une caisse sociale',b:"Obligation légale dans les 90 jours du début d'activité.",tags:['ONSS · 90 jours'],tc:'vt-tag-g'},
        {n:4,t:'Cotisations sociales trimestrielles',b:"20,5% jusqu'à 72 810 € et 14,16% au-delà. Minimum : 870,78 €/trimestre.",tags:['20,5% · Trimestriel'],tc:'vt-tag-au'},
        {n:5,t:'Obligations TVA & IPP',b:"Déclaration TVA mensuelle ou trimestrielle, déclaration IPP annuelle.",tags:['TVA · IPP · SPF Finances'],tc:''},
        {n:6,t:'Protection sociale',b:"Maladie-invalidité (INAMI), pension, allocations familiales. Optionnel : PLCI.",tags:['INAMI · Pension · PLCI'],tc:'vt-tag-g'},
      ]},
    faq:{ey:'Questions fréquentes',h:'Tout ce que vous voulez savoir',items:[
      ["Quel est le délai pour s'affilier ?","90 jours à compter du début de votre activité. En cas de dépassement : affiliation d'office et majorations."],
      ["Combien coûtent les cotisations en 2026 ?","20,5% jusqu'à 72 810,09 € et 14,16% au-delà. Minimum : 870,78 €/trimestre."],
      ["Puis-je être indépendant complémentaire ?","Oui, sous réserve de l'accord de votre employeur. Cotisations réduites via le régime complémentaire."],
      ["Aureus gère-t-il les indépendants en société ?","Oui. Personnes physiques et mandataires de société (gérants SRL, administrateurs SA)."],
    ]},
    cta:{h:"Prêt à vous lancer en toute sérénité ?",sub:"Nos experts vous accompagnent de A à Z.",btn:"Parler à un expert →"}},
  emp:{ey:'Premier employé',bc:'Devenir employeur',h:'Engagez votre\npremier collaborateur\nen confiance.',sub:'Immatriculation ONSS, contrat, Dimona, premiers salaires.',c1:'Demander une démo',c2:'Déjà employeur →',
    card:{label:'Premier employé en Belgique',title:"Ce qu'Aureus fait",sub:'Automatisation complète du cycle social.',stats:[['0€','Cotisations an 1'],['8s','Dimona'],['100%','ONSS'],['166 CP','Toutes CP']]},
    steps:{ey:'Étapes clés',h:'De 0 à votre premier employé',items:[
      {n:1,t:'Immatriculation ONSS employeur',b:"Numéro employeur ONSS avant d'engager. Aureus guide via WIDE.",tags:['ONSS · WIDE · Matricule'],tc:'vt-tag-b'},
      {n:2,t:'Rédaction du contrat de travail',b:"CDI, CDD, temps plein ou partiel — modèles conformes à la CP applicable.",tags:['CDI · CDD · CP 200'],tc:'vt-tag-au'},
      {n:3,t:'Déclaration Dimona IN',b:"Obligatoire avant le début du travail. Soumise en moins de 8 secondes.",tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},
      {n:4,t:'Calcul du premier salaire',b:"Brut → Net : ONSS 13,07%, précompte professionnel Annexe III, bonus emploi.",tags:['ONSS · PP · Bonus emploi'],tc:'vt-tag-au'},
      {n:5,t:'Virement SEPA',b:"Fichier SEPA pain.001 prêt à importer dans votre banque.",tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},
      {n:6,t:'Déclarations trimestrielles ONSS',b:"DmfA XML Q1–Q4 avec toutes les réductions applicables.",tags:['DmfA · Q1–Q4'],tc:''},
    ]},
    av:{ey:'Avantages 2026',h:"Exonérations & primes à l'embauche",items:[
      ['🎁','Exemption 1er employé',"Exonération totale des cotisations patronales ONSS pendant 5 ans."],
      ['💼','Activa.brussels',"Prime mensuelle jusqu'à 350 € pour un demandeur d'emploi bruxellois."],
      ['📉','Réduction bas salaire',"Réduction ONSS patronale pour salaires inférieurs à 3 100 €/mois."],
      ['🎓','SINE & plan Activa',"Réductions pour l'engagement de personnes éloignées du marché de l'emploi."],
      ['👶','Congé parental',"Gestion des suspensions de contrat et déclarations ONSS spécifiques."],
      ['📋','MonBEE recrutement',"Prime à l'embauche via MonBEE. Délais et documents générés automatiquement."],
    ]},
    cta:{h:"Engagez votre premier collaborateur dès demain.",sub:'Démo gratuite · Accompagnement complet · Premier mois offert',btn:'Démarrer →'}},
  emps:{ey:'Employeurs',bc:'Employeurs',h:'Votre paie,\nvos déclarations,\nautomatisées.',sub:'166 commissions paritaires, DmfA XML, Belcotax, export WinBooks/BOB — 132 modules.',c1:'Accéder à la plateforme',c2:'Demander une démo',
    card:{label:'Plateforme en production',title:'Chiffres réels — Mars 2026',sub:'132 modules · 44 246 lignes de code',stats:[['1 274','Fiches calculées'],['392','Déclarations ONSS'],['42','Entreprises gérées'],['99.97%','Uptime']]},
    mods:{ey:'Fonctionnalités',h:'132 modules pour le cycle social complet',items:[
      ['⚡','Dimona électronique','IN/OUT/UPDATE en moins de 8 secondes. Connexion directe ONSS.'],
      ['🧮','Calcul de paie belge','166 CP, barèmes 2026, ONSS 13,07%, précompte professionnel Annexe III.'],
      ['📋','DmfA XML trimestrielle','Q1–Q4 conformes ONSS. Réduction structurelle, bas salaire, bonus emploi.'],
      ['📊','Belcotax XML','Fiches 281.10, 281.20, 281.30 conformes SPF Finances. Upload MyMinfin.'],
      ['🏦','SEPA pain.001','Fichiers virement batch ISO 20022. Validation IBAN/BIC.'],
      ['📁','Export comptable × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],
      ['✍️','Signature électronique','Yousign ou DocuSign. Valeur probante légale.'],
      ['👥','Portail employé','Fiches de paie, HR, congés — accessibles directement par les collaborateurs.'],
      ['🔐','Sécurité RGPD Art. 32','AES-256-GCM NISS/IBAN, audit trail, RLS Supabase.'],
    ]},
    cta:{h:"Voyez la plateforme en action.",sub:'Démo sur vos propres données — 30 minutes.',btn:'Réserver une démo →'}},
  exp:{ey:'Experts-comptables',bc:'Experts-comptables',h:'Un portail,\ntous vos dossiers\nsociaux.',sub:'Mandats Mahis/CSAM, portail multi-clients, API REST, migration depuis SD Worx ou Partena.',c1:'Demander une démo fiduciaire',c2:'Migration assistée',
    card:{label:'Plan Fiduciaire',title:'Multi-dossiers illimités',sub:'Portail · API · SLA · Migration',stats:[['∞','Dossiers clients'],['99.9%','SLA garanti'],['REST','API + Webhooks'],['Auto','Migration CSV']]},
    it:{ey:'Ce que nous offrons',h:'Conçu pour les professionnels du chiffre',list:[
      ['01','Portail multi-clients centralisé',"Gérez tous vos dossiers depuis un seul dashboard. Droits d'accès granulaires."],
      ['02','Mandats ONSS & Belcotax automatiques',"Conventions Mahis/CSAM conformes. Suivi mandats actifs par client."],
      ['03','API REST + Webhooks HMAC',"Intégrez Aureus dans votre ERP. Webhooks sécurisés paie/DmfA/Dimona."],
      ['04','Migration depuis vos prestataires',"Parseur CSV multi-format SD Worx, Partena, Securex, Sodexo."],
      ['05',"6 formats d'export comptable","WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV."],
      ['06','SLA 99.9% + Account Manager',"Réponse < 2h ouvrables. Canal Slack dédié. Account manager attitré."],
    ]},
    mig:{ey:'Migration',h:'Quitter SD Worx ou Partena sans risque.',steps:[['📥','Export données','CSV depuis votre prestataire actuel'],['🔄','Import automatique','Parseur Aureus — aucune ressaisie'],['✅','Validation croisée','Comparaison calculs avant go-live'],['🚀','Go-live en 7 jours','Dossiers opérationnels dès le premier cycle']]},
    cta:{h:"Rejoignez les fiduciaires qui ont choisi l'indépendance.",sub:'Migration assistée · SLA 99.9% · Premier mois offert',btn:'Demo fiduciaire →'}},
  form:{ey:'Formations',bc:'Formations',h:'Maîtrisez le droit\nsocial belge.\nÀ votre rythme.',sub:'Webinaires, guides pratiques et tutoriels sur la paie belge, ONSS, Dimona et Belcotax.',c1:'Voir le programme',c2:'Nous contacter',
    card:{label:'Formations Aureus',title:'Apprenez des experts',sub:'Contenu basé sur les vrais cas pratiques.',stats:[['6','Modules'],['100%','Droit belge 2026'],['CPD','Heures IEC'],['FR/NL','Langues']]},
    mods:{ey:'Thématiques',h:'Nos 6 modules de formation',items:[
      {ico:'⚖️',t:'Droit social belge',d:"Loi du 27/06/1969, ONSS, obligations de l'employeur, commissions paritaires.",f:false},
      {ico:'🧮',t:'Calcul de paie avancé',d:"Brut → Net : ONSS 13,07%, PP Annexe III, bonus emploi. Exercices pratiques.",f:true},
      {ico:'📋',t:'DmfA & Belcotax',d:"Déclarations ONSS, fiches 281.10/20/30, délais, corrections.",f:false},
      {ico:'🚀',t:'Onboarding Aureus Pro',d:"Configuration, première fiche, première Dimona — en 2 heures.",f:false},
      {ico:'🏛',t:'RGPD & sécurité RH',d:"Art. 28 et 32, registre Art. 30, DPA, chiffrement NISS/IBAN.",f:false},
      {ico:'📊',t:'Veille législative continue',d:"Alertes automatiques dès qu'une loi belge impacte vos obligations.",f:false},
    ]},
    arts:{ey:'Inspiration',h:"Toujours prêt(e) pour l'avenir",items:[
      {ico:'⚖️',tag:'Droit social',t:"Premier employé : les 5 erreurs à éviter",d:"Immatriculation tardive, Dimona oubliée, CP incorrecte — les pièges fréquents."},
      {ico:'💼',tag:'Entrepreneuriat',t:"Indépendant ou société : quel statut en 2026 ?",d:"Cotisations, fiscalité, protection sociale — comparaison complète."},
      {ico:'🏥',tag:'Santé',t:"Absentéisme : obligations légales de l'employeur",d:"Salaire garanti, certificat médical, contrôle médical."},
      {ico:'🎯',tag:'Motivation',t:"Rémunération alternative : warrants, chèques-repas, voiture",d:"Optimisez votre politique salariale avec les avantages extralégaux."},
      {ico:'🔐',tag:'RGPD',t:"RGPD & données RH : ce que tout employeur doit savoir",d:"Traitement NISS, IBAN, dossiers médicaux — Art. 28 et 32."},
      {ico:'🧮',tag:'Paie',t:"Barèmes 2026 : les changements clés par CP",d:"CP 200, 226, 319 — revue des nouvelles grilles salariales."},
    ]},
    cta:{h:"Vous créez une activité ou souhaitez développer votre entreprise ?",sub:'Quelle que soit votre question, Aureus vous donne des réponses claires.',btn:'Contactez-nous →'}},
  con:{ey:'Contact',h:'Comment pouvons-nous\nvous aider ?',sub:'Notre équipe répond sous 4h ouvrables. Pas de chatbot — de vrais experts en droit social belge.',
    ch:[['✉️','E-mail','info@aureus-ia.com'],['💻','Application','app.aureussocial.be'],['📍','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Bruxelles']],
    cr:[['BCE','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Réponse','< 4h ouvrables']],
    f:{t:'Demande de démo',s:'Réponse garantie sous 4h ouvrables.',fn:'Prénom *',ln:'Nom *',em:'E-mail professionnel *',co:'Société',ro:'Vous êtes *',ms:'Message',fnp:'Jean',lnp:'Dupont',emp:'jean.dupont@fiduciaire.be',cop:'Cabinet Dupont & Associés',msp:'Décrivez votre situation…',sub:'Envoyer la demande',note:'En soumettant ce formulaire, vous acceptez notre politique RGPD.',ok:'✓ Message envoyé — nous vous répondrons sous 4h ouvrables.',roles:['Sélectionnez...','Indépendant / Starter','Fiduciaire / Expert-comptable','Employeur direct','Secrétariat social','Courtier / Partenaire','Autre']}},
},
};

// NL
T.nl=JSON.parse(JSON.stringify(T.fr));
T.nl.topbar={country:'🇧🇪 België',bce:'KBO BE 1028.230.781',contact:'Contact',client:'Klantenzone'};
T.nl.nav={demo:'Demo aanvragen',login:'Inloggen'};
T.nl.mega[1].label='Zelfstandigen';T.nl.mega[2].label='Werkgever worden';T.nl.mega[3].label='Werkgevers';T.nl.mega[4].label='Opleidingen';T.nl.mega[5].label='Accountants';
T.nl.hero={badge:'Digitaal sociaal secretariaat — v18 in productie',h1:'Uw Belgische sociale\npartner.\nEindelijk digitaal.',sub:'Van Dimona tot kwartaalaangiften — alles wat u nodig heeft, op één plek.',cta1:'Naar de applicatie',cta2:'Demo bekijken',stats:[['166','Paritaire comités'],['< 8s','Dimona ingediend'],['132','Actieve modules'],['99.97%','Uptime']]};
T.nl.logos={title:'Zij vertrouwen op Aureus Social Pro',items:['KMO Brussel','Fiduciaire Dupont','Kantoor Janssen','HR Partners','Comptaflex','StartBE']};
T.nl.mockup={badge:'Real-time interface',title:'Uw volledige sociale cyclus\nin één dashboard.',sub:'Unified dashboard, real-time ONSS alerts, boekhoudexport in één klik.',features:['Loonfiche in 3 klikken','Dimona IN/OUT < 8 seconden','DmfA XML klaar op de 5e','Versleutelde nachtelijke backup']};
T.nl.testimonials={ey:'Getuigenissen',title:'Wat onze klanten zeggen.',items:[
  {name:'Sophie Renard',role:'HR-manager — KMO 12 werknemers, Brussel',text:"We hebben SD Worx na 8 jaar verlaten. De migratie duurde 3 dagen en we besparen 340€/maand. Support antwoordt binnen een uur.",stars:5,initials:'SR',color:'#B8913A'},
  {name:'Marc Janssen',role:'Accountant — 23 dossiers',text:"Het multi-klant portaal is precies wat ontbrak. Ik beheer 23 werkgevers vanuit één dashboard. Mahis-mandaten worden automatisch gegenereerd.",stars:5,initials:'MJ',color:'#1A5C42'},
  {name:'Amira Benali',role:'Zelfstandige, PC 200',text:"Ik heb mijn eerste Dimona in 7 seconden ingediend. De loonberekening is perfect — ONSS, bedrijfsvoorheffing, werkbonus. Alles klopt.",stars:5,initials:'AB',color:'#18396A'},
]};
T.nl.roi={ey:'ROI Calculator',title:'Hoeveel bespaart u\ndoor SD Worx te verlaten?',sub:'Schat uw jaarlijkse besparing in 30 seconden.',employees:'Aantal werknemers',current:'Huidige prestataire',providers:['SD Worx','Partena','Securex','Sodexo','Andere'],result:{saving:'Geschatte jaarlijkse besparing',months:'Return on investment',per:'per maand bespaard',cta:'Nu een demo aanvragen',note:'Schatting gebaseerd op onze publieke tarieven vs gemiddelde Belgische markttarieven.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]};
T.nl.cta={h:'Klaar om uw sociaal beheer te moderniseren?',sub:'Eerste maand gratis · Directe toegang · Migratiebegeleiding',btn:'Nu beginnen →'};
T.nl.cookie={text:'Deze website gebruikt cookies om uw ervaring te verbeteren.',accept:'Accepteren',refuse:'Weigeren',settings:'Instellingen'};

// EN
T.en=JSON.parse(JSON.stringify(T.fr));
T.en.topbar={country:'🇧🇪 Belgium',bce:'VAT BE 1028.230.781',contact:'Contact',client:'Client area'};
T.en.nav={demo:'Book a demo',login:'Log in'};
T.en.mega[1].label='Freelancers';T.en.mega[2].label='Become an employer';T.en.mega[3].label='Employers';T.en.mega[4].label='Training';T.en.mega[5].label='Accountants';
T.en.hero={badge:'Belgian digital payroll platform — v18 in production',h1:'Your Belgian social\npartner.\nFinally digital.',sub:'From Dimona to quarterly declarations — everything you need, in one place.',cta1:'Go to application',cta2:'Watch demo',stats:[['166','Joint committees'],['< 8s','Dimona submitted'],['132','Deployed modules'],['99.97%','Uptime']]};
T.en.logos={title:'They trust Aureus Social Pro',items:['SME Brussels','Dupont Fiduciary','Janssen Office','HR Partners','Comptaflex','StartBE']};
T.en.mockup={badge:'Real-time interface',title:'Your entire social cycle\nin one dashboard.',sub:'Unified dashboard, real-time ONSS alerts, accounting export in one click.',features:['Payslip generated in 3 clicks','Dimona IN/OUT < 8 seconds','DmfA XML ready by the 5th','AES-256 encrypted nightly backup']};
T.en.testimonials={ey:'Testimonials',title:'What our clients say.',items:[
  {name:'Sophie Renard',role:'HR Manager — 12 employees SME, Brussels',text:"We left SD Worx after 8 years. Migration took 3 days and we save €340/month. Support responds in under an hour.",stars:5,initials:'SR',color:'#B8913A'},
  {name:'Marc Janssen',role:'Accountant — 23 client files',text:"The multi-client portal is exactly what was missing. I manage 23 employers from one dashboard. Mahis mandates are generated automatically.",stars:5,initials:'MJ',color:'#1A5C42'},
  {name:'Amira Benali',role:'Freelancer, JC 200',text:"I submitted my first Dimona in 7 seconds. The payroll calculation is perfect — ONSS, withholding tax, employment bonus. Everything works.",stars:5,initials:'AB',color:'#18396A'},
]};
T.en.roi={ey:'ROI Calculator',title:'How much do you save\nby leaving SD Worx?',sub:'Estimate your annual savings in 30 seconds.',employees:'Number of employees',current:'Current provider',providers:['SD Worx','Partena','Securex','Sodexo','Other'],result:{saving:'Estimated annual savings',months:'Return on investment',per:'saved per month',cta:'Book a demo now',note:'Estimate based on our public rates vs average Belgian market rates.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]};
T.en.cta={h:'Ready to modernize your HR administration?',sub:'First month free · Immediate access · Assisted migration',btn:'Get started →'};
T.en.cookie={text:'This site uses cookies to improve your experience.',accept:'Accept',refuse:'Decline',settings:'Settings'};

// DE
T.de=JSON.parse(JSON.stringify(T.fr));
T.de.topbar={country:'🇧🇪 Belgien',bce:'USt BE 1028.230.781',contact:'Kontakt',client:'Kundenbereich'};
T.de.nav={demo:'Demo anfordern',login:'Anmelden'};
T.de.mega[1].label='Selbständige';T.de.mega[2].label='Arbeitgeber werden';T.de.mega[3].label='Arbeitgeber';T.de.mega[4].label='Schulungen';T.de.mega[5].label='Buchhalter';
T.de.hero={badge:'Digitales belgisches Sozialsekretariat — v18 in Produktion',h1:'Ihr belgischer\nSozialpartner.\nEndlich digital.',sub:'Von Dimona bis Quartalsmeldungen — alles, was Sie brauchen, an einem Ort.',cta1:'Zur Anwendung',cta2:'Demo ansehen',stats:[['166','Paritätische Kommissionen'],['< 8s','Dimona eingereicht'],['132','Aktive Module'],['99.97%','Uptime']]};
T.de.logos={title:'Sie vertrauen Aureus Social Pro',items:['KMU Brüssel','Fiduziaire Dupont','Büro Janssen','HR Partners','Comptaflex','StartBE']};
T.de.mockup={badge:'Echtzeit-Interface',title:'Ihr gesamter Sozialdatenzyklus\nin einem Dashboard.',sub:'Unified Dashboard, ONSS-Echtzeit-Benachrichtigungen, Buchhalterexport per Klick.',features:['Gehaltszettel in 3 Klicks','Dimona IN/OUT < 8 Sekunden','DmfA XML am 5. fertig','AES-256-verschlüsseltes Nacht-Backup']};
T.de.testimonials={ey:'Referenzen',title:'Was unsere Kunden sagen.',items:[
  {name:'Sophie Renard',role:'HR-Leiterin — KMU 12 Mitarbeiter, Brüssel',text:"Wir haben SD Worx nach 8 Jahren verlassen. Migration dauerte 3 Tage, wir sparen 340€/Monat. Support antwortet in unter einer Stunde.",stars:5,initials:'SR',color:'#B8913A'},
  {name:'Marc Janssen',role:'Buchhalter — 23 Akten',text:"Das Multi-Mandanten-Portal ist genau das, was gefehlt hat. Ich verwalte 23 Arbeitgeber von einem Dashboard. Mahis-Mandate werden automatisch erstellt.",stars:5,initials:'MJ',color:'#1A5C42'},
  {name:'Amira Benali',role:'Selbständige, PK 200',text:"Ich habe meine erste Dimona in 7 Sekunden eingereicht. Die Gehaltsberechnung stimmt — ONSS, Lohnsteuer, Beschäftigungsbonus. Alles perfekt.",stars:5,initials:'AB',color:'#18396A'},
]};
T.de.roi={ey:'ROI-Rechner',title:'Wie viel sparen Sie,\nwenn Sie SD Worx verlassen?',sub:'Schätzen Sie Ihre jährlichen Einsparungen in 30 Sekunden.',employees:'Anzahl Mitarbeiter',current:'Aktueller Anbieter',providers:['SD Worx','Partena','Securex','Sodexo','Andere'],result:{saving:'Geschätzte jährliche Einsparung',months:'Return on Investment',per:'pro Monat gespart',cta:'Jetzt Demo anfordern',note:'Schätzung basierend auf unseren öffentlichen Tarifen vs. durchschnittlichen belgischen Markttarifen.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]};
T.de.cta={h:'Bereit, Ihre Sozialverwaltung zu modernisieren?',sub:'Erster Monat kostenlos · Sofortiger Zugang · Migrationsbegleitung',btn:'Jetzt starten →'};
T.de.cookie={text:'Diese Website verwendet Cookies zur Verbesserung Ihrer Erfahrung.',accept:'Akzeptieren',refuse:'Ablehnen',settings:'Einstellungen'};

// ═══════ STYLES ═══════
const G='#B8913A',G2='#D4A84C',INK='#0E0D0A',CREAM='#F9F6F0',BORDER='#E8E4DC',STONE='#56524A',MIST='#9A968E',WHITE='#fff';

const css=`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Cabinet+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
.vt-body{font-family:'Cabinet Grotesk',sans-serif;background:#fff;color:#0E0D0A;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.vt-body h1,.vt-body h2,.vt-body h3{font-family:'Fraunces',serif;font-weight:400;line-height:1.08;letter-spacing:-.02em}
.vt-body h1{font-size:clamp(36px,5.5vw,72px)}.vt-body h2{font-size:clamp(28px,3.8vw,50px)}.vt-body h3{font-size:clamp(20px,2.4vw,28px)}
.vt-body p{font-size:16px;line-height:1.75;color:#56524A;font-weight:300}.vt-body em{font-style:italic;color:#B8913A}
.vt-wrap{max-width:1200px;margin:0 auto;padding:0 36px}.vt-sec{padding:88px 0}
@media(max-width:768px){.vt-sec{padding:56px 0}.vt-wrap{padding:0 20px}}
.vt-ey{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:#B8913A;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}
.vt-ey::before{content:'';width:18px;height:2px;background:#B8913A;border-radius:1px}
.vt-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;border:1px solid #E8E4DC;color:#9A968E;background:#F9F6F0;font-family:'Fira Code',monospace}
.vt-tag-g{background:#EAF4EE;border-color:#9EC4B0;color:#1A5C42}
.vt-tag-au{background:#FBF3E2;border-color:#D4B870;color:#6A4E10}
.vt-tag-b{background:#EDF1F9;border-color:#9EB0D0;color:#18396A}
.btn-p{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:#0E0D0A;color:#fff;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 20px rgba(14,13,10,.18)}
.btn-p:hover{background:#252320;transform:translateY(-2px)}
.btn-s{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#0E0D0A;font-size:14px;font-weight:500;border:1.5px solid #E8E4DC;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}
.btn-s:hover{border-color:#0E0D0A;background:#F9F6F0}
.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:5px;background:linear-gradient(135deg,#B8913A,#D4A84C);color:#0E0D0A;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 24px rgba(184,145,58,.4)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(184,145,58,.5)}
.btn-ow{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#fff;font-size:14px;font-weight:500;border:1.5px solid rgba(255,255,255,.3);cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}
.btn-ow:hover{background:rgba(255,255,255,.1)}
.ldot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:ldpulse 2s infinite;display:inline-block}
@keyframes ldpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
.hero-dots{position:absolute;inset:0;pointer-events:none;opacity:.15;background-image:radial-gradient(rgba(255,255,255,.6) 1px,transparent 1px);background-size:28px 28px}
.hero-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(184,145,58,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 80% at 10% 80%,rgba(26,92,66,.1) 0%,transparent 60%)}
.hs-strip{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.08)}
.hs-i{padding:24px 28px;border-right:1px solid rgba(255,255,255,.07)}.hs-i:last-child{border-right:none}
.hs-v{font-family:'Fraunces',serif;font-size:clamp(24px,3vw,40px);color:#fff;line-height:1;margin-bottom:6px}.hs-v span{color:#D4A84C}
.hs-l{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.06em;text-transform:uppercase;font-weight:500}
@media(max-width:640px){.hs-strip{grid-template-columns:repeat(2,1fr)}.hs-i:nth-child(2){border-right:none}.hs-i:nth-child(3){border-right:1px solid rgba(255,255,255,.07)}}
/* Mockup dashboard */
.mockup-screen{background:#1A1917;border-radius:12px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08);position:relative}
.mockup-bar{background:#252320;padding:10px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06)}
.mockup-dot{width:10px;height:10px;border-radius:50%}
.mockup-body{padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mockup-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:16px}
.mockup-stat{font-family:'Fraunces',serif;font-size:28px;color:#D4A84C;margin-bottom:4px}
.mockup-label{font-size:11px;color:rgba(255,255,255,.35);letter-spacing:.06em;text-transform:uppercase}
.mockup-bar-chart{display:flex;align-items:flex-end;gap:4px;height:48px;margin-top:12px}
.mbc{border-radius:3px 3px 0 0;width:100%;background:linear-gradient(180deg,#B8913A,rgba(184,145,58,.2));animation:mbc-grow .8s ease both}
@keyframes mbc-grow{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
.mockup-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:99px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);font-size:11px;color:#86efac;margin-bottom:8px}
/* Sol grid */
.sol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.sol-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.sol-grid{grid-template-columns:1fr}}
.sol-card{background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:32px 28px;cursor:pointer;transition:all .28s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px}
.sol-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#B8913A,transparent);transform:scaleX(0);transform-origin:left;transition:transform .32s}
.sol-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-4px)}.sol-card:hover::after{transform:scaleX(1)}
.sol-card.featured{background:#0E0D0A;border-color:#0E0D0A}.sol-card.featured h4,.sol-card.featured .sdesc{color:rgba(255,255,255,.85)}.sol-card.featured p{color:rgba(255,255,255,.5)}
.sol-ico{width:48px;height:48px;border-radius:10px;background:#F1EDE6;border:1px solid #E8E4DC;display:flex;align-items:center;justify-content:center;font-size:22px}
.sol-card.featured .sol-ico{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.15)}
.sol-card h4{font-size:17px;font-weight:700;color:#0E0D0A;line-height:1.3;font-family:'Cabinet Grotesk',sans-serif}.sdesc{font-size:14px;color:#56524A;line-height:1.7;flex:1}
.slink{font-size:13px;font-weight:600;color:#B8913A;display:flex;align-items:center;gap:5px}.sol-card.featured .slink{color:#D4A84C}
/* Logos */
.logo-strip{display:flex;align-items:center;gap:0;overflow:hidden;position:relative}
.logo-track{display:flex;gap:0;animation:logo-scroll 20s linear infinite}
.logo-track:hover{animation-play-state:paused}
.logo-item{padding:20px 36px;border-right:1px solid #E8E4DC;white-space:nowrap;font-size:15px;font-weight:600;color:#9A968E;letter-spacing:.04em;flex-shrink:0;transition:color .2s}
.logo-item:hover{color:#0E0D0A}
@keyframes logo-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
/* Testimonials */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:900px){.testi-grid{grid-template-columns:1fr}}
.testi-card{background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:32px;position:relative;transition:all .28s}
.testi-card:hover{box-shadow:0 12px 48px rgba(14,13,10,.1);transform:translateY(-4px)}
.testi-stars{display:flex;gap:3px;margin-bottom:16px}.star{color:#D4A84C;font-size:16px}
.testi-text{font-size:15px;color:#56524A;line-height:1.8;font-style:italic;margin-bottom:20px}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.testi-name{font-size:14px;font-weight:700;color:#0E0D0A}.testi-role{font-size:12px;color:#9A968E}
.testi-quote{position:absolute;top:24px;right:24px;font-size:48px;font-family:'Fraunces',serif;color:#E8E4DC;line-height:1}
/* ROI Calculator */
.roi-wrap{background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:36px;box-shadow:0 8px 40px rgba(14,13,10,.08)}
.roi-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:linear-gradient(to right,#B8913A var(--pct,50%),#E8E4DC var(--pct,50%));outline:none;cursor:pointer}
.roi-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#0E0D0A;border:3px solid #B8913A;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.roi-result{background:linear-gradient(135deg,#0E0D0A,#252320);border-radius:12px;padding:28px;color:#fff;text-align:center}
.roi-saving{font-family:'Fraunces',serif;font-size:clamp(36px,5vw,56px);color:#D4A84C;line-height:1;margin:8px 0}
/* Articles */
.tc{background:#fff;border:1px solid #E8E4DC;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .25s}
.tc:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.tc-img{height:160px;background:#F1EDE6;display:flex;align-items:center;justify-content:center;font-size:48px;border-bottom:1px solid #E8E4DC}
.tc-body{padding:20px}.tc-tag{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B8913A;margin-bottom:8px;display:block}
.tc h4{font-size:15px;font-weight:600;color:#0E0D0A;margin-bottom:8px;line-height:1.4;font-family:'Cabinet Grotesk',sans-serif}
.tc p{font-size:13px;color:#56524A;line-height:1.65}.tc-cta{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#B8913A;margin-top:14px}
.tc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.tc-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.tc-grid{grid-template-columns:1fr}}
.ttab{padding:9px 20px;border-radius:99px;font-size:14px;font-weight:500;color:#56524A;border:1.5px solid #E8E4DC;background:transparent;cursor:pointer;transition:all .2s;font-family:'Cabinet Grotesk',sans-serif}
.ttab.active,.ttab:hover{background:#0E0D0A;color:#fff;border-color:#0E0D0A}
/* Newsletter */
.nl-in{flex:1;min-width:220px;padding:13px 18px;border-radius:5px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-family:'Cabinet Grotesk',sans-serif;font-size:15px;outline:none;transition:border-color .2s}
.nl-in::placeholder{color:rgba(255,255,255,.35)}.nl-in:focus{border-color:#B8913A}
/* Misc */
.ic{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.ic{grid-template-columns:1fr 1fr}}@media(max-width:560px){.ic{grid-template-columns:1fr}}
.ic-c{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;transition:all .25s}
.ic-c:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.step{display:grid;grid-template-columns:56px 1fr;gap:24px;padding:32px 0;border-bottom:1px solid #E8E4DC}
.step:last-child{border-bottom:none}
.step-n{width:48px;height:48px;border-radius:50%;background:#0E0D0A;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:20px;flex-shrink:0;margin-top:2px}
.eg{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
@media(max-width:700px){.eg{grid-template-columns:1fr}}
.eg-c{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;display:flex;gap:18px;align-items:flex-start;transition:all .25s}
.eg-c:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.faq-i{border-bottom:1px solid #E8E4DC}
.faq-q{width:100%;padding:20px 0;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:600;color:#0E0D0A;text-align:left;gap:16px;transition:color .2s}
.faq-q:hover{color:#B8913A}.faq-arr{font-size:20px;color:#9A968E;transition:transform .3s,color .2s;flex-shrink:0}
.faq-open .faq-arr{transform:rotate(45deg);color:#B8913A}
.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease}
.dk-card{background:#0E0D0A;border-radius:16px;padding:32px;color:#fff;position:relative;overflow:hidden}
.dk-card::before{content:'';position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(184,145,58,.2) 0%,transparent 70%)}
.ch{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:10px;border:1px solid #E8E4DC;background:#F9F6F0;transition:all .22s;cursor:pointer;margin-bottom:12px}
.ch:hover{border-color:#B8913A;background:#FBF3E2}
.fi,.fse,.fta{padding:11px 14px;border-radius:5px;border:1.5px solid #E8E4DC;background:#F9F6F0;font-family:'Cabinet Grotesk',sans-serif;font-size:14px;color:#0E0D0A;transition:all .2s;outline:none;width:100%}
.fi:focus,.fse:focus,.fta:focus{border-color:#B8913A;background:#fff;box-shadow:0 0 0 3px rgba(184,145,58,.1)}
.fta{resize:vertical;min-height:100px}.fse{appearance:none;cursor:pointer}
.phg{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
@media(max-width:800px){.phg{grid-template-columns:1fr;gap:36px}}
.ftg{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
@media(max-width:900px){.ftg{grid-template-columns:1fr 1fr;gap:28px}}@media(max-width:560px){.ftg{grid-template-columns:1fr}}
.lang-btn{padding:5px 10px;border-radius:5px;font-size:12px;font-weight:700;border:1.5px solid transparent;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all .2s;background:transparent;color:rgba(255,255,255,.5)}
.lang-btn.active{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.lang-btn:hover{color:#fff}
/* Scroll animations */
.fade-in{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.fade-in.visible{opacity:1;transform:translateY(0)}
.fade-in-delay-1{transition-delay:.1s}.fade-in-delay-2{transition-delay:.2s}.fade-in-delay-3{transition-delay:.3s}
/* Cookie banner */
.cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0E0D0A;border-top:1px solid rgba(255,255,255,.1);padding:18px 36px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;box-shadow:0 -8px 40px rgba(0,0,0,.3)}
@media(max-width:640px){.cookie-banner{padding:16px 20px;flex-direction:column;align-items:flex-start}}
/* Sticky CTA */
.sticky-cta{position:fixed;bottom:80px;right:28px;z-index:500;opacity:0;transform:translateY(20px);transition:all .4s ease;pointer-events:none}
.sticky-cta.show{opacity:1;transform:translateY(0);pointer-events:auto}
`;

// ═══════ COMPONENTS ═══════
const Arr = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;

function useFadeIn() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

function CookieBanner({t}) {
  const[show,setShow]=useState(false);
  useEffect(()=>{ if(!localStorage.getItem('ck_consent')) setShow(true); },[]);
  const accept=()=>{ localStorage.setItem('ck_consent','1'); setShow(false); };
  const refuse=()=>{ localStorage.setItem('ck_consent','0'); setShow(false); };
  if(!show) return null;
  return(
    <div className="cookie-banner">
      <p style={{fontSize:14,color:'rgba(255,255,255,.7)',margin:0,flex:1}}>{t.cookie.text}</p>
      <div style={{display:'flex',gap:10,flexShrink:0}}>
        <button onClick={refuse} style={{padding:'8px 16px',borderRadius:5,background:'transparent',color:'rgba(255,255,255,.5)',border:'1px solid rgba(255,255,255,.2)',cursor:'pointer',fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif"}}>{t.cookie.refuse}</button>
        <button onClick={accept} className="btn-gold" style={{padding:'8px 18px',fontSize:13}}>{t.cookie.accept}</button>
      </div>
    </div>
  );
}

function StickyCTA({t,go,show}) {
  return(
    <div className={`sticky-cta${show?' show':''}`}>
      <button className="btn-gold" onClick={()=>go('contact')} style={{boxShadow:'0 8px 32px rgba(184,145,58,.5)',whiteSpace:'nowrap'}}>
        {t.nav.demo} <Arr/>
      </button>
    </div>
  );
}

function MockupDashboard() {
  return(
    <div className="mockup-screen">
      <div className="mockup-bar">
        <div className="mockup-dot" style={{background:'#FF5F57'}}/>
        <div className="mockup-dot" style={{background:'#FFBD2E'}}/>
        <div className="mockup-dot" style={{background:'#28C840'}}/>
        <div style={{flex:1,textAlign:'center',fontSize:11,color:'rgba(255,255,255,.3)',letterSpacing:'.04em'}}>app.aureussocial.be — Dashboard</div>
      </div>
      <div style={{padding:20,background:'#1A1917'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div><div style={{fontSize:10,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>AUREUS SOCIAL PRO</div><div style={{fontSize:14,fontWeight:600,color:'#fff'}}>Tableau de bord</div></div>
          <div className="mockup-badge"><span className="ldot"/> Live</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          {[['1 274','Fiches de paie','📄'],['392','Déclarations ONSS','📋'],['42','Entreprises','🏢'],['99.97%','Uptime','⚡']].map(([v,l,i])=>(
            <div key={l} className="mockup-card">
              <div style={{fontSize:16,marginBottom:6}}>{i}</div>
              <div className="mockup-stat">{v}</div>
              <div className="mockup-label">{l}</div>
            </div>
          ))}
        </div>
        <div className="mockup-card">
          <div style={{fontSize:11,color:'rgba(255,255,255,.3)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:10}}>Paie Q1 2026</div>
          <div className="mockup-bar-chart">
            {[45,72,58,88,65,92,78,96,71,85,90,100].map((h,i)=>(
              <div key={i} className="mbc" style={{height:`${h}%`,animationDelay:`${i*0.05}s`}}/>
            ))}
          </div>
        </div>
        <div style={{marginTop:10,display:'flex',gap:6}}>
          {[{l:'Dimona',c:'#22C55E',v:'8 min ago'},{l:'DmfA Q1',c:'#D4A84C',v:'Ready'},{l:'Belcotax',c:'#60A5FA',v:'Due Apr 5'}].map(({l,c,v})=>(
            <div key={l} style={{flex:1,background:'rgba(255,255,255,.05)',borderRadius:6,padding:'10px',border:`1px solid ${c}30`}}>
              <div style={{fontSize:10,color:c,fontWeight:700,letterSpacing:'.08em',marginBottom:3}}>{l}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoStrip({t}) {
  const items=[...t.logos.items,...t.logos.items];
  return(
    <section style={{padding:'28px 0',borderBottom:`1px solid ${BORDER}`,overflow:'hidden'}}>
      <div className="vt-wrap" style={{marginBottom:12}}>
        <div style={{fontSize:12,color:MIST,textAlign:'center',letterSpacing:'.08em',textTransform:'uppercase',fontWeight:600}}>{t.logos.title}</div>
      </div>
      <div className="logo-strip">
        <div className="logo-track">
          {items.map((item,i)=>(
            <div key={i} className="logo-item">{item}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({t}) {
  useFadeIn();
  return(
    <section className="vt-sec" style={{background:CREAM}}>
      <div className="vt-wrap">
        <div style={{textAlign:'center',marginBottom:56}} className="fade-in">
          <div className="vt-ey">{t.testimonials.ey}</div>
          <h2>{t.testimonials.title}</h2>
        </div>
        <div className="testi-grid">
          {t.testimonials.items.map((item,i)=>(
            <div key={i} className={`testi-card fade-in fade-in-delay-${i+1}`}>
              <div className="testi-quote">"</div>
              <div className="testi-stars">{Array(item.stars).fill(0).map((_,j)=>(<span key={j} className="star">★</span>))}</div>
              <p className="testi-text">"{item.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{background:item.color}}>{item.initials}</div>
                <div><div className="testi-name">{item.name}</div><div className="testi-role">{item.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoiCalculator({t,go}) {
  const[emp,setEmp]=useState(5);
  const[provIdx,setProvIdx]=useState(0);
  const roi=t.roi;
  const tierPrices={0:[42,68,95],1:[38,62,88],2:[40,65,90],3:[35,58,82],4:[38,62,88]};
  const aureusPrices=[15,25,38];
  const prov=tierPrices[provIdx]||tierPrices[0];
  const tier=emp<=3?0:emp<=15?1:2;
  const currentCost=emp*prov[tier];
  const aureusCost=emp*aureusPrices[tier];
  const monthly=currentCost-aureusCost;
  const annual=monthly*12;
  const months=annual>0?Math.round(aureusCost/monthly):0;
  const pct=Math.round(((emp-1)/49)*100);
  useFadeIn();
  return(
    <section className="vt-sec">
      <div className="vt-wrap">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'start'}}>
          <div className="fade-in">
            <div className="vt-ey">{roi.ey}</div>
            <h2 style={{whiteSpace:'pre-line'}}>{roi.title}</h2>
            <p style={{margin:'16px 0 32px',fontSize:17}}>{roi.sub}</p>
            <div style={{marginBottom:24}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <label style={{fontSize:14,fontWeight:600,color:INK}}>{roi.employees}</label>
                <span style={{fontFamily:"'Fraunces',serif",fontSize:20,color:G}}>{emp}</span>
              </div>
              <input type="range" min="1" max="50" value={emp} onChange={e=>setEmp(+e.target.value)}
                className="roi-slider" style={{'--pct':`${pct}%`}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:MIST,marginTop:4}}><span>1</span><span>50</span></div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:14,fontWeight:600,color:INK,display:'block',marginBottom:8}}>{roi.current}</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {roi.providers.map((p,i)=>(
                  <button key={p} onClick={()=>setProvIdx(i)}
                    style={{padding:'8px 16px',borderRadius:5,border:`1.5px solid ${provIdx===i?INK:BORDER}`,background:provIdx===i?INK:WHITE,color:provIdx===i?WHITE:STONE,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",transition:'all .2s'}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:'20px',background:CREAM,borderRadius:10,border:`1px solid ${BORDER}`}}>
              {[[roi.providers[provIdx],`${currentCost}€/mois`,'#EF4444'],['Aureus Social Pro',`${aureusCost}€/mois`,'#22C55E']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:12,color:MIST,marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c,fontFamily:"'Fraunces',serif"}}>{v}</div></div>
              ))}
            </div>
          </div>
          <div className="fade-in fade-in-delay-1">
            <div className="roi-result">
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>{roi.result.saving}</div>
              <div className="roi-saving">{annual>0?`${annual.toLocaleString('fr-BE')} €`:'—'}</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:24}}>{monthly>0?`${monthly.toLocaleString('fr-BE')} € ${roi.result.per}`:''}</div>
              {annual>0&&<div style={{background:'rgba(255,255,255,.07)',borderRadius:8,padding:'16px',marginBottom:20}}>
                <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:4}}>{roi.result.months}</div>
                <div style={{fontSize:24,fontWeight:700,color:G2,fontFamily:"'Fraunces',serif"}}>{months} mois</div>
              </div>}
              <button className="btn-gold" style={{width:'100%',justifyContent:'center'}} onClick={()=>go('contact')}>{roi.result.cta} <Arr/></button>
            </div>
            <p style={{fontSize:11,color:MIST,marginTop:12,lineHeight:1.6,textAlign:'center'}}>{roi.result.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter({t,go}) {
  const[email,setEmail]=useState('');const[sent,setSent]=useState(false);const nw=t.nw;
  return(
    <section style={{background:INK,padding:'72px 0'}}>
      <div className="vt-wrap">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div className="vt-ey" style={{color:G2}}>{nw.ey}</div>
            <h2 style={{color:'#fff',marginBottom:16}}>{nw.h}</h2>
            <p style={{color:'rgba(255,255,255,.5)',marginBottom:28}}>{nw.sub}</p>
            {sent?(<div style={{padding:'14px 20px',borderRadius:10,background:'rgba(34,197,94,.15)',border:'1px solid rgba(34,197,94,.3)',color:'#86efac',fontSize:15}}>{nw.ok}</div>):(<>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <input className="nl-in" type="email" placeholder={nw.ph} value={email} onChange={e=>setEmail(e.target.value)}/>
                <button className="btn-gold" onClick={()=>{if(email)setSent(true);}}>{nw.btn}</button>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:10,lineHeight:1.6}}>{nw.note}</p>
            </>)}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {nw.feats.map(([ico,tt,d])=>(
              <div key={tt} style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{width:32,height:32,borderRadius:7,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{ico}</div>
                <div><div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:2}}>{tt}</div><div style={{fontSize:13,color:'rgba(255,255,255,.45)'}}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({h,sub,btn,go}) {
  return(
    <div style={{background:INK,padding:'72px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 120% at 50% 100%,rgba(184,145,58,.1) 0%,transparent 70%)'}}/>
      <div style={{position:'relative',zIndex:1}} className="vt-wrap">
        <h2 style={{color:'#fff',marginBottom:14}}>{h}</h2>
        <p style={{color:'rgba(255,255,255,.5)',maxWidth:440,margin:'0 auto 32px',fontSize:17}}>{sub}</p>
        <button className="btn-gold" onClick={()=>go('contact')}>{btn}</button>
      </div>
    </div>
  );
}

function Footer({t,go}) {
  const ft=t.ft;
  return(
    <footer style={{background:INK,padding:'60px 0 0'}}>
      <div className="vt-wrap">
        <div className="ftg">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:14}} onClick={()=>go('home')}>
              <div style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg>
              </div>
              <div><div style={{fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'.04em'}}>AUREUS</div><div style={{fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:'.2em',textTransform:'uppercase'}}>Social Pro</div></div>
            </div>
            <p style={{fontSize:14,color:'rgba(255,255,255,.4)',lineHeight:1.7,marginBottom:14,maxWidth:260}}>Secrétariat social numérique belge. 132 modules, 166 CP.</p>
            <div style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:'rgba(255,255,255,.2)'}}>{t.topbar.bce} · Saint-Gilles</div>
          </div>
          {[[ft.col1,ft.c1],[ft.col2,ft.c2],[ft.col3,ft.c3]].map(([title,links])=>(
            <div key={title}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:12}}>{title}</div>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {links.map(([label,page])=>(
                  <a key={label} onClick={()=>page&&go(page)} style={{fontSize:14,color:'rgba(255,255,255,.45)',cursor:'pointer',transition:'color .18s'}}
                    onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.45)'}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,.25)'}}>{ft.copy}</span>
          <div style={{display:'flex',gap:16}}>{ft.links.map(l=>(<a key={l} style={{fontSize:12,color:'rgba(255,255,255,.25)',cursor:'pointer'}}>{l}</a>))}</div>
        </div>
      </div>
    </footer>
  );
}

function DkCard({label,title,sub,stats}) {
  return(
    <div className="dk-card">
      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:G,marginBottom:16}}>{label}</div>
      <h3 style={{color:'#fff',fontSize:20,marginBottom:8}}>{title}</h3>
      <p style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>{sub}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {stats.map(([v,l])=>(<div key={l}><div style={{fontFamily:"'Fraunces',serif",fontSize:26,color:G,marginBottom:2}}>{v}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)',letterSpacing:'.04em'}}>{l}</div></div>))}
      </div>
    </div>
  );
}

// ═══════ PAGES ═══════
function PageHome({t,go}) {
  const[filter,setFilter]=useState('tout');
  useFadeIn();
  const art=t.art;const sol=t.sol;const hero=t.hero;const mockup=t.mockup;
  const vis=art.items.filter(a=>filter==='tout'||a.cat===filter);
  return(<>
    {/* HERO */}
    <section style={{background:INK,padding:'80px 0 0',position:'relative',overflow:'hidden',minHeight:560,display:'flex',flexDirection:'column'}}>
      <div className="hero-glow"/><div className="hero-dots"/>
      <div className="vt-wrap" style={{position:'relative',zIndex:1,flex:1,display:'flex',alignItems:'center',paddingBottom:0}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',width:'100%'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:99,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:24}}>
              <span className="ldot"/>&nbsp;{hero.badge}
            </div>
            <h1 style={{color:'#fff',marginBottom:20,whiteSpace:'pre-line'}}>
              {hero.h1.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}
            </h1>
            <p style={{fontSize:18,color:'rgba(255,255,255,.6)',marginBottom:36,lineHeight:1.7,fontWeight:300,maxWidth:480}}>{hero.sub}</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:40}}>
              <button className="btn-gold" onClick={()=>go('app')}>{hero.cta1} <Arr/></button>
              <button className="btn-ow" onClick={()=>go('contact')}>{hero.cta2}</button>
            </div>
            <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
              {[['✓','Dimona < 8s'],['✓','166 CP belges'],['✓','RGPD conforme']].map(([ic,l])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(255,255,255,.5)'}}>
                  <span style={{color:'#22C55E',fontWeight:700}}>{ic}</span>{l}
                </div>
              ))}
            </div>
          </div>
          <div style={{position:'relative'}}>
            <div style={{position:'absolute',inset:-20,background:'radial-gradient(ellipse at center,rgba(184,145,58,.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
            <MockupDashboard/>
            <div style={{position:'absolute',top:-16,right:-16,background:INK,border:`1px solid ${G}`,borderRadius:10,padding:'12px 16px',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>
              <div style={{fontSize:10,color:MIST,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Dimona IN</div>
              <div style={{fontSize:14,fontWeight:700,color:'#22C55E'}}>✓ Soumise — 7.2s</div>
            </div>
          </div>
        </div>
      </div>
      <div className="hs-strip">
        {hero.stats.map(([v,l])=>(<div key={l} className="hs-i"><div className="hs-v"><span>{v}</span></div><div className="hs-l">{l}</div></div>))}
      </div>
    </section>

    {/* LOGOS */}
    <LogoStrip t={t}/>

    {/* SOLUTIONS */}
    <section className="vt-sec" style={{background:CREAM}}>
      <div className="vt-wrap">
        <div style={{marginBottom:48}} className="fade-in">
          <div className="vt-ey">{sol.ey}</div>
          <h2>{sol.h}</h2>
          <p style={{maxWidth:520,marginTop:12}}>{sol.sub}</p>
        </div>
        <div className="sol-grid">
          {sol.items.map((s,i)=>(<div key={s.title} className={`sol-card fade-in fade-in-delay-${(i%3)+1}${s.featured?' featured':''}`} onClick={()=>go(s.page)}><div className="sol-ico">{s.ico}</div><h4>{s.title}</h4><p className="sdesc">{s.desc}</p><div className="slink">{t.discover} <Arr/></div></div>))}
        </div>
      </div>
    </section>

    {/* TESTIMONIALS */}
    <Testimonials t={t}/>

    {/* ROI CALCULATOR */}
    <RoiCalculator t={t} go={go}/>

    {/* ARTICLES */}
    <section className="vt-sec">
      <div className="vt-wrap">
        <div style={{marginBottom:32}} className="fade-in">
          <div className="vt-ey">{art.ey}</div>
          <h2>{art.h}</h2>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:40}}>
          {art.filters.map(([k,l])=>(<button key={k} className={`ttab${filter===k?' active':''}`} onClick={()=>setFilter(k)}>{l}</button>))}
        </div>
        <div className="tc-grid">
          {vis.map(a=>(<div key={a.title} className="tc"><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{a.tag}</span><h4>{a.title}</h4><p>{a.desc}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}
        </div>
      </div>
    </section>

    <Newsletter t={t} go={go}/>
    <CtaBand h={t.cta.h} sub={t.cta.sub} btn={t.cta.btn} go={go}/>
    <Footer t={t} go={go}/>
  </>);
}

function PageInd({t,go}) {
  const d=t.ind;const[openFaq,setOpenFaq]=useState(null);useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div className="vt-ey">{d.ey}</div>
      <h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1>
      <p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div>
    </div><DkCard {...d.card}/></div></div></section>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.sy.ey}</div><h2>{d.sy.h}</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'start'}}>
        <div>{d.sy.steps.map(s=>(<div key={s.n} className="step"><div className="step-n">{s.n}</div><div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:17,fontWeight:700,color:INK,marginBottom:8}}>{s.t}</h4><p style={{fontSize:15}}>{s.b}</p><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{s.tags.map(tag=>(<span key={tag} className={`vt-tag ${s.tc}`}>{tag}</span>))}</div></div></div>))}</div>
        <div>
          <div style={{background:CREAM,border:`1px solid ${BORDER}`,borderRadius:10,padding:28,marginBottom:20}}><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,marginBottom:16}}>{d.sy.chkH}</h4>{d.sy.chk.map(item=>(<div key={item} style={{display:'flex',gap:10,fontSize:14,color:STONE,marginBottom:10}}><span style={{color:'#22C55E',flexShrink:0}}>✓</span>{item}</div>))}</div>
          <div style={{background:'#FBF3E2',border:'1px solid #D4B870',borderRadius:10,padding:24}}><div style={{fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7A5010',marginBottom:12}}>{d.sy.tip.h}</div><p style={{fontSize:14,color:'#5A3A0A',lineHeight:1.7}}>{d.sy.tip.t}</p></div>
        </div>
      </div>
    </div></section>
    <section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap">
      <div style={{textAlign:'center',marginBottom:48}} className="fade-in"><div className="vt-ey">{d.faq.ey}</div><h2>{d.faq.h}</h2></div>
      <div style={{maxWidth:720,margin:'0 auto'}}>{d.faq.items.map(([q,a],i)=>(<div key={i} className={`faq-i${openFaq===i?' faq-open':''}`}><button className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>{q}<span className="faq-arr">+</span></button><div className="faq-a" style={{maxHeight:openFaq===i?200:0}}><div style={{padding:'0 0 20px',fontSize:15,color:STONE,lineHeight:1.75}}>{a}</div></div></div>))}</div>
    </div></section>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageEmp({t,go}) {
  const d=t.emp;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div className="vt-ey">{d.ey}</div>
      <h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1>
      <p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('employeurs')}>{d.c2}</button></div>
    </div><DkCard {...d.card}/></div></div></section>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.steps.ey}</div><h2>{d.steps.h}</h2></div>
      <div style={{maxWidth:680}}>{d.steps.items.map(s=>(<div key={s.n} className="step"><div className="step-n">{s.n}</div><div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:17,fontWeight:700,color:INK,marginBottom:8}}>{s.t}</h4><p style={{fontSize:15}}>{s.b}</p><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{s.tags.map(tag=>(<span key={tag} className={`vt-tag ${s.tc}`}>{tag}</span>))}</div></div></div>))}</div>
    </div></section>
    <section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap">
      <div style={{textAlign:'center',marginBottom:48}} className="fade-in"><div className="vt-ey">{d.av.ey}</div><h2>{d.av.h}</h2></div>
      <div className="ic">{d.av.items.map(([ico,tt,desc])=>(<div key={tt} className="ic-c"><div style={{fontSize:28,marginBottom:14}}>{ico}</div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,fontWeight:700,color:INK,marginBottom:8}}>{tt}</h4><p style={{fontSize:14}}>{desc}</p></div>))}</div>
    </div></section>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageEmps({t,go}) {
  const d=t.emps;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div className="vt-ey">{d.ey}</div>
      <h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1>
      <p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('app')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div>
    </div><DkCard {...d.card}/></div></div></section>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.mods.ey}</div><h2>{d.mods.h}</h2></div>
      <div className="ic">{d.mods.items.map(([ico,tt,desc])=>(<div key={tt} className="ic-c"><div style={{fontSize:28,marginBottom:14}}>{ico}</div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,fontWeight:700,color:INK,marginBottom:8}}>{tt}</h4><p style={{fontSize:14}}>{desc}</p></div>))}</div>
    </div></section>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageExp({t,go}) {
  const d=t.exp;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div className="vt-ey">{d.ey}</div>
      <h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1>
      <p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div>
    </div><DkCard {...d.card}/></div></div></section>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.it.ey}</div><h2>{d.it.h}</h2></div>
      <div className="eg">{d.it.list.map(([n,tt,desc])=>(<div key={n} className="eg-c"><div style={{fontFamily:"'Fraunces',serif",fontSize:36,color:CREAM,lineHeight:1,flexShrink:0,width:44}}>{n}</div><div><div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:6,fontFamily:"'Cabinet Grotesk',sans-serif"}}>{tt}</div><div style={{fontSize:14,color:STONE,lineHeight:1.7}}>{desc}</div></div></div>))}</div>
    </div></section>
    <section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap">
      <div style={{textAlign:'center',marginBottom:48}} className="fade-in"><div className="vt-ey">{d.mig.ey}</div><h2>{d.mig.h}</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,maxWidth:900,margin:'0 auto'}}>
        {d.mig.steps.map(([ico,tt,desc])=>(<div key={tt} style={{textAlign:'center',padding:'24px 16px',background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10}}><div style={{fontSize:28,marginBottom:12}}>{ico}</div><div style={{fontWeight:700,fontSize:14,color:INK,marginBottom:6}}>{tt}</div><div style={{fontSize:13,color:STONE}}>{desc}</div></div>))}
      </div>
    </div></section>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageForm({t,go}) {
  const d=t.form;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div className="vt-ey">{d.ey}</div>
      <h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1>
      <p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div>
    </div><DkCard {...d.card}/></div></div></section>
    <section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.mods.ey}</div><h2>{d.mods.h}</h2></div>
      <div className="sol-grid">{d.mods.items.map(m=>(<div key={m.t} className={`sol-card${m.f?' featured':''}`} onClick={()=>go('contact')}><div className="sol-ico">{m.ico}</div><h4>{m.t}</h4><p className="sdesc">{m.d}</p><div className="slink">{t.discover} <Arr/></div></div>))}</div>
    </div></section>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{marginBottom:48}} className="fade-in"><div className="vt-ey">{d.arts.ey}</div><h2>{d.arts.h}</h2></div>
      <div className="tc-grid">{d.arts.items.map(a=>(<div key={a.t} className="tc"><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{a.tag}</span><h4>{a.t}</h4><p>{a.d}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}</div>
    </div></section>
    <Newsletter t={t} go={go}/>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageCon({t,go,lang}) {
  const d=t.con;
  const[sent,setSent]=useState(false);
  const[loading,setLoading]=useState(false);
  const[errMsg,setErrMsg]=useState('');
  const rPrenom=useRef(null),rNom=useRef(null),rEmail=useRef(null),rSociete=useRef(null),rRole=useRef(null),rMsg=useRef(null);
  useFadeIn();

  const handleSubmit=async()=>{
    const prenom=rPrenom.current?.value?.trim();
    const email=rEmail.current?.value?.trim();
    if(!prenom||!email){setErrMsg('Prénom et e-mail sont requis.');return;}
    setLoading(true);setErrMsg('');
    try{
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prenom,nom:rNom.current?.value,email,societe:rSociete.current?.value,role:rRole.current?.value,message:rMsg.current?.value,lang})});
      if(res.ok){setSent(true);}else{setErrMsg("Erreur lors de l'envoi. Veuillez réessayer.");}
    }catch(e){setErrMsg('Erreur réseau. Veuillez réessayer.');}
    setLoading(false);
  };

  return(<>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.3fr',gap:72,alignItems:'start'}}>
        <div className="fade-in">
          <div className="vt-ey">{d.ey}</div>
          <h2 style={{whiteSpace:'pre-line'}}>{d.h}</h2>
          <p style={{margin:'16px 0 28px',fontSize:17}}>{d.sub}</p>
          {d.ch.map(([ico,l,v])=>(<div key={l} className="ch"><div style={{width:40,height:40,borderRadius:9,background:WHITE,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{ico}</div><div><div style={{fontSize:13,fontWeight:600,color:INK,marginBottom:2}}>{l}</div><div style={{fontSize:14,color:STONE}}>{v}</div></div></div>))}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
            {d.cr.map(([l,v])=>(<div key={l} style={{background:CREAM,border:`1px solid ${BORDER}`,borderRadius:5,padding:14}}><div style={{fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:MIST,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Fira Code',monospace",fontSize:12,color:INK}}>{v}</div></div>))}
          </div>
        </div>
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:'36px 32px',boxShadow:'0 8px 40px rgba(14,13,10,.12)'}} className="fade-in fade-in-delay-1">
          <div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:INK,marginBottom:6,fontWeight:400}}>{d.f.t}</div>
          <div style={{fontSize:14,color:MIST,marginBottom:28}}>{d.f.s}</div>
          {sent?(<div style={{padding:'20px',borderRadius:10,background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',color:'#166534',fontSize:16,textAlign:'center'}}>{d.f.ok}</div>):(<>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.fn}</label><input ref={rPrenom} className="fi" type="text" placeholder={d.f.fnp}/></div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ln}</label><input ref={rNom} className="fi" type="text" placeholder={d.f.lnp}/></div>
              <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.em}</label><input ref={rEmail} className="fi" type="email" placeholder={d.f.emp}/></div>
              <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.co}</label><input ref={rSociete} className="fi" type="text" placeholder={d.f.cop}/></div>
              <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ro}</label><select ref={rRole} className="fse">{d.f.roles.map(o=>(<option key={o}>{o}</option>))}</select></div>
              <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ms}</label><textarea ref={rMsg} className="fta" placeholder={d.f.msp}/></div>
            </div>
            {errMsg&&<div style={{marginTop:10,padding:'10px 14px',borderRadius:6,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',color:'#b91c1c',fontSize:13}}>{errMsg}</div>}
            <button onClick={handleSubmit} disabled={loading} style={{width:'100%',marginTop:14,padding:14,borderRadius:5,border:'none',background:loading?'#9A968E':INK,color:WHITE,fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:15,fontWeight:600,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .22s'}}
              onMouseOver={e=>{if(!loading)e.currentTarget.style.background='#252320';}} onMouseOut={e=>{if(!loading)e.currentTarget.style.background=INK;}}>
              {loading?'Envoi en cours…':<>{d.f.sub} <Arr/></>}
            </button>
            <p style={{fontSize:11,color:MIST,textAlign:'center',marginTop:10,lineHeight:1.6}}>{d.f.note}</p>
          </>)}
        </div>
      </div>
    </div></section>
    <Footer t={t} go={go}/>
  </>);
}

const PAGES={home:PageHome,independant:PageInd,employeur:PageEmp,employeurs:PageEmps,experts:PageExp,formations:PageForm,contact:PageCon};

export default function VitrinePage() {
  const[page,setPage]=useState('home');
  const[lang,setLang]=useState('fr');
  const[openMega,setOpenMega]=useState(null);
  const[scrolled,setScrolled]=useState(false);
  const[showSticky,setShowSticky]=useState(false);
  const navRef=useRef(null);
  const t=T[lang]||T.fr;

  const go=(p)=>{
    if(p==='app'){window.location.href='/login';return;}
    setPage(p);setOpenMega(null);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  useEffect(()=>{
    const onScroll=()=>{
      setScrolled(window.scrollY>10);
      setShowSticky(window.scrollY>400);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[]);

  useEffect(()=>{
    const h=(e)=>{if(navRef.current&&!navRef.current.contains(e.target))setOpenMega(null);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  const PageComp=PAGES[page]||PageHome;

  return(
    <div className="vt-body">
      <style dangerouslySetInnerHTML={{__html:css}}/>

      {/* TOPBAR */}
      <div style={{background:INK,height:36,display:'flex',alignItems:'center',position:'fixed',top:0,left:0,right:0,zIndex:400}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 36px',display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>{t.topbar.country} &nbsp;·&nbsp; <strong style={{color:'rgba(255,255,255,.8)'}}>{t.topbar.bce}</strong></span>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            {['fr','nl','en','de'].map(l=>(<button key={l} className={`lang-btn${lang===l?' active':''}`} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>))}
            <div style={{width:1,height:14,background:'rgba(255,255,255,.15)',margin:'0 6px'}}/>
            <a onClick={()=>go('contact')} style={{fontSize:12,color:'rgba(255,255,255,.55)',cursor:'pointer'}}>{t.topbar.contact}</a>
            <div style={{width:1,height:14,background:'rgba(255,255,255,.15)'}}/>
            <a onClick={()=>go('app')} style={{fontSize:12,color:'rgba(255,255,255,.55)',cursor:'pointer'}}>{t.topbar.client}</a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav ref={navRef} style={{position:'fixed',top:36,left:0,right:0,zIndex:300,height:64,background:WHITE,borderBottom:`1px solid ${BORDER}`,boxShadow:scrolled?'0 2px 16px rgba(14,13,10,.07)':'none',transition:'box-shadow .3s'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 36px',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}} onClick={()=>go('home')}>
            <div style={{width:32,height:32,borderRadius:7,background:INK,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg>
            </div>
            <div><div style={{fontSize:14,fontWeight:700,color:INK,letterSpacing:'.04em',lineHeight:1}}>AUREUS</div><div style={{fontSize:8,color:MIST,letterSpacing:'.18em',textTransform:'uppercase'}}>Social Pro</div></div>
          </div>
          <div style={{display:'flex',alignItems:'stretch',height:64}}>
            {Object.entries(t.mega).map(([k,m])=>(
              <div key={k} style={{position:'relative',display:'flex',alignItems:'center'}}>
                <a onClick={()=>setOpenMega(openMega==k?null:k)} style={{padding:'0 14px',height:'100%',display:'flex',alignItems:'center',fontSize:14,fontWeight:500,color:openMega==k?INK:STONE,cursor:'pointer',borderBottom:openMega==k?`2px solid ${G}`:'2px solid transparent',transition:'all .18s',whiteSpace:'nowrap',userSelect:'none'}}>
                  {m.label} <span style={{fontSize:10,marginLeft:4,display:'inline-block',transform:openMega==k?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</span>
                </a>
                {openMega==k&&(
                  <div style={{position:'absolute',top:64,left:'50%',transform:'translateX(-50%)',background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,boxShadow:'0 24px 72px rgba(14,13,10,.18)',minWidth:480,padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,zIndex:500}}>
                    {m.items.map(([ico,tt,d,pg])=>(
                      <div key={tt} onClick={()=>go(pg)} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'12px 14px',borderRadius:6,cursor:'pointer',transition:'background .18s'}}
                        onMouseOver={e=>e.currentTarget.style.background=CREAM} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{width:34,height:34,borderRadius:8,background:CREAM,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{ico}</div>
                        <div><div style={{fontSize:14,fontWeight:600,color:INK,marginBottom:3}}>{tt}</div><div style={{fontSize:12,color:MIST,lineHeight:1.5}}>{d}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <button onClick={()=>go('app')} style={{padding:'8px 16px',borderRadius:5,fontSize:13,fontWeight:500,color:STONE,border:`1.5px solid ${BORDER}`,background:'transparent',cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",transition:'all .2s'}}
              onMouseOver={e=>{e.currentTarget.style.borderColor=INK;e.currentTarget.style.color=INK;}} onMouseOut={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=STONE;}}>
              {t.nav.login}
            </button>
            <button onClick={()=>go('contact')} style={{padding:'9px 18px',borderRadius:5,fontSize:13,fontWeight:600,color:WHITE,background:INK,border:'none',cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",transition:'all .22s',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}
              onMouseOver={e=>e.currentTarget.style.background='#252320'} onMouseOut={e=>e.currentTarget.style.background=INK}>
              {t.nav.demo} <Arr/>
            </button>
          </div>
        </div>
      </nav>

      <div style={{paddingTop:36+64}}>
        <PageComp t={t} go={go} lang={lang}/>
      </div>

      <StickyCTA t={t} go={go} show={showSticky&&page==='home'}/>
      <CookieBanner t={t}/>
    </div>
  );
}
