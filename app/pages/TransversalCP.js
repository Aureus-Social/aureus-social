'use client';
import{useState,useMemo}from'react';

const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const C=({children,title:t,sub,color})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid '+(color||'rgba(198,163,78,.08)'),marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:color||'#c6a34e',marginBottom:sub?2:10}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:10}}>{sub}</div>}{children}</div>;
const Row=({l,v,c,b,sub})=><div style={{display:'flex',justifyContent:'space-between',padding:b?'8px 0':'5px 0',borderBottom:b?'2px solid rgba(198,163,78,.2)':'1px solid rgba(255,255,255,.03)',fontWeight:b?700:400}}><span style={{color:sub?'#888':'#e8e6e0',fontSize:sub?10:11.5,fontStyle:sub?'italic':'normal'}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;

// ════════════════════════════════════════════════════════════
// 1. MAJORATIONS PAR CP — Nuit, Dimanche, Fériés
// ════════════════════════════════════════════════════════════
export const MAJORATIONS={
'118':{nuit:{taux:25,heures:'22h-6h'},dimanche:{taux:100},ferie:{taux:100,repos:true},samedi:{taux:50,note:'après 13h'},equipe2x8:{taux:10},equipe3x8:{taux:15}},
'119':{nuit:{taux:50,heures:'après 20h'},dimanche:{taux:100},ferie:{taux:100,repos:true},samedi:{taux:50,note:'après 13h'}},
'200':{nuit:{taux:0,note:'Pas de majoration légale sauf CCT entreprise'},dimanche:{taux:100},ferie:{taux:100,repos:true}},
'302':{nuit:{taux:0,note:'+1.25 EUR/h entre minuit et 5h'},dimanche:{taux:100,note:'ou +2 EUR/h cat I-II'},ferie:{taux:100,repos:true},coupure:{note:'Amplitude max 14h, repos coupure min 3h'}},
'124':{nuit:{taux:25,heures:'22h-6h'},dimanche:{taux:100},ferie:{taux:100,repos:true},samedi:{taux:50},hauteur:{taux:10,note:'si > 15m'},souterrain:{taux:10},insalubrite:{taux:10}},
'322.01':{nuit:{taux:0,note:'Pas de travail de nuit'},dimanche:{taux:0,note:'Pas de travail dimanche'},ferie:{taux:100,repos:true}},
'330':{nuit:{taux:35,heures:'20h-6h'},dimanche:{taux:56},ferie:{taux:56},samedi:{taux:26},garde:{note:'Forfait garde + rappel rémunéré'}},
'111':{nuit:{taux:25,heures:'22h-6h'},dimanche:{taux:100},ferie:{taux:100,repos:true},equipe2x8:{taux:10,note:'matin 6h-14h'},equipeAM:{taux:15,note:'après-midi 14h-22h'},insalubrite:{taux:15,note:'bruit/chaleur/poussières'}},
'140':{nuit:{taux:25,heures:'22h-6h'},dimanche:{taux:100},ferie:{taux:100,repos:true},samedi:{taux:50},attente:{taux:100,note:'après 1h d\'attente'}},
'121':{nuit:{taux:25,heures:'22h-6h'},dimanche:{taux:100},ferie:{taux:100,repos:true},insalubrite:{taux:5}},
'152':{nuit:{taux:0,note:'Pas de travail de nuit'},dimanche:{taux:0},ferie:{taux:100,repos:true}},
'_default':{nuit:{taux:0,note:'Selon CCT sectorielle'},dimanche:{taux:100,note:'Loi 16/03/1971'},ferie:{taux:100,repos:true,note:'10 jours fériés légaux'}},
};

// ════════════════════════════════════════════════════════════
// 2. PRIMES SECTORIELLES DÉTAILLÉES
// ════════════════════════════════════════════════════════════
export const PRIMES_SECTORIELLES={
'118':[
  {nom:'Prime de froid (< 5°C)',montant:'+5% salaire horaire',condition:'Travail en chambre froide',cat:'conditions',
    details:{base_legale:'CCT CP 118 — AR Bien-être au travail',conditions:['Température ambiante < 5°C','Exposition continue (pas intermittente courte)','Port EPI obligatoire (vêtements thermiques fournis)'],calcul:'Salaire horaire brut × 5%. Ex: 14.50 EUR/h → +0.73 EUR/h. Sur 8h: +5.84 EUR brut.',cumul:'Cumulable avec prime de nuit et prime d\'équipe'}},
  {nom:'Prime de froid intense (< -18°C)',montant:'+10% salaire horaire',condition:'Surgélation',cat:'conditions',
    details:{base_legale:'CCT CP 118 — AR Bien-être au travail',conditions:['Travail en chambre de surgélation (< -18°C)','Rotation obligatoire: max 2h consécutives','Pauses réchauffement obligatoires','Visite médicale annuelle obligatoire'],calcul:'Salaire horaire brut × 10%. Ex: 14.50 EUR/h → +1.45 EUR/h.',cumul:'Cumulable avec prime de nuit. Remplace la prime froid < 5°C (pas de cumul des deux)'}},
  {nom:'Prime équipe 2x8',montant:'+10% salaire horaire',condition:'Rotation matin/après-midi',cat:'equipe',
    details:{base_legale:'CCT CP 118 travail en équipe',conditions:['Système rotation matin (6h-14h) / après-midi (14h-22h)','Minimum 1 semaine par poste','Régime permanent (pas occasionnel)'],calcul:'Salaire horaire × 10%. Ex: 14.50 EUR/h → +1.45 EUR/h. Sur 8h: +11.60 EUR/jour.',cumul:'Cumulable avec prime de froid. Non cumulable avec prime 3x8'}},
  {nom:'Prime équipe 3x8',montant:'+15% salaire horaire',condition:'Rotation incluant nuit',cat:'equipe',
    details:{base_legale:'CCT CP 118 travail en équipe',conditions:['Système rotation matin/après-midi/nuit','Poste nuit: 22h-6h','Repos minimum 11h entre postes'],calcul:'Salaire horaire × 15%. Ex: 14.50 EUR/h → +2.18 EUR/h. Les heures 22h-6h bénéficient en plus de la prime nuit +25%.',cumul:'Non cumulable avec prime 2x8. Cumulable avec prime froid et nuit (pour les heures 22h-6h)'}},
  {nom:'Prime de nuit',montant:'+25% salaire horaire',condition:'22h-6h',cat:'nuit',
    details:{base_legale:'CCT CP 118 + Loi 16/03/1971 travail de nuit',conditions:['Heures prestées entre 22h et 6h','Applicable dès la 1ère heure de nuit','Autorisation inspection sociale si femmes/jeunes'],calcul:'Salaire horaire × 25%. Ex: 14.50 EUR/h → +3.63 EUR/h. Sur 8h nuit: +29.00 EUR brut.',fiscal:'Exonération partielle PP pour l\'employeur (dispense versement 22.8% du PP sur travail de nuit)'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut (après 6 mois anc.)',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 118',conditions:['Ancienneté minimum 6 mois','Prorata si entrée/sortie en cours d\'année','Non due si licenciement faute grave','Due si licenciement par l\'employeur (prorata)'],calcul:'Salaire brut mensuel × (mois prestés / 12)',paiement:'Décembre, via fonds sectoriel ou employeur',fiscal:'Taxé comme rémunération — ONSS 13.07% + PP'}},
  {nom:'Eco-chèques',montant:'250 EUR/an',condition:'Au prorata si temps partiel',cat:'avantage',
    details:{base_legale:'CCT 98 CNT + CCT CP 118',conditions:['Max 250 EUR/an temps plein','Prorata temps partiel et ancienneté','Validité 24 mois','Produits écologiques uniquement (liste SPF)'],exoneration:'Exonéré ONSS + IPP si conditions respectées',paiement:'Juin-juillet'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 118 — Fonds social alimentaire',conditions:['Affilié syndicat reconnu','Min 1 jour presté dans la période','Formulaire via syndicat'],paiement:'Annuel via syndicat (mars-avril)',fiscal:'Non imposable'}},
],
'119':[
  {nom:'Prime dimanche',montant:'+100% salaire horaire',condition:'Tout le dimanche',cat:'nuit',
    details:{base_legale:'Loi 16/03/1971 + CCT CP 119',conditions:['Toute heure prestée le dimanche (0h-24h)','Applicable aux ouvertures dominicales autorisées','Repos compensatoire obligatoire dans les 6 jours'],calcul:'Salaire horaire × 2 (100% en sus). Ex: 13.20 EUR/h → 26.40 EUR/h dimanche.',cumul:'Non cumulable avec prime férié si dimanche = férié (le plus favorable s\'applique)'}},
  {nom:'Prime samedi après-midi',montant:'+50% salaire horaire',condition:'Après 13h',cat:'nuit',
    details:{base_legale:'CCT CP 119',conditions:['Heures prestées le samedi après 13h00','Commerce de détail alimentaire'],calcul:'Salaire horaire × 50%. Ex: 13.20 EUR/h → +6.60 EUR/h après 13h samedi.',cumul:'Cumulable avec prime de nuit si applicable'}},
  {nom:'Prime travail tardif',montant:'+50% salaire horaire',condition:'Après 20h',cat:'nuit',
    details:{base_legale:'CCT CP 119 — Ouvertures tardives',conditions:['Heures prestées après 20h00','Nocturnes commerce autorisées','Majoré à +100% après 22h dans certaines CCT entreprise'],calcul:'Salaire horaire × 50%. Ex: 13.20 EUR/h → +6.60 EUR/h après 20h.'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut (après 6 mois)',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 119',conditions:['Ancienneté min 6 mois au 31/12','Prorata entrée/sortie','Non due si faute grave'],calcul:'Salaire brut mensuel × (mois prestés / 12)',paiement:'Décembre',fiscal:'Taxé ONSS 13.07% + PP barème annualisé'}},
  {nom:'Eco-chèques',montant:'250 EUR/an',condition:'Temps plein',cat:'avantage',
    details:{base_legale:'CCT 98 CNT + CCT CP 119',conditions:['250 EUR temps plein, prorata temps partiel','Validité 24 mois','Produits écologiques (liste SPF)'],exoneration:'Exonéré ONSS + IPP',paiement:'Juin-juillet'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 119',conditions:['Affilié syndicat reconnu','Formulaire annuel'],paiement:'Via syndicat mars-avril',fiscal:'Non imposable'}},
],
'200':[
  {nom:'Prime fin d\'année (13ème mois)',montant:'1 mois brut',condition:'CCT 200',cat:'annuelle',
    details:{base_legale:'CCT sectorielle CP 200 (CNT)',conditions:['Ancienneté minimum: 6 mois au 31/12','Prorata en cas d\'entrée/sortie en cours d\'année','Inclus dans la base de calcul du pécule de vacances','Non dû en cas de licenciement pour faute grave'],calcul:'Salaire brut mensuel × (mois prestés / 12). ONSS 13.07% + PP selon barème annualisé.',paiement:'Décembre, avec le salaire du mois',fiscal:'Taxé comme rémunération ordinaire — imposé au taux annuel moyen'}},
  {nom:'Eco-chèques',montant:'250 EUR/an max',condition:'Si CCT entreprise ou sectorielle',cat:'avantage',
    details:{base_legale:'CCT 98 du CNT (2009)',conditions:['Maximum 250 EUR/an par travailleur temps plein','Prorata pour temps partiel','Validité 24 mois à compter de la date d\'émission','Utilisables uniquement pour produits/services écologiques (liste SPF)','Non échangeables contre espèces'],calcul:'Montant fixé par CCT sectorielle ou d\'entreprise. Souvent 250 EUR pour temps plein.',exoneration:'Exonéré ONSS et IPP si max 250 EUR/an + conditions respectées',paiement:'Généralement juin ou juillet'}},
  {nom:'Chèques-repas',montant:'Max 8 EUR/jour (6.91 patronal)',condition:'Par jour ouvré presté',cat:'avantage',
    details:{base_legale:'AR 28/11/1969 + CCT sectorielle/entreprise',conditions:['1 chèque par jour effectivement presté','Part patronale max 6.91 EUR (exonérée ONSS)','Part travailleur min 1.09 EUR (retenue sur salaire)','Valeur faciale max 8.00 EUR','Pas de cumul avec indemnité repas forfaitaire','Validité 12 mois'],calcul:'Environ 20 jours/mois × valeur faciale. Part patronale: coût employeur déductible. Exemple: 8 EUR × 220 jours = 1,760 EUR/an dont 1,520 EUR patronal.',exoneration:'Part patronale exonérée ONSS + IPP si toutes conditions remplies (1 chèque/jour, part worker ≥ 1.09, nominatif)',paiement:'Mensuel, via émetteur agréé (Sodexo, Edenred, Monizze)'}},
  {nom:'Pension complémentaire PCLI',montant:'1.5% du salaire annuel',condition:'Obligatoire secteur',cat:'pension',
    details:{base_legale:'CCT CP 200 + Loi 28/04/2003 (LPC)',conditions:['Obligatoire pour tous les employeurs CP 200','Organisme: assureur sectoriel ou fonds de pension','Contribution uniquement patronale (pas de part travailleur)','Acquis après 1 an d\'affiliation','Droit au transfert en cas de changement d\'employeur'],calcul:'1.5% × salaire annuel brut. Ex: 3,000 EUR/mois × 12 = 36,000 EUR × 1.5% = 540 EUR/an. Capital estimé après 20 ans (rendement 2%): ~13,176 EUR.',organisme:'Fonds sectoriel CP 200 ou assureur groupe',fiscal:'Taxe Wyninckx si capital > seuil (actuellement ~32,472 EUR). Taxe finale: 10.09% (anticipative) ou 16.66% à 60 ans.'}},
  {nom:'Prime syndicale',montant:'~145 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT sectorielle CP 200',conditions:['Être affilié à un syndicat reconnu (FGTB, CSC, CGSLB)','Avoir presté au moins 1 jour dans la période de référence','Introduire formulaire via le syndicat','Non cumulable entre syndicats'],montants:'FGTB/CSC: ~145 EUR — CGSLB: ~135 EUR',paiement:'Annuel, via le syndicat (généralement mars-avril pour l\'année précédente)',fiscal:'Non imposable (prime syndicale forfaitaire)'}},
],
'302':[
  {nom:'Repas en nature',montant:'1 repas/service ou ~3 EUR indemnité',condition:'Chaque service presté',cat:'avantage',
    details:{base_legale:'CCT CP 302 — Convention Horeca',conditions:['1 repas par service presté (min 4h)','Ou indemnité compensatoire ~3 EUR si pas de repas','Repas chaud obligatoire si cuisine disponible','ATN forfaitaire: 1.09 EUR/repas (ONSS)'],calcul:'Si repas: ATN 1.09 EUR retenu sur salaire. Si indemnité: ~3 EUR versés (exonéré ONSS sous conditions).',fiscal:'ATN repas: 1.09 EUR/repas imposable. Indemnité: exonérée si conditions (pas de cantine, pas de chèques-repas).'}},
  {nom:'Prime dimanche/férié',montant:'+2 EUR/h (cat I-II) ou +100%',condition:'Dimanche et jours fériés',cat:'nuit',
    details:{base_legale:'CCT CP 302 + Loi 16/03/1971',conditions:['Cat I-II: forfait +2 EUR/h','Cat III-V: +100% salaire horaire','Repos compensatoire obligatoire dans les 6 jours','10 jours fériés légaux inclus'],calcul:'Cat I (13.20 EUR/h): +2 EUR/h = 15.20 EUR/h dimanche. Cat III (14.50 EUR/h): × 2 = 29.00 EUR/h dimanche.',cumul:'Non cumulable dimanche + férié (le plus favorable)'}},
  {nom:'Prime de nuit',montant:'+1.25 EUR/h',condition:'Minuit à 5h',cat:'nuit',
    details:{base_legale:'CCT CP 302',conditions:['Heures prestées entre 00h00 et 05h00','Forfait par heure (pas un pourcentage)','Applicable à toutes les catégories'],calcul:'Forfait +1.25 EUR/h brut. Sur 5h nuit (00h-05h): +6.25 EUR brut.',fiscal:'Dispense PP employeur possible (travail de nuit structurel)'}},
  {nom:'Prime extras',montant:'+20% salaire horaire minimum',condition:'Contrat extra (max 2j consécutifs)',cat:'conditions',
    details:{base_legale:'CCT CP 302 — Statut extra Horeca',conditions:['Contrat extra: max 2 jours consécutifs','Pas de contrat écrit obligatoire (oral suffit)','Dimona "extra" dans les 6h avant début','ONSS réduit: calcul sur forfait journalier'],calcul:'+20% sur le salaire horaire minimum de la catégorie. Ex cat II: 13.65 EUR/h × 1.20 = 16.38 EUR/h.',special:'Les extras bénéficient de l\'ONSS sur forfait (pas sur salaire réel), ce qui réduit le coût.'}},
  {nom:'Prime saisonniers',montant:'Salaire + logement éventuel',condition:'Max 6 mois/an',cat:'conditions',
    details:{base_legale:'CCT CP 302 — Travail saisonnier',conditions:['Contrat saisonnier max 6 mois/an','Secteurs: stations balnéaires, ski, tourisme','Si logement fourni: ATN logement réduit','Droits vacances et 13ème mois au prorata'],special:'Le saisonnier a droit au chômage entre deux saisons (allocation temporaire).'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Selon ancienneté',cat:'annuelle',
    details:{base_legale:'CCT CP 302',conditions:['Ancienneté min 6 mois','Prorata entrée/sortie','Versé via fonds sectoriel Horeca Forma ou employeur'],paiement:'Décembre',fiscal:'Taxé ONSS + PP'}},
  {nom:'Chèques-repas',montant:'8 EUR/jour',condition:'Si pas de repas en nature',cat:'avantage',
    details:{base_legale:'CCT CP 302 + AR 28/11/1969',conditions:['Uniquement si l\'employeur ne fournit PAS de repas en nature','Part patronale max 6.91 EUR','Part travailleur min 1.09 EUR','1 chèque par jour presté'],exoneration:'Exonéré ONSS + IPP si conditions remplies',cumul:'NON cumulable avec repas en nature'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 302',conditions:['Affilié syndicat reconnu','Formulaire annuel via syndicat'],paiement:'Mars-avril via syndicat',fiscal:'Non imposable'}},
],
'124':[
  {nom:'Timbres fidélité',montant:'~9% du salaire annuel brut',condition:'Via OPOC/Constructiv',cat:'annuelle',
    details:{base_legale:'AR Timbres fidélité Construction — Fonds Constructiv',conditions:['Min 200 jours prestés dans le secteur construction','Être en service chez un employeur construction au 30 juin','Pas de licenciement pour faute grave dans l\'année','Déclaration par l\'employeur au fonds Constructiv'],calcul:'~9% du salaire annuel brut. Ex: salaire brut annuel 36,000 EUR → ~3,240 EUR timbres fidélité.',paiement:'Juillet, versé par Constructiv (OPOC) directement au travailleur',fiscal:'Imposable — PP retenu à la source par Constructiv. Soumis ONSS (cotisation spéciale).'}},
  {nom:'Timbres intempéries',montant:'75% salaire horaire',condition:'Arrêt chantier (gel/pluie/neige)',cat:'conditions',
    details:{base_legale:'CCT CP 124 — AR Intempéries Construction',conditions:['Arrêt de chantier pour raisons météo (gel, pluie forte, neige, vent > force 7)','Constaté par le chef de chantier','Déclaration dans les 48h au fonds','Le travailleur doit se tenir disponible'],calcul:'75% du salaire horaire normal × heures d\'intempérie. Ex: 16 EUR/h → 12 EUR/h intempérie. Journée complète (8h): 96 EUR.',paiement:'Mensuel via l\'employeur (remboursé par Constructiv)',fiscal:'Traité comme rémunération — ONSS + PP'}},
  {nom:'Prime de hauteur',montant:'+10% salaire horaire',condition:'Travail > 15 mètres',cat:'conditions',
    details:{base_legale:'CCT CP 124 — AR Sécurité chantiers',conditions:['Travail effectif à plus de 15 mètres du sol','Travaux de façade, toiture, structure acier, échafaudages','Formation travail en hauteur obligatoire','Harnais anti-chute obligatoire'],calcul:'Salaire horaire × 10%. Ex: 16 EUR/h → +1.60 EUR/h.',cumul:'Cumulable avec prime insalubrité et souterraine'}},
  {nom:'Prime souterraine',montant:'+10% salaire horaire',condition:'Travail souterrain',cat:'conditions',
    details:{base_legale:'CCT CP 124',conditions:['Travaux souterrains (tunnels, fondations profondes, caves)','Ventilation obligatoire','Visite médicale spécifique'],calcul:'Salaire horaire × 10%. Cumulable avec prime insalubrité.'}},
  {nom:'Prime insalubrité',montant:'+10% salaire horaire',condition:'Amiante, plomb, poussières',cat:'conditions',
    details:{base_legale:'CCT CP 124 + AR Amiante 16/03/2006',conditions:['Manipulation amiante (désamiantage): formation spécifique + agrément','Contact plomb, poussières toxiques','Travail en milieu contaminé','Protection respiratoire obligatoire'],calcul:'Salaire horaire × 10%. Cumulable avec prime hauteur.',special:'Désamiantage: agrément obligatoire de l\'entreprise + suivi médical renforcé du travailleur.'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Via fonds sectoriel',cat:'annuelle',
    details:{base_legale:'CCT CP 124',conditions:['Ancienneté dans le secteur','Prorata prestations','Via fonds sectoriel Constructiv'],paiement:'Décembre via Constructiv ou employeur',fiscal:'ONSS + PP'}},
  {nom:'Eco-chèques',montant:'250 EUR/an',condition:'Temps plein',cat:'avantage',
    details:{base_legale:'CCT 98 CNT + CCT CP 124',conditions:['250 EUR temps plein, prorata temps partiel','Validité 24 mois'],exoneration:'Exonéré ONSS + IPP',paiement:'Juin-juillet'}},
  {nom:'Prime syndicale',montant:'~145 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 124 — Constructiv',conditions:['Affilié syndicat reconnu','Construction: prime parmi les plus élevées'],paiement:'Mars-avril via syndicat',fiscal:'Non imposable'}},
  {nom:'Indemnité outillage',montant:'~0.60 EUR/jour',condition:'Si outils propres',cat:'conditions',
    details:{base_legale:'CCT CP 124',conditions:['Le travailleur utilise ses propres outils','Indemnité forfaitaire par jour presté','Exonérée ONSS si montant raisonnable'],calcul:'~0.60 EUR/jour presté. ~132 EUR/an (220 jours).',exoneration:'Exonéré ONSS comme frais propres à l\'employeur'}},
],
'322.01':[
  {nom:'Prime fin d\'année (décembre)',montant:'~4.33 semaines salaire',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 322.01 — Titres-services',conditions:['Ancienneté min 6 mois dans le secteur','Prorata si temps partiel ou entrée en cours d\'année','Non due si licenciement faute grave'],calcul:'4.33 semaines de salaire brut. Ex: 13.50 EUR/h × 38h/sem × 4.33 = ~2,219 EUR brut.',paiement:'Décembre, via employeur ou fonds sectoriel',fiscal:'ONSS 13.07% + PP'}},
  {nom:'Prime annuelle (juin)',montant:'~1 semaine salaire',condition:'En juin',cat:'annuelle',
    details:{base_legale:'CCT CP 322.01',conditions:['Ancienneté min 6 mois','En service au 30 juin'],calcul:'~1 semaine de salaire brut. Ex: 13.50 EUR/h × 38h = ~513 EUR brut.',paiement:'Juin'}},
  {nom:'Eco-chèques',montant:'250 EUR/an',condition:'Temps plein',cat:'avantage',
    details:{base_legale:'CCT 98 CNT + CCT CP 322.01',conditions:['250 EUR temps plein, prorata temps partiel','Validité 24 mois','Produits écologiques uniquement'],exoneration:'Exonéré ONSS + IPP'}},
  {nom:'Indemnité déplacement',montant:'Remboursement entre clients',condition:'Pas domicile-1er client',cat:'conditions',
    details:{base_legale:'CCT CP 322.01 — Déplacements titres-services',conditions:['Remboursement des déplacements ENTRE clients','Le trajet domicile → 1er client n\'est PAS remboursé','Le trajet dernier client → domicile n\'est PAS remboursé','Transport en commun: remboursement abonnement (80-100% selon CCT)'],calcul:'Véhicule privé: 0.15 EUR/km entre clients. Transport en commun: abonnement remboursé.',fiscal:'Exonéré ONSS comme frais de déplacement professionnel'}},
  {nom:'Indemnité vêtements',montant:'~1.64 EUR/jour',condition:'Ou fourniture vêtements',cat:'conditions',
    details:{base_legale:'CCT CP 322.01 — Vêtements de travail',conditions:['Soit l\'employeur fournit les vêtements de travail + entretien','Soit indemnité forfaitaire ~1.64 EUR/jour presté','Le travailleur ne peut pas être obligé de fournir ses propres vêtements'],calcul:'~1.64 EUR × 220 jours = ~361 EUR/an',exoneration:'Exonéré ONSS si forfait raisonnable (frais propres employeur)'}},
  {nom:'Prime syndicale',montant:'~100 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 322.01',conditions:['Affilié syndicat reconnu'],paiement:'Via syndicat mars-avril',fiscal:'Non imposable'}},
],
'330':[
  {nom:'Prime IFIC (attractivité)',montant:'Selon barème IFIC 2022+',condition:'Classification fonctionnelle',cat:'avantage',
    details:{base_legale:'Accords non-marchand 2017-2020 + IFIC (Institut de classification de fonctions)',conditions:['Classification selon la fonction réelle (pas le diplôme)','Barème IFIC remplace progressivement les anciens barèmes','Toutes les fonctions santé classifiées de 1 à 20','Applicable secteur privé non-marchand fédéral'],calcul:'Barème IFIC = salaire de base selon catégorie fonctionnelle (1-20) + ancienneté barémique. Supplément attractivité variable selon sous-secteur.',special:'Le passage à l\'IFIC peut entraîner un complément si l\'ancien salaire était inférieur au nouveau barème. Pas de diminution.'}},
  {nom:'Prime de nuit',montant:'+35% salaire horaire',condition:'20h-6h',cat:'nuit',
    details:{base_legale:'CCT CP 330 — Travail de nuit en santé',conditions:['Heures prestées entre 20h et 6h','Taux le plus élevé des CP belges','Applicable: infirmiers, aides-soignants, personnel logistique nuit'],calcul:'Salaire horaire × 35%. Ex: 17 EUR/h → +5.95 EUR/h nuit. Sur 10h nuit (20h-6h): +59.50 EUR brut.',fiscal:'Dispense versement PP employeur 22.8% (travail de nuit structurel)'}},
  {nom:'Prime samedi',montant:'+26% salaire horaire',condition:'Tout samedi',cat:'nuit',
    details:{base_legale:'CCT CP 330',conditions:['Toute heure prestée le samedi (0h-24h)','Applicable à tout le personnel'],calcul:'Salaire horaire × 26%. Ex: 17 EUR/h → +4.42 EUR/h samedi.'}},
  {nom:'Prime dimanche/férié',montant:'+56% salaire horaire',condition:'Dimanche et 10 fériés',cat:'nuit',
    details:{base_legale:'CCT CP 330 + Loi 16/03/1971',conditions:['Dimanche et 10 jours fériés légaux','Repos compensatoire obligatoire','Secteur santé: dérogation travail dimanche permanent'],calcul:'Salaire horaire × 56%. Ex: 17 EUR/h → +9.52 EUR/h dimanche/férié.',cumul:'Samedi + nuit cumulables. Dimanche + nuit cumulables (56% + 35%).'}},
  {nom:'Prime garde à domicile',montant:'Forfait + rappel rémunéré',condition:'Garde de disponibilité',cat:'conditions',
    details:{base_legale:'CCT CP 330 — Garde de disponibilité',conditions:['Le travailleur reste disponible à domicile','Forfait par période de garde (soirée/nuit/WE)','Si rappel: heures prestées à 100% + déplacement rémunéré','Temps de réponse: généralement 30 minutes'],calcul:'Forfait garde: ~3-5 EUR/h de disponibilité. Si rappel: salaire normal + majorations (nuit +35%, WE +56%).'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 330',conditions:['Ancienneté min 6 mois','Prorata entrée/sortie'],paiement:'Décembre',fiscal:'ONSS + PP'}},
  {nom:'Prime d\'attractivité Maribel',montant:'Variable selon fonds',condition:'Via Fonds Maribel',cat:'avantage',
    details:{base_legale:'Fonds Maribel Social — Accords non-marchand',conditions:['Financement via réduction structurelle ONSS','Varie selon sous-secteur et disponibilités du fonds','Peut inclure: prime annuelle, complément barémique'],special:'Le Maribel social finance aussi la création d\'emplois supplémentaires dans le secteur.'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 330',conditions:['Affilié syndicat reconnu'],paiement:'Mars-avril via syndicat',fiscal:'Non imposable'}},
],
'111':[
  {nom:'Prime équipe matin',montant:'+10% salaire horaire',condition:'6h-14h',cat:'equipe',
    details:{base_legale:'CCT CP 111 — Travail en équipe métallurgie',conditions:['Poste matin: 6h-14h','Système rotation régulier','Min 1 semaine par poste'],calcul:'Salaire horaire × 10%. Ex: 15.80 EUR/h → +1.58 EUR/h matin.',cumul:'Non cumulable avec prime après-midi ou nuit (le poste détermine la prime)'}},
  {nom:'Prime équipe après-midi',montant:'+15% salaire horaire',condition:'14h-22h',cat:'equipe',
    details:{base_legale:'CCT CP 111',conditions:['Poste après-midi: 14h-22h','Système rotation régulier'],calcul:'Salaire horaire × 15%. Ex: 15.80 EUR/h → +2.37 EUR/h après-midi.'}},
  {nom:'Prime de nuit',montant:'+25% salaire horaire',condition:'22h-6h',cat:'nuit',
    details:{base_legale:'CCT CP 111 + Loi travail de nuit',conditions:['Heures entre 22h et 6h','Applicable dès la 1ère heure'],calcul:'Salaire horaire × 25%. Ex: 15.80 EUR/h → +3.95 EUR/h nuit.',fiscal:'Dispense PP employeur 22.8% sur travail de nuit structurel'}},
  {nom:'Prime insalubrité/danger',montant:'+5% à +15% salaire horaire',condition:'Bruit, chaleur, poussières',cat:'conditions',
    details:{base_legale:'CCT CP 111 — Conditions de travail pénibles',conditions:['Bruit > 80 dB: +5%','Chaleur > 30°C: +10%','Poussières/fumées toxiques: +10-15%','Évaluation par conseiller en prévention'],calcul:'Variable selon le risque. Cumulable entre risques (max +15%).'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 111',conditions:['Ancienneté min 6 mois','Prorata prestations'],paiement:'Décembre',fiscal:'ONSS + PP'}},
  {nom:'Eco-chèques',montant:'250 EUR/an',condition:'Temps plein',cat:'avantage',
    details:{base_legale:'CCT 98 CNT + CCT CP 111',conditions:['250 EUR temps plein, prorata','Validité 24 mois'],exoneration:'Exonéré ONSS + IPP'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 111 — Fonds social métallurgie',conditions:['Affilié syndicat reconnu'],paiement:'Mars-avril',fiscal:'Non imposable'}},
],
'140':[
  {nom:'Indemnité séjour national',montant:'~37 EUR/jour',condition:'> 4h déplacement',cat:'conditions',
    details:{base_legale:'CCT CP 140 — Indemnités de séjour transport',conditions:['Déplacement > 4h du dépôt','Pas de retour possible pour le repas','Forfait journalier couvrant repas + boissons'],calcul:'~37 EUR/jour national. Si nuitée nécessaire: +50-70 EUR hébergement.',exoneration:'Exonéré ONSS + IPP (forfaits acceptés par l\'ONSS/SPF)'}},
  {nom:'Indemnité séjour international',montant:'~50-70 EUR/jour',condition:'Exonérée ONSS/IPP',cat:'conditions',
    details:{base_legale:'CCT CP 140 + Circulaire SPF Finances',conditions:['Transport international (hors Belgique)','Forfait variable selon pays de destination','Liste SPF Finances des forfaits par pays'],calcul:'~50 EUR/jour (pays limitrophes) à ~70 EUR/jour (pays lointains). Couvre repas + frais accessoires.',exoneration:'Totalement exonéré ONSS + IPP si forfaits SPF respectés'}},
  {nom:'Prime ADR',montant:'+5% à +10% salaire',condition:'Transport matières dangereuses',cat:'conditions',
    details:{base_legale:'CCT CP 140 + Accord européen ADR',conditions:['Certificat ADR valide (formation 5 jours + examen)','Transport effectif de marchandises dangereuses (classes 1-9)','Renouvellement tous les 5 ans','Véhicule conforme ADR (équipements, plaques, documents)'],calcul:'+5% pour ADR de base, +10% pour classes spéciales (explosifs, radioactifs). Ex: 16 EUR/h → +0.80 à +1.60 EUR/h.'}},
  {nom:'Heures d\'attente',montant:'100% salaire après 1h',condition:'Temps d\'attente chargement',cat:'conditions',
    details:{base_legale:'CCT CP 140 — Temps de travail chauffeurs',conditions:['Temps d\'attente au chargement/déchargement','1ère heure: pas de rémunération (temps de disponibilité)','Au-delà: 100% du salaire horaire','Tachygraphe fait foi pour la durée'],calcul:'Après 1h d\'attente: salaire normal. Ex: 3h attente → 2h rémunérées à 100%. Important pour le respect des temps CE 561/2006.'}},
  {nom:'Prime de nuit',montant:'+25% salaire horaire',condition:'22h-6h',cat:'nuit',
    details:{base_legale:'CCT CP 140 + Loi travail de nuit',conditions:['Heures 22h-6h','Fréquent en transport longue distance'],calcul:'Salaire horaire × 25%.',fiscal:'Dispense PP employeur possible'}},
  {nom:'Prime samedi',montant:'+50% salaire horaire',condition:'Tout samedi',cat:'nuit',
    details:{base_legale:'CCT CP 140',conditions:['Toutes les heures du samedi'],calcul:'Salaire horaire × 50%. Repos compensatoire en semaine.'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 140',conditions:['Ancienneté min 6 mois','Prorata'],paiement:'Décembre',fiscal:'ONSS + PP'}},
  {nom:'Chèques-repas',montant:'7-8 EUR/jour',condition:'Par jour presté',cat:'avantage',
    details:{base_legale:'CCT CP 140 + AR 28/11/1969',conditions:['1 chèque par jour presté','Part patronale 5.91-6.91 EUR','Part travailleur min 1.09 EUR'],exoneration:'Exonéré ONSS + IPP si conditions',cumul:'Non cumulable avec indemnité séjour pour le même jour'}},
  {nom:'Prime syndicale',montant:'~135 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 140 — Fonds social transport',conditions:['Affilié syndicat reconnu'],paiement:'Mars-avril',fiscal:'Non imposable'}},
],
'121':[
  {nom:'Prime insalubrité',montant:'+5% salaire horaire',condition:'Conditions spéciales',cat:'conditions',
    details:{base_legale:'CCT CP 121 — Nettoyage',conditions:['Nettoyage industriel lourd','Contact produits chimiques dangereux','Nettoyage après sinistre (incendie, inondation)','Évaluation par conseiller en prévention'],calcul:'Salaire horaire × 5%. Ex: 13.80 EUR/h → +0.69 EUR/h.'}},
  {nom:'Prime de nuit',montant:'+25% salaire horaire',condition:'22h-6h',cat:'nuit',
    details:{base_legale:'CCT CP 121 + Loi travail de nuit',conditions:['Heures 22h-6h','Fréquent: nettoyage bureaux, hôpitaux, gares'],calcul:'Salaire horaire × 25%. Ex: 13.80 EUR/h → +3.45 EUR/h nuit.'}},
  {nom:'Prime dimanche',montant:'+100% salaire horaire',condition:'Tout dimanche',cat:'nuit',
    details:{base_legale:'Loi 16/03/1971 + CCT CP 121',conditions:['Toutes les heures du dimanche','Repos compensatoire obligatoire'],calcul:'Salaire horaire × 2.'}},
  {nom:'Indemnité déplacement',montant:'0.15 EUR/km ou abonnement',condition:'Entre chantiers',cat:'conditions',
    details:{base_legale:'CCT CP 121 — Frais de déplacement',conditions:['Déplacement entre chantiers/sites de nettoyage','Domicile-1er site: intervention transport en commun','Véhicule privé entre sites: 0.15 EUR/km'],exoneration:'Exonéré ONSS comme frais professionnels'}},
  {nom:'Prime fin d\'année',montant:'Selon ancienneté',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 121',conditions:['Variable selon ancienneté et CCT entreprise','Prorata prestations'],paiement:'Décembre',fiscal:'ONSS + PP'}},
  {nom:'Prime syndicale',montant:'~100 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 121',conditions:['Affilié syndicat reconnu'],paiement:'Mars-avril',fiscal:'Non imposable'}},
],
'152':[
  {nom:'Allocation foyer/résidence',montant:'Selon barème FP',condition:'Selon situation familiale',cat:'avantage',
    details:{base_legale:'Statut pécuniaire personnel enseignement subventionné',conditions:['Allocation de foyer: si conjoint ne bénéficie pas d\'une allocation similaire','Allocation de résidence: si pas de conjoint ou conjoint bénéficie déjà','Montants indexés selon barèmes fonction publique'],calcul:'Foyer: ~250-350 EUR/mois selon ancienneté. Résidence: ~125-175 EUR/mois. Indexé avec le pivot.'}},
  {nom:'Prime fin d\'année',montant:'1 mois brut',condition:'Au 31/12',cat:'annuelle',
    details:{base_legale:'CCT CP 152 / Statut enseignement',conditions:['Ancienneté dans le secteur','Prorata prestations'],paiement:'Décembre',fiscal:'ONSS + PP'}},
  {nom:'Prime syndicale',montant:'~100 EUR/an',condition:'Membre syndicat',cat:'syndicale',
    details:{base_legale:'CCT CP 152',conditions:['Affilié syndicat reconnu'],paiement:'Mars-avril',fiscal:'Non imposable'}},
],
};

// ════════════════════════════════════════════════════════════
// 3. CONGÉS SECTORIELS
// ════════════════════════════════════════════════════════════
export const CONGES_SECTORIELS={
'118':{legal:20,sectoriels:[],note:'20 jours légaux standard'},
'119':{legal:20,sectoriels:[],note:'20 jours légaux + jours fériés commerce'},
'200':{legal:20,sectoriels:[{nom:'Congé ancienneté',jours:1,condition:'Après 15 ans'}],note:'Possibilité congé ancienneté selon CCT entreprise'},
'302':{legal:20,sectoriels:[{nom:'Repos compensatoire dimanche',jours:'variable',condition:'Par dimanche presté'},{nom:'Repos compensatoire férié',jours:'variable',condition:'Par férié presté'}],note:'Repos compensatoires fréquents'},
'124':{legal:20,sectoriels:[{nom:'Congé ancienneté',jours:1,condition:'Après 10 ans'},{nom:'Congé ancienneté',jours:2,condition:'Après 20 ans'},{nom:'Congé ancienneté',jours:3,condition:'Après 25 ans'},{nom:'Jours intempéries',jours:'variable',condition:'Arrêt chantier météo (rémunéré 75%)'},{nom:'Congé Construction',jours:12,condition:'6 jours été + 6 jours hiver (fermeture sectorielle)'}],note:'12 jours congé construction obligatoires'},
'322.01':{legal:20,sectoriels:[],note:'20 jours légaux standard'},
'330':{legal:20,sectoriels:[{nom:'Repos compensatoire nuit',jours:4,condition:'1j/trimestre si > 20 nuits/trimestre'},{nom:'Congé supplémentaire',jours:1,condition:'Selon sous-secteur'}],note:'Repos compensatoires pour travail de nuit/WE'},
'111':{legal:20,sectoriels:[{nom:'Congé ancienneté',jours:1,condition:'Après 10 ans'},{nom:'Congé ancienneté',jours:2,condition:'Après 20 ans'}],note:'Congés ancienneté selon CCT sectorielle'},
'140':{legal:20,sectoriels:[{nom:'Repos compensatoire',jours:'variable',condition:'Selon réglementation temps de conduite CE 561/2006'}],note:'Repos obligatoire tachygraphe: 45h/semaine'},
'121':{legal:20,sectoriels:[],note:'20 jours légaux standard'},
'152':{legal:20,sectoriels:[{nom:'Vacances scolaires',jours:'~60',condition:'Selon calendrier CF/FWB (Toussaint, Noël, Carnaval, Pâques, été)'}],note:'Calendrier scolaire applicable'},
};

// ════════════════════════════════════════════════════════════
// 4. STATUTS APPRENTIS
// ════════════════════════════════════════════════════════════
export const STATUTS_APPRENTIS={
ifapme:{
  nom:'Contrat d\'apprentissage IFAPME (Wallonie)',
  base_legale:'Décret wallon 20/07/2016',
  duree:'1 à 3 ans',
  age:'15 à 25 ans',
  remuneration:[
    {annee:'1ère année',montant:340.79,pct:'~17% RMMMG'},
    {annee:'2ème année',montant:476.99,pct:'~23% RMMMG'},
    {annee:'3ème année',montant:613.30,pct:'~30% RMMMG'},
  ],
  cotisations:'ONSS réduit: pas de cotisation travailleur, employeur ~12%',
  conges:'20 jours + vacances scolaires (si < 18 ans)',
  formation:'Min 1 jour/semaine en centre IFAPME',
  particularites:['Pas de préavis 1ère année (période d\'essai)','Tuteur obligatoire en entreprise','Allocations familiales maintenues','Pas de précompte professionnel si < plafond','Convention tripartite: apprenti / employeur / IFAPME'],
},
sfpme:{
  nom:'Convention de stage SFPME (Bruxelles)',
  base_legale:'Ordonnance bruxelloise 02/05/2019',
  duree:'1 à 3 ans',
  age:'15 à 25 ans',
  remuneration:[
    {annee:'1ère année',montant:340.79,pct:'~17% RMMMG'},
    {annee:'2ème année',montant:476.99,pct:'~23% RMMMG'},
    {annee:'3ème année',montant:613.30,pct:'~30% RMMMG'},
  ],
  cotisations:'ONSS réduit, pas de lien de subordination',
  conges:'Vacances scolaires si < 18 ans, sinon 20 jours',
  formation:'EFP/Syntra Brussel — 1-2 jours/semaine',
  particularites:['Pas de contrat de travail (convention de stage)','Indemnité (pas de salaire)','Pas de lien de subordination','Protection sociale via statut spécifique','Couverture accident du travail par employeur'],
},
etudiant:{
  nom:'Convention de stage étudiant en entreprise',
  base_legale:'Loi 10/04/1971 + réglementation communautaire',
  duree:'Variable (quelques semaines à 6 mois)',
  age:'16+ (enseignement secondaire/supérieur)',
  remuneration:[
    {annee:'Stage non rémunéré',montant:0,pct:'Fréquent en enseignement'},
    {annee:'Stage rémunéré (convention)',montant:'Variable',pct:'Selon entreprise'},
    {annee:'Contrat étudiant',montant:'RMMMG prorata',pct:'Si contrat de travail'},
  ],
  cotisations:'Si convention: pas d\'ONSS. Si contrat étudiant: cotisation réduite 2.71% + 5.42%',
  conges:'Selon convention tripartite',
  formation:'Lié au programme d\'études',
  particularites:['Convention tripartite: étudiant / employeur / école','Pas de contrat de travail si stage curriculaire','Assurance accidents du travail obligatoire','Étudiant jobiste: max 600h/an (cotisation réduite 2.71%)','Pas de précompte professionnel si < 14.508 EUR/an net imposable'],
},
contratAlternance:{
  nom:'Contrat d\'alternance unifié',
  base_legale:'Accord cadre 2015 + décrets communautaires',
  duree:'1 à 3 ans',
  age:'15 à 25 ans',
  remuneration:[
    {annee:'1ère année (< 18 ans)',montant:340.79,pct:'~17% RMMMG'},
    {annee:'2ème année',montant:476.99,pct:'~23% RMMMG'},
    {annee:'3ème année',montant:613.30,pct:'~30% RMMMG'},
  ],
  cotisations:'ONSS réduit',
  conges:'20 jours + vacances scolaires si < 18 ans',
  formation:'Min 20% du temps en formation (IFAPME/EFP/Syntra/CEFA)',
  particularites:['Reconnaissance mutuelle entre Régions','Contrat unique valable partout en Belgique','Plan de formation obligatoire','Évaluation intermédiaire et finale','Certification reconnue en fin de parcours'],
},
};

// ════════════════════════════════════════════════════════════
// 5. OBLIGATIONS SECTORIELLES
// ════════════════════════════════════════════════════════════
export const OBLIGATIONS_SECTORIELLES={
'118':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur',items:['Veste/pantalon de travail','Charlotte/calot','Chaussures de sécurité','Tablier']},
  hygiene:{haccp:true,certificat_medical:true,formations:['Formation HACCP initiale','Recyclage annuel','Hygiène des mains','Allergènes']},
  securite:['Extincteurs','Plan d\'évacuation','Premiers secours','Protection machines'],
},
'119':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur ou indemnité',items:['Veste/tablier','Charlotte (rayon boucherie/boulangerie)','Chaussures adaptées']},
  hygiene:{haccp:true,certificat_medical:true,formations:['HACCP','Traçabilité','Conservation']},
  securite:['Ergonomie caisse','Manutention charges'],
},
'302':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur',items:['Tenue de cuisine complète','Chaussures de sécurité cuisine','Uniforme de service']},
  hygiene:{haccp:true,certificat_medical:true,formations:['HACCP cuisine/salle','Allergènes obligatoire','Conservation/chaîne du froid','Nettoyage/désinfection']},
  securite:['Plan de prévention','Premiers secours','Extincteurs','Ventilation cuisine'],
},
'124':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur',items:['Casque de chantier','Chaussures de sécurité S3','Vêtements haute visibilité','Gants','Lunettes','Harnais anti-chute (hauteur)','Protection auditive']},
  hygiene:{haccp:false,certificat_medical:false,formations:['VCA (sécurité chantier)','Travail en hauteur','Amiante (si applicable)','Premiers secours chantier']},
  securite:['Carte C3.2A obligatoire','Checkin@work','Plan de sécurité/santé','Coordinateur sécurité','Registre de chantier','Analyse des risques'],
},
'330':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur',items:['Tunique/uniforme soignant','Chaussures médicales','Gants','Masques','Surblouse']},
  hygiene:{haccp:false,certificat_medical:true,formations:['Hygiène hospitalière','Prévention infections','Déchets médicaux','Radioprotection (si applicable)']},
  securite:['Plan d\'urgence interne','Défibrillateur','Prévention violence/agression','Ergonomie soins (manutention patients)'],
},
'121':{
  vetements:{obligatoire:true,fourniture:'Employeur',entretien:'Employeur ou indemnité',items:['Vêtements de travail','Chaussures de sécurité','Gants','Protection yeux (produits chimiques)']},
  hygiene:{haccp:false,certificat_medical:false,formations:['Manipulation produits chimiques','Fiches de sécurité (FDS)','Ergonomie']},
  securite:['Formation hauteur (laveurs de vitres)','EPI obligatoires','Analyse des risques par chantier'],
},
};

// ════════════════════════════════════════════════════════════
// 6. PENSION COMPLÉMENTAIRE SECTORIELLE
// ════════════════════════════════════════════════════════════
export const PENSION_SECTORIELLE={
'200':{plan:'PCLI CP 200',taux:1.50,base:'Salaire brut annuel',organisme:'Assureur sectoriel',obligatoire:true,note:'Plan Complémentaire Libre d\'Investissement — 1.5% du salaire annuel brut'},
'124':{plan:'Pension Construction',taux:2.00,base:'Salaire brut annuel',organisme:'Constructiv',obligatoire:true,note:'Via Fonds Constructiv, cotisation patronale'},
'302':{plan:'Pension Horeca',taux:1.00,base:'Salaire brut annuel',organisme:'Fonds social Horeca',obligatoire:true,note:'Pension complémentaire sectorielle'},
'330':{plan:'Pension Santé',taux:1.50,base:'Salaire brut annuel',organisme:'Fonds Maribel / assureur',obligatoire:true,note:'Plan sectoriel santé'},
'111':{plan:'Pension Métal',taux:1.50,base:'Salaire brut annuel',organisme:'Assureur sectoriel',obligatoire:true,note:'Via fonds sectoriel métal'},
'118':{plan:'Pension Alimentaire',taux:1.00,base:'Salaire brut annuel',organisme:'Fonds social alimentaire',obligatoire:true,note:'Cotisation patronale uniquement'},
'140':{plan:'Pension Transport',taux:1.20,base:'Salaire brut annuel',organisme:'Fonds social transport',obligatoire:true,note:'Via fonds sectoriel transport'},
'121':{plan:'Pension Nettoyage',taux:0.75,base:'Salaire brut annuel',organisme:'Fonds sectoriel nettoyage',obligatoire:true,note:'Plan modeste mais obligatoire'},
};

// ════════════════════════════════════════════════════════════
// 7. FONDS DE SÉCURITÉ D'EXISTENCE
// ════════════════════════════════════════════════════════════
export const FONDS_SECTORIELS={
'124':{nom:'Constructiv (ex-FBZ-FSE)',url:'constructiv.be',cotisation:'~12% masse salariale',services:['Timbres fidélité','Timbres intempéries','Formation sectorielle','Pension complémentaire','Prévention sécurité','Carte C3.2A']},
'302':{nom:'Horeca Forma',url:'horecaforma.be',cotisation:'Variable',services:['Formation sectorielle','Aide à l\'emploi','Information juridique','Prime de fin d\'année (via fonds)']},
'330':{nom:'Fonds Maribel Social',url:'maribel.be',cotisation:'Réduction structurelle',services:['Création d\'emplois supplémentaires','Formation','Prime d\'attractivité','Pension complémentaire']},
'200':{nom:'Fonds social CP 200',url:'fs200.be',cotisation:'0.10% masse salariale',services:['Formation','Outplacement','Groupes à risque','Pension complémentaire PCLI']},
'111':{nom:'Fonds social Métal',url:'fondsmetallurgie.be',cotisation:'Variable',services:['Formation technique','Prime syndicale','Prépension sectorielle','Complément chômage']},
'118':{nom:'Fonds social Alimentaire',url:'fondsalimentaire.be',cotisation:'Variable',services:['Formation HACCP','Prime syndicale','Pension complémentaire','Prévention']},
'140':{nom:'Fonds social Transport',url:'fondstransport.be',cotisation:'Variable',services:['Formation Code 95','Prime syndicale','Pension complémentaire','Outplacement']},
'121':{nom:'Fonds social Nettoyage',url:'fondsnettoyage.be',cotisation:'Variable',services:['Formation','Prime syndicale','Vêtements de travail','Pension complémentaire']},
};

// ════════════════════════════════════════════════════════════
// 8. TIMBRES FIDÉLITÉ & INTEMPÉRIES (CP 124)
// ════════════════════════════════════════════════════════════
export const TIMBRES={
fidelite:{
  cp:'124',nom:'Timbres de fidélité',organisme:'Constructiv/OPOC',
  calcul:'~9% du salaire brut annuel',
  conditions:['Minimum 200 jours prestés dans la construction','Au service d\'un employeur construction au 30 juin','Pas de licenciement pour faute grave'],
  paiement:'Juillet (via Constructiv)',
  montant_indicatif:'Entre 2.500 et 4.000 EUR (selon salaire)',
  fiscalite:'Imposable — PP retenu à la source par Constructiv',
},
intemperies:{
  cp:'124',nom:'Timbres intempéries',organisme:'Constructiv/OPOC',
  calcul:'75% du salaire horaire normal × heures d\'intempéries',
  conditions:['Arrêt de chantier pour conditions météo','Gel, pluie intense, neige, tempête','Constaté par le chef de chantier','Déclaration dans les 48h'],
  paiement:'Mensuel (via employeur) ou trimestriel (via fonds)',
  montant_indicatif:'Variable — dépend du nombre de jours d\'arrêt',
  fiscalite:'Traitement fiscal comme rémunération',
},
};

// ════════════════════════════════════════════════════════════
// 9. INDEXATION PAR CP
// ════════════════════════════════════════════════════════════
export const INDEXATION_CP={
'200':{mecanisme:'Index santé lissé',date:'Janvier',coefficient:'Automatique dès dépassement pivot',frequence:'Annuelle',dernier:'01/01/2026',pctDernier:2.0,note:'Application automatique au 1er janvier'},
'118':{mecanisme:'Index santé sectoriel',date:'Selon CCT',coefficient:'Négociation sectorielle',frequence:'Variable',dernier:'01/01/2026',pctDernier:2.0,note:'Peut être différé par accord sectoriel'},
'119':{mecanisme:'Index santé',date:'Janvier/Juillet',coefficient:'Automatique',frequence:'Semestrielle',dernier:'01/01/2026',pctDernier:2.0,note:'Double vérification annuelle'},
'302':{mecanisme:'Index santé',date:'Janvier',coefficient:'Automatique',frequence:'Annuelle',dernier:'01/01/2026',pctDernier:2.0,note:'Application en janvier'},
'124':{mecanisme:'Index santé',date:'Janvier/Juillet',coefficient:'Automatique',frequence:'Semestrielle',dernier:'01/01/2026',pctDernier:2.0,note:'Révision semestrielle des barèmes'},
'322.01':{mecanisme:'Index santé automatique',date:'Lors du dépassement',coefficient:'2%',frequence:'Au dépassement du pivot',dernier:'01/01/2026',pctDernier:2.0,note:'Application immédiate au dépassement'},
'330':{mecanisme:'Index santé — Protocole non-marchand',date:'Selon protocole',coefficient:'Négocié',frequence:'Variable',dernier:'01/01/2026',pctDernier:2.0,note:'Suivi des accords du non-marchand'},
'111':{mecanisme:'Index santé sectoriel',date:'Janvier/Juillet',coefficient:'Automatique',frequence:'Semestrielle',dernier:'01/01/2026',pctDernier:2.0,note:'Révision semestrielle'},
'140':{mecanisme:'Index santé',date:'Janvier',coefficient:'Automatique',frequence:'Annuelle',dernier:'01/01/2026',pctDernier:2.0,note:'Application annuelle'},
'121':{mecanisme:'Index santé',date:'Janvier',coefficient:'Automatique',frequence:'Annuelle',dernier:'01/01/2026',pctDernier:2.0,note:'Application annuelle'},
'152':{mecanisme:'Index fonction publique',date:'Lors du dépassement',coefficient:'2%',frequence:'Au pivot',dernier:'01/01/2026',pctDernier:2.0,note:'Suit le mécanisme de la fonction publique'},
};

// ════════════════════════════════════════════════════════════
// 10. JOURS FÉRIÉS LÉGAUX BELGIQUE 2026
// ════════════════════════════════════════════════════════════
export const JOURS_FERIES_2026=[
  {date:'01/01/2026',nom:'Jour de l\'An',jour:'Jeudi'},
  {date:'05/04/2026',nom:'Lundi de Pâques',jour:'Lundi'},
  {date:'01/05/2026',nom:'Fête du Travail',jour:'Vendredi'},
  {date:'14/05/2026',nom:'Ascension',jour:'Jeudi'},
  {date:'25/05/2026',nom:'Lundi de Pentecôte',jour:'Lundi'},
  {date:'21/07/2026',nom:'Fête nationale',jour:'Mardi'},
  {date:'15/08/2026',nom:'Assomption',jour:'Samedi'},
  {date:'01/11/2026',nom:'Toussaint',jour:'Dimanche'},
  {date:'11/11/2026',nom:'Armistice',jour:'Mercredi'},
  {date:'25/12/2026',nom:'Noël',jour:'Vendredi'},
];

// ════════════════════════════════════════════════════════════
// UI COMPONENT — TRANSVERSAL VIEW
// ════════════════════════════════════════════════════════════
export function TransversalCPView({cp,initialTab,barData}){
  const tab=initialTab||'majorations';
  const [expanded,setExpanded]=useState({});
  const maj=MAJORATIONS[cp]||MAJORATIONS['_default'];
  const primes=PRIMES_SECTORIELLES[cp]||[];
  const conges=CONGES_SECTORIELS[cp];
  const oblig=OBLIGATIONS_SECTORIELLES[cp];
  const pension=PENSION_SECTORIELLE[cp];
  const fonds=FONDS_SECTORIELS[cp];
  const idx=INDEXATION_CP[cp];
  const catColors={nuit:'#a855f7',conditions:'#fb923c',equipe:'#3b82f6',annuelle:'#c6a34e',avantage:'#22c55e',syndicale:'#06b6d4',pension:'#eab308'};

  return <div>

    {/* MAJORATIONS */}
    {tab==='majorations'&&<div>
      <C title={'Majorations — CP '+cp}>
        {maj.nuit&&<Row l={'🌙 Nuit '+(maj.nuit.heures||'22h-6h')} v={maj.nuit.taux>0?'+'+maj.nuit.taux+'%':(maj.nuit.note||'—')} c={maj.nuit.taux>0?'#a855f7':'#888'}/>}
        {maj.dimanche&&<Row l="☀️ Dimanche" v={maj.dimanche.taux>0?'+'+maj.dimanche.taux+'%':(maj.dimanche.note||'—')} c={maj.dimanche.taux>0?'#fb923c':'#888'}/>}
        {maj.ferie&&<Row l="🎌 Jours fériés" v={'+'+maj.ferie.taux+'%'+(maj.ferie.repos?' + repos compensatoire':'')} c="#ef4444"/>}
        {maj.samedi&&<Row l={'🕐 Samedi'+(maj.samedi.note?' ('+maj.samedi.note+')':'')} v={'+'+maj.samedi.taux+'%'} c="#eab308"/>}
        {maj.equipe2x8&&<Row l="🔄 Équipe 2x8" v={'+'+maj.equipe2x8.taux+'%'} c="#3b82f6"/>}
        {maj.equipe3x8&&<Row l="🔄 Équipe 3x8" v={'+'+maj.equipe3x8.taux+'%'} c="#3b82f6"/>}
        {maj.equipeAM&&<Row l={'🔄 Équipe AM'+(maj.equipeAM.note?' ('+maj.equipeAM.note+')':'')} v={'+'+maj.equipeAM.taux+'%'} c="#3b82f6"/>}
        {maj.hauteur&&<Row l="🏗 Hauteur (> 15m)" v={'+'+maj.hauteur.taux+'%'} c="#fb923c"/>}
        {maj.souterrain&&<Row l="⛏ Souterrain" v={'+'+maj.souterrain.taux+'%'} c="#fb923c"/>}
        {maj.insalubrite&&<Row l={'☣ Insalubrité'+(maj.insalubrite.note?' ('+maj.insalubrite.note+')':'')} v={'+'+maj.insalubrite.taux+'%'} c="#ef4444"/>}
        {maj.attente&&<Row l="⏱ Heures d'attente" v={'+'+maj.attente.taux+'%'+(maj.attente.note?' — '+maj.attente.note:'')} c="#eab308"/>}
        {maj.garde&&<Row l="📞 Garde" v={maj.garde.note} c="#a855f7"/>}
        {maj.coupure&&<Row l="✂ Coupure" v={maj.coupure.note} c="#888"/>}
      </C>
      <div style={{padding:10,fontSize:10,color:'#888',background:'rgba(255,255,255,.02)',borderRadius:8}}>
        Base légale: Loi 16/03/1971 sur le travail — Majorations spécifiques par CCT sectorielle.
        Le sursalaire est calculé sur le salaire horaire normal (brut mensuel / heures mensuelles).
      </div>
    </div>}

    {/* PRIMES */}
    {tab==='primes'&&<div>
      {primes.length>0?<div>
        {['nuit','equipe','conditions','annuelle','avantage','pension','syndicale'].map(cat=>{
          const catPrimes=primes.filter(p=>p.cat===cat);
          if(catPrimes.length===0)return null;
          const catNames={nuit:'Majorations horaires',equipe:'Primes d\'équipe',conditions:'Conditions de travail',annuelle:'Primes annuelles',avantage:'Avantages',pension:'Pension',syndicale:'Prime syndicale'};
          return <C key={cat} title={catNames[cat]||cat} color={catColors[cat]}>
            {catPrimes.map((p,i)=>{const k=cat+'-'+i;const isExp=expanded[k];const d=p.details;return <div key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div onClick={()=>d&&setExpanded(prev=>({...prev,[k]:!prev[k]}))} style={{padding:'10px 0',cursor:d?'pointer':'default',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:12,color:'#e8e6e0',fontWeight:500}}>{p.nom}</span>{d&&<span style={{fontSize:9,color:isExp?'#c6a34e':'#555',transition:'transform .2s',display:'inline-block',transform:isExp?'rotate(180deg)':'rotate(0deg)'}}>▼</span>}</div>
                  <div style={{fontSize:10,color:'#888',marginTop:2}}>{p.condition}</div>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:catColors[cat]||'#c6a34e',whiteSpace:'nowrap',marginLeft:12}}>{p.montant}</span>
              </div>
              {isExp&&d&&<div style={{padding:'0 0 14px 0',animation:'fadeIn .2s'}}>
                <div style={{background:'rgba(198,163,78,.04)',borderRadius:10,padding:14,border:'1px solid rgba(198,163,78,.1)'}}>
                  {d.base_legale&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Base légale</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.base_legale}</div></div>}
                  {d.conditions&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Conditions</div>{d.conditions.map((c,j)=><div key={j} style={{fontSize:10.5,color:'#ccc',padding:'2px 0',paddingLeft:10,borderLeft:'2px solid rgba(59,130,246,.2)'}}>• {c}</div>)}</div>}
                  {d.calcul&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Calcul</div><div style={{fontSize:11,color:'#e8e6e0',lineHeight:1.5}}>{d.calcul}</div></div>}
                  {d.montants&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#eab308',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Montants</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.montants}</div></div>}
                  {d.exoneration&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#a855f7',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Exonération ONSS/IPP</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.exoneration}</div></div>}
                  {d.fiscal&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#fb923c',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Traitement fiscal</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.fiscal}</div></div>}
                  {d.paiement&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#06b6d4',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Paiement</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.paiement}</div></div>}
                  {d.organisme&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#06b6d4',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Organisme</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.organisme}</div></div>}
                  {d.cumul&&<div style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Cumul</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.cumul}</div></div>}
                  {d.special&&<div style={{marginBottom:0}}><div style={{fontSize:9,fontWeight:700,color:'#ef4444',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>⚠ Attention</div><div style={{fontSize:11,color:'#e8e6e0'}}>{d.special}</div></div>}
                </div>
              </div>}
            </div>})}
          </C>;
        })}
      </div>:<div>
        {barData?.primes?.length>0?<C title={'Primes & Avantages — CP '+cp}>
          {barData.primes.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div><div style={{fontSize:12,color:'#e8e6e0',fontWeight:500}}>{p.nom}</div><div style={{fontSize:10,color:'#888'}}>{p.mois}</div></div>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{p.montant}</div>
          </div>)}
          {barData.particularites&&<div style={{marginTop:12}}>{barData.particularites.map((p,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'3px 0'}}>• {p}</div>)}</div>}
        </C>:<div style={{padding:20,textAlign:'center',color:'#888'}}>Pas de primes spécifiques détaillées pour cette CP. Consultez la CCT sectorielle.</div>}
      </div>}
    </div>}

    {/* CONGÉS */}
    {tab==='conges'&&<div>
      <C title="Congés légaux et sectoriels">
        <Row l="Congés légaux annuels" v={(conges?.legal||20)+' jours'} b/>
        {conges?.sectoriels?.map((c,i)=><Row key={i} l={c.nom} v={c.jours+(typeof c.jours==='number'?' jour(s)':'')} c="#3b82f6"/>)}
        {conges?.note&&<div style={{marginTop:8,fontSize:10,color:'#888'}}>{conges.note}</div>}
      </C>
      <C title="📅 Jours fériés légaux 2026 (10 jours)">
        {JOURS_FERIES_2026.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <span style={{color:'#e8e6e0'}}>{f.nom}</span>
          <span style={{color:'#888'}}>{f.date} ({f.jour})</span>
        </div>)}
        <div style={{marginTop:8,fontSize:10,color:'#888'}}>Si férié tombe un dimanche: jour de remplacement obligatoire. Si travaillé: +100% + repos compensatoire.</div>
      </C>
    </div>}

    {/* OBLIGATIONS */}
    {tab==='obligations'&&<div>
      {oblig?<div>
        <C title="🦺 Vêtements de travail">
          <Row l="Fourniture" v={oblig.vetements.fourniture}/>
          <Row l="Entretien" v={oblig.vetements.entretien}/>
          <div style={{marginTop:8}}>{oblig.vetements.items.map((it,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {it}</div>)}</div>
        </C>
        {oblig.hygiene&&<C title={'🧼 Hygiène'+(oblig.hygiene.haccp?' & HACCP':'')}>
          {oblig.hygiene.haccp&&<Row l="Certification HACCP" v="Obligatoire" c="#ef4444"/>}
          {oblig.hygiene.certificat_medical&&<Row l="Certificat médical" v="Obligatoire" c="#ef4444"/>}
          <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#c6a34e'}}>Formations obligatoires:</div>
          {oblig.hygiene.formations.map((f,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {f}</div>)}
        </C>}
        <C title="⚠️ Sécurité">
          {oblig.securite.map((s,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {s}</div>)}
        </C>
      </div>:<div style={{padding:20,textAlign:'center',color:'#888'}}>Obligations générales du Code du bien-être au travail (Codex). Consultez la CCT sectorielle.</div>}
    </div>}

    {/* PENSION */}
    {tab==='pension'&&<div>
      {pension?<C title="🏦 Pension complémentaire sectorielle">
        <Row l="Plan" v={pension.plan}/>
        <Row l="Taux cotisation patronale" v={pension.taux+'%'} c="#c6a34e"/>
        <Row l="Base de calcul" v={pension.base}/>
        <Row l="Organisme" v={pension.organisme}/>
        <Row l="Obligatoire" v={pension.obligatoire?'Oui':'Non'} c={pension.obligatoire?'#4ade80':'#888'}/>
        <div style={{marginTop:8,fontSize:10,color:'#888'}}>{pension.note}</div>
        <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.04)',borderRadius:6,fontSize:10}}>
          <div style={{color:'#c6a34e',fontWeight:600}}>Exemple pour un brut de 3.000 EUR/mois:</div>
          <div style={{color:'#888',marginTop:4}}>Cotisation annuelle: {fmt(3000*12*pension.taux/100)} EUR — Capital après 20 ans (2% rendement): ~{fi(3000*12*pension.taux/100*20*1.22)} EUR</div>
        </div>
      </C>:<div style={{padding:20,textAlign:'center',color:'#888'}}>Pas de plan de pension sectoriel obligatoire identifié pour cette CP. L'employeur peut mettre en place un plan d'entreprise (LPC).</div>}
    </div>}

    {/* FONDS */}
    {tab==='fonds'&&<div>
      {fonds?<C title="🏛 Fonds de sécurité d'existence">
        <Row l="Nom" v={fonds.nom}/>
        <Row l="Cotisation" v={fonds.cotisation}/>
        <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#c6a34e'}}>Services:</div>
        {fonds.services.map((s,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'3px 0'}}>• {s}</div>)}
      </C>:<div style={{padding:20,textAlign:'center',color:'#888'}}>Pas de fonds sectoriel spécifique identifié.</div>}
      {cp==='124'&&<div>
        <C title="⭐ Timbres de fidélité (Construction)" color="#c6a34e">
          <Row l="Calcul" v={TIMBRES.fidelite.calcul}/>
          <Row l="Paiement" v={TIMBRES.fidelite.paiement}/>
          <Row l="Montant indicatif" v={TIMBRES.fidelite.montant_indicatif} c="#22c55e"/>
          <Row l="Fiscalité" v={TIMBRES.fidelite.fiscalite} c="#ef4444"/>
          <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#c6a34e'}}>Conditions:</div>
          {TIMBRES.fidelite.conditions.map((c,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {c}</div>)}
        </C>
        <C title="🌧 Timbres intempéries (Construction)" color="#3b82f6">
          <Row l="Calcul" v={TIMBRES.intemperies.calcul}/>
          <Row l="Paiement" v={TIMBRES.intemperies.paiement}/>
          <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#3b82f6'}}>Conditions:</div>
          {TIMBRES.intemperies.conditions.map((c,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {c}</div>)}
        </C>
      </div>}
    </div>}

    {/* INDEXATION */}
    {tab==='indexation'&&<div>
      {idx?<C title="📈 Mécanisme d'indexation">
        <Row l="Mécanisme" v={idx.mecanisme}/>
        <Row l="Date d'application" v={idx.date}/>
        <Row l="Fréquence" v={idx.frequence}/>
        <Row l="Coefficient" v={idx.coefficient}/>
        <Row l="Dernière indexation" v={idx.dernier} c="#22c55e"/>
        <Row l="Pourcentage dernière" v={'+'+idx.pctDernier+'%'} c="#c6a34e"/>
        <div style={{marginTop:8,fontSize:10,color:'#888'}}>{idx.note}</div>
      </C>:<div style={{padding:20,textAlign:'center',color:'#888'}}>Indexation standard: index santé lissé, application au dépassement du pivot.</div>}
      <C title="Comment fonctionne l'indexation belge?" sub="Résumé simplifié">
        <div style={{fontSize:10,color:'#888',lineHeight:1.8}}>{[
          '1. L\'indice des prix à la consommation est calculé mensuellement par Statbel',
          '2. L\'indice santé = indice prix HORS alcool, tabac, carburants',
          '3. L\'indice lissé = moyenne des 4 derniers mois de l\'indice santé',
          '4. Quand l\'indice lissé dépasse le "pivot", les salaires augmentent de 2%',
          '5. Certains secteurs appliquent immédiatement, d\'autres à date fixe (janvier, juillet)',
          '6. Le nouveau pivot = ancien pivot × 1.02',
        ].map((t,i)=><div key={i}>• {t}</div>)}</div>
      </C>
    </div>}

    {/* APPRENTIS */}
    {tab==='apprentis'&&<div>
      {Object.values(STATUTS_APPRENTIS).map((st,idx)=><C key={idx} title={'🎓 '+st.nom} sub={st.base_legale}>
        <Row l="Durée" v={st.duree}/><Row l="Âge" v={st.age}/><Row l="Formation" v={st.formation}/><Row l="Cotisations" v={st.cotisations}/><Row l="Congés" v={st.conges}/>
        <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#c6a34e'}}>Rémunération:</div>
        {st.remuneration.map((r,i)=><Row key={i} l={r.annee} v={typeof r.montant==='number'?fmt(r.montant)+' EUR/mois':r.montant} c="#22c55e" sub/>)}
        <div style={{marginTop:8,fontSize:11,fontWeight:600,color:'#c6a34e'}}>Particularités:</div>
        {st.particularites.map((p,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>• {p}</div>)}
      </C>)}
    </div>}

    {/* FÉRIÉS */}
    {tab==='feries'&&<div>
      <C title="📅 Jours fériés légaux Belgique 2026">
        {JOURS_FERIES_2026.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div><div style={{fontSize:12,color:'#e8e6e0',fontWeight:500}}>{f.nom}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:12,color:'#c6a34e',fontWeight:600}}>{f.date}</div><div style={{fontSize:10,color:'#888'}}>{f.jour}</div></div>
        </div>)}
      </C>
      <C title="Règles applicables" sub="Loi 04/01/1974 relative aux jours fériés">
        <div style={{fontSize:10,color:'#888',lineHeight:1.8}}>{[
          'Férié travaillé: +100% du salaire normal + jour de repos compensatoire dans les 6 semaines',
          'Férié coïncidant avec un dimanche: jour de remplacement obligatoire (choix employeur/CE)',
          'Férié coïncidant avec un jour d\'inactivité: jour de remplacement dans l\'année civile',
          'Travailleur à temps partiel: droit au férié si le jour coïncide avec un jour de travail habituel',
          'Salaire garanti: l\'employeur paie le salaire normal pour le jour férié non travaillé',
          'Secteurs avec dérogation: horeca, santé, transport, distribution — travail autorisé avec majorations',
        ].map((t,i)=><div key={i}>• {t}</div>)}</div>
      </C>
    </div>}
  </div>;
}
