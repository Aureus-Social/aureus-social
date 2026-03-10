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
  hero:{badge:'Secrétariat social numérique — v18 en production',h1:'Votre partenaire\nsocial belge.\nEnfin numérique.',sub:"De la Dimona aux déclarations trimestrielles — tout ce dont vous avez besoin, en un seul endroit.",cta1:"Accéder à l'application",cta2:'Voir la démo',stats:[['166','Commissions paritaires'],['< 8s','Dimona soumise'],['47K+','Fiches de paie'],['10.000+','Entreprises gérées']]},
  logos:{title:'Ils ont fait confiance à Aureus Social Pro',items:['PME Bruxelles','Fiduciaire Dupont','Cabinet Janssen','RH Partners','Comptaflex','StartBE']},
  mockup:{badge:'Interface temps réel',title:'Tout votre cycle social\nen un tableau de bord.',sub:'Tableau de bord unifié, alertes ONSS en temps réel, export comptable en un clic.',features:['Fiche de paie générée en 3 clics','Dimona IN/OUT < 8 secondes','DmfA XML prête au 5 du mois','Backup nocturne chiffré AES-256'],db:{title:'Tableau de bord',stats:[['47.2K','Fiches de paie','📄'],['18.6K','Déclarations ONSS','📋'],['10.000+','Entreprises','🏢'],['99.97%','Uptime','⚡']],chart:'Paie Q1 2026',badges:[{l:'Dimona',c:'#22C55E',v:'8 min ago'},{l:'DmfA Q1',c:'#D4A84C',v:'Prêt'},{l:'Belcotax',c:'#60A5FA',v:'Avant le 5/04'}]}},
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
    {cat:'paie',ico:'🧮',tag:'Paie',title:'Barèmes sectoriels 2026 : ce qui change',slug:'baremes-2026',desc:'Mise à jour des 166 CP intégrée dans Aureus Social Pro avant le 1er janvier.'},
    {cat:'legal',ico:'⚖️',tag:'Législation',title:'Bonus emploi 2026 : nouveaux plafonds',slug:'bonus-emploi-2026',desc:'Le plafond salarial a été révisé. Impact sur vos calculs.'},
    {cat:'onss',ico:'🏛',tag:'ONSS',title:'DmfA Q1 2026 : délai et nouveautés',slug:'dmfa-q1-2026',desc:'Date limite, nouveaux codes travailleurs et réduction structurelle.'},
    {cat:'rh',ico:'👥',tag:'RH',title:'Portail employé : fiches, documents, congés',slug:'portail-employe',desc:'Vos collaborateurs accèdent à leurs fiches sans solliciter le service paie.'},
    {cat:'paie',ico:'🏦',tag:'Paie',title:'SEPA pain.001 : automatisez vos virements',slug:'sepa-pain001',desc:'Fichiers virement batch ISO 20022.'},
    {cat:'legal',ico:'🔐',tag:'RGPD',title:'RGPD Art. 32 & paie belge',slug:'rgpd-paie-belge',desc:'Chiffrement NISS, registre Art. 30, DPA — conformité complète.'},
  ]},
  nw:{ey:'Newsletter',h:'Ne manquez aucune actualité sociale.',sub:'Changements législatifs, barèmes mis à jour, conseils pratiques.',ph:'votre@email.be',btn:"S'inscrire",note:'Politique de confidentialité Aureus IA SPRL.',ok:'✓ Inscription confirmée — bienvenue !',feats:[['⚖️','Veille législative quotidienne','Alertes dès qu\'une loi impacte vos obligations'],['🧮','Barèmes 2026 mis à jour','Nouvelles grilles CP avant entrée en vigueur'],['💡',"Conseils d'experts","Fiches pratiques de nos juristes"]]},
  cta:{h:'Prêt à moderniser votre gestion sociale ?',sub:'Premier mois offert · Accès immédiat · Migration assistée',btn:'Accéder maintenant →'},
  back:'← Retour',artBack:'Retour',artToc:'Dans cet article',artRead:' de lecture',autoManaged:'Tous ces sujets sont gérés automatiquement dans Aureus Social Pro.',
  ft:{col1:'Solutions',col2:'Produit',col3:'Légal',copy:'© 2026 Aureus IA SPRL · Tous droits réservés',links:['Disclaimer','Privacy','Cookie policy','CGU'],desc:'Secrétariat social numérique belge. 132 modules, 166 CP.',
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
      ['🎁','Exemption 1er employé',"Exonération totale des cotisations patronales ONSS pendant 5 ans.","En engageant votre premier travailleur, vous bénéficiez d'une exonération totale et définitive des cotisations patronales ONSS — pour toute la durée de cet emploi. Pour les employés suivants (2e au 6e), l'exonération est partielle et dégressive. Conditions : le travailleur doit être en CDI ou CDD > 3 mois, et aucun licenciement dans les 6 mois précédents. Aureus calcule automatiquement l'exonération applicable."],
      ['💼','Activa.brussels',"Prime mensuelle jusqu'à 350 € pour un demandeur d'emploi bruxellois.","Activa.brussels est une prime d'activation à l'emploi bruxelloise. L'employeur reçoit jusqu'à 350 €/mois pendant 12 à 30 mois selon le profil du travailleur. Conditions : le travailleur doit être inscrit comme demandeur d'emploi auprès d'Actiris, résider en Région de Bruxelles-Capitale, et être engagé en CDI ou CDD > 6 mois. Attestation N° à conserver. Aureus génère le suivi automatique des primes et des délais MonBEE."],
      ['📉','Réduction bas salaire',"Réduction ONSS patronale pour salaires inférieurs à 3 100 €/mois.","La réduction structurelle 'bas salaire' est une réduction des cotisations patronales ONSS pour les travailleurs dont le salaire trimestriel est inférieur à un certain seuil (environ 9.300 € brut/trimestre pour 2026). Elle peut atteindre 438,00 €/trimestre pour les très bas salaires. Elle est cumulable avec l'exonération 1er employé. Aureus applique automatiquement la formule ONSS dans le calcul de la DmfA."],
      ['🎓','SINE & plan Activa',"Réductions pour l'engagement de personnes éloignées du marché de l'emploi.","Le plan SINE (Secteur de l'Insertion socioprofessionnelle et de l'Économie sociale) et le plan Activa permettent d'engager des personnes très éloignées du marché du travail avec des réductions de cotisations ONSS importantes. Pour SINE : exonération totale des cotisations patronales pendant 4 trimestres, puis 50% les 4 suivants. Pour Activa : réduction de 1.000 €/trimestre pendant 5 trimestres. Conditions strictes sur le profil du travailleur — Aureus vérifie l'éligibilité automatiquement."],
      ['👶','Congé parental',"Gestion des suspensions de contrat et déclarations ONSS spécifiques.","Le congé parental permet à un travailleur de suspendre ou réduire son contrat pour s'occuper d'un enfant de moins de 12 ans (ou 21 ans si handicapé). Durée : 4 mois temps plein équivalent, pouvant être pris en temps plein, mi-temps ou 1/5. Pendant le congé, l'INAMI verse une allocation. L'employeur doit déclarer la suspension via des codes ONSS spécifiques dans la DmfA. Aureus gère les codes 70, 71, 72 et l'impact sur le calcul du salaire garanti."],
      ['📋','MonBEE recrutement',"Prime à l'embauche via MonBEE. Délais et documents générés automatiquement.","MonBEE (Mon Bureau d'Emploi et d'Économie) est la plateforme bruxelloise centralisant les primes à l'embauche. Pour bénéficier des primes Activa.brussels, l'employeur doit introduire une demande via MonBEE dans les 30 jours suivant l'engagement. Documents requis : contrat de travail, attestation de chômage, formulaire C4. Aureus génère automatiquement un rappel 5 jours avant la deadline et prépare les documents nécessaires."],
    ]},
    cta:{h:"Engagez votre premier collaborateur dès demain.",sub:'Démo gratuite · Accompagnement complet · Premier mois offert',btn:'Démarrer →'}},
  emps:{ey:'Employeurs',bc:'Employeurs',h:'Votre paie,\nvos déclarations,\nautomatisées.',sub:'166 commissions paritaires, DmfA XML, Belcotax, export WinBooks/BOB — 132 modules.',c1:'Accéder à la plateforme',c2:'Demander une démo',
    card:{label:'Plateforme en production',title:'Chiffres réels — Mars 2026',sub:'132 modules · 44 246 lignes de code',stats:[['47.2K','Fiches calculées'],['18.6K','Déclarations ONSS'],['10.000+','Entreprises gérées'],['99.97%','Uptime']]},
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
      {ico:'⚖️',tag:'Droit social',t:"Premier employé : les 5 erreurs à éviter",d:"Immatriculation tardive, Dimona oubliée, CP incorrecte — les pièges fréquents.",slug:'5-erreurs-premier-employe'},
      {ico:'💼',tag:'Entrepreneuriat',t:"Indépendant ou société : quel statut en 2026 ?",d:"Cotisations, fiscalité, protection sociale — comparaison complète.",slug:'independant-ou-societe-2026'},
      {ico:'🏥',tag:'Santé',t:"Absentéisme : obligations légales de l'employeur",d:"Salaire garanti, certificat médical, contrôle médical.",slug:'absenteisme-obligations'},
      {ico:'🎯',tag:'Motivation',t:"Rémunération alternative : warrants, chèques-repas, voiture",d:"Optimisez votre politique salariale avec les avantages extralégaux.",slug:'remuneration-alternative'},
      {ico:'🔐',tag:'RGPD',t:"RGPD & données RH : ce que tout employeur doit savoir",d:"Traitement NISS, IBAN, dossiers médicaux — Art. 28 et 32.",slug:'rgpd-donnees-rh'},
      {ico:'🧮',tag:'Paie',t:"Barèmes 2026 : les changements clés par CP",d:"CP 200, 226, 319 — revue des nouvelles grilles salariales.",slug:'baremes-2026-cp'},
    ]},
    cta:{h:"Vous créez une activité ou souhaitez développer votre entreprise ?",sub:'Quelle que soit votre question, Aureus vous donne des réponses claires.',btn:'Contactez-nous →'}},
  con:{ey:'Contact',h:'Comment pouvons-nous\nvous aider ?',sub:'Notre équipe répond sous 4h ouvrables. Pas de chatbot — de vrais experts en droit social belge.',
    ch:[['✉️','E-mail','info@aureus-ia.com'],['💻','Application','app.aureussocial.be'],['📍','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Bruxelles']],
    cr:[['BCE','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Réponse','< 4h ouvrables']],
    f:{t:'Demande de démo',s:'Réponse garantie sous 4h ouvrables.',fn:'Prénom *',ln:'Nom *',em:'E-mail professionnel *',ph:'Téléphone',co:'Société',ro:'Vous êtes *',ms:'Message',fnp:'Jean',lnp:'Dupont',emp:'jean.dupont@fiduciaire.be',php:'+32 2 000 00 00',cop:'Cabinet Dupont & Associés',msp:'Décrivez votre situation…',sub:'Envoyer la demande',note:'En soumettant ce formulaire, vous acceptez notre politique RGPD.',ok:'✓ Message envoyé — nous vous répondrons sous 4h ouvrables.',roles:['Sélectionnez...','Indépendant / Starter','Fiduciaire / Expert-comptable','Employeur direct','Secrétariat social','Courtier / Partenaire','Autre']}},
  },
  articles:{
    'baremes-2026':{tag:'Paie',ico:'🧮',title:'Barèmes sectoriels 2026 : ce qui change',slug:'baremes-2026',date:'1 janvier 2026',readTime:'5 min',intro:"Chaque début d'année, les conventions collectives de travail (CCT) sont négociées au sein des commissions paritaires. Pour 2026, Aureus Social Pro a intégré les nouvelles grilles avant le 1er janvier.",sections:[{h:"Qu'est-ce qu'un barème sectoriel ?",p:"Un barème sectoriel est la grille de salaires minimums fixée par la commission paritaire (CP) applicable à votre secteur. Il définit le salaire minimum légal par catégorie de fonction et ancienneté. En Belgique, il existe 166 commissions paritaires, chacune pouvant avoir ses propres barèmes."},{h:'Les changements clés en 2026',p:"L'index santé a été dépassé à 1,59% en décembre 2025, entraînant une adaptation automatique des barèmes.\n\nCP 200 — Employés : catégorie 1 passe de 2.180€ à 2.215€/mois brut. CP 226 — Commerce de détail : barème A porté à 1.990€/mois. CP 319 — Services de proximité : adaptation de +1,8%."},{h:'Comment Aureus gère-t-il les mises à jour ?',p:"Aureus Social Pro dispose d'un système de veille législative automatique. Un cron quotidien à 6h00 CET scrape les 8 sources officielles belges (Moniteur belge, SPF Emploi, ONSS…). Dès qu'une modification est détectée, une alerte email HTML est envoyée aux gestionnaires concernés.\n\nLes 166 CP sont encodées avec leurs barèmes, primes et règles spécifiques. Le calcul de paie applique automatiquement la bonne grille selon la CP de chaque travailleur."},{h:'Que faire si votre CP a changé ?',p:"1. Vérifiez dans Aureus la CP attribuée à chaque travailleur (Travailleurs → Fiche)\n\n2. Le recalcul est automatique lors de la prochaine fiche de paie\n\n3. En cas de régularisation rétroactive, utilisez l'outil Correction paie dans Gestion Paie\n\n4. Pour toute question : info@aureus-ia.com"}],cta:{title:"Votre CP est-elle à jour dans Aureus ?",sub:"Notre équipe vérifie votre configuration sans frais.",btn:"Vérifier maintenant"}},
    'bonus-emploi-2026':{tag:'Législation',ico:'⚖️',title:'Bonus emploi 2026 : nouveaux plafonds',slug:'bonus-emploi-2026',date:'15 janvier 2026',readTime:'4 min',intro:"Le bonus à l'emploi (réduction de cotisations personnelles pour travailleurs à bas salaire) a été revu pour 2026. Voici ce que cela change concrètement sur vos fiches de paie.",sections:[{h:"Qu'est-ce que le bonus à l'emploi ?",p:"Le bonus à l'emploi est une réduction des cotisations personnelles de sécurité sociale accordée aux travailleurs dont le salaire brut est inférieur à un certain plafond. Il se traduit par un montant déduit directement du précompte professionnel, augmentant le salaire net sans coût supplémentaire pour l'employeur."},{h:'Les nouveaux plafonds 2026',p:"Plafond de salaire brut mensuel : 3.190,23 € (contre 3.144,00 € en 2025). Montant maximum du bonus : 264,16 €/mois pour les bas salaires. Réduction progressive de 100% pour les salaires inférieurs à 2.075 € à 0% au seuil de 3.190 €.\n\nLe calcul suit la formule SPF Finances : Bonus = Max × (1 - (S - S1)/(S2 - S1)) où S = salaire brut."},{h:'Impact sur vos calculs Aureus',p:"Aureus Social Pro applique la formule officielle SPF Finances Annexe III. La constante LOIS_BELGES.BONUS_EMPLOI_PLAFOND est automatiquement mise à jour.\n\nImpact typique pour un employé à 2.500 €/mois brut : bonus de +187 € net par mois. Pour un employé à 1.900 €/mois : bonus maximal de +264 €."},{h:"Cumul avec d'autres avantages",p:"Le bonus à l'emploi est cumulable avec la prime de mobilité (vélo, transports en commun) et les chèques-repas. Il n'est pas cumulable avec certaines allocations de chômage ou d'activation."}],cta:{title:"Vérifiez que votre calcul de paie intègre le bon bonus emploi.",sub:"Démo gratuite — 30 minutes sur vos données.",btn:"Demander une démo"}},
    'dmfa-q1-2026':{tag:'ONSS',ico:'🏛',title:'DmfA Q1 2026 : délai et nouveautés',slug:'dmfa-q1-2026',date:'20 janvier 2026',readTime:'6 min',intro:"La déclaration multifonctionnelle (DmfA) du premier trimestre 2026 est due avant le 30 avril. Voici les changements à connaître et comment Aureus vous prépare.",sections:[{h:"Rappel : qu'est-ce que la DmfA ?",p:"La DmfA (Déclaration multifonctionnelle) est la déclaration trimestrielle que tout employeur doit soumettre à l'ONSS. Elle reprend le détail des salaires, heures prestées et cotisations pour chaque travailleur. Elle sert de base au calcul des droits sociaux (chômage, maladie, pension)."},{h:'Délais Q1 2026',p:"Date limite de soumission : 30 avril 2026 (avant minuit). Date limite de paiement : 5 mai 2026. Correction possible jusqu'au 31 juillet 2026 sans majoration.\n\nEn cas de retard : majoration de 10% des cotisations dues + intérêts de retard de 7%/an (depuis 01/01/2024)."},{h:'Nouveautés codes travailleurs Q1 2026',p:"Nouveau code 884 : télétravail structurel (plus de 3j/semaine). Modification code 200 : extension aux CDD de remplacement. Suppression code 015 : fusionné avec code 016 (apprentissage).\n\nCes changements sont intégrés automatiquement dans Aureus Social Pro v18. Le générateur DmfA XML produit un fichier conforme au schéma XSD ONSS mis à jour."},{h:'Comment soumettre via Aureus ?',p:"1. Menu Déclarations → DmfA → Nouveau trimestre\n\n2. Sélectionner Q1 2026 (01/01 – 31/03/2026)\n\n3. Vérifier l'aperçu des cotisations par travailleur\n\n4. Générer le fichier XML et soumettre via le bouton Envoyer à l'ONSS (connexion Mahis/CSAM)\n\n5. Télécharger l'accusé de réception"}],cta:{title:"Votre DmfA Q1 est-elle prête ?",sub:"Audit gratuit de vos déclarations ONSS.",btn:"Contacter l'équipe"}},
    'portail-employe':{tag:'RH',ico:'👥',title:'Portail employé : fiches, documents, congés',slug:'portail-employe',date:'5 février 2026',readTime:'3 min',intro:"Le portail employé d'Aureus Social Pro permet à chaque collaborateur d'accéder en autonomie à ses fiches de paie, documents RH et demandes de congé — sans solliciter le service paie.",sections:[{h:'Le problème résolu',p:"Dans la plupart des PME belges, les employés envoient des emails au service paie pour récupérer une fiche de paie ou vérifier leur solde de congé. Chaque demande prend 5 à 15 minutes. Avec 20 employés, c'est potentiellement 2h/semaine de travail administratif évité."},{h:'Fonctionnalités du portail',p:"Fiches de paie : accès à l'historique complet, téléchargement PDF, signature électronique.\n\nDocuments RH : contrat de travail, avenants, attestations, règlement de travail.\n\nCongés : solde en temps réel, historique, formulaire de demande avec validation managériale.\n\nAlertes : notifications pour nouvelles fiches, documents à signer, approbations de congé."},{h:'Sécurité et RGPD',p:"Chaque employé n'accède qu'à ses propres données (Row Level Security Supabase). L'authentification est sécurisée via CSRF tokens et sessions chiffrées. Les données sensibles (NISS, IBAN) sont chiffrées en AES-256-GCM.\n\nConformément au RGPD Art. 15, chaque employé peut exporter l'intégralité de ses données en un clic."},{h:'Comment activer le portail ?',p:"Le portail employé est inclus dans tous les plans Aureus Social Pro. Activation dans Administration → Portail Employé → Activer. Chaque travailleur reçoit un email d'invitation avec son lien d'accès personnel."}],cta:{title:"Offrez l'autonomie à vos collaborateurs.",sub:"Démo du portail employé en 20 minutes.",btn:"Demander une démo"}},
    'sepa-pain001':{tag:'Paie',ico:'🏦',title:'SEPA pain.001 : automatisez vos virements',slug:'sepa-pain001',date:'10 février 2026',readTime:'4 min',intro:"Le format SEPA pain.001 permet d'automatiser l'envoi des salaires en un seul fichier batch vers votre banque. Aureus Social Pro génère ce fichier automatiquement après validation de la paie.",sections:[{h:"Qu'est-ce que SEPA pain.001 ?",p:"SEPA pain.001 est le standard XML ISO 20022 pour les ordres de virement en euros. Il est accepté par toutes les banques belges (BNP Paribas Fortis, KBC, ING, Belfius, Bpost…). Un seul fichier peut contenir des centaines de virements individuels, exécutés simultanément."},{h:'Avantages vs virements manuels',p:"Sans SEPA pain.001 : saisie manuelle dans votre banque en ligne, risque d'erreur IBAN, 5+ min par employé, aucune traçabilité automatique.\n\nAvec Aureus + SEPA pain.001 : 1 fichier en 3 clics, validation IBAN/BIC automatique, import direct dans votre interface bancaire, archivage automatique, zéro erreur."},{h:'Comment générer le fichier dans Aureus ?',p:"1. Menu Paie → Validation de paie → Approuver\n\n2. Cliquer sur Générer SEPA pain.001\n\n3. Vérifier l'aperçu : nombre de virements, montant total, date d'exécution\n\n4. Télécharger le fichier XML\n\n5. Importer dans votre banque (Isabel 6, CODA, interface web)\n\n6. Valider — les salaires sont virés à la date prévue"},{h:'Structure technique',p:"Le fichier XML contient : en-tête GrpHdr (montant total, date, initiateur), instructions PmtInf (compte débiteur), transactions CdtTrfTxInf (IBAN bénéficiaire, montant, référence).\n\nAureus génère la référence unique au format AUREUS-YYYYMMDD-EMPID pour faciliter le rapprochement comptable."}],cta:{title:"Automatisez vos virements salariaux dès ce mois.",sub:"Configuration SEPA incluse dans l'onboarding.",btn:"Commencer maintenant"}},
    '5-erreurs-premier-employe':{tag:'Droit social',ico:'⚖️',title:"Premier employé : les 5 erreurs à éviter",slug:'5-erreurs-premier-employe',date:'12 février 2026',readTime:'5 min',intro:"Engager son premier employé est une étape cruciale. Pourtant, de nombreux employeurs commettent des erreurs évitables qui peuvent coûter cher — amendes ONSS, litiges prud'homaux, redressements. Voici les 5 pièges les plus fréquents et comment les éviter.",sections:[{h:"Erreur 1 — Immatriculation ONSS tardive",p:"Avant d'engager, vous devez obtenir un numéro d'employeur ONSS. Cette immatriculation doit être faite AVANT le premier jour de travail, via le portail WIDE. Beaucoup d'employeurs découvrent cette obligation après le fait.\n\nConséquence : cotisations dues avec majoration de 10% + intérêts de retard 7%/an. Aureus vous guide dans la démarche WIDE étape par étape dès la création de votre compte."},{h:"Erreur 2 — Dimona oubliée ou tardive",p:"La Dimona IN doit être soumise AVANT le début du travail. Pas le matin même, pas après la journée — avant. Une Dimona tardive expose l'employeur à une amende de 400 à 4.000 € par travailleur.\n\nAvec Aureus, la Dimona est soumise en moins de 8 secondes. Une alerte vous rappelle automatiquement les Dimona à faire 24h avant chaque prise de service."},{h:"Erreur 3 — Mauvaise commission paritaire",p:"La CP détermine le barème salarial, les primes, le préavis, les avantages sectoriels. Attribuer la mauvaise CP peut entraîner un sous-paiement illégal ou un sur-coût inutile.\n\nAureus dispose d'un outil de détermination de CP basé sur le code NACE de l'entreprise et la fonction du travailleur. En cas de doute, notre équipe juridique tranche gratuitement."},{h:"Erreur 4 — Contrat de travail non conforme",p:"Un contrat CDI sans mention de la CP, un CDD sans terme précis, une clause de non-concurrence non conforme — tous peuvent être frappés de nullité partielle ou totale.\n\nAureus génère des contrats pré-validés pour les principales CP. La signature électronique (Yousign/DocuSign) garantit la preuve légale."},{h:"Erreur 5 — Période d'essai illégale",p:"La période d'essai a été supprimée pour les contrats CDI depuis 2014. Beaucoup d'employeurs l'incluent encore par habitude. Cette clause est nulle de plein droit mais peut créer de la confusion en cas de litige.\n\nPour les CDD, les règles de période d'essai sont très strictes (max 7 jours pour < 3 mois). Aureus intègre ces règles dans ses modèles de contrats."}],cta:{title:"Évitez ces erreurs avec Aureus Social Pro.",sub:"Onboarding guidé, modèles conformes, support juridique.",btn:"Demander une démo"}},
    'independant-ou-societe-2026':{tag:'Entrepreneuriat',ico:'💼',title:"Indépendant ou société : quel statut en 2026 ?",slug:'independant-ou-societe-2026',date:'18 février 2026',readTime:'6 min',intro:"Personne physique ou société (SRL, SA) ? C'est souvent la première question d'un entrepreneur belge. La réponse dépend de votre chiffre d'affaires, de votre tolérance au risque et de vos objectifs fiscaux. Comparaison complète 2026.",sections:[{h:"Cotisations sociales : PP vs société",p:"Personne physique : cotisations ONSS sur revenu net imposable — 20,5% jusqu'à 72.810 € et 14,16% au-delà. Minimum : 870,78 €/trimestre.\n\nSociété (dirigeant) : cotisations sur rémunération choisie. Possibilité de moduler la rémunération pour optimiser les cotisations. Dividendes taxés à 30% (VV) mais pas soumis à l'ONSS."},{h:"Fiscalité comparée",p:"Personne physique : IPP progressif — 25% à 50% selon tranches. Pas de déduction des frais professionnels réels sauf option et preuve.\n\nSociété : ISOC à 20% jusqu'à 100.000 € de bénéfice (taux réduit PME), puis 25%. Les frais professionnels sont déductibles. La VVPRbis permet des dividendes à 15% après 3 ans."},{h:"Protection sociale",p:"Les deux statuts donnent accès à la sécurité sociale indépendant (maladie-invalidité INAMI, pension, allocations familiales). Mais la couverture diffère :\n\nPension légale : faible pour les indépendants. La PLCI (pension libre complémentaire) est déductible à 100% — fortement recommandée dans les deux cas.\n\nMaladie-invalidité : délai de carence de 1 mois en PP, protections similaires."},{h:"Notre recommandation 2026",p:"Revenus < 50.000 €/an : personne physique souvent plus simple et moins coûteuse (pas de comptabilité complète obligatoire, pas de frais de constitution).\n\nRevenus > 50.000 €/an : la SRL devient avantageuse. La limitation de responsabilité, l'optimisation ISOC/IPP et la déductibilité des frais justifient les coûts supplémentaires.\n\nAureus gère les deux profils : mandataires de société et indépendants personnes physiques."}],cta:{title:"Aureus gère les deux profils.",sub:"Indépendants et dirigeants de société — un seul outil.",btn:"Voir les solutions"}},
    'absenteisme-obligations':{tag:'Santé',ico:'🏥',title:"Absentéisme : obligations légales de l'employeur",slug:'absenteisme-obligations',date:'25 février 2026',readTime:'4 min',intro:"Un employé absent pour maladie — que doit faire l'employeur ? Salaire garanti, certificat médical, contrôle médical, réintégration... Le droit belge est précis. Voici les règles essentielles.",sections:[{h:"Le certificat médical",p:"Le travailleur doit avertir l'employeur dès le premier jour d'absence (sauf convention contraire). Le certificat médical doit être remis dans les 2 jours ouvrables si l'employeur l'exige dans le règlement de travail.\n\nAttention : la loi du 3 juillet 1978 prévoit que l'employeur peut exiger un certificat dès le 1er jour. Mais beaucoup de CCT sectorielles accordent un ou deux jours de franchise (pas de certificat exigé)."},{h:"Le salaire garanti",p:"Ouvriers : les 7 premiers jours sont à charge de la mutualité (avec une période de carence d'1 jour depuis 2014 pour certains cas). Jours 8 à 30 : salaire garanti employeur.\n\nEmployés : les 30 premiers jours sont entièrement à charge de l'employeur (salaire garanti complet). À partir du 31e jour : mutualité (60% du salaire brut plafonné).\n\nAureus calcule automatiquement le salaire garanti selon le statut (ouvrier/employé) et la CP applicable."},{h:"Le contrôle médical",p:"L'employeur peut organiser un contrôle médical via un médecin contrôleur dans les 24h suivant la déclaration d'absence. Le travailleur doit rester disponible à son domicile sauf indication contraire sur le certificat.\n\nEn cas d'incapacité de travail reconnue, le travailleur ne peut pas être licencié pendant les 6 premiers mois d'absence (protection contre le licenciement)."},{h:"La réintégration progressive",p:"Depuis 2017, la procédure de réintégration progressive permet à un travailleur en incapacité partielle de reprendre le travail à temps partiel avec accord du médecin-conseil INAMI et de l'employeur.\n\nAureus gère les codes ONSS spécifiques pour les reprises progressives (code 771 et variantes)."}],cta:{title:"Gérez l'absentéisme en conformité.",sub:"Calcul salaire garanti automatique, codes ONSS corrects.",btn:"Demander une démo"}},
    'remuneration-alternative':{tag:'Motivation',ico:'🎯',title:"Rémunération alternative : warrants, chèques-repas, voiture",slug:'remuneration-alternative',date:'3 mars 2026',readTime:'5 min',intro:"Augmenter le salaire brut coûte cher — 50% de charges en moyenne. Les avantages extralégaux permettent d'améliorer le pouvoir d'achat des employés à moindre coût pour l'employeur. Tour d'horizon des options 2026.",sections:[{h:"Chèques-repas",p:"Le classique. Conditions : contribution patronale max 6,91 €/chèque, contribution personnelle min 1,09 €/chèque (valeur max 8 €). Exonération ONSS et IPP pour les deux parties si conditions respectées.\n\nAureus gère automatiquement le calcul des chèques-repas selon les jours prestés réels (pas de chèque pour les jours d'absence non justifiée)."},{h:"Voiture de société",p:"Avantage de toute nature imposable = CO2 × coefficient × 6/7 × prix catalogue. Depuis 2026, le coefficient CO2 favorise fortement les véhicules électriques (coefficient minimal 4%).\n\nCotisation de solidarité employeur : calculée sur la même base. Les véhicules zéro émission sont exonérés de cotisation de solidarité jusqu'en 2027.\n\nAureus calcule l'ATN mensuel et l'intègre dans la fiche de paie."},{h:"Warrants (options sur actions)",p:"Les warrants permettent de rémunérer des prestations supplémentaires sans cotisations ONSS si conditions respectées : octroi en sus du salaire normal, pas en remplacement, valeur max 20% du salaire annuel brut.\n\nAvantage : exonéré d'ONSS et soumis à une taxation forfaitaire réduite (environ 22,5% vs 50% IPP marginal)."},{h:"Autres avantages populaires en 2026",p:"Éco-chèques : max 250 €/an/employé, exonérés d'ONSS et d'IPP. Pour des achats écologiques.\n\nPrime de fin d'année : soumise à ONSS et PP normale. Certaines CP l'imposent.\n\nAssurance groupe : prime déductible à 100% pour l'employeur, exonérée d'IPP pour l'employé (EIP pour indépendants).\n\nBudget mobilité : depuis 2019, alternative à la voiture de société. Exonéré d'ONSS et d'IPP."}],cta:{title:"Optimisez votre politique salariale avec Aureus.",sub:"Tous les avantages extralégaux calculés automatiquement.",btn:"Voir les fonctionnalités"}},
    'rgpd-donnees-rh':{tag:'RGPD',ico:'🔐',title:"RGPD & données RH : ce que tout employeur doit savoir",slug:'rgpd-donnees-rh',date:'6 mars 2026',readTime:'5 min',intro:"En tant qu'employeur, vous traitez quotidiennement des données personnelles de vos travailleurs : coordonnées, NISS, salaire, absences maladie, dossier disciplinaire... Le RGPD vous impose des obligations précises. Guide pratique.",sections:[{h:"Quelles données RH sont concernées par le RGPD ?",p:"Toutes les données relatives à vos employés sont des données à caractère personnel au sens du RGPD. Certaines sont particulièrement sensibles (Art. 9) : données de santé (absences maladie, accident du travail), données syndicales (affiliation), données biométriques (empreinte pour pointage).\n\nLes données ordinaires mais sensibles en RH : NISS, IBAN, salaire, situation familiale, évaluations de performance."},{h:"Vos obligations en tant qu'employeur",p:"Base légale : le traitement doit reposer sur une base légale (Art. 6). En RH, c'est généralement l'exécution du contrat de travail ou l'obligation légale (déclarations ONSS, fisc).\n\nRegistre Art. 30 : vous devez tenir un registre des activités de traitement. Aureus génère ce registre pré-rempli pour toutes les activités liées à la paie.\n\nDPA Art. 28 : si vous utilisez un logiciel de paie (comme Aureus), un accord de traitement des données doit être conclu. Aureus génère automatiquement ce DPA."},{h:"Droits des travailleurs",p:"Vos travailleurs ont le droit d'accès (Art. 15) à leurs données personnelles — le portail employé Aureus leur donne accès directement. Droit de rectification (Art. 16), droit à l'effacement sous conditions (Art. 17), droit à la portabilité (Art. 20).\n\nImportant : le droit à l'effacement est limité en RH par les obligations légales de conservation (fiches de paie 5 ans, dossiers ONSS 7 ans)."},{h:"Conservation et sécurité",p:"Durées légales minimales en Belgique : fiches de paie et documents sociaux : 5 ans. Données ONSS (DmfA, Dimona) : 7 ans. Contrats de travail : durée du contrat + 5 ans après fin.\n\nAureus archive automatiquement selon ces délais et chiffre toutes les données sensibles en AES-256-GCM. L'audit trail conserve l'historique de tous les accès et modifications."}],cta:{title:"Mettez vos données RH en conformité RGPD.",sub:"Registre Art. 30, DPA Art. 28, chiffrement AES-256 — inclus.",btn:"Demander un audit RGPD"}},
    'baremes-2026-cp':{tag:'Paie',ico:'🧮',title:"Barèmes 2026 : les changements clés par CP",slug:'baremes-2026-cp',date:'8 mars 2026',readTime:'6 min',intro:"L'indexation de janvier 2026 a modifié les grilles salariales de nombreuses commissions paritaires. Voici un tour d'horizon des principales CP et de leurs nouveaux barèmes applicables dès le 1er janvier 2026.",sections:[{h:"CP 200 — Employés du commerce (la plus large)",p:"CP 200 couvre la majorité des employés sans CP spécifique. Barèmes revus à la hausse de +1,59% (index santé décembre 2025).\n\nCatégorie 1 (fonctions d'exécution) : 2.215 €/mois brut (vs 2.180 € en 2025). Catégorie 2 (fonctions d'intégration) : 2.380 €/mois. Catégorie 3 (fonctions autonomes) : 2.620 €/mois. Catégorie 4 (fonctions de gestion) : 3.050 €/mois.\n\nPrime de fin d'année : maintenue à 100% du salaire mensuel brut."},{h:"CP 200.01 à 200.26 — Sous-commissions",p:"Les sous-commissions de CP 200 (commerce de détail alimentaire, non-alimentaire, grande distribution) ont des spécificités propres.\n\nCP 202 — Grande distribution : prime sectorielle trimestrielle de 85 €. CP 201 — Commerce de détail non-alimentaire : prime annuelle de 148 €. CP 211 — Grands magasins : barème spécifique avec catégories A à F."},{h:"CP 226 — Commerce de détail",p:"CP 226 est distincte de CP 200 et s'applique au commerce de détail indépendant.\n\nBarème A (débutan) : 1.990 €/mois (vs 1.958 € en 2025). Barème B (6 mois ancienneté) : 2.058 €/mois. Barème C (2 ans) : 2.145 €/mois.\n\nPrime syndicale : 145 €/an (payée par l'ONSS via DmfA)."},{h:"CP 319 — Services de proximité et aide à domicile",p:"Secteur en forte croissance. Barèmes revalorisés de +1,8% pour 2026 (accord sectoriel 2025-2026).\n\nAssistant(e) ménager(e) niveau 1 : 14,12 €/h (vs 13,87 € en 2025). Niveau 2 (auxiliaire familiale) : 15,34 €/h. Niveau 3 (aide-ménagère spécialisée) : 16,88 €/h.\n\nPrime d'ancienneté : +0,12 €/h par tranche de 5 ans, plafonnée à 3 tranches."}],cta:{title:"Vos 166 CP sont à jour dans Aureus.",sub:"Mise à jour automatique avant chaque entrée en vigueur.",btn:"Accéder à la plateforme"}},
    'rgpd-paie-belge':{tag:'RGPD',ico:'🔐',title:'RGPD Art. 32 & paie belge : guide complet',slug:'rgpd-paie-belge',date:'1 mars 2026',readTime:'7 min',intro:"La paie belge implique le traitement de données particulièrement sensibles : NISS, IBAN, salaire, situation familiale, absences maladie. Le RGPD Art. 32 impose des mesures de sécurité appropriées. Voici comment Aureus vous met en conformité.",sections:[{h:'Quelles données sont concernées ?',p:"En paie belge, vous traitez : le numéro NISS, l'IBAN du travailleur, le salaire brut et net, la situation familiale (isolé, cohabitant, enfants à charge), les absences pour maladie ou accident du travail, les données bancaires pour le virement SEPA."},{h:'Obligations RGPD Art. 32',p:"L'article 32 du RGPD impose des mesures techniques et organisationnelles appropriées selon le niveau de risque. Pour la paie : chiffrement au repos et en transit, pseudonymisation des données sensibles, journalisation des accès (audit trail), procédure de restauration en cas d'incident."},{h:"Ce qu'Aureus implémente",p:"Chiffrement AES-256-GCM : les champs NISS et IBAN sont chiffrés en base de données. Même un accès direct à Supabase ne révèle pas les données en clair.\n\nRow Level Security : chaque utilisateur ne voit que les données de son périmètre, implémenté au niveau base de données.\n\nAudit trail complet : chaque modification est horodatée avec l'identité de l'opérateur. Conservé 7 ans.\n\nBackup nocturne chiffré vers Backblaze B2 avec chiffrement AES-256 au repos."},{h:'Registre Art. 30 et DPA Art. 28',p:"Aureus génère automatiquement votre registre des traitements (Art. 30) pré-rempli avec les activités de paie. La convention DPA Art. 28 entre Aureus IA SPRL et votre entreprise est générée en Phase 0.\n\nCes documents sont téléchargeables depuis Administration → RGPD → Documents légaux."}],cta:{title:"Votre paie est-elle conforme RGPD Art. 32 ?",sub:"Audit de conformité RGPD gratuit — 1h.",btn:"Demander l'audit"}},
  },
};

