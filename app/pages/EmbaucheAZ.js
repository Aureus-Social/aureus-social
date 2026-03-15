'use client'
import { useState } from 'react'

const ETAPES = [
  {
    id: 1,
    icon: '📋',
    titre: 'Vérifications préalables',
    delai: 'Avant tout',
    color: '#6366f1',
    obligatoire: true,
    taches: [
      { id: 'niss', label: 'Vérifier le NISS du travailleur', detail: 'Numéro de registre national — 11 chiffres. Format: XX.XX.XX-XXX.XX', lien: 'https://www.ksz-bcss.fgov.be', obligatoire: true },
      { id: 'permis', label: 'Vérifier permis de travail (si étranger)', detail: 'Ressortissant hors UE : permis de travail obligatoire. UE : libre circulation.', obligatoire: false },
      { id: 'visite', label: 'Planifier visite médicale d\'embauche', detail: 'Obligatoire pour postes à risque (code C ou D). À organiser via le service interne ou externe de prévention (SEPPT).', lien: 'https://www.beswic.be', obligatoire: false },
      { id: 'casier', label: 'Demander extrait de casier judiciaire si nécessaire', detail: 'Requis pour certains secteurs (soins de santé, enfants, sécurité). Pas obligatoire par défaut.', obligatoire: false },
      { id: 'contrat_redige', label: 'Rédiger le contrat de travail', detail: 'CDI, CDD, temps partiel... Doit mentionner : identité, fonction, rémunération, durée du travail, lieu.', lien: 'https://employment.belgium.be', obligatoire: true },
    ]
  },
  {
    id: 2,
    icon: '📡',
    titre: 'Dimona IN',
    delai: 'Avant le 1er jour',
    color: '#ef4444',
    obligatoire: true,
    urgent: true,
    taches: [
      { id: 'dimona_in', label: '🚨 Soumettre Dimona IN à l\'ONSS', detail: 'OBLIGATOIRE avant le premier jour de travail. Amende : jusqu\'à 1.800€ par travailleur non déclaré. Via portail ONSS ou directement dans Aureus.', lien: 'https://www.socialsecurity.be', obligatoire: true },
      { id: 'type_contrat', label: 'Choisir le type Dimona correct', detail: 'DWR (ouvrier), EMP (employé), STU (étudiant), IVT (intérimaire), FLX (flexi-job), OTH (autres)', obligatoire: true },
      { id: 'confirmation', label: 'Vérifier la confirmation ONSS reçue', detail: 'L\'ONSS renvoie un accusé de réception avec numéro de référence. À conserver.', obligatoire: true },
    ]
  },
  {
    id: 3,
    icon: '📝',
    titre: 'Contrat & Documents',
    delai: 'Jour J',
    color: '#f59e0b',
    obligatoire: true,
    taches: [
      { id: 'contrat_signe', label: 'Faire signer le contrat de travail', detail: 'Le travailleur doit recevoir un exemplaire signé avant ou le jour de l\'entrée en service.', obligatoire: true },
      { id: 'reglement', label: 'Remettre le règlement de travail', detail: 'Document légal obligatoire (loi 8/04/1965). Doit mentionner : horaires, rémunération, avantages, procédures disciplinaires.', obligatoire: true },
      { id: 'fiche_salariale', label: 'Informer sur la structure salariale', detail: 'Barème CP applicable, primes éventuelles, chèques-repas, voiture... À documenter.', obligatoire: true },
      { id: 'iban', label: 'Collecter l\'IBAN pour virement salaire', detail: 'Compte bancaire belge ou SEPA. Vérifier le format BE + 14 chiffres.', obligatoire: true },
      { id: 'rgpd_consent', label: 'Faire signer la déclaration RGPD', detail: 'Informer le travailleur du traitement de ses données personnelles (NISS, coordonnées, salaire). Obligatoire RGPD Art.13.', obligatoire: true },
      { id: 'casier_remis', label: 'Remettre fiche de poste & description de fonction', detail: "Recommandé pour cadrer les attentes et faciliter l'évaluation.", obligatoire: false },
      { id: 'non_concurrence', label: 'Clause de non-concurrence si applicable', detail: "Conditions strictes (CCT n°1/1968) : salaire > 43.609€/an, durée max 12 mois, compensation obligatoire (50% rémunération variable). Invalide si salaire < seuil.", obligatoire: false },
      { id: 'periode_essai', label: '⚠️ Période d\'essai supprimée en droit belge', detail: "Depuis le 1/01/2014, la période d'essai est supprimée pour les CDI. Seuls les contrats étudiants, intérimaires et CDD spéciaux maintiennent des règles particulières. Ne pas insérer de clause d'essai dans un CDI.", obligatoire: true },
    ]
  },
  {
    id: 4,
    icon: '🏛',
    titre: 'ONSS & Cotisations',
    delai: 'Premier trimestre',
    color: '#3b82f6',
    obligatoire: true,
    taches: [
      { id: 'onss_matricule', label: 'Vérifier le matricule employeur ONSS', detail: 'Matricule ONSS à 10 chiffres. Requis pour toutes les déclarations. Visible sur le portail ONSS.', obligatoire: true },
      { id: 'cp', label: 'Identifier la Commission Paritaire applicable', detail: 'Détermine le barème salarial minimum, les primes sectorielles, les congés supplémentaires. Basé sur l\'activité principale de l\'entreprise.', lien: 'https://www.emploi.belgique.be', obligatoire: true },
      { id: 'reduction_bas', label: 'Vérifier les réductions ONSS applicables', detail: 'Bas salaires (< 3.500€ brut), jeunes non qualifiés, travailleurs âgés (+55 ans). Peuvent réduire jusqu\'à 1.500€/trimestre.', obligatoire: false },
      { id: 'activa', label: 'Vérifier éligibilité Activa.brussels / MonBEE', detail: 'Primes à l\'embauche pour demandeurs d\'emploi inscrits chez Actiris. Jusqu\'à 15.900€ sur 3 ans.', lien: 'https://www.actiris.brussels', obligatoire: false },
      { id: 'dmfa', label: 'Prévoir DmfA trimestrielle', detail: 'Déclaration ONSS trimestrielle obligatoire. Délai : dernier jour du mois suivant la fin du trimestre.', obligatoire: true },
      { id: 'af', label: 'Déclarer les allocations familiales', detail: "L'employeur doit s'affilier à une caisse d'allocations familiales (Famiwal, Kidslife, etc.) ou à l'ONSS. Le travailleur reçoit les AF directement de la caisse.", lien: 'https://www.famiwal.be', obligatoire: true },
      { id: 'pension_compl', label: 'Vérifier pension complémentaire sectorielle', detail: 'Certaines CP imposent une assurance groupe ou EIP obligatoire. Ex: CP 200, CP 124. Vérifier la CCT sectorielle applicable.', obligatoire: false },
    ]
  },
  {
    id: 5,
    icon: '💶',
    titre: 'Paie & Fiscalité',
    delai: 'Avant fin du mois',
    color: '#10b981',
    obligatoire: true,
    taches: [
      { id: 'fiche_paie', label: 'Générer la première fiche de paie', detail: 'Doit mentionner : brut, cotisations ONSS (13,07%), précompte professionnel, net à payer, période.', obligatoire: true },
      { id: 'precompte', label: 'Calculer le précompte professionnel correct', detail: 'Basé sur les barèmes SPF Finances 2026. Tenir compte de la situation familiale et des enfants à charge.', obligatoire: true },
      { id: 'bonus_emploi', label: 'Appliquer le bonus à l\'emploi si applicable', detail: 'Pour salaires bruts < 2.997,59€/mois. Réduction PP de 33,14%. Maximum 194,03€/mois.', obligatoire: false },
      { id: 'virement', label: 'Effectuer le virement salaire (SEPA)', detail: 'Fichier SEPA pain.001.xml. Délai légal : pas de délai légal fixe mais généralement fin du mois.', obligatoire: true },
      { id: 'pp_declaration', label: 'Déclarer le précompte professionnel (FinProf)', detail: 'Mensuel si > 50.240€/an, trimestriel sinon. Via application FinProf du SPF Finances.', lien: 'https://finances.belgium.be', obligatoire: true },
    ]
  },
  {
    id: 6,
    icon: '🛡',
    titre: 'Bien-être & Prévention',
    delai: 'Dans les 30 jours',
    color: '#8b5cf6',
    obligatoire: false,
    taches: [
      { id: 'seppt', label: 'Affilier à un service de prévention (SEPPT)', detail: 'Service Externe de Prévention et de Protection au Travail. Obligatoire pour toutes les entreprises. Ex : Mensura, Idewe, Securex...', obligatoire: true },
      { id: 'accidents', label: 'Souscrire assurance accidents du travail', detail: 'Obligatoire légalement (loi 10/04/1971). Déclarer le nouveau travailleur à votre assureur AT.', obligatoire: true },
      { id: 'formation', label: 'Prévoir formation à la sécurité', detail: 'Information sur les risques du poste. Obligatoire pour postes à risque. À documenter dans le registre de formation.', obligatoire: false },
      { id: 'personne_conf', label: 'Informer sur la personne de confiance', detail: 'Obligatoire si > 50 travailleurs ou sur demande d\'un travailleur. Contact interne pour harcèlement/violence.', obligatoire: false },
    ]
  },
  {
    id: 7,
    icon: '📊',
    titre: 'Registre & Documents légaux',
    delai: 'Dans les 8 jours',
    color: '#f97316',
    obligatoire: true,
    taches: [
      { id: 'registre', label: 'Inscrire dans le registre du personnel', detail: 'Obligatoire pour tous les travailleurs. Doit contenir : nom, prénom, adresse, date entrée, fonction, CP, type contrat.', obligatoire: true },
      { id: 'dossier', label: 'Créer le dossier individuel du travailleur', detail: 'Contrat signé, Dimona, NISS, IBAN, fiche de poste, déclaration RGPD. À conserver pendant la durée du contrat + 5 ans.', obligatoire: true },
      { id: 'donnees_supabase', label: 'Encoder dans Aureus Social Pro', detail: 'Employés → Nouvel employé. Toutes les données sont chiffrées AES-256 et stockées dans Supabase Frankfurt (RGPD UE).', obligatoire: true },
    ]
  },
]

