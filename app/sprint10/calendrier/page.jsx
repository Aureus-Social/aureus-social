'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function generateDeadlines(year) {
  const deadlines = [];

  // ONSS DMFA trimestrielles
  [
    { m: 0, d: 31, q: 'T4 ' + (year-1) },
    { m: 3, d: 30, q: 'T1 ' + year },
    { m: 6, d: 31, q: 'T2 ' + year },
    { m: 9, d: 31, q: 'T3 ' + year },
  ].forEach(({ m, d, q }) => {
    deadlines.push({ date: new Date(year, m, d), label: 'ONSS DMFA ' + q, type: 'onss', desc: 'Déclaration trimestrielle DMFA auprès de l\'ONSS', priority: 'critique' });
  });

  // ONSS provisions mensuelles
  for (let i = 0; i < 12; i++) {
    deadlines.push({ date: new Date(year, i, 5), label: 'Provision ONSS ' + ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i], type: 'onss', desc: 'Versement provision cotisations ONSS mensuelles', priority: 'haute' });
  }

  // Précompte professionnel mensuel
  for (let i = 0; i < 12; i++) {
    deadlines.push({ date: new Date(year, i, 15), label: 'Précompte Prof. ' + ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i], type: 'pp', desc: 'Versement précompte professionnel au SPF Finances', priority: 'critique' });
  }

  // Pécule de vacances
  deadlines.push({ date: new Date(year, 4, 31), label: 'Pécule de vacances (employés)', type: 'vacances', desc: 'Paiement pécule de vacances simple & double pour employés', priority: 'critique' });
  deadlines.push({ date: new Date(year, 3, 30), label: 'Pécule vacances (ouvriers ONVA)', type: 'vacances', desc: 'Vérification versement ONVA pour ouvriers', priority: 'haute' });

  // Fiches fiscales
  deadlines.push({ date: new Date(year, 1, 28), label: 'Fiches 281.10 — Préparation', type: 'fiscal', desc: 'Préparation des fiches fiscales 281.10 employés', priority: 'haute' });
  deadlines.push({ date: new Date(year, 2, 1), label: 'Belcotax-on-web', type: 'fiscal', desc: 'Envoi fiches 281.10 et 281.20 via Belcotax', priority: 'critique' });

  // Prime de fin d'année
  deadlines.push({ date: new Date(year, 11, 20), label: 'Prime de fin d\'année', type: 'prime', desc: 'Paiement 13ème mois / prime fin d\'année selon CP', priority: 'haute' });

  // Bilan social
  deadlines.push({ date: new Date(year, 5, 30), label: 'Bilan social BNB', type: 'admin', desc: 'Dépôt du bilan social auprès de la BNB', priority: 'moyenne' });

  // Indexation
  deadlines.push({ date: new Date(year, 0, 1), label: 'Vérification indexation', type: 'index', desc: 'Vérification et application de l\'indexation salariale par CP', priority: 'haute' });

  // Eco-chèques
  deadlines.push({ date: new Date(year, 5, 30), label: 'Éco-chèques', type: 'prime', desc: 'Commande et attribution éco-chèques (si applicable par CP)', priority: 'moyenne' });

  // Congés légaux
  deadlines.push({ date: new Date(year, 0, 1), label: 'Ouverture exercice vacances', type: 'vacances', desc: 'Nouveau solde de congés légaux — 20 jours base temps plein', priority: 'basse' });

  // Jours fériés belges
  const holidays = [
    { m: 0, d: 1, l: 'Jour de l\'An' },
    { m: 3, d: 6, l: 'Lundi de Pâques' },
    { m: 4, d: 1, l: 'Fête du Travail' },
    { m: 4, d: 14, l: 'Ascension' },
    { m: 4, d: 25, l: 'Lundi de Pentecôte' },
    { m: 6, d: 21, l: 'Fête nationale' },
    { m: 7, d: 15, l: 'Assomption' },
    { m: 10, d: 1, l: 'Toussaint' },
    { m: 10, d: 11, l: 'Armistice' },
    { m: 11, d: 25, l: 'Noël' },
  ];
  holidays.forEach(h => {
    deadlines.push({ date: new Date(year, h.m, h.d), label: h.l, type: 'ferie', desc: 'Jour férié légal belge — rémunéré', priority: 'info' });
  });

  return deadlines.sort((a, b) => a.date - b.date);
}