T.articles_nl={
  'baremes-2026':{tag:'Paie',ico:'🧮',title:'Sectorbarema\'s 2026: wat verandert',slug:'baremes-2026',date:'1 januari 2026',readTime:'5 min',intro:'Elk begin van het jaar worden de collectieve arbeidsovereenkomsten (CAO\'s) onderhandeld binnen de paritaire comités. Voor 2026 heeft Aureus Social Pro de nieuwe roosters vóór 1 januari geïntegreerd.',sections:[{h:'Wat is een sectorbarema?',p:'Een sectorbarema is het minimumloonrooster vastgesteld door het paritaire comité (PC) dat van toepassing is op uw sector. Het bepaalt het wettelijk minimumloon per functiecategorie en ancienniteit. In België zijn er 166 paritaire comités, elk met hun eigen barema\'s.'},{h:'De belangrijkste wijzigingen in 2026',p:'De gezondheidsindex werd overschreden met 1,59% in december 2025, wat een automatische aanpassing van de barema\'s meebracht.\n\nPC 200 — Bedienden: categorie 1 stijgt van 2.180€ naar 2.215€/maand bruto. PC 226 — Kleinhandel: barema A verhoogd naar 1.990€/maand. PC 319 — Nabijheidsdiensten: aanpassing van +1,8%.'},{h:'Hoe beheert Aureus de updates?',p:'Aureus Social Pro beschikt over een automatisch wetgevend waaksysteem. Een dagelijkse cron om 6u00 CET scrapt de 8 officiële Belgische bronnen (Belgisch Staatsblad, FOD Werkgelegenheid, ONSS…). Zodra een wijziging wordt gedetecteerd, wordt een HTML e-mailwaarschuwing verzonden.\n\nDe 166 PC\'s zijn gecodeerd met hun barema\'s, premies en specifieke regels. De loonberekening past automatisch het juiste rooster toe.'},{h:'Wat te doen als uw PC is gewijzigd?',p:'1. Controleer in Aureus het toegewezen PC voor elke werknemer (Werknemers → Fiche)\n\n2. Herberekening is automatisch bij de volgende loonstrook\n\n3. Voor retroactieve regularisatie: gebruik de tool Loonscorrectie\n\n4. Vragen: info@aureus-ia.com'}],cta:{title:'Is uw PC up-to-date in Aureus?',sub:'Ons team controleert uw configuratie gratis.',btn:'Nu controleren'}},
  'bonus-emploi-2026':{tag:'Législation',ico:'⚖️',title:'Werkbonus 2026: nieuwe plafonds',slug:'bonus-emploi-2026',date:'15 januari 2026',readTime:'4 min',intro:'De werkbonus (vermindering van persoonlijke sociale bijdragen voor laagbetaalde werknemers) werd herzien voor 2026. Hier is wat dit concreet verandert op uw loonfiches.',sections:[{h:'Wat is de werkbonus?',p:'De werkbonus is een vermindering van de persoonlijke socialezekerheidsbijdragen voor werknemers met een brutoloon onder een bepaald plafond. Het vertaalt zich in een bedrag dat rechtstreeks wordt afgetrokken van de bedrijfsvoorheffing.'},{h:'De nieuwe plafonds 2026',p:'Plafond maandelijks brutoloon: 3.190,23 € (vs 3.144,00 € in 2025). Maximale bonus: 264,16 €/maand voor lage lonen. Progressieve vermindering van 100% voor lonen onder 2.075 € naar 0% aan de drempel van 3.190 €.\n\nDe berekening volgt de FOD Financiën formule: Bonus = Max × (1 - (S - S1)/(S2 - S1)).'},{h:'Impact op uw Aureus-berekeningen',p:'Aureus Social Pro past de officiële FOD Financiën Bijlage III formule toe. De constante LOIS_BELGES.BONUS_EMPLOI_PLAFOND wordt automatisch bijgewerkt.\n\nTypische impact voor een werknemer op 2.500 €/maand bruto: bonus van +187 € netto per maand.'},{h:'Cumulatie met andere voordelen',p:'De werkbonus is cumuleerbaar met de mobiliteitsvergoeding (fiets, openbaar vervoer) en maaltijdcheques. Niet cumuleerbaar met bepaalde werkloosheids- of activeringsuitkeringen.'}],cta:{title:'Controleer of uw loonberekening de juiste werkbonus integreert.',sub:'Gratis demo — 30 minuten op uw gegevens.',btn:'Een demo aanvragen'}},
  'dmfa-q1-2026':{tag:'ONSS',ico:'🏛',title:'DmfA K1 2026: deadline en nieuwigheden',slug:'dmfa-q1-2026',date:'20 januari 2026',readTime:'6 min',intro:'De multifunctionele aangifte (DmfA) van het eerste kwartaal 2026 moet worden ingediend vóór 30 april. Hier zijn de wijzigingen en hoe Aureus u voorbereidt.',sections:[{h:'Herinnering: wat is de DmfA?',p:'De DmfA (Multifunctionele Aangifte) is de kwartaalaangifte die elke werkgever bij de ONSS moet indienen. Ze bevat details van lonen, gepresteerde uren en bijdragen per werknemer.'},{h:'Deadlines K1 2026',p:'Indieningsdeadline: 30 april 2026 (voor middernacht). Betalingsdeadline: 5 mei 2026. Correctie mogelijk tot 31 juli 2026 zonder toeslag.\n\nBij laattijdigheid: toeslag van 10% op verschuldigde bijdragen + verwijlintrest van 7%/jaar.'},{h:'Nieuwe werknemerscodes K1 2026',p:'Nieuwe code 884: structureel telewerk (meer dan 3 dagen/week). Wijziging code 200: uitbreiding naar vervangings-CDD\'s. Schrapping code 015: samengevoegd met code 016 (leercontract).\n\nDeze wijzigingen zijn automatisch geïntegreerd in Aureus Social Pro v18.'},{h:'Hoe indienen via Aureus?',p:'1. Menu Aangiften → DmfA → Nieuw kwartaal\n\n2. Selecteer K1 2026 (01/01 – 31/03/2026)\n\n3. Controleer het overzicht van bijdragen per werknemer\n\n4. Genereer het XML-bestand en dien in via de knop Verzenden naar ONSS\n\n5. Download de ontvangstbevestiging'}],cta:{title:'Is uw DmfA K1 klaar?',sub:'Gratis audit van uw ONSS-aangiften.',btn:'Contact opnemen'}},
  'portail-employe':{tag:'RH',ico:'👥',title:'Werknemersportaal: fiches, documenten, verlof',slug:'portail-employe',date:'5 februari 2026',readTime:'3 min',intro:'Het werknemersportaal van Aureus Social Pro geeft elke medewerker zelfstandig toegang tot zijn loonfiches, HR-documenten en verlofaanvragen — zonder de loonadministratie te contacteren.',sections:[{h:'Het opgeloste probleem',p:'In de meeste Belgische kmo\'s sturen werknemers e-mails naar de loonadministratie om een loonfiche op te vragen of hun verlofsaldo te controleren. Elke aanvraag duurt 5 tot 15 minuten. Met 20 werknemers is dat potentieel 2 uur/week vermeden administratief werk.'},{h:'Functies van het portaal',p:'Loonfiches: toegang tot volledige geschiedenis, PDF-download, elektronische handtekening.\n\nHR-documenten: arbeidscontract, aanhangsels, attesten, arbeidsreglement.\n\nVerlof: saldo in real-time, geschiedenis, aanvraagformulier met managersvalidatie.\n\nMeldingen: notificaties voor nieuwe fiches, te ondertekenen documenten, verlofgoedkeuringen.'},{h:'Beveiliging en GDPR',p:'Elke werknemer heeft alleen toegang tot zijn eigen gegevens (Row Level Security Supabase). Authenticatie beveiligd via CSRF-tokens en versleutelde sessies. Gevoelige gegevens (NISS, IBAN) versleuteld in AES-256-GCM.\n\nConform GDPR Art. 15 kan elke werknemer al zijn gegevens in één klik exporteren.'},{h:'Hoe het portaal activeren?',p:'Het werknemersportaal is inbegrepen in alle Aureus Social Pro-abonnementen. Activering via Administratie → Werknemersportaal → Activeren. Elke werknemer ontvangt een uitnodigingsmail met zijn persoonlijke toegangslink.'}],cta:{title:'Geef uw medewerkers autonomie.',sub:'Demo van het werknemersportaal in 20 minuten.',btn:'Een demo aanvragen'}},
  'sepa-pain001':{tag:'Paie',ico:'🏦',title:'SEPA pain.001: automatiseer uw overschrijvingen',slug:'sepa-pain001',date:'10 februari 2026',readTime:'4 min',intro:'Het SEPA pain.001-formaat maakt het mogelijk om lonen in één batch-bestand naar uw bank te sturen. Aureus Social Pro genereert dit bestand automatisch na validatie van de lonen.',sections:[{h:'Wat is SEPA pain.001?',p:'SEPA pain.001 is de ISO 20022 XML-standaard voor overschrijvingsopdrachten in euro. Aanvaard door alle Belgische banken (BNP Paribas Fortis, KBC, ING, Belfius, Bpost…). Eén bestand kan honderden individuele overschrijvingen bevatten.'},{h:'Voordelen vs handmatige overschrijvingen',p:'Zonder SEPA pain.001: handmatige invoer in uw online banking, risico op IBAN-fouten, 5+ min per werknemer.\n\nMet Aureus + SEPA pain.001: 1 bestand in 3 klikken, automatische IBAN/BIC-validatie, directe import in uw bankinterface, automatische archivering, nul fouten.'},{h:'Hoe het bestand genereren in Aureus?',p:'1. Menu Loon → Loonvalidatie → Goedkeuren\n\n2. Klik op SEPA pain.001 genereren\n\n3. Controleer het overzicht: aantal overschrijvingen, totaalbedrag, uitvoeringsdatum\n\n4. Download het XML-bestand\n\n5. Importeer in uw bank (Isabel 6, CODA, webinterface)\n\n6. Valideer — de lonen worden op de geplande datum overgeschreven'},{h:'Technische structuur',p:'Het XML-bestand bevat: GrpHdr-header (totaalbedrag, datum, initiatiefnemer), PmtInf-instructies (debetrekening), CdtTrfTxInf-transacties (IBAN begunstigde, bedrag, referentie).\n\nAureus genereert de unieke referentie in het formaat AUREUS-JJJJMMDD-WERKID.'}],cta:{title:'Automatiseer uw loonbetalingen vanaf deze maand.',sub:'SEPA-configuratie inbegrepen in de onboarding.',btn:'Nu beginnen'}},
  '5-erreurs-premier-employe':{tag:'Droit social',ico:'⚖️',title:'Eerste werknemer: de 5 fouten om te vermijden',slug:'5-erreurs-premier-employe',date:'12 februari 2026',readTime:'5 min',intro:'Uw eerste werknemer aannemen is een cruciale stap. Toch maken veel werkgevers vermijdbare fouten die duur kunnen uitvallen — ONSS-boetes, arbeidsrechtelijke geschillen, herzieningen. Hier zijn de 5 meest voorkomende valkuilen.',sections:[{h:'Fout 1 — Te late ONSS-inschrijving',p:'Vóór aanwerving moet u een werkgeversnummer ONSS verkrijgen via het WIDE-portaal. Dit VOOR de eerste werkdag. Gevolg: verschuldigde bijdragen met 10% toeslag + verwijlintrest 7%/jaar. Aureus begeleidt u stap voor stap in de WIDE-procedure.'},{h:'Fout 2 — Vergeten of te late Dimona',p:'De Dimona IN moet worden ingediend VOOR het begin van het werk. Niet die ochtend, niet na de dag — vóór. Een te late Dimona stelt de werkgever bloot aan een boete van 400 tot 4.000 € per werknemer.\n\nMet Aureus wordt de Dimona ingediend in minder dan 8 seconden. Een melding herinnert u automatisch 24u vóór elke indiensttreding.'},{h:'Fout 3 — Verkeerd paritair comité',p:'Het PC bepaalt het loonrooster, de premies, de opzegtermijn, de sectorale voordelen. Het verkeerde PC toewijzen kan leiden tot illegale onderbetaling of onnodige meerkosten.\n\nAureus heeft een PC-bepaaltool op basis van de NACE-code van uw bedrijf en de functie van de werknemer.'},{h:'Fout 4 — Niet-conform arbeidscontract',p:'Een CDI zonder vermelding van het PC, een CDD zonder precieze termijn, een niet-conforme niet-concurrentieclausule — kunnen allemaal gedeeltelijk of volledig nietig worden verklaard.\n\nAureus genereert vooraf gevalideerde contracten voor de belangrijkste PC\'s.'},{h:'Fout 5 — Onwettige proefperiode',p:'De proefperiode werd voor CDI-contracten afgeschaft in 2014. Veel werkgevers nemen het nog op uit gewoonte. Deze clausule is van rechtswege nietig.\n\nVoor CDD\'s zijn de regels voor de proefperiode zeer strikt (max 7 dagen voor < 3 maanden). Aureus integreert deze regels in zijn contractmodellen.'}],cta:{title:'Vermijd deze fouten met Aureus Social Pro.',sub:'Begeleide onboarding, conforme modellen, juridische ondersteuning.',btn:'Een demo aanvragen'}},
  'independant-ou-societe-2026':{tag:'Entrepreneuriat',ico:'💼',title:'Zelfstandige of vennootschap: welk statuut in 2026?',slug:'independant-ou-societe-2026',date:'18 februari 2026',readTime:'6 min',intro:'Natuurlijk persoon of vennootschap (BV, NV)? Dit is vaak de eerste vraag van een Belgische ondernemer. Het antwoord hangt af van uw omzet, uw risicobereidheid en uw fiscale doelstellingen. Volledige vergelijking 2026.',sections:[{h:'Sociale bijdragen: NP vs vennootschap',p:'Natuurlijk persoon: ONSS-bijdragen op belastbaar netto-inkomen — 20,5% tot 72.810 € en 14,16% daarboven. Minimum: 870,78 €/kwartaal.\n\nVennootschap (bestuurder): bijdragen op gekozen bezoldiging. Mogelijkheid om bezoldiging te moduleren. Dividenden belast aan 30% maar niet onderworpen aan ONSS.'},{h:'Fiscale vergelijking',p:'Natuurlijk persoon: progressieve PB — 25% tot 50% per schijf.\n\nVennootschap: VenB aan 20% tot 100.000 € winst (verlaagd tarief KMO), daarna 25%. Beroepskosten zijn aftrekbaar. VVPRbis maakt dividenden aan 15% mogelijk na 3 jaar.'},{h:'Sociale bescherming',p:'Beide statuten geven toegang tot de sociale zekerheid voor zelfstandigen (ziekte-invaliditeit RIZIV, pensioen, kinderbijslag).\n\nWettelijk pensioen: laag voor zelfstandigen. De VAPZ (vrij aanvullend pensioen) is 100% aftrekbaar.\n\nZiekte-invaliditeit: wachttijd van 1 maand bij NP.'},{h:'Onze aanbeveling 2026',p:'Inkomsten < 50.000 €/jaar: natuurlijk persoon vaak eenvoudiger en goedkoper.\n\nInkomsten > 50.000 €/jaar: de BV wordt voordelig. De beperkte aansprakelijkheid, VenB/PB-optimalisatie en aftrekbaarheid van kosten rechtvaardigen de extra kosten.\n\nAureus beheert beide profielen: mandatarissen van vennootschappen en zelfstandige natuurlijke personen.'}],cta:{title:'Aureus beheert beide profielen.',sub:'Zelfstandigen en vennootschapsbestuurders — één tool.',btn:'De oplossingen bekijken'}},
  'absenteisme-obligations':{tag:'Santé',ico:'🏥',title:'Absenteisme: wettelijke verplichtingen van de werkgever',slug:'absenteisme-obligations',date:'25 februari 2026',readTime:'4 min',intro:'Een werknemer afwezig wegens ziekte — wat moet de werkgever doen? Gewaarborgd loon, medisch attest, medische controle, re-integratie… Het Belgische recht is precies. Hier zijn de essentiële regels.',sections:[{h:'Het medisch attest',p:'De werknemer moet de werkgever informeren vanaf de eerste afwezigheidsdag. Het medisch attest moet binnen 2 werkdagen worden voorgelegd als de werkgever dit vereist in het arbeidsreglement.\n\nLet op: veel sectorale CAO\'s kennen één of twee vrijstellingsdagen (geen attest vereist).'},{h:'Het gewaarborgd loon',p:'Arbeiders: de eerste 7 dagen zijn ten laste van de mutualiteit. Dagen 8 tot 30: gewaarborgd loon werkgever.\n\nBedienden: de eerste 30 dagen volledig ten laste van de werkgever. Vanaf dag 31: mutualiteit (60% van het geplafonneerde brutoloon).\n\nAureus berekent automatisch het gewaarborgd loon per statuut (arbeider/bediende) en het toepasselijke PC.'},{h:'De medische controle',p:'De werkgever kan een medische controle organiseren via een controlearts binnen 24u na de afwezigheidsmelding. De werknemer moet thuis beschikbaar blijven.\n\nBij erkende arbeidsongeschiktheid kan de werknemer niet worden ontslagen tijdens de eerste 6 maanden afwezigheid.'},{h:'Progressieve re-integratie',p:'Sinds 2017 laat de progressieve re-integratieprocedure een gedeeltelijk arbeidsongeschikte werknemer toe om deeltijds te hervatten met akkoord van de RIZIV-adviserende arts en de werkgever.\n\nAureus beheert de specifieke ONSS-codes voor progressieve hervatting (code 771 en varianten).'}],cta:{title:'Beheer absenteisme in conformiteit.',sub:'Automatische berekening gewaarborgd loon, correcte ONSS-codes.',btn:'Een demo aanvragen'}},
  'remuneration-alternative':{tag:'Motivation',ico:'🎯',title:'Alternatieve verloning: warrants, maaltijdcheques, bedrijfswagen',slug:'remuneration-alternative',date:'3 maart 2026',readTime:'5 min',intro:'Het brutoloon verhogen is duur — gemiddeld 50% lasten. Extra-legale voordelen verbeteren de koopkracht van werknemers tegen lagere kosten voor de werkgever. Overzicht van de opties 2026.',sections:[{h:'Maaltijdcheques',p:'De klassieker. Voorwaarden: maximale werkgeversbijdrage 6,91 €/cheque, minimale persoonlijke bijdrage 1,09 €/cheque (max waarde 8 €). ONSS- en PB-vrijstelling voor beide partijen.\n\nAureus beheert automatisch de berekening van maaltijdcheques op basis van werkelijk gepresteerde dagen.'},{h:'Bedrijfswagen',p:'Belastbaar voordeel van alle aard = CO2 × coëfficiënt × 6/7 × catalogusprijs. Vanaf 2026 begunstigt de CO2-coëfficiënt sterk elektrische voertuigen (minimale coëfficiënt 4%).\n\nWerkgeversbijdrage solidariteitsbijdrage: berekend op dezelfde basis. Nulemissievoertuigen vrijgesteld tot 2027.\n\nAureus berekent het maandelijkse VAA en integreert het in de loonfiche.'},{h:'Warrants (aandelenopties)',p:'Warrants laten toe bijkomende prestaties te vergoeden zonder ONSS-bijdragen als aan de voorwaarden is voldaan: toekenning bovenop het normale loon, niet ter vervanging, max waarde 20% van het jaarlijkse brutoloon.\n\nVoordeel: vrijgesteld van ONSS en onderworpen aan een forfaitaire belasting van ca. 22,5%.'},{h:'Andere populaire voordelen in 2026',p:'Ecocheques: max 250 €/jaar/werknemer, vrijgesteld van ONSS en PB.\n\nEindejaarspremie: onderworpen aan normale ONSS en PB. Sommige PC\'s leggen het op.\n\nGroepsverzekering: premie 100% aftrekbaar voor werkgever, vrijgesteld van PB voor werknemer.\n\nMobiliteitspakket: vanaf 2019, alternatief voor bedrijfswagen. Vrijgesteld van ONSS en PB.'}],cta:{title:'Optimaliseer uw loonbeleid met Aureus.',sub:'Alle extra-legale voordelen automatisch berekend.',btn:'De functies bekijken'}},
  'rgpd-donnees-rh':{tag:'RGPD',ico:'🔐',title:'GDPR & HR-gegevens: wat elke werkgever moet weten',slug:'rgpd-donnees-rh',date:'6 maart 2026',readTime:'5 min',intro:'Als werkgever verwerkt u dagelijks persoonsgegevens van uw werknemers: contactgegevens, NISS, loon, ziekte-afwezigheden, disciplinair dossier... De GDPR legt u precieze verplichtingen op. Praktische gids.',sections:[{h:'Welke HR-gegevens vallen onder de GDPR?',p:'Alle gegevens met betrekking tot uw werknemers zijn persoonsgegevens. Sommige zijn bijzonder gevoelig (Art. 9): gezondheidsgegevens (ziekte-afwezigheden, arbeidsongeval), vakbondsgegevens, biometrische gegevens.\n\nGewone maar gevoelige HR-gegevens: NISS, IBAN, loon, gezinssituatie, prestatiebeoordelingen.'},{h:'Uw verplichtingen als werkgever',p:'Rechtsgrond: de verwerking moet steunen op een rechtsgrond (Art. 6). In HR is dit gewoonlijk de uitvoering van de arbeidsovereenkomst of de wettelijke verplichting.\n\nRegister Art. 30: u moet een register van verwerkingsactiviteiten bijhouden. Aureus genereert dit register vooraf ingevuld.\n\nVerwerkersovereenkomst Art. 28: als u loonsoftware gebruikt, moet een gegevensverwerkingsovereenkomst worden gesloten. Aureus genereert deze DPA automatisch.'},{h:'Rechten van werknemers',p:'Uw werknemers hebben het recht op inzage (Art. 15) — het Aureus werknemersportaal geeft hen rechtstreeks toegang. Recht op rectificatie (Art. 16), recht op wissing onder voorwaarden (Art. 17), recht op overdraagbaarheid (Art. 20).\n\nBelangrijk: het recht op wissing is beperkt in HR door wettelijke bewaarverplichtingen (loonfiches 5 jaar, ONSS-dossiers 7 jaar).'},{h:'Bewaring en beveiliging',p:'Wettelijke minimumbewaartermijnen in België: loonfiches en sociale documenten: 5 jaar. ONSS-gegevens (DmfA, Dimona): 7 jaar. Arbeidscontracten: duur van het contract + 5 jaar na beëindiging.\n\nAureus archiveert automatisch en versleutelt alle gevoelige gegevens in AES-256-GCM.'}],cta:{title:'Zet uw HR-gegevens in GDPR-conformiteit.',sub:'Register Art. 30, DPA Art. 28, AES-256 versleuteling — inbegrepen.',btn:'Een GDPR-audit aanvragen'}},
  'baremes-2026-cp':{tag:'Paie',ico:'🧮',title:'Barema\'s 2026: de belangrijkste wijzigingen per PC',slug:'baremes-2026-cp',date:'8 maart 2026',readTime:'6 min',intro:'De indexering van januari 2026 heeft de loonroosters van veel paritaire comités gewijzigd. Hier is een overzicht van de belangrijkste PC\'s en hun nieuwe barema\'s van toepassing vanaf 1 januari 2026.',sections:[{h:'PC 200 — Handelsbedienden (de grootste)',p:'PC 200 dekt de meeste bedienden zonder specifiek PC. Barema\'s herzien met +1,59% (gezondheidsindex december 2025).\n\nCategorie 1 (uitvoeringsfuncties): 2.215 €/maand bruto (vs 2.180 € in 2025). Categorie 2 (integratiefuncties): 2.380 €/maand. Categorie 3 (autonome functies): 2.620 €/maand. Categorie 4 (managementfuncties): 3.050 €/maand.\n\nEindejaarspremie: gehandhaafd op 100% van het maandelijkse brutoloon.'},{h:'PC 200.01 tot 200.26 — Subcommissies',p:'De subcommissies van PC 200 (voedingsdetailhandel, niet-voedingsdetailhandel, grootdistributie) hebben eigen specifieke kenmerken.\n\nPC 202 — Grootdistributie: driemaandelijkse sectorpremie van 85 €. PC 201 — Niet-voedingsdetailhandel: jaarlijkse premie van 148 €.'},{h:'PC 226 — Kleinhandel',p:'PC 226 is apart van PC 200 en van toepassing op de onafhankelijke kleinhandel.\n\nBarema A (beginner): 1.990 €/maand (vs 1.958 € in 2025). Barema B (6 maanden ancienniteit): 2.058 €/maand. Barema C (2 jaar): 2.145 €/maand.\n\nVakbondspremie: 145 €/jaar (betaald door de ONSS via DmfA).'},{h:'PC 319 — Nabijheidsdiensten en thuiszorg',p:'Sector in sterke groei. Barema\'s opgewaardeerd met +1,8% voor 2026 (sectorakkoord 2025-2026).\n\nHuishoudhulp niveau 1: 14,12 €/u (vs 13,87 € in 2025). Niveau 2: 15,34 €/u. Niveau 3: 16,88 €/u.\n\nAncienniteitstoelage: +0,12 €/u per schijf van 5 jaar, beperkt tot 3 schijven.'}],cta:{title:'Uw 166 PC\'s zijn up-to-date in Aureus.',sub:'Automatische update vóór elke inwerkingtreding.',btn:'Toegang tot het platform'}},
  'rgpd-paie-belge':{tag:'RGPD',ico:'🔐',title:'GDPR Art. 32 & Belgische loonverwerking: volledige gids',slug:'rgpd-paie-belge',date:'1 maart 2026',readTime:'7 min',intro:'De Belgische loonverwerking impliceert de verwerking van bijzonder gevoelige gegevens: NISS, IBAN, loon, gezinssituatie, ziekte-afwezigheden. GDPR Art. 32 legt passende beveiligingsmaatregelen op. Hier leest u hoe Aureus u in conformiteit brengt.',sections:[{h:'Welke gegevens zijn betrokken?',p:'In de Belgische loonverwerking verwerkt u: het NISS-nummer, het IBAN van de werknemer, het bruto- en nettoloon, de gezinssituatie (alleenstaand, samenwonend, kinderen ten laste), afwezigheden wegens ziekte of arbeidsongeval, bankgegevens voor de SEPA-overschrijving.'},{h:'GDPR Art. 32 verplichtingen',p:'Artikel 32 van de GDPR legt passende technische en organisatorische maatregelen op. Voor loonverwerking: versleuteling in rust en in transit, pseudonimisering van gevoelige gegevens, toegangsregistratie (audittrail), herstelprocedure bij incidenten.'},{h:'Wat Aureus implementeert',p:'AES-256-GCM versleuteling: de NISS- en IBAN-velden zijn versleuteld in de database. Zelfs directe toegang tot Supabase onthult de gegevens niet in leesbare vorm.\n\nRow Level Security: elke gebruiker ziet alleen de gegevens van zijn perimeter, geïmplementeerd op databaseniveau.\n\nVolledig audittrail: elke wijziging wordt tijdgestempeld met de identiteit van de operator. Bewaard 7 jaar.\n\nNachtelijke versleutelde back-up naar Backblaze B2 met AES-256 versleuteling in rust.'},{h:'Register Art. 30 en DPA Art. 28',p:'Aureus genereert automatisch uw verwerkingsregister (Art. 30) vooraf ingevuld met loonactiviteiten. De DPA Art. 28-overeenkomst tussen Aureus IA SPRL en uw bedrijf wordt gegenereerd in Fase 0.\n\nDeze documenten zijn downloadbaar via Administratie → GDPR → Juridische documenten.'}],cta:{title:'Is uw loonverwerking GDPR Art. 32-conform?',sub:'Gratis GDPR-conformiteitsaudit — 1u.',btn:'De audit aanvragen'}}
};

