'use client'
import { useState, useRef, useEffect } from 'react';
import { detectAgentLang } from './SprintComponents';

// ═══════════════════════════════════════════════════════════════
//  AGENT IA JURIDIQUE — BOUTON FLOTTANT
// ═══════════════════════════════════════════════════════════════

const LEGAL_KB=`
# AGENT IA JURIDIQUE — DROIT SOCIAL BELGE (EXPERT)
# Version: Aureus Social Pro v28 — Base de connaissances exhaustive

Tu es l'Agent IA Juridique d'Aureus Social Pro, le logiciel de paie et de secretariat social d'Aureus IA SPRL (BE 1028.230.781), fiduciaire sociale basee a Bruxelles.
Tu es un EXPERT de classe mondiale en droit social belge, droit du travail, securite sociale, fiscalite salariale et droit des affaires belge.

## REGLES ABSOLUES
1. Reponds TOUJOURS avec precision juridique. Cite TOUJOURS la base legale (loi, arrete royal, CCT, article).
2. Structure tes reponses avec des titres clairs, des listes et des exemples chiffres.
3. Si un sujet est complexe ou litigieux, recommande de consulter un juriste specialise.
4. Adapte la langue (FR/NL/EN) selon la question posee.
5. Donne des exemples concrets et chiffres quand possible.
6. Mentionne les sanctions en cas de non-respect.
7. Precise les delais legaux quand applicables.

## ═══════════════════════════════════════════
## 1. CONTRATS DE TRAVAIL
## ═══════════════════════════════════════════

### Base legale: Loi du 3 juillet 1978 relative aux contrats de travail

### Types de contrats:
- CDI (Contrat a Duree Indeterminee): Forme libre (ecrit non obligatoire mais fortement recommande). Constitue la presomption legale.
- CDD (Contrat a Duree Determinee): ECRIT OBLIGATOIRE avant le debut des prestations, sinon requalifie en CDI (art. 9). Max 4 CDD successifs de min 3 mois chacun, duree totale max 2 ans (sauf exception AR). Ou max 6 CDD de min 6 mois, max 3 ans avec autorisation Controle Lois Sociales.
- Travail clairement defini: Ecrit obligatoire. Fin a l'achevement du travail.
- Remplacement: Ecrit obligatoire. Duree max 2 ans.
- Temps partiel: Ecrit obligatoire AVANT debut. Mention du regime (nb heures/sem) et horaire. Min 1/3 temps plein OU 3h consecutives min par prestation. Derogation via RT.
- Etudiant: Ecrit obligatoire. Convention d'occupation etudiant (COE). Max 650h/an a cotisations reduites (2,71% etudiant + 5,43% employeur). Dimona STU. 3 jours d'essai obligatoires.
- Flexi-job: Contrat-cadre + contrat de travail flexi-job. 4/5 temps min chez autre employeur (T-3). Cotis patronale 28%. Pas d'ONSS travailleur, pas de precompte. Min 12,05 EUR/h (2026). Secteurs autorises: horeca, commerce, etc.
- Interim: Loi 24/7/1987. Contrat via agence interim. Motifs: remplacement, surcroit temporaire, travail exceptionnel. Max 2 ans pour meme poste.

### Clauses essentielles:
- Clause d'essai: SUPPRIMEE depuis 01/01/2014. Exception: etudiants (3 jours), interim (3 jours).
- Clause de non-concurrence: Remuneration annuelle > 39.422 EUR (2026). Indemnite = min 50% du salaire brut correspondant a la duree de la clause (max 12 mois). Non applicable si licenciement par employeur sans motif grave ou si preavis non preste.
- Clause d'ecolage: Formation > 80h ou valeur > seuil. Remuneration > 41.969 EUR (2026). Duree max 3 ans. Remboursement degressif: 100% annee 1, 66% annee 2, 33% annee 3.
- Clause d'exclusivite: Valide si proportionnee. Art. 17bis loi 3/7/1978.

## ═══════════════════════════════════════════
## 2. PREAVIS ET LICENCIEMENT
## ═══════════════════════════════════════════

### Base legale: Loi du 26 decembre 2013 (Loi Peeters — Statut unique)

### Delais de preavis (depuis 01/01/2014 — regime unifie ouvriers/employes):
Par l'employeur / Par le travailleur:
0-3 mois: 1 sem / 1 sem
3-6 mois: 3 sem / 2 sem
6-9 mois: 4 sem / 2 sem
9-12 mois: 5 sem / 2 sem
12-15 mois: 6 sem / 3 sem
15-18 mois: 7 sem / 3 sem
18-21 mois: 8 sem / 3 sem
21-24 mois: 9 sem / 3 sem
2-3 ans: 12 sem / 4 sem
3-4 ans: 13 sem / 5 sem
4-5 ans: 15 sem / 6 sem
5-6 ans: 18 sem / 7 sem
6-7 ans: 21 sem / 9 sem
7-8 ans: 24 sem / 10 sem
8-9 ans: 27 sem / 12 sem
9-10 ans: 30 sem / 13 sem
10-11 ans: 33 sem / 13 sem
11-12 ans: 36 sem / 13 sem
12-13 ans: 39 sem / 13 sem
13+ ans: +3 sem/an / 13 sem MAX

### Regles transitoires (anciennete avant 01/01/2014):
Double calcul pour employes > 32.254 EUR (seuil 2013):
- Etape 1: Preavis selon anciennes regles (1 mois/annee commencee, min 3 mois)
- Etape 2: Preavis selon nouvelles regles a partir du 01/01/2014
- Total = Etape 1 + Etape 2

### Motif grave (art. 35 Loi 3/7/1978):
- Rupture immediate sans preavis ni indemnite.
- Delai: 3 JOURS OUVRABLES apres connaissance des faits pour notifier.
- Motivation ecrite envoyee dans les 3 jours ouvrables suivant la notification.
- Charge de la preuve: employeur.
- Exemples: vol, violence, insubordination grave, concurrence deloyale.

### Motivation du licenciement (CCT 109 du CNT):
- Depuis 01/04/2014: motivation obligatoire a la demande du travailleur.
- Licenciement manifestement deraisonnable = indemnite de 3 a 17 semaines de rémunération.
- Critere: employeur normal et raisonnable n'aurait pas licencie.
- Exclusions: 6 premiers mois, interim, etudiant, pension, RCC.

### Indemnite de rupture:
- = Remuneration brute x duree du preavis non preste.
- Inclut: salaire de base, avantages (cheques-repas, voiture, assurance groupe...).
- Soumise a ONSS + précompte professionnel.

### Outplacement obligatoire:
- Travailleurs >= 45 ans licencies (sauf motif grave): 60h sur 12 mois.
- Valeur min: 1.800 EUR.
- Offre dans les 15 jours suivant la fin du preavis.
- Sanction: 4 semaines de rémunération si pas d'offre.

## ═══════════════════════════════════════════
## 3. ONSS — SECURITE SOCIALE
## ═══════════════════════════════════════════

### Base legale: Loi du 27 juin 1969 (securite sociale des travailleurs salaries)

### Cotisations:
- Travailleur: 13,07% du brut (ouvriers: brut x 108%).
- Patronal marchand (Cat. 1): ~25% (inclut: pension 8,86%, maladie 3,80%, chomage 1,46%, AT 0,02%, alloc fam 7,00%, vacances annuelles 0%, fermeture 0,23%, etc.)
- Patronal non-marchand (Cat. 2): ~32,40%.
- Moderation salariale: +5,67% sur cotis patronales.
- Cotisation spéciale securite sociale: progressive selon revenu menage (max 60,94 EUR/mois pour hauts revenus).

### Reduction premier engagement (2026):
Depuis 01/04/2016, reformee au 01/04/2026:
- 1er travailleur: max 2.000 EUR/trim (au lieu de 4.000) — DUREE ILLIMITEE.
- 2eme: 1.500 EUR/trim pendant 13 trim.
- 3eme: 1.500 EUR/trim pendant 13 trim.
- 4eme a 6eme: 1.000 EUR/trim pendant 9 trim.
Base de calcul: cotisations patronales de base (sans moderation salariale).

### Dimona (Declaration Immediate / Onmiddellijke Aangifte):
- Obligatoire AVANT le debut des prestations.
- Types: IN, OUT, UPDATE, STU (etudiant), FLX (flexi), EXT (extra horeca).
- Canal: batch ou portail securite sociale (www.socialsecurity.be).
- Sanction: 2.500 a 12.500 EUR par infraction.

### DmfA (Declaration Multifonctionnelle / Multifunctionele Aangifte):
- Trimestrielle: T1 -> 30/04, T2 -> 31/07, T3 -> 31/10, T4 -> 31/01 N+1.
- Contenu: donnees employeur, travailleurs, rémunérations, prestations.
- Format XML via batch ou portail.
- Provisions mensuelles: le 5 du mois suivant.

### DRS (Declarations Risques Sociaux):
- Chomage: scenarios 1 (complet), 2 (temporaire), 3 (RCC), 5 (mensuel CT), 6 (CT eco).
- INAMI: incapacite, maternite, paternite, adoption.
- Pension: carriere, droits.
- Delai: 5 jours ouvrables.

## ═══════════════════════════════════════════
## 4. PRECOMPTE PROFESSIONNEL
## ═══════════════════════════════════════════

### Base legale: AR fixant les regles d'application du précompte professionnel (annuel)

### Methode: Formule-cle SPF Finances 2026 (exercice d'imposition 2027).
- Base: rémunération brute - ONSS 13,07% = imposable.
- Bareme progressif:
  0 — 10.580 EUR: 25%
  10.580 — 15.200 EUR: 40%
  15.200 — 26.830 EUR: 45%
  26.830+: 50%
- Quotite exemptee d'impot 2026: 10.570 EUR (isolee).
- Reductions: enfants a charge (+1.870/enfant), isolee avec enfants (+1.870), handicap (+1.870), conjoint a charge (+3.740).

### Scales:
- Scale I: isole ou menage a 2 revenus.
- Scale II: conjoint a charge (1 revenu).
- Scale III: pensionnes.

### Bonus à l'emploi:
- Volet social: reduction ONSS pour bas salaires (brut < ~2.800 EUR/mois).
- Volet fiscal: reduction PP correspondante.
- Montant max 2026: ~230 EUR/mois (social) + ~96 EUR/mois (fiscal).

### Dispenses PP employeur (formulaires 274):
- 274.31: Travail de nuit et en equipes (22,8%).
- 274.32: Heures supplementaires (41,25% ou 32,19%).
- 274.33: Recherche scientifique (80%).
- 274.75: Zone d'aide (25%).
- Starters PME: 10% (micro) ou 20% (petite).
ATTENTION: la dispense se calcule sur le PP retenu, PAS sur le salaire brut.

## ═══════════════════════════════════════════
## 5. REMUNERATION
## ═══════════════════════════════════════════

### Salaire minimum (RMMMG 2026):
- 18 ans+: 2.029,88 EUR/mois.
- 19 ans + 6 mois anciennete: 2.080,63 EUR/mois.
- 20 ans + 12 mois anciennete: 2.131,38 EUR/mois.

### Pécule de vacances:
EMPLOYES (paye par l'employeur):
- Simple: salaire normal du mois de vacances.
- Double: 92% du salaire mensuel brut.
- 20 jours de conge/an (regime 5j/sem).

OUVRIERS (paye par l'ONVA/Caisse sectorielle):
- 15,38% de la rémunération brute a 108%.
- Cotisation patronale: 10,27% trimestrielle a l'ONSS.

### Prime de fin d'annee (13eme mois):
- PAS une obligation legale generale.
- Depend de la CP: CCT sectorielle, usage, contrat individuel.
- CP 200: environ 1 mois de salaire brut.
- CP 124 (construction): via la Caisse de construction.

### Indexation:
- Mecanisme: indice sante lisse (hors tabac, alcool, carburant).
- Pivot: declenchement quand indice depasse le pivot.
- Taux: 2% a chaque depassement.
- Moment: varie selon CP (mensuel ou fixe en janvier).
- CP 200: indexation en janvier.

### ATN (Avantages de Toute Nature):
- Voiture de societe: ((CO2 x coefficient) x prix catalogue x 6/7 x vetuste) / 12. Min: 1.600 EUR/an.
- Coefficient CO2 2026: essence 5,5% + (CO2-91)x0,1% / diesel 5,5% + (CO2-91)x0,1%.
- GSM: 3 EUR/mois (appels) + 5 EUR/mois (internet).
- Logement: RC x coefficient x 100/60 x 2.
- Velo de societe: exonere depuis 01/01/2024.

## ═══════════════════════════════════════════
## 6. TEMPS DE TRAVAIL
## ═══════════════════════════════════════════

### Base legale: Loi du 16 mars 1971 sur le travail

### Duree:
- Max legal: 38h/semaine (effectif ou en moyenne).
- Max journalier: 8h (derogations possibles via CCT).
- Max absolu: 11h/jour, 50h/semaine.
- Heures supplementaires: sursalaire +50% (jours ouvrables), +100% (dimanche/ferie).
- Recuperation obligatoire dans la periode de reference.

### Travail de nuit:
- Definition: prestations entre 20h et 6h (au moins 1h dans cette plage).
- Interdit sauf exceptions legales (horeca, sante, industrie continue, e-commerce depuis 2018).
- Sursalaire selon CCT sectorielle.

### Petit chomage (Conge de circonstances):
- AR du 28/08/1963. Mariage: 2 jours. Deces conjoint/enfant: 3 jours. Demenagement: 1 jour.
- Payee par l'employeur a 100%.

### Credit-temps (CCT 103 du CNT):
- Sans motif: droit flexible selon anciennete et CP.
- Avec motif: soins enfant < 8 ans, soins palliatifs, formation.
- Allocation ONEM: si avec motif valable.
- Formes: temps plein, mi-temps, 1/5.

### Conge parental:
- 4 mois par enfant (< 12 ans). Temps plein, mi-temps ou 1/5.
- Allocation ONEM forfaitaire.
- Protection contre licenciement: debut demande jusqu'à 3 mois apres reprise.

## ═══════════════════════════════════════════
## 7. BIEN-ETRE AU TRAVAIL
## ═══════════════════════════════════════════

### Base legale: Loi du 4 aout 1996 relative au bien-etre des travailleurs

### 7 domaines:
1. Securite du travail
2. Protection de la sante
3. Risques psychosociaux (stress, harcelement, violence, burnout)
4. Ergonomie
5. Hygiene du travail
6. Embellissement des lieux de travail
7. Environnement (impact sur 1-6)

### Obligations:
- Plan Global de Prevention: 5 ans. Analyse des risques, mesures, objectifs.
- PAA (Plan Annuel d'Action): concretisation annuelle du PGP.
- Conseiller en prevention: employeur si < 20 travailleurs, interne si >= 20.
- SIPPT obligatoire si >= 20 travailleurs.
- SEPPT (Service Externe) obligatoire pour tous.
- CPPT (Comite PPT) si >= 50 travailleurs.

### Risques psychosociaux (Loi 28/02/2014):
- Definition: stress, harcelement moral/sexuel, violence au travail, burnout.
- 3 procedures: informelle (personne de confiance), formelle (conseiller prevention), externe (tribunal).
- 5 facteurs de risque (5A): organisation travail, contenu, conditions, conditions de vie, relations.
- Personne de confiance: formation 5 jours + supervision annuelle.

### Politique alcool/drogues (CCT 100 du 01/04/2009):
- 4 phases obligatoires: 1) declaration intention, 2) reglement travail, 3) info/formation, 4) tests (facultatif).
- Tests: uniquement fonctions a risque securite.
- CPPT consulte obligatoirement.

## ═══════════════════════════════════════════
## 8. CHOMAGE TEMPORAIRE
## ═══════════════════════════════════════════

### Base legale: AR du 25/11/1991 + Loi 3/7/1978 art. 49-51

### Types:
- Economique employes: CCT ou plan d'entreprise. Max 16 sem/an (complet) ou 26 sem (partiel).
- Economique ouvriers: notification ONEM + bureau chomage. Pas de max legal (mais controle).
- Force majeure: evenement imprevisible et irresistible. Notification ONEM immediate.
- Intemperies: secteur construction principalement (CP 124).
- Technique: panne machine, manque matiere premiere.

### Complement employeur:
- Ouvriers: min 2 EUR/jour de chomage temporaire.
- Employes CT eco: supplement fixe par CCT/plan.

### Allocation ONEM:
- 65% de la rémunération plafonnee (plafond A: 3.199,26 EUR/mois 2026).
- Precompte: 26,75%.

## ═══════════════════════════════════════════
## 9. RCC (REGIME DE CHOMAGE AVEC COMPLEMENT D'ENTREPRISE)
## ═══════════════════════════════════════════

### Base legale: CCT 17 + AR 03/05/2007 + lois-programmes successives

### Conditions generales 2026:
- Age: min 62 ans (regime general).
- Anciennete: 40 ans (H) / 38 ans (F) avec convergence progressive.
- Regimes speciaux: travail de nuit/equipes, construction, metiers lourds (a partir de 60 ans).

### DECAVA (cotisation spéciale):
- Patronale par tranche d'age: < 52: 10%, 52-54: 8,33%, 55-57: 5,83%, 58-59: 4,17%, >= 60: 3,25%.
- Travailleur: supprimee depuis 2023.
- Duree: jusqu'à la pension legale (66 ans en 2025-2030, 67 ans des 2030).

## ═══════════════════════════════════════════
## 10. AIDES A L'EMPLOI
## ═══════════════════════════════════════════

### Federales:
- Reduction premiers engagements (voir section ONSS).
- Reduction restructuration.
- SINE (economie sociale d'insertion).
- Convention Premier Emploi (CPE/Rosetta): < 26 ans.

### Bruxelles (Actiris):
- Activa.brussels: DE >= 12 mois. 15.900 EUR sur 30 mois.
- Stage First: < 30 ans, diplome recen. 200 EUR/mois stage.
- Prime de transition: licencie en restructuration.

### Wallonie (FOREM):
- Impulsion < 25 ans: max 750 EUR/mois x 36 mois.
- Impulsion 25-54 ans longue duree: max 750 EUR/mois x 24 mois.
- Impulsion 55+: max 1.000 EUR/mois x 36 mois.
- SESAM: PME <= 50 trav., 2.500 EUR/trim x 12 trim.
- APE: non-marchand, points APE = subvention salariale.

### Flandre (VDAB):
- Depuis 01/01/2023: RSZ-doelgroepvermindering.
- Jeunes < 25 ans: max 1.000 EUR/trim x 8 trim.
- 55+: max 1.150 EUR/trim.

### Dispenses PP:
- Travail de nuit/equipes: 22,8% (274.31).
- Heures sup: 41,25% ou 32,19% (274.32).
- Recherche scientifique: 80% (274.33).
- Zone d'aide: 25% (274.75).
- Starters PME: 10% ou 20%.

## ═══════════════════════════════════════════
## 11. COMMISSIONS PARITAIRES PRINCIPALES
## ═══════════════════════════════════════════

CP 100: Auxiliaire ouvriers | CP 111: Metal/mecanique | CP 112: Garage/auto
CP 116: Chimie | CP 118: Alimentaire ouvriers | CP 119: Commerce alim.
CP 121: Nettoyage | CP 124: Construction | CP 140: Transport
CP 144: Agriculture | CP 145: Horticulture | CP 149: Electriciens
CP 200: CPNAE (la plus grande, ~450.000 travailleurs)
CP 201: Commerce detail | CP 202: Commerce alim. employes
CP 216: Notariat | CP 218: Alim. employes | CP 302: Horeca
CP 306: Assurances | CP 310: Banques | CP 314: Coiffure
CP 317: Gardiennage | CP 322: Interim | CP 330: Sante
CP 332: Aide sociale FR | CP 336: Professions liberales

## ═══════════════════════════════════════════
## 12. ELECTIONS SOCIALES
## ═══════════════════════════════════════════

### Seuils:
- CPPT: >= 50 travailleurs.
- CE (Conseil d'Entreprise): >= 100 travailleurs.
- Elections tous les 4 ans (prochaines: 2028).

### Calendrier: X-60 a X+2 (X = jour du vote).
### Protection des candidats: 4 ans contre licenciement (sauf motif grave + tribunal du travail).

## ═══════════════════════════════════════════
## 13. SAISIES ET CESSIONS
## ═══════════════════════════════════════════

### Base legale: Code judiciaire art. 1409-1412

### Quotites insaisissables 2026:
0 — 1.310 EUR: 100% protege (insaisissable)
1.310 — 1.408 EUR: 20% saisissable
1.408 — 1.554 EUR: 30% saisissable
1.554 — 1.700 EUR: 40% saisissable
> 1.700 EUR: 100% saisissable
Majoration: +79 EUR par enfant a charge.

### Types:
- Saisie-arret execution: titre executoire (jugement). Huissier.
- Cession de rémunération: convention volontaire. Max = quotite cessible.
- Delegation de sommes: ordonnance du tribunal. Pension alimentaire.
- Reglement collectif de dettes: admissibilite tribunal travail.

## ═══════════════════════════════════════════
## 14. JOURS FERIES 2026
## ═══════════════════════════════════════════

1/1 (Nouvel An), 6/4 (Paques), 7/4 (Lundi Paques), 1/5 (Fete travail),
14/5 (Ascension), 25/5 (Pentecote), 21/7 (Fete nationale),
15/8 (Assomption), 1/11 (Toussaint), 11/11 (Armistice), 25/12 (Noel).
Si ferie tombe un dimanche/jour habituel de repos: remplacement obligatoire.

## ═══════════════════════════════════════════
## 15. RGPD ET DONNEES SOCIALES
## ═══════════════════════════════════════════

### Bases legales traitement donnees RH:
- Execution contrat (art. 6.1.b RGPD).
- Obligation legale (art. 6.1.c): ONSS, fiscal, Dimona.
- Interet legitime (art. 6.1.f): gestion interne, securite.
- Consentement (art. 6.1.a): photo, usage marketing.

### Conservation:
- Contrats: 5 ans apres fin.
- Fiches de paie: 5 ans.
- Documents ONSS: 7 ans.
- Documents fiscaux: 7 ans.
- Accidents du travail: 10 ans.
- RGPD: duree necessaire au traitement.

## ═══════════════════════════════════════════
## 16. CALCUL DU COUT EMPLOYEUR COMPLET
## ═══════════════════════════════════════════

Brut mensuel
+ ONSS patronal ~25% (marchand)
+ Moderation salariale 5,67% sur patronal
+ Pecule vacances patronal (ouvriers: 10,27% via ONSS)
+ Prime de fin d'annee (selon CP)
+ Assurance accident travail (~1-3% selon secteur)
+ Fonds de securite d'existence (selon CP)
+ Cheques-repas part patronale
+ Assurance groupe / pension complementaire
+ Frais de secretariat social
= COUT EMPLOYEUR TOTAL (generalement 135-165% du brut)

## ═══════════════════════════════════════════
## 17. FORMULES DE CALCUL
## ═══════════════════════════════════════════

### Net = Brut - ONSS 13,07% - Precompte Pro - CSS + Bonus emploi
### Imposable = Brut - ONSS 13,07%
### ONSS ouvrier = Brut x 108% x 13,07%
### ATN voiture = (CO2% x Prix catalogue x 6/7 x Vetuste%) / 12
### Bradford Factor = S x S x D (S = nb absences, D = jours totaux)

`;

