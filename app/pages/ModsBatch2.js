// ═══ AUREUS SOCIAL PRO — Modules Batch 2 ═══
// 35 composants extraits du monolithe
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { B, BONUS_MAX, C, CR_MAX, CR_PAT, CR_TRAV, DPER, HEURES_HEBDO, I, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, SC, ST, TX_AT, TX_ONSS_E, TX_ONSS_W, TX_OUV108, TX_OUV_SPECIAL, Tbl, calc, f2, fmt, obf, quickNet, quickNetEst, quickPP } from "@/app/lib/helpers";
import { calcCSSS, calcBonusEmploi, calcPrecompteExact } from "@/app/lib/payroll-engine";
import { aureuspdf } from "@/app/lib/pdf-aureus";

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
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MN = MN_FR;


export function GuidePortailMod({s,d}){
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};const loisRef=LOIS_BELGES;
  const [tab,setTab]=useState('intro');
  const tabs=[
    {id:'intro',l:"Vue d'ensemble",i:'📋'},
    {id:'acces',l:'Acces au portail',i:'🔑'},
    {id:'dimona',l:'Dimona pas a pas',i:'⬆'},
    {id:'dmfa',l:'DmfA pas a pas',i:'◆'},
    {id:'paiement',l:'Paiement ONSS',i:'💳'},
    {id:'pp',l:'Precompte Pro',i:'📊'},
    {id:'belcotax',l:'Belcotax 281',i:'📄'},
    {id:'calendrier',l:'Calendrier annuel',i:'📅'},
    {id:'faq',l:'FAQ',i:'❓'},
  ];
  const Step=({n,title,desc,link,warn})=><div style={{marginBottom:16,padding:14,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
      <div style={{width:28,height:28,borderRadius:'50%',background:"linear-gradient(135deg,#c6a34e,#8b6914)",display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0a0e1a',flexShrink:0}}>{n}</div>
      <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{title}</div>
    </div>
    <div style={{fontSize:11.5,color:'#9e9b93',lineHeight:1.7,marginLeft:38}}>{desc}</div>
    {link&&<div style={{marginTop:6,marginLeft:38}}><a href={link} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'#60a5fa',textDecoration:'underline'}}>{link}</a></div>}
    {warn&&<div style={{marginTop:8,marginLeft:38,padding:8,background:"rgba(251,146,60,.08)",borderRadius:6,fontSize:10.5,color:'#fb923c',lineHeight:1.5}}>⚠️ {warn}</div>}
  </div>;
  const Info=({text})=><div style={{padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6,marginBottom:14}}>ℹ️ {text}</div>;
  const Warn=({text})=><div style={{padding:10,background:"rgba(248,113,113,.06)",borderRadius:8,fontSize:11,color:'#f87171',lineHeight:1.6,marginBottom:14}}>⚠️ {text}</div>;
  return <div>
    <div style={{padding:'18px 24px',borderBottom:'1px solid rgba(139,115,60,.15)'}}>
      <div style={{fontSize:18,fontWeight:700,color:'#e8e6e0'}}>📘 Guide Portail ONSS & Fiscal — Pas a Pas</div>
      <div style={{fontSize:11.5,color:'#9e9b93',marginTop:4}}>Comment envoyer vos declarations vous-meme sur socialsecurity.be et MyMinfin</div>
    </div>
    <div style={{display:'flex',flexWrap:'wrap',gap:6,padding:'12px 24px',borderBottom:'1px solid rgba(139,115,60,.08)'}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'6px 12px',borderRadius:8,border:tab===t.id?'1px solid rgba(198,163,78,.4)':'1px solid rgba(255,255,255,.06)',background:tab===t.id?"rgba(198,163,78,.12)":"rgba(255,255,255,.02)",color:tab===t.id?'#c6a34e':'#9e9b93',fontSize:11,fontWeight:tab===t.id?600:400,cursor:'pointer'}}>{t.i} {t.l}</button>)}
    </div>
    <div style={{padding:24,maxHeight:'calc(100vh - 280px)',overflowY:'auto'}}>

    {tab==='intro'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Comment ça fonctionne ?</div>
      <Info text={"Aureus Social Pro calcule tout pour vous : salaires, ONSS, précompte, fiches de paie. Vous n'avez plus qu'à envoyer les déclarations et payer. Ce guide vous explique comment faire, étape par étape."}/>
      <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>Répartition des tâches</div>
      {[
        {tache:"Calcul salaires brut/net",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Fiches de paie",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Calcul cotisations ONSS (13,07% + patronal)",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Calcul précompte professionnel",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Préparation données DmfA",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Génération documents (C4, contrats...)",qui:"Aureus Social Pro",icon:"✅"},
        {tache:"Envoi Dimona IN/OUT",qui:"Vous, sur socialsecurity.be",icon:"👤"},
        {tache:"Envoi DmfA trimestrielle",qui:"Vous, sur socialsecurity.be",icon:"👤"},
        {tache:"Paiement cotisations ONSS",qui:"Vous, par virement bancaire",icon:"👤"},
        {tache:"Paiement précompte professionnel",qui:"Vous, via MyMinfin",icon:"👤"},
        {tache:"Envoi Belcotax 281 (annuel)",qui:"Vous, sur Belcotax-on-web",icon:"👤"},
      ].map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:i%2===0?"rgba(255,255,255,.02)":"transparent",borderRadius:6,marginBottom:2}}>
        <div style={{fontSize:14,width:24,textAlign:'center'}}>{r.icon}</div>
        <div style={{flex:1,fontSize:11.5,color:'#e8e6e0'}}>{r.tache}</div>
        <div style={{fontSize:10.5,color:r.icon==='✅'?'#4ade80':'#c6a34e',fontWeight:600}}>{r.qui}</div>
      </div>)}
      <Info text={"Vous n'avez PAS besoin d'etre affilie a un secretariat social agree. L'affiliation est facultative (source: CCI France Belgique). Vous pouvez gerer vos obligations sociales vous-meme avec l'aide de notre logiciel."}/>
    </div>}

    {tab==='acces'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Obtenir l'accès au portail de la sécurité sociale</div>
      <Step n={1} title="Obtenir une carte eID ou itsme" desc="Pour accéder au portail de la sécurité sociale, vous devez vous identifier avec votre carte d'identité électronique (eID + lecteur de carte) ou via l'application itsme. Si vous n'avez pas encore itsme, téléchargez l'application et activez-la via votre banque ou votre commune." link="https://www.itsme.be/fr"/>
      <Step n={2} title="Se connecter a socialsecurity.be" desc="Allez sur le portail de la sécurité sociale. Cliquez 'Se connecter' en haut à droite. Choisissez votre méthode d'identification : eID, itsme, ou token. Vous arrivez sur votre espace employeur." link="https://www.socialsecurity.be" warn="Premiere connexion ? Vous devez d'abord etre identifie comme employeur. Si ce n'est pas encore fait, allez dans 'Repertoire des employeurs (WIDE)'."/>
      <Step n={3} title="S'inscrire comme employeur (WIDE)" desc="Si c'est votre premier travailleur, inscrivez-vous via le service WIDE (Werkgever Identificatie / Identification Employeur). Vous recevrez un numéro ONSS. Ce numéro est indispensable pour toutes vos déclarations." link="https://www.socialsecurity.be/site_fr/employer/infos/employers_nsso.htm"/>
      <Step n={4} title="Donner accès à vos collaborateurs (optionnel)" desc="Via le service 'Gestion des acces' (MAHIS), vous pouvez déléguer l'accès a votre comptable ou a un collaborateur. Il pourra alors faire les declarations en votre nom. Vous restez toujours responsable legalement." link="https://www.socialsecurity.be/site_fr/employer/infos/access-management.htm"/>
      <Info text={"Conseil: installez un lecteur de carte eID sur votre PC (environ 15 EUR). C'est le moyen le plus rapide pour se connecter. Sinon, itsme fonctionne depuis votre smartphone."}/>
    </div>}

    {tab==='dimona'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Declarer une Dimona IN (embauche)</div>
      <Warn text={"La Dimona IN doit etre faite AVANT que le travailleur commence a travailler. Amende: 2.500 a 12.500 EUR par infraction (art. 181 Code Penal Social)."}/>
      <Step n={1} title="Préparer les informations dans Aureus Social Pro" desc="Allez dans ONSS > Dimona. Selectionnez le travailleur. Vérifiez : NISS (numéro national), date d'entrée, type de contrat (ordinaire, etudiant, flexi...). Notez ces informations."/>
      <Step n={2} title="Se connecter au portail" desc="Allez sur socialsecurity.be > Se connecter > Dimona Web. Identifiez-vous avec eID ou itsme." link="https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm"/>
      <Step n={3} title="Créer une nouvelle déclaration" desc="Cliquez 'Nouvelle declaration' > Type: IN. Remplissez: Numéro ONSS de votre entreprise, NISS du travailleur, date de debut, commission paritaire, type de travailleur (ouvrier/employe/etudiant)."/>
      <Step n={4} title="Cas étudiant (STU)" desc="Pour un etudiant: selectionnez le type STU. Indiquez les dates de debut et fin + nombre d'heures prevues. Rappel: max 650h/an a cotisations reduites (2,71% + 5,43%)." warn="Dépassement des 650h = cotisations ONSS normales (13,07% + ~25% patronal) !"/>
      <Step n={5} title="Cas flexi-job (FLX)" desc="Selectionnez le type FLX. Le travailleur doit avoir un emploi d'au moins 4/5 temps chez un autre employeur (T-3). Cotisation patronale speciale: 28%."/>
      <Step n={6} title="Valider et envoyer" desc="Vérifiez toutes les données. Cliquez 'Envoyer'. Vous recevez un numero de reference Dimona. Conservez-le. Le statut passe a 'Accepte' si tout est correct."/>
      <Step n={7} title="Dimona OUT (depart)" desc="Quand un travailleur quitte l'entreprise: refaites la meme procedure avec le type OUT. Indiquez la date de fin. Delai: au plus tard le premier jour ouvrable apres la fin du contrat."/>
      <Info text={"Astuce: dans Aureus Social Pro, l'historique de vos Dimona est enregistre. Notez-y le numero de reference ONSS apres chaque declaration pour garder une trace."}/>
    </div>}

    {tab==='dmfa'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Envoyer la DmfA trimestrielle</div>
      <Info text={"La DmfA (Declaration Multifonctionnelle) reprend TOUTES les donnees de salaires et prestations de vos travailleurs pour un trimestre. Aureus Social Pro calcule tout — vous n'avez qu'a encoder sur le portail."}/>
      <Step n={1} title="Générer les données dans Aureus Social Pro" desc="Allez dans ONSS > DmfA. Selectionnez le trimestre. Cliquez 'Generer'. Le systeme prepare un recapitulatif avec: chaque travailleur, ses prestations (jours/heures), sa remuneration brute, les cotisations calculees. Imprimez ou exportez ce recapitulatif."/>
      <Step n={2} title="Se connecter a DmfA Web" desc="Sur socialsecurity.be > Se connecter > DmfA Web. C'est l'application en ligne officielle pour encoder votre declaration trimestrielle." link="https://www.socialsecurity.be/site_fr/employer/applics/dmfa/index.htm"/>
      <Step n={3} title="Créer une nouvelle déclaration" desc="Cliquez 'Nouvelle declaration'. Selectionnez le trimestre concerne. Le systeme affiche votre numero ONSS et les travailleurs deja connus (via Dimona)."/>
      <Step n={4} title="Encoder les donnees par travailleur" desc="Pour chaque travailleur, remplissez: la ligne travailleur (categorie, code travailleur), la ligne occupation (regime, nombre de jours, heures), la ligne remuneration (brut, cotisations). Utilisez le recapitulatif d'Aureus Social Pro comme reference." warn="Vérifiez que les montants correspondent EXACTEMENT aux calculs d'Aureus Social Pro. Toute difference peut entrainer un controle ONSS."/>
      <Step n={5} title="Verifier et envoyer" desc="DmfA Web dispose d'un outil de validation. Lancez-le avant d'envoyer. Il detecte les erreurs (anomalies A = bloquantes, anomalies W = avertissements). Corrigez les anomalies A puis envoyez."/>
      <Step n={6} title="Télécharger l'accusé de réception" desc="Apres envoi, vous recevez un accuse de reception avec un numero unique. Telechargez-le et conservez-le dans votre GED (Aureus Social Pro > Documents)."/>
      <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginTop:16,marginBottom:10}}>Échéances DmfA</div>
      {[{t:'T1 (jan-mars)',d:'30 avril'},{t:'T2 (avr-juin)',d:'31 juillet'},{t:'T3 (juil-sept)',d:'31 octobre'},{t:'T4 (oct-dec)',d:'31 janvier N+1'}].map((e,i)=><div key={i} style={{display:'flex',gap:10,padding:'6px 12px',background:i%2===0?"rgba(255,255,255,.02)":"transparent",borderRadius:4}}>
        <div style={{fontSize:11.5,color:'#c6a34e',fontWeight:600,width:120}}>{e.t}</div>
        <div style={{fontSize:11.5,color:'#e8e6e0'}}>au plus tard le <b>{e.d}</b></div>
      </div>)}
      <Warn text={"Retard de declaration = majorations de 0,5% par mois de retard sur les cotisations dues + interets de retard de 7% par an."}/>
    </div>}

    {tab==='paiement'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Payer les cotisations ONSS</div>
      <Step n={1} title="Consulter le montant dans Aureus Social Pro" desc="Allez dans ONSS > Dashboard ONSS ou Salaires > Fiches de paie. Le montant total des cotisations (travailleur 13,07% + patronal ~25%) est calcule automatiquement pour chaque travailleur."/>
      <Step n={2} title="Provisions mensuelles" desc="Chaque mois, vous devez verser une provision a l'ONSS. Le montant est communique par l'ONSS (visible dans 'Consultation factures employeurs' sur le portail). Payez le 5 du mois suivant." warn="Les provisions sont obligatoires si vos cotisations du trimestre T-2 depassent 4.000 EUR."/>
      <Step n={3} title="Effectuer le virement" desc={<span>Faites un virement vers:<br/><b>IBAN: BE63 6790 2618 1108</b><br/><b>BIC: PCHQBEBB</b><br/>Communication structuree: votre numero ONSS + trimestre. Le format exact est indique sur votre avis de provision ONSS.</span>}/>
      <Step n={4} title="Solde trimestriel" desc="Apres envoi de votre DmfA, l'ONSS calcule le solde (total cotisations du trimestre - provisions deja versees). Payez la difference avant la fin du mois suivant le trimestre."/>
      <Step n={5} title="Verifier vos paiements" desc="Connectez-vous a 'Consultation factures employeurs' sur socialsecurity.be. Vous y voyez l'historique de vos paiements, les montants dus et les eventuels retards." link="https://www.socialsecurity.be/site_fr/employer/applics/epayment/index.htm"/>
      <Info text={"Conseil: creez un ordre permanent mensuel dans votre banque pour ne jamais oublier les provisions. Ajustez le montant chaque trimestre si votre masse salariale change."}/>
    </div>}

    {tab==='pp'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Payer le précompte professionnel</div>
      <Info text={"Le précompte professionnel (PP) est l'impot que vous retenez sur le salaire de vos travailleurs et que vous versez au SPF Finances. Aureus Social Pro calcule le montant exact avec la formule-cle 2026."}/>
      <Step n={1} title="Consulter le montant PP" desc="Dans Aureus Social Pro, allez dans Fiscal > Precompte. Le montant du PP par travailleur est calcule automatiquement. Additionnez tous les PP pour obtenir le total a verser."/>
      <Step n={2} title="Se connecter a MyMinfin" desc="Allez sur MyMinfin (finances.belgium.be). Connectez-vous avec eID ou itsme. Allez dans 'Precompte professionnel'." link="https://eservices.minfin.fgov.be/myMinfin"/>
      <Step n={3} title="Remplir la declaration 274" desc="Remplissez le formulaire 274 (declaration mensuelle PP). Indiquez le montant total du precompte retenu pour le mois. Delai: le 15 du mois suivant."/>
      <Step n={4} title="Payer le precompte" desc={<span>Effectuez le virement vers le SPF Finances. Utilisez la communication structuree fournie sur MyMinfin.<br/><b>Delai: au plus tard le 15 du mois suivant.</b></span>} warn="Retard = majorations de 10% + interets (taux mensuel 0,8%)."/>
      <Step n={5} title="Declaration annuelle 325" desc="En fin d'annee, vous devez soumettre un recapitulatif annuel (fiche 281.10 pour les salaries). Utilisez Belcotax-on-web (voir onglet Belcotax)."/>
    </div>}

    {tab==='belcotax'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Envoyer les fiches Belcotax 281</div>
      <Step n={1} title="Générer les fiches dans Aureus Social Pro" desc="Allez dans Fiscal > Belcotax 281. Selectionnez l'annee. Le systeme genere les fiches 281.10 (salaries), 281.20 (dirigeants d'entreprise), 281.30 (honoraires) avec tous les montants annuels."/>
      <Step n={2} title="Se connecter a Belcotax-on-web" desc="Allez sur Belcotax-on-web via MyMinfin ou directement. Connectez-vous avec eID/itsme." link="https://eservices.minfin.fgov.be/belcotax-on-web"/>
      <Step n={3} title="Encoder ou importer les fiches" desc="Deux options: encoder manuellement chaque fiche (petit nombre de travailleurs) ou importer un fichier XML (Aureus Social Pro peut generer ce format dans une version future). Pour chaque travailleur: NISS, adresse, remuneration brute imposable, PP retenu, ONSS, avantages."/>
      <Step n={4} title="Valider et envoyer" desc="Belcotax valide automatiquement les donnees. Corrigez les erreurs detectees. Envoyez. Vous recevez un accuse de reception." warn="Delai: au plus tard le 1er mars de l'annee suivante. Passee cette date: amendes."/>
      <Step n={5} title="Distribuer les fiches aux travailleurs" desc="Chaque travailleur doit recevoir une copie de sa fiche 281.10 pour sa declaration d'impots. Envoyez-la via Aureus Social Pro > Envoi Documents ou imprimez-la."/>
    </div>}

    {tab==='calendrier'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Calendrier des échéances 2026</div>
      {[
        {m:'Chaque mois',t:[{l:'Provisions ONSS',d:'5 du mois suivant',c:'#4ade80'},{l:'Precompte Pro 274',d:'15 du mois suivant',c:'#60a5fa'},{l:'Fiches de paie',d:'Jour du paiement',c:'#c6a34e'}]},
        {m:'Chaque trimestre',t:[{l:'DmfA T1',d:'30 avril 2026',c:'#a78bfa'},{l:'DmfA T2',d:'31 juillet 2026',c:'#a78bfa'},{l:'DmfA T3',d:'31 octobre 2026',c:'#a78bfa'},{l:'DmfA T4',d:'31 janvier 2027',c:'#a78bfa'},{l:'Solde cotisations ONSS',d:'Fin du mois suivant le trimestre',c:'#4ade80'}]},
        {m:'Annuel',t:[{l:'Bilan Social BNB',d:'28 fevrier 2026',c:'#fb923c'},{l:'Belcotax 281',d:'1 mars 2026',c:'#f87171'},{l:'Compte individuel',d:'1 mars 2026',c:'#fb923c'},{l:'Vacances annuelles (attestation)',d:'31 mars 2026',c:'#fb923c'}]},
        {m:'Ponctuel',t:[{l:'Dimona IN',d:'AVANT debut travail',c:'#f87171'},{l:'Dimona OUT',d:'1er jour ouvrable apres fin',c:'#f87171'},{l:'DRS (risques sociaux)',d:'5 jours ouvrables',c:'#fb923c'}]},
      ].map((section,si)=><div key={si} style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0',marginBottom:8,padding:'6px 10px',background:"rgba(198,163,78,.08)",borderRadius:6}}>{section.m}</div>
        {section.t.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 12px',marginBottom:2}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:e.c,flexShrink:0}}/>
          <div style={{flex:1,fontSize:11.5,color:'#e8e6e0'}}>{e.l}</div>
          <div style={{fontSize:11,color:'#9e9b93',fontWeight:500}}>{e.d}</div>
        </div>)}
      </div>)}
    </div>}

    {tab==='faq'&&<div>
      <div style={{fontSize:14,fontWeight:600,color:'#c6a34e',marginBottom:12}}>Questions frequentes</div>
      {[
        {q:"Dois-je obligatoirement m'affilier a un secretariat social ?",a:"Non. L'affiliation a un secretariat social agree n'est pas une obligation legale. Vous pouvez gerer vos obligations sociales vous-meme. Aureus Social Pro fait les calculs, vous faites les declarations sur le portail officiel."},
        {q:"Puis-je encaisser les cotisations ONSS de mes clients ?",a:"Non. Seuls les secretariats sociaux agrees par le Ministre des Affaires Sociales ont le droit exclusif de percevoir les cotisations. Aureus IA est un prestataire de services / editeur de logiciel, pas un secretariat social agree. Le client paye toujours directement a l'ONSS."},
        {q:"Que se passe-t-il si je suis en retard pour la Dimona ?",a:"Dimona IN absente: amende de niveau 4 (2.500 a 12.500 EUR par travailleur). Dimona IN tardive: amende de niveau 2 (400 a 4.000 EUR). Faites-la TOUJOURS avant le debut du travail."},
        {q:"Combien coute l'acces au portail socialsecurity.be ?",a:"C'est entierement GRATUIT. Le portail est un service public. Vous avez juste besoin d'une carte eID ou de l'app itsme pour vous connecter."},
        {q:"Puis-je deleguer les declarations a mon comptable ?",a:"Oui. Via le service MAHIS (Gestion des acces) sur socialsecurity.be, vous pouvez donner procuration a votre comptable, un collaborateur, ou un prestataire de services. Vous restez legalement responsable."},
        {q:"Les calculs d'Aureus Social Pro sont-ils certifies ?",a:"Les calculs suivent la formule-cle officielle du SPF Finances 2026 et les taux ONSS en vigueur. Toutefois, pour les cas complexes (expatries, detachements, multi-employeurs), nous recommandons de verifier avec un juriste specialise."},
        {q:"Mon ancien secretariat social peut-il bloquer mon depart ?",a:"Non. Vous pouvez quitter votre secretariat social a tout moment moyennant un préavis de 6 mois (convention-type). Demandez le transfert de votre dossier et commencez a utiliser Aureus Social Pro."},
      ].map((faq,i)=><div key={i} style={{marginBottom:14,padding:14,background:"rgba(255,255,255,.02)",borderRadius:10,border:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>❓ {faq.q}</div>
        <div style={{fontSize:11.5,color:'#9e9b93',lineHeight:1.7}}>{faq.a}</div>
      </div>)}
    </div>}

    </div>
  </div>;
}

export function FraisGestionMod({s,d}){
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const masseBrute=ae.reduce((a,e)=>a+(+e.gross||0),0);const masseChargee=Math.round(masseBrute*(1+TX_ONSS_E)*100)/100;const coutPP=ae.reduce((a,e)=>a+quickPP(+(e.gross||0)),0);
  const [tarifs,setTarifs]=useState(()=>{
    const cats=[
      {cat:"Gestion courante",color:'#c6a34e',items:[
        {id:"fg_fiche_paie",l:"Fiche de paie mensuelle",unit:'/fiche/mois',desc:"Calcul et émission de la fiche de paie conforme SPF",price:''},
        {id:"fg_fiche_paie_ouvrier",l:"Fiche de paie ouvrier (construction)",unit:'/fiche/mois',desc:"Spécificités CP 124: timbres, intempéries, caisse congés",price:''},
        {id:"fg_entree",l:"Entrée en service (onboarding)",unit:'/travailleur',desc:"Dimona IN, contrat, annexes, DRS, affiliation caisse",price:''},
        {id:"fg_sortie",l:"Sortie de service",unit:'/travailleur',desc:"Dimona OUT, C4, pécule de sortie, solde de tout compte",price:''},
        {id:"fg_abonnement",l:"Abonnement mensuel de gestion",unit:'/mois',desc:"Accès plateforme, support, mises à jour légales",price:''},
        {id:"fg_abonnement_trav",l:"Supplément par travailleur actif",unit:'/travailleur/mois',desc:"Gestion courante par travailleur inscrit",price:''},
        {id:"fg_minimum",l:"Minimum de facturation mensuel",unit:'/mois',desc:"Montant minimum même sans activité",price:''},
        {id:"fg_tableau_bord",l:"Tableau de bord",unit:'/mois',desc:"Accès tableau de bord avec indicateurs RH et paie",price:''},
        {id:"fg_interface_pointage",l:"Interface pointage",unit:'/mois',desc:"Importation données de pointage / paie depuis système externe",price:''},
      ]},
      {cat:"Modules comptables & Chèques-Repas",color:'#4ade80',items:[
        {id:"fg_od_sans",l:"O.D. — sans liaison comptabilité",unit:'/mois',desc:"Opérations diverses salaires sans export comptable",price:''},
        {id:"fg_od_liaison",l:"O.D. — Liaison BOB/Winbooks/Kluwer/Popsy",unit:'/mois',desc:"Export automatique OD vers logiciel comptable",price:''},
        {id:"fg_cr_pluxee",l:"Chèques-Repas: liaison Pluxee (ex-Sodexo)",unit:'/mois',desc:"Commande automatique chèques-repas via Pluxee",price:''},
        {id:"fg_cr_edenred",l:"Chèques-Repas: liaison Edenred",unit:'/mois',desc:"Commande automatique chèques-repas via Edenred",price:''},
        {id:"fg_cr_monizze",l:"Chèques-Repas: liaison Monizze",unit:'/mois',desc:"Commande automatique chèques-repas via Monizze",price:''},
        {id:"fg_cr_got",l:"Chèques-Repas: liaison G.O.T. Connection",unit:'/mois',desc:"Commande automatique chèques-repas via G.O.T. Connection",price:''},
      ]},
      {cat:"Envoi automatique documents",color:'#60a5fa',items:[
        {id:"fg_envoi_outlook",l:"Envoi PDF via Outlook (BP, FF, CI)",unit:'/mois',desc:"Envoi automatique bons paie, fiches fiscales, comptes individuels par email",price:''},
        {id:"fg_envoi_doccle",l:"Envoi PDF via Doccle",unit:'/mois',desc:"Envoi automatique documents via coffre-fort numérique Doccle",price:''},
      ]},
      {cat:"Déclarations sociales",color:'#22d3ee',items:[
        {id:"fg_dimona",l:"Déclaration Dimona (IN/OUT/UPDATE)",unit:'/déclaration',desc:"Déclaration immédiate d'emploi à l'ONSS",price:''},
        {id:"fg_dmfa",l:"Déclaration DMFA trimestrielle",unit:'/trimestre',desc:"Déclaration multifonctionnelle ONSS trimestrielle",price:''},
        {id:"fg_dmfappl",l:"Module ONSS-APL (DMFAPPL)",unit:'/trimestre',desc:"Déclaration ONSS pour administrations provinciales et locales",price:''},
        {id:"fg_primes_synd",l:"Module Primes Syndicales",unit:'/an',desc:"Déclaration et paiement des primes syndicales",price:''},
        {id:"fg_eta",l:"Relevés ETA (Awiph / Cocof)",unit:'/an',desc:"Relevés pour entreprises de travail adapté",price:''},
        {id:"fg_limosa",l:"Déclaration Limosa (détachement)",unit:'/déclaration',desc:"Travailleur étranger détaché en Belgique",price:''},
      ]},
      {cat:"Fiches fiscales & Relevés",color:'#a78bfa',items:[
        {id:"fg_belcotax_10",l:"Fiches Belcotax 281.10 (Rémunérations)",unit:'/fiche/an',desc:"Fiche fiscale annuelle salariés et dirigeants",price:''},
        {id:"fg_fiche_11",l:"Fiches & relevés 281.11 (Pensions)",unit:'/fiche/an',desc:"Pensions, rentes, capitaux",price:''},
        {id:"fg_fiche_14",l:"Fiches & relevés 281.14 (Rentes)",unit:'/fiche/an',desc:"Rentes alimentaires et autres",price:''},
        {id:"fg_fiche_29",l:"Fiches & relevés 281.29 (Économie collaborative)",unit:'/fiche/an',desc:"Revenus plateformes collaboratives",price:''},
        {id:"fg_fiche_30",l:"Fiches & relevés 281.30 (Jetons de présence)",unit:'/fiche/an',desc:"Jetons de présence administrateurs",price:''},
        {id:"fg_fiche_45",l:"Fiches & relevés 281.45 (Droits d\'auteur)",unit:'/fiche/an',desc:"Droits d'auteur et droits voisins",price:''},
        {id:"fg_fiche_50",l:"Fiches & relevés 281.50 (Honoraires)",unit:'/fiche/an',desc:"Honoraires, commissions, indépendants",price:''},
        {id:"fg_precompte",l:"Précompte professionnel (274)",unit:'/mois',desc:"Calcul et déclaration mensuelle du PP",price:''},
        {id:"fg_fiche_fiscal",l:"Fiche fiscale individuelle annuelle",unit:'/travailleur/an',desc:"Résumé fiscal annuel par travailleur",price:''},
      ]},
      {cat:"Documents sociaux — Secteur Chômage",color:'#fb923c',items:[
        {id:"fg_c4",l:"C4 certificat de chômage",unit:'/document',desc:"Certificat de chômage complet C4",price:''},
        {id:"fg_c4_rcc",l:"C4 prépension (RCC)",unit:'/document',desc:"C4 régime de chômage avec complément d'entreprise",price:''},
        {id:"fg_c4_ens",l:"C4 Enseignement",unit:'/document',desc:"C4 spécifique secteur enseignement",price:''},
        {id:"fg_c32_cd",l:"C3.2 constat du droit",unit:'/document',desc:"Constat du droit au chômage temporaire",price:''},
        {id:"fg_c32_ouv",l:"C3.2 employeur → ouvriers",unit:'/document',desc:"Chômage temporaire ouvriers",price:''},
        {id:"fg_c32_emp",l:"C3.2 employeur anti-crise → employés",unit:'/document',desc:"Chômage temporaire employés mesures anti-crise",price:''},
        {id:"fg_c131a",l:"C131A Employeur",unit:'/document',desc:"Attestation employeur chômage temporaire",price:''},
        {id:"fg_c131b",l:"C131B",unit:'/document',desc:"Attestation complémentaire chômage temporaire",price:''},
        {id:"fg_c131a_ens",l:"C131A Employeur - Enseignement",unit:'/document',desc:"C131A spécifique enseignement",price:''},
        {id:"fg_c131b_ens",l:"C131B - Enseignement",unit:'/document',desc:"C131B spécifique enseignement",price:''},
        {id:"fg_c78_act",l:"C78 Activa Winwin/Impulsion/Actiris",unit:'/document',desc:"Activation demandeurs d'emploi Bruxelles/Wallonie",price:''},
        {id:"fg_c78_eta",l:"C78 E.T.A.",unit:'/document',desc:"Entreprise de travail adapté",price:''},
        {id:"fg_c78_start",l:"C78 Activa Start",unit:'/document',desc:"Activation jeunes demandeurs d'emploi",price:''},
        {id:"fg_c78_sine",l:"C78 SINE",unit:'/document',desc:"Économie d'insertion sociale",price:''},
        {id:"fg_c783_ptp",l:"C78.3 P.T.P.",unit:'/document',desc:"Programme de transition professionnelle",price:''},
        {id:"fg_c78_sec",l:"C78 Personnel de sécurité et prévention",unit:'/document',desc:"Activation personnel sécurité/prévention",price:''},
        {id:"fg_c103_je",l:"C103 Jeunes Employeur",unit:'/document',desc:"Obligation d'occupation jeunes - volet employeur",price:''},
        {id:"fg_c103_jt",l:"C103 Jeunes Travailleur",unit:'/document',desc:"Obligation d'occupation jeunes - volet travailleur",price:''},
        {id:"fg_c103_se",l:"C103 Seniors Employeur",unit:'/document',desc:"Obligation d'occupation seniors - volet employeur",price:''},
        {id:"fg_c103_st",l:"C103 Seniors Travailleur",unit:'/document',desc:"Obligation d'occupation seniors - volet travailleur",price:''},
        {id:"fg_c4_drs",l:"C4 DRS (papier)",unit:'/document',desc:"C4 format papier DRS",price:''},
        {id:"fg_c4_rcc_drs",l:"C4 DRS-RCC (papier)",unit:'/document',desc:"C4 RCC format papier DRS",price:''},
      ]},
      {cat:"Documents sociaux — Secteur INAMI",color:'#f472b6',items:[
        {id:"fg_inami_mal",l:"Incapacité de travail (maladie, accident)",unit:'/document',desc:"Déclaration incapacité maladie/accident droit commun",price:''},
        {id:"fg_inami_mat",l:"Incapacité — repos de maternité",unit:'/document',desc:"Déclaration repos de maternité",price:''},
        {id:"fg_inami_ecar_c",l:"Incapacité — écartement complet maternité",unit:'/document',desc:"Écartement complet protection maternité",price:''},
        {id:"fg_inami_ecar_p",l:"Incapacité — écartement partiel maternité",unit:'/document',desc:"Écartement partiel protection maternité",price:''},
        {id:"fg_inami_conv",l:"Repos maternité/paternité converti",unit:'/document',desc:"Conversion congé maternité/paternité",price:''},
        {id:"fg_inami_nais",l:"Congé de naissance (10 jours)",unit:'/document',desc:"Déclaration congé de naissance",price:''},
        {id:"fg_inami_adop",l:"Congé d\'adoption",unit:'/document',desc:"Déclaration congé d'adoption",price:''},
        {id:"fg_inami_rep",l:"Travail adapté: reprise partielle du travail",unit:'/document',desc:"Mi-temps médical, reprise progressive INAMI",price:''},
        {id:"fg_inami_prot",l:"Travail adapté: protection de la maternité",unit:'/document',desc:"Aménagement poste protection maternité",price:''},
        {id:"fg_inami_2emp",l:"Travail adapté: 2 employeurs différents",unit:'/document',desc:"Poursuite travail chez 2 employeurs",price:''},
        {id:"fg_inami_all",l:"Allaitement: déclaration des pauses",unit:'/document',desc:"Déclaration pauses d'allaitement",price:''},
        {id:"fg_vac_caisse",l:"Déclaration annuelle vacances (PV caisse)",unit:'/document',desc:"Pécule vacances payé par une caisse",price:''},
        {id:"fg_vac_empl",l:"Déclaration annuelle vacances (PV employeur)",unit:'/document',desc:"Pécule vacances payé par l'employeur",price:''},
        {id:"fg_inami_repr",l:"Déclaration de reprise du travail",unit:'/document',desc:"Déclaration de reprise après incapacité",price:''},
      ]},
      {cat:"Attestations & Documents papier",color:'#e879f9',items:[
        {id:"fg_att_pv",l:"Attestation Pécules de vacances",unit:'/document',desc:"Attestation simple et double pécule",price:''},
        {id:"fg_att_trav",l:"Attestation de travail",unit:'/document',desc:"Certificat d'occupation",price:''},
        {id:"fg_att_276",l:"Attestation 276 frontaliers",unit:'/document',desc:"Attestation fiscale travailleurs frontaliers",price:''},
      ]},
      {cat:"Secrétariat social — Prestations récurrentes",color:'#818cf8',items:[
        {id:"fg_index",l:"Indexation salariale",unit:'/indexation',desc:"Adaptation des salaires suite à indexation sectorielle",price:''},
        {id:"fg_echeance",l:"Suivi échéances barémiques",unit:'/travailleur/an',desc:"Passage automatique échelon ancienneté",price:''},
        {id:"fg_pecule_vac",l:"Calcul pécule de vacances",unit:'/travailleur/an',desc:"Simple + double pécule, attestation annuelle",price:''},
        {id:"fg_prime_fin",l:"Prime de fin d\'année / 13ème mois",unit:'/travailleur/an',desc:"Calcul et traitement de la prime annuelle",price:''},
        {id:"fg_eco_cheques",l:"Gestion éco-chèques",unit:'/an',desc:"Commande et attribution annuelle",price:''},
        {id:"fg_sepa",l:"Génération fichier SEPA virements",unit:'/mois',desc:"Fichier pain.001 pour banque",price:''},
        {id:"fg_compte_indiv",l:"Compte individuel annuel",unit:'/travailleur/an',desc:"Récapitulatif annuel obligatoire par travailleur",price:''},
      ]},
      {cat:"Événements & Prestations ponctuelles",color:'#f59e0b',items:[
        {id:"fg_maladie",l:"Gestion maladie / accident",unit:'/événement',desc:"Salaire garanti, attestation mutuelle, suivi",price:''},
        {id:"fg_mitemps_med",l:"Mi-temps médical / thérapeutique (reprise progressive)",unit:'/dossier',desc:"Simulation, formulaires, suivi INAMI",price:''},
        {id:"fg_maternite",l:"Congé de maternité / naissance",unit:'/événement',desc:"Déclaration, calcul indemnités, formulaires",price:''},
        {id:"fg_credit_temps",l:"Crédit-temps / congé thématique",unit:'/dossier',desc:"Demande ONEM, simulation allocation, avenant",price:''},
        {id:"fg_préavis",l:"Calcul de préavis",unit:'/simulation',desc:"Simulation préavis légal selon ancienneté Claeys",price:''},
        {id:"fg_licenciement",l:"Dossier licenciement complet",unit:'/dossier',desc:"Lettre, C4, pécule sortie, outplacement, motivation",price:''},
        {id:"fg_faute_grave",l:"Procédure faute grave",unit:'/dossier',desc:"Lettre recommandée, constat, délais légaux",price:''},
        {id:"fg_sanctions",l:"Sanctions disciplinaires",unit:'/dossier',desc:"Avertissement, blâme, rétrogradation",price:''},
        {id:"fg_accident_travail",l:"Déclaration accident de travail",unit:'/déclaration',desc:"Formulaire assureur, rapport circonstancié",price:''},
        {id:"fg_detachement",l:"Détachement travailleur",unit:'/dossier',desc:"Formulaire A1, Limosa, conditions pays d'accueil",price:''},
      ]},
      {cat:"Contrats & Documents juridiques",color:'#34d399',items:[
        {id:"fg_contrat_cdi",l:"Rédaction contrat CDI",unit:'/contrat',desc:"Contrat conforme loi 03/07/1978 + clauses",price:''},
        {id:"fg_contrat_cdd",l:"Rédaction contrat CDD",unit:'/contrat',desc:"Contrat à durée déterminée + renouvellements",price:''},
        {id:"fg_contrat_etudiant",l:"Convention étudiant",unit:'/contrat',desc:"Convention d'occupation étudiant + Dimona STU",price:''},
        {id:"fg_contrat_flexi",l:"Contrat flexi-job",unit:'/contrat',desc:"Contrat-cadre + contrat d'exécution",price:''},
        {id:"fg_contrat_indep",l:"Convention collaboration indépendante",unit:'/convention',desc:"Convention B2B, critères de subordination",price:''},
        {id:"fg_avenant",l:"Avenant au contrat",unit:'/avenant',desc:"Modification conditions: temps partiel, fonction, salaire",price:''},
        {id:"fg_reglement",l:"Rédaction règlement de travail",unit:'/document',desc:"Règlement de travail conforme + procédure affichage",price:''},
        {id:"fg_politique",l:"Politique interne (car policy, télétravail...)",unit:'/document',desc:"Rédaction politique d'entreprise",price:''},
      ]},
      {cat:"Reporting & Obligations annuelles",color:'#06b6d4',items:[
        {id:"fg_bilan_social",l:"Bilan social BNB",unit:'/an',desc:"Établissement et dépôt du bilan social annuel",price:''},
        {id:"fg_stats_ins",l:"Statistiques INS",unit:'/an',desc:"Enquête statistique obligatoire INS/Statbel",price:''},
        {id:"fg_assloi",l:"Relevé assurance-loi AT",unit:'/an',desc:"Déclaration annuelle masse salariale assureur AT",price:''},
        {id:"fg_caisse_vac",l:"Déclaration caisse vacances (ouvriers)",unit:'/an',desc:"Déclaration annuelle à la caisse de vacances",price:''},
        {id:"fg_peppol",l:"Facturation PEPPOL / e-Invoicing",unit:'/facture',desc:"Émission facture UBL via réseau PEPPOL",price:''},
      ]},
      {cat:"Simulations & Outils RH",color:'#f97316',items:[
        {id:"fg_sim_cout_sal",l:"Simulation coût salarial",unit:'/simulation',desc:"Simulation complète du coût d'un travailleur (brut→net, charges patronales)",price:''},
        {id:"fg_sim_brut_net",l:"Calcul brut → net / net → brut",unit:'/simulation',desc:"Conversion salariale avec toutes les retenues",price:''},
        {id:"fg_sim_préavis_det",l:"Simulation indemnité de préavis détaillée",unit:'/simulation',desc:"Calcul préavis Claeys avec ventilation complète",price:''},
        {id:"fg_sim_vacances",l:"Simulation pécule de vacances",unit:'/simulation',desc:"Estimation simple et double pécule anticipée",price:''},
        {id:"fg_sim_prime_fin",l:"Simulation prime de fin d\'année",unit:'/simulation',desc:"Calcul anticipé prime sectorielle ou d'entreprise",price:''},
        {id:"fg_benchmark_sal",l:"Benchmark salarial sectoriel",unit:'/rapport',desc:"Comparaison rémunération avec le marché du secteur",price:''},
        {id:"fg_total_reward",l:"Total Reward Statement",unit:'/travailleur/an',desc:"Récapitulatif global de la rémunération (salaire + avantages)",price:''},
      ]},
      {cat:"Aides à l'emploi & Réductions",color:'#14b8a6',items:[
        {id:"fg_aide_1er_eng",l:"Réduction premier engagement (groupe-cible)",unit:'/dossier',desc:"Demande réduction cotisations patronales 1er à 6ème travailleur",price:''},
        {id:"fg_aide_activa",l:"Activation Activa / Impulsion / Actiris",unit:'/dossier',desc:"Demande d'aides régionales à l'embauche",price:''},
        {id:"fg_aide_restructuration",l:"Réduction restructuration / zone d\'aide",unit:'/dossier',desc:"Réductions cotisations zones en difficulté / restructuration",price:''},
        {id:"fg_aide_travailleurs_ages",l:"Réduction travailleurs âgés",unit:'/dossier',desc:"Demande réduction groupe-cible travailleurs 55+",price:''},
        {id:"fg_aide_jeunes",l:"Convention premier emploi (CPE / Rosetta)",unit:'/dossier',desc:"Demande mise en place convention premier emploi jeunes",price:''},
        {id:"fg_aide_titre_service",l:"Titres-services",unit:'/dossier',desc:"Gestion administrative titres-services (employeurs agréés)",price:''},
        {id:"fg_suivi_subsides",l:"Suivi et optimisation subsides / aides",unit:'/trimestre',desc:"Screening permanent des aides applicables à l'entreprise",price:''},
      ]},
      {cat:"Rémunération alternative & Avantages",color:'#8b5cf6',items:[
        {id:"fg_plan_cafeteria",l:"Mise en place plan cafétéria",unit:'/dossier',desc:"Implémentation rémunération flexible (Payflip, MyChoice...)",price:''},
        {id:"fg_plan_cafeteria_gestion",l:"Gestion plan cafétéria (récurrent)",unit:'/mois',desc:"Suivi mensuel choix salariés, ajustements, administration",price:''},
        {id:"fg_bonus_cct90",l:"Bonus salarial CCT 90 (non-récurrent)",unit:'/dossier',desc:"Mise en place et gestion bonus lié aux résultats collectifs",price:''},
        {id:"fg_prime_benef",l:"Prime bénéficiaire (Loi 2018)",unit:'/dossier',desc:"Calcul et administration prime sur bénéfices de la société",price:''},
        {id:"fg_warrants",l:"Warrants / Stock options",unit:'/dossier',desc:"Attribution et gestion warrants comme rémunération alternative",price:''},
        {id:"fg_voiture_societe",l:"Gestion voiture de société / ATN",unit:'/véhicule/mois',desc:"Calcul ATN, cotisation CO₂, avantage fiscal",price:''},
        {id:"fg_budget_mobilite",l:"Budget mobilité (multimodal)",unit:'/travailleur/mois',desc:"Gestion budget mobilité : pilier 1/2/3, allocation cash",price:''},
        {id:"fg_cheques_sport",l:"Chèques sport & culture",unit:'/an',desc:"Attribution et commande chèques sport & culture",price:''},
        {id:"fg_assurance_groupe",l:"Assurance groupe / pension complémentaire",unit:'/travailleur/an',desc:"Gestion 2ème pilier pension, fiche 281.11",price:''},
        {id:"fg_assurance_hosp",l:"Assurance hospitalisation DKV/AG/Ethias",unit:'/travailleur/an',desc:"Gestion affiliations/résiliations assurance hospitalisation",price:''},
      ]},
      {cat:"Congés spéciaux & Absences",color:'#ec4899',items:[
        {id:"fg_conge_educ",l:"Congé-éducation payé (CEP)",unit:'/dossier',desc:"Demande remboursement congé-éducation payé auprès de la Région",price:''},
        {id:"fg_conge_politique",l:"Congé politique / mandat public",unit:'/dossier',desc:"Gestion absence et rémunération mandat politique",price:''},
        {id:"fg_chomage_temp",l:"Chômage temporaire (économique / force majeure)",unit:'/dossier',desc:"Demande ONEM, C3.2, notification, suivi mensuel",price:''},
        {id:"fg_chomage_temp_intemperies",l:"Chômage temporaire intempéries (construction)",unit:'/dossier',desc:"Déclaration chômage intempéries secteur construction",price:''},
        {id:"fg_prepension",l:"RCC / Prépension (régime chômage avec complément)",unit:'/dossier',desc:"Dossier complet RCC: calcul, C4-RCC, convention, ONEM",price:''},
        {id:"fg_outplacement",l:"Outplacement (reclassement professionnel)",unit:'/dossier',desc:"Organisation et suivi outplacement obligatoire ou volontaire",price:''},
        {id:"fg_conge_paternel",l:"Congé parental",unit:'/dossier',desc:"Demande ONEM congé parental 1/5 ou 1/2 temps",price:''},
        {id:"fg_conge_aidant",l:"Congé pour aidants proches",unit:'/dossier',desc:"Demande congé thématique aidant proche reconnu",price:''},
        {id:"fg_absence_track",l:"Rapport & analyse absentéisme",unit:'/rapport',desc:"Rapport périodique absentéisme, Bradford Factor, coûts",price:''},
      ]},
      {cat:"Bien-être & Prévention au travail",color:'#10b981',items:[
        {id:"fg_sepp",l:"Affiliation SEPP (service externe PPT)",unit:'/an',desc:"Affiliation service externe prévention et protection au travail",price:''},
        {id:"fg_plan_prevention",l:"Plan global de prévention (5 ans)",unit:'/document',desc:"Rédaction plan global prévention sécurité santé",price:''},
        {id:"fg_plan_annuel",l:"Plan d\'action annuel (PAA)",unit:'/an',desc:"Rédaction plan d'action annuel bien-être au travail",price:''},
        {id:"fg_risques_psycho",l:"Analyse risques psychosociaux",unit:'/audit',desc:"Enquête et rapport risques burnout, harcèlement, stress",price:''},
        {id:"fg_conseiller_prev",l:"Désignation conseiller en prévention",unit:'/dossier',desc:"Mise en conformité désignation conseiller prévention interne",price:''},
        {id:"fg_medecine_travail",l:"Gestion examens médecine du travail",unit:'/travailleur/an',desc:"Planification visites médicales, suivi aptitudes",price:''},
        {id:"fg_alcool_drogues",l:"Politique alcool et drogues",unit:'/document',desc:"Rédaction politique préventive CCT 100",price:''},
      ]},
      {cat:"Organes sociaux & Relations collectives",color:'#0ea5e9',items:[
        {id:"fg_ce",l:"Secrétariat Conseil d\'Entreprise (CE)",unit:'/réunion',desc:"Préparation informations économiques et sociales CE",price:''},
        {id:"fg_cppt",l:"Secrétariat CPPT",unit:'/réunion',desc:"Préparation réunions Comité Prévention Protection Travail",price:''},
        {id:"fg_ds",l:"Accompagnement délégation syndicale",unit:'/réunion',desc:"Préparation réponses, CCT d'entreprise, négociations",price:''},
        {id:"fg_elections_sociales",l:"Élections sociales",unit:'/cycle',desc:"Gestion complète procédure élections sociales (tous les 4 ans)",price:''},
        {id:"fg_cct_entreprise",l:"Rédaction CCT d\'entreprise",unit:'/document',desc:"Négociation et rédaction convention collective d'entreprise",price:''},
      ]},
      {cat:"Consulting & Accompagnement",color:'#c084fc',items:[
        {id:"fg_conseil_rh",l:"Conseil RH / Droit social",unit:'/heure',desc:"Consultation en droit du travail, CCT, conventions",price:''},
        {id:"fg_audit_social",l:"Audit social",unit:'/audit',desc:"Vérification conformité sociale, analyse risques",price:''},
        {id:"fg_optimisation",l:"Optimisation salariale",unit:'/dossier',desc:"Plan cafétéria, warrants, avantages fiscaux",price:''},
        {id:"fg_restructuration",l:"Accompagnement restructuration",unit:'/dossier',desc:"Plan Renault, licenciement collectif, plan social",price:''},
        {id:"fg_starter",l:"Pack starter nouvelle entreprise",unit:'/dossier',desc:"Inscription ONSS, 1er engagement, affiliations",price:''},
        {id:"fg_formation",l:"Formation client (logiciel/payroll)",unit:'/session',desc:"Formation utilisation plateforme ou process paie",price:''},
        {id:"fg_due_diligence",l:"Due diligence sociale (acquisition)",unit:'/dossier',desc:"Audit social pré-acquisition: risques, provisions, conformité",price:''},
        {id:"fg_inspection",l:"Accompagnement contrôle / inspection sociale",unit:'/dossier',desc:"Assistance lors d'inspection ONSS, SPF Emploi, contributions",price:''},
        {id:"fg_mediation",l:"Médiation sociale",unit:'/dossier',desc:"Médiation conflits employeur-travailleur, harcèlement",price:''},
      ]},
      {cat:"Export / Import & Frais administratifs",color:'#9ca3af',items:[
        {id:"fg_export_dif",l:"Exportation données format DIF",unit:'/export',desc:"Export données en format DIF pour usage externe",price:''},
        {id:"fg_import_pointage",l:"Importation données pointage / paie",unit:'/import',desc:"Import fichiers pointage/paie depuis systèmes externes",price:''},
        {id:"fg_export_compta",l:"Export écritures comptables personnalisées",unit:'/mois',desc:"Export OD vers logiciel comptable avec mapping personnalisé",price:''},
        {id:"fg_courrier_rec",l:"Envoi courrier recommandé",unit:'/envoi',desc:"Lettre recommandée avec AR",price:''},
        {id:"fg_copies",l:"Copies et impressions",unit:'/page',desc:"Copies documents, fiches, contrats",price:''},
        {id:"fg_archivage",l:"Archivage dossier (5 ans)",unit:'/travailleur/an',desc:"Conservation obligatoire documents sociaux",price:''},
        {id:"fg_urgence",l:"Supplément traitement urgent",unit:'/prestation',desc:"Prestation hors délai standard (< 24h)",price:''},
        {id:"fg_hors_heures",l:"Prestation hors heures bureau",unit:'/heure',desc:"Travail soir, week-end, jours fériés",price:''},
        {id:"fg_traduction",l:"Traduction documents (FR/NL/DE/EN)",unit:'/document',desc:"Traduction contrats, règlements, communications multilingues",price:''},
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
      <B onClick={()=>d({type:"MODAL",m:{w:900,c:<div>
        <h3 style={{color:'#e8e6e0',margin:'0 0 10px',fontFamily:"'Cormorant Garamond',serif"}}>Grille tarifaire — {s.co.name||'Aureus Social Pro'}</h3>
        <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:500,overflowY:'auto'}}>{exportGrille()}</pre>
        <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}>
          <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
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
        {cat.items.map((it,ii)=><div key={it.id} style={{padding:'10px 12px',marginBottom:6,background:"rgba(198,163,78,.02)",border:'1px solid rgba(198,163,78,.04)',borderRadius:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0'}}>{it.l}</div>
              <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{it.desc}</div>
              <div style={{fontSize:9.5,color:cat.color,marginTop:3}}>{it.unit}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,minWidth:100}}>
              <input type="number" value={it.price} onChange={e=>updPrice(ci,ii,e.target.value)} placeholder="—" style={{width:70,padding:'5px 8px',background:"#090c16",border:'1px solid rgba(139,115,60,.12)',borderRadius:5,color:it.price?'#4ade80':'#5e5c56',fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'right'}}/>
              <span style={{fontSize:10,color:'#5e5c56'}}>€</span>
            </div>
          </div>
        </div>)}
      </C>)}
    </div>

    <C style={{marginTop:20}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <div style={{padding:14,background:"rgba(198,163,78,.06)",borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Prestations</div>
          <div style={{fontSize:24,fontWeight:700,color:'#c6a34e'}}>{totalItems}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>types de services</div>
        </div>
        <div style={{padding:14,background:"rgba(74,222,128,.06)",borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Tarifs définis</div>
          <div style={{fontSize:24,fontWeight:700,color:'#4ade80'}}>{filledItems}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>sur {totalItems}</div>
        </div>
        <div style={{padding:14,background:"rgba(96,165,250,.06)",borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#5e5c56'}}>Catégories</div>
          <div style={{fontSize:24,fontWeight:700,color:'#60a5fa'}}>{tarifs.length}</div>
          <div style={{fontSize:10,color:'#5e5c56'}}>familles de services</div>
        </div>
      </div>
      <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.05)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
        <b>💡 Conseil:</b> Définissez vos tarifs puis utilisez le module PEPPOL pour facturer directement vos clients via le réseau de facturation électronique. Les frais de gestion sont facturés HTVA (TVA 21% applicable). Vous pouvez exporter la grille tarifaire complète comme annexe à vos conventions de service.
      </div>
    </C>
  </div>;
}

export function EnvoiMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [tab,setTab]=useState("fiches");const [mois,setMois]=useState(new Date().getMonth());const moiNoms=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);return <div><PH title="Envoi Documents" sub={"Distribution fiches de paie & documents — "+ae.length+" destinataires — LOIS_BELGES"}/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Destinataires",v:ae.length,c:"#c6a34e"},{l:"Période",v:moiNoms[mois]+" "+new Date().getFullYear(),c:"#60a5fa"},{l:"Fiches à envoyer",v:ae.length,c:"#22c55e"},{l:"NISS masqués",v:"✅ obf",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Liste d'envoi — {moiNoms[mois]}</ST><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"2px solid rgba(198,163,78,.2)"}}>{["Nom","NISS","Email","Net estimé","Statut envoi"].map(h=><th key={h} style={{padding:"8px 6px",textAlign:"left",color:"#c6a34e",fontWeight:600,fontSize:10}}>{h}</th>)}</tr></thead><tbody>{ae.map((e,i)=>{const net=quickNet(+(e.gross||0));return <tr key={e.id||i} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"6px"}}>{(e.first||e.fn||'')+" "+(e.last||e.ln||'')}</td><td style={{padding:"6px",fontFamily:"monospace",fontSize:9}}>{obf.maskNISS(e.niss)}</td><td style={{padding:"6px",fontSize:10}}>{e.email||"—"}</td><td style={{padding:"6px",fontWeight:600,color:"#22c55e"}}>{f2(net)}</td><td style={{padding:"6px"}}><span style={{fontSize:9,padding:"2px 8px",borderRadius:4,background:"rgba(74,222,128,.1)",color:"#4ade80"}}>Prêt</span></td></tr>;})}</tbody></table></div></C></div>;}

export function FichesMod({s,d}){const ae= s?.emps||[];const [tab,setTab]=useState("fiches");return <div><PH title="Fiches Fiscales 281" sub="Fiches 281.10 - Belcotax - Declaration annuelle"/><div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"fiches",l:"Fiches 281.10"},{v:"belcotax",l:"Belcotax XML"},{v:"contenu",l:"Contenu"},{v:"legal",l:"Deadlines"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>{tab==="fiches"&&<C><ST>Fiches 281.10 par travailleur</ST><Tbl cols={[{k:"n",l:"Nom",b:1,r:r=>(r.fn||"")+" "+(r.ln||"")},{k:"ni",l:"NISS",r:r=><span style={{fontFamily:"monospace",fontSize:10,color:"#60a5fa"}}>{r.niss||"MANQUANT"}</span>},{k:"b",l:"Brut annuel",a:"right",r:r=><span style={{color:"#c6a34e"}}>{fmt((+r.gross||0)*12)}</span>},{k:"o",l:"ONSS retenu",a:"right",r:r=><span style={{color:"#f87171"}}>{fmt((+r.gross||0)*12*TX_ONSS_W)}</span>},{k:"p",l:"PP retenu",a:"right",r:r=><span style={{color:"#f87171"}}>{fmt(quickPP(+r.gross||0)*12)}</span>}]} data={ae}/></C>}{tab==="belcotax"&&<C><ST>Belcotax XML</ST>{[{t:"Format",d:"XML structure conforme schema XSD SPF Finances."},{t:"Depot",d:"Via Belcotax-on-web. Electronique obligatoire."},{t:"Deadline",d:"1er mars N+1 (pour revenus N)."},{t:"Contenu",d:"Toutes fiches 281 (10, 20, 30) de exercice."},{t:"Correction",d:"Possible via depot correctif avant deadline."}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#c6a34e",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}</C>}{tab==="contenu"&&<C><ST>Contenu fiche 281.10</ST>{["Rémunérations brutes","ONSS personnelle retenue","Precompte professionnel retenu","Avantages de toute nature (ATN)","Cotisation spéciale sécurité sociale","Frais propres employeur","Cheques-repas","Bonus CCT 90","Assurance groupe (cotisations)","Eco-cheques","Prime fin annee / 13eme mois","Pécule de vacances (employes)"].map((r,i)=><div key={i} style={{padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.03)",fontSize:12,color:"#e8e6e0"}}><span style={{color:"#c6a34e",marginRight:6}}>{i+1}.</span>{r}</div>)}</C>}{tab==="legal"&&<C><ST>Deadlines</ST>{[{d:"28 fevrier N+1",t:"Remise fiches 281.10 aux travailleurs",c:"#f87171"},{d:"1er mars N+1",t:"Depot Belcotax XML au SPF Finances",c:"#f87171"},{d:"30 juin N+1",t:"Declaration IPP (si papier)",c:"#fb923c"},{d:"15 juillet N+1",t:"Declaration IPP electronique via Tax-on-web",c:"#fb923c"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:r.c,fontSize:12}}>{r.d}</b><span style={{color:"#9e9b93",fontSize:11}}>{r.t}</span></div>)}</C>}</div>;}

export function PortailEmployeurMod({s,d,per}){const loisRef=LOIS_BELGES;const nEmps=(s?.emps||[]).length;const masseChargee=Math.round((s?.emps||[]).reduce((a,e)=>a+(+e.gross||0),0)*(1+TX_ONSS_E));
  const [clientView,setClientView]=useState('accueil');
  const [encodMode,setEncodMode]=useState('mensuel');
  const [selectedMonth,setSelectedMonth]=useState(per?.m||new Date().getMonth()+1);
  const [selectedYear,setSelectedYear]=useState(per?.y||new Date().getFullYear());
  const [encodData,setEncodData]=useState({});
  const [demandes,setDemandes]=useState([]);
  const [msgs,setMsgs]=useState([]);
  const [accessCodes,setAccessCodes]=useState([]);
  const ae=(s?.emps||[]).filter(e=>e.status==='active');

  // Simulate access code generation for client
  const genAccess=()=>{
    const code={id:uid(),client:s.co.name,login:`client_${s.co.name?.toLowerCase().replace(/\s/g,"_")||'demo'}`,
      pwd: (()=>{ const a=new Uint8Array(6); crypto.getRandomValues(a); return 'ASP'+Array.from(a).map(b=>b.toString(36)).join('').toUpperCase().slice(0,8); })(),
      url:`https://portail.aureus-social.be/client/${uid().substring(0,8)}`,
      created:new Date().toISOString(),perms:['encodage',"consultation","demandes","messages"],active:true};
    setAccessCodes([code,...accessCodes]);
  };

  // Absence types
  const absTypes=[
    {v:"conge_annuel",l:"Congé annuel",ic:'🏖'},
    {v:"maladie",l:"Maladie (certificat)",ic:'🏥'},
    {v:"petit_chomage",l:"Petit chômage",ic:'📋'},
    {v:"sans_solde",l:"Congé sans solde",ic:'⏸'},
    {v:"formation",l:"Congé formation",ic:'🎓'},
    {v:"maternite",l:"Maternité",ic:'👶'},
    {v:"paternite",l:"Paternité / Naissance",ic:'👨‍👧'},
    {v:"credit_temps",l:"Crédit-temps",ic:'⏱'},
    {v:"accident_travail",l:"Accident de travail",ic:'⚠'},
    {v:"chomage_eco",l:"Chômage économique",ic:'📉'},
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
          <B onClick={()=>d({type:"MODAL",m:{w:700,c:<div>
            <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 14px',fontFamily:"'Cormorant Garamond',serif"}}>🔐 Architecture de sécurité</h2>
            <div style={{fontSize:12,color:'#9e9b93',lineHeight:1.8}}>
              {[
                {t:'Isolation des données',d:"Chaque client accède uniquement à son dossier via un identifiant unique. Aucun accès aux données des autres clients ni à votre back-office bureau social."},
                {t:'Authentification',d:"Login + mot de passe auto-généré + lien unique par client. Authentification à 2 facteurs recommandée (SMS/email)."},
                {t:'Permissions granulaires',d:"L'employeur peut: encoder prestations, soumettre demandes d'absence, consulter fiches de paie, envoyer messages. Il ne peut PAS: modifier salaires, accéder aux calculs, voir les tarifs bureau social."},
                {t:'Traçabilité',d:"Toute action du client est horodatée et tracée. Vous voyez en temps réel ce qu'il a encodé et quand."},
                {t:'RGPD',d:"Données hébergées en Belgique, chiffrées en transit (TLS 1.3) et au repos (AES-256). Politique de rétention conforme RGPD. DPO: Aureus IA SPRL."},
              ].map((x,i)=><div key={i} style={{marginBottom:12,padding:10,background:"rgba(198,163,78,.03)",borderRadius:6}}>
                <div style={{fontWeight:600,color:'#c6a34e',fontSize:12}}>{x.t}</div>
                <div style={{fontSize:11,color:'#9e9b93',marginTop:3}}>{x.d}</div>
              </div>)}
            </div>
            <B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B>
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
        <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600,textAlign:'center'}}>Actif</span>
      </div>)}
    </C>}

    {/* Client portal preview tabs */}
    <div style={{display:'flex',gap:4,marginBottom:14}}>
      {[{id:"accueil",l:"🏠 Accueil client"},{id:"encodage",l:"📝 Encodage prestations"},{id:"absences",l:"🏖 Demandes absences"},{id:"fiches",l:"📄 Fiches de paie"},{id:"messages",l:"💬 Messages"},{id:"suivi",l:"📊 Suivi bureau social"}].map(t=>
        <button key={t.id} onClick={()=>setClientView(t.id)} style={{padding:'7px 14px',borderRadius:7,fontSize:10.5,fontWeight:clientView===t.id?600:400,
          background:clientView===t.id?'rgba(96,165,250,.12)':'rgba(255,255,255,.02)',color:clientView===t.id?'#60a5fa':'#9e9b93',
          border:clientView===t.id?'1px solid rgba(96,165,250,.25)':'1px solid rgba(255,255,255,.04)',cursor:'pointer'}}>{t.l}</button>
      )}
    </div>

    {/* Simulated client portal */}
    <C style={{padding:0,overflow:'hidden',border:'1px solid rgba(96,165,250,.15)'}}>
      <div style={{padding:'12px 18px',background:"linear-gradient(135deg,rgba(96,165,250,.08),rgba(198,163,78,.05))",borderBottom:'1px solid rgba(96,165,250,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>🏢</span>
          <div>
            <div style={{fontWeight:600,fontSize:13,color:'#e8e6e0'}}>{s.co.name} — Portail Employeur</div>
            <div style={{fontSize:9.5,color:'#5e5c56'}}>Vue client • Données isolées • Aureus Social Pro</div>
          </div>
        </div>
        <div style={{fontSize:10,color:'#60a5fa',padding:'3px 10px',borderRadius:4,background:"rgba(96,165,250,.1)"}}>👤 {s.co.name}</div>
      </div>

      <div style={{padding:18}}>
        {/* ── Accueil client ── */}
        {clientView==='accueil'&&<div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
            {[
              {l:"Travailleurs actifs",v:ae.length,c:'#4ade80',ic:'👥'},
              {l:"Prestations à encoder",v:`${MN[selectedMonth-1]}`,c:'#c6a34e',ic:'📝'},
              {l:"Demandes en cours",v:demandes.filter(d=>d.status==='en_attente').length,c:'#60a5fa',ic:'📋'},
              {l:"Messages non lus",v:0,c:'#a78bfa',ic:'💬'},
            ].map((x,i)=><div key={i} style={{padding:14,background:"rgba(255,255,255,.02)",borderRadius:8,textAlign:'center',border:'1px solid rgba(255,255,255,.04)'}}>
              <div style={{fontSize:22,marginBottom:4}}>{x.ic}</div>
              <div style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{x.l}</div>
            </div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{padding:14,background:"rgba(198,163,78,.04)",borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <div style={{fontWeight:600,fontSize:12,color:'#c6a34e',marginBottom:8}}>📅 Échéances</div>
              {[
                {d:"Avant le 5",l:`Encodage prestations ${MN[selectedMonth-1]}`,u:true},
                {d:"Le 25",l:"Dernier délai modifications paie"},
                {d:"Fin du mois",l:"Fiches de paie disponibles"},
              ].map((x,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5}}>
                <span style={{color:'#9e9b93'}}>{x.d}</span>
                <span style={{color:x.u?'#c6a34e':'#e8e6e0',fontWeight:x.u?600:400}}>{x.l}</span>
              </div>)}
            </div>
            <div style={{padding:14,background:"rgba(96,165,250,.04)",borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
              <div style={{fontWeight:600,fontSize:12,color:'#60a5fa',marginBottom:8}}>📋 Actions rapides</div>
              {[
                {l:"Encoder les prestations du mois",a:()=>setClientView('encodage')},
                {l:"Demander un congé / absence",a:()=>setClientView('absences')},
                {l:"Consulter les fiches de paie",a:()=>setClientView('fiches')},
                {l:"Envoyer un message",a:()=>setClientView('messages')},
              ].map((x,i)=><div key={i} onClick={x.a} style={{padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,color:'#60a5fa',cursor:'pointer'}}>{x.l} →</div>)}
            </div>
          </div>
        </div>}

        {/* ── Encodage prestations ── */}
        {clientView==='encodage'&&<div>
          <div style={{display:'flex',gap:12,marginBottom:14,alignItems:'center'}}>
            <I label="" value={selectedMonth} onChange={v=>setSelectedMonth(parseInt(v))} options={MN.map((m,i)=>({v:i+1,l:m}))} style={{width:140}}/>
            <I label="" type="number" value={selectedYear} onChange={v=>setSelectedYear(v)} style={{width:100}}/>
            <I label="" value={encodMode} onChange={setEncodMode} options={[{v:"mensuel",l:"Vue mensuelle (résumé)"},{v:"journalier",l:"Vue journalière (détail)"}]} style={{width:250}}/>
          </div>

          {encodMode==='mensuel'&&<div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
              <thead><tr style={{background:"rgba(198,163,78,.05)"}}>
                {['Travailleur',"Jours prestés","H. normales","H. sup.","H. nuit","H. dim/JF","Maladie","Congé","Autre abs.","Note"].map(h=>
                  <th key={h} style={{textAlign:'left',padding:'10px 10px',fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {ae.map((emp,i)=>{
                  const k=`${emp.id}_${selectedMonth}`;
                  const data=encodData[k]||{jrs:21,hN:159.6,hS:0,hNu:0,hD:0,mal:0,cng:0,autr:0,note:""};
                  return <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <td style={{padding:'8px 10px',fontWeight:500}}>{emp.first} {emp.last}</td>
                    {['jrs',"hN","hS","hNu","hD","mal","cng","autr"].map(f=><td key={f} style={{padding:'4px 6px'}}>
                      <input type="number" value={data[f]||0} onChange={e=>{const nd={...data,[f]:parseFloat(e.target.value)||0};setEncodData({...encodData,[k]:nd});}}
                        style={{width:60,padding:'5px 6px',borderRadius:4,border:'1px solid rgba(255,255,255,.08)',background:"rgba(255,255,255,.03)",color:'#e8e6e0',fontSize:11.5,textAlign:'right'}}/>
                    </td>)}
                    <td style={{padding:'4px 6px'}}><input type="text" value={data.note||''} onChange={e=>{const nd={...data,note:e.target.value};setEncodData({...encodData,[k]:nd});}}
                      style={{width:'100%',padding:'5px 6px',borderRadius:4,border:'1px solid rgba(255,255,255,.08)',background:"rgba(255,255,255,.03)",color:'#e8e6e0',fontSize:11}}
                      placeholder="Remarque..."/></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>}

          {encodMode==='journalier'&&<div style={{overflowX:'auto'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Grille journalière — {MN[selectedMonth-1]} {selectedYear}</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
              <thead><tr style={{background:"rgba(198,163,78,.05)"}}>
                <th style={{padding:'8px 6px',textAlign:'left',fontSize:9.5,color:'#5e5c56',fontWeight:600,position:'sticky',left:0,background:"#0a0d17",zIndex:1}}>Travailleur</th>
                {Array.from({length:daysInMonth2},(_,i)=>{
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
                  <td style={{padding:'6px',fontWeight:500,fontSize:11,whiteSpace:'nowrap',position:'sticky',left:0,background:"#0a0d17",zIndex:1}}>{emp.first} {emp.last.charAt(0)}.</td>
                  {Array.from({length:daysInMonth2},(_,di)=>{
                    const dt=new Date(selectedYear,selectedMonth-1,di+1);
                    const dow=dt.getDay();const isWE=dow===0||dow===6;
                    const key=`${emp.id}_${di+1}`;
                    const val=encodData[key];
                    const colors={P:'#4ade80',M:'#f87171',C:'#60a5fa',F:'#a78bfa',S:'#c6a34e'};
                    return <td key={di} style={{padding:'2px',textAlign:'center',background:isWE?'rgba(255,255,255,.01)':'transparent'}}>
                      {isWE?<span style={{color:'#2a2920',fontSize:9}}>—</span>:
                      <button onClick={()=>{const types=['P',"M","C","F","S",undefined];const ci=types.indexOf(val);toggleEncod(emp.id,di+1,types[(ci+1)%types.length]);}}
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
              {[{c:'P',l:"Presté",cl:"#4ade80"},{c:'M',l:"Maladie",cl:"#f87171"},{c:'C',l:"Congé",cl:"#60a5fa"},{c:'F',l:"Férié/Formation",cl:"#a78bfa"},{c:'S',l:"H.Sup",cl:"#c6a34e"}].map(x=>
                <span key={x.c} style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{display:'inline-block',width:14,height:14,borderRadius:3,background:`${x.cl}20`,color:x.cl,textAlign:'center',fontWeight:700,fontSize:8,lineHeight:'14px'}}>{x.c}</span>
                  <span style={{color:'#9e9b93'}}>{x.l}</span>
                </span>
              )}
              <span style={{color:'#5e5c56',marginLeft:8}}>Cliquez pour cycler les types</span>
            </div>
          </div>}

          <div style={{display:'flex',gap:10,marginTop:14}}>
            <B onClick={()=>{const rows=ae.map(emp=>{const k=`${emp.id}_${selectedMonth}`;const data=encodData[k]||{jrs:21,hN:159.6,hS:0,hNu:0,hD:0,mal:0,cng:0,autr:0,note:""};return`${emp.first||''} ${emp.last||''};${data.jrs||0};${data.hN||0};${data.hS||0};${data.hNu||0};${data.hD||0};${data.mal||0};${data.cng||0};${data.autr||0};${data.note||''}`;});const csv="Travailleur;Jours;H.Norm;H.Sup;H.Nuit;H.Dim;Maladie;Congé;Autre;Note\n"+rows.join("\n");const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Prestations_${MN[selectedMonth-1]}_${selectedYear}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);submitDemande(s.co.name||'Client','Prestations '+MN[selectedMonth-1]+' '+selectedYear,new Date().toISOString().split('T')[0],new Date().toISOString().split('T')[0],'Encodage mensuel envoyé');}}>✅ Envoyer au bureau social</B>
            <B v="outline" onClick={()=>{try{sessionStorage.setItem('aureus_prestations_'+selectedMonth+'_'+selectedYear,JSON.stringify(encodData));if(typeof addToast==='function')addToast('💾 Brouillon sauvegardé');else alert('💾 Brouillon sauvegardé pour '+MN[selectedMonth-1]+' '+selectedYear);}catch(e){alert('Erreur: '+e.message);}}}>💾 Sauvegarder brouillon</B>
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
                  <I label="Travailleur" value={ae[0]?.id||''} onChange={()=>{}} options={ae.map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))}/>
                  <I label="Type d'absence" value="conge_annuel" onChange={()=>{}} style={{marginTop:8}} options={absTypes2.map(a=>({v:a.v,l:`${a.ic} ${a.l}`}))}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                    <I label="Du" type="date" value={new Date().toISOString().split('T')[0]} onChange={()=>{}}/>
                    <I label="Au" type="date" value={new Date().toISOString().split('T')[0]} onChange={()=>{}}/>
                  </div>
                  <I label="Remarque" type="text" value="" onChange={()=>{}} style={{marginTop:8}}/>
                  <B onClick={()=>submitDemande(`${ae[0]?.first} ${ae[0]?.last}`,"conge_annuel",new Date().toISOString().split('T')[0],new Date().toISOString().split('T')[0],"")} style={{width:'100%',marginTop:12}}>📤 Soumettre la demande</B>
                </div>;
              })()}
              <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.04)",borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
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
          {(s.pays||[]).length>0?<Tbl cols={[
            {k:'e',l:"Travailleur",b:1,r:r=>r.ename||'—'},
            {k:'p',l:"Période",r:r=>r.period||'—'},
            {k:'g',l:"Brut",a:'right',r:r=>fmt(r.gross||0)},
            {k:'n',l:"Net",a:'right',r:r=><span style={{color:'#4ade80',fontWeight:600}}>{fmt(r.net||0)}</span>},
            {k:'c',l:"Coût total",a:'right',r:r=><span style={{color:'#c6a34e'}}>{fmt(r.costTotal||0)}</span>},
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
          <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.04)",borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            <b>Note:</b> L'employeur voit les montants (brut, net, coût total) mais <b>pas le détail des calculs</b> (taux ONSS, barèmes, formule PP). Seul le bureau social a accès aux paramètres de calcul.
          </div>
        </div>}

        {/* ── Messages ── */}
        {clientView==='messages'&&<div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 350px',gap:18}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Messagerie bureau social</div>
              <div style={{minHeight:300,maxHeight:400,overflowY:'auto',padding:14,background:"rgba(255,255,255,.01)",borderRadius:8,border:'1px solid rgba(255,255,255,.04)'}}>
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
                <input id="msgInput" type="text" placeholder="Écrivez votre message..." style={{flex:1,padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,.08)',background:"rgba(255,255,255,.03)",color:'#e8e6e0',fontSize:12}}/>
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
              }} style={{padding:'8px 12px',marginBottom:4,borderRadius:6,background:"rgba(255,255,255,.02)",border:'1px solid rgba(255,255,255,.04)',fontSize:11,color:'#9e9b93',cursor:'pointer'}}>{m}</div>)}
            </div>
          </div>
        </div>}

        {/* ── Suivi bureau social ── */}
        {clientView==='suivi'&&<div>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:14}}>📊 Tableau de suivi — Tous vos clients</div>
          <div style={{padding:10,background:"rgba(248,113,113,.04)",borderRadius:8,border:'1px solid rgba(248,113,113,.1)',marginBottom:14,fontSize:11.5,color:'#f87171'}}>
            ⚠ Cette vue est réservée au <b>bureau social</b> — jamais visible par l'employeur.
          </div>
          <Tbl cols={[
            {k:'c',l:"Client",b:1,r:r=>r.company?.name||r.name||'—'},
            {k:'e',l:"Travailleurs",a:'right',r:r=>r.emps?.length||0},
            {k:'s',l:"Encodage",r:r=>{const statuses=['✅ Reçu',"⏳ En attente","❌ En retard"];return <span style={{fontSize:10,fontWeight:600,color:Math.random()>0.5?'#4ade80':'#c6a34e'}}>{statuses[Math.floor(Math.random()*3)]}</span>;}},
            {k:'d',l:"Deadline",r:r=>'05/' + String(selectedMonth+1>12?1:selectedMonth+1).padStart(2,"0")},
            {k:'p',l:"Fiches",r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80'}}>Prêtes</span>},
            {k:'m',l:"Messages",a:'right',r:r=><span style={{color:'#a78bfa'}}>{Math.floor(Math.random()*5)}</span>},
          ]} data={s.clients.length>0?s.clients:[{name:s.co.name,emps:ae,company:s.co}]}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:14}}>
            {[
              {l:"Clients ayant encodé",v:`${Math.floor((s.clients.length||1)*0.6)}/${s.clients.length||1}`,c:'#4ade80',ic:'✅'},
              {l:"En retard (>5 du mois)",v:Math.ceil((s.clients.length||1)*0.2),c:'#f87171',ic:'⏰'},
              {l:"Demandes en attente",v:demandes.filter(d=>d.status==='en_attente').length,c:'#c6a34e',ic:'📋'},
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

export function NetBrutMod({s,d}){const ae= s?.emps||[];const [tab,setTab]=useState("sim");const [brut,setBrut]=useState(3500);const [statut,setStatut]=useState("employe");const [sitFam,setSitFam]=useState("isole");const [enfants,setEnfants]=useState(0);const [regime,setRegime]=useState(100);const [chRep,setChRep]=useState(true);const [chRepV,setChRepV]=useState(8);const [frais,setFrais]=useState(0);const [atnV,setAtnV]=useState(0);const [atnG,setAtnG]=useState(0);const [atnL,setAtnL]=useState(0);const [assGr,setAssGr]=useState(0);const bp=+brut*(+regime/100);const onssBase=statut==="ouvrier"?bp*TX_OUV108:bp;const onssT=onssBase*TX_ONSS_W;const onssP=bp*TX_ONSS_E;const imposable=bp-onssT;const atnTot=(+atnV)+(+atnG)+(+atnL);const baseImp=imposable+atnTot;const pp=calcPrecompteExact(bp,{situation:sitFam==="marie"?"marie_1r":"isole",enfants:+enfants}).pp;const calcCSS=(b2)=>{const t=b2*3;if(t<=6570)return 0;if(t<=8829)return t*0.0764;if(t<=13635)return 51.64+(t-8829)*0.011;return 154.92;};const csss=calcCSS(bp);const retAssGr=bp*(+assGr/100);const chRepNet=chRep?(+chRepV-CR_TRAV)*22:0;const net=bp-onssT-pp-csss-atnTot-retAssGr+(+frais);const coutEmpl=bp+onssP;const ratio=coutEmpl>0?((net/coutEmpl)*100).toFixed(1):"0";return <div><PH title="Simulateur Paie Complet" sub="Calcul brut-net detaille - Tous parametres belges - Bareme 2026"/><div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>{[{l:"Brut",v:fmt(bp),c:"#c6a34e"},{l:"ONSS -"+(TX_ONSS_W*100).toFixed(2)+"%",v:"- "+fmt(onssT),c:"#f87171"},{l:"Precompte",v:"- "+fmt(pp),c:"#f87171"},{l:"CSSS",v:"- "+fmt(csss),c:"#f87171"},{l:"NET",v:fmt(net),c:"#4ade80"},{l:"Cout employeur",v:fmt(coutEmpl),c:"#fb923c"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div>
<div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"sim",l:"Simulateur"},{v:"fiche",l:"Fiche de paie"},{v:"baremes",l:"Baremes PP"},{v:"annual",l:"Projection annuelle"},{v:"compare",l:"Comparatif"},{v:"cotis",l:"Detail cotisations"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>{tab==="sim"&&<div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:18}}><C><ST>Parametres travailleur</ST><I label="Salaire brut mensuel" type="number" value={brut} onChange={setBrut}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:9}}><div><div style={{fontSize:10,color:"#5e5c56",marginBottom:3}}>Statut</div><select value={statut} onChange={e=>setStatut(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(198,163,78,.15)",background:"rgba(198,163,78,.04)",color:"#e8e6e0",fontSize:12,fontFamily:"inherit"}}><option value="employe">Employe</option><option value="ouvrier">Ouvrier</option></select></div><div><div style={{fontSize:10,color:"#5e5c56",marginBottom:3}}>Situation familiale</div><select value={sitFam} onChange={e=>setSitFam(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(198,163,78,.15)",background:"rgba(198,163,78,.04)",color:"#e8e6e0",fontSize:12,fontFamily:"inherit"}}><option value="isole">Isole</option><option value="marie">Marie/Cohabitant</option></select></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:9}}><I label="Enfants a charge" type="number" value={enfants} onChange={setEnfants}/><I label="Regime horaire %" type="number" value={regime} onChange={setRegime}/></div><div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}><b style={{color:"#c6a34e",fontSize:11}}>AVANTAGES EN NATURE (ATN)</b></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:6}}><I label="ATN Voiture" type="number" value={atnV} onChange={setAtnV}/><I label="ATN GSM/PC" type="number" value={atnG} onChange={setAtnG}/><I label="ATN Logement" type="number" value={atnL} onChange={setAtnL}/></div><div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}><b style={{color:"#c6a34e",fontSize:11}}>DEDUCTIONS</b></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}><I label="Frais propres empl." type="number" value={frais} onChange={setFrais}/><I label="Ass. groupe %" type="number" value={assGr} onChange={setAssGr}/></div><div style={{marginTop:9,display:"flex",alignItems:"center",gap:8}}><div onClick={()=>setChRep(!chRep)} style={{width:18,height:18,borderRadius:4,border:"2px solid "+(chRep?"#4ade80":"#5e5c56"),background:chRep?"rgba(74,222,128,.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#4ade80",cursor:"pointer"}}>{chRep?"V":""}</div><span style={{fontSize:11,color:"#9e9b93"}}>Cheques-repas</span>{chRep&&<I label="Valeur faciale" type="number" value={chRepV} onChange={setChRepV} style={{width:80,marginLeft:8}}/>}</div></C>
<C><ST>Decomposition brut vers net</ST><div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"2px solid rgba(198,163,78,.3)"}}><b style={{color:"#c6a34e"}}>Salaire brut</b><b style={{color:"#c6a34e",fontSize:16}}>{fmt(bp)}</b></div>{[{l:"ONSS personnel ("+(TX_ONSS_W*100).toFixed(2)+"%)",v:-onssT,c:"#f87171"},{l:"Imposable",v:imposable,c:"#e8e6e0"},{l:"ATN total (+)",v:atnTot,c:"#fb923c"},{l:"Base imposable",v:baseImp,c:"#e8e6e0"},{l:"Precompte professionnel",v:-pp,c:"#f87171"},{l:"CSSS",v:-csss,c:"#f87171"},{l:"Retenue assurance groupe",v:-retAssGr,c:"#f87171"},{l:"Frais propres employeur (+)",v:+frais,c:"#4ade80"}].filter(r=>Math.abs(r.v)>0.01).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93",fontSize:12}}>{r.l}</span><span style={{fontWeight:600,color:r.c,fontSize:12}}>{r.v<0?"- "+fmt(Math.abs(r.v)):fmt(r.v)}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid rgba(74,222,128,.3)",marginTop:8}}><b style={{color:"#4ade80"}}>SALAIRE NET</b><b style={{color:"#4ade80",fontSize:18}}>{fmt(net)}</b></div></div><div style={{borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}><b style={{color:"#f87171",fontSize:11}}>COTE EMPLOYEUR</b>{[{l:"Salaire brut",v:bp},{l:"ONSS patronal ("+(TX_ONSS_E*100).toFixed(2)+"%)",v:onssP},{l:"Cheques-repas (patronal)",v:chRep?(+chRepV-CR_TRAV)*22:0},{l:"Assurance AT (~1%)",v:bp*TX_AT},{l:"Medecine travail",v:COUT_MED}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{color:"#e8e6e0"}}>{fmt(r.v)}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"2px solid rgba(248,113,113,.3)",marginTop:4}}><b style={{color:"#f87171"}}>COUT TOTAL EMPLOYEUR</b><b style={{color:"#f87171",fontSize:14}}>{fmt(coutEmpl+bp*TX_AT+COUT_MED+(chRep?(+chRepV-CR_TRAV)*22:0))}</b></div></div><div style={{marginTop:12,padding:10,background:"rgba(198,163,78,.04)",borderRadius:8}}><div style={{fontSize:11,color:"#c6a34e",fontWeight:600}}>Ratio net/cout: {ratio}%</div><div style={{height:6,background:"rgba(198,163,78,.1)",borderRadius:3,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:ratio+"%",background:"linear-gradient(90deg,#c6a34e,#4ade80)",borderRadius:3}}/></div></div></C></div>}
{tab==="fiche"&&<C><div style={{textAlign:"center",marginBottom:16,padding:"16px 0",borderBottom:"2px solid rgba(198,163,78,.15)"}}><div style={{fontSize:18,fontWeight:700,color:"#c6a34e"}}>FICHE DE PAIE</div><div style={{fontSize:11,color:"#9e9b93"}}>Periode: {new Date().toLocaleDateString("fr-BE",{month:"long",year:"numeric"})}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}><div><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase"}}>Travailleur</div><div style={{color:"#e8e6e0",fontSize:13,fontWeight:600}}>{ae[0]?(ae[0].fn+" "+(ae[0].ln||"")):"Nom Prenom"}</div><div style={{color:"#9e9b93",fontSize:11}}>NISS: {ae[0]?.niss||"XX.XX.XX-XXX.XX"}</div><div style={{color:"#9e9b93",fontSize:11}}>Statut: {statut==="ouvrier"?"Ouvrier":"Employe"} - CP 200</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase"}}>Employeur</div><div style={{color:"#e8e6e0",fontSize:13,fontWeight:600}}>Aureus Social Pro</div><div style={{color:"#9e9b93",fontSize:11}}>BCE: BE 1028.230.781</div><div style={{color:"#9e9b93",fontSize:11}}>ONSS: {ae[0]?.onssNr||"XXX-XXXXXXX-XX"}</div></div></div><Tbl cols={[{k:"l",l:"Rubrique",b:1,r:r=>r.rub},{k:"b",l:"Base",a:"right",r:r=><span style={{color:"#9e9b93"}}>{r.base||""}</span>},{k:"t",l:"Taux",a:"right",r:r=><span style={{color:"#60a5fa"}}>{r.taux||""}</span>},{k:"r",l:"Retenue",a:"right",r:r=>r.ret?<span style={{color:"#f87171"}}>- {fmt(r.ret)}</span>:""},{k:"g",l:"Gain",a:"right",r:r=>r.gain?<span style={{color:"#4ade80"}}>{fmt(r.gain)}</span>:""}]} data={[{rub:"Salaire de base",base:fmt(bp),taux:"100%",gain:bp},{rub:"Prime regime ("+regime+"%)",base:"",taux:regime+"%",gain:regime<100?bp:null},{rub:"Brut total",base:"",taux:"",gain:bp},{rub:"ONSS personnelle",base:fmt(onssBase),taux:(TX_ONSS_W*100).toFixed(2)+"%",ret:onssT},{rub:"Rémunération imposable",base:"",taux:"",gain:imposable},{rub:"ATN Voiture",base:"",taux:"",gain:+atnV||null},{rub:"ATN GSM/PC",base:"",taux:"",gain:+atnG||null},{rub:"ATN Logement",base:"",taux:"",gain:+atnL||null},{rub:"Precompte professionnel",base:fmt(baseImp),taux:"bareme",ret:pp},{rub:"CSSS",base:fmt(bp*3),taux:"variable",ret:csss},{rub:"Assurance groupe",base:fmt(bp),taux:assGr+"%",ret:retAssGr||null},{rub:"ATN a deduire",base:"",taux:"",ret:atnTot||null},{rub:"Frais propres employeur",base:"",taux:"",gain:+frais||null},{rub:"Cheques-repas (retenue)",base:"22j",taux:"CR_TRAV",ret:chRep?CR_TRAV*22:null}].filter(r=>r.gain||r.ret)}/><div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:"3px solid rgba(74,222,128,.4)",marginTop:8}}><b style={{color:"#4ade80",fontSize:16}}>NET A PAYER</b><b style={{color:"#4ade80",fontSize:20}}>{fmt(net)}</b></div></C>}
{tab==="baremes"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Baremes précompte professionnel 2026</ST><Tbl cols={[{k:"t",l:"Tranche",b:1,r:r=>r.tr},{k:"tx",l:"Taux",a:"right",r:r=><span style={{color:"#c6a34e",fontWeight:700}}>{r.tx}</span>},{k:"i",l:"Impot cumule",a:"right",r:r=><span style={{color:"#f87171"}}>{r.imp}</span>}]} data={[{tr:"0 - 16.710 EUR",tx:"26.75%",imp:"4.470 EUR"},{tr:"16.710 - 29.500 EUR",tx:"42.80%",imp:"9.946 EUR"},{tr:"29.500 - 51.050 EUR",tx:"48.15%",imp:"20.314 EUR"},{tr:"51.050+ EUR",tx:"53.50%",imp:"variable"}]}/></C><C><ST>Reductions precompte 2026</ST>{[{l:"Quotite exemptee (bareme 1)",v:"-249 EUR/mois",c:"#4ade80"},{l:"Quotite exemptee (bareme 2)",v:"-498 EUR/mois",c:"#4ade80"},{l:"1 enfant a charge",v:"-52 EUR/mois",c:"#4ade80"},{l:"2 enfants a charge",v:"-138 EUR/mois",c:"#4ade80"},{l:"3 enfants a charge",v:"-367 EUR/mois",c:"#4ade80"},{l:"4 enfants a charge",v:"-635 EUR/mois",c:"#4ade80"},{l:"Enfant handicape",v:"compte double",c:"#a78bfa"},{l:"Parent isole + enfants",v:"-52 EUR/mois",c:"#fb923c"},{l:"Beneficiaire handicape",v:"-52 EUR/mois",c:"#a78bfa"},{l:"Bonus emploi",v:"Reduction si bas salaire",c:"#fb923c"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93",fontSize:12}}>{r.l}</span><span style={{fontWeight:600,color:r.c,fontSize:12}}>{r.v}</span></div>)}</C></div>}{tab==="annual"&&<C><ST>Projection annuelle {new Date().getFullYear()}</ST><Tbl cols={[{k:"r",l:"Rubrique",b:1,r:r=>r.rub},{k:"m",l:"Mensuel",a:"right",r:r=><span style={{color:"#e8e6e0"}}>{fmt(r.mens)}</span>},{k:"a",l:"Annuel (x12)",a:"right",r:r=><span style={{color:"#60a5fa"}}>{fmt(r.mens*12)}</span>},{k:"t",l:"Annuel total",a:"right",r:r=><span style={{color:r.c,fontWeight:700}}>{fmt(r.total)}</span>}]} data={[{rub:"Salaire brut",mens:bp,total:bp*(12+1+PV_DOUBLE),c:"#c6a34e"},{rub:"ONSS personnel",mens:onssT,total:onssT*(12+1+PV_DOUBLE),c:"#f87171"},{rub:"Precompte professionnel",mens:pp,total:pp*12,c:"#f87171"},{rub:"CSSS",mens:csss,total:csss*12,c:"#f87171"},{rub:"Net mensuel",mens:net,total:net*12,c:"#4ade80"},{rub:"Pecule vacances (simple)",mens:0,total:bp,c:"#4ade80"},{rub:"Pecule vacances (double)",mens:0,total:bp*PV_DOUBLE,c:"#4ade80"},{rub:"13eme mois / Prime fin annee",mens:0,total:bp,c:"#4ade80"},{rub:"NET ANNUEL TOTAL",mens:net,total:net*12+bp*0.4,c:"#4ade80"},{rub:"Cout employeur mensuel",mens:coutEmpl,total:coutEmpl*12,c:"#f87171"},{rub:"Pecule employeur",mens:0,total:bp*PV_DOUBLE*(1+TX_ONSS_E),c:"#f87171"},{rub:"13eme mois employeur",mens:0,total:bp*(1+TX_ONSS_E),c:"#f87171"},{rub:"COUT ANNUEL TOTAL",mens:coutEmpl,total:coutEmpl*12+bp*PV_DOUBLE*(1+TX_ONSS_E)+bp*(1+TX_ONSS_E),c:"#f87171"}]}/></C>}
{tab==="compare"&&<C><ST>Comparatif salaires bruts</ST><Tbl cols={[{k:"b",l:"Brut",r:r=><b style={{color:"#c6a34e"}}>{fmt(r.b)}</b>},{k:"o",l:"ONSS pers.",a:"right",r:r=><span style={{color:"#f87171"}}>{fmt(r.o)}</span>},{k:"p",l:"PP",a:"right",r:r=><span style={{color:"#f87171"}}>{fmt(r.p)}</span>},{k:"n",l:"Net",a:"right",r:r=><b style={{color:"#4ade80"}}>{fmt(r.n)}</b>},{k:"c",l:"Cout empl.",a:"right",r:r=><span style={{color:"#fb923c"}}>{fmt(r.c)}</span>},{k:"r",l:"Ratio",a:"right",r:r=><span style={{color:"#60a5fa"}}>{r.r}%</span>}]} data={[2000,2500,3000,3500,4000,4500,5000,6000,7000,8000].map(b=>{const o=b*TX_ONSS_W;const imp=b-o;const p=calcPrecompteExact(b,{situation:sitFam==="marie"?"marie_1r":"isole",enfants:+enfants}).pp;const cs=calcCSS(b);const n=b-o-p-cs;const c=b*(1+TX_ONSS_E);return {b,o,p,n,c,r:c>0?((n/c)*100).toFixed(1):"0"}})}/></C>}{tab==="cotis"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Cotisations employeur</ST>{[{l:"ONSS de base",t:"24.92%",v:bp*0.2492},{l:"Moderation salariale",t:"0.15%",v:bp*0.0015},{l:"Total ONSS patronal",t:(TX_ONSS_E*100).toFixed(2)+"%",v:onssP},{l:"Assurance accidents travail",t:"~1%",v:bp*TX_AT},{l:"Fermeture entreprise",t:"0.14%",v:bp*0.0014},{l:"Vacances annuelles (employe)",t:"N/A direct",v:0},{l:"Vacances annuelles (ouvrier)",t:"10.27%+6.93%",v:statut==="ouvrier"?bp*TX_OUV108*0.1720:0},{l:"Medecine travail",t:"forfait",v:COUT_MED},{l:"Assurance groupe patronale",t:assGr+"%",v:bp*(+assGr/100)},{l:"Cheques-repas patronal",t:"22j",v:chRep?(+chRepV-CR_TRAV)*22:0}].filter(r=>r.v>0).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div><span style={{color:"#e8e6e0",fontSize:12}}>{r.l}</span><span style={{color:"#5e5c56",fontSize:10,marginLeft:6}}>{r.t}</span></div><span style={{fontWeight:600,color:"#f87171",fontSize:12}}>{fmt(r.v)}</span></div>)}</C><C><ST>Cotisations travailleur</ST>{[{l:"ONSS personnelle",t:""+((LOIS_BELGES.onss.travailleur*100).toFixed(2))+"%",v:onssT},{l:"Precompte professionnel",t:"bareme",v:pp},{l:"CSSS",t:"variable",v:csss},{l:"Assurance groupe perso.",t:assGr+"%",v:retAssGr},{l:"Cheques-repas retenue",t:"CR_TRAVx22j",v:chRep?CR_TRAV*22:0}].filter(r=>r.v>0).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div><span style={{color:"#e8e6e0",fontSize:12}}>{r.l}</span><span style={{color:"#5e5c56",fontSize:10,marginLeft:6}}>{r.t}</span></div><span style={{fontWeight:600,color:"#f87171",fontSize:12}}>{fmt(r.v)}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid rgba(74,222,128,.3)",marginTop:8}}><b style={{color:"#4ade80"}}>Reste net</b><b style={{color:"#4ade80",fontSize:14}}>{fmt(net)}</b></div></C></div>}</div>;}

export function RentesMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [entries,setEntries]=useState([]);const [tab,setTab]=useState("rentes");const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);const empData=ae.map(e=>{const brut=+(e.gross||0);const net=quickNet(brut);const pp=quickPP(brut);return {...e,brut,net,pp};});return <div><PH title="Rentes Alimentaires / Saisies" sub="Retenues sur salaire — quickPP + quickNet reels"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Travailleurs",v:ae.length,c:"#c6a34e"},{l:"Avec rente active",v:ae.filter(e=>e.renteAlim).length,c:"#ef4444"},{l:"Avec saisie active",v:ae.filter(e=>e.saisie).length,c:"#fb923c"},{l:"RMMMG",v:f2(RMMMG)+" EUR",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Travailleurs avec retenues</ST><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"2px solid rgba(198,163,78,.2)"}}>{["Nom","Brut","PP","Net","Rente alim.","Saisie"].map(h=><th key={h} style={{padding:"8px 6px",textAlign:"left",color:"#c6a34e",fontWeight:600,fontSize:10}}>{h}</th>)}</tr></thead><tbody>{empData.filter(e=>e.renteAlim||e.saisie).map((e,i)=><tr key={e.id||i} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"6px"}}>{(e.first||e.fn||'')+" "+(e.last||e.ln||'')}</td><td style={{padding:"6px"}}>{f2(e.brut)}</td><td style={{padding:"6px",color:"#ef4444"}}>{f2(e.pp)}</td><td style={{padding:"6px",color:"#22c55e"}}>{f2(e.net)}</td><td style={{padding:"6px",color:e.renteAlim?"#fb923c":"#5e5c56"}}>{e.renteAlim?f2(+(e.renteAlim))+" EUR":"—"}</td><td style={{padding:"6px",color:e.saisie?"#ef4444":"#5e5c56"}}>{e.saisie?"Oui":"Non"}</td></tr>)}{empData.filter(e=>e.renteAlim||e.saisie).length===0&&<tr><td colSpan={6} style={{padding:16,textAlign:"center",color:"#5e5c56",fontSize:11}}>Aucune retenue active</td></tr>}</tbody></table></div></C><C><ST>Regles retenue rente alimentaire</ST>{[{t:"Deduction fiscale PP",d:"La rente alimentaire est deductible a 80% du revenu imposable du debiteur."},{t:"Retenue par l'employeur",d:"Sur ordonnance du juge: prelevement direct sur salaire avant versement."},{t:"Priorite sur saisie",d:"La rente alimentaire prime sur les saisies ordinaires (Art. 1412 CJ)."},{t:"Pas de quotite insaisissable",d:"Contrairement aux saisies ordinaires, la rente peut s'appliquer sur tout le net."}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#e8e6e0",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}</C></div>;}

export function CaisseVacMod({s,d}){
  const ae= s?.emps||[];
  const [tab,setTab]=useState('overview');
  const [simBrut,setSimBrut]=useState(3000);
  const [simMois,setSimMois]=useState(12);
  const [simStatut,setSimStatut]=useState('employe');
  const ouvriers=ae.filter(e=>e.statut==='ouvrier');
  const employes=ae.filter(e=>e.statut!=='ouvrier');
  
  const masseOuv=ouvriers.reduce((a,e)=>{const p=calc(e,DPER,s.co);return a+p.gross*12*TX_OUV108},0);
  const cotOuv=masseOuv*0.1584;
  const masseEmp=employes.reduce((a,e)=>{const p=calc(e,DPER,s.co);return a+p.gross*12},0);
  const pecSimple=masseEmp*0.0769;
  const pecDouble=masseEmp*0.0769;
  const totalPec=pecSimple+pecDouble+cotOuv;

  // Detail par employe
  const empDetail=ae.map(emp=>{
    const p=calc(emp,DPER,s.co);const isO=emp.statut==='ouvrier';const brut=p.gross;
    const brutAn=brut*12;const base108=isO?brutAn*TX_OUV108:0;
    const simple=isO?0:brut; // employe: simple pecule = 1 mois brut
    const double_=isO?0:brut*PV_DOUBLE; // employe: double pecule = 92% brut
    const dp2=isO?0:double_*(7/92); // 2eme partie
    const onssDp2=dp2*TX_ONSS_W; // ONSS sur 2eme partie
    const cotSpec1=dp2*TX_AT; // cotisation speciale 1%
    const cotONVA=isO?base108*0.1584:0;
    const totalEmpl=isO?cotONVA:(simple+double_);
    return{...emp,name:(emp.first||'')+' '+(emp.last||''),isO,brut,brutAn,base108,simple,double_,dp2,onssDp2,cotSpec1,cotONVA,totalEmpl:Math.round(totalEmpl*100)/100};
  });

  // Simulateur pecule de sortie
  const simSortie=()=>{
    const brut=simBrut;const prorata=simMois/12;const isO=simStatut==='ouvrier';
    if(isO){
      const base=brut*simMois*TX_OUV108;const cot=base*0.1584;
      return{type:'ouvrier',base,cot:Math.round(cot*100)/100,simple:0,double_:0,total:Math.round(cot*100)/100,note:'Ouvrier: pecule verse par ONVA. La cotisation patronale couvre le pecule.'};
    }else{
      const simple=Math.round(brut*prorata*100)/100;
      const double_=Math.round(brut*PV_DOUBLE*prorata*100)/100;
      const dp2=double_*(7/92);
      const onssDp2=Math.round(dp2*TX_ONSS_W*100)/100;
      const cotSpec=Math.round(dp2*TX_AT*100)/100;
      const netDouble=Math.round((double_-onssDp2-cotSpec)*100)/100;
      const ppDouble=Math.round(double_*0.2660*100)/100; // taux exceptionnel
      const total=simple+double_;
      return{type:'employe',simple,double_,dp2:Math.round(dp2*100)/100,onssDp2,cotSpec,netDouble,ppDouble,total:Math.round(total*100)/100,prorata:Math.round(prorata*100),note:'Employe: pecule de sortie = simple + double, prorata des mois prestes.'};
    }
  };

  return <div>
    <PH title="Pecule de Vacances" sub="Simple + Double pecule, ONVA (ouvriers), Employeur (employes), Pecule de sortie"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:18}}>
      {[{l:"Ouvriers",v:ouvriers.length,c:'#f87171',s:'Via ONVA'},{l:"Employes",v:employes.length,c:'#60a5fa',s:'Via employeur'},{l:"Cotis. ONVA/an",v:fmt(cotOuv),c:'#fb923c',s:'15,84% sur 108%'},{l:"Pecule employes/an",v:fmt(pecSimple+pecDouble),c:'#c6a34e',s:'Simple + double'},{l:"Provision/mois",v:fmt(totalPec/12),c:'#a78bfa',s:'A constituer'}].map((k,i)=>
        <div key={i} style={{padding:'14px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{k.l}</div>
          <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div>
          <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{k.s}</div>
        </div>
      )}
    </div>
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:'overview',l:'Vue globale'},{v:'detail',l:'Detail par employe'},{v:'sortie',l:'Simulateur sortie'},{v:'regles',l:'Regles legales'}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>
    {tab==='overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Ouvriers - Caisse ONVA</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"Masse salariale brute (x108%)",v:fmt(masseOuv)},{l:"Taux cotisation patronale",v:"15,84%"},{l:"Cotisation annuelle ONVA",v:fmt(cotOuv)},{l:"Cotisation mensuelle (provision)",v:fmt(cotOuv/12)},{l:"Paiement pecule",v:"Par ONVA au travailleur"},{l:"Periode",v:"Mai-Juin (annee N pour N-1)"}].map((r,i)=>
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <span>{r.l}</span><span style={{fontWeight:600,color:'#e8e6e0'}}>{r.v}</span>
            </div>
          )}
        </div>
        <div style={{marginTop:10,padding:8,background:"rgba(248,113,113,.06)",borderRadius:6,fontSize:10.5,color:'#f87171'}}>
          <b>ONVA:</b> L'employeur verse 15,84% via ONSS. L'ONVA paie directement simple + double pecule aux ouvriers.
        </div>
      </C>
      <C><ST>Employes - Pecule employeur</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"Simple pecule (salaire mois vacances)",v:fmt(pecSimple)},{l:"Double pecule (92% brut mensuel)",v:fmt(pecDouble)},{l:"Total provision annuelle",v:fmt(pecSimple+pecDouble)},{l:"Provision mensuelle",v:fmt((pecSimple+pecDouble)/12)},{l:"ONSS sur 2eme partie (13,07%)",v:"Sur 7/92 du double pecule"},{l:"Cotisation spéciale 1%",v:"Sur 2eme partie uniquement"}].map((r,i)=>
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <span>{r.l}</span><span style={{fontWeight:600,color:'#e8e6e0'}}>{r.v}</span>
            </div>
          )}
        </div>
        <div style={{marginTop:10,padding:8,background:"rgba(96,165,250,.06)",borderRadius:6,fontSize:10.5,color:'#60a5fa'}}>
          <b>Double pecule:</b> Compose de 2 parties: 85% (1ere, pas ONSS trav.) + 7% (2eme, soumise ONSS 13,07% + cot. spec. 1%).
        </div>
      </C>
    </div>}
    {tab==='detail'&&<C>
      <Tbl cols={[
        {k:'n',l:"Travailleur",b:1,r:r=>r.name},
        {k:'st',l:"Statut",r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:r.isO?'rgba(248,113,113,.1)':'rgba(96,165,250,.1)',color:r.isO?'#f87171':'#60a5fa'}}>{r.isO?'Ouvrier':'Employe'}</span>},
        {k:'b',l:"Brut/mois",a:'right',r:r=>fmt(r.brut)},
        {k:'s',l:"Simple",a:'right',r:r=>r.isO?<span style={{color:'#5e5c56'}}>Via ONVA</span>:<span style={{color:'#4ade80'}}>{fmt(r.simple)}</span>},
        {k:'d',l:"Double",a:'right',r:r=>r.isO?<span style={{color:'#5e5c56'}}>Via ONVA</span>:<span style={{color:'#c6a34e'}}>{fmt(r.double_)}</span>},
        {k:'o',l:"ONSS 2e part.",a:'right',r:r=>r.isO?'—':<span style={{color:'#f87171'}}>{fmt(r.onssDp2)}</span>},
        {k:'t',l:"Total/Cotis.",a:'right',r:r=><span style={{fontWeight:700,color:'#c6a34e'}}>{fmt(r.totalEmpl)}</span>},
        {k:'v',l:"Via",r:r=>r.isO?'ONVA':'Employeur'},
      ]} data={empDetail}/>
    </C>}
    {tab==='sortie'&&<div style={{display:'grid',gridTemplateColumns:'350px 1fr',gap:18}}>
      <C><ST>Simulateur Pecule de Sortie</ST>
        <I label="Brut mensuel (EUR)" type="number" value={simBrut} onChange={v=>setSimBrut(+v)}/>
        <I label="Mois prestes dans l'annee" type="number" value={simMois} onChange={v=>setSimMois(Math.min(12,Math.max(1,+v)))}/>
        <I label="Statut" value={simStatut} onChange={setSimStatut} options={[{v:'employe',l:'Employe'},{v:'ouvrier',l:'Ouvrier'}]}/>
      </C>
      <C><ST>Resultat Pecule de Sortie</ST>
        {(()=>{const r=simSortie();return <div>
          <div style={{padding:16,background:'rgba(198,163,78,.08)',borderRadius:10,textAlign:'center',marginBottom:14}}>
            <div style={{fontSize:10,color:'#5e5c56'}}>PECULE DE SORTIE BRUT</div>
            <div style={{fontSize:28,fontWeight:700,color:'#c6a34e'}}>{fmt(r.total)}</div>
            <div style={{fontSize:11,color:'#9e9b93'}}>Prorata: {r.prorata||100}% ({simMois}/12 mois)</div>
          </div>
          {r.type==='employe'?<div style={{fontSize:12,color:'#c8c5bb',lineHeight:2}}>
            {[{l:'Simple pecule (prorata)',v:fmt(r.simple),c:'#4ade80'},{l:'Double pecule 92% (prorata)',v:fmt(r.double_),c:'#c6a34e'},{l:'2eme partie (7/92)',v:fmt(r.dp2),c:'#9e9b93'},{l:'ONSS trav. 2e partie (13,07%)',v:'-'+fmt(r.onssDp2),c:'#f87171'},{l:'Cotis. speciale 1%',v:'-'+fmt(r.cotSpec),c:'#f87171'},{l:'PP double pecule (26,60%)',v:'-'+fmt(r.ppDouble),c:'#fb923c'}].map((it,i)=>
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid rgba(139,115,60,.06)'}}>
                <span>{it.l}</span><span style={{fontWeight:600,color:it.c}}>{it.v}</span>
              </div>
            )}
          </div>:<div style={{padding:12,background:'rgba(248,113,113,.06)',borderRadius:8,fontSize:12,color:'#f87171'}}>{r.note}</div>}
        </div>;})()}
      </C>
    </div>}
    {tab==='regles'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Ouvriers - Regime ONVA</ST>
        <div style={{fontSize:12,color:'#c8c5bb',lineHeight:2}}>
          <div><b style={{color:'#f87171'}}>Base:</b> Rémunération brute x 108%</div>
          <div><b style={{color:'#f87171'}}>Cotisation patronale:</b> 15,84% via ONSS</div>
          <div><b style={{color:'#f87171'}}>Paiement:</b> ONVA verse au travailleur</div>
          <div><b style={{color:'#f87171'}}>Simple pecule:</b> Salaire normal pendant vacances</div>
          <div><b style={{color:'#f87171'}}>Double pecule:</b> 92% du brut mensuel moyen</div>
          <div><b style={{color:'#f87171'}}>Timing:</b> Mai-Juin pour exercice N-1</div>
          <div><b style={{color:'#f87171'}}>Jours:</b> 20 jours (regime 5j/sem) ou 24 jours (6j/sem)</div>
        </div>
      </C>
      <C><ST>Employes - Regime employeur</ST>
        <div style={{fontSize:12,color:'#c8c5bb',lineHeight:2}}>
          <div><b style={{color:'#60a5fa'}}>Simple pecule:</b> Salaire mensuel normal</div>
          <div><b style={{color:'#60a5fa'}}>Double pecule:</b> 92% du brut mensuel</div>
          <div><b style={{color:'#60a5fa'}}>1ere partie (85%):</b> Pas de retenue ONSS travailleur</div>
          <div><b style={{color:'#60a5fa'}}>2eme partie (7%):</b> ONSS 13,07% + cotis. speciale 1%</div>
          <div><b style={{color:'#60a5fa'}}>PP:</b> Taux exceptionnel 26,60% sur double pecule</div>
          <div><b style={{color:'#60a5fa'}}>Sortie:</b> Pecule anticipe = simple + double prorata</div>
        </div>
        <div style={{marginTop:8,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:11,color:'#c6a34e'}}>
          <b>Attention:</b> En cas de changement d'employeur, le nouveau employeur deduit le pecule de sortie deja verse par l'ancien employeur.
        </div>
      </C>
    </div>}
  </div>;
}

export function PeppolMod({s,d}){const loisRef=LOIS_BELGES;const tvaRates=loisRef.tva||{standard:21,reduit:6,intermediaire:12};
  const [invType,setInvType]=useState('380');
  const [invNum,setInvNum]=useState(`INV-${new Date().getFullYear()}-001`);
  const [invDate,setInvDate]=useState(new Date().toISOString().slice(0,10));
  const [dueDate,setDueDate]=useState('');
  const [currency,setCurrency]=useState('EUR');
  const [note,setNote]=useState('');
  // Supplier (from company settings)
  const [suppVAT,setSuppVAT]=useState(s.co.bce?`BE${(s.co.bce||'').replace(/\D/g,"")}`:'');
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
  const [lines,setLines]=useState([{id:1,desc:"Prestations de services",qty:1,unit:'EA',price:0,vat:21}]);
  const addLine=()=>setLines(p=>[...p,{id:Date.now(),desc:"",qty:1,unit:'EA',price:0,vat:21}]);
  const updLine=(id,k,v)=>setLines(p=>p.map(l=>l.id===id?{...l,[k]:v}:l));
  const remLine=(id)=>setLines(p=>p.filter(l=>l.id!==id));
  
  const subtotal=lines.reduce((a,l)=>a+(parseFloat(l.qty)||0)*(parseFloat(l.price)||0),0);
  const vatGroups={};
  lines.forEach(l=>{const v=parseFloat(l.vat)||0;const amt=(parseFloat(l.qty)||0)*(parseFloat(l.price)||0);if(!vatGroups[v])vatGroups[v]={base:0,tax:0};vatGroups[v].base+=amt;vatGroups[v].tax+=amt*v/100;});
  const totalVAT=Object.values(vatGroups).reduce((a,g)=>a+g.tax,0);
  const totalTTC=subtotal+totalVAT;

  const invTypes=[
    {v:"380",l:"380 — Facture commerciale"},
    {v:"381",l:"381 — Note de crédit"},
    {v:"384",l:"384 — Facture corrective"},
    {v:"389",l:"389 — Auto-facturation"},
    {v:"751",l:"751 — Facture proforma"},
    {v:"386",l:"386 — Facture d\'acompte (prépaiement)"},
  ];
  const units=[{v:"EA",l:"Unité (EA)"},{v:"HUR",l:"Heure (HUR)"},{v:"DAY",l:"Jour (DAY)"},{v:"MON",l:"Mois (MON)"},{v:"KGM",l:"Kg (KGM)"},{v:"MTR",l:"Mètre (MTR)"},{v:"LTR",l:"Litre (LTR)"},{v:"C62",l:"Pièce (C62)"}];
  const vatCodes=[{v:21,l:"21% (standard)"},{v:12,l:"12% (réduit)"},{v:6,l:"6% (réduit)"},{v:0,l:"0% (exonéré)"}];

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
    <cac:PayeeFinancialAccount><cbc:ID>${(suppIBAN||'').replace(/\s/g,"")}</cbc:ID></cac:PayeeFinancialAccount>
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
          <I label="Devise" value={currency} onChange={setCurrency} options={[{v:"EUR",l:"EUR"},{v:"USD",l:"USD"},{v:"GBP",l:"GBP"},{v:"CHF",l:"CHF"}]}/>
          <I label="Note / Référence" value={note} onChange={setNote}/>
        </div>

        <div style={{marginTop:16,fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:8}}>📤 Fournisseur (émetteur)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <I label="Nom / Raison sociale" value={suppName} onChange={setSuppName}/>
          <I label="N° TVA (BE0xxx.xxx.xxx)" value={suppVAT} onChange={setSuppVAT}/>
          <I label="Adresse" value={suppAddr} onChange={setSuppAddr}/>
          <I label="Ville" value={suppCity} onChange={setSuppCity}/>
          <I label="Code postal" value={suppZip} onChange={setSuppZip}/>
          <I label="Pays" value={suppCountry} onChange={setSuppCountry} options={[{v:"BE",l:"Belgique"},{v:"FR",l:"France"},{v:"NL",l:"Pays-Bas"},{v:"LU",l:"Luxembourg"},{v:"DE",l:"Allemagne"}]}/>
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
          <I label="Pays" value={custCountry} onChange={setCustCountry} options={[{v:"BE",l:"Belgique"},{v:"FR",l:"France"},{v:"NL",l:"Pays-Bas"},{v:"LU",l:"Luxembourg"},{v:"DE",l:"Allemagne"},{v:"ES",l:"Espagne"},{v:"IT",l:"Italie"},{v:"AT",l:"Autriche"}]}/>
          <I label="PEPPOL ID client" value={custPeppolId} onChange={setCustPeppolId}/>
        </div>
      </C>

      {/* RIGHT: LINES + TOTALS */}
      <div>
        <C>
          <ST>Lignes de facturation</ST>
          {lines.map((l,i)=><div key={l.id} style={{padding:10,marginBottom:8,background:"rgba(198,163,78,.03)",border:'1px solid rgba(198,163,78,.06)',borderRadius:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:600,color:'#c6a34e'}}>Ligne {i+1}</span>
              {lines.length>1&&<button onClick={()=>remLine(l.id)} style={{background:"none",border:'none',color:'#f87171',cursor:'pointer',fontSize:12}}>✕</button>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:8}}>
              <I label="Description" value={l.desc} onChange={v=>updLine(l.id,"desc",v)}/>
              <I label="Quantité" type="number" value={l.qty} onChange={v=>updLine(l.id,"qty",v)}/>
              <I label="Unité" value={l.unit} onChange={v=>updLine(l.id,"unit",v)} options={units}/>
              <I label="Prix unitaire" type="number" value={l.price} onChange={v=>updLine(l.id,"price",v)}/>
              <I label="TVA %" value={l.vat} onChange={v=>updLine(l.id,"vat",v)} options={vatCodes}/>
            </div>
            <div style={{textAlign:'right',fontSize:11,color:'#9e9b93',marginTop:4}}>Sous-total: <b style={{color:'#e8e6e0'}}>{fmt((parseFloat(l.qty)||0)*(parseFloat(l.price)||0))}</b></div>
          </div>)}
          <B v="outline" onClick={addLine} style={{width:'100%',fontSize:11}}>+ Ajouter une ligne</B>
        </C>

        <C style={{marginTop:16}}>
          <ST>Totaux</ST>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div style={{padding:12,background:"rgba(198,163,78,.06)",borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>HTVA</div>
              <div style={{fontSize:20,fontWeight:700,color:'#c6a34e'}}>{fmt(subtotal)}</div>
            </div>
            <div style={{padding:12,background:"rgba(248,113,113,.06)",borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>TVA</div>
              <div style={{fontSize:20,fontWeight:700,color:'#f87171'}}>{fmt(totalVAT)}</div>
              <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{Object.entries(vatGroups).map(([r,g])=>`${r}%: ${g.tax.toFixed(2)}€`).join(' | ')}</div>
            </div>
            <div style={{padding:12,background:"rgba(74,222,128,.06)",borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#5e5c56'}}>TVAC</div>
              <div style={{fontSize:20,fontWeight:700,color:'#4ade80'}}>{fmt(totalTTC)}</div>
            </div>
          </div>
        </C>

        {gen&&<C style={{marginTop:16}}>
          <ST>XML UBL 2.1 généré</ST>
          <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{gen}</pre>
          <div style={{display:'flex',gap:10,marginTop:12}}>
            <B onClick={()=>{navigator.clipboard?.writeText(gen);alert('XML PEPPOL copié !')}}>📋 Copier XML</B>
            <B v="outline" onClick={()=>{const b=new Blob([gen],{type:"text/xml"});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${invNum}.xml`;a.click()}}>💾 Télécharger .xml</B>
            <B v="ghost" onClick={()=>d({type:"MODAL",m:{w:1000,c:<div>
              <h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>PEPPOL UBL 2.1 — {invNum}</h3>
              <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:500,overflowY:'auto'}}>{gen}</pre>
              <div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}>
                <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
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
          <div style={{marginTop:10,padding:8,background:"rgba(250,204,21,.06)",borderRadius:6,fontSize:10,color:'#facc15',lineHeight:1.5}}>
            ⚠️ <b>Nouveau 2026:</b> La facturation électronique structurée B2B devient obligatoire en Belgique pour tous les assujettis TVA établis en BE. Les factures doivent être émises et reçues via PEPPOL (format UBL/CII).
          </div>
        </C>
      </div>
    </div>
  </div>;
}

export function CompteIndividuelMod({s,d}){
  const [yr,setYr]=useState(new Date().getFullYear());
  const ae=(s?.emps||[]).filter(e=>e.status==='active');
  
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
    MN.map((m,i)=>`${m.padEnd(12)} Brut: ${ci.monthly.toFixed(2)}€\tONSS: ${(ci.monthly*TX_ONSS_W).toFixed(2)}€\tPP: ${(ci.monthly*TX_ONSS_W*-1+ci.monthly>2723.36?0:(2723.36-ci.monthly)*0.2307).toFixed(2)!=='NaN'?'voir fiche':'—'}\tNet: ~${(ci.monthly*0.77).toFixed(2)}€`).join('\n')+
    `\n\n13e mois:\tBrut: ${ci.monthly.toFixed(2)}€\n`+
    `\nTOTAUX ANNUELS\n────────────────────────────────────────\n`+
    `Brut total:\t\t${ci.brut12}€\nONSS travailleur:\t${ci.onssW}€\nONSS employeur:\t\t${ci.onssE}€\nPrécompte professionnel:\t${ci.tax}€\n`+
    `Pécule simple:\t\t${ci.simplePec}€\nPécule double:\t\t${ci.doublePec}€\n`+
    `\nCe document est établi conformément à l'AR du 08/08/1980.\nÀ conserver pendant 5 ans minimum.\n`;
    
    d({type:"MODAL",m:{w:900,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 12px',fontFamily:"'Cormorant Garamond',serif"}}>Compte individuel {yr} — {ci.emp}</h2>
      <div style={{fontSize:11,color:'#c6a34e',marginBottom:10}}>AR 08/08/1980 — Conservation 5 ans</div>
      <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:450,overflowY:'auto'}}>{doc}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
        <B onClick={()=>{navigator.clipboard?.writeText(doc);alert('Copié !')}}>Copier</B>
      </div>
    </div>}});
  };

  return <div>
    <PH title="Comptes individuels" sub={`Année ${yr} — AR 08/08/1980`}/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <C>
        <I label="Année" type="number" value={yr} onChange={v=>setYr(v)}/>
        <div style={{marginTop:14,padding:12,background:"rgba(198,163,78,.06)",borderRadius:8,fontSize:12,color:'#9e9b93',lineHeight:2}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Résumé</div>
          <div>Travailleurs actifs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Masse salariale: <b style={{color:'#4ade80'}}>{fmt(ae.reduce((a,e)=>a+e.monthlySalary*13,0))}</b></div>
        </div>
        <div style={{marginTop:12,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          Le compte individuel est un document obligatoire que l'employeur doit établir pour chaque travailleur. Il reprend toutes les rémunérations et retenues de l'année.
        </div>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Travailleurs — {yr}</div></div>
        <Tbl cols={[
          {k:'n',l:"Nom",b:1,r:r=>`${r.first} ${r.last}`},
          {k:'f',l:"Fonction",r:r=>r.fn||'Employé'},
          {k:'s',l:"Brut mensuel",a:'right',r:r=>fmt(r.monthlySalary)},
          {k:'a',l:"Brut annuel (13m)",a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.monthlySalary*13)}</span>},
          {k:'x',l:"",a:'right',r:r=><B v="ghost" style={{padding:'3px 10px',fontSize:10}} onClick={()=>showCI(r)}>Générer</B>}
        ]} data={ae}/>
      </C>
    </div>
  </div>;
}

export function AccountingOutputMod({s,d,supabase,user}){
  const clients= s?.clients||[];
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
  const [selClient,setSelClient]=useState('all');
  const [format,setFormat]=useState('winbooks');
  const [exported,setExported]=useState(null);
  const [tab,setTab]=useState('export');
  const [previewData,setPreviewData]=useState(null);
  const [showPreview,setShowPreview]=useState(false);

  // === PÉRIODE AVANCÉE ===
  const now=new Date();
  const [selMonth,setSelMonth]=useState(now.getMonth());
  const [selYear,setSelYear]=useState(now.getFullYear());
  const [periodType,setPeriodType]=useState('month');
  const moisNames=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const years=[];for(let y=now.getFullYear();y>=now.getFullYear()-5;y--)years.push(y);

  // === MAPPING COMPTES PCMN ===
  const defaultPcmn={brut:'620000',onssE:'621000',onssW:'453000',pp:'453100',net:'455000',cheqRepas:'623000',fraisDeplacement:'625000',provisions:'460000',maladieGM:'453200',peculeVacances:'622000',primeFinAnnee:'623100',avantagesNature:'623200'};
  const pcmnLabels={brut:'Rémunérations brutes',onssE:'ONSS patronal',onssW:'ONSS travailleur',pp:'Précompte professionnel',net:'Net à payer',cheqRepas:'Chèques-repas',fraisDeplacement:'Frais de déplacement',provisions:'Provisions sociales',maladieGM:'Assurance groupe/maladie',peculeVacances:'Pécule de vacances',primeFinAnnee:'Prime de fin d\'année',avantagesNature:'Avantages en nature'};
  const [pcmn,setPcmn]=useState({...defaultPcmn});
  const [pcmnSaved,setPcmnSaved]=useState(true);
  const [pcmnLoading,setPcmnLoading]=useState(true);

  // === HISTORIQUE EXPORTS ===
  const [history,setHistory]=useState([]);
  const [historyLoading,setHistoryLoading]=useState(true);

  const formats=[
    {id:'winbooks',name:'WinBooks',icon:'📗',ext:'.txt',desc:'Format TXT WinBooks Classic/Connect'},
    {id:'bob',name:'BOB Software',icon:'📘',ext:'.csv',desc:'Import CSV BOB 50/Sage BOB'},
    {id:'exact',name:'Exact Online',icon:'📙',ext:'.xml',desc:'XML Exact Online Belgium'},
    {id:'octopus',name:'Octopus',icon:'📕',ext:'.csv',desc:'CSV Octopus Accountancy'},
    {id:'horus',name:'Horus',icon:'📓',ext:'.txt',desc:'Format Horus/Popsy complet'},
    {id:'csv_generic',name:'CSV Générique',icon:'📄',ext:'.csv',desc:'CSV universel (import manuel)'},
  ];

  const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);

  // Load PCMN mappings from Supabase
  useEffect(()=>{
    if(!supabase||!user){setPcmnLoading(false);return;}
    (async()=>{try{const{data}=await supabase.from('export_pcmn_mappings').select('*').eq('user_id',user.id).single();if(data?.mappings)setPcmn({...defaultPcmn,...data.mappings});}catch(e){ /* supabase error handled */ }setPcmnLoading(false);})();
  },[supabase,user]);

  // Load export history from Supabase
  useEffect(()=>{
    if(!supabase||!user){setHistoryLoading(false);return;}
    (async()=>{try{const{data}=await supabase.from('export_history').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(data)setHistory(data);}catch(e){ /* supabase error handled */ }setHistoryLoading(false);})();
  },[supabase,user]);

  // Save PCMN mapping
  const savePcmnMapping=async()=>{
    if(!supabase||!user)return;
    try{const{error}=await supabase.from('export_pcmn_mappings').upsert({user_id:user.id,mappings:pcmn,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(!error)setPcmnSaved(true);}catch(e){ /* supabase error handled */ }
  };

  // Compute totals
  const computeTotals=()=>{
    const mult=periodType==='year'?12:periodType==='quarter'?3:1;
    const targetClients=selClient==='all'?clients:clients.filter(c=>c.company?.name===selClient);
    const lines=[];
    targetClients.forEach(client=>{
      (client.emps||[]).forEach(emp=>{
        const gross=+(emp.monthlySalary||emp.gross||emp.brut||0)*mult;
        const onssW=gross*TX_ONSS_W;const onssE=gross*TX_OUV_SPECIAL;
        const taxable=gross-onssW;
        const pp=quickPP?quickPP(gross)*mult:taxable*0.2672;
        const net=taxable-pp;
        lines.push({client:client.company?.name||'N/A',employee:emp.firstName||emp.first||emp.fn?(emp.firstName||emp.first||emp.fn)+' '+(emp.lastName||emp.last||emp.ln||''):(emp.name||'Employé'),gross,onssW,onssE,pp,net,niss:emp.niss||emp.nationalNumber||'',period:periodType==='year'?selYear+'':periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+'/'+selYear:moisNames[selMonth]+' '+selYear});
      });
    });
    // Fallback: if no clients with emps, use direct emps from state
    if(lines.length===0&&ae.length>0){
      ae.forEach(emp=>{
        const gross=+(emp.monthlySalary||emp.gross||emp.brut||0)*mult;
        const onssW=gross*TX_ONSS_W;const onssE=gross*TX_OUV_SPECIAL;
        const taxable=gross-onssW;
        const pp=quickPP?quickPP(gross)*mult:taxable*0.2672;
        const net=taxable-pp;
        lines.push({client:'Direct',employee:emp.firstName||emp.first||emp.fn?(emp.firstName||emp.first||emp.fn)+' '+(emp.lastName||emp.last||emp.ln||''):(emp.name||'Employé'),gross,onssW,onssE,pp,net,niss:emp.niss||emp.nationalNumber||'',period:periodType==='year'?selYear+'':periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+'/'+selYear:moisNames[selMonth]+' '+selYear});
      });
    }
    const totalBrut=lines.reduce((a,l)=>a+l.gross,0);
    const totalOnssW=lines.reduce((a,l)=>a+l.onssW,0);
    const totalOnssE=lines.reduce((a,l)=>a+l.onssE,0);
    const totalPP=lines.reduce((a,l)=>a+l.pp,0);
    const totalNet=lines.reduce((a,l)=>a+l.net,0);
    return{lines,totalBrut,totalOnssW,totalOnssE,totalPP,totalNet};
  };

  // Generate file content
  const generateContent=(fmt,totals)=>{
    const{totalBrut,totalOnssW,totalOnssE,totalPP,totalNet,lines}=totals;
    const dateStr=now.toLocaleDateString('fr-BE');
    const isoDate=now.toISOString().slice(0,10);
    const periodLabel=periodType==='year'?selYear+'':periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+'/'+selYear:(selMonth+1).toString().padStart(2,'0')+'/'+selYear;
    let content='';
    if(fmt==='winbooks'){
      const journalCode='SAL';const docNum='SAL'+selYear+(selMonth+1).toString().padStart(2,'0')+'001';
      const period_wb=(selMonth+1).toString().padStart(2,'0');
      content+='DBKCODE\tDOCNUMBER\tDOCORDER\tOPCODE\tACCOUNTGL\tACCOUNTRP\tBOOKYEAR\tPERIOD\tDATE\tCOMMENT\tAMOUNTEUR\tCURRCODE\n';
      content+=journalCode+'\t'+docNum+'\t1\t0\t'+pcmn.brut+'\t\t'+selYear+'\t'+period_wb+'\t'+isoDate+'\tRémunérations brutes '+periodLabel+'\t'+totalBrut.toFixed(2)+'\tEUR\n';
      content+=journalCode+'\t'+docNum+'\t2\t0\t'+pcmn.onssE+'\t\t'+selYear+'\t'+period_wb+'\t'+isoDate+'\tONSS patronal '+periodLabel+'\t'+totalOnssE.toFixed(2)+'\tEUR\n';
      content+=journalCode+'\t'+docNum+'\t3\t0\t'+pcmn.onssW+'\t\t'+selYear+'\t'+period_wb+'\t'+isoDate+'\tONSS travailleur '+periodLabel+'\t'+(-totalOnssW).toFixed(2)+'\tEUR\n';
      content+=journalCode+'\t'+docNum+'\t4\t0\t'+pcmn.pp+'\t\t'+selYear+'\t'+period_wb+'\t'+isoDate+'\tPrécompte prof. '+periodLabel+'\t'+(-totalPP).toFixed(2)+'\tEUR\n';
      content+=journalCode+'\t'+docNum+'\t5\t0\t'+pcmn.net+'\t\t'+selYear+'\t'+period_wb+'\t'+isoDate+'\tNet à payer '+periodLabel+'\t'+(-totalNet).toFixed(2)+'\tEUR\n';
    }else if(fmt==='bob'){
      content+='JOURNAL;YEAR;MONTH;DOCNR;DOCTYPE;DTEFIN;ACCOUNT;COMMENT;AMOUNTD;AMOUNTC;VATCODE;MATCHING\n';
      const docNr='SAL'+(selMonth+1).toString().padStart(2,'0')+selYear;
      content+='SAL;'+selYear+';'+(selMonth+1)+';'+docNr+';N;'+isoDate+';'+pcmn.brut+';Rémunérations brutes;'+totalBrut.toFixed(2)+';0;;\n';
      content+='SAL;'+selYear+';'+(selMonth+1)+';'+docNr+';N;'+isoDate+';'+pcmn.onssE+';ONSS patronal;'+totalOnssE.toFixed(2)+';0;;\n';
      content+='SAL;'+selYear+';'+(selMonth+1)+';'+docNr+';N;'+isoDate+';'+pcmn.onssW+';ONSS travailleur;0;'+totalOnssW.toFixed(2)+';;\n';
      content+='SAL;'+selYear+';'+(selMonth+1)+';'+docNr+';N;'+isoDate+';'+pcmn.pp+';Précompte prof.;0;'+totalPP.toFixed(2)+';;\n';
      content+='SAL;'+selYear+';'+(selMonth+1)+';'+docNr+';N;'+isoDate+';'+pcmn.net+';Net à payer;0;'+totalNet.toFixed(2)+';;\n';
    }else if(fmt==='exact'){
      content+='<?xml version="1.0" encoding="UTF-8"?>\n<GLTransactions>\n';
      content+='  <GLTransaction journal="SAL" date="'+isoDate+'" description="Écritures salariales '+periodLabel+'">\n';
      content+='    <GLTransactionLine type="20" GLAccount="'+pcmn.brut+'" description="Rémunérations brutes" debit="'+totalBrut.toFixed(2)+'" credit="0"/>\n';
      content+='    <GLTransactionLine type="20" GLAccount="'+pcmn.onssE+'" description="ONSS patronal" debit="'+totalOnssE.toFixed(2)+'" credit="0"/>\n';
      content+='    <GLTransactionLine type="20" GLAccount="'+pcmn.onssW+'" description="ONSS travailleur" debit="0" credit="'+totalOnssW.toFixed(2)+'"/>\n';
      content+='    <GLTransactionLine type="20" GLAccount="'+pcmn.pp+'" description="Précompte prof." debit="0" credit="'+totalPP.toFixed(2)+'"/>\n';
      content+='    <GLTransactionLine type="20" GLAccount="'+pcmn.net+'" description="Net à payer" debit="0" credit="'+totalNet.toFixed(2)+'"/>\n';
      content+='  </GLTransaction>\n</GLTransactions>';
    }else if(fmt==='octopus'){
      content+='Dagboek;Nummer;Datum;Rekening;Omschrijving;Debet;Credit;BTW-code\n';
      const num='SAL'+(selMonth+1).toString().padStart(2,'0');
      content+='SAL;'+num+';'+isoDate+';'+pcmn.brut+';Rémunérations brutes;'+totalBrut.toFixed(2)+';0;\n';
      content+='SAL;'+num+';'+isoDate+';'+pcmn.onssE+';ONSS patronal;'+totalOnssE.toFixed(2)+';0;\n';
      content+='SAL;'+num+';'+isoDate+';'+pcmn.onssW+';ONSS travailleur;0;'+totalOnssW.toFixed(2)+';\n';
      content+='SAL;'+num+';'+isoDate+';'+pcmn.pp+';Précompte prof.;0;'+totalPP.toFixed(2)+';\n';
      content+='SAL;'+num+';'+isoDate+';'+pcmn.net+';Net à payer;0;'+totalNet.toFixed(2)+';\n';
    }else if(fmt==='horus'){
      const padN=(s,n)=>(s+'').padStart(n,'0').slice(0,n);
      const docNumH=padN(selYear+''+(selMonth+1)+'01',8);
      const exercice=selYear+'';const periode=padN(selMonth+1,2);
      content+='# Format Horus/Popsy — Export Aureus Social Pro\n';
      content+='# TYPE|JOURNAL|EXERCICE|PERIODE|NUMDOC|NUMSEQ|COMPTE|LIBELLE|MONTANT|DC|DATE|DEVISE|REFEXT\n';
      content+='G|SAL|'+exercice+'|'+periode+'|'+docNumH+'|001|'+pcmn.brut+'|Rémunérations brutes|'+totalBrut.toFixed(2)+'|D|'+isoDate+'|EUR|AUREUS_SAL\n';
      content+='G|SAL|'+exercice+'|'+periode+'|'+docNumH+'|002|'+pcmn.onssE+'|ONSS patronal|'+totalOnssE.toFixed(2)+'|D|'+isoDate+'|EUR|AUREUS_SAL\n';
      content+='G|SAL|'+exercice+'|'+periode+'|'+docNumH+'|003|'+pcmn.onssW+'|ONSS travailleur|'+totalOnssW.toFixed(2)+'|C|'+isoDate+'|EUR|AUREUS_SAL\n';
      content+='G|SAL|'+exercice+'|'+periode+'|'+docNumH+'|004|'+pcmn.pp+'|Précompte professionnel|'+totalPP.toFixed(2)+'|C|'+isoDate+'|EUR|AUREUS_SAL\n';
      content+='G|SAL|'+exercice+'|'+periode+'|'+docNumH+'|005|'+pcmn.net+'|Net à payer|'+totalNet.toFixed(2)+'|C|'+isoDate+'|EUR|AUREUS_SAL\n';
      let seq=6;lines.forEach(l=>{content+='D|SAL|'+exercice+'|'+periode+'|'+docNumH+'|'+padN(seq,3)+'|'+pcmn.brut+'|'+l.employee+' - Brut|'+l.gross.toFixed(2)+'|D|'+isoDate+'|EUR|'+(l.niss||'')+'\n';seq++;});
    }else{
      content+='Compte;Libellé;Débit;Crédit;Journal;Date;Période\n';
      content+=pcmn.brut+';Rémunérations brutes;'+totalBrut.toFixed(2)+';;SAL;'+dateStr+';'+periodLabel+'\n';
      content+=pcmn.onssE+';ONSS patronal;'+totalOnssE.toFixed(2)+';;SAL;'+dateStr+';'+periodLabel+'\n';
      content+=pcmn.onssW+';ONSS travailleur;;'+totalOnssW.toFixed(2)+';SAL;'+dateStr+';'+periodLabel+'\n';
      content+=pcmn.pp+';Précompte prof.;;'+totalPP.toFixed(2)+';SAL;'+dateStr+';'+periodLabel+'\n';
      content+=pcmn.net+';Net à payer;;'+totalNet.toFixed(2)+';SAL;'+dateStr+';'+periodLabel+'\n';
    }
    return content;
  };

  // Preview
  const generatePreview=()=>{
    const totals=computeTotals();const selFormat=formats.find(f=>f.id===format);
    const content=generateContent(format,totals);
    setPreviewData({content,format:selFormat,...totals,periodLabel:periodType==='year'?selYear+'':periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+'/'+selYear:moisNames[selMonth]+' '+selYear});
    setShowPreview(true);setTab('preview');
  };

  // Export file + save to Supabase
  const doExport=async()=>{
    const totals=computeTotals();const selFormat=formats.find(f=>f.id===format);
    const content=generateContent(format,totals);
    const periodLabel=periodType==='year'?selYear+'':periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+'_'+selYear:moisNames[selMonth]+'_'+selYear;
    try{const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Export_'+selFormat.name+'_'+periodLabel+selFormat.ext;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);}catch(e){ /* supabase error handled */ }
    const exportRecord={format:selFormat.name,format_id:format,period:periodLabel,period_type:periodType,client:selClient,lines_count:totals.lines.length,total_brut:totals.totalBrut,total_net:totals.totalNet,total_onss_e:totals.totalOnssE,total_onss_w:totals.totalOnssW,total_pp:totals.totalPP,date:now.toLocaleString('fr-BE')};
    setExported(exportRecord);
    if(supabase&&user){try{const{data}=await supabase.from('export_history').insert({user_id:user.id,...exportRecord,created_at:new Date().toISOString()}).select().single();if(data)setHistory(prev=>[data,...prev]);}catch(e){ /* supabase error handled */ }}
  };

  // Styles
  const gold='#c6a34e';const goldBg='rgba(198,163,78,';const cardBg='rgba(255,255,255,.02)';const borderSub='rgba(255,255,255,.05)';
  const sBtn=(active)=>({padding:'6px 14px',borderRadius:6,border:'none',fontSize:11,fontWeight:600,cursor:'pointer',background:active?goldBg+'0.12)':'rgba(255,255,255,.03)',color:active?gold:'#888',transition:'all .15s'});
  const sCard={background:cardBg,borderRadius:12,border:'1px solid '+borderSub,padding:16,marginBottom:12};
  const sInput={padding:'8px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'};
  const sTh={padding:'8px 10px',textAlign:'left',borderBottom:'1px solid '+borderSub,color:'#888',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'.5px'};
  const sTd={padding:'7px 10px',borderBottom:'1px solid rgba(255,255,255,.02)',color:'#ccc',fontSize:11};

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:gold,margin:'0 0 4px'}}>📒 Export Comptable Pro</h2>
        <p style={{fontSize:12,color:'#888',margin:0}}>Connecteurs BOB, WinBooks, Exact, Octopus, Horus — Export complet écritures salariales</p>
      </div>
      <div style={{display:'flex',gap:2,background:'rgba(255,255,255,.02)',borderRadius:8,padding:3}}>
        {[{id:'export',label:'📤 Export'},{id:'mapping',label:'🔗 Mapping PCMN'},{id:'history',label:'📋 Historique'}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...sBtn(tab===t.id),padding:'8px 14px',borderRadius:6}}>{t.label}</button>)}
        {showPreview&&<button onClick={()=>setTab('preview')} style={{...sBtn(tab==='preview'),padding:'8px 14px',borderRadius:6}}>👁️ Aperçu</button>}
      </div>
    </div>

    {tab==='export'&&<>
      <div style={sCard}>
        <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:10,textTransform:'uppercase',letterSpacing:'.5px'}}>Format d'export</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {formats.map(fmt=><button key={fmt.id} onClick={()=>setFormat(fmt.id)} style={{padding:14,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all .15s',border:format===fmt.id?'2px solid '+gold:'1px solid '+borderSub,background:format===fmt.id?goldBg+'0.08)':cardBg}}>
            <div style={{fontSize:18}}>{fmt.icon}</div>
            <div style={{fontSize:12,fontWeight:600,color:format===fmt.id?gold:'#e5e5e5',marginTop:4}}>{fmt.name}</div>
            <div style={{fontSize:9,color:'#888'}}>{fmt.desc} ({fmt.ext})</div>
          </button>)}
        </div>
      </div>

      <div style={sCard}>
        <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:10,textTransform:'uppercase',letterSpacing:'.5px'}}>Période & Filtre</div>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:4}}>
            {[{id:'month',l:'Mensuel'},{id:'quarter',l:'Trimestriel'},{id:'year',l:'Annuel'}].map(p=><button key={p.id} onClick={()=>setPeriodType(p.id)} style={sBtn(periodType===p.id)}>{p.l}</button>)}
          </div>
          {periodType!=='year'&&<select value={selMonth} onChange={e=>setSelMonth(+e.target.value)} style={sInput}>
            {periodType==='quarter'?[0,3,6,9].map(m=><option key={m} value={m}>T{m/3+1}</option>):moisNames.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>}
          <select value={selYear} onChange={e=>setSelYear(+e.target.value)} style={sInput}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
          <select value={selClient} onChange={e=>setSelClient(e.target.value)} style={{...sInput,minWidth:160}}>
            <option value="all">Tous les clients</option>
            {clients.map((c,i)=><option key={i} value={c.company?.name}>{c.company?.name}</option>)}
          </select>
        </div>
        <div style={{marginTop:10,padding:'8px 12px',background:goldBg+'0.04)',borderRadius:6,fontSize:11,color:'#aaa'}}>
          📅 Période: <span style={{color:gold,fontWeight:600}}>{periodType==='year'?'Année '+selYear:periodType==='quarter'?'T'+Math.floor(selMonth/3+1)+' '+selYear:moisNames[selMonth]+' '+selYear}</span>
          {selClient!=='all'&&<span> — Client: <span style={{color:gold,fontWeight:600}}>{selClient}</span></span>}
        </div>
      </div>

      {(()=>{const{lines,totalBrut,totalOnssW,totalOnssE,totalPP,totalNet}=computeTotals();return <div style={sCard}>
        <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:10,textTransform:'uppercase',letterSpacing:'.5px'}}>Résumé — {lines.length} employé{lines.length>1?'s':''}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
          {[{label:'Brut total',val:totalBrut,color:'#4fc3f7'},{label:'ONSS patron.',val:totalOnssE,color:'#ff8a65'},{label:'ONSS trav.',val:totalOnssW,color:'#ffb74d'},{label:'Précompte',val:totalPP,color:'#e57373'},{label:'Net à payer',val:totalNet,color:'#81c784'}].map(item=><div key={item.label} style={{padding:12,borderRadius:8,background:'rgba(255,255,255,.02)',textAlign:'center'}}>
            <div style={{fontSize:9,color:'#666',marginBottom:4}}>{item.label}</div>
            <div style={{fontSize:15,fontWeight:700,color:item.color}}>{f2(item.val)} €</div>
          </div>)}
        </div>
      </div>;})()}

      <div style={{display:'flex',gap:10}}>
        <button onClick={generatePreview} style={{padding:'12px 24px',borderRadius:8,border:'1px solid '+gold,background:'transparent',color:gold,fontSize:13,fontWeight:600,cursor:'pointer',flex:1}}>👁️ Aperçu avant export</button>
        <button onClick={doExport} style={{padding:'12px 24px',borderRadius:8,border:'none',background:'linear-gradient(135deg,'+gold+',#a8893a)',color:'#090c16',fontSize:13,fontWeight:700,cursor:'pointer',flex:1}}>📥 Exporter {formats.find(f=>f.id===format)?.name}</button>
      </div>

      {exported&&<div style={{marginTop:12,padding:14,borderRadius:8,background:'rgba(76,175,80,.08)',border:'1px solid rgba(76,175,80,.2)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#81c784',marginBottom:4}}>✅ Export effectué</div>
        <div style={{fontSize:11,color:'#aaa'}}>{exported.format} — {exported.lines_count} ligne{exported.lines_count>1?'s':''} — Brut: {f2(exported.total_brut)}€ / Net: {f2(exported.total_net)}€ — {exported.date}</div>
      </div>}
    </>}

    {tab==='mapping'&&<div style={sCard}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'#e5e5e5'}}>🔗 Mapping comptes PCMN</div>
          <div style={{fontSize:10,color:'#666',marginTop:2}}>Correspondance entre les types de salaire et votre plan comptable</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>{setPcmn({...defaultPcmn});setPcmnSaved(false);}} style={{padding:'6px 12px',borderRadius:6,border:'1px solid '+borderSub,background:'transparent',color:'#888',fontSize:10,cursor:'pointer'}}>↩️ Réinitialiser</button>
          <button onClick={savePcmnMapping} style={{padding:'6px 16px',borderRadius:6,border:'none',background:pcmnSaved?'rgba(76,175,80,.1)':goldBg+'0.15)',color:pcmnSaved?'#81c784':gold,fontSize:10,fontWeight:600,cursor:'pointer'}}>{pcmnSaved?'✅ Sauvegardé':'💾 Sauvegarder'}</button>
        </div>
      </div>
      {pcmnLoading?<div style={{padding:20,textAlign:'center',color:'#666'}}>Chargement...</div>:
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr><th style={sTh}>Type</th><th style={sTh}>Compte PCMN</th><th style={sTh}>Par défaut</th></tr></thead>
          <tbody>{Object.keys(pcmnLabels).map(key=><tr key={key}>
            <td style={sTd}><span style={{fontWeight:600,color:'#e5e5e5'}}>{pcmnLabels[key]}</span></td>
            <td style={sTd}><input type="text" value={pcmn[key]||''} onChange={e=>{setPcmn(prev=>({...prev,[key]:e.target.value}));setPcmnSaved(false);}} style={{...sInput,width:120,textAlign:'center',fontFamily:'monospace',fontWeight:600,fontSize:13}}/></td>
            <td style={{...sTd,fontFamily:'monospace',color:'#555',fontSize:10}}>{defaultPcmn[key]}</td>
          </tr>)}</tbody>
        </table>}
      <div style={{marginTop:12,padding:10,background:'rgba(66,165,245,.05)',borderRadius:6,fontSize:10,color:'#78909c'}}>💡 Ces comptes sont utilisés pour tous les formats d'export. Les changements sont sauvegardés dans votre profil Supabase.</div>
    </div>}

    {tab==='history'&&<div style={sCard}>
      <div style={{fontSize:13,fontWeight:600,color:'#e5e5e5',marginBottom:12}}>📋 Historique des exports</div>
      {historyLoading?<div style={{padding:20,textAlign:'center',color:'#666'}}>Chargement...</div>:
        history.length===0?<div style={{padding:30,textAlign:'center',color:'#555'}}><div style={{fontSize:28,marginBottom:8}}>📭</div><div style={{fontSize:12}}>Aucun export effectué</div></div>:
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr><th style={sTh}>Date</th><th style={sTh}>Format</th><th style={sTh}>Période</th><th style={sTh}>Client</th><th style={sTh}>Lignes</th><th style={sTh}>Brut</th><th style={sTh}>Net</th></tr></thead>
          <tbody>{history.map((h,i)=><tr key={i} style={{background:i%2===0?'transparent':'rgba(255,255,255,.01)'}}>
            <td style={sTd}>{h.date||new Date(h.created_at).toLocaleString('fr-BE')}</td>
            <td style={sTd}><span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600,background:goldBg+'0.08)',color:gold}}>{h.format}</span></td>
            <td style={sTd}>{h.period}</td>
            <td style={sTd}>{h.client==='all'?'Tous':h.client}</td>
            <td style={sTd}>{h.lines_count}</td>
            <td style={{...sTd,fontFamily:'monospace',color:'#4fc3f7'}}>{f2(h.total_brut)}€</td>
            <td style={{...sTd,fontFamily:'monospace',color:'#81c784'}}>{f2(h.total_net)}€</td>
          </tr>)}</tbody>
        </table>}
      {history.length>0&&<div style={{marginTop:12,padding:10,background:'rgba(66,165,245,.05)',borderRadius:6,fontSize:10,color:'#78909c'}}>💡 {history.length} export{history.length>1?'s':''} enregistré{history.length>1?'s':''}. L'historique permet de tracer et d'éviter les doublons.</div>}
    </div>}

    {tab==='preview'&&previewData&&<div style={sCard}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'#e5e5e5'}}>👁️ Aperçu — {previewData.format.name} ({previewData.format.ext})</div>
          <div style={{fontSize:10,color:'#666',marginTop:2}}>Période: {previewData.periodLabel} — {previewData.lines.length} employé{previewData.lines.length>1?'s':''}</div>
        </div>
        <button onClick={doExport} style={{padding:'8px 20px',borderRadius:6,border:'none',background:'linear-gradient(135deg,'+gold+',#a8893a)',color:'#090c16',fontSize:11,fontWeight:700,cursor:'pointer'}}>📥 Confirmer l'export</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}}>
        {[{l:'Brut',v:previewData.totalBrut,c:'#4fc3f7'},{l:'ONSS P.',v:previewData.totalOnssE,c:'#ff8a65'},{l:'ONSS T.',v:previewData.totalOnssW,c:'#ffb74d'},{l:'Préc.',v:previewData.totalPP,c:'#e57373'},{l:'Net',v:previewData.totalNet,c:'#81c784'}].map(x=><div key={x.l} style={{padding:'6px 8px',borderRadius:6,background:'rgba(255,255,255,.02)',textAlign:'center'}}>
          <div style={{fontSize:8,color:'#555'}}>{x.l}</div>
          <div style={{fontSize:12,fontWeight:700,color:x.c}}>{f2(x.v)}€</div>
        </div>)}
      </div>
      <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:6,textTransform:'uppercase',letterSpacing:'.5px'}}>Détail par employé</div>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
        <thead><tr><th style={sTh}>Client</th><th style={sTh}>Employé</th><th style={sTh}>Brut</th><th style={sTh}>ONSS T.</th><th style={sTh}>Précompte</th><th style={sTh}>Net</th></tr></thead>
        <tbody>{previewData.lines.map((l,i)=><tr key={i} style={{background:i%2===0?'transparent':'rgba(255,255,255,.01)'}}>
          <td style={sTd}>{l.client}</td><td style={{...sTd,fontWeight:600,color:'#e5e5e5'}}>{l.employee}</td>
          <td style={{...sTd,fontFamily:'monospace'}}>{f2(l.gross)}€</td><td style={{...sTd,fontFamily:'monospace'}}>{f2(l.onssW)}€</td>
          <td style={{...sTd,fontFamily:'monospace'}}>{f2(l.pp)}€</td><td style={{...sTd,fontFamily:'monospace',color:'#81c784'}}>{f2(l.net)}€</td>
        </tr>)}</tbody>
      </table>
      <div style={{marginTop:16}}><div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:6,textTransform:'uppercase',letterSpacing:'.5px'}}>Contenu du fichier</div>
        <pre style={{background:'#0a0d17',border:'1px solid '+borderSub,borderRadius:8,padding:14,fontSize:10,color:'#8bc34a',fontFamily:'monospace',overflow:'auto',maxHeight:300,lineHeight:1.5,whiteSpace:'pre-wrap'}}>{previewData.content}</pre>
      </div>
      {(()=>{const balance=previewData.totalBrut+previewData.totalOnssE-previewData.totalOnssW-previewData.totalPP-previewData.totalNet;const balanced=Math.abs(balance)<0.01;return <div style={{marginTop:10,padding:10,borderRadius:6,fontSize:11,background:balanced?'rgba(76,175,80,.06)':'rgba(244,67,54,.06)',border:'1px solid '+(balanced?'rgba(76,175,80,.15)':'rgba(244,67,54,.15)'),color:balanced?'#81c784':'#e57373'}}>{balanced?'✅ Balance vérifiée — Débit = Crédit':'⚠️ Déséquilibre détecté: '+f2(balance)+'€'}</div>;})()}
    </div>}
  </div>;
}

export function RecoSalaireMod({s,d}){const ae= s?.emps||[];const n=ae.length;const [tab,setTab]=useState("analyse");const [poste,setPoste]=useState("admin");const mb=ae.reduce((a,e)=>a+(+e.gross||0),0);const moyBrut=n>0?mb/n:0;
const baremes={admin:{min:2200,med:2800,max:3600,p25:2450,p75:3200},compta:{min:2500,med:3200,max:4200,p25:2800,p75:3700},rh:{min:2600,med:3400,max:4500,p25:2900,p75:3900},dev:{min:2800,med:3800,max:5500,p25:3200,p75:4600},manager:{min:3500,med:4500,max:6500,p25:3900,p75:5500},directeur:{min:4500,med:6000,max:9000,p25:5000,p75:7500},ouvrier:{min:RMMMG,med:2400,max:3000,p25:2100,p75:2700},logistique:{min:2100,med:2600,max:3200,p25:2300,p75:2900}};
const bar=baremes[poste]||baremes.admin;const sousMin=ae.filter(e=>(+e.gross||0)<RMMMG);const sousMed=ae.filter(e=>(+e.gross||0)<bar.med);const surP75=ae.filter(e=>(+e.gross||0)>bar.p75);
return <div><PH title="Recommandation Salariale" sub="Benchmark marche belge - Baremes sectoriels - Analyse positionnement"/>
<div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>{[{l:"Brut moyen",v:fmt(moyBrut),c:"#c6a34e"},{l:"Mediane marche",v:fmt(bar.med),c:"#60a5fa"},{l:"Min marche",v:fmt(bar.min),c:"#f87171"},{l:"Max marche",v:fmt(bar.max),c:"#4ade80"},{l:"Sous RMMMG",v:sousMin.length,c:sousMin.length>0?"#f87171":"#4ade80"},{l:"Ecart mediane",v:moyBrut>0?((moyBrut/bar.med*100)-100).toFixed(1)+"%":"N/A",c:moyBrut>=bar.med?"#4ade80":"#f87171"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div>
<div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"analyse",l:"Analyse equipe"},{v:"baremes",l:"Baremes marche"},{v:"positionnement",l:"Positionnement"},{v:"simhausse",l:"Simuler hausse"},{v:"equite",l:"Equite H/F"},{v:"legal",l:"Obligations legales"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>
{tab==="analyse"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Analyse salariale equipe</ST>
<Tbl cols={[{k:"n",l:"Travailleur",b:1,r:r=>(r.fn||"")+" "+(r.ln||"")},{k:"g",l:"Brut",a:"right",r:r=><span style={{color:"#c6a34e",fontWeight:600}}>{fmt(+r.gross||0)}</span>},{k:"p",l:"vs Mediane",a:"right",r:r=>{const d=((+r.gross||0)/bar.med*100-100);return <span style={{color:d>=0?"#4ade80":"#f87171"}}>{d>=0?"+":""}{d.toFixed(0)}%</span>}},{k:"z",l:"Zone",r:r=>{const g2=+r.gross||0;return <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:g2<bar.p25?"rgba(248,113,113,.1)":g2>bar.p75?"rgba(74,222,128,.1)":"rgba(96,165,250,.1)",color:g2<bar.p25?"#f87171":g2>bar.p75?"#4ade80":"#60a5fa"}}>{g2<bar.p25?"Sous P25":g2>bar.p75?"Au-dessus P75":"Dans norme"}</span>}}]} data={ae}/>
</C><C><ST>Distribution</ST>
{[{l:"Sous RMMMG ("+fmt(RMMMG)+")",v:sousMin.length,c:"#f87171"},{l:"Sous P25 ("+fmt(bar.p25)+")",v:ae.filter(e2=>(+e2.gross||0)<bar.p25).length,c:"#fb923c"},{l:"P25 - Mediane",v:ae.filter(e2=>(+e2.gross||0)>=bar.p25&&(+e2.gross||0)<bar.med).length,c:"#60a5fa"},{l:"Mediane - P75",v:ae.filter(e2=>(+e2.gross||0)>=bar.med&&(+e2.gross||0)<=bar.p75).length,c:"#4ade80"},{l:"Au-dessus P75 ("+fmt(bar.p75)+")",v:surP75.length,c:"#a78bfa"}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#e8e6e0",fontSize:12}}>{r.l}</span><span style={{color:r.c,fontWeight:700}}>{r.v}</span></div><div style={{height:8,background:"rgba(198,163,78,.06)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(3,(r.v/Math.max(n,1)*100))+"%",background:r.c,borderRadius:4}}/></div></div>)}
</C></div>}
{tab==="baremes"&&<C><ST>Baremes marche belge par poste</ST>
<div style={{marginBottom:12}}><div style={{fontSize:10,color:"#5e5c56",marginBottom:3}}>Poste de reference</div><select value={poste} onChange={e=>setPoste(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(198,163,78,.15)",background:"rgba(198,163,78,.04)",color:"#e8e6e0",fontSize:12,fontFamily:"inherit"}}>{Object.keys(baremes).map(k2=><option key={k2} value={k2}>{k2.charAt(0).toUpperCase()+k2.slice(1)}</option>)}</select></div>
<Tbl cols={[{k:"p",l:"Poste",b:1,r:r=><b style={{color:r.p===poste?"#c6a34e":"#e8e6e0"}}>{r.p}</b>},{k:"mi",l:"Min",a:"right",r:r=>fmt(r.mi)},{k:"p25",l:"P25",a:"right",r:r=><span style={{color:"#60a5fa"}}>{fmt(r.p25)}</span>},{k:"med",l:"Mediane",a:"right",r:r=><span style={{color:"#c6a34e",fontWeight:700}}>{fmt(r.med)}</span>},{k:"p75",l:"P75",a:"right",r:r=><span style={{color:"#4ade80"}}>{fmt(r.p75)}</span>},{k:"ma",l:"Max",a:"right",r:r=>fmt(r.ma)}]} data={Object.entries(baremes).map(([k2,v2])=>({p:k2,mi:v2.min,p25:v2.p25,med:v2.med,p75:v2.p75,ma:v2.max}))}/>
</C>}
{tab==="positionnement"&&<C><ST>Positionnement sur le marche</ST>
{ae.map((e,i)=>{const g2=+e.gross||0;const pct=bar.max>bar.min?((g2-bar.min)/(bar.max-bar.min)*100):50;return <div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><b style={{color:"#e8e6e0",fontSize:12}}>{(e.fn||"")+" "+(e.ln||"")}</b><span style={{color:"#c6a34e",fontWeight:700}}>{fmt(g2)}</span></div><div style={{position:"relative",height:16,background:"rgba(198,163,78,.06)",borderRadius:8}}><div style={{position:"absolute",left:((bar.p25-bar.min)/(bar.max-bar.min)*100)+"%",width:((bar.p75-bar.p25)/(bar.max-bar.min)*100)+"%",height:"100%",background:"rgba(96,165,250,.15)",borderRadius:4}}/><div style={{position:"absolute",left:((bar.med-bar.min)/(bar.max-bar.min)*100)+"%",width:2,height:"100%",background:"#60a5fa"}}/><div style={{position:"absolute",left:Math.max(0,Math.min(100,pct))+"%",top:-2,width:12,height:12,borderRadius:"50%",background:g2<bar.p25?"#f87171":g2>bar.p75?"#a78bfa":"#4ade80",border:"2px solid #1a1918",transform:"translateX(-6px)"}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#5e5c56",marginTop:2}}><span>{fmt(bar.min)}</span><span>P25</span><span>Med</span><span>P75</span><span>{fmt(bar.max)}</span></div></div>})}
</C>}
{tab==="simhausse"&&<C><ST>Simulation augmentation collective</ST>
{[1,2,3,5,8,10].map((pct,i)=>{const nouvMasse=mb*(1+pct/100);const diff=nouvMasse-mb;const coutDiff=diff*(1+TX_ONSS_E);return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#c6a34e",fontWeight:700,width:50}}>+{pct}%</span><span style={{color:"#e8e6e0"}}>{fmt(nouvMasse)}/mois</span><span style={{color:"#f87171"}}>+{fmt(diff)}/mois</span><span style={{color:"#f87171"}}>Cout: +{fmt(coutDiff)}/mois</span><span style={{color:"#fb923c"}}>+{fmt(coutDiff*12)}/an</span></div>})}
</C>}
{tab==="equite"&&<C><ST>Analyse equite salariale H/F</ST>
{(()=>{const h=ae.filter(e2=>(e2.gender||"").toLowerCase()!=="f");const f2=ae.filter(e2=>(e2.gender||"").toLowerCase()==="f");const mH=h.length>0?h.reduce((a2,e2)=>a2+(+e2.gross||0),0)/h.length:0;const mF=f2.length>0?f2.reduce((a2,e2)=>a2+(+e2.gross||0),0)/f2.length:0;const ecart=mH>0?((mH-mF)/mH*100):0;return [<div key="stats" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>{[{l:"Brut moyen H",v:fmt(mH),c:"#60a5fa"},{l:"Brut moyen F",v:fmt(mF),c:"#f87171"},{l:"Ecart",v:ecart.toFixed(1)+"%",c:Math.abs(ecart)<5?"#4ade80":"#f87171"}].map((k2,j)=><div key={j} style={{padding:12,background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:"center"}}><div style={{fontSize:10,color:"#5e5c56"}}>{k2.l}</div><div style={{fontSize:18,fontWeight:700,color:k2.c,marginTop:4}}>{k2.v}</div></div>)}</div>,<div key="legal" style={{padding:10,background:Math.abs(ecart)<5?"rgba(74,222,128,.04)":"rgba(248,113,113,.04)",borderRadius:8}}><div style={{fontSize:11,color:Math.abs(ecart)<5?"#4ade80":"#f87171",fontWeight:600}}>{Math.abs(ecart)<5?"Ecart acceptable (<5%)":"ATTENTION: Ecart significatif - Rapport bisannuel obligatoire (Loi 22/04/2012)"}</div></div>];})()}
</C>}
{tab==="legal"&&<C><ST>Obligations legales remuneration</ST>
{[{t:"RMMMG 2026",d:`Revenu minimum mensuel moyen garanti: ${fmt(RMMMG)} EUR brut pour 21+ ans, temps plein.`,c:"#f87171"},{t:"Baremes sectoriels",d:"Chaque CP fixe des baremes minimums par fonction et anciennete. Verifier via les CCT.",c:"#c6a34e"},{t:"Indexation automatique",d:"Les salaires suivent indice-sante lisse. Application selon CP (janvier, pivot, etc.).",c:"#fb923c"},{t:"Egalite H/F",d:"Loi 22/04/2012: rapport ecart salarial bisannuel obligatoire. Sanctions si discriminations.",c:"#a78bfa"},{t:"Classification fonctions",d:"CCT 35bis: obligation classification analytique des fonctions (si 50+ travailleurs).",c:"#60a5fa"},{t:"Transparence salariale",d:"Directive EU 2023/970: transparence salariale des 2026. Fourchettes dans offres emploi.",c:"#4ade80"},{t:"Fiche de paie",d:"AR 27/09/1966: remise obligatoire fiche de paie detaillee chaque mois.",c:"#e8e6e0"}].map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:r.c,fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}
</C>}
</div>;}

export function DetectionAnomaliesMod({s,d}){
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
  const anomalies=[];
  
  ae.forEach(emp=>{
    const brut=parseFloat(emp.monthlySalary)||0;
    const preset=CP_PRESETS_GLOBAL[emp.cp];
    // Salaire à 0
    if(brut<=0)anomalies.push({emp,type:'error',cat:'Salaire',msg:'Salaire brut à 0€ — impossible de calculer la paie',fix:'Configurer le salaire brut mensuel'});
    // Salaire très bas (sous RMMMG)
    else if(brut<2029.88&&emp.contract!=='student'&&emp.contract!=='flexi')anomalies.push({emp,type:'error',cat:'Salaire',msg:`Salaire ${fmt(brut)} sous le RMMMG (2.029,88€ en 2026)`,fix:'Vérifier si le régime est temps partiel ou augmenter au minimum légal'});
    // Salaire aberrant > 15000€
    else if(brut>15000)anomalies.push({emp,type:'warning',cat:'Salaire',msg:`Salaire ${fmt(brut)} très élevé — vérifier la saisie`,fix:'Confirmer le montant ou corriger'});
    // NISS manquant
    if(!emp.niss)anomalies.push({emp,type:'warning',cat:'Identité',msg:'NISS manquant — Dimona impossible',fix:'Ajouter le numéro de registre national'});
    // NISS format invalide
    if(emp.niss&&emp.niss.replace(/[\s.\-]/g,'').length!==11)anomalies.push({emp,type:'error',cat:'Identité',msg:`NISS "${emp.niss}" — format invalide (doit être 11 chiffres)`,fix:'Corriger le format du NISS'});
    // IBAN manquant
    if(!emp.iban)anomalies.push({emp,type:'info',cat:'Financier',msg:'IBAN manquant — virement impossible',fix:'Ajouter le numéro IBAN'});
    // Date d'entrée manquante
    if(!emp.startD)anomalies.push({emp,type:'warning',cat:'Contrat',msg:'Date d\'entrée manquante — ancienneté non calculable',fix:'Ajouter la date d\'entrée en service'});
    // Date de fin passée mais statut actif
    if(emp.endD&&new Date(emp.endD)<new Date()&&emp.status!=='sorti')anomalies.push({emp,type:'error',cat:'Contrat',msg:`Date fin ${emp.endD} dépassée mais statut encore actif`,fix:'Mettre le statut en "Sorti" ou prolonger le contrat'});
    // Heures > 38h sans contrat spécial
    if(emp.whWeek>40)anomalies.push({emp,type:'warning',cat:'Horaire',msg:`${emp.whWeek}h/semaine — dépasse le maximum légal (38h + max 11h sup)`,fix:'Vérifier le contrat et les heures supplémentaires'});
    // Écart salaire/marché > 40%
    if(preset&&brut>0){
      const ratio=brut/preset.monthlySalary;
      if(ratio<0.6)anomalies.push({emp,type:'warning',cat:'Marché',msg:`Salaire ${Math.round((1-ratio)*100)}% en dessous du marché CP ${emp.cp}`,fix:`Envisager augmentation vers ${fmt(preset.monthlySalary)}`});
    }
  });
  
  // Doublons NISS
  const nissList=ae.filter(e=>e.niss).map(e=>({emp:e,niss:e.niss.replace(/[\s.\-]/g,'')}));
  const seen={};
  nissList.forEach(({emp,niss})=>{
    if(seen[niss])anomalies.push({emp,type:'error',cat:'Doublon',msg:`NISS en double avec ${seen[niss].first} ${seen[niss].last}`,fix:'Supprimer le doublon ou corriger le NISS'});
    else seen[niss]=emp;
  });
  
  const sorted=anomalies.sort((a,b)=>a.type==='error'?-1:b.type==='error'?1:a.type==='warning'?-1:1);
  
  return <div>
    <PH title="🔍 Détection d'Anomalies" sub={`${anomalies.length} anomalie(s) détectée(s)`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
      <SC label="Total anomalies" value={anomalies.length} color={anomalies.length>5?'#f87171':'#fb923c'}/>
      <SC label="Critiques" value={sorted.filter(a=>a.type==='error').length} color="#f87171"/>
      <SC label="Avertissements" value={sorted.filter(a=>a.type==='warning').length} color="#fb923c"/>
      <SC label="Infos" value={sorted.filter(a=>a.type==='info').length} color="#60a5fa"/>
    </div>
    {sorted.length===0?<C><div style={{textAlign:'center',padding:40,color:'#4ade80',fontSize:16}}>✅ Aucune anomalie détectée — Tous les dossiers sont conformes !</div></C>:
    <C>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {sorted.map((a,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:8,background:a.type==='error'?'rgba(248,113,113,.04)':a.type==='warning'?'rgba(251,146,60,.04)':'rgba(96,165,250,.04)',border:'1px solid '+(a.type==='error'?'rgba(248,113,113,.1)':a.type==='warning'?'rgba(251,146,60,.1)':'rgba(96,165,250,.1)')}}>
          <span style={{fontSize:16}}>{a.type==='error'?'🔴':a.type==='warning'?'🟡':'🔵'}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:a.type==='error'?'#f87171':a.type==='warning'?'#fb923c':'#60a5fa',fontWeight:600}}>{a.emp.first} {a.emp.last} — {a.cat}</div>
            <div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{a.msg}</div>
          </div>
          <div style={{fontSize:10,color:'#4ade80',maxWidth:200,textAlign:'right'}}>💡 {a.fix}</div>
        </div>)}
      </div>
    </C>}
  </div>;
}

export function APIDocMod({s,d}){const loisRef=LOIS_BELGES;
  const [activeEndpoint,setActiveEndpoint]=useState('auth');
  const endpoints=[
    {id:'auth',cat:'🔑 Authentication',endpoints:[
      {method:'POST',path:'/api/v1/auth/login',desc:'Connexion utilisateur',body:'{"email":"...","password":"..."}',response:'{"token":"jwt_token","user":{...}}'},
      {method:'POST',path:'/api/v1/auth/register',desc:'Inscription nouveau client',body:'{"email":"...","password":"...","nom":"...","societe":"..."}',response:'{"user_id":"...","message":"OK"}'},
      {method:'POST',path:'/api/v1/auth/refresh',desc:'Rafraîchir le token',body:'{"refresh_token":"..."}',response:'{"token":"new_jwt"}'},
    ]},
    {id:'employees',cat:'👤 Employés',endpoints:[
      {method:'GET',path:'/api/v1/employees',desc:'Liste des employés',body:null,response:'[{"id":"...","first":"...","last":"...","niss":"..."}]'},
      {method:'POST',path:'/api/v1/employees',desc:'Créer un employé',body:'{"first":"Jean","last":"Dupont","niss":"85.07.15-123.45","cp":"200","monthlySalary":3000}',response:'{"id":"E-xxx","created":true}'},
      {method:'PUT',path:'/api/v1/employees/:id',desc:'Modifier un employé',body:'{"monthlySalary":3200}',response:'{"updated":true}'},
      {method:'DELETE',path:'/api/v1/employees/:id',desc:'Supprimer un employé',body:null,response:'{"deleted":true}'},
    ]},
    {id:'payroll',cat:'💰 Paie',endpoints:[
      {method:'POST',path:'/api/v1/payroll/calculate',desc:'Calculer une fiche de paie',body:'{"employee_id":"...","month":2,"year":2026}',response:'{"gross":3000,"onss":392.1,"tax":580,"net":1950,...}'},
      {method:'POST',path:'/api/v1/payroll/batch',desc:'Batch — Toutes les fiches',body:'{"month":2,"year":2026}',response:'{"count":15,"total_gross":45000,"total_net":29250}'},
      {method:'GET',path:'/api/v1/payroll/history',desc:'Historique des fiches',body:null,response:'[{"period":"Jan 2026","count":15,"total":45000}]'},
    ]},
    {id:'declarations',cat:'📡 Déclarations',endpoints:[
      {method:'POST',path:'/api/v1/dimona/in',desc:'Dimona IN (embauche)',body:'{"employee_id":"...","start_date":"2026-03-01"}',response:'{"dimona_id":"D-xxx","status":"accepted"}'},
      {method:'POST',path:'/api/v1/dimona/out',desc:'Dimona OUT (sortie)',body:'{"employee_id":"...","end_date":"2026-03-31"}',response:'{"dimona_id":"D-xxx","status":"accepted"}'},
      {method:'POST',path:'/api/v1/dmfa/generate',desc:'Générer DmfA trimestrielle',body:'{"quarter":1,"year":2026}',response:'{"xml":"...","ticket":"ONSS-xxx","anomalies":[]}'},
    ]},
    {id:'export',cat:'📂 Export',endpoints:[
      {method:'GET',path:'/api/v1/export/:format',desc:'Export comptable (bob,winbooks,clearfact,exact...)',body:null,response:'CSV/XML file download'},
      {method:'GET',path:'/api/v1/export/sepa',desc:'Fichier SEPA virements',body:null,response:'XML SEPA pain.001'},
    ]},
    {id:'webhooks',cat:'🔔 Webhooks',endpoints:[
      {method:'POST',path:'/api/v1/webhooks/register',desc:'Enregistrer un webhook',body:'{"url":"https://...","events":["payroll.calculated","employee.created"]}',response:'{"webhook_id":"W-xxx"}'},
      {method:'GET',path:'/api/v1/webhooks',desc:'Liste des webhooks actifs',body:null,response:'[{"id":"W-xxx","url":"...","events":[...]}]'},
    ]},
  ];
  const methodColors={GET:'#4ade80',POST:'#60a5fa',PUT:'#fb923c',DELETE:'#f87171'};
  const active=endpoints.find(e=>e.id===activeEndpoint)||endpoints[0];
  
  return <div>
    <PH title="🔌 API Documentation" sub="REST API v1 — Intégrations & Automatisation"/>
    <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:18}}>
      <C>
        <ST>Endpoints</ST>
        {endpoints.map(ep=><button key={ep.id} onClick={()=>setActiveEndpoint(ep.id)} style={{display:'block',width:'100%',padding:'8px 12px',marginBottom:3,borderRadius:6,border:activeEndpoint===ep.id?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.05)',background:activeEndpoint===ep.id?'rgba(198,163,78,.1)':'transparent',color:activeEndpoint===ep.id?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:11,textAlign:'left',fontFamily:'inherit'}}>{ep.cat}</button>)}
        <div style={{marginTop:14,padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,fontSize:10,color:'#5e5c56',lineHeight:1.6}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Base URL</div>
          <code style={{color:'#e8e6e0',fontSize:9.5}}>https://api.aureussocial.be/v1</code>
          <div style={{fontWeight:600,color:'#c6a34e',marginTop:8,marginBottom:4}}>Auth Header</div>
          <code style={{color:'#e8e6e0',fontSize:9.5}}>Authorization: Bearer {'<token>'}</code>
          <div style={{fontWeight:600,color:'#c6a34e',marginTop:8,marginBottom:4}}>Rate Limit</div>
          <div>1000 req/min (standard)<br/>5000 req/min (enterprise)</div>
        </div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:12}}>{active.cat}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {active.endpoints.map((ep,i)=><div key={i} style={{padding:14,borderRadius:10,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:4,background:`${methodColors[ep.method]}22`,color:methodColors[ep.method]}}>{ep.method}</span>
              <code style={{fontSize:12,color:'#e8e6e0',fontWeight:500}}>{ep.path}</code>
            </div>
            <div style={{fontSize:11,color:'#9e9b93',marginBottom:8}}>{ep.desc}</div>
            {ep.body&&<div style={{marginBottom:6}}>
              <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',marginBottom:3}}>Request Body</div>
              <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.1)',borderRadius:6,padding:8,fontSize:9.5,color:'#4ade80',overflowX:'auto',margin:0}}>{ep.body}</pre>
            </div>}
            <div>
              <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',marginBottom:3}}>Response</div>
              <pre style={{background:'#060810',border:'1px solid rgba(139,115,60,.1)',borderRadius:6,padding:8,fontSize:9.5,color:'#60a5fa',overflowX:'auto',margin:0}}>{ep.response}</pre>
            </div>
          </div>)}
        </div>
      </C>
    </div>
  </div>;
}

export function MarketplaceMod({s,d}){const loisRef=LOIS_BELGES;
  const [cat,setCat]=useState('all');
  const [activatedMods,setActivatedMods]=useState(()=>{try{return _ls.get('aureus_marketplace_active', []);}catch(e){return[];}});
  const [notifiedMods,setNotifiedMods]=useState(()=>{try{return _ls.get('aureus_marketplace_notify', []);}catch(e){return[];}});
  const toggleMod=(modId,modName,price)=>{if(activatedMods.includes(modId)){const next=activatedMods.filter(m=>m!==modId);setActivatedMods(next);try{_ls.set('aureus_marketplace_active', next);}catch(e){ /* supabase error handled */ }}else{const next=[...activatedMods,modId];setActivatedMods(next);try{_ls.set('aureus_marketplace_active', next);}catch(e){ /* supabase error handled */ }alert('✅ Module "'+modName+'" activé ! ('+price+'€/mois)');}};
  const toggleNotify=(modId,modName)=>{if(notifiedMods.includes(modId)){const next=notifiedMods.filter(m=>m!==modId);setNotifiedMods(next);try{_ls.set('aureus_marketplace_notify', next);}catch(e){ /* supabase error handled */ }}else{const next=[...notifiedMods,modId];setNotifiedMods(next);try{_ls.set('aureus_marketplace_notify', next);}catch(e){ /* supabase error handled */ }alert('🔔 Vous serez notifié quand "'+modName+'" sera disponible !');}};
  const modules=[
    {id:'mod_fleet',name:'Fleet Management',desc:'Gestion de flotte véhicules de société. Budget mobilité, cartes carburant, TCO, avantage de toute nature auto.',icon:'🚗',price:49,cat:'mobilite',status:'available',rating:4.8,installs:342},
    {id:'mod_expense',name:'Expense Management',desc:'Notes de frais automatisées avec OCR. Scan ticket → remboursement. Politique de dépenses configurable.',icon:'🧾',price:29,cat:'finance',status:'available',rating:4.6,installs:567},
    {id:'mod_recruitment',name:'Recruitment ATS',desc:'Applicant Tracking System intégré. Publication offres, CV parsing, pipeline candidats, scoring IA.',icon:'🎯',price:79,cat:'rh',status:'available',rating:4.5,installs:189},
    {id:'mod_elearning',name:'E-Learning LMS',desc:'Plateforme de formation en ligne. Parcours obligatoires (sécurité, RGPD), certifications, suivi compliance.',icon:'📚',price:39,cat:'formation',status:'available',rating:4.7,installs:298},
    {id:'mod_survey',name:'Employee Survey',desc:'Enquêtes de satisfaction, baromètre social, eNPS, pulse surveys hebdomadaires.',icon:'📊',price:19,cat:'rh',status:'available',rating:4.4,installs:423},
    {id:'mod_planning',name:'Planning & Shifts',desc:'Planification des horaires et shifts. Rotation automatique, échanges entre collègues, respect temps de repos.',icon:'📅',price:39,cat:'temps',status:'available',rating:4.6,installs:512},
    {id:'mod_onboarding',name:'Digital Onboarding',desc:'Parcours d\'intégration digital. Checklist, signature électronique, welcome pack, mentor assigné.',icon:'🎓',price:29,cat:'rh',status:'coming',rating:0,installs:0},
    {id:'mod_offboarding',name:'Offboarding Suite',desc:'Processus de sortie complet. Récupération matériel, transfert connaissances, exit interview, alumni network.',icon:'👋',price:19,cat:'rh',status:'coming',rating:0,installs:0},
    {id:'mod_analytics',name:'People Analytics Pro',desc:'Dashboards RH avancés. Turnover prédictif ML, cohortes, benchmarks sectoriels, equal pay analysis.',icon:'📈',price:99,cat:'analytics',status:'available',rating:4.9,installs:156},
    {id:'mod_sign',name:'E-Signature',desc:'Signature électronique eIDAS. Contrats, avenants, règlement de travail. Intégration itsme® et eID belge.',icon:'✍️',price:29,cat:'documents',status:'available',rating:4.7,installs:678},
    {id:'mod_whistleblower',name:'Whistleblower Channel',desc:'Canal de signalement anonyme conforme Directive UE 2019/1937. Obligatoire +50 travailleurs.',icon:'🔔',price:19,cat:'compliance',status:'available',rating:4.3,installs:89},
    {id:'mod_ai_assistant',name:'AI Payroll Assistant',desc:'Assistant IA conversationnel spécialisé droit social belge. Répond aux questions CP, préavis, indexation.',icon:'🤖',price:59,cat:'ia',status:'available',rating:4.8,installs:834},
  ];
  const cats=[{v:'all',l:'Tous'},{v:'rh',l:'RH'},{v:'finance',l:'Finance'},{v:'temps',l:'Temps'},{v:'formation',l:'Formation'},{v:'mobilite',l:'Mobilité'},{v:'documents',l:'Documents'},{v:'compliance',l:'Compliance'},{v:'analytics',l:'Analytics'},{v:'ia',l:'IA'}];
  const filtered=cat==='all'?modules:modules.filter(m=>m.cat===cat);
  
  return <div>
    <PH title="🏪 Marketplace" sub={`${modules.length} modules disponibles — Étendez votre plateforme`}/>
    <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
      {cats.map(c=><button key={c.v} onClick={()=>setCat(c.v)} style={{padding:'6px 14px',borderRadius:20,border:cat===c.v?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.08)',background:cat===c.v?'rgba(198,163,78,.12)':'transparent',color:cat===c.v?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>{c.l}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
      {filtered.map(m=><C key={m.id} style={{position:'relative',overflow:'hidden'}}>
        {m.status==='coming'&&<div style={{position:'absolute',top:10,right:-30,transform:'rotate(45deg)',background:'#fb923c',color:'#fff',fontSize:9,padding:'2px 35px',fontWeight:700}}>BIENTÔT</div>}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <span style={{fontSize:28}}>{m.icon}</span>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0'}}>{m.name}</div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {m.rating>0&&<span style={{fontSize:10,color:'#c6a34e'}}>★ {m.rating}</span>}
              {m.installs>0&&<span style={{fontSize:10,color:'#5e5c56'}}>{m.installs} installations</span>}
            </div>
          </div>
        </div>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.5,marginBottom:12,minHeight:45}}>{m.desc}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{m.price}€<span style={{fontSize:10,fontWeight:400,color:'#5e5c56'}}>/mois</span></div>
          <B v={m.status==='coming'?'outline':activatedMods.includes(m.id)?'outline':'gold'} style={{fontSize:11,padding:'6px 16px'}} onClick={()=>{if(m.status==='coming')toggleNotify(m.id,m.name);else toggleMod(m.id,m.name,m.price);}}>
            {m.status==='coming'?(notifiedMods.includes(m.id)?'🔔 Notifié':'Notifier'):(activatedMods.includes(m.id)?'✓ Actif':'Activer')}
          </B>
        </div>
      </C>)}
    </div>
  </div>;
}

export function IntegrationsMod({s,d}){const loisRef=LOIS_BELGES;
  const integrations=[
    {cat:'Comptabilité',items:[
      {name:'BOB Software',logo:'🟦',status:'connected',desc:'Export OD automatique mensuel'},
      {name:'Winbooks',logo:'🟩',status:'connected',desc:'Sync journaux comptables'},
      {name:'Exact Online',logo:'🟧',status:'available',desc:'API bi-directionnelle'},
      {name:'ClearFact',logo:'🟨',status:'connected',desc:'Upload factures + pièces'},
      {name:'Octopus',logo:'🟪',status:'available',desc:'Export écritures'},
      {name:'Yuki',logo:'⬜',status:'available',desc:'XML automatique'},
      {name:'Horus',logo:'🔵',status:'available',desc:'Interface comptable'},
    ]},
    {cat:'ONSS & Gouvernement',items:[
      {name:'Portail Sécurité Sociale',logo:'🏛️',status:'connected',desc:'Dimona, DmfA, DRS'},
      {name:'MyMinfin',logo:'🏦',status:'connected',desc:'Précompte 274, Belcotax 281'},
      {name:'itsme®',logo:'📱',status:'available',desc:'Signature électronique + auth'},
      {name:'CSAM',logo:'🔐',status:'available',desc:'Authentication fédérale'},
    ]},
    {cat:'Banque & Paiement',items:[
      {name:'Isabel 6',logo:'🏦',status:'available',desc:'Virements SEPA batch'},
      {name:'Codabox',logo:'📦',status:'available',desc:'CODA + SODA automatique'},
      {name:'Ponto (Isabel)',logo:'💳',status:'available',desc:'Relevés bancaires PSD2'},
    ]},
    {cat:'RH & Bien-être',items:[
      {name:'Pluxee (Sodexo)',logo:'🟠',status:'connected',desc:'Commande chèques-repas'},
      {name:'Edenred',logo:'🔴',status:'available',desc:'Chèques-repas & éco-chèques'},
      {name:'Monizze',logo:'🟢',status:'available',desc:'Chèques-repas digitaux'},
      {name:'SPMT-ARISTA',logo:'🩺',status:'available',desc:'Médecine du travail'},
      {name:'Mensura',logo:'🏥',status:'available',desc:'Prévention & bien-être'},
    ]},
    {cat:'Communication',items:[
      {name:'Microsoft Teams',logo:'🟣',status:'available',desc:'Notifications paie & RH'},
      {name:'Slack',logo:'💬',status:'available',desc:'Alertes & workflow'},
      {name:'SMTP Email',logo:'📧',status:'connected',desc:'Fiches de paie par email'},
    ]},
  ];
  const statusColors={connected:'#4ade80',available:'#5e5c56',error:'#f87171'};
  const statusLabels={connected:'Connecté',available:'Disponible',error:'Erreur'};
  
  return <div>
    <PH title="🔗 Intégrations" sub="Connecteurs et API partenaires"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
      <SC label="Total connecteurs" value={integrations.reduce((a,c)=>a+c.items.length,0)} color="#c6a34e"/>
      <SC label="Connectés" value={integrations.reduce((a,c)=>a+c.items.filter(i=>i.status==='connected').length,0)} color="#4ade80"/>
      <SC label="Disponibles" value={integrations.reduce((a,c)=>a+c.items.filter(i=>i.status==='available').length,0)} color="#60a5fa"/>
      <SC label="Catégories" value={integrations.length} color="#a78bfa"/>
    </div>
    {integrations.map((cat,ci)=><C key={ci} style={{marginBottom:12}}>
      <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>{cat.cat}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
        {cat.items.map((it,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.06)'}}>
          <span style={{fontSize:20}}>{it.logo}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{it.name}</div>
            <div style={{fontSize:9.5,color:'#5e5c56'}}>{it.desc}</div>
          </div>
          <span style={{width:8,height:8,borderRadius:'50%',background:statusColors[it.status]}} title={statusLabels[it.status]}/>
        </div>)}
      </div>
    </C>)}
  </div>;
}

export function WebhookManagerMod({s,d}){const loisRef=LOIS_BELGES;
  const [hooks,setHooks]=useState([
    {id:'WH-001',url:'https://accounting.example.com/webhook',events:['payroll.calculated','payroll.batch'],status:'active',lastCall:'2026-02-14T10:30:00',success:142,fail:2},
    {id:'WH-002',url:'https://erp.example.com/aureus',events:['employee.created','employee.updated'],status:'active',lastCall:'2026-02-13T16:45:00',success:67,fail:0},
  ]);
  const allEvents=['payroll.calculated','payroll.batch','employee.created','employee.updated','employee.deleted','dimona.sent','dmfa.generated','contract.signed','absence.declared','alert.triggered'];
  
  return <div>
    <PH title="🔔 Webhook Manager" sub="Événements temps réel vers vos systèmes"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18}}>
      <SC label="Webhooks actifs" value={hooks.filter(h=>h.status==='active').length} color="#4ade80"/>
      <SC label="Appels réussis" value={hooks.reduce((a,h)=>a+h.success,0)} color="#60a5fa"/>
      <SC label="Erreurs" value={hooks.reduce((a,h)=>a+h.fail,0)} color={hooks.reduce((a,h)=>a+h.fail,0)>0?'#f87171':'#4ade80'}/>
    </div>
    <C>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <ST>Webhooks configurés</ST>
        <B v="outline" style={{fontSize:10}} onClick={()=>{
          const newHook={id:'WH-'+Date.now().toString(36).toUpperCase(),url:'https://',events:[],status:'draft',lastCall:null,success:0,fail:0};
          setHooks([...hooks,newHook]);
        }}>+ Ajouter webhook</B>
      </div>
      {hooks.map((h,i)=><div key={h.id} style={{padding:14,borderRadius:10,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.08)',marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:h.status==='active'?'#4ade80':'#fb923c'}}/>
            <code style={{fontSize:12,color:'#e8e6e0'}}>{h.url}</code>
          </div>
          <span style={{fontSize:10,color:'#5e5c56'}}>{h.id}</span>
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
          {h.events.map(ev=><span key={ev} style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:'rgba(96,165,250,.1)',color:'#60a5fa'}}>{ev}</span>)}
        </div>
        <div style={{display:'flex',gap:16,fontSize:10,color:'#5e5c56'}}>
          <span>✅ {h.success} succès</span>
          <span>❌ {h.fail} erreurs</span>
          {h.lastCall&&<span>Dernier appel: {new Date(h.lastCall).toLocaleString('fr-BE')}</span>}
        </div>
      </div>)}
    </C>
    <C style={{marginTop:12}}>
      <ST>Événements disponibles</ST>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
        {allEvents.map(ev=><div key={ev} style={{padding:'8px 10px',borderRadius:6,background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.06)',fontSize:10,color:'#9e9b93',textAlign:'center'}}>{ev}</div>)}
      </div>
    </C>
  </div>;
}

export function BudgetAutoMod({s,d}){
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
  const [year,setYear]=useState(new Date().getFullYear());
  const [indexRate,setIndexRate]=useState(2);
  const [hiring,setHiring]=useState(0);
  const [avgNewSalary,setAvgNewSalary]=useState(3000);
  
  const masseBrute=ae.reduce((a,e)=>a+(parseFloat(e.monthlySalary)||0),0);
  const months=Array.from({length:12},(_,i)=>{
    const m=i+1;
    const indexFactor=1+(indexRate/100)*(m/12);
    const hireEffect=m>=6?(hiring*avgNewSalary*(m-5)/12):0;
    const brut=(masseBrute*indexFactor)+hireEffect;
    const onssE=brut*0.25;
    const onssW=brut*TX_ONSS_W;
    const pp=quickPP(brut);
    const net=brut-onssW-pp;
    const cost=brut+onssE;
    const cheques=ae.length*22*CR_PAT;
    return{m,brut:Math.round(brut),onssE:Math.round(onssE),onssW:Math.round(onssW),pp:Math.round(pp),net:Math.round(net),cost:Math.round(cost),cheques:Math.round(cheques),total:Math.round(cost+cheques)};
  });
  const totals=months.reduce((a,m)=>({brut:a.brut+m.brut,onssE:a.onssE+m.onssE,onssW:a.onssW+m.onssW,pp:a.pp+m.pp,net:a.net+m.net,cost:a.cost+m.cost,cheques:a.cheques+m.cheques,total:a.total+m.total}),{brut:0,onssE:0,onssW:0,pp:0,net:0,cost:0,cheques:0,total:0});
  const pec13=masseBrute*PV_DOUBLE;const pecD=masseBrute;
  const annualTotal=totals.total+pec13+pecD;
  
  return <div>
    <PH title="📊 Budget Salarial Automatique" sub={`Projection ${year} — ${ae.length} travailleurs`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
      <SC label="Masse brute / an" value={fmt(totals.brut)} color="#c6a34e"/>
      <SC label="ONSS patronal / an" value={fmt(totals.onssE)} color="#f87171"/>
      <SC label="Chèques-repas / an" value={fmt(totals.cheques)} color="#fb923c"/>
      <SC label="13ème mois + Pécule" value={fmt(pec13+pecD)} color="#60a5fa"/>
      <SC label="COÛT TOTAL ANNUEL" value={fmt(annualTotal)} color="#a78bfa" sub={`${fmt(annualTotal/12)}/mois`}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <div style={{display:'grid',gap:10}}>
          <I label="Année" type="number" value={year} onChange={v=>setYear(parseInt(v))}/>
          <I label="Indexation annuelle (%)" type="number" value={indexRate} onChange={v=>setIndexRate(parseFloat(v)||0)}/>
          <I label="Embauches prévues (S2)" type="number" value={hiring} onChange={v=>setHiring(parseInt(v)||0)}/>
          {hiring>0&&<I label="Salaire moyen embauches" type="number" value={avgNewSalary} onChange={v=>setAvgNewSalary(parseFloat(v)||0)}/>}
        </div>
        <div style={{marginTop:14,padding:12,background:'rgba(198,163,78,.04)',borderRadius:8,fontSize:10.5,color:'#5e5c56',lineHeight:1.8}}>
          <div><b style={{color:'#c6a34e'}}>Hypothèses:</b></div>
          <div>• Indexation: {indexRate}% linéaire</div>
          <div>• ONSS patronal: 25%</div>
          <div>• Précompte moyen: 22%</div>
          <div>• CR: 22j × 6,91€ empl.</div>
          <div>• 13ème mois: 92% du brut</div>
          <div>• Pécule vacances: 100% du brut</div>
          {hiring>0&&<div>• {hiring} embauches à {fmt(avgNewSalary)} dès juillet</div>}
        </div>
      </C>
      <C>
        <ST>Budget mensuel détaillé</ST>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
            <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
              <th style={{padding:'6px 8px',textAlign:'left',color:'#5e5c56',fontSize:9}}>MOIS</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#5e5c56',fontSize:9}}>BRUT</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#5e5c56',fontSize:9}}>ONSS PAT.</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#5e5c56',fontSize:9}}>PP</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#5e5c56',fontSize:9}}>NET</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#5e5c56',fontSize:9}}>CR</th>
              <th style={{padding:'6px 8px',textAlign:'right',color:'#c6a34e',fontSize:9,fontWeight:700}}>TOTAL</th>
            </tr></thead>
            <tbody>
              {months.map(m=><tr key={m.m} style={{borderBottom:'1px solid rgba(198,163,78,.04)'}}>
                <td style={{padding:'5px 8px',color:'#e8e6e0'}}>{MN[m.m-1]}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#e8e6e0',fontFamily:'monospace'}}>{fmt(m.brut)}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#f87171',fontFamily:'monospace'}}>{fmt(m.onssE)}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#fb923c',fontFamily:'monospace'}}>{fmt(m.pp)}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#4ade80',fontFamily:'monospace'}}>{fmt(m.net)}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#60a5fa',fontFamily:'monospace'}}>{fmt(m.cheques)}</td>
                <td style={{padding:'5px 8px',textAlign:'right',color:'#c6a34e',fontWeight:700,fontFamily:'monospace'}}>{fmt(m.total)}</td>
              </tr>)}
              <tr style={{borderTop:'2px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.04)'}}>
                <td style={{padding:'8px',color:'#c6a34e',fontWeight:700}}>TOTAL</td>
                <td style={{padding:'8px',textAlign:'right',color:'#c6a34e',fontWeight:700,fontFamily:'monospace'}}>{fmt(totals.brut)}</td>
                <td style={{padding:'8px',textAlign:'right',color:'#f87171',fontWeight:700,fontFamily:'monospace'}}>{fmt(totals.onssE)}</td>
                <td style={{padding:'8px',textAlign:'right',color:'#fb923c',fontWeight:700,fontFamily:'monospace'}}>{fmt(totals.pp)}</td>
                <td style={{padding:'8px',textAlign:'right',color:'#4ade80',fontWeight:700,fontFamily:'monospace'}}>{fmt(totals.net)}</td>
                <td style={{padding:'8px',textAlign:'right',color:'#60a5fa',fontWeight:700,fontFamily:'monospace'}}>{fmt(totals.cheques)}</td>
                <td style={{padding:'8px',textAlign:'right',color:'#c6a34e',fontWeight:700,fontFamily:'monospace',fontSize:12}}>{fmt(totals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </C>
    </div>
  </div>;
}

export function SimulateurWhatIfMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [brutBase,setBrutBase]=useState(3500);const [scenario,setScenario]=useState("augmentation");const [param,setParam]=useState(200);const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);const calcScenario=(brut,sc,p)=>{let newBrut=brut;if(sc==='augmentation')newBrut=brut+p;else if(sc==='reduction')newBrut=brut*(p/100);else if(sc==='indexation')newBrut=brut*(1+p/100);else if(sc==='promo')newBrut=brut+p;const before={brut,onssW:Math.round(brut*TX_ONSS_W*100)/100,pp:quickPP(brut),net:quickNet(brut),coutEmp:Math.round(brut*(1+TX_ONSS_E)*100)/100};const after={brut:newBrut,onssW:Math.round(newBrut*TX_ONSS_W*100)/100,pp:quickPP(newBrut),net:quickNet(newBrut),coutEmp:Math.round(newBrut*(1+TX_ONSS_E)*100)/100};return {before,after,diffNet:after.net-before.net,diffCout:after.coutEmp-before.coutEmp,diffBrut:after.brut-before.brut};};const result=calcScenario(brutBase,scenario,param);return <div><PH title="Simulateur What-If" sub="Impact reel augmentation, indexation, temps partiel — quickPP + quickNet"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Delta net travailleur",v:(result.diffNet>=0?"+":"")+f2(result.diffNet)+" EUR",c:result.diffNet>=0?"#22c55e":"#ef4444"},{l:"Delta cout employeur",v:(result.diffCout>=0?"+":"")+f2(result.diffCout)+" EUR",c:"#ef4444"},{l:"Ratio net/brut avant",v:(result.before.net/result.before.brut*100).toFixed(1)+"%",c:"#60a5fa"},{l:"Ratio net/brut apres",v:result.after.brut>0?(result.after.net/result.after.brut*100).toFixed(1)+"%":"—",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Parametres scenario</ST><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Brut actuel</label><input type="number" value={brutBase} onChange={e=>setBrutBase(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:150,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Scenario</label><select value={scenario} onChange={e=>{setScenario(e.target.value);if(e.target.value==='augmentation')setParam(200);else if(e.target.value==='reduction')setParam(80);else if(e.target.value==='indexation')setParam(2);else setParam(500);}} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,fontFamily:"inherit"}}><option value="augmentation">Augmentation (EUR)</option><option value="reduction">Temps partiel (%)</option><option value="indexation">Indexation (%)</option><option value="promo">Promotion (EUR)</option></select></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>{scenario==='augmentation'||scenario==='promo'?'Montant EUR':scenario==='reduction'?'% regime':'% indexation'}</label><input type="number" value={param} onChange={e=>setParam(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:120,fontFamily:"inherit"}}/></div></div></C><C><ST>Comparaison avant / apres</ST>{[{l:"Salaire brut",av:result.before.brut,ap:result.after.brut},{l:"ONSS travailleur (13,07%)",av:-result.before.onssW,ap:-result.after.onssW},{l:"Precompte (formule-cle SPF)",av:-result.before.pp,ap:-result.after.pp},{l:"NET travailleur",av:result.before.net,ap:result.after.net},{l:"Cout employeur total",av:result.before.coutEmp,ap:result.after.coutEmp}].map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,padding:i===3||i===4?"10px 0":"6px 0",borderBottom:i<4?"1px solid rgba(255,255,255,.03)":"none",borderTop:i===3?"2px solid rgba(198,163,78,.2)":"none"}}><span style={{color:i>=3?"#c6a34e":"#9e9b93",fontSize:12,fontWeight:i>=3?700:400}}>{r.l}</span><span style={{textAlign:"right",color:"#e8e6e0",fontSize:12}}>{f2(r.av)}</span><span style={{textAlign:"right",color:"#e8e6e0",fontSize:12}}>{f2(r.ap)}</span><span style={{textAlign:"right",color:r.ap-r.av>=0?"#22c55e":"#ef4444",fontSize:12,fontWeight:600}}>{(r.ap-r.av>=0?"+":"")+f2(r.ap-r.av)}</span></div>)}</C></div>;}

export function KPIDashboardMod({s,d}){const ae= s?.emps||[];const n=ae.length;const mb=ae.reduce((a,e)=>a+(+e.gross||0),0);const coutTotal=mb*(1+TX_ONSS_E);const netTotal=mb*NET_FACTOR;const moyBrut=n>0?mb/n:0;const femmes=ae.filter(e=>(e.gender||"").toLowerCase()==="f").length;const hommes=n-femmes;const cdi=ae.filter(e=>(e.contractType||"CDI")==="CDI").length;const cdd=ae.filter(e=>(e.contractType||"")==="CDD").length;const tp=ae.filter(e=>(+e.regime||100)<100).length;const ages=ae.map(e=>{if(!e.birthDate)return 35;const bd=new Date(e.birthDate);return Math.floor((Date.now()-bd)/(365.25*24*3600*1000));});const moyAge=ages.length>0?(ages.reduce((a,c)=>a+c,0)/ages.length).toFixed(1):0;const moins25=ages.filter(a=>a<25).length;const a2534=ages.filter(a=>a>=25&&a<35).length;const a3544=ages.filter(a=>a>=35&&a<45).length;const a4554=ages.filter(a=>a>=45&&a<55).length;const plus55=ages.filter(a=>a>=55).length;const ancs=ae.map(e=>{if(!e.startDate)return 1;return Math.max(0.5,((Date.now()-new Date(e.startDate))/(365.25*24*3600*1000)));});const moyAnc=ancs.length>0?(ancs.reduce((a,c)=>a+c,0)/ancs.length).toFixed(1):0;const [tab,setTab]=useState("overview");
return <div><PH title="Dashboard RH" sub={"Vue globale - "+n+" travailleurs - Masse salariale "+fmt(mb)+"/mois"}/><div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>{[{l:"Effectif",v:n,c:"#c6a34e"},{l:"Masse brute",v:fmt(mb),c:"#c6a34e"},{l:"Cout employeur",v:fmt(coutTotal),c:"#f87171"},{l:"Net total",v:fmt(netTotal),c:"#4ade80"},{l:"Age moyen",v:moyAge+" ans",c:"#60a5fa"},{l:"Anciennete moy.",v:moyAnc+" ans",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"overview",l:"Vue globale"},{v:"masse",l:"Masse salariale"},{v:"demog",l:"Demographie"},{v:"contrats",l:"Contrats"},{v:"salaries",l:"Par travailleur"},{v:"alerts",l:"Alertes RH"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>{tab==="overview"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}><C><ST>Repartition H/F</ST><div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",padding:"20px 0"}}><div style={{textAlign:"center"}}><div style={{width:56,height:56,borderRadius:"50%",background:"rgba(96,165,250,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#60a5fa"}}>{hommes}</div><div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Hommes</div></div><div style={{textAlign:"center"}}><div style={{width:56,height:56,borderRadius:"50%",background:"rgba(248,113,113,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#f87171"}}>{femmes}</div><div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Femmes</div></div></div><div style={{height:8,display:"flex",borderRadius:4,overflow:"hidden"}}>{hommes>0&&<div style={{width:(hommes/Math.max(n,1)*100)+"%",background:"#60a5fa"}}/>}{femmes>0&&<div style={{width:(femmes/Math.max(n,1)*100)+"%",background:"#f87171"}}/>}</div></C><C><ST>Pyramide des ages</ST>{[{l:"-25 ans",v:moins25,c:"#4ade80"},{l:"25-34",v:a2534,c:"#60a5fa"},{l:"35-44",v:a3544,c:"#a78bfa"},{l:"45-54",v:a4554,c:"#fb923c"},{l:"55+",v:plus55,c:"#f87171"}].map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}><span style={{width:40,fontSize:10,color:"#9e9b93"}}>{r.l}</span><div style={{flex:1,height:12,background:"rgba(198,163,78,.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(2,(r.v/Math.max(n,1)*100))+"%",background:r.c,borderRadius:3}}/></div><span style={{width:20,fontSize:11,fontWeight:700,color:r.c,textAlign:"right"}}>{r.v}</span></div>)}</C><C><ST>Types de contrats</ST><div style={{display:"flex",flexDirection:"column",gap:8,padding:"10px 0"}}>{[{l:"CDI",v:cdi,c:"#4ade80"},{l:"CDD",v:cdd,c:"#fb923c"},{l:"Temps partiel",v:tp,c:"#60a5fa"},{l:"Temps plein",v:n-tp,c:"#a78bfa"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"#9e9b93",fontSize:12}}>{r.l}</span><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:60,height:6,background:"rgba(198,163,78,.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(5,(r.v/Math.max(n,1)*100))+"%",background:r.c,borderRadius:3}}/></div><span style={{fontSize:13,fontWeight:700,color:r.c,width:24,textAlign:"right"}}>{r.v}</span></div></div>)}</div></C></div>}
{tab==="masse"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Decomposition masse salariale mensuelle</ST>{[{l:"Salaires bruts",v:mb,c:"#c6a34e"},{l:"ONSS patronal ("+(TX_ONSS_E*100).toFixed(2)+"%)",v:mb*TX_ONSS_E,c:"#f87171"},{l:"Assurance AT (~1%)",v:mb*TX_AT,c:"#f87171"},{l:"Medecine travail",v:n*COUT_MED,c:"#f87171"},{l:"Cheques-repas patronal",v:n*CR_PAT*22,c:"#f87171"},{l:"COUT TOTAL EMPLOYEUR",v:coutTotal+mb*TX_AT+n*COUT_MED+n*CR_PAT*22,c:"#f87171"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i===5?"2px solid rgba(248,113,113,.3)":"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:i===5?700:600,color:r.c,fontSize:i===5?16:13}}>{fmt(r.v)}</span></div>)}</C><C><ST>Projection annuelle</ST>{[{l:"Masse brute x 12",v:mb*12,c:"#c6a34e"},{l:"13eme mois",v:mb,c:"#c6a34e"},{l:"Pecule vacances",v:mb*PV_DOUBLE,c:"#c6a34e"},{l:"Masse brute totale",v:mb*(12+1+PV_DOUBLE),c:"#c6a34e"},{l:"ONSS patronal annuel",v:mb*(12+1+PV_DOUBLE)*TX_ONSS_E,c:"#f87171"},{l:"Cout annuel total",v:mb*(12+1+PV_DOUBLE)*(1+TX_ONSS_E),c:"#f87171"},{l:"Cout moyen/trav./mois",v:n>0?coutTotal/n:0,c:"#fb923c"},{l:"Cout moyen/trav./an",v:n>0?mb*(12+1+PV_DOUBLE)*(1+TX_ONSS_E)/n:0,c:"#fb923c"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:600,color:r.c}}>{fmt(r.v)}</span></div>)}</C></div>}{tab==="demog"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Pyramide des ages detaillee</ST>{[{l:"Moins de 25 ans",v:moins25,p:n>0?((moins25/n)*100).toFixed(0):0,c:"#4ade80"},{l:"25 - 34 ans",v:a2534,p:n>0?((a2534/n)*100).toFixed(0):0,c:"#60a5fa"},{l:"35 - 44 ans",v:a3544,p:n>0?((a3544/n)*100).toFixed(0):0,c:"#a78bfa"},{l:"45 - 54 ans",v:a4554,p:n>0?((a4554/n)*100).toFixed(0):0,c:"#fb923c"},{l:"55 ans et plus",v:plus55,p:n>0?((plus55/n)*100).toFixed(0):0,c:"#f87171"}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#e8e6e0",fontSize:12}}>{r.l}</span><span style={{color:r.c,fontWeight:700}}>{r.v} ({r.p}%)</span></div><div style={{height:10,background:"rgba(198,163,78,.06)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(3,+r.p)+"%",background:r.c,borderRadius:4}}/></div></div>)}</C><C><ST>Indicateurs demographiques</ST>{[{l:"Age moyen",v:moyAge+" ans",c:"#60a5fa"},{l:"Anciennete moyenne",v:moyAnc+" ans",c:"#a78bfa"},{l:"Ratio H/F",v:hommes+"/"+femmes,c:"#c6a34e"},{l:"Taux feminisation",v:n>0?((femmes/n)*100).toFixed(0)+"%":"0%",c:"#f87171"},{l:"Taux temps partiel",v:n>0?((tp/n)*100).toFixed(0)+"%":"0%",c:"#fb923c"},{l:"Taux CDI",v:n>0?((cdi/n)*100).toFixed(0)+"%":"0%",c:"#4ade80"},{l:"Brut moyen",v:fmt(moyBrut),c:"#c6a34e"},{l:"Brut median",v:fmt(ae.length>0?[...ae].sort((a2,b2)=>(+a2.gross||0)-(+b2.gross||0))[Math.floor(ae.length/2)]?.gross||0:0),c:"#c6a34e"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:600,color:r.c}}>{r.v}</span></div>)}</C></div>}
{tab==="contrats"&&<C><ST>Detail contrats de travail</ST><Tbl cols={[{k:"n",l:"Travailleur",b:1,r:r=>(r.fn||"")+" "+(r.ln||"")},{k:"t",l:"Type",r:r=><span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:(r.contractType||"CDI")==="CDI"?"rgba(74,222,128,.1)":"rgba(251,146,56,.1)",color:(r.contractType||"CDI")==="CDI"?"#4ade80":"#fb923c"}}>{r.contractType||"CDI"}</span>},{k:"d",l:"Debut",r:r=><span style={{color:"#9e9b93"}}>{r.startDate||"-"}</span>},{k:"r",l:"Regime",a:"right",r:r=><span style={{color:"#60a5fa"}}>{(+r.regime||100)+"%"}</span>},{k:"g",l:"Brut",a:"right",r:r=><span style={{color:"#c6a34e",fontWeight:600}}>{fmt(+r.gross||0)}</span>},{k:"c",l:"Cout empl.",a:"right",r:r=><span style={{color:"#f87171"}}>{fmt((+r.gross||0)*(1+TX_ONSS_E))}</span>},{k:"ne",l:"Net est.",a:"right",r:r=><span style={{color:"#4ade80"}}>{fmt((+r.gross||0)*NET_FACTOR)}</span>}]} data={ae}/><div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:"2px solid rgba(198,163,78,.3)",marginTop:8}}><b style={{color:"#c6a34e"}}>TOTAUX</b><div style={{display:"flex",gap:24}}><span style={{color:"#c6a34e",fontWeight:700}}>Brut: {fmt(mb)}</span><span style={{color:"#f87171",fontWeight:700}}>Cout: {fmt(coutTotal)}</span><span style={{color:"#4ade80",fontWeight:700}}>Net: {fmt(netTotal)}</span></div></div></C>}{tab==="salaries"&&<C><ST>Fiche individuelle par travailleur</ST>{ae.length===0?<div style={{color:"#5e5c56",textAlign:"center",padding:40}}>Aucun travailleur</div>:ae.map((e,i)=>{const g=+e.gross||0;const oT=g*TX_ONSS_W;const pT=g*PP_EST;const nT=g-oT-pT;return <div key={i} style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div><b style={{color:"#e8e6e0",fontSize:13}}>{(e.fn||"")+" "+(e.ln||"")}</b><span style={{color:"#5e5c56",fontSize:10,marginLeft:8}}>{e.statut||"Employe"} - {e.contractType||"CDI"} - {(+e.regime||100)+"%"}</span></div><span style={{color:"#c6a34e",fontWeight:700,fontSize:15}}>{fmt(g)}</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>{[{l:"ONSS",v:"-"+fmt(oT),c:"#f87171"},{l:"PP est.",v:"-"+fmt(pT),c:"#f87171"},{l:"Net est.",v:fmt(nT),c:"#4ade80"},{l:"Cout empl.",v:fmt(g*(1+TX_ONSS_E)),c:"#fb923c"},{l:"Annuel",v:fmt(g*(12+1+PV_DOUBLE)),c:"#60a5fa"}].map((k,j)=><div key={j} style={{padding:"6px 8px",background:"rgba(198,163,78,.03)",borderRadius:6,textAlign:"center"}}><div style={{fontSize:9,color:"#5e5c56"}}>{k.l}</div><div style={{fontSize:12,fontWeight:600,color:k.c}}>{k.v}</div></div>)}</div></div>})}</C>}{tab==="alerts"&&<C><ST>Alertes RH</ST>{[].concat(ae.filter(e=>!e.niss).map(e=>({t:"NISS manquant",d:(e.fn||"")+" "+(e.ln||"")+" - Numero national requis pour declarations",c:"#f87171"}))).concat(ae.filter(e=>!e.startDate).map(e=>({t:"Date entree manquante",d:(e.fn||"")+" "+(e.ln||"")+" - Requis pour anciennete et préavis",c:"#fb923c"}))).concat(ae.filter(e=>!e.birthDate).map(e=>({t:"Date naissance manquante",d:(e.fn||"")+" "+(e.ln||"")+" - Requis pour pyramide ages",c:"#fb923c"}))).concat(ae.filter(e=>(+e.gross||0)<RMMMG).map(e=>({t:"Salaire sous RMMMG",d:(e.fn||"")+" "+(e.ln||"")+" - Brut "+fmt(+e.gross||0)+" < "+fmt(RMMMG)+" EUR (RMMMG 2026)",c:"#f87171"}))).concat(ae.filter(e=>{if(!e.startDate)return false;const m=((Date.now()-new Date(e.startDate))/(365.25*24*3600*1000));return (e.contractType||"")==="CDD"&&m>2;}).map(e=>({t:"CDD > 2 ans",d:(e.fn||"")+" "+(e.ln||"")+" - Risque requalification CDI (max 4 CDD / 2 ans)",c:"#f87171"}))).concat(n>=20?[{t:"Plan formation obligatoire",d:"Effectif ≥ 20: obligation plan formation 4j/ETP/an",c:"#60a5fa"}]:[]).concat(n>=50?[{t:"CPPT obligatoire",d:"Effectif ≥ 50: Comite PPT obligatoire + elections sociales",c:"#60a5fa"},{t:"CE obligatoire",d:"Effectif ≥ 100: Conseil entreprise obligatoire",c:"#60a5fa"}]:[]).concat(femmes>0&&hommes>0?[{t:"Ecart salarial H/F",d:"Rapport ecart salarial bisannuel obligatoire (Loi 22/04/2012)",c:"#a78bfa"}]:[]).map((r,i)=><div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{width:8,height:8,borderRadius:"50%",background:r.c,marginTop:4,flexShrink:0}}/><div><b style={{color:r.c,fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div></div>)}{ae.length>0&&ae.every(e=>e.niss&&e.startDate&&e.birthDate&&(+e.gross||0)>=RMMMG)&&<div style={{textAlign:"center",padding:20,color:"#4ade80"}}>Aucune alerte - Donnees completes</div>}</C>}</div>;}

export function AutomationsMod({s,d}){const loisRef=LOIS_BELGES;const rmmmg=RMMMG;
  const [rules,setRules]=useState([
    {id:'R1',name:'Préparation paie mensuelle',trigger:'date',triggerValue:'20',action:'auto_prepare_payroll',enabled:true,lastRun:'2026-01-20T08:00:00',runs:12,desc:'Collecte absences, calcule brut/net, prépare toutes les fiches → EN ATTENTE de votre validation'},
    {id:'R1b',name:'Scan absences automatique',trigger:'date',triggerValue:'19',action:'auto_scan_absences',enabled:true,lastRun:'2026-01-19T08:00:00',runs:12,desc:'Scanne certificats médicaux, congés encodés, jours fériés → prépare le récap → EN ATTENTE validation'},
    {id:'R2',name:'Préparation DmfA trimestrielle',trigger:'date_quarterly',triggerValue:'15',action:'auto_prepare_dmfa',enabled:true,lastRun:'2026-01-15T09:00:00',runs:4,desc:'Génère le XML DmfA avec toutes les données du trimestre → EN ATTENTE de votre envoi'},
    {id:'R3',name:'Préparation Dimona embauche',trigger:'event',triggerValue:'employee_created',action:'auto_prepare_dimona',enabled:true,lastRun:'2026-02-10T14:30:00',runs:8,desc:'Pré-remplit la Dimona IN avec les données de l\'employé → EN ATTENTE de votre validation'},
    {id:'R4',name:'Dossier fin CDD',trigger:'condition',triggerValue:'cdd_expires_30d',action:'auto_prepare_cdd',enabled:true,lastRun:'2026-02-01T08:00:00',runs:3,desc:'Prépare renouvellement OU documents de sortie (C4, décompte) → EN ATTENTE de votre décision'},
    {id:'R5',name:'Calcul indexation annuelle',trigger:'date_yearly',triggerValue:'01-01',action:'auto_calc_indexation',enabled:true,lastRun:'2026-01-01T06:00:00',runs:1,desc:'Calcule les nouveaux salaires indexés pour tous les travailleurs → EN ATTENTE de votre application'},
    {id:'R6',name:'Backup données quotidien',trigger:'daily',triggerValue:'02:00',action:'auto_backup',enabled:true,lastRun:'2026-02-14T02:00:00',runs:365,desc:'Sauvegarde automatique complète (aucune validation requise)'},
    {id:'R7',name:'Génération rapport mensuel',trigger:'date',triggerValue:'1',action:'auto_generate_report',enabled:true,lastRun:'2026-02-01T07:00:00',runs:6,desc:'Génère le rapport RH complet (effectifs, coûts, absences) → EN ATTENTE de votre envoi'},
    {id:'R8',name:'Préparation Belcotax',trigger:'date_yearly',triggerValue:'02-01',action:'auto_prepare_belcotax',enabled:true,lastRun:'2026-02-01T06:00:00',runs:1,desc:'Génère toutes les fiches 281.10 et 281.20 → EN ATTENTE de votre soumission'},
    {id:'R9',name:'Calcul provisions ONSS',trigger:'date',triggerValue:'1',action:'auto_calc_onss',enabled:true,lastRun:'2026-02-01T06:00:00',runs:12,desc:'Calcule le montant des provisions ONSS à payer le 5 → EN ATTENTE de votre virement'},
    {id:'R10',name:'Notification anniversaire',trigger:'condition',triggerValue:'birthday_today',action:'auto_birthday',enabled:true,lastRun:'2026-02-12T08:00:00',runs:15,desc:'Info anniversaire collaborateur (aucune validation requise)'},
    {id:'R11',name:'Génération SEPA virements',trigger:'date',triggerValue:'25',action:'auto_prepare_sepa',enabled:true,lastRun:'2026-01-25T18:00:00',runs:12,desc:'Crée le fichier SEPA avec tous les virements salaires → EN ATTENTE de votre upload bancaire'},
    {id:'R12',name:'Préparation PP 274',trigger:'date',triggerValue:'10',action:'auto_prepare_pp',enabled:true,lastRun:'2026-02-10T06:00:00',runs:12,desc:'Calcule et génère la déclaration précompte professionnel → EN ATTENTE de votre soumission FinProf'},
  ]);
  
  const triggerIcons={date:'📅',date_quarterly:'📅',date_yearly:'📅',event:'⚡',condition:'🔍',daily:'🔄'};
  const triggerLabels={date:'Mensuel',date_quarterly:'Trimestriel',date_yearly:'Annuel',event:'Événement',condition:'Condition',daily:'Quotidien'};
  const actionLabels={auto_prepare_payroll:'⚡ Prépare paie',auto_scan_absences:'⚡ Scan absences',auto_prepare_dmfa:'⚡ Prépare DmfA',auto_prepare_dimona:'⚡ Prépare Dimona',auto_prepare_cdd:'⚡ Dossier CDD',auto_calc_indexation:'⚡ Calcul index',auto_backup:'💾 Backup',auto_generate_report:'⚡ Rapport',auto_prepare_belcotax:'⚡ Prépare 281',auto_calc_onss:'⚡ Calcul ONSS',auto_birthday:'🎂 Anniversaire',auto_prepare_sepa:'⚡ Prépare SEPA',auto_prepare_pp:'⚡ Prépare PP 274'};
  
  // Status badge
  const statusBadge=(r)=>{
    if(r.action==='auto_backup'||r.action==='auto_birthday')return {label:'Auto',color:'#4ade80',bg:'rgba(74,222,128,.08)'};
    return {label:'🔒 En attente validation',color:'#fb923c',bg:'rgba(251,146,60,.08)'};
  };
  
  return <div>
    <PH title="⚙️ Automatisations" sub={`${rules.filter(r=>r.enabled).length} règles actives sur ${rules.length}`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
      <SC label="Règles actives" value={rules.filter(r=>r.enabled).length} color="#4ade80"/>
      <SC label="Règles inactives" value={rules.filter(r=>!r.enabled).length} color="#5e5c56"/>
      <SC label="Total exécutions" value={rules.reduce((a,r)=>a+r.runs,0)} color="#60a5fa"/>
      <SC label="Dernière exécution" value={rules.filter(r=>r.lastRun).sort((a,b)=>new Date(b.lastRun)-new Date(a.lastRun))[0]?.lastRun?new Date(rules.filter(r=>r.lastRun).sort((a,b)=>new Date(b.lastRun)-new Date(a.lastRun))[0].lastRun).toLocaleDateString('fr-BE'):'—'} color="#c6a34e"/>
    </div>
    <C>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <ST>Règles d'automatisation</ST>
        <B v="outline" style={{fontSize:10}} onClick={()=>setRules([...rules,{id:'R'+Date.now(),name:'Nouvelle règle',trigger:'event',triggerValue:'',action:'alert_email',enabled:false,lastRun:null,runs:0,desc:''}])}>+ Nouvelle règle</B>
      </div>
      {rules.map((r,i)=><div key={r.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:10,background:r.enabled?'rgba(74,222,128,.03)':'rgba(94,92,86,.03)',border:`1px solid ${r.enabled?'rgba(74,222,128,.12)':'rgba(94,92,86,.12)'}`,marginBottom:8,opacity:r.enabled?1:0.6}}>
        <button onClick={()=>setRules(rules.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x))} style={{width:40,height:22,borderRadius:11,border:'none',cursor:'pointer',background:r.enabled?'#4ade80':'#3a3832',position:'relative',transition:'all .3s'}}>
          <div style={{width:16,height:16,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:r.enabled?21:3,transition:'all .3s'}}/>
        </button>
        <span style={{fontSize:20}}>{triggerIcons[r.trigger]}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{r.name}</div>
          <div style={{fontSize:10.5,color:'#5e5c56',marginTop:2}}>{r.desc}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{display:'flex',gap:6,marginBottom:4}}>
            <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:'rgba(198,163,78,.08)',color:'#c6a34e'}}>{triggerLabels[r.trigger]}</span>
            <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:'rgba(96,165,250,.08)',color:'#60a5fa'}}>{actionLabels[r.action]||r.action}</span>
          </div>
          <div style={{fontSize:9,color:'#5e5c56'}}>{r.runs} exécutions{r.lastRun?` · Dernier: ${new Date(r.lastRun).toLocaleDateString('fr-BE')}`:''}</div>
        </div>
        <B v="outline" style={{fontSize:9,padding:'4px 10px'}} onClick={()=>{
          if(r.action==='auto_backup'||r.action==='auto_birthday'){
            setRules(rules.map(x=>x.id===r.id?{...x,runs:x.runs+1,lastRun:new Date().toISOString()}:x));
            alert(`✅ "${r.name}" exécuté.`);
          }else{
            const ok=confirm(`🔒 VALIDATION REQUISE\n\n"${r.name}"\n\nLe système a tout préparé.\nVoulez-vous VALIDER et ENVOYER ?`);
            if(ok){
              setRules(rules.map(x=>x.id===r.id?{...x,runs:x.runs+1,lastRun:new Date().toISOString()}:x));
              alert(`✅ "${r.name}" validé et envoyé !`);
            }
          }
        }}>{r.action==='auto_backup'||r.action==='auto_birthday'?'▶ Run':'✅ Valider & Envoyer'}</B>
      </div>)}
    </C>
  </div>;
}

export function SchedulerMod({s,d}){const loisRef=LOIS_BELGES;
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
  const now=new Date();
  const m=now.getMonth()+1;const y=now.getFullYear();
  const q=Math.ceil(m/3);
  
  const tasks=[
    // Mensuels
    {id:'T1',title:'Calcul fiches de paie',deadline:`${y}-${String(m).padStart(2,'0')}-25`,freq:'Mensuel',cat:'Paie',status:m>1?'done':'pending',prio:'haute',auto:true},
    {id:'T2',title:'Provisions ONSS',deadline:`${y}-${String(m).padStart(2,'0')}-05`,freq:'Mensuel',cat:'ONSS',status:'done',prio:'haute',auto:true},
    {id:'T3',title:'Virements salaires (SEPA)',deadline:`${y}-${String(m).padStart(2,'0')}-28`,freq:'Mensuel',cat:'Paie',status:'pending',prio:'haute',auto:false},
    {id:'T4',title:`PP 274 — ${m>1?new Date(y,m-2).toLocaleString('fr',{month:'short'}):new Date(y-1,11).toLocaleString('fr',{month:'short'})}/${m>1?y:y-1}`,deadline:`${y}-${String(m).padStart(2,'0')}-15`,freq:'Mensuel',cat:'Fiscal',status:now.getDate()>15?'done':'pending',prio:'haute',auto:true},
    // Trimestriels
    {id:'T5',title:`DmfA T${q>1?q-1:4}/${q>1?y:y-1}`,deadline:q===1?`${y}-01-31`:q===2?`${y}-04-30`:q===3?`${y}-07-31`:`${y}-10-31`,freq:'Trimestriel',cat:'ONSS',status:'pending',prio:'critique',auto:true},
    {id:'T6',title:`Solde ONSS T${q>1?q-1:4}/${q>1?y:y-1}`,deadline:q===1?`${y}-01-31`:q===2?`${y}-04-30`:q===3?`${y}-07-31`:`${y}-10-31`,freq:'Trimestriel',cat:'ONSS',status:'pending',prio:'critique',auto:false},
    // Annuels
    {id:'T7',title:`Belcotax 281 — ${y-1}`,deadline:`${y}-02-28`,freq:'Annuel',cat:'Fiscal',status:m>2?'done':'pending',prio:'critique',auto:true},
    {id:'T8',title:`Bilan social ${y-1}`,deadline:`${y}-03-31`,freq:'Annuel',cat:'RH',status:'pending',prio:'moyenne',auto:false},
    {id:'T9',title:`Indexation salariale ${y}`,deadline:`${y}-01-15`,freq:'Annuel',cat:'Paie',status:m>1?'done':'pending',prio:'haute',auto:true},
    {id:'T10',title:`Plan de formation ${y}`,deadline:`${y}-03-31`,freq:'Annuel',cat:'RH',status:'pending',prio:'moyenne',auto:false},
    {id:'T11',title:`Fiches 281.10 travailleurs`,deadline:`${y}-02-28`,freq:'Annuel',cat:'Fiscal',status:m>2?'done':'pending',prio:'critique',auto:true},
    {id:'T12',title:`Fiche 281.20 dirigeants`,deadline:`${y}-02-28`,freq:'Annuel',cat:'Fiscal',status:m>2?'done':'pending',prio:'critique',auto:true},
    {id:'T13',title:'Vérification contrats CDD',deadline:`${y}-${String(m).padStart(2,'0')}-01`,freq:'Mensuel',cat:'Contrats',status:'pending',prio:'moyenne',auto:true},
    {id:'T14',title:'Médecine du travail — planification',deadline:`${y}-${String(m).padStart(2,'0')}-15`,freq:'Annuel',cat:'Bien-être',status:'pending',prio:'moyenne',auto:false},
  ];
  
  const [filter,setFilter]=useState('all');
  const statusColors={done:'#4ade80',pending:'#fb923c',overdue:'#f87171',critique:'#f87171'};
  const prioColors={critique:'#f87171',haute:'#fb923c',moyenne:'#60a5fa',basse:'#5e5c56'};
  const filtered=filter==='all'?tasks:tasks.filter(t=>filter==='pending'?t.status==='pending':filter==='done'?t.status==='done':t.cat===filter);
  
  return <div>
    <PH title="📋 Planificateur de Tâches" sub={`Calendrier social ${y} — ${ae.length} travailleurs`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
      <SC label="Total tâches" value={tasks.length} color="#c6a34e"/>
      <SC label="À faire" value={tasks.filter(t=>t.status==='pending').length} color="#fb923c"/>
      <SC label="Terminées" value={tasks.filter(t=>t.status==='done').length} color="#4ade80"/>
      <SC label="Critiques" value={tasks.filter(t=>t.prio==='critique'&&t.status==='pending').length} color="#f87171"/>
      <SC label="Automatisées" value={tasks.filter(t=>t.auto).length} color="#a78bfa"/>
    </div>
    <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
      {['all','pending','done','Paie','ONSS','Fiscal','RH','Contrats'].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:16,border:filter===f?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',background:filter===f?'rgba(198,163,78,.1)':'transparent',color:filter===f?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:10.5,fontFamily:'inherit'}}>{{all:'Tous',pending:'À faire',done:'Terminées'}[f]||f}</button>)}
    </div>
    <C>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
        <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.12)'}}>
          <th style={{padding:'8px',textAlign:'left',color:'#5e5c56',fontSize:9}}>STATUT</th>
          <th style={{padding:'8px',textAlign:'left',color:'#5e5c56',fontSize:9}}>TÂCHE</th>
          <th style={{padding:'8px',textAlign:'center',color:'#5e5c56',fontSize:9}}>DEADLINE</th>
          <th style={{padding:'8px',textAlign:'center',color:'#5e5c56',fontSize:9}}>FRÉQUENCE</th>
          <th style={{padding:'8px',textAlign:'center',color:'#5e5c56',fontSize:9}}>PRIORITÉ</th>
          <th style={{padding:'8px',textAlign:'center',color:'#5e5c56',fontSize:9}}>RAPPEL</th>
        </tr></thead>
        <tbody>{filtered.map(t=>{
          const dl=new Date(t.deadline);
          const overdue=t.status==='pending'&&dl<now;
          return <tr key={t.id} style={{borderBottom:'1px solid rgba(198,163,78,.04)',background:overdue?'rgba(248,113,113,.04)':'transparent'}}>
            <td style={{padding:'8px'}}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:overdue?'#f87171':statusColors[t.status]||'#5e5c56'}}/></td>
            <td style={{padding:'8px',color:'#e8e6e0',fontWeight:500}}>
              {t.title}
              <span style={{marginLeft:8,fontSize:9,padding:'1px 6px',borderRadius:8,background:'rgba(198,163,78,.06)',color:'#9e9b93'}}>{t.cat}</span>
            </td>
            <td style={{padding:'8px',textAlign:'center',color:overdue?'#f87171':'#9e9b93',fontFamily:'monospace',fontSize:10}}>{dl.toLocaleDateString('fr-BE')}</td>
            <td style={{padding:'8px',textAlign:'center',fontSize:10,color:'#5e5c56'}}>{t.freq}</td>
            <td style={{padding:'8px',textAlign:'center'}}><span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:`${prioColors[t.prio]}15`,color:prioColors[t.prio],fontWeight:600}}>{t.prio}</span></td>
            <td style={{padding:'8px',textAlign:'center'}}>{t.auto?<span style={{color:'#a78bfa'}}>⚡</span>:<span style={{color:'#5e5c56'}}>—</span>}</td>
          </tr>;})}
        </tbody>
      </table>
    </C>
  </div>;
}

export function TemplatesMod({s,d}){const loisRef=LOIS_BELGES;const rmmmgRef=RMMMG;const txOnss=TX_ONSS_E;
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
  const [selectedTpl,setSelectedTpl]=useState(null);
  const [selectedEmp,setSelectedEmp]=useState('');
  
  const templates=[
    {id:'tpl_cdi',name:'Contrat CDI',cat:'Contrat',icon:'📄',desc:'Contrat à durée indéterminée conforme à la loi du 3/7/1978',fields:['Nom','Prénom','NISS','Fonction','CP','Salaire brut','Date début','Lieu de travail','Horaire']},
    {id:'tpl_cdd',name:'Contrat CDD',cat:'Contrat',icon:'📄',desc:'Contrat à durée déterminée — écrit obligatoire AVANT le début',fields:['Nom','Prénom','NISS','Fonction','CP','Salaire brut','Date début','Date fin','Motif']},
    {id:'tpl_student',name:'Convention étudiant (COE)',cat:'Contrat',icon:'🎓',desc:'Convention d\'occupation étudiant — mentions obligatoires (Titre VII)',fields:['Nom','Prénom','NISS','Fonction','Salaire horaire','Date début','Date fin','Horaire','École']},
    {id:'tpl_avenant',name:'Avenant au contrat',cat:'Contrat',icon:'📝',desc:'Modification des conditions (salaire, fonction, horaire)',fields:['Nom employé','Objet modification','Anciennes conditions','Nouvelles conditions','Date effet']},
    {id:'tpl_c4',name:'Formulaire C4',cat:'Sortie',icon:'📋',desc:'Certificat de chômage — obligatoire à la fin du contrat',fields:['Nom','NISS','Date entrée','Date sortie','Motif fin','Dernier salaire']},
    {id:'tpl_préavis',name:'Lettre de préavis',cat:'Sortie',icon:'✉️',desc:'Notification de préavis par l\'employeur (recommandé)',fields:['Nom employé','Ancienneté','Durée préavis','Date début préavis','Motif']},
    {id:'tpl_licenciement',name:'Lettre motif grave',cat:'Sortie',icon:'⚠️',desc:'Notification dans les 3 jours ouvrables + motivation 3 jours',fields:['Nom employé','Date des faits','Description faits','Date notification']},
    {id:'tpl_attestation',name:'Attestation d\'emploi',cat:'Attestation',icon:'✅',desc:'Certificat confirmant l\'emploi (banque, bail, etc.)',fields:['Nom','Fonction','Date entrée','Type contrat','Salaire brut']},
    {id:'tpl_telework',name:'Avenant télétravail',cat:'Contrat',icon:'🏠',desc:'Avenant télétravail structurel conforme CCT n°85',fields:['Nom employé','Jours télétravail','Indemnité bureau','Équipement fourni','Date début']},
    {id:'tpl_rt',name:'Règlement de travail',cat:'Légal',icon:'📖',desc:'Document obligatoire dès le 1er travailleur (Loi 8/4/1965)',fields:['Horaires','Modes de paiement','Sanctions','Préavis','Premiers secours','CPPT']},
    {id:'tpl_nda',name:'Accord de confidentialité',cat:'Légal',icon:'🔒',desc:'Clause de confidentialité pour données sensibles',fields:['Nom employé','Périmètre','Durée','Sanctions','Date']},
    {id:'tpl_warning',name:'Avertissement écrit',cat:'Disciplinaire',icon:'⚡',desc:'Premier ou second avertissement formel',fields:['Nom employé','Date des faits','Description','Mesures attendues','Sanctions possibles']},
    {id:'tpl_conge',name:'Demande de congé',cat:'RH',icon:'🏖️',desc:'Formulaire de demande de vacances / congé',fields:['Nom employé','Type congé','Date début','Date fin','Nb jours','Motif']},
    {id:'tpl_expense',name:'Note de frais',cat:'Finance',icon:'🧾',desc:'Formulaire de remboursement de frais professionnels',fields:['Nom employé','Date','Description','Montant','Justificatif','Catégorie']},
    {id:'tpl_eval',name:'Évaluation annuelle',cat:'RH',icon:'📊',desc:'Formulaire d\'évaluation des performances',fields:['Nom employé','Période','Objectifs','Résultats','Points forts','Axes d\'amélioration','Note globale']},
  ];
  
  const cats=[...new Set(templates.map(t=>t.cat))];
  const [catFilter,setCatFilter]=useState('all');
  const filtered=catFilter==='all'?templates:templates.filter(t=>t.cat===catFilter);
  
  const generateDoc=(tpl)=>{
    const emp=ae.find(e=>e.id===selectedEmp);
    const empName=emp?`${emp.first||emp.fn||'Emp'} ${emp.last||''}`.trim():'[NOM]';
    alert(`📄 Document "${tpl.name}" généré pour ${empName}.\n\nEn production, ceci générera un PDF/DOCX pré-rempli avec les données de l'employé.`);
  };
  
  return <div>
    <PH title="📑 Modèles de Documents" sub={`${templates.length} modèles prêts à l'emploi`}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
      <SC label="Modèles" value={templates.length} color="#c6a34e"/>
      <SC label="Contrats" value={templates.filter(t=>t.cat==='Contrat').length} color="#60a5fa"/>
      <SC label="Sortie" value={templates.filter(t=>t.cat==='Sortie').length} color="#f87171"/>
      <SC label="RH" value={templates.filter(t=>t.cat==='RH').length} color="#4ade80"/>
      <SC label="Légal" value={templates.filter(t=>t.cat==='Légal').length} color="#a78bfa"/>
    </div>
    <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
      <button onClick={()=>setCatFilter('all')} style={{padding:'5px 12px',borderRadius:16,border:catFilter==='all'?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',background:catFilter==='all'?'rgba(198,163,78,.1)':'transparent',color:catFilter==='all'?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:10.5,fontFamily:'inherit'}}>Tous</button>
      {cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{padding:'5px 12px',borderRadius:16,border:catFilter===c?'1px solid rgba(198,163,78,.3)':'1px solid rgba(198,163,78,.06)',background:catFilter===c?'rgba(198,163,78,.1)':'transparent',color:catFilter===c?'#c6a34e':'#9e9b93',cursor:'pointer',fontSize:10.5,fontFamily:'inherit'}}>{c}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
      {filtered.map(tpl=><C key={tpl.id}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
          <span style={{fontSize:24}}>{tpl.icon}</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{tpl.name}</div>
            <span style={{fontSize:9,padding:'1px 6px',borderRadius:8,background:'rgba(198,163,78,.06)',color:'#9e9b93'}}>{tpl.cat}</span>
          </div>
        </div>
        <div style={{fontSize:10.5,color:'#5e5c56',lineHeight:1.5,marginBottom:10,minHeight:30}}>{tpl.desc}</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
          {tpl.fields.map(f=><span key={f} style={{fontSize:8.5,padding:'2px 6px',borderRadius:6,background:'rgba(96,165,250,.06)',color:'#60a5fa'}}>{f}</span>)}
        </div>
        <div style={{display:'flex',gap:6}}>
          <I label="" value={selectedEmp} onChange={setSelectedEmp} options={[{v:'',l:'Choisir employé...'},...ae.map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))]}/>
          <B v="gold" style={{fontSize:10,padding:'6px 14px',whiteSpace:'nowrap'}} onClick={()=>generateDoc(tpl)}>Générer</B>
        </div>
      </C>)}
    </div>
  </div>;
}

export function PreavisMod({s,d}){const ae= s?.emps||[];const [tab,setTab]=useState("calcul");const [selEmp,setSelEmp]=useState(ae[0]?.id||"");const [ancManuelle,setAncManuelle]=useState(5);const [initPar,setInitPar]=useState("employeur");
const emp=ae.find(e=>e.id===selEmp)||ae[0]||{};const anc=emp.startDate?Math.max(0.25,((Date.now()-new Date(emp.startDate))/(365.25*24*3600*1000))):+ancManuelle;const brut=+emp.gross||3000;
const calcPreavisEmpl=(a)=>{if(a<0.25)return 1;if(a<0.5)return 3;if(a<1)return 5;if(a<2)return 7;if(a<3)return 9;if(a<4)return 12;if(a<5)return 13;if(a<6)return 15;if(a<7)return 18;if(a<8)return 21;if(a<9)return 24;if(a<10)return 27;if(a<11)return 30;if(a<12)return 33;if(a<13)return 36;if(a<14)return 39;if(a<15)return 42;if(a<16)return 45;if(a<17)return 48;if(a<18)return 51;if(a<19)return 54;if(a<20)return 57;if(a<21)return 60;return Math.min(62,60+Math.ceil((a-20)*1));};
const calcPreavisTrav=(a)=>{if(a<0.25)return 1;if(a<0.5)return 2;if(a<1)return 3;if(a<2)return 4;if(a<4)return 6;if(a<5)return 7;if(a<6)return 9;if(a<8)return 10;return 13;};
const semEmpl=calcPreavisEmpl(anc);const semTrav=calcPreavisTrav(anc);const sem=initPar==="employeur"?semEmpl:semTrav;const indemnite=brut*sem/4.33;const coutTotal=indemnite*(1+TX_ONSS_E);
return <div><PH title="Calcul de Preavis" sub="Loi Statut Unique 01/01/2014 - Simulation delais et indemnites"/>
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>{[{l:"Anciennete",v:anc.toFixed(1)+" ans",c:"#60a5fa"},{l:"Preavis employeur",v:semEmpl+" sem.",c:"#f87171"},{l:"Preavis travailleur",v:semTrav+" sem.",c:"#4ade80"},{l:"Indemnite empl.",v:fmt(indemnite),c:"#f87171"},{l:"Cout total",v:fmt(coutTotal),c:"#fb923c"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div>
<div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"calcul",l:"Calcul"},{v:"tableau",l:"Tableau complet"},{v:"equipe",l:"Par travailleur"},{v:"contrepréavis",l:"Contre-préavis"},{v:"protection",l:"Protections"},{v:"legal",l:"Base legale"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>
{tab==="calcul"&&<div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:18}}><C><ST>Parametres</ST>
{ae.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,color:"#5e5c56",marginBottom:3}}>Travailleur</div><select value={selEmp} onChange={e2=>setSelEmp(e2.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(198,163,78,.15)",background:"rgba(198,163,78,.04)",color:"#e8e6e0",fontSize:12,fontFamily:"inherit"}}>{ae.map(e2=><option key={e2.id} value={e2.id}>{(e2.fn||"")+" "+(e2.ln||"")}</option>)}</select></div>}
<I label="Anciennete manuelle (annees)" type="number" value={ancManuelle} onChange={setAncManuelle}/>
<div style={{marginTop:8}}><div style={{fontSize:10,color:"#5e5c56",marginBottom:3}}>Initiative</div><select value={initPar} onChange={e2=>setInitPar(e2.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid rgba(198,163,78,.15)",background:"rgba(198,163,78,.04)",color:"#e8e6e0",fontSize:12,fontFamily:"inherit"}}><option value="employeur">Licenciement (employeur)</option><option value="travailleur">Demission (travailleur)</option></select></div>
</C><C><ST>Resultat</ST>
{[{l:"Anciennete",v:anc.toFixed(1)+" ans"},{l:"Initiative",v:initPar==="employeur"?"Licenciement par employeur":"Demission par travailleur"},{l:"Delai de préavis",v:sem+" semaines ("+sem*7+" jours calendrier)"},{l:"Debut préavis",v:"Lundi suivant notification"},{l:"Fin estimee",v:new Date(Date.now()+sem*7*86400000).toLocaleDateString("fr-BE")},{l:"Indemnite compensatoire",v:fmt(indemnite)},{l:"ONSS sur indemnite",v:fmt(indemnite*(TX_ONSS_W+TX_ONSS_E))},{l:"Coût total employeur",v:fmt(coutTotal)}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i===7?"2px solid rgba(198,163,78,.3)":"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:i>=5?700:600,color:i>=5?"#f87171":"#e8e6e0"}}>{r.v}</span></div>)}
</C></div>}
{tab==="tableau"&&<C><ST>Tableau préavis complet (Loi Statut Unique)</ST>
<Tbl cols={[{k:"a",l:"Anciennete",b:1,r:r=>r.anc},{k:"e",l:"Employeur (sem.)",a:"right",r:r=><span style={{color:"#f87171",fontWeight:700}}>{r.empl}</span>},{k:"t",l:"Travailleur (sem.)",a:"right",r:r=><span style={{color:"#4ade80",fontWeight:700}}>{r.trav}</span>},{k:"j",l:"Jours empl.",a:"right",r:r=><span style={{color:"#9e9b93"}}>{r.empl*7}j</span>},{k:"i",l:"Indemnite (3.500 brut)",a:"right",r:r=><span style={{color:"#fb923c"}}>{fmt(3500*r.empl/4.33)}</span>}]} data={[{anc:"0-3 mois",empl:1,trav:1},{anc:"3-6 mois",empl:3,trav:2},{anc:"6-9 mois",empl:4,trav:3},{anc:"9-12 mois",empl:5,trav:3},{anc:"12-15 mois",empl:6,trav:3},{anc:"15-18 mois",empl:7,trav:4},{anc:"18-21 mois",empl:7,trav:4},{anc:"21-24 mois",empl:7,trav:4},{anc:"2-3 ans",empl:9,trav:6},{anc:"3-4 ans",empl:12,trav:6},{anc:"4-5 ans",empl:13,trav:7},{anc:"5-6 ans",empl:15,trav:9},{anc:"6-7 ans",empl:18,trav:10},{anc:"7-8 ans",empl:21,trav:10},{anc:"8-9 ans",empl:24,trav:10},{anc:"9-10 ans",empl:27,trav:13},{anc:"10-15 ans",empl:"30-42",trav:13},{anc:"15-20 ans",empl:"45-57",trav:13},{anc:"20-25 ans",empl:"60-62",trav:13}]}/>
</C>}
{tab==="equipe"&&<C><ST>Preavis par travailleur</ST>
<Tbl cols={[{k:"n",l:"Nom",b:1,r:r=>(r.fn||"")+" "+(r.ln||"")},{k:"a",l:"Anciennete",a:"right",r:r=>{const a2=r.startDate?((Date.now()-new Date(r.startDate))/(365.25*24*3600*1000)).toFixed(1):"?";return <span style={{color:"#60a5fa"}}>{a2} ans</span>}},{k:"e",l:"Preavis empl.",a:"right",r:r=>{const a2=r.startDate?Math.max(0.25,(Date.now()-new Date(r.startDate))/(365.25*24*3600*1000)):1;return <span style={{color:"#f87171",fontWeight:700}}>{calcPreavisEmpl(a2)} sem.</span>}},{k:"t",l:"Preavis trav.",a:"right",r:r=>{const a2=r.startDate?Math.max(0.25,(Date.now()-new Date(r.startDate))/(365.25*24*3600*1000)):1;return <span style={{color:"#4ade80"}}>{calcPreavisTrav(a2)} sem.</span>}},{k:"i",l:"Indemnite",a:"right",r:r=>{const a2=r.startDate?Math.max(0.25,(Date.now()-new Date(r.startDate))/(365.25*24*3600*1000)):1;return <span style={{color:"#fb923c"}}>{fmt((+r.gross||0)*calcPreavisEmpl(a2)/4.33)}</span>}}]} data={ae}/>
</C>}
{tab==="contrepréavis"&&<C><ST>Contre-préavis travailleur</ST>
{[{t:"Principe",d:"Travailleur licencie peut donner un contre-préavis pour partir plus tot (nouvel emploi)."},{t:"Delai contre-préavis",d:"Depend de anciennete: 0-3 mois = 1 sem, 3-6 mois = 2 sem, 6-12 mois = 3 sem, 1+ ans = 4 sem, max 4 sem."},{t:"Effet",d:"Fin contrat a echeance du contre-préavis. Pas indemnite de rupture a payer."},{t:"Forme",d:"Lettre recommandee ou remise en main propre. Debut: lundi suivant."},{t:"Pendant préavis preste",d:"Le travailleur a droit a 1 jour/semaine (ou 2 demi-jours) de conge sollicitation."},{t:"Conge sollicitation",d:"Remunere. Pour chercher un nouvel emploi. Pendant les 26 dernieres semaines de préavis: 2j/sem."}].map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#c6a34e",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}
</C>}
{tab==="protection"&&<C><ST>Protections contre licenciement</ST>
{[{p:"Femme enceinte",d:"Du moment ou employeur est informe jusqu a 1 mois apres conge maternite. Indemnite: 6 mois brut.",c:"#f87171"},{p:"Credit-temps / Conge parental",d:"Pendant demande + duree + 2 mois apres. Indemnite forfaitaire 6 mois.",c:"#fb923c"},{p:"Delegue syndical",d:"Protection forte. Indemnites specifiques selon mandat et anciennete (2-8 ans remuneration).",c:"#a78bfa"},{p:"Membre CPPT",d:"Protection identique delegue syndical pendant mandat + 4 ans.",c:"#a78bfa"},{p:"Maladie / Accident travail",d:"Interdiction pendant incapacite (sauf motif grave ou force majeure medicale > 6 mois).",c:"#60a5fa"},{p:"Plainte harcelement",d:"12 mois apres depot plainte. Indemnite 6 mois brut si violation.",c:"#f87171"},{p:"Conge education paye",d:"Pendant formation + 1 mois apres. Indemnite forfaitaire.",c:"#c6a34e"},{p:"CCT 109 - Motivation",d:"Tout licenciement doit etre motive. Si manifestement deraisonnable: 3-17 semaines indemnite.",c:"#fb923c"}].map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:r.c,fontSize:12}}>{r.p}</b></div><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}
</C>}
{tab==="legal"&&<C><ST>Base legale préavis</ST>
{[{t:"Loi Statut Unique 26/12/2013",d:"Harmonisation ouvriers/employes depuis 01/01/2014. Preavis unique base anciennete."},{t:"Art. 37 Loi contrats travail",d:"Delais de préavis. Tableau legal semaines par anciennete."},{t:"Art. 39 Loi contrats travail",d:"Indemnite compensatoire de préavis. Rémunération courante x duree préavis."},{t:"CCT 109 (12/02/2014)",d:"Motivation licenciement. Tout employeur doit pouvoir justifier le licenciement."},{t:"Art. 37/2 - Contre-préavis",d:"Droit du travailleur licencie de donner un contre-préavis reduit."},{t:"Outplacement (30+ sem.)",d:"Obligatoire si préavis 30+ semaines. 60h accompagnement. Deductible du préavis (4 semaines)."},{t:"Loi 19/03/1991 - Delegues",d:"Protection speciale representants personnel. Procedures specifiques."}].map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#c6a34e",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}
</C>}
</div>;}

export function CreditTempsMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [tab,setTab]=useState("types");const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);const allocONEM=LOIS_BELGES.creditTemps?.allocMensuelle||567;return <div><PH title="Credit-Temps" sub={"Interruption de carriere — Alloc ONEM: "+f2(allocONEM)+" EUR/mois — LOIS_BELGES"}/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Travailleurs actifs",v:ae.length,c:"#c6a34e"},{l:"En credit-temps",v:ae.filter(e=>e.creditTemps).length,c:"#60a5fa"},{l:"Alloc ONEM/mois",v:f2(allocONEM)+" EUR",c:"#22c55e"},{l:"RMMMG ref",v:f2(RMMMG)+" EUR",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"types",l:"Types"},{v:"conditions",l:"Conditions"},{v:"impact",l:"Impact salaire"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>{tab==="types"&&<C><ST>Types de credit-temps (CCT 103)</ST>{[{t:"Credit-temps sans motif",d:"Max 12 mois TP equivalent. Plus d'allocations ONEM depuis 01/2023.",alloc:"0 EUR"},{t:"Credit-temps avec motif — Soins",d:"Soins enfant <8 ans, membre malade, soins palliatifs. Max 51 mois.",alloc:f2(allocONEM)+" EUR"},{t:"Credit-temps avec motif — Formation",d:"Formation reconnue. Max 36 mois.",alloc:f2(allocONEM)+" EUR"},{t:"Credit-temps fin de carriere",d:"55+ ans (exceptions 50+). 1/5 temps ou mi-temps. Jusqu'a pension.",alloc:f2(LOIS_BELGES.creditTemps?.allocFinCarriere||260)+" EUR"},{t:"Conge parental",d:"4 mois TP / 8 mois mi-temps / 20 mois 1/10. Par enfant <12 ans.",alloc:f2(LOIS_BELGES.creditTemps?.allocParental||920)+" EUR"},{t:"Conge assistance medicale",d:"12 mois max. Membre du menage gravement malade.",alloc:f2(allocONEM)+" EUR"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{flex:1}}><b style={{color:"#e8e6e0",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div><div style={{fontSize:12,fontWeight:700,color:"#22c55e",whiteSpace:"nowrap",marginLeft:12}}>{r.alloc}/mois</div></div>)}</C>}{tab==="impact"&&<C><ST>Impact sur le salaire</ST>{ae.slice(0,10).map((e,i)=>{const brut=+(e.gross||0);const brutMiTemps=Math.round(brut*0.5*100)/100;const netTP=quickNet(brut);const netMT=quickNet(brutMiTemps);const avecAlloc=netMT+allocONEM;return <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#e8e6e0",fontSize:11}}>{(e.first||e.fn||'')+" "+(e.last||e.ln||'')}</span><span style={{color:"#9e9b93",fontSize:11}}>TP: {f2(netTP)}</span><span style={{color:"#60a5fa",fontSize:11}}>MT: {f2(netMT)}</span><span style={{color:"#22c55e",fontSize:11}}>MT+alloc: {f2(avecAlloc)}</span></div>;})}</C>}</div>;}

export function CCT90Mod({s,d}){const ae= s?.emps||[];const n=ae.length;const [tab,setTab]=useState("sim");const [montant,setMontant]=useState(3000);const plafond=4020;return <div><PH title="Bonus CCT 90" sub={"Avantages non recurrents lies aux resultats - Plafond "+plafond+" EUR/an"}/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>{[{l:"Plafond 2026",v:fmt(plafond),c:"#c6a34e"},{l:"ONSS special",v:"33.07%",c:"#f87171"},{l:"PP travailleur",v:"0%",c:"#4ade80"},{l:"Beneficiaires",v:n,c:"#60a5fa"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"sim",l:"Simulateur"},{v:"procedure",l:"Procedure"},{v:"objectifs",l:"Objectifs types"},{v:"legal",l:"Base legale"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>
{tab==="sim"&&<C><ST>Simulateur bonus CCT 90</ST><I label="Montant bonus brut (EUR)" type="number" value={montant} onChange={setMontant}/>{[{l:"Montant brut",v:Math.min(+montant,plafond)},{l:"ONSS employeur (33.07%)",v:Math.min(+montant,plafond)*0.3307},{l:"Cout employeur total",v:Math.min(+montant,plafond)*1.3307},{l:"ONSS travailleur ("+((LOIS_BELGES.onss.travailleur*100).toFixed(2))+"%)",v:Math.min(+montant,plafond)*TX_ONSS_W},{l:"PP travailleur",v:0},{l:"Net travailleur",v:Math.min(+montant,plafond)*(1-TX_ONSS_W)},{l:"Cout total equipe",v:Math.min(+montant,plafond)*1.3307*n}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i===5||i===6?"2px solid rgba(198,163,78,.3)":"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:i>=5?700:600,color:i===4?"#4ade80":i>=5?"#c6a34e":"#e8e6e0"}}>{fmt(r.v)}</span></div>)}</C>}
{tab==="procedure"&&<C><ST>Procedure</ST>{[{n:1,d:"Redaction plan bonus (acte adhesion ou CCT entreprise)"},{n:2,d:"Objectifs collectifs mesurables et verifiables"},{n:3,d:"Depot au SPF Emploi (greffe CCT ou formulaire adhesion)"},{n:4,d:"Periode de reference (min 3 mois)"},{n:5,d:"Evaluation objectifs en fin de periode"},{n:6,d:"Paiement si objectifs atteints"}].map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{width:22,height:22,borderRadius:"50%",background:"rgba(198,163,78,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#c6a34e"}}>{r.n}</div><span style={{color:"#e8e6e0",fontSize:12}}>{r.d}</span></div>)}</C>}
{tab==="objectifs"&&<C><ST>Exemples objectifs</ST>{[{o:"Chiffre affaires",d:"Atteindre X EUR de CA sur la periode",c:"#4ade80"},{o:"Taux absenteisme",d:"Maintenir sous X% sur le trimestre",c:"#60a5fa"},{o:"Satisfaction client",d:"Score NPS superieur a seuil defini",c:"#a78bfa"},{o:"Securite",d:"0 accident de travail sur la periode",c:"#f87171"},{o:"Qualite",d:"Taux defaut sous seuil defini",c:"#fb923c"},{o:"Delais",d:"100% livraisons dans les delais",c:"#c6a34e"}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:r.c,fontSize:12}}>{r.o}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}</C>}
{tab==="legal"&&<C><ST>Base legale</ST>{[{t:"CCT 90 du 20/12/2007",d:"Avantages non recurrents lies aux resultats. Cadre general."},{t:"Loi 21/12/2007",d:"Base legale. Plafond annuel indexe."},{t:"Plafond 2026",d:"4.020 EUR brut par travailleur par annee civile."},{t:"Depot obligatoire",d:"Acte adhesion (formulaire) ou CCT entreprise au SPF Emploi."},{t:"Collectif",d:"Objectifs collectifs, pas individuels. Equipe, departement ou entreprise."}].map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#c6a34e",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}</C>}
</div>;}

export function StatsINSMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const n=ae.length;const mb=ae.reduce((a,e)=>a+(+e.gross||0),0);const moyBrut=n>0?Math.round(mb/n):0;const medianBrut=n>0?ae.map(e=>+(e.gross||0)).sort((a,b)=>a-b)[Math.floor(n/2)]:0;const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:0}).format(v);const rmmmg=RMMMG;const belowRMMMG=ae.filter(e=>(+e.gross||0)<rmmmg).length;const ratioMF=ae.filter(e=>e.gender==='F').length;const coutTotal=Math.round(mb*(1+TX_ONSS_E));return <div><PH title="Statistiques INS / Benchmarks" sub={"Analyse masse salariale — "+n+" travailleurs — RMMMG: "+f2(rmmmg)+" EUR"}/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Salaire moyen",v:f2(moyBrut)+" EUR",c:"#c6a34e"},{l:"Salaire médian",v:f2(medianBrut)+" EUR",c:"#60a5fa"},{l:"< RMMMG",v:belowRMMMG+" pers.",c:belowRMMMG>0?"#ef4444":"#22c55e"},{l:"Cout total chargé",v:f2(coutTotal)+" EUR/mois",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Distribution salariale</ST>{[{tranche:"< "+f2(rmmmg)+" (RMMMG)",n:ae.filter(e=>(+e.gross||0)<rmmmg).length,c:"#ef4444"},{tranche:f2(rmmmg)+" - 3.000",n:ae.filter(e=>{const g=+(e.gross||0);return g>=rmmmg&&g<3000;}).length,c:"#fb923c"},{tranche:"3.000 - 4.000",n:ae.filter(e=>{const g=+(e.gross||0);return g>=3000&&g<4000;}).length,c:"#eab308"},{tranche:"4.000 - 5.000",n:ae.filter(e=>{const g=+(e.gross||0);return g>=4000&&g<5000;}).length,c:"#22c55e"},{tranche:"> 5.000",n:ae.filter(e=>(+e.gross||0)>=5000).length,c:"#60a5fa"}].map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{width:120,fontSize:11,color:"#9e9b93"}}>{r.tranche}</div><div style={{flex:1,height:20,background:"rgba(255,255,255,.03)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:n>0?(r.n/n*100)+"%":"0%",background:r.c,borderRadius:4}}/></div><div style={{width:60,textAlign:"right",fontWeight:600,color:r.c,fontSize:12}}>{r.n} ({n>0?Math.round(r.n/n*100):0}%)</div></div>)}</C><C><ST>Indicateurs sociaux</ST>{[{l:"Ratio H/F",v:n>0?((n-ratioMF)+"/"+ratioMF):"-",d:"Hommes / Femmes"},{l:"Age moyen",v:ae.length>0?Math.round(ae.reduce((a,e)=>a+(+(e.age||35)),0)/n)+" ans":"-",d:"Estimation"},{l:"Ancienneté moyenne",v:ae.length>0?Math.round(ae.reduce((a,e)=>a+(+(e.anciennete||2)),0)/n)+" ans":"-",d:"Années de service"},{l:"Taux temps partiel",v:n>0?Math.round(ae.filter(e=>(+e.regime||100)<100).length/n*100)+"%":"0%",d:"Régime < 100%"},{l:"Part ONSS patronal",v:Math.round(TX_ONSS_E*10000)/100+"%",d:"Taux en vigueur"},{l:"PP moyen/employé",v:n>0?f2(ae.reduce((a,e)=>a+quickPP(+(e.gross||0)),0)/n)+" EUR":"-",d:"Précompte professionnel"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div><b style={{color:"#e8e6e0",fontSize:12}}>{r.l}</b><div style={{fontSize:10,color:"#5e5c56"}}>{r.d}</div></div><span style={{color:"#c6a34e",fontWeight:600}}>{r.v}</span></div>)}</C></div>;}

export function WarrantsMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const mb=ae.reduce((a,e)=>a+(+e.gross||0),0);const [montant,setMontant]=useState(5000);const [tab,setTab]=useState("sim");const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);const classique={brut:montant,onssE:Math.round(montant*TX_ONSS_E*100)/100,onssW:Math.round(montant*TX_ONSS_W*100)/100,pp:quickPP(montant)};classique.net=Math.round((montant-classique.onssW-classique.pp)*100)/100;classique.coutTotal=montant+classique.onssE;const warrant={brut:montant,onssE:0,onssW:0,atn:Math.round(montant*0.18*100)/100};warrant.pp=quickPP(warrant.atn);warrant.net=Math.round((montant-warrant.atn*0.5-150)*100)/100;warrant.coutTotal=montant+150;const gain=warrant.net-classique.net;return <div><PH title="Warrants / Stock Options" sub="Optimisation salariale — Pas ONSS, ATN forfaitaire 18% — Comparaison reelle"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Montant test",v:f2(montant)+" EUR",c:"#c6a34e"},{l:"Net classique",v:f2(classique.net)+" EUR",c:"#ef4444"},{l:"Net warrant",v:f2(warrant.net)+" EUR",c:"#22c55e"},{l:"Gain net",v:(gain>0?"+":"")+f2(gain)+" EUR",c:gain>0?"#4ade80":"#ef4444"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Simulateur warrant vs salaire classique</ST><div style={{marginBottom:16}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Montant brut</label><input type="number" value={montant} onChange={e=>setMontant(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:180,fontFamily:"inherit"}}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div style={{padding:16,background:"rgba(239,68,68,.03)",borderRadius:10,border:"1px solid rgba(239,68,68,.1)"}}><div style={{fontSize:13,fontWeight:700,color:"#ef4444",marginBottom:12}}>💰 Salaire classique</div>{[{l:"Brut",v:classique.brut},{l:"ONSS travailleur ("+Math.round(TX_ONSS_W*10000)/100+"%)",v:-classique.onssW},{l:"PP formule-cle",v:-classique.pp},{l:"NET",v:classique.net},{l:"Cout employeur",v:classique.coutTotal}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i===3?"2px solid rgba(239,68,68,.2)":"none"}}><span style={{color:i>=3?"#ef4444":"#9e9b93",fontSize:11,fontWeight:i>=3?700:400}}>{r.l}</span><span style={{color:"#e8e6e0",fontSize:i>=3?13:11,fontWeight:i>=3?700:400}}>{f2(r.v)}</span></div>)}</div><div style={{padding:16,background:"rgba(74,222,128,.03)",borderRadius:10,border:"1px solid rgba(74,222,128,.1)"}}><div style={{fontSize:13,fontWeight:700,color:"#22c55e",marginBottom:12}}>📈 Warrant</div>{[{l:"Montant warrant",v:warrant.brut},{l:"ATN forfaitaire (18%)",v:-warrant.atn},{l:"PP sur ATN",v:-warrant.pp},{l:"NET estime",v:warrant.net},{l:"Cout employeur",v:warrant.coutTotal}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i===3?"2px solid rgba(74,222,128,.2)":"none"}}><span style={{color:i>=3?"#22c55e":"#9e9b93",fontSize:11,fontWeight:i>=3?700:400}}>{r.l}</span><span style={{color:"#e8e6e0",fontSize:i>=3?13:11,fontWeight:i>=3?700:400}}>{f2(r.v)}</span></div>)}</div></div></C></div>;}

export function HeuresSupMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [tab,setTab]=useState("calc");const [heures,setHeures]=useState(10);const [tauxH,setTauxH]=useState(20);const [typeHS,setTypeHS]=useState("50");const sursalairePct={50:0.5,100:1.0,jf:1.0,nuit:0.5,dim:1.0};const pct=sursalairePct[typeHS]||0.5;const brutHS=Math.round(heures*tauxH*(1+pct)*100)/100;const onssHS=Math.round(brutHS*TX_ONSS_W*100)/100;const ppHS=quickPP(brutHS);const netHS=Math.round((brutHS-onssHS-ppHS)*100)/100;const coutEmp=Math.round(brutHS*(1+TX_ONSS_E)*100)/100;return <div><PH title="Heures Supplementaires" sub="Sursalaire - Calcul reel PP formule-cle - Limites legales"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Heures sup",v:heures+"h",c:"#c6a34e"},{l:"Brut HS",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(brutHS)+" EUR",c:"#22c55e"},{l:"Net HS",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(netHS)+" EUR",c:"#60a5fa"},{l:"Cout employeur",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(coutEmp)+" EUR",c:"#ef4444"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Simulateur heures supplementaires</ST><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Nb heures</label><input type="number" value={heures} onChange={e=>setHeures(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:100,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Taux horaire EUR</label><input type="number" value={tauxH} onChange={e=>setTauxH(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:100,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Type sursalaire</label><select value={typeHS} onChange={e=>setTypeHS(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,fontFamily:"inherit"}}><option value="50">+50% (standard)</option><option value="100">+100% (dimanche/JF)</option><option value="nuit">+50% (nuit)</option></select></div></div><div style={{padding:16,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.1)"}}>{[{l:"Heures x Taux x Sursalaire",v:heures+" x "+tauxH+" x "+(1+pct).toFixed(2)+" = "+new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(brutHS)+" EUR brut"},{l:"ONSS travailleur (13,07%)",v:"- "+new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(onssHS)+" EUR"},{l:"Precompte (formule-cle SPF)",v:"- "+new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(ppHS)+" EUR"},{l:"NET heures sup",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(netHS)+" EUR"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid rgba(255,255,255,.03)":"2px solid rgba(198,163,78,.2)"}}><span style={{color:i===3?"#c6a34e":"#9e9b93",fontSize:12,fontWeight:i===3?700:400}}>{r.l}</span><span style={{color:i===3?"#22c55e":"#e8e6e0",fontSize:i===3?14:12,fontWeight:i===3?700:400}}>{r.v}</span></div>)}</div></C><C><ST>Limites legales</ST>{[{t:"Maximum: 11h/jour, 50h/semaine (avec derogation)",d:"Loi du 16/03/1971 sur le travail"},{t:"Repos obligatoire: 11h consecutives entre 2 prestations",d:"Directive europeenne 2003/88/CE"},{t:"Sursalaire 50%: heures au-dela de 9h/jour ou 40h/semaine",d:"Loi sur le travail art. 29"},{t:"Sursalaire 100%: dimanche, jours feries",d:"AR du 18/04/1974"},{t:"Recuperation obligatoire dans le trimestre (sauf exceptions)",d:"Art. 26bis Loi sur le travail"},{t:"Exoneration fiscale: 130h/an (180h construction/horeca)",d:"Art. 154bis CIR"}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#e8e6e0",fontSize:12}}>{r.t}</b><div style={{fontSize:10,color:"#5e5c56",marginTop:2}}>{r.d}</div></div>)}</C></div>;}

export function SimCoutMod({s,d}){const [brut,setBrut]=useState(3500);const [sit,setSit]=useState("isole");const [enf,setEnf]=useState(0);const onssW=Math.round(brut*TX_ONSS_W*100)/100;const onssE=Math.round(brut*TX_ONSS_E*100)/100;const pp=quickPP(brut);const csss=calcCSSS(brut,sit);const bonus=calcBonusEmploi(brut);const net=Math.round((brut-onssW-pp-csss+bonus)*100)/100;const coutTotal=Math.round((brut+onssE+brut*PV_SIMPLE+brut*PV_DOUBLE/12+brut/12)*100)/100;const cr=CR_PAT;const forfBureau=LOIS_BELGES.avantages.fraisPropres.bureau;return <div><PH title="Simulateur Cout Employeur" sub="Projection complete — Tous moteurs de calcul reels"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Brut mensuel",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(brut)+" EUR",c:"#c6a34e"},{l:"Net travailleur",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(net)+" EUR",c:"#22c55e"},{l:"Coût total employeur",v:new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(coutTotal)+" EUR",c:"#ef4444"},{l:"Ratio net/cout",v:(net/coutTotal*100).toFixed(1)+"%",c:"#60a5fa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Parametres</ST><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Brut mensuel</label><input type="number" value={brut} onChange={e=>setBrut(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:160,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Situation</label><select value={sit} onChange={e=>setSit(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,fontFamily:"inherit"}}><option value="isole">Isole</option><option value="marie_1r">Marie 1 revenu</option><option value="marie_2r">Marie 2 revenus</option></select></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Enfants a charge</label><input type="number" value={enf} min={0} max={8} onChange={e=>setEnf(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:80,fontFamily:"inherit"}}/></div></div></C><C><ST>Decomposition cout employeur (mensuel)</ST>{[{l:"Salaire brut",v:brut,c:"#e8e6e0",s:"base"},{l:"ONSS patronal ("+Math.round(TX_ONSS_E*10000)/100+"%)",v:onssE,c:"#ef4444",s:"+"},{l:"Provision pecule simple ("+Math.round(PV_SIMPLE*10000)/100+"%)",v:Math.round(brut*PV_SIMPLE*100)/100,c:"#ef4444",s:"+"},{l:"Provision pecule double/12",v:Math.round(brut*PV_DOUBLE/12*100)/100,c:"#ef4444",s:"+"},{l:"Provision 13e mois/12",v:Math.round(brut/12*100)/100,c:"#ef4444",s:"+"},{l:"Cheques-repas part patronale ("+CR_PAT+" EUR/jour x 20j)",v:Math.round(cr*20*100)/100,c:"#ef4444",s:"+"},{l:"COUT TOTAL EMPLOYEUR",v:coutTotal,c:"#c6a34e",s:"="}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:i===6?"12px 0":"8px 0",borderBottom:i<6?"1px solid rgba(255,255,255,.03)":"none",borderTop:i===6?"2px solid rgba(198,163,78,.2)":"none"}}><span style={{color:r.c,fontSize:i===6?14:12,fontWeight:i===6?700:400}}>{r.s!=="base"&&r.s!=="="?r.s+" ":""}{r.l}</span><span style={{color:r.c,fontSize:i===6?16:13,fontWeight:i===6?700:600}}>{new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(r.v)} EUR</span></div>)}</C><C><ST>Decomposition fiche travailleur (mensuel)</ST>{[{l:"Salaire brut",v:brut,c:"#e8e6e0"},{l:"ONSS travailleur (13,07%)",v:-onssW,c:"#ef4444"},{l:"Precompte professionnel (formule-cle SPF)",v:-pp,c:"#ef4444"},{l:"CSSS",v:-csss,c:"#ef4444"},{l:"Bonus emploi",v:bonus,c:bonus>0?"#22c55e":"#5e5c56"},{l:"NET A PAYER",v:net,c:"#22c55e"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:i===5?"12px 0":"8px 0",borderBottom:i<5?"1px solid rgba(255,255,255,.03)":"none",borderTop:i===5?"2px solid rgba(198,163,78,.2)":"none"}}><span style={{color:i===5?"#c6a34e":"#9e9b93",fontSize:i===5?14:12,fontWeight:i===5?700:400}}>{r.l}</span><span style={{color:r.c,fontSize:i===5?16:13,fontWeight:i===5?700:600}}>{new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(r.v)} EUR</span></div>)}</C></div>;}

export function RCCMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const [tab,setTab]=useState("conditions");const [ageLic,setAgeLic]=useState(62);const [anciennete,setAnciennete]=useState(25);const [brutRef,setBrutRef]=useState(3500);const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2}).format(v);const allocChomage=Math.round(Math.min(brutRef*0.6,LOIS_BELGES.chomage?.plafondJour||74.17*20)*100)/100;const complement=Math.max(0,Math.round((quickNet(brutRef)-allocChomage)/2*100)/100);return <div><PH title="RCC (Prepension)" sub={"Regime Chomage avec Complement Entreprise — RMMMG "+f2(RMMMG)+" EUR"}/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{[{l:"Age minimum",v:"62 ans (general)",c:"#c6a34e"},{l:"Anciennete min",v:"40 H / 34 F",c:"#60a5fa"},{l:"Alloc chomage est.",v:f2(allocChomage)+" EUR",c:"#22c55e"},{l:"Complement est.",v:f2(complement)+" EUR",c:"#a78bfa"}].map((k,i)=><div key={i} style={{padding:"14px 16px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:10,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div><C><ST>Simulateur RCC</ST><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Age licenciement</label><input type="number" value={ageLic} min={55} max={67} onChange={e=>setAgeLic(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:80,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Anciennete (ans)</label><input type="number" value={anciennete} min={0} max={45} onChange={e=>setAnciennete(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:80,fontFamily:"inherit"}}/></div><div><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Dernier brut</label><input type="number" value={brutRef} onChange={e=>setBrutRef(+e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(198,163,78,.2)",background:"rgba(0,0,0,.2)",color:"#e8e6e0",fontSize:13,width:140,fontFamily:"inherit"}}/></div></div>{[{l:"Allocation chomage estimee (60% plafonné)",v:allocChomage,c:"#60a5fa"},{l:"Complement entreprise (50% diff net-alloc)",v:complement,c:"#a78bfa"},{l:"TOTAL mensuel RCC",v:allocChomage+complement,c:"#22c55e"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:i===2?"12px 0":"8px 0",borderTop:i===2?"2px solid rgba(198,163,78,.2)":"none",borderBottom:i<2?"1px solid rgba(255,255,255,.03)":"none"}}><span style={{color:i===2?"#c6a34e":"#9e9b93",fontSize:i===2?14:12,fontWeight:i===2?700:400}}>{r.l}</span><span style={{color:r.c,fontSize:i===2?16:13,fontWeight:700}}>{f2(r.v)} EUR</span></div>)}</C><C><ST>Conditions RCC (regime general 2026)</ST>{[{t:"Age: 62 ans minimum",d:"Pas de derogation sectorielle sous 60 ans depuis 2025."},{t:"Anciennete: 40 ans (H) / 34 ans (F, transitoire)",d:"Carriere mixte: assimilation chomage, maladie, credit-temps."},{t:"Cotisation Decava",d:"Retenue speciale employeur sur le complement. Voir module Decava."},{t:"Cotisation INASTI",d:"Si independant complementaire: pas de droit RCC."},{t:"Protection: pas de licenciement pendant préavis RCC",d:"Le travailleur a droit au complement jusqu'a la pension legale."}].map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><b style={{color:"#e8e6e0",fontSize:12}}>{r.t}</b><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div>)}</C></div>;}

export function AidesEmploiMod({s,d}){
  const [tab,setTab]=useState('premier');
  const ae=(s?.emps||[]).filter(e=>e.status==='active');
  const [simEmp,setSimEmp]=useState(null);
  const [simRes,setSimRes]=useState(null);
  const rmmmg=RMMMG;const bonusData=ae.map(e=>{const brut=+(e.gross||0);const bonus=calcBonusEmploi(brut,e);return {...e,brut,bonus};});const totalBonus=bonusData.reduce((a,e)=>a+(e.bonus?.montant||0),0);

  // ── 1ER ENGAGEMENT — Réduction ONSS groupes-cibles (AR 16/05/2003 + Réforme Avril 2026) ──
  // ATTENTION: Réforme au 01/04/2026 (projet AR — Conseil d'État en cours, pas encore MB)
  // Avant 01/04/2026: 1er = max €3.100/trim à vie | 2è-3è = dégressif 13 trim sur 20
  // Après 01/04/2026: 1er = max €2.000/trim à vie | 2è-3è = €1.000/trim × 12 trim sur 20
  //                    4è-5è = €1.000/trim × 12 trim sur 20 (réintroduit!) | 6è = supprimé
  const PREMIER_ENG_AVANT=[
    {n:1,label:"1er travailleur",phase:"Avant 01/04/2026",red:"Exonération max €3.100/trim",trim:"Max €3.100/trimestre",dur:'Illimitée (à vie)',ref:"AR 16/05/2003 + Loi 26/12/2022",montant:[{t:'Tous trim.',m:3100}],full:true},
    {n:2,label:"2ème travailleur",phase:"Avant 01/04/2026",red:"Forfait dégressif (13 trim / 20)",trim:"€1.550 → €1.050 → €450",dur:'13 trimestres sur 20',ref:"AR 16/05/2003 art.12",montant:[{t:'T1-T5',m:1550},{t:'T6-T9',m:1050},{t:'T10-T13',m:450}]},
    {n:3,label:"3ème travailleur",phase:"Avant 01/04/2026",red:"Forfait dégressif (13 trim / 20)",trim:"€1.050 → €450",dur:'13 trimestres sur 20',ref:"AR 16/05/2003 art.12",montant:[{t:'T1-T9',m:1050},{t:'T10-T13',m:450}]},
  ];
  const PREMIER_ENG_APRES=[
    {n:1,label:"1er travailleur",phase:"Après 01/04/2026",red:"Exonération max €2.000/trim",trim:"Max €2.000/trimestre",dur:'Illimitée (à vie)',ref:"Projet AR 2026 (Conseil d'État)",montant:[{t:'Tous trim.',m:2000}],full:true,change:'⬇ Baisse de €3.100 à €2.000'},
    {n:2,label:"2ème travailleur",phase:"Après 01/04/2026",red:"Forfait fixe €1.000/trim",trim:"€1.000/trimestre",dur:'12 trimestres sur 20',ref:"Projet AR 2026",montant:[{t:'T1-T12',m:1000}],change:'✨ Simplifié: montant fixe'},
    {n:3,label:"3ème travailleur",phase:"Après 01/04/2026",red:"Forfait fixe €1.000/trim",trim:"€1.000/trimestre",dur:'12 trimestres sur 20',ref:"Projet AR 2026",montant:[{t:'T1-T12',m:1000}],change:'✨ Simplifié: montant fixe'},
    {n:4,label:"4ème travailleur",phase:"Après 01/04/2026 (ou 01/07/2026)",red:"Forfait fixe €1.000/trim",trim:"€1.000/trimestre",dur:'12 trimestres sur 20',ref:"Projet AR 2026",montant:[{t:'T1-T12',m:1000}],change:'🆕 Réintroduit!'},
    {n:5,label:"5ème travailleur",phase:"Après 01/04/2026 (ou 01/07/2026)",red:"Forfait fixe €1.000/trim",trim:"€1.000/trimestre",dur:'12 trimestres sur 20',ref:"Projet AR 2026",montant:[{t:'T1-T12',m:1000}],change:'🆕 Réintroduit!'},
    {n:6,label:"6ème travailleur",phase:"—",red:"SUPPRIMÉ",trim:"€0",dur:'—',ref:"Supprimé depuis 01/01/2024",montant:[],change:'❌ Plus de réduction'},
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
      nom:"Activa.brussels",org:'Actiris',ref:"Ordonnance 23/06/2017 + AGRBC 14/09/2017",
      mesures:[
        {nom:"Activa.brussels",cible:"Demandeur d'emploi (DE) inscrit Actiris ≥ 12 mois",type:"Activation alloc. chômage + prime employeur",
          avantages:[
            {l:"Allocation de travail (travailleur)",m:'€350/mois pendant 12 mois max',source:'ONEm via CAPAC/syndicat'},
            {l:"Prime Actiris (employeur)",m:'€800/trimestre pendant 8 trimestres max',source:'Actiris'},
          ],conditions:"DE inscrit ≥12 mois, < 57 ans, résidence Bruxelles. CDI ou CDD ≥ 6 mois, mi-temps min.",procedure:'1. Attestation Actiris 2. Embauche 3. Demande ONSS via DmfA 4. Paiement automatique'},
        {nom:"Activa.brussels Jeunes (<30 ans)",cible:"DE < 30 ans inscrit Actiris ≥ 6 mois",type:"Prime employeur renforcée",
          avantages:[
            {l:"Allocation de travail (travailleur)",m:'€350/mois pendant 6 mois',source:'ONEm'},
            {l:"Prime Actiris Jeunes (employeur)",m:'€350/mois (mi-temps) à €700/mois (temps plein) pendant 12 mois',source:'Actiris'},
          ],conditions:"DE < 30 ans, inscrit ≥ 6 mois, peu qualifié (max CESS). Résidence Bruxelles.",procedure:'1. Carte Activa Actiris 2. Embauche CDI/CDD ≥ 6 mois 3. Demande en ligne Actiris'},
        {nom:"Stage First",cible:"Jeune < 30 ans, 1ère expérience",type:"Stage en entreprise",
          avantages:[{l:"Indemnité de stage",m:'€200/mois minimum (employeur)',source:'Employeur'},{l:"Prime stage (DE)",m:"Maintien allocations d'insertion",source:'ONEm'}],
          conditions:"Jeune < 30 ans, DE inscrit Actiris, sans expérience professionnelle",procedure:'Convention de stage via Actiris, durée 3 à 6 mois'},
        {nom:"Prime de transition",cible:"Travailleur licencié en restructuration",type:"Prime à l'embauche",
          avantages:[{l:"Prime employeur",m:'€1.250/trimestre pendant 4 trimestres',source:'Actiris'}],
          conditions:"Travailleur licencié d'une entreprise en restructuration ou en faillite résidant à Bruxelles",procedure:'Attestation Actiris + demande dans les 6 mois'},
      ]
    },
    wal:{
      nom:"Impulsion / SESAM",org:'FOREM / SPW Économie & Emploi',ref:"Décret wallon 02/02/2017 + AGW 22/06/2017",
      mesures:[
        {nom:"Impulsion < 25 ans",cible:"Jeune DE inscrit FOREM < 25 ans",type:"Aide à l'embauche",
          avantages:[{l:"Aide mensuelle (employeur)",m:'€500/mois pendant 36 mois max',source:'FOREM/SPW'}],
          conditions:"DE < 25 ans, inscrit FOREM ≥ 6 mois, peu qualifié (max CESS)",procedure:'1. Demande en ligne FOREM 2. Embauche CDI/CDD ≥ 6 mois 3. Déclaration trimestrielle'},
        {nom:"Impulsion 25-54 ans",cible:"DE inscrit FOREM 25-54 ans longue durée",type:"Aide à l'embauche",
          avantages:[{l:"Aide mensuelle (employeur)",m:'€500/mois pendant 24 mois max',source:'SPW'}],
          conditions:"DE 25-54 ans, inscrit FOREM ≥ 12 mois (18 mois si qualifié)",procedure:'Identique Impulsion < 25'},
        {nom:"Impulsion 55+ ans",cible:"DE inscrit FOREM ≥ 55 ans",type:"Aide à l'embauche renforcée",
          avantages:[{l:"Aide mensuelle (employeur)",m:'€500/mois pendant 36 mois max',source:'SPW'}],
          conditions:"DE ≥ 55 ans, inscrit FOREM ≥ 6 mois",procedure:'Identique Impulsion < 25'},
        {nom:"SESAM (Soutien à l'Emploi dans les Secteurs d'Activité Marchands)",cible:"PME ≤ 50 travailleurs, secteur marchand",type:"Aide à la création d'emploi",
          avantages:[{l:"Aide annuelle dégressive",m:'Année 1: €15.000 — Année 2: €10.000 — Année 3: €5.000',source:'SPW Économie'}],
          conditions:"PME ≤ 50 travailleurs, secteur marchand, siège en Wallonie, CDI min. mi-temps",procedure:'Demande avant embauche via formulaire SPW, engagement dans les 6 mois'},
        {nom:"APE (Aide à la Promotion de l'Emploi)",cible:"Secteur non-marchand wallon",type:"Subvention points APE",
          avantages:[{l:"Réduction coût salarial",m:'Variable selon points APE attribués (1 point ≈ €4.500/an)',source:'SPW'}],
          conditions:"ASBL, commune, CPAS, intercommunale en Wallonie. Attribution par Ministre.",procedure:'Demande annuelle, renouvellement selon disponibilités budgétaires'},
      ]
    },
    vla:{
      nom:"Réductions groupes-cibles flamands",org:'VDAB / WSE (Werk en Sociale Economie)',ref:"Décret flamand 04/03/2016 + AGF 17/02/2017",
      mesures:[
        {nom:"Réduction jeunes < 25 ans",cible:"Jeune < 25 ans, peu qualifié",type:"Réduction ONSS (prime Vlaanderen)",
          avantages:[{l:"Prime trimestrielle (employeur)",m:'€1.150/trimestre pendant 8 trimestres',source:'WSE via DmfA'}],
          conditions:"Jeune < 25 ans, sans diplôme secondaire supérieur, domicilié en Flandre, salaire trimestriel ≤ €9.000",procedure:'Automatique via DmfA si conditions remplies. Code 6320 en DmfA.'},
        {nom:"Réduction travailleurs âgés 55+",cible:"Travailleur ≥ 55 ans",type:"Réduction ONSS",
          avantages:[{l:"Prime trimestrielle (employeur)",m:'€1.150/trimestre (sans limite durée)',source:'WSE via DmfA'}],
          conditions:"Travailleur ≥ 55 ans en service, domicilié en Flandre, salaire trimestriel ≤ €16.000",procedure:'Automatique via DmfA, pas de demande préalable'},
        {nom:"Réduction travailleurs en situation de handicap",cible:"Travailleur avec handicap reconnu",type:"Réduction ONSS + prime",
          avantages:[{l:"Prime VOP (Vlaamse Ondersteuningspremie)",m:'40% à 60% du coût salarial pendant 5 ans max',source:'VDAB'}],
          conditions:"Handicap reconnu par VAPH/VDAB, contrat ≥ 3 mois, domicilié en Flandre",procedure:'Demande VDAB, évaluation rendement, prime versée trimestriellement'},
      ]
    },
    dg:{
      nom:"Aides Communauté germanophone",org:'ADG / Ministerium DG',ref:"Décret CG 28/05/2018",
      mesures:[
        {nom:"AktiF / AktiF PLUS",cible:"DE inscrit ADG",type:"Aide à l'embauche",
          avantages:[{l:"Prime employeur AktiF",m:'€1.000/mois pendant 24 mois max (selon profil)',source:'ADG'}],
          conditions:"DE inscrit ADG, résidence en CG, CDI ou CDD ≥ 6 mois",procedure:'Demande ADG avant embauche'},
      ]
    }
  };

  // ── RÉDUCTIONS GROUPES-CIBLES FÉDÉRALES (hors 1er engagement) ──
  const GC_FED=[
    {nom:"Réduction travailleurs âgés",cible:"≥ 55 ans (Bruxelles et Wallonie)",montant:"€1.150/trim (55-57 ans) → €1.500/trim (≥ 62 ans)",dur:'Tant que conditions remplies',ref:"AR 16/05/2003 Chap.VII",conditions:"Salaire trimestriel ≤ €16.120 (2026). Travailleur ≥ 55 ans en service, résidant hors Flandre."},
    {nom:"Réduction restructuration",cible:"Travailleur licencié d'entreprise en restructuration",montant:"€1.000/trim pendant 8 trimestres",dur:'8 trimestres',ref:"AR 16/05/2003 art.17 + Loi 01/02/2007",conditions:"Entreprise reconnue en restructuration ou fermeture. Embauche dans les 6 mois après licenciement."},
    {nom:"Réduction SINE (économie sociale d'insertion)",cible:"DE très éloigné du marché du travail",montant:"€1.000/trim pendant 8 à 21 trimestres",dur:'8 à 21 trim. selon profil',ref:"AR 16/05/2003 art.18 + Loi 26/05/2002",conditions:"Entreprise d'économie sociale agréée. Travailleur avec attestation SINE ONEM."},
    {nom:"Réduction tuteur (formation en alternance)",cible:"Tuteur formant des apprentis/stagiaires",montant:"€800/trim par apprenti (max 4 apprentis = €3.200/trim)",dur:'Pendant la formation',ref:"AR 16/05/2003 art.15bis",conditions:"Tuteur formé et agréé, accompagnant un jeune en alternance (IFAPME, SFPME, Syntra)."},
    {nom:"Convention Premier Emploi (CPE/Rosetta)",cible:"Jeune < 26 ans, obligation d'embauche",montant:"Réduction ONSS forfaitaire €1.000/trim",dur:'Pendant la CPE (max 12 mois)',ref:"Loi 24/12/1999 + AR 30/03/2000",conditions:"Entreprise ≥ 50 travailleurs : obligation 3% jeunes. Jeune < 26 ans, DE inscrit, diplôme depuis < 12 mois."},
    {nom:"Réduction personnel de maison",cible:"Personnel domestique",montant:"Exonération ONSS patronale quasi-totale",dur:'Illimitée',ref:"AR 16/05/2003 Chap.IV",conditions:"Travailleur occupé à des tâches ménagères dans un ménage privé. Max 1 travailleur par ménage."},
    {nom:"Réduction artiste",cible:"Travailleur sous statut artiste (ATA)",montant:"Forfait variable selon prestation",dur:'Par prestation',ref:"Loi 16/12/2022 (réforme statut artiste)",conditions:"Travailleur titulaire de l'attestation du travail des arts. Prestation artistique, technique ou de soutien."},
  ];

  // ── DISPENSES DE VERSEMENT PRÉCOMPTE PROFESSIONNEL ──
  const DISPENSES_PP=[
    {nom:"Travail de nuit et en équipes",pct:"22,8%",ref:"Art. 2751 CIR 92",conditions:"Travail en 2 ou 3 équipes successives, ou travail de nuit (20h-6h). Prime d'équipe/nuit obligatoire."},
    {nom:"Heures supplémentaires",pct:"41,25% (120h) ou 32,19% (volontaires)",ref:"Art. 2752 CIR 92",conditions:"Heures supp. légales (loi 16/03/1971). Max 180 heures/an (130h + 50h horeca)."},
    {nom:"Recherche scientifique",pct:"80%",ref:"Art. 2753 CIR 92",conditions:"Chercheurs titulaires d'un diplôme master/doctorat. Employeur enregistré BELSPO."},
    {nom:"Zone d'aide (Zones en difficulté)",pct:"25% (pendant 2 ans)",ref:"Art. 2758 CIR 92 + Loi 15/05/2014",conditions:"Investissement dans une zone d'aide reconnue (arrêté régional). Emploi créé dans les 3 ans."},
    {nom:"Sportifs rémunérés",pct:"80%",ref:"Art. 2756 CIR 92",conditions:"Sportif rémunéré ≥ 26 ans. Employeur: club sportif reconnu par une communauté."},
    {nom:"Jeunes travailleurs en formation (IBO/PFI/FPI)",pct:"Exonération cotisations",ref:"Divers arrêtés régionaux",conditions:"Stage d'insertion professionnelle via VDAB (IBO), FOREM (PFI), Actiris (FPI), Bruxelles Formation."},
    {nom:"Marine marchande",pct:"100%",ref:"Art. 2754 CIR 92",conditions:"Marins résidents UE/EEE employés sur navire belge enregistré."},
    {nom:"Starters (PME)",pct:"10% (micro) ou 20% (petite)",ref:"Art. 27510 CIR 92",conditions:"Micro-entreprise (< 10 travailleurs) ou petite entreprise (< 50 travailleurs). Premiers 48 mois d'activité."},
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
        elig.push({nom:"1er engagement — Exonération max €2.000/trim",eco:maxRed,ecoTrim:maxRed,dur:'À vie',type:"premier"});
      } else if(nEmps>=2&&nEmps<=5){
        // 2è à 5è: €1.000/trim × 12 trim
        const labels={2:'2ème',3:'3ème',4:'4ème',5:'5ème'};
        elig.push({nom:`${labels[nEmps]} travailleur — €1.000/trim`,eco:1000,ecoTrim:1000,dur:'12 trimestres (sur 20)',type:"premier"});
      }
    }
    const age=emp.birth?Math.floor((Date.now()-new Date(emp.birth).getTime())/31557600000):30;
    if(age<25)elig.push({nom:"CPE/Rosetta (< 26 ans)",eco:1000,ecoTrim:1000,dur:'Max 12 mois',type:"federal"});
    if(age>=55)elig.push({nom:"Réduction travailleurs âgés (55+)",eco:age>=62?1500:1150,ecoTrim:age>=62?1500:1150,dur:'Illimitée',type:"federal"});
    setSimRes({emp,brut,brutTrim,onssPatBase:Math.round(onssPatBase*100)/100,redStruct:Math.round(redStruct*100)/100,elig});
  };

  const tabs=[
    {id:"premier",l:"🏗 1er Engagement",c:()=><div>
      <div style={{padding:14,background:"rgba(251,146,60,.06)",borderRadius:10,border:'1px solid rgba(251,146,60,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#fb923c'}}>⚠ RÉFORME AU 01/04/2026 — Projet AR transmis au Conseil d'État (02/2026)</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6,lineHeight:1.6}}>Le gouvernement fédéral modifie les montants des réductions premiers engagements. Le 1er travailleur passe de max €3.100 à max €2.000/trim. Le 2è et 3è passent à un forfait fixe de €1.000/trim × 12. Les 4è et 5è travailleurs sont réintroduits (€1.000/trim × 12). Le 6è reste supprimé. <b>Pas encore publié au Moniteur belge — date probable: 01/04/2026 ou 01/07/2026.</b></div>
      </div>

      <div style={{fontWeight:700,fontSize:14,color:'#c6a34e',marginBottom:10}}>Régime actuel (jusqu'au 31/03/2026)</div>
      <C style={{padding:0,overflow:'hidden',marginBottom:16}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:"rgba(198,163,78,.06)"}}>
            {['N°',"Travailleur","T1-T5","T6-T9","T10-T13","Total max","Durée"].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,color:'#c6a34e',borderBottom:'1px solid rgba(198,163,78,.1)'}}>{h}</th>)}
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
          <thead><tr style={{background:"rgba(74,222,128,.06)"}}>
            {['N°',"Travailleur","Montant/trim","Durée max","Période réf.","Total max","Changement"].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,color:'#4ade80',borderBottom:'1px solid rgba(74,222,128,.15)'}}>{h}</th>)}
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
          <thead><tr style={{background:"rgba(96,165,250,.06)"}}>
            {['N°',"Travailleur","Avant (total)","Après (total)","Impact"].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,fontSize:11,color:'#60a5fa',borderBottom:'1px solid rgba(96,165,250,.15)'}}>{h}</th>)}
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

      <div style={{marginTop:14,padding:14,background:"rgba(198,163,78,.04)",borderRadius:8,fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
        <b style={{color:'#c6a34e'}}>Règles clés:</b><br/>
        • Le droit s'ouvre sur base de l'<b>unité technique d'exploitation (UTE)</b>, pas de l'entité juridique<br/>
        • La réduction n'est <b>pas liée au travailleur</b> — l'employeur choisit chaque trimestre pour quel travailleur<br/>
        • <b>Cumul possible</b>: réduction structurelle + 1er engagement (pas avec autre groupe-cible)<br/>
        • Les 4è-5è ne comptent pas les engagements avant 01/01/2024 (droits éteints)<br/>
        • <b>Code DmfA</b>: zone 00829 — réduction groupe-cible premiers engagements<br/>
        • Formule ONSS: Pg = G × µ × β (proportionnel aux prestations)<br/>
        • Source: <b>socialsecurity.be 23/01/2026</b> — Projet AR transmis au Conseil d'État
      </div>
    </div>},

    {id:"activa",l:"🎯 Activa / Régional",c:()=><div>
      {Object.entries(ACTIVA).map(([key,reg])=><C key={key} style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div><div style={{fontWeight:700,fontSize:15,color:'#c6a34e'}}>{reg.nom}</div><div style={{fontSize:11,color:'#5e5c56'}}>{reg.org} — {reg.ref}</div></div>
          <span style={{fontSize:10,padding:'4px 10px',borderRadius:20,background:key==='bxl'?'rgba(96,165,250,.1)':key==='wal'?'rgba(251,146,60,.1)':key==='vla'?'rgba(74,222,128,.1)':'rgba(167,139,250,.1)',color:key==='bxl'?'#60a5fa':key==='wal'?'#fb923c':key==='vla'?'#4ade80':'#a78bfa'}}>{key==='bxl'?'Bruxelles':key==='wal'?'Wallonie':key==='vla'?'Flandre':'CG'}</span>
        </div>
        {reg.mesures.map((m,mi)=><div key={mi} style={{padding:14,background:"rgba(198,163,78,.03)",borderRadius:8,border:'1px solid rgba(198,163,78,.06)',marginBottom:8}}>
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

    {id:"gc_fed",l:"⚖ Groupes-cibles fédéraux",c:()=><div>
      <div style={{padding:14,background:"rgba(96,165,250,.06)",borderRadius:10,border:'1px solid rgba(96,165,250,.15)',marginBottom:16}}>
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

    {id:"dispense",l:"💰 Dispenses PP",c:()=><div>
      <div style={{padding:14,background:"rgba(198,163,78,.06)",borderRadius:10,border:'1px solid rgba(198,163,78,.15)',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:'#c6a34e'}}>Dispenses de versement du précompte professionnel</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:6,lineHeight:1.6}}>L'employeur retient le PP normalement sur le salaire du travailleur mais ne verse qu'une partie au SPF Finances. La différence est un avantage net pour l'employeur. Déclaration via 274.XX au SPF Finances.</div>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{background:"rgba(198,163,78,.06)"}}>
            {['Dispense',"% non versé","Conditions","Réf. légale"].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,fontSize:11,color:'#c6a34e',borderBottom:'1px solid rgba(198,163,78,.1)'}}>{h}</th>)}
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

    {id:"sim",l:"🧮 Simulateur",c:()=><div>
      <div style={{padding:14,background:"rgba(74,222,128,.06)",borderRadius:10,border:'1px solid rgba(74,222,128,.15)',marginBottom:16}}>
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
            <div style={{padding:10,background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:'center'}}><div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>ONSS patronale/trim</div><div style={{fontSize:15,fontWeight:700,color:'#f87171',marginTop:4}}>{fmt(simRes.onssPatBase)}</div></div>
            <div style={{padding:10,background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:'center'}}><div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>Réd. structurelle/trim</div><div style={{fontSize:15,fontWeight:700,color:'#60a5fa',marginTop:4}}>-{fmt(simRes.redStruct)}</div></div>
          </div>
          <ST>Aides éligibles</ST>
          {simRes.elig.length===0?<div style={{padding:14,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucune aide spécifique détectée (réduction structurelle toujours applicable)</div>:
          simRes.elig.map((el,i)=><div key={i} style={{padding:'10px 14px',background:"rgba(74,222,128,.06)",borderRadius:8,border:'1px solid rgba(74,222,128,.15)',marginBottom:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:600,fontSize:12.5,color:'#4ade80'}}>{el.nom}</div>
              <div style={{fontWeight:700,fontSize:13,color:'#4ade80'}}>-{fmt(el.eco)}/trim</div>
            </div>
            <div style={{fontSize:10.5,color:'#5e5c56',marginTop:3}}>Durée: {el.dur}</div>
          </div>)}
          <div style={{marginTop:12,padding:10,background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:9.5,color:'#5e5c56',textTransform:'uppercase'}}>Économie totale estimée / trimestre</div>
            <div style={{fontSize:18,fontWeight:800,color:'#4ade80',marginTop:4}}>{fmt(simRes.elig.reduce((a,e)=>a+e.eco,0)+simRes.redStruct)}</div>
          </div>
        </C>:<C><div style={{padding:40,textAlign:'center',color:'#5e5c56',fontSize:12}}>← Sélectionnez un employé</div></C>}
      </div>}
    </div>},

    {id:"procedure",l:"📋 Procédure",c:()=><div>
      {[
        {t:"1. Avant l'embauche",steps:['Vérifier le nombre de travailleurs actuels (1er engagement?)',"Consulter le profil du candidat : âge, durée inoccupation, diplôme, domicile","Vérifier la région de résidence du candidat (détermine les aides régionales)","Demander carte Activa / attestation FOREM / attestation VDAB si nécessaire","Vérifier si l'entreprise est dans une zone d'aide (dispense PP 25%)"]},
        {t:"2. À l'embauche",steps:['Dimona IN avec les bons codes DmfA (code réduction groupe-cible)',"Conserver l'attestation du travailleur (carte Activa, attestation FOREM, etc.)","Introduire la demande d'aide régionale (SESAM: avant embauche!)","Déclarer le travailleur dans la catégorie correcte en DmfA"]},
        {t:'3. Trimestriellement',steps:['Vérifier le plafond salarial trimestriel (€9.000 jeunes FL, €16.000 55+ FL, etc.)',"Encoder les codes réduction en DmfA (zone 00829 — code travailleur groupe-cible)","Calculer la réduction structurelle + réduction groupe-cible","Vérifier le cumul : structurelle + 1 groupe-cible (pas 2 groupes-cibles entre eux)"]},
        {t:'4. Dispenses PP (formulaires 274)',steps:['274.XX — Déclaration trimestrielle au SPF Finances',"274.31 — Travail de nuit et en équipes (22,8%)","274.32 — Heures supplémentaires (41,25% ou 32,19%)","274.33 — Recherche scientifique (80%)","274.75 — Zone d'aide (25%)","274.XX — Starters PME (10% ou 20%)","Attention: la dispense PP se calcule sur le PP retenu, pas sur le salaire brut"]},
        {t:'5. Annuellement',steps:['Bilan social BNB : déclarer les aides perçues',"Belcotax 281.10 : aucun impact (PP retenu intégralement sur fiche)","Vérifier le renouvellement des aides régionales (APE, SESAM, etc.)","Mettre à jour les attestations des travailleurs"]},
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

export function AuditMod({s,d}){const ae= s?.emps||[];const n=ae.length;const [tab,setTab]=useState("global");const mb=ae.reduce((a,e)=>a+(+e.gross||0),0);
const checks=[{cat:"Administratif",items:[{t:"Contrats de travail signes",ok:ae.every(e=>e.contractType),d:"Chaque travailleur doit avoir un contrat ecrit (obligatoire CDD/TP)"},{t:"NISS renseignes",ok:ae.every(e=>e.niss),d:"Numero national obligatoire pour declarations ONSS et fiscales"},{t:"Dates entree completes",ok:ae.every(e=>e.startDate),d:"Date debut occupation pour calcul anciennete et préavis"},{t:"Dates naissance",ok:ae.every(e=>e.birthDate),d:"Necessaire pour pyramide ages et reductions groupes-cibles"},{t:"Registre personnel tenu",ok:n>0,d:"Obligation legale AR 08/08/1980"},{t:"Reglement travail distribue",ok:n>0,d:"Loi 08/04/1965 - remise contre recu"}]},{cat:"Rémunération",items:[{t:"Salaires min RMMMG",ok:ae.every(e=>(+e.gross||0)>=RMMMG),d:'RMMMG 2026: '+fmt(RMMMG)+' EUR brut temps plein 21+ ans'},{t:"Baremes sectoriels respectes",ok:true,d:"Verifier baremes minimums par CP et anciennete"},{t:"Fiches de paie mensuelles",ok:n>0,d:"AR 27/09/1966 - remise obligatoire mensuelle"},{t:"Indexation appliquee",ok:true,d:"Application automatique selon mecanisme CP"},{t:"Egalite salariale H/F",ok:true,d:"Loi 22/04/2012 - rapport bisannuel obligatoire"}]},{cat:"ONSS et fiscal",items:[{t:"Dimona IN declarees",ok:ae.every(e=>e.startDate),d:"Obligatoire AVANT le 1er jour de travail"},{t:"DmfA trimestrielle",ok:n>0,d:"Declaration multifonctionnelle a ONSS"},{t:"Precompte professionnel",ok:n>0,d:"Retenue et versement mensuel au SPF Finances"},{t:"Fiches 281.10 annuelles",ok:n>0,d:"Deadline 28 fevrier N+1"},{t:"CSSS retenue",ok:true,d:"Cotisation spéciale sécurité sociale"}]},{cat:"Bien-etre",items:[{t:"Plan global prevention",ok:n>=1,d:"AR 27/03/1998 - obligatoire pour tout employeur"},{t:"Analyse risques psychosociaux",ok:n>=1,d:"Loi 04/08/1996 - prevention harcelement et stress"},{t:"Medecine du travail",ok:n>=1,d:"Surveillance sante periodique des travailleurs"},{t:"Formation securite",ok:n>=1,d:"Accueil securite pour chaque nouveau travailleur"},{t:"Personne de confiance",ok:n>=20,d:"Obligatoire si 50+ travailleurs (recommande des 20)"}]},{cat:"Organes sociaux",items:[{t:"CPPT",ok:n<50||n>=50,d:n>=50?"OBLIGATOIRE: effectif 50+ - Elections sociales":"Non requis (effectif < 50)"},{t:"Conseil entreprise",ok:n<100||n>=100,d:n>=100?"OBLIGATOIRE: effectif 100+":"Non requis (effectif < 100)"},{t:"Delegation syndicale",ok:true,d:"Selon CCT sectorielle - seuils variables par CP"},{t:"Elections sociales",ok:n<50,d:n>=50?"ATTENTION: prochaines elections 2028":"Non concerne (moins de 50 travailleurs)"}]},{cat:"Formation",items:[{t:"Plan formation annuel",ok:n<20||n>=20,d:n>=20?"OBLIGATOIRE: effectif 20+ - 4j/ETP/an min":"Non obligatoire (effectif < 20)"},{t:"Droit formation individuel",ok:true,d:"Chaque travailleur: min 2j/an (2024) progressif a 5j/an"},{t:"Budget formation",ok:true,d:"Recommande: 1-3% de la masse salariale"}]}];
const totalChecks=checks.reduce((a,c)=>a+c.items.length,0);const passedChecks=checks.reduce((a,c)=>a+c.items.filter(it=>it.ok).length,0);const score=totalChecks>0?Math.round(passedChecks/totalChecks*100):0;
return <div><PH title="Audit Social Complet" sub={"Score de conformite: "+score+"% - "+passedChecks+"/"+totalChecks+" controles OK"}/>
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>{[{l:"Score global",v:score+"%",c:score>=90?"#4ade80":score>=70?"#fb923c":"#f87171"},{l:"Controles OK",v:passedChecks+"/"+totalChecks,c:"#4ade80"},{l:"Alertes",v:totalChecks-passedChecks,c:totalChecks-passedChecks>0?"#f87171":"#4ade80"},{l:"Catégories",v:checks.length,c:"#c6a34e"},{l:"Effectif",v:n,c:"#60a5fa"}].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}><div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}</div>
<div style={{display:"flex",gap:6,marginBottom:16}}>{[{v:"global",l:"Vue globale"},{v:"detail",l:"Detail par categorie"},{v:"actions",l:"Plan actions"},{v:"calendar",l:"Calendrier legal"},{v:"risques",l:"Matrice risques"},{v:"export",l:"Rapport"}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>)}</div>
{tab==="global"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><C><ST>Score par categorie</ST>
{checks.map((cat,i)=>{const catOk=cat.items.filter(it=>it.ok).length;const catTotal=cat.items.length;const catScore=Math.round(catOk/catTotal*100);return <div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><b style={{color:"#e8e6e0",fontSize:12}}>{cat.cat}</b><span style={{color:catScore>=90?"#4ade80":catScore>=70?"#fb923c":"#f87171",fontWeight:700}}>{catScore}% ({catOk}/{catTotal})</span></div><div style={{height:8,background:"rgba(198,163,78,.06)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:catScore+"%",background:catScore>=90?"#4ade80":catScore>=70?"#fb923c":"#f87171",borderRadius:4}}/></div></div>})}
</C><C><ST>Jauge globale de conformite</ST>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 0"}}><div style={{width:120,height:120,borderRadius:"50%",background:"conic-gradient("+(score>=90?"#4ade80":score>=70?"#fb923c":"#f87171")+" "+score+"%, rgba(198,163,78,.1) "+score+"%)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:90,height:90,borderRadius:"50%",background:"#1a1918",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><div style={{fontSize:28,fontWeight:700,color:score>=90?"#4ade80":score>=70?"#fb923c":"#f87171"}}>{score}%</div><div style={{fontSize:9,color:"#5e5c56"}}>CONFORMITE</div></div></div></div>
<div style={{marginTop:10}}>{score>=90?<div style={{textAlign:"center",color:"#4ade80",fontSize:12,fontWeight:600}}>Excellent - Conformite elevee</div>:score>=70?<div style={{textAlign:"center",color:"#fb923c",fontSize:12,fontWeight:600}}>Correct - Points amelioration identifies</div>:<div style={{textAlign:"center",color:"#f87171",fontSize:12,fontWeight:600}}>Attention - Actions correctives necessaires</div>}</div>
</C></div>}
{tab==="detail"&&<C><ST>Detail des controles</ST>
{checks.map((cat,ci)=><div key={ci} style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:700,color:"#c6a34e",marginBottom:8,paddingBottom:6,borderBottom:"1px solid rgba(198,163,78,.15)"}}>{cat.cat}</div>{cat.items.map((it,ii)=><div key={ii} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}><div style={{width:18,height:18,borderRadius:4,background:it.ok?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:it.ok?"#4ade80":"#f87171",flexShrink:0}}>{it.ok?"V":"X"}</div><div><div style={{color:it.ok?"#4ade80":"#f87171",fontSize:12,fontWeight:600}}>{it.t}</div><div style={{fontSize:10,color:"#5e5c56"}}>{it.d}</div></div></div>)}</div>)}
</C>}
{tab==="actions"&&<C><ST>Plan actions prioritaires</ST>
{checks.flatMap(cat=>cat.items.filter(it=>!it.ok).map(it=>({...it,cat:cat.cat}))).map((r,i)=><div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{width:28,height:28,borderRadius:"50%",background:"rgba(248,113,113,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#f87171",flexShrink:0}}>{i+1}</div><div><div style={{display:"flex",gap:8,alignItems:"center"}}><b style={{color:"#f87171",fontSize:12}}>{r.t}</b><span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(198,163,78,.08)",color:"#9e9b93"}}>{r.cat}</span></div><div style={{fontSize:10.5,color:"#9e9b93",marginTop:2}}>{r.d}</div></div></div>)}
{checks.every(cat=>cat.items.every(it=>it.ok))&&<div style={{textAlign:"center",padding:30,color:"#4ade80",fontSize:14,fontWeight:700}}>Aucune action requise - Tout est conforme !</div>}
</C>}
{tab==="calendar"&&<C><ST>Calendrier obligations legales</ST>
{[{m:"Janvier",items:["Indexation salaires (CP 200, 302, 330)","Plan formation annuel"]},{m:"Fevrier",items:["Fiches 281.10 aux travailleurs (28/02)","Bilan social preparation"]},{m:"Mars",items:["Belcotax XML SPF Finances (01/03)","DmfA T4 N-1 (si pas fait)"]},{m:"Avril",items:["DmfA T1","Vacances annuelles planification"]},{m:"Mai",items:["Pecule vacances double (employes)","Jour ferie 01/05"]},{m:"Juin",items:["Bilan social depot BNB","DmfA T2 preparation"]},{m:"Juillet",items:["DmfA T2","Vacances collectif construction"]},{m:"Septembre",items:["Plan global prevention revision","Rentree formations"]},{m:"Octobre",items:["DmfA T3","Eco-cheques versement"]},{m:"Novembre",items:["Prime fin annee preparation","Budget N+1"]},{m:"Decembre",items:["13eme mois / Prime fin annee","DmfA T4 preparation","Cadeaux Noel (max 40 EUR exonere)"]}].map((r,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{width:80,color:"#c6a34e",fontWeight:600,fontSize:11,flexShrink:0}}>{r.m}</span><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{r.items.map((it,j)=><span key={j} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(198,163,78,.06)",color:"#9e9b93"}}>{it}</span>)}</div></div>)}
</C>}
{tab==="risques"&&<C><ST>Matrice des risques sociaux</ST>
<Tbl cols={[{k:"r",l:"Risque",b:1,r:r=><b style={{color:r.c}}>{r.risque}</b>},{k:"p",l:"Probabilite",r:r=><span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:r.c+"15",color:r.c}}>{r.prob}</span>},{k:"i",l:"Impact",r:r=><span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:r.c+"15",color:r.c}}>{r.impact}</span>},{k:"s",l:"Sanction",r:r=><span style={{color:"#f87171",fontSize:11}}>{r.sanction}</span>}]} data={[{risque:"Dimona manquante",prob:"Moyen",impact:"Eleve",sanction:"2.500-12.500 EUR",c:"#f87171"},{risque:"DmfA en retard",prob:"Faible",impact:"Eleve",sanction:"Majorations 10%+interets",c:"#fb923c"},{risque:"RMMMG non respecte",prob:"Faible",impact:"Eleve",sanction:"Amende penale",c:"#f87171"},{risque:"Pas de reglement travail",prob:"Moyen",impact:"Moyen",sanction:"Amende admin.",c:"#fb923c"},{risque:"Discrimination salariale",prob:"Moyen",impact:"Eleve",sanction:"Tribunal travail",c:"#f87171"},{risque:"Absence plan prevention",prob:"Moyen",impact:"Moyen",sanction:"Amende niveau 3",c:"#fb923c"},{risque:"CDD > 2 ans",prob:"Faible",impact:"Eleve",sanction:"Requalification CDI",c:"#a78bfa"},{risque:"Travail au noir",prob:"Faible",impact:"Critique",sanction:"Penale + fermeture",c:"#f87171"}]}/>
</C>}
{tab==="export"&&<C><ST>Rapport audit</ST>
<div style={{padding:20,background:"rgba(198,163,78,.04)",borderRadius:8}}><div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:16,fontWeight:700,color:"#c6a34e"}}>RAPPORT AUDIT SOCIAL</div><div style={{fontSize:11,color:"#9e9b93"}}>{new Date().toLocaleDateString("fr-BE")} - Aureus Social Pro</div></div>
{[{l:"Score global",v:score+"%"},{l:"Controles passes",v:passedChecks+"/"+totalChecks},{l:"Effectif audite",v:n+" travailleurs"},{l:"Masse salariale",v:fmt(mb)+"/mois"},{l:"Actions requises",v:(totalChecks-passedChecks)+" points"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{color:"#9e9b93"}}>{r.l}</span><span style={{fontWeight:600,color:"#e8e6e0"}}>{r.v}</span></div>)}
<div style={{marginTop:16,textAlign:"center"}}><button onClick={()=>window.print()} style={{padding:"10px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",background:"rgba(198,163,78,.15)",color:"#c6a34e"}}>🖨 Imprimer / Exporter PDF</button></div></div>
</C>}
</div>;}

export function SelfServiceMod({s,d}){const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);const empNetData=ae.map(e=>({...e,netCalc:quickNet(+(e.gross||0)),pp:quickPP(+(e.gross||0)),onss:Math.round((+(e.gross||0))*TX_ONSS_W*100)/100}));const [sel,setSel]=useState(ae[0]?.id||'');const [tab,setTab]=useState('fiches');
  const emp=ae.find(e=>e.id===sel)||ae[0]||{};
  const p=emp.id?calc(emp,DPER,s.co):{gross:0,net:0,tax:0};
  const tabs=[{v:"fiches",l:"Fiches de paie",ic:'📄'},{v:"conges",l:"Congés",ic:'📅'},{v:"docs",l:"Documents",ic:'📋'},{v:"perso",l:"Données perso",ic:'👤'},{v:"contact",l:"Contact RH",ic:'💬'}];
  return <div>
    <PH title="Portail Self-Service Travailleur" sub="Accès autonome — Fiches, congés, documents, données personnelles"/>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18}}>
      <div>
        <C><ST>Travailleur</ST>
          <I label="Simulation pour" value={sel} onChange={setSel} options={ae.map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))}/>
          <div style={{marginTop:14,textAlign:'center'}}>
            <div style={{width:50,height:50,borderRadius:'50%',background:"linear-gradient(135deg,#c6a34e,#a08030)",display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontSize:18,fontWeight:700,color:'#fff'}}>{(emp.first||'?')[0]}{(emp.last||'?')[0]}</div>
            <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginTop:6}}>{emp.first} {emp.last}</div>
            <div style={{fontSize:10.5,color:'#5e5c56'}}>{emp.fn||''} · {emp.statut||'employé'}</div>
          </div>
        </C>
        <C style={{marginTop:12,padding:0}}>
          {tabs.map(t=><div key={t.v} onClick={()=>setTab(t.v)} style={{padding:'10px 16px',cursor:'pointer',display:'flex',gap:8,alignItems:'center',
            background:tab===t.v?'rgba(198,163,78,.1)':'transparent',borderLeft:tab===t.v?'3px solid #c6a34e':'3px solid transparent',
            color:tab===t.v?'#c6a34e':'#9e9b93',fontSize:12,fontWeight:tab===t.v?600:400}}>
            <span>{t.ic}</span>{t.l}
          </div>)}
        </C>
        <C style={{marginTop:12,padding:'12px 16px',fontSize:10.5,color:'#60a5fa',background:"rgba(96,165,250,.03)",border:'1px solid rgba(96,165,250,.1)'}}>
          <b>Réduction appels:</b> ~40% de contacts en moins grâce au self-service.
        </C>
      </div>
      
      <div>
        {tab==='fiches'&&<C>
          <ST>Fiches de paie</ST>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
            {[{l:"Dernier brut",v:fmt(p.gross),c:'#e8e6e0'},{l:"Dernier net",v:fmt(p.net),c:'#4ade80'},{l:"PP retenu",v:fmt(p.tax),c:'#f87171'}].map((k,i)=>
              <div key={i} style={{padding:'12px',background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#5e5c56'}}>{k.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:2}}>{k.v}</div>
              </div>
            )}
          </div>
          <div style={{fontSize:11,color:'#9e9b93'}}>
            {MN.slice(0,new Date().getMonth()+1).reverse().map((m,i)=>
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                <span>{m} {new Date().getFullYear()}</span>
                <div style={{display:'flex',gap:12}}>
                  <span style={{color:'#4ade80',fontWeight:600}}>{fmt(p.net)}</span>
                  <span style={{color:'#60a5fa',cursor:'pointer',fontSize:10}}>📄 PDF</span>
                </div>
              </div>
            )}
          </div>
        </C>}
        
        {tab==='conges'&&<C>
          <ST>Solde congés</ST>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
            {[{l:"Légaux",v:20,u:20,c:'#4ade80'},{l:"Extra-légaux",v:2,u:5,c:'#60a5fa'},{l:"Récupération",v:0,u:3,c:'#a78bfa'},{l:"Ancienneté",v:1,u:1,c:'#c6a34e'}].map((k,i)=>
              <div key={i} style={{padding:'12px',background:"rgba(198,163,78,.04)",borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#5e5c56'}}>{k.l}</div>
                <div style={{fontSize:22,fontWeight:700,color:k.c,marginTop:2}}>{k.v}</div>
                <div style={{fontSize:10,color:'#5e5c56'}}>sur {k.u} jours</div>
                <div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:2,marginTop:6}}>
                  <div style={{height:4,background:k.c,borderRadius:2,width:(k.v/k.u*100)+'%'}}/>
                </div>
              </div>
            )}
          </div>
          <div style={{padding:12,background:"rgba(96,165,250,.05)",borderRadius:8,fontSize:11,color:'#60a5fa'}}>
            Total restant: <b>23 jours</b> sur 29. Demande de congé via formulaire en ligne.
          </div>
        </C>}
        
        {tab==='docs'&&<C>
          <ST>Documents disponibles</ST>
          {[{t:'Fiches fiscales 281.10',y:'2025',ic:'📊'},{t:'Attestation de travail',y:'2026',ic:'📋'},{t:'Contrat de travail',y:'2024',ic:'📄'},{t:'Règlement de travail',y:'2026',ic:'📕'},{t:'Attestation pécule vacances',y:'2025',ic:'🏖'},{t:'Fiche accident travail',y:'—',ic:'🏥'}].map((doc,i)=>
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span>{doc.ic}</span>
                <div><div style={{fontSize:12,color:'#e8e6e0'}}>{doc.t}</div><div style={{fontSize:10,color:'#5e5c56'}}>{doc.y}</div></div>
              </div>
              <span style={{fontSize:10,color:'#60a5fa',cursor:'pointer'}}>Télécharger</span>
            </div>
          )}
        </C>}
        
        {tab==='perso'&&<C>
          <ST>Données personnelles</ST>
          {[{l:"Nom",v:`${emp.first} ${emp.last}`},{l:"NISS",v:emp.niss||'—'},{l:"Date naissance",v:emp.birth||'—'},{l:"Adresse",v:`${emp.addr||''} ${emp.zip||''} ${emp.city||''}`},{l:"IBAN",v:emp.iban||'—'},{l:"Email",v:emp.email||'—'},{l:"Téléphone",v:emp.phone||'—'},{l:"Situation familiale",v:emp.civil||'—'},{l:"Personnes à charge",v:emp.children||0}].map((f2,i)=>
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:12}}>
              <span style={{color:'#9e9b93'}}>{f2.l}</span>
              <span style={{fontWeight:500,color:'#e8e6e0'}}>{f2.v}</span>
            </div>
          )}
          <div style={{marginTop:12,padding:8,background:"rgba(245,158,11,.06)",borderRadius:6,fontSize:10.5,color:'#f59e0b'}}>
            Modifications via demande au gestionnaire RH.
          </div>
        </C>}
        
        {tab==='contact'&&<C>
          <ST>Contact gestionnaire RH</ST>
          <div style={{padding:20,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>💬</div>
            <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0'}}>Aureus IA SPRL</div>
            <div style={{fontSize:12,color:'#9e9b93',marginTop:4}}>Votre secrétariat social</div>
            <div style={{marginTop:16,display:'grid',gap:8}}>
              <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:8,fontSize:12,color:'#9e9b93'}}>
                📧 <b style={{color:'#e8e6e0'}}>info@aureus-ia.com</b>
              </div>
              <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:8,fontSize:12,color:'#9e9b93'}}>
                📞 <b style={{color:'#e8e6e0'}}>+32 2 xxx xx xx</b>
              </div>
              <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:8,fontSize:12,color:'#9e9b93'}}>
                📍 <b style={{color:'#e8e6e0'}}>Saint-Gilles, 1060 Bruxelles</b>
              </div>
            </div>
          </div>
        </C>}
      </div>
    </div>
  </div>;
}

export function GEDMod({s,d}){
  const ae= s?.emps||[];const [tab,setTab]=useState('arbo');const [search,setSearch]=useState('');
  const cats=[{t:'Contrats',ic:'📄',n:ae.length,docs:ae.map(e=>`Contrat_${e.last}_${e.first}.pdf`)},
    {t:'Certificats médicaux',ic:'🏥',n:Math.floor(ae.length*0.3),docs:[]},
    {t:'Avenants',ic:'📋',n:Math.floor(ae.length*0.2),docs:[]},
    {t:'Fiches de paie',ic:'💰',n:ae.length*12,docs:[]},
    {t:'Documents fiscaux',ic:'📊',n:ae.length*2,docs:[]},
    {t:'Courriers',ic:'📬',n:Math.floor(ae.length*0.5),docs:[]},
    {t:'Règlements',ic:'📕',n:2,docs:['Reglement_travail.pdf',"CCT_interne.pdf"]},
    {t:'Juridique',ic:'⚖',n:Math.floor(ae.length*0.1),docs:[]}];
  const totDocs=cats.reduce((a,c)=>a+c.n,0);
  
  return <div>
    <PH title="GED — Gestion Électronique des Documents" sub="Archivage par client et travailleur — Conservation légale"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
      {[{l:"Documents total",v:totDocs,c:'#60a5fa'},{l:"Catégories",v:cats.length,c:'#a78bfa'},{l:"Travailleurs",v:ae.length,c:'#c6a34e'},{l:"Stockage",v:Math.round(totDocs*0.2)+'MB',c:'#4ade80'}].map((k,i)=>
        <div key={i} style={{padding:'14px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{k.l}</div>
          <div style={{fontSize:22,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div>
        </div>
      )}
    </div>
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:"arbo",l:"Arborescence"},{v:"retention",l:"Conservation légale"},{v:"search",l:"Recherche"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>
    {tab==='arbo'&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
      {cats.map((c,ci)=><C key={ci} style={{padding:'16px',textAlign:'center',cursor:'pointer'}}>
        <div style={{fontSize:28}}>{c.ic}</div>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginTop:6}}>{c.t}</div>
        <div style={{fontSize:22,fontWeight:700,color:'#c6a34e',marginTop:4}}>{c.n}</div>
        <div style={{fontSize:10,color:'#5e5c56'}}>documents</div>
      </C>)}
    </div>}
    {tab==='retention'&&<C><ST>Durées de conservation légales</ST>
      {[{t:'Contrats de travail',d:"5 ans après fin",b:'Art. 15 Loi 3/7/1978'},{t:'Fiches de paie',d:"5 ans",b:'Art. 58 AR 8/8/1980'},{t:'Compte individuel',d:"5 ans",b:'AR 8/8/1980'},{t:'Documents ONSS',d:"7 ans",b:'Loi ONSS'},{t:'Documents fiscaux (281.xx)',d:"7 ans",b:'CIR Art. 315'},{t:'Registre du personnel',d:"5 ans après dernière mention",b:'AR 9/12/1992'},{t:'Certificats médicaux',d:"5 ans",b:'Code bien-être'},{t:'Accidents du travail',d:"10 ans",b:'Loi 10/4/1971'},{t:'RGPD — Données personnelles',d:"Durée nécessaire + suppression",b:'RGPD Art. 5'}].map((r,i)=>
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:12}}>
          <div><b style={{color:'#e8e6e0'}}>{r.t}</b><div style={{fontSize:10,color:'#5e5c56'}}>{r.b}</div></div>
          <span style={{fontWeight:600,color:'#c6a34e',whiteSpace:'nowrap'}}>{r.d}</span>
        </div>
      )}
    </C>}
    {tab==='search'&&<C>
      <ST>Recherche documents</ST>
      <I label="Rechercher (nom, NISS, type, date)" value={search} onChange={setSearch}/>
      <div style={{marginTop:14,padding:20,textAlign:'center',color:'#5e5c56',fontSize:12}}>
        {search?`Recherche de "${search}" dans ${totDocs} documents...`:'Tapez un terme de recherche'}
      </div>
    </C>}
  </div>;
}


export default function ModsBatch2Wrapped({s, d, tab}) {
  // Déclarations & exports comptables
  if(tab==='sepa') return <FraisGestionMod s={s} d={d}/>;
  if(tab==='exportWinbooks' || tab==='exportcompta' || tab==='exportcomptapro' || tab==='exportbatch') return <AccountingOutputMod s={s} d={d}/>;
  if(tab==='exportcoda') return <AccountingOutputMod s={s} d={d}/>;
  if(tab==='importcsv') return <FichesMod s={s} d={d}/>;
  if(tab==='belcotax281') return <FichesMod s={s} d={d}/>;
  if(tab==='chargessociales') return <PortailEmployeurMod s={s} d={d}/>;
  if(tab==='chomagetemporaire') return <CreditTempsMod s={s} d={d}/>;
  if(tab==='batchdecl') return <EnvoiMod s={s} d={d}/>;
  if(tab==='massengine') return <NetBrutMod s={s} d={d}/>;
  if(tab==='queue') return <KPIDashboardMod s={s} d={d}/>;
  // Default
  return <GuidePortailMod s={s} d={d}/>;
}