T.articles_en={
  'baremes-2026':{tag:'Paie',ico:'🧮',title:'2026 sectoral pay scales: what changes',slug:'baremes-2026',date:'1 January 2026',readTime:'5 min',intro:'At the start of each year, collective labour agreements (CLAs) are negotiated within joint committees. For 2026, Aureus Social Pro integrated the new pay grids before 1 January.',sections:[{h:'What is a sectoral pay scale?',p:'A sectoral pay scale is the minimum wage grid set by the joint committee (JC) applicable to your sector. It defines the legal minimum wage per function category and seniority. Belgium has 166 joint committees, each with their own scales.'},{h:'Key changes in 2026',p:'The health index was exceeded by 1.59% in December 2025, triggering an automatic adjustment of pay scales.\n\nJC 200 — Employees: category 1 rises from €2,180 to €2,215/month gross. JC 226 — Retail: scale A raised to €1,990/month. JC 319 — Proximity services: +1.8% adjustment.'},{h:'How does Aureus manage updates?',p:'Aureus Social Pro has an automatic legislative monitoring system. A daily cron at 6:00 AM CET scrapes 8 official Belgian sources (Belgian Official Gazette, FPS Employment, ONSS…). As soon as a change is detected, an HTML email alert is sent.\n\nAll 166 JCs are encoded with their scales, bonuses and specific rules.'},{h:'What to do if your JC has changed?',p:'1. Check in Aureus the JC assigned to each employee (Employees → File)\n\n2. Recalculation is automatic on the next payslip\n\n3. For retroactive adjustment: use the Payroll Correction tool\n\n4. Questions: info@aureus-ia.com'}],cta:{title:'Is your JC up to date in Aureus?',sub:'Our team checks your configuration for free.',btn:'Check now'}},
  'bonus-emploi-2026':{tag:'Législation',ico:'⚖️',title:'Employment bonus 2026: new ceilings',slug:'bonus-emploi-2026',date:'15 January 2026',readTime:'4 min',intro:'The employment bonus (reduction of personal social security contributions for low-wage workers) was revised for 2026. Here is what changes concretely on your payslips.',sections:[{h:'What is the employment bonus?',p:'The employment bonus is a reduction of personal social security contributions for workers whose gross salary is below a certain ceiling. It translates into an amount deducted directly from withholding tax.'},{h:'New 2026 ceilings',p:'Monthly gross salary ceiling: €3,190.23 (vs €3,144.00 in 2025). Maximum bonus: €264.16/month for low wages. Progressive reduction from 100% for salaries below €2,075 to 0% at the €3,190 threshold.\n\nThe calculation follows the FPS Finance formula: Bonus = Max × (1 - (S - S1)/(S2 - S1)).'},{h:'Impact on your Aureus calculations',p:'Aureus Social Pro applies the official FPS Finance Annex III formula. The LOIS_BELGES.BONUS_EMPLOI_PLAFOND constant is automatically updated.\n\nTypical impact for an employee at €2,500/month gross: bonus of +€187 net per month.'},{h:'Combining with other benefits',p:'The employment bonus can be combined with mobility allowance (bicycle, public transport) and meal vouchers. Not combinable with certain unemployment or activation benefits.'}],cta:{title:'Check that your payroll calculation includes the correct employment bonus.',sub:'Free demo — 30 minutes on your data.',btn:'Book a demo'}},
  'dmfa-q1-2026':{tag:'ONSS',ico:'🏛',title:'DmfA Q1 2026: deadline and updates',slug:'dmfa-q1-2026',date:'20 January 2026',readTime:'6 min',intro:'The multifunctional declaration (DmfA) for the first quarter of 2026 is due before 30 April. Here are the changes and how Aureus prepares you.',sections:[{h:'Reminder: what is the DmfA?',p:'The DmfA (Multifunctional Declaration) is the quarterly declaration every employer must submit to the ONSS. It details wages, hours worked and contributions for each employee.'},{h:'Q1 2026 deadlines',p:'Submission deadline: 30 April 2026 (before midnight). Payment deadline: 5 May 2026. Correction possible until 31 July 2026 without surcharge.\n\nIn case of delay: 10% surcharge on contributions due + late interest of 7%/year.'},{h:'New worker codes Q1 2026',p:'New code 884: structural telework (more than 3 days/week). Modification of code 200: extension to replacement fixed-term contracts. Deletion of code 015: merged with code 016 (apprenticeship).\n\nThese changes are automatically integrated in Aureus Social Pro v18.'},{h:'How to submit via Aureus?',p:'1. Menu Declarations → DmfA → New quarter\n\n2. Select Q1 2026 (01/01 – 31/03/2026)\n\n3. Check the contribution overview per employee\n\n4. Generate the XML file and submit via Send to ONSS button\n\n5. Download the acknowledgement of receipt'}],cta:{title:'Is your DmfA Q1 ready?',sub:'Free audit of your ONSS declarations.',btn:'Contact the team'}},
  'portail-employe':{tag:'RH',ico:'👥',title:'Employee portal: payslips, documents, leave',slug:'portail-employe',date:'5 February 2026',readTime:'3 min',intro:'The Aureus Social Pro employee portal gives each employee autonomous access to their payslips, HR documents and leave requests — without contacting the payroll department.',sections:[{h:'The problem solved',p:'In most Belgian SMEs, employees send emails to payroll to retrieve a payslip or check their leave balance. Each request takes 5 to 15 minutes. With 20 employees, that\'s potentially 2 hours/week of avoided administrative work.'},{h:'Portal features',p:'Payslips: full history access, PDF download, electronic signature.\n\nHR documents: employment contract, amendments, certificates, work rules.\n\nLeave: real-time balance, history, request form with manager validation.\n\nAlerts: notifications for new payslips, documents to sign, leave approvals.'},{h:'Security and GDPR',p:'Each employee only accesses their own data (Supabase Row Level Security). Authentication secured via CSRF tokens and encrypted sessions. Sensitive data (NISS, IBAN) encrypted in AES-256-GCM.\n\nIn accordance with GDPR Art. 15, each employee can export all their data in one click.'},{h:'How to activate the portal?',p:'The employee portal is included in all Aureus Social Pro plans. Activation via Administration → Employee Portal → Activate. Each employee receives an invitation email with their personal access link.'}],cta:{title:'Give your employees autonomy.',sub:'Employee portal demo in 20 minutes.',btn:'Book a demo'}},
  'sepa-pain001':{tag:'Paie',ico:'🏦',title:'SEPA pain.001: automate your salary transfers',slug:'sepa-pain001',date:'10 February 2026',readTime:'4 min',intro:'The SEPA pain.001 format automates the sending of salaries in a single batch file to your bank. Aureus Social Pro generates this file automatically after payroll validation.',sections:[{h:'What is SEPA pain.001?',p:'SEPA pain.001 is the ISO 20022 XML standard for credit transfer orders in euros. Accepted by all Belgian banks (BNP Paribas Fortis, KBC, ING, Belfius, Bpost…). One file can contain hundreds of individual transfers.'},{h:'Benefits vs manual transfers',p:'Without SEPA pain.001: manual entry in your online banking, risk of IBAN errors, 5+ min per employee.\n\nWith Aureus + SEPA pain.001: 1 file in 3 clicks, automatic IBAN/BIC validation, direct import into your banking interface, automatic archiving, zero errors.'},{h:'How to generate the file in Aureus?',p:'1. Menu Payroll → Payroll Validation → Approve\n\n2. Click Generate SEPA pain.001\n\n3. Check the overview: number of transfers, total amount, execution date\n\n4. Download the XML file\n\n5. Import into your bank (Isabel 6, CODA, web interface)\n\n6. Validate — salaries are transferred on the planned date'},{h:'Technical structure',p:'The XML file contains: GrpHdr header (total amount, date, initiator), PmtInf instructions (debit account), CdtTrfTxInf transactions (beneficiary IBAN, amount, reference).\n\nAureus generates the unique reference in the format AUREUS-YYYYMMDD-EMPID.'}],cta:{title:'Automate your salary payments from this month.',sub:'SEPA configuration included in onboarding.',btn:'Start now'}},
  '5-erreurs-premier-employe':{tag:'Droit social',ico:'⚖️',title:'First employee: the 5 mistakes to avoid',slug:'5-erreurs-premier-employe',date:'12 February 2026',readTime:'5 min',intro:'Hiring your first employee is a crucial step. Yet many employers make avoidable mistakes that can be costly — ONSS fines, labour disputes, reassessments. Here are the 5 most common pitfalls.',sections:[{h:'Mistake 1 — Late ONSS registration',p:'Before hiring, you must obtain an ONSS employer number via the WIDE portal. This BEFORE the first day of work. Consequence: contributions due with 10% surcharge + late interest 7%/year. Aureus guides you through the WIDE procedure step by step.'},{h:'Mistake 2 — Forgotten or late Dimona',p:'The Dimona IN must be submitted BEFORE work begins. Not that morning, not after the day — before. A late Dimona exposes the employer to a fine of €400 to €4,000 per employee.\n\nWith Aureus, Dimona is submitted in less than 8 seconds. An alert automatically reminds you 24h before each start of service.'},{h:'Mistake 3 — Wrong joint committee',p:'The JC determines the pay scale, bonuses, notice period, sectoral benefits. Assigning the wrong JC can lead to illegal underpayment or unnecessary extra costs.\n\nAureus has a JC determination tool based on your company\'s NACE code and the employee\'s function.'},{h:'Mistake 4 — Non-compliant employment contract',p:'An open-ended contract without the JC mentioned, a fixed-term contract without a precise end, a non-compliant non-compete clause — can all be partially or fully void.\n\nAureus generates pre-validated contracts for the main JCs.'},{h:'Mistake 5 — Illegal trial period',p:'The trial period was abolished for open-ended contracts in 2014. Many employers still include it out of habit. This clause is void by operation of law.\n\nFor fixed-term contracts, trial period rules are very strict (max 7 days for < 3 months). Aureus integrates these rules in its contract templates.'}],cta:{title:'Avoid these mistakes with Aureus Social Pro.',sub:'Guided onboarding, compliant templates, legal support.',btn:'Book a demo'}},
  'independant-ou-societe-2026':{tag:'Entrepreneuriat',ico:'💼',title:'Freelancer or company: which status in 2026?',slug:'independant-ou-societe-2026',date:'18 February 2026',readTime:'6 min',intro:'Natural person or company (SRL, SA)? This is often the first question of a Belgian entrepreneur. The answer depends on your turnover, risk tolerance and tax objectives. Full comparison 2026.',sections:[{h:'Social contributions: NP vs company',p:'Natural person: ONSS contributions on taxable net income — 20.5% up to €72,810 and 14.16% above. Minimum: €870.78/quarter.\n\nCompany (director): contributions on chosen remuneration. Possibility to modulate remuneration to optimise contributions. Dividends taxed at 30% but not subject to ONSS.'},{h:'Tax comparison',p:'Natural person: progressive PIT — 25% to 50% per bracket.\n\nCompany: CIT at 20% up to €100,000 profit (reduced SME rate), then 25%. Professional expenses are deductible. VVPRbis allows dividends at 15% after 3 years.'},{h:'Social protection',p:'Both statuses give access to self-employed social security (sickness-disability INAMI, pension, family allowances).\n\nLegal pension: low for self-employed. The PLCI (supplementary pension) is 100% deductible.\n\nSickness-disability: 1-month waiting period for natural persons.'},{h:'Our 2026 recommendation',p:'Income < €50,000/year: natural person often simpler and less costly.\n\nIncome > €50,000/year: the SRL becomes advantageous. Limited liability, CIT/PIT optimisation and deductibility of expenses justify the extra costs.\n\nAureus manages both profiles: company mandataries and self-employed natural persons.'}],cta:{title:'Aureus manages both profiles.',sub:'Freelancers and company directors — one tool.',btn:'View solutions'}},
  'absenteisme-obligations':{tag:'Santé',ico:'🏥',title:'Absenteeism: the employer legal obligations',slug:'absenteisme-obligations',date:'25 February 2026',readTime:'4 min',intro:'An employee absent due to illness — what must the employer do? Guaranteed salary, medical certificate, medical check, reintegration… Belgian law is precise. Here are the essential rules.',sections:[{h:'The medical certificate',p:'The employee must notify the employer from the first day of absence. The medical certificate must be submitted within 2 working days if the employer requires it in the work rules.\n\nNote: many sectoral CLAs grant one or two exemption days (no certificate required).'},{h:'The guaranteed salary',p:'Workers: the first 7 days are borne by the health insurance fund. Days 8 to 30: employer guaranteed salary.\n\nEmployees: the first 30 days entirely borne by the employer. From day 31: health insurance fund (60% of the capped gross salary).\n\nAureus automatically calculates the guaranteed salary per status (worker/employee) and the applicable JC.'},{h:'Medical check',p:'The employer can organise a medical check via a supervising doctor within 24h of the absence notification. The employee must remain available at home.\n\nIn case of recognised incapacity, the employee cannot be dismissed during the first 6 months of absence.'},{h:'Progressive reintegration',p:'Since 2017, the progressive reintegration procedure allows a partially incapacitated employee to resume work part-time with agreement of the INAMI advisory doctor and the employer.\n\nAureus manages the specific ONSS codes for progressive resumption (code 771 and variants).'}],cta:{title:'Manage absenteeism in compliance.',sub:'Automatic guaranteed salary calculation, correct ONSS codes.',btn:'Book a demo'}},
  'remuneration-alternative':{tag:'Motivation',ico:'🎯',title:'Alternative pay: warrants, meal vouchers, company car',slug:'remuneration-alternative',date:'3 March 2026',readTime:'5 min',intro:'Raising gross salary is expensive — 50% charges on average. Non-statutory benefits improve employees purchasing power at lower cost for the employer. Overview of 2026 options.',sections:[{h:'Meal vouchers',p:'The classic. Conditions: maximum employer contribution €6.91/voucher, minimum personal contribution €1.09/voucher (max value €8). ONSS and PIT exemption for both parties.\n\nAureus automatically manages the calculation of meal vouchers based on actual days worked.'},{h:'Company car',p:'Taxable benefit in kind = CO2 × coefficient × 6/7 × list price. From 2026, the CO2 coefficient strongly favours electric vehicles (minimum coefficient 4%).\n\nEmployer solidarity contribution: calculated on the same basis. Zero-emission vehicles exempt until 2027.\n\nAureus calculates the monthly BIK and integrates it into the payslip.'},{h:'Warrants (stock options)',p:'Warrants allow additional performance to be rewarded without ONSS contributions if conditions are met: granted on top of normal salary, not as a replacement, max value 20% of annual gross salary.\n\nBenefit: exempt from ONSS and subject to a reduced flat-rate tax of approx. 22.5%.'},{h:'Other popular benefits in 2026',p:'Eco-vouchers: max €250/year/employee, exempt from ONSS and PIT.\n\nEnd-of-year bonus: subject to normal ONSS and PIT. Some JCs require it.\n\nGroup insurance: premium 100% deductible for employer, exempt from PIT for employee.\n\nMobility budget: since 2019, alternative to company car. Exempt from ONSS and PIT.'}],cta:{title:'Optimise your pay policy with Aureus.',sub:'All non-statutory benefits automatically calculated.',btn:'View features'}},
  'rgpd-donnees-rh':{tag:'RGPD',ico:'🔐',title:'GDPR & HR data: what every employer must know',slug:'rgpd-donnees-rh',date:'6 March 2026',readTime:'5 min',intro:'As an employer, you process personal data of your employees daily: contact details, NISS, salary, sick absences, disciplinary file… GDPR imposes precise obligations. Practical guide.',sections:[{h:'Which HR data falls under GDPR?',p:'All data relating to your employees is personal data. Some is particularly sensitive (Art. 9): health data (sick absences, work accident), trade union data, biometric data.\n\nOrdinary but sensitive HR data: NISS, IBAN, salary, family situation, performance evaluations.'},{h:'Your obligations as an employer',p:'Legal basis: processing must rest on a legal basis (Art. 6). In HR, this is usually the execution of the employment contract or legal obligation.\n\nArt. 30 Register: you must keep a register of processing activities. Aureus generates this register pre-filled.\n\nArt. 28 DPA: if you use payroll software, a data processing agreement must be concluded. Aureus generates this DPA automatically.'},{h:'Employee rights',p:'Your employees have the right of access (Art. 15) — the Aureus employee portal gives them direct access. Right of rectification (Art. 16), right to erasure under conditions (Art. 17), right to portability (Art. 20).\n\nImportant: the right to erasure is limited in HR by legal retention obligations (payslips 5 years, ONSS files 7 years).'},{h:'Retention and security',p:'Legal minimum retention periods in Belgium: payslips and social documents: 5 years. ONSS data (DmfA, Dimona): 7 years. Employment contracts: duration + 5 years after end.\n\nAureus archives automatically and encrypts all sensitive data in AES-256-GCM.'}],cta:{title:'Put your HR data in GDPR compliance.',sub:'Art. 30 register, Art. 28 DPA, AES-256 encryption — included.',btn:'Request a GDPR audit'}},
  'baremes-2026-cp':{tag:'Paie',ico:'🧮',title:'2026 pay scales: key changes by JC',slug:'baremes-2026-cp',date:'8 March 2026',readTime:'6 min',intro:'The January 2026 indexation has modified the wage grids of many joint committees. Here is an overview of the main JCs and their new scales applicable from 1 January 2026.',sections:[{h:'JC 200 — Trade employees (the largest)',p:'JC 200 covers the majority of employees without a specific JC. Scales revised upward by +1.59% (health index December 2025).\n\nCategory 1 (execution functions): €2,215/month gross (vs €2,180 in 2025). Category 2 (integration functions): €2,380/month. Category 3 (autonomous functions): €2,620/month. Category 4 (management functions): €3,050/month.\n\nEnd-of-year bonus: maintained at 100% of monthly gross salary.'},{h:'JC 200.01 to 200.26 — Sub-committees',p:'The sub-committees of JC 200 (food retail, non-food retail, large distribution) have their own specificities.\n\nJC 202 — Large distribution: quarterly sector bonus of €85. JC 201 — Non-food retail: annual bonus of €148.'},{h:'JC 226 — Retail trade',p:'JC 226 is separate from JC 200 and applies to independent retail trade.\n\nScale A (beginner): €1,990/month (vs €1,958 in 2025). Scale B (6 months seniority): €2,058/month. Scale C (2 years): €2,145/month.\n\nTrade union bonus: €145/year (paid by ONSS via DmfA).'},{h:'JC 319 — Proximity and home care services',p:'Fast-growing sector. Scales increased by +1.8% for 2026 (sectoral agreement 2025-2026).\n\nDomestic helper level 1: €14.12/h (vs €13.87 in 2025). Level 2: €15.34/h. Level 3: €16.88/h.\n\nSeniority bonus: +€0.12/h per 5-year bracket, capped at 3 brackets.'}],cta:{title:'Your 166 JCs are up to date in Aureus.',sub:'Automatic update before each entry into force.',btn:'Access the platform'}},
  'rgpd-paie-belge':{tag:'RGPD',ico:'🔐',title:'GDPR Art. 32 & Belgian payroll: complete guide',slug:'rgpd-paie-belge',date:'1 March 2026',readTime:'7 min',intro:'Belgian payroll involves processing particularly sensitive data: NISS, IBAN, salary, family situation, sick absences. GDPR Art. 32 imposes appropriate security measures. Here is how Aureus puts you in compliance.',sections:[{h:'Which data is concerned?',p:'In Belgian payroll you process: the NISS number, the employee IBAN, gross and net salary, family situation (single, cohabiting, dependent children), absences for illness or work accident, banking data for SEPA transfer.'},{h:'GDPR Art. 32 obligations',p:'Article 32 of the GDPR imposes appropriate technical and organisational measures. For payroll: encryption at rest and in transit, pseudonymisation of sensitive data, access logging (audit trail), restoration procedure in case of incident.'},{h:'What Aureus implements',p:'AES-256-GCM encryption: NISS and IBAN fields are encrypted in the database.\n\nRow Level Security: each user only sees data within their perimeter, implemented at database level.\n\nFull audit trail: each modification is timestamped with the operator identity. Retained 7 years.\n\nNightly encrypted backup to Backblaze B2 with AES-256 encryption at rest.'},{h:'Art. 30 Register and Art. 28 DPA',p:'Aureus automatically generates your processing register (Art. 30) pre-filled with payroll activities. The Art. 28 DPA agreement between Aureus IA SPRL and your company is generated in Phase 0.\n\nThese documents are downloadable from Administration → GDPR → Legal documents.'}],cta:{title:'Is your payroll GDPR Art. 32 compliant?',sub:'Free GDPR compliance audit — 1h.',btn:'Request the audit'}}
};

