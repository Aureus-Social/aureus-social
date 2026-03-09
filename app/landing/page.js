'use client';
import { useState, useEffect, useRef } from 'react';

const G='#c6a34e', G2='#e8c97a', G3='#8a6f2e', BG='#07060a', W='#f0ede8', W2='#9a9690';

/* ── i18n ─────────────────────────────────────────────────────── */
const T = {
  fr: {
    nav: { connect:'Se connecter', items:[['Services','#services'],['Modules','#modules'],['À propos','#apropos']] },
    hero: {
      badge:'Version 18 — Live en production',
      by:'Aureus IA SPRL',
      h1:'L\'administration sociale,\ngérée avec',
      words:['précision.','conformité.','efficacité.','confiance.'],
      sub:'Consultant indépendant en gestion sociale et paie belge. Moteur de paie conforme SPF, déclarations ONSS automatiques, portails multi-tenant, sécurité de niveau bancaire.',
      cta:'Accéder à la plateforme →',
      contact:'Me contacter',
    },
    stats: [
      { v:'166', l:'Commissions paritaires' },
      { v:'132', l:'Modules déployés' },
      { v:'99.97%', l:'Uptime plateforme' },
      { v:'1 274', l:'Fiches de paie calculées' },
    ],
    live: {
      status:'LIVE — Plateforme opérationnelle',
      items:[
        { v:'1 274', l:'FICHES DE PAIE CALCULÉES' },
        { v:'42',    l:'ENTREPRISES GÉRÉES' },
        { v:'99.97%',l:'UPTIME PLATEFORME' },
        { v:'392',   l:'DÉCLARATIONS ONSS SOUMISES' },
      ]
    },
    svc: {
      label:'Services', title:'Ce que je fais pour vous.',
      items:[
        { n:'01', t:'Secrétariat Social Digital', s:'Gestion complète de votre paie belge',
          d:'Dimona, DmfA, Belcotax, fiches de paie — chaque obligation sociale traitée avec précision pour vos travailleurs.',
          tags:['Dimona IN/OUT','Belcotax 281.10','DmfA trimestriel','166 CP'] },
        { n:'02', t:'Consultance RH & Sociale', s:'Expertise en droit social belge',
          d:'Contrats CDD/CDI, procédures de licenciement, calcul des préavis, optimisation de la rémunération nette.',
          tags:['CP 200','Préavis Claeys','CCT sectorielles','RGPD social'] },
        { n:'03', t:'Optimisation Fiscale Salariale', s:'Maximiser le net sans augmenter le coût',
          d:'Chèques-repas, éco-chèques, voiture de société, plan cafétéria — je maximise le pouvoir d\'achat de vos équipes.',
          tags:['Plan cafétéria','ATN voiture','Bonus CCT 90','Flexi-jobs'] },
        { n:'04', t:'Support Fiduciaires', s:'Partenaire technique pour experts-comptables',
          d:'Migration depuis SD Worx / Partena / Securex, intégration export WinBooks, BOB, Octopus.',
          tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
      ]
    },
    modules: {
      label:'Fonctionnalités', title:'132 modules,', italic:'zéro compromis',
      sub:'132 modules déployés en production, couvrant l\'intégralité du cycle de paie belge — 44 246 lignes de code.',
    },
    dash: {
      label:'Aperçu', title:'Découvrez l\'', italic:'interface',
      sub:'Un aperçu de la plateforme en temps réel.',
      title2:'Dashboard — Février 2026',
      cols:['EMPLOYÉ','CP','BRUT','NET','STATUT'],
      status:['Calculé','Calculé','En attente','Calculé'],
    },
    comp: {
      label:'Comparaison', title:'Pourquoi pas les', italic:'autres',
      sub:'Comparaison objective avec les solutions traditionnelles du marché belge.',
      cols:['Critère','Aureus Social Pro','Grand SS traditionnel','SS régional'],
      rows:[
        ['Tarif mensuel (10 ETP)','Sur devis','€ 800–1 200','€ 600–900'],
        ['Interface moderne (React / Next.js 15)','✓','✗','✗'],
        ['API REST publique','✓','✗','✗'],
        ['Portail employé inclus','✓','Option payante','Option payante'],
        ['Signature électronique','✓','✗','✗'],
        ['PWA mobile','✓','✗','✗'],
        ['Multi-devise & expats','✓','✓','✓'],
        ['Import concurrent (migration)','✓','✗','✗'],
        ['Webhooks temps réel','✓','✗','✗'],
        ['Déploiement continu','✓','Trimestriel','Trimestriel'],
      ]
    },
    sec: {
      label:'Sécurité', title:'Sécurité de', italic:'niveau bancaire',
      sub:'4 couches de protection. RGPD Art. 32 natif.',
    },
    portails: {
      label:'Multi-tenant', title:'Trois portails,', italic:'une plateforme',
      sub:'Isolation totale des données. Chaque utilisateur accède exactement à ce dont il a besoin.',
      items:[
        { icon:'🏢', t:'Cabinet / Fiduciaire', code:'?portal=admin',
          d:'Gestion multi-clients, tableaux de bord consolidés, facturation cabinet, mandats ONSS, exports comptables.' },
        { icon:'🏭', t:'Client Employeur', code:'?portal=client',
          d:'Dashboard, travailleurs, fiches de paie, déclarations, documents, factures.' },
        { icon:'👤', t:'Employé', code:'?portal=employee',
          d:'Fiches PDF, demandes de congé, documents personnels, informations.' },
      ]
    },
    temo: {
      label:'Témoignages', title:'Ce qu\'en disent nos', italic:'bêta-testeurs',
      sub:'Retours des premiers fiduciaires à tester la plateforme.',
      items:[
        { stars:5, text:'L\'interface est années-lumière devant ce qu\'on utilisait avec notre ancien secrétariat social. Le calcul de paie est précis, les 166 CP sont là, et le portail employé fait gagner un temps fou.', name:'Sophie V.', role:'Gestionnaire de paie, Fiduciaire Bruxelles', ini:'S' },
        { stars:5, text:'La DmfA XML se génère en un clic, le précompte est conforme SPF, et les fiches de paie sont impeccables. On a migré 85 dossiers depuis notre ancien prestataire en une semaine.', name:'Nathalie C.', role:'Gestionnaire de paie senior, Cabinet comptable Liège', ini:'N' },
        { stars:5, text:'On paye 4× moins qu\'avec notre ancien secrétariat social et on a plus de fonctionnalités. Le Belcotax, le SEPA, les déclarations DIMONA — tout est automatisé. Un vrai gain de temps.', name:'Karim B.', role:'Gestionnaire de paie, Secrétariat social Anvers', ini:'K' },
      ]
    },
    tarifs: {
      label:'Tarifs', title:'Transparent et', italic:'compétitif',
      sub:'Pas de frais cachés. Pas d\'engagement longue durée. Essai gratuit 30 jours.',
      starter:{ nom:'Starter', contact:'Contactez-nous', prix:'', desc:'Tarif adapté à votre entreprise',
        feats:['Calcul de paie complet','DmfA + Belcotax XML','Portail employé','Fiches de paie PDF','GED documents','Support e-mail'], btn:'Commencer' },
      pro:{ nom:'Pro', badge:'POPULAIRE', contact:'Contactez-nous', prix:'', desc:'Tout inclus, sur devis',
        feats:['Tout Starter inclus','DIMONA + SEPA automatiques','Signature électronique','API REST + Webhooks','Reporting avancé','Multi-devise & expats','Import concurrent','Support prioritaire'], btn:'Essai gratuit 30 j' },
    },
    roi: {
      label:'Calculateur ROI', title:'Combien', italic:'économisez-vous',
      sub:'Comparez votre coût actuel avec Aureus Social Pro en quelques clics.',
      etp:'Nombre de travailleurs (ETP)',
      provider:'Votre prestataire actuel',
      mods:'Modules supplémentaires ?',
      modItems:[['portail','Portail employé'],['sig','Signature électronique'],['api','API / Intégration ERP']],
      current:'COÛT ACTUEL ESTIMÉ',
      with:'AVEC AUREUS SOCIAL PRO',
      eco:'ÉCONOMIE POTENTIELLE',
      contact:'Contactez-nous',
      contactSub:'pour un devis personnalisé gratuit',
      btn:'Obtenir mon devis gratuit →',
    },
    mig: {
      label:'Migration', title:'Migrez en', italic:'7 jours', suffix:', pas 7 mois',
      sub:'Un processus clair, accompagné, sans interruption de votre activité.',
      steps:[
        { n:1, p:'JOUR 1–2', t:'Import & Analyse',
          d:'Export CSV depuis votre prestataire actuel. Notre parseur détecte automatiquement le format et importe travailleurs, contrats, historiques de paie, soldes de congés.',
          tags:['📥 Import CSV','📊 Analyse auto','✅ Validation NISS'] },
        { n:2, p:'JOUR 3–5', t:'Vérification & Paramétrage',
          d:'Vérification croisée de toutes les données importées : commissions paritaires, barèmes, taux ONSS sectoriels. Configuration des portails. Formation de votre équipe (2 h).',
          tags:['🔍 Audit données','⚙️ Config CP','🎓 Formation 2 h'] },
        { n:3, p:'JOUR 5–6', t:'Paie Parallèle',
          d:'Calcul de paie en parallèle avec votre ancien système. Comparaison fiche par fiche : brut, ONSS, précompte, net. Écart 0 € = migration validée.',
          tags:['🗓️ Calcul parallèle','📊 Comparaison','✅ Écart 0 €'] },
        { n:'✓', p:'JOUR 7', t:'Go Live !',
          d:'Basculement définitif. Génération des premières fiches officielles. Activation DIMONA, DmfA, SEPA. Vos employés reçoivent l\'accès au portail. Support prioritaire 30 jours.',
          tags:['🚀 Production','📡 DIMONA active','🎉 C\'est parti !'] },
      ],
      btn:'Commencer la migration',
    },
    res: {
      label:'Ressources', title:'Expertise', italic:'paie belge',
      sub:'Guides pratiques et analyses pour les gestionnaires de paie en Belgique.',
      items:[
        { cat:'ERREURS & CONFORMITÉ', t:'Les 10 erreurs de paie les plus coûteuses en Belgique',
          d:'Commission paritaire incorrecte, précompte mal calculé, DIMONA oubliée… Découvrez les erreurs qui coûtent des milliers d\'euros aux fiduciaires.', time:'8 min', date:'Février 2026' },
        { cat:'COMPARATIF', t:'Secrétariat social traditionnel vs Aureus Social Pro : comparatif 2026',
          d:'Tarifs, fonctionnalités, technologie, support. Analyse objective point par point de deux approches radicalement différentes.', time:'12 min', date:'Février 2026' },
        { cat:'GUIDE TECHNIQUE', t:'Précompte professionnel 2026 : le guide complet pour gestionnaires',
          d:'Tranches progressives, quotient conjugal, réductions enfants, bonus emploi fiscal. Tout ce qui change en 2026 et comment le calculer.', time:'15 min', date:'Janvier 2026' },
        { cat:'GUIDE MIGRATION', t:'Comment migrer de votre secrétariat social en 7 jours',
          d:'Guide pas à pas pour quitter votre secrétariat social traditionnel sans perdre une seule donnée et sans interruption de paie.', time:'10 min', date:'Février 2026' },
      ]
    },
    faq: {
      label:'FAQ', title:'Questions', italic:'fréquentes',
      sub:'Tout ce que vous devez savoir avant de commencer.',
      items:[
        { q:'Est-ce conforme à la législation belge ?',
          a:'Oui. La plateforme intègre nativement les 166 commissions paritaires (71 grilles officielles + 95 calculées), les barèmes sectoriels 2024–2026, et se conforme aux schémas XML ONSS pour Dimona et DmfA. Le calcul du précompte professionnel suit l\'Annexe III AR. Mises à jour légales automatiques.' },
        { q:'Comment migrer depuis un secrétariat social traditionnel ?',
          a:'Notre parseur CSV multi-format importe automatiquement vos données depuis SD Worx, Partena, Securex ou tout autre prestataire. Le processus prend 7 jours : import → vérification → go live. Support dédié inclus.' },
        { q:'Les données sont-elles sécurisées ?',
          a:'Oui. Chiffrement AES-256-GCM pour NISS et IBAN, Row Level Security Supabase (isolation multi-tenant totale), HSTS + CSP Headers, anti-brute force, détection géo-intrusion, OWASP ZAP CI/CD. RGPD Art. 32 natif.' },
        { q:'Puis-je tester gratuitement ?',
          a:'Oui. Essai gratuit 30 jours, sans carte de crédit, sans engagement. Accès complet à toutes les fonctionnalités Pro. Contactez-nous à info@aureus-ia.com pour démarrer.' },
        { q:'Y a-t-il une API pour mon ERP / logiciel comptable ?',
          a:'Oui. API REST v1 avec endpoints documentés. Webhooks HMAC-SHA256 pour intégrations en temps réel. Compatible BOB, WinBooks, Exact Online, Octopus, Horus.' },
        { q:'L\'application fonctionne-t-elle sur mobile ?',
          a:'Oui. PWA (Progressive Web App) installable sur iOS et Android. Push notifications, mode offline pour consultation des fiches. Interface responsive optimisée pour tous les écrans.' },
      ]
    },
    about: {
      label:'À propos', title:'Une expertise de terrain,', italic:'une plateforme sur mesure.',
      p1:'J\'ai fondé Aureus IA SPRL pour proposer une alternative sérieuse aux grands secrétariats sociaux belges. Moins de frais généraux, plus de réactivité, maîtrise totale du droit social belge.',
      p2:'La plateforme Aureus Social Pro intègre nativement les 166 commissions paritaires, les dernières CCT et se connecte directement à l\'ONSS via Mahis.',
      stats:[{v:'42',l:'Entreprises gérées'},{v:'392',l:'Déclarations ONSS'},{v:'99.97%',l:'Uptime'}],
      expLabel:'Domaines d\'expertise',
      exp:['Droit social belge (CP 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finances','Calcul préavis & C4','Régularisation précompte','Plans cafétéria & ATN','Activa.brussels & primes emploi','RGPD & sécurité des données'],
    },
    rev: {
      label:'Prêt à commencer ?', title:'Rejoignez la', italic:'révolution', suffix:'de la paie belge',
      sub:'Dites adieu aux logiciels obsolètes. Aureus Social Pro modernise votre secrétariat social pour une fraction du prix.',
      btn1:'Créer un compte gratuit', btn2:'Nous contacter',
    },
    footer: {
      desc:'Secrétariat social digital belge de nouvelle génération. 132 modules, 166 CP, sécurité bancaire.',
      cols:[
        { t:'Produit', items:['Fonctionnalités','Tarifs','Migration','Sécurité','API'] },
        { t:'Ressources', items:['Guides paie belge','FAQ','Documentation','Statut plateforme'] },
        { t:'Légal', items:['Contact','Trust Center','Confidentialité','CGU'] },
      ],
      connect:'Se connecter →',
      copy:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Bruxelles',
    },
  },
};

/* ── NL ── */
T.nl = {
  nav: { connect:'Inloggen', items:[['Diensten','#services'],['Modules','#modules'],['Over ons','#apropos']] },
  hero: {
    badge:'Versie 18 — Live in productie',
    by:'Aureus IA SPRL',
    h1:'Sociaal beheer,\nbeheerd met',
    words:['precisie.','conformiteit.','efficiëntie.','vertrouwen.'],
    sub:'Onafhankelijk consultant in sociaal beheer en Belgische loonverwerking. SPF-conform loonadministratiesysteem, automatische ONSS-aangiften, multi-tenant portalen, bankbeveiliging.',
    cta:'Toegang tot het platform →',
    contact:'Neem contact op',
  },
  stats:[
    { v:'166', l:'Paritaire comités' },
    { v:'132', l:'Geïmplementeerde modules' },
    { v:'99.97%', l:'Platform uptime' },
    { v:'1 274', l:'Berekende loonfiches' },
  ],
  live:{
    status:'LIVE — Platform operationeel',
    items:[
      { v:'1 274', l:'BEREKENDE LOONFICHES' },
      { v:'42',    l:'BEHEERDE BEDRIJVEN' },
      { v:'99.97%',l:'PLATFORM UPTIME' },
      { v:'392',   l:'INGEDIENDE ONSS-AANGIFTEN' },
    ]
  },
  svc:{
    label:'Diensten', title:'Wat ik voor u doe.',
    items:[
      { n:'01', t:'Digitaal Sociaal Secretariaat', s:'Volledig beheer van uw Belgische lonen',
        d:'Dimona, DmfA, Belcotax, loonfiches — elke sociale verplichting nauwkeurig behandeld voor uw werknemers.',
        tags:['Dimona IN/OUT','Belcotax 281.10','Kwartaal DmfA','166 PC'] },
      { n:'02', t:'HR & Sociale Consultancy', s:'Expertise in Belgisch sociaal recht',
        d:'CDD/CDI-contracten, ontslagprocedures, berekening opzegtermijnen, optimalisatie nettoloon.',
        tags:['PC 200','Opzegtermijn Claeys','CAO sectoraal','AVG sociaal'] },
      { n:'03', t:'Fiscale Loonoptimalisatie', s:'Netto maximaliseren zonder hogere kosten',
        d:'Maaltijdcheques, eco-cheques, bedrijfswagen, cafetariaplan — ik maximaliseer de koopkracht van uw teams.',
        tags:['Cafetariaplan','ATN auto','Bonus CAO 90','Flexi-jobs'] },
      { n:'04', t:'Ondersteuning Fiduciaires', s:'Technische partner voor accountants',
        d:'Migratie vanuit SD Worx / Partena / Securex, integratie export WinBooks, BOB, Octopus.',
        tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
    ]
  },
  modules:{
    label:'Functies', title:'132 modules,', italic:'nul compromissen',
    sub:'132 modules geïmplementeerd in productie, het volledige Belgische loonverwerkingscyclus dekkend — 44 246 regels code.',
  },
  dash:{
    label:'Overzicht', title:'Ontdek de', italic:'interface',
    sub:'Een overzicht van het platform in real time.',
    title2:'Dashboard — Februari 2026',
    cols:['WERKNEMER','PC','BRUTO','NETTO','STATUS'],
    status:['Berekend','Berekend','In afwachting','Berekend'],
  },
  comp:{
    label:'Vergelijking', title:'Waarom niet de', italic:'anderen',
    sub:'Objectieve vergelijking met de traditionele oplossingen op de Belgische markt.',
    cols:['Criterium','Aureus Social Pro','Groot traditioneel SS','Regionaal SS'],
    rows:[
      ['Maandtarief (10 VTE)','Op offerte','€ 800–1 200','€ 600–900'],
      ['Modern interface (React / Next.js 15)','✓','✗','✗'],
      ['Publieke REST-API','✓','✗','✗'],
      ['Werknemersportaal inbegrepen','✓','Betalende optie','Betalende optie'],
      ['Elektronische handtekening','✓','✗','✗'],
      ['PWA mobiel','✓','✗','✗'],
      ['Multi-valuta & expats','✓','✓','✓'],
      ['Concurrent import (migratie)','✓','✗','✗'],
      ['Real-time webhooks','✓','✗','✗'],
      ['Continue implementatie','✓','Kwartaal','Kwartaal'],
    ]
  },
  sec:{ label:'Beveiliging', title:'Beveiliging op', italic:'bankniveau', sub:'4 beschermingslagen. AVG Art. 32 ingebouwd.' },
  portails:{
    label:'Multi-tenant', title:'Drie portalen,', italic:'één platform',
    sub:'Volledige data-isolatie. Elke gebruiker heeft toegang tot precies wat hij nodig heeft.',
    items:[
      { icon:'🏢', t:'Kantoor / Fiduciaire', code:'?portal=admin',
        d:'Multi-klantbeheer, geconsolideerde dashboards, kantoorfacturatie, ONSS-mandaten, boekhoudkundige exports.' },
      { icon:'🏭', t:'Werkgever', code:'?portal=client',
        d:'Dashboard, werknemers, loonfiches, aangiften, documenten, facturen.' },
      { icon:'👤', t:'Werknemer', code:'?portal=employee',
        d:'PDF-fiches, verlofaanvragen, persoonlijke documenten, informatie.' },
    ]
  },
  temo:{
    label:'Getuigenissen', title:'Wat onze', italic:'bèta-testers zeggen',
    sub:'Feedback van de eerste fiduciaires die het platform hebben getest.',
    items:[
      { stars:5, text:'De interface is lichtjaren vooruit op wat we gebruikten met ons vorige sociaal secretariaat. De loonberekening is nauwkeurig, de 166 PC zijn aanwezig, en het werknemersportaal bespaart enorm veel tijd.', name:'Sophie V.', role:'Loonbeheerder, Fiduciaire Brussel', ini:'S' },
      { stars:5, text:'De DmfA XML wordt in één klik gegenereerd, de bedrijfsvoorheffing is SPF-conform, en de loonfiches zijn vlekkeloos. We hebben 85 dossiers gemigreerd in één week.', name:'Nathalie C.', role:'Senior loonbeheerder, Boekhoudkantoor Luik', ini:'N' },
      { stars:5, text:'We betalen 4× minder dan bij ons vorig sociaal secretariaat en hebben meer functies. Belcotax, SEPA, DIMONA-aangiften — alles is geautomatiseerd. Echte tijdsbesparing.', name:'Karim B.', role:'Loonbeheerder, Sociaal secretariaat Antwerpen', ini:'K' },
    ]
  },
  tarifs:{
    label:'Tarieven', title:'Transparant en', italic:'competitief',
    sub:'Geen verborgen kosten. Geen langetermijnverbintenis. 30 dagen gratis proef.',
    starter:{ nom:'Starter', contact:'Contacteer ons', prix:'', desc:'Tarief aangepast aan uw bedrijf',
      feats:['Volledige loonberekening','DmfA + Belcotax XML','Werknemersportaal','PDF-loonfiches','GED documenten','E-mailondersteuning'], btn:'Beginnen' },
    pro:{ nom:'Pro', badge:'POPULAIR', contact:'Contacteer ons', prix:'', desc:'Alles inbegrepen, op offerte',
      feats:['Alles van Starter inbegrepen','Automatisch DIMONA + SEPA','Elektronische handtekening','REST-API + Webhooks','Geavanceerde rapportage','Multi-valuta & expats','Concurrent import','Prioriteitsondersteuning'], btn:'Gratis proef 30 d' },
  },
  roi:{
    label:'ROI-calculator', title:'Hoeveel', italic:'bespaart u',
    sub:'Vergelijk uw huidige kosten met Aureus Social Pro in enkele klikken.',
    etp:'Aantal werknemers (VTE)',
    provider:'Uw huidige dienstverlener',
    mods:'Extra modules?',
    modItems:[['portail','Werknemersportaal'],['sig','Elektronische handtekening'],['api','API / ERP-integratie']],
    current:'GESCHATTE HUIDIGE KOST',
    with:'MET AUREUS SOCIAL PRO',
    eco:'POTENTIËLE BESPARING',
    contact:'Neem contact op',
    contactSub:'voor een gratis offerte op maat',
    btn:'Mijn gratis offerte ontvangen →',
  },
  mig:{
    label:'Migratie', title:'Migreer in', italic:'7 dagen', suffix:' — geen 7 maanden',
    sub:'Een duidelijk, begeleid proces, zonder onderbreking van uw activiteit.',
    steps:[
      { n:1, p:'DAG 1–2', t:'Import & Analyse',
        d:'CSV-export vanuit uw huidige dienstverlener. Onze parser detecteert automatisch het formaat en importeert werknemers, contracten, loonhistorieken, verlofsaldo\'s.',
        tags:['📥 CSV-import','📊 Auto-analyse','✅ NISS-validatie'] },
      { n:2, p:'DAG 3–5', t:'Verificatie & Configuratie',
        d:'Kruiscontrole van alle geïmporteerde data: paritaire comités, barema\'s, ONSS-tarieven. Configuratie van portalen. Training van uw team (2 u).',
        tags:['🔍 Data-audit','⚙️ PC-config','🎓 Training 2 u'] },
      { n:3, p:'DAG 5–6', t:'Parallelle Loonadministratie',
        d:'Loonberekening parallel met uw oud systeem. Vergelijking fiche per fiche: bruto, ONSS, bedrijfsvoorheffing, netto. Verschil 0 € = migratie gevalideerd.',
        tags:['🗓️ Parallelle berekening','📊 Vergelijking','✅ Verschil 0 €'] },
      { n:'✓', p:'DAG 7', t:'Go Live!',
        d:'Definitieve overschakeling. Generatie van de eerste officiële loonfiches. Activatie DIMONA, DmfA, SEPA. Uw werknemers krijgen toegang tot het portaal. Prioriteitsondersteuning 30 dagen.',
        tags:['🚀 Productie','📡 DIMONA actief','🎉 We zijn er!'] },
    ],
    btn:'Migratie starten',
  },
  res:{
    label:'Resources', title:'Expertise', italic:'Belgische lonen',
    sub:'Praktische gidsen en analyses voor loonbeheerders in België.',
    items:[
      { cat:'FOUTEN & CONFORMITEIT', t:'De 10 duurste loonfouten in België',
        d:'Verkeerd paritair comité, slecht berekende bedrijfsvoorheffing, vergeten DIMONA… Ontdek de fouten die fiduciaires duizenden euro\'s kosten.', time:'8 min', date:'Februari 2026' },
      { cat:'VERGELIJKING', t:'Traditioneel sociaal secretariaat vs Aureus Social Pro: vergelijking 2026',
        d:'Tarieven, functies, technologie, ondersteuning. Objectieve punt-voor-punt analyse van twee radicaal verschillende benaderingen.', time:'12 min', date:'Februari 2026' },
      { cat:'TECHNISCHE GIDS', t:'Bedrijfsvoorheffing 2026: de complete gids voor beheerders',
        d:'Progressieve schijven, huwelijksquotiënt, kinderreducties, fiscale arbeidsbonus. Alles wat verandert in 2026.', time:'15 min', date:'Januari 2026' },
      { cat:'MIGRATIEGIDS', t:'Hoe migreer je van je sociaal secretariaat in 7 dagen',
        d:'Stap-voor-stap gids om uw traditioneel sociaal secretariaat te verlaten zonder één gegeven te verliezen.', time:'10 min', date:'Februari 2026' },
    ]
  },
  faq:{
    label:'FAQ', title:'Veelgestelde', italic:'vragen',
    sub:'Alles wat u moet weten voordat u begint.',
    items:[
      { q:'Is dit conform de Belgische wetgeving?', a:'Ja. Het platform integreert nativement de 166 paritaire comités (71 officiële roosters + 95 berekende), de sectorale barema\'s 2024–2026, en voldoet aan de ONSS XML-schema\'s voor Dimona en DmfA. De bedrijfsvoorheffing volgt Bijlage III KB. Automatische wettelijke updates.' },
      { q:'Hoe migreren vanuit een traditioneel sociaal secretariaat?', a:'Onze multi-format CSV-parser importeert automatisch uw data vanuit SD Worx, Partena, Securex of een andere dienstverlener. Het proces duurt 7 dagen: import → verificatie → go live. Toegewijde ondersteuning inbegrepen.' },
      { q:'Zijn de gegevens beveiligd?', a:'Ja. AES-256-GCM-versleuteling voor NISS en IBAN, Row Level Security Supabase (volledige multi-tenant isolatie), HSTS + CSP Headers, anti-brute force, geo-inbraakdetectie, OWASP ZAP CI/CD. AVG Art. 32 ingebouwd.' },
      { q:'Kan ik gratis testen?', a:'Ja. 30 dagen gratis proef, zonder creditcard, zonder verbintenis. Volledige toegang tot alle Pro-functies. Contacteer ons via info@aureus-ia.com.' },
      { q:'Is er een API voor mijn ERP / boekhoudsoftware?', a:'Ja. REST-API v1 met gedocumenteerde endpoints. HMAC-SHA256 Webhooks voor real-time integraties. Compatibel met BOB, WinBooks, Exact Online, Octopus, Horus.' },
      { q:'Werkt de applicatie op mobiel?', a:'Ja. PWA installeerbaar op iOS en Android. Push-notificaties, offline modus, responsive interface geoptimaliseerd voor alle schermen.' },
    ]
  },
  about:{
    label:'Over ons', title:'Expertise uit de praktijk,', italic:'een platform op maat.',
    p1:'Ik heb Aureus IA SPRL opgericht om een serieus alternatief te bieden voor de grote Belgische sociale secretariaten. Minder overheadkosten, meer reactiviteit, volledige beheersing van het Belgisch sociaal recht.',
    p2:'Het Aureus Social Pro-platform integreert nativement de 166 paritaire comités, de meest recente CAO\'s en verbindt rechtstreeks met de ONSS via Mahis.',
    stats:[{v:'42',l:'Beheerde bedrijven'},{v:'392',l:'ONSS-aangiften'},{v:'99.97%',l:'Uptime'}],
    expLabel:'Expertisedomeinen',
    exp:['Belgisch sociaal recht (PC 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Financiën','Opzegtermijn & C4','Regularisatie bedrijfsvoorheffing','Cafetariaplannen & ATN','Activa.brussels & bijdragen','AVG & gegevensbeveiliging'],
  },
  rev:{
    label:'Klaar om te beginnen?', title:'Sluit u aan bij de', italic:'revolutie', suffix:'van de Belgische loonverwerking',
    sub:'Zeg vaarwel aan verouderde software. Aureus Social Pro moderniseert uw sociaal secretariaat voor een fractie van de prijs.',
    btn1:'Gratis account aanmaken', btn2:'Ons contacteren',
  },
  footer:{
    desc:'Belgisch digitaal sociaal secretariaat van de nieuwe generatie. 132 modules, 166 PC, bankbeveiliging.',
    cols:[
      { t:'Product', items:['Functies','Tarieven','Migratie','Beveiliging','API'] },
      { t:'Resources', items:['Gidsen Belgische lonen','FAQ','Documentatie','Platformstatus'] },
      { t:'Juridisch', items:['Contact','Trust Center','Privacybeleid','Algemene voorwaarden'] },
    ],
    connect:'Inloggen →',
    copy:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · KBO BE 1028.230.781 — Brussel',
  },
};

/* ── EN ── */
T.en = {
  nav:{ connect:'Log in', items:[['Services','#services'],['Modules','#modules'],['About','#apropos']] },
  hero:{
    badge:'Version 18 — Live in production',
    by:'Aureus IA SPRL',
    h1:'Social administration,\nmanaged with',
    words:['precision.','compliance.','efficiency.','confidence.'],
    sub:'Independent consultant in social management and Belgian payroll. SPF-compliant payroll engine, automatic ONSS declarations, multi-tenant portals, bank-level security.',
    cta:'Access the platform →',
    contact:'Contact me',
  },
  stats:[
    { v:'166', l:'Joint committees' },
    { v:'132', l:'Deployed modules' },
    { v:'99.97%', l:'Platform uptime' },
    { v:'1 274', l:'Payslips calculated' },
  ],
  live:{
    status:'LIVE — Platform operational',
    items:[
      { v:'1 274', l:'PAYSLIPS CALCULATED' },
      { v:'42',    l:'COMPANIES MANAGED' },
      { v:'99.97%',l:'PLATFORM UPTIME' },
      { v:'392',   l:'ONSS DECLARATIONS SUBMITTED' },
    ]
  },
  svc:{
    label:'Services', title:'What I do for you.',
    items:[
      { n:'01', t:'Digital Social Secretariat', s:'Complete management of your Belgian payroll',
        d:'Dimona, DmfA, Belcotax, payslips — every social obligation handled with precision for your workers.',
        tags:['Dimona IN/OUT','Belcotax 281.10','Quarterly DmfA','166 JC'] },
      { n:'02', t:'HR & Social Consultancy', s:'Expertise in Belgian social law',
        d:'CDD/CDI contracts, dismissal procedures, notice period calculations, net salary optimisation.',
        tags:['JC 200','Claeys notice','Sector CCAs','GDPR social'] },
      { n:'03', t:'Salary Tax Optimisation', s:'Maximise net without increasing costs',
        d:'Meal vouchers, eco-vouchers, company car, cafeteria plan — I maximise your teams\' purchasing power.',
        tags:['Cafeteria plan','BIK car','CCA 90 bonus','Flexi-jobs'] },
      { n:'04', t:'Fiduciary Support', s:'Technical partner for accountants',
        d:'Migration from SD Worx / Partena / Securex, export integration WinBooks, BOB, Octopus.',
        tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-files'] },
    ]
  },
  modules:{
    label:'Features', title:'132 modules,', italic:'zero compromise',
    sub:'132 modules deployed in production, covering the complete Belgian payroll cycle — 44,246 lines of code.',
  },
  dash:{
    label:'Preview', title:'Discover the', italic:'interface',
    sub:'A real-time overview of the platform.',
    title2:'Dashboard — February 2026',
    cols:['EMPLOYEE','JC','GROSS','NET','STATUS'],
    status:['Calculated','Calculated','Pending','Calculated'],
  },
  comp:{
    label:'Comparison', title:'Why not the', italic:'others',
    sub:'Objective comparison with traditional solutions on the Belgian market.',
    cols:['Criterion','Aureus Social Pro','Large traditional SS','Regional SS'],
    rows:[
      ['Monthly fee (10 FTE)','Get a quote','€ 800–1 200','€ 600–900'],
      ['Modern interface (React / Next.js 15)','✓','✗','✗'],
      ['Public REST API','✓','✗','✗'],
      ['Employee portal included','✓','Paid option','Paid option'],
      ['Electronic signature','✓','✗','✗'],
      ['Mobile PWA','✓','✗','✗'],
      ['Multi-currency & expats','✓','✓','✓'],
      ['Concurrent import (migration)','✓','✗','✗'],
      ['Real-time webhooks','✓','✗','✗'],
      ['Continuous deployment','✓','Quarterly','Quarterly'],
    ]
  },
  sec:{ label:'Security', title:'Bank-level', italic:'security', sub:'4 layers of protection. GDPR Art. 32 native.' },
  portails:{
    label:'Multi-tenant', title:'Three portals,', italic:'one platform',
    sub:'Complete data isolation. Each user accesses exactly what they need.',
    items:[
      { icon:'🏢', t:'Accounting Firm', code:'?portal=admin',
        d:'Multi-client management, consolidated dashboards, firm invoicing, ONSS mandates, accounting exports.' },
      { icon:'🏭', t:'Employer Client', code:'?portal=client',
        d:'Dashboard, workers, payslips, declarations, documents, invoices.' },
      { icon:'👤', t:'Employee', code:'?portal=employee',
        d:'PDF payslips, leave requests, personal documents, information.' },
    ]
  },
  temo:{
    label:'Testimonials', title:'What our', italic:'beta-testers say',
    sub:'Feedback from the first fiduciaries to test the platform.',
    items:[
      { stars:5, text:'The interface is light-years ahead of what we used with our previous social secretariat. The payroll calculation is accurate, all 166 JCs are there, and the employee portal saves an enormous amount of time.', name:'Sophie V.', role:'Payroll Manager, Fiduciary Brussels', ini:'S' },
      { stars:5, text:'The DmfA XML is generated in one click, withholding tax is SPF-compliant, and payslips are flawless. We migrated 85 files from our previous provider in one week.', name:'Nathalie C.', role:'Senior Payroll Manager, Accounting Firm Liège', ini:'N' },
      { stars:5, text:'We pay 4× less than with our previous social secretariat and have more features. Belcotax, SEPA, DIMONA declarations — everything is automated. A real time-saver.', name:'Karim B.', role:'Payroll Manager, Social Secretariat Antwerp', ini:'K' },
    ]
  },
  tarifs:{
    label:'Pricing', title:'Transparent and', italic:'competitive',
    sub:'No hidden fees. No long-term commitment. 30-day free trial.',
    starter:{ nom:'Starter', contact:'Contact us', prix:'', desc:'Pricing adapted to your business',
      feats:['Complete payroll calculation','DmfA + Belcotax XML','Employee portal','PDF payslips','Document management','Email support'], btn:'Get started' },
    pro:{ nom:'Pro', badge:'POPULAR', contact:'Contact us', prix:'', desc:'All inclusive, get a quote',
      feats:['Everything in Starter','Automatic DIMONA + SEPA','Electronic signature','REST API + Webhooks','Advanced reporting','Multi-currency & expats','Concurrent import','Priority support'], btn:'Free trial 30 d' },
  },
  roi:{
    label:'ROI Calculator', title:'How much', italic:'do you save',
    sub:'Compare your current cost with Aureus Social Pro in a few clicks.',
    etp:'Number of employees (FTE)',
    provider:'Your current provider',
    mods:'Additional modules?',
    modItems:[['portail','Employee portal'],['sig','Electronic signature'],['api','API / ERP integration']],
    current:'ESTIMATED CURRENT COST',
    with:'WITH AUREUS SOCIAL PRO',
    eco:'POTENTIAL SAVINGS',
    contact:'Contact us',
    contactSub:'for a free personalised quote',
    btn:'Get my free quote →',
  },
  mig:{
    label:'Migration', title:'Migrate in', italic:'7 days', suffix:', not 7 months',
    sub:'A clear, guided process, without interrupting your activity.',
    steps:[
      { n:1, p:'DAY 1–2', t:'Import & Analysis',
        d:'CSV export from your current provider. Our parser automatically detects the format and imports employees, contracts, payroll history, leave balances.',
        tags:['📥 CSV import','📊 Auto analysis','✅ NISS validation'] },
      { n:2, p:'DAY 3–5', t:'Verification & Setup',
        d:'Cross-check of all imported data: joint committees, scales, ONSS rates. Portal configuration. Team training (2 h).',
        tags:['🔍 Data audit','⚙️ JC config','🎓 Training 2 h'] },
      { n:3, p:'DAY 5–6', t:'Parallel Payroll',
        d:'Payroll calculation in parallel with your old system. Payslip-by-payslip comparison: gross, ONSS, withholding, net. 0 € difference = migration validated.',
        tags:['🗓️ Parallel run','📊 Comparison','✅ 0 € difference'] },
      { n:'✓', p:'DAY 7', t:'Go Live!',
        d:'Final switch. Generation of first official payslips. DIMONA, DmfA, SEPA activation. Employees receive portal access. Priority support 30 days.',
        tags:['🚀 Production','📡 DIMONA active','🎉 We\'re live!'] },
    ],
    btn:'Start migration',
  },
  res:{
    label:'Resources', title:'Belgian payroll', italic:'expertise',
    sub:'Practical guides and analyses for payroll managers in Belgium.',
    items:[
      { cat:'ERRORS & COMPLIANCE', t:'The 10 most costly payroll errors in Belgium',
        d:'Wrong joint committee, miscalculated withholding tax, forgotten DIMONA… Discover the errors costing fiduciaries thousands of euros.', time:'8 min', date:'February 2026' },
      { cat:'COMPARISON', t:'Traditional social secretariat vs Aureus Social Pro: 2026 comparison',
        d:'Rates, features, technology, support. Objective point-by-point analysis of two radically different approaches.', time:'12 min', date:'February 2026' },
      { cat:'TECHNICAL GUIDE', t:'Professional withholding tax 2026: the complete guide for managers',
        d:'Progressive brackets, spousal quotient, child reductions, fiscal employment bonus. Everything changing in 2026.', time:'15 min', date:'January 2026' },
      { cat:'MIGRATION GUIDE', t:'How to migrate from your social secretariat in 7 days',
        d:'Step-by-step guide to leaving your traditional social secretariat without losing a single piece of data and without payroll interruption.', time:'10 min', date:'February 2026' },
    ]
  },
  faq:{
    label:'FAQ', title:'Frequently asked', italic:'questions',
    sub:'Everything you need to know before getting started.',
    items:[
      { q:'Is it compliant with Belgian legislation?', a:'Yes. The platform natively integrates the 166 joint committees (71 official grids + 95 calculated), sector scales 2024–2026, and conforms to ONSS XML schemas for Dimona and DmfA. Professional withholding tax follows Annex III RD. Automatic legal updates.' },
      { q:'How to migrate from a traditional social secretariat?', a:'Our multi-format CSV parser automatically imports your data from SD Worx, Partena, Securex or any other provider. The process takes 7 days: import → verification → go live. Dedicated support included.' },
      { q:'Is data secure?', a:'Yes. AES-256-GCM encryption for NISS and IBAN, Supabase Row Level Security (full multi-tenant isolation), HSTS + CSP Headers, anti-brute force, geo-intrusion detection, OWASP ZAP CI/CD. GDPR Art. 32 native.' },
      { q:'Can I test for free?', a:'Yes. 30-day free trial, no credit card, no commitment. Full access to all Pro features. Contact us at info@aureus-ia.com to get started.' },
      { q:'Is there an API for my ERP / accounting software?', a:'Yes. REST API v1 with documented endpoints. HMAC-SHA256 Webhooks for real-time integrations. Compatible with BOB, WinBooks, Exact Online, Octopus, Horus.' },
      { q:'Does the application work on mobile?', a:'Yes. PWA installable on iOS and Android. Push notifications, offline mode, responsive interface optimised for all screens.' },
    ]
  },
  about:{
    label:'About', title:'Field expertise,', italic:'a bespoke platform.',
    p1:'I founded Aureus IA SPRL to offer a serious alternative to the large Belgian social secretariats. Lower overhead, greater responsiveness, total mastery of Belgian social law.',
    p2:'The Aureus Social Pro platform natively integrates the 166 joint committees, the latest CCAs and connects directly to the ONSS via Mahis.',
    stats:[{v:'42',l:'Companies managed'},{v:'392',l:'ONSS declarations'},{v:'99.97%',l:'Uptime'}],
    expLabel:'Areas of expertise',
    exp:['Belgian social law (JC 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finance','Notice period & C4','Withholding tax regularisation','Cafeteria plans & BIK','Activa.brussels & grants','GDPR & data security'],
  },
  rev:{
    label:'Ready to start?', title:'Join the', italic:'revolution', suffix:'of Belgian payroll',
    sub:'Say goodbye to obsolete software. Aureus Social Pro modernises your social secretariat for a fraction of the price.',
    btn1:'Create a free account', btn2:'Contact us',
  },
  footer:{
    desc:'Next-generation Belgian digital social secretariat. 132 modules, 166 JCs, bank-level security.',
    cols:[
      { t:'Product', items:['Features','Pricing','Migration','Security','API'] },
      { t:'Resources', items:['Belgian payroll guides','FAQ','Documentation','Platform status'] },
      { t:'Legal', items:['Contact','Trust Centre','Privacy Policy','Terms of Use'] },
    ],
    connect:'Log in →',
    copy:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Brussels',
  },
};

/* ── DE ── */
T.de = {
  nav:{ connect:'Anmelden', items:[['Dienstleistungen','#services'],['Module','#modules'],['Über uns','#apropos']] },
  hero:{
    badge:'Version 18 — Live in Produktion',
    by:'Aureus IA SPRL',
    h1:'Sozialverwaltung,\nverwaltet mit',
    words:['Präzision.','Konformität.','Effizienz.','Vertrauen.'],
    sub:'Unabhängiger Berater für Sozialverwaltung und belgische Lohnbuchhaltung. SPF-konformes Lohnberechnungssystem, automatische ONSS-Meldungen, Multi-Tenant-Portale, Banksicherheit.',
    cta:'Zugang zur Plattform →',
    contact:'Kontakt aufnehmen',
  },
  stats:[
    { v:'166', l:'Paritätische Ausschüsse' },
    { v:'132', l:'Eingesetzte Module' },
    { v:'99.97%', l:'Plattform-Uptime' },
    { v:'1 274', l:'Berechnete Lohnzettel' },
  ],
  live:{
    status:'LIVE — Plattform betriebsbereit',
    items:[
      { v:'1 274', l:'BERECHNETE LOHNZETTEL' },
      { v:'42',    l:'VERWALTETE UNTERNEHMEN' },
      { v:'99.97%',l:'PLATTFORM-UPTIME' },
      { v:'392',   l:'EINGEREICHTE ONSS-MELDUNGEN' },
    ]
  },
  svc:{
    label:'Dienstleistungen', title:'Was ich für Sie tue.',
    items:[
      { n:'01', t:'Digitales Sozialsekretariat', s:'Vollständige Verwaltung Ihrer belgischen Lohnabrechnung',
        d:'Dimona, DmfA, Belcotax, Lohnzettel — jede Sozialverpflichtung präzise für Ihre Arbeitnehmer bearbeitet.',
        tags:['Dimona IN/OUT','Belcotax 281.10','Vierteljährlich DmfA','166 PA'] },
      { n:'02', t:'HR & Sozialberatung', s:'Expertise im belgischen Sozialrecht',
        d:'CDD/CDI-Verträge, Kündigungsverfahren, Berechnung von Kündigungsfristen, Optimierung des Nettogehalts.',
        tags:['PA 200','Claeys-Frist','Sektor-KAV','DSGVO sozial'] },
      { n:'03', t:'Lohnsteueroptimierung', s:'Netto maximieren ohne höhere Kosten',
        d:'Essensgutscheine, Öko-Gutscheine, Firmenwagen, Cafeteriaplan — ich maximiere die Kaufkraft Ihrer Teams.',
        tags:['Cafeteriaplan','Geldwerter Vorteil','KAV-90-Bonus','Flexi-Jobs'] },
      { n:'04', t:'Unterstützung für Treuhänder', s:'Technischer Partner für Buchhalter',
        d:'Migration von SD Worx / Partena / Securex, Export-Integration WinBooks, BOB, Octopus.',
        tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-Dateien'] },
    ]
  },
  modules:{
    label:'Funktionen', title:'132 Module,', italic:'null Kompromisse',
    sub:'132 Module in der Produktion eingesetzt, den gesamten belgischen Lohnzyklus abdeckend — 44 246 Codezeilen.',
  },
  dash:{
    label:'Vorschau', title:'Entdecken Sie die', italic:'Oberfläche',
    sub:'Eine Echtzeit-Vorschau der Plattform.',
    title2:'Dashboard — Februar 2026',
    cols:['MITARBEITER','PA','BRUTTO','NETTO','STATUS'],
    status:['Berechnet','Berechnet','Ausstehend','Berechnet'],
  },
  comp:{
    label:'Vergleich', title:'Warum nicht die', italic:'anderen',
    sub:'Objektiver Vergleich mit traditionellen Lösungen auf dem belgischen Markt.',
    cols:['Kriterium','Aureus Social Pro','Großes traditionelles SS','Regionales SS'],
    rows:[
      ['Monatstarif (10 VZÄ)','Auf Anfrage','€ 800–1 200','€ 600–900'],
      ['Moderne Oberfläche (React / Next.js 15)','✓','✗','✗'],
      ['Öffentliche REST-API','✓','✗','✗'],
      ['Mitarbeiterportal inbegriffen','✓','Kostenpflichtige Option','Kostenpflichtige Option'],
      ['Elektronische Signatur','✓','✗','✗'],
      ['Mobiles PWA','✓','✗','✗'],
      ['Multi-Währung & Expats','✓','✓','✓'],
      ['Gleichzeitiger Import (Migration)','✓','✗','✗'],
      ['Echtzeit-Webhooks','✓','✗','✗'],
      ['Kontinuierliches Deployment','✓','Vierteljährlich','Vierteljährlich'],
    ]
  },
  sec:{ label:'Sicherheit', title:'Sicherheit auf', italic:'Bankniveau', sub:'4 Schutzschichten. DSGVO Art. 32 nativ.' },
  portails:{
    label:'Multi-Tenant', title:'Drei Portale,', italic:'eine Plattform',
    sub:'Vollständige Datenisolierung. Jeder Benutzer greift auf genau das zu, was er braucht.',
    items:[
      { icon:'🏢', t:'Kanzlei / Treuhänder', code:'?portal=admin',
        d:'Multi-Kundenverwaltung, konsolidierte Dashboards, Kanzleifakturierung, ONSS-Mandate, Buchhaltungsexporte.' },
      { icon:'🏭', t:'Arbeitgeber-Kunde', code:'?portal=client',
        d:'Dashboard, Arbeitnehmer, Lohnzettel, Meldungen, Dokumente, Rechnungen.' },
      { icon:'👤', t:'Mitarbeiter', code:'?portal=employee',
        d:'PDF-Lohnzettel, Urlaubsanträge, persönliche Dokumente, Informationen.' },
    ]
  },
  temo:{
    label:'Erfahrungsberichte', title:'Was unsere', italic:'Beta-Tester sagen',
    sub:'Rückmeldungen der ersten Treuhänder, die die Plattform getestet haben.',
    items:[
      { stars:5, text:'Die Oberfläche ist Lichtjahre dem voraus, was wir mit unserem früheren Sozialsekretariat verwendet haben. Die Lohnberechnung ist präzise, alle 166 PA sind vorhanden, und das Mitarbeiterportal spart enorm viel Zeit.', name:'Sophie V.', role:'Lohnbuchhalterin, Treuhänder Brüssel', ini:'S' },
      { stars:5, text:'Das DmfA-XML wird mit einem Klick generiert, die Lohnsteuer ist SPF-konform und die Lohnzettel sind makellos. Wir haben 85 Dateien in einer Woche migriert.', name:'Nathalie C.', role:'Senior-Lohnbuchhalterin, Buchhaltungskanzlei Lüttich', ini:'N' },
      { stars:5, text:'Wir zahlen 4× weniger als bei unserem früheren Sozialsekretariat und haben mehr Funktionen. Belcotax, SEPA, DIMONA-Meldungen — alles ist automatisiert. Echte Zeitersparnis.', name:'Karim B.', role:'Lohnbuchhalter, Sozialsekretariat Antwerpen', ini:'K' },
    ]
  },
  tarifs:{
    label:'Preise', title:'Transparent und', italic:'wettbewerbsfähig',
    sub:'Keine versteckten Kosten. Keine langfristige Bindung. 30 Tage kostenlose Testversion.',
    starter:{ nom:'Starter', contact:'Kontakt aufnehmen', prix:'', desc:'Preis angepasst an Ihr Unternehmen',
      feats:['Vollständige Lohnberechnung','DmfA + Belcotax XML','Mitarbeiterportal','PDF-Lohnzettel','Dokumentenverwaltung','E-Mail-Support'], btn:'Beginnen' },
    pro:{ nom:'Pro', badge:'BELIEBT', contact:'Kontakt aufnehmen', prix:'', desc:'Alles inklusive, auf Anfrage',
      feats:['Alles von Starter inklusive','Automatisches DIMONA + SEPA','Elektronische Signatur','REST-API + Webhooks','Erweiterte Berichterstattung','Multi-Währung & Expats','Gleichzeitiger Import','Prioritätssupport'], btn:'Kostenlose Testversion 30 T' },
  },
  roi:{
    label:'ROI-Rechner', title:'Wie viel', italic:'sparen Sie',
    sub:'Vergleichen Sie Ihre aktuellen Kosten mit Aureus Social Pro in wenigen Klicks.',
    etp:'Anzahl Mitarbeiter (VZÄ)',
    provider:'Ihr aktueller Anbieter',
    mods:'Zusätzliche Module?',
    modItems:[['portail','Mitarbeiterportal'],['sig','Elektronische Signatur'],['api','API / ERP-Integration']],
    current:'GESCHÄTZTE AKTUELLE KOSTEN',
    with:'MIT AUREUS SOCIAL PRO',
    eco:'POTENZIELLE EINSPARUNGEN',
    contact:'Kontaktieren Sie uns',
    contactSub:'für ein kostenloses individuelles Angebot',
    btn:'Mein kostenloses Angebot →',
  },
  mig:{
    label:'Migration', title:'Migrieren in', italic:'7 Tagen', suffix:' — nicht 7 Monaten',
    sub:'Ein klarer, begleiteter Prozess, ohne Unterbrechung Ihrer Tätigkeit.',
    steps:[
      { n:1, p:'TAG 1–2', t:'Import & Analyse',
        d:'CSV-Export von Ihrem aktuellen Anbieter. Unser Parser erkennt das Format automatisch und importiert Mitarbeiter, Verträge, Lohnhistorien, Urlaubsguthaben.',
        tags:['📥 CSV-Import','📊 Auto-Analyse','✅ NISS-Validierung'] },
      { n:2, p:'TAG 3–5', t:'Überprüfung & Konfiguration',
        d:'Kreuzprüfung aller importierten Daten: paritätische Ausschüsse, Lohnskalen, ONSS-Sätze. Portalskonfiguration. Schulung Ihres Teams (2 h).',
        tags:['🔍 Daten-Audit','⚙️ PA-Konfig','🎓 Schulung 2 h'] },
      { n:3, p:'TAG 5–6', t:'Parallele Lohnabrechnung',
        d:'Lohnberechnung parallel zu Ihrem alten System. Lohnzettel-für-Lohnzettel-Vergleich: Brutto, ONSS, Quellensteuer, Netto. Differenz 0 € = Migration validiert.',
        tags:['🗓️ Parallellauf','📊 Vergleich','✅ Differenz 0 €'] },
      { n:'✓', p:'TAG 7', t:'Go Live!',
        d:'Endgültige Umstellung. Erste offizielle Lohnzettel. DIMONA-, DmfA-, SEPA-Aktivierung. Mitarbeiterzugang zum Portal. Prioritätssupport 30 Tage.',
        tags:['🚀 Produktion','📡 DIMONA aktiv','🎉 Los geht\'s!'] },
    ],
    btn:'Migration starten',
  },
  res:{
    label:'Ressourcen', title:'Expertise', italic:'belgische Lohnabrechnung',
    sub:'Praktische Leitfäden und Analysen für Lohnbuchhalter in Belgien.',
    items:[
      { cat:'FEHLER & KONFORMITÄT', t:'Die 10 teuersten Lohnfehler in Belgien',
        d:'Falscher paritätischer Ausschuss, falsch berechnete Quellensteuer, vergessene DIMONA… Entdecken Sie die Fehler, die Treuhändern tausende Euro kosten.', time:'8 Min.', date:'Februar 2026' },
      { cat:'VERGLEICH', t:'Traditionelles Sozialsekretariat vs. Aureus Social Pro: Vergleich 2026',
        d:'Tarife, Funktionen, Technologie, Support. Objektive Punkt-für-Punkt-Analyse zweier radikal unterschiedlicher Ansätze.', time:'12 Min.', date:'Februar 2026' },
      { cat:'TECHNISCHER LEITFADEN', t:'Lohnsteuer 2026: der vollständige Leitfaden für Manager',
        d:'Progressive Steuerklassen, Ehegattenquotient, Kinderermäßigungen, fiskaler Beschäftigungsbonus. Alles, was sich 2026 ändert.', time:'15 Min.', date:'Januar 2026' },
      { cat:'MIGRATIONSLEITFADEN', t:'Wie man in 7 Tagen von seinem Sozialsekretariat migriert',
        d:'Schritt-für-Schritt-Anleitung ohne Datenverlust und ohne Lohnunterbrechung.', time:'10 Min.', date:'Februar 2026' },
    ]
  },
  faq:{
    label:'FAQ', title:'Häufig gestellte', italic:'Fragen',
    sub:'Alles, was Sie vor dem Start wissen müssen.',
    items:[
      { q:'Ist es konform mit der belgischen Gesetzgebung?', a:'Ja. Die Plattform integriert nativ die 166 paritätischen Ausschüsse (71 offizielle Gitter + 95 berechnete), die sektoralen Lohnskalen 2024–2026 und entspricht den ONSS-XML-Schemata für Dimona und DmfA. Die Lohnsteuer folgt Anhang III KB. Automatische Rechtsupdates.' },
      { q:'Wie von einem traditionellen Sozialsekretariat migrieren?', a:'Unser Multi-Format-CSV-Parser importiert automatisch Ihre Daten von SD Worx, Partena, Securex oder einem anderen Anbieter. Der Prozess dauert 7 Tage: Import → Überprüfung → Go Live. Dedizierter Support inklusive.' },
      { q:'Sind die Daten sicher?', a:'Ja. AES-256-GCM-Verschlüsselung für NISS und IBAN, Supabase Row Level Security (vollständige Multi-Tenant-Isolierung), HSTS + CSP-Header, Anti-Brute-Force, Geo-Intrusion-Erkennung, OWASP ZAP CI/CD. DSGVO Art. 32 nativ.' },
      { q:'Kann ich kostenlos testen?', a:'Ja. 30 Tage kostenlose Testversion, ohne Kreditkarte, ohne Verpflichtung. Vollständiger Zugriff auf alle Pro-Funktionen. Kontaktieren Sie uns unter info@aureus-ia.com.' },
      { q:'Gibt es eine API für mein ERP / meine Buchhaltungssoftware?', a:'Ja. REST-API v1 mit dokumentierten Endpunkten. HMAC-SHA256-Webhooks für Echtzeit-Integrationen. Kompatibel mit BOB, WinBooks, Exact Online, Octopus, Horus.' },
      { q:'Funktioniert die Anwendung auf Mobilgeräten?', a:'Ja. PWA auf iOS und Android installierbar. Push-Benachrichtigungen, Offline-Modus, responsive Oberfläche für alle Bildschirme.' },
    ]
  },
  about:{
    label:'Über uns', title:'Praxisnahe Expertise,', italic:'eine maßgeschneiderte Plattform.',
    p1:'Ich habe Aureus IA SPRL gegründet, um eine ernsthafte Alternative zu den großen belgischen Sozialsekretariaten anzubieten. Weniger Gemeinkosten, mehr Reaktivität, vollständige Beherrschung des belgischen Sozialrechts.',
    p2:'Die Aureus Social Pro-Plattform integriert nativ die 166 paritätischen Ausschüsse, die aktuellen KAV und verbindet sich direkt mit der ONSS über Mahis.',
    stats:[{v:'42',l:'Verwaltete Unternehmen'},{v:'392',l:'ONSS-Meldungen'},{v:'99.97%',l:'Uptime'}],
    expLabel:'Fachgebiete',
    exp:['Belgisches Sozialrecht (PA 100–375)','ONSS / Mahis / Dimona','Belcotax & SPF Finanzen','Kündigungsfrist & C4','Quellensteuer-Regularisierung','Cafeteriapläne & Geldwerter Vorteil','Activa.brussels & Beiträge','DSGVO & Datensicherheit'],
  },
  rev:{
    label:'Bereit anzufangen?', title:'Schließen Sie sich der', italic:'Revolution', suffix:'der belgischen Lohnabrechnung an',
    sub:'Verabschieden Sie sich von veralteter Software. Aureus Social Pro modernisiert Ihr Sozialsekretariat zu einem Bruchteil des Preises.',
    btn1:'Kostenloses Konto erstellen', btn2:'Uns kontaktieren',
  },
  footer:{
    desc:'Belgisches digitales Sozialsekretariat der neuen Generation. 132 Module, 166 PA, Banksicherheit.',
    cols:[
      { t:'Produkt', items:['Funktionen','Preise','Migration','Sicherheit','API'] },
      { t:'Ressourcen', items:['Belgische Lohnleitfäden','FAQ','Dokumentation','Plattformstatus'] },
      { t:'Rechtliches', items:['Kontakt','Trust Center','Datenschutz','AGB'] },
    ],
    connect:'Anmelden →',
    copy:'AUREUS SOCIAL PRO © 2026 · Aureus IA SPRL · BCE BE 1028.230.781 — Brüssel',
  },
};

/* ── CONSTANTES (fixes, pas traduites) ──────────────────────── */
const MODULES_DATA = [
  { icon:'🧮', t:'Calcul de Paie Complet', d:'Brut→Net, ONSS 13.07 %, PP 16 paramètres, barèmes 2024–2026' },
  { icon:'📡', t:'DIMONA Électronique', d:'IN/OUT/UPDATE XML, validation, suivi statut ONSS' },
  { icon:'📋', t:'DmfA XML ONSS', d:'Trimestres Q1–Q4, réduction structurelle, bonus emploi' },
  { icon:'📊', t:'Belcotax XML', d:'Fiches 281.10/20/30 conformes SPF Finances' },
  { icon:'🏦', t:'SEPA pain.001', d:'Virements batch ISO 20022, validation IBAN' },
  { icon:'✍️', t:'Signature Électronique', d:'Yousign + DocuSign : contrats, avenants, webhook' },
  { icon:'🌍', t:'Multi-devise & Expats', d:'11 devises, détachements A1, indemnités expatriés' },
  { icon:'📱', t:'PWA Mobile', d:'Installable iOS/Android, push notifs, mode offline' },
  { icon:'🔗', t:'API REST & Webhooks', d:'Endpoints v1, HMAC-SHA256, BOB/WinBooks/Horus' },
  { icon:'📧', t:'5 E-mails Automatiques', d:'Fiche, récapitulatif, alerte, rappel, facture' },
  { icon:'📁', t:'GED Documents', d:'8 catégories, rétention légale, Supabase Storage' },
  { icon:'⚖️', t:'65 Procédures RH', d:'Embauche, licenciement, absences, congés, pension…' },
  { icon:'🧾', t:'Facturation Cabinet', d:'Factures automatiques par ETP ou forfait, suivi MRR' },
  { icon:'📉', t:'Précompte Professionnel', d:'Annexe III AR, 16 paramètres, taxe communale' },
  { icon:'🏖️', t:'Pécule de Vacances', d:'Employé + ouvrier, prorata, provisions, C4-Vac' },
  { icon:'⚖️', t:'Solde de Tout Compte', d:'Préavis, indemnités, vacances de sortie, C4' },
  { icon:'🔔', t:'Alertes Intelligentes', d:'Échéances, calendrier social, règles légales' },
  { icon:'⚙️', t:'Admin Barèmes', d:'Constantes légales modifiables sans code, RMMMG auto' },
  { icon:'📈', t:'Reporting Avancé', d:'Bilan social BNB, analytics RH, exports multi-formats' },
  { icon:'📥', t:'Import Concurrent', d:'Parseurs CSV multi-format SD Worx / Partena / Securex' },
  { icon:'💰', t:'99 Types de Primes', d:'CCT 90, plan cafétéria, warrants, avantages en nature…' },
  { icon:'🔒', t:'Sécurité Bancaire', d:'AES-256-GCM, RLS, HSTS, OWASP ZAP CI/CD, 2FA' },
];

const SECURITY_DATA = [
  { icon:'🔑', t:'Chiffrement AES-256-GCM', d:'NISS et IBAN chiffrés au repos et en transit. Clés rotatives.' },
  { icon:'🛡️', t:'HSTS + CSP Headers', d:'Strict Transport Security max-age 2 ans, CSP restrictive.' },
  { icon:'🔒', t:'Row Level Security', d:'Isolation multi-tenant Supabase. Chaque client voit uniquement ses données.' },
  { icon:'🚫', t:'Anti-Brute Force', d:'Rate limit 60 req/min, blocage 30 min après 5 échecs.' },
  { icon:'🌐', t:'Détection Géo-Intrusion', d:'Alerte DPO si connexion depuis pays inhabituel.' },
  { icon:'📋', t:'IP Whitelist + CIDR', d:'Restriction par adresse IP et plage CIDR. Interface admin.' },
  { icon:'🔍', t:'OWASP ZAP CI/CD', d:'Scan automatique à chaque déploiement + scan hebdomadaire.' },
];

/* ── HOOKS ── */
function useInView(t=0.08){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:t});
    if(ref.current)o.observe(ref.current);return()=>o.disconnect();
  },[]);
  return[ref,v];
}

