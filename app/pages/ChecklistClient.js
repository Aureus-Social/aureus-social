'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLang } from '../lib/lang-context';
import { authFetch } from '@/app/lib/auth-fetch';

// ═══════════════════════════════════════════════════════════════
// CHECKLIST CLIENT — Aureus Social Pro
// Onboarding complet d'un nouveau client fiduciaire/PME
// ═══════════════════════════════════════════════════════════════

const GOLD='#c6a34e',GREEN='#22c55e',RED='#ef4444',BLUE='#60a5fa',PURPLE='#a78bfa',GRAY='#888';

const CHECKLIST_SECTIONS = [
  {
    id: 'identification',
    label: '🏢 Identification société',
    desc: 'Données légales obligatoires',
    items: [
      { id: 'bce', label: 'Numéro BCE (10 chiffres)', required: true, doc: 'BCE.be' },
      { id: 'tva', label: 'Numéro TVA', required: true, doc: 'SPF Finances' },
      { id: 'onss', label: 'Numéro ONSS employeur', required: true, doc: 'ONSS/WIDE' },
      { id: 'forme', label: 'Forme juridique (SRL/SA/SNC/...)', required: true, doc: '' },
      { id: 'siege', label: 'Siège social + adresse complète', required: true, doc: '' },
      { id: 'statuts', label: 'Statuts publiés (Moniteur belge)', required: true, doc: 'Moniteur' },
      { id: 'mandat', label: 'Mandat signé Art.40 loi 27/06/1969', required: true, doc: 'Aureus' },
      { id: 'dpa', label: 'DPA Art.28 RGPD signé', required: true, doc: 'Aureus' },
    ]
  },
  {
    id: 'contact',
    label: '👤 Contacts & Accès',
    desc: 'Personnes de contact et accès systèmes',
    items: [
      { id: 'contact_rh', label: 'Contact RH (nom, email, gsm)', required: true, doc: '' },
      { id: 'contact_dg', label: 'Contact Direction (gérant/DG)', required: true, doc: '' },
      { id: 'contact_compta', label: 'Comptable / Fiduciaire', required: false, doc: '' },
      { id: 'iban_soc', label: 'IBAN compte société (virements salaires)', required: true, doc: '' },
      { id: 'bic', label: 'BIC / Code SWIFT banque', required: true, doc: '' },
      { id: 'csam', label: 'Accès CSAM / eID configuré', required: true, doc: 'CSAM' },
    ]
  },
  {
    id: 'employes',
    label: '👥 Données travailleurs',
    desc: 'Informations pour chaque travailleur',
    items: [
      { id: 'niss', label: 'NISS (n° national) tous travailleurs', required: true, doc: '' },
      { id: 'iban_emp', label: 'IBAN personnel chaque travailleur', required: true, doc: '' },
      { id: 'contrats', label: 'Contrats de travail signés', required: true, doc: '' },
      { id: 'cp', label: 'Commission paritaire applicable (CP XXX)', required: true, doc: 'SPF ETCS' },
      { id: 'baremes', label: 'Barèmes salariaux CP + ancienneté', required: true, doc: '' },
      { id: 'horaire', label: 'Régime horaire (38h, 4/5, temps partiel)', required: true, doc: '' },
      { id: 'cheques_repas', label: 'Montant chèques-repas + répartition', required: false, doc: '' },
      { id: 'voiture', label: 'Voiture société (marque, CO2, carburant)', required: false, doc: '' },
      { id: 'frais_dep', label: 'Indemnité frais de déplacement', required: false, doc: '' },
    ]
  },
  {
    id: 'declarations',
    label: '📋 Déclarations & Obligations',
    desc: 'Obligations légales à configurer',
    items: [
      { id: 'dimona_hist', label: 'Historique Dimona (entrées/sorties)', required: true, doc: 'ONSS' },
      { id: 'dmfa_hist', label: 'Dernière DmfA déposée', required: true, doc: 'ONSS' },
      { id: 'belcotax', label: 'Dernières fiches Belcotax (281.10)', required: true, doc: 'SPF Finances' },
      { id: 'registre', label: 'Registre du personnel à jour', required: true, doc: '' },
      { id: 'ri', label: 'Règlement de travail (RI) en vigueur', required: true, doc: 'SPF ETCS' },
      { id: 'vacances', label: 'Pécule de vacances en cours', required: false, doc: '' },
      { id: 'echeances', label: 'Échéances ONSS à jour (pas d\'arriérés)', required: true, doc: 'ONSS' },
    ]
  },
  {
    id: 'transfert',
    label: '🔄 Transfert depuis ancien secrétariat',
    desc: 'Documents à récupérer de l\'ancien prestataire',
    items: [
      { id: 'resiliation', label: 'Lettre résiliation envoyée (recommandé)', required: true, doc: 'Modèle Aureus' },
      { id: 'historique_paie', label: 'Historique de paie 12 derniers mois', required: true, doc: '' },
      { id: 'fiches_paie_hist', label: 'Fiches de paie archivées (5 ans)', required: true, doc: '' },
      { id: 'codes_paie', label: 'Codes de paie / paramétrage actuel', required: false, doc: '' },
      { id: 'soldes_conges', label: 'Soldes congés en cours', required: true, doc: '' },
      { id: 'provisions', label: 'Provisions sociales (pécule vacances, 13e mois)', required: true, doc: '' },
      { id: 'art40', label: 'Dénonciation Art.40 (solidarité ONSS levée)', required: true, doc: 'Aureus' },
    ]
  },
  {
    id: 'rgpd',
    label: '🔐 RGPD & Sécurité',
    desc: 'Obligations protection des données',
    items: [
      { id: 'dpa28', label: 'DPA Art.28 RGPD signé', required: true, doc: 'Aureus' },
      { id: 'registre30', label: 'Registre traitements Art.30 fourni', required: false, doc: '' },
      { id: 'contact_dpo', label: 'Contact DPO client identifié', required: false, doc: '' },
      { id: 'transfert_data', label: 'Modalités transfert données confirmées', required: true, doc: '' },
      { id: 'retention', label: 'Politique rétention données acceptée', required: true, doc: 'Aureus' },
    ]
  },
  {
    id: 'facturation',
    label: '💶 Facturation & Contrat',
    desc: 'Aspects commerciaux et financiers',
    items: [
      { id: 'plan', label: 'Plan tarifaire choisi (Starter/Pro/Fiduciaire)', required: true, doc: '' },
      { id: 'peppol', label: 'Peppol ID client (si facturation électronique)', required: false, doc: '' },
      { id: 'iban_fact', label: 'IBAN facturation (si différent)', required: false, doc: '' },
      { id: 'contrat_signe', label: 'Contrat de service signé', required: true, doc: 'Aureus' },
      { id: 'premier_mois', label: 'Premier mois de paie défini', required: true, doc: '' },
      { id: 'mode_paiement', label: 'Mode de paiement confirmé', required: true, doc: '' },
    ]
  },
];