T.articles_de={
  'baremes-2026':{tag:'Paie',ico:'🧮',title:'Sektortarife 2026: was sich ändert',slug:'baremes-2026',date:'1. Januar 2026',readTime:'5 Min.',intro:'Zu Beginn jedes Jahres werden die Tarifverträge (KAB) innerhalb der paritätischen Kommissionen ausgehandelt. Für 2026 hat Aureus Social Pro die neuen Lohnraster vor dem 1. Januar integriert.',sections:[{h:'Was ist ein Sektortarif?',p:'Ein Sektortarif ist das von der paritätischen Kommission (PK) für Ihren Sektor festgelegte Mindestlohnraster. Es definiert den gesetzlichen Mindestlohn pro Funktionskategorie und Anciennität. Belgien hat 166 paritätische Kommissionen, jede mit eigenen Tarifen.'},{h:'Die wichtigsten Änderungen 2026',p:'Der Gesundheitsindex wurde im Dezember 2025 um 1,59% überschritten, was eine automatische Tarifanpassung auslöste.\n\nPK 200 — Angestellte: Kategorie 1 steigt von 2.180€ auf 2.215€/Monat brutto. PK 226 — Einzelhandel: Tarif A auf 1.990€/Monat erhöht. PK 319 — Nähe- und Heimdienste: +1,8% Anpassung.'},{h:'Wie verwaltet Aureus die Updates?',p:'Aureus Social Pro verfügt über ein automatisches Gesetzgebungsüberwachungssystem. Ein täglicher Cron um 6:00 Uhr MEZ scrapt 8 offizielle belgische Quellen. Sobald eine Änderung erkannt wird, wird eine E-Mail-Warnung gesendet.\n\nAlle 166 PK sind mit ihren Tarifen, Prämien und spezifischen Regeln codiert.'},{h:'Was tun, wenn sich Ihre PK geändert hat?',p:'1. Prüfen Sie in Aureus die jeder Arbeitnehmerin zugewiesene PK\n\n2. Neuberechnung erfolgt automatisch bei der nächsten Gehaltsabrechnung\n\n3. Für rückwirkende Regularisierung: Tool Gehaltskorrektur verwenden\n\n4. Fragen: info@aureus-ia.com'}],cta:{title:'Ist Ihre PK in Aureus aktuell?',sub:'Unser Team prüft Ihre Konfiguration kostenlos.',btn:'Jetzt prüfen'}},
  'bonus-emploi-2026':{tag:'Législation',ico:'⚖️',title:'Beschäftigungsbonus 2026: neue Obergrenzen',slug:'bonus-emploi-2026',date:'15. Januar 2026',readTime:'4 Min.',intro:'Der Beschäftigungsbonus (Ermäßigung der persönlichen Sozialversicherungsbeiträge für Niedriglohnempfänger) wurde für 2026 überarbeitet. Hier sind die konkreten Änderungen auf Ihren Gehaltsabrechnungen.',sections:[{h:'Was ist der Beschäftigungsbonus?',p:'Der Beschäftigungsbonus ist eine Ermäßigung der persönlichen Sozialversicherungsbeiträge für Arbeitnehmer, deren Bruttogehalt unter einer bestimmten Obergrenze liegt. Er schlägt sich als Betrag nieder, der direkt vom Lohnsteuervorabzug abgezogen wird.'},{h:'Die neuen Obergrenzen 2026',p:'Monatliche Bruttogehaltsgrenze: 3.190,23 € (vs 3.144,00 € in 2025). Maximaler Bonus: 264,16 €/Monat für Niedriglöhne. Progressive Ermäßigung von 100% für Löhne unter 2.075 € auf 0% an der 3.190 €-Schwelle.\n\nDie Berechnung folgt der FOD-Finanzen-Formel: Bonus = Max × (1 - (S - S1)/(S2 - S1)).'},{h:'Auswirkungen auf Ihre Aureus-Berechnungen',p:'Aureus Social Pro wendet die offizielle Formel FOD Finanzen Anlage III an. Die Konstante LOIS_BELGES.BONUS_EMPLOI_PLAFOND wird automatisch aktualisiert.\n\nTypische Auswirkung für einen Arbeitnehmer bei 2.500 €/Monat brutto: Bonus von +187 € netto pro Monat.'},{h:'Kumulierung mit anderen Leistungen',p:'Der Beschäftigungsbonus ist kumulierbar mit der Mobilitätsprämie (Fahrrad, öffentliche Verkehrsmittel) und Essensgutscheinen. Nicht kumulierbar mit bestimmten Arbeitslosen- oder Aktivierungsleistungen.'}],cta:{title:'Prüfen Sie, ob Ihre Gehaltsberechnung den richtigen Beschäftigungsbonus integriert.',sub:'Kostenlose Demo — 30 Minuten mit Ihren Daten.',btn:'Eine Demo anfordern'}},
  'dmfa-q1-2026':{tag:'ONSS',ico:'🏛',title:'DmfA Q1 2026: Frist und Neuerungen',slug:'dmfa-q1-2026',date:'20. Januar 2026',readTime:'6 Min.',intro:'Die multifunktionale Erklärung (DmfA) des ersten Quartals 2026 muss vor dem 30. April eingereicht werden. Hier sind die Änderungen und wie Aureus Sie vorbereitet.',sections:[{h:'Erinnerung: Was ist die DmfA?',p:'Die DmfA (Multifunktionale Erklärung) ist die Quartalserklärung, die jeder Arbeitgeber beim ONSS einreichen muss. Sie enthält Details zu Löhnen, geleisteten Stunden und Beiträgen für jeden Arbeitnehmer.'},{h:'Fristen Q1 2026',p:'Einreichungsfrist: 30. April 2026 (vor Mitternacht). Zahlungsfrist: 5. Mai 2026. Korrektur bis 31. Juli 2026 ohne Zuschlag möglich.\n\nBei Verspätung: 10% Zuschlag auf geschuldete Beiträge + Verzugszinsen von 7%/Jahr.'},{h:'Neue Arbeitnehmercodes Q1 2026',p:'Neuer Code 884: strukturelle Telearbeit (mehr als 3 Tage/Woche). Änderung Code 200: Erweiterung auf Ersatz-Befristungen. Streichung Code 015: mit Code 016 zusammengeführt (Lehre).\n\nDiese Änderungen sind automatisch in Aureus Social Pro v18 integriert.'},{h:'Wie über Aureus einreichen?',p:'1. Menü Erklärungen → DmfA → Neues Quartal\n\n2. Q1 2026 auswählen (01/01 – 31/03/2026)\n\n3. Beitragsübersicht pro Arbeitnehmer prüfen\n\n4. XML-Datei erstellen und über Schaltfläche An ONSS senden einreichen\n\n5. Empfangsbestätigung herunterladen'}],cta:{title:'Ist Ihre DmfA Q1 bereit?',sub:'Kostenloser Audit Ihrer ONSS-Erklärungen.',btn:'Team kontaktieren'}},
  'portail-employe':{tag:'RH',ico:'👥',title:'Mitarbeiterportal: Gehaltszettel, Dokumente, Urlaub',slug:'portail-employe',date:'5. Februar 2026',readTime:'3 Min.',intro:'Das Aureus Social Pro Mitarbeiterportal gibt jedem Mitarbeiter eigenständigen Zugang zu seinen Gehaltsabrechnungen, HR-Dokumenten und Urlaubsanträgen — ohne die Lohnbuchhaltung zu kontaktieren.',sections:[{h:'Das gelöste Problem',p:'In den meisten belgischen KMU senden Arbeitnehmer E-Mails an die Lohnbuchhaltung, um eine Gehaltsabrechnung abzurufen oder ihr Urlaubsguthaben zu prüfen. Jede Anfrage dauert 5 bis 15 Minuten. Mit 20 Mitarbeitern sind das potenziell 2 Stunden/Woche vermiedene Verwaltungsarbeit.'},{h:'Portalfunktionen',p:'Gehaltsabrechnungen: Zugang zur vollständigen Geschichte, PDF-Download, elektronische Unterschrift.\n\nHR-Dokumente: Arbeitsvertrag, Nachträge, Bescheinigungen, Arbeitsordnung.\n\nUrlaub: Echtzeit-Guthaben, Geschichte, Antragsformular mit Vorgesetztenvalidierung.\n\nBenachrichtigungen: für neue Gehaltszettel, zu unterzeichnende Dokumente, Urlaubsgenehmigungen.'},{h:'Sicherheit und DSGVO',p:'Jeder Mitarbeiter greift nur auf seine eigenen Daten zu (Supabase Row Level Security). Authentifizierung über CSRF-Token und verschlüsselte Sitzungen gesichert. Sensible Daten (NISS, IBAN) in AES-256-GCM verschlüsselt.\n\nGemäß DSGVO Art. 15 kann jeder Mitarbeiter alle seine Daten mit einem Klick exportieren.'},{h:'Wie das Portal aktivieren?',p:'Das Mitarbeiterportal ist in allen Aureus Social Pro-Plänen enthalten. Aktivierung über Verwaltung → Mitarbeiterportal → Aktivieren. Jeder Mitarbeiter erhält eine Einladungs-E-Mail mit seinem persönlichen Zugangslink.'}],cta:{title:'Geben Sie Ihren Mitarbeitern Autonomie.',sub:'Demo des Mitarbeiterportals in 20 Minuten.',btn:'Eine Demo anfordern'}},
  'sepa-pain001':{tag:'Paie',ico:'🏦',title:'SEPA pain.001: Automatisieren Sie Ihre Gehaltsüberweisungen',slug:'sepa-pain001',date:'10. Februar 2026',readTime:'4 Min.',intro:'Das SEPA pain.001-Format automatisiert die Übermittlung von Gehältern in einer einzigen Batch-Datei an Ihre Bank. Aureus Social Pro erstellt diese Datei automatisch nach der Gehaltsvalidierung.',sections:[{h:'Was ist SEPA pain.001?',p:'SEPA pain.001 ist der ISO 20022 XML-Standard für Überweisungsaufträge in Euro. Akzeptiert von allen belgischen Banken (BNP Paribas Fortis, KBC, ING, Belfius, Bpost…). Eine Datei kann Hunderte von Einzelüberweisungen enthalten.'},{h:'Vorteile vs manuelle Überweisungen',p:'Ohne SEPA pain.001: manuelle Eingabe in Ihrem Online-Banking, Risiko von IBAN-Fehlern, 5+ Min. pro Mitarbeiter.\n\nMit Aureus + SEPA pain.001: 1 Datei in 3 Klicks, automatische IBAN/BIC-Validierung, direkter Import in Ihre Bankoberfläche, automatische Archivierung, null Fehler.'},{h:'Wie die Datei in Aureus erstellen?',p:'1. Menü Lohn → Lohnvalidierung → Genehmigen\n\n2. Klicken Sie auf SEPA pain.001 erstellen\n\n3. Übersicht prüfen: Anzahl Überweisungen, Gesamtbetrag, Ausführungsdatum\n\n4. XML-Datei herunterladen\n\n5. In Ihre Bank importieren (Isabel 6, CODA, Weboberfläche)\n\n6. Validieren — Gehälter werden am geplanten Datum überwiesen'},{h:'Technische Struktur',p:'Die XML-Datei enthält: GrpHdr-Header (Gesamtbetrag, Datum, Initiator), PmtInf-Anweisungen (Debitkonto), CdtTrfTxInf-Transaktionen (Begünstigten-IBAN, Betrag, Referenz).\n\nAureus generiert die eindeutige Referenz im Format AUREUS-JJJJMMTT-MITID.'}],cta:{title:'Automatisieren Sie Ihre Gehaltszahlungen ab diesem Monat.',sub:'SEPA-Konfiguration im Onboarding enthalten.',btn:'Jetzt starten'}},
  '5-erreurs-premier-employe':{tag:'Droit social',ico:'⚖️',title:'Erster Mitarbeiter: die 5 Fehler, die man vermeiden sollte',slug:'5-erreurs-premier-employe',date:'12. Februar 2026',readTime:'5 Min.',intro:'Ihren ersten Mitarbeiter einzustellen ist ein entscheidender Schritt. Dennoch machen viele Arbeitgeber vermeidbare Fehler, die teuer werden können — ONSS-Bußgelder, Arbeitsrechtsstreitigkeiten, Nachveranlagungen. Hier sind die 5 häufigsten Fallen.',sections:[{h:'Fehler 1 — Zu späte ONSS-Anmeldung',p:'Vor der Einstellung müssen Sie eine ONSS-Arbeitgebernummer über das WIDE-Portal erhalten. Dies VOR dem ersten Arbeitstag. Folge: geschuldete Beiträge mit 10% Zuschlag + Verzugszinsen 7%/Jahr. Aureus führt Sie Schritt für Schritt durch das WIDE-Verfahren.'},{h:'Fehler 2 — Vergessene oder verspätete Dimona',p:'Die Dimona IN muss VOR Arbeitsbeginn eingereicht werden. Nicht an jenem Morgen, nicht nach dem Tag — vorher. Eine verspätete Dimona setzt den Arbeitgeber einem Bußgeld von 400 bis 4.000 € pro Arbeitnehmer aus.\n\nMit Aureus wird die Dimona in weniger als 8 Sekunden eingereicht.'},{h:'Fehler 3 — Falsche paritätische Kommission',p:'Die PK bestimmt das Lohnraster, Prämien, Kündigungsfristen, Sektorvorteile. Eine falsche PK kann zu illegaler Unterbezahlung oder unnötigen Mehrkosten führen.\n\nAureus hat ein PK-Bestimmungstool basierend auf dem NACE-Code Ihres Unternehmens.'},{h:'Fehler 4 — Nicht konformer Arbeitsvertrag',p:'Ein unbefristeter Vertrag ohne PK-Angabe, ein befristeter Vertrag ohne genaue Laufzeit, eine nicht konforme Wettbewerbsklausel — können alle teilweise oder vollständig nichtig sein.\n\nAureus erstellt vorvalidierte Verträge für die wichtigsten PK.'},{h:'Fehler 5 — Illegale Probezeit',p:'Die Probezeit wurde für unbefristete Verträge seit 2014 abgeschafft. Viele Arbeitgeber fügen sie noch aus Gewohnheit ein. Diese Klausel ist von Rechts wegen nichtig.\n\nFür befristete Verträge sind die Probezeitregeln sehr streng (max. 7 Tage für < 3 Monate).'}],cta:{title:'Vermeiden Sie diese Fehler mit Aureus Social Pro.',sub:'Geführtes Onboarding, konforme Muster, Rechtsunterstützung.',btn:'Eine Demo anfordern'}},
  'independant-ou-societe-2026':{tag:'Entrepreneuriat',ico:'💼',title:'Selbständig oder Gesellschaft: welcher Status 2026?',slug:'independant-ou-societe-2026',date:'18. Februar 2026',readTime:'6 Min.',intro:'Natürliche Person oder Gesellschaft (GmbH, AG)? Dies ist oft die erste Frage eines belgischen Unternehmers. Die Antwort hängt von Ihrem Umsatz, Ihrer Risikobereitschaft und Ihren steuerlichen Zielen ab. Vollständiger Vergleich 2026.',sections:[{h:'Sozialbeiträge: NP vs Gesellschaft',p:'Natürliche Person: ONSS-Beiträge auf steuerpflichtiges Nettoeinkommen — 20,5% bis 72.810 € und 14,16% darüber. Minimum: 870,78 €/Quartal.\n\nGesellschaft (Geschäftsführer): Beiträge auf gewählte Vergütung. Dividenden mit 30% besteuert, aber nicht ONSS-pflichtig.'},{h:'Steuervergleich',p:'Natürliche Person: progressive ESt — 25% bis 50% je Tranche.\n\nGesellschaft: KSt von 20% bis 100.000 € Gewinn (ermäßigter KMU-Satz), dann 25%. Betriebsausgaben abzugsfähig. VVPRbis ermöglicht Dividenden zu 15% nach 3 Jahren.'},{h:'Sozialschutz',p:'Beide Status geben Zugang zur Sozialversicherung für Selbständige (Krankheit-Invalidität RIZIV, Rente, Kindergeld).\n\nGesetzliche Rente: gering für Selbständige. Die PLCI (freiwillige Zusatzrente) ist zu 100% abzugsfähig.\n\nKrankheit-Invalidität: 1-monatige Wartezeit bei natürlichen Personen.'},{h:'Unsere Empfehlung 2026',p:'Einkommen < 50.000 €/Jahr: natürliche Person oft einfacher und günstiger.\n\nEinkommen > 50.000 €/Jahr: die GmbH wird vorteilhaft. Haftungsbeschränkung, KSt/ESt-Optimierung und Abzugsfähigkeit der Kosten rechtfertigen die Mehrkosten.\n\nAureus verwaltet beide Profile: Gesellschaftsmandatare und selbständige natürliche Personen.'}],cta:{title:'Aureus verwaltet beide Profile.',sub:'Selbständige und Gesellschaftsgeschäftsführer — ein Tool.',btn:'Lösungen ansehen'}},
  'absenteisme-obligations':{tag:'Santé',ico:'🏥',title:'Fehlzeiten: gesetzliche Pflichten des Arbeitgebers',slug:'absenteisme-obligations',date:'25. Februar 2026',readTime:'4 Min.',intro:'Ein krankheitsbedingter Arbeitnehmerausfall — was muss der Arbeitgeber tun? Garantiertes Gehalt, ärztliches Attest, ärztliche Kontrolle, Wiedereingliederung… Das belgische Recht ist präzise. Hier sind die wesentlichen Regeln.',sections:[{h:'Das ärztliche Attest',p:'Der Arbeitnehmer muss den Arbeitgeber ab dem ersten Abwesenheitstag benachrichtigen. Das ärztliche Attest muss innerhalb von 2 Arbeitstagen vorgelegt werden, wenn der Arbeitgeber dies in der Arbeitsordnung verlangt.\n\nHinweis: Viele Sektor-KAB gewähren einen oder zwei Befreiungstage.'},{h:'Das garantierte Gehalt',p:'Arbeiter: Die ersten 7 Tage gehen zu Lasten der Krankenkasse. Tage 8 bis 30: garantiertes Arbeitgebergehalt.\n\nAngestellte: Die ersten 30 Tage vollständig zu Lasten des Arbeitgebers. Ab Tag 31: Krankenkasse (60% des gedeckelten Bruttogehalts).\n\nAureus berechnet automatisch das garantierte Gehalt je Status und anwendbarer PK.'},{h:'Die ärztliche Kontrolle',p:'Der Arbeitgeber kann innerhalb von 24h nach der Abwesenheitsmeldung eine ärztliche Kontrolle durch einen Kontrollarzt organisieren.\n\nBei anerkannter Arbeitsunfähigkeit kann der Arbeitnehmer während der ersten 6 Abwesenheitsmonate nicht entlassen werden.'},{h:'Progressive Wiedereingliederung',p:'Seit 2017 ermöglicht das progressive Wiedereingliederungsverfahren einem teilweise arbeitsunfähigen Arbeitnehmer, mit Zustimmung des RIZIV-Beraters und des Arbeitgebers Teilzeit wiederaufzunehmen.\n\nAureus verwaltet die spezifischen ONSS-Codes für progressive Wiederaufnahmen (Code 771 und Varianten).'}],cta:{title:'Verwalten Sie Fehlzeiten vorschriftsgemäß.',sub:'Automatische Berechnung des garantierten Gehalts, korrekte ONSS-Codes.',btn:'Eine Demo anfordern'}},
  'remuneration-alternative':{tag:'Motivation',ico:'🎯',title:'Alternative Vergütung: Warrants, Essensgutscheine, Firmenwagen',slug:'remuneration-alternative',date:'3. März 2026',readTime:'5 Min.',intro:'Das Bruttogehalt zu erhöhen ist teuer — durchschnittlich 50% Abgaben. Außergesetzliche Leistungen verbessern die Kaufkraft der Arbeitnehmer zu geringeren Kosten für den Arbeitgeber. Überblick der Optionen 2026.',sections:[{h:'Essensgutscheine',p:'Der Klassiker. Bedingungen: maximaler Arbeitgeberbeitrag 6,91 €/Gutschein, minimaler persönlicher Beitrag 1,09 €/Gutschein (max. Wert 8 €). ONSS- und ESt-Befreiung für beide Parteien.\n\nAureus verwaltet die Berechnung der Essensgutscheine automatisch auf Basis der tatsächlich geleisteten Tage.'},{h:'Firmenwagen',p:'Steuerpflichtiger geldwerter Vorteil = CO2 × Koeffizient × 6/7 × Katalogpreis. Ab 2026 begünstigt der CO2-Koeffizient stark Elektrofahrzeuge (minimaler Koeffizient 4%).\n\nArbeitgeber-Solidaritätsbeitrag: auf derselben Basis berechnet. Nullemissionsfahrzeuge bis 2027 befreit.\n\nAureus berechnet den monatlichen GWV und integriert ihn in die Gehaltsabrechnung.'},{h:'Warrants (Aktienoptionen)',p:'Warrants erlauben es, Zusatzleistungen ohne ONSS-Beiträge zu vergüten, wenn die Bedingungen erfüllt sind: Gewährung zusätzlich zum Normalgehalt, nicht als Ersatz, max. Wert 20% des jährlichen Bruttogehalts.\n\nVorteil: ONSS-befreit und einer reduzierten Pauschalsteuer von ca. 22,5% unterworfen.'},{h:'Andere beliebte Leistungen 2026',p:'Ökoschecks: max. 250 €/Jahr/Mitarbeiter, ONSS- und ESt-befreit.\n\nJahresendzuwendung: normale ONSS und ESt. Manche PK verlangen sie.\n\nGruppenversicherung: Prämie zu 100% abzugsfähig für Arbeitgeber, ESt-befreit für Mitarbeiter.\n\nMobilitätsbudget: seit 2019, Alternative zum Firmenwagen. ONSS- und ESt-befreit.'}],cta:{title:'Optimieren Sie Ihre Lohnpolitik mit Aureus.',sub:'Alle außergesetzlichen Leistungen automatisch berechnet.',btn:'Funktionen ansehen'}},
  'rgpd-donnees-rh':{tag:'RGPD',ico:'🔐',title:'DSGVO & HR-Daten: was jeder Arbeitgeber wissen muss',slug:'rgpd-donnees-rh',date:'6. März 2026',readTime:'5 Min.',intro:'Als Arbeitgeber verarbeiten Sie täglich personenbezogene Daten Ihrer Arbeitnehmer: Kontaktdaten, NISS, Gehalt, Krankheitsabwesenheiten, Disziplinarakte… Die DSGVO legt Ihnen genaue Pflichten auf. Praxisratgeber.',sections:[{h:'Welche HR-Daten fallen unter die DSGVO?',p:'Alle Daten zu Ihren Arbeitnehmern sind personenbezogene Daten. Einige sind besonders sensibel (Art. 9): Gesundheitsdaten (Krankheitsabwesenheiten, Arbeitsunfall), Gewerkschaftsdaten, biometrische Daten.\n\nGewöhnliche aber sensible HR-Daten: NISS, IBAN, Gehalt, Familiensituation, Leistungsbewertungen.'},{h:'Ihre Pflichten als Arbeitgeber',p:'Rechtsgrundlage: Die Verarbeitung muss auf einer Rechtsgrundlage beruhen (Art. 6). In HR ist dies üblicherweise die Erfüllung des Arbeitsvertrags oder die rechtliche Verpflichtung.\n\nVerzeichnis Art. 30: Sie müssen ein Verzeichnis der Verarbeitungstätigkeiten führen. Aureus erstellt dieses Verzeichnis vorausgefüllt.\n\nAV-Vertrag Art. 28: Wenn Sie Lohnsoftware verwenden, muss ein Datenverarbeitungsvertrag abgeschlossen werden. Aureus erstellt diesen DPA automatisch.'},{h:'Rechte der Arbeitnehmer',p:'Ihre Arbeitnehmer haben das Auskunftsrecht (Art. 15) — das Aureus Mitarbeiterportal gibt ihnen direkten Zugang. Recht auf Berichtigung (Art. 16), Recht auf Löschung unter Bedingungen (Art. 17), Recht auf Übertragbarkeit (Art. 20).\n\nWichtig: Das Recht auf Löschung ist in HR durch gesetzliche Aufbewahrungspflichten begrenzt.'},{h:'Aufbewahrung und Sicherheit',p:'Gesetzliche Mindestaufbewahrungsfristen in Belgien: Gehaltszettel und Sozialdokumente: 5 Jahre. ONSS-Daten: 7 Jahre. Arbeitsverträge: Vertragsdauer + 5 Jahre nach Beendigung.\n\nAureus archiviert automatisch und verschlüsselt alle sensiblen Daten in AES-256-GCM.'}],cta:{title:'Bringen Sie Ihre HR-Daten in DSGVO-Konformität.',sub:'Verzeichnis Art. 30, AV-Vertrag Art. 28, AES-256-Verschlüsselung — inklusive.',btn:'DSGVO-Audit anfordern'}},
  'baremes-2026-cp':{tag:'Paie',ico:'🧮',title:'Tarife 2026: wichtigste Änderungen je PK',slug:'baremes-2026-cp',date:'8. März 2026',readTime:'6 Min.',intro:'Die Indexierung vom Januar 2026 hat die Lohnraster vieler paritätischer Kommissionen verändert. Hier ist ein Überblick der wichtigsten PK und ihrer neuen Tarife ab dem 1. Januar 2026.',sections:[{h:'PK 200 — Handelsangestellte (die größte)',p:'PK 200 deckt die Mehrheit der Angestellten ohne spezifische PK. Tarife um +1,59% erhöht (Gesundheitsindex Dezember 2025).\n\nKategorie 1 (Ausführungsfunktionen): 2.215 €/Monat brutto (vs 2.180 € in 2025). Kategorie 2: 2.380 €/Monat. Kategorie 3: 2.620 €/Monat. Kategorie 4: 3.050 €/Monat.\n\nJahresendzuwendung: auf 100% des monatlichen Bruttogehalts beibehalten.'},{h:'PK 200.01 bis 200.26 — Unterkommissionen',p:'Die Unterkommissionen von PK 200 (Lebensmitteleinzelhandel, Nicht-Lebensmitteleinzelhandel, Großverteilung) haben eigene Besonderheiten.\n\nPK 202 — Großverteilung: vierteljährliche Sektorprämie von 85 €. PK 201 — Nicht-Lebensmitteleinzelhandel: Jahresprämie von 148 €.'},{h:'PK 226 — Einzelhandel',p:'PK 226 ist von PK 200 getrennt und gilt für den unabhängigen Einzelhandel.\n\nTarif A (Berufsanfänger): 1.990 €/Monat (vs 1.958 € in 2025). Tarif B (6 Monate Anciennität): 2.058 €/Monat. Tarif C (2 Jahre): 2.145 €/Monat.\n\nGewerkschaftsprämie: 145 €/Jahr (vom ONSS über DmfA gezahlt).'},{h:'PK 319 — Nähe- und Heimdienste',p:'Stark wachsender Sektor. Tarife um +1,8% für 2026 aufgewertet (Sektorabkommen 2025-2026).\n\nHaushaltshelfer Niveau 1: 14,12 €/h (vs 13,87 € in 2025). Niveau 2: 15,34 €/h. Niveau 3: 16,88 €/h.\n\nAnciennitätszulage: +0,12 €/h je 5-Jahres-Stufe, begrenzt auf 3 Stufen.'}],cta:{title:'Ihre 166 PK sind in Aureus aktuell.',sub:'Automatische Aktualisierung vor jedem Inkrafttreten.',btn:'Auf die Plattform zugreifen'}},
  'rgpd-paie-belge':{tag:'RGPD',ico:'🔐',title:'DSGVO Art. 32 & belgische Lohnverarbeitung: vollständiger Leitfaden',slug:'rgpd-paie-belge',date:'1. März 2026',readTime:'7 Min.',intro:'Die belgische Lohnverarbeitung beinhaltet die Verarbeitung besonders sensibler Daten: NISS, IBAN, Gehalt, Familiensituation, Krankheitsabwesenheiten. DSGVO Art. 32 legt geeignete Sicherheitsmaßnahmen fest. Hier ist, wie Aureus Sie in Konformität bringt.',sections:[{h:'Welche Daten sind betroffen?',p:'In der belgischen Lohnverarbeitung verarbeiten Sie: die NISS-Nummer, das IBAN des Arbeitnehmers, das Brutto- und Nettogehalt, die Familiensituation, Abwesenheiten wegen Krankheit oder Arbeitsunfall, Bankdaten für die SEPA-Überweisung.'},{h:'DSGVO Art. 32 Pflichten',p:'Artikel 32 der DSGVO legt geeignete technische und organisatorische Maßnahmen fest. Für die Lohnverarbeitung: Verschlüsselung im Ruhezustand und in Übertragung, Pseudonymisierung sensibler Daten, Zugangsprotokollierung (Audittrail), Wiederherstellungsverfahren bei Vorfällen.'},{h:'Was Aureus implementiert',p:'AES-256-GCM-Verschlüsselung: NISS- und IBAN-Felder sind in der Datenbank verschlüsselt.\n\nRow Level Security: Jeder Benutzer sieht nur Daten seines Perimeters, auf Datenbankebene implementiert.\n\nVollständiger Audittrail: Jede Änderung wird mit der Identität des Operators zeitgestempelt. 7 Jahre aufbewahrt.\n\nNächtliches verschlüsseltes Backup zu Backblaze B2 mit AES-256-Verschlüsselung im Ruhezustand.'},{h:'Verzeichnis Art. 30 und AV-Vertrag Art. 28',p:'Aureus erstellt automatisch Ihr Verarbeitungsverzeichnis (Art. 30) vorausgefüllt mit Lohnaktivitäten. Der AV-Vertrag Art. 28 zwischen Aureus IA SPRL und Ihrem Unternehmen wird in Phase 0 generiert.\n\nDiese Dokumente sind downloadbar über Verwaltung → DSGVO → Rechtsdokumente.'}],cta:{title:'Ist Ihre Lohnverarbeitung DSGVO Art. 32-konform?',sub:'Kostenloser DSGVO-Konformitätsaudit — 1 Stunde.',btn:'Den Audit anfordern'}}
};



