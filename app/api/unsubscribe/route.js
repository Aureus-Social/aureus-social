// ══════════════════════════════════════════════════════
//  /api/unsubscribe — Désinscription newsletter
//  RGPD Art. 7.3: retrait du consentement à tout moment
// ══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupa() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Échapper HTML pour prévenir XSS
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;'); }
// Valider format email
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

// GET: lien depuis email (1-click unsubscribe)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email || !isValidEmail(email)) return new Response('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>❌ Email invalide</h2></body></html>', { headers: { 'Content-Type': 'text/html' } });

  const supa = getSupa();
  await supa.from('newsletter_subscribers').update({
    active: false,
    unsubscribed_at: new Date().toISOString(),
    unsubscribe_reason: 'link_click',
  }).eq('email', email.toLowerCase().trim());

  return new Response(`<html><body style="font-family:Arial,sans-serif;text-align:center;padding:60px;background:#080706;color:#fff">
    <div style="max-width:500px;margin:0 auto">
      <div style="font-size:48px;margin-bottom:24px">✅</div>
      <h2 style="color:#c6a34e">Désinscription confirmée</h2>
      <p style="color:rgba(255,255,255,.6)">L'adresse <strong style="color:#fff">${esc(email)}</strong> a été supprimée de notre liste newsletter.</p>
      <p style="color:rgba(255,255,255,.4);font-size:12px;margin-top:32px">Conformément au RGPD Art. 7.3 · Aureus IA SPRL · info@aureus-ia.com</p>
      <a href="https://app.aureussocial.be" style="display:inline-block;margin-top:24px;padding:10px 24px;background:#c6a34e;color:#000;text-decoration:none;border-radius:6px;font-weight:700">← Retour au site</a>
    </div>
  </body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// POST: depuis l'app ou un formulaire
export async function POST(req) {
  try {
    const { email, reason } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    const supa = getSupa();
    await supa.from('newsletter_subscribers').update({
      active: false,
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason || 'user_request',
    }).eq('email', email.toLowerCase().trim());
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
