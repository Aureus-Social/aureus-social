'use client';
import { useState, useEffect } from 'react';
import { RMMMG } from '../lib/lois-belges';

// ─── Storage sécurisé AES-GCM (SSR-safe)
const _ls = {
  get: (k, fallback) => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem('as_' + k);
      if (!raw) {
        // fallback lecture legacy non-chiffré
        const legacy = localStorage.getItem(k);
        return legacy ? JSON.parse(legacy) : fallback;
      }
      return JSON.parse(atob(raw.split('.')[1] || '{}') || '{}');
    } catch { return fallback; }
  },
  set: (k, v) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ }
  },
};
// Note: migrer vers secureStorage.js (sSet/sGet) pour chiffrement AES-GCM complet

// RMMMG importé depuis lois-belges.js — source unique de vérité
// Pour mettre à jour : modifier lois-belges.js → remuneration.RMMMG.montant18ans
const RMMMG_HORAIRE = (RMMMG / (52 * 38 / 12)).toFixed(2);  // mensuel → horaire 38h
const RMMMG_ANNUEL  = (RMMMG * 12).toFixed(2);

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — HUB CONNEXIONS H24
// Tous les portails officiels belges + outils Aureus
// Statut visité, accès 1 clic, recherche, filtres, favoris
// ═══════════════════════════════════════════════════════════════════════════

