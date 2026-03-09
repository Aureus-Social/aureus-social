'use client';
import { useState, useEffect, useRef } from 'react';

const G = '#B8913A', G2 = '#D4A84C', INK = '#0E0D0A', CREAM = '#F9F6F0', BORDER = '#E8E4DC', STONE = '#56524A', MIST = '#9A968E', WHITE = '#fff';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Cabinet+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden}
.vt-body{font-family:'Cabinet Grotesk',sans-serif;background:#fff;color:#0E0D0A;-webkit-font-smoothing:antialiased}
.vt-body h1,.vt-body h2,.vt-body h3{font-family:'Fraunces',serif;font-weight:400;line-height:1.08;letter-spacing:-.02em}
.vt-body h1{font-size:clamp(36px,5.5vw,72px)}
.vt-body h2{font-size:clamp(28px,3.8vw,50px)}
.vt-body h3{font-size:clamp(20px,2.4vw,28px)}
.vt-body p{font-size:16px;line-height:1.75;color:#56524A;font-weight:300}
.vt-body em{font-style:italic;color:#B8913A}
.vt-wrap{max-width:1200px;margin:0 auto;padding:0 36px}
.vt-section{padding:88px 0}
@media(max-width:768px){.vt-section{padding:56px 0}.vt-wrap{padding:0 20px}}
.vt-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:#B8913A;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}
.vt-eyebrow::before{content:'';width:18px;height:2px;background:#B8913A;border-radius:1px}
.vt-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;border:1px solid #E8E4DC;color:#9A968E;background:#F9F6F0;font-family:'Fira Code',monospace}
.vt-tag-g{background:#EAF4EE;border-color:#9EC4B0;color:#1A5C42}
.vt-tag-au{background:#FBF3E2;border-color:#D4B870;color:#6A4E10}
.vt-tag-b{background:#EDF1F9;border-color:#9EB0D0;color:#18396A}
.btn-p{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:#0E0D0A;color:#fff;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 20px rgba(14,13,10,.18)}
.btn-p:hover{background:#252320;transform:translateY(-2px)}
.btn-s{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#0E0D0A;font-size:14px;font-weight:500;border:1.5px solid #E8E4DC;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}
.btn-s:hover{border-color:#0E0D0A;background:#F9F6F0}
.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:5px;background:linear-gradient(135deg,#B8913A,#D4A84C);color:#0E0D0A;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif;box-shadow:0 4px 24px rgba(184,145,58,.4)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(184,145,58,.5)}
.btn-ow{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:5px;background:transparent;color:#fff;font-size:14px;font-weight:500;border:1.5px solid rgba(255,255,255,.3);cursor:pointer;transition:all .22s;font-family:'Cabinet Grotesk',sans-serif}
.btn-ow:hover{background:rgba(255,255,255,.1)}
.ldot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:ldpulse 2s infinite;display:inline-block}
@keyframes ldpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
.hero-dots{position:absolute;inset:0;pointer-events:none;opacity:.15;background-image:radial-gradient(rgba(255,255,255,.6) 1px,transparent 1px);background-size:28px 28px}
.hero-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(184,145,58,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 80% at 10% 80%,rgba(26,92,66,.1) 0%,transparent 60%)}
.sol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.sol-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.sol-grid{grid-template-columns:1fr}}
.sol-card{background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:32px 28px;cursor:pointer;transition:all .28s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px}
.sol-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#B8913A,transparent);transform:scaleX(0);transform-origin:left;transition:transform .32s}
.sol-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-4px)}
.sol-card:hover::after{transform:scaleX(1)}
.sol-card.featured{background:#0E0D0A;border-color:#0E0D0A}
.sol-card.featured h4,.sol-card.featured .sol-desc{color:rgba(255,255,255,.85)}
.sol-card.featured p{color:rgba(255,255,255,.5)}
.sol-ico{width:48px;height:48px;border-radius:10px;background:#F1EDE6;border:1px solid #E8E4DC;display:flex;align-items:center;justify-content:center;font-size:22px}
.sol-card.featured .sol-ico{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.15)}
.sol-card h4{font-size:17px;font-weight:700;color:#0E0D0A;line-height:1.3;font-family:'Cabinet Grotesk',sans-serif}
.sol-desc{font-size:14px;color:#56524A;line-height:1.7;flex:1}
.sol-link{font-size:13px;font-weight:600;color:#B8913A;display:flex;align-items:center;gap:5px}
.sol-card.featured .sol-link{color:#D4A84C}
.hero-strip{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.08)}
.hs-item{padding:24px 28px;border-right:1px solid rgba(255,255,255,.07)}
.hs-item:last-child{border-right:none}
.hs-val{font-family:'Fraunces',serif;font-size:clamp(24px,3vw,40px);color:#fff;line-height:1;margin-bottom:6px}
.hs-val span{color:#D4A84C}
.hs-lbl{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.06em;text-transform:uppercase;font-weight:500}
@media(max-width:640px){.hero-strip{grid-template-columns:repeat(2,1fr)}.hs-item:nth-child(2){border-right:none}.hs-item:nth-child(3){border-right:1px solid rgba(255,255,255,.07)}}
.theme-card{background:#fff;border:1px solid #E8E4DC;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .25s}
.theme-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.theme-img{height:160px;background:#F1EDE6;display:flex;align-items:center;justify-content:center;font-size:48px;border-bottom:1px solid #E8E4DC}
.theme-body{padding:20px}
.theme-tag{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B8913A;margin-bottom:8px;display:block}
.theme-card h4{font-size:15px;font-weight:600;color:#0E0D0A;margin-bottom:8px;line-height:1.4;font-family:'Cabinet Grotesk',sans-serif}
.theme-card p{font-size:13px;color:#56524A;line-height:1.65}
.theme-cta{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#B8913A;margin-top:14px}
.theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.theme-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.theme-grid{grid-template-columns:1fr}}
.ttab{padding:9px 20px;border-radius:99px;font-size:14px;font-weight:500;color:#56524A;border:1.5px solid #E8E4DC;background:transparent;cursor:pointer;transition:all .2s;font-family:'Cabinet Grotesk',sans-serif}
.ttab.active,.ttab:hover{background:#0E0D0A;color:#fff;border-color:#0E0D0A}
.nl-input{flex:1;min-width:220px;padding:13px 18px;border-radius:5px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-family:'Cabinet Grotesk',sans-serif;font-size:15px;outline:none;transition:border-color .2s}
.nl-input::placeholder{color:rgba(255,255,255,.35)}
.nl-input:focus{border-color:#B8913A}
.step{display:grid;grid-template-columns:56px 1fr;gap:24px;padding:32px 0;border-bottom:1px solid #E8E4DC}
.step:last-child{border-bottom:none}
.step-num{width:48px;height:48px;border-radius:50%;background:#0E0D0A;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:20px;flex-shrink:0;margin-top:2px}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:900px){.info-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.info-grid{grid-template-columns:1fr}}
.info-card{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;transition:all .25s}
.info-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.faq-item{border-bottom:1px solid #E8E4DC}
.faq-q{width:100%;padding:20px 0;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:600;color:#0E0D0A;text-align:left;gap:16px;transition:color .2s}
.faq-q:hover{color:#B8913A}
.faq-arr{font-size:20px;color:#9A968E;transition:transform .3s,color .2s;flex-shrink:0}
.faq-open .faq-arr{transform:rotate(45deg);color:#B8913A}
.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease}
.dark-card{background:#0E0D0A;border-radius:16px;padding:32px;color:#fff;position:relative;overflow:hidden}
.dark-card::before{content:'';position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(184,145,58,.2) 0%,transparent 70%)}
.expert-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
@media(max-width:700px){.expert-grid{grid-template-columns:1fr}}
.expert-card{background:#fff;border:1px solid #E8E4DC;border-radius:10px;padding:28px 24px;display:flex;gap:18px;align-items:flex-start;transition:all .25s}
.expert-card:hover{box-shadow:0 8px 40px rgba(14,13,10,.12);transform:translateY(-3px)}
.contact-ch{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:10px;border:1px solid #E8E4DC;background:#F9F6F0;transition:all .22s;cursor:pointer;margin-bottom:12px}
.contact-ch:hover{border-color:#B8913A;background:#FBF3E2}
.finp,.fsel,.ftxt{padding:11px 14px;border-radius:5px;border:1.5px solid #E8E4DC;background:#F9F6F0;font-family:'Cabinet Grotesk',sans-serif;font-size:14px;color:#0E0D0A;transition:all .2s;outline:none;width:100%}
.finp:focus,.fsel:focus,.ftxt:focus{border-color:#B8913A;background:#fff;box-shadow:0 0 0 3px rgba(184,145,58,.1)}
.ftxt{resize:vertical;min-height:100px}.fsel{appearance:none;cursor:pointer}
.page-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
@media(max-width:800px){.page-hero-grid{grid-template-columns:1fr;gap:36px}}
.footer-grid{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
@media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr;gap:28px}}
@media(max-width:560px){.footer-grid{grid-template-columns:1fr}}
`;

// ─── ARROW SVG ───────────────────────────────
const Arr = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── FOOTER ──────────────────────────────────
function Footer({ go }) {
  return (
    <footer style={{ background: INK, padding: '60px 0 0' }}>
      <div className="vt-wrap">
        <div className="footer-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:14 }} onClick={() => go('home')}>
              <div style={{ width:34, height:34, borderRadius:8, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff', letterSpacing:'.04em' }}>AUREUS</div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,.3)', letterSpacing:'.2em', textTransform:'uppercase' }}>Social Pro</div>
              </div>
            </div>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', lineHeight:1.7, marginBottom:14, maxWidth:260 }}>Secrétariat social numérique belge. 132 modules, 166 CP, sécurité bancaire.</p>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:'rgba(255,255,255,.2)' }}>BCE BE 1028.230.781 · Saint-Gilles, Bruxelles</div>
          </div>
          {[
            { title:'Solutions', links:[['Indépendants','independant'],['Devenir employeur','employeur'],['Employeurs','employeurs'],['Experts-comptables','experts'],['Formations','formations']] },
            { title:'Produit', links:[['Application','app'],['Demander une démo','contact'],['Documentation',null],['Statut',null]] },
            { title:'Légal', links:[['Confidentialité',null],['CGU',null],['RGPD',null],['Disclaimer',null]] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:12 }}>{col.title}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {col.links.map(([label, page]) => (
                  <a key={label} onClick={() => page && go(page)} style={{ fontSize:14, color:'rgba(255,255,255,.45)', cursor:'pointer', transition:'color .18s' }}
                    onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='rgba(255,255,255,.45)'}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', padding:'20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.25)' }}>© 2026 Aureus IA SPRL · Tous droits réservés</span>
          <div style={{ display:'flex', gap:16 }}>
            {['Disclaimer','Privacy','Cookie policy','CGU'].map(l => (
              <a key={l} style={{ fontSize:12, color:'rgba(255,255,255,.25)', cursor:'pointer' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── DARK CARD ───────────────────────────────
function DarkCard({ label, title, sub, stats }) {
  return (
    <div className="dark-card">
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:G, marginBottom:16 }}>{label}</div>
      <h3 style={{ color:'#fff', fontSize:20, marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', marginBottom:24 }}>{sub}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {stats.map(([val, lbl]) => (
          <div key={lbl}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:26, color:G, marginBottom:2 }}>{val}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', letterSpacing:'.04em' }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CTA BAND ────────────────────────────────
function CtaBand({ title, sub, btnLabel, go, target }) {
  return (
    <div style={{ background:INK, padding:'72px 0', textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 120% at 50% 100%,rgba(184,145,58,.1) 0%,transparent 70%)' }}/>
      <div style={{ position:'relative', zIndex:1 }} className="vt-wrap">
        <h2 style={{ color:'#fff', marginBottom:14 }} dangerouslySetInnerHTML={{ __html: title }}/>
        <p style={{ color:'rgba(255,255,255,.5)', maxWidth:440, margin:'0 auto 32px', fontSize:17 }}>{sub}</p>
        <button className="btn-gold" onClick={() => go(target || 'contact')}>{btnLabel}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════

function PageHome({ go }) {
  const articles = [
    { cat:'paie', ico:'🧮', tag:'Paie', title:'Barèmes sectoriels 2026 : ce qui change', desc:'Mise à jour des 166 CP intégrée dans Aureus Social Pro avant le 1er janvier. Retrouvez les nouvelles grilles.' },
    { cat:'legal', ico:'⚖️', tag:'Législation', title:'Bonus emploi 2026 : nouveaux plafonds', desc:'Le plafond salarial a été révisé. Impact sur vos calculs et comment Aureus l\'intègre automatiquement.' },
    { cat:'onss', ico:'🏛', tag:'ONSS', title:'DmfA Q1 2026 : délai et nouveautés', desc:'Date limite, nouveaux codes travailleurs et changements dans la réduction structurelle.' },
    { cat:'rh', ico:'👥', tag:'RH', title:'Portail employé : fiches, documents, congés', desc:'Vos collaborateurs accèdent à leurs fiches sans solliciter le service paie.' },
    { cat:'paie', ico:'🏦', tag:'Paie', title:'SEPA pain.001 : automatisez vos virements', desc:'Générez vos fichiers de virement batch ISO 20022 directement depuis votre tableau de bord.' },
    { cat:'legal', ico:'🔐', tag:'RGPD', title:'RGPD Art. 32 &amp; paie belge', desc:'Chiffrement NISS, registre Art. 30, convention DPA — comment Aureus vous met en conformité.' },
  ];
  const [filter, setFilter] = useState('tout');
  const visible = articles.filter(a => filter === 'tout' || a.cat === filter);

  const solutions = [
    { ico:'🚀', title:"Se lancer comme indépendant", desc:"Statut, affiliation ONSS, obligations déclaratives — tout ce qu'il faut savoir pour démarrer sereinement.", page:'independant', featured:false },
    { ico:'👤', title:"Devenir employeur", desc:"Engagez votre premier collaborateur en toute conformité. Immatriculation, contrat, Dimona, premiers salaires.", page:'employeur', featured:true },
    { ico:'🏢', title:"Employeurs", desc:"Automatisez la paie, les déclarations trimestrielles et les exports comptables pour vos équipes.", page:'employeurs', featured:false },
    { ico:'🏛', title:"Experts-comptables", desc:"Portail multi-clients, mandats Mahis/CSAM, API REST — gérez tous vos dossiers depuis un tableau de bord.", page:'experts', featured:false },
    { ico:'📊', title:"Déclarations & Belcotax", desc:"DmfA trimestrielle, fiches 281.10/20/30, téléversement MyMinfin — conformes SPF Finances.", page:'employeurs', featured:false },
    { ico:'📚', title:"Formations", desc:"Webinaires, guides pratiques et tutoriels sur le droit social belge, ONSS et Dimona.", page:'formations', featured:false },
  ];

  return (
    <>
      {/* HERO */}
      <section style={{ background:INK, padding:'80px 0 0', position:'relative', overflow:'hidden', minHeight:560, display:'flex', flexDirection:'column' }}>
        <div className="hero-glow"/><div className="hero-dots"/>
        <div className="vt-wrap" style={{ position:'relative', zIndex:1, flex:1, display:'flex', alignItems:'center', paddingBottom:0 }}>
          <div style={{ maxWidth:640 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:99, border:'1px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.06)', fontSize:12, color:'rgba(255,255,255,.7)', marginBottom:24 }}>
              <span className="ldot"/>&nbsp;Secrétariat social numérique — v18 en production
            </div>
            <h1 style={{ color:'#fff', marginBottom:20 }}>Votre partenaire<br/>social belge.<br/><em>Enfin numérique.</em></h1>
            <p style={{ fontSize:18, color:'rgba(255,255,255,.6)', marginBottom:36, lineHeight:1.7, fontWeight:300, maxWidth:520 }}>
              De la Dimona aux déclarations trimestrielles, de la fiche de paie à la signature électronique — tout ce dont vous avez besoin, en un seul endroit.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:60 }}>
              <button className="btn-gold" onClick={() => go('app')}>Accéder à l'application <Arr/></button>
              <button className="btn-ow" onClick={() => go('contact')}>Demander une démo</button>
            </div>
          </div>
        </div>
        <div className="hero-strip">
          {[['166','Commissions paritaires'],['<8','Dimona (secondes)'],['132','Modules déployés'],['99.97%','Uptime production']].map(([v,l]) => (
            <div key={l} className="hs-item">
              <div className="hs-val"><span dangerouslySetInnerHTML={{ __html: v }}/></div>
              <div className="hs-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="vt-section" style={{ background:CREAM }}>
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}>
            <div className="vt-eyebrow">Nos solutions</div>
            <h2>Pour chaque profil,<br/><em>la bonne solution.</em></h2>
            <p style={{ maxWidth:520, marginTop:12 }}>Indépendant, employeur ou expert-comptable — Aureus Social Pro s'adapte à votre réalité.</p>
          </div>
          <div className="sol-grid">
            {solutions.map(s => (
              <div key={s.title} className={`sol-card${s.featured ? ' featured' : ''}`} onClick={() => go(s.page)}>
                <div className="sol-ico">{s.ico}</div>
                <h4>{s.title}</h4>
                <p className="sol-desc">{s.desc}</p>
                <div className="sol-link">Découvrir <Arr/></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THEMES */}
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:32 }}>
            <div className="vt-eyebrow">Toujours prêt pour l'avenir</div>
            <h2>Ressources &amp; <em>actualités</em></h2>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40 }}>
            {[['tout','Tout'],['paie','Paie'],['rh','RH'],['legal','Législation'],['onss','ONSS']].map(([k,l]) => (
              <button key={k} className={`ttab${filter===k?' active':''}`} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="theme-grid">
            {visible.map(a => (
              <div key={a.title} className="theme-card">
                <div className="theme-img">{a.ico}</div>
                <div className="theme-body">
                  <span className="theme-tag">{a.tag}</span>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                  <div className="theme-cta">Lire <Arr/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter go={go}/>

      <CtaBand title="Prêt à moderniser votre <em>gestion sociale</em>&nbsp;?" sub="Premier mois offert · Accès immédiat · Migration assistée" btnLabel="Accéder maintenant →" go={go} target="app"/>
      <Footer go={go}/>
    </>
  );
}

function Newsletter({ go }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <section style={{ background:INK, padding:'72px 0' }}>
      <div className="vt-wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <div>
            <div className="vt-eyebrow" style={{ color:G2 }}>Newsletter</div>
            <h2 style={{ color:'#fff', marginBottom:16 }}>Ne manquez aucune<br/><em style={{ color:G2 }}>actualité sociale.</em></h2>
            <p style={{ color:'rgba(255,255,255,.5)', marginBottom:28 }}>Changements législatifs belges, barèmes mis à jour, conseils pratiques.</p>
            {sent ? (
              <div style={{ padding:'14px 20px', borderRadius:10, background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', color:'#86efac', fontSize:15 }}>✓ Inscription confirmée — bienvenue !</div>
            ) : (
              <>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <input className="nl-input" type="email" placeholder="votre@email.be" value={email} onChange={e => setEmail(e.target.value)}/>
                  <button className="btn-gold" onClick={() => { if(email) setSent(true); }}>S'inscrire</button>
                </div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', marginTop:10, lineHeight:1.6 }}>Politique de confidentialité Aureus IA SPRL. Désinscription à tout moment.</p>
              </>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[['⚖️','Veille législative quotidienne','Alertes dès qu\'une loi belge impacte vos obligations'],['🧮','Barèmes 2026 mis à jour','Nouvelles grilles CP avant leur entrée en vigueur'],['💡','Conseils d\'experts','Fiches pratiques rédigées par nos juristes en droit social']].map(([ico,t,d]) => (
              <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:7, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{ico}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:2 }}>{t}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.45)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PageIndependant({ go }) {
  const steps = [
    { n:1, title:'Choisir votre statut', body:"Indépendant à titre principal ou complémentaire, société (SRL, SA…) ou unipersonnel. Chaque statut a des implications sociales et fiscales différentes.", tags:['SRL · SA · Unipersonnel'], tagClass:'vt-tag-au' },
    { n:2, title:'Numéro d\'entreprise (BCE)', body:"Inscription au registre des personnes morales auprès du greffe du tribunal de l'entreprise ou via un guichet d'entreprises agréé.", tags:['BCE · Banque-Carrefour'], tagClass:'vt-tag-b' },
    { n:3, title:'Affiliation à une caisse sociale', body:"Obligation légale dans les 90 jours du début d'activité. Aureus vous guide dans les démarches.", tags:['ONSS · 90 jours'], tagClass:'vt-tag-g' },
    { n:4, title:'Cotisations sociales trimestrielles', body:"Taux : 20,5% jusqu'à 72 810 € et 14,16% au-delà pour 2026. Minimum : 870,78 €/trimestre (activité principale).", tags:['20,5% · Trimestriel'], tagClass:'vt-tag-au' },
    { n:5, title:'Obligations TVA & IPP', body:"Déclaration TVA (mensuelle ou trimestrielle), déclaration IPP annuelle. Aureus génère les données pour votre comptable.", tags:['TVA · IPP · SPF Finances'], tagClass:'' },
    { n:6, title:'Protection sociale', body:"Couverture maladie-invalidité (INAMI), droit à la pension, allocations familiales. Optionnel : PLCI, assurance revenu garanti.", tags:['INAMI · Pension · PLCI'], tagClass:'vt-tag-g' },
  ];
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    ['Quel est le délai pour s\'affilier à une caisse sociale ?','Vous avez 90 jours à compter du début de votre activité. En cas de dépassement, vous risquez une affiliation d\'office et des majorations.'],
    ['Combien coûtent les cotisations sociales en 2026 ?','20,5% sur la tranche jusqu\'à 72 810,09 € et 14,16% au-delà. Minimum absolu : 870,78 €/trimestre pour une activité principale.'],
    ['Puis-je travailler comme indépendant complémentaire tout en étant salarié ?','Oui, sous réserve de l\'accord de votre employeur (clause d\'exclusivité). Vos cotisations seront réduites grâce au régime complémentaire.'],
    ['Aureus gère-t-il aussi les indépendants en société ?','Oui. Aureus Social Pro gère aussi bien les personnes physiques que les mandataires de société (gérants SRL, administrateurs SA).'],
  ];
  return (
    <>
      <section style={{ background:CREAM, padding:'60px 0 64px', borderBottom:`1px solid ${BORDER}` }}>
        <div className="vt-wrap"><div className="page-hero-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:MIST, marginBottom:20 }}>Accueil <span style={{ color:G }}>›</span> Indépendants</div>
            <div className="vt-eyebrow">Indépendants</div>
            <h1 style={{ marginBottom:18 }}>Se lancer comme<br/><em>indépendant</em><br/>en Belgique.</h1>
            <p style={{ fontSize:18, color:STONE, marginBottom:28, fontWeight:300 }}>Statut, affiliation ONSS, cotisations, obligations — le guide complet étape par étape.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn-p" onClick={() => go('contact')}>Parler à un expert</button>
              <button className="btn-s" onClick={() => go('contact')}>Demander une démo</button>
            </div>
          </div>
          <DarkCard label="Aureus Social Pro" title="Votre back-office social" sub="Automatisez vos obligations sociales dès le premier jour." stats={[['166','CP gérées'],['<8s','Dimona'],['100%','Belge & conforme'],['24/7','Accès plateforme']]}/>
        </div></div>
      </section>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Guide pas à pas</div><h2>Se lancer en <em>6 étapes</em></h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              {steps.map(s => (
                <div key={s.n} className="step">
                  <div className="step-num">{s.n}</div>
                  <div>
                    <h4 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:17, fontWeight:700, color:INK, marginBottom:8 }}>{s.title}</h4>
                    <p style={{ fontSize:15 }}>{s.body}</p>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
                      {s.tags.map(t => <span key={t} className={`vt-tag ${s.tagClass}`}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:10, padding:28, marginBottom:20 }}>
                <h4 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:16, marginBottom:16 }}>✅ Ce qu'Aureus automatise</h4>
                {['Dimona IN/OUT en moins de 8 secondes','Calcul cotisations ONSS 13,07%','Fiches de paie PDF conformes','DmfA XML trimestrielle ONSS','Belcotax 281.10 SPF Finances','SEPA pain.001 virements batch','Signature électronique (Yousign)'].map(item => (
                  <div key={item} style={{ display:'flex', gap:10, fontSize:14, color:STONE, marginBottom:10 }}>
                    <span style={{ color:'#22C55E', flexShrink:0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <div style={{ background:'#FBF3E2', border:'1px solid #D4B870', borderRadius:10, padding:24 }}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#7A5010', marginBottom:12 }}>Bon à savoir</div>
                <p style={{ fontSize:14, color:'#5A3A0A', lineHeight:1.7 }}>En 2026, le <strong>premier employé bénéficie d'une exonération totale des cotisations patronales ONSS pendant 5 ans</strong>. Aureus la calcule et l'applique automatiquement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="vt-section" style={{ background:CREAM }}>
        <div className="vt-wrap">
          <div style={{ textAlign:'center', marginBottom:48 }}><div className="vt-eyebrow">Questions fréquentes</div><h2>Tout ce que vous voulez <em>savoir</em></h2></div>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            {faqs.map(([q,a], i) => (
              <div key={i} className={`faq-item${openFaq===i ? ' faq-open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>{q}<span className="faq-arr">+</span></button>
                <div className="faq-a" style={{ maxHeight: openFaq===i ? 200 : 0 }}>
                  <div style={{ padding:'0 0 20px', fontSize:15, color:STONE, lineHeight:1.75 }}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Prêt à vous lancer <em>en toute sérénité</em>&nbsp;?" sub="Nos experts vous accompagnent de A à Z." btnLabel="Parler à un expert →" go={go}/>
      <Footer go={go}/>
    </>
  );
}

function PageEmployeur({ go }) {
  const steps = [
    { n:1, title:'Immatriculation ONSS employeur', body:"Obtenez un numéro d'employeur ONSS avant d'engager. Aureus guide la soumission via WIDE et assure le suivi du matricule provisoire.", tags:['ONSS · WIDE · Matricule'], tagClass:'vt-tag-b' },
    { n:2, title:'Rédaction du contrat de travail', body:"CDI, CDD, temps plein ou partiel — Aureus génère des modèles conformes à la commission paritaire applicable.", tags:['CDI · CDD · CP 200'], tagClass:'vt-tag-au' },
    { n:3, title:'Déclaration Dimona IN', body:"Obligatoire avant le début du travail. Aureus soumet la Dimona IN en moins de 8 secondes avec confirmation ONSS temps réel.", tags:['Dimona IN · <8s · ONSS'], tagClass:'vt-tag-g' },
    { n:4, title:'Calcul du premier salaire', body:"Brut → Net complet : ONSS 13,07%, précompte professionnel Annexe III, bonus emploi, réduction bas salaire. Fiche PDF automatique.", tags:['ONSS · PP · Bonus emploi'], tagClass:'vt-tag-au' },
    { n:5, title:'Virement SEPA & paiement', body:"Aureus génère le fichier SEPA pain.001 prêt à importer dans votre banque. Validation IBAN/BIC intégrée.", tags:['SEPA pain.001 · ISO 20022'], tagClass:'vt-tag-b' },
    { n:6, title:'Déclarations trimestrielles ONSS', body:"DmfA XML Q1–Q4 générée automatiquement avec toutes les réductions applicables. Envoi direct ONSS.", tags:['DmfA · Q1–Q4 · Réduction struct.'], tagClass:'' },
  ];
  const avantages = [
    ['🎁','Exemption 1er employé','Exonération totale des cotisations patronales ONSS pendant 5 ans. Calculée automatiquement par Aureus.'],
    ['💼','Activa.brussels','Prime mensuelle jusqu\'à 350 € pour l\'engagement d\'un demandeur d\'emploi bruxellois.'],
    ['📉','Réduction bas salaire','Réduction ONSS patronale automatique pour les salaires inférieurs à 3 100 €/mois.'],
    ['🎓','SINE & plan Activa','Réductions pour l\'engagement de personnes éloignées du marché de l\'emploi.'],
    ['👶','Congé parental','Gestion des suspensions de contrat, remplacement temporaire, déclarations ONSS spécifiques.'],
    ['📋','MonBEE recrutement','Prime à l\'embauche via MonBEE. Aureus rappelle les délais et génère les documents nécessaires.'],
  ];
  return (
    <>
      <section style={{ background:CREAM, padding:'60px 0 64px', borderBottom:`1px solid ${BORDER}` }}>
        <div className="vt-wrap"><div className="page-hero-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:MIST, marginBottom:20 }}>Accueil <span style={{ color:G }}>›</span> Devenir employeur</div>
            <div className="vt-eyebrow">Premier employé</div>
            <h1 style={{ marginBottom:18 }}>Engagez votre<br/>premier collaborateur<br/><em>en confiance.</em></h1>
            <p style={{ fontSize:18, color:STONE, marginBottom:28, fontWeight:300 }}>Immatriculation ONSS, contrat, Dimona, premiers salaires — Aureus guide chaque étape.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn-p" onClick={() => go('contact')}>Demander une démo</button>
              <button className="btn-s" onClick={() => go('employeurs')}>Déjà employeur →</button>
            </div>
          </div>
          <DarkCard label="Premier employé en Belgique" title="Ce qu'Aureus fait pour vous" sub="Automatisation complète du cycle social." stats={[['0€','Cotisations patronales an 1'],['8s','Dimona soumise'],['100%','Conformité ONSS'],['166 CP','Toutes commissions']]}/>
        </div></div>
      </section>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Étapes clés</div><h2>De 0 à votre premier <em>employé</em></h2></div>
          <div style={{ maxWidth:680 }}>
            {steps.map(s => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <div>
                  <h4 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:17, fontWeight:700, color:INK, marginBottom:8 }}>{s.title}</h4>
                  <p style={{ fontSize:15 }}>{s.body}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
                    {s.tags.map(t => <span key={t} className={`vt-tag ${s.tagClass}`}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="vt-section" style={{ background:CREAM }}>
        <div className="vt-wrap">
          <div style={{ textAlign:'center', marginBottom:48 }}><div className="vt-eyebrow">Avantages 2026</div><h2>Exonérations &amp; <em>primes à l'embauche</em></h2></div>
          <div className="info-grid">
            {avantages.map(([ico,t,d]) => (
              <div key={t} className="info-card">
                <div style={{ fontSize:28, marginBottom:14 }}>{ico}</div>
                <h4 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:16, fontWeight:700, color:INK, marginBottom:8 }}>{t}</h4>
                <p style={{ fontSize:14 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Engagez votre premier collaborateur <em>dès demain.</em>" sub="Démo gratuite · Accompagnement complet · Premier mois offert" btnLabel="Démarrer →" go={go}/>
      <Footer go={go}/>
    </>
  );
}

function PageEmployeurs({ go }) {
  const modules = [
    ['⚡','Dimona électronique','IN/OUT/UPDATE en moins de 8 secondes. Connexion directe ONSS via Mahis/CSAM. Validation NISS temps réel.'],
    ['🧮','Calcul de paie belge','166 CP, barèmes sectoriels 2026, ONSS 13,07%, précompte professionnel Annexe III, bonus emploi, réductions.'],
    ['📋','DmfA XML trimestrielle','Q1–Q4 conformes ONSS. Réduction structurelle, bas salaire, bonus emploi. Envoi direct depuis la plateforme.'],
    ['📊','Belcotax XML','Fiches 281.10, 281.20, 281.30 conformes SPF Finances. Téléversement direct MyMinfin. Corrections et annulations.'],
    ['🏦','SEPA pain.001','Fichiers virement batch ISO 20022. Validation IBAN/BIC. Multi-devises. Compatible toutes banques belges.'],
    ['📁','Export comptable × 6','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV générique. PCMN belge intégré.'],
    ['✍️','Signature électronique','Yousign ou DocuSign. Contrats, avenants, documents RH. Valeur probante légale. Archivage GED automatique.'],
    ['👥','Portail employé','Fiches de paie, documents RH, demandes de congé — accessibles directement par chaque collaborateur.'],
    ['🔐','Sécurité RGPD Art. 32','AES-256-GCM NISS/IBAN, audit trail complet, RLS Supabase, OWASP ZAP CI/CD, backup nocturne chiffré B2.'],
  ];
  return (
    <>
      <section style={{ background:CREAM, padding:'60px 0 64px', borderBottom:`1px solid ${BORDER}` }}>
        <div className="vt-wrap"><div className="page-hero-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:MIST, marginBottom:20 }}>Accueil <span style={{ color:G }}>›</span> Employeurs</div>
            <div className="vt-eyebrow">Employeurs</div>
            <h1 style={{ marginBottom:18 }}>Votre paie,<br/>vos déclarations,<br/><em>automatisées.</em></h1>
            <p style={{ fontSize:18, color:STONE, marginBottom:28, fontWeight:300 }}>166 commissions paritaires, DmfA XML, Belcotax, export WinBooks/BOB — 132 modules pour le cycle social belge complet.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn-p" onClick={() => go('app')}>Accéder à la plateforme</button>
              <button className="btn-s" onClick={() => go('contact')}>Demander une démo</button>
            </div>
          </div>
          <DarkCard label="Plateforme en production" title="Chiffres réels — Mars 2026" sub="132 modules · 44 246 lignes de code" stats={[['1 274','Fiches calculées'],['392','Déclarations ONSS'],['42','Entreprises gérées'],['99.97%','Uptime']]}/>
        </div></div>
      </section>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Fonctionnalités</div><h2>132 modules pour le <em>cycle social complet</em></h2></div>
          <div className="info-grid">
            {modules.map(([ico,t,d]) => (
              <div key={t} className="info-card">
                <div style={{ fontSize:28, marginBottom:14 }}>{ico}</div>
                <h4 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:16, fontWeight:700, color:INK, marginBottom:8 }}>{t}</h4>
                <p style={{ fontSize:14 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Voyez la plateforme <em>en action.</em>" sub="Démo sur vos propres données — 30 minutes chrono." btnLabel="Réserver une démo →" go={go}/>
      <Footer go={go}/>
    </>
  );
}

function PageExperts({ go }) {
  const items = [
    ['01','Portail multi-clients centralisé','Gérez tous vos dossiers employeurs depuis un seul tableau de bord. Droits d\'accès granulaires par collaborateur.'],
    ['02','Mandats ONSS & Belcotax automatiques','Génération des conventions de mandat Mahis/CSAM conformes. Suivi des mandats actifs par client.'],
    ['03','API REST + Webhooks HMAC','Intégrez Aureus dans votre ERP ou workflow. Webhooks sécurisés pour les événements paie, DmfA, Dimona.'],
    ['04','Migration depuis vos prestataires','Parseur CSV multi-format pour importer depuis SD Worx, Partena, Securex, Sodexo. Migration assistée incluse.'],
    ['05','6 formats d\'export comptable','WinBooks ACT, BOB50, Exact Online XML, Octopus, Horus/Popsy, CSV. PCMN belge intégré.'],
    ['06','SLA 99.9% + Account Manager','Réponse garantie en moins de 2h ouvrables. Canal Slack ou Teams dédié. Account manager attitré.'],
  ];
  return (
    <>
      <section style={{ background:CREAM, padding:'60px 0 64px', borderBottom:`1px solid ${BORDER}` }}>
        <div className="vt-wrap"><div className="page-hero-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:MIST, marginBottom:20 }}>Accueil <span style={{ color:G }}>›</span> Experts-comptables</div>
            <div className="vt-eyebrow">Experts-comptables</div>
            <h1 style={{ marginBottom:18 }}>Un portail,<br/>tous vos <em>dossiers</em><br/>sociaux.</h1>
            <p style={{ fontSize:18, color:STONE, marginBottom:28, fontWeight:300 }}>Mandats Mahis/CSAM, portail multi-clients, API REST, migration depuis SD Worx ou Partena.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn-p" onClick={() => go('contact')}>Demander une démo fiduciaire</button>
              <button className="btn-s" onClick={() => go('contact')}>Migration assistée</button>
            </div>
          </div>
          <DarkCard label="Plan Fiduciaire" title="Multi-dossiers illimités" sub="Portail · API · SLA · Migration" stats={[['∞','Dossiers clients'],['99.9%','SLA garanti'],['REST','API + Webhooks'],['Auto','Migration CSV']]}/>
        </div></div>
      </section>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Ce que nous offrons</div><h2>Conçu pour les <em>professionnels du chiffre</em></h2></div>
          <div className="expert-grid">
            {items.map(([n,t,d]) => (
              <div key={n} className="expert-card">
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:36, color:CREAM, lineHeight:1, flexShrink:0, width:44 }}>{n}</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:INK, marginBottom:6, fontFamily:"'Cabinet Grotesk',sans-serif" }}>{t}</div>
                  <div style={{ fontSize:14, color:STONE, lineHeight:1.7 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="vt-section" style={{ background:CREAM }}>
        <div className="vt-wrap">
          <div style={{ textAlign:'center', marginBottom:48 }}><div className="vt-eyebrow">Migration</div><h2>Quitter SD Worx ou Partena <em>sans risque.</em></h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, maxWidth:900, margin:'0 auto' }}>
            {[['📥','Export données','Extraction CSV depuis votre prestataire actuel'],['🔄','Import automatique','Parseur multi-format Aureus — aucune ressaisie'],['✅','Validation croisée','Comparaison des calculs avant go-live'],['🚀','Go-live en 7 jours','Dossiers opérationnels dès le premier cycle']].map(([ico,t,d]) => (
              <div key={t} style={{ textAlign:'center', padding:'24px 16px', background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10 }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{ico}</div>
                <div style={{ fontWeight:700, fontSize:14, color:INK, marginBottom:6 }}>{t}</div>
                <div style={{ fontSize:13, color:STONE }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Rejoignez les fiduciaires qui ont choisi <em>l'indépendance.</em>" sub="Migration assistée · SLA 99.9% · Premier mois offert" btnLabel="Demo fiduciaire →" go={go}/>
      <Footer go={go}/>
    </>
  );
}

function PageFormations({ go }) {
  const modules = [
    { ico:'⚖️', title:'Droit social belge', desc:'Loi du 27/06/1969, cotisations ONSS, obligations de l\'employeur, commissions paritaires — les fondamentaux expliqués clairement.', featured:false },
    { ico:'🧮', title:'Calcul de paie avancé', desc:'Brut → Net complet : ONSS 13,07%, précompte professionnel Annexe III, bonus emploi, réductions structurelles. Exercices pratiques inclus.', featured:true },
    { ico:'📋', title:'DmfA & Belcotax', desc:'Déclarations trimestrielles ONSS, fiches 281.10/20/30, délais, corrections — le guide complet étape par étape.', featured:false },
    { ico:'🚀', title:'Onboarding Aureus Pro', desc:'Prise en main complète : configuration, import des travailleurs, première fiche de paie, première Dimona — en 2 heures.', featured:false },
    { ico:'🏛', title:'RGPD & sécurité RH', desc:'Obligations RGPD Art. 28 et 32, registre Art. 30, DPA, chiffrement NISS/IBAN — conformité complète pour les gestionnaires de paie.', featured:false },
    { ico:'📊', title:'Veille législative continue', desc:'Alertes automatiques dès qu\'une loi belge impacte vos obligations. Barèmes 2026 mis à jour avant leur entrée en vigueur.', featured:false },
  ];
  const articles = [
    { ico:'⚖️', tag:'Droit social', title:"Premier employé : les 5 erreurs à éviter", desc:"Immatriculation tardive, Dimona oubliée, CP incorrecte — les pièges les plus fréquents et comment les éviter." },
    { ico:'💼', tag:'Entrepreneuriat', title:"Indépendant ou société : quel statut choisir en 2026 ?", desc:"Cotisations, fiscalité, protection sociale — comparaison complète pour faire le bon choix." },
    { ico:'🏥', tag:'Santé', title:"Absentéisme : obligations légales de l'employeur belge", desc:"Salaire garanti, certificat médical, contrôle médical — vos droits et obligations détaillés." },
    { ico:'🎯', tag:'Motivation', title:"Rémunération alternative : warrants, chèques-repas, voiture", desc:"Optimisez votre politique salariale avec les avantages extralégaux belges." },
    { ico:'🔐', tag:'RGPD', title:"RGPD & données RH : ce que tout employeur doit savoir", desc:"Traitement NISS, IBAN, dossiers médicaux — obligations RGPD Art. 28 et 32 expliquées simplement." },
    { ico:'🧮', tag:'Paie', title:"Barèmes 2026 : les changements clés par CP", desc:"CP 200, 226, 319 — revue des nouvelles grilles salariales intégrées dans Aureus avant le 1er janvier." },
  ];
  return (
    <>
      <section style={{ background:CREAM, padding:'60px 0 64px', borderBottom:`1px solid ${BORDER}` }}>
        <div className="vt-wrap"><div className="page-hero-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:MIST, marginBottom:20 }}>Accueil <span style={{ color:G }}>›</span> Formations</div>
            <div className="vt-eyebrow">Formations</div>
            <h1 style={{ marginBottom:18 }}>Maîtrisez le droit<br/>social belge.<br/><em>À votre rythme.</em></h1>
            <p style={{ fontSize:18, color:STONE, marginBottom:28, fontWeight:300 }}>Webinaires, guides pratiques et tutoriels sur la paie belge, ONSS, Dimona et Belcotax — par nos experts juridiques.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn-p" onClick={() => go('contact')}>Voir le programme</button>
              <button className="btn-s" onClick={() => go('contact')}>Nous contacter</button>
            </div>
          </div>
          <DarkCard label="Formations Aureus" title="Apprenez des experts" sub="Contenu basé sur les vrais cas pratiques de la plateforme." stats={[['6','Modules de formation'],['100%','Droit belge 2026'],['CPD','Heures validées IEC'],['FR/NL','Langues']]}/>
        </div></div>
      </section>
      <section className="vt-section" style={{ background:CREAM }}>
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Thématiques</div><h2>Nos <em>6 modules</em> de formation</h2></div>
          <div className="sol-grid">
            {modules.map(m => (
              <div key={m.title} className={`sol-card${m.featured ? ' featured' : ''}`} onClick={() => go('contact')}>
                <div className="sol-ico">{m.ico}</div>
                <h4>{m.title}</h4>
                <p className="sol-desc">{m.desc}</p>
                <div className="sol-link">Voir le module <Arr/></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ marginBottom:48 }}><div className="vt-eyebrow">Inspiration</div><h2>Toujours prêt(e) pour <em>l'avenir</em></h2></div>
          <div className="theme-grid">
            {articles.map(a => (
              <div key={a.title} className="theme-card">
                <div className="theme-img">{a.ico}</div>
                <div className="theme-body">
                  <span className="theme-tag">{a.tag}</span>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                  <div className="theme-cta">Lire <Arr/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Newsletter go={go}/>
      <CtaBand title="Vous créez une activité ou vous souhaitez <em>développer votre entreprise&nbsp;?</em>" sub="Quelle que soit votre question, Aureus vous donne des réponses claires." btnLabel="Contactez-nous →" go={go}/>
      <Footer go={go}/>
    </>
  );
}

function PageContact({ go }) {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="vt-section">
        <div className="vt-wrap">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:72, alignItems:'start' }}>
            <div>
              <div className="vt-eyebrow">Contact</div>
              <h2>Comment pouvons-nous<br/>vous <em>aider</em>&nbsp;?</h2>
              <p style={{ margin:'16px 0 28px', fontSize:17 }}>Notre équipe répond sous 4h ouvrables. Pas de chatbot — de vrais experts en droit social belge.</p>
              {[['✉️','E-mail','info@aureus-ia.com'],['💻','Application','app.aureussocial.be'],['📍','Adresse','Place Marcel Broodthaers 8, 1060 Saint-Gilles, Bruxelles']].map(([ico,l,v]) => (
                <div key={l} className="contact-ch">
                  <div style={{ width:40, height:40, borderRadius:9, background:WHITE, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{ico}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:INK, marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:14, color:STONE }}>{v}</div>
                  </div>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:8 }}>
                {[['BCE','BE 1028.230.781'],['Mahis','DGIII/MAHI011'],['Peppol','0208:1028230781'],['Réponse','< 4h ouvrables']].map(([l,v]) => (
                  <div key={l} style={{ background:CREAM, border:`1px solid ${BORDER}`, borderRadius:5, padding:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:MIST, marginBottom:6 }}>{l}</div>
                    <div style={{ fontFamily:"'Fira Code',monospace", fontSize:12, color:INK }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:'36px 32px', boxShadow:'0 8px 40px rgba(14,13,10,.12)' }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, color:INK, marginBottom:6, fontWeight:400 }}>Demande de démo</div>
              <div style={{ fontSize:14, color:MIST, marginBottom:28 }}>Réponse garantie sous 4h ouvrables.</div>
              {sent ? (
                <div style={{ padding:'20px', borderRadius:10, background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', color:'#166534', fontSize:16, textAlign:'center' }}>
                  ✓ Message envoyé — nous vous répondrons sous 4h ouvrables.
                </div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {[['Prénom *','text','Jean'],['Nom *','text','Dupont']].map(([l,t,ph]) => (
                      <div key={l} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <label style={{ fontSize:13, fontWeight:600, color:INK }}>{l}</label>
                        <input className="finp" type={t} placeholder={ph}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:INK }}>E-mail professionnel *</label>
                      <input className="finp" type="email" placeholder="jean.dupont@fiduciaire.be"/>
                    </div>
                    <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:INK }}>Société</label>
                      <input className="finp" type="text" placeholder="Cabinet Dupont & Associés"/>
                    </div>
                    <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:INK }}>Vous êtes *</label>
                      <select className="fsel">
                        <option value="">Sélectionnez...</option>
                        {['Indépendant / Starter','Fiduciaire / Expert-comptable','Employeur direct','Secrétariat social','Courtier / Partenaire','Autre'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:INK }}>Message</label>
                      <textarea className="ftxt" placeholder="Décrivez votre situation, vos besoins ou vos questions..."/>
                    </div>
                  </div>
                  <button onClick={() => setSent(true)} style={{ width:'100%', marginTop:6, padding:14, borderRadius:5, border:'none', background:INK, color:WHITE, fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .22s' }}
                    onMouseOver={e => e.currentTarget.style.background='#252320'} onMouseOut={e => e.currentTarget.style.background=INK}>
                    Envoyer la demande <Arr/>
                  </button>
                  <p style={{ fontSize:11, color:MIST, textAlign:'center', marginTop:10, lineHeight:1.6 }}>En soumettant ce formulaire, vous acceptez notre politique RGPD. Aucun spam.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer go={go}/>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// NAV + MAIN
// ═══════════════════════════════════════════════════════
const PAGES = { home:PageHome, independant:PageIndependant, employeur:PageEmployeur, employeurs:PageEmployeurs, experts:PageExperts, formations:PageFormations, contact:PageContact };

const MEGA = {
  1:{ label:'Indépendants', items:[['🚀',"Se lancer comme indépendant","Statut, obligations, démarches ONSS",'independant'],['🧮','Cotisations sociales','Calcul et paiement des cotisations ONSS','independant'],['📋','Obligations déclaratives','Dimona, DmfA, TVA, IPP','independant'],['🛡️','Protection sociale','Maladie, invalidité, pension','independant']] },
  2:{ label:'Devenir employeur', items:[['👤','Premier employé','Immatriculation ONSS, numéro d\'entreprise','employeur'],['📄','Contrat de travail','CDI, CDD, temps partiel — modèles conformes','employeur'],['⚡','Dimona automatique','Déclaration IN/OUT en 8 secondes','employeur'],['💶','Premiers salaires','Calcul paie, fiches, SEPA pain.001','employeur']] },
  3:{ label:'Employeurs', items:[['🏢','Gestion de la paie','166 CP, barèmes, primes, ONSS','employeurs'],['📊','Déclarations trimestrielles','DmfA XML, Belcotax 281.10/20/30','employeurs'],['📁','Export comptable','WinBooks, BOB, Octopus, Exact Online','employeurs'],['🔐','Sécurité & RGPD','AES-256-GCM, audit trail, RLS','employeurs'],['👥','Portail employé','Fiches de paie, documents, congés','employeurs'],['✍️','Signature électronique','Yousign / DocuSign — valeur légale','employeurs']] },
  4:{ label:'Formations', items:[['📚','Droit social belge','ONSS, paie, Dimona — maîtrisez les bases','formations'],['🧮','Calcul de paie avancé','CP, barèmes, PP Annexe III, bonus emploi','formations'],['🏛','DmfA & Belcotax','Déclarations trimestrielles pas à pas','formations'],['🚀','Onboarding Aureus Pro','Prise en main complète de la plateforme','formations']] },
  5:{ label:'Experts-comptables', items:[['🏛','Portail multi-clients','Gérez tous vos dossiers en un endroit','experts'],['🔗','API REST + Webhooks','Intégration avec vos outils existants','experts'],['📤','Mandats ONSS & Belcotax','Génération automatique Mahis/CSAM','experts'],['🔄','Migration assistée','Importation depuis SD Worx, Partena…','experts']] },
};

export default function VitrinePage() {
  const [page, setPage] = useState('home');
  const [openMega, setOpenMega] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  const go = (p) => {
    if (p === 'app') { window.location.href = '/login'; return; }
    setPage(p);
    setOpenMega(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMega(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const PageComp = PAGES[page] || PageHome;

  return (
    <div className="vt-body">
      <style dangerouslySetInnerHTML={{ __html: css }}/>

      {/* TOPBAR */}
      <div style={{ background:INK, height:36, display:'flex', alignItems:'center', position:'fixed', top:0, left:0, right:0, zIndex:400 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 36px', display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>🇧🇪 Belgique &nbsp;·&nbsp; <strong style={{ color:'rgba(255,255,255,.8)' }}>BCE BE 1028.230.781</strong></span>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            <a onClick={() => go('contact')} style={{ fontSize:12, color:'rgba(255,255,255,.55)', cursor:'pointer' }}>Contact</a>
            <div style={{ width:1, height:14, background:'rgba(255,255,255,.15)' }}/>
            <a onClick={() => go('app')} style={{ fontSize:12, color:'rgba(255,255,255,.55)', cursor:'pointer' }}>Espace client</a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav ref={navRef} style={{ position:'fixed', top:36, left:0, right:0, zIndex:300, height:64, background:WHITE, borderBottom:`1px solid ${BORDER}`, boxShadow: scrolled ? '0 2px 16px rgba(14,13,10,.07)' : 'none', transition:'box-shadow .3s' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 36px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', flexShrink:0 }} onClick={() => go('home')}>
            <div style={{ width:32, height:32, borderRadius:7, background:INK, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L15.5 14H2.5Z" fill="#B8913A"/></svg>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:INK, letterSpacing:'.04em', lineHeight:1 }}>AUREUS</div>
              <div style={{ fontSize:8, color:MIST, letterSpacing:'.18em', textTransform:'uppercase' }}>Social Pro</div>
            </div>
          </div>

          {/* MEGA LINKS */}
          <div style={{ display:'flex', alignItems:'stretch', height:64 }}>
            {Object.entries(MEGA).map(([k, m]) => (
              <div key={k} style={{ position:'relative', display:'flex', alignItems:'center' }}>
                <a
                  onClick={() => setOpenMega(openMega == k ? null : k)}
                  style={{ padding:'0 14px', height:'100%', display:'flex', alignItems:'center', fontSize:14, fontWeight:500, color: openMega==k ? INK : STONE, cursor:'pointer', borderBottom: openMega==k ? `2px solid ${G}` : '2px solid transparent', transition:'all .18s', whiteSpace:'nowrap', userSelect:'none' }}>
                  {m.label} <span style={{ fontSize:10, marginLeft:4, display:'inline-block', transform: openMega==k ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</span>
                </a>
                {openMega == k && (
                  <div style={{ position:'absolute', top:64, left:'50%', transform:'translateX(-50%)', background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:'0 24px 72px rgba(14,13,10,.18)', minWidth:480, padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, zIndex:500 }}>
                    {m.items.map(([ico,t,d,pg]) => (
                      <div key={t} onClick={() => go(pg)} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'12px 14px', borderRadius:6, cursor:'pointer', transition:'background .18s' }}
                        onMouseOver={e => e.currentTarget.style.background=CREAM} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <div style={{ width:34, height:34, borderRadius:8, background:CREAM, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{ico}</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:600, color:INK, marginBottom:3 }}>{t}</div>
                          <div style={{ fontSize:12, color:MIST, lineHeight:1.5 }}>{d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <button onClick={() => go('app')} style={{ padding:'8px 16px', borderRadius:5, fontSize:13, fontWeight:500, color:STONE, border:`1.5px solid ${BORDER}`, background:'transparent', cursor:'pointer', fontFamily:"'Cabinet Grotesk',sans-serif", transition:'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor=INK; e.currentTarget.style.color=INK; }} onMouseOut={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=STONE; }}>
              Connexion
            </button>
            <button onClick={() => go('contact')} style={{ padding:'9px 18px', borderRadius:5, fontSize:13, fontWeight:600, color:WHITE, background:INK, border:'none', cursor:'pointer', fontFamily:"'Cabinet Grotesk',sans-serif", transition:'all .22s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}
              onMouseOver={e => e.currentTarget.style.background='#252320'} onMouseOut={e => e.currentTarget.style.background=INK}>
              Demander une démo <Arr/>
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop: 36 + 64 }}>
        <PageComp go={go}/>
      </div>
    </div>
  );
}
