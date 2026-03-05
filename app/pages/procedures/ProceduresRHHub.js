'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const SECTIONS=[
  {id:'embauche',titre:'EMBAUCHE & MISE À L\'EMPLOI',icon:'🤝',color:'#3b82f6',procs:[
    {id:'premier_engagement',icon:'🥇',titre:'Premier engagement',steps:12,resume:'Checklist complète du 1er travailleur'},
    {id:'activa',icon:'💼',titre:'Plan Activa',steps:14,resume:'Réductions ONSS demandeurs d\'emploi'},
    {id:'article60',icon:'🏛️',titre:'Article 60 CPAS',steps:8,resume:'Mise à l\'emploi via CPAS'},
    {id:'etudiant',icon:'🎓',titre:'Étudiant 600h',steps:8,resume:'Cotisations réduites étudiants'},
    {id:'flexijob',icon:'⚡',titre:'Flexi-job',steps:8,resume:'Emploi flexible horeca/commerce'},
    {id:'interimaire',icon:'👷',titre:'Intérimaire',steps:8,resume:'Travail temporaire via agence'},
    {id:'alternance',icon:'📚',titre:'Alternance',steps:8,resume:'Formation en alternance jeunes'},
    {id:'handicape',icon:'♿',titre:'Travailleur handicapé',steps:8,resume:'Aides et adaptations PMR'},
  ]},
  {id:'regimes',titre:'RÉGIMES DE TRAVAIL',icon:'⏰',color:'#8b5cf6',procs:[
    {id:'temps_partiel',icon:'⏰',titre:'Temps partiel',steps:8,resume:'Contrat et obligations TP'},
    {id:'mi_temps_therapeutique',icon:'🏥',titre:'Mi-temps thérapeutique',steps:8,resume:'Reprise progressive après maladie'},
    {id:'credit_temps',icon:'🕐',titre:'Crédit-temps',steps:6,resume:'Réduction carrière avec allocations'},
    {id:'ct_fin_carriere',icon:'🧓',titre:'CT fin de carrière 55+',steps:6,resume:'Réduction temps fin de carrière'},
    {id:'conge_parental',icon:'👶',titre:'Congé parental',steps:6,resume:'4 mois/enfant avec allocations'},
  ]},
  {id:'licenciement',titre:'LICENCIEMENT & FIN DE CONTRAT',icon:'🔚',color:'#ef4444',procs:[
    {id:'licenciement_preavis',icon:'📨',titre:'Licenciement avec préavis',steps:8,resume:'Préavis, CCT 109, outplacement'},
    {id:'motif_grave',icon:'🔴',titre:'Motif grave',steps:4,resume:'Délai 3 jours, charge preuve'},
    {id:'commun_accord',icon:'🤝',titre:'Rupture commun accord',steps:3,resume:'Convention négociée'},
    {id:'demission',icon:'🚪',titre:'Démission',steps:4,resume:'Préavis réduit max 13 semaines'},
    {id:'fin_cdd',icon:'📅',titre:'Fin CDD / Remplacement',steps:4,resume:'Échéance, renouvellement, CDI'},
  ]},
  {id:'absences',titre:'ABSENCES & CONGÉS',icon:'🏥',color:'#f97316',procs:[
    {id:'maladie',icon:'🤒',titre:'Maladie / Incapacité',steps:6,resume:'Salaire garanti 30j, mutuelle'},
    {id:'accident_travail',icon:'⚠️',titre:'Accident du travail',steps:4,resume:'Déclaration 8j, soins 100%'},
    {id:'maternite',icon:'🤰',titre:'Congé maternité',steps:4,resume:'15 semaines, protection absolue'},
    {id:'paternite',icon:'👨‍👧',titre:'Congé paternité',steps:3,resume:'20 jours, 3j employeur + 17j mutuelle'},
    {id:'petit_chomage',icon:'📝',titre:'Petit chômage',steps:2,resume:'Événements familiaux, 100% payé'},
  ]},
  {id:'legal',titre:'OBLIGATIONS LÉGALES & ADMIN',icon:'⚖️',color:'#06b6d4',procs:[
    {id:'reglement_travail',icon:'📖',titre:'Règlement de travail',steps:3,resume:'Document obligatoire, publicité 15j'},
    {id:'document_social',icon:'📂',titre:'Documents sociaux',steps:4,resume:'DIMONA, DmfA, fiches de paie, 281.10'},
    {id:'assurances',icon:'🛡️',titre:'Assurances obligatoires',steps:3,resume:'AT, SEPP, RC, groupe, hospitalisation'},
    {id:'indexation',icon:'📈',titre:'Indexation salariale',steps:2,resume:'Adaptation auto à l\'indice des prix'},
    {id:'jours_feries',icon:'🎉',titre:'Jours fériés (10j)',steps:2,resume:'Remplacement, sursalaire, affichage'},
  ]},
  {id:'remuneration',titre:'RÉMUNÉRATION & AVANTAGES',icon:'💰',color:'#22c55e',procs:[
    {id:'cheques_repas',icon:'🍽️',titre:'Chèques-repas',steps:3,resume:'Max 8€/j, exonéré ONSS/PP'},
    {id:'ecocheques',icon:'🌿',titre:'Écochèques',steps:2,resume:'Max 250€/an, achats écologiques'},
    {id:'bonus_cct90',icon:'🎯',titre:'Bonus CCT 90',steps:2,resume:'Prime collective, 33% cotisation'},
    {id:'voiture_societe',icon:'🚗',titre:'Voiture de société',steps:2,resume:'ATN, cotisation CO₂, budget mobilité'},
    {id:'frais_propres',icon:'💰',titre:'Frais propres employeur',steps:2,resume:'Bureau 154,74€, km 0,4415€'},
  ]},
  {id:'bienetre',titre:'BIEN-ÊTRE & PRÉVENTION',icon:'🧘',color:'#ec4899',procs:[
    {id:'harcelement',icon:'🛑',titre:'Harcèlement & psychosociaux',steps:3,resume:'Prévention, procédure, protection 12 mois'},
    {id:'plan_prevention',icon:'🔬',titre:'Plan de prévention',steps:2,resume:'Plan global 5 ans + PAA annuel'},
    {id:'deconnexion',icon:'📵',titre:'Droit à la déconnexion',steps:2,resume:'Obligatoire ≥20 travailleurs depuis 2023'},
    {id:'teletravail',icon:'🏠',titre:'Télétravail',steps:2,resume:'Structurel CCT 85, indemnité bureau'},
    {id:'alcool_drogues',icon:'🚫',titre:'Alcool & drogues CCT 100',steps:2,resume:'Politique préventive 4 phases'},
  ]},
  {id:'formation',titre:'FORMATION & RELATIONS COLLECTIVES',icon:'🎓',color:'#f59e0b',procs:[
    {id:'formation_obligatoire',icon:'🎓',titre:'Formation obligatoire (5j/an)',steps:2,resume:'Deal pour l\'emploi, FLA, plan annuel'},
    {id:'elections_sociales',icon:'🗳️',titre:'Élections sociales (CE/CPPT)',steps:3,resume:'Tous les 4 ans, protection candidats'},
    {id:'delegation_syndicale',icon:'✊',titre:'Délégation syndicale',steps:2,resume:'CCT n°5, protection, crédit heures'},
    {id:'rgpd',icon:'🔒',titre:'RGPD au travail',steps:2,resume:'Données RH, caméras, emails, amendes 4% CA'},
    {id:'inspection_sociale',icon:'🔎',titre:'Inspection sociale',steps:2,resume:'4 services, pouvoirs, amendes ×8 décimes'},
  ]},
  {id:'special',titre:'SITUATIONS SPÉCIALES',icon:'⚡',color:'#6366f1',procs:[
    {id:'licenciement_collectif',icon:'📉',titre:'Licenciement collectif (Renault)',steps:2,resume:'Loi Renault, plan social, cellule emploi'},
    {id:'faillite',icon:'💥',titre:'Faillite & fermeture',steps:2,resume:'FFE, créances privilégiées, PRJ'},
    {id:'detachement',icon:'🌍',titre:'Détachement international',steps:2,resume:'A1, LIMOSA, 24 mois max'},
    {id:'non_concurrence',icon:'🚷',titre:'Clause non-concurrence',steps:2,resume:'Salaire >43.335€, indemnité 50%, 12 mois max'},
    {id:'travailleur_etranger',icon:'🛂',titre:'Travailleur étranger — Permis unique',steps:2,resume:'Single permit, UE libre, hors UE = permis'},
  ]},
  {id:'protection',titre:'PENSION & PROTECTION SOCIALE',icon:'🏖️',color:'#14b8a6',procs:[
    {id:'pension',icon:'🏖️',titre:'Pension légale & retraite',steps:2,resume:'66 ans (67 dès 2030), anticipée 63+42 ans'},
    {id:'rcc',icon:'🧓',titre:'RCC (ex-prépension)',steps:2,resume:'62+ ans, complément employeur, cotisations'},
    {id:'chomage_temporaire',icon:'⏸️',titre:'Chômage temporaire',steps:2,resume:'Économique, force majeure, 65% salaire'},
    {id:'vacances_annuelles',icon:'🌴',titre:'Vacances annuelles',steps:2,resume:'20j/an, exercice N-1, pas de report'},
    {id:'pecule_vacances',icon:'💶',titre:'Pécule de vacances',steps:2,resume:'Simple + double, 92% brut, caisse ouvriers'},
  ]},
  {id:'complements',titre:'COMPLÉMENTS ESSENTIELS',icon:'📌',color:'#f43f5e',procs:[
    {id:'heures_supp',icon:'🏋️',titre:'Heures supplémentaires & sursalaire',steps:2,resume:'+50% semaine, +100% dimanche, repos compensatoire'},
    {id:'conge_adoption',icon:'👨‍👩‍👧',titre:'Congé d\'adoption',steps:2,resume:'6 sem/parent, 3j employeur + mutuelle 82%'},
    {id:'conge_deuil',icon:'😢',titre:'Congé de deuil (10 jours)',steps:2,resume:'Conjoint/enfant, 3j + 7j mutuelle, flexible 1 an'},
    {id:'prime_fin_annee',icon:'💸',titre:'Prime de fin d\'année (13e mois)',steps:2,resume:'CCT sectorielle, prorata, PP spécial 35-40%'},
    {id:'clause_ecolage',icon:'🎓',titre:'Clause d\'écolage',steps:2,resume:'Salaire >43.335€, formation 80h+, max 3 ans'},
  ]},
  {id:'juridique',titre:'CADRE JURIDIQUE AVANCÉ',icon:'🏛️',color:'#a855f7',procs:[
    {id:'travail_nuit',icon:'🌙',titre:'Travail de nuit & dimanche',steps:2,resume:'Interdit sauf exceptions, sursalaire, surveillance'},
    {id:'conge_aidant',icon:'🧑‍🤝‍🧑',titre:'Congé d\'aidant proche',steps:2,resume:'5j/an, non rémunéré, protection 6 mois salaire'},
    {id:'lanceurs_alerte',icon:'🚨',titre:'Lanceurs d\'alerte (2023)',steps:2,resume:'Canal obligatoire ≥50, protection absolue'},
    {id:'discrimination',icon:'⚖️',titre:'Discrimination & égalité',steps:2,resume:'19 critères, 6 mois indemnité, écart H/F'},
    {id:'transfert_entreprise',icon:'🔄',titre:'Transfert d\'entreprise CCT 32bis',steps:2,resume:'Transfert auto contrats, solidarité 1 an'},
  ]},
];

