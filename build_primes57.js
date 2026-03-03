var fs = require('fs');
var filePath = 'app/modules/PayrollGroup.js';
var c = fs.readFileSync(filePath, 'utf8');

// Find the old primeDefs
var start = c.indexOf('primeDefs=[');
var end = c.indexOf('];', start) + 2;
var oldPrimeDefs = c.substring(start, end);
var oldCount = (oldPrimeDefs.match(/\{k:/g)||[]).length;
console.log('Old: ' + oldCount + ' primes');

// Build new primeDefs - note the semicolon at the end!
var primes = [];
primes.push('{k:"13emois",l:"13e mois",calc:b=>b,ref:"CCT ou contrat",desc:"Remuneration mensuelle brute complete versee en decembre"}');
primes.push('{k:"peculeSimple",l:"Pecule vacances simple",calc:b=>Math.round(b*0.1534*100)/100,ref:"Lois coord. 28/06/1971",desc:"15,34% du brut annuel"}');
primes.push('{k:"peculeDouble",l:"Pecule vacances double",calc:b=>Math.round(b*0.92*100)/100,ref:"Lois coord. 28/06/1971",desc:"92% de la remuneration mensuelle brute"}');
primes.push('{k:"finAnnee",l:"Prime fin annee",calc:b=>Math.round(b*0.50*100)/100,ref:"CCT sectorielle",desc:"Variable selon CP - souvent 50% a 100% du brut mensuel"}');
primes.push('{k:"attractivite",l:"Prime attractivite",calc:b=>Math.round(b*0.10*100)/100,ref:"CCT entreprise",desc:"10% du brut - attirer talents dans secteurs en penurie"}');
primes.push('{k:"fidelite",l:"Prime de fidelite",calc:b=>Math.round(b*0.05*100)/100,ref:"CCT entreprise",desc:"5% du brut - recompense la loyaute"}');
primes.push('{k:"anciennete",l:"Prime anciennete",calc:b=>Math.round(b*0.02*5*100)/100,ref:"CCT entreprise",desc:"2% par annee anciennete (ex. 5 ans)"}');
primes.push('{k:"anciennete10",l:"Prime anciennete 10 ans",calc:b=>Math.round(b*0.50*100)/100,ref:"CCT entreprise",desc:"50% du brut mensuel pour 10 ans de service"}');
primes.push('{k:"anciennete25",l:"Prime anciennete 25 ans",calc:b=>Math.round(b*1.00*100)/100,ref:"CCT entreprise",desc:"100% du brut mensuel pour 25 ans de service"}');
primes.push('{k:"merite",l:"Prime de merite",calc:b=>Math.round(b*0.10*100)/100,ref:"CCT entreprise",desc:"10% du brut - evaluation positive des performances"}');
primes.push('{k:"equipe",l:"Prime equipe/nuit",calc:b=>Math.round(b*0.15*100)/100,ref:"CCT 49 / sectorielle",desc:"Supplement 15% pour travail en equipe ou de nuit"}');
primes.push('{k:"dimanche",l:"Prime dimanche",calc:b=>Math.round(b/21.66*2*100)/100,ref:"Loi 16/03/1971",desc:"Doublement du salaire journalier pour travail dominical"}');
primes.push('{k:"jourFerie",l:"Prime jour ferie",calc:b=>Math.round(b/21.66*2*100)/100,ref:"Loi 04/01/1974",desc:"Doublement du salaire journalier pour jour ferie"}');
primes.push('{k:"astreinte",l:"Prime astreinte",calc:b=>Math.round(b*0.05*100)/100,ref:"CCT entreprise",desc:"Compensation disponibilite hors horaire (5-10%)"}');
primes.push('{k:"heuresSup",l:"Heures supplementaires",calc:b=>Math.round(b/21.66/7.6*1.5*100)/100,ref:"Loi 16/03/1971 art.29",desc:"Supplement 50% semaine ou 100% dimanche/ferie par heure"}');
primes.push('{k:"heuresSupWE",l:"Heures sup dimanche/ferie",calc:b=>Math.round(b/21.66/7.6*2*100)/100,ref:"Loi 16/03/1971",desc:"Supplement 100% pour heures sup dimanche et jours feries"}');
primes.push('{k:"samedi",l:"Prime samedi",calc:b=>Math.round(b*0.05*100)/100,ref:"CCT sectorielle",desc:"Supplement pour travail le samedi"}');
primes.push('{k:"nuit",l:"Prime de nuit",calc:b=>Math.round(b*0.20*100)/100,ref:"CCT sectorielle",desc:"20% supplement pour prestations entre 20h et 6h"}');
primes.push('{k:"froid",l:"Prime de froid",calc:b=>Math.round(2*21.66*100)/100,ref:"CCT sectorielle",desc:"Environ 2 EUR/jour pour travail en chambre froide"}');
primes.push('{k:"salissure",l:"Prime de salissure",calc:b=>Math.round(1.5*21.66*100)/100,ref:"CCT sectorielle",desc:"Compensation pour travail salissant"}');
primes.push('{k:"danger",l:"Prime de danger",calc:b=>Math.round(b*0.10*100)/100,ref:"CCT sectorielle",desc:"10% supplement pour travail dangereux ou penible"}');
primes.push('{k:"hauteur",l:"Prime de hauteur",calc:b=>Math.round(b*0.08*100)/100,ref:"CCT sectorielle",desc:"8% supplement pour travail en hauteur"}');
primes.push('{k:"transport",l:"Indemnite transport",calc:b=>Math.round(75*100)/100,ref:"CCT 19/9",desc:"Intervention patronale dans frais deplacement domicile-travail"}');
primes.push('{k:"velo",l:"Indemnite velo",calc:b=>Math.round(0.35*20*21.66*100)/100,ref:"CCT 164",desc:"0,35 EUR/km - exoneree ONSS et PP"}');
primes.push('{k:"teletravail",l:"Indemnite teletravail",calc:b=>Math.round(154.74*100)/100,ref:"AR 2022 / CCT 85",desc:"Max 154,74 EUR/mois - frais de bureau a domicile"}');
primes.push('{k:"mobilite",l:"Budget mobilite",calc:b=>Math.round(b*0.20*100)/100,ref:"Loi 17/03/2019",desc:"Alternative a la voiture de societe - 3 piliers"}');
primes.push('{k:"carburant",l:"Carte carburant",calc:b=>0,ref:"ATN art.36 CIR",desc:"Avantage en nature - valorisation forfaitaire selon distance"}');
primes.push('{k:"repas",l:"Cheques-repas",calc:b=>Math.round(8*21.66*100)/100,ref:"AR 12/10/2010",desc:"Max 8 EUR/jour prestation - part patronale max 6,91 EUR"}');
primes.push('{k:"eco",l:"Eco-cheques",calc:b=>Math.round(250/12*100)/100,ref:"CCT 98",desc:"Max 250 EUR/an - totalement exoneres ONSS+PP"}');
primes.push('{k:"cadeaux",l:"Cheques-cadeaux",calc:b=>Math.round(40*100)/100,ref:"Art.19 AR ONSS",desc:"Max 40 EUR/an + 40 EUR/enfant - occasions speciales"}');
primes.push('{k:"sport",l:"Cheques sport/culture",calc:b=>Math.round(100/12*100)/100,ref:"Art.19bis AR ONSS",desc:"Max 100 EUR/an - activites sportives et culturelles"}');
primes.push('{k:"consommation",l:"Prime consommation",calc:b=>Math.round(300/12*100)/100,ref:"CCT 160",desc:"Cheques consommation - horeca et secteurs impactes"}');
primes.push('{k:"fraisPropres",l:"Frais propres employeur",calc:b=>Math.round(145*100)/100,ref:"Circ. fisc. + ONSS",desc:"Forfait bureau, GSM, internet - exonere si justifie"}');
primes.push('{k:"fraisRepresentation",l:"Frais de representation",calc:b=>Math.round(125*100)/100,ref:"Art.31 CIR",desc:"Remboursement forfaitaire frais professionnels"}');
primes.push('{k:"resultat",l:"Bonus CCT 90",calc:b=>Math.min(3948,Math.round(b*0.5*100)/100),ref:"CCT 90 du 20/12/2007",desc:"Max 3.948 EUR/an - cotisation 33% vs ~55% normal"}');
primes.push('{k:"participation",l:"Prime de participation",calc:b=>Math.round(b*0.15*100)/100,ref:"Loi 22/05/2001",desc:"Participation aux benefices - regime fiscal avantageux"}');
primes.push('{k:"warrants",l:"Warrants / Stock options",calc:b=>0,ref:"Loi 26/03/1999",desc:"Options sur actions - taxation a attribution (forfait)"}');
primes.push('{k:"tantieme",l:"Tantieme",calc:b=>0,ref:"Code Societes art.5:69",desc:"Remuneration variable dirigeants - part des benefices"}');
primes.push('{k:"copyright",l:"Droits auteur",calc:b=>Math.round(b*0.10*100)/100,ref:"Loi 16/07/2008",desc:"Regime fiscal favorable - prelevement 15% max 37.500 EUR/an"}');
primes.push('{k:"naissance",l:"Prime naissance",calc:b=>0,ref:"CCT entreprise",desc:"Montant libre - verifier convention entreprise"}');
primes.push('{k:"mariage",l:"Prime mariage",calc:b=>0,ref:"CCT entreprise",desc:"Montant libre - verifier convention entreprise"}');
primes.push('{k:"pension",l:"Prime depart retraite",calc:b=>0,ref:"CCT entreprise",desc:"Montant variable selon anciennete - depart a la pension"}');
primes.push('{k:"grpAssurance",l:"Assurance groupe",calc:b=>Math.round(b*0.04*100)/100,ref:"LPC 28/04/2003",desc:"Pension complementaire - cotisation patronale (3-5%)"}');
primes.push('{k:"assurHospi",l:"Assurance hospitalisation",calc:b=>Math.round(50*100)/100,ref:"Avantage social",desc:"Prime mensuelle assurance hospi - exoneree sous conditions"}');
primes.push('{k:"invalidite",l:"Assurance invalidite",calc:b=>Math.round(b*0.01*100)/100,ref:"CCT entreprise",desc:"Couverture complementaire en cas invalidite"}');
primes.push('{k:"deces",l:"Assurance deces",calc:b=>Math.round(b*0.005*100)/100,ref:"CCT entreprise",desc:"Capital deces pour les ayants droit"}');
primes.push('{k:"formation",l:"Prime formation",calc:b=>0,ref:"Loi Peeters 05/03/2017",desc:"5 jours/an - investissement obligatoire"}');
primes.push('{k:"tuteur",l:"Prime tuteur/formateur",calc:b=>Math.round(b*0.05*100)/100,ref:"CCT entreprise",desc:"5% supplement pour role de tuteur/formateur interne"}');
primes.push('{k:"gsm",l:"Indemnite GSM",calc:b=>Math.round(30*100)/100,ref:"ONSS instructions",desc:"Max 30 EUR/mois si utilisation professionnelle significative"}');
primes.push('{k:"internet",l:"Indemnite internet",calc:b=>Math.round(20*100)/100,ref:"ONSS instructions",desc:"Max 20 EUR/mois pour connexion internet domicile"}');
primes.push('{k:"pc",l:"Indemnite PC/laptop",calc:b=>Math.round(20*100)/100,ref:"ONSS instructions",desc:"Max 20 EUR/mois pour utilisation PC prive a usage pro"}');
primes.push('{k:"reprise",l:"Prime de reprise",calc:b=>0,ref:"Art. 68 Loi 03/07/1978",desc:"Gratification libre lors de la reprise"}');
primes.push('{k:"licenciement",l:"Indemnite licenciement",calc:b=>Math.round(b*3*100)/100,ref:"Loi 26/12/2013",desc:"Variable selon anciennete - minimum 3 mois si +5 ans"}');
primes.push('{k:"nonConcurrence",l:"Clause non-concurrence",calc:b=>Math.round(b*3*100)/100,ref:"Loi 03/07/1978 art.65",desc:"Min. 50% remuneration pendant duree clause (max 12 mois)"}');
primes.push('{k:"outplacement",l:"Outplacement",calc:b=>Math.round(1800/12*100)/100,ref:"CCT 82 / Loi 2013",desc:"Accompagnement reclassement - min. 1.800 EUR de valeur"}');
primes.push('{k:"voitureSociete",l:"Voiture de societe",calc:b=>0,ref:"Art.36 CIR / CO2",desc:"ATN calcule selon emission CO2 et valeur catalogue"}');
primes.push('{k:"logement",l:"Avantage logement",calc:b=>0,ref:"Art.18 AR/CIR",desc:"ATN forfaitaire si logement mis a disposition"}');

console.log('New: ' + primes.length + ' primes');

var newPrimeDefs = 'primeDefs=[' + primes.join(',') + '];';
c = c.substring(0, start) + newPrimeDefs + c.substring(end);

// Update subtitle
c = c.replace('12 types de primes', primes.length + ' types de primes');

fs.writeFileSync(filePath, c, 'utf8');

// Verify
var v = fs.readFileSync(filePath, 'utf8');
var nc = (v.substring(v.indexOf('primeDefs=['), v.indexOf('];', v.indexOf('primeDefs=['))).match(/\{k:/g)||[]).length;
console.log('Verified: ' + nc + ' primes in file');
console.log(nc === primes.length ? 'OK' : 'ERROR');
