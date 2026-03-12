import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const ONSS_NUMBER = '51357716';
const DIMONA_URL = 'https://api.socialsecurity.be/REST/dimona/v2/declarations';

async function getToken(req) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.aureussocial.be';
  const res = await fetch(base + '/api/onss/token', { method: 'POST' });
  if (!res.ok) throw new Error('Token impossible');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.access_token;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, worker, occupation } = body;
    if (!worker?.ssin) return Response.json({ error: 'NISS manquant' }, { status: 400 });
    if (!occupation?.startDate) return Response.json({ error: 'Date entree manquante' }, { status: 400 });
    const token = await getToken();
    const payload = {
      declarationType: type,
      worker: { ssin: worker.ssin.replace(/[^0-9]/g, '') },
      employer: { nssoNumber: ONSS_NUMBER },
      occupation: {
        startDate: occupation.startDate,
        workerType: occupation.workerType || 'OTH',
        jointCommitteeNumber: occupation.jointCommitteeNumber || '200',
      }
    };
    if (occupation.endDate) payload.occupation.endDate = occupation.endDate;
    const resp = await fetch(DIMONA_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    if (!resp.ok) return Response.json({ error: result.message || 'Erreur ONSS', details: result }, { status: resp.status });
    // Sauvegarder dans Supabase
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await sb.from('dimona_history').insert({
        type, niss: worker.ssin,
        worker_name: (worker.firstName||'') + ' ' + (worker.lastName||''),
        start_date: occupation.startDate,
        end_date: occupation.endDate || null,
        worker_type: occupation.workerType,
        cp: occupation.jointCommitteeNumber,
        declaration_id: result.declarationId || result.id,
        status: 'sent',
        response: JSON.stringify(result),
        sent_at: new Date().toISOString(),
      });
    } catch(e) { console.warn('Supabase:', e.message); }
    return Response.json({ success: true, declarationId: result.declarationId || result.id, message: 'Dimona ' + type + ' envoyee', data: result });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const niss = searchParams.get('niss');
    const token = await getToken();
    let url = DIMONA_URL;
    if (id) url += '/' + id;
    else if (niss) url += '?ssin=' + niss.replace(/[^0-9]/g,'');
    const resp = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' } });
    const result = await resp.json();
    return Response.json(result);
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
