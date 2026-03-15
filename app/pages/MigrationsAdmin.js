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

      {/* Migration 007 — pgcrypto NISS/IBAN */}
      <div style={{ marginTop: 16, background: '#0d1117', border: '1px solid #1e3a5f', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>🔐 Migration 007 — pgcrypto NISS/IBAN</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Chiffrement AES-256 des données sensibles · RGPD obligatoire avant premier client</div>
          </div>
          <button
            onClick={async () => {
              try {
                const r = await fetch('/api/migrate/pgcrypto', { method: 'POST' });
                const j = await r.json();
                const sqlStep = j.results?.find(r => r.step === 'sql_complet');
                if (sqlStep?.sql) {
                  navigator.clipboard?.writeText(sqlStep.sql).catch(()=>{});
                  alert('✅ SQL copié dans le presse-papier !\n\nColler dans : Supabase Dashboard → SQL Editor → Run\n\nURL : https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/sql');
                } else {
                  alert(j.ok ? `✅ ${j.message}` : `❌ ${j.error || 'Erreur inconnue'}`);
                }
              } catch(e) { alert('Erreur : ' + e.message); }
            }}
            style={{ background: '#1e3a5f', color: '#3b82f6', border: '1px solid #1e3a5f', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
          >
            Obtenir le SQL →
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#4b5563' }}>
          Génère le SQL à coller dans <b style={{ color: '#3b82f6' }}>Supabase Dashboard → SQL Editor</b> · Colonnes <code style={{ color: '#5B9BD6' }}>niss_enc</code> + <code style={{ color: '#5B9BD6' }}>iban_enc</code>
        </div>
        <a href="https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/sql" target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#3b82f6', textDecoration: 'underline' }}>
          → Ouvrir Supabase SQL Editor
        </a>
      </div>

      {/* Migration 008 — RLS Multi-tenant */}
      <div style={{ marginTop: 16, background: '#0d1117', border: '1px solid #10b98140', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>🔒 Migration 008 — RLS Multi-tenant</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Isolation données portail employé · employees / fiches_paie / clients / payroll_history</div>
          </div>
          <button
            onClick={async () => {
              try {
                const r = await fetch('/api/migrate/multitenant', { method: 'POST' });
                const j = await r.json();
                const sqlStep = j.results?.find(r => r.step === 'sql_rls_complet');
                if (sqlStep?.sql) {
                  navigator.clipboard?.writeText(sqlStep.sql).catch(()=>{});
                  alert('✅ SQL RLS copié dans le presse-papier !\n\nColler dans : Supabase Dashboard → SQL Editor → Run\n\nURL : https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/sql');
                } else {
                  alert(j.ok ? `✅ ${j.message}` : `❌ ${j.error || 'Erreur inconnue'}`);
                }
              } catch(e) { alert('Erreur : ' + e.message); }
            }}
            style={{ background: '#0d2818', color: '#10b981', border: '1px solid #10b981', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
          >
            Obtenir le SQL →
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#4b5563' }}>
          Génère le SQL à coller dans <b style={{ color: '#10b981' }}>Supabase Dashboard → SQL Editor</b> · RLS policies + index email
        </div>
        <a href="https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/sql" target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#10b981', textDecoration: 'underline' }}>
          → Ouvrir Supabase SQL Editor
        </a>
      </div>
    </div>
  );
}
