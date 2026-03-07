'use client';
import { B, C, TX_ONSS_E, TX_ONSS_W, fmt, quickPP, LOIS_BELGES, FORF_KM, ECO_MAX } from '@/app/lib/helpers';
import{useState,useMemo}from'react';

const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const Row=({l,v,c,b,sub})=><div style={{display:'flex',justifyContent:'space-between',padding:b?'8px 0':'5px 0',borderBottom:b?'2px solid rgba(198,163,78,.2)':'1px solid rgba(255,255,255,.03)',fontWeight:b?700:400}}><span style={{color:sub?'#888':'#e8e6e0',fontSize:sub?10:11.5,fontStyle:sub?'italic':'normal'}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const I=({label,type,value,onChange,style:st,options})=>{
  return <div style={st}><div style={{fontSize:10,color:'#5e5c56',marginBottom:3}}>{label}</div>
  {options?<select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>
  :<input type={type||'text'} value={value} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',boxSizing:'border-box'}}/>}
  </div>;
};
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const Bar=({pct,color})=><div style={{width:'100%',height:6,background:'rgba(255,255,255,.05)',borderRadius:3,overflow:'hidden'}}><div style={{width:Math.min(pct,100)+'%',height:'100%',background:color||'#c6a34e',borderRadius:3}}/></div>;


// ════════════════════════════════════════════════════════════
// 56 PRIMES BELGES — DONNÉES COMPLÈTES
// ════════════════════════════════════════════════════════════
const PRIMES_DB=[
  // ── RÉMUNÉRATION VARIABLE ──
  {id:'prime_fin_annee',cat:'remvar',icon:'🎄',nom:'Prime de fin d\'année (13ème mois)',taxable:true,onss:true,
    desc:'Obligatoire CP 200 — équivalent 1 mois brut',
    base_legale:'CCT sectorielle (variable par CP). CP 200: CCT du CNT.',
    conditions:['Ancienneté min 6 mois au 31/12','Prorata en cas d\'entrée/sortie en cours d\'année','Non due si licenciement pour faute grave (Art. 35)','Due au prorata si licenciement par l\'employeur'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Salaire brut mensuel × (mois prestés / 12)'}),
    plafond:null,prorata:true,
    secteurs:'Obligatoire dans la plupart des CP (200, 118, 119, 124, 302, 330, etc.)',
    paiement:'Décembre, avec le salaire du mois',fiscal:'Taxé comme rémunération — ONSS 13.07% + PP barème annualisé'},
  {id:'bonus_cct90',cat:'remvar',icon:'🎯',nom:'Bonus CCT 90 (non-récurrent)',taxable:false,onss:false,
    desc:'Avantage non-récurrent lié aux résultats collectifs',
    base_legale:'CCT n° 90 du 20/12/2007 (CNT) + Loi 21/12/2007',
    conditions:['Objectifs collectifs mesurables et vérifiables','Plan bonus déposé au SPF ETCS','Période de référence: min 3 mois','Pas d\'objectifs individuels (seulement collectifs)','Montant max 4.255 EUR brut/an (2026)'],
    calcul:(brut)=>{const m=Math.min(brut,4255);const cotE=m*0.33;const cotW=m*TX_ONSS_W;return{brut:m,onssW:cotW,onssE:cotE,pp:0,desc:'Cotisation spéciale 33% employeur + 13.07% travailleur. PAS de précompte professionnel.'}},
    plafond:4255,prorata:false,
    procedure:'1. Rédiger acte d\'adhésion ou CCT d\'entreprise\n2. Définir objectifs mesurables\n3. Déposer au SPF Emploi (greffe)\n4. Période de référence min 3 mois\n5. Paiement après vérification des objectifs',
    paiement:'Après clôture période de référence',fiscal:'PAS de PP. Cotisation solidarité 13.07% travailleur + 33% employeur.'},
  {id:'warrants',cat:'remvar',icon:'📈',nom:'Warrants / Stock Options',taxable:true,onss:false,
    desc:'Régime fiscal spécifique — imposition à l\'attribution',
    base_legale:'Loi 26/03/1999 relative aux stock options + AR 25/08/2012',
    conditions:['Offre écrite avec valeur sous-jacent','Acceptation dans les 60 jours','Imposition forfaitaire à l\'attribution (pas à l\'exercice)','Pas de cotisations ONSS'],
    calcul:(brut)=>{const tax=brut*0.18;return{brut,onssW:0,onssE:0,pp:tax,desc:'Taxation forfaitaire ~18% à l\'attribution. Pas d\'ONSS. Net ~82% de la valeur.'}},
    plafond:null,fiscal:'Imposition forfaitaire ~18% à l\'attribution (15% + 1%/an au-delà de 3ème année)'},
  {id:'participation_benefices',cat:'remvar',icon:'💰',nom:'Participation aux bénéfices',taxable:true,onss:false,
    desc:'Loi du 22/05/2001 — taxée à 7% (cotisation solidarité 13.07%)',
    base_legale:'Loi 22/05/2001 relative à la participation financière des travailleurs',
    conditions:['Décision AG avec majorité spéciale','Pas de substitution au salaire existant','Tous les travailleurs doivent en bénéficier'],
    calcul:(brut)=>{const tax=brut*0.07;const cotW=brut*TX_ONSS_W;return{brut,onssW:cotW,onssE:0,pp:tax,desc:'Cotisation solidarité 13.07% + taxe spéciale 7%. Pas d\'ONSS employeur.'}},
    fiscal:'Taxe spéciale 7% + cotisation solidarité 13.07%'},
  {id:'prime_resultat',cat:'remvar',icon:'📊',nom:'Prime de résultat',taxable:true,onss:true,
    desc:'Prime liée aux performances individuelles',
    base_legale:'Droit commun — pas de régime spécifique',
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard ONSS + PP. Coût élevé mais flexibilité totale.'}),
    fiscal:'Régime standard — ONSS + PP intégralement'},
  {id:'prime_anciennete',cat:'remvar',icon:'⭐',nom:'Prime d\'ancienneté',taxable:true,onss:true,
    desc:'Prime liée aux années de service',
    base_legale:'CCT sectorielle ou d\'entreprise',
    conditions:['Selon convention: 5, 10, 15, 20, 25 ans','Montant variable selon CP et convention','Souvent: 1 mois brut ou forfait'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Taxé comme rémunération ordinaire.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'bonus_salarial',cat:'remvar',icon:'🏆',nom:'Bonus salarial collectif (Loi 2008)',taxable:true,onss:true,
    desc:'Prime liée aux résultats collectifs — plan bonus déposable au SPF',
    base_legale:'Loi du 21/12/2007 + CCT 90',
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Si hors CCT 90: régime standard. Si CCT 90: voir bonus CCT 90.'}),
    fiscal:'Régime standard sauf si éligible CCT 90'},
  {id:'bonus_bienvenue',cat:'remvar',icon:'🤝',nom:'Bonus de bienvenue / signing bonus',taxable:true,onss:true,
    desc:'Prime unique à l\'embauche',
    conditions:['Entièrement imposable et soumis ONSS','Pas de régime favorable','À prévoir dans le contrat de travail'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard. Coûteux — considérer CCT 90 comme alternative.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'prime_retention',cat:'remvar',icon:'🔒',nom:'Prime de rétention / fidélisation',taxable:true,onss:true,
    desc:'Prime conditionnée à une durée minimale de service',
    conditions:['Clause de remboursement si départ anticipé (jurisprudence variable)','Soumise ONSS + PP','Prévoir dans avenant au contrat'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard. Clause de remboursement partiel possible.'}),
    fiscal:'Régime standard ONSS + PP'},

  // ── AVANTAGES EXONÉRÉS ──
  {id:'cheques_repas',cat:'exonere',icon:'🍽',nom:'Chèques-repas',taxable:false,onss:false,
    desc:'Max 8 EUR/jour — part patronale max 6.91 EUR',
    base_legale:'AR 28/11/1969 + CCT sectorielle/entreprise',
    conditions:['1 chèque par jour effectivement presté','Part patronale max 6.91 EUR (exonérée ONSS)','Part travailleur min 1.09 EUR (retenue salaire)','Valeur faciale max 8.00 EUR','Nominatif + durée validité 12 mois','Via émetteur agréé (Sodexo, Edenred, Monizze)'],
    calcul:(brut,jours)=>{const j=jours||220;const val=8;const patron=6.91;const worker=1.09;const coutAn=patron*j;const avAn=val*j;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:coutAn,avantageNet:avAn,retenueTrav:worker*j,desc:`${j} jours × ${val} EUR = ${fi(avAn)} EUR/an. Coût employeur: ${fi(coutAn)} EUR/an. Retenue travailleur: ${fi(worker*j)} EUR/an.`}},
    plafond:8,prorata:true,
    paiement:'Mensuel via émetteur agréé',fiscal:'100% exonéré ONSS + IPP si toutes conditions remplies'},
  {id:'eco_cheques',cat:'exonere',icon:'🌿',nom:'Éco-chèques',taxable:false,onss:false,
    desc:'Max 250 EUR/an — produits écologiques uniquement',
    base_legale:'CCT 98 du CNT (2009)',
    conditions:['Maximum 250 EUR/an par travailleur temps plein','Prorata pour temps partiel','Validité 24 mois','Produits/services écologiques uniquement (liste SPF)','Non échangeables contre espèces'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:250,avantageNet:250,desc:'250 EUR/an temps plein. 100% exonéré = 250 EUR net pour 250 EUR coût.'}),
    plafond:250,prorata:true,fiscal:'100% exonéré ONSS + IPP'},
  {id:'cheques_sport',cat:'exonere',icon:'🏋',nom:'Chèques sport & culture',taxable:false,onss:false,
    desc:'Max 100 EUR/an',
    conditions:['Max 100 EUR/an','Activités sportives ou culturelles uniquement','Via émetteur agréé'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:100,avantageNet:100,desc:'100 EUR/an. 100% exonéré.'}),
    plafond:100,fiscal:'100% exonéré ONSS + IPP'},
  {id:'cheques_cadeaux',cat:'exonere',icon:'🎁',nom:'Chèques-cadeaux',taxable:false,onss:false,
    desc:'Max 40 EUR/an. Occasions: Noël/St-Nicolas. Mariage=245 EUR, naissance=245 EUR',
    base_legale:'AR 28/11/1969, Art. 19 §2, 14°',
    conditions:['Max 40 EUR/an pour Noël/St-Nicolas (par travailleur + par enfant à charge)','Mariage/cohabitation légale: max 245 EUR (unique)','Naissance/adoption: max 245 EUR (unique)','Mise à la retraite: max 40 EUR × années service'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:40,avantageNet:40,desc:'40 EUR/an Noël. +245 EUR mariage. +245 EUR naissance. Tout exonéré.'}),
    plafond:40,fiscal:'100% exonéré si plafonds respectés'},
  {id:'prime_naissance',cat:'exonere',icon:'👶',nom:'Prime de naissance / mariage',taxable:false,onss:false,
    desc:'Exonérée si max 245 EUR',
    base_legale:'AR 28/11/1969',
    conditions:['Max 245 EUR par événement','1 seule prime par événement','Mariage, cohabitation légale, naissance, adoption'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:245,avantageNet:245,desc:'245 EUR unique. 100% exonéré.'}),
    plafond:245,fiscal:'100% exonéré si max 245 EUR'},

  // ── FRAIS / INDEMNITÉS ──
  {id:'indemnite_teletravail',cat:'frais',icon:'🏠',nom:'Indemnité télétravail',taxable:false,onss:false,
    desc:'Forfait bureau max 157.83 EUR/mois (2026)',
    base_legale:'Circulaire ONSS + ruling SPF Finances',
    conditions:['Télétravail régulier (min 1 jour/semaine)','Forfait mensuel fixe','Max 157.83 EUR/mois (indexé 2026)','Couvre: internet, chauffage, électricité, bureau','Cumulable avec matériel (écran, chaise, etc.)'],
    calcul:()=>{const m=157.83;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:m,avantageNet:m,desc:`${fmt(m)} EUR/mois × 12 = ${fmt(m*12)} EUR/an. 100% exonéré ONSS + IPP.`}},
    plafond:157.83,fiscal:'100% exonéré ONSS + IPP si conditions respectées'},
  {id:'frais_propres',cat:'frais',icon:'📎',nom:'Frais propres de l\'employeur',taxable:false,onss:false,
    desc:'Remboursement frais réels ou forfait. Non imposable si justifié',
    base_legale:'Art. 31 CIR 1992 + Circulaires ONSS',
    conditions:['Soit remboursement sur justificatifs (frais réels)','Soit forfait accepté par l\'ONSS/SPF','Doit correspondre à des frais réellement exposés','Ne peut pas constituer un complément de rémunération déguisé'],
    calcul:(brut)=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:brut,avantageNet:brut,desc:'Montant variable. 100% exonéré si justifié. Pas de limite fixe.'}),
    fiscal:'100% exonéré si frais réels ou forfait accepté'},
  {id:'transport_domicile',cat:'frais',icon:'🚌',nom:'Intervention transport domicile-travail',taxable:false,onss:false,
    desc:'Obligatoire CP 200 — remboursement abonnement ou 0.15 EUR/km',
    base_legale:'CCT 19/9 du CNT + CCT sectorielles',
    conditions:['Transport en commun: remboursement obligatoire (80-100% selon CCT)','Véhicule privé: forfait 0.15 EUR/km (CCT 19/9)','Vélo: voir indemnité vélo séparée','Exonération fiscale jusqu\'à 490 EUR/an (forfait)'],
    calcul:(brut,km)=>{const k=km||30;const j=220;const an=k*2*0.15*j;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:an,avantageNet:an,desc:`${k} km × 2 × 0.15 EUR × ${j} jours = ${fmt(an)} EUR/an.`}},
    fiscal:'Exonéré ONSS. Exonéré IPP jusqu\'à 490 EUR/an (forfait).'},
  {id:'indemnite_velo',cat:'frais',icon:'🚴',nom:'Indemnité vélo',taxable:false,onss:false,
    desc:'0.35 EUR/km (2026) exonéré — max 2.500 EUR/an',
    base_legale:'Art. 38 §1er, al. 1, 14° CIR 1992',
    conditions:['Trajet domicile-travail effectif à vélo','0.35 EUR/km (indexé 2026)','Max 2.500 EUR/an exonéré','Cumulable avec abonnement transport en commun','S\'applique aussi aux vélos électriques et speed pedelecs'],
    calcul:(brut,km)=>{const k=km||10;const j=220;const an=Math.min(k*2*0.35*j,2500);return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:an,avantageNet:an,desc:`${k} km × 2 × 0.35 EUR × ${j} jours = ${fmt(an)} EUR/an (max 2.500).`}},
    plafond:2500,fiscal:'100% exonéré ONSS + IPP jusqu\'à 2.500 EUR/an'},
  {id:'per_diem',cat:'frais',icon:'🧳',nom:'Indemnité de séjour / per diem',taxable:false,onss:false,
    desc:'Forfait déplacement: Belgique max 19.99 EUR/jour, étranger selon pays',
    base_legale:'Circulaire ONSS + liste SPF Finances par pays',
    conditions:['Déplacement professionnel effectif','Belgique: max 19.99 EUR/jour (court)','Étranger: forfaits SPF par pays de destination','Ne peut pas couvrir le même repas qu\'un chèque-repas'],
    calcul:(brut,jours)=>{const j=jours||50;const f=19.99;const an=f*j;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:an,avantageNet:an,desc:`${j} jours × ${fmt(f)} EUR = ${fmt(an)} EUR/an. 100% exonéré.`}},
    fiscal:'100% exonéré si forfaits ONSS/SPF respectés'},
  {id:'intervention_creche',cat:'frais',icon:'👧',nom:'Intervention garde d\'enfants',taxable:false,onss:false,
    desc:'Intervention employeur max 15 EUR/jour/enfant',
    conditions:['Max 15 EUR/jour/enfant','Garde d\'enfants de moins de 12 ans','Crèche, accueillante, garderie'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:3300,avantageNet:3300,desc:'15 EUR/jour × 220 jours = 3.300 EUR/an max. Exonéré.'}),
    plafond:15,fiscal:'Exonéré ONSS. Déductible pour l\'employeur.'},

  // ── ATN (Avantages Toute Nature) ──
  {id:'avantage_vehicule',cat:'atn',icon:'🚗',nom:'ATN Véhicule',taxable:true,onss:false,
    desc:'ATN calculé selon CO2 et valeur catalogue',
    base_legale:'Art. 36 §2 CIR 1992 + AR CO2',
    conditions:['ATN = valeur catalogue × 6/7 × % CO2','% CO2 de base: 5.5% + (CO2 - référence) × 0.1%','Minimum: 4% — Maximum: 18%','ATN minimum 2026: ~1.600 EUR/an','Contribution propre déductible de l\'ATN'],
    calcul:(brut,co2,valCat)=>{
      const c=co2||120;const v=valCat||35000;const ref=78;
      let pct=5.5+(c-ref)*0.1;pct=Math.max(4,Math.min(18,pct));
      const atn=Math.max(1600,v*6/7*pct/100);
      return{brut:atn/12,onssW:0,onssE:0,pp:quickPP(atn/12),atnAnnuel:atn,desc:`Valeur catalogue ${fi(v)} EUR × 6/7 × ${pct.toFixed(1)}% = ${fmt(atn)} EUR/an ATN. Imposé via PP mensuel (${fmt(atn/12)} EUR/mois).`}},
    fiscal:'ATN ajouté au revenu imposable. Pas d\'ONSS travailleur. Cotisation CO2 employeur.'},
  {id:'atn_gsm_pc',cat:'atn',icon:'💻',nom:'GSM / PC / Tablette (ATN)',taxable:true,onss:true,
    desc:'ATN forfaitaire: smartphone=3 EUR/mois, PC/tablette=72 EUR/an, internet=5 EUR/mois',
    base_legale:'AR 07/12/2018 — Forfaits ATN IT',
    conditions:['Smartphone privé: 3 EUR/mois (36 EUR/an)','PC/laptop privé: 72 EUR/an (6 EUR/mois)','Tablette privée: 36 EUR/an','Abonnement internet privé: 5 EUR/mois (60 EUR/an)','Abonnement téléphone privé: 4 EUR/mois (48 EUR/an)'],
    calcul:()=>{const atn=36+72+60+48;return{brut:atn/12,onssW:atn/12*TX_ONSS_W,onssE:atn/12*TX_ONSS_E,pp:0,atnAnnuel:atn,desc:`Total ATN IT: ${fi(atn)} EUR/an = ${fmt(atn/12)} EUR/mois. Smartphone(36)+PC(72)+Internet(60)+Tel(48).`}},
    fiscal:'Forfaits ajoutés au revenu imposable + ONSS'},
  {id:'atn_logement',cat:'atn',icon:'🏡',nom:'ATN Logement',taxable:true,onss:true,
    desc:'Mise à disposition logement — ATN = RC indexé × 100/60 × 2',
    base_legale:'Art. 18 §3 AR/CIR 1992',
    conditions:['Non meublé: RC indexé × 100/60 × 2','Meublé: résultat ci-dessus × 5/3','RC = revenu cadastral du bien','Coefficient indexation 2026: ~2.1463'],
    calcul:(brut,rc)=>{const r=rc||1500;const coef=2.1463;const atn=r*coef*100/60*2;return{brut:atn/12,onssW:atn/12*TX_ONSS_W,onssE:atn/12*TX_ONSS_E,pp:quickPP(atn/12),atnAnnuel:atn,desc:`RC ${fi(r)} × ${coef} × 100/60 × 2 = ${fmt(atn)} EUR/an ATN non meublé.`}},
    fiscal:'ATN ajouté au revenu imposable + ONSS'},

  // ── PRIMES SECTORIELLES ──
  {id:'prime_equipe_nuit',cat:'sectoriel',icon:'🌙',nom:'Prime d\'équipe / nuit / dimanche',taxable:true,onss:true,
    desc:'Suppléments horaires variables selon CP',
    base_legale:'CCT sectorielles + Loi 16/03/1971',
    conditions:['Nuit (22h-6h): +25% à +35% selon CP','Samedi: +26% à +50% selon CP','Dimanche/férié: +56% à +100% selon CP','Équipe 2x8: +10%','Équipe 3x8: +15%'],
    calcul:(brut,taux)=>{const t=(taux||25)/100;const prime=brut*t;return{brut:prime,onssW:prime*TX_ONSS_W,onssE:prime*TX_ONSS_E,pp:quickPP(prime),desc:`Salaire horaire × ${(taux||25)}%. Dispense PP employeur possible (22.8% sur travail nuit/équipe).`}},
    fiscal:'Taxé comme rémunération. Dispense versement PP 22.8% pour employeur (travail nuit/équipe structurel).'},
  {id:'prime_fidelite',cat:'sectoriel',icon:'🎖',nom:'Timbres fidélité (CP 124)',taxable:true,onss:true,
    desc:'~9% du salaire annuel brut via Constructiv',
    base_legale:'AR Timbres fidélité — Fonds Constructiv',
    conditions:['Min 200 jours prestés dans la construction','En service au 30 juin','Pas de licenciement pour faute grave'],
    calcul:(brut)=>{const an=brut*12*0.09;return{brut:an/12,onssW:an/12*TX_ONSS_W,onssE:an/12*TX_ONSS_E,pp:quickPP(an/12),desc:`9% × ${fmt(brut)} × 12 = ${fmt(an)} EUR/an. Versé juillet par Constructiv.`}},
    fiscal:'Imposable — PP retenu à la source par Constructiv'},
  {id:'prime_danger',cat:'sectoriel',icon:'⚠',nom:'Prime de danger / pénibilité',taxable:true,onss:true,
    desc:'Supplément travail dangereux ou insalubre, selon CP',
    conditions:['Bruit >80dB: +5%','Chaleur >30°C: +10%','Poussières toxiques: +10-15%','Hauteur >15m: +10% (CP 124)','Froid <5°C: +5%, <-18°C: +10% (CP 118)'],
    calcul:(brut,taux)=>{const t=(taux||10)/100;const p=brut*t;return{brut:p,onssW:p*TX_ONSS_W,onssE:p*TX_ONSS_E,pp:quickPP(p),desc:`${(taux||10)}% du salaire horaire. Cumulable entre risques.`}},
    fiscal:'Régime standard ONSS + PP'},
  {id:'prime_bilinguisme',cat:'sectoriel',icon:'🗣',nom:'Prime de bilinguisme',taxable:true,onss:true,
    desc:'Supplément pour connaissance 2ème langue nationale',
    conditions:['Courant à Bruxelles','Test de langue ou certificat requis','Montant: forfait ou % selon convention'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Variable selon convention. Régime standard.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'prime_garde',cat:'sectoriel',icon:'📞',nom:'Prime de garde / astreinte',taxable:true,onss:true,
    desc:'Indemnité disponibilité hors heures',
    conditions:['Forfait par période de garde','Si rappel: heures à 100% + déplacement','Temps de réponse: selon convention'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Forfait garde + rappel rémunéré si activé.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'prime_chauffage',cat:'sectoriel',icon:'🔥',nom:'Prime de chauffage / énergie',taxable:false,onss:false,
    desc:'Intervention frais énergie via fonds social sectoriel',
    conditions:['Max ~250 EUR/an','Via fonds social sectoriel','Exonérée si via fonds'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:250,avantageNet:250,desc:'~250 EUR/an. Exonéré si via fonds sectoriel.'}),
    plafond:250,fiscal:'Exonéré si via fonds social'},

  // ── MOBILITÉ ──
  {id:'budget_mobilite',cat:'mobilite',icon:'🚲',nom:'Budget mobilité',taxable:false,onss:false,
    desc:'3 piliers: voiture éco / transport durable / cash',
    base_legale:'Loi 17/03/2019 relative au budget mobilité',
    conditions:['Pilier 1: voiture de société écologique (CO2 ≤ 50g/km ou électrique)','Pilier 2: moyens de transport durables (vélo, trottinette, transport commun, logement)','Pilier 3: solde en cash (cotisation spéciale 38.07%)','Le travailleur doit avoir/avoir eu droit à une voiture de société'],
    calcul:(brut)=>{const p1=0;const p3=brut;const cotP3=p3*0.3807;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:brut,avantageNet:brut-cotP3,desc:`Pilier 2: 100% exonéré. Pilier 3 cash: cotisation spéciale 38.07% → net ${fmt(brut-cotP3)}.`}},
    fiscal:'P1: régime ATN voiture. P2: exonéré. P3: cotisation 38.07%.'},

  // ── ASSURANCES ──
  {id:'assurance_groupe',cat:'assurance',icon:'🛡',nom:'Assurance groupe (pension complémentaire)',taxable:false,onss:true,
    desc:'Pension complémentaire — cotisation employeur déductible',
    base_legale:'Loi 28/04/2003 (LPC) + CCT sectorielles',
    conditions:['Cotisation employeur: déductible + cotisation ONSS spéciale 8.86%','Cotisation travailleur (si applicable): déductible IPP 30%','Règle des 80%: pension légale + extra ≤ 80% dernier salaire','Capital taxé à 10.09% (anticipative) ou 16.66% à 60 ans'],
    calcul:(brut,pct)=>{const p=(pct||3)/100;const cotAn=brut*12*p;const onssSpec=cotAn*0.0886;return{brut:0,onssW:0,onssE:onssSpec,pp:0,coutEmployeur:cotAn+onssSpec,desc:`${(pct||3)}% × ${fmt(brut*12)} = ${fmt(cotAn)} EUR/an. ONSS spéciale 8.86%: ${fmt(onssSpec)} EUR.`}},
    fiscal:'Cotisation employeur + 8.86% ONSS spéciale. Capital taxé 10.09-16.66%.'},
  {id:'assurance_hospi',cat:'assurance',icon:'🏥',nom:'Assurance hospitalisation',taxable:false,onss:false,
    desc:'Avantage collectif non imposable si offert à tous',
    base_legale:'Art. 38 §1 CIR 1992 (avantage social collectif)',
    conditions:['Offert à tous les travailleurs (collectif)','Pas de discrimination','Déductible pour l\'employeur','Non imposable pour le travailleur'],
    calcul:(brut,prime)=>{const p=prime||1200;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:p,avantageNet:p,desc:`Prime annuelle ~${fi(p)} EUR. 100% exonéré si collectif. Coût = avantage net.`}},
    fiscal:'100% exonéré ONSS + IPP si collectif'},

  // ── FLEXI / SPÉCIAL ──
  {id:'flexi_salaire',cat:'special',icon:'🍕',nom:'Flexi-salaire (Horeca/Commerce)',taxable:false,onss:false,
    desc:'Cotisation spéciale 28% employeur. Exonéré IPP',
    base_legale:'Loi 16/11/2015 relative aux flexi-jobs',
    conditions:['Occupation principale 4/5 chez un autre employeur (T-3)','Secteurs: CP 118, 119, 201, 202, 302, 311, 312, 314, commerce','Pas de contrat en cours chez le même employeur','Cotisation spéciale 28% employeur (pas d\'ONSS classique)','Exonéré impôt + ONSS travailleur'],
    calcul:(brut,heures)=>{const h=heures||500;const sal=brut||14.97;const tot=sal*h;const cot=tot*0.28;return{brut:tot,onssW:0,onssE:cot,pp:0,avantageNet:tot,desc:`${h}h × ${fmt(sal)} EUR = ${fmt(tot)} EUR brut = net. Coût employeur: ${fmt(tot+cot)} EUR (28% cotisation).`}},
    plafond:14.97,fiscal:'100% exonéré IPP + ONSS travailleur. Cotisation spéciale 28% employeur.'},
  {id:'plan_cafeteria',cat:'special',icon:'☕',nom:'Plan cafétéria',taxable:false,onss:false,
    desc:'Enveloppe flexible — le travailleur choisit ses avantages',
    base_legale:'Pas de base légale spécifique — ruling fiscal au cas par cas',
    conditions:['Budget = partie du salaire brut convertie en avantages','Chaque avantage garde son propre régime fiscal/ONSS','Neutralité de coût pour l\'employeur','Ruling SPF Finances recommandé','Options: voiture, vélo, PC, smartphone, jours congé, pension, assurance, etc.'],
    calcul:(brut)=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:brut,avantageNet:brut*0.7,desc:`Budget ${fmt(brut)} EUR. Gain net estimé 10-40% vs salaire brut classique (selon choix avantages).`}),
    fiscal:'Chaque composante suit son propre régime. Optimisation moyenne: +10-40% de net.'},

  // ── FIN DE CONTRAT ──
  {id:'prime_depart',cat:'fin',icon:'👋',nom:'Indemnité de départ (rupture)',taxable:true,onss:true,
    desc:'Indemnité de rupture selon ancienneté',
    base_legale:'Loi 26/12/2013 (statut unique) + Art. 39 loi contrat de travail',
    conditions:['Calcul: ancienneté × rémunération en cours','Préavis non presté = indemnité compensatoire','Inclut tous avantages (voiture, GSM, assurances)','Soumis ONSS + PP (taxation étalée possible)'],
    calcul:(brut,semaines)=>{const s=semaines||13;const ind=brut/4*s;return{brut:ind,onssW:ind*TX_ONSS_W,onssE:ind*TX_ONSS_E,pp:ind*0.2667,desc:`${s} semaines × ${fmt(brut)}/4 = ${fmt(ind)} EUR indemnité.`}},
    fiscal:'ONSS + PP. Option taxation distincte (taux moyen dernière année normale).'},
  {id:'non_concurrence',cat:'fin',icon:'🚫',nom:'Clause de non-concurrence',taxable:true,onss:true,
    desc:'Indemnité min 50% du salaire brut × durée (max 12 mois)',
    base_legale:'Art. 65 et suivants loi contrat de travail 03/07/1978',
    conditions:['Salaire annuel brut > 41.969 EUR (2026)','Durée max: 12 mois','Indemnité: min 50% du salaire brut × durée en mois','Clause nulle si conditions non remplies','L\'employeur peut renoncer dans les 15 jours du départ'],
    calcul:(brut,mois)=>{const m=mois||6;const ind=brut*0.5*m;return{brut:ind,onssW:ind*TX_ONSS_W,onssE:ind*TX_ONSS_E,pp:quickPP(ind),desc:`50% × ${fmt(brut)} × ${m} mois = ${fmt(ind)} EUR.`}},
    fiscal:'Régime standard ONSS + PP'},
  {id:'outplacement',cat:'fin',icon:'🎯',nom:'Outplacement',taxable:false,onss:false,
    desc:'Obligatoire si préavis ≥ 30 semaines. Min 1.800 EUR / 60h',
    base_legale:'CCT 82 du CNT + Loi 26/12/2013',
    conditions:['Obligatoire si préavis ≥ 30 semaines','Valeur min: 1.800 EUR ou 60 heures','Financé par employeur','4 semaines de préavis converties en outplacement'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:1800,avantageNet:0,desc:'Min 1.800 EUR. Non imposable pour le travailleur. Coût employeur déductible.'}),
    fiscal:'Non imposable pour le travailleur'},
  {id:'pecule_vacances',cat:'fin',icon:'🏖',nom:'Pécule de vacances anticipé',taxable:true,onss:true,
    desc:'Simple (92%) + double (92%) versé en mai/juin',
    base_legale:'Loi 28/06/1971 sur les vacances annuelles + AR 30/03/1967',
    conditions:['Pécule simple: rémunération pendant les jours de congé','Pécule double: 92% du salaire mensuel brut','Anticipé si départ en cours d\'année (au prorata)','Ouvriers: via ONVA. Employés: par l\'employeur.'],
    calcul:(brut,mois)=>{const m=mois||12;const simple=brut;const double_=brut*0.92;const prorata=m/12;return{brut:(simple+double_)*prorata,onssW:double_*prorata*TX_ONSS_W,onssE:0,pp:double_*prorata*0.1807,desc:`Simple: ${fmt(simple*prorata)} EUR + Double: ${fmt(double_*prorata)} EUR. PP double: 13.07% ONSS + 10.09% cotisation spéciale.`}},
    fiscal:'Double pécule: ONSS 13.07% + cotisation spéciale 10.09%. Pas de PP standard.'},
  {id:'supplement_heure_sup',cat:'sectoriel',icon:'⏰',nom:'Supplément heures supplémentaires',taxable:true,onss:true,
    desc:'Majoration 50% (semaine) ou 100% (dimanche/férié)',
    base_legale:'Loi 16/03/1971 sur le travail',
    conditions:['Semaine: +50% du salaire horaire','Dimanche/férié: +100% du salaire horaire','Max 91h/trimestre sans récupération (volontariat)','Au-delà: récupération obligatoire','Dispense PP sur les 180 premières heures supp/an'],
    calcul:(brut,taux)=>{const t=(taux||50)/100;const p=brut*t;return{brut:p,onssW:p*TX_ONSS_W,onssE:p*TX_ONSS_E,pp:0,desc:`+${(taux||50)}%. Dispense PP sur 180 premières h/an → sursalaire net ~= brut.`}},
    fiscal:'ONSS standard. Dispense PP sur sursalaire 180 premières heures/an.'},
  {id:'petit_chomage',cat:'special',icon:'🗓',nom:'Petit chômage (absences autorisées)',taxable:true,onss:true,
    desc:'Congé rémunéré: mariage=2j, décès=1-3j, communion=1j',
    base_legale:'AR 28/08/1963',
    conditions:['Mariage travailleur: 2 jours','Mariage enfant: 1 jour','Décès conjoint/enfant: 3 jours','Décès parent 1er degré: 3 jours','Décès parent 2ème degré: 2 jours','Communion solennelle enfant: 1 jour','Déménagement: 1 jour'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Salaire normal maintenu pendant les jours de petit chômage.'}),
    fiscal:'Rémunération normale — ONSS + PP'},
  {id:'prime_fin_cdd',cat:'fin',icon:'📅',nom:'Prime fin de CDD',taxable:true,onss:true,
    desc:'Indemnité si non-renouvellement CDD successifs',
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Selon jurisprudence. Variable.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'pret_taux_reduit',cat:'atn',icon:'🏦',nom:'Prêt à taux réduit (ATN)',taxable:true,onss:true,
    desc:'ATN = différence entre taux de référence et taux accordé',
    base_legale:'AR 18/07/2001 — Taux de référence ATN prêts',
    conditions:['ATN = (taux référence - taux accordé) × capital','Taux de référence fixé annuellement par AR','S\'applique aux prêts hypothécaires et prêts personnels'],
    calcul:(brut,capital,tauxAccorde)=>{const c=capital||200000;const tRef=3.0;const tAcc=tauxAccorde||1.5;const atn=c*(tRef-tAcc)/100;return{brut:atn/12,onssW:atn/12*TX_ONSS_W,onssE:atn/12*TX_ONSS_E,pp:quickPP(atn/12),atnAnnuel:atn,desc:`Capital ${fi(c)} EUR × (${tRef}% - ${tAcc}%) = ${fmt(atn)} EUR/an ATN.`}},
    fiscal:'ATN ajouté au revenu imposable + ONSS'},

  // ── PRIMES COMPLÉMENTAIRES (43-56) ──
  {id:'prime_syndicale',cat:'sectoriel',icon:'✊',nom:'Prime syndicale',taxable:false,onss:false,
    desc:'Prime annuelle via syndicat — 100-145 EUR/an selon CP',
    base_legale:'CCT sectorielles — via fonds de sécurité d\'existence',
    conditions:['Être affilié à un syndicat reconnu (FGTB, CSC, CGSLB)','Avoir presté min 1 jour dans la période de référence','Introduire formulaire via le syndicat','Non cumulable entre syndicats'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:0,avantageNet:135,desc:'~135-145 EUR/an. Financé par le fonds sectoriel (pas l\'employeur). Non imposable.'}),
    fiscal:'Non imposable'},
  {id:'prime_teletravail_materiel',cat:'frais',icon:'🖥',nom:'Matériel télétravail (écran, chaise, bureau)',taxable:false,onss:false,
    desc:'Remboursement matériel bureau à domicile — exonéré si justifié',
    base_legale:'Ruling SPF Finances + Circulaire ONSS 2021/1',
    conditions:['Achat ou mise à disposition d\'un écran, chaise ergonomique, bureau','Remboursement sur facture ou allocation forfaitaire','Max 50 EUR/mois pour second écran, max 100 EUR/mois pour bureau complet','Cumulable avec indemnité télétravail forfaitaire'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:600,avantageNet:600,desc:'~50 EUR/mois × 12 = 600 EUR/an. Exonéré sur justificatifs.'}),
    fiscal:'Exonéré ONSS + IPP si justifié'},
  {id:'bonus_objectif',cat:'remvar',icon:'🎯',nom:'Bonus d\'objectif individuel',taxable:true,onss:true,
    desc:'Prime liée à l\'atteinte d\'objectifs individuels. Régime standard.',
    base_legale:'Droit commun — pas de régime fiscal favorable (contrairement à CCT 90)',
    conditions:['Objectifs individuels (pas éligible CCT 90)','Définis dans avenant au contrat','Montant variable, pas de plafond','Entièrement soumis ONSS + PP'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard: ONSS 13.07% + PP. Très coûteux. Privilégier CCT 90 si objectifs collectifs.'}),
    fiscal:'Régime standard. Coût total: ~180% du net travailleur.'},
  {id:'overtime_vol',cat:'sectoriel',icon:'⏱',nom:'Heures supplémentaires volontaires (120h)',taxable:true,onss:true,
    desc:'120h/an sans récupération — 180h avec dispense PP sur sursalaire',
    base_legale:'Loi 16/03/1971 Art. 25bis + Loi relance 2018',
    conditions:['Max 120h/an sans demande de récupération (volontariat)','Extension à 360h dans certains secteurs avec CCT','Sursalaire +50% (semaine), +100% (dimanche/férié)','Dispense PP sur sursalaire des 180 premières heures/an'],
    calcul:(brut,heures)=>{const h=heures||120;const sursal=brut*0.5*h/173;return{brut:sursal,onssW:sursal*TX_ONSS_W,onssE:sursal*TX_ONSS_E,pp:0,desc:`${h}h × +50% = ${fmt(sursal)} EUR sursalaire. Dispense PP → quasi net.`}},
    fiscal:'Dispense PP sur sursalaire des 180 premières h/an → net fiscal avantageux'},
  {id:'prime_innovation',cat:'remvar',icon:'💡',nom:'Prime d\'innovation',taxable:true,onss:true,
    desc:'Récompense pour invention/innovation — régime standard sauf si brevet',
    base_legale:'Art. 6 Loi 28/03/1984 brevets + droit commun',
    conditions:['Si brevet: régime spécial possible','Si inventeur salarié: droit à compensation raisonnable','Sans brevet: régime standard ONSS + PP'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard. Si brevet: consulter avocat pour régime IP favorable.'}),
    fiscal:'Standard sauf brevet (régime IP possible)'},
  {id:'indemnite_km_voiture',cat:'frais',icon:'🚗',nom:'Indemnité kilométrique voiture',taxable:false,onss:false,
    desc:'0.4415 EUR/km (2026) — max 24.000 km/an exonéré',
    base_legale:'AR fixant les indemnités km — indexé annuellement',
    conditions:['Utilisation véhicule privé pour déplacements professionnels','0.4415 EUR/km (montant 2026, indexé juillet)','Max 24.000 km/an exonéré','Ne couvre PAS le domicile-travail (sauf si itinérant)','Justification: agenda, carnet de route'],
    calcul:(brut,km)=>{const k=km||15000;const ind=Math.min(k,24000)*FORF_KM;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:ind,avantageNet:ind,desc:`${fi(k)} km × ${FORF_KM} EUR = ${fmt(ind)} EUR/an. 100% exonéré.`}},
    plafond:24000,fiscal:'100% exonéré ONSS + IPP dans la limite de 24.000 km/an'},
  {id:'assurance_revenu',cat:'assurance',icon:'🛡',nom:'Assurance revenu garanti',taxable:false,onss:false,
    desc:'Compense la perte de revenus en cas de maladie/invalidité longue',
    base_legale:'Art. 38 §1 CIR 1992 + Loi 28/04/2003',
    conditions:['Couverture ITT (Incapacité Temporaire de Travail)','Complément au salaire garanti + mutuelle','Avantage social si collectif et même couverture pour tous','Déductible pour l\'employeur'],
    calcul:(brut,prime)=>{const p=prime||800;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:p,avantageNet:p,desc:`Prime ~${fi(p)} EUR/an. Exonéré si collectif.`}},
    fiscal:'Exonéré ONSS + IPP si avantage social collectif'},
  {id:'prime_parrainage',cat:'remvar',icon:'🤝',nom:'Prime de parrainage / cooptation',taxable:true,onss:true,
    desc:'Récompense pour recommandation d\'un candidat embauché',
    conditions:['Prime versée après confirmation du candidat (généralement après 6 mois)','Montant variable: 500-3.000 EUR selon le profil','Entièrement soumise ONSS + PP','Prévoir dans règlement interne'],
    calcul:(brut)=>({brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut),desc:'Régime standard ONSS + PP. Coûteux mais souvent moins que les frais de recrutement.'}),
    fiscal:'Régime standard ONSS + PP'},
  {id:'intervention_internet',cat:'frais',icon:'📶',nom:'Intervention internet domicile',taxable:false,onss:false,
    desc:'Forfait max 20 EUR/mois — exonéré ONSS/IPP',
    base_legale:'Ruling SPF Finances + Circulaire ONSS',
    conditions:['Le travailleur utilise son internet privé pour le travail','Max 20 EUR/mois forfait','Cumulable avec indemnité télétravail','Nécessite que le TT soit effectif'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:240,avantageNet:240,desc:'20 EUR/mois × 12 = 240 EUR/an. 100% exonéré.'}),
    plafond:20,fiscal:'100% exonéré ONSS + IPP'},
  {id:'intervention_gsm_prive',cat:'frais',icon:'📱',nom:'Intervention téléphone privé',taxable:false,onss:false,
    desc:'Forfait max 20 EUR/mois si usage professionnel du GSM privé',
    base_legale:'Ruling SPF Finances',
    conditions:['Utilisation GSM privé pour travail','Max 20 EUR/mois','Non cumulable avec GSM de société','Justification: usage professionnel régulier'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:240,avantageNet:240,desc:'20 EUR/mois × 12 = 240 EUR/an. Exonéré.'}),
    plafond:20,fiscal:'Exonéré ONSS + IPP si forfait raisonnable'},
  {id:'conge_formation',cat:'special',icon:'📚',nom:'Congé-éducation payé',taxable:true,onss:true,
    desc:'Droit à congé payé pour formation reconnue — remboursement employeur',
    base_legale:'Loi 22/01/1985 + AR exécution annuel',
    conditions:['Max 80-120h/an selon type de formation','Salaire maintenu pendant les heures de formation','L\'employeur est remboursé par la Région (Flandre, Wallonie, Bruxelles)','Formation reconnue: liste mise à jour annuellement'],
    calcul:(brut,heures)=>{const h=heures||80;const cout=brut/173*h;return{brut:cout,onssW:0,onssE:0,pp:0,coutEmployeur:0,avantageNet:cout,desc:`${h}h × ${fmt(brut/173)} EUR/h = ${fmt(cout)} EUR. Remboursé par la Région.`}},
    fiscal:'Salaire maintenu — remboursement régional à l\'employeur'},
  {id:'titres_services_avantage',cat:'exonere',icon:'🧹',nom:'Titres-services (employeur finance)',taxable:false,onss:false,
    desc:'Intervention employeur dans l\'achat de titres-services pour le travailleur',
    conditions:['Avantage social si collectif','Non imposable si offert à tous','Valeur: 9 EUR/titre × nombre de titres offerts'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:540,avantageNet:540,desc:'~60 titres/an × 9 EUR = 540 EUR. Exonéré si avantage social.'}),
    fiscal:'Exonéré si avantage social collectif'},
  {id:'prime_deplacement_chantier',cat:'frais',icon:'🚐',nom:'Indemnité déplacement inter-chantiers',taxable:false,onss:false,
    desc:'Remboursement déplacements entre sites de travail (pas domicile-travail)',
    base_legale:'Circulaire ONSS frais de transport',
    conditions:['Déplacement entre 2 lieux de travail','Pas de couverture domicile → 1er lieu','Soit km réels, soit forfait','Transport en commun: 100% remboursé'],
    calcul:(brut,km)=>{const k=km||5000;const ind=k*0.15;return{brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:ind,avantageNet:ind,desc:`${fi(k)} km × 0.15 EUR = ${fmt(ind)} EUR/an entre chantiers.`}},
    fiscal:'Exonéré ONSS + IPP comme frais de déplacement professionnel'},
  {id:'prime_nettoyage_vetements',cat:'frais',icon:'👔',nom:'Indemnité entretien vêtements de travail',taxable:false,onss:false,
    desc:'Forfait entretien: ~1.91 EUR/jour presté — exonéré',
    base_legale:'AR Bien-être au travail + Circulaire ONSS',
    conditions:['Si l\'employeur ne fournit pas l\'entretien','Forfait ~1.91 EUR/jour presté','Le travailleur doit effectivement porter des vêtements de travail','Obligation de l\'employeur (Code bien-être)'],
    calcul:()=>({brut:0,onssW:0,onssE:0,pp:0,coutEmployeur:420,avantageNet:420,desc:'1.91 EUR × 220 jours = ~420 EUR/an. Exonéré si forfait raisonnable.'}),
    fiscal:'Exonéré ONSS + IPP comme frais propres employeur'},
];

