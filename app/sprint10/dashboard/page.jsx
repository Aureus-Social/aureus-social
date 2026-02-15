'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Belgian legal deadlines 2026
function getUpcomingDeadlines() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const allDeadlines = [
    // ONSS quarterly
    { date: new Date(year, 0, 31), label: 'ONSS T4 ' + (year-1), type: 'onss', desc: 'Déclaration DMFA trimestrielle Q4' },
    { date: new Date(year, 3, 30), label: 'ONSS T1 ' + year, type: 'onss', desc: 'Déclaration DMFA trimestrielle Q1' },
    { date: new Date(year, 6, 31), label: 'ONSS T2 ' + year, type: 'onss', desc: 'Déclaration DMFA trimestrielle Q2' },
    { date: new Date(year, 9, 31), label: 'ONSS T3 ' + year, type: 'onss', desc: 'Déclaration DMFA trimestrielle Q3' },
    // Précompte professionnel monthly (15th)
    ...Array.from({length:12}, (_,i) => ({
      date: new Date(year, i, 15),
      label: 'Précompte ' + ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i],
      type: 'pp',
      desc: 'Versement précompte professionnel'
    })),
    // Pécule de vacances
    { date: new Date(year, 4, 31), label: 'Pécule vacances', type: 'vacances', desc: 'Paiement pécule de vacances employés' },
    // Belcotax
    { date: new Date(year, 2, 1), label: 'Belcotax 281.10', type: 'fiscal', desc: 'Fiches fiscales 281.10 via Belcotax-on-web' },
    // Prime de fin d'année
    { date: new Date(year, 11, 20), label: 'Prime fin année', type: 'prime', desc: 'Paiement 13ème mois / prime de fin d\'année' },
    // Bilan social
    { date: new Date(year, 5, 30), label: 'Bilan social', type: 'admin', desc: 'Dépôt bilan social BNB' },
    // Indexation (variable but typically January)
    { date: new Date(year, 0, 1), label: 'Indexation salariale', type: 'index', desc: 'Vérification application indexation CP' },
  ];

  return allDeadlines
    .filter(d => d.date >= new Date(now.getTime() - 86400000)) // include today
    .sort((a, b) => a.date - b.date)
    .slice(0, 8);
}