const COMP_MAP={
  premier_engagement:dynamic(()=>import('./ProceduresRH_PremierEngagement'),{ssr:false}),
  activa:dynamic(()=>import('./ProceduresRH_Activa'),{ssr:false}),
  article60:dynamic(()=>import('./ProceduresRH_Art60'),{ssr:false}),
  etudiant:dynamic(()=>import('./ProceduresRH_Etudiant'),{ssr:false}),
  flexijob:dynamic(()=>import('./ProceduresRH_FlexiJob'),{ssr:false}),
  interimaire:dynamic(()=>import('./ProceduresRH_Interimaire'),{ssr:false}),
  alternance:dynamic(()=>import('./ProceduresRH_Alternance'),{ssr:false}),
  handicape:dynamic(()=>import('./ProceduresRH_Handicap'),{ssr:false}),
  temps_partiel:dynamic(()=>import('./ProceduresRH_TempsPartiel'),{ssr:false}),
  mi_temps_therapeutique:dynamic(()=>import('./ProceduresRH_MiTempsTherapeutique'),{ssr:false}),
  credit_temps:dynamic(()=>import('./ProceduresRH_CreditTemps'),{ssr:false}),
  ct_fin_carriere:dynamic(()=>import('./ProceduresRH_CreditTempsFinCarriere'),{ssr:false}),
  conge_parental:dynamic(()=>import('./ProceduresRH_CongeParental'),{ssr:false}),
  licenciement_preavis:dynamic(()=>import('./ProceduresRH_LicenciementPreavis'),{ssr:false}),
  motif_grave:dynamic(()=>import('./ProceduresRH_MotifGrave'),{ssr:false}),
  commun_accord:dynamic(()=>import('./ProceduresRH_RuptureCommunAccord'),{ssr:false}),
  demission:dynamic(()=>import('./ProceduresRH_Demission'),{ssr:false}),
  fin_cdd:dynamic(()=>import('./ProceduresRH_FinCDD'),{ssr:false}),
  maladie:dynamic(()=>import('./ProceduresRH_Maladie'),{ssr:false}),
  accident_travail:dynamic(()=>import('./ProceduresRH_AccidentTravail'),{ssr:false}),
  maternite:dynamic(()=>import('./ProceduresRH_Maternite'),{ssr:false}),
  paternite:dynamic(()=>import('./ProceduresRH_Paternite'),{ssr:false}),
  petit_chomage:dynamic(()=>import('./ProceduresRH_PetitChomage'),{ssr:false}),
  reglement_travail:dynamic(()=>import('./ProceduresRH_ReglementTravail'),{ssr:false}),
  document_social:dynamic(()=>import('./ProceduresRH_DocumentSocial'),{ssr:false}),
  assurances:dynamic(()=>import('./ProceduresRH_Assurances'),{ssr:false}),
  indexation:dynamic(()=>import('./ProceduresRH_Indexation'),{ssr:false}),
  jours_feries:dynamic(()=>import('./ProceduresRH_JoursFeries'),{ssr:false}),
  cheques_repas:dynamic(()=>import('./ProceduresRH_ChequesRepas'),{ssr:false}),
  ecocheques:dynamic(()=>import('./ProceduresRH_Ecocheques'),{ssr:false}),
  bonus_cct90:dynamic(()=>import('./ProceduresRH_BonusCCT90'),{ssr:false}),
  voiture_societe:dynamic(()=>import('./ProceduresRH_VoitureSociete'),{ssr:false}),
  frais_propres:dynamic(()=>import('./ProceduresRH_FraisPropres'),{ssr:false}),
  harcelement:dynamic(()=>import('./ProceduresRH_Harcelement'),{ssr:false}),
  plan_prevention:dynamic(()=>import('./ProceduresRH_PlanPrevention'),{ssr:false}),
  deconnexion:dynamic(()=>import('./ProceduresRH_Deconnexion'),{ssr:false}),
  teletravail:dynamic(()=>import('./ProceduresRH_Teletravail'),{ssr:false}),
  alcool_drogues:dynamic(()=>import('./ProceduresRH_AlcoolDrogues'),{ssr:false}),
  formation_obligatoire:dynamic(()=>import('./ProceduresRH_Formation'),{ssr:false}),
  elections_sociales:dynamic(()=>import('./ProceduresRH_ElectionsSociales'),{ssr:false}),
  delegation_syndicale:dynamic(()=>import('./ProceduresRH_DelegationSyndicale'),{ssr:false}),
  rgpd:dynamic(()=>import('./ProceduresRH_RGPD'),{ssr:false}),
  inspection_sociale:dynamic(()=>import('./ProceduresRH_InspectionSociale'),{ssr:false}),
  licenciement_collectif:dynamic(()=>import('./ProceduresRH_LicenciementCollectif'),{ssr:false}),
  faillite:dynamic(()=>import('./ProceduresRH_Faillite'),{ssr:false}),
  detachement:dynamic(()=>import('./ProceduresRH_Detachement'),{ssr:false}),
  non_concurrence:dynamic(()=>import('./ProceduresRH_NonConcurrence'),{ssr:false}),
  travailleur_etranger:dynamic(()=>import('./ProceduresRH_TravailleurEtranger'),{ssr:false}),
  pension:dynamic(()=>import('./ProceduresRH_Pension'),{ssr:false}),
  rcc:dynamic(()=>import('./ProceduresRH_RCC'),{ssr:false}),
  chomage_temporaire:dynamic(()=>import('./ProceduresRH_ChomageTemporaire'),{ssr:false}),
  vacances_annuelles:dynamic(()=>import('./ProceduresRH_VacancesAnnuelles'),{ssr:false}),
  pecule_vacances:dynamic(()=>import('./ProceduresRH_PeculeVacances'),{ssr:false}),
  heures_supp:dynamic(()=>import('./ProceduresRH_HeuresSupp'),{ssr:false}),
  conge_adoption:dynamic(()=>import('./ProceduresRH_CongeAdoption'),{ssr:false}),
  conge_deuil:dynamic(()=>import('./ProceduresRH_CongeDeuil'),{ssr:false}),
  prime_fin_annee:dynamic(()=>import('./ProceduresRH_PrimeFinAnnee'),{ssr:false}),
  clause_ecolage:dynamic(()=>import('./ProceduresRH_ClauseEcolage'),{ssr:false}),
  travail_nuit:dynamic(()=>import('./ProceduresRH_TravailNuit'),{ssr:false}),
  conge_aidant:dynamic(()=>import('./ProceduresRH_CongeAidant'),{ssr:false}),
  lanceurs_alerte:dynamic(()=>import('./ProceduresRH_LanceursAlerte'),{ssr:false}),
  discrimination:dynamic(()=>import('./ProceduresRH_Discrimination'),{ssr:false}),
  transfert_entreprise:dynamic(()=>import('./ProceduresRH_TransfertEntreprise'),{ssr:false}),
};

