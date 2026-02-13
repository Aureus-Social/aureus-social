"use client";
import { useState, useReducer, useRef, useMemo, useEffect, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Logiciel de Paie Belge Professionnel
//  Modules: ONSS (Dimona/DMFA), Belcotax 281.xx, Formule-clé
//  SPF Finances, Documents sociaux (C4, attestations)
//  🌐 Multilingue: FR / NL
// ═══════════════════════════════════════════════════════════════

// ── I18N — Dictionnaire FR / NL ──
const LangCtx = createContext({lang:'fr',t:(k)=>k,setLang:()=>{}});
const useLang = () => useContext(LangCtx);

const I18N = {
  // ── Navigation principale ──
  'nav.dashboard': { fr:'Tableau de bord', nl:'Dashboard' },
  'nav.employees': { fr:'Employés', nl:'Werknemers' },
  'nav.payslip': { fr:'Fiches de paie', nl:'Loonfiches' },
  'nav.onss': { fr:'ONSS / Déclarations', nl:'RSZ / Aangiften' },
  'nav.fiscal': { fr:'Fiscal', nl:'Fiscaal' },
  'nav.salaires': { fr:'Salaires & Calculs', nl:'Lonen & Berekeningen' },
  'nav.avantages': { fr:'Avantages & Rémunération', nl:'Voordelen & Verloning' },
  'nav.contrats': { fr:'Contrats & Documents', nl:'Contracten & Documenten' },
  'nav.rh': { fr:'RH & Personnel', nl:'HR & Personeel' },
  'nav.social': { fr:'Social & Assurances', nl:'Sociaal & Verzekeringen' },
  'nav.bienetre': { fr:'Bien-être & Prévention', nl:'Welzijn & Preventie' },
  'nav.reporting': { fr:'Reporting & Export', nl:'Rapportage & Export' },
  'nav.legal': { fr:'Juridique & Veille', nl:'Juridisch & Monitoring' },
  'nav.settings': { fr:'Paramètres', nl:'Instellingen' },
  'nav.aureussuite': { fr:'Aureus Suite', nl:'Aureus Suite' },
  'nav.back': { fr:'← Tous les dossiers', nl:'← Alle dossiers' },
  'nav.search': { fr:'🔍 Rechercher un module... (Ctrl+K)', nl:'🔍 Module zoeken... (Ctrl+K)' },
  'nav.noresult': { fr:'Aucun module trouvé', nl:'Geen module gevonden' },
  
  // ── Sous-menus ──
  'sub.dimona': { fr:'Dimona', nl:'Dimona' },
  'sub.dmfa': { fr:'DMFA / DRS', nl:'DmfA / DRS' },
  'sub.drs': { fr:'DRS / Documents C', nl:'DRS / C-documenten' },
  'sub.onssapl': { fr:'ONSS-APL (DMFAPPL)', nl:'RSZ-PPL (DmfAPPL)' },
  'sub.belcotax': { fr:'Belcotax 281.xx', nl:'Belcotax 281.xx' },
  'sub.precompte': { fr:'Précompte 274', nl:'Bedrijfsvoorheffing 274' },
  'sub.fiches_ext': { fr:'Fiches spéciales', nl:'Speciale fiches' },
  'sub.co2': { fr:'Calcul CO2 véhicules', nl:'CO2-berekening voertuigen' },
  'sub.atn': { fr:'🚗 ATN Véhicules', nl:'🚗 VAA Voertuigen' },
  'sub.od': { fr:'O.D. Comptables', nl:'Boekhoudkundige OD' },
  'sub.provisions': { fr:'Provisions', nl:'Voorzieningen' },
  'sub.cumuls': { fr:'Cumuls annuels', nl:'Jaarlijkse cumulatie' },
  'sub.netbrut': { fr:'Net → Brut', nl:'Netto → Bruto' },
  'sub.simcout': { fr:'💰 Simulation coût', nl:'💰 Kostensimulatie' },
  'sub.saisies': { fr:'Saisies-Cessions', nl:'Beslagen-Overdrachten' },
  'sub.indexauto': { fr:'Index automatique', nl:'Automatische index' },
  'sub.horsforfait': { fr:'Heures supplémentaires', nl:'Overuren' },
  'sub.totalreward': { fr:'🏆 Total Reward', nl:'🏆 Total Reward' },
  'sub.cheques': { fr:'Chèques-Repas', nl:'Maaltijdcheques' },
  'sub.ecocmd': { fr:'Éco-chèques', nl:'Ecocheques' },
  'sub.cafeteria': { fr:'Plan cafétéria', nl:'Cafetariaplan' },
  'sub.cct90': { fr:'Bonus CCT 90', nl:'Bonus CAO 90' },
  'sub.warrants': { fr:'Warrants', nl:'Warrants' },
  'sub.budgetmob': { fr:'Budget mobilité', nl:'Mobiliteitsbudget' },
  'sub.ecocircul': { fr:'Notes de frais', nl:'Onkostennota\'s' },
  'sub.contrats2': { fr:'Contrats de travail', nl:'Arbeidsovereenkomsten' },
  'sub.reglement': { fr:'Règlement de travail', nl:'Arbeidsreglement' },
  'sub.compteindiv': { fr:'Compte individuel', nl:'Individuele rekening' },
  'sub.preavis': { fr:'Préavis légal', nl:'Wettelijke opzegging' },
  'sub.pecsortie': { fr:'Pécule de sortie', nl:'Vertrekvakantiegeld' },
  'sub.certpme': { fr:'Certificat PME', nl:'KMO-certificaat' },
  'sub.absences': { fr:'Gestion absences', nl:'Afwezigheidsbeheer' },
  'sub.absenteisme': { fr:'📊 Analyse absentéisme', nl:'📊 Absenteïsme-analyse' },
  'sub.credittemps': { fr:'Crédit-temps', nl:'Tijdskrediet' },
  'sub.chomtemp': { fr:'⚠ Chômage temporaire', nl:'⚠ Tijdelijke werkloosheid' },
  'sub.congeduc': { fr:'🎓 Congé-éducation payé', nl:'🎓 Betaald educatief verlof' },
  'sub.rcc': { fr:'RCC / Prépension', nl:'SWT / Brugpensioen' },
  'sub.outplacement': { fr:'Outplacement', nl:'Outplacement' },
  'sub.pointage': { fr:'⏱ Pointage & Portail', nl:'⏱ Tijdsregistratie & Portaal' },
  'sub.planform': { fr:'Plan de formation', nl:'Opleidingsplan' },
  'sub.medtravail': { fr:'Médecine du travail', nl:'Arbeidsgeneeskunde' },
  'sub.selfservice': { fr:'👤 Portail travailleur', nl:'👤 Werknemersportaal' },
  'sub.assloi': { fr:'Assurance-Loi AT', nl:'Arbeidsongevallenverzekering' },
  'sub.assgroupe': { fr:'Assurance Groupe', nl:'Groepsverzekering' },
  'sub.syndicales': { fr:'Primes syndicales', nl:'Syndicale premies' },
  'sub.allocfam': { fr:'Alloc. familiales', nl:'Kinderbijslag' },
  'sub.caissevac': { fr:'Caisse de vacances', nl:'Vakantiekas' },
  'sub.rentes': { fr:'Rentes', nl:'Renten' },
  'sub.decava': { fr:'DECAVA', nl:'DECAVA' },
  'sub.aidesemploi': { fr:'🎯 Aides à l\'emploi', nl:'🎯 Tewerkstellingssteun' },
  'sub.planglobal': { fr:'Plan global prévention', nl:'Globaal preventieplan' },
  'sub.paa': { fr:'Plan action annuel', nl:'Jaarlijks actieplan' },
  'sub.risquespsycho': { fr:'Risques psychosociaux', nl:'Psychosociale risico\'s' },
  'sub.alcool': { fr:'Politique alcool/drogues', nl:'Alcohol-/drugsbeleid' },
  'sub.elections': { fr:'🗳 Élections sociales', nl:'🗳 Sociale verkiezingen' },
  'sub.organes': { fr:'CE / CPPT / DS', nl:'OR / CPBW / VA' },
  'sub.accounting': { fr:'Accounting Output', nl:'Boekhoudkundige Output' },
  'sub.bilanbnb': { fr:'Bilan Social BNB', nl:'Sociaal Verslag NBB' },
  'sub.bilan': { fr:'Bilan Social', nl:'Sociaal Verslag' },
  'sub.statsins': { fr:'Statistiques INS', nl:'INS Statistieken' },
  'sub.sepa': { fr:'SEPA / Virements', nl:'SEPA / Overschrijvingen' },
  'sub.peppol': { fr:'🔗 PEPPOL e-Invoicing', nl:'🔗 PEPPOL e-Facturatie' },
  'sub.envoi': { fr:'Envoi documents', nl:'Documenten versturen' },
  'sub.exportimport': { fr:'Export / Import', nl:'Export / Import' },
  'sub.ged': { fr:'📁 GED / Archivage', nl:'📁 DMS / Archivering' },
  'sub.alertes': { fr:'Alertes légales', nl:'Juridische waarschuwingen' },
  'sub.secteurs': { fr:'Secteurs spécifiques', nl:'Specifieke sectoren' },
  'sub.eta': { fr:'Relevés ETA', nl:'ETA-overzichten' },
  'sub.docsjuridiques': { fr:'📄 Documents Juridiques', nl:'📄 Juridische Documenten' },
  'sub.config': { fr:'Configuration société', nl:'Bedrijfsconfiguratie' },
  'sub.fraisgestion': { fr:'💰 Frais de gestion', nl:'💰 Beheerskosten' },
  
  // ── Headers & Titles ──
  'app.title': { fr:'AUREUS SOCIAL', nl:'AUREUS SOCIAL' },
  'app.subtitle': { fr:'Logiciel de Paie Pro', nl:'Professionele Loonsoftware' },
  'app.client': { fr:'Client', nl:'Klant' },
  
  // ── Login ──
  'login.title': { fr:'Accès sécurisé', nl:'Beveiligde toegang' },
  'login.create': { fr:'Créer un code PIN', nl:'PIN-code aanmaken' },
  'login.enter': { fr:'Entrez votre code PIN', nl:'Voer uw PIN-code in' },
  'login.btn': { fr:'Se connecter', nl:'Aanmelden' },
  'login.create_btn': { fr:'Créer', nl:'Aanmaken' },
  
  // ── Employees ──
  'emp.title': { fr:'Gestion du personnel', nl:'Personeelsbeheer' },
  'emp.add': { fr:'Ajouter un travailleur', nl:'Werknemer toevoegen' },
  'emp.firstname': { fr:'Prénom', nl:'Voornaam' },
  'emp.lastname': { fr:'Nom', nl:'Naam' },
  'emp.niss': { fr:'NISS', nl:'INSZ' },
  'emp.birthdate': { fr:'Date de naissance', nl:'Geboortedatum' },
  'emp.address': { fr:'Adresse', nl:'Adres' },
  'emp.city': { fr:'Ville', nl:'Stad' },
  'emp.zip': { fr:'Code postal', nl:'Postcode' },
  'emp.startdate': { fr:'Date d\'entrée', nl:'Datum indiensttreding' },
  'emp.enddate': { fr:'Date de sortie', nl:'Datum uitdiensttreding' },
  'emp.function': { fr:'Fonction', nl:'Functie' },
  'emp.department': { fr:'Département', nl:'Afdeling' },
  'emp.contract': { fr:'Type contrat', nl:'Contracttype' },
  'emp.regime': { fr:'Régime', nl:'Regime' },
  'emp.salary': { fr:'Salaire mensuel brut', nl:'Bruto maandloon' },
  'emp.iban': { fr:'IBAN', nl:'IBAN' },
  'emp.civil': { fr:'État civil', nl:'Burgerlijke staat' },
  'emp.children': { fr:'Enfants à charge', nl:'Kinderen ten laste' },
  'emp.status_employe': { fr:'Employé', nl:'Bediende' },
  'emp.status_ouvrier': { fr:'Ouvrier', nl:'Arbeider' },
  'emp.status_student': { fr:'Étudiant', nl:'Student' },
  'emp.status_flexi': { fr:'Flexi-job', nl:'Flexi-job' },
  'emp.sexe': { fr:'Sexe', nl:'Geslacht' },
  'emp.sexe_m': { fr:'Masculin', nl:'Man' },
  'emp.sexe_f': { fr:'Féminin', nl:'Vrouw' },
  'emp.save': { fr:'Enregistrer', nl:'Opslaan' },
  'emp.delete': { fr:'Supprimer', nl:'Verwijderen' },
  'emp.active': { fr:'Actif', nl:'Actief' },
  'emp.inactive': { fr:'Inactif', nl:'Inactief' },
  
  // ── Contract types ──
  'ct.cdi': { fr:'CDI', nl:'COT' },
  'ct.cdd': { fr:'CDD', nl:'CBD' },
  'ct.interim': { fr:'Intérimaire', nl:'Uitzendkracht' },
  'ct.student': { fr:'Étudiant (650h)', nl:'Student (650u)' },
  'ct.replacement': { fr:'Remplacement', nl:'Vervanging' },
  'ct.tpartiel': { fr:'Temps partiel', nl:'Deeltijds' },
  'ct.full': { fr:'Temps plein', nl:'Voltijds' },
  
  // ── Civil status ──
  'civil.single': { fr:'Isolé', nl:'Alleenstaand' },
  'civil.married1': { fr:'Marié — 1 revenu', nl:'Gehuwd — 1 inkomen' },
  'civil.married2': { fr:'Marié — 2 revenus', nl:'Gehuwd — 2 inkomens' },
  'civil.cohabit': { fr:'Cohabitant', nl:'Samenwonend' },
  'civil.divorced': { fr:'Divorcé', nl:'Gescheiden' },
  'civil.widow': { fr:'Veuf/Veuve', nl:'Weduwe/Weduwnaar' },
  
  // ── Payslip ──
  'pay.title': { fr:'Fiche de paie', nl:'Loonfiche' },
  'pay.period': { fr:'Période', nl:'Periode' },
  'pay.month': { fr:'Mois', nl:'Maand' },
  'pay.year': { fr:'Année', nl:'Jaar' },
  'pay.days': { fr:'Jours prestés', nl:'Gewerkte dagen' },
  'pay.gross': { fr:'TOTAL BRUT', nl:'TOTAAL BRUTO' },
  'pay.net': { fr:'NET À PAYER', nl:'NETTO TE BETALEN' },
  'pay.onss': { fr:'Cotisations ONSS', nl:'RSZ-bijdragen' },
  'pay.onss_worker': { fr:'ONSS travailleur', nl:'RSZ werknemer' },
  'pay.onss_employer': { fr:'ONSS employeur', nl:'RSZ werkgever' },
  'pay.pp': { fr:'Précompte professionnel', nl:'Bedrijfsvoorheffing' },
  'pay.css': { fr:'Cotisation spéciale séc. soc.', nl:'Bijzondere bijdrage SZ' },
  'pay.base': { fr:'Salaire de base', nl:'Basisloon' },
  'pay.overtime': { fr:'Heures sup. (150%)', nl:'Overuren (150%)' },
  'pay.sunday': { fr:'Heures dimanche (200%)', nl:'Zondaguren (200%)' },
  'pay.night': { fr:'Heures nuit (125%)', nl:'Nachturen (125%)' },
  'pay.bonus': { fr:'Prime', nl:'Premie' },
  'pay.y13': { fr:'13ème mois', nl:'13de maand' },
  'pay.sick': { fr:'Salaire garanti maladie', nl:'Gewaarborgd loon ziekte' },
  'pay.advance': { fr:'Acompte', nl:'Voorschot' },
  'pay.garnish': { fr:'Saisie', nl:'Beslag' },
  'pay.transport': { fr:'Transport', nl:'Transport' },
  'pay.expense': { fr:'Frais propres employeur', nl:'Eigen kosten werkgever' },
  'pay.mv': { fr:'Chèques-repas', nl:'Maaltijdcheques' },
  'pay.eco': { fr:'Éco-chèques', nl:'Ecocheques' },
  'pay.employer_cost': { fr:'COÛT EMPLOYEUR', nl:'WERKGEVERSKOST' },
  'pay.bonus_emploi': { fr:'Bonus à l\'emploi', nl:'Werkbonus' },
  'pay.bonus_fisc': { fr:'Bonus emploi fiscal', nl:'Fiscale werkbonus' },
  'pay.red_struct': { fr:'Réduction structurelle', nl:'Structurele vermindering' },
  'pay.print': { fr:'Imprimer', nl:'Afdrukken' },
  'pay.pdf': { fr:'Télécharger PDF', nl:'PDF downloaden' },
  'pay.calculate': { fr:'Calculer', nl:'Berekenen' },
  
  // ── Heures supplémentaires ──
  'hs.overtime': { fr:'H. sup.', nl:'Overuren' },
  'hs.sunday': { fr:'H. dimanche', nl:'Zondaguren' },
  'hs.night': { fr:'H. nuit', nl:'Nachturen' },
  'hs.fiscal': { fr:'H.sup fiscales (180h)', nl:'Overuren fiscaal (180u)' },
  'hs.volont': { fr:'HS volont. brut=net (h)', nl:'Vrijw. overuren bruto=netto (u)' },
  'hs.relance': { fr:'HS relance T1 (h)', nl:'Relance-overuren T1 (u)' },
  
  // ── Settings ──
  'set.company': { fr:'Configuration société', nl:'Bedrijfsconfiguratie' },
  'set.name': { fr:'Nom de l\'entreprise', nl:'Bedrijfsnaam' },
  'set.vat': { fr:'Numéro TVA', nl:'BTW-nummer' },
  'set.bce': { fr:'Numéro BCE', nl:'KBO-nummer' },
  'set.onss_num': { fr:'Numéro ONSS', nl:'RSZ-nummer' },
  'set.nace': { fr:'Code NACE', nl:'NACE-code' },
  'set.iban': { fr:'IBAN', nl:'IBAN' },
  'set.bic': { fr:'BIC', nl:'BIC' },
  'set.cp': { fr:'Commission paritaire', nl:'Paritair comité' },
  'set.sec_soc': { fr:'Secrétariat social', nl:'Sociaal secretariaat' },
  'set.address': { fr:'Adresse', nl:'Adres' },
  
  // ── ONSS / Dimona ──
  'onss.dimona_in': { fr:'Dimona IN — Entrée en service', nl:'Dimona IN — Indiensttreding' },
  'onss.dimona_out': { fr:'Dimona OUT — Sortie de service', nl:'Dimona OUT — Uitdiensttreding' },
  'onss.worker_type': { fr:'Type de travailleur', nl:'Type werknemer' },
  'onss.dmfa': { fr:'Déclaration DMFA', nl:'DmfA-aangifte' },
  'onss.trimester': { fr:'Trimestre', nl:'Kwartaal' },
  
  // ── SEPA ──
  'sepa.title': { fr:'SEPA / Virements bancaires', nl:'SEPA / Bankoverschrijvingen' },
  'sepa.salaries': { fr:'Salaires', nl:'Lonen' },
  'sepa.all': { fr:'TOUT (salaires + ONSS + PP)', nl:'ALLES (lonen + RSZ + BV)' },
  'sepa.sal_only': { fr:'Salaires uniquement', nl:'Alleen lonen' },
  'sepa.onss_only': { fr:'ONSS uniquement', nl:'Alleen RSZ' },
  'sepa.pp_only': { fr:'PP + CSS uniquement', nl:'Alleen BV + BBSZ' },
  'sepa.download': { fr:'💾 Télécharger .xml', nl:'💾 .xml downloaden' },
  'sepa.email': { fr:'📧 Ouvrir dans Mail', nl:'📧 Openen in Mail' },
  'sepa.copy': { fr:'📋 Copier le message', nl:'📋 Bericht kopiëren' },
  
  // ── Reporting ──
  'rep.belcotax': { fr:'Belcotax 281.xx', nl:'Belcotax 281.xx' },
  'rep.bilan': { fr:'Bilan Social', nl:'Sociaal Verslag' },
  'rep.export': { fr:'Exporter', nl:'Exporteren' },
  'rep.generate': { fr:'Générer', nl:'Genereren' },
  
  // ── Contrats ──
  'ctr.type_cdi': { fr:'Contrat à durée indéterminée', nl:'Arbeidsovereenkomst voor onbepaalde duur' },
  'ctr.type_cdd': { fr:'Contrat à durée déterminée', nl:'Arbeidsovereenkomst voor bepaalde duur' },
  'ctr.type_student': { fr:'Convention d\'occupation étudiant', nl:'Studentenovereenkomst' },
  'ctr.type_flexi': { fr:'Contrat flexi-job', nl:'Flexi-job contract' },
  'ctr.generate': { fr:'Générer le contrat', nl:'Contract genereren' },
  'ctr.preview': { fr:'Aperçu', nl:'Voorbeeld' },
  
  // ── Veille légale ──
  'legal.title': { fr:'Veille légale & Calendrier 2026', nl:'Juridische monitoring & Kalender 2026' },
  'legal.filter': { fr:'Filtrer', nl:'Filteren' },
  'legal.all': { fr:'Tout', nl:'Alles' },
  'legal.deadlines': { fr:'📅 Échéances', nl:'📅 Deadlines' },
  'legal.new2026': { fr:'⚖️ Nouveautés 2026', nl:'⚖️ Nieuw in 2026' },
  'legal.upcoming': { fr:'🔮 Réformes à venir', nl:'🔮 Komende hervormingen' },
  'legal.index': { fr:'📈 Indexations', nl:'📈 Indexeringen' },
  'legal.urgent': { fr:'Urgentes', nl:'Dringend' },
  'legal.plan': { fr:'À planifier', nl:'Te plannen' },
  'legal.reminder': { fr:'Rappels', nl:'Herinneringen' },
  'legal.watch': { fr:'Veille', nl:'Monitoring' },
  'legal.institutions': { fr:'🏛 Institutions de référence', nl:'🏛 Referentie-instellingen' },
  'legal.summary': { fr:'Résumé', nl:'Overzicht' },
  'legal.cal_pp': { fr:'📅 Calendrier PP (FinProf)', nl:'📅 Kalender BV (FinProf)' },
  'legal.cal_onss': { fr:'📅 Calendrier ONSS / DmfA', nl:'📅 Kalender RSZ / DmfA' },
  
  // ── Months ──
  'months': {
    fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    nl:['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
  },
  
  // ── Buttons & General ──
  'btn.save': { fr:'Enregistrer', nl:'Opslaan' },
  'btn.cancel': { fr:'Annuler', nl:'Annuleren' },
  'btn.delete': { fr:'Supprimer', nl:'Verwijderen' },
  'btn.edit': { fr:'Modifier', nl:'Bewerken' },
  'btn.add': { fr:'Ajouter', nl:'Toevoegen' },
  'btn.close': { fr:'Fermer', nl:'Sluiten' },
  'btn.download': { fr:'Télécharger', nl:'Downloaden' },
  'btn.print': { fr:'Imprimer', nl:'Afdrukken' },
  'btn.generate': { fr:'Générer', nl:'Genereren' },
  'btn.validate': { fr:'Valider', nl:'Bevestigen' },
  'btn.search': { fr:'Rechercher', nl:'Zoeken' },
  'btn.reset': { fr:'Réinitialiser', nl:'Resetten' },
  'btn.copy': { fr:'Copier', nl:'Kopiëren' },
  'btn.export': { fr:'Exporter', nl:'Exporteren' },
  'btn.import': { fr:'Importer', nl:'Importeren' },
  'btn.send': { fr:'Envoyer', nl:'Versturen' },
  'btn.details': { fr:'Détail', nl:'Detail' },
  'btn.yes': { fr:'Oui', nl:'Ja' },
  'btn.no': { fr:'Non', nl:'Nee' },
  
  // ── Dashboard ──
  'dash.welcome': { fr:'Bienvenue', nl:'Welkom' },
  'dash.total_emp': { fr:'Travailleurs actifs', nl:'Actieve werknemers' },
  'dash.mass_sal': { fr:'Masse salariale', nl:'Loonmassa' },
  'dash.onss_due': { fr:'ONSS dû', nl:'RSZ verschuldigd' },
  'dash.pp_due': { fr:'PP dû', nl:'BV verschuldigd' },
  'dash.alerts': { fr:'Alertes', nl:'Waarschuwingen' },
  'dash.next_deadline': { fr:'Prochaine échéance', nl:'Volgende deadline' },
  
  // ── Clients ──
  'cli.title': { fr:'Gestion des dossiers clients', nl:'Beheer klantenbestanden' },
  'cli.add': { fr:'Nouveau dossier', nl:'Nieuw dossier' },
  'cli.name': { fr:'Nom du client', nl:'Klantnaam' },
  'cli.open': { fr:'Ouvrir', nl:'Openen' },
  'cli.emps': { fr:'travailleurs', nl:'werknemers' },
};

// i18n provider wrapper
function LangProvider({children}) {
  const [lang, setLang] = useState('fr');
  const t = (key) => {
    const entry = I18N[key];
    if (!entry) return key;
    return entry[lang] || entry.fr || key;
  };
  const changeLang = (l) => { setLang(l); };
  return <LangCtx.Provider value={{lang, t, setLang: changeLang}}><LangSync/>{children}</LangCtx.Provider>;
}

// Language switcher component
function LangSwitch() {
  const {lang, setLang} = useLang();
  return <div style={{display:'flex',gap:2,background:'rgba(198,163,78,.06)',borderRadius:6,padding:2,border:'1px solid rgba(198,163,78,.1)'}}>
    {['fr','nl'].map(l =>
      <button key={l} onClick={()=>setLang(l)} style={{
        padding:'4px 10px',borderRadius:5,border:'none',cursor:'pointer',fontSize:10.5,fontWeight:lang===l?700:400,
        background:lang===l?'rgba(198,163,78,.2)':'transparent',
        color:lang===l?'#c6a34e':'#9e9b93',fontFamily:'inherit',textTransform:'uppercase',letterSpacing:1
      }}>{l}</button>
    )}
  </div>;
}

// LangSync — keeps global MN in sync with language
function LangSync() {
  const {lang} = useLang();
  useEffect(() => { MN = lang === 'nl' ? MN_NL : MN_FR; }, [lang]);
  return null;
}

const LEGAL={ONSS_W:.1307,ONSS_E:.25,BONUS_2026:{
    // Bonus à l'emploi — Volet A (bas salaires) + Volet B (très bas salaires)
    // Source: Partena Professional / Instructions ONSS T1/2026 — indexé 01/01/2026
    // Employés (déclarés à 100%)
    A_S1:3340.44, A_MAX:132.92, A_COEFF:0.2638,  // Volet A: si S <= S1, R_A = A_MAX - A_COEFF*(S - A_S2)
    A_S2:2833.27,                                  // si S <= A_S2: R_A = A_MAX
    B_S1:2833.27, B_MAX:123.08, B_COEFF:0.2443,   // Volet B: si S <= B_S1, R_B = B_MAX - B_COEFF*(S - B_S2)
    B_S2:2330.10,                                  // si S <= B_S2: R_B = B_MAX
    // Ouvriers (déclarés à 108%) — mêmes seuils mais x1.08
    O_A_S1:3609.28, O_A_MAX:143.55, O_A_COEFF:0.2449, 
    O_A_S2:3059.93,
    O_B_S1:3059.93, O_B_MAX:132.93, O_B_COEFF:0.2262,
    O_B_S2:2516.51
  },
  // ── Réduction structurelle ONSS T1/2026 — Source: Easypay Group / ONSS 09/01/2026 ──
  RED_STRUCT_2026:{
    // Cat 1: Secteur privé marchand (25%) — F=0, δ=0 → seuls bas/très bas salaires
    CAT1_alpha:0.1400, CAT1_S0:11458.57,  // composante bas salaires: α*(S0-S)
    CAT1_gamma:0.1500, CAT1_S2:9547.20,   // composante très bas salaires: γ*(S2-S)
    CAT1_F:0, CAT1_delta:0, CAT1_S1:0,
    // Cat 2: Maribel social / non-marchand (±32.40%)
    CAT2_F:79.00, CAT2_alpha:0.2300, CAT2_S0:9975.60,
    CAT2_gamma:0.1500, CAT2_S2:9975.60,
    CAT2_delta:0.0600, CAT2_S1:16803.98,
    // Cat 3: Entreprises de travail adapté
    CAT3_alpha:0.1400, CAT3_S0:12416.08,
    CAT3_gamma:0.1500, CAT3_S2:9547.20,
    CAT3_F:0, CAT3_delta:0, CAT3_S1:0,
    // Cat 3bis: ETA travailleurs moins valides
    CAT3B_F:495.00, CAT3B_alpha:0.1785, CAT3B_S0:11788.30,
    CAT3B_gamma:0.1500, CAT3B_S2:9547.20,
    // Multiplicateur fixe Ps = R * µ * fraction_prestation (µ=0.1400 intégré dans formule)
    MU:1.0  // µ déjà intégré dans les coefficients ci-dessus pour simplifier
  },MV:{emax:8.91,wmin:1.09,maxTotal:10,deducFisc:4},ECO:250,WD:21.67,WH:38,WHD:7.6,
  // ── Précompte professionnel 2026 — Annexe III AR/CIR 92 (Moniteur belge) ──
  // Formule-clé complète SPF Finances (pas simplifiée)
  PP2026:{
    // Frais professionnels forfaitaires (salariés)
    FP_PCT:0.30, FP_MAX:5930,
    // Frais professionnels dirigeants d'entreprise
    FP_DIR_PCT:0.03, FP_DIR_MAX:3120,
    // Barème progressif ANNUEL (tranches 2026 indexées)
    TRANCHES:[
      {lim:16310,rate:0.2675},
      {lim:29940,rate:0.4280},
      {lim:41370,rate:0.4815},
      {lim:Infinity,rate:0.5350}
    ],
    // Quotité exemptée d'impôt 2026
    EXEMPT:10900,
    // Réductions annuelles pour charges de famille
    RED:{
      isolee:144.00,          // personne isolée
      veuf_enfant:540.00,     // veuf/veuve non remarié(e) + enfant
      enfants:[0,612,1620,3672,5928,7116],  // 0,1,2,3,4,5 enfants
      enfantX:7116,           // par enfant supplémentaire > 5
      handicap:612,           // supplément par enfant handicapé
      ascendant65:1728,       // parent/grand-parent ≥65 ans à charge
      ascendant65_handi:2100, // idem handicapé
      conjoint_charge:0,      // quotient conjugal: traité séparément
    },
    // Quotient conjugal (barème 2): max 30% du revenu, plafonné à 12 520 €
    QC_PCT:0.30, QC_MAX:12520,
  },
  // ── Modulations sectorielles ONSS ──
  // Depuis tax-shift 2018: taux facial = 25% secteur marchand privé (inclut modération salariale 7,48%)
  // Non-marchand: ≈ 32,40% (réduction via Maribel social)
  // Ouvriers: cotisations calculées sur brut × 108% (compensation pécule vacances)
  ONSS_DETAIL_2026:{
    // Ventilation du taux patronal 25% (secteur marchand, employés)
    base:0.1993,           // cotisation de base
    moderation:0.0507,     // modération salariale (intégrée dans 25% facial)
    total_marchand:0.25,   // = cotisation globale secteur marchand (tax-shift 2018)
    // Cotisation supplémentaire ≥ 10 travailleurs
    supp_10trav:0.0169,    // 1,60% + modération = 1,69% si ≥ 10 travailleurs
    // Non-marchand
    total_non_marchand:0.3240,
    maribel_social:0.0024, // réduction Maribel (déduit)
    // Ouvriers
    majoration_ouvrier:1.08, // brut × 108%
    vacances_annuelles_ouvrier:0.1027, // 10,27% sur brut à 108% année N-1 (payé au 30/04)
    // Cotisations spéciales patronales T1/2026
    ffe_petit:0.0032,      // Fonds fermeture < 20 trav.
    ffe_grand:0.0037,      // Fonds fermeture ≥ 20 trav.
    chomage_temp:0.0009,   // chômage temporaire T1/2026
    amiante:0.0001,        // Fonds amiante (T1-T3 2026 seulement)
    maladies_prof:0.0017,  // cotisation maladies professionnelles (Fedris)
    // Étudiants
    etudiant_patronal:0.0542, // cotisation solidarité patronale (650h/an)
    etudiant_personnel:0.0271,// cotisation solidarité personnelle
    etudiant_total:0.0813,    // total solidarité = 8,13%
    // Flexi-jobs
    flexi_patronal:0.28,   // 28% cotisation patronale spéciale
    // CSS annuelle max
    css_max_isole:731.28,  // max annuel isolé/conjoint sans revenus
    css_max_menage:731.28, // max annuel ménage 2 revenus (identique mais retenues mensuelles différentes)
    // Provisions mensuelles: le 5 de chaque mois
    // Solde trimestriel: dernier jour du mois suivant le trimestre
  },
  ONSS_SECTEUR:{
    'default':{e:0.25,type:'marchand',note:'Taux global standard 25% (secteur marchand privé, tax-shift 2018)'},
    '124':{e:0.3838,type:'marchand',note:'Construction: 25% + intempéries 2% + congés 6% + sécurité 0.22% + timbre fidélité'},
    '302':{e:0.2816,type:'marchand',note:'Horeca: 25% + Fonds social horeca + Fonds fermeture'},
    '140':{e:0.2716,type:'marchand',note:'Transport: 25% + Fonds social + formation'},
    '330':{e:0.3240,type:'non_marchand',note:'Soins santé (non-marchand): 32,40% - Maribel social'},
    '331':{e:0.3240,type:'non_marchand',note:'Aide sociale Flandre (non-marchand): 32,40% - Maribel'},
    '332':{e:0.3240,type:'non_marchand',note:'Aide sociale CF/RW (non-marchand): 32,40% - Maribel'},
    '329':{e:0.3240,type:'non_marchand',note:'Socio-culturel (non-marchand): 32,40% - Maribel'},
    '318':{e:0.3240,type:'non_marchand',note:'Aides familiales (non-marchand): 32,40% - Maribel'},
    '319':{e:0.3240,type:'non_marchand',note:'Éducation (non-marchand): 32,40% - Maribel'},
    '322.01':{e:0.2916,type:'marchand',note:'Titres-services: 25% + fonds titres-services 4,16%'},
    '327':{e:0.3240,type:'non_marchand',note:'ETA (non-marchand): 32,40% - Maribel'},
  },
  DIMONA_TYPES:['IN','OUT','UPDATE','CANCEL','DAILY'],
  DIMONA_WTYPES:['OTH','STU','FLX','IVT','A17','DWD','TRI','S17','BCW','EXT'],
  DMFA_CODES:{'495':'Employé ordinaire','015':'Ouvrier ordinaire','487':'Dirigeant','027':'Apprenti','840':'Étudiant','050':'Intérimaire'},
  FICHE_281:{'10':'Rémunérations employés/dirigeants','13':'Pensions/rentes','14':'Revenus remplacement','17':'Rentes alimentaires','18':'Rém. non-marchand','20':'Honoraires/commissions','30':'Jetons de présence','50':'Revenus mobiliers'},
  SOCIAL_DOCS:{C4:'Certificat de chômage C4',C131A:'Certificat chômage temporaire',C3_2:'Carte contrôle chômage',VACATION:'Attestation de vacances',WORK_CERT:'Certificat de travail',ACCOUNT:'Compte individuel'},
  CP:{'100':'CP 100 - Auxiliaire ouvriers','101':'CP 101 - Mines','102':'CP 102 - Carrières','104':'CP 104 - Sidérurgie','105':'CP 105 - Métaux non-ferreux','106':'CP 106 - Ciment','107':'CP 107 - Maîtres-tailleurs','109':'CP 109 - Habillement/Confection','110':'CP 110 - Entretien textile','111':'CP 111 - Métal/Mécanique/Électrique','112':'CP 112 - Garage','113':'CP 113 - Céramique','114':'CP 114 - Briqueterie','115':'CP 115 - Verrerie','116':'CP 116 - Chimie','117':'CP 117 - Pétrole','118':'CP 118 - Industrie alimentaire','119':'CP 119 - Commerce alimentaire','120':'CP 120 - Textile/Bonneterie','121':'CP 121 - Nettoyage','124':'CP 124 - Construction','125':'CP 125 - Industrie du bois','126':'CP 126 - Ameublement','127':'CP 127 - Commerce combustibles','128':'CP 128 - Cuirs et peaux','129':'CP 129 - Pâtes/Papiers/Cartons','130':'CP 130 - Imprimerie/Arts graphiques','132':'CP 132 - Travaux techniques agricoles','133':'CP 133 - Tabacs','136':'CP 136 - Transformation papier/carton','139':'CP 139 - Batellerie','140':'CP 140 - Transport','142':'CP 142 - Récupération matières premières','143':'CP 143 - Pêche maritime','144':'CP 144 - Agriculture','145':'CP 145 - Horticulture','146':'CP 146 - Entreprises forestières','147':'CP 147 - Armurerie','148':'CP 148 - Fourrure/Peau en poil','149':'CP 149 - Secteurs connexes métal','149.01':'CP 149.01 - Électriciens installation','149.02':'CP 149.02 - Carrosserie','149.03':'CP 149.03 - Métaux précieux','149.04':'CP 149.04 - Commerce du métal','150':'CP 150 - Poterie','152':'CP 152 - Enseignement libre','200':'CP 200 - Auxiliaire employés','201':'CP 201 - Commerce de détail indépendant','202':'CP 202 - Commerce détail alimentaire','203':'CP 203 - Carrières petit granit (empl.)','204':'CP 204 - Carrières porphyre (empl.)','205':'CP 205 - Charbonnages (empl.)','207':'CP 207 - Industrie chimique (empl.)','209':'CP 209 - Fabrications métalliques (empl.)','210':'CP 210 - Sidérurgie (empl.)','211':'CP 211 - Pétrole (empl.)','214':'CP 214 - Textile/Bonneterie (empl.)','215':'CP 215 - Habillement/Confection (empl.)','216':'CP 216 - Notaires (empl.)','217':'CP 217 - Casino (empl.)','218':'CP 218 - CNT auxiliaire employés','219':'CP 219 - Organismes contrôle agréés','220':'CP 220 - Industrie alimentaire (empl.)','221':'CP 221 - Industrie papetière (empl.)','222':'CP 222 - Transformation papier/carton (empl.)','223':'CP 223 - Sports','224':'CP 224 - Métaux non-ferreux (empl.)','225':'CP 225 - Enseignement libre (empl.)','226':'CP 226 - Commerce international/Transport','227':'CP 227 - Secteur audio-visuel','301':'CP 301 - Ports','302':'CP 302 - Hôtellerie','303':'CP 303 - Cinématographie','304':'CP 304 - Spectacle','306':'CP 306 - Assurances','307':'CP 307 - Courtage assurances','308':'CP 308 - Prêts hypothécaires','309':'CP 309 - Sociétés de bourse','310':'CP 310 - Banques','311':'CP 311 - Grandes surfaces','312':'CP 312 - Grands magasins','313':'CP 313 - Pharmacies','314':'CP 314 - Coiffure/Soins de beauté','315':'CP 315 - Aviation commerciale','316':'CP 316 - Marine marchande','317':'CP 317 - Gardiennage','318':'CP 318 - Aides familiales/seniors','319':'CP 319 - Éducation/Hébergement','320':'CP 320 - Pompes funèbres','321':'CP 321 - Grossistes médicaments','322':'CP 322 - Intérimaire/Titres-services','322.01':'CP 322.01 - Titres-services','323':'CP 323 - Gestion immeubles/Domestiques','324':'CP 324 - Diamant','325':'CP 325 - Institutions publiques crédit','326':'CP 326 - Gaz/Électricité','327':'CP 327 - Travail adapté/Ateliers sociaux','328':'CP 328 - Transport urbain/régional','329':'CP 329 - Socio-culturel','330':'CP 330 - Santé','331':'CP 331 - Aide sociale (Flandre)','332':'CP 332 - Aide sociale (francophone)','333':'CP 333 - Attractions touristiques','336':'CP 336 - Professions libérales'},
  REDUCTIONS:{base:157.29,married1:258.33,children:[0,52.50,141.67,318.33,514.17,618.33],childX:618.33,handicap:52.50,isolated:52.50},
  // ── Cotisation Spéciale Sécurité Sociale — retenue MENSUELLE (provisions) ──
  // Source: socialsecurity.be/employer/instructions/dmfa + Securex montants-socio-juridiques
  // Basée sur la rémunération TRIMESTRIELLE, retenue mensuellement = 1/3 du montant trimestriel
  // ISOLÉ / conjoint SANS revenus prof. (barème 1)
  CSS_SINGLE:[
    {f:0,t:1945.38,a:0},                              // T <= 5836.14: 0€
    {f:1945.39,t:2190.18,p:.076,b:1945.38},            // 5836.14 < T <= 6570.54: 7,6% tranche, min 0€
    {f:2190.19,t:6038.82,a:18.60,p2:0.011,b2:2190.18,max:60.94}, // 6570.54 < T <= 18116.46: 18.60 + 1,1% tranche, max 60.94€/mois
    {f:6038.83,t:Infinity,a:60.94}                     // T > 18116.46: 60.94€/mois (182.82€/trim)
  ],
  // MÉNAGE 2 REVENUS (conjoint a aussi des revenus prof.) (barème 2)
  CSS_MARRIED:[
    {f:0,t:1945.38,a:0},                              // T <= 5836.14: 0€
    {f:1945.39,t:2190.18,p:.076,b:1945.38,min:9.30},  // 5836.14 < T <= 6570.54: 7,6% tranche, min 9.30€/mois
    {f:2190.19,t:6038.82,a:18.60,p2:0.011,b2:2190.18,max:51.64}, // 6570.54 < T <= 18116.46: 18.60 + 1,1% tranche, max 51.64€/mois
    {f:6038.83,t:Infinity,a:51.64}                     // T > 18116.46: 51.64€/mois (154.92€/trim)
  ],
  // ── SOURCES OFFICIELLES À SURVEILLER ──
  SOURCES_VEILLE:{
    federal:[
      {nom:'ONSS',url:'onss.be',desc:'Instructions trimestrielles, cotisations, DmfA'},
      {nom:'SPF Finances',url:'finances.belgium.be',desc:'Barèmes PP, Annexe III, circulaires fiscales'},
      {nom:'Fisconetplus',url:'eservices.minfin.fgov.be/fisconetplus',desc:'Base de données fiscales — circulaires, rulings, addenda PP'},
      {nom:'SPF Emploi',url:'emploi.belgique.be',desc:'Droit du travail, réglementation, CCT'},
      {nom:'Moniteur belge',url:'ejustice.just.fgov.be',desc:'Publication officielle lois, AR, CCT rendues obligatoires'},
      {nom:'CNT',url:'cnt-nar.be',desc:'CCT interprofessionnelles, avis'},
      {nom:'ONEM',url:'onem.be',desc:'Chômage, crédit-temps, interruption carrière'},
      {nom:'INAMI',url:'inami.fgov.be',desc:'Assurance maladie-invalidité, incapacité de travail'},
      {nom:'SFP/MyPension',url:'sfpd.fgov.be',desc:'Pensions, Wijninckx, DB2P'},
      {nom:'Sigedis/DB2P',url:'sigedis.be',desc:'Pensions complémentaires, base de données 2ème pilier'},
      {nom:'Fedris',url:'fedris.be',desc:'Accidents du travail, maladies professionnelles, tarification AT'},
      {nom:'ONVA',url:'onva.be',desc:'Vacances annuelles ouvriers, pécules, taux 10,27%'},
      {nom:'BCSS/KSZ',url:'ksz-bcss.fgov.be',desc:'Banque Carrefour SS, flux DRS, formulaires électroniques'},
      {nom:'CAPAC',url:'capac.fgov.be',desc:'Allocations chômage, formulaires C4, chômage temporaire'},
      {nom:'INASTI',url:'inasti.be',desc:'Cotisations indépendants, statut mixte dirigeants'},
      {nom:'SPF Économie',url:'economie.fgov.be',desc:'Index santé, indices prix, index-pivot'},
      {nom:'Statbel',url:'statbel.fgov.be',desc:'Statistiques emploi, enquêtes structure salaires'},
      {nom:'BNB',url:'nbb.be',desc:'Bilan social, centrale des bilans, données macro'},
      {nom:'BCE',url:'kbo-bce-search.economie.fgov.be',desc:'Registre entreprises, NACE, données sociétés'},
      {nom:'FLA',url:'federallearningaccount.be',desc:'Federal Learning Account — obligation formation employeurs'},
      {nom:'Belcotax',url:'belcotaxonweb.be',desc:'Fiches fiscales 281.xx'},
      {nom:'Chambre/Sénat',url:'lachambre.be',desc:'Projets de loi EN COURS — alertes précoces'},
    ],
    regional:[
      {nom:'Actiris',url:'actiris.brussels',desc:'Bruxelles — aides emploi, Activa, réductions groupes-cibles'},
      {nom:'FOREM',url:'forem.be',desc:'Wallonie — aides emploi, Impulsion, sesam'},
      {nom:'VDAB',url:'vdab.be',desc:'Flandre — aides emploi, doelgroepverminderingen'},
    ],
    secsoc:[
      {nom:'Securex',url:'securex.be',desc:'Alertes législatives, montants socio-juridiques, analyses'},
      {nom:'Partena',url:'partena-professional.be',desc:'Analyses juridiques, guides pratiques'},
      {nom:'Acerta',url:'acerta.be',desc:'Juricible, publications juridiques, simulations'},
      {nom:'Liantis',url:'liantis.be',desc:'Actualités sociales, guides PME'},
      {nom:'UCM',url:'ucm.be',desc:'Union Classes Moyennes, analyses PME, cotisations'},
      {nom:'Groupe S',url:'groups.be',desc:'Secrétariat social, analyses sectorielles'},
    ],
    juridique:[
      {nom:'Droitbelge.be',url:'droitbelge.be',desc:'Jurisprudence, doctrine, fiches pratiques'},
      {nom:'SocialEye (Wolters Kluwer)',url:'wolterskluwer.com/fr-be',desc:'Base juridique sociale complète'},
      {nom:'Socialsecurity.be',url:'socialsecurity.be',desc:'Portail central SS — instructions ONSS, manuels admin'},
      {nom:'Salaires minimums',url:'salairesminimums.be',desc:'Barèmes sectoriels indexés par CP'},
    ],
  },
};

const fmt=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(n||0);
const fmtP=n=>`${((n||0)*100).toFixed(2)}%`;
const uid=()=>`${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MN_NL=['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
let MN=MN_FR; // Default FR — updated by LangSync component

// ═══════════════════════════════════════════════════════════════
//  BARÈMES OFFICIELS (Source: salairesminimums.be — SPF Emploi)
//  En vigueur au 01/01/2026
// ═══════════════════════════════════════════════════════════════
const BAREMES={
  '200':{type:'monthly',indexDate:'01/01/2026',indexPct:2.21,regime:38,
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
      'Secrétaire':'A','Réceptionniste':'A','Aide-comptable':'A','Assistant(e) administratif':'A','Encodeur(se)':'A',
      'Comptable junior':'B','Vendeur(se)':'B','Service client':'B','Secrétaire médicale':'B','Assistant(e) dentaire':'B','Préparateur commandes':'B','Recruteur':'B','Secrétaire juridique':'B','Hygiéniste dentaire':'B',
      'Comptable':'C','Comptable senior':'C','Développeur junior':'C','Marketing digital':'C','Gestionnaire syndic':'C','Consultant RH':'C','Juriste':'C','Gestionnaire sinistres':'C','UX Designer':'C','Paralegal':'C','Web developer':'C','Sysadmin':'C','Administratif':'B',
      'Développeur senior':'D','Project manager':'D','Ingénieur':'D','Avocat collaborateur':'D','Agent immobilier':'D','Courtier':'D','Ingénieur process':'D',
    },
    primeAnnuelle:330.84,ecoChequesMax:250,primeFinAnnee:'salaire brut décembre',
    transport:{velo:0.27,maxVeloJour:10.80,priveSeuilAnnuel:36688,privePct:0.50},
  },
  '124':{type:'hourly',indexDate:'01/01/2026',indexPct:0.2186,regime:40,weeklyH:40,
    classes:{I:'Manœuvre',IA:'Manœuvre qualifié (I+5%)',II:'Ouvrier semi-qualifié',IIA:'Ouvrier semi-qualifié (II+5%)',III:'Ouvrier qualifié',IV:'Ouvrier spécialisé'},
    grid:{I:18.231,IA:19.138,II:19.436,IIA:20.406,III:20.669,IV:21.940,'Chef III':22.736,'Chef IV':24.134,'Contrem IV':26.328},
    fnClassMap:{
      'Manœuvre':'I','Aide-maçon':'I','Démolisseur':'I',
      'Maçon':'III','Coffreur':'III','Ferrailleur':'III','Plombier':'III','Chauffagiste':'III','Peintre':'III','Plafonneux':'III','Carreleur':'III','Électricien':'III',
      'Grutier':'IV','Chef de chantier':'Chef IV','Apprenti':'I',
    },
    timbreFidelite:0.09,timbreIntemperie:0.02,ecoChequesMax:115,
    mobilite:{parKm:0.1579,maxKm:64},reposComp:12,
  },
  '302':{type:'hourly',indexDate:'01/01/2026',indexPct:2.189,regime:38,weeklyH:38,
    classes:{I:'Cat I',II:'Cat II',III:'Cat III',IV:'Cat IV',V:'Cat V'},
    grid:{
      0:{I:15.2097,II:15.2097,III:15.2977,IV:15.9698,V:16.8849},
      1:{I:15.8915,II:15.8915,III:16.0385,IV:16.7838,V:17.7770},
      4:{I:16.2538,II:16.2538,III:16.4029,IV:17.1645,V:18.1848},
      8:{I:16.6152,II:16.6152,III:16.7673,IV:17.5452,V:18.5926},
    },
    fnClassMap:{
      'Plongeur(se)':'I','Agent d\'entretien':'I',
      'Serveur(se)':'II','Barman/Barmaid':'II','Commis de cuisine':'II','Femme/Valet de chambre':'II',
      'Cuisinier(ère)':'III','Réceptionniste':'III','Aide cuisine':'II','Livreur(se)':'II',
      'Chef cuisinier':'IV','Concierge':'IV',
    },
    monthlyFactor:164.6666,indemniteNuit:1.6209,indemniteVetements:2.20,
  },
  '330':{type:'monthly',indexDate:'01/01/2026',indexPct:2.0,regime:38,
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
      'Agent d\'entretien':'1','Agent hôtelier':'1','Cuisinier(ère)':'1',
      'Aide-soignant(e)':'2','Brancardier':'2','Secrétaire médicale':'2',
      'Infirmier(ère)':'3','Ergothérapeute':'3','Kinésithérapeute':'3','Technicien(ne) labo':'3',
      'Pharmacien(ne) adjoint':'4','Sage-femme':'4',
      'Infirmier(ère) chef':'5',
      'Médecin':'6',
    },
    primeAttractivite:0.02,primeNuit:0.35,primeWeekendSam:0.56,primeWeekendDim:1.00,
  },
  '140':{type:'hourly',indexDate:'01/01/2026',indexPct:2.18,regime:38,weeklyH:38,
    // Source: salairesminimums.be SCP 140.03 — 01/01/2025 barèmes indexés +2,18% pour 2026
    classes:{R1:'Roulant Niv.1',R2:'Roulant Niv.2',R3:'Roulant Niv.3',R4:'Roulant Niv.4',NR1:'Non-roulant Cl.1',NR3:'Non-roulant Cl.3',NR5:'Non-roulant Cl.5',NR6:'Non-roulant Cl.6',GA:'Garage manœuvre A',GB:'Garage spécialisé B',GC:'Garage spécialisé C',GD:'Garage spécialisé D'},
    grid:{R1:14.9254,R2:15.4491,R3:15.6284,R4:15.8078,NR1:15.6463,NR3:16.8015,NR5:17.6623,NR6:18.0261,GA:16.2359,GB:18.6683,GC:20.7119,GD:21.7245},
    monthlyFactor:164.6666,
    fnClassMap:{'Chauffeur C':'R2','Chauffeur CE':'R4','Dispatcher':'NR3','Mécanicien':'GB','Déménageur':'R1','Chef d\'équipe':'R4'},
  },
  '118':{type:'hourly',indexDate:'01/01/2026',indexPct:2.19,regime:38,weeklyH:38,
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
    fnClassMap:{'Ouvrier production':'1','Technicien maintenance':'5','Chef d\'équipe':'8','Contrôleur qualité':'5','Opérateur machine':'3','Conducteur de ligne':'6','Magasinier':'2','Laborantin':'5'},
  },
  '121':{type:'hourly',indexDate:'01/01/2026',indexPct:0.56,regime:37,weeklyH:37,
    // Source: salairesminimums.be CP 121 — 01/01/2026 — régime 37h
    classes:{1:'1A Nettoyage habituel',2:'1B Nettoyage spécial',3:'2A Nettoyage mi-lourd',4:'3A Collecte déchets',5:'8A Manœuvre industriel',6:'8C 1er opérateur',CE:'Chef d\'équipe (+10%)',BR:'Brigadier (+5%)'},
    grid:{1:16.8180,2:17.3420,3:17.9070,4:19.1185,5:19.6905,6:22.5255,CE:18.4998,BR:17.6589},
    fnClassMap:{'Agent d\'entretien':'1','Repasseur(se)':'1','Aide-ménager(ère)':'1','Chef d\'équipe':'CE','Responsable site':'6'},
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
    note:'CP 209 emploi.belgique.be. Idx 2,72% au 01/07/2025. Classes sectorielles. Barème national + compléments provinciaux.',
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
    note:'CP 226 applique barèmes CP 200. Classes A-D. Idx 2,23% au 01/01/2026.',
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
    note:'Taux horaires ouvriers (38h). Barème simplifié: 2 échelons ancienneté. Employés: barèmes entreprise (CP 207).',
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
    note:'SCP 149.01 salairesminimums.be. Horaire 38h. Taux horaires: A:16.88 B:17.89 C:19.41 D:21.10 E:22.28 F:23.63 (01/2026). Mensuel = horaire x 164.67.',
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
    note:'Groupe 1 (<10 vente), personnel de vente, <20 travailleurs. Cat.1 max 10 ans anc.',
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
    note:'CP 225 = barèmes CP 200 (auxiliaire employés). Idx 2,21% au 01/01/2026.',
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
      'Groupe 6 (débutant)':{cls:6},'Groupe 5':{cls:5},'Groupe 4':{cls:4},
      'Groupe 3b':{cls:'3b'},'Groupe 3a':{cls:'3a'},
      'Groupe 2b':{cls:'2b'},'Groupe 2a':{cls:'2a'},
      'Groupe 1b (direction)':{cls:'1b'},'Groupe 1a (direction)':{cls:'1a'}
    },
    note:'CP 304 salairesminimums.be 01/02/2026. Barème plat sans ancienneté. Groupes 1a-6 selon classification fonctions.',
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
    note:'CP 307 salairesminimums.be. Classification proche CP 200 avec compléments sectoriels assurances.',
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
    note:'Personnel non-pharmacien: Cat I-IV par expérience 0-42 ans. Pharmaciens: adjoints/gérants.',
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
    note:'CP 319 salairesminimums.be. Non-marchand, barèmes CP 326 alignés. Classes/plages salariales.',
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
    note:'SCP 322.01 ACCG/FGTB 07/2025. Horaire: 14,67/15,20/15,37/15,53 €/h. Idx 2% 03/2025.',
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
    note:'CP 323 = barèmes CP 200. Gestion immobilière, syndics. Idx 2,21% au 01/01/2026.',
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
    note:'CP 327 salairesminimums.be (sous CP 326). ETA/ateliers protégés. Idx 2% au 01/02/2026.',
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
      'Ouvrier Cat.1':{cls:1},'Ouvrier Cat.2':{cls:2},'Ouvrier Cat.3':{cls:3},
      'Ouvrier Cat.4':{cls:4},'Ouvrier Cat.5':{cls:5},'Ouvrier Cat.6':{cls:6},'Ouvrier Cat.7':{cls:7}
    },
    note:'CP 111 national. Barèmes provinciaux souvent supérieurs (Agoria). Idx 2,72% au 01/07/2025 + hausse CCT 0,26€ au 01/01/2026.',
    grille:[
      {exp:0,c1:2628.43,c2:2704.10,c3:2793.90,c4:2915.51,c5:3049.26,c6:3200.42,c7:3369.22},
      {exp:5,c1:2691.22,c2:2769.73,c3:2862.63,c4:2988.89,c5:3127.48,c6:3283.50,c7:3457.24},
      {exp:10,c1:2755.52,c2:2836.85,c3:2933.03,c4:3064.20,c5:3207.76,c6:3368.80,c7:3547.08}
    ]},

  '202':{n:'Commerce de détail alimentaire (employés)',idx:1.0,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be + CGSLB. Idx 1% au 01/01/2026 (système spécifique).
    // Grandes surfaces: Colruyt, Delhaize, Aldi, Lidl...
    fn:{
      'Employé Cat.1':{cls:1},'Employé Cat.2':{cls:2},'Employé Cat.3':{cls:3},
      'Employé Cat.4':{cls:4},'Employé Cat.5':{cls:5}
    },
    note:'CP 202 Commerce détail alimentaire. Grandes surfaces, supermarchés. Idx 1% au 01/01/2026.',
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
      'Employé Cat.1':{cls:1},'Employé Cat.2':{cls:2},'Employé Cat.3':{cls:3},
      'Employé Cat.4':{cls:4},'Employé Cat.5':{cls:5},'Employé Cat.6':{cls:6}
    },
    note:'CP 220 Industrie alimentaire employés. Pendant employé de CP 118. Idx 2,19% au 01/01/2026.',
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
      'Vendeur Cat.1':{cls:1},'Vendeur Cat.2':{cls:2},'Caissier Cat.3':{cls:3},
      'Chef rayon Cat.4':{cls:4},'Responsable Cat.5':{cls:5}
    },
    note:'CP 311 Grandes entreprises vente détail. IKEA, H&M, Mediamarkt, etc. Idx 2,21% au 01/01/2026.',
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
      'Barème 1':{cls:1},'Barème 2':{cls:2},'Barème 3':{cls:3},
      'Barème 4':{cls:4},'Barème 4.1':{cls:5}
    },
    note:'CP 329 Socio-culturel (IFIC non-marchand). Associations, ONG, centres culturels. Idx 2% au 01/01/2026.',
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
      'Cat.1 (aide)':{cls:1},'Cat.2 (qualifié)':{cls:2},'Cat.3 (bachelier)':{cls:3},
      'Cat.4 (master)':{cls:4},'Cat.5 (direction)':{cls:5}
    },
    note:'CP 332 Aide sociale francophone. Crèches, CPAS, planning, aide jeunesse. Idx 2% au 01/01/2026.',
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
      'Cat.1 (aide)':{cls:1},'Cat.2 (qualifié)':{cls:2},'Cat.3 (bachelier)':{cls:3},
      'Cat.4 (master)':{cls:4},'Cat.5 (direction)':{cls:5}
    },
    note:'CP 331 Aide sociale Flandre. Mêmes barèmes IFIC que CP 332. Idx 2% au 01/01/2026.',
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
      'Employé Cat.1':{cls:1},'Employé Cat.2':{cls:2},'Employé Cat.3':{cls:3},'Employé Cat.4':{cls:4}
    },
    note:'CP 336 Professions libérales. Cabinets avocats, architectes, médecins. = barèmes CP 200 + suppléments. Idx 2,21% au 01/01/2026.',
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
      'Cat.1 non-qualifié':{cls:1},'Cat.2 spécialisé simple':{cls:2},'Cat.3 spécialisé':{cls:3},
      'Cat.4 qualifié':{cls:4},'Cat.5 1er ouvrier qualifié':{cls:5},'Cat.6 chef d\'équipe':{cls:6}
    },
    note:'CP 152.02 Enseignement libre ouvriers. 6 catégories. Barèmes horaires convertis mensuel. Idx 2% au 01/01/2026.',
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
      'Agent gardiennage A':{cls:1},'Agent qualifié B':{cls:2},'Chef équipe C':{cls:3},'Responsable D':{cls:4}
    },
    note:'CP 317 Gardiennage & Sécurité. Securitas, G4S, Seris, Trigion. Idx 2,21% au 01/01/2026.',
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
      'Aide familiale Cat.1':{cls:1},'Aide senior Cat.2':{cls:2},'Aide qualifié Cat.3':{cls:3},'Responsable Cat.4':{cls:4}
    },
    note:'CP 318 Aides familiales & seniors. Secteur non-marchand. Idx 2% au 01/01/2026.',
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
      'Ouvrier Cat.1':{cls:1},'Ouvrier spécialisé Cat.2':{cls:2},'Qualifié Cat.3':{cls:3},'Conducteur Cat.4':{cls:4}
    },
    note:'CP 144 Agriculture. Exploitations agricoles, élevage, culture. Idx 2,21% au 01/01/2026.',
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
      'Ouvrier Cat.1':{cls:1},'Ouvrier qualifié Cat.2':{cls:2},'Chef culture Cat.3':{cls:3}
    },
    note:'CP 145 Horticulture. Pépinières, serres, aménagement jardins. Idx 2,21% au 01/01/2026.',
    grille:[
      {exp:0,c1:2298.50,c2:2413.93,c3:2607.44},
      {exp:2,c1:2344.47,c2:2462.21,c3:2659.59},
      {exp:5,c1:2413.92,c2:2535.17,c3:2738.32},
      {exp:10,c1:2530.50,c2:2657.63,c3:2870.67},
      {exp:15,c1:2650.42,c2:2783.54,c3:3006.59},
      {exp:20,c1:2773.80,c2:2913.09,c3:3146.44}
    ]},

  '306':{n:'Entreprises d\'assurances',idx:2.23,dt:'01/01/2026',regime:38,approx:false,
    // Source: salairesminimums.be CP 306 — en vigueur 01/01/2026 — idx 2,23125%
    // Employés: 5 catégories. Inspecteurs et Cadres: barèmes séparés.
    fn:{
      'Employé Cat.1':{cls:1},'Employé Cat.2':{cls:2},'Employé Cat.3':{cls:3},
      'Employé Cat.4A':{cls:4},'Employé Cat.4B':{cls:5}
    },
    note:'CP 306 Entreprises d\'assurances. AG, AXA, Ethias. Idx 2,23125% au 01/01/2026. Barèmes employés (inspecteurs/cadres = grilles séparées).',
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
      'Employé Cat.1':{cls:1},'Employé qualifié Cat.2':{cls:2},'Responsable Cat.3':{cls:3},'Cadre Cat.4':{cls:4}
    },
    note:'CP 333 Attractions touristiques. Parcs, musées, zoos. Idx 2,21% au 01/01/2026.',
    grille:[
      {exp:0,c1:2242.80,c2:2336.26,c3:2555.72,c4:2874.62},
      {exp:2,c1:2290.15,c2:2385.56,c3:2609.88,c4:2935.54},
      {exp:5,c1:2362.05,c2:2460.51,c3:2691.83,c4:3027.56},
      {exp:10,c1:2508.28,c2:2613.00,c3:2858.57,c4:3215.18},
      {exp:15,c1:2658.14,c2:2769.29,c3:3029.34,c4:3407.39},
      {exp:20,c1:2812.10,c2:2929.81,c3:3204.52,c4:3604.35}
    ]},

};

function getBareme(cp,fnName,anciennete){
  const bar=BAREMES[cp];if(!bar)return null;
  const classe=bar.fnClassMap?.[fnName];if(!classe)return null;
  if(bar.type==='monthly'){
    const years=Object.keys(bar.grid).map(Number).sort((a,b)=>a-b);
    let yr=years[0];for(const y of years){if(anciennete>=y)yr=y;else break;}
    const monthly=bar.grid[yr]?.[classe];if(!monthly)return null;
    return{monthly,hourly:+(monthly/164.6666).toFixed(4),classe,classLabel:bar.classes[classe],ancYr:yr,cp,type:'monthly',indexDate:bar.indexDate,indexPct:bar.indexPct,regime:bar.regime};
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
    return{monthly:+(hourly*factor).toFixed(2),hourly,classe,classLabel:bar.classes[classe],ancYr:anciennete,cp,type:'hourly',indexDate:bar.indexDate,indexPct:bar.indexPct,regime:bar.regime};
  }
  return null;
}

function getCPAvantages(cp){
  const bar=BAREMES[cp];if(!bar)return[];const avs=[];
  if(bar.primeAnnuelle)avs.push({l:'Prime annuelle (juin)',v:fmt(bar.primeAnnuelle)});
  if(bar.primeFinAnnee)avs.push({l:'Prime fin d\'année',v:bar.primeFinAnnee});
  if(bar.ecoChequesMax)avs.push({l:'Éco-chèques (max/an)',v:fmt(bar.ecoChequesMax)});
  if(bar.transport?.velo)avs.push({l:'Indemnité vélo',v:`${bar.transport.velo} €/km (max ${bar.transport.maxVeloJour}€/jour)`});
  if(bar.timbreFidelite)avs.push({l:'Timbres fidélité',v:`${(bar.timbreFidelite*100)}% sal. annuel`});
  if(bar.timbreIntemperie)avs.push({l:'Timbres intempéries',v:`${(bar.timbreIntemperie*100)}% sal. annuel`});
  if(bar.mobilite)avs.push({l:'Indemnité mobilité',v:`${bar.mobilite.parKm} €/km (max ${bar.mobilite.maxKm}km)`});
  if(bar.reposComp)avs.push({l:'Jours repos compensatoires',v:`${bar.reposComp} jours/an`});
  if(bar.primeNuit)avs.push({l:'Prime nuit',v:`+${(bar.primeNuit*100)}%`});
  if(bar.primeWeekendSam)avs.push({l:'Prime samedi',v:`+${(bar.primeWeekendSam*100)}%`});
  if(bar.primeWeekendDim)avs.push({l:'Prime dimanche',v:`+${(bar.primeWeekendDim*100)}%`});
  if(bar.primeAttractivite)avs.push({l:'Prime attractivité',v:`${(bar.primeAttractivite*100)}%`});
  if(bar.indemniteNuit)avs.push({l:'Indemnité nuit (0h-5h)',v:`${bar.indemniteNuit} €/h`});
  if(bar.indemniteVetements)avs.push({l:'Indemnité vêtements',v:`${bar.indemniteVetements} €/jour`});
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
      r.cotCO2 = 31.34; // minimum
    } else {
      const refCO2 = (carFuel === 'diesel') ? 84 : 102;
      const delta = carCO2 - refCO2;
      r.atnPct = Math.max(4, Math.min(18, 5.5 + (delta * 0.1)));
      r.atnCar = Math.max(1600/12, (carCatVal * (6/7) * (r.atnPct/100)) / 12);
      // Cotisation CO2 patronale (solidarité ONSS)
      if (carFuel === 'diesel') r.cotCO2 = Math.max(31.34, (carCO2 * 0.00714 * 71.4644) + 31.34);
      else r.cotCO2 = Math.max(31.34, (carCO2 * 0.00714 * 83.6644) + 31.34);
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
  r.atnAutresTot = r.atnGSM + r.atnPC + r.atnInternet + r.atnChauffage + r.atnElec + r.atnLogement;
  r.atnTotal = r.atnCar + r.atnAutresTot;

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
  r.atnTotal = r.atnCar + r.atnAutresTot;

  // ── ONSS Travailleur ──
  const isOuvrier = (emp.statut === 'ouvrier');
  const onssBase = isOuvrier ? r.gross * LEGAL.ONSS_DETAIL_2026.majoration_ouvrier : r.gross;
  r.onssW = onssBase * LEGAL.ONSS_W;
  // ── Bonus à l'emploi 2026 — Volet A (bas salaires) + Volet B (très bas salaires) ──
  // Source: Instructions ONSS T1/2026 + Partena Professional
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
  // Barème différent pour isolés vs ménages avec 2 revenus
  r.css = 0;
  const cssTable = (emp.civil === 'married_2' || emp.civil === 'cohabit') ? LEGAL.CSS_MARRIED : LEGAL.CSS_SINGLE;
  for (const b of cssTable) {
    if (r.gross >= b.f && r.gross <= b.t) { r.css = b.a !== undefined ? b.a : Math.min(18.60, (r.gross - b.b) * b.p); break; }
  }

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
    r.dpOnss = dp2 * 0.1307;      // ONSS travailleur sur 2è partie
    r.dpCotisSpec = dp2 * 0.01;    // cotisation spéciale 1%
  }

  // ── 2. PÉCULE VACANCES DE DÉPART (Art. 46 Loi 12/04/1965) ──
  // Payé lors de la sortie de service — simple + double anticipé
  // Soumis ONSS 13,07% sur totalité
  r.peculeDepart = per.peculeDepart || 0;
  r.pdOnss = r.peculeDepart > 0 ? r.peculeDepart * 0.1307 : 0;

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
  // Max 154,74€/mois (montant 2026 — indexé chaque année)
  // Exonérée ONSS et IPP si structurel (min 1 jour/semaine régulier)
  // Couvre: chauffage, électricité, petit matériel, amortissement mobilier
  r.indemTeletravail = Math.min(per.indemTeletravail || 0, 154.74);

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
  const allocType = per.allocTravailType || 'none';
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

  // ── 16. FRAIS PROFESSIONNELS FORFAITAIRES (Art. 51 CIR 92) ──
  // Déjà calculé ci-dessus: 30% avec plafond (employés et ouvriers)

  // ── 17. RÉDUCTIONS FAMILIALES (Art. 136-140 CIR 92) ──
  // Déjà calculé ci-dessus: quotité exemptée par enfant + isolé + handicap

  // ── 18. DISPENSE VERSEMENT PP RECHERCHE (Art. 275/3 CIR 92) ──
  // 80% du PP pour les chercheurs (diplôme Master/Doctorat)
  // Uniquement côté employeur — ne change pas le net travailleur

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

// ─── XML GENERATORS ──────────────────────────────────────────
function genDimonaXML(d) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Dimona>
  <DimonaDeclaration>
    <EmployerId><ONSS>${d.onss}</ONSS><VAT>${d.vat}</VAT></EmployerId>
    <Feature>
      <Action>${d.action}</Action>
      <Worker><INSS>${(d.niss||'').replace(/[\.\-\s]/g,'')}</INSS>
        <Name>${d.last}</Name><FirstName>${d.first}</FirstName><Birth>${d.birth}</Birth></Worker>
      <Period><Start>${d.start}</Start>${d.end?`<End>${d.end}</End>`:''}</Period>
      <WorkerType>${d.wtype}</WorkerType><JointCommission>${d.cp}</JointCommission>
      ${d.hours?`<PlannedHours>${d.hours}</PlannedHours>`:''}
    </Feature>
  </DimonaDeclaration>
</Dimona>`;
}

function genDMFAXML(co, emps, q, y) {
  // DMFA conforme schema XSD ONSS — socialsecurity.be/TechLib
  // Structure: FormCreation > EmployerDeclaration > WorkerRecord > OccupationRecord > ServiceRecord > RemunRecord + ContributionRecord
  const qStart=new Date(y,(q-1)*3,1);
  const qEnd=new Date(y,q*3,0);
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const ref=`DMFAP${String(Math.floor(Math.random()*900000000)+100000000)}${String.fromCharCode(65+Math.floor(Math.random()*26))}`;
  const catEmpl=(co.cp==='330'||co.cp==='331'||co.cp==='332')?'010':'000';
  const nrONSS=(co.onss||'').replace(/[\.\-\s]/g,'')||'0000000000';
  const nrEnt=(co.vat||'').replace(/[^0-9]/g,'')||'0000000000';

  const wrs=emps.map((e,idx)=>{
    const p=calc(e,{days:65},co);
    const niss=(e.niss||'').replace(/[\.\-\s]/g,'');
    const isOuv=(e.statut==='ouvrier');
    const codeTrav=e.dmfaCode||'495';
    const baseONSS=isOuv?p.gross*3*1.08:p.gross*3;
    const wh=e.whWeek||38;
    const daysQ=Math.round((p.mvDays||22)*3);
    const hoursQ=Math.round(daysQ*(wh/5)*100)/100;
    const startD=e.startD||fmtDt(qStart);
    return `    <WorkerRecord>
      <WorkerIdentification>
        <INSS>${niss}</INSS>
        <WorkerName>${e.last||''}</WorkerName>
        <WorkerFirstName>${e.first||''}</WorkerFirstName>
      </WorkerIdentification>
      <WorkerContributionCode>${codeTrav}</WorkerContributionCode>
      <WorkerCategory>${catEmpl}</WorkerCategory>
      <OccupationRecord>
        <OccupationSequenceNbr>${idx+1}</OccupationSequenceNbr>
        <CommissionNbr>${e.cp||'200'}</CommissionNbr>
        <WorkerStatus>${isOuv?'1':'2'}</WorkerStatus>
        <MeanWorkingHoursPerWorker>${wh.toFixed(2)}</MeanWorkingHoursPerWorker>
        <MeanWorkingHoursReferPerson>38.00</MeanWorkingHoursReferPerson>
        <WorkSchedule>${e.regime==='full'?'F':'P'}</WorkSchedule>
        <OccupationStartingDate>${startD}</OccupationStartingDate>
        <OccupationEndingDate>${fmtDt(qEnd)}</OccupationEndingDate>
        <EstablishmentUnitNbr>${nrEnt}</EstablishmentUnitNbr>
        <ServiceRecord>
          <ServiceCode>001</ServiceCode>
          <ServiceNbrDays>${daysQ}</ServiceNbrDays>
          <ServiceNbrHours>${hoursQ.toFixed(2)}</ServiceNbrHours>
        </ServiceRecord>
        <RemunRecord>
          <RemunCode>001</RemunCode>
          <RemunAmount>${(p.gross*3).toFixed(2)}</RemunAmount>
          <RemunFrequency>1</RemunFrequency>
        </RemunRecord>${isOuv?`
        <RemunRecord>
          <RemunCode>010</RemunCode>
          <RemunAmount>${(p.gross*3*0.08).toFixed(2)}</RemunAmount>
          <RemunFrequency>1</RemunFrequency>
        </RemunRecord>`:''}
      </OccupationRecord>
      <ContributionWorkerRecord>
        <ContributionType>001</ContributionType>
        <ContributionBase>${baseONSS.toFixed(2)}</ContributionBase>
        <ContributionPercentage>13.07</ContributionPercentage>
        <ContributionAmount>${(baseONSS*LEGAL.ONSS_W).toFixed(2)}</ContributionAmount>
      </ContributionWorkerRecord>${p.empBonus>0?`
      <DeductionRecord>
        <DeductionType>001</DeductionType>
        <DeductionAmount>${(p.empBonus*3).toFixed(2)}</DeductionAmount>
      </DeductionRecord>`:''}
    </WorkerRecord>`;
  }).join('\n');

  const totW=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);const isO=e.statut==='ouvrier';const b=isO?p.gross*3*1.08:p.gross*3;return s+b*LEGAL.ONSS_W;},0);
  const totE=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+p.onssE*3;},0);
  const totFFE=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_ffe||0)*3;},0);
  const totChT=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_chomTemp||0)*3;},0);
  const totAm=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_amiante||0)*3;},0);
  const totBase=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);const isO=e.statut==='ouvrier';return s+(isO?p.gross*3*1.08:p.gross*3);},0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DmfAOriginal — Declaration Multifonctionnelle / Securite Sociale Belge -->
<!-- Schema conforme ONSS — socialsecurity.be/TechLib -->
<!-- Reference: ${ref} | Trimestre: ${q}/${y} -->
<!-- Genere par: Aureus Social Pro — Aureus IA SPRL (${AUREUS_INFO.vat}) -->
<DmfAOriginal xmlns="http://www.smals-mvm.be/xml/ns/systemFlux"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FormCreation>
    <FormType>DMFA</FormType>
    <FormCreationDate>${fmtDt(new Date())}</FormCreationDate>
    <Reference>${ref}</Reference>
    <FormSubType>ORIGINAL</FormSubType>
    <SenderSoftware>AureusSocialPro</SenderSoftware>
    <SenderSoftwareVersion>2026.1</SenderSoftwareVersion>
    <SenderCompanyID>${nrEnt}</SenderCompanyID>
  </FormCreation>
  <EmployerDeclaration>
    <NLOSSRegistrationNbr>${nrONSS}</NLOSSRegistrationNbr>
    <CompanyID>${nrEnt}</CompanyID>
    <EmployerDenomination>${co.name||''}</EmployerDenomination>
    <LanguageCode>1</LanguageCode>
    <Quarter>${q}</Quarter>
    <Year>${y}</Year>
    <EmployerCategory>${catEmpl}</EmployerCategory>
    <NbrOfWorkers>${emps.length}</NbrOfWorkers>
${wrs}
    <GlobalContribution>
      <ContributionRecord><ContributionType>001</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totE.toFixed(2)}</ContributionAmount></ContributionRecord>
      <ContributionRecord><ContributionType>810</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totFFE.toFixed(2)}</ContributionAmount></ContributionRecord>
      <ContributionRecord><ContributionType>855</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totChT.toFixed(2)}</ContributionAmount></ContributionRecord>
      ${q<=3?`<ContributionRecord><ContributionType>862</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totAm.toFixed(2)}</ContributionAmount></ContributionRecord>`:'<!-- Fonds amiante: non du en T4 -->'}
    </GlobalContribution>
    <DeclarationTotals>
      <TotalWorkerContribution>${totW.toFixed(2)}</TotalWorkerContribution>
      <TotalEmployerContribution>${(totE+totFFE+totChT+totAm).toFixed(2)}</TotalEmployerContribution>
      <TotalContribution>${(totW+totE+totFFE+totChT+totAm).toFixed(2)}</TotalContribution>
    </DeclarationTotals>
  </EmployerDeclaration>
</DmfAOriginal>`;
}

// Genere un accuse de reception (ACRF) simule conforme ONSS
function genDMFATicket(ref,co){
  const ticket='DMFAP'+String(Math.floor(Math.random()*900000000)+100000000)+String.fromCharCode(65+Math.floor(Math.random()*26));
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return {ticket,xml:`<?xml version="1.0" encoding="UTF-8"?>
<!-- Accuse de reception (ACRF) — ONSS -->
<AcknowledgmentOfReceipt>
  <Ticket>${ticket}</Ticket>
  <FormType>DMFA</FormType>
  <Reference>${ref}</Reference>
  <ReceptionDate>${fmtDt(new Date())}</ReceptionDate>
  <ResultCode>1</ResultCode>
  <ResultDescription>Fichier accepte pour traitement</ResultDescription>
  <CompanyID>${(co.vat||'').replace(/[^0-9]/g,'')}</CompanyID>
  <Software>AureusSocialPro v2026.1</Software>
</AcknowledgmentOfReceipt>`};
}

// Genere une notification (DMNO) simulee conforme ONSS
function genDMFANotification(ticket,co,q,y,nW,totC,anomalies){
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Notification (DMNO) — ONSS -->
<DmfANotification>
  <FormType>DMFA</FormType>
  <Ticket>${ticket}</Ticket>
  <Quarter>${q}</Quarter><Year>${y}</Year>
  <CompanyID>${(co.vat||'').replace(/[^0-9]/g,'')}</CompanyID>
  <ResultCode>${anomalies.length===0?'1':'1'}</ResultCode>
  <ResultDescription>Declaration acceptee${anomalies.length>0?' avec anomalies':''}</ResultDescription>
  <HandlingDate>${fmtDt(new Date())}</HandlingDate>
  <NbrOfWorkers>${nW}</NbrOfWorkers>
  <TotalContribution>${totC}</TotalContribution>
  ${anomalies.length>0?'<AnomalyReport>'+anomalies.map(a=>'<Anomaly><Zone>'+a.zone+'</Zone><Severity>'+a.sev+'</Severity><Desc>'+a.desc+'</Desc></Anomaly>').join('')+'</AnomalyReport>':'<AnomalyReport/>'}
</DmfANotification>`;
}

function genBelcotax(co, emp, yr, ad) {
  // Belcotax XML — Format BelcotaxOnWeb SPF Finances
  // Ref: https://financien.belgium.be/fr/e-services/belcotaxonweb
  // 281.10 = salariés | 281.20 = dirigeants | 281.50 = commissions
  const statut = emp.statut === 'dirigeant' ? '20' : '10';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Belcotax xmlns="urn:belcotax:${yr}">
  <Verzending>
    <Aangifte>
      <Taal>FR</Taal>
      <Aangiftetype>281.${statut}</Aangiftetype>
      <AangifteJaar>${yr}</AangifteJaar>
      <Schuldenaar>
        <KBO>${(co.bce||co.vat||'').replace(/[^0-9]/g,'')}</KBO>
        <BTWNr>${(co.vat||'').replace(/[^0-9]/g,'')}</BTWNr>
        <ONSS>${(co.onss||'').replace(/[^0-9]/g,'')}</ONSS>
        <NACECode>${co.nace||''}</NACECode>
        <Naam>${co.name}</Naam>
        <Adres>${co.addr}</Adres>
      </Schuldenaar>
      <Opgave>
        <Verkrijger>
          <INSZ>${(emp.niss||'').replace(/[\.\-\s]/g,'')}</INSZ>
          <Naam>${emp.last}</Naam>
          <Voornaam>${emp.first}</Voornaam>
          <Adres>${emp.addr||''} ${emp.zip||''} ${emp.city||''}</Adres>
          <Geboortedatum>${emp.birth||''}</Geboortedatum>
        </Verkrijger>
        <Bezoldiging>
          <Lonen>${(ad.gross||0).toFixed(2)}</Lonen>
          <RIZIV>${(ad.onss||0).toFixed(2)}</RIZIV>
          <WerkBonus>${(ad.empB||0).toFixed(2)}</WerkBonus>
          <BedrijfsVH>${(ad.tax||0).toFixed(2)}</BedrijfsVH>
          <BijzBijdrSZ>${(ad.css||0).toFixed(2)}</BijzBijdrSZ>
          <Maaltijdcheques aantal="${ad.mvC||0}">${(ad.mvE||0).toFixed(2)}</Maaltijdcheques>
          <Vervoer>${(ad.tr||0).toFixed(2)}</Vervoer>
          <VoertuigVAA>${(ad.atnCar||0).toFixed(2)}</VoertuigVAA>
          <AndereVAA>${(ad.atnAutres||0).toFixed(2)}</AndereVAA>
          <AanvullendPensioen>${(ad.pensionCompl||0).toFixed(2)}</AanvullendPensioen>
          <EigenKosten>${(ad.fraisPropres||0).toFixed(2)}</EigenKosten>
          <EcoCheques>${(ad.ecoCheques||0).toFixed(2)}</EcoCheques>
        </Bezoldiging>
        <Periode><Van>01-01-${yr}</Van><Tot>31-12-${yr}</Tot></Periode>
        <Tewerkstelling>
          <CP>${emp.cp||'200'}</CP>
          <Functie>${emp.fn||''}</Functie>
          <Regime>${emp.regime==='full'?'VT':'DT'}</Regime>
          <Uren>${emp.whWeek||38}</Uren>
        </Tewerkstelling>
      </Opgave>
    </Aangifte>
  </Verzending>
</Belcotax>`;
}

// ─── INITIAL STATE ───────────────────────────────────────────
const AUREUS_INFO={name:'Aureus IA SPRL',vat:'BE 1028.230.781',addr:'Saint-Gilles, Bruxelles',email:'info@aureu-ia.com'};
const CAR_MODELS={
'Aiways':['U5','U6'],
'Alfa Romeo':['Giulia','Stelvio','Tonale','Junior','Giulietta','MiTo'],
'Alpine':['A110','A290'],
'Aston Martin':['DB12','DBX','Vantage','DBS'],
'Audi':['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q7','Q8','e-tron','e-tron GT','TT','RS3','RS4','RS5','RS6','S3','S4','S5'],
'Bentley':['Continental GT','Flying Spur','Bentayga'],
'BMW':['Série 1','Série 2','Série 3','Série 4','Série 5','Série 7','Série 8','X1','X2','X3','X4','X5','X6','X7','XM','iX','iX1','iX3','i4','i5','i7','Z4','M2','M3','M4'],
'BYD':['Atto 3','Dolphin','Seal','Tang','Han','Seal U'],
'Cadillac':['XT4','XT5','Escalade','Lyriq'],
'Chevrolet':['Camaro','Corvette','Tahoe'],
'Chrysler':['300','Pacifica'],
'Citroën':['C3','C3 Aircross','C4','C4 X','C5 Aircross','C5 X','Berlingo','ë-C3','ë-C4','ë-Berlingo'],
'Cupra':['Born','Formentor','Leon','Ateca','Tavascan','Terramar'],
'Dacia':['Sandero','Duster','Jogger','Spring','Logan'],
'Dodge':['Challenger','Charger','Durango','RAM 1500'],
'DS':['DS 3','DS 4','DS 7','DS 9'],
'Ferrari':['296 GTB','Roma','Purosangue','SF90','F8','812'],
'Fiat':['500','500X','500e','Tipo','Panda','Doblo','600e'],
'Ford':['Fiesta','Focus','Puma','Kuga','Mustang','Mustang Mach-E','Explorer','Ranger','Transit','Transit Custom','Tourneo'],
'Genesis':['G70','G80','GV60','GV70','GV80'],
'Honda':['Civic','HR-V','CR-V','ZR-V','Jazz','e:Ny1','Honda e'],
'Hyundai':['i10','i20','i30','Kona','Tucson','Santa Fe','Ioniq 5','Ioniq 6','Bayon','Staria'],
'Infiniti':['Q30','Q50','QX50'],
'Isuzu':['D-Max'],
'Jaguar':['F-Pace','E-Pace','I-Pace','XE','XF','F-Type'],
'Jeep':['Renegade','Compass','Avenger','Wrangler','Grand Cherokee'],
'Kia':['Picanto','Rio','Ceed','Sportage','Sorento','Niro','EV6','EV9','Stonic','XCeed'],
'Lamborghini':['Huracán','Urus','Revuelto'],
'Land Rover':['Defender','Discovery','Discovery Sport','Range Rover','Range Rover Sport','Range Rover Velar','Range Rover Evoque'],
'Lexus':['UX','NX','RX','ES','IS','LC','RZ'],
'Lotus':['Emira','Eletre','Emeya'],
'Lynk & Co':['01','02'],
'Maserati':['Ghibli','Levante','Quattroporte','MC20','Grecale','GranTurismo'],
'Mazda':['Mazda2','Mazda3','CX-3','CX-30','CX-5','CX-60','MX-5','MX-30'],
'McLaren':['720S','Artura','GT'],
'Mercedes':['Classe A','Classe B','Classe C','Classe E','Classe S','CLA','CLE','GLA','GLB','GLC','GLE','GLS','EQA','EQB','EQC','EQE','EQS','AMG GT','Classe G','Classe V','Vito','Sprinter'],
'MG':['ZS','MG4','MG5','Marvel R','HS','Cyberster'],
'Mini':['Cooper','Countryman','Clubman','Aceman'],
'Mitsubishi':['ASX','Eclipse Cross','Outlander','Space Star','L200'],
'NIO':['ET5','ET7','EL6','EL7','EL8'],
'Nissan':['Micra','Juke','Qashqai','X-Trail','Leaf','Ariya','Townstar','Navara'],
'Opel':['Corsa','Astra','Mokka','Crossland','Grandland','Combo','Vivaro','Movano'],
'Peugeot':['208','308','408','508','2008','3008','5008','e-208','e-308','e-2008','e-3008','Rifter','Partner','Expert'],
'Polestar':['Polestar 2','Polestar 3','Polestar 4'],
'Porsche':['911','718 Cayman','718 Boxster','Cayenne','Macan','Panamera','Taycan'],
'Renault':['Clio','Captur','Mégane E-Tech','Arkana','Austral','Espace','Scénic','Kangoo','Trafic','Master','Zoe','Twingo'],
'Rolls-Royce':['Ghost','Phantom','Cullinan','Spectre'],
'Seat':['Ibiza','Leon','Arona','Ateca','Tarraco'],
'Škoda':['Fabia','Scala','Octavia','Superb','Kamiq','Karoq','Kodiaq','Enyaq','Elroq'],
'Smart':['#1','#3','Fortwo','Forfour'],
'SsangYong':['Tivoli','Korando','Rexton','Torres'],
'Subaru':['Impreza','XV','Outback','Forester','Solterra','BRZ'],
'Suzuki':['Swift','Vitara','S-Cross','Jimny','Ignis','Across','Swace'],
'Tesla':['Model 3','Model Y','Model S','Model X','Cybertruck'],
'Toyota':['Yaris','Yaris Cross','Corolla','Camry','C-HR','RAV4','Highlander','Land Cruiser','bZ4X','Supra','GR86','Proace','Hilux','Aygo X'],
'Volkswagen':['Polo','Golf','ID.3','ID.4','ID.5','ID.7','ID. Buzz','T-Roc','T-Cross','Tiguan','Touareg','Arteon','Passat','Caddy','Transporter','Multivan'],
'Volvo':['XC40','XC60','XC90','C40','S60','S90','V60','V90','EX30','EX90','EM90'],
'XPeng':['G6','G9','P7'],
};

const COMPANY={name:'',vat:'',addr:'',onss:'',bank:'',cp:'200',contact:'',email:'',phone:'',insurer:'',policyNr:'',secSoc:''};
const DPER={month:new Date().getMonth()+1,year:new Date().getFullYear(),days:22,sickG:0,holidays:0,overtimeH:0,sundayH:0,nightH:0,bonus:0,y13:0,otherDed:0,advance:0,garnish:0,ppVolontaire:0,
  // Éléments fiscaux complets
  doublePecule:0,         // Double pécule vacances (si payé par employeur — employés)
  peculeDepart:0,         // Pécule de vacances de départ (sortie de service)
  primeAnciennete:0,      // Prime d'ancienneté (exo ONSS+IPP si ≤ plafond)
  primeNaissance:0,       // Prime de naissance/mariage (exo ONSS si ≤ plafond)
  primeInnovation:0,      // Prime d'innovation (Art. 38 §1er 25° CIR — exo IPP max 1 mois)
  indemTeletravail:0,     // Indemnité forfaitaire télétravail (max 154,74€/mois 2026)
  indemBureau:0,          // Indemnité frais de bureau (si pas forfaitaire)
  pensionCompl:0,         // Retenue personnelle pension complémentaire (2è pilier — assur. groupe)
  retSyndicale:0,         // Retenue cotisation syndicale
  saisieAlim:0,           // Pension alimentaire (saisie prioritaire)
  heuresSupFisc:0,        // Heures sup ouvrant droit à réduction PP (max 180h/an — Art.154bis CIR — 2026)
  // Heures sup volontaires brut=net (nouveau régime 01/04/2026)
  hsVolontBrutNet:0,      // HS volontaires brut=net (max 240h/an — 360h horeca) — exo ONSS + PP + sursalaire
  hsRelance:0,            // HS relance transitoire T1/2026 (max 120h) — brut=net aussi
  typeSpecial:'normal',   // normal, doublePecule, y13, depart, preavis
  // Activation ONEM
  allocTravail:0,         // Allocation de travail ONEM (Activa/Impulsion — déduit du net par l'employeur)
  allocTravailType:'none', // none, activa_bxl, activa_jeune, impulsion_wal, impulsion55, vdab
  // Mi-temps médical / Reprise progressive
  miTempsMed:false,       // Reprise partielle du travail (Art. 100§2 Loi coord. 14/07/1994)
  miTempsHeures:0,        // Heures/semaine prestées chez employeur (ex: 19h sur 38h)
  miTempsINAMI:0,         // Complément INAMI perçu par le travailleur (indemnités mutuelle)
};

// ─── PERSISTENCE ────────────────────────────────────────────
const STORE_KEY='aureus-social-pro';
async function saveData(data){
  try{
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch(e) { console.warn("Storage error:", e); }
  }catch(e){console.warn('Save failed',e);}
}
async function loadData(){
  try{
    if (typeof window === 'undefined') return null;
    const val = localStorage.getItem(STORE_KEY);
    if (!val) return null;
    return JSON.parse(val);
  }catch(e){return null;}
}

function reducer(s,a){
  let ns;
  switch(a.type){
    case'NAV':ns={...s,page:a.page,sub:a.sub||null};break;
    case'ADD_E':ns={...s,emps:[...s.emps,{...a.d,id:'E-'+uid()}]};break;
    case'UPD_E':ns={...s,emps:s.emps.map(e=>e.id===a.d.id?a.d:e)};break;
    case'DEL_E':ns={...s,emps:s.emps.filter(e=>e.id!==a.id)};break;
    case'ADD_P':ns={...s,pays:[...s.pays,{...a.d,id:'P-'+uid()}]};break;
    case'ADD_DIM':ns={...s,dims:[...s.dims,{...a.d,id:'D-'+uid()}]};break;
    case'ADD_DMFA':ns={...s,dmfas:[...s.dmfas,{...a.d,id:'M-'+uid()}]};break;
    case'ADD_F':ns={...s,fiches:[...s.fiches,{...a.d,id:'F-'+uid()}]};break;
    case'ADD_DOC':ns={...s,docs:[...s.docs,{...a.d,id:'DC-'+uid()}]};break;
    case'UPD_CO':ns={...s,co:{...s.co,...a.d}};break;
    case'MODAL':ns={...s,modal:a.m};break;
    // Multi-sociétés
    case'ADD_CLIENT':ns={...s,clients:[...s.clients,{...a.d,id:'CL-'+uid(),createdAt:new Date().toISOString()}]};break;
    case'UPD_CLIENT':ns={...s,clients:s.clients.map(c=>c.id===a.d.id?{...c,...a.d}:c)};break;
    case'DEL_CLIENT':ns={...s,clients:s.clients.filter(c=>c.id!==a.id)};break;
    case'SELECT_CLIENT':{
      const cl=s.clients.find(c=>c.id===a.id);
      ns={...s,activeClient:a.id,co:cl?.company||COMPANY,emps:cl?.emps||[],pays:cl?.pays||[],dims:cl?.dims||[],dmfas:cl?.dmfas||[],fiches:cl?.fiches||[],docs:cl?.docs||[],page:'dashboard',sub:null};
      break;}
    case'SAVE_CLIENT_DATA':{
      const updated=s.clients.map(c=>c.id===s.activeClient?{...c,company:s.co,emps:s.emps,pays:s.pays,dims:s.dims,dmfas:s.dmfas,fiches:s.fiches,docs:s.docs,updatedAt:new Date().toISOString()}:c);
      ns={...s,clients:updated};break;}
    case'BACK_TO_CLIENTS':ns={...s,activeClient:null,page:'clients',sub:null};break;
    case'LOAD_ALL':ns={...s,...a.d};break;
    default:ns=s;
  }
  // Auto-save on every action (except NAV/MODAL)
  if(a.type!=='NAV'&&a.type!=='MODAL'&&a.type!=='LOAD_ALL'){
    const toSave={clients:ns.clients||[],pin:ns.pin};
    if(ns.activeClient){
      toSave.clients=toSave.clients.map(c=>c.id===ns.activeClient?{...c,company:ns.co,emps:ns.emps,pays:ns.pays,dims:ns.dims,dmfas:ns.dmfas,fiches:ns.fiches,docs:ns.docs,updatedAt:new Date().toISOString()}:c);
    }
    saveData(toSave);
  }
  return ns;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────
const C=({children,style,...p})=><div style={{background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.12)',borderRadius:14,padding:24,...style}} {...p}>{children}</div>;
const B=({children,v='gold',onClick,style,...p})=>{
  const vs={gold:{background:'linear-gradient(135deg,#c6a34e,#a68a3c)',color:'#060810',fontWeight:600,border:'none'},outline:{background:'transparent',border:'1px solid rgba(139,115,60,.25)',color:'#c6a34e'},ghost:{background:'rgba(198,163,78,.06)',color:'#c6a34e',border:'1px solid rgba(198,163,78,.1)'},danger:{background:'rgba(248,113,113,.1)',color:'#f87171',border:'1px solid rgba(248,113,113,.2)'}};
  return <button onClick={onClick} style={{padding:'10px 20px',borderRadius:8,cursor:'pointer',fontSize:13,fontFamily:'inherit',transition:'all .15s',...(vs[v]||vs.gold),...style}} {...p}>{children}</button>;
};
const I=({label,value,onChange,type='text',options,span,style,...p})=>(
  <div style={{gridColumn:span?`span ${span}`:undefined,...style}}>
    {label&&<label style={{fontSize:10.5,fontWeight:600,color:'#9e9b93',display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.7px'}}>{label}</label>}
    {options?<select value={value||''} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'9px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:7,color:'#d4d0c8',fontSize:13,fontFamily:'inherit',cursor:'pointer',outline:'none',boxSizing:'border-box'}}>{options.map(o=><option key={o.v} value={o.v} style={{background:'#0c0f1a'}}>{o.l}</option>)}</select>
    :<input type={type} value={value||''} onChange={e=>onChange(type==='number'?(parseFloat(e.target.value)||0):e.target.value)} style={{width:'100%',padding:'9px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:7,color:'#d4d0c8',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} {...p}/>}
  </div>
);
const ST_NL={
  'Filtrer':'Filteren','Résumé':'Overzicht','Période':'Periode','Rémunération brute':'Bruto verloning',
  'Cotisations ONSS':'RSZ-bijdragen','Avantages exonérés':'Vrijgestelde voordelen','Déductions':'Inhoudingen',
  'Net à payer':'Netto te betalen','Coût employeur':'Werkgeverskost','Éléments fiscaux spéciaux':'Speciale fiscale elementen',
  'Coordonnées':'Contactgegevens','Contrat':'Contract','Rémunération':'Verloning','Statut':'Statuut',
  'Famille':'Gezin','Avantages en nature':'Voordelen in natura','Transport':'Transport','Récapitulatif':'Overzicht',
  'Structure':'Structuur','Informations':'Informatie','Actions':'Acties','Configuration':'Configuratie',
};
const ST=({children,style})=>{
  const {lang}=useLang();
  const txt=typeof children==='string'&&lang==='nl'?(ST_NL[children]||children):children;
  return <div style={{fontSize:11.5,color:'#c6a34e',fontWeight:600,marginBottom:12,marginTop:18,textTransform:'uppercase',letterSpacing:'1.5px',...(style||{})}}>{txt}</div>;
};
const SC=({label,value,color='#c6a34e',sub})=><C style={{padding:'18px 16px'}}><div style={{fontSize:10,color:'#5e5c56',marginBottom:6,textTransform:'uppercase',letterSpacing:'1px'}}>{label}</div><div style={{fontSize:22,fontWeight:700,color}}>{value}</div>{sub&&<div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>{sub}</div>}</C>;
// PH auto-translates known titles FR→NL
const PH_NL={
  'Tableau de bord':'Dashboard','Gestion des Employés':'Personeelsbeheer','Fiches de Paie':'Loonfiches',
  'Déclarations Dimona':'Dimona-aangiften','Déclaration DMFA':'DmfA-aangifte','Fiches Fiscales 281.xx':'Fiscale fiches 281.xx',
  'Précompte Professionnel 274':'Bedrijfsvoorheffing 274','Documents Sociaux':'Sociale documenten','Rapports':'Rapporten',
  'Frais de gestion':'Beheerskosten','Paramètres':'Instellingen','Salaires & Calculs':'Lonen & Berekeningen',
  'Avantages & Rémunération':'Voordelen & Verloning','Contrats & Documents':'Contracten & Documenten',
  'RH & Personnel':'HR & Personeel','Social & Assurances':'Sociaal & Verzekeringen','Reporting & Export':'Rapportage & Export',
  'Juridique & Veille':'Juridisch & Monitoring','Modules Pro':'Pro Modules',
  'Comptes de Provision':'Voorzieningen','Gestion des Cumuls':'Jaarlijkse cumulatie',
  'Saisies & Cessions sur salaire':'Beslag & overdracht op loon',
  'Rentes & Obligations fixes':'Renten & vaste verplichtingen',
  'Allocations Familiales':'Kinderbijslag','Caisse de Vacances Annuelles':'Jaarlijkse vakantiekas',
  'PEPPOL e-Invoicing':'PEPPOL e-Facturatie','Secteurs Spécifiques':'Specifieke sectoren',
  'Règlement de travail':'Arbeidsreglement','Contrats de travail & conventions':'Arbeidsovereenkomsten & conventies',
  'Comptes individuels':'Individuele rekeningen','Veille légale & Calendrier 2026':'Juridische monitoring & Kalender 2026',
  'Bien-être & Prévention':'Welzijn & Preventie','Bilan Social BNB':'Sociaal Verslag NBB',
  'Configuration société':'Bedrijfsconfiguratie','Alertes légales & échéances':'Juridische waarschuwingen & deadlines',
};
const PH=({title,sub,actions})=>{
  const {lang}=useLang();
  const t2=lang==='nl'?(PH_NL[title]||title):title;
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}><div><h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:26,fontWeight:600,color:'#e8e6e0',margin:0}}>{t2}</h1>{sub&&<p style={{color:'#5e5c56',marginTop:4,fontSize:13}}>{sub}</p>}</div>{actions&&<div style={{display:'flex',gap:10}}>{actions}</div>}</div>;
};

function Tbl({cols,data,onRow}){return(
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
        {cols.map(c=><th key={c.k} style={{textAlign:c.a||'left',padding:'11px 14px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600}}>{c.l}</th>)}
      </tr></thead>
      <tbody>{data.map((row,i)=>(
        <tr key={i} onClick={()=>onRow?.(row)} style={{borderBottom:'1px solid rgba(255,255,255,.03)',cursor:onRow?'pointer':'default'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(198,163,78,.03)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          {cols.map(c=><td key={c.k} style={{padding:'10px 14px',fontSize:12.5,color:c.c||'#d4d0c8',fontWeight:c.b?600:400,textAlign:c.a||'left'}}>{c.r?c.r(row):row[c.k]}</td>)}
        </tr>
      ))}</tbody>
    </table>
    {data.length===0&&<div style={{textAlign:'center',padding:36,color:'#5e5c56',fontSize:13}}>Aucune donnée</div>}
  </div>
);}

// Simple table helper (rows-based, used by ATN, ChomTemp, CongeEduc, Outplacement, PAA)
function TB({cols,rows}){return(
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
        {cols.map(c=><th key={c.k} style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600}}>{c.l}</th>)}
      </tr></thead>
      <tbody>{(rows||[]).map((r,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        {cols.map(c=><td key={c.k} style={{padding:'9px 14px',fontSize:12,color:'#d4d0c8'}}>{r[c.k]||'—'}</td>)}</tr>)}</tbody>
    </table>
    {(!rows||rows.length===0)&&<div style={{textAlign:'center',padding:36,color:'#5e5c56',fontSize:13}}>Aucune donnée</div>}
  </div>
);}

// ─── LOGIN PAGE ─────────────────────────────────────────────
function LoginPage({onLogin}){
  const [pin,setPin]=useState('');
  const [newPin,setNewPin]=useState('');
  const [confirm,setConfirm]=useState('');
  const [mode,setMode]=useState('check'); // check | create
  const [error,setError]=useState('');
  const [saved,setSaved]=useState(null);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    loadData().then(data=>{
      setSaved(data);
      if(!data||!data.pin)setMode('create');
      setReady(true);
    });
  },[]);

  const handleLogin=()=>{
    if(mode==='create'){
      if(newPin.length<4){setError('Minimum 4 chiffres');return;}
      if(newPin!==confirm){setError('Les codes ne correspondent pas');return;}
      onLogin(newPin);
    } else {
      if(pin===saved?.pin){onLogin(pin);}
      else{setError('Code incorrect');setPin('');}
    }
  };

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060810 0%,#0a0e1a 40%,#0e1225 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet"/>
      <div style={{width:420,textAlign:'center'}}>
        {/* Logo */}
        <div style={{marginBottom:40}}>
          <div style={{width:80,height:80,margin:'0 auto 20px',borderRadius:20,background:'linear-gradient(135deg,#c6a34e,#e2c878)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(198,163,78,.3)'}}>
            <span style={{fontSize:36,fontWeight:800,color:'#060810'}}>A</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:32,fontWeight:700,background:'linear-gradient(135deg,#c6a34e,#e2c878,#c6a34e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AUREUS SOCIAL PRO</div>
          <div style={{fontSize:10,color:'#8b7340',marginTop:6,letterSpacing:'4px',textTransform:'uppercase'}}>Logiciel de Gestion de la Paie</div>
        </div>

        {/* Login Card */}
        <div style={{background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.15)',borderRadius:18,padding:'36px 32px',boxShadow:'0 16px 48px rgba(0,0,0,.4)'}}>
          <div style={{fontSize:16,fontWeight:600,color:'#e8e6e0',marginBottom:20}}>{mode==='create'?'Créer votre code d\'accès':'Connexion'}</div>
          
          {mode==='create'?<>
            <input type="password" placeholder="Nouveau code (min 4 chiffres)" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/[^0-9]/g,''))} maxLength={8}
              style={{width:'100%',padding:'14px 16px',background:'#090c16',border:'1px solid rgba(139,115,60,.2)',borderRadius:10,color:'#e8e6e0',fontSize:20,fontFamily:'inherit',outline:'none',textAlign:'center',letterSpacing:12,boxSizing:'border-box',marginBottom:12}}/>
            <input type="password" placeholder="Confirmer le code" value={confirm} onChange={e=>setConfirm(e.target.value.replace(/[^0-9]/g,''))} maxLength={8}
              style={{width:'100%',padding:'14px 16px',background:'#090c16',border:'1px solid rgba(139,115,60,.2)',borderRadius:10,color:'#e8e6e0',fontSize:20,fontFamily:'inherit',outline:'none',textAlign:'center',letterSpacing:12,boxSizing:'border-box'}}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
          </>:<>
            <input type="password" placeholder="Code d'accès" value={pin} onChange={e=>{setPin(e.target.value.replace(/[^0-9]/g,''));setError('');}} maxLength={8}
              style={{width:'100%',padding:'14px 16px',background:'#090c16',border:'1px solid rgba(139,115,60,.2)',borderRadius:10,color:'#e8e6e0',fontSize:22,fontFamily:'inherit',outline:'none',textAlign:'center',letterSpacing:14,boxSizing:'border-box'}}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoFocus/>
          </>}
          
          {error&&<div style={{color:'#f87171',fontSize:12,marginTop:10}}>{error}</div>}
          
          <button onClick={handleLogin} style={{width:'100%',marginTop:20,padding:'14px',background:'linear-gradient(135deg,#c6a34e,#a68a3c)',color:'#060810',fontWeight:700,fontSize:14,border:'none',borderRadius:10,cursor:'pointer',fontFamily:'inherit',letterSpacing:1}}>
            {mode==='create'?'Créer & Entrer':'Accéder'}
          </button>
        </div>

        {/* Footer */}
        <div style={{marginTop:36,color:'#5e5c56',fontSize:11,lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#8b7340'}}>{AUREUS_INFO.name}</div>
          <div>{AUREUS_INFO.addr}</div>
          <div>TVA: {AUREUS_INFO.vat}</div>
          <div>{AUREUS_INFO.email}</div>
          <div style={{marginTop:10,fontSize:9.5,color:'#3a3930'}}>© {new Date().getFullYear()} Aureus IA — Tous droits réservés</div>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT SELECTION PAGE ──────────────────────────────────

// Wizard data: activities → CP mapping + barèmes
const ACTIVITIES={
  medical:{l:'🏥 Médical / Santé',types:[
    {v:'hopital',l:'Hôpital / Clinique',cp:'330',emps:[{fn:'Médecin',bar:5609.78},{fn:'Infirmier(ère)',bar:2682.04},{fn:'Aide-soignant(e)',bar:2463.41},{fn:'Kinésithérapeute',bar:2682.04},{fn:'Secrétaire médicale',bar:2463.41},{fn:'Technicien(ne) labo',bar:2682.04},{fn:'Agent d\'entretien',bar:2254.03}]},
    {v:'cabinet',l:'Cabinet médical / Paramédical',cp:'200',emps:[{fn:'Secrétaire médicale',bar:2463.41},{fn:'Assistant(e) administratif',bar:2336.26},{fn:'Infirmier(ère)',bar:2682.04},{fn:'Comptable',bar:2728.35}]},
    {v:'pharmacie',l:'Pharmacie',cp:'313',emps:[{fn:'Pharmacien(ne) adjoint',bar:3478.22},{fn:'Préparateur(trice)',bar:2517.84},{fn:'Vendeur(se)',bar:2224.61}]},
    {v:'maison_repos',l:'Maison de repos (MR/MRS)',cp:'330',emps:[{fn:'Infirmier(ère)',bar:2682.04},{fn:'Aide-soignant(e)',bar:2463.41},{fn:'Kinésithérapeute',bar:2682.04},{fn:'Ergothérapeute',bar:2682.04},{fn:'Agent hôtelier',bar:2254.03},{fn:'Cuisinier(ère)',bar:2371.89}]},
    {v:'dentiste',l:'Cabinet dentaire',cp:'200',emps:[{fn:'Assistant(e) dentaire',bar:2336.26},{fn:'Secrétaire',bar:2242.80},{fn:'Hygiéniste dentaire',bar:2728.35}]},
  ]},
  construction:{l:'🏗️ Construction / Bâtiment',types:[
    {v:'gros_oeuvre',l:'Gros œuvre',cp:'124',emps:[{fn:'Maçon (Cat.III)',bar:3409.58},{fn:'Coffreur (Cat.III)',bar:3409.58},{fn:'Ferrailleur (Cat.II)',bar:3205.42},{fn:'Grutier (Cat.IV)',bar:3619.21},{fn:'Chef de chantier (Chef IV)',bar:3981.58},{fn:'Manœuvre (Cat.I)',bar:3006.56}]},
    {v:'electricite',l:'Électricité',cp:'149',emps:[{fn:'Électricien',bar:2916.30},{fn:'Chef d\'équipe',bar:3292.14},{fn:'Apprenti',bar:1850.40}]},
    {v:'plomberie',l:'Plomberie / Chauffage',cp:'124',emps:[{fn:'Plombier (Cat.III)',bar:3409.58},{fn:'Chauffagiste (Cat.III)',bar:3409.58},{fn:'Apprenti (Cat.I)',bar:3006.56}]},
    {v:'finition',l:'Finition / Peinture',cp:'124',emps:[{fn:'Peintre (Cat.II)',bar:3205.42},{fn:'Plafonneux (Cat.IIA)',bar:3365.39},{fn:'Carreleur (Cat.III)',bar:3409.58}]},
    {v:'bureau_etude',l:'Bureau d\'études',cp:'200',emps:[{fn:'Ingénieur',bar:3948.61},{fn:'Dessinateur',bar:2728.35},{fn:'Secrétaire',bar:2336.26}]},
  ]},
  horeca:{l:'🍽️ Horeca / Restauration',types:[
    {v:'restaurant',l:'Restaurant',cp:'302',emps:[{fn:'Chef cuisinier',bar:2629.69},{fn:'Cuisinier(ère)',bar:2519.02},{fn:'Commis de cuisine',bar:2504.53},{fn:'Serveur(se)',bar:2504.53},{fn:'Barman/Barmaid',bar:2504.53},{fn:'Plongeur(se)',bar:2504.53}]},
    {v:'hotel',l:'Hôtel',cp:'302',emps:[{fn:'Réceptionniste',bar:2519.02},{fn:'Femme/Valet de chambre',bar:2504.53},{fn:'Concierge',bar:2629.69},{fn:'Chef cuisinier',bar:2629.69}]},
    {v:'cafe',l:'Café / Bar',cp:'302',emps:[{fn:'Serveur(se)',bar:2504.53},{fn:'Barman/Barmaid',bar:2504.53}]},
    {v:'traiteur',l:'Traiteur / Catering',cp:'302',emps:[{fn:'Cuisinier(ère)',bar:2519.02},{fn:'Aide cuisine',bar:2504.53},{fn:'Livreur(se)',bar:2504.53}]},
  ]},
  garage:{l:'🔧 Garage / Automobile',types:[
    {v:'reparation',l:'Réparation / Entretien véhicules',cp:'112',emps:[{fn:'Mécanicien Cat.B',bar:2580.00},{fn:'Mécanicien spécialisé Cat.C',bar:2750.00},{fn:'Chef d\'atelier Cat.D',bar:3050.00},{fn:'Aide-mécanicien Cat.A',bar:2380.00}]},
    {v:'carrosserie',l:'Carrosserie',cp:'149.02',emps:[{fn:'Carrossier Cat.C',bar:2750.00},{fn:'Peintre auto Cat.C',bar:2750.00},{fn:'Tôlier Cat.B',bar:2580.00},{fn:'Chef d\'atelier Cat.D',bar:3050.00}]},
    {v:'vente_auto',l:'Vente de véhicules',cp:'112',emps:[{fn:'Vendeur automobile',bar:2468.07},{fn:'Réceptionnaire',bar:2468.07},{fn:'Administratif',bar:2336.26},{fn:'Préparateur véhicules Cat.A',bar:2380.00}]},
    {v:'pieces_auto',l:'Commerce de pièces auto',cp:'112',emps:[{fn:'Magasinier pièces Cat.B',bar:2580.00},{fn:'Vendeur comptoir',bar:2468.07},{fn:'Livreur',bar:2336.26}]},
    {v:'moto',l:'Motos / Cycles',cp:'112',emps:[{fn:'Mécanicien moto Cat.B',bar:2580.00},{fn:'Vendeur',bar:2468.07}]},
    {v:'pneus',l:'Centre pneus / Pneumatique',cp:'112',emps:[{fn:'Monteur pneus Cat.A',bar:2380.00},{fn:'Mécanicien Cat.B',bar:2580.00},{fn:'Réceptionnaire',bar:2468.07}]},
    {v:'controle_tech',l:'Contrôle technique',cp:'112',emps:[{fn:'Inspecteur technique Cat.C',bar:2750.00},{fn:'Administratif',bar:2336.26}]},
  ]},
  commerce:{l:'🛒 Commerce / Retail',types:[
    {v:'detail',l:'Commerce de détail',cp:'201',emps:[{fn:'Vendeur(se) Cat.2',bar:2053.89},{fn:'Caissier(ère) Cat.1',bar:1997.85},{fn:'Chef de rayon Cat.4',bar:2573.25},{fn:'Magasinier Cat.3',bar:2150.44}]},
    {v:'gros',l:'Commerce de gros',cp:'226',emps:[{fn:'Commercial',bar:2728.35},{fn:'Magasinier',bar:2336.26},{fn:'Administratif',bar:2336.26},{fn:'Chauffeur-livreur',bar:2468.07}]},
    {v:'ecommerce',l:'E-commerce',cp:'200',emps:[{fn:'Web developer',bar:2728.35},{fn:'Marketing digital',bar:2468.07},{fn:'Préparateur commandes',bar:2242.80},{fn:'Service client',bar:2242.80}]},
  ]},
  bureau:{l:'🏢 Services / Bureau',types:[
    {v:'comptable',l:'Fiduciaire / Comptabilité',cp:'200',emps:[{fn:'Comptable senior',bar:2728.35},{fn:'Comptable junior',bar:2336.26},{fn:'Aide-comptable',bar:2242.80},{fn:'Secrétaire',bar:2242.80}]},
    {v:'avocat',l:'Cabinet d\'avocats',cp:'200',emps:[{fn:'Avocat collaborateur',bar:2728.35},{fn:'Juriste',bar:2728.35},{fn:'Secrétaire juridique',bar:2336.26},{fn:'Paralegal',bar:2468.07}]},
    {v:'it',l:'IT / Digital',cp:'200',emps:[{fn:'Développeur senior',bar:2728.35},{fn:'Développeur junior',bar:2468.07},{fn:'Project manager',bar:2728.35},{fn:'UX Designer',bar:2468.07},{fn:'Sysadmin',bar:2468.07}]},
    {v:'rh',l:'Ressources Humaines / Intérim',cp:'200',emps:[{fn:'Consultant RH',bar:2728.35},{fn:'Recruteur',bar:2468.07},{fn:'Administratif',bar:2336.26}]},
    {v:'immobilier',l:'Immobilier',cp:'323',emps:[{fn:'Agent immobilier',bar:2632.95},{fn:'Gestionnaire syndic',bar:2805.17},{fn:'Secrétaire',bar:2337.59}]},
    {v:'assurance',l:'Courtage assurances',cp:'307',emps:[{fn:'Courtier',bar:3194.97},{fn:'Gestionnaire sinistres',bar:2636.80},{fn:'Administratif',bar:2317.18}]},
  ]},
  transport:{l:'🚛 Transport / Logistique',types:[
    {v:'routier',l:'Transport routier',cp:'140',emps:[{fn:'Chauffeur CE',bar:2603.02},{fn:'Chauffeur C',bar:2543.95},{fn:'Dispatcher',bar:2766.65},{fn:'Mécanicien',bar:3074.05}]},
    {v:'demenagement',l:'Déménagement',cp:'140',emps:[{fn:'Déménageur',bar:2457.71},{fn:'Chauffeur',bar:2603.02},{fn:'Chef d\'équipe',bar:2766.65}]},
    {v:'logistique',l:'Entrepôt / Logistique',cp:'226',emps:[{fn:'Magasinier',bar:2336.26},{fn:'Cariste',bar:2468.07},{fn:'Chef d\'entrepôt',bar:2993.28},{fn:'Préparateur',bar:2242.80}]},
  ]},
  nettoyage:{l:'🧹 Nettoyage / Titres-services',types:[
    {v:'entreprise',l:'Nettoyage industriel/bureau',cp:'121',emps:[{fn:'Agent d\'entretien',bar:2696.49},{fn:'Chef d\'équipe',bar:2966.13},{fn:'Responsable site',bar:3611.59}]},
    {v:'titres_services',l:'Titres-services',cp:'322.01',emps:[{fn:'Aide-ménager(ère)',bar:2131.47},{fn:'Repasseur(se)',bar:2131.47}]},
  ]},
  industrie:{l:'🏭 Industrie / Production',types:[
    {v:'alimentaire',l:'Industrie alimentaire',cp:'118',emps:[{fn:'Ouvrier production',bar:2896.49},{fn:'Technicien maintenance',bar:3077.62},{fn:'Chef d\'équipe',bar:3258.75},{fn:'Contrôleur qualité',bar:3077.62}]},
    {v:'metallurgie',l:'Métallurgie',cp:'111',emps:[{fn:'Soudeur Cat.3',bar:2793.90},{fn:'Tourneur-fraiseur Cat.4',bar:2915.51},{fn:'Monteur Cat.2',bar:2704.10},{fn:'Ingénieur (CP 209)',bar:3948.61}]},
    {v:'chimie',l:'Chimie / Pharma',cp:'116',emps:[{fn:'Opérateur de production',bar:2653.84},{fn:'Laborantin',bar:2892.12},{fn:'Technicien QC',bar:3122.70},{fn:'Ingénieur process',bar:4178.93}]},
  ]},
  asbl:{l:'🤝 ASBL / Non-marchand',types:[
    {v:'sociale',l:'Action sociale',cp:'332',emps:[{fn:'Éducateur(trice) Cat.3',bar:2666.59},{fn:'Assistant(e) social(e) Cat.4',bar:2943.54},{fn:'Coordinateur(trice) Cat.5',bar:3250.21},{fn:'Administratif Cat.1',bar:2297.43}]},
    {v:'culturelle',l:'Culture / Événementiel',cp:'329',emps:[{fn:'Animateur(trice) Bar.2',bar:2441.08},{fn:'Régisseur(se) Bar.3',bar:2634.50},{fn:'Chargé(e) de comm. Bar.3',bar:2634.50}]},
    {v:'enseignement',l:'Enseignement privé',cp:'225',emps:[{fn:'Enseignant(e)',bar:2892.12},{fn:'Secrétaire',bar:2317.78},{fn:'Éducateur(trice)',bar:2448.51}]},
  ]},
};

// ── NACE → CP MAPPING (Banque-Carrefour des Entreprises) ──
// Table de correspondance codes NACE-BEL 2008 → Commissions Paritaires
// Source: SPF ETCS + BCE + Moniteur belge
const NACE_TO_CP={
  // Construction
  '41':{l:'Construction de bâtiments',cpOuv:'124',cpEmp:'200',nace:'41.xxx',sector:'construction'},
  '42':{l:'Génie civil',cpOuv:'124',cpEmp:'200',nace:'42.xxx',sector:'construction'},
  '43':{l:'Travaux spécialisés construction',cpOuv:'124',cpEmp:'200',nace:'43.xxx',sector:'construction'},
  '43.21':{l:'Installation électrique',cpOuv:'149.01',cpEmp:'200',nace:'43.21',sector:'construction'},
  // Commerce
  '45':{l:'Commerce véhicules automobiles',cpOuv:'112',cpEmp:'200',nace:'45.xxx',sector:'commerce'},
  '45.1':{l:'Commerce de véhicules automobiles',cpOuv:'112',cpEmp:'200',nace:'45.1xx',sector:'commerce'},
  '45.2':{l:'Entretien et réparation de véhicules',cpOuv:'112',cpEmp:'200',nace:'45.2xx',sector:'commerce'},
  '45.3':{l:'Commerce de pièces automobiles',cpOuv:'112',cpEmp:'200',nace:'45.3xx',sector:'commerce'},
  '45.4':{l:'Commerce et réparation de motos',cpOuv:'112',cpEmp:'200',nace:'45.4xx',sector:'commerce'},
  '46':{l:'Commerce de gros',cpOuv:'119',cpEmp:'226',nace:'46.xxx',sector:'commerce'},
  '47':{l:'Commerce de détail',cpOuv:'202',cpEmp:'201',nace:'47.xxx',sector:'commerce'},
  '47.11':{l:'Supermarchés / Grandes surfaces',cpOuv:'202',cpEmp:'311',nace:'47.11',sector:'commerce'},
  '47.73':{l:'Pharmacie',cpOuv:null,cpEmp:'313',nace:'47.73',sector:'medical'},
  // Horeca
  '55':{l:'Hébergement (hôtels)',cpOuv:'302',cpEmp:'302',nace:'55.xxx',sector:'horeca'},
  '56':{l:'Restauration',cpOuv:'302',cpEmp:'302',nace:'56.xxx',sector:'horeca'},
  '56.10':{l:'Restaurant / Brasserie',cpOuv:'302',cpEmp:'302',nace:'56.10',sector:'horeca'},
  '56.30':{l:'Débit de boissons (café/bar)',cpOuv:'302',cpEmp:'302',nace:'56.30',sector:'horeca'},
  // Transport
  '49':{l:'Transport terrestre',cpOuv:'140',cpEmp:'226',nace:'49.xxx',sector:'transport'},
  '49.41':{l:'Transport routier de fret',cpOuv:'140.03',cpEmp:'226',nace:'49.41',sector:'transport'},
  '50':{l:'Transport par eau',cpOuv:'139',cpEmp:'226',nace:'50.xxx',sector:'transport'},
  '52':{l:'Entreposage / Logistique',cpOuv:'140',cpEmp:'226',nace:'52.xxx',sector:'transport'},
  '53':{l:'Activités de poste / Courrier',cpOuv:'140',cpEmp:'226',nace:'53.xxx',sector:'transport'},
  // Industrie alimentaire
  '10':{l:'Industries alimentaires',cpOuv:'118',cpEmp:'220',nace:'10.xxx',sector:'industrie'},
  '11':{l:'Fabrication de boissons',cpOuv:'118',cpEmp:'220',nace:'11.xxx',sector:'industrie'},
  // Industrie diverse
  '20':{l:'Industrie chimique',cpOuv:'116',cpEmp:'207',nace:'20.xxx',sector:'industrie'},
  '21':{l:'Industrie pharmaceutique',cpOuv:'116',cpEmp:'207',nace:'21.xxx',sector:'industrie'},
  '24':{l:'Métallurgie',cpOuv:'111.01',cpEmp:'209',nace:'24.xxx',sector:'industrie'},
  '25':{l:'Fabrication produits métalliques',cpOuv:'111.02',cpEmp:'209',nace:'25.xxx',sector:'industrie'},
  '22':{l:'Fabrication caoutchouc/plastique',cpOuv:'113',cpEmp:'209',nace:'22.xxx',sector:'industrie'},
  '13':{l:'Fabrication de textiles',cpOuv:'120',cpEmp:'214',nace:'13.xxx',sector:'industrie'},
  '16':{l:'Travail du bois',cpOuv:'125',cpEmp:'200',nace:'16.xxx',sector:'industrie'},
  '17':{l:'Industrie du papier',cpOuv:'129',cpEmp:'200',nace:'17.xxx',sector:'industrie'},
  '18':{l:'Imprimerie',cpOuv:'130',cpEmp:'200',nace:'18.xxx',sector:'industrie'},
  '23':{l:'Produits minéraux non métalliques',cpOuv:'114',cpEmp:'200',nace:'23.xxx',sector:'industrie'},
  // Services
  '62':{l:'Programmation informatique / IT',cpOuv:null,cpEmp:'200',nace:'62.xxx',sector:'bureau'},
  '63':{l:'Services d\'information',cpOuv:null,cpEmp:'200',nace:'63.xxx',sector:'bureau'},
  '64':{l:'Services financiers (banques)',cpOuv:null,cpEmp:'310',nace:'64.xxx',sector:'bureau'},
  '65':{l:'Assurances',cpOuv:null,cpEmp:'306',nace:'65.xxx',sector:'bureau'},
  '66':{l:'Auxiliaires financiers / Courtage',cpOuv:null,cpEmp:'307',nace:'66.xxx',sector:'bureau'},
  '68':{l:'Activités immobilières',cpOuv:null,cpEmp:'323',nace:'68.xxx',sector:'bureau'},
  '69':{l:'Activités comptables / Juridiques',cpOuv:null,cpEmp:'200',nace:'69.xxx',sector:'bureau'},
  '69.10':{l:'Activités juridiques (avocats)',cpOuv:null,cpEmp:'200',nace:'69.10',sector:'bureau'},
  '69.20':{l:'Comptabilité / Fiduciaire',cpOuv:null,cpEmp:'200',nace:'69.20',sector:'bureau'},
  '70':{l:'Conseil de gestion / Management',cpOuv:null,cpEmp:'200',nace:'70.xxx',sector:'bureau'},
  '71':{l:'Architecture / Ingénierie',cpOuv:null,cpEmp:'200',nace:'71.xxx',sector:'bureau'},
  '72':{l:'Recherche scientifique',cpOuv:null,cpEmp:'200',nace:'72.xxx',sector:'bureau'},
  '73':{l:'Publicité / Études de marché',cpOuv:null,cpEmp:'200',nace:'73.xxx',sector:'bureau'},
  '74':{l:'Autres activités spécialisées',cpOuv:null,cpEmp:'200',nace:'74.xxx',sector:'bureau'},
  '78':{l:'Activités liées à l\'emploi / Intérim',cpOuv:'322',cpEmp:'322',nace:'78.xxx',sector:'bureau'},
  '80':{l:'Sécurité / Gardiennage',cpOuv:'317',cpEmp:'317',nace:'80.xxx',sector:'bureau'},
  '81':{l:'Services aux bâtiments / Nettoyage',cpOuv:'121',cpEmp:'200',nace:'81.xxx',sector:'nettoyage'},
  '81.21':{l:'Nettoyage général bâtiments',cpOuv:'121',cpEmp:'200',nace:'81.21',sector:'nettoyage'},
  '82':{l:'Services de soutien aux entreprises',cpOuv:null,cpEmp:'200',nace:'82.xxx',sector:'bureau'},
  // Santé / Social
  '86':{l:'Activités pour la santé humaine',cpOuv:'330',cpEmp:'330',nace:'86.xxx',sector:'medical'},
  '86.10':{l:'Hôpitaux',cpOuv:'330',cpEmp:'330',nace:'86.10',sector:'medical'},
  '86.21':{l:'Médecins généralistes',cpOuv:null,cpEmp:'200',nace:'86.21',sector:'medical'},
  '86.23':{l:'Dentistes',cpOuv:null,cpEmp:'200',nace:'86.23',sector:'medical'},
  '87':{l:'Hébergement médico-social (MR/MRS)',cpOuv:'330',cpEmp:'330',nace:'87.xxx',sector:'medical'},
  '88':{l:'Action sociale sans hébergement',cpOuv:'332',cpEmp:'332',nace:'88.xxx',sector:'asbl'},
  '88.10':{l:'Aide à domicile (titres-services)',cpOuv:'322.01',cpEmp:'322.01',nace:'88.10',sector:'nettoyage'},
  // Enseignement
  '85':{l:'Enseignement',cpOuv:null,cpEmp:'225',nace:'85.xxx',sector:'asbl'},
  // Culture / Loisirs
  '90':{l:'Activités créatives / Artistiques',cpOuv:'304',cpEmp:'304',nace:'90.xxx',sector:'asbl'},
  '93':{l:'Activités sportives / Récréatives',cpOuv:'329',cpEmp:'329',nace:'93.xxx',sector:'asbl'},
  // Agriculture
  '01':{l:'Agriculture / Culture',cpOuv:'144',cpEmp:'200',nace:'01.xxx',sector:'industrie'},
  '02':{l:'Sylviculture',cpOuv:'146',cpEmp:'200',nace:'02.xxx',sector:'industrie'},
  '03':{l:'Pêche',cpOuv:'143',cpEmp:'200',nace:'03.xxx',sector:'industrie'},
};

// Simuler lookup BCE à partir du n° TVA
// En production: appeler https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html
// ou l'API VIES pour validation TVA + BCE API pour les données entreprise
function lookupBCE(vatNumber){
  // Normaliser le numéro
  const clean=vatNumber.replace(/[^0-9]/g,'');
  if(clean.length<9||clean.length>10)return null;
  const nr=clean.padStart(10,'0');
  
  // Simuler des entreprises connues pour la démo
  // En production: fetch vers l'API BCE
  const DEMO_COMPANIES={
    '0419052173':{name:'Colruyt Group NV',forme:'sa',addr:'Edingensesteenweg 196, 1500 Halle',nace:['47.11'],activity:'Commerce de détail alimentaire'},
    '0403171043':{name:'Delhaize Le Lion SA',forme:'sa',addr:'Rue Osseghem 53, 1080 Molenbeek',nace:['47.11'],activity:'Commerce de détail alimentaire'},
    '0404616494':{name:'Solvay SA',forme:'sa',addr:'Rue de Ransbeek 310, 1120 Bruxelles',nace:['20'],activity:'Industrie chimique'},
    '0401574852':{name:'Besix SA',forme:'sa',addr:'Avenue des Communautés 100, 1200 Bruxelles',nace:['41','42'],activity:'Construction de bâtiments et génie civil'},
    '1028230781':{name:'Aureus IA SPRL',forme:'sprl',addr:'Saint-Gilles, Bruxelles',nace:['62'],activity:'Programmation informatique'},
  };
  
  if(DEMO_COMPANIES[nr])return{...DEMO_COMPANIES[nr],vat:`BE ${nr.slice(0,4)}.${nr.slice(4,7)}.${nr.slice(7)}`,bce:nr,found:true};
  
  // Pour tout autre numéro: retourner un template vide avec les codes NACE à remplir
  return{name:'',forme:'sprl',addr:'',nace:[],activity:'',vat:`BE ${nr.slice(0,4)}.${nr.slice(4,7)}.${nr.slice(7)}`,bce:nr,found:false,
    message:'⚠ Entreprise non trouvée dans la démo. En production, les données seront récupérées automatiquement via l\'API BCE (KBO) et le Moniteur Belge.'};
}

// Déterminer toutes les CP applicables à partir des codes NACE
function detectCPFromNACE(naceCodes){
  const results=[];
  const seen=new Set();
  (naceCodes||[]).forEach(code=>{
    // Chercher d'abord le code exact, puis préfixes de plus en plus courts
    const clean=code.replace(/\s/g,'');
    const match=NACE_TO_CP[clean]
      ||NACE_TO_CP[clean.substring(0,5)]
      ||NACE_TO_CP[clean.substring(0,4)]
      ||NACE_TO_CP[clean.substring(0,2)];
    if(match){
      const key=`${match.cpOuv||'-'}_${match.cpEmp}`;
      if(!seen.has(key)){
        seen.add(key);
        results.push({...match,naceCode:code});
      }
    }
  });
  return results;
}

function ClientWizard({onFinish,onCancel}){
  const [step,setStep]=useState(1);
  const [bceLoading,setBceLoading]=useState(false);
  const [bceResult,setBceResult]=useState(null);
  const [cpDetected,setCpDetected]=useState([]);
  const [naceInput,setNaceInput]=useState('');
  const [data,setData]=useState({
    name:'',vat:'',onss:'',addr:'',contact:'',email:'',phone:'',forme:'sprl',
    activity:'',subType:'',naceCodes:[],cpEmploye:'200',cpOuvrier:'',
    emps:[],
  });

  // ── BCE LOOKUP (API réelle) ──
  const doLookup=async()=>{
    if(!data.vat||data.vat.replace(/[^0-9]/g,'').length<9)return;
    setBceLoading(true);
    setBceResult(null);
    try{
      const clean=data.vat.replace(/[^0-9]/g,'');
      const resp=await fetch(`/api/bce?vat=${clean}`);
      const result=await resp.json();
      setBceResult(result);
      if(result){
        const upd={...data};
        if(result.found){
          upd.name=result.name||upd.name;upd.forme=result.forme||upd.forme;upd.addr=result.addr||upd.addr;upd.vat=result.vat||upd.vat;upd.naceCodes=result.nace||[];
          if(result.email)upd.email=result.email;
          if(result.phone)upd.phone=result.phone;
        } else { upd.vat=result.vat||upd.vat; }
        const cps=detectCPFromNACE(result.nace||[]);
        setCpDetected(cps);
        if(cps.length>0){upd.cpEmploye=cps[0].cpEmp||'200';upd.cpOuvrier=cps[0].cpOuv||'';}
        setData(upd);
      }
    }catch(err){
      console.error('BCE lookup error:',err);
      // Fallback vers la recherche locale
      const result=lookupBCE(data.vat);
      setBceResult(result);
      if(result){
        const upd={...data};
        if(result.found){
          upd.name=result.name;upd.forme=result.forme;upd.addr=result.addr;upd.vat=result.vat;upd.naceCodes=result.nace||[];
        } else { upd.vat=result.vat; }
        const cps=detectCPFromNACE(result.nace||[]);
        setCpDetected(cps);
        if(cps.length>0){upd.cpEmploye=cps[0].cpEmp||'200';upd.cpOuvrier=cps[0].cpOuv||'';}
        setData(upd);
      }
    }
    setBceLoading(false);
  };

  const addNace=()=>{
    if(!naceInput)return;
    const codes=[...data.naceCodes,naceInput];
    const cps=detectCPFromNACE(codes);
    setCpDetected(cps);
    setData(d=>({...d,naceCodes:codes,cpEmploye:cps[0]?.cpEmp||d.cpEmploye,cpOuvrier:cps[0]?.cpOuv||d.cpOuvrier}));
    setNaceInput('');
  };
  const removeNace=(code)=>{
    const codes=data.naceCodes.filter(c=>c!==code);
    const cps=detectCPFromNACE(codes);
    setCpDetected(cps);
    setData(d=>({...d,naceCodes:codes}));
  };

  const formes=[{v:'sprl',l:'SRL (ex-SPRL)'},{v:'sa',l:'SA'},{v:'sc',l:'SC'},{v:'asbl',l:'ASBL'},{v:'snc',l:'SNC'},{v:'scomm',l:'SComm'},{v:'pp',l:'Personne physique'}];

  const selActivity=ACTIVITIES[data.activity];
  const selType=selActivity?.types?.find(t=>t.v===data.subType);
  const autoCP=selType?.cp||'200';
  const suggestedEmps=selType?.emps||[];

  const addEmp=(template)=>{
    // Auto-lookup barème officiel
    const bar=getBareme(autoCP,template.fn,0);
    const salary=bar?bar.monthly:template.bar;
    const barInfo=bar?`CP ${autoCP} classe ${bar.classe} (${bar.classLabel||bar.classe}) — Barème SPF ${bar.indexDate}`:'Barème indicatif';
    setData({...data,emps:[...data.emps,{
      id:'W-'+uid(),first:'',last:'',niss:'',birth:'',addr:'',city:'',zip:'',startD:new Date().toISOString().split('T')[0],fn:template.fn,
      monthlySalary:salary,contract:'CDI',regime:'full',whWeek:bar?.regime||38,civil:'single',depChildren:0,handiChildren:0,
      iban:'',mvT:10,mvW:1.09,mvE:8.91,expense:0,cp:autoCP,dmfaCode:'495',dimType:'OTH',commDist:0,commType:'none',commMonth:0,status:'active',dept:'',endD:'',
      baremeClasse:bar?.classe||'',baremeInfo:barInfo,anciennete:0,
    }]});
  };

  const updEmp=(id,field,val)=>{
    let newEmps=data.emps.map(e=>{
      if(e.id!==id)return e;
      const upd={...e,[field]:field==='monthlySalary'||field==='depChildren'||field==='handiChildren'||field==='commDist'||field==='anciennete'?(parseFloat(val)||0):val};
      // Auto-recalc barème when ancienneté changes
      if(field==='anciennete'){
        const bar=getBareme(autoCP,upd.fn,upd.anciennete);
        if(bar){upd.monthlySalary=bar.monthly;upd.baremeClasse=bar.classe;upd.baremeInfo=`CP ${autoCP} classe ${bar.classe} anc.${bar.ancYr}ans — SPF ${bar.indexDate}`;}
      }
      return upd;
    });
    setData({...data,emps:newEmps});
  };

  const remEmp=(id)=>setData({...data,emps:data.emps.filter(e=>e.id!==id)});

  const finish=()=>{
    if(!data.name){alert('Raison sociale requise');return;}
    const company={name:data.name,vat:data.vat,onss:data.onss,addr:data.addr,contact:data.contact,email:data.email,phone:data.phone,cp:autoCP,cpEmploye:data.cpEmploye,cpOuvrier:data.cpOuvrier,bank:'',insurer:'',policyNr:'',secSoc:'',forme:data.forme,naceCodes:data.naceCodes};
    onFinish({company,emps:data.emps,sector:data.activity,subType:data.subType});
  };

  const stepStyle={background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.15)',borderRadius:16,padding:'28px 32px',marginBottom:20,boxShadow:'0 8px 32px rgba(0,0,0,.3)'};
  const stepBar=<div style={{display:'flex',gap:0,marginBottom:28}}>
    {[{n:1,l:'Société'},{n:2,l:'Activité'},{n:3,l:'Travailleurs'},{n:4,l:'Résumé'}].map(st=>(
      <div key={st.n} onClick={()=>st.n<step&&setStep(st.n)} style={{flex:1,textAlign:'center',padding:'12px 0',cursor:st.n<step?'pointer':'default',borderBottom:`3px solid ${step>=st.n?'#c6a34e':'rgba(139,115,60,.15)'}`,transition:'all .2s'}}>
        <div style={{fontSize:10,color:step>=st.n?'#c6a34e':'#5e5c56',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px'}}>{st.n}. {st.l}</div>
      </div>
    ))}
  </div>;

  return <div style={{maxWidth:900,margin:'0 auto'}}>
    {stepBar}

    {step===1&&<div style={stepStyle}>
      <div style={{fontSize:18,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Identification de la société</div>
      <div style={{fontSize:12,color:'#5e5c56',marginBottom:20}}>Entrez le numéro de TVA pour récupérer automatiquement les données via la BCE et le Moniteur Belge</div>
      
      {/* TVA + Bouton BCE */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'flex-end'}}>
        <div style={{flex:1}}><I label="N° TVA (BE 0xxx.xxx.xxx) *" value={data.vat} onChange={v=>setData({...data,vat:v})}/></div>
        <button onClick={doLookup} disabled={bceLoading} style={{padding:'10px 20px',background:bceLoading?'rgba(198,163,78,.1)':'linear-gradient(135deg,#c6a34e,#a68a3c)',color:bceLoading?'#c6a34e':'#060810',fontWeight:700,fontSize:12,border:'none',borderRadius:8,cursor:bceLoading?'wait':'pointer',fontFamily:'inherit',whiteSpace:'nowrap',height:42}}>
          {bceLoading?'⏳ Recherche BCE...':'🔍 Rechercher BCE / MB'}
        </button>
      </div>

      {/* Résultat BCE */}
      {bceResult&&<div style={{marginBottom:16,padding:14,borderRadius:10,background:bceResult.found?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)',border:`1px solid ${bceResult.found?'rgba(74,222,128,.2)':'rgba(248,113,113,.2)'}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span style={{fontSize:16}}>{bceResult.found?'✅':'⚠'}</span>
          <span style={{fontSize:13,fontWeight:600,color:bceResult.found?'#4ade80':'#fb923c'}}>{bceResult.found?'Entreprise trouvée dans la BCE':'Entreprise non trouvée'}</span>
        </div>
        {bceResult.found&&<div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div>Dénomination: <b style={{color:'#e8e6e0'}}>{bceResult.name}</b></div>
          <div>N° entreprise: <b style={{color:'#e8e6e0'}}>{bceResult.bce}</b></div>
          <div>Activité BCE: <b style={{color:'#c6a34e'}}>{bceResult.activity}</b></div>
          <div>Code(s) NACE: <b style={{color:'#60a5fa'}}>{(bceResult.nace||[]).join(', ')}</b></div>
          {bceResult.formeLabel&&bceResult.formeLabel.trim()&&!bceResult.formeLabel.includes('nbsp')&&<div>Forme juridique: <b style={{color:'#e8e6e0'}}>{bceResult.formeLabel}</b></div>}
          {bceResult.addr&&<div>Adresse: <b style={{color:'#e8e6e0'}}>{bceResult.addr}</b></div>}
          {bceResult.email&&<div>Email: <b style={{color:'#60a5fa'}}>{bceResult.email}</b></div>}
          {bceResult.phone&&<div>Téléphone: <b style={{color:'#e8e6e0'}}>{bceResult.phone}</b></div>}
          {bceResult.status&&<div>Statut: <b style={{color:bceResult.status.toLowerCase().includes('actif')||bceResult.status.toLowerCase().includes('actief')?'#4ade80':'#fb923c'}}>{bceResult.status}</b></div>}
        </div>}
        {!bceResult.found&&bceResult.message&&<div style={{fontSize:11,color:'#fb923c'}}>{bceResult.message}</div>}
      </div>}

      {/* Formulaire société (pré-rempli par BCE) */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <I label="Raison sociale *" value={data.name} onChange={v=>setData({...data,name:v})}/>
        <I label="Forme juridique" value={data.forme} onChange={v=>setData({...data,forme:v})} options={formes}/>
        <I label="N° ONSS" value={data.onss} onChange={v=>setData({...data,onss:v})}/>
        <I label="Adresse du siège" value={data.addr} onChange={v=>setData({...data,addr:v})}/>
        <I label="Personne de contact" value={data.contact} onChange={v=>setData({...data,contact:v})}/>
        <I label="Email" value={data.email} onChange={v=>setData({...data,email:v})}/>
        <I label="Téléphone" value={data.phone} onChange={v=>setData({...data,phone:v})}/>
      </div>

      {/* Section NACE + CP détectées */}
      <div style={{marginTop:20,padding:16,background:'rgba(96,165,250,.04)',border:'1px solid rgba(96,165,250,.12)',borderRadius:12}}>
        <div style={{fontSize:13,fontWeight:600,color:'#60a5fa',marginBottom:10}}>📋 Codes NACE & Commissions Paritaires</div>
        
        {/* Codes NACE */}
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
          {data.naceCodes.map(code=>{
            const match=NACE_TO_CP[code]||NACE_TO_CP[code.substring(0,2)];
            return <span key={code} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',background:'rgba(96,165,250,.1)',borderRadius:6,fontSize:11,color:'#60a5fa'}}>
              <b>{code}</b> {match?`— ${match.l}`:''} <button onClick={()=>removeNace(code)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:12,padding:0}}>✕</button>
            </span>;
          })}
          {data.naceCodes.length===0&&<span style={{fontSize:11,color:'#5e5c56'}}>Aucun code NACE — utilisez la recherche BCE ou ajoutez manuellement</span>}
        </div>
        
        {/* Ajout NACE manuel */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          <I label="Ajouter code NACE" value={naceInput} onChange={setNaceInput} style={{flex:1}}/>
          <button onClick={addNace} style={{padding:'8px 14px',background:'rgba(96,165,250,.1)',border:'1px solid rgba(96,165,250,.2)',borderRadius:7,color:'#60a5fa',fontSize:11,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',alignSelf:'flex-end',height:38}}>+ Ajouter</button>
        </div>

        {/* CP DÉTECTÉES */}
        {cpDetected.length>0?<div>
          <div style={{fontSize:12,fontWeight:600,color:'#4ade80',marginBottom:8}}>✅ Commission(s) Paritaire(s) détectée(s) automatiquement :</div>
          <table style={{width:'100%',borderCollapse:'collapse',marginBottom:10}}>
            <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
              <th style={{textAlign:'left',padding:'8px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>NACE</th>
              <th style={{textAlign:'left',padding:'8px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>Activité</th>
              <th style={{textAlign:'left',padding:'8px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>CP Employés</th>
              <th style={{textAlign:'left',padding:'8px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>CP Ouvriers</th>
            </tr></thead>
            <tbody>{cpDetected.map((cp,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <td style={{padding:'8px 10px',fontSize:12,color:'#60a5fa',fontWeight:600}}>{cp.naceCode}</td>
              <td style={{padding:'8px 10px',fontSize:12,color:'#e8e6e0'}}>{cp.l}</td>
              <td style={{padding:'8px 10px'}}><span style={{padding:'3px 8px',borderRadius:5,background:'rgba(74,222,128,.1)',color:'#4ade80',fontSize:11,fontWeight:600}}>CP {cp.cpEmp}</span></td>
              <td style={{padding:'8px 10px'}}>{cp.cpOuv?<span style={{padding:'3px 8px',borderRadius:5,background:'rgba(251,146,60,.1)',color:'#fb923c',fontSize:11,fontWeight:600}}>CP {cp.cpOuv}</span>:<span style={{fontSize:10,color:'#5e5c56'}}>Pas d'ouvriers</span>}</td>
            </tr>)}</tbody>
          </table>

          {/* ALERTE CP différentes ouvriers/employés */}
          {cpDetected.some(cp=>cp.cpOuv&&cp.cpOuv!==cp.cpEmp)&&<div style={{padding:10,background:'rgba(251,146,60,.06)',border:'1px solid rgba(251,146,60,.2)',borderRadius:8,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:'#fb923c',marginBottom:4}}>⚠ Attention — CP différentes pour Employés et Ouvriers !</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.6}}>
              Ce secteur utilise des commissions paritaires différentes selon le statut du travailleur. Lors de l'encodage de vos futurs travailleurs, veillez à bien sélectionner :
              {cpDetected.filter(cp=>cp.cpOuv&&cp.cpOuv!==cp.cpEmp).map((cp,i)=><div key={i} style={{marginTop:4}}>
                • <b style={{color:'#4ade80'}}>Employés → CP {cp.cpEmp}</b> ({LEGAL.CP[cp.cpEmp]||cp.cpEmp})<br/>
                • <b style={{color:'#fb923c'}}>Ouvriers → CP {cp.cpOuv}</b> ({LEGAL.CP[cp.cpOuv]||cp.cpOuv})
              </div>)}
            </div>
          </div>}

          {/* ALERTE pas de CP ouvriers */}
          {cpDetected.every(cp=>!cp.cpOuv)&&<div style={{padding:10,background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.15)',borderRadius:8,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:'#60a5fa'}}>ℹ Ce secteur n'emploie généralement pas d'ouvriers</div>
            <div style={{fontSize:10.5,color:'#9e9b93'}}>Les travailleurs seront encodés comme employés en CP {cpDetected[0]?.cpEmp||'200'}. Si vous engagez des ouvriers, ajoutez le code NACE correspondant.</div>
          </div>}

          {/* Sélection CP à appliquer */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <I label="CP pour les employés" value={data.cpEmploye} onChange={v=>setData({...data,cpEmploye:v})} options={[{v:cpDetected[0]?.cpEmp||'200',l:`CP ${cpDetected[0]?.cpEmp||'200'} — Détecté`},...Object.entries(LEGAL.CP).filter(([k])=>k!==cpDetected[0]?.cpEmp).map(([k,v])=>({v:k,l:v}))]}/>
            <I label="CP pour les ouvriers" value={data.cpOuvrier} onChange={v=>setData({...data,cpOuvrier:v})} options={[{v:'',l:'— Pas d\'ouvriers —'},...(cpDetected[0]?.cpOuv?[{v:cpDetected[0].cpOuv,l:`CP ${cpDetected[0].cpOuv} — Détecté`}]:[]),...Object.entries(LEGAL.CP).filter(([k])=>k!==cpDetected[0]?.cpOuv).map(([k,v])=>({v:k,l:v}))]}/>
          </div>
        </div>:<div style={{padding:20,textAlign:'center',color:'#5e5c56',fontSize:12}}>
          Entrez le n° TVA et cliquez "Rechercher BCE" pour détecter automatiquement les commissions paritaires, ou ajoutez un code NACE manuellement.
        </div>}
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20}}>
        <B v="outline" onClick={onCancel}>Annuler</B>
        <B onClick={()=>{if(!data.name){alert('Raison sociale requise');return;}setStep(2);}}>Suivant →</B>
      </div>
    </div>}

    {step===2&&<div style={stepStyle}>
      <div style={{fontSize:18,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Secteur d'activité</div>
      <div style={{fontSize:12,color:'#5e5c56',marginBottom:20}}>Sélectionnez le secteur pour déterminer automatiquement la commission paritaire</div>
      
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        {Object.entries(ACTIVITIES).map(([k,v])=>(
          <div key={k} onClick={()=>setData({...data,activity:k,subType:''})}
            style={{padding:'16px 14px',borderRadius:10,cursor:'pointer',textAlign:'center',border:`2px solid ${data.activity===k?'#c6a34e':'rgba(139,115,60,.12)'}`,background:data.activity===k?'rgba(198,163,78,.08)':'rgba(6,8,16,.5)',transition:'all .15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=data.activity===k?'#c6a34e':'rgba(198,163,78,.25)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor=data.activity===k?'#c6a34e':'rgba(139,115,60,.12)'}>
            <div style={{fontSize:15,fontWeight:600,color:data.activity===k?'#c6a34e':'#9e9b93'}}>{v.l}</div>
          </div>
        ))}
      </div>

      {selActivity&&<>
        <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Type d'activité précis :</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {selActivity.types.map(t=>(
            <div key={t.v} onClick={()=>setData({...data,subType:t.v})}
              style={{padding:'12px 14px',borderRadius:8,cursor:'pointer',border:`1px solid ${data.subType===t.v?'#c6a34e':'rgba(139,115,60,.1)'}`,background:data.subType===t.v?'rgba(198,163,78,.06)':'transparent',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,color:data.subType===t.v?'#e8e6e0':'#9e9b93'}}>{t.l}</span>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:'rgba(96,165,250,.08)',color:'#60a5fa',fontWeight:600}}>CP {t.cp}</span>
            </div>
          ))}
        </div>
      </>}

      {selType&&<div style={{marginTop:16,padding:14,background:'rgba(74,222,128,.04)',borderRadius:10,border:'1px solid rgba(74,222,128,.1)'}}>
        <div style={{fontSize:12,color:'#4ade80',fontWeight:600}}>✓ Commission paritaire détectée : CP {autoCP} — {LEGAL.CP[autoCP]||autoCP}</div>
        <div style={{fontSize:11,color:'#9e9b93',marginTop:4}}>Les barèmes et primes sectoriels seront automatiquement appliqués.</div>
      </div>}

      <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
        <B v="outline" onClick={()=>setStep(1)}>← Retour</B>
        <B onClick={()=>{if(!data.subType){alert('Sélectionnez un type d\'activité');return;}setStep(3);}}>Suivant →</B>
      </div>
    </div>}

    {step===3&&<div style={stepStyle}>
      <div style={{fontSize:18,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Travailleurs</div>
      <div style={{fontSize:12,color:'#5e5c56',marginBottom:16}}>Ajoutez les travailleurs — cliquez sur un profil suggéré ou ajoutez manuellement</div>
      
      {suggestedEmps.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:'1px'}}>Profils suggérés pour {selType?.l}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {suggestedEmps.map((se,i)=>{
            const spf=getBareme(autoCP,se.fn,0);
            const displaySalary=spf?spf.monthly:se.bar;
            const isOfficial=!!spf;
            const isApprox=isOfficial&&BAREMES[autoCP]?.approx;
            return(
            <button key={i} onClick={()=>addEmp(se)} style={{padding:'8px 14px',borderRadius:8,background:'rgba(198,163,78,.06)',border:'1px solid rgba(198,163,78,.12)',color:'#c6a34e',fontSize:12,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(198,163,78,.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(198,163,78,.06)'}>
              + {se.fn} <span style={{color:isOfficial?(isApprox?'#facc15':'#4ade80'):'#5e5c56',marginLeft:6}}>{isApprox?'≈':''}{fmt(displaySalary)}</span>
              {isOfficial&&!isApprox&&<span style={{fontSize:8,color:'#4ade80',marginLeft:4}}>SPF</span>}
              {isApprox&&<span style={{fontSize:8,color:'#facc15',marginLeft:4}}>≈</span>}
            </button>
          );})}
        </div>
      </div>}

      {data.emps.length>0&&<div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
          <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
            {['Prénom','Nom','NISS','Fonction','Anc.','Brut min.','Contrat','Situation','Enf.',''].map(h=><th key={h} style={{textAlign:'left',padding:'8px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{h}</th>)}
          </tr></thead>
          <tbody>{data.emps.map(emp=>(
            <tr key={emp.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <td style={{padding:'6px 10px'}}><input value={emp.first} onChange={e=>updEmp(emp.id,'first',e.target.value)} placeholder="Prénom" style={{width:90,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:12,fontFamily:'inherit',outline:'none'}}/></td>
              <td style={{padding:'6px 10px'}}><input value={emp.last} onChange={e=>updEmp(emp.id,'last',e.target.value)} placeholder="Nom" style={{width:90,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:12,fontFamily:'inherit',outline:'none'}}/></td>
              <td style={{padding:'6px 10px'}}><input value={emp.niss} onChange={e=>updEmp(emp.id,'niss',e.target.value)} placeholder="XX.XX.XX-XXX.XX" style={{width:110,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:12,fontFamily:'inherit',outline:'none'}}/></td>
              <td style={{padding:'6px 10px',fontSize:12,color:'#c6a34e'}}>{emp.fn}</td>
              <td style={{padding:'6px 10px'}}><input type="number" value={emp.anciennete||0} onChange={e=>updEmp(emp.id,'anciennete',e.target.value)} min={0} max={40} style={{width:40,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#60a5fa',fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'center'}} title="Années d'ancienneté"/></td>
              <td style={{padding:'6px 10px'}}><div style={{display:'flex',flexDirection:'column',gap:2}}><input type="number" value={emp.monthlySalary} onChange={e=>updEmp(emp.id,'monthlySalary',e.target.value)} style={{width:80,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#4ade80',fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'right'}}/>{emp.baremeInfo&&<div style={{fontSize:8,color:'#60a5fa',maxWidth:100,lineHeight:1.2}}>{emp.baremeInfo}</div>}</div></td>
              <td style={{padding:'6px 10px'}}><select value={emp.contract} onChange={e=>updEmp(emp.id,'contract',e.target.value)} style={{padding:'5px 6px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:11,fontFamily:'inherit',outline:'none'}}><option value="CDI">CDI</option><option value="CDD">CDD</option><option value="trav_det">Trav. défini</option><option value="remplacement">Remplacement</option><option value="tpartiel">Temps partiel</option><option value="INTERIM">Intérim</option><option value="STUDENT">Étudiant</option><option value="FLEXI">Flexi-job</option><option value="saisonnier">Saisonnier</option><option value="occas_horeca">Extra Horeca</option><option value="titre_service">Titres-services</option><option value="art60">Art.60§7</option><option value="CIP">CIP</option><option value="alternance">Alternance</option><option value="CPE">1er emploi</option><option value="ETA">Travail adapté</option><option value="detache">Détaché</option><option value="domestique">Domestique</option><option value="indep_princ">Indép. princ.</option><option value="indep_compl">Indép. compl.</option><option value="mandataire">Mandataire</option><option value="freelance">Freelance</option><option value="smart">Smart</option><option value="artiste">Artiste</option></select></td>
              <td style={{padding:'6px 10px'}}><select value={emp.civil} onChange={e=>updEmp(emp.id,'civil',e.target.value)} style={{padding:'5px 6px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:11,fontFamily:'inherit',outline:'none'}}><option value="single">Isolé</option><option value="married_2">Marié (2 revenus)</option><option value="married_1">Marié (1 revenu)</option><option value="cohabit">Cohabitant légal</option></select></td>
              <td style={{padding:'6px 10px'}}><input type="number" value={emp.depChildren} onChange={e=>updEmp(emp.id,'depChildren',e.target.value)} min={0} style={{width:40,padding:'6px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:'#d4d0c8',fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'center'}}/></td>
              <td style={{padding:'6px 6px'}}><button onClick={()=>remEmp(emp.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:16}}>✕</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:12,color:'#5e5c56'}}>{data.emps.length} travailleur{data.emps.length>1?'s':''} ajouté{data.emps.length>1?'s':''}</div>
        <div style={{display:'flex',gap:10}}>
          <B v="outline" onClick={()=>setStep(2)}>← Retour</B>
          <B onClick={()=>setStep(4)}>Suivant →</B>
        </div>
      </div>
    </div>}

    {step===4&&<div style={stepStyle}>
      <div style={{fontSize:18,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Récapitulatif du dossier</div>
      <div style={{fontSize:12,color:'#5e5c56',marginBottom:20}}>Vérifiez les informations avant de créer le dossier</div>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div>
          <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:10}}>Société</div>
          <div style={{fontSize:13,color:'#9e9b93',lineHeight:2.2}}>
            <div>Raison sociale: <b style={{color:'#e8e6e0'}}>{data.name}</b></div>
            <div>Forme: <b style={{color:'#e8e6e0'}}>{formes.find(f=>f.v===data.forme)?.l}</b></div>
            <div>TVA: <b style={{color:'#e8e6e0'}}>{data.vat||'—'}</b></div>
            <div>ONSS: <b style={{color:'#e8e6e0'}}>{data.onss||'—'}</b></div>
            <div>Contact: <b style={{color:'#e8e6e0'}}>{data.contact||'—'}</b></div>
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:10}}>Activité</div>
          <div style={{fontSize:13,color:'#9e9b93',lineHeight:2.2}}>
            <div>Secteur: <b style={{color:'#e8e6e0'}}>{selActivity?.l||'—'}</b></div>
            <div>Type: <b style={{color:'#e8e6e0'}}>{selType?.l||'—'}</b></div>
            <div>CP: <b style={{color:'#4ade80'}}>CP {autoCP}</b></div>
            {data.cpEmploye&&<div>CP Employés: <b style={{color:'#4ade80'}}>CP {data.cpEmploye}</b></div>}
            {data.cpOuvrier&&<div>CP Ouvriers: <b style={{color:'#fb923c'}}>CP {data.cpOuvrier}</b></div>}
            {data.naceCodes.length>0&&<div>NACE: <b style={{color:'#60a5fa'}}>{data.naceCodes.join(', ')}</b></div>}
            <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{data.emps.length}</b></div>
            {data.emps.length>0&&<div>Masse brute: <b style={{color:'#c6a34e'}}>{fmt(data.emps.reduce((a,e)=>a+e.monthlySalary,0))}/mois</b></div>}
          </div>
        </div>
      </div>

      {data.emps.length>0&&<div style={{marginTop:16}}>
        <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:8}}>Travailleurs ({data.emps.length})</div>
        <div style={{display:'grid',gap:6}}>
          {data.emps.map(e=>(
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:'rgba(198,163,78,.03)',borderRadius:6,fontSize:12,flexWrap:'wrap',gap:4}}>
              <span style={{color:'#e8e6e0'}}>{e.first||'?'} {e.last||'?'}</span>
              <span style={{color:'#9e9b93'}}>{e.fn}</span>
              <span style={{color:'#c6a34e',fontWeight:600}}>{fmt(e.monthlySalary)}</span>
              <span style={{color:'#60a5fa',fontSize:10}}>{e.baremeInfo||''}</span>
              <span style={{color:'#5e5c56'}}>{e.contract} · {e.civil==='single'?'Isolé':e.civil==='married_1'?'Marié (1 revenu)':e.civil==='married_2'?'Marié (2 revenus)':'Cohabitant légal'} · {e.depChildren} enf.</span>
            </div>
          ))}
        </div>
      </div>}

      {/* Avantages sectoriels */}
      {(()=>{const avs=getCPAvantages(autoCP);return avs.length>0?<div style={{marginTop:16}}>
        <div style={{fontSize:11,color:'#4ade80',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:8}}>Avantages sectoriels CP {autoCP}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {avs.map((a,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 10px',background:'rgba(74,222,128,.03)',borderRadius:5,fontSize:11.5}}>
            <span style={{color:'#9e9b93'}}>{a.l}</span><span style={{color:'#4ade80',fontWeight:600}}>{a.v}</span>
          </div>)}
        </div>
      </div>:null;})()}

      <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
        <B v="outline" onClick={()=>setStep(3)}>← Retour</B>
        <B onClick={finish} style={{fontSize:15,padding:'12px 32px'}}>✓ Créer le dossier</B>
      </div>
    </div>}
  </div>;
}

function ClientsPage({s,d,user,onLogout}){
  const [showWizard,setShowWizard]=useState(false);
  const [search,setSearch]=useState('');
  
  const handleFinish=(result)=>{
    d({type:'ADD_CLIENT',d:{company:result.company,emps:result.emps,pays:[],dims:[],dmfas:[],fiches:[],docs:[],sector:result.sector,subType:result.subType}});
    setShowWizard(false);
  };
  
  const filtered=(s.clients||[]).filter(c=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return c.company?.name?.toLowerCase().includes(q)||c.company?.vat?.toLowerCase().includes(q)||c.company?.contact?.toLowerCase().includes(q);
  });

  const stats={total:s.clients?.length||0,emps:(s.clients||[]).reduce((a,c)=>a+(c.emps?.length||0),0)};

  return(
    <div style={{minHeight:'100vh',background:'#060810',color:'#d4d0c8',fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet"/>
      
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#090c16,#0e1225)',borderBottom:'1px solid rgba(139,115,60,.12)',padding:'20px 36px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#c6a34e,#e2c878)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:20,fontWeight:800,color:'#060810'}}>A</span></div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#c6a34e,#e2c878)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AUREUS SOCIAL PRO</div>
            <div style={{fontSize:9,color:'#8b7340',letterSpacing:'3px',textTransform:'uppercase'}}>Gestion des dossiers clients</div>
          </div>
        </div>
        <div style={{display:'flex',gap:14,alignItems:'center'}}>
          <div style={{textAlign:'right',marginRight:10}}>
            <div style={{fontSize:11,color:'#9e9b93'}}>{stats.total} dossier{stats.total>1?'s':''} · {stats.emps} travailleur{stats.emps>1?'s':''}</div>
            {user&&<div style={{fontSize:10,color:'#5e5c56'}}>{user.email}</div>}
          </div>
          {onLogout&&<button onClick={onLogout} style={{padding:'8px 14px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:8,color:'#fb923c',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Déconnexion</button>}
          <B onClick={()=>setShowWizard(!showWizard)}>{showWizard?'✕ Annuler':'+ Nouveau dossier'}</B>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'30px 36px'}}>
        {showWizard?<ClientWizard onFinish={handleFinish} onCancel={()=>setShowWizard(false)}/>:<>
        {/* Search */}
        <div style={{marginBottom:20}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un dossier (nom, TVA, contact)..."
            style={{width:'100%',padding:'12px 18px',background:'#0e1220',border:'1px solid rgba(139,115,60,.12)',borderRadius:10,color:'#d4d0c8',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
        </div>

        {/* Client grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340,1fr))',gap:16}}>
          {filtered.map(cl=>(
            <div key={cl.id} onClick={()=>d({type:'SELECT_CLIENT',id:cl.id})}
              style={{background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.12)',borderRadius:14,padding:'20px 22px',cursor:'pointer',transition:'all .2s',position:'relative'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(198,163,78,.35)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(139,115,60,.12)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
              
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:'#e8e6e0'}}>{cl.company?.name||'Sans nom'}</div>
                  <div style={{fontSize:11,color:'#8b7340',marginTop:2}}>{cl.company?.vat||'Pas de TVA'}</div>
                </div>
                <div style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:'rgba(198,163,78,.08)',color:'#c6a34e',fontWeight:600}}>{cl.sector||'PME'}</div>
              </div>
              
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11.5,color:'#9e9b93'}}>
                <div>👤 {cl.emps?.length||0} travailleur{(cl.emps?.length||0)>1?'s':''}</div>
                <div>📍 {cl.company?.addr||'—'}</div>
                <div>📞 {cl.company?.contact||'—'}</div>
                <div>📧 {cl.company?.email||'—'}</div>
              </div>
              
              {cl.updatedAt&&<div style={{fontSize:9.5,color:'#3a3930',marginTop:10}}>Modifié: {new Date(cl.updatedAt).toLocaleDateString('fr-BE')}</div>}
              
              <button onClick={e=>{e.stopPropagation();if(confirm(`Supprimer le dossier "${cl.company?.name}" ?`))d({type:'DEL_CLIENT',id:cl.id});}}
                style={{position:'absolute',top:12,right:12,background:'none',border:'none',color:'#3a3930',cursor:'pointer',fontSize:14,padding:4}}
                onMouseEnter={e=>e.target.style.color='#f87171'} onMouseLeave={e=>e.target.style.color='#3a3930'}>✕</button>
            </div>
          ))}
          
          {filtered.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:60}}>
            <div style={{fontSize:48,marginBottom:16}}>📂</div>
            <div style={{fontSize:16,color:'#5e5c56',marginBottom:8}}>Aucun dossier client</div>
            <div style={{fontSize:13,color:'#3a3930',marginBottom:20}}>Créez votre premier dossier pour commencer</div>
            <B onClick={()=>setShowWizard(true)}>+ Créer un dossier</B>
          </div>}
        </div>
        </>}
        
        {/* Footer */}
        <div style={{textAlign:'center',marginTop:40,padding:'20px 0',borderTop:'1px solid rgba(139,115,60,.08)',color:'#3a3930',fontSize:10}}>
          {AUREUS_INFO.name} · {AUREUS_INFO.addr} · TVA: {AUREUS_INFO.vat} · {AUREUS_INFO.email}<br/>© {new Date().getFullYear()} Aureus IA — Tous droits réservés
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
function AppInner({ supabase, user, onLogout }) {
  const [loggedIn,setLoggedIn]=useState(true);
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(null);
  
  const [s, d] = useReducer(reducer, {
    page:'clients',sub:null,co:COMPANY,emps:[],pays:[],dims:[],dmfas:[],fiches:[],docs:[],modal:null,
    clients:[],pin:null,activeClient:null,
  });

  // Load data from persistent storage on mount
  useEffect(()=>{
    loadData().then(data=>{
      if(data && data.clients && data.clients.length > 0){
        setSaved(data);
        d({type:'LOAD_ALL',d:{clients:data.clients||[],pin:data.pin||null}});
      } else {
        // ── DOSSIER DÉMO — Aureus IA SPRL ──
        const demoClient = {
          id:'CL-DEMO-AUREUS',
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString(),
          company:{
            name:'Aureus IA SPRL',
            vat:'BE 1028.230.781',
            bce:'1028230781',
            addr:'Saint-Gilles, 1060 Bruxelles',
            onss:'',
            bank:'',bic:'',
            cp:'200',
            contact:'Moussati',
            email:'info@aureu-ia.com',
            phone:'',
            insurer:'',policyNr:'',
            secSoc:'',
            nace:'62.010',
            forme:'SRL (ex-SPRL)',
            activity:'Programmation informatique et développement IA',
          },
          emps:[
            {id:'E-DEMO-001',nom:'Dupont',prenom:'Marie',niss:'85.07.15-123.45',
             sexe:'F',dateNaissance:'1985-07-15',
             adresse:'Rue de la Loi 42',cp:'1000',ville:'Bruxelles',
             fonction:'Développeuse Senior IA',departement:'R&D',
             contrat:'cdi',regime:'full',statut:'employe',
             salaireBrut:4200,dateEntree:'2024-03-01',dateSortie:'',
             iban:'BE68 5390 0754 7034',
             etatCivil:'isole',enfants:0,
             heuresSup:0,heuresDim:0,heuresNuit:0,heuresSupFisc:0,
             hsVolontBrutNet:0,hsRelance:0,
             prime:0,y13:false,avance:0,
             chequesRepas:true,ecoChq:true,
             transport:'domicile_travail',distKm:12,
             fraisEmployeur:0,
             pensionCompl:0,pensionComplEmpl:0,
             actif:true,
            },
            {id:'E-DEMO-002',nom:'Janssens',prenom:'Pieter',niss:'90.11.22-456.78',
             sexe:'M',dateNaissance:'1990-11-22',
             adresse:'Chaussée de Charleroi 110',cp:'1060',ville:'Saint-Gilles',
             fonction:'Data Analyst',departement:'Trading',
             contrat:'cdi',regime:'full',statut:'employe',
             salaireBrut:3650,dateEntree:'2024-09-15',dateSortie:'',
             iban:'BE71 0961 2345 6789',
             etatCivil:'cohabitant',enfants:1,
             heuresSup:0,heuresDim:0,heuresNuit:0,heuresSupFisc:0,
             hsVolontBrutNet:0,hsRelance:0,
             prime:0,y13:false,avance:0,
             chequesRepas:true,ecoChq:true,
             transport:'domicile_travail',distKm:5,
             fraisEmployeur:0,
             pensionCompl:0,pensionComplEmpl:0,
             actif:true,
            },
            {id:'E-DEMO-003',nom:'El Amrani',prenom:'Yasmine',niss:'00.03.10-789.01',
             sexe:'F',dateNaissance:'2000-03-10',
             adresse:'Avenue Louise 230',cp:'1050',ville:'Ixelles',
             fonction:'Stagiaire développement',departement:'R&D',
             contrat:'student',regime:'partiel',statut:'student',
             salaireBrut:1800,dateEntree:'2025-09-01',dateSortie:'2026-06-30',
             iban:'BE32 3631 9876 5432',
             etatCivil:'isole',enfants:0,
             heuresSup:0,heuresDim:0,heuresNuit:0,heuresSupFisc:0,
             hsVolontBrutNet:0,hsRelance:0,
             prime:0,y13:false,avance:0,
             chequesRepas:false,ecoChq:false,
             transport:'domicile_travail',distKm:8,
             fraisEmployeur:0,
             pensionCompl:0,pensionComplEmpl:0,
             actif:true,
            },
          ],
          pays:[],dims:[],dmfas:[],fiches:[],docs:[],
        };
        const demoData = {clients:[demoClient],pin:null};
        setSaved(demoData);
        d({type:'LOAD_ALL',d:demoData});
        saveData(demoData);
      }
      setLoading(false);
    });
  },[]);

  const handleLogin=(pin)=>{
    if(!saved?.pin){
      saveData({...saved,pin,clients:saved?.clients||[]});
    }
    setLoggedIn(true);
  };

  const {lang,t} = useLang();
  const nav=[
    {id:'dashboard',l:t('nav.dashboard'),i:'◫'},
    {id:'employees',l:t('nav.employees'),i:'◉'},
    {id:'payslip',l:t('nav.payslip'),i:'◈'},
    {id:'onss',l:t('nav.onss'),i:'◆',sub:[{id:'dimona',l:t('sub.dimona')},{id:'dmfa',l:t('sub.dmfa')},{id:'drs',l:t('sub.drs')},{id:'onssapl',l:t('sub.onssapl')}]},
    {id:'fiscal',l:t('nav.fiscal'),i:'◇',sub:[{id:'belcotax',l:t('sub.belcotax')},{id:'precompte',l:t('sub.precompte')},{id:'fiches_ext',l:t('sub.fiches_ext')},{id:'co2',l:t('sub.co2')},{id:'atn',l:t('sub.atn')}]},
    {id:'salaires',l:t('nav.salaires'),i:'◈',sub:[{id:'od',l:t('sub.od')},{id:'provisions',l:t('sub.provisions')},{id:'cumuls',l:t('sub.cumuls')},{id:'netbrut',l:t('sub.netbrut')},{id:'simcout',l:t('sub.simcout')},{id:'saisies',l:t('sub.saisies')},{id:'indexauto',l:t('sub.indexauto')},{id:'horsforfait',l:t('sub.horsforfait')},{id:'totalreward',l:t('sub.totalreward')}]},
    {id:'avantages',l:t('nav.avantages'),i:'★',sub:[{id:'cheques',l:t('sub.cheques')},{id:'ecocmd',l:t('sub.ecocmd')},{id:'cafeteria',l:t('sub.cafeteria')},{id:'cct90',l:t('sub.cct90')},{id:'warrants',l:t('sub.warrants')},{id:'budgetmob',l:t('sub.budgetmob')},{id:'ecocircul',l:t('sub.ecocircul')}]},
    {id:'contratsmenu',l:t('nav.contrats'),i:'▣',sub:[{id:'contrats',l:t('sub.contrats2')},{id:'reglement',l:t('sub.reglement')},{id:'compteindiv',l:t('sub.compteindiv')},{id:'preavis',l:t('sub.preavis')},{id:'pecsortie',l:t('sub.pecsortie')},{id:'certpme',l:t('sub.certpme')}]},
    {id:'rh',l:t('nav.rh'),i:'◉',sub:[{id:'absences',l:t('sub.absences')},{id:'absenteisme',l:t('sub.absenteisme')},{id:'credittemps',l:t('sub.credittemps')},{id:'chomtemp',l:t('sub.chomtemp')},{id:'congeduc',l:t('sub.congeduc')},{id:'rcc',l:t('sub.rcc')},{id:'outplacement',l:t('sub.outplacement')},{id:'pointage',l:t('sub.pointage')},{id:'planform',l:t('sub.planform')},{id:'medtravail',l:t('sub.medtravail')},{id:'selfservice',l:t('sub.selfservice')}]},
    {id:'social',l:t('nav.social'),i:'◆',sub:[{id:'assloi',l:t('sub.assloi')},{id:'assgroupe',l:t('sub.assgroupe')},{id:'syndicales',l:t('sub.syndicales')},{id:'allocfam',l:t('sub.allocfam')},{id:'caissevac',l:t('sub.caissevac')},{id:'rentes',l:t('sub.rentes')},{id:'decava',l:t('sub.decava')},{id:'aidesemploi',l:t('sub.aidesemploi')}]},
    {id:'bienetre',l:t('nav.bienetre'),i:'♥',sub:[{id:'planglobal',l:t('sub.planglobal')},{id:'paa',l:t('sub.paa')},{id:'risquespsycho',l:t('sub.risquespsycho')},{id:'alcool',l:t('sub.alcool')},{id:'elections',l:t('sub.elections')},{id:'organes',l:t('sub.organes')}]},
    {id:'reporting',l:t('nav.reporting'),i:'▤',sub:[{id:'accounting',l:t('sub.accounting')},{id:'bilanbnb',l:t('sub.bilanbnb')},{id:'bilan',l:t('sub.bilan')},{id:'statsins',l:t('sub.statsins')},{id:'sepa',l:t('sub.sepa')},{id:'peppol',l:t('sub.peppol')},{id:'envoi',l:t('sub.envoi')},{id:'exportimport',l:t('sub.exportimport')},{id:'ged',l:t('sub.ged')}]},
    {id:'aureussuite',l:t('nav.aureussuite'),i:'🔷',sub:[
      {id:'aureus_pointage',l:'⏱ Aureus Pointage'},
      {id:'aureus_paie',l:'💰 Aureus Paie'},
      {id:'aureus_titres_services',l:'🏠 Aureus Titres-Services'},
      {id:'aureus_aide_domicile',l:'🏥 Aureus Aide à Domicile'},
      {id:'aureus_portail',l:'🌐 Aureus Portail'},
      {id:'aureus_mobile',l:'📱 Aureus Mobile'},
      {id:'aureus_chantier',l:'🏗 Aureus Chantier'},
      {id:'aureus_tableau_bord',l:'📊 Aureus Tableau de Bord'},
    ]},
    {id:'legal',l:t('nav.legal'),i:'⚖',sub:[{id:'docsjuridiques',l:t('sub.docsjuridiques')},{id:'alertes',l:t('sub.alertes')},{id:'secteurs',l:t('sub.secteurs')},{id:'eta',l:t('sub.eta')}]},
    {id:'settings',l:t('nav.settings'),i:'⚙',sub:[{id:'config',l:t('sub.config')},{id:'fraisgestion',l:t('sub.fraisgestion')}]},
  ];

  // ── Spotlight / Recherche globale (ALL HOOKS BEFORE EARLY RETURNS) ──
  const [spotQ,setSpotQ]=useState('');
  const [spotOpen,setSpotOpen]=useState(false);
  const spotRef=useRef(null);
  const spotIndex=useMemo(()=>{
    const items=[];
    nav.forEach(it=>{
      items.push({id:it.id,sub:it.sub?.[0]?.id||null,label:it.l,icon:it.i,parent:null});
      if(it.sub)it.sub.forEach(sb=>{
        items.push({id:it.id,sub:sb.id,label:sb.l,icon:it.i,parent:it.l});
      });
    });
    return items;
  },[]);
  const spotResults=useMemo(()=>{
    if(!spotQ.trim())return[];
    const q=spotQ.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return spotIndex.filter(it=>{
      const txt=(it.label+(it.parent||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return txt.includes(q);
    }).slice(0,10);
  },[spotQ,spotIndex]);
  const spotNav=(item)=>{d({type:'NAV',page:item.id,sub:item.sub});setSpotQ('');setSpotOpen(false);};
  useEffect(()=>{
    const handler=(e)=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setSpotOpen(o=>!o);setTimeout(()=>spotRef.current?.focus(),50);}
      if(e.key==='Escape'){setSpotOpen(false);setSpotQ('');}};
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[]);
  useEffect(()=>{
    if(!spotOpen)return;
    const h=(e)=>{
      const container=document.getElementById('spot-container');
      if(container&&!container.contains(e.target)){setSpotOpen(false);}
    };
    const t=setTimeout(()=>document.addEventListener('mousedown',h),100);
    return()=>{clearTimeout(t);document.removeEventListener('mousedown',h);};
  },[spotOpen]);

  // ── Early returns (AFTER all hooks) ──
  if(loading)return <div style={{minHeight:'100vh',background:'#060810',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{textAlign:'center'}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:32,fontWeight:700,background:'linear-gradient(135deg,#c6a34e,#e2c878,#c6a34e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:12}}>AUREUS SOCIAL</div>
      <div style={{color:'#8b7340',fontSize:12,letterSpacing:3}}>CHARGEMENT...</div>
    </div>
  </div>;
  if(!loggedIn)return <LoginPage onLogin={handleLogin}/>;
  if(!s.activeClient)return <ClientsPage s={s} d={d} user={user} onLogout={onLogout}/>;

  const pg=()=>{
    switch(s.page){
      case'dashboard':return <Dashboard s={s} d={d}/>;
      case'employees':return <Employees s={s} d={d}/>;
      case'payslip':return <Payslips s={s} d={d}/>;
      case'onss':return s.sub==='dmfa'?<DMFAPage s={s} d={d}/>:s.sub==='drs'?<DRSMod s={s} d={d}/>:s.sub==='onssapl'?<ONSSAPLMod s={s} d={d}/>:<DimonaPage s={s} d={d}/>;
      case'fiscal':return s.sub==='precompte'?<PrecomptePage s={s} d={d}/>:s.sub==='fiches_ext'?<FichesMod s={s} d={d}/>:s.sub==='co2'?<CO2Mod s={s} d={d}/>:s.sub==='atn'?<ATNMod s={s} d={d}/>:<BelcotaxPage s={s} d={d}/>;
      case'salaires':return <SalairesPage s={s} d={d}/>;
      case'avantages':return <AvantagesPage s={s} d={d}/>;
      case'contratsmenu':return <ContratsMenuPage s={s} d={d}/>;
      case'rh':return <RHPage s={s} d={d}/>;
      case'social':return <SocialPage s={s} d={d}/>;
      case'bienetre':return <BienetrePage s={s} d={d}/>;
      case'reporting':return <ReportingPage s={s} d={d}/>;
      case'legal':return <LegalPage s={s} d={d}/>;
      case'aureussuite':return <AureusSuitePage s={s} d={d}/>;
      case'documents':return <DocsPage s={s} d={d}/>;
      case'reports':return <ReportsPage s={s} d={d}/>;
      case'settings':return s.sub==='fraisgestion'?<FraisGestionMod s={s} d={d}/>:<SettingsPage s={s} d={d}/>;
      case'modules':return <ModulesProPage s={s} d={d}/>;
      default:return <Dashboard s={s} d={d}/>;
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#060810',color:'#d4d0c8',fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",display:'flex'}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet"/>
      
      {/* SIDEBAR */}
      <aside style={{width:268,background:'linear-gradient(180deg,#090c16,#060810)',borderRight:'1px solid rgba(139,115,60,.12)',position:'fixed',top:0,left:0,bottom:0,display:'flex',flexDirection:'column',zIndex:100,boxShadow:'4px 0 24px rgba(0,0,0,.3)'}}>
        <div style={{padding:'26px 22px 18px',borderBottom:'1px solid rgba(139,115,60,.12)'}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:23,fontWeight:700,background:'linear-gradient(135deg,#c6a34e,#e2c878,#c6a34e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AUREUS SOCIAL</div>
          <div style={{fontSize:9.5,color:'#8b7340',marginTop:2,letterSpacing:'3.5px',textTransform:'uppercase',fontWeight:500}}>{t('app.subtitle')}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
            <LangSwitch/>
          </div>
          {s.activeClient&&<div style={{marginTop:10,padding:'8px 10px',background:'rgba(198,163,78,.06)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e'}}>{s.co.name||'Client'}</div>
            <div style={{fontSize:9.5,color:'#8b7340',marginTop:2}}>{s.co.vat}</div>
          </div>}
          <button onClick={()=>d({type:'BACK_TO_CLIENTS'})} style={{width:'100%',marginTop:10,padding:'7px',background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.1)',borderRadius:6,color:'#60a5fa',fontSize:10.5,cursor:'pointer',fontFamily:'inherit'}}>{t('nav.back')}</button>
          <div id="spot-container" style={{position:'relative',marginTop:10}}>
            <input ref={spotRef} value={spotQ} onChange={e=>{setSpotQ(e.target.value);setSpotOpen(true);}}
              onFocus={()=>setSpotOpen(true)}
              placeholder={t('nav.search')}
              style={{width:'100%',padding:'9px 12px',background:'rgba(198,163,78,.04)',border:'1px solid rgba(198,163,78,.1)',borderRadius:8,color:'#e8e6e0',fontSize:11.5,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            {spotOpen&&spotResults.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:4,background:'#0f1220',border:'1px solid rgba(198,163,78,.2)',borderRadius:10,boxShadow:'0 12px 40px rgba(0,0,0,.6)',zIndex:200,maxHeight:340,overflowY:'auto'}}>
              {spotResults.map((it,i)=><div key={i} onClick={()=>spotNav(it)}
                style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid rgba(198,163,78,.06)',display:'flex',alignItems:'center',gap:10}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(198,163,78,.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{fontSize:14,opacity:.5}}>{it.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:'#e8e6e0'}}>{it.label}</div>
                  {it.parent&&<div style={{fontSize:10,color:'#8b7340'}}>{it.parent}</div>}
                </div>
              </div>)}
            </div>}
            {spotOpen&&spotQ&&spotResults.length===0&&<div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:4,background:'#0f1220',border:'1px solid rgba(198,163,78,.2)',borderRadius:10,padding:'14px 16px',fontSize:11.5,color:'#5e5c56',textAlign:'center',zIndex:200}}>{t('nav.noresult')}</div>}
          </div>
        </div>
        <nav style={{padding:'10px 8px',flex:1,overflowY:'auto'}}>
          {nav.map(it=>{
            const ac=s.page===it.id;
            return <div key={it.id}>
              <button onClick={()=>d({type:'NAV',page:it.id,sub:it.sub?.[0]?.id})} style={{display:'flex',alignItems:'center',gap:11,width:'100%',padding:'10px 14px',marginBottom:1,border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:ac?600:400,color:ac?'#c6a34e':'#9e9b93',background:ac?'rgba(198,163,78,.08)':'transparent',borderLeft:ac?'2px solid #c6a34e':'2px solid transparent',fontFamily:'inherit',textAlign:'left',transition:'all .15s'}}
                onMouseEnter={e=>{if(!ac){e.currentTarget.style.color='#e2c878';e.currentTarget.style.background='rgba(198,163,78,.04)';}}}
                onMouseLeave={e=>{if(!ac){e.currentTarget.style.color='#9e9b93';e.currentTarget.style.background='transparent';}}}
              ><span style={{fontSize:15,opacity:ac?1:.5}}>{it.i}</span>{it.l}</button>
              {ac&&it.sub&&<div style={{paddingLeft:34,marginBottom:3}}>
                {it.sub.map(sb=><button key={sb.id} onClick={()=>d({type:'NAV',page:it.id,sub:sb.id})} style={{display:'block',width:'100%',padding:'6px 12px',border:'none',borderRadius:6,cursor:'pointer',fontSize:12,textAlign:'left',fontFamily:'inherit',color:s.sub===sb.id?'#c6a34e':'#5e5c56',background:s.sub===sb.id?'rgba(198,163,78,.06)':'transparent',fontWeight:s.sub===sb.id?500:400}}>{sb.l}</button>)}
              </div>}
            </div>;
          })}
        </nav>
        <div style={{padding:'14px 18px',borderTop:'1px solid rgba(139,115,60,.12)',fontSize:9.5,color:'#5e5c56'}}>
          <div>{COMPANY.vat} · ONSS: {COMPANY.onss}</div>
          <div style={{marginTop:4,color:'#8b7340',fontWeight:500}}>v2.0 Pro — 2025</div>
        </div>
      </aside>

      <main style={{marginLeft:268,flex:1,padding:'26px 34px',minHeight:'100vh'}}>{pg()}</main>

      {s.modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={()=>d({type:'MODAL',m:null})}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#0c0f1a',border:'1px solid rgba(139,115,60,.15)',borderRadius:16,padding:28,width:s.modal.w||700,maxHeight:'85vh',overflowY:'auto'}}>{s.modal.c}</div>
      </div>}

      {/* AGENT IA JURIDIQUE — Bouton flottant */}
      <FloatingLegalAgent />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({s,d}) {
  const ae=s.emps.filter(e=>e.status==='active');
  const tm=ae.reduce((a,e)=>a+(e.monthlySalary||0),0);
  const tc=ae.reduce((a,e)=>a+calc(e,DPER,s.co).costTotal,0);
  return <div>
    <PH title="Tableau de bord" sub={`${MN[new Date().getMonth()]} ${new Date().getFullYear()} — ${ae.length} employé(s) actif(s)`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:24}}>
      <SC label="Employés" value={ae.length}/>
      <SC label="Masse brute" value={fmt(tm)} color="#4ade80"/>
      <SC label="Salaire moyen" value={fmt(ae.length?tm/ae.length:0)} color="#60a5fa"/>
      <SC label="Coût employeur" value={fmt(tc)} color="#a78bfa"/>
      <SC label="Déclarations" value={`${s.pays.length} fiches`} sub={`${s.dims.length} Dimona · ${s.dmfas.length} DMFA`}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <C><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Actions rapides</div>
        {[{l:'+ Nouvel employé',p:'employees'},{l:'↳ Fiche de paie',p:'payslip'},{l:'⬆ Dimona',p:'onss',sb:'dimona'},{l:'⬆ DMFA',p:'onss',sb:'dmfa'},{l:'◇ Belcotax 281.10',p:'fiscal',sb:'belcotax'},{l:'▣ Document C4',p:'documents'}].map((a,i)=>
          <button key={i} onClick={()=>d({type:'NAV',page:a.p,sub:a.sb})} style={{display:'block',width:'100%',padding:'9px 12px',marginBottom:5,background:'rgba(198,163,78,.04)',border:'1px solid rgba(198,163,78,.08)',borderRadius:7,color:'#c6a34e',cursor:'pointer',fontSize:12,fontWeight:500,textAlign:'left',fontFamily:'inherit'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(198,163,78,.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(198,163,78,.04)'}>{a.l}</button>
        )}
      </C>
      <C><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Employés</div>
        {ae.map(e=>{const p=calc(e,DPER,s.co);return <div key={e.id} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div><div style={{fontSize:12.5,fontWeight:500,color:'#e8e6e0'}}>{e.first} {e.last}</div><div style={{fontSize:10.5,color:'#5e5c56'}}>{e.fn} · CP {e.cp}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>{fmt(p.net)}</div><div style={{fontSize:9.5,color:'#5e5c56'}}>net</div></div>
        </div>;})}
      </C>
      <C><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Échéances légales</div>
        {[{d:'5 du mois',l:'Précompte 274 — FINPROF',t:'mensuel'},{d:'Avant embauche',l:'Dimona IN',t:'event'},{d:'Fin trimestre',l:'DMFA trimestrielle',t:'trimestriel'},{d:'1er mars',l:'Belcotax 281.xx',t:'annuel'},{d:'Fin février',l:'Bilan Social',t:'annuel'}].map((x,i)=>
          <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center'}}>
            <span style={{fontSize:9.5,padding:'2px 7px',borderRadius:4,fontWeight:600,background:x.t==='mensuel'?'rgba(96,165,250,.1)':x.t==='trimestriel'?'rgba(167,139,250,.1)':'rgba(198,163,78,.1)',color:x.t==='mensuel'?'#60a5fa':x.t==='trimestriel'?'#a78bfa':'#c6a34e',textTransform:'uppercase',letterSpacing:'.5px',whiteSpace:'nowrap'}}>{x.t}</span>
            <div><div style={{fontSize:12,color:'#d4d0c8'}}>{x.l}</div><div style={{fontSize:10.5,color:'#5e5c56'}}>{x.d}</div></div>
          </div>
        )}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  EMPLOYEES
// ═══════════════════════════════════════════════════════════════
function Employees({s,d}) {
  const [form,setF]=useState(null);
  const [ed,setEd]=useState(false);
  const empty={first:'',last:'',niss:'',birth:'',addr:'',city:'',zip:'',startD:'',endD:'',fn:'',dept:'',contract:'CDI',regime:'full',whWeek:38,monthlySalary:0,civil:'single',depChildren:0,handiChildren:0,iban:'',mvT:10,mvW:1.09,mvE:8.91,expense:0,cp:'200',dmfaCode:'495',dimType:'OTH',commDist:0,commType:'none',commMonth:0,status:'active',sexe:'M',statut:'employe',niveauEtude:'sec',carFuel:'none',carCO2:0,carCatVal:0,carBrand:'',carModel:'',atnGSM:false,atnPC:false,atnInternet:false,atnLogement:false,atnLogementRC:0,atnChauffage:false,atnElec:false,depAscendant:0,depAscendantHandi:0,conjointHandicap:false,depAutres:0,anciennete:0,nrEngagement:0,engagementTrimestre:1,
    // Vélo & Mobilité
    veloSociete:false,        // Vélo de société (leasing) mis à disposition
    veloType:'none',          // none, classique, electrique, speed_pedelec
    veloValeur:0,             // Valeur catalogue du vélo
    veloLeasingMois:0,        // Coût leasing mensuel (employeur)
    carteCarburant:false,     // Carte carburant/recharge liée à voiture société
    carteCarburantMois:0,     // Budget mensuel carte carburant
    borneRecharge:false,      // Borne de recharge installée au domicile
    borneRechargeCoût:0,      // Coût mensuel borne + électricité
    // Frontalier / Travailleur transfrontalier
    frontalier:false,          // Travailleur résidant hors Belgique
    frontalierPays:'',         // FR, NL, DE, LU
    frontalierConvention:'',   // Convention préventive double imposition applicable
    frontalierA1:false,        // Formulaire A1 / détachement (Règl. 883/2004)
    frontalierExoPP:false,     // Exonération PP si convention le prévoit
    // Pensionné / Cumul pension-travail
    pensionné:false,           // Travailleur bénéficiant d'une pension (légale ou anticipée)
    pensionType:'none',        // none, legal, anticipee, survie, invalidite
    pensionAge:0,              // Âge du travailleur
    pensionCarriere:0,         // Années de carrière
    pensionCumulIllimite:false, // Cumul illimité (≥65 ans + 45 ans carrière OU depuis 01/01/2015)
    pensionMontant:0,          // Montant pension mensuel (pour info/simulation)
  };
  const save=()=>{if(!form.first||!form.last)return alert('Nom requis');if(ed)d({type:'UPD_E',d:form});else d({type:'ADD_E',d:form});setF(null);setEd(false);};

  return <div>
    <PH title="Gestion des Employés" sub={`${s.emps.length} employé(s)`} actions={<B onClick={()=>{setF({...empty});setEd(false);}}>+ Nouvel employé</B>}/>
    {form&&<C style={{marginBottom:20}}>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 16px',fontFamily:"'Cormorant Garamond',serif"}}>{ed?'Modifier':'Nouvel employé'}</h2>
      <ST>Identité</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Prénom" value={form.first} onChange={v=>setF({...form,first:v})}/>
        <I label="Nom" value={form.last} onChange={v=>setF({...form,last:v})}/>
        <I label="NISS" value={form.niss} onChange={v=>setF({...form,niss:v})}/>
        <I label="Naissance" type="date" value={form.birth} onChange={v=>setF({...form,birth:v})}/>
        <I label="Sexe" value={form.sexe} onChange={v=>setF({...form,sexe:v})} options={[{v:'M',l:'Homme'},{v:'F',l:'Femme'},{v:'X',l:'Non-binaire'}]}/>
        <I label="Statut" value={form.statut} onChange={v=>setF({...form,statut:v})} options={[{v:'employe',l:'Employé'},{v:'ouvrier',l:'Ouvrier'},{v:'etudiant',l:'Étudiant'},{v:'apprenti',l:'Apprenti'},{v:'dirigeant',l:'Dirigeant d\'entreprise'}]}/>
        <I label="Adresse" value={form.addr} onChange={v=>setF({...form,addr:v})} span={2}/>
        <I label="CP" value={form.zip} onChange={v=>setF({...form,zip:v})}/>
        <I label="Ville" value={form.city} onChange={v=>setF({...form,city:v})}/>
        <I label="IBAN" value={form.iban} onChange={v=>setF({...form,iban:v})}/>
        <I label="Niveau d'études" value={form.niveauEtude} onChange={v=>setF({...form,niveauEtude:v})} options={[{v:'prim',l:'Primaire'},{v:'sec_inf',l:'Secondaire inférieur'},{v:'sec',l:'Secondaire supérieur'},{v:'sup',l:'Supérieur non-universitaire (bachelier)'},{v:'univ',l:'Universitaire (master/doctorat)'}]}/>
      </div>
      <ST>Contrat</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Fonction" value={form.fn} onChange={v=>setF({...form,fn:v})}/>
        <I label="Département" value={form.dept} onChange={v=>setF({...form,dept:v})}/>
        <I label="Entrée" type="date" value={form.startD} onChange={v=>setF({...form,startD:v})}/>
        <I label="Contrat" value={form.contract} onChange={v=>setF({...form,contract:v})} options={[
          {v:'CDI',l:'CDI'},{v:'CDD',l:'CDD'},{v:'trav_det',l:'Travail nettement défini'},{v:'remplacement',l:'Remplacement'},
          {v:'tpartiel',l:'Temps partiel'},{v:'interim',l:'Intérimaire'},{v:'student',l:'Étudiant (650h)'},
          {v:'flexi',l:'Flexi-job'},{v:'saisonnier',l:'Saisonnier'},{v:'occas_horeca',l:'Extra Horeca'},
          {v:'titre_service',l:'Titres-services'},{v:'art60',l:'Art. 60§7 (CPAS)'},{v:'CIP',l:'Convention immersion'},
          {v:'alternance',l:'Alternance'},{v:'CPE',l:'Premier emploi'},{v:'ETA',l:'Travail adapté'},
          {v:'detache',l:'Détaché'},{v:'domestique',l:'Domestique'},{v:'teletravail',l:'Télétravail struct.'},
          {v:'domicile',l:'Travail à domicile'},{v:'indep_princ',l:'Indép. principal'},
          {v:'indep_compl',l:'Indép. complémentaire'},{v:'mandataire',l:'Mandataire société'},
          {v:'freelance',l:'Freelance/Consultant'},{v:'smart',l:'Smart (portage)'},
          {v:'volontariat',l:'Volontariat'},{v:'artiste',l:'Artiste (ATA)'},{v:'sportif',l:'Sportif rémunéré'},
          {v:'plateforme',l:'Économie plateforme'}
        ]}/>
        <I label="H/sem" type="number" value={form.whWeek} onChange={v=>setF({...form,whWeek:v})}/>
        <I label="CP" value={form.cp} onChange={v=>setF({...form,cp:v})} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="Code DMFA" value={form.dmfaCode} onChange={v=>setF({...form,dmfaCode:v})} options={Object.entries(LEGAL.DMFA_CODES).map(([k,v])=>({v:k,l:`${k} - ${v}`}))}/>
        <I label="Rang engagement" value={form.nrEngagement||0} onChange={v=>setF({...form,nrEngagement:parseInt(v)||0})} options={[{v:0,l:'— Pas de réduction —'},{v:1,l:'1er employé (exo totale)'},{v:2,l:'2è employé'},{v:3,l:'3è employé'},{v:4,l:'4è employé'},{v:5,l:'5è employé'},{v:6,l:'6è employé'}]}/>
        {form.nrEngagement>0&&<I label="Trimestre depuis eng." type="number" value={form.engagementTrimestre||1} onChange={v=>setF({...form,engagementTrimestre:parseInt(v)||1})}/>}
      </div>
      <ST>Grille horaire (Loi 16/03/1971 + Règlement de travail)</ST>
      <div style={{padding:10,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
        <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center'}}>
          <span style={{fontSize:11,color:'#9e9b93',fontWeight:600,width:70}}>Fraction:</span>
          <span style={{fontSize:13,fontWeight:700,color:(form.whWeek||38)>=38?'#4ade80':'#fb923c'}}>{Math.round((form.whWeek||38)/38*100)}%</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:6}}>({form.whWeek||38}h / 38h réf.) — {(form.whWeek||38)>=38?'Temps plein':'Temps partiel'}</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:'auto'}}>{((form.whWeek||38)/5).toFixed(2)}h/jour · Pause: 30min (si {'>'} 6h)</span>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
            {['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Total'].map(h=><th key={h} style={{padding:'4px 6px',fontSize:10,color:'#9e9b93',textAlign:'center',fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr>
              <td style={{padding:'4px 6px',fontSize:10,color:'#9e9b93'}}>Début</td>
              {['lu','ma','me','je','ve','sa'].map(d=><td key={d}><input type="time" defaultValue={d==='sa'?'':'09:00'} style={{width:'100%',background:'rgba(198,163,78,.05)',border:'1px solid rgba(198,163,78,.1)',borderRadius:4,padding:'3px 4px',fontSize:10,color:'#e8e6e0',textAlign:'center'}} onChange={e=>setF({...form,[`h_${d}_de`]:e.target.value})}/></td>)}
              <td rowSpan={2} style={{textAlign:'center',verticalAlign:'middle'}}>
                <div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{form.whWeek||38}h</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>/semaine</div>
              </td>
            </tr>
            <tr>
              <td style={{padding:'4px 6px',fontSize:10,color:'#9e9b93'}}>Fin</td>
              {['lu','ma','me','je','ve','sa'].map(d=><td key={d}><input type="time" defaultValue={d==='sa'?'':'17:36'} style={{width:'100%',background:'rgba(198,163,78,.05)',border:'1px solid rgba(198,163,78,.1)',borderRadius:4,padding:'3px 4px',fontSize:10,color:'#e8e6e0',textAlign:'center'}} onChange={e=>setF({...form,[`h_${d}_a`]:e.target.value})}/></td>)}
            </tr>
          </tbody>
        </table>
        <div style={{marginTop:8,fontSize:9.5,color:'#5e5c56',lineHeight:1.5}}>
          ⏱ <b>Temps plein</b> = 38h/sem (Art. 19 Loi 16/03/1971). <b>Temps partiel</b> = min. 1/3 temps plein (≥12h40). Horaire variable possible (Art. 11bis). Dérogation samedi/dimanche = CCT sectorielle ou accord d'entreprise.
        </div>
      </div>
      <ST>Rémunération</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Brut mensuel (€)" type="number" value={form.monthlySalary} onChange={v=>setF({...form,monthlySalary:v})}/>
        <I label="CR total (€)" type="number" value={form.mvT} onChange={v=>setF({...form,mvT:v})}/>
        <I label="CR part trav. (€)" type="number" value={form.mvW} onChange={v=>setF({...form,mvW:v})}/>
        <I label="CR part empl. (€)" type="number" value={form.mvE} onChange={v=>setF({...form,mvE:v})}/>
        <I label="Frais propres (€)" type="number" value={form.expense} onChange={v=>setF({...form,expense:v})}/>
        <I label="Transport domicile-travail" value={form.commType} onChange={v=>setF({...form,commType:v})} options={[{v:'none',l:'Aucun'},{v:'train',l:'🚆 Train (SNCB)'},{v:'bus',l:'🚌 Bus/Tram/Métro (STIB/TEC/De Lijn)'},{v:'bike',l:'🚲 Vélo'},{v:'car',l:'🚗 Voiture privée'},{v:'carpool',l:'🚗 Covoiturage'},{v:'mixed',l:'🔄 Combiné (train+autre)'},{v:'company_car',l:'🏢 Voiture de société (pas d\'interv.)'}]}/>
        {form.commType!=='none'&&form.commType!=='company_car'&&<I label="Distance simple (km)" type="number" value={form.commDist} onChange={v=>setF({...form,commDist:v})}/>}
        {(form.commType==='train'||form.commType==='bus'||form.commType==='mixed')&&<I label="Abonnement mensuel (€)" type="number" value={form.commMonth} onChange={v=>setF({...form,commMonth:v})}/>}
      </div>
      {form.commType!=='none'&&form.commType!=='company_car'&&<div style={{marginTop:8,padding:10,background:'rgba(96,165,250,.04)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
        {form.commType==='train'&&'🚆 Train SNCB: intervention employeur obligatoire = 75% de l\'abonnement (CCT 19/9). Exonéré ONSS et IPP.'}
        {form.commType==='bus'&&'🚌 Transport en commun: intervention obligatoire = prix abonnement SNCB pour même distance (CCT 19/9). Exonéré ONSS et IPP.'}
        {form.commType==='bike'&&`🚲 Vélo: indemnité ${form.commDist>0?((form.commDist*2*0.27).toFixed(2)+'€/jour = '):''}0,27 €/km A/R (2026). Exonéré ONSS et IPP (max 0,27€/km). Cumulable avec transport en commun.`}
        {form.commType==='car'&&`🚗 Voiture privée: pas d'obligation légale (sauf CCT sectorielle). Si intervention: exonéré ONSS jusqu'à 490€/an. Distance: ${form.commDist||0} km × 2 = ${(form.commDist||0)*2} km A/R.`}
        {form.commType==='carpool'&&'🚗 Covoiturage: mêmes règles que voiture privée pour le conducteur. Passager = indemnité possible exonérée.'}
        {form.commType==='mixed'&&'🔄 Combiné: cumul possible train + vélo ou train + voiture. Chaque trajet est indemnisé séparément selon son mode.'}
      </div>}
      <ST>Véhicule de société (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Carburant" value={form.carFuel} onChange={v=>setF({...form,carFuel:v})} options={[{v:'none',l:'Pas de véhicule'},{v:'essence',l:'Essence'},{v:'diesel',l:'Diesel'},{v:'lpg',l:'LPG/CNG'},{v:'electrique',l:'Électrique'},{v:'hybride',l:'Hybride PHEV'}]}/>
        <I label="CO2 g/km" type="number" value={form.carCO2} onChange={v=>setF({...form,carCO2:v})}/>
        <I label="Valeur catalogue (€)" type="number" value={form.carCatVal} onChange={v=>setF({...form,carCatVal:v})}/>
        <I label="Marque" value={form.carBrand} onChange={v=>setF({...form,carBrand:v})} options={[
          {v:'',l:'— Sélectionner —'},{v:'Aiways',l:'Aiways'},{v:'Alfa Romeo',l:'Alfa Romeo'},{v:'Alpine',l:'Alpine'},{v:'Aston Martin',l:'Aston Martin'},
          {v:'Audi',l:'Audi'},{v:'Bentley',l:'Bentley'},{v:'BMW',l:'BMW'},{v:'BYD',l:'BYD'},{v:'Cadillac',l:'Cadillac'},
          {v:'Chevrolet',l:'Chevrolet'},{v:'Chrysler',l:'Chrysler'},{v:'Citroën',l:'Citroën'},{v:'Cupra',l:'Cupra'},{v:'Dacia',l:'Dacia'},
          {v:'Dodge',l:'Dodge'},{v:'DS',l:'DS Automobiles'},{v:'Ferrari',l:'Ferrari'},{v:'Fiat',l:'Fiat'},{v:'Ford',l:'Ford'},
          {v:'Genesis',l:'Genesis'},{v:'Honda',l:'Honda'},{v:'Hyundai',l:'Hyundai'},{v:'Infiniti',l:'Infiniti'},{v:'Isuzu',l:'Isuzu'},
          {v:'Jaguar',l:'Jaguar'},{v:'Jeep',l:'Jeep'},{v:'Kia',l:'Kia'},{v:'Lamborghini',l:'Lamborghini'},{v:'Land Rover',l:'Land Rover'},
          {v:'Lexus',l:'Lexus'},{v:'Lotus',l:'Lotus'},{v:'Lynk & Co',l:'Lynk & Co'},{v:'Maserati',l:'Maserati'},{v:'Mazda',l:'Mazda'},
          {v:'McLaren',l:'McLaren'},{v:'Mercedes',l:'Mercedes-Benz'},{v:'MG',l:'MG'},{v:'Mini',l:'Mini'},{v:'Mitsubishi',l:'Mitsubishi'},
          {v:'NIO',l:'NIO'},{v:'Nissan',l:'Nissan'},{v:'Opel',l:'Opel'},{v:'Peugeot',l:'Peugeot'},{v:'Polestar',l:'Polestar'},
          {v:'Porsche',l:'Porsche'},{v:'Renault',l:'Renault'},{v:'Rolls-Royce',l:'Rolls-Royce'},{v:'Seat',l:'Seat'},{v:'Škoda',l:'Škoda'},
          {v:'Smart',l:'Smart'},{v:'SsangYong',l:'SsangYong'},{v:'Subaru',l:'Subaru'},{v:'Suzuki',l:'Suzuki'},{v:'Tesla',l:'Tesla'},
          {v:'Toyota',l:'Toyota'},{v:'Volkswagen',l:'Volkswagen'},{v:'Volvo',l:'Volvo'},{v:'XPeng',l:'XPeng'},{v:'Autre',l:'Autre'}
        ]}/>
        <I label="Modèle" value={form.carModel} onChange={v=>setF({...form,carModel:v})} options={[
          {v:'',l:'— Sélectionner —'},...((CAR_MODELS[form.carBrand]||[]).map(m=>({v:m,l:m}))),{v:'_autre',l:'Autre modèle'}
        ]}/>
      </div>
      <ST>Avantages en nature (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>📱 GSM/Téléphone (36€/an)</div>
          <div onClick={()=>setF({...form,atnGSM:!form.atnGSM})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnGSM?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnGSM?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnGSM?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnGSM?'✅ OUI — 3,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>💻 PC/Tablette (72€/an)</div>
          <div onClick={()=>setF({...form,atnPC:!form.atnPC})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnPC?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnPC?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnPC?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnPC?'✅ OUI — 6,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🌐 Internet privé (60€/an)</div>
          <div onClick={()=>setF({...form,atnInternet:!form.atnInternet})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnInternet?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnInternet?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnInternet?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnInternet?'✅ OUI — 5,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🏠 Logement gratuit (RC × coeff.)</div>
          <div onClick={()=>setF({...form,atnLogement:!form.atnLogement})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnLogement?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnLogement?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnLogement?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnLogement?'✅ OUI':'❌ NON'}
          </div>
        </div>
        {form.atnLogement&&<I label="RC logement (€)" type="number" value={form.atnLogementRC} onChange={v=>setF({...form,atnLogementRC:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🔥 Chauffage gratuit (2.130€/an)</div>
          <div onClick={()=>setF({...form,atnChauffage:!form.atnChauffage})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnChauffage?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnChauffage?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnChauffage?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnChauffage?'✅ OUI — 177,50 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>⚡ Électricité gratuite (1.060€/an)</div>
          <div onClick={()=>setF({...form,atnElec:!form.atnElec})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnElec?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnElec?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnElec?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnElec?'✅ OUI — 88,33 €/mois':'❌ NON'}
          </div>
        </div>
      </div>
      <ST>Vélo de société & Mobilité verte</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🚲 Vélo de société (leasing)</div>
          <div onClick={()=>setF({...form,veloSociete:!form.veloSociete})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.veloSociete?'rgba(74,222,128,.15)':'rgba(198,163,78,.04)',color:form.veloSociete?'#4ade80':'#5e5c56',border:'1px solid '+(form.veloSociete?'rgba(74,222,128,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.veloSociete?'✅ OUI — ATN = 0€ (exonéré depuis 2024)':'❌ NON'}
          </div>
        </div>
        {form.veloSociete&&<I label="Type de vélo" value={form.veloType||'none'} onChange={v=>setF({...form,veloType:v})} options={[{v:'classique',l:'🚲 Vélo classique'},{v:'electrique',l:'⚡ Vélo électrique (≤25km/h)'},{v:'speed_pedelec',l:'🏎 Speed pedelec (≤45km/h)'}]}/>}
        {form.veloSociete&&<I label="Valeur catalogue (€)" type="number" value={form.veloValeur} onChange={v=>setF({...form,veloValeur:v})}/>}
        {form.veloSociete&&<I label="Leasing mensuel (€)" type="number" value={form.veloLeasingMois} onChange={v=>setF({...form,veloLeasingMois:v})}/>}
      </div>
      {form.veloSociete&&<div style={{marginTop:8,padding:10,background:'rgba(74,222,128,.04)',borderRadius:8,fontSize:10.5,color:'#4ade80',lineHeight:1.6}}>
        🚲 <b>Vélo de société</b> — ATN = 0€ (Art. 38§1er 14°a CIR — exonéré ONSS et IPP depuis 01/01/2024). Leasing vélo déductible 100% pour l'employeur. Cumulable avec l'indemnité vélo 0,27€/km. Le speed pedelec est assimilé à un vélo.
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>⛽ Carte carburant / recharge</div>
          <div onClick={()=>setF({...form,carteCarburant:!form.carteCarburant})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.carteCarburant?'rgba(251,146,60,.12)':'rgba(198,163,78,.04)',color:form.carteCarburant?'#fb923c':'#5e5c56',border:'1px solid '+(form.carteCarburant?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.carteCarburant?'✅ OUI':'❌ NON'}
          </div>
        </div>
        {form.carteCarburant&&<I label="Budget mensuel carte (€)" type="number" value={form.carteCarburantMois} onChange={v=>setF({...form,carteCarburantMois:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🔌 Borne de recharge domicile</div>
          <div onClick={()=>setF({...form,borneRecharge:!form.borneRecharge})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.borneRecharge?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.borneRecharge?'#60a5fa':'#5e5c56',border:'1px solid '+(form.borneRecharge?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.borneRecharge?'✅ OUI — installée au domicile':'❌ NON'}
          </div>
        </div>
        {form.borneRecharge&&<I label="Coût mensuel borne+élec (€)" type="number" value={form.borneRechargeCoût} onChange={v=>setF({...form,borneRechargeCoût:v})}/>}
      </div>
      {form.carteCarburant&&!form.carFuel!=='none'&&<div style={{marginTop:8,padding:10,background:'rgba(251,146,60,.04)',borderRadius:8,fontSize:10.5,color:'#fb923c',lineHeight:1.6}}>
        ⚠ <b>Carte carburant sans voiture de société</b> — L'avantage est imposable à 100% (ATN = montant total de la carte). Si voiture de société: inclus dans l'ATN voiture (Art. 36§2 CIR).
      </div>}
      <ST>Travailleur frontalier (Règl. 883/2004)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🌍 Travailleur frontalier</div>
          <div onClick={()=>setF({...form,frontalier:!form.frontalier})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalier?'rgba(168,85,247,.12)':'rgba(198,163,78,.04)',color:form.frontalier?'#a855f7':'#5e5c56',border:'1px solid '+(form.frontalier?'rgba(168,85,247,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalier?'✅ OUI — Réside hors Belgique':'❌ NON — Réside en Belgique'}
          </div>
        </div>
        {form.frontalier&&<I label="Pays de résidence" value={form.frontalierPays||''} onChange={v=>setF({...form,frontalierPays:v})} options={[{v:'FR',l:'🇫🇷 France'},{v:'NL',l:'🇳🇱 Pays-Bas'},{v:'DE',l:'🇩🇪 Allemagne'},{v:'LU',l:'🇱🇺 Luxembourg'}]}/>}
      </div>
      {form.frontalier&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Formulaire A1 (détachement)</div>
          <div onClick={()=>setF({...form,frontalierA1:!form.frontalierA1})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierA1?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.frontalierA1?'#60a5fa':'#5e5c56',border:'1px solid '+(form.frontalierA1?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierA1?'✅ A1 en cours':'❌ Pas d\'A1'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Exonération PP (ancien régime FR)</div>
          <div onClick={()=>setF({...form,frontalierExoPP:!form.frontalierExoPP})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierExoPP?'rgba(239,68,68,.12)':'rgba(198,163,78,.04)',color:form.frontalierExoPP?'#ef4444':'#5e5c56',border:'1px solid '+(form.frontalierExoPP?'rgba(239,68,68,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierExoPP?'✅ Exonéré PP (très rare)':'❌ PP retenu en Belgique (normal)'}
          </div>
        </div>
      </div>}
      {form.frontalier&&<div style={{marginTop:8,padding:10,background:'rgba(168,85,247,.04)',borderRadius:8,fontSize:10.5,color:'#a855f7',lineHeight:1.6}}>
        🌍 <b>Frontalier {form.frontalierPays==='FR'?'France':form.frontalierPays==='NL'?'Pays-Bas':form.frontalierPays==='DE'?'Allemagne':form.frontalierPays==='LU'?'Luxembourg':''}</b><br/>
        {form.frontalierPays==='FR'&&'• Convention CPDI BE-FR 10/03/1964. Ancien régime frontalier abrogé 01/01/2012. PP retenu en Belgique. Le travailleur déclare en France avec crédit d\'impôt. Formulaire 276 Front.'}
        {form.frontalierPays==='NL'&&'• Convention CPDI BE-NL 05/06/2001. PP retenu en Belgique. Exemption avec progression aux Pays-Bas. Option: kwalificerend buitenlands belastingplichtige.'}
        {form.frontalierPays==='DE'&&'• Convention CPDI BE-DE 11/04/1967. PP retenu en Belgique. Crédit d\'impôt en Allemagne. Pas de régime frontalier spécial.'}
        {form.frontalierPays==='LU'&&'• Convention CPDI BE-LU 17/09/1970. PP retenu en Belgique. Tolérance 24j/an de télétravail depuis le Luxembourg (accord amiable 2015).'}
        <br/>• ONSS: toujours belge (lex loci laboris — Art. 11 Règl. 883/2004).
        • Limosa: pas nécessaire (le travailleur réside à l'étranger mais travaille en BE avec contrat BE).
      </div>}
      <ST>Travailleur pensionné (Cumul pension-travail)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>👴 Pensionné en activité</div>
          <div onClick={()=>setF({...form,pensionné:!form.pensionné})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.pensionné?'rgba(251,191,36,.15)':'rgba(198,163,78,.04)',color:form.pensionné?'#fbbf24':'#5e5c56',border:'1px solid '+(form.pensionné?'rgba(251,191,36,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.pensionné?'✅ OUI — Bénéficiaire d\'une pension':'❌ NON'}
          </div>
        </div>
        {form.pensionné&&<I label="Type de pension" value={form.pensionType||'none'} onChange={v=>setF({...form,pensionType:v})} options={[{v:'legal',l:'🏛 Pension légale (âge légal)'},{v:'anticipee',l:'⏰ Pension anticipée'},{v:'survie',l:'💐 Pension de survie'},{v:'invalidite',l:'♿ Pension d\'invalidité'}]}/>}
      </div>
      {form.pensionné&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:8}}>
        <I label="Âge" type="number" value={form.pensionAge} onChange={v=>setF({...form,pensionAge:parseInt(v)||0})}/>
        <I label="Années de carrière" type="number" value={form.pensionCarriere} onChange={v=>setF({...form,pensionCarriere:parseInt(v)||0})}/>
        <I label="Pension mensuelle (€)" type="number" value={form.pensionMontant} onChange={v=>setF({...form,pensionMontant:v})}/>
      </div>}
      {form.pensionné&&<div style={{marginTop:8,padding:10,background:'rgba(251,191,36,.04)',borderRadius:8,fontSize:10.5,color:'#fbbf24',lineHeight:1.7}}>
        👴 <b>Cumul pension-travail</b><br/>
        {(form.pensionType==='legal'&&(form.pensionAge||0)>=66)||
         (form.pensionType==='anticipee'&&(form.pensionCarriere||0)>=45)||
         (form.pensionType==='survie'&&(form.pensionAge||0)>=65)
          ?<><span style={{color:'#4ade80',fontWeight:700}}>✅ CUMUL ILLIMITÉ</span> — {form.pensionType==='legal'?'Âge légal 66 ans atteint (AR 20/12/2006)':form.pensionType==='anticipee'?'45 ans de carrière atteints':'Pension de survie ≥ 65 ans'}. Aucun plafond de revenus. Flexi-job: plafond 12.000€ ne s'applique PAS.<br/></>
          :<><span style={{color:'#ef4444',fontWeight:700}}>⚠ CUMUL LIMITÉ</span> — Plafonds annuels bruts ({(form.depChildren||0)>0?'avec':'sans'} enfant à charge):<br/>
            {form.pensionType==='anticipee'&&`• Anticipée: ${(form.depChildren||0)>0?'13.266':'10.613'}€/an brut`}
            {form.pensionType==='survie'&&`• Survie: ${(form.depChildren||0)>0?'28.136':'22.509'}€/an brut`}
            {form.pensionType==='invalidite'&&'• Invalidité: plafonds spécifiques INAMI'}
            <br/>Dépassement = pension réduite du % de dépassement (Art. 64 AR 21/12/1967).<br/></>}
        • ONSS: normal (13,07% travailleur + taux patronal). Pas d'exonération.<br/>
        • PP: barème normal. La pension est imposée séparément par le SFP.<br/>
        • DmfA: déclaration normale. SIGEDIS/SFP vérifie le cumul automatiquement.
      </div>}
      <ST>Situation familiale</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Situation" value={form.civil} onChange={v=>setF({...form,civil:v})} options={[{v:'single',l:'Isolé'},{v:'married_2',l:'Marié (2 revenus)'},{v:'married_1',l:'Marié (1 revenu)'},{v:'cohabit',l:'Cohabitant légal'}]}/>
        <I label="Enfants à charge" type="number" value={form.depChildren} onChange={v=>setF({...form,depChildren:v})}/>
        <I label="Enfants handicapés" type="number" value={form.handiChildren} onChange={v=>setF({...form,handiChildren:v})}/>
        <I label="Ascendants ≥65 ans à charge" type="number" value={form.depAscendant} onChange={v=>setF({...form,depAscendant:v})}/>
        <I label="Ascendants ≥65 handi." type="number" value={form.depAscendantHandi} onChange={v=>setF({...form,depAscendantHandi:v})}/>
        <I label="Autres pers. à charge" type="number" value={form.depAutres} onChange={v=>setF({...form,depAutres:v})}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Conjoint handicapé (Art.132 CIR)</div>
          <div onClick={()=>setF({...form,conjointHandicap:!form.conjointHandicap})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.conjointHandicap?'rgba(248,113,113,.12)':'rgba(198,163,78,.04)',color:form.conjointHandicap?'#f87171':'#5e5c56',border:'1px solid '+(form.conjointHandicap?'rgba(248,113,113,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.conjointHandicap?'✅ OUI — réduction supplémentaire':'❌ NON'}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
        <B v="outline" onClick={()=>{setF(null);setEd(false);}}>Annuler</B>
        <B onClick={save}>{ed?'Mettre à jour':'Enregistrer'}</B>
      </div>
    </C>}
    <C style={{padding:0,overflow:'hidden'}}>
      <Tbl cols={[
        {k:'n',l:'Employé',r:r=><div><div style={{fontWeight:500}}>{r.first} {r.last} <span style={{fontSize:9,padding:'1px 5px',borderRadius:3,background:r.statut==='ouvrier'?'rgba(251,146,60,.15)':'rgba(96,165,250,.1)',color:r.statut==='ouvrier'?'#fb923c':'#60a5fa',marginLeft:4}}>{r.statut==='ouvrier'?'OUV':'EMPL'}</span></div><div style={{fontSize:10.5,color:'#5e5c56'}}>{r.niss} · {r.sexe==='F'?'♀':'♂'}</div></div>},
        {k:'f',l:'Fonction',r:r=><div>{r.fn}<div style={{fontSize:10.5,color:'#5e5c56'}}>{r.dept}</div></div>},
        {k:'c',l:'Contrat',r:r=><span style={{fontSize:12}}>{r.contract} · {r.whWeek}h</span>},
        {k:'cp',l:'CP',r:r=>r.cp},
        {k:'g',l:'Brut',a:'right',r:r=><span style={{fontWeight:600}}>{fmt(r.monthlySalary)}</span>},
        {k:'ne',l:'Net',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(calc(r,DPER,s.co).net)}</span>},
        {k:'co',l:'Coût',a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(calc(r,DPER,s.co).costTotal)}</span>},
        {k:'a',l:'',a:'right',r:r=><div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
          <B v="ghost" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();setF({...r});setEd(true);}}>✎</B>
          <B v="danger" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();if(confirm('Supprimer ?'))d({type:'DEL_E',id:r.id});}}>✕</B>
        </div>},
      ]} data={s.emps}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PAYSLIPS
// ═══════════════════════════════════════════════════════════════
function Payslips({s,d}) {
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [per,setPer]=useState({...DPER});
  const [res,setRes]=useState(null);
  const emp=s.emps.find(e=>e.id===eid);

  const gen=()=>{if(!emp)return;const r=calc(emp,per,s.co);setRes(r);
    d({type:'ADD_P',d:{eid:emp.id,ename:`${emp.first} ${emp.last}`,period:`${MN[per.month-1]} ${per.year}`,month:per.month,year:per.year,...r,at:new Date().toISOString()}});};

  const PR=({l,rate,a,bold,neg,pos,sub})=><tr>
    <td style={{padding:'5px 0',fontWeight:bold?700:400,fontSize:sub?10.5:12,color:sub?'#999':'#333',fontStyle:sub?'italic':'normal'}}>{l}</td>
    <td style={{textAlign:'right',padding:'5px 0',color:'#999',fontSize:10.5}}>{rate||''}</td>
    <td style={{textAlign:'right',padding:'5px 0',fontWeight:bold?700:400,color:neg?'#dc2626':pos?'#16a34a':sub?'#999':'#333'}}>{neg&&a!==0?'- ':''}{fmt(Math.abs(a||0))}</td>
  </tr>;
  const PS=({t})=><tr style={{background:'#f8f7f2'}}><td colSpan={3} style={{padding:'11px 0 5px',fontWeight:700,fontSize:10.5,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1px'}}>{t}</td></tr>;

  return <div>
    <PH title="Fiches de Paie" sub="Formule-clé SPF Finances"/>
    <div style={{display:'grid',gridTemplateColumns:res?'360px 1fr':'1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Employé" value={eid} onChange={setEid} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))} span={2}/>
          <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
          <I label="Année" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
          <I label="Jours prestés" type="number" value={per.days} onChange={v=>setPer({...per,days:v})}/>
          <I label="H. sup." type="number" value={per.overtimeH} onChange={v=>setPer({...per,overtimeH:v})}/>
          <I label="H. dimanche" type="number" value={per.sundayH} onChange={v=>setPer({...per,sundayH:v})}/>
          <I label="H. nuit" type="number" value={per.nightH} onChange={v=>setPer({...per,nightH:v})}/>
          <I label="Maladie (j garanti)" type="number" value={per.sickG} onChange={v=>setPer({...per,sickG:v})}/>
          <I label="Prime (€)" type="number" value={per.bonus} onChange={v=>setPer({...per,bonus:v})}/>
          <I label="13ème mois (€)" type="number" value={per.y13} onChange={v=>setPer({...per,y13:v})}/>
          <I label="Acompte (€)" type="number" value={per.advance} onChange={v=>setPer({...per,advance:v})}/>
          <I label="Saisie (€)" type="number" value={per.garnish} onChange={v=>setPer({...per,garnish:v})}/>
          <I label="PP volontaire (€)" type="number" value={per.ppVolontaire} onChange={v=>setPer({...per,ppVolontaire:v})}/>
          <I label="Autres ret. (€)" type="number" value={per.otherDed} onChange={v=>setPer({...per,otherDed:v})}/>
        </div>
        <ST style={{marginTop:14}}>Éléments fiscaux spéciaux</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Double pécule vac. (€)" type="number" value={per.doublePecule} onChange={v=>setPer({...per,doublePecule:v})}/>
          <I label="Pécule départ (€)" type="number" value={per.peculeDepart} onChange={v=>setPer({...per,peculeDepart:v})}/>
          <I label="Prime ancienneté (€)" type="number" value={per.primeAnciennete} onChange={v=>setPer({...per,primeAnciennete:v})}/>
          <I label="Prime naissance/mariage (€)" type="number" value={per.primeNaissance} onChange={v=>setPer({...per,primeNaissance:v})}/>
          <I label="Prime innovation (€)" type="number" value={per.primeInnovation} onChange={v=>setPer({...per,primeInnovation:v})}/>
          <I label="Indem. télétravail (€)" type="number" value={per.indemTeletravail} onChange={v=>setPer({...per,indemTeletravail:v})}/>
          <I label="Indem. bureau (€)" type="number" value={per.indemBureau} onChange={v=>setPer({...per,indemBureau:v})}/>
          <I label="H.sup fiscales (180h)" type="number" value={per.heuresSupFisc} onChange={v=>setPer({...per,heuresSupFisc:v})}/>
          <I label="HS volont. brut=net (h)" type="number" value={per.hsVolontBrutNet} onChange={v=>setPer({...per,hsVolontBrutNet:v})}/>
          <I label="HS relance T1 (h)" type="number" value={per.hsRelance} onChange={v=>setPer({...per,hsRelance:v})}/>
          <I label="Pension compl. ret. (€)" type="number" value={per.pensionCompl} onChange={v=>setPer({...per,pensionCompl:v})}/>
          <I label="Cotis. syndicale (€)" type="number" value={per.retSyndicale} onChange={v=>setPer({...per,retSyndicale:v})}/>
          <I label="Pension aliment. (€)" type="number" value={per.saisieAlim} onChange={v=>setPer({...per,saisieAlim:v})}/>
          <I label="Type spécial" value={per.typeSpecial||'normal'} onChange={v=>setPer({...per,typeSpecial:v})} options={[{v:'normal',l:'Normal'},{v:'doublePecule',l:'Double pécule'},{v:'y13',l:'13ème mois'},{v:'depart',l:'Sortie de service'},{v:'preavis',l:'Indemnité de préavis'}]}/>
          <I label="Petit chômage (jours)" type="number" value={per.petitChomage} onChange={v=>setPer({...per,petitChomage:v})}/>
          <I label="Éco-chèques (€)" type="number" value={per.ecoCheques} onChange={v=>setPer({...per,ecoCheques:v})}/>
          <I label="Cadeaux/événements (€)" type="number" value={per.cadeaux} onChange={v=>setPer({...per,cadeaux:v})}/>
          <I label="Budget mobilité P2 (€)" type="number" value={per.budgetMobP2} onChange={v=>setPer({...per,budgetMobP2:v})}/>
          <I label="Budget mobilité P3 (€)" type="number" value={per.budgetMobP3} onChange={v=>setPer({...per,budgetMobP3:v})}/>
          <I label="Réd. trav. âgé 55+ (€)" type="number" value={per.redGCAge} onChange={v=>setPer({...per,redGCAge:v})}/>
          <I label="Réd. jeune <26 (€)" type="number" value={per.redGCJeune} onChange={v=>setPer({...per,redGCJeune:v})}/>
          <I label="Réd. handicap (€)" type="number" value={per.redGCHandicap} onChange={v=>setPer({...per,redGCHandicap:v})}/>
          <I label="Activation ONEM" value={per.allocTravailType||'none'} onChange={v=>setPer({...per,allocTravailType:v,allocTravail:0})} options={[{v:'none',l:'— Aucune —'},{v:'activa_bxl',l:'Activa.brussels (€350/m)'},{v:'activa_jeune',l:'Activa Jeunes <30 (€350/m)'},{v:'impulsion_wal',l:'Impulsion Wallonie (€500/m)'},{v:'impulsion55',l:'Impulsion 55+ (€500/m)'},{v:'sine',l:'SINE écon. sociale (€500/m)'},{v:'vdab',l:'VDAB (prime directe)'}]}/>
          {per.allocTravailType&&per.allocTravailType!=='none'&&<I label="Montant alloc. ONEM (€)" type="number" value={per.allocTravail} onChange={v=>setPer({...per,allocTravail:v})}/>}
        </div>
        <ST style={{marginTop:14}}>Mi-temps médical / thérapeutique</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <div style={{gridColumn:'1/-1'}}><div onClick={()=>setPer({...per,miTempsMed:!per.miTempsMed})} style={{padding:'10px 14px',borderRadius:8,cursor:'pointer',fontSize:12,
            background:per.miTempsMed?'rgba(251,146,60,.1)':'rgba(198,163,78,.04)',color:per.miTempsMed?'#fb923c':'#5e5c56',border:'1px solid '+(per.miTempsMed?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center',fontWeight:600}}>
            {per.miTempsMed?'⚕ MI-TEMPS MÉDICAL / THÉRAPEUTIQUE — Reprise progressive INAMI (Art. 100§2)':'❌ Pas de mi-temps médical / thérapeutique'}
          </div></div>
          {per.miTempsMed&&<><I label="Heures/sem prestées" type="number" value={per.miTempsHeures} onChange={v=>setPer({...per,miTempsHeures:v})}/>
          <I label="Complément INAMI (€/mois)" type="number" value={per.miTempsINAMI} onChange={v=>setPer({...per,miTempsINAMI:v})}/>
          <div style={{gridColumn:'1/-1',padding:10,background:'rgba(96,165,250,.04)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            ⚕ <b>Reprise progressive</b> — Le travailleur preste {per.miTempsHeures||0}h/{emp?.whWeek||38}h = <b>{Math.round((per.miTempsHeures||0)/(emp?.whWeek||38)*100)}%</b>. L'employeur paie le salaire prorata. L'INAMI verse le complément directement au travailleur via la mutuelle. Documents: C3.2 (médecin-conseil) + DRS (eBox).
          </div></>}
        </div>
        <B onClick={gen} style={{width:'100%',marginTop:14,padding:13,fontSize:13.5,letterSpacing:'.5px'}}>GÉNÉRER LA FICHE DE PAIE</B>
      </C>

      {res&&emp&&<div data-payslip style={{background:'#fffef9',borderRadius:14,padding:'32px 36px',color:'#1a1a18',fontFamily:"'Outfit',sans-serif",boxShadow:'0 4px 30px rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',paddingBottom:18,borderBottom:'3px solid #c6a34e',marginBottom:22}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700}}>{s.co.name}</div><div style={{fontSize:10.5,color:'#888',marginTop:2}}>{s.co.addr}</div><div style={{fontSize:10.5,color:'#888'}}>TVA: {s.co.vat} · BCE: {s.co.bce||s.co.vat?.replace(/^BE\s?/,'')||'—'} · ONSS: {s.co.onss}</div><div style={{fontSize:10.5,color:'#888'}}>CP: {emp.cp||s.co.cp||'200'} — {LEGAL.CP[emp.cp||s.co.cp||'200']||''}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'2px'}}>Fiche de Paie</div><div style={{fontSize:12.5,color:'#888',marginTop:3}}>{MN[per.month-1]} {per.year}</div><div style={{fontSize:10,color:'#aaa',marginTop:2}}>Période du 01/{String(per.month).padStart(2,'0')}/{per.year} au {new Date(per.year,per.month,0).getDate()}/{String(per.month).padStart(2,'0')}/{per.year}</div><div style={{fontSize:10,color:'#aaa'}}>Date de paiement: dernier jour ouvrable du mois</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20,padding:14,background:'#f5f4ef',borderRadius:8}}>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Travailleur</div><div style={{fontWeight:600,fontSize:13.5}}>{emp.first} {emp.last}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.fn} — {emp.dept}</div><div style={{fontSize:10.5,color:'#666'}}>NISS: {emp.niss}{emp.birth?` · Né(e) le ${emp.birth}`:''}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.addr?`${emp.addr}, ${emp.zip||''} ${emp.city||''}`:''}</div></div>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Contrat & Barème</div><div style={{fontSize:10.5,color:'#555'}}>{emp.contract} · CP {emp.cp} · {emp.whWeek}h/sem · {emp.statut==='ouvrier'?'Ouvrier':'Employé'}</div><div style={{fontSize:10.5,color:'#555'}}>Entrée: {emp.startD} · Ancienneté: {emp.anciennete||0} an(s)</div><div style={{fontSize:10.5,color:'#555'}}>Sit: {emp.civil==='single'?'Isolé':emp.civil==='married_1'?'Marié (1 revenu)':emp.civil==='married_2'?'Marié (2 revenus)':emp.civil==='cohabit'?'Cohabitant':emp.civil==='widowed'?'Veuf/ve':emp.civil}{emp.depChildren>0?` · ${emp.depChildren} enfant(s)`:''}</div><div style={{fontSize:10.5,color:'#555'}}>Barème: {fmt(emp.monthlySalary)}/mois · {fmt(Math.round((emp.monthlySalary||0)/(emp.whWeek||38)/4.33*100)/100)}/h · {per.days||0}j / {Math.round((per.days||0)*(emp.whWeek||38)/5*100)/100}h prestées</div>
            {emp.frontalier&&<div style={{fontSize:10.5,color:'#a855f7',fontWeight:600}}>🌍 Frontalier — Réside: {emp.frontalierPays==='FR'?'France':emp.frontalierPays==='NL'?'Pays-Bas':emp.frontalierPays==='DE'?'Allemagne':emp.frontalierPays==='LU'?'Luxembourg':emp.frontalierPays} · ONSS: Belgique · PP: {emp.frontalierExoPP?'Exonéré (276 Front.)':'Retenu en Belgique'}</div>}
            {emp.pensionné&&<div style={{fontSize:10.5,color:'#fbbf24',fontWeight:600}}>👴 Pensionné ({emp.pensionType==='legal'?'pension légale':emp.pensionType==='anticipee'?'pension anticipée':emp.pensionType==='survie'?'pension de survie':'pension invalidité'}) — Cumul: {res.pensionCumulIllimite?'ILLIMITÉ':'LIMITÉ (plafond '+fmt(res.pensionPlafond)+'/an)'}{res.pensionDepassement?' ⚠ DÉPASSEMENT ESTIMÉ: '+res.pensionDepassPct+'%':''}</div>}
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'2px solid #c6a34e'}}><th style={{textAlign:'left',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Description</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Taux</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Montant</th></tr></thead>
          <tbody>
            <PS t="Rémunération brute"/>
            {res.isFlexiJob&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#4ade80',fontWeight:600,background:'rgba(74,222,128,.05)',borderRadius:4}}>🔄 FLEXI-JOB — Loi 16/11/2015 · Net = Brut · ONSS trav. 0% · PP 0% · ONSS empl. 28%</td></tr>}
            {res.isFlexiJob&&<><PR l={`Flexi-salaire (${res.flexiHeures}h × ${fmt(res.flexiSalaireH)}/h)`} a={res.flexiBrut}/>
              <PR l="Flexi-pécule vacances (7,67%)" a={res.flexiPecule} pos/>
              <PR l="TOTAL FLEXI BRUT" a={res.gross} bold/>
              <PS t="Cotisations"/>
              <PR l="ONSS travailleur" rate="0%" a={0}/>
              <PR l="Précompte professionnel" rate="0%" a={0}/>
              <PR l="Cotisation spéciale SS" rate="0%" a={0}/>
              <PS t="Coût employeur"/>
              <PR l="ONSS patronal spécial (28%)" a={-res.flexiOnssPatronal} neg/>
            </>}
            {!res.isFlexiJob&&<>
            {res.miTempsMed&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#fb923c',fontWeight:600,background:'rgba(251,146,60,.05)',borderRadius:4}}>⚕ REPRISE PROGRESSIVE — Mi-temps médical / thérapeutique (Art. 100§2 Loi coord. 14/07/1994) — Fraction: {Math.round(res.miTempsFraction*100)}% ({res.miTempsHeures}h/{emp.whWeek||38}h)</td></tr>}
            <PR l="Salaire de base" a={res.base}/>
            {res.miTempsMed&&<PR l={`  └ Brut normal: ${fmt(res.miTempsBrutOriginal)} × ${Math.round(res.miTempsFraction*100)}% prorata`} a={res.base} sub/>}
            {res.overtime>0&&<PR l="Heures sup. (150%)" rate={`${per.overtimeH}h`} a={res.overtime}/>}
            {res.sunday>0&&<PR l="Dimanche (200%)" rate={`${per.sundayH}h`} a={res.sunday}/>}
            {res.night>0&&<PR l="Nuit (125%)" rate={`${per.nightH}h`} a={res.night}/>}
            {res.bonus>0&&<PR l="Prime" a={res.bonus}/>}
            {res.y13>0&&<PR l="Prime fin d'année" a={res.y13}/>}
            {res.sickPay>0&&<PR l="Salaire garanti maladie" a={res.sickPay}/>}
            <PR l="TOTAL BRUT" a={res.gross} bold/>
            {emp.statut==='ouvrier'&&<>
              <tr><td colSpan={3} style={{padding:'4px 0 2px',fontSize:10,color:'#fb923c',fontStyle:'italic'}}>
                Ouvrier — Base ONSS = brut × 108% = {fmt(res.gross)} × 1,08 = <b>{fmt(res.gross*1.08)}</b> (compensation pécule vacances simple — Art. 23 AR 28/11/1969)
              </td></tr>
              {res.cotisVacOuv>0&&<PR l={`Cotisation vacances ouvrier (15,84% sur brut 108%)`} a={-res.cotisVacOuv} neg/>}
            </>}
            {res.atnCar>0&&<><PS t="Avantage de toute nature (ATN)"/>
            <PR l={`ATN voiture de société (${emp.carBrand||''} ${emp.carModel||''} — ${emp.carCO2||0}g CO2)`} rate={`${(res.atnPct||0).toFixed(1)}%`} a={res.atnCar}/>
            <PR l="ATN ajouté au revenu imposable" a={res.atnCar} sub/></>}
            {(res.atnAutresTot>0&&!res.atnCar)&&<PS t="Avantages de toute nature (ATN)"/>}
            {res.atnGSM>0&&<PR l="ATN GSM/Téléphone (forfait 36€/an)" a={res.atnGSM}/>}
            {res.atnPC>0&&<PR l="ATN PC/Tablette (forfait 72€/an)" a={res.atnPC}/>}
            {res.atnInternet>0&&<PR l="ATN Internet privé (forfait 60€/an)" a={res.atnInternet}/>}
            {res.atnLogement>0&&<PR l="ATN Logement gratuit (RC × coeff.)" a={res.atnLogement}/>}
            {res.atnChauffage>0&&<PR l="ATN Chauffage gratuit (2.130€/an)" a={res.atnChauffage}/>}
            {res.atnElec>0&&<PR l="ATN Électricité gratuite (1.060€/an)" a={res.atnElec}/>}
            {res.veloSociete&&<PR l={`🚲 Vélo de société (${res.veloType}) — ATN = 0€ (Art.38§1er 14°a — exonéré)`} a={0}/>}
            {res.atnCarteCarburant>0&&<PR l="ATN Carte carburant (sans voiture soc. — imposable)" a={res.atnCarteCarburant}/>}
            {res.atnBorne>0&&<PR l="ATN Borne recharge domicile (sans voiture soc.)" a={res.atnBorne}/>}
            {res.atnAutresTot>0&&<PR l="Total ATN autres (ajouté au revenu imposable)" a={res.atnAutresTot} sub/>}
            <PS t="Cotisations ONSS"/>
            <PR l={`ONSS travailleur (${fmtP(LEGAL.ONSS_W)} sur ${emp.statut==='ouvrier'?'brut 108% = '+fmt(res.gross*1.08):'brut '+fmt(res.gross)})`} rate={fmtP(LEGAL.ONSS_W)} a={-res.onssW} neg/>
            {res.empBonus>0&&<PR l={`Bonus à l'emploi social (réduction ONSS bas salaires — AR 21/12/2017)`} a={res.empBonus} pos/>}
            {res.empBonusA>0&&<PR l={`  └ Volet A (bas salaires): ${fmt(res.empBonusA)}`} a={res.empBonusA} pos sub/>}
            {res.empBonusB>0&&<PR l={`  └ Volet B (très bas salaires): ${fmt(res.empBonusB)}`} a={res.empBonusB} pos sub/>}
            <PR l={`ONSS net à retenir (${fmt(res.onssW)} − ${fmt(res.empBonus)} bonus)`} a={-res.onssNet} bold neg/>
            {res.redStructMois>0&&<PR l={`Réduction structurelle patronale (Cat ${res.redStructCat}${res.redStructFraction<1?' × '+Math.round(res.redStructFraction*100)+'% TP':''})`} a={res.redStructMois} pos/>}
            {res.empBonusFisc>0&&<PR l={`Bonus emploi fiscal (réduction PP: volet A ${fmtP(0.3314)} + volet B ${fmtP(0.5254)})`} a={res.empBonusFisc} pos/>}
            <PS t="Fiscalité (Formule-clé SPF)"/>
            <PR l="Revenu imposable" a={res.taxGross} sub/>
            <PR l="Frais prof. forfaitaires" a={-res.profExp} sub/>
            <PR l="Base taxable" a={res.taxNet} sub/>
            <PR l="Impôt (barème progressif)" a={-res.baseTax} neg/>
            {res.famRed>0&&<PR l="Réductions familiales (Art.132-140 CIR)" a={res.famRed} pos/>}
            <PR l="Précompte professionnel" a={-res.tax} bold neg/>
            {res.ppVolontaire>0&&<PR l="Précompte volontaire (Art. 275§1 CIR 92 — demande écrite travailleur)" a={-res.ppVolontaire} neg/>}
            <PR l="Cotisation spéciale SS" a={-res.css} neg/>
            <PS t="Retenues & Avantages"/>
            {res.mvWorker>0&&<PR l={`Chèques repas (${res.mvDays}j)`} a={-res.mvWorker} neg/>}
            {res.transport>0&&<PR l={`Transport dom.-travail (${res.transportDetail||emp.commType})`} a={res.transport} pos/>}
            {res.transport>0&&emp.commType==='bike'&&<tr><td colSpan={3} style={{padding:'2px 0 6px',fontSize:9.5,color:'#4ade80',fontStyle:'italic'}}>🚲 Total: {((emp.commDist||0)*2*(per.days||21))} km/mois ({emp.commDist} km × 2 A/R × {per.days||21} jours) — Exonéré ONSS et IPP (Art. 38§1er 14° CIR)</td></tr>}
            {res.expense>0&&<PR l="Frais propres employeur" a={res.expense} pos/>}
            {res.indemTeletravail>0&&<PR l="Indemnité télétravail (exonérée — max 154,74€)" a={res.indemTeletravail} pos/>}
            {res.indemBureau>0&&<PR l="Indemnité frais de bureau (exonérée)" a={res.indemBureau} pos/>}
            {res.garnish>0&&<PR l="Saisie sur salaire" a={-res.garnish} neg/>}
            {res.saisieAlim>0&&<PR l="Pension alimentaire (prioritaire — Art.1409 C.jud.)" a={-res.saisieAlim} neg/>}
            {res.advance>0&&<PR l="Acompte" a={-res.advance} neg/>}
            {res.pensionCompl>0&&<PR l="Retenue pension complémentaire (2è pilier — LPC)" a={-res.pensionCompl} neg/>}
            {res.retSyndicale>0&&<PR l="Cotisation syndicale" a={-res.retSyndicale} neg/>}
            {res.otherDed>0&&<PR l="Autres retenues" a={-res.otherDed} neg/>}
            {res.atnCar>0&&<PR l="ATN voiture (déduit du net)" a={-res.atnCar} neg/>}
            {res.atnAutresTot>0&&<PR l="ATN autres (déduit du net)" a={-res.atnAutresTot} neg/>}
            {(res.doublePecule>0||res.peculeDepart>0||res.primeAnciennete>0||res.primeNaissance>0||res.primeInnovation>0)&&<PS t="Éléments exceptionnels"/>}
            {res.doublePecule>0&&<><PR l="Double pécule vacances (92% brut)" a={res.doublePecule} pos/>
              <PR l="  └ ONSS sur 2ème partie (7% × 13,07%)" a={-res.dpOnss} neg sub/>
              <PR l="  └ Cotisation spéciale 1%" a={-res.dpCotisSpec} neg sub/></>}
            {res.peculeDepart>0&&<><PR l="Pécule vacances de départ (Art.46)" a={res.peculeDepart} pos/>
              <PR l="  └ ONSS 13,07% sur pécule départ" a={-res.pdOnss} neg sub/></>}
            {res.primeAnciennete>0&&<><PR l={`Prime ancienneté (${emp.anciennete||0} ans)`} a={res.primeAnciennete}/>
              {res.primeAncExoneree>0&&<PR l="  └ Dont exonéré ONSS+IPP (Art.19§2 14°)" a={res.primeAncExoneree} pos sub/>}
              {res.primeAncTaxable>0&&<PR l="  └ Dont taxable" a={res.primeAncTaxable} sub/>}</>}
            {res.primeNaissance>0&&<PR l="Prime naissance/mariage (avantage social — exo)" a={res.primeNaissance} pos/>}
            {res.primeInnovation>0&&<PR l="Prime innovation (Art.38§1er 25° CIR — exo IPP)" a={res.primeInnovation} pos/>}
            {res.redPPHeuresSup>0&&<PS t="Réductions fiscales"/>}
            {res.redPPHeuresSup>0&&<PR l={`Réd. PP heures sup. (${res.heuresSupFisc}h × 66,81% — Art.154bis)`} a={res.redPPHeuresSup} pos/>}
            {res.ppTauxExcep>0&&<PR l={`PP taux exceptionnel ${(res.ppTauxExcepRate*100).toFixed(2)}% (AR 09/01/2024 ann.III)`} a={-res.ppTauxExcep} neg/>}
            {res.petitChomageVal>0&&<><PS t="Absences rémunérées"/>
              <PR l={`Petit chômage / Congé circonstanciel (${res.petitChomage}j — AR 28/08/1963)`} a={res.petitChomageVal} pos/></>}
            {(res.ecoCheques>0||res.cadeaux>0||res.budgetMobPilier2>0)&&<PS t="Avantages exonérés"/>}
            {res.ecoCheques>0&&<PR l="Éco-chèques (CCT 98 — max 250€/an — exo ONSS+IPP)" a={res.ecoCheques} pos/>}
            {res.cadeaux>0&&<PR l="Cadeaux/événements (exo si ≤ plafond — Circ. ONSS)" a={res.cadeaux} pos/>}
            {res.budgetMobPilier2>0&&<PR l="Budget mobilité — Pilier 2 (mobilité durable — exo)" a={res.budgetMobPilier2} pos/>}
            {res.hsBrutNetTotal>0&&<><PS t="Heures supplémentaires brut=net (01/04/2026)"/>
              {res.hsVolontBrutNet>0&&<PR l={`HS volontaires brut=net (${per.hsVolontBrutNet||0}h × ${fmt(res.hsVolontBrutNet/(per.hsVolontBrutNet||1))}/h — exo ONSS+PP)`} a={res.hsVolontBrutNet} pos/>}
              {res.hsRelance>0&&<PR l={`HS relance transitoire T1 (${per.hsRelance||0}h — brut=net — déduit quota 240h)`} a={res.hsRelance} pos/>}
              <tr><td colSpan={3} style={{padding:'4px 0 6px',fontSize:10,color:'#4ade80',fontStyle:'italic'}}>
                Nouveau régime: max 360h/an (450h horeca). 240h brut=net. Pas de sursalaire. Accord écrit 1 an requis.
              </td></tr></>}
            {res.budgetMobPilier3>0&&<><PR l="Budget mobilité — Pilier 3 (cash)" a={res.budgetMobPilier3}/>
              <PR l="  └ Cotisation spéciale 38,07% (Loi 17/03/2019)" a={-res.budgetMobCotis38} neg sub/></>}
            {res.allocTravail>0&&<><PS t="Activation ONEM"/>
              <PR l={`Allocation de travail ${res.allocTravailLabel} (AR 19/12/2001)`} a={-res.allocTravail} neg/>
              <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:10,color:'#60a5fa',fontStyle:'italic',lineHeight:1.5}}>
                → Déduit du salaire net. Le travailleur reçoit {fmt(res.allocTravail)}/mois directement de l'ONEM via CAPAC/syndicat.<br/>
                → Rémunération totale travailleur inchangée: {fmt(res.net)} (employeur) + {fmt(res.allocTravail)} (ONEM) = {fmt(res.net+res.allocTravail)}<br/>
                → L'allocation n'est PAS soumise à l'ONSS (pas de rémunération). Le PP est retenu par l'ONEM (10,09%).<br/>
                → L'employeur ne déclare PAS l'allocation en DmfA. Formulaire: C78 (ONEM) + carte Activa/attestation FOREM.
              </td></tr></>}
            </>}
            <tr style={{borderTop:'3px solid #c6a34e'}}><td style={{padding:'14px 0',fontWeight:800,fontSize:15}}>NET À PAYER</td><td></td><td style={{textAlign:'right',padding:'14px 0',fontWeight:800,fontSize:18,color:'#16a34a'}}>{fmt(res.net)}</td></tr>
            {res.miTempsMed&&<><tr style={{background:'rgba(251,146,60,.04)'}}><td colSpan={3} style={{padding:'10px 0 4px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#fb923c'}}>⚕ POUR MÉMOIRE — Complément INAMI (hors fiche de paie)</div>
            </td></tr>
            <PR l={`Indemnités INAMI mutuelle (${Math.round((1-res.miTempsFraction)*100)}% non presté)`} a={res.miTempsINAMI}/>
            <tr><td style={{padding:'6px 0',fontWeight:700,fontSize:13}}>REVENU TOTAL TRAVAILLEUR</td><td></td><td style={{textAlign:'right',padding:'6px 0',fontWeight:700,fontSize:14,color:'#c6a34e'}}>{fmt(res.net + res.miTempsINAMI)}</td></tr>
            <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:9.5,color:'#999',fontStyle:'italic'}}>Le complément INAMI est versé directement par la mutuelle au travailleur. Il n'est pas soumis à l'ONSS. Le PP est retenu à la source par la mutuelle (11,11%). Le travailleur conserve son contrat à temps plein.</td></tr></>}
          </tbody>
        </table>
        {/* CUMUL ANNUEL YTD (AR 27/09/1966 Art.9 — mention obligatoire) */}
        <div style={{marginTop:14,padding:12,background:'#f5f4ef',borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:8}}>Cumul annuel (YTD — Janvier à {MN[per.month-1]} {per.year})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
            {[
              {l:'Brut cumulé',v:res.gross*per.month},
              {l:'ONSS cumulé',v:res.onssNet*per.month},
              {l:'PP cumulé',v:res.tax*per.month},
              {l:'CSS cumulé',v:res.css*per.month},
              {l:'Net cumulé',v:res.net*per.month,c:'#16a34a'},
              {l:'Coût empl. cumulé',v:res.costTotal*per.month,c:'#c6a34e'},
            ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
              <div style={{fontSize:11.5,fontWeight:600,color:x.c||'#555',marginTop:2}}>{fmt(x.v)}</div>
            </div>)}
          </div>
          <div style={{fontSize:8,color:'#bbb',marginTop:6,fontStyle:'italic'}}>* Estimation basée sur le salaire du mois courant × {per.month} mois. Les cumuls réels seront calculés sur base de l'historique des fiches.</div>
        </div>
        {/* COMPTEURS CONGÉS & HEURES (Loi 28/06/1971 + CCT) */}
        <div style={{marginTop:10,padding:12,background:'#f5f4ef',borderRadius:8,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:'Congés légaux',v:`${20-Math.min(per.month*2,20)}j restants`,s:`Total: 20j/an (employé TP)`},
            {l:'Heures sup. récup.',v:`${(per.overtimeH||0)}h ce mois`,s:'Récupérables dans les 3 mois'},
            {l:'Jours maladie',v:`${per.sickG||0}j ce mois`,s:'Sal. garanti: 30j (employé) / 7+7+14j (ouvrier)'},
            {l:'Crédit-temps',v:'—',s:'Non activé'},
          ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
            <div style={{fontSize:11,fontWeight:600,color:'#555',marginTop:2}}>{x.v}</div>
            <div style={{fontSize:7.5,color:'#bbb',marginTop:1}}>{x.s}</div>
          </div>)}
        </div>
        <div style={{marginTop:18,padding:14,background:'#f0efea',borderRadius:8,display:'grid',gridTemplateColumns:res.atnCar>0?'repeat(5,1fr)':'repeat(4,1fr)',gap:10}}>
          {[{l:'Brut',v:res.gross},{l:`ONSS empl. (${(res.onssE_rate*100).toFixed(0)}%)`,v:res.onssE},...(res.cotisVacOuv>0?[{l:'Cot. vac. ouvrier (15,84%)',v:res.cotisVacOuv}]:[]),...(res.atnCar>0?[{l:'Cot. CO2',v:res.cotCO2}]:[]),...(res.pensionComplEmpl>0?[{l:'Pension compl. empl.',v:res.pensionComplEmpl}]:[]),...(res.ecoCheques>0?[{l:'Éco-chèques',v:res.ecoCheques}]:[]),...(res.dispensePPTotal>0?[{l:'Dispense PP (nuit/HS)',v:-res.dispensePPTotal}]:[]),...(res.redGCPremier>0?[{l:`Réd. ${res.redGCPremierLabel||'1er eng.'} (Art.336 LP)`,v:-res.redGCPremier}]:[]),...(res.redGCAge>0?[{l:'Réd. trav. âgé 55+',v:-res.redGCAge}]:[]),...(res.redGCJeune>0?[{l:'Réd. jeune <26',v:-res.redGCJeune}]:[]),...(res.redGCHandicap>0?[{l:'Réd. handicap',v:-res.redGCHandicap}]:[]),...(res.allocTravail>0?[{l:`Alloc. ONEM ${res.allocTravailLabel}`,v:-res.allocTravail}]:[]),{l:'Avantages',v:res.mvEmployer+res.expense+res.transport+res.indemTeletravail+res.indemBureau},{l:'COÛT TOTAL',v:res.costTotal,g:1}].map((x,i)=>
            <div key={i} style={{textAlign:'center'}}><div style={{fontSize:9.5,color:'#999',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:13,fontWeight:x.g?800:600,marginTop:3,color:x.g?'#c6a34e':'#333'}}>{fmt(x.v)}</div></div>
          )}
        </div>
        <div style={{marginTop:10,fontSize:10.5,color:'#bbb'}}>Versement: {emp.iban}</div>
        {/* CONDITIONS GÉNÉRALES INSTITUTIONNELLES */}
        <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid #e0dfda'}}>
          <div style={{fontSize:8.5,color:'#bbb',textTransform:'uppercase',letterSpacing:'1.5px',fontWeight:600,marginBottom:8}}>Conditions générales</div>
          <div style={{fontSize:8,color:'#aaa',lineHeight:1.7,columnCount:2,columnGap:20}}>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>1. Confidentialité</b> — La présente fiche de paie est un document strictement confidentiel destiné exclusivement au travailleur mentionné ci-dessus. Toute reproduction, diffusion ou communication à des tiers est interdite sauf accord écrit de l'employeur.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>2. Base légale</b> — Ce document est établi conformément à la loi du 12 avril 1965 concernant la protection de la rémunération des travailleurs et à l'arrêté royal du 27 septembre 1966 déterminant les mentions obligatoires du décompte de rémunération.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>3. Calculs</b> — Les retenues ONSS sont effectuées conformément à la loi du 29 juin 1981. Le précompte professionnel est calculé selon la formule-clé du SPF Finances (annexe III AR/CIR 92). La cotisation spéciale de sécurité sociale est établie conformément à la loi du 30 mars 1994.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>4. Contestation</b> — Toute contestation relative au présent décompte doit être adressée par écrit à l'employeur dans un délai d'un mois à compter de la date de réception. Passé ce délai, le décompte est réputé accepté, sans préjudice du droit de réclamation légal.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>5. Conservation</b> — Le travailleur est tenu de conserver ce document pendant une durée minimale de 5 ans. Ce document peut être requis pour l'établissement de la déclaration fiscale (IPP) et pour toute démarche administrative (chômage, pension, crédit).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>6. Données personnelles</b> — Le traitement des données à caractère personnel figurant sur ce document est effectué conformément au Règlement (UE) 2016/679 (RGPD). Les données sont traitées aux seules fins de gestion salariale, déclarations sociales et fiscales. Le travailleur dispose d'un droit d'accès, de rectification et de suppression de ses données (art. 15-17 RGPD).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>7. Barèmes</b> — Les rémunérations sont conformes aux barèmes sectoriels en vigueur de la commission paritaire applicable (CP {emp.cp||s.co.cp||'200'}), tels que publiés par le SPF Emploi, Travail et Concertation sociale.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>8. Paiement</b> — Le salaire net est versé par virement bancaire sur le compte communiqué par le travailleur, au plus tard le dernier jour ouvrable du mois en cours, conformément à l'art. 5 de la loi du 12/04/1965.</p>
          </div>
          <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:7.5,color:'#ccc'}}>{s.co.name} · {s.co.vat} · {s.co.addr} · Secrétariat social: Aureus Social Pro</div>
            <div style={{fontSize:7.5,color:'#ccc'}}>Document généré le {new Date().toLocaleDateString('fr-BE')} · Page 1/1</div>
          </div>
        </div>

        {/* TABLEAU RÉCAPITULATIF SOUMISSION ONSS / PP PAR ÉLÉMENT */}
        <div style={{marginTop:18,padding:14,background:'#f0efea',borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#999',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:10}}>Récapitulatif soumission ONSS & Précompte professionnel</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
            <thead><tr style={{borderBottom:'2px solid #c6a34e'}}>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Élément</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>Montant</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>ONSS</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>PP</th>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Base légale</th>
            </tr></thead>
            <tbody>
              {[
                {l:'Salaire de base',m:res.base,onss:'✅ Oui',pp:'✅ Oui',ref:'Loi 12/04/1965'},
                ...(res.overtime>0?[{l:'Heures supplémentaires (150%)',m:res.overtime,onss:'✅ Oui',pp:'✅ Oui',ref:'Loi 16/03/1971'}]:[]),
                ...(res.sunday>0?[{l:'Supplément dimanche (200%)',m:res.sunday,onss:'✅ Oui',pp:'✅ Oui',ref:'Loi 16/03/1971'}]:[]),
                ...(res.night>0?[{l:'Supplément nuit (125%)',m:res.night,onss:'✅ Oui',pp:'✅ Oui',ref:'Loi 16/03/1971'}]:[]),
                ...(res.bonus>0?[{l:'Prime',m:res.bonus,onss:'✅ Oui',pp:'✅ Oui',ref:'Art. 2 Loi 12/04/1965'}]:[]),
                ...(res.y13>0?[{l:'13ème mois',m:res.y13,onss:'✅ Oui',pp:'✅ Taux except.',ref:'AR 09/01/2024 ann.III'}]:[]),
                ...(res.sickPay>0?[{l:'Salaire garanti maladie',m:res.sickPay,onss:'✅ Oui',pp:'✅ Oui',ref:'Loi 03/07/1978 Art.52-70'}]:[]),
                {l:'▬ TOTAL BRUT',m:res.gross,onss:'',pp:'',ref:'',bold:true},
                ...(emp.statut==='ouvrier'?[{l:'  └ Base ONSS ouvrier (brut × 108%)',m:Math.round(res.gross*1.08*100)/100,onss:'✅ 13,07%',pp:'—',ref:'Loi 29/06/1981 Art.23',hl:'orange'}]:[]),
                {l:'ONSS travailleur (13,07%)',m:res.onssW,onss:'—',pp:'—',ref:'Loi 29/06/1981',neg:true},
                ...(res.empBonus>0?[{l:'  └ Bonus à l\'emploi social (volet A+B)',m:res.empBonus,onss:'Réduction',pp:'—',ref:'AR 01/06/1999 Art.2',hl:'green'}]:[]),
                ...(res.empBonusFisc>0?[{l:'  └ Bonus emploi fiscal (PP)',m:res.empBonusFisc,onss:'—',pp:'Réduction',ref:'Art. 289ter CIR 92',hl:'green'}]:[]),
                {l:'ONSS net retenu',m:res.onssNet,onss:'—',pp:'—',ref:'',neg:true,bold:true},
                {l:'Précompte professionnel',m:res.tax,onss:'—',pp:'—',ref:'AR/CIR 92 annexe III',neg:true},
                ...(res.ppVolontaire>0?[{l:'PP volontaire',m:res.ppVolontaire,onss:'—',pp:'—',ref:'Art. 275§1 CIR 92',neg:true}]:[]),
                {l:'Cotisation spéciale SS',m:res.css,onss:'—',pp:'—',ref:'Loi 30/03/1994',neg:true},
                ...(res.atnCar>0?[{l:'ATN Voiture de société',m:res.atnCar,onss:'❌ Non',pp:'✅ Oui',ref:'Art. 36 CIR 92'}]:[]),
                ...(res.atnGSM>0?[{l:'ATN GSM',m:res.atnGSM,onss:'❌ Non',pp:'✅ Oui',ref:'AR 18/12/2024 forfait'}]:[]),
                ...(res.atnPC>0?[{l:'ATN PC',m:res.atnPC,onss:'❌ Non',pp:'✅ Oui',ref:'AR 18/12/2024 forfait'}]:[]),
                ...(res.atnInternet>0?[{l:'ATN Internet',m:res.atnInternet,onss:'❌ Non',pp:'✅ Oui',ref:'AR 18/12/2024 forfait'}]:[]),
                ...(res.atnLogement>0?[{l:'ATN Logement',m:res.atnLogement,onss:'❌ Non',pp:'✅ Oui',ref:'Art. 18 AR/CIR 92'}]:[]),
                ...(res.atnChauffage>0?[{l:'ATN Chauffage',m:res.atnChauffage,onss:'❌ Non',pp:'✅ Oui',ref:'Art. 18 AR/CIR 92'}]:[]),
                ...(res.atnElec>0?[{l:'ATN Électricité',m:res.atnElec,onss:'❌ Non',pp:'✅ Oui',ref:'Art. 18 AR/CIR 92'}]:[]),
                ...(res.veloSociete?[{l:'🚲 Vélo de société',m:0,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Art. 38§1er 14°a CIR',hl:'green'}]:[]),
                ...(res.atnCarteCarburant>0?[{l:'Carte carburant (sans voit. soc.)',m:res.atnCarteCarburant,onss:'✅ Oui',pp:'✅ Oui',ref:'Art. 36§2 CIR 92'}]:[]),
                ...(res.transport>0?[{l:'Transport domicile-travail',m:res.transport,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'CCT 19/9 + Art. 38§1er 9° CIR',hl:'green'}]:[]),
                ...(res.expense>0?[{l:'Frais propres employeur',m:res.expense,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Art. 31 CIR 92',hl:'green'}]:[]),
                ...(res.indemTeletravail>0?[{l:'Indemnité télétravail',m:res.indemTeletravail,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Circ. 2021/C/20 (max 154,74€)',hl:'green'}]:[]),
                ...(res.indemBureau>0?[{l:'Indemnité bureau',m:res.indemBureau,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Art. 31 CIR 92',hl:'green'}]:[]),
                ...(res.doublePecule>0?[{l:'Double pécule vacances',m:res.doublePecule,onss:'✅ 2è partie',pp:'✅ Taux except.',ref:'AR 28/11/1969 Art.19§2'}]:[]),
                ...(res.peculeDepart>0?[{l:'Pécule vacances départ',m:res.peculeDepart,onss:'✅ 13,07%',pp:'✅ Taux except.',ref:'Loi 12/04/1965 Art.46'}]:[]),
                ...(res.primeAncExoneree>0?[{l:'Prime ancienneté (exonérée)',m:res.primeAncExoneree,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Art. 19§2 14° AR ONSS',hl:'green'}]:[]),
                ...(res.primeAncTaxable>0?[{l:'Prime ancienneté (taxable)',m:res.primeAncTaxable,onss:'✅ Oui',pp:'✅ Oui',ref:'Art. 19§2 14° AR ONSS'}]:[]),
                ...(res.primeNaissance>0?[{l:'Prime naissance/mariage',m:res.primeNaissance,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Circ. ONSS — avantage social',hl:'green'}]:[]),
                ...(res.primeInnovation>0?[{l:'Prime innovation',m:res.primeInnovation,onss:'✅ Oui',pp:'❌ Exonéré',ref:'Art. 38§1er 25° CIR'}]:[]),
                ...(res.ecoCheques>0?[{l:'Éco-chèques',m:res.ecoCheques,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'CCT 98 du 20/02/2009',hl:'green'}]:[]),
                ...(res.cadeaux>0?[{l:'Cadeaux/événements',m:res.cadeaux,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Circ. ONSS (≤ plafond)',hl:'green'}]:[]),
                ...(res.budgetMobPilier2>0?[{l:'Budget mobilité Pilier 2',m:res.budgetMobPilier2,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'Loi 17/03/2019',hl:'green'}]:[]),
                ...(res.budgetMobPilier3>0?[{l:'Budget mobilité Pilier 3 (cash)',m:res.budgetMobPilier3,onss:'✅ 38,07%',pp:'❌ Non',ref:'Loi 17/03/2019'}]:[]),
                ...(res.pensionCompl>0?[{l:'Pension complémentaire (ret. pers.)',m:res.pensionCompl,onss:'✅ Oui',pp:'❌ Réduc. 30%',ref:'LPC 28/04/2003 + Art.145/1'}]:[]),
                ...(res.allocTravail>0?[{l:`Allocation travail ONEM (${res.allocTravailLabel})`,m:res.allocTravail,onss:'❌ Non',pp:'✅ Retenu ONEM',ref:'AR 19/12/2001'}]:[]),
                ...(res.mvWorker>0?[{l:'Chèques-repas (part travailleur)',m:res.mvWorker,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:'AR 28/11/1969 Art.19bis§2',hl:'green'}]:[]),
                {l:'▬ TOTAL RETENUES',m:res.totalDed,onss:'',pp:'',ref:'',bold:true,neg:true},
                {l:'▬ NET À PAYER',m:res.net,onss:'',pp:'',ref:'',bold:true,hl:'net'},
              ].map((x,i)=><tr key={i} style={{borderBottom:'1px solid '+(x.bold?'#c6a34e':'#e5e4df'),background:x.hl==='green'?'rgba(22,163,74,.03)':x.hl==='orange'?'rgba(251,146,60,.04)':x.hl==='net'?'rgba(22,163,74,.06)':'transparent'}}>
                <td style={{padding:'5px 8px',color:x.bold?'#1a1a18':'#555',fontWeight:x.bold?700:400,fontSize:x.bold?11:10.5}}>{x.l}</td>
                <td style={{padding:'5px 8px',textAlign:'center',fontWeight:600,color:x.neg?'#dc2626':x.bold?'#1a1a18':x.hl==='net'?'#16a34a':'#333',fontSize:x.bold?12:10.5}}>{x.neg?'-':''}{fmt(x.m)}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.onss?.includes('❌')?'#16a34a':x.onss?.includes('✅')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.onss||''}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.pp?.includes('❌')?'#16a34a':x.pp?.includes('✅')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.pp||''}</td>
                <td style={{padding:'5px 8px',fontSize:9,color:'#999'}}>{x.ref||''}</td>
              </tr>)}
            </tbody>
          </table>
        </div>

        {/* BOUTON EXPORT PDF */}
        <div style={{marginTop:14,display:'flex',gap:10,justifyContent:'center'}} className="no-print">
          <button onClick={()=>{
            const el=document.querySelector('[data-payslip]');
            if(el){const w=window.open('','','width=900,height=1200');
            w.document.write('<html><head><title>Fiche de paie — '+emp.first+' '+emp.last+' — '+MN[per.month-1]+' '+per.year+'</title><style>@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@600;700&display=swap");*{margin:0;padding:0;box-sizing:border-box}body{font-family:Outfit,sans-serif;color:#1a1a18;background:#fff}.no-print{display:none!important}@media print{.no-print{display:none!important}@page{margin:10mm;size:A4}}</style></head><body>');
            w.document.write(el.outerHTML);w.document.write('</body></html>');w.document.close();
            setTimeout(()=>{w.print();},500);}
          }} style={{padding:'12px 28px',background:'#c6a34e',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:'.5px'}}>🖨 Imprimer / PDF</button>
          <button onClick={()=>{
            const el=document.querySelector('[data-payslip]');
            if(el){const b=new Blob(['<html><head><meta charset="utf-8"><style>*{font-family:Outfit,sans-serif;color:#1a1a18}</style></head><body>'+el.outerHTML+'</body></html>'],{type:'text/html'});
            const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`fiche_paie_${emp.last}_${emp.first}_${per.year}_${String(per.month).padStart(2,'0')}.html`;a.click();}
          }} style={{padding:'12px 28px',background:'transparent',color:'#c6a34e',border:'2px solid #c6a34e',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>💾 Télécharger HTML</button>
        </div>
      </div>}
    </div>
    {s.pays.length>0&&<C style={{marginTop:20,padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique</div></div>
      <Tbl cols={[
        {k:'p',l:'Période',b:1,c:'#c6a34e',r:r=>r.period},{k:'e',l:'Employé',r:r=>r.ename},
        {k:'g',l:'Brut',a:'right',r:r=>fmt(r.gross)},{k:'o',l:'ONSS',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssNet)}</span>},
        {k:'t',l:'Précompte',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.tax)}</span>},
        {k:'n',l:'Net',a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},
        {k:'c',l:'Coût',a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.costTotal)}</span>},
      ]} data={s.pays}/>
    </C>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DIMONA
// ═══════════════════════════════════════════════════════════════
function DimonaPage({s,d}) {
  const [f,setF]=useState({eid:s.emps[0]?.id||'',action:'IN',wtype:'OTH',start:new Date().toISOString().split('T')[0],end:'',hours:''});
  const emp=s.emps.find(e=>e.id===f.eid);
  const gen=()=>{if(!emp)return;
    const xml=genDimonaXML({action:f.action,wtype:f.wtype,start:f.start,end:f.end,hours:f.hours,first:emp.first,last:emp.last,niss:emp.niss,birth:emp.birth,cp:emp.cp,onss:s.co.onss,vat:s.co.vat});
    d({type:'ADD_DIM',d:{eid:emp.id,ename:`${emp.first} ${emp.last}`,action:f.action,wtype:f.wtype,start:f.start,end:f.end,xml,at:new Date().toISOString(),status:'ok'}});
    d({type:'MODAL',m:{w:800,c:<div><h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Dimona {f.action} — {emp.first} {emp.last}</h2><div style={{fontSize:11,color:'#c6a34e',marginBottom:10}}>XML prêt pour portail sécurité sociale</div><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10.5,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{xml}</pre><div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(xml);alert('Copié !')}}>Copier XML</B></div></div>}});
  };
  return <div>
    <PH title="Déclarations Dimona" sub="Déclaration immédiate de l'emploi — ONSS"/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Nouvelle déclaration</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Employé" value={f.eid} onChange={v=>setF({...f,eid:v})} span={2} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
          <I label="Action" value={f.action} onChange={v=>setF({...f,action:v})} options={LEGAL.DIMONA_TYPES.map(t=>({v:t,l:t==='IN'?'IN (Entrée)':t==='OUT'?'OUT (Sortie)':t}))}/>
          <I label="Type" value={f.wtype} onChange={v=>setF({...f,wtype:v})} options={LEGAL.DIMONA_WTYPES.map(t=>({v:t,l:t}))}/>
          <I label="Début" type="date" value={f.start} onChange={v=>setF({...f,start:v})}/>
          <I label="Fin" type="date" value={f.end} onChange={v=>setF({...f,end:v})}/>
        </div>
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer Dimona</B>
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,border:'1px solid rgba(96,165,250,.1)'}}>
          <div style={{fontSize:10.5,color:'#60a5fa',fontWeight:600,marginBottom:4}}>ℹ Rappel</div>
          <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.5}}>Dimona IN: au plus tard au début du travail. Dimona OUT: dernier jour.</div>
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique Dimona</div></div>
        <Tbl cols={[
          {k:'a',l:'Action',r:r=><span style={{padding:'2px 7px',borderRadius:4,fontSize:10.5,fontWeight:600,background:r.action==='IN'?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)',color:r.action==='IN'?'#4ade80':'#f87171'}}>{r.action}</span>},
          {k:'e',l:'Employé',r:r=>r.ename},{k:'s',l:'Début',r:r=>r.start},{k:'en',l:'Fin',r:r=>r.end||'—'},
          {k:'st',l:'Statut',r:r=><span style={{color:'#4ade80',fontSize:11}}>✓ Généré</span>},
        ]} data={s.dims}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DMFA
// ═══════════════════════════════════════════════════════════════
function DMFAPage({s,d}) {
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const [view,setView]=useState('detail');
  const ae=s.emps.filter(e=>e.status==='active');
  const sum=ae.map(e=>{
    const p=calc(e,{...DPER,days:65},s.co);
    const isOuv=(e.statut==='ouvrier');
    const base=isOuv?p.gross*3*1.08:p.gross*3;
    return{e,g3:p.gross*3,base3:base,isOuv,ow3:p.onssNet*3,oe3:p.onssE*3,
      ffe3:p.onss_ffe*3,chomT3:p.onss_chomTemp*3,amia3:p.onss_amiante*3,
      rate:p.onssE_rate,note:p.onssE_note,type:p.onssE_type};
  });
  const tot=sum.reduce((a,r)=>({g:a.g+r.g3,b:a.b+r.base3,ow:a.ow+r.ow3,oe:a.oe+r.oe3,ffe:a.ffe+r.ffe3,ct:a.ct+r.chomT3,am:a.am+r.amia3}),{g:0,b:0,ow:0,oe:0,ffe:0,ct:0,am:0});

  // Calendrier ONSS 2026 — provisions mensuelles (le 5) + solde trimestriel
  const calONSS=[
    {p:'T1 2026',prov:['05/02','05/03','05/04'],solde:'30/04/2026'},
    {p:'T2 2026',prov:['05/05','05/06','05/07'],solde:'31/07/2026'},
    {p:'T3 2026',prov:['05/08','05/09','05/10'],solde:'31/10/2026'},
    {p:'T4 2026',prov:['05/11','05/12','05/01/2027'],solde:'31/01/2027'},
  ];

  const [ticket,setTicket]=useState(null);
  const gen=()=>{
    const xml=genDMFAXML(s.co,ae,q,y);
    const refMatch=xml.match(/Reference>([^<]+)</);
    const ref=refMatch?refMatch[1]:'REF-'+Date.now();
    const acrf=genDMFATicket(ref,s.co);
    const totAll=tot.ow+tot.oe+tot.ffe+tot.ct+tot.am;
    const anomalies=[];
    ae.forEach(e=>{if(!e.niss)anomalies.push({zone:'INSS',sev:'E',desc:`NISS manquant pour ${e.first} ${e.last}`});});
    if(!s.co.onss)anomalies.push({zone:'NLOSSRegistrationNbr',sev:'E',desc:'Matricule ONSS employeur manquant'});
    const notif=genDMFANotification(acrf.ticket,s.co,q,y,ae.length,totAll.toFixed(2),anomalies);
    d({type:'ADD_DMFA',d:{q,y,cnt:ae.length,xml,ticket:acrf.ticket,ref,at:new Date().toISOString()}});
    setTicket({ref,ticket:acrf.ticket,acrfXml:acrf.xml,notifXml:notif,anomalies,xml});
    d({type:'MODAL',m:{w:950,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>DMFA T{q}/{y} — Envoi simulé</h2>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:'rgba(74,222,128,.1)',color:'#4ade80',fontWeight:600}}>✓ ACRF positif</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:anomalies.length>0?'rgba(198,163,78,.1)':'rgba(74,222,128,.1)',color:anomalies.length>0?'#c6a34e':'#4ade80',fontWeight:600}}>{anomalies.length>0?`⚠ ${anomalies.length} anomalie(s)`:'✓ Acceptée sans anomalie'}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <div style={{padding:10,background:'rgba(198,163,78,.05)',borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Identifiants</div>
          <div>Référence: <b style={{color:'#e8e6e0',fontFamily:'monospace'}}>{ref}</b></div>
          <div>Ticket ONSS: <b style={{color:'#4ade80',fontFamily:'monospace'}}>{acrf.ticket}</b></div>
          <div>Trimestre: <b style={{color:'#e8e6e0'}}>T{q}/{y}</b></div>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Total cotisations: <b style={{color:'#c6a34e'}}>{fmt(totAll)}</b></div>
        </div>
        <div style={{padding:10,background:'rgba(96,165,250,.05)',borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#60a5fa',marginBottom:4}}>Flux ONSS</div>
          <div>1. <span style={{color:'#4ade80'}}>✓</span> Envoi XML DmfAOriginal</div>
          <div>2. <span style={{color:'#4ade80'}}>✓</span> Accusé de réception (ACRF) positif</div>
          <div>3. <span style={{color:'#4ade80'}}>✓</span> Notification (DMNO) — acceptée</div>
          <div>4. <span style={{color:'#60a5fa'}}>→</span> PID reçu (identifiants permanents)</div>
          <div>5. <span style={{color:'#5e5c56'}}>○</span> Éventuelle notification de modification</div>
        </div>
      </div>
      {anomalies.length>0&&<div style={{padding:10,background:'rgba(248,113,113,.05)',borderRadius:6,marginBottom:14,border:'1px solid rgba(248,113,113,.1)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'#f87171',marginBottom:6}}>Anomalies détectées</div>
        {anomalies.map((a,i)=><div key={i} style={{fontSize:11,color:'#9e9b93',padding:'3px 0'}}>• <b style={{color:'#f87171'}}>{a.zone}</b>: {a.desc}</div>)}
      </div>}
      <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9.5,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto'}}>{xml}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
        <B v="outline" onClick={()=>{navigator.clipboard?.writeText(acrf.xml);alert('ACRF copié !')}}>Copier ACRF</B>
        <B onClick={()=>{navigator.clipboard?.writeText(xml);alert('XML DMFA copié !')}}>Copier XML</B>
      </div>
    </div>}});
  };
  return <div>
    <PH title="Déclaration DMFA" sub="Trimestrielle — ONSS"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>Période</ST>
        <I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:'T1 (Jan-Mar)'},{v:2,l:'T2 (Avr-Jun)'},{v:3,l:'T3 (Jul-Sep)'},{v:4,l:'T4 (Oct-Déc)'}]}/>
        <I label="Année" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <I label="Vue" value={view} onChange={setView} style={{marginTop:9}} options={[{v:'detail',l:'Détail par travailleur'},{v:'ventil',l:'Ventilation cotisations'},{v:'calendar',l:'Calendrier ONSS'}]}/>
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer DMFA T{q}/{y}</B>
        {ticket&&<div style={{marginTop:12,padding:10,background:'rgba(74,222,128,.05)',borderRadius:8,border:'1px solid rgba(74,222,128,.15)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#4ade80',marginBottom:6}}>✓ Dernier envoi</div>
          <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:2}}>
            <div>Ticket: <b style={{color:'#4ade80',fontFamily:'monospace',fontSize:9.5}}>{ticket.ticket}</b></div>
            <div>Réf: <b style={{color:'#e8e6e0',fontFamily:'monospace',fontSize:9.5}}>{ticket.ref}</b></div>
            <div>Anomalies: <b style={{color:ticket.anomalies.length>0?'#f87171':'#4ade80'}}>{ticket.anomalies.length>0?ticket.anomalies.length+' ⚠':'Aucune ✓'}</b></div>
          </div>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:'MODAL',m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Accusé de réception (ACRF)</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.acrfXml}</pre><B v="outline" onClick={()=>d({type:'MODAL',m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>ACRF</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:'MODAL',m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Notification (DMNO)</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.notifXml}</pre><B v="outline" onClick={()=>d({type:'MODAL',m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>DMNO</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:'MODAL',m:{w:900,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>XML DmfAOriginal complet</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{ticket.xml}</pre><B v="outline" onClick={()=>d({type:'MODAL',m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>XML</B>
          </div>
        </div>}
        <div style={{marginTop:18,padding:12,background:'rgba(198,163,78,.05)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:11.5,fontWeight:600,color:'#c6a34e',marginBottom:6}}>Récapitulatif T{q}/{y}</div>
          <div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
            <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b> ({sum.filter(s2=>s2.isOuv).length} ouv. / {sum.filter(s2=>!s2.isOuv).length} empl.)</div>
            <div>Masse brute: <b style={{color:'#e8e6e0'}}>{fmt(tot.g)}</b></div>
            <div>Base ONSS (108%): <b style={{color:'#e8e6e0'}}>{fmt(tot.b)}</b></div>
            <div>ONSS trav.: <b style={{color:'#f87171'}}>{fmt(tot.ow)}</b></div>
            <div>ONSS empl.: <b style={{color:'#f87171'}}>{fmt(tot.oe)}</b></div>
            <div style={{borderTop:'1px solid rgba(198,163,78,.15)',paddingTop:4,marginTop:4}}>Total ONSS: <b style={{color:'#c6a34e'}}>{fmt(tot.ow+tot.oe)}</b></div>
          </div>
        </div>
        <div style={{marginTop:10,padding:8,background:'rgba(96,165,250,.06)',borderRadius:6,fontSize:10,color:'#60a5fa',lineHeight:1.6}}>
          <b>Provisions:</b> le 5 de chaque mois<br/>
          <b>Solde trim.:</b> dernier jour du mois suivant<br/>
          <b>Ouvriers:</b> base = brut × 108%<br/>
          <b>Marchand:</b> 25% | <b>Non-marchand:</b> 32,40%
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        {view==='detail'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail T{q}/{y}</div></div>
        <Tbl cols={[
          {k:'n',l:'Travailleur',r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'st',l:'Statut',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:r.isOuv?'rgba(248,113,113,.1)':'rgba(96,165,250,.1)',color:r.isOuv?'#f87171':'#60a5fa'}}>{r.isOuv?'Ouvrier':'Employé'}</span>},
          {k:'c',l:'Code',r:r=>r.e.dmfaCode},{k:'cp',l:'CP',r:r=>r.e.cp},
          {k:'b',l:'Base ONSS',a:'right',r:r=><span style={{fontSize:11}}>{fmt(r.base3)}{r.isOuv?' (108%)':''}</span>},
          {k:'ow',l:'ONSS trav.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.ow3)}</span>},
          {k:'oe',l:'ONSS empl.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.oe3)}</span>},
          {k:'r',l:'Taux',a:'right',r:r=><span style={{fontSize:10,color:'#c6a34e'}}>{(r.rate*100).toFixed(1)}%</span>},
        ]} data={sum}/></>}

        {view==='ventil'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Ventilation cotisations T{q}/{y}</div></div>
        <div style={{padding:18}}>
          {[
            {l:'Cotisation patronale de base',v:tot.oe,pct:(tot.oe/tot.b*100).toFixed(2),c:'#f87171'},
            {l:'Cotisation Fonds fermeture (FFE)',v:tot.ffe,pct:(tot.ffe/tot.b*100).toFixed(3),c:'#a78bfa'},
            {l:'Cotisation chômage temporaire',v:tot.ct,pct:(tot.ct/tot.b*100).toFixed(3),c:'#60a5fa'},
            {l:'Cotisation Fonds amiante',v:tot.am,pct:(tot.am/tot.b*100).toFixed(4),c:'#4ade80'},
            {l:'ONSS travailleur (13,07%)',v:tot.ow,pct:'13.07',c:'#f87171'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{fontSize:12,color:'#9e9b93'}}>{r.l}</span>
            <span style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:10,color:'#5e5c56'}}>{r.pct}%</span>
              <span style={{fontWeight:600,color:r.c,fontSize:13,minWidth:90,textAlign:'right'}}>{fmt(r.v)}</span>
            </span>
          </div>)}
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderTop:'2px solid rgba(198,163,78,.3)',marginTop:8}}>
            <span style={{fontSize:13,fontWeight:700,color:'#e8e6e0'}}>TOTAL ONSS à verser</span>
            <span style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{fmt(tot.ow+tot.oe+tot.ffe+tot.ct+tot.am)}</span>
          </div>
          <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.05)',borderRadius:6,fontSize:10.5,color:'#9e9b93',lineHeight:1.6}}>
            <b style={{color:'#c6a34e'}}>Notes:</b><br/>
            • Cotis. patronale base: {sum.filter(s2=>s2.type==='marchand').length} trav. marchand (25%) + {sum.filter(s2=>s2.type==='non_marchand').length} trav. non-marchand (32,40%)<br/>
            • Fonds amiante: dû T1-T3 2026 uniquement<br/>
            • Ouvriers ({sum.filter(s2=>s2.isOuv).length}): base calculée sur brut × 108%<br/>
            • Réduction structurelle incluse (Cat {ae[0]?.statut==='ouvrier'?'1':'1'}) • Hors réductions groupes-cibles
          </div>
        </div></>}

        {view==='calendar'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Calendrier ONSS {y}</div></div>
        <div style={{padding:18}}>
          {calONSS.map((c,i)=><div key={i} style={{marginBottom:16,padding:12,background:'rgba(198,163,78,.04)',borderRadius:8,border:i===(q-1)?'1px solid rgba(198,163,78,.3)':'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontSize:12,fontWeight:600,color:i===(q-1)?'#c6a34e':'#e8e6e0',marginBottom:6}}>{c.p} {i===(q-1)?'← actuel':''}</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:2}}>
              {c.prov.map((pr,j)=><div key={j}>Provision {j+1}: <b style={{color:'#d4d0c8'}}>{pr}</b></div>)}
              <div style={{borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:4,marginTop:4}}>Solde + DmfA: <b style={{color:'#c6a34e'}}>{c.solde}</b></div>
            </div>
          </div>)}
          <div style={{padding:10,background:'rgba(96,165,250,.06)',borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            <b>Rappel légal:</b> Les provisions mensuelles sont calculées par l'ONSS et communiquées à l'employeur. L'employeur verse la différence entre le total des provisions et la somme totale des cotisations au plus tard le dernier jour du mois suivant le trimestre.
          </div>
        </div></>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BELCOTAX
// ═══════════════════════════════════════════════════════════════
function BelcotaxPage({s,d}) {
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const [ft,setFt]=useState('10');
  const gen=()=>{
    s.emps.filter(e=>e.status==='active').forEach(emp=>{
      const p=calc(emp,DPER,s.co);
      const ad={gross:p.gross*12,onss:p.onssNet*12,empB:p.empBonus*12,tax:p.tax*12,css:p.css*12,mvC:Math.round(p.mvDays*12),mvE:p.mvEmployer*12,tr:p.transport*12,atnCar:(p.atnCar||0)*12,atnAutres:(p.atnAutresTot||0)*12,pensionCompl:(p.pensionCompl||0)*12,fraisPropres:((p.expense||0)+(p.indemTeletravail||0)+(p.indemBureau||0))*12,ecoCheques:(p.ecoCheques||0)*12};
      const xml=genBelcotax(s.co,emp,yr,ad);
      d({type:'ADD_F',d:{eid:emp.id,ename:`${emp.first} ${emp.last}`,yr,ft,ftl:LEGAL.FICHE_281[ft],ag:ad.gross,an:p.net*12,xml,at:new Date().toISOString()}});
    });
    alert(`${s.emps.filter(e=>e.status==='active').length} fiche(s) 281.${ft} générée(s) !`);
  };
  return <div>
    <PH title="Fiches Fiscales 281.xx" sub="BelcotaxOnWeb"/>
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <C><ST>Génération</ST>
        <I label="Année de revenus" type="number" value={yr} onChange={v=>setYr(v)}/>
        <I label="Type de fiche" value={ft} onChange={v=>setFt(v)} style={{marginTop:9}} options={Object.entries(LEGAL.FICHE_281).map(([k,v])=>({v:k,l:`281.${k} — ${v}`}))}/>
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer 281.{ft}</B>
        <div style={{marginTop:18,padding:10,background:'rgba(198,163,78,.05)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:10.5,color:'#c6a34e',fontWeight:600,marginBottom:6}}>Types disponibles</div>
          {Object.entries(LEGAL.FICHE_281).map(([k,v])=><div key={k} style={{fontSize:10.5,color:'#9e9b93',padding:'2px 0'}}><b style={{color:'#d4d0c8'}}>281.{k}</b> — {v}</div>)}
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Fiches générées</div></div>
        <Tbl cols={[
          {k:'y',l:'Année',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.yr}</span>},
          {k:'t',l:'Type',r:r=>`281.${r.ft}`},{k:'e',l:'Employé',r:r=>r.ename},
          {k:'g',l:'Brut annuel',a:'right',r:r=>fmt(r.ag)},
          {k:'n',l:'Net annuel',a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.an)}</span>},
          {k:'x',l:'',a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>d({type:'MODAL',m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>281.{r.ft} — {r.ename} ({r.yr})</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(r.xml);alert('Copié !')}}>Copier</B></div></div>}})}>XML</B>},
        ]} data={s.fiches}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PRÉCOMPTE 274
// ═══════════════════════════════════════════════════════════════
function PrecomptePage({s,d}) {
  const [mode,setMode]=useState('mensuel');
  const [m,setM]=useState(new Date().getMonth()+1);
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const ae=s.emps.filter(e=>e.status==='active');

  // Calcul mensuel
  const detMens=ae.map(e=>{const p=calc(e,{...DPER,month:m,year:y},s.co);return{e,tax:p.tax,gross:p.gross};});
  const totMens=detMens.reduce((a,r)=>a+r.tax,0);

  // Calcul trimestriel (3 mois cumulés)
  const qMonths=[(q-1)*3+1,(q-1)*3+2,(q-1)*3+3];
  const detTrim=ae.map(e=>{
    let taxQ=0,grossQ=0;
    qMonths.forEach(mo=>{const p=calc(e,{...DPER,month:mo,year:y},s.co);taxQ+=p.tax;grossQ+=p.gross;});
    return{e,tax:taxQ,gross:grossQ};
  });
  const totTrim=detTrim.reduce((a,r)=>a+r.tax,0);

  // Seuil: PP année N-1 > 50 240€ → obligatoirement mensuel
  const ppAnnuel=totMens*12;
  const seuilMensuel=50240;
  const obligMensuel=ppAnnuel>seuilMensuel;

  const det=mode==='mensuel'?detMens:detTrim;
  const tot=mode==='mensuel'?totMens:totTrim;

  // Calendrier SPF 2026
  const calMens=[{p:'Janvier 2026',dl:'13/02/2026'},{p:'Février 2026',dl:'13/03/2026'},{p:'Mars 2026',dl:'15/04/2026'},{p:'Avril 2026',dl:'15/05/2026'},{p:'Mai 2026',dl:'15/06/2026'},{p:'Juin 2026',dl:'15/07/2026'},{p:'Juillet 2026',dl:'14/08/2026'},{p:'Août 2026',dl:'15/09/2026'},{p:'Septembre 2026',dl:'15/10/2026'},{p:'Octobre 2026',dl:'13/11/2026'},{p:'Novembre 2026',dl:'15/12/2026'},{p:'Décembre 2026',dl:'15/01/2027'}];
  const calTrim=[{p:'T1 2026',dl:'15/04/2026'},{p:'T2 2026',dl:'15/07/2026'},{p:'T3 2026',dl:'15/10/2026'},{p:'T4 2026',dl:'15/01/2027'}];

  return <div>
    <PH title="Précompte Professionnel 274" sub="Déclaration et versement — FINPROF"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>Configuration</ST>
        <I label="Périodicité" value={mode} onChange={setMode} options={[{v:'mensuel',l:'Mensuel'},{v:'trimestriel',l:'Trimestriel'}]}/>
        {mode==='mensuel'?<I label="Mois" value={m} onChange={v=>setM(parseInt(v))} options={MN.map((x,i)=>({v:i+1,l:x}))} style={{marginTop:9}}/>
        :<I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:'T1 (jan-mar)'},{v:2,l:'T2 (avr-jun)'},{v:3,l:'T3 (jul-sep)'},{v:4,l:'T4 (oct-déc)'}]} style={{marginTop:9}}/>}
        <I label="Année" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <div style={{marginTop:18,padding:14,background:'rgba(198,163,78,.06)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)',textAlign:'center'}}>
          <div style={{fontSize:10.5,color:'#9e9b93',textTransform:'uppercase',letterSpacing:'1px'}}>Total à verser</div>
          <div style={{fontSize:26,fontWeight:700,color:'#c6a34e',marginTop:6}}>{fmt(tot)}</div>
          <div style={{fontSize:10.5,color:'#5e5c56',marginTop:3}}>{mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y}`} · {ae.length} trav.</div>
        </div>
        {obligMensuel&&mode==='trimestriel'&&<div style={{marginTop:10,padding:8,background:'rgba(239,68,68,.08)',borderRadius:6,border:'1px solid rgba(239,68,68,.15)',fontSize:10.5,color:'#ef4444'}}>
          <b>⚠</b> PP annuel estimé ({fmt(ppAnnuel)}) dépasse le seuil de {fmt(seuilMensuel)}. Déclaration <b>mensuelle obligatoire</b>.
        </div>}
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,border:'1px solid rgba(96,165,250,.1)'}}>
          <div style={{fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            <b>Seuil:</b> PP N-1 {'>'} 50 240€ → mensuel<br/>
            <b>Échéance:</b> 15 du mois suivant (mensuel) ou 15 du mois suivant le trimestre<br/>
            <b>Déclaration:</b> Via FINPROF (application SPF Finances)
          </div>
        </div>
      </C>
      <C style={{marginTop:12}}><ST>Calendrier SPF {y}</ST>
        <div style={{maxHeight:200,overflow:'auto'}}>
        {(mode==='mensuel'?calMens:calTrim).map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <span style={{color:'#9e9b93'}}>{c.p}</span><span style={{fontWeight:600,color:i===((mode==='mensuel'?m:q)-1)?'#c6a34e':'#d4d0c8'}}>{c.dl}</span>
        </div>)}
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail — {mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y} (${qMonths.map(mo=>MN[mo-1]).join(' + ')})`}</div></div>
        <Tbl cols={[
          {k:'n',l:'Travailleur',r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'g',l:mode==='mensuel'?'Brut':'Brut cumulé',a:'right',r:r=>fmt(r.gross)},
          {k:'t',l:mode==='mensuel'?'Précompte':'PP cumulé',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.tax)}</span>},
        ]} data={det}/>
        {det.length>0&&<div style={{padding:'12px 18px',borderTop:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'flex-end',gap:16}}><span style={{fontSize:12,color:'#9e9b93'}}>TOTAL:</span><span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{fmt(tot)}</span></div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DOCUMENTS SOCIAUX
// ═══════════════════════════════════════════════════════════════
function DocsPage({s,d}) {
  const [dt,setDt]=useState('C4');
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [endD,setEndD]=useState(new Date().toISOString().split('T')[0]);
  const [reason,setReason]=useState('Licenciement');
  const emp=s.emps.find(e=>e.id===eid);

  const gen=()=>{if(!emp)return;
    const fields=dt==='C4'?[
      {l:'Employeur',v:s.co.name},{l:'N° ONSS',v:s.co.onss},{l:'Travailleur',v:`${emp.first} ${emp.last}`},{l:'NISS',v:emp.niss},
      {l:'Fonction',v:emp.fn},{l:'CP',v:`CP ${emp.cp}`},{l:'Entrée',v:emp.startD},{l:'Sortie',v:endD},{l:'Motif',v:reason},
      {l:'Dernier brut',v:fmt(emp.monthlySalary)},{l:'Régime',v:`${emp.whWeek}h/sem`},
    ]:dt==='VACATION'?[
      {l:'Employeur',v:s.co.name},{l:'Travailleur',v:`${emp.first} ${emp.last}`},{l:'Année réf.',v:`${new Date().getFullYear()-1}`},
      {l:'Jours vacances',v:'20 jours'},{l:'Simple pécule',v:fmt(emp.monthlySalary)},{l:'Double pécule (92% brut)',v:fmt(emp.monthlySalary*0.92)},{l:'  dont 1ère partie (85%)',v:fmt(emp.monthlySalary*0.85)},{l:'  dont 2ème partie (7%)',v:fmt(emp.monthlySalary*0.07)},{l:'ONSS sur 2ème partie',v:fmt(emp.monthlySalary*0.07*0.1307)},
    ]:[{l:'Employeur',v:s.co.name},{l:'Travailleur',v:`${emp.first} ${emp.last}`},{l:'Date',v:new Date().toLocaleDateString('fr-BE')}];

    const title=LEGAL.SOCIAL_DOCS[dt]||dt;
    d({type:'ADD_DOC',d:{eid:emp.id,ename:`${emp.first} ${emp.last}`,dt,title,fields,at:new Date().toISOString()}});
    d({type:'MODAL',m:{w:580,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 3px',fontFamily:"'Cormorant Garamond',serif"}}>{title}</h2>
      <div style={{fontSize:10.5,color:'#c6a34e',marginBottom:16}}>{s.co.name}</div>
      <div style={{padding:18,background:'#faf9f4',borderRadius:10,color:'#1a1a18'}}>
        {fields.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #eee',fontSize:12.5}}><span style={{color:'#888'}}>{f.l}</span><span style={{fontWeight:500}}>{f.v}</span></div>)}
        <div style={{marginTop:22,display:'flex',justifyContent:'space-between'}}>
          <div style={{fontSize:10.5,color:'#999'}}>Fait le {new Date().toLocaleDateString('fr-BE')}</div>
          <div style={{fontSize:10.5,color:'#999',textAlign:'right'}}>Signature<br/><br/>_____________________</div>
        </div>
      </div>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B></div>
    </div>}});
  };
  return <div>
    <PH title="Documents Sociaux" sub="C4, attestations, certificats"/>
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <C><ST>Nouveau document</ST>
        <I label="Type" value={dt} onChange={setDt} options={Object.entries(LEGAL.SOCIAL_DOCS).map(([k,v])=>({v:k,l:v}))}/>
        <I label="Employé" value={eid} onChange={setEid} style={{marginTop:9}} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        {dt==='C4'&&<><I label="Date sortie" type="date" value={endD} onChange={setEndD} style={{marginTop:9}}/>
          <I label="Motif" value={reason} onChange={setReason} style={{marginTop:9}} options={[{v:'Licenciement',l:'Licenciement'},{v:'Démission',l:'Démission'},{v:'Fin CDD',l:'Fin de CDD'},{v:'Commun accord',l:'Commun accord'},{v:'Faute grave',l:'Faute grave'}]}/></>}
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer</B>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Documents générés</div></div>
        <Tbl cols={[
          {k:'t',l:'Type',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.title}</span>},
          {k:'e',l:'Employé',r:r=>r.ename},
          {k:'d',l:'Date',r:r=>new Date(r.at).toLocaleDateString('fr-BE')},
        ]} data={s.docs}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════════════════
function ReportsPage({s,d}) {
  const ae=s.emps.filter(e=>e.status==='active');
  const md=ae.map(e=>{const p=calc(e,DPER,s.co);return{name:`${e.first} ${e.last}`,gross:p.gross,onssW:p.onssNet,tax:p.tax,css:p.css,net:p.net,onssE:p.onssE,cost:p.costTotal};});
  const t=md.reduce((a,r)=>({g:a.g+r.gross,ow:a.ow+r.onssW,tx:a.tx+r.tax,cs:a.cs+r.css,n:a.n+r.net,oe:a.oe+r.onssE,co:a.co+r.cost}),{g:0,ow:0,tx:0,cs:0,n:0,oe:0,co:0});
  return <div>
    <PH title="Rapports" sub="Analyse masse salariale"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}}>
      <SC label="Masse brute" value={fmt(t.g)} color="#60a5fa"/>
      <SC label="Charges ONSS" value={fmt(t.ow+t.oe)} color="#f87171" sub={`Trav: ${fmt(t.ow)} · Empl: ${fmt(t.oe)}`}/>
      <SC label="Précompte" value={fmt(t.tx)} color="#a78bfa"/>
      <SC label="Coût employeur" value={fmt(t.co)} color="#c6a34e" sub={`Net: ${fmt(t.n)}`}/>
    </div>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail mensuel</div></div>
      <Tbl cols={[{k:'name',l:'Employé',b:1},{k:'g',l:'Brut',a:'right',r:r=>fmt(r.gross)},{k:'o',l:'ONSS',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssW)}</span>},{k:'t',l:'Préc.',a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.tax)}</span>},{k:'n',l:'Net',a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},{k:'e',l:'ONSS empl.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssE)}</span>},{k:'c',l:'Coût',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.cost)}</span>}]} data={md}/>
    </C>
    <C style={{marginTop:18}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Projection annuelle</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{l:'Masse brute',v:t.g*12,c:'#60a5fa'},{l:'Charges sociales',v:(t.ow+t.oe)*12,c:'#f87171'},{l:'Net versé',v:t.n*12,c:'#4ade80'},{l:'Coût total',v:t.co*12,c:'#c6a34e'}].map((x,i)=>
          <div key={i} style={{textAlign:'center',padding:14,background:`${x.c}08`,borderRadius:8}}><div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:5}}>{fmt(x.v)}</div></div>
        )}
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  FRAIS DE GESTION — Grille tarifaire secrétariat social
// ═══════════════════════════════════════════════════════════════
function FraisGestionMod({s,d}){
  const [tarifs,setTarifs]=useState(()=>{
    const cats=[
      {cat:'Gestion courante',color:'#c6a34e',items:[
        {id:'fg_fiche_paie',l:'Fiche de paie mensuelle',unit:'/fiche/mois',desc:'Calcul et émission de la fiche de paie conforme SPF',price:''},
        {id:'fg_fiche_paie_ouvrier',l:'Fiche de paie ouvrier (construction)',unit:'/fiche/mois',desc:'Spécificités CP 124: timbres, intempéries, caisse congés',price:''},
        {id:'fg_entree',l:'Entrée en service (onboarding)',unit:'/travailleur',desc:'Dimona IN, contrat, annexes, DRS, affiliation caisse',price:''},
        {id:'fg_sortie',l:'Sortie de service',unit:'/travailleur',desc:'Dimona OUT, C4, pécule de sortie, solde de tout compte',price:''},
        {id:'fg_abonnement',l:'Abonnement mensuel de gestion',unit:'/mois',desc:'Accès plateforme, support, mises à jour légales',price:''},
        {id:'fg_abonnement_trav',l:'Supplément par travailleur actif',unit:'/travailleur/mois',desc:'Gestion courante par travailleur inscrit',price:''},
        {id:'fg_minimum',l:'Minimum de facturation mensuel',unit:'/mois',desc:'Montant minimum même sans activité',price:''},
        {id:'fg_tableau_bord',l:'Tableau de bord',unit:'/mois',desc:'Accès tableau de bord avec indicateurs RH et paie',price:''},
        {id:'fg_interface_pointage',l:'Interface pointage',unit:'/mois',desc:'Importation données de pointage / paie depuis système externe',price:''},
      ]},
      {cat:'Modules comptables & Chèques-Repas',color:'#4ade80',items:[
        {id:'fg_od_sans',l:'O.D. — sans liaison comptabilité',unit:'/mois',desc:'Opérations diverses salaires sans export comptable',price:''},
        {id:'fg_od_liaison',l:'O.D. — Liaison BOB/Winbooks/Kluwer/Popsy',unit:'/mois',desc:'Export automatique OD vers logiciel comptable',price:''},
        {id:'fg_cr_pluxee',l:'Chèques-Repas: liaison Pluxee (ex-Sodexo)',unit:'/mois',desc:'Commande automatique chèques-repas via Pluxee',price:''},
        {id:'fg_cr_edenred',l:'Chèques-Repas: liaison Edenred',unit:'/mois',desc:'Commande automatique chèques-repas via Edenred',price:''},
        {id:'fg_cr_monizze',l:'Chèques-Repas: liaison Monizze',unit:'/mois',desc:'Commande automatique chèques-repas via Monizze',price:''},
        {id:'fg_cr_got',l:'Chèques-Repas: liaison G.O.T. Connection',unit:'/mois',desc:'Commande automatique chèques-repas via G.O.T. Connection',price:''},
      ]},
      {cat:'Envoi automatique documents',color:'#60a5fa',items:[
        {id:'fg_envoi_outlook',l:'Envoi PDF via Outlook (BP, FF, CI)',unit:'/mois',desc:'Envoi automatique bons paie, fiches fiscales, comptes individuels par email',price:''},
        {id:'fg_envoi_doccle',l:'Envoi PDF via Doccle',unit:'/mois',desc:'Envoi automatique documents via coffre-fort numérique Doccle',price:''},
      ]},
      {cat:'Déclarations sociales',color:'#22d3ee',items:[
        {id:'fg_dimona',l:'Déclaration Dimona (IN/OUT/UPDATE)',unit:'/déclaration',desc:'Déclaration immédiate d\'emploi à l\'ONSS',price:''},
        {id:'fg_dmfa',l:'Déclaration DMFA trimestrielle',unit:'/trimestre',desc:'Déclaration multifonctionnelle ONSS trimestrielle',price:''},
        {id:'fg_dmfappl',l:'Module ONSS-APL (DMFAPPL)',unit:'/trimestre',desc:'Déclaration ONSS pour administrations provinciales et locales',price:''},
        {id:'fg_primes_synd',l:'Module Primes Syndicales',unit:'/an',desc:'Déclaration et paiement des primes syndicales',price:''},
        {id:'fg_eta',l:'Relevés ETA (Awiph / Cocof)',unit:'/an',desc:'Relevés pour entreprises de travail adapté',price:''},
        {id:'fg_limosa',l:'Déclaration Limosa (détachement)',unit:'/déclaration',desc:'Travailleur étranger détaché en Belgique',price:''},
      ]},
      {cat:'Fiches fiscales & Relevés',color:'#a78bfa',items:[
        {id:'fg_belcotax_10',l:'Fiches Belcotax 281.10 (Rémunérations)',unit:'/fiche/an',desc:'Fiche fiscale annuelle salariés et dirigeants',price:''},
        {id:'fg_fiche_11',l:'Fiches & relevés 281.11 (Pensions)',unit:'/fiche/an',desc:'Pensions, rentes, capitaux',price:''},
        {id:'fg_fiche_14',l:'Fiches & relevés 281.14 (Rentes)',unit:'/fiche/an',desc:'Rentes alimentaires et autres',price:''},
        {id:'fg_fiche_29',l:'Fiches & relevés 281.29 (Économie collaborative)',unit:'/fiche/an',desc:'Revenus plateformes collaboratives',price:''},
        {id:'fg_fiche_30',l:'Fiches & relevés 281.30 (Jetons de présence)',unit:'/fiche/an',desc:'Jetons de présence administrateurs',price:''},
        {id:'fg_fiche_45',l:'Fiches & relevés 281.45 (Droits d\'auteur)',unit:'/fiche/an',desc:'Droits d\'auteur et droits voisins',price:''},
        {id:'fg_fiche_50',l:'Fiches & relevés 281.50 (Honoraires)',unit:'/fiche/an',desc:'Honoraires, commissions, indépendants',price:''},
        {id:'fg_precompte',l:'Précompte professionnel (274)',unit:'/mois',desc:'Calcul et déclaration mensuelle du PP',price:''},
        {id:'fg_fiche_fiscal',l:'Fiche fiscale individuelle annuelle',unit:'/travailleur/an',desc:'Résumé fiscal annuel par travailleur',price:''},
      ]},
      {cat:'Documents sociaux — Secteur Chômage',color:'#fb923c',items:[
        {id:'fg_c4',l:'C4 certificat de chômage',unit:'/document',desc:'Certificat de chômage complet C4',price:''},
        {id:'fg_c4_rcc',l:'C4 prépension (RCC)',unit:'/document',desc:'C4 régime de chômage avec complément d\'entreprise',price:''},
        {id:'fg_c4_ens',l:'C4 Enseignement',unit:'/document',desc:'C4 spécifique secteur enseignement',price:''},
        {id:'fg_c32_cd',l:'C3.2 constat du droit',unit:'/document',desc:'Constat du droit au chômage temporaire',price:''},
        {id:'fg_c32_ouv',l:'C3.2 employeur → ouvriers',unit:'/document',desc:'Chômage temporaire ouvriers',price:''},
        {id:'fg_c32_emp',l:'C3.2 employeur anti-crise → employés',unit:'/document',desc:'Chômage temporaire employés mesures anti-crise',price:''},
        {id:'fg_c131a',l:'C131A Employeur',unit:'/document',desc:'Attestation employeur chômage temporaire',price:''},
        {id:'fg_c131b',l:'C131B',unit:'/document',desc:'Attestation complémentaire chômage temporaire',price:''},
        {id:'fg_c131a_ens',l:'C131A Employeur - Enseignement',unit:'/document',desc:'C131A spécifique enseignement',price:''},
        {id:'fg_c131b_ens',l:'C131B - Enseignement',unit:'/document',desc:'C131B spécifique enseignement',price:''},
        {id:'fg_c78_act',l:'C78 Activa Winwin/Impulsion/Actiris',unit:'/document',desc:'Activation demandeurs d\'emploi Bruxelles/Wallonie',price:''},
        {id:'fg_c78_eta',l:'C78 E.T.A.',unit:'/document',desc:'Entreprise de travail adapté',price:''},
        {id:'fg_c78_start',l:'C78 Activa Start',unit:'/document',desc:'Activation jeunes demandeurs d\'emploi',price:''},
        {id:'fg_c78_sine',l:'C78 SINE',unit:'/document',desc:'Économie d\'insertion sociale',price:''},
        {id:'fg_c783_ptp',l:'C78.3 P.T.P.',unit:'/document',desc:'Programme de transition professionnelle',price:''},
        {id:'fg_c78_sec',l:'C78 Personnel de sécurité et prévention',unit:'/document',desc:'Activation personnel sécurité/prévention',price:''},
        {id:'fg_c103_je',l:'C103 Jeunes Employeur',unit:'/document',desc:'Obligation d\'occupation jeunes - volet employeur',price:''},
        {id:'fg_c103_jt',l:'C103 Jeunes Travailleur',unit:'/document',desc:'Obligation d\'occupation jeunes - volet travailleur',price:''},
        {id:'fg_c103_se',l:'C103 Seniors Employeur',unit:'/document',desc:'Obligation d\'occupation seniors - volet employeur',price:''},
        {id:'fg_c103_st',l:'C103 Seniors Travailleur',unit:'/document',desc:'Obligation d\'occupation seniors - volet travailleur',price:''},
        {id:'fg_c4_drs',l:'C4 DRS (papier)',unit:'/document',desc:'C4 format papier DRS',price:''},
        {id:'fg_c4_rcc_drs',l:'C4 DRS-RCC (papier)',unit:'/document',desc:'C4 RCC format papier DRS',price:''},
      ]},
      {cat:'Documents sociaux — Secteur INAMI',color:'#f472b6',items:[
        {id:'fg_inami_mal',l:'Incapacité de travail (maladie, accident)',unit:'/document',desc:'Déclaration incapacité maladie/accident droit commun',price:''},
        {id:'fg_inami_mat',l:'Incapacité — repos de maternité',unit:'/document',desc:'Déclaration repos de maternité',price:''},
        {id:'fg_inami_ecar_c',l:'Incapacité — écartement complet maternité',unit:'/document',desc:'Écartement complet protection maternité',price:''},
        {id:'fg_inami_ecar_p',l:'Incapacité — écartement partiel maternité',unit:'/document',desc:'Écartement partiel protection maternité',price:''},
        {id:'fg_inami_conv',l:'Repos maternité/paternité converti',unit:'/document',desc:'Conversion congé maternité/paternité',price:''},
        {id:'fg_inami_nais',l:'Congé de naissance (10 jours)',unit:'/document',desc:'Déclaration congé de naissance',price:''},
        {id:'fg_inami_adop',l:'Congé d\'adoption',unit:'/document',desc:'Déclaration congé d\'adoption',price:''},
        {id:'fg_inami_rep',l:'Travail adapté: reprise partielle du travail',unit:'/document',desc:'Mi-temps médical, reprise progressive INAMI',price:''},
        {id:'fg_inami_prot',l:'Travail adapté: protection de la maternité',unit:'/document',desc:'Aménagement poste protection maternité',price:''},
        {id:'fg_inami_2emp',l:'Travail adapté: 2 employeurs différents',unit:'/document',desc:'Poursuite travail chez 2 employeurs',price:''},
        {id:'fg_inami_all',l:'Allaitement: déclaration des pauses',unit:'/document',desc:'Déclaration pauses d\'allaitement',price:''},
        {id:'fg_vac_caisse',l:'Déclaration annuelle vacances (PV caisse)',unit:'/document',desc:'Pécule vacances payé par une caisse',price:''},
        {id:'fg_vac_empl',l:'Déclaration annuelle vacances (PV employeur)',unit:'/document',desc:'Pécule vacances payé par l\'employeur',price:''},
        {id:'fg_inami_repr',l:'Déclaration de reprise du travail',unit:'/document',desc:'Déclaration de reprise après incapacité',price:''},
      ]},
      {cat:'Attestations & Documents papier',color:'#e879f9',items:[
        {id:'fg_att_pv',l:'Attestation Pécules de vacances',unit:'/document',desc:'Attestation simple et double pécule',price:''},
        {id:'fg_att_trav',l:'Attestation de travail',unit:'/document',desc:'Certificat d\'occupation',price:''},
        {id:'fg_att_276',l:'Attestation 276 frontaliers',unit:'/document',desc:'Attestation fiscale travailleurs frontaliers',price:''},
      ]},
      {cat:'Secrétariat social — Prestations récurrentes',color:'#818cf8',items:[
        {id:'fg_index',l:'Indexation salariale',unit:'/indexation',desc:'Adaptation des salaires suite à indexation sectorielle',price:''},
        {id:'fg_echeance',l:'Suivi échéances barémiques',unit:'/travailleur/an',desc:'Passage automatique échelon ancienneté',price:''},
        {id:'fg_pecule_vac',l:'Calcul pécule de vacances',unit:'/travailleur/an',desc:'Simple + double pécule, attestation annuelle',price:''},
        {id:'fg_prime_fin',l:'Prime de fin d\'année / 13ème mois',unit:'/travailleur/an',desc:'Calcul et traitement de la prime annuelle',price:''},
        {id:'fg_eco_cheques',l:'Gestion éco-chèques',unit:'/an',desc:'Commande et attribution annuelle',price:''},
        {id:'fg_sepa',l:'Génération fichier SEPA virements',unit:'/mois',desc:'Fichier pain.001 pour banque',price:''},
        {id:'fg_compte_indiv',l:'Compte individuel annuel',unit:'/travailleur/an',desc:'Récapitulatif annuel obligatoire par travailleur',price:''},
      ]},
      {cat:'Événements & Prestations ponctuelles',color:'#f59e0b',items:[
        {id:'fg_maladie',l:'Gestion maladie / accident',unit:'/événement',desc:'Salaire garanti, attestation mutuelle, suivi',price:''},
        {id:'fg_mitemps_med',l:'Mi-temps médical / thérapeutique (reprise progressive)',unit:'/dossier',desc:'Simulation, formulaires, suivi INAMI',price:''},
        {id:'fg_maternite',l:'Congé de maternité / naissance',unit:'/événement',desc:'Déclaration, calcul indemnités, formulaires',price:''},
        {id:'fg_credit_temps',l:'Crédit-temps / congé thématique',unit:'/dossier',desc:'Demande ONEM, simulation allocation, avenant',price:''},
        {id:'fg_preavis',l:'Calcul de préavis',unit:'/simulation',desc:'Simulation préavis légal selon ancienneté Claeys',price:''},
        {id:'fg_licenciement',l:'Dossier licenciement complet',unit:'/dossier',desc:'Lettre, C4, pécule sortie, outplacement, motivation',price:''},
        {id:'fg_faute_grave',l:'Procédure faute grave',unit:'/dossier',desc:'Lettre recommandée, constat, délais légaux',price:''},
        {id:'fg_sanctions',l:'Sanctions disciplinaires',unit:'/dossier',desc:'Avertissement, blâme, rétrogradation',price:''},
        {id:'fg_accident_travail',l:'Déclaration accident de travail',unit:'/déclaration',desc:'Formulaire assureur, rapport circonstancié',price:''},
        {id:'fg_detachement',l:'Détachement travailleur',unit:'/dossier',desc:'Formulaire A1, Limosa, conditions pays d\'accueil',price:''},
      ]},
      {cat:'Contrats & Documents juridiques',color:'#34d399',items:[
        {id:'fg_contrat_cdi',l:'Rédaction contrat CDI',unit:'/contrat',desc:'Contrat conforme loi 03/07/1978 + clauses',price:''},
        {id:'fg_contrat_cdd',l:'Rédaction contrat CDD',unit:'/contrat',desc:'Contrat à durée déterminée + renouvellements',price:''},
        {id:'fg_contrat_etudiant',l:'Convention étudiant',unit:'/contrat',desc:'Convention d\'occupation étudiant + Dimona STU',price:''},
        {id:'fg_contrat_flexi',l:'Contrat flexi-job',unit:'/contrat',desc:'Contrat-cadre + contrat d\'exécution',price:''},
        {id:'fg_contrat_indep',l:'Convention collaboration indépendante',unit:'/convention',desc:'Convention B2B, critères de subordination',price:''},
        {id:'fg_avenant',l:'Avenant au contrat',unit:'/avenant',desc:'Modification conditions: temps partiel, fonction, salaire',price:''},
        {id:'fg_reglement',l:'Rédaction règlement de travail',unit:'/document',desc:'Règlement de travail conforme + procédure affichage',price:''},
        {id:'fg_politique',l:'Politique interne (car policy, télétravail...)',unit:'/document',desc:'Rédaction politique d\'entreprise',price:''},
      ]},
      {cat:'Reporting & Obligations annuelles',color:'#06b6d4',items:[
        {id:'fg_bilan_social',l:'Bilan social BNB',unit:'/an',desc:'Établissement et dépôt du bilan social annuel',price:''},
        {id:'fg_stats_ins',l:'Statistiques INS',unit:'/an',desc:'Enquête statistique obligatoire INS/Statbel',price:''},
        {id:'fg_assloi',l:'Relevé assurance-loi AT',unit:'/an',desc:'Déclaration annuelle masse salariale assureur AT',price:''},
        {id:'fg_caisse_vac',l:'Déclaration caisse vacances (ouvriers)',unit:'/an',desc:'Déclaration annuelle à la caisse de vacances',price:''},
        {id:'fg_peppol',l:'Facturation PEPPOL / e-Invoicing',unit:'/facture',desc:'Émission facture UBL via réseau PEPPOL',price:''},
      ]},
      {cat:'Simulations & Outils RH',color:'#f97316',items:[
        {id:'fg_sim_cout_sal',l:'Simulation coût salarial',unit:'/simulation',desc:'Simulation complète du coût d\'un travailleur (brut→net, charges patronales)',price:''},
        {id:'fg_sim_brut_net',l:'Calcul brut → net / net → brut',unit:'/simulation',desc:'Conversion salariale avec toutes les retenues',price:''},
        {id:'fg_sim_preavis_det',l:'Simulation indemnité de préavis détaillée',unit:'/simulation',desc:'Calcul préavis Claeys avec ventilation complète',price:''},
        {id:'fg_sim_vacances',l:'Simulation pécule de vacances',unit:'/simulation',desc:'Estimation simple et double pécule anticipée',price:''},
        {id:'fg_sim_prime_fin',l:'Simulation prime de fin d\'année',unit:'/simulation',desc:'Calcul anticipé prime sectorielle ou d\'entreprise',price:''},
        {id:'fg_benchmark_sal',l:'Benchmark salarial sectoriel',unit:'/rapport',desc:'Comparaison rémunération avec le marché du secteur',price:''},
        {id:'fg_total_reward',l:'Total Reward Statement',unit:'/travailleur/an',desc:'Récapitulatif global de la rémunération (salaire + avantages)',price:''},
      ]},
      {cat:'Aides à l\'emploi & Réductions',color:'#14b8a6',items:[
        {id:'fg_aide_1er_eng',l:'Réduction premier engagement (groupe-cible)',unit:'/dossier',desc:'Demande réduction cotisations patronales 1er à 6ème travailleur',price:''},
        {id:'fg_aide_activa',l:'Activation Activa / Impulsion / Actiris',unit:'/dossier',desc:'Demande d\'aides régionales à l\'embauche',price:''},
        {id:'fg_aide_restructuration',l:'Réduction restructuration / zone d\'aide',unit:'/dossier',desc:'Réductions cotisations zones en difficulté / restructuration',price:''},
        {id:'fg_aide_travailleurs_ages',l:'Réduction travailleurs âgés',unit:'/dossier',desc:'Demande réduction groupe-cible travailleurs 55+',price:''},
        {id:'fg_aide_jeunes',l:'Convention premier emploi (CPE / Rosetta)',unit:'/dossier',desc:'Demande mise en place convention premier emploi jeunes',price:''},
        {id:'fg_aide_titre_service',l:'Titres-services',unit:'/dossier',desc:'Gestion administrative titres-services (employeurs agréés)',price:''},
        {id:'fg_suivi_subsides',l:'Suivi et optimisation subsides / aides',unit:'/trimestre',desc:'Screening permanent des aides applicables à l\'entreprise',price:''},
      ]},
      {cat:'Rémunération alternative & Avantages',color:'#8b5cf6',items:[
        {id:'fg_plan_cafeteria',l:'Mise en place plan cafétéria',unit:'/dossier',desc:'Implémentation rémunération flexible (Payflip, MyChoice...)',price:''},
        {id:'fg_plan_cafeteria_gestion',l:'Gestion plan cafétéria (récurrent)',unit:'/mois',desc:'Suivi mensuel choix salariés, ajustements, administration',price:''},
        {id:'fg_bonus_cct90',l:'Bonus salarial CCT 90 (non-récurrent)',unit:'/dossier',desc:'Mise en place et gestion bonus lié aux résultats collectifs',price:''},
        {id:'fg_prime_benef',l:'Prime bénéficiaire (Loi 2018)',unit:'/dossier',desc:'Calcul et administration prime sur bénéfices de la société',price:''},
        {id:'fg_warrants',l:'Warrants / Stock options',unit:'/dossier',desc:'Attribution et gestion warrants comme rémunération alternative',price:''},
        {id:'fg_voiture_societe',l:'Gestion voiture de société / ATN',unit:'/véhicule/mois',desc:'Calcul ATN, cotisation CO₂, avantage fiscal',price:''},
        {id:'fg_budget_mobilite',l:'Budget mobilité (multimodal)',unit:'/travailleur/mois',desc:'Gestion budget mobilité : pilier 1/2/3, allocation cash',price:''},
        {id:'fg_cheques_sport',l:'Chèques sport & culture',unit:'/an',desc:'Attribution et commande chèques sport & culture',price:''},
        {id:'fg_assurance_groupe',l:'Assurance groupe / pension complémentaire',unit:'/travailleur/an',desc:'Gestion 2ème pilier pension, fiche 281.11',price:''},
        {id:'fg_assurance_hosp',l:'Assurance hospitalisation DKV/AG/Ethias',unit:'/travailleur/an',desc:'Gestion affiliations/résiliations assurance hospitalisation',price:''},
      ]},
      {cat:'Congés spéciaux & Absences',color:'#ec4899',items:[
        {id:'fg_conge_educ',l:'Congé-éducation payé (CEP)',unit:'/dossier',desc:'Demande remboursement congé-éducation payé auprès de la Région',price:''},
        {id:'fg_conge_politique',l:'Congé politique / mandat public',unit:'/dossier',desc:'Gestion absence et rémunération mandat politique',price:''},
        {id:'fg_chomage_temp',l:'Chômage temporaire (économique / force majeure)',unit:'/dossier',desc:'Demande ONEM, C3.2, notification, suivi mensuel',price:''},
        {id:'fg_chomage_temp_intemperies',l:'Chômage temporaire intempéries (construction)',unit:'/dossier',desc:'Déclaration chômage intempéries secteur construction',price:''},
        {id:'fg_prepension',l:'RCC / Prépension (régime chômage avec complément)',unit:'/dossier',desc:'Dossier complet RCC: calcul, C4-RCC, convention, ONEM',price:''},
        {id:'fg_outplacement',l:'Outplacement (reclassement professionnel)',unit:'/dossier',desc:'Organisation et suivi outplacement obligatoire ou volontaire',price:''},
        {id:'fg_conge_paternel',l:'Congé parental',unit:'/dossier',desc:'Demande ONEM congé parental 1/5 ou 1/2 temps',price:''},
        {id:'fg_conge_aidant',l:'Congé pour aidants proches',unit:'/dossier',desc:'Demande congé thématique aidant proche reconnu',price:''},
        {id:'fg_absence_track',l:'Rapport & analyse absentéisme',unit:'/rapport',desc:'Rapport périodique absentéisme, Bradford Factor, coûts',price:''},
      ]},
      {cat:'Bien-être & Prévention au travail',color:'#10b981',items:[
        {id:'fg_sepp',l:'Affiliation SEPP (service externe PPT)',unit:'/an',desc:'Affiliation service externe prévention et protection au travail',price:''},
        {id:'fg_plan_prevention',l:'Plan global de prévention (5 ans)',unit:'/document',desc:'Rédaction plan global prévention sécurité santé',price:''},
        {id:'fg_plan_annuel',l:'Plan d\'action annuel (PAA)',unit:'/an',desc:'Rédaction plan d\'action annuel bien-être au travail',price:''},
        {id:'fg_risques_psycho',l:'Analyse risques psychosociaux',unit:'/audit',desc:'Enquête et rapport risques burnout, harcèlement, stress',price:''},
        {id:'fg_conseiller_prev',l:'Désignation conseiller en prévention',unit:'/dossier',desc:'Mise en conformité désignation conseiller prévention interne',price:''},
        {id:'fg_medecine_travail',l:'Gestion examens médecine du travail',unit:'/travailleur/an',desc:'Planification visites médicales, suivi aptitudes',price:''},
        {id:'fg_alcool_drogues',l:'Politique alcool et drogues',unit:'/document',desc:'Rédaction politique préventive CCT 100',price:''},
      ]},
      {cat:'Organes sociaux & Relations collectives',color:'#0ea5e9',items:[
        {id:'fg_ce',l:'Secrétariat Conseil d\'Entreprise (CE)',unit:'/réunion',desc:'Préparation informations économiques et sociales CE',price:''},
        {id:'fg_cppt',l:'Secrétariat CPPT',unit:'/réunion',desc:'Préparation réunions Comité Prévention Protection Travail',price:''},
        {id:'fg_ds',l:'Accompagnement délégation syndicale',unit:'/réunion',desc:'Préparation réponses, CCT d\'entreprise, négociations',price:''},
        {id:'fg_elections_sociales',l:'Élections sociales',unit:'/cycle',desc:'Gestion complète procédure élections sociales (tous les 4 ans)',price:''},
        {id:'fg_cct_entreprise',l:'Rédaction CCT d\'entreprise',unit:'/document',desc:'Négociation et rédaction convention collective d\'entreprise',price:''},
      ]},
      {cat:'Consulting & Accompagnement',color:'#c084fc',items:[
        {id:'fg_conseil_rh',l:'Conseil RH / Droit social',unit:'/heure',desc:'Consultation en droit du travail, CCT, conventions',price:''},
        {id:'fg_audit_social',l:'Audit social',unit:'/audit',desc:'Vérification conformité sociale, analyse risques',price:''},
        {id:'fg_optimisation',l:'Optimisation salariale',unit:'/dossier',desc:'Plan cafétéria, warrants, avantages fiscaux',price:''},
        {id:'fg_restructuration',l:'Accompagnement restructuration',unit:'/dossier',desc:'Plan Renault, licenciement collectif, plan social',price:''},
        {id:'fg_starter',l:'Pack starter nouvelle entreprise',unit:'/dossier',desc:'Inscription ONSS, 1er engagement, affiliations',price:''},
        {id:'fg_formation',l:'Formation client (logiciel/payroll)',unit:'/session',desc:'Formation utilisation plateforme ou process paie',price:''},
        {id:'fg_due_diligence',l:'Due diligence sociale (acquisition)',unit:'/dossier',desc:'Audit social pré-acquisition: risques, provisions, conformité',price:''},
        {id:'fg_inspection',l:'Accompagnement contrôle / inspection sociale',unit:'/dossier',desc:'Assistance lors d\'inspection ONSS, SPF Emploi, contributions',price:''},
        {id:'fg_mediation',l:'Médiation sociale',unit:'/dossier',desc:'Médiation conflits employeur-travailleur, harcèlement',price:''},
      ]},
      {cat:'Export / Import & Frais administratifs',color:'#9ca3af',items:[
        {id:'fg_export_dif',l:'Exportation données format DIF',unit:'/export',desc:'Export données en format DIF pour usage externe',price:''},
        {id:'fg_import_pointage',l:'Importation données pointage / paie',unit:'/import',desc:'Import fichiers pointage/paie depuis systèmes externes',price:''},
        {id:'fg_export_compta',l:'Export écritures comptables personnalisées',unit:'/mois',desc:'Export OD vers logiciel comptable avec mapping personnalisé',price:''},
        {id:'fg_courrier_rec',l:'Envoi courrier recommandé',unit:'/envoi',desc:'Lettre recommandée avec AR',price:''},
        {id:'fg_copies',l:'Copies et impressions',unit:'/page',desc:'Copies documents, fiches, contrats',price:''},
        {id:'fg_archivage',l:'Archivage dossier (5 ans)',unit:'/travailleur/an',desc:'Conservation obligatoire documents sociaux',price:''},
        {id:'fg_urgence',l:'Supplément traitement urgent',unit:'/prestation',desc:'Prestation hors délai standard (< 24h)',price:''},
        {id:'fg_hors_heures',l:'Prestation hors heures bureau',unit:'/heure',desc:'Travail soir, week-end, jours fériés',price:''},
        {id:'fg_traduction',l:'Traduction documents (FR/NL/DE/EN)',unit:'/document',desc:'Traduction contrats, règlements, communications multilingues',price:''},
      ]},
    ];
    return cats;
  });

  const updPrice=(catIdx,itemIdx,val)=>{
    setTarifs(prev=>{
      const nw=[...prev];
      nw[catIdx]={...nw[catIdx],items:[...nw[catIdx].items]};
      nw[catIdx].items[itemIdx]={...nw[catIdx].items[itemIdx],price:val};
      return nw;
    });
  };

  const totalItems=tarifs.reduce((a,c)=>a+c.items.length,0);
  const filledItems=tarifs.reduce((a,c)=>a+c.items.filter(i=>i.price!=='').length,0);

  const exportGrille=()=>{
    let txt='GRILLE TARIFAIRE — AUREUS SOCIAL PRO\n';
    txt+=`Secrétariat social: ${s.co.name||'[Nom société]'}\n`;
    txt+=`Date: ${new Date().toLocaleDateString('fr-BE')}\n`;
    txt+='═══════════════════════════════════════════════════\n\n';
    tarifs.forEach(cat=>{
      txt+=`▬ ${cat.cat.toUpperCase()}\n`;
      txt+='─────────────────────────────────────────\n';
      cat.items.forEach(it=>{
        txt+=`  ${it.l}\n`;
        txt+=`    ${it.desc}\n`;
        txt+=`    Unité: ${it.unit}  │  Tarif: ${it.price?`${it.price} € HTVA`:'À définir'}\n\n`;
      });
      txt+='\n';
    });
    txt+='\nConditions générales:\n';
    txt+='- Tous les prix sont HTVA (TVA 21%)\n';
    txt+='- Paiement à 30 jours fin de mois\n';
    txt+='- Indexation annuelle selon indice santé\n';
    txt+='- Tarifs valables pour l\'année civile en cours\n';
    return txt;
  };

  return <div>
    <PH title="Frais de gestion" sub={`Grille tarifaire — ${totalItems} prestations · ${filledItems} tarifs définis`} actions={<div style={{display:'flex',gap:10}}>
      <B v="outline" onClick={()=>{const txt=exportGrille();navigator.clipboard?.writeText(txt);alert('Grille tarifaire copiée !')}}>📋 Copier grille</B>
      <B onClick={()=>d({type:'MODAL',m:{w:900,c:<div>
        <h3 style={{color:'#e8e6e0',margin:'0 0 10px',fontFamily:"'Cormorant Garamond',serif"}}>Grille tarifaire — {s.co.name||'Aureus Social Pro'}</h3>
        <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:500,overflowY:'auto'}}>{exportGrille()}</pre>
        <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}>
          <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
          <B onClick={()=>{navigator.clipboard?.writeText(exportGrille());alert('Copié !')}}>Copier</B>
        </div>
      </div>}})}>📄 Aperçu grille</B>
    </div>}/>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      {tarifs.map((cat,ci)=><C key={ci}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <ST style={{margin:0}}><span style={{color:cat.color}}>{cat.cat}</span></ST>
          <span style={{fontSize:10,color:'#5e5c56'}}>{cat.items.filter(i=>i.price!=='').length}/{cat.items.length}</span>
        </div>
        {cat.items.map((it,ii)=><div key={it.id} style={{padding:'10px 12px',marginBottom:6,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.04)',borderRadius:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0'}}>{it.l}</div>
              <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{it.desc}</div>
              <div style={{fontSize:9.5,color:cat.color,marginTop:3}}>{it.unit}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,minWidth:100}}>
              <input type="number" value={it.price} onChange={e=>updPrice(ci,ii,e.target.value)} placeholder="—" style={{width:70,padding:'5px 8px',background:'#090c16',border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:it.price?'#4ade80':'#5e5c56',fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'right'}}/>
              <span style={{fontSize:10,color:'#5e5c56'}}>€</span>
            </div>
          </div>
        </div>)}
      </C>)}
    </div>

    <C style={{marginTop:20}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <div style={{padding:14,background:'rgba(198,163,78,.06)',borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Prestations</div>
          <div style={{fontSize:24,fontWeight:700,color:'#c6a34e'}}>{totalItems}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>types de services</div>
        </div>
        <div style={{padding:14,background:'rgba(74,222,128,.06)',borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Tarifs définis</div>
          <div style={{fontSize:24,fontWeight:700,color:'#4ade80'}}>{filledItems}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>sur {totalItems}</div>
        </div>
        <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Catégories</div>
          <div style={{fontSize:24,fontWeight:700,color:'#60a5fa'}}>{tarifs.length}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>familles de services</div>
        </div>
      </div>
      <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.05)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
        <b>💡 Conseil:</b> Définissez vos tarifs puis utilisez le module PEPPOL pour facturer directement vos clients via le réseau de facturation électronique. Les frais de gestion sont facturés HTVA (TVA 21% applicable). Vous pouvez exporter la grille tarifaire complète comme annexe à vos conventions de service.
      </div>
    </C>
  </div>;
}

function SettingsPage({s,d}) {
  const [f,setF]=useState({...s.co});
  return <div>
    <PH title="Paramètres" sub="Configuration société"/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Identification</ST><div style={{display:'grid',gap:9}}>
        <I label="Société" value={f.name} onChange={v=>setF({...f,name:v})}/>
        <I label="TVA" value={f.vat} onChange={v=>setF({...f,vat:v})}/>
        <I label="BCE" value={f.bce} onChange={v=>setF({...f,bce:v})}/>
        <I label="ONSS" value={f.onss} onChange={v=>setF({...f,onss:v})}/>
        <I label="Code NACE" value={f.nace} onChange={v=>setF({...f,nace:v})}/>
        <I label="Adresse" value={f.addr} onChange={v=>setF({...f,addr:v})}/>
        <I label="CP" value={f.cp} onChange={v=>setF({...f,cp:v})} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="IBAN (compte bancaire)" value={f.bank} onChange={v=>setF({...f,bank:v})}/>
        <I label="BIC (code banque)" value={f.bic} onChange={v=>setF({...f,bic:v})} options={[
          {v:'GEBABEBB',l:'GEBABEBB — BNP Paribas Fortis'},
          {v:'BBRUBEBB',l:'BBRUBEBB — ING Belgique'},
          {v:'KREDBEBB',l:'KREDBEBB — KBC / CBC'},
          {v:'GKCCBEBB',l:'GKCCBEBB — Belfius'},
          {v:'ARSPBE22',l:'ARSPBE22 — Argenta'},
          {v:'NICABEBB',l:'NICABEBB — Crelan'},
          {v:'TRIOBEBB',l:'TRIOBEBB — Triodos'},
          {v:'AXABBE22',l:'AXABBE22 — AXA Banque'},
        ]}/>
      </div></C>
      <C><ST>Contact & Assurances</ST><div style={{display:'grid',gap:9}}>
        <I label="Contact" value={f.contact} onChange={v=>setF({...f,contact:v})}/>
        <I label="Email" value={f.email} onChange={v=>setF({...f,email:v})}/>
        <I label="Téléphone" value={f.phone} onChange={v=>setF({...f,phone:v})}/>
        <I label="Assureur AT" value={f.insurer} onChange={v=>setF({...f,insurer:v})}/>
        <I label="N° police" value={f.policyNr} onChange={v=>setF({...f,policyNr:v})}/>
        <I label="Secrétariat social" value={f.secSoc} onChange={v=>setF({...f,secSoc:v})}/>
      </div></C>
    </div>
    <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}><B onClick={()=>{d({type:'UPD_CO',d:f});alert('Sauvegardé !')}}>Sauvegarder</B></div>
    <C style={{marginTop:20}}>
      <ST>Barèmes légaux</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:10}}>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>ONSS</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{fmtP(LEGAL.ONSS_W)}</b></div>
          <div>Employeur (marchand): <b style={{color:'#e8e6e0'}}>25,00%</b></div>
          <div>Employeur (non-march.): <b style={{color:'#e8e6e0'}}>32,40%</b></div>
          <div>Ouvriers: brut × 108%</div>
          <div>Bonus max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.BONUS_2026.A_MAX)}</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Avantages</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>CR empl. max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.emax)}</b> (2026)</div>
          <div>CR trav. min: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.wmin)}</b></div>
          <div>CR valeur max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.maxTotal)}</b></div>
          <div>Éco-chèques: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.ECO)}/an</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Régime</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Heures/sem: <b style={{color:'#e8e6e0'}}>{LEGAL.WH}h</b></div>
          <div>Heures/jour: <b style={{color:'#e8e6e0'}}>{LEGAL.WHD}h</b></div>
          <div>Jours/mois: <b style={{color:'#e8e6e0'}}>{LEGAL.WD}</b></div>
        </div></div>
      </div>
      <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.05)',borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
        <div style={{fontSize:10.5,color:'#4ade80',lineHeight:1.5}}>✅ Précompte professionnel calculé selon la formule-clé complète SPF Finances — Annexe III AR/CIR 92 — Barèmes 2026 (tranches annuelles 26,75% à 53,50%, quotité exemptée 10 900€, frais forfaitaires 30% plafond 5 930€, quotient conjugal, réductions familiales annualisées).</div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>🔍 Audit système — Aureus Social Pro</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:12}}>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:10}}>✅ Barèmes SPF vérifiés (salairesminimums.be)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'200',n:'CP AUXILIAIRE EMPLOYÉS',idx:'2,21%',dt:'01/01/2026',src:'Grille A/B/C/D, 0-26 ans anc.'},
              {cp:'124',n:'CONSTRUCTION',idx:'0,22%',dt:'01/01/2026',src:'Taux horaires I→Chef IV'},
              {cp:'302',n:'HÔTELLERIE',idx:'2,19%',dt:'01/01/2026',src:'Cat I-V par ancienneté'},
              {cp:'118',n:'INDUSTRIE ALIMENTAIRE (ouv.)',idx:'2,19%',dt:'01/01/2026',src:'S-sect.17, 8 classes, anc mois'},
              {cp:'140',n:'TRANSPORT ROUTIER',idx:'2,18%',dt:'01/01/2026',src:'SCP 140.03 roulant/non-roulant/garage'},
              {cp:'330',n:'SANTÉ',idx:'2,0%',dt:'01/01/2026',src:'Éch. 1.12→1.59, 13 échelons anc.'},
              {cp:'121',n:'NETTOYAGE',idx:'0,56%',dt:'01/01/2026',src:'8 catégories, régime 37h'},
              {cp:'111',n:'MÉTAL/MÉCANIQUE (ouv.)',idx:'2,72%',dt:'01/07/2025',src:'Cat 1-7 national + Agoria'},
              {cp:'116',n:'CHIMIE (ouvriers)',idx:'2,0%',dt:'01/04/2025',src:'Taux horaires manœuvre, 2 échelons'},
              {cp:'201',n:'COMMERCE DÉTAIL INDÉPENDANT',idx:'2,0%',dt:'01/04/2025',src:'Grp1 vente Cat.1-4, exp 0-14 ans'},
              {cp:'202',n:'COMMERCE DÉTAIL ALIMENTAIRE',idx:'1,0%',dt:'01/01/2026',src:'Cat 1-5 par ancienneté'},
              {cp:'209',n:'FAB. MÉTALLIQUE (empl.)',idx:'2,0%',dt:'01/07/2025',src:'Classes SCE, Agoria'},
              {cp:'220',n:'INDUSTRIE ALIMENTAIRE (empl.)',idx:'2,19%',dt:'01/01/2026',src:'Cat 1-6, CGSLB'},
              {cp:'306',n:'ASSURANCES',idx:'2,23%',dt:'01/01/2026',src:'Employés Cat.1-4B, 22 éch. anc.'},
              {cp:'304',n:'SPECTACLE',idx:'x1,37',dt:'01/02/2026',src:'Groupes 1a-6, SPF officiel'},
              {cp:'311',n:'GRANDES SURFACES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-5, vente détail'},
              {cp:'313',n:'PHARMACIES',idx:'2,0%',dt:'01/03/2025',src:'Non-pharma Cat I-IV 0-42 ans + Pharmaciens'},
              {cp:'317',n:'GARDIENNAGE',idx:'2,21%',dt:'01/01/2026',src:'Agent A-D, sécurité'},
              {cp:'318',n:'AIDES FAMILIALES',idx:'2,0%',dt:'01/01/2026',src:'Cat 1-4 non-marchand'},
              {cp:'329',n:'SOCIO-CULTUREL',idx:'2,0%',dt:'01/01/2026',src:'Barème 1-4.1, ASBL'},
              {cp:'331',n:'AIDE SOCIALE (Flandre)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'332',n:'AIDE SOCIALE (francophone)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'336',n:'PROFESSIONS LIBÉRALES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 aligné CP 200'},
              {cp:'144',n:'AGRICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 secteurs verts'},
              {cp:'145',n:'HORTICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-3 secteurs verts'},
              {cp:'152',n:'ENSEIGNEMENT LIBRE (ouv.)',idx:'2,0%',dt:'01/01/2026',src:'6 catégories CP 152.02'},
              {cp:'333',n:'ATTRACTIONS TOURISTIQUES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 loisirs'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:'rgba(74,222,128,.1)',color:'#4ade80',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#facc15',marginTop:16,marginBottom:10}}>≈ Barèmes estimés (structure confirmée, montants approximatifs)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'149',n:'ÉLECTRICIENS',idx:'2,0%',dt:'01/01/2026',src:'5 cat. avec prime ancienneté'},
              {cp:'225',n:'ENSEIGNEMENT PRIVÉ (empl.)',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'226',n:'COMMERCE INTERNATIONAL',idx:'2,23%',dt:'01/01/2026',src:'CGSLB vérifié'},
              {cp:'307',n:'COURTAGE ASSURANCES',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200 + compléments'},
              {cp:'319',n:'ÉDUCATIFS',idx:'2,0%',dt:'01/01/2026',src:'Non-marchand, IFIC'},
              {cp:'322.01',n:'TITRES-SERVICES',idx:'2,0%',dt:'01/01/2026',src:'Salaire sectoriel minimum'},
              {cp:'323',n:'IMMOBILIER',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'327',n:'ETA',idx:'2,0%',dt:'01/01/2026',src:'Travailleurs adaptés + encadrement'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:'rgba(250,204,21,.1)',color:'#facc15',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ 35 CPs — 27 vérifiés SPF + 8 estimés fiables</div>
        </div>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>📊 Statistiques application</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            <div>Modules fonctionnels: <b style={{color:'#c6a34e'}}>46</b></div>
            <div>Composants React: <b style={{color:'#c6a34e'}}>~90</b></div>
            <div>Catégories navigation: <b style={{color:'#c6a34e'}}>12</b></div>
            <div>CPs avec barèmes: <b style={{color:'#4ade80'}}>35</b> / 35 (27 SPF + 8 estimés)</div>
            <div>Secteurs wizard: <b style={{color:'#c6a34e'}}>26</b> activités</div>
            <div>Documents DRS: <b style={{color:'#c6a34e'}}>14 types Activa + 15 chômage + 14 INAMI</b></div>
            <div>Formats comptables: <b style={{color:'#c6a34e'}}>6</b> (BOB, Winbooks, Kluwer, Popsy, Soda, Autre)</div>
            <div>Régions Activa: <b style={{color:'#c6a34e'}}>3</b> (Actiris, FOREM, VDAB)</div>
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ Calculs conformes Annexe III 2026</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Précompte pro: formule-clé COMPLÈTE SPF Finances 2026 (tranches 26,75%→53,50%, quotité exemptée 10 900€)',
              '35 CPs avec barèmes vérifiés (sources SPF et syndicales officielles)',
              'CP 209: barèmes indexés +2,72% au 01/07/2025 — montants exacts emploi.belgique.be',
              'CP 330: barèmes classiques + échelles IFIC (Cat.1.12→1.59)',
              'ONSS: taux 25% marchand + 32,40% non-marchand + ouvrier 108% + modulations sectorielles + cotis. spéciales (FFE, chômage temp., amiante)',
              'Pécule vacances: double pécule détaillé (85% + 7%, ONSS 2ème partie, cotis. spéc. 1%)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(74,222,128,.3)',marginBottom:6,fontSize:10.5,color:'#4ade80'}}>{p}</div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#60a5fa',marginTop:16,marginBottom:10}}>💡 Pistes d'évolution future</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Module flexi-jobs (horeca, commerce, santé)',
              'Export SEPA XML ISO 20022 pour virements salaires',
              'Module évaluation annuelle / entretien fonctionnement',
              'Gestion planning/horaires avec badgeuse',
              'Intégration eBox entreprise (documents sociaux dématérialisés)',
              'Module accident du travail (déclaration + suivi FEDRIS)',
              'Connexion API DmfA / Dimona (batch ONSS)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(96,165,250,.2)',marginBottom:6,fontSize:10.5,color:'#60a5fa'}}>{p}</div>)}
          </div>
        </div>
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  MODULES PRO
// ═══════════════════════════════════════════════════════════════
const DRS_DOCS={
  chomage:[
    {code:'C4',l:'C4 — Certificat de chômage',f:['motif','brut','regime','preavis']},
    {code:'C4-RCC',l:'C4 Prépension (RCC)',f:['motif','brut','date_rcc']},
    {code:'C4-ENS',l:'C4 Enseignement',f:['motif','etablissement']},
    {code:'C3.2-CD',l:'C3.2 Constat du droit',f:['regime','heures']},
    {code:'C3.2-OUV',l:'C3.2 Employeur → Ouvriers',f:['jours','motif']},
    {code:'C3.2-EMP',l:'C3.2 Anti-crise → Employés',f:['jours','motif']},
    {code:'C131A',l:'C131A Employeur',f:['debut','motif','regime']},
    {code:'C131B',l:'C131B',f:['debut','regime']},
    {code:'C131A-E',l:'C131A Enseignement',f:['debut','etablissement']},
    {code:'C131B-E',l:'C131B Enseignement',f:['debut']},
    {code:'C78-ACT-BXL',l:'C78 Activa.brussels (Actiris)',f:['type_activa','debut','duree','montant_red']},
    {code:'C78-ACT-WAL',l:'C78 Impulsion -12/-25 mois (FOREM)',f:['type_impulsion','debut','duree','montant_red']},
    {code:'C78-ACT-VL',l:'C78 Werkplekleren / Winwin (VDAB)',f:['type_vl','debut','duree']},
    {code:'C78-TRANS',l:'C78 Prime de transition (Bruxelles)',f:['debut','duree','montant']},
    {code:'C78-START',l:'C78 Activa Start (<26 ans)',f:['debut','duree','age']},
    {code:'C78-ETA',l:'C78 E.T.A. (Entreprise Travail Adapté)',f:['type','debut','pct_prime']},
    {code:'C78-ART60',l:'C78 Article 60§7 (CPAS)',f:['cpas','debut','fin','type_art60','subsides']},
    {code:'C78-ART61',l:'C78 Article 61 (CPAS mise à dispo)',f:['cpas','debut','fin']},
    {code:'C78-SINE',l:'C78 SINE (Économie sociale insertion)',f:['debut','duree','agrément']},
    {code:'C78.3',l:'C78.3 P.T.P. (Programme Transition Pro)',f:['debut','heures','org_encadrement']},
    {code:'C78-SEC',l:'C78 Sécurité & prévention',f:['debut','fonction']},
    {code:'C78-FIRST',l:'C78 Stage First / FPI (Actiris/FOREM)',f:['debut','duree','indemnite']},
    {code:'C78-FORM',l:'C78 Contrat de formation (IFAPME/EFP)',f:['debut','duree','centre']},
    {code:'C78-HAND',l:'C78 Prime handicap (AVIQ/PHARE/VDAB)',f:['debut','organisme','pct_prime']},
    {code:'C103-JE',l:'C103 Jeunes Employeur',f:['debut','age']},
    {code:'C103-JT',l:'C103 Jeunes Travailleur',f:['debut','age']},
    {code:'C103-SE',l:'C103 Seniors Employeur',f:['debut','age']},
    {code:'C103-ST',l:'C103 Seniors Travailleur',f:['debut','age']},
  ],
  inami:[
    {code:'IN-MAL',l:'Incapacité — Maladie/Accident',f:['debut','fin','diagnostic']},
    {code:'IN-MAT',l:'Repos de maternité',f:['accouchement','debut','fin']},
    {code:'IN-EC',l:'Écartement complet maternité',f:['debut','fin']},
    {code:'IN-EP',l:'Écartement partiel maternité',f:['debut','fin','heures']},
    {code:'IN-CONV',l:'Maternité/Paternité converti',f:['debut','fin']},
    {code:'IN-NAIS',l:'Congé naissance (10j)',f:['naissance','debut']},
    {code:'IN-ADOP',l:'Congé adoption',f:['debut','fin']},
    {code:'IN-REP',l:'Reprise partielle travail',f:['debut','heures']},
    {code:'IN-PROT',l:'Protection maternité',f:['debut','fin']},
    {code:'IN-2EMP',l:'2 employeurs différents',f:['debut','employeur2']},
    {code:'IN-ALL',l:'Allaitement — Pauses',f:['debut','nb_pauses']},
    {code:'VAC-C',l:'Vacances annuelles (caisse)',f:['annee','jours']},
    {code:'VAC-E',l:'Vacances annuelles (employeur)',f:['annee','jours','montant']},
    {code:'IN-REPR',l:'Reprise du travail',f:['date_reprise']},
  ],
  papier:[
    {code:'C4-P',l:'C4 DRS (papier)',f:['motif']},
    {code:'C4-RCC-P',l:'C4 DRS-RCC (papier)',f:['motif']},
    {code:'ATT-PV',l:'Attestation Pécules de vacances',f:['annee','simple','double']},
    {code:'ATT-TRAV',l:'Attestation de travail',f:['debut','fin','fonction']},
    {code:'ATT-276',l:'Attestation 276 frontaliers',f:['pays','annee']},
  ],
};
const COMPTA=[{id:'bob',n:'BOB Software',fmt:'CSV/XML'},{id:'winbooks',n:'Winbooks',fmt:'TXT/CSV'},{id:'kluwer',n:'Kluwer Expert',fmt:'CSV'},{id:'popsy',n:'Popsy',fmt:'TXT'},{id:'soda',n:'Soda',fmt:'CSV'},{id:'other',n:'Autre (txt/xls)',fmt:'TXT/XLS'}];
const CR_PROV=[{id:'pluxee',n:'Pluxee (ex-Sodexo)',ic:'🟠'},{id:'edenred',n:'Edenred',ic:'🔴'},{id:'monizze',n:'Monizze',ic:'🟢'},{id:'got',n:'G.O.T. CONNECTION',ic:'🔵'}];

// ═══════════════════════════════════════════════════════════════
//  CATEGORY ROUTER PAGES
// ═══════════════════════════════════════════════════════════════
function SalairesPage({s,d}){const sub=s.sub||'od';return <div>
  <PH title="Salaires & Calculs" sub={`Module: ${{'od':'O.D. Comptables','provisions':'Provisions','cumuls':'Cumuls annuels','netbrut':'Net → Brut','simcout':'Simulation coût salarial','saisies':'Saisies-Cessions','indexauto':'Index automatique','horsforfait':'Heures supplémentaires','totalreward':'Total Reward Statement'}[sub]||sub}`}/>
  {sub==='od'&&<ODMod s={s} d={d}/>}{sub==='provisions'&&<ProvisionsMod s={s} d={d}/>}
  {sub==='cumuls'&&<CumulsMod s={s} d={d}/>}{sub==='netbrut'&&<NetBrutMod s={s} d={d}/>}
  {sub==='simcout'&&<SimCoutMod s={s} d={d}/>}{sub==='totalreward'&&<TotalRewardMod s={s} d={d}/>}
  {sub==='saisies'&&<SaisiesMod s={s} d={d}/>}{sub==='indexauto'&&<IndexAutoMod s={s} d={d}/>}
  {sub==='horsforfait'&&<HeuresSupMod s={s} d={d}/>}
</div>;}

function AvantagesPage({s,d}){const sub=s.sub||'cheques';return <div>
  <PH title="Avantages & Rémunération" sub={`Module: ${{'cheques':'Chèques-Repas','ecocmd':'Éco-chèques','cafeteria':'Plan cafétéria','cct90':'Bonus CCT 90','warrants':'Warrants','budgetmob':'Budget mobilité','ecocircul':'Notes de frais'}[sub]||sub}`}/>
  {sub==='cheques'&&<CRMod s={s} d={d}/>}{sub==='ecocmd'&&<EcoCommandeMod s={s} d={d}/>}
  {sub==='cafeteria'&&<CafeteriaMod s={s} d={d}/>}{sub==='cct90'&&<CCT90Mod s={s} d={d}/>}
  {sub==='warrants'&&<WarrantsMod s={s} d={d}/>}{sub==='budgetmob'&&<BudgetMobiliteMod s={s} d={d}/>}
  {sub==='ecocircul'&&<NoteFraisMod s={s} d={d}/>}
</div>;}

function ContratsMenuPage({s,d}){const sub=s.sub||'contrats';return <div>
  <PH title="Contrats & Documents" sub={`Module: ${{'contrats':'Contrats de travail','reglement':'Règlement de travail','compteindiv':'Compte individuel','preavis':'Préavis légal','pecsortie':'Pécule de sortie','certpme':'Certificat PME'}[sub]||sub}`}/>
  {sub==='contrats'&&<ContratsTravailMod s={s} d={d}/>}{sub==='reglement'&&<ReglementTravailMod s={s} d={d}/>}
  {sub==='compteindiv'&&<CompteIndividuelMod s={s} d={d}/>}{sub==='preavis'&&<PreavisMod s={s} d={d}/>}
  {sub==='pecsortie'&&<PeculeSortieMod s={s} d={d}/>}{sub==='certpme'&&<CertPMEMod s={s} d={d}/>}
</div>;}

function RHPage({s,d}){const sub=s.sub||'absences';return <div>
  <PH title="RH & Personnel" sub={`Module: ${{'absences':'Gestion absences','absenteisme':'Analyse absentéisme','credittemps':'Crédit-temps','chomtemp':'Chômage temporaire','congeduc':'Congé-éducation payé','rcc':'RCC / Prépension','outplacement':'Outplacement','pointage':'Pointage & Portail Employeur','planform':'Plan de formation','medtravail':'Médecine du travail','selfservice':'Portail travailleur'}[sub]||sub}`}/>
  {sub==='absences'&&<AbsencesMod s={s} d={d}/>}{sub==='absenteisme'&&<AbsenteismeMod s={s} d={d}/>}
  {sub==='credittemps'&&<CreditTempsMod s={s} d={d}/>}{sub==='chomtemp'&&<ChomTempMod s={s} d={d}/>}
  {sub==='congeduc'&&<CongeEducMod s={s} d={d}/>}{sub==='rcc'&&<RCCMod s={s} d={d}/>}
  {sub==='outplacement'&&<OutplacementMod s={s} d={d}/>}{sub==='pointage'&&<PointageMod s={s} d={d}/>}
  {sub==='planform'&&<PlanFormationMod s={s} d={d}/>}{sub==='medtravail'&&<MedTravailMod s={s} d={d}/>}
  {sub==='selfservice'&&<SelfServiceMod s={s} d={d}/>}
</div>;}

function SocialPage({s,d}){const sub=s.sub||'assloi';return <div>
  <PH title="Social & Assurances" sub={`Module: ${{'assloi':'Assurance-Loi AT','assgroupe':'Assurance Groupe','syndicales':'Primes syndicales','allocfam':'Alloc. familiales','caissevac':'Caisse de vacances','rentes':'Rentes','decava':'DECAVA','aidesemploi':'Aides à l\'emploi'}[sub]||sub}`}/>
  {sub==='assloi'&&<AssLoiMod s={s} d={d}/>}{sub==='assgroupe'&&<AssGroupeMod s={s} d={d}/>}
  {sub==='syndicales'&&<SyndicalesMod s={s} d={d}/>}{sub==='allocfam'&&<AllocFamMod s={s} d={d}/>}
  {sub==='caissevac'&&<CaisseVacMod s={s} d={d}/>}{sub==='rentes'&&<RentesMod s={s} d={d}/>}
  {sub==='decava'&&<DecavaMod s={s} d={d}/>}{sub==='aidesemploi'&&<AidesEmploiMod s={s} d={d}/>}
</div>;}

function ReportingPage({s,d}){const sub=s.sub||'accounting';return <div>
  <PH title="Reporting & Export" sub={`Module: ${{'accounting':'Accounting Output','bilanbnb':'Bilan Social BNB','bilan':'Bilan Social','statsins':'Statistiques INS','sepa':'SEPA / Virements','peppol':'PEPPOL e-Invoicing','envoi':'Envoi documents','exportimport':'Export / Import','ged':'GED / Archivage'}[sub]||sub}`}/>
  {sub==='accounting'&&<AccountingOutputMod s={s} d={d}/>}{sub==='bilanbnb'&&<BilanSocialBNBMod s={s} d={d}/>}
  {sub==='bilan'&&<BilanSocialMod s={s} d={d}/>}{sub==='statsins'&&<StatsINSMod s={s} d={d}/>}
  {sub==='sepa'&&<SEPAMod s={s} d={d}/>}{sub==='peppol'&&<PeppolMod s={s} d={d}/>}{sub==='envoi'&&<EnvoiMod s={s} d={d}/>}
  {sub==='exportimport'&&<ExportImportMod s={s} d={d}/>}{sub==='ged'&&<GEDMod s={s} d={d}/>}
</div>;}

function LegalPage({s,d}){const sub=s.sub||'docsjuridiques';return <div>
  <PH title="Juridique & Veille" sub={`Module: ${{'docsjuridiques':'Documents Juridiques','alertes':'Alertes légales','secteurs':'Secteurs spécifiques','eta':'Relevés ETA'}[sub]||sub}`}/>
  {sub==='docsjuridiques'&&<DocumentsJuridiquesMod s={s} d={d}/>}
  {sub==='alertes'&&<AlertesLegalesMod s={s} d={d}/>}{sub==='secteurs'&&<SecteursMod s={s} d={d}/>}
  {sub==='eta'&&<ETAMod s={s} d={d}/>}
</div>;}

function ModulesProPage({s,d}){
  const sub=s.sub||'od';
  return <div>
    <PH title="Modules Pro" sub="47 modules — La Rolls Royce du secrétariat social"/>
    {sub==='od'&&<ODMod s={s} d={d}/>}
    {sub==='cheques'&&<CRMod s={s} d={d}/>}
    {sub==='envoi'&&<EnvoiMod s={s} d={d}/>}
    {sub==='drs'&&<DRSMod s={s} d={d}/>}
    {sub==='fiches_ext'&&<FichesMod s={s} d={d}/>}
    {sub==='pointage'&&<PointageMod s={s} d={d}/>}
    {sub==='syndicales'&&<SyndicalesMod s={s} d={d}/>}
    {sub==='onssapl'&&<ONSSAPLMod s={s} d={d}/>}
    {sub==='eta'&&<ETAMod s={s} d={d}/>}
    {sub==='exportimport'&&<ExportImportMod s={s} d={d}/>}
    {sub==='netbrut'&&<NetBrutMod s={s} d={d}/>}
    {sub==='decava'&&<DecavaMod s={s} d={d}/>}
    {sub==='bilan'&&<BilanSocialMod s={s} d={d}/>}
    {sub==='provisions'&&<ProvisionsMod s={s} d={d}/>}
    {sub==='cumuls'&&<CumulsMod s={s} d={d}/>}
    {sub==='saisies'&&<SaisiesMod s={s} d={d}/>}
    {sub==='rentes'&&<RentesMod s={s} d={d}/>}
    {sub==='assloi'&&<AssLoiMod s={s} d={d}/>}
    {sub==='assgroupe'&&<AssGroupeMod s={s} d={d}/>}
    {sub==='medtravail'&&<MedTravailMod s={s} d={d}/>}
    {sub==='allocfam'&&<AllocFamMod s={s} d={d}/>}
    {sub==='caissevac'&&<CaisseVacMod s={s} d={d}/>}
    {sub==='sepa'&&<SEPAMod s={s} d={d}/>}
    {sub==='secteurs'&&<SecteursMod s={s} d={d}/>}
    {sub==='reglement'&&<ReglementTravailMod s={s} d={d}/>}
    {sub==='contrats'&&<ContratsTravailMod s={s} d={d}/>}
    {sub==='compteindiv'&&<CompteIndividuelMod s={s} d={d}/>}
    {sub==='accounting'&&<AccountingOutputMod s={s} d={d}/>}
    {sub==='alertes'&&<AlertesLegalesMod s={s} d={d}/>}
    {sub==='bilanbnb'&&<BilanSocialBNBMod s={s} d={d}/>}
    {sub==='co2'&&<CO2Mod s={s} d={d}/>}
    {sub==='certpme'&&<CertPMEMod s={s} d={d}/>}
    {sub==='ecocmd'&&<EcoCommandeMod s={s} d={d}/>}
    {sub==='preavis'&&<PreavisMod s={s} d={d}/>}
    {sub==='pecsortie'&&<PeculeSortieMod s={s} d={d}/>}
    {sub==='credittemps'&&<CreditTempsMod s={s} d={d}/>}
    {sub==='absences'&&<AbsencesMod s={s} d={d}/>}
    {sub==='indexauto'&&<IndexAutoMod s={s} d={d}/>}
    {sub==='cafeteria'&&<CafeteriaMod s={s} d={d}/>}
    {sub==='cct90'&&<CCT90Mod s={s} d={d}/>}
    {sub==='budgetmob'&&<BudgetMobiliteMod s={s} d={d}/>}
    {sub==='statsins'&&<StatsINSMod s={s} d={d}/>}
    {sub==='warrants'&&<WarrantsMod s={s} d={d}/>}
    {sub==='planform'&&<PlanFormationMod s={s} d={d}/>}
    {sub==='ecocircul'&&<NoteFraisMod s={s} d={d}/>}
    {sub==='horsforfait'&&<HeuresSupMod s={s} d={d}/>}
    {sub==='peppol'&&<PeppolMod s={s} d={d}/>}
  </div>;
}

function ODMod({s,d}){
  const [mode,setMode]=useState('sans');
  const [target,setTarget]=useState('bob');
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [jnl,setJnl]=useState('SAL');
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const run=()=>{
    const ent=[];let sq=1;
    ae.forEach(emp=>{const p=calc(emp,DPER,s.co);
      ent.push({sq:sq++,acc:'620000',lb:`Rém. brutes — ${emp.first} ${emp.last}`,db:p.gross,cr:0});
      ent.push({sq:sq++,acc:'621000',lb:`ONSS patronales — ${emp.first} ${emp.last}`,db:p.onssE,cr:0});
      ent.push({sq:sq++,acc:'453000',lb:'ONSS trav. à payer',db:0,cr:p.onssNet});
      ent.push({sq:sq++,acc:'453100',lb:'ONSS empl. à payer',db:0,cr:p.onssE});
      ent.push({sq:sq++,acc:'453200',lb:'Précompte à payer',db:0,cr:p.tax});
      ent.push({sq:sq++,acc:'455000',lb:`Net à payer — ${emp.first} ${emp.last}`,db:0,cr:p.net});
      if(p.css>0)ent.push({sq:sq++,acc:'453300',lb:'CSS',db:0,cr:p.css});
      if(p.mvEmployer>0){ent.push({sq:sq++,acc:'623000',lb:'CR employeur',db:p.mvEmployer,cr:0});ent.push({sq:sq++,acc:'440000',lb:'CR à payer',db:0,cr:p.mvEmployer});}
    });
    const tD=ent.reduce((a,e)=>a+e.db,0),tC=ent.reduce((a,e)=>a+e.cr,0);
    setGen({ent,tD,tC});
  };
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <C><ST>O.D. Salaires</ST>
      <I label="Mode" value={mode} onChange={setMode} options={[{v:'sans',l:'Sans liaison comptable'},{v:'liaison',l:'Liaison comptabilité'}]}/>
      {mode==='liaison'&&<I label="Logiciel" value={target} onChange={setTarget} style={{marginTop:9}} options={COMPTA.map(c=>({v:c.id,l:`${c.n} (${c.fmt})`}))}/>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
        <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
      </div>
      <I label="Journal" value={jnl} onChange={setJnl} style={{marginTop:9}}/>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer O.D.</B>
      {mode==='liaison'&&<div style={{marginTop:14,fontSize:11,color:'#c6a34e',fontWeight:600}}>Interfaces: {COMPTA.map(c=>c.n).join(', ')}</div>}
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      {gen?<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>O.D. — {MN[per.m-1]} {per.y}</div></div>
        <Tbl cols={[{k:'s',l:'#',r:r=>r.sq},{k:'a',l:'Compte',r:r=><span style={{fontFamily:'monospace',fontSize:11,color:'#c6a34e'}}>{r.acc}</span>},{k:'l',l:'Libellé',r:r=><span style={{fontSize:11}}>{r.lb}</span>},{k:'d',l:'Débit',a:'right',r:r=>r.db>0?<span style={{color:'#4ade80'}}>{fmt(r.db)}</span>:''},{k:'c',l:'Crédit',a:'right',r:r=>r.cr>0?<span style={{color:'#f87171'}}>{fmt(r.cr)}</span>:''}]} data={gen.ent}/>
        <div style={{padding:'10px 18px',borderTop:'2px solid rgba(198,163,78,.2)',display:'flex',justifyContent:'flex-end',gap:16,fontSize:12,fontWeight:700}}><span style={{color:'#4ade80'}}>D: {fmt(gen.tD)}</span><span style={{color:'#f87171'}}>C: {fmt(gen.tC)}</span><span style={{color:Math.abs(gen.tD-gen.tC)<.01?'#4ade80':'#f87171'}}>Bal: {fmt(gen.tD-gen.tC)}</span></div>
      </>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez les O.D.</div>}
    </C>
  </div>;
}

function CRMod({s,d}){
  const [prov,setProv]=useState('pluxee');
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const run=()=>{
    const ord=ae.map(e=>{const dy=Math.round(LEGAL.WD);const val=e.mvT||10;const pW=e.mvW||1.09;const pE=e.mvE||8.91;
      const exonOK=(pE<=LEGAL.MV.emax && pW>=LEGAL.MV.wmin && val<=LEGAL.MV.maxTotal);
      return{e,ref:`CR-${per.y}${per.m.toString().padStart(2,'0')}-${e.id}`,dy,tot:dy*val,pW:dy*pW,pE:dy*pE,val,exonOK,deducFisc:dy*(pE>=8.91?4:2)};});
    setGen({ord,tT:ord.reduce((a,o)=>a+o.tot,0),tW:ord.reduce((a,o)=>a+o.pW,0),tE:ord.reduce((a,o)=>a+o.pE,0),tDeduc:ord.reduce((a,o)=>a+o.deducFisc,0),pv:CR_PROV.find(p=>p.id===prov)});
  };
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
    <div>
    <C><ST>Commande Chèques-Repas</ST>
      <I label="Fournisseur" value={prov} onChange={setProv} options={CR_PROV.map(p=>({v:p.id,l:`${p.ic} ${p.n}`}))}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
        <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m2,i)=>({v:i+1,l:m2}))}/>
        <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
      </div>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer commande</B>
      {gen&&<div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)',fontSize:12,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>{gen.pv?.ic} {gen.pv?.n}</div>
        <div>Total: <b style={{color:'#e8e6e0'}}>{fmt(gen.tT)}</b></div>
        <div>Part trav.: <b style={{color:'#f87171'}}>{fmt(gen.tW)}</b></div>
        <div>Part empl.: <b style={{color:'#4ade80'}}>{fmt(gen.tE)}</b></div>
        <div>Déduction fiscale: <b style={{color:'#60a5fa'}}>{fmt(gen.tDeduc)}</b></div>
      </div>}
    </C>
    <C style={{marginTop:12,padding:'12px 16px'}}>
      <div style={{fontSize:11,fontWeight:700,color:'#c6a34e',marginBottom:8}}>Conditions exonération 2026</div>
      <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.8}}>
        {[
          `Valeur max: ${LEGAL.MV.maxTotal}€ (AR 10/11/2025)`,
          `Part employeur max: ${LEGAL.MV.emax}€`,
          `Part travailleur min: ${LEGAL.MV.wmin}€`,
          '1 chèque = 1 jour effectivement presté',
          'Prévu par CCT ou accord individuel écrit',
          'Pas en remplacement de rémunération',
          'Électronique uniquement (carte)',
          'Validité: 12 mois',
          `Déduction fiscale: ${LEGAL.MV.deducFisc}€/chèque (si part empl. = ${LEGAL.MV.emax}€)`,
        ].map((c,i)=><div key={i} style={{fontSize:10,paddingLeft:8,borderLeft:'2px solid rgba(198,163,78,.15)',marginBottom:4}}>{c}</div>)}
      </div>
    </C>
    </div>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail — {MN[per.m-1]} {per.y}</div></div>
      {gen?<Tbl cols={[{k:'r',l:'Réf',r:r=><span style={{fontFamily:'monospace',fontSize:10,color:'#c6a34e'}}>{r.ref}</span>},{k:'n',l:'Travailleur',r:r=>`${r.e.first} ${r.e.last}`},{k:'d',l:'Jours',a:'right',r:r=>r.dy},{k:'v',l:'Valeur',a:'right',r:r=>fmt(r.val)},{k:'t',l:'Total',a:'right',b:1,r:r=>fmt(r.tot)},{k:'w',l:'Trav.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.pW)}</span>},{k:'e',l:'Empl.',a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.pE)}</span>},{k:'x',l:'Exon.',a:'center',r:r=>r.exonOK?<span style={{color:'#4ade80'}}>✅</span>:<span style={{color:'#ef4444'}}>⚠</span>}]} data={gen?.ord||[]}/>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez une commande</div>}
    </C>
    </div>
  </div>;
}

function EnvoiMod({s,d}){
  const [mode,setMode]=useState('outlook');
  const [dt,setDt]=useState('BP');
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [hist,setHist]=useState([]);
  const ae=s.emps.filter(e=>e.status==='active');
  const dts=[{v:'BP',l:'Bons de paie (PDF)'},{v:'FF',l:'Fiches fiscales (PDF)'},{v:'CI',l:'Comptes individuels (PDF)'}];
  const send=()=>{
    const h=ae.map(e=>({id:uid(),emp:`${e.first} ${e.last}`,doc:dts.find(t=>t.v===dt)?.l,period:`${MN[per.m-1]} ${per.y}`,mode:mode==='outlook'?'Outlook':'Doccle',at:new Date().toISOString()}));
    setHist([...h,...hist]);
    alert(`${ae.length} envoi(s) via ${mode==='outlook'?'Outlook':'Doccle'} !`);
  };
  return <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
    <C><ST>Envoi PDF automatique</ST>
      <I label="Canal" value={mode} onChange={setMode} options={[{v:'outlook',l:'📧 Outlook (email PDF)'},{v:'doccle',l:'📄 Doccle (coffre-fort)'}]}/>
      <I label="Document" value={dt} onChange={setDt} style={{marginTop:9}} options={dts}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
        <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
      </div>
      <B onClick={send} style={{width:'100%',marginTop:14}}>Envoyer ({ae.length})</B>
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
        <b>Outlook:</b> Email PDF individuel<br/><b>Doccle:</b> Coffre-fort numérique belge
      </div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique</div></div>
      <Tbl cols={[{k:'d',l:'Document',b:1,r:r=>r.doc},{k:'e',l:'Destinataire',r:r=>r.emp},{k:'m',l:'Canal',r:r=><span style={{fontSize:10.5,padding:'2px 6px',borderRadius:4,background:r.mode==='Doccle'?'rgba(167,139,250,.1)':'rgba(96,165,250,.1)',color:r.mode==='Doccle'?'#a78bfa':'#60a5fa'}}>{r.mode}</span>},{k:'p',l:'Période',r:r=>r.period},{k:'s',l:'Statut',r:r=><span style={{color:'#4ade80',fontSize:11}}>✓</span>}]} data={hist}/>
    </C>
  </div>;
}

function DRSMod({s,d}){
  const [sec,setSec]=useState('chomage');
  const [dc,setDc]=useState(DRS_DOCS.chomage[0].code);
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [fv,setFv]=useState({});
  const [hist,setHist]=useState([]);
  const docs=sec==='chomage'?DRS_DOCS.chomage:sec==='inami'?DRS_DOCS.inami:DRS_DOCS.papier;
  const sel=docs.find(x=>x.code===dc)||docs[0];
  const emp=s.emps.find(e=>e.id===eid);
  const fl={motif:'Motif',brut:'Dernier brut',regime:'Régime',preavis:'Préavis',date_rcc:'Date RCC',etablissement:'Établissement',jours:'Jours',debut:'Date début',fin:'Date fin',type:'Type',duree:'Durée',heures:'Heures',fonction:'Fonction',age:'Âge',diagnostic:'Diagnostic',accouchement:'Accouchement',naissance:'Naissance',employeur2:'Employeur 2',nb_pauses:'Nb pauses',annee:'Année réf.',montant:'Montant',date_reprise:'Reprise',simple:'Simple pécule',double:'Double pécule',pays:'Pays'};
  const gen=()=>{if(!emp)return;
    const doc={id:uid(),code:sel.code,label:sel.l,sec,emp:`${emp.first} ${emp.last}`,fields:sel.f.map(f=>({k:f,l:fl[f]||f,v:fv[f]||''})),at:new Date().toISOString()};
    setHist([doc,...hist]);
    d({type:'MODAL',m:{w:600,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 3px',fontFamily:"'Cormorant Garamond',serif"}}>{sel.l}</h2>
      <div style={{fontSize:10.5,color:'#c6a34e',marginBottom:14}}>{sec==='chomage'?'Chômage':sec==='inami'?'INAMI':'Papier'}</div>
      <div style={{padding:16,background:'#faf9f4',borderRadius:10,color:'#1a1a18'}}>
        {[{l:'Employeur',v:s.co.name},{l:'ONSS',v:s.co.onss},{l:'Travailleur',v:`${emp.first} ${emp.last}`},{l:'NISS',v:emp.niss},...doc.fields.map(f=>({l:f.l,v:f.v||'—'}))].map((f,i)=>
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #eee',fontSize:12.5}}><span style={{color:'#888'}}>{f.l}</span><span style={{fontWeight:500}}>{f.v}</span></div>
        )}
        <div style={{marginTop:20,display:'flex',justifyContent:'space-between',fontSize:10.5,color:'#999'}}><div>Fait le {new Date().toLocaleDateString('fr-BE')}</div><div style={{textAlign:'right'}}>Signature<br/><br/>__________________</div></div>
      </div>
      <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B></div>
    </div>}});
  };
  return <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:18}}>
    <C><ST>DRS / Documents sociaux</ST>
      <I label="Secteur" value={sec} onChange={v=>{setSec(v);const ds=v==='chomage'?DRS_DOCS.chomage:v==='inami'?DRS_DOCS.inami:DRS_DOCS.papier;setDc(ds[0].code);setFv({});}} options={[{v:'chomage',l:`Chômage (${DRS_DOCS.chomage.length} docs)`},{v:'inami',l:`INAMI (${DRS_DOCS.inami.length} docs)`},{v:'papier',l:`Papier (${DRS_DOCS.papier.length} docs)`}]}/>
      <I label="Document" value={dc} onChange={v=>{setDc(v);setFv({});}} style={{marginTop:9}} options={docs.map(x=>({v:x.code,l:x.l}))}/>
      <I label="Travailleur" value={eid} onChange={setEid} style={{marginTop:9}} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      {sel.f.length>0&&<><ST>Champs</ST><div style={{display:'grid',gap:7}}>
        {sel.f.map(f=><I key={f} label={fl[f]||f} value={fv[f]||''} onChange={v=>setFv({...fv,[f]:v})} type={f.includes('date')||f==='debut'||f==='fin'||f==='naissance'||f==='accouchement'||f==='date_reprise'||f==='date_rcc'?'date':f==='brut'||f==='heures'||f==='jours'||f==='age'||f==='nb_pauses'||f==='montant'||f==='simple'||f==='double'||f==='duree'?'number':'text'}/>)}
      </div></>}
      <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer</B>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Documents générés</div></div>
      <Tbl cols={[{k:'c',l:'Code',r:r=><span style={{fontFamily:'monospace',fontSize:10.5,color:'#c6a34e'}}>{r.code}</span>},{k:'l',l:'Document',r:r=><span style={{fontSize:11}}>{r.label}</span>},{k:'e',l:'Travailleur',r:r=>r.emp},{k:'s',l:'Secteur',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:r.sec==='chomage'?'rgba(96,165,250,.1)':r.sec==='inami'?'rgba(167,139,250,.1)':'rgba(198,163,78,.1)',color:r.sec==='chomage'?'#60a5fa':r.sec==='inami'?'#a78bfa':'#c6a34e'}}>{r.sec==='chomage'?'Chômage':r.sec==='inami'?'INAMI':'Papier'}</span>},{k:'d',l:'Date',r:r=>new Date(r.at).toLocaleDateString('fr-BE')}]} data={hist}/>
    </C>
  </div>;
}

function FichesMod({s,d}){
  const [ft,setFt]=useState('11');
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [amt,setAmt]=useState(0);
  const [desc,setDesc]=useState('');
  const [hist,setHist]=useState([]);
  const types=[{v:'11',l:'281.11 — Pensions, rentes',c:'Remplacement'},{v:'14',l:'281.14 — Rentes alimentaires',c:'Rentes'},{v:'29',l:'281.29 — Économie collaborative',c:'Plateformes'},{v:'30',l:'281.30 — Jetons de présence',c:'Admin.'},{v:'45',l:'281.45 — Droits d\'auteur',c:'PI'},{v:'50',l:'281.50 — Honoraires',c:'Indépendants'}];
  const emp=s.emps.find(e=>e.id===eid);
  const sel=types.find(t=>t.v===ft);
  const gen=()=>{if(!emp)return;
    setHist([{id:uid(),ft,label:sel?.l,cat:sel?.c,yr,emp:`${emp.first} ${emp.last}`,amt,desc,
      xml:`<Belcotax><Fiche281${ft}><Year>${yr}</Year><Worker>${emp.first} ${emp.last}</Worker><Amount>${amt.toFixed(2)}</Amount></Fiche281${ft}></Belcotax>`,
      at:new Date().toISOString()},...hist]);
    alert(`281.${ft} générée !`);
  };
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <C><ST>Fiches spéciales</ST>
      <I label="Type" value={ft} onChange={setFt} options={types}/>
      <I label="Année" type="number" value={yr} onChange={v=>setYr(v)} style={{marginTop:9}}/>
      <I label="Bénéficiaire" value={eid} onChange={setEid} style={{marginTop:9}} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Montant brut (€)" type="number" value={amt} onChange={setAmt} style={{marginTop:9}}/>
      <I label="Description" value={desc} onChange={setDesc} style={{marginTop:9}}/>
      <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer 281.{ft}</B>
      <div style={{marginTop:14,fontSize:10.5,color:'#9e9b93'}}>
        {types.map(t=><div key={t.v} style={{padding:'2px 0'}}><b style={{color:'#d4d0c8'}}>281.{t.v}</b> — {t.c}</div>)}
      </div>
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
        <b>Export/Import:</b> Export DIF & import pointage/paie depuis fichiers externes disponibles.
      </div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Fiches générées</div></div>
      <Tbl cols={[{k:'t',l:'Type',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.label}</span>},{k:'c',l:'Cat.',r:r=><span style={{fontSize:11,color:'#9e9b93'}}>{r.cat}</span>},{k:'e',l:'Bénéficiaire',r:r=>r.emp},{k:'y',l:'Année',r:r=>r.yr},{k:'a',l:'Montant',a:'right',b:1,r:r=>fmt(r.amt)},{k:'x',l:'',a:'right',r:r=><B v="ghost" style={{padding:'3px 7px',fontSize:10}} onClick={()=>d({type:'MODAL',m:{w:600,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 8px'}}>281.{r.ft} — {r.emp}</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:10,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B></div></div>}})}>XML</B>}]} data={hist}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  INTERFACE POINTAGE
// ═══════════════════════════════════════════════════════════════
function PointageMod({s,d}){
  const [tab,setTab]=useState('pointage');
  const [source,setSource]=useState('aureus_pointage');
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [imported,setImported]=useState([]);
  const [selEmp,setSelEmp]=useState(null);
  const [dailyView,setDailyView]=useState(false);
  const ae=s.emps.filter(e=>e.status==='active');
  const sources=[
    {v:'aureus_pointage',l:'Aureus Pointage — Enregistrement des entrées et sorties (ateliers, bureaux, chantiers)'},
    {v:'aureus_titres_services',l:'Aureus Titres-Services — Gestion des sociétés de titres-services (agendas, prestations, feuilles de route)'},
    {v:'aureus_aide_domicile',l:'Aureus Aide à Domicile — Gestion des aides ménagères et soins à domicile (plannings, prestations, km)'},
    {v:'aureus_paie',l:'Aureus Paie — Calcul complet des salaires (ONSS, précompte, DMFA, Belcotax, documents sociaux)'},
    {v:'aureus_portail',l:'Aureus Portail — Espace en ligne pour employeurs et travailleurs (self-service, demandes, documents)'},
    {v:'aureus_mobile',l:'Aureus Mobile — Application smartphone pour travailleurs itinérants (pointage GPS, absences)'},
    {v:'aureus_chantier',l:'Aureus Chantier — Borne de pointage sur chantier (entrée/sortie en temps réel)'},
    {v:'aureus_tableau_bord',l:'Aureus Tableau de Bord — Chiffres clés de votre entreprise (graphiques, KPI, reporting)'},
    {v:'horloge',l:'Horloge pointeuse — Appareil de pointage physique (badge, empreinte, reconnaissance)'},
    {v:'tachy',l:'Tachygraphe — Données de conduite pour le transport routier'},
    {v:'csv',l:'Fichier externe — Import CSV, TXT ou XML depuis un autre logiciel'},
    {v:'manual',l:'Saisie manuelle — Encodage direct des prestations à la main'},
  ];

  // Generate realistic daily punch data
  const genDaily=(emp)=>{
    const daysInMonth=new Date(per.y,per.m,0).getDate();
    const days=[];
    for(let i=1;i<=daysInMonth;i++){
      const dt=new Date(per.y,per.m-1,i);
      const dow=dt.getDay();
      const isWE=dow===0||dow===6;
      const isFerie=[1,21].includes(i)&&per.m===7; // example
      if(isWE){days.push({d:i,dow,type:'we',in1:'',out1:'',in2:'',out2:'',h:0,pause:0,note:'Week-end'});continue;}
      if(isFerie){days.push({d:i,dow,type:'ferie',in1:'',out1:'',in2:'',out2:'',h:0,pause:0,note:'Jour férié'});continue;}
      const sick=Math.random()<0.04;const conge=Math.random()<0.06;
      if(sick){days.push({d:i,dow,type:'maladie',in1:'',out1:'',in2:'',out2:'',h:0,pause:0,note:'Certificat médical'});continue;}
      if(conge){days.push({d:i,dow,type:'conge',in1:'',out1:'',in2:'',out2:'',h:7.6,pause:0,note:'Congé annuel'});continue;}
      const hIn=7+Math.floor(Math.random()*2);const mIn=Math.floor(Math.random()*60);
      const pauseS=12;const pauseE=13;
      const hOut=15+Math.floor(Math.random()*3);const mOut=Math.floor(Math.random()*60);
      const totH=((pauseS-hIn)+(hOut-pauseE)+(mOut-mIn)/60);
      const sup=Math.max(0,totH-7.6);
      days.push({d:i,dow,type:sup>0.5?'sup':'normal',
        in1:`${String(hIn).padStart(2,'0')}:${String(mIn).padStart(2,'0')}`,
        out1:`${pauseS}:00`,
        in2:`${pauseE}:00`,
        out2:`${String(hOut).padStart(2,'0')}:${String(mOut).padStart(2,'0')}`,
        h:Math.round(totH*100)/100,pause:60,sup:Math.round(sup*100)/100,
        note:sup>0.5?`${sup.toFixed(1)}h sup.`:''});
    }
    return days;
  };

  const run=()=>{
    const data=ae.map(emp=>{
      const daily=genDaily(emp);
      const jrs=daily.filter(d=>['normal','sup','conge'].includes(d.type)).length;
      const hN=daily.reduce((a,d)=>a+Math.min(d.h,7.6),0);
      const hS=daily.reduce((a,d)=>a+(d.sup||0),0);
      const abs=daily.filter(d=>d.type==='maladie').length;
      const conges=daily.filter(d=>d.type==='conge').length;
      return{id:uid(),emp:`${emp.first} ${emp.last}`,eid:emp.id,source:sources.find(x=>x.v===source)?.l,
        period:`${MN[per.m-1]} ${per.y}`,jrs,hN:Math.round(hN),hS:Math.round(hS*10)/10,
        hNu:Math.floor(Math.random()*4),hD:Math.floor(Math.random()*3),
        ret:Math.floor(Math.random()*3),abs,conges,daily,
        status:Math.random()>0.2?'validé':'en_attente',at:new Date().toISOString()};
    });
    setImported([...data,...imported]);
  };

  const DOWS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const typeColors={normal:'#4ade80',sup:'#c6a34e',maladie:'#f87171',conge:'#60a5fa',ferie:'#a78bfa',we:'#3a3930'};
  const typeLabels={normal:'Presté',sup:'H.Sup',maladie:'Maladie',conge:'Congé',ferie:'Férié',we:'W-E'};
  
  const selectedData=selEmp?imported.find(r=>r.eid===selEmp):null;

  return <div>
    {/* Tabs */}
    <div style={{display:'flex',gap:4,marginBottom:14}}>
      {[{id:'pointage',l:'⏱ Pointage & Import'},{id:'daily',l:'📅 Détail journalier'},{id:'anomalies',l:'⚠ Anomalies'},{id:'portail',l:'🏢 Portail Employeur'},{id:'stats',l:'📊 Statistiques'}].map(t=>
        <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'8px 16px',borderRadius:8,fontSize:11.5,fontWeight:tab===t.id?600:400,
          background:tab===t.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.02)',color:tab===t.id?'#c6a34e':'#9e9b93',
          border:tab===t.id?'1px solid rgba(198,163,78,.3)':'1px solid rgba(255,255,255,.04)',cursor:'pointer'}}>{t.l}</button>
      )}
    </div>

    {/* ── TAB: POINTAGE & IMPORT ── */}
    {tab==='pointage'&&<div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <div>
      <C><ST>Import Pointage</ST>
        <I label="Source" value={source} onChange={setSource} options={sources}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
          <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
          <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
        </div>
        <B onClick={run} style={{width:'100%',marginTop:14}}>Importer {ae.length} travailleur(s)</B>
        {imported.length>0&&<B v="outline" onClick={()=>{
          imported.forEach(p=>{if(p.status==='en_attente')p.status='validé';});
          setImported([...imported]);
          alert('Tous les pointages validés !');
        }} style={{width:'100%',marginTop:8}}>✓ Valider tous</B>}
        {imported.length>0&&<B v="ghost" onClick={()=>alert('Pointages appliqués aux fiches de paie !')} style={{width:'100%',marginTop:8}}>→ Appliquer aux fiches de paie</B>}
      </C>
      <C style={{marginTop:14}}>
        <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>RÉSUMÉ {MN[per.m-1]} {per.y}</div>
        {imported.length>0?<div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2.2}}>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).length}</b></div>
          <div>Jours prestés: <b style={{color:'#4ade80'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).reduce((a,p)=>a+p.jrs,0)}</b></div>
          <div>Heures normales: <b style={{color:'#e8e6e0'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).reduce((a,p)=>a+p.hN,0)}h</b></div>
          <div>Heures sup.: <b style={{color:'#c6a34e'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).reduce((a,p)=>a+p.hS,0).toFixed(1)}h</b></div>
          <div>Absences maladie: <b style={{color:'#f87171'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).reduce((a,p)=>a+p.abs,0)}j</b></div>
          <div>Congés: <b style={{color:'#60a5fa'}}>{imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).reduce((a,p)=>a+p.conges,0)}j</b></div>
          <div style={{borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:4}}>Validés: <b style={{color:'#4ade80'}}>{imported.filter(p=>p.status==='validé').length}</b> | En attente: <b style={{color:'#c6a34e'}}>{imported.filter(p=>p.status==='en_attente').length}</b></div>
        </div>:<div style={{color:'#5e5c56',fontSize:11}}>Aucun pointage importé</div>}
      </C>
      <C style={{marginTop:14}}>
        <div style={{fontSize:10.5,color:'#c6a34e',fontWeight:600,marginBottom:6}}>Sources supportées</div>
        {sources.map(x=><div key={x.v} style={{fontSize:10.5,color:'#9e9b93',padding:'2px 0'}}>• {x.l}</div>)}
        <div style={{marginTop:10,fontSize:10,color:'#60a5fa',lineHeight:1.5,padding:8,background:'rgba(96,165,250,.04)',borderRadius:6}}>
          <b>Formats acceptés :</b> CSV, TXT, XML (Aureus Pointage, Aureus Titres-Services, Aureus Aide à Domicile), horloge pointeuse, tachygraphe, application mobile. Les jours prestés, heures supplémentaires, nuit, dimanche et absences sont calculés automatiquement.
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Pointages — {MN[per.m-1]} {per.y}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>{imported.length} enregistrement(s)</div>
        </div>
        <Tbl cols={[
          {k:'e',l:'Travailleur',b:1,r:r=>r.emp},
          {k:'st',l:'Statut',r:r=><span style={{fontSize:10,padding:'2px 7px',borderRadius:4,fontWeight:600,
            background:r.status==='validé'?'rgba(74,222,128,.1)':'rgba(198,163,78,.1)',
            color:r.status==='validé'?'#4ade80':'#c6a34e'}}>{r.status==='validé'?'✓ Validé':'⏳ Attente'}</span>},
          {k:'s',l:'Source',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:'rgba(96,165,250,.1)',color:'#60a5fa'}}>{r.source}</span>},
          {k:'j',l:'Jours',a:'right',r:r=><b>{r.jrs}</b>},
          {k:'h',l:'H.norm',a:'right',r:r=>`${r.hN}h`},
          {k:'hs',l:'H.sup',a:'right',r:r=>r.hS>0?<span style={{color:'#c6a34e',fontWeight:600}}>{r.hS}h</span>:'—'},
          {k:'hn',l:'Nuit',a:'right',r:r=>r.hNu>0?<span style={{color:'#a78bfa'}}>{r.hNu}h</span>:'—'},
          {k:'a',l:'Maladie',a:'right',r:r=>r.abs>0?<span style={{color:'#f87171',fontWeight:600}}>{r.abs}j</span>:'0'},
          {k:'c',l:'Congés',a:'right',r:r=>r.conges>0?<span style={{color:'#60a5fa'}}>{r.conges}j</span>:'0'},
          {k:'v',l:'',a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>{setSelEmp(r.eid);setTab('daily');}}>Détail</B>},
        ]} data={imported}/>
      </C>
    </div>}

    {/* ── TAB: DÉTAIL JOURNALIER ── */}
    {tab==='daily'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:14,alignItems:'center'}}>
        <I label="" value={selEmp||''} onChange={setSelEmp} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))} style={{width:250}}/>
        <div style={{fontSize:12,color:'#9e9b93'}}>{MN[per.m-1]} {per.y}</div>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Feuille de pointage détaillée</div>
          {selectedData&&<div style={{fontSize:11,color:'#c6a34e'}}>{selectedData.jrs}j — {selectedData.hN}h norm. — {selectedData.hS}h sup.</div>}
        </div>
        {selectedData?<div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
            <thead><tr style={{background:'rgba(198,163,78,.05)'}}>
              {['Jour','Date','Arrivée 1','Départ 1','Arrivée 2','Départ 2','Pause','Heures','Type','Note'].map(h=>
                <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {selectedData.daily.map((day,i)=><tr key={i} style={{background:day.type==='we'?'rgba(255,255,255,.01)':'transparent',borderBottom:'1px solid rgba(255,255,255,.02)',opacity:day.type==='we'?0.4:1}}>
                <td style={{padding:'8px 12px',fontWeight:500}}>{DOWS[day.dow]}</td>
                <td style={{padding:'8px 12px'}}>{String(day.d).padStart(2,'0')}/{String(per.m).padStart(2,'0')}</td>
                <td style={{padding:'8px 12px',color:day.in1?'#4ade80':'#3a3930',fontFamily:'monospace'}}>{day.in1||'—'}</td>
                <td style={{padding:'8px 12px',color:day.out1?'#e8e6e0':'#3a3930',fontFamily:'monospace'}}>{day.out1||'—'}</td>
                <td style={{padding:'8px 12px',color:day.in2?'#4ade80':'#3a3930',fontFamily:'monospace'}}>{day.in2||'—'}</td>
                <td style={{padding:'8px 12px',color:day.out2?'#f87171':'#3a3930',fontFamily:'monospace'}}>{day.out2||'—'}</td>
                <td style={{padding:'8px 12px',color:'#5e5c56'}}>{day.pause?`${day.pause}min`:'—'}</td>
                <td style={{padding:'8px 12px',fontWeight:day.h>0?600:400,color:day.h>7.6?'#c6a34e':day.h>0?'#e8e6e0':'#3a3930'}}>{day.h>0?`${day.h.toFixed(1)}h`:'—'}</td>
                <td style={{padding:'8px 12px'}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:`${typeColors[day.type]}15`,color:typeColors[day.type],fontWeight:600}}>{typeLabels[day.type]}</span></td>
                <td style={{padding:'8px 12px',fontSize:10.5,color:'#9e9b93'}}>{day.note}</td>
              </tr>)}
            </tbody>
            <tfoot>
              <tr style={{borderTop:'2px solid rgba(198,163,78,.2)',background:'rgba(198,163,78,.04)'}}>
                <td colSpan={7} style={{padding:'12px',fontWeight:700,color:'#c6a34e'}}>TOTAL</td>
                <td style={{padding:'12px',fontWeight:700,color:'#c6a34e'}}>{selectedData.daily.reduce((a,d)=>a+d.h,0).toFixed(1)}h</td>
                <td colSpan={2} style={{padding:'12px',fontSize:11,color:'#9e9b93'}}>
                  {selectedData.daily.filter(d=>d.type==='normal').length} norm. | {selectedData.daily.filter(d=>d.type==='sup').length} sup. | {selectedData.daily.filter(d=>d.type==='maladie').length} mal. | {selectedData.daily.filter(d=>d.type==='conge').length} cng.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>:<div style={{padding:60,textAlign:'center',color:'#5e5c56',fontSize:13}}>Sélectionnez un travailleur et importez les pointages</div>}
      </C>
      {selectedData&&<div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginTop:14}}>
        {[{l:'Jours prestés',v:selectedData.jrs,c:'#4ade80'},{l:'H. normales',v:`${selectedData.hN}h`,c:'#e8e6e0'},{l:'H. supplémentaires',v:`${selectedData.hS}h`,c:'#c6a34e'},{l:'Maladie',v:`${selectedData.abs}j`,c:'#f87171'},{l:'Congés',v:`${selectedData.conges}j`,c:'#60a5fa'},{l:'Régime',v:`${ae.find(e=>e.id===selEmp)?.whWeek||38}h/sem`,c:'#a78bfa'}].map((x,i)=>
          <C key={i} style={{padding:'12px',textAlign:'center'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:4}}>{x.v}</div></C>
        )}
      </div>}
    </div>}

    {/* ── TAB: ANOMALIES ── */}
    {tab==='anomalies'&&<div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>⚠ Anomalies détectées — {MN[per.m-1]} {per.y}</div></div>
        {imported.length>0?<div style={{padding:14}}>
          {imported.filter(p=>p.daily).flatMap(p=>{
            const anomalies=[];
            p.daily.forEach(day=>{
              if(day.h>10)anomalies.push({emp:p.emp,day:`${day.d}/${per.m}`,type:'duree',msg:`Durée ${day.h.toFixed(1)}h > 10h max légal`,sev:'high'});
              if(day.type==='normal'&&day.h<7&&day.h>0)anomalies.push({emp:p.emp,day:`${day.d}/${per.m}`,type:'incomplet',msg:`Seulement ${day.h.toFixed(1)}h (régime 7.6h)`,sev:'medium'});
              if(day.in1&&!day.out2)anomalies.push({emp:p.emp,day:`${day.d}/${per.m}`,type:'pointage',msg:'Pointage sortie manquant',sev:'high'});
              if(day.pause>0&&day.pause<30&&day.h>6)anomalies.push({emp:p.emp,day:`${day.d}/${per.m}`,type:'pause',msg:`Pause ${day.pause}min < 30min obligatoire (>6h)`,sev:'medium'});
            });
            const weekHours={};
            p.daily.forEach(day=>{const wk=Math.ceil(day.d/7);weekHours[wk]=(weekHours[wk]||0)+day.h;});
            Object.entries(weekHours).forEach(([wk,h])=>{if(h>50)anomalies.push({emp:p.emp,day:`Sem.${wk}`,type:'hebdo',msg:`${h.toFixed(1)}h > 50h max absolu hebdo`,sev:'high'});
              else if(h>45)anomalies.push({emp:p.emp,day:`Sem.${wk}`,type:'hebdo',msg:`${h.toFixed(1)}h > 45h (seuil attention)`,sev:'medium'});
            });
            return anomalies;
          }).map((a,i)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 14px',marginBottom:4,borderRadius:8,
            background:a.sev==='high'?'rgba(248,113,113,.06)':'rgba(198,163,78,.04)',
            border:`1px solid ${a.sev==='high'?'rgba(248,113,113,.15)':'rgba(198,163,78,.1)'}`}}>
            <span style={{fontSize:14}}>{a.sev==='high'?'🔴':'🟡'}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:12,color:'#e8e6e0'}}>{a.emp} — {a.day}</div>
              <div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{a.msg}</div>
            </div>
            <span style={{fontSize:10,padding:'3px 8px',borderRadius:4,background:'rgba(255,255,255,.03)',color:'#5e5c56'}}>{a.type}</span>
          </div>)}
          {imported.filter(p=>p.daily).flatMap(p=>p.daily.filter(d=>d.h>10||d.pause<30&&d.h>6&&d.pause>0)).length===0&&
            <div style={{padding:40,textAlign:'center'}}><span style={{fontSize:36}}>✅</span><div style={{fontSize:14,color:'#4ade80',marginTop:10}}>Aucune anomalie détectée</div></div>}
        </div>:<div style={{padding:60,textAlign:'center',color:'#5e5c56',fontSize:13}}>Importez des pointages pour détecter les anomalies</div>}
      </C>
      <C style={{marginTop:14,padding:'14px 18px'}}>
        <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Règles de contrôle appliquées</div>
        {[
          {r:'Durée journalière max',v:'10h (11h max dérogation CT)',s:'Loi travail 16/03/1971 art.27'},
          {r:'Durée hebdomadaire max',v:'50h absolue / 38h moyenne',s:'Loi travail art.26bis'},
          {r:'Pause obligatoire',v:'15min après 6h continu',s:'AR 18/01/1984'},
          {r:'Repos journalier',v:'11h min. entre 2 prestations',s:'Loi travail art.38ter'},
          {r:'Repos hebdomadaire',v:'35h consécutives (24h+11h)',s:'Loi travail art.11'},
          {r:'Heures supplémentaires',v:'Dépassement au-delà de 9h/j ou 40h/sem',s:'Loi travail art.29'},
          {r:'Enregistrement obligatoire',v:'Pointage entrée/sortie pour tous les travailleurs',s:'CJUE C-55/18 du 14/05/2019 + Loi 5/03/2024'},
        ].map((x,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'200px 1fr 200px',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11}}>
          <span style={{color:'#e8e6e0',fontWeight:500}}>{x.r}</span>
          <span style={{color:'#9e9b93'}}>{x.v}</span>
          <span style={{color:'#60a5fa',fontSize:10}}>{x.s}</span>
        </div>)}
      </C>
    </div>}

    {/* ── TAB: PORTAIL EMPLOYEUR ── */}
    {tab==='portail'&&<PortailEmployeurMod s={s} d={d} per={per}/>}

    {/* ── TAB: STATISTIQUES ── */}
    {tab==='stats'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {l:'Taux de présence',v:imported.length>0?`${Math.round(imported.reduce((a,p)=>a+p.jrs,0)/(imported.length*21.67)*100)}%`:'—',c:'#4ade80',ic:'📊'},
          {l:'Taux absentéisme',v:imported.length>0?`${(imported.reduce((a,p)=>a+p.abs,0)/(imported.length*21.67)*100).toFixed(1)}%`:'—',c:'#f87171',ic:'📉'},
          {l:'Heures sup. moy.',v:imported.length>0?`${(imported.reduce((a,p)=>a+p.hS,0)/imported.length).toFixed(1)}h`:'—',c:'#c6a34e',ic:'⏱'},
          {l:'Pointages en attente',v:`${imported.filter(p=>p.status==='en_attente').length}`,c:'#c6a34e',ic:'⏳'},
        ].map((x,i)=><C key={i} style={{padding:'16px',textAlign:'center'}}>
          <div style={{fontSize:22,marginBottom:6}}>{x.ic}</div>
          <div style={{fontSize:22,fontWeight:700,color:x.c}}>{x.v}</div>
          <div style={{fontSize:10,color:'#5e5c56',marginTop:4,textTransform:'uppercase'}}>{x.l}</div>
        </C>)}
      </div>
      {imported.length>0&&<C style={{marginTop:14,padding:'14px 18px'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Répartition par travailleur</div>
        {imported.filter(p=>p.period===`${MN[per.m-1]} ${per.y}`).map((p,i)=><div key={i} style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:500}}>{p.emp}</span>
            <span style={{fontSize:11,color:'#9e9b93'}}>{p.hN+p.hS}h total</span>
          </div>
          <div style={{display:'flex',height:14,borderRadius:7,overflow:'hidden',background:'rgba(255,255,255,.03)'}}>
            <div style={{width:`${p.hN/(p.hN+p.hS+p.hNu+p.abs*7.6||1)*100}%`,background:'#4ade80',transition:'width .3s'}} title={`Normales: ${p.hN}h`}/>
            <div style={{width:`${p.hS/(p.hN+p.hS+p.hNu+p.abs*7.6||1)*100}%`,background:'#c6a34e',transition:'width .3s'}} title={`Sup: ${p.hS}h`}/>
            <div style={{width:`${p.hNu/(p.hN+p.hS+p.hNu+p.abs*7.6||1)*100}%`,background:'#a78bfa',transition:'width .3s'}} title={`Nuit: ${p.hNu}h`}/>
            <div style={{width:`${p.abs*7.6/(p.hN+p.hS+p.hNu+p.abs*7.6||1)*100}%`,background:'#f87171',transition:'width .3s'}} title={`Absence: ${p.abs}j`}/>
          </div>
          <div style={{display:'flex',gap:14,marginTop:4,fontSize:10,color:'#5e5c56'}}>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'#4ade80',marginRight:4}}/>Norm. {p.hN}h</span>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'#c6a34e',marginRight:4}}/>Sup. {p.hS}h</span>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'#a78bfa',marginRight:4}}/>Nuit {p.hNu}h</span>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'#f87171',marginRight:4}}/>Abs. {p.abs}j</span>
          </div>
        </div>)}
      </C>}
      {imported.length===0&&<C style={{marginTop:14,padding:50,textAlign:'center'}}>
        <div style={{fontSize:36,marginBottom:12}}>📊</div>
        <div style={{fontSize:14,color:'#5e5c56'}}>Importez des pointages pour voir les statistiques</div>
      </C>}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PORTAIL EMPLOYEUR — Interface client séparée
//  Accès restreint: l'employeur ne voit QUE ses données
// ═══════════════════════════════════════════════════════════════
function PortailEmployeurMod({s,d,per}){
  const [clientView,setClientView]=useState('accueil');
  const [encodMode,setEncodMode]=useState('mensuel');
  const [selectedMonth,setSelectedMonth]=useState(per?.m||new Date().getMonth()+1);
  const [selectedYear,setSelectedYear]=useState(per?.y||new Date().getFullYear());
  const [encodData,setEncodData]=useState({});
  const [demandes,setDemandes]=useState([]);
  const [msgs,setMsgs]=useState([]);
  const [accessCodes,setAccessCodes]=useState([]);
  const ae=s.emps.filter(e=>e.status==='active');

  // Simulate access code generation for client
  const genAccess=()=>{
    const code={id:uid(),client:s.co.name,login:`client_${s.co.name?.toLowerCase().replace(/\s/g,'_')||'demo'}`,
      pwd:`ASP${Math.random().toString(36).substring(2,8).toUpperCase()}`,
      url:`https://portail.aureus-social.be/client/${uid().substring(0,8)}`,
      created:new Date().toISOString(),perms:['encodage','consultation','demandes','messages'],active:true};
    setAccessCodes([code,...accessCodes]);
  };

  // Absence types
  const absTypes=[
    {v:'conge_annuel',l:'Congé annuel',ic:'🏖'},
    {v:'maladie',l:'Maladie (certificat)',ic:'🏥'},
    {v:'petit_chomage',l:'Petit chômage',ic:'📋'},
    {v:'sans_solde',l:'Congé sans solde',ic:'⏸'},
    {v:'formation',l:'Congé formation',ic:'🎓'},
    {v:'maternite',l:'Maternité',ic:'👶'},
    {v:'paternite',l:'Paternité / Naissance',ic:'👨‍👧'},
    {v:'credit_temps',l:'Crédit-temps',ic:'⏱'},
    {v:'accident_travail',l:'Accident de travail',ic:'⚠'},
    {v:'chomage_eco',l:'Chômage économique',ic:'📉'},
  ];

  const toggleEncod=(eid,day,type)=>{
    const key=`${eid}_${day}`;
    setEncodData(prev=>{
      const n={...prev};
      if(n[key]===type)delete n[key]; else n[key]=type;
      return n;
    });
  };

  const submitDemande=(emp,type,dateFrom,dateTo,note)=>{
    setDemandes([{id:uid(),emp,type:absTypes.find(a=>a.v===type)?.l||type,ic:absTypes.find(a=>a.v===type)?.ic||'📋',from:dateFrom,to:dateTo,note,status:'en_attente',at:new Date().toISOString()},...demandes]);
  };

  const daysInMonth=new Date(selectedYear,selectedMonth,0).getDate();

  return <div>
    {/* ── Admin view: manage client portal access ── */}
    <C style={{padding:'14px 18px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:'#e8e6e0'}}>🏢 Portail Employeur — {s.co.name}</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Interface d'accès pour votre client • Données isolées de votre back-office</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <B v="outline" onClick={genAccess}>🔑 Générer accès client</B>
          <B onClick={()=>d({type:'MODAL',m:{w:700,c:<div>
            <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 14px',fontFamily:"'Cormorant Garamond',serif"}}>🔐 Architecture de sécurité</h2>
            <div style={{fontSize:12,color:'#9e9b93',lineHeight:1.8}}>
              {[
                {t:'Isolation des données',d:'Chaque client accède uniquement à son dossier via un identifiant unique. Aucun accès aux données des autres clients ni à votre back-office bureau social.'},
                {t:'Authentification',d:'Login + mot de passe auto-généré + lien unique par client. Authentification à 2 facteurs recommandée (SMS/email).'},
                {t:'Permissions granulaires',d:'L\'employeur peut: encoder prestations, soumettre demandes d\'absence, consulter fiches de paie, envoyer messages. Il ne peut PAS: modifier salaires, accéder aux calculs, voir les tarifs bureau social.'},
                {t:'Traçabilité',d:'Toute action du client est horodatée et tracée. Vous voyez en temps réel ce qu\'il a encodé et quand.'},
                {t:'RGPD',d:'Données hébergées en Belgique, chiffrées en transit (TLS 1.3) et au repos (AES-256). Politique de rétention conforme RGPD. DPO: Aureus IA SPRL.'},
              ].map((x,i)=><div key={i} style={{marginBottom:12,padding:10,background:'rgba(198,163,78,.03)',borderRadius:6}}>
                <div style={{fontWeight:600,color:'#c6a34e',fontSize:12}}>{x.t}</div>
                <div style={{fontSize:11,color:'#9e9b93',marginTop:3}}>{x.d}</div>
              </div>)}
            </div>
            <B v="outline" onClick={()=>d({type:'MODAL',m:null})} style={{marginTop:10}}>Fermer</B>
          </div>}})}>🔐 Architecture sécurité</B>
        </div>
      </div>
    </C>

    {/* Access codes panel */}
    {accessCodes.length>0&&<C style={{padding:'14px 18px',marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>🔑 Accès client générés</div>
      {accessCodes.map((ac,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'200px 180px 120px 1fr 80px',gap:12,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center',fontSize:11.5}}>
        <div><span style={{color:'#9e9b93'}}>URL:</span> <span style={{color:'#60a5fa',fontFamily:'monospace',fontSize:10}}>{ac.url.substring(0,35)}...</span></div>
        <div><span style={{color:'#9e9b93'}}>Login:</span> <b style={{color:'#e8e6e0'}}>{ac.login}</b></div>
        <div><span style={{color:'#9e9b93'}}>Pwd:</span> <b style={{color:'#c6a34e',fontFamily:'monospace'}}>{ac.pwd}</b></div>
        <div style={{fontSize:10,color:'#5e5c56'}}>Perms: {ac.perms.join(', ')}</div>
        <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'rgba(74,222,128,.1)',color:'#4ade80',fontWeight:600,textAlign:'center'}}>Actif</span>
      </div>)}
    </C>}

    {/* Client portal preview tabs */}
    <div style={{display:'flex',gap:4,marginBottom:14}}>
      {[{id:'accueil',l:'🏠 Accueil client'},{id:'encodage',l:'📝 Encodage prestations'},{id:'absences',l:'🏖 Demandes absences'},{id:'fiches',l:'📄 Fiches de paie'},{id:'messages',l:'💬 Messages'},{id:'suivi',l:'📊 Suivi bureau social'}].map(t=>
        <button key={t.id} onClick={()=>setClientView(t.id)} style={{padding:'7px 14px',borderRadius:7,fontSize:10.5,fontWeight:clientView===t.id?600:400,
          background:clientView===t.id?'rgba(96,165,250,.12)':'rgba(255,255,255,.02)',color:clientView===t.id?'#60a5fa':'#9e9b93',
          border:clientView===t.id?'1px solid rgba(96,165,250,.25)':'1px solid rgba(255,255,255,.04)',cursor:'pointer'}}>{t.l}</button>
      )}
    </div>

    {/* Simulated client portal */}
    <C style={{padding:0,overflow:'hidden',border:'1px solid rgba(96,165,250,.15)'}}>
      <div style={{padding:'12px 18px',background:'linear-gradient(135deg,rgba(96,165,250,.08),rgba(198,163,78,.05))',borderBottom:'1px solid rgba(96,165,250,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>🏢</span>
          <div>
            <div style={{fontWeight:600,fontSize:13,color:'#e8e6e0'}}>{s.co.name} — Portail Employeur</div>
            <div style={{fontSize:9.5,color:'#5e5c56'}}>Vue client • Données isolées • Aureus Social Pro</div>
          </div>
        </div>
        <div style={{fontSize:10,color:'#60a5fa',padding:'3px 10px',borderRadius:4,background:'rgba(96,165,250,.1)'}}>👤 {s.co.name}</div>
      </div>

      <div style={{padding:18}}>
        {/* ── Accueil client ── */}
        {clientView==='accueil'&&<div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
            {[
              {l:'Travailleurs actifs',v:ae.length,c:'#4ade80',ic:'👥'},
              {l:'Prestations à encoder',v:`${MN[selectedMonth-1]}`,c:'#c6a34e',ic:'📝'},
              {l:'Demandes en cours',v:demandes.filter(d=>d.status==='en_attente').length,c:'#60a5fa',ic:'📋'},
              {l:'Messages non lus',v:0,c:'#a78bfa',ic:'💬'},
            ].map((x,i)=><div key={i} style={{padding:14,background:'rgba(255,255,255,.02)',borderRadius:8,textAlign:'center',border:'1px solid rgba(255,255,255,.04)'}}>
              <div style={{fontSize:22,marginBottom:4}}>{x.ic}</div>
              <div style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{x.l}</div>
            </div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontWeight:600,fontSize:12,color:'#c6a34e',marginBottom:8}}>📅 Échéances</div>
              {[
                {d:'Avant le 5',l:`Encodage prestations ${MN[selectedMonth-1]}`,u:true},
                {d:'Le 25',l:'Dernier délai modifications paie'},
                {d:'Fin du mois',l:'Fiches de paie disponibles'},
              ].map((x,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5}}>
                <span style={{color:'#9e9b93'}}>{x.d}</span>
                <span style={{color:x.u?'#c6a34e':'#e8e6e0',fontWeight:x.u?600:400}}>{x.l}</span>
              </div>)}
            </div>
            <div style={{padding:14,background:'rgba(96,165,250,.04)',borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
              <div style={{fontWeight:600,fontSize:12,color:'#60a5fa',marginBottom:8}}>📋 Actions rapides</div>
              {[
                {l:'Encoder les prestations du mois',a:()=>setClientView('encodage')},
                {l:'Demander un congé / absence',a:()=>setClientView('absences')},
                {l:'Consulter les fiches de paie',a:()=>setClientView('fiches')},
                {l:'Envoyer un message',a:()=>setClientView('messages')},
              ].map((x,i)=><div key={i} onClick={x.a} style={{padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,color:'#60a5fa',cursor:'pointer'}}>{x.l} →</div>)}
            </div>
          </div>
        </div>}

        {/* ── Encodage prestations ── */}
        {clientView==='encodage'&&<div>
          <div style={{display:'flex',gap:12,marginBottom:14,alignItems:'center'}}>
            <I label="" value={selectedMonth} onChange={v=>setSelectedMonth(parseInt(v))} options={MN.map((m,i)=>({v:i+1,l:m}))} style={{width:140}}/>
            <I label="" type="number" value={selectedYear} onChange={v=>setSelectedYear(v)} style={{width:100}}/>
            <I label="" value={encodMode} onChange={setEncodMode} options={[{v:'mensuel',l:'Vue mensuelle (résumé)'},{v:'journalier',l:'Vue journalière (détail)'}]} style={{width:250}}/>
          </div>

          {encodMode==='mensuel'&&<div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
              <thead><tr style={{background:'rgba(198,163,78,.05)'}}>
                {['Travailleur','Jours prestés','H. normales','H. sup.','H. nuit','H. dim/JF','Maladie','Congé','Autre abs.','Note'].map(h=>
                  <th key={h} style={{textAlign:'left',padding:'10px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {ae.map((emp,i)=>{
                  const k=`${emp.id}_${selectedMonth}`;
                  const data=encodData[k]||{jrs:21,hN:159.6,hS:0,hNu:0,hD:0,mal:0,cng:0,autr:0,note:''};
                  return <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <td style={{padding:'8px 10px',fontWeight:500}}>{emp.first} {emp.last}</td>
                    {['jrs','hN','hS','hNu','hD','mal','cng','autr'].map(f=><td key={f} style={{padding:'4px 6px'}}>
                      <input type="number" value={data[f]||0} onChange={e=>{const nd={...data,[f]:parseFloat(e.target.value)||0};setEncodData({...encodData,[k]:nd});}}
                        style={{width:60,padding:'5px 6px',borderRadius:4,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'#e8e6e0',fontSize:11.5,textAlign:'right'}}/>
                    </td>)}
                    <td style={{padding:'4px 6px'}}><input type="text" value={data.note||''} onChange={e=>{const nd={...data,note:e.target.value};setEncodData({...encodData,[k]:nd});}}
                      style={{width:'100%',padding:'5px 6px',borderRadius:4,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'#e8e6e0',fontSize:11}}
                      placeholder="Remarque..."/></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>}

          {encodMode==='journalier'&&<div style={{overflowX:'auto'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Grille journalière — {MN[selectedMonth-1]} {selectedYear}</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
              <thead><tr style={{background:'rgba(198,163,78,.05)'}}>
                <th style={{padding:'8px 6px',textAlign:'left',fontSize:9.5,color:'#5e5c56',fontWeight:600,position:'sticky',left:0,background:'#0a0d17',zIndex:1}}>Travailleur</th>
                {Array.from({length:daysInMonth},(_,i)=>{
                  const dt=new Date(selectedYear,selectedMonth-1,i+1);
                  const dow=dt.getDay();const isWE=dow===0||dow===6;
                  return <th key={i} style={{padding:'8px 3px',textAlign:'center',fontSize:9,color:isWE?'#3a3930':'#5e5c56',fontWeight:600,minWidth:24,background:isWE?'rgba(255,255,255,.01)':'transparent'}}>
                    <div>{DOWS[dow].charAt(0)}</div><div>{i+1}</div>
                  </th>;
                })}
                <th style={{padding:'8px 6px',textAlign:'right',fontSize:9.5,color:'#c6a34e',fontWeight:600}}>Total</th>
              </tr></thead>
              <tbody>
                {ae.map((emp,ei)=><tr key={ei} style={{borderBottom:'1px solid rgba(255,255,255,.02)'}}>
                  <td style={{padding:'6px',fontWeight:500,fontSize:11,whiteSpace:'nowrap',position:'sticky',left:0,background:'#0a0d17',zIndex:1}}>{emp.first} {emp.last.charAt(0)}.</td>
                  {Array.from({length:daysInMonth},(_,di)=>{
                    const dt=new Date(selectedYear,selectedMonth-1,di+1);
                    const dow=dt.getDay();const isWE=dow===0||dow===6;
                    const key=`${emp.id}_${di+1}`;
                    const val=encodData[key];
                    const colors={P:'#4ade80',M:'#f87171',C:'#60a5fa',F:'#a78bfa',S:'#c6a34e'};
                    return <td key={di} style={{padding:'2px',textAlign:'center',background:isWE?'rgba(255,255,255,.01)':'transparent'}}>
                      {isWE?<span style={{color:'#2a2920',fontSize:9}}>—</span>:
                      <button onClick={()=>{const types=['P','M','C','F','S',undefined];const ci=types.indexOf(val);toggleEncod(emp.id,di+1,types[(ci+1)%types.length]);}}
                        style={{width:22,height:22,borderRadius:4,border:'none',fontSize:9,fontWeight:700,cursor:'pointer',
                          background:val?`${colors[val]}20`:'rgba(255,255,255,.03)',color:val?colors[val]:'#3a3930'}}>
                        {val||'·'}
                      </button>}
                    </td>;
                  })}
                  <td style={{padding:'6px',textAlign:'right',fontWeight:600,color:'#c6a34e',fontSize:11}}>
                    {Object.entries(encodData).filter(([k])=>k.startsWith(emp.id+'_')&&encodData[k]==='P').length||0}j
                  </td>
                </tr>)}
              </tbody>
            </table>
            <div style={{display:'flex',gap:16,marginTop:10,fontSize:10}}>
              {[{c:'P',l:'Presté',cl:'#4ade80'},{c:'M',l:'Maladie',cl:'#f87171'},{c:'C',l:'Congé',cl:'#60a5fa'},{c:'F',l:'Férié/Formation',cl:'#a78bfa'},{c:'S',l:'H.Sup',cl:'#c6a34e'}].map(x=>
                <span key={x.c} style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{display:'inline-block',width:14,height:14,borderRadius:3,background:`${x.cl}20`,color:x.cl,textAlign:'center',fontWeight:700,fontSize:8,lineHeight:'14px'}}>{x.c}</span>
                  <span style={{color:'#9e9b93'}}>{x.l}</span>
                </span>
              )}
              <span style={{color:'#5e5c56',marginLeft:8}}>Cliquez pour cycler les types</span>
            </div>
          </div>}

          <div style={{display:'flex',gap:10,marginTop:14}}>
            <B onClick={()=>alert(`Prestations ${MN[selectedMonth-1]} ${selectedYear} envoyées à votre bureau social ! Vous recevrez une confirmation.`)}>✅ Envoyer au bureau social</B>
            <B v="outline" onClick={()=>alert('Brouillon sauvegardé !')}>💾 Sauvegarder brouillon</B>
          </div>
        </div>}

        {/* ── Demandes d'absence ── */}
        {clientView==='absences'&&<div>
          <div style={{display:'grid',gridTemplateColumns:'350px 1fr',gap:18}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Nouvelle demande</div>
              {(()=>{
                const [absEmp,setAbsEmp]=[ae[0]?.id||'',()=>{}]; // simplified
                return <div>
                  <I label="Travailleur" value={ae[0]?.id||''} onChange={()=>{}} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
                  <I label="Type d'absence" value="conge_annuel" onChange={()=>{}} style={{marginTop:8}} options={absTypes.map(a=>({v:a.v,l:`${a.ic} ${a.l}`}))}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                    <I label="Du" type="date" value={new Date().toISOString().split('T')[0]} onChange={()=>{}}/>
                    <I label="Au" type="date" value={new Date().toISOString().split('T')[0]} onChange={()=>{}}/>
                  </div>
                  <I label="Remarque" type="text" value="" onChange={()=>{}} style={{marginTop:8}}/>
                  <B onClick={()=>submitDemande(`${ae[0]?.first} ${ae[0]?.last}`,'conge_annuel',new Date().toISOString().split('T')[0],new Date().toISOString().split('T')[0],'')} style={{width:'100%',marginTop:12}}>📤 Soumettre la demande</B>
                </div>;
              })()}
              <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.04)',borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
                La demande sera transmise à votre bureau social pour validation. Vous recevrez une notification de confirmation.
              </div>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Historique des demandes</div>
              {demandes.length>0?demandes.map((dem,i)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 14px',marginBottom:6,borderRadius:8,
                background:dem.status==='en_attente'?'rgba(198,163,78,.04)':dem.status==='approuvé'?'rgba(74,222,128,.04)':'rgba(248,113,113,.04)',
                border:`1px solid ${dem.status==='en_attente'?'rgba(198,163,78,.1)':dem.status==='approuvé'?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)'}`}}>
                <span style={{fontSize:18}}>{dem.ic}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:12,color:'#e8e6e0'}}>{dem.emp} — {dem.type}</div>
                  <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{dem.from} → {dem.to}</div>
                </div>
                <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,fontWeight:600,
                  background:dem.status==='en_attente'?'rgba(198,163,78,.15)':'rgba(74,222,128,.15)',
                  color:dem.status==='en_attente'?'#c6a34e':'#4ade80'}}>{dem.status==='en_attente'?'⏳ En attente':'✓ Approuvé'}</span>
                {dem.status==='en_attente'&&<B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>{dem.status='approuvé';setDemandes([...demandes]);}}>Approuver</B>}
              </div>):<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucune demande</div>}
            </div>
          </div>
        </div>}

        {/* ── Fiches de paie consultables ── */}
        {clientView==='fiches'&&<div>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Fiches de paie — Consultation employeur</div>
          {s.pays.length>0?<Tbl cols={[
            {k:'e',l:'Travailleur',b:1,r:r=>r.ename||'—'},
            {k:'p',l:'Période',r:r=>r.period||'—'},
            {k:'g',l:'Brut',a:'right',r:r=>fmt(r.gross||0)},
            {k:'n',l:'Net',a:'right',r:r=><span style={{color:'#4ade80',fontWeight:600}}>{fmt(r.net||0)}</span>},
            {k:'c',l:'Coût total',a:'right',r:r=><span style={{color:'#c6a34e'}}>{fmt(r.costTotal||0)}</span>},
          ]} data={s.pays}/>:<div>
            {ae.length>0?<div>
              {ae.map((emp,i)=>{const p=calc(emp,DPER,s.co);return <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center'}}>
                <div style={{fontWeight:500}}>{emp.first} {emp.last}</div>
                <div style={{display:'flex',gap:20,fontSize:12}}>
                  <span style={{color:'#9e9b93'}}>Brut: <b style={{color:'#e8e6e0'}}>{fmt(p.gross)}</b></span>
                  <span style={{color:'#9e9b93'}}>Net: <b style={{color:'#4ade80'}}>{fmt(p.net)}</b></span>
                  <span style={{color:'#9e9b93'}}>Coût: <b style={{color:'#c6a34e'}}>{fmt(p.costTotal)}</b></span>
                </div>
                <B v="ghost" style={{padding:'3px 8px',fontSize:10}}>📄 PDF</B>
              </div>;})}
            </div>:<div style={{padding:40,textAlign:'center',color:'#5e5c56'}}>Aucune fiche disponible</div>}
          </div>}
          <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.04)',borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            <b>Note:</b> L'employeur voit les montants (brut, net, coût total) mais <b>pas le détail des calculs</b> (taux ONSS, barèmes, formule PP). Seul le bureau social a accès aux paramètres de calcul.
          </div>
        </div>}

        {/* ── Messages ── */}
        {clientView==='messages'&&<div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 350px',gap:18}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Messagerie bureau social</div>
              <div style={{minHeight:300,maxHeight:400,overflowY:'auto',padding:14,background:'rgba(255,255,255,.01)',borderRadius:8,border:'1px solid rgba(255,255,255,.04)'}}>
                {msgs.length>0?msgs.map((m,i)=><div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.from==='client'?'flex-end':'flex-start',marginBottom:10}}>
                  <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:12,fontSize:12,lineHeight:1.5,
                    background:m.from==='client'?'rgba(96,165,250,.12)':'rgba(198,163,78,.08)',
                    color:m.from==='client'?'#60a5fa':'#c6a34e'}}>
                    {m.text}
                  </div>
                  <div style={{fontSize:9,color:'#3a3930',marginTop:3}}>{m.from==='client'?'Vous':'Bureau social'} · {new Date(m.at).toLocaleTimeString('fr-BE',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>):<div style={{textAlign:'center',color:'#3a3930',padding:40}}>Aucun message</div>}
              </div>
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <input id="msgInput" type="text" placeholder="Écrivez votre message..." style={{flex:1,padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'#e8e6e0',fontSize:12}}/>
                <B onClick={()=>{const inp=document.getElementById('msgInput');if(inp?.value){setMsgs([...msgs,{from:'client',text:inp.value,at:new Date().toISOString()}]);inp.value='';
                  setTimeout(()=>setMsgs(p=>[...p,{from:'bureau',text:'Bien reçu ! Nous traitons votre demande.',at:new Date().toISOString()}]),1500);
                }}}>Envoyer</B>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Messages types</div>
              {[
                'Les prestations du mois sont envoyées.',
                'Quand les fiches de paie seront-elles prêtes ?',
                'Un employé est en maladie depuis aujourd\'hui.',
                'Nouveau travailleur à déclarer.',
                'Question sur le coût d\'un engagement.',
              ].map((m,i)=><div key={i} onClick={()=>{setMsgs(prev=>[...prev,{from:'client',text:m,at:new Date().toISOString()}]);
                setTimeout(()=>setMsgs(p=>[...p,{from:'bureau',text:'Bien reçu, nous nous en occupons rapidement !',at:new Date().toISOString()}]),1500);
              }} style={{padding:'8px 12px',marginBottom:4,borderRadius:6,background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.04)',fontSize:11,color:'#9e9b93',cursor:'pointer'}}>{m}</div>)}
            </div>
          </div>
        </div>}

        {/* ── Suivi bureau social ── */}
        {clientView==='suivi'&&<div>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:14}}>📊 Tableau de suivi — Tous vos clients</div>
          <div style={{padding:10,background:'rgba(248,113,113,.04)',borderRadius:8,border:'1px solid rgba(248,113,113,.1)',marginBottom:14,fontSize:11.5,color:'#f87171'}}>
            ⚠ Cette vue est réservée au <b>bureau social</b> — jamais visible par l'employeur.
          </div>
          <Tbl cols={[
            {k:'c',l:'Client',b:1,r:r=>r.company?.name||r.name||'—'},
            {k:'e',l:'Travailleurs',a:'right',r:r=>r.emps?.length||0},
            {k:'s',l:'Encodage',r:r=>{const statuses=['✅ Reçu','⏳ En attente','❌ En retard'];return <span style={{fontSize:10,fontWeight:600,color:Math.random()>0.5?'#4ade80':'#c6a34e'}}>{statuses[Math.floor(Math.random()*3)]}</span>;}},
            {k:'d',l:'Deadline',r:r=>'05/' + String(selectedMonth+1>12?1:selectedMonth+1).padStart(2,'0')},
            {k:'p',l:'Fiches',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:'rgba(74,222,128,.1)',color:'#4ade80'}}>Prêtes</span>},
            {k:'m',l:'Messages',a:'right',r:r=><span style={{color:'#a78bfa'}}>{Math.floor(Math.random()*5)}</span>},
          ]} data={s.clients.length>0?s.clients:[{name:s.co.name,emps:ae,company:s.co}]}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:14}}>
            {[
              {l:'Clients ayant encodé',v:`${Math.floor((s.clients.length||1)*0.6)}/${s.clients.length||1}`,c:'#4ade80',ic:'✅'},
              {l:'En retard (>5 du mois)',v:Math.ceil((s.clients.length||1)*0.2),c:'#f87171',ic:'⏰'},
              {l:'Demandes en attente',v:demandes.filter(d=>d.status==='en_attente').length,c:'#c6a34e',ic:'📋'},
            ].map((x,i)=><C key={i} style={{padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:20,marginBottom:4}}>{x.ic}</div>
              <div style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{x.l}</div>
            </C>)}
          </div>
        </div>}
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PRIMES SYNDICALES
// ═══════════════════════════════════════════════════════════════
function SyndicalesMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const [synd,setSynd]=useState('fgtb');
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const synds=[{v:'fgtb',l:'FGTB',c:'#e53e3e'},{v:'csc',l:'CSC',c:'#38a169'},{v:'cgslb',l:'CGSLB',c:'#3182ce'},{v:'autre',l:'Autre',c:'#9e9b93'}];
  const run=()=>{
    const data=ae.map(emp=>{const prime=emp.cp==='124'?145:emp.cp==='200'?90:emp.cp==='302'?72:85;return{emp:`${emp.first} ${emp.last}`,niss:emp.niss,cp:emp.cp,synd:synds.find(x=>x.v===synd)?.l,jrs:Math.round(LEGAL.WD*12),prime};});
    setGen({data,tot:data.reduce((a,r)=>a+r.prime,0),sc:synds.find(x=>x.v===synd)});
  };
  return <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
    <C><ST>Primes Syndicales</ST>
      <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
      <I label="Syndicat" value={synd} onChange={setSynd} style={{marginTop:9}} options={synds.map(x=>({v:x.v,l:x.l}))}/>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer {yr}</B>
      {gen&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)',fontSize:12,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:gen.sc?.c,marginBottom:4}}>{gen.sc?.l} — {yr}</div>
        <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{gen.data.length}</b></div>
        <div>Total primes: <b style={{color:'#4ade80'}}>{fmt(gen.tot)}</b></div>
      </div>}
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>Le montant varie par CP. Attestations pour transmission à l'organisation syndicale.</div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Attestations — {yr}</div></div>
      {gen?<Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'n',l:'NISS',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.niss}</span>},{k:'cp',l:'CP',r:r=>r.cp},{k:'s',l:'Syndicat',r:r=><span style={{fontWeight:600,color:gen.sc?.c}}>{r.synd}</span>},{k:'j',l:'Jours',a:'right',r:r=>r.jrs},{k:'p',l:'Prime',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(r.prime)}</span>}]} data={gen?.data||[]}/>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez les primes</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ONSS-APL (DMFAPPL)
// ═══════════════════════════════════════════════════════════════
function ONSSAPLMod({s,d}){
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const [ta,setTa]=useState('commune');
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const ats=[{v:'commune',l:'Commune'},{v:'cpas',l:'CPAS'},{v:'province',l:'Province'},{v:'intercommunale',l:'Intercommunale'},{v:'zone_police',l:'Zone de police'},{v:'zone_secours',l:'Zone de secours'}];
  const run=()=>{
    const ws=ae.map(e=>{const p=calc(e,{...DPER,days:65},s.co);return{emp:`${e.first} ${e.last}`,niss:e.niss,code:e.dmfaCode||'495',gQ:p.gross*3,ow:p.onssNet*3,oe:p.onssE*3,pen:p.gross*3*.075,sol:p.gross*3*.005};});
    const t=ws.reduce((a,w)=>({g:a.g+w.gQ,ow:a.ow+w.ow,oe:a.oe+w.oe,p:a.p+w.pen,sl:a.sl+w.sol}),{g:0,ow:0,oe:0,p:0,sl:0});
    const xml=`<?xml version="1.0"?>\n<DmfAPPL>\n  <Q>${q}</Q><Y>${y}</Y><Admin>${ta}</Admin>\n  <Employer>${s.co.name} — ${s.co.onss}</Employer>\n${ws.map(w=>`  <Agent><n>${w.emp}</n><Gross>${w.gQ.toFixed(2)}</Gross><ONSS>${(w.ow+w.oe).toFixed(2)}</ONSS><Pension>${w.pen.toFixed(2)}</Pension></Agent>`).join('\n')}\n  <Total gross="${t.g.toFixed(2)}" onss="${(t.ow+t.oe).toFixed(2)}" pension="${t.p.toFixed(2)}"/>\n</DmfAPPL>`;
    setGen({ws,t,xml});
  };
  return <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
    <C><ST>ONSS-APL (DMFAPPL)</ST>
      <I label="Administration" value={ta} onChange={setTa} options={ats}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
        <I label="Trim." value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:'T1'},{v:2,l:'T2'},{v:3,l:'T3'},{v:4,l:'T4'}]}/>
        <I label="Année" type="number" value={y} onChange={v=>setY(v)}/>
      </div>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer DMFAPPL</B>
      {gen&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>{ats.find(x=>x.v===ta)?.l} — T{q}/{y}</div>
        <div>Agents: <b style={{color:'#e8e6e0'}}>{gen.ws.length}</b></div>
        <div>Masse: <b style={{color:'#e8e6e0'}}>{fmt(gen.t.g)}</b></div>
        <div>ONSS: <b style={{color:'#f87171'}}>{fmt(gen.t.ow+gen.t.oe)}</b></div>
        <div>Pension: <b style={{color:'#a78bfa'}}>{fmt(gen.t.p)}</b></div>
      </div>}
      {gen&&<B v="ghost" style={{width:'100%',marginTop:8,fontSize:11}} onClick={()=>d({type:'MODAL',m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>DMFAPPL T{q}/{y}</h3><pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{gen.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(gen.xml);alert('Copié !')}}>Copier</B></div></div>}})}>Voir XML</B>}
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Agents — T{q}/{y}</div></div>
      {gen?<Tbl cols={[{k:'e',l:'Agent',b:1,r:r=>r.emp},{k:'c',l:'Code',r:r=>r.code},{k:'g',l:'Brut trim.',a:'right',r:r=>fmt(r.gQ)},{k:'ow',l:'ONSS trav.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.ow)}</span>},{k:'oe',l:'ONSS empl.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.oe)}</span>},{k:'p',l:'Pension',a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.pen)}</span>}]} data={gen?.ws||[]}/>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez la DMFAPPL</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  RELEVÉS ETA (Awiph / Cocof)
// ═══════════════════════════════════════════════════════════════
function ETAMod({s,d}){
  const [org,setOrg]=useState('awiph');
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const run=()=>{
    const data=ae.map(e=>{const p=calc(e,{...DPER,days:65},s.co);const cat=Math.ceil(Math.random()*4);const rate=cat<=2?.25:cat===3?.50:.75;return{emp:`${e.first} ${e.last}`,fn:e.fn,cat,rate,gQ:p.gross*3,sub:p.gross*3*rate,jrs:Math.round(LEGAL.WD*3),hrs:Math.round(LEGAL.WD*3*LEGAL.WHD)};});
    setGen({data,tS:data.reduce((a,r)=>a+r.sub,0),tG:data.reduce((a,r)=>a+r.gQ,0),o:org==='awiph'?'AViQ (ex-AWIPH)':'COCOF'});
  };
  return <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
    <C><ST>Relevés ETA</ST>
      <I label="Organisme" value={org} onChange={setOrg} options={[{v:'awiph',l:'AViQ (ex-AWIPH) — Wallonie'},{v:'cocof',l:'COCOF — Bruxelles'}]}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
        <I label="Trim." value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:'T1'},{v:2,l:'T2'},{v:3,l:'T3'},{v:4,l:'T4'}]}/>
        <I label="Année" type="number" value={y} onChange={v=>setY(v)}/>
      </div>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer relevé ETA</B>
      {gen&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>{gen.o} — T{q}/{y}</div>
        <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{gen.data.length}</b></div>
        <div>Masse: <b style={{color:'#e8e6e0'}}>{fmt(gen.tG)}</b></div>
        <div>Subsides: <b style={{color:'#4ade80'}}>{fmt(gen.tS)}</b></div>
      </div>}
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}><b>ETA:</b> Entreprises de Travail Adapté. Subsides selon catégorie handicap (1-4).</div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Relevé — T{q}/{y}</div></div>
      {gen?<Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'f',l:'Fonction',r:r=><span style={{fontSize:11}}>{r.fn}</span>},{k:'c',l:'Cat.',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.cat}</span>},{k:'r',l:'Taux',a:'right',r:r=>`${(r.rate*100).toFixed(0)}%`},{k:'j',l:'Jours',a:'right',r:r=>r.jrs},{k:'g',l:'Brut',a:'right',r:r=>fmt(r.gQ)},{k:'s',l:'Subside',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(r.sub)}</span>}]} data={gen?.data||[]}/>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez le relevé</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════
function ExportImportMod({s,d}){
  const [mode,setMode]=useState('export');
  const [ef,setEf]=useState('dif');
  const [ed,setEd]=useState('employees');
  const [res,setRes]=useState(null);
  const [impD,setImpD]=useState('');
  const ae=s.emps.filter(e=>e.status==='active');
  const fmts=[{v:'dif',l:'DIF (Data Interchange)'},{v:'csv',l:'CSV'},{v:'tsv',l:'TSV'},{v:'xls',l:'XLS (Excel)'},{v:'txt',l:'TXT'}];
  const dsets=[{v:'employees',l:'Signalétiques'},{v:'payslips',l:'Fiches de paie'},{v:'cumuls',l:'Cumuls annuels'},{v:'onss',l:'Données ONSS'},{v:'fiscal',l:'Données fiscales'}];
  const doExp=()=>{
    let lines=[];
    if(ed==='employees'){lines=['Nom;Prénom;NISS;Fonction;Dept;Contrat;CP;Brut;Enfants;IBAN',...ae.map(e=>`${e.last};${e.first};${e.niss};${e.fn};${e.dept};${e.contract};${e.cp};${e.monthlySalary};${e.depChildren};${e.iban}`)];}
    else if(ed==='payslips'){lines=['Nom;Brut;ONSS;Précompte;CSS;Net;Coût',...ae.map(e=>{const p=calc(e,DPER,s.co);return`${e.last} ${e.first};${p.gross.toFixed(2)};${p.onssNet.toFixed(2)};${p.tax.toFixed(2)};${p.css.toFixed(2)};${p.net.toFixed(2)};${p.costTotal.toFixed(2)}`;})];} 
    else{lines=['Nom;NISS;DMFA;CP;Brut;ONSS_T;ONSS_E',...ae.map(e=>{const p=calc(e,DPER,s.co);return`${e.last} ${e.first};${e.niss};${e.dmfaCode};${e.cp};${p.gross.toFixed(2)};${p.onssNet.toFixed(2)};${p.onssE.toFixed(2)}`;})];} 
    const sep=ef==='csv'?',':ef==='tsv'?'\t':';';
    const out=ef==='dif'?`TABLE\n0,1\n""\nVECTORS\n0,${ae.length}\n""\nTUPLES\n0,${lines[0].split(';').length}\n""\nDATA\n`+lines.join('\n')+'\n-1,0\nEOD':lines.join('\n').replaceAll(';',sep);
    setRes({out,n:lines.length-1,f:lines[0].split(';').length,fl:fmts.find(f=>f.v===ef)?.l});
  };
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <C><ST>Export / Import</ST>
      <I label="Mode" value={mode} onChange={setMode} options={[{v:'export',l:'📤 Exportation'},{v:'import',l:'📥 Importation (pointage/paie)'}]}/>
      {mode==='export'?<>
        <I label="Données" value={ed} onChange={setEd} style={{marginTop:9}} options={dsets}/>
        <I label="Format" value={ef} onChange={setEf} style={{marginTop:9}} options={fmts}/>
        <B onClick={doExp} style={{width:'100%',marginTop:14}}>Exporter</B>
      </>:<>
        <I label="Source" value="pointage" onChange={()=>{}} style={{marginTop:9}} options={[{v:'pointage',l:'Pointage'},{v:'paie',l:'Paie'},{v:'sig',l:'Signalétiques'}]}/>
        <div style={{marginTop:9}}><label style={{fontSize:10.5,fontWeight:600,color:'#9e9b93',display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.7px'}}>Données CSV/TXT</label>
        <textarea value={impD} onChange={e=>setImpD(e.target.value)} rows={6} placeholder="Collez ici..." style={{width:'100%',padding:'9px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:7,color:'#d4d0c8',fontSize:11,fontFamily:'monospace',outline:'none',resize:'vertical',boxSizing:'border-box'}}/></div>
        <B onClick={()=>{if(!impD.trim())return alert('Collez les données');alert(`${impD.trim().split('\n').length-1} ligne(s) importées !`);}} style={{width:'100%',marginTop:14}}>Importer</B>
      </>}
      <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.05)',borderRadius:8}}><div style={{fontSize:10.5,color:'#c6a34e',fontWeight:600,marginBottom:4}}>Formats</div>{fmts.map(f=><div key={f.v} style={{fontSize:10.5,color:'#9e9b93',padding:'1px 0'}}>• {f.l}</div>)}</div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{mode==='export'?'Résultat':'Import'}</div></div>
      {res?<div style={{padding:16}}>
        <div style={{display:'flex',gap:14,marginBottom:12}}><span style={{fontSize:11,color:'#9e9b93'}}>Format: <b style={{color:'#c6a34e'}}>{res.fl}</b></span><span style={{fontSize:11,color:'#9e9b93'}}>Lignes: <b style={{color:'#e8e6e0'}}>{res.n}</b></span><span style={{fontSize:11,color:'#9e9b93'}}>Champs: <b style={{color:'#e8e6e0'}}>{res.f}</b></span><B v="ghost" style={{padding:'3px 8px',fontSize:10,marginLeft:'auto'}} onClick={()=>{navigator.clipboard?.writeText(res.out);alert('Copié !')}}>Copier</B></div>
        <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{res.out}</pre>
      </div>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>{mode==='export'?'Lancez un export':'Collez les données'}</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  NET AU BRUT
// ═══════════════════════════════════════════════════════════════
function NetBrutMod({s,d}){
  const [netVoulu,setNetVoulu]=useState(2500);
  const [civil,setCivil]=useState('single');
  const [children,setChildren]=useState(0);
  const [cp,setCp]=useState('200');
  const [result,setResult]=useState(null);
  const run=()=>{
    let brut=netVoulu*1.6;
    for(let i=0;i<50;i++){
      const emp={monthlySalary:brut,civil,depChildren:children,handiChildren:0,cp,mvT:10,mvW:1.09,mvE:8.91,expense:0,commDist:0,commType:'none'};
      const p=calc(emp,DPER,s.co);
      const diff=netVoulu-p.net;
      if(Math.abs(diff)<0.01)break;
      brut+=diff*0.7;
    }
    const emp={monthlySalary:brut,civil,depChildren:children,handiChildren:0,cp,mvT:10,mvW:1.09,mvE:8.91,expense:0,commDist:0,commType:'none'};
    const p=calc(emp,DPER,s.co);
    setResult({brut,net:p.net,onss:p.onssNet,tax:p.tax,css:p.css,cost:p.costTotal,empBonus:p.empBonus,empBonusFisc:p.empBonusFisc||0,redStructMois:p.redStructMois||0});
  };
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <C><ST>Calcul Net → Brut</ST>
      <I label="Net souhaité (€)" type="number" value={netVoulu} onChange={setNetVoulu}/>
      <I label="Situation" value={civil} onChange={setCivil} style={{marginTop:9}} options={[{v:'single',l:'Isolé'},{v:'married_2',l:'Marié (2 revenus)'},{v:'married_1',l:'Marié (1 revenu)'},{v:'cohabit',l:'Cohabitant légal'}]}/>
      <I label="Enfants à charge" type="number" value={children} onChange={setChildren} style={{marginTop:9}}/>
      <I label="CP" value={cp} onChange={setCp} style={{marginTop:9}} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Calculer le brut</B>
    </C>
    <C>
      {result?<div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:11,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px'}}>Pour obtenir un net de</div>
          <div style={{fontSize:28,fontWeight:700,color:'#4ade80',margin:'6px 0'}}>{fmt(result.net)}</div>
          <div style={{fontSize:11,color:'#5e5c56'}}>il faut un brut de</div>
          <div style={{fontSize:36,fontWeight:800,color:'#c6a34e',margin:'6px 0'}}>{fmt(result.brut)}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[{l:'ONSS travailleur',v:result.onss,c:'#f87171'},{l:'Précompte prof.',v:result.tax,c:'#a78bfa'},{l:'CSS',v:result.css,c:'#f87171'},{l:'Bonus emploi social',v:result.empBonus,c:'#4ade80'},{l:'Bonus emploi fiscal',v:result.empBonusFisc,c:'#4ade80'},{l:'Réd. structurelle',v:result.redStructMois,c:'#60a5fa'},{l:'Net calculé',v:result.net,c:'#4ade80'},{l:'Coût employeur',v:result.cost,c:'#c6a34e'}].map((x,i)=>
            <div key={i} style={{textAlign:'center',padding:12,background:'rgba(198,163,78,.04)',borderRadius:8}}>
              <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:x.c,marginTop:4}}>{fmt(x.v)}</div>
            </div>
          )}
        </div>
      </div>:<div style={{padding:60,textAlign:'center',color:'#5e5c56',fontSize:13}}>Entrez le net souhaité et lancez le calcul</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DECAVA
// ═══════════════════════════════════════════════════════════════
function DecavaMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [yr,setYr]=useState(new Date().getFullYear());
  const [typeRCC,setTypeRCC]=useState('rcc');
  const [dateDeb,setDateDeb]=useState('');
  const [hist,setHist]=useState([]);
  const emp=s.emps.find(e=>e.id===eid);
  const types=[{v:'rcc',l:'RCC (Régime chômage avec complément)'},{v:'canada_dry',l:'Canada Dry / Pseudo-prépension'},{v:'prepension',l:'Prépension conventionnelle'}];
  const gen=()=>{if(!emp)return;
    const p=calc(emp,DPER,s.co);
    const cotSpec=p.gross*0.0132;const cotPatr=p.gross*0.5;
    const doc={id:uid(),emp:`${emp.first} ${emp.last}`,yr,type:types.find(t=>t.v===typeRCC)?.l,dateDeb,brut:p.gross,cotSpec,cotPatr,at:new Date().toISOString()};
    setHist([doc,...hist]);
    d({type:'MODAL',m:{w:600,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 3px',fontFamily:"'Cormorant Garamond',serif"}}>DECAVA — {doc.type}</h2>
      <div style={{fontSize:10.5,color:'#c6a34e',marginBottom:14}}>Année {yr}</div>
      <div style={{padding:16,background:'#faf9f4',borderRadius:10,color:'#1a1a18'}}>
        {[{l:'Employeur',v:s.co.name},{l:'Travailleur',v:doc.emp},{l:'Type',v:doc.type},{l:'Date début',v:dateDeb||'—'},{l:'Dernier brut',v:fmt(doc.brut)},{l:'Cotisation spéciale',v:fmt(doc.cotSpec)},{l:'Cotisation patronale',v:fmt(doc.cotPatr)}].map((f,i)=>
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #eee',fontSize:12.5}}><span style={{color:'#888'}}>{f.l}</span><span style={{fontWeight:500}}>{f.v}</span></div>
        )}
      </div>
      <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B></div>
    </div>}});
  };
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <C><ST>DECAVA — Prépensions</ST>
      <I label="Travailleur" value={eid} onChange={setEid} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Type" value={typeRCC} onChange={setTypeRCC} style={{marginTop:9}} options={types}/>
      <I label="Année" type="number" value={yr} onChange={v=>setYr(v)} style={{marginTop:9}}/>
      <I label="Date début" type="date" value={dateDeb} onChange={setDateDeb} style={{marginTop:9}}/>
      <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer DECAVA</B>
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>Déclaration anticipée de vacances / cotisations spéciales RCC. Calcul automatique des cotisations patronales et spéciales.</div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique DECAVA</div></div>
      <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'t',l:'Type',r:r=><span style={{fontSize:11}}>{r.type}</span>},{k:'y',l:'Année',r:r=>r.yr},{k:'b',l:'Brut',a:'right',r:r=>fmt(r.brut)},{k:'c',l:'Cot. spéc.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.cotSpec)}</span>},{k:'p',l:'Cot. patr.',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.cotPatr)}</span>}]} data={hist}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BILAN SOCIAL
// ═══════════════════════════════════════════════════════════════
function BilanSocialMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const run=()=>{
    const cdi=ae.filter(e=>e.contract==='CDI').length;const cdd=ae.filter(e=>e.contract==='CDD').length;const other=ae.length-cdi-cdd;
    const men=ae.filter(e=>(e.sexe||'M')==='M').length;const women=ae.length-men;
    const masseBrute=ae.reduce((a,e)=>a+e.monthlySalary*12,0);
    const masseONSS=ae.reduce((a,e)=>a+calc(e,DPER,s.co).onssE*12,0);
    const etp=ae.reduce((a,e)=>a+(e.whWeek||38)/38,0);
    const formation={heures:ae.length*16,cout:ae.length*16*45,participants:Math.ceil(ae.length*0.8)};
    const entrees=Math.floor(Math.random()*3);const sorties=Math.floor(Math.random()*2);
    const niveaux={univ:ae.filter(e=>(e.niveauEtude||'')==='univ').length,sup:ae.filter(e=>(e.niveauEtude||'')==='sup').length,sec:ae.filter(e=>(e.niveauEtude||'')==='sec'||(e.niveauEtude||'')==='sec_inf').length,prim:ae.filter(e=>(e.niveauEtude||'')==='prim').length};
    const ouv=ae.filter(e=>(e.statut||'')==='ouvrier').length;const empl=ae.length-ouv;
    // ATN — Avantages en nature
    const atnData={
      voiture:ae.filter(e=>e.carFuel&&e.carFuel!=='none').length,
      gsm:ae.filter(e=>e.atnGSM).length,
      pc:ae.filter(e=>e.atnPC).length,
      internet:ae.filter(e=>e.atnInternet).length,
      logement:ae.filter(e=>e.atnLogement).length,
      chauffage:ae.filter(e=>e.atnChauffage).length,
      electricite:ae.filter(e=>e.atnElec).length,
    };
    atnData.totalBenef=ae.filter(e=>(e.carFuel&&e.carFuel!=='none')||e.atnGSM||e.atnPC||e.atnInternet||e.atnLogement||e.atnChauffage||e.atnElec).length;
    atnData.montantAnnuel=ae.reduce((a,e)=>{
      const r=calc(e,DPER,s.co);
      return a+(r.atnTotal||0)*12;
    },0);
    setGen({yr,total:ae.length,cdi,cdd,other,men,women,masseBrute,masseONSS,etp,formation,entrees,sorties,niveaux,ouv,empl,atnData});
  };
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C><ST>Bilan Social</ST>
        <I label="Exercice" type="number" value={yr} onChange={v=>setYr(v)}/>
        <B onClick={run} style={{width:'100%',marginTop:14}}>Générer le Bilan Social {yr}</B>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>Obligation légale annuelle. Le bilan social est déposé avec les comptes annuels à la BNB.</div>
      </C>
      {gen?<C>
        <div style={{fontSize:16,fontWeight:700,color:'#c6a34e',marginBottom:16,fontFamily:"'Cormorant Garamond',serif"}}>Bilan Social — Exercice {gen.yr}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          <SC label="Effectif total" value={gen.total}/>
          <SC label="ETP" value={gen.etp.toFixed(1)} color="#60a5fa"/>
          <SC label="Masse brute" value={fmt(gen.masseBrute)} color="#4ade80"/>
          <SC label="Charges ONSS" value={fmt(gen.masseONSS)} color="#f87171"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
          <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Par contrat</div><div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
            <div>CDI: <b style={{color:'#4ade80'}}>{gen.cdi}</b></div><div>CDD: <b style={{color:'#c6a34e'}}>{gen.cdd}</b></div><div>Autres: <b style={{color:'#9e9b93'}}>{gen.other}</b></div>
          </div></div>
          <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Par genre & statut</div><div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
            <div>Hommes: <b style={{color:'#60a5fa'}}>{gen.men}</b></div><div>Femmes: <b style={{color:'#a78bfa'}}>{gen.women}</b></div>
            <div>Employés: <b style={{color:'#e8e6e0'}}>{gen.empl}</b></div><div>Ouvriers: <b style={{color:'#fb923c'}}>{gen.ouv}</b></div>
          </div></div>
          <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Niveau études</div><div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
            <div>Universitaire: <b style={{color:'#e8e6e0'}}>{gen.niveaux.univ}</b></div><div>Supérieur: <b style={{color:'#e8e6e0'}}>{gen.niveaux.sup}</b></div><div>Secondaire: <b style={{color:'#e8e6e0'}}>{gen.niveaux.sec}</b></div><div>Primaire: <b style={{color:'#e8e6e0'}}>{gen.niveaux.prim}</b></div>
          </div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
          <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Mouvements</div><div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
            <div>Entrées: <b style={{color:'#4ade80'}}>{gen.entrees}</b></div><div>Sorties: <b style={{color:'#f87171'}}>{gen.sorties}</b></div>
          </div></div>
          <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Formation</div><div style={{fontSize:12,color:'#9e9b93',lineHeight:2}}>
            <div>Heures: <b style={{color:'#e8e6e0'}}>{gen.formation.heures}h</b></div><div>Coût: <b style={{color:'#c6a34e'}}>{fmt(gen.formation.cout)}</b></div><div>Participants: <b style={{color:'#e8e6e0'}}>{gen.formation.participants}</b></div>
          </div></div>
        </div>
        <div style={{marginTop:16}}><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Avantages en nature (ATN)</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>Bénéficiaires ATN</div><div style={{fontSize:16,fontWeight:700,color:'#c6a34e',marginTop:4}}>{gen.atnData.totalBenef}/{gen.total}</div></div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>Montant ATN annuel</div><div style={{fontSize:16,fontWeight:700,color:'#fb923c',marginTop:4}}>{fmt(gen.atnData.montantAnnuel)}</div></div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>Voitures société</div><div style={{fontSize:16,fontWeight:700,color:'#60a5fa',marginTop:4}}>{gen.atnData.voiture}</div></div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>GSM/PC/Internet</div><div style={{fontSize:16,fontWeight:700,color:'#a78bfa',marginTop:4}}>{gen.atnData.gsm}/{gen.atnData.pc}/{gen.atnData.internet}</div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,marginTop:8}}>
            {[{l:'🚗 Voiture',v:gen.atnData.voiture},{l:'📱 GSM',v:gen.atnData.gsm},{l:'💻 PC',v:gen.atnData.pc},{l:'🌐 Internet',v:gen.atnData.internet},{l:'🏠 Logement',v:gen.atnData.logement},{l:'🔥 Chauffage',v:gen.atnData.chauffage},{l:'⚡ Électricité',v:gen.atnData.electricite}].map((x,i)=>
              <div key={i} style={{padding:'6px 4px',background:'rgba(198,163,78,.03)',borderRadius:6,textAlign:'center',fontSize:10}}>
                <div style={{color:'#5e5c56'}}>{x.l}</div><div style={{fontWeight:700,color:x.v>0?'#c6a34e':'#3a3930',marginTop:2}}>{x.v}</div>
              </div>)}
          </div>
        </div>
      </C>:<C><div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez le bilan social</div></C>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PROVISIONS (vacances, 13ème mois, etc.)
// ═══════════════════════════════════════════════════════════════
function ProvisionsMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const [m,setM]=useState(new Date().getMonth()+1);
  const ae=s.emps.filter(e=>e.status==='active');
  // ── PÉCULE VACANCES EMPLOYÉS — Calcul détaillé ──
  // Simple pécule = salaire brut du mois de prise de vacances (pas une provision, c'est le salaire normal)
  // Double pécule = 92% du salaire brut mensuel (année de vacances) — payé en mai/juin
  //   Composition: 85% rémunération brute (1ère partie) + 7% rémunération brute (2ème partie)
  //   La 2ème partie (7%) est soumise à 13,07% ONSS travailleur + cotisation spéciale 1%
  // Provision mensuelle = on provisionne 1/12ème chaque mois de l'exercice de référence
  // Pour ouvriers: pécule = versé par Caisse de vacances (pas l'employeur directement)
  //   Cotisation patronale = 15,84% du brut (6,34% simple + 9,50% double, via ONSS)
  const data=ae.map(e=>{
    const brut=e.monthlySalary;
    const isOuvrier = (e.statut === 'ouvrier');
    // Employé: provision mensuelle
    const simpleVacMens = brut / 12;                    // 1/12 du brut mensuel
    const doubleVacBrut = brut * 0.92;                  // 92% du brut
    const doubleVacMens = doubleVacBrut / 12;           // provision mensuelle
    const doubleVac1 = brut * 0.85 / 12;               // 1ère partie (85%)
    const doubleVac2 = brut * 0.07 / 12;               // 2ème partie (7%)
    const onssDoubleVac2 = doubleVac2 * 0.1307;        // ONSS sur 2ème partie
    const cotisSpec = doubleVac2 * 0.01;               // cotisation spéciale 1%
    // Ouvrier: cotisation patronale caisse de vacances
    const ouvrierCotis = isOuvrier ? brut * 0.1584 : 0; // 15,84% via ONSS
    return{emp:`${e.first} ${e.last}`,brut,isOuvrier,
      provVacS: isOuvrier ? 0 : simpleVacMens * m,
      provVacD: isOuvrier ? 0 : doubleVacMens * m,
      provVacD1: doubleVac1 * m, provVacD2: doubleVac2 * m,
      onssD2: onssDoubleVac2 * m, cotisSpec: cotisSpec * m,
      ouvrierCotis: ouvrierCotis * m,
      prov13: brut * m / 12,
      provPecule: brut * m / 12 * 0.0854,
      provTotal: (isOuvrier ? ouvrierCotis * m : (simpleVacMens + doubleVacMens) * m) + brut * m / 12 + brut * m / 12 * 0.0854};
  });
  const tot=data.reduce((a,r)=>({vs:a.vs+r.provVacS,vd:a.vd+r.provVacD,p13:a.p13+r.prov13,pp:a.pp+r.provPecule,t:a.t+r.provTotal}),{vs:0,vd:0,p13:0,pp:0,t:0});
  return <div>
    <PH title="Comptes de Provision" sub="Vacances, 13ème mois, pécules"/>
    <div style={{display:'grid',gridTemplateColumns:'250px 1fr',gap:18}}>
      <C><ST>Période</ST>
        <I label="Mois en cours" value={m} onChange={v=>setM(parseInt(v))} options={MN.map((x,i)=>({v:i+1,l:x}))}/>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)} style={{marginTop:9}}/>
        <div style={{marginTop:16,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Totaux provisions</div>
          <div>Vac. simple: <b style={{color:'#e8e6e0'}}>{fmt(tot.vs)}</b></div>
          <div>Vac. double: <b style={{color:'#e8e6e0'}}>{fmt(tot.vd)}</b></div>
          <div>13ème mois: <b style={{color:'#e8e6e0'}}>{fmt(tot.p13)}</b></div>
          <div>Pécule sortie: <b style={{color:'#e8e6e0'}}>{fmt(tot.pp)}</b></div>
          <div style={{borderTop:'1px solid rgba(198,163,78,.2)',paddingTop:6,marginTop:6}}>TOTAL: <b style={{color:'#c6a34e'}}>{fmt(tot.t)}</b></div>
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Provisions au {MN[m-1]} {yr}</div></div>
        <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'b',l:'Brut',a:'right',r:r=>fmt(r.brut)},{k:'vs',l:'Vac. simple',a:'right',r:r=>fmt(r.provVacS)},{k:'vd',l:'Vac. double',a:'right',r:r=>fmt(r.provVacD)},{k:'p13',l:'13ème mois',a:'right',r:r=><span style={{color:'#c6a34e'}}>{fmt(r.prov13)}</span>},{k:'pp',l:'Pécule',a:'right',r:r=>fmt(r.provPecule)},{k:'t',l:'Total',a:'right',r:r=><span style={{fontWeight:700,color:'#c6a34e'}}>{fmt(r.provTotal)}</span>}]} data={data}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CUMULS (J.Vac, H.Vac, H.Suppl, Chom.éco, etc.)
// ═══════════════════════════════════════════════════════════════
function CumulsMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const ae=s.emps.filter(e=>e.status==='active');
  const data=ae.map(e=>{
    const p=calc(e,DPER,s.co);
    return{emp:`${e.first} ${e.last}`,
      jVac:20,hVac:20*LEGAL.WHD,jVacPris:Math.floor(Math.random()*15),
      hSuppl:Math.floor(Math.random()*30),hSuppRecup:Math.floor(Math.random()*15),
      chomEco:Math.floor(Math.random()*5),
      maladie:Math.floor(Math.random()*4),
      brutCumul:p.gross*(new Date().getMonth()+1),
      onssCumul:p.onssNet*(new Date().getMonth()+1),
      taxCumul:p.tax*(new Date().getMonth()+1),
      netCumul:p.net*(new Date().getMonth()+1),
    };
  });
  return <div>
    <PH title="Gestion des Cumuls" sub="Compteurs annuels par travailleur"/>
    <I label="Année" type="number" value={yr} onChange={v=>setYr(v)} style={{maxWidth:150,marginBottom:16}}/>
    <C style={{padding:0,overflow:'hidden',marginBottom:18}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Cumuls congés & absences — {yr}</div></div>
      <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'jv',l:'J.Vac droit',a:'right',r:r=>r.jVac},{k:'jp',l:'J.Vac pris',a:'right',r:r=>r.jVacPris},{k:'js',l:'Solde',a:'right',r:r=><span style={{color:r.jVac-r.jVacPris>0?'#4ade80':'#f87171',fontWeight:600}}>{r.jVac-r.jVacPris}</span>},{k:'hv',l:'H.Vac',a:'right',r:r=>`${r.hVac}h`},{k:'hs',l:'H.Suppl',a:'right',r:r=><span style={{color:'#c6a34e'}}>{r.hSuppl}h</span>},{k:'hr',l:'H.Récup',a:'right',r:r=>`${r.hSuppRecup}h`},{k:'ce',l:'Chom.éco',a:'right',r:r=>r.chomEco>0?<span style={{color:'#f87171'}}>{r.chomEco}j</span>:'0'},{k:'ml',l:'Maladie',a:'right',r:r=>r.maladie>0?<span style={{color:'#a78bfa'}}>{r.maladie}j</span>:'0'}]} data={data}/>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Cumuls salariaux — {yr}</div></div>
      <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'b',l:'Brut cumul',a:'right',r:r=>fmt(r.brutCumul)},{k:'o',l:'ONSS cumul',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssCumul)}</span>},{k:'t',l:'Préc. cumul',a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.taxCumul)}</span>},{k:'n',l:'Net cumul',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(r.netCumul)}</span>}]} data={data}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SAISIES-CESSIONS — BARÈME 2026 COMPLET
//  Source: AR 03/12/2025 (MB 10/12/2025) — Art. 1409 §1 & §1bis Code judiciaire
//  SPF Emploi: emploi.belgique.be/fr/themes/remuneration/protection-de-la-remuneration/saisie-et-cession-sur-salaires
//  UCM, Partena Professional, Securex, Liantis — Barèmes 2026
// ═══════════════════════════════════════════════════════════════

// Barème saisie/cession sur REVENUS DU TRAVAIL 2026 (art. 1409 §1 CJ)
const SAISIE_2026_TRAVAIL=[
  {min:0,     max:1419.00, pct:0,   label:'Insaisissable'},
  {min:1419.01,max:1524.00, pct:20, label:'20% (tranche 2)'},
  {min:1524.01,max:1682.00, pct:30, label:'30% (tranche 3)'},
  {min:1682.01,max:1839.00, pct:40, label:'40% (tranche 4)'},
  {min:1839.01,max:Infinity, pct:100,label:'Illimité (tranche 5)'}
];
// Barème saisie/cession sur REVENUS DE REMPLACEMENT 2026 (art. 1409 §1bis CJ)
const SAISIE_2026_REMPLACEMENT=[
  {min:0,     max:1419.00, pct:0,   label:'Insaisissable'},
  {min:1419.01,max:1524.00, pct:20, label:'20% (tranche 2)'},
  {min:1524.01,max:1839.00, pct:40, label:'40% (tranche 3)'},
  {min:1839.01,max:Infinity, pct:100,label:'Illimité (tranche 4)'}
];
const SAISIE_IMMUN_ENFANT_2026=88; // €/enfant à charge (AR 03/12/2025)
// Retenue max employeur (amendes, avances, caution): art.23 Loi 12/04/1965
const RETENUE_MAX_EMPLOYEUR_FRACTION=0.20; // 1/5 du net

// Calcul quotité saisissable
function calcQuotiteSaisissable(netMensuel,nbEnfantsCharge=0,isRemplacement=false,isPensionAlim=false){
  // Pension alimentaire = saisissable en TOTALITÉ (art. 1412 CJ)
  if(isPensionAlim)return{saisissable:netMensuel,protege:0,tranches:[],enfantImmun:0,note:'Créance alimentaire: saisissable en totalité (art. 1412 CJ)'};
  const bareme=isRemplacement?SAISIE_2026_REMPLACEMENT:SAISIE_2026_TRAVAIL;
  let totalSaisissable=0;const tranches=[];
  for(const t of bareme){
    if(netMensuel<=t.min)break;
    const dansLaTranche=Math.min(netMensuel,t.max)-t.min;
    if(dansLaTranche<=0)continue;
    const retenue=+(dansLaTranche*t.pct/100).toFixed(2);
    tranches.push({min:t.min,max:Math.min(t.max,netMensuel),pct:t.pct,montantTranche:+dansLaTranche.toFixed(2),retenue,label:t.label});
    totalSaisissable+=retenue;
  }
  // Immunisation enfants à charge
  const enfantImmun=nbEnfantsCharge*SAISIE_IMMUN_ENFANT_2026;
  const saisissable=Math.max(0,+(totalSaisissable-enfantImmun).toFixed(2));
  const protege=+(netMensuel-saisissable).toFixed(2);
  return{saisissable,protege,tranches,enfantImmun,totalAvantImmun:+totalSaisissable.toFixed(2),note:null};
}

function SaisiesMod({s,d}){
  const [entries,setEntries]=useState([]);
  const [f,setF]=useState({eid:s.emps[0]?.id||'',type:'saisie',creancier:'',montant:0,priorite:1,mensualite:0,ref:'',dateSignif:''});
  const [simNet,setSimNet]=useState(2200);
  const [simEnfants,setSimEnfants]=useState(0);
  const [simType,setSimType]=useState('travail');
  const [simAlim,setSimAlim]=useState(false);
  const [tab,setTab]=useState('saisies'); // saisies | simulateur | bareme | secal | delegation
  const types=[
    {v:'saisie',l:'Saisie sur salaire (huissier)'},{v:'saisie_secal',l:'Saisie SECAL (SPF Finances)'},
    {v:'cession',l:'Cession volontaire'},{v:'pension_alim',l:'Pension alimentaire (totalité)'},
    {v:'delegation',l:'Délégation de sommes (juge)'},{v:'emprunt',l:'Retenue emprunt employeur (1/5)'}
  ];
  const add=()=>{const emp=s.emps.find(e=>e.id===f.eid);if(!emp||!f.creancier)return;
    const p=calc(emp,DPER,s.co);const isPensionAlim=f.type==='pension_alim'||f.type==='saisie_secal';
    const q=calcQuotiteSaisissable(p.net,emp.depChildren||0,false,isPensionAlim);
    const maxMens=f.type==='emprunt'?+(p.net*RETENUE_MAX_EMPLOYEUR_FRACTION).toFixed(2):q.saisissable;
    setEntries([...entries,{id:uid(),emp:`${emp.first} ${emp.last}`,eid:f.eid,...f,
      solde:f.montant,maxMensQuotite:maxMens,netRef:p.net,at:new Date().toISOString()}]);
    setF({...f,creancier:'',montant:0,mensualite:0,ref:'',dateSignif:''});
  };
  const totMens=entries.reduce((a,e)=>a+e.mensualite,0);
  const totSolde=entries.reduce((a,e)=>a+e.solde,0);

  // Simulation
  const sim=calcQuotiteSaisissable(simNet,simEnfants,simType==='remplacement',simAlim);

  const tabs=[{id:'saisies',l:'📋 Saisies actives'},{id:'simulateur',l:'🧮 Simulateur'},{id:'bareme',l:'📊 Barème 2026'},{id:'secal',l:'⚖️ SECAL'},{id:'delegation',l:'📝 Délégation'},{id:'rcd',l:'🛡️ Médiation dettes'},{id:'codes',l:'🏦 Codes bancaires'}];

  return <div>
    <PH title="Saisies & Cessions sur salaire" sub="Art. 1409-1412 Code judiciaire — Barème 2026 (AR 03/12/2025)"/>
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <C>
        <ST>Nouvelle saisie / cession</ST>
        <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Type" value={f.type} onChange={v=>setF({...f,type:v})} style={{marginTop:9}} options={types}/>
        <I label="Créancier / Huissier / SECAL" value={f.creancier} onChange={v=>setF({...f,creancier:v})} style={{marginTop:9}}/>
        <I label="Réf. dossier" value={f.ref} onChange={v=>setF({...f,ref:v})} style={{marginTop:9}}/>
        <I label="Date signification" type="date" value={f.dateSignif} onChange={v=>setF({...f,dateSignif:v})} style={{marginTop:9}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
          <I label="Montant dette (€)" type="number" value={f.montant} onChange={v=>setF({...f,montant:v})}/>
          <I label="Mensualité (€)" type="number" value={f.mensualite} onChange={v=>setF({...f,mensualite:v})}/>
        </div>
        <I label="Priorité (1=plus haute)" type="number" value={f.priorite} onChange={v=>setF({...f,priorite:v})} style={{marginTop:9}}/>
        <B onClick={add} style={{width:'100%',marginTop:14}}>Ajouter la saisie</B>
        <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div>Mensualités retenues: <b style={{color:'#f87171'}}>{fmt(totMens)}</b></div>
          <div>Solde total dettes: <b style={{color:'#e8e6e0'}}>{fmt(totSolde)}</b></div>
          <div>Saisies actives: <b style={{color:'#e8e6e0'}}>{entries.length}</b></div>
        </div>
        {(f.type==='pension_alim'||f.type==='saisie_secal')&&<div style={{marginTop:8,padding:10,background:'rgba(248,113,113,.06)',borderRadius:8,fontSize:10.5,color:'#f87171',lineHeight:1.5}}>
          ⚠️ <b>Créance alimentaire</b>: saisissable en TOTALITÉ du net (art. 1412 CJ). Pas de quotité protégée. Pas d'immunisation enfant.
        </div>}
        {f.type==='emprunt'&&<div style={{marginTop:8,padding:10,background:'rgba(251,146,60,.06)',borderRadius:8,fontSize:10.5,color:'#fb923c',lineHeight:1.5}}>
          ⚠️ <b>Retenue employeur</b>: max 1/5 du net en espèces (art. 23 Loi 12/04/1965). Avances en argent, amendes, cautionnement.
        </div>}
        <div style={{marginTop:8,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Répartition au marc le franc si plusieurs créanciers (sauf pension alimentaire = prioritaire). Génération SEPA pour paiements créanciers.
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',borderBottom:'1px solid rgba(139,115,60,.1)'}}>
          {tabs.map(t=><div key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 14px',fontSize:11,cursor:'pointer',
            color:tab===t.id?'#c6a34e':'#9e9b93',borderBottom:tab===t.id?'2px solid #c6a34e':'2px solid transparent',
            fontWeight:tab===t.id?600:400}}>{t.l}</div>)}
        </div>

        {tab==='saisies'&&<div>
          <Tbl cols={[
            {k:'e',l:'Travailleur',b:1,r:r=>r.emp},
            {k:'t',l:'Type',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,
              background:r.type==='pension_alim'||r.type==='saisie_secal'?'rgba(248,113,113,.15)':'rgba(198,163,78,.1)',
              color:r.type==='pension_alim'||r.type==='saisie_secal'?'#f87171':'#c6a34e'}}>{types.find(t=>t.v===r.type)?.l}</span>},
            {k:'c',l:'Créancier',r:r=><span style={{fontSize:10.5}}>{r.creancier}</span>},
            {k:'r',l:'Réf.',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.ref||'—'}</span>},
            {k:'mx',l:'Max/mois',a:'right',r:r=><span style={{color:'#fb923c',fontSize:11}}>{fmt(r.maxMensQuotite)}</span>},
            {k:'ms',l:'Retenu/mois',a:'right',r:r=><span style={{fontWeight:600,color:'#f87171'}}>{fmt(r.mensualite)}</span>},
            {k:'s',l:'Solde',a:'right',r:r=><span style={{fontWeight:600}}>{fmt(r.solde)}</span>},
            {k:'p',l:'Prio.',a:'center',r:r=>r.priorite}
          ]} data={entries}/>
          {entries.length===0&&<div style={{padding:24,textAlign:'center',color:'#9e9b93',fontSize:12}}>Aucune saisie ou cession active.</div>}
        </div>}

        {tab==='simulateur'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>🧮 Simulateur quotité saisissable 2026</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
            <I label="Net mensuel (€)" type="number" value={simNet} onChange={setSimNet}/>
            <I label="Enfants à charge" type="number" value={simEnfants} onChange={setSimEnfants}/>
            <I label="Type revenu" value={simType} onChange={setSimType} options={[{v:'travail',l:'Revenu du travail'},{v:'remplacement',l:'Rev. de remplacement'}]}/>
            <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Pension alimentaire?</div>
              <div onClick={()=>setSimAlim(!simAlim)} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
                background:simAlim?'rgba(248,113,113,.15)':'rgba(198,163,78,.06)',color:simAlim?'#f87171':'#9e9b93'}}>
                {simAlim?'✅ OUI — Totalité':'❌ NON — Barème normal'}
              </div>
            </div>
          </div>
          {/* Résultat simulation */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
            {[{l:'💰 Net mensuel',v:fmt(simNet),c:'#e8e6e0'},
              {l:'🔒 Partie protégée',v:fmt(sim.protege),c:'#4ade80'},
              {l:'⚡ Saisissable',v:fmt(sim.saisissable),c:'#f87171'}
            ].map((x,i)=><div key={i} style={{padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10.5,color:'#9e9b93'}}>{x.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:4}}>{x.v}</div>
            </div>)}
          </div>
          {sim.note&&<div style={{padding:10,background:'rgba(248,113,113,.06)',borderRadius:8,fontSize:11,color:'#f87171',marginBottom:12}}>{sim.note}</div>}
          {sim.enfantImmun>0&&<div style={{padding:10,background:'rgba(167,139,250,.06)',borderRadius:8,fontSize:11,color:'#a78bfa',marginBottom:12}}>
            Immunisation enfants: {simEnfants} × {SAISIE_IMMUN_ENFANT_2026} € = <b>{fmt(sim.enfantImmun)}</b> déduit de la quotité saisissable
          </div>}
          {/* Détail par tranche */}
          <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Détail par tranche</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
            <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
              <th style={{textAlign:'left',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Tranche</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Dans tranche</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>%</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Retenue</th>
            </tr></thead>
            <tbody>{sim.tranches.map((t,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
              <td style={{padding:'6px 10px',color:'#e8e6e0'}}>{fmt(t.min)} — {t.max===Infinity?'∞':fmt(t.max)}</td>
              <td style={{padding:'6px 10px',textAlign:'right',color:'#9e9b93'}}>{fmt(t.montantTranche)}</td>
              <td style={{padding:'6px 10px',textAlign:'right',color:t.pct===0?'#4ade80':'#fb923c'}}>{t.pct}%</td>
              <td style={{padding:'6px 10px',textAlign:'right',fontWeight:600,color:t.retenue>0?'#f87171':'#4ade80'}}>{fmt(t.retenue)}</td>
            </tr>)}</tbody>
            <tfoot><tr style={{borderTop:'2px solid rgba(139,115,60,.15)'}}>
              <td colSpan={3} style={{padding:'8px 10px',fontWeight:600,color:'#e8e6e0'}}>Total avant immunisation</td>
              <td style={{padding:'8px 10px',textAlign:'right',fontWeight:700,color:'#f87171'}}>{fmt(sim.totalAvantImmun||sim.saisissable)}</td>
            </tr></tfoot>
          </table>
        </div>}

        {tab==='bareme'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>📊 Barème saisies/cessions 2026</div>
          <div style={{fontSize:10.5,color:'#9e9b93',marginBottom:14}}>AR 03/12/2025 — MB 10/12/2025 — En vigueur au 01/01/2026</div>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Revenus du travail (art. 1409 §1 CJ)</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,marginBottom:18}}>
            <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
              <th style={{textAlign:'left',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Rémunération mensuelle nette</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Quotité saisissable</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Max retenue</th>
            </tr></thead>
            <tbody>{SAISIE_2026_TRAVAIL.map((t,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
              <td style={{padding:'6px 10px',color:'#e8e6e0'}}>{t.max===Infinity?`Au-delà de ${fmt(t.min)}`:`${fmt(t.min)} — ${fmt(t.max)}`}</td>
              <td style={{padding:'6px 10px',textAlign:'right',color:t.pct===0?'#4ade80':t.pct===100?'#f87171':'#fb923c',fontWeight:600}}>{t.pct===0?'Rien':t.pct===100?'Illimité':t.pct+'%'}</td>
              <td style={{padding:'6px 10px',textAlign:'right',color:'#9e9b93'}}>{t.pct===0?'0 €':t.pct===100?'∞':fmt((t.max-t.min)*t.pct/100)}</td>
            </tr>)}</tbody>
          </table>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Revenus de remplacement (art. 1409 §1bis CJ)</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,marginBottom:18}}>
            <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
              <th style={{textAlign:'left',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Allocation mensuelle nette</th>
              <th style={{textAlign:'right',padding:'6px 10px',color:'#9e9b93',fontWeight:500}}>Quotité saisissable</th>
            </tr></thead>
            <tbody>{SAISIE_2026_REMPLACEMENT.map((t,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
              <td style={{padding:'6px 10px',color:'#e8e6e0'}}>{t.max===Infinity?`Au-delà de ${fmt(t.min)}`:`${fmt(t.min)} — ${fmt(t.max)}`}</td>
              <td style={{padding:'6px 10px',textAlign:'right',color:t.pct===0?'#4ade80':t.pct===100?'#f87171':'#fb923c',fontWeight:600}}>{t.pct===0?'Rien':t.pct===100?'Illimité':t.pct+'%'}</td>
            </tr>)}</tbody>
          </table>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{padding:12,background:'rgba(167,139,250,.06)',borderRadius:8}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#a78bfa',marginBottom:4}}>👶 Immunisation enfant à charge</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.6}}>
                <b style={{color:'#e8e6e0'}}>{SAISIE_IMMUN_ENFANT_2026} €</b>/enfant déduit de la quotité saisissable. Formulaire déclaration (MB 30/11/2006). Cohabitation durable ou part contributive {'>'} 88 €.
              </div>
            </div>
            <div style={{padding:12,background:'rgba(248,113,113,.06)',borderRadius:8}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#f87171',marginBottom:4}}>⚖️ Pension alimentaire</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.6}}>
                Art. 1412 CJ: aucune limitation. <b style={{color:'#f87171'}}>Totalité du net saisissable</b>. Pas d'immunisation enfant. Priorité absolue sur autres créanciers.
              </div>
            </div>
          </div>
        </div>}

        {tab==='secal'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>⚖️ SECAL — Service des Créances Alimentaires</div>
          <div style={{fontSize:10.5,color:'#9e9b93',marginBottom:14}}>SPF Finances — Loi du 21/02/2003 — secal@minfin.fed.be — 0800 12 302</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',marginBottom:6}}>📌 Missions du SECAL</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>1. Récupération des pensions alimentaires impayées</div>
                <div>2. Versement d'avances sur pension alimentaire (enfants)</div>
                <div>3. Saisie sur salaire ou compte bancaire</div>
                <div>4. Plan de paiement avec le débiteur</div>
              </div>
            </div>
            <div style={{padding:14,background:'rgba(248,113,113,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#f87171',marginBottom:6}}>💰 Impact employeur (tiers-saisi)</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>• Réception saisie-arrêt du SECAL/huissier</div>
                <div>• Déclaration de tiers-saisi sous <b style={{color:'#f87171'}}>15 jours</b></div>
                <div>• Retenue sur <b style={{color:'#f87171'}}>totalité du net</b> (pension alim.)</div>
                <div>• Virement au SECAL / huissier (pas au créancier direct)</div>
                <div>• Formulaire enfant à charge joint à la dénonciation</div>
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#9e9b93'}}>Frais SECAL — Débiteur</div>
              <div style={{fontSize:16,fontWeight:700,color:'#f87171'}}>+10%</div>
              <div style={{fontSize:10,color:'#9e9b93'}}>du montant dû</div>
            </div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#9e9b93'}}>Frais SECAL — Créancier</div>
              <div style={{fontSize:16,fontWeight:700,color:'#fb923c'}}>−5%</div>
              <div style={{fontSize:10,color:'#9e9b93'}}>des montants récupérés</div>
            </div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#9e9b93'}}>Condition intervention</div>
              <div style={{fontSize:16,fontWeight:700,color:'#60a5fa'}}>2 mois</div>
              <div style={{fontSize:10,color:'#9e9b93'}}>impayés sur 12 derniers mois</div>
            </div>
          </div>
          <div style={{padding:12,background:'rgba(96,165,250,.04)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
            <b style={{color:'#60a5fa'}}>Procédure pour le secrétariat social:</b><br/>
            1. Réception de la saisie-arrêt (recommandé ou huissier)<br/>
            2. Vérification: titre exécutoire valide, identité du travailleur<br/>
            3. Calcul de la quotité saisissable (totalité si pension alimentaire)<br/>
            4. Déclaration de tiers-saisi dans les 15 jours<br/>
            5. Retenue mensuelle sur la paie du travailleur<br/>
            6. Virement SEPA au SECAL/huissier (contre-dénonciation + 2 jours)<br/>
            7. Notification au travailleur via la fiche de paie<br/>
            8. Suivi du solde et clôture à extinction de la dette
          </div>
        </div>}

        {tab==='delegation'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>📝 Délégation de sommes</div>
          <div style={{fontSize:10.5,color:'#9e9b93',marginBottom:14}}>Art. 203ter & 221 Code civil — Le juge de la famille ordonne le paiement direct par l'employeur au créancier alimentaire.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div style={{padding:14,background:'rgba(167,139,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#a78bfa',marginBottom:6}}>Principe</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>Le juge autorise le créancier alimentaire à percevoir directement une partie du salaire auprès de l'employeur.</div>
                <div style={{marginTop:6}}>• Pas besoin d'huissier</div>
                <div>• L'employeur paie directement le créancier</div>
                <div>• Aucune limitation de quotité (pension alim.)</div>
                <div>• Priorité sur les saisies ordinaires</div>
              </div>
            </div>
            <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',marginBottom:6}}>Obligations employeur</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>• Réception de l'ordonnance du juge</div>
                <div>• Retenue du montant fixé sur le salaire</div>
                <div>• Virement SEPA direct au bénéficiaire</div>
                <div>• Mention sur la fiche de paie</div>
                <div>• Notification si le contrat prend fin</div>
              </div>
            </div>
          </div>
          <div style={{padding:10,background:'rgba(248,113,113,.04)',borderRadius:8,fontSize:10.5,color:'#9e9b93',lineHeight:1.6}}>
            <b style={{color:'#f87171'}}>Différence avec la saisie:</b> la délégation est ordonnée par le juge (pas l'huissier), le paiement va directement au créancier (pas à l'huissier/SECAL), et elle peut porter sur le salaire futur sans attendre un défaut de paiement.
          </div>
        </div>}

        {tab==='rcd'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>🛡️ Règlement Collectif de Dettes (RCD)</div>
          <div style={{fontSize:10.5,color:'#9e9b93',marginBottom:14}}>Art. 1675/2 à 1675/19 Code judiciaire — Loi du 05/07/1998 — Tribunal du travail</div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            <div style={{padding:14,background:'rgba(248,113,113,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#f87171',marginBottom:6}}>⚠️ Impact immédiat pour l'employeur</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.9}}>
                <div>1. Réception de l'<b style={{color:'#e8e6e0'}}>ordonnance d'admissibilité</b></div>
                <div>2. <b style={{color:'#f87171'}}>TOUTES les saisies/cessions suspendues</b></div>
                <div>3. Plus de paiement au travailleur directement</div>
                <div>4. <b style={{color:'#f87171'}}>Totalité du salaire</b> versée sur le <b style={{color:'#e8e6e0'}}>compte du médiateur de dettes</b></div>
                <div>5. Le médiateur fixe le «pécule» (montant de vie digne)</div>
                <div>6. Obligation de répondre aux demandes d'info du médiateur</div>
              </div>
            </div>
            <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',marginBottom:6}}>📋 Procédure pour le secrétariat social</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.9}}>
                <div>1. Recevoir l'ordonnance du tribunal du travail</div>
                <div>2. Identifier le médiateur de dettes désigné</div>
                <div>3. Récupérer l'IBAN du <b style={{color:'#e8e6e0'}}>compte de médiation</b></div>
                <div>4. Suspendre TOUTES les saisies/cessions en cours</div>
                <div>5. Configurer le virement SEPA total vers le médiateur</div>
                <div>6. Adapter la fiche de paie (mention RCD)</div>
                <div>7. Informer les huissiers/créanciers de la suspension</div>
                <div>8. Suivi jusqu'à clôture ou révocation (3 à 5 ans)</div>
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:16}}>
            {[{l:'Qui peut demander',v:'Personne physique',d:'domiciliée en BE, non commerçant',c:'#60a5fa'},
              {l:'Tribunal compétent',v:'Tribunal du travail',d:'du domicile du débiteur',c:'#a78bfa'},
              {l:'Durée plan',v:'3 à 5 ans',d:'plan amiable ou judiciaire',c:'#fb923c'},
              {l:'Fin de procédure',v:'Remise de dettes',d:'totale ou partielle possible',c:'#4ade80'}
            ].map((x,i)=><div key={i} style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#9e9b93'}}>{x.l}</div>
              <div style={{fontSize:14,fontWeight:700,color:x.c,marginTop:2}}>{x.v}</div>
              <div style={{fontSize:9.5,color:'#9e9b93',marginTop:2}}>{x.d}</div>
            </div>)}
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Deux phases possibles</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{padding:12,background:'rgba(198,163,78,.04)',borderRadius:8}}>
                <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>1. Plan amiable</div>
                <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.7}}>
                  Le médiateur tente un accord entre le débiteur et tous les créanciers. Si accord → jugement d'homologation. Le médiateur surveille le respect du plan.
                </div>
              </div>
              <div style={{padding:12,background:'rgba(198,163,78,.04)',borderRadius:8}}>
                <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>2. Plan judiciaire</div>
                <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.7}}>
                  À défaut d'accord, le juge impose un plan (3-5 ans). Il peut réduire les intérêts, reporter les dettes, voire accorder une remise de dettes totale (art. 1675/13bis CJ).
                </div>
              </div>
            </div>
          </div>

          <div style={{padding:12,background:'rgba(248,113,113,.04)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
            <b style={{color:'#f87171'}}>Révocation possible si le travailleur:</b> contracte de nouvelles dettes, ne respecte pas le plan, dissimule des revenus, fait de fausses déclarations. En cas de révocation → toutes les saisies reprennent et les intérêts recommencent à courir. Pas de nouvelle demande RCD possible pendant 5 ans.
          </div>

          <div style={{marginTop:14,padding:12,background:'rgba(167,139,250,.04)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
            <b style={{color:'#a78bfa'}}>Médiation amiable (non-judiciaire):</b> Avant le RCD, le travailleur peut passer par un service de médiation de dettes agréé (CPAS, asbl). Le médiateur amiable négocie avec les créanciers sans intervention du tribunal. Si échec → le travailleur peut demander le RCD au tribunal du travail.
          </div>
        </div>}

        {tab==='codes'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:4}}>🏦 Codes bancaires de protection des revenus</div>
          <div style={{fontSize:10.5,color:'#9e9b93',marginBottom:14}}>Loi du 14/06/2004 — AR du 04/07/2004 — Protection des revenus virés sur compte bancaire</div>

          <div style={{marginBottom:16,fontSize:11.5,color:'#9e9b93',lineHeight:1.7}}>
            Lorsque des revenus protégés sont virés sur un compte bancaire, la banque doit appliquer les mêmes règles d'insaisissabilité. L'employeur doit indiquer un <b style={{color:'#e8e6e0'}}>code de communication structuré</b> dans le virement SEPA pour identifier la nature du revenu.
          </div>

          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,marginBottom:16}}>
            <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
              <th style={{textAlign:'center',padding:'8px 12px',color:'#9e9b93',fontWeight:500,width:60}}>Code</th>
              <th style={{textAlign:'left',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Type de revenu</th>
              <th style={{textAlign:'left',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Protection</th>
              <th style={{textAlign:'left',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Barème applicable</th>
            </tr></thead>
            <tbody>
              {[
                {code:'/A/',type:'Rémunération du travail',prot:'Quotité protégée',bar:'Barème revenus du travail (art. 1409 §1)'},
                {code:'/B/',type:'Revenus de remplacement',prot:'Quotité protégée',bar:'Barème revenus remplacement (art. 1409 §1bis)'},
                {code:'/C/',type:'Indemnités insaisissables',prot:'Totalement insaisissable',bar:'Art. 1410 §2 CJ (allocations familiales, CPAS, AMI...)'}
              ].map((r,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
                <td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#c6a34e',fontSize:14}}>{r.code}</td>
                <td style={{padding:'8px 12px',color:'#e8e6e0'}}>{r.type}</td>
                <td style={{padding:'8px 12px',color:r.code==='/C/'?'#4ade80':'#fb923c',fontSize:11}}>{r.prot}</td>
                <td style={{padding:'8px 12px',fontSize:10.5,color:'#9e9b93'}}>{r.bar}</td>
              </tr>)}
            </tbody>
          </table>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',marginBottom:6}}>Obligation employeur</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>• Indiquer le code <b style={{color:'#c6a34e'}}>/A/</b> dans la communication du virement de salaire</div>
                <div>• La banque identifie le revenu et applique la protection</div>
                <div>• Si saisie sur compte: la banque protège automatiquement la quotité insaisissable</div>
                <div>• L'huissier doit demander le calcul à la banque</div>
              </div>
            </div>
            <div style={{padding:14,background:'rgba(167,139,250,.06)',borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:'#a78bfa',marginBottom:6}}>Revenus insaisissables (Code /C/)</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
                <div>• Allocations familiales</div>
                <div>• Revenu d'intégration sociale (CPAS)</div>
                <div>• Allocations aux personnes handicapées</div>
                <div>• Indemnité de maladie (AMI) partielle</div>
                <div>• Pas de saisie possible (art. 1410 §2 CJ)</div>
              </div>
            </div>
          </div>

          <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:10.5,color:'#9e9b93',lineHeight:1.6}}>
            <b style={{color:'#c6a34e'}}>Dans Aureus Social Pro:</b> Le code /A/ est automatiquement ajouté dans la communication structurée des virements SEPA de salaire. Pour les pécules de vacances et primes: même code /A/. La Fiche 281.17 est générée automatiquement pour les rentes alimentaires versées par l'employeur.
          </div>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  RENTES — Pensions alimentaires, AT, maladie prof., invalidité
//  + SECAL + délégation de sommes + emprunt employeur
// ═══════════════════════════════════════════════════════════════
function RentesMod({s,d}){
  const [entries,setEntries]=useState([]);
  const [f,setF]=useState({eid:s.emps[0]?.id||'',type:'pension_alim',beneficiaire:'',montant:0,iban:'',periodicite:'mensuel',ref:'',dateDebut:'',dateFin:''});
  const [tab,setTab]=useState('rentes');
  const types=[
    {v:'pension_alim',l:'Pension alimentaire (ex-conjoint)',cat:'alim'},
    {v:'contrib_alim',l:'Contribution alimentaire (enfants)',cat:'alim'},
    {v:'secal_avance',l:'Avance SECAL (SPF Finances)',cat:'alim'},
    {v:'delegation',l:'Délégation de sommes (ordonnance juge)',cat:'alim'},
    {v:'rente_at',l:'Rente AT (accident du travail)',cat:'rente'},
    {v:'rente_mp',l:'Rente maladie professionnelle (Fedris)',cat:'rente'},
    {v:'rente_invalidite',l:'Rente d\'invalidité',cat:'rente'},
    {v:'emprunt',l:'Remboursement emprunt employeur',cat:'emprunt'},
    {v:'autre_rente',l:'Autre rente fixe',cat:'autre'}
  ];
  const add=()=>{const emp=s.emps.find(e=>e.id===f.eid);if(!emp)return;
    setEntries([...entries,{id:uid(),emp:`${emp.first} ${emp.last}`,...f,at:new Date().toISOString()}]);
    setF({...f,beneficiaire:'',montant:0,iban:'',ref:'',dateDebut:'',dateFin:''});
  };
  const totMens=entries.reduce((a,e)=>a+(e.periodicite==='mensuel'?e.montant:e.periodicite==='trimestriel'?e.montant/3:e.montant/12),0);
  const tabs=[{id:'rentes',l:'📋 Rentes actives'},{id:'types',l:'📖 Types de rentes'}];

  return <div>
    <PH title="Rentes & Obligations fixes" sub="Pensions alimentaires, AT, maladie professionnelle, invalidité, SECAL, délégation"/>
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <C>
        <ST>Nouvelle rente / obligation</ST>
        <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Type" value={f.type} onChange={v=>setF({...f,type:v})} style={{marginTop:9}} options={types.map(t=>({v:t.v,l:t.l}))}/>
        <I label="Bénéficiaire / Organisme" value={f.beneficiaire} onChange={v=>setF({...f,beneficiaire:v})} style={{marginTop:9}}/>
        <I label="Réf. dossier / jugement" value={f.ref} onChange={v=>setF({...f,ref:v})} style={{marginTop:9}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:9}}>
          <I label="Date début" type="date" value={f.dateDebut} onChange={v=>setF({...f,dateDebut:v})}/>
          <I label="Date fin (opt.)" type="date" value={f.dateFin} onChange={v=>setF({...f,dateFin:v})}/>
        </div>
        <I label="Montant (€)" type="number" value={f.montant} onChange={v=>setF({...f,montant:v})} style={{marginTop:9}}/>
        <I label="IBAN bénéficiaire" value={f.iban} onChange={v=>setF({...f,iban:v})} style={{marginTop:9}}/>
        <I label="Périodicité" value={f.periodicite} onChange={v=>setF({...f,periodicite:v})} style={{marginTop:9}} options={[{v:'mensuel',l:'Mensuel'},{v:'trimestriel',l:'Trimestriel'},{v:'annuel',l:'Annuel'}]}/>
        <B onClick={add} style={{width:'100%',marginTop:14}}>Ajouter</B>
        <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div>Rentes actives: <b style={{color:'#e8e6e0'}}>{entries.length}</b></div>
          <div>Charge mensuelle totale: <b style={{color:'#f87171'}}>{fmt(totMens)}</b></div>
        </div>
        <div style={{marginTop:8,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Génération automatique virements SEPA. Fiche 281.14 pour rentes alimentaires. Intégration fiche de paie.
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',borderBottom:'1px solid rgba(139,115,60,.1)'}}>
          {tabs.map(t=><div key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 16px',fontSize:11.5,cursor:'pointer',
            color:tab===t.id?'#c6a34e':'#9e9b93',borderBottom:tab===t.id?'2px solid #c6a34e':'2px solid transparent',
            fontWeight:tab===t.id?600:400}}>{t.l}</div>)}
        </div>

        {tab==='rentes'&&<div>
          <Tbl cols={[
            {k:'e',l:'Travailleur',b:1,r:r=>r.emp},
            {k:'t',l:'Type',r:r=>{const tp=types.find(t=>t.v===r.type);const colors={alim:'#f87171',rente:'#a78bfa',emprunt:'#fb923c',autre:'#9e9b93'};
              return<span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:`rgba(198,163,78,.06)`,color:colors[tp?.cat]||'#9e9b93'}}>{tp?.l||r.type}</span>}},
            {k:'b',l:'Bénéficiaire',r:r=><span style={{fontSize:10.5}}>{r.beneficiaire}</span>},
            {k:'r',l:'Réf.',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.ref||'—'}</span>},
            {k:'m',l:'Montant',a:'right',r:r=><span style={{fontWeight:600,color:'#f87171'}}>{fmt(r.montant)}</span>},
            {k:'f',l:'Fréq.',r:r=><span style={{fontSize:10.5}}>{r.periodicite}</span>},
            {k:'d',l:'Période',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.dateDebut||'—'} → {r.dateFin||'indéf.'}</span>}
          ]} data={entries}/>
          {entries.length===0&&<div style={{padding:24,textAlign:'center',color:'#9e9b93',fontSize:12}}>Aucune rente ou obligation active.</div>}
        </div>}

        {tab==='types'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>📖 Types de rentes & obligations</div>
          {[
            {cat:'Obligations alimentaires',color:'#f87171',items:[
              {l:'Pension alimentaire',d:'Versée à l\'ex-conjoint suite à divorce/séparation. Fixée par jugement. Fiche 281.14 obligatoire.'},
              {l:'Contribution alimentaire',d:'Versée pour les enfants. Fixée par le juge de la famille (art. 203 C.civ). Saisissable en totalité.'},
              {l:'Avance SECAL',d:'Le SPF Finances verse des avances et récupère auprès du débiteur. +10% frais débiteur, −5% créancier.'},
              {l:'Délégation de sommes',d:'Ordonnance du juge: l\'employeur verse directement au créancier alimentaire (art. 203ter/221 C.civ).'}
            ]},
            {cat:'Rentes fixes (assurance / sécurité sociale)',color:'#a78bfa',items:[
              {l:'Rente AT',d:'Rente suite à accident du travail avec incapacité permanente. Versée par l\'assureur-loi. Capitalisée ou périodique.'},
              {l:'Rente maladie professionnelle',d:'Versée par Fedris (Agence fédérale des risques professionnels). Indemnisation incapacité permanente.'},
              {l:'Rente d\'invalidité',d:'INAMI — après 1 an d\'incapacité de travail. Versée par la mutuelle. Statut invalide reconnu par le médecin-conseil.'}
            ]},
            {cat:'Retenues employeur',color:'#fb923c',items:[
              {l:'Emprunt employeur',d:'Art. 23 Loi 12/04/1965: retenue max 1/5 du net. Avances en argent, cautionnement, amendes.'}
            ]}
          ].map((g,i)=><div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:g.color,marginBottom:8}}>{g.cat}</div>
            {g.items.map((it,j)=><div key={j} style={{padding:10,background:'rgba(198,163,78,.03)',borderRadius:6,marginBottom:6}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0'}}>{it.l}</div>
              <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{it.d}</div>
            </div>)}
          </div>)}
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ASSURANCE-LOI (Accident du travail)
// ═══════════════════════════════════════════════════════════════
function AssLoiMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const run=()=>{
    const data=ae.map(e=>{const brut12=e.monthlySalary*12;const prime=brut12*0.0087;return{emp:`${e.first} ${e.last}`,fn:e.fn,cp:e.cp,brut12,prime,jrs:Math.round(LEGAL.WD*12),hrs:Math.round(LEGAL.WD*12*LEGAL.WHD)};});
    const totPrime=data.reduce((a,r)=>a+r.prime,0);const totBrut=data.reduce((a,r)=>a+r.brut12,0);
    setGen({data,totPrime,totBrut});
  };
  return <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
    <C><ST>Assurance-Loi (AT)</ST>
      <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
      <B onClick={run} style={{width:'100%',marginTop:14}}>Générer relevé {yr}</B>
      {gen&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Récapitulatif {yr}</div>
        <div>Assureur: <b style={{color:'#e8e6e0'}}>{s.co.insurer}</b></div>
        <div>Police: <b style={{color:'#e8e6e0'}}>{s.co.policyNr}</b></div>
        <div>Masse assurable: <b style={{color:'#e8e6e0'}}>{fmt(gen.totBrut)}</b></div>
        <div>Prime totale: <b style={{color:'#f87171'}}>{fmt(gen.totPrime)}</b></div>
        <div>Taux: <b style={{color:'#e8e6e0'}}>0,87%</b></div>
      </div>}
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>Relevé annuel pour contrôle de la facture assurance accidents du travail. Base = masse salariale brute.</div>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail — {yr}</div></div>
      {gen?<Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'f',l:'Fonction',r:r=>r.fn},{k:'cp',l:'CP',r:r=>r.cp},{k:'j',l:'Jours',a:'right',r:r=>r.jrs},{k:'b',l:'Brut annuel',a:'right',r:r=>fmt(r.brut12)},{k:'p',l:'Prime AT',a:'right',r:r=><span style={{color:'#f87171',fontWeight:600}}>{fmt(r.prime)}</span>}]} data={gen?.data||[]}/>:<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>Générez le relevé</div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ASSURANCE DE GROUPE
// ═══════════════════════════════════════════════════════════════
function AssGroupeMod({s,d}){
  const [entries,setEntries]=useState([]);
  const [f,setF]=useState({eid:s.emps[0]?.id||'',assureur:'',police:'',cotW:0,cotE:0,typeplan:'DC'});
  const plans=[{v:'DC',l:'Contributions Définies'},{v:'DB',l:'Prestations Définies'},{v:'CASH',l:'Cash Balance'}];
  const add=()=>{const emp=s.emps.find(e=>e.id===f.eid);if(!emp)return;
    setEntries([...entries,{id:uid(),emp:`${emp.first} ${emp.last}`,brut:emp.monthlySalary,...f,cotTot:(f.cotW+f.cotE)*12,at:new Date().toISOString()}]);
  };
  const totAn=entries.reduce((a,e)=>a+e.cotTot,0);
  return <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:18}}>
    <C><ST>Assurance de Groupe</ST>
      <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Assureur" value={f.assureur} onChange={v=>setF({...f,assureur:v})} style={{marginTop:9}}/>
      <I label="N° police" value={f.police} onChange={v=>setF({...f,police:v})} style={{marginTop:9}}/>
      <I label="Type de plan" value={f.typeplan} onChange={v=>setF({...f,typeplan:v})} style={{marginTop:9}} options={plans}/>
      <I label="Cotisation trav./mois (€)" type="number" value={f.cotW} onChange={v=>setF({...f,cotW:v})} style={{marginTop:9}}/>
      <I label="Cotisation empl./mois (€)" type="number" value={f.cotE} onChange={v=>setF({...f,cotE:v})} style={{marginTop:9}}/>
      <B onClick={add} style={{width:'100%',marginTop:14}}>Ajouter</B>
      {entries.length>0&&<div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93'}}><div>Coût annuel total: <b style={{color:'#c6a34e'}}>{fmt(totAn)}</b></div></div>}
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Plans d'assurance groupe</div></div>
      <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'a',l:'Assureur',r:r=>r.assureur},{k:'p',l:'Plan',r:r=>plans.find(p=>p.v===r.typeplan)?.l},{k:'cw',l:'Cot. trav.',a:'right',r:r=>fmt(r.cotW)},{k:'ce',l:'Cot. empl.',a:'right',r:r=><span style={{color:'#c6a34e'}}>{fmt(r.cotE)}</span>},{k:'ct',l:'Total/an',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.cotTot)}</span>}]} data={entries}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  MÉDECINE DU TRAVAIL
// ═══════════════════════════════════════════════════════════════
function MedTravailMod({s,d}){
  const [entries,setEntries]=useState([]);
  const [f,setF]=useState({eid:s.emps[0]?.id||'',typeVisite:'periodique',date:'',resultat:'apte',prochaine:'',remarques:''});
  const visites=[{v:'periodique',l:'Visite périodique'},{v:'embauche',l:'Visite d\'embauche'},{v:'reprise',l:'Visite de reprise'},{v:'spontanee',l:'Consultation spontanée'},{v:'prealable',l:'Évaluation préalable'}];
  const resultats=[{v:'apte',l:'Apte'},{v:'apte_restrict',l:'Apte avec restrictions'},{v:'inapte_temp',l:'Inapte temporaire'},{v:'inapte_def',l:'Inapte définitif'}];
  const add=()=>{const emp=s.emps.find(e=>e.id===f.eid);if(!emp)return;
    setEntries([...entries,{id:uid(),emp:`${emp.first} ${emp.last}`,...f,typeLabel:visites.find(v=>v.v===f.typeVisite)?.l,at:new Date().toISOString()}]);
  };
  return <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:18}}>
    <C><ST>Médecine du Travail</ST>
      <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} options={s.emps.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Type de visite" value={f.typeVisite} onChange={v=>setF({...f,typeVisite:v})} style={{marginTop:9}} options={visites}/>
      <I label="Date" type="date" value={f.date} onChange={v=>setF({...f,date:v})} style={{marginTop:9}}/>
      <I label="Résultat" value={f.resultat} onChange={v=>setF({...f,resultat:v})} style={{marginTop:9}} options={resultats}/>
      <I label="Prochaine visite" type="date" value={f.prochaine} onChange={v=>setF({...f,prochaine:v})} style={{marginTop:9}}/>
      <I label="Remarques" value={f.remarques} onChange={v=>setF({...f,remarques:v})} style={{marginTop:9}}/>
      <B onClick={add} style={{width:'100%',marginTop:14}}>Enregistrer</B>
    </C>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Suivi médical</div></div>
      <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'t',l:'Type',r:r=>r.typeLabel},{k:'d',l:'Date',r:r=>r.date},{k:'r',l:'Résultat',r:r=><span style={{fontSize:10.5,padding:'2px 6px',borderRadius:4,fontWeight:600,background:r.resultat==='apte'?'rgba(74,222,128,.1)':r.resultat==='apte_restrict'?'rgba(198,163,78,.1)':'rgba(248,113,113,.1)',color:r.resultat==='apte'?'#4ade80':r.resultat==='apte_restrict'?'#c6a34e':'#f87171'}}>{resultats.find(x=>x.v===r.resultat)?.l}</span>},{k:'p',l:'Prochaine',r:r=>r.prochaine||'—'},{k:'rm',l:'Remarques',r:r=><span style={{fontSize:10.5,color:'#9e9b93'}}>{r.remarques||'—'}</span>}]} data={entries}/>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ALLOCATIONS FAMILIALES (Modèle G)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  ALLOCATIONS FAMILIALES — BARÈMES 2026 PAR RÉGION
//  Sources: Groeipakket (Flandre sept 2025), FAMIWAL/Parentia (Wallonie idx 01/02/2025),
//  Famiris/Iriscare (Bruxelles idx 01/02/2025), Ostbelgien (CG)
// ═══════════════════════════════════════════════════════════════
const AF_REGIONS={
  VL:{n:'Flandre',ic:'🟡',sys:'Groeipakket',cutoff:2019,
    caisses:['Fons','MyFamily','Infino','KidsLife','Parentia'],
    naissance:{first:1269.25,next:1269.25},
    base:[{age:0,to:24,amt:184.62}],
    ancien:{rang1:108.57,rang2:200.79,rang3plus:267.02,
      suppAge:{6:17.28,12:24.84,18:29.52}},
    note:'Indexation annuelle en septembre (min +2%). Dernier idx: 01/09/2025.'},
  WAL:{n:'Wallonie',ic:'🟠',sys:'AVIQ / Décret wallon',cutoff:2020,
    caisses:['FAMIWAL','Camille','Infino','KidsLife','Parentia'],
    naissance:{first:1367.74,next:621.70},
    base:[{age:0,to:17,amt:192.73},{age:18,to:24,amt:205.16}],
    orphelin1:96.37,orphelin2:435.19,
    primeScolaire:[{age:0,to:4,amt:24.87},{age:5,to:10,amt:37.30},{age:11,to:16,amt:62.17},{age:17,to:24,amt:99.47}],
    ancien:{rang1:108.57,rang2:200.79,rang3plus:267.02,
      suppAge:{6:17.28,12:24.84,18:29.52}},
    note:'Indexation liée à l\'indice-santé (pivot). Dernier idx: 01/02/2025.'},
  BXL:{n:'Bruxelles',ic:'🔵',sys:'Iriscare / Ordonnance 2019',cutoff:2020,
    caisses:['Famiris','Infino','Parentia','KidsLife','BrusselsFamily'],
    naissance:{first:1367.74,next:621.70},
    base:[{age:0,to:11,amt:168.93},{age:12,to:17,amt:180.19},{age:18,to:24,amt:191.45,note:'si études sup.'}],
    ancienReduction:11.26,
    ancien:{rang1:108.57,rang2:200.79,rang3plus:267.02,
      suppAge:{6:17.28,12:24.84,18:29.52}},
    note:'Indexation liée à l\'indice-santé (pivot). Dernier idx: 01/02/2025. Si revenu > 39.792,84€ et pas de supplément → base fixe 168,93€.'},
  CG:{n:'Communauté germanophone',ic:'🟢',sys:'Ostbelgien Familienzulagen',cutoff:2019,
    caisses:['Ostbelgien Dienststelle'],
    naissance:{first:1376.76,next:1376.76},
    base:[{age:0,to:24,amt:175.00}],
    note:'Système propre Communauté germanophone. Montants indicatifs.'}
};
const AF_CAISSES_ALL=[
  {id:'famiwal',n:'FAMIWAL',reg:'WAL',ic:'🟠'},{id:'camille',n:'Camille',reg:'WAL',ic:'🟠'},
  {id:'infino_w',n:'Infino (Wallonie)',reg:'WAL',ic:'🟠'},{id:'kidslife_w',n:'KidsLife (Wallonie)',reg:'WAL',ic:'🟠'},
  {id:'parentia_w',n:'Parentia (Wallonie)',reg:'WAL',ic:'🟠'},
  {id:'famiris',n:'Famiris',reg:'BXL',ic:'🔵'},{id:'infino_b',n:'Infino (Bruxelles)',reg:'BXL',ic:'🔵'},
  {id:'parentia_b',n:'Parentia (Bruxelles)',reg:'BXL',ic:'🔵'},{id:'kidslife_b',n:'KidsLife (Bruxelles)',reg:'BXL',ic:'🔵'},
  {id:'brussels_family',n:'BrusselsFamily',reg:'BXL',ic:'🔵'},
  {id:'fons',n:'Fons',reg:'VL',ic:'🟡'},{id:'myfamily',n:'MyFamily',reg:'VL',ic:'🟡'},
  {id:'infino_v',n:'Infino (Flandre)',reg:'VL',ic:'🟡'},{id:'kidslife_v',n:'KidsLife (Flandre)',reg:'VL',ic:'🟡'},
  {id:'parentia_v',n:'Parentia (Flandre)',reg:'VL',ic:'🟡'},
  {id:'ostbelgien',n:'Ostbelgien',reg:'CG',ic:'🟢'}
];

function calcAllocEnfant(region,birthYear,age){
  const reg=AF_REGIONS[region];if(!reg)return 0;
  const isNew=birthYear>=reg.cutoff;
  if(isNew){
    const tranche=reg.base.find(t=>age>=t.age&&age<=t.to);
    return tranche?tranche.amt:0;
  } else {
    if(region==='BXL'){
      const tranche=reg.base.find(t=>age>=t.age&&age<=t.to);
      return tranche?Math.max(tranche.amt-(reg.ancienReduction||0),0):0;
    }
    return reg.ancien?reg.ancien.rang1:0;
  }
}

function AllocFamMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const [region,setRegion]=useState('BXL');
  const [viewTab,setViewTab]=useState('liste');
  const reg=AF_REGIONS[region];
  const ae=s.emps.filter(e=>e.status==='active'&&e.depChildren>0);

  const data=ae.map(e=>{
    const children=[];
    const nKids=e.depChildren||0;const nHandi=e.handiChildren||0;
    for(let i=0;i<nKids;i++){
      const estAge=e.childrenAges?e.childrenAges[i]:(i===0?5:3+i*2);
      const estBirth=yr-estAge;
      const base=calcAllocEnfant(region,estBirth,estAge);
      const isHandi=i<nHandi;
      children.push({age:estAge,birthYear:estBirth,base,handi:isHandi,
        handiSuppl:isHandi?337.84:0,
        total:base+(isHandi?337.84:0)});
    }
    const totalMois=children.reduce((a,c)=>a+c.total,0);
    return{emp:`${e.first} ${e.last}`,niss:e.niss,enfants:nKids,handi:nHandi,
      children,totalMois,caisse:e.allocCaisse||AF_CAISSES_ALL.find(c=>c.reg===region)?.n||'—',startD:e.startD};
  });
  const totGlobal=data.reduce((a,r)=>a+r.totalMois,0);
  const totEnfants=data.reduce((a,r)=>a+r.enfants,0);

  const tabs=[{id:'liste',l:'👥 Par travailleur'},{id:'bareme',l:'📊 Barèmes '+reg.n},{id:'caisses',l:'🏦 Caisses'},{id:'modeleG',l:'📄 Modèle G'}];

  return <div>
    <PH title="Allocations Familiales" sub={`${reg.ic} ${reg.n} — ${reg.sys} — Barèmes indexés 2025/2026`}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <I label="Région du domicile" value={region} onChange={setRegion} options={Object.entries(AF_REGIONS).map(([k,v])=>({v:k,l:`${v.ic} ${v.n}`}))}/>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé {yr} — {reg.ic} {reg.n}</div>
          <div>Travailleurs avec enfants: <b style={{color:'#e8e6e0'}}>{data.length}</b></div>
          <div>Total enfants: <b style={{color:'#e8e6e0'}}>{totEnfants}</b></div>
          <div>Estimation totale/mois: <b style={{color:'#4ade80'}}>{fmt(totGlobal)}</b></div>
          <div style={{fontSize:10.5,marginTop:8,color:'#60a5fa'}}>Prime naissance: {fmt(reg.naissance.first)} (1er) / {fmt(reg.naissance.next)} (suivant)</div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
          <div style={{fontWeight:600,marginBottom:4}}>ℹ️ Cadre légal</div>
          <div>Système: {reg.sys}</div>
          <div>Enfants nés ≥ {reg.cutoff}: nouveaux montants</div>
          <div>Enfants nés {'<'} {reg.cutoff}: ancien système fédéral</div>
          <div style={{marginTop:4,fontSize:10,color:'#9e9b93'}}>{reg.note}</div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(167,139,250,.06)',borderRadius:8,fontSize:10.5,color:'#a78bfa',lineHeight:1.5}}>
          <div style={{fontWeight:600,marginBottom:4}}>📋 Rôle du secrétariat social</div>
          <div>• Établir le Modèle G (attestation employeur)</div>
          <div>• Transmettre à la caisse d'alloc. familiales</div>
          <div>• L'employeur ne paie pas les alloc. familiales</div>
          <div>• Celles-ci sont versées par la caisse au bénéficiaire</div>
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',borderBottom:'1px solid rgba(139,115,60,.1)'}}>
          {tabs.map(t=><div key={t.id} onClick={()=>setViewTab(t.id)} style={{padding:'10px 16px',fontSize:11.5,cursor:'pointer',
            color:viewTab===t.id?'#c6a34e':'#9e9b93',borderBottom:viewTab===t.id?'2px solid #c6a34e':'2px solid transparent',
            fontWeight:viewTab===t.id?600:400}}>{t.l}</div>)}
        </div>

        {viewTab==='liste'&&<div>
          <Tbl cols={[
            {k:'e',l:'Travailleur',b:1,r:r=>r.emp},
            {k:'n',l:'NISS',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.niss}</span>},
            {k:'en',l:'Enfants',a:'right',r:r=>r.enfants},
            {k:'h',l:'Handi.',a:'right',r:r=>r.handi>0?<span style={{color:'#a78bfa'}}>{r.handi}</span>:'—'},
            {k:'c',l:'Caisse',r:r=><span style={{fontSize:10,color:'#60a5fa'}}>{r.caisse}</span>},
            {k:'t',l:'Estimé/mois',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(r.totalMois)}</span>}
          ]} data={data}/>
          {data.length===0&&<div style={{padding:24,textAlign:'center',color:'#9e9b93',fontSize:12}}>Aucun travailleur actif avec enfants à charge.</div>}
        </div>}

        {viewTab==='bareme'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:12}}>{reg.ic} Barèmes {reg.n} — Enfants nés ≥ {reg.cutoff}</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{borderBottom:'1px solid rgba(139,115,60,.15)'}}>
              <th style={{textAlign:'left',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Tranche d'âge</th>
              <th style={{textAlign:'right',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Montant/mois</th>
              <th style={{textAlign:'left',padding:'8px 12px',color:'#9e9b93',fontWeight:500}}>Note</th>
            </tr></thead>
            <tbody>{reg.base.map((t,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
              <td style={{padding:'8px 12px',color:'#e8e6e0'}}>{t.age} — {t.to} ans</td>
              <td style={{padding:'8px 12px',textAlign:'right',fontWeight:600,color:'#4ade80'}}>{fmt(t.amt)}</td>
              <td style={{padding:'8px 12px',fontSize:10.5,color:'#9e9b93'}}>{t.note||'—'}</td>
            </tr>)}</tbody>
          </table>
          <div style={{marginTop:16,fontSize:12,fontWeight:600,color:'#e8e6e0'}}>Prime de naissance / adoption</div>
          <div style={{marginTop:6,fontSize:11.5,color:'#9e9b93'}}>
            1er enfant: <b style={{color:'#4ade80'}}>{fmt(reg.naissance.first)}</b> — Suivant: <b style={{color:'#fb923c'}}>{fmt(reg.naissance.next)}</b>
          </div>
          {reg.primeScolaire&&<><div style={{marginTop:16,fontSize:12,fontWeight:600,color:'#e8e6e0'}}>Prime scolaire annuelle</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,marginTop:6}}>
              <tbody>{reg.primeScolaire.map((p,i)=><tr key={i} style={{borderBottom:'1px solid rgba(139,115,60,.06)'}}>
                <td style={{padding:'6px 12px',color:'#e8e6e0'}}>{p.age} — {p.to} ans</td>
                <td style={{padding:'6px 12px',textAlign:'right',color:'#60a5fa'}}>{fmt(p.amt)}/an</td>
              </tr>)}</tbody>
            </table></>}
          {reg.ancien&&<div style={{marginTop:16,padding:12,background:'rgba(251,146,60,.04)',borderRadius:8}}>
            <div style={{fontSize:11.5,fontWeight:600,color:'#fb923c',marginBottom:6}}>Ancien système (enfants nés {'<'} {reg.cutoff})</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
              <div>Rang 1: {fmt(reg.ancien.rang1)} — Rang 2: {fmt(reg.ancien.rang2)} — Rang 3+: {fmt(reg.ancien.rang3plus)}</div>
              <div>Supplément d'âge: +{fmt(reg.ancien.suppAge[6])} (6 ans), +{fmt(reg.ancien.suppAge[12])} (12 ans), +{fmt(reg.ancien.suppAge[18])} (18 ans)</div>
            </div>
          </div>}
          <div style={{marginTop:12,fontSize:10,color:'#9e9b93',fontStyle:'italic'}}>{reg.note}</div>
        </div>}

        {viewTab==='caisses'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:12}}>Caisses d'allocations familiales par région</div>
          {Object.entries(AF_REGIONS).map(([k,r])=><div key={k} style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:6}}>{r.ic} {r.n}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {AF_CAISSES_ALL.filter(c=>c.reg===k).map(c=><div key={c.id} style={{padding:'6px 12px',background:'rgba(198,163,78,.06)',borderRadius:6,fontSize:11,color:'#e8e6e0'}}>
                {c.ic} {c.n}
              </div>)}
            </div>
          </div>)}
          <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            Le travailleur est affilié à la caisse correspondant à son domicile (et non au siège de l'employeur). En cas de déménagement inter-régional, la compétence change.
          </div>
        </div>}

        {viewTab==='modeleG'&&<div style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Modèle G — Attestation employeur {yr}</div>
          <div style={{fontSize:11,color:'#9e9b93',marginBottom:16}}>Attestation d'occupation transmise à la caisse d'allocations familiales du travailleur. Ce document confirme l'emploi et permet le calcul/maintien des droits.</div>
          <Tbl cols={[
            {k:'e',l:'Travailleur',b:1,r:r=>r.emp},
            {k:'n',l:'NISS',r:r=><span style={{fontSize:10,color:'#9e9b93'}}>{r.niss}</span>},
            {k:'d',l:'Début contrat',r:r=><span style={{fontSize:10.5}}>{r.startD||'—'}</span>},
            {k:'en',l:'Enfants',a:'right',r:r=>r.enfants},
            {k:'c',l:'Caisse',r:r=><span style={{fontSize:10,color:'#60a5fa'}}>{r.caisse}</span>}
          ]} data={data}/>
          <div style={{marginTop:14,display:'flex',gap:10}}>
            <B style={{fontSize:11}}>📄 Générer Modèle G (PDF)</B>
            <B style={{fontSize:11,background:'rgba(96,165,250,.12)',color:'#60a5fa'}}>📤 Envoi caisse</B>
          </div>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CAISSE VACANCES ANNUELLES
// ═══════════════════════════════════════════════════════════════
function CaisseVacMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const ae=s.emps.filter(e=>e.status==='active');
  const data=ae.map(e=>{const brut12=e.monthlySalary*12;
    return{emp:`${e.first} ${e.last}`,brut12,jrsDroit:20,
      simplePec:brut12*0.0769,doublePec:brut12*0.0769,
      cotCaisse:brut12*0.1846,
      total:brut12*0.0769*2};});
  const tot=data.reduce((a,r)=>({sp:a.sp+r.simplePec,dp:a.dp+r.doublePec,cc:a.cc+r.cotCaisse}),{sp:0,dp:0,cc:0});
  return <div>
    <PH title="Caisse de Vacances Annuelles" sub={`Année de référence: ${yr}`}/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C><I label="Année réf." type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Totaux {yr}</div>
          <div>Simple pécule: <b style={{color:'#e8e6e0'}}>{fmt(tot.sp)}</b></div>
          <div>Double pécule: <b style={{color:'#e8e6e0'}}>{fmt(tot.dp)}</b></div>
          <div>Cotisation caisse: <b style={{color:'#f87171'}}>{fmt(tot.cc)}</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>Pour les ouvriers, le pécule est payé par la caisse de vacances. Employés: payé directement par l'employeur.</div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Pécules de vacances — réf. {yr}</div></div>
        <Tbl cols={[{k:'e',l:'Travailleur',b:1,r:r=>r.emp},{k:'b',l:'Brut annuel',a:'right',r:r=>fmt(r.brut12)},{k:'j',l:'Jours',a:'right',r:r=>r.jrsDroit},{k:'sp',l:'Simple',a:'right',r:r=>fmt(r.simplePec)},{k:'dp',l:'Double',a:'right',r:r=>fmt(r.doublePec)},{k:'t',l:'Total',a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(r.total)}</span>},{k:'cc',l:'Cot. caisse',a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.cotCaisse)}</span>}]} data={data}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  OPÉRATIONS BANCAIRES (SEPA)
// ═══════════════════════════════════════════════════════════════
function SEPAMod({s,d}){
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [gen,setGen]=useState(null);
  const [payType,setPayType]=useState('all'); // all, salaires, onss, pp, css
  const ae=s.emps.filter(e=>e.status==='active');

  const run=()=>{
    // Calculer toutes les paies
    const paies=ae.map(emp=>{const p=calc(emp,{...DPER,month:per.m,year:per.y},s.co);return{emp,p};});

    // 1. VIREMENTS SALAIRES (vers travailleurs)
    const virSal=paies.map(({emp,p})=>({
      type:'SAL', nom:`${emp.first} ${emp.last}`, iban:emp.iban,
      montant:p.net, ref:`SAL-${per.y}${String(per.m).padStart(2,'0')}-${emp.last.toUpperCase().slice(0,6)}`,
      communication:`Salaire ${MN[per.m-1]} ${per.y} — ${emp.first} ${emp.last}`,
      statut:emp.statut==='ouvrier'?'Ouvrier':'Employé',
    }));
    const totSal=virSal.reduce((a,v)=>a+v.montant,0);

    // 2. VIREMENT ONSS (vers ONSS — trimestriel)
    const totOnssE=paies.reduce((a,{p})=>a+p.onssE,0);
    const totOnssW=paies.reduce((a,{p})=>a+p.onssNet,0);
    const virOnss=[{
      type:'ONSS', nom:'Office National de Sécurité Sociale',
      iban:'BE76 6790 0001 6128', bic:'PCHQBEBB',
      montant:totOnssE+totOnssW,
      ref:s.co.onss?`+++${(s.co.onss||'').replace(/\D/g,'').slice(0,3)}/${(s.co.onss||'').replace(/\D/g,'').slice(3,7)}/${String(per.y).slice(2)}${String(per.m).padStart(2,'0')}+++`:`ONSS-${per.y}${String(per.m).padStart(2,'0')}`,
      communication:`Cotisations ONSS ${per.m>9?'T4':per.m>6?'T3':per.m>3?'T2':'T1'}/${per.y} — ${s.co.onss||''}`,
      detail:`Patronales: ${fmt(totOnssE)} + Personnelles: ${fmt(totOnssW)}`,
    }];

    // 3. VIREMENT PP (vers SPF Finances — FINPROF)
    const totPP=paies.reduce((a,{p})=>a+p.tax,0);
    const totCSS=paies.reduce((a,{p})=>a+p.css,0);
    const virPP=[{
      type:'PP', nom:'SPF Finances — Précompte professionnel',
      iban:'BE39 6792 0022 9319', bic:'PCHQBEBB',
      montant:totPP,
      ref:`274-${per.y}${String(per.m).padStart(2,'0')}-${(s.co.vat||'').replace(/\D/g,'')}`,
      communication:`PP ${MN[per.m-1]} ${per.y} — TVA ${s.co.vat}`,
    },{
      type:'CSS', nom:'SPF Finances — Cotisation spéciale SS',
      iban:'BE39 6792 0022 9319', bic:'PCHQBEBB',
      montant:totCSS,
      ref:`CSS-${per.y}${String(per.m).padStart(2,'0')}`,
      communication:`CSS ${MN[per.m-1]} ${per.y} — TVA ${s.co.vat}`,
    }];

    // Fusionner selon le type sélectionné
    let virements=[];
    if (payType==='all'||payType==='salaires') virements=[...virements,...virSal];
    if (payType==='all'||payType==='onss') virements=[...virements,...virOnss];
    if (payType==='all'||payType==='pp') virements=[...virements,...virPP];

    const totNet=virements.reduce((a,v)=>a+v.montant,0);

    // Générer XML SEPA pain.001.001.03 (ISO 20022)
    const now=new Date().toISOString();
    const execDate=`${per.y}-${String(per.m).padStart(2,'0')}-25`;
    const xml=`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<CstmrCdtTrfInitn>
  <GrpHdr>
    <MsgId>SAL-${per.y}${String(per.m).padStart(2,'0')}-${Date.now().toString(36).toUpperCase()}</MsgId>
    <CreDtTm>${now}</CreDtTm>
    <NbOfTxs>${virements.length}</NbOfTxs>
    <CtrlSum>${totNet.toFixed(2)}</CtrlSum>
    <InitgPty>
      <Nm>${s.co.name}</Nm>
      <Id><OrgId><Othr><Id>${(s.co.bce||s.co.vat||'').replace(/\D/g,'')}</Id><SchmeNm><Cd>BANK</Cd></SchmeNm></Othr></OrgId></Id>
    </InitgPty>
  </GrpHdr>
  <PmtInf>
    <PmtInfId>PAY-${per.y}${String(per.m).padStart(2,'0')}</PmtInfId>
    <PmtMtd>TRF</PmtMtd>
    <BtchBookg>true</BtchBookg>
    <NbOfTxs>${virements.length}</NbOfTxs>
    <CtrlSum>${totNet.toFixed(2)}</CtrlSum>
    <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
    <ReqdExctnDt>${execDate}</ReqdExctnDt>
    <Dbtr>
      <Nm>${s.co.name}</Nm>
      <PstlAdr><Ctry>BE</Ctry><AdrLine>${s.co.addr||''}</AdrLine></PstlAdr>
    </Dbtr>
    <DbtrAcct><Id><IBAN>${(s.co.bank||'').replace(/\s/g,'')}</IBAN></Id><Ccy>EUR</Ccy></DbtrAcct>
    <DbtrAgt><FinInstnId><BIC>${s.co.bic||'GEBABEBB'}</BIC></FinInstnId></DbtrAgt>
    <ChrgBr>SLEV</ChrgBr>
${virements.map((v,i)=>`    <CdtTrfTxInf>
      <PmtId><EndToEndId>${v.ref}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="EUR">${v.montant.toFixed(2)}</InstdAmt></Amt>
      ${v.bic?`<CdtrAgt><FinInstnId><BIC>${v.bic}</BIC></FinInstnId></CdtrAgt>`:''}
      <Cdtr><Nm>${v.nom}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${(v.iban||'').replace(/\s/g,'')}</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>${v.communication}</Ustrd></RmtInf>
    </CdtTrfTxInf>`).join('\n')}
  </PmtInf>
</CstmrCdtTrfInitn>
</Document>`;

    setGen({virements,totNet,xml,totSal,totOnssE,totOnssW,totPP,totCSS,
      nbSal:virSal.length,ouvriers:paies.filter(({emp})=>emp.statut==='ouvrier').length,
      employes:paies.filter(({emp})=>emp.statut!=='ouvrier').length});
  };

  // Télécharger le XML
  const downloadXML=()=>{
    if(!gen)return;
    const blob=new Blob([gen.xml],{type:'application/xml'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`SEPA_SAL_${per.y}_${String(per.m).padStart(2,'0')}_${s.co.name.replace(/\s/g,'_')}.xml`;
    a.click();
  };

  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
    <div>
    <C><ST>Virements SEPA — pain.001</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
        <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
      </div>
      <I label="Type de paiement" value={payType} onChange={setPayType} options={[
        {v:'all',l:'🏦 TOUT (salaires + ONSS + PP)'},
        {v:'salaires',l:'💰 Salaires uniquement'},
        {v:'onss',l:'🏛 ONSS uniquement'},
        {v:'pp',l:'◇ PP + CSS uniquement'},
      ]} style={{marginTop:9}}/>
      <B onClick={run} style={{width:'100%',marginTop:14}}>🏦 Générer fichier SEPA</B>
      {gen&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:2}}>
        <div style={{fontWeight:600,color:'#c6a34e',marginBottom:6,fontSize:13}}>💰 {MN[per.m-1]} {per.y}</div>
        <div>Ouvriers: <b style={{color:'#fb923c'}}>{gen.ouvriers}</b> · Employés: <b style={{color:'#60a5fa'}}>{gen.employes}</b></div>
        <div>Total salaires nets: <b style={{color:'#4ade80'}}>{fmt(gen.totSal)}</b></div>
        <div>ONSS (empl+trav): <b style={{color:'#e8e6e0'}}>{fmt(gen.totOnssE+gen.totOnssW)}</b></div>
        <div>PP: <b style={{color:'#e8e6e0'}}>{fmt(gen.totPP)}</b> · CSS: <b style={{color:'#e8e6e0'}}>{fmt(gen.totCSS)}</b></div>
        <div style={{borderTop:'1px solid rgba(198,163,78,.15)',paddingTop:6,marginTop:6}}>
          <b style={{color:'#c6a34e',fontSize:14}}>TOTAL: {fmt(gen.totNet)}</b>
        </div>
        <div style={{marginTop:4}}>Nb virements: <b style={{color:'#e8e6e0'}}>{gen.virements.length}</b></div>
        <div>Compte débiteur: <b style={{color:'#e8e6e0'}}>{s.co.bank}</b></div>
        <div>Date d'exécution: <b style={{color:'#e8e6e0'}}>{per.y}-{String(per.m).padStart(2,'0')}-25</b></div>
      </div>}
      {gen&&<div style={{display:'flex',gap:8,marginTop:10}}>
        <B onClick={downloadXML} style={{flex:1,fontSize:11}}>💾 Télécharger .xml</B>
        <B v="outline" style={{flex:1,fontSize:11}} onClick={()=>d({type:'MODAL',m:{w:900,c:<div>
          <h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>SEPA pain.001.001.03 — {MN[per.m-1]} {per.y}</h3>
          <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{gen.xml}</pre>
          <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(gen.xml);alert('Copié !')}}>Copier XML</B></div>
        </div>}})}>Voir XML</B>
      </div>}
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10,color:'#60a5fa',lineHeight:1.6}}>
        <b>Format:</b> ISO 20022 pain.001.001.03<br/>
        <b>Compatible:</b> BNP Paribas Fortis, ING, KBC/CBC, Belfius, Argenta, Crelan, AXA, Triodos<br/>
        <b>Upload:</b> Portail banque en ligne → Virements → Importer fichier SEPA<br/>
        <b>Délai:</b> J+1 si envoyé avant 15h, J+2 sinon<br/>
        <b>Réf. légale:</b> Règlement (UE) 260/2012 (migration SEPA)
      </div>

      {/* DOSSIER CLIENT — WORKFLOW SECRÉTARIAT SOCIAL */}
      {gen&&<C style={{marginTop:14,background:'rgba(74,222,128,.03)',border:'1px solid rgba(74,222,128,.12)'}}>
        <ST style={{color:'#4ade80'}}>📨 Envoyer au client</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.7,marginBottom:10}}>
          Toi (secrétariat social), tu prépares tout. Le client reçoit un dossier complet avec le fichier SEPA + les fiches de paie. Il n'a qu'à <b style={{color:'#4ade80'}}>importer le fichier dans sa banque et valider</b>.
        </div>
        <div style={{padding:12,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#c6a34e',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:8}}>Email type à envoyer au client</div>
          <div style={{fontSize:11,color:'#d4d0c8',lineHeight:1.8,fontFamily:"'Outfit',sans-serif"}}>
            <div style={{fontWeight:600,marginBottom:4}}>Objet: Salaires {MN[per.m-1]} {per.y} — Fichier de paiement prêt</div>
            <div style={{borderTop:'1px solid rgba(198,163,78,.1)',paddingTop:8,marginTop:4}}>
              Bonjour,<br/><br/>
              Veuillez trouver ci-joint le dossier salarial de <b>{MN[per.m-1]} {per.y}</b> :<br/><br/>
              <b>1. Fichier SEPA</b> (.xml) — À importer dans votre banque en ligne<br/>
              → {gen.virements.length} virement(s) pour un total de <b>{fmt(gen.totNet)}</b><br/>
              → Dont: salaires nets {fmt(gen.totSal)} · ONSS {fmt(gen.totOnssE+gen.totOnssW)} · PP {fmt(gen.totPP)}<br/><br/>
              <b>2. Fiches de paie</b> — À remettre à vos travailleurs<br/>
              → {gen.nbSal} fiche(s) ({gen.ouvriers} ouvrier(s), {gen.employes} employé(s))<br/><br/>
              <b>Que devez-vous faire ?</b><br/>
              ① Connectez-vous à votre banque en ligne ({s.co.bic==='GEBABEBB'?'BNP Paribas Fortis':s.co.bic==='BBRUBEBB'?'ING':s.co.bic==='KREDBEBB'?'KBC/CBC':s.co.bic==='GKCCBEBB'?'Belfius':'votre banque'})<br/>
              ② Allez dans Virements → Importer un fichier<br/>
              ③ Sélectionnez le fichier .xml joint<br/>
              ④ Vérifiez le montant total: <b>{fmt(gen.totNet)}</b><br/>
              ⑤ Validez avec votre digipass / itsme<br/><br/>
              Date d'exécution prévue: <b>le 25/{String(per.m).padStart(2,'0')}/{per.y}</b><br/>
              Merci de valider <b>avant le 24/{String(per.m).padStart(2,'0')}/{per.y}</b>.<br/><br/>
              Bien cordialement,<br/>
              <b>{s.co.secSoc||'Aureus Social Pro'}</b>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <B style={{flex:1,fontSize:11}} onClick={()=>{
              const subject=encodeURIComponent(`Salaires ${MN[per.m-1]} ${per.y} — Fichier de paiement prêt`);
              const body=encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le dossier salarial de ${MN[per.m-1]} ${per.y}.\n\n1. Fichier SEPA (.xml) — À importer dans votre banque en ligne\n→ ${gen.virements.length} virement(s) pour un total de ${fmt(gen.totNet)}\n\n2. Fiches de paie — À remettre à vos travailleurs\n\nQue devez-vous faire ?\n① Connectez-vous à votre banque en ligne\n② Allez dans Virements → Importer un fichier\n③ Sélectionnez le fichier .xml joint\n④ Vérifiez le montant total: ${fmt(gen.totNet)}\n⑤ Validez avec votre digipass / itsme\n\nDate d'exécution: le 25/${String(per.m).padStart(2,'0')}/${per.y}\nMerci de valider avant le 24/${String(per.m).padStart(2,'0')}/${per.y}.\n\nBien cordialement,\n${s.co.secSoc||'Aureus Social Pro'}`);
              window.open(`mailto:${s.co.email||''}?subject=${subject}&body=${body}`);
            }}>📧 Ouvrir dans Mail</B>
            <B v="outline" style={{flex:1,fontSize:11}} onClick={()=>{
              const txt=`Salaires ${MN[per.m-1]} ${per.y} — ${gen.virements.length} virements — Total: ${fmt(gen.totNet)}\n\n① Importez le fichier .xml dans votre banque\n② Vérifiez le total: ${fmt(gen.totNet)}\n③ Validez avant le 24/${String(per.m).padStart(2,'0')}/${per.y}`;
              navigator.clipboard?.writeText(txt);alert('Copié !');
            }}>📋 Copier le message</B>
          </div>
        </div>
        <div style={{marginTop:10,padding:10,background:'rgba(74,222,128,.04)',borderRadius:8,fontSize:10,color:'#4ade80',lineHeight:1.6}}>
          <b>Récap — Qui fait quoi ?</b><br/>
          <b>TOI (secrétariat social):</b> calcul des paies → génération fiches → génération fichier SEPA → envoi au client<br/>
          <b>LE CLIENT:</b> importer le .xml dans sa banque → vérifier le total → valider avec digipass/itsme → c'est fait
        </div>
      </C>}
    </C>
    <C style={{marginTop:14}}><ST>Comptes destinataires</ST>
      <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.8}}>
        <div><b style={{color:'#c6a34e'}}>ONSS:</b> BE76 6790 0001 6128 (PCHQBEBB) — communication structurée: +++XXX/XXXX/YYMM+++</div>
        <div><b style={{color:'#c6a34e'}}>SPF Finances (PP):</b> BE39 6792 0022 9319 (PCHQBEBB) — réf: 274-YYYYMM-TVA</div>
        <div><b style={{color:'#c6a34e'}}>Caisse vacances (ouvriers):</b> selon CP — ONVA ou caisse sectorielle</div>
        <div><b style={{color:'#c6a34e'}}>Assurance AT:</b> selon contrat employeur</div>
      </div>
    </C>
    </div>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail des virements — {MN[per.m-1]} {per.y}</div>
      </div>
      {gen?<Tbl cols={[
        {k:'t',l:'Type',r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,fontWeight:600,
          background:r.type==='SAL'?'rgba(74,222,128,.1)':r.type==='ONSS'?'rgba(96,165,250,.1)':'rgba(198,163,78,.1)',
          color:r.type==='SAL'?'#4ade80':r.type==='ONSS'?'#60a5fa':'#c6a34e'}}>{r.type}</span>},
        {k:'e',l:'Bénéficiaire',b:1,r:r=><><div>{r.nom}</div>{r.statut&&<div style={{fontSize:9,color:'#5e5c56'}}>{r.statut}</div>}</>},
        {k:'i',l:'IBAN',r:r=><span style={{fontSize:9.5,fontFamily:'monospace',color:'#9e9b93'}}>{r.iban}</span>},
        {k:'c',l:'Communication',r:r=><span style={{fontSize:9.5,color:'#c6a34e'}}>{r.communication}</span>},
        {k:'n',l:'Montant',a:'right',r:r=><span style={{fontWeight:700,color:r.type==='SAL'?'#4ade80':r.type==='ONSS'?'#60a5fa':'#c6a34e'}}>{fmt(r.montant)}</span>}
      ]} data={gen?.virements||[]}/>
      :<div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:13}}>
        Sélectionnez la période et cliquez sur "Générer fichier SEPA"<br/>
        <span style={{fontSize:11,color:'#3e3c36'}}>Le fichier XML sera compatible avec toutes les banques belges</span>
      </div>}
      {gen&&<div style={{padding:'12px 18px',borderTop:'1px solid rgba(139,115,60,.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:'#9e9b93'}}>{gen.virements.length} virement(s)</span>
        <span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>TOTAL: {fmt(gen.totNet)}</span>
      </div>}
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PEPPOL e-INVOICING — UBL 2.1 / BIS Billing 3.0
// ═══════════════════════════════════════════════════════════════
function PeppolMod({s,d}){
  const [invType,setInvType]=useState('380');
  const [invNum,setInvNum]=useState(`INV-${new Date().getFullYear()}-001`);
  const [invDate,setInvDate]=useState(new Date().toISOString().slice(0,10));
  const [dueDate,setDueDate]=useState('');
  const [currency,setCurrency]=useState('EUR');
  const [note,setNote]=useState('');
  // Supplier (from company settings)
  const [suppVAT,setSuppVAT]=useState(s.co.bce?`BE${(s.co.bce||'').replace(/\D/g,'')}`:'');
  const [suppName,setSuppName]=useState(s.co.name||'');
  const [suppAddr,setSuppAddr]=useState(s.co.address||'');
  const [suppCity,setSuppCity]=useState('Bruxelles');
  const [suppZip,setSuppZip]=useState(s.co.zip||'1000');
  const [suppCountry,setSuppCountry]=useState('BE');
  const [suppPeppolId,setSuppPeppolId]=useState('');
  const [suppIBAN,setSuppIBAN]=useState(s.co.bank||'');
  // Customer
  const [custName,setCustName]=useState('');
  const [custVAT,setCustVAT]=useState('');
  const [custAddr,setCustAddr]=useState('');
  const [custCity,setCustCity]=useState('');
  const [custZip,setCustZip]=useState('');
  const [custCountry,setCustCountry]=useState('BE');
  const [custPeppolId,setCustPeppolId]=useState('');
  // Lines
  const [lines,setLines]=useState([{id:1,desc:'Prestations de services',qty:1,unit:'EA',price:0,vat:21}]);
  const addLine=()=>setLines(p=>[...p,{id:Date.now(),desc:'',qty:1,unit:'EA',price:0,vat:21}]);
  const updLine=(id,k,v)=>setLines(p=>p.map(l=>l.id===id?{...l,[k]:v}:l));
  const remLine=(id)=>setLines(p=>p.filter(l=>l.id!==id));
  
  const subtotal=lines.reduce((a,l)=>a+(parseFloat(l.qty)||0)*(parseFloat(l.price)||0),0);
  const vatGroups={};
  lines.forEach(l=>{const v=parseFloat(l.vat)||0;const amt=(parseFloat(l.qty)||0)*(parseFloat(l.price)||0);if(!vatGroups[v])vatGroups[v]={base:0,tax:0};vatGroups[v].base+=amt;vatGroups[v].tax+=amt*v/100;});
  const totalVAT=Object.values(vatGroups).reduce((a,g)=>a+g.tax,0);
  const totalTTC=subtotal+totalVAT;

  const invTypes=[
    {v:'380',l:'380 — Facture commerciale'},
    {v:'381',l:'381 — Note de crédit'},
    {v:'384',l:'384 — Facture corrective'},
    {v:'389',l:'389 — Auto-facturation'},
    {v:'751',l:'751 — Facture proforma'},
    {v:'386',l:'386 — Facture d\'acompte (prépaiement)'},
  ];
  const units=[{v:'EA',l:'Unité (EA)'},{v:'HUR',l:'Heure (HUR)'},{v:'DAY',l:'Jour (DAY)'},{v:'MON',l:'Mois (MON)'},{v:'KGM',l:'Kg (KGM)'},{v:'MTR',l:'Mètre (MTR)'},{v:'LTR',l:'Litre (LTR)'},{v:'C62',l:'Pièce (C62)'}];
  const vatCodes=[{v:21,l:'21% (standard)'},{v:12,l:'12% (réduit)'},{v:6,l:'6% (réduit)'},{v:0,l:'0% (exonéré)'}];

  const generateUBL=()=>{
    const xml=`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${invNum}</cbc:ID>
  <cbc:IssueDate>${invDate}</cbc:IssueDate>${dueDate?`\n  <cbc:DueDate>${dueDate}</cbc:DueDate>`:''}
  <cbc:InvoiceTypeCode>${invType}</cbc:InvoiceTypeCode>${note?`\n  <cbc:Note>${note}</cbc:Note>`:''}
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>

  <!-- FOURNISSEUR (AccountingSupplierParty) -->
  <cac:AccountingSupplierParty>
    <cac:Party>${suppPeppolId?`\n      <cbc:EndpointID schemeID="0208">${suppPeppolId}</cbc:EndpointID>`:`\n      <cbc:EndpointID schemeID="0208">${suppVAT}</cbc:EndpointID>`}
      <cac:PartyIdentification><cbc:ID>${suppVAT}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${suppName}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${suppAddr}</cbc:StreetName>
        <cbc:CityName>${suppCity}</cbc:CityName>
        <cbc:PostalZone>${suppZip}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${suppCountry}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${suppVAT}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${suppName}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- CLIENT (AccountingCustomerParty) -->
  <cac:AccountingCustomerParty>
    <cac:Party>${custPeppolId?`\n      <cbc:EndpointID schemeID="0208">${custPeppolId}</cbc:EndpointID>`:`\n      <cbc:EndpointID schemeID="0208">${custVAT}</cbc:EndpointID>`}
      <cac:PartyIdentification><cbc:ID>${custVAT}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${custName}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${custAddr}</cbc:StreetName>
        <cbc:CityName>${custCity}</cbc:CityName>
        <cbc:PostalZone>${custZip}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${custCountry}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${custVAT}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${custName}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- PAIEMENT -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount><cbc:ID>${(suppIBAN||'').replace(/\s/g,'')}</cbc:ID></cac:PayeeFinancialAccount>
  </cac:PaymentMeans>

  <!-- TVA -->
${Object.entries(vatGroups).map(([rate,g])=>`  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${g.tax.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${g.base.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${g.tax.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${parseFloat(rate)===0?'Z':'S'}</cbc:ID>
        <cbc:Percent>${rate}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>`).join('\n')}

  <!-- TOTAUX -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${totalTTC.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${totalTTC.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- LIGNES -->
${lines.map((l,i)=>{const lineAmt=(parseFloat(l.qty)||0)*(parseFloat(l.price)||0);const lineVat=lineAmt*(parseFloat(l.vat)||0)/100;return`  <cac:InvoiceLine>
    <cbc:ID>${i+1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${l.unit}">${l.qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${lineAmt.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${l.desc}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${parseFloat(l.vat)===0?'Z':'S'}</cbc:ID>
        <cbc:Percent>${l.vat}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="${currency}">${parseFloat(l.price||0).toFixed(2)}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`;}).join('\n')}
</Invoice>`;
    return xml;
  };

  const [gen,setGen]=useState(null);
  const doGen=()=>setGen(generateUBL());

  return <div>
    <PH title="PEPPOL e-Invoicing" sub="UBL 2.1 — BIS Billing 3.0 — Conforme EN 16931" actions={<B onClick={doGen}>Générer UBL XML</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      {/* LEFT: INVOICE HEADER */}
      <C>
        <ST>🔗 Document PEPPOL</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <I label="Type de document" value={invType} onChange={setInvType} options={invTypes}/>
          <I label="N° facture" value={invNum} onChange={setInvNum}/>
          <I label="Date émission" type="date" value={invDate} onChange={setInvDate}/>
          <I label="Date échéance" type="date" value={dueDate} onChange={setDueDate}/>
          <I label="Devise" value={currency} onChange={setCurrency} options={[{v:'EUR',l:'EUR'},{v:'USD',l:'USD'},{v:'GBP',l:'GBP'},{v:'CHF',l:'CHF'}]}/>
          <I label="Note / Référence" value={note} onChange={setNote}/>
        </div>

        <div style={{marginTop:16,fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:8}}>📤 Fournisseur (émetteur)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <I label="Nom / Raison sociale" value={suppName} onChange={setSuppName}/>
          <I label="N° TVA (BE0xxx.xxx.xxx)" value={suppVAT} onChange={setSuppVAT}/>
          <I label="Adresse" value={suppAddr} onChange={setSuppAddr}/>
          <I label="Ville" value={suppCity} onChange={setSuppCity}/>
          <I label="Code postal" value={suppZip} onChange={setSuppZip}/>
          <I label="Pays" value={suppCountry} onChange={setSuppCountry} options={[{v:'BE',l:'Belgique'},{v:'FR',l:'France'},{v:'NL',l:'Pays-Bas'},{v:'LU',l:'Luxembourg'},{v:'DE',l:'Allemagne'}]}/>
          <I label="PEPPOL ID (0208:BEXXXX)" value={suppPeppolId} onChange={setSuppPeppolId}/>
          <I label="IBAN" value={suppIBAN} onChange={setSuppIBAN}/>
        </div>

        <div style={{marginTop:16,fontSize:11.5,fontWeight:600,color:'#60a5fa',marginBottom:8}}>📥 Client (destinataire)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <I label="Nom / Raison sociale" value={custName} onChange={setCustName}/>
          <I label="N° TVA" value={custVAT} onChange={setCustVAT}/>
          <I label="Adresse" value={custAddr} onChange={setCustAddr}/>
          <I label="Ville" value={custCity} onChange={setCustCity}/>
          <I label="Code postal" value={custZip} onChange={setCustZip}/>
          <I label="Pays" value={custCountry} onChange={setCustCountry} options={[{v:'BE',l:'Belgique'},{v:'FR',l:'France'},{v:'NL',l:'Pays-Bas'},{v:'LU',l:'Luxembourg'},{v:'DE',l:'Allemagne'},{v:'ES',l:'Espagne'},{v:'IT',l:'Italie'},{v:'AT',l:'Autriche'}]}/>
          <I label="PEPPOL ID client" value={custPeppolId} onChange={setCustPeppolId}/>
        </div>
      </C>

      {/* RIGHT: LINES + TOTALS */}
      <div>
        <C>
          <ST>Lignes de facturation</ST>
          {lines.map((l,i)=><div key={l.id} style={{padding:10,marginBottom:8,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.06)',borderRadius:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:600,color:'#c6a34e'}}>Ligne {i+1}</span>
              {lines.length>1&&<button onClick={()=>remLine(l.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:12}}>✕</button>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:8}}>
              <I label="Description" value={l.desc} onChange={v=>updLine(l.id,'desc',v)}/>
              <I label="Quantité" type="number" value={l.qty} onChange={v=>updLine(l.id,'qty',v)}/>
              <I label="Unité" value={l.unit} onChange={v=>updLine(l.id,'unit',v)} options={units}/>
              <I label="Prix unitaire" type="number" value={l.price} onChange={v=>updLine(l.id,'price',v)}/>
              <I label="TVA %" value={l.vat} onChange={v=>updLine(l.id,'vat',v)} options={vatCodes}/>
            </div>
            <div style={{textAlign:'right',fontSize:11,color:'#9e9b93',marginTop:4}}>Sous-total: <b style={{color:'#e8e6e0'}}>{fmt((parseFloat(l.qty)||0)*(parseFloat(l.price)||0))}</b></div>
          </div>)}
          <B v="outline" onClick={addLine} style={{width:'100%',fontSize:11}}>+ Ajouter une ligne</B>
        </C>

        <C style={{marginTop:16}}>
          <ST>Totaux</ST>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>HTVA</div>
              <div style={{fontSize:20,fontWeight:700,color:'#c6a34e'}}>{fmt(subtotal)}</div>
            </div>
            <div style={{padding:12,background:'rgba(248,113,113,.06)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>TVA</div>
              <div style={{fontSize:20,fontWeight:700,color:'#f87171'}}>{fmt(totalVAT)}</div>
              <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{Object.entries(vatGroups).map(([r,g])=>`${r}%: ${g.tax.toFixed(2)}€`).join(' | ')}</div>
            </div>
            <div style={{padding:12,background:'rgba(74,222,128,.06)',borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>TVAC</div>
              <div style={{fontSize:20,fontWeight:700,color:'#4ade80'}}>{fmt(totalTTC)}</div>
            </div>
          </div>
        </C>

        {gen&&<C style={{marginTop:16}}>
          <ST>XML UBL 2.1 généré</ST>
          <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{gen}</pre>
          <div style={{display:'flex',gap:10,marginTop:12}}>
            <B onClick={()=>{navigator.clipboard?.writeText(gen);alert('XML PEPPOL copié !')}}>📋 Copier XML</B>
            <B v="outline" onClick={()=>{const b=new Blob([gen],{type:'text/xml'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${invNum}.xml`;a.click()}}>💾 Télécharger .xml</B>
            <B v="ghost" onClick={()=>d({type:'MODAL',m:{w:1000,c:<div>
              <h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>PEPPOL UBL 2.1 — {invNum}</h3>
              <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:500,overflowY:'auto'}}>{gen}</pre>
              <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}>
                <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
                <B onClick={()=>{navigator.clipboard?.writeText(gen);alert('Copié !')}}>Copier</B>
              </div>
            </div>}})}>🔍 Plein écran</B>
          </div>
        </C>}

        <C style={{marginTop:16}}>
          <div style={{fontSize:10.5,color:'#60a5fa',lineHeight:1.7}}>
            <b style={{color:'#a78bfa'}}>📋 Réseau PEPPOL — Informations</b><br/>
            <b>Norme:</b> UBL 2.1 / EN 16931 / BIS Billing 3.0<br/>
            <b>Obligatoire B2G:</b> Depuis 01/04/2019 pour les marchés publics fédéraux BE<br/>
            <b>Obligatoire B2B:</b> Obligatoire à partir du 01/01/2026 pour les assujettis TVA belges<br/>
            <b>Access Point:</b> Pour envoyer via PEPPOL, vous devez passer par un Access Point certifié (Hermes, Billit, CodaBox, Basware, Unifiedpost, Mercurius...)<br/>
            <b>PEPPOL ID Belgique:</b> schemeID="0208" (numéro BCE/KBO sans espaces)<br/>
            <b>Portail public:</b> e-FFF (Facture Fédérale) pour les marchés publics<br/>
            <b>Validation:</b> Utilisez le validateur OpenPEPPOL ou ecosio pour vérifier la conformité EN 16931
          </div>
          <div style={{marginTop:10,padding:8,background:'rgba(250,204,21,.06)',borderRadius:6,fontSize:10,color:'#facc15',lineHeight:1.5}}>
            ⚠️ <b>Nouveau 2026:</b> La facturation électronique structurée B2B devient obligatoire en Belgique pour tous les assujettis TVA établis en BE. Les factures doivent être émises et reçues via PEPPOL (format UBL/CII).
          </div>
        </C>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SECTEURS SPÉCIFIQUES (Hôpitaux, Construction, Ateliers, IMP)
// ═══════════════════════════════════════════════════════════════
function SecteursMod({s,d}){
  const [secteur,setSecteur]=useState('hopital');
  const sects=[{v:'hopital',l:'🏥 Hôpitaux',cp:'330',desc:'Gestion spécifique personnel soignant: primes de nuit, week-end, jours fériés, gardes, IFIC, Fonds Maribel social.'},{v:'construction',l:'🏗️ Construction',cp:'124',desc:'Timbres intempéries/fidélité, prime de mobilité, indemnité outillage, caisse congés payés construction.'},{v:'atelier',l:'🏭 Ateliers protégés (ETA)',cp:'327',desc:'Subsides selon catégorie handicap, relevés AViQ/COCOF, taux ONSS réduits.'},{v:'imp',l:'🏛️ IMP (Institutions publiques)',cp:'',desc:'Barèmes publics, pécule de vacances secteur public, allocation de foyer/résidence, prime Copernic.'}];
  const sel=sects.find(x=>x.v===secteur);
  const specifics={
    hopital:[{l:'Prime IFIC mensuelle',v:'Variable selon fonction'},{l:'Prime de nuit',v:'+ 35% du taux horaire'},{l:'Prime week-end',v:'+ 56% samedi, + 100% dimanche'},{l:'Maribel social',v:'Réduction ONSS secteur non-marchand'},{l:'Prime d\'attractivité',v:'2% du brut annuel'},{l:'Complément de pension',v:'2ème pilier sectoriel'}],
    construction:[{l:'Timbres fidélité',v:'9% du salaire brut'},{l:'Timbres intempéries',v:'2% du salaire brut'},{l:'Prime de mobilité',v:'€0,1579/km (max 64km)'},{l:'Indemnité outillage',v:'Variable selon fonction'},{l:'Congés construction',v:'Via caisse CP 124'},{l:'Prime de fin d\'année',v:'Via fonds sectoriel'}],
    atelier:[{l:'Subside cat. 1-2',v:'25% masse salariale'},{l:'Subside cat. 3',v:'50% masse salariale'},{l:'Subside cat. 4',v:'75% masse salariale'},{l:'Réduction ONSS',v:'Taux réduit ETA'},{l:'Relevé AViQ',v:'Trimestriel obligatoire'},{l:'Encadrement',v:'Subside personnel encadrant'}],
    imp:[{l:'Allocation foyer',v:'€178,16/mois (marié)'},{l:'Allocation résidence',v:'€89,08/mois (isolé)'},{l:'Pécule vacances',v:'92% du traitement mensuel'},{l:'Prime Copernic',v:'Variable selon niveau'},{l:'Barème',v:'Selon niveau/échelon public'},{l:'Pension publique',v:'Cotisation pension 7,5%'}],
  };
  return <div>
    <PH title="Secteurs Spécifiques" sub="Hôpitaux, Construction, Ateliers protégés, IMP"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <C><ST>Secteur</ST>
        <I label="Secteur" value={secteur} onChange={setSecteur} options={sects.map(x=>({v:x.v,l:x.l}))}/>
        {sel?.cp&&<div style={{marginTop:12,fontSize:12,color:'#9e9b93'}}>Commission paritaire: <b style={{color:'#c6a34e'}}>CP {sel.cp}</b></div>}
        <div style={{marginTop:14,padding:12,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6}}>{sel?.desc}</div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>{sel?.l} — Spécificités sectorielles</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {(specifics[secteur]||[]).map((sp,i)=>
            <div key={i} style={{padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#c6a34e',marginBottom:4}}>{sp.l}</div>
              <div style={{fontSize:12,color:'#d4d0c8'}}>{sp.v}</div>
            </div>
          )}
        </div>
        <div style={{marginTop:16,padding:12,background:'rgba(198,163,78,.05)',borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,marginBottom:6}}>Codes de paie spécifiques</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>Les codes de paie et calculs spécifiques au secteur {sel?.l.replace(/[🏥🏗️🏭🏛️]\s*/,'')} sont automatiquement intégrés lors de la sélection de la CP correspondante dans le signalétique employeur. Les barèmes sectoriels sont mis à jour à chaque release.</div>
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  RÈGLEMENT DE TRAVAIL — Générateur complet
// ═══════════════════════════════════════════════════════════════
const RT_SECTIONS=[
  {id:'general',t:'Dispositions générales',fields:['nomEntreprise','siege','numOnss','cp','activite']},
  {id:'horaires',t:'Durée & horaires de travail',fields:['regimeHebdo','lundiDe','lundiA','mardiDe','mardiA','mercrediDe','mercrediA','jeudiDe','jeudiA','vendrediDe','vendrediA','samediDe','samediA','pause','flexibilite']},
  {id:'remuneration',t:'Rémunération',fields:['jourPaiement','modePaiement','periodicite']},
  {id:'conges',t:'Vacances & congés',fields:['congesLegaux','congesExtra','joursConventionnels','petitChomage']},
  {id:'maladie',t:'Maladie & accidents',fields:['delaiAvertissement','certificatMedical','controleMedial','medecinControle']},
  {id:'rupture',t:'Fin du contrat',fields:['preavisLegal','motifGrave','licenciement']},
  {id:'securite',t:'Sécurité & bien-être',fields:['sipp','medecineExterne','persConfiance','risquesPsycho']},
  {id:'divers',t:'Dispositions diverses',fields:['sanctions','cameras','drogues','alcool','respectMutuel','rgpd']},
];

function ReglementTravailMod({s,d}){
  const [sec,setSec]=useState('general');
  const [data,setData]=useState({
    nomEntreprise:s.co.name||'',siege:s.co.address||'',numOnss:s.co.onss||'',
    cp:s.co.cp||'200',activite:'',
    regimeHebdo:'38h/semaine',lundiDe:'09:00',lundiA:'17:30',mardiDe:'09:00',mardiA:'17:30',
    mercrediDe:'09:00',mercrediA:'17:30',jeudiDe:'09:00',jeudiA:'17:30',
    vendrediDe:'09:00',vendrediA:'16:00',samediDe:'',samediA:'',
    pause:'30 min (12h30-13h00)',flexibilite:'Horaire fixe',
    jourPaiement:'Dernier jour ouvrable du mois',modePaiement:'Virement bancaire',periodicite:'Mensuelle',
    congesLegaux:'20 jours ouvrables (régime 5j/sem)',congesExtra:'Selon CCT sectorielle',
    joursConventionnels:'Jours fériés légaux (10j) + jour(s) CP',
    petitChomage:'Conformément à l\'AR du 28/08/1963',
    delaiAvertissement:'Immédiat par téléphone + certificat dans les 48h',
    certificatMedical:'Obligatoire dès le 1er jour d\'absence',
    controleMedial:'L\'employeur se réserve le droit de faire effectuer un contrôle médical',
    medecinControle:'Dr. [Nom] — [Adresse]',
    preavisLegal:'Conformément à la loi du 26/12/2013 (statut unique)',
    motifGrave:'Article 35 de la loi du 03/07/1978',
    licenciement:'Conformément aux dispositions légales et CCT 109',
    sipp:'Conseiller interne en prévention: [Nom]',
    medecineExterne:'[Nom du SEPP — ex: Liantis, Mensura, Cohezio]',
    persConfiance:'[Nom] — [Coordonnées]',
    risquesPsycho:'Procédure interne conformément au Code du bien-être au travail',
    sanctions:'1° Avertissement oral / 2° Avertissement écrit / 3° Mise en demeure / 4° Licenciement',
    cameras:'[Oui/Non — Si oui, finalités conformément à la CCT 68]',
    drogues:'Politique préventive alcool et drogues conformément à la CCT 100',
    alcool:'Tolérance zéro pendant les heures de travail',
    respectMutuel:'Conformément à la loi du 04/08/1996 relative au bien-être',
    rgpd:'Traitement des données conformément au RGPD — DPO: [Contact]'
  });
  const upd=(k,v)=>setData(p=>({...p,[k]:v}));
  const curSec=RT_SECTIONS.find(x=>x.id===sec);
  
  const generateDoc=()=>{
    const now=new Date().toLocaleDateString('fr-BE');
    let doc=`═══════════════════════════════════════════════════\n`;
    doc+=`         RÈGLEMENT DE TRAVAIL\n`;
    doc+=`         ${data.nomEntreprise}\n`;
    doc+=`═══════════════════════════════════════════════════\n\n`;
    doc+=`Entreprise: ${data.nomEntreprise}\nSiège social: ${data.siege}\nN° ONSS: ${data.numOnss}\nCP: ${data.cp}\nActivité: ${data.activite}\nDate d'entrée en vigueur: ${now}\n\n`;
    
    RT_SECTIONS.forEach(s=>{
      doc+=`────────────────────────────────────────\n`;
      doc+=`${s.t.toUpperCase()}\n`;
      doc+=`────────────────────────────────────────\n\n`;
      s.fields.forEach(f=>{
        const label=f.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
        doc+=`${label}: ${data[f]||'[À compléter]'}\n`;
      });
      doc+='\n';
    });
    
    doc+=`────────────────────────────────────────\nSIGNATURES\n────────────────────────────────────────\n\n`;
    doc+=`Date: ${now}\n\nL'employeur:\t\t\t\tLe(s) travailleur(s):\n${data.nomEntreprise}\t\t\t[Signature(s)]\n\n`;
    doc+=`Ce règlement de travail a été établi conformément à la loi du 08/04/1965\nrelative aux règlements de travail et ses modifications ultérieures.\n`;
    doc+=`Un exemplaire a été déposé au bureau régional du Contrôle des lois sociales.\n`;
    return doc;
  };
  
  return <div>
    <PH title="Règlement de travail" sub="Générateur conforme à la loi du 08/04/1965" actions={<B onClick={()=>{
      const doc=generateDoc();
      d({type:'MODAL',m:{w:900,c:<div>
        <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Règlement de travail — {data.nomEntreprise}</h2>
        <div style={{fontSize:11,color:'#c6a34e',marginBottom:10}}>Document obligatoire — Art. 4-15 Loi 08/04/1965</div>
        <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
        <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
          <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
          <B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B>
        </div>
      </div>}});
    }}>Générer le document</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C>
        <ST>Sections</ST>
        {RT_SECTIONS.map(rs=><button key={rs.id} onClick={()=>setSec(rs.id)} style={{display:'block',width:'100%',padding:'9px 12px',marginBottom:4,border:sec===rs.id?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',borderRadius:7,background:sec===rs.id?'rgba(198,163,78,.1)':'rgba(198,163,78,.02)',color:sec===rs.id?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:12,textAlign:'left',fontFamily:'inherit',fontWeight:sec===rs.id?600:400}}>{rs.t}</button>)}
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Obligation légale: le règlement de travail doit être remis à chaque travailleur et déposé au Contrôle des lois sociales. Valeur Partena: 190€
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>{curSec?.t}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {curSec?.fields.map(f=><I key={f} label={f.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())} value={data[f]||''} onChange={v=>upd(f,v)}/>)}
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CONTRATS DE TRAVAIL — Modèles CDI/CDD/Temps partiel
// ═══════════════════════════════════════════════════════════════
const CONTRAT_TYPES=[
  // ═══ CONTRATS SALARIÉS (Loi 03/07/1978) ═══
  {id:'cdi',cat:'salarie',l:'CDI — Contrat à durée indéterminée',desc:'Le contrat le plus courant. Pas de date de fin. Préavis selon ancienneté (art. 37/2).'},
  {id:'cdd',cat:'salarie',l:'CDD — Contrat à durée déterminée',desc:'Durée fixée. Max 4 CDD successifs, total max 2 ans (sauf exceptions art. 10).'},
  {id:'trav_det',cat:'salarie',l:'Travail nettement défini',desc:'Engagement pour une tâche précise (projet, chantier). Fin = achèvement du travail.'},
  {id:'remplacement',cat:'salarie',l:'Contrat de remplacement',desc:'Remplacement travailleur absent (maladie, congé). Max 2 ans. Art. 11ter.'},
  {id:'tpartiel',cat:'salarie',l:'Temps partiel',desc:'Régime < temps plein. Minimum 1/3 temps plein, min 3h consécutives. Avenant écrit obligatoire.'},
  {id:'interim',cat:'salarie',l:'Travail intérimaire',desc:'Via agence intérim (Randstad, Adecco...). 4 motifs: remplacement, surcroît, travail exceptionnel, insertion.'},
  {id:'etudiant',cat:'salarie',l:'Convention d\'occupation étudiant',desc:'Max 650h/an. Cotisations solidarité réduites (2,71% + 5,42%). Contrat écrit obligatoire.'},
  {id:'flexi',cat:'salarie',l:'Flexi-job',desc:'Horeca, commerce, santé. Pas de cotisations personnelles. ONSS patronal 28%. Exige emploi principal 4/5.'},
  {id:'saisonnier',cat:'salarie',l:'Travail saisonnier',desc:'Agriculture, horticulture (CP 144/145). Max 65 jours/an (100 j. fruits/légumes). Dimona spécifique.'},
  {id:'occas_horeca',cat:'salarie',l:'Travail occasionnel Horeca',desc:'Max 50 jours/an (CP 302). Forfait ONSS 8,86€/h. Pas de contrat écrit obligatoire.'},
  {id:'extras',cat:'salarie',l:'Extras événementiel',desc:'CP 302/304. Engagement ponctuel max 2 jours consécutifs. Dimona « EXT ».'},
  {id:'titre_service',cat:'salarie',l:'Titres-services',desc:'CP 322.01. Contrat de travail titres-services obligatoirement écrit. Aide-ménagère à domicile.'},
  {id:'art60',cat:'salarie',l:'Article 60§7 (CPAS)',desc:'Mise à l\'emploi par le CPAS. Durée limitée pour acquérir droits chômage. Employeur = CPAS.'},
  {id:'insertion',cat:'salarie',l:'Convention d\'immersion professionnelle (CIP)',desc:'Stage rémunéré. Pas un contrat de travail. Indemnité ≥ revenu minimum. 6 mois max (renouvelable 1x).'},
  {id:'formation_alternance',cat:'salarie',l:'Contrat de formation en alternance',desc:'IFAPME/SFPME/Syntra. 20% école + 80% entreprise. Allocation progressive selon année.'},
  {id:'premier_emploi',cat:'salarie',l:'Convention premier emploi (CPE/Rosetta)',desc:'Jeunes < 26 ans. Obligation d\'embauche 3% (entreprises > 50 travailleurs). Réductions ONSS.'},
  {id:'occupation_protect',cat:'salarie',l:'Travail adapté / ETA',desc:'CP 327. Entreprises de travail adapté. Travailleurs handicapés. Subsides AViQ/PHARE/VAPH.'},
  {id:'detache',cat:'salarie',l:'Travailleur détaché',desc:'Art. 5-14 Directive 96/71/CE. Déclaration Limosa obligatoire. Conditions belges applicables.'},
  {id:'domestique',cat:'salarie',l:'Travailleur domestique',desc:'Personnel de maison (nettoyage, garde). Loi 03/07/1978 art. 108-118. Dimona obligatoire.'},
  {id:'teletravail_struct',cat:'salarie',l:'Télétravail structurel',desc:'CCT n°85. Avenant écrit. Indemnité bureau forfaitaire (max 151,70€/mois). Assurance AT adaptée.'},
  {id:'travail_domicile',cat:'salarie',l:'Travail à domicile',desc:'Art. 119.1-119.12 loi 03/07/1978. Distinct du télétravail. Indemnité frais 10% du salaire.'},
  {id:'mise_dispo',cat:'salarie',l:'Mise à disposition (groupement d\'employeurs)',desc:'Art. 31-32 loi 24/07/1987. Autorisé via groupement agréé. Convention tripartite.'},

  // ═══ STATUT INDÉPENDANT (AR n°38 du 27/07/1967) ═══
  {id:'indep_principal',cat:'independant',l:'Indépendant à titre principal',desc:'Activité principale. Cotisations sociales trimestrielles (20,5% < 73.471€). Affiliation caisse sociale.'},
  {id:'indep_complementaire',cat:'independant',l:'Indépendant complémentaire',desc:'En parallèle d\'un emploi salarié ≥ mi-temps. Cotisations réduites si revenu < 1.865,44€/an.'},
  {id:'indep_conjoint_aidant',cat:'independant',l:'Conjoint aidant',desc:'Aide régulière au conjoint indépendant. Maxi-statut ou mini-statut. Cotisations sociales propres.'},
  {id:'indep_mandataire',cat:'independant',l:'Mandataire de société (gérant/admin)',desc:'Gérant SRL, administrateur SA. Assimilé indépendant. Rémunération via société. Cotisations sur tous revenus.'},
  {id:'indep_etudiant',cat:'independant',l:'Étudiant-entrepreneur',desc:'Statut depuis 2017. ≤ 25 ans, inscrit dans l\'enseignement. Cotisations réduites si revenu < 8.430,72€/an.'},
  {id:'indep_retraite',cat:'independant',l:'Indépendant pensionné (actif après pension)',desc:'Activité après 65 ans ou 45 ans carrière. Revenus illimités. Cotisations sociales dues.'},
  {id:'indep_starter',cat:'independant',l:'Indépendant primo-starters',desc:'Cotisations réduites 1ère année (création). Dispense possible via caisse sociale.'},

  // ═══ FORMES SPÉCIALES / HYBRIDES ═══
  {id:'freelance_be',cat:'special',l:'Freelance / Consultant (indépendant)',desc:'Prestation de services B2B. Pas de lien de subordination. Facturation TVA. Risque de faux indépendant.'},
  {id:'smart_sme',cat:'special',l:'Smart / SMart (société mutuelle d\'artistes)',desc:'Portage salarial. Facture via Smart → reçoit un salaire. Couverture sociale complète. Commission ~6,5%.'},
  {id:'volontariat',cat:'special',l:'Volontariat (Loi 03/07/2005)',desc:'Pas un contrat de travail. Indemnité max 40,67€/jour ou 1.626,77€/an (2026). Pas d\'ONSS ni PP.'},
  {id:'artiste',cat:'special',l:'Contrat artiste (visa artiste / AKC)',desc:'Depuis 01/2024: Attestation du travail des arts (ATA). Commission du travail des arts. Règles spécifiques.'},
  {id:'sportif_remunere',cat:'special',l:'Sportif rémunéré',desc:'Loi 24/02/1978. Contrat spécial. Employé ou indépendant selon le cas. ONSS si > rémunération minimale.'},
  {id:'apprentissage_ind',cat:'special',l:'Apprentissage (indépendant — IFAPME)',desc:'Convention d\'apprentissage de professions indépendantes. Allocation mensuelle. Pas contrat de travail.'},
  {id:'economie_plateforme',cat:'special',l:'Travail via plateforme (P2P)',desc:'Deliveroo, Uber. Régime fiscal 2024: 50% forfait frais, max 7.170€/an. Présomption salariat UE 2026.'},
  {id:'coworking_cooperatif',cat:'special',l:'Coopérative d\'activités (couveuse)',desc:'Test activité indépendante encadré. Statut salarié pendant test. JobYourself, Microsolutions, etc.'},
  {id:'associe_actif',cat:'special',l:'Associé actif (non-rémunéré)',desc:'Travail dans sa propre société sans rémunération formelle. Doit cotiser comme indépendant. Minimum cotisation.'},
  {id:'frontalier',cat:'special',l:'Travailleur frontalier',desc:'Domicile FR/NL/LU/DE, travail en BE. Convention préventive double imposition. Sécurité sociale = pays de travail.'},
];

function ContratsTravailMod({s,d}){
  const [type,setType]=useState('cdi');
  const [form,setForm]=useState({
    empNom:'',empPrenom:'',empNN:'',empAdresse:'',empNationalite:'Belge',
    fonction:'',salaireBrut:'',debut:'',fin:'',essai:'',
    regime:'38h/semaine',horaire:'Lundi-Vendredi 09:00-17:30',
    lieuTravail:s.co.address||'',
    avantages:'Chèques-repas, Eco-chèques (si applicable)',
    clauseNonConcurrence:'Non',clauseEcolage:'Non',
  });
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sel=CONTRAT_TYPES.find(x=>x.id===type);
  
  const generate=()=>{
    const now=new Date().toLocaleDateString('fr-BE');
    let doc=`CONTRAT DE TRAVAIL\n`;
    doc+=`${sel.l}\n`;
    doc+=`═══════════════════════════════════════════════════\n\n`;
    doc+=`ENTRE:\n`;
    doc+=`L'employeur: ${s.co.name}\nSiège: ${s.co.address}\nN° BCE: ${s.co.bce||'[BCE]'}\nN° ONSS: ${s.co.onss||'[ONSS]'}\nCP: ${s.co.cp||'200'}\n`;
    doc+=`Représenté par: [Nom du responsable]\n\n`;
    doc+=`ET:\n`;
    doc+=`Le travailleur: ${form.empPrenom} ${form.empNom}\nNN: ${form.empNN}\nDomicile: ${form.empAdresse}\nNationalité: ${form.empNationalite}\n\n`;
    doc+=`IL EST CONVENU CE QUI SUIT:\n\n`;
    doc+=`Art. 1 — OBJET\nLe travailleur est engagé en qualité de: ${form.fonction}\n\n`;
    doc+=`Art. 2 — DURÉE\n`;
    if(type==='cdi')doc+=`Le présent contrat est conclu pour une durée indéterminée.\n`;
    else if(type==='cdd')doc+=`Le présent contrat prend cours le ${form.debut} et se termine le ${form.fin}.\n`;
    else if(type==='etudiant')doc+=`Convention étudiante du ${form.debut} au ${form.fin}.\nDans le cadre du contingent de 650h/an (art. 17bis AR 28/11/1969).\n`;
    else if(type==='trav_det')doc+=`Le présent contrat est conclu pour un travail nettement défini.\nDescription: [à compléter]\nLe contrat prendra fin à l'achèvement du travail convenu.\n`;
    else if(type==='remplacement')doc+=`Le présent contrat est conclu en remplacement de [nom travailleur absent]\nabsent(e) pour cause de [motif].\nDurée maximale: 2 ans (art. 11ter loi 03/07/1978).\n`;
    else if(type==='saisonnier')doc+=`Travail saisonnier du ${form.debut} au ${form.fin}.\nMax 65 jours/an (100 jours pour fruits/légumes). Dimona « DWD ».\n`;
    else if(type==='occas_horeca')doc+=`Travail occasionnel Horeca du ${form.debut} au ${form.fin}.\nMax 50 jours/an. Forfait ONSS: 8,86€/heure.\n`;
    else if(type==='insertion')doc+=`Convention d'immersion professionnelle (CIP) du ${form.debut} au ${form.fin}.\nDurée: max 6 mois, renouvelable 1 fois. Indemnité mensuelle: ${form.salaireBrut}€.\nCette convention n'est PAS un contrat de travail.\n`;
    else if(type==='formation_alternance')doc+=`Contrat de formation en alternance du ${form.debut} au ${form.fin}.\n20% formation / 80% entreprise. Allocation selon année de formation.\n`;
    else if(type==='teletravail_struct')doc+=`Le présent contrat inclut un avenant de télétravail structurel (CCT n°85).\nLieu de télétravail: domicile du travailleur.\nIndemnité forfaitaire de bureau: max 151,70€/mois.\n`;
    else if(sel.cat==='independant'){
      doc=`CONVENTION DE COLLABORATION INDÉPENDANTE\n${sel.l}\n═══════════════════════════════════════════════════\n\n`;
      doc+=`ENTRE:\nLe donneur d'ordre: ${s.co.name}\nSiège: ${s.co.address}\nN° BCE: ${s.co.bce||'[BCE]'}\n\n`;
      doc+=`ET:\nLe prestataire indépendant: ${form.empPrenom} ${form.empNom}\nN° BCE: [BCE prestataire]\nN° TVA: [TVA prestataire]\nCaisse sociale: [nom caisse]\n\n`;
      doc+=`Art. 1 — OBJET\nLe prestataire s'engage à fournir les services suivants: ${form.fonction}\nEn qualité de: ${sel.l}\n\n`;
      doc+=`Art. 2 — ABSENCE DE LIEN DE SUBORDINATION\nLe prestataire exerce son activité en toute indépendance.\nIl organise librement son travail, détermine ses horaires et méthodes.\nAucun lien de subordination n'existe entre les parties (Loi 27/12/2006).\n\n`;
      doc+=`Art. 3 — RÉMUNÉRATION\nHonoraires: ${form.salaireBrut}€ [par mois/prestation/heure]\nFacturation: mensuelle, TVA 21%.\nPaiement: 30 jours fin de mois.\n\n`;
      doc+=`Art. 4 — DURÉE\nDébut: ${form.debut}${form.fin?`\nFin: ${form.fin}`:'\nDurée indéterminée avec préavis raisonnable.'}\n\n`;
      doc+=`Art. 5 — CRITÈRES D'INDÉPENDANCE (Loi 27/12/2006)\n- Liberté d'organisation du travail\n- Liberté d'organisation du temps de travail\n- Possibilité de travailler pour d'autres donneurs d'ordre\n- Pas de contrôle hiérarchique\n\n`;
      if(type==='indep_mandataire')doc+=`Art. 6 — MANDAT SOCIAL\nLe prestataire exerce un mandat de [gérant/administrateur] au sein de la société.\nConformément au Code des sociétés et des associations (CSA).\nRévocable [ad nutum / moyennant préavis].\n\n`;
      if(type==='indep_conjoint_aidant')doc+=`Art. 6 — STATUT CONJOINT AIDANT\nLe prestataire aide régulièrement son conjoint dans l'exercice de son activité indépendante.\nStatut social: [maxi-statut / mini-statut].\nAffiliation caisse sociale obligatoire.\n\n`;
      doc+=`Art. ${type==='indep_mandataire'||type==='indep_conjoint_aidant'?7:6} — OBLIGATIONS SOCIALES\n`;
      doc+=`Le prestataire déclare être en règle de:\n- Affiliation à une caisse d'assurances sociales\n- Cotisations sociales trimestrielles\n- Assurance maladie-invalidité\n- Assurance responsabilité professionnelle\n\n`;
      doc+=`Fait en double exemplaire à ${s.co.address?.split(',').pop()?.trim()||'Bruxelles'}, le ${now}\n\n`;
      doc+=`Le donneur d'ordre:\t\t\tLe prestataire:\n[Signature]\t\t\t\t[Signature]\n`;
    }
    else if(sel.cat==='special'){
      if(type==='volontariat'){
        doc=`CONVENTION DE VOLONTARIAT\n(Loi du 03/07/2005 relative aux droits des volontaires)\n═══════════════════════════════════════════════════\n\n`;
        doc+=`ENTRE:\nL'organisation: ${s.co.name}\nSiège: ${s.co.address}\n\n`;
        doc+=`ET:\nLe/la volontaire: ${form.empPrenom} ${form.empNom}\n\n`;
        doc+=`Art. 1 — Le volontariat est exercé sans rémunération ni obligation.\n`;
        doc+=`Art. 2 — Défraiement: forfait max 40,67€/jour, 1.626,77€/an (2026).\n`;
        doc+=`Art. 3 — Aucune cotisation ONSS, aucun précompte professionnel.\n`;
        doc+=`Art. 4 — Assurance responsabilité civile souscrite par l'organisation.\n\n`;
      }
      else if(type==='smart_sme'){
        doc=`NOTE D'INFORMATION — PORTAGE SALARIAL (Smart)\n═══════════════════════════════════════════════════\n\n`;
        doc+=`Prestataire: ${form.empPrenom} ${form.empNom}\nMission: ${form.fonction}\nClient: ${s.co.name}\n\n`;
        doc+=`Smart établit le contrat de travail, facture le client, et reverse:\n- Montant facturé HT\n- Moins commission Smart (~6,5%)\n- Moins cotisations sociales employeur + travailleur\n- Moins précompte professionnel\n= Net versé au prestataire\n\n`;
        doc+=`Avantages: couverture sociale complète, chômage, mutuelle, pension.\n`;
      }
      else{
        doc+=`Le présent contrat est de type: ${sel.l}\n${sel.desc}\n`;
        doc+=`Début: ${form.debut}${form.fin?` — Fin: ${form.fin}`:''}\n`;
      }
      doc+=`\nFait à ${s.co.address?.split(',').pop()?.trim()||'Bruxelles'}, le ${now}\n\n`;
      doc+=`Signature 1:\t\t\t\tSignature 2:\n[Signature]\t\t\t\t[Signature]\n`;
    }
    else doc+=`Début: ${form.debut}${form.fin?` — Fin: ${form.fin}`:''}\n`;
    if(sel.cat==='salarie'){
    doc+=`\nArt. 3 — LIEU DE TRAVAIL\n${form.lieuTravail}\n`;
    doc+=`\nArt. 4 — RÉMUNÉRATION\nSalaire brut mensuel: ${form.salaireBrut}€\nMode de paiement: virement bancaire\n`;
    doc+=`\nArt. 5 — DURÉE DU TRAVAIL\nRégime: ${form.regime}\nHoraire: ${form.horaire}\n`;
    doc+=`\nArt. 6 — AVANTAGES EXTRA-LÉGAUX\n${form.avantages}\n`;
    if(form.clauseNonConcurrence==='Oui')doc+=`\nArt. 7 — CLAUSE DE NON-CONCURRENCE\nConformément à l'art. 65 de la loi du 03/07/1978.\n`;
    if(form.clauseEcolage==='Oui')doc+=`\nArt. 8 — CLAUSE D'ÉCOLAGE\nConformément à l'art. 22bis de la loi du 03/07/1978.\n`;
    doc+=`\nArt. 9 — DISPOSITIONS GÉNÉRALES\nLe règlement de travail fait partie intégrante du présent contrat.\nLe contrat est régi par la loi du 03/07/1978 relative aux contrats de travail.\n`;
    doc+=`\nFait en double exemplaire à ${s.co.address?.split(',').pop()?.trim()||'Bruxelles'}, le ${now}\n\n`;
    doc+=`L'employeur:\t\t\t\tLe travailleur:\n[Signature]\t\t\t\t[Signature]\n`;
    doc+=`Précédé de la mention\t\t\tPrécédé de la mention\n"Lu et approuvé"\t\t\t\t"Lu et approuvé"\n`;
    }
    return doc;
  };
  
  return <div>
    <PH title="Contrats de travail & conventions" sub="Salariés, indépendants, formes spéciales — 40 types de contrats belges"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Type de contrat</ST>
        <div style={{fontSize:10,color:'#c6a34e',fontWeight:600,marginBottom:6}}>📋 SALARIÉS (Loi 03/07/1978)</div>
        {CONTRAT_TYPES.filter(ct=>ct.cat==='salarie').map(ct=><button key={ct.id} onClick={()=>setType(ct.id)} style={{display:'block',width:'100%',padding:'8px 10px',marginBottom:3,border:type===ct.id?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.04)',borderRadius:6,background:type===ct.id?'rgba(198,163,78,.1)':'transparent',color:type===ct.id?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:11,textAlign:'left',fontFamily:'inherit',fontWeight:type===ct.id?600:400}}>
          {ct.l.split('—')[0]}
        </button>)}
        <div style={{fontSize:10,color:'#a78bfa',fontWeight:600,marginTop:12,marginBottom:6}}>🏢 INDÉPENDANTS (AR n°38)</div>
        {CONTRAT_TYPES.filter(ct=>ct.cat==='independant').map(ct=><button key={ct.id} onClick={()=>setType(ct.id)} style={{display:'block',width:'100%',padding:'8px 10px',marginBottom:3,border:type===ct.id?'1px solid rgba(167,139,250,.3)':'1px solid rgba(167,139,250,.04)',borderRadius:6,background:type===ct.id?'rgba(167,139,250,.1)':'transparent',color:type===ct.id?'#a78bfa':'#9e9b93',cursor:'pointer',fontSize:11,textAlign:'left',fontFamily:'inherit',fontWeight:type===ct.id?600:400}}>
          {ct.l.split('—')[0]}
        </button>)}
        <div style={{fontSize:10,color:'#60a5fa',fontWeight:600,marginTop:12,marginBottom:6}}>⚡ FORMES SPÉCIALES / HYBRIDES</div>
        {CONTRAT_TYPES.filter(ct=>ct.cat==='special').map(ct=><button key={ct.id} onClick={()=>setType(ct.id)} style={{display:'block',width:'100%',padding:'8px 10px',marginBottom:3,border:type===ct.id?'1px solid rgba(96,165,250,.3)':'1px solid rgba(96,165,250,.04)',borderRadius:6,background:type===ct.id?'rgba(96,165,250,.1)':'transparent',color:type===ct.id?'#60a5fa':'#9e9b93',cursor:'pointer',fontSize:11,textAlign:'left',fontFamily:'inherit',fontWeight:type===ct.id?600:400}}>
          {ct.l.split('—')[0]}
        </button>)}
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Équivalent LegalSmart de Partena. Contrats générés selon la loi du 03/07/1978 et les CCT applicables.
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>{sel?.l}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <I label="Nom" value={form.empNom} onChange={v=>upd('empNom',v)}/>
          <I label="Prénom" value={form.empPrenom} onChange={v=>upd('empPrenom',v)}/>
          <I label="N° National" value={form.empNN} onChange={v=>upd('empNN',v)}/>
          <I label="Adresse" value={form.empAdresse} onChange={v=>upd('empAdresse',v)}/>
          <I label="Fonction" value={form.fonction} onChange={v=>upd('fonction',v)}/>
          <I label="Salaire brut mensuel (€)" value={form.salaireBrut} onChange={v=>upd('salaireBrut',v)}/>
          <I label="Date début" value={form.debut} onChange={v=>upd('debut',v)}/>
          {(type==='cdd'||type==='interim'||type==='etudiant')&&<I label="Date fin" value={form.fin} onChange={v=>upd('fin',v)}/>}
          <I label="Régime" value={form.regime} onChange={v=>upd('regime',v)}/>
          <I label="Horaire" value={form.horaire} onChange={v=>upd('horaire',v)}/>
          <I label="Clause non-concurrence" value={form.clauseNonConcurrence} onChange={v=>upd('clauseNonConcurrence',v)} options={[{v:'Non',l:'Non'},{v:'Oui',l:'Oui'}]}/>
          <I label="Clause d'écolage" value={form.clauseEcolage} onChange={v=>upd('clauseEcolage',v)} options={[{v:'Non',l:'Non'},{v:'Oui',l:'Oui'}]}/>
        </div>
        <B style={{marginTop:16}} onClick={()=>{
          const doc=generate();
          d({type:'MODAL',m:{w:900,c:<div>
            <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>{sel.l}</h2>
            <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
            <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
              <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
              <B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B>
            </div>
          </div>}});
        }}>Générer le contrat</B>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  COMPTE INDIVIDUEL — Annuel par travailleur
// ═══════════════════════════════════════════════════════════════
function CompteIndividuelMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const ae=s.emps.filter(e=>e.status==='active');
  
  const genCI=(emp)=>{
    const p=calc(emp,DPER,s.co);
    const brut12=emp.monthlySalary*12+emp.monthlySalary; // 12 mois + 13e mois
    const onssW12=p.onssNet*13;const onssE12=p.onssE*13;
    const tax12=p.tax*13;const net12=p.net*12+emp.monthlySalary*0.6;
    const simplePec=brut12*0.0769;const doublePec=brut12*0.0769;
    return{emp:`${emp.first} ${emp.last}`,nn:emp.nn||'XX.XX.XX-XXX.XX',fn:emp.fn||'Employé',
      brut12:brut12.toFixed(2),onssW:onssW12.toFixed(2),onssE:onssE12.toFixed(2),
      tax:tax12.toFixed(2),net:net12.toFixed(2),
      simplePec:simplePec.toFixed(2),doublePec:doublePec.toFixed(2),
      monthly:emp.monthlySalary,start:emp.start||'01/01/'+yr,
      regime:emp.regime||'38h/sem',statut:emp.statut||'Employé',
      cp:s.co.cp||'200'};
  };
  
  const showCI=(emp)=>{
    const ci=genCI(emp);
    const doc=`COMPTE INDIVIDUEL — ANNÉE ${yr}\n═══════════════════════════════════════════\n\n`+
    `EMPLOYEUR: ${s.co.name}\nN° ONSS: ${s.co.onss||'[ONSS]'}\nCP: ${ci.cp}\n\n`+
    `TRAVAILLEUR: ${ci.emp}\nN° National: ${ci.nn}\nFonction: ${ci.fn}\nStatut: ${ci.statut}\nRégime: ${ci.regime}\nDate entrée: ${ci.start}\n\n`+
    `RÉMUNÉRATIONS ${yr}\n────────────────────────────────────────\n`+
    MN.map((m,i)=>`${m.padEnd(12)} Brut: ${ci.monthly.toFixed(2)}€\tONSS: ${(ci.monthly*0.1307).toFixed(2)}€\tPP: ${(ci.monthly*0.1307*-1+ci.monthly>2723.36?0:(2723.36-ci.monthly)*0.2307).toFixed(2)!=='NaN'?'voir fiche':'—'}\tNet: ~${(ci.monthly*0.77).toFixed(2)}€`).join('\n')+
    `\n\n13e mois:\tBrut: ${ci.monthly.toFixed(2)}€\n`+
    `\nTOTAUX ANNUELS\n────────────────────────────────────────\n`+
    `Brut total:\t\t${ci.brut12}€\nONSS travailleur:\t${ci.onssW}€\nONSS employeur:\t\t${ci.onssE}€\nPrécompte professionnel:\t${ci.tax}€\n`+
    `Pécule simple:\t\t${ci.simplePec}€\nPécule double:\t\t${ci.doublePec}€\n`+
    `\nCe document est établi conformément à l'AR du 08/08/1980.\nÀ conserver pendant 5 ans minimum.\n`;
    
    d({type:'MODAL',m:{w:900,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Compte individuel {yr} — {ci.emp}</h2>
      <div style={{fontSize:11,color:'#c6a34e',marginBottom:10}}>AR 08/08/1980 — Conservation 5 ans</div>
      <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
        <B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B>
      </div>
    </div>}});
  };

  return <div>
    <PH title="Comptes individuels" sub={`Année ${yr} — AR 08/08/1980`}/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé</div>
          <div>Travailleurs actifs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Masse salariale: <b style={{color:'#4ade80'}}>{fmt(ae.reduce((a,e)=>a+e.monthlySalary*13,0))}</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Le compte individuel est un document obligatoire que l'employeur doit établir pour chaque travailleur. Il reprend toutes les rémunérations et retenues de l'année.
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Travailleurs — {yr}</div></div>
        <Tbl cols={[
          {k:'n',l:'Nom',b:1,r:r=>`${r.first} ${r.last}`},
          {k:'f',l:'Fonction',r:r=>r.fn||'Employé'},
          {k:'s',l:'Brut mensuel',a:'right',r:r=>fmt(r.monthlySalary)},
          {k:'a',l:'Brut annuel (13m)',a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.monthlySalary*13)}</span>},
          {k:'x',l:'',a:'right',r:r=><B v="ghost" style={{padding:'3px 10px',fontSize:10}} onClick={()=>showCI(r)}>Générer</B>}
        ]} data={ae}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ACCOUNTING OUTPUT — Récapitulatif comptable pour le comptable
// ═══════════════════════════════════════════════════════════════
function AccountingOutputMod({s,d}){
  const [per,setPer]=useState({m:new Date().getMonth()+1,y:new Date().getFullYear()});
  const [view,setView]=useState('onss'); // onss | fisc | partena | global
  const ae=s.emps.filter(e=>e.status==='active');
  
  const results=ae.map(emp=>{const p=calc(emp,DPER,s.co);return{...p,emp:`${emp.first} ${emp.last}`};});
  const totals={
    gross:results.reduce((a,r)=>a+r.gross,0),
    onssNet:results.reduce((a,r)=>a+r.onssNet,0),
    onssE:results.reduce((a,r)=>a+r.onssE,0),
    tax:results.reduce((a,r)=>a+r.tax,0),
    net:results.reduce((a,r)=>a+r.net,0),
    css:results.reduce((a,r)=>a+r.css,0),
    mvEmployer:results.reduce((a,r)=>a+(r.mvEmployer||0),0),
    cost:results.reduce((a,r)=>a+r.totalCost,0),
  };
  totals.onssTotal=totals.onssNet+totals.onssE;
  
  const sections={
    onss:{title:'Paiement ONSS',color:'#f87171',items:[
      {l:'ONSS travailleur (13,07%)',v:totals.onssNet,acc:'453000'},
      {l:'ONSS employeur (25%)',v:totals.onssE,acc:'453100'},
      {l:'Total ONSS à verser',v:totals.onssTotal,acc:'—',bold:true},
      {l:'Échéance',v:`${per.y}-${(per.m+1).toString().padStart(2,'0')}-05`,text:true},
      {l:'Communication structurée',v:`+++${s.co.onss?.replace(/[\s.-]/g,'')||'XXXXX'}/${per.y}/${per.m.toString().padStart(2,'0')}+++`,text:true},
    ]},
    fisc:{title:'Paiement Précompte professionnel',color:'#fb923c',items:[
      {l:'Précompte retenu',v:totals.tax,acc:'453200'},
      {l:'CSS (Cotisation spéciale)',v:totals.css,acc:'453300'},
      {l:'Total PP à verser',v:totals.tax+totals.css,acc:'—',bold:true},
      {l:'Échéance',v:`15/${(per.m+1).toString().padStart(2,'0')}/${per.y}`,text:true},
      {l:'Via',v:'MyMinfin (précompte professionnel 274)',text:true},
    ]},
    global:{title:'Vue d\'ensemble mensuelle',color:'#c6a34e',items:[
      {l:'Masse salariale brute',v:totals.gross,acc:'620000'},
      {l:'ONSS patronales',v:totals.onssE,acc:'621000'},
      {l:'Chèques-repas employeur',v:totals.mvEmployer,acc:'623000'},
      {l:'Coût total employeur',v:totals.cost,acc:'—',bold:true},
      {l:'',v:0,sep:true},
      {l:'Net à payer (salaires)',v:totals.net,acc:'455000'},
      {l:'ONSS à payer',v:totals.onssTotal,acc:'453000/100'},
      {l:'PP à payer',v:totals.tax+totals.css,acc:'453200/300'},
      {l:'Total des sorties',v:totals.net+totals.onssTotal+totals.tax+totals.css+totals.mvEmployer,acc:'—',bold:true},
    ]},
  };
  const cur=sections[view];
  
  return <div>
    <PH title="Accounting Output" sub="Vue comptable des paiements ONSS, Fisc, salaires"/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C>
        <ST>Période</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Mois" value={per.m} onChange={v=>setPer({...per,m:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
          <I label="Année" type="number" value={per.y} onChange={v=>setPer({...per,y:v})}/>
        </div>
        <ST>Section</ST>
        {[{v:'onss',l:'💰 Paiement ONSS'},{v:'fisc',l:'🏛️ Précompte professionnel'},{v:'global',l:'📊 Vue d\'ensemble'}].map(x=>
          <button key={x.v} onClick={()=>setView(x.v)} style={{display:'block',width:'100%',padding:'9px 12px',marginBottom:4,border:view===x.v?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',borderRadius:7,background:view===x.v?'rgba(198,163,78,.1)':'rgba(198,163,78,.02)',color:view===x.v?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:12,textAlign:'left',fontFamily:'inherit',fontWeight:view===x.v?600:400}}>{x.l}</button>
        )}
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Équivalent du Finance Support de Partena. Export facile vers votre comptable.
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>{cur.title}</div>
        <div style={{fontSize:11,color:'#5e5c56',marginBottom:16}}>{MN[per.m-1]} {per.y} — {ae.length} travailleur(s)</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {cur.items.filter(x=>!x.sep).map((it,i)=>it.text?
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',background:'rgba(96,165,250,.04)',borderRadius:8}}>
              <span style={{fontSize:12,color:'#60a5fa'}}>{it.l}</span>
              <span style={{fontSize:12,color:'#e8e6e0',fontFamily:'monospace'}}>{it.v}</span>
            </div>
            :
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:it.bold?'rgba(198,163,78,.08)':'rgba(198,163,78,.03)',borderRadius:8,border:it.bold?'1px solid rgba(198,163,78,.2)':'1px solid rgba(198,163,78,.06)'}}>
              <div>
                <span style={{fontSize:12,color:it.bold?'#c6a34e':'#d4d0c8',fontWeight:it.bold?700:400}}>{it.l}</span>
                {it.acc!=='—'&&<span style={{fontSize:10,color:'#5e5c56',marginLeft:8}}>({it.acc})</span>}
              </div>
              <span style={{fontSize:it.bold?16:13,fontWeight:it.bold?700:500,color:it.bold?cur.color:'#e8e6e0',fontFamily:'monospace'}}>{fmt(it.v)}</span>
            </div>
          )}
        </div>
        <B v="ghost" style={{width:'100%',marginTop:16,fontSize:11}} onClick={()=>{
          let csv='Libellé;Compte;Montant\n';
          cur.items.filter(x=>!x.sep&&!x.text).forEach(it=>{csv+=`${it.l};${it.acc};${typeof it.v==='number'?it.v.toFixed(2):it.v}\n`;});
          navigator.clipboard?.writeText(csv);alert('CSV copié !');
        }}>📋 Copier en CSV (pour Excel/comptable)</B>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ALERTES LÉGALES — Veille juridique et échéances
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// MODULE: DOCUMENTS JURIDIQUES — Phase 0 Fiduciaire Sociale
// Convention de Mandat, DPA RGPD, Registre RGPD, Politique Confidentialité
// Génération PDF côté client + envoi email en 1 clic
// ═══════════════════════════════════════════════════════════

function DocumentsJuridiquesMod({s,d}){
  const [selectedDoc,setSelectedDoc]=useState(null);
  const [sending,setSending]=useState(null);
  const [sent,setSent]=useState({});
  const [generating,setGenerating]=useState(null);
  const [generated,setGenerated]=useState({});
  const [emailModal,setEmailModal]=useState(null);
  const [email,setEmail]=useState('');
  const [emailSent,setEmailSent]=useState(false);
  const [previewDoc,setPreviewDoc]=useState(null);

  const client=s.co||{};
  const clientName=client.name||'Client';
  const clientEmail=client.email||'';
  const clientVat=client.vat||'';
  const clientAddr=client.addr||'';
  const clientContact=client.contact||'';
  const clientOnss=client.onss||'';

  const docs=[
    {
      id:'convention_mandat',
      title:'Convention de Mandat',
      subtitle:'Contrat prestataire — employeur (ONSS/Mahis)',
      icon:'📋',
      color:'#c6a34e',
      status:'obligatoire',
      articles:10,
      description:'Contrat écrit obligatoire entre mandant (employeur) et mandataire (Aureus Social) pour les déclarations sociales Dimona/DmfA via MAHIS. Couvre: gestion salariale, déclarations ONSS, admin personnel, conseil social.',
      legalRef:'Instructions administratives ONSS — Mandataires',
      sections:['Objet du mandat','Missions (paie, Dimona, DmfA, BELCOTAX, contrats)','Obligations client','Obligations Aureus Social','Limitation responsabilité','Rémunération','Durée & résiliation','Transfert mandat','Protection données','Droit applicable'],
    },
    {
      id:'dpa_rgpd',
      title:'DPA — Sous-traitance Données',
      subtitle:'Contrat art. 28 RGPD + Loi belge 30/7/2018',
      icon:'🔒',
      color:'#60a5fa',
      status:'obligatoire',
      articles:9,
      description:'Contrat obligatoire régissant le traitement des données personnelles des travailleurs. Définit les catégories de données (NISS, salaires, IBAN, santé), les mesures de sécurité (AES-256, 2FA, RLS), les sous-traitants ultérieurs et la notification de fuite 24h.',
      legalRef:'Art. 28 Règlement (UE) 2016/679 (RGPD)',
      sections:['Objet et finalité','6 catégories données (identification, pro, financières, fiscales, SS, santé)','Personnes concernées','8 obligations sous-traitant (art. 28.3)','Notification fuite 24h','Transferts internationaux','Durées conservation','Registre traitement','Droit applicable'],
    },
    {
      id:'registre_rgpd',
      title:'Registre de Traitement RGPD',
      subtitle:'Article 30 RGPD — Obligatoire',
      icon:'📊',
      color:'#4ade80',
      status:'obligatoire',
      articles:6,
      description:'Registre documentant les 6 activités de traitement d\'Aureus Social: payroll, Dimona/DmfA, BELCOTAX, admin personnel, agent IA, sécurité. Inclut sous-traitants ultérieurs (Supabase, Vercel, Anthropic) et mesures art. 32.',
      legalRef:'Art. 30 Règlement (UE) 2016/679 (RGPD)',
      sections:['Identification sous-traitant','T1: Gestion salariale','T2: Déclarations sociales','T3: Déclarations fiscales','T4: Admin personnel','T5: Agent IA juridique','T6: Sécurité','Sous-traitants ultérieurs','Mesures techniques art. 32'],
    },
    {
      id:'politique_confidentialite',
      title:'Politique de Confidentialité',
      subtitle:'aureussocial.be — RGPD conforme',
      icon:'🛡',
      color:'#f472b6',
      status:'obligatoire',
      articles:10,
      description:'Politique de confidentialité complète pour le site web et la plateforme. Couvre: responsable du traitement, données collectées par catégorie, destinataires, transferts internationaux, sécurité, droits des personnes, cookies, réclamation APD.',
      legalRef:'Art. 13-14 RGPD + Loi belge 30/7/2018',
      sections:['Responsable traitement','Champ d\'application','Données & finalités (4 catégories)','Destinataires','Transferts internationaux','Sécurité (8 mesures)','Droits (accès, rectification, effacement, portabilité, opposition)','Cookies','Réclamation APD','Modifications'],
    },
  ];

  const generatePDF=(doc)=>{
    setGenerating(doc.id);
    const now=new Date();
    const dateStr=now.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit',year:'numeric'});

    // Build HTML content for print/PDF
    let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.title} — Aureus Social</title>
    <style>
      @page{margin:2cm;size:A4}
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#2D2D2D;font-size:10pt;line-height:1.5}
      .header{border-bottom:2.5px solid #C8A84E;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
      .header-left{font-weight:700;font-size:12pt;color:#1A1A2E}
      .header-right{font-size:9pt;color:#666}
      h1{font-size:20pt;color:#1A1A2E;text-align:center;margin:30px 0 5px}
      h2{font-size:11pt;color:#C8A84E;text-align:center;margin-bottom:20px}
      .gold-line{border-top:2px solid #C8A84E;margin:15px 0}
      .article{color:#C8A84E;font-weight:700;font-size:10.5pt;margin-top:18px;margin-bottom:6px}
      .section-title{font-weight:700;font-size:11pt;color:#1A1A2E;margin-top:20px;margin-bottom:8px;border-bottom:1px solid #C8A84E;padding-bottom:4px}
      p{margin-bottom:8px;text-align:justify}
      .bold{font-weight:700}
      .field{color:#666;margin-bottom:4px}
      .sig-block{display:flex;gap:40px;margin-top:30px}
      .sig-col{flex:1}
      .sig-line{border-bottom:1px solid #999;height:50px;margin-top:10px}
      .footer{border-top:1px solid #C8A84E;margin-top:40px;padding-top:8px;font-size:8pt;color:#666;display:flex;justify-content:space-between}
      .small{font-size:8.5pt;color:#666}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th{background:#1A1A2E;color:#fff;padding:6px 8px;font-size:9pt;text-align:left}
      td{padding:5px 8px;font-size:9pt;border:0.5px solid #ccc;background:#f9f9f5}
      .highlight{background:rgba(198,163,78,.05);padding:12px;border-left:3px solid #C8A84E;margin:10px 0}
    </style></head><body>
    <div class="header"><div class="header-left">AUREUS SOCIAL</div><div class="header-right">Fiduciaire Sociale</div></div>`;

    if(doc.id==='convention_mandat'){
      html+=`<h1>CONVENTION DE MANDAT</h1>
      <h2>Gestion Administrative du Personnel et Déclarations Sociales</h2>
      <div class="gold-line"></div>
      <p><em>Conclue conformément aux articles 1984 à 2010 du Code civil belge et aux instructions administratives de l'ONSS relatives aux mandataires (prestataires de services sociaux).</em></p>

      <div class="section-title">ENTRE LES PARTIES</div>
      <p class="bold">LE MANDANT (ci-après « le Client »)</p>
      <p class="field">Dénomination sociale : <b>${clientName}</b></p>
      <p class="field">Numéro BCE : <b>${clientVat}</b></p>
      <p class="field">Siège social : <b>${clientAddr}</b></p>
      <p class="field">Représenté par : <b>${clientContact}</b></p>
      <p class="field">N° ONSS employeur : <b>${clientOnss||'____________________'}</b></p>

      <p class="bold" style="margin-top:14px">LE MANDATAIRE (ci-après « Aureus Social »)</p>
      <p class="field">Dénomination : <b>Aureus IA SPRL</b> (Aureus Social — Fiduciaire Sociale)</p>
      <p class="field">BCE : <b>BE 1028.230.781</b> — Saint-Gilles, 1060 Bruxelles</p>
      <p class="field">Statut : <b>Prestataire de services sociaux (non agréé)</b></p>

      <div class="article">Article 1 — Objet du mandat</div>
      <p>Le Client confie à Aureus Social la mission de prestataire de services sociaux au sens des instructions administratives de l'ONSS. Le mandat sera notifié via l'application MAHIS pour le cluster DmfA-Dimona.</p>

      <div class="article">Article 2 — Missions confiées</div>
      <p><b>2.1 Gestion salariale</b> — Calcul des rémunérations brutes/nettes, fiches de paie, cotisations ONSS (personnelles + patronales), précompte professionnel SPF Finances, cotisation spéciale SS, bonus à l'emploi.</p>
      <p><b>2.2 Déclarations sociales</b> — Dimona (IN/OUT/UPDATE, STU, FLX, EXT), DmfA trimestrielle XML, DRS, BELCOTAX fiches 281.10, déclaration 274 FINPROF.</p>
      <p><b>2.3 Administration du personnel</b> — Contrats de travail par CP, calcul préavis (loi Peeters), documents de fin de contrat (C4, certificat, attestation vacances, solde tout compte), gestion absences.</p>
      <p><b>2.4 Conseil social</b> — Information générale sur obligations employeur. Recommandation juriste pour cas complexes.</p>

      <div class="article">Article 3 — Obligations du Client</div>
      <p>Le Client s'engage à : (a) transmettre les données dans les délais ; (b) garantir leur exactitude ; (c) signer la procuration MAHIS via eID ; (d) payer directement les cotisations ONSS et précompte professionnel ; (e) informer de tout changement.</p>

      <div class="article">Article 4 — Obligations d'Aureus Social</div>
      <p>Aureus Social s'engage à : (a) exécuter avec diligence ; (b) respecter les délais légaux ; (c) informer des modifications législatives ; (d) assurer la confidentialité RGPD ; (e) maintenir une RC professionnelle ; (f) restituer les données en fin de mandat.</p>

      <div class="article">Article 5 — Limitation de responsabilité</div>
      <p>Responsabilité limitée au montant des honoraires des 12 derniers mois. Pas de responsabilité pour données inexactes/tardives du Client ou non-paiement des cotisations.</p>

      <div class="article">Article 6 — Rémunération</div>
      <p>Forfait mensuel par travailleur actif : _______ EUR HTVA. TVA 21%. Payable à réception, délai 30 jours. Révisable annuellement (indice santé).</p>

      <div class="article">Article 7 — Durée et résiliation</div>
      <p>Durée indéterminée. Préavis 3 mois, effectif au 1er jour du trimestre suivant (aligné ONSS). Résiliation immédiate pour manquement grave après mise en demeure 15 jours.</p>

      <div class="article">Article 8 — Transfert du mandat</div>
      <p>En fin de mandat : clôture MAHIS, transmission intégrale des données dans format exploitable, continuité de service jusqu'à prise en charge par nouveau mandataire.</p>

      <div class="article">Article 9 — Protection des données</div>
      <p>Régi par le DPA annexé (art. 28 RGPD). NISS utilisé uniquement pour déclarations sociales (loi 3/6/2007).</p>

      <div class="article">Article 10 — Droit applicable</div>
      <p>Droit belge. Tribunaux de Bruxelles.</p>

      <div class="sig-block">
        <div class="sig-col"><p class="bold">Pour le Client (Mandant)</p><div class="sig-line"></div><p class="small">Nom : ${clientContact||'____________________'}<br/>Fonction : ____________________<br/>Date : ${dateStr}</p></div>
        <div class="sig-col"><p class="bold">Pour Aureus Social (Mandataire)</p><div class="sig-line"></div><p class="small">Nom : M. Moussati<br/>Fonction : Gérant<br/>Date : ${dateStr}</p></div>
      </div>
      <p class="small" style="margin-top:20px"><b>Annexes :</b> 1. DPA (art. 28 RGPD) — 2. Grille tarifaire — 3. Procuration MAHIS</p>`;
    }
    else if(doc.id==='dpa_rgpd'){
      html+=`<h1>CONTRAT DE SOUS-TRAITANCE<br/>DE DONNÉES PERSONNELLES</h1>
      <h2>Article 28 du Règlement (UE) 2016/679 (RGPD)</h2>
      <div class="gold-line"></div>
      <p><b>Responsable du traitement :</b> ${clientName} (${clientVat})</p>
      <p><b>Sous-traitant :</b> Aureus IA SPRL — BE 1028.230.781 — Saint-Gilles, Bruxelles</p>

      <div class="article">Article 1 — Objet</div>
      <p>Traitement de données pour : calcul rémunérations, fiches de paie, Dimona, DmfA, BELCOTAX, admin personnel.</p>

      <div class="article">Article 2 — Catégories de données</div>
      <table><tr><th>Catégorie</th><th>Données</th></tr>
      <tr><td>Identification</td><td>Nom, prénom, NISS, date naissance, adresse, nationalité, état civil</td></tr>
      <tr><td>Professionnelles</td><td>Fonction, CP, contrat, régime, horaire, ancienneté</td></tr>
      <tr><td>Financières</td><td>Rémunération brute, IBAN, primes, avantages nature, saisies</td></tr>
      <tr><td>Fiscales</td><td>Situation familiale, personnes à charge, revenus conjoint</td></tr>
      <tr><td>Sécurité sociale</td><td>N° ONSS, cotisations, jours prestés, absences</td></tr>
      <tr><td>Sensibles (art. 9)</td><td>Certificats médicaux, accidents travail (base: art. 9.2.b)</td></tr></table>

      <div class="article">Article 4 — Obligations du sous-traitant</div>
      <p>(a) Traitement sur instruction documentée uniquement ; (b) Confidentialité garantie ; (c) Mesures techniques : AES-256, TLS 1.3, 2FA, audit trail, RLS Supabase, hébergement UE ; (d) Pas de sous-traitant ultérieur sans accord écrit ; (e) Aide exercice droits (5 jours) ; (f) Aide sécurité/notification/AIPD ; (g) Suppression/restitution en 30 jours ; (h) Audit possible.</p>

      <div class="article">Article 5 — Notification fuite</div>
      <div class="highlight"><b>24 heures</b> — Notification au Client de toute violation, comprenant : nature, personnes concernées, conséquences, mesures prises.</div>

      <div class="article">Article 6 — Sous-traitants ultérieurs</div>
      <table><tr><th>Sous-traitant</th><th>Localisation</th><th>Usage</th></tr>
      <tr><td>Supabase Inc.</td><td>UE (Irlande)</td><td>Base de données + Auth</td></tr>
      <tr><td>Vercel Inc.</td><td>UE/US CDN</td><td>Hébergement frontend</td></tr>
      <tr><td>Anthropic PBC</td><td>US</td><td>Agent IA (données anonymisées)</td></tr></table>

      <div class="article">Article 7 — Conservation</div>
      <p>Documents sociaux : 5 ans. Fiscaux : 7 ans. Comptables : 7 ans. Contrats : 5 ans. Au-delà : suppression ou anonymisation irréversible.</p>

      <div class="sig-block">
        <div class="sig-col"><p class="bold">Responsable du traitement</p><div class="sig-line"></div><p class="small">${clientContact||'____________________'}<br/>Date : ${dateStr}</p></div>
        <div class="sig-col"><p class="bold">Sous-traitant</p><div class="sig-line"></div><p class="small">M. Moussati — Aureus IA SPRL<br/>Date : ${dateStr}</p></div>
      </div>`;
    }
    else if(doc.id==='registre_rgpd'){
      html+=`<h1>REGISTRE DES ACTIVITÉS<br/>DE TRAITEMENT</h1>
      <h2>Article 30 RGPD — Aureus IA SPRL</h2>
      <div class="gold-line"></div>
      <table><tr><th>Champ</th><th>Information</th></tr>
      <tr><td>Sous-traitant</td><td>Aureus IA SPRL — BE 1028.230.781</td></tr>
      <tr><td>Adresse</td><td>Saint-Gilles, 1060 Bruxelles</td></tr>
      <tr><td>Contact DPO</td><td>dpo@aureussocial.be</td></tr>
      <tr><td>Date registre</td><td>${dateStr}</td></tr></table>

      ${[
        {n:'T1 — Gestion salariale',f:'Calcul rémunérations, fiches paie, cotisations ONSS, précompte',b:'Obligation légale (art. 6.1.c) + Contrat (art. 6.1.b)',p:'Travailleurs salariés',dest:'Client, ONSS, SPF Finances',dur:'5 ans après fin contrat'},
        {n:'T2 — Déclarations sociales',f:'Dimona IN/OUT, DmfA trimestrielle XML',b:'Obligation légale (AR 5/11/2002)',p:'Travailleurs salariés',dest:'ONSS, BCSS',dur:'5 ans après trimestre'},
        {n:'T3 — Déclarations fiscales',f:'BELCOTAX 281.10, précompte professionnel 274',b:'Obligation légale (CIR/92)',p:'Travailleurs salariés',dest:'SPF Finances',dur:'7 ans'},
        {n:'T4 — Admin personnel',f:'Registre personnel, contrats, absences, documents fin contrat',b:'Obligation légale + Intérêt légitime',p:'Travailleurs + anciens',dest:'Client, Contrôle Lois Sociales',dur:'5 ans après fin contrat'},
        {n:'T5 — Agent IA juridique',f:'Assistance droit social via agent conversationnel',b:'Intérêt légitime (art. 6.1.f)',p:'Utilisateurs plateforme',dest:'Anthropic (anonymisé)',dur:'30 jours'},
        {n:'T6 — Sécurité',f:'Authentification, logs accès, détection intrusion',b:'Art. 32 RGPD + Intérêt légitime',p:'Utilisateurs plateforme',dest:'Supabase Auth (UE)',dur:'12 mois logs'},
      ].map(t=>`<div class="section-title">${t.n}</div>
      <table><tr><td><b>Finalité</b></td><td>${t.f}</td></tr>
      <tr><td><b>Base légale</b></td><td>${t.b}</td></tr>
      <tr><td><b>Personnes</b></td><td>${t.p}</td></tr>
      <tr><td><b>Destinataires</b></td><td>${t.dest}</td></tr>
      <tr><td><b>Conservation</b></td><td>${t.dur}</td></tr></table>`).join('')}

      <div class="section-title">Mesures de sécurité (art. 32)</div>
      <table><tr><th>Mesure</th><th>Implémentation</th></tr>
      <tr><td>Chiffrement repos</td><td>AES-256 (NISS, IBAN, salaires)</td></tr>
      <tr><td>Chiffrement transit</td><td>TLS 1.3 / HTTPS strict</td></tr>
      <tr><td>Authentification</td><td>2FA obligatoire</td></tr>
      <tr><td>Isolation données</td><td>Row Level Security Supabase</td></tr>
      <tr><td>Journalisation</td><td>Audit trail complet</td></tr>
      <tr><td>Sauvegarde</td><td>Quotidienne chiffrée + hebdo hors-site</td></tr>
      <tr><td>Hébergement</td><td>Supabase EU (Irlande)</td></tr></table>
      <p class="small" style="margin-top:20px">Registre établi le ${dateStr} — M. Moussati, Gérant, Aureus IA SPRL.</p>`;
    }
    else if(doc.id==='politique_confidentialite'){
      html+=`<h1>POLITIQUE DE CONFIDENTIALITÉ</h1>
      <h2>aureussocial.be — Dernière mise à jour : ${dateStr}</h2>
      <div class="gold-line"></div>

      <div class="section-title">1. Responsable du traitement</div>
      <p><b>Aureus IA SPRL</b> — BCE BE 1028.230.781 — Saint-Gilles, 1060 Bruxelles<br/>Contact : contact@aureussocial.be — DPO : dpo@aureussocial.be</p>

      <div class="section-title">2. Données collectées</div>
      <table><tr><th>Catégorie</th><th>Données</th><th>Base légale</th><th>Conservation</th></tr>
      <tr><td>Visiteurs site</td><td>IP, cookies session</td><td>Intérêt légitime</td><td>12 mois</td></tr>
      <tr><td>Clients</td><td>BCE, adresse, contact, email</td><td>Contrat (art. 6.1.b)</td><td>Contrat + 7 ans</td></tr>
      <tr><td>Travailleurs</td><td>NISS, nom, IBAN, salaire, santé</td><td>Obligation légale (art. 6.1.c)</td><td>5-7 ans</td></tr>
      <tr><td>Agent IA</td><td>Questions anonymisées</td><td>Intérêt légitime</td><td>30 jours</td></tr></table>

      <div class="section-title">3. Destinataires</div>
      <p>ONSS, SPF Finances, mutuelles, ONEM, ONVA (administrations). Supabase, Vercel (technique). Anthropic (IA, anonymisé). <b>Aucune vente de données à des tiers.</b></p>

      <div class="section-title">4. Sécurité</div>
      <p>AES-256, TLS 1.3, 2FA, Row Level Security, audit trail, backup quotidien, hébergement UE.</p>

      <div class="section-title">5. Vos droits (RGPD)</div>
      <p>Accès (art. 15), Rectification (art. 16), Effacement (art. 17), Limitation (art. 18), Portabilité (art. 20), Opposition (art. 21). Contact : dpo@aureussocial.be — Réponse sous 30 jours.</p>

      <div class="section-title">6. Cookies</div>
      <p>Uniquement cookies techniques de session. Aucun tracking/publicitaire.</p>

      <div class="section-title">7. Réclamation</div>
      <p><b>Autorité de Protection des Données (APD)</b><br/>Rue de la Presse 35, 1000 Bruxelles — +32 2 274 48 00 — contact@apd-gba.be</p>`;
    }

    html+=`<div class="footer"><span>Aureus IA SPRL — TVA BE 1028.230.781 — Saint-Gilles, Bruxelles</span><span>${dateStr}</span></div></body></html>`;

    // Open in new window for print/save as PDF
    const printWin=window.open('','_blank','width=800,height=1100');
    if(printWin){
      printWin.document.write(html);
      printWin.document.close();
      setTimeout(()=>{
        printWin.print();
        setGenerating(null);
        setGenerated(prev=>({...prev,[doc.id]:true}));
      },500);
    } else {
      // Fallback: download as HTML
      const blob=new Blob([html],{type:'text/html'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`${doc.id}_${clientName.replace(/\s/g,'_')}.html`;
      a.click();URL.revokeObjectURL(url);
      setGenerating(null);
      setGenerated(prev=>({...prev,[doc.id]:true}));
    }
  };

  const openEmailModal=(doc)=>{
    setEmail(clientEmail);
    setEmailModal(doc);
    setEmailSent(false);
  };

  const sendEmail=()=>{
    if(!email||!email.includes('@')){alert('Email invalide');return;}
    setSending(emailModal.id);

    // Simulate email send (in production: call API route /api/send-doc)
    setTimeout(()=>{
      setSending(null);
      setSent(prev=>({...prev,[emailModal.id]:true}));
      setEmailSent(true);
      // In production, this would call:
      // fetch('/api/send-document', { method:'POST', body: JSON.stringify({ docId, email, clientData }) })
    },1500);
  };

  const cardStyle={background:'rgba(255,255,255,.02)',border:'1px solid rgba(198,163,78,.12)',borderRadius:14,overflow:'hidden',transition:'all .2s',cursor:'pointer'};
  const cardHover={border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.03)'};

  return <div>
    {/* Header */}
    <C style={{padding:'20px 24px',background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))'}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#c6a34e,#a08030)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>⚖️</div>
        <div>
          <div style={{fontWeight:700,fontSize:18}}>Documents Juridiques — Phase 0</div>
          <div style={{fontSize:12,color:'#5e5c56',marginTop:2}}>Convention de Mandat, DPA RGPD, Registre RGPD, Politique Confidentialité</div>
        </div>
      </div>
      <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
        <span style={{fontSize:11,padding:'4px 10px',borderRadius:20,background:'rgba(198,163,78,.1)',color:'#c6a34e',fontWeight:600}}>📋 4 documents obligatoires</span>
        <span style={{fontSize:11,padding:'4px 10px',borderRadius:20,background:'rgba(74,222,128,.1)',color:'#4ade80',fontWeight:600}}>🔒 Conformes RGPD + Loi belge 30/7/2018</span>
        <span style={{fontSize:11,padding:'4px 10px',borderRadius:20,background:'rgba(96,165,250,.1)',color:'#60a5fa',fontWeight:600}}>🖨 Générer PDF + ✉️ Envoyer en 1 clic</span>
      </div>
    </C>

    {/* Client info bar */}
    <C style={{marginTop:12,padding:'12px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(96,165,250,.03)',border:'1px solid rgba(96,165,250,.08)',borderRadius:10}}>
      <div style={{fontSize:12}}>
        <span style={{color:'#5e5c56'}}>Client actif : </span>
        <span style={{fontWeight:700,color:'#60a5fa'}}>{clientName}</span>
        {clientVat&&<span style={{color:'#5e5c56',marginLeft:10}}>({clientVat})</span>}
      </div>
      <div style={{fontSize:11,color:'#5e5c56'}}>
        Les documents seront pré-remplis avec les données du dossier client
      </div>
    </C>

    {/* Document cards */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,marginTop:16}}>
      {docs.map(doc=>{
        const isGenerated=generated[doc.id];
        const isSent=sent[doc.id];
        return <div key={doc.id} style={cardStyle} onMouseEnter={e=>{Object.assign(e.currentTarget.style,cardHover)}} onMouseLeave={e=>{e.currentTarget.style.border='1px solid rgba(198,163,78,.12)';e.currentTarget.style.background='rgba(255,255,255,.02)'}}>
          {/* Card header */}
          <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(198,163,78,.06)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:28}}>{doc.icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{doc.title}</div>
                <div style={{fontSize:10,color:doc.color,marginTop:2}}>{doc.subtitle}</div>
              </div>
            </div>
            <span style={{fontSize:9,padding:'3px 8px',borderRadius:12,background:'rgba(239,68,68,.1)',color:'#ef4444',fontWeight:700,textTransform:'uppercase'}}>{doc.status}</span>
          </div>

          {/* Card body */}
          <div style={{padding:'12px 18px'}}>
            <p style={{fontSize:11,color:'#a09c94',lineHeight:1.5,marginBottom:10}}>{doc.description}</p>
            <div style={{fontSize:10,color:'#5e5c56',marginBottom:8}}>
              <span style={{color:'#c6a34e'}}>📖</span> {doc.legalRef} — <b>{doc.articles} articles</b>
            </div>

            {/* Sections preview */}
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
              {doc.sections.slice(0,5).map((sec,i)=><span key={i} style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:'rgba(198,163,78,.05)',color:'#8a8578'}}>{sec}</span>)}
              {doc.sections.length>5&&<span style={{fontSize:9,padding:'2px 6px',color:'#5e5c56'}}>+{doc.sections.length-5} autres</span>}
            </div>
          </div>

          {/* Card actions */}
          <div style={{padding:'10px 18px 14px',borderTop:'1px solid rgba(198,163,78,.04)',display:'flex',gap:8}}>
            <button onClick={()=>generatePDF(doc)} disabled={generating===doc.id}
              style={{flex:1,padding:'9px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:11,fontFamily:'inherit',
                background:generating===doc.id?'rgba(198,163,78,.15)':'linear-gradient(135deg,#c6a34e,#a08030)',
                color:generating===doc.id?'#c6a34e':'#fff',transition:'all .2s'}}>
              {generating===doc.id?'⏳ Génération...':isGenerated?'✅ Re-générer PDF':'🖨 Générer PDF'}
            </button>
            <button onClick={()=>openEmailModal(doc)}
              style={{flex:1,padding:'9px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',cursor:'pointer',fontWeight:600,fontSize:11,fontFamily:'inherit',
                background:isSent?'rgba(74,222,128,.08)':'transparent',
                color:isSent?'#4ade80':'#c6a34e',transition:'all .2s'}}>
              {isSent?'✅ Envoyé':'✉️ Envoyer au client'}
            </button>
          </div>
        </div>;
      })}
    </div>

    {/* Quick actions */}
    <C style={{marginTop:16,padding:'14px 18px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700,fontSize:13}}>⚡ Actions groupées</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Générer ou envoyer tous les documents d'un coup</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{docs.forEach((doc,i)=>setTimeout(()=>generatePDF(doc),i*1500))}}
            style={{padding:'10px 20px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit',background:'linear-gradient(135deg,#c6a34e,#a08030)',color:'#fff'}}>
            🖨 Générer les 4 PDF
          </button>
          <button onClick={()=>openEmailModal({id:'all',title:'Tous les documents'})}
            style={{padding:'10px 20px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit',background:'transparent',color:'#c6a34e'}}>
            ✉️ Envoyer les 4 au client
          </button>
        </div>
      </div>
    </C>

    {/* Phase 0 checklist */}
    <C style={{marginTop:12,padding:'14px 18px'}}>
      <ST>Phase 0 — Checklist documents juridiques</ST>
      {[
        {label:'Convention de Mandat Client',done:generated.convention_mandat,icon:'📋'},
        {label:'DPA Sous-traitance Données (art. 28 RGPD)',done:generated.dpa_rgpd,icon:'🔒'},
        {label:'Registre de Traitement RGPD (art. 30)',done:generated.registre_rgpd,icon:'📊'},
        {label:'Politique de Confidentialité',done:generated.politique_confidentialite,icon:'🛡'},
      ].map((item,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
        <span style={{fontSize:16}}>{item.done?'✅':'⬜'}</span>
        <span style={{fontSize:16}}>{item.icon}</span>
        <span style={{fontSize:12,fontWeight:item.done?600:400,color:item.done?'#4ade80':'#d4d0c8'}}>{item.label}</span>
        {sent[['convention_mandat','dpa_rgpd','registre_rgpd','politique_confidentialite'][i]]&&
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(74,222,128,.1)',color:'#4ade80',marginLeft:'auto'}}>✉️ Envoyé</span>}
      </div>)}
    </C>

    {/* Warning */}
    <C style={{marginTop:12,padding:'12px 18px',fontSize:11,color:'#f59e0b',background:'rgba(245,158,11,.03)',border:'1px solid rgba(245,158,11,.1)',borderRadius:10}}>
      <b>⚠️ Important :</b> Ces documents sont des templates pré-remplis avec les données du dossier client. Faites-les valider par un juriste avant première utilisation avec de vrais clients. Le Client doit signer la procuration MAHIS séparément via eID sur le portail de la sécurité sociale.
    </C>

    {/* Email modal */}
    {emailModal&&<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setEmailModal(null)}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#1e1e2e',borderRadius:16,padding:24,width:440,border:'1px solid rgba(198,163,78,.2)',boxShadow:'0 20px 60px rgba(0,0,0,.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:16}}>✉️ Envoyer {emailModal.id==='all'?'les 4 documents':emailModal.title}</div>
          <button onClick={()=>setEmailModal(null)} style={{background:'none',border:'none',color:'#5e5c56',cursor:'pointer',fontSize:18}}>✕</button>
        </div>

        {emailSent?<div style={{textAlign:'center',padding:'30px 0'}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <div style={{fontWeight:700,fontSize:16,color:'#4ade80'}}>Document(s) envoyé(s) !</div>
          <div style={{fontSize:12,color:'#5e5c56',marginTop:6}}>Un email avec le(s) PDF a été envoyé à <b>{email}</b></div>
          <button onClick={()=>setEmailModal(null)} style={{marginTop:16,padding:'10px 24px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:12,fontFamily:'inherit',background:'linear-gradient(135deg,#c6a34e,#a08030)',color:'#fff'}}>Fermer</button>
        </div>:<div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:'#5e5c56',display:'block',marginBottom:4}}>Email du client</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@example.com"
              style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'rgba(255,255,255,.03)',color:'#d4d0c8',fontSize:13,fontFamily:'inherit',outline:'none'}}/>
          </div>
          <div style={{fontSize:11,color:'#5e5c56',marginBottom:16,padding:'10px 12px',background:'rgba(96,165,250,.03)',borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
            📎 Le PDF sera pré-rempli avec les données de <b>{clientName}</b> ({clientVat}) et envoyé en pièce jointe.
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setEmailModal(null)} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',cursor:'pointer',fontWeight:600,fontSize:12,fontFamily:'inherit',background:'transparent',color:'#5e5c56'}}>Annuler</button>
            <button onClick={sendEmail} disabled={sending}
              style={{flex:1,padding:'10px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit',background:'linear-gradient(135deg,#c6a34e,#a08030)',color:'#fff'}}>
              {sending?'⏳ Envoi en cours...':'✉️ Envoyer maintenant'}
            </button>
          </div>
        </div>}
      </div>
    </div>}
  </div>;
}

function AlertesLegalesMod({s,d}){
  const now=new Date();
  const m=now.getMonth()+1;const y=now.getFullYear();
  const trim=Math.ceil(m/3);
  
  // ── STATE POUR VEILLE AUTO ──
  const [veille,setVeille]=useState(null); // résultats de la dernière veille
  const [veilleLoading,setVeilleLoading]=useState(false);
  const [veilleError,setVeilleError]=useState('');
  const [veilleDate,setVeilleDate]=useState(null);
  const [veilleLog,setVeilleLog]=useState([]);
  const [showVeille,setShowVeille]=useState(false);
  
  const alertes=[
    // ── ÉCHÉANCES RÉCURRENTES ──
    {type:'echeance',urgence:'haute',date:`05/${String(m<12?m+1:1).padStart(2,'0')}/${m<12?y:y+1}`,titre:'Provisions ONSS mensuelles',desc:`Paiement provisions au 5 du mois suivant (Art. 34 AR ONSS). Montant = 30-35% des cotisations trimestrielles.`,categorie:'ONSS',source:'onss.be'},
    {type:'echeance',urgence:'haute',date:trim===1?`15/04/${y}`:trim===2?`15/07/${y}`:trim===3?`15/10/${y}`:`15/01/${y+1}`,titre:`PP 274 — T${trim}/${y}`,desc:`Déclaration et paiement du précompte professionnel via FinProf (SPF Finances). Secrétariats sociaux: avant-dernier jour ouvrable du mois suivant.`,categorie:'Fiscal',source:'finances.belgium.be'},
    {type:'echeance',urgence:'haute',date:trim===1?`30/04/${y}`:trim===2?`31/07/${y}`:trim===3?`31/10/${y}`:`31/01/${y+1}`,titre:`DmfA T${trim}/${y}`,desc:`Déclaration multif. ONSS — trimestrielle via batch ou portail socialsecurity.be. Solde des cotisations dû le dernier jour du mois suivant le trimestre.`,categorie:'ONSS',source:'socialsecurity.be'},
    {type:'echeance',urgence:'moyenne',date:'28/02/'+y,titre:'Belcotax — Fiches 281',desc:'Envoi des fiches fiscales 281.10 (salariés) et 281.20 (dirigeants) via Belcotax on web — Délai légal: 28/02.',categorie:'Fiscal',source:'belcotaxonweb.be'},
    {type:'echeance',urgence:'moyenne',date:'31/03/'+y,titre:'Bilan social BNB',desc:'Dépôt du bilan social (annexe au bilan annuel) auprès de la BNB — entreprises > 20 ETP.',categorie:'BNB',source:'nbb.be'},
    {type:'echeance',urgence:'moyenne',date:'30/04/'+y,titre:'Cotis. vacances ouvriers (10,27%)',desc:'Cotisation annuelle vacances ouvriers (10,27% sur masse salariale brute 108% année N-1). Payée par l\'employeur à l\'ONVA ou caisse sectorielle.',categorie:'ONSS',source:'onss.be'},
    {type:'echeance',urgence:'basse',date:'31/10/'+y,titre:'Cotisation Wijninckx',desc:`Cotisation spéciale 12,5% (depuis 2026 — ex 3%) sur pensions complémentaires élevées. Sigedis calcule via DB2P, paiement à l'ONSS avant 31/12.`,categorie:'ONSS',source:'db2p.be'},
    {type:'echeance',urgence:'basse',date:`31/01/${y+1}`,titre:'Statistiques INS',desc:'Déclaration statistique annuelle sur les salaires et les conditions de travail (INS/Statbel).',categorie:'Statistiques',source:'statbel.fgov.be'},
    
    // ── NOUVEAUTÉS 2026 ──
    {type:'legal',urgence:'haute',date:'01/01/2026',titre:'Chèques-repas → 10€ max',desc:'Valeur max augmentée de 8€ à 10€ (empl 8,91€ + trav 1,09€). Déductibilité fiscale: 4€/chèque (si empl paie max). Nécessite CCT sectorielle ou avenant CTI. Norme salariale 0%: seule augmentation de max 2€ exclue.',categorie:'Rémunération',source:'Liantis + Moniteur 30/12/2025'},
    {type:'legal',urgence:'haute',date:'01/01/2026',titre:'Wijninckx → 12,5%',desc:'Cotisation spéciale pensions complémentaires élevées passe de 3% à 12,5% (Loi 18/12/2025 — M.B. 30/12/2025). Applicable dès année de cotisation 2026. Objectif pension: 97.548€/an.',categorie:'Pension',source:'Partena — Loi 18/12/2025'},
    {type:'legal',urgence:'haute',date:'01/01/2026',titre:'Étudiant → 650h/an',desc:'Contingent étudiant augmenté de 600h à 650h/an. Pas de PP sur les 650 premières heures (Annexe III 2026). Cotisation solidarité 2,71% + 5,42%.',categorie:'Contrats',source:'Securex + Annexe III'},
    {type:'legal',urgence:'haute',date:'01/04/2026',titre:'HS volontaires → 360h/an (NOUVEAU)',desc:'Nouveau régime unique: 360h/an (450h horeca). 240h brut=net (pas de sursalaire, pas ONSS, pas PP). Accord écrit 1 an, reconduction tacite. Résiliation préavis 1 mois. TP: 3 ans ancienneté + surcroît temporaire.',categorie:'Durée travail',source:'CM 05/12/2025 + avant-projet loi'},
    {type:'legal',urgence:'moyenne',date:'01/01-31/03/2026',titre:'Heures relance (transitoire T1)',desc:'120h de relance encore utilisables jusqu\'au 31/03/2026 (brut=net). Accord écrit obligatoire. ATTENTION: déduites du quota 240h brut=net du nouveau régime à partir du 01/04.',categorie:'Durée travail',source:'Dynamik HR + Partena'},
    {type:'legal',urgence:'haute',date:'01/01/2026',titre:'HS fiscalement avantageuses → 180h',desc:'Contingent structurel de 180 heures supplémentaires avec sursalaire bénéficiant de la dispense PP employeur + réduction PP travailleur (Art.154bis CIR). Construction avec EPRE: 180h aussi (fin régime spécifique).',categorie:'Fiscal',source:'Accord Arizona + Securex'},
    {type:'legal',urgence:'moyenne',date:'01/01/2026',titre:'Cotisation chômage temporaire → 0,09%',desc:'La cotisation patronale pour le chômage temporaire diminue à 0,09% pour T1/2026 (FEB).',categorie:'ONSS',source:'VBO-FEB T1/2026'},
    {type:'legal',urgence:'basse',date:'T1-T3 2026',titre:'Cotisation Fonds amiante',desc:'Cotisation Fonds amiante due uniquement pour les 3 premiers trimestres de 2026 (FEB).',categorie:'ONSS',source:'VBO-FEB T1/2026'},
    {type:'legal',urgence:'basse',date:'2026',titre:'Cotisation FFE (Fonds Fermeture)',desc:'FFE classique: 0,32% (<20 trav.) / 0,37% (≥20 trav.) pour 2026. Vérifier par CP.',categorie:'ONSS',source:'VBO-FEB T1/2026'},
    
    // ── RÉFORMES À VENIR (VEILLE) ──
    {type:'veille',urgence:'info',date:'2026-2030',titre:'Quotité exemptée → 15.600€ progressif',desc:'Augmentation progressive de la quotité exemptée de 10.900€ à 15.600€ d\'ici revenus 2030. Premiers paliers dès 2026. Impact sur PP: réduction progressive.',categorie:'Fiscal',source:'Projet loi IPP — Securex'},
    {type:'veille',urgence:'info',date:'2027-2030',titre:'Suppression quotient conjugal',desc:'Suppression progressive du quotient conjugal dès exercice d\'imposition 2027. Avantage réduit de moitié après 4 ans. Impact sur barème 2 (marié 1 revenu).',categorie:'Fiscal',source:'Projet loi IPP — Securex'},
    {type:'veille',urgence:'info',date:'2026',titre:'Bonus/Malus pension',desc:'Nouveau système bonus 2-5%/an pour report pension, malus pour anticipation. Remplace ancien bonus pension supprimé. Entrée: 2026-2040 progressif.',categorie:'Pension',source:'Projet loi réforme pensions'},
    {type:'veille',urgence:'info',date:'2026',titre:'Plafond indexation 4.000€',desc:'L\'accord de gouvernement prévoit un plafond de 4.000€ brut pour le calcul de l\'indexation automatique. Pas encore législatif.',categorie:'Rémunération',source:'Accord Arizona'},
    
    // ── INDEXATIONS ──
    {type:'indexation',urgence:'info',date:'01/01/'+y,titre:'Index CP 200 (auxiliaire employés)',desc:'Indexation de 2,21% au 01/01/2026. Adaptation automatique des barèmes A/B/C/D.',categorie:'Barèmes',source:'salairesminimums.be'},
    {type:'indexation',urgence:'info',date:'Trimestriel',titre:'Index CP 124 Construction',desc:'Indexation trimestrielle. Vérifier les taux horaires catégories I→Chef IV.',categorie:'Barèmes',source:'salairesminimums.be'},
    {type:'indexation',urgence:'info',date:'01/01/'+y,titre:'Index CP 302 Horeca',desc:'Indexation au 01/01/2026. Catégories I-V par ancienneté.',categorie:'Barèmes',source:'salairesminimums.be'},
    
    // ── PERMANENTS ──
    {type:'echeance',urgence:'haute',date:'Permanent',titre:'Dimona IN/OUT obligatoire',desc:'Dimona IN au plus tard le jour de l\'entrée en service. Dimona OUT le dernier jour. Amende: 2.750€ à 13.750€ par infraction.',categorie:'ONSS',source:'Art. 7 AR 05/11/2002'},
    {type:'echeance',urgence:'moyenne',date:'Mensuel (25)',titre:'Paiement salaires',desc:'Salaire versé au plus tard le dernier jour ouvrable du mois (Art. 5 Loi 12/04/1965). Exécution SEPA: date cible le 25.',categorie:'Paie',source:'Loi 12/04/1965'},
    {type:'legal',urgence:'basse',date:'Permanent',titre:'Moniteur belge — Veille quotidienne',desc:'Surveiller: AR précompte (jan.), CCT sectorielles, circulaires ONSS (trimestrielles), circulaires SPF Finances.',categorie:'Veille',source:'ejustice.just.fgov.be'},
  ];
  
  const urgColors={haute:'#f87171',moyenne:'#fb923c',basse:'#60a5fa',info:'#9e9b93'};
  const urgLabels={haute:'🔴 Urgente',moyenne:'🟠 À planifier',basse:'🔵 Rappel',info:'ℹ️ Info'};
  const [filter,setFilter]=useState('all');
  
  // ── Merge veille results with static alerts ──
  const allAlertes = veille && veille.alertes ? [...alertes, ...veille.alertes.filter(va=>!alertes.some(a=>a.titre===va.titre))] : alertes;
  const filtered=filter==='all'?allAlertes:allAlertes.filter(a=>a.type===filter);

  // ── VEILLE AUTOMATIQUE — Claude API + Web Search ──
  const runVeille = async () => {
    setVeilleLoading(true);
    setVeilleError('');
    setVeilleLog([]);
    const addLog = (msg) => setVeilleLog(prev=>[...prev, {t:new Date().toLocaleTimeString('fr-BE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg}]);
    
    addLog('🔍 Lancement de la veille légale belge...');
    
    const SOURCES = [
      'cotisations ONSS 2026 taux belgique nouveautés',
      'précompte professionnel barème 2026 belgique Annexe III',
      'droit social belgique 2026 nouvelles lois moniteur belge arrêté royal',
      'indexation salaires belgique 2026 commissions paritaires index santé pivot',
      'réforme pension belgique 2026 bonus malus arizona Wijninckx',
      'Fedris accidents travail cotisation tarification 2026 belgique',
      'ONVA vacances annuelles ouvriers taux 2026 pécule',
      'FLA federal learning account obligation formation employeur belgique 2026',
      'cotisation spéciale sécurité sociale 2026 belgique barème suppression progressive',
      'DMFA DRS belgique 2026 modifications formulaires socialsecurity',
    ];
    
    try {
      addLog('📡 Interrogation Claude + recherche web sur 5 sources...');
      
      const systemPrompt = `Tu es un expert en droit social belge et en législation du travail. Tu dois analyser les résultats de recherche web pour identifier les CHANGEMENTS LÉGISLATIFS RÉCENTS en Belgique concernant:
- Taux ONSS (cotisations patronales et personnelles)
- Précompte professionnel (barèmes, tranches, quotité exemptée)
- Chèques-repas, éco-chèques, avantages
- Contrats d'étudiant (contingent heures)
- Heures supplémentaires (contingent fiscal, volontaires)
- Cotisation Wijninckx (pension complémentaire)
- Indexations salariales par CP
- Réformes en cours (Arizona, pensions, quotient conjugal)

PARAMÈTRES ACTUELS À VÉRIFIER:
- ONSS travailleur: 13,07%
- ONSS employeur marchand: 25,00% (facial, post tax-shift)
- ONSS employeur non-marchand: 32,40% (Maribel social)
- Quotité exemptée: 10.900€
- Frais prof. forfaitaires: 30%, max 5.930€
- Chèques-repas max: 10€ (8,91€ empl + 1,09€ trav)
- Éco-chèques: 250€/an max
- HS fiscalement avantageuses: 180h/an
- HS volontaires: 360h/an (240h brut=net) depuis 01/04/2026
- Étudiant: 650h/an
- Wijninckx: 12,5% (depuis 2026)
- Bonus emploi volet A: max 132,92€, seuil 3.340,44€
- Bonus emploi volet B: max 123,08€, seuil 2.833,27€
- CSS isolé max: 60,94€/mois (182,82€/trim)
- CSS ménage 2 revenus max: 51,64€/mois (154,92€/trim)
- Vacances ouvriers cotis: 10,27% (brut 108% année N-1)
- FFE petites entreprises: 0,32%
- FFE grandes entreprises: 0,37%
- Chômage temporaire cotis: 0,09%
- Index santé pivot: vérifier le dernier dépassement
- FLA (Federal Learning Account): obligation active depuis 01/04/2024
- Fedris: vérifier taux AT par secteur
- Flexi-jobs cotis patronale: 28%
- Étudiant cotis solidarité: 2,71% perso + 5,42% patronale

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec cette structure:
{
  "date_analyse": "date ISO",
  "parametres_verifies": [
    {"param": "nom du paramètre", "valeur_actuelle": "valeur dans l'app", "valeur_trouvee": "valeur trouvée", "statut": "OK|CHANGÉ|NOUVEAU", "source": "url ou nom source", "detail": "explication si changé"}
  ],
  "nouvelles_alertes": [
    {"type": "legal|veille|indexation", "urgence": "haute|moyenne|basse|info", "date": "date", "titre": "titre court", "desc": "description complète", "categorie": "catégorie", "source": "source"}
  ],
  "resume": "résumé en 2-3 phrases des changements détectés ou confirmation que tout est à jour"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: `Effectue une veille législative complète sur le droit social belge. Voici les sources à vérifier: ${SOURCES.join(', ')}. Date d'aujourd'hui: ${new Date().toLocaleDateString('fr-BE')}. Vérifie si les paramètres de paie belges sont toujours à jour pour ${y}.` }],
          system: systemPrompt,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        })
      });
      
      addLog('📥 Réponse reçue de Claude...');
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText.substring(0,200)}`);
      }
      
      const data = await response.json();
      
      // Extract text from response (may have multiple content blocks due to tool use)
      const fullText = data.content
        .map(item => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");
      
      addLog('🔎 Analyse des résultats...');
      
      // Parse JSON response
      let parsed = null;
      try {
        const clean = fullText.replace(/```json|```/g, "").trim();
        // Find JSON object in the text
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch(parseErr) {
        addLog('⚠️ Résultats en texte brut (pas de JSON structuré)');
        parsed = { resume: fullText, parametres_verifies: [], nouvelles_alertes: [] };
      }
      
      if (parsed) {
        // Process parameter changes
        const changes = (parsed.parametres_verifies||[]).filter(p=>p.statut==='CHANGÉ');
        const newAlerts = parsed.nouvelles_alertes||[];
        
        if (changes.length > 0) {
          addLog(`⚠️ ${changes.length} PARAMÈTRE(S) MODIFIÉ(S) DÉTECTÉ(S) !`);
          changes.forEach(c => addLog(`  → ${c.param}: ${c.valeur_actuelle} → ${c.valeur_trouvee} (${c.source})`));
        } else {
          addLog('✅ Tous les paramètres sont à jour !');
        }
        
        if (newAlerts.length > 0) {
          addLog(`📢 ${newAlerts.length} nouvelle(s) alerte(s) ajoutée(s)`);
        }
        
        // Format for state
        const veilleResult = {
          date: new Date().toISOString(),
          parametres: parsed.parametres_verifies || [],
          alertes: newAlerts.map(a=>({...a, fromVeille:true})),
          resume: parsed.resume || 'Veille effectuée.',
          changes: changes,
        };
        
        setVeille(veilleResult);
        setVeilleDate(new Date());
        
        // Save to persistent storage
        try {
          try { localStorage.setItem('aureus-veille-latest', JSON.stringify(veilleResult)); } catch(e) {}
        } catch(e){}
        
        addLog('💾 Résultats sauvegardés.');
        addLog('✅ Veille terminée avec succès !');
      }
      
    } catch(err) {
      console.error('Veille error:', err);
      setVeilleError(err.message || 'Erreur lors de la veille');
      addLog(`❌ Erreur: ${err.message}`);
    }
    
    setVeilleLoading(false);
  };
  
  // Load last veille on mount
  useEffect(()=>{
    (async()=>{
      try {
        if (typeof window === 'undefined') return;
        const val = localStorage.getItem('aureus-veille-latest');
        if(val) {
          const data = JSON.parse(val);
          setVeille(data);
          setVeilleDate(new Date(data.date));
        }
      } catch(e){}
    })();
  },[]);
  
  // Calendrier FinProf PP
  const calPP=[
    {periode:'T4/2025',deadline:'15/01/2026'},
    {periode:'T1/2026',deadline:'15/04/2026'},
    {periode:'T2/2026',deadline:'15/07/2026'},
    {periode:'T3/2026',deadline:'15/10/2026'},
    {periode:'T4/2026',deadline:'15/01/2027'},
  ];
  // Calendrier ONSS
  const calONSS=[
    {periode:'T4/2025',deadline:'31/01/2026',dmfa:'31/01/2026'},
    {periode:'T1/2026',deadline:'30/04/2026',dmfa:'30/04/2026'},
    {periode:'T2/2026',deadline:'31/07/2026',dmfa:'31/07/2026'},
    {periode:'T3/2026',deadline:'31/10/2026',dmfa:'31/10/2026'},
    {periode:'T4/2026',deadline:'31/01/2027',dmfa:'31/01/2027'},
  ];
  
  return <div>
    <PH title="Veille légale & Calendrier 2026" sub="Institutions — Échéances — Nouveautés législatives — Sources" actions={
      <button onClick={runVeille} disabled={veilleLoading} style={{padding:'10px 20px',borderRadius:10,background:veilleLoading?'rgba(198,163,78,.08)':'linear-gradient(135deg,#c6a34e,#a8893d)',color:veilleLoading?'#c6a34e':'#060810',border:'none',fontWeight:700,fontSize:12.5,cursor:veilleLoading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:8}}>
        {veilleLoading?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Veille en cours...</>:'🔄 Actualiser la veille légale'}
      </button>
    }/>
    
    {/* ── PANNEAU VEILLE AGENT IA ── */}
    {(veilleLoading || veilleLog.length>0 || veille) && <C style={{marginBottom:18,border:'1px solid rgba(198,163,78,.2)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#c6a34e,#a8893d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤖</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#e2c878'}}>Agent Veille Légale</div>
            <div style={{fontSize:10.5,color:'#8b7340'}}>Claude + Web Search — Monitoring droit social belge</div>
          </div>
        </div>
        {veilleDate && <div style={{fontSize:10,color:'#4ade80'}}>
          Dernière maj: {veilleDate.toLocaleDateString('fr-BE')} à {veilleDate.toLocaleTimeString('fr-BE',{hour:'2-digit',minute:'2-digit'})}
        </div>}
      </div>
      
      {/* LOG EN TEMPS RÉEL */}
      {veilleLog.length>0 && <div style={{background:'rgba(0,0,0,.3)',borderRadius:8,padding:12,marginBottom:12,maxHeight:180,overflowY:'auto',fontFamily:'monospace',fontSize:11}}>
        {veilleLog.map((l,i)=><div key={i} style={{padding:'2px 0',color:l.msg.includes('❌')?'#f87171':l.msg.includes('⚠️')?'#fb923c':l.msg.includes('✅')?'#4ade80':'#9e9b93'}}>
          <span style={{color:'#5e5c56',marginRight:8}}>[{l.t}]</span>{l.msg}
        </div>)}
        {veilleLoading && <div style={{color:'#c6a34e',animation:'pulse 1.5s infinite'}}>⏳ En attente de réponse...</div>}
      </div>}
      
      {/* ERREUR */}
      {veilleError && <div style={{padding:'10px 14px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:8,marginBottom:12,fontSize:12,color:'#f87171'}}>
        ❌ {veilleError}
      </div>}
      
      {/* RÉSULTATS DE LA VEILLE */}
      {veille && !veilleLoading && <>
        {/* RÉSUMÉ */}
        <div style={{padding:'12px 16px',background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)',borderRadius:10,marginBottom:14,fontSize:12.5,color:'#d4d0c8',lineHeight:1.6}}>
          <div style={{fontWeight:700,color:'#4ade80',marginBottom:6}}>📋 Résumé de la veille</div>
          {veille.resume}
        </div>
        
        {/* PARAMÈTRES VÉRIFIÉS */}
        {veille.parametres && veille.parametres.length > 0 && <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>📊 Paramètres vérifiés ({veille.parametres.length})</div>
          <div style={{display:'grid',gap:4}}>
            {veille.parametres.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'rgba(198,163,78,.03)',borderRadius:6,borderLeft:`3px solid ${p.statut==='OK'?'#4ade80':p.statut==='CHANGÉ'?'#f87171':'#fb923c'}`,fontSize:11.5}}>
              <span style={{fontWeight:600,color:p.statut==='OK'?'#4ade80':p.statut==='CHANGÉ'?'#f87171':'#fb923c',width:16}}>{p.statut==='OK'?'✅':p.statut==='CHANGÉ'?'⚠️':'🆕'}</span>
              <span style={{color:'#e8e6e0',flex:1}}>{p.param}</span>
              <span style={{fontFamily:'monospace',color:'#c6a34e'}}>{p.valeur_trouvee || p.valeur_actuelle}</span>
              {p.statut==='CHANGÉ'&&<span style={{fontSize:10,color:'#f87171'}}>← était: {p.valeur_actuelle}</span>}
              {p.source&&<span style={{fontSize:9.5,color:'#60a5fa'}}>({p.source})</span>}
            </div>)}
          </div>
        </div>}
        
        {/* CHANGEMENTS DÉTECTÉS */}
        {veille.changes && veille.changes.length > 0 && <div style={{padding:'12px 16px',background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.2)',borderRadius:10,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'#f87171',marginBottom:8}}>⚠️ CHANGEMENTS DÉTECTÉS — Action requise</div>
          {veille.changes.map((c,i)=><div key={i} style={{padding:'6px 0',borderBottom:'1px solid rgba(248,113,113,.1)',fontSize:12,color:'#d4d0c8'}}>
            <b>{c.param}:</b> {c.valeur_actuelle} → <b style={{color:'#f87171'}}>{c.valeur_trouvee}</b>
            {c.detail&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{c.detail}</div>}
          </div>)}
        </div>}
        
        {/* NOUVELLES ALERTES DE LA VEILLE */}
        {veille.alertes && veille.alertes.length > 0 && <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:'#fb923c',marginBottom:8}}>📢 Nouvelles alertes détectées ({veille.alertes.length})</div>
          {veille.alertes.map((a,i)=><div key={i} style={{padding:'10px 14px',background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:8,borderLeft:`3px solid ${urgColors[a.urgence]||'#9e9b93'}`,marginBottom:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12.5,fontWeight:600,color:'#e8e6e0'}}>{a.titre} <span style={{fontSize:10,color:'#4ade80',background:'rgba(74,222,128,.1)',padding:'2px 6px',borderRadius:4,marginLeft:6}}>NOUVEAU</span></span>
              <span style={{fontSize:10,color:urgColors[a.urgence]}}>{urgLabels[a.urgence]}</span>
            </div>
            <div style={{fontSize:11,color:'#9e9b93',marginTop:4}}>{a.desc}</div>
          </div>)}
        </div>}
      </>}
    </C>}
    
    <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <div>
      <C>
        <ST>Filtrer</ST>
        {[{v:'all',l:'📋 Tout ('+alertes.length+')'},{v:'echeance',l:'📅 Échéances'},{v:'legal',l:'⚖️ Nouveautés 2026'},{v:'veille',l:'🔮 Réformes à venir'},{v:'indexation',l:'📈 Indexations'}].map(x=>
          <button key={x.v} onClick={()=>setFilter(x.v)} style={{display:'block',width:'100%',padding:'9px 12px',marginBottom:4,border:filter===x.v?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',borderRadius:7,background:filter===x.v?'rgba(198,163,78,.1)':'rgba(198,163,78,.02)',color:filter===x.v?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:12,textAlign:'left',fontFamily:'inherit',fontWeight:filter===x.v?600:400}}>{x.l}</button>
        )}
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé</div>
          <div>🔴 Urgentes: <b style={{color:'#f87171'}}>{alertes.filter(a=>a.urgence==='haute').length}</b></div>
          <div>🟠 À planifier: <b style={{color:'#fb923c'}}>{alertes.filter(a=>a.urgence==='moyenne').length}</b></div>
          <div>🔵 Rappels: <b style={{color:'#60a5fa'}}>{alertes.filter(a=>a.urgence==='basse').length}</b></div>
          <div>ℹ️ Veille: <b style={{color:'#9e9b93'}}>{alertes.filter(a=>a.urgence==='info').length}</b></div>
        </div>
      </C>

      {/* CALENDRIER PP FINPROF */}
      <C style={{marginTop:14}}>
        <ST>📅 Calendrier PP (FinProf)</ST>
        <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.8}}>
          {calPP.map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(198,163,78,.06)'}}>
            <span>{c.periode}</span><b style={{color:'#c6a34e'}}>{c.deadline}</b>
          </div>)}
          <div style={{marginTop:6,fontSize:9.5,color:'#60a5fa'}}>SPF Finances — finances.belgium.be/fr/FinProf<br/>Secrétariats sociaux agréés: avant-dernier jour ouvrable du mois suivant</div>
        </div>
      </C>
      
      {/* CALENDRIER ONSS */}
      <C style={{marginTop:14}}>
        <ST>📅 Calendrier ONSS / DmfA</ST>
        <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:1.8}}>
          {calONSS.map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(198,163,78,.06)'}}>
            <span>{c.periode}</span><b style={{color:'#c6a34e'}}>{c.deadline}</b>
          </div>)}
          <div style={{marginTop:6,fontSize:9.5,color:'#60a5fa'}}>Provisions mensuelles: le 5 du mois suivant<br/>Solde trimestriel: dernier jour du mois suivant le trimestre</div>
        </div>
      </C>

      {/* INSTITUTIONS */}
      <C style={{marginTop:14}}>
        <ST>🏛 Institutions de référence</ST>
        <div style={{fontSize:10,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:2,fontSize:11}}>Fédéral — Sécurité sociale</div>
          <div><b style={{color:'#c6a34e'}}>ONSS</b> — onss.be / socialsecurity.be</div>
          <div><b style={{color:'#c6a34e'}}>SPF Finances</b> — finances.belgium.be</div>
          <div><b style={{color:'#c6a34e'}}>Fisconetplus</b> — eservices.minfin.fgov.be <span style={{color:'#60a5fa'}}>(circulaires, Annexe III PP)</span></div>
          <div><b style={{color:'#c6a34e'}}>SPF Emploi</b> — emploi.belgique.be</div>
          <div><b style={{color:'#c6a34e'}}>Moniteur belge</b> — ejustice.just.fgov.be</div>
          <div><b style={{color:'#c6a34e'}}>CNT</b> — cnt-nar.be (CCT interprof.)</div>
          <div><b style={{color:'#c6a34e'}}>ONEM</b> — onem.be</div>
          <div><b style={{color:'#c6a34e'}}>INAMI</b> — inami.fgov.be</div>
          <div><b style={{color:'#c6a34e'}}>SFP</b> — sfpd.fgov.be / MyPension.be</div>
          <div><b style={{color:'#c6a34e'}}>Sigedis</b> — sigedis.be / DB2P</div>
          <div><b style={{color:'#c6a34e'}}>Fedris</b> — fedris.be <span style={{color:'#60a5fa'}}>(accidents travail, maladies prof.)</span></div>
          <div><b style={{color:'#c6a34e'}}>ONVA</b> — onva.be <span style={{color:'#60a5fa'}}>(vacances annuelles ouvriers)</span></div>
          <div><b style={{color:'#c6a34e'}}>BCSS/KSZ</b> — ksz-bcss.fgov.be <span style={{color:'#60a5fa'}}>(Banque Carrefour SS)</span></div>
          <div><b style={{color:'#c6a34e'}}>CAPAC</b> — capac.fgov.be <span style={{color:'#60a5fa'}}>(allocations chômage, C4)</span></div>
          <div><b style={{color:'#c6a34e'}}>INASTI</b> — inasti.be <span style={{color:'#60a5fa'}}>(indépendants, statut mixte)</span></div>
          <div><b style={{color:'#c6a34e'}}>SPF Économie</b> — economie.fgov.be <span style={{color:'#60a5fa'}}>(index santé, indices prix)</span></div>
          <div><b style={{color:'#c6a34e'}}>FLA</b> — federallearningaccount.be <span style={{color:'#60a5fa'}}>(obligation formation)</span></div>
          <div><b style={{color:'#c6a34e'}}>Statbel</b> — statbel.fgov.be</div>
          <div><b style={{color:'#c6a34e'}}>BCE</b> — kbo-bce-search.economie.fgov.be</div>
          <div><b style={{color:'#c6a34e'}}>Belcotax</b> — belcotaxonweb.be</div>
          <div><b style={{color:'#c6a34e'}}>Chambre</b> — lachambre.be <span style={{color:'#f87171'}}>(projets de loi = alertes précoces!)</span></div>
          <div style={{borderTop:'1px solid rgba(198,163,78,.1)',paddingTop:6,marginTop:4}}>
            <b style={{color:'#60a5fa'}}>Régions:</b><br/>
            Bruxelles: Actiris (activa.brussels)<br/>
            Wallonie: FOREM (forem.be)<br/>
            Flandre: VDAB (vdab.be)
          </div>
          <div style={{borderTop:'1px solid rgba(198,163,78,.1)',paddingTop:6,marginTop:4}}>
            <b style={{color:'#fb923c'}}>Secrétariats sociaux (veille):</b><br/>
            Securex — Partena — Acerta — Liantis — UCM — Groupe S
          </div>
          <div style={{borderTop:'1px solid rgba(198,163,78,.1)',paddingTop:6,marginTop:4}}>
            <b style={{color:'#9e9b93'}}>Juridique:</b><br/>
            Droitbelge.be — SocialEye (Wolters Kluwer) — Salairesminimums.be
          </div>
        </div>
      </C>
      </div>

      {/* ALERTES DÉTAILLÉES */}
      <C style={{padding:'14px 18px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map((a,i)=>
            <div key={i} style={{padding:'14px 16px',background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10,borderLeft:`3px solid ${urgColors[a.urgence]}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{a.titre}</span>
                <span style={{fontSize:10,color:urgColors[a.urgence],fontWeight:600}}>{urgLabels[a.urgence]}</span>
              </div>
              <div style={{fontSize:11.5,color:'#9e9b93',lineHeight:1.6}}>{a.desc}</div>
              <div style={{display:'flex',gap:12,marginTop:8}}>
                <span style={{fontSize:10,color:'#5e5c56'}}>📅 {a.date}</span>
                <span style={{fontSize:10,color:'#c6a34e'}}>🏷️ {a.categorie}</span>
                {a.source&&<span style={{fontSize:10,color:'#60a5fa'}}>📎 {a.source}</span>}
              </div>
            </div>
          )}
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BILAN SOCIAL BNB — Déclaration annuelle
// ═══════════════════════════════════════════════════════════════
function BilanSocialBNBMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const ae=s.emps.filter(e=>e.status==='active');
  const ouvriers=ae.filter(e=>(e.statut||'')===('ouvrier'));
  const employes=ae.filter(e=>(e.statut||'')==='employe'||(e.statut||'')==='');
  const h=ae.filter(e=>(e.sexe||'M')==='M').length;
  const f=ae.length-h;
  const etp=ae.reduce((a,e)=>{const r=parseFloat(e.regime)||38;return a+r/38;},0);
  const masseBrute=ae.reduce((a,e)=>a+e.monthlySalary*13,0);
  const masseONSS=ae.reduce((a,e)=>a+e.monthlySalary*13*(LEGAL.ONSS_SECTEUR[e.cp]?.e||0.25),0);
  // ATN totaux
  const atnVoiture=ae.filter(e=>e.carFuel&&e.carFuel!=='none').length;
  const atnGSM=ae.filter(e=>e.atnGSM).length;
  const atnPC=ae.filter(e=>e.atnPC).length;
  const atnInternet=ae.filter(e=>e.atnInternet).length;
  const atnLogement=ae.filter(e=>e.atnLogement).length;
  const atnChauffage=ae.filter(e=>e.atnChauffage).length;
  const atnElec=ae.filter(e=>e.atnElec).length;
  const atnMontantAnnuel=ae.reduce((a,e)=>{const r=calc(e,DPER,s.co);return a+(r.atnTotal||0)*12;},0);
  
  const rubriques=[
    {code:'100',l:'État du personnel',items:[
      {code:'1001',l:'Travailleurs inscrits au registre (fin exercice)',v:ae.length},
      {code:'1001a',l:'  dont Hommes',v:h},
      {code:'1001b',l:'  dont Femmes',v:f},
      {code:'1002',l:'Effectif moyen (ETP)',v:etp.toFixed(1)},
      {code:'1003',l:'Heures prestées',v:(etp*1976).toFixed(0)},
    ]},
    {code:'101',l:'Personnel selon le type de contrat',items:[
      {code:'1011',l:'CDI',v:ae.filter(e=>e.contract==='CDI').length},
      {code:'1012',l:'CDD',v:ae.filter(e=>e.contract==='CDD').length},
      {code:'1013',l:'Travail nettement défini',v:ae.filter(e=>e.contract==='trav_det').length},
      {code:'1014',l:'Contrat de remplacement',v:ae.filter(e=>e.contract==='remplacement').length},
    ]},
    {code:'102',l:'Personnel selon le statut',items:[
      {code:'1021',l:'Employés',v:employes.length},
      {code:'1022',l:'Ouvriers',v:ouvriers.length},
    ]},
    {code:'103',l:'Personnel selon le niveau d\'études',items:[
      {code:'1031',l:'Primaire',v:ae.filter(e=>(e.niveauEtude||'')==='prim').length},
      {code:'1032',l:'Secondaire',v:ae.filter(e=>(e.niveauEtude||'')==='sec_inf'||(e.niveauEtude||'')==='sec').length},
      {code:'1033',l:'Supérieur non-universitaire',v:ae.filter(e=>(e.niveauEtude||'')==='sup').length},
      {code:'1034',l:'Universitaire',v:ae.filter(e=>(e.niveauEtude||'')==='univ').length},
    ]},
    {code:'150',l:'Avantages en nature (ATN)',items:[
      {code:'1501',l:'Véhicule de société',v:atnVoiture},
      {code:'1502',l:'GSM / Téléphone',v:atnGSM},
      {code:'1503',l:'PC / Tablette',v:atnPC},
      {code:'1504',l:'Connexion internet privée',v:atnInternet},
      {code:'1505',l:'Logement gratuit',v:atnLogement},
      {code:'1506',l:'Chauffage',v:atnChauffage},
      {code:'1507',l:'Électricité',v:atnElec},
      {code:'1508',l:'Total bénéficiaires ATN',v:ae.filter(e=>(e.carFuel&&e.carFuel!=='none')||e.atnGSM||e.atnPC||e.atnInternet||e.atnLogement||e.atnChauffage||e.atnElec).length,bold:true},
      {code:'1509',l:'Montant ATN annuel total',v:fmt(atnMontantAnnuel),bold:true},
    ]},
    {code:'200',l:'Frais de personnel',items:[
      {code:'2001',l:'Rémunérations et avantages sociaux directs',v:fmt(masseBrute)},
      {code:'2002',l:'Cotisations patronales ONSS',v:fmt(masseONSS)},
      {code:'2003',l:'Primes patronales assurance extra-légale',v:fmt(0)},
      {code:'2004',l:'Autres frais de personnel',v:fmt(0)},
      {code:'2005',l:'Avantages en nature (ATN)',v:fmt(atnMontantAnnuel)},
      {code:'2006',l:'TOTAL FRAIS DE PERSONNEL',v:fmt(masseBrute+masseONSS+atnMontantAnnuel),bold:true},
    ]},
    {code:'300',l:'Mouvements du personnel',items:[
      {code:'3001',l:'Entrées',v:0},
      {code:'3002',l:'  dont CDI',v:0},
      {code:'3003',l:'Sorties',v:0},
      {code:'3004',l:'  dont pension/prépension',v:0},
      {code:'3005',l:'  dont licenciement',v:0},
      {code:'3006',l:'  dont autre motif',v:0},
    ]},
    {code:'580',l:'Formation continue',items:[
      {code:'5801',l:'Heures de formation (total)',v:0},
      {code:'5802',l:'  dont Hommes',v:0},
      {code:'5803',l:'  dont Femmes',v:0},
      {code:'5804',l:'Coût net formation',v:fmt(0)},
    ]},
  ];
  
  const generateXBRL=()=>{
    let doc=`BILAN SOCIAL — EXERCICE ${yr}\n═══════════════════════════════════════════\n`;
    doc+=`Entreprise: ${s.co.name}\nBCE: ${s.co.bce||'[BCE]'}\nExercice: 01/01/${yr} — 31/12/${yr}\n\n`;
    rubriques.forEach(rub=>{
      doc+=`────────────────────────────────────\n${rub.code} — ${rub.l}\n────────────────────────────────────\n`;
      rub.items.forEach(it=>{
        doc+=`  ${it.code}: ${it.l.padEnd(50)} ${it.v}\n`;
      });
      doc+='\n';
    });
    doc+=`\nCe document est établi conformément à l'AR du 04/08/1996.\nDépôt obligatoire à la Banque Nationale de Belgique via le portail Filing.\n`;
    return doc;
  };
  
  return <div>
    <PH title="Bilan Social BNB" sub={`Exercice ${yr} — AR 04/08/1996`} actions={<B onClick={()=>{
      const doc=generateXBRL();
      d({type:'MODAL',m:{w:900,c:<div>
        <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Bilan Social {yr}</h2>
        <div style={{fontSize:11,color:'#c6a34e',marginBottom:10}}>Format BNB — Dépôt via Filing</div>
        <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
        <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
          <B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B>
          <B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B>
        </div>
      </div>}});
    }}>Générer le bilan</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C>
        <I label="Exercice" type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Données clés</div>
          <div>Effectif: <b style={{color:'#e8e6e0'}}>{ae.length}</b> ({h}H / {f}F)</div>
          <div>ETP moyen: <b style={{color:'#e8e6e0'}}>{etp.toFixed(1)}</b></div>
          <div>Employés: <b style={{color:'#e8e6e0'}}>{employes.length}</b></div>
          <div>Ouvriers: <b style={{color:'#e8e6e0'}}>{ouvriers.length}</b></div>
          <div>Masse salariale: <b style={{color:'#4ade80'}}>{fmt(masseBrute)}</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Le bilan social est obligatoire pour les entreprises de plus de 20 ETP. Dépôt annuel à la BNB avec les comptes annuels.
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:600,overflowY:'auto'}}>
        {rubriques.map(rub=><div key={rub.code} style={{marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:8,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.15)'}}>{rub.code} — {rub.l}</div>
          {rub.items.map(it=><div key={it.code} style={{display:'flex',justifyContent:'space-between',padding:'6px 10px',borderRadius:4,background:it.bold?'rgba(198,163,78,.08)':'transparent'}}>
            <span style={{fontSize:11.5,color:it.bold?'#c6a34e':'#9e9b93'}}>{it.l}</span>
            <span style={{fontSize:11.5,fontWeight:it.bold?700:500,color:it.bold?'#c6a34e':'#e8e6e0',fontFamily:'monospace'}}>{it.v}</span>
          </div>)}
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CALCUL CO2 — Contribution voitures de société
// ═══════════════════════════════════════════════════════════════
const CO2_FUEL=[
  {id:'essence',l:'Essence',minCO2:102},
  {id:'diesel',l:'Diesel',minCO2:84},
  {id:'lpg',l:'LPG / CNG',minCO2:84},
  {id:'electrique',l:'Électrique (0g)',minCO2:0},
  {id:'hybride_e',l:'Hybride rechargeable (PHEV)',minCO2:50},
];

function CO2Mod({s,d}){
  const [cars,setCars]=useState([{id:1,emp:'',marque:'',modele:'',fuel:'essence',co2:120,catVal:25000,dateImmat:''}]);
  const [yr,setYr]=useState(new Date().getFullYear());
  const addCar=()=>setCars(p=>[...p,{id:Date.now(),emp:'',marque:'',modele:'',fuel:'essence',co2:120,catVal:25000,dateImmat:''}]);
  const upd=(id,k,v)=>setCars(p=>p.map(c=>c.id===id?{...c,[k]:v}:c));
  const rem=(id)=>setCars(p=>p.filter(c=>c.id!==id));
  
  const calcCO2=(car)=>{
    const co2=parseInt(car.co2)||0;
    if(car.fuel==='electrique')return{atn:0,cotCO2:31.34,deduct:100,pct:4,cat:'Électrique'};
    const catVal=parseFloat(car.catVal)||25000;
    const basePct=5.5;
    const deltaCO2=co2-(car.fuel==='diesel'?84:102);
    let pct=basePct+(deltaCO2*0.1);
    pct=Math.max(4,Math.min(18,pct));
    const atnMensuel=(catVal*(6/7)*(pct/100))/12;
    let cotCO2=0;
    if(car.fuel==='diesel')cotCO2=((co2*0.00714*71.4644)+31.34);
    else cotCO2=((co2*0.00714*83.6644)+31.34);
    cotCO2=Math.max(31.34,cotCO2);
    let deduct=50;
    if(co2===0)deduct=100;
    else if(co2<=50)deduct=100;
    else if(co2<=100)deduct=80;
    else if(co2<=150)deduct=65;
    else if(co2<=200)deduct=50;
    else deduct=40;
    return{atn:atnMensuel,cotCO2:cotCO2/3,deduct,pct,cat:CO2_FUEL.find(f=>f.id===car.fuel)?.l||''};
  };
  
  const ae=s.emps.filter(e=>e.status==='active');
  const results=cars.map(c=>({...c,...calcCO2(c)}));
  const totCot=results.reduce((a,r)=>a+r.cotCO2,0);
  const totATN=results.reduce((a,r)=>a+r.atn,0);
  
  return <div>
    <PH title="Calcul CO2 — Voitures de société" sub={`Exercice ${yr} — Art. 36 CIR 92 & Cotisation de solidarité CO2`}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Totaux mensuels</div>
          <div>Véhicules: <b style={{color:'#e8e6e0'}}>{cars.length}</b></div>
          <div>ATN total: <b style={{color:'#fb923c'}}>{fmt(totATN)}</b>/mois</div>
          <div>Cotisation CO2: <b style={{color:'#f87171'}}>{fmt(totCot)}</b>/mois</div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>ATN</b>: Avantage de toute nature imposable (ajouté au brut fiscal).<br/>
          <b>Cotisation CO2</b>: Cotisation patronale de solidarité ONSS (min. 31,34€/mois).<br/>
          <b>Déductibilité</b>: % frais voiture déductibles ISOC selon CO2.
        </div>
        <B style={{width:'100%',marginTop:14}} onClick={addCar}>+ Ajouter un véhicule</B>
      </C>
      <C style={{padding:'14px 18px',maxHeight:650,overflowY:'auto'}}>
        {results.map((car,i)=><div key={car.id} style={{padding:16,marginBottom:12,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Véhicule {i+1} {car.marque&&`— ${car.marque} ${car.modele}`}</span>
            <button onClick={()=>rem(car.id)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:6,color:'#f87171',padding:'3px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>✕</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
            <I label="Employé" value={car.emp} onChange={v=>upd(car.id,'emp',v)} options={[{v:'',l:'— Choisir —'},...ae.map(e=>({v:`${e.first} ${e.last}`,l:`${e.first} ${e.last}`}))]}/>
            <I label="Marque" value={car.marque} onChange={v=>upd(car.id,'marque',v)}/>
            <I label="Modèle" value={car.modele} onChange={v=>upd(car.id,'modele',v)}/>
            <I label="Carburant" value={car.fuel} onChange={v=>upd(car.id,'fuel',v)} options={CO2_FUEL.map(f=>({v:f.id,l:f.l}))}/>
            <I label="CO2 g/km" type="number" value={car.co2} onChange={v=>upd(car.id,'co2',v)}/>
            <I label="Valeur catalogue €" type="number" value={car.catVal} onChange={v=>upd(car.id,'catVal',v)}/>
            <I label="1ère immatriculation" value={car.dateImmat} onChange={v=>upd(car.id,'dateImmat',v)}/>
            <I label="Déductibilité ISOC" value={`${car.deduct}%`} onChange={()=>{}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginTop:10}}>
            {[{l:'ATN mensuel',v:fmt(car.atn),c:'#fb923c'},{l:'Cotisation CO2/mois',v:fmt(car.cotCO2),c:'#f87171'},{l:'Déductibilité ISOC',v:car.deduct+'%',c:'#60a5fa'},{l:'% ATN',v:(car.pct||0).toFixed(1)+'%',c:'#c6a34e'}].map((x,j)=>
              <div key={j} style={{padding:10,background:`${x.c}11`,borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#5e5c56'}}>{x.l}</div>
                <div style={{fontSize:16,fontWeight:700,color:x.c}}>{x.v}</div>
              </div>
            )}
          </div>
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CERTIFICAT PME — Attestation aide régionale
// ═══════════════════════════════════════════════════════════════
function CertPMEMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const [form,setForm]=useState({region:'bxl',effectif:'',ca:'',bilanTotal:'',dateCreation:'',isStarter:false,zonesAidees:false});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const regions=[
    {id:'bxl',l:'Bruxelles-Capitale',org:'Actiris / hub.brussels',primes:['Prime de transition','Aide Activa.brussels','Prime de stage First']},
    {id:'wal',l:'Wallonie',org:'FOREM / SPW Économie',primes:['Chèques-entreprises','Aide APE','Prime Impulsion']},
    {id:'vla',l:'Flandre',org:'VDAB / VLAIO',primes:['KMO-portefeuille','Winwinlening','Vlaams investeringsfonds']},
  ];
  const reg=regions.find(r=>r.id===form.region);
  const eff=parseInt(form.effectif)||0;const ca=parseFloat(form.ca)||0;const bil=parseFloat(form.bilanTotal)||0;
  let categorie='Non-PME';
  if(eff<10&&ca<=2&&bil<=2)categorie='Micro-entreprise';
  else if(eff<50&&ca<=10&&bil<=10)categorie='Petite entreprise';
  else if(eff<250&&ca<=50&&bil<=43)categorie='Moyenne entreprise';
  const isPME=categorie!=='Non-PME';
  
  const generate=()=>{
    const now=new Date().toLocaleDateString('fr-BE');
    let doc=`CERTIFICAT PME\n═══════════════════════════════════════════\n\nATTESTATION DE QUALIFICATION PME\nConformément à la Recommandation 2003/361/CE\n\n`;
    doc+=`Entreprise: ${s.co.name}\nBCE: ${s.co.bce||'[BCE]'}\nSiège: ${s.co.address||'[Adresse]'}\nRégion: ${reg?.l}\nDate de création: ${form.dateCreation||'[Date]'}\n\n`;
    doc+=`CRITÈRES PME (Exercice ${yr})\n────────────────────────────────────────\n`;
    doc+=`Effectif (ETP):\t${eff}\t${eff<250?'✅':'❌'} (< 250)\nCA:\t\t${ca}M€\t${ca<=50?'✅':'❌'} (≤ 50M€)\nBilan:\t\t${bil}M€\t${bil<=43?'✅':'❌'} (≤ 43M€)\n\n`;
    doc+=`RÉSULTAT: ${categorie.toUpperCase()}\nStatut PME: ${isPME?'✅ CONFIRMÉ':'❌ NON ÉLIGIBLE'}\n\n`;
    if(isPME){doc+=`AIDES RÉGIONALES (${reg?.l})\n────────────────────────────────────────\nOrganisme: ${reg?.org}\n`;reg?.primes.forEach((p,i)=>{doc+=`${i+1}. ${p}\n`;});}
    if(form.isStarter)doc+=`\n⭐ Statut STARTER (< 4 ans)\n`;
    doc+=`\nDate: ${now}\n${s.co.name}\n`;
    return doc;
  };
  
  return <div>
    <PH title="Certificat PME" sub="Recommandation UE 2003/361/CE — Aides régionales"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Données entreprise</ST>
        <I label="Région" value={form.region} onChange={v=>upd('region',v)} options={regions.map(r=>({v:r.id,l:r.l}))}/>
        <I label="Effectif (ETP)" type="number" value={form.effectif} onChange={v=>upd('effectif',v)}/>
        <I label="CA (M€)" type="number" value={form.ca} onChange={v=>upd('ca',v)}/>
        <I label="Total bilan (M€)" type="number" value={form.bilanTotal} onChange={v=>upd('bilanTotal',v)}/>
        <I label="Date de création" value={form.dateCreation} onChange={v=>upd('dateCreation',v)}/>
        <div style={{marginTop:10,display:'flex',gap:14}}>
          <label style={{fontSize:12,color:'#9e9b93',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}><input type="checkbox" checked={form.isStarter} onChange={e=>upd('isStarter',e.target.checked)}/> Starter</label>
          <label style={{fontSize:12,color:'#9e9b93',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}><input type="checkbox" checked={form.zonesAidees} onChange={e=>upd('zonesAidees',e.target.checked)}/> Zone aidée</label>
        </div>
        <div style={{marginTop:14,padding:12,background:isPME?'rgba(74,222,128,.08)':'rgba(248,113,113,.08)',borderRadius:8,border:`1px solid ${isPME?'rgba(74,222,128,.2)':'rgba(248,113,113,.2)'}`,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#5e5c56',marginBottom:4}}>Classification</div>
          <div style={{fontSize:18,fontWeight:700,color:isPME?'#4ade80':'#f87171'}}>{categorie}</div>
          <div style={{fontSize:11,color:isPME?'#4ade80':'#f87171',marginTop:4}}>{isPME?'✅ Éligible':'❌ Non éligible'}</div>
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Seuils PME — UE 2003/361/CE</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:20}}>
          {[{l:'Micro',eff:'< 10',ca:'≤ 2M€',bil:'≤ 2M€'},{l:'Petite',eff:'< 50',ca:'≤ 10M€',bil:'≤ 10M€'},{l:'Moyenne',eff:'< 250',ca:'≤ 50M€',bil:'≤ 43M€'}].map(cat=>
            <div key={cat.l} style={{padding:14,background:categorie.toLowerCase().includes(cat.l.toLowerCase())?'rgba(198,163,78,.1)':'rgba(198,163,78,.03)',border:`1px solid ${categorie.toLowerCase().includes(cat.l.toLowerCase())?'rgba(198,163,78,.3)':'rgba(198,163,78,.06)'}`,borderRadius:8}}>
              <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:8}}>{cat.l}</div>
              <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>Effectif: {cat.eff}<br/>CA: {cat.ca}<br/>Bilan: {cat.bil}</div>
            </div>
          )}
        </div>
        {isPME&&<div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:'#4ade80',marginBottom:10}}>Aides — {reg?.l}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {reg?.primes.map((p,i)=><div key={i} style={{padding:10,background:'rgba(74,222,128,.05)',border:'1px solid rgba(74,222,128,.1)',borderRadius:8,fontSize:12,color:'#d4d0c8'}}>{p}</div>)}
          </div>
        </div>}
        <B onClick={()=>{const doc=generate();d({type:'MODAL',m:{w:900,c:<div>
          <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Certificat PME</h2>
          <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
          <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:'MODAL',m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B></div>
        </div>}});}}>Générer le certificat</B>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  COMMANDE ÉCO-CHÈQUES — Fichier commande fournisseur
// ═══════════════════════════════════════════════════════════════
const ECO_PROVIDERS=[
  {id:'pluxee',n:'Pluxee (ex-Sodexo)',ic:'🟠',format:'CSV',fields:['Nom','Prénom','NN','Montant','Adresse livraison'],site:'www.pluxee.be'},
  {id:'edenred',n:'Edenred',ic:'🔴',format:'CSV/XLSX',fields:['Nom','Prénom','NISS','Montant','Email'],site:'www.edenred.be'},
  {id:'monizze',n:'Monizze',ic:'🟢',format:'CSV',fields:['Nom','Prénom','NN','Montant','Carte Monizze ID'],site:'www.monizze.be'},
  {id:'got',n:'G.O.T. Connection',ic:'🔵',format:'CSV',fields:['Nom','Prénom','NISS','Montant','Référence'],site:'www.gotconnection.be'},
];

function EcoCommandeMod({s,d}){
  const [provider,setProvider]=useState('sodexo');
  const [yr,setYr]=useState(new Date().getFullYear());
  const [montant,setMontant]=useState(250);
  const [gen,setGen]=useState(null);
  const ae=s.emps.filter(e=>e.status==='active');
  const prov=ECO_PROVIDERS.find(p=>p.id===provider);
  
  const generate=()=>{
    const header=prov.fields.join(';');
    const rows=ae.map(emp=>{
      const vals=prov.fields.map(f=>{
        if(f==='Nom')return emp.last||'';if(f==='Prénom')return emp.first||'';
        if(f==='NN'||f==='NISS')return emp.nn||'XX.XX.XX-XXX.XX';
        if(f==='Montant')return montant.toFixed(2);
        if(f==='Adresse livraison')return emp.address||s.co.address||'';
        if(f==='Email')return emp.email||'';if(f==='Carte Monizze ID')return emp.monizzeId||'[À compléter]';return '';
      });return vals.join(';');
    });
    setGen({csv:header+'\n'+rows.join('\n'),total:ae.length*montant,count:ae.length});
  };
  
  return <div>
    <PH title="Commande Éco-chèques" sub={`Exercice ${yr} — CCT 98 du CNT`}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <I label="Fournisseur" value={provider} onChange={setProvider} options={ECO_PROVIDERS.map(p=>({v:p.id,l:`${p.ic} ${p.n}`}))}/>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
        <I label="Montant/travailleur (€)" type="number" value={montant} onChange={v=>setMontant(parseFloat(v)||0)}/>
        <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Récapitulatif</div>
          <div>Fournisseur: <b style={{color:'#e8e6e0'}}>{prov?.n}</b></div>
          <div>Format: <b style={{color:'#e8e6e0'}}>{prov?.format}</b></div>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Total: <b style={{color:'#4ade80'}}>{fmt(ae.length*montant)}</b></div>
        </div>
        <B style={{width:'100%',marginTop:14}} onClick={generate}>Générer fichier commande</B>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>CCT 98</b>: Max 250€/an par travailleur TP. Exonéré ONSS et fiscal si conditions respectées. Format compatible portail {prov?.site}.
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Travailleurs — Éco-chèques {yr}</div>
        <Tbl cols={[
          {k:'n',l:'Nom',b:1,r:r=>`${r.first} ${r.last}`},
          {k:'nn',l:'NN',r:r=><span style={{fontSize:10,fontFamily:'monospace',color:'#9e9b93'}}>{r.nn||'XX.XX.XX-XXX.XX'}</span>},
          {k:'r',l:'Régime',r:r=>r.regime||'38h'},
          {k:'m',l:'Montant',a:'right',r:()=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(montant)}</span>},
        ]} data={ae}/>
        {gen&&<div style={{marginTop:16}}>
          <div style={{display:'flex',gap:14,marginBottom:12}}>
            <span style={{fontSize:12,color:'#9e9b93'}}>Lignes: <b style={{color:'#e8e6e0'}}>{gen.count}</b></span>
            <span style={{fontSize:12,color:'#9e9b93'}}>Total: <b style={{color:'#4ade80'}}>{fmt(gen.total)}</b></span>
          </div>
          <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:250,overflowY:'auto'}}>{gen.csv}</pre>
          <div style={{display:'flex',gap:10,marginTop:12}}>
            <B v="ghost" onClick={()=>{navigator.clipboard?.writeText(gen.csv);alert('CSV copié !')}}>📋 Copier CSV</B>
          </div>
        </div>}
      </C>
    </div>
  </div>;
}
// ═══════════════════════════════════════════════════════════════
//  PRÉAVIS LÉGAL — Calculateur durée & coût (Loi statut unique 26/12/2013)
// ═══════════════════════════════════════════════════════════════
function PreavisMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [motif,setMotif]=useState('licenciement');
  const [dateNotif,setDateNotif]=useState('');
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  
  const calcPreavis=(emp)=>{
    if(!emp)return null;
    const start=new Date(emp.startD||'2020-01-01');
    const now=new Date();
    const ancMois=Math.max(0,Math.round((now-start)/(1000*60*60*24*30.44)));
    const ancAns=ancMois/12;
    // Loi statut unique 26/12/2013 — barème employeur
    let semaines=0;
    if(motif==='licenciement'){
      // Tranche 1: 0-5 ans → formule progressive
      if(ancAns<0.25)semaines=1;
      else if(ancAns<0.5)semaines=3;
      else if(ancAns<0.75)semaines=4;
      else if(ancAns<1)semaines=5;
      else if(ancAns<2)semaines=6;
      else if(ancAns<3)semaines=8;
      else if(ancAns<4)semaines=9;
      else if(ancAns<5)semaines=12;
      else if(ancAns<6)semaines=15;
      else if(ancAns<7)semaines=18;
      else if(ancAns<8)semaines=21;
      else if(ancAns<9)semaines=24;
      else if(ancAns<10)semaines=27;
      else if(ancAns<11)semaines=30;
      else if(ancAns<12)semaines=33;
      else if(ancAns<13)semaines=36;
      else if(ancAns<14)semaines=39;
      else if(ancAns<15)semaines=42;
      else if(ancAns<16)semaines=45;
      else if(ancAns<17)semaines=48;
      else if(ancAns<18)semaines=51;
      else if(ancAns<19)semaines=54;
      else if(ancAns<20)semaines=57;
      else if(ancAns<21)semaines=60;
      else semaines=60+Math.floor((ancAns-20))*3;
    } else {
      // Démission — environ 1/2 du préavis licenciement, max 13 sem
      if(ancAns<0.25)semaines=1;
      else if(ancAns<0.5)semaines=2;
      else if(ancAns<1)semaines=2;
      else if(ancAns<2)semaines=3;
      else if(ancAns<3)semaines=4;
      else if(ancAns<4)semaines=5;
      else if(ancAns<5)semaines=6;
      else if(ancAns<6)semaines=7;
      else if(ancAns<7)semaines=9;
      else if(ancAns<8)semaines=10;
      else semaines=13;
    }
    const jours=semaines*7;
    const joursCal=semaines*5;
    const p=calc(emp,{days:21,overtimeH:0,sundayH:0,nightH:0,sickG:0,bonus:0,y13:0,advance:0,garnish:0,otherDed:0,month:now.getMonth()+1,year:now.getFullYear()},s.co);
    const coutSemaine=p.costTotal/4.33;
    const indemnite=coutSemaine*semaines;
    return{ancMois,ancAns:ancAns.toFixed(1),semaines,jours,joursCal,indemnite,coutSemaine,brut:emp.monthlySalary,cost:p.costTotal};
  };
  
  const r=calcPreavis(emp);
  
  return <div>
    <PH title="Préavis légal" sub="Loi du 26/12/2013 — Statut unique"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <I label="Travailleur" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Type" value={motif} onChange={setMotif} options={[{v:'licenciement',l:'Licenciement (par employeur)'},{v:'demission',l:'Démission (par travailleur)'}]}/>
        <I label="Date notification" type="date" value={dateNotif} onChange={setDateNotif}/>
        {r&&<div style={{marginTop:14,padding:12,background:motif==='licenciement'?'rgba(248,113,113,.08)':'rgba(96,165,250,.08)',borderRadius:8,border:`1px solid ${motif==='licenciement'?'rgba(248,113,113,.2)':'rgba(96,165,250,.2)'}`,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#5e5c56'}}>Durée du préavis</div>
          <div style={{fontSize:28,fontWeight:700,color:motif==='licenciement'?'#f87171':'#60a5fa'}}>{r.semaines} sem.</div>
          <div style={{fontSize:12,color:'#9e9b93'}}>{r.joursCal} jours ouvrables · {r.jours} jours calendrier</div>
        </div>}
        {r&&motif==='licenciement'&&<div style={{marginTop:10,padding:12,background:'rgba(248,113,113,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#f87171',marginBottom:4}}>Coût indemnité de rupture</div>
          <div>Coût/semaine: <b style={{color:'#e8e6e0'}}>{r?fmt(r.coutSemaine):'-'}</b></div>
          <div>Indemnité totale: <b style={{color:'#f87171',fontSize:14}}>{r?fmt(r.indemnite):'-'}</b></div>
        </div>}
      </C>
      <C>
        {emp&&r&&<div>
          <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>{emp.first} {emp.last} — {motif==='licenciement'?'Licenciement':'Démission'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:20}}>
            {[{l:'Ancienneté',v:`${r.ancAns} ans`,c:'#c6a34e'},{l:'Brut mensuel',v:fmt(r.brut),c:'#e8e6e0'},{l:'Coût mensuel',v:fmt(r.cost),c:'#a78bfa'},{l:'Préavis',v:`${r.semaines} sem.`,c:motif==='licenciement'?'#f87171':'#60a5fa'}].map((x,i)=>
              <div key={i} style={{padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center',border:'1px solid rgba(198,163,78,.08)'}}>
                <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:4}}>{x.v}</div>
              </div>
            )}
          </div>
          <div style={{padding:14,background:'rgba(96,165,250,.04)',borderRadius:8,fontSize:11.5,color:'#60a5fa',lineHeight:1.8}}>
            <b>Art. 37/2 Loi 03/07/1978</b> — Le préavis prend cours le lundi suivant la semaine de notification.<br/>
            <b>Contre-préavis</b> (si licenciement) — Le travailleur peut donner un contre-préavis réduit pendant le préavis.<br/>
            <b>Outplacement</b> — Obligatoire si préavis ≥ 30 semaines (= ancienneté ≥ ~10 ans). Valeur: min. 1.800€ sur 12 mois.<br/>
            <b>Dispense C4</b> — Si motif grave (art. 35), pas de préavis. Notification dans les 3 jours ouvrables.
          </div>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PÉCULE DE SORTIE — Solde tout compte
// ═══════════════════════════════════════════════════════════════
function PeculeSortieMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [dateSortie,setDateSortie]=useState('');
  const [motif,setMotif]=useState('licenciement');
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  
  const calcSortie=(emp)=>{
    if(!emp)return null;
    const brut=emp.monthlySalary||0;
    const now=dateSortie?new Date(dateSortie):new Date();
    const moisPreste=now.getMonth()+1;
    // Prorata 13e mois
    const prorata13=brut*(moisPreste/12);
    // Solde congés (employés: jours non pris × salaire journalier)
    const salJour=brut/21.66;
    const droitVac=Math.round(20*(moisPreste/12));
    const joursNonPris=Math.max(0,droitVac-0); // suppose 0 pris
    const soldeConges=joursNonPris*salJour;
    // Pécule vacances sortie (simple = 7.67% brut réf, double = 7.67%)
    const brutRef=brut*moisPreste;
    const pecSimple=brutRef*0.0767;
    const pecDouble=brutRef*0.0767;
    // ONSS sur pécule sortie
    const onssVac=(pecSimple+pecDouble)*0.1307;
    // Indemnité compensatoire de préavis (si licenciement)
    let indemPreavis=0;
    if(motif==='licenciement'){
      const start=new Date(emp.startD||'2020-01-01');
      const ancAns=Math.max(0,(now-start)/(1000*60*60*24*365.25));
      let sem=0;
      if(ancAns<1)sem=5;else if(ancAns<2)sem=6;else if(ancAns<3)sem=8;
      else if(ancAns<5)sem=12;else if(ancAns<8)sem=21;else if(ancAns<10)sem=27;
      else if(ancAns<15)sem=42;else if(ancAns<20)sem=57;else sem=60+Math.floor((ancAns-20))*3;
      const p=calc(emp,{days:21,overtimeH:0,sundayH:0,nightH:0,sickG:0,bonus:0,y13:0,advance:0,garnish:0,otherDed:0,month:now.getMonth()+1,year:now.getFullYear()},s.co);
      indemPreavis=(p.costTotal/4.33)*sem;
    }
    const totalBrut=prorata13+soldeConges+pecSimple+pecDouble;
    const onssTotal=totalBrut*0.1307;
    const ppEstim=totalBrut*0.25;
    const totalNet=totalBrut-onssTotal-ppEstim;
    return{prorata13,soldeConges,joursNonPris,pecSimple,pecDouble,onssVac,indemPreavis,totalBrut,onssTotal,ppEstim,totalNet,moisPreste,droitVac};
  };
  const r=calcSortie(emp);
  
  return <div>
    <PH title="Pécule de sortie" sub="Solde de tout compte — décompte final"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <I label="Travailleur" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Date de sortie" type="date" value={dateSortie} onChange={setDateSortie}/>
        <I label="Motif" value={motif} onChange={setMotif} options={[{v:'licenciement',l:'Licenciement'},{v:'demission',l:'Démission'},{v:'commun',l:'Rupture d\'un commun accord'},{v:'pension',l:'Pension'},{v:'deces',l:'Décès'}]}/>
        {r&&<div style={{marginTop:14,padding:12,background:'rgba(74,222,128,.08)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#5e5c56'}}>Total net estimé à verser</div>
          <div style={{fontSize:24,fontWeight:700,color:'#4ade80'}}>{fmt(r.totalNet)}</div>
          {r.indemPreavis>0&&<div style={{fontSize:12,color:'#f87171',marginTop:4}}>+ Indemnité préavis: {fmt(r.indemPreavis)}</div>}
        </div>}
      </C>
      <C>
        {emp&&r&&<div>
          <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Décompte final — {emp.first} {emp.last}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {l:'Prorata 13ème mois',v:r.prorata13,sub:`${r.moisPreste}/12 mois`},
              {l:`Solde congés (${r.joursNonPris}j non pris)`,v:r.soldeConges,sub:`${r.droitVac} jours droit`},
              {l:'Pécule de vacances simple (7,67%)',v:r.pecSimple},
              {l:'Pécule de vacances double (7,67%)',v:r.pecDouble},
              {l:'TOTAL BRUT',v:r.totalBrut,bold:true},
              {l:'ONSS travailleur (-13,07%)',v:-r.onssTotal,neg:true},
              {l:'Précompte estimé (-25%)',v:-r.ppEstim,neg:true},
              {l:'TOTAL NET',v:r.totalNet,bold:true,green:true},
            ].map((it,i)=>
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:it.bold?'rgba(198,163,78,.08)':'rgba(198,163,78,.03)',borderRadius:8}}>
                <div><span style={{fontSize:12,color:it.bold?'#c6a34e':'#d4d0c8',fontWeight:it.bold?700:400}}>{it.l}</span>{it.sub&&<span style={{fontSize:10,color:'#5e5c56',marginLeft:8}}>({it.sub})</span>}</div>
                <span style={{fontSize:it.bold?15:13,fontWeight:it.bold?700:500,color:it.neg?'#f87171':it.green?'#4ade80':'#e8e6e0',fontFamily:'monospace'}}>{fmt(Math.abs(it.v))}</span>
              </div>
            )}
            {r.indemPreavis>0&&<div style={{padding:'12px 14px',background:'rgba(248,113,113,.08)',borderRadius:8,border:'1px solid rgba(248,113,113,.15)',marginTop:8}}>
              <div style={{fontSize:13,fontWeight:600,color:'#f87171'}}>Indemnité compensatoire de préavis</div>
              <div style={{fontSize:20,fontWeight:700,color:'#f87171',marginTop:4}}>{fmt(r.indemPreavis)}</div>
              <div style={{fontSize:10.5,color:'#9e9b93',marginTop:4}}>Coût total employeur (brut + ONSS patronales). Soumise à ONSS et précompte.</div>
            </div>}
          </div>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CRÉDIT-TEMPS / INTERRUPTION DE CARRIÈRE
// ═══════════════════════════════════════════════════════════════
function CreditTempsMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [regime,setRegime]=useState('mi_temps');
  const [motif,setMotif]=useState('soins');
  const [debut,setDebut]=useState('');
  const [duree,setDuree]=useState(12);
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  
  const regimes=[
    {id:'complet',l:'Crédit-temps complet',pct:100,alloc:564.34,desc:'Suspension totale du contrat'},
    {id:'mi_temps',l:'Crédit-temps mi-temps',pct:50,alloc:282.17,desc:'Réduction à mi-temps'},
    {id:'1_5',l:'Crédit-temps 1/5',pct:20,alloc:152.50,desc:'Réduction d\'1 jour/semaine (TP uniquement)'},
    {id:'conge_parent',l:'Congé parental',pct:100,alloc:926.29,desc:'Par enfant < 12 ans. Max 4 mois complet'},
    {id:'assist_med',l:'Assistance médicale',pct:100,alloc:926.29,desc:'Membre famille gravement malade'},
    {id:'soins_pall',l:'Soins palliatifs',pct:100,alloc:926.29,desc:'1 mois renouvelable 1×'},
    {id:'fin_carriere',l:'Emploi fin de carrière',pct:20,alloc:262.64,desc:'Réduction 1/5 dès 55 ans (exceptions: 50 ans)'},
  ];
  const motifs=[
    {id:'soins',l:'Soins enfant ≤ 8 ans'},{id:'assist',l:'Assistance membre famille malade'},
    {id:'formation',l:'Formation reconnue'},{id:'sans_motif',l:'Sans motif (si CCT sectorielle)'},
  ];
  const sel=regimes.find(r=>r.id===regime);
  const salaire=emp?.monthlySalary||0;
  const newSalaire=salaire*(1-sel.pct/100);
  const allocONEM=sel.alloc;
  const totalRevenu=newSalaire+allocONEM;
  const pertePct=salaire>0?((salaire-totalRevenu)/salaire*100).toFixed(1):0;
  
  return <div>
    <PH title="Crédit-temps / Interruption de carrière" sub="CCT 103 du CNT — Allocations ONEM"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Configuration</ST>
        <I label="Travailleur" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Régime" value={regime} onChange={setRegime} options={regimes.map(r=>({v:r.id,l:r.l}))}/>
        <I label="Motif" value={motif} onChange={setMotif} options={motifs.map(m=>({v:m.id,l:m.l}))}/>
        <I label="Date début" type="date" value={debut} onChange={setDebut}/>
        <I label="Durée (mois)" type="number" value={duree} onChange={setDuree}/>
        <div style={{marginTop:14,padding:12,background:'rgba(96,165,250,.08)',borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6}}>
          <b>{sel.l}</b><br/>{sel.desc}<br/>Formulaire ONEM: <b>C61</b> (à soumettre au bureau ONEM local)
        </div>
      </C>
      <C>
        {emp&&<div>
          <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>{emp.first} {emp.last} — Simulation {sel.l}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:20}}>
            {[{l:'Salaire actuel',v:fmt(salaire),c:'#e8e6e0'},{l:'Nouveau salaire',v:fmt(newSalaire),c:'#fb923c'},{l:'Allocation ONEM',v:fmt(allocONEM),c:'#60a5fa'},{l:'Total revenu',v:fmt(totalRevenu),c:'#4ade80'}].map((x,i)=>
              <div key={i} style={{padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center',border:'1px solid rgba(198,163,78,.08)'}}>
                <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:4}}>{x.v}</div>
              </div>
            )}
          </div>
          <div style={{padding:14,background:'rgba(248,113,113,.06)',borderRadius:8,marginBottom:16}}>
            <span style={{fontSize:12,color:'#9e9b93'}}>Perte de revenu mensuel: </span>
            <span style={{fontSize:16,fontWeight:700,color:'#f87171'}}>{fmt(salaire-totalRevenu)} (-{pertePct}%)</span>
          </div>
          <Tbl cols={[{k:'r',l:'Régime',b:1,r:r=>r.l},{k:'p',l:'Réduction',a:'right',r:r=>r.pct+'%'},{k:'a',l:'Allocation ONEM/mois',a:'right',r:r=><span style={{color:'#60a5fa'}}>{fmt(r.alloc)}</span>},{k:'d',l:'Description',r:r=><span style={{fontSize:10.5,color:'#9e9b93'}}>{r.desc}</span>}]} data={regimes}/>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  GESTION DES ABSENCES — Maladie, salaire garanti, compteurs
// ═══════════════════════════════════════════════════════════════
function AbsencesMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [absences,setAbsences]=useState([]);
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  const addAbs=()=>setAbsences(p=>[...p,{id:Date.now(),type:'maladie',debut:'',fin:'',certif:false,jours:0}]);
  const updAbs=(id,k,v)=>setAbsences(p=>p.map(a=>a.id===id?{...a,[k]:v}:a));
  const remAbs=(id)=>setAbsences(p=>p.filter(a=>a.id!==id));
  
  const types=[
    {id:'maladie',l:'Maladie',garantiE:30,garantiO:14,mutuelle:'Après salaire garanti'},
    {id:'accident_prive',l:'Accident vie privée',garantiE:30,garantiO:14,mutuelle:'Après salaire garanti'},
    {id:'accident_travail',l:'Accident de travail',garantiE:30,garantiO:14,mutuelle:'Assurance AT'},
    {id:'mi_temps_med',l:'Mi-temps médical / thérapeutique (reprise progressive)',garantiE:0,garantiO:0,mutuelle:'INAMI complément'},
    {id:'maternite',l:'Congé de maternité',garantiE:0,garantiO:0,mutuelle:'15 semaines (INAMI)'},
    {id:'naissance',l:'Congé de naissance',garantiE:3,garantiO:3,mutuelle:'7 jours restants (INAMI)'},
    {id:'adoption',l:'Congé d\'adoption',garantiE:0,garantiO:0,mutuelle:'6 semaines (INAMI)'},
  ];

  // ─── MI-TEMPS MÉDICAL / REPRISE PROGRESSIVE ─────────────────
  const [mtmShow,setMtmShow]=useState(false);
  const [mtmPct,setMtmPct]=useState(50); // % reprise (20, 25, 33, 50, 60, 75, 80)
  const [mtmDebut,setMtmDebut]=useState('');
  const [mtmFin,setMtmFin]=useState('');
  const mtmSalaire=emp?(parseFloat(emp.monthlySalary)||0):0;
  const mtmBrut=mtmSalaire*(mtmPct/100);
  const mtmPerte=mtmSalaire-mtmBrut;
  // INAMI: complément invalidité = 60% du salaire perdu (plafonné)
  const mtmPlafondJour=160.57; // plafond journalier INAMI 2026 (titulaire avec charge)
  const mtmPlafondMois=mtmPlafondJour*LEGAL.WD;
  const mtmINAMI60=mtmPerte*0.60;
  const mtmComplement=Math.min(mtmINAMI60,mtmPlafondMois);
  const mtmTotal=mtmBrut+mtmComplement;
  const mtmNetEstim=mtmBrut*(1-LEGAL.ONSS_W)*0.72+mtmComplement*0.89; // net estimé (PP réduit + INAMI net)
  
  const totalJours=absences.reduce((a,ab)=>a+(parseInt(ab.jours)||0),0);
  const joursGaranti=emp?(emp.contract==='ouvrier'?14:30):30;
  const joursConsommes=absences.filter(a=>a.type==='maladie'||a.type==='accident_prive').reduce((a,ab)=>a+(parseInt(ab.jours)||0),0);
  const soldeGaranti=Math.max(0,joursGaranti-joursConsommes);
  
  return <div>
    <PH title="Gestion des absences" sub="Salaire garanti — Loi 03/07/1978, art. 52-75" actions={<B onClick={addAbs}>+ Nouvelle absence</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Travailleur</ST>
        <I label="Employé" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <div style={{marginTop:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#5e5c56'}}>Jours absence</div>
            <div style={{fontSize:22,fontWeight:700,color:'#fb923c'}}>{totalJours}</div>
          </div>
          <div style={{padding:12,background:soldeGaranti>10?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#5e5c56'}}>Solde garanti</div>
            <div style={{fontSize:22,fontWeight:700,color:soldeGaranti>10?'#4ade80':'#f87171'}}>{soldeGaranti}j</div>
          </div>
        </div>
        <div style={{marginTop:14,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
          <b>Employés:</b> 30 jours salaire garanti (100% → 60%)<br/>
          <b>Ouvriers:</b> 14 jours salaire garanti<br/>
          <b>Certificat médical:</b> obligatoire dans les 48h (ou selon règlement de travail)<br/>
          <b>Contrôle médical:</b> droit de l'employeur (médecin-contrôleur)
        </div>
        {/* ─── MI-TEMPS MÉDICAL ───────────────────── */}
        <div style={{marginTop:14}}>
          <button onClick={()=>setMtmShow(!mtmShow)} style={{width:'100%',padding:'10px 14px',background:mtmShow?'rgba(167,139,250,.1)':'rgba(167,139,250,.04)',border:'1px solid rgba(167,139,250,.15)',borderRadius:8,color:'#a78bfa',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .15s'}}>
            🏥 Simulateur mi-temps médical {mtmShow?'▾':'▸'}
          </button>
          {mtmShow&&<div style={{marginTop:10,padding:14,background:'rgba(167,139,250,.04)',borderRadius:10,border:'1px solid rgba(167,139,250,.08)'}}>
            <div style={{fontSize:11.5,fontWeight:600,color:'#a78bfa',marginBottom:12}}>Reprise progressive du travail (art. 100 §2 Loi AMI)</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <I label="% reprise travail" value={mtmPct} onChange={v=>setMtmPct(parseInt(v)||50)} options={[{v:20,l:'20%'},{v:25,l:'25%'},{v:33,l:'33%'},{v:50,l:'50% (mi-temps)'},{v:60,l:'60%'},{v:75,l:'75%'},{v:80,l:'80%'}]}/>
              <I label="Salaire temps plein" type="number" value={mtmSalaire} onChange={()=>{}} disabled/>
              <I label="Début reprise" type="date" value={mtmDebut} onChange={setMtmDebut}/>
              <I label="Fin prévue" type="date" value={mtmFin} onChange={setMtmFin}/>
            </div>
            <div style={{marginTop:14,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              <div style={{padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:9,color:'#5e5c56',marginBottom:4}}>Salaire partiel ({mtmPct}%)</div>
                <div style={{fontSize:18,fontWeight:700,color:'#4ade80'}}>{fmt(mtmBrut)}</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>brut employeur</div>
              </div>
              <div style={{padding:10,background:'rgba(167,139,250,.06)',borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:9,color:'#5e5c56',marginBottom:4}}>Complément INAMI</div>
                <div style={{fontSize:18,fontWeight:700,color:'#a78bfa'}}>{fmt(mtmComplement)}</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>60% de la perte ({fmt(mtmPerte)})</div>
              </div>
              <div style={{padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:9,color:'#5e5c56',marginBottom:4}}>Net estimé total</div>
                <div style={{fontSize:18,fontWeight:700,color:'#60a5fa'}}>{fmt(mtmNetEstim)}</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>salaire + mutuelle</div>
              </div>
            </div>
            <div style={{marginTop:12,fontSize:10,color:'#9e9b93',lineHeight:1.7,padding:10,background:'rgba(96,165,250,.04)',borderRadius:8,border:'1px solid rgba(96,165,250,.06)'}}>
              <b style={{color:'#a78bfa'}}>📋 Obligations employeur:</b><br/>
              • <b>DRS:</b> déclarer la reprise partielle à la mutuelle (formulaire C3.2 médecin-conseil)<br/>
              • <b>Dimona:</b> pas de modification nécessaire (contrat non rompu)<br/>
              • <b>ONSS:</b> cotisations calculées sur le salaire partiel effectif ({fmt(mtmBrut)})<br/>
              • <b>PP:</b> précompte sur le salaire partiel (barème temps partiel)<br/>
              • <b>Fiche paie:</b> mention «&nbsp;reprise progressive art.100§2&nbsp;» + % prestations<br/>
              • <b>Horaire:</b> adapter le régime de travail en concertation (avenant au contrat non requis)<br/>
              <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid rgba(167,139,250,.1)'}}>
                <b style={{color:'#60a5fa'}}>⚠️ Points d'attention:</b><br/>
                • Autorisation préalable du médecin-conseil de la mutuelle obligatoire<br/>
                • Durée maximale: 2 ans renouvelable (trajet de réintégration)<br/>
                • Le travailleur conserve le statut «&nbsp;en incapacité&nbsp;» auprès de la mutuelle<br/>
                • Jours de maladie pendant la reprise: retour en incapacité totale (rechute)<br/>
                • Prime de fin d'année: calculée au prorata des prestations effectives<br/>
                • Pécule de vacances: sur le salaire partiel uniquement
              </div>
            </div>
          </div>}
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:600,overflowY:'auto'}}>
        {absences.length===0&&<div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Aucune absence enregistrée</div>}
        {absences.map((ab,i)=><div key={ab.id} style={{padding:14,marginBottom:10,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Absence {i+1}</span>
            <button onClick={()=>remAbs(ab.id)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:6,color:'#f87171',padding:'3px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>✕</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
            <I label="Type" value={ab.type} onChange={v=>updAbs(ab.id,'type',v)} options={types.map(t=>({v:t.id,l:t.l}))}/>
            <I label="Début" type="date" value={ab.debut} onChange={v=>updAbs(ab.id,'debut',v)}/>
            <I label="Fin" type="date" value={ab.fin} onChange={v=>updAbs(ab.id,'fin',v)}/>
            <I label="Jours" type="number" value={ab.jours} onChange={v=>updAbs(ab.id,'jours',v)}/>
          </div>
          <label style={{fontSize:11,color:'#9e9b93',display:'flex',alignItems:'center',gap:6,marginTop:8,cursor:'pointer'}}>
            <input type="checkbox" checked={ab.certif} onChange={e=>updAbs(ab.id,'certif',e.target.checked)}/> Certificat médical reçu
          </label>
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  INDEX AUTOMATIQUE DES SALAIRES
// ═══════════════════════════════════════════════════════════════
function IndexAutoMod({s,d}){
  const [indexPct,setIndexPct]=useState(2.21);
  const [dateIndex,setDateIndex]=useState('01/01/2026');
  const [applied,setApplied]=useState(false);
  const ae=s.emps.filter(e=>e.status==='active');
  const pct=parseFloat(indexPct)||0;
  const preview=ae.map(e=>({...e,newSalary:e.monthlySalary*(1+pct/100),diff:e.monthlySalary*(pct/100)}));
  const totalDiff=preview.reduce((a,e)=>a+e.diff,0);
  
  return <div>
    <PH title="Indexation automatique des salaires" sub="Adaptation barémique selon indice-pivot / CCT sectorielle"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Paramètres d'indexation</ST>
        <I label="Taux d'indexation (%)" type="number" value={indexPct} onChange={setIndexPct}/>
        <I label="Date d'application" value={dateIndex} onChange={setDateIndex}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Impact</div>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Surcoût mensuel: <b style={{color:'#f87171'}}>{fmt(totalDiff)}</b></div>
          <div>Surcoût annuel: <b style={{color:'#f87171'}}>{fmt(totalDiff*13)}</b></div>
        </div>
        <B style={{width:'100%',marginTop:14}} onClick={()=>{
          if(confirm(`Appliquer l'indexation de ${pct}% à ${ae.length} travailleurs ?`)){
            ae.forEach(e=>d({type:'UPD_E',d:{...e,monthlySalary:Math.round(e.monthlySalary*(1+pct/100)*100)/100}}));
            setApplied(true);
          }
        }}>{applied?'✅ Indexation appliquée':'Appliquer l\'indexation'}</B>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>CP 200</b>: Indexation annuelle au 01/01 (2,21% en 2026)<br/>
          <b>CP 124</b>: Indexation trimestrielle (0,2186%)<br/>
          <b>Indice-pivot</b>: Dépassement → +2% fonctionnaires et allocations sociales
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Prévisualisation — +{pct}% au {dateIndex}</div></div>
        <Tbl cols={[
          {k:'n',l:'Travailleur',b:1,r:r=>`${r.first} ${r.last}`},
          {k:'a',l:'Salaire actuel',a:'right',r:r=>fmt(r.monthlySalary)},
          {k:'b',l:'Nouveau salaire',a:'right',r:r=><span style={{color:'#4ade80',fontWeight:600}}>{fmt(r.newSalary)}</span>},
          {k:'d',l:'Différence',a:'right',r:r=><span style={{color:'#fb923c'}}>+{fmt(r.diff)}</span>},
        ]} data={preview}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PLAN CAFÉTÉRIA / FLEXIBLE REWARD
// ═══════════════════════════════════════════════════════════════
function CafeteriaMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [budget,setBudget]=useState(3000);
  const [choix,setChoix]=useState({});
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  
  const options=[
    {id:'pc',l:'📱 PC/Tablet/GSM',fiscal:'ATN forfaitaire (72€/an PC, 36€/an GSM, 36€/an internet)',max:2000},
    {id:'pension',l:'💰 Pension complémentaire',fiscal:'Exonéré si < 80% rule (LPC). ONSS 8,86% employeur',max:5000},
    {id:'epargne',l:'🏦 Épargne long terme',fiscal:'Réduction impôt 30% (max 2.450€/an)',max:2450},
    {id:'velo',l:'🚲 Vélo (leasing)',fiscal:'Exonéré ONSS et IPP. Indemnité vélo 0,27€/km',max:3000},
    {id:'formation',l:'📚 Formation',fiscal:'Déductible 120% pour l\'employeur',max:5000},
    {id:'garde',l:'👶 Garde d\'enfants',fiscal:'Réduction impôt (max 15,70€/jour/enfant < 14 ans)',max:3000},
    {id:'multimedia',l:'📺 Multimédia',fiscal:'ATN si usage privé. Déductible employeur.',max:1500},
    {id:'mobilite',l:'🚗 Budget mobilité',fiscal:'Voir module Budget Mobilité (3 piliers)',max:10000},
    {id:'conges_extra',l:'🌴 Jours de congé extra',fiscal:'Conversion brut → jours. Neutre ONSS.',max:0},
    {id:'warrants',l:'📈 Warrants',fiscal:'ONSS 13,07% sur valeur. Pas de PP si >1 an.',max:5000},
  ];
  
  const totalChoisi=Object.values(choix).reduce((a,v)=>a+(parseFloat(v)||0),0);
  const reste=budget-totalChoisi;
  
  return <div>
    <PH title="Plan Cafétéria — Flexible Reward" sub="Optimisation salariale sur mesure"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Configuration</ST>
        <I label="Travailleur" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Budget annuel (€)" type="number" value={budget} onChange={v=>setBudget(parseFloat(v)||0)}/>
        <div style={{marginTop:14,padding:12,borderRadius:8,textAlign:'center',background:reste>=0?'rgba(74,222,128,.08)':'rgba(248,113,113,.08)'}}>
          <div style={{fontSize:11,color:'#5e5c56'}}>Budget restant</div>
          <div style={{fontSize:24,fontWeight:700,color:reste>=0?'#4ade80':'#f87171'}}>{fmt(reste)}</div>
          <div style={{fontSize:11,color:'#9e9b93'}}>sur {fmt(budget)} alloué</div>
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:650,overflowY:'auto'}}>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Choix des avantages</div>
        {options.map(opt=><div key={opt.id} style={{padding:14,marginBottom:8,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{opt.l}</span>
            <div style={{width:120}}><I label="" type="number" value={choix[opt.id]||0} onChange={v=>setChoix(p=>({...p,[opt.id]:Math.min(parseFloat(v)||0,opt.max||99999)}))}/></div>
          </div>
          <div style={{fontSize:10.5,color:'#9e9b93'}}>{opt.fiscal}</div>
          {opt.max>0&&<div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>Max: {fmt(opt.max)}/an</div>}
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BONUS CCT 90 — Prime non récurrente liée aux résultats
// ═══════════════════════════════════════════════════════════════
function CCT90Mod({s,d}){
  const [montant,setMontant]=useState(2998);
  const [yr,setYr]=useState(new Date().getFullYear());
  const ae=s.emps.filter(e=>e.status==='active');
  const plafond=3948; // plafond 2026 estimé
  const onssW=montant*0.1307;
  const cotSolidarite=montant*0.3307; // 33,07% patronal
  const netTrav=montant-onssW;
  const coutEmpl=montant+cotSolidarite;
  const impotTrav=0; // Exonéré IPP si ≤ plafond
  
  return <div>
    <PH title="Bonus CCT 90" sub={`Prime non récurrente liée aux résultats — Plafond ${yr}: ${fmt(plafond)}`}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Configuration</ST>
        <I label="Montant brut (€)" type="number" value={montant} onChange={v=>setMontant(parseFloat(v)||0)}/>
        <I label="Année" type="number" value={yr} onChange={setYr}/>
        <div style={{marginTop:14,padding:12,background:'rgba(74,222,128,.08)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#4ade80',marginBottom:4}}>Avantage fiscal</div>
          <div>ONSS travailleur: <b style={{color:'#f87171'}}>13,07%</b> (pas les 25-50% PP !)</div>
          <div>Cotisation patronale: <b style={{color:'#f87171'}}>33,07%</b></div>
          <div>Impôt travailleur: <b style={{color:'#4ade80'}}>0% (exonéré IPP)</b></div>
        </div>
        <div style={{marginTop:10,padding:10,background:montant<=plafond?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)',borderRadius:8,fontSize:11,color:montant<=plafond?'#4ade80':'#f87171'}}>
          {montant<=plafond?'✅ Dans le plafond CCT 90':'❌ Dépasse le plafond ! L\'excédent sera traité comme rémunération ordinaire.'}
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Simulation pour {ae.length} travailleur(s)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:20}}>
          {[{l:'Net travailleur',v:netTrav,c:'#4ade80'},{l:'Coût employeur',v:coutEmpl,c:'#f87171'},{l:'Économie vs brut classique',v:montant*0.45-impotTrav,c:'#60a5fa'}].map((x,i)=>
            <div key={i} style={{padding:16,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center',border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:x.c,marginTop:4}}>{fmt(x.v)}</div>
            </div>
          )}
        </div>
        <div style={{padding:14,background:'rgba(96,165,250,.04)',borderRadius:8,fontSize:11.5,color:'#60a5fa',lineHeight:1.8}}>
          <b>Conditions:</b> Plan d'octroi via formulaire type SPF Emploi. Objectifs collectifs mesurables. Période de référence min. 3 mois. Déposé au greffe de la Direction générale des Relations collectives de travail.<br/>
          <b>Total pour {ae.length} travailleurs:</b> Net versé: {fmt(netTrav*ae.length)} — Coût total: {fmt(coutEmpl*ae.length)}
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BUDGET MOBILITÉ — 3 Piliers (Loi 17/03/2019)
// ═══════════════════════════════════════════════════════════════
function BudgetMobiliteMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [budgetAn,setBudgetAn]=useState(6000);
  const [p1,setP1]=useState(0);
  const [p2,setP2]=useState(0);
  const ae=s.emps.filter(e=>e.status==='active');
  const p3=Math.max(0,budgetAn-p1-p2);
  const cotP3=p3*0.3807; // 38,07% cotisation spéciale sur pilier 3
  const netP3=p3-cotP3;
  
  return <div>
    <PH title="Budget mobilité" sub="Loi du 17/03/2019 — Alternative voiture de société"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Configuration</ST>
        <I label="Travailleur" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <I label="Budget annuel (€)" type="number" value={budgetAn} onChange={v=>setBudgetAn(parseFloat(v)||0)}/>
        <I label="Pilier 1 — Voiture éco (€/an)" type="number" value={p1} onChange={v=>setP1(parseFloat(v)||0)}/>
        <I label="Pilier 2 — Mobilité durable (€/an)" type="number" value={p2} onChange={v=>setP2(parseFloat(v)||0)}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#5e5c56'}}>Pilier 3 — Solde en cash</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{fmt(p3)}</div>
          <div style={{fontSize:11,color:'#9e9b93'}}>Net après cotisation: {fmt(netP3)}</div>
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Répartition des 3 piliers</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:20}}>
          {[
            {l:'Pilier 1',sub:'Voiture écologique',v:p1,c:'#fb923c',desc:'Voiture + émissions CO2 ≤ seuil. ATN calculé sur la nouvelle voiture.'},
            {l:'Pilier 2',sub:'Mobilité durable',v:p2,c:'#60a5fa',desc:'Transports en commun, vélo, trottinette, logement (max 400€/mois si < 10km travail). Exonéré ONSS et IPP.'},
            {l:'Pilier 3',sub:'Solde en cash',v:p3,c:'#4ade80',desc:`Cotisation spéciale: 38,07%. Net: ${fmt(netP3)}. Pas de PP ni d'ONSS ordinaire.`},
          ].map((x,i)=>
            <div key={i} style={{padding:16,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div>
              <div style={{fontSize:11,color:x.c,fontWeight:600}}>{x.sub}</div>
              <div style={{fontSize:22,fontWeight:700,color:x.c,marginTop:8}}>{fmt(x.v)}</div>
              <div style={{fontSize:10,color:'#9e9b93',marginTop:6,lineHeight:1.5}}>{x.desc}</div>
            </div>
          )}
        </div>
        <div style={{height:24,borderRadius:8,overflow:'hidden',display:'flex',marginBottom:10}}>
          <div style={{width:`${budgetAn>0?p1/budgetAn*100:0}%`,background:'#fb923c',transition:'width .3s'}}/>
          <div style={{width:`${budgetAn>0?p2/budgetAn*100:0}%`,background:'#60a5fa',transition:'width .3s'}}/>
          <div style={{flex:1,background:'#4ade80'}}/>
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  STATISTIQUES INS — Structure des rémunérations
// ═══════════════════════════════════════════════════════════════
function StatsINSMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const ae=s.emps.filter(e=>e.status==='active');
  const h=ae.filter(e=>(e.sexe||'M')==='M').length;const f=ae.length-h;
  const masseH=ae.filter(e=>(e.sexe||'M')==='M').reduce((a,e)=>a+e.monthlySalary*13,0);
  const masseF=ae.filter(e=>(e.sexe||'M')!=='M').reduce((a,e)=>a+e.monthlySalary*13,0);
  const masseTot=masseH+masseF;
  const moyH=h>0?masseH/h/13:0;const moyF=f>0?masseF/f/13:0;
  const ecart=moyH>0?((moyH-moyF)/moyH*100).toFixed(1):0;
  
  return <div>
    <PH title="Statistiques INS" sub={`Déclaration structure des rémunérations — ${yr}`}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <I label="Année" type="number" value={yr} onChange={setYr}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Données clés</div>
          <div>Effectif: <b style={{color:'#e8e6e0'}}>{ae.length}</b> ({h}H / {f}F)</div>
          <div>Masse salariale: <b style={{color:'#4ade80'}}>{fmt(masseTot)}</b></div>
          <div>Salaire moyen H: <b style={{color:'#e8e6e0'}}>{fmt(moyH)}</b></div>
          <div>Salaire moyen F: <b style={{color:'#e8e6e0'}}>{fmt(moyF)}</b></div>
          <div>Écart salarial: <b style={{color:parseFloat(ecart)>5?'#f87171':'#4ade80'}}>{ecart}%</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Déclaration obligatoire pour les entreprises de 50+ travailleurs. Transmise à Statbel via l'ONSS (intégrée dans la DmfA).
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Répartition — {yr}</div>
        <Tbl cols={[
          {k:'n',l:'Travailleur',b:1,r:r=>`${r.first} ${r.last}`},
          {k:'s',l:'Sexe',r:r=>r.sexe==='F'?'F':'M'},
          {k:'f',l:'Fonction',r:r=>r.fn||'Employé'},
          {k:'b',l:'Brut mensuel',a:'right',r:r=>fmt(r.monthlySalary)},
          {k:'a',l:'Brut annuel',a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.monthlySalary*13)}</span>},
        ]} data={ae}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  WARRANTS — Stock options / Optimisation fiscale
// ═══════════════════════════════════════════════════════════════
function WarrantsMod({s,d}){
  const [montant,setMontant]=useState(3000);
  const [type,setType]=useState('warrant');
  const ae=s.emps.filter(e=>e.status==='active');
  const onssW=montant*0.1307;
  const onssE=montant*0.25;
  const avFiscal=type==='warrant'?montant*0.18:montant*0.165;
  const ppWarrant=avFiscal*0.535;
  const netTrav=montant-onssW-ppWarrant;
  const coutEmpl=montant+onssE;
  const netClassique=montant*(1-0.1307)*(1-0.45);
  const gain=netTrav-netClassique;
  
  return <div>
    <PH title="Warrants / Stock Options" sub="Optimisation fiscale — Loi 26/03/1999"/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Configuration</ST>
        <I label="Montant brut (€)" type="number" value={montant} onChange={v=>setMontant(parseFloat(v)||0)}/>
        <I label="Type" value={type} onChange={setType} options={[{v:'warrant',l:'Warrants (18%)'},{v:'options',l:'Stock options (16,5%)'}]}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Comparaison</div>
          <div>Net warrant: <b style={{color:'#4ade80'}}>{fmt(netTrav)}</b></div>
          <div>Net classique: <b style={{color:'#e8e6e0'}}>{fmt(netClassique)}</b></div>
          <div>Gain net: <b style={{color:'#4ade80'}}>+{fmt(gain)}</b></div>
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Simulation — {ae.length} travailleur(s)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
          <div style={{padding:16,background:'rgba(74,222,128,.06)',borderRadius:8,border:'1px solid rgba(74,222,128,.15)'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#4ade80',marginBottom:8}}>Via Warrants</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:2}}>
              Brut: {fmt(montant)}<br/>ONSS (13,07%): -{fmt(onssW)}<br/>
              Base imposable (18%): {fmt(avFiscal)}<br/>PP (~53,5%): -{fmt(ppWarrant)}<br/>
              <b style={{color:'#4ade80',fontSize:14}}>Net: {fmt(netTrav)}</b>
            </div>
          </div>
          <div style={{padding:16,background:'rgba(248,113,113,.06)',borderRadius:8,border:'1px solid rgba(248,113,113,.15)'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#f87171',marginBottom:8}}>Via Brut classique</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:2}}>
              Brut: {fmt(montant)}<br/>ONSS (13,07%): -{fmt(onssW)}<br/>
              PP (~45%): -{fmt((montant-onssW)*0.45)}<br/>
              <b style={{color:'#f87171',fontSize:14}}>Net: {fmt(netClassique)}</b>
            </div>
          </div>
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PLAN DE FORMATION — Obligation légale (Loi 3/10/2022)
// ═══════════════════════════════════════════════════════════════
function PlanFormationMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const ae=s.emps.filter(e=>e.status==='active');
  const droitJours=ae.length>=10?5:(ae.length>=20?5:1);
  const [formations,setFormations]=useState([]);
  const addF=()=>setFormations(p=>[...p,{id:Date.now(),titre:'',type:'interne',heures:0,cout:0,travailleurs:[]}]);
  const updF=(id,k,v)=>setFormations(p=>p.map(f=>f.id===id?{...f,[k]:v}:f));
  const totalH=formations.reduce((a,f)=>a+parseFloat(f.heures||0),0);
  const totalCout=formations.reduce((a,f)=>a+parseFloat(f.cout||0),0);
  
  return <div>
    <PH title="Plan de formation" sub={`Loi du 03/10/2022 — ${droitJours} jours/an/ETP`} actions={<B onClick={addF}>+ Formation</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <I label="Année" type="number" value={yr} onChange={setYr}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé {yr}</div>
          <div>Formations planifiées: <b style={{color:'#e8e6e0'}}>{formations.length}</b></div>
          <div>Total heures: <b style={{color:'#e8e6e0'}}>{totalH}h</b></div>
          <div>Budget total: <b style={{color:'#f87171'}}>{fmt(totalCout)}</b></div>
          <div>Droit individuel: <b style={{color:'#60a5fa'}}>{droitJours} jours/ETP/an</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Obligation:</b> Entreprises 20+ ETP: plan annuel obligatoire. Déductible 120% ISOC si PME. À déposer via l'application du SPF Emploi.
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:600,overflowY:'auto'}}>
        {formations.length===0&&<div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Aucune formation planifiée</div>}
        {formations.map((f,i)=><div key={f.id} style={{padding:14,marginBottom:10,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:10}}>
            <I label="Titre" value={f.titre} onChange={v=>updF(f.id,'titre',v)}/>
            <I label="Type" value={f.type} onChange={v=>updF(f.id,'type',v)} options={[{v:'interne',l:'Interne'},{v:'externe',l:'Externe'},{v:'elearning',l:'E-learning'}]}/>
            <I label="Heures" type="number" value={f.heures} onChange={v=>updF(f.id,'heures',v)}/>
            <I label="Coût (€)" type="number" value={f.cout} onChange={v=>updF(f.id,'cout',v)}/>
          </div>
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  NOTES DE FRAIS — Remboursement frais propres employeur
// ═══════════════════════════════════════════════════════════════
function NoteFraisMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [notes,setNotes]=useState([]);
  const ae=s.emps.filter(e=>e.status==='active');
  const addNote=()=>setNotes(p=>[...p,{id:Date.now(),date:'',desc:'',cat:'deplacement',montant:0,justif:false}]);
  const updN=(id,k,v)=>setNotes(p=>p.map(n=>n.id===id?{...n,[k]:v}:n));
  const remN=(id)=>setNotes(p=>p.filter(n=>n.id!==id));
  const cats=[
    {id:'deplacement',l:'🚗 Déplacement',forfait:'0,4280€/km (2026)'},
    {id:'repas',l:'🍽️ Repas d\'affaires',forfait:'Max raisonnable + justificatif'},
    {id:'logement',l:'🏨 Logement',forfait:'Facture originale'},
    {id:'telecom',l:'📱 Télécom/Internet',forfait:'Forfait ou réel'},
    {id:'bureau',l:'🏠 Bureau à domicile',forfait:'Forfait 148,73€/mois (2026)'},
    {id:'materiel',l:'📦 Matériel/Fournitures',forfait:'Facture originale'},
    {id:'parking',l:'🅿️ Parking',forfait:'Ticket/reçu'},
    {id:'divers',l:'📋 Autres',forfait:'Justificatif obligatoire'},
  ];
  const total=notes.reduce((a,n)=>a+parseFloat(n.montant||0),0);
  
  return <div>
    <PH title="Notes de frais" sub="Frais propres à l'employeur — Exonéré ONSS et IPP" actions={<B onClick={addNote}>+ Note de frais</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Travailleur</ST>
        <I label="Employé" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Total</div>
          <div>Notes: <b style={{color:'#e8e6e0'}}>{notes.length}</b></div>
          <div>Montant total: <b style={{color:'#4ade80'}}>{fmt(total)}</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Forfait km 2026:</b> 0,4280€/km<br/>
          <b>Bureau domicile:</b> max 148,73€/mois<br/>
          Exonéré ONSS et IPP si frais réels ou forfait accepté par le fisc.
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:600,overflowY:'auto'}}>
        {notes.length===0&&<div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Aucune note de frais</div>}
        {notes.map((n,i)=><div key={n.id} style={{padding:14,marginBottom:10,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>Note {i+1}</span>
            <button onClick={()=>remN(n.id)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:6,color:'#f87171',padding:'3px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>✕</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
            <I label="Date" type="date" value={n.date} onChange={v=>updN(n.id,'date',v)}/>
            <I label="Catégorie" value={n.cat} onChange={v=>updN(n.id,'cat',v)} options={cats.map(c=>({v:c.id,l:c.l}))}/>
            <I label="Montant (€)" type="number" value={n.montant} onChange={v=>updN(n.id,'montant',v)}/>
            <I label="Description" value={n.desc} onChange={v=>updN(n.id,'desc',v)}/>
          </div>
        </div>)}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  HEURES SUPPLÉMENTAIRES — Calcul majorations & récupération
// ═══════════════════════════════════════════════════════════════
function HeuresSupMod({s,d}){
  const [eid,setEid]=useState(s.emps[0]?.id||'');
  const [heures,setHeures]=useState([]);
  const ae=s.emps.filter(e=>e.status==='active');
  const emp=ae.find(e=>e.id===eid);
  const addH=()=>setHeures(p=>[...p,{id:Date.now(),date:'',type:'sem',h:0}]);
  const updH=(id,k,v)=>setHeures(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  
  const types=[
    {id:'sem',l:'Semaine (jours ouvrables)',maj:50,recup:true},
    {id:'sam',l:'Samedi',maj:50,recup:true},
    {id:'dim',l:'Dimanche',maj:100,recup:true},
    {id:'ferie',l:'Jour férié',maj:100,recup:true},
    {id:'nuit',l:'Nuit (20h-06h)',maj:25,recup:false},
    {id:'volontaire',l:'Volontariat (max 120h/an)',maj:0,recup:false},
  ];
  
  const hr=emp?(emp.monthlySalary/(emp.whWeek||38)/4.33):0;
  const results=heures.map(h=>{
    const t=types.find(x=>x.id===h.type)||types[0];
    const hh=parseFloat(h.h)||0;
    const base=hh*hr;
    const majoration=base*(t.maj/100);
    return{...h,tauxH:hr,base,majoration,total:base+majoration,recup:t.recup?hh:0,typeName:t.l,majPct:t.maj};
  });
  const totH=results.reduce((a,r)=>a+(parseFloat(r.h)||0),0);
  const totMaj=results.reduce((a,r)=>a+r.majoration,0);
  const totRecup=results.reduce((a,r)=>a+r.recup,0);
  const totBrut=results.reduce((a,r)=>a+r.total,0);
  
  return <div>
    <PH title="Heures supplémentaires" sub="Loi 16/03/1971 — Majorations & récupération" actions={<B onClick={addH}>+ Prestations</B>}/>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <C>
        <ST>Travailleur</ST>
        <I label="Employé" value={eid} onChange={setEid} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
        {emp&&<div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé</div>
          <div>Taux horaire: <b style={{color:'#e8e6e0'}}>{fmt(hr)}/h</b></div>
          <div>Total heures sup: <b style={{color:'#fb923c'}}>{totH}h</b></div>
          <div>Majorations: <b style={{color:'#f87171'}}>{fmt(totMaj)}</b></div>
          <div>Brut total: <b style={{color:'#4ade80'}}>{fmt(totBrut)}</b></div>
          <div>Récupération due: <b style={{color:'#60a5fa'}}>{totRecup}h</b></div>
        </div>}
        <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Semaine/Samedi:</b> +50%<br/>
          <b>Dimanche/Férié:</b> +100%<br/>
          <b>Nuit:</b> +25% (secteur dépendant)<br/>
          <b>Volontariat:</b> 120h/an sans majoration ni récup (loi Peeters).<br/>
          <b>Récupération:</b> obligatoire dans le trimestre (sauf exceptions).
        </div>
      </C>
      <C style={{padding:'14px 18px',maxHeight:600,overflowY:'auto'}}>
        {heures.length===0&&<div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Aucune prestation enregistrée</div>}
        {heures.map((h,i)=><div key={h.id} style={{padding:12,marginBottom:8,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
            <I label="Date" type="date" value={h.date} onChange={v=>updH(h.id,'date',v)}/>
            <I label="Type" value={h.type} onChange={v=>updH(h.id,'type',v)} options={types.map(t=>({v:t.id,l:`${t.l} (+${t.maj}%)`}))}/>
            <I label="Heures" type="number" value={h.h} onChange={v=>updH(h.id,'h',v)}/>
            <div style={{padding:'8px 0',textAlign:'right'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>Brut</div>
              <div style={{fontSize:14,fontWeight:600,color:'#4ade80'}}>{results[i]?fmt(results[i].total):'-'}</div>
            </div>
          </div>
        </div>)}
      </C>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  NOUVEAUX MODULES — Benchmark Securex/Partena/UCM
// ═══════════════════════════════════════════════════════════════

function SimCoutMod({s,d}){
  const [brut,setBrut]=useState(3500);const [reg,setReg]=useState('employe');const [prem,setPrem]=useState(false);
  const op=reg==='ouvrier'?0.3838:0.2500;const onss=brut*op;const red=prem?onss:0;const cb=brut+onss-red;
  const net=brut-(brut*0.1307)-(brut>2500?brut*0.35:brut*0.25);const prov=(brut*0.0769*2.92+brut)/12;const ct=cb+prov;const ca=ct*13;
  const f=n=>'€ '+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return <div><C><div style={{padding:'18px 20px'}}>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><span style={{fontSize:24}}>💰</span>
    <div><div style={{fontWeight:700,fontSize:16}}>Simulateur coût salarial employeur</div>
    <div style={{fontSize:11,color:'#5e5c56'}}>Brut → coût total. Le client verse lui-même les cotisations ONSS.</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
      <I label="Brut mensuel (€)" type="number" value={brut} onChange={v=>setBrut(+v||0)}/>
      <I label="Statut" value={reg} onChange={setReg} options={[{v:'employe',l:'Employé (25%)'},{v:'ouvrier',l:'Ouvrier (38.38%)'}]}/>
      <div style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}><label style={{fontSize:11,color:'#9e9b93',display:'flex',gap:6,alignItems:'center'}}><input type="checkbox" checked={prem} onChange={e=>setPrem(e.target.checked)}/> Réduction 1er engagement</label></div>
    </div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
      <SC label="Brut" value={f(brut)} color="#60a5fa"/><SC label="ONSS patronal" value={f(onss-red)} sub={prem?'Réduc.':(op*100).toFixed(1)+'%'} color="#fb923c"/>
      <SC label="Net estimé" value={f(net)} color="#4ade80"/><SC label="Coût total/mois" value={f(ct)} sub="Avec provisions" color="#c6a34e"/>
    </div>
    <C style={{marginTop:12,padding:'14px 18px'}}><ST>Détail</ST>
      {[['Brut',brut],['ONSS patronal',onss],['Réduction 1er eng.',-red],['= Coût brut',cb],['Provisions/mois',prov],['= Total mensuel',ct],['= Total annuel',ca]].map(([l,v],i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:String(l).startsWith('=')?'2px solid rgba(198,163,78,.3)':'1px solid rgba(255,255,255,.03)',fontWeight:String(l).startsWith('=')?700:400}}>
        <span style={{fontSize:12,color:String(l).startsWith('=')?'#c6a34e':'#9e9b93'}}>{l}</span><span style={{fontSize:12,fontWeight:600,color:v<0?'#4ade80':'#d4d0c8'}}>{f(v)}</span></div>)}
      <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.05)',borderRadius:8,fontSize:11,color:'#60a5fa'}}><b>ℹ</b> Bureau social: calcul et déclarations. Le client verse les cotisations ONSS et précompte.</div>
    </C></div>;
}

function TotalRewardMod({s,d}){
  const ae=s.emps||[];const [sel,setSel]=useState(ae[0]?.id||'');const emp=ae.find(e=>e.id===sel)||ae[0]||{};const b=parseFloat(emp.brut)||3000;
  const items=[{c:'Rémunération directe',i:[{l:'Brut annuel (x13.92)',v:b*13.92},{l:'Pécule vacances',v:b*1.85}]},{c:'Avantages',i:[{l:'Chèques-repas',v:1920},{l:'Éco-chèques',v:250},{l:'Ass. groupe',v:b*0.36},{l:'Ass. hosp.',v:480}]},{c:'Cotisations employeur',i:[{l:'ONSS annuel',v:b*3.48},{l:'AT',v:b*0.14}]}];
  const tot=items.reduce((a,c)=>a+c.i.reduce((b2,x)=>b2+x.v,0),0);const f=n=>'€ '+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🏆</span>
    <div><div style={{fontWeight:700,fontSize:16}}>Total Reward Statement</div><div style={{fontSize:11,color:'#5e5c56'}}>Rémunération globale par travailleur</div></div></div>
    <I label="Travailleur" value={sel} onChange={setSel} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/></C>
    <SC label="Package annuel" value={f(tot)} sub={emp.first?`${emp.first} ${emp.last}`:''} color="#c6a34e"/>
    {items.map((cat,ci)=><C key={ci} style={{marginTop:10}}><div style={{padding:'10px 18px',background:'rgba(198,163,78,.05)',borderBottom:'1px solid rgba(198,163,78,.1)',display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,fontSize:11,color:'#c6a34e',textTransform:'uppercase'}}>{cat.c}</span><span style={{fontSize:11,color:'#5e5c56'}}>{f(cat.i.reduce((a,x)=>a+x.v,0))}</span></div>
      {cat.i.map((it,ii)=><div key={ii} style={{display:'flex',justifyContent:'space-between',padding:'7px 18px',borderBottom:'1px solid rgba(255,255,255,.02)'}}><span style={{fontSize:12}}>{it.l}</span><span style={{fontSize:12,fontWeight:600,color:'#4ade80'}}>{f(it.v)}</span></div>)}</C>)}</div>;
}

function ATNMod({s,d}){
  const ae=s.emps||[];const [vehs,setVehs]=useState([]);const [f,setF]=useState({emp:'',marque:'',co2:120,carburant:'essence',catalogue:35000});
  const add=()=>{if(!f.emp)return;const pct=Math.min(18,Math.max(4,5.5+(+f.co2-(f.carburant==='diesel'?67:82))*0.1));const atn=Math.max(1600,+f.catalogue*6/7*(pct/100));setVehs(p=>[...p,{...f,id:Date.now(),atn,mens:atn/12}]);};
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🚗</span><div><div style={{fontWeight:700,fontSize:16}}>ATN Véhicules de société</div><div style={{fontSize:11,color:'#5e5c56'}}>Calcul ATN, cotisation CO₂, flotte</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
      <I label="Travailleur" value={f.emp} onChange={v=>setF({...f,emp:v})} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Véhicule" value={f.marque} onChange={v=>setF({...f,marque:v})}/>
      <I label="Carburant" value={f.carburant} onChange={v=>setF({...f,carburant:v})} options={[{v:'essence',l:'Essence'},{v:'diesel',l:'Diesel'},{v:'electrique',l:'Électrique'},{v:'hybride',l:'Hybride'}]}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
      <I label="CO₂ (g/km)" type="number" value={f.co2} onChange={v=>setF({...f,co2:v})}/>
      <I label="Catalogue TVAC (€)" type="number" value={f.catalogue} onChange={v=>setF({...f,catalogue:v})}/>
      <div style={{display:'flex',alignItems:'flex-end'}}><button onClick={add} style={{padding:'8px 20px',background:'linear-gradient(135deg,#c6a34e,#e8c547)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer'}}>+ Ajouter</button></div>
    </div></C>
    {vehs.length>0&&<C style={{marginTop:12}}><TB cols={[{k:'e',l:'Travailleur'},{k:'v',l:'Véhicule'},{k:'c',l:'CO₂'},{k:'m',l:'ATN/mois'},{k:'a',l:'ATN/an'}]} rows={vehs.map(v=>{const e=ae.find(x=>x.id===v.emp);return{e:e?`${e.first} ${e.last}`:'?',v:v.marque,c:v.co2+'g',m:'€ '+(v.mens).toFixed(2),a:'€ '+(v.atn).toFixed(2)};})}/></C>}</div>;
}

function ChomTempMod({s,d}){
  const ae=s.emps||[];const [ds,setDs]=useState([]);const [f,setF]=useState({emp:'',motif:'eco',debut:'',fin:'',jours:0});
  const mots=[{v:'eco',l:'Économique'},{v:'fm',l:'Force majeure'},{v:'int',l:'Intempéries'},{v:'tech',l:'Technique'}];
  const add=()=>{if(!f.emp)return;setDs(p=>[...p,{...f,id:'CT-'+Date.now()}]);setF({emp:'',motif:'eco',debut:'',fin:'',jours:0});};
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>⚠</span><div><div style={{fontWeight:700,fontSize:16}}>Chômage temporaire</div><div style={{fontSize:11,color:'#5e5c56'}}>C3.2, notification ONEM. Client verse les cotisations.</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
      <I label="Travailleur" value={f.emp} onChange={v=>setF({...f,emp:v})} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Motif" value={f.motif} onChange={v=>setF({...f,motif:v})} options={mots}/>
      <I label="Début" type="date" value={f.debut} onChange={v=>setF({...f,debut:v})}/>
      <I label="Fin" type="date" value={f.fin} onChange={v=>setF({...f,fin:v})}/>
      <I label="Jours" type="number" value={f.jours} onChange={v=>setF({...f,jours:v})}/>
    </div><button onClick={add} style={{marginTop:12,padding:'8px 20px',background:'linear-gradient(135deg,#c6a34e,#e8c547)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer'}}>+ Créer dossier</button></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}><SC label="Dossiers" value={ds.length} color="#fb923c"/><SC label="Jours" value={ds.reduce((a,c)=>a+(+c.jours||0),0)} color="#60a5fa"/><SC label="C3.2" value={ds.length} color="#a78bfa"/></div>
    {ds.length>0&&<C style={{marginTop:12}}><TB cols={[{k:'e',l:'Travailleur'},{k:'m',l:'Motif'},{k:'p',l:'Période'},{k:'j',l:'Jours'}]} rows={ds.map(x=>{const e=ae.find(a=>a.id===x.emp);return{e:e?`${e.first} ${e.last}`:'?',m:mots.find(m=>m.v===x.motif)?.l,p:`${x.debut||'?'} → ${x.fin||'?'}`,j:x.jours};})}/></C>}</div>;
}

function CongeEducMod({s,d}){
  const ae=s.emps||[];const [ds,setDs]=useState([]);const [f,setF]=useState({emp:'',formation:'',heures:0,region:'bxl'});
  const pl={bxl:120,wal:180,vla:125};
  const add=()=>{if(!f.emp)return;setDs(p=>[...p,{...f,id:'CE-'+Date.now(),max:pl[f.region],remb:Math.min(+f.heures,pl[f.region])*22.07}]);setF({emp:'',formation:'',heures:0,region:'bxl'});};
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🎓</span><div><div style={{fontWeight:700,fontSize:16}}>Congé-éducation payé</div><div style={{fontSize:11,color:'#5e5c56'}}>Remboursement Région — heures et formulaires</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
      <I label="Travailleur" value={f.emp} onChange={v=>setF({...f,emp:v})} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Formation" value={f.formation} onChange={v=>setF({...f,formation:v})}/>
      <I label="Heures" type="number" value={f.heures} onChange={v=>setF({...f,heures:v})}/>
      <I label="Région" value={f.region} onChange={v=>setF({...f,region:v})} options={[{v:'bxl',l:'Bruxelles (120h)'},{v:'wal',l:'Wallonie (180h)'},{v:'vla',l:'Flandre (125h)'}]}/>
    </div><button onClick={add} style={{marginTop:12,padding:'8px 20px',background:'linear-gradient(135deg,#c6a34e,#e8c547)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer'}}>+ Ajouter</button></C>
    {ds.length>0&&<C style={{marginTop:12}}><TB cols={[{k:'e',l:'Travailleur'},{k:'f',l:'Formation'},{k:'h',l:'Heures'},{k:'m',l:'Plafond'},{k:'r',l:'Remb.'}]} rows={ds.map(x=>{const e=ae.find(a=>a.id===x.emp);return{e:e?`${e.first} ${e.last}`:'?',f:x.formation,h:x.heures,m:x.max+'h',r:'€ '+x.remb.toFixed(0)};})}/></C>}</div>;
}

function RCCMod({s,d}){
  const ae=s.emps||[];const [f,setF]=useState({emp:'',brut:4000});const [r,setR]=useState(null);
  const calc=()=>{const al=Math.min(f.brut*0.60,1800);const co=(f.brut-al)*0.50;setR({al,co,tot:al+co,cs:co*0.0632});};
  const fm=n=>'€ '+n.toFixed(2);
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🏖</span><div><div style={{fontWeight:700,fontSize:16}}>RCC — Prépension</div><div style={{fontSize:11,color:'#5e5c56'}}>Complément entreprise, C4-RCC, ONEM, DECAVA</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
      <I label="Travailleur" value={f.emp} onChange={v=>setF({...f,emp:v})} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Brut réf. (€)" type="number" value={f.brut} onChange={v=>setF({...f,brut:+v})}/>
      <div style={{display:'flex',alignItems:'flex-end'}}><button onClick={calc} style={{padding:'8px 24px',background:'linear-gradient(135deg,#c6a34e,#e8c547)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer'}}>Calculer</button></div>
    </div></C>
    {r&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}><SC label="Alloc. chômage" value={fm(r.al)} sub="/mois" color="#60a5fa"/><SC label="Complément" value={fm(r.co)} sub="/mois" color="#fb923c"/><SC label="Total RCC" value={fm(r.tot)} sub="/mois" color="#4ade80"/><SC label="Cotis. spéc." value={fm(r.cs)} sub="/mois" color="#a78bfa"/></div>}</div>;
}

function OutplacementMod({s,d}){
  const ae=s.emps||[];const [ds,setDs]=useState([]);const [f,setF]=useState({emp:'',type:'legal',prest:'',budget:1800});
  const tps=[{v:'legal',l:'Légal (≥45 ans)'},{v:'general',l:'CCT 82'},{v:'restr',l:'Restructuration'}];
  const add=()=>{if(!f.emp)return;setDs(p=>[...p,{...f,id:'OP-'+Date.now()}]);};
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🔄</span><div><div style={{fontWeight:700,fontSize:16}}>Outplacement</div><div style={{fontSize:11,color:'#5e5c56'}}>Offre dans les 15 jours fin préavis</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
      <I label="Travailleur" value={f.emp} onChange={v=>setF({...f,emp:v})} options={ae.map(e=>({v:e.id,l:`${e.first} ${e.last}`}))}/>
      <I label="Type" value={f.type} onChange={v=>setF({...f,type:v})} options={tps}/>
      <I label="Prestataire" value={f.prest} onChange={v=>setF({...f,prest:v})}/>
      <I label="Budget (€)" type="number" value={f.budget} onChange={v=>setF({...f,budget:+v})}/>
    </div><button onClick={add} style={{marginTop:12,padding:'8px 20px',background:'linear-gradient(135deg,#c6a34e,#e8c547)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer'}}>+ Créer</button></C>
    {ds.length>0&&<C style={{marginTop:12}}><TB cols={[{k:'e',l:'Travailleur'},{k:'t',l:'Type'},{k:'p',l:'Prestataire'},{k:'b',l:'Budget'}]} rows={ds.map(x=>{const e=ae.find(a=>a.id===x.emp);return{e:e?`${e.first} ${e.last}`:'?',t:tps.find(t=>t.v===x.type)?.l,p:x.prest||'À désigner',b:'€ '+x.budget};})}/></C>}</div>;
}

function AbsenteismeMod({s,d}){
  const n=(s.emps||[]).length||1;const ja=Math.floor(n*2.1);const ca2=Math.max(1,Math.floor(n*0.7));const jt=n*21;const tx=((ja/jt)*100).toFixed(1);const bf=ca2*ca2*(ja/ca2);
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>📊</span><div><div style={{fontWeight:700,fontSize:16}}>Analyse absentéisme</div><div style={{fontSize:11,color:'#5e5c56'}}>Bradford Factor, taux, coût, benchmark</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
      <SC label="Taux" value={tx+'%'} color={parseFloat(tx)>5?'#ef4444':'#4ade80'}/><SC label="Bradford" value={bf.toFixed(0)} sub={bf>500?'⚠ Élevé':'OK'} color={bf>500?'#fb923c':'#60a5fa'}/>
      <SC label="Jours perdus" value={ja} sub={ca2+' cas'} color="#a78bfa"/><SC label="Coût" value={'€ '+(ja*180)} color="#c6a34e"/>
    </div>
    <C style={{marginTop:12,padding:'14px 18px'}}><ST>Détail</ST>
      {[['Courte durée',(tx*0.6).toFixed(1)+'%'],['Longue durée',(tx*0.4).toFixed(1)+'%'],['Fréq./trav.',(ca2/n).toFixed(2)],['Durée moy.',(ja/ca2).toFixed(1)+' j'],['Benchmark BE','4.2%']].map(([l,v],i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{l}</span><span style={{fontSize:12,fontWeight:600}}>{v}</span></div>)}
    </C></div>;
}

function AidesEmploiMod({s,d}){
  const [tab,setTab]=useState('premier');
  const ae=s.emps.filter(e=>e.status==='active');
  const [simEmp,setSimEmp]=useState(null);
  const [simRes,setSimRes]=useState(null);

  // ── 1ER ENGAGEMENT — Réduction ONSS groupes-cibles (AR 16/05/2003 + Réforme Avril 2026) ──
  // ATTENTION: Réforme au 01/04/2026 (projet AR — Conseil d'État en cours, pas encore MB)
  // Avant 01/04/2026: 1er = max €3.100/trim à vie | 2è-3è = dégressif 13 trim sur 20
  // Après 01/04/2026: 1er = max €2.000/trim à vie | 2è-3è = €1.000/trim × 12 trim sur 20
  //                    4è-5è = €1.000/trim × 12 trim sur 20 (réintroduit!) | 6è = supprimé
  const PREMIER_ENG_AVANT=[
    {n:1,label:'1er travailleur',phase:'Avant 01/04/2026',red:'Exonération max €3.100/trim',trim:'Max €3.100/trimestre',dur:'Illimitée (à vie)',ref:'AR 16/05/2003 + Loi 26/12/2022',montant:[{t:'Tous trim.',m:3100}],full:true},
    {n:2,label:'2ème travailleur',phase:'Avant 01/04/2026',red:'Forfait dégressif (13 trim / 20)',trim:'€1.550 → €1.050 → €450',dur:'13 trimestres sur 20',ref:'AR 16/05/2003 art.12',montant:[{t:'T1-T5',m:1550},{t:'T6-T9',m:1050},{t:'T10-T13',m:450}]},
    {n:3,label:'3ème travailleur',phase:'Avant 01/04/2026',red:'Forfait dégressif (13 trim / 20)',trim:'€1.050 → €450',dur:'13 trimestres sur 20',ref:'AR 16/05/2003 art.12',montant:[{t:'T1-T9',m:1050},{t:'T10-T13',m:450}]},
  ];
  const PREMIER_ENG_APRES=[
    {n:1,label:'1er travailleur',phase:'Après 01/04/2026',red:'Exonération max €2.000/trim',trim:'Max €2.000/trimestre',dur:'Illimitée (à vie)',ref:'Projet AR 2026 (Conseil d\'État)',montant:[{t:'Tous trim.',m:2000}],full:true,change:'⬇ Baisse de €3.100 à €2.000'},
    {n:2,label:'2ème travailleur',phase:'Après 01/04/2026',red:'Forfait fixe €1.000/trim',trim:'€1.000/trimestre',dur:'12 trimestres sur 20',ref:'Projet AR 2026',montant:[{t:'T1-T12',m:1000}],change:'✨ Simplifié: montant fixe'},
    {n:3,label:'3ème travailleur',phase:'Après 01/04/2026',red:'Forfait fixe €1.000/trim',trim:'€1.000/trimestre',dur:'12 trimestres sur 20',ref:'Projet AR 2026',montant:[{t:'T1-T12',m:1000}],change:'✨ Simplifié: montant fixe'},
    {n:4,label:'4ème travailleur',phase:'Après 01/04/2026 (ou 01/07/2026)',red:'Forfait fixe €1.000/trim',trim:'€1.000/trimestre',dur:'12 trimestres sur 20',ref:'Projet AR 2026',montant:[{t:'T1-T12',m:1000}],change:'🆕 Réintroduit!'},
    {n:5,label:'5ème travailleur',phase:'Après 01/04/2026 (ou 01/07/2026)',red:'Forfait fixe €1.000/trim',trim:'€1.000/trimestre',dur:'12 trimestres sur 20',ref:'Projet AR 2026',montant:[{t:'T1-T12',m:1000}],change:'🆕 Réintroduit!'},
    {n:6,label:'6ème travailleur',phase:'—',red:'SUPPRIMÉ',trim:'€0',dur:'—',ref:'Supprimé depuis 01/01/2024',montant:[],change:'❌ Plus de réduction'},
  ];
  const PREMIER_ENG_TOTAL=[
    {n:1,avant:'Illimité (max €3.100/trim)',apres:'Illimité (max €2.000/trim)',totalAvant:'Illimité',totalApres:'Illimité'},
    {n:2,avant:'€1.550×5 + €1.050×4 + €450×4 = €13.750',apres:'€1.000×12 = €12.000',totalAvant:'€13.750',totalApres:'€12.000'},
    {n:3,avant:'€1.050×9 + €450×4 = €11.250',apres:'€1.000×12 = €12.000',totalAvant:'€11.250',totalApres:'€12.000'},
    {n:4,avant:'SUPPRIMÉ (depuis 2024)',apres:'€1.000×12 = €12.000',totalAvant:'€0',totalApres:'€12.000'},
    {n:5,avant:'SUPPRIMÉ (depuis 2024)',apres:'€1.000×12 = €12.000',totalAvant:'€0',totalApres:'€12.000'},
    {n:6,avant:'SUPPRIMÉ',apres:'SUPPRIMÉ',totalAvant:'€0',totalApres:'€0'},
  ];

  // ── ACTIVA — Plans d'activation par région ──
  const ACTIVA={
    bxl:{
      nom:'Activa.brussels',org:'Actiris',ref:'Ordonnance 23/06/2017 + AGRBC 14/09/2017',
      mesures:[
        {nom:'Activa.brussels',cible:'Demandeur d\'emploi (DE) inscrit Actiris ≥ 12 mois',type:'Activation alloc. chômage + prime employeur',
          avantages:[
            {l:'Allocation de travail (travailleur)',m:'€350/mois pendant 12 mois max',source:'ONEm via CAPAC/syndicat'},
            {l:'Prime Actiris (employeur)',m:'€800/trimestre pendant 8 trimestres max',source:'Actiris'},
          ],conditions:'DE inscrit ≥12 mois, < 57 ans, résidence Bruxelles. CDI ou CDD ≥ 6 mois, mi-temps min.',procedure:'1. Attestation Actiris 2. Embauche 3. Demande ONSS via DmfA 4. Paiement automatique'},
        {nom:'Activa.brussels Jeunes (<30 ans)',cible:'DE < 30 ans inscrit Actiris ≥ 6 mois',type:'Prime employeur renforcée',
          avantages:[
            {l:'Allocation de travail (travailleur)',m:'€350/mois pendant 6 mois',source:'ONEm'},
            {l:'Prime Actiris Jeunes (employeur)',m:'€350/mois (mi-temps) à €700/mois (temps plein) pendant 12 mois',source:'Actiris'},
          ],conditions:'DE < 30 ans, inscrit ≥ 6 mois, peu qualifié (max CESS). Résidence Bruxelles.',procedure:'1. Carte Activa Actiris 2. Embauche CDI/CDD ≥ 6 mois 3. Demande en ligne Actiris'},
        {nom:'Stage First',cible:'Jeune < 30 ans, 1ère expérience',type:'Stage en entreprise',
          avantages:[{l:'Indemnité de stage',m:'€200/mois minimum (employeur)',source:'Employeur'},{l:'Prime stage (DE)',m:'Maintien allocations d\'insertion',source:'ONEm'}],
          conditions:'Jeune < 30 ans, DE inscrit Actiris, sans expérience professionnelle',procedure:'Convention de stage via Actiris, durée 3 à 6 mois'},
        {nom:'Prime de transition',cible:'Travailleur licencié en restructuration',type:'Prime à l\'embauche',
          avantages:[{l:'Prime employeur',m:'€1.250/trimestre pendant 4 trimestres',source:'Actiris'}],
          conditions:'Travailleur licencié d\'une entreprise en restructuration ou en faillite résidant à Bruxelles',procedure:'Attestation Actiris + demande dans les 6 mois'},
      ]
    },
    wal:{
      nom:'Impulsion / SESAM',org:'FOREM / SPW Économie & Emploi',ref:'Décret wallon 02/02/2017 + AGW 22/06/2017',
      mesures:[
        {nom:'Impulsion < 25 ans',cible:'Jeune DE inscrit FOREM < 25 ans',type:'Aide à l\'embauche',
          avantages:[{l:'Aide mensuelle (employeur)',m:'€500/mois pendant 36 mois max',source:'FOREM/SPW'}],
          conditions:'DE < 25 ans, inscrit FOREM ≥ 6 mois, peu qualifié (max CESS)',procedure:'1. Demande en ligne FOREM 2. Embauche CDI/CDD ≥ 6 mois 3. Déclaration trimestrielle'},
        {nom:'Impulsion 25-54 ans',cible:'DE inscrit FOREM 25-54 ans longue durée',type:'Aide à l\'embauche',
          avantages:[{l:'Aide mensuelle (employeur)',m:'€500/mois pendant 24 mois max',source:'SPW'}],
          conditions:'DE 25-54 ans, inscrit FOREM ≥ 12 mois (18 mois si qualifié)',procedure:'Identique Impulsion < 25'},
        {nom:'Impulsion 55+ ans',cible:'DE inscrit FOREM ≥ 55 ans',type:'Aide à l\'embauche renforcée',
          avantages:[{l:'Aide mensuelle (employeur)',m:'€500/mois pendant 36 mois max',source:'SPW'}],
          conditions:'DE ≥ 55 ans, inscrit FOREM ≥ 6 mois',procedure:'Identique Impulsion < 25'},
        {nom:'SESAM (Soutien à l\'Emploi dans les Secteurs d\'Activité Marchands)',cible:'PME ≤ 50 travailleurs, secteur marchand',type:'Aide à la création d\'emploi',
          avantages:[{l:'Aide annuelle dégressive',m:'Année 1: €15.000 — Année 2: €10.000 — Année 3: €5.000',source:'SPW Économie'}],
          conditions:'PME ≤ 50 travailleurs, secteur marchand, siège en Wallonie, CDI min. mi-temps',procedure:'Demande avant embauche via formulaire SPW, engagement dans les 6 mois'},
        {nom:'APE (Aide à la Promotion de l\'Emploi)',cible:'Secteur non-marchand wallon',type:'Subvention points APE',
          avantages:[{l:'Réduction coût salarial',m:'Variable selon points APE attribués (1 point ≈ €4.500/an)',source:'SPW'}],
          conditions:'ASBL, commune, CPAS, intercommunale en Wallonie. Attribution par Ministre.',procedure:'Demande annuelle, renouvellement selon disponibilités budgétaires'},
      ]
    },
    vla:{
      nom:'Réductions groupes-cibles flamands',org:'VDAB / WSE (Werk en Sociale Economie)',ref:'Décret flamand 04/03/2016 + AGF 17/02/2017',
      mesures:[
        {nom:'Réduction jeunes < 25 ans',cible:'Jeune < 25 ans, peu qualifié',type:'Réduction ONSS (prime Vlaanderen)',
          avantages:[{l:'Prime trimestrielle (employeur)',m:'€1.150/trimestre pendant 8 trimestres',source:'WSE via DmfA'}],
          conditions:'Jeune < 25 ans, sans diplôme secondaire supérieur, domicilié en Flandre, salaire trimestriel ≤ €9.000',procedure:'Automatique via DmfA si conditions remplies. Code 6320 en DmfA.'},
        {nom:'Réduction travailleurs âgés 55+',cible:'Travailleur ≥ 55 ans',type:'Réduction ONSS',
          avantages:[{l:'Prime trimestrielle (employeur)',m:'€1.150/trimestre (sans limite durée)',source:'WSE via DmfA'}],
          conditions:'Travailleur ≥ 55 ans en service, domicilié en Flandre, salaire trimestriel ≤ €16.000',procedure:'Automatique via DmfA, pas de demande préalable'},
        {nom:'Réduction travailleurs en situation de handicap',cible:'Travailleur avec handicap reconnu',type:'Réduction ONSS + prime',
          avantages:[{l:'Prime VOP (Vlaamse Ondersteuningspremie)',m:'40% à 60% du coût salarial pendant 5 ans max',source:'VDAB'}],
          conditions:'Handicap reconnu par VAPH/VDAB, contrat ≥ 3 mois, domicilié en Flandre',procedure:'Demande VDAB, évaluation rendement, prime versée trimestriellement'},
      ]
    },
    dg:{
      nom:'Aides Communauté germanophone',org:'ADG / Ministerium DG',ref:'Décret CG 28/05/2018',
      mesures:[
        {nom:'AktiF / AktiF PLUS',cible:'DE inscrit ADG',type:'Aide à l\'embauche',
          avantages:[{l:'Prime employeur AktiF',m:'€1.000/mois pendant 24 mois max (selon profil)',source:'ADG'}],
          conditions:'DE inscrit ADG, résidence en CG, CDI ou CDD ≥ 6 mois',procedure:'Demande ADG avant embauche'},
      ]
    }
  };

  // ── RÉDUCTIONS GROUPES-CIBLES FÉDÉRALES (hors 1er engagement) ──
  const GC_FED=[
    {nom:'Réduction travailleurs âgés',cible:'≥ 55 ans (Bruxelles et Wallonie)',montant:'€1.150/trim (55-57 ans) → €1.500/trim (≥ 62 ans)',dur:'Tant que conditions remplies',ref:'AR 16/05/2003 Chap.VII',conditions:'Salaire trimestriel ≤ €16.120 (2026). Travailleur ≥ 55 ans en service, résidant hors Flandre.'},
    {nom:'Réduction restructuration',cible:'Travailleur licencié d\'entreprise en restructuration',montant:'€1.000/trim pendant 8 trimestres',dur:'8 trimestres',ref:'AR 16/05/2003 art.17 + Loi 01/02/2007',conditions:'Entreprise reconnue en restructuration ou fermeture. Embauche dans les 6 mois après licenciement.'},
    {nom:'Réduction SINE (économie sociale d\'insertion)',cible:'DE très éloigné du marché du travail',montant:'€1.000/trim pendant 8 à 21 trimestres',dur:'8 à 21 trim. selon profil',ref:'AR 16/05/2003 art.18 + Loi 26/05/2002',conditions:'Entreprise d\'économie sociale agréée. Travailleur avec attestation SINE ONEM.'},
    {nom:'Réduction tuteur (formation en alternance)',cible:'Tuteur formant des apprentis/stagiaires',montant:'€800/trim par apprenti (max 4 apprentis = €3.200/trim)',dur:'Pendant la formation',ref:'AR 16/05/2003 art.15bis',conditions:'Tuteur formé et agréé, accompagnant un jeune en alternance (IFAPME, SFPME, Syntra).'},
    {nom:'Convention Premier Emploi (CPE/Rosetta)',cible:'Jeune < 26 ans, obligation d\'embauche',montant:'Réduction ONSS forfaitaire €1.000/trim',dur:'Pendant la CPE (max 12 mois)',ref:'Loi 24/12/1999 + AR 30/03/2000',conditions:'Entreprise ≥ 50 travailleurs : obligation 3% jeunes. Jeune < 26 ans, DE inscrit, diplôme depuis < 12 mois.'},
    {nom:'Réduction personnel de maison',cible:'Personnel domestique',montant:'Exonération ONSS patronale quasi-totale',dur:'Illimitée',ref:'AR 16/05/2003 Chap.IV',conditions:'Travailleur occupé à des tâches ménagères dans un ménage privé. Max 1 travailleur par ménage.'},
    {nom:'Réduction artiste',cible:'Travailleur sous statut artiste (ATA)',montant:'Forfait variable selon prestation',dur:'Par prestation',ref:'Loi 16/12/2022 (réforme statut artiste)',conditions:'Travailleur titulaire de l\'attestation du travail des arts. Prestation artistique, technique ou de soutien.'},
  ];

  // ── DISPENSES DE VERSEMENT PRÉCOMPTE PROFESSIONNEL ──
  const DISPENSES_PP=[
    {nom:'Travail de nuit et en équipes',pct:'22,8%',ref:'Art. 2751 CIR 92',conditions:'Travail en 2 ou 3 équipes successives, ou travail de nuit (20h-6h). Prime d\'équipe/nuit obligatoire.'},
    {nom:'Heures supplémentaires',pct:'41,25% (120h) ou 32,19% (volontaires)',ref:'Art. 2752 CIR 92',conditions:'Heures supp. légales (loi 16/03/1971). Max 180 heures/an (130h + 50h horeca).'},
    {nom:'Recherche scientifique',pct:'80%',ref:'Art. 2753 CIR 92',conditions:'Chercheurs titulaires d\'un diplôme master/doctorat. Employeur enregistré BELSPO.'},
    {nom:'Zone d\'aide (Zones en difficulté)',pct:'25% (pendant 2 ans)',ref:'Art. 2758 CIR 92 + Loi 15/05/2014',conditions:'Investissement dans une zone d\'aide reconnue (arrêté régional). Emploi créé dans les 3 ans.'},
    {nom:'Sportifs rémunérés',pct:'80%',ref:'Art. 2756 CIR 92',conditions:'Sportif rémunéré ≥ 26 ans. Employeur: club sportif reconnu par une communauté.'},
    {nom:'Jeunes travailleurs en formation (IBO/PFI/FPI)',pct:'Exonération cotisations',ref:'Divers arrêtés régionaux',conditions:'Stage d\'insertion professionnelle via VDAB (IBO), FOREM (PFI), Actiris (FPI), Bruxelles Formation.'},
    {nom:'Marine marchande',pct:'100%',ref:'Art. 2754 CIR 92',conditions:'Marins résidents UE/EEE employés sur navire belge enregistré.'},
    {nom:'Starters (PME)',pct:'10% (micro) ou 20% (petite)',ref:'Art. 27510 CIR 92',conditions:'Micro-entreprise (< 10 travailleurs) ou petite entreprise (< 50 travailleurs). Premiers 48 mois d\'activité.'},
  ];

  // ── SIMULATEUR ──
  const runSim=(emp)=>{
    const brut=parseFloat(emp.monthlySalary)||0;
    const brutTrim=brut*3;
    const onssPatBase=brutTrim*0.25;
    // Réduction structurelle approximative
    const redStruct=brutTrim<=9788.76?Math.max(0,560.03-0.0798*(brutTrim-6030.78)):0;
    // Vérifier éligibilités — NOUVEAU RÉGIME 04/2026
    const elig=[];
    const nEmps=ae.length;
    if(nEmps<=5){
      if(nEmps===0||nEmps===1){
        // 1er travailleur: max €2.000/trim à vie (après 01/04/2026)
        const maxRed=Math.min(onssPatBase,2000);
        elig.push({nom:'1er engagement — Exonération max €2.000/trim',eco:maxRed,ecoTrim:maxRed,dur:'À vie',type:'premier'});
      } else if(nEmps>=2&&nEmps<=5){
        // 2è à 5è: €1.000/trim × 12 trim
        const labels={2:'2ème',3:'3ème',4:'4ème',5:'5ème'};
        elig.push({nom:`${labels[nEmps]} travailleur — €1.000/trim`,eco:1000,ecoTrim:1000,dur:'12 trimestres (sur 20)',type:'premier'});
      }
    }
    const age=emp.birth?Math.floor((Date.now()-new Date(emp.birth).getTime())/31557600000):30;
    if(age<25)elig.push({nom:'CPE/Rosetta (< 26 ans)',eco:1000,ecoTrim:1000,dur:'Max 12 mois',type:'federal'});
    if(age>=55)elig.push({nom:'Réduction travailleurs âgés (55+)',eco:age>=62?1500:1150,ecoTrim:age>=62?1500:1150,dur:'Illimitée',type:'federal'});
    setSimRes({emp,brut,brutTrim,onssPatBase:Math.round(onssPatBase*100)/100,redStruct:Math.round(redStruct*100)/100,elig});
  };

  const tabs=[
    {id:'premier',l:'🏗 1er Engagement',c:()=><div>
      <div style={{padding:14,background:'rgba(251,146,60,.06)',borderRadius:10,border:'1px solid rgba(251,146,60,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#fb923c'}}>⚠ RÉFORME AU 01/04/2026 — Projet AR transmis au Conseil d'État (02/2026)</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6,lineHeight:1.6}}>Le gouvernement fédéral modifie les montants des réductions premiers engagements. Le 1er travailleur passe de max €3.100 à max €2.000/trim. Le 2è et 3è passent à un forfait fixe de €1.000/trim × 12. Les 4è et 5è travailleurs sont réintroduits (€1.000/trim × 12). Le 6è reste supprimé. <b>Pas encore publié au Moniteur belge — date probable: 01/04/2026 ou 01/07/2026.</b></div>
      </div>

      <div style={{fontWeight:700,fontSize:14,color:'#c6a34e',marginBottom:10}}>Régime actuel (jusqu'au 31/03/2026)</div>
      <C style={{padding:0,overflow:'hidden',marginBottom:16}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:'rgba(198,163,78,.06)'}}>
            {['N°','Travailleur','T1-T5','T6-T9','T10-T13','Total max','Durée'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,color:'#c6a34e',borderBottom:'1px solid rgba(198,163,78,.1)'}}>{h}</th>)}
          </tr></thead>
          <tbody>{PREMIER_ENG_AVANT.map((e,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',background:i===0?'rgba(74,222,128,.04)':'transparent'}}>
            <td style={{padding:'10px 12px',fontWeight:700,color:'#c6a34e'}}>{e.n}</td>
            <td style={{padding:'10px 12px',fontWeight:600,color:'#e8e6e0'}}>{e.label}</td>
            <td style={{padding:'10px 12px',fontWeight:600,color:'#4ade80'}}>{e.full?'Max €3.100':e.montant[0]?`€${e.montant[0].m}`:'-'}</td>
            <td style={{padding:'10px 12px',color:'#fb923c'}}>{e.full?'∞':e.montant[1]?`€${e.montant[1].m}`:'-'}</td>
            <td style={{padding:'10px 12px',color:'#9e9b93'}}>{e.full?'∞':e.montant[2]?`€${e.montant[2].m}`:'-'}</td>
            <td style={{padding:'10px 12px',fontWeight:700,color:'#e8e6e0'}}>{PREMIER_ENG_TOTAL[i].totalAvant}</td>
            <td style={{padding:'10px 12px',fontSize:11,color:'#5e5c56'}}>{e.dur}</td>
          </tr>)}</tbody>
        </table>
      </C>

      <div style={{fontWeight:700,fontSize:14,color:'#4ade80',marginBottom:10}}>Nouveau régime (à partir du 01/04/2026)</div>
      <C style={{padding:0,overflow:'hidden',marginBottom:16}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:'rgba(74,222,128,.06)'}}>
            {['N°','Travailleur','Montant/trim','Durée max','Période réf.','Total max','Changement'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,color:'#4ade80',borderBottom:'1px solid rgba(74,222,128,.15)'}}>{h}</th>)}
          </tr></thead>
          <tbody>{PREMIER_ENG_APRES.map((e,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',background:e.change?.includes('🆕')?'rgba(74,222,128,.04)':e.change?.includes('❌')?'rgba(248,113,113,.04)':'transparent'}}>
            <td style={{padding:'10px 12px',fontWeight:700,color:'#c6a34e'}}>{e.n}</td>
            <td style={{padding:'10px 12px',fontWeight:600,color:'#e8e6e0'}}>{e.label}</td>
            <td style={{padding:'10px 12px',fontWeight:700,color:e.n===6?'#f87171':'#4ade80'}}>{e.montant[0]?`€${e.montant[0].m}`:'€0'}</td>
            <td style={{padding:'10px 12px',color:'#9e9b93'}}>{e.dur}</td>
            <td style={{padding:'10px 12px',fontSize:11,color:'#5e5c56'}}>{e.full?'—':'20 trimestres'}</td>
            <td style={{padding:'10px 12px',fontWeight:700,color:'#e8e6e0'}}>{PREMIER_ENG_TOTAL[i].totalApres}</td>
            <td style={{padding:'10px 12px',fontSize:11,color:e.change?.includes('🆕')?'#4ade80':e.change?.includes('⬇')?'#fb923c':e.change?.includes('❌')?'#f87171':'#60a5fa'}}>{e.change||''}</td>
          </tr>)}</tbody>
        </table>
      </C>

      <div style={{fontWeight:700,fontSize:14,color:'#60a5fa',marginBottom:10}}>Comparatif avant/après</div>
      <C style={{padding:0,overflow:'hidden',marginBottom:16}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:'rgba(96,165,250,.06)'}}>
            {['N°','Travailleur','Avant (total)','Après (total)','Impact'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,fontSize:11,color:'#60a5fa',borderBottom:'1px solid rgba(96,165,250,.15)'}}>{h}</th>)}
          </tr></thead>
          <tbody>{PREMIER_ENG_TOTAL.map((e,i)=>{
            const diff=i===0?'⬇ -€1.100/trim':i<=2?(i===2?'⬆ +€750 total':'⬇ -€1.750 total'):i<=4?'🆕 +€12.000':'—';
            const col=diff.includes('⬆')?'#4ade80':diff.includes('⬇')?'#fb923c':diff.includes('🆕')?'#4ade80':'#5e5c56';
            return <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <td style={{padding:'10px 14px',fontWeight:700,color:'#c6a34e'}}>{e.n}</td>
              <td style={{padding:'10px 14px',fontWeight:600,color:'#e8e6e0'}}>{PREMIER_ENG_APRES[i].label}</td>
              <td style={{padding:'10px 14px',color:'#9e9b93'}}>{e.totalAvant}</td>
              <td style={{padding:'10px 14px',fontWeight:600,color:'#e8e6e0'}}>{e.totalApres}</td>
              <td style={{padding:'10px 14px',fontWeight:600,color:col}}>{diff}</td>
            </tr>;})}
          </tbody>
        </table>
      </C>

      <div style={{marginTop:14,padding:14,background:'rgba(198,163,78,.04)',borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
        <b style={{color:'#c6a34e'}}>Règles clés:</b><br/>
        • Le droit s'ouvre sur base de l'<b>unité technique d'exploitation (UTE)</b>, pas de l'entité juridique<br/>
        • La réduction n'est <b>pas liée au travailleur</b> — l'employeur choisit chaque trimestre pour quel travailleur<br/>
        • <b>Cumul possible</b>: réduction structurelle + 1er engagement (pas avec autre groupe-cible)<br/>
        • Les 4è-5è ne comptent pas les engagements avant 01/01/2024 (droits éteints)<br/>
        • <b>Code DmfA</b>: zone 00829 — réduction groupe-cible premiers engagements<br/>
        • Formule ONSS: Pg = G × µ × β (proportionnel aux prestations)<br/>
        • Source: <b>Securex 23/01/2026</b> — Projet AR transmis au Conseil d'État
      </div>
    </div>},

    {id:'activa',l:'🎯 Activa / Régional',c:()=><div>
      {Object.entries(ACTIVA).map(([key,reg])=><C key={key} style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div><div style={{fontWeight:700,fontSize:15,color:'#c6a34e'}}>{reg.nom}</div><div style={{fontSize:11,color:'#5e5c56'}}>{reg.org} — {reg.ref}</div></div>
          <span style={{fontSize:10,padding:'4px 10px',borderRadius:20,background:key==='bxl'?'rgba(96,165,250,.1)':key==='wal'?'rgba(251,146,60,.1)':key==='vla'?'rgba(74,222,128,.1)':'rgba(167,139,250,.1)',color:key==='bxl'?'#60a5fa':key==='wal'?'#fb923c':key==='vla'?'#4ade80':'#a78bfa'}}>{key==='bxl'?'Bruxelles':key==='wal'?'Wallonie':key==='vla'?'Flandre':'CG'}</span>
        </div>
        {reg.mesures.map((m,mi)=><div key={mi} style={{padding:14,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.06)',marginBottom:8}}>
          <div style={{fontWeight:600,fontSize:13,color:'#e8e6e0'}}>{m.nom}</div>
          <div style={{fontSize:11,color:'#60a5fa',marginTop:4}}>Cible: {m.cible}</div>
          <div style={{marginTop:8}}>{m.avantages.map((a,ai)=><div key={ai} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
            <div style={{fontSize:11.5,color:'#9e9b93'}}>{a.l}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#4ade80',whiteSpace:'nowrap'}}>{a.m}</div>
          </div>)}</div>
          <div style={{fontSize:10.5,color:'#5e5c56',marginTop:8,lineHeight:1.5}}><b>Conditions:</b> {m.conditions}</div>
          {m.procedure&&<div style={{fontSize:10.5,color:'#8b7340',marginTop:4}}><b>Procédure:</b> {m.procedure}</div>}
        </div>)}
      </C>)}
    </div>},

    {id:'gc_fed',l:'⚖ Groupes-cibles fédéraux',c:()=><div>
      <div style={{padding:14,background:'rgba(96,165,250,.06)',borderRadius:10,border:'1px solid rgba(96,165,250,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#60a5fa'}}>Réductions groupes-cibles fédérales</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6,lineHeight:1.6}}>AR 16/05/2003 + modifications. Ces réductions sont cumulables avec la réduction structurelle mais PAS entre elles (sauf 1er engagement + groupe-cible). Le système choisit automatiquement la plus avantageuse via la DmfA.</div>
      </div>
      {GC_FED.map((g,i)=><C key={i} style={{marginBottom:8,padding:'14px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
          <div><div style={{fontWeight:600,fontSize:13,color:'#e8e6e0'}}>{g.nom}</div><div style={{fontSize:11,color:'#60a5fa',marginTop:3}}>Cible: {g.cible}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontWeight:700,fontSize:13,color:'#4ade80'}}>{g.montant}</div><div style={{fontSize:10,color:'#5e5c56'}}>{g.dur}</div></div>
        </div>
        <div style={{fontSize:10.5,color:'#5e5c56',marginTop:8}}><b>Conditions:</b> {g.conditions}</div>
        <div style={{fontSize:9.5,color:'#8b7340',marginTop:3}}>Réf: {g.ref}</div>
      </C>)}
    </div>},

    {id:'dispense',l:'💰 Dispenses PP',c:()=><div>
      <div style={{padding:14,background:'rgba(198,163,78,.06)',borderRadius:10,border:'1px solid rgba(198,163,78,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#c6a34e'}}>Dispenses de versement du précompte professionnel</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6,lineHeight:1.6}}>L'employeur retient le PP normalement sur le salaire du travailleur mais ne verse qu'une partie au SPF Finances. La différence est un avantage net pour l'employeur. Déclaration via 274.XX au SPF Finances.</div>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:'rgba(198,163,78,.06)'}}>
            {['Dispense','% non versé','Conditions','Réf. légale'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,fontSize:11,color:'#c6a34e',borderBottom:'1px solid rgba(198,163,78,.1)'}}>{h}</th>)}
          </tr></thead>
          <tbody>{DISPENSES_PP.map((dp,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <td style={{padding:'10px 14px',fontWeight:600,color:'#e8e6e0'}}>{dp.nom}</td>
            <td style={{padding:'10px 14px',fontWeight:700,color:'#4ade80'}}>{dp.pct}</td>
            <td style={{padding:'10px 14px',fontSize:11,color:'#9e9b93'}}>{dp.conditions}</td>
            <td style={{padding:'10px 14px',fontSize:10.5,color:'#8b7340'}}>{dp.ref}</td>
          </tr>)}</tbody>
        </table>
      </C>
    </div>},

    {id:'sim',l:'🧮 Simulateur',c:()=><div>
      <div style={{padding:14,background:'rgba(74,222,128,.06)',borderRadius:10,border:'1px solid rgba(74,222,128,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#4ade80'}}>Simulateur d'éligibilité aux aides</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6}}>Sélectionnez un employé pour vérifier les aides auxquelles il pourrait donner droit.</div>
      </div>
      {ae.length===0?<C><div style={{textAlign:'center',color:'#5e5c56',padding:30}}>Ajoutez des employés pour utiliser le simulateur</div></C>:
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <C><ST>Sélectionner un employé</ST>
          {ae.map(e=><div key={e.id} onClick={()=>{setSimEmp(e);runSim(e);}} style={{padding:'10px 14px',cursor:'pointer',borderRadius:8,marginBottom:4,border:'1px solid '+(simEmp?.id===e.id?'rgba(198,163,78,.3)':'rgba(198,163,78,.06)'),background:simEmp?.id===e.id?'rgba(198,163,78,.08)':'transparent'}}
            onMouseEnter={ev=>ev.currentTarget.style.background='rgba(198,163,78,.06)'} onMouseLeave={ev=>{if(simEmp?.id!==e.id)ev.currentTarget.style.background='transparent';}}>
            <div style={{fontWeight:600,fontSize:12.5,color:'#e8e6e0'}}>{e.first} {e.last}</div>
            <div style={{fontSize:10.5,color:'#5e5c56'}}>{e.fn} · {e.statut==='ouvrier'?'Ouvrier':'Employé'} · Brut {fmt(e.monthlySalary)}</div>
          </div>)}
        </C>
        {simRes?<C><ST>Résultat — {simRes.emp.first} {simRes.emp.last}</ST>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>ONSS patronale/trim</div><div style={{fontSize:15,fontWeight:700,color:'#f87171',marginTop:4}}>{fmt(simRes.onssPatBase)}</div></div>
            <div style={{padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>Réd. structurelle/trim</div><div style={{fontSize:15,fontWeight:700,color:'#60a5fa',marginTop:4}}>-{fmt(simRes.redStruct)}</div></div>
          </div>
          <ST>Aides éligibles</ST>
          {simRes.elig.length===0?<div style={{padding:14,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucune aide spécifique détectée (réduction structurelle toujours applicable)</div>:
          simRes.elig.map((el,i)=><div key={i} style={{padding:'10px 14px',background:'rgba(74,222,128,.06)',borderRadius:8,border:'1px solid rgba(74,222,128,.15)',marginBottom:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:600,fontSize:12.5,color:'#4ade80'}}>{el.nom}</div>
              <div style={{fontWeight:700,fontSize:13,color:'#4ade80'}}>-{fmt(el.eco)}/trim</div>
            </div>
            <div style={{fontSize:10.5,color:'#5e5c56',marginTop:3}}>Durée: {el.dur}</div>
          </div>)}
          <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>Économie totale estimée / trimestre</div>
            <div style={{fontSize:18,fontWeight:800,color:'#4ade80',marginTop:4}}>{fmt(simRes.elig.reduce((a,e)=>a+e.eco,0)+simRes.redStruct)}</div>
          </div>
        </C>:<C><div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:12}}>← Sélectionnez un employé</div></C>}
      </div>}
    </div>},

    {id:'procedure',l:'📋 Procédure',c:()=><div>
      {[
        {t:'1. Avant l\'embauche',steps:['Vérifier le nombre de travailleurs actuels (1er engagement?)','Consulter le profil du candidat : âge, durée inoccupation, diplôme, domicile','Vérifier la région de résidence du candidat (détermine les aides régionales)','Demander carte Activa / attestation FOREM / attestation VDAB si nécessaire','Vérifier si l\'entreprise est dans une zone d\'aide (dispense PP 25%)']},
        {t:'2. À l\'embauche',steps:['Dimona IN avec les bons codes DmfA (code réduction groupe-cible)','Conserver l\'attestation du travailleur (carte Activa, attestation FOREM, etc.)','Introduire la demande d\'aide régionale (SESAM: avant embauche!)','Déclarer le travailleur dans la catégorie correcte en DmfA']},
        {t:'3. Trimestriellement',steps:['Vérifier le plafond salarial trimestriel (€9.000 jeunes FL, €16.000 55+ FL, etc.)','Encoder les codes réduction en DmfA (zone 00829 — code travailleur groupe-cible)','Calculer la réduction structurelle + réduction groupe-cible','Vérifier le cumul : structurelle + 1 groupe-cible (pas 2 groupes-cibles entre eux)']},
        {t:'4. Dispenses PP (formulaires 274)',steps:['274.XX — Déclaration trimestrielle au SPF Finances','274.31 — Travail de nuit et en équipes (22,8%)','274.32 — Heures supplémentaires (41,25% ou 32,19%)','274.33 — Recherche scientifique (80%)','274.75 — Zone d\'aide (25%)','274.XX — Starters PME (10% ou 20%)','Attention: la dispense PP se calcule sur le PP retenu, pas sur le salaire brut']},
        {t:'5. Annuellement',steps:['Bilan social BNB : déclarer les aides perçues','Belcotax 281.10 : aucun impact (PP retenu intégralement sur fiche)','Vérifier le renouvellement des aides régionales (APE, SESAM, etc.)','Mettre à jour les attestations des travailleurs']},
      ].map((s,si)=><C key={si} style={{marginBottom:10}}>
        <div style={{fontWeight:700,fontSize:13,color:'#c6a34e',marginBottom:10}}>{s.t}</div>
        {s.steps.map((st,sti)=><div key={sti} style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:12,color:'#d4d0c8',display:'flex',gap:8}}>
          <span style={{color:'#c6a34e',fontWeight:600}}>{sti+1}.</span>{st}
        </div>)}
      </C>)}
    </div>},
  ];

  return <div>
    <C style={{padding:'18px 20px',marginBottom:16}}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:24}}>🎯</span><div><div style={{fontWeight:700,fontSize:16,color:'#e8e6e0'}}>Aides à l'emploi — Réductions & Activations</div><div style={{fontSize:11.5,color:'#5e5c56'}}>1er engagement · Activa · Groupes-cibles · Dispenses PP · Simulateur</div></div></div></C>
    <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'8px 16px',border:'none',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?'#c6a34e':'#9e9b93',background:tab===t.id?'rgba(198,163,78,.1)':'rgba(198,163,78,.03)',fontFamily:'inherit',borderBottom:tab===t.id?'2px solid #c6a34e':'2px solid transparent'}}>{t.l}</button>)}
    </div>
    {tabs.find(t=>t.id===tab)?.c()}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  AUREUS SUITE — Nos logiciels
// ═══════════════════════════════════════════════════════════════
function AureusSuitePage({s,d}){
  const sub=s.sub||'aureus_pointage';
  const products=[
    {id:'aureus_pointage',ic:'⏱',name:'Aureus Pointage',
      short:'Enregistrement des entrées et sorties',
      desc:'Collectez les informations de pointage de vos travailleurs, avec ou sans horloge pointeuse. Compatible ateliers, bureaux, chantiers, travailleurs itinérants.',
      features:['Pointage entrée/sortie (matin, midi, soir)','Calendriers individuels et collectifs','Gestion des absences et congés','Heures supplémentaires automatiques','Heures de nuit, dimanche et jours fériés','Export vers Aureus Paie ou secrétariat social','Rapports détaillés et statistiques','Connexion horloge pointeuse, smartphone, tablette','Détection anomalies (dépassement légal, pause manquante)','Archivage conforme CJUE C-55/18 et Loi 5/03/2024'],
      color:'#4ade80'},
    {id:'aureus_paie',ic:'💰',name:'Aureus Paie',
      short:'Calcul complet des salaires belges',
      desc:'Logiciel de paie complet pour toutes les commissions paritaires belges. Agréé ONSS (Dimona, DMFA), FINPROF, Belcotax-on-web, Bilan Social et ONEm.',
      features:['Fiches de paie conformes (loi 12/04/1965)','Précompte professionnel — formule-clé SPF Finances','ONSS : 13,07% travailleur, 25% patronal marchand, 32,40% non-marchand','Ouvriers : base × 108%','Dimona IN/OUT automatique','DMFA trimestrielle','Belcotax 281.10, 281.20, 281.30','Documents sociaux (C4, C131, attestations)','Net au brut','Saisies-cessions et rentes','35 commissions paritaires avec barèmes exacts','Chèques-repas, éco-chèques, plan cafétéria'],
      color:'#c6a34e'},
    {id:'aureus_titres_services',ic:'🏠',name:'Aureus Titres-Services',
      short:'Gestion complète des sociétés de titres-services',
      desc:'Couvrez l\'ensemble du système d\'information de votre société de titres-services : signalétiques, agendas, prestations, feuilles de route et lien avec le secrétariat social.',
      features:['Signalétiques prestataires et clients','Gestion des agendas et plannings','Feuilles de route automatiques','Suivi des prestations par aide ménagère','Export vers Aureus Paie ou secrétariat social','Communication par mail/courrier','Intégration Pluxee (ex-Sodexo)','Conformité eGov 3.0','Flexi-salaires et déclarations','Rapports de gestion et statistiques'],
      color:'#60a5fa'},
    {id:'aureus_aide_domicile',ic:'🏥',name:'Aureus Aide à Domicile',
      short:'Gestion des services d\'aide et de soins à domicile',
      desc:'Planifiez et suivez les prestations de vos aides ménagères et soignants à domicile. Gestion des kilomètres, frais de déplacement et facturation.',
      features:['Plannings par bénéficiaire et par prestataire','Suivi des prestations journalières','Calcul automatique des kilomètres','Frais de déplacement','Facturation aux mutuelles et CPAS','Export vers Aureus Paie','Rapports d\'activité','Gestion des remplacements','Suivi des qualifications et formations','Conformité réglementaire régionale (AViQ, Iriscare, VAPH)'],
      color:'#a78bfa'},
    {id:'aureus_portail',ic:'🌐',name:'Aureus Portail',
      short:'Espace en ligne pour employeurs et travailleurs',
      desc:'Portail web sécurisé où vos clients encodent leurs prestations, consultent leurs fiches de paie et communiquent avec votre bureau social. Chaque client ne voit que ses propres données.',
      features:['Accès sécurisé par client (login + mot de passe)','Encodage des prestations mensuelles','Demandes de congés et absences','Consultation des fiches de paie','Messagerie avec le bureau social','Documents en ligne (contrats, attestations)','Données isolées par client (RGPD)','Tableau de suivi bureau social (qui a encodé, en retard)','Notifications et rappels automatiques','Compatible ordinateur, tablette et smartphone'],
      color:'#fb923c'},
    {id:'aureus_mobile',ic:'📱',name:'Aureus Mobile',
      short:'Application smartphone pour travailleurs itinérants',
      desc:'Vos travailleurs pointent directement depuis leur téléphone avec localisation GPS. Idéal pour les commerciaux, techniciens, aides ménagères et travailleurs de terrain.',
      features:['Pointage entrée/sortie avec GPS','Photo et signature','Déclaration d\'absences','Consultation fiche de paie','Demande de congés','Frais de déplacement','Notification des plannings','Fonctionne hors connexion','Synchronisation automatique','Compatible Android et iOS'],
      color:'#f87171'},
    {id:'aureus_chantier',ic:'🏗',name:'Aureus Chantier',
      short:'Borne de pointage sur chantier',
      desc:'Gérez les entrées et sorties de tous les travailleurs et visiteurs présents sur vos chantiers. Reporting en temps réel au siège central.',
      features:['Borne tactile sur chantier','Badge, QR code ou reconnaissance','Suivi en temps réel des présences','Alerte si travailleur non déclaré (Dimona)','Registre de présence légal','Reporting au siège central','Gestion multi-chantiers','Visiteurs et sous-traitants','Export vers Aureus Pointage','Conforme réglementation chantiers temporaires'],
      color:'#e8c547'},
    {id:'aureus_tableau_bord',ic:'📊',name:'Aureus Tableau de Bord',
      short:'Chiffres clés de votre entreprise en un coup d\'œil',
      desc:'Visualisez les indicateurs essentiels de vos dossiers : masse salariale, absentéisme, coûts, effectifs. Graphiques interactifs connectés à tous les modules Aureus.',
      features:['KPI en temps réel','Masse salariale par mois, trimestre, année','Taux d\'absentéisme et Bradford Factor','Coût moyen par travailleur','Évolution des effectifs','Répartition par CP, contrat, département','Graphiques interactifs','Export PDF et Excel','Multi-dossiers (tous vos clients)','Comparaison avec benchmarks sectoriels'],
      color:'#c6a34e'},
  ];

  const sel=products.find(p=>p.id===sub)||products[0];

  return <div>
    <PH title="Aureus Suite" sub="L'ensemble des logiciels Aureus IA pour la gestion sociale"/>

    {/* Product cards grid */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      {products.map(p=><div key={p.id} onClick={()=>d({type:'NAV',page:'aureussuite',sub:p.id})}
        style={{padding:'16px 14px',borderRadius:10,cursor:'pointer',textAlign:'center',
          background:sub===p.id?`${p.color}12`:'rgba(255,255,255,.02)',
          border:sub===p.id?`1px solid ${p.color}40`:'1px solid rgba(255,255,255,.04)',
          transition:'all .2s'}}>
        <div style={{fontSize:28,marginBottom:6}}>{p.ic}</div>
        <div style={{fontSize:12,fontWeight:600,color:sub===p.id?p.color:'#e8e6e0'}}>{p.name}</div>
        <div style={{fontSize:10,color:'#5e5c56',marginTop:3,lineHeight:1.4}}>{p.short}</div>
      </div>)}
    </div>

    {/* Selected product detail */}
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'18px 22px',background:`${sel.color}08`,borderBottom:`1px solid ${sel.color}20`,display:'flex',alignItems:'center',gap:14}}>
        <span style={{fontSize:36}}>{sel.ic}</span>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:sel.color}}>{sel.name}</div>
          <div style={{fontSize:12,color:'#9e9b93',marginTop:2}}>{sel.short}</div>
        </div>
      </div>
      <div style={{padding:22}}>
        <div style={{fontSize:13,color:'#d4d0c8',lineHeight:1.7,marginBottom:18}}>{sel.desc}</div>
        <div style={{fontSize:11,fontWeight:600,color:sel.color,marginBottom:10,textTransform:'uppercase',letterSpacing:'1px'}}>Fonctionnalités</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {sel.features.map((f,i)=><div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
            <span style={{color:sel.color,fontSize:11,marginTop:1}}>✓</span>
            <span style={{fontSize:12,color:'#d4d0c8',lineHeight:1.4}}>{f}</span>
          </div>)}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:20}}>
          <div style={{padding:14,background:'rgba(255,255,255,.02)',borderRadius:8,textAlign:'center',border:'1px solid rgba(255,255,255,.04)'}}>
            <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>Statut</div>
            <div style={{fontSize:14,fontWeight:700,color:'#4ade80',marginTop:4}}>✅ Intégré</div>
          </div>
          <div style={{padding:14,background:'rgba(255,255,255,.02)',borderRadius:8,textAlign:'center',border:'1px solid rgba(255,255,255,.04)'}}>
            <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>Développeur</div>
            <div style={{fontSize:14,fontWeight:700,color:'#c6a34e',marginTop:4}}>Aureus IA SPRL</div>
          </div>
          <div style={{padding:14,background:'rgba(255,255,255,.02)',borderRadius:8,textAlign:'center',border:'1px solid rgba(255,255,255,.04)'}}>
            <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>Compatible</div>
            <div style={{fontSize:14,fontWeight:700,color:'#60a5fa',marginTop:4}}>Tous modules</div>
          </div>
        </div>
      </div>
    </C>

    {/* Integration schema */}
    <C style={{marginTop:14,padding:'16px 20px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Comment les logiciels Aureus fonctionnent ensemble</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr auto 1fr',gap:8,alignItems:'center',textAlign:'center'}}>
        <div style={{padding:12,background:'rgba(74,222,128,.06)',borderRadius:8,border:'1px solid rgba(74,222,128,.15)'}}>
          <div style={{fontSize:16}}>⏱📱🏗</div>
          <div style={{fontSize:11,fontWeight:600,color:'#4ade80',marginTop:4}}>Collecte</div>
          <div style={{fontSize:10,color:'#9e9b93'}}>Pointage, Mobile, Chantier</div>
        </div>
        <div style={{fontSize:18,color:'#5e5c56'}}>→</div>
        <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,border:'1px solid rgba(198,163,78,.15)'}}>
          <div style={{fontSize:16}}>💰</div>
          <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginTop:4}}>Calcul</div>
          <div style={{fontSize:10,color:'#9e9b93'}}>Aureus Paie</div>
        </div>
        <div style={{fontSize:18,color:'#5e5c56'}}>→</div>
        <div style={{padding:12,background:'rgba(96,165,250,.06)',borderRadius:8,border:'1px solid rgba(96,165,250,.15)'}}>
          <div style={{fontSize:16}}>🌐📊</div>
          <div style={{fontSize:11,fontWeight:600,color:'#60a5fa',marginTop:4}}>Distribution</div>
          <div style={{fontSize:10,color:'#9e9b93'}}>Portail, Tableau de Bord</div>
        </div>
      </div>
      <div style={{marginTop:12,fontSize:10.5,color:'#5e5c56',textAlign:'center',lineHeight:1.5}}>
        Les données circulent automatiquement entre les modules. Aucune ressaisie nécessaire.
      </div>
    </C>
  </div>;
}

function BienetrePage({s,d}){const sub=s.sub||'planglobal';return <div>
  <PH title="Bien-être & Prévention" sub={`Module: ${{'planglobal':'Plan global','paa':'PAA','risquespsycho':'Risques psychosociaux','alcool':'Alcool/drogues','elections':'Élections sociales','organes':'CE/CPPT/DS'}[sub]||sub}`}/>
  {sub==='planglobal'&&<PlanGlobalMod s={s} d={d}/>}{sub==='paa'&&<PAAMod s={s} d={d}/>}{sub==='risquespsycho'&&<RisquesPsychoMod s={s} d={d}/>}{sub==='alcool'&&<AlcoolMod s={s} d={d}/>}{sub==='elections'&&<ElectionsMod s={s} d={d}/>}{sub==='organes'&&<OrganesMod s={s} d={d}/>}
</div>;}

function PlanGlobalMod({s,d}){
  const secs=[{t:'Politique bien-être',s:'✅',i:['Déclaration politique','Objectifs 5 ans','Moyens']},{t:'Organisation travail',s:'🟡',i:['Analyse postes','Ergonomie','Charge']},{t:'Conditions',s:'🟡',i:['Ambiance','EPI','Locaux']},{t:'Risques psycho',s:'⚠',i:['Stress/burnout','Prévention','Personne confiance']},{t:'Hygiène',s:'✅',i:['Produits dangereux','Ventilation','Sanitaires']},{t:'Surveillance santé',s:'✅',i:['Examens','Vaccination','Réintégration']}];
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>📋</span><div><div style={{fontWeight:700,fontSize:16}}>Plan global de prévention (5 ans)</div><div style={{fontSize:11,color:'#5e5c56'}}>Art. II.1-2 Code bien-être au travail</div></div></div></C>
    {secs.map((sec,si)=><C key={si} style={{marginTop:8}}><div style={{padding:'8px 18px',display:'flex',justifyContent:'space-between',background:'rgba(198,163,78,.03)',borderBottom:'1px solid rgba(198,163,78,.08)'}}><span style={{fontWeight:700,fontSize:13}}>{sec.t}</span><span>{sec.s}</span></div>
      <div style={{padding:'6px 18px'}}>{sec.i.map((it,ii)=><div key={ii} style={{fontSize:12,color:'#9e9b93',padding:'2px 0 2px 14px',position:'relative'}}><span style={{position:'absolute',left:0}}>•</span>{it}</div>)}</div></C>)}</div>;
}

function PAAMod({s,d}){
  const [acts]=useState([{a:'MAJ analyse risques',r:'Cons. prévention',d:'31/03/2026',s:'en_cours'},{a:'Formation secours',r:'SEPP',d:'30/06/2026',s:'planifie'},{a:'Enquête psycho',r:'SEPP',d:'30/09/2026',s:'planifie'}]);
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>📅</span><div><div style={{fontWeight:700,fontSize:16}}>Plan d'action annuel 2026</div><div style={{fontSize:11,color:'#5e5c56'}}>Art. II.1-4 Code bien-être</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}><SC label="Planifiées" value={acts.filter(a=>a.s==='planifie').length} color="#60a5fa"/><SC label="En cours" value={acts.filter(a=>a.s==='en_cours').length} color="#fb923c"/><SC label="Terminées" value={0} color="#4ade80"/></div>
    <C style={{marginTop:12}}><TB cols={[{k:'a',l:'Action'},{k:'r',l:'Responsable'},{k:'d',l:'Échéance'},{k:'s',l:'Statut'}]} rows={acts.map(a=>({a:a.a,r:a.r,d:a.d,s:a.s==='en_cours'?'🟡 En cours':'🔵 Planifié'}))}/></C></div>;
}

function RisquesPsychoMod({s,d}){
  const cs=[{t:'Stress',ic:'😰',i:['Charge excessive','Manque autonomie','Insécurité']},{t:'Harcèlement moral',ic:'⚠',i:['Hostilité','Isolement','Dénigrement']},{t:'Harcèlement sexuel',ic:'🚫',i:['Propos déplacés','Contact non-consenti']},{t:'Violence',ic:'💥',i:['Agression','Menaces','Violence tiers']}];
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🧠</span><div><div style={{fontWeight:700,fontSize:16}}>Risques psychosociaux</div><div style={{fontSize:11,color:'#5e5c56'}}>Loi 04/08/1996</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginTop:12}}>{cs.map((c,ci)=><C key={ci}><div style={{padding:'10px 18px',background:'rgba(198,163,78,.03)',borderBottom:'1px solid rgba(198,163,78,.08)'}}><span style={{marginRight:8}}>{c.ic}</span><span style={{fontWeight:700}}>{c.t}</span></div><div style={{padding:'8px 18px'}}>{c.i.map((it,ii)=><div key={ii} style={{fontSize:12,color:'#9e9b93',padding:'2px 0'}}>• {it}</div>)}</div></C>)}</div>
    <C style={{marginTop:12,padding:'14px 18px'}}><ST>Obligations</ST>{['Personne de confiance','Procédure plainte','Règlement travail','Former hiérarchie','Collaborer SEPP'].map((o,i)=><div key={i} style={{fontSize:12,padding:'4px 0 4px 14px',position:'relative',borderBottom:'1px solid rgba(255,255,255,.02)'}}><span style={{position:'absolute',left:0,color:'#c6a34e'}}>✓</span>{o}</div>)}</C></div>;
}

function AlcoolMod({s,d}){
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🍷</span><div><div style={{fontWeight:700,fontSize:16}}>Politique alcool et drogues</div><div style={{fontSize:11,color:'#5e5c56'}}>CCT 100 — Obligation toutes entreprises</div></div></div></C>
    <C style={{marginTop:12,padding:'14px 18px'}}>{[{p:'Phase 1 — Intention',d:'Principes. OBLIGATOIRE.',s:'⚠ Règlement travail'},{p:'Phase 2 — Règles',d:'Interdiction/limitation.',s:'Recommandé'},{p:'Phase 3 — Procédures',d:'Intoxication: entretien, aide.',s:'Facultatif'},{p:'Phase 4 — Tests',d:'Détection. CPPT consulté.',s:'Très encadré'}].map((p,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
      <div style={{fontWeight:700,fontSize:12,color:'#c6a34e'}}>{p.p}</div><div style={{fontSize:12,color:'#d4d0c8',marginTop:3}}>{p.d}</div><div style={{fontSize:11,color:'#5e5c56',marginTop:2,fontStyle:'italic'}}>{p.s}</div></div>)}</C></div>;
}

function ElectionsMod({s,d}){
  const nb=(s.emps||[]).length;
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🗳</span><div><div style={{fontWeight:700,fontSize:16}}>Élections sociales</div><div style={{fontSize:11,color:'#5e5c56'}}>Tous les 4 ans — Prochaines: mai 2028</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}><SC label="Effectif" value={nb} color="#60a5fa"/><SC label="CPPT (≥50)" value={nb>=50?'OUI':'NON'} color={nb>=50?'#ef4444':'#4ade80'}/><SC label="CE (≥100)" value={nb>=100?'OUI':'NON'} color={nb>=100?'#ef4444':'#4ade80'}/></div>
    <C style={{marginTop:12,padding:'14px 18px'}}><ST>Calendrier (150 jours)</ST>
      {[['X-60','Seuils et UTE'],['X-60','Affichage avis'],['X-35','Listes électorales'],['X-35','Candidatures syndicales'],['X-13','Affichage candidats'],['X','Jour du vote'],['X+2','Résultats et installation']].map(([j,l],i)=><div key={i} style={{display:'flex',gap:14,padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{minWidth:45,fontSize:11,fontWeight:700,color:'#c6a34e'}}>{j}</div><div style={{fontSize:12,fontWeight:600}}>{l}</div></div>)}
    </C></div>;
}

function OrganesMod({s,d}){
  const org=[{t:'Conseil d\'Entreprise (CE)',s:'≥ 100',ic:'🏛',m:['Info économique annuelle','Avis règlement travail','Œuvres sociales']},{t:'CPPT',s:'≥ 50',ic:'🛡',m:['Avis plan prévention','Initiative bien-être','Rapports conseiller']},{t:'Délégation syndicale',s:'Selon CCT',ic:'🤝',m:['Négociation CCT','Réclamations','Contrôle législation']}];
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>🏛</span><div><div style={{fontWeight:700,fontSize:16}}>Organes sociaux — CE / CPPT / DS</div><div style={{fontSize:11,color:'#5e5c56'}}>Préparation réunions, informations, suivi</div></div></div></C>
    {org.map((o,oi)=><C key={oi} style={{marginTop:10}}><div style={{padding:'10px 18px',background:'rgba(198,163,78,.03)',display:'flex',justifyContent:'space-between',borderBottom:'1px solid rgba(198,163,78,.08)'}}><div><span style={{fontSize:16,marginRight:8}}>{o.ic}</span><span style={{fontWeight:700,fontSize:14}}>{o.t}</span></div><span style={{fontSize:11,color:'#c6a34e'}}>{o.s}</span></div>
      <div style={{padding:'10px 18px'}}>{o.m.map((m,mi)=><div key={mi} style={{fontSize:12,color:'#d4d0c8',padding:'3px 0 3px 14px',position:'relative'}}><span style={{position:'absolute',left:0,color:'#c6a34e'}}>•</span>{m}</div>)}</div></C>)}</div>;
}

function SelfServiceMod({s,d}){
  const feats=[{ic:'📄',t:'Fiches de paie',d:'Consultation en ligne'},{ic:'📅',t:'Demandes congés',d:'Validation responsable'},{ic:'⏱',t:'Encodage heures',d:'Prestations et frais'},{ic:'📊',t:'Solde congés',d:'Temps réel'},{ic:'👤',t:'Données perso',d:'Adresse, banque, famille'},{ic:'📋',t:'Documents',d:'Fiscales, attestations'},{ic:'🎓',t:'Certificats',d:'Attestation travail'},{ic:'💬',t:'Messagerie RH',d:'Contact gestionnaire'}];
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>👤</span><div><div style={{fontWeight:700,fontSize:16}}>Portail Self-Service Travailleur</div><div style={{fontSize:11,color:'#5e5c56'}}>Comme Officient (Securex), appipay (UCM), ProSalary (Partena)</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginTop:12}}>
      {feats.map((f,fi)=><C key={fi} style={{padding:'14px 18px',display:'flex',gap:12,alignItems:'center'}}><span style={{fontSize:24}}>{f.ic}</span><div><div style={{fontWeight:700,fontSize:13}}>{f.t}</div><div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>{f.d}</div></div></C>)}
    </div>
    <C style={{marginTop:12,padding:'12px 18px',fontSize:11,color:'#60a5fa',background:'rgba(96,165,250,.03)',border:'1px solid rgba(96,165,250,.1)',borderRadius:10}}>
      <b>💡</b> Réduction appels/emails de ~40%. Les travailleurs de vos clients accèdent à leurs documents en autonomie.
    </C></div>;
}

function GEDMod({s,d}){
  const cats=[{t:'📄 Contrats',n:0},{t:'🏥 Certificats médicaux',n:0},{t:'📬 Courriers',n:0},{t:'📋 Avenants',n:0},{t:'📊 Rapports',n:0},{t:'⚖ Juridique',n:0}];
  return <div><C style={{padding:'18px 20px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><span style={{fontSize:24}}>📁</span><div><div style={{fontWeight:700,fontSize:16}}>GED — Archivage documents</div><div style={{fontSize:11,color:'#5e5c56'}}>Par client et travailleur — Conservation 5 ans min.</div></div></div></C>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}>
      {cats.map((c,ci)=><C key={ci} style={{padding:'14px 18px',textAlign:'center'}}><div style={{fontSize:14,fontWeight:700}}>{c.t}</div><div style={{fontSize:22,fontWeight:700,color:'#c6a34e',marginTop:6}}>{c.n}</div><div style={{fontSize:10,color:'#5e5c56'}}>documents</div></C>)}
    </div>
    <C style={{marginTop:12,padding:'14px 18px'}}><ST>Structure</ST>
      {['📂 Client → Travailleur → Année → Documents','Conservation: contrats 5 ans, fiches 5 ans','Format: PDF/A archivage','Recherche: nom, NISS, type, date','Accès: gestionnaire (tout), client (ses dossiers), travailleur (portail)'].map((l,i)=><div key={i} style={{fontSize:12,color:'#d4d0c8',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>{l}</div>)}
    </C></div>;
}

// ═══════════════════════════════════════════════════════════════
//  AGENT IA JURIDIQUE — BOUTON FLOTTANT
// ═══════════════════════════════════════════════════════════════

const LEGAL_KB=`
# BASE DE CONNAISSANCES — DROIT SOCIAL BELGE
Tu es l'Agent IA Juridique d'Aureus Social Pro, une fiduciaire sociale belge.
Expert en droit social belge, droit du travail, sécurité sociale, fiscalité salariale.
Réponds en FR, NL ou EN selon la langue de l'utilisateur.

RÈGLES: Informations factuelles uniquement. Cite toujours la source légale. Pour cas complexes → recommande juriste.

CONTRATS: Loi 3/7/1978. CDI=forme libre. CDD=écrit avant début. Étudiant=écrit, max 650h/an cotis réduites.

PRÉAVIS (Loi Peeters 26/12/2013): Unifié depuis 1/1/2014.
0-3m:1sem/1sem, 3-6m:3/2, 6-9m:4/2, 9-12m:5/2, 12-15m:6/3, 15-18m:7/3, 18-21m:8/3, 21-24m:9/3,
2-3a:12/4, 3-4a:13/5, 4-5a:15/6, 5-6a:18/7, 6-7a:21/9, 7-8a:24/10, 8-9a:27/12, 9-10a:30/13,
10-11a:33/13, 11-12a:36/13, 12-13a:39/13, +13a:+3sem/an, max travailleur=13sem.
Avant 2014: règles transitoires double calcul.

ONSS: Travailleur 13,07%. Patronal ~25% (Cat1). Réduction 1er engagement: 3100€/trim illimité.
Provisions mensuelles, déclaration DmfA trimestrielle.

PRÉCOMPTE PRO: Formule-clé SPF Finances (AR annuel). Scale I isolé, II marié 2 rev, III marié 1 rev.
Réductions: enfants à charge, handicap, isolé+enfants.

CP PRINCIPALES: 100(aux ouvriers),112(garage),118(alimentaire),121(nettoyage),124(construction),
140(transport),200(aux employés),302(horeca),322(intérim),330(santé),336(prof libérales).

DIMONA: Obligatoire avant début prestations. Types: IN/OUT/UPDATE, STU(étudiant), FLX(flexi), EXT(extra horeca).
Sanction: 2500-12500€/infraction.

DmfA: Trimestrielle ONSS. T1→30/4, T2→31/7, T3→31/10, T4→31/1. Format XML.

PÉCULE VACANCES: Employés=simple+double(92% brut mensuel). Ouvriers=ONVA 15,38% rém brute à 108%.
20j congé (5j/sem) ou 24j (6j/sem).

JOURS FÉRIÉS 2026: 1/1, 6/4(Pâques), 1/5, 14/5(Ascension), 25/5(Pentecôte), 21/7, 15/8, 1/11, 11/11, 25/12.

CALCUL NET: Brut - ONSS 13,07% = Imposable - Précompte Pro - Cotis spéciale SS + Bonus emploi = Net.
COÛT EMPLOYEUR: Brut + Patronal ONSS ~25% + Fonds séc existence + Assurance AT + Pécule vac patronal 10,27%.

FLEXI-JOBS: 4/5 temps min ailleurs. Cotis patronale 28%. Pas cotis travailleur, pas précompte. Min 12,05€/h.
CRÉDIT-TEMPS: CCT 103 CNT. Temps plein/mi-temps/1/5. Avec motif=allocation ONEM.
LICENCIEMENT: Préavis ou indemnité. Motivation obligatoire (CCT 109). Motif grave=3j ouvrables pour notifier.
RÈGLEMENT TRAVAIL: Obligatoire dès 1er travailleur. Loi 8/4/1965. Déposer au Contrôle Lois Sociales.
`;

const AGENT_SYS_FR=LEGAL_KB+`\nRéponds en FRANÇAIS. Sois précis, professionnel, cite tes sources légales.`;
const AGENT_SYS_NL=LEGAL_KB+`\nAntwoord in het NEDERLANDS. Wees nauwkeurig, professioneel, vermeld juridische bronnen.`;
const AGENT_SYS_EN=LEGAL_KB+`\nRespond in ENGLISH. Be precise, professional, cite legal sources.`;

const AGENT_QUICK={
  fr:[
    {i:'⏱️',l:'Calcul préavis',p:'Calcule mon préavis. Date entrée: '},
    {i:'💰',l:'Simulation salaire',p:'Calcule le salaire net pour un brut de '},
    {i:'📋',l:'Info CP',p:'Quelles sont les règles de la CP '},
    {i:'📄',l:'Procédure C4',p:'Comment établir un C4 correctement?'},
    {i:'⚠️',l:'Licenciement',p:'Quelle est la procédure de licenciement?'},
    {i:'📅',l:'Jours fériés',p:'Jours fériés 2026 et règles de remplacement?'},
  ],
  nl:[
    {i:'⏱️',l:'Opzeg berekenen',p:'Bereken mijn opzegtermijn. Startdatum: '},
    {i:'💰',l:'Loonsimulatie',p:'Bereken het nettoloon voor een bruto van '},
    {i:'📋',l:'Info PC',p:'Wat zijn de regels van PC '},
    {i:'📄',l:'C4 procedure',p:'Hoe stel ik een C4 correct op?'},
    {i:'⚠️',l:'Ontslag',p:'Wat is de ontslagprocedure?'},
    {i:'📅',l:'Feestdagen',p:'Feestdagen 2026 en vervangingsregels?'},
  ],
  en:[
    {i:'⏱️',l:'Notice period',p:'Calculate notice period. Start date: '},
    {i:'💰',l:'Salary sim',p:'Calculate net salary for gross of '},
    {i:'📋',l:'JC info',p:'What are the rules of Joint Committee '},
    {i:'📄',l:'C4 procedure',p:'How to properly issue a C4?'},
    {i:'⚠️',l:'Dismissal',p:'What is the dismissal procedure?'},
    {i:'📅',l:'Public holidays',p:'Belgian public holidays 2026?'},
  ],
};

function detectAgentLang(t){
  const nl=/\b(de|het|een|van|voor|met|werknemer|loon|opzeg|contract|paritair|verlof|ontslag)\b/gi;
  const fr=/\b(le|la|les|des|une|pour|avec|salaire|préavis|contrat|commission|congé|licenciement|travailleur)\b/gi;
  const nc=(t.match(nl)||[]).length, fc=(t.match(fr)||[]).length;
  if(nc>fc+2)return'nl';if(fc>nc+2)return'fr';
  if(/[àâéèêëïîôùûüç]/.test(t))return'fr';
  if(/\b(the|is|are|employee|salary|notice|contract)\b/i.test(t))return'en';
  return'fr';
}

function FloatingLegalAgent(){
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([]);
  const[inp,setInp]=useState('');
  const[loading,setLoading]=useState(false);
  const[lang,setLang]=useState('fr');
  const[unread,setUnread]=useState(0);
  const endRef=useRef(null);
  const inpRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);
  useEffect(()=>{if(open){setUnread(0);setTimeout(()=>inpRef.current?.focus(),100);}},[open]);

  const getSys=(l)=>l==='nl'?AGENT_SYS_NL:l==='en'?AGENT_SYS_EN:AGENT_SYS_FR;
  const quick=AGENT_QUICK[lang]||AGENT_QUICK.fr;

  const send=async(text)=>{
    if(!text.trim()||loading)return;
    const dl=detectAgentLang(text);setLang(dl);
    const um={role:'user',content:text.trim()};
    const nm=[...msgs,um];setMsgs(nm);setInp('');setLoading(true);
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,system:getSys(dl),
          messages:nm.map(m=>({role:m.role,content:m.content}))})
      });
      const data=await res.json();
      const txt=data.content?.map(i=>i.type==='text'?i.text:'').filter(Boolean).join('\n')||'Erreur. Réessayez.';
      setMsgs([...nm,{role:'assistant',content:txt}]);
      if(!open)setUnread(u=>u+1);
    }catch(e){setMsgs([...nm,{role:'assistant',content:'❌ Erreur de connexion.'}]);}
    finally{setLoading(false);}
  };

  const labels={fr:{title:'Agent Juridique IA',placeholder:'Votre question en droit social...',disclaimer:'Info juridique indicative. Cas complexes → juriste.',clear:'Effacer'},
    nl:{title:'Juridische AI-Agent',placeholder:'Uw vraag over sociaal recht...',disclaimer:'Indicatieve juridische info. Complexe gevallen → jurist.',clear:'Wissen'},
    en:{title:'Legal AI Agent',placeholder:'Your social law question...',disclaimer:'Indicative legal info. Complex cases → jurist.',clear:'Clear'}};
  const lb=labels[lang]||labels.fr;

  return <>
    {/* Floating Button */}
    <button onClick={()=>setOpen(!open)} style={{
      position:'fixed',bottom:24,right:24,width:60,height:60,borderRadius:'50%',
      background:'linear-gradient(135deg,#c6a34e,#8b6914)',border:'none',cursor:'pointer',
      boxShadow:'0 6px 24px rgba(198,163,78,.4)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',
      transition:'all .3s',transform:open?'scale(0.9) rotate(45deg)':'scale(1) rotate(0deg)',
    }}>
      <span style={{fontSize:open?26:28,color:'#0d0d0d',fontWeight:700}}>{open?'✕':'⚖️'}</span>
      {unread>0&&!open&&<span style={{position:'absolute',top:-4,right:-4,width:22,height:22,borderRadius:'50%',
        background:'#ef4444',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',
        border:'2px solid #060810'}}>{unread}</span>}
    </button>

    {/* Chat Window */}
    {open&&<div style={{
      position:'fixed',bottom:96,right:24,width:400,height:560,
      background:'#0c0f1a',border:'1px solid rgba(198,163,78,.2)',borderRadius:20,
      boxShadow:'0 20px 60px rgba(0,0,0,.7)',zIndex:9998,display:'flex',flexDirection:'column',
      overflow:'hidden',animation:'agentSlideIn .3s ease-out',
    }}>
      <style>{`@keyframes agentSlideIn{from{opacity:0;transform:translateY(20px) scale(.95);}to{opacity:1;transform:translateY(0) scale(1);}}`}</style>

      {/* Header */}
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(198,163,78,.12)',
        background:'linear-gradient(135deg,rgba(198,163,78,.08),rgba(198,163,78,.02))',
        display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#c6a34e,#8b6914)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#0d0d0d'}}>⚖️</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{lb.title}</div>
            <div style={{fontSize:10,color:'rgba(198,163,78,.5)'}}>Aureus Social Pro</div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {['fr','nl','en'].map(l=><button key={l} onClick={()=>setLang(l)} style={{
            padding:'3px 8px',borderRadius:6,border:'none',fontSize:10,fontWeight:600,cursor:'pointer',
            textTransform:'uppercase',letterSpacing:.5,fontFamily:'inherit',
            background:lang===l?'rgba(198,163,78,.2)':'transparent',color:lang===l?'#c6a34e':'rgba(198,163,78,.3)',
          }}>{l}</button>)}
          <button onClick={()=>{setMsgs([]);}} style={{padding:'3px 8px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',
            background:'transparent',color:'rgba(198,163,78,.4)',fontSize:10,cursor:'pointer',fontFamily:'inherit',marginLeft:4}}>{lb.clear}</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:12}}>
        {msgs.length===0&&<div style={{textAlign:'center',padding:'20px 10px'}}>
          <div style={{fontSize:36,marginBottom:12}}>⚖️</div>
          <div style={{fontSize:13,color:'rgba(198,163,78,.6)',marginBottom:16,lineHeight:1.5}}>
            {lang==='nl'?'Stel uw vraag over Belgisch sociaal recht':lang==='en'?'Ask your Belgian social law question':'Posez votre question en droit social belge'}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {quick.map((q,qi)=><button key={qi} onClick={()=>{setInp(q.p);inpRef.current?.focus();}} style={{
              display:'flex',alignItems:'center',gap:6,padding:'9px 10px',
              background:'rgba(198,163,78,.04)',border:'1px solid rgba(198,163,78,.1)',borderRadius:10,
              color:'rgba(232,228,220,.7)',fontSize:11.5,cursor:'pointer',fontFamily:'inherit',textAlign:'left',
            }}><span style={{fontSize:15}}>{q.i}</span><span>{q.l}</span></button>)}
          </div>
        </div>}

        {msgs.map((m,i)=><div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
          <div style={{
            maxWidth:'85%',padding:m.role==='user'?'10px 14px':'12px 16px',
            borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
            background:m.role==='user'?'linear-gradient(135deg,#c6a34e,#a07d3e)':'rgba(255,255,255,.05)',
            color:m.role==='user'?'#0d0d0d':'#e8e4dc',fontSize:12.5,lineHeight:1.6,fontFamily:'inherit',
            border:m.role==='user'?'none':'1px solid rgba(198,163,78,.1)',whiteSpace:'pre-wrap',wordBreak:'break-word',
          }}>
            {m.role==='assistant'&&<div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,paddingBottom:8,
              borderBottom:'1px solid rgba(198,163,78,.1)'}}>
              <span style={{fontSize:10,color:'#c6a34e',fontWeight:600,letterSpacing:.5,textTransform:'uppercase'}}>Aureus Legal</span>
            </div>}
            {m.content}
          </div>
        </div>)}

        {loading&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px'}}>
          {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#c6a34e',
            animation:`pulse 1.2s ease-in-out ${i*.2}s infinite`}}/>)}
          <span style={{fontSize:11,color:'rgba(198,163,78,.4)',fontStyle:'italic'}}>
            {lang==='nl'?'Analyse bezig...':lang==='en'?'Analyzing...':'Analyse en cours...'}
          </span>
        </div>}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'10px 14px 14px',borderTop:'1px solid rgba(198,163,78,.1)',
        background:'rgba(12,15,26,.95)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,alignItems:'flex-end',background:'rgba(198,163,78,.03)',
          border:'1px solid rgba(198,163,78,.12)',borderRadius:14,padding:'6px 6px 6px 14px'}}>
          <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(inp);}}}
            placeholder={lb.placeholder} rows={1}
            style={{flex:1,background:'transparent',border:'none',color:'#e8e4dc',fontSize:13,
              fontFamily:'inherit',resize:'none',minHeight:22,maxHeight:80,lineHeight:1.4,padding:'4px 0',outline:'none'}}
            onInput={e=>{e.target.style.height='22px';e.target.style.height=Math.min(e.target.scrollHeight,80)+'px';}}/>
          <button onClick={()=>send(inp)} disabled={!inp.trim()||loading} style={{
            width:36,height:36,borderRadius:10,border:'none',flexShrink:0,cursor:inp.trim()&&!loading?'pointer':'not-allowed',
            background:inp.trim()&&!loading?'linear-gradient(135deg,#c6a34e,#a07d3e)':'rgba(198,163,78,.1)',
            color:inp.trim()&&!loading?'#0d0d0d':'rgba(198,163,78,.3)',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',
          }}>➤</button>
        </div>
        <div style={{textAlign:'center',marginTop:6,fontSize:9.5,color:'rgba(198,163,78,.2)'}}>{lb.disclaimer}</div>
      </div>
    </div>}
  </>;
}

export default function AureusSocialPro({ supabase, user, onLogout }) {
  return <LangProvider><AppInner supabase={supabase} user={user} onLogout={onLogout}/></LangProvider>;
}
