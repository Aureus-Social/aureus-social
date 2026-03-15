import { checkRole } from '@/app/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
export async function GET(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(caller, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
    if (!supabase) return Response.json({ error: 'DB non disponible' }, { status: 503 });
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString();
    const [empsRes, fichesRes, dimRes, auditRes] = await Promise.all([
      supabase.from('employees').select('id,status,monthlySalary,contractType,cp').eq('created_by', caller.id).limit(1000),
      supabase.from('fiches_paie').select('id,gross,net,created_at').eq('created_by', caller.id).gte('created_at', firstDayLastMonth).limit(500),
      supabase.from('declarations').select('id,type,status,created_at').eq('created_by', caller.id).eq('type','dimona').limit(100),
      supabase.from('audit_log').select('id,action,created_at').gte('created_at', firstDayThisMonth).limit(200),
    ]);
    const emps = empsRes.data||[];
    const actifs = emps.filter(e=>e.status==='active'||!e.status);
    const fiches = fichesRes.data||[];
    const dimonas = dimRes.data||[];
    const audits = auditRes.data||[];
    const masseTotale = actifs.reduce((a,e)=>a+(e.monthlySalary||0),0);
    const netTotal = fiches.reduce((a,f)=>a+(f.net||0),0);
    const fichesThisMois = fiches.filter(f=>f.created_at>=firstDayThisMonth);
    return Response.json({
      ok: true, generated_at: now.toISOString(),
      employes: { total:emps.length, actifs:actifs.length, sortis:emps.filter(e=>e.status==='sorti').length, etudiants:emps.filter(e=>e.contractType==='student').length, masseBrute: Math.round(masseTotale*100)/100 },
      paie: { fichesTotal:fiches.length, fichesCeMois:fichesThisMois.length, netMoyen:fiches.length?Math.round(netTotal/fiches.length*100)/100:0 },
      declarations: { dimonaTotal:dimonas.length, dimonaSubmitted:dimonas.filter(d=>d.status==='submitted').length },
      activite: { actionsAujourdHui:audits.filter(a=>a.created_at>=now.toISOString().slice(0,10)).length, actionsCeMois:audits.length }
    });
  } catch (e) { return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 }); }
}