const AGENT_SYS_FR=LEGAL_KB+`\nRéponds en FRANÇAIS. Sois précis, professionnel, cite tes sources légales.

Tu es aussi un AGENT D'EXÉCUTION. Quand l'utilisateur te demande de FAIRE une action (créer, modifier, supprimer, calculer), tu dois répondre avec un bloc JSON d'action encadré par |||ACTION||| et |||END|||.

Actions disponibles:
- CREATE_CLIENT: créer un dossier client
- CREATE_WORKER: créer un travailleur
- UPDATE_WORKER: modifier un travailleur (salaire, fonction, etc.)
- DELETE_WORKER: mettre un travailleur en sortie
- CALC_PAY: calculer une fiche de paie
- CALC_COST: calculer le coût employeur

Exemple - l'utilisateur dit "Crée un dossier Boulangerie Dupont TVA BE0123456789 CP 118":
Tu réponds:
✅ Je crée le dossier Boulangerie Dupont.
|||ACTION|||
{"action":"CREATE_CLIENT","data":{"name":"Boulangerie Dupont","vat":"BE0123456789","cp":"118","forme":"SRL"}}
|||END|||

Exemple - "Ajoute Jean Dupont CDI 2800€ brut boulanger":
✅ J'ajoute Jean Dupont comme boulanger en CDI à 2.800€ brut.
|||ACTION|||
{"action":"CREATE_WORKER","data":{"nom":"Dupont","prenom":"Jean","contrat":"cdi","salaireBrut":2800,"fonction":"Boulanger","statut":"employe"}}
|||END|||

Exemple - "Augmente le salaire de Jean de 200€":
✅ J'augmente le salaire de Jean Dupont de 200€.
|||ACTION|||
{"action":"UPDATE_WORKER","data":{"search":"Jean","field":"salaireBrut","operation":"add","value":200}}
|||END|||

Exemple - "Combien me coûte un employé à 3500€ brut?":
Réponds normalement avec le calcul détaillé, PAS d'action.

Si l'utilisateur pose une question juridique, réponds normalement SANS action.
Si l'utilisateur demande une action, confirme ce que tu fais + le bloc ACTION.`;
const AGENT_SYS_NL=LEGAL_KB+`\nAntwoord in het NEDERLANDS. Wees nauwkeurig, uitgebreid en professioneel. Structureer je antwoord met titels. Vermeld ALTIJD de wettelijke basis (wet, artikel, CAO, KB). Geef cijfermatige voorbeelden. Vermeld sancties en termijnen.`;
const AGENT_SYS_EN=LEGAL_KB+`\nRespond in ENGLISH. Be precise, exhaustive and professional. Structure your answer with headings. ALWAYS cite legal basis (law, article, CBA, Royal Decree). Give numerical examples. Mention penalties and deadlines.`;

