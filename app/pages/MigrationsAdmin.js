'use client';
import { useState, useEffect } from 'react';

const GOLD = '#C9963A';

export default function MigrationsAdmin({ state }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [autoRan, setAutoRan] = useState(false);

  // Auto-exécution au chargement si admin
  useEffect(() => {
    if (!autoRan && (state?.userRole === 'admin' || state?.user?.email === 'info@aureus-ia.com')) {
      setAutoRan(true);
      runMigrations();
    }
  }, [state]);

  const runMigrations = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET || '';
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${secret}`, 'Content-Type': 'application/json' }
      });
      const j = await res.json();
      setResults(j.results || []);
      setStatus(j);
    } catch(e) {
      setStatus({ ok: false, error: e.message });
    }
    setLoading(false);
  };

  const statusColor = (s) => s === 'success' ? '#4CAF80' : s === 'skipped' ? '#6B6860' : '#E05C3A';
  const statusIcon = (s) => s === 'success' ? '✅' : s === 'skipped' ? '⏭️' : '❌';

  return (
    <div style={{ padding: 24, color: '#e8e6e0', fontFamily: 'Inter, sans-serif', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>⚙️ Migrations Base de Données</h2>
          <p style={{ fontSize: 13, color: '#6B6860', margin: '4px 0 0' }}>Exécution automatique des migrations Supabase</p>
        </div>
        <button onClick={runMigrations} disabled={loading}
          style={{ background: loading ? '#2A2A30' : GOLD, color: loading ? '#6B6860' : '#000', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontSize: 14 }}>
          {loading ? '⏳ En cours...' : '▶️ Lancer migrations'}
        </button>
      </div>

      {status && (
        <div style={{ background: status.ok ? '#4CAF8020' : '#E05C3A20', border: `1px solid ${status.ok ? '#4CAF80' : '#E05C3A'}40`, borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: status.ok ? '#4CAF80' : '#E05C3A' }}>
            {status.ok ? '✅ Migrations terminées' : '❌ Erreurs détectées'}
          </div>
          {status.summary && <div style={{ fontSize: 13, color: '#6B6860', marginTop: 4 }}>{status.summary}</div>}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0D0D0E' }}>
                {['Migration', 'Nom', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6B6860', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #1A1A1E' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: '#6B6860' }}>{r.id}</td>
                  <td style={{ padding: '10px 16px', color: '#e8e6e0' }}>{r.name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ color: statusColor(r.status), fontWeight: 600 }}>
                      {statusIcon(r.status)} {r.status}
                    </span>
                    {r.error && <div style={{ fontSize: 11, color: '#E05C3A', marginTop: 2 }}>{r.error}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, background: '#1A1A1E', border: '1px solid #2A2A30', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#6B6860', lineHeight: 1.7 }}>
          <strong style={{ color: GOLD }}>Comment ça marche :</strong><br/>
          Ce module exécute automatiquement toutes les migrations SQL en attente sur Supabase.<br/>
          Chaque migration est tracée dans la table <code style={{ color: '#5B9BD6' }}>_migrations</code>.<br/>
          Les migrations déjà exécutées sont ignorées — aucun risque de doublon.
        </div>
      </div>
    </div>
  );
}
