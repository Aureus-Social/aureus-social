import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function GET(req) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ skipped: true });
  const now = new Date();
  // Seulement en janvier (fiches 281.10 de l'année précédente)
  if (now.getMonth() !== 0) return Response.json({ skipped: true, reason: `Pas janvier (mois actuel: ${now.getMonth()+1})` });
  const annee = now.getFullYear() - 1;
  const { data: fiches } = await db.from('fiches_paie').select('*').gte('created_at', `${annee}-01-01`).lt('created_at', `${annee+1}-01-01`);
  const { data: emps } = await db.from('employees').select('*');
  const grouped = {};
  (fiches||[]).forEach(f => { if (!grouped[f.empId||f.employee_id]) grouped[f.empId||f.employee_id] = []; grouped[f.empId||f.employee_id].push(f); });
  const fiches281 = Object.entries(grouped).map(([empId, fs]) => {
    const emp = (emps||[]).find(e => e.id === empId) || {};
    return { empId, niss: emp.niss, nom: emp.last, prenom: emp.first, annee, brutAnnuel: fs.reduce((a,f)=>a+(f.gross||0),0), onssAnnuel: fs.reduce((a,f)=>a+(f.onssNet||0),0), ppAnnuel: fs.reduce((a,f)=>a+(f.pp||0),0), netAnnuel: fs.reduce((a,f)=>a+(f.net||0),0), nbFiches: fs.length };
  });
  await db.from('declarations').insert([{ type: 'belcotax', reference: `BELCO-${annee}-AUTO`, status: 'generated', data: { annee, fiches281, generatedAt: now.toISOString(), count: fiches281.length }, created_at: now.toISOString() }]).catch(()=>{});
  await db.from('system_events').insert([{ type: 'CRON_BELCOTAX', status: 'ok', details: { annee, count: fiches281.length }, created_at: now.toISOString() }]).catch(()=>{});
  return Response.json({ ok: true, annee, fiches: fiches281.length, generatedAt: now.toISOString() });
}