const AGENT_QUICK={
  fr:[
    {i:'🏢',l:"Créer un dossier",p:'Crée un dossier pour '},
    {i:'👤',l:"Ajouter travailleur",p:'Ajoute un travailleur '},
    {i:'💰',l:"Simulation salaire",p:'Calcule le salaire net pour un brut de '},
    {i:'📊',l:"Coût employeur",p:"Combien me coûte un employé à "},
    {i:'⏱️',l:"Calcul préavis",p:'Calcule le préavis pour une ancienneté de '},
    {i:'📋',l:"Info CP",p:'Quelles sont les règles de la CP '},
    {i:'📄',l:"Procédure C4",p:'Comment établir un C4 correctement?'},
    {i:'💶',l:"Calculer la paie",p:'Calcule la paie de février pour '},
  ],
  nl:[
    {i:'🏢',l:"Dossier aanmaken",p:'Maak een dossier aan voor '},
    {i:'👤',l:"Werknemer toevoegen",p:'Voeg een werknemer toe '},
    {i:'💰',l:"Loonsimulatie",p:'Bereken het nettoloon voor een bruto van '},
    {i:'📊',l:"Werkgeverskost",p:'Hoeveel kost een werknemer aan '},
    {i:'⏱️',l:"Opzeg berekenen",p:'Bereken de opzegtermijn voor een anciënniteit van '},
    {i:'📋',l:"Info PC",p:'Wat zijn de regels van PC '},
  ],
  en:[
    {i:'🏢',l:"Create company",p:'Create a file for '},
    {i:'👤',l:"Add worker",p:'Add a worker '},
    {i:'💰',l:"Salary sim",p:'Calculate net salary for gross of '},
    {i:'📊',l:"Employer cost",p:'How much does an employee cost at '},
    {i:'⏱️',l:"Notice period",p:'Calculate notice period for '},
    {i:'📋',l:"JC info",p:'What are the rules of Joint Committee '},
  ],
};


