import { getAuthUser } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const ROLE_TABLES = {
  admin:      ['employees', 'travailleurs', 'fiches_paie', 'payroll_history',
               'documents', 'audit_log', 'activity_log', 'app_state',
               'dimona', 'dmfa', 'baremes_cp', 'declaration_queue', 'invoices'],
  comptable:  ['payroll_history', 'fiches_paie', 'documents', 'baremes_cp', 'invoices'],
  rh:         ['employees', 'travailleurs', 'documents', 'activity_log'],
  commercial: ['documents', 'app_state', 'invoices'],
  readonly:   [],
};

function detectRole(userRole, userEmail = '') {
  const r = (userRole || '').toLowerCase();
  const e = userEmail.toLowerCase();
  if (r === 'admin' || e.includes('admin') || e.includes('nourdin') || e.includes('aureus-ia')) return 'admin';
  if (r === 'comptable' || e.includes('comptable') || e.includes('fiduciaire')) return 'comptable';
  if (r === 'rh' || e.includes('rh') || e.includes('hr')) return 'rh';
  if (r === 'commercial' || e.includes('commercial')) return 'commercial';
  return 'readonly';
}

async function encryptServerSide(userId, data) {
  const { webcrypto } = await import('node:crypto');
  const enc  = new TextEncoder();
  const SALT = 'aureus-backup-salt-2026-v2-' + userId;
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw', enc.encode(userId), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const key = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt']
  );
  const iv        = webcrypto.getRandomValues(new Uint8Array(12));
  const encoded   = enc.encode(JSON.stringify(data));
  const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)), v: '2.0', ts: Date.now() };
}

export async function POST(request) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { action, userId, userEmail, userRole } = await request.json();

    if (!supabase) return Response.json({ error: 'Supabase non configuré' }, { status: 500 });

    const role   = detectRole(userRole, userEmail);
    const tables = ROLE_TABLES[role] || [];
    if (!tables.length) return Response.json({ error: 'Rôle readonly — backup non autorisé' }, { status: 403 });

    // Throttle 2h
    if (action === 'silent' && userId) {
      const { data: lastBk } = await supabase
        .from('audit_log').select('created_at')
        .eq('user_id', userId).eq('action', 'auto_backup_secure')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (lastBk) {
        const elapsed = Date.now() - new Date(lastBk.created_at).getTime();
        if (elapsed < 2 * 60 * 60 * 1000) {
          const { data: lastSnap } = await supabase.from('session_backups').select('records').eq('user_id', userId).maybeSingle();
          return new Response(JSON.stringify({ skipped: true, next_in_min: Math.ceil((7200000 - elapsed) / 60000) }), {
            headers: {
              'Content-Type': 'application/json',
              'X-Backup-Records':   String(lastSnap?.records ?? 0),
              'X-Backup-Encrypted': 'true',
              'X-Backup-Role':      role,
              'X-Backup-Skipped':   'true',
            },
          });
        }
      }
    }

    // Récupérer données
    const backupData = { timestamp: new Date().toISOString(), version: '2.0', role, userId: userId || 'unknown', tables: {} };
    const errors = [];
    let totalRecords = 0;

    for (const table of tables) {
      try {
        const q = userId ? supabase.from(table).select('*').eq('user_id', userId) : supabase.from(table).select('*');
        const { data, error } = await q;
        if (error) { errors.push(`${table}: ${error.message}`); backupData.tables[table] = []; }
        else { backupData.tables[table] = data || []; totalRecords += (data || []).length; }
      } catch (e) { errors.push(`${table}: ${e.message}`); backupData.tables[table] = []; }
    }

    const now     = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', 'h');

    // Chiffrement AES-256-GCM
    let encrypted = null;
    let encryptOk = false;
    if (userId) {
      try { encrypted = await encryptServerSide(userId, backupData); encryptOk = true; }
      catch (e) { errors.push(`Chiffrement: ${e.message}`); }
    }

    // Backup silencieux → persister en base
    if (action === 'silent' && userId) {
      await Promise.allSettled([
        supabase.from('session_backups').upsert({
          user_id: userId, role,
          backup_data: encryptOk ? encrypted : backupData,
          records: totalRecords, tables_count: tables.length,
          updated_at: now.toISOString(),
        }, { onConflict: 'user_id' }),
        supabase.from('audit_log').insert({
          user_id: userId, action: 'auto_backup_secure',
          details: JSON.stringify({ records: totalRecords, tables: tables.length, role, encrypted: encryptOk }),
          created_at: now.toISOString(),
        }),
      ]);
      return new Response(JSON.stringify({ ok: true, records: totalRecords, tables: tables.length, encrypted: encryptOk }), {
        headers: {
          'Content-Type': 'application/json',
          'X-Backup-Records': String(totalRecords),
          'X-Backup-Encrypted': String(encryptOk),
          'X-Backup-Role': role,
        },
      });
    }

    // Action email
    const filename = `aureus-backup-${role}-${dateStr}-${timeStr}.json`;
    if (action === 'email' || action === 'both') {
      const roleLabel = { admin:'Administrateur', comptable:'Comptable', rh:'RH', commercial:'Commercial' }[role] || role;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Aureus Social Pro <noreply@aureus-ia.com>',
          to: [userEmail || 'info@aureus-ia.com'],
          subject: `🔒 Backup AES-256 [${roleLabel}] — ${dateStr}`,
          html: `<div style="font-family:Arial;max-width:600px;"><div style="background:#1a1815;color:white;padding:24px;border-bottom:2px solid #c6a34e;"><h2 style="margin:0;color:#c6a34e;">🔒 Backup Aureus Social Pro</h2><p style="opacity:.8;">${roleLabel} — ${dateStr} ${timeStr}</p></div><div style="background:#f8f9fa;padding:24px;"><p>📊 ${tables.length} tables · ${totalRecords} enregistrements</p><p>${encryptOk ? '🔐 <strong>Chiffré AES-256-GCM</strong>' : '⚠️ Non chiffré'}</p><ul>${Object.entries(backupData.tables).map(([t,rows])=>`<li>${t}: ${rows.length}</li>`).join('')}</ul></div></div>`,
          attachments: [{ filename, content: Buffer.from(JSON.stringify(encryptOk ? encrypted : backupData, null, 2)).toString('base64') }],
        }),
      });
    }

    const jsonContent = JSON.stringify(encryptOk ? encrypted : backupData, null, 2);
    return new Response(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Role': role,
        'X-Backup-Records': String(totalRecords),
        'X-Backup-Encrypted': String(encryptOk),
        'X-Backup-Email-Sent': String(action === 'email' || action === 'both'),
      },
    });

  } catch (error) {
    console.error('[Backup API] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
