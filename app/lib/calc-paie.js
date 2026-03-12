// ═══ AUREUS SOCIAL PRO — Module: Moteur de calcul paie ═══
// BAREMES, calc(), getBareme(), getCPAvantages()

// Dépendances injectées via initCalcEngine()
let LEGAL, LOIS_BELGES, fmt, calcPrecompteExact, calcCSSS, calcBonusEmploi, calcIndependant;

export function initCalcEngine(deps) {
  LEGAL = deps.LEGAL;
  LOIS_BELGES = deps.LOIS_BELGES;
  fmt = deps.fmt;
  calcPrecompteExact = deps.calcPrecompteExact;
  calcCSSS = deps.calcCSSS;
  calcBonusEmploi = deps.calcBonusEmploi;
  calcIndependant = deps.calcIndependant;
}

var BAREMES={
  '200':{type:"monthly",indexDate:'01/01/2026',indexPct:2.21,regime:38,
    classes:{A:'Fonctions exécutives',B:'Fonctions de support',C:'Fonctions de gestion',D:'Fonctions consultatives'},
    grid:{
      0:{A:2242.80,B:2336.26,C:2369.30,D:2555.72},
      1:{A:2310.29,B:2413.08,C:2433.27,D:2642.08},
      2:{A:2317.18,B:2426.87,C:2488.15,D:2659.15},
      3:{A:2324.15,B:2440.76,C:2536.36,D:2676.54},
      4:{A:2330.81,B:2459.31,C:2584.73,D:2744.49},
      5:{A:2337.59,B:2478.16,C:2632.95,D:2805.17},
      6:{A:2344.48,B:2492.51,C:2681.18,D:2865.76},
      7:{A:2351.28,B:2528.52,C:2729.58,D:2926.21},
      8:{A:2358.64,B:2564.62,C:2778.00,D:2986.87},
      9:{A:2377.79,B:2600.57,C:2826.39,D:3047.16},
      10:{A:2397.02,B:2636.80,C:2874.62,D:3108.07},
      11:{A:2413.36,B:2667.12,C:2923.00,D:3168.37},
      12:{A:2429.54,B:2697.07,C:2971.32,D:3229.13},
      13:{A:2445.96,B:2727.39,C:3009.52,D:3289.61},
      14:{A:2462.02,B:2757.42,C:3047.57,D:3350.23},
      15:{A:2478.16,B:2787.64,C:3085.79,D:3400.63},
      16:{A:2494.21,B:2797.49,C:3123.91,D:3451.03},
      17:{A:2510.32,B:2807.26,C:3162.14,D:3501.43},
      18:{A:2526.43,B:2817.24,C:3173.03,D:3552.00},
      19:{A:2526.43,B:2827.05,C:3183.98,D:3602.52},
      20:{A:2526.43,B:2836.94,C:3194.97,D:3620.36},
      21:{A:2526.43,B:2846.99,C:3206.15,D:3638.33},
      22:{A:2526.43,B:2856.72,C:3217.15,D:3656.27},
      23:{A:2526.43,B:2866.60,C:3228.41,D:3674.05},
      24:{A:2526.43,B:2876.47,C:3239.44,D:3691.77},
      25:{A:2526.43,B:2886.29,C:3250.71,D:3709.53},
      26:{A:2526.43,B:2896.17,C:3261.79,D:3727.33},
    },
    fnClassMap:{
      'Secrétaire':'A',"Réceptionniste":'A',"Aide-comptable":'A',"Assistant(e) administratif":'A',"Encodeur(se)":'A',
      'Comptable junior':'B',"Vendeur(se)":'B',"Service client":'B',"Secrétaire médicale":'B',"Assistant(e) dentaire":'B',"Préparateur commandes":'B',"Recruteur":'B',"Secrétaire juridique":'B',"Hygiéniste dentaire":'B',
      'Comptable':'C',"Comptable senior":'C',"Développeur junior":'C',"Marketing digital":'C',"Gestionnaire syndic":'C',"Consultant RH":'C',"Juriste":'C',"Gestionnaire sinistres":'C',"UX Designer":'C',"Paralegal":'C',"Web developer":'C',"Sysadmin":'C',"Administratif":'B',
      'Développeur senior':'D',"Project manager":'D',"Ingénieur":'D',"Avocat collaborateur":'D',"Agent immobilier":'D',"Courtier":'D',"Ingénieur process":'D',
    },
    primeAnnuelle:330.84,ecoChequesMax:250,primeFinAnnee:'salaire brut décembre',
    transport:{velo:0.27,maxVeloJour:10.80,priveSeuilAnnuel:36688,privePct:0.50},
  },
  '124':{type:"hourly",indexDate:'01/01/2026',indexPct:0.2186,regime:40,weeklyH:40,
    classes:{I:'Manœuvre',IA:'Manœuvre qualifié (I+5%)',II:'Ouvrier semi-qualifié',IIA:'Ouvrier semi-qualifié (II+5%)',III:'Ouvrier qualifié',IV:'Ouvrier spécialisé'},
    grid:{I:18.231,IA:19.138,II:19.436,IIA:20.406,III:20.669,IV:21.940,"Chef III":22.736,"Chef IV":24.134,"Contrem IV":26.328},
    fnClassMap:{
      'Manœuvre':'I',"Aide-maçon":'I',"Démolisseur":'I',
      'Maçon':'III',"Coffreur":'III',"Ferrailleur":'III',"Plombier":'III',"Chauffagiste":'III',"Peintre":'III',"Plafonneux":'III',"Carreleur":'III',"Électricien":'III',
      'Grutier':'IV',"Chef de chantier":'Chef IV',"Apprenti":'I',
    },
    timbreFidelite:0.09,timbreIntemperie:0.02,ecoChequesMax:115,
    mobilite:{parKm:0.1579,maxKm:64},reposComp:12,
  },
  '302':{type:"hourly",indexDate:'01/01/2026',indexPct:2.189,regime:38,weeklyH:38,
    classes:{I:'Cat I',II:'Cat II',III:'Cat III',IV:'Cat IV',V:'Cat V'},
    grid:{
      0:{I:15.2097,II:15.2097,III:15.2977,IV:15.9698,V:16.8849},
      1:{I:15.8915,II:15.8915,III:16.0385,IV:16.7838,V:17.7770},
      4:{I:16.2538,II:16.2538,III:16.4029,IV:17.1645,V:18.1848},
      8:{I:16.6152,II:16.6152,III:16.7673,IV:17.5452,V:18.5926},
    },
    fnClassMap:{
      'Plongeur(se)':'I',"Agent d'entretien":'I',
      'Serveur(se)':'II',"Barman/Barmaid":'II',"Commis de cuisine":'II',"Femme/Valet de chambre":'II',
      'Cuisinier(ère)':'III',"Réceptionniste":'III',"Aide cuisine":'II',"Livreur(se)":'II',
      'Chef cuisinier':'IV',"Concierge":'IV',
    },
    monthlyFactor:164.6666,indemniteNuit:1.6209,indemniteVetements:2.20,
  },
  '330':{type:"monthly",indexDate:'01/01/2026',indexPct:2.0,regime:38,
    // Source: salairesminimums.be CP 330 — échelles barémiques alloc. résidence, indexées 01/01/2026
    // Échelles: 1.12(Cat1) 1.26(Cat2) 1.40(Cat3) 1.45(Cat4) 1.59(Cat5) — Médecin hors barème
    classes:{1:'Éch.1.12 (aide logistique)',2:'Éch.1.26 (aide-soignant)',3:'Éch.1.40 (bachelier soins)',4:'Éch.1.45 (spécialisé)',5:'Éch.1.59 (cadre soignant)',6:'Médecin salarié (hors grille)'},
    grid:{
      0:{1:2254.03,2:2463.41,3:2682.04,4:2793.00,5:3033.67,6:5610.00},
      1:{1:2437.49,2:2654.11,3:2881.21,4:2959.36,5:3200.65,6:5610.00},
      2:{1:2449.70,2:2679.05,3:2881.21,4:2959.36,5:3200.65,6:5900.00},
      3:{1:2461.93,2:2703.98,3:2897.01,4:2993.89,5:3249.13,6:5900.00},
      5:{1:2486.35,2:2753.47,3:2946.22,4:3062.22,5:3297.61,6:6190.00},
      7:{1:2510.77,2:2802.96,3:2995.49,4:3130.61,5:3346.08,6:6190.00},
      9:{1:2535.18,2:2852.43,3:3044.75,4:3078.39,5:3395.65,6:6480.00},
      10:{1:2609.90,2:2917.50,3:3122.11,4:3156.63,5:3443.64,6:6480.00},
      15:{1:2685.89,2:3074.76,3:3276.46,4:3433.66,5:3643.60,6:7245.00},
      20:{1:2747.42,2:3232.01,3:3405.15,4:3713.65,5:3843.57,6:7770.00},
      25:{1:2809.15,2:3345.69,3:3600.63,4:3881.12,5:3987.79,6:8150.00},
      27:{1:2836.55,2:3401.54,3:3665.11,4:3959.80,5:4069.43,6:8350.00},
      31:{1:2836.55,2:3401.54,3:3791.26,4:4124.28,5:4234.52,6:8800.00},
    },
    fnClassMap:{
      'Agent d\'entretien':'1',"Agent hôtelier":'1',"Cuisinier(ère)":'1',
      'Aide-soignant(e)':'2',"Brancardier":'2',"Secrétaire médicale":'2',
      'Infirmier(ère)':'3',"Ergothérapeute":'3',"Kinésithérapeute":'3',"Technicien(ne) labo":'3',
      'Pharmacien(ne) adjoint':'4',"Sage-femme":'4',
      'Infirmier(ère) chef':'5',
      'Médecin':'6',
    },
    primeAttractivite:0.02,primeNuit:0.35,primeWeekendSam:0.56,primeWeekendDim:1.00,
  },
  '140':{type:"hourly",indexDate:'01/01/2026',indexPct:2.18,regime:38,weeklyH:38,
    // Source: salairesminimums.be SCP 140.03 — 01/01/2025 barèmes indexés +2,18% pour 2026
    classes:{R1:'Roulant Niv.1',R2:'Roulant Niv.2',R3:'Roulant Niv.3',R4:'Roulant Niv.4',NR1:'Non-roulant Cl.1',NR3:'Non-roulant Cl.3',NR5:'Non-roulant Cl.5',NR6:'Non-roulant Cl.6',GA:'Garage manœuvre A',GB:'Garage spécialisé B',GC:'Garage spécialisé C',GD:'Garage spécialisé D'},
    grid:{R1:14.9254,R2:15.4491,R3:15.6284,R4:15.8078,NR1:15.6463,NR3:16.8015,NR5:17.6623,NR6:18.0261,GA:16.2359,GB:18.6683,GC:20.7119,GD:21.7245},
    monthlyFactor:164.6666,
    fnClassMap:{'Chauffeur C':'R2',"Chauffeur CE":'R4',"Dispatcher":'NR3',"Mécanicien":'GB',"Déménageur":'R1',"Chef d'équipe":'R4'},
  },
  '118':{type:"hourly",indexDate:'01/01/2026',indexPct:2.19,regime:38,weeklyH:38,
    classes:{1:'Classe 1 (manœuvre)',2:'Classe 2',3:'Classe 3 (semi-qualifié)',4:'Classe 4',5:'Classe 5 (qualifié)',6:'Classe 6',7:'Classe 7',8:'Classe 8 (haut. qualifié)'},
    grid:{// Sous-secteur 17 conserves viande — SPF salairesminimums.be 01/01/2026
      0:{1:17.59,2:17.85,3:18.16,4:18.44,5:18.69,6:18.93,7:19.39,8:19.79},
      12:{1:17.85,2:18.16,3:18.44,4:18.69,5:18.93,6:19.39,7:19.79,8:20.15},
      24:{1:17.85,2:18.44,3:18.69,4:18.93,5:19.39,6:19.79,7:20.15,8:20.21},
      36:{1:17.85,2:18.44,3:18.69,4:19.39,5:19.79,6:20.15,7:20.21,8:20.26},
      48:{1:17.85,2:18.44,3:18.69,4:19.39,5:19.79,6:20.15,7:20.26,8:20.52},
      60:{1:17.85,2:18.44,3:18.69,4:19.39,5:19.79,6:20.15,7:20.26,8:20.80},
      72:{1:17.85,2:18.44,3:18.69,4:19.39,5:19.79,6:20.15,7:20.26,8:21.06},
    },
    monthlyFactor:164.6666,
    fnClassMap:{'Ouvrier production':'1',"Technicien maintenance":'5',"Chef d'équipe":'8',"Contrôleur qualité":'5',"Opérateur machine":'3',"Conducteur de ligne":'6',"Magasinier":'2',"Laborantin":'5'},
  },
  '121':{type:"hourly",indexDate:'01/01/2026',indexPct:0.56,regime:37,weeklyH:37,
    // Source: salairesminimums.be CP 121 — 01/01/2026 — régime 37h
    classes:{1:'1A Nettoyage habituel',2:'1B Nettoyage spécial',3:'2A Nettoyage mi-lourd',4:'3A Collecte déchets',5:'8A Manœuvre industriel',6:'8C 1er opérateur',CE:"Chef d'équipe (+10%)",BR:'Brigadier (+5%)'},
    grid:{1:16.8180,2:17.3420,3:17.9070,4:19.1185,5:19.6905,6:22.5255,CE:18.4998,BR:17.6589},
    fnClassMap:{'Agent d\'entretien':'1',"Repasseur(se)":'1',"Aide-ménager(ère)":'1',"Chef d'équipe":'CE',"Responsable site":'6'},
    monthlyFactor:160.3333,// 37h * 52 / 12
  },
  '209':{n:'Fabrications métalliques',idx:2.72,dt:'01/07/2025',regime:38,approx:false,
    // Source: emploi.belgique.be Limosa CP209 (22/07/2025) + CSC Metea idx 2,72% (07/2025)
    // Classification sectorielle 8 classes + appointement min garanti +85€ au 01/01/2025
    fn:{
      'Employé exécution':{cls:1},
      'Employé spécialisé':{cls:2},
      'Employé qualifié':{cls:3},
      'Employé haut. qualifié':{cls:4},
      'Responsable':{cls:5},
      'Cadre':{cls:6}
    },
    note:"CP 209 emploi.belgique.be. Idx 2,72% au 01/07/2025. Classes sectorielles. Barème national + compléments provinciaux.",
    grille:[
      {exp:0,c1:2443.80,c2:2598.34,c3:2852.67,c4:3148.56,c5:3598.23,c6:4298.45},
      {exp:2,c1:2518.23,c2:2698.67,c3:2978.45,c4:3298.34,c5:3798.56,c6:4548.23},
      {exp:5,c1:2623.56,c2:2848.91,c3:3148.23,c4:3498.67,c5:4048.91,c6:4898.34},
      {exp:10,c1:2758.91,c2:3048.56,c3:3398.67,c4:3798.23,c5:4398.56,c6:5348.91},
      {exp:15,c1:2898.34,c2:3248.23,c3:3648.91,c4:4098.56,c5:4748.23,c6:5798.67},
      {exp:20,c1:3048.67,c2:3448.91,c3:3898.56,c4:4398.23,c5:5098.67,c6:6248.34}
    ]},
  '226':{n:'Commerce international',idx:2.23,dt:'01/01/2026',regime:38,approx:false,
    // Source: CP 200 barèmes salairesminimums.be (01/2023) + idx 2,21% (01/2024) + idx 2,23% (01/2026)
    // Applique barèmes CP 200 avec indexation propre
    fn:{
      'Employé administratif':{cls:1},
      'Commercial jr':{cls:2},
      'Commercial/Qualifié':{cls:3},
      'Responsable/Cadre':{cls:4}
    },
    note:"CP 226 applique barèmes CP 200. Classes A-D. Idx 2,23% au 01/01/2026.",
    grille:[
      {exp:0,c1:2317.78,c2:2414.35,c3:2448.51,c4:2641.01},
      {exp:5,c1:2352.07,c2:2493.42,c3:2649.05,c4:2822.33},
      {exp:10,c1:2413.33,c2:2653.84,c3:2892.12,c4:3122.70},
      {exp:15,c1:2493.42,c2:2807.25,c3:3104.70,c4:3414.78},
      {exp:20,c1:2542.18,c2:2855.57,c3:3213.47,c4:3635.66},
      {exp:25,c1:2542.18,c2:2905.65,c3:3268.93,c4:3725.71}
    ]},
  '116':{n:'Industrie chimique',idx:2.0,dt:'01/04/2025',regime:38,approx:false,
    fn:{
      'Manoeuvre ordinaire':{cls:1,anc:{0:15.829,12:16.012}},
    },
    note:"Taux horaires ouvriers (38h). Barème simplifié: 2 échelons ancienneté. Employés: barèmes entreprise (CP 207).",
    grille:[
      {exp:0,c1:2598.81,c2:2598.81},
      {exp:12,c1:2628.85,c2:2628.85}
    ]},
  '149':{n:'Électriciens (installation)',idx:2.23,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be SCP 149.01 — 01/2025 indexé +2,23% au 01/01/2026
    // Taux horaires Cat A-F, ancienneté 0-26 ans (prime anc. intégrée)
    fn:{
      'Ouvrier non-qualifié':{cls:1},
      'Ouvrier spécialisé 2e':{cls:2},
      'Ouvrier spécialisé 1e':{cls:3},
      'Ouvrier qualifié 3e':{cls:4},
      'Ouvrier qualifié 2e':{cls:5},
      'Ouvrier qualifié 1e':{cls:6}
    },
    note:"SCP 149.01 salairesminimums.be. Horaire 38h. Taux horaires: A:16.88 B:17.89 C:19.41 D:21.10 E:22.28 F:23.63 (01/2026). Mensuel = horaire x 164.67.",
    grille:[
      {exp:0,c1:2780.09,c2:2946.42,c3:3196.91,c4:3474.33,c5:3668.18,c6:3890.49},
      {exp:1,c1:2808.07,c2:2975.99,c3:3228.22,c4:3508.90,c5:3704.39,c6:3930.30},
      {exp:2,c1:2821.25,c2:2989.17,c3:3243.04,c4:3525.47,c5:3721.87,c6:3948.78},
      {exp:3,c1:2834.43,c2:3003.98,c3:3258.80,c4:3542.94,c5:3738.40,c6:3966.31},
      {exp:4,c1:2847.61,c2:3018.80,c3:3274.57,c4:3560.42,c5:3756.87,c6:3985.78},
      {exp:5,c1:2860.79,c2:3033.61,c3:3290.33,c4:3577.89,c5:3774.34,c6:4004.31},
      {exp:10,c1:2927.73,c2:3103.22,c3:3369.00,c4:3663.43,c5:3874.49,c6:4110.02},
      {exp:15,c1:2995.30,c2:3184.28,c3:3455.02,c4:3752.86,c5:3963.70,c6:4204.79},
      {exp:20,c1:3063.50,c2:3254.73,c3:3531.59,c4:3836.39,c5:4058.81,c6:4305.46},
      {exp:25,c1:3131.07,c2:3325.18,c3:3610.11,c4:3921.86,c5:4146.02,c6:4397.71},
      {exp:26,c1:3144.88,c2:3340.80,c3:3627.05,c4:3940.27,c5:4165.43,c6:4418.24}
    ]},
  '201':{n:'Commerce détail indépendant',idx:2.0,dt:'01/04/2025',regime:38,approx:false,
    fn:{
      'Vendeur débutant':{cls:1},
      'Vendeur':{cls:2},
      'Premier vendeur':{cls:3},
      'Chef de vente':{cls:4}
    },
    note:"Groupe 1 (<10 vente), personnel de vente, <20 travailleurs. Cat.1 max 10 ans anc.",
    grille:[
      {exp:0,c1:1997.85,c2:2053.89,c3:2084.33,c4:2214.12},
      {exp:2,c1:1997.85,c2:2053.89,c3:2150.44,c4:2274.25},
      {exp:5,c1:1997.85,c2:2135.83,c3:2285.97,c4:2393.86},
      {exp:8,c1:1997.85,c2:2238.45,c3:2420.39,c4:2573.25},
      {exp:10,c1:2011.83,c2:2305.79,c3:2510.30,c4:2693.15},
      {exp:12,c1:2011.83,c2:2305.79,c3:2600.07,c4:2812.87},
      {exp:14,c1:2011.83,c2:2305.79,c3:2600.07,c4:2932.18}
    ]},
  '225':{n:'Enseignement privé subventionné',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 225 = CP 200 barèmes (institutions enseignement libre)
    fn:{
      'Personnel admin. Cl.A':{cls:1},
      'Personnel pédag. Cl.B':{cls:2},
      'Coordinateur Cl.C':{cls:3},
      'Direction Cl.D':{cls:4}
    },
    note:"CP 225 = barèmes CP 200 (auxiliaire employés). Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2317.78,c2:2414.35,c3:2448.51,c4:2641.01},
      {exp:5,c1:2352.07,c2:2493.42,c3:2649.05,c4:2822.33},
      {exp:10,c1:2413.33,c2:2653.84,c3:2892.12,c4:3122.70},
      {exp:15,c1:2493.42,c2:2807.25,c3:3104.70,c4:3414.78},
      {exp:20,c1:2542.18,c2:2855.57,c3:3213.47,c4:3635.66}
    ]},
  '304':{n:'Spectacle (artistes)',idx:2.0,dt:'01/02/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 304.0001 — en vigueur 01/02/2026 — idx x1,3728
    // Barèmes mensuels min. par groupe de fonctions (spectacles d'art dramatique FR/DE)
    fn:{
      'Groupe 6 (débutant)':{cls:6},"Groupe 5":{cls:5},"Groupe 4":{cls:4},
      'Groupe 3b':{cls:'3b'},"Groupe 3a":{cls:'3a'},
      'Groupe 2b':{cls:'2b'},"Groupe 2a":{cls:'2a'},
      'Groupe 1b (direction)':{cls:'1b'},"Groupe 1a (direction)":{cls:'1a'}
    },
    note:"CP 304 salairesminimums.be 01/02/2026. Barème plat sans ancienneté. Groupes 1a-6 selon classification fonctions.",
    grille:[
      {exp:0,c6:2087.10,c5:2241.70,c4:2396.29,c3b:2550.90,c3a:2705.49,c2b:2860.09,c2a:2705.49,c1b:3376.43,c1a:2859.94}
    ]},
  '307':{n:'Courtage & assurances',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 307 + emploi.belgique.be Limosa fiche
    // Barèmes sectoriels propres, proches CP 200 + compléments
    fn:{
      'Employé admin. Cl.A':{cls:1},
      'Gestionnaire Cl.B':{cls:2},
      'Souscripteur Cl.C':{cls:3},
      'Inspecteur/Cadre Cl.D':{cls:4}
    },
    note:"CP 307 salairesminimums.be. Classification proche CP 200 avec compléments sectoriels assurances.",
    grille:[
      {exp:0,c1:2317.78,c2:2500.00,c3:2780.00,c4:3150.00},
      {exp:5,c1:2450.00,c2:2660.00,c3:2950.00,c4:3350.00},
      {exp:10,c1:2600.00,c2:2830.00,c3:3120.00,c4:3550.00},
      {exp:15,c1:2750.00,c2:2990.00,c3:3290.00,c4:3750.00},
      {exp:20,c1:2900.00,c2:3150.00,c3:3460.00,c4:3950.00}
    ]},
  '313':{n:'Pharmacies',idx:2.0,dt:'01/03/2025',regime:38,approx:false,
    fn:{
      'Personnel Cat I':{cls:1},
      'Personnel Cat II':{cls:2},
      'Assistant pharma Cat III':{cls:3},
      'Personnel Cat IV':{cls:4},
      'Pharmacien adjoint':{cls:5},
      'Pharmacien gérant':{cls:6}
    },
    note:"Personnel non-pharmacien: Cat I-IV par expérience 0-42 ans. Pharmaciens: adjoints/gérants.",
    grille:[
      {exp:0,c1:2114.25,c2:2152.00,c3:2227.51,c4:2303.03,c5:3462.31,c6:3834.57},
      {exp:3,c1:2231.32,c2:2275.96,c3:2342.94,c4:2499.26,c5:3938.02,c6:4351.66},
      {exp:5,c1:2263.81,c2:2309.00,c3:2376.77,c4:2534.94,c5:4041.40,c6:4455.09},
      {exp:10,c1:2326.93,c2:2373.44,c3:2443.23,c4:2606.02,c5:4248.29,c6:4661.90},
      {exp:15,c1:2390.07,c2:2437.95,c3:2509.71,c4:2677.13},
      {exp:20,c1:2453.21,c2:2502.36,c3:2576.12,c4:2748.24},
      {exp:25,c1:2516.28,c2:2566.84,c3:2642.54,c4:2819.31},
      {exp:30,c1:2579.48,c2:2631.31,c3:2709.05,c4:2890.47},
      {exp:35,c1:2642.54,c2:2695.76,c3:2775.47,c4:2962.30},
      {exp:40,c1:2705.74,c2:2760.19,c3:2841.89,c4:3032.37},
      {exp:42,c1:2730.99,c2:2786.06,c3:2868.52,c4:3060.61}
    ]},
  '319':{n:'Établissements éducatifs',idx:2.0,dt:'01/02/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 319/326 — secteur non-marchand
    // Barèmes alignés sur CP 326 (éducation/hébergement). Idx 2% au 01/02/2026.
    fn:{
      'Accompagnateur Cl.9-10':{cls:1},
      'Éducateur Cl.12-13':{cls:2},
      'Éducateur chef Cl.14-15':{cls:3},
      'Coordinateur Cl.16-17':{cls:4}
    },
    note:"CP 319 salairesminimums.be. Non-marchand, barèmes CP 326 alignés. Classes/plages salariales.",
    grille:[
      {exp:0,c1:2513.26,c2:2666.59,c3:2829.24,c4:3100.00},
      {exp:2,c1:2614.80,c2:2774.31,c3:2943.54,c4:3220.00},
      {exp:5,c1:2774.86,c2:2944.12,c3:3123.71,c4:3420.00},
      {exp:10,c1:2945.28,c2:3124.93,c3:3315.54,c4:3640.00},
      {exp:15,c1:3095.48,c2:3284.33,c3:3484.65,c4:3830.00},
      {exp:20,c1:3141.58,c2:3333.23,c3:3536.54,c4:3900.00}
    ]},
  '322.01':{n:'Titres-services',idx:2.0,dt:'01/03/2025',regime:38,approx:false,
    // Source: ACCG/FGTB tract officiel CP 322.01 (01/07/2025)
    // Horaire: 1e an:14,67€ 2e:15,20€ 3e:15,37€ 4e+:15,53€/h. Mensuel x164,67.
    fn:{
      'Aide-ménager(ère) 1e an':{cls:1},
      'Aide-ménager(ère) 2e an':{cls:2},
      'Aide-ménager(ère) 3e an':{cls:3},
      'Aide-ménager(ère) 4e an+':{cls:4}
    },
    note:"SCP 322.01 ACCG/FGTB 07/2025. Horaire: 14,67/15,20/15,37/15,53 €/h. Idx 2% 03/2025.",
    grille:[
      {exp:0,c1:2415.69},
      {exp:1,c1:2502.98},
      {exp:2,c1:2530.98},
      {exp:3,c1:2557.33}
    ]},
  '323':{n:'Gestion immeubles / Syndics',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 323 = CP 200 barèmes applicables
    fn:{
      'Employé admin. Cl.A':{cls:1},
      'Gestionnaire Cl.B':{cls:2},
      'Syndic/Expert Cl.C':{cls:3},
      'Responsable Cl.D':{cls:4}
    },
    note:"CP 323 = barèmes CP 200. Gestion immobilière, syndics. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2317.78,c2:2414.35,c3:2448.51,c4:2641.01},
      {exp:5,c1:2352.07,c2:2493.42,c3:2649.05,c4:2822.33},
      {exp:10,c1:2413.33,c2:2653.84,c3:2892.12,c4:3122.70},
      {exp:15,c1:2493.42,c2:2807.25,c3:3104.70,c4:3414.78},
      {exp:20,c1:2542.18,c2:2855.57,c3:3213.47,c4:3635.66}
    ]},
  '327':{n:'Entreprises de travail adapté (ETA)',idx:2.0,dt:'01/02/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 327/326 — barèmes travailleurs adaptés + encadrement
    fn:{
      'Trav. adapté Cl.HA1':{cls:1},
      'Trav. adapté Cl.HB1':{cls:2},
      'Moniteur Cl.G1':{cls:3},
      'Encadrant Cl.F1':{cls:4}
    },
    note:"CP 327 salairesminimums.be (sous CP 326). ETA/ateliers protégés. Idx 2% au 01/02/2026.",
    grille:[
      {exp:0,c1:2513.26,c2:2563.54,c3:2666.59,c4:2829.24},
      {exp:2,c1:2614.80,c2:2667.10,c3:2774.31,c4:2943.54},
      {exp:4,c1:2720.45,c2:2774.86,c3:2886.39,c4:3062.46},
      {exp:8,c1:2887.24,c2:2944.98,c3:3063.36,c4:3250.21},
      {exp:12,c1:3004.46,c2:3064.55,c3:3187.74,c4:3382.19},
      {exp:16,c1:3126.44,c2:3188.99,c3:3317.16,c4:3519.52},
      {exp:20,c1:3141.58,c2:3204.41,c3:3333.23,c4:3536.54}
    ]},
  // ═══════════════════════════════════════════════════
  // NOUVELLES CPs AJOUTÉES — Février 2026
  // Sources: salairesminimums.be, emploi.belgique.be,
  // CGSLB, CSC, FGTB, Agoria, Metallos FGTB
  // ═══════════════════════════════════════════════════

  '111':{n:'Constructions métallique, mécanique & électrique (ouvriers)',idx:2.72,dt:'01/07/2025',regime:38,approx:false,
    // Source: salairesminimums.be CP 111 + Metallos FGTB + Agoria (idx 2,72% au 01/07/2025, +0.26€ nat. au 01/01/2026)
    // Barèmes nationaux horaires — régime 38h/sem
    fn:{
      'Ouvrier Cat.1':{cls:1},"Ouvrier Cat.2":{cls:2},"Ouvrier Cat.3":{cls:3},
      'Ouvrier Cat.4':{cls:4},"Ouvrier Cat.5":{cls:5},"Ouvrier Cat.6":{cls:6},"Ouvrier Cat.7":{cls:7}
    },
    note:"CP 111 national. Barèmes provinciaux souvent supérieurs (Agoria). Idx 2,72% au 01/07/2025 + hausse CCT 0,26€ au 01/01/2026.",
    grille:[
      {exp:0,c1:2628.43,c2:2704.10,c3:2793.90,c4:2915.51,c5:3049.26,c6:3200.42,c7:3369.22},
      {exp:5,c1:2691.22,c2:2769.73,c3:2862.63,c4:2988.89,c5:3127.48,c6:3283.50,c7:3457.24},
      {exp:10,c1:2755.52,c2:2836.85,c3:2933.03,c4:3064.20,c5:3207.76,c6:3368.80,c7:3547.08}
    ]},

  '202':{n:'Commerce de détail alimentaire (employés)',idx:1.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be + CGSLB. Idx 1% au 01/01/2026 (système spécifique).
    // Grandes surfaces: Colruyt, Delhaize, Aldi, Lidl...
    fn:{
      'Employé Cat.1':{cls:1},"Employé Cat.2":{cls:2},"Employé Cat.3":{cls:3},
      'Employé Cat.4':{cls:4},"Employé Cat.5":{cls:5}
    },
    note:"CP 202 Commerce détail alimentaire. Grandes surfaces, supermarchés. Idx 1% au 01/01/2026.",
    grille:[
      {exp:0,c1:2141.05,c2:2198.00,c3:2320.81,c4:2458.79,c5:2719.10},
      {exp:2,c1:2179.76,c2:2237.73,c3:2362.77,c4:2503.26,c5:2768.33},
      {exp:4,c1:2218.82,c2:2277.83,c3:2405.11,c4:2548.12,c5:2817.96},
      {exp:6,c1:2258.24,c2:2318.30,c3:2447.82,c4:2593.39,c5:2868.02},
      {exp:10,c1:2338.01,c2:2400.18,c3:2534.17,c4:2684.86,c5:2969.97},
      {exp:15,c1:2438.89,c2:2503.60,c3:2643.26,c4:2800.33,c5:3098.03},
      {exp:20,c1:2540.70,c2:2607.99,c3:2753.33,c4:2917.02,c5:3227.32}
    ]},

  '220':{n:'Industrie alimentaire (employés)',idx:2.19,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be + CGSLB CP 118-220. Idx 2,19% au 01/01/2026.
    // Employés des entreprises alimentaires (boulangeries industrielles, brasseries, etc.)
    fn:{
      'Employé Cat.1':{cls:1},"Employé Cat.2":{cls:2},"Employé Cat.3":{cls:3},
      'Employé Cat.4':{cls:4},"Employé Cat.5":{cls:5},"Employé Cat.6":{cls:6}
    },
    note:"CP 220 Industrie alimentaire employés. Pendant employé de CP 118. Idx 2,19% au 01/01/2026.",
    grille:[
      {exp:0,c1:2265.35,c2:2367.83,c3:2560.15,c4:2796.04,c5:3104.63,c6:3549.47},
      {exp:2,c1:2315.41,c2:2420.12,c3:2616.68,c4:2857.78,c5:3173.14,c6:3627.70},
      {exp:5,c1:2390.58,c2:2498.56,c3:2701.54,c4:2950.51,c5:3276.01,c6:3745.27},
      {exp:10,c1:2541.44,c2:2656.28,c3:2872.10,c4:3136.73,c5:3482.75,c6:3981.71},
      {exp:15,c1:2693.21,c2:2814.92,c3:3043.60,c4:3324.01,c5:3690.87,c6:4219.53},
      {exp:20,c1:2845.91,c2:2974.49,c3:3216.07,c4:3512.27,c5:3899.88,c6:4458.25}
    ]},

  '311':{n:'Grandes entreprises de vente au détail',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be + emploi.belgique.be Limosa CP 311
    // Mediamarkt, IKEA, H&M, Primark, Action, Fnac...
    fn:{
      'Vendeur Cat.1':{cls:1},"Vendeur Cat.2":{cls:2},"Caissier Cat.3":{cls:3},
      'Chef rayon Cat.4':{cls:4},"Responsable Cat.5":{cls:5}
    },
    note:"CP 311 Grandes entreprises vente détail. IKEA, H&M, Mediamarkt, etc. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2141.28,c2:2222.87,c3:2336.26,c4:2555.72,c5:2874.62},
      {exp:2,c1:2181.14,c2:2264.25,c3:2379.83,c4:2603.68,c5:2928.55},
      {exp:5,c1:2241.64,c2:2327.10,c3:2445.82,c4:2676.54,c5:3008.87},
      {exp:10,c1:2363.82,c2:2454.06,c3:2579.38,c4:2822.83,c5:3173.24},
      {exp:15,c1:2488.00,c2:2583.34,c3:2715.05,c4:2971.32,c5:3339.90},
      {exp:20,c1:2614.62,c2:2714.48,c3:2852.99,c4:3122.12,c5:3509.70}
    ]},

  '329':{n:'Secteur socio-culturel',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 329 + CSC non-marchand. Idx 2% au 01/01/2026 (indice pivot).
    // SCP 329.01 (Flandre), 329.02 (CF/RW/CG), 329.03 (fédéral/bicom.)
    fn:{
      'Barème 1':{cls:1},"Barème 2":{cls:2},"Barème 3":{cls:3},
      'Barème 4':{cls:4},"Barème 4.1":{cls:5}
    },
    note:"CP 329 Socio-culturel (IFIC non-marchand). Associations, ONG, centres culturels. Idx 2% au 01/01/2026.",
    grille:[
      {exp:0,c1:2297.43,c2:2441.08,c3:2634.50,c4:2897.93,c5:3161.40},
      {exp:2,c1:2358.67,c2:2506.14,c3:2704.68,c4:2975.16,c5:3245.68},
      {exp:4,c1:2421.05,c2:2572.38,c3:2776.07,c4:3053.67,c5:3331.28},
      {exp:8,c1:2548.97,c2:2708.06,c3:2922.10,c4:3214.00,c5:3506.39},
      {exp:12,c1:2680.81,c2:2847.86,c3:3072.42,c4:3378.99,c5:3686.47},
      {exp:16,c1:2816.97,c2:2992.25,c3:3227.56,c4:3549.18,c5:3872.10},
      {exp:20,c1:2957.78,c2:3141.73,c3:3388.01,c4:3724.98,c5:4063.93}
    ]},

  '332':{n:'Aide sociale & Soins de santé (francophone/germanophone)',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 332 (ex-CP 305.02) + CGSLB non-marchand
    // Barèmes IFIC non-marchand. Crèches, CPAS, planning familial, aide jeunesse...
    fn:{
      'Cat.1 (aide)':{cls:1},"Cat.2 (qualifié)":{cls:2},"Cat.3 (bachelier)":{cls:3},
      'Cat.4 (master)':{cls:4},"Cat.5 (direction)":{cls:5}
    },
    note:"CP 332 Aide sociale francophone. Crèches, CPAS, planning, aide jeunesse. Idx 2% au 01/01/2026.",
    grille:[
      {exp:0,c1:2297.43,c2:2513.26,c3:2666.59,c4:2943.54,c5:3250.21},
      {exp:2,c1:2358.67,c2:2614.80,c3:2774.31,c4:3062.46,c5:3382.19},
      {exp:5,c1:2453.38,c2:2769.11,c3:2940.88,c4:3244.05,c5:3583.53},
      {exp:10,c1:2612.64,c2:2954.10,c3:3132.94,c4:3456.69,c5:3819.01},
      {exp:15,c1:2775.95,c2:3143.32,c3:3329.41,c4:3674.05,c5:4060.02},
      {exp:20,c1:2943.54,c2:3337.23,c3:3531.41,c4:3897.28,c5:4307.36}
    ]},

  '331':{n:'Aide sociale & Soins de santé (Flandre)',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 331 — barèmes IFIC flamands. Même structure que CP 332.
    fn:{
      'Cat.1 (aide)':{cls:1},"Cat.2 (qualifié)":{cls:2},"Cat.3 (bachelier)":{cls:3},
      'Cat.4 (master)':{cls:4},"Cat.5 (direction)":{cls:5}
    },
    note:"CP 331 Aide sociale Flandre. Mêmes barèmes IFIC que CP 332. Idx 2% au 01/01/2026.",
    grille:[
      {exp:0,c1:2297.43,c2:2513.26,c3:2666.59,c4:2943.54,c5:3250.21},
      {exp:2,c1:2358.67,c2:2614.80,c3:2774.31,c4:3062.46,c5:3382.19},
      {exp:5,c1:2453.38,c2:2769.11,c3:2940.88,c4:3244.05,c5:3583.53},
      {exp:10,c1:2612.64,c2:2954.10,c3:3132.94,c4:3456.69,c5:3819.01},
      {exp:15,c1:2775.95,c2:3143.32,c3:3329.41,c4:3674.05,c5:4060.02},
      {exp:20,c1:2943.54,c2:3337.23,c3:3531.41,c4:3897.28,c5:4307.36}
    ]},

  '336':{n:'Professions libérales (employés)',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 336 + emploi.belgique.be Limosa
    // Avocats, architectes, médecins, dentistes, kinés... en tant qu'employeurs
    // Suit les barèmes CP 200 avec ajustements sectoriels
    fn:{
      'Employé Cat.1':{cls:1},"Employé Cat.2":{cls:2},"Employé Cat.3":{cls:3},"Employé Cat.4":{cls:4}
    },
    note:"CP 336 Professions libérales. Cabinets avocats, architectes, médecins. = barèmes CP 200 + suppléments. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2242.80,c2:2336.26,c3:2369.30,c4:2555.72},
      {exp:2,c1:2317.18,c2:2426.87,c3:2488.15,c4:2659.15},
      {exp:5,c1:2337.59,c2:2478.16,c3:2632.95,c4:2805.17},
      {exp:10,c1:2397.02,c2:2636.80,c3:2874.62,c4:3108.07},
      {exp:15,c1:2478.16,c2:2787.64,c3:3085.79,c4:3400.63},
      {exp:20,c1:2526.43,c2:2836.94,c3:3194.97,c4:3620.36}
    ]},

  '152':{n:'Institutions subsidiées enseignement libre',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: CGSLB CP 152.02 + SETCa-SEL + salairesminimums.be SCP 152
    // CP 152.02 ouvriers: 6 catégories (nettoyeur → 1er ouvrier qualifié). Idx 2% au 01/01/2026.
    // Barèmes horaires convertis en mensuel (x 164,67h pour 38h/sem)
    fn:{
      'Cat.1 non-qualifié':{cls:1},"Cat.2 spécialisé simple":{cls:2},"Cat.3 spécialisé":{cls:3},
      'Cat.4 qualifié':{cls:4},"Cat.5 1er ouvrier qualifié":{cls:5},"Cat.6 chef d'équipe":{cls:6}
    },
    note:"CP 152.02 Enseignement libre ouvriers. 6 catégories. Barèmes horaires convertis mensuel. Idx 2% au 01/01/2026.",
    grille:[
      {exp:0,c1:2247.63,c2:2310.41,c3:2375.18,c4:2504.39,c5:2637.73,c6:2839.42},
      {exp:2,c1:2271.28,c2:2335.49,c3:2401.73,c4:2532.42,c5:2667.27,c6:2871.24},
      {exp:4,c1:2295.09,c2:2360.73,c3:2428.45,c4:2560.63,c5:2696.99,c6:2903.24},
      {exp:6,c1:2319.06,c2:2386.14,c3:2455.34,c4:2589.01,c5:2726.89,c6:2935.43},
      {exp:8,c1:2343.19,c2:2411.73,c3:2482.41,c4:2617.57,c5:2756.97,c6:2967.81},
      {exp:10,c1:2367.49,c2:2437.49,c3:2509.66,c4:2646.31,c5:2787.24,c6:3000.38},
      {exp:14,c1:2416.62,c2:2489.51,c3:2564.70,c4:2704.32,c5:2848.30,c6:3066.16},
      {exp:18,c1:2466.43,c2:2542.24,c3:2620.46,c4:2763.11,c5:2910.19,c6:3132.77},
      {exp:22,c1:2517.01,c2:2595.71,c3:2677.00,c4:2822.70,c5:2972.94,c6:3200.27}
    ]},

  '317':{n:'Gardiennage & Sécurité',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 317 + emploi.belgique.be Limosa
    fn:{
      'Agent gardiennage A':{cls:1},"Agent qualifié B":{cls:2},"Chef équipe C":{cls:3},"Responsable D":{cls:4}
    },
    note:"CP 317 Gardiennage & Sécurité. Securitas, G4S, Seris, Trigion. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2422.15,c2:2530.44,c3:2710.91,c4:2972.08},
      {exp:2,c1:2473.09,c2:2583.71,c3:2768.03,c4:3034.68},
      {exp:5,c1:2551.51,c2:2665.80,c3:2856.13,c4:3131.39},
      {exp:10,c1:2685.32,c2:2805.57,c3:3005.94,c4:3295.51},
      {exp:15,c1:2822.98,c2:2949.38,c3:3159.98,c4:3464.36},
      {exp:20,c1:2965.02,c2:3097.68,c3:3318.71,c4:3638.25}
    ]},

  '318':{n:'Services aides familiales & aides seniors',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 318 + CGSLB non-marchand
    // SCP 318.01 (CF/RW/CG), 318.02 (Flandre)
    fn:{
      'Aide familiale Cat.1':{cls:1},"Aide senior Cat.2":{cls:2},"Aide qualifié Cat.3":{cls:3},"Responsable Cat.4":{cls:4}
    },
    note:"CP 318 Aides familiales & seniors. Secteur non-marchand. Idx 2% au 01/01/2026.",
    grille:[
      {exp:0,c1:2297.43,c2:2441.08,c3:2634.50,c4:2897.93},
      {exp:2,c1:2358.67,c2:2506.14,c3:2704.68,c4:2975.16},
      {exp:5,c1:2453.38,c2:2607.68,c3:2812.10,c4:3093.20},
      {exp:10,c1:2612.64,c2:2776.91,c3:2996.41,c4:3297.72},
      {exp:15,c1:2775.95,c2:2950.55,c3:3185.36,c4:3507.83},
      {exp:20,c1:2943.54,c2:3129.05,c3:3379.26,c4:3724.05}
    ]},

  '144':{n:'Agriculture',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 144 + CGSLB secteurs verts
    fn:{
      'Ouvrier Cat.1':{cls:1},"Ouvrier spécialisé Cat.2":{cls:2},"Qualifié Cat.3":{cls:3},"Conducteur Cat.4":{cls:4}
    },
    note:"CP 144 Agriculture. Exploitations agricoles, élevage, culture. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2298.50,c2:2390.04,c3:2482.84,c4:2579.17},
      {exp:2,c1:2344.47,c2:2437.84,c3:2532.50,c4:2630.75},
      {exp:5,c1:2413.92,c2:2510.00,c3:2607.42,c4:2708.67},
      {exp:10,c1:2530.50,c2:2631.34,c3:2733.49,c4:2839.52},
      {exp:15,c1:2650.42,c2:2756.12,c3:2863.18,c4:2974.10},
      {exp:20,c1:2773.80,c2:2884.46,c3:2996.58,c4:3112.52}
    ]},

  '145':{n:'Horticulture',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 145 + CGSLB secteurs verts
    fn:{
      'Ouvrier Cat.1':{cls:1},"Ouvrier qualifié Cat.2":{cls:2},"Chef culture Cat.3":{cls:3}
    },
    note:"CP 145 Horticulture. Pépinières, serres, aménagement jardins. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2298.50,c2:2413.93,c3:2607.44},
      {exp:2,c1:2344.47,c2:2462.21,c3:2659.59},
      {exp:5,c1:2413.92,c2:2535.17,c3:2738.32},
      {exp:10,c1:2530.50,c2:2657.63,c3:2870.67},
      {exp:15,c1:2650.42,c2:2783.54,c3:3006.59},
      {exp:20,c1:2773.80,c2:2913.09,c3:3146.44}
    ]},

  '306':{n:"Entreprises d'assurances",idx:2.23,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 306 — en vigueur 01/01/2026 — idx 2,23125%
    // Employés: 5 catégories. Inspecteurs et Cadres: barèmes séparés.
    fn:{
      'Employé Cat.1':{cls:1},"Employé Cat.2":{cls:2},"Employé Cat.3":{cls:3},
      'Employé Cat.4A':{cls:4},"Employé Cat.4B":{cls:5}
    },
    note:"CP 306 Entreprises d'assurances. AG, AXA, Ethias. Idx 2,23125% au 01/01/2026. Barèmes employés (inspecteurs/cadres = grilles séparées).",
    grille:[
      {exp:0,c1:2336.21,c2:2405.50,c3:2655.86,c4:2836.43,c5:3149.15},
      {exp:1,c1:2381.65,c2:2457.96,c3:2719.35,c4:2904.34,c5:3225.95},
      {exp:2,c1:2427.38,c2:2509.96,c3:2782.41,c4:2973.07,c5:3302.94},
      {exp:3,c1:2473.71,c2:2561.55,c3:2845.88,c4:3041.56,c5:3379.45},
      {exp:4,c1:2519.31,c2:2613.47,c3:2909.00,c4:3109.81,c5:3456.77},
      {exp:5,c1:2565.20,c2:2665.76,c3:2972.19,c4:3178.30,c5:3533.48},
      {exp:6,c1:2610.71,c2:2717.79,c3:3035.14,c4:3246.71,c5:3610.35},
      {exp:7,c1:2656.53,c2:2769.72,c3:3098.84,c4:3315.18,c5:3687.18},
      {exp:8,c1:2702.25,c2:2822.00,c3:3161.94,c4:3384.08,c5:3763.90},
      {exp:9,c1:2747.83,c2:2874.00,c3:3224.94,c4:3452.39,c5:3840.66},
      {exp:10,c1:2793.99,c2:2925.97,c3:3288.73,c4:3521.04,c5:3917.67},
      {exp:11,c1:2812.26,c2:2954.73,c3:3330.87,c4:3566.40,c5:3968.92},
      {exp:12,c1:2830.41,c2:2982.94,c3:3372.79,c4:3612.17,c5:4020.31},
      {exp:13,c1:2848.81,c2:3011.05,c3:3415.03,c4:3657.52,c5:4071.45},
      {exp:14,c1:2866.93,c2:3039.63,c3:3457.36,c4:3703.21,c5:4122.68},
      {exp:15,c1:2885.28,c2:3068.08,c3:3499.28,c4:3748.79,c5:4174.05},
      {exp:16,c1:2903.65,c2:3096.25,c3:3541.32,c4:3794.62,c5:4225.26},
      {exp:17,c1:2922.21,c2:3124.76,c3:3583.94,c4:3839.83,c5:4276.71},
      {exp:18,c1:2940.55,c2:3152.92,c3:3625.87,c4:3885.95,c5:4327.84},
      {exp:19,c1:2958.44,c2:3181.56,c3:3668.02,c4:3931.57,c5:4379.31},
      {exp:20,c1:2977.18,c2:3210.18,c3:3710.34,c4:3977.00,c5:4430.45},
      {exp:22,c1:2995.33,c2:3238.34,c3:3752.79,c4:4022.77,c5:4481.62}
    ]},

  '333':{n:'Attractions touristiques',idx:2.21,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 333 + emploi.belgique.be
    // Walibi, Bobbejaanland, Plopsaland, Mini-Europe, Pairi Daiza...
    fn:{
      'Employé Cat.1':{cls:1},"Employé qualifié Cat.2":{cls:2},"Responsable Cat.3":{cls:3},"Cadre Cat.4":{cls:4}
    },
    note:"CP 333 Attractions touristiques. Parcs, musées, zoos. Idx 2,21% au 01/01/2026.",
    grille:[
      {exp:0,c1:2242.80,c2:2336.26,c3:2555.72,c4:2874.62},
      {exp:2,c1:2290.15,c2:2385.56,c3:2609.88,c4:2935.54},
      {exp:5,c1:2362.05,c2:2460.51,c3:2691.83,c4:3027.56},
      {exp:10,c1:2508.28,c2:2613.00,c3:2858.57,c4:3215.18},
      {exp:15,c1:2658.14,c2:2769.29,c3:3029.34,c4:3407.39},
      {exp:20,c1:2812.10,c2:2929.81,c3:3204.52,c4:3604.35}
    ]},

  '100':{n:'Commission auxiliaire pour ouvriers',idx:2.0,dt:'01/01/2026',regime:38,approx:true,
    fn:{'Ouvrier Cat.1':{cls:1},'Ouvrier Cat.2':{cls:2},'Ouvrier Cat.3':{cls:3},'Ouvrier Cat.4':{cls:4}},
    note:'CP 100 subsidiaire. Barèmes RMMMG (revenu minimum mensuel moyen garanti). Peu de travailleurs sous cette CP pure.',
    grille:[
      {exp:0,c1:2029.88,c2:2100.00,c3:2200.00,c4:2350.00},
      {exp:5,c1:2100.00,c2:2175.00,c3:2280.00,c4:2440.00},
      {exp:10,c1:2175.00,c2:2255.00,c3:2365.00,c4:2530.00}
    ]},

  '112':{n:'Garage, carrosserie, commerce automobile',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Ouvrier Cat.A':{cls:1},'Ouvrier Cat.B':{cls:2},'Ouvrier Cat.C':{cls:3},'Ouvrier Cat.D':{cls:4},'Employé Cat.1':{cls:1},'Employé Cat.2':{cls:2},'Employé Cat.3':{cls:3}},
    note:'CP 112 Garage. Index pivot 2% au 01/01/2026. Barèmes ouvriers Cat.A-D + employés Cat.1-3.',
    grille:[
      {exp:0,c1:2380.00,c2:2580.00,c3:2750.00,c4:3050.00},
      {exp:5,c1:2450.00,c2:2660.00,c3:2840.00,c4:3150.00},
      {exp:10,c1:2520.00,c2:2740.00,c3:2930.00,c4:3250.00}
    ]},

  '118':{n:'Industrie alimentaire (ouvriers)',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Ouvrier Cat.1':{cls:1},'Ouvrier Cat.2':{cls:2},'Ouvrier Cat.3':{cls:3},'Ouvrier Cat.4':{cls:4},'Ouvrier Cat.5':{cls:5}},
    note:'CP 118 Industrie alimentaire ouvriers. Barèmes nationaux. Prime de fin annee sectorielle.',
    grille:[
      {exp:0,c1:2580.00,c2:2696.49,c3:2896.49,c4:3077.62,c5:3258.75},
      {exp:5,c1:2660.00,c2:2780.00,c3:2985.00,c4:3170.00,c5:3355.00},
      {exp:10,c1:2740.00,c2:2865.00,c3:3075.00,c4:3265.00,c5:3455.00}
    ]},

  '119':{n:'Commerce alimentaire',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Ouvrier Cat.1':{cls:1},'Ouvrier Cat.2':{cls:2},'Ouvrier Cat.3':{cls:3}},
    note:'CP 119 Commerce alimentaire. Boucheries, charcuteries, poissonneries.',
    grille:[
      {exp:0,c1:2350.00,c2:2580.00,c3:2750.00},
      {exp:5,c1:2430.00,c2:2665.00,c3:2840.00},
      {exp:10,c1:2510.00,c2:2750.00,c3:2930.00}
    ]},

  '121':{n:'Nettoyage',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Cat.1A Nettoyage habituel':{cls:1},'Cat.1B Nettoyage special':{cls:2},'Cat.2A Mi-lourd':{cls:3},'Cat.3A Collecte dechets':{cls:4},'Chef equipe':{cls:5}},
    note:'CP 121 Nettoyage. Barèmes horaires x 164,67h. Prime de fin annee sectorielle. Cheques-repas obligatoires.',
    grille:[
      {exp:0,c1:2450.00,c2:2550.00,c3:2696.49,c4:2800.00,c5:2966.13},
      {exp:5,c1:2530.00,c2:2635.00,c3:2785.00,c4:2890.00,c5:3060.00},
      {exp:10,c1:2610.00,c2:2720.00,c3:2875.00,c4:2985.00,c5:3155.00}
    ]},

  '124':{n:'Construction',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Manoeuvre Cat.I':{cls:1},'Ouvrier Cat.II':{cls:2},'Ouvrier Cat.IIA':{cls:3},'Ouvrier Cat.III':{cls:3},'Ouvrier Cat.IV':{cls:4},'Chef Cat.IV+':{cls:5}},
    note:'CP 124 Construction. Barèmes horaires x 164,67h. Timbres intemperies + fidelite. Caisse conges construction.',
    grille:[
      {exp:0,c1:3006.56,c2:3205.42,c3:3365.39,c4:3409.58,c5:3619.21},
      {exp:5,c1:3097.00,c2:3302.00,c3:3467.00,c4:3512.00,c5:3728.00},
      {exp:10,c1:3190.00,c2:3401.00,c3:3571.00,c4:3618.00,c5:3840.00}
    ]},

  '140':{n:'Transport et logistique',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Chauffeur C':{cls:1},'Chauffeur CE':{cls:2},'Dispatcher':{cls:3},'Mecanicien':{cls:4},'Demenageur':{cls:5}},
    note:'CP 140 Transport routier et logistique. Indemnites de sejour. Prime RGPT. Tachygraphe obligatoire.',
    grille:[
      {exp:0,c1:2543.95,c2:2603.02,c3:2766.65,c4:3074.05,c5:2457.71},
      {exp:5,c1:2620.00,c2:2681.00,c3:2849.00,c4:3166.00,c5:2531.00},
      {exp:10,c1:2699.00,c2:2761.00,c3:2934.00,c4:3261.00,c5:2607.00}
    ]},

  '200':{n:'CPNAE — Commission paritaire auxiliaire pour employes',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Employe Cat.1':{cls:1},'Employe Cat.2':{cls:2},'Employe Cat.3':{cls:3},'Employe Cat.4':{cls:4}},
    note:'CP 200 CPNAE. Plus grande CP de Belgique (~450.000 travailleurs). Index pivot 2%. Bareme sectoriel minimum.',
    grille:[
      {exp:0,c1:2029.88,c2:2242.80,c3:2468.07,c4:2728.35},
      {exp:1,c1:2080.63,c2:2298.87,c3:2529.77,c4:2796.56},
      {exp:2,c1:2131.38,c2:2354.94,c3:2591.47,c4:2864.77},
      {exp:3,c1:2182.13,c2:2411.01,c3:2653.17,c4:2932.98},
      {exp:4,c1:2232.88,c2:2467.08,c3:2714.87,c4:3001.19},
      {exp:5,c1:2283.63,c2:2523.15,c3:2776.57,c4:3069.40},
      {exp:10,c1:2537.13,c2:2803.50,c3:3084.97,c4:3410.45},
      {exp:15,c1:2790.63,c2:3083.85,c3:3393.37,c4:3751.50},
      {exp:20,c1:3044.13,c2:3364.20,c3:3701.77,c4:4092.55}
    ]},

  '216':{n:'Notariat',idx:2.0,dt:'01/01/2026',regime:36,approx:false,
    fn:{'Employe Cat.1':{cls:1},'Employe Cat.2':{cls:2},'Clerc':{cls:3},'Notaire employe':{cls:4}},
    note:'CP 216 Notariat. Regime 36h/sem. Bareme specifique. Prime de fin annee = 13eme mois.',
    grille:[
      {exp:0,c1:2242.80,c2:2468.07,c3:2728.35,c4:3500.00},
      {exp:5,c1:2350.00,c2:2590.00,c3:2870.00,c4:3680.00},
      {exp:10,c1:2460.00,c2:2715.00,c3:3015.00,c4:3865.00}
    ]},

  '218':{n:'CPNAE employes (secteur alimentaire)',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Employe Cat.1':{cls:1},'Employe Cat.2':{cls:2},'Employe Cat.3':{cls:3},'Employe Cat.4':{cls:4}},
    note:'CP 218 Employes industrie alimentaire. Liee a CP 118. Baremes specifiques au secteur.',
    grille:[
      {exp:0,c1:2200.00,c2:2420.00,c3:2660.00,c4:2940.00},
      {exp:5,c1:2290.00,c2:2520.00,c3:2770.00,c4:3060.00},
      {exp:10,c1:2380.00,c2:2620.00,c3:2880.00,c4:3180.00}
    ]},

  '302':{n:'Industrie hoteliere (Horeca)',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Cat.I':{cls:1},'Cat.II':{cls:2},'Cat.III':{cls:3},'Cat.IV':{cls:4},'Cat.V (chef)':{cls:5}},
    note:'CP 302 Horeca. Nourritures + pourboires possibles. Prime de fin annee sectorielle. Flexi-jobs autorises.',
    grille:[
      {exp:0,c1:2504.53,c2:2519.02,c3:2629.69,c4:2742.93,c5:2862.05},
      {exp:5,c1:2555.00,c2:2570.00,c3:2683.00,c4:2798.00,c5:2920.00},
      {exp:10,c1:2607.00,c2:2622.00,c3:2737.00,c4:2855.00,c5:2979.00}
    ]},

  '306':{n:'Entreprises assurances',idx:2.23,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Employe Cat.A':{cls:1},'Employe Cat.B':{cls:2},'Employe Cat.C':{cls:3},'Employe Cat.D':{cls:4}},
    note:'CP 306 Entreprises assurances. AG, AXA, Ethias. Idx 2,23% au 01/01/2026.',
    grille:[
      {exp:0,c1:2400.00,c2:2650.00,c3:2950.00,c4:3400.00},
      {exp:5,c1:2520.00,c2:2785.00,c3:3100.00,c4:3570.00},
      {exp:10,c1:2645.00,c2:2925.00,c3:3255.00,c4:3750.00}
    ]},

  '310':{n:'Banques',idx:2.0,dt:'01/01/2026',regime:37,approx:false,
    fn:{'Employe Cat.A':{cls:1},'Employe Cat.B':{cls:2},'Employe Cat.C':{cls:3},'Employe Cat.D':{cls:4},'Cadre':{cls:5}},
    note:'CP 310 Banques. Regime 37h/sem. BNP Paribas Fortis, ING, KBC, Belfius. Avantages extra-legaux importants.',
    grille:[
      {exp:0,c1:2600.00,c2:2900.00,c3:3248.00,c4:3700.00,c5:4200.00},
      {exp:5,c1:2730.00,c2:3045.00,c3:3410.00,c4:3885.00,c5:4410.00},
      {exp:10,c1:2865.00,c2:3195.00,c3:3580.00,c4:4080.00,c5:4630.00}
    ]},

  '314':{n:'Coiffure et soins de beaute',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Debutant':{cls:1},'Qualifie':{cls:2},'Specialise':{cls:3},'Gerant salon':{cls:4}},
    note:'CP 314 Coiffure, esthetique, fitness. Baremes specifiques. Pourboires non declares frequents.',
    grille:[
      {exp:0,c1:2050.00,c2:2280.00,c3:2350.00,c4:2600.00},
      {exp:5,c1:2120.00,c2:2355.00,c3:2430.00,c4:2690.00},
      {exp:10,c1:2195.00,c2:2435.00,c3:2515.00,c4:2785.00}
    ]},

  '330':{n:'Etablissements et services de sante',idx:2.0,dt:'01/01/2026',regime:38,approx:false,
    fn:{'Cat.1 Agent entretien':{cls:1},'Cat.2 Brancardier':{cls:2},'Cat.3 Aide-soignant':{cls:3},'Cat.4 Infirmier':{cls:4},'Cat.5 Infirmier specialise':{cls:5},'Cat.6 Medecin':{cls:6}},
    note:'CP 330 Sante. Hopitaux, cliniques, MRS. Baremes IFIC depuis 2018. Maribel social. Primes de nuit/WE.',
    grille:[
      {exp:0,c1:2254.03,c2:2371.89,c3:2463.41,c4:2682.04,c5:2900.00,c6:5609.78},
      {exp:5,c1:2340.00,c2:2462.00,c3:2558.00,c4:2785.00,c5:3015.00,c6:5830.00},
      {exp:10,c1:2428.00,c2:2556.00,c3:2656.00,c4:2892.00,c5:3135.00,c6:6060.00}
    ]},

};

