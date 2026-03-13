// ═══════════════════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — useSendDocument
//  Hook React pour envoyer n'importe quel document par email
//  Usage: const { send, sending, error } = useSendDocument()
//  Appel:  await send({ to, docTitle, docType, htmlContent, message })
// ═══════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useSendDocument() {
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  async function send(params) {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Récupère le token de session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Non connecté');

      const res = await fetch('/api/send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur envoi');

      setSuccess(true);
      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }

  return { send, sending, error, success };
}

// ─── Helper : modal d'envoi email réutilisable ───────────────────
// Usage: <SendEmailModal docTitle="C4" docType="Attestation chômage" htmlContent={html} onClose={...} />
import { useRef } from 'react';

export function SendEmailModal({ docTitle, docType, htmlContent, downloadUrl, onClose }) {
  const { send, sending, error, success } = useSendDocument();
  const [to, setTo]           = useState('');
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

  async function handleSend() {
    if (!to.trim()) return;
    await send({ to: to.trim(), docTitle, docType, htmlContent, downloadUrl, message, recipientName });
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid rgba(198,163,78,.25)',
    borderRadius: 6, padding: '8px 12px', color: '#e8e6e0', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 11, color: '#5e5c56', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111009', border: '1px solid rgba(198,163,78,.2)', borderRadius: 12, padding: 28, width: 440, maxWidth: '90vw' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e6e0' }}>📧 Envoyer par email</div>
            <div style={{ fontSize: 11, color: '#c6a34e', marginTop: 2 }}>{docTitle}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5e5c56', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 14, color: '#e8e6e0', fontWeight: 600 }}>Email envoyé avec succès</div>
            <div style={{ fontSize: 12, color: '#5e5c56', marginTop: 6 }}>Destinataire : {to}</div>
            <button onClick={onClose} style={{ marginTop: 20, background: '#c6a34e', color: '#060810', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Fermer</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={labelStyle}>Email destinataire *</label>
              <input
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="travailleur@exemple.be"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Nom du destinataire</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Jean Dupont"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Message personnalisé (optionnel)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Bonjour, veuillez trouver ci-joint..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(198,40,40,.1)', border: '1px solid rgba(198,40,40,.3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#ef9a9a' }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(198,163,78,.2)', borderRadius: 6, padding: '10px', color: '#5e5c56', cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !to.trim()}
                style={{ flex: 2, background: to.trim() && !sending ? '#c6a34e' : 'rgba(198,163,78,.3)', color: '#060810', border: 'none', borderRadius: 6, padding: '10px', fontWeight: 700, cursor: to.trim() && !sending ? 'pointer' : 'not-allowed', fontSize: 13, transition: 'background .2s' }}
              >
                {sending ? '⏳ Envoi en cours...' : '📧 Envoyer'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