const TYPE_CONFIG = {
  onss:     { label: 'ONSS', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', icon: '🏛️' },
  pp:       { label: 'Précompte', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#f97316', icon: '📊' },
  vacances: { label: 'Vacances', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', icon: '🌴' },
  fiscal:   { label: 'Fiscal', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7', icon: '📋' },
  prime:    { label: 'Primes', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', icon: '💰' },
  admin:    { label: 'Admin', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', text: '#6b7280', icon: '📁' },
  index:    { label: 'Indexation', bg: 'rgba(201,162,39,0.1)', border: 'rgba(201,162,39,0.3)', text: '#c9a227', icon: '📈' },
  ferie:    { label: 'Férié', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#818cf8', icon: '🎉' },
};

const PRIORITY_BADGE = {
  critique: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  haute:    { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  moyenne:  { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  basse:    { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  info:     { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
};

function daysUntil(date) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

export default function CalendrierPage() {
  const [year] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState('all');
  const [showPast, setShowPast] = useState(false);
  const allDeadlines = generateDeadlines(year);

  const now = new Date();
  const filtered = allDeadlines
    .filter(d => filter === 'all' || d.type === filter)
    .filter(d => showPast || d.date >= new Date(now.getTime() - 86400000));

  // Group by month
  const grouped = {};
  filtered.forEach(d => {
    const key = d.date.toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  const types = Object.keys(TYPE_CONFIG);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .cal-row:hover{background:rgba(201,162,39,0.03)}
        .filter-btn:hover{border-color:#c9a227!important;color:#c9a227!important}
        @media(max-width:768px){
          .filter-bar{flex-wrap:wrap}
          .cal-desc{display:none!important}
        }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/sprint10/dashboard" style={{ textDecoration: 'none', color: '#64748b', fontSize: 20, marginRight: 4 }}>←</Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>📅 Calendrier Légal {year}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Toutes les échéances sociales et fiscales belges</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} style={{ accentColor: '#c9a227' }} />
            Voir passées
          </label>
        </div>
      </header>

      <div style={{ padding: '24px 32px' }}>
        {/* FILTER BAR */}
        <div className="filter-bar" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} className="filter-btn" style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            background: filter === 'all' ? '#c9a227' : 'transparent',
            color: filter === 'all' ? '#0a0e1a' : '#94a3b8',
            border: filter === 'all' ? '1px solid #c9a227' : '1px solid #1e293b',
          }}>Tout ({allDeadlines.filter(d => showPast || d.date >= new Date(now.getTime() - 86400000)).length})</button>
          {types.map(t => {
            const count = allDeadlines.filter(d => d.type === t && (showPast || d.date >= new Date(now.getTime() - 86400000))).length;
            if (count === 0) return null;
            const tc = TYPE_CONFIG[t];
            return (
              <button key={t} onClick={() => setFilter(t)} className="filter-btn" style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: filter === t ? tc.bg : 'transparent',
                color: filter === t ? tc.text : '#94a3b8',
                border: `1px solid ${filter === t ? tc.border : '#1e293b'}`,
              }}>{tc.icon} {tc.label} ({count})</button>
            );
          })}
        </div>

        {/* DEADLINES BY MONTH */}
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#c9a227', textTransform: 'capitalize', margin: '0 0 10px', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              {month}
            </h3>
            {items.map((d, i) => {
              const tc = TYPE_CONFIG[d.type];
              const pb = PRIORITY_BADGE[d.priority] || PRIORITY_BADGE.info;
              const days = daysUntil(d.date);
              const isPast = days < 0;
              const isToday = days === 0;
              const isUrgent = days > 0 && days <= 7;
              return (
                <div key={i} className="cal-row" style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 2,
                  opacity: isPast ? 0.4 : 1, transition: 'background 0.15s',
                }}>
                  {/* Type icon */}
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {tc.icon}
                  </div>
                  {/* Date */}
                  <div style={{ width: 90, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#c9a227' : '#e2e8f0' }}>
                      {d.date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      {d.date.toLocaleDateString('fr-BE', { weekday: 'short' })}
                    </div>
                  </div>
                  {/* Label & desc */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{d.label}</div>
                    <div className="cal-desc" style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{d.desc}</div>
                  </div>
                  {/* Priority badge */}
                  <div style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10, background: pb.bg, color: pb.color, textTransform: 'uppercase', flexShrink: 0 }}>
                    {d.priority}
                  </div>
                  {/* Days badge */}
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12, flexShrink: 0, minWidth: 60, textAlign: 'center',
                    background: isPast ? 'rgba(107,114,128,0.1)' : isToday ? 'rgba(201,162,39,0.2)' : isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(30,41,59,0.5)',
                    color: isPast ? '#64748b' : isToday ? '#c9a227' : isUrgent ? '#ef4444' : '#94a3b8',
                  }}>
                    {isPast ? 'Passé' : isToday ? "Aujourd'hui" : days === 1 ? 'Demain' : `${days}j`}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 15 }}>Aucune échéance à afficher</div>
          </div>
        )}
      </div>
    </div>
  );
}