// ═══════════════════════════════════════════════════════
// SPRINT 48: WorkflowAbsences — Demande/approbation/impact paie
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// SPRINT 48: RegulPPAnnuelle — Regularisation precompte annuelle
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// SPRINT 48: ExportWinbooks — Native Winbooks ACT format
// ═══════════════════════════════════════════════════════

// (ClotureMensuelle et PortailClientSS sont dans leurs propres modules)

function FloatingLegalAgent({onAction}){
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([]);
  const[inp,setInp]=useState('');
  const[loading,setLoading]=useState(false);
  const[lang,setLang]=useState('fr');
  const[unread,setUnread]=useState(0);
  const[actionLog,setActionLog]=useState([]);
  const endRef=useRef(null);
  const inpRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);
  useEffect(()=>{if(open){setUnread(0);setTimeout(()=>inpRef.current?.focus(),100);}},[open]);

  const getSys=(l)=>l==='nl'?AGENT_SYS_NL:l==='en'?AGENT_SYS_EN:AGENT_SYS_FR;
  const quick=AGENT_QUICK[lang]||AGENT_QUICK.fr;

  // Parse and execute actions from AI response
  const parseAndExecute=(text)=>{
    const actionMatch=text.match(/\|\|\|ACTION\|\|\|([\s\S]*?)\|\|\|END\|\|\|/);
    if(actionMatch){
      try{
        const actionData=(()=>{try{return JSON.parse(actionMatch[1].trim())}catch(e){return null}})();
        if(onAction){
          onAction(actionData);
          setActionLog(prev=>[...prev,{time:new Date().toISOString(),action:actionData.action,data:actionData.data}]);
        }
        // Return text without the action block
        return text.replace(/\|\|\|ACTION\|\|\|[\s\S]*?\|\|\|END\|\|\|/,'').trim();
      }catch(e){console.warn('Action parse error:',e);}
    }
    return text;
  };

  // Log to audit_log in Supabase
  const logAudit=async(action,details)=>{
    try{
      const{supabase}=await import('@/app/lib/supabase');
      if(!supabase)return;
      await supabase.from('audit_log').insert({action,table_name:'agent_ia',details:{...details,timestamp:new Date().toISOString()}});
    }catch(e){}
  };

  // ── LOCAL KB SEARCH (no API needed) ──
  const localKB=[
    {q:['préavis','preavis','opzeg','notice','licenciement','ontslag','rupture'],a:{fr:'**Préavis — Loi du 26/12/2013 (Statut unique)**\n\nPar l\'employeur:\n• 0-3 mois: 1 sem\n• 3-6 mois: 3 sem\n• 6-12 mois: 4-5 sem\n• 1-2 ans: 6-9 sem\n• 2-3 ans: 12 sem\n• 3-5 ans: 13-15 sem\n• 5-8 ans: 18-24 sem\n• 8-10 ans: 27-30 sem\n• 10-15 ans: 33-42 sem\n• 15-20 ans: 45-57 sem\n• 20-25 ans: 62-72 sem\n\nPar le travailleur: environ la moitié.\n\n**Indemnité de rupture** = rémunération × durée du préavis non presté.\n**Motif grave (art. 35):** Pas de préavis, notification dans les 3 jours ouvrables + lettre recommandée 3j.\n**Outplacement**: Obligatoire si préavis ≥ 30 semaines (60h, valeur min 1.800€).\n\n📋 Loi 26/12/2013, art. 37/2 à 37/11'}},
    {q:['dimona','déclaration immédiate','aangifte','embauche'],a:{fr:'**Dimona — Déclaration Immédiate de l\'Emploi**\n\n• **Dimona IN**: AVANT le premier jour de travail\n• **Dimona OUT**: Le dernier jour de travail\n• **Dimona UPDATE**: Modification en cours de contrat\n• **Dimona STU**: Spécifique étudiants\n• **Dimona FLX**: Spécifique flexi-jobs\n\n**Données obligatoires:** NISS, matricule ONSS, dates, type travailleur, CP.\n\n**Sanction**: 400€ à 4.000€ par travailleur non déclaré.\n**Sanction pénale**: 600€ à 6.000€ (récidive).\n\n📋 AR 5/11/2002, Code pénal social art. 181'}},
    {q:['onss','rsz','cotisation','patronal','sécurité sociale'],a:{fr:'**Cotisations ONSS 2026**\n\n**Travailleur**: 13,07% du brut\n**Employeur marchand**: ~25%\n**Employeur non-marchand**: ~32,40%\n**Ouvriers**: brut × 108%\n\n**Ventilation patronale:** Base 19,88% + Modération 5,67% + Fonds fermeture 0,02-0,18% + Chômage temp 0,10% + Amiante 0,01%\n\n**Réductions:** Bas salaires, premiers engagements (1er-6ème), travailleurs âgés 55+.\n**Paiement**: Provisions le 5 du mois + solde trimestriel.\n\n📋 Loi 27/06/1969, AR 28/11/1969'}},
    {q:['chèques-repas','maaltijdcheque','meal voucher','repas','titre-repas'],a:{fr:'**Chèques-repas 2026**\n\n• Valeur max: **8,00€**/jour presté\n• Part employeur max: **6,91€**\n• Part travailleur min: **1,09€**\n• Exonération ONSS + fiscale\n\n**Conditions:** CCT/accord écrit, 1/jour presté, au nom du travailleur, validité 12 mois, format électronique.\n**Émetteurs**: Pluxee, Edenred, Monizze.\n\n📋 AR 28/11/1969, art. 19bis §2'}},
    {q:['étudiant','student','jobiste','650','job étudiant'],a:{fr:'**Travail étudiant 2026**\n\n• **650 heures/an** à cotisations réduites\n• ONSS: 2,71% étudiant + 5,43% employeur = **8,14%**\n• Au-delà: cotisations normales\n• **Dimona STU** obligatoire\n• **3 jours d\'essai** automatiques\n• **COE** obligatoire avant début\n• Min 15 ans, max 20h/sem en période scolaire\n• Vérification: student@work.be\n\n📋 Loi 3/7/1978, Titre VII'}},
    {q:['précompte','bedrijfsvoorheffing','pp 274','fiscal','impôt'],a:{fr:'**Précompte professionnel 2026**\n\n**Barèmes** SPF Finances (Annexe III AR/CIR 92).\n\n**Réductions:** Enfants à charge, bonus emploi, heures sup (-66,81%), nuit/équipes (dispense 22,8%), sportifs (80%).\n\n**Déclaration PP 274** via FinProf:\n• Mensuel (>50 trav): 15 du mois suivant\n• Trimestriel (≤50): 15 du mois suivant le trimestre\n\n📋 CIR 92, art. 270-275'}},
    {q:['maladie','ziekte','sick','incapacité','garanti','certificat'],a:{fr:'**Maladie — Salaire garanti**\n\n**Employé:** 30 jours à 100% employeur, puis mutuelle 60%.\n**Ouvrier:** J1-7: 100%, J8-14: 85,88%, J15-30: 25,88%+60% mutuelle, après: mutuelle.\n\n**Obligations:** Certificat 48h, disponible pour contrôle, informer J1.\n**Rechute <14j** = continuation même salaire garanti.\n**Contrôle médical** dès J1 possible.\n\n📋 Loi 3/7/1978, art. 52-75'}},
    {q:['vacances','congé','verlof','holiday','pécule','vakantie'],a:{fr:'**Vacances annuelles 2026**\n\n**Employés:** 20j/an, simple pécule (salaire normal) + double pécule (92% brut mensuel), payé par employeur.\n**Ouvriers:** 20j/an, pécule = 15,38% des rémunérations brutes année précédente, payé par Caisse vacances (ONVA).\n\n**10 jours fériés légaux:** 1/1, Pâques lundi, 1/5, Ascension, Pentecôte lundi, 21/7, 15/8, 1/11, 11/11, 25/12.\n\n📋 Lois coordonnées 28/06/1971'}},
    {q:['flexijob','flexi','mini-job'],a:{fr:'**Flexi-job 2026**\n\n**Conditions:** 4/5 temps chez autre employeur (T-3) OU pensionné.\n**Avantages:** Pas d\'ONSS travailleur, pas de PP. Patronal: 28%. Min 12,05€/h.\n**Max**: 12.000€/an exonéré (non-pensionnés).\n**Secteurs**: Horeca, commerce, boulangerie, sport, culture, agriculture, événementiel, immobilier...\n\n📋 Loi 16/11/2015, élargi 01/01/2024'}},
    {q:['crédit-temps','tijdskrediet','4/5','congé parental'],a:{fr:'**Crédit-temps 2026**\n\n**Sans motif**: SUPPRIMÉ (01/01/2023).\n**Avec motif (max 51 mois):** Soins enfant <8 ans, palliatifs, maladie grave, handicap, formation.\n**Fin carrière (55 ans+):** Mi-temps ou 4/5, allocation ONEM, 25 ans carrière.\n**Congé parental:** 4m temps plein / 8m mi-temps / 20m 1/5, par enfant <12 ans.\n**Congé thématique:** Palliatif 1-3m, assistance médicale 1-3m.\n\n📋 CCT n°103, AR 12/12/2001'}},
    {q:['index','indexation','indexering','barème','rmmmg'],a:{fr:'**Indexation salariale 2026**\n\nSystème automatique lié à l\'indice santé lissé.\n\n**CP 200**: Janvier, ~2%. **CP 124**: Janvier. **CP 302**: Janvier. **CP 330**: Selon protocole.\n\n**RMMMG 2026:**\n• 18 ans: 2.029,88€/mois\n• +6 mois: 2.090,83€\n• +12 mois: 2.154,76€\n\n📋 Loi 2/8/1971'}},
    {q:['contrat','contract','cdi','cdd','temps partiel'],a:{fr:'**Contrats de travail**\n\n**CDI**: Forme libre (présomption légale).\n**CDD**: Écrit AVANT début, sinon → CDI. Max 4×3mois/2ans ou 6×6mois/3ans.\n**Temps partiel**: Écrit avant début, min 1/3 temps plein ou 3h/prestation.\n**Remplacement**: Écrit, max 2 ans.\n**Intérim**: Via agence, max 2 ans même poste.\n**Clause d\'essai**: SUPPRIMÉE (sauf étudiants/intérim 3j).\n\n📋 Loi 3/7/1978'}},
    {q:['motif grave','faute grave','dringende reden'],a:{fr:'**Motif grave — Art. 35**\n\nFaute rendant immédiatement impossible la poursuite du contrat.\n\n**Procédure:** Constatation → 3j ouvrables notification → 3j motivation par recommandé.\n**Exemples:** Vol, fraude, violence, harcèlement, absences répétées, concurrence déloyale.\n**Conséquences:** Pas de préavis, pas d\'indemnité, pas de chômage (temporaire).\n**Preuve:** À charge de l\'employeur.\n\n📋 Art. 35 Loi 3/7/1978'}},
    {q:['dmfa','trimestrielle','kwartaal'],a:{fr:'**DmfA — Déclaration trimestrielle ONSS**\n\nT1: avant 30/04, T2: avant 31/07, T3: avant 31/10, T4: avant 31/01.\n\n**Contenu/travailleur:** Rémunérations brutes, cotisations, jours prestés, réductions.\n**Format**: XML via batch ou portail.\n**Flux**: Envoi → ACRF → Notification → PID.\n\n📋 Loi 27/06/1969'}},
    {q:['c4','chômage','werkloosheid','document sortie'],a:{fr:'**Documents de sortie**\n\n**C4**: Certificat chômage (obligatoire, dernier jour). Sanction: 80-800€.\n**C131A**: Attestation vacances employé.\n**Décompte final**: Toutes sommes dues.\n**Attestation d\'occupation**: Historique emploi.\n**Fiche 281.10**: Si fin en cours d\'année.\n**Dimona OUT**: Le dernier jour.\n\n📋 AR 25/11/1991'}},
    {q:['règlement','travail','arbeidsreglement'],a:{fr:'**Règlement de travail — Obligatoire dès le 1er travailleur**\n\n**Mentions:** Horaires, contrôle temps, paiement, préavis, sanctions, CPPT, premiers secours, adresse CLS, CCT applicables.\n**Modification:** Affichage 15j + registre remarques + copie CLS.\n\n📋 Loi 8/4/1965'}},
    {q:['harcèlement','bien-être','welzijn','psychosociaux','burnout'],a:{fr:'**Bien-être — Risques psychosociaux**\n\nEmployeur = responsable prévention. Analyse risques obligatoire. Conseiller prévention obligatoire.\n\n**Procédure interne:** Personne de confiance + CPAP. Demande formelle → 3 mois mesures.\n**Protection:** Plaignant protégé contre licenciement.\n**CPPT:** Obligatoire dès 50 travailleurs.\n\n📋 Loi 4/8/1996, AR 10/4/2014'}},
    {q:['heures sup','overtime','supplémentaire','temps de travail','38h'],a:{fr:'**Temps de travail**\n\n**Légal:** 38h/sem. Max: 11h/jour, 50h/sem.\n**Repos:** 11h/jour, 35h/semaine.\n**Heures sup:** Sursalaire +50% (ouvrable), +100% (dimanche/férié). Récupération obligatoire (sauf 91h relax). Max 120h/an (360h via CCT). Avantage fiscal -66,81%.\n\n📋 Loi 16/3/1971'}},
    {q:['commission paritaire','cp','paritair comité','secteur'],a:{fr:'**Commissions paritaires**\n\nOrgane paritaire par secteur: CP 100 (ouvriers), CP 200 (employés), CP 111 (métal), CP 124 (construction), CP 140 (transport), CP 302 (horeca), CP 310 (banques), CP 330 (santé), CP 336 (professions libérales).\n\n**Conséquences:** Barèmes, indexation, primes, congés extra, chèques-repas, éco-chèques.\n\n📋 Loi 5/12/1968'}},
    {q:['eco-chèque','écochèque','écologique'],a:{fr:'**Éco-chèques 2026**\n\nMax **250€/an** (temps plein). Exonéré ONSS + fiscal. Format électronique. Validité 24 mois.\n**Achats:** Appareils économes, solaire, vélo, bio, plantes.\n\n📋 CCT n°98, AR 28/11/1969'}},
    {q:['voiture','société','company car','atn','mobilité'],a:{fr:'**Voiture de société — ATN 2026**\n\nFormule: Valeur catalogue × % × 6/7 × correction CO2.\n**CO2 réf:** Essence 78g/km, Diesel 65g/km. Base 5,5% ±0,1%/g. Min 4%.\n**ATN min:** 1.600€/an. Dégressivité -6%/an (min 70%).\n\n**Budget mobilité:** Pilier 1 (voiture éco), Pilier 2 (mobilité durable/loyer), Pilier 3 (cash -38,07%).\n\n📋 Art. 36 CIR 92, Loi 17/3/2019'}},
    {q:['rgpd','gdpr','données','privacy','protection'],a:{fr:'**RGPD en droit social**\n\nEmployeur = Responsable traitement. 6 catégories données: identification, pro, financières, fiscales, SS, santé.\n\n**Obligations:** Registre art. 30, DPA art. 28, politique confidentialité, notification fuite 72h, DPO si >250 trav.\n**Sanctions:** 20M€ ou 4% CA.\n\n📋 RGPD 2016/679, Loi belge 30/7/2018'}},
    {q:['saisie','cession','pension alimentaire','retenue'],a:{fr:'**Saisie sur salaire 2026**\n\n**Quotités:** ≤1.260€: insaisissable. 1.260-1.353€: 20%. 1.353-1.493€: 30%. 1.493-1.634€: 40%. >1.634€: illimité.\n+78€/enfant à charge.\n**Pension alimentaire:** Pas de quotité insaisissable.\n\n📋 Code judiciaire art. 1409-1412'}},
    {q:['intérim','uitzendarbeid','temporaire','agence'],a:{fr:'**Intérim — Loi 24/7/1987**\n\nMotifs: Remplacement, surcroît, exceptionnel, insertion.\nMax 2 ans même poste. 3j essai. Principe d\'égalité salariale.\n**CP 322** (travail intérimaire).\n\n📋 Loi 24/7/1987'}},
    {q:['accident','travail','arbeidsongeval','at'],a:{fr:'**Accident du travail**\n\nÉvénement soudain + lésion + cours du contrat. Trajet domicile-travail = couvert.\n**Employeur:** Assurance AT obligatoire, déclaration 8j.\n**Indemnisation:** IT totale 90%, IP rente viagère, décès rente ayants droit.\n**Fedris**: Agence fédérale risques pro.\n\n📋 Loi 10/4/1971'}},
    {q:['pension','retraite','pensioen','âge'],a:{fr:'**Pension 2026**\n\nÂge légal: 66 ans (67 dès 2030).\n**Anticipée:** 63+42ans, 61+44ans, 60+44ans.\nCalcul: 60% (isolé)/75% (ménage) × salaire moyen × années/45.\n2ème pilier: Assurance groupe. 3ème pilier: Épargne-pension (30% sur 1.020€).\n\n📋 Loi 21/5/2015'}},
    {q:['bonus','prime','cct 90','non récurrent'],a:{fr:'**Bonus CCT n°90**\n\nPlafond 2026: **4.020€** brut (3.496€ net après 13,07%). ONSS employeur 33%. Pas de PP.\nConditions: Plan bonus par CCT/acte adhésion, objectifs collectifs mesurables, min 3 mois, dépôt SPF.\n\n📋 CCT n°90, Loi 21/12/2007'}},
    {q:['télétravail','thuiswerk','remote','homeworking'],a:{fr:'**Télétravail**\n\n**Structurel (CCT 85):** Avenant obligatoire. **Occasionnel (Loi 5/3/2017):** Pas d\'avenant.\n\n**Indemnités exonérées 2026:** Bureau 148,73€/m + Internet 20€ + PC 20€ + Écran 20€ = **~208,73€/mois**.\n\n📋 CCT n°85, Loi 5/3/2017'}},
    {q:['belcotax','281','fiche fiscale'],a:{fr:'**Belcotax — Fiches 281**\n\n281.10: Salariés. 281.20: Dirigeants. Contenu: brut, PP, ONSS, ATN, frais déplacement.\n**Délai:** 28/02. Via Belcotax on web (XML). Sanction: 50-1.250€/fiche.\n\n📋 Art. 57 CIR 92'}},
    {q:['transport','déplacement','vélo','domicile'],a:{fr:'**Transport domicile-travail**\n\nTransport en commun: remboursement obligatoire (80% SNCB ou CCT).\n**Vélo:** 0,35€/km exonéré.\nVoiture privée: selon CCT.\nCumul vélo+train possible.\n\n📋 CCT n°19/9'}},
    {q:['premier','engagement','eerste','réduction starter'],a:{fr:'**Premiers engagements — Réductions ONSS**\n\n1er: exonération quasi-totale (illimitée). 2ème: -1.550€/trim (5 trim). 3ème: -1.050€/trim (9 trim). 4ème-6ème: -1.000€/trim (13 trim).\nCompteur lié à l\'unité technique d\'exploitation.\n\n📋 AR 16/5/2003'}},
    {q:['inspection','contrôle','amende','sanction','code pénal'],a:{fr:'**Inspection & Sanctions**\n\nServices: CLS (SPF), ONSS, ONEM, Fedris.\n**Code pénal social:** Niveau 1: 10-100€, Niveau 2: 50-500€, Niveau 3: 100-1.000€, Niveau 4: prison 6m-3ans + 600-6.000€.\nMultipliés par nb travailleurs. Décimes ×8.\n\n📋 Code pénal social (Loi 6/6/2010)'}},
    {q:['non-concurrence','écolage','clause'],a:{fr:'**Clauses spéciales**\n\n**Non-concurrence:** Rémunération >39.422€/an. Indemnité min 50% salaire. Max 12 mois.\n**Écolage:** Formation >80h ou valeur >seuil. Rémunération >41.969€. Max 3 ans (dégressif 100/66/33%).\n**Exclusivité:** Proportionnée (art. 17bis).\n\n📋 Loi 3/7/1978'}},
    {q:['registre','personnel','document','obligation'],a:{fr:'**Documents sociaux obligatoires**\n\n1. Règlement de travail\n2. Registre du personnel\n3. Compte individuel (par travailleur/mois)\n4. Décompte de rémunération (fiche de paie)\n5. Convention Dimona\n6. Contrats écrits (CDD, temps partiel, étudiant)\n7. Bilan social (> 20 travailleurs)\n\n**Conservation:** 5 ans minimum après fin du contrat.\n\n📋 AR 8/8/1980'}},
  ];
  const searchKB=(query)=>{
    const q=query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    for(const entry of localKB){
      for(const keyword of entry.q){
        if(q.includes(keyword.toLowerCase()))return entry.a[lang]||entry.a.fr;
      }
    }
    return lang==='nl'?'Ik heb geen specifiek antwoord op deze vraag. Probeer trefwoorden zoals: préavis, dimona, ONSS, chèques-repas, étudiant, maladie, vacances, index, flexijob, crédit-temps.':lang==='en'?'I don\'t have a specific answer. Try keywords like: notice period, dimona, ONSS, meal vouchers, student, sick leave, holidays, indexation, flexijob.':'Je n\'ai pas de réponse spécifique à cette question. Essayez des mots-clés comme: **préavis, dimona, ONSS, chèques-repas, étudiant, maladie, vacances, index, flexijob, crédit-temps, précompte**.\n\nOu posez une question plus précise sur le droit social belge.';
  };

  const send=async(text)=>{
    if(!text.trim()||loading)return;
    const dl=detectAgentLang(text);setLang(dl);
    const um={role:'user',content:text.trim()};
    const nm=[...msgs,um];setMsgs(nm);setInp('');setLoading(true);
    
    logAudit('agent_ia_query',{query:text.trim(),lang:dl});
    
    try{
      // Use server-side API route (secure, with API key)
      const res=await fetch('/api/agent',{
        method:"POST",headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:nm.map(m=>({role:m.role,content:m.content})),lang:dl})
      });
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      const cleanTxt=parseAndExecute(data.text||'Erreur.');
      setMsgs([...nm,{role:'assistant',content:cleanTxt}]);
    }catch(e){
      // Fallback: local KB search
      const kbAnswer=searchKB(text);
      setMsgs([...nm,{role:'assistant',content:kbAnswer}]);
    }
    finally{setLoading(false);}
    if(!open)setUnread(u=>u+1);
  };

  const labels={fr:{title:tText('Agent Juridique IA'),placeholder:'Votre question en droit social...',disclaimer:'Info juridique indicative. Cas complexes → juriste.',clear:'Effacer'},
    nl:{title:'Juridische AI-Agent',placeholder:'Uw vraag over sociaal recht...',disclaimer:'Indicatieve juridische info. Complexe gevallen → jurist.',clear:'Wissen'},
    en:{title:'Legal AI Agent',placeholder:'Your social law question...',disclaimer:'Indicative legal info. Complex cases → jurist.',clear:'Clear'}};
  const lb=labels[lang]||labels.fr;

  return <>
    {/* Floating Button */}
    <button onClick={()=>setOpen(!open)} style={{
      position:'fixed',bottom:24,right:24,width:60,height:60,borderRadius:'50%',
      background:"linear-gradient(135deg,#c6a34e,#8b6914)",border:'none',cursor:'pointer',
      boxShadow:'0 6px 24px rgba(198,163,78,.4)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',
      transition:'all .3s',transform:open?'scale(0.9) rotate(45deg)':'scale(1) rotate(0deg)',
    }}>
      <span style={{fontSize:open?26:28,color:'#0d0d0d',fontWeight:700}}>{open?'✕':'⚖️'}</span>
      {unread>0&&!open&&<span style={{position:'absolute',top:-4,right:-4,width:22,height:22,borderRadius:'50%',
        background:"#ef4444",color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',
        border:'2px solid #060810'}}>{unread}</span>}
    </button>

    {/* Chat Window */}
    {open&&<div style={{
      position:'fixed',bottom:96,right:24,width:400,height:560,
      background:"#0c0f1a",border:'1px solid rgba(198,163,78,.2)',borderRadius:20,
      boxShadow:'0 20px 60px rgba(0,0,0,.7)',zIndex:9998,display:'flex',flexDirection:'column',
      overflow:'hidden',animation:'agentSlideIn .3s ease-out',
    }}>
      <style>{`@keyframes agentSlideIn{from{opacity:0;transform:translateY(20px) scale(.95);}to{opacity:1;transform:translateY(0) scale(1);}}`}</style>

      {/* Header */}
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(198,163,78,.12)',
        background:"linear-gradient(135deg,rgba(198,163,78,.08),rgba(198,163,78,.02))",
        display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#c6a34e,#8b6914)",
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#0d0d0d'}}>⚖️</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{lb.title}</div>
            <div style={{fontSize:10,color:'rgba(198,163,78,.5)'}}>Aureus Social Pro</div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {['fr',"nl","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{
            padding:'3px 8px',borderRadius:6,border:'none',fontSize:10,fontWeight:600,cursor:'pointer',
            textTransform:'uppercase',letterSpacing:.5,fontFamily:'inherit',
            background:lang===l?'rgba(198,163,78,.2)':'transparent',color:lang===l?'#c6a34e':'rgba(198,163,78,.3)',
          }}>{l}</button>)}
          <button onClick={()=>{setMsgs([]);}} style={{padding:'3px 8px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',
            background:"transparent",color:'rgba(198,163,78,.4)',fontSize:10,cursor:'pointer',fontFamily:'inherit',marginLeft:4}}>{lb.clear}</button>
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
              background:"rgba(198,163,78,.04)",border:'1px solid rgba(198,163,78,.1)',borderRadius:10,
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
              <span style={{fontSize:10,color:'#c6a34e',fontWeight:600,letterSpacing:.5,textTransform:'uppercase'}}>Aureus {m.executed?'⚡ Exécuté':'Legal'}</span>
              {m.executed&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:8,background:'rgba(74,222,128,.15)',color:'#4ade80',fontWeight:600}}>✅ Action effectuée</span>}
            </div>}
            {m.content}
          </div>
        </div>)}

        {loading&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px'}}>
          {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:"#c6a34e",
            animation:`pulse 1.2s ease-in-out ${i*.2}s infinite`}}/>)}
          <span style={{fontSize:11,color:'rgba(198,163,78,.4)',fontStyle:'italic'}}>
            {lang==='nl'?'Analyse bezig...':lang==='en'?'Analyzing...':'Analyse en cours...'}
          </span>
        </div>}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'10px 14px 14px',borderTop:'1px solid rgba(198,163,78,.1)',
        background:"rgba(12,15,26,.95)",flexShrink:0}}>
        <div style={{display:'flex',gap:8,alignItems:'flex-end',background:"rgba(198,163,78,.03)",
          border:'1px solid rgba(198,163,78,.12)',borderRadius:14,padding:'6px 6px 6px 14px'}}>
          <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(inp);}}}
            placeholder={lb.placeholder} rows={1}
            style={{flex:1,background:"transparent",border:'none',color:'#e8e4dc',fontSize:13,
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

export default FloatingLegalAgent;
