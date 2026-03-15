'use client';
import { useState, useMemo } from 'react';

const GOLD = '#C9963A';
const fmt = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0);

export default function ListingTVA({ state }) {
  const [annee, setAnnee] = useState(new Date().getFullYear() - 1);
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ bce: '', nom: '', montant_htva: '', tva_code: 'L44' });
  const [generated, setGenerated] = useState(false);
  const [xml, setXml] = useState('');

  const totalHtva = useMemo(() => clients.reduce((s, c) => s + parseFloat(c.montant_htva || 0), 0), [clients]);
  const totalTva = useMemo(() => clients.reduce((s, c) => s + parseFloat(c.montant_htva || 0) * 0.21, 0), [clients]);

  const addClient = () => {
    if (!newClient.bce || !newClient.montant_htva) return;
    setClients(prev => [...prev, { ...newClient, id: Date.now() }]);
    setNewClient({ bce: '', nom: '', montant_htva: '', tva_code: 'L44' });
  };

  const removeClient = (id) => setClients(prev => prev.filter(c => c.id !== id));

  const generateXML = () => {
    const co = state?.co || {};
    const bce = (co.vat || '1028230781').replace(/[^0-9]/g, '');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const clientsXML = clients.map((c, i) => {
      const bceCli = c.bce.replace(/[^0-9]/g, '');
      const htva = parseFloat(c.montant_htva || 0).toFixed(2);
      const tva = (parseFloat(c.montant_htva || 0) * 0.21).toFixed(2);
      return `    <Client SequenceNumber="${i + 1}">
      <CompanyVATNumber issuedBy="BE">${bceCli}</CompanyVATNumber>
      <TurnOver>${htva}</TurnOver>
      <VATAmount>${tva}</VATAmount>
    </Client>`;
    }).join('\n');

    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<ClientListingConsignment xmlns="http://www.minfin.fgov.be/ClientListingConsignment"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  ClientListingsNbr="1">
  <Declarant>
    <VATNumber>${bce}</VATNumber>
    <Name>${co.name || 'Aureus IA SPRL'}</Name>
    <Street>${co.address || 'Place Marcel Broodthaers 8'}</Street>
    <PostCode>1060</PostCode>
    <City>Saint-Gilles</City>
    <EmailAddress>${co.email || 'info@aureus-ia.com'}</EmailAddress>
    <Phone>+32</Phone>
  </Declarant>
  <ClientListing SequenceNumber="1"
    ClientsNbr="${clients.length}"
    TurnOverSum="${totalHtva.toFixed(2)}"
    VATAmountSum="${totalTva.toFixed(2)}"
    nihil="${clients.length === 0 ? 'YES' : 'NO'}"
    year="${annee}">
${clientsXML}
  </ClientListing>
</ClientListingConsignment>`;

    setXml(xmlContent);
    setGenerated(true);
  };

  const downloadXML = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listing_tva_${annee}_${new Date().toISOString().slice(0,10)}.xml`;
    a.click();
  };

  const inputS = { width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

  return (
    <div style={{ padding: 24, color: '#e8e6e0', fontFamily: 'Inter, sans-serif', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>📋 Listing Annuel TVA</h2>
          <p style={{ fontSize: 13, color: '#6B6860', margin: '4px 0 0' }}>Relevé des clients assujettis — Intervat XML (SPF Finances)</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#6B6860' }}>Année</label>
          <select value={annee} onChange={e => setAnnee(+e.target.value)}
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: '#1A1A1E', border: '1px solid #C9963A30', borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#C9963A', fontWeight: 600, marginBottom: 6 }}>ℹ️ Obligation légale</div>
        <div style={{ fontSize: 12, color: '#6B6860', lineHeight: 1.6 }}>
          Le listing annuel TVA doit être soumis avant le <strong style={{ color: '#e8e6e0' }}>31 mars</strong> de chaque année sur{' '}
          <a href="https://eservices.minfin.fgov.be/intervat/" target="_blank" rel="noreferrer" style={{ color: GOLD }}>Intervat</a>.
          Inclure tous les clients assujettis à la TVA belge avec un montant HTVA ≥ 250€ sur l'année.
          Si aucun client → déclarer un listing néant (nihil="YES").
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['Clients assujettis', clients.length, '#5B9BD6'],
          ['Total HTVA', fmt(totalHtva) + ' €', GOLD],
          ['Total TVA 21%', fmt(totalTva) + ' €', '#4CAF80'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#6B6860', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Ajout client */}
      <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GOLD, marginBottom: 14 }}>+ Ajouter un client assujetti</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>N° TVA / BCE</label>
            <input value={newClient.bce} onChange={e => setNewClient(p => ({...p, bce: e.target.value}))} placeholder="0123.456.789" style={inputS} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>Nom client</label>
            <input value={newClient.nom} onChange={e => setNewClient(p => ({...p, nom: e.target.value}))} placeholder="ACME SPRL" style={inputS} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>Montant HTVA (€)</label>
            <input type="number" value={newClient.montant_htva} onChange={e => setNewClient(p => ({...p, montant_htva: e.target.value}))} placeholder="5000" style={inputS} />
          </div>
          <button onClick={addClient} style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            + Ajouter
          </button>
        </div>
      </div>

      {/* Liste clients */}
      {clients.length > 0 && (
        <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0D0D0E' }}>
                {['N° TVA', 'Nom', 'HTVA', 'TVA 21%', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B6860', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1A1A1E' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#5B9BD6' }}>{c.bce}</td>
                  <td style={{ padding: '10px 14px', color: '#e8e6e0' }}>{c.nom}</td>
                  <td style={{ padding: '10px 14px', color: GOLD, fontWeight: 600 }}>{fmt(c.montant_htva)} €</td>
                  <td style={{ padding: '10px 14px', color: '#4CAF80' }}>{fmt(parseFloat(c.montant_htva || 0) * 0.21)} €</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => removeClient(c.id)} style={{ background: 'none', border: 'none', color: '#E05C3A', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#0D0D0E' }}>
                <td colSpan={2} style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>TOTAL</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: GOLD }}>{fmt(totalHtva)} €</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#4CAF80' }}>{fmt(totalTva)} €</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Listing néant */}
      {clients.length === 0 && (
        <div style={{ background: '#1A1A1E', border: '1px solid #2A2A30', borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6B6860' }}>Aucun client ajouté → le listing sera soumis en mode <strong style={{ color: GOLD }}>NÉANT</strong></div>
          <div style={{ fontSize: 12, color: '#6B6860', marginTop: 4 }}>Obligatoire même sans client (nihil="YES")</div>
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={generateXML} style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          🔧 Générer XML Intervat
        </button>
        {generated && (
          <button onClick={downloadXML} style={{ background: '#4CAF80', color: '#000', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ⬇️ Télécharger XML
          </button>
        )}
        {generated && (
          <a href="https://eservices.minfin.fgov.be/intervat/" target="_blank" rel="noreferrer"
            style={{ background: '#5B9BD6', color: '#000', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            🌐 Ouvrir Intervat
          </a>
        )}
      </div>

      {/* Aperçu XML */}
      {generated && (
        <div style={{ marginTop: 20, background: '#0D0D0E', border: '1px solid #2A2A30', borderRadius: 8, padding: 16, overflow: 'auto' }}>
          <div style={{ fontSize: 11, color: '#6B6860', marginBottom: 8, fontWeight: 600 }}>APERÇU XML — à soumettre sur Intervat</div>
          <pre style={{ margin: 0, fontSize: 11, color: '#4CAF80', fontFamily: 'monospace', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{xml}</pre>
        </div>
      )}
    </div>
  );
}
