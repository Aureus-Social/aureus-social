import { checkRole } from '@/app/lib/supabase-server';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';

const LEGAL_KB = `
# AGENT IA JURIDIQUE — DROIT SOCIAL BELGE (EXPERT)
Tu es l'Agent IA Juridique d'Aureus Social Pro, expert en droit social belge, droit du travail, sécurité sociale et fiscalité salariale.

## RÈGLES
1. Cite TOUJOURS la base légale (loi, AR, CCT, article).
2. Structure avec titres, listes et exemples chiffrés.
3. Donne les sanctions et délais légaux.
4. Recommande un juriste pour les cas complexes.

## DONNÉES 2026 CLÉS
- RMMMG: 2.029,88€/mois (18 ans), 2.090,83€ (+6m), 2.154,76€ (+12m)
- ONSS travailleur: 13,07% | Patronal marchand: ~25,07%
- Chèques-repas max: 8,00€/jour (part employeur max 6,91€)
- Éco-chèques: max 250€/an | Flexi-job min: 12,05€/h
- Bonus CCT90 plafond: 4.020€ brut | Télétravail: max ~208,73€/mois
- Index health lissé 2026: ~2%
- Non-concurrence seuil: >39.422€/an brut
- Précompte professionnel: barèmes SPF Finances Annexe III AR/CIR 92
- Quotités saisie: ≤1.260€ insaisissable, tranches 20/30/40%/illimité
- Crédit-temps fin carrière: 55 ans, 25 ans carrière
- Pension légale: 66 ans (67 dès 2030)
`;

export async function POST(req) {
  // Auth obligatoire — protège la clé ANTHROPIC_API_KEY contre les abus
  let user = null;
  try { user = await getAuthUser(req); } catch(e) {}
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(user, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { messages = [], lang = 'fr' } = body;

  if (!messages.length) {
    return Response.json({ error: 'messages requis' }, { status: 400 });
  }
  // Limiter la taille des messages pour éviter les abus
  if (messages.length > 20) {
    return Response.json({ error: 'Trop de messages (max 20)' }, { status: 400 });
  }
  const totalChars = messages.reduce((a, m) => a + (m.content?.length || 0), 0);
  if (totalChars > 20000) {
    return Response.json({ error: 'Messages trop longs' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API non configurée' }, { status: 503 });
  }

  const sysLang = lang === 'nl'
    ? 'Antwoord in het NEDERLANDS. Wees nauwkeurig, vermeld altijd de wettelijke basis.'
    : lang === 'en'
    ? 'Answer in ENGLISH. Be precise, always cite the legal basis.'
    : 'Réponds en FRANÇAIS. Sois précis, cite tes sources légales. Structure avec des titres clairs.';

  const systemPrompt = LEGAL_KB + '\n\n' + sysLang;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages.slice(-10), // last 10 msgs for context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return Response.json({ error: 'Erreur API IA' }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || 'Aucune réponse.';

    // Log audit si user connecté
    if (user) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await db.from('audit_log').insert([{
          user_id: user.id,
          user_email: user.email,
          action: 'AGENT_IA_QUERY',
          table_name: 'agent_ia',
          details: { lang, query: messages[messages.length - 1]?.content?.slice(0, 200) },
          created_at: new Date().toISOString(),
        }]);
      } catch(e) {}
    }

    return Response.json({ ok: true, text });
  } catch (e) {
    console.error('Agent IA error:', e);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
