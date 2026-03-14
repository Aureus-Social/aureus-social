'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Configuration 2FA TOTP
// Enrôlement Google Authenticator / Authy via Supabase MFA
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { enrollMFA, verifyAndActivateMFA, listMFAFactors, unenrollMFA } from '@/app/lib/security/mfa';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', DARK='#0d1117';
const BG='#111620', BORDER='rgba(198,163,78,.15)';

export default function MFASetup({ supabase, user }) {
  const [factors, setFactors]     = useState([]);
  const [step, setStep]           = useState('check'); // check | enroll | verify | done
  const [qrCode, setQrCode]       = useState('');
  const [secret, setSecret]       = useState('');
  const [factorId, setFactorId]   = useState('');
  const [code, setCode]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState(null);

  const toast_ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  useEffect(() => {
    if (!supabase) return;
    listMFAFactors(supabase).then(f => {
      setFactors(f);
      setStep(f.length > 0 ? 'done' : 'enroll');
    });
  }, [supabase]);

  const handleEnroll = async () => {
    setLoading(true); setError('');
    try {
      const { qrCode: qr, secret: sec, factorId: fid } = await enrollMFA(supabase);
      setQrCode(qr); setSecret(sec); setFactorId(fid);
      setStep('verify');
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return setError('Code 6 chiffres requis');
    setLoading(true); setError('');
    try {
      await verifyAndActivateMFA(supabase, factorId, code);
      const f = await listMFAFactors(supabase);
      setFactors(f);
      setStep('done');
      toast_('✅ 2FA activé — votre compte est maintenant protégé');
    } catch(e) { setError('Code invalide — réessayez'); }
    setLoading(false);
  };

  const handleDisable = async (fid) => {
    if (!confirm('Désactiver le 2FA ? Votre compte sera moins protégé.')) return;
    setLoading(true);
    try {
      await unenrollMFA(supabase, fid);
      setFactors([]);
      setStep('enroll');
      toast_('2FA désactivé', false);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color:'#e8e6e0', maxWidth:520 }}>
      {toast && (
        <div style={{ position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,
          background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',
          border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,
          color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600 }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:20,fontWeight:800 }}>🔐 Double authentification (2FA)</div>
        <div style={{ fontSize:11,color:'#5e5c56',marginTop:2 }}>
          Protégez votre compte avec Google Authenticator ou Authy
        </div>
      </div>

      {/* Statut actuel */}
      <div style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 18px',
        background:factors.length>0?'rgba(34,197,94,.06)':'rgba(239,68,68,.06)',
        border:`1px solid ${factors.length>0?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)'}`,
        borderRadius:10,marginBottom:24 }}>
        <div style={{ fontSize:24 }}>{factors.length>0?'🛡️':'⚠️'}</div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:factors.length>0?GREEN:RED }}>
            {factors.length>0 ? '2FA activé — compte protégé' : '2FA non activé — compte vulnérable'}
          </div>
          <div style={{ fontSize:10,color:'#5e5c56',marginTop:2 }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Étape 1 : Activer */}
      {step === 'enroll' && (
        <div style={{ background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:24 }}>
          <div style={{ fontSize:13,fontWeight:700,marginBottom:12 }}>Activer le 2FA</div>
          <div style={{ fontSize:11,color:'#8b95a5',lineHeight:1.7,marginBottom:20 }}>
            Lors de chaque connexion, vous devrez entrer un code à 6 chiffres généré par votre application TOTP.<br/>
            Compatible avec : <b>Google Authenticator</b>, <b>Authy</b>, <b>Microsoft Authenticator</b>.
          </div>
          {error && <div style={{ color:RED,fontSize:11,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,.08)',borderRadius:7 }}>{error}</div>}
          <button onClick={handleEnroll} disabled={loading}
            style={{ width:'100%',padding:'12px',borderRadius:8,border:'none',
              background:GOLD,color:DARK,fontSize:13,fontWeight:700,cursor:'pointer' }}>
            {loading ? 'Génération du QR code...' : '🔐 Activer le 2FA'}
          </button>
        </div>
      )}

      {/* Étape 2 : Scanner le QR */}
      {step === 'verify' && (
        <div style={{ background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:24 }}>
          <div style={{ fontSize:13,fontWeight:700,marginBottom:16 }}>
            Étape 1 — Scannez ce QR code avec votre app
          </div>

          {/* QR Code */}
          {qrCode && (
            <div style={{ textAlign:'center',marginBottom:20 }}>
              <img src={qrCode} alt="QR Code 2FA"
                style={{ width:180,height:180,border:`3px solid ${BORDER}`,borderRadius:12,background:'#fff',padding:8 }}/>
            </div>
          )}

          {/* Clé manuelle */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10,color:'#8b95a5',marginBottom:6 }}>
              Ou entrez cette clé manuellement dans votre app :
            </div>
            <div style={{ background:'rgba(0,0,0,.3)',borderRadius:7,padding:'10px 14px',
              fontFamily:'monospace',fontSize:12,color:GREEN,letterSpacing:2,wordBreak:'break-all',
              display:'flex',justifyContent:'space-between',alignItems:'center',gap:8 }}>
              <span>{secret}</span>
              <button onClick={()=>{ navigator.clipboard?.writeText(secret); toast_('Copié !'); }}
                style={{ padding:'4px 10px',borderRadius:5,border:`1px solid ${BORDER}`,
                  background:'transparent',color:GOLD,fontSize:10,cursor:'pointer',whiteSpace:'nowrap' }}>
                Copier
              </button>
            </div>
          </div>

          {/* Code de vérification */}
          <div style={{ fontSize:13,fontWeight:700,marginBottom:12 }}>
            Étape 2 — Entrez le code de votre app
          </div>
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}
            placeholder="000000"
            style={{ width:'100%',padding:'12px',borderRadius:8,
              border:`2px solid ${code.length===6?GOLD:'rgba(198,163,78,.2)'}`,
              background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:24,
              textAlign:'center',letterSpacing:8,fontFamily:'monospace',
              outline:'none',boxSizing:'border-box',marginBottom:12 }}/>

          {error && <div style={{ color:RED,fontSize:11,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,.08)',borderRadius:7 }}>{error}</div>}

          <div style={{ display:'flex',gap:8 }}>
            <button onClick={()=>setStep('enroll')}
              style={{ flex:1,padding:'10px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',
                background:'transparent',color:'#8b95a5',cursor:'pointer',fontSize:12 }}>
              Annuler
            </button>
            <button onClick={handleVerify} disabled={loading||code.length!==6}
              style={{ flex:2,padding:'10px',borderRadius:8,border:'none',
                background:code.length===6?GREEN:'rgba(34,197,94,.3)',
                color:'#fff',fontWeight:700,cursor:code.length===6?'pointer':'default',fontSize:13 }}>
              {loading ? 'Vérification...' : '✅ Confirmer le 2FA'}
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : 2FA actif */}
      {step === 'done' && factors.length > 0 && (
        <div style={{ background:BG,border:`1px solid rgba(34,197,94,.2)`,borderRadius:12,padding:24 }}>
          <div style={{ fontSize:13,fontWeight:700,color:GREEN,marginBottom:16 }}>
            ✅ 2FA configuré et actif
          </div>
          {factors.map(f => (
            <div key={f.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'10px 14px',background:'rgba(34,197,94,.04)',borderRadius:8,
              border:'1px solid rgba(34,197,94,.1)',marginBottom:8 }}>
              <div>
                <div style={{ fontSize:12,fontWeight:600 }}>🔐 TOTP — Authenticator</div>
                <div style={{ fontSize:10,color:'#5e5c56',marginTop:2 }}>
                  Activé le {new Date(f.created_at).toLocaleDateString('fr-BE')}
                </div>
              </div>
              <button onClick={()=>handleDisable(f.id)} disabled={loading}
                style={{ padding:'5px 12px',borderRadius:6,border:`1px solid ${RED}`,
                  background:'transparent',color:RED,fontSize:10,cursor:'pointer',fontWeight:600 }}>
                Désactiver
              </button>
            </div>
          ))}
          <div style={{ marginTop:16,padding:'10px 14px',background:'rgba(198,163,78,.04)',
            border:`1px solid ${BORDER}`,borderRadius:8,fontSize:10,color:'#8b95a5',lineHeight:1.7 }}>
            💡 À chaque connexion, vous devrez entrer le code à 6 chiffres de votre application.<br/>
            Si vous perdez accès à votre app TOTP, contactez <b>info@aureus-ia.com</b>.
          </div>
        </div>
      )}
    </div>
  );
}