const TOTAL_REQUIRED = CHECKLIST_SECTIONS.reduce((a, s) => a + s.items.filter(i => i.required).length, 0);
const TOTAL_ALL = CHECKLIST_SECTIONS.reduce((a, s) => a + s.items.length, 0);

export default function ChecklistClient({ s, d }) {
  const { tText } = useLang();
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});
  const [clientName, setClientName] = useState('');
  const [showNotes, setShowNotes] = useState({});
  const [filter, setFilter] = useState('all'); // all | required | missing
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Clé unique basée sur le client actif
  const clientKey = `checklist_${(s?.activeClient || 'default')}`;

  // Charger depuis Supabase via /api/backup (app_state)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch(`/api/app-state?key=${encodeURIComponent(clientKey)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.value) {
            const { checked: c, notes: n, clientName: cn } = data.value;
            if (c) setChecked(c);
            if (n) setNotes(n);
            if (cn) setClientName(cn);
          }
        }
      } catch (e) {
        // Fallback sessionStorage
        try {
          const saved = sessionStorage.getItem(clientKey);
          if (saved) {
            const { checked: c, notes: n, clientName: cn } = JSON.parse(saved);
            if (c) setChecked(c);
            if (n) setNotes(n);
            if (cn) setClientName(cn);
          }
        } catch {}
      }
    };
    load();
  }, [clientKey]);

  const save = useCallback(async (newChecked, newNotes, newClient) => {
    // Toujours sauvegarder en sessionStorage pour l'instant
    try {
      sessionStorage.setItem(clientKey, JSON.stringify({ checked: newChecked, notes: newNotes, clientName: newClient }));
    } catch {}
    // Sauvegarder dans Supabase via authFetch (debounced)
    setSaving(true);
    try {
      await authFetch('/api/app-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: clientKey,
          value: { checked: newChecked, notes: newNotes, clientName: newClient, updatedAt: new Date().toISOString() }
        })
      });
      setLastSaved(new Date());
    } catch {} finally {
      setSaving(false);
    }
  }, [clientKey]);

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    save(next, notes, clientName);
  };
  const setNote = (id, v) => {
    const next = { ...notes, [id]: v };
    setNotes(next);
    save(checked, next, clientName);
  };

  const doneRequired = CHECKLIST_SECTIONS.reduce((a, s) => a + s.items.filter(i => i.required && checked[i.id]).length, 0);
  const doneAll = CHECKLIST_SECTIONS.reduce((a, s) => a + s.items.filter(i => checked[i.id]).length, 0);
  const pctRequired = Math.round(doneRequired / TOTAL_REQUIRED * 100);
  const pctAll = Math.round(doneAll / TOTAL_ALL * 100);

  const sCard = { background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:12 };
  const sBtn = (active) => ({ padding:'6px 14px', borderRadius:6, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', background:active?'rgba(198,163,78,.12)':'rgba(255,255,255,.03)', color:active?GOLD:'#888', transition:'all .15s' });

  const exportPDF = () => {
    const lines = CHECKLIST_SECTIONS.map(sec => {
      const items = sec.items.map(it => `  [${checked[it.id]?'X':' '}] ${it.label}${it.required?' *':''}${notes[it.id]?' → '+notes[it.id]:''}`).join('\n');
      return `${sec.label}\n${items}`;
    }).join('\n\n');
    const txt = `CHECKLIST ONBOARDING CLIENT — AUREUS SOCIAL PRO\nClient: ${clientName||'(non défini)'}\nDate: ${new Date().toLocaleDateString('fr-BE')}\nComplétude: ${pctRequired}% obligatoires (${doneRequired}/${TOTAL_REQUIRED})\n\n${lines}\n\n* = Obligatoire`;
    const blob = new Blob([txt], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Checklist_${(clientName||'client').replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const reset = () => {
    if (!confirm('Réinitialiser toute la checklist ?')) return;
    setChecked({}); setNotes({}); setClientName('');
    sessionStorage.removeItem(clientKey);
    save({}, {}, '');
  };

  return (
    <div style={{ padding:24, color:'#e8e6e0', fontFamily:'inherit' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:GOLD, margin:'0 0 4px' }}>✅ Checklist Onboarding Client</h2>
          <p style={{ fontSize:12, color:GRAY, margin:0 }}>{TOTAL_ALL} points de contrôle — {TOTAL_REQUIRED} obligatoires</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {saving && <span style={{fontSize:10,color:GOLD}}>⏳ Sauvegarde...</span>}
          {!saving && lastSaved && <span style={{fontSize:10,color:'#22c55e'}}>✅ Sauvegardé {lastSaved.toLocaleTimeString('fr-BE')}</span>}
          <button onClick={exportPDF} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:GOLD, color:'#0c0b09', fontSize:12, fontWeight:700, cursor:'pointer' }}>📄 Exporter</button>
          <button onClick={reset} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'transparent', color:'#888', fontSize:12, cursor:'pointer' }}>🔄 Reset</button>
        </div>
      </div>

      {/* Nom client */}
      <div style={sCard}>
        <label style={{ fontSize:10, color:GRAY, display:'block', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Nom du client</label>
        <input
          value={clientName}
          onChange={e => { setClientName(e.target.value); save(checked, notes, e.target.value); }}
          placeholder="Ex: Boulangerie Martin SPRL"
          style={{ width:'100%', padding:'10px 14px', background:'#090c16', border:'1px solid rgba(139,115,60,.2)', borderRadius:8, color:'#e5e5e5', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}
        />
      </div>

      {/* Progress */}
      <div style={{ ...sCard, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <div style={{ fontSize:11, color:GRAY, marginBottom:6, fontWeight:600 }}>OBLIGATOIRES</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, height:8, background:'rgba(255,255,255,.06)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ width:`${pctRequired}%`, height:'100%', background:pctRequired===100?GREEN:GOLD, borderRadius:4, transition:'width .3s' }}/>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:pctRequired===100?GREEN:GOLD }}>{pctRequired}%</span>
          </div>
          <div style={{ fontSize:11, color:GRAY, marginTop:4 }}>{doneRequired}/{TOTAL_REQUIRED} complétés</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:GRAY, marginBottom:6, fontWeight:600 }}>TOTAL</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, height:8, background:'rgba(255,255,255,.06)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ width:`${pctAll}%`, height:'100%', background:BLUE, borderRadius:4, transition:'width .3s' }}/>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:BLUE }}>{pctAll}%</span>
          </div>
          <div style={{ fontSize:11, color:GRAY, marginTop:4 }}>{doneAll}/{TOTAL_ALL} complétés</div>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[['all','Tout'],['required','Obligatoires'],['missing','Manquants']].map(([v,l]) =>
          <button key={v} onClick={()=>setFilter(v)} style={sBtn(filter===v)}>{l}</button>
        )}
      </div>

      {/* Sections */}
      {CHECKLIST_SECTIONS.map(sec => {
        const items = sec.items.filter(it => {
          if (filter === 'required') return it.required;
          if (filter === 'missing') return !checked[it.id];
          return true;
        });
        if (!items.length) return null;
        const done = sec.items.filter(i => checked[i.id]).length;
        const total = sec.items.length;
        return (
          <div key={sec.id} style={sCard}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:GOLD }}>{sec.label}</div>
                <div style={{ fontSize:10, color:GRAY }}>{sec.desc}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:done===total?GREEN:GRAY }}>{done}/{total}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {items.map(it => (
                <div key={it.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:checked[it.id]?'rgba(34,197,94,.06)':'rgba(255,255,255,.02)', border:`1px solid ${checked[it.id]?'rgba(34,197,94,.2)':'rgba(255,255,255,.04)'}`, cursor:'pointer' }} onClick={()=>toggle(it.id)}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${checked[it.id]?GREEN:'rgba(255,255,255,.2)'}`, background:checked[it.id]?GREEN:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                      {checked[it.id] && <span style={{ fontSize:11, color:'#0c0b09', fontWeight:900 }}>✓</span>}
                    </div>
                    <span style={{ flex:1, fontSize:12, color:checked[it.id]?'#666':'#ccc', textDecoration:checked[it.id]?'line-through':'none' }}>{it.label}</span>
                    {it.required && <span style={{ fontSize:9, fontWeight:700, color:RED, background:'rgba(239,68,68,.1)', padding:'1px 5px', borderRadius:3 }}>REQ</span>}
                    {it.doc && <span style={{ fontSize:9, color:BLUE, background:'rgba(96,165,250,.1)', padding:'1px 5px', borderRadius:3 }}>{it.doc}</span>}
                    <button onClick={e=>{e.stopPropagation();setShowNotes(p=>({...p,[it.id]:!p[it.id]}))}} style={{ background:'transparent', border:'none', color:notes[it.id]?GOLD:GRAY, cursor:'pointer', fontSize:12, padding:'0 4px' }}>📝</button>
                  </div>
                  {showNotes[it.id] && (
                    <input
                      value={notes[it.id]||''}
                      onChange={e=>setNote(it.id,e.target.value)}
                      placeholder="Ajouter une note..."
                      onClick={e=>e.stopPropagation()}
                      style={{ width:'100%', marginTop:4, padding:'6px 12px', background:'#090c16', border:'1px solid rgba(139,115,60,.15)', borderRadius:6, color:'#e5e5e5', fontSize:11, fontFamily:'inherit', boxSizing:'border-box' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {pctRequired === 100 && (
        <div style={{ textAlign:'center', padding:24, background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.2)', borderRadius:12 }}>
          <div style={{ fontSize:28 }}>🎉</div>
          <div style={{ fontSize:16, fontWeight:700, color:GREEN, marginTop:8 }}>Checklist obligatoire complète !</div>
          <div style={{ fontSize:12, color:GRAY, marginTop:4 }}>Le client {clientName||''} peut être onboardé sur Aureus Social Pro.</div>
        </div>
      )}
    </div>
  );
}
