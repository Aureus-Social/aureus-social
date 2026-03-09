'use client';
import { useState, useEffect, useRef } from 'react';

const G='#c6a34e', G2='#e8c97a', G3='#8a6f2e', BG='#07060a', W='#f0ede8', W2='#9a9690';

/* ── TRADUCTIONS ─────────────────────────────────────────────── */
const LANGS = {
  fr: {
    code: 'FR', name: 'Français',
    badge: 'VERSION 18 — LIVE EN PRODUCTION',
    heroBy: 'Nourdin Moussati · Aureus IA SPRL',
    heroH1: "L'administration sociale,\ngérée avec",
    heroWords: ['précision','conformité','efficacité','confiance'],
    heroSub: "Consultant indépendant en gestion sociale & paie belge. Moteur de paie conforme SPF, déclarations ONSS automatiques, portails multi-tenant, sécurité de niveau bancaire.",
    heroCTA: 'Accéder à la plateforme →',
    heroContact: 'Me contacter',
    statsL: ['Commissions paritaires','Modules déployés','Uptime plateforme','Essai gratuit'],
    liveL: ['COMMISSIONS PARITAIRES','MODULES DÉPLOYÉS','UPTIME PLATEFORME','ESSAI GRATUIT'],
    liveStatus: 'LIVE — Plateforme opérationnelle',
    navItems: [['Services','#services'],['Fonctionnalités','#fonctionnalites'],['À propos','#propos']],
    navConnect: 'Connexion',
    svcTitle: 'Ce que je fais pour vous.',
    svcLabel: 'Services',
    svcItems: [
      { num:'01', title:'Secrétariat Social Digital', sub:'Gestion complète de votre paie belge', desc:"Dimona, DmfA, Belcotax, fiches de paie — chaque obligation sociale traitée avec précision pour vos travailleurs.", tags:['Dimona IN/OUT','Belcotax 281.10','DmfA trimestriel','229 CP'] },
      { num:'02', title:'Consultance RH & Sociale', sub:'Expertise en droit social belge', desc:"Contrats CDD/CDI, procédures de licenciement, calcul des préavis, optimisation de la rémunération nette.", tags:['CP 200','Préavis Claeys','CCT sectorielles','RGPD social'] },
      { num:'03', title:'Optimisation Fiscale Salariale', sub:'Maximiser le net sans augmenter le coût', desc:"Chèques-repas, éco-chèques, voiture de société, plan cafétéria — je maximise le pouvoir d'achat de vos équipes.", tags:['Plan cafétéria','ATN voiture','Bonus CCT 90','Flexijobs'] },
      { num:'04', title:'Support Fiduciaires', sub:'Partenaire technique pour experts-comptables', desc:"Migration depuis SD Worx / Partena / Securex, intégration export WinBooks, BOB, Octopus.", tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
    ],
    modLabel: 'Fonctionnalités',
    modTitle: '106 modules,',
    modItalic: 'zéro compromis',
    modSub: '106 modules déployés en production, couvrant l\'intégralité du cycle de paie belge.',
    aperçuLabel: 'Aperçu',
    aperçuTitle: "Découvrez l'",
    aperçuItalic: 'interface',
    aperçuSub: 'Un aperçu de la plateforme en temps réel.',
    dashTitle: 'Dashboard — Février 2026',
    dashCols: ['EMPLOYÉ','CP','BRUT','NET','STATUS'],
    dashStatus: ['Calculé','Calculé','En attente','Calculé'],
    compLabel: 'Comparaison',
    compTitle: 'Pourquoi pas les',
    compItalic: 'autres',
    compSub: 'Comparaison objective avec les solutions traditionnelles du marché belge.',
    compCols: ['','Aureus Social Pro','Grand SS traditionnel','SS régional'],
    compRows: [
      ['Tarif mensuel (10 ETP)','À consulter','€ 800-1 200','€ 600-900'],
      ['Interface moderne (React/Next.js)','✓','✗','✗'],
      ['API REST publique','✓','✗','✗'],
      ['Portail employé inclus','✓','Option payante','Option payante'],
      ['Signature électronique','✓','✗','✗'],
      ['PWA Mobile','✓','✗','✗'],
      ['Multi-devise & expats','✓','✓','✓'],
      ['Import concurrent (migration)','✓','✗','✗'],
      ['Webhooks temps réel','✓','✗','✗'],
      ['Déploiement continu','✓','Trimestriel','Trimestriel'],
    ],
    secLabel: 'Sécurité',
    secTitle: 'Sécurité de',
    secItalic: 'niveau bancaire',
    secSub: '4 couches de protection. RGPD Art. 32 natif.',
    portailLabel: 'Multi-tenant',
    portailTitle: 'Trois portails,',
    portailItalic: 'une plateforme',
    portailSub: 'Isolation totale des données. Chaque utilisateur accède exactement à ce dont il a besoin.',
    portails: [
      { icon:'🏢', title:'Cabinet / Fiduciaire', sub:'?portal=admin', desc:'Gestion multi-clients, tableaux de bord consolidés, facturation cabinet, mandats ONSS, exports comptables.' },
      { icon:'🏭', title:'Client Employeur', sub:'?portal=client', desc:'Dashboard, travailleurs, fiches de paie, déclarations, documents, factures.' },
      { icon:'👤', title:'Employé', sub:'?portal=employee', desc:'Fiches PDF, demandes de congé, documents personnels, informations.' },
    ],
    temoLabel: 'Témoignages',
    temoTitle: 'Ce qu\'en disent nos',
    temoItalic: 'bêta-testeurs',
    temoSub: 'Retours des premiers fiduciaires à tester la plateforme.',
    temos: [
      { stars:5, text:"L'interface est années-lumière devant ce qu'on utilisait avec notre ancien secrétariat social. Le calcul de paie est précis, les 229 CP sont là, et le portail employé fait gagner un temps fou.", name:'Sophie V.', role:'Gestionnaire de paie, Fiduciaire Bruxelles', initial:'S' },
      { stars:5, text:"La DmfA XML se génère en un clic, le précompte est conforme SPF, et les fiches de paie sont impeccables. On a migré 85 dossiers depuis notre ancien prestataire en une semaine.", name:'Nathalie C.', role:'Gestionnaire de paie senior, Cabinet comptable Liège', initial:'N' },
      { stars:5, text:"On paye 4x moins qu'avec notre ancien secrétariat social et on a plus de fonctionnalités. Le Belcotax, le SEPA, les déclarations DIMONA — tout est automatisé. Un vrai gain de temps.", name:'Karim B.', role:'Gestionnaire de paie, Secrétariat social Anvers', initial:'K' },
    ],
    tarifLabel: 'Tarifs',
    tarifTitle: 'Transparent et',
    tarifItalic: 'compétitif',
    tarifSub: 'Pas de frais cachés. Pas d\'engagement longue durée. Essai gratuit 30 jours.',
    tarifStarter: 'Starter', tarifPro: 'Pro', tarifPopulaire: 'POPULAIRE',
    tarifConsulter: 'À consulter',
    tarifStarterSub: 'Tarif adapté à votre entreprise',
    tarifProSub: 'Tout inclus — sur mesure',
    tarifStarterFeats: ['Calcul de paie complet','DmfA + Belcotax XML','Portail employé','Fiches de paie PDF','GED documents','Support email'],
    tarifProFeats: ['Tout Starter inclus','DIMONA + SEPA automatiques','Signature électronique','API REST + Webhooks','Reporting avancé','Multi-devise & expats','Import concurrent','Support prioritaire'],
    tarifBtnStarter: 'Commencer',
    tarifBtnPro: 'Essai gratuit 30j',
    roiLabel: 'Calculateur ROI',
    roiTitle: 'Combien',
    roiItalic: 'économisez-vous',
    roiSub: 'Comparez votre coût actuel avec Aureus Social Pro en quelques clics.',
    roiETP: 'Nombre de travailleurs (ETP)',
    roiProvider: 'Votre prestataire actuel',
    roiModules: 'Modules supplémentaires ?',
    roiMods: [['portail','Portail employé'],['signature','Signature électronique'],['api','API / Intégration ERP']],
    roiCurrent: 'COÛT ACTUEL ESTIMÉ',
    roiWith: 'AVEC AUREUS SOCIAL PRO',
    roiEco: 'ÉCONOMIE POTENTIELLE',
    roiContact: 'Contactez-nous',
    roiContactSub: 'pour un devis personnalisé gratuit',
    roiBtnDevis: 'Obtenir mon devis gratuit →',
    migLabel: 'Migration',
    migTitle: 'Migrez en',
    migItalic: '7 jours',
    migSuffix: ', pas 7 mois',
    migSub: 'Un processus clair, accompagné, sans interruption de votre activité.',
    migSteps: [
      { n:1, period:'JOUR 1-2', title:'Import & Analyse', desc:'Export CSV depuis votre prestataire actuel. Notre parseur détecte automatiquement le format et importe travailleurs, contrats, historiques de paie, soldes de congés.', tags:['📥 Import CSV','📊 Analyse auto','✅ Validation NISS'] },
      { n:2, period:'JOUR 3-5', title:'Vérification & Paramétrage', desc:'Vérification croisée de toutes les données importées : commissions paritaires, barèmes, taux ONSS sectoriels. Configuration des portails client et employé. Formation de votre équipe (2h).', tags:['🔍 Audit données','⚙️ Config CP','🎓 Formation 2h'] },
      { n:3, period:'JOUR 5-6', title:'Paie Parallèle', desc:'Calcul de paie en parallèle avec votre ancien système. Comparaison fiche par fiche : brut, ONSS, précompte, net. Écart 0€ = migration validée.', tags:['🗓️ Calcul parallèle','📊 Comparaison','✅ Écart 0€'] },
      { n:'✓', period:'JOUR 7', title:'Go Live !', desc:"Basculement définitif. Génération des premières fiches de paie officielles. Activation DIMONA, DmfA, SEPA. Vos employés reçoivent l'accès au portail. Support prioritaire pendant 30 jours.", tags:['🚀 Production','📡 DIMONA active',"🎉 C'est parti !"] },
    ],
    migBtn: 'Commencer la migration',
    resLabel: 'Ressources',
    resTitle: 'Expertise',
    resItalic: 'paie belge',
    resSub: 'Guides pratiques et analyses pour les gestionnaires de paie en Belgique.',
    resItems: [
      { cat:'ERREURS & CONFORMITÉ', title:'Les 10 erreurs de paie les plus coûteuses en Belgique', desc:"Commission paritaire incorrecte, précompte mal calculé, DIMONA oubliée… Découvrez les erreurs qui coûtent des milliers d'euros aux fiduciaires.", time:'8 min', date:'Février 2026' },
      { cat:'COMPARATIF', title:'Secrétariat social traditionnel vs Aureus Social Pro : comparatif 2026', desc:'Tarifs, fonctionnalités, technologie, support. Analyse objective point par point de deux approches radicalement différentes.', time:'12 min', date:'Février 2026' },
      { cat:'GUIDE TECHNIQUE', title:'Précompte professionnel 2026 : le guide complet pour gestionnaires', desc:'Tranches progressives, quotient conjugal, réductions enfants, bonus emploi fiscal. Tout ce qui change en 2026 et comment le calculer.', time:'15 min', date:'Janvier 2026' },
      { cat:'GUIDE MIGRATION', title:'Comment migrer de votre secrétariat social en 7 jours', desc:'Guide pas-à-pas pour quitter votre secrétariat social traditionnel sans perdre une seule donnée et sans interruption de paie.', time:'10 min', date:'Février 2026' },
    ],
    faqLabel: 'FAQ',
    faqTitle: 'Questions',
    faqItalic: 'fréquentes',
    faqSub: 'Tout ce que vous devez savoir avant de commencer.',
    faqs: [
      { q:"Est-ce conforme à la législation belge ?", a:"Oui. La plateforme intègre nativement les 229 commissions paritaires, les barèmes sectoriels 2024-2026, et se conforme aux schémas XML ONSS pour Dimona et DmfA. Le calcul du précompte professionnel suit l'Annexe III AR. Mises à jour légales automatiques." },
      { q:"Comment migrer depuis un secrétariat social traditionnel ?", a:"Notre parseur CSV multi-format importe automatiquement vos données depuis SD Worx, Partena, Securex ou tout autre prestataire. Le processus prend 7 jours : import → vérification → go live. Support dédié inclus." },
      { q:"Les données sont-elles sécurisées ?", a:"Oui. Chiffrement AES-256-GCM pour NISS et IBAN, Row Level Security Supabase, HSTS + CSP Headers, anti-brute force, détection géo-intrusion, OWASP ZAP CI/CD. RGPD Art. 32 natif." },
      { q:"Puis-je tester gratuitement ?", a:"Oui. Essai gratuit 30 jours, sans carte de crédit, sans engagement. Accès complet à toutes les fonctionnalités Pro. Contactez-nous à info@aureus-ia.com pour démarrer." },
      { q:"Y a-t-il une API pour mon ERP / logiciel comptable ?", a:"Oui. API REST v1 avec 4 endpoints documentés. Webhooks HMAC-SHA256 pour intégrations en temps réel. Compatible BOB, WinBooks, Exact Online, Octopus, Horus." },
      { q:"L'application fonctionne-t-elle sur mobile ?", a:"Oui. PWA (Progressive Web App) installable sur iOS et Android. Push notifications, mode offline pour consultation des fiches. Interface responsive optimisée pour tous les écrans." },
    ],
    aboutLabel: 'À propos',
    aboutTitle: 'Une expertise de terrain,',
    aboutItalic: 'une plateforme sur mesure.',
    aboutP1: "J'ai fondé Aureus IA SPRL pour proposer une alternative sérieuse aux grands secrétariats sociaux belges. Moins de frais généraux, plus de réactivité, maîtrise totale du droit social belge.",
    aboutP2: "La plateforme Aureus Social Pro intègre nativement les 229 commissions paritaires, les dernières CCT et se connecte directement à l'ONSS via Mahis.",
    aboutStats: [{v:'229',l:'Commissions paritaires'},{v:'106',l:'Modules déployés'},{v:'99.97%',l:'Uptime production'}],
    expLabel: "Domaines d'expertise",
    expertise: ['Droit social belge (CP 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finances','Calcul préavis & C4','Régularisation précompte','Plans cafétéria & ATN','Activa.brussels & primes emploi','RGPD & sécurité des données'],

    veilleLabel: 'Veille',
    veilleTitle: 'Restez à la pointe de la',
    veilleItalic: 'législation belge',
    veilleSub: 'Lois votées, grèves en cours, nouvelles CCT, ce que font les 23 secrétariats sociaux agréés — tout en un seul endroit.',
    veilleSources: [
      { icon:'🏛️', cat:'LÉGISLATION', title:'Moniteur belge', desc:'Toutes les lois et arrêtés royaux publiés. Le texte officiel fait foi.', url:'https://www.ejustice.just.fgov.be/cgi/welcome.pl', tag:'Officiel' },
      { icon:'⚖️', cat:'DROIT SOCIAL', title:'SPF Emploi, Travail et Concertation sociale', desc:'CCT nationales, règlements de travail, législation sur le temps de travail, licenciement.', url:'https://emploi.belgique.be', tag:'SPF' },
      { icon:'💰', cat:'ONSS & COTISATIONS', title:'Portail ONSS — Instructions administratives', desc:'Instructions annuelles sur les cotisations, les réductions, les nouvelles règles DmfA et Dimona.', url:'https://www.onss.be/instructions-administratives', tag:'ONSS' },
      { icon:'📊', cat:'FISCALITÉ SALARIALE', title:'SPF Finances — Précompte professionnel', desc:'Barèmes précompte, circulaires fiscales, FAQ employeurs. Mise à jour chaque 1er janvier.', url:'https://finances.belgium.be/fr/entreprises/personnel_et_frais_de_personnel/precompte_professionnel', tag:'SPF Finances' },
      { icon:'🤝', cat:'GRÈVES & CONCERTATION', title:'Conseil National du Travail', desc:'Avis CNT, CCT interprofessionnelles, accords de secteur. Veille sur les actions syndicales en cours.', url:'https://www.cnt-nar.be', tag:'CNT' },
      { icon:'🏢', cat:'SECTEURS', title:'Portail des commissions paritaires', desc:'229 commissions paritaires, CCT sectorielles, barèmes par secteur. Recherche par CP ou NACE.', url:'https://www.emploi.belgique.be/fr/themes/relations-au-travail/commissions-paritaires', tag:'CP 100–375' },
      { icon:'🔍', cat:'23 SS AGRÉÉS', title:'Fédération des secrétariats sociaux agréés', desc:'Ce que font SD Worx, Partena, Securex, Acerta et les 19 autres agréés. Leurs nouvelles, tarifs publiés, fonctionnalités annoncées.', url:'https://www.spf-emploi.be', tag:'Concurrence' },
      { icon:'📰', cat:'ACTUALITÉ RH', title:'HR Square & Références', desc:"Journal quotidien de l'actualité RH belge. Jurisprudence sociale, accords sectoriels, tendances.", url:'https://www.hrsquare.be', tag:'Presse RH' },
    ],
    veilleAgrees: 'Les 23 secrétariats sociaux agréés',
    veilleAgreesDesc: 'Surveillez leurs mouvements : nouvelles offres, hausses tarifaires, fusions. Votre avantage concurrentiel se construit sur cette connaissance.',
    veilleBtn: 'Accéder à la plateforme →',
    revLabel: 'Prêt à commencer ?',
    revTitle: 'Rejoignez la',
    revItalic: 'révolution',
    revSuffix: 'de la paie belge',
    revSub: 'Dites adieu aux logiciels obsolètes. Aureus Social Pro modernise votre secrétariat social pour une fraction du prix.',
    revBtnCreate: 'Créer un compte gratuit',
    revBtnContact: 'Nous contacter',
    footerDesc: 'Secrétariat social digital belge de nouvelle génération. 106 modules, 229 CP, sécurité bancaire.',
    footerCols: [
      { title:'Produit', items:['Fonctionnalités','Tarifs','Migration','Sécurité','API'] },
      { title:'Ressources', items:['Guides paie belge','FAQ','Documentation','Statut plateforme'] },
      { title:'Légal', items:['Contact','Trust Center','Confidentialité','CGU'] },
    ],
    footerConnect: 'Se connecter →',
    copyright: 'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Bruxelles',
  },
};

/* NL */
LANGS.nl = {
  ...LANGS.fr,
  code:'NL', name:'Nederlands',
  badge:'VERSIE 18 — LIVE IN PRODUCTIE',
  heroBy:'Nourdin Moussati · Aureus IA SPRL',
  heroH1:"Sociaal beheer,\nbeheerd met",
  heroWords:['precisie','conformiteit','efficiëntie','vertrouwen'],
  heroSub:"Onafhankelijk consultant in sociaal beheer & Belgische loonverwerking. SPF-conform loonadministratiesysteem, automatische ONSS-aangiften, multi-tenant portalen, bankbeveiliging.",
  heroCTA:'Toegang tot het platform →',
  heroContact:'Neem contact op',
  statsL:['Paritaire comités','Geïmplementeerde modules','Platform uptime','Gratis proefperiode'],
  liveL:['PARITAIRE COMITÉS','GEÏMPLEMENTEERDE MODULES','PLATFORM UPTIME','GRATIS PROEFPERIODE'],
  liveStatus:'LIVE — Platform operationeel',
  navItems:[['Diensten','#services'],['Functies','#fonctionnalites'],['Over ons','#propos']],
  navConnect:'Inloggen',
  svcTitle:'Wat ik voor u doe.',
  svcLabel:'Diensten',
  svcItems:[
    { num:'01', title:'Digitaal Sociaal Secretariaat', sub:'Volledig beheer van uw Belgische lonen', desc:'Dimona, DmfA, Belcotax, loonfiches — elke sociale verplichting nauwkeurig behandeld voor uw werknemers.', tags:['Dimona IN/OUT','Belcotax 281.10','DmfA kwartaal','229 PC'] },
    { num:'02', title:'HR & Sociale Consultancy', sub:'Expertise in Belgisch sociaal recht', desc:'CDD/CDI-contracten, ontslagprocedures, berekening opzegtermijnen, optimalisatie nettoloon.', tags:['PC 200','Opzegtermijn Claeys','CAO sectoraal','AVG sociaal'] },
    { num:'03', title:'Fiscale Loonoptimalisatie', sub:'Netto maximaliseren zonder hogere kosten', desc:'Maaltijdcheques, eco-cheques, bedrijfswagen, cafetariaplan — ik maximaliseer de koopkracht van uw teams.', tags:['Cafetariaplan','ATN auto','Bonus CAO 90','Flexi-jobs'] },
    { num:'04', title:'Ondersteuning Fiduciaires', sub:'Technische partner voor accountants', desc:'Migratie vanuit SD Worx / Partena / Securex, integratie export WinBooks, BOB, Octopus.', tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
  ],
  modLabel:'Functies',
  modTitle:'106 modules,',
  modItalic:'nul compromissen',
  modSub:'106 modules geïmplementeerd in productie, het volledige Belgische loonverwerkingscyclus dekkend.',
  aperçuLabel:'Overzicht',
  aperçuTitle:"Ontdek de",
  aperçuItalic:'interface',
  aperçuSub:'Een overzicht van het platform in real time.',
  dashTitle:'Dashboard — Februari 2026',
  dashCols:['WERKNEMER','PC','BRUTO','NETTO','STATUS'],
  dashStatus:['Berekend','Berekend','In afwachting','Berekend'],
  compLabel:'Vergelijking',
  compTitle:'Waarom niet de',
  compItalic:'anderen',
  compSub:'Objectieve vergelijking met de traditionele oplossingen op de Belgische markt.',
  compCols:['','Aureus Social Pro','Groot traditioneel SS','Regionaal SS'],
  compRows:[
    ['Maandtarief (10 VTE)','Op aanvraag','€ 800-1 200','€ 600-900'],
    ['Modern interface (React/Next.js)','✓','✗','✗'],
    ['Publieke REST API','✓','✗','✗'],
    ['Werknemersportaal inbegrepen','✓','Betalende optie','Betalende optie'],
    ['Elektronische handtekening','✓','✗','✗'],
    ['PWA Mobiel','✓','✗','✗'],
    ['Multi-valuta & expats','✓','✓','✓'],
    ['Concurrent import (migratie)','✓','✗','✗'],
    ['Real-time webhooks','✓','✗','✗'],
    ['Continue implementatie','✓','Kwartaal','Kwartaal'],
  ],
  secLabel:'Beveiliging',
  secTitle:'Beveiliging op',
  secItalic:'bankniveau',
  secSub:'4 beschermingslagen. AVG Art. 32 ingebouwd.',
  portailLabel:'Multi-tenant',
  portailTitle:'Drie portalen,',
  portailItalic:'één platform',
  portailSub:'Volledige data-isolatie. Elke gebruiker krijgt toegang tot precies wat hij nodig heeft.',
  portails:[
    { icon:'🏢', title:'Kantoor / Fiduciaire', sub:'?portal=admin', desc:'Multi-klantbeheer, geconsolideerde dashboards, kantoorfacturatie, ONSS-mandaten, boekhoudkundige exports.' },
    { icon:'🏭', title:'Werkgever', sub:'?portal=client', desc:'Dashboard, werknemers, loonfiches, aangiften, documenten, facturen.' },
    { icon:'👤', title:'Werknemer', sub:'?portal=employee', desc:'PDF-fiches, verlofaanvragen, persoonlijke documenten, informatie.' },
  ],
  temoLabel:'Getuigenissen',
  temoTitle:'Wat onze',
  temoItalic:'bèta-testers zeggen',
  temoSub:'Feedback van de eerste fiduciaires die het platform hebben getest.',
  temos:[
    { stars:5, text:"De interface is lichtjaren vooruit op wat we gebruikten met ons vorige sociaal secretariaat. De loonberekening is nauwkeurig, de 229 PC zijn aanwezig, en het werknemersportaal bespaart enorm veel tijd.", name:'Sophie V.', role:'Loonbeheerder, Fiduciaire Brussel', initial:'S' },
    { stars:5, text:"De DmfA XML wordt in één klik gegenereerd, de bedrijfsvoorheffing is SPF-conform, en de loonfiches zijn vlekkeloos. We hebben 85 dossiers gemigreerd in één week.", name:'Nathalie C.', role:'Senior loonbeheerder, Boekhoudkantoor Luik', initial:'N' },
    { stars:5, text:"We betalen 4x minder dan bij ons vorig sociaal secretariaat en hebben meer functies. Belcotax, SEPA, DIMONA-aangiften — alles is geautomatiseerd. Echte tijdsbesparing.", name:'Karim B.', role:'Loonbeheerder, Sociaal secretariaat Antwerpen', initial:'K' },
  ],
  tarifLabel:'Tarieven',
  tarifTitle:'Transparant en',
  tarifItalic:'competitief',
  tarifSub:'Geen verborgen kosten. Geen langetermijnverbintenis. Gratis proefperiode van 30 dagen.',
  tarifStarter:'Starter', tarifPro:'Pro', tarifPopulaire:'POPULAIR',
  tarifConsulter:'Op aanvraag',
  tarifStarterSub:'Tarief aangepast aan uw bedrijf',
  tarifProSub:'Alles inbegrepen — op maat',
  tarifStarterFeats:['Volledige loonberekening','DmfA + Belcotax XML','Werknemersportaal','PDF-loonfiches','GED documenten','E-mailondersteuning'],
  tarifProFeats:['Alles van Starter inbegrepen','DIMONA + SEPA automatisch','Elektronische handtekening','REST API + Webhooks','Geavanceerde rapportage','Multi-valuta & expats','Concurrent import','Prioriteitsondersteuning'],
  tarifBtnStarter:'Beginnen',
  tarifBtnPro:'Gratis proef 30d',
  roiLabel:'ROI-calculator',
  roiTitle:'Hoeveel',
  roiItalic:'bespaart u',
  roiSub:'Vergelijk uw huidige kosten met Aureus Social Pro in enkele klikken.',
  roiETP:'Aantal werknemers (VTE)',
  roiProvider:'Uw huidige dienstverlener',
  roiModules:'Extra modules?',
  roiMods:[['portail','Werknemersportaal'],['signature','Elektronische handtekening'],['api','API / ERP-integratie']],
  roiCurrent:'GESCHATTE HUIDIGE KOST',
  roiWith:'MET AUREUS SOCIAL PRO',
  roiEco:'POTENTIËLE BESPARING',
  roiContact:'Neem contact op',
  roiContactSub:'voor een gratis offerte op maat',
  roiBtnDevis:'Mijn gratis offerte ontvangen →',
  migLabel:'Migratie',
  migTitle:'Migreer in',
  migItalic:'7 dagen',
  migSuffix:' geen 7 maanden',
  migSub:'Een duidelijk, begeleid proces, zonder onderbreking van uw activiteit.',
  migSteps:[
    { n:1, period:'DAG 1-2', title:'Import & Analyse', desc:'CSV-export vanuit uw huidige dienstverlener. Onze parser detecteert automatisch het formaat en importeert werknemers, contracten, loonhistorieken, verlofsaldo\'s.', tags:['📥 CSV Import','📊 Auto-analyse','✅ NISS-validatie'] },
    { n:2, period:'DAG 3-5', title:'Verificatie & Configuratie', desc:'Kruiscontrole van alle geïmporteerde data: paritaire comités, barema\'s, ONSS-tarieven. Configuratie van client- en werknemersportalen. Training van uw team (2u).', tags:['🔍 Data-audit','⚙️ PC-config','🎓 Training 2u'] },
    { n:3, period:'DAG 5-6', title:'Parallelle Loonadministratie', desc:'Loonberekening parallel met uw oud systeem. Vergelijking fiche per fiche: bruto, ONSS, bedrijfsvoorheffing, netto. Verschil 0€ = migratie gevalideerd.', tags:['🗓️ Parallelle berekening','📊 Vergelijking','✅ Verschil 0€'] },
    { n:'✓', period:'DAG 7', title:'Go Live!', desc:'Definitieve overschakeling. Generatie van de eerste officiële loonfiches. Activatie DIMONA, DmfA, SEPA. Uw werknemers krijgen toegang tot het portaal. Prioriteitsondersteuning gedurende 30 dagen.', tags:['🚀 Productie','📡 DIMONA actief','🎉 We zijn er!'] },
  ],
  migBtn:'Migratie starten',
  resLabel:'Resources',
  resTitle:'Expertise',
  resItalic:'Belgische lonen',
  resSub:'Praktische gidsen en analyses voor loonbeheerders in België.',
  resItems:[
    { cat:'FOUTEN & CONFORMITEIT', title:'De 10 duurste loonfouten in België', desc:'Verkeerd paritair comité, slecht berekende bedrijfsvoorheffing, vergeten DIMONA… Ontdek de fouten die fiduciaires duizenden euro\'s kosten.', time:'8 min', date:'Februari 2026' },
    { cat:'VERGELIJKING', title:'Traditioneel sociaal secretariaat vs Aureus Social Pro: vergelijking 2026', desc:'Tarieven, functies, technologie, ondersteuning. Objectieve punt-voor-punt analyse van twee radicaal verschillende benaderingen.', time:'12 min', date:'Februari 2026' },
    { cat:'TECHNISCHE GIDS', title:'Bedrijfsvoorheffing 2026: de complete gids voor beheerders', desc:'Progressieve schijven, huwelijksquotiënt, kinderreducties, fiscale arbeidsbonus. Alles wat verandert in 2026 en hoe te berekenen.', time:'15 min', date:'Januari 2026' },
    { cat:'MIGRATIEGIDS', title:'Hoe migreer je van je sociaal secretariaat in 7 dagen', desc:'Stap-voor-stap gids om uw traditioneel sociaal secretariaat te verlaten zonder één gegeven te verliezen en zonder onderbreking van de loonverwerking.', time:'10 min', date:'Februari 2026' },
  ],
  faqLabel:'FAQ',
  faqTitle:'Veelgestelde',
  faqItalic:'vragen',
  faqSub:'Alles wat u moet weten voordat u begint.',
  faqs:[
    { q:'Is dit conform de Belgische wetgeving?', a:'Ja. Het platform integreert nativement de 229 paritaire comités, de sectorale barema\'s 2024-2026, en voldoet aan de ONSS XML-schema\'s voor Dimona en DmfA. De bedrijfsvoorheffing volgt Bijlage III KB. Automatische wettelijke updates.' },
    { q:'Hoe migreren vanuit een traditioneel sociaal secretariaat?', a:'Onze multi-format CSV-parser importeert automatisch uw data vanuit SD Worx, Partena, Securex of een andere dienstverlener. Het proces duurt 7 dagen: import → verificatie → go live. Toegewijde ondersteuning inbegrepen.' },
    { q:'Zijn de gegevens beveiligd?', a:'Ja. AES-256-GCM-versleuteling voor NISS en IBAN, Row Level Security Supabase, HSTS + CSP Headers, anti-brute force, geo-inbraakdetectie, OWASP ZAP CI/CD. AVG Art. 32 ingebouwd.' },
    { q:'Kan ik gratis testen?', a:'Ja. 30 dagen gratis proef, zonder creditcard, zonder verbintenis. Volledige toegang tot alle Pro-functies. Contacteer ons via info@aureus-ia.com om te starten.' },
    { q:'Is er een API voor mijn ERP / boekhoudsoftware?', a:'Ja. REST API v1 met 4 gedocumenteerde endpoints. HMAC-SHA256 Webhooks voor real-time integraties. Compatibel met BOB, WinBooks, Exact Online, Octopus, Horus.' },
    { q:'Werkt de applicatie op mobiel?', a:'Ja. PWA (Progressive Web App) installeerbaar op iOS en Android. Push-notificaties, offline modus voor consultatie van fiches. Responsive interface geoptimaliseerd voor alle schermen.' },
  ],
  aboutLabel:'Over ons',
  aboutTitle:'Expertise uit de praktijk,',
  aboutItalic:'een platform op maat.',
  aboutP1:"Ik heb Aureus IA SPRL opgericht om een serieus alternatief te bieden voor de grote Belgische sociale secretariaten. Minder overheadkosten, meer reactiviteit, volledige beheersing van het Belgisch sociaal recht.",
  aboutP2:"Het Aureus Social Pro-platform integreert nativement de 229 paritaire comités, de meest recente CAOs en verbindt rechtstreeks met de ONSS via Mahis.",
  aboutStats:[{v:'229',l:'Paritaire comités'},{v:'106',l:'Modules'},{v:'99.97%',l:'Uptime productie'}],
  expLabel:'Expertisedomeinen',
  expertise:['Belgisch sociaal recht (PC 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Financiën','Berekening opzegtermijn & C4','Regularisatie bedrijfsvoorheffing','Cafetariaplannen & ATN','Activa.brussels & werkgeversbijdragen','AVG & gegevensbeveiliging'],

    veilleLabel: 'Actueel',
    veilleTitle: 'Blijf op de hoogte van de',
    veilleItalic: 'Belgische wetgeving',
    veilleSub: "Aangenomen wetten, lopende stakingen, nieuwe CAOs, wat de 23 erkende sociale secretariaten doen — alles op één plek.",
    veilleSources: [
      { icon:'🏛️', cat:'WETGEVING', title:'Belgisch Staatsblad', desc:'Alle gepubliceerde wetten en koninklijke besluiten. De officiële tekst is bindend.', url:'https://www.ejustice.just.fgov.be/cgi/welcome.pl', tag:'Officieel' },
      { icon:'⚖️', cat:'SOCIAAL RECHT', title:'FOD Werkgelegenheid, Arbeid en Sociaal Overleg', desc:'Nationale CAO\u2019s, arbeidsreglementen, arbeidstijdwetgeving, ontslag.', url:'https://werk.belgie.be', tag:'FOD' },
      { icon:'💰', cat:'RSZ & BIJDRAGEN', title:'RSZ-portaal — Administratieve instructies', desc:'Jaarlijkse instructies over bijdragen, verminderingen, nieuwe DmfA en Dimona-regels.', url:'https://www.rsz.be/nl/administratieve-instructies', tag:'RSZ' },
      { icon:'📊', cat:'LOONBELASTING', title:'FOD Financiën — Bedrijfsvoorheffing', desc:'Schalen bedrijfsvoorheffing, fiscale circulaires, FAQ werkgevers. Update elke 1 januari.', url:'https://financien.belgium.be/nl/ondernemingen/personeel_en_personeelskosten/bedrijfsvoorheffing', tag:'FOD Financiën' },
      { icon:'🤝', cat:'STAKINGEN & OVERLEG', title:'Nationale Arbeidsraad', desc:'NAR-adviezen, intersectorale CAO\u2019s, sectorakkoorden. Opvolging van lopende vakbondsacties.', url:'https://www.cnt-nar.be/NL/', tag:'NAR' },
      { icon:'🏢', cat:'SECTOREN', title:'Portaal paritaire comités', desc:'229 paritaire comités, sectorale CAO\u2019s, barema\u2019s per sector. Zoeken op PC of NACE.', url:'https://werk.belgie.be/nl/themas/arbeidsverhoudingen/paritaire-comites', tag:'PC 100–375' },
      { icon:'🔍', cat:'23 ERKENDE SS', title:'Federatie erkende sociale secretariaten', desc:'Wat SD Worx, Partena, Securex, Acerta en de 19 andere erkende doen. Hun nieuws, gepubliceerde tarieven, aangekondigde functies.', url:'https://www.spf-emploi.be', tag:'Concurrentie' },
      { icon:'📰', cat:'HR-ACTUALITEIT', title:'HR Square & Vacature', desc:'Dagelijks Belgisch HR-nieuws. Sociale rechtspraak, sectorakkoorden, trends.', url:'https://www.hrsquare.be', tag:'HR-pers' },
    ],
    veilleAgrees: 'De 23 erkende sociale secretariaten',
    veilleAgreesDesc: "Volg hun bewegingen: nieuwe aanbiedingen, tariefverhogingen, fusies. Uw concurrentievoordeel bouwt u op deze kennis.",
    veilleBtn: 'Toegang tot het platform →',
  revLabel:'Klaar om te beginnen?',
  revTitle:'Sluit u aan bij de',
  revItalic:'revolutie',
  revSuffix:'van de Belgische loonverwerking',
  revSub:'Zeg vaarwel aan verouderde software. Aureus Social Pro moderniseert uw sociaal secretariaat voor een fractie van de prijs.',
  revBtnCreate:'Gratis account aanmaken',
  revBtnContact:'Ons contacteren',
  footerDesc:'Belgisch digitaal sociaal secretariaat van de nieuwe generatie. 106 modules, 229 PC, bankbeveiliging.',
  footerCols:[
    { title:'Product', items:['Functies','Tarieven','Migratie','Beveiliging','API'] },
    { title:'Resources', items:['Gidsen Belgische lonen','FAQ','Documentatie','Platformstatus'] },
    { title:'Juridisch', items:['Contact','Trust Center','Privacybeleid','Algemene voorwaarden'] },
  ],
  footerConnect:'Inloggen →',
  copyright:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · KBO BE 1028.230.781 — Brussel',
};

/* EN */
LANGS.en = {
  ...LANGS.fr,
  code:'EN', name:'English',
  badge:'VERSION 18 — LIVE IN PRODUCTION',
  heroBy:'Nourdin Moussati · Aureus IA SPRL',
  heroH1:"Social administration,\nmanaged with",
  heroWords:['precision','compliance','efficiency','confidence'],
  heroSub:"Independent consultant in social management & Belgian payroll. SPF-compliant payroll engine, automatic ONSS declarations, multi-tenant portals, bank-level security.",
  heroCTA:'Access the platform →',
  heroContact:'Contact me',
  statsL:['Joint committees','Deployed modules','Platform uptime','Free trial'],
  liveL:['JOINT COMMITTEES','DEPLOYED MODULES','PLATFORM UPTIME','FREE TRIAL'],
  liveStatus:'LIVE — Platform operational',
  navItems:[['Services','#services'],['Features','#fonctionnalites'],['About','#propos']],
  navConnect:'Login',
  svcTitle:'What I do for you.',
  svcLabel:'Services',
  svcItems:[
    { num:'01', title:'Digital Social Secretariat', sub:'Complete management of your Belgian payroll', desc:'Dimona, DmfA, Belcotax, payslips — every social obligation handled with precision for your workers.', tags:['Dimona IN/OUT','Belcotax 281.10','Quarterly DmfA','229 JC'] },
    { num:'02', title:'HR & Social Consultancy', sub:'Expertise in Belgian social law', desc:'CDD/CDI contracts, dismissal procedures, notice period calculations, net salary optimisation.', tags:['JC 200','Claeys notice','Sector CCAs','GDPR social'] },
    { num:'03', title:'Salary Tax Optimisation', sub:'Maximise net without increasing costs', desc:'Meal vouchers, eco-vouchers, company car, cafeteria plan — I maximise your teams\' purchasing power.', tags:['Cafeteria plan','BIK car','CCA 90 bonus','Flexi-jobs'] },
    { num:'04', title:'Fiduciary Support', sub:'Technical partner for accountants', desc:'Migration from SD Worx / Partena / Securex, export integration WinBooks, BOB, Octopus.', tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-files'] },
  ],
  modLabel:'Features',
  modTitle:'106 modules,',
  modItalic:'zero compromise',
  modSub:'106 modules deployed in production, covering the complete Belgian payroll cycle.',
  aperçuLabel:'Preview',
  aperçuTitle:"Discover the",
  aperçuItalic:'interface',
  aperçuSub:'A real-time preview of the platform.',
  dashTitle:'Dashboard — February 2026',
  dashCols:['EMPLOYEE','JC','GROSS','NET','STATUS'],
  dashStatus:['Calculated','Calculated','Pending','Calculated'],
  compLabel:'Comparison',
  compTitle:'Why not the',
  compItalic:'others',
  compSub:'Objective comparison with traditional solutions on the Belgian market.',
  compCols:['','Aureus Social Pro','Large traditional SS','Regional SS'],
  compRows:[
    ['Monthly fee (10 FTE)','On request','€ 800-1 200','€ 600-900'],
    ['Modern interface (React/Next.js)','✓','✗','✗'],
    ['Public REST API','✓','✗','✗'],
    ['Employee portal included','✓','Paid option','Paid option'],
    ['Electronic signature','✓','✗','✗'],
    ['PWA Mobile','✓','✗','✗'],
    ['Multi-currency & expats','✓','✓','✓'],
    ['Concurrent import (migration)','✓','✗','✗'],
    ['Real-time webhooks','✓','✗','✗'],
    ['Continuous deployment','✓','Quarterly','Quarterly'],
  ],
  secLabel:'Security',
  secTitle:'Bank-level',
  secItalic:'security',
  secSub:'4 layers of protection. GDPR Art. 32 native.',
  portailLabel:'Multi-tenant',
  portailTitle:'Three portals,',
  portailItalic:'one platform',
  portailSub:'Complete data isolation. Each user accesses exactly what they need.',
  portails:[
    { icon:'🏢', title:'Accounting Firm', sub:'?portal=admin', desc:'Multi-client management, consolidated dashboards, firm invoicing, ONSS mandates, accounting exports.' },
    { icon:'🏭', title:'Employer Client', sub:'?portal=client', desc:'Dashboard, workers, payslips, declarations, documents, invoices.' },
    { icon:'👤', title:'Employee', sub:'?portal=employee', desc:'PDF payslips, leave requests, personal documents, information.' },
  ],
  temoLabel:'Testimonials',
  temoTitle:'What our',
  temoItalic:'beta-testers say',
  temoSub:'Feedback from the first fiduciaries to test the platform.',
  temos:[
    { stars:5, text:"The interface is light-years ahead of what we used with our previous social secretariat. The payroll calculation is accurate, all 229 JCs are there, and the employee portal saves an enormous amount of time.", name:'Sophie V.', role:'Payroll Manager, Fiduciary Brussels', initial:'S' },
    { stars:5, text:"The DmfA XML is generated in one click, withholding tax is SPF-compliant, and payslips are flawless. We migrated 85 files from our previous provider in one week.", name:'Nathalie C.', role:'Senior Payroll Manager, Accounting Firm Liège', initial:'N' },
    { stars:5, text:"We pay 4x less than with our previous social secretariat and have more features. Belcotax, SEPA, DIMONA declarations — everything is automated. A real time-saver.", name:'Karim B.', role:'Payroll Manager, Social Secretariat Antwerp', initial:'K' },
  ],
  tarifLabel:'Pricing',
  tarifTitle:'Transparent and',
  tarifItalic:'competitive',
  tarifSub:'No hidden fees. No long-term commitment. 30-day free trial.',
  tarifStarter:'Starter', tarifPro:'Pro', tarifPopulaire:'POPULAR',
  tarifConsulter:'On request',
  tarifStarterSub:'Pricing adapted to your business',
  tarifProSub:'All inclusive — bespoke',
  tarifStarterFeats:['Complete payroll calculation','DmfA + Belcotax XML','Employee portal','PDF payslips','Document management','Email support'],
  tarifProFeats:['Everything in Starter','Automatic DIMONA + SEPA','Electronic signature','REST API + Webhooks','Advanced reporting','Multi-currency & expats','Concurrent import','Priority support'],
  tarifBtnStarter:'Get started',
  tarifBtnPro:'Free trial 30d',
  roiLabel:'ROI Calculator',
  roiTitle:'How much',
  roiItalic:'do you save',
  roiSub:'Compare your current cost with Aureus Social Pro in a few clicks.',
  roiETP:'Number of employees (FTE)',
  roiProvider:'Your current provider',
  roiModules:'Additional modules?',
  roiMods:[['portail','Employee portal'],['signature','Electronic signature'],['api','API / ERP integration']],
  roiCurrent:'ESTIMATED CURRENT COST',
  roiWith:'WITH AUREUS SOCIAL PRO',
  roiEco:'POTENTIAL SAVINGS',
  roiContact:'Contact us',
  roiContactSub:'for a free personalised quote',
  roiBtnDevis:'Get my free quote →',
  migLabel:'Migration',
  migTitle:'Migrate in',
  migItalic:'7 days',
  migSuffix:', not 7 months',
  migSub:'A clear, guided process, without interrupting your activity.',
  migSteps:[
    { n:1, period:'DAY 1-2', title:'Import & Analysis', desc:'CSV export from your current provider. Our parser automatically detects the format and imports employees, contracts, payroll history, leave balances.', tags:['📥 CSV Import','📊 Auto analysis','✅ NISS validation'] },
    { n:2, period:'DAY 3-5', title:'Verification & Setup', desc:'Cross-check of all imported data: joint committees, scales, ONSS rates. Configuration of client and employee portals. Team training (2h).', tags:['🔍 Data audit','⚙️ JC config','🎓 Training 2h'] },
    { n:3, period:'DAY 5-6', title:'Parallel Payroll', desc:'Payroll calculation in parallel with your old system. Payslip-by-payslip comparison: gross, ONSS, withholding, net. 0€ difference = migration validated.', tags:['🗓️ Parallel run','📊 Comparison','✅ 0€ difference'] },
    { n:'✓', period:'DAY 7', title:'Go Live!', desc:"Final switch. Generation of the first official payslips. DIMONA, DmfA, SEPA activation. Your employees receive portal access. Priority support for 30 days.", tags:['🚀 Production','📡 DIMONA active',"🎉 We're live!"] },
  ],
  migBtn:'Start migration',
  resLabel:'Resources',
  resTitle:'Belgian payroll',
  resItalic:'expertise',
  resSub:'Practical guides and analyses for payroll managers in Belgium.',
  resItems:[
    { cat:'ERRORS & COMPLIANCE', title:'The 10 most costly payroll errors in Belgium', desc:'Wrong joint committee, miscalculated withholding tax, forgotten DIMONA… Discover the errors costing fiduciaries thousands of euros.', time:'8 min', date:'February 2026' },
    { cat:'COMPARISON', title:'Traditional social secretariat vs Aureus Social Pro: 2026 comparison', desc:'Rates, features, technology, support. Objective point-by-point analysis of two radically different approaches.', time:'12 min', date:'February 2026' },
    { cat:'TECHNICAL GUIDE', title:'Professional withholding tax 2026: the complete guide for managers', desc:'Progressive brackets, spousal quotient, child reductions, fiscal employment bonus. Everything changing in 2026 and how to calculate it.', time:'15 min', date:'January 2026' },
    { cat:'MIGRATION GUIDE', title:'How to migrate from your social secretariat in 7 days', desc:'Step-by-step guide to leaving your traditional social secretariat without losing a single piece of data and without payroll interruption.', time:'10 min', date:'February 2026' },
  ],
  faqLabel:'FAQ',
  faqTitle:'Frequently asked',
  faqItalic:'questions',
  faqSub:'Everything you need to know before getting started.',
  faqs:[
    { q:'Is it compliant with Belgian legislation?', a:'Yes. The platform natively integrates the 229 joint committees, sector scales 2024-2026, and conforms to ONSS XML schemas for Dimona and DmfA. Professional withholding tax follows Annex III RD. Automatic legal updates.' },
    { q:'How to migrate from a traditional social secretariat?', a:'Our multi-format CSV parser automatically imports your data from SD Worx, Partena, Securex or any other provider. The process takes 7 days: import → verification → go live. Dedicated support included.' },
    { q:'Is data secure?', a:'Yes. AES-256-GCM encryption for NISS and IBAN, Supabase Row Level Security, HSTS + CSP Headers, anti-brute force, geo-intrusion detection, OWASP ZAP CI/CD. GDPR Art. 32 native.' },
    { q:'Can I test for free?', a:'Yes. 30-day free trial, no credit card, no commitment. Full access to all Pro features. Contact us at info@aureus-ia.com to get started.' },
    { q:'Is there an API for my ERP / accounting software?', a:'Yes. REST API v1 with 4 documented endpoints. HMAC-SHA256 Webhooks for real-time integrations. Compatible with BOB, WinBooks, Exact Online, Octopus, Horus.' },
    { q:'Does the application work on mobile?', a:'Yes. PWA (Progressive Web App) installable on iOS and Android. Push notifications, offline mode for payslip consultation. Responsive interface optimised for all screens.' },
  ],
  aboutLabel:'About',
  aboutTitle:'Field expertise,',
  aboutItalic:'a bespoke platform.',
  aboutP1:"I founded Aureus IA SPRL to offer a serious alternative to the large Belgian social secretariats. Lower overhead, greater responsiveness, total mastery of Belgian social law.",
  aboutP2:"The Aureus Social Pro platform natively integrates the 229 joint committees, the latest CCAs and connects directly to the ONSS via Mahis.",
  aboutStats:[{v:'229',l:'Joint committees'},{v:'106',l:'Modules'},{v:'99.97%',l:'Production uptime'}],
  expLabel:'Areas of expertise',
  expertise:['Belgian social law (JC 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finance','Notice period & C4 calculation','Withholding tax regularisation','Cafeteria plans & BIK','Activa.brussels & employment grants','GDPR & data security'],

    veilleLabel: 'Monitor',
    veilleTitle: 'Stay ahead of',
    veilleItalic: 'Belgian legislation',
    veilleSub: 'Laws passed, ongoing strikes, new CCAs, what the 23 accredited social secretariats are doing — all in one place.',
    veilleSources: [
      { icon:'🏛️', cat:'LEGISLATION', title:'Belgian Official Gazette', desc:'All published laws and royal decrees. The official text is binding.', url:'https://www.ejustice.just.fgov.be/cgi/welcome.pl', tag:'Official' },
      { icon:'⚖️', cat:'SOCIAL LAW', title:'FPS Employment, Labour and Social Dialogue', desc:'National CCAs, work regulations, working time legislation, dismissal rules.', url:'https://emploi.belgique.be/en', tag:'FPS' },
      { icon:'💰', cat:'ONSS & CONTRIBUTIONS', title:'ONSS Portal — Administrative Instructions', desc:'Annual instructions on contributions, reductions, new DmfA and Dimona rules.', url:'https://www.onss.be/instructions-administratives', tag:'ONSS' },
      { icon:'📊', cat:'PAYROLL TAX', title:'FPS Finance — Withholding Tax', desc:'Withholding tax scales, fiscal circulars, employer FAQ. Updated every 1 January.', url:'https://finances.belgium.be/en/businesses/personnel_and_personnel_expenses/professional_withholding_tax', tag:'FPS Finance' },
      { icon:'🤝', cat:'STRIKES & DIALOGUE', title:'National Labour Council', desc:'NLC opinions, inter-professional CCAs, sector agreements. Monitoring ongoing union actions.', url:'https://www.cnt-nar.be/EN/', tag:'NLC' },
      { icon:'🏢', cat:'SECTORS', title:'Joint committees portal', desc:'229 joint committees, sector CCAs, scales by sector. Search by JC or NACE code.', url:'https://www.emploi.belgique.be/en/themes/industrial-relations/joint-committees', tag:'JC 100–375' },
      { icon:'🔍', cat:'23 ACCREDITED SS', title:'Federation of accredited social secretariats', desc:'What SD Worx, Partena, Securex, Acerta and the other 19 accredited are doing. Their news, published rates, announced features.', url:'https://www.spf-emploi.be', tag:'Competition' },
      { icon:'📰', cat:'HR NEWS', title:'HR Square & References', desc:'Daily Belgian HR news. Social case law, sector agreements, trends.', url:'https://www.hrsquare.be', tag:'HR Press' },
    ],
    veilleAgrees: 'The 23 accredited social secretariats',
    veilleAgreesDesc: 'Monitor their moves: new offerings, price increases, mergers. Your competitive advantage is built on this knowledge.',
    veilleBtn: 'Access the platform →',
  revLabel:'Ready to start?',
  revTitle:'Join the',
  revItalic:'revolution',
  revSuffix:'of Belgian payroll',
  revSub:'Say goodbye to obsolete software. Aureus Social Pro modernises your social secretariat for a fraction of the price.',
  revBtnCreate:'Create a free account',
  revBtnContact:'Contact us',
  footerDesc:'Next-generation Belgian digital social secretariat. 106 modules, 229 JCs, bank-level security.',
  footerCols:[
    { title:'Product', items:['Features','Pricing','Migration','Security','API'] },
    { title:'Resources', items:['Belgian payroll guides','FAQ','Documentation','Platform status'] },
    { title:'Legal', items:['Contact','Trust Centre','Privacy Policy','Terms of Use'] },
  ],
  footerConnect:'Log in →',
  copyright:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Brussels',
};

/* DE */
LANGS.de = {
  ...LANGS.fr,
  code:'DE', name:'Deutsch',
  badge:'VERSION 18 — LIVE IN PRODUKTION',
  heroBy:'Nourdin Moussati · Aureus IA SPRL',
  heroH1:"Sozialverwaltung,\nverwaltet mit",
  heroWords:['Präzision','Konformität','Effizienz','Vertrauen'],
  heroSub:"Unabhängiger Berater für Sozialverwaltung & belgische Lohnbuchhaltung. SPF-konformes Lohnberechnungssystem, automatische ONSS-Meldungen, Multi-Tenant-Portale, Banksicherheit.",
  heroCTA:'Zugang zur Plattform →',
  heroContact:'Kontakt aufnehmen',
  statsL:['Paritätische Ausschüsse','Eingesetzte Module','Plattform-Uptime','Kostenlose Testversion'],
  liveL:['PARITÄTISCHE AUSSCHÜSSE','EINGESETZTE MODULE','PLATTFORM-UPTIME','KOSTENLOSE TESTVERSION'],
  liveStatus:'LIVE — Plattform betriebsbereit',
  navItems:[['Dienstleistungen','#services'],['Funktionen','#fonctionnalites'],['Über uns','#propos']],
  navConnect:'Anmelden',
  svcTitle:'Was ich für Sie tue.',
  svcLabel:'Dienstleistungen',
  svcItems:[
    { num:'01', title:'Digitales Sozialsekretariat', sub:'Vollständige Verwaltung Ihrer belgischen Lohnabrechnung', desc:'Dimona, DmfA, Belcotax, Lohnzettel — jede Sozialverpflichtung präzise für Ihre Arbeitnehmer bearbeitet.', tags:['Dimona IN/OUT','Belcotax 281.10','Vierteljährlich DmfA','229 PA'] },
    { num:'02', title:'HR & Sozialberatung', sub:'Expertise im belgischen Sozialrecht', desc:'CDD/CDI-Verträge, Kündigungsverfahren, Berechnung von Kündigungsfristen, Optimierung des Nettogehalts.', tags:['PA 200','Claeys-Frist','Sektor-KAV','DSGVO sozial'] },
    { num:'03', title:'Lohnsteueroptimierung', sub:'Netto maximieren ohne höhere Kosten', desc:'Essensgutscheine, Öko-Gutscheine, Firmenwagen, Cafeteriaplan — ich maximiere die Kaufkraft Ihrer Teams.', tags:['Cafeteriaplan','Geldwerter Vorteil','KAV-90-Bonus','Flexi-Jobs'] },
    { num:'04', title:'Unterstützung für Treuhänder', sub:'Technischer Partner für Buchhalter', desc:'Migration von SD Worx / Partena / Securex, Export-Integration WinBooks, BOB, Octopus.', tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-Dateien'] },
  ],
  modLabel:'Funktionen',
  modTitle:'106 Module,',
  modItalic:'null Kompromisse',
  modSub:'106 Module in der Produktion eingesetzt, die den gesamten belgischen Lohnzyklus abdecken.',
  aperçuLabel:'Vorschau',
  aperçuTitle:"Entdecken Sie die",
  aperçuItalic:'Oberfläche',
  aperçuSub:'Eine Echtzeit-Vorschau der Plattform.',
  dashTitle:'Dashboard — Februar 2026',
  dashCols:['MITARBEITER','PA','BRUTTO','NETTO','STATUS'],
  dashStatus:['Berechnet','Berechnet','Ausstehend','Berechnet'],
  compLabel:'Vergleich',
  compTitle:'Warum nicht die',
  compItalic:'anderen',
  compSub:'Objektiver Vergleich mit traditionellen Lösungen auf dem belgischen Markt.',
  compCols:['','Aureus Social Pro','Großes traditionelles SS','Regionales SS'],
  compRows:[
    ['Monatstarif (10 VZÄ)','Auf Anfrage','€ 800-1 200','€ 600-900'],
    ['Moderne Oberfläche (React/Next.js)','✓','✗','✗'],
    ['Öffentliche REST-API','✓','✗','✗'],
    ['Mitarbeiterportal inbegriffen','✓','Kostenpflichtige Option','Kostenpflichtige Option'],
    ['Elektronische Signatur','✓','✗','✗'],
    ['PWA Mobil','✓','✗','✗'],
    ['Multi-Währung & Expats','✓','✓','✓'],
    ['Gleichzeitiger Import (Migration)','✓','✗','✗'],
    ['Echtzeit-Webhooks','✓','✗','✗'],
    ['Kontinuierliches Deployment','✓','Vierteljährlich','Vierteljährlich'],
  ],
  secLabel:'Sicherheit',
  secTitle:'Sicherheit auf',
  secItalic:'Bankniveau',
  secSub:'4 Schutzschichten. DSGVO Art. 32 nativ.',
  portailLabel:'Multi-Tenant',
  portailTitle:'Drei Portale,',
  portailItalic:'eine Plattform',
  portailSub:'Vollständige Datenisolierung. Jeder Benutzer greift auf genau das zu, was er braucht.',
  portails:[
    { icon:'🏢', title:'Kanzlei / Treuhänder', sub:'?portal=admin', desc:'Multi-Kundenverwaltung, konsolidierte Dashboards, Kanzleifakturierung, ONSS-Mandate, Buchhaltungsexporte.' },
    { icon:'🏭', title:'Arbeitgeber-Kunde', sub:'?portal=client', desc:'Dashboard, Arbeitnehmer, Lohnzettel, Meldungen, Dokumente, Rechnungen.' },
    { icon:'👤', title:'Mitarbeiter', sub:'?portal=employee', desc:'PDF-Lohnzettel, Urlaubsanträge, persönliche Dokumente, Informationen.' },
  ],
  temoLabel:'Erfahrungsberichte',
  temoTitle:'Was unsere',
  temoItalic:'Beta-Tester sagen',
  temoSub:'Rückmeldungen der ersten Treuhänder, die die Plattform getestet haben.',
  temos:[
    { stars:5, text:"Die Oberfläche ist Lichtjahre dem voraus, was wir mit unserem früheren Sozialsekretariat verwendet haben. Die Lohnberechnung ist präzise, alle 229 PA sind vorhanden, und das Mitarbeiterportal spart enorm viel Zeit.", name:'Sophie V.', role:'Lohnbuchhalterin, Treuhänder Brüssel', initial:'S' },
    { stars:5, text:"Das DmfA-XML wird mit einem Klick generiert, die Lohnsteuer ist SPF-konform und die Lohnzettel sind makellos. Wir haben 85 Dateien in einer Woche von unserem früheren Anbieter migriert.", name:'Nathalie C.', role:'Senior-Lohnbuchhalterin, Buchhaltungskanzlei Lüttich', initial:'N' },
    { stars:5, text:"Wir zahlen 4x weniger als bei unserem früheren Sozialsekretariat und haben mehr Funktionen. Belcotax, SEPA, DIMONA-Meldungen — alles ist automatisiert. Eine echte Zeitersparnis.", name:'Karim B.', role:'Lohnbuchhalter, Sozialsekretariat Antwerpen', initial:'K' },
  ],
  tarifLabel:'Preise',
  tarifTitle:'Transparent und',
  tarifItalic:'wettbewerbsfähig',
  tarifSub:'Keine versteckten Kosten. Keine langfristige Bindung. 30 Tage kostenlose Testversion.',
  tarifStarter:'Starter', tarifPro:'Pro', tarifPopulaire:'BELIEBT',
  tarifConsulter:'Auf Anfrage',
  tarifStarterSub:'Preis angepasst an Ihr Unternehmen',
  tarifProSub:'Alles inklusive — maßgeschneidert',
  tarifStarterFeats:['Vollständige Lohnberechnung','DmfA + Belcotax XML','Mitarbeiterportal','PDF-Lohnzettel','Dokumentenverwaltung','E-Mail-Support'],
  tarifProFeats:['Alles von Starter inklusive','Automatisches DIMONA + SEPA','Elektronische Signatur','REST-API + Webhooks','Erweiterte Berichterstattung','Multi-Währung & Expats','Gleichzeitiger Import','Prioritätssupport'],
  tarifBtnStarter:'Beginnen',
  tarifBtnPro:'Kostenlose Testversion 30T',
  roiLabel:'ROI-Rechner',
  roiTitle:'Wie viel',
  roiItalic:'sparen Sie',
  roiSub:'Vergleichen Sie Ihre aktuellen Kosten mit Aureus Social Pro in wenigen Klicks.',
  roiETP:'Anzahl Mitarbeiter (VZÄ)',
  roiProvider:'Ihr aktueller Anbieter',
  roiModules:'Zusätzliche Module?',
  roiMods:[['portail','Mitarbeiterportal'],['signature','Elektronische Signatur'],['api','API / ERP-Integration']],
  roiCurrent:'GESCHÄTZTE AKTUELLE KOSTEN',
  roiWith:'MIT AUREUS SOCIAL PRO',
  roiEco:'POTENZIELLE EINSPARUNGEN',
  roiContact:'Kontaktieren Sie uns',
  roiContactSub:'für ein kostenloses individuelles Angebot',
  roiBtnDevis:'Mein kostenloses Angebot →',
  migLabel:'Migration',
  migTitle:'Migrieren in',
  migItalic:'7 Tagen',
  migSuffix:', nicht 7 Monaten',
  migSub:'Ein klarer, begleiteter Prozess, ohne Unterbrechung Ihrer Tätigkeit.',
  migSteps:[
    { n:1, period:'TAG 1-2', title:'Import & Analyse', desc:'CSV-Export von Ihrem aktuellen Anbieter. Unser Parser erkennt das Format automatisch und importiert Mitarbeiter, Verträge, Lohnhistorien, Urlaubsguthaben.', tags:['📥 CSV-Import','📊 Auto-Analyse','✅ NISS-Validierung'] },
    { n:2, period:'TAG 3-5', title:'Überprüfung & Konfiguration', desc:'Kreuzprüfung aller importierten Daten: paritätische Ausschüsse, Lohnskalen, ONSS-Sätze. Konfiguration der Kunden- und Mitarbeiterportale. Schulung Ihres Teams (2h).', tags:['🔍 Daten-Audit','⚙️ PA-Konfig','🎓 Schulung 2h'] },
    { n:3, period:'TAG 5-6', title:'Parallele Lohnabrechnung', desc:'Lohnberechnung parallel zu Ihrem alten System. Lohnzettel-für-Lohnzettel-Vergleich: Brutto, ONSS, Quellensteuer, Netto. Differenz 0€ = Migration validiert.', tags:['🗓️ Parallellauf','📊 Vergleich','✅ Differenz 0€'] },
    { n:'✓', period:'TAG 7', title:'Go Live!', desc:'Endgültige Umstellung. Erstellung der ersten offiziellen Lohnzettel. DIMONA-, DmfA-, SEPA-Aktivierung. Ihre Mitarbeiter erhalten Zugang zum Portal. Prioritätssupport für 30 Tage.', tags:['🚀 Produktion','📡 DIMONA aktiv','🎉 Los geht\'s!'] },
  ],
  migBtn:'Migration starten',
  resLabel:'Ressourcen',
  resTitle:'Expertise',
  resItalic:'belgische Lohnabrechnung',
  resSub:'Praktische Leitfäden und Analysen für Lohnbuchhalter in Belgien.',
  resItems:[
    { cat:'FEHLER & KONFORMITÄT', title:'Die 10 teuersten Lohnfehler in Belgien', desc:'Falscher paritätischer Ausschuss, falsch berechnete Quellensteuer, vergessene DIMONA… Entdecken Sie die Fehler, die Treuhändern tausende Euro kosten.', time:'8 Min.', date:'Februar 2026' },
    { cat:'VERGLEICH', title:'Traditionelles Sozialsekretariat vs. Aureus Social Pro: Vergleich 2026', desc:'Tarife, Funktionen, Technologie, Support. Objektive Punkt-für-Punkt-Analyse zweier radikal unterschiedlicher Ansätze.', time:'12 Min.', date:'Februar 2026' },
    { cat:'TECHNISCHER LEITFADEN', title:'Lohnsteuer 2026: der vollständige Leitfaden für Manager', desc:'Progressive Steuerklassen, Ehegattenquotient, Kinderermäßigungen, fiskaler Beschäftigungsbonus. Alles, was sich 2026 ändert und wie man es berechnet.', time:'15 Min.', date:'Januar 2026' },
    { cat:'MIGRATIONSLEITFADEN', title:'Wie man in 7 Tagen von seinem Sozialsekretariat migriert', desc:'Schritt-für-Schritt-Anleitung zum Verlassen Ihres traditionellen Sozialsekretariats ohne einen einzigen Datenverlust und ohne Lohnunterbrechung.', time:'10 Min.', date:'Februar 2026' },
  ],
  faqLabel:'FAQ',
  faqTitle:'Häufig gestellte',
  faqItalic:'Fragen',
  faqSub:'Alles, was Sie vor dem Start wissen müssen.',
  faqs:[
    { q:'Ist es konform mit der belgischen Gesetzgebung?', a:'Ja. Die Plattform integriert nativ die 229 paritätischen Ausschüsse, die sektoralen Lohnskalen 2024-2026 und entspricht den ONSS-XML-Schemata für Dimona und DmfA. Die Lohnsteuer folgt Anhang III KB. Automatische Rechtsupdates.' },
    { q:'Wie von einem traditionellen Sozialsekretariat migrieren?', a:'Unser Multi-Format-CSV-Parser importiert automatisch Ihre Daten von SD Worx, Partena, Securex oder einem anderen Anbieter. Der Prozess dauert 7 Tage: Import → Überprüfung → Go Live. Dedizierter Support inklusive.' },
    { q:'Sind die Daten sicher?', a:'Ja. AES-256-GCM-Verschlüsselung für NISS und IBAN, Supabase Row Level Security, HSTS + CSP-Header, Anti-Brute-Force, Geo-Intrusion-Erkennung, OWASP ZAP CI/CD. DSGVO Art. 32 nativ.' },
    { q:'Kann ich kostenlos testen?', a:'Ja. 30 Tage kostenlose Testversion, ohne Kreditkarte, ohne Verpflichtung. Vollständiger Zugriff auf alle Pro-Funktionen. Kontaktieren Sie uns unter info@aureus-ia.com.' },
    { q:'Gibt es eine API für mein ERP / meine Buchhaltungssoftware?', a:'Ja. REST-API v1 mit 4 dokumentierten Endpunkten. HMAC-SHA256-Webhooks für Echtzeit-Integrationen. Kompatibel mit BOB, WinBooks, Exact Online, Octopus, Horus.' },
    { q:'Funktioniert die Anwendung auf Mobilgeräten?', a:'Ja. PWA (Progressive Web App) auf iOS und Android installierbar. Push-Benachrichtigungen, Offline-Modus für Lohnzettel-Einsicht. Responsive Oberfläche für alle Bildschirme optimiert.' },
  ],
  aboutLabel:'Über uns',
  aboutTitle:'Praxisnahe Expertise,',
  aboutItalic:'eine maßgeschneiderte Plattform.',
  aboutP1:"Ich habe Aureus IA SPRL gegründet, um eine ernsthafte Alternative zu den großen belgischen Sozialsekretariaten anzubieten. Weniger Gemeinkosten, mehr Reaktivität, vollständige Beherrschung des belgischen Sozialrechts.",
  aboutP2:"Die Aureus Social Pro-Plattform integriert nativ die 229 paritätischen Ausschüsse, die aktuellen KAV und verbindet sich direkt mit der ONSS über Mahis.",
  aboutStats:[{v:'229',l:'Paritätische Ausschüsse'},{v:'106',l:'Module'},{v:'99.97%',l:'Produktions-Uptime'}],
  expLabel:'Fachgebiete',
  expertise:['Belgisches Sozialrecht (PA 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finanzen','Kündigungsfrist & C4-Berechnung','Quellensteuer-Regularisierung','Cafeteriapläne & geldwerter Vorteil','Activa.brussels & Arbeitgeberbeiträge','DSGVO & Datensicherheit'],

    veilleLabel: 'Überwachung',
    veilleTitle: 'Bleiben Sie auf dem Laufenden mit der',
    veilleItalic: 'belgischen Gesetzgebung',
    veilleSub: 'Verabschiedete Gesetze, laufende Streiks, neue KAV, was die 23 anerkannten Sozialsekretariate tun — alles an einem Ort.',
    veilleSources: [
      { icon:'🏛️', cat:'GESETZGEBUNG', title:'Belgisches Staatsblatt', desc:'Alle veröffentlichten Gesetze und Königlichen Erlass. Der offizielle Text ist bindend.', url:'https://www.ejustice.just.fgov.be/cgi/welcome.pl', tag:'Offiziell' },
      { icon:'⚖️', cat:'SOZIALRECHT', title:'FÖD Beschäftigung, Arbeit und soziale Konzertierung', desc:'Nationale KAV, Arbeitsreglemente, Arbeitszeitgesetzgebung, Kündigung.', url:'https://emploi.belgique.be', tag:'FÖD' },
      { icon:'💰', cat:'ONSS & BEITRÄGE', title:'ONSS-Portal — Verwaltungsanleitungen', desc:'Jährliche Anleitungen zu Beiträgen, Ermäßigungen, neuen DmfA- und Dimona-Regeln.', url:'https://www.onss.be/instructions-administratives', tag:'ONSS' },
      { icon:'📊', cat:'LOHNSTEUER', title:'FÖD Finanzen — Quellensteuer', desc:'Quellensteuerskalen, Steuermitteilungen, Arbeitgeber-FAQ. Aktualisierung jeweils am 1. Januar.', url:'https://finances.belgium.be', tag:'FÖD Finanzen' },
      { icon:'🤝', cat:'STREIKS & KONZERTIERUNG', title:'Nationaler Arbeitsrat', desc:'NAR-Stellungnahmen, interprofessionelle KAV, Sektorabkommen. Verfolgung laufender Gewerkschaftsaktionen.', url:'https://www.cnt-nar.be', tag:'NAR' },
      { icon:'🏢', cat:'SEKTOREN', title:'Portal der paritätischen Ausschüsse', desc:'229 paritätische Ausschüsse, Sektor-KAV, Lohnskalen pro Sektor. Suche nach PA oder NACE.', url:'https://www.emploi.belgique.be', tag:'PA 100–375' },
      { icon:'🔍', cat:'23 ANERKANNTE SS', title:'Verband anerkannter Sozialsekretariate', desc:'Was SD Worx, Partena, Securex, Acerta und die 19 anderen Anerkannten tun. Ihre Neuigkeiten, veröffentlichte Tarife, angekündigte Funktionen.', url:'https://www.spf-emploi.be', tag:'Konkurrenz' },
      { icon:'📰', cat:'HR-AKTUELL', title:'HR Square & Referenzen', desc:'Tägliche belgische HR-Nachrichten. Soziale Rechtsprechung, Sektorabkommen, Trends.', url:'https://www.hrsquare.be', tag:'HR-Presse' },
    ],
    veilleAgrees: 'Die 23 anerkannten Sozialsekretariate',
    veilleAgreesDesc: 'Überwachen Sie ihre Bewegungen: neue Angebote, Tariferhöhungen, Fusionen. Ihr Wettbewerbsvorteil basiert auf diesem Wissen.',
    veilleBtn: 'Zugang zur Plattform →',
  revLabel:'Bereit anzufangen?',
  revTitle:'Schließen Sie sich der',
  revItalic:'Revolution',
  revSuffix:'der belgischen Lohnabrechnung an',
  revSub:'Verabschieden Sie sich von veralteter Software. Aureus Social Pro modernisiert Ihr Sozialsekretariat zu einem Bruchteil des Preises.',
  revBtnCreate:'Kostenloses Konto erstellen',
  revBtnContact:'Uns kontaktieren',
  footerDesc:'Belgisches digitales Sozialsekretariat der neuen Generation. 106 Module, 229 PA, Banksicherheit.',
  footerCols:[
    { title:'Produkt', items:['Funktionen','Preise','Migration','Sicherheit','API'] },
    { title:'Ressourcen', items:['Belgische Lohnleitfäden','FAQ','Dokumentation','Plattformstatus'] },
    { title:'Rechtliches', items:['Kontakt','Trust Center','Datenschutz','AGB'] },
  ],
  footerConnect:'Anmelden →',
  copyright:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Brüssel',
};

/* ── DONNÉES FIXES ───────────────────────────────────────────── */
const STATS_VALUES = ['229','106','99.97%','30j'];
const LIVE_VALUES  = ['229','106','99.97%','30j'];

const MODULES = [
  { icon:'🧮', t:'Calcul de Paie Complet', d:'Brut→Net, ONSS 13.07%, PP 16 params, barèmes 2024-2026' },
  { icon:'📡', t:'DIMONA Électronique', d:'IN/OUT/UPDATE XML, validation, suivi statut ONSS' },
  { icon:'📋', t:'DmfA XML ONSS', d:'Trimestres Q1-Q4, réduction structurelle, bonus emploi' },
  { icon:'📊', t:'Belcotax XML', d:'Fiches 281.10/20/30 conformes SPF Finances' },
  { icon:'🏦', t:'SEPA pain.001', d:'Virements batch ISO 20022, validation IBAN' },
  { icon:'✍️', t:'Signature Électronique', d:'Yousign + DocuSign : contrats, avenants, webhook' },
  { icon:'🌍', t:'Multi-devise & Expats', d:'11 devises, détachements A1, indemnités' },
  { icon:'📱', t:'PWA Mobile', d:'Installable, push notifs, mode offline' },
  { icon:'🔗', t:'API REST & Webhooks', d:'4 endpoints v1, HMAC-SHA256, BOB/Winbooks/Horus' },
  { icon:'📧', t:'5 Emails Auto', d:'Fiche, recap, alerte, rappel, facture' },
  { icon:'📁', t:'GED Documents', d:'8 catégories, rétention légale, Storage' },
  { icon:'⚖️', t:'63 Procédures RH', d:'12 sections : embauche, licenciement, absences, pension' },
  { icon:'🧾', t:'Facturation Cabinet', d:'Factures auto par ETP ou forfait, MRR tracking' },
  { icon:'📉', t:'Précompte Professionnel', d:'Annexe III AR, 16 paramètres, taxe communale' },
  { icon:'🏖️', t:'Pécule de Vacances', d:'Employé + ouvrier, prorata, provisions, C4-Vac' },
  { icon:'⚖️', t:'Solde Tout Compte', d:'Préavis, indemnités, vacances sortie, C4' },
  { icon:'🔔', t:'Alertes Intelligentes', d:'Échéances, calendrier social, règles légales' },
  { icon:'⚙️', t:'Admin Barèmes', d:'Constantes légales modifiables sans code' },
  { icon:'📈', t:'Reporting Avancé', d:'Bilan social BNB, analytics RH, export' },
  { icon:'📥', t:'Import Concurrent', d:'Parsers CSV multi-format, import automatique' },
];

const SECURITY = [
  { icon:'🔑', t:'Chiffrement AES-256-GCM', d:'NISS et IBAN chiffrés au repos et en transit. Clés rotatives.' },
  { icon:'🛡️', t:'HSTS + CSP Headers', d:'Strict Transport Security max-age 2 ans, CSP restrictive.' },
  { icon:'🔒', t:'Row Level Security', d:'Isolation multi-tenant Supabase. Chaque client voit uniquement ses données.' },
  { icon:'🚫', t:'Anti Brute Force', d:'Rate limit 60 req/min, blocage 30 min après 5 échecs, timeout 15 min.' },
  { icon:'🌐', t:'Détection Géo-Intrusion', d:"Alerte DPO si connexion pays inhabituel. Journal complet des tentatives." },
  { icon:'📋', t:'IP Whitelist + CIDR', d:'Restriction par adresse IP et plage CIDR. Interface admin.' },
  { icon:'🔍', t:'OWASP ZAP CI/CD', d:'Scan auto à chaque deploy + scan hebdo complet. GitHub Actions.' },
];

/* ── HOOKS ───────────────────────────────────────────────────── */
const Tag = ({c}) => (
  <span style={{display:'inline-block',padding:'3px 10px',borderRadius:3,border:`1px solid ${G}30`,background:`${G}08`,fontSize:10,color:G2,letterSpacing:'.5px',fontFamily:'monospace'}}>{c}</span>
);

function useInView(t=0.1) {
  const ref=useRef(null); const [v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:t});
    if(ref.current)o.observe(ref.current); return()=>o.disconnect();
  },[]);
  return [ref,v];
}

/* ── PAGE ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [lang,setLang]=useState('fr');
  const T=LANGS[lang];
  const handleLogin=()=>{window.location.href='/';};

  const [tick,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(p=>(p+1)%4),3500);return()=>clearInterval(t);},[]);

  const [roiEtp,setRoiEtp]=useState(30);
  const [roiProv,setRoiProv]=useState('Grand SS');
  const [roiMods,setRoiMods]=useState({portail:true,signature:false,api:false});
  const rates={'Grand SS':95,'SS régional':75,'Petit SS':60,'Legacy':50};
  const currentCost=Math.round(roiEtp*rates[roiProv]*(1+(roiMods.portail?.15:0)+(roiMods.signature?.12:0)+(roiMods.api?.08:0)));

  const [faqOpen,setFaqOpen]=useState(null);

  /* refs inView */
  const [rStats,vStats]=useInView();
  const [rLive,vLive]=useInView();
  const [rSvc,vSvc]=useInView();
  const [rMod,vMod]=useInView();
  const [rDash,vDash]=useInView();
  const [rComp,vComp]=useInView();
  const [rSec,vSec]=useInView();
  const [rPort,vPort]=useInView();
  const [rTemo,vTemo]=useInView();
  const [rTarif,vTarif]=useInView();
  const [rRoi,vRoi]=useInView();
  const [rMig,vMig]=useInView();
  const [rRes,vRes]=useInView();
  const [rFaq,vFaq]=useInView();
  const [rAbout,vAbout]=useInView();
  const [rRev,vRev]=useInView();
  const [rVeille,vVeille]=useInView();

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${BG};color:${W};font-family:Georgia,'Times New Roman',serif;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.4);}}
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}
        @keyframes scrolldown{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(10px);}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:${BG};}
        ::-webkit-scrollbar-thumb{background:${G}40;border-radius:2px;}
        @media(max-width:768px){
          .grid2{grid-template-columns:1fr!important;}
          .grid4{grid-template-columns:repeat(2,1fr)!important;}
          .grid3{grid-template-columns:repeat(2,1fr)!important;}
          .svcrow{grid-template-columns:1fr!important;}
          .ftcols{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'12px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',background:`${BG}e0`,backdropFilter:'blur(16px)',borderBottom:`1px solid ${G}10`}}>
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span style={{fontSize:15,fontWeight:900,color:G,letterSpacing:'2px'}}>AUREUS</span>
          <span style={{fontSize:9,color:W2,letterSpacing:'3px',textTransform:'uppercase'}}>Social Pro</span>
        </div>
        <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
          {T.navItems.map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:10,color:W2,textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase',transition:'color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=G} onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</a>
          ))}
          {/* Sélecteur langue */}
          <div style={{display:'flex',gap:4}}>
            {['fr','nl','en','de'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:'4px 8px',borderRadius:3,border:`1px solid ${lang===l?G:`${G}25`}`,background:lang===l?`${G}20`:'transparent',color:lang===l?G:W2,fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:lang===l?800:400,letterSpacing:'1px',textTransform:'uppercase',transition:'all .2s'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={handleLogin} style={{padding:'8px 18px',borderRadius:3,border:`1px solid ${G}40`,background:`${G}10`,color:G,fontSize:10,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=BG;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.color=G;}}>
            {T.navConnect}
          </button>
        </div>
      </nav>

      <div style={{paddingTop:64}} id="fonctionnalites">

        {/* ── HERO ── */}
        <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',padding:'80px 24px 60px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 80% 60% at 50% 40%,${G}12 0%,transparent 70%)`}}/>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:36,padding:'6px 18px',borderRadius:999,border:`1px solid ${G}30`,background:`${G}08`,fontSize:10,color:G2,letterSpacing:'1.5px',textTransform:'uppercase'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'pulse 2s infinite'}}/>
            {T.badge}
          </div>
          <div style={{fontSize:11,color:W2,letterSpacing:'4px',textTransform:'uppercase',marginBottom:14}}>{T.heroBy}</div>
          <h1 style={{fontSize:'clamp(32px,6vw,70px)',fontWeight:900,lineHeight:1.05,margin:'0 0 10px',letterSpacing:'-2px',maxWidth:900,background:`linear-gradient(135deg,${W} 30%,${G} 60%,${W} 90%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',whiteSpace:'pre-line'}}>
            {T.heroH1}
          </h1>
          <div style={{fontSize:'clamp(32px,6vw,70px)',fontWeight:900,color:G,letterSpacing:'-2px',height:'1.15em',marginBottom:28,position:'relative',width:'100%',maxWidth:900}}>
            {T.heroWords.map((w,i)=>(
              <span key={w} style={{position:'absolute',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',opacity:i===tick%4?1:0,transition:'opacity .7s ease'}}>{w}.</span>
            ))}
          </div>
          <p style={{fontSize:16,color:W2,maxWidth:600,lineHeight:1.75,margin:'0 0 44px'}}>{T.heroSub}</p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center'}}>
            <button onClick={handleLogin} style={{padding:'15px 36px',borderRadius:4,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:13,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',boxShadow:`0 0 40px ${G}40`,transition:'all .3s',fontFamily:'inherit'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{T.heroCTA}
            </button>
            <a href="mailto:info@aureus-ia.com" style={{padding:'15px 36px',borderRadius:4,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:13,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>{T.heroContact}
            </a>
          </div>
          <div style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',animation:'bounce 2s infinite'}}>
            <div style={{width:24,height:38,border:`2px solid ${G}25`,borderRadius:12,display:'flex',justifyContent:'center',paddingTop:7}}>
              <div style={{width:4,height:8,borderRadius:2,background:G,animation:'scrolldown 2s infinite'}}/>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section ref={rStats} style={{padding:'50px 24px'}}>
          <div style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:`1px solid ${G}15`,overflow:'hidden'}} className="grid4">
            {STATS_VALUES.map((v,i)=>(
              <div key={i} style={{padding:'32px 18px',textAlign:'center',borderRight:i<3?`1px solid ${G}15`:'none',opacity:vStats?1:0,transform:vStats?'none':'translateY(20px)',transition:`all .6s ease ${i*.1}s`}}>
                <div style={{fontSize:'clamp(24px,4vw,40px)',fontWeight:900,color:G,letterSpacing:'-1px',lineHeight:1}}>{v}</div>
                <div style={{fontSize:10,color:W2,marginTop:8,letterSpacing:'1px',textTransform:'uppercase'}}>{T.statsL[i]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIVE STATS ── */}
        <section ref={rLive} style={{padding:'50px 24px',background:`${G}04`}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:28,justifyContent:'center'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite',display:'inline-block'}}/>
              <span style={{fontSize:10,color:'#22c55e',letterSpacing:'3px',textTransform:'uppercase'}}>{T.liveStatus}</span>
            </div>
            {LIVE_VALUES.map((v,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0',borderBottom:`1px solid ${G}10`,opacity:vLive?1:0,transform:vLive?'none':'translateX(-20px)',transition:`all .5s ease ${i*.1}s`}}>
                <span style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase'}}>{T.liveL[i]}</span>
                <span style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:900,color:G,letterSpacing:'-1px'}}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" ref={rSvc} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{marginBottom:56,opacity:vSvc?1:0,transform:vSvc?'none':'translateY(24px)',transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.svcLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:0,letterSpacing:'-1px',lineHeight:1.1}}>{T.svcTitle}</h2>
            </div>
            {T.svcItems.map((s,i)=>(
              <div key={i} className="svcrow" style={{borderTop:`1px solid ${G}15`,padding:'40px 0',display:'grid',gridTemplateColumns:'70px 1fr 1fr',gap:28,alignItems:'start',opacity:vSvc?1:0,transform:vSvc?'none':'translateX(-20px)',transition:`all .7s ease ${.1+i*.1}s`}}
                onMouseEnter={e=>e.currentTarget.style.background=`${G}04`}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{fontSize:11,color:G3,fontFamily:'monospace',paddingTop:4}}>{s.num}</div>
                <div>
                  <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>{s.sub}</div>
                  <h3 style={{fontSize:'clamp(17px,2.5vw,24px)',fontWeight:700,color:W,margin:0,letterSpacing:'-0.5px'}}>{s.title}</h3>
                </div>
                <div>
                  <p style={{fontSize:13,color:W2,lineHeight:1.75,margin:'0 0 14px'}}>{s.desc}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{s.tags.map(t=><Tag key={t} c={t}/>)}</div>
                </div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${G}15`}}/>
          </div>
        </section>

        {/* ── MODULES ── */}
        <section ref={rMod} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{marginBottom:14,opacity:vMod?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.modLabel}</div>
              <h2 style={{fontSize:'clamp(26px,5vw,52px)',fontWeight:900,color:W,margin:'0 0 6px',letterSpacing:'-2px',lineHeight:1.05}}>
                {T.modTitle} <span style={{color:G,fontStyle:'italic'}}>{T.modItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2,margin:'0 0 40px'}}>{T.modSub}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10}}>
              {MODULES.map((m,i)=>(
                <div key={i} style={{padding:'18px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}04`,display:'flex',gap:12,alignItems:'flex-start',opacity:vMod?1:0,transform:vMod?'none':'translateY(12px)',transition:`all .4s ease ${.03+i*.03}s`}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${G}30`}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${G}12`}>
                  <span style={{fontSize:18,flexShrink:0}}>{m.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:W,marginBottom:3}}>{m.t}</div>
                    <div style={{fontSize:11,color:W2,lineHeight:1.5}}>{m.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD APERÇU ── */}
        <section ref={rDash} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14,opacity:vDash?1:0,transition:'all .6s'}}>— {T.aperçuLabel}</div>
            <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px',opacity:vDash?1:0,transition:'all .7s .1s'}}>
              {T.aperçuTitle}<span style={{color:G,fontStyle:'italic'}}>{T.aperçuItalic}</span>
            </h2>
            <p style={{fontSize:14,color:W2,margin:'0 0 36px',opacity:vDash?1:0,transition:'all .7s .2s'}}>{T.aperçuSub}</p>
            <div style={{border:`1px solid ${G}20`,borderRadius:8,overflow:'hidden',opacity:vDash?1:0,transform:vDash?'none':'translateY(24px)',transition:'all .8s .3s'}}>
              <div style={{background:'#1a1914',padding:'10px 16px',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${G}15`}}>
                {['#ff5f57','#febc2e','#28c840'].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:'50%',background:c,display:'inline-block'}}/>)}
                <div style={{marginLeft:8,background:'#0d0c10',borderRadius:4,padding:'4px 12px',display:'flex',alignItems:'center',gap:6,flex:1,maxWidth:220}}>
                  <span style={{fontSize:10}}>🔒</span><span style={{fontSize:10,color:W2}}>app.aureussocial.be</span>
                </div>
              </div>
              <div style={{background:'#0d0c10',padding:'20px',textAlign:'left'}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:18}}>📊 {T.dashTitle}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}} className="grid3">
                  {[{v:'€ 127 450',l:T.dashCols?.[2]||'BRUT'},{v:'42',l:T.dashCols?.[0]||'EMP.'},{v:'€ 16 629',l:'ONSS'}].map((c,i)=>(
                    <div key={i} style={{background:'#1a1914',padding:'14px',borderRadius:6,border:`1px solid ${G}15`}}>
                      <div style={{fontSize:'clamp(14px,2.5vw,20px)',fontWeight:900,color:G,lineHeight:1.1}}>{c.v}</div>
                      <div style={{fontSize:9,color:W2,marginTop:4,letterSpacing:'1px'}}>{c.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'#1a1914',borderRadius:6,overflow:'hidden',border:`1px solid ${G}15`}}>
                  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 14px',borderBottom:`1px solid ${G}10`}}>
                    {T.dashCols.map(h=><span key={h} style={{fontSize:9,color:W2,letterSpacing:'1px'}}>{h}</span>)}
                  </div>
                  {[['Martin P.','200','€ 3 250','€ 2 147',0],['Duval J.','124','€ 2 890','€ 1 924',1],['Peeters A.','302','€ 3 100','€ 2 058',2],['Lambert S.','200','€ 4 200','€ 2 689',3]].map(([n,cp,b,net,si],i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'9px 14px',borderBottom:i<3?`1px solid ${G}08`:'none',alignItems:'center'}}>
                      <span style={{fontSize:11,color:W}}>{n}</span>
                      <span style={{fontSize:11,color:W2}}>{cp}</span>
                      <span style={{fontSize:11,color:W2}}>{b}</span>
                      <span style={{fontSize:11,color:W2}}>{net}</span>
                      <span style={{fontSize:9,color:si===2?G:'#22c55e',background:si===2?`${G}15`:'#22c55e15',padding:'3px 6px',borderRadius:99,whiteSpace:'nowrap'}}>{T.dashStatus[si]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPARAISON ── */}
        <section ref={rComp} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:44,opacity:vComp?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14}}>— {T.compLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.compTitle} <span style={{color:G,fontStyle:'italic'}}>{T.compItalic}</span> ?
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.compSub}</p>
            </div>
            <div style={{overflowX:'auto',opacity:vComp?1:0,transform:vComp?'none':'translateY(20px)',transition:'all .8s .2s'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
                <thead>
                  <tr>
                    {T.compCols.map((c,i)=>(
                      <th key={i} style={{padding:'14px 12px',textAlign:i===0?'left':'center',fontSize:i===1?13:11,color:i===1?G:W2,fontWeight:i===1?800:400,letterSpacing:'1px',background:i===1?`${G}10`:'transparent',borderBottom:i===1?`2px solid ${G}`:`1px solid ${G}20`}}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {T.compRows.map((row,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${G}08`}}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:'12px',textAlign:j===0?'left':'center',fontSize:12,background:j===1?`${G}06`:'transparent',
                          color:cell==='✓'?'#22c55e':cell==='✗'?'#ef4444':j===1&&i===0?G:W2,fontWeight:j===1&&i===0?800:400}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SÉCURITÉ ── */}
        <section ref={rSec} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <div style={{marginBottom:44,opacity:vSec?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.secLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 6px',letterSpacing:'-1px',lineHeight:1.1}}>
                {T.secTitle} <span style={{color:G,fontStyle:'italic'}}>{T.secItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.secSub}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
              {SECURITY.map((s,i)=>(
                <div key={i} style={{padding:'18px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}05`,display:'flex',gap:12,alignItems:'flex-start',opacity:vSec?1:0,transform:vSec?'none':'translateY(12px)',transition:`all .5s ease ${i*.07}s`}}>
                  <span style={{fontSize:20,flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:W,marginBottom:3}}>{s.t}</div>
                    <div style={{fontSize:11,color:W2,lineHeight:1.5}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTAILS ── */}
        <section ref={rPort} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48,opacity:vPort?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.portailLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.portailTitle} <span style={{color:G,fontStyle:'italic'}}>{T.portailItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.portailSub}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}} className="grid3">
              {T.portails.map((p,i)=>{
                const cols=['#c6a34e','#60a5fa','#a78bfa'];
                return (
                  <div key={i} style={{padding:'28px 22px',border:`1px solid ${cols[i]}25`,borderRadius:8,background:`${cols[i]}06`,textAlign:'center',opacity:vPort?1:0,transform:vPort?'none':'translateY(20px)',transition:`all .6s ease ${i*.12}s`}}>
                    <div style={{fontSize:32,marginBottom:14}}>{p.icon}</div>
                    <h3 style={{fontSize:17,fontWeight:700,color:W,margin:'0 0 6px'}}>{p.title}</h3>
                    <code style={{fontSize:10,color:cols[i],background:`${cols[i]}15`,padding:'3px 8px',borderRadius:3,display:'inline-block',marginBottom:12}}>{p.sub}</code>
                    <p style={{fontSize:12,color:W2,lineHeight:1.6,margin:0}}>{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section ref={rTemo} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48,opacity:vTemo?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.temoLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.temoTitle} <span style={{color:G,fontStyle:'italic'}}>{T.temoItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.temoSub}</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {T.temos.map((t,i)=>(
                <div key={i} style={{padding:'28px',border:`1px solid ${G}15`,borderRadius:8,background:`${G}04`,opacity:vTemo?1:0,transform:vTemo?'none':'translateY(16px)',transition:`all .6s ease ${i*.15}s`}}>
                  <div style={{color:G,fontSize:16,marginBottom:14}}>{'★'.repeat(t.stars)}</div>
                  <p style={{fontSize:14,color:W,lineHeight:1.75,margin:'0 0 20px',fontStyle:'italic'}}>"{t.text}"</p>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:`${G}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:G}}>{t.initial}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:W}}>{t.name}</div>
                      <div style={{fontSize:11,color:W2}}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARIFS ── */}
        <section ref={rTarif} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48,opacity:vTarif?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.tarifLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.tarifTitle} <span style={{color:G,fontStyle:'italic'}}>{T.tarifItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.tarifSub}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}} className="grid2">
              {/* Starter */}
              <div style={{padding:'32px 26px',border:`1px solid ${G}20`,borderRadius:8,background:`${G}05`,opacity:vTarif?1:0,transform:vTarif?'none':'translateY(20px)',transition:'all .6s ease .1s'}}>
                <div style={{fontSize:10,color:W2,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>{T.tarifStarter}</div>
                <div style={{fontSize:32,fontWeight:900,color:W,margin:'0 0 4px'}}>{T.tarifConsulter}</div>
                <div style={{fontSize:12,color:W2,marginBottom:24}}>{T.tarifStarterSub}</div>
                {T.tarifStarterFeats.map(f=>(
                  <div key={f} style={{display:'flex',gap:8,alignItems:'center',marginBottom:9}}>
                    <span style={{color:G,fontSize:13}}>✓</span>
                    <span style={{fontSize:12,color:W2}}>{f}</span>
                  </div>
                ))}
                <button onClick={handleLogin} style={{width:'100%',padding:'13px',marginTop:20,borderRadius:6,border:`1px solid ${G}30`,background:'transparent',color:G,fontSize:12,cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px',transition:'all .2s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{T.tarifBtnStarter}</button>
              </div>
              {/* Pro */}
              <div style={{padding:'32px 26px',border:`2px solid ${G}`,borderRadius:8,background:`${G}08`,position:'relative',opacity:vTarif?1:0,transform:vTarif?'none':'translateY(20px)',transition:'all .6s ease .2s'}}>
                <div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:G,color:'#07060a',fontSize:9,fontWeight:800,padding:'4px 14px',borderRadius:99,letterSpacing:'2px'}}>{T.tarifPopulaire}</div>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>{T.tarifPro}</div>
                <div style={{fontSize:32,fontWeight:900,color:W,margin:'0 0 4px'}}>{T.tarifConsulter}</div>
                <div style={{fontSize:12,color:W2,marginBottom:24}}>{T.tarifProSub}</div>
                {T.tarifProFeats.map(f=>(
                  <div key={f} style={{display:'flex',gap:8,alignItems:'center',marginBottom:9}}>
                    <span style={{color:G,fontSize:13}}>✓</span>
                    <span style={{fontSize:12,color:W2}}>{f}</span>
                  </div>
                ))}
                <button onClick={handleLogin} style={{width:'100%',padding:'13px',marginTop:20,borderRadius:6,border:'none',background:`linear-gradient(135deg,${G3},${G})`,color:'#07060a',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px',transition:'all .2s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{T.tarifBtnPro}</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── ROI ── */}
        <section ref={rRoi} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:680,margin:'0 auto',opacity:vRoi?1:0,transition:'all .8s'}}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.roiLabel}</div>
              <h2 style={{fontSize:'clamp(24px,4vw,42px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.roiTitle} <span style={{color:G,fontStyle:'italic'}}>{T.roiItalic}</span> ?
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.roiSub}</p>
            </div>
            <div style={{padding:'28px',border:`1px solid ${G}15`,borderRadius:8,background:`${G}04`,marginBottom:16}}>
              <div style={{marginBottom:24}}>
                <label style={{fontSize:12,color:W2,display:'block',marginBottom:10}}>{T.roiETP}</label>
                <input type="range" min={5} max={200} value={roiEtp} onChange={e=>setRoiEtp(+e.target.value)} style={{width:'100%',accentColor:G,height:4,cursor:'pointer'}}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                  <span style={{fontSize:10,color:W2}}>5</span>
                  <span style={{fontSize:20,fontWeight:900,color:G}}>{roiEtp}</span>
                  <span style={{fontSize:10,color:W2}}>200</span>
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,color:W2,display:'block',marginBottom:10}}>{T.roiProvider}</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {Object.keys(rates).map(p=>(
                    <button key={p} onClick={()=>setRoiProv(p)} style={{padding:'9px',borderRadius:6,border:`1px solid ${roiProv===p?G:`${G}20`}`,background:roiProv===p?`${G}15`:'transparent',color:roiProv===p?G:W2,fontSize:12,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:12,color:W2,display:'block',marginBottom:10}}>{T.roiModules}</label>
                {T.roiMods.map(([k,l])=>(
                  <label key={k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9,cursor:'pointer'}}>
                    <input type="checkbox" checked={roiMods[k]} onChange={e=>setRoiMods(m=>({...m,[k]:e.target.checked}))} style={{accentColor:G,width:15,height:15}}/>
                    <span style={{fontSize:12,color:W2}}>{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gap:10,marginBottom:16}}>
              <div style={{padding:'20px',border:`1px solid #ef444430`,borderRadius:8,background:'#ef444408'}}>
                <div style={{fontSize:9,color:W2,letterSpacing:'2px',marginBottom:6}}>{T.roiCurrent}</div>
                <div style={{fontSize:'clamp(24px,4vw,38px)',fontWeight:900,color:'#ef4444',textDecoration:'line-through',letterSpacing:'-1px'}}>€ {currentCost.toLocaleString('fr-BE')}</div>
                <div style={{fontSize:11,color:W2,marginTop:3}}>~€{rates[roiProv]}/ETP · {roiEtp} ETP · {roiProv}</div>
              </div>
              <div style={{textAlign:'center',fontSize:12,color:W2}}>VS</div>
              <div style={{padding:'20px',border:`2px solid ${G}30`,borderRadius:8,background:`${G}08`}}>
                <div style={{fontSize:9,color:G,letterSpacing:'2px',marginBottom:6}}>{T.roiWith}</div>
                <div style={{fontSize:'clamp(24px,4vw,38px)',fontWeight:900,color:G,letterSpacing:'-1px'}}>{T.tarifConsulter}</div>
                <div style={{fontSize:11,color:W2,marginTop:3}}>{roiEtp} ETP</div>
              </div>
              <div style={{padding:'20px',border:`1px solid #22c55e30`,borderRadius:8,background:'#22c55e08',textAlign:'center'}}>
                <div style={{fontSize:9,color:W2,letterSpacing:'2px',marginBottom:6}}>{T.roiEco}</div>
                <div style={{fontSize:'clamp(20px,3vw,32px)',fontWeight:900,color:'#22c55e'}}>{T.roiContact}</div>
                <div style={{fontSize:11,color:W2,marginTop:3}}>{T.roiContactSub}</div>
              </div>
            </div>
            <button onClick={handleLogin} style={{width:'100%',padding:'15px',borderRadius:6,border:'none',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:13,fontWeight:800,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',boxShadow:`0 0 40px ${G}30`,transition:'all .3s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{T.roiBtnDevis}</button>
          </div>
        </section>

        {/* ── MIGRATION ── */}
        <section ref={rMig} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48,opacity:vMig?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.migLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.migTitle} <span style={{color:G,fontStyle:'italic'}}>{T.migItalic}</span>{T.migSuffix}
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.migSub}</p>
            </div>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',left:24,top:0,bottom:0,width:1,background:`${G}20`}}/>
              {T.migSteps.map((s,i)=>(
                <div key={i} style={{display:'flex',gap:28,marginBottom:24,opacity:vMig?1:0,transform:vMig?'none':'translateX(-20px)',transition:`all .6s ease ${i*.15}s`}}>
                  <div style={{width:48,height:48,borderRadius:'50%',border:`2px solid ${G}`,background:BG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:G,flexShrink:0,zIndex:1}}>{s.n}</div>
                  <div style={{padding:'20px',border:`1px solid ${G}12`,borderRadius:8,background:`${G}04`,flex:1}}>
                    <div style={{fontSize:9,color:G,letterSpacing:'2px',marginBottom:6}}>{s.period}</div>
                    <h3 style={{fontSize:18,fontWeight:700,color:W,margin:'0 0 10px'}}>{s.title}</h3>
                    <p style={{fontSize:13,color:W2,lineHeight:1.7,margin:'0 0 14px'}}>{s.desc}</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                      {s.tags.map(t=><span key={t} style={{fontSize:10,color:G2,background:`${G}10`,border:`1px solid ${G}20`,padding:'3px 10px',borderRadius:3,fontFamily:'monospace'}}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:32}}>
              <button onClick={handleLogin} style={{padding:'15px 44px',borderRadius:8,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:13,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .3s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{T.migBtn}</button>
            </div>
          </div>
        </section>

        {/* ── RESSOURCES ── */}
        <section ref={rRes} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:44,opacity:vRes?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.resLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.resTitle} <span style={{color:G,fontStyle:'italic'}}>{T.resItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.resSub}</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {T.resItems.map((a,i)=>(
                <div key={i} style={{padding:'24px',border:`1px solid ${G}12`,borderRadius:8,background:`${G}04`,cursor:'pointer',opacity:vRes?1:0,transform:vRes?'none':'translateY(16px)',transition:`all .5s ease ${i*.1}s`}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${G}30`}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${G}12`}>
                  <div style={{fontSize:9,color:G,letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>{a.cat}</div>
                  <h3 style={{fontSize:'clamp(15px,2vw,18px)',fontWeight:700,color:W,margin:'0 0 8px',lineHeight:1.3}}>{a.title}</h3>
                  <p style={{fontSize:12,color:W2,lineHeight:1.6,margin:'0 0 12px'}}>{a.desc}</p>
                  <div style={{display:'flex',gap:14,fontSize:10,color:W2}}>
                    <span>⏱ {a.time}</span><span>📅 {a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section ref={rFaq} style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:740,margin:'0 auto'}}>
            <div style={{marginBottom:44,opacity:vFaq?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.faqLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 10px',letterSpacing:'-1px'}}>
                {T.faqTitle} <span style={{color:G,fontStyle:'italic'}}>{T.faqItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2}}>{T.faqSub}</p>
            </div>
            {T.faqs.map((f,i)=>(
              <div key={i} style={{borderBottom:`1px solid ${G}12`,opacity:vFaq?1:0,transition:`all .5s ease ${i*.07}s`}}>
                <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:'100%',padding:'18px 0',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
                  <span style={{fontSize:14,color:W,fontWeight:500,paddingRight:14}}>{f.q}</span>
                  <span style={{color:G,fontSize:18,flexShrink:0,transition:'transform .3s',transform:faqOpen===i?'rotate(45deg)':'none'}}>+</span>
                </button>
                {faqOpen===i&&<div style={{padding:'0 0 18px',fontSize:13,color:W2,lineHeight:1.75}}>{f.a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── À PROPOS ── */}
        <section id="propos" ref={rAbout} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:70,alignItems:'center',opacity:vAbout?1:0,transition:'all .8s'}} className="grid2">
            <div>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14}}>— {T.aboutLabel}</div>
              <h2 style={{fontSize:'clamp(24px,3.5vw,40px)',fontWeight:800,color:W,margin:'0 0 20px',letterSpacing:'-1px',lineHeight:1.1}}>
                {T.aboutTitle}<br/><span style={{color:G,fontStyle:'italic'}}>{T.aboutItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2,lineHeight:1.8,margin:'0 0 14px'}}>{T.aboutP1}</p>
              <p style={{fontSize:14,color:W2,lineHeight:1.8,margin:'0 0 32px'}}>{T.aboutP2}</p>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                {T.aboutStats.map((item,i)=>(
                  <div key={i}>
                    <div style={{fontSize:22,fontWeight:900,color:G}}>{item.v}</div>
                    <div style={{fontSize:10,color:W2,letterSpacing:'1px'}}>{item.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:14}}>{T.expLabel}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {T.expertise.map((e,i)=>(
                  <div key={i} style={{padding:'12px 14px',border:`1px solid ${G}12`,borderRadius:2,background:`${G}05`,fontSize:11,color:W2,display:'flex',alignItems:'center',gap:7,opacity:vAbout?1:0,transform:vAbout?'none':'translateY(10px)',transition:`all .5s ease ${.3+i*.05}s`}}>
                    <span style={{color:G,fontSize:9}}>◆</span>{e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ── VEILLE LÉGISLATIVE ── */}
        <section ref={rVeille} style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52,opacity:vVeille?1:0,transition:'all .7s'}}>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {T.veilleLabel}</div>
              <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontWeight:800,color:W,margin:'0 0 12px',letterSpacing:'-1px'}}>
                {T.veilleTitle} <span style={{color:G,fontStyle:'italic'}}>{T.veilleItalic}</span>
              </h2>
              <p style={{fontSize:14,color:W2,maxWidth:600,margin:'0 auto'}}>{T.veilleSub}</p>
            </div>

            {/* Sources */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12,marginBottom:40}}>
              {T.veilleSources.map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{padding:'20px',border:`1px solid ${G}12`,borderRadius:6,background:`${G}04`,display:'flex',flexDirection:'column',gap:8,textDecoration:'none',cursor:'pointer',opacity:vVeille?1:0,transform:vVeille?'none':'translateY(12px)',transition:`all .5s ease ${i*.07}s`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${G}35`;e.currentTarget.style.background=`${G}08`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=`${G}12`;e.currentTarget.style.background=`${G}04`;}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <span style={{fontSize:20}}>{s.icon}</span>
                      <span style={{fontSize:9,color:G,letterSpacing:'2px',textTransform:'uppercase'}}>{s.cat}</span>
                    </div>
                    <span style={{fontSize:9,color:G2,background:`${G}15`,border:`1px solid ${G}20`,padding:'2px 8px',borderRadius:2,letterSpacing:'1px',whiteSpace:'nowrap'}}>{s.tag}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:W,lineHeight:1.3}}>{s.title}</div>
                  <div style={{fontSize:11,color:W2,lineHeight:1.6}}>{s.desc}</div>
                  <div style={{fontSize:10,color:G,marginTop:4}}>→ Ouvrir ↗</div>
                </a>
              ))}
            </div>

            {/* Encart 23 SS agréés */}
            <div style={{padding:'28px 32px',border:`1px solid ${G}25`,borderRadius:8,background:`${G}08`,display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap',opacity:vVeille?1:0,transform:vVeille?'none':'translateY(16px)',transition:'all .7s ease .6s'}}>
              <div style={{fontSize:36,flexShrink:0}}>🏦</div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:10,color:G,letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>INTELLIGENCE CONCURRENTIELLE</div>
                <h3 style={{fontSize:18,fontWeight:700,color:W,margin:'0 0 10px'}}>{T.veilleAgrees}</h3>
                <p style={{fontSize:13,color:W2,lineHeight:1.7,margin:'0 0 16px'}}>{T.veilleAgreesDesc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {['SD Worx','Partena','Securex','Acerta','Group S','Liantis','Xerius','Dyzo','Zenito','HDP','Sociaal Bureau','UCM','Axa','ACV','FGTB','CSC','Mensura','Sodexo','Alterna','DKV','KBC-SS','Attentia','Sodalis'].map((ss,i)=>(
                    <span key={i} style={{fontSize:9,color:W2,background:`${G}08`,border:`1px solid ${G}15`,padding:'3px 9px',borderRadius:2,letterSpacing:'.5px'}}>{ss}</span>
                  ))}
                </div>
              </div>
              <button onClick={handleLogin} style={{padding:'12px 28px',borderRadius:6,border:'none',background:`linear-gradient(135deg,${G3},${G})`,color:'#07060a',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px',transition:'all .2s',flexShrink:0,alignSelf:'center'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{T.veilleBtn}</button>
            </div>
          </div>
        </section>

        {/* ── RÉVOLUTION ── */}
        <section ref={rRev} style={{padding:'80px 24px 100px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 60% 80% at 50% 50%,${G}08 0%,transparent 70%)`}}/>
          <div style={{maxWidth:700,margin:'0 auto',textAlign:'center',opacity:vRev?1:0,transform:vRev?'none':'translateY(32px)',transition:'all .8s'}}>
            <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:18}}>— {T.revLabel}</div>
            <h2 style={{fontSize:'clamp(30px,6vw,58px)',fontWeight:900,color:W,margin:'0 0 18px',letterSpacing:'-2px',lineHeight:1.05}}>
              {T.revTitle} <span style={{color:G,fontStyle:'italic'}}>{T.revItalic}</span><br/>{T.revSuffix}
            </h2>
            <p style={{fontSize:15,color:W2,lineHeight:1.8,margin:'0 0 44px'}}>{T.revSub}</p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center'}}>
              <button onClick={handleLogin} style={{padding:'16px 44px',borderRadius:8,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:13,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',boxShadow:`0 0 60px ${G}30`,transition:'all .3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 60px ${G}50`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 60px ${G}30`;}}>{T.revBtnCreate}</button>
              <a href="mailto:info@aureus-ia.com" style={{padding:'16px 44px',borderRadius:8,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:13,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s',display:'flex',alignItems:'center'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>{T.revBtnContact}</a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{background:'#0a0908',borderTop:`1px solid ${G}12`}}>
          <div style={{maxWidth:1100,margin:'0 auto',padding:'52px 24px 28px'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:36,marginBottom:40}} className="ftcols">
              <div>
                <div style={{fontSize:17,fontWeight:900,color:G,letterSpacing:'2px',marginBottom:4}}>AUREUS</div>
                <div style={{fontSize:9,color:W2,letterSpacing:'3px',marginBottom:14}}>SOCIAL PRO · IA SPRL</div>
                <p style={{fontSize:12,color:W2,lineHeight:1.7,margin:'0 0 14px'}}>{T.footerDesc}</p>
                <div style={{fontSize:11,color:W2}}>BCE BE 1028.230.781<br/>Place Marcel Broodthaers 8<br/>1060 Saint-Gilles, Bruxelles</div>
                <a href="mailto:info@aureus-ia.com" style={{fontSize:12,color:G,display:'block',marginTop:10,textDecoration:'none'}}>info@aureus-ia.com</a>
              </div>
              {T.footerCols.map((col,i)=>(
                <div key={i}>
                  <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:14}}>{col.title}</div>
                  {col.items.map(l=>(
                    <div key={l} style={{fontSize:12,color:W2,marginBottom:9,cursor:'pointer',transition:'color .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.color=G}
                      onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${G}10`,paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <div style={{fontSize:11,color:W2}}>{T.copyright}</div>
              <button onClick={handleLogin} style={{padding:'9px 20px',borderRadius:3,border:`1px solid ${G}30`,background:'transparent',color:G,fontSize:10,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{T.footerConnect}</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