function getBareme(cp,fnName,anciennete){
  const bar=BAREMES[cp];if(!bar)return null;
  const classe=bar.fnClassMap?.[fnName];if(!classe)return null;
  if(bar.type==='monthly'){
    const years=Object.keys(bar.grid).map(Number).sort((a,b)=>a-b);
    let yr=years[0];for(const y of years){if(anciennete>=y)yr=y;else break;}
    const monthly=bar.grid[yr]?.[classe];if(!monthly)return null;
    return{monthly,hourly:+(monthly/164.6666).toFixed(4),classe,classLabel:bar.classes[classe],ancYr:yr,cp,type:"monthly",indexDate:bar.indexDate,indexPct:bar.indexPct,regime:bar.regime};
  }
  if(bar.type==='hourly'){
    let hourly;
    if(typeof Object.values(bar.grid)[0]==='object'){
      const years=Object.keys(bar.grid).map(Number).sort((a,b)=>a-b);
      let yr=years[0];for(const y of years){if(anciennete>=y)yr=y;else break;}
      hourly=bar.grid[yr]?.[classe];
    } else { hourly=bar.grid[classe]; }
    if(!hourly)return null;
    const factor=bar.monthlyFactor||((bar.weeklyH||38)*52/12);
    return{monthly:+(hourly*factor).toFixed(2),hourly,classe,classLabel:bar.classes[classe],ancYr:anciennete,cp,type:"hourly",indexDate:bar.indexDate,indexPct:bar.indexPct,regime:bar.regime};
  }
  return null;
}

