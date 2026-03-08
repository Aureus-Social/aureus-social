'use client';
import { useState, useEffect, useRef } from 'react';

const GOLD = '#c6a34e';
const GOLD2 = '#e8c97a';
const DARK = '#0a0908';
const DARK2 = '#111009';
const SURFACE = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(198,163,78,0.12)';

const FEATURES = [
  { icon: '⚡', title: 'Dimona en 8 secondes', desc: 'Déclaration IN/OUT automatique dès l\'ajout d\'un travailleur. Connexion directe ONSS/Mahis.' },
  { icon: '🧮', title: 'Calcul de paie belge exact', desc: '228 commissions paritaires, barèmes sectoriels, PP, ONSS, bonus emploi — tout automatisé.' },
  { icon: '📊', title: 'Belcotax XML en 1 clic', desc: 'Génération des fiches 281.10/20/30 conformes SPF Finances. Téléversement direct MyMinfin.' },
  { icon: '🔐', title: 'Sécurité RGPD niveau bancaire', desc: 'Chiffrement AES-256 NISS/IBAN, audit trail complet, RLS Supabase, backup nocturne chiffré.' },
  { icon: '📁', title: 'Export comptable universel', desc: 'WinBooks, BOB, Exact Online, Octopus, Horus — PCMN belge intégré, mappage persistant.' },
  { icon: '🏛', title: 'Mandats ONSS & Belcotax', desc: 'Génération automatique des conventions de mandat. Gestion multi-clients pour fiduciaires.' },
];

const STATS = [
  { v: '228', l: 'Commissions paritaires' },
  { v: '< 8s', l: 'Déclaration Dimona' },
  { v: '6', l: 'Formats export comptable' },
  { v: '100%', l: 'Droit belge natif' },
];

