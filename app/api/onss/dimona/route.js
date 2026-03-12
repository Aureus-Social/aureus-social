const ONSS_NUMBER = '51357716';
const DIMONA_URL = 'https://api.socialsecurity.be/REST/dimona/v2/declarations';

const WORKER_TYPES = {
  CDI:'OTH', CDD:'OTH', STUDENT:'STU', STU:'STU',
  FLEXI:'FLX', FLX:'FLX', INTERM:'INTERM',
  student:'STU', flexi:'FLX', interim:'INTERM',
};

async function getToken(appUrl) {
  const res = await fetch((appUrl || 'https://app.aureussocial.be') + '/api/onss/token', {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Token ONSS: ' + err);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('Token vide: ' + JSON.stringify(data));
  return data.access_token;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, worker, occupation } = body;

    if (!worker?.ssin) return Response.json({ error: 'NISS manquant' }, { status: 400 });
    if (!occupation?.startDate) return Response.json({ error: 'Date entrée manquante' }, { status: 400 });

    const appUrl = request.headers.get('origin') || 'https://app.aureussocial.be';
    const token = await getToken(appUrl);

    const payload = {
      declarationType: type,
      worker: { ssin: worker.ssin.replace(/[^0-9]/g, '') },
      employer: { nssoNumber: ONSS_NUMBER },
      occupation: {
        startDate: occupation.startDate,
        workerType: WORKER_TYPES[occupation.workerType] || 'OTH',
        jointCommitteeNumber: String(occupation.jointCommitteeNumber || '200'),
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

    // Sauvegarder historique Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await sb.from('dimona_history').insert({
        type, niss: worker.ssin,
        worker_name: ((worker.firstName||'') + ' ' + (worker.lastName||'')).trim(),
        start_date: occupation.startDate,
        end_date: occupation.endDate || null,
        worker_type: occupation.workerType,
        cp: occupation.jointCommitteeNumber,
        declaration_id: result.declarationId || result.id || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch(e) { console.warn('Supabase dimona_history:', e.message); }

    return Response.json({
      success: true,
      declarationId: result.declarationId || result.id,
      message: `Dimona ${type} envoyée ✅`,
      data: result,
    });

  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const niss = searchParams.get('niss');
    const appUrl = request.headers.get('origin') || 'https://app.aureussocial.be';
    const token = await getToken(appUrl);

    let url = DIMONA_URL;
    if (id) url += '/' + id;
    else if (niss) url += '?ssin=' + niss.replace(/[^0-9]/g,'');

    const resp = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
    });
    return Response.json(await resp.json());
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