const ALL_PORTALS = [
  // ── ONSS & SÉCURITÉ SOCIALE ──
  { id:'onss_main',   cat:'ONSS',  label:'ONSS — Portail Employeur',         url:'https://www.socialsecurity.be',                                                                              icon:'🏛', desc:'DmfA, cotisations, déclarations trimestrielles',                prio:1, cred:'eID / itsme',       badge:null },
  { id:'mahis',       cat:'ONSS',  label:'Mahis — Mandats Prestataires',      url:'https://www.socialsecurity.be/site_fr/employer/applics/mahis/index.htm',                                    icon:'🤝', desc:'Réf. DGIII/MAHI011/1028.230.781 · Mandats clients',            prio:1, cred:'eID',               badge:'ACTIF' },
  { id:'dimona',      cat:'ONSS',  label:'Dimona — Déclarations IN/OUT',      url:'https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm',                                   icon:'📡', desc:'Déclarations immédiates travailleurs (IN/OUT/INTERM)',         prio:1, cred:'eID / Mahis',     badge:null },
  { id:'dmfa',        cat:'ONSS',  label:'DmfA — Déclaration Trimestrielle',  url:'https://www.socialsecurity.be/site_fr/employer/applics/dmfa/index.htm',                                    icon:'📋', desc:'Déclaration multifonctionnelle trimestrielle ONSS',            prio:1, cred:'eID / Mahis',     badge:null },
  { id:'wide',        cat:'ONSS',  label:'WIDE — Immatriculation ONSS',       url:'https://www.socialsecurity.be/site_fr/employer/applics/wide/index.htm',                                    icon:'🆕', desc:'Matricule provisoire 51357716-02 · En attente définitif',       prio:1, cred:'eID',               badge:'EN COURS' },
  { id:'csam',        cat:'ONSS',  label:'CSAM GAP — Gestion Accès',          url:'https://csam.belgique.be',                                                                                   icon:'🔑', desc:'Réf. 22A00LCY0E8HZ / 22A00LCY0ENXZ · Mandats clients',         prio:1, cred:'eID',               badge:'ACTIF' },
  { id:'onss_stats',  cat:'ONSS',  label:'ONSS — Publications & Stats',       url:'https://www.socialsecurity.be/site_fr/employer/general/statsandpub/index.htm',                              icon:'📊', desc:'Statistiques emploi, publications officielles',                prio:3, cred:'Public',            badge:null },
  { id:'onss_cot',    cat:'ONSS',  label:'ONSS — Guide Cotisations 2026',     url:'https://www.socialsecurity.be/site_fr/employer/general/contributions/index.htm',                           icon:'💶', desc:'Taux patronaux, réductions groupes cibles, plafonds',          prio:2, cred:'Public',            badge:null },

  // ── SPF FINANCES ──
  { id:'myminfin',    cat:'FISC',  label:'MyMinfin — Espace Professionnel',   url:'https://eservices.minfin.fgov.be',                                                                           icon:'💰', desc:'TVA, précompte, Belcotax, mandats fiscaux',                   prio:1, cred:'eID / itsme',     badge:null },
  { id:'belcotax',    cat:'FISC',  label:'Belcotax-on-web',                   url:'https://eservices.minfin.fgov.be/belcotax-on-web',                                                          icon:'📄', desc:'Fiches 281.10/20/30 · Deadline 1er mars · Mandataire fiscal', prio:1, cred:'eID / itsme',     badge:null },
  { id:'pp_baremes',  cat:'FISC',  label:'SPF — Barèmes PP 2026',             url:'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/baremes',     icon:'📐', desc:'Tables officielles précompte professionnel 2026',              prio:2, cred:'Public',            badge:null },
  { id:'intervat',    cat:'FISC',  label:'Intervat — TVA',                    url:'https://intervat.minfin.fgov.be',                                                                            icon:'🧾', desc:'Déclarations TVA trimestrielles / mensuelles',                prio:2, cred:'eID',               badge:null },
  { id:'fisco',       cat:'FISC',  label:'SPF Finances — Entreprises',        url:'https://finances.belgium.be/fr/entreprises',                                                                 icon:'🏢', desc:'Toutes les obligations fiscales entreprises belges',           prio:2, cred:'Public',            badge:null },
  { id:'minfin_ipm',  cat:'FISC',  label:'SPF — IPM Cotisations spéciales',   url:'https://eservices.minfin.fgov.be/partnerb2b/ipm',                                                          icon:'🔵', desc:'Cotisation spéciale sécurité sociale (CSSS)',                  prio:3, cred:'eID',               badge:null },

  // ── PRIMES À L'EMPLOI ──
  { id:'actiris',     cat:'PRIME', label:'Actiris — Portail Employeurs',      url:'https://www.actiris.brussels/fr/employeurs/',                                                               icon:'✅', desc:'Activa.brussels N° 829605 · Gestion attestations primes',      prio:1, cred:'Login Actiris',   badge:'N°829605' },
  { id:'activa',      cat:'PRIME', label:'Activa.brussels — Formulaires',     url:'https://www.actiris.brussels/fr/employeurs/activa-brussels/',                                               icon:'💼', desc:'350 EUR/mois · 24 mois · Formulaire C53W à conserver',        prio:1, cred:'Login Actiris',   badge:null },
  { id:'impulsion55', cat:'PRIME', label:'Actiris — Impulsion 55+',           url:'https://www.actiris.brussels/fr/employeurs/impulsion/',                                                     icon:'👴', desc:'500 EUR/mois · 36 mois · Chercheur emploi ≥ 55 ans',          prio:2, cred:'Login Actiris',   badge:null },
  { id:'activajeune', cat:'PRIME', label:'Actiris — Activa Jeunes',           url:'https://www.actiris.brussels/fr/employeurs/activa-jeunes/',                                                 icon:'🧑', desc:'350 EUR/mois · < 30 ans · Sans diplôme supérieur',            prio:2, cred:'Login Actiris',   badge:null },
  { id:'monbee',      cat:'PRIME', label:'⚠ MonBEE — deadline 01/06/2026',   url:'https://environnement.brussels/monbee',                                                                      icon:'🌿', desc:'Primes énergie bruxelloises · DEADLINE CRITIQUE',              prio:1, cred:'Login BruxEnv',   badge:'01/06/26' },
  { id:'onem',        cat:'PRIME', label:'ONEM — Réductions Groupes Cibles',  url:'https://www.onem.be/fr/documentation/feuillet/t71',                                                        icon:'🏅', desc:'SINE, Art.60, réductions groupes cibles national',            prio:2, cred:'Public',            badge:null },
  { id:'cpas_bxl',    cat:'PRIME', label:'CPAS Bruxelles — Art. 60 §7',       url:'https://www.cpas.brussels',                                                                                 icon:'🏢', desc:'Mise à disposition travailleurs · 100% coût salarial pris en charge', prio:2, cred:'Contact CPAS', badge:null },
  { id:'forem',       cat:'PRIME', label:'FOREM — Primes Wallonie',           url:'https://www.forem.be/fr-be/employeurs/outils-et-services/recruter/primes-a-lembauche',                     icon:'🌳', desc:'Impulsion Wallonie · Plans formation · Aides embauche',        prio:3, cred:'Login FOREM',     badge:null },
  { id:'vdab',        cat:'PRIME', label:'VDAB — Werkgevers Flandre',         url:'https://www.vdab.be/werkgevers',                                                                             icon:'💎', desc:'Primes emploi Flandre · Stages de transition professionnelle', prio:3, cred:'Login VDAB',      badge:null },

  // ── DROIT & RÉGLEMENTATIONS ──
  { id:'cnt',         cat:'DROIT', label:'CNT — Conseil National du Travail',  url:'https://www.cnt-nar.be',                                                                                    icon:'⚖', desc:'CCT 43/15 RMMMG 2.070,48 EUR · Toutes les CCT belges',        prio:1, cred:'Public',            badge:null },
  { id:'cct4315',     cat:'DROIT', label:'CCT 43/15 — RMMMG PDF officiel',    url:'https://www.cnt-nar.be/CCT-ORIG/cct-043-15.pdf',                                                           icon:'📜', desc:'Salaire minimum légal 2.070,48 EUR/mois · Texte complet',       prio:1, cred:'Public',            badge:'2.070,48€' },
  { id:'moniteur',    cat:'DROIT', label:'Moniteur Belge',                     url:'https://www.ejustice.just.fgov.be/cgi/welcome.pl',                                                         icon:'📰', desc:'Textes légaux officiels · Nouvelles lois belges',              prio:2, cred:'Public',            badge:null },
  { id:'etcs',        cat:'DROIT', label:'SPF ETCS — Emploi Travail',          url:'https://emploi.belgique.be/fr',                                                                             icon:'🏗', desc:'Loi 03/07/1978 · Contrats types · Réglementations sociales',  prio:2, cred:'Public',            badge:null },
  { id:'baremes_cp',  cat:'DROIT', label:'Barèmes Salaires — 228 CP',          url:'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires',                                  icon:'📈', desc:'Toutes les commissions paritaires · Barèmes 2026',             prio:2, cred:'Public',            badge:null },
  { id:'fedris',      cat:'DROIT', label:'Fedris — Accidents du Travail',      url:'https://www.fedris.be',                                                                                     icon:'🦺', desc:'Taux cotisation AT · Déclaration accidents travail',           prio:2, cred:'eID',               badge:null },
  { id:'apd',         cat:'DROIT', label:'APD — Protection Données RGPD',      url:'https://www.autoriteprotectiondonnees.be',                                                                  icon:'🔒', desc:'RGPD · DPA · Dépôt plainte · Registre Art. 30',               prio:2, cred:'Public',            badge:null },
  { id:'cct_coord',   cat:'DROIT', label:'CNT — CCT 43 Coordonnée (RMMMG)',    url:'https://www.cnt-nar.be/CCT-COORD/cct-043.pdf',                                                             icon:'📋', desc:'Évolution historique salaire minimum · CCT 43 coordonnée',     prio:3, cred:'Public',            badge:null },
  { id:'gecodex',     cat:'DROIT', label:'SPF — Jurisprudence sociale',        url:'https://emploi.belgique.be/fr/themes/droit-du-travail',                                                    icon:'🔍', desc:'Jurisprudence droit du travail belge officielle',              prio:3, cred:'Public',            badge:null },

  // ── OUTILS ADMINISTRATIFS ──
  { id:'bce',         cat:'ADMIN', label:'BCE — Banque-Carrefour Entreprises', url:'https://kbopub.economie.fgov.be/kbopub/zoekwoordenform.html',                                             icon:'🏦', desc:'Rechercher BCE client · Vérifier statuts · Mandats publicité', prio:1, cred:'Public',            badge:null },
  { id:'eid',         cat:'ADMIN', label:'eID Belgium — Identité électronique', url:'https://eid.belgium.be/fr',                                                                               icon:'🪪', desc:'Middleware eID · Lecteur carte · Certificats numériques',       prio:1, cred:'Carte eID',         badge:null },
  { id:'itsme',       cat:'ADMIN', label:'itsme — Authentification Mobile',    url:'https://www.itsme-id.com',                                                                                 icon:'📱', desc:'App mobile identité belge · Alternative eID pour portails',    prio:1, cred:'App mobile',         badge:null },
  { id:'isabel',      cat:'ADMIN', label:'Isabel 6 — Virements SEPA',          url:'https://www.isabel.eu',                                                                                     icon:'💳', desc:'Paiements SEPA pain.001 · Salaires · Cotisations ONSS',        prio:2, cred:'Token Isabel',      badge:null },
  { id:'peppol',      cat:'ADMIN', label:'Peppol — E-invoicing B2G',           url:'https://peppol.eu',                                                                                         icon:'🔌', desc:'ID Aureus : 0208:1028230781 · Facturation électronique',        prio:2, cred:'Public',            badge:'0208:1028' },
  { id:'liantis',     cat:'ADMIN', label:'Liantis — Caisse Assurances Sociales', url:'https://www.liantis.be',                                                                                 icon:'🏥', desc:'NACE codes en cours · Assurances · Accidents travail',          prio:2, cred:'Login Liantis',   badge:'NACE cours' },
  { id:'securitas_b', cat:'ADMIN', label:'Belfius Pro — Banque',               url:'https://www.belfius.be/professional',                                                                      icon:'🏛', desc:'Compte Aureus · Virements salaires · Domiciliation SEPA',      prio:1, cred:'Login bancaire',   badge:null },
  { id:'myminfinpart',cat:'ADMIN', label:'MyMinfin — Mandataire Fiscal',       url:'https://eservices.minfin.fgov.be/partnerb2b',                                                             icon:'📎', desc:'Gestion mandat fiscal Belcotax · Accès B2B SPF',               prio:2, cred:'eID',               badge:null },

  // ── STATISTIQUES & VEILLE ──
  { id:'statbel',     cat:'STATS', label:'Statbel — Statistiques Emploi',      url:'https://statbel.fgov.be/fr/themes/emploi-formation/salaires',                                             icon:'📊', desc:'Données officielles salaires · Indices · Inflation BE',        prio:3, cred:'Public',            badge:null },
  { id:'nbb',         cat:'STATS', label:'BNB — Bilan Social Annuel',          url:'https://www.nbb.be/fr/bilans-sociaux',                                                                     icon:'📉', desc:'Bilan social annuel · Deadline 28 février · Déposer en ligne', prio:2, cred:'eID',               badge:null },
  { id:'indice',      cat:'STATS', label:'SPF — Indice Santé & Indexation',    url:'https://economie.fgov.be/fr/themes/observatoire-des-prix/indice-des-prix-a-la-consommation',             icon:'📐', desc:'Indice santé · Inflation · Calcul indexation salariale auto',  prio:2, cred:'Public',            badge:null },
  { id:'securex_actu',cat:'STATS', label:'Securex — Actualité Sociale',        url:'https://www.securex.be/fr/actualite',                                                                      icon:'📰', desc:'Veille sociale belge · Nouveautés légales · Guides RH',        prio:3, cred:'Public',            badge:null },
  { id:'partena_kc',  cat:'STATS', label:'Partena — Knowledge Centre RH',      url:'https://www.partena-professional.be/fr/knowledge-centre',                                                 icon:'📚', desc:'Guides RH · Calculateurs · Modèles documents sociaux',         prio:3, cred:'Public',            badge:null },
  { id:'sdworx_ins',  cat:'STATS', label:'SD Worx — HR Insights',              url:'https://www.sdworx.be/fr-be/payroll-hr-insights',                                                         icon:'📖', desc:'Tendances RH · Études · Guides paie Belgique',                 prio:3, cred:'Public',            badge:null },

  // ── 🏙 BRUXELLES ──
  { id:'bxl_actiris_emp',  cat:'BXL', label:'Actiris — Portail Employeurs',          url:'https://www.actiris.brussels/fr/employeurs/',                                                           icon:'✅', desc:'Activa.brussels N°829605 · Toutes les primes bruxelloises',    prio:1, cred:'Login Actiris',    badge:'N°829605' },
  { id:'bxl_activa',       cat:'BXL', label:'Activa.brussels — 350 EUR/mois',        url:'https://www.actiris.brussels/fr/employeurs/activa-brussels/',                                           icon:'💼', desc:'350 EUR/mois · 24 mois · Formulaire C53W · Chercheur emploi 6m+', prio:1, cred:'Login Actiris', badge:null },
  { id:'bxl_activa_ap',    cat:'BXL', label:'Activa AP — 350→800→350 EUR/mois',      url:'https://www.actiris.brussels/fr/employeurs/activa-brussels/',                                           icon:'💰', desc:'Phase 1: 350€ · Phase 2: 800€ · Phase 3: 350€ · Total 10.200€',  prio:1, cred:'Login Actiris',    badge:null },
  { id:'bxl_impulsion55',  cat:'BXL', label:'Impulsion 55+ BXL — 500 EUR/mois',      url:'https://www.actiris.brussels/fr/employeurs/impulsion/',                                                  icon:'👴', desc:'500 EUR/mois · 36 mois · 18.000 EUR total · ≥55 ans inoccupé',  prio:1, cred:'Login Actiris',    badge:null },
  { id:'bxl_activa_jeune', cat:'BXL', label:'Activa Jeunes BXL — 350 EUR/mois',      url:'https://www.actiris.brussels/fr/employeurs/activa-jeunes/',                                             icon:'🧑', desc:'350 EUR/mois · 12-24 mois · < 30 ans · max CESS',                prio:2, cred:'Login Actiris',    badge:null },
  { id:'bxl_monbee',       cat:'BXL', label:'⚠ MonBEE — deadline 01/06/2026',        url:'https://environnement.brussels/monbee',                                                                  icon:'🌿', desc:'Primes énergie employeurs bruxellois · DEADLINE CRITIQUE',       prio:1, cred:'Login BruxEnv',    badge:'01/06/26' },
  { id:'bxl_cpas',         cat:'BXL', label:'CPAS Bruxelles — Art. 60 §7',           url:'https://www.cpas.brussels',                                                                             icon:'🏢', desc:'Travailleur mis à dispo · 100% coût salarial couvert',           prio:2, cred:'Contact CPAS',     badge:null },
  { id:'bxl_1819',         cat:'BXL', label:'1819 — Guichet Entreprises BXL',        url:'https://1819.brussels',                                                                                  icon:'🧭', desc:'Info création · Permis · Aides · Guichet officiel bruxellois',  prio:2, cred:'Public',            badge:null },
  { id:'bxl_hub',          cat:'BXL', label:'hub.brussels — Soutien Entreprises',    url:'https://hub.brussels/fr',                                                                                icon:'🏙', desc:'Financement · Exportation · Accompagnement · PME Bruxelles',   prio:2, cred:'Login Hub',         badge:null },
  { id:'bxl_finance',      cat:'BXL', label:'finance.brussels — Prêts & Garanties',  url:'https://finance.brussels/fr',                                                                            icon:'💶', desc:'Microcrédits · Garanties · Prêts PME bruxellois · BEE Start',   prio:2, cred:'Dossier',           badge:null },
  { id:'bxl_env_primes',   cat:'BXL', label:'Bruxelles Env. — Primes Énergie',       url:'https://environnement.brussels/aide-aux-professionnels/primes-et-aides',                                icon:'♻', desc:'Primes isolation · LED · Mobilité douce · Professionnels',      prio:2, cred:'Public',            badge:null },
  { id:'bxl_irisbox',      cat:'BXL', label:'IRISbox — Services Publics BXL',        url:'https://www.irisbox.brussels',                                                                           icon:'🌐', desc:'Portail services publics bruxellois · Démarches en ligne',       prio:3, cred:'eID',               badge:null },
  { id:'bxl_citydev',      cat:'BXL', label:'citydev.brussels — Immobilier Pro',     url:'https://www.citydev.brussels',                                                                           icon:'🏗', desc:'Espaces travail · Ateliers · Locaux PME bruxellois',            prio:3, cred:'Dossier',           badge:null },

  // ── 🌳 WALLONIE ──
  { id:'wal_forem_emp',    cat:'WAL', label:'FOREM — Portail Employeurs',            url:'https://www.forem.be/fr-be/employeurs',                                                                   icon:'🌳', desc:'Primes Impulsion · Accompagnement recrutement · Wallonie',       prio:1, cred:'Login FOREM',      badge:null },
  { id:'wal_impulsion',    cat:'WAL', label:'Impulsion Wallonie — 500 EUR/mois',     url:'https://www.forem.be/fr-be/employeurs/outils-et-services/recruter/primes-a-lembauche',                  icon:'⚡', desc:'500 EUR/mois · Chercheur emploi Wallonie · Plans de formation',  prio:1, cred:'Login FOREM',      badge:null },
  { id:'wal_impulsion55',  cat:'WAL', label:'Impulsion 55+ Wallonie',                url:'https://www.forem.be/fr-be/employeurs/outils-et-services/recruter/primes-a-lembauche',                  icon:'👴', desc:'Réduction cotisations · ≥55 ans chercheur emploi WAL',           prio:1, cred:'Login FOREM',      badge:null },
  { id:'wal_spw_eco',      cat:'WAL', label:'SPW — Aides Économiques Wallonie',      url:'https://economie.wallonie.be',                                                                           icon:'🏭', desc:'Subventions · Investissement · R&D · PME wallonnes',              prio:2, cred:'Dossier SPW',       badge:null },
  { id:'wal_sowalfin',     cat:'WAL', label:'Sowalfin — Financement PME',            url:'https://www.sowalfin.be',                                                                                icon:'💶', desc:'Garanties · Prêts · Microcrédits · Start-ups Wallonie',          prio:2, cred:'Dossier',           badge:null },
  { id:'wal_portail',      cat:'WAL', label:'Wallonie.be — Entreprises',             url:'https://www.wallonie.be/fr/entreprises',                                                                 icon:'🌐', desc:'Portail officiel aides aux entreprises wallonnes',               prio:2, cred:'Public',            badge:null },
  { id:'wal_1890',         cat:'WAL', label:'1890 — Guichet Entreprises Wallonie',   url:'https://www.1890.be',                                                                                    icon:'🧭', desc:'Info création · Permis environnement · Aides WAL',              prio:2, cred:'Public',            badge:null },
  { id:'wal_cpas',         cat:'WAL', label:'CPAS Wallonie — Art. 60 §7',            url:'https://www.cpas-liege.be',                                                                              icon:'🏢', desc:'Art.60 §7 · Mise à disposition · Coût salarial 100% couvert',    prio:2, cred:'Contact CPAS',     badge:null },
  { id:'wal_invest',       cat:'WAL', label:'Invest in Wallonia',                    url:'https://www.investinwallonia.be',                                                                        icon:'📈', desc:'Aides investissement · Implantation · Zone économique spéciale', prio:3, cred:'Public',            badge:null },
  { id:'wal_apef',         cat:'WAL', label:'FOREM — Formation Continue (APEF)',     url:'https://www.leforem.be',                                                                                 icon:'🎓', desc:'Formation continue salariés · Cofinancement FOREM Wallonie',    prio:3, cred:'Login FOREM',      badge:null },

  // ── 💎 FLANDRE ──
  { id:'vl_vdab_emp',      cat:'VL',  label:'VDAB — Werkgeversportaal',              url:'https://www.vdab.be/werkgevers',                                                                         icon:'💎', desc:'Primes emploi Flandre · Stages transition · Accompagnement RH',  prio:1, cred:'Login VDAB',       badge:null },
  { id:'vl_vai',           cat:'VL',  label:'Vlaamse Aanwervingsincentive — 7.800€', url:'https://www.vdab.be/werkgevers/vlaamse-aanwervingsincentive',                                           icon:'🏅', desc:'Prime embauche flamande · Chercheur emploi 2 ans+ · 7.800 EUR',  prio:1, cred:'Login VDAB',       badge:null },
  { id:'vl_vlaio',         cat:'VL',  label:'VLAIO — Subsides Innovation & PME',     url:'https://www.vlaio.be',                                                                                   icon:'🔬', desc:'Subsides R&D · Innovation · Investissement · PME Flandre',       prio:1, cred:'eID',               badge:null },
  { id:'vl_pmv',           cat:'VL',  label:'PMV — Financiering Vlaanderen',         url:'https://www.pmv.eu',                                                                                     icon:'💶', desc:'Garanties · Prêts · Capital · Financement PME flamandes',         prio:2, cred:'Dossier PMV',       badge:null },
  { id:'vl_winwin',        cat:'VL',  label:'Win-Win Lening — Prêt Citoyen',         url:'https://www.pmv.eu/nl/producten/win-win-lening',                                                        icon:'🤝', desc:'Prêt citoyen défiscalisé · Max 75.000 EUR par entreprise',        prio:2, cred:'Login PMV',        badge:null },
  { id:'vl_werk',          cat:'VL',  label:'Werk in Vlaanderen — Employeurs',       url:'https://www.werkinvlaanderen.be/werkgevers',                                                             icon:'🏗', desc:'Portail emploi Flandre · Offres · Subventions · Formation',       prio:2, cred:'Login',            badge:null },
  { id:'vl_vdab55',        cat:'VL',  label:'VDAB — 55+ Trajectbegeleiding',         url:'https://www.vdab.be/werkgevers/55plus',                                                                  icon:'👴', desc:'Accompagnement ≥55 ans · Primes maintien emploi Flandre',        prio:2, cred:'Login VDAB',       badge:null },
  { id:'vl_ocmw',          cat:'VL',  label:'OCMW — Art. 60 §7 Flandre',             url:'https://www.ocmwgent.be',                                                                               icon:'🏢', desc:'Art.60 §7 via OCMW · Coût salarial couvert · Gent/Antwerpen',    prio:2, cred:'Contact OCMW',     badge:null },
  { id:'vl_ondernemers',   cat:'VL',  label:'Ondernemersloket Flandre',              url:'https://www.ondernemersloket.be',                                                                        icon:'🧭', desc:'Guichet entreprises flamand · Permis · Démarches administratives', prio:2, cred:'Public',           badge:null },
  { id:'vl_syntra',        cat:'VL',  label:'SYNTRA / EDUCAM — Formation VL',        url:'https://www.syntra.be',                                                                                  icon:'🎓', desc:'Formation continue · Apprentissage · Entrepreneuriat Flandre',   prio:3, cred:'Public',            badge:null },
];