const CATS={remvar:'💰 Rémunération variable',exonere:'✅ Avantages exonérés',frais:'📎 Frais & Indemnités',atn:'🚗 ATN',sectoriel:'🏭 Primes sectorielles',mobilite:'🚲 Mobilité',assurance:'🛡 Assurances',special:'⚡ Régimes spéciaux',fin:'👋 Fin de contrat'};
const CAT_COLORS={remvar:'#c6a34e',exonere:'#22c55e',frais:'#3b82f6',atn:'#f87171',sectoriel:'#a855f7',mobilite:'#06b6d4',assurance:'#eab308',special:'#fb923c',fin:'#888'};

// ════════════════════════════════════════════════════════════
// COMPOSANT 1: PRIME CALCULATOR V2 — Simulateur comparatif
// ════════════════════════════════════════════════════════════
export function PrimeCalculatorV2({s,d,props_tab}){
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const emps=(s?.clients||[]).flatMap(c=>c.emps||[]);
  const [selPrime,setSelPrime]=useState('prime_fin_annee');
  const [montant,setMontant]=useState(2000);
  const TAB_MAP_PV = { gestionprimes:'catalogue', avantages:'simu' };
  const [tab,setTab]=useState(TAB_MAP_PV[props_tab]||'simu');
  const [expanded,setExpanded]=useState({});
  const [searchP,setSearchP]=useState('');
  const [selCat,setSelCat]=useState('all');

  const prime=PRIMES_DB.find(p=>p.id===selPrime)||PRIMES_DB[0];
  const brut=+montant||0;
  const result=prime.calcul?prime.calcul(brut):{brut,onssW:brut*TX_ONSS_W,onssE:brut*TX_ONSS_E,pp:quickPP(brut)};
  const net=result.avantageNet||(result.brut-result.onssW-(result.pp||0));
  const coutTotal=result.coutEmployeur||(result.brut+result.onssE);
  const ratio=coutTotal>0?(net/coutTotal*100):0;

  // Comparaison: même montant brut via différents canaux
  const compare=useMemo(()=>{
    const channels=['prime_fin_annee','bonus_cct90','warrants','cheques_repas','eco_cheques','indemnite_teletravail','plan_cafeteria','flexi_salaire','assurance_groupe'];
    return channels.map(id=>{
      const p=PRIMES_DB.find(x=>x.id===id);if(!p||!p.calcul)return null;
      const r=p.calcul(brut);
      const n=r.avantageNet||(r.brut-r.onssW-(r.pp||0));
      const c=r.coutEmployeur||(r.brut+r.onssE);
      return{id,nom:p.nom,icon:p.icon,net:n,cout:c,ratio:c>0?(n/c*100):0,taxable:p.taxable,onss:p.onss};
    }).filter(Boolean).sort((a,b)=>b.ratio-a.ratio);
  },[brut]);

  const filteredPrimes=PRIMES_DB.filter(p=>{
    if(selCat!=='all'&&p.cat!==selCat)return false;
    if(searchP&&!p.nom.toLowerCase().includes(searchP.toLowerCase())&&!p.desc.toLowerCase().includes(searchP.toLowerCase()))return false;
    return true;
  });

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🎁 Primes & Avantages — Simulateur</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>56 primes belges — Calcul détaillé, comparaison, optimisation fiscale</p>

    <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>{[{v:'simu',l:'🧮 Simulateur'},{v:'compare',l:'⚖️ Comparatif'},{v:'catalogue',l:'📚 Catalogue ('+PRIMES_DB.length+')'},{v:'cct90',l:'🎯 CCT 90'},{v:'legal',l:'📜 Cadre légal'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {/* SIMULATEUR */}
    {tab==='simu'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
        <C title="Paramètres">
          <I label="Type de prime" value={selPrime} onChange={setSelPrime} options={PRIMES_DB.map(p=>({v:p.id,l:p.icon+' '+p.nom}))}/>
          <div style={{marginTop:10}}><I label="Montant brut (EUR)" type="number" value={montant} onChange={setMontant}/></div>
          <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8}}>
            <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Régime fiscal</div>
            <div style={{display:'flex',gap:6}}>
              <Badge text={prime.taxable?'IPP: OUI':'IPP: NON'} color={prime.taxable?'#f87171':'#22c55e'}/>
              <Badge text={prime.onss?'ONSS: OUI':'ONSS: NON'} color={prime.onss?'#f87171':'#22c55e'}/>
            </div>
          </div>
        </C>
        <div>
          <C title="Décomposition">
            {[
              {l:'Montant brut',v:fmt(result.brut)+' €',c:'#c6a34e'},
              {l:'ONSS travailleur (13.07%)',v:result.onssW>0?'- '+fmt(result.onssW)+' €':'0.00 €',c:result.onssW>0?'#f87171':'#22c55e'},
              {l:'Précompte professionnel (est.)',v:result.pp>0?'- '+fmt(result.pp)+' €':'0.00 €',c:result.pp>0?'#fb923c':'#22c55e'},
              {l:'NET travailleur',v:fmt(net)+' €',c:'#4ade80',b:true},
              {l:'ONSS employeur (25.07%)',v:result.onssE>0?fmt(result.onssE)+' €':'0.00 €',c:result.onssE>0?'#f87171':'#22c55e'},
              {l:'COÛT TOTAL EMPLOYEUR',v:fmt(coutTotal)+' €',c:'#c6a34e',b:true},
            ].map((r,i)=><Row key={i} l={r.l} v={r.v} c={r.c} b={r.b}/>)}
            <div style={{marginTop:12,padding:12,background:ratio>70?'rgba(34,197,94,.08)':ratio>50?'rgba(198,163,78,.08)':'rgba(248,113,113,.08)',borderRadius:8}}>
              <div style={{fontSize:12,color:ratio>70?'#22c55e':ratio>50?'#c6a34e':'#f87171',fontWeight:600}}>
                Ratio net/coût: {ratio.toFixed(1)}% — Pour 1 € de coût, le travailleur reçoit {(net/Math.max(coutTotal,1)).toFixed(2)} € net
              </div>
            </div>
          </C>
          {result.desc&&<C title="Détail du calcul" color="#3b82f6"><div style={{fontSize:11,color:'#e8e6e0',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{result.desc}</div></C>}
          {prime.conditions&&<C title="Conditions d'octroi" color="#22c55e">
            {prime.conditions.map((c,i)=><div key={i} style={{fontSize:10.5,color:'#ccc',padding:'3px 0',paddingLeft:10,borderLeft:'2px solid rgba(34,197,94,.2)'}}>• {c}</div>)}
          </C>}
          {prime.base_legale&&<C title="Base légale" color="#a855f7"><div style={{fontSize:11,color:'#e8e6e0'}}>{prime.base_legale}</div></C>}
          {prime.procedure&&<C title="Procédure" color="#06b6d4"><div style={{fontSize:11,color:'#e8e6e0',whiteSpace:'pre-wrap'}}>{prime.procedure}</div></C>}
        </div>
      </div>
      {emps.length>0&&<C title={`Impact sur ${emps.length} travailleur(s)`}>
        <Row l="Budget total brut" v={fmt(result.brut*emps.length)+' €'}/>
        <Row l="Coût total employeur" v={fmt(coutTotal*emps.length)+' €'} c="#f87171"/>
        <Row l="Net total distribué" v={fmt(net*emps.length)+' €'} c="#4ade80" b/>
      </C>}
    </div>}

    {/* COMPARATIF */}
    {tab==='compare'&&<div>
      <C title={`Comparaison: ${fmt(brut)} EUR via différents canaux`} sub="Classé par ratio net/coût (meilleur en haut)">
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 80px',padding:'8px 12px',fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:.5,borderBottom:'1px solid rgba(255,255,255,.05)'}}>
          <span>Canal</span><span style={{textAlign:'right'}}>Net travailleur</span><span style={{textAlign:'right'}}>Coût employeur</span><span style={{textAlign:'right'}}>Ratio</span><span></span>
        </div>
        {compare.map((c,i)=><div key={c.id} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 80px',padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center',background:i===0?'rgba(34,197,94,.04)':'transparent'}}>
          <span style={{fontSize:11.5,color:'#e8e6e0'}}>{c.icon} {c.nom}</span>
          <span style={{fontSize:12,fontWeight:600,color:'#4ade80',textAlign:'right'}}>{fmt(c.net)} €</span>
          <span style={{fontSize:12,fontWeight:600,color:'#f87171',textAlign:'right'}}>{fmt(c.cout)} €</span>
          <span style={{fontSize:12,fontWeight:700,color:c.ratio>80?'#22c55e':c.ratio>60?'#c6a34e':'#f87171',textAlign:'right'}}>{c.ratio.toFixed(0)}%</span>
          <Bar pct={c.ratio} color={c.ratio>80?'#22c55e':c.ratio>60?'#c6a34e':'#f87171'}/>
        </div>)}
      </C>
      <C title="💡 Recommandation">
        <div style={{fontSize:11,color:'#e8e6e0',lineHeight:1.6}}>
          {compare[0]&&<>Le canal le plus efficient est <b style={{color:'#22c55e'}}>{compare[0].icon} {compare[0].nom}</b> avec un ratio de {compare[0].ratio.toFixed(0)}%.
          Pour {fmt(brut)} EUR de budget, le travailleur reçoit <b style={{color:'#4ade80'}}>{fmt(compare[0].net)} EUR net</b> contre {fmt(compare[compare.length-1]?.net||0)} EUR via le canal le moins efficient.</>}
        </div>
      </C>
    </div>}

    {/* CATALOGUE */}
    {tab==='catalogue'&&<div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <input value={searchP} onChange={e=>setSearchP(e.target.value)} placeholder="Rechercher une prime..." style={{flex:1,minWidth:200,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'#090c16',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}/>
        <select value={selCat} onChange={e=>setSelCat(e.target.value)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'#090c16',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}>
          <option value="all">Toutes catégories ({PRIMES_DB.length})</option>
          {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v} ({PRIMES_DB.filter(p=>p.cat===k).length})</option>)}
        </select>
      </div>
      {Object.entries(CATS).map(([catKey,catName])=>{
        const catPrimes=filteredPrimes.filter(p=>p.cat===catKey);
        if(catPrimes.length===0)return null;
        return <C key={catKey} title={catName+' ('+catPrimes.length+')'} color={CAT_COLORS[catKey]}>
          {catPrimes.map(p=>{const isExp=expanded[p.id];return <div key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div onClick={()=>setExpanded(prev=>({...prev,[p.id]:!prev[p.id]}))} style={{padding:'10px 0',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16}}>{p.icon}</span>
                <div>
                  <div style={{fontSize:12,color:'#e8e6e0',fontWeight:500}}>{p.nom}</div>
                  <div style={{fontSize:10,color:'#888',marginTop:1}}>{p.desc}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                <Badge text={p.taxable?'IPP':'Exo IPP'} color={p.taxable?'#f87171':'#22c55e'}/>
                <Badge text={p.onss?'ONSS':'Exo ONSS'} color={p.onss?'#f87171':'#22c55e'}/>
                {p.plafond&&<Badge text={'Max '+p.plafond} color="#3b82f6"/>}
                <span style={{fontSize:9,color:isExp?'#c6a34e':'#555',marginLeft:4,transform:isExp?'rotate(180deg)':'rotate(0deg)',display:'inline-block',transition:'transform .2s'}}>▼</span>
              </div>
            </div>
            {isExp&&<div style={{padding:'0 0 12px 28px'}}>
              <div style={{background:'rgba(198,163,78,.04)',borderRadius:10,padding:14,border:'1px solid rgba(198,163,78,.1)'}}>
                {p.base_legale&&<div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,color:'#a855f7',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Base légale</div><div style={{fontSize:11,color:'#e8e6e0'}}>{p.base_legale}</div></div>}
                {p.conditions&&<div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Conditions</div>{p.conditions.map((c,j)=><div key={j} style={{fontSize:10.5,color:'#ccc',padding:'2px 0',paddingLeft:10,borderLeft:'2px solid rgba(59,130,246,.2)'}}>• {c}</div>)}</div>}
                {p.fiscal&&<div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,color:'#fb923c',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Traitement fiscal</div><div style={{fontSize:11,color:'#e8e6e0'}}>{p.fiscal}</div></div>}
                {p.secteurs&&<div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,color:'#06b6d4',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Secteurs</div><div style={{fontSize:11,color:'#e8e6e0'}}>{p.secteurs}</div></div>}
                {p.procedure&&<div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Procédure</div><div style={{fontSize:11,color:'#e8e6e0',whiteSpace:'pre-wrap'}}>{p.procedure}</div></div>}
                {p.paiement&&<div><div style={{fontSize:9,fontWeight:700,color:'#06b6d4',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Paiement</div><div style={{fontSize:11,color:'#e8e6e0'}}>{p.paiement}</div></div>}
                <div style={{marginTop:10}}><button onClick={()=>{setSelPrime(p.id);setTab('simu');}} style={{padding:'6px 14px',borderRadius:6,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>🧮 Simuler cette prime</button></div>
              </div>
            </div>}
          </div>})}
        </C>;
      })}
    </div>}

    {/* CCT 90 */}
    {tab==='cct90'&&<div>
      <C title="🎯 Bonus CCT n° 90 — Guide complet">
        <Row l="Plafond 2026" v="4.255 EUR/an" b/>
        <Row l="Cotisation employeur" v="33% (au lieu de 25.07%)" c="#fb923c"/>
        <Row l="Cotisation travailleur" v="13.07% (standard)" c="#f87171"/>
        <Row l="Précompte professionnel" v="AUCUN" c="#22c55e"/>
      </C>
      <C title="Simulation CCT 90" color="#22c55e">
        {(()=>{const m=Math.min(brut,4255);const cotE=m*0.33;const cotW=m*TX_ONSS_W;const netCCT=m-cotW;const coutCCT=m+cotE;
        const brutNorm=brut;const onssWN=brutNorm*TX_ONSS_W;const ppN=quickPP(brutNorm);const netNorm=brutNorm-onssWN-ppN;const coutNorm=brutNorm+brutNorm*TX_ONSS_E;
        return <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{padding:14,background:'rgba(34,197,94,.05)',borderRadius:10,border:'1px solid rgba(34,197,94,.15)'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#22c55e',marginBottom:10}}>VIA CCT 90</div>
              <Row l="Brut" v={fmt(m)+' €'}/>
              <Row l="ONSS travailleur" v={'- '+fmt(cotW)+' €'} c="#f87171"/>
              <Row l="PP" v="0.00 €" c="#22c55e"/>
              <Row l="NET travailleur" v={fmt(netCCT)+' €'} c="#4ade80" b/>
              <Row l="Cotisation 33%" v={fmt(cotE)+' €'} c="#fb923c"/>
              <Row l="Coût employeur" v={fmt(coutCCT)+' €'} c="#c6a34e" b/>
            </div>
            <div style={{padding:14,background:'rgba(248,113,113,.05)',borderRadius:10,border:'1px solid rgba(248,113,113,.15)'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#f87171',marginBottom:10}}>VIA PRIME CLASSIQUE</div>
              <Row l="Brut" v={fmt(brutNorm)+' €'}/>
              <Row l="ONSS travailleur" v={'- '+fmt(onssWN)+' €'} c="#f87171"/>
              <Row l="PP (estimé)" v={'- '+fmt(ppN)+' €'} c="#fb923c"/>
              <Row l="NET travailleur" v={fmt(netNorm)+' €'} c="#4ade80" b/>
              <Row l="ONSS employeur" v={fmt(brutNorm*TX_ONSS_E)+' €'} c="#f87171"/>
              <Row l="Coût employeur" v={fmt(coutNorm)+' €'} c="#c6a34e" b/>
            </div>
          </div>
          <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8}}>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>
              Gain net travailleur: <span style={{color:'#4ade80'}}>+{fmt(netCCT-netNorm)} EUR</span> | 
              Économie employeur: <span style={{color:'#22c55e'}}>{fmt(coutNorm-coutCCT)} EUR</span>
            </div>
          </div>
        </div>})()}
      </C>
      <C title="Procédure de dépôt SPF ETCS" color="#3b82f6">
        {['1. Rédiger un acte d\'adhésion (si pas de CE/DS) ou CCT d\'entreprise','2. Définir les objectifs collectifs mesurables et vérifiables','3. Fixer la période de référence (minimum 3 mois)','4. Fixer le montant ou la formule de calcul (max 4.255 EUR/an)','5. Déposer au Greffe du SPF Emploi (ETCS) — Direction relations collectives','6. Délai: dépôt AVANT le début de la période de référence','7. Évaluation: vérification des objectifs à la fin de la période','8. Paiement: après vérification, dans les 30 jours'].map((s,i)=><div key={i} style={{fontSize:11,color:'#e8e6e0',padding:'5px 0',paddingLeft:12,borderLeft:'2px solid rgba(59,130,246,.2)'}}>{s}</div>)}
      </C>
      <C title="Documents à générer" color="#c6a34e">
        <div style={{fontSize:11,color:'#888'}}>
          Les documents suivants peuvent être générés par Aureus Social Pro:
        </div>
        {['📄 Acte d\'adhésion (modèle SPF)','📄 Plan bonus avec objectifs mesurables','📄 Formulaire de dépôt SPF ETCS','📊 Tableau de bord suivi objectifs','🧮 Calcul individuel par travailleur','📋 Récapitulatif annuel pour comptabilité'].map((d,i)=><div key={i} style={{fontSize:11,color:'#e8e6e0',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>{d}</div>)}
      </C>
    </div>}

    {/* CADRE LÉGAL */}
    {tab==='legal'&&<div>
      {[
        {t:'Loi 21/12/2007',d:'Avantages non récurrents liés aux résultats. Base de la CCT 90.'},
        {t:'CCT n° 90 du 20/12/2007',d:'Convention collective nationale cadrant les bonus collectifs non récurrents.'},
        {t:'Loi 26/03/1999',d:'Stock options — Régime fiscal forfaitaire à l\'attribution.'},
        {t:'Loi 22/05/2001',d:'Participation financière des travailleurs au capital et bénéfices.'},
        {t:'Loi 28/04/2003 (LPC)',d:'Pensions complémentaires — Règle des 80%, cotisation 8.86%, taxation capital.'},
        {t:'Loi 17/03/2019',d:'Budget mobilité — 3 piliers: voiture éco, transport durable, cash.'},
        {t:'AR 28/11/1969',d:'Conditions d\'exonération: chèques-repas, éco-chèques, cadeaux, sport/culture.'},
        {t:'CCT 98 (2009)',d:'Éco-chèques — Max 250 EUR/an, produits écologiques.'},
        {t:'Art. 38 §1 CIR 1992',d:'Avantages sociaux collectifs exonérés (assurance hospitalisation, etc.).'},
        {t:'AR 28/08/1963',d:'Petit chômage — Jours d\'absence autorisés et rémunérés.'},
        {t:'Loi 16/03/1971',d:'Travail de nuit, dimanche, jours fériés — Majorations et repos compensatoires.'},
        {t:'Loi 16/11/2015',d:'Flexi-jobs — Cotisation 28%, exonération IPP travailleur.'},
      ].map((r,i)=><C key={i} title={r.t} color="#a855f7"><div style={{fontSize:11,color:'#e8e6e0'}}>{r.d}</div></C>)}
    </div>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 2: OPTI FISCALE V2 — Simulation comparative
// ════════════════════════════════════════════════════════════
export function OptiFiscaleV2({s}){
  const [budget,setBudget]=useState(5000);
  const [tab,setTab]=useState('opti');
  const b=+budget||0;

  const scenarios=useMemo(()=>{
    const base={nom:'100% Salaire brut',icon:'💶',items:[{label:'Salaire brut',montant:b}],
      onssW:b*TX_ONSS_W,onssE:b*TX_ONSS_E,pp:quickPP(b),net:b-b*TX_ONSS_W-quickPP(b),cout:b+b*TX_ONSS_E};

    const opti1_cheqRepas=Math.min(220*6.91,b*0.3);const opti1_eco=250;const opti1_tele=157.83*12;
    const opti1_reste=Math.max(0,b-opti1_cheqRepas-opti1_eco-Math.min(opti1_tele,b*0.2));
    const opti1={nom:'Mix optimisé standard',icon:'🎯',
      items:[{label:'Chèques-repas',montant:opti1_cheqRepas,exo:true},{label:'Éco-chèques',montant:opti1_eco,exo:true},{label:'Indemnité télétravail',montant:Math.min(opti1_tele,b*0.2),exo:true},{label:'Solde salaire brut',montant:opti1_reste}],
      onssW:opti1_reste*TX_ONSS_W,onssE:opti1_reste*TX_ONSS_E,
      pp:quickPP(opti1_reste),
      net:opti1_cheqRepas+opti1_eco+Math.min(opti1_tele,b*0.2)+(opti1_reste-opti1_reste*TX_ONSS_W-quickPP(opti1_reste)),
      cout:opti1_cheqRepas+opti1_eco+Math.min(opti1_tele,b*0.2)+opti1_reste+opti1_reste*TX_ONSS_E};

    const opti2_cct90=Math.min(4255,b);const opti2_reste=Math.max(0,b-opti2_cct90);
    const opti2={nom:'CCT 90 + solde brut',icon:'🎯',
      items:[{label:'Bonus CCT 90',montant:opti2_cct90,cot33:true},{label:'Solde salaire brut',montant:opti2_reste}],
      onssW:opti2_cct90*TX_ONSS_W+opti2_reste*TX_ONSS_W,onssE:opti2_cct90*0.33+opti2_reste*TX_ONSS_E,
      pp:quickPP(opti2_reste),
      net:(opti2_cct90-opti2_cct90*TX_ONSS_W)+(opti2_reste-opti2_reste*TX_ONSS_W-quickPP(opti2_reste)),
      cout:opti2_cct90+opti2_cct90*0.33+opti2_reste+opti2_reste*TX_ONSS_E};

    const opti3_cheq=Math.min(220*6.91,b*0.25);const opti3_eco=250;const opti3_cct=Math.min(4255,b*0.4);
    const opti3_tele=Math.min(157.83*12,b*0.15);const opti3_velo=Math.min(2500,b*0.05);
    const opti3_reste=Math.max(0,b-opti3_cheq-opti3_eco-opti3_cct-opti3_tele-opti3_velo);
    const opti3={nom:'Optimisation maximale',icon:'🚀',
      items:[{label:'Chèques-repas',montant:opti3_cheq,exo:true},{label:'Éco-chèques',montant:opti3_eco,exo:true},{label:'Bonus CCT 90',montant:opti3_cct,cot33:true},{label:'Indemnité télétravail',montant:opti3_tele,exo:true},{label:'Indemnité vélo',montant:opti3_velo,exo:true},{label:'Solde brut',montant:opti3_reste}],
      onssW:opti3_cct*TX_ONSS_W+opti3_reste*TX_ONSS_W,
      onssE:opti3_cct*0.33+opti3_reste*TX_ONSS_E,
      pp:quickPP(opti3_reste),
      net:opti3_cheq+opti3_eco+opti3_tele+opti3_velo+(opti3_cct-opti3_cct*TX_ONSS_W)+(opti3_reste-opti3_reste*TX_ONSS_W-quickPP(opti3_reste)),
      cout:opti3_cheq+opti3_eco+opti3_tele+opti3_velo+opti3_cct+opti3_cct*0.33+opti3_reste+opti3_reste*TX_ONSS_E};

    return[base,opti1,opti2,opti3];
  },[b]);

  const best=scenarios.reduce((a,b)=>a.net>b.net?a:b);

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>💡 Optimisation Fiscale</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Comparez les scénarios pour maximiser le net travailleur et minimiser le coût employeur</p>

    <div style={{marginBottom:16}}>
      <I label="Budget annuel à distribuer (EUR)" type="number" value={budget} onChange={setBudget} style={{maxWidth:300}}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat('+scenarios.length+', 1fr)',gap:12}}>
      {scenarios.map((sc,i)=>{const isBest=sc===best;return <div key={i} style={{background:isBest?'rgba(34,197,94,.05)':'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid '+(isBest?'rgba(34,197,94,.3)':'rgba(198,163,78,.08)')}}>
        <div style={{fontSize:14,fontWeight:700,color:isBest?'#22c55e':'#c6a34e',marginBottom:2}}>{sc.icon} {sc.nom}</div>
        {isBest&&<Badge text="MEILLEUR" color="#22c55e"/>}
        <div style={{marginTop:12}}>
          {sc.items.map((it,j)=><div key={j} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:10.5}}>
            <span style={{color:it.exo?'#22c55e':it.cot33?'#fb923c':'#888'}}>{it.label}</span>
            <span style={{color:'#e8e6e0',fontWeight:500}}>{fmt(it.montant)} €</span>
          </div>)}
        </div>
        <div style={{marginTop:12,paddingTop:10,borderTop:'2px solid rgba(198,163,78,.2)'}}>
          <Row l="NET travailleur" v={fmt(sc.net)+' €'} c="#4ade80" b/>
          <Row l="Coût employeur" v={fmt(sc.cout)+' €'} c="#f87171"/>
          <Row l="Ratio net/coût" v={(sc.cout>0?(sc.net/sc.cout*100):0).toFixed(0)+'%'} c={sc.cout>0&&sc.net/sc.cout>0.6?'#22c55e':'#fb923c'}/>
        </div>
        {i>0&&<div style={{marginTop:8,padding:8,background:'rgba(198,163,78,.06)',borderRadius:6,fontSize:10}}>
          <span style={{color:'#4ade80'}}>+{fmt(sc.net-scenarios[0].net)} € net</span>
          <span style={{color:'#888',marginLeft:8}}>vs salaire brut</span>
        </div>}
      </div>})}
    </div>
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 3: VÉHICULES & ATN V2 — Car policy + TCO
// ════════════════════════════════════════════════════════════
export function VehiculesATNV2({s}){
  const [co2,setCo2]=useState(120);
  const [valCat,setValCat]=useState(35000);
  const [carburant,setCarburant]=useState('essence');
  const [km,setKm]=useState(25000);
  const [tab,setTab]=useState('atn');

  const co2Ref={essence:78,diesel:65,electrique:0}[carburant]||78;
  let pctCO2=5.5+(co2-co2Ref)*0.1;pctCO2=Math.max(4,Math.min(18,pctCO2));
  const atnAn=Math.max(1600,valCat*6/7*pctCO2/100);
  const atnMois=atnAn/12;

  // Cotisation CO2 employeur
  const _co2min = LOIS_BELGES.vehicules.cotCO2Min;
  const cotCO2=carburant==='diesel'?
    (co2<=0?_co2min:((co2*9)/100)*12*6.5):
    carburant==='electrique'?_co2min*12:
    (co2<=0?_co2min:((co2*9)/100)*12*6.5);

  // TCO (Total Cost of Ownership)
  const leasing=valCat*0.018*12;// ~1.8%/mois
  const carburantCout=km*(carburant==='electrique'?0.06:carburant==='diesel'?0.085:0.095);
  const assurance=1200;
  const entretien=km*0.04;
  const tcoAn=leasing+carburantCout+assurance+entretien+cotCO2;

  // DNA (Dépenses non admises)
  const dnaTable=[{min:0,max:50,pct:25},{min:51,max:100,pct:50},{min:101,max:125,pct:65},{min:126,max:155,pct:75},{min:156,max:195,pct:80},{min:196,max:999,pct:100}];
  const dnaPct=(carburant==='electrique')?0:dnaTable.find(d=>co2>=d.min&&co2<=d.max)?.pct||100;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🚗 Véhicules & ATN</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Calcul ATN CO2, cotisation CO2, TCO, DNA — Car policy complète</p>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'atn',l:'📊 ATN CO2'},{v:'tco',l:'💰 TCO'},{v:'compare',l:'⚖️ Comparatif'},{v:'policy',l:'📋 Car Policy'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='atn'&&<div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres véhicule">
        <I label="Valeur catalogue (EUR)" type="number" value={valCat} onChange={setValCat}/>
        <div style={{marginTop:8}}><I label="Émission CO2 (g/km)" type="number" value={co2} onChange={setCo2}/></div>
        <div style={{marginTop:8}}><I label="Carburant" value={carburant} onChange={setCarburant} options={[{v:'essence',l:'Essence'},{v:'diesel',l:'Diesel'},{v:'electrique',l:'Électrique'},{v:'hybride',l:'Hybride'}]}/></div>
        <div style={{marginTop:8}}><I label="Km/an estimés" type="number" value={km} onChange={setKm}/></div>
      </C>
      <div>
        <C title="ATN Véhicule — Calcul détaillé">
          <Row l="Valeur catalogue" v={fi(valCat)+' €'}/>
          <Row l="Coefficient 6/7" v={fmt(valCat*6/7)+' €'}/>
          <Row l={'CO2 référence ('+carburant+')'} v={co2Ref+' g/km'}/>
          <Row l="% CO2 appliqué" v={pctCO2.toFixed(1)+'%'} c={pctCO2>10?'#f87171':pctCO2>6?'#fb923c':'#22c55e'}/>
          <Row l="ATN annuel" v={fmt(atnAn)+' €'} b/>
          <Row l="ATN mensuel (ajouté au revenu)" v={fmt(atnMois)+' €/mois'} c="#c6a34e" b/>
          <Row l="Impact PP estimé (+/-)" v={'~'+fmt(atnMois*0.40)+' €/mois'} c="#f87171" sub/>
        </C>
        <C title="Cotisation CO2 employeur" color="#f87171">
          <Row l="Cotisation CO2 annuelle" v={fmt(cotCO2)+' €/an'} c="#f87171"/>
          <Row l="Cotisation CO2 mensuelle" v={fmt(cotCO2/12)+' €/mois'} c="#f87171"/>
          <div style={{marginTop:8,fontSize:10,color:'#888'}}>Base légale: AR 20/12/2019. Cotisation de solidarité CO2 à charge de l'employeur. Véhicules électriques: minimum légal ({fmt(31.34)} EUR/mois).</div>
        </C>
        <C title="DNA (Dépenses Non Admises)" color="#fb923c">
          <Row l="% DNA applicable" v={dnaPct+'%'} c={dnaPct>75?'#f87171':'#22c55e'}/>
          <Row l="Frais annuels estimés" v={fmt(tcoAn)+' €'}/>
          <Row l="DNA annuelle" v={fmt(tcoAn*dnaPct/100)+' €'} c="#f87171"/>
          <div style={{marginTop:8,fontSize:10,color:'#888'}}>Art. 66 CIR 1992. Les DNA augmentent l'impôt des sociétés. Véhicules électriques: 0% DNA.</div>
        </C>
      </div>
    </div>}

    {tab==='tco'&&<C title="TCO — Total Cost of Ownership annuel">
      {[
        {l:'Leasing/amortissement',v:fmt(leasing)+' €',c:'#c6a34e'},
        {l:'Carburant/énergie ('+fi(km)+' km)',v:fmt(carburantCout)+' €',c:'#fb923c'},
        {l:'Assurance RC + omnium',v:fmt(assurance)+' €'},
        {l:'Entretien + pneus',v:fmt(entretien)+' €'},
        {l:'Cotisation CO2',v:fmt(cotCO2)+' €',c:'#f87171'},
        {l:'ATN (impact PP travailleur)',v:'~'+fmt(atnAn*0.40)+' €',c:'#f87171',sub:true},
        {l:'DNA (impact ISOC)',v:'~'+fmt(tcoAn*dnaPct/100*0.25)+' €',c:'#f87171',sub:true},
      ].map((r,i)=><Row key={i} l={r.l} v={r.v} c={r.c} b={i===4} sub={r.sub}/>)}
      <Row l="TCO TOTAL ANNUEL" v={fmt(tcoAn)+' €'} c="#c6a34e" b/>
      <Row l="TCO mensuel" v={fmt(tcoAn/12)+' €/mois'} c="#c6a34e"/>
      <Row l="Coût par km" v={fmt(tcoAn/km)+' €/km'}/>
    </C>}

    {tab==='compare'&&<div>
      <C title="Comparaison essence vs diesel vs électrique">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          {[{type:'Essence',co2r:78,prix:0.095,cotMin:false},{type:'Diesel',co2r:65,prix:0.085,cotMin:false},{type:'Électrique',co2r:0,prix:0.06,cotMin:true}].map(v=>{
            let p=5.5+(co2-v.co2r)*0.1;p=Math.max(4,Math.min(18,p));
            if(v.type==='Électrique')p=4;
            const atn=Math.max(1600,valCat*6/7*p/100);
            const fuel=km*v.prix;
            const cot=v.cotMin?LOIS_BELGES.vehicules.cotCO2Min*12:((co2*9)/100)*12*6.5;
            const dna=v.type==='Électrique'?0:tcoAn*(dnaTable.find(d=>co2>=d.min&&co2<=d.max)?.pct||100)/100;
            const tot=leasing+fuel+assurance+km*0.04+cot;
            return <div key={v.type} style={{padding:14,background:'rgba(198,163,78,.03)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10}}>{v.type}</div>
              <Row l="ATN/an" v={fmt(atn)+' €'}/>
              <Row l="Carburant/an" v={fmt(fuel)+' €'}/>
              <Row l="Cotisation CO2" v={fmt(cot)+' €'}/>
              <Row l="DNA" v={fmt(dna)+' €'} c={dna===0?'#22c55e':'#f87171'}/>
              <Row l="TCO total" v={fmt(tot)+' €'} b/>
            </div>
          })}
        </div>
      </C>
    </div>}

    {tab==='policy'&&<C title="📋 Car Policy — Éléments essentiels">
      {[
        {t:'Budget par catégorie',d:'Définir un budget TCO mensuel par niveau: Junior (~500€), Middle (~700€), Senior (~900€), Direction (~1.200€+)'},
        {t:'Politique CO2',d:'Plafond CO2 recommandé: ≤ 50 g/km (incitant électrique). DNA 0% + cotisation CO2 minimale.'},
        {t:'Carte carburant',d:'Inclure ou non: carburant privé, bornes de recharge domicile (max 0.2035 EUR/kWh ATN).'},
        {t:'Usage privé',d:'Définir le % privé autorisé. ATN s\'applique dès qu\'il y a usage privé (même 1 km).'},
        {t:'Contribution propre',d:'Possibilité de retenir une contribution propre sur le salaire net (déduite de l\'ATN).'},
        {t:'Restitution',d:'Conditions de restitution: fin de contrat, longue maladie (>1 mois), changement de fonction.'},
        {t:'Infractions',d:'Politique amendes: à charge du conducteur (sauf si non identifiable).'},
        {t:'Budget mobilité',d:'Offrir l\'alternative du budget mobilité (Loi 17/03/2019): Pilier 1 (voiture éco) + Pilier 2 (transport durable) + Pilier 3 (cash 38.07%).'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{r.t}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:3}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 4: FLEXI-JOBS V2 — Contingent + bascule ONSS
// ════════════════════════════════════════════════════════════
export function FlexiJobsV2({s,d}){
  const [heures,setHeures]=useState(500);
  const [salaire,setSalaire]=useState(14.97);
  const [tab,setTab]=useState('simu');
  const h=+heures||0;const sal=+salaire||14.97;
  const brut=h*sal;const cot28=brut*0.28;const coutTotal=brut+cot28;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🍕 Flexi-Jobs</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Simulation complète — Cotisation 28%, contingent, conditions, bascule ONSS</p>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'simu',l:'🧮 Simulateur'},{v:'conditions',l:'📋 Conditions'},{v:'bascule',l:'⚠ Bascule ONSS'},{v:'legal',l:'📜 Cadre légal'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='simu'&&<div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres">
        <I label="Heures/trimestre" type="number" value={heures} onChange={setHeures}/>
        <div style={{marginTop:8}}><I label="Salaire horaire brut (EUR)" type="number" value={salaire} onChange={setSalaire}/></div>
        <div style={{marginTop:12,padding:10,background:'rgba(34,197,94,.06)',borderRadius:8}}>
          <div style={{fontSize:10,color:'#22c55e',fontWeight:600}}>Le flexi-travailleur ne paie NI ONSS NI impôt</div>
          <div style={{fontSize:9,color:'#888',marginTop:2}}>Brut = Net pour le travailleur</div>
        </div>
      </C>
      <div>
        <C title="Décomposition">
          <Row l="Heures prestées" v={fi(h)+' h'}/>
          <Row l="Salaire horaire" v={fmt(sal)+' €/h'}/>
          <Row l="Rémunération brute = NETTE" v={fmt(brut)+' €'} c="#4ade80" b/>
          <Row l="Cotisation spéciale 28% employeur" v={fmt(cot28)+' €'} c="#f87171"/>
          <Row l="COÛT TOTAL EMPLOYEUR" v={fmt(coutTotal)+' €'} c="#c6a34e" b/>
          <Row l="ONSS travailleur" v="0.00 €" c="#22c55e"/>
          <Row l="Précompte professionnel" v="0.00 €" c="#22c55e"/>
        </C>
        <C title="Comparaison vs contrat classique" color="#3b82f6">
          {(()=>{const classOnssW=brut*TX_ONSS_W;const classPP=quickPP(brut);const classNet=brut-classOnssW-classPP;const classCout=brut+brut*TX_ONSS_E;
          return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{padding:12,background:'rgba(34,197,94,.05)',borderRadius:8,border:'1px solid rgba(34,197,94,.15)'}}>
              <div style={{fontSize:11,fontWeight:600,color:'#22c55e',marginBottom:8}}>FLEXI-JOB</div>
              <Row l="Net travailleur" v={fmt(brut)+' €'} c="#4ade80"/>
              <Row l="Coût employeur" v={fmt(coutTotal)+' €'}/>
            </div>
            <div style={{padding:12,background:'rgba(248,113,113,.05)',borderRadius:8,border:'1px solid rgba(248,113,113,.15)'}}>
              <div style={{fontSize:11,fontWeight:600,color:'#f87171',marginBottom:8}}>CONTRAT CLASSIQUE</div>
              <Row l="Net travailleur" v={fmt(classNet)+' €'} c="#4ade80"/>
              <Row l="Coût employeur" v={fmt(classCout)+' €'}/>
            </div>
          </div>})()}
          <div style={{marginTop:10,padding:8,background:'rgba(198,163,78,.06)',borderRadius:6,fontSize:11,color:'#c6a34e'}}>
            Gain net travailleur: <b style={{color:'#4ade80'}}>+{fmt(brut-(brut-brut*TX_ONSS_W-quickPP(brut)))} €</b> | 
            Économie employeur: <b style={{color:'#22c55e'}}>{fmt((brut+brut*TX_ONSS_E)-coutTotal)} €</b>
          </div>
        </C>
      </div>
    </div>}

    {tab==='conditions'&&<C title="Conditions légales flexi-job">
      {[
        {t:'Occupation principale T-3',d:'Le flexi-travailleur doit avoir une occupation principale d\'au moins 4/5 chez un AUTRE employeur au trimestre T-3 (3 trimestres avant).'},
        {t:'Secteurs autorisés',d:'CP 118 (alimentaire), 119 (commerce alim.), 201 (commerce indépendant), 202 (commerce alim. employés), 302 (horeca), 311/312 (grandes surfaces), 314 (coiffure).'},
        {t:'Pas de contrat en cours',d:'Le flexi-travailleur ne peut PAS avoir de contrat de travail en cours chez le même employeur.'},
        {t:'Salaire minimum',d:'Flexi-salaire minimum: 12.05 EUR/h + flexi-pécule vacances 7.67% = minimum 12.98 EUR/h tout compris.'},
        {t:'Flexi-pécule de vacances',d:'7.67% versé en même temps que le flexi-salaire. Inclus dans le montant brut.'},
        {t:'Dimona FLX',d:'Déclaration Dimona spécifique "FLX" avant le début de chaque occupation.'},
        {t:'Contrat-cadre',d:'Contrat-cadre écrit obligatoire avant la 1ère occupation. Contrat de travail oral possible ensuite.'},
        {t:'Plafond fiscal 2026',d:'Revenus flexi-jobs exonérés IPP. Pas de plafond légal mais attention au cumul avec revenus principaux.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{r.t}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:3}}>{r.d}</div>
      </div>)}
    </C>}

    {tab==='bascule'&&<C title="⚠ Bascule ONSS — Risques" color="#f87171">
      {[
        {t:'Requalification en contrat classique',d:'Si les conditions flexi ne sont pas remplies (pas de 4/5 T-3, même employeur, secteur non autorisé), l\'ONSS peut requalifier en contrat classique avec rappel ONSS + amendes.'},
        {t:'Contrôle T-3',d:'L\'ONSS vérifie automatiquement la condition de 4/5 au T-3. Si non remplie: cotisations classiques rétroactives.'},
        {t:'Cumul pensionnés',d:'Les pensionnés peuvent aussi être flexi-travailleurs sans condition de 4/5. Attention: les prépensionnés (RCC) ont des limites de revenus.'},
        {t:'Dimona manquante',d:'Absence de Dimona FLX: amende administrative + requalification possible.'},
        {t:'Dépassement secteur',d:'Flexi-job dans un secteur non autorisé = requalification automatique en contrat classique.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#f87171'}}>{r.t}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:3}}>{r.d}</div>
      </div>)}
    </C>}

    {tab==='legal'&&<C title="Cadre légal flexi-jobs">
      {[
        {t:'Loi 16/11/2015',d:'Loi instaurant le statut flexi-job.'},
        {t:'Loi 23/03/2019',d:'Extension des flexi-jobs à de nouveaux secteurs.'},
        {t:'AR 14/12/2015',d:'Arrêté royal d\'exécution — modalités Dimona FLX, contrat-cadre.'},
        {t:'Cotisation spéciale 28%',d:'Remplace les cotisations ONSS classiques (25.07% employeur + 13.07% travailleur).'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 5: 13ÈME MOIS V2 — Prorata + spécificités sectorielles
// ════════════════════════════════════════════════════════════
export function TreiziemeMoisV2({s}){
  const emps=(s?.clients||[]).flatMap(c=>c.emps||[]);
  const [moisPrestes,setMoisPrestes]=useState(12);
  const [salaire,setSalaire]=useState(3000);
  const [cp,setCp]=useState('200');
  const brut=+salaire||0;const mp=+moisPrestes||12;
  const prorata=mp/12;const prime=brut*prorata;
  const onssW=prime*TX_ONSS_W;const onssE=prime*TX_ONSS_E;
  const pp=quickPP(prime);const net=prime-onssW-pp;

  const cpSpecifics={
    '200':{nom:'CP 200 — Employés',regle:'1 mois brut (CCT)',condition:'6 mois ancienneté au 31/12'},
    '118':{nom:'CP 118 — Alimentaire',regle:'1 mois brut via CCT sectorielle',condition:'6 mois ancienneté'},
    '119':{nom:'CP 119 — Commerce alim.',regle:'1 mois brut après 6 mois',condition:'Au 31/12'},
    '302':{nom:'CP 302 — Horeca',regle:'1 mois brut (via fonds sectoriel ou employeur)',condition:'6 mois ancienneté'},
    '124':{nom:'CP 124 — Construction',regle:'Via timbres fidélité (~9% annuel = plus d\'1 mois)',condition:'200 jours prestés + en service au 30/06'},
    '322.01':{nom:'CP 322.01 — Titres-services',regle:'~4.33 semaines (décembre) + ~1 semaine (juin)',condition:'6 mois ancienneté'},
    '330':{nom:'CP 330 — Santé',regle:'1 mois brut (protocole non-marchand)',condition:'6 mois ancienneté'},
    '111':{nom:'CP 111 — Métal',regle:'1 mois brut',condition:'6 mois ancienneté au 31/12'},
  };
  const spec=cpSpecifics[cp]||{nom:'Autre CP',regle:'Selon CCT sectorielle',condition:'Variable'};

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🎄 13ème Mois</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Calcul prorata + spécificités par commission paritaire</p>

    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres">
        <I label="Salaire brut mensuel (EUR)" type="number" value={salaire} onChange={setSalaire}/>
        <div style={{marginTop:8}}><I label="Mois prestés dans l'année" type="number" value={moisPrestes} onChange={setMoisPrestes}/></div>
        <div style={{marginTop:8}}><I label="Commission paritaire" value={cp} onChange={setCp} options={Object.entries(cpSpecifics).map(([k,v])=>({v:k,l:v.nom}))}/></div>
      </C>
      <div>
        <C title={spec.nom}>
          <Row l="Règle sectorielle" v={spec.regle}/>
          <Row l="Condition" v={spec.condition}/>
          <Row l="Prorata applicable" v={prorata<1?'OUI ('+mp+'/12)':'NON (année complète)'} c={prorata<1?'#fb923c':'#22c55e'}/>
        </C>
        <C title="Calcul détaillé">
          <Row l="Salaire brut de référence" v={fmt(brut)+' €'}/>
          <Row l="Prorata (mois prestés)" v={mp+'/12 = '+prorata.toFixed(4)}/>
          <Row l="Prime brute" v={fmt(prime)+' €'} b/>
          <Row l="ONSS travailleur (13.07%)" v={'- '+fmt(onssW)+' €'} c="#f87171"/>
          <Row l="Précompte professionnel (est.)" v={'- '+fmt(pp)+' €'} c="#fb923c"/>
          <Row l="NET travailleur" v={fmt(net)+' €'} c="#4ade80" b/>
          <Row l="ONSS employeur (25.07%)" v={fmt(onssE)+' €'} c="#f87171"/>
          <Row l="COÛT EMPLOYEUR" v={fmt(prime+onssE)+' €'} c="#c6a34e" b/>
        </C>
        {emps.length>0&&<C title={`Impact total — ${emps.length} travailleur(s)`}>
          <Row l="Budget brut total" v={fmt(prime*emps.length)+' €'}/>
          <Row l="Coût employeur total" v={fmt((prime+onssE)*emps.length)+' €'} c="#f87171"/>
          <Row l="Net total distribué" v={fmt(net*emps.length)+' €'} c="#4ade80" b/>
        </C>}
      </div>
    </div>
  </div>;
}

// Export pour remplacement
export {PRIMES_DB,CATS,CAT_COLORS};

// ════════════════════════════════════════════════════════════
// COMPOSANT 6: ÉCO-CHÈQUES V2 — Prorata + plafond sectoriel
// ════════════════════════════════════════════════════════════
export function EcoChequesV2({s}){
  const emps=(s?.clients||[]).flatMap(c=>c.emps||[]);
  const [montant,setMontant]=useState(250);
  const [moisPrestes,setMoisPrestes]=useState(12);
  const [regime,setRegime]=useState(100);
  const [cp,setCp]=useState('200');

  const plafonds={'200':250,'118':250,'119':250,'302':250,'124':250,'322.01':250,'330':250,'111':250,'140':250,'121':250};
  const plafond=plafonds[cp]||250;
  const prorata=(+moisPrestes||12)/12;
  const fractionTP=(+regime||100)/100;
  const montantFinal=Math.min(+montant||250,plafond)*prorata*fractionTP;
  const coutTotal=montantFinal*(emps.length||1);

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🌿 Éco-Chèques</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>CCT 98 CNT — Prorata entrée/sortie + temps partiel + plafond sectoriel</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Plafond sectoriel',v:fi(plafond)+' €',c:'#c6a34e'},{l:'Prorata prestations',v:(prorata*100).toFixed(0)+'%',c:prorata<1?'#fb923c':'#22c55e'},{l:'Fraction TP',v:fi(regime)+'%',c:fractionTP<1?'#fb923c':'#22c55e'},{l:'Montant net/pers',v:fmt(montantFinal)+' €',c:'#4ade80'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres">
        <I label="Montant de base (EUR/an)" type="number" value={montant} onChange={setMontant}/>
        <div style={{marginTop:8}}><I label="Mois prestés dans l'année" type="number" value={moisPrestes} onChange={setMoisPrestes}/></div>
        <div style={{marginTop:8}}><I label="Régime horaire %" type="number" value={regime} onChange={setRegime}/></div>
        <div style={{marginTop:8}}><I label="Commission paritaire" value={cp} onChange={setCp} options={Object.entries(plafonds).map(([k])=>({v:k,l:'CP '+k}))}/></div>
      </C>
      <div>
        <C title="Calcul détaillé">
          <Row l="Montant de base" v={fi(montant)+' €'}/>
          <Row l="Plafond sectoriel CP" v={fi(plafond)+' €'} c={+montant>plafond?'#f87171':'#22c55e'}/>
          <Row l="Prorata mois prestés" v={moisPrestes+'/12 = '+(prorata*100).toFixed(0)+'%'}/>
          <Row l="Fraction temps partiel" v={regime+'% → ×'+(fractionTP).toFixed(2)}/>
          <Row l="MONTANT NET travailleur" v={fmt(montantFinal)+' €'} c="#4ade80" b/>
          <Row l="ONSS" v="0.00 € (exonéré)" c="#22c55e"/>
          <Row l="Précompte prof." v="0.00 € (exonéré)" c="#22c55e"/>
          <Row l="COÛT employeur" v={fmt(montantFinal)+' €'} c="#c6a34e" b/>
          <div style={{marginTop:8,fontSize:10,color:'#888'}}>100% exonéré ONSS + IPP si toutes conditions CCT 98 respectées</div>
        </C>
        <C title="Conditions d'exonération" color="#22c55e">
          {['Max 250 EUR/an par travailleur temps plein','Prorata obligatoire si temps partiel ou entrée en cours d\'année','Validité 24 mois à partir de la date de mise à disposition','Utilisables uniquement pour produits/services figurant sur la liste SPF','Support électronique obligatoire (plus de papier depuis 2022)','Non échangeables contre espèces','Octroyés en vertu d\'une CCT sectorielle ou d\'entreprise','Si conditions non remplies → requalification en rémunération → ONSS + PP'].map((c,i)=><div key={i} style={{fontSize:10.5,color:i===7?'#f87171':'#ccc',padding:'3px 0',paddingLeft:10,borderLeft:i===7?'2px solid #f87171':'2px solid rgba(34,197,94,.2)'}}>• {c}</div>)}
        </C>
        {emps.length>0&&<C title={'Impact total — '+emps.length+' travailleur(s)'}>
          <Row l="Budget total éco-chèques" v={fmt(coutTotal)+' €'} c="#c6a34e" b/>
          <Row l="Coût employeur total" v={fmt(coutTotal)+' € (= budget, car exonéré)'}/>
        </C>}
      </div>
    </div>
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 7: PLAN CAFÉTÉRIA V2 — Moteur de conversion réel
// ════════════════════════════════════════════════════════════
export function PlanCafeteriaV2({s}){
  const [budgetAn,setBudgetAn]=useState(6000);
  const [tab,setTab]=useState('simu');
  const B=+budgetAn||0;

  // Options cafétéria avec leur traitement fiscal réel
  const options=[
    {id:'cheqrepas',nom:'Chèques-repas (part patronale)',icon:'🍽',max:220*6.91,exoONSS:true,exoIPP:true,note:'Max 6.91€/jour × 220j = 1.520 EUR'},
    {id:'eco',nom:'Éco-chèques',icon:'🌿',max:250,exoONSS:true,exoIPP:true,note:'Max 250 EUR/an'},
    {id:'sport',nom:'Chèques sport & culture',icon:'🏋',max:100,exoONSS:true,exoIPP:true,note:'Max 100 EUR/an'},
    {id:'cadeau',nom:'Chèques-cadeaux',icon:'🎁',max:40,exoONSS:true,exoIPP:true,note:'Max 40 EUR/an Noël'},
    {id:'teletravail',nom:'Indemnité télétravail',icon:'🏠',max:157.83*12,exoONSS:true,exoIPP:true,note:'Max 157.83 EUR/mois'},
    {id:'internet',nom:'Indemnité internet',icon:'📶',max:20*12,exoONSS:true,exoIPP:true,note:'Max 20 EUR/mois'},
    {id:'velo',nom:'Indemnité vélo / leasing vélo',icon:'🚴',max:2500,exoONSS:true,exoIPP:true,note:'0.35 EUR/km — max 2.500 EUR/an'},
    {id:'pension',nom:'Pension complémentaire (supplément)',icon:'🛡',max:null,exoONSS:false,exoIPP:true,note:'ONSS spéciale 8.86% + taxe Wyninckx'},
    {id:'hospi',nom:'Assurance hospitalisation upgrade',icon:'🏥',max:null,exoONSS:true,exoIPP:true,note:'Si collectif et non-discriminatoire'},
    {id:'conge',nom:'Jours de congé supplémentaires',icon:'🏖',max:null,exoONSS:false,exoIPP:false,note:'Conversion brut → jours. 1 jour = salaire journalier'},
    {id:'multimedia',nom:'PC / tablette / smartphone',icon:'💻',max:null,exoONSS:false,exoIPP:false,note:'ATN forfaitaire: PC 72€/an, smartphone 36€/an'},
    {id:'warrant',nom:'Warrants',icon:'📈',max:null,exoONSS:true,exoIPP:false,note:'Taxation forfaitaire ~18%. Pas d\'ONSS.'},
  ];

  const [alloc,setAlloc]=useState(()=>{const init={};options.forEach(o=>{init[o.id]=0});return init;});
  const totalAlloc=Object.values(alloc).reduce((a,b)=>a+(+b||0),0);
  const reste=B-totalAlloc;

  // Calcul comparatif
  const exoTotal=options.reduce((acc,o)=>{const m=+alloc[o.id]||0;if(o.exoONSS&&o.exoIPP)return acc+m;return acc;},0);
  const onssItems=options.reduce((acc,o)=>{const m=+alloc[o.id]||0;if(!o.exoONSS)return acc+m;return acc;},0);
  const netCafe=exoTotal+(onssItems-onssItems*TX_ONSS_W-quickPP(onssItems))+(reste>0?(reste-reste*TX_ONSS_W-quickPP(reste)):0);
  const coutCafe=totalAlloc+options.reduce((acc,o)=>{const m=+alloc[o.id]||0;if(!o.exoONSS)return acc+m*TX_ONSS_E;return acc;},0)+(reste>0?reste*TX_ONSS_E:0);
  const netBrut=B-B*TX_ONSS_W-quickPP(B);const coutBrut=B+B*TX_ONSS_E;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>☕ Plan Cafétéria</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Convertissez un budget brut en avantages optimisés — moteur fiscal réel</p>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'simu',l:'🧮 Convertisseur'},{v:'compare',l:'⚖️ Comparatif'},{v:'legal',l:'📜 Cadre légal'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='simu'&&<div>
      <div style={{marginBottom:16}}><I label="Budget annuel brut à convertir (EUR)" type="number" value={budgetAn} onChange={setBudgetAn} style={{maxWidth:300}}/></div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
        {[{l:'Budget',v:fmt(B)+' €',c:'#c6a34e'},{l:'Alloué',v:fmt(totalAlloc)+' €',c:totalAlloc>B?'#f87171':'#3b82f6'},{l:'Reste',v:fmt(reste)+' €',c:reste<0?'#f87171':'#888'},{l:'% exonéré',v:B>0?fi(exoTotal/B*100)+'%':'0%',c:'#22c55e'}].map((k,i)=><div key={i} style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:15,fontWeight:700,color:k.c,marginTop:3}}>{k.v}</div></div>)}
      </div>

      <Bar pct={B>0?totalAlloc/B*100:0} color={totalAlloc>B?'#f87171':'#c6a34e'}/>
      {totalAlloc>B&&<div style={{fontSize:10,color:'#f87171',marginTop:4}}>⚠ Budget dépassé de {fmt(totalAlloc-B)} EUR</div>}

      <div style={{marginTop:16}}>
        {options.map(o=><div key={o.id} style={{display:'grid',gridTemplateColumns:'30px 200px 120px 1fr 80px',gap:8,alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <span style={{fontSize:16}}>{o.icon}</span>
          <div><div style={{fontSize:11,color:'#e8e6e0',fontWeight:500}}>{o.nom}</div><div style={{fontSize:9,color:'#888'}}>{o.note}</div></div>
          <input type="number" value={alloc[o.id]||''} onChange={e=>setAlloc(prev=>({...prev,[o.id]:+e.target.value||0}))} placeholder="0" style={{padding:'6px 8px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}/>
          <div style={{display:'flex',gap:4}}>
            {o.exoONSS&&<Badge text="ONSS ✓" color="#22c55e"/>}
            {o.exoIPP&&<Badge text="IPP ✓" color="#22c55e"/>}
            {!o.exoONSS&&<Badge text="ONSS" color="#f87171"/>}
            {!o.exoIPP&&<Badge text="IPP" color="#f87171"/>}
          </div>
          {o.max&&<span style={{fontSize:9,color:+alloc[o.id]>o.max?'#f87171':'#888'}}>max {fi(o.max)} €</span>}
        </div>)}
      </div>
    </div>}

    {tab==='compare'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <C title="💶 100% Salaire brut" color="#f87171">
        <Row l="Budget brut" v={fmt(B)+' €'}/>
        <Row l="ONSS travailleur (13.07%)" v={'- '+fmt(B*TX_ONSS_W)+' €'} c="#f87171"/>
        <Row l="PP estimé" v={'- '+fmt(quickPP(B))+' €'} c="#fb923c"/>
        <Row l="NET travailleur" v={fmt(netBrut)+' €'} c="#4ade80" b/>
        <Row l="Coût employeur" v={fmt(coutBrut)+' €'} c="#f87171"/>
        <Row l="Ratio net/coût" v={(coutBrut>0?(netBrut/coutBrut*100):0).toFixed(0)+'%'}/>
      </C>
      <C title="☕ Plan cafétéria" color="#22c55e">
        <Row l="Budget converti" v={fmt(totalAlloc)+' €'}/>
        <Row l="Dont exonéré ONSS+IPP" v={fmt(exoTotal)+' €'} c="#22c55e"/>
        <Row l="Dont soumis" v={fmt(onssItems)+' €'} c="#fb923c"/>
        <Row l="Solde brut restant" v={fmt(Math.max(0,reste))+' €'}/>
        <Row l="NET travailleur" v={fmt(netCafe)+' €'} c="#4ade80" b/>
        <Row l="Coût employeur" v={fmt(coutCafe)+' €'} c="#f87171"/>
        <Row l="Ratio net/coût" v={(coutCafe>0?(netCafe/coutCafe*100):0).toFixed(0)+'%'}/>
        {netCafe>netBrut&&<div style={{marginTop:10,padding:8,background:'rgba(34,197,94,.08)',borderRadius:6,fontSize:11}}>
          <span style={{color:'#22c55e',fontWeight:700}}>+{fmt(netCafe-netBrut)} € net</span> <span style={{color:'#888'}}>vs salaire brut pur</span>
        </div>}
      </C>
    </div>}

    {tab==='legal'&&<C title="Cadre légal Plan Cafétéria">
      {[
        {t:'Pas de loi spécifique',d:'Pas de cadre légal unique. Chaque avantage suit son propre régime fiscal/ONSS.'},
        {t:'Ruling SPF Finances',d:'Ruling préventif fortement recommandé pour sécuriser le plan. Validité: 5 ans.'},
        {t:'Neutralité de coût',d:'Le coût employeur du plan cafétéria doit être ≤ au coût du salaire brut converti.'},
        {t:'Pas de substitution',d:'Le plan ne peut pas remplacer la rémunération existante. Il s\'applique aux augmentations/bonus futurs.'},
        {t:'Liberté de choix',d:'Le travailleur choisit librement ses avantages dans l\'enveloppe. Pas d\'obligation.'},
        {t:'Réversibilité',d:'En cas de changement de situation (naissance, mariage), le travailleur peut ajuster ses choix.'},
        {t:'Information',d:'L\'employeur doit informer clairement chaque travailleur de l\'impact fiscal de ses choix.'},
        {t:'Commission paritaire',d:'Vérifier que le plan n\'est pas contraire aux CCT sectorielles. Certains avantages sont obligatoires.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{r.t}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:3}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 8: CCT 90 BONUS V2 — Plan bonus + dépôt SPF
// ════════════════════════════════════════════════════════════
export function CCT90BonusV2({s}){
  const emps=(s?.clients||[]).flatMap(c=>c.emps||[]);const n=emps.length||1;
  const [montant,setMontant]=useState(3000);
  const [periodeRef,setPeriodeRef]=useState(12);
  const [tab,setTab]=useState('simu');
  const plafond=4255;
  const m=Math.min(+montant||0,plafond);
  const cotE=m*0.33;const cotW=m*TX_ONSS_W;const net=m-cotW;
  const coutTotal=(m+cotE)*n;

  // Objectifs types
  const objectifsTypes=[
    {cat:'Financier',items:['CA ≥ X EUR sur la période','Marge brute ≥ X%','EBITDA ≥ X EUR','Réduction coûts ≥ X%','Recouvrement créances ≤ X jours']},
    {cat:'Production',items:['Production ≥ X unités','Taux de rejet ≤ X%','Respect délais livraison ≥ X%','Zéro accident de travail sur la période','Taux d\'absentéisme ≤ X%']},
    {cat:'Qualité',items:['Score satisfaction client ≥ X/10','Nombre réclamations ≤ X','Certification ISO obtenue','Audit qualité réussi','Taux de retour ≤ X%']},
    {cat:'Commercial',items:['Nombre nouveaux clients ≥ X','Taux de rétention clients ≥ X%','Panier moyen ≥ X EUR','Parts de marché ≥ X%']},
    {cat:'RH / Social',items:['Formation ≥ X heures/travailleur','Taux de rotation ≤ X%','Bien-être: score enquête ≥ X','Diversité: objectif X% atteint']},
    {cat:'Environnement',items:['Réduction CO2 ≥ X%','Tri sélectif ≥ X%','Consommation énergie ≤ X kWh','Zéro déchet non-recyclé']},
  ];

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🎯 Bonus CCT 90</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Avantages non-récurrents liés aux résultats — Plafond {fi(plafond)} EUR/an (2026)</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Plafond 2026',v:fmt(plafond),c:'#c6a34e'},{l:'ONSS employeur',v:'33%',c:'#f87171'},{l:'ONSS travailleur',v:'13.07%',c:'#fb923c'},{l:'PP',v:'0%',c:'#4ade80'},{l:'Net travailleur',v:fmt(net),c:'#4ade80'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'simu',l:'🧮 Simulateur'},{v:'objectifs',l:'🎯 Objectifs types'},{v:'procedure',l:'📋 Procédure dépôt'},{v:'doc',l:'📄 Génération plan'},{v:'legal',l:'📜 Base légale'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='simu'&&<div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres">
        <I label="Montant bonus (EUR/personne)" type="number" value={montant} onChange={setMontant}/>
        {+montant>plafond&&<div style={{fontSize:10,color:'#f87171',marginTop:4}}>⚠ Plafonné à {fi(plafond)} EUR</div>}
        <div style={{marginTop:8}}><I label="Période de référence (mois)" type="number" value={periodeRef} onChange={setPeriodeRef}/></div>
        {+periodeRef<3&&<div style={{fontSize:10,color:'#f87171',marginTop:4}}>⚠ Minimum 3 mois requis</div>}
      </C>
      <div>
        <C title="Décomposition par travailleur">
          <Row l="Bonus brut" v={fmt(m)+' €'}/>
          <Row l="Cotisation spéciale employeur (33%)" v={fmt(cotE)+' €'} c="#f87171"/>
          <Row l="Cotisation solidarité travailleur (13.07%)" v={'- '+fmt(cotW)+' €'} c="#fb923c"/>
          <Row l="Précompte professionnel" v="0.00 € (exonéré)" c="#22c55e"/>
          <Row l="NET TRAVAILLEUR" v={fmt(net)+' €'} c="#4ade80" b/>
          <Row l="COÛT EMPLOYEUR" v={fmt(m+cotE)+' €'} c="#c6a34e" b/>
        </C>
        <C title="Comparaison vs prime brute classique" color="#3b82f6">
          {(()=>{const classBrut=m;const classOnssW=classBrut*TX_ONSS_W;const classPP=quickPP(classBrut);const classNet=classBrut-classOnssW-classPP;const classCout=classBrut+classBrut*TX_ONSS_E;
          return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{padding:12,background:'rgba(34,197,94,.05)',borderRadius:8,border:'1px solid rgba(34,197,94,.15)'}}>
              <div style={{fontSize:11,fontWeight:600,color:'#22c55e',marginBottom:8}}>CCT 90</div>
              <Row l="Net travailleur" v={fmt(net)+' €'} c="#4ade80"/>
              <Row l="Coût employeur" v={fmt(m+cotE)+' €'}/>
            </div>
            <div style={{padding:12,background:'rgba(248,113,113,.05)',borderRadius:8,border:'1px solid rgba(248,113,113,.15)'}}>
              <div style={{fontSize:11,fontWeight:600,color:'#f87171',marginBottom:8}}>PRIME BRUTE</div>
              <Row l="Net travailleur" v={fmt(classNet)+' €'} c="#4ade80"/>
              <Row l="Coût employeur" v={fmt(classCout)+' €'}/>
            </div>
          </div>})()}
          <div style={{marginTop:10,padding:8,background:'rgba(198,163,78,.06)',borderRadius:6,fontSize:11,color:'#c6a34e'}}>
            Gain net travailleur CCT 90: <b style={{color:'#4ade80'}}>+{fmt(net-(m-m*TX_ONSS_W-quickPP(m)))} €</b>
          </div>
        </C>
        {n>1&&<C title={'Impact total — '+n+' travailleur(s)'}>
          <Row l="Budget bonus total" v={fmt(m*n)+' €'}/>
          <Row l="Coût employeur total (33% inclus)" v={fmt(coutTotal)+' €'} c="#f87171"/>
          <Row l="Net total distribué" v={fmt(net*n)+' €'} c="#4ade80" b/>
        </C>}
      </div>
    </div>}

    {tab==='objectifs'&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
      {objectifsTypes.map((cat,i)=><C key={i} title={cat.cat}>
        {cat.items.map((obj,j)=><div key={j} style={{padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11,color:'#ccc'}}>
          <span style={{color:'#c6a34e',marginRight:6}}>○</span>{obj}
        </div>)}
      </C>)}
    </div>}

    {tab==='procedure'&&<C title="Procédure de dépôt — 7 étapes">
      {[
        {n:1,t:'Rédiger le plan bonus',d:'Acte d\'adhésion (si pas de DS) ou CCT d\'entreprise (si DS). Utiliser le formulaire obligatoire SPF.'},
        {n:2,t:'Définir les objectifs',d:'Objectifs COLLECTIFS, mesurables, vérifiables. Pas d\'objectifs individuels. Incertitude quant à l\'atteinte.'},
        {n:3,t:'Fixer la période de référence',d:'Minimum 3 mois. Maximum: exercice comptable ou année civile.'},
        {n:4,t:'Consulter le CPPT / DS',d:'Si pas de DS: affichage pendant 15 jours. Si DS: négociation CCT d\'entreprise.'},
        {n:5,t:'Déposer au greffe du SPF Emploi',d:'Envoi du formulaire au SPF ETCS — Direction générale Relations collectives de travail. Délai: avant le 1/3 de la période de référence.'},
        {n:6,t:'Vérification SPF',d:'Le SPF vérifie le caractère collectif et mesurable des objectifs. Refus possible.'},
        {n:7,t:'Paiement après vérification',d:'À l\'issue de la période: vérifier les objectifs. Paiement si atteints. PP = 0. ONSS spéciale uniquement.'},
      ].map((r,i)=><div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(198,163,78,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#c6a34e',flexShrink:0}}>{r.n}</div>
        <div><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.t}</div><div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div></div>
      </div>)}
    </C>}

    {tab==='doc'&&<C title="📄 Modèle de plan bonus CCT 90">
      <div style={{background:'rgba(198,163,78,.06)',borderRadius:8,padding:14,fontSize:11,lineHeight:1.8,color:'#ccc',fontFamily:'monospace',whiteSpace:'pre-wrap'}}>
{`ACTE D'ADHÉSION — PLAN BONUS CCT 90
═══════════════════════════════════════

EMPLOYEUR: [Raison sociale]
BCE: [Numéro d'entreprise]
CP: [Commission paritaire]

PÉRIODE DE RÉFÉRENCE: du [date] au [date]
BÉNÉFICIAIRES: L'ensemble des travailleurs

OBJECTIFS:
1. [Objectif collectif 1 - mesurable]
   Seuil minimum: [valeur]
   Cible: [valeur]
   Bonus si atteint: [montant] EUR

2. [Objectif collectif 2 - mesurable]
   Seuil minimum: [valeur]
   Cible: [valeur]
   Bonus si atteint: [montant] EUR

MONTANT MAXIMUM: ${fi(plafond)} EUR/travailleur/an

PROCÉDURE DE VÉRIFICATION:
- Données vérifiées par [responsable]
- Communication aux travailleurs le [date]

Fait à [lieu], le [date]

Signature employeur: ________________`}
      </div>
      <div style={{marginTop:10,fontSize:10,color:'#888'}}>Ce modèle doit être adapté. Formulaire officiel disponible sur le site du SPF Emploi (emploi.belgique.be).</div>
    </C>}

    {tab==='legal'&&<C title="Base légale CCT 90">
      {[
        {t:'CCT n° 90 du 20/12/2007',d:'Convention collective de travail relative aux avantages non récurrents liés aux résultats. CNT.'},
        {t:'Loi 21/12/2007',d:'Base légale du régime fiscal favorable. Art. 38 §1er, 24° CIR 1992.'},
        {t:'Plafond 2026',d:fi(plafond)+' EUR/an brut par travailleur. Indexé annuellement.'},
        {t:'Cotisation spéciale employeur',d:'33% (pas d\'ONSS classique 25.07%).'},
        {t:'Cotisation solidarité travailleur',d:'13.07% (cotisation de solidarité, pas ONSS classique).'},
        {t:'Pas de précompte professionnel',d:'Le bonus CCT 90 n\'est PAS soumis au PP. C\'est l\'avantage principal.'},
        {t:'Déductibilité employeur',d:'Le bonus + la cotisation 33% sont des charges professionnelles déductibles ISOC.'},
        {t:'Dépôt obligatoire',d:'Avant le 1/3 de la période de référence au SPF Emploi. À défaut: pas d\'exonération PP.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 9: NOTES DE FRAIS V2 — Saisie + approbation workflow
// ════════════════════════════════════════════════════════════
export function NoteFraisV2({s}){
  const [tab,setTab]=useState('forfaits');
  const [notes,setNotes]=useState([]);
  const [newNote,setNewNote]=useState({date:'',desc:'',montant:0,cat:'transport',justif:false});

  const cats=[
    {id:'transport',nom:'Transport',icon:'🚗',forfait:'0.4415 EUR/km',plafond:'24.000 km/an'},
    {id:'repas',nom:'Repas professionnel',icon:'🍽',forfait:'19.99 EUR/jour',plafond:'Par jour déplacement'},
    {id:'sejour',nom:'Séjour/hébergement',icon:'🏨',forfait:'Variable par pays',plafond:'Barème SPF'},
    {id:'bureau',nom:'Fournitures bureau',icon:'📎',forfait:'Sur facture',plafond:'Raisonnable'},
    {id:'telecom',nom:'Télécom',icon:'📱',forfait:'20 EUR/mois',plafond:'Forfait mensuel'},
    {id:'representation',nom:'Représentation',icon:'🤝',forfait:'Sur facture',plafond:'TVA 50% restau'},
    {id:'formation',nom:'Formation',icon:'📚',forfait:'Sur facture',plafond:'100% déductible'},
    {id:'autre',nom:'Autre',icon:'📦',forfait:'Sur justificatif',plafond:'Variable'},
  ];

  const addNote=()=>{if(newNote.desc&&newNote.montant>0){setNotes([...notes,{...newNote,id:Date.now(),status:'en_attente'}]);setNewNote({date:'',desc:'',montant:0,cat:'transport',justif:false})}};
  const total=notes.reduce((a,n)=>a+(+n.montant||0),0);
  const approved=notes.filter(n=>n.status==='approuve').reduce((a,n)=>a+(+n.montant||0),0);
  const pending=notes.filter(n=>n.status==='en_attente').length;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📎 Notes de Frais</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Frais propres employeur — Forfaits ONSS, saisie, approbation, workflow</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Total soumis',v:fmt(total)+' €',c:'#c6a34e'},{l:'Approuvé',v:fmt(approved)+' €',c:'#22c55e'},{l:'En attente',v:pending,c:'#fb923c'},{l:'Notes',v:notes.length,c:'#3b82f6'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'forfaits',l:'💰 Forfaits ONSS'},{v:'saisie',l:'✏ Saisie'},{v:'liste',l:'📋 Liste ('+notes.length+')'},{v:'workflow',l:'✅ Workflow'},{v:'legal',l:'⚖ Règles'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='forfaits'&&<div>
      <C title="Forfaits exonérés ONSS / SPF Finances 2026">
        {[
          {f:'Frais de bureau (télétravail)',v:'157.83 EUR/mois',c:'Min 1j/sem TT régulier',col:'#4ade80',exo:true},
          {f:'Internet domicile',v:'20 EUR/mois',c:'Utilisation pro internet privé',col:'#60a5fa',exo:true},
          {f:'PC/matériel privé',v:'20 EUR/mois',c:'Si usage PC privé pour travail',col:'#a78bfa',exo:true},
          {f:'Téléphone privé',v:'20 EUR/mois',c:'Si usage GSM privé pour travail',col:'#fb923c',exo:true},
          {f:'Indemnité kilométrique',v:'0.4415 EUR/km',c:'Max 24.000 km/an',col:'#c6a34e',exo:true},
          {f:'Per diem Belgique',v:'19.99 EUR/jour',c:'Déplacement professionnel > 5h',col:'#22c55e',exo:true},
          {f:'Per diem étranger',v:'Variable par pays',c:'Barème Affaires étrangères',col:'#3b82f6',exo:true},
          {f:'Vêtements de travail (entretien)',v:'1.91 EUR/jour',c:'Si vêtements prescrits',col:'#06b6d4',exo:true},
          {f:'Garage/parking privé',v:'Montant réel',c:'Si nécessaire pour le travail',col:'#888',exo:false},
        ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div><b style={{color:r.col,fontSize:12}}>{r.f}</b><div style={{fontSize:10,color:'#5e5c56'}}>{r.c}</div></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:r.col,fontWeight:600,fontSize:12}}>{r.v}</span>
            {r.exo&&<Badge text="EXONÉRÉ" color="#22c55e"/>}
          </div>
        </div>)}
      </C>
    </div>}

    {tab==='saisie'&&<C title="✏ Nouvelle note de frais">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        <I label="Date" type="date" value={newNote.date} onChange={v=>setNewNote({...newNote,date:v})}/>
        <I label="Catégorie" value={newNote.cat} onChange={v=>setNewNote({...newNote,cat:v})} options={cats.map(c=>({v:c.id,l:c.icon+' '+c.nom}))}/>
      </div>
      <div style={{marginTop:8}}><I label="Description" value={newNote.desc} onChange={v=>setNewNote({...newNote,desc:v})}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <I label="Montant (EUR)" type="number" value={newNote.montant} onChange={v=>setNewNote({...newNote,montant:v})}/>
        <div style={{display:'flex',alignItems:'flex-end',gap:8,paddingBottom:4}}>
          <div onClick={()=>setNewNote({...newNote,justif:!newNote.justif})} style={{width:18,height:18,borderRadius:4,border:'2px solid '+(newNote.justif?'#4ade80':'#5e5c56'),background:newNote.justif?'rgba(74,222,128,.15)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#4ade80',cursor:'pointer'}}>{newNote.justif?'✓':''}</div>
          <span style={{fontSize:11,color:'#9e9b93'}}>Justificatif disponible</span>
        </div>
      </div>
      <button onClick={addNote} style={{marginTop:12,padding:'10px 24px',borderRadius:8,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>+ Ajouter la note</button>
    </C>}

    {tab==='liste'&&<C title={'📋 Notes de frais — '+notes.length+' entrée(s)'}>
      {notes.length===0?<div style={{textAlign:'center',color:'#888',padding:20}}>Aucune note. Utilisez l'onglet "Saisie" pour en ajouter.</div>:
      <div>{notes.map((n,i)=>{const cat=cats.find(c=>c.id===n.cat);return <div key={n.id} style={{display:'grid',gridTemplateColumns:'80px 30px 1fr 80px 80px 60px',gap:8,alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <span style={{fontSize:10,color:'#888'}}>{n.date||'N/A'}</span>
        <span style={{fontSize:14}}>{cat?.icon||'📦'}</span>
        <span style={{fontSize:11,color:'#e8e6e0'}}>{n.desc}</span>
        <span style={{fontSize:12,fontWeight:600,color:'#c6a34e',textAlign:'right'}}>{fmt(n.montant)} €</span>
        <div>{n.justif?<Badge text="Justif ✓" color="#22c55e"/>:<Badge text="Sans justif" color="#f87171"/>}</div>
        <div style={{display:'flex',gap:4}}>
          <button onClick={()=>setNotes(notes.map((x,j)=>j===i?{...x,status:'approuve'}:x))} style={{padding:'3px 6px',borderRadius:4,border:'none',background:'rgba(34,197,94,.15)',color:'#22c55e',fontSize:9,cursor:'pointer'}}>✓</button>
          <button onClick={()=>setNotes(notes.filter((_,j)=>j!==i))} style={{padding:'3px 6px',borderRadius:4,border:'none',background:'rgba(239,68,68,.15)',color:'#ef4444',fontSize:9,cursor:'pointer'}}>✗</button>
        </div>
      </div>})}</div>}
      {notes.length>0&&<div style={{marginTop:12,paddingTop:10,borderTop:'2px solid rgba(198,163,78,.2)'}}>
        <Row l="Total soumis" v={fmt(total)+' €'} c="#c6a34e" b/>
        <Row l="Approuvé" v={fmt(approved)+' €'} c="#22c55e"/>
        <Row l="En attente" v={fmt(total-approved)+' €'} c="#fb923c"/>
      </div>}
    </C>}

    {tab==='workflow'&&<C title="✅ Workflow d'approbation">
      {[
        {n:1,t:'Saisie par le travailleur',d:'Le travailleur encode sa note (date, description, montant, catégorie). Joint le justificatif si disponible.',status:'Travailleur'},
        {n:2,t:'Validation responsable',d:'Le manager vérifie la pertinence professionnelle et le montant. Approuve, refuse ou demande complément.',status:'Manager'},
        {n:3,t:'Vérification comptable',d:'Le service comptable vérifie: forfait ONSS respecté, TVA correcte, pas de double soumission.',status:'Comptabilité'},
        {n:4,t:'Approbation finale',d:'La direction approuve les montants supérieurs au seuil défini (ex: > 500 EUR).',status:'Direction'},
        {n:5,t:'Remboursement',d:'Versement sur le salaire (ligne séparée "frais propres") ou par virement distinct.',status:'Payroll'},
        {n:6,t:'Archivage',d:'Conservation des justificatifs pendant 7 ans (obligation comptable + fiscale).',status:'Archive'},
      ].map((r,i)=><div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(198,163,78,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#c6a34e',flexShrink:0}}>{r.n}</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.t}</div><div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div></div>
        <Badge text={r.status} color="#3b82f6"/>
      </div>)}
    </C>}

    {tab==='legal'&&<C title="⚖ Règles ONSS — Frais propres employeur">
      {[
        {t:'Forfait vs réel',d:'Les deux méthodes sont acceptées. Forfait = sans justificatif (montants ONSS). Réel = sur facture/ticket.'},
        {t:'Pas de cumul même frais',d:'Impossible de combiner forfait + réel pour les MÊMES frais. Possible pour frais DIFFÉRENTS.'},
        {t:'Politique écrite',d:'Recommandé: policy notes de frais dans le règlement de travail ou annexe.'},
        {t:'Risque requalification',d:'Si forfaits excessifs ou sans lien professionnel → ONSS peut requalifier en rémunération imposable.'},
        {t:'TVA restaurants',d:'TVA récupérable à 50% uniquement sur les frais de restaurant professionnels.'},
        {t:'Archivage 7 ans',d:'Obligation de conservation des justificatifs: 7 ans (Code des sociétés + Code fiscal).'},
        {t:'Frais de représentation',d:'Cadeaux d\'affaires ≤ 50 EUR/personne/an: déductibles. Au-delà: limite.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// COMPOSANT 10: CHÈQUES-REPAS V2
// ════════════════════════════════════════════════════════════
export function CheqRepasV2({s}){
  const emps=(s?.clients||[]).flatMap(c=>c.emps||[]);
  const [valFaciale,setValFaciale]=useState(8);
  const [partPatron,setPartPatron]=useState(6.91);
  const [joursPrestes,setJoursPrestes]=useState(220);
  const [regime,setRegime]=useState(100);
  const [cp,setCp]=useState('200');
  const [tab,setTab]=useState('simu');
  const cpData={
    '200':{nom:'CP 200 — Employés',valMax:8,patronMax:6.91,note:'CCT sectorielle — max 8 EUR'},
    '118':{nom:'CP 118 — Alimentaire',valMax:7,patronMax:5.50,note:'CCT CP 118 — max 7 EUR, patron 5.50'},
    '119':{nom:'CP 119 — Commerce alim.',valMax:7,patronMax:5.00,note:'CCT CP 119 — max 7 EUR, patron 5.00'},
    '302':{nom:'CP 302 — Horeca',valMax:8,patronMax:6.91,note:'Uniquement si PAS de repas en nature'},
    '124':{nom:'CP 124 — Construction',valMax:7,patronMax:5.91,note:'CCT CP 124'},
    '330':{nom:'CP 330 — Santé',valMax:7,patronMax:5.91,note:'CCT CP 330'},
    '111':{nom:'CP 111 — Métal',valMax:8,patronMax:6.91,note:'CCT CP 111'},
    '140':{nom:'CP 140 — Transport',valMax:8,patronMax:6.91,note:'Non cumulable avec per diem même jour'},
    '121':{nom:'CP 121 — Nettoyage',valMax:7,patronMax:5.50,note:'CCT CP 121'},
  };
  const cpInfo=cpData[cp]||{nom:'Autre CP',valMax:8,patronMax:6.91,note:'Max légal 8 EUR'};
  const vf=Math.min(+valFaciale||8,8);const pp=Math.min(+partPatron||6.91,6.91);const pw=Math.max(vf-pp,1.09);
  const fTP=(+regime||100)/100;const j=Math.round((+joursPrestes||220)*fTP);
  const coutPatronAn=pp*j;const retenueTravAn=pw*j;const avantageNetAn=vf*j;const n=emps.length||1;
  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🍽 Chèques-Repas</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>AR 28/11/1969 — Calcul détaillé, prorata temps partiel, spécificités par CP</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Valeur faciale',v:fmt(vf)+' €',c:'#c6a34e'},{l:'Part patronale',v:fmt(pp)+' €',c:'#22c55e'},{l:'Jours éligibles',v:fi(j)+' j',c:'#3b82f6'},{l:'Avantage net/an',v:fmt(avantageNetAn)+' €',c:'#4ade80'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>
    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'simu',l:'🧮 Simulateur'},{v:'conditions',l:'📋 Conditions exonération'},{v:'compare',l:'⚖️ Comparatif vs brut'},{v:'legal',l:'📜 Base légale'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>
    {tab==='simu'&&<div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <C title="Paramètres">
        <I label="Valeur faciale (EUR)" type="number" value={valFaciale} onChange={setValFaciale}/>
        {vf>8&&<div style={{fontSize:10,color:'#f87171',marginTop:2}}>⚠ Max légal: 8.00 EUR</div>}
        <div style={{marginTop:8}}><I label="Part patronale (EUR)" type="number" value={partPatron} onChange={setPartPatron}/></div>
        {pp>6.91&&<div style={{fontSize:10,color:'#f87171',marginTop:2}}>⚠ Max exonéré: 6.91 EUR</div>}
        <div style={{marginTop:8}}><I label="Jours prestés/an (base TP)" type="number" value={joursPrestes} onChange={setJoursPrestes}/></div>
        <div style={{marginTop:8}}><I label="Régime horaire %" type="number" value={regime} onChange={setRegime}/></div>
        <div style={{marginTop:8}}><I label="Commission paritaire" value={cp} onChange={setCp} options={Object.entries(cpData).map(([k,v])=>({v:k,l:v.nom}))}/></div>
        <div style={{marginTop:10,padding:8,background:'rgba(34,197,94,.06)',borderRadius:6,fontSize:10,color:'#22c55e'}}>{cpInfo.note}</div>
      </C>
      <div>
        <C title="Décomposition annuelle">
          <Row l="Valeur faciale" v={fmt(vf)+' €/jour'}/>
          <Row l="Part patronale (exonérée)" v={fmt(pp)+' €/jour'} c="#22c55e"/>
          <Row l="Part travailleur (retenue salaire)" v={fmt(pw)+' €/jour'} c="#fb923c"/>
          <Row l="Jours éligibles (après prorata TP)" v={fi(j)+' jours'}/>
          <Row l="Avantage brut/an" v={fmt(avantageNetAn)+' €'} b/>
          <Row l="Coût patronal annuel" v={fmt(coutPatronAn)+' €'} c="#c6a34e"/>
          <Row l="Retenue travailleur/an" v={fmt(retenueTravAn)+' €'} c="#fb923c"/>
          <Row l="ONSS" v="0.00 € (exonéré)" c="#22c55e"/>
          <Row l="PP" v="0.00 € (exonéré)" c="#22c55e"/>
          <Row l="NET travailleur/an" v={fmt(avantageNetAn-retenueTravAn)+' €'} c="#4ade80" b/>
        </C>
        <C title="Coût mensuel">
          <Row l="Coût patronal/mois" v={fmt(coutPatronAn/12)+' €/mois'} c="#c6a34e"/>
          <Row l="Retenue travailleur/mois" v={fmt(retenueTravAn/12)+' €/mois'} c="#fb923c"/>
        </C>
        {n>1&&<C title={'Impact total — '+n+' travailleur(s)'}>
          <Row l="Budget patronal total/an" v={fmt(coutPatronAn*n)+' €'} c="#c6a34e" b/>
          <Row l="Budget patronal total/mois" v={fmt(coutPatronAn*n/12)+' €'}/>
        </C>}
      </div>
    </div>}
    {tab==='conditions'&&<C title="Conditions d'exonération ONSS + IPP" color="#22c55e">
      {[
        {t:'1 chèque par jour presté',d:'Un seul chèque par jour effectivement travaillé. Pas pour maladie, vacances, absence.'},
        {t:'Valeur faciale max 8.00 EUR',d:'Si dépassement: totalité requalifiée en rémunération soumise ONSS + PP.'},
        {t:'Part patronale max 6.91 EUR',d:'Au-delà: requalification en rémunération pour l\'excédent.'},
        {t:'Part travailleur min 1.09 EUR',d:'Retenue obligatoire sur salaire net. Si < 1.09: requalification.'},
        {t:'Nominatif',d:'Au nom du travailleur. Non cessible.'},
        {t:'Support électronique obligatoire',d:'Depuis 01/01/2022. Plus de chèques papier.'},
        {t:'Validité 12 mois',d:'Utilisable 12 mois à compter de la mise à disposition.'},
        {t:'Émetteur agréé',d:'Sodexo, Edenred, Monizze uniquement.'},
        {t:'Non cumulable',d:'Pas cumulable avec indemnité de repas forfaitaire le même jour.'},
        {t:'Pas en remplacement de salaire',d:'Ne peut pas se substituer à une rémunération existante (non-conversion).'},
        {t:'Jours assimilés',d:'Petit chômage, formation, repos compensatoire = éligibles. Maladie, vacances = NON éligibles.'},
      ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#22c55e'}}>{r.t}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
      <div style={{marginTop:12,padding:10,background:'rgba(239,68,68,.06)',borderRadius:8,border:'1px solid rgba(239,68,68,.15)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'#ef4444'}}>⚠ Requalification</div>
        <div style={{fontSize:10,color:'#ccc',marginTop:4}}>Si UNE SEULE condition non remplie → ONSS requalifie en rémunération → rappel ONSS 13.07% + 25.07% + PP sur la totalité.</div>
      </div>
    </C>}
    {tab==='compare'&&<div>
      <C title="Comparatif: Chèques-repas vs salaire brut (même coût employeur)" color="#3b82f6">
        {(()=>{const coutEmp=coutPatronAn;const brutEq=coutEmp/(1+TX_ONSS_E);const netBrut=brutEq-brutEq*TX_ONSS_W-quickPP(brutEq/12)*12;const netCR=avantageNetAn-retenueTravAn;
        return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{padding:16,background:'rgba(34,197,94,.05)',borderRadius:10,border:'1px solid rgba(34,197,94,.15)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#22c55e',marginBottom:10}}>🍽 Chèques-repas</div>
            <Row l="Coût employeur" v={fmt(coutEmp)+' €/an'}/>
            <Row l="Avantage net travailleur" v={fmt(netCR)+' €/an'} c="#4ade80" b/>
            <Row l="ONSS" v="0 €" c="#22c55e"/>
            <Row l="PP" v="0 €" c="#22c55e"/>
          </div>
          <div style={{padding:16,background:'rgba(248,113,113,.05)',borderRadius:10,border:'1px solid rgba(248,113,113,.15)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#f87171',marginBottom:10}}>💶 Salaire brut équivalent</div>
            <Row l="Coût employeur (identique)" v={fmt(coutEmp)+' €/an'}/>
            <Row l="Brut avant ONSS" v={fmt(brutEq)+' €/an'}/>
            <Row l="Net travailleur" v={fmt(netBrut)+' €/an'} c="#4ade80" b/>
          </div>
        </div>})()}
        <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#c6a34e',textAlign:'center'}}>
          Gain net via chèques-repas: <b style={{color:'#4ade80'}}>+{fmt((avantageNetAn-retenueTravAn)-(coutPatronAn/(1+TX_ONSS_E)-coutPatronAn/(1+TX_ONSS_E)*TX_ONSS_W-quickPP(coutPatronAn/(1+TX_ONSS_E)/12)*12))} €/an</b> pour le même coût employeur
        </div>
      </C>
    </div>}
    {tab==='legal'&&<C title="Base légale — Chèques-repas">
      {[
        {t:'AR 28/11/1969, Art. 19bis',d:'Exonération ONSS si toutes conditions remplies (faciale, patronale, travailleur, nominatif, 1/jour presté).'},
        {t:'Art. 38/1 §2 CIR 1992',d:'Exonération IPP sous mêmes conditions.'},
        {t:'CCT sectorielle',d:'Octroi prévu par CCT sectorielle (CP 200, 118, etc.) ou CCT d\'entreprise.'},
        {t:'Loi 08/06/2008',d:'Introduction chèques électroniques. Obligation support électronique depuis 2022.'},
        {t:'Déductibilité employeur',d:'Part patronale = charge déductible ISOC. TVA non récupérable.'},
        {t:'Jours assimilés',d:'Petit chômage, formation, repos compensatoire = éligibles. Maladie/vacances = NON.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}


export default function PrimesAvantagesTabbed({ s, d, tab }) { return <PrimeCalculatorV2 s={s||{}} d={d||(()=>{})} props_tab={tab}/> }