export default function ProceduresRHHub(){
  const[sel,setSel]=useState(null);
  const[search,setSearch]=useState('');

  const stats=useMemo(()=>{
    let tp=0,ts=0;
    SECTIONS.forEach(s=>s.procs.forEach(p=>{tp++;ts+=p.steps}));
    return{tp,ts};
  },[]);

  const filtered=useMemo(()=>{
    if(!search.trim())return SECTIONS;
    const q=search.toLowerCase();
    return SECTIONS.map(s=>({...s,procs:s.procs.filter(p=>p.titre.toLowerCase().includes(q)||p.resume.toLowerCase().includes(q)||p.id.includes(q))})).filter(s=>s.procs.length>0);
  },[search]);

  if(sel){
    const Comp=COMP_MAP[sel];
    return(<div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',minHeight:'100vh'}}>
      <button onClick={()=>setSel(null)} style={{background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:16,display:'flex',alignItems:'center',gap:6}}>← Retour aux procédures</button>
      {Comp?<Comp/>:<div style={{color:'#ef4444',padding:40,textAlign:'center'}}>Module en cours de développement</div>}
    </div>);
  }

  const s={
    pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:1200,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},
    hd:{textAlign:'center',marginBottom:32},
    ti:{fontSize:32,fontWeight:800,color:'#f8fafc',margin:0},
    su:{fontSize:15,color:'#94a3b8',marginTop:8},
    sb:{display:'flex',justifyContent:'center',gap:12,marginTop:16,flexWrap:'wrap'},
    badge:{padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:600},
    sr:{maxWidth:500,margin:'0 auto 32px',position:'relative'},
    si:{width:'100%',padding:'12px 16px 12px 40px',borderRadius:12,border:'1px solid #334155',background:'#111827',color:'#f1f5f9',fontSize:14,outline:'none'},
    sc:{position:'absolute',left:14,top:13,color:'#64748b',fontSize:16,pointerEvents:'none'},
    st:{fontSize:22,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:10},
    gr:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12,marginBottom:40},
    cd:c=>({background:'#111827',border:`1px solid ${c}30`,borderRadius:12,padding:16,cursor:'pointer',transition:'all .2s',borderLeft:`4px solid ${c}`}),
    ci:{fontSize:28,marginBottom:8},
    ct:{fontSize:15,fontWeight:600,color:'#f1f5f9',marginBottom:4},
    cr:{fontSize:12,color:'#94a3b8',lineHeight:1.5},
    cf:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12},
    cs:{fontSize:11,padding:'3px 8px',borderRadius:8,fontWeight:600},
  };

  return(<div style={s.pg}>
    <div style={s.hd}>
      <h1 style={s.ti}>📋 Procédures RH</h1>
      <p style={s.su}>Guide complet A-Z du droit social belge</p>
      <div style={s.sb}>
        <span style={{...s.badge,background:'#3b82f620',color:'#60a5fa'}}>{stats.tp} procédures</span>
        <span style={{...s.badge,background:'#22c55e20',color:'#4ade80'}}>{stats.ts} étapes</span>
        <span style={{...s.badge,background:'#8b5cf620',color:'#a78bfa'}}>{SECTIONS.length} sections</span>
      </div>
    </div>

    <div style={s.sr}>
      <span style={s.sc}>🔍</span>
      <input style={s.si} placeholder="Rechercher une procédure..." value={search} onChange={e=>setSearch(e.target.value)}/>
    </div>

    {filtered.map(sec=>(
      <div key={sec.id}>
        <div style={{...s.st,color:sec.color}}>{sec.icon} {sec.titre} <span style={{fontSize:13,color:'#64748b',fontWeight:400}}>({sec.procs.length})</span></div>
        <div style={s.gr}>
          {sec.procs.map(p=>(
            <div key={p.id} style={s.cd(sec.color)} onClick={()=>setSel(p.id)}
              onMouseEnter={e=>{e.currentTarget.style.background=`${sec.color}10`;e.currentTarget.style.borderColor=`${sec.color}60`}}
              onMouseLeave={e=>{e.currentTarget.style.background='#111827';e.currentTarget.style.borderColor=`${sec.color}30`}}>
              <div style={s.ci}>{p.icon}</div>
              <div style={s.ct}>{p.titre}</div>
              <div style={s.cr}>{p.resume}</div>
              <div style={s.cf}>
                <span style={{...s.cs,background:`${sec.color}20`,color:sec.color}}>{p.steps} étapes</span>
                <span style={{...s.cs,background:'#22c55e20',color:'#4ade80'}}>✅ Complet</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>);
}
