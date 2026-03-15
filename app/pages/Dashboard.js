'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/app/lib/auth-fetch'

export default function Dashboard({ s, d, onNavigate }) {
  const [stats, setStats] = useState({ emps: 0, clients: 0, fiches: 0, impayes: 0 })
  const [loading, setLoading] = useState(true)
  const [echeances, setEcheances] = useState([])

  useEffect(() => {
    // Calculer stats depuis le state passé
    const emps = (s?.emps || []).filter(e => e.status === 'active' || !e.status).length
    const clients = (s?.clients || []).length
    const fiches = (s?.pays || s?.payrollHistory || []).length
    const impayes = (s?.pays || s?.payrollHistory || []).filter(p => p.statut_paiement !== 'paye').length * 2

    setStats({ emps, clients, fiches, impayes })
    setLoading(false)

    // Calculer prochaines échéances
    const now = new Date()
    const q = Math.floor(now.getMonth() / 3) + 1
    const year = now.getFullYear()
    const month = now.getMonth()

    const all = [
      { label: 'DmfA T' + q + ' ' + year, date: new Date(year, q * 3, 30), cat: 'ONSS' },
      { label: 'Précompte professionnel', date: new Date(year, month + 1, 15), cat: 'PP' },
      { label: 'MonBEE deadline', date: new Date(2026, 5, 1), cat: 'AIDES' },
    ]
    .map(e => ({ ...e, days: Math.ceil((e.date - now) / (1000 * 60 * 60 * 24)) }))
    .filter(e => e.days > 0 && e.days <= 60)
    .sort((a, b) => a.days - b.days)

    setEcheances(all)
  }, [s])

  const nav = (page) => {
    if (onNavigate) onNavigate(page)
    else if (d) d({ type: 'NAV', page })
  }

  const TH = { bg: '#0a0a0a', card: '#111', border: '#1e1e1e', text: '#f1f5f9', text2: '#6b7280', gold: '#c6a34e' }

  const kpis = [
    { icon: '👥', label: 'Employés actifs', value: stats.emps, color: '#3b82f6', page: 'employees', sub: 'travailleurs' },
    { icon: '🏢', label: 'Clients actifs', value: stats.clients, color: '#10b981', page: 'checklistclient', sub: 'sociétés' },
    { icon: '📄', label: 'Fiches générées', value: stats.fiches, color: '#f59e0b', page: 'payslip', sub: 'ce mois' },
    { icon: '💰', label: 'À encaisser', value: `${stats.impayes}€`, color: '#f97316', page: 'facturationfiches', sub: 'fiches impayées' },
  ]

  const shortcuts = [
    { icon: '🚀', label: 'Embauche A→Z', page: 'embaucheaz', color: '#c6a34e', desc: 'Guide complet 203 tâches' },
    { icon: '📡', label: 'Dimona IN', page: 'declarations', color: '#ef4444', desc: 'Déclarer un travailleur', urgent: true },
    { icon: '◈', label: 'Fiche de paie', page: 'payslip', color: '#3b82f6', desc: 'Générer & envoyer' },
    { icon: '🧮', label: 'Calcul salaire', page: 'calcinstant', color: '#8b5cf6', desc: 'Brut → Net instantané' },
    { icon: '💶', label: 'Aides embauche', page: 'aidesembauche', color: '#10b981', desc: 'Activa, MonBEE, réductions' },
    { icon: '📊', label: 'Barèmes 2026', page: 'baremescp', color: '#f59e0b', desc: 'CP, PP, RMMMG à jour' },
    { icon: '📤', label: 'Export compta', page: 'exportcompta', color: '#06b6d4', desc: 'WinBooks, BOB, Exact' },
    { icon: '💳', label: 'SEPA virements', page: 'sepa', color: '#a855f7', desc: 'Fichier pain.001' },
  ]

  return (
    <div style={{ background: TH.bg, color: TH.text, minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: TH.gold, letterSpacing: '.5px' }}>
          Aureus Social Pro
        </h1>
        <div style={{ fontSize: 12, color: TH.text2, marginTop: 4 }}>
          {new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}Aureus IA SPRL · BCE BE 1028.230.781
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} onClick={() => nav(k.page)}
            style={{ background: TH.card, border: `1px solid ${TH.border}`, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = k.color + '40'}
            onMouseLeave={e => e.currentTarget.style.borderColor = TH.border}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
              <span style={{ fontSize: 11, color: TH.text2 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{loading ? '...' : k.value}</div>
            <div style={{ fontSize: 10, color: TH.text2, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Raccourcis */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: TH.text2, letterSpacing: '1px', marginBottom: 12 }}>ACCÈS RAPIDE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
            {shortcuts.map(sh => (
              <div key={sh.label} onClick={() => nav(sh.page)}
                style={{ background: TH.card, border: `1px solid ${sh.urgent ? sh.color + '40' : TH.border}`, borderRadius: 10, padding: '14px 12px', cursor: 'pointer', textAlign: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = sh.color + '10'}
                onMouseLeave={e => e.currentTarget.style.background = TH.card}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{sh.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: sh.urgent ? sh.color : TH.text, marginBottom: 3 }}>{sh.label}</div>
                <div style={{ fontSize: 10, color: TH.text2 }}>{sh.desc}</div>
                {sh.urgent && <div style={{ marginTop: 6, fontSize: 9, background: sh.color, color: '#fff', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>OBLIGATOIRE</div>}
              </div>
            ))}
          </div>

          {/* Flux A→Z */}
          <div style={{ background: TH.card, border: `1px solid ${TH.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TH.gold }}>🚀 Embauche A→Z</div>
                <div style={{ fontSize: 11, color: TH.text2, marginTop: 2 }}>203 tâches légales belges — guide complet</div>
              </div>
              <button onClick={() => nav('embaucheaz')}
                style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: TH.gold, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                Ouvrir →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {[
                { icon: '📋', label: 'Vérifications', n: 1 },
                { icon: '📡', label: 'Dimona IN', n: 2, urgent: true },
                { icon: '📝', label: 'Contrat & Docs', n: 3 },
                { icon: '🏛', label: 'ONSS', n: 4 },
                { icon: '💰', label: 'Paie & PP', n: 5 },
                { icon: '🛡', label: 'Bien-être', n: 6 },
              ].map(step => (
                <div key={step.n} onClick={() => nav('embaucheaz')}
                  style={{ padding: '8px 10px', borderRadius: 8, background: step.urgent ? 'rgba(239,68,68,.08)' : 'rgba(255,255,255,.02)', border: `1px solid ${step.urgent ? 'rgba(239,68,68,.2)' : TH.border}`, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, marginBottom: 3 }}>{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.urgent ? '#ef4444' : TH.text }}>{step.n}. {step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Échéances */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: TH.text2, letterSpacing: '1px', marginBottom: 12 }}>PROCHAINES ÉCHÉANCES</div>
          <div style={{ background: TH.card, border: `1px solid ${TH.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            {echeances.length === 0 ? (
              <div style={{ fontSize: 12, color: TH.text2, textAlign: 'center', padding: 16 }}>✅ Aucune échéance proche</div>
            ) : echeances.map((e, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < echeances.length - 1 ? `1px solid ${TH.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{e.label}</div>
                    <div style={{ fontSize: 10, color: TH.text2 }}>{e.date.toLocaleDateString('fr-BE')}</div>
                  </div>
                  <span style={{ background: e.days <= 7 ? '#ef444420' : e.days <= 14 ? '#f9741620' : '#3b82f620', color: e.days <= 7 ? '#ef4444' : e.days <= 14 ? '#f97316' : '#3b82f6', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                    J-{e.days}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Liens rapides admin */}
          <div style={{ background: TH.card, border: `1px solid ${TH.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TH.text2, marginBottom: 12 }}>ADMINISTRATION</div>
            {[
              { icon: '👥', label: 'Gestion utilisateurs', page: 'gestionutilisateurs' },
              { icon: '💾', label: 'Backup & Sécurité', page: 'securite' },
              { icon: '📊', label: 'Audit Trail', page: 'securite' },
              { icon: '⚙️', label: 'Paramètres', page: 'admin' },
            ].map(link => (
              <div key={link.label} onClick={() => nav(link.page)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${TH.border}`, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = TH.gold}
                onMouseLeave={e => e.currentTarget.style.color = TH.text}>
                <span>{link.icon}</span>
                <span style={{ fontSize: 12 }}>{link.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: TH.text2 }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