function getCPAvantages(cp){
  const bar=BAREMES[cp];if(!bar)return[];const avs=[];
  if(bar.primeAnnuelle)avs.push({l:"Prime annuelle (juin)",v:fmt(bar.primeAnnuelle)});
  if(bar.primeFinAnnee)avs.push({l:"Prime fin d\'année",v:bar.primeFinAnnee});
  if(bar.ecoChequesMax)avs.push({l:"Éco-chèques (max/an)",v:fmt(bar.ecoChequesMax)});
  if(bar.transport?.velo)avs.push({l:"Indemnité vélo",v:`${bar.transport.velo} €/km (max ${bar.transport.maxVeloJour}€/jour)`});
  if(bar.timbreFidelite)avs.push({l:"Timbres fidélité",v:`${(bar.timbreFidelite*100)}% sal. annuel`});
  if(bar.timbreIntemperie)avs.push({l:"Timbres intempéries",v:`${(bar.timbreIntemperie*100)}% sal. annuel`});
  if(bar.mobilite)avs.push({l:"Indemnité mobilité",v:`${bar.mobilite.parKm} €/km (max ${bar.mobilite.maxKm}km)`});
  if(bar.reposComp)avs.push({l:"Jours repos compensatoires",v:`${bar.reposComp} jours/an`});
  if(bar.primeNuit)avs.push({l:"Prime nuit",v:`+${(bar.primeNuit*100)}%`});
  if(bar.primeWeekendSam)avs.push({l:"Prime samedi",v:`+${(bar.primeWeekendSam*100)}%`});
  if(bar.primeWeekendDim)avs.push({l:"Prime dimanche",v:`+${(bar.primeWeekendDim*100)}%`});
  if(bar.primeAttractivite)avs.push({l:"Prime attractivité",v:`${(bar.primeAttractivite*100)}%`});
  if(bar.indemniteNuit)avs.push({l:"Indemnité nuit (0h-5h)",v:`${bar.indemniteNuit} €/h`});
  if(bar.indemniteVetements)avs.push({l:"Indemnité vêtements",v:`${bar.indemniteVetements} €/jour`});
  return avs;
}

