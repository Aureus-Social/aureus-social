'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function daysUntil(date) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const mins = Math.floor((now - d) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
}

function generateAutoNotifications(trav, clients) {
  const notifs = [];
  const now = new Date();
  const year = now.getFullYear();

  // ONSS deadlines
  const onssDeadlines = [
    { date: new Date(year, 0, 31), label: 'ONSS DMFA T4 ' + (year-1) },
    { date: new Date(year, 3, 30), label: 'ONSS DMFA T1 ' + year },
    { date: new Date(year, 6, 31), label: 'ONSS DMFA T2 ' + year },
    { date: new Date(year, 9, 31), label: 'ONSS DMFA T3 ' + year },
  ];
  onssDeadlines.forEach(dl => {
    const days = daysUntil(dl.date);
    if (days >= 0 && days <= 14) {
      notifs.push({
        id: 'onss-' + dl.label,
        type: days <= 3 ? 'urgent' : 'warning',
        icon: '🏛️',
        title: dl.label,
        message: days === 0 ? "Échéance aujourd'hui !" : `Échéance dans ${days} jour${days > 1 ? 's' : ''}`,
        time: 'Automatique',
        category: 'onss',
      });
    }
  });

  // PP monthly (15th)
  const ppDate = new Date(year, now.getMonth(), 15);
  if (ppDate < now) ppDate.setMonth(ppDate.getMonth() + 1);
  const ppDays = daysUntil(ppDate);
  if (ppDays >= 0 && ppDays <= 7) {
    notifs.push({
      id: 'pp-' + ppDate.getMonth(),
      type: ppDays <= 2 ? 'urgent' : 'warning',
      icon: '📊',
      title: 'Précompte professionnel',
      message: ppDays === 0 ? "Versement PP aujourd'hui !" : `Versement PP dans ${ppDays} jour${ppDays > 1 ? 's' : ''}`,
      time: 'Automatique',
      category: 'fiscal',
    });
  }

  // CDD expiring
  const cddExpiring = trav.filter(t => {
    if (!t.date_fin) return false;
    const days = daysUntil(new Date(t.date_fin));
    return days >= 0 && days <= 30;
  });
  cddExpiring.forEach(t => {
    const days = daysUntil(new Date(t.date_fin));
    notifs.push({
      id: 'cdd-' + (t.id || t.niss),
      type: days <= 7 ? 'urgent' : 'warning',
      icon: '📝',
      title: `CDD expire: ${t.nom || ''} ${t.prenom || ''}`,
      message: `Contrat CDD expire dans ${days} jour${days > 1 ? 's' : ''} (${new Date(t.date_fin).toLocaleDateString('fr-BE')})`,
      time: 'Automatique',
      category: 'contrat',
    });
  });

  // Workers without NISS
  const missingNiss = trav.filter(t => !t.niss || t.niss.length < 11);
  if (missingNiss.length > 0) {
    notifs.push({
      id: 'niss-missing',
      type: 'info',
      icon: '⚠️',
      title: 'NISS manquants',
      message: `${missingNiss.length} travailleur${missingNiss.length > 1 ? 's' : ''} sans numéro national valide`,
      time: 'Automatique',
      category: 'admin',
    });
  }

  // Masse salariale alert
  const masse = trav.reduce((s, t) => s + (t.salaire_brut || 0), 0);
  if (masse > 0) {
    notifs.push({
      id: 'masse-info',
      type: 'info',
      icon: '💰',
      title: 'Masse salariale mensuelle',
      message: `Masse brute: ${masse.toLocaleString('fr-BE')} € — Coût total estimé: ${Math.round(masse * 1.2492).toLocaleString('fr-BE')} €`,
      time: 'Automatique',
      category: 'paie',
    });
  }

  return notifs;
}

const CATEGORY_CONFIG = {
  all:     { label: 'Tout', icon: '📋' },
  onss:    { label: 'ONSS', icon: '🏛️' },
  fiscal:  { label: 'Fiscal', icon: '📊' },
  contrat: { label: 'Contrats', icon: '📝' },
  paie:    { label: 'Paie', icon: '💰' },
  admin:   { label: 'Admin', icon: '⚙️' },
};