const Tag=({c})=>(
  <span style={{display:'inline-block',padding:'3px 10px',borderRadius:3,border:`1px solid ${G}30`,background:`${G}08`,fontSize:10,color:G2,letterSpacing:'.5px',fontFamily:'monospace'}}>{c}</span>
);

function Fade({children,delay=0,dir='up'}){
  const[ref,v]=useInView();
  const tr=dir==='up'?'translateY(24px)':dir==='left'?'translateX(-24px)':'translateX(24px)';
  return(
    <div ref={ref} style={{opacity:v?1:0,transform:v?'none':tr,transition:`all .7s ease ${delay}s`}}>
      {children}
    </div>
  );
}

/* ── PAGE ── */
export default function LandingPage(){
  const[lang,setLang]=useState('fr');
  const t=T[lang];
  const go=()=>{window.location.href='/';};

  /* hero words rotation */
  const[tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(p=>(p+1)%4),3200);return()=>clearInterval(id);},[]);

  /* ROI */
  const[etp,setEtp]=useState(30);
  const[prov,setProv]=useState('Grand SS');
  const[mods,setMods]=useState({portail:true,sig:false,api:false});
  const RATES={'Grand SS':95,'SS régional':75,'Petit SS':60,'Legacy':50};
  const cost=Math.round(etp*RATES[prov]*(1+(mods.portail?.15:0)+(mods.sig?.12:0)+(mods.api?.08:0)));

  /* FAQ */
  const[faq,setFaq]=useState(null);

  return(
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${BG};color:${W};font-family:Georgia,'Times New Roman',serif;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.5);}}
        @keyframes scrolldown{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(10px);}}
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:${BG};}
        ::-webkit-scrollbar-thumb{background:${G}40;border-radius:2px;}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);}
        .gft{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;}
        @media(max-width:900px){
          .g2,.g3,.gft{grid-template-columns:1fr!important;}
          .g4{grid-template-columns:repeat(2,1fr)!important;}
          .svcg{grid-template-columns:1fr!important;}
        }
        @media(max-width:600px){.g4{grid-template-columns:1fr 1fr!important;}}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'11px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',background:`${BG}e8`,backdropFilter:'blur(18px)',borderBottom:`1px solid ${G}12`}}>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontSize:14,fontWeight:900,color:G,letterSpacing:'2px'}}>AUREUS</span>
          <span style={{fontSize:9,color:W2,letterSpacing:'3px'}}>SOCIAL PRO</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          {t.nav.items.map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:10,color:W2,textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase',transition:'color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=G} onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</a>
          ))}
          <div style={{display:'flex',gap:3}}>
            {['fr','nl','en','de'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:'4px 8px',borderRadius:3,border:`1px solid ${lang===l?G:`${G}20`}`,background:lang===l?`${G}20`:'transparent',color:lang===l?G:W2,fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:lang===l?800:400,letterSpacing:'1px',textTransform:'uppercase',transition:'all .2s'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={go} style={{padding:'8px 16px',borderRadius:3,border:`1px solid ${G}40`,background:`${G}10`,color:G,fontSize:10,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=BG;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.color=G;}}>
            {t.nav.connect}
          </button>
        </div>
      </nav>

      <div style={{paddingTop:64}}>

        {/* ── HERO ── */}
        <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',padding:'80px 24px 60px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 80% 60% at 50% 40%,${G}12 0%,transparent 70%)`}}/>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:32,padding:'5px 16px',borderRadius:999,border:`1px solid ${G}30`,background:`${G}08`,fontSize:10,color:G2,letterSpacing:'1.5px',textTransform:'uppercase'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'pulse 2s infinite'}}/>
            {t.hero.badge}
          </div>
          <div style={{fontSize:11,color:W2,letterSpacing:'4px',textTransform:'uppercase',marginBottom:12}}>{t.hero.by}</div>
          <h1 style={{fontSize:'clamp(30px,5.5vw,66px)',fontWeight:900,lineHeight:1.05,letterSpacing:'-2px',maxWidth:860,background:`linear-gradient(135deg,${W} 30%,${G} 55%,${W} 85%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',whiteSpace:'pre-line',marginBottom:8}}>
            {t.hero.h1}
          </h1>
          <div style={{fontSize:'clamp(30px,5.5vw,66px)',fontWeight:900,color:G,letterSpacing:'-2px',height:'1.15em',marginBottom:26,position:'relative',width:'100%',maxWidth:860}}>
            {t.hero.words.map((w,i)=>(
              <span key={w} style={{position:'absolute',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',opacity:i===tick%4?1:0,transition:'opacity .6s ease'}}>{w}</span>
            ))}
          </div>
          <p style={{fontSize:15,color:W2,maxWidth:580,lineHeight:1.8,marginBottom:40}}>{t.hero.sub}</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
            <button onClick={go} style={{padding:'14px 34px',borderRadius:4,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:12,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',boxShadow:`0 0 40px ${G}40`,transition:'all .3s',fontFamily:'inherit'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{t.hero.cta}</button>
            <a href="mailto:info@aureus-ia.com" style={{padding:'14px 34px',borderRadius:4,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:12,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s',display:'flex',alignItems:'center'}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>{t.hero.contact}</a>
          </div>
          <div style={{position:'absolute',bottom:32,left:'50%',animation:'bounce 2s infinite'}}>
            <div style={{width:22,height:36,border:`2px solid ${G}25`,borderRadius:11,display:'flex',justifyContent:'center',paddingTop:6}}>
              <div style={{width:3,height:7,borderRadius:2,background:G,animation:'scrolldown 2s infinite'}}/>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{padding:'48px 24px'}}>
          <div style={{maxWidth:900,margin:'0 auto',border:`1px solid ${G}15`,overflow:'hidden'}} className="g4">
            {t.stats.map((s,i)=>(
              <Fade key={i} delay={i*.1}>
                <div style={{padding:'30px 16px',textAlign:'center',borderRight:i<3?`1px solid ${G}15`:'none'}}>
                  <div style={{fontSize:'clamp(22px,3.5vw,38px)',fontWeight:900,color:G,letterSpacing:'-1px',lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:10,color:W2,marginTop:7,letterSpacing:'1px',textTransform:'uppercase'}}>{s.l}</div>
                </div>
              </Fade>
            ))}
          </div>
        </section>

        {/* ── LIVE ── */}
        <section style={{padding:'48px 24px',background:`${G}04`}}>
          <div style={{maxWidth:760,margin:'0 auto'}}>
            <Fade>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24,justifyContent:'center'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite',display:'inline-block'}}/>
                <span style={{fontSize:10,color:'#22c55e',letterSpacing:'3px',textTransform:'uppercase'}}>{t.live.status}</span>
              </div>
            </Fade>
            {t.live.items.map((item,i)=>(
              <Fade key={i} delay={i*.08} dir='left'>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',borderBottom:`1px solid ${G}10`}}>
                  <span style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase'}}>{item.l}</span>
                  <span style={{fontSize:'clamp(24px,4vw,38px)',fontWeight:900,color:G,letterSpacing:'-1px'}}>{item.v}</span>
                </div>
              </Fade>
            ))}
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1060,margin:'0 auto'}}>
            <Fade>
              <div style={{marginBottom:48}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.svc.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',lineHeight:1.1}}>{t.svc.title}</h2>
              </div>
            </Fade>
            {t.svc.items.map((s,i)=>(
              <Fade key={i} delay={.08+i*.08} dir='left'>
                <div className="svcg" style={{borderTop:`1px solid ${G}15`,padding:'36px 0',display:'grid',gridTemplateColumns:'60px 1fr 1fr',gap:24,alignItems:'start',transition:'background .3s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${G}03`}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{fontSize:11,color:G3,fontFamily:'monospace',paddingTop:4}}>{s.n}</div>
                  <div>
                    <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:6}}>{s.s}</div>
                    <h3 style={{fontSize:'clamp(16px,2.5vw,22px)',fontWeight:700,color:W,letterSpacing:'-.5px'}}>{s.t}</h3>
                  </div>
                  <div>
                    <p style={{fontSize:13,color:W2,lineHeight:1.75,marginBottom:12}}>{s.d}</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{s.tags.map(tg=><Tag key={tg} c={tg}/>)}</div>
                  </div>
                </div>
              </Fade>
            ))}
            <div style={{borderTop:`1px solid ${G}15`}}/>
          </div>
        </section>

        {/* ── MODULES ── */}
        <section id="modules" style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:1060,margin:'0 auto'}}>
            <Fade>
              <div style={{marginBottom:36}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.modules.label}</div>
                <h2 style={{fontSize:'clamp(24px,4.5vw,50px)',fontWeight:900,color:W,letterSpacing:'-2px',lineHeight:1.05,marginBottom:6}}>
                  {t.modules.title} <span style={{color:G,fontStyle:'italic'}}>{t.modules.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.modules.sub}</p>
              </div>
            </Fade>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:9}}>
              {MODULES_DATA.map((m,i)=>(
                <Fade key={i} delay={.02+i*.025}>
                  <div style={{padding:'16px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}04`,display:'flex',gap:11,alignItems:'flex-start',transition:'border-color .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=`${G}30`}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=`${G}12`}>
                    <span style={{fontSize:17,flexShrink:0}}>{m.icon}</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:W,marginBottom:2}}>{m.t}</div>
                      <div style={{fontSize:10,color:W2,lineHeight:1.5}}>{m.d}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD ── */}
        <section style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>
            <Fade>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {t.dash.label}</div>
              <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                {t.dash.title}<span style={{color:G,fontStyle:'italic'}}>{t.dash.italic}</span>
              </h2>
              <p style={{fontSize:13,color:W2,marginBottom:32}}>{t.dash.sub}</p>
            </Fade>
            <Fade delay={.2}>
              <div style={{border:`1px solid ${G}20`,borderRadius:8,overflow:'hidden'}}>
                <div style={{background:'#1a1914',padding:'9px 14px',display:'flex',alignItems:'center',gap:7,borderBottom:`1px solid ${G}15`}}>
                  {['#ff5f57','#febc2e','#28c840'].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:'50%',background:c,display:'inline-block'}}/>)}
                  <div style={{marginLeft:8,background:'#0d0c10',borderRadius:4,padding:'3px 10px',display:'flex',alignItems:'center',gap:5}}>
                    <span style={{fontSize:9}}>🔒</span>
                    <span style={{fontSize:10,color:W2}}>app.aureussocial.be</span>
                  </div>
                </div>
                <div style={{background:'#0d0c10',padding:'18px',textAlign:'left'}}>
                  <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:16}}>📊 {t.dash.title2}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9,marginBottom:18}}>
                    {[{v:'€ 127 450',l:'MASSE SALARIALE'},{v:'42',l:'TRAVAILLEURS'},{v:'€ 16 629',l:'ONSS PATRONAL'}].map((c,i)=>(
                      <div key={i} style={{background:'#1a1914',padding:'13px',borderRadius:5,border:`1px solid ${G}15`}}>
                        <div style={{fontSize:'clamp(13px,2vw,18px)',fontWeight:900,color:G,lineHeight:1.1}}>{c.v}</div>
                        <div style={{fontSize:8,color:W2,marginTop:3,letterSpacing:'1px'}}>{c.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'#1a1914',borderRadius:5,overflow:'hidden',border:`1px solid ${G}15`}}>
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'7px 12px',borderBottom:`1px solid ${G}10`}}>
                      {t.dash.cols.map(h=><span key={h} style={{fontSize:8,color:W2,letterSpacing:'1px'}}>{h}</span>)}
                    </div>
                    {[['Martin P.','200','€ 3 250','€ 2 147',0],['Duval J.','124','€ 2 890','€ 1 924',1],['Peeters A.','302','€ 3 100','€ 2 058',2],['Lambert S.','200','€ 4 200','€ 2 689',3]].map(([n,cp,b,nt,si],i)=>(
                      <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 12px',borderBottom:i<3?`1px solid ${G}08`:'none',alignItems:'center'}}>
                        <span style={{fontSize:11,color:W}}>{n}</span>
                        <span style={{fontSize:11,color:W2}}>{cp}</span>
                        <span style={{fontSize:11,color:W2}}>{b}</span>
                        <span style={{fontSize:11,color:W2}}>{nt}</span>
                        <span style={{fontSize:9,color:si===2?G:'#22c55e',background:si===2?`${G}15`:'#22c55e15',padding:'2px 5px',borderRadius:99,whiteSpace:'nowrap'}}>{t.dash.status[si]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </section>

        {/* ── COMPARAISON ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:860,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:40}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {t.comp.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.comp.title} <span style={{color:G,fontStyle:'italic'}}>{t.comp.italic}</span> ?
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.comp.sub}</p>
              </div>
            </Fade>
            <Fade delay={.2}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:460}}>
                  <thead>
                    <tr>
                      {t.comp.cols.map((c,i)=>(
                        <th key={i} style={{padding:'13px 11px',textAlign:i===0?'left':'center',fontSize:i===1?12:10,color:i===1?G:W2,fontWeight:i===1?800:400,letterSpacing:'1px',background:i===1?`${G}10`:'transparent',borderBottom:i===1?`2px solid ${G}`:`1px solid ${G}20`}}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.comp.rows.map((row,i)=>(
                      <tr key={i} style={{borderBottom:`1px solid ${G}08`}}>
                        {row.map((cell,j)=>(
                          <td key={j} style={{padding:'11px',textAlign:j===0?'left':'center',fontSize:12,background:j===1?`${G}06`:'transparent',
                            color:cell==='✓'?'#22c55e':cell==='✗'?'#ef4444':j===1&&i===0?G:W2,fontWeight:j===1&&i===0?700:400}}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Fade>
          </div>
        </section>

        {/* ── SÉCURITÉ ── */}
        <section style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <Fade>
              <div style={{marginBottom:40}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.sec.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',lineHeight:1.1,marginBottom:6}}>
                  {t.sec.title} <span style={{color:G,fontStyle:'italic'}}>{t.sec.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.sec.sub}</p>
              </div>
            </Fade>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
              {SECURITY_DATA.map((s,i)=>(
                <Fade key={i} delay={i*.06}>
                  <div style={{padding:'17px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}05`,display:'flex',gap:11,alignItems:'flex-start'}}>
                    <span style={{fontSize:19,flexShrink:0}}>{s.icon}</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:W,marginBottom:2}}>{s.t}</div>
                      <div style={{fontSize:10,color:W2,lineHeight:1.5}}>{s.d}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTAILS ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:960,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:44}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.portails.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.portails.title} <span style={{color:G,fontStyle:'italic'}}>{t.portails.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.portails.sub}</p>
              </div>
            </Fade>
            <div className="g3">
              {t.portails.items.map((p,i)=>{
                const cols=['#c6a34e','#60a5fa','#a78bfa'];
                return(
                  <Fade key={i} delay={i*.12}>
                    <div style={{padding:'26px 20px',border:`1px solid ${cols[i]}22`,borderRadius:8,background:`${cols[i]}06`,textAlign:'center'}}>
                      <div style={{fontSize:30,marginBottom:12}}>{p.icon}</div>
                      <h3 style={{fontSize:16,fontWeight:700,color:W,marginBottom:5}}>{p.t}</h3>
                      <code style={{fontSize:9,color:cols[i],background:`${cols[i]}15`,padding:'2px 7px',borderRadius:3,display:'inline-block',marginBottom:11}}>{p.code}</code>
                      <p style={{fontSize:12,color:W2,lineHeight:1.6}}>{p.d}</p>
                    </div>
                  </Fade>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:860,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:44}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.temo.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.temo.title} <span style={{color:G,fontStyle:'italic'}}>{t.temo.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.temo.sub}</p>
              </div>
            </Fade>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {t.temo.items.map((item,i)=>(
                <Fade key={i} delay={i*.12}>
                  <div style={{padding:'26px',border:`1px solid ${G}15`,borderRadius:8,background:`${G}04`}}>
                    <div style={{color:G,fontSize:14,marginBottom:12}}>{'★'.repeat(item.stars)}</div>
                    <p style={{fontSize:13,color:W,lineHeight:1.8,marginBottom:18,fontStyle:'italic'}}>"{item.text}"</p>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:`${G}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:G}}>{item.ini}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:W}}>{item.name}</div>
                        <div style={{fontSize:11,color:W2}}>{item.role}</div>
                      </div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARIFS ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:760,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:44}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.tarifs.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.tarifs.title} <span style={{color:G,fontStyle:'italic'}}>{t.tarifs.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.tarifs.sub}</p>
              </div>
            </Fade>
            <div className="g2">
              {/* Starter */}
              <Fade delay={.1}>
                <div style={{padding:'30px 24px',border:`1px solid ${G}20`,borderRadius:8,background:`${G}05`}}>
                  <div style={{fontSize:9,color:W2,letterSpacing:'3px',textTransform:'uppercase',marginBottom:9}}>{t.tarifs.starter.nom}</div>
                  <a href="mailto:info@aureus-ia.com" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',marginBottom:14,borderRadius:4,border:`1px solid ${G}30`,background:`${G}08`,textDecoration:'none',color:G,fontSize:12,fontWeight:700,letterSpacing:'.5px',transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${G}18`}
                    onMouseLeave={e=>e.currentTarget.style.background=`${G}08`}>
                    <span>✉</span> {t.tarifs.starter.contact||'Contactez-nous'}
                  </a>
                  <div style={{fontSize:11,color:W2,marginBottom:22}}>{t.tarifs.starter.desc}</div>
                  {t.tarifs.starter.feats.map(f=>(
                    <div key={f} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                      <span style={{color:G,fontSize:12}}>✓</span>
                      <span style={{fontSize:12,color:W2}}>{f}</span>
                    </div>
                  ))}
                  <button onClick={go} style={{width:'100%',padding:'12px',marginTop:18,borderRadius:5,border:`1px solid ${G}30`,background:'transparent',color:G,fontSize:11,cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px',transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{t.tarifs.starter.btn}</button>
                </div>
              </Fade>
              {/* Pro */}
              <Fade delay={.18}>
                <div style={{padding:'30px 24px',border:`2px solid ${G}`,borderRadius:8,background:`${G}08`,position:'relative'}}>
                  <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:G,color:'#07060a',fontSize:9,fontWeight:800,padding:'3px 13px',borderRadius:99,letterSpacing:'2px'}}>{t.tarifs.pro.badge}</div>
                  <div style={{fontSize:9,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:9}}>{t.tarifs.pro.nom}</div>
                  <a href="mailto:info@aureus-ia.com" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',marginBottom:14,borderRadius:4,border:`1px solid ${G}`,background:`${G}15`,textDecoration:'none',color:G,fontSize:12,fontWeight:800,letterSpacing:'.5px',transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${G}28`}
                    onMouseLeave={e=>e.currentTarget.style.background=`${G}15`}>
                    <span>✉</span> {t.tarifs.pro.contact||'Contactez-nous'}
                  </a>
                  <div style={{fontSize:11,color:W2,marginBottom:22}}>{t.tarifs.pro.desc}</div>
                  {t.tarifs.pro.feats.map(f=>(
                    <div key={f} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                      <span style={{color:G,fontSize:12}}>✓</span>
                      <span style={{fontSize:12,color:W2}}>{f}</span>
                    </div>
                  ))}
                  <button onClick={go} style={{width:'100%',padding:'12px',marginTop:18,borderRadius:5,border:'none',background:`linear-gradient(135deg,${G3},${G})`,color:'#07060a',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px',transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{t.tarifs.pro.btn}</button>
                </div>
              </Fade>
            </div>
          </div>
        </section>

        {/* ── ROI ── */}
        <section style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:640,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:36}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.roi.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,42px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.roi.title} <span style={{color:G,fontStyle:'italic'}}>{t.roi.italic}</span> ?
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.roi.sub}</p>
              </div>
            </Fade>
            <div style={{padding:'26px',border:`1px solid ${G}15`,borderRadius:8,background:`${G}04`,marginBottom:14}}>
              {/* ETP slider */}
              <label style={{fontSize:12,color:W2,display:'block',marginBottom:9}}>{t.roi.etp}</label>
              <input type="range" min={5} max={200} value={etp} onChange={e=>setEtp(+e.target.value)} style={{width:'100%',accentColor:G,marginBottom:6}}/>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
                <span style={{fontSize:10,color:W2}}>5</span>
                <span style={{fontSize:20,fontWeight:900,color:G}}>{etp}</span>
                <span style={{fontSize:10,color:W2}}>200</span>
              </div>
              {/* Provider */}
              <label style={{fontSize:12,color:W2,display:'block',marginBottom:9}}>{t.roi.provider}</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:20}}>
                {Object.keys(RATES).map(p=>(
                  <button key={p} onClick={()=>setProv(p)} style={{padding:'8px',borderRadius:5,border:`1px solid ${prov===p?G:`${G}20`}`,background:prov===p?`${G}15`:'transparent',color:prov===p?G:W2,fontSize:11,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>{p}</button>
                ))}
              </div>
              {/* Modules */}
              <label style={{fontSize:12,color:W2,display:'block',marginBottom:9}}>{t.roi.mods}</label>
              {t.roi.modItems.map(([k,l])=>(
                <label key={k} style={{display:'flex',alignItems:'center',gap:9,marginBottom:8,cursor:'pointer'}}>
                  <input type="checkbox" checked={mods[k]} onChange={e=>setMods(m=>({...m,[k]:e.target.checked}))} style={{accentColor:G,width:14,height:14}}/>
                  <span style={{fontSize:12,color:W2}}>{l}</span>
                </label>
              ))}
            </div>
            {/* Résultats */}
            <div style={{display:'grid',gap:10,marginBottom:14}}>
              <div style={{padding:'18px',border:`1px solid #ef444430`,borderRadius:8,background:'#ef444408'}}>
                <div style={{fontSize:9,color:W2,letterSpacing:'2px',marginBottom:5}}>{t.roi.current}</div>
                <div style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:900,color:'#ef4444',textDecoration:'line-through',letterSpacing:'-1px'}}>€ {cost.toLocaleString('fr-BE')}</div>
                <div style={{fontSize:10,color:W2,marginTop:2}}>~€{RATES[prov]}/ETP · {etp} ETP · {prov}</div>
              </div>
              <div style={{textAlign:'center',fontSize:11,color:W2}}>VS</div>
              <div style={{padding:'18px',border:`2px solid ${G}30`,borderRadius:8,background:`${G}08`}}>
                <div style={{fontSize:9,color:G,letterSpacing:'2px',marginBottom:5}}>{t.roi.with}</div>
                <div style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:900,color:G,letterSpacing:'-1px'}}>{t.tarifs.starter.prix}</div>
                <div style={{fontSize:10,color:W2,marginTop:2}}>{etp} ETP</div>
              </div>
              <div style={{padding:'18px',border:`1px solid #22c55e30`,borderRadius:8,background:'#22c55e08',textAlign:'center'}}>
                <div style={{fontSize:9,color:W2,letterSpacing:'2px',marginBottom:5}}>{t.roi.eco}</div>
                <div style={{fontSize:'clamp(18px,3vw,28px)',fontWeight:900,color:'#22c55e'}}>{t.roi.contact}</div>
                <div style={{fontSize:10,color:W2,marginTop:2}}>{t.roi.contactSub}</div>
              </div>
            </div>
            <button onClick={go} style={{width:'100%',padding:'14px',borderRadius:5,border:'none',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:12,fontWeight:800,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',boxShadow:`0 0 36px ${G}30`,transition:'all .3s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{t.roi.btn}</button>
          </div>
        </section>

        {/* ── MIGRATION ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:860,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:44}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.mig.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.mig.title} <span style={{color:G,fontStyle:'italic'}}>{t.mig.italic}</span>{t.mig.suffix}
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.mig.sub}</p>
              </div>
            </Fade>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',left:23,top:0,bottom:0,width:1,background:`${G}20`}}/>
              {t.mig.steps.map((s,i)=>(
                <Fade key={i} delay={i*.12} dir='left'>
                  <div style={{display:'flex',gap:26,marginBottom:20}}>
                    <div style={{width:46,height:46,borderRadius:'50%',border:`2px solid ${G}`,background:BG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:G,flexShrink:0,zIndex:1}}>{s.n}</div>
                    <div style={{padding:'18px',border:`1px solid ${G}12`,borderRadius:8,background:`${G}04`,flex:1}}>
                      <div style={{fontSize:9,color:G,letterSpacing:'2px',marginBottom:5}}>{s.p}</div>
                      <h3 style={{fontSize:17,fontWeight:700,color:W,marginBottom:8}}>{s.t}</h3>
                      <p style={{fontSize:12,color:W2,lineHeight:1.7,marginBottom:12}}>{s.d}</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {s.tags.map(tg=><span key={tg} style={{fontSize:10,color:G2,background:`${G}10`,border:`1px solid ${G}20`,padding:'2px 9px',borderRadius:3,fontFamily:'monospace'}}>{tg}</span>)}
                      </div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
            <Fade delay={.4}>
              <div style={{textAlign:'center',marginTop:28}}>
                <button onClick={go} style={{padding:'14px 42px',borderRadius:6,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:12,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .3s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{t.mig.btn}</button>
              </div>
            </Fade>
          </div>
        </section>

        {/* ── RESSOURCES ── */}
        <section style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:760,margin:'0 auto'}}>
            <Fade>
              <div style={{textAlign:'center',marginBottom:40}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.res.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.res.title} <span style={{color:G,fontStyle:'italic'}}>{t.res.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.res.sub}</p>
              </div>
            </Fade>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {t.res.items.map((a,i)=>(
                <Fade key={i} delay={i*.09}>
                  <div style={{padding:'22px',border:`1px solid ${G}12`,borderRadius:7,background:`${G}04`,cursor:'pointer',transition:'border-color .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=`${G}30`}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=`${G}12`}>
                    <div style={{fontSize:9,color:G,letterSpacing:'2px',textTransform:'uppercase',marginBottom:7}}>{a.cat}</div>
                    <h3 style={{fontSize:'clamp(14px,2vw,17px)',fontWeight:700,color:W,marginBottom:7,lineHeight:1.3}}>{a.t}</h3>
                    <p style={{fontSize:12,color:W2,lineHeight:1.6,marginBottom:10}}>{a.d}</p>
                    <div style={{display:'flex',gap:12,fontSize:10,color:W2}}>
                      <span>⏱ {a.time}</span><span>📅 {a.date}</span>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`}}>
          <div style={{maxWidth:700,margin:'0 auto'}}>
            <Fade>
              <div style={{marginBottom:40}}>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:10}}>— {t.faq.label}</div>
                <h2 style={{fontSize:'clamp(24px,4vw,44px)',fontWeight:800,color:W,letterSpacing:'-1px',marginBottom:8}}>
                  {t.faq.title} <span style={{color:G,fontStyle:'italic'}}>{t.faq.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2}}>{t.faq.sub}</p>
              </div>
            </Fade>
            {t.faq.items.map((item,i)=>(
              <Fade key={`${lang}-${i}`} delay={i*.06}>
                <div style={{borderBottom:`1px solid ${G}12`}}>
                  <button onClick={()=>setFaq(faq===i?null:i)} style={{width:'100%',padding:'17px 0',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
                    <span style={{fontSize:14,color:W,fontWeight:500,paddingRight:12}}>{item.q}</span>
                    <span style={{color:G,fontSize:17,flexShrink:0,transition:'transform .3s',transform:faq===i?'rotate(45deg)':'none'}}>+</span>
                  </button>
                  {faq===i&&<div style={{padding:'0 0 16px',fontSize:13,color:W2,lineHeight:1.75}}>{item.a}</div>}
                </div>
              </Fade>
            ))}
          </div>
        </section>

        {/* ── À PROPOS ── */}
        <section id="apropos" style={{padding:'80px 24px 100px'}}>
          <div style={{maxWidth:1040,margin:'0 auto'}} className="g2">
            <Fade>
              <div>
                <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:12}}>— {t.about.label}</div>
                <h2 style={{fontSize:'clamp(22px,3.5vw,38px)',fontWeight:800,color:W,letterSpacing:'-1px',lineHeight:1.1,marginBottom:18}}>
                  {t.about.title}<br/><span style={{color:G,fontStyle:'italic'}}>{t.about.italic}</span>
                </h2>
                <p style={{fontSize:13,color:W2,lineHeight:1.8,marginBottom:12}}>{t.about.p1}</p>
                <p style={{fontSize:13,color:W2,lineHeight:1.8,marginBottom:28}}>{t.about.p2}</p>
                <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
                  {t.about.stats.map((s,i)=>(
                    <div key={i}>
                      <div style={{fontSize:22,fontWeight:900,color:G}}>{s.v}</div>
                      <div style={{fontSize:10,color:W2,letterSpacing:'1px'}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
            <Fade delay={.15} dir='right'>
              <div>
                <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:12}}>{t.about.expLabel}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                  {t.about.exp.map((e,i)=>(
                    <div key={i} style={{padding:'11px 13px',border:`1px solid ${G}12`,borderRadius:2,background:`${G}05`,fontSize:10,color:W2,display:'flex',alignItems:'center',gap:6}}>
                      <span style={{color:G,fontSize:8}}>◆</span>{e}
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
          </div>
        </section>

        {/* ── RÉVOLUTION ── */}
        <section style={{padding:'80px 24px 100px',background:`${G}04`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 70% 80% at 50% 50%,${G}08 0%,transparent 70%)`}}/>
          <div style={{maxWidth:680,margin:'0 auto',textAlign:'center'}}>
            <Fade>
              <div style={{fontSize:10,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:16}}>— {t.rev.label}</div>
              <h2 style={{fontSize:'clamp(28px,5.5vw,56px)',fontWeight:900,color:W,letterSpacing:'-2px',lineHeight:1.05,marginBottom:16}}>
                {t.rev.title} <span style={{color:G,fontStyle:'italic'}}>{t.rev.italic}</span><br/>{t.rev.suffix}
              </h2>
              <p style={{fontSize:14,color:W2,lineHeight:1.8,marginBottom:40}}>{t.rev.sub}</p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
                <button onClick={go} style={{padding:'15px 42px',borderRadius:7,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:12,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',boxShadow:`0 0 50px ${G}30`,transition:'all .3s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 50px ${G}50`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 50px ${G}30`;}}>{t.rev.btn1}</button>
                <a href="mailto:info@aureus-ia.com" style={{padding:'15px 42px',borderRadius:7,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:12,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s',display:'flex',alignItems:'center'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>{t.rev.btn2}</a>
              </div>
            </Fade>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{background:'#0a0908',borderTop:`1px solid ${G}12`}}>
          <div style={{maxWidth:1060,margin:'0 auto',padding:'50px 24px 26px'}}>
            <div className="gft" style={{marginBottom:36}}>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:G,letterSpacing:'2px',marginBottom:3}}>AUREUS</div>
                <div style={{fontSize:8,color:W2,letterSpacing:'3px',marginBottom:13}}>SOCIAL PRO · IA SPRL</div>
                <p style={{fontSize:11,color:W2,lineHeight:1.7,marginBottom:12}}>{t.footer.desc}</p>
                <div style={{fontSize:11,color:W2,lineHeight:1.6}}>
                  BCE BE 1028.230.781<br/>Place Marcel Broodthaers 8<br/>1060 Saint-Gilles, Bruxelles
                </div>
                <a href="mailto:info@aureus-ia.com" style={{fontSize:11,color:G,display:'block',marginTop:9,textDecoration:'none'}}>info@aureus-ia.com</a>
              </div>
              {t.footer.cols.map((col,i)=>(
                <div key={i}>
                  <div style={{fontSize:9,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:12}}>{col.t}</div>
                  {col.items.map(l=>(
                    <div key={l} style={{fontSize:11,color:W2,marginBottom:8,cursor:'pointer',transition:'color .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.color=G}
                      onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${G}10`,paddingTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <div style={{fontSize:10,color:W2}}>{t.footer.copy}</div>
              <button onClick={go} style={{padding:'8px 18px',borderRadius:3,border:`1px solid ${G}30`,background:'transparent',color:G,fontSize:9,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{t.footer.connect}</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