function daysUntil(date) {
  const now = new Date();
  now.setHours(0,0,0,0);
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TYPE_COLORS = {
  onss: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', icon: 'O' },
  pp: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#f97316', icon: 'PP' },
  vacances: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', icon: 'V' },
  fiscal: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7', icon: 'F' },
  prime: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', icon: '€' },
  admin: { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', text: '#6b7280', icon: 'B' },
  index: { bg: 'rgba(201,162,39,0.1)', border: 'rgba(201,162,39,0.3)', text: '#c9a227', icon: 'I' },
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [fid, setFid] = useState(null);
  const [clients, setClients] = useState([]);
  const [trav, setTrav] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const deadlines = getUpcomingDeadlines();

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/sprint10/auth'; return; }
      setUser(u);

      const { data: f } = await supabase.from('fiduciaires').select('*').eq('user_id', u.id).single();
      setFid(f);

      if (f) {
        const { data: cl } = await supabase.from('sp_clients').select('*').eq('fiduciaire_id', f.id);
        setClients(cl || []);

        const ids = (cl || []).map(c => c.id);
        if (ids.length) {
          const { data: tr } = await supabase.from('sp_travailleurs').select('*').in('client_id', ids);
          setTrav(tr || []);
        }

        // Load notifications
        const { data: notifs } = await supabase
          .from('sp_notifications')
          .select('*')
          .eq('fiduciaire_id', f.id)
          .eq('lue', false)
          .order('created_at', { ascending: false })
          .limit(5);
        setNotifications(notifs || []);
      }
      setLoading(false);
    })();
  }, []);

  // Generate automatic alerts
  const autoAlerts = [];
  const nextDeadline = deadlines[0];
  if (nextDeadline) {
    const days = daysUntil(nextDeadline.date);
    if (days <= 7) {
      autoAlerts.push({ type: 'urgent', text: `${nextDeadline.label} dans ${days} jour${days > 1 ? 's' : ''} — ${nextDeadline.desc}` });
    }
  }
  
  // CDD expiring alerts
  const cddExpiring = trav.filter(t => {
    if (!t.date_fin) return false;
    const days = daysUntil(new Date(t.date_fin));
    return days >= 0 && days <= 30;
  });
  if (cddExpiring.length > 0) {
    autoAlerts.push({ type: 'warning', text: `${cddExpiring.length} CDD expire${cddExpiring.length > 1 ? 'nt' : ''} dans les 30 prochains jours` });
  }

  // Stats
  const masse = trav.reduce((s, t) => s + (t.salaire_brut || 0), 0);
  const coutTotal = masse * 1.2492;
  const actifs = trav.filter(t => !t.date_fin || new Date(t.date_fin) > new Date()).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c9a227', fontFamily: "'Outfit',system-ui,sans-serif" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .dash-card:hover{border-color:#c9a227!important;transform:translateY(-2px);transition:all 0.2s}
        .action-card:hover{border-color:#c9a227!important;background:rgba(201,162,39,0.05)!important}
        .deadline-row:hover{background:rgba(201,162,39,0.03)}
        @media(max-width:768px){
          .kpi-grid{grid-template-columns:repeat(2,1fr)!important}
          .main-grid{grid-template-columns:1fr!important}
          .actions-grid{grid-template-columns:repeat(2,1fr)!important}
          .dash-header{flex-direction:column;gap:12px;align-items:flex-start!important}
        }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b' }} className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#c9a227', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#0a0e1a' }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Aureus Social Pro</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{fid?.nom || 'Cabinet'} — {fid?.bce || ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/sprint10/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#131825', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}>🔔</div>
            {(notifications.length + autoAlerts.length) > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.length + autoAlerts.length}
              </div>
            )}
          </Link>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{user?.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/sprint10/auth'; }} style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </header>

      <div style={{ padding: '24px 32px' }}>
        {/* WELCOME */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#f1f5f9' }}>
            Bonjour{fid?.responsable ? ', ' + fid.responsable : ''} !
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ALERTS BAR */}
        {autoAlerts.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {autoAlerts.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 8, borderRadius: 8,
                background: a.type === 'urgent' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                border: `1px solid ${a.type === 'urgent' ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.25)'}`,
              }}>
                <span style={{ fontSize: 16 }}>{a.type === 'urgent' ? '🚨' : '⚠️'}</span>
                <span style={{ fontSize: 13, color: a.type === 'urgent' ? '#ef4444' : '#f97316', fontWeight: 500 }}>{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { l: 'CLIENTS', v: clients.length, c: '#3b82f6', sub: 'sociétés gérées' },
            { l: 'TRAVAILLEURS', v: trav.length, c: '#22c55e', sub: `${actifs} actifs` },
            { l: 'MASSE SALARIALE', v: masse.toLocaleString('fr-BE') + ' €', c: '#f97316', sub: 'brut mensuel' },
            { l: 'COÛT TOTAL', v: Math.round(coutTotal).toLocaleString('fr-BE') + ' €', c: '#ef4444', sub: 'charges incluses' },
            { l: 'PROCHAINE ÉCHÉANCE', v: nextDeadline ? daysUntil(nextDeadline.date) + 'j' : '—', c: '#c9a227', sub: nextDeadline?.label || '' },
          ].map((k, i) => (
            <div key={i} className="dash-card" style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, padding: '18px 20px', transition: 'all 0.2s', cursor: 'default' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.l}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.c, marginTop: 6, fontFamily: 'monospace' }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* MAIN GRID: Deadlines + Activity */}
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          
          {/* CALENDRIER LEGAL */}
          <div style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#c9a227', margin: 0 }}>📅 Échéances légales</h2>
              <Link href="/sprint10/calendrier" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}>Voir tout →</Link>
            </div>
            <div>
              {deadlines.slice(0, 5).map((d, i) => {
                const days = daysUntil(d.date);
                const tc = TYPE_COLORS[d.type] || TYPE_COLORS.admin;
                const isUrgent = days <= 7;
                return (
                  <div key={i} className="deadline-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6, marginBottom: 4, transition: 'background 0.15s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: tc.text, flexShrink: 0 }}>
                      {tc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{formatDate(d.date)}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                      background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(201,162,39,0.1)',
                      color: isUrgent ? '#ef4444' : '#c9a227',
                    }}>
                      {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `${days}j`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVITÉ RÉCENTE / NOTIFICATIONS */}
          <div style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#c9a227', margin: 0 }}>🔔 Notifications</h2>
              <Link href="/sprint10/notifications" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}>Voir tout →</Link>
            </div>
            {notifications.length === 0 && autoAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 13 }}>
                Aucune notification pour le moment
              </div>
            ) : (
              <div>
                {autoAlerts.map((a, i) => (
                  <div key={'auto-' + i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 4, background: 'rgba(239,68,68,0.03)' }}>
                    <span style={{ fontSize: 14, marginTop: 1 }}>{a.type === 'urgent' ? '🚨' : '⚠️'}</span>
                    <div>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{a.text}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Automatique</div>
                    </div>
                  </div>
                ))}
                {notifications.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, marginTop: 1 }}>📋</span>
                    <div>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{n.message || n.titre}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{n.created_at ? formatDate(n.created_at) : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS RAPIDES */}
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#c9a227', marginBottom: 14 }}>⚡ Actions rapides</h2>
        <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { h: '/sprint10/clients', l: 'Clients', d: 'Gérer entreprises', i: '🏢' },
            { h: '/sprint10/travailleurs', l: 'Travailleurs', d: 'Fiches employés', i: '👤' },
            { h: '/sprint10/paie', l: 'Calculer paie', d: 'Brut → Net', i: '💰' },
            { h: '/sprint10/calendrier', l: 'Calendrier', d: 'Échéances légales', i: '📅' },
            { h: '/sprint10/notifications', l: 'Notifications', d: 'Alertes & rappels', i: '🔔' },
            { h: '/sprint9/precompte', l: 'Précompte', d: 'Calculer PP', i: '📊' },
            { h: '/sprint9/onss', l: 'ONSS', d: 'Cotisations', i: '🏛️' },
            { h: '/sprint9/dimona', l: 'Dimona', d: 'Déclarations', i: '📝' },
            { h: '/sprint9/vacances', l: 'Vacances', d: 'Congés & pécule', i: '🌴' },
            { h: '/sprint9', l: 'Tous modules', d: '17 modules Sprint 9', i: '📦' },
          ].map((a, i) => (
            <Link key={i} href={a.h} style={{ textDecoration: 'none' }}>
              <div className="action-card" style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.i}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{a.l}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{a.d}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 20, color: '#334155', fontSize: 11 }}>
          Aureus Social Pro v1.0 — Aureus IA SPRL — BE 1028.230.781
        </div>
      </div>
    </div>
  );
}