const TYPE_STYLES = {
  urgent:  { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', badge: '#ef4444', badgeBg: 'rgba(239,68,68,0.15)' },
  warning: { bg: 'rgba(249,115,22,0.04)', border: 'rgba(249,115,22,0.15)', badge: '#f97316', badgeBg: 'rgba(249,115,22,0.15)' },
  info:    { bg: 'rgba(59,130,246,0.03)', border: 'rgba(59,130,246,0.1)', badge: '#3b82f6', badgeBg: 'rgba(59,130,246,0.1)' },
  success: { bg: 'rgba(34,197,94,0.03)', border: 'rgba(34,197,94,0.1)', badge: '#22c55e', badgeBg: 'rgba(34,197,94,0.1)' },
};

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [fid, setFid] = useState(null);
  const [trav, setTrav] = useState([]);
  const [clients, setClients] = useState([]);
  const [dbNotifs, setDbNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

        // Try to load notifications from DB (may not exist yet)
        try {
          const { data: notifs } = await supabase
            .from('sp_notifications')
            .select('*')
            .eq('fiduciaire_id', f.id)
            .order('created_at', { ascending: false })
            .limit(50);
          setDbNotifs(notifs || []);
        } catch (e) {
          // Table may not exist yet
        }
      }
      setLoading(false);
    })();
  }, []);

  const autoNotifs = generateAutoNotifications(trav, clients);
  
  // Merge auto + db notifications
  const allNotifs = [
    ...autoNotifs,
    ...dbNotifs.map(n => ({
      id: 'db-' + n.id,
      type: n.type || 'info',
      icon: '📋',
      title: n.titre || n.title || 'Notification',
      message: n.message || n.contenu || '',
      time: n.created_at ? timeAgo(n.created_at) : '',
      category: n.categorie || 'admin',
      lue: n.lue,
    })),
  ].filter(n => filter === 'all' || n.category === filter);

  const urgentCount = allNotifs.filter(n => n.type === 'urgent').length;
  const warningCount = allNotifs.filter(n => n.type === 'warning').length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c9a227', fontFamily: "'Outfit',system-ui,sans-serif" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .notif-row:hover{transform:translateX(4px)}
        .filter-btn:hover{border-color:#c9a227!important;color:#c9a227!important}
        @media(max-width:768px){
          .notif-header{flex-direction:column;gap:12px;align-items:flex-start!important}
          .notif-desc{display:none!important}
          .summary-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b' }} className="notif-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/sprint10/dashboard" style={{ textDecoration: 'none', color: '#64748b', fontSize: 20, marginRight: 4 }}>←</Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>🔔 Centre de notifications</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{allNotifs.length} notification{allNotifs.length > 1 ? 's' : ''} active{allNotifs.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 32px' }}>
        {/* SUMMARY CARDS */}
        <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>Urgent</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>{urgentCount}</div>
          </div>
          <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 600, textTransform: 'uppercase' }}>Attention</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>{warningCount}</div>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>Info</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>{allNotifs.filter(n => n.type === 'info').length}</div>
          </div>
          <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#c9a227', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#c9a227', fontFamily: 'monospace' }}>{allNotifs.length}</div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} className="filter-btn" style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === key ? 'rgba(201,162,39,0.15)' : 'transparent',
              color: filter === key ? '#c9a227' : '#94a3b8',
              border: `1px solid ${filter === key ? 'rgba(201,162,39,0.4)' : '#1e293b'}`,
            }}>{cfg.icon} {cfg.label}</button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Aucune notification</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Tout est en ordre !</div>
            </div>
          ) : (
            allNotifs.map((n, i) => {
              const ts = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              return (
                <div key={n.id || i} className="notif-row" style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10,
                  background: ts.bg, border: `1px solid ${ts.border}`, transition: 'transform 0.15s',
                }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{n.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: ts.badgeBg, color: ts.badge, textTransform: 'uppercase' }}>
                        {n.type}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{n.message}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', flexShrink: 0, textAlign: 'right' }}>{n.time}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
