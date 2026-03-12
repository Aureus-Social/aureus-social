import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const ONSS_NUMBER = '51357716';
const DIMONA_URL = 'https://services.socialsecurity.be/REST/dimona/v2/declarations';

async function getToken() {
  const res = await fetch('https://app.aureussocial.be/api/onss/token', { method: 'POST' });
  if (!res.ok) throw new Error('Token impossible: ' + await res.text());
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.access_token;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const niss = body.niss || body.worker?.ssin;
    const startDate = body.startDate || body.occupation?.startDate;
    const endDate = body.endDate || body.occupation?.endDate;
    const workerType = body.workerType || body.occupation?.workerType || 'STD';
    const cp = body.cp || body.occupation?.jointCommitteeNumber || '200';
    const type = body.type || 'IN';

    if (!niss) return Response.json({ error: 'NISS manquant' }, { status: 400 });
    if (!startDate) return Response.json({ error: 'Date entree manquante' }, { status: 400 });

    const token = await getToken();

    // Schema v2 ONSS
    const payload = {
      employer: { nssoRegistrationNumber: ONSS_NUMBER },
      worker: { ssin: niss.replace(/[^0-9]/g, '') },
      dimonaIn: type === 'IN' ? {
        startDate: startDate,
        features: {
          workerType: workerType,
          jointCommitteeNumber: cp,
        },
      } : undefined,
      dimonaOut: type === 'OUT' ? {
        dimonaNumber: body.dimonaNumber,
        endDate: endDate,
      } : undefined,
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

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

    if (resp.status === 201) {
      const location = resp.headers.get('Location') || '';
      const declarationId = location.split('/').pop();
      try {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await sb.from('dimona_history').insert({ type, niss: niss.replace(/[^0-9]/g,''), start_date: startDate, declaration_id: declarationId, created_at: new Date().toISOString() });
      } catch(e) {}
      return Response.json({ success: true, declarationId, location });
    }

    return Response.json({ error: result.detail || result.message || 'Erreur ONSS', details: result, status_code: resp.status }, { status: resp.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