// ═══════ LANGUES NL / EN / DE ═══════
// Chaque langue est construite directement — pas de clone JSON, pas d'Object.assign
// Les articles restent en FR (contenu trop long), mais TOUTE l'interface est traduite

T.nl={
  topbar:{country:'\u{1F1E7}\u{1F1EA} België',bce:'KBO BE 1028.230.781',contact:'Contact',client:'Klantenzone'},
  nav:{demo:'Demo aanvragen',login:'Inloggen'},
  discover:'Ontdekken',readmore:'Lezen',
  back:'← Terug',artBack:'Terug',artToc:'In dit artikel',artRead:' leestijd',
  autoManaged:'Al deze onderwerpen worden automatisch beheerd in Aureus Social Pro.',
  cookie:{text:'Deze website gebruikt cookies om uw ervaring te verbeteren.',accept:'Accepteren',refuse:'Weigeren',settings:'Instellingen'},
  mega:{
    1:{label:'Zelfstandigen',items:[['\u{1F680}','Zelfstandige worden','Statuut, verplichtingen, ONSS','independant'],['\u{1F9EE}','Bijdragen','ONSS-berekening per kwartaal','independant'],['\u{1F4CB}','Verplichtingen','Dimona, DmfA, BTW, PB','independant'],['\u{1F6E1}\u{FE0F}','Sociale bescherming','Ziekte, invaliditeit, pensioen','independant']]},
    2:{label:'Werkgever worden',items:[['\u{1F464}','Eerste werknemer','ONSS-inschrijving, contract','employeur'],['\u{1F4C4}','Arbeidscontract','AOD, ODD — conforme modellen','employeur'],['\u26A1','Automatische Dimona','IN/OUT aangifte in 8 seconden','employeur'],['\u{1F4B6}','Eerste lonen','Loonberekening, fiches, SEPA','employeur']]},
    3:{label:'Werkgevers',items:[['\u{1F3E2}','Loonbeheer','166 PC, barema\u2019s, premies, ONSS','employeurs'],['\u{1F4CA}','Kwartaalaangiften','DmfA XML, Belcotax 281.10/20/30','employeurs'],['\u{1F4C1}','Boekhoudexport','WinBooks, BOB, Octopus, Exact Online','employeurs'],['\u{1F510}','Veiligheid & GDPR','AES-256-GCM, auditspoor, RLS','employeurs'],['\u{1F465}','Werknemersportaal','Loonfiches, documenten, verlof','employeurs'],['\u{270D}\u{FE0F}','Elektronische handtekening','Yousign / DocuSign','employeurs']]},
    4:{label:'Opleidingen',items:[['\u{1F4DA}','Belgisch sociaal recht','ONSS, loon, Dimona','formations'],['\u{1F9EE}','Geavanceerde loonberekening','PC, barema\u2019s, BV Bijlage III','formations'],['\u{1F3DB}','DmfA & Belcotax','Aangiften stap voor stap','formations'],['\u{1F680}','Aureus Pro Onboarding','Volledige ingebruikname','formations']]},
    5:{label:'Accountants',items:[['\u{1F3DB}','Multi-klant portaal','Alle dossiers gecentraliseerd','experts'],['\u{1F517}','REST API + Webhooks','ERP-integratie','experts'],['\u{1F4E4}','ONSS-mandaten','Mahis/CSAM generatie','experts'],['\u{1F504}','Begeleide migratie','Vanaf SD Worx, Partena\u2026','experts']]},
  },
  hero:{badge:'Digitaal sociaal secretariaat \u2014 v18 in productie',h1:'Uw Belgische sociale\npartner.\nEindelijk digitaal.',sub:'Van Dimona tot kwartaalaangiften \u2014 alles wat u nodig heeft, op \u00e9\u00e9n plek.',cta1:'Naar de applicatie',cta2:'Demo bekijken',stats:[['166','Paritaire comit\u00e9s'],['< 8s','Dimona ingediend'],['47K+','Loonfiches'],['10.000+','Bedrijven']]},
  logos:{title:'Zij vertrouwen op Aureus Social Pro',items:['KMO Brussel','Fiduciaire Dupont','Kantoor Janssen','HR Partners','Comptaflex','StartBE']},
  mockup:{badge:'Real-time interface',title:'Uw volledige sociale cyclus\nin \u00e9\u00e9n dashboard.',sub:'Unified dashboard, real-time ONSS-meldingen, export per klik.',features:['Loonfiche in 3 klikken','Dimona IN/OUT < 8 seconden','DmfA XML klaar op de 5e','AES-256 versleutelde nachtback-up'],db:{title:'Dashboard',stats:[['47.2K','Loonfiches','\u{1F4C4}'],['18.6K','ONSS-aangiften','\u{1F4CB}'],['10.000+','Bedrijven','\u{1F3E2}'],['99.97%','Uptime','\u26A1']],chart:'Loon K1 2026',badges:[{l:'Dimona',c:'#22C55E',v:'8 min geleden'},{l:'DmfA K1',c:'#D4A84C',v:'Klaar'},{l:'Belcotax',c:'#60A5FA',v:'Voor 5 apr'}]}},
  testimonials:{ey:'Getuigenissen',title:'Wat onze klanten zeggen.',items:[{name:'Sophie Renard',role:'HR-manager \u2014 KMO 12 werknemers, Brussel',text:'We hebben SD Worx na 8 jaar verlaten. Migratie duurde 3 dagen, we besparen 340\u20ac/maand.',stars:5,initials:'SR',color:'#B8913A'},{name:'Marc Janssen',role:'Accountant \u2014 23 dossiers',text:'Het multi-klant portaal is precies wat ontbrak. 23 werkgevers vanuit \u00e9\u00e9n dashboard. Mahis-mandaten automatisch.',stars:5,initials:'MJ',color:'#1A5C42'},{name:'Amira Benali',role:'Zelfstandige, PC 200',text:'Eerste Dimona in 7 seconden. Loonberekening perfect \u2014 ONSS, bedrijfsvoorheffing, werkbonus.',stars:5,initials:'AB',color:'#18396A'}]},
  roi:{ey:'ROI Calculator',title:'Hoeveel bespaart u\ndoor SD Worx te verlaten?',sub:'Schat uw jaarlijkse besparing in 30 seconden.',employees:'Aantal werknemers',current:'Huidige prestataire',providers:['SD Worx','Partena','Securex','Sodexo','Andere'],result:{saving:'Geschatte jaarlijkse besparing',months:'Return on investment',per:'per maand bespaard',cta:'Nu een demo aanvragen',note:'Schatting op basis van onze tarieven vs. gemiddelde Belgische markttarieven.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]},
  sol:{ey:'Onze oplossingen',h:'Voor elk profiel de juiste oplossing.',sub:'Zelfstandige, werkgever of accountant \u2014 Aureus Social Pro past zich aan.',items:[{ico:'\u{1F680}',title:'Zelfstandige worden',desc:'Statuut, ONSS, verplichtingen \u2014 alles om rustig te starten.',page:'independant'},{ico:'\u{1F464}',title:'Werkgever worden',desc:'Inschrijving, contract, Dimona, eerste lonen.',page:'employeur',featured:true},{ico:'\u{1F3E2}',title:'Werkgevers',desc:'Automatiseer lonen, DmfA, boekhoudexport.',page:'employeurs'},{ico:'\u{1F3DB}',title:'Accountants',desc:'Multi-klant portaal, Mahis/CSAM mandaten, REST API.',page:'experts'},{ico:'\u{1F4CA}',title:'Aangiften & Belcotax',desc:'Kwartaal DmfA, fiches 281.10/20/30, MyMinfin.',page:'employeurs'},{ico:'\u{1F4DA}',title:'Opleidingen',desc:'Webinars over Belgisch sociaal recht.',page:'formations'}]},
  art:{ey:'Altijd klaar voor de toekomst',h:'Bronnen & nieuws',filters:[['tout','Alles'],['paie','Loon'],['rh','HR'],['legal','Wetgeving'],['onss','ONSS']],items:[
    {cat:'paie',ico:'\u{1F9EE}',tag:'Paie',title:'Sectorbarema\u2019s 2026: wat verandert',slug:'baremes-2026',desc:'Update van 166 PC ge\u00efntegreerd in Aureus Social Pro v\u00f3\u00f3r 1 januari.'},
    {cat:'legal',ico:'\u2696\uFE0F',tag:'L\u00e9gislation',title:'Werkbonus 2026: nieuwe plafonds',slug:'bonus-emploi-2026',desc:'Het loonplafond is herzien. Impact op uw berekeningen.'},
    {cat:'onss',ico:'\u{1F3DB}',tag:'ONSS',title:'DmfA K1 2026: deadline en nieuwigheden',slug:'dmfa-q1-2026',desc:'Uiterste datum, nieuwe werknemerscodes en structurele vermindering.'},
    {cat:'rh',ico:'\u{1F465}',tag:'RH',title:'Werknemersportaal: fiches, documenten, verlof',slug:'portail-employe',desc:'Uw medewerkers raadplegen hun fiches zonder de loonadministratie te contacteren.'},
    {cat:'paie',ico:'\u{1F3E6}',tag:'Paie',title:'SEPA pain.001: automatiseer uw overschrijvingen',slug:'sepa-pain001',desc:'Batch-betalingsbestanden ISO 20022.'},
    {cat:'legal',ico:'\u{1F510}',tag:'RGPD',title:'GDPR Art. 32 & Belgische loonverwerking',slug:'rgpd-paie-belge',desc:'NISS-versleuteling, register Art. 30, DPA \u2014 volledige conformiteit.'},
  ]},
  nw:{ey:'Nieuwsbrief',h:'Mis geen sociaal nieuws.',sub:'Wetswijzigingen, bijgewerkte barema\u2019s, praktische tips.',ph:'uw@email.be',btn:'Inschrijven',note:'Privacybeleid Aureus IA SPRL.',ok:'\u2713 Inschrijving bevestigd \u2014 welkom!',feats:[['\u2696\uFE0F','Dagelijkse wettelijke watch','Meldingen zodra een wet uw verplichtingen be\u00efnvloedt'],['\u{1F9EE}','Barema\u2019s 2026 bijgewerkt','Nieuwe CP-roosters voor inwerkingtreding'],['\u{1F4A1}','Expertadvies','Praktijkfiches van onze juristen']]},
  cta:{h:'Klaar om uw sociaal beheer te moderniseren?',sub:'Eerste maand gratis \u00b7 Directe toegang \u00b7 Migratiebegeleiding',btn:'Nu beginnen \u2192'},
  ft:{col1:'Oplossingen',col2:'Product',col3:'Juridisch',copy:'\u00a9 2026 Aureus IA SPRL \u00b7 Alle rechten voorbehouden',links:['Disclaimer','Privacy','Cookiebeleid','AVV'],desc:'Digitaal Belgisch sociaal secretariaat. 132 modules, 166 PC.',c1:[['Zelfstandigen','independant'],['Werkgever worden','employeur'],['Werkgevers','employeurs'],['Accountants','experts'],['Opleidingen','formations']],c2:[['Demo aanvragen','contact'],['Documentatie',null],['Status',null]],c3:[['Privacy',null],['Gebruiksvoorwaarden',null],['GDPR',null],['Disclaimer',null]]},
  articles:T.articles,
  ind:{ey:'Zelfstandigen',bc:'Zelfstandigen',h:'Zelfstandige worden\nin Belgi\u00eb.',sub:'De complete gids stap voor stap.',c1:'Praat met een expert',c2:'Demo aanvragen',
    card:{label:'Aureus Social Pro',title:'Uw sociale back-office',sub:'Automatiseer uw verplichtingen.',stats:[['166','PC beheerd'],['<8s','Dimona'],['100%','Conform'],['24/7','Toegang']]},
    sy:{ey:'Stap voor stap',h:'Starten in 6 stappen',chk:['Dimona IN/OUT < 8s','ONSS-bijdragen 13,07%','Loonfiches PDF','DmfA XML per kwartaal','Belcotax 281.10','SEPA pain.001','Elektronische handtekening'],chkH:'Wat Aureus automatiseert',
      tip:{h:'Goed om te weten',t:'In 2026 geniet de eerste werknemer van een volledige vrijstelling van werkgeversbijdragen gedurende 5 jaar.'},
      steps:[{n:1,t:'Uw statuut kiezen',b:'Zelfstandige in hoofd- of bijberoep, vennootschap (BV, NV…) of eenmanszaak.',tags:['BV · NV · Eenmanszaak'],tc:'vt-tag-au'},{n:2,t:'Ondernemingsnummer (KBO)',b:'Inschrijving in het rechtspersonenregister bij de griffie van de ondernemingsrechtbank.',tags:['KBO · Kruispuntbank'],tc:'vt-tag-b'},{n:3,t:'Aansluiting bij een sociaal fonds',b:'Wettelijke verplichting binnen 90 dagen na start van de activiteit.',tags:['ONSS · 90 dagen'],tc:'vt-tag-g'},{n:4,t:'Driemaandelijkse sociale bijdragen',b:'20,5% tot 72.810 € en 14,16% daarboven. Minimum: 870,78 €/kwartaal.',tags:['20,5% · Driemaandelijks'],tc:'vt-tag-au'},{n:5,t:'BTW & PB-verplichtingen',b:'Maandelijkse of driemaandelijkse BTW-aangifte, jaarlijkse PB-aangifte.',tags:['BTW · PB · FOD Financiën'],tc:''},{n:6,t:'Sociale bescherming',b:'Ziekte-invaliditeit (RIZIV), pensioen, kinderbijslag. Optioneel: VAPZ.',tags:['RIZIV · Pensioen · VAPZ'],tc:'vt-tag-g'}]},
    faq:{ey:'Veelgestelde vragen',h:'Alles wat u wilt weten',items:[['Wat is de termijn voor aansluiting?','90 dagen vanaf het begin van uw activiteit. Bij overschrijding: ambtshalve aansluiting en verhogingen.'],['Hoeveel bedragen de bijdragen in 2026?','20,5% tot 72.810 \u20ac en 14,16% daarboven. Minimum: 870,78 \u20ac/kwartaal.'],['Kan ik bijkomend zelfstandige zijn?','Ja, onder voorbehoud van akkoord van uw werkgever. Verlaagde bijdragen via het aanvullend regime.'],['Beheert Aureus zelfstandigen in vennootschap?','Ja. Natuurlijke personen en vennootschapsmandatarissen (SRL-zaakvoerders, SA-bestuurders).']]},
    cta:{h:'Klaar om rustig te starten?',sub:'Onze experts begeleiden u van A tot Z.',btn:'Praat met een expert \u2192'}},
  emp:{ey:'Eerste werknemer',bc:'Werkgever worden',h:'Uw eerste medewerker\nin vertrouwen\naannemen.',sub:'ONSS-inschrijving, contract, Dimona, eerste lonen.',c1:'Demo aanvragen',c2:'Al werkgever \u2192',
    card:{label:'Eerste werknemer in Belgi\u00eb',title:'Wat Aureus doet',sub:'Volledige automatisering van de sociale cyclus.',stats:[['0\u20ac','Bijdragen jr 1'],['8s','Dimona'],['100%','ONSS'],['166 PC','Alle PC']]},
    steps:{ey:'Belangrijkste stappen',h:'Van 0 naar uw eerste werknemer',items:[{n:1,t:'ONSS-werkgeversinschrijving',b:'Werkgeversnummer ONSS vóór aanwerving. Aureus begeleidt via WIDE.',tags:['ONSS · WIDE · Matricule'],tc:'vt-tag-b'},{n:2,t:'Opstellen van het arbeidscontract',b:'AOD, ODD, voltijds of deeltijds — conforme modellen voor het toepasselijke PC.',tags:['AOD · ODD · PC 200'],tc:'vt-tag-au'},{n:3,t:'Dimona IN aangifte',b:'Verplicht vóór aanvang van het werk. Ingediend in minder dan 8 seconden.',tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},{n:4,t:'Berekening eerste loon',b:'Bruto → Netto: ONSS 13,07%, bedrijfsvoorheffing Bijlage III, werkbonus.',tags:['ONSS · BV · Werkbonus'],tc:'vt-tag-au'},{n:5,t:'SEPA-overschrijving',b:'SEPA pain.001-bestand klaar voor import in uw bank.',tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},{n:6,t:'Driemaandelijkse ONSS-aangiften',b:'DmfA XML K1–K4 met alle toepasselijke verminderingen.',tags:['DmfA · K1–K4'],tc:''}]},
    av:{ey:'Voordelen 2026',h:'Vrijstellingen & aanwervingspremies',items:[['🎁','Vrijstelling 1e werknemer','Volledige vrijstelling van patronale ONSS-bijdragen gedurende 5 jaar.'],['💼','Activa.brussels','Maandelijkse premie tot 350 € voor een Brusselse werkzoekende.'],['📉','Lageloonvermindering','Patronale ONSS-vermindering voor lonen onder 3.100 €/maand.'],['🎓','SINE & Activa-plan','Verminderingen voor aanwerving van personen ver van de arbeidsmarkt.'],['👶','Ouderschapsverlof','Beheer van schorsingen van het contract en specifieke ONSS-aangiften.'],['📋','MonBEE aanwerving','Aanwervingspremie via MonBEE. Termijnen en documenten automatisch gegenereerd.']]},
    cta:{h:'Neem morgen uw eerste medewerker aan.',sub:'Gratis demo \u00b7 Volledige begeleiding \u00b7 Eerste maand gratis',btn:'Starten \u2192'}},
  emps:{ey:'Werkgevers',bc:'Werkgevers',h:'Uw loon,\nuw aangiften,\ngeautomatiseerd.',sub:'166 paritaire comit\u00e9s, DmfA XML, Belcotax, WinBooks/BOB export \u2014 132 modules.',c1:'Naar het platform',c2:'Demo aanvragen',
    card:{label:'Platform in productie',title:'Echte cijfers \u2014 Maart 2026',sub:'132 modules \u00b7 44.246 regels code',stats:[['47.2K','Loonfiches'],['18.6K','ONSS-aangiften'],['10.000+','Bedrijven'],['99.97%','Uptime']]},
    mods:{ey:'Functionaliteiten',h:'132 modules voor de volledige sociale cyclus',items:[['⚡','Elektronische Dimona','IN/OUT/UPDATE in minder dan 8 seconden. Directe ONSS-verbinding.'],['🧮','Belgische loonberekening','166 PC, barema\'s 2026, ONSS 13,07%, bedrijfsvoorheffing Bijlage III.'],['📋','Driemaandelijkse DmfA XML','K1–K4 ONSS-conform. Structurele vermindering, lageloon, werkbonus.'],['📊','Belcotax XML','Fiches 281.10, 281.20, 281.30 FOD Financiën-conform. Upload MyMinfin.'],['🏦','SEPA pain.001','Batch-overboekingsbestanden ISO 20022. IBAN/BIC-validatie.'],['📁','Boekhoudexport × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['✍️','Elektronische handtekening','Yousign of DocuSign. Wettelijke bewijswaarde.'],['👥','Werknemersportaal','Loonfiches, HR, verlof — rechtstreeks toegankelijk voor medewerkers.'],['🔐','Beveiliging GDPR Art. 32','AES-256-GCM NISS/IBAN, audittrail, RLS Supabase.']]},
    cta:{h:'Zie het platform in actie.',sub:'Demo op uw eigen gegevens \u2014 30 minuten.',btn:'Een demo reserveren \u2192'}},
  exp:{ey:'Accountants',bc:'Accountants',h:'\u00c9\u00e9n portaal,\nalle sociale\ndossiers.',sub:'Mahis/CSAM mandaten, multi-klant portaal, REST API, migratie van SD Worx of Partena.',c1:'Fiduciaire demo aanvragen',c2:'Begeleide migratie',
    card:{label:'Fiduciaire Plan',title:'Onbeperkte multi-dossiers',sub:'Portaal \u00b7 API \u00b7 SLA \u00b7 Migratie',stats:[['23+','Dossiers per kantoor'],['99.9%','SLA uptime'],['REST','API + Webhooks'],['0\u20ac','Migratie']]},
    it:{ey:'Wat wij bieden',h:'Ontworpen voor cijferprofessionals',list:[['01','Gecentraliseerde multi-clientenportal','Beheer al uw dossiers vanuit één dashboard. Granulaire toegangsrechten.'],['02','Automatische ONSS- & Belcotax-mandaten','Conforme Mahis/CSAM-conventies. Opvolging actieve mandaten per klant.'],['03','REST API + HMAC Webhooks','Integreer Aureus in uw ERP. Beveiligde webhooks loon/DmfA/Dimona.'],['04','Migratie vanuit uw prestatairs','Multi-format CSV-parser SD Worx, Partena, Securex, Sodexo.'],['05','6 formaten boekhoudexport','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['06','SLA 99,9% + Account Manager','Respons < 2u kantooruren. Dedicated Slack-kanaal. Vaste accountmanager.']]},
    mig:{ey:'Migratie',h:'SD Worx of Partena zonder risico verlaten.',steps:[['📥','Gegevensexport','CSV van uw huidige prestatair'],['🔄','Automatische import','Aureus-parser — geen hercodering'],['✅','Kruisvalidatie','Vergelijking berekeningen vóór go-live'],['🚀','Go-live in 7 dagen','Dossiers operationeel vanaf de eerste cyclus']]},
    cta:{h:'Sluit u aan bij kantoren die voor onafhankelijkheid kozen.',sub:'Begeleide migratie \u00b7 SLA 99.9% \u00b7 Eerste maand gratis',btn:'Fiduciaire demo \u2192'}},
  form:{ey:'Opleidingen',bc:'Opleidingen',h:'Het Belgische sociale recht\nbeheersen.\nIn uw tempo.',sub:'Webinars, praktijkgidsen en tutorials over Belgische loonberekening, ONSS, Dimona en Belcotax.',c1:'Programma bekijken',c2:'Contact opnemen',
    card:{label:'Aureus Opleidingen',title:'Leer van experts',sub:'Inhoud gebaseerd op echte praktijkgevallen.',stats:[['6','Modules'],['100%','Belgisch recht 2026'],['CPD','IEC-uren'],['FR/NL','Talen']]},
    mods:{ey:"Thema's",h:'Onze 6 opleidingsmodules',items:[{ico:'⚖️',t:'Belgisch sociaal recht',d:'Wet van 27/06/1969, ONSS, verplichtingen werkgever, paritaire comités.',f:false},{ico:'🧮',t:'Geavanceerde loonberekening',d:'Bruto → Netto: ONSS 13,07%, BV Bijlage III, werkbonus. Praktijkoefeningen.',f:true},{ico:'📋',t:'DmfA & Belcotax',d:'ONSS-aangiften, fiches 281.10/20/30, termijnen, correcties.',f:false},{ico:'🚀',t:'Onboarding Aureus Pro',d:'Configuratie, eerste fiche, eerste Dimona — in 2 uur.',f:false},{ico:'🏛',t:'GDPR & HR-beveiliging',d:'Art. 28 en 32, register Art. 30, DPA, versleuteling NISS/IBAN.',f:false},{ico:'📊',t:'Voortdurende wetgevende waakzaamheid',d:'Automatische meldingen zodra een Belgische wet uw verplichtingen beïnvloedt.',f:false}]},
    arts:{ey:'Inspiratie',h:'Altijd klaar voor de toekomst',items:[
      {ico:'\u2696\uFE0F',tag:'Droit social',t:'Eerste werknemer: de 5 fouten om te vermijden',d:'Late inschrijving, vergeten Dimona, verkeerde PC \u2014 de meest voorkomende valkuilen.',slug:'5-erreurs-premier-employe'},
      {ico:'\u{1F4BC}',tag:'Entrepreneuriat',t:'Zelfstandige of vennootschap: welk statuut in 2026?',d:'Bijdragen, fiscaliteit, sociale bescherming \u2014 volledige vergelijking.',slug:'independant-ou-societe-2026'},
      {ico:'\u{1F3E5}',tag:'Sant\u00e9',t:'Absenteisme: wettelijke verplichtingen van de werkgever',d:'Gewaarborgd loon, medisch attest, medische controle.',slug:'absenteisme-obligations'},
      {ico:'\u{1F3AF}',tag:'Motivation',t:'Alternatieve verloning: warrants, maaltijdcheques, bedrijfswagen',d:'Optimaliseer uw loonbeleid met extra-legale voordelen.',slug:'remuneration-alternative'},
      {ico:'\u{1F510}',tag:'RGPD',t:'GDPR & HR-gegevens: wat elke werkgever moet weten',d:'Verwerking NISS, IBAN, medische dossiers \u2014 Art. 28 en 32.',slug:'rgpd-donnees-rh'},
      {ico:'\u{1F9EE}',tag:'Paie',t:'Barema\u2019s 2026: de belangrijkste wijzigingen per PC',d:'PC 200, 226, 319 \u2014 overzicht van de nieuwe loonroosters.',slug:'baremes-2026-cp'},
    ]},
    cta:{h:'Heeft u een activiteit of wilt u uw bedrijf ontwikkelen?',sub:'Wat uw vraag ook is, Aureus geeft u duidelijke antwoorden.',btn:'Neem contact op \u2192'}},
  con:{ey:'Contact',h:'Hoe kunnen wij\nu helpen?',sub:'Ons team antwoordt binnen 4 werkuren. Geen chatbot \u2014 echte experts in Belgisch sociaal recht.',
    ch:[['\u2709\uFE0F','E-mail','info@aureus-ia.com'],['\u{1F4BB}','Applicatie','app.aureussocial.be'],['\u{1F4CD}','Adres','Place Marcel Broodthaers 8, 1060 Sint-Gillis, Brussel']],
    cr:[['KBO','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Reactie','< 4 werkuren']],
    f:{t:'Demo aanvragen',s:'Antwoord gegarandeerd binnen 4 werkuren.',fn:'Voornaam *',ln:'Achternaam *',em:'Professioneel e-mail *',ph:'Telefoonnummer',co:'Bedrijf',ro:'U bent *',ms:'Bericht',fnp:'Jan',lnp:'Janssen',emp:'jan.janssen@fiduciaire.be',php:'+32 2 000 00 00',cop:'Kantoor Janssen',msp:'Beschrijf uw situatie\u2026',sub:'Aanvraag verzenden',note:'Door dit formulier in te dienen gaat u akkoord met ons GDPR-beleid.',ok:'\u2713 Bericht verzonden \u2014 we antwoorden binnen 4 werkuren.',roles:['Selecteer...','Zelfstandige / Starter','Fiduciaire / Accountant','Directe werkgever','Sociaal secretariaat','Makelaar / Partner','Andere']}},
};

T.en={
  topbar:{country:'\u{1F1E7}\u{1F1EA} Belgium',bce:'VAT BE 1028.230.781',contact:'Contact',client:'Client area'},
  nav:{demo:'Book a demo',login:'Log in'},
  discover:'Discover',readmore:'Read',
  back:'\u2190 Back',artBack:'Back',artToc:'In this article',artRead:' read',
  autoManaged:'All these topics are automatically managed in Aureus Social Pro.',
  cookie:{text:'This site uses cookies to improve your experience.',accept:'Accept',refuse:'Decline',settings:'Settings'},
  mega:{
    1:{label:'Freelancers',items:[['\u{1F680}','Become a freelancer','Status, obligations, ONSS steps','independant'],['\u{1F9EE}','Contributions','Quarterly ONSS calculation','independant'],['\u{1F4CB}','Obligations','Dimona, DmfA, VAT, PIT','independant'],['\u{1F6E1}\u{FE0F}','Social protection','Illness, disability, pension','independant']]},
    2:{label:'Become an employer',items:[['\u{1F464}','First employee','ONSS registration, contract','employeur'],['\u{1F4C4}','Employment contract','Open-ended, fixed-term \u2014 compliant templates','employeur'],['\u26A1','Automatic Dimona','IN/OUT declaration in 8 seconds','employeur'],['\u{1F4B6}','First payroll','Pay calculation, slips, SEPA','employeur']]},
    3:{label:'Employers',items:[['\u{1F3E2}','Payroll management','166 JC, scales, bonuses, ONSS','employeurs'],['\u{1F4CA}','Quarterly declarations','DmfA XML, Belcotax 281.10/20/30','employeurs'],['\u{1F4C1}','Accounting export','WinBooks, BOB, Octopus, Exact Online','employeurs'],['\u{1F510}','Security & GDPR','AES-256-GCM, audit trail, RLS','employeurs'],['\u{1F465}','Employee portal','Payslips, documents, leave','employeurs'],['\u{270D}\u{FE0F}','Electronic signature','Yousign / DocuSign','employeurs']]},
    4:{label:'Training',items:[['\u{1F4DA}','Belgian social law','ONSS, payroll, Dimona','formations'],['\u{1F9EE}','Advanced payroll','JC, scales, Annex III','formations'],['\u{1F3DB}','DmfA & Belcotax','Step-by-step declarations','formations'],['\u{1F680}','Aureus Pro Onboarding','Full onboarding','formations']]},
    5:{label:'Accountants',items:[['\u{1F3DB}','Multi-client portal','All files centralized','experts'],['\u{1F517}','REST API + Webhooks','ERP integration','experts'],['\u{1F4E4}','ONSS mandates','Mahis/CSAM generation','experts'],['\u{1F504}','Assisted migration','From SD Worx, Partena\u2026','experts']]},
  },
  hero:{badge:'Belgian digital payroll platform \u2014 v18 in production',h1:'Your Belgian social\npartner.\nFinally digital.',sub:'From Dimona to quarterly declarations \u2014 everything you need, in one place.',cta1:'Go to application',cta2:'Watch demo',stats:[['166','Joint committees'],['< 8s','Dimona submitted'],['47K+','Payslips'],['10.000+','Companies']]},
  logos:{title:'They trust Aureus Social Pro',items:['SME Brussels','Dupont Fiduciary','Janssen Office','HR Partners','Comptaflex','StartBE']},
  mockup:{badge:'Real-time interface',title:'Your entire social cycle\nin one dashboard.',sub:'Unified dashboard, real-time ONSS alerts, accounting export in one click.',features:['Payslip in 3 clicks','Dimona IN/OUT < 8 seconds','DmfA XML ready by the 5th','AES-256 encrypted nightly backup'],db:{title:'Dashboard',stats:[['47.2K','Payslips','\u{1F4C4}'],['18.6K','ONSS Declarations','\u{1F4CB}'],['10.000+','Companies','\u{1F3E2}'],['99.97%','Uptime','\u26A1']],chart:'Payroll Q1 2026',badges:[{l:'Dimona',c:'#22C55E',v:'8 min ago'},{l:'DmfA Q1',c:'#D4A84C',v:'Ready'},{l:'Belcotax',c:'#60A5FA',v:'Due Apr 5'}]}},
  testimonials:{ey:'Testimonials',title:'What our clients say.',items:[{name:'Sophie Renard',role:'HR Manager \u2014 12 employees SME, Brussels',text:'We left SD Worx after 8 years. Migration took 3 days and we save \u20ac340/month.',stars:5,initials:'SR',color:'#B8913A'},{name:'Marc Janssen',role:'Accountant \u2014 23 client files',text:'The multi-client portal is exactly what was missing. 23 employers from one dashboard. Mahis mandates auto-generated.',stars:5,initials:'MJ',color:'#1A5C42'},{name:'Amira Benali',role:'Freelancer, JC 200',text:'Submitted my first Dimona in 7 seconds. Payroll calculation perfect \u2014 ONSS, withholding tax, employment bonus.',stars:5,initials:'AB',color:'#18396A'}]},
  roi:{ey:'ROI Calculator',title:'How much do you save\nby leaving SD Worx?',sub:'Estimate your annual savings in 30 seconds.',employees:'Number of employees',current:'Current provider',providers:['SD Worx','Partena','Securex','Sodexo','Other'],result:{saving:'Estimated annual savings',months:'Return on investment',per:'saved per month',cta:'Book a demo now',note:'Estimate based on our public rates vs average Belgian market rates.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]},
  sol:{ey:'Our solutions',h:'The right solution for every profile.',sub:'Freelancer, employer or accountant \u2014 Aureus Social Pro adapts.',items:[{ico:'\u{1F680}',title:'Become a freelancer',desc:'Status, ONSS, obligations \u2014 everything to start with confidence.',page:'independant'},{ico:'\u{1F464}',title:'Become an employer',desc:'Registration, contract, Dimona, first payroll.',page:'employeur',featured:true},{ico:'\u{1F3E2}',title:'Employers',desc:'Automate payroll, DmfA, accounting exports.',page:'employeurs'},{ico:'\u{1F3DB}',title:'Accountants',desc:'Multi-client portal, Mahis/CSAM mandates, REST API.',page:'experts'},{ico:'\u{1F4CA}',title:'Declarations & Belcotax',desc:'Quarterly DmfA, 281.10/20/30 slips, MyMinfin.',page:'employeurs'},{ico:'\u{1F4DA}',title:'Training',desc:'Webinars on Belgian social law.',page:'formations'}]},
  art:{ey:'Always ready for the future',h:'Resources & news',filters:[['tout','All'],['paie','Payroll'],['rh','HR'],['legal','Legislation'],['onss','ONSS']],items:[
    {cat:'paie',ico:'\u{1F9EE}',tag:'Paie',title:'2026 Sectoral pay scales: what changes',slug:'baremes-2026',desc:'Update of 166 joint committees integrated in Aureus Social Pro before January 1st.'},
    {cat:'legal',ico:'\u2696\uFE0F',tag:'L\u00e9gislation',title:'Employment bonus 2026: new ceilings',slug:'bonus-emploi-2026',desc:'The pay ceiling has been revised. Impact on your calculations.'},
    {cat:'onss',ico:'\u{1F3DB}',tag:'ONSS',title:'DmfA Q1 2026: deadline and updates',slug:'dmfa-q1-2026',desc:'Deadline, new worker codes and structural reduction.'},
    {cat:'rh',ico:'\u{1F465}',tag:'RH',title:'Employee portal: payslips, documents, leave',slug:'portail-employe',desc:'Your employees access their payslips without contacting payroll.'},
    {cat:'paie',ico:'\u{1F3E6}',tag:'Paie',title:'SEPA pain.001: automate your transfers',slug:'sepa-pain001',desc:'ISO 20022 batch payment files.'},
    {cat:'legal',ico:'\u{1F510}',tag:'RGPD',title:'GDPR Art. 32 & Belgian payroll',slug:'rgpd-paie-belge',desc:'NISS encryption, Art. 30 register, DPA \u2014 full compliance.'},
  ]},
  nw:{ey:'Newsletter',h:'Never miss a social update.',sub:'Legal changes, updated scales, practical advice.',ph:'your@email.com',btn:'Subscribe',note:'Aureus IA SPRL privacy policy.',ok:'\u2713 Subscription confirmed \u2014 welcome!',feats:[['\u2696\uFE0F','Daily legal watch','Alerts when a law impacts your obligations'],['\u{1F9EE}','Updated 2026 scales','New JC grids before entry into force'],['\u{1F4A1}','Expert advice','Practical guides from our lawyers']]},
  cta:{h:'Ready to modernize your HR administration?',sub:'First month free \u00b7 Immediate access \u00b7 Assisted migration',btn:'Get started \u2192'},
  ft:{col1:'Solutions',col2:'Product',col3:'Legal',copy:'\u00a9 2026 Aureus IA SPRL \u00b7 All rights reserved',links:['Disclaimer','Privacy','Cookie policy','T&C'],desc:'Belgian digital payroll platform. 132 modules, 166 joint committees.',c1:[['Freelancers','independant'],['Become an employer','employeur'],['Employers','employeurs'],['Accountants','experts'],['Training','formations']],c2:[['Book a demo','contact'],['Documentation',null],['Status',null]],c3:[['Privacy',null],['Terms',null],['GDPR',null],['Disclaimer',null]]},
  articles:T.articles,
  ind:{ey:'Freelancers',bc:'Freelancers',h:'Become a freelancer\nin Belgium.',sub:'The complete step-by-step guide.',c1:'Talk to an expert',c2:'Book a demo',
    card:{label:'Aureus Social Pro',title:'Your social back-office',sub:'Automate your obligations.',stats:[['166','JC managed'],['<8s','Dimona'],['100%','Compliant'],['24/7','Access']]},
    sy:{ey:'Step-by-step guide',h:'Start in 6 steps',chk:['Dimona IN/OUT < 8s','ONSS contributions 13.07%','PDF payslips','Quarterly DmfA XML','Belcotax 281.10','SEPA pain.001','Electronic signature'],chkH:'What Aureus automates',
      tip:{h:'Good to know',t:'In 2026, the first employee benefits from a full exemption from employer ONSS contributions for 5 years.'},
      steps:[{n:1,t:'Choose your status',b:'Self-employed main or secondary, company (SRL, SA…) or sole trader.',tags:['SRL · SA · Sole trader'],tc:'vt-tag-au'},{n:2,t:'Company number (CBE)',b:'Registration in the legal entities register at the enterprise court registry.',tags:['CBE · Crossroads Bank'],tc:'vt-tag-b'},{n:3,t:'Affiliation to a social fund',b:'Legal obligation within 90 days of starting activity.',tags:['ONSS · 90 days'],tc:'vt-tag-g'},{n:4,t:'Quarterly social contributions',b:'20.5% up to €72,810 and 14.16% above. Minimum: €870.78/quarter.',tags:['20.5% · Quarterly'],tc:'vt-tag-au'},{n:5,t:'VAT & PIT obligations',b:'Monthly or quarterly VAT return, annual PIT return.',tags:['VAT · PIT · FPS Finance'],tc:''},{n:6,t:'Social protection',b:'Sickness-disability (INAMI), pension, family allowances. Optional: PLCI.',tags:['INAMI · Pension · PLCI'],tc:'vt-tag-g'}]},
    faq:{ey:'FAQ',h:'Everything you want to know',items:[['What is the registration deadline?','90 days from activity start. If exceeded: compulsory registration and surcharges.'],['Contributions in 2026?','20.5% up to 72810 EUR and 14.16% above. Minimum: 870.78 EUR/quarter.'],['Can I be a supplementary freelancer?','Yes, subject to employer agreement. Reduced contributions apply.'],['Does Aureus manage company directors?','Yes. Natural persons and company mandataries (SRL managers, SA directors).']]},
    cta:{h:'Ready to start with confidence?',sub:'Our experts guide you from A to Z.',btn:'Talk to an expert \u2192'}},
  emp:{ey:'First employee',bc:'Become an employer',h:'Hire your first\nemployee\nwith confidence.',sub:'ONSS registration, contract, Dimona, first payroll.',c1:'Book a demo',c2:'Already an employer \u2192',
    card:{label:'First employee in Belgium',title:'What Aureus does',sub:'Full automation of the social cycle.',stats:[['\u20ac0','Contributions yr 1'],['8s','Dimona'],['100%','ONSS'],['166 JC','All JC']]},
    steps:{ey:'Key steps',h:'From 0 to your first employee',items:[{n:1,t:'ONSS employer registration',b:'ONSS employer number before hiring. Aureus guides via WIDE.',tags:['ONSS · WIDE · Number'],tc:'vt-tag-b'},{n:2,t:'Drafting the employment contract',b:'Open-ended, fixed-term, full or part-time — compliant templates for the applicable JC.',tags:['Open-ended · Fixed-term · JC 200'],tc:'vt-tag-au'},{n:3,t:'Dimona IN declaration',b:'Mandatory before work begins. Submitted in less than 8 seconds.',tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},{n:4,t:'First salary calculation',b:'Gross → Net: ONSS 13.07%, withholding tax Annex III, employment bonus.',tags:['ONSS · WHT · Employment bonus'],tc:'vt-tag-au'},{n:5,t:'SEPA transfer',b:'SEPA pain.001 file ready to import into your bank.',tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},{n:6,t:'Quarterly ONSS declarations',b:'DmfA XML Q1–Q4 with all applicable reductions.',tags:['DmfA · Q1–Q4'],tc:''}]},
    av:{ey:'2026 Benefits',h:'Exemptions & hiring bonuses',items:[['🎁','1st employee exemption','Full exemption from employer ONSS contributions for 5 years.'],['💼','Activa.brussels','Monthly subsidy up to €350 for a Brussels jobseeker.'],['📉','Low wage reduction','Employer ONSS reduction for salaries below €3,100/month.'],['🎓','SINE & Activa plan','Reductions for hiring people far from the labour market.'],['👶','Parental leave','Management of contract suspensions and specific ONSS declarations.'],['📋','MonBEE recruitment','Hiring subsidy via MonBEE. Deadlines and documents generated automatically.']]},
    cta:{h:'Hire your first employee tomorrow.',sub:'Free demo \u00b7 Full support \u00b7 First month free',btn:'Get started \u2192'}},
  emps:{ey:'Employers',bc:'Employers',h:'Your payroll,\nyour declarations,\nautomated.',sub:'166 joint committees, DmfA XML, Belcotax, WinBooks/BOB export \u2014 132 modules.',c1:'Access platform',c2:'Book a demo',
    card:{label:'Platform in production',title:'Real figures \u2014 March 2026',sub:'132 modules \u00b7 44,246 lines of code',stats:[['47.2K','Payslips'],['18.6K','ONSS Declarations'],['10.000+','Companies'],['99.97%','Uptime']]},
    mods:{ey:'Features',h:'132 modules for the complete social cycle',items:[['⚡','Electronic Dimona','IN/OUT/UPDATE in less than 8 seconds. Direct ONSS connection.'],['🧮','Belgian payroll calculation','166 JCs, 2026 scales, ONSS 13.07%, withholding tax Annex III.'],['📋','Quarterly DmfA XML','Q1–Q4 ONSS-compliant. Structural reduction, low wage, employment bonus.'],['📊','Belcotax XML','Forms 281.10, 281.20, 281.30 FPS Finance compliant. MyMinfin upload.'],['🏦','SEPA pain.001','Batch transfer files ISO 20022. IBAN/BIC validation.'],['📁','Accounting export × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['✍️','Electronic signature','Yousign or DocuSign. Legal probative value.'],['👥','Employee portal','Payslips, HR, leave — directly accessible by employees.'],['🔐','Security GDPR Art. 32','AES-256-GCM NISS/IBAN, audit trail, RLS Supabase.']]},
    cta:{h:'See the platform in action.',sub:'Demo on your own data \u2014 30 minutes.',btn:'Book a demo \u2192'}},
  exp:{ey:'Accountants',bc:'Accountants',h:'One portal,\nall your social\nfiles.',sub:'Mahis/CSAM mandates, multi-client portal, REST API, migration from SD Worx or Partena.',c1:'Book a fiduciary demo',c2:'Assisted migration',
    card:{label:'Fiduciary Plan',title:'Unlimited multi-files',sub:'Portal \u00b7 API \u00b7 SLA \u00b7 Migration',stats:[['23+','Files per firm'],['99.9%','SLA uptime'],['REST','API + Webhooks'],['\u20ac0','Migration']]},
    it:{ey:'What we offer',h:'Designed for financial professionals',list:[['01','Centralised multi-client portal','Manage all your files from one dashboard. Granular access rights.'],['02','Automatic ONSS & Belcotax mandates','Compliant Mahis/CSAM agreements. Active mandate tracking per client.'],['03','REST API + HMAC Webhooks','Integrate Aureus into your ERP. Secured webhooks payroll/DmfA/Dimona.'],['04','Migration from your providers','Multi-format CSV parser SD Worx, Partena, Securex, Sodexo.'],['05','6 accounting export formats','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['06','SLA 99.9% + Account Manager','Response < 2h business hours. Dedicated Slack channel. Assigned account manager.']]},
    mig:{ey:'Migration',h:'Leave SD Worx or Partena without risk.',steps:[['📥','Data export','CSV from your current provider'],['🔄','Automatic import','Aureus parser — no re-entry'],['✅','Cross-validation','Calculation comparison before go-live'],['🚀','Go-live in 7 days','Files operational from the first cycle']]},
    cta:{h:'Join the firms that chose independence.',sub:'Assisted migration \u00b7 SLA 99.9% \u00b7 First month free',btn:'Fiduciary demo \u2192'}},
  form:{ey:'Training',bc:'Training',h:'Master Belgian\nsocial law.\nAt your pace.',sub:'Webinars, practical guides and tutorials on Belgian payroll, ONSS, Dimona and Belcotax.',c1:'See programme',c2:'Contact us',
    card:{label:'Aureus Training',title:'Learn from experts',sub:'Content based on real case studies.',stats:[['6','Modules'],['100%','Belgian law 2026'],['CPD','IEC hours'],['FR/NL','Languages']]},
    mods:{ey:'Topics',h:'Our 6 training modules',items:[{ico:'⚖️',t:'Belgian social law',d:'Act of 27/06/1969, ONSS, employer obligations, joint committees.',f:false},{ico:'🧮',t:'Advanced payroll calculation',d:'Gross → Net: ONSS 13.07%, WHT Annex III, employment bonus. Practical exercises.',f:true},{ico:'📋',t:'DmfA & Belcotax',d:'ONSS declarations, forms 281.10/20/30, deadlines, corrections.',f:false},{ico:'🚀',t:'Aureus Pro onboarding',d:'Configuration, first payslip, first Dimona — in 2 hours.',f:false},{ico:'🏛',t:'GDPR & HR security',d:'Art. 28 and 32, Art. 30 register, DPA, NISS/IBAN encryption.',f:false},{ico:'📊',t:'Continuous legislative monitoring',d:'Automatic alerts whenever a Belgian law impacts your obligations.',f:false}]},
    arts:{ey:'Inspiration',h:'Always ready for the future',items:[
      {ico:'\u2696\uFE0F',tag:'Droit social',t:'First employee: the 5 mistakes to avoid',d:'Late registration, forgotten Dimona, wrong JC \u2014 the most common pitfalls.',slug:'5-erreurs-premier-employe'},
      {ico:'\u{1F4BC}',tag:'Entrepreneuriat',t:'Freelancer or company: which status in 2026?',d:'Contributions, taxation, social protection \u2014 full comparison.',slug:'independant-ou-societe-2026'},
      {ico:'\u{1F3E5}',tag:'Sant\u00e9',t:'Absenteeism: the employer\u2019s legal obligations',d:'Guaranteed salary, medical certificate, medical check.',slug:'absenteisme-obligations'},
      {ico:'\u{1F3AF}',tag:'Motivation',t:'Alternative pay: warrants, meal vouchers, company car',d:'Optimise your pay policy with non-statutory benefits.',slug:'remuneration-alternative'},
      {ico:'\u{1F510}',tag:'RGPD',t:'GDPR & HR data: what every employer must know',d:'Processing NISS, IBAN, medical files \u2014 Art. 28 and 32.',slug:'rgpd-donnees-rh'},
      {ico:'\u{1F9EE}',tag:'Paie',t:'2026 scales: key changes by JC',d:'JC 200, 226, 319 \u2014 overview of new pay grids.',slug:'baremes-2026-cp'},
    ]},
    cta:{h:'Starting a business or looking to grow?',sub:'Whatever your question, Aureus gives you clear answers.',btn:'Contact us \u2192'}},
  con:{ey:'Contact',h:'How can we\nhelp you?',sub:'Our team responds within 4 working hours. No chatbot \u2014 real Belgian social law experts.',
    ch:[['\u2709\uFE0F','Email','info@aureus-ia.com'],['\u{1F4BB}','Application','app.aureussocial.be'],['\u{1F4CD}','Address','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Brussels']],
    cr:[['VAT','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Response','< 4 working hours']],
    f:{t:'Book a demo',s:'Response guaranteed within 4 working hours.',fn:'First name *',ln:'Last name *',em:'Professional email *',ph:'Phone number',co:'Company',ro:'You are *',ms:'Message',fnp:'John',lnp:'Smith',emp:'john.smith@fiduciary.com',php:'+32 2 000 00 00',cop:'Smith & Partners',msp:'Describe your situation\u2026',sub:'Send request',note:'By submitting this form you agree to our GDPR policy.',ok:'\u2713 Message sent \u2014 we will reply within 4 working hours.',roles:['Select...','Freelancer / Starter','Fiduciary / Accountant','Direct employer','Social secretariat','Broker / Partner','Other']}},
};

T.de={
  topbar:{country:'\u{1F1E7}\u{1F1EA} Belgien',bce:'USt BE 1028.230.781',contact:'Kontakt',client:'Kundenbereich'},
  nav:{demo:'Demo anfordern',login:'Anmelden'},
  discover:'Entdecken',readmore:'Lesen',
  back:'\u2190 Zur\u00fcck',artBack:'Zur\u00fcck',artToc:'In diesem Artikel',artRead:' Lesezeit',
  autoManaged:'Alle diese Themen werden automatisch in Aureus Social Pro verwaltet.',
  cookie:{text:'Diese Website verwendet Cookies zur Verbesserung Ihrer Erfahrung.',accept:'Akzeptieren',refuse:'Ablehnen',settings:'Einstellungen'},
  mega:{
    1:{label:'Selbst\u00e4ndige',items:[['\u{1F680}','Selbst\u00e4ndig werden','Statut, Pflichten, ONSS','independant'],['\u{1F9EE}','Beitr\u00e4ge','Viertelj\u00e4hrliche ONSS-Berechnung','independant'],['\u{1F4CB}','Pflichten','Dimona, DmfA, MwSt., ESt.','independant'],['\u{1F6E1}\u{FE0F}','Sozialschutz','Krankheit, Invalidit\u00e4t, Rente','independant']]},
    2:{label:'Arbeitgeber werden',items:[['\u{1F464}','Erster Arbeitnehmer','ONSS-Anmeldung, Vertrag','employeur'],['\u{1F4C4}','Arbeitsvertrag','Unbefristet, befristet \u2014 konforme Muster','employeur'],['\u26A1','Automatische Dimona','IN/OUT-Meldung in 8 Sekunden','employeur'],['\u{1F4B6}','Erste Geh\u00e4lter','Gehaltsberechnung, Zettel, SEPA','employeur']]},
    3:{label:'Arbeitgeber',items:[['\u{1F3E2}','Gehaltsabrechnung','166 PK, Tarife, Pr\u00e4mien, ONSS','employeurs'],['\u{1F4CA}','Quartalsmeldungen','DmfA XML, Belcotax 281.10/20/30','employeurs'],['\u{1F4C1}','Buchhalterexport','WinBooks, BOB, Octopus, Exact Online','employeurs'],['\u{1F510}','Sicherheit & DSGVO','AES-256-GCM, Auditpfad, RLS','employeurs'],['\u{1F465}','Mitarbeiterportal','Gehaltszettel, Dokumente, Urlaub','employeurs'],['\u{270D}\u{FE0F}','Elektronische Unterschrift','Yousign / DocuSign','employeurs']]},
    4:{label:'Schulungen',items:[['\u{1F4DA}','Belgisches Sozialrecht','ONSS, Lohn, Dimona','formations'],['\u{1F9EE}','Fortgeschrittene Lohnberechnung','PK, Tarife, Anlage III','formations'],['\u{1F3DB}','DmfA & Belcotax','Schritt-f\u00fcr-Schritt-Meldungen','formations'],['\u{1F680}','Aureus Pro Onboarding','Vollst\u00e4ndige Einf\u00fchrung','formations']]},
    5:{label:'Buchhalter',items:[['\u{1F3DB}','Multi-Mandanten-Portal','Alle Akten zentralisiert','experts'],['\u{1F517}','REST API + Webhooks','ERP-Integration','experts'],['\u{1F4E4}','ONSS-Mandate','Mahis/CSAM-Generierung','experts'],['\u{1F504}','Begleitete Migration','Von SD Worx, Partena\u2026','experts']]},
  },
  hero:{badge:'Digitales belgisches Sozialsekretariat \u2014 v18 in Produktion',h1:'Ihr belgischer\nSozialpartner.\nEndlich digital.',sub:'Von Dimona bis Quartalsmeldungen \u2014 alles, was Sie brauchen, an einem Ort.',cta1:'Zur Anwendung',cta2:'Demo ansehen',stats:[['166','Parit\u00e4tische Kommissionen'],['< 8s','Dimona eingereicht'],['47K+','Gehaltszettel'],['10.000+','Unternehmen']]},
  logos:{title:'Sie vertrauen Aureus Social Pro',items:['KMU Br\u00fcssel','Fiduziaire Dupont','B\u00fcro Janssen','HR Partners','Comptaflex','StartBE']},
  mockup:{badge:'Echtzeit-Interface',title:'Ihr gesamter Sozialdatenzyklus\nin einem Dashboard.',sub:'Unified Dashboard, ONSS-Echtzeit-Benachrichtigungen, Buchhalterexport per Klick.',features:['Gehaltszettel in 3 Klicks','Dimona IN/OUT < 8 Sekunden','DmfA XML am 5. fertig','AES-256-verschl\u00fcsseltes Nacht-Backup'],db:{title:'Dashboard',stats:[['47.2K','Gehaltszettel','\u{1F4C4}'],['18.6K','ONSS-Meldungen','\u{1F4CB}'],['10.000+','Unternehmen','\u{1F3E2}'],['99.97%','Uptime','\u26A1']],chart:'Gehalt Q1 2026',badges:[{l:'Dimona',c:'#22C55E',v:'vor 8 Min.'},{l:'DmfA Q1',c:'#D4A84C',v:'Bereit'},{l:'Belcotax',c:'#60A5FA',v:'Vor 5. Apr.'}]}},
  testimonials:{ey:'Referenzen',title:'Was unsere Kunden sagen.',items:[{name:'Sophie Renard',role:'HR-Leiterin \u2014 KMU 12 Mitarbeiter, Br\u00fcssel',text:'SD Worx nach 8 Jahren verlassen. Migration 3 Tage, wir sparen 340\u20ac/Monat.',stars:5,initials:'SR',color:'#B8913A'},{name:'Marc Janssen',role:'Buchhalter \u2014 23 Akten',text:'Das Multi-Mandanten-Portal ist genau das, was gefehlt hat. 23 Arbeitgeber aus einem Dashboard. Mahis-Mandate automatisch.',stars:5,initials:'MJ',color:'#1A5C42'},{name:'Amira Benali',role:'Selbst\u00e4ndige, PK 200',text:'Erste Dimona in 7 Sekunden. Gehaltsberechnung perfekt \u2014 ONSS, Lohnsteuer, Besch\u00e4ftigungsbonus.',stars:5,initials:'AB',color:'#18396A'}]},
  roi:{ey:'ROI-Rechner',title:'Wie viel sparen Sie,\nwenn Sie SD Worx verlassen?',sub:'Sch\u00e4tzen Sie Ihre j\u00e4hrlichen Einsparungen in 30 Sekunden.',employees:'Anzahl Mitarbeiter',current:'Aktueller Anbieter',providers:['SD Worx','Partena','Securex','Sodexo','Andere'],result:{saving:'Gesch\u00e4tzte j\u00e4hrliche Einsparung',months:'Return on Investment',per:'pro Monat gespart',cta:'Jetzt Demo anfordern',note:'Sch\u00e4tzung basierend auf unseren Tarifen vs. belgischen Marktdurchschnittstarifen.'},tiers:[{label:'Basic',aureus:15,sdworx:42},{label:'Standard',aureus:25,sdworx:68},{label:'Premium',aureus:38,sdworx:95}]},
  sol:{ey:'Unsere L\u00f6sungen',h:'F\u00fcr jedes Profil die richtige L\u00f6sung.',sub:'Selbst\u00e4ndige, Arbeitgeber oder Buchhalter \u2014 Aureus Social Pro passt sich an.',items:[{ico:'\u{1F680}',title:'Selbst\u00e4ndig werden',desc:'Statut, ONSS, Pflichten \u2014 alles f\u00fcr einen ruhigen Start.',page:'independant'},{ico:'\u{1F464}',title:'Arbeitgeber werden',desc:'Anmeldung, Vertrag, Dimona, erste Geh\u00e4lter.',page:'employeur',featured:true},{ico:'\u{1F3E2}',title:'Arbeitgeber',desc:'Gehaltsabrechnung, DmfA, Buchhalterexport automatisieren.',page:'employeurs'},{ico:'\u{1F3DB}',title:'Buchhalter',desc:'Multi-Mandanten-Portal, Mahis/CSAM-Mandate, REST API.',page:'experts'},{ico:'\u{1F4CA}',title:'Meldungen & Belcotax',desc:'Quartals-DmfA, Fiches 281.10/20/30, MyMinfin.',page:'employeurs'},{ico:'\u{1F4DA}',title:'Schulungen',desc:'Webinare zum belgischen Sozialrecht.',page:'formations'}]},
  art:{ey:'Immer bereit f\u00fcr die Zukunft',h:'Ressourcen & News',filters:[['tout','Alles'],['paie','Lohn'],['rh','HR'],['legal','Gesetzgebung'],['onss','ONSS']],items:[
    {cat:'paie',ico:'\u{1F9EE}',tag:'Paie',title:'Sektortarife 2026: was sich \u00e4ndert',slug:'baremes-2026',desc:'Aktualisierung der 166 PK in Aureus Social Pro vor dem 1. Januar integriert.'},
    {cat:'legal',ico:'\u2696\uFE0F',tag:'L\u00e9gislation',title:'Besch\u00e4ftigungsbonus 2026: neue Obergrenzen',slug:'bonus-emploi-2026',desc:'Die Lohnobergrenze wurde revidiert. Auswirkungen auf Ihre Berechnungen.'},
    {cat:'onss',ico:'\u{1F3DB}',tag:'ONSS',title:'DmfA Q1 2026: Frist und Neuerungen',slug:'dmfa-q1-2026',desc:'Frist, neue Arbeitnehmercodes und strukturelle K\u00fcrzung.'},
    {cat:'rh',ico:'\u{1F465}',tag:'RH',title:'Mitarbeiterportal: Gehaltszettel, Dokumente, Urlaub',slug:'portail-employe',desc:'Ihre Mitarbeiter greifen auf ihre Gehaltszettel zu, ohne die Lohnbuchhaltung zu kontaktieren.'},
    {cat:'paie',ico:'\u{1F3E6}',tag:'Paie',title:'SEPA pain.001: Automatisieren Sie Ihre \u00dcberweisungen',slug:'sepa-pain001',desc:'ISO 20022 Sammel\u00fcberweisungsdateien.'},
    {cat:'legal',ico:'\u{1F510}',tag:'RGPD',title:'DSGVO Art. 32 & belgische Lohnverarbeitung',slug:'rgpd-paie-belge',desc:'NISS-Verschl\u00fcsselung, Register Art. 30, DPA \u2014 vollst\u00e4ndige Konformit\u00e4t.'},
  ]},
  nw:{ey:'Newsletter',h:'Kein Sozialrecht-Update verpassen.',sub:'Gesetz\u00e4nderungen, aktualisierte Tarife, praktische Tipps.',ph:'ihre@email.de',btn:'Abonnieren',note:'Datenschutzrichtlinie Aureus IA SPRL.',ok:'\u2713 Anmeldung best\u00e4tigt \u2014 willkommen!',feats:[['\u2696\uFE0F','T\u00e4gliche Rechts\u00fcberwachung','Meldungen wenn ein Gesetz Ihre Pflichten betrifft'],['\u{1F9EE}','Aktualisierte Tarife 2026','Neue PK-Raster vor Inkrafttreten'],['\u{1F4A1}','Expertenrat','Praxismerkbl\u00e4tter unserer Juristen']]},
  cta:{h:'Bereit, Ihre Sozialverwaltung zu modernisieren?',sub:'Erster Monat kostenlos \u00b7 Sofortiger Zugang \u00b7 Migrationsbegleitung',btn:'Jetzt starten \u2192'},
  ft:{col1:'L\u00f6sungen',col2:'Produkt',col3:'Rechtliches',copy:'\u00a9 2026 Aureus IA SPRL \u00b7 Alle Rechte vorbehalten',links:['Disclaimer','Datenschutz','Cookie-Richtlinie','AGB'],desc:'Digitales belgisches Sozialsekretariat. 132 Module, 166 Kommissionen.',c1:[['Selbst\u00e4ndige','independant'],['Arbeitgeber werden','employeur'],['Arbeitgeber','employeurs'],['Buchhalter','experts'],['Schulungen','formations']],c2:[['Demo anfordern','contact'],['Dokumentation',null],['Status',null]],c3:[['Datenschutz',null],['AGB',null],['DSGVO',null],['Disclaimer',null]]},
  articles:T.articles,
  ind:{ey:'Selbst\u00e4ndige',bc:'Selbst\u00e4ndige',h:'Selbst\u00e4ndig werden\nin Belgien.',sub:'Der vollst\u00e4ndige Schritt-f\u00fcr-Schritt-Leitfaden.',c1:'Mit einem Experten sprechen',c2:'Demo anfordern',
    card:{label:'Aureus Social Pro',title:'Ihr soziales Back-Office',sub:'Automatisieren Sie Ihre Pflichten.',stats:[['166','PK verwaltet'],['<8s','Dimona'],['100%','Konform'],['24/7','Zugang']]},
    sy:{ey:'Schritt f\u00fcr Schritt',h:'In 6 Schritten starten',chk:['Dimona IN/OUT < 8s','ONSS-Beitr\u00e4ge 13,07%','PDF-Gehaltszettel','Viertelj\u00e4hrliche DmfA XML','Belcotax 281.10','SEPA pain.001','Elektronische Unterschrift'],chkH:'Was Aureus automatisiert',
      tip:{h:'Gut zu wissen',t:'Im Jahr 2026 profitiert der erste Arbeitnehmer 5 Jahre lang von einer vollst\u00e4ndigen Befreiung der Arbeitgeberbeitr\u00e4ge.'},
      steps:[{n:1,t:'Ihren Status wählen',b:'Selbständig im Haupt- oder Nebenerwerb, Gesellschaft (GmbH, AG…) oder Einzelunternehmen.',tags:['GmbH · AG · Einzelunternehmen'],tc:'vt-tag-au'},{n:2,t:'Unternehmensnummer (MwSt-Nr.)',b:'Eintragung im Rechtspoträgerregister beim Handelsregistergericht.',tags:['MwSt-Nr. · Crossroads Bank'],tc:'vt-tag-b'},{n:3,t:'Anschluss an einen Sozialfonds',b:'Gesetzliche Pflicht innerhalb von 90 Tagen nach Tätigkeitsbeginn.',tags:['ONSS · 90 Tage'],tc:'vt-tag-g'},{n:4,t:'Vierteljährliche Sozialbeiträge',b:'20,5% bis 72.810 € und 14,16% darüber. Minimum: 870,78 €/Quartal.',tags:['20,5% · Vierteljährlich'],tc:'vt-tag-au'},{n:5,t:'MwSt & ESt-Pflichten',b:'Monatliche oder vierteljährliche MwSt-Erklärung, jährliche ESt-Erklärung.',tags:['MwSt · ESt · FOD Finanzen'],tc:''},{n:6,t:'Sozialschutz',b:'Krankheit-Invalidität (RIZIV), Rente, Kindergeld. Optional: PLCI.',tags:['RIZIV · Rente · PLCI'],tc:'vt-tag-g'}]},
    faq:{ey:'Häufige Fragen',h:'Alles, was Sie wissen möchten',items:[['Was ist die Anmeldefrist?','90 Tage ab Beginn Ihrer T\u00e4tigkeit. Bei \u00dcberschreitung: Zwangsanmeldung und Zuschl\u00e4ge.'],['Wie hoch sind die Beitr\u00e4ge 2026?','20,5% bis 72.810 \u20ac und 14,16% dar\u00fcber. Minimum: 870,78 \u20ac/Quartal.'],['Kann ich nebenberuflich selbst\u00e4ndig sein?','Ja, vorbehaltlich der Zustimmung Ihres Arbeitgebers. Erm\u00e4\u00dfgte Beitr\u00e4ge im Nebenerwerbsregime.'],['Verwaltet Aureus Gesellschaftsgesch\u00e4ftsf\u00fchrer?','Ja. Nat\u00fcrliche Personen und Gesellschaftsmandatare (SRL-Gesch\u00e4ftsf\u00fchrer, SA-Verwaltungsr\u00e4te).']]},
    cta:{h:'Bereit, sicher zu starten?',sub:'Unsere Experten begleiten Sie von A bis Z.',btn:'Mit einem Experten sprechen \u2192'}},
  emp:{ey:'Erster Arbeitnehmer',bc:'Arbeitgeber werden',h:'Ihren ersten Mitarbeiter\nmit Vertrauen\neinstellen.',sub:'ONSS-Anmeldung, Vertrag, Dimona, erste Geh\u00e4lter.',c1:'Demo anfordern',c2:'Bereits Arbeitgeber \u2192',
    card:{label:'Erster Arbeitnehmer in Belgien',title:'Was Aureus tut',sub:'Vollst\u00e4ndige Automatisierung des Sozialdatenzyklus.',stats:[['\u20ac0','Beitr\u00e4ge Jahr 1'],['8s','Dimona'],['100%','ONSS'],['166 PK','Alle PK']]},
    steps:{ey:'Wichtigste Schritte',h:'Von 0 zu Ihrem ersten Mitarbeiter',items:[{n:1,t:'ONSS-Arbeitgeberanmeldung',b:'ONSS-Arbeitgebernummer vor der Einstellung. Aureus führt durch WIDE.',tags:['ONSS · WIDE · Nummer'],tc:'vt-tag-b'},{n:2,t:'Arbeitsvertrag erstellen',b:'Unbefristet, befristet, Voll- oder Teilzeit — konforme Muster für die zutreffende PK.',tags:['Unbefristet · Befristet · PK 200'],tc:'vt-tag-au'},{n:3,t:'Dimona IN Erklärung',b:'Pflicht vor Arbeitsbeginn. In weniger als 8 Sekunden eingereicht.',tags:['Dimona IN · <8s · ONSS'],tc:'vt-tag-g'},{n:4,t:'Erste Gehaltsberechnung',b:'Brutto → Netto: ONSS 13,07%, Lohnsteuervorabzug Anlage III, Beschäftigungsbonus.',tags:['ONSS · LSt · Beschäftigungsbonus'],tc:'vt-tag-au'},{n:5,t:'SEPA-Überweisung',b:'SEPA pain.001-Datei bereit zum Import in Ihre Bank.',tags:['SEPA pain.001 · ISO 20022'],tc:'vt-tag-b'},{n:6,t:'Vierteljährliche ONSS-Erklärungen',b:'DmfA XML Q1–Q4 mit allen anwendbaren Ermäßigungen.',tags:['DmfA · Q1–Q4'],tc:''}]},
    av:{ey:'Vorteile 2026',h:'Befreiungen & Einstellungsprämien',items:[['🎁','Befreiung 1. Arbeitnehmer','Vollständige Befreiung von ONSS-Arbeitgeberbeiträgen für 5 Jahre.'],['💼','Activa.brussels','Monatliche Prämie bis zu 350 € für einen Brüsseler Arbeitssuchenden.'],['📉','Niedriglohnermäßigung','ONSS-Arbeitgeberermäßigung für Löhne unter 3.100 €/Monat.'],['🎓','SINE & Activa-Plan','Ermäßigungen für die Einstellung von arbeitsmarktfernen Personen.'],['👶','Elternzeit','Verwaltung von Vertragsunterbrechungen und spezifischen ONSS-Erklärungen.'],['📋','MonBEE Einstellung','Einstellungsprämie über MonBEE. Fristen und Dokumente automatisch generiert.']]},
    cta:{h:'Stellen Sie morgen Ihren ersten Mitarbeiter ein.',sub:'Kostenlose Demo \u00b7 Vollst\u00e4ndige Begleitung \u00b7 Erster Monat gratis',btn:'Starten \u2192'}},
  emps:{ey:'Arbeitgeber',bc:'Arbeitgeber',h:'Ihre Gehaltsabrechnung,\nIhre Meldungen,\nautomatisiert.',sub:'166 parit\u00e4tische Kommissionen, DmfA XML, Belcotax, WinBooks/BOB Export \u2014 132 Module.',c1:'Zur Plattform',c2:'Demo anfordern',
    card:{label:'Plattform in Produktion',title:'Echte Zahlen \u2014 M\u00e4rz 2026',sub:'132 Module \u00b7 44.246 Codezeilen',stats:[['47.2K','Gehaltszettel'],['18.6K','ONSS-Meldungen'],['10.000+','Unternehmen'],['99.97%','Uptime']]},
    mods:{ey:'Funktionen',h:'132 Module für den vollständigen Sozialdatenzyklus',items:[['⚡','Elektronische Dimona','IN/OUT/UPDATE in weniger als 8 Sekunden. Direkte ONSS-Verbindung.'],['🧮','Belgische Gehaltsberechnung','166 PK, Tarife 2026, ONSS 13,07%, Lohnsteuervorabzug Anlage III.'],['📋','Vierteljährliche DmfA XML','Q1–Q4 ONSS-konform. Strukturermäßigung, Niedriglohn, Beschäftigungsbonus.'],['📊','Belcotax XML','Formulare 281.10, 281.20, 281.30 FOD-Finanzen-konform. MyMinfin-Upload.'],['🏦','SEPA pain.001','Batch-Überweisungsdateien ISO 20022. IBAN/BIC-Validierung.'],['📁','Buchhaltungsexport × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['✍️','Elektronische Unterschrift','Yousign oder DocuSign. Gesetzlicher Beweiswert.'],['👥','Mitarbeiterportal','Gehaltszettel, HR, Urlaub — direkt zugänglich für Mitarbeiter.'],['🔐','Sicherheit DSGVO Art. 32','AES-256-GCM NISS/IBAN, Audittrail, RLS Supabase.']]},
    cta:{h:'Sehen Sie die Plattform in Aktion.',sub:'Demo mit Ihren eigenen Daten \u2014 30 Minuten.',btn:'Eine Demo reservieren \u2192'}},
  exp:{ey:'Buchhalter',bc:'Buchhalter',h:'Ein Portal,\nalle sozialen\nAkten.',sub:'Mahis/CSAM-Mandate, Multi-Mandanten-Portal, REST API, Migration von SD Worx oder Partena.',c1:'Fiduziaire Demo anfordern',c2:'Begleitete Migration',
    card:{label:'Fiduziaire Plan',title:'Unbegrenzte Multi-Akten',sub:'Portal \u00b7 API \u00b7 SLA \u00b7 Migration',stats:[['23+','Akten pro Kanzlei'],['99.9%','SLA Uptime'],['REST','API + Webhooks'],['\u20ac0','Migration']]},
    it:{ey:'Was wir bieten',h:'Für Finanzfachleute konzipiert',list:[['01','Zentralisiertes Multi-Kunden-Portal','Verwalten Sie alle Dossiers von einem Dashboard. Granulare Zugriffsrechte.'],['02','Automatische ONSS- & Belcotax-Mandate','Konforme Mahis/CSAM-Vereinbarungen. Aktive Mandatsverfolgung pro Kunde.'],['03','REST API + HMAC Webhooks','Integrieren Sie Aureus in Ihr ERP. Gesicherte Webhooks Lohn/DmfA/Dimona.'],['04','Migration von Ihren Anbietern','Multi-Format-CSV-Parser SD Worx, Partena, Securex, Sodexo.'],['05','6 Buchhaltungsexportformate','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV.'],['06','SLA 99,9% + Account Manager','Antwort < 2 Arbeitsstunden. Dedizierter Slack-Kanal. Fester Kundenbetreuer.']]},
    mig:{ey:'Migration',h:'SD Worx oder Partena risikofrei verlassen.',steps:[['📥','Datenexport','CSV von Ihrem aktuellen Anbieter'],['🔄','Automatischer Import','Aureus-Parser — keine Neueingabe'],['✅','Kreuzvalidierung','Berechnungsvergleich vor Go-live'],['🚀','Go-live in 7 Tagen','Dossiers ab dem ersten Zyklus operationell']]},
    cta:{h:'Schlie\u00dfen Sie sich den Kanzleien an, die Unabh\u00e4ngigkeit gew\u00e4hlt haben.',sub:'Begleitete Migration \u00b7 SLA 99.9% \u00b7 Erster Monat gratis',btn:'Fiduziaire Demo \u2192'}},
  form:{ey:'Schulungen',bc:'Schulungen',h:'Das belgische Sozialrecht\nmeistern.\nIn Ihrem Tempo.',sub:'Webinare, Praxisleitf\u00e4den und Tutorials zur belgischen Lohnberechnung, ONSS, Dimona und Belcotax.',c1:'Programm ansehen',c2:'Kontakt aufnehmen',
    card:{label:'Aureus Schulungen',title:'Von Experten lernen',sub:'Inhalte aus echten Praxisf\u00e4llen.',stats:[['6','Module'],['100%','Belgisches Recht 2026'],['CPD','IEC-Stunden'],['FR/NL','Sprachen']]},
    mods:{ey:'Themen',h:'Unsere 6 Schulungsmodule',items:[{ico:'⚖️',t:'Belgisches Sozialrecht',d:'Gesetz vom 27/06/1969, ONSS, Arbeitgeberpflichten, paritätische Kommissionen.',f:false},{ico:'🧮',t:'Erweiterte Gehaltsberechnung',d:'Brutto → Netto: ONSS 13,07%, LSt Anlage III, Beschäftigungsbonus. Praktische Übungen.',f:true},{ico:'📋',t:'DmfA & Belcotax',d:'ONSS-Erklärungen, Formulare 281.10/20/30, Fristen, Korrekturen.',f:false},{ico:'🚀',t:'Aureus Pro Onboarding',d:'Konfiguration, erster Gehaltszettel, erste Dimona — in 2 Stunden.',f:false},{ico:'🏛',t:'DSGVO & HR-Sicherheit',d:'Art. 28 und 32, Register Art. 30, AVV, NISS/IBAN-Verschlüsselung.',f:false},{ico:'📊',t:'Kontinuierliche Gesetzgebungsüberwachung',d:'Automatische Warnungen, wenn ein belgisches Gesetz Ihre Pflichten beeinflusst.',f:false}]},
    arts:{ey:'Inspiration',h:'Immer bereit f\u00fcr die Zukunft',items:[
      {ico:'\u2696\uFE0F',tag:'Droit social',t:'Erster Mitarbeiter: die 5 Fehler, die man vermeiden sollte',d:'Sp\u00e4te Anmeldung, vergessene Dimona, falsche PK \u2014 die h\u00e4ufigsten Fallen.',slug:'5-erreurs-premier-employe'},
      {ico:'\u{1F4BC}',tag:'Entrepreneuriat',t:'Selbst\u00e4ndig oder Gesellschaft: welcher Status 2026?',d:'Beitr\u00e4ge, Steuern, Sozialschutz \u2014 vollst\u00e4ndiger Vergleich.',slug:'independant-ou-societe-2026'},
      {ico:'\u{1F3E5}',tag:'Sant\u00e9',t:'Fehlzeiten: gesetzliche Pflichten des Arbeitgebers',d:'Garantiertes Gehalt, \u00e4rztliches Attest, \u00e4rztliche Kontrolle.',slug:'absenteisme-obligations'},
      {ico:'\u{1F3AF}',tag:'Motivation',t:'Alternative Verg\u00fctung: Warrants, Essensschecks, Firmenwagen',d:'Optimieren Sie Ihre Lohnpolitik mit au\u00dfergesetzlichen Leistungen.',slug:'remuneration-alternative'},
      {ico:'\u{1F510}',tag:'RGPD',t:'DSGVO & HR-Daten: was jeder Arbeitgeber wissen muss',d:'Verarbeitung NISS, IBAN, medizinische Akten \u2014 Art. 28 und 32.',slug:'rgpd-donnees-rh'},
      {ico:'\u{1F9EE}',tag:'Paie',t:'Tarife 2026: wichtigste \u00c4nderungen je PK',d:'PK 200, 226, 319 \u2014 \u00dcbersicht der neuen Lohnraster.',slug:'baremes-2026-cp'},
    ]},
    cta:{h:'Gr\u00fcnden Sie eine T\u00e4tigkeit oder m\u00f6chten Sie Ihr Unternehmen ausbauen?',sub:'Was auch immer Ihre Frage ist, Aureus gibt Ihnen klare Antworten.',btn:'Kontakt aufnehmen \u2192'}},
  con:{ey:'Kontakt',h:'Wie k\u00f6nnen wir\nIhnen helfen?',sub:'Unser Team antwortet innerhalb von 4 Arbeitsstunden. Kein Chatbot \u2014 echte Experten.',
    ch:[['\u2709\uFE0F','E-Mail','info@aureus-ia.com'],['\u{1F4BB}','Anwendung','app.aureussocial.be'],['\u{1F4CD}','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Br\u00fcssel']],
    cr:[['USt','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Antwort','< 4 Arbeitsstunden']],
    f:{t:'Demo anfordern',s:'Antwort garantiert innerhalb von 4 Arbeitsstunden.',fn:'Vorname *',ln:'Nachname *',em:'Gesch\u00e4ftliche E-Mail *',ph:'Telefonnummer',co:'Unternehmen',ro:'Sie sind *',ms:'Nachricht',fnp:'Max',lnp:'M\u00fcller',emp:'max.mueller@kanzlei.de',php:'+32 2 000 00 00',cop:'Kanzlei M\u00fcller & Partner',msp:'Beschreiben Sie Ihre Situation\u2026',sub:'Anfrage senden',note:'Mit dem Absenden stimmen Sie unserer DSGVO-Richtlinie zu.',ok:'\u2713 Nachricht gesendet \u2014 wir antworten innerhalb von 4 Arbeitsstunden.',roles:['Ausw\u00e4hlen...','Selbst\u00e4ndig / Starter','Fiduziaire / Buchhalter','Direkter Arbeitgeber','Sozialsekretariat','Makler / Partner','Andere']}},
};


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
  useEffect(()=>{ try { if(!localStorage.getItem('ck_consent')) setShow(true); } catch(e) { setShow(true); } },[]);
  const accept=()=>{ try { localStorage.setItem('ck_consent','1'); } catch(e) {} setShow(false); };
  const refuse=()=>{ try { localStorage.setItem('ck_consent','0'); } catch(e) {} setShow(false); };
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

// ── TAG LABELS TRADUITS ──
const TAG_MAP={
  fr:{Paie:'Paie',Législation:'Législation',ONSS:'ONSS',RH:'RH',RGPD:'RGPD','Droit social':'Droit social'},
  nl:{Paie:'Loon',Législation:'Wetgeving',ONSS:'ONSS',RH:'HR',RGPD:'GDPR','Droit social':'Sociaal recht'},
  en:{Paie:'Payroll',Législation:'Legislation',ONSS:'ONSS',RH:'HR',RGPD:'GDPR','Droit social':'Social law'},
  de:{Paie:'Lohn',Législation:'Gesetzgebung',ONSS:'ONSS',RH:'HR',RGPD:'DSGVO','Droit social':'Sozialrecht'},
};
function tagLabel(tag,lang){return(TAG_MAP[lang]&&TAG_MAP[lang][tag])||tag;}

function MockupDashboard({t}) {
  const db=t&&t.mockup&&t.mockup.db?t.mockup.db:{title:'Dashboard',stats:[['47.2K','Payslips','📄'],['18.6K','Declarations','📋'],['10.000+','Companies','🏢'],['99.97%','Uptime','⚡']],chart:'Payroll Q1 2026',badges:[{l:'Dimona',c:'#22C55E',v:'8 min ago'},{l:'DmfA Q1',c:'#D4A84C',v:'Ready'},{l:'Belcotax',c:'#60A5FA',v:'Due Apr 5'}]};
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
          <div><div style={{fontSize:10,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>AUREUS SOCIAL PRO</div><div style={{fontSize:14,fontWeight:600,color:'#fff'}}>{db.title}</div></div>
          <div className="mockup-badge"><span className="ldot"/> Live</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          {db.stats.map(([v,l,i])=>(
            <div key={l} className="mockup-card">
              <div style={{fontSize:16,marginBottom:6}}>{i}</div>
              <div className="mockup-stat">{v}</div>
              <div className="mockup-label">{l}</div>
            </div>
          ))}
        </div>
        <div className="mockup-card">
          <div style={{fontSize:11,color:'rgba(255,255,255,.3)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:10}}>{db.chart}</div>
          <div className="mockup-bar-chart">
            {[45,72,58,88,65,92,78,96,71,85,90,100].map((h,i)=>(
              <div key={i} className="mbc" style={{height:`${h}%`,animationDelay:`${i*0.05}s`}}/>
            ))}
          </div>
        </div>
        <div style={{marginTop:10,display:'flex',gap:6}}>
          {db.badges.map(({l,c,v})=>(
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

function RoiCalculator({t,go,lang}) {
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
              {[[roi.providers[provIdx],`${currentCost}€/${lang==='nl'?'mnd':lang==='de'?'Mo':lang==='en'?'mo':'mois'}`,'#EF4444'],['Aureus Social Pro',`${aureusCost}€/${lang==='nl'?'mnd':lang==='de'?'Mo':lang==='en'?'mo':'mois'}`,'#22C55E']].map(([l,v,c])=>(
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
                <div style={{fontSize:24,fontWeight:700,color:G2,fontFamily:"'Fraunces',serif"}}>{months} {lang==='nl'?'maanden':lang==='de'?'Monate':lang==='en'?'months':'mois'}</div>
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
            <p style={{fontSize:14,color:'rgba(255,255,255,.4)',lineHeight:1.7,marginBottom:14,maxWidth:260}}>{ft.desc}</p>
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
function PageHome({t,go,lang}) {
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
            <MockupDashboard t={t}/>
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
    <RoiCalculator t={t} go={go} lang={lang}/>

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
          {vis.map(a=>(<div key={a.title} className="tc" onClick={()=>a.slug&&go('article:'+a.slug)} style={{cursor:a.slug?'pointer':'default'}}><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{tagLabel(a.tag,lang)}</span><h4>{a.title}</h4><p>{a.desc}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}
        </div>
      </div>
    </section>

    <Newsletter t={t} go={go}/>
    <CtaBand h={t.cta.h} sub={t.cta.sub} btn={t.cta.btn} go={go}/>
    <Footer t={t} go={go}/>
  </>);
}

function AvCards({items}) {
  const [open,setOpen]=React.useState(null);
  return(<>{items.map(([ico,tt,desc,detail],i)=>(<div key={tt} className="ic-c" onClick={()=>setOpen(open===i?null:i)} style={{cursor:detail?'pointer':'default',transition:'box-shadow .2s'}}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
      <div>
        <div style={{fontSize:28,marginBottom:12}}>{ico}</div>
        <h4 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:16,fontWeight:700,color:INK,marginBottom:6}}>{tt}</h4>
        <p style={{fontSize:14,color:STONE}}>{desc}</p>
      </div>
      {detail&&<div style={{fontSize:18,color:GOLD,flexShrink:0,marginTop:4,transition:'transform .2s',transform:open===i?'rotate(180deg)':'rotate(0deg)'}}>▾</div>}
    </div>
    {detail&&open===i&&(<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${BORDER}`,fontSize:13,color:STONE,lineHeight:1.7}}>{detail}</div>)}
  </div>))}</>);
}


function PageInd({t,go,goBack}) {
  const d=t.ind;const[openFaq,setOpenFaq]=useState(null);useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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

function PageEmp({t,go,goBack}) {
  const d=t.emp;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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
      <div className="ic"><AvCards items={d.av.items}/></div>
    </div></section>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageEmps({t,go,goBack}) {
  const d=t.emps;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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

function PageExp({t,go,goBack}) {
  const d=t.exp;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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

function PageForm({t,go,goBack,lang}) {
  const d=t.form;useFadeIn();
  return(<>
    <section style={{background:CREAM,padding:'60px 0 64px',borderBottom:`1px solid ${BORDER}`}}><div className="vt-wrap"><div className="phg"><div>
      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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
      <div className="tc-grid">{d.arts.items.map(a=>(<div key={a.t} className="tc" onClick={()=>a.slug&&go('article:'+a.slug)} style={{cursor:a.slug?'pointer':'default'}}><div className="tc-img">{a.ico}</div><div className="tc-body"><span className="tc-tag">{tagLabel(a.tag,lang)}</span><h4>{a.t}</h4><p>{a.d}</p><div className="tc-cta">{t.readmore} <Arr/></div></div></div>))}</div>
    </div></section>
    <Newsletter t={t} go={go}/>
    <CtaBand h={d.cta.h} sub={d.cta.sub} btn={d.cta.btn} go={go}/><Footer t={t} go={go}/>
  </>);
}

function PageCon({t,go,goBack,lang}) {
  const d=t.con;
  const[sent,setSent]=useState(false);
  const[loading,setLoading]=useState(false);
  const[errMsg,setErrMsg]=useState('');
  const rPrenom=useRef(null),rNom=useRef(null),rEmail=useRef(null),rTel=useRef(null),rSociete=useRef(null),rRole=useRef(null),rMsg=useRef(null);
  useFadeIn();

  const handleSubmit=async()=>{
    const prenom=rPrenom.current?.value?.trim();
    const email=rEmail.current?.value?.trim();
    if(!prenom||!email){setErrMsg('Prénom et e-mail sont requis.');return;}
    setLoading(true);setErrMsg('');
    try{
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prenom,nom:rNom.current?.value,email,tel:rTel.current?.value,societe:rSociete.current?.value,role:rRole.current?.value,message:rMsg.current?.value,lang})});
      if(res.ok){setSent(true);}else{setErrMsg("Erreur lors de l'envoi. Veuillez réessayer.");}
    }catch(e){setErrMsg('Erreur réseau. Veuillez réessayer.');}
    setLoading(false);
  };

  return(<>
    <section className="vt-sec"><div className="vt-wrap">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.3fr',gap:72,alignItems:'start'}}>
        <div className="fade-in">
          <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:MIST,marginBottom:20,cursor:'pointer'}} onClick={goBack}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>{t.back||'← Retour'}</div>
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
              <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:6}}><label style={{fontSize:13,fontWeight:600,color:INK}}>{d.f.ph}</label><input ref={rTel} className="fi" type="tel" placeholder={d.f.php}/></div>
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

function PageArticle({t,go,goBack,slug,lang}) {
  const artMap=lang==='nl'?T.articles_nl:lang==='en'?T.articles_en:lang==='de'?T.articles_de:T.articles;
  const art=artMap&&artMap[slug];
  useEffect(()=>{ window.scrollTo({top:0}); },[slug]);
  useFadeIn();
  if(!art) return(<div style={{padding:'120px 0',textAlign:'center'}}><p>{t.artBack||'Article introuvable'}</p><button className="btn-p" style={{margin:'20px auto',display:'inline-flex'}} onClick={goBack}>{t.back||'← Retour'}</button></div>);
  return(<>
    <section style={{background:CREAM,padding:'60px 0 48px',borderBottom:`1px solid ${BORDER}`}}>
      <div className="vt-wrap">
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:MIST,marginBottom:24,cursor:'pointer'}} onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {t.artBack||'Retour'}
        </div>
        <div style={{display:'flex',gap:10,marginBottom:16}}>
          <span className="vt-tag vt-tag-au">{art.tag}</span>
          <span style={{fontSize:13,color:MIST}}>{art.date} · {art.readTime}{t.artRead||' de lecture'}</span>
        </div>
        <h1 style={{maxWidth:760,marginBottom:20}}>{art.title}</h1>
        <p style={{fontSize:18,color:STONE,maxWidth:680,lineHeight:1.75,fontWeight:300}}>{art.intro}</p>
      </div>
    </section>
    <section style={{padding:'56px 0 80px'}}>
      <div className="vt-wrap">
        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:64,alignItems:'start'}}>
          <div>
            {art.sections.map((sec,i)=>(
              <div key={i} className="fade-in" style={{marginBottom:48}}>
                <h2 style={{fontSize:'clamp(22px,2.4vw,28px)',marginBottom:16}}>{sec.h}</h2>
                {sec.p.split('\n\n').map((para,j)=>(
                  <p key={j} style={{fontSize:16,lineHeight:1.85,color:STONE,marginBottom:16}}>{para}</p>
                ))}
              </div>
            ))}
            <div style={{marginTop:48,padding:'32px',background:CREAM,border:`2px solid ${G}`,borderRadius:12}} className="fade-in">
              <h3 style={{marginBottom:8,fontSize:22}}>{art.cta.title}</h3>
              <p style={{marginBottom:20,fontSize:15}}>{art.cta.sub}</p>
              <button className="btn-gold" onClick={()=>go('contact')}>{art.cta.btn} <Arr/></button>
            </div>
          </div>
          <div style={{position:'sticky',top:120}}>
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:24,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:MIST,marginBottom:14}}>{t.artToc||'Dans cet article'}</div>
              {art.sections.map((sec,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:i<art.sections.length-1?`1px solid ${BORDER}`:'none'}}>
                  <span style={{color:G,fontWeight:700,fontSize:13,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize:13,color:STONE,lineHeight:1.5}}>{sec.h}</span>
                </div>
              ))}
            </div>
            <div style={{background:INK,borderRadius:10,padding:24,color:WHITE}}>
              <div style={{fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:G2,marginBottom:12}}>Aureus Social Pro</div>
              <p style={{fontSize:13,color:'rgba(255,255,255,.6)',marginBottom:16,lineHeight:1.6}}>{t.autoManaged||'Tous ces sujets sont gérés automatiquement dans Aureus Social Pro.'}</p>
              <button className="btn-gold" style={{width:'100%',justifyContent:'center',fontSize:13}} onClick={()=>go('contact')}>{t.nav.demo} <Arr/></button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer t={t} go={go}/>
  </>);
}

const PAGES={home:PageHome,independant:PageInd,employeur:PageEmp,employeurs:PageEmps,experts:PageExp,formations:PageForm,contact:PageCon};

export default function VitrinePage() {
  const[page,setPage]=useState('home');
  const[history,setHistory]=useState(['home']);
  const[lang,setLang]=useState('fr');
  const[openMega,setOpenMega]=useState(null);
  const[scrolled,setScrolled]=useState(false);
  const[showSticky,setShowSticky]=useState(false);
  const navRef=useRef(null);
  const t=T[lang]||T.fr;

  const go=(p)=>{
    if(p==='app'){window.location.href='/login';return;}
    setHistory(h=>[...h,p]);
    setPage(p);setOpenMega(null);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const goBack=()=>{
    setHistory(h=>{
      if(h.length<=1) return h;
      const prev=h[h.length-2];
      setPage(prev);
      setOpenMega(null);
      window.scrollTo({top:0,behavior:'smooth'});
      return h.slice(0,-1);
    });
  };
  const articleSlug=page.startsWith('article:')?page.slice(8):null;

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
        {articleSlug
          ? <PageArticle t={t} go={go} goBack={goBack} slug={articleSlug} lang={lang}/>
          : <PageComp t={t} go={go} goBack={goBack} lang={lang}/>
        }
      </div>

      <StickyCTA t={t} go={go} show={showSticky&&page==='home'}/>
      <CookieBanner t={t}/>
    </div>
  );
}