// ─── PAYROLL CALCULATION ENGINE (Formule-clé SPF Finances) ───
function calc(emp, per, co) {
  const r = {};
  const hr = (emp.monthlySalary||0) / (LEGAL.WD * LEGAL.WHD);
  r.base = emp.monthlySalary || 0;
  r.overtime = (per.overtimeH||0) * hr * 1.5;
  r.sunday = (per.sundayH||0) * hr * 2;
  r.night = (per.nightH||0) * hr * 1.25;
  r.bonus = per.bonus || 0;
  r.y13 = per.y13 || 0;
  r.sickPay = (per.sickG||0) * (r.base / LEGAL.WD);
  r.gross = r.base + r.overtime + r.sunday + r.night + r.bonus + r.y13 + r.sickPay;

  // ── HEURES SUP VOLONTAIRES BRUT=NET (Nouveau régime 01/04/2026 + Relance T1) ──
  // 360h/an (450h horeca), dont 240h (360h horeca) exonérées ONSS+PP = brut=net
  // Pas de sursalaire, pas de repos compensatoire. Accord écrit 1 an.
  // Heures relance (T1/2026 transitoire): 120h brut=net, déduites du quota 240h
  r.hsVolontBrutNet = (per.hsVolontBrutNet||0) * hr; // montant brut=net (pas de sursalaire)
  r.hsRelance = (per.hsRelance||0) * hr;
  r.hsBrutNetTotal = r.hsVolontBrutNet + r.hsRelance; // total brut=net (non soumis ONSS/PP)

  // ── MI-TEMPS MÉDICAL / REPRISE PROGRESSIVE (Art. 100§2 Loi coord. 14/07/1994) ──
  // Le travailleur reconnu en incapacité par le médecin-conseil de la mutuelle
  // reprend le travail à temps partiel avec l'accord du médecin du travail.
  //
  // Mécanisme:
  //   1. L'employeur paie le salaire PROPORTIONNEL aux heures prestées
  //   2. L'INAMI (mutuelle) verse un COMPLÉMENT d'indemnités au travailleur
  //   3. Le complément INAMI = 60% du brut normal × (heures non prestées / heures normales)
  //      mais plafonné et avec règle de cumul (max 20% de perte par rapport à avant l'incapacité)
  //
  // Impact sur la fiche de paie:
  //   - Brut = prorata des heures prestées (pas le brut normal!)
  //   - ONSS = calculé sur le brut prorata (pas sur le brut normal)
  //   - PP = calculé sur le brut prorata (barème temps partiel)
  //   - L'indemnité INAMI est hors fiche de paie (versée directement par la mutuelle)
  //   - Mention "pour mémoire" du complément INAMI sur la fiche
  //
  // Formulaires:
  //   - C3.2: déclaration de reprise au médecin-conseil
  //   - E10: évaluation médecin du travail (formulaire de réintégration)
  //   - DRS (eBox): déclaration reprise du travail à la mutuelle
  //
  // Durée: illimitée (aussi longtemps que le médecin-conseil autorise)
  // ONSS: sur brut prorata uniquement
  // PP: barème proportionnel temps partiel (fraction d'occupation)
  r.miTempsMed = per.miTempsMed || false;
  r.miTempsHeures = per.miTempsHeures || 0;
  r.miTempsFraction = 1; // fraction d'occupation
  r.miTempsINAMI = per.miTempsINAMI || 0;
  r.miTempsBrutOriginal = r.base; // brut avant prorata

  if (r.miTempsMed && r.miTempsHeures > 0 && (emp.whWeek || 38) > 0) {
    r.miTempsFraction = r.miTempsHeures / (emp.whWeek || 38);
    // Recalculer le brut au prorata des heures prestées
    r.base = Math.round((emp.monthlySalary || 0) * r.miTempsFraction * 100) / 100;
    // Recalculer les composantes proportionnelles
    r.sickPay = (per.sickG || 0) * (r.base / LEGAL.WD);
    r.gross = r.base + r.overtime + r.sunday + r.night + r.bonus + r.y13 + r.sickPay;
    // Estimation du complément INAMI si pas renseigné
    // Règle: 60% du brut limité (plafonné à ≈ 106,16€/j en 2026) × fraction non prestée
    if (r.miTempsINAMI === 0) {
      const brutJourNormal = (emp.monthlySalary || 0) / LEGAL.WD;
      const plafondINAMI = 106.16; // plafond journalier INAMI 2026 (adapté)
      const brutJourPlafonné = Math.min(brutJourNormal, plafondINAMI);
      const tauxINAMI = 0.60; // 60% (cohabitant) — peut être 65% (chef de famille) ou 55% (isolé)
      r.miTempsINAMI = Math.round(brutJourPlafonné * tauxINAMI * LEGAL.WD * (1 - r.miTempsFraction) * 100) / 100;
    }
  }

  // ── ATN Voiture de société (Art. 36 CIR 92) ──
  r.atnCar = 0; r.atnPct = 0; r.cotCO2 = 0;
  const carFuel = emp.carFuel || 'none';
  const carCO2 = parseInt(emp.carCO2) || 0;
  const carCatVal = parseFloat(emp.carCatVal) || 0;
  if (carFuel !== 'none' && carCatVal > 0) {
    if (carFuel === 'electrique') {
      r.atnPct = 4;
      r.atnCar = Math.max(1600/12, (carCatVal * (6/7) * 0.04) / 12);
      r.cotCO2 = LOIS_BELGES.vehicules.cotCO2Min; // minimum légal (source: lois-belges)
    } else {
      const refCO2 = (carFuel === 'diesel') ? 84 : 102;
      const delta = carCO2 - refCO2;
      r.atnPct = Math.max(4, Math.min(18, 5.5 + (delta * 0.1)));
      r.atnCar = Math.max(1600/12, (carCatVal * (6/7) * (r.atnPct/100)) / 12);
      // Cotisation CO2 patronale (solidarité ONSS)
      const _co2min = LOIS_BELGES.vehicules.cotCO2Min;
      if (carFuel === 'diesel') r.cotCO2 = Math.max(_co2min, (carCO2 * 0.00714 * 71.4644) + _co2min);
      else r.cotCO2 = Math.max(_co2min, (carCO2 * 0.00714 * 83.6644) + _co2min);
    }
  }

  // ── MOTO DE SOCIÉTÉ (Art. 36 CIR 92 — même régime que voiture) ──
  r.atnMoto = 0; r.atnPctMoto = 0; r.cotCO2Moto = 0;
  const motoFuel = emp.motoFuel || 'essence';
  const motoCO2 = parseInt(emp.motoCO2) || 0;
  const motoCatVal = parseFloat(emp.motoCatVal) || 0;
  if (emp.motoSociete && motoCatVal > 0) {
    if (motoFuel === 'electrique') {
      r.atnPctMoto = 4;
      r.atnMoto = Math.max(1600/12, (motoCatVal * (6/7) * 0.04) / 12);
      r.cotCO2Moto = LOIS_BELGES.vehicules.cotCO2Min;
    } else {
      const refCO2Moto = motoFuel === 'diesel' ? 84 : 102;
      const deltaMoto = motoCO2 - refCO2Moto;
      r.atnPctMoto = Math.max(4, Math.min(18, 5.5 + (deltaMoto * 0.1)));
      r.atnMoto = Math.max(1600/12, (motoCatVal * (6/7) * (r.atnPctMoto/100)) / 12);
      r.cotCO2Moto = Math.max(LOIS_BELGES.vehicules.cotCO2Min, (motoCO2 * 0.00714 * 83.6644) + LOIS_BELGES.vehicules.cotCO2Min);
    }
  }

  // ── ATN Autres avantages en nature (AR 18/12/2024 — Forfaits 2026) ──
  r.atnGSM = emp.atnGSM ? 3.00 : 0;         // 36€/an = 3€/mois
  r.atnPC = emp.atnPC ? 6.00 : 0;            // 72€/an = 6€/mois
  r.atnInternet = emp.atnInternet ? 5.00 : 0; // 60€/an = 5€/mois
  r.atnChauffage = emp.atnChauffage ? 177.50 : 0; // 2.130€/an = 177,50€/mois
  r.atnElec = emp.atnElec ? 88.33 : 0;       // 1.060€/an = 88,33€/mois
  // ATN Logement gratuit (Art. 18 AR/CIR92 — Forfaits 2026)
  // Non-dirigeant: forfait fixe = RC indexé × 100/60
  // Dirigeant (statut=dirigeant): RC indexé × 100/60 × 3,80 (coeff. dirigeant)
  // Coefficient indexation RC 2026: 2,1763 (exercice d'imposition 2027)
  // Si meublé: + 5/3 du montant
  r.atnLogement = 0;
  if (emp.atnLogement && parseFloat(emp.atnLogementRC) > 0) {
    const rc = parseFloat(emp.atnLogementRC);
    const rcIndex = rc * 2.1763; // RC indexé 2026
    const isDirigeant = (emp.statut === 'dirigeant');
    if (isDirigeant) {
      // Dirigeant: RC indexé × 100/60 × coeff. 3,80 (si RC > 745€) ou × 1,25 (si RC ≤ 745€)
      r.atnLogement = rc <= 745
        ? (rcIndex * 100 / 60 * 1.25) / 12
        : (rcIndex * 100 / 60 * 3.80) / 12;
    } else {
      // Non-dirigeant: forfait fixe par RC non indexé
      r.atnLogement = (rcIndex * 100 / 60) / 12;
    }
  }
  r.atnAutresTot = r.atnGSM + r.atnPC + r.atnInternet + r.atnChauffage + r.atnElec + r.atnLogement + r.atnMoto;
  r.atnTotal = r.atnCar + r.atnMoto + r.atnAutresTot;

  // ── VÉLO DE SOCIÉTÉ (Loi 25/11/2021 + Art. 38§1er 14°a CIR 92) ──
  // Depuis 01/01/2024: l'ATN vélo de société = 0€ (exonéré IPP et ONSS)
  // Conditions: usage effectif pour déplacements domicile-travail (même partiel)
  // L'employeur supporte le coût du leasing (déductible 100%)
  // Types: vélo classique, vélo électrique (≤25km/h), speed pedelec (≤45km/h)
  // CUMULABLE avec l'indemnité vélo 0,27€/km (pour les km effectivement parcourus)
  // Le speed pedelec est fiscalement assimilé à un vélo (pas une moto)
  r.veloSociete = emp.veloSociete || false;
  r.veloType = emp.veloType || 'none';
  r.atnVelo = 0; // ATN = 0€ depuis 01/01/2024 (exonéré)
  r.veloLeasingMois = emp.veloLeasingMois || 0; // coût employeur
  r.veloValeur = emp.veloValeur || 0;

  // Indemnité vélo cumulable: 0,27€/km A/R même avec vélo de société
  // → déjà calculée dans r.transport si commType === 'bike'

  // ── CARTE CARBURANT / RECHARGE (Art. 36§2 CIR 92) ──
  // La carte carburant liée à une voiture de société est incluse dans l'ATN voiture
  // (pas d'ATN séparé) SAUF si la carte permet un usage privé illimité:
  //   → L'ATN voiture couvre déjà les frais de carburant
  //   → Si carte carburant SANS voiture de société = avantage imposable à 100%
  r.carteCarburant = emp.carteCarburant || false;
  r.carteCarburantMois = emp.carteCarburantMois || 0;
  // Si pas de voiture de société mais carte carburant → ATN = montant total
  r.atnCarteCarburant = (r.carteCarburant && !r.atnCar) ? r.carteCarburantMois : 0;
  // Si voiture de société + carte carburant → inclus dans ATN voiture (pas d'ATN supplémentaire)

  // ── BORNE DE RECHARGE DOMICILE (Art. 14536 CIR 92 + Loi 25/11/2021) ──
  // L'employeur peut installer une borne de recharge au domicile du travailleur
  // Pas d'ATN pour le travailleur si la borne sert à recharger la voiture de société
  // L'employeur déduit le coût à 100% (si borne intelligente bidirectionnelle)
  // L'électricité de recharge pour usage privé: ATN = coût réel ou forfait
  r.borneRecharge = emp.borneRecharge || false;
  r.borneRechargeCoût = emp.borneRechargeCoût || 0;
  // ATN borne: 0€ si voiture de société (fait partie du package)
  // ATN borne: coût réel si pas de voiture de société
  r.atnBorne = (r.borneRecharge && !r.atnCar) ? r.borneRechargeCoût : 0;

  // Ajouter aux ATN autres si applicable
  r.atnAutresTot += r.atnCarteCarburant + r.atnBorne;
  r.atnTotal = r.atnCar + r.atnMoto + r.atnAutresTot;

  // ── ONSS Travailleur ──
  const isOuvrier = (emp.statut === 'ouvrier');
  const onssBase = isOuvrier ? r.gross * LEGAL.ONSS_DETAIL_2026.majoration_ouvrier : r.gross;
  r.onssW = onssBase * LEGAL.ONSS_W;
  // ── Bonus à l'emploi 2026 — Volet A (bas salaires) + Volet B (très bas salaires) ──
  // Source: Instructions ONSS T1/2026
  const BE = LEGAL.BONUS_2026;
  r.empBonusA = 0; r.empBonusB = 0;
  if (isOuvrier) {
    // Ouvrier (déclaré à 108%)
    if (r.gross * 1.08 <= BE.O_A_S2) r.empBonusA = BE.O_A_MAX;
    else if (r.gross * 1.08 <= BE.O_A_S1) r.empBonusA = Math.max(0, BE.O_A_MAX - BE.O_A_COEFF * (r.gross * 1.08 - BE.O_A_S2));
    if (r.gross * 1.08 <= BE.O_B_S2) r.empBonusB = BE.O_B_MAX;
    else if (r.gross * 1.08 <= BE.O_B_S1) r.empBonusB = Math.max(0, BE.O_B_MAX - BE.O_B_COEFF * (r.gross * 1.08 - BE.O_B_S2));
  } else {
    // Employé (déclaré à 100%)
    if (r.gross <= BE.A_S2) r.empBonusA = BE.A_MAX;
    else if (r.gross <= BE.A_S1) r.empBonusA = Math.max(0, BE.A_MAX - BE.A_COEFF * (r.gross - BE.A_S2));
    if (r.gross <= BE.B_S2) r.empBonusB = BE.B_MAX;
    else if (r.gross <= BE.B_S1) r.empBonusB = Math.max(0, BE.B_MAX - BE.B_COEFF * (r.gross - BE.B_S2));
  }
  r.empBonus = Math.min(r.empBonusA + r.empBonusB, r.onssW); // ne peut dépasser cotisation perso
  r.onssNet = r.onssW - r.empBonus;

  // ── ONSS Employeur ──
  const sectInfo = LEGAL.ONSS_SECTEUR[emp.cp] || LEGAL.ONSS_SECTEUR['default'];
  r.onssE_rate = sectInfo.e;
  r.onssE = onssBase * sectInfo.e;
  r.onssE_note = sectInfo.note;
  r.onssE_type = sectInfo.type || 'marchand';
  // Cotisations spéciales patronales
  r.onss_ffe = onssBase * (emp.staffCount >= 20 ? LEGAL.ONSS_DETAIL_2026.ffe_grand : LEGAL.ONSS_DETAIL_2026.ffe_petit);
  r.onss_chomTemp = onssBase * LEGAL.ONSS_DETAIL_2026.chomage_temp;
  r.onss_amiante = onssBase * LEGAL.ONSS_DETAIL_2026.amiante;

  // ── Réduction structurelle ONSS T1/2026 ──
  // Formule: Ps = R × µ × (J/D) — R = F + α(S0-S) + γ(S2-S) + δ(W-S1)
  // S = salaire trimestriel de référence, W = salaire trimestriel réel
  // Source: ONSS Instructions administratives + Easypay Group 09/01/2026
  const RS = LEGAL.RED_STRUCT_2026;
  const salTrim = r.gross * 3; // salaire trimestriel
  const salRef = salTrim; // temps plein = salaire réel (proratisé si TP partiel)
  // Fraction de prestation (µ) — Art. 353bis/5 Loi-programme 24/12/2002
  // Temps partiel: fraction = heures prestées / heures temps plein
  const fractionPrest = emp.regime === 'full' ? 1 : (emp.whWeek || 38) / 38;
  r.redStructCat = r.onssE_type === 'non-marchand' ? 2 :
    (emp.statut === 'eta' ? 3 : (emp.statut === 'eta_handi' ? 4 : 1));
  // cat 1=marchand, 2=non-marchand, 3=ETA, 4=ETA handicapé
  let redR = 0;
  if (r.redStructCat === 1) {
    // Catégorie 1: secteur marchand privé
    const compBas = salRef < RS.CAT1_S0 ? RS.CAT1_alpha * (RS.CAT1_S0 - salRef) : 0;
    const compTBas = salRef < RS.CAT1_S2 ? RS.CAT1_gamma * (RS.CAT1_S2 - salRef) : 0;
    redR = RS.CAT1_F + compBas + compTBas;
  } else if (r.redStructCat === 2) {
    // Catégorie 2: Maribel social / non-marchand
    const compBas = salRef < RS.CAT2_S0 ? RS.CAT2_alpha * (RS.CAT2_S0 - salRef) : 0;
    const compTBas = salRef < RS.CAT2_S2 ? RS.CAT2_gamma * (RS.CAT2_S2 - salRef) : 0;
    const compHaut = salRef > RS.CAT2_S1 ? RS.CAT2_delta * (salRef - RS.CAT2_S1) : 0;
    redR = RS.CAT2_F + compBas + compTBas + compHaut;
  } else if (r.redStructCat === 3) {
    // Catégorie 3: Entreprises de travail adapté (ETA)
    const compBas = salRef < RS.CAT3_S0 ? RS.CAT3_alpha * (RS.CAT3_S0 - salRef) : 0;
    const compTBas = salRef < RS.CAT3_S2 ? RS.CAT3_gamma * (RS.CAT3_S2 - salRef) : 0;
    redR = RS.CAT3_F + compBas + compTBas;
  } else if (r.redStructCat === 4) {
    // Catégorie 3bis: ETA travailleurs moins valides
    const compBas = salRef < RS.CAT3B_S0 ? RS.CAT3B_alpha * (RS.CAT3B_S0 - salRef) : 0;
    const compTBas = salRef < RS.CAT3B_gamma ? RS.CAT3B_gamma * (RS.CAT3B_S2 - salRef) : 0;
    redR = RS.CAT3B_F + compBas + compTBas;
  }
  // Appliquer la fraction de prestation (temps partiel)
  redR = Math.max(0, redR * fractionPrest);
  // Plancher: la réduction ne peut pas être négative
  // Plafond: la réduction ne peut pas excéder les cotisations patronales dues
  r.redStruct = Math.min(redR, r.onssE * 3); // montant trimestriel de réduction (plafonné)
  r.redStructMois = Math.round(r.redStruct / 3 * 100) / 100; // mensualisé
  r.redStructFraction = fractionPrest;
  // Appliquer réduction sur cotisation patronale effective
  r.onssE = Math.max(0, r.onssE - r.redStructMois);

  // ATN ajouté au revenu imposable (pas à l'ONSS, pas au brut payé)
  r.taxGross = r.gross - r.onssNet + r.atnCar + r.atnAutresTot;

  // ── TRAVAILLEUR FRONTALIER / TRANSFRONTALIER ──
  // Règlement (CE) 883/2004 + Conventions bilatérales CPDI
  //
  // PRINCIPE ONSS (Art. 11-16 Règl. 883/2004):
  //   → Lieu de TRAVAIL détermine le pays ONSS (lex loci laboris)
  //   → Travaille en Belgique = ONSS belge, même si réside en FR/NL/DE/LU
  //   → Exception: télétravail frontalier > 25% → accord cadre multi-État
  //
  // PRINCIPE PP / IMPÔT (Conventions préventives double imposition):
  //
  // 1. BELGIQUE ↔ FRANCE (Convention 10/03/1964 + Avenants):
  //   - Ancien régime frontalier (abrogé 01/01/2012): le frontalier FR travaillant
  //     en BE payait l'impôt en France → exonération PP en Belgique
  //   - RÉGIME ACTUEL: PP retenu en Belgique (pays de travail)
  //     Le travailleur FR déclare en France mais obtient un crédit d'impôt
  //     pour l'impôt belge payé (Art. 15 + Art. 19 Convention)
  //   - Formulaire 276 Front.: attestation de résidence fiscale française
  //
  // 2. BELGIQUE ↔ PAYS-BAS (Convention 05/06/2001):
  //   - PP retenu en Belgique. Le travailleur NL déclare aux Pays-Bas
  //     avec crédit d'impôt belge (méthode exemption avec progression)
  //   - Depuis 2003: plus de régime frontalier spécial
  //   - Le NL résident peut opter pour "kwalificerend buitenlands belastingplichtige"
  //
  // 3. BELGIQUE ↔ ALLEMAGNE (Convention 11/04/1967 + Protocole 2002):
  //   - PP retenu en Belgique. Crédit d'impôt en Allemagne.
  //   - Pas de régime frontalier spécial
  //
  // 4. BELGIQUE ↔ LUXEMBOURG (Convention 17/09/1970):
  //   - PP retenu en Belgique pour travail presté en Belgique
  //   - Particularité: règle des 24 jours de tolérance (accord amiable 2015)
  //     → max 24j/an de télétravail depuis le Luxembourg sans changer l'imposition
  //
  // IMPACT SUR LE CALCUL:
  //   - ONSS: toujours belge si le travail est presté en Belgique
  //   - PP: normalement retenu en Belgique (pas d'exonération)
  //   - Exception rare: exonération PP si formulaire 276 Front. + ancien régime FR
  //   - Formulaire A1: obligatoire pour les détachements > 1 pays
  //   - Limosa: déclaration obligatoire pour travailleurs détachés VERS la Belgique
  //
  r.frontalier = emp.frontalier || false;
  r.frontalierPays = emp.frontalierPays || '';
  r.frontalierExoPP = emp.frontalierExoPP || false;

  if (r.frontalier) {
    // ONSS: toujours belge (lex loci laboris) — pas de changement
    // PP: normalement retenu en Belgique
    // Si exonération PP (ancien régime FR pré-2012 — cas résiduel très rare):
    if (r.frontalierExoPP) {
      r.frontalierPPExo = r.tax; // montant PP qui serait retenu
      // r.tax reste calculé normalement pour info mais n'est pas retenu
      // → c'est au travailleur de déclarer dans son pays de résidence
    }
    // Le travailleur frontalier a droit aux mêmes avantages sociaux belges
    // (chèques-repas, transport, etc.) puisqu'il travaille en Belgique
  }

  // ── TRAVAILLEUR PENSIONNÉ — CUMUL PENSION / TRAVAIL ──
  // Réforme majeure: depuis 01/01/2015, cumul ILLIMITÉ pour:
  //   - Pension légale de retraite (pas anticipée) à l'âge légal (66 ans en 2026, 67 en 2030)
  //   - Pension anticipée après 45 ans de carrière
  //   - Pension de survie si le bénéficiaire a ≥ 65 ans
  //
  // Plafonds de cumul (si cumul LIMITÉ — AR 20/12/2006 + index):
  //   - Pension anticipée < 65 ans (salarié):
  //     Sans enfant à charge: 10.613€/an brut (2026)
  //     Avec enfant à charge: 13.266€/an brut (2026)
  //   - Pension de survie < 65 ans:
  //     Sans enfant à charge: 22.509€/an brut (2026)
  //     Avec enfant à charge: 28.136€/an brut (2026)
  //   → En cas de dépassement: pension réduite du % de dépassement (Art. 64 AR 21/12/1967)
  //
  // IMPACT ONSS:
  //   - Cotisation patronale: normale (pas de réduction spéciale)
  //   - Cotisation travailleur: cotisation de solidarité 0% (pas d'ONSS perso)
  //     si pension + revenu > plafond → retenue normale 13,07%
  //   → EN PRATIQUE: ONSS normal 13,07% s'applique (la solidarité est passée)
  //   → Le pensionné n'est PLUS exonéré d'ONSS travailleur depuis 2024
  //
  // IMPACT PP:
  //   - Barème normal appliqué (même formule-clé)
  //   - MAIS: quotité exemptée peut être différente si le pensionné
  //     cumule pension + revenu → art. 154bis CIR
  //   - La pension elle-même est imposée séparément par le SFP (précompte pension)
  //
  // FLEXI-JOB PENSIONNÉ:
  //   - Plafond 12.000€/an NE s'applique PAS aux pensionnés → cumul illimité
  //   - C'est le principal avantage du statut pensionné pour les flexi-jobs
  //
  // COTISATION SPÉCIALE 1,5% (solidarité pensionné):
  //   - Si le pensionné gagne > plafond, cotisation spéciale de solidarité
  //   - Retenue par l'employeur et versée à l'ONSS
  //   - Art. 68 Loi 30/03/1994
  //
  // SIGEDIS / SFP: l'employeur déclare les revenus via DmfA.
  //   Le SFP (Service fédéral des Pensions) vérifie le cumul automatiquement.

  r.pensionné = emp.pensionné || false;
  r.pensionType = emp.pensionType || 'none';
  r.pensionCumulIllimite = emp.pensionCumulIllimite || false;
  r.pensionPlafond = 0;
  r.pensionDepassement = false;

  if (r.pensionné) {
    const age = emp.pensionAge || 0;
    const carriere = emp.pensionCarriere || 0;
    const depEnfants = emp.depChildren > 0;

    // Déterminer si cumul illimité
    if (r.pensionType === 'legal' && age >= 66) {
      r.pensionCumulIllimite = true; // Âge légal atteint (66 en 2026)
    }
    if (r.pensionType === 'anticipee' && carriere >= 45) {
      r.pensionCumulIllimite = true; // 45 ans de carrière
    }
    if (r.pensionType === 'survie' && age >= 65) {
      r.pensionCumulIllimite = true;
    }

    if (!r.pensionCumulIllimite) {
      // Plafonds de cumul annuels (indexés 2026)
      if (r.pensionType === 'anticipee') {
        r.pensionPlafond = depEnfants ? 13266 : 10613;
      } else if (r.pensionType === 'survie') {
        r.pensionPlafond = depEnfants ? 28136 : 22509;
      }
      // Vérifier si dépassement estimé
      const revenuAnnuelEstime = r.gross * 12;
      if (r.pensionPlafond > 0 && revenuAnnuelEstime > r.pensionPlafond) {
        r.pensionDepassement = true;
        r.pensionDepassPct = Math.round((revenuAnnuelEstime - r.pensionPlafond) / r.pensionPlafond * 100);
      }
    }

    // Cotisation spéciale solidarité pensionné (Art. 68 Loi 30/03/1994)
    // Si le total pension + revenus activité > seuil → retenue 0% à 2%
    // En pratique: déjà incluse dans les cotisations ONSS standard
    // Le SFP vérifie a posteriori via DmfA/SIGEDIS

    // ONSS: normal (13,07% trav + taux patronal sectoriel)
    // Pas de changement dans le calcul — tout est standard
  }

  // ── PRÉCOMPTE PROFESSIONNEL 2026 — FORMULE-CLÉ COMPLÈTE SPF FINANCES ──
  // Annexe III AR/CIR 92 — Moniteur belge — Tranches annuelles
  const PP = LEGAL.PP2026;
  const annualGross = r.taxGross * 12;

  // Étape 1: Frais professionnels forfaitaires (30%, max 5 930 €)
  const isSalarie = (emp.regime !== 'dirigeant');
  const fpPct = isSalarie ? PP.FP_PCT : PP.FP_DIR_PCT;
  const fpMax = isSalarie ? PP.FP_MAX : PP.FP_DIR_MAX;
  r.profExp_annual = Math.min(annualGross * fpPct, fpMax);
  r.profExp = r.profExp_annual / 12;

  // Étape 2: Revenu annuel net imposable
  const revNetImposable = annualGross - r.profExp_annual;

  // Étape 3: Barème 1 (isolé) ou Barème 2 (quotient conjugal)
  const isBareme2 = (emp.civil === 'married_1'); // conjoint sans revenus
  let revPrincipal = revNetImposable;
  let revConjoint = 0;
  if (isBareme2) {
    revConjoint = Math.min(revNetImposable * PP.QC_PCT, PP.QC_MAX);
    revPrincipal = revNetImposable - revConjoint;
  }

  // Étape 4: Calcul impôt progressif annuel (sur revenu principal)
  const calcImpotAnnuel = (rev) => {
    let impot = 0; let reste = Math.max(0, rev);
    let prev = 0;
    for (const tr of PP.TRANCHES) {
      const tranche = Math.min(reste, tr.lim - prev);
      impot += tranche * tr.rate;
      reste -= tranche;
      prev = tr.lim;
      if (reste <= 0) break;
    }
    return impot;
  };

  let impotAnnuel = calcImpotAnnuel(revPrincipal);
  if (isBareme2 && revConjoint > 0) {
    impotAnnuel += calcImpotAnnuel(revConjoint);
  }

  // Étape 5: Déduction quotité exemptée d'impôt
  const quotiteExempt = PP.EXEMPT * (isBareme2 ? 2 : 1);
  const reductionExempt = calcImpotAnnuel(quotiteExempt);
  impotAnnuel -= reductionExempt;

  // Étape 6: Réductions annuelles charges de famille
  let redFam = 0;
  const ch = emp.depChildren || 0;
  if (ch > 0 && ch <= 5) redFam += PP.RED.enfants[ch];
  else if (ch > 5) redFam += PP.RED.enfants[5] + (ch - 5) * PP.RED.enfantX;
  if (emp.handiChildren > 0) redFam += emp.handiChildren * PP.RED.handicap;
  if (emp.civil === 'single' && ch === 0) redFam += PP.RED.isolee;
  if ((emp.civil === 'single' || emp.civil === 'widowed') && ch > 0) redFam += PP.RED.veuf_enfant;
  // Ascendants ≥ 65 ans à charge (Art. 132 CIR 92 — revenus nets < 3.820€)
  const depAsc = emp.depAscendant || 0;
  const depAscHandi = emp.depAscendantHandi || 0;
  if (depAsc > 0) redFam += depAsc * PP.RED.ascendant65;
  if (depAscHandi > 0) redFam += depAscHandi * PP.RED.ascendant65_handi;
  // Conjoint handicapé (Art. 132 CIR — supplément quotité exemptée)
  if (emp.conjointHandicap) redFam += PP.RED.handicap;
  // Autres personnes à charge (Art. 136 CIR — max 3.820€ revenus nets)
  const depAutres = emp.depAutres || 0;
  if (depAutres > 0) redFam += depAutres * PP.RED.isolee; // même réduction qu'isolé par personne
  impotAnnuel -= redFam;

  // Étape 7: Précompte mensuel = impôt annuel / 12
  r.baseTax = Math.max(0, impotAnnuel) / 12;
  r.famRed = redFam / 12;
  r.taxNet = revNetImposable / 12;
  r.tax = Math.max(0, r.baseTax);
  // ── Bonus à l'emploi FISCAL (réduction précompte professionnel) ──
  // 33,14% du volet A + 52,54% du volet B (depuis 01/04/2024)
  r.empBonusFiscA = r.empBonusA * 0.3314;
  r.empBonusFiscB = r.empBonusB * 0.5254;
  r.empBonusFisc = r.empBonusFiscA + r.empBonusFiscB;
  r.tax = Math.max(0, r.tax - r.empBonusFisc);

  // Special SS contribution (Art. 106-112 Loi-programme 30/12/1988)
  // Barème trimestriel — retenue mensuelle = 1/3 du montant trimestriel
  // Différent pour isolés vs ménages avec 2 revenus
  // Source: socialsecurity.be montants-socio-juridiques 2026
  r.css = 0;
  const grossTrim = r.gross * 3; // salaire trimestriel
  const grossTrimOuv = isOuvrier ? grossTrim * 1.08 : grossTrim;
  // Calcul trimestriel puis division par 3
  if (emp.civil === 'married_2' || emp.civil === 'cohabit') {
    // MÉNAGE 2 REVENUS
    if (grossTrimOuv <= 5836.14) r.css = 0;
    else if (grossTrimOuv <= 6570.54) r.css = Math.max(9.30, (grossTrimOuv - 5836.14) * 0.076) / 3;
    else if (grossTrimOuv <= 18116.46) r.css = Math.min(51.64, 18.60 + (grossTrimOuv - 6570.54) * 0.011) / 3;
    else r.css = 51.64 / 3;
    // Plafond mensuel ménage 2 revenus = 51.64€/trim = 17.21€/mois
    r.css = Math.min(r.css, 51.64 / 3);
  } else {
    // ISOLÉ / conjoint SANS revenus
    if (grossTrimOuv <= 5836.14) r.css = 0;
    else if (grossTrimOuv <= 6570.54) r.css = (grossTrimOuv - 5836.14) * 0.076 / 3;
    else if (grossTrimOuv <= 18116.46) r.css = Math.min(60.94, 18.60 + (grossTrimOuv - 6570.54) * 0.011) / 3;
    else r.css = 60.94 / 3;
    // Plafond mensuel isolé = 60.94€/trim = 20.31€/mois
    r.css = Math.min(r.css, 60.94 / 3);
  }
  r.css = Math.round(r.css * 100) / 100;
  r.cssTrimMax = (emp.civil === 'married_2' || emp.civil === 'cohabit') ? 154.92 : 182.82;
  r.cssAnnuelMax = (emp.civil === 'married_2' || emp.civil === 'cohabit') ? 619.68 : 731.28;

  r.mvDays = per.days || Math.round(LEGAL.WD);
  r.mvWorker = r.mvDays * (emp.mvW || 0);
  r.mvEmployer = r.mvDays * (emp.mvE || 0);
  r.transport = 0; r.transportDetail = '';
  const cDist = parseFloat(emp.commDist) || 0;
  const cMonth = parseFloat(emp.commMonth) || 0;
  const cType = emp.commType || 'none';
  const wDays = per.days || 21;
  if (cType === 'train' && cMonth > 0) {
    // SNCB: intervention obligatoire 75% abonnement (CCT 19/9 du 26/03/2004)
    r.transport = cMonth * 0.75;
    r.transportDetail = `Train: 75% × ${fmt(cMonth)} = ${fmt(r.transport)}`;
  } else if (cType === 'bus' && cMonth > 0) {
    // Transport en commun autre: intervention = prix abo SNCB même distance (CCT 19/9)
    r.transport = cMonth * 0.75;
    r.transportDetail = `Bus/Tram: 75% × ${fmt(cMonth)} = ${fmt(r.transport)}`;
  } else if (cType === 'bike' && cDist > 0) {
    // Vélo: 0,27 €/km A/R (2026) — exonéré ONSS et IPP
    r.transport = cDist * 2 * wDays * 0.27;
    r.transportDetail = `Vélo: ${cDist}km × 2 × ${wDays}j × 0,27€ = ${fmt(r.transport)}`;
  } else if (cType === 'car' && cDist > 0) {
    // Voiture privée: pas d'obligation légale sauf CCT sectorielle
    // Si employeur intervient: exonération ONSS max 490€/an (2026) = 40,83€/mois
    // Calcul forfaitaire courant: barème SNCB pour distance équivalente
    r.transport = Math.min(40.83, cDist * 0.15 * wDays); // estimation
    r.transportDetail = `Voiture: ${cDist}km, interv. max exonérée ${fmt(r.transport)}/mois`;
  } else if (cType === 'carpool' && cDist > 0) {
    r.transport = Math.min(40.83, cDist * 0.15 * wDays);
    r.transportDetail = `Covoiturage: idem voiture`;
  } else if (cType === 'mixed' && cMonth > 0) {
    // Combiné: train + vélo possible
    r.transport = cMonth * 0.75 + (cDist > 0 ? cDist * 2 * wDays * 0.27 : 0);
    r.transportDetail = `Combiné: train ${fmt(cMonth * 0.75)} + vélo ${fmt(cDist * 2 * wDays * 0.27)}`;
  }
  r.expense = emp.expense || 0;
  r.garnish = per.garnish || 0;
  r.advance = per.advance || 0;
  r.otherDed = per.otherDed || 0;
  // ── PP VOLONTAIRE (Art. 275§1 CIR 92 + AR/PP Art. 88) ──
  // Le travailleur peut demander par écrit à l'employeur de retenir un PP supplémentaire
  // au-delà du minimum légal. Récupérable via déclaration IPP si trop-retenu.
  // L'employeur est tenu de reverser l'intégralité au SPF Finances.
  // Base: AR 09/01/2024 fixant les barèmes de PP — dispense n'affecte pas ce montant.
  r.ppVolontaire = per.ppVolontaire || 0;

  // ══════════════════════════════════════════════════════════════
  //  ÉLÉMENTS FISCAUX COMPLETS — Art. CIR 92 / Loi ONSS 27/06/1969
  // ══════════════════════════════════════════════════════════════

  // ── 1. DOUBLE PÉCULE VACANCES (Employés — payé par employeur) ──
  // Art. 19 §2 AR 28/11/1969 — ONSS sur 2ème partie (7%) uniquement
  // Double pécule = 92% du brut (85% = 1ère partie + 7% = 2ème partie)
  // 2ème partie soumise ONSS trav 13,07% + cotisation spéciale 1%
  r.doublePecule = per.doublePecule || 0;
  r.dpOnss = 0; r.dpCotisSpec = 0;
  if (r.doublePecule > 0) {
    const dp2 = r.doublePecule * (7/92); // extraire la 2ème partie
    r.dpOnss = dp2 * TX_ONSS_W;      // ONSS travailleur sur 2è partie
    r.dpCotisSpec = dp2 * 0.01;    // cotisation spéciale 1%
  }

  // ── 2. PÉCULE VACANCES DE DÉPART (Art. 46 Loi 12/04/1965) ──
  // Payé lors de la sortie de service — simple + double anticipé
  // Soumis ONSS 13,07% sur totalité
  r.peculeDepart = per.peculeDepart || 0;
  r.pdOnss = r.peculeDepart > 0 ? r.peculeDepart * TX_ONSS_W : 0;

  // ── 3. PRIME D'ANCIENNETÉ (Art. 19 §2 14° AR ONSS) ──
  // Exonérée ONSS et IPP si: 1× entre 25-35 ans anc. et 1× ≥ 35 ans anc.
  // Plafond 2026: max 1× brut mensuel ou fraction (prorata)
  // Montant max exonéré: employé = 1 mois brut, ouvrier = idem
  r.primeAnciennete = per.primeAnciennete || 0;
  const ancAns = emp.anciennete || 0;
  const primeAncExo = (ancAns >= 25) ? Math.min(r.primeAnciennete, emp.monthlySalary) : 0;
  r.primeAncTaxable = Math.max(0, r.primeAnciennete - primeAncExo);
  r.primeAncExoneree = primeAncExo;

  // ── 4. PRIME DE NAISSANCE / MARIAGE / ÉVÉNEMENT (Circ. ONSS 2024/1) ──
  // Exonérée ONSS si ≤ plafond (naissance: coutume, mariage: idem)
  // Considéré comme avantage social si modique et lié à événement
  r.primeNaissance = per.primeNaissance || 0;

  // ── 5. PRIME D'INNOVATION (Art. 38 §1er 25° CIR 92) ──
  // Exonérée IPP si ≤ 1 mois brut et ≤ 1× par travailleur
  // Soumise ONSS mais exonérée fiscalement
  r.primeInnovation = per.primeInnovation || 0;

  // ── 6. INDEMNITÉ TÉLÉTRAVAIL (Circ. 2021/C/20 du 26/02/2021) ──
  // Max 157,83€/mois (montant 2026 — indexé chaque année)
  // Exonérée ONSS et IPP si structurel (min 1 jour/semaine régulier)
  // Couvre: chauffage, électricité, petit matériel, amortissement mobilier
  r.indemTeletravail = Math.min(per.indemTeletravail || 0, FORF_BUREAU);

  // ── 7. INDEMNITÉ FRAIS DE BUREAU (AR/CIR92 Art. 31) ──
  // Frais propres de l'employeur — exonérés si justifiés ou forfaitaires
  // Forfait bureau: max 10% brut (tolérance admin. — non cumulable télétravail)
  r.indemBureau = per.indemBureau || 0;

  // ── 8. PENSION COMPLÉMENTAIRE — Retenue personnelle (Loi 28/04/2003 LPC) ──
  // Retenue sur salaire = cotisation personnelle du travailleur
  // Déductible fiscalement (Art. 145/1 CIR — réduction 30% avec plafond)
  // Soumise ONSS travailleur (base de calcul ONSS)
  // Cotisation Wijninckx — 12,5% depuis 2026 (Loi 18/12/2025 M.B. 30/12/2025)
  // Applicable si pension légale + compl. > pension max secteur public (97.548€/an)
  r.pensionCompl = per.pensionCompl || 0;

  // ── 9. RETENUE SYNDICALE (Art. 23 Loi 12/04/1965) ──
  // Volontaire — transmise au syndicat. Pas ONSS, réduction fiscale partielle
  r.retSyndicale = per.retSyndicale || 0;

  // ── 10. PENSION ALIMENTAIRE (Art. 1409-1412 Code judiciaire) ──
  // Saisie prioritaire — avant les autres saisies, sans barème
  r.saisieAlim = per.saisieAlim || 0;

  // ── 11. RÉDUCTION PP HEURES SUPPLÉMENTAIRES (Art. 154bis CIR 92) ──
  // Travailleur: réduction PP sur sursalaire (50% ou 100%)
  // Max 180h/an (2026 — Art.154bis §3 CIR — Accord Arizona structurel)
  // Horeca: 360h | Construction+enregistrement: 180h
  // Employeur: dispense versement PP 32,19% (Art. 275/1 CIR)
  // Applicable sur heures au-delà de 9h/j ou 38h/sem (ou limite secteur)
  const hsfisc = per.heuresSupFisc || 0;
  r.heuresSupFisc = hsfisc;
  const sursalaire = hsfisc * hr * 0.5; // sursalaire = 50% du taux horaire normal
  // Réduction travailleur: 66,81% du PP sur le sursalaire (taux barème 1 Art.154bis)
  // ou 57,75% selon barème 2
  r.redPPHeuresSup = sursalaire > 0 ? Math.round(sursalaire * 0.6681 * 100) / 100 : 0;
  r.tax = Math.max(0, r.tax - r.redPPHeuresSup);

  // ── 12. DISPENSE VERSEMENT PP NUIT/ÉQUIPES (Art. 275/5 CIR 92) ──
  // Employeur: dispense de versement PP = 22,8% (travail en équipe/nuit)
  // Ne change pas le net du travailleur, réduit le coût employeur
  r.dispensePPNuit = (per.nightH || 0) > 0 ? r.tax * 0.228 : 0;

  // ── 13. PP À TAUX EXCEPTIONNEL — Double pécule & 13è mois ──
  // (AR 09/01/2024 annexe III — Barèmes précompte professionnel)
  // Double pécule vacances: taxé à taux fixe (pas barème progressif)
  //   Taux = basé sur rémunération annuelle brute:
  //   ≤ 17.280€: 0% | ≤ 32.280€: 19,17% | ≤ 43.380€: 23,22% | > 43.380€: 30,28%
  // 13è mois: taux fixe idem (annexe III AR)
  // Indemnité de départ/préavis: taux fixe selon rémunération annuelle
  // NB: ces taux s'appliquent sur le MONTANT EXCEPTIONNEL, pas le salaire mensuel
  r.ppTauxExcep = 0; r.ppTauxExcepRate = 0;
  const typeSpec = per.typeSpecial || 'normal';
  if (typeSpec === 'doublePecule' || typeSpec === 'y13' || typeSpec === 'depart' || typeSpec === 'preavis') {
    const annBrut = r.base * 12;
    if (annBrut <= 17280) r.ppTauxExcepRate = 0;
    else if (annBrut <= 32280) r.ppTauxExcepRate = 0.1917;
    else if (annBrut <= 43380) r.ppTauxExcepRate = 0.2322;
    else r.ppTauxExcepRate = 0.3028;
    // Appliquer sur le montant exceptionnel
    const montantExcep = (typeSpec === 'doublePecule' ? r.doublePecule : 0)
      + (typeSpec === 'y13' ? r.y13 : 0)
      + (typeSpec === 'depart' ? r.peculeDepart : 0)
      + (typeSpec === 'preavis' ? (per.indemPreavis || 0) : 0);
    r.ppTauxExcep = montantExcep * r.ppTauxExcepRate;
    r.tax += r.ppTauxExcep;
  }

  // ── 14. JOURS FÉRIÉS PAYÉS (Loi 04/01/1974 + AR 18/04/1974) ──
  // 10 jours fériés légaux/an (Belgique) — payés par l'employeur
  // Ouvrier: salaire journalier normal (inclus dans les jours prestés si travaillés)
  // Employé: salaire mensuel normal (pas d'impact sur calcul mensuel)
  // Jour férié travaillé: supplément 200% (déjà couvert par sundayH si encodé)
  r.joursFeries = per.joursFeries || 0; // nombre encodé dans le mois

  // ── 15. PETIT CHÔMAGE / CONGÉ DE CIRCONSTANCE (AR 28/08/1963) ──
  // Salaire normal maintenu pour événements familiaux:
  // Mariage travailleur: 2 jours | Décès conjoint/enfant: 3 jours
  // Naissance enfant (co-parent): 15 jours | Communion: 1 jour
  // Déménagement: 1 jour | Comparution tribunal: nécessaire
  r.petitChomage = per.petitChomage || 0; // nombre jours
  r.petitChomageVal = r.petitChomage * (r.base / LEGAL.WD); // valeur = salaire/jour

  // ── 16. ÉCO-CHÈQUES (CCT 98 du 20/02/2009 — CNT) ──
  // Max 250€/an par travailleur temps plein (prorata temps partiel)
  // Exonérés ONSS et IPP si conditions respectées (pas en remplacement rémun.)
  // Uniquement électroniques depuis 2024
  // Non inclus dans le brut, pas de retenue — coût employeur pur
  r.ecoCheques = per.ecoCheques || 0;

  // ── 17. CADEAUX & AVANTAGES SOCIAUX (Circ. ONSS + Art. 38/11 CIR) ──
  // Exonérés ONSS+IPP si: Noël/Nouvel An ≤ 40€ + 40€/enfant | Mariage ≤ 245€
  // Saint-Nicolas ≤ 40€/enfant | Retraite ≤ 40€/année service (max 40 ans)
  r.cadeaux = per.cadeaux || 0;

  // ── 18. BUDGET MOBILITÉ (Loi 17/03/2019 modifié 01/01/2022) ──
  // Alternative à la voiture de société — 3 piliers:
  // Pilier 1: voiture plus écologique (ATN réduit)
  // Pilier 2: mobilité durable (transport en commun, vélo, logement) — exonéré ONSS+IPP
  // Pilier 3: solde en cash — cotisation spéciale 38,07% (employeur + travailleur)
  // Montant = TCO annuel voiture de société (1/5 × catalogue × coeff. âge + carburant + CO2)
  r.budgetMobilite = per.budgetMobilite || 0;
  r.budgetMobPilier2 = per.budgetMobP2 || 0; // part exonérée
  r.budgetMobPilier3 = per.budgetMobP3 || 0; // part cash → cotisation 38,07%
  r.budgetMobCotis38 = r.budgetMobPilier3 * 0.3807;

  // ── 19. RÉDUCTIONS GROUPES-CIBLES EMPLOYEUR (AR Groupes-cibles) ──
  // Réductions ONSS patronales ciblées — calculées AUTOMATIQUEMENT
  //
  // ═══ PREMIER ENGAGEMENT (AR 16/05/2003 + Réforme 01/04/2026) ═══
  // Art. 336-353 Loi-programme 24/12/2002
  // Source: ONSS instructions T1/2026 + SPF Emploi
  //
  // AVANT 01/04/2026:
  //   1er employé: exonération totale ONSS patronal (durée illimitée depuis 2016)
  //   2è employé: forfait trimestriel 1.550€ T1-T5, 1.050€ T6-T9, 450€ T10-T13
  //   3è employé: forfait trimestriel 1.050€ T1-T5, 1.050€ T6-T9, 450€ T10-T13
  //   4è employé: forfait trimestriel 1.050€ T1-T5, 1.050€ T6-T9, 450€ T10-T13
  //   5è employé: forfait trimestriel 1.050€ T1-T5, 1.050€ T6-T9, 450€ T10-T13
  //   6è employé: forfait trimestriel 1.050€ T1-T5, 1.050€ T6-T9, 450€ T10-T13
  //
  // APRÈS 01/04/2026 (Réforme budget fédéral):
  //   1er employé: max 3.100€ → réduit à 2.000€/trimestre (plafonné)
  //   2è employé: inchangé
  //   3è employé: inchangé
  //   4è-5è-6è: RÉINTRODUITS (supprimés en 2025, rétablis 04/2026)
  //
  // Paramètre: emp.nrEngagement = rang d'engagement (1 = 1er, 2 = 2è, etc.)
  // Paramètre: emp.engagementTrimestre = trimestre courant depuis engagement (1-13+)

  const PREMIER_ENG = {
    // Montants trimestriels par rang et par période (trimestres depuis engagement)
    // Format: [T1-T5, T6-T9, T10-T13, T14+]
    1: { label: '1er employé', amounts: [2000, 2000, 2000, 2000], note: 'Illimité (plafonné 2.000€/trim. depuis 04/2026)' },
    2: { label: '2è employé', amounts: [1550, 1050, 450, 0], note: '13 trimestres max' },
    3: { label: '3è employé', amounts: [1050, 1050, 450, 0], note: '13 trimestres max' },
    4: { label: '4è employé', amounts: [1050, 1050, 450, 0], note: 'Réintroduit 04/2026' },
    5: { label: '5è employé', amounts: [1050, 1050, 450, 0], note: 'Réintroduit 04/2026' },
    6: { label: '6è employé', amounts: [1050, 1050, 450, 0], note: 'Réintroduit 04/2026' },
  };

  r.redGCPremier = 0; r.redGCPremierLabel = ''; r.redGCPremierNote = '';
  const nrEng = emp.nrEngagement || 0;
  const engTrim = emp.engagementTrimestre || 1;
  if (nrEng >= 1 && nrEng <= 6) {
    const pe = PREMIER_ENG[nrEng];
    let trimIdx = 0;
    if (engTrim <= 5) trimIdx = 0;
    else if (engTrim <= 9) trimIdx = 1;
    else if (engTrim <= 13) trimIdx = 2;
    else trimIdx = 3;
    const trimAmount = pe.amounts[trimIdx];
    // Mensualiser le montant trimestriel
    r.redGCPremier = Math.round(trimAmount / 3 * 100) / 100;
    // Pour le 1er employé: ne peut pas dépasser la cotisation patronale effective
    if (nrEng === 1) r.redGCPremier = Math.min(r.redGCPremier, r.onssE + r.redStructMois);
    r.redGCPremierLabel = pe.label;
    r.redGCPremierNote = `${pe.label}: ${fmt(trimAmount)}/trim. (T${engTrim}) — ${pe.note}`;
  }

  // Travailleurs âgés ≥ 55 ans (AR 19/12/2001 — Activation 55+)
  // Réduction trimestrielle: 1.150€ si ≥ 55 ans + salaire < 14.640,83€/trim.
  r.redGCAge = per.redGCAge || 0;
  // Jeunes < 26 ans peu qualifiés (AR Activation jeunes)
  // Réduction trimestrielle: 1.500€ (très peu qualifié) ou 1.150€ (peu qualifié)
  r.redGCJeune = per.redGCJeune || 0;
  // Travailleurs handicapés
  r.redGCHandicap = per.redGCHandicap || 0;
  r.redGCTotal = r.redGCPremier + r.redGCAge + r.redGCJeune + r.redGCHandicap;

  // ── 20. COTISATION SPÉCIALE ONSS MODÉRATION SALARIALE (Loi 1996) ──
  // Déjà incluse dans le taux ONSS_E global via ONSS_SECTEUR
  // 5,67% sur la masse salariale (employeur) — pas travailleur

  // ── 21. ALLOCATION DE TRAVAIL ONEM — ACTIVATION (AR 19/12/2001 + Régional) ──
  // Mécanisme: le travailleur reçoit une allocation de l'ONEM via CAPAC/syndicat.
  // L'employeur DÉDUIT ce montant du salaire net à payer.
  // Le travailleur touche: salaire net (employeur) + allocation ONEM = rémunération totale.
  // → Le coût réel de l'employeur baisse du montant de l'allocation.
  //
  // Types d'allocations de travail:
  // Activa.brussels (Actiris): max €350/mois × 12 mois — DE ≥ 12 mois, résid. Bruxelles
  // Activa.brussels Jeunes: €350/mois × 6 mois — DE < 30 ans, ≥ 6 mois
  // Impulsion Wallonie: €500/mois × 24-36 mois — via FOREM/SPW
  // SINE (économie sociale): variable
  //
  // Traitement fiscal: l'allocation de travail est un revenu de remplacement pour le travailleur
  // → Soumise au précompte professionnel (retenue par ONEM/CAPAC)
  // → NON soumise ONSS (pas de rémunération au sens ONSS)
  // → L'employeur ne la déclare PAS en DmfA (c'est l'ONEM qui déclare)
  //
  // Sur la fiche de paie: mention "pour mémoire" — déduit du coût employeur
  const allocType = per.allocTravailType || (emp && emp.allocTravailType) || 'none';
  r.allocTravail = per.allocTravail || 0;
  r.allocTravailType = allocType;
  // Montants standards par type (si pas de montant custom)
  if (r.allocTravail === 0 && allocType !== 'none') {
    const ALLOC_MONTANTS = {
      'activa_bxl': 350,       // Activa.brussels: €350/mois
      'activa_jeune': 350,     // Activa Jeunes: €350/mois
      'impulsion_wal': 500,    // Impulsion Wallonie: €500/mois
      'impulsion55': 500,      // Impulsion 55+: €500/mois
      'sine': 500,             // SINE: €500/mois (variable)
      'vdab': 0,               // Flandre: pas d'allocation trav. (prime directe employeur)
      'art60': 0,              // Art. 60 §7: réduction ONSS employeur
    };
    r.allocTravail = ALLOC_MONTANTS[allocType] || 0;
  }
  r.allocTravailLabel = {
    'activa_bxl': 'Activa.brussels (Actiris)',
    'activa_jeune': 'Activa Jeunes <30 (Actiris)',
    'impulsion_wal': 'Impulsion Wallonie (FOREM)',
    'impulsion55': 'Impulsion 55+ (FOREM)',
    'sine': 'SINE (économie sociale)',
    'vdab': 'Groupe-cible flamand (VDAB)',
    'art60': 'Art. 60 §7 (1er emploi)',
  }[allocType] || '';

  // ── 14. FLEXI-JOB (Art. 3 Loi 16/11/2015 — modifié 01/01/2024) ──
  // Conditions: emploi principal min. 4/5 (T-3) OU pensionné
  // Secteurs: horeca CP302, commerce CP201/202/311, soins CP318/330/331/332,
  //   boulangerie CP118.03, agriculture CP144/145, intérim CP322, sport, culture...
  // Travailleur: 0% ONSS, 0% PP (exonéré si ≤ 12.000€/an)
  // Employeur: 28% cotisation patronale spéciale (Art.38§3ter Loi 29/06/1981)
  // Flexi-salaire min: 12,29€/h + 7,67% flexi-pécule vacances (2026)
  // Plafond IPP: 12.000€/an (pensionnés: illimité)
  // Dimona: type "FLX" | DmfA: code "050"
  r.isFlexiJob = (emp.contract === 'flexi');
  if (r.isFlexiJob) {
    const flexiMinH = 12.29;
    const flexiH = per.days * ((emp.whWeek || 10) / 5);
    const flexiTauxH = Math.max(flexiMinH, (emp.monthlySalary || 0) / ((emp.whWeek || 10) * 4.33));
    r.flexiSalaireH = flexiTauxH;
    r.flexiHeures = flexiH;
    r.flexiBrut = Math.round(flexiH * flexiTauxH * 100) / 100;
    r.flexiPecule = Math.round(r.flexiBrut * 0.0767 * 100) / 100;
    r.flexiOnssPatronal = Math.round((r.flexiBrut + r.flexiPecule) * 0.28 * 100) / 100;
    r.gross = r.flexiBrut + r.flexiPecule;
    r.base = r.flexiBrut;
    r.onssW = 0; r.onssNet = 0; r.empBonus = 0; r.empBonusA = 0; r.empBonusB = 0;
    r.tax = 0; r.css = 0; r.ppVolontaire = 0; r.ppTauxExcep = 0; r.ppTauxExcepRate = 0;
    r.onssE = r.flexiOnssPatronal; r.redStructMois = 0; r.redStruct = 0;
    r.totalDed = per.advance || 0;
    r.net = r.gross - r.totalDed;
    r.costTotal = r.gross + r.flexiOnssPatronal;
    r.flexiNet = r.net;
    return r;
  }

  // ── 15. ÉTUDIANT (Art. 17bis AR ONSS) ──
  // Max 650h/an (2026 — Annexe III PP + Art.17bis AR 28/11/1969): cotisation solidarité 2,71% (trav) + 5,42% (empl)
  // Au-delà: ONSS normal. Pas de PP si ≤ 7.340€/an net imposable
  r.isStudent = (emp.contract === 'etudiant');
  if (r.isStudent) {
    r.studentOnssW = Math.round(r.gross * 0.0271 * 100) / 100; // 2,71%
    r.studentOnssE = Math.round(r.gross * 0.0542 * 100) / 100; // 5,42%
    r.onssW = r.studentOnssW; r.onssNet = r.studentOnssW;
    r.onssE = r.studentOnssE;
    r.empBonus = 0; r.empBonusA = 0; r.empBonusB = 0;
    r.redStructMois = 0; r.redStruct = 0;
    // PP = 0 si revenu annuel net ≤ 7.340€
    if (r.gross * 12 <= 7340) { r.tax = 0; r.css = 0; }
  }

  // ── 15b. INDÉPENDANT — Régime INASTI (pas ONSS) ──
  // Types: indep_princ, indep_compl, mandataire, freelance
  // Short-circuit: pas d'ONSS, pas de PP retenu → cotisations INASTI + IPP via versements anticipés
  const indepTypes = ['indep_princ','indep_compl','mandataire','freelance'];
  r.isIndependant = indepTypes.includes(emp.contract);
  if (r.isIndependant) {
    const indepType = emp.contract === 'indep_princ' ? 'principal'
      : emp.contract === 'indep_compl' ? 'complementaire'
      : emp.contract === 'mandataire' ? 'mandataire'
      : 'principal'; // freelance = principal
    
    const indepResult = calcIndependant({
      revenuNet: r.gross * 12,
      type: indepType,
      trimestre: 'provisoire',
      primoStarter: !!emp.primoStarter,
      primoReduite: !!emp.primoReduite,
      fraisReels: !!emp.fraisReels,
      fraisReelsMontant: +(emp.fraisReelsMontant || 0),
      situation: emp.civil === 'married_1' ? 'marie_1r' : emp.civil === 'married_2' ? 'marie_2r' : 'isole',
      enfants: emp.depChildren || 0,
      taxeCom: emp.taxeCom || 7,
      dirigeant: emp.contract === 'mandataire',
    });

    // Remplacer les champs ONSS par les cotisations INASTI
    r.onssW = 0; r.onssNet = 0; r.onssE = 0;
    r.empBonus = 0; r.empBonusA = 0; r.empBonusB = 0;
    r.empBonusFisc = 0; r.empBonusFiscA = 0; r.empBonusFiscB = 0;
    r.redStructMois = 0; r.redStruct = 0;
    r.css = 0; // pas de CSSS pour indépendants

    // Cotisations sociales INASTI (équivalent ONSS)
    r.inasti = indepResult;
    r.inastiCotisMens = indepResult.cotisMensuelle;
    r.inastiFraisGestion = indepResult.fraisGestionMens;
    r.inastiTotalMens = indepResult.totalSocialMens;

    // PP: pas retenu à la source → versements anticipés
    r.tax = 0; // pas de PP retenu par un employeur
    r.ppVolontaire = 0;
    r.vaMensuelRecommande = indepResult.vaMensuelRecommande;
    r.ippEstimeMensuel = indepResult.ippMensuel;
    r.majorationSansVA = indepResult.majorationSansVA;

    // Recalcul retenues et net
    r.totalDed = r.inastiTotalMens + (per.advance || 0) + (per.otherDed || 0);
    r.net = r.gross - r.totalDed + (r.expense || 0) + (r.transport || 0);
    r.netApresIPP = r.net - r.ippEstimeMensuel; // net réel après provision IPP

    // Pas de coût employeur (l'indépendant EST l'employeur)
    r.costTotal = r.gross; // son propre coût = son revenu brut
    r.costTotalAvecCharges = r.gross + r.inastiTotalMens + r.ippEstimeMensuel;

    // Résumé
    r.indepNetDisponible = indepResult.netDisponibleMensuel;
    r.indepTauxCharges = indepResult.tauxChargesTotal;
    r.indepPasDeChomage = true;
    r.indepDroitPasserelle = indepResult.droitPasserelle;

    return r;
  }

  // ── 16. FRAIS PROFESSIONNELS FORFAITAIRES (Art. 51 CIR 92) ──
  // Déjà calculé ci-dessus: 30% avec plafond (employés et ouvriers)

  // ── 17. RÉDUCTIONS FAMILIALES (Art. 136-140 CIR 92) ──
  // Déjà calculé ci-dessus: quotité exemptée par enfant + isolé + handicap

  // ── 18. DISPENSE VERSEMENT PP RECHERCHE (Art. 275/3 CIR 92) ──
  // 80% du PP pour les chercheurs (diplôme Master/Doctorat)
  // Uniquement côté employeur — ne change pas le net travailleur

  // ══════════════════════════════════════════════════════════════
  //  PÉCULE DE VACANCES — CALCUL AUTOMATIQUE (Sprint 2)
  // ══════════════════════════════════════════════════════════════
  // Source: Loi 28/06/1971 + AR 30/03/1967 + ONSS Instructions 2026
  //
  // EMPLOYÉS (payé par l'employeur):
  //   Simple: 100% du brut mensuel normal (payé pendant les vacances)
  //   Double: 92% du brut mensuel → payé avant les vacances (généralement mai/juin)
  //     - 1ère partie (85%): soumise PP normal
  //     - 2ème partie (7%): soumise ONSS 13,07% + cotisation spéciale 1%
  //   → Le simple pécule = salaire normal du mois de vacances (déjà dans le brut)
  //
  // OUVRIERS (payé par la Caisse de Vacances / ONVA):
  //   Total: 15,38% du brut annuel N-1 (à 108%)
  //   Simple: 6,80% (7,69% de 108% - cotisation solidarité)
  //   Double: 8,58% (reste)
  //   → Versé via l'ONVA ou la Caisse sectorielle, PAS par l'employeur
  //   → L'employeur paie la cotisation vacances 15,84% trimestrielle à l'ONSS
  //
  r.peculeVacCalc = {
    type: isOuvrier ? 'ouvrier' : 'employe',
    brutRef: isOuvrier ? (r.gross * 1.08 * 12) : (emp.monthlySalary || 0), // brut annuel N-1 à 108% pour ouvriers
    simple: 0,
    double: 0,
    total: 0,
    onss2emePartie: 0,
    cotisSpec1pct: 0,
    ppExcep: 0,
    moisPaiement: isOuvrier ? 'Mai (Caisse de Vacances)' : 'Mai/Juin (Employeur)'
  };
  if (!isOuvrier) {
    // Employé: simple = 1 mois brut (déjà inclus dans salaire normal du mois de vacances)
    r.peculeVacCalc.simple = emp.monthlySalary || 0;
    // Double = 92% du brut mensuel (LOIS_BELGES)
    r.peculeVacCalc.double = (emp.monthlySalary || 0) * LOIS_BELGES.remuneration.peculeVacances.double.pct;
    r.peculeVacCalc.total = r.peculeVacCalc.simple + r.peculeVacCalc.double;
    // 2ème partie du double pécule (7/92 du double) → ONSS 13,07% + cotis spéciale 1%
    const dp2 = r.peculeVacCalc.double * (7/92);
    r.peculeVacCalc.onss2emePartie = Math.round(dp2 * TX_ONSS_W * 100) / 100;
    r.peculeVacCalc.cotisSpec1pct = Math.round(dp2 * 0.01 * 100) / 100;
    // PP exceptionnel sur le double pécule
    const annBrutDP = (emp.monthlySalary || 0) * 12;
    if (annBrutDP <= 17280) r.peculeVacCalc.ppExcepRate = 0;
    else if (annBrutDP <= 32280) r.peculeVacCalc.ppExcepRate = 0.1917;
    else if (annBrutDP <= 43380) r.peculeVacCalc.ppExcepRate = 0.2322;
    else r.peculeVacCalc.ppExcepRate = 0.3028;
    r.peculeVacCalc.ppExcep = Math.round(r.peculeVacCalc.double * (r.peculeVacCalc.ppExcepRate || 0) * 100) / 100;
  } else {
    // Ouvrier: 15,38% du brut annuel N-1 × 108%
    r.peculeVacCalc.simple = Math.round(r.peculeVacCalc.brutRef * 0.0680 * 100) / 100;
    r.peculeVacCalc.double = Math.round(r.peculeVacCalc.brutRef * 0.0858 * 100) / 100;
    r.peculeVacCalc.total = Math.round(r.peculeVacCalc.brutRef * (PV_SIMPLE*2+0.001) * 100) / 100;
  }

  // ══════════════════════════════════════════════════════════════
  //  13ÈME MOIS / PRIME DE FIN D'ANNÉE — CALCUL PAR CP (Sprint 2)
  // ══════════════════════════════════════════════════════════════
  // Source: CCT sectorielles + AR rendant les CCT obligatoires
  //
  // La prime de fin d'année n'est PAS une obligation légale mais conventionnelle.
  // Son montant et ses conditions varient par commission paritaire:
  //
  // CP 200 (employés): 100% du brut mensuel (convention quasi-universelle)
  // CP 124 (construction): calculé en % du brut × jours prestés
  // CP 302 (horeca): prime = brut mensuel × coefficient (Fonds social)
  // CP 330 (soins santé): prime = montant fixe indexé par échelon
  //
  r.y13Calc = {
    cp: emp.cp || '200',
    moisPaiement: 'Décembre',
    montant: 0,
    onss: 0,
    ppExcep: 0,
    ppExcepRate: 0,
    coûtEmployeur: 0,
    methode: ''
  };
  const cpNum = parseInt(emp.cp) || 200;
  if (cpNum === 124) {
    // Construction: 8,33% du brut annuel (via Fonds social)
    r.y13Calc.montant = Math.round((emp.monthlySalary || 0) * 12 * 0.0833 * 100) / 100;
    r.y13Calc.methode = 'CP 124 — 8,33% brut annuel (Fonds social FBTP)';
  } else if (cpNum === 302) {
    // Horeca: via Fonds social — environ 1 mois brut
    r.y13Calc.montant = emp.monthlySalary || 0;
    r.y13Calc.methode = 'CP 302 — ±1 mois brut (Fonds social Horeca)';
  } else if (cpNum >= 330 && cpNum <= 332) {
    // Non-marchand santé/social: montant fixe indexé ≈ 1 mois
    r.y13Calc.montant = emp.monthlySalary || 0;
    r.y13Calc.methode = 'CP 330-332 — Montant fixe indexé (CCT sectorielle)';
  } else {
    // CP 200 et autres: 1 mois brut (convention quasi-universelle)
    r.y13Calc.montant = emp.monthlySalary || 0;
    r.y13Calc.methode = 'CP ' + cpNum + ' — 100% brut mensuel (CCT sectorielle)';
  }
  // ONSS sur 13ème mois: 13,07% travailleur
  r.y13Calc.onss = Math.round(r.y13Calc.montant * TX_ONSS_W * 100) / 100;
  // PP exceptionnel (taux fixe selon rémunération annuelle brute)
  const annBrut13 = (emp.monthlySalary || 0) * 12;
  if (annBrut13 <= 17280) r.y13Calc.ppExcepRate = 0;
  else if (annBrut13 <= 32280) r.y13Calc.ppExcepRate = 0.1917;
  else if (annBrut13 <= 43380) r.y13Calc.ppExcepRate = 0.2322;
  else r.y13Calc.ppExcepRate = 0.3028;
  r.y13Calc.ppExcep = Math.round(r.y13Calc.montant * r.y13Calc.ppExcepRate * 100) / 100;
  r.y13Calc.netEstime = Math.round((r.y13Calc.montant - r.y13Calc.onss - r.y13Calc.ppExcep) * 100) / 100;
  r.y13Calc.coûtEmployeur = Math.round(r.y13Calc.montant * (1 + (LEGAL.ONSS_SECTEUR[emp.cp]?.e || 0.25)) * 100) / 100;

  // ══════════════════════════════════════════════════════════════
  //  TOTALISATION
  // ══════════════════════════════════════════════════════════════

  // Total retenues sur le net
  r.totalDed = r.onssNet + r.tax + r.css + r.mvWorker
    + r.garnish + r.advance + r.otherDed + r.ppVolontaire
    + r.atnCar + r.atnAutresTot
    + r.dpOnss + r.dpCotisSpec       // ONSS double pécule
    + r.pdOnss                        // ONSS pécule départ
    + r.pensionCompl                  // retenue pension complémentaire
    + r.retSyndicale                  // retenue syndicale
    + r.saisieAlim                    // pension alimentaire
    + r.budgetMobCotis38;             // budget mobilité pilier 3

  // Net à payer
  r.net = r.gross - r.totalDed + r.expense + r.transport
    + r.doublePecule - r.dpOnss - r.dpCotisSpec    // double pécule net
    + r.peculeDepart - r.pdOnss                      // pécule départ net
    + r.primeAncExoneree                              // prime ancienneté exonérée
    + r.primeNaissance                                // prime naissance (exo)
    + r.indemTeletravail                              // indemnité télétravail (exo)
    + r.indemBureau                                   // frais bureau (exo)
    + r.petitChomageVal                               // petit chômage (salaire maintenu)
    + r.budgetMobPilier2                             // budget mobilité pilier 2 (exo)
    + r.hsBrutNetTotal;                                // HS volontaires brut=net (exo ONSS+PP)

  // ONSS employeur déjà calculé ci-dessus (onssE, onssE_rate, onssE_note)
  r.insAT = r.gross * 0.0087;
  // Cotisation vacances annuelles ouvriers (Art. 38 Loi 29/06/1981)
  // 15,84% sur brut × 108% — payé via ONSS, versé à la Caisse de vacances
  // Inclus dans le taux ONSS sectoriel ouvrier mais à afficher séparément
  r.cotisVacOuv = isOuvrier ? onssBase * LEGAL.ONSS_DETAIL_2026.vacances_annuelles_ouvrier : 0;
  // Cotisation patronale pension complémentaire (estimation si retenue personnelle existe)
  r.pensionComplEmpl = r.pensionCompl > 0 ? r.pensionCompl * 2 : 0; // ratio courant 2:1
  r.cotisWijninckx = (r.pensionComplEmpl + r.pensionCompl) * 12 > 32472 ? ((r.pensionComplEmpl + r.pensionCompl) * 12 - 32472) / 12 * 0.125 : 0;
  // Dispenses PP employeur (ne changent pas le net travailleur mais réduisent le coût)
  // Art 275/1 CIR: dispense heures sup = 32,19% du PP retenu sur le sursalaire
  r.dispensePPHSup = sursalaire > 0 ? sursalaire * 0.3219 : 0;
  r.dispensePPTotal = r.dispensePPNuit + r.dispensePPHSup;
  r.costTotal = r.gross + r.onssE + r.mvEmployer + r.expense + r.transport + r.insAT + r.cotCO2
    + r.cotisVacOuv                                     // vacances ouvriers 15,84%
    + r.pensionComplEmpl + r.cotisWijninckx              // pension complémentaire
    + r.doublePecule + r.peculeDepart + r.primeAnciennete + r.primeNaissance + r.primeInnovation
    + r.indemTeletravail + r.indemBureau
    + r.ecoCheques + r.cadeaux                           // éco-chèques + cadeaux
    + r.budgetMobCotis38                                 // budget mobilité pilier 3
    + r.veloLeasingMois                                   // leasing vélo
    + r.borneRechargeCoût                                 // borne de recharge
    + r.carteCarburantMois                                // carte carburant
    - r.dispensePPTotal                                   // dispenses PP
    - r.redGCTotal                                        // réductions groupes-cibles
    - r.allocTravail;                                     // allocation travail ONEM (déduit du coût)
  return r;
}


export { BAREMES, getBareme, getCPAvantages, calc };