export default function EmbaucheAZ() {
  const [etapeActive, setEtapeActive] = useState(1)
  const [tachesCompletes, setTachesCompletes] = useState(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('embauche_az_progress') || '{}') } catch { return {} }
  })
  const [showDetails, setShowDetails] = useState({})

  const toggleTache = (id) => setTachesCompletes(prev => {
    const next = { ...prev, [id]: !prev[id] }
    if (typeof window !== 'undefined') localStorage.setItem('embauche_az_progress', JSON.stringify(next))
    return next
  })
  const toggleDetail = (id) => setShowDetails(prev => ({ ...prev, [id]: !prev[id] }))

  const totalTaches = ETAPES.flatMap(e => e.taches).length
  const totalCompletes = Object.values(tachesCompletes).filter(Boolean).length
  const pct = Math.round(totalCompletes / totalTaches * 100)

  const etapeCourante = ETAPES.find(e => e.id === etapeActive)
  const tachesEtape = etapeCourante?.taches || []
  const completesEtape = tachesEtape.filter(t => tachesCompletes[t.id]).length

  const s = {
    bg: { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 },
    card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 12 },
  }

  return (
    <div style={s.bg}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Embauche A→Z</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Guide complet — Toutes les étapes légales belges pour engager un travailleur</p>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Progression globale</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c6a34e' }}>{totalCompletes}/{totalTaches} tâches</span>
            </div>
            <div style={{ height: 6, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#c6a34e', transition: 'width .3s', borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? '#10b981' : '#c6a34e', minWidth: 48 }}>{pct}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Sidebar étapes */}
        <div>
          {ETAPES.map(e => {
            const completesE = e.taches.filter(t => tachesCompletes[t.id]).length
            const totalE = e.taches.length
            const doneE = completesE === totalE
            const active = etapeActive === e.id
            return (
              <div key={e.id} onClick={() => setEtapeActive(e.id)}
                style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: `1px solid ${active ? e.color + '60' : '#1e1e1e'}`, background: active ? e.color + '12' : '#111', transition: 'all .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{doneE ? '✅' : e.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? e.color : '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titre}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{e.delai}</div>
                  </div>
                  <div style={{ fontSize: 10, color: doneE ? '#10b981' : '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{completesE}/{totalE}</div>
                </div>
                {active && (
                  <div style={{ height: 2, background: e.color, borderRadius: 1, marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${completesE/totalE*100}%`, background: '#10b981', transition: 'width .3s' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contenu étape */}
        <div>
          {etapeCourante && (
            <>
              {/* Header étape */}
              <div style={{ ...s.card, borderColor: etapeCourante.color + '40', background: etapeCourante.color + '08', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{etapeCourante.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>Étape {etapeCourante.id} — {etapeCourante.titre}</span>
                      {etapeCourante.urgent && <span style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>🚨 URGENT</span>}
                      {etapeCourante.obligatoire && <span style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>OBLIGATOIRE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>⏱ {etapeCourante.delai} · {completesEtape}/{tachesEtape.length} tâches complétées</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: completesEtape === tachesEtape.length ? '#10b981' : etapeCourante.color }}>
                    {Math.round(completesEtape/tachesEtape.length*100)}%
                  </div>
                </div>
              </div>

              {/* Tâches */}
              {tachesEtape.map(t => (
                <div key={t.id} style={{ ...s.card, borderColor: tachesCompletes[t.id] ? '#10b98130' : '#1e1e1e', background: tachesCompletes[t.id] ? '#0d1a0d' : '#111', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div onClick={() => toggleTache(t.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${tachesCompletes[t.id] ? '#10b981' : '#2a2a2a'}`, background: tachesCompletes[t.id] ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1, transition: 'all .15s' }}>
                      {tachesCompletes[t.id] && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: tachesCompletes[t.id] ? '#6b7280' : '#f1f5f9', textDecoration: tachesCompletes[t.id] ? 'line-through' : 'none' }}>{t.label}</span>
                        {t.obligatoire && <span style={{ background: '#ef444415', color: '#ef4444', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>OBLIGATOIRE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{t.detail}</div>
                      {t.lien && (
                        <a href={t.lien} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, display: 'inline-block' }}>
                          🔗 Source officielle →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button onClick={() => setEtapeActive(e => Math.max(1, e - 1))} disabled={etapeActive === 1}
                  style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a2a', background: 'transparent', color: etapeActive === 1 ? '#2a2a2a' : '#f1f5f9', cursor: etapeActive === 1 ? 'default' : 'pointer', fontSize: 13 }}>
                  ← Étape précédente
                </button>
                {completesEtape === tachesEtape.length && etapeActive < ETAPES.length && (
                  <button onClick={() => setEtapeActive(e => e + 1)}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: etapeCourante.color, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    Étape suivante →
                  </button>
                )}
                {etapeActive === ETAPES.length && totalCompletes === totalTaches && (
                  <div style={{ padding: '8px 20px', borderRadius: 8, background: '#0d1a0d', color: '#10b981', fontSize: 13, fontWeight: 700, border: '1px solid #10b98140' }}>
                    ✅ Embauche complète !
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