const PRICING = [
  { name: 'Starter', price: '15', per: 'travailleur/mois', min: 'Min. 5 travailleurs', features: ['Dimona IN/OUT', 'Fiches de paie PDF', 'Export CSV', 'Support email'], color: '#5e5c56', highlight: false },
  { name: 'Pro', price: '25', per: 'travailleur/mois', min: 'Min. 10 travailleurs', features: ['Tout Starter +', 'Belcotax XML', 'Export WinBooks/BOB', 'Audit trail', 'Mandats ONSS', 'Support prioritaire'], color: GOLD, highlight: true },
  { name: 'Fiduciaire', price: '40', per: 'travailleur/mois', min: 'Multi-dossiers illimités', features: ['Tout Pro +', 'Portail multi-clients', 'API REST', 'Backup nocturne', 'SLA 99.9%', 'Account manager dédié'], color: '#60a5fa', highlight: false },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function FadeIn({ children, delay = 0, style }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(28px)', transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: DARK, color: '#e8e6e0', fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Bruit de fond subtil */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 0 }} />

      {/* ── NAVIGATION ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,9,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${GOLD2}, ${GOLD})`, boxShadow: `0 0 16px ${GOLD}50` }} />
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD }}>AUREUS</span>
            <span style={{ fontSize: 9, color: '#5e5c56', letterSpacing: 2, marginLeft: 6 }}>SOCIAL PRO</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[['Fonctionnalités','#fonctionnalites'],['Tarifs','#tarifs'],['À propos','#apropos']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 11, color: '#7e7b73', letterSpacing: 1.5, textDecoration: 'none', transition: 'color .2s', textTransform: 'uppercase' }}
              onMouseEnter={e => e.target.style.color = GOLD} onMouseLeave={e => e.target.style.color = '#7e7b73'}>{l}</a>
          ))}
          <a href="/" style={{
            padding: '9px 24px', borderRadius: 6,
            border: `1px solid ${GOLD}50`, background: 'transparent',
            color: GOLD, fontSize: 12, letterSpacing: 1, cursor: 'pointer',
            textDecoration: 'none', transition: 'all .25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${GOLD}18`; e.currentTarget.style.borderColor = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${GOLD}50`; }}>
            Connexion →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Grille de fond */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.25 }} />
        {/* Orbe centrale */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}0a 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 880, padding: '100px 40px 60px', zIndex: 1 }}>

          <FadeIn delay={0}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 24, border: `1px solid ${GOLD}35`, background: `${GOLD}08`, marginBottom: 48 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e80' }} />
              <span style={{ fontSize: 10, color: GOLD, letterSpacing: 2.5, textTransform: 'uppercase' }}>Secrétariat social numérique belge</span>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 style={{ fontSize: 'clamp(52px, 7.5vw, 92px)', fontWeight: 400, lineHeight: 1.05, margin: '0 0 28px', letterSpacing: '-2px', color: '#f0ede6', fontStyle: 'normal' }}>
              La paie belge,<br />
              <em style={{ color: GOLD, fontStyle: 'italic' }}>enfin simple.</em>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p style={{ fontSize: 17, color: '#7e7b73', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 52px', fontFamily: 'Georgia, serif' }}>
              Aureus Social Pro automatise vos obligations ONSS, Dimona et Belcotax.
              Conçu pour les fiduciaires et employeurs belges exigeants.
            </p>
          </FadeIn>

          <FadeIn delay={240}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/" style={{
                padding: '17px 40px', borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD}, #9a7535)`,
                color: '#0a0908', fontSize: 14, fontWeight: 700, letterSpacing: 0.8,
                cursor: 'pointer', textDecoration: 'none',
                boxShadow: `0 8px 36px ${GOLD}35`,
                transition: 'all .3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${GOLD}45`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 36px ${GOLD}35`; }}>
                Accéder à l'application
              </a>
              <a href="#fonctionnalites" style={{
                padding: '17px 40px', borderRadius: 8,
                border: `1px solid ${BORDER}`, background: SURFACE,
                color: '#a09d96', fontSize: 14, letterSpacing: 0.8,
                cursor: 'pointer', textDecoration: 'none', transition: 'all .25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${GOLD}45`; e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#a09d96'; }}>
                Voir les fonctionnalités
              </a>
            </div>
          </FadeIn>

          {/* Statistiques */}
          <FadeIn delay={340}>
            <div style={{ display: 'flex', marginTop: 88, paddingTop: 48, borderTop: `1px solid ${BORDER}` }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 20px', borderRight: i < STATS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ fontSize: 36, fontWeight: 300, color: GOLD, letterSpacing: -1, fontFamily: 'Georgia, serif' }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: '#4e4c48', letterSpacing: 1.5, marginTop: 6, textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── FONCTIONNALITÉS ── */}
      <div id="fonctionnalites" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 40px' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, marginBottom: 18, textTransform: 'uppercase' }}>Fonctionnalités</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 54px)', fontWeight: 400, margin: 0, color: '#f0ede6', lineHeight: 1.15 }}>
              Tout ce dont vous avez besoin,<br /><em style={{ color: GOLD }}>rien de superflu.</em>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
                style={{ padding: '44px 40px', background: activeFeature === i ? 'rgba(198,163,78,0.05)' : DARK2, transition: 'background .35s ease', minHeight: 220 }}>
                <div style={{ fontSize: 30, marginBottom: 20 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0ede6', marginBottom: 12 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#5e5b55', lineHeight: 1.8 }}>{f.desc}</div>
                <div style={{ marginTop: 24, height: 1, background: GOLD, width: activeFeature === i ? 36 : 0, transition: 'width .4s ease' }} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── TARIFS ── */}
      <div id="tarifs" style={{ background: DARK2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 40px' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, marginBottom: 18, textTransform: 'uppercase' }}>Tarifs</div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 54px)', fontWeight: 400, margin: 0, color: '#f0ede6' }}>
                Transparent. <em style={{ color: GOLD }}>Sans surprise.</em>
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {PRICING.map((p, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div style={{
                  padding: '44px 36px', borderRadius: 14,
                  border: `1px solid ${p.highlight ? GOLD + '50' : BORDER}`,
                  background: p.highlight ? `${GOLD}06` : SURFACE,
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform .3s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {p.highlight && (
                    <div style={{ position: 'absolute', top: 18, right: 18, padding: '4px 12px', borderRadius: 20, background: `${GOLD}22`, border: `1px solid ${GOLD}50`, fontSize: 9, color: GOLD, letterSpacing: 1.5, textTransform: 'uppercase' }}>Populaire</div>
                  )}
                  <div style={{ fontSize: 10, color: p.color, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 24 }}>{p.name}</div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 52, fontWeight: 300, color: '#f0ede6', fontFamily: 'Georgia, serif' }}>€{p.price}</span>
                    <span style={{ fontSize: 11, color: '#4e4c48', marginLeft: 8 }}>/{p.per}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#4e4c48', marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${BORDER}` }}>{p.min}</div>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                      <span style={{ color: p.color, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: '#7e7b73', lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                  <a href="/" style={{
                    display: 'block', marginTop: 36, padding: '14px',
                    borderRadius: 8, border: `1px solid ${p.highlight ? GOLD + '60' : BORDER}`,
                    background: p.highlight ? `${GOLD}18` : 'transparent',
                    color: p.highlight ? GOLD : '#7e7b73',
                    fontSize: 12, letterSpacing: 1, cursor: 'pointer',
                    textDecoration: 'none', textAlign: 'center', transition: 'all .25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = p.highlight ? `${GOLD}60` : BORDER; e.currentTarget.style.color = p.highlight ? GOLD : '#7e7b73'; }}>
                    Commencer →
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── À PROPOS ── */}
      <div id="apropos" style={{ maxWidth: 960, margin: '0 auto', padding: '120px 40px' }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, marginBottom: 24, textTransform: 'uppercase' }}>À propos</div>
              <h2 style={{ fontSize: 42, fontWeight: 400, margin: '0 0 28px', color: '#f0ede6', lineHeight: 1.2 }}>
                Conçu par des<br /><em style={{ color: GOLD }}>praticiens belges.</em>
              </h2>
              <p style={{ fontSize: 14, color: '#5e5b55', lineHeight: 1.85, margin: '0 0 18px' }}>
                Aureus IA SPRL est une société belge établie à Saint-Gilles, Bruxelles. Notre équipe maîtrise le droit social belge dans toute sa complexité — des 228 commissions paritaires aux subtilités du calcul de précompte professionnel.
              </p>
              <p style={{ fontSize: 14, color: '#5e5b55', lineHeight: 1.85, margin: 0 }}>
                Aureus Social Pro n'est pas une adaptation d'un logiciel étranger — c'est un système pensé 100% pour le cadre légal belge, depuis les barèmes sectoriels jusqu'aux mandats Mahis/CSAM.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { l: 'BCE', v: '1028.230.781' },
                { l: 'Siège', v: 'Saint-Gilles\nBruxelles' },
                { l: 'Mahis', v: 'DGIII/MAHI011' },
                { l: 'Peppol', v: '0208:1028230781' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '22px', background: SURFACE, borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 9, color: '#4e4c48', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{item.l}</div>
                  <div style={{ fontSize: 12, color: GOLD, fontFamily: 'monospace', lineHeight: 1.5 }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── CTA FINAL ── */}
      <FadeIn>
        <div style={{ margin: '0 40px 120px', borderRadius: 20, background: `linear-gradient(135deg, ${GOLD}12, ${GOLD}04)`, border: `1px solid ${GOLD}25`, padding: '88px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}0a, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: '#f0ede6', margin: '0 0 18px', lineHeight: 1.2 }}>
              Prêt à moderniser votre gestion sociale ?
            </h2>
            <p style={{ fontSize: 14, color: '#5e5b55', margin: '0 0 44px', lineHeight: 1.7 }}>
              Accédez à l'application. Premier mois offert.
            </p>
            <a href="/" style={{
              padding: '18px 52px', borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD}, #9a7535)`,
              color: '#0a0908', fontSize: 15, fontWeight: 700, letterSpacing: 0.8,
              cursor: 'pointer', textDecoration: 'none',
              boxShadow: `0 12px 44px ${GOLD}40`,
              transition: 'all .3s ease', display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 20px 56px ${GOLD}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 12px 44px ${GOLD}40`; }}>
              Accéder maintenant →
            </a>
          </div>
        </div>
      </FadeIn>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD2}, ${GOLD})` }} />
          <span style={{ fontSize: 11, color: GOLD, letterSpacing: 2.5 }}>AUREUS SOCIAL PRO</span>
        </div>
        <div style={{ fontSize: 11, color: '#3a3836' }}>© 2026 Aureus IA SPRL · BCE 1028.230.781 · Saint-Gilles, Bruxelles</div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Politique RGPD', 'Conditions', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, color: '#3a3836', textDecoration: 'none', transition: 'color .2s', letterSpacing: 0.5 }}
              onMouseEnter={e => e.target.style.color = GOLD} onMouseLeave={e => e.target.style.color = '#3a3836'}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
