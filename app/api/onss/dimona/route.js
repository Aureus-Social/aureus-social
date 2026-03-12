// app/api/onss/dimona/route.js
// Route serveur pour envoyer/consulter les Dimona via API ONSS

const ONSS_CONFIG = {
  onssNumber: '51357716',
  dimonaUrl: 'https://api.socialsecurity.be/REST/dimona/v2/declarations',
};

async function getToken() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.aureussocial.be';
  const res = await fetch(base + '/api/onss/token', { method: 'POST' });
  if (!res.ok) throw new Error('Token impossible');
  const data = await res.json();
  return data.access_token;
}

// POST — envoyer Dimona IN ou OUT
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, worker, occupation } = body;

    if (!worker?.ssin) {
      return Response.json({ error: 'NISS manquant' }, { status: 400 });
    }
    if (!occupation?.startDate) {
      return Response.json({ error: 'Date entrée manquante' }, { status: 400 });
    }

    const token = await getToken();

    // Construire le payload Dimona V2
    const payload = {
      declarationType: type, // IN ou OUT
      worker: {
        ssin: worker.ssin.replace(/[^0-9]/g, ''),
      },
      employer: {
        nssoNumber: ONSS_CONFIG.onssNumber,
      },
      occupation: {
        startDate: occupation.startDate,
        workerType: occupation.workerType || 'OTH',
        jointCommitteeNumber: occupation.jointCommitteeNumber || '200',
      }
    };

    // Ajouter date fin pour OUT ou CDD
    if (type === 'OUT' && occupation.endDate) {
      payload.occupation.endDate = occupation.endDate;
    }
    if (occupation.endDate && type === 'IN') {
      payload.occupation.endDate = occupation.endDate;
    }

    const resp = await fetch(ONSS_CONFIG.dimonaUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await resp.json();

    if (!resp.ok) {
      return Response.json({
        error: result.message || 'Erreur ONSS',
        details: result,
        status: resp.status
      }, { status: resp.status });
    }

    // Sauvegarder dans Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      await sb.from('dimona_history').insert({
        type,
        niss: worker.ssin,
        worker_name: (worker.firstName || '') + ' ' + (worker.lastName || ''),
        start_date: occupation.startDate,
        end_date: occupation.endDate || null,
        worker_type: occupation.workerType,
        cp: occupation.jointCommitteeNumber,
        declaration_id: result.declarationId || result.id,
        status: 'sent',
        response: JSON.stringify(result),
        sent_at: new Date().toISOString(),
      });
    } catch(e) {
      console.warn('Supabase save error:', e.message);
    }

    return Response.json({
      success: true,
      declarationId: result.declarationId || result.id,
      message: `Dimona ${type} envoyée avec succès`,
      data: result,
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// GET — consulter une Dimona
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const niss = searchParams.get('niss');

    const token = await getToken();
    let url = ONSS_CONFIG.dimonaUrl;
    if (id) url += '/' + id;
    else if (niss) url += '?ssin=' + niss.replace(/[^0-9]/g,'');

    const resp = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
    });
    const result = await resp.json();
    return Response.json(result);
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
