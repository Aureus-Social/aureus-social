import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { format, fiches, emps, co, period } = body;
  const db = sb();
  let output = '';
  const fname = `export_${format}_${period||'current'}.csv`;

  if (format === 'winbooks' || format === 'bob') {
    const hdr = 'TYPE;DATE;JOURNAL;COMPTE;MONTANT;LIBELLE;DEVISE\n';
    const rows = (fiches||[]).map(f => {
      const d = new Date(f.at||f.created_at||Date.now()).toLocaleDateString('fr-BE').replace(/\//g,'');
      return [
        `G;${d};SL;620100;${(f.gross||0).toFixed(2)};Salaires bruts ${period};EUR`,
        `G;${d};SL;453000;-${(f.onssNet||0).toFixed(2)};ONSS travailleur ${period};EUR`,
        `G;${d};SL;453100;-${(f.pp||0).toFixed(2)};Precompte prof ${period};EUR`,
        `G;${d};SL;455000;-${(f.net||0).toFixed(2)};Net a payer ${period};EUR`,
      ].join('\n');
    }).join('\n');
    output = hdr + rows;
  } else if (format === 'exact') {
    output = 'Code;Date;Journal;Compte;Montant;Description\n' +
      (fiches||[]).map(f => `G;${new Date(f.at||Date.now()).toLocaleDateString('fr-BE')};SL;620100;${(f.gross||0).toFixed(2)};Salaires ${period}`).join('\n');
  } else if (format === 'csv_standard') {
    output = 'Période;Nom;NISS;Brut;ONSS;PP;Net;Coût employeur\n' +
      (fiches||[]).map(f => {
        const emp = (emps||[]).find(e => e.id === f.empId || e.id === f.employee_id) || {};
        return `${period||''};${emp.last||''} ${emp.first||''};${emp.niss||''};${(f.gross||0).toFixed(2)};${(f.onssNet||0).toFixed(2)};${(f.pp||0).toFixed(2)};${(f.net||0).toFixed(2)};${((f.gross||0)*1.2507).toFixed(2)}`;
      }).join('\n');
  } else if (format === 'horus') {
    output = 'NISS;NOM;PRENOM;BRUT;ONSS_T;ONSS_P;PP;NET;PERIODE\n' +
      (fiches||[]).map(f => {
        const emp = (emps||[]).find(e => e.id === f.empId) || {};
        return `${emp.niss||''};${emp.last||''};${emp.first||''};${(f.gross||0).toFixed(2)};${(f.onssNet||0).toFixed(2)};${((f.gross||0)*TX_ONSS_E).toFixed(2)};${(f.pp||0).toFixed(2)};${(f.net||0).toFixed(2)};${period||''}`;
      }).join('\n');
  } else {
    return Response.json({ error: `Format inconnu: ${format}` }, { status: 400 });
  }

  if (db) {
    await db.from('export_history').insert([{ user_id: u.id, format, period, count: (fiches||[]).length, created_at: new Date().toISOString() }]).catch(()=>{});
    await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'EXPORT_COMPTA', table_name: 'fiches_paie', created_at: new Date().toISOString(), details: { format, period } }]);
  }
  return Response.json({ ok: true, csv: output, filename: fname, rows: (fiches||[]).length });
}
