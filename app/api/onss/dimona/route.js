import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const ONSS_NUMBER = '51357716';
const DIMONA_URL = 'https://services.socialsecurity.be/REST/dimona/v2/declarations';

async function getToken() {
  const base = 'https://app.aureussocial.be';
  const res = await fetch(base + '/api/onss/token', { method: 'POST' });
  if (!res.ok) throw new Error('Token impossible: ' + await res.text());
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.access_token;
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Support 2 formats: {worker,occupation} ou {niss,startDate,workerType,cp}
    const niss = body.worker?.ssin || body.niss;
    const startDate = body.occupation?.startDate || body.startDate;
    const endDate = body.occupation?.endDate || body.endDate;
    const workerType = body.occupation?.workerType || body.workerType || 'STD';
    const cp = body.occupation?.jointCommitteeNumber || body.cp || '200';
    const type = body.type || 'IN';

    if (!niss) return Response.json({ error: 'NISS manquant' }, { status: 400 });
    if (!startDate) return Response.json({ error: 'Date entree manquante' }, { status: 400 });

    const token = await getToken();
    const payload = {
      declarationType: type,
      worker: { ssin: niss.replace(/[^0-9]/g, '') },
      employer: { nssoNumber: ONSS_NUMBER },
      occupation: {
        startDate,
        workerType,
        jointCommitteeNumber: cp,
      }
    };
    if (endDate) payload.occupation.endDate = endDate;

    const resp = await fetch(DIMONA_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/problem+json',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let result;
    try { result = JSON.parse(text); } catch(e) { result = { raw: text }; }

    if (!resp.ok) return Response.json({ error: result.message || 'Erreur ONSS', details: result, status_code: resp.status }, { status: resp.status });

    // Sauvegarder dans Supabase
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await sb.from('dimona_history').insert({ type, niss: niss.replace(/[^0-9]/g,''), start_date: startDate, end_date: endDate || null, worker_type: workerType, cp, result: JSON.stringify(result), created_at: new Date().toISOString() });
    } catch(e) { /* Supabase optionnel */ }

    return Response.json({ success: true, dimona: result });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
