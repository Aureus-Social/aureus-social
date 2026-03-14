import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
export async function GET(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!supabase) return Response.json({ emp: null, fiches: [], dimonas: [] });
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';
    const { data: emp } = await supabase.from('employees')
      .select('id,first,last,fn,ln,niss,email,cp,statut,contractType,contract,startDate,endDate,monthlySalary,regime,fonction,jobTitle,chequesRepas,ecocheques,voiture,status')
      .eq('email', caller.email).single();
    if (!emp) return Response.json({ emp: null, fiches: [], dimonas: [], message: 'Profil non lié' });
    const result = { emp };
    if (section === 'all' || section === 'fiches') {
      const { data: fiches } = await supabase.from('fiches_paie')
        .select('id,period,gross,brut,onssNet,onss,pp,net,at,created_at,status')
        .eq('empId', emp.id)
        .eq('created_by', emp.created_by) // ISOLATION: fiches de l'employeur qui gère cet employé
        .order('created_at', { ascending: false }).limit(24);
      result.fiches = fiches || [];
    }
    if (section === 'all' || section === 'dimona') {
      const { data: dimonas } = await supabase.from('declarations')
        .select('id,type,reference,status,data,created_at')
        .eq('type', 'dimona')
        .eq('created_by', emp.created_by) // ISOLATION
        .order('created_at', { ascending: false }).limit(10);
      result.dimonas = (dimonas||[]).filter(d=>d.data?.worker_niss===emp.niss);
    }
    return Response.json(result);
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
