import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';

const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ─── Parsers ────────────────────────────────────────────────────────────────

function parseBOB50(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('JOURNAL'));
  return lines.map(l => {
    const p = l.split(';');
    return {
      source:   'bob50',
      journal:  p[0]?.trim(),
      year:     parseInt(p[1]) || null,
      month:    parseInt(p[2]) || null,
      doc_nr:   p[3]?.trim(),
      account:  p[6]?.trim(),
      label:    p[7]?.trim(),
      debit:    parseFloat(p[8]) || 0,
      credit:   parseFloat(p[9]) || 0,
      currency: 'EUR',
    };
  }).filter(r => r.account);
}

function parseBOB360(text) {
  // Parse XML BOB360 entries
  const rows = [];
  const re = /<(?:Transaction|DetailLine|Entry)[^>]+>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const tag = m[0];
    const attr = (name) => {
      const a = new RegExp(`${name}="([^"]*)"`, 'i').exec(tag);
      return a ? a[1] : '';
    };
    rows.push({
      source:   'bob360',
      journal:  attr('journal') || attr('code'),
      account:  attr('account'),
      label:    attr('label') || attr('description'),
      debit:    parseFloat(attr('debit')) || 0,
      credit:   parseFloat(attr('credit')) || 0,
      currency: attr('currency') || 'EUR',
      doc_nr:   attr('docNr') || attr('docnr'),
    });
  }
  return rows.filter(r => r.account);
}

function parseWinBooksConnect(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const hdrLine = lines.find(l => l.includes('DBKCODE') || l.includes('DOCNUMBER'));
  if (!hdrLine) return parseGenericCSV(text, '\t');
  const hdr = hdrLine.split('\t').map(h => h.trim());
  return lines.filter(l => !l.includes('DBKCODE')).map(l => {
    const vals = l.split('\t');
    const obj = {};
    hdr.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
    return {
      source:   'winbooks_connect',
      journal:  obj.DBKCODE,
      doc_nr:   obj.DOCNUMBER,
      account:  obj.ACCOUNTGL,
      label:    obj.COMMENT,
      amount:   parseFloat(obj.AMOUNTEUR) || 0,
      currency: obj.CURRCODE || 'EUR',
    };
  }).filter(r => r.account);
}

function parseWinBooksClassic(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const hdrLine = lines.find(l => l.toUpperCase().includes('JOURNAL') && l.includes(','));
  if (!hdrLine) return parseGenericCSV(text, ',');
  const hdr = hdrLine.split(',').map(h => h.trim().toUpperCase());
  return lines.filter(l => !l.toUpperCase().includes('JOURNAL')).map(l => {
    const vals = l.split(',');
    const obj = {};
    hdr.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
    return {
      source:   'winbooks_classic',
      journal:  obj.JOURNAL,
      doc_nr:   obj.DOCNR,
      account:  obj.COMPTE || obj.ACCOUNT,
      label:    obj.LIBELLE || obj.COMMENT,
      debit:    parseFloat(obj.DEBIT) || 0,
      credit:   parseFloat(obj.CREDIT) || 0,
      currency: obj.DEVISECODE || 'EUR',
    };
  }).filter(r => r.account);
}

function parseGenericCSV(text, sep = ';') {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const hdr = lines[0].split(sep).map(h => h.replace(/^["'\uFEFF]+|["']+$/g, '').trim().toUpperCase());
  return lines.slice(1).map(l => {
    const vals = l.split(sep);
    const obj = {};
    hdr.forEach((h, i) => { obj[h] = vals[i]?.replace(/^["']+|["']+$/g, '').trim() || ''; });
    return {
      source:   'generic',
      journal:  obj.JOURNAL || obj.JNL || '',
      account:  obj.COMPTE || obj.ACCOUNT || obj.ACCOUNTGL || '',
      label:    obj.LIBELLE || obj.LABEL || obj.COMMENT || obj.DESCRIPTION || '',
      debit:    parseFloat(obj.DEBIT || obj.AMOUNTD || obj.AMOUNT || 0) || 0,
      credit:   parseFloat(obj.CREDIT || obj.AMOUNTC || 0) || 0,
      currency: obj.DEVISE || obj.CURRENCY || obj.CURRCODE || 'EUR',
    };
  }).filter(r => r.account);
}

function detectFormat(content, format, filename) {
  if (format === 'bob360' || filename?.endsWith('.xml')) return 'bob360';
  if (format === 'bob50')   return 'bob50';
  if (format === 'wb_connect' || format === 'winbooks_connect') return 'wb_connect';
  if (format === 'wb_classic' || format === 'winbooks') return 'wb_classic';
  // Auto-detect
  if (content.includes('<?xml') || content.includes('<BOB')) return 'bob360';
  if (content.includes('DBKCODE') && content.includes('\t'))   return 'wb_connect';
  if (content.includes('JOURNAL') && content.includes(';'))    return 'bob50';
  if (content.includes('JOURNAL') && content.includes(','))    return 'wb_classic';
  return 'generic';
}

// ─── Handler principal ───────────────────────────────────────────────────────
export async function POST(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { content, format, filename, period } = body;
  // SÉCURITÉ : limiter taille du fichier importé
  if (content && content.length > 5 * 1024 * 1024) { // 5MB max
    return Response.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 413 });
  }
  if (!content) return Response.json({ error: 'Contenu vide' }, { status: 400 });

  const detected = detectFormat(content, format, filename);
  let rows = [];

  switch (detected) {
    case 'bob50':      rows = parseBOB50(content);          break;
    case 'bob360':     rows = parseBOB360(content);         break;
    case 'wb_connect': rows = parseWinBooksConnect(content); break;
    case 'wb_classic': rows = parseWinBooksClassic(content); break;
    default:           rows = parseGenericCSV(content, content.includes('\t') ? '\t' : content.includes(';') ? ';' : ',');
  }

  const total    = rows.length;
  let imported   = 0;
  let skipped    = 0;
  let errors     = 0;

  const db = sb();
  if (db && rows.length) {
    // Vérifier doublons sur (user_id, source, doc_nr, account)
    const keys = rows.filter(r => r.doc_nr).map(r => `${r.doc_nr}:${r.account}`);
    let existing = new Set();
    if (keys.length) {
      const { data: ex } = await db
        .from('import_compta')
        .select('doc_nr, account')
        .eq('user_id', u.id)
        .in('doc_nr', [...new Set(rows.map(r => r.doc_nr).filter(Boolean))]);
      (ex || []).forEach(r => existing.add(`${r.doc_nr}:${r.account}`));
    }

    const toInsert = rows.filter(r => {
      const k = `${r.doc_nr}:${r.account}`;
      if (existing.has(k)) { skipped++; return false; }
      return true;
    }).map(r => ({
      ...r,
      user_id:    u.id,
      period:     period || null,
      filename:   filename || null,
      created_at: new Date().toISOString(),
    }));

    if (toInsert.length) {
      const { error } = await db.from('import_compta').insert(toInsert);
      if (error) errors = toInsert.length;
      else       imported = toInsert.length;
    }

    // Audit log
    await db.from('audit_log').insert([{
      user_id: u.id, user_email: u.email,
      action: 'IMPORT_COMPTA', table_name: 'import_compta',
      created_at: new Date().toISOString(),
      details: { format: detected, filename, period, total, imported },
    }]).catch(() => {});
  } else {
    // Sans DB — juste parser et retourner
    imported = total;
  }

  return Response.json({
    ok:       true,
    format:   detected,
    total,
    imported: db ? imported : total,
    skipped,
    errors,
    sample:   rows.slice(0, 5),
  });
}
