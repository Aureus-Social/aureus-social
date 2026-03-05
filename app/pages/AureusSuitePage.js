'use client';
import { useState, useMemo } from 'react';

// ═══ AUREUS IA SUITE — Module IA complet ═══

const C = ({ children, title, sub, color }) => (
  <div style={{ background: 'rgba(198,163,78,.03)', borderRadius: 12, padding: 16, border: '1px solid ' + (color || 'rgba(198,163,78,.08)'), marginBottom: 14 }}>
    {title && <div style={{ fontSize: 13, fontWeight: 600, color: color || '#c6a34e', marginBottom: sub ? 2 : 10 }}>{title}</div>}
    {sub && <div style={{ fontSize: 10, color: '#888', marginBottom: 10 }}>{sub}</div>}
    {children}
  </div>
);

const Row = ({ l, v, c, b }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: b ? '8px 0' : '5px 0', borderBottom: b ? '2px solid rgba(198,163,78,.2)' : '1px solid rgba(255,255,255,.03)', fontWeight: b ? 700 : 400 }}>
    <span style={{ color: '#e8e6e0', fontSize: 11.5 }}>{l}</span>
    <span style={{ color: c || '#c6a34e', fontWeight: 600, fontSize: 12 }}>{v}</span>
  </div>
);

const Badge = ({ text, color }) => (
  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30` }}>{text}</span>
);

// ═══ Prediction Turnover ═══
function PredictionTurnover({ emps }) {
  const data = useMemo(() => {
    if (!emps || !emps.length) return { risk: [], stats: {} };
    const now = new Date();
    const scored = emps.map(e => {
      let score = 0;
      // Anciennete < 1 an = risque
      if (e.dateEntree) {
        const entry = new Date(e.dateEntree);
        const months = (now - entry) / (1000 * 60 * 60 * 24 * 30);
        if (months < 12) score += 30;
        else if (months < 24) score += 15;
      }
      // Absences frequentes
      const absCount = (e.absences || []).length;
      if (absCount > 5) score += 25;
      else if (absCount > 2) score += 10;
      // Contrat CDD
      if (e.typeContrat === 'CDD' || e.typeContrat === 'cdd') score += 20;
      // Age proche retraite
      if (e.dateNaissance) {
        const age = (now - new Date(e.dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25);
        if (age > 60) score += 25;
        else if (age > 55) score += 10;
      }
      // Pas d'augmentation recente
      if (!e.derniereAugmentation) score += 10;
      return { ...e, riskScore: Math.min(score, 100) };
    });
    const risk = scored.filter(e => e.riskScore > 20).sort((a, b) => b.riskScore - a.riskScore);
    const highRisk = scored.filter(e => e.riskScore >= 60).length;
    const medRisk = scored.filter(e => e.riskScore >= 30 && e.riskScore < 60).length;
    const lowRisk = scored.filter(e => e.riskScore > 0 && e.riskScore < 30).length;
    return { risk, stats: { highRisk, medRisk, lowRisk, total: emps.length } };
  }, [emps]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(239,68,68,.06)', borderRadius: 12, border: '1px solid rgba(239,68,68,.15)' }}>
          <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 4 }}>🔴 Risque eleve</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{data.stats.highRisk || 0}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(251,191,36,.06)', borderRadius: 12, border: '1px solid rgba(251,191,36,.15)' }}>
          <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 4 }}>🟡 Risque moyen</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{data.stats.medRisk || 0}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(74,222,128,.06)', borderRadius: 12, border: '1px solid rgba(74,222,128,.15)' }}>
          <div style={{ fontSize: 10, color: '#4ade80', marginBottom: 4 }}>🟢 Risque faible</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4ade80' }}>{data.stats.lowRisk || 0}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(198,163,78,.06)', borderRadius: 12, border: '1px solid rgba(198,163,78,.15)' }}>
          <div style={{ fontSize: 10, color: '#c6a34e', marginBottom: 4 }}>📊 Total analyse</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#c6a34e' }}>{data.stats.total || 0}</div>
        </div>
      </div>

      <C title="Employes a risque de depart" sub="Classe par score de risque decroissant">
        {data.risk.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#5e5c56', fontSize: 12 }}>Aucun employe a risque detecte. Ajoutez des employes pour activer l'analyse.</div>}
        {data.risk.slice(0, 15).map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
            <div>
              <span style={{ fontSize: 12, color: '#e8e6e0', fontWeight: 500 }}>{e.prenom || ''} {e.nom || 'Employe ' + (i + 1)}</span>
              <span style={{ fontSize: 10, color: '#5e5c56', marginLeft: 8 }}>{e.typeContrat || 'CDI'} · {e.fonction || ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 60, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                <div style={{ width: e.riskScore + '%', height: '100%', borderRadius: 3, background: e.riskScore >= 60 ? '#ef4444' : e.riskScore >= 30 ? '#f59e0b' : '#4ade80' }} />
              </div>
              <Badge text={e.riskScore + '%'} color={e.riskScore >= 60 ? '#ef4444' : e.riskScore >= 30 ? '#f59e0b' : '#4ade80'} />
            </div>
          </div>
        ))}
      </C>

      <C title="Facteurs de risque analyses" sub="Criteres utilises par le modele predictif">
        <Row l="Anciennete < 12 mois" v="+30 pts" />
        <Row l="Anciennete 12-24 mois" v="+15 pts" />
        <Row l="Absences frequentes (>5)" v="+25 pts" />
        <Row l="Contrat CDD" v="+20 pts" />
        <Row l="Age > 60 ans (retraite)" v="+25 pts" />
        <Row l="Pas d'augmentation recente" v="+10 pts" />
      </C>
    </div>
  );
}

// ═══ Recommandations Salariales ═══
function RecoSalariales({ emps }) {
  const recos = useMemo(() => {
    if (!emps || !emps.length) return [];
    const now = new Date();
    return emps.map(e => {
      const brut = e.salaireBrut || e.brutMensuel || 0;
      const anciennete = e.dateEntree ? Math.floor((now - new Date(e.dateEntree)) / (1000 * 60 * 60 * 24 * 365.25)) : 0;
      let recoAugment = 0;
      let raison = '';
      // Sous le median marche
      if (brut < 3200 && anciennete > 2) { recoAugment = Math.round(brut * 0.05); raison = 'Salaire sous la mediane du marche'; }
      // Anciennete sans augmentation
      else if (anciennete > 3 && !e.derniereAugmentation) { recoAugment = Math.round(brut * 0.03); raison = 'Aucune augmentation depuis l\'embauche'; }
      // Performance
      else if (anciennete > 1) { recoAugment = Math.round(brut * 0.02); raison = 'Indexation + merite'; }
      return { ...e, recoAugment, raison, anciennete, brut };
    }).filter(e => e.recoAugment > 0).sort((a, b) => b.recoAugment - a.recoAugment);
  }, [emps]);

  const totalImpact = recos.reduce((s, r) => s + r.recoAugment, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160, padding: 16, background: 'rgba(198,163,78,.06)', borderRadius: 12, border: '1px solid rgba(198,163,78,.15)' }}>
          <div style={{ fontSize: 10, color: '#c6a34e', marginBottom: 4 }}>💡 Recommandations</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#c6a34e' }}>{recos.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, padding: 16, background: 'rgba(96,165,250,.06)', borderRadius: 12, border: '1px solid rgba(96,165,250,.15)' }}>
          <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 4 }}>💰 Impact mensuel total</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa' }}>€{totalImpact.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, padding: 16, background: 'rgba(167,139,250,.06)', borderRadius: 12, border: '1px solid rgba(167,139,250,.15)' }}>
          <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 4 }}>📈 Impact annuel</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>€{(totalImpact * 13.92).toLocaleString()}</div>
          <div style={{ fontSize: 9, color: '#5e5c56', marginTop: 2 }}>13.92 mois (pecule + 13e mois)</div>
        </div>
      </div>

      <C title="Recommandations individuelles" sub="Basees sur anciennete, marche et performance">
        {recos.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#5e5c56', fontSize: 12 }}>Aucune recommandation. Ajoutez des employes avec salaire pour activer l'analyse.</div>}
        {recos.slice(0, 20).map((r, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12, color: '#e8e6e0', fontWeight: 500 }}>{r.prenom || ''} {r.nom || 'Employe ' + (i + 1)}</span>
                <span style={{ fontSize: 10, color: '#5e5c56', marginLeft: 8 }}>{r.anciennete} ans · €{r.brut.toLocaleString()}/mois</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>+€{r.recoAugment}/mois</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#9e9b93', marginTop: 3 }}>💡 {r.raison}</div>
          </div>
        ))}
      </C>
    </div>
  );
}

// ═══ Detection Anomalies ═══
function DetectionAnomalies({ emps }) {
  const anomalies = useMemo(() => {
    if (!emps || !emps.length) return [];
    const results = [];
    emps.forEach(e => {
      const nom = (e.prenom || '') + ' ' + (e.nom || '');
      const brut = e.salaireBrut || e.brutMensuel || 0;
      // Salaire a 0
      if (brut === 0) results.push({ type: 'critical', employe: nom, message: 'Salaire brut a 0€', icon: '🔴' });
      // Salaire sous le RMMMG
      if (brut > 0 && brut < 1954.99) results.push({ type: 'warning', employe: nom, message: 'Salaire sous le RMMMG (1.954,99€)', icon: '🟡' });
      // Pas de NISS
      if (!e.niss && !e.registreNational) results.push({ type: 'warning', employe: nom, message: 'Numero NISS manquant', icon: '🟡' });
      // Pas de date entree
      if (!e.dateEntree) results.push({ type: 'info', employe: nom, message: 'Date d\'entree non renseignee', icon: '🔵' });
      // Pas de contrat
      if (!e.typeContrat) results.push({ type: 'info', employe: nom, message: 'Type de contrat non renseigne', icon: '🔵' });
      // Salaire anormalement eleve
      if (brut > 15000) results.push({ type: 'warning', employe: nom, message: 'Salaire anormalement eleve (>15.000€)', icon: '🟡' });
      // Commission paritaire manquante
      if (!e.commissionParitaire && !e.cp) results.push({ type: 'info', employe: nom, message: 'Commission paritaire non renseignee', icon: '🔵' });
    });
    return results.sort((a, b) => {
      const ord = { critical: 0, warning: 1, info: 2 };
      return (ord[a.type] || 3) - (ord[b.type] || 3);
    });
  }, [emps]);

  const critical = anomalies.filter(a => a.type === 'critical').length;
  const warnings = anomalies.filter(a => a.type === 'warning').length;
  const infos = anomalies.filter(a => a.type === 'info').length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(239,68,68,.06)', borderRadius: 12, border: '1px solid rgba(239,68,68,.15)' }}>
          <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 4 }}>🔴 Critiques</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{critical}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(251,191,36,.06)', borderRadius: 12, border: '1px solid rgba(251,191,36,.15)' }}>
          <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 4 }}>🟡 Alertes</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{warnings}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(96,165,250,.06)', borderRadius: 12, border: '1px solid rgba(96,165,250,.15)' }}>
          <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 4 }}>🔵 Informations</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa' }}>{infos}</div>
        </div>
      </div>

      <C title="Anomalies detectees" sub={anomalies.length + ' anomalies trouvees'}>
        {anomalies.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#4ade80', fontSize: 12 }}>✅ Aucune anomalie detectee. Toutes les donnees sont coherentes.</div>}
        {anomalies.slice(0, 30).map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11.5, color: '#e8e6e0', fontWeight: 500 }}>{a.employe}</span>
              <span style={{ fontSize: 10, color: '#9e9b93', marginLeft: 8 }}>{a.message}</span>
            </div>
            <Badge text={a.type === 'critical' ? 'Critique' : a.type === 'warning' ? 'Alerte' : 'Info'} color={a.type === 'critical' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : '#60a5fa'} />
          </div>
        ))}
      </C>
    </div>
  );
}

// ═══ What-If Simulator ═══
function WhatIfSimulator({ emps }) {
  const [scenario, setScenario] = useState('augmentation');
  const [pct, setPct] = useState(3);
  const [nbEmps, setNbEmps] = useState(0);

  const totalBrut = useMemo(() => (emps || []).reduce((s, e) => s + (e.salaireBrut || e.brutMensuel || 0), 0), [emps]);
  const nbActifs = (emps || []).length;

  const impact = useMemo(() => {
    switch (scenario) {
      case 'augmentation': {
        const augMensuel = Math.round(totalBrut * pct / 100);
        const cotisONSS = Math.round(augMensuel * 0.2507);
        const coutTotal = augMensuel + cotisONSS;
        return { augMensuel, cotisONSS, coutTotal, annuel: coutTotal * 13.92 };
      }
      case 'embauche': {
        const salaireMoyen = nbActifs > 0 ? Math.round(totalBrut / nbActifs) : 3500;
        const nouveauBrut = salaireMoyen * (nbEmps || 1);
        const cotis = Math.round(nouveauBrut * 0.2507);
        return { augMensuel: nouveauBrut, cotisONSS: cotis, coutTotal: nouveauBrut + cotis, annuel: (nouveauBrut + cotis) * 13.92 };
      }
      case 'licenciement': {
        const salaireMoyen = nbActifs > 0 ? Math.round(totalBrut / nbActifs) : 3500;
        const eco = salaireMoyen * (nbEmps || 1);
        const cotis = Math.round(eco * 0.2507);
        return { augMensuel: -eco, cotisONSS: -cotis, coutTotal: -(eco + cotis), annuel: -((eco + cotis) * 13.92) };
      }
      case 'indexation': {
        const idx = Math.round(totalBrut * pct / 100);
        const cotis = Math.round(idx * 0.2507);
        return { augMensuel: idx, cotisONSS: cotis, coutTotal: idx + cotis, annuel: (idx + cotis) * 13.92 };
      }
      default: return { augMensuel: 0, cotisONSS: 0, coutTotal: 0, annuel: 0 };
    }
  }, [scenario, pct, nbEmps, totalBrut, nbActifs]);

  const scenarios = [
    { v: 'augmentation', l: '📈 Augmentation generale' },
    { v: 'embauche', l: '👤 Nouvelles embauches' },
    { v: 'licenciement', l: '📉 Reduction d\'effectifs' },
    { v: 'indexation', l: '📊 Indexation salariale' },
  ];

  return (
    <div>
      <C title="Parametres du scenario" sub="Simulez l'impact financier de vos decisions RH">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {scenarios.map(sc => (
            <button key={sc.v} onClick={() => setScenario(sc.v)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid ' + (scenario === sc.v ? 'rgba(198,163,78,.5)' : 'rgba(255,255,255,.08)'), background: scenario === sc.v ? 'rgba(198,163,78,.12)' : 'rgba(255,255,255,.02)', color: scenario === sc.v ? '#c6a34e' : '#9e9b93', fontSize: 11, cursor: 'pointer', fontWeight: scenario === sc.v ? 600 : 400 }}>
              {sc.l}
            </button>
          ))}
        </div>

        {(scenario === 'augmentation' || scenario === 'indexation') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#5e5c56', marginBottom: 4 }}>Pourcentage (%)</div>
            <input type="number" value={pct} onChange={e => setPct(Number(e.target.value))} min={0} max={50} step={0.5} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(198,163,78,.15)', background: 'rgba(198,163,78,.04)', color: '#e8e6e0', fontSize: 13, width: 120 }} />
          </div>
        )}
        {(scenario === 'embauche' || scenario === 'licenciement') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#5e5c56', marginBottom: 4 }}>Nombre d'employes</div>
            <input type="number" value={nbEmps} onChange={e => setNbEmps(Number(e.target.value))} min={0} max={500} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(198,163,78,.15)', background: 'rgba(198,163,78,.04)', color: '#e8e6e0', fontSize: 13, width: 120 }} />
          </div>
        )}
      </C>

      <C title="Impact financier" sub="Estimation basee sur les donnees actuelles">
        <Row l="Masse salariale actuelle (mensuel)" v={'€' + totalBrut.toLocaleString()} />
        <Row l="Variation brut mensuel" v={(impact.augMensuel >= 0 ? '+' : '') + '€' + impact.augMensuel.toLocaleString()} c={impact.augMensuel >= 0 ? '#ef4444' : '#4ade80'} />
        <Row l="Cotisations ONSS employeur (25,07%)" v={(impact.cotisONSS >= 0 ? '+' : '') + '€' + impact.cotisONSS.toLocaleString()} c={impact.cotisONSS >= 0 ? '#ef4444' : '#4ade80'} />
        <Row l="Cout total mensuel" v={(impact.coutTotal >= 0 ? '+' : '') + '€' + impact.coutTotal.toLocaleString()} c={impact.coutTotal >= 0 ? '#ef4444' : '#4ade80'} b />
        <Row l="Impact annuel (13,92 mois)" v={(impact.annuel >= 0 ? '+' : '') + '€' + Math.round(impact.annuel).toLocaleString()} c={impact.annuel >= 0 ? '#ef4444' : '#4ade80'} b />
      </C>
    </div>
  );
}

// ═══ KPI Dashboard ═══
function KPIDashboardIA({ emps }) {
  const stats = useMemo(() => {
    if (!emps || !emps.length) return {};
    const now = new Date();
    const totalBrut = emps.reduce((s, e) => s + (e.salaireBrut || e.brutMensuel || 0), 0);
    const avgBrut = Math.round(totalBrut / emps.length);
    const medianBrut = (() => {
      const sorted = emps.map(e => e.salaireBrut || e.brutMensuel || 0).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    })();
    const cdi = emps.filter(e => !e.typeContrat || e.typeContrat === 'CDI' || e.typeContrat === 'cdi').length;
    const cdd = emps.filter(e => e.typeContrat === 'CDD' || e.typeContrat === 'cdd').length;
    const hommes = emps.filter(e => e.sexe === 'M' || e.genre === 'M').length;
    const femmes = emps.filter(e => e.sexe === 'F' || e.genre === 'F').length;
    const avgAge = (() => {
      const ages = emps.filter(e => e.dateNaissance).map(e => (now - new Date(e.dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
      return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '-';
    })();
    const masseSalariale = totalBrut;
    const cotisONSS = Math.round(totalBrut * 0.2507);
    const coutTotal = totalBrut + cotisONSS;

    return { totalBrut, avgBrut, medianBrut, cdi, cdd, hommes, femmes, avgAge, masseSalariale, cotisONSS, coutTotal, total: emps.length };
  }, [emps]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { icon: '👥', label: 'Effectif total', value: stats.total || 0, color: '#c6a34e' },
          { icon: '💰', label: 'Masse salariale', value: '€' + (stats.masseSalariale || 0).toLocaleString(), color: '#4ade80' },
          { icon: '📊', label: 'Salaire moyen', value: '€' + (stats.avgBrut || 0).toLocaleString(), color: '#60a5fa' },
          { icon: '🏛', label: 'Cout ONSS employeur', value: '€' + (stats.cotisONSS || 0).toLocaleString(), color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 140, padding: 16, background: 'rgba(255,255,255,.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ fontSize: 10, color: '#9e9b93', marginBottom: 4 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <C title="Repartition contrats">
          <Row l="CDI" v={stats.cdi || 0} c="#4ade80" />
          <Row l="CDD" v={stats.cdd || 0} c="#f59e0b" />
          <Row l="Autres" v={Math.max(0, (stats.total || 0) - (stats.cdi || 0) - (stats.cdd || 0))} c="#60a5fa" />
        </C>
        <C title="Demographie">
          <Row l="Hommes" v={stats.hommes || 0} c="#60a5fa" />
          <Row l="Femmes" v={stats.femmes || 0} c="#e879f9" />
          <Row l="Age moyen" v={stats.avgAge || '-'} c="#c6a34e" />
        </C>
        <C title="Couts mensuels">
          <Row l="Masse salariale brute" v={'€' + (stats.masseSalariale || 0).toLocaleString()} />
          <Row l="Cotisations ONSS (25,07%)" v={'€' + (stats.cotisONSS || 0).toLocaleString()} c="#ef4444" />
          <Row l="Cout total employeur" v={'€' + (stats.coutTotal || 0).toLocaleString()} c="#c6a34e" b />
        </C>
        <C title="Indicateurs cles">
          <Row l="Salaire median" v={'€' + (stats.medianBrut || 0).toLocaleString()} />
          <Row l="Salaire moyen" v={'€' + (stats.avgBrut || 0).toLocaleString()} />
          <Row l="Cout annuel total" v={'€' + Math.round((stats.coutTotal || 0) * 13.92).toLocaleString()} c="#c6a34e" b />
        </C>
      </div>
    </div>
  );
}

// ═══ PAGE PRINCIPALE ═══
export default function AureusSuitePage({ s, d }) {
  const sub = s.sub || 'ia_turnover';
  const emps = s.emps || s.employees || [];

  const tabs = [
    { id: 'ia_turnover', l: '🧠 Prediction Turnover', icon: '🧠' },
    { id: 'ia_salaire', l: '💡 Reco Salariales', icon: '💡' },
    { id: 'ia_anomalies', l: '🔍 Anomalies', icon: '🔍' },
    { id: 'what_if', l: '🔮 What-If', icon: '🔮' },
    { id: 'kpi_dashboard', l: '📈 KPI Dashboard', icon: '📈' },
  ];

  return (
    <div>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(139,115,60,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e8e6e0' }}>🔷 Aureus IA — Intelligence Artificielle RH</div>
          <div style={{ fontSize: 11.5, color: '#9e9b93', marginTop: 2 }}>Analyse predictive, recommandations et detection d'anomalies</div>
        </div>
        <Badge text={emps.length + ' employes'} color="#c6a34e" />
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,.04)', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => d({ type: 'SET_PAGE', page: 'aureussuite', sub: tab.id })} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid ' + (sub === tab.id ? 'rgba(198,163,78,.4)' : 'rgba(255,255,255,.06)'), background: sub === tab.id ? 'rgba(198,163,78,.1)' : 'transparent', color: sub === tab.id ? '#c6a34e' : '#9e9b93', fontSize: 11, cursor: 'pointer', fontWeight: sub === tab.id ? 600 : 400 }}>
            {tab.l}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {sub === 'ia_turnover' && <PredictionTurnover emps={emps} />}
        {sub === 'ia_salaire' && <RecoSalariales emps={emps} />}
        {sub === 'ia_anomalies' && <DetectionAnomalies emps={emps} />}
        {sub === 'what_if' && <WhatIfSimulator emps={emps} />}
        {sub === 'kpi_dashboard' && <KPIDashboardIA emps={emps} />}
      </div>
    </div>
  );
}