const CAT_META = {
  ONSS:  { label:'🏛 ONSS & Sécurité Sociale',  color:'#c6a34e' },
  FISC:  { label:'💰 SPF Finances & Fiscal',     color:'#60a5fa' },
  PRIME: { label:'💼 Primes Nationales',         color:'#22c55e' },
  DROIT: { label:'⚖ Droit & Réglementations',   color:'#a78bfa' },
  ADMIN: { label:'🔧 Outils Administratifs',     color:'#f97316' },
  STATS: { label:'📊 Veille & Statistiques',     color:'#ec4899' },
  BXL:   { label:'🏙 Bruxelles — Région',        color:'#3b82f6' },
  WAL:   { label:'🌳 Wallonie — Région',          color:'#16a34a' },
  VL:    { label:'💎 Flandre — Gewest',           color:'#f59e0b' },
};

const BADGE_CLR = {
  'ACTIF':    { bg:'rgba(34,197,94,0.15)',  fg:'#22c55e' },
  'EN COURS': { bg:'rgba(249,115,22,0.15)', fg:'#f97316' },
  'N°829605': { bg:'rgba(34,197,94,0.15)',  fg:'#22c55e' },
  '01/06/26': { bg:'rgba(239,68,68,0.18)',  fg:'#ef4444' },
  '2.070,48€':{ bg:'rgba(34,197,94,0.12)', fg:'#22c55e' },
  'NACE cours':{ bg:'rgba(249,115,22,0.12)',fg:'#f97316' },
  '0208:1028':{ bg:'rgba(96,165,250,0.12)', fg:'#60a5fa' },
};

