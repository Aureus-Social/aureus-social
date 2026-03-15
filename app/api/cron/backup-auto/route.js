import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';

const TABLES = [
  'employees','clients','payroll_history','absences','conges',
  'declarations','factures','fiches_paie','access_requests',
];

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const t0 = Date.now();
  const now = new Date();
  const backup = { meta:{ date:now.toISOString(), tables:[] }, data:{} };
  let total = 0; const errors = [];

  for (const table of TABLES) {
    try {
      const { data, error } = await sb.from(table).select('*').limit(10000);
      if (error) { errors.push(`${table}: ${error.message}`); continue; }
      backup.data[table] = data || [];
      total += (data||[]).length;
      backup.meta.tables.push({ name:table, count:(data||[]).length });
    } catch(e) { errors.push(`${table}: ${e.message}`); }
  }

  // Chiffrement AES-256-GCM
  let finalData, encrypted = false;
  try {
    const enc = new TextEncoder().encode(JSON.stringify(backup));
    const key = await crypto.subtle.importKey('raw',
      new TextEncoder().encode((process.env.ENCRYPTION_KEY||'aureus-backup-2026').padEnd(32,'0').slice(0,32)),
      'AES-GCM', false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc);
    finalData = { iv:Array.from(iv), data:Array.from(new Uint8Array(ct)), v:'2.0', ts:Date.now() };
    encrypted = true;
  } catch(_) { finalData = backup; }

  // Stocker dans Supabase
  try { await sb.from('session_backups').insert({ user_id:'system-cron', backup_data:finalData, created_at:now.toISOString() }); } catch(_) {}

  // Email confirmation
  if (RESEND_KEY) {
    const ok = errors.length === 0;
    await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${RESEND_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({
        from:'Aureus Backup <noreply@aureus-ia.com>',
        to:[ALERT_EMAIL],
        subject:`${ok?'✅':'⚠️'} Backup Aureus — ${now.toLocaleDateString('fr-BE')} — ${total.toLocaleString('fr-BE')} enregistrements`,
        html:`<div style="font-family:Arial,sans-serif;max-width:580px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS SOCIAL PRO — Backup Automatique</div>
            <div style="color:#6b7280;font-size:11px;">${now.toLocaleString('fr-BE')}</div>
          </div>
          <div style="background:${ok?'#d1fae5':'#fef3c7'};border-left:4px solid ${ok?'#10b981':'#f59e0b'};padding:14px 22px;">
            <div style="font-weight:700;color:${ok?'#065f46':'#92400e'};font-size:14px;">${ok?'✅ Toutes les tables sauvegardées':'⚠️ '+errors.length+' erreur(s)'}</div>
            <div style="font-size:12px;margin-top:3px;">${total.toLocaleString('fr-BE')} enregistrements · ${((Date.now()-t0)/1000).toFixed(1)}s · AES-256 ${encrypted?'actif':'inactif'}</div>
          </div>
          <div style="background:#fff;padding:18px 22px;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              ${backup.meta.tables.map(t=>`<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:6px 0;">${t.name}</td><td style="text-align:right;color:#059669;font-weight:700;">${t.count.toLocaleString('fr-BE')}</td></tr>`).join('')}
            </table>
            ${errors.length?`<div style="margin-top:10px;padding:8px;background:#fef2f2;border-radius:4px;font-size:11px;color:#dc2626;">${errors.join(' · ')}</div>`:''}
          </div>
          <div style="background:#f9fafb;padding:8px 22px;font-size:10px;color:#9ca3af;">Aureus IA SPRL · BE 1028.230.781 · Backup 03h00 CET quotidien</div>
        </div>`
      })
    }).catch(()=>{});
  }

  return NextResponse.json({ ok:true, tables:backup.meta.tables.length, records:total, encrypted, errors:errors.length, ms:Date.now()-t0 });
}
