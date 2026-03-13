'use client';
import { useState, useMemo } from 'react';
const PROC_PFA = {
  id: 'prime_fin_annee', icon: '💸', categorie: 'remuneration',
  titre: "Prime de fin d'année (13e mois)",
  resume: "Pas d'obligation légale générale, mais imposée par quasi toutes les CCT sectorielles. CP 200 : 13e mois = salaire brut de décembre. Prorata si entrée/sortie en cours d'année. Congé maternité/paternité/adoption : prime à maintenir intégralement. Soumis ONSS + PP normaux.",
  baseLegale: [
    { ref: "CCT sectorielle applicable", desc: "13e mois — montant, conditions, date de paiement selon CP" },
    { ref: "CCT n°13 du 28/05/1975", desc: "Prime de fin d'année — cadre interprofessionnel" },
    { ref: "Loi 12/04/1965", desc: "Protection de la rémunération — la prime est de la rémunération" },
    { ref: "AR 28/11/1969", desc: "ONSS — prime de fin d'année soumise à cotisations normales" },
  ],
  etapes: [
    { n: 1, titre: "Vérifier la CCT et les conditions", obligatoire: true, duree_estimee: '1h',
      detail: `═══ SOURCES DU DROIT ═══
1. CCT sectorielle (la plus fréquente) — ex. CP 200 : 13e mois obligatoire
2. CCT d'entreprise — peut prévoir conditions plus favorables
3. Contrat de travail individuel
4. Usage constant et généralisé (3 ans+ = droit acquis — jurisprudence)

═══ CP 200 — EXEMPLE TYPE ═══
• 13e mois = salaire brut de décembre
• Payable avant le 31 décembre
• Prorata si présence incomplète
• Base : salaire au moment du paiement (indexé)

═══ BASE DE CALCUL ═══
Comprend : salaire de base + primes régulières et fixes
Exclut en général : HS, frais propres, chèques-repas, ATN voiture (à vérifier CCT)`,
      delai: 'Paiement avant le 31 décembre (selon CCT)' },
    { n: 2, titre: "Calcul du prorata — entrées/sorties", obligatoire: true, duree_estimee: '1h',
      detail: `═══ PRINCIPE ═══
Prime = Montant plein × (mois travaillés / 12)
Ou : Prime = Montant plein × (jours travaillés / jours calendrier)

═══ EXEMPLES CP 200 ═══
• Entrée le 01/04 : 9/12 = 75% du 13e mois
• Sortie le 30/06 : 6/12 = 50% (si pas de condition de présence fin d'année)
• CDD de 3 mois (mai-juillet) : 3/12

═══ CAS PARTICULIERS ═══
• Maladie courte durée : compte généralement pour le prorata
• Maladie longue durée (>30j) : vérifier CCT — souvent réduit après 1 mois
• Congé maternité/paternité/adoption : À MAINTENIR INTÉGRALEMENT (art. 39 L. 3/07/1978)
• Temps partiel : prorata sur base du régime (80% = 80% de la prime)
• Crédit-temps : selon CCT — souvent maintenu partiellement`,
    },
    { n: 3, titre: "Calcul ONSS et PP sur la prime", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ RÉGIME FISCAL ET SOCIAL ═══
• Prime de fin d'année = rémunération ordinaire
• Soumise ONSS travailleur (13,07%) et patronal (~27%)
• Soumise au précompte professionnel (PP)

═══ CALCUL PP ═══
Méthode : PP calculé sur le salaire annualisé
(Salaire mensuel × 12 + Prime) = revenu annuel estimé
→ PP annuel recalculé − PP déjà versé = PP à retenir sur la prime

Avec logiciel de paie : saisir la prime comme "prime exceptionnelle" en décembre
→ Le logiciel recalcule automatiquement

═══ EXEMPLE (brut 3.000€) ═══
Prime brute = 3.000€
ONSS travailleur (−13,07%) = −392,10€
PP estimé (~26,5%) = ~−688€
Net prime estimé = ~1.920€`,
      delai: 'Retenu sur fiche de paie de décembre' },
    { n: 4, titre: "DmfA et fiche fiscale 281.10", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ DmfA Q4 ═══
• La prime figure dans la DmfA du 4e trimestre
• Code rémunération spécifique (voir instructions ONSS)
• À déclarer dans le mois de paiement effectif

═══ BELCOTAX 281.10 ═══
• La prime figure dans les rémunérations imposables de l'année
• Rubrique "Rémunérations ordinaires"
• Délai Belcotax : 28/02 de l'année suivante`,
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "La prime de fin d'année est de la RÉMUNÉRATION — une fois octroyée régulièrement (3 ans+), elle ne peut être supprimée unilatéralement. Usage crée le droit acquis (jurisprudence constante)." },
    { niveau: 'critique', texte: "Congé maternité/paternité/adoption : prime à maintenir INTÉGRALEMENT. Réduire la prime pour absence maternité = discrimination illégale (art. 39 L. 3/07/1978)." },
    { niveau: 'important', texte: "Vérifier la CCT pour les travailleurs sortis en cours d'année : certaines CCT donnent droit au prorata même après démission, d'autres exigent la présence au 31/12." },
  ],
  simulation: {
    titre: "Prime fin d'année — brut 3.000 €/mois (CP 200 — 13e mois)",
    lignes: [
      { label: 'Montant brut prime', montant: '3.000,00 €', type: 'neutre' },
      { label: 'ONSS travailleur (−13,07%)', montant: '−392,10 €', type: 'neutre' },
      { label: 'PP estimé (~26,5% base)', montant: '~−688 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Net prime estimé', montant: '~1.920 €', type: 'neutre' },
      { label: 'Coût total employeur (+ONSS pat.)', montant: '~3.810 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "La prime de fin d'année est-elle obligatoire légalement ?", r: "Pas légalement en général, mais quasi universellement obligatoire par CCT sectorielle. Vérifier la CCT de la CP applicable. Si aucune CCT, vérifier l'usage et les contrats individuels." },
    { q: "Un travailleur à temps partiel a-t-il droit à la prime ?", r: "Oui — au prorata de son régime. Ex: 80% = 80% de la prime équivalent temps plein. Discriminer les temps partiels est illégal (CCT n°35)." },
    { q: "Peut-on payer la prime en novembre pour l'année entière ?", r: "Oui si la CCT le prévoit. Elle est imposable au titre de l'année en cours et figure dans la DmfA Q4." },
  ],
  formulaires: [
    { nom: "ONSS — Instructions DmfA primes", url: "https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/salary/index.html", type: 'technique' },
  ],
};
export default function ProcedurePrimeFinAnnee() {
  const P = PROC_PFA;
  const [eo, sEo] = useState(null);
  const [ev, sEv] = useState({});
  const [ong, sO] = useState('etapes');
  const tg = n => sEo(eo === n ? null : n);
  const tV = n => sEv(p => ({ ...p, [n]: !p[n] }));
  const pr = useMemo(() => {
    const t = P.etapes.filter(e => e.obligatoire).length;
    const f = P.etapes.filter(e => e.obligatoire && ev[e.n]).length;
    return { t, f, p: t ? Math.round(f / t * 100) : 0 };
  }, [ev]);
  const og = [
    { id: 'etapes', l: 'Étapes', i: '📋' },
    { id: 'simulation', l: 'Coûts', i: '🧮' },
    { id: 'alertes', l: 'Alertes', i: '⚠️' },
    { id: 'faq', l: 'FAQ', i: '❓' },
    { id: 'legal', l: 'Base légale', i: '⚖️' },
  ];
  const s = {
    pg: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', maxWidth: 960, margin: '0 auto', padding: 24, background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh' },
    ti: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0 },
    rs: { fontSize: 15, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 },
    pb: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 24 },
    pt: { height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' },
    pf: p => ({ height: '100%', width: `${p}%`, background: p === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width .5s' }),
    ts: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
    tb: a => ({ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: a ? 700 : 500, background: a ? '#3b82f6' : '#1e293b', color: a ? '#fff' : '#94a3b8' }),
    st2: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 },
    cd: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    ac: n => ({ background: n === 'critique' ? '#dc262610' : n === 'important' ? '#f9731620' : '#3b82f610', border: `1px solid ${n === 'critique' ? '#dc262640' : n === 'important' ? '#f9731640' : '#3b82f630'}`, borderRadius: 12, padding: 16, marginBottom: 8 }),
    an: n => ({ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: n === 'critique' ? '#ef4444' : n === 'important' ? '#f97316' : '#3b82f6', marginBottom: 6 }),
    ec: (o, v) => ({ background: v ? '#22c55e08' : '#111827', border: `1px solid ${v ? '#22c55e30' : o ? '#3b82f650' : '#1e293b'}`, borderRadius: 12, marginBottom: 8, borderLeft: `4px solid ${v ? '#22c55e' : '#3b82f6'}` }),
    eh: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
    en: v => ({ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: v ? '#22c55e' : '#3b82f620', color: v ? '#fff' : '#3b82f6', flexShrink: 0 }),
    et: { flex: 1, fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
    eb: o => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: o ? '#ef444420' : '#64748b20', color: o ? '#f87171' : '#64748b', fontWeight: 600 }),
    ed: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' },
    em: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    mi: c => ({ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${c}15`, color: c }),
    cb: ch => ({ width: 20, height: 20, borderRadius: 4, border: `2px solid ${ch ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: ch ? '#22c55e' : 'transparent' }),
    sr: t => ({ display: 'flex', justifyContent: 'space-between', padding: t === 'separateur' ? 0 : '10px 0', borderBottom: t === 'separateur' ? '1px solid #1e293b' : 'none', marginBottom: t === 'separateur' ? 8 : 0 }),
    sl: t => ({ fontSize: 14, color: t?.includes('vert') ? '#4ade80' : '#cbd5e1', fontWeight: t === 'vert_bold' ? 700 : 400 }),
    sm: t => ({ fontSize: t === 'vert_bold' ? 18 : 14, fontWeight: t?.includes('vert') ? 700 : 400, color: t?.includes('vert') ? '#4ade80' : '#f1f5f9', fontFamily: 'monospace' }),
  };
  return (
    <div style={s.pg}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={s.ti}>{P.icon} {P.titre}</h1>
        <p style={s.rs}>{P.resume}</p>
      </div>
      <div style={s.pb}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Progression : {pr.f}/{pr.t}</span>
          <span style={{ fontWeight: 700, color: pr.p === 100 ? '#22c55e' : '#3b82f6' }}>{pr.p}%</span>
        </div>
        <div style={s.pt}><div style={s.pf(pr.p)} /></div>
      </div>
      <div style={s.ts}>
        {og.map(o => <button key={o.id} style={s.tb(ong === o.id)} onClick={() => sO(o.id)}>{o.i} {o.l}</button>)}
      </div>
      {ong === 'etapes' && <div>{P.etapes.map(e => {
        const o = eo === e.n, v = ev[e.n];
        return <div key={e.n} style={s.ec(o, v)}>
          <div style={s.eh} onClick={() => tg(e.n)}>
            <div style={s.cb(v)} onClick={x => { x.stopPropagation(); tV(e.n); }}>{v && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}</div>
            <div style={s.en(v)}>{e.n}</div>
            <span style={s.et}>{e.titre}</span>
            <span style={s.eb(e.obligatoire)}>{e.obligatoire ? 'Obligatoire' : 'Info'}</span>
            <span style={{ color: '#64748b', fontSize: 18, transform: o ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>▾</span>
          </div>
          {o && <div style={{ padding: '0 16px 16px 60px' }}>
            <div style={s.ed}>{e.detail}</div>
            <div style={s.em}>
              {e.delai && <span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}
              {e.duree_estimee && <span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}
              {e.formulaire && <span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}
              {e.ou && <span style={s.mi('#64748b')}>📍 {e.ou}</span>}
            </div>
          </div>}
        </div>;
      })}
      </div>}
      {ong === 'simulation' && <div>
        <h2 style={s.st2}>🧮 {P.simulation.titre}</h2>
        <div style={s.cd}>
          {P.simulation.lignes.map((r, i) => r.type === 'separateur'
            ? <div key={i} style={s.sr('separateur')} />
            : <div key={i} style={s.sr(r.type)}>
              <span style={s.sl(r.type)}>{r.label}</span>
              <span style={s.sm(r.type)}>{r.montant}</span>
            </div>)}
        </div>
      </div>}
      {ong === 'alertes' && <div>
        <h2 style={s.st2}>⚠️ Alertes</h2>
        {P.alertes.map((a, i) => <div key={i} style={s.ac(a.niveau)}>
          <div style={s.an(a.niveau)}>{a.niveau}</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>{a.texte}</div>
        </div>)}
      </div>}
      {ong === 'faq' && <div>
        <h2 style={s.st2}>❓ FAQ</h2>
        {P.faq.map((f, i) => <div key={i} style={s.cd}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>Q : {f.q}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>R : {f.r}</div>
        </div>)}
      </div>}
      {ong === 'legal' && <div>
        <h2 style={s.st2}>⚖️ Base légale</h2>
        {P.baseLegale.map((l, i) => <div key={i} style={s.cd}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>{l.ref}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{l.desc}</div>
        </div>)}
        {P.formulaires && <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>📎 Formulaires officiels</h3>
          {P.formulaires.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 14px', background: '#111827', borderRadius: 8, marginBottom: 6, color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>🔗 {f.nom}</a>)}
        </div>}
      </div>}
    </div>
  );
}
export { PROC_PFA };