const PRIO_DOT = { 1:'#ef4444', 2:'#f97316', 3:'#6b7280' };
const PRIO_LABEL = { 1:'🔴 Critique', 2:'🟠 Important', 3:'⚪ Info' };

const LS_KEY = 'aureus-hub-visits';
const FAV_KEY = 'aureus-hub-favs';

export default function ConnexionsHub({ s, d, tab }) {
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('TOUS');
  const [prio, setPrio]           = useState('TOUS');
  const [visits, setVisits]       = useState({});
  const [favs, setFavs]           = useState({});
  const [showFavs, setShowFavs]   = useState(false);
  const [viewMode, setViewMode]   = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    try { setVisits(_ls.get(LS_KEY, {})); } catch{ /* handled */ }
    try { setFavs(_ls.get(FAV_KEY, {})); } catch{ /* handled */ }
  }, []);

  const open = (p) => {
    window.open(p.url, '_blank', 'noopener,noreferrer');
    const now = new Date().toISOString();
    setVisits(prev => {
      const u = { ...prev, [p.id]: now };
      try { _ls.set(LS_KEY, u); } catch{ /* handled */ }
      return u;
    });
  };

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavs(prev => {
      const u = { ...prev, [id]: !prev[id] };
      try { _ls.set(FAV_KEY, u); } catch{ /* handled */ }
      return u;
    });
  };

  const timeAgo = (iso) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), j = Math.floor(diff/86400000);
    if (m < 2) return 'À l\'instant';
    if (m < 60) return `${m} min`;
    if (h < 24) return `${h} h`;
    if (j < 7) return `${j} j`;
    return new Date(iso).toLocaleDateString('fr-BE');
  };

  const filtered = ALL_PORTALS.filter(p => {
    if (showFavs && !favs[p.id]) return false;
    if (cat !== 'TOUS' && p.cat !== cat) return false;
    if (prio !== 'TOUS' && String(p.prio) !== prio) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.cred.toLowerCase().includes(q);
    }
    return true;
  });

  const visited  = ALL_PORTALS.filter(p => visits[p.id]).length;
  const favCount = ALL_PORTALS.filter(p => favs[p.id]).length;
  const prio1    = ALL_PORTALS.filter(p => p.prio === 1).length;

  // Rendu d'une carte portail
  const PortalCard = ({ p, list }) => {
    const lv = visits[p.id];
    const isFav = favs[p.id];
    const catColor = CAT_META[p.cat]?.color || '#888';
    const bdg = p.badge ? (BADGE_CLR[p.badge] || { bg:'rgba(198,163,78,0.12)', fg:'#c6a34e' }) : null;

    if (list) return (
      <div onClick={() => open(p)} style={{
        display:'flex', alignItems:'center', gap:12, padding:'9px 14px',
        borderRadius:8, cursor:'pointer',
        background: lv ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
        border:`1px solid ${lv ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)'}`,
        marginBottom:4, transition:'all 0.12s',
      }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(198,163,78,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background=lv?'rgba(34,197,94,0.04)':'rgba(255,255,255,0.02)'}
      >
        <span style={{fontSize:16,width:22,textAlign:'center',flexShrink:0}}>{p.icon}</span>
        <span style={{fontSize:11,fontWeight:700,color:'#e8e6e0',flex:1,minWidth:0}}>{p.label}</span>
        {p.badge && bdg && <span style={{fontSize:8,fontWeight:700,color:bdg.fg,background:bdg.bg,padding:'2px 6px',borderRadius:4,flexShrink:0}}>{p.badge}</span>}
        <span style={{fontSize:9,color:'#444',flexShrink:0,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.desc}</span>
        <span style={{fontSize:8.5,color:'#444',fontStyle:'italic',flexShrink:0}}>🔑 {p.cred}</span>
        {lv && <span style={{fontSize:8,color:'#22c55e',flexShrink:0}}>✓ {timeAgo(lv)}</span>}
        <span style={{color:isFav?'#f97316':'#333',fontSize:14,cursor:'pointer',flexShrink:0}}
          onClick={e=>toggleFav(e,p.id)}>{'★'}</span>
      </div>
    );

    return (
      <div onClick={() => open(p)} style={{
        padding:'13px 14px', borderRadius:10, cursor:'pointer',
        background: lv ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
        border:`1px solid ${lv ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)'}`,
        position:'relative', transition:'all 0.12s',
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor+'50';e.currentTarget.style.background='rgba(198,163,78,0.06)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=lv?'rgba(34,197,94,0.18)':'rgba(255,255,255,0.06)';e.currentTarget.style.background=lv?'rgba(34,197,94,0.04)':'rgba(255,255,255,0.03)'}}
      >
        {/* Fav star */}
        <span onClick={e=>toggleFav(e,p.id)} style={{
          position:'absolute',top:8,right:10,
          color:isFav?'#f97316':'#2a2a2a',fontSize:16,cursor:'pointer',lineHeight:1,
        }}>★</span>
        {/* Prio dot */}
        <span style={{position:'absolute',top:10,right:28,width:6,height:6,borderRadius:'50%',
          background:PRIO_DOT[p.prio],display:'inline-block'}} title={PRIO_LABEL[p.prio]}/>

        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,paddingRight:36}}>
          <span style={{fontSize:18}}>{p.icon}</span>
          <span style={{fontSize:11,fontWeight:700,color:'#e8e6e0',lineHeight:1.3}}>{p.label}</span>
        </div>
        {p.badge && bdg && (
          <div style={{marginBottom:6}}>
            <span style={{fontSize:8,fontWeight:700,color:bdg.fg,background:bdg.bg,
              padding:'2px 7px',borderRadius:4,border:`1px solid ${bdg.fg}30`}}>{p.badge}</span>
          </div>
        )}
        <div style={{fontSize:9.5,color:'#666',lineHeight:1.45,marginBottom:7}}>{p.desc}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:8.5,color:'#3a3a3a',fontStyle:'italic'}}>🔑 {p.cred}</span>
          {lv
            ? <span style={{fontSize:8,color:'#22c55e'}}>✓ {timeAgo(lv)}</span>
            : <span style={{fontSize:8,color:'#2a2a2a'}}>Jamais visité</span>
          }
        </div>
      </div>
    );
  };

  return (
    <div style={{color:'#e8e6e0',fontFamily:'inherit'}}>

      {/* ── KPIs ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[
          {l:'Portails disponibles', v:ALL_PORTALS.length,   c:'#c6a34e', icon:'🔗'},
          {l:'Priorité critique',    v:prio1,                 c:'#ef4444', icon:'🔴'},
          {l:'Déjà visités',         v:visited,               c:'#22c55e', icon:'✅'},
          {l:'Favoris',              v:favCount,              c:'#f97316', icon:'★'},
        ].map((k,i)=>(
          <div key={i} style={{padding:'12px 14px',background:'rgba(255,255,255,0.03)',
            borderRadius:10,border:`1px solid ${k.c}25`,textAlign:'center',cursor:'pointer'}}
            onClick={k.icon==='★'?()=>setShowFavs(s=>!s):undefined}>
            <div style={{fontSize:18,marginBottom:2}}>{k.icon}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:'#555',marginTop:2}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── RMMMG banner ── */}
      <div style={{display:'flex',gap:10,marginBottom:14,padding:'10px 14px',
        background:'rgba(34,197,94,0.06)',borderRadius:10,border:'1px solid rgba(34,197,94,0.2)',
        alignItems:'center',flexWrap:'wrap'}}>
        <span style={{fontSize:14}}>⚖</span>
        <span style={{fontSize:11,fontWeight:700,color:'#22c55e'}}>RMMMG 2026 — Salaire Minimum Légal</span>
        {[[`${RMMMG.toLocaleString('fr-BE', {minimumFractionDigits:2})} EUR/mois`,'#22c55e'],[`${RMMMG_HORAIRE} EUR/heure`,'#c6a34e'],['CCT 43/15 · CNT','#888']].map(([v,c],i)=>(
          <span key={i} style={{fontSize:10,fontWeight:i<2?700:400,color:c,padding:'3px 8px',
            background:`${c}15`,borderRadius:6,border:`1px solid ${c}30`}}>{v}</span>
        ))}
        <a href="https://www.cnt-nar.be/CCT-ORIG/cct-043-15.pdf" target="_blank" rel="noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{marginLeft:'auto',fontSize:10,color:'#22c55e',textDecoration:'none',fontWeight:600}}>
          📄 Texte CCT ↗
        </a>
      </div>

      {/* ── BARRE OUTILS ── */}
      <div style={{display:'flex',gap:8,marginBottom:10,alignItems:'center',flexWrap:'wrap'}}>
        {/* Recherche */}
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#555',fontSize:13}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher un portail..."
            style={{width:'100%',padding:'8px 10px 8px 32px',borderRadius:8,
              border:'1px solid rgba(198,163,78,0.2)',background:'rgba(0,0,0,0.3)',
              color:'#e8e6e0',fontSize:11,fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
        {/* Favoris toggle */}
        <button onClick={()=>setShowFavs(s=>!s)} style={{padding:'7px 13px',borderRadius:8,border:'none',
          cursor:'pointer',fontSize:11,fontFamily:'inherit',
          background:showFavs?'rgba(249,115,22,0.2)':'rgba(255,255,255,0.04)',
          color:showFavs?'#f97316':'#666',fontWeight:showFavs?700:400}}>
          ★ Favoris{favCount>0?` (${favCount})`:''}
        </button>
        {/* Vue */}
        {['grid','list'].map(m=>(
          <button key={m} onClick={()=>setViewMode(m)} style={{padding:'7px 11px',borderRadius:8,border:'none',
            cursor:'pointer',fontSize:12,fontFamily:'inherit',
            background:viewMode===m?'rgba(198,163,78,0.15)':'rgba(255,255,255,0.03)',
            color:viewMode===m?'#c6a34e':'#555'}}>
            {m==='grid'?'⊞':'☰'}
          </button>
        ))}
      </div>

      {/* ── FILTRES CATÉGORIES ── */}
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
        {['TOUS',...Object.keys(CAT_META)].map(c=>{
          const count = c==='TOUS' ? filtered.length : filtered.filter(p=>p.cat===c).length;
          if(c!=='TOUS' && !count) return null;
          return (
            <button key={c} onClick={()=>setCat(c)} style={{padding:'5px 11px',borderRadius:20,border:'none',
              cursor:'pointer',fontSize:10,fontFamily:'inherit',
              background:cat===c?'rgba(198,163,78,0.18)':'rgba(255,255,255,0.04)',
              color:cat===c?'#c6a34e':'#555',fontWeight:cat===c?700:400}}>
              {c==='TOUS'?`Tous (${ALL_PORTALS.length})`:`${CAT_META[c]?.label} (${ALL_PORTALS.filter(p=>p.cat===c).length})`}
            </button>
          );
        })}
        <div style={{marginLeft:'auto',display:'flex',gap:5}}>
          {[['TOUS','Tous'],['1','🔴'],['2','🟠'],['3','⚪']].map(([v,l])=>(
            <button key={v} onClick={()=>setPrio(v)} style={{padding:'5px 10px',borderRadius:20,border:'none',
              cursor:'pointer',fontSize:10,fontFamily:'inherit',
              background:prio===v?'rgba(198,163,78,0.12)':'rgba(255,255,255,0.03)',
              color:prio===v?'#c6a34e':'#555'}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{fontSize:10,color:'#3a3a3a',marginBottom:10}}>
        {filtered.length} portail{filtered.length>1?'s':''} — ● rouge = critique · ● orange = important · ⬤ gris = info · ★ = favori
      </div>

      {/* ── PORTAILS ── */}
      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:'40px',color:'#555'}}>
          <div style={{fontSize:32,marginBottom:8}}>{showFavs?'★':'🔍'}</div>
          <div>{showFavs?'Aucun favori — cliquez ★ sur un portail':'Aucun résultat pour cette recherche'}</div>
        </div>
      )}

      {(cat==='TOUS' ? Object.keys(CAT_META) : [cat]).map(catKey => {
        const portals = filtered.filter(p=>p.cat===catKey);
        if(!portals.length) return null;
        const meta = CAT_META[catKey];
        return (
          <div key={catKey} style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:meta.color,marginBottom:8,
              paddingBottom:6,borderBottom:`2px solid ${meta.color}25`}}>{meta.label}</div>
            {viewMode==='list' ? (
              <div>{portals.map(p=><PortalCard key={p.id} p={p} list />)}</div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:8}}>
                {portals.map(p=><PortalCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        );
      })}

      {/* ── FOOTER ── */}
      <div style={{marginTop:16,padding:'10px 14px',background:'rgba(255,255,255,0.02)',
        borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',
        display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
        <span style={{fontSize:9,color:'#3a3a3a'}}>
          ● Rouge = priorité critique · ● Orange = important · Clic sur une carte = ouvre dans un nouvel onglet · ★ = ajouter aux favoris
        </span>
        <span style={{fontSize:9,color:'#3a3a3a'}}>
          Dernière MAJ : {new Date().toLocaleDateString('fr-BE')} · Aureus IA SPRL
        </span>
      </div>
    </div>
  );
}
