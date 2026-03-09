'use client';
import { useState, useEffect, useRef } from 'react';

// ═══════════════════ TRANSLATIONS ═══════════════════
const buildT = () => {
const fr = {
  topbar:{ country:'🇧🇪 Belgique', bce:'BCE BE 1028.230.781', contact:'Contact', client:'Espace client' },
  nav:{ demo:'Demander une démo', login:'Connexion' },
  langLabel:{ fr:'FR', nl:'NL', en:'EN', de:'DE' },
  mega:{
    1:{ label:'Indépendants', items:[['🚀',"Se lancer",'Statut, obligations, démarches ONSS','independant'],['🧮','Cotisations','Calcul et paiement des cotisations ONSS','independant'],['📋','Obligations','Dimona, DmfA, TVA, IPP','independant'],['🛡️','Protection sociale','Maladie, invalidité, pension','independant']] },
    2:{ label:'Devenir employeur', items:[['👤','Premier employé','Immatriculation ONSS, numéro entreprise','employeur'],['📄','Contrat de travail','CDI, CDD, temps partiel — modèles conformes','employeur'],['⚡','Dimona automatique','Déclaration IN/OUT en 8 secondes','employeur'],['💶','Premiers salaires','Calcul paie, fiches, SEPA pain.001','employeur']] },
    3:{ label:'Employeurs', items:[['🏢','Gestion de la paie','166 CP, barèmes, primes, ONSS','employeurs'],['📊','Déclarations trimestrielles','DmfA XML, Belcotax 281.10/20/30','employeurs'],['📁','Export comptable','WinBooks, BOB, Octopus, Exact Online','employeurs'],['🔐','Sécurité & RGPD','AES-256-GCM, audit trail, RLS','employeurs'],['👥','Portail employé','Fiches de paie, documents, congés','employeurs'],['✍️','Signature électronique','Yousign / DocuSign — valeur légale','employeurs']] },
    4:{ label:'Formations', items:[['📚','Droit social belge','ONSS, paie, Dimona','formations'],['🧮','Calcul de paie avancé','CP, barèmes, PP Annexe III','formations'],['🏛','DmfA & Belcotax','Déclarations trimestrielles pas à pas','formations'],['🚀','Onboarding Aureus Pro','Prise en main complète','formations']] },
    5:{ label:'Experts-comptables', items:[['🏛','Portail multi-clients','Gérez tous vos dossiers','experts'],['🔗','API REST + Webhooks','Intégration avec vos outils','experts'],['📤','Mandats ONSS','Génération automatique Mahis/CSAM','experts'],['🔄','Migration assistée','Depuis SD Worx, Partena…','experts']] },
  },
  discover:'Découvrir', readmore:'Lire',
  hero:{ badge:'Secrétariat social numérique — v18 en production', h1:'Votre partenaire\nsocial belge.\nEnfin numérique.', sub:"De la Dimona aux déclarations trimestrielles, de la fiche de paie à la signature électronique — tout ce dont vous avez besoin, en un seul endroit.", cta1:"Accéder à l'application", cta2:'Demander une démo', stats:[['166','Commissions paritaires'],['<8','Dimona (secondes)'],['132','Modules déployés'],['99.97%','Uptime']] },
  sol:{ ey:'Nos solutions', h:'Pour chaque profil, la bonne solution.', sub:"Indépendant, employeur ou expert-comptable — Aureus Social Pro s'adapte à votre réalité.", items:[
    {ico:'🚀',title:"Se lancer comme indépendant",desc:"Statut, affiliation ONSS, obligations — tout ce qu'il faut pour démarrer sereinement.",page:'independant'},
    {ico:'👤',title:"Devenir employeur",desc:"Immatriculation, contrat, Dimona, premiers salaires.",page:'employeur',featured:true},
    {ico:'🏢',title:"Employeurs",desc:"Automatisez la paie, DmfA, exports comptables pour vos équipes.",page:'employeurs'},
    {ico:'🏛',title:"Experts-comptables",desc:"Portail multi-clients, mandats Mahis/CSAM, API REST.",page:'experts'},
    {ico:'📊',title:"Déclarations & Belcotax",desc:"DmfA trimestrielle, fiches 281.10/20/30, MyMinfin.",page:'employeurs'},
    {ico:'📚',title:"Formations",desc:"Webinaires, guides pratiques sur le droit social belge.",page:'formations'},
  ]},
  art:{ ey:"Toujours prêt pour l'avenir", h:'Ressources & actualités', filters:[['tout','Tout'],['paie','Paie'],['rh','RH'],['legal','Législation'],['onss','ONSS']], items:[
    {cat:'paie',ico:'🧮',tag:'Paie',title:'Barèmes sectoriels 2026 : ce qui change',desc:'Mise à jour des 166 CP intégrée dans Aureus Social Pro avant le 1er janvier.'},
    {cat:'legal',ico:'⚖️',tag:'Législation',title:'Bonus emploi 2026 : nouveaux plafonds',desc:"Le plafond salarial a été révisé. Impact sur vos calculs."},
    {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026 : délai et nouveautés',desc:'Date limite, nouveaux codes travailleurs et réduction structurelle.'},
    {cat:'rh',ico:'👥',tag:'RH',title:'Portail employé : fiches, documents, congés',desc:'Vos collaborateurs accèdent à leurs fiches sans solliciter le service paie.'},
    {cat:'paie',ico:'🏦',tag:'Paie',title:'SEPA pain.001 : automatisez vos virements',desc:'Générez vos fichiers virement batch ISO 20022.'},
    {cat:'legal',ico:'🔐',tag:'RGPD',title:'RGPD Art. 32 & paie belge',desc:'Chiffrement NISS, registre Art. 30, DPA — conformité complète.'},
  ]},
  nw:{ ey:'Newsletter', h:'Ne manquez aucune actualité sociale.', sub:'Changements législatifs, barèmes mis à jour, conseils pratiques.', ph:'votre@email.be', btn:"S'inscrire", note:'Politique de confidentialité Aureus IA SPRL. Désinscription à tout moment.', ok:'✓ Inscription confirmée — bienvenue !', feats:[['⚖️','Veille législative quotidienne','Alertes dès qu\'une loi belge impacte vos obligations'],['🧮','Barèmes 2026 mis à jour','Nouvelles grilles CP avant leur entrée en vigueur'],['💡',"Conseils d'experts","Fiches pratiques de nos juristes"]] },
  cta:{ h:"Prêt à moderniser votre gestion sociale ?", sub:'Premier mois offert · Accès immédiat · Migration assistée', btn:'Accéder maintenant →' },
  ft:{ col1:'Solutions', col2:'Produit', col3:'Légal', copy:'© 2026 Aureus IA SPRL · Tous droits réservés', links:['Disclaimer','Privacy','Cookie policy','CGU'],
    c1:[['Indépendants','independant'],['Devenir employeur','employeur'],['Employeurs','employeurs'],['Experts-comptables','experts'],['Formations','formations']],
    c2:[["Demander une démo",'contact'],['Documentation',null],['Statut',null]],
    c3:[['Confidentialité',null],['CGU',null],['RGPD',null],['Disclaimer',null]] },
  ind:{ ey:'Indépendants', bc:'Indépendants', h:'Se lancer comme\nindépendant\nen Belgique.', sub:'Statut, affiliation ONSS, cotisations, obligations — le guide complet étape par étape.', c1:'Parler à un expert', c2:'Demander une démo',
    card:{label:'Aureus Social Pro',title:'Votre back-office social',sub:'Automatisez vos obligations sociales.',stats:[['166','CP gérées'],['<8s','Dimona'],['100%','Conforme'],['24/7','Accès']]},
    sy:{ey:'Guide pas à pas',h:'Se lancer en 6 étapes',chk:['Dimona IN/OUT < 8s','Cotisations ONSS 13,07%','Fiches de paie PDF','DmfA XML trimestrielle','Belcotax 281.10','SEPA pain.001','Signature électronique'],chkH:"✅ Ce qu'Aureus automatise",
      tip:{h:'Bon à savoir',t:"En 2026, le premier employé bénéficie d'une exonération totale des cotisations patronales ONSS pendant 5 ans."},
      steps:[{n:1,t:'Choisir votre statut',b:"Indépendant à titre principal ou complémentaire, société (SRL, SA…) ou unipersonnel.",tags:['SRL · SA · Unipersonnel'],tc:'vt-tag-au'},
        {n:2,t:"Numéro d'entreprise (BCE)",b:"Inscription au registre des personnes morales auprès du greffe du tribunal de l'entreprise.",tags:['BCE · Banque-Carrefour'],tc:'vt-tag-b'},
        {n:3,t:'Affiliation à une caisse sociale',b:"Obligation légale dans les 90 jours du début d'activité.",tags:['ONSS · 90 jours'],tc:'vt-tag-g'},
        {n:4,t:'Cotisations sociales trimestrielles',b:"20,5% jusqu'à 72 810 € et 14,16% au-delà. Minimum : 870,78 €/trimestre.",tags:['20,5% · Trimestriel'],tc:'vt-tag-au'},
        {n:5,t:'Obligations TVA & IPP',b:"Déclaration TVA (mensuelle ou trimestrielle), déclaration IPP annuelle.",tags:['TVA · IPP · SPF Finances'],tc:''},
        {n:6,t:'Protection sociale',b:"Maladie-invalidité (INAMI), pension, allocations familiales. Optionnel : PLCI.",tags:['INAMI · Pension · PLCI'],tc:'vt-tag-g'},
      ]},
    faq:{ey:'Questions fréquentes',h:'Tout ce que vous voulez savoir',items:[
      ["Quel est le délai pour s'affilier ?","Vous avez 90 jours à compter du début de votre activité. En cas de dépassement, vous risquez une affiliation d'office."],
      ["Combien coûtent les cotisations en 2026 ?","20,5% jusqu'à 72 810,09 € et 14,16% au-delà. Minimum : 870,78 €/trimestre."],
      ["Puis-je être indépendant complémentaire ?","Oui, sous réserve de l'accord de votre employeur. Vos cotisations seront réduites."],
      ["Aureus gère-t-il les indépendants en société ?","Oui, personnes physiques et mandataires de société (gérants SRL, administrateurs SA)."],
    ]},
    cta:{h:"Prêt à vous lancer en toute sérénité ?",sub:"Nos experts vous accompagnent de A à Z.",btn:"Parler à un expert →"}},
  emp:{ ey:'Premier employé', bc:'Devenir employeur', h:'Engagez votre\npremier collaborateur\nen confiance.', sub:'Immatriculation ONSS, contrat, Dimona, premiers salaires — Aureus guide chaque étape.', c1:'Demander une démo', c2:'Déjà employeur →',
    card:{label:'Premier employé en Belgique',title:"Ce qu'Aureus fait",sub:'Automatisation complète du cycle social.',stats:[['0€','Cotisations an 1'],['8s','Dimona'],['100%','Conformité ONSS'],['166 CP','Toutes CP']]},
    steps:{ey:'Étapes clés',h:'De 0 à votre premier employé',items:[
      {n:1,t:'Immatriculation ONSS employeur',b:"Numéro d'employeur ONSS avant d'engager. Aureus guide via WIDE et assure le suivi du matricule.",tags:['ONSS · WIDE · Matricule'],tc:'vt-tag-b'},
      {n:2,t:'Rédaction du contrat de travail',b:"CDI, CDD, temps plein ou partiel — modèles conformes à la commission paritaire applicable.",tags:['CDI · CDD · CP 200'],tc:'vt-tag-au'},
      {n:3,t:'Déclaration Dimona IN',b:"Obligatoire avant le début du travail. Soumise en moins de 8 secondes avec confirmation ONSS.",tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},
      {n:4,t:'Calcul du premier salaire',b:"Brut → Net : ONSS 13,07%, précompte professionnel Annexe III, bonus emploi, réduction bas salaire.",tags:['ONSS · PP · Bonus emploi'],tc:'vt-tag-au'},
      {n:5,t:'Virement SEPA & paiement',b:"Fichier SEPA pain.001 prêt à importer dans votre banque. Validation IBAN/BIC intégrée.",tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},
      {n:6,t:'Déclarations trimestrielles ONSS',b:"DmfA XML Q1–Q4 générée automatiquement avec toutes les réductions applicables.",tags:['DmfA · Q1–Q4'],tc:''},
    ]},
    av:{ey:'Avantages 2026',h:"Exonérations & primes à l'embauche",items:[
      ['🎁','Exemption 1er employé',"Exonération totale des cotisations patronales ONSS pendant 5 ans."],
      ['💼','Activa.brussels',"Prime mensuelle jusqu'à 350 € pour un demandeur d'emploi bruxellois."],
      ['📉','Réduction bas salaire',"Réduction ONSS patronale pour les salaires inférieurs à 3 100 €/mois."],
      ['🎓','SINE & plan Activa',"Réductions pour l'engagement de personnes éloignées du marché de l'emploi."],
      ['👶','Congé parental',"Gestion des suspensions de contrat, déclarations ONSS spécifiques."],
      ['📋','MonBEE recrutement',"Prime à l'embauche via MonBEE. Délais et documents générés automatiquement."],
    ]},
    cta:{h:"Engagez votre premier collaborateur dès demain.",sub:'Démo gratuite · Accompagnement complet · Premier mois offert',btn:'Démarrer →'}},
  emps:{ ey:'Employeurs', bc:'Employeurs', h:'Votre paie,\nvos déclarations,\nautomatisées.', sub:'166 commissions paritaires, DmfA XML, Belcotax, export WinBooks/BOB — 132 modules pour le cycle social belge complet.', c1:'Accéder à la plateforme', c2:'Demander une démo',
    card:{label:'Plateforme en production',title:'Chiffres réels — Mars 2026',sub:'132 modules · 44 246 lignes de code',stats:[['1 274','Fiches calculées'],['392','Déclarations ONSS'],['42','Entreprises gérées'],['99.97%','Uptime']]},
    mods:{ey:'Fonctionnalités',h:'132 modules pour le cycle social complet',items:[
      ['⚡','Dimona électronique','IN/OUT/UPDATE en moins de 8 secondes. Connexion directe ONSS via Mahis/CSAM.'],
      ['🧮','Calcul de paie belge','166 CP, barèmes sectoriels 2026, ONSS 13,07%, précompte professionnel Annexe III.'],
      ['📋','DmfA XML trimestrielle','Q1–Q4 conformes ONSS. Réduction structurelle, bas salaire, bonus emploi.'],
      ['📊','Belcotax XML','Fiches 281.10, 281.20, 281.30 conformes SPF Finances. Téléversement direct MyMinfin.'],
      ['🏦','SEPA pain.001','Fichiers virement batch ISO 20022. Validation IBAN/BIC.'],
      ['📁','Export comptable × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],
      ['✍️','Signature électronique','Yousign ou DocuSign. Valeur probante légale. Archivage GED automatique.'],
      ['👥','Portail employé','Fiches de paie, documents RH, demandes de congé — accessibles par chaque collaborateur.'],
      ['🔐','Sécurité RGPD Art. 32','AES-256-GCM NISS/IBAN, audit trail, RLS Supabase, backup nocturne chiffré.'],
    ]},
    cta:{h:"Voyez la plateforme en action.",sub:'Démo sur vos propres données — 30 minutes chrono.',btn:'Réserver une démo →'}},
  exp:{ ey:'Experts-comptables', bc:'Experts-comptables', h:'Un portail,\ntous vos dossiers\nsociaux.', sub:'Mandats Mahis/CSAM, portail multi-clients, API REST, migration depuis SD Worx ou Partena.', c1:'Demander une démo fiduciaire', c2:'Migration assistée',
    card:{label:'Plan Fiduciaire',title:'Multi-dossiers illimités',sub:'Portail · API · SLA · Migration',stats:[['∞','Dossiers clients'],['99.9%','SLA garanti'],['REST','API + Webhooks'],['Auto','Migration CSV']]},
    it:{ey:'Ce que nous offrons',h:'Conçu pour les professionnels du chiffre',list:[
      ['01','Portail multi-clients centralisé',"Gérez tous vos dossiers depuis un seul tableau de bord. Droits d'accès granulaires par collaborateur."],
      ['02','Mandats ONSS & Belcotax automatiques',"Génération des conventions de mandat Mahis/CSAM conformes. Suivi des mandats actifs par client."],
      ['03','API REST + Webhooks HMAC',"Intégrez Aureus dans votre ERP. Webhooks sécurisés pour les événements paie, DmfA, Dimona."],
      ['04','Migration depuis vos prestataires',"Parseur CSV multi-format depuis SD Worx, Partena, Securex, Sodexo. Migration assistée incluse."],
      ['05',"6 formats d'export comptable","WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV. PCMN belge intégré."],
      ['06','SLA 99.9% + Account Manager',"Réponse en moins de 2h ouvrables. Canal Slack ou Teams dédié. Account manager attitré."],
    ]},
    mig:{ey:'Migration',h:'Quitter SD Worx ou Partena sans risque.',steps:[['📥','Export données','Extraction CSV depuis votre prestataire actuel'],['🔄','Import automatique','Parseur multi-format — aucune ressaisie'],['✅','Validation croisée','Comparaison des calculs avant go-live'],['🚀','Go-live en 7 jours','Dossiers opérationnels dès le premier cycle']]},
    cta:{h:"Rejoignez les fiduciaires qui ont choisi l'indépendance.",sub:'Migration assistée · SLA 99.9% · Premier mois offert',btn:'Demo fiduciaire →'}},
  form:{ ey:'Formations', bc:'Formations', h:'Maîtrisez le droit\nsocial belge.\nÀ votre rythme.', sub:'Webinaires, guides pratiques et tutoriels sur la paie belge, ONSS, Dimona et Belcotax.', c1:'Voir le programme', c2:'Nous contacter',
    card:{label:'Formations Aureus',title:'Apprenez des experts',sub:'Contenu basé sur les vrais cas pratiques.',stats:[['6','Modules'],['100%','Droit belge 2026'],['CPD','Heures IEC'],['FR/NL','Langues']]},
    mods:{ey:'Thématiques',h:'Nos 6 modules de formation',items:[
      {ico:'⚖️',t:'Droit social belge',d:"Loi du 27/06/1969, cotisations ONSS, obligations de l'employeur, commissions paritaires.",f:false},
      {ico:'🧮',t:'Calcul de paie avancé',d:"Brut → Net complet : ONSS 13,07%, PP Annexe III, bonus emploi. Exercices pratiques.",f:true},
      {ico:'📋',t:'DmfA & Belcotax',d:"Déclarations trimestrielles ONSS, fiches 281.10/20/30, délais, corrections.",f:false},
      {ico:'🚀',t:'Onboarding Aureus Pro',d:"Prise en main complète : configuration, première fiche, première Dimona — en 2h.",f:false},
      {ico:'🏛',t:'RGPD & sécurité RH',d:"Obligations Art. 28 et 32, registre Art. 30, DPA, chiffrement NISS/IBAN.",f:false},
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
  con:{ ey:'Contact', h:'Comment pouvons-nous\nvous aider ?', sub:'Notre équipe répond sous 4h ouvrables. Pas de chatbot — de vrais experts en droit social belge.',
    ch:[['✉️','E-mail','info@aureus-ia.com'],['💻','Application','app.aureussocial.be'],['📍','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Bruxelles']],
    cr:[['BCE','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Réponse','< 4h ouvrables']],
    f:{t:'Demande de démo',s:'Réponse garantie sous 4h ouvrables.',fn:'Prénom *',ln:'Nom *',em:'E-mail professionnel *',co:'Société',ro:'Vous êtes *',ms:'Message',fnp:'Jean',lnp:'Dupont',emp:'jean.dupont@fiduciaire.be',cop:'Cabinet Dupont & Associés',msp:'Décrivez votre situation…',sub:'Envoyer la demande',note:'En soumettant ce formulaire, vous acceptez notre politique RGPD. Aucun spam.',ok:'✓ Message envoyé — nous vous répondrons sous 4h ouvrables.',roles:['Sélectionnez...','Indépendant / Starter','Fiduciaire / Expert-comptable','Employeur direct','Secrétariat social','Courtier / Partenaire','Autre']}},
};

const nl = JSON.parse(JSON.stringify(fr));
nl.topbar={country:'🇧🇪 België',bce:'KBO BE 1028.230.781',contact:'Contact',client:'Klantenzone'};
nl.nav={demo:'Demo aanvragen',login:'Inloggen'};
nl.mega[1].label='Zelfstandigen';nl.mega[2].label='Werkgever worden';nl.mega[3].label='Werkgevers';nl.mega[4].label='Opleidingen';nl.mega[5].label='Accountants';
nl.discover='Ontdekken';nl.readmore='Lezen';
nl.hero={badge:'Digitaal sociaal secretariaat — v18 in productie',h1:'Uw Belgische sociale\npartner.\nEindelijk digitaal.',sub:'Van Dimona tot kwartaalaangiften, van loonfiche tot elektronische handtekening — alles wat u nodig heeft, op één plek.',cta1:'Naar de applicatie',cta2:'Demo aanvragen',stats:[['166','Paritaire comités'],['<8','Dimona (seconden)'],['132','Actieve modules'],['99.97%','Uptime']]};
nl.sol={ey:'Onze oplossingen',h:'Voor elk profiel, de juiste oplossing.',sub:'Zelfstandige, werkgever of accountant — Aureus Social Pro past zich aan uw realiteit aan.',items:[
  {ico:'🚀',title:'Als zelfstandige starten',desc:'Statuut, ONSS-aansluiting, verplichtingen — alles om zorgeloos te starten.',page:'independant'},
  {ico:'👤',title:'Werkgever worden',desc:'Inschrijving, contract, Dimona, eerste lonen.',page:'employeur',featured:true},
  {ico:'🏢',title:'Werkgevers',desc:'Automatiseer loonverwerking, DmfA, boekhoudexports.',page:'employeurs'},
  {ico:'🏛',title:'Accountants',desc:'Multi-klant portaal, Mahis/CSAM-mandaten, REST API.',page:'experts'},
  {ico:'📊',title:'Aangiften & Belcotax',desc:'Kwartaal DmfA, fiches 281.10/20/30, MyMinfin upload.',page:'employeurs'},
  {ico:'📚',title:'Opleidingen',desc:'Webinars, praktijkgidsen over Belgisch sociaalrecht.',page:'formations'},
]};
nl.art={ey:'Altijd klaar voor de toekomst',h:'Resources & actualiteit',filters:[['tout','Alles'],['paie','Loon'],['rh','HR'],['legal','Wetgeving'],['onss','ONSS']],items:[
  {cat:'paie',ico:'🧮',tag:'Loon',title:"Sectorale barema's 2026: wat verandert",desc:'Update van 166 PC geïntegreerd in Aureus Social Pro voor 1 januari.'},
  {cat:'legal',ico:'⚖️',tag:'Wetgeving',title:'Werkbonus 2026: nieuwe plafonds',desc:'Het loonplafond is herzien. Impact op uw berekeningen.'},
  {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026: deadline en nieuwigheden',desc:'Deadline, nieuwe werknemercodes en structurele vermindering.'},
  {cat:'rh',ico:'👥',tag:'HR',title:'Werknemersportaal: loonfiches, documenten, verlof',desc:'Uw medewerkers hebben toegang tot hun fiches zonder HR te raadplegen.'},
  {cat:'paie',ico:'🏦',tag:'Loon',title:'SEPA pain.001: overschrijvingen automatiseren',desc:'Genereer uw batch-overboekingsbestanden ISO 20022.'},
  {cat:'legal',ico:'🔐',tag:'AVG',title:'AVG Art. 32 & Belgische loonverwerking',desc:'NISS-versleuteling, register Art. 30, DPA — volledige conformiteit.'},
]};
nl.nw={ey:'Nieuwsbrief',h:'Mis geen enkel sociaalrechtelijk nieuws.',sub:"Belgische wetswijzigingen, bijgewerkte barema's, praktische tips.",ph:'uw@email.be',btn:'Inschrijven',note:'Privacybeleid Aureus IA SPRL. Op elk moment uitschrijven.',ok:'✓ Inschrijving bevestigd — welkom!',feats:[['⚖️','Dagelijkse wetgevingswatch','Meldingen zodra een Belgische wet uw verplichtingen raakt'],['🧮',"Bijgewerkte barema's 2026",'Nieuwe PC-roosters vóór hun inwerkingtreding'],['💡','Expertentips','Praktische fiches van onze socialrechtjuristen']]};
nl.cta={h:'Klaar om uw sociaal beheer te moderniseren?',sub:'Eerste maand gratis · Directe toegang · Migratiebegeleiding',btn:'Nu beginnen →'};
nl.ft={col1:'Oplossingen',col2:'Product',col3:'Juridisch',copy:'© 2026 Aureus IA SPRL · Alle rechten voorbehouden',links:['Disclaimer','Privacy','Cookie policy','AVG'],
  c1:[['Zelfstandigen','independant'],['Werkgever worden','employeur'],['Werkgevers','employeurs'],['Accountants','experts'],['Opleidingen','formations']],
  c2:[['Demo aanvragen','contact'],['Documentatie',null],['Status',null]],
  c3:[['Privacy',null],['AVG',null],['Gebruiksvoorwaarden',null],['Disclaimer',null]]};
nl.ind={ey:'Zelfstandigen',bc:'Zelfstandigen',h:'Als zelfstandige\nstarten\nin België.',sub:'Statuut, ONSS-aansluiting, bijdragen, verplichtingen — de complete stap-voor-stap gids.',c1:'Spreken met een expert',c2:'Demo aanvragen',
  card:{label:'Aureus Social Pro',title:'Uw sociale back-office',sub:'Automatiseer uw sociale verplichtingen.',stats:[['166','PC beheerd'],['<8s','Dimona'],['100%','Conform'],['24/7','Toegang']]},
  sy:{ey:'Stap voor stap',h:'Starten in 6 stappen',chk:['Dimona IN/OUT < 8s','ONSS-bijdragen 13,07%','Loonfiches PDF','DmfA XML per kwartaal','Belcotax 281.10','SEPA pain.001','Elektronische handtekening'],chkH:'✅ Wat Aureus automatiseert',
    tip:{h:'Goed om te weten',t:'In 2026 geniet de eerste werknemer van een volledige vrijstelling van patronale ONSS-bijdragen gedurende 5 jaar.'},
    steps:[{n:1,t:'Uw statuut kiezen',b:'Zelfstandige in hoofd- of bijberoep, vennootschap (BV, NV…) of éénmanszaak.',tags:['BV · NV · Éénmanszaak'],tc:'vt-tag-au'},
      {n:2,t:'Ondernemingsnummer (KBO)',b:'Inschrijving in het rechtspersonenregister bij de griffie van de ondernemingsrechtbank.',tags:['KBO · Kruispuntbank'],tc:'vt-tag-b'},
      {n:3,t:'Aansluiting bij een sociale kas',b:'Wettelijke verplichting binnen 90 dagen na het begin van de activiteit.',tags:['ONSS · 90 dagen'],tc:'vt-tag-g'},
      {n:4,t:'Driemaandelijkse sociale bijdragen',b:"Tarief: 20,5% tot 72.810 € en 14,16% daarboven voor 2026. Minimum: 870,78 €/kwartaal.",tags:['20,5% · Per kwartaal'],tc:'vt-tag-au'},
      {n:5,t:'BTW & IPB verplichtingen',b:'BTW-aangifte (maandelijks of driemaandelijks), jaarlijkse IPB-aangifte.',tags:['BTW · IPB · FOD Financiën'],tc:''},
      {n:6,t:'Sociale bescherming',b:'Ziekte-invaliditeit (RIZIV), pensioenrecht, kinderbijslag. Optioneel: VAPZ.',tags:['RIZIV · Pensioen · VAPZ'],tc:'vt-tag-g'},
    ]},
  faq:{ey:'Veelgestelde vragen',h:'Alles wat u wilt weten',items:[
    ['Wat is de termijn voor aansluiting bij een sociale kas?','U heeft 90 dagen na het begin van uw activiteit. Bij overschrijding riskeert u een ambtshalve aansluiting.'],
    ['Hoeveel kosten de sociale bijdragen in 2026?','20,5% op de schijf tot 72.810,09 € en 14,16% daarboven. Absoluut minimum: 870,78 €/kwartaal.'],
    ['Kan ik als zelfstandige in bijberoep werken terwijl ik werknemer ben?','Ja, mits toestemming van uw werkgever. Uw bijdragen worden verminderd via het aanvullend regime.'],
    ['Beheert Aureus ook zelfstandigen in vennootschap?','Ja, zowel natuurlijke personen als mandatarissen van vennootschappen (zaakvoerders BV, bestuurders NV).'],
  ]},
  cta:{h:'Klaar om te starten met volledige gemoedsrust?',sub:'Onze experts begeleiden u van A tot Z.',btn:'Spreken met een expert →'}};
nl.emp={ey:'Eerste werknemer',bc:'Werkgever worden',h:'Neem uw eerste\nwerknemer aan\nmet vertrouwen.',sub:'ONSS-inschrijving, contract, Dimona, eerste lonen — Aureus begeleidt elke stap.',c1:'Demo aanvragen',c2:'Al werkgever →',
  card:{label:'Eerste werknemer in België',title:'Wat Aureus voor u doet',sub:'Volledige automatisering van de sociale cyclus.',stats:[['0€','Patronale bijdragen jaar 1'],['8s','Dimona'],['100%','ONSS conformiteit'],['166 PC','Alle comités']]},
  steps:{ey:'Sleutelstappen',h:'Van 0 naar uw eerste werknemer',items:[
    {n:1,t:'ONSS-inschrijving werkgever',b:"Werkgeversnummer ONSS vóór aanwerving. Aureus begeleidt via WIDE en volgt het voorlopig matriculenummer op.",tags:['ONSS · WIDE · Matricule'],tc:'vt-tag-b'},
    {n:2,t:'Opstelling arbeidscontract',b:"CDI, CDD, voltijds of deeltijds — conforme modellen per toepasselijk paritair comité.",tags:['CDI · CDD · PC 200'],tc:'vt-tag-au'},
    {n:3,t:'Dimona IN aangifte',b:"Verplicht vóór de start van de werkzaamheden. Ingediend in minder dan 8 seconden met ONSS-bevestiging.",tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},
    {n:4,t:'Berekening eerste loon',b:"Bruto → Netto: ONSS 13,07%, bedrijfsvoorheffing Bijlage III, werkbonus, lageloonvermindering.",tags:['ONSS · BV · Werkbonus'],tc:'vt-tag-au'},
    {n:5,t:'SEPA-overschrijving & betaling',b:"SEPA pain.001-bestand klaar om te importeren in uw bank. IBAN/BIC-validatie ingebouwd.",tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},
    {n:6,t:'Driemaandelijkse ONSS-aangiften',b:"DmfA XML Q1–Q4 automatisch gegenereerd met alle toepasselijke verminderingen.",tags:['DmfA · Q1–Q4'],tc:''},
  ]},
  av:{ey:'Voordelen 2026',h:'Vrijstellingen & aanwervingspremies',items:[
    ['🎁','Vrijstelling 1e werknemer','Volledige vrijstelling van patronale ONSS-bijdragen gedurende 5 jaar. Automatisch berekend.'],
    ['💼','Activa.brussels','Maandelijkse premie tot 350 € voor de aanwerving van een Brusselse werkzoekende.'],
    ['📉','Lageloonvermindering','Patronale ONSS-vermindering voor lonen onder 3.100 €/maand.'],
    ['🎓','SINE & Activa-plan','Verminderingen voor de aanwerving van personen ver van de arbeidsmarkt.'],
    ['👶','Ouderschapsverlof','Beheer van contractschorsen, tijdelijke vervanging, specifieke ONSS-aangiften.'],
    ['📋','MonBEE aanwerving','Aanwervingspremie via MonBEE. Aureus herinnert aan de termijnen en genereert de nodige documenten.'],
  ]},
  cta:{h:'Neem morgen uw eerste medewerker aan.',sub:'Gratis demo · Volledige begeleiding · Eerste maand gratis',btn:'Starten →'}};
nl.emps={ey:'Werkgevers',bc:'Werkgevers',h:'Uw loon,\nuw aangiften,\ngeautomatiseerd.',sub:'166 paritaire comités, DmfA XML, Belcotax, WinBooks/BOB-export — 132 modules voor de volledige Belgische sociale cyclus.',c1:'Naar het platform',c2:'Demo aanvragen',
  card:{label:'Platform in productie',title:'Werkelijke cijfers — Maart 2026',sub:'132 modules · 44.246 regels code',stats:[['1.274','Loonfiches berekend'],['392','ONSS-aangiften'],['42','Bedrijven beheerd'],['99.97%','Uptime']]},
  mods:{ey:'Functionaliteiten',h:'132 modules voor de volledige sociale cyclus',items:[
    ['⚡','Elektronische Dimona','IN/OUT/UPDATE in minder dan 8 seconden. Directe ONSS-verbinding via Mahis/CSAM.'],
    ['🧮','Belgische loonberekening','166 PC, sectorale barema\'s 2026, ONSS 13,07%, bedrijfsvoorheffing Bijlage III.'],
    ['📋','DmfA XML per kwartaal','Q1–Q4 conform ONSS. Structurele vermindering, lageloon, werkbonus.'],
    ['📊','Belcotax XML','Fiches 281.10, 281.20, 281.30 conform FOD Financiën. Directe upload MyMinfin.'],
    ['🏦','SEPA pain.001','Batch-overboekingsbestanden ISO 20022. IBAN/BIC-validatie. Alle Belgische banken.'],
    ['📁','Boekhoudexport × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],
    ['✍️','Elektronische handtekening','Yousign of DocuSign. Juridische bewijswaarde. Automatische GED-archivering.'],
    ['👥','Werknemersportaal','Loonfiches, HR-documenten, verlofaanvragen — direct toegankelijk voor elke medewerker.'],
    ['🔐','DSGVO beveiliging Art. 32','AES-256-GCM NISS/IBAN, volledige audit trail, RLS Supabase, versleutelde nachtelijke backup.'],
  ]},
  cta:{h:'Bekijk het platform in actie.',sub:'Demo op uw eigen gegevens — 30 minuten.',btn:'Demo reserveren →'}};
nl.exp={ey:'Accountants',bc:'Accountants',h:'Één portaal,\nalle sociale\ndossiers.',sub:'Mahis/CSAM-mandaten, multi-klant portaal, REST API, migratie vanuit SD Worx of Partena.',c1:'Fiduciaire demo aanvragen',c2:'Migratiebegeleiding',
  card:{label:'Fiduciair plan',title:'Onbeperkte multi-dossiers',sub:'Portaal · API · SLA · Migratie',stats:[['∞','Klantendossiers'],['99.9%','SLA gegarandeerd'],['REST','API + Webhooks'],['Auto','CSV-migratie']]},
  it:{ey:'Wat wij bieden',h:'Ontworpen voor financiële professionals',list:[
    ['01','Gecentraliseerd multi-klant portaal','Beheer alle werkgeversdossiers vanuit één dashboard. Granulaire toegangsrechten per medewerker.'],
    ['02','Automatische ONSS & Belcotax-mandaten','Genereer conforme Mahis/CSAM-mandaatovereenkomsten. Opvolging van actieve mandaten per klant.'],
    ['03','REST API + HMAC Webhooks','Integreer Aureus in uw ERP. Beveiligde webhooks voor loon-, DmfA- en Dimona-gebeurtenissen.'],
    ['04','Migratie vanuit uw prestataires','Multi-formaat CSV-parser vanuit SD Worx, Partena, Securex, Sodexo. Begeleide migratie inbegrepen.'],
    ['05','6 boekhoudexportformaten','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV. Belgisch MAR ingebouwd.'],
    ['06','SLA 99.9% + Account Manager','Antwoord gegarandeerd binnen 2 werkuren. Dedicated Slack of Teams kanaal. Vaste accountmanager.'],
  ]},
  mig:{ey:'Migratie',h:'SD Worx of Partena verlaten zonder risico.',steps:[['📥','Gegevensexport','CSV-extractie vanuit uw huidige prestataire'],['🔄','Automatische import','Multi-formaat parser Aureus — geen hercodering'],['✅','Kruisvalidatie','Vergelijking van berekeningen vóór go-live'],['🚀','Go-live in 7 dagen','Dossiers operationeel vanaf de eerste cyclus']]},
  cta:{h:'Sluit u aan bij fiduciaires die voor onafhankelijkheid kozen.',sub:'Begeleide migratie · SLA 99.9% · Eerste maand gratis',btn:'Fiduciaire demo →'}};
nl.form={ey:'Opleidingen',bc:'Opleidingen',h:'Beheers het Belgisch\nsociaalrecht.\nOp uw tempo.',sub:'Webinars, praktijkgidsen en tutorials over Belgische loonverwerking, ONSS, Dimona en Belcotax.',c1:'Programma bekijken',c2:'Contacteer ons',
  card:{label:'Aureus Opleidingen',title:'Leer van experts',sub:'Inhoud gebaseerd op echte praktijkcases van het platform.',stats:[['6','Modules'],['100%','Belgisch recht 2026'],['CPD','IEC-uren'],['FR/NL','Talen']]},
  mods:{ey:'Thema\'s',h:'Onze 6 opleidingsmodules',items:[
    {ico:'⚖️',t:'Belgisch sociaalrecht',d:"Wet van 27/06/1969, ONSS-bijdragen, verplichtingen van de werkgever, paritaire comités.",f:false},
    {ico:'🧮',t:'Geavanceerde loonberekening',d:"Bruto → Netto volledig: ONSS 13,07%, bedrijfsvoorheffing Bijlage III, werkbonus. Praktijkoefeningen.",f:true},
    {ico:'📋',t:'DmfA & Belcotax',d:"Driemaandelijkse ONSS-aangiften, fiches 281.10/20/30, termijnen, correcties.",f:false},
    {ico:'🚀',t:'Onboarding Aureus Pro',d:"Volledige ingebruikname: configuratie, eerste loonfiche, eerste Dimona — in 2 uur.",f:false},
    {ico:'🏛',t:'AVG & HR-beveiliging',d:"Verplichtingen Art. 28 en 32, register Art. 30, DPA, NISS/IBAN-versleuteling.",f:false},
    {ico:'📊',t:'Doorlopende wetgevingswatch',d:"Automatische meldingen zodra een Belgische wet uw verplichtingen raakt.",f:false},
  ]},
  arts:{ey:'Inspiratie',h:'Altijd klaar voor de toekomst',items:[
    {ico:'⚖️',tag:'Sociaalrecht',t:'Eerste werknemer: de 5 fouten die u moet vermijden',d:'Late inschrijving, vergeten Dimona, verkeerd PC — de meest voorkomende valkuilen.'},
    {ico:'💼',tag:'Ondernemerschap',t:'Zelfstandige of vennootschap: welk statuut in 2026?',d:'Bijdragen, fiscaliteit, sociale bescherming — volledige vergelijking.'},
    {ico:'🏥',tag:'Gezondheid',t:'Absenteïsme: wettelijke verplichtingen van de Belgische werkgever',d:'Gewaarborgd loon, medisch attest, medische controle.'},
    {ico:'🎯',tag:'Motivatie',t:'Alternatieve verloning: warrants, maaltijdcheques, bedrijfswagen',d:'Optimaliseer uw loonbeleid met extrawettelijke voordelen.'},
    {ico:'🔐',tag:'AVG',t:'AVG & HR-gegevens: wat elke werkgever moet weten',d:'Verwerking NISS, IBAN, medische dossiers — Art. 28 en 32.'},
    {ico:'🧮',tag:'Loon',t:"Barema's 2026: de belangrijkste wijzigingen per PC",d:'PC 200, 226, 319 — overzicht van de nieuwe loonroosters.'},
  ]},
  cta:{h:'Bent u een activiteit aan het opstarten of wilt u uw bedrijf ontwikkelen?',sub:'Welke vraag u ook heeft, Aureus geeft u duidelijke antwoorden.',btn:'Contacteer ons →'}};
nl.con={ey:'Contact',h:'Hoe kunnen wij\nu helpen?',sub:'Ons team antwoordt binnen 4 werkuren. Geen chatbot — echte Belgische socialrechtexperts.',
  ch:[['✉️','E-mail','info@aureus-ia.com'],['💻','Applicatie','app.aureussocial.be'],['📍','Adres','Place Marcel Broodthaers 8, 1060 Sint-Gillis, Brussel']],
  cr:[['KBO','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Antwoord','< 4 werkuren']],
  f:{t:'Demo aanvragen',s:'Antwoord gegarandeerd binnen 4 werkuren.',fn:'Voornaam *',ln:'Naam *',em:'Professioneel e-mail *',co:'Bedrijf',ro:'U bent *',ms:'Bericht',fnp:'Jan',lnp:'Janssen',emp:'jan.janssen@accountant.be',cop:'Kantoor Janssen & Partners',msp:'Beschrijf uw situatie, behoeften of vragen…',sub:'Aanvraag verzenden',note:'Door dit formulier in te dienen, stemt u in met ons AVG-beleid. Geen spam.',ok:'✓ Bericht verzonden — we antwoorden binnen 4 werkuren.',roles:['Selecteer...','Zelfstandige / Starter','Fiduciaire / Accountant','Directe werkgever','Sociaal secretariaat','Makelaar / Partner','Andere']}};

const en = JSON.parse(JSON.stringify(fr));
en.topbar={country:'🇧🇪 Belgium',bce:'VAT BE 1028.230.781',contact:'Contact',client:'Client area'};
en.nav={demo:'Book a demo',login:'Log in'};
en.mega[1].label='Freelancers';en.mega[2].label='Become an employer';en.mega[3].label='Employers';en.mega[4].label='Training';en.mega[5].label='Accountants';
en.discover='Discover';en.readmore='Read';
en.hero={badge:'Belgian digital payroll platform — v18 in production',h1:'Your Belgian social\npartner.\nFinally digital.',sub:'From Dimona to quarterly declarations, from payslips to e-signatures — everything you need, in one place.',cta1:'Go to application',cta2:'Book a demo',stats:[['166','Joint committees'],['<8','Dimona (seconds)'],['132','Deployed modules'],['99.97%','Uptime']]};
en.sol={ey:'Our solutions',h:'For every profile, the right solution.',sub:'Freelancer, employer or accountant — Aureus Social Pro adapts to your reality.',items:[
  {ico:'🚀',title:'Start as a freelancer',desc:'Status, ONSS affiliation, obligations — everything you need to start with confidence.',page:'independant'},
  {ico:'👤',title:'Become an employer',desc:'Registration, contract, Dimona, first payroll.',page:'employeur',featured:true},
  {ico:'🏢',title:'Employers',desc:'Automate payroll, DmfA, accounting exports for your teams.',page:'employeurs'},
  {ico:'🏛',title:'Accountants',desc:'Multi-client portal, Mahis/CSAM mandates, REST API.',page:'experts'},
  {ico:'📊',title:'Declarations & Belcotax',desc:'Quarterly DmfA, 281.10/20/30 forms, MyMinfin upload.',page:'employeurs'},
  {ico:'📚',title:'Training',desc:'Webinars, practical guides on Belgian employment law.',page:'formations'},
]};
en.art={ey:'Always ready for the future',h:'Resources & insights',filters:[['tout','All'],['paie','Payroll'],['rh','HR'],['legal','Legislation'],['onss','ONSS']],items:[
  {cat:'paie',ico:'🧮',tag:'Payroll',title:'2026 sector scales: what changes',desc:'Update of 166 joint committees integrated before January 1st.'},
  {cat:'legal',ico:'⚖️',tag:'Legislation',title:'Employment bonus 2026: new thresholds',desc:'The salary ceiling has been revised. Impact on your calculations.'},
  {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026: deadline and updates',desc:'Deadline, new worker codes and structural reduction changes.'},
  {cat:'rh',ico:'👥',tag:'HR',title:'Employee portal: payslips, documents, leave',desc:'Your employees access their payslips without contacting HR.'},
  {cat:'paie',ico:'🏦',tag:'Payroll',title:'SEPA pain.001: automate your payments',desc:'Generate your ISO 20022 batch payment files.'},
  {cat:'legal',ico:'🔐',tag:'GDPR',title:'GDPR Art. 32 & Belgian payroll',desc:'NISS encryption, Art. 30 register, DPA — full compliance.'},
]};
en.nw={ey:'Newsletter',h:'Never miss a social law update.',sub:'Belgian legislative changes, updated scales, practical advice.',ph:'your@email.be',btn:'Subscribe',note:'Aureus IA SPRL privacy policy. Unsubscribe at any time.',ok:'✓ Subscription confirmed — welcome!',feats:[['⚖️','Daily legislative watch','Alerts when Belgian law impacts your obligations'],['🧮','Updated 2026 scales','New joint committee grids before they take effect'],['💡','Expert tips','Practical guides from our employment law lawyers']]};
en.cta={h:'Ready to modernize your HR administration?',sub:'First month free · Immediate access · Assisted migration',btn:'Get started →'};
en.ft={col1:'Solutions',col2:'Product',col3:'Legal',copy:'© 2026 Aureus IA SPRL · All rights reserved',links:['Disclaimer','Privacy','Cookie policy','T&Cs'],
  c1:[['Freelancers','independant'],['Become an employer','employeur'],['Employers','employeurs'],['Accountants','experts'],['Training','formations']],
  c2:[['Book a demo','contact'],['Documentation',null],['Status',null]],
  c3:[['Privacy',null],['T&Cs',null],['GDPR',null],['Disclaimer',null]]};
en.ind={ey:'Freelancers',bc:'Freelancers',h:'Start as a\nfreelancer\nin Belgium.',sub:'Status, ONSS affiliation, contributions, obligations — the complete step-by-step guide.',c1:'Talk to an expert',c2:'Book a demo',card:{label:'Aureus Social Pro',title:'Your social back-office',sub:'Automate your social obligations from day one.',stats:[['166','JC managed'],['<8s','Dimona'],['100%','Compliant'],['24/7','Access']]},
  sy:{ey:'Step by step',h:'Get started in 6 steps',chk:['Dimona IN/OUT < 8s','ONSS contributions 13.07%','PDF payslips','Quarterly DmfA XML','Belcotax 281.10','SEPA pain.001','Electronic signature'],chkH:'✅ What Aureus automates',
    tip:{h:'Good to know',t:'In 2026, the first employee benefits from a full exemption from employer ONSS contributions for 5 years.'},
    steps:[{n:1,t:'Choose your status',b:'Self-employed as main or supplementary activity, company (SRL, SA…) or sole trader. Each status has different social and tax implications.',tags:['SRL · SA · Sole trader'],tc:'vt-tag-au'},
      {n:2,t:'Company registration number (CBE)',b:'Registration with the Register of Legal Entities at the commercial court registry or through an accredited enterprise counter.',tags:['CBE · Crossroads Bank'],tc:'vt-tag-b'},
      {n:3,t:'Affiliation to a social insurance fund',b:'Legal obligation within 90 days of starting your activity. Aureus guides you through the steps.',tags:['ONSS · 90 days'],tc:'vt-tag-g'},
      {n:4,t:'Quarterly social contributions',b:'Rate: 20.5% up to €72,810 and 14.16% above for 2026. Minimum: €870.78/quarter (main activity).',tags:['20.5% · Quarterly'],tc:'vt-tag-au'},
      {n:5,t:'VAT & income tax obligations',b:'VAT return (monthly or quarterly), annual income tax return. Aureus generates the data for your accountant.',tags:['VAT · IT · SPF Finance'],tc:''},
      {n:6,t:'Social protection',b:'Health/disability insurance (INAMI), pension rights, family allowances. Optional: PLCI, income protection insurance.',tags:['INAMI · Pension · PLCI'],tc:'vt-tag-g'},
    ]},
  faq:{ey:'Frequently asked questions',h:'Everything you want to know',items:[
    ['What is the deadline for affiliating with a social insurance fund?','You have 90 days from the start of your activity. If you miss this deadline, you risk an ex-officio affiliation and surcharges.'],
    ['How much do social contributions cost in 2026?','20.5% on the bracket up to €72,810.09 and 14.16% above. Absolute minimum: €870.78/quarter for a main activity.'],
    ['Can I work as a supplementary self-employed while being an employee?','Yes, subject to your employer\'s agreement (exclusivity clause). Your contributions will be reduced through the supplementary regime.'],
    ['Does Aureus also manage self-employed in a company?','Yes. Aureus Social Pro manages both natural persons and company representatives (SRL managers, SA directors).'],
  ]},
  cta:{h:'Ready to get started with complete peace of mind?',sub:'Our experts guide you every step of the way.',btn:'Talk to an expert →'}};
en.emp={ey:'First employee',bc:'Become an employer',h:'Hire your first\nemployee\nwith confidence.',sub:'ONSS registration, contract, Dimona, first payroll — Aureus guides every step.',c1:'Book a demo',c2:'Already an employer →',
  card:{label:'First employee in Belgium',title:'What Aureus does for you',sub:'Full automation of the social cycle.',stats:[['€0','Employer contributions year 1'],['8s','Dimona submitted'],['100%','ONSS compliance'],['166 JC','All committees']]},
  steps:{ey:'Key steps',h:'From 0 to your first employee',items:[
    {n:1,t:'ONSS employer registration',b:"Get an ONSS employer number before hiring. Aureus guides the WIDE submission and tracks the provisional registration number.",tags:['ONSS · WIDE · Registration'],tc:'vt-tag-b'},
    {n:2,t:'Employment contract drafting',b:"Permanent, fixed-term, full or part-time — Aureus generates templates compliant with the applicable joint committee.",tags:['Permanent · Fixed-term · JC 200'],tc:'vt-tag-au'},
    {n:3,t:'Dimona IN declaration',b:"Mandatory before the start of work. Aureus submits the Dimona IN in under 8 seconds with real-time ONSS confirmation.",tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},
    {n:4,t:'First payroll calculation',b:"Gross → Net: ONSS 13.07%, withholding tax Annex III, employment bonus, low wage reduction. Automatic PDF payslip.",tags:['ONSS · WHT · Employment bonus'],tc:'vt-tag-au'},
    {n:5,t:'SEPA payment & transfer',b:"Aureus generates the SEPA pain.001 file ready to import into your bank. IBAN/BIC validation built in.",tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},
    {n:6,t:'Quarterly ONSS declarations',b:"DmfA XML Q1–Q4 automatically generated with all applicable reductions. Direct ONSS submission.",tags:['DmfA · Q1–Q4'],tc:''},
  ]},
  av:{ey:'2026 incentives',h:'Exemptions & hiring bonuses',items:[
    ['🎁','1st employee exemption','Full exemption from employer ONSS contributions for 5 years. Automatically calculated by Aureus.'],
    ['💼','Activa.brussels','Monthly bonus up to €350 for hiring a Brussels job seeker.'],
    ['📉','Low wage reduction','Employer ONSS reduction for salaries below €3,100/month.'],
    ['🎓','SINE & Activa plan','Reductions for hiring people far from the labour market.'],
    ['👶','Parental leave','Management of contract suspensions, temporary replacements, specific ONSS declarations.'],
    ['📋','MonBEE recruitment','Hiring bonus via MonBEE. Aureus tracks deadlines and generates required documents.'],
  ]},
  cta:{h:'Hire your first employee as early as tomorrow.',sub:'Free demo · Full support · First month free',btn:'Get started →'}};
en.emps={ey:'Employers',bc:'Employers',h:'Your payroll,\nyour declarations,\nautomated.',sub:'166 joint committees, DmfA XML, Belcotax, WinBooks/BOB export — 132 modules for the complete Belgian social cycle.',c1:'Access the platform',c2:'Book a demo',
  card:{label:'Platform in production',title:'Real figures — March 2026',sub:'132 modules · 44,246 lines of code',stats:[['1,274','Payslips calculated'],['392','ONSS declarations'],['42','Companies managed'],['99.97%','Uptime']]},
  mods:{ey:'Features',h:'132 modules for the complete social cycle',items:[
    ['⚡','Electronic Dimona','IN/OUT/UPDATE in under 8 seconds. Direct ONSS connection via Mahis/CSAM.'],
    ['🧮','Belgian payroll calculation','166 JC, 2026 sector scales, ONSS 13.07%, withholding tax Annex III.'],
    ['📋','Quarterly DmfA XML','Q1–Q4 compliant with ONSS. Structural reduction, low wage, employment bonus.'],
    ['📊','Belcotax XML','281.10, 281.20, 281.30 forms compliant with SPF Finance. Direct MyMinfin upload.'],
    ['🏦','SEPA pain.001','ISO 20022 batch payment files. IBAN/BIC validation. All Belgian banks compatible.'],
    ['📁','Accounting export × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, generic CSV.'],
    ['✍️','Electronic signature','Yousign or DocuSign. Legal evidentiary value. Automatic GED archiving.'],
    ['👥','Employee portal','Payslips, HR documents, leave requests — directly accessible by each employee.'],
    ['🔐','GDPR Security Art. 32','AES-256-GCM NISS/IBAN, full audit trail, Supabase RLS, encrypted nightly backup.'],
  ]},
  cta:{h:'See the platform in action.',sub:'Demo on your own data — 30 minutes.',btn:'Book a demo →'}};
en.exp={ey:'Accountants',bc:'Accountants',h:'One portal,\nall your social\nfiles.',sub:'Mahis/CSAM mandates, multi-client portal, REST API, migration from SD Worx or Partena.',c1:'Book accountant demo',c2:'Assisted migration',
  card:{label:'Fiduciary plan',title:'Unlimited multi-files',sub:'Portal · API · SLA · Migration',stats:[['∞','Client files'],['99.9%','SLA guaranteed'],['REST','API + Webhooks'],['Auto','CSV migration']]},
  it:{ey:'What we offer',h:'Built for financial professionals',list:[
    ['01','Centralised multi-client portal','Manage all employer files from a single dashboard. Granular access rights per collaborator.'],
    ['02','Automatic ONSS & Belcotax mandates','Generate compliant Mahis/CSAM mandate agreements. Track active mandates per client.'],
    ['03','REST API + HMAC Webhooks','Integrate Aureus into your ERP. Secure webhooks for payroll, DmfA, and Dimona events.'],
    ['04','Migration from your providers','Multi-format CSV parser from SD Worx, Partena, Securex, Sodexo. Assisted migration included.'],
    ['05','6 accounting export formats','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV. Belgian chart of accounts built in.'],
    ['06','99.9% SLA + Account Manager','Guaranteed response within 2 business hours. Dedicated Slack or Teams channel. Named account manager.'],
  ]},
  mig:{ey:'Migration',h:'Leave SD Worx or Partena without risk.',steps:[['📥','Data export','CSV extraction from your current provider'],['🔄','Automatic import','Aureus multi-format parser — no re-entry'],['✅','Cross-validation','Calculation comparison before go-live'],['🚀','Go-live in 7 days','Files operational from the first cycle']]},
  cta:{h:'Join the accountants who chose independence.',sub:'Assisted migration · 99.9% SLA · First month free',btn:'Accountant demo →'}};
en.form={ey:'Training',bc:'Training',h:'Master Belgian\nemployment law.\nAt your own pace.',sub:'Webinars, practical guides and tutorials on Belgian payroll, ONSS, Dimona and Belcotax.',c1:'See the programme',c2:'Contact us',
  card:{label:'Aureus Training',title:'Learn from experts',sub:'Content based on real platform cases.',stats:[['6','Modules'],['100%','Belgian law 2026'],['CPD','IEC hours'],['FR/NL','Languages']]},
  mods:{ey:'Topics',h:'Our 6 training modules',items:[
    {ico:'⚖️',t:'Belgian employment law',d:'Law of 27/06/1969, ONSS contributions, employer obligations, joint committees — the fundamentals.',f:false},
    {ico:'🧮',t:'Advanced payroll calculation',d:'Gross → Net: ONSS 13.07%, withholding tax Annex III, employment bonus. Practical exercises included.',f:true},
    {ico:'📋',t:'DmfA & Belcotax',d:'Quarterly ONSS declarations, 281.10/20/30 forms, deadlines, corrections — the complete guide.',f:false},
    {ico:'🚀',t:'Aureus Pro onboarding',d:'Complete platform setup: configuration, first payslip, first Dimona — in 2 hours.',f:false},
    {ico:'🏛',t:'GDPR & HR security',d:'GDPR Art. 28 and 32 obligations, Art. 30 register, DPA, NISS/IBAN encryption — full compliance.',f:false},
    {ico:'📊',t:'Continuous legislative watch',d:'Automatic alerts when Belgian law impacts your obligations. 2026 scales updated before entry into force.',f:false},
  ]},
  arts:{ey:'Inspiration',h:'Always ready for the future',items:[
    {ico:'⚖️',tag:'Employment law',t:'First employee: the 5 mistakes to avoid',d:'Late registration, forgotten Dimona, wrong JC — the most common pitfalls.'},
    {ico:'💼',tag:'Entrepreneurship',t:'Freelancer or company: which status in 2026?',d:'Contributions, taxation, social protection — complete comparison.'},
    {ico:'🏥',tag:'Health',t:'Absenteeism: legal obligations of the Belgian employer',d:'Guaranteed salary, medical certificate, medical check — your rights and obligations.'},
    {ico:'🎯',tag:'Motivation',t:'Alternative remuneration: warrants, meal vouchers, company car',d:'Optimise your salary policy with non-statutory benefits.'},
    {ico:'🔐',tag:'GDPR',t:'GDPR & HR data: what every employer needs to know',d:'Processing NISS, IBAN, medical files — Art. 28 and 32 explained simply.'},
    {ico:'🧮',tag:'Payroll',t:'2026 scales: key changes by joint committee',d:'JC 200, 226, 319 — review of new salary grids integrated in Aureus.'},
  ]},
  cta:{h:'Are you starting an activity or looking to grow your business?',sub:'Whatever your question, Aureus gives you clear answers.',btn:'Contact us →'}};
en.con={ey:'Contact',h:'How can we\nhelp you?',sub:'Our team responds within 4 business hours. No chatbot — real Belgian employment law experts.',
  ch:[['✉️','Email','info@aureus-ia.com'],['💻','Application','app.aureussocial.be'],['📍','Address','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Brussels']],
  cr:[['VAT','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Response','< 4 business hours']],
  f:{t:'Book a demo',s:'Guaranteed response within 4 business hours.',fn:'First name *',ln:'Last name *',em:'Professional email *',co:'Company',ro:'You are *',ms:'Message',fnp:'John',lnp:'Smith',emp:'john.smith@accountant.be',cop:'Smith & Partners',msp:'Describe your situation, needs or questions…',sub:'Send request',note:'By submitting this form, you agree to our GDPR policy. No spam.',ok:'✓ Message sent — we will respond within 4 business hours.',roles:['Select...','Freelancer / Starter','Accountant / Fiduciary','Direct employer','Social secretariat','Broker / Partner','Other']}};

const de = JSON.parse(JSON.stringify(fr));
de.topbar={country:'🇧🇪 Belgien',bce:'USt BE 1028.230.781',contact:'Kontakt',client:'Kundenbereich'};
de.nav={demo:'Demo anfordern',login:'Anmelden'};
de.mega[1].label='Selbständige';de.mega[2].label='Arbeitgeber werden';de.mega[3].label='Arbeitgeber';de.mega[4].label='Schulungen';de.mega[5].label='Buchhalter';
de.discover='Entdecken';de.readmore='Lesen';
de.hero={badge:'Digitales belgisches Sozialsekretariat — v18 in Produktion',h1:'Ihr belgischer\nSozialpartner.\nEndlich digital.',sub:'Von Dimona bis zu Quartalsmeldungen, von der Gehaltsabrechnung bis zur elektronischen Unterschrift — alles, was Sie brauchen, an einem Ort.',cta1:'Zur Anwendung',cta2:'Demo anfordern',stats:[['166','Paritätische Kommissionen'],['<8','Dimona (Sek.)'],['132','Aktive Module'],['99.97%','Uptime']]};
de.sol={ey:'Unsere Lösungen',h:'Für jedes Profil, die richtige Lösung.',sub:'Selbständiger, Arbeitgeber oder Buchhalter — Aureus Social Pro passt sich Ihrer Realität an.',items:[
  {ico:'🚀',title:'Als Selbständiger starten',desc:'Status, ONSS-Anschluss, Meldepflichten — alles für einen sicheren Start.',page:'independant'},
  {ico:'👤',title:'Arbeitgeber werden',desc:'Anmeldung, Vertrag, Dimona, erste Gehälter.',page:'employeur',featured:true},
  {ico:'🏢',title:'Arbeitgeber',desc:'Automatisieren Sie Lohnverarbeitung, DmfA, Buchhalterexports.',page:'employeurs'},
  {ico:'🏛',title:'Buchhalter',desc:'Multi-Mandanten-Portal, Mahis/CSAM-Mandate, REST API.',page:'experts'},
  {ico:'📊',title:'Meldungen & Belcotax',desc:'Quartals-DmfA, Belege 281.10/20/30, MyMinfin-Upload.',page:'employeurs'},
  {ico:'📚',title:'Schulungen',desc:'Webinare, Leitfäden zum belgischen Sozialrecht.',page:'formations'},
]};
de.art={ey:'Immer bereit für die Zukunft',h:'Ressourcen & Aktuelles',filters:[['tout','Alle'],['paie','Lohn'],['rh','HR'],['legal','Gesetzgebung'],['onss','ONSS']],items:[
  {cat:'paie',ico:'🧮',tag:'Lohn',title:'Sektorale Gehaltsskalen 2026: Was ändert sich',desc:'Update von 166 paritätischen Kommissionen vor dem 1. Januar.'},
  {cat:'legal',ico:'⚖️',tag:'Gesetzgebung',title:'Beschäftigungsbonus 2026: Neue Obergrenzen',desc:'Das Gehaltsplafond wurde überarbeitet. Auswirkungen auf Ihre Berechnungen.'},
  {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026: Frist und Neuheiten',desc:'Frist, neue Arbeitnehmercodes und strukturelle Verminderung.'},
  {cat:'rh',ico:'👥',tag:'HR',title:'Mitarbeiterportal: Gehaltszettel, Dokumente, Urlaub',desc:'Ihre Mitarbeiter greifen auf ihre Gehaltszettel zu, ohne die Personalabteilung zu kontaktieren.'},
  {cat:'paie',ico:'🏦',tag:'Lohn',title:'SEPA pain.001: Überweisungen automatisieren',desc:'Erstellen Sie Ihre ISO-20022-Batch-Überweisungsdateien.'},
  {cat:'legal',ico:'🔐',tag:'DSGVO',title:'DSGVO Art. 32 & belgische Lohnverarbeitung',desc:'NISS-Verschlüsselung, Register Art. 30, DPA — vollständige Konformität.'},
]};
de.nw={ey:'Newsletter',h:'Verpassen Sie keine Sozialrechts-Neuigkeit.',sub:'Belgische Gesetzesänderungen, aktualisierte Gehaltsskalen, praktische Tipps.',ph:'ihre@email.be',btn:'Anmelden',note:'Datenschutzrichtlinie Aureus IA SPRL. Jederzeit abmeldbar.',ok:'✓ Anmeldung bestätigt — willkommen!',feats:[['⚖️','Tägliche Gesetzgebungsüberwachung','Meldungen, wenn belgisches Recht Ihre Pflichten berührt'],['🧮','Aktualisierte Gehaltsskalen 2026','Neue Kommissionsraster vor deren Inkrafttreten'],['💡','Expertentipps','Praxisleitfäden unserer Sozialrechtsjuristen']]};
de.cta={h:'Bereit, Ihre Sozialverwaltung zu modernisieren?',sub:'Erster Monat kostenlos · Sofortiger Zugang · Migrationsbegleitung',btn:'Jetzt starten →'};
de.ft={col1:'Lösungen',col2:'Produkt',col3:'Rechtliches',copy:'© 2026 Aureus IA SPRL · Alle Rechte vorbehalten',links:['Disclaimer','Datenschutz','Cookie-Richtlinie','AGB'],
  c1:[['Selbständige','independant'],['Arbeitgeber werden','employeur'],['Arbeitgeber','employeurs'],['Buchhalter','experts'],['Schulungen','formations']],
  c2:[['Demo anfordern','contact'],['Dokumentation',null],['Status',null]],
  c3:[['Datenschutz',null],['AGB',null],['DSGVO',null],['Disclaimer',null]]};
de.ind={ey:'Selbständige',bc:'Selbständige',h:'Als Selbständiger\nstarten\nin Belgien.',sub:'Status, ONSS-Anschluss, Beiträge, Pflichten — der vollständige Schritt-für-Schritt-Leitfaden.',c1:'Mit einem Experten sprechen',c2:'Demo anfordern',card:{label:'Aureus Social Pro',title:'Ihr sozialer Back-Office',sub:'Automatisieren Sie Ihre sozialen Pflichten.',stats:[['166','PK verwaltet'],['<8s','Dimona'],['100%','Konform'],['24/7','Zugang']]},
  sy:{ey:'Schritt für Schritt',h:'In 6 Schritten starten',chk:['Dimona IN/OUT < 8s','ONSS-Beiträge 13,07%','PDF-Gehaltszettel','Vierteljährl. DmfA XML','Belcotax 281.10','SEPA pain.001','Elektronische Unterschrift'],chkH:'✅ Was Aureus automatisiert',
    tip:{h:'Gut zu wissen',t:'Im Jahr 2026 profitiert der erste Arbeitnehmer 5 Jahre lang von einer vollständigen Befreiung von den Arbeitgeber-ONSS-Beiträgen.'},
    steps:[{n:1,t:'Ihren Status wählen',b:'Hauptberuflich oder nebenberuflich Selbständiger, Gesellschaft (GmbH, AG…) oder Einzelunternehmen.',tags:['GmbH · AG · Einzelunternehmen'],tc:'vt-tag-au'},
      {n:2,t:'Unternehmensnummer (KBO)',b:'Eintragung in das Handelsregister beim Handelsgericht oder über ein zugelassenes Unternehmensfenster.',tags:['KBO · Schaltstelle'],tc:'vt-tag-b'},
      {n:3,t:'Anschluss an eine Sozialkasse',b:'Gesetzliche Pflicht innerhalb von 90 Tagen nach Tätigkeitsbeginn.',tags:['ONSS · 90 Tage'],tc:'vt-tag-g'},
      {n:4,t:'Vierteljährliche Sozialbeiträge',b:'Satz: 20,5% bis 72.810 € und 14,16% darüber für 2026. Minimum: 870,78 €/Quartal.',tags:['20,5% · Vierteljährlich'],tc:'vt-tag-au'},
      {n:5,t:'MwSt. & Einkommensteuer-Pflichten',b:'MwSt.-Erklärung (monatlich oder vierteljährlich), jährliche Einkommensteuererklärung.',tags:['MwSt. · ESt. · FOD Finanzen'],tc:''},
      {n:6,t:'Sozialschutz',b:'Kranken-/Invaliditätsversicherung (INAMI), Rentenrecht, Kindergeld. Optional: PLCI.',tags:['INAMI · Rente · PLCI'],tc:'vt-tag-g'},
    ]},
  faq:{ey:'Häufig gestellte Fragen',h:'Alles, was Sie wissen möchten',items:[
    ['Wie lange habe ich Zeit für die Anmeldung bei einer Sozialkasse?','Sie haben 90 Tage ab Tätigkeitsbeginn. Bei Überschreitung riskieren Sie eine Zwangsanmeldung und Zuschläge.'],
    ['Wie viel kosten die Sozialbeiträge 2026?','20,5% auf die Tranche bis 72.810,09 € und 14,16% darüber. Absolutes Minimum: 870,78 €/Quartal.'],
    ['Kann ich nebenberuflich selbständig sein, während ich angestellt bin?','Ja, vorbehaltlich der Zustimmung Ihres Arbeitgebers. Ihre Beiträge werden durch das Zusatzregime reduziert.'],
    ['Verwaltet Aureus auch Selbständige in einer Gesellschaft?','Ja, sowohl natürliche Personen als auch Gesellschaftsvertreter (GmbH-Geschäftsführer, AG-Direktoren).'],
  ]},
  cta:{h:'Bereit, mit vollständiger Sicherheit zu starten?',sub:'Unsere Experten begleiten Sie von A bis Z.',btn:'Mit einem Experten sprechen →'}};
de.emp={ey:'Erster Mitarbeiter',bc:'Arbeitgeber werden',h:'Stellen Sie Ihren\nersten Mitarbeiter\nein.',sub:'ONSS-Anmeldung, Vertrag, Dimona, erste Gehälter — Aureus begleitet jeden Schritt.',c1:'Demo anfordern',c2:'Bereits Arbeitgeber →',
  card:{label:'Erster Mitarbeiter in Belgien',title:'Was Aureus für Sie tut',sub:'Vollständige Automatisierung des Sozialdatenzyklus.',stats:[['0€','Arbeitgeberbeiträge Jahr 1'],['8s','Dimona eingereicht'],['100%','ONSS-Konformität'],['166 PK','Alle Kommissionen']]},
  steps:{ey:'Schlüsselschritte',h:'Von 0 zu Ihrem ersten Mitarbeiter',items:[
    {n:1,t:'ONSS-Arbeitgeberanmeldung',b:"Arbeitgebernummer ONSS vor der Einstellung. Aureus begleitet die WIDE-Einreichung und verfolgt die vorläufige Matrikelnummer.",tags:['ONSS · WIDE · Matrikel'],tc:'vt-tag-b'},
    {n:2,t:'Erstellung des Arbeitsvertrags',b:"Unbefristet, befristet, Vollzeit oder Teilzeit — konforme Vorlagen für die zuständige paritätische Kommission.",tags:['Unbefristet · Befristet · PK 200'],tc:'vt-tag-au'},
    {n:3,t:'Dimona IN Meldung',b:"Pflicht vor Arbeitsantritt. Wird in unter 8 Sekunden mit Echtzeit-ONSS-Bestätigung eingereicht.",tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},
    {n:4,t:'Erste Gehaltsberechnung',b:"Brutto → Netto: ONSS 13,07%, Lohnsteuer Anlage III, Beschäftigungsbonus, Niedriglohnverringerung.",tags:['ONSS · LSt · Beschäftigungsbonus'],tc:'vt-tag-au'},
    {n:5,t:'SEPA-Überweisung & Zahlung',b:"Aureus erstellt die SEPA pain.001-Datei zum Import in Ihre Bank. IBAN/BIC-Validierung integriert.",tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},
    {n:6,t:'Vierteljährliche ONSS-Meldungen',b:"DmfA XML Q1–Q4 automatisch mit allen anwendbaren Verminderungen generiert.",tags:['DmfA · Q1–Q4'],tc:''},
  ]},
  av:{ey:'Vorteile 2026',h:'Befreiungen & Einstellungsprämien',items:[
    ['🎁','1. Mitarbeiter-Befreiung','Vollständige Befreiung von Arbeitgeber-ONSS-Beiträgen für 5 Jahre. Automatisch berechnet.'],
    ['💼','Activa.brussels','Monatliche Prämie bis zu 350 € für die Einstellung eines Brüsseler Arbeitssuchenden.'],
    ['📉','Niedriglohnverringerung','Arbeitgeber-ONSS-Reduktion für Löhne unter 3.100 €/Monat.'],
    ['🎓','SINE & Activa-Plan','Vergünstigungen für die Einstellung von arbeitsmarktfernen Personen.'],
    ['👶','Elternzeit','Verwaltung von Vertragsunterbrechungen, vorübergehende Ersetzung, spezifische ONSS-Meldungen.'],
    ['📋','MonBEE Rekrutierung','Einstellungsprämie über MonBEE. Aureus erinnert an Fristen und erstellt erforderliche Dokumente.'],
  ]},
  cta:{h:'Stellen Sie Ihren ersten Mitarbeiter schon morgen ein.',sub:'Kostenlose Demo · Vollständige Begleitung · Erster Monat kostenlos',btn:'Loslegen →'}};
de.emps={ey:'Arbeitgeber',bc:'Arbeitgeber',h:'Ihr Lohn,\nIhre Meldungen,\nautomatisiert.',sub:'166 paritätische Kommissionen, DmfA XML, Belcotax, WinBooks/BOB-Export — 132 Module für den vollständigen belgischen Sozialdatenzyklus.',c1:'Zur Plattform',c2:'Demo anfordern',
  card:{label:'Plattform in Produktion',title:'Echte Zahlen — März 2026',sub:'132 Module · 44.246 Codezeilen',stats:[['1.274','Gehaltszettel berechnet'],['392','ONSS-Meldungen'],['42','Verwaltete Unternehmen'],['99.97%','Uptime']]},
  mods:{ey:'Funktionalitäten',h:'132 Module für den vollständigen Sozialdatenzyklus',items:[
    ['⚡','Elektronische Dimona','IN/OUT/UPDATE in unter 8 Sekunden. Direkte ONSS-Verbindung via Mahis/CSAM.'],
    ['🧮','Belgische Gehaltsberechnung','166 PK, sektorale Skalen 2026, ONSS 13,07%, Lohnsteuer Anlage III.'],
    ['📋','Vierteljährliche DmfA XML','Q1–Q4 ONSS-konform. Strukturelle Verminderung, Niedriglohn, Beschäftigungsbonus.'],
    ['📊','Belcotax XML','Belege 281.10, 281.20, 281.30 konform FOD Finanzen. Direkter MyMinfin-Upload.'],
    ['🏦','SEPA pain.001','ISO-20022-Batch-Überweisungsdateien. IBAN/BIC-Validierung. Alle belgischen Banken.'],
    ['📁','Buchhalterexport × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],
    ['✍️','Elektronische Unterschrift','Yousign oder DocuSign. Gesetzliche Beweiskraft. Automatische GED-Archivierung.'],
    ['👥','Mitarbeiterportal','Gehaltszettel, HR-Dokumente, Urlaubsanträge — direkt für jeden Mitarbeiter zugänglich.'],
    ['🔐','DSGVO-Sicherheit Art. 32','AES-256-GCM NISS/IBAN, vollständiger Audit-Trail, Supabase RLS, verschlüsseltes Nacht-Backup.'],
  ]},
  cta:{h:'Sehen Sie die Plattform in Aktion.',sub:'Demo auf Ihren eigenen Daten — 30 Minuten.',btn:'Demo reservieren →'}};
de.exp={ey:'Buchhalter',bc:'Buchhalter',h:'Ein Portal,\nalle sozialen\nAkten.',sub:'Mahis/CSAM-Mandate, Multi-Mandanten-Portal, REST API, Migration von SD Worx oder Partena.',c1:'Buchhalter-Demo anfordern',c2:'Migrationsbegleitung',
  card:{label:'Treuhänder-Plan',title:'Unbegrenzte Multi-Akten',sub:'Portal · API · SLA · Migration',stats:[['∞','Kundenakten'],['99.9%','SLA garantiert'],['REST','API + Webhooks'],['Auto','CSV-Migration']]},
  it:{ey:'Was wir anbieten',h:'Für Finanzfachleute entwickelt',list:[
    ['01','Zentralisiertes Multi-Mandanten-Portal','Verwalten Sie alle Arbeitgeberakten von einem einzigen Dashboard. Granulare Zugriffsrechte pro Mitarbeiter.'],
    ['02','Automatische ONSS & Belcotax-Mandate','Erstellen Sie konforme Mahis/CSAM-Mandatsvereinbarungen. Verfolgung aktiver Mandate pro Kunde.'],
    ['03','REST API + HMAC-Webhooks','Integrieren Sie Aureus in Ihr ERP. Sichere Webhooks für Lohn-, DmfA- und Dimona-Ereignisse.'],
    ['04','Migration von Ihren Anbietern','Multi-Format-CSV-Parser von SD Worx, Partena, Securex, Sodexo. Begleitete Migration inklusive.'],
    ['05','6 Buchhalterexportformate','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV. Belgischer Kontenplan integriert.'],
    ['06','SLA 99.9% + Account Manager','Antwort garantiert innerhalb von 2 Arbeitsstunden. Dedizierter Slack- oder Teams-Kanal. Fester Account Manager.'],
  ]},
  mig:{ey:'Migration',h:'SD Worx oder Partena ohne Risiko verlassen.',steps:[['📥','Datenexport','CSV-Extraktion von Ihrem aktuellen Anbieter'],['🔄','Automatischer Import','Aureus Multi-Format-Parser — keine Neueingabe'],['✅','Kreuzvalidierung','Berechungsvergleich vor Go-live'],['🚀','Go-live in 7 Tagen','Akten ab dem ersten Zyklus betriebsbereit']]},
  cta:{h:'Schließen Sie sich den Treuhändern an, die Unabhängigkeit gewählt haben.',sub:'Begleitete Migration · SLA 99.9% · Erster Monat kostenlos',btn:'Treuhänder-Demo →'}};
de.form={ey:'Schulungen',bc:'Schulungen',h:'Beherrschen Sie das\nbel. Sozialrecht.\nIn Ihrem Tempo.',sub:'Webinare, Praxisleitfäden und Tutorials zur belgischen Lohnverarbeitung, ONSS, Dimona und Belcotax.',c1:'Programm ansehen',c2:'Kontaktieren Sie uns',
  card:{label:'Aureus Schulungen',title:'Lernen Sie von Experten',sub:'Inhalte aus echten Plattform-Praxisfällen.',stats:[['6','Module'],['100%','Belgisches Recht 2026'],['CPD','IEC-Stunden'],['FR/NL','Sprachen']]},
  mods:{ey:'Themen',h:'Unsere 6 Schulungsmodule',items:[
    {ico:'⚖️',t:'Belgisches Sozialrecht',d:'Gesetz vom 27/06/1969, ONSS-Beiträge, Arbeitgeberpflichten, paritätische Kommissionen.',f:false},
    {ico:'🧮',t:'Erweiterte Gehaltsberechnung',d:'Brutto → Netto: ONSS 13,07%, Lohnsteuer Anlage III, Beschäftigungsbonus. Praktische Übungen.',f:true},
    {ico:'📋',t:'DmfA & Belcotax',d:'Vierteljährliche ONSS-Meldungen, Belege 281.10/20/30, Fristen, Korrekturen.',f:false},
    {ico:'🚀',t:'Onboarding Aureus Pro',d:'Vollständige Inbetriebnahme: Konfiguration, erster Gehaltszettel, erste Dimona — in 2 Stunden.',f:false},
    {ico:'🏛',t:'DSGVO & HR-Sicherheit',d:'Pflichten Art. 28 und 32, Register Art. 30, DPA, NISS/IBAN-Verschlüsselung.',f:false},
    {ico:'📊',t:'Laufende Gesetzgebungsüberwachung',d:'Automatische Meldungen, wenn belgisches Recht Ihre Pflichten berührt.',f:false},
  ]},
  arts:{ey:'Inspiration',h:'Immer bereit für die Zukunft',items:[
    {ico:'⚖️',tag:'Sozialrecht',t:'Erster Mitarbeiter: die 5 Fehler, die es zu vermeiden gilt',d:'Verspätete Anmeldung, vergessene Dimona, falsche PK — die häufigsten Fallen.'},
    {ico:'💼',tag:'Unternehmertum',t:'Selbständiger oder Gesellschaft: Welcher Status 2026?',d:'Beiträge, Steuern, Sozialschutz — vollständiger Vergleich.'},
    {ico:'🏥',tag:'Gesundheit',t:'Fehlzeiten: gesetzliche Pflichten des belgischen Arbeitgebers',d:'Garantiertes Gehalt, Krankenschein, Medizinkontrolle.'},
    {ico:'🎯',tag:'Motivation',t:'Alternative Vergütung: Optionsscheine, Essensgutscheine, Firmenwagen',d:'Optimieren Sie Ihre Gehaltspolitik mit außergesetzlichen Leistungen.'},
    {ico:'🔐',tag:'DSGVO',t:'DSGVO & HR-Daten: Was jeder Arbeitgeber wissen muss',d:'Verarbeitung NISS, IBAN, Krankenakten — Art. 28 und 32.'},
    {ico:'🧮',tag:'Lohn',t:'Gehaltsskalen 2026: wichtigste Änderungen per PK',d:'PK 200, 226, 319 — Überblick über neue Gehaltsraster.'},
  ]},
  cta:{h:'Starten Sie eine Aktivität oder möchten Sie Ihr Unternehmen entwickeln?',sub:'Was auch immer Ihre Frage ist, Aureus gibt Ihnen klare Antworten.',btn:'Kontaktieren Sie uns →'}};
de.con={ey:'Kontakt',h:'Wie können wir\nIhnen helfen?',sub:'Unser Team antwortet innerhalb von 4 Arbeitsstunden. Kein Chatbot — echte Experten im belgischen Sozialrecht.',
  ch:[['✉️','E-Mail','info@aureus-ia.com'],['💻','Anwendung','app.aureussocial.be'],['📍','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Brüssel']],
  cr:[['USt.','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Antwort','< 4 Arbeitsstd.']],
  f:{t:'Demo anfordern',s:'Antwort garantiert innerhalb von 4 Arbeitsstunden.',fn:'Vorname *',ln:'Nachname *',em:'Geschäftliche E-Mail *',co:'Unternehmen',ro:'Sie sind *',ms:'Nachricht',fnp:'Hans',lnp:'Müller',emp:'hans.mueller@buchhalter.be',cop:'Müller & Partner',msp:'Beschreiben Sie Ihre Situation, Bedürfnisse oder Fragen…',sub:'Anfrage senden',note:'Durch das Absenden stimmen Sie unserer DSGVO-Richtlinie zu. Kein Spam.',ok:'✓ Nachricht gesendet — wir antworten innerhalb von 4 Arbeitsstunden.',roles:['Auswählen...','Selbständiger / Starter','Buchhalter / Treuhänder','Direkter Arbeitgeber','Sozialsekretariat','Makler / Partner','Sonstiges']}};

return {fr,nl,en,de};
};
const TDICT = buildT();
// ═══════════════════ END TRANSLATIONS ═══════════════════

const G='#B8913A',G2='#D4A84C',INK='#0E0D0A',CREAM='#F9F6F0',BORDER='#E8E4DC',STONE='#56524A',MIST='#9A968E',WHITE='#fff';
const css=`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Cabinet+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden}
.vt-body{font-family:'Cabinet Grotesk',sans-serif;background:#fff;color:#0E0D0A;-webkit-font-smoothing:antialiased}
.vt-body h1,.vt-body h2,.vt-body h3{font-family:'Fraunces',serif;font-weight:400;line-height:1.08;letter-spacing:-.02em}
.vt-body h1{font-size:clamp(36px,5.5vw,72px)}.vt-body h2{font-size:clamp(28px,3.8vw,50px)}.vt-body h3{font-size:clamp(20px,2.4vw,28px)}
.vt-body p{font-size:16px;line-height:1.75;color:#56524A;font-weight:300}.vt-body em{font-style:italic;color:#B8913A}
.vt-wrap{max-width:1200px;margin:0 auto;padding:0 36px}.vt-sec{padding:88px 0}@media(max-width:768px){.vt-sec{padding:56px 0}.vt-wrap{padding:0 20px}}
.vt-ey{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:#B8913A;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}.vt-ey::before{content:'';width:18px;height:2px;background:#B8913A;border-radius:1px}
.vt-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;border:1px solid #E8E4DC;color:#9A968E;background:#F9F6F0;font-family:'Fira Code',monospace}.vt-tag-g{background:#EAF4EE;border-color:#9EC4B0;color:#1A5C42}.vt-tag-au{background:#FBF3E2;border-color:#D4B870;color:#6A4E10}.vt-tag-b{background:#EDF1F9;border-color:#9EB0D0;color:#18396A}
.btn-p{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:#0E0D0A;color:#fff;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 20px rgba(14,13,10,.18)}.btn-p:hover{background:#252320;transform:translateY(-2px)}
.btn-s{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#0E0D0A;font-size:14px;font-weight:500;border:1.5px solid #E8E4DC;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}.btn-s:hover{border-color:#0E0D0A;background:#F9F6F0}
.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:5px;background:linear-gradient(135deg,#B8913A,#D4A84C);color:#0E0D0A;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 24px rgba(184,145,58,.4)}.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(184,145,58,.5)}
.btn-ow{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#fff;font-size:14px;font-weight:500;border:1.5px solid rgba(255,255,255,.3);cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}.btn-ow:hover{background:rgba(255,255,255,.1)}
.ldot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:ldpulse 2s infinite;display:inline-block}@keyframes ldpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
.hero-dots{position:absolute;inset:0;pointer-events:none;opacity:.15;background-image:radial-gradient(rgba(255,255,255,.6) 1px,transparent 1px);background-size:28px 28px}
.hero-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(184,145,58,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 80% at 10% 80%,rgba(26,92,66,.1) 0%,transparent 60%)}
.sol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:900px){.sol-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.sol-grid{grid-template-columns:1fr}}
.sol-card{background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:32px 28px;cursor:pointer;transition:all .28s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px}.sol-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#B8913A,transparent);transform:scaleX(0);transform-origin:left;transition:transform .32s}.sol-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-4px)}.sol-card:hover::after{transform:scaleX(1)}.sol-card.featured{background:#0E0D0A;border-color:#0E0D0A}.sol-card.featured h4,.sol-card.featured .sdesc{color:rgba(255,255,255,.85)}.sol-card.featured p{color:rgba(255,255,255,.5)}
.sol-ico{width:48px;height:48px;border-radius:10px;background:#F1EDE6;border:1px solid #E8E4DC;display:flex;align-items:center;justify-content:center;font-size:22px}.sol-card.featured .sol-ico{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.15)}
.sol-card h4{font-size:17px;font-weight:700;color:#0E0D0A;line-height:1.3;font-family:'Cabinet Grotesk',sans-serif}.sdesc{font-size:14px;color:#56524A;line-height:1.7;flex:1}.slink{font-size:13px;font-weight:600;color:#B8913A;display:flex;align-items:center;gap:5px}.sol-card.featured .slink{color:#D4A84C}
.hs-strip{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.08)}.hs-i{padding:24px 28px;border-right:1px solid rgba(255,255,255,.07)}.hs-i:last-child{border-right:none}.hs-v{font-family:'Fraunces',serif;font-size:clamp(24px,3vw,40px);color:#fff;line-height:1;margin-bottom:6px}.hs-v span{color:#D4A84C}.hs-l{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.06em;text-transform:uppercase;font-weight:500}@media(max-width:640px){.hs-strip{grid-template-columns:repeat(2,1fr)}.hs-i:nth-child(2){border-right:none}.hs-i:nth-child(3){border-right:1px solid rgba(255,255,255,.07)}}
.tc{background:#fff;border:1px solid #E8E4DC;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .25s}.tc:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}.tc-img{height:160px;background:#F1EDE6;display:flex;align-items:center;justify-content:center;font-size:48px;border-bottom:1px solid #E8E4DC}.tc-body{padding:20px}.tc-tag{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B8913A;margin-bottom:8px;display:block}.tc h4{font-size:15px;font-weight:600;color:#0E0D0A;margin-bottom:8px;line-height:1.4;font-family:'Cabinet Grotesk',sans-serif}.tc p{font-size:13px;color:#56524A;line-height:1.65}.tc-cta{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#B8913A;margin-top:14px}
.tc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:900px){.tc-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.tc-grid{grid-template-columns:1fr}}
.ttab{padding:9px 20px;border-radius:99px;font-size:14px;font-weight:500;color:#56524A;border:1.5px solid #E8E4DC;background:transparent;cursor:pointer;transition:all .2s;font-family:'Cabinet Grotesk',sans-serif}.ttab.active,.ttab:hover{background:#0E0D0A;color:#fff;border-color:#0E0D0A}
.nl-in{flex:1;min-width:220px;padding:13px 18px;border-radius:5px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-family:'Cabinet Grotesk',sans-serif;font-size:15px;outline:none;transition:border-color .2s}.nl-in::placeholder{color:rgba(255,255,255,.35)}.nl-in:focus{border-color:#B8913A}
.step{display:grid;grid-template-columns:56px 1fr;gap:24px;padding:32px 0;border-bottom:1px solid #E8E4DC}.step:last-child{border-bottom:none}.step-n{width:48px;height:48px;border-radius:50%;background:#0E0D0A;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:20px;flex-shrink:0;margin-top:2px}
.ic{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:900px){.ic{grid-template-columns:1fr 1fr}}@media(max-width:560px){.ic{grid-template-columns:1fr}}.ic-c{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;transition:all .25s}.ic-c:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.faq-i{border-bottom:1px solid #E8E4DC}.faq-q{width:100%;padding:20px 0;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:600;color:#0E0D0A;text-align:left;gap:16px;transition:color .2s}.faq-q:hover{color:#B8913A}.faq-arr{font-size:20px;color:#9A968E;transition:transform .3s,color .2s;flex-shrink:0}.faq-open .faq-arr{transform:rotate(45deg);color:#B8913A}.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease}
.dk-card{background:#0E0D0A;border-radius:16px;padding:32px;color:#fff;position:relative;overflow:hidden}.dk-card::before{content:'';position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(184,145,58,.2) 0%,transparent 70%)}
.eg{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}@media(max-width:700px){.eg{grid-template-columns:1fr}}.eg-c{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;display:flex;gap:18px;align-items:flex-start;transition:all .25s}.eg-c:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.ch{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:10px;border:1px solid #E8E4DC;background:#F9F6F0;transition:all .22s;cursor:pointer;margin-bottom:12px}.ch:hover{border-color:#B8913A;background:#FBF3E2}
.fi,.fse,.fta{padding:11px 14px;border-radius:5px;border:1.5px solid #E8E4DC;background:#F9F6F0;font-family:'Cabinet Grotesk',sans-serif;font-size:14px;color:#0E0D0A;transition:all .2s;outline:none;width:100%}.fi:focus,.fse:focus,.fta:focus{border-color:#B8913A;background:#fff;box-shadow:0 0 0 3px rgba(184,145,58,.1)}.fta{resize:vertical;min-height:100px}.fse{appearance:none;cursor:pointer}
.phg{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}@media(max-width:800px){.phg{grid-template-columns:1fr;gap:36px}}
.ftg{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}@media(max-width:900px){.ftg{grid-template-columns:1fr 1fr;gap:28px}}@media(max-width:560px){.ftg{grid-template-columns:1fr}}
.lang-btn{padding:5px 10px;border-radius:5px;font-size:12px;font-weight:700;border:1.5px solid transparent;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all .2s;background:transparent;color:rgba(255,255,255,.5)}.lang-btn.active{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}.lang-btn:hover{color:#fff}`;

const Arr = () => (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>);

function DkCard({label,title,sub,stats}){return(<div className="dk-card"><div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:G,marginBottom:16}}>{label}</div><h3 style={{color:'#fff',fontSize:20,marginBottom:8}}>{title}</h3><p style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>{sub}</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>{stats.map(([v,l])=>(<div key={l}><div style={{fontFamily:"'Fraunces',serif",fontSize:26,color:G,marginBottom:2}}>{v}</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)',letterSpacing:'.04em'}}>{l}</div></div>))}</div></div>);}

function CtaBand({h,sub,btn,go}){return(<div style={{background:INK,padding:'72px 0',textAlign:'center',position:'relative',overflow:'hidden'}}><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 120% at 50% 100%,rgba(184,145,58,.1) 0%,transparent 70%)'}}/><div style={{position:'relative',zIndex:1}} className="vt-wrap"><h2 style={{color:'#fff',marginBottom:14}}>{h}</h2><p style={{color:'rgba(255,255,255,.5)',maxWidth:440,margin:'0 auto 32px',fontSize:17}}>{sub}</p><button className="btn-gold" onClick={()=>go('contact')}>{btn}</button></div></div>);}

function Newsletter({t,go}){const[email,setEmail]=useState('');const[sent,setSent]=useState(false);const nw=t.nw;return(<section style={{background:INK,padding:'72px 0'}}><div className="vt-wrap"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}><div><div className="vt-ey" style={{color:G2}}>{nw.ey}</div><h2 style={{color:'#fff',marginBottom:16,whiteSpace:'pre-line'}}>{nw.h.replace(/\\n/g,'\n').split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===nw.h.split('\n').length-1?<em style={{color:G2}}>{l}</em>:l}</span>))}</h2><p style={{color:'rgba(255,255,255,.5)',marginBottom:28}}>{nw.sub}</p>{sent?(<div style={{padding:'14px 20px',borderRadius:10,background:'rgba(34,197,94,.15)',border:'1px solid rgba(34,197,94,.3)',color:'#86efac',fontSize:15}}>{nw.ok}</div>):(<><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><input className="nl-in" type="email" placeholder={nw.ph} value={email} onChange={e=>setEmail(e.target.value)}/><button className="btn-gold" onClick={()=>{if(email)setSent(true);}}>{nw.btn}</button></div><p style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:10,lineHeight:1.6}}>{nw.note}</p></>)}</div><div style={{display:'flex',flexDirection:'column',gap:14}}>{nw.feats.map(([ico,tt,d])=>(<div key={tt} style={{display:'flex',alignItems:'flex-start',gap:12}}><div style={{width:32,height:32,borderRadius:7,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{ico}</div><div><div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:2}}>{tt}</div><div style={{fontSize:13,color:'rgba(255,255,255,.45)'}}>{d}</div></div></div>))}</div></div></div></section>);}

function Footer({t,go}){const ft=t.ft;return(<footer style={{background:INK,padding:'60px 0 0'}}><div className="vt-wrap"><div className="ftg"><div><div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:14}} onClick={()=>go('home')}><div style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg></div><div><div style={{fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'.04em'}}>AUREUS</div><div style={{fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:'.2em',textTransform:'uppercase'}}>Social Pro</div></div></div><p style={{fontSize:14,color:'rgba(255,255,255,.4)',lineHeight:1.7,marginBottom:14,maxWidth:260}}>Secrétariat social numérique belge. 132 modules, 166 CP.</p><div style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:'rgba(255,255,255,.2)'}}>{t.topbar.bce} · Saint-Gilles</div></div>{[[ft.col1,ft.c1],[ft.col2,ft.c2],[ft.col3,ft.c3]].map(([title,links])=>(<div key={title}><div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:12}}>{title}</div><div style={{display:'flex',flexDirection:'column',gap:9}}>{links.map(([label,page])=>(<a key={label} onClick={()=>page&&go(page)} style={{fontSize:14,color:'rgba(255,255,255,.45)',cursor:'pointer',transition:'color .18s'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.45)'}>{label}</a>))}</div></div>))}</div><div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}><span style={{fontSize:12,color:'rgba(255,255,255,.25)'}}>{ft.copy}</span><div style={{display:'flex',gap:16}}>{ft.links.map(l=>(<a key={l} style={{fontSize:12,color:'rgba(255,255,255,.25)',cursor:'pointer'}}>{l}</a>))}</div></div></div></footer>);}

function PageHome({t,go}){const[filter,setFilter]=useState('tout');const art=t.art;const vis=art.items.filter(a=>filter==='tout'||a.cat===filter);const sol=t.sol;const hero=t.hero;return(<><section style={{background:INK,padding:'80px 0 0',position:'relative',overflow:'hidden',minHeight:560,display:'flex',flexDirection:'column'}}><div className="hero-glow"/><div className="hero-dots"/><div className="vt-wrap" style={{position:'relative',zIndex:1,flex:1,display:'flex',alignItems:'center',paddingBottom:0}}><div style={{maxWidth:640}}><div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:99,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:24}}><span className="ldot"/>&nbsp;{hero.badge}</div><h1 style={{color:'#fff',marginBottom:20,whiteSpace:'pre-line'}}>{hero.h1.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:'rgba(255,255,255,.6)',marginBottom:36,lineHeight:1.7,fontWeight:300,maxWidth:520}}>{hero.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:60}}><button className="btn-gold" onClick={()=>go('app')}>{hero.cta1} <Arr/></button><button className="btn-ow" onClick={()=>go('contact')}>{hero.cta2}</button></div></div></div><div className="hs-strip">{hero.stats.map(([v,l])=>(<div key={l} className="hs-i"><div className="hs-v"><span>{v}</span></div><div className="hs-l">{l}</div></div>))}</div></section><section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{sol.ey}</div><h2>{sol.h}</h2><p style={{maxWidth:520,marginTop:12}}>{sol.sub}</p></div><div className="sol-grid">{sol.items.map(s=>(<div key={s.title} className={`sol-card${s.featured?' featured':''}`} onClick={()=>go(s.page)}><div className="sol-ico">{s.ico}</div><h4>{s.title}</h4><p className="sdesc">{s.desc}</p><div className="slink">{t.discover} <Arr/></div></div>))}</div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:32}}><div className="vt-ey">{art.ey}</div><h2>{art.h}</h2></div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:40}}>{art.filters.map(([k,l])=>(<button key={k} className={`ttab${filter===k?' active':''}`} onClick={()=>setFilter(k)}>{l}</button>))}</div><div className="tc-grid">{vis.map(a=>(<div key={a.title} className="tc"><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{a.tag}</span><h4>{a.title}</h4><p>{a.desc}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}</div></div></section><Newsletter t={t} go={go}/><CtaBand h={t.cta.h} sub={t.cta.sub} btn={t.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageInd({t,go}){const d=t.ind;const[openFaq,setOpenFaq]=useState(null);return(<><section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div><div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:MIST,marginBottom:20}}>{'Accueil'} <span style={{color:G}}>›</span> {d.bc}</div><div className="vt-ey">{d.ey}</div><h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div></div><DkCard {...d.card}/></div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.sy.ey}</div><h2>{d.sy.h}</h2></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'start'}}><div>{d.sy.steps.map(s=>(<div key={s.n} className="step"><div className="step-n">{s.n}</div><div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:17,fontWeight:700,color:INK,marginBottom:8}}>{s.t}</h4><p style={{fontSize:15}}>{s.b}</p><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{s.tags.map(tag=>(<span key={tag} className={`vt-tag ${s.tc}`}>{tag}</span>))}</div></div></div>))}</div><div><div style={{background:CREAM,border:`1px solid ${BORDER}`,borderRadius:10,padding:28,marginBottom:20}}><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,marginBottom:16}}>{d.sy.chkH}</h4>{d.sy.chk.map(item=>(<div key={item} style={{display:'flex',gap:10,fontSize:14,color:STONE,marginBottom:10}}><span style={{color:'#22C55E',flexShrink:0}}>✓</span>{item}</div>))}</div><div style={{background:'#FBF3E2',border:'1px solid #D4B870',borderRadius:10,padding:24}}><div style={{fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7A5010',marginBottom:12}}>{d.sy.tip.h}</div><p style={{fontSize:14,color:'#5A3A0A',lineHeight:1.7}}>{d.sy.tip.t}</p></div></div></div></div></section><section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap"><div style={{textAlign:'center',marginBottom:48}}><div className="vt-ey">{d.faq.ey}</div><h2>{d.faq.h}</h2></div><div style={{maxWidth:720,margin:'0 auto'}}>{d.faq.items.map(([q,a],i)=>(<div key={i} className={`faq-i${openFaq===i?' faq-open':''}`}><button className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>{q}<span className="faq-arr">+</span></button><div className="faq-a" style={{maxHeight:openFaq===i?200:0}}><div style={{padding:'0 0 20px',fontSize:15,color:STONE,lineHeight:1.75}}>{a}</div></div></div>))}</div></div></section><CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageEmp({t,go}){const d=t.emp;return(<><section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div><div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:MIST,marginBottom:20}}>{'Accueil'} <span style={{color:G}}>›</span> {d.bc}</div><div className="vt-ey">{d.ey}</div><h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('employeurs')}>{d.c2}</button></div></div><DkCard {...d.card}/></div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.steps.ey}</div><h2>{d.steps.h}</h2></div><div style={{maxWidth:680}}>{d.steps.items.map(s=>(<div key={s.n} className="step"><div className="step-n">{s.n}</div><div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:17,fontWeight:700,color:INK,marginBottom:8}}>{s.t}</h4><p style={{fontSize:15}}>{s.b}</p><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{s.tags.map(tag=>(<span key={tag} className={`vt-tag ${s.tc}`}>{tag}</span>))}</div></div></div>))}</div></div></section><section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap"><div style={{textAlign:'center',marginBottom:48}}><div className="vt-ey">{d.av.ey}</div><h2>{d.av.h}</h2></div><div className="ic">{d.av.items.map(([ico,tt,desc])=>(<div key={tt} className="ic-c"><div style={{fontSize:28,marginBottom:14}}>{ico}</div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,fontWeight:700,color:INK,marginBottom:8}}>{tt}</h4><p style={{fontSize:14}}>{desc}</p></div>))}</div></div></section><CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageEmps({t,go}){const d=t.emps;return(<><section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div><div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:MIST,marginBottom:20}}>{'Accueil'} <span style={{color:G}}>›</span> {d.bc}</div><div className="vt-ey">{d.ey}</div><h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('app')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div></div><DkCard {...d.card}/></div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.mods.ey}</div><h2>{d.mods.h}</h2></div><div className="ic">{d.mods.items.map(([ico,tt,desc])=>(<div key={tt} className="ic-c"><div style={{fontSize:28,marginBottom:14}}>{ico}</div><h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,fontWeight:700,color:INK,marginBottom:8}}>{tt}</h4><p style={{fontSize:14}}>{desc}</p></div>))}</div></div></section><CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageExp({t,go}){const d=t.exp;return(<><section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div><div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:MIST,marginBottom:20}}>{'Accueil'} <span style={{color:G}}>›</span> {d.bc}</div><div className="vt-ey">{d.ey}</div><h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div></div><DkCard {...d.card}/></div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.it.ey}</div><h2>{d.it.h}</h2></div><div className="eg">{d.it.list.map(([n,tt,desc])=>(<div key={n} className="eg-c"><div style={{fontFamily:"'Fraunces',serif",fontSize:36,color:CREAM,lineHeight:1,flexShrink:0,width:44}}>{n}</div><div><div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:6,fontFamily:"'Cabinet Grotesk',sans-serif"}}>{tt}</div><div style={{fontSize:14,color:STONE,lineHeight:1.7}}>{desc}</div></div></div>))}</div></div></section><section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap"><div style={{textAlign:'center',marginBottom:48}}><div className="vt-ey">{d.mig.ey}</div><h2>{d.mig.h}</h2></div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,maxWidth:900,margin:'0 auto'}}>{d.mig.steps.map(([ico,tt,desc])=>(<div key={tt} style={{textAlign:'center',padding:'24px 16px',background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10}}><div style={{fontSize:28,marginBottom:12}}>{ico}</div><div style={{fontWeight:700,fontSize:14,color:INK,marginBottom:6}}>{tt}</div><div style={{fontSize:13,color:STONE}}>{desc}</div></div>))}</div></div></section><CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageForm({t,go}){const d=t.form;return(<><section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div><div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:MIST,marginBottom:20}}>{'Accueil'} <span style={{color:G}}>›</span> {d.bc}</div><div className="vt-ey">{d.ey}</div><h1 style={{marginBottom:18,whiteSpace:'pre-line'}}>{d.h.split('\n').map((l,i)=>(<span key={i}>{i>0&&<br/>}{i===2?<em>{l}</em>:l}</span>))}</h1><p style={{fontSize:18,color:STONE,marginBottom:28,fontWeight:300}}>{d.sub}</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn-p" onClick={()=>go('contact')}>{d.c1}</button><button className="btn-s" onClick={()=>go('contact')}>{d.c2}</button></div></div><DkCard {...d.card}/></div></div></section><section className="vt-sec" style={{background:CREAM}}><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.mods.ey}</div><h2>{d.mods.h}</h2></div><div className="sol-grid">{d.mods.items.map(m=>(<div key={m.t} className={`sol-card${m.f?' featured':''}`} onClick={()=>go('contact')}><div className="sol-ico">{m.ico}</div><h4>{m.t}</h4><p className="sdesc">{m.d}</p><div className="slink">{t.discover} <Arr/></div></div>))}</div></div></section><section className="vt-sec"><div className="vt-wrap"><div style={{marginBottom:48}}><div className="vt-ey">{d.arts.ey}</div><h2>{d.arts.h}</h2></div><div className="tc-grid">{d.arts.items.map(a=>(<div key={a.t} className="tc"><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{a.tag}</span><h4>{a.t}</h4><p>{a.d}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}</div></div></section><Newsletter t={t} go={go}/><CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/></>);}

function PageCon({t,go}){const d=t.con;const[sent,setSent]=useState(false);return(<><section className="vt-sec"><div className="vt-wrap"><div style={{display:'grid',gridTemplateColumns:'1fr 1.3fr',gap:72,alignItems:'start'}}><div><div className="vt-ey">{d.ey}</div><h2 style={{whiteSpace:'pre-line'}}>{d.h}</h2><p style={{margin:'16px 0 28px',fontSize:17}}>{d.sub}</p>{d.ch.map(([ico,l,v])=>(<div key={l} className="ch"><div style={{width:40,height:40,borderRadius:9,background:WHITE,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{ico}</div><div><div style={{fontSize:13,fontWeight:600,color:INK,marginBottom:2}}>{l}</div><div style={{fontSize:14,color:STONE}}>{v}</div></div></div>))}<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>{d.cr.map(([l,v])=>(<div key={l} style={{background:CREAM,border:`1px solid ${BORDER}`,borderRadius:5,padding:14}}><div style={{fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:MIST,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Fira Code',monospace",fontSize:12,color:INK}}>{v}</div></div>))}</div></div><div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:'36px 32px',boxShadow:'0 8px 40px rgba(14,13,10,.12)'}}><div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:INK,marginBottom:6,fontWeight:400}}>{d.f.t}</div><div style={{fontSize:14,color:MIST,marginBottom:28}}>{d.f.s}</div>{sent?(<div style={{padding:'20px',borderRadius:10,background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',color:'#166534',fontSize:16,textAlign:'center'}}>{d.f.ok}</div>):(<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>{[[d.f.fn,'text',d.f.fnp],[d.f.ln,'text',d.f.lnp]].map(([l,,ph])=>(<div key={l} style={{display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{l}</label><input className="fi" type="text" placeholder={ph}/></div>))}<div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.em}</label><input className="fi" type="email" placeholder={d.f.emp}/></div><div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.co}</label><input className="fi" type="text" placeholder={d.f.cop}/></div><div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ro}</label><select className="fse">{d.f.roles.map(o=>(<option key={o}>{o}</option>))}</select></div><div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ms}</label><textarea className="fta" placeholder={d.f.msp}/></div></div><button onClick={()=>setSent(true)} style={{width:'100%',marginTop:6,padding:14,borderRadius:5,border:'none',background:INK,color:WHITE,fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .22s'}} onMouseOver={e=>e.currentTarget.style.background='#252320'} onMouseOut={e=>e.currentTarget.style.background=INK}>{d.f.sub} <Arr/></button><p style={{fontSize:11,color:MIST,textAlign:'center',marginTop:10,lineHeight:1.6}}>{d.f.note}</p></>)}</div></div></div></section><Footer t={t} go={go}/></>);}

const PAGES={home:PageHome,independant:PageInd,employeur:PageEmp,employeurs:PageEmps,experts:PageExp,formations:PageForm,contact:PageCon};

export default function VitrinePage(){
  const[page,setPage]=useState('home');
  const[lang,setLang]=useState('fr');
  const[openMega,setOpenMega]=useState(null);
  const[scrolled,setScrolled]=useState(false);
  const navRef=useRef(null);
  const t=TDICT[lang];

  const go=(p)=>{
    if(p==='app'){window.location.href='/login';return;}
    setPage(p);setOpenMega(null);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>10);window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);},[]);
  useEffect(()=>{const h=(e)=>{if(navRef.current&&!navRef.current.contains(e.target))setOpenMega(null);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

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
            <div style={{width:32,height:32,borderRadius:7,background:INK,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg></div>
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
                      <div key={tt} onClick={()=>go(pg)} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'12px 14px',borderRadius:6,cursor:'pointer',transition:'background .18s'}} onMouseOver={e=>e.currentTarget.style.background=CREAM} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
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
            <button onClick={()=>go('app')} style={{padding:'8px 16px',borderRadius:5,fontSize:13,fontWeight:500,color:STONE,border:`1.5px solid ${BORDER}`,background:'transparent',cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",transition:'all .2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor=INK;e.currentTarget.style.color=INK;}} onMouseOut={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=STONE;}}>
              {t.nav.login}
            </button>
            <button onClick={()=>go('contact')} style={{padding:'9px 18px',borderRadius:5,fontSize:13,fontWeight:600,color:WHITE,background:INK,border:'none',cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",transition:'all .22s',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}} onMouseOver={e=>e.currentTarget.style.background='#252320'} onMouseOut={e=>e.currentTarget.style.background=INK}>
              {t.nav.demo} <Arr/>
            </button>
          </div>
        </div>
      </nav>

      <div style={{paddingTop:36+64}}>
        <PageComp t={t} go={go}/>
      </div>
    </div>
  );
}
