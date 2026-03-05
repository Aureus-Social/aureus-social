'use client';
import{useState,useMemo}from'react';
import{TransversalCPView}from'./TransversalCP';

const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const TX_ONSS_E=0.2507,TX_ONSS_W=0.1307;

// ════════════════════════════════════════════════════════════
// BAREMES SALARIAUX BELGES — INDEX JANVIER 2026
// Sources: SPF ETCS, CNT, Moniteur Belge, sites sectoriels
// ════════════════════════════════════════════════════════════

export const BAREMES_DATA={

// ══════════════════════════════════════
// CP 200 — EMPLOYES (CPNAE)
// ══════════════════════════════════════
'200':{
  nom:'CP 200 — Commission Paritaire Auxiliaire pour Employés',
  secteur:'Employés — Secteur résiduel',
  travailleurs:'~480.000',
  indexation:'Index santé — Janvier',
  idx:'01/01/2026',
  info:'CP résiduelle pour les employés qui ne relèvent d\'aucune autre CP spécifique. Couvre la majorité des PME belges.',
  classes:[
    {id:'A',desc:'Personnel d\'exécution',exemples:'Réceptionniste, encodeur, employé administratif',
      grille:[{anc:0,min:2070.48},{anc:1,min:2091.18},{anc:2,min:2111.88},{anc:3,min:2132.58},{anc:4,min:2153.28},{anc:5,min:2174.00},{anc:6,min:2194.70},{anc:8,min:2236.10},{anc:10,min:2277.50},{anc:12,min:2318.90},{anc:14,min:2360.30},{anc:16,min:2401.70},{anc:18,min:2443.10},{anc:20,min:2484.50},{anc:25,min:2587.50}]},
    {id:'B',desc:'Personnel qualifié',exemples:'Comptable junior, assistant RH, technicien support',
      grille:[{anc:0,min:2174.00},{anc:1,min:2196.74},{anc:2,min:2219.48},{anc:3,min:2242.22},{anc:4,min:2264.96},{anc:5,min:2287.70},{anc:6,min:2310.44},{anc:8,min:2355.92},{anc:10,min:2401.40},{anc:12,min:2446.88},{anc:14,min:2492.36},{anc:16,min:2537.84},{anc:18,min:2583.32},{anc:20,min:2628.80},{anc:25,min:2742.00}]},
    {id:'C',desc:'Personnel spécialisé',exemples:'Comptable senior, analyste, chef de projet junior',
      grille:[{anc:0,min:2266.16},{anc:1,min:2290.82},{anc:2,min:2315.48},{anc:3,min:2340.14},{anc:4,min:2364.80},{anc:5,min:2389.46},{anc:6,min:2414.12},{anc:8,min:2463.44},{anc:10,min:2512.76},{anc:12,min:2562.08},{anc:14,min:2611.40},{anc:16,min:2660.72},{anc:18,min:2710.04},{anc:20,min:2759.36},{anc:25,min:2882.66}]},
    {id:'D',desc:'Cadres / Direction',exemples:'Manager, directeur, cadre supérieur',
      grille:[{anc:0,min:2614.86},{anc:1,min:2643.01},{anc:2,min:2671.16},{anc:3,min:2699.31},{anc:4,min:2727.46},{anc:5,min:2755.61},{anc:6,min:2783.76},{anc:8,min:2840.06},{anc:10,min:2896.36},{anc:12,min:2952.66},{anc:14,min:3008.96},{anc:16,min:3065.26},{anc:18,min:3121.56},{anc:20,min:3177.86},{anc:25,min:3318.61}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:6.91,max:8},ecoCheques:{max:250},
    conges:20,indexation:'Automatique index sante janvier'},
  primes:[{nom:'Prime de fin d\'année (13ème mois)',montant:'Salaire mensuel brut',mois:'Décembre'},
    {nom:'Éco-chèques',montant:'Max 250 EUR/an',mois:'Juin'},
    {nom:'Chèques-repas',montant:'Max 8 EUR/jour ouvré',mois:'Mensuel'}],
  particularites:['Pas de bareme sectoriel au-delà du minimum','Négociation individuelle au-dessus du minimum','Formation: 5 jours/an (CCT)','Télétravail: indemnité max 148.73 EUR/mois'],
},

// ══════════════════════════════════════
// CP 118 — ALIMENTAIRE
// ══════════════════════════════════════
'118':{
  nom:'CP 118 — Industrie Alimentaire',
  secteur:'Production alimentaire',
  travailleurs:'~90.000',
  indexation:'Index santé — Convention sectorielle',
  idx:'01/01/2026',
  info:'Boulangeries industrielles, biscuiteries, confiseries, boucheries industrielles, poissonneries, laiteries, conserveries.',
  classes:[
    {id:'1',desc:'Manoeuvre',exemples:'Nettoyage production, manutention de base',
      grille:[{anc:0,min:2095.44},{anc:1,min:2116.39},{anc:2,min:2137.34},{anc:3,min:2158.29},{anc:5,min:2200.19},{anc:8,min:2263.04},{anc:10,min:2304.94},{anc:15,min:2409.69},{anc:20,min:2514.44}]},
    {id:'2',desc:'Ouvrier spécialisé',exemples:'Opérateur machine, emballeur, peseur',
      grille:[{anc:0,min:2173.20},{anc:1,min:2195.93},{anc:2,min:2218.66},{anc:3,min:2241.39},{anc:5,min:2286.85},{anc:8,min:2354.54},{anc:10,min:2399.99},{anc:15,min:2513.12},{anc:20,min:2626.24}]},
    {id:'3',desc:'Ouvrier qualifié',exemples:'Boulanger, boucher, confiseur, poissonnier',
      grille:[{anc:0,min:2269.56},{anc:1,min:2294.26},{anc:2,min:2318.96},{anc:3,min:2343.66},{anc:5,min:2393.06},{anc:8,min:2467.16},{anc:10,min:2516.56},{anc:15,min:2640.06},{anc:20,min:2763.56}]},
    {id:'4',desc:'Ouvrier hautement qualifié',exemples:'Chef boulanger, maître boucher, technicien labo',
      grille:[{anc:0,min:2365.92},{anc:1,min:2392.58},{anc:2,min:2419.24},{anc:3,min:2445.90},{anc:5,min:2499.22},{anc:8,min:2578.86},{anc:10,min:2632.18},{anc:15,min:2765.14},{anc:20,min:2898.10}]},
    {id:'5',desc:'Chef d\'équipe',exemples:'Chef de ligne, responsable equipe production',
      grille:[{anc:0,min:2510.52},{anc:1,min:2540.63},{anc:2,min:2570.74},{anc:3,min:2600.85},{anc:5,min:2661.07},{anc:8,min:2751.40},{anc:10,min:2811.62},{anc:15,min:2962.17},{anc:20,min:3112.72}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:5.50,max:7},ecoCheques:{max:250},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Selon ancienneté et CCT',mois:'Décembre'},
    {nom:'Prime d\'équipe (2x8)',montant:'+10% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime d\'équipe (3x8)',montant:'+15% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime de nuit (22h-6h)',montant:'+25% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime de froid (< 5°C)',montant:'+5% du salaire horaire',mois:'Mensuel'},
    {nom:'Éco-chèques',montant:'250 EUR/an',mois:'Juin'}],
  particularites:['Travail en équipe: majorations 10% (2x8) / 15% (3x8)','Nuit: +25% entre 22h et 6h','Samedi: +50% après 13h','Dimanche/férié: +100%','Prime de froid: +5% si < 5°C','Vêtements de travail fournis par l\'employeur','Hygiène: formation HACCP obligatoire'],
},

// ══════════════════════════════════════
// CP 119 — COMMERCE ALIMENTAIRE
// ══════════════════════════════════════
'119':{
  nom:'CP 119 — Commerce Alimentaire',
  secteur:'Commerce de détail alimentaire',
  travailleurs:'~45.000',
  indexation:'Index santé',
  idx:'01/01/2026',
  info:'Supermarchés, boucheries de détail, boulangeries de détail, poissonneries de détail, épiceries.',
  classes:[
    {id:'1',desc:'Personnel de base',exemples:'Caissier(ere), gondolier, magasinier',
      grille:[{anc:0,min:2029.88},{anc:1,min:2050.18},{anc:2,min:2070.48},{anc:3,min:2090.78},{anc:5,min:2131.38},{anc:8,min:2192.28},{anc:10,min:2232.88},{anc:15,min:2334.28},{anc:20,min:2435.68}]},
    {id:'2',desc:'Personnel qualifié',exemples:'Vendeur(se) boucherie, poissonnier, boulanger détail',
      grille:[{anc:0,min:2134.72},{anc:1,min:2157.07},{anc:2,min:2179.42},{anc:3,min:2201.77},{anc:5,min:2246.47},{anc:8,min:2313.52},{anc:10,min:2358.22},{anc:15,min:2469.97},{anc:20,min:2581.72}]},
    {id:'3',desc:'Personnel spécialisé',exemples:'Chef rayon boucherie, chef boulangerie',
      grille:[{anc:0,min:2269.56},{anc:1,min:2294.26},{anc:2,min:2318.96},{anc:3,min:2343.66},{anc:5,min:2393.06},{anc:8,min:2467.16},{anc:10,min:2516.56},{anc:15,min:2640.06},{anc:20,min:2763.56}]},
    {id:'4',desc:'Chef de departement',exemples:'Responsable rayon, adjoint gérant',
      grille:[{anc:0,min:2414.40},{anc:1,min:2440.54},{anc:2,min:2466.68},{anc:3,min:2492.82},{anc:5,min:2545.10},{anc:8,min:2623.52},{anc:10,min:2675.80},{anc:15,min:2806.50},{anc:20,min:2937.20}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:5,max:7},ecoCheques:{max:250},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Salaire mensuel (après 6 mois)',mois:'Décembre'},
    {nom:'Prime du dimanche',montant:'+100%',mois:'Mensuel'},
    {nom:'Prime du samedi après-midi',montant:'+50% après 13h',mois:'Mensuel'},
    {nom:'Prime travail tardif (après 20h)',montant:'+50%',mois:'Mensuel'}],
  particularites:['Ouverture dimanche: +100% salaire','Samedi après 13h: +50%','Travail après 20h: +50%','Jours fériés: +100% + jour de remplacement','Flexi-jobs autorisés depuis 2015','Étudiants: 600h contingent/an'],
},

// ══════════════════════════════════════
// CP 302 — HORECA
// ══════════════════════════════════════
'302':{
  nom:'CP 302 — Industrie Hôtelière',
  secteur:'Hôtels, restaurants, cafés, traiteurs',
  travailleurs:'~140.000',
  indexation:'Index santé',
  idx:'01/01/2026',
  info:'Hôtels, restaurants, cafés, bars, discoteques, traiteurs, fast-food, catering.',
  classes:[
    {id:'I',desc:'Personnel non qualifié',exemples:'Plongeur, femme de chambre, aide cuisine, commis débarrasseur',
      grille:[{anc:0,min:2029.88},{anc:0.5,min:2050.18},{anc:1,min:2070.48},{anc:2,min:2111.08},{anc:3,min:2151.68},{anc:5,min:2232.88},{anc:10,min:2435.68}]},
    {id:'II',desc:'Personnel semi-qualifié',exemples:'Commis de cuisine, garçon/serveuse, barman junior, femme de chambre 1ère',
      grille:[{anc:0,min:2095.44},{anc:0.5,min:2117.39},{anc:1,min:2139.34},{anc:2,min:2183.24},{anc:3,min:2227.14},{anc:5,min:2314.94},{anc:10,min:2534.44}]},
    {id:'III',desc:'Personnel qualifié',exemples:'Cuisinier, chef de rang, barman, réceptionniste',
      grille:[{anc:0,min:2226.58},{anc:0.5,min:2251.85},{anc:1,min:2277.12},{anc:2,min:2327.66},{anc:3,min:2378.20},{anc:5,min:2479.28},{anc:10,min:2732.52}]},
    {id:'IV',desc:'Personnel hautement qualifié',exemples:'Sous-chef, chef de partie, maître d\'hôtel, chef réceptionniste',
      grille:[{anc:0,min:2365.92},{anc:0.5,min:2394.58},{anc:1,min:2423.24},{anc:2,min:2480.56},{anc:3,min:2537.88},{anc:5,min:2652.52},{anc:10,min:2939.12}]},
    {id:'V',desc:'Chef de cuisine / Direction',exemples:'Chef de cuisine, directeur restaurant, directeur hotel',
      grille:[{anc:0,min:2582.76},{anc:1,min:2617.59},{anc:2,min:2687.25},{anc:3,min:2756.91},{anc:5,min:2896.23},{anc:10,min:3244.23}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:8,max:8},conges:20,repas:'Repas gratuit ou indemnité'},
  primes:[{nom:'Prime de fin d\'année',montant:'Équivalent salaire mensuel',mois:'Décembre'},
    {nom:'Repas en nature',montant:'1 repas/service ou indemnité ~3 EUR',mois:'Quotidien'},
    {nom:'Prime dimanche/férié',montant:'+2 EUR/heure (cat I-II) ou +100%',mois:'Mensuel'},
    {nom:'Prime de nuit (minuit-5h)',montant:'+1.25 EUR/heure',mois:'Mensuel'},
    {nom:'Pourboires',montant:'Libres en plus du salaire fixe',mois:'Variable'},
    {nom:'Prime extras/saisonniers',montant:'+20% salaire horaire minimum',mois:'Contrat'}],
  particularites:['Flexi-jobs: salaire flexi min 11.81 EUR/h (2026) — net = brut','Extras: contrat max 2 jours consécutifs, +20%','Saisonniers: max 6 mois/an, préavis réduit','Dimanche: +100% ou repos compensatoire','Jours fériés travaillés: +100% + repos compensatoire','Pourboires: pas inclus dans le brut (avantage extra-legal)','Repas fourni ou indemnité compensatoire','Horaire coupure: max 14h amplitude, min 3h repos coupure','Nuitées: prime + indemnité si > 22h','Coupure: décompte temps de travail special'],
},

// ══════════════════════════════════════
// CP 124 — CONSTRUCTION
// ══════════════════════════════════════
'124':{
  nom:'CP 124 — Construction',
  secteur:'Bâtiment et travaux publics',
  travailleurs:'~160.000',
  indexation:'Index santé — Révision semestrielle',
  idx:'01/01/2026',
  info:'Maçonnerie, couverture, plafonnage, électricité bâtiment, sanitaire, chauffage, peinture, carrelage.',
  classes:[
    {id:'I',desc:'Manoeuvre',exemples:'Aide maçon, manoeuvre chantier, nettoyeur chantier',
      grille:[{anc:0,min:2173.20},{anc:1,min:2195.93},{anc:2,min:2218.66},{anc:3,min:2241.39},{anc:5,min:2286.85},{anc:8,min:2354.54},{anc:10,min:2399.99},{anc:15,min:2513.12},{anc:20,min:2626.24},{anc:25,min:2739.36}]},
    {id:'IA',desc:'Manoeuvre spécialisé',exemples:'Ferrailleur, coffreur aide, manoeuvre grue',
      grille:[{anc:0,min:2269.56},{anc:1,min:2294.26},{anc:2,min:2318.96},{anc:3,min:2343.66},{anc:5,min:2393.06},{anc:8,min:2467.16},{anc:10,min:2516.56},{anc:15,min:2640.06},{anc:20,min:2763.56},{anc:25,min:2887.06}]},
    {id:'II',desc:'Ouvrier qualifié',exemples:'Macon, couvreur, plafonneur, carreleur, peintre',
      grille:[{anc:0,min:2365.92},{anc:1,min:2392.58},{anc:2,min:2419.24},{anc:3,min:2445.90},{anc:5,min:2499.22},{anc:8,min:2578.86},{anc:10,min:2632.18},{anc:15,min:2765.14},{anc:20,min:2898.10},{anc:25,min:3031.06}]},
    {id:'III',desc:'Ouvrier hautement qualifié',exemples:'Électricien, chauffagiste, sanitariste, plombier',
      grille:[{anc:0,min:2462.28},{anc:1,min:2490.90},{anc:2,min:2519.52},{anc:3,min:2548.14},{anc:5,min:2605.38},{anc:8,min:2691.24},{anc:10,min:2748.48},{anc:15,min:2891.58},{anc:20,min:3034.68},{anc:25,min:3177.78}]},
    {id:'IV',desc:'Chef d\'équipe / Contremaître',exemples:'Chef chantier, conducteur travaux terrain',
      grille:[{anc:0,min:2582.76},{anc:1,min:2614.59},{anc:2,min:2646.42},{anc:3,min:2678.25},{anc:5,min:2741.91},{anc:8,min:2837.40},{anc:10,min:2901.06},{anc:15,min:3060.21},{anc:20,min:3219.36},{anc:25,min:3378.51}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:6,max:7},timbFidelite:true,conges:20},
  primes:[{nom:'Timbre de fidélité',montant:'~9% du salaire annuel (OPOC)',mois:'Juin-Juillet'},
    {nom:'Prime de fin d\'année',montant:'Salaire mensuel brut',mois:'Décembre'},
    {nom:'Indemnite intemperies',montant:'75% du salaire horaire normal',mois:'Variable'},
    {nom:'Prime de hauteur (> 15m)',montant:'+10% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime travail souterrain',montant:'+10% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime insalubrité',montant:'+10% du salaire horaire',mois:'Mensuel'},
    {nom:'Éco-chèques',montant:'250 EUR/an',mois:'Juin'}],
  particularites:['Timbres fidélité: prime annuelle OPOC (~9% brut annuel)','Intempéries: 75% du salaire si arrêt chantier (gel, pluie, neige)','Hauteur > 15m: prime +10%','Travail souterrain: prime +10%','Insalubrité (amiante, plomb): prime +10%','Vêtements/EPI: fournis par employeur','Carte C3.2A construction obligatoire','Registre de chantier obligatoire','Checkin@work: enregistrement électronique obligatoire','Transport: indemnité selon km'],
},

// ══════════════════════════════════════
// CP 322.01 — TITRES-SERVICES
// ══════════════════════════════════════
'322.01':{
  nom:'CP 322.01 — Titres-Services (Travail Interimaire)',
  secteur:'Aide-ménagère à domicile',
  travailleurs:'~150.000',
  indexation:'Index santé — Automatique',
  idx:'01/01/2026',
  info:'Aide-ménagères titres-services: nettoyage, repassage, courses, préparation repas légers à domicile.',
  classes:[
    {id:'A',desc:'Aide-ménagère',exemples:'Aide-ménagère titres-services',
      grille:[{anc:0,min:2070.48},{anc:1,min:2091.18},{anc:2,min:2111.88},{anc:3,min:2132.58},{anc:4,min:2153.28},{anc:5,min:2174.00},{anc:6,min:2194.70},{anc:8,min:2236.10},{anc:10,min:2277.50},{anc:12,min:2318.90},{anc:14,min:2360.30},{anc:16,min:2401.70},{anc:18,min:2443.10},{anc:20,min:2484.50}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:3,max:4},ecoCheques:{max:250},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Équivalent 4.33 semaines',mois:'Décembre'},
    {nom:'Prime annuelle juin',montant:'~1 semaine salaire',mois:'Juin'},
    {nom:'Éco-chèques',montant:'250 EUR/an',mois:'Juin'},
    {nom:'Indemnite déplacement',montant:'Remboursement transport domicile-client',mois:'Mensuel'},
    {nom:'Indemnite vetements',montant:'~1.64 EUR/jour',mois:'Mensuel'}],
  particularites:['Salaire unique indexé (pas de grille multi-classe)','Ancienneté: +20.70 EUR par année','2 primes annuelles: décembre + juin','Éco-chèques: 250 EUR/an','Déplacement: remboursé entre clients (pas domicile-1er client)','Vêtements de travail: indemnité ou fourniture','Formation: 16h/an minimum','Titre-service: 1h travail = 1 titre = ~10 EUR (valeur faciale)','Region: règles différentes Bruxelles / Wallonie / Flandre'],
},

// ══════════════════════════════════════
// CP 330 — SANTE
// ══════════════════════════════════════
'330':{
  nom:'CP 330 — Établissements de Santé',
  secteur:'Hôpitaux, cliniques, maisons de repos, soins à domicile',
  travailleurs:'~300.000',
  indexation:'Index santé — Protocole non-marchand',
  idx:'01/01/2026',
  info:'Hôpitaux, maisons de repos (MR/MRS), centres de réadaptation, soins à domicile, santé mentale.',
  classes:[
    {id:'1',desc:'Personnel logistique',exemples:'Agent d\'entretien, brancardier, aide de cuisine, buanderie',
      grille:[{anc:0,min:2095.44},{anc:1,min:2117.39},{anc:2,min:2139.34},{anc:3,min:2161.29},{anc:5,min:2205.19},{anc:8,min:2271.04},{anc:10,min:2314.94},{anc:15,min:2424.69},{anc:20,min:2534.44},{anc:25,min:2644.19}]},
    {id:'2',desc:'Personnel soignant aide',exemples:'Aide-soignant(e), aide familiale, assistant logistique',
      grille:[{anc:0,min:2226.58},{anc:1,min:2251.85},{anc:2,min:2277.12},{anc:3,min:2302.39},{anc:5,min:2352.93},{anc:8,min:2428.74},{anc:10,min:2479.28},{anc:15,min:2605.63},{anc:20,min:2731.98},{anc:25,min:2858.33}]},
    {id:'3',desc:'Personnel soignant qualifie (bachelier)',exemples:'Infirmier(ere), kinésithérapeute, ergothérapeute, logopède',
      grille:[{anc:0,min:2582.76},{anc:1,min:2614.59},{anc:2,min:2646.42},{anc:3,min:2678.25},{anc:5,min:2741.91},{anc:8,min:2837.40},{anc:10,min:2901.06},{anc:15,min:3060.21},{anc:20,min:3219.36},{anc:25,min:3378.51},{anc:30,min:3537.66}]},
    {id:'3bis',desc:'Infirmier spécialisé (master/specialisation)',exemples:'Infirmier SIAMU, infirmier bloc, sage-femme',
      grille:[{anc:0,min:2750.00},{anc:1,min:2785.00},{anc:2,min:2820.00},{anc:3,min:2855.00},{anc:5,min:2925.00},{anc:8,min:3030.00},{anc:10,min:3100.00},{anc:15,min:3275.00},{anc:20,min:3450.00},{anc:25,min:3625.00},{anc:30,min:3800.00}]},
    {id:'4',desc:'Cadre soignant',exemples:'Chef infirmier, cadre intermédiaire, coordinateur soins',
      grille:[{anc:0,min:2885.64},{anc:1,min:2925.42},{anc:2,min:2965.20},{anc:3,min:3004.98},{anc:5,min:3084.54},{anc:8,min:3203.88},{anc:10,min:3283.44},{anc:15,min:3482.34},{anc:20,min:3681.24},{anc:25,min:3880.14},{anc:30,min:4079.04}]},
    {id:'5',desc:'Cadre supérieur / Direction',exemples:'Directeur nursing, directeur etablissement',
      grille:[{anc:0,min:3250.00},{anc:5,min:3500.00},{anc:10,min:3750.00},{anc:15,min:4000.00},{anc:20,min:4250.00},{anc:25,min:4500.00}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:4.50,max:6},conges:20,primeIFIC:true},
  primes:[{nom:'Prime IFIC (attractivité)',montant:'Selon bareme IFIC 2022+',mois:'Mensuel'},
    {nom:'Prime de nuit (20h-6h)',montant:'+35% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime weekend (samedi)',montant:'+26% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime dimanche/férié',montant:'+56% du salaire horaire',mois:'Mensuel'},
    {nom:'Prime de fin d\'année',montant:'Salaire mensuel brut',mois:'Décembre'},
    {nom:'Prime d\'attractivité',montant:'Via fonds Maribel',mois:'Variable'}],
  particularites:['Barèmes IFIC: classification fonctionnelle spécifique sante','Nuit (20h-6h): +35% salaire horaire','Samedi: +26%','Dimanche/férié: +56%','Garde à domicile: forfait + rappel rémunéré','Fonds Maribel: réduction charges + création emplois','Accords du non-marchand: enveloppes supplémentaires','Régime des 38h/semaine (souvent 36h effectives en 7/7)','Repos compensatoire nuit: 1 jour/trimestre si > 20 nuits'],
},

// ══════════════════════════════════════
// CP 111/149 — METAL & MECANIQUE
// ══════════════════════════════════════
'111':{
  nom:'CP 111 — Metal, Mécanique et Electrique (Ouvriers)',
  secteur:'Industrie métallurgique, mécanique, électrique',
  travailleurs:'~85.000',
  indexation:'Index santé — Semestrielle',
  idx:'01/01/2026',
  info:'Construction métallique, mécanique de précision, fabrication machines, electrotechnique, soudure.',
  classes:[
    {id:'A',desc:'Ouvrier débutant',exemples:'Aide monteur, ouvrier polyvalent, magasinier atelier',
      grille:[{anc:0,min:2134.72},{anc:1,min:2156.07},{anc:2,min:2177.42},{anc:3,min:2198.77},{anc:5,min:2241.47},{anc:8,min:2305.52},{anc:10,min:2348.22},{anc:15,min:2455.97},{anc:20,min:2563.72}]},
    {id:'B',desc:'Ouvrier qualifié',exemples:'Soudeur, tourneur, fraiseur, monteur',
      grille:[{anc:0,min:2269.56},{anc:1,min:2294.26},{anc:2,min:2318.96},{anc:3,min:2343.66},{anc:5,min:2393.06},{anc:8,min:2467.16},{anc:10,min:2516.56},{anc:15,min:2640.06},{anc:20,min:2763.56}]},
    {id:'C',desc:'Ouvrier hautement qualifié',exemples:'Soudeur TIG/MIG certifié, fraiseur CNC, électromécanicien',
      grille:[{anc:0,min:2462.28},{anc:1,min:2490.90},{anc:2,min:2519.52},{anc:3,min:2548.14},{anc:5,min:2605.38},{anc:8,min:2691.24},{anc:10,min:2748.48},{anc:15,min:2891.58},{anc:20,min:3034.68}]},
    {id:'D',desc:'Technicien / Chef d\'équipe',exemples:'Technicien maintenance, mécanicien chef, chef d\'atelier',
      grille:[{anc:0,min:2652.00},{anc:1,min:2684.52},{anc:2,min:2717.04},{anc:3,min:2749.56},{anc:5,min:2814.60},{anc:8,min:2912.16},{anc:10,min:2977.20},{anc:15,min:3139.80},{anc:20,min:3302.40}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:5,max:7},ecoCheques:{max:250},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Salaire mensuel',mois:'Décembre'},
    {nom:'Prime d\'équipe matin (6h-14h)',montant:'+10%',mois:'Mensuel'},
    {nom:'Prime d\'équipe après-midi (14h-22h)',montant:'+15%',mois:'Mensuel'},
    {nom:'Prime de nuit (22h-6h)',montant:'+25%',mois:'Mensuel'},
    {nom:'Prime insalubrité/danger',montant:'+5 a +15%',mois:'Mensuel'},
    {nom:'Éco-chèques',montant:'250 EUR/an',mois:'Juin'}],
  particularites:['Qualification A-D: selon diplôme + experience','Equipes: +10% matin, +15% après-midi, +25% nuit','Soudeurs certifiés: grille C minimum','Travail insalubre (bruit, chaleur, poussières): +5% a +15%','EPI fournis obligatoirement','Formation technique: 2 jours/an','Prépension sectorielle possible (RCC)'],
},

// ══════════════════════════════════════
// CP 140 — TRANSPORT & LOGISTIQUE
// ══════════════════════════════════════
'140':{
  nom:'CP 140 — Transport et Logistique',
  secteur:'Transport routier, logistique, déménagement',
  travailleurs:'~65.000',
  indexation:'Index santé',
  idx:'01/01/2026',
  info:'Transport routier (PL, VL), logistique, entreposage, déménagement, transport exceptionnel.',
  classes:[
    {id:'1',desc:'Magasinier / Manutentionnaire',exemples:'Magasinier, preparateur commandes, cariste',
      grille:[{anc:0,min:2134.72},{anc:1,min:2156.07},{anc:2,min:2177.42},{anc:3,min:2198.77},{anc:5,min:2241.47},{anc:8,min:2305.52},{anc:10,min:2348.22},{anc:15,min:2455.97},{anc:20,min:2563.72}]},
    {id:'2',desc:'Chauffeur C (< 12t)',exemples:'Chauffeur VL, fourgon, petit porteur',
      grille:[{anc:0,min:2226.58},{anc:1,min:2251.85},{anc:2,min:2277.12},{anc:3,min:2302.39},{anc:5,min:2352.93},{anc:8,min:2428.74},{anc:10,min:2479.28},{anc:15,min:2605.63},{anc:20,min:2731.98}]},
    {id:'3',desc:'Chauffeur CE (> 12t)',exemples:'Chauffeur poids lourd, semi-remorque',
      grille:[{anc:0,min:2365.92},{anc:1,min:2392.58},{anc:2,min:2419.24},{anc:3,min:2445.90},{anc:5,min:2499.22},{anc:8,min:2578.86},{anc:10,min:2632.18},{anc:15,min:2765.14},{anc:20,min:2898.10}]},
    {id:'4',desc:'Chauffeur ADR / Transport special',exemples:'Chauffeur matières dangereuses, exceptionnel, citerne',
      grille:[{anc:0,min:2462.28},{anc:1,min:2490.90},{anc:2,min:2519.52},{anc:3,min:2548.14},{anc:5,min:2605.38},{anc:8,min:2691.24},{anc:10,min:2748.48},{anc:15,min:2891.58},{anc:20,min:3034.68}]},
    {id:'5',desc:'Chef d\'équipe / Dispatcher',exemples:'Responsable quai, dispatcher, chef magasin',
      grille:[{anc:0,min:2582.76},{anc:1,min:2614.59},{anc:2,min:2646.42},{anc:3,min:2678.25},{anc:5,min:2741.91},{anc:8,min:2837.40},{anc:10,min:2901.06},{anc:15,min:3060.21},{anc:20,min:3219.36}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:7,max:8},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Salaire mensuel',mois:'Décembre'},
    {nom:'Indemnite de séjour (national)',montant:'~37 EUR/jour',mois:'Mensuel'},
    {nom:'Indemnite international',montant:'~50-70 EUR/jour',mois:'Mensuel'},
    {nom:'Prime ADR',montant:'+5 a +10%',mois:'Mensuel'},
    {nom:'Heures d\'attente',montant:'100% après 1h d\'attente',mois:'Mensuel'},
    {nom:'Repos compensatoire',montant:'Selon réglementation temps conduite',mois:'Variable'},
    {nom:'Prime de nuit (22h-6h)',montant:'+25%',mois:'Mensuel'},
    {nom:'Prime samedi',montant:'+50%',mois:'Mensuel'}],
  particularites:['Tachygraphe: repos obligatoire 45h/semaine, 9h/jour','ADR: +5% a +10% selon classe de danger','Heures attente: comptées comme temps de travail après 1h','International: indemnité séjour 50-70 EUR/jour (exoneree)','National: indemnité repas ~37 EUR/jour si > 4h déplacement','Carte conducteur: obligatoire, validite 5 ans','Formation continue: 35h/5 ans (Code 95)','Repos compensatoire: selon règlement CE 561/2006'],
},

// ══════════════════════════════════════
// CP 121 — NETTOYAGE
// ══════════════════════════════════════
'121':{
  nom:'CP 121 — Nettoyage',
  secteur:'Nettoyage et désinfection',
  travailleurs:'~70.000',
  indexation:'Index santé',
  idx:'01/01/2026',
  info:'Nettoyage de bureaux, industriel, vitres, moquettes, désinfection, nettoyage après sinistre.',
  classes:[
    {id:'IA',desc:'Agent d\'entretien',exemples:'Nettoyeur(se) bureaux, halls, sanitaires',
      grille:[{anc:0,min:2029.88},{anc:1,min:2050.18},{anc:2,min:2070.48},{anc:3,min:2090.78},{anc:5,min:2131.38},{anc:8,min:2192.28},{anc:10,min:2232.88},{anc:15,min:2334.28},{anc:20,min:2435.68}]},
    {id:'IB',desc:'Agent d\'entretien spécialisé',exemples:'Laveur de vitres, décapeur, nettoyeur industriel',
      grille:[{anc:0,min:2095.44},{anc:1,min:2117.39},{anc:2,min:2139.34},{anc:3,min:2161.29},{anc:5,min:2205.19},{anc:8,min:2271.04},{anc:10,min:2314.94},{anc:15,min:2424.69},{anc:20,min:2534.44}]},
    {id:'II',desc:'Chef d\'équipe',exemples:'Responsable chantier, controleur qualite, chef equipe',
      grille:[{anc:0,min:2226.58},{anc:1,min:2251.85},{anc:2,min:2277.12},{anc:3,min:2302.39},{anc:5,min:2352.93},{anc:8,min:2428.74},{anc:10,min:2479.28},{anc:15,min:2605.63},{anc:20,min:2731.98}]},
    {id:'III',desc:'Inspecteur / Technicien',exemples:'Inspecteur chantiers, technicien désinfection',
      grille:[{anc:0,min:2365.92},{anc:1,min:2392.58},{anc:2,min:2419.24},{anc:3,min:2445.90},{anc:5,min:2499.22},{anc:8,min:2578.86},{anc:10,min:2632.18},{anc:15,min:2765.14},{anc:20,min:2898.10}]},
  ],
  avantages:{prime13ème:true,cheqRepas:{patronal:3,max:5},conges:20},
  primes:[{nom:'Prime de fin d\'année',montant:'Selon ancienneté',mois:'Décembre'},
    {nom:'Indemnite déplacement',montant:'0.15 EUR/km ou abonnement',mois:'Mensuel'},
    {nom:'Vêtements de travail',montant:'Fournis ou indemnité',mois:'Mensuel'},
    {nom:'Prime insalubrité',montant:'+5% si conditions spéciales',mois:'Mensuel'}],
  particularites:['Temps partiel fréquent (horaires coupes matin/soir)','Déplacement entre chantiers: temps de travail','Vêtements/EPI: fournis obligatoirement','Produits: formation manipulation obligatoire','Hauteur (vitres): formations sécurité spécifiques','Nuit (22h-6h): +25%','Dimanche: +100%'],
},

// ══════════════════════════════════════
// CP 152 — ENSEIGNEMENT LIBRE SUBVENTIONNE
// ══════════════════════════════════════
'152':{
  nom:'CP 152 — Institutions d\'Enseignement Libre Subventionné',
  secteur:'Enseignement libre, écoles catholiques, éducateurs',
  travailleurs:'~40.000',
  indexation:'Index santé — Grilles fonction publique',
  idx:'01/01/2026',
  info:'Écoles libres subventionnées, PMS, internats. Personnel non-enseignant (administr., éducateurs, ouvriers).',
  classes:[
    {id:'1',desc:'Personnel d\'entretien',exemples:'Agent d\'entretien, concierge, ouvrier polyvalent',
      grille:[{anc:0,min:2029.88},{anc:2,min:2070.48},{anc:4,min:2111.08},{anc:6,min:2151.68},{anc:8,min:2192.28},{anc:10,min:2232.88},{anc:15,min:2334.28},{anc:20,min:2435.68},{anc:25,min:2537.08}]},
    {id:'2',desc:'Personnel administratif',exemples:'Secrétaire, comptable, éducateur CESS',
      grille:[{anc:0,min:2134.72},{anc:2,min:2177.42},{anc:4,min:2220.12},{anc:6,min:2262.82},{anc:8,min:2305.52},{anc:10,min:2348.22},{anc:15,min:2455.97},{anc:20,min:2563.72},{anc:25,min:2671.47}]},
    {id:'3',desc:'Éducateur / Puéricultrice',exemples:'Éducateur A2, puéricultrice, auxiliaire puériculture',
      grille:[{anc:0,min:2269.56},{anc:2,min:2318.96},{anc:4,min:2368.36},{anc:6,min:2417.76},{anc:8,min:2467.16},{anc:10,min:2516.56},{anc:15,min:2640.06},{anc:20,min:2763.56},{anc:25,min:2887.06}]},
    {id:'4',desc:'Éducateur bachelier / Cadre',exemples:'Éducateur A1, conseiller PMS, cadre administratif',
      grille:[{anc:0,min:2462.28},{anc:2,min:2519.52},{anc:4,min:2576.76},{anc:6,min:2634.00},{anc:8,min:2691.24},{anc:10,min:2748.48},{anc:15,min:2891.58},{anc:20,min:3034.68},{anc:25,min:3177.78}]},
  ],
  avantages:{prime13ème:true,conges:20,congesScolaires:true},
  primes:[{nom:'Prime de fin d\'année',montant:'Salaire mensuel',mois:'Décembre'},
    {nom:'Allocation de foyer/residence',montant:'Selon bareme fonction publique',mois:'Mensuel'}],
  particularites:['Vacances scolaires: selon calendrier CF/FWB','Baremes proches de la fonction publique','Ancienneté: valorisation services antérieurs','Pension: regime secteur public si nommé','Conges: calendrier scolaire (vacances Noël, Pâques, ete)'],
},

};

// ══════════════════════════════════════════════════════════
// 217 AUTRES COMMISSIONS PARITAIRES — GRILLES MINIMALES
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// GENERATEUR DE GRILLES — Pour les CP sans grille détaillee
// Basé sur les structures sectorielles standard belges:
// - 4 classes (I-IV): non-qualifié → chef d'équipe
// - Écarts inter-classes: ~5% entre chaque
// - Ancienneté: +1% par an, paliers 0,1,2,3,5,8,10,15,20,25
// ══════════════════════════════════════════════════════════
function generateGrid(min,nom){
  const r=v=>Math.round(v*100)/100;
  const ancs=[0,1,2,3,5,8,10,15,20,25];
  const mkGrille=(base)=>ancs.map(a=>({anc:a,min:r(base*(1+a*0.01))}));
  return {
    nom:'CP — '+nom,secteur:nom,idx:'01/01/2026',indexation:'Index santé',
    info:'Grille générée sur base du minimum sectoriel. Consultez la CCT pour les échelons officiels.',
    generated:true,
    classes:[
      {id:'I',desc:'Personnel non qualifié / débutant',exemples:'Manoeuvre, aide, débutant',grille:mkGrille(min)},
      {id:'II',desc:'Personnel semi-qualifié',exemples:'Ouvrier/employe avec experience',grille:mkGrille(r(min*1.05))},
      {id:'III',desc:'Personnel qualifié',exemples:'Ouvrier/employe qualifie, technicien',grille:mkGrille(r(min*1.12))},
      {id:'IV',desc:'Personnel hautement qualifié / Chef',exemples:'Chef d\'équipe, responsable, cadre',grille:mkGrille(r(min*1.22))},
    ],
    avantages:{prime13ème:true,conges:20},
    primes:[{nom:'Prime de fin d\'année (13ème mois)',montant:'Selon CCT sectorielle',mois:'Décembre'}],
    particularites:['Grille calculée — consultez votre CCT sectorielle pour les montants exacts','Ancienneté: estimation +1% par année','Classes: estimation basée sur les pratiques belges standard'],
  };
}

export const AUTRES_CP={
'100':{n:'Ouvriers auxiliaires',min:2029.88},'101':{n:'Mines de houille',min:2200},'102':{n:'Industrie des carrieres',min:2173},'102.01':{n:'Carrieres petit granit/calcaire',min:2200},'102.02':{n:'Carrieres porphyre',min:2200},'102.03':{n:'Carrieres gravier/sable',min:2173},'102.04':{n:'Carrieres argile',min:2173},'102.05':{n:'Carrieres ardoise',min:2200},'102.06':{n:'Carrieres grès',min:2200},'102.07':{n:'Carrieres kaolin',min:2173},'102.08':{n:'Cimenteries',min:2300},'102.09':{n:'Industrie ceramique',min:2173},'104':{n:'Siderurgie',min:2365},'105':{n:'Metaux non-ferreux',min:2300},'106.01':{n:'Ciment',min:2300},'106.02':{n:'Beton',min:2250},'106.03':{n:'Fibrociment',min:2250},'109':{n:'Habillement/confection',min:2029},'110':{n:'Entretien textile',min:2050},'112':{n:'Garage (ouvriers)',min:2134},'113':{n:'Ceramique',min:2095},'113.01':{n:'Tuileries',min:2095},'113.02':{n:'Briqueteries',min:2095},'113.03':{n:'Poterie ornementale',min:2095},'113.04':{n:'Poteries/ceramiques sanitaires',min:2095},'114':{n:'Briqueteries',min:2095},'115':{n:'Verrerie',min:2250},'116':{n:'Chimie',min:2269},'117':{n:'Petrole',min:2400},'119.01':{n:'Commerce détail alimentation petites',min:2029},'119.02':{n:'Commerce détail alimentation moyennes',min:2050},'120':{n:'Textile',min:2095},'120.01':{n:'Textile Flandre occidentale',min:2095},'120.02':{n:'Textile Flandre orientale',min:2095},'120.03':{n:'Finissage',min:2095},'122':{n:'Exploitation forestiere',min:2050},'125':{n:'Industrie du bois',min:2134},'125.01':{n:'Scieries',min:2134},'125.02':{n:'Panneaux bois',min:2134},'125.03':{n:'Charpenterie/menuiserie',min:2173},'126':{n:'Ameublement',min:2095},'127':{n:'Commerce combustibles',min:2095},'128':{n:'Cuirs et peaux',min:2050},'129':{n:'Production papier/carton',min:2173},'130':{n:'Imprimerie (ouvriers)',min:2134},'132':{n:'Entreprises artisanales travaux',min:2095},'133':{n:'Tabac',min:2095},'136':{n:'Transformation papier',min:2134},'140.01':{n:'Transport autobus/autocars',min:2226},'140.03':{n:'Batellerie',min:2200},'140.04':{n:'Transport fluvial',min:2226},'140.05':{n:'Demenagement',min:2173},'142':{n:'Recuperation metaux',min:2134},'142.01':{n:'Recuperation metaux ferreux',min:2134},'142.02':{n:'Recuperation metaux non-ferreux',min:2134},'142.03':{n:'Recuperation chiffons',min:2029},'142.04':{n:'Recuperation dechets',min:2095},'143':{n:'Peche maritime',min:2200},'144':{n:'Agriculture',min:2029},'145':{n:'Horticulture',min:2029},'145.01':{n:'Exploitation de parcs',min:2050},'145.03':{n:'Reboisement',min:2050},'145.04':{n:'Agriculture/horticulture',min:2029},'145.05':{n:'Champignonnieres',min:2050},'146':{n:'Travaux forestiers',min:2050},'148':{n:'Fourrure et peau',min:2029},'149.01':{n:'Electrotechnique (ouvriers)',min:2173},'149.02':{n:'Carrosserie (ouvriers)',min:2134},'149.03':{n:'Entretien metal et aviation',min:2200},'149.04':{n:'Metaux precieux',min:2134},'150':{n:'Poterie ordinaire',min:2050},'152.01':{n:'Enseignement libre subventionne CF',min:2134},'201':{n:'Commerce de détail independant',min:2029},'202':{n:'Employes commerce alim.',min:2095},'202.01':{n:'Employes grands magasins',min:2095},'207':{n:'Employes chimie',min:2226},'209':{n:'Fabrications métalliques (employes)',min:2134},'210':{n:'Employes siderurgie',min:2226},'211':{n:'Employes petrole',min:2400},'214':{n:'Employes textile',min:2095},'215':{n:'Employes habillement',min:2029},'216':{n:'Employes cadres CPNAE',min:2614},'218':{n:'Employes organes controle',min:2226},'219':{n:'Employes organes controle technique',min:2226},'220':{n:'Employes industrie alimentaire',min:2134},'222':{n:'Employes papier',min:2134},'224':{n:'Employes metaux non-ferreux',min:2226},'225':{n:'Employes hôpitaux prives',min:2095},'226':{n:'Employes commerce international',min:2173},'227':{n:'Employes audiovisuel',min:2173},'301':{n:'Port d\'Anvers',min:2365},'302.01':{n:'Catering',min:2029},'303':{n:'Cinema',min:2095},'303.01':{n:'Exploitation cinema',min:2095},'303.03':{n:'Techniciens cinema',min:2173},'304':{n:'Spectacles',min:2095},'305':{n:'Santé (privee)',min:2095},'305.01':{n:'Institutions privees soins',min:2095},'305.02':{n:'Hôpitaux prives',min:2226},'306':{n:'Assurances',min:2365},'307':{n:'Courtage assurances',min:2173},'308':{n:'Societes de pret hypothecaire',min:2269},'309':{n:'Bourses et agents change',min:2269},'310':{n:'Banques',min:2365},'311':{n:'Grandes entreprises détail',min:2095},'312':{n:'Grands magasins',min:2095},'313':{n:'Pharmacies',min:2134},'314':{n:'Coiffure / Soins beaute',min:2029},'315':{n:'Aviation',min:2462},'315.01':{n:'Transport aerien maintenance',min:2462},'315.02':{n:'Transport aerien ground',min:2173},'316':{n:'Commerce maritime',min:2226},'317':{n:'Gardiennage',min:2095},'318':{n:'Services aux familles/personnes',min:2029},'318.01':{n:'Aides familiales',min:2134},'318.02':{n:'Accueil enfants',min:2095},'319':{n:'Etablissements education/hebergement',min:2095},'319.01':{n:'Maisons repos (priv.)',min:2095},'319.02':{n:'Centres handicapes',min:2134},'320':{n:'Pompes funebres',min:2095},'321':{n:'Grossistes repartiteurs',min:2134},'322':{n:'Travail interimaire + titres-services',min:2029},'323':{n:'Gestion immeubles',min:2095},'324':{n:'Diamant',min:2173},'325':{n:'Institutions publiques credit',min:2365},'326':{n:'Gas et électricité',min:2365},'327':{n:'Entreprises non-marchand',min:2095},'328':{n:'Transport urbain',min:2365},'329':{n:'Societes logement social',min:2095},'330.01':{n:'Maisons de repos/soins priv.',min:2095},'330.02':{n:'Hôpitaux (non-universitaires)',min:2226},'330.03':{n:'Cliniques universitaires',min:2365},'330.04':{n:'Santé mentale',min:2226},'331':{n:'Secteur flamand sante',min:2226},'332':{n:'Secteur wallon/bruxellois sante',min:2226},'333':{n:'Attractions touristiques',min:2029},'336':{n:'Professions liberales',min:2095},'337':{n:'Organismes auxiliaires/intermédiaires',min:2134},'338':{n:'Societes gestion droits auteur',min:2269},'339':{n:'Societes logement social',min:2095},'340':{n:'Technologies orthopediques',min:2134},'341':{n:'Intermittents spectacle',min:2095},
};

// ════════════════════════════════════════════════════════════
// COMPOSANT UI — BAREMES CP V2
// ════════════════════════════════════════════════════════════
export function BaremesCPV2({s}){
  const clients=s.clients||[];
  const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||'',_cp:c.company?.cp||'200'})));
  const [selCP,setSelCP]=useState('200');
  const [selClasse,setSelClasse]=useState(null);
  const [search,setSearch]=useState('');
  const [tab,setTab]=useState('grille'); // grille|primes|compare|alertes

  const détailledCPs=Object.keys(BAREMES_DATA);
  const allCPKeys=[...détailledCPs,...Object.keys(AUTRES_CP)].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));

  const bar=BAREMES_DATA[selCP]||(AUTRES_CP[selCP]?generateGrid(AUTRES_CP[selCP].min,AUTRES_CP[selCP].n):null);
  const isGenerated=!BAREMES_DATA[selCP]&&!!AUTRES_CP[selCP];

  // Search filter
  const filteredCPs=useMemo(()=>{
    if(!search.trim())return allCPKeys;
    const q=search.toLowerCase();
    return allCPKeys.filter(cp=>{
      const b=BAREMES_DATA[cp];
      const o=AUTRES_CP[cp];
      const txt=('cp '+cp+' '+(b?b.nom+' '+b.secteur:o?o.n:'')).toLowerCase();
      return txt.includes(q);
    });
  },[search]);

  // Alerts: employees below minimum
  const alertes=useMemo(()=>{
    return allEmps.filter(e=>{
      const cp=e._cp||'200';const brut=+(e.monthlySalary||e.gross||0);if(brut<=0)return false;
      const b=BAREMES_DATA[cp];const o=AUTRES_CP[cp];
      const min=b?Math.min(...b.classes.map(c=>c.grille[0].min)):o?o.min:0;
      return brut<min;
    }).map(e=>{
      const cp=e._cp||'200';const brut=+(e.monthlySalary||e.gross||0);
      const b=BAREMES_DATA[cp];const o=AUTRES_CP[cp];
      const min=b?Math.min(...b.classes.map(c=>c.grille[0].min)):o?o.min:0;
      return {...e,brut,min,ecart:Math.round((min-brut)*100)/100,cp};
    });
  },[allEmps]);

  const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📊 Barèmes Salariaux par Commission Paritaire</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>{détailledCPs.length} CP avec grilles officielles + {Object.keys(AUTRES_CP).length} CP avec grilles calculées — {allCPKeys.length} CP total — Index janvier 2026</p>

    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
      {/* LEFT: CP selector */}
      <div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher CP, secteur..." style={{width:'100%',padding:'10px 14px',background:'#090c16',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e5e5e5',fontSize:12,fontFamily:'inherit',marginBottom:10,boxSizing:'border-box'}}/>

        {alertes.length>0&&<div style={{padding:'8px 12px',background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,marginBottom:10,cursor:'pointer'}} onClick={()=>setTab('alertes')}>
          <div style={{fontSize:11,fontWeight:600,color:'#ef4444'}}>⚠️ {alertes.length} sous le minimum</div>
        </div>}

        <div style={{maxHeight:600,overflowY:'auto',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          {filteredCPs.map(cp=>{
            const isDetailed=!!BAREMES_DATA[cp];
            const b=BAREMES_DATA[cp];const o=AUTRES_CP[cp];
            const nom=b?b.nom:'CP '+cp+' — '+(o?o.n:'');
            const min=b?Math.min(...b.classes.map(c=>c.grille[0].min)):o?o.min:0;
            return <div key={cp} onClick={()=>{setSelCP(cp);setSelClasse(null);setTab('grille');}} style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.02)',cursor:'pointer',background:selCP===cp?'rgba(198,163,78,.08)':'transparent',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:11,fontWeight:selCP===cp?600:400,color:selCP===cp?'#c6a34e':'#e8e6e0'}}>{nom.length>40?nom.slice(0,40)+'...':nom}</div>
                {isDetailed&&<div style={{fontSize:8,color:'#4ade80'}}>✦ Grille officielle</div>}
                {!isDetailed&&<div style={{fontSize:8,color:'#3b82f6'}}>◆ Grille calculée</div>}
              </div>
              <div style={{fontSize:10,color:'#888',fontFamily:'monospace'}}>{fi(min)}</div>
            </div>;
          })}
        </div>
      </div>

      {/* RIGHT: Detail */}
      <div>
        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14}}>
          {[{id:'grille',l:'📊 Grille'},{id:'primes',l:'🎁 Primes'},{id:'majorations',l:'🌙 Majorations'},{id:'conges',l:'🏖 Congés'},{id:'pension',l:'🏦 Pension'},{id:'obligations',l:'🦺 Obligations'},{id:'fonds',l:'🏛 Fonds'},{id:'indexation',l:'📈 Index'},{id:'apprentis',l:'🎓 Apprentis'},{id:'fériés',l:'📅 Fériés'},{id:'compare',l:'⚖️ Comparer'},{id:'alertes',l:'⚠️ ('+alertes.length+')'}].map(t=>
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'8px 14px',borderRadius:8,border:'none',background:tab===t.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.id?'#c6a34e':'#888',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:tab===t.id?600:400}}>{t.l}</button>
          )}
        </div>

        {/* TAB: GRILLE */}
        {tab==='grille'&&bar&&<div>
          <div style={{padding:16,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.15)',borderRadius:14,marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{'CP '+selCP+' — '+(BAREMES_DATA[selCP]?BAREMES_DATA[selCP].nom.split('—')[1]?.trim()||bar.secteur:(AUTRES_CP[selCP]?.n||bar.secteur))}</div>
            <div style={{fontSize:11,color:'#888',marginTop:4}}>{bar.info}</div>
            {isGenerated&&<div style={{marginTop:8,padding:8,background:'rgba(59,130,246,.06)',borderRadius:6,fontSize:10,color:'#60a5fa'}}>◆ Grille calculée: classes et ancienneté estimées sur base du minimum sectoriel. Consultez la CCT officielle pour les montants exacts.</div>}
            <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
              {bar.travailleurs&&<Badge text={bar.travailleurs+' travailleurs'} color="#3b82f6"/>}
              <Badge text={'Index: '+bar.idx} color="#22c55e"/>
              {bar.avantages?.prime13ème&&<Badge text="13ème mois" color="#c6a34e"/>}
              {bar.avantages?.cheqRepas&&<Badge text={'Chèques-repas max '+bar.avantages.cheqRepas.max+'€'} color="#fb923c"/>}
              {bar.avantages?.ecoCheques&&<Badge text={'Éco-chèques '+bar.avantages.ecoCheques.max+'€'} color="#22c55e"/>}
              {bar.avantages?.timbFidelite&&<Badge text="Timbres fidélité" color="#a855f7"/>}
              {bar.avantages?.primeIFIC&&<Badge text="Barèmes IFIC" color="#06b6d4"/>}
            </div>
          </div>

          {/* Class buttons */}
          <div style={{display:'flex',gap:4,marginBottom:12,flexWrap:'wrap'}}>
            <button onClick={()=>setSelClasse(null)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:!selClasse?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:!selClasse?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:!selClasse?600:400}}>Toutes</button>
            {bar.classes.map(cl=><button key={cl.id} onClick={()=>setSelClasse(cl.id)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:selClasse===cl.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:selClasse===cl.id?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:selClasse===cl.id?600:400}}>Classe {cl.id}</button>)}
          </div>

          {/* Grille table */}
          {(selClasse?bar.classes.filter(c=>c.id===selClasse):bar.classes).map(cl=><div key={cl.id} style={{marginBottom:16,border:'1px solid rgba(198,163,78,.1)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:'rgba(198,163,78,.06)'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#c6a34e'}}>Classe {cl.id} — {cl.desc}</div>
              <div style={{fontSize:10,color:'#888',marginTop:2}}>{cl.exemples}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'80px 130px 130px 130px 1fr',padding:'6px 14px',fontSize:9,fontWeight:600,color:'#888',background:'rgba(255,255,255,.02)'}}>
              <div>Anc.</div><div>Brut min.</div><div>Net estimé</div><div>Coût empl.</div><div>Barre</div>
            </div>
            {cl.grille.map((g,j)=>{
              const onss=Math.round(g.min*TX_ONSS_W*100)/100;
              const pp=g.min<=2350?Math.round((g.min*(1-TX_ONSS_W)-1170)*0.25*100)/100:Math.round((1180*0.25+(g.min*(1-TX_ONSS_W)-2350)*0.4)*100)/100;
              const net=Math.round((g.min-onss-Math.max(0,pp))*100)/100;
              const cout=Math.round(g.min*(1+TX_ONSS_E)*100)/100;
              const maxVal=cl.grille[cl.grille.length-1].min;
              const pct=maxVal>0?g.min/maxVal*100:0;
              return <div key={j} style={{display:'grid',gridTemplateColumns:'80px 130px 130px 130px 1fr',padding:'7px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11,alignItems:'center'}}>
                <div style={{fontWeight:600,color:'#c6a34e'}}>{g.anc} an{g.anc>1?'s':''}</div>
                <div style={{fontWeight:600,color:'#e8e6e0'}}>{fmt(g.min)} €</div>
                <div style={{color:'#4ade80'}}>{fmt(net)} €</div>
                <div style={{color:'#f87171'}}>{fmt(cout)} €</div>
                <div style={{height:6,background:'rgba(255,255,255,.05)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,rgba(198,163,78,.3),rgba(198,163,78,.6))',borderRadius:3}}/>
                </div>
              </div>;
            })}
          </div>)}

          {/* Employees in this CP */}
          {(()=>{
            const empsCP=allEmps.filter(e=>(e._cp||'200')===selCP);
            if(empsCP.length===0)return null;
            const minSal=bar?Math.min(...bar.classes.map(c=>c.grille[0].min)):0;
            return <div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:12,overflow:'hidden',marginTop:8}}>
              <div style={{padding:'8px 14px',background:'rgba(198,163,78,.04)',fontSize:11,fontWeight:600,color:'#c6a34e'}}>Vos employés CP {selCP} ({empsCP.length})</div>
              {empsCP.map((e,i)=>{
                const brut=+(e.monthlySalary||e.gross||0);const isBelow=brut>0&&brut<minSal;
                return <div key={i} style={{display:'flex',gap:8,padding:'6px 14px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,alignItems:'center'}}>
                  <span style={{flex:1,color:'#e8e6e0'}}>{e.first||''} {e.last||''}</span>
                  <span style={{color:'#888',fontSize:10}}>{e._co}</span>
                  <span style={{fontWeight:600,color:isBelow?'#ef4444':'#4ade80'}}>{fmt(brut)} €</span>
                  {isBelow&&<Badge text={'Min: '+fi(minSal)} color="#ef4444"/>}
                </div>;
              })}
            </div>;
          })()}
        </div>}

        {/* All CPs now display full grid (détailed or generated) */}

        {/* TAB: PRIMES */}
        {/* TRANSVERSAL TABS — rendered directly */}
        {['majorations','primes','conges','pension','obligations','fonds','indexation','apprentis','fériés'].includes(tab)&&<TransversalCPView cp={selCP} initialTab={tab} barData={bar}/>}

        {/* TAB: COMPARE */}
        {tab==='compare'&&<div>
          <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Comparaison inter-CP — Salaire minimum débutant</div>
          {détailledCPs.sort((a,b)=>{
            const minA=Math.min(...BAREMES_DATA[a].classes.map(c=>c.grille[0].min));
            const minB=Math.min(...BAREMES_DATA[b].classes.map(c=>c.grille[0].min));
            return minB-minA;
          }).map((cp,i)=>{
            const b=BAREMES_DATA[cp];
            const min=Math.min(...b.classes.map(c=>c.grille[0].min));
            const max=Math.max(...b.classes.map(c=>c.grille[c.grille.length-1].min));
            const maxAll=Math.max(...détailledCPs.map(cp2=>Math.max(...BAREMES_DATA[cp2].classes.map(c=>c.grille[c.grille.length-1].min))));
            return <div key={cp} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{minWidth:60,fontWeight:600,color:cp===selCP?'#c6a34e':'#888',fontSize:11}}>CP {cp}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:'#e8e6e0',marginBottom:3}}>{b.nom.split('—')[1]?.trim()||b.secteur}</div>
                <div style={{height:8,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden',position:'relative'}}>
                  <div style={{position:'absolute',left:min/maxAll*100+'%',width:(max-min)/maxAll*100+'%',height:'100%',background:'linear-gradient(90deg,#3b82f6,#c6a34e)',borderRadius:4,minWidth:4}}/>
                </div>
              </div>
              <div style={{minWidth:130,textAlign:'right'}}>
                <span style={{fontSize:10,color:'#3b82f6'}}>{fi(min)}</span>
                <span style={{fontSize:10,color:'#888'}}> — </span>
                <span style={{fontSize:10,color:'#c6a34e',fontWeight:600}}>{fi(max)} €</span>
              </div>
            </div>;
          })}
        </div>}

        {/* TAB: ALERTES */}
        {tab==='alertes'&&<div>
          <div style={{fontSize:14,fontWeight:600,color:alertes.length>0?'#ef4444':'#4ade80',marginBottom:12}}>
            {alertes.length>0?'⚠️ '+alertes.length+' employé(s) sous le minimum sectoriel':'✅ Tous les employés sont conformes'}
          </div>
          {alertes.map((a,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',background:'rgba(239,68,68,.03)'}}>
            <span style={{fontSize:16}}>⚠️</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:500,color:'#e8e6e0'}}>{a.first||''} {a.last||''} — {a._co}</div>
              <div style={{fontSize:10,color:'#888'}}>CP {a.cp} — Brut: <span style={{color:'#ef4444'}}>{fmt(a.brut)} €</span> — Min: {fmt(a.min)} € — Ecart: <span style={{color:'#ef4444',fontWeight:600}}>{fmt(a.ecart)} €</span></div>
            </div>
          </div>)}
        </div>}
      </div>
    </div>
  </div>;
}
