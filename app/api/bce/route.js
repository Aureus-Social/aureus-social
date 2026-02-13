// API Route: /api/bce?vat=0123456789
// Source 1: VIES REST API (name + address validation)  
// Source 2: KBO Mobile Public Search (all details: NACE, forme, email, phone, status)

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const vatRaw = searchParams.get('vat') || '';
  
  const clean = vatRaw.replace(/[^0-9]/g, '');
  if (clean.length < 9 || clean.length > 10) {
    return Response.json({ error: 'Numéro de TVA invalide', found: false }, { status: 400 });
  }
  const nr = clean.padStart(10, '0');
  const dotted = nr.slice(0,4) + '.' + nr.slice(4,7) + '.' + nr.slice(7);
  const formatted = `BE ${dotted}`;

  const result = {
    found: false,
    name: '',
    forme: 'sprl',
    formeLabel: '',
    addr: '',
    nace: [],
    naceDetails: [],
    activity: '',
    email: '',
    phone: '',
    website: '',
    vat: formatted,
    bce: nr,
    status: '',
    source: '',
    message: '',
  };

  // ── Run VIES and KBO in parallel for speed ──
  const [viesResult, kboResult] = await Promise.allSettled([
    fetchVIES(nr),
    fetchKBOMobile(nr),
  ]);

  // ── Apply VIES data ──
  if (viesResult.status === 'fulfilled' && viesResult.value) {
    const vies = viesResult.value;
    if (vies.found) {
      result.found = true;
      result.source = 'VIES';
      if (vies.name) result.name = vies.name;
      if (vies.addr) result.addr = vies.addr;
      result.forme = detectForme(result.name);
    }
  }

  // ── Apply KBO data (overrides/completes VIES) ──
  if (kboResult.status === 'fulfilled' && kboResult.value) {
    const kbo = kboResult.value;
    if (kbo.found) {
      result.found = true;
      result.source = result.source ? result.source + ' + KBO' : 'KBO';
      if (kbo.name && !result.name) result.name = kbo.name;
      if (kbo.addr) result.addr = kbo.addr; // KBO address is more detailed
      if (kbo.formeLabel) { result.formeLabel = kbo.formeLabel; result.forme = detectForme(kbo.formeLabel); }
      if (kbo.nace.length > 0) { result.nace = kbo.nace; result.naceDetails = kbo.naceDetails || []; }
      if (kbo.email) result.email = kbo.email;
      if (kbo.phone) result.phone = kbo.phone;
      if (kbo.website) result.website = kbo.website;
      if (kbo.status) result.status = kbo.status;
      if (kbo.activity) result.activity = kbo.activity;
    }
  }

  // ── Final message ──
  if (result.found) {
    result.message = `Données récupérées via ${result.source}.`;
  } else {
    result.message = 'Entreprise non trouvée. Vérifiez le numéro ou encodez manuellement.';
  }

  return Response.json(result);
}

// ── VIES Lookup ──
async function fetchVIES(nr) {
  const resp = await fetch('https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode: 'BE', vatNumber: nr }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.valid) return { found: false };
  return {
    found: true,
    name: (data.name && data.name !== '---') ? data.name.trim() : '',
    addr: (data.address && data.address !== '---') ? data.address.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim() : '',
  };
}

// ── KBO Mobile Lookup ──
async function fetchKBOMobile(nr) {
  const result = { found: false, name: '', addr: '', formeLabel: '', nace: [], naceDetails: [], email: '', phone: '', website: '', status: '', activity: '' };
  
  // Fetch the KBO mobile page (much cleaner HTML than desktop)
  const url = `https://kbopub.economie.fgov.be/kbopub-m/enterprise/${nr}?s=ent&lang=fr`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html',
      'Accept-Language': 'fr-BE,fr;q=0.9',
    },
  });
  
  if (!resp.ok) return result;
  const html = await resp.text();
  
  // Check if entity exists
  if (!html.includes('Entit') && !html.includes('entiteit')) return result;
  result.found = true;

  // ── Status (appears as "ACTIF" or "ARRETE" in header) ──
  const statusMatch = html.match(/ACTIF|ACTIEF|ARRET|GESTOPT/i);
  if (statusMatch) result.status = statusMatch[0].trim();

  // ── Company name (appears as bold text after status, or in Dénominations section) ──
  // The name appears in the DI section or in the main header
  const nameMatch = html.match(/D[ée]nomination[^,]*,\s*depuis[\s\S]*?<\/[^>]+>\s*([^<]+)/i)
    || html.match(/>\s*([A-Z][A-Z0-9\s&'\-\.]{2,})\s*<\/(?:b|strong|td)/);
  // Better: look for the short name shown prominently
  const shortNameMatch = html.match(/<td[^>]*>\s*<b>\s*([^<]{2,})\s*<\/b>/i);
  
  // The denomination section has the actual legal name
  const denomSection = html.match(/D[ée]nominations[\s\S]*?<\/table/i);
  if (denomSection) {
    const denomName = denomSection[0].match(/>\s*\*?\*?\s*([A-Z][^<]{2,})\s*</);
    if (denomName) result.name = denomName[1].trim();
  }

  // ── Address ──
  const addrMatch = html.match(/Adresse du si[èe]ge[\s\S]*?<\/strong>\s*([\s\S]*?)(?:depuis|<\/)/i);
  if (addrMatch) {
    result.addr = addrMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ── Email ──
  const emailMatch = html.match(/mailto:([^"'>\s]+)/i)
    || html.match(/E-mail[\s\S]*?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i)
    || html.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    const email = emailMatch[1].trim().toLowerCase();
    // Filter out BCE system emails
    if (!email.includes('economie.fgov') && !email.includes('belgium.be')) {
      result.email = email;
    }
  }

  // ── Phone ──
  // Extract phone only if BCE actually has phone data (not "Pas de données")
  const phoneSection = html.match(/(?:T[ée]l[ée]phone|Telefoon)[\s\S]*?(?:Fax|E-mail|Adresse web|GSM)/i);
  if (phoneSection && !phoneSection[0].includes('Pas de donn') && !phoneSection[0].includes('Geen gegev')) {
    const phoneNum = phoneSection[0].match(/(\+32[\d\s\/\.\-]{8,}|0[1-9][\d\s\/\.\-]{7,})/);
    if (phoneNum) {
      const ph = phoneNum[1].replace(/[\s\.\-\/]/g,'');
      // Filter: real Belgian phone numbers are 9-10 digits starting with 0 or +32
      // Enterprise numbers are 10 digits but formatted differently
      // Check it's not a substring of the enterprise number
      const nrClean = nr.replace(/^0+/,'');
      if (ph.length >= 9 && !ph.includes(nrClean) && !nrClean.includes(ph.replace(/^0/,''))) {
        result.phone = phoneNum[1].trim();
      }
    }
  }

  // ── Website ──
  const webMatch = html.match(/(?:Adresse web|Website)[\s\S]*?(https?:\/\/[^\s<"]+)/i)
    || html.match(/(?:Adresse web|Website)[\s\S]*?(www\.[^\s<"]+)/i);
  if (webMatch) result.website = webMatch[1].trim();

  // ── Legal form ──
  const formeMatch = html.match(/Forme l[ée]gale[\s\S]*?:\s*([\s\S]*?)(?:depuis|Type d)/i);
  if (formeMatch) {
    // Clean HTML tags and &nbsp;
    let forme = formeMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (forme && forme.length > 2 && !forme.startsWith('depuis')) {
      result.formeLabel = forme;
    }
  }
  // Fallback: detect from page text
  if (!result.formeLabel) {
    const formeAlt = html.match(/(?:Soci[ée]t[ée] [àa] responsabilit[ée] limit[ée]e|Soci[ée]t[ée] anonyme|Association sans but lucratif|Besloten vennootschap|Naamloze vennootschap|Vereniging zonder winstoogmerk)/i);
    if (formeAlt) result.formeLabel = formeAlt[0].trim();
  }

  // ── NACE codes ── 
  // Pattern on mobile: code link followed by description
  const naceRegex = /(\d{2}\.\d{3})\]?\s*(?:<\/a>)?\s*([^<\n]+)/g;
  let m;
  const naces = [];
  const seenCodes = new Set();
  while ((m = naceRegex.exec(html)) !== null) {
    const code = m[1];
    const desc = m[2].trim();
    if (!seenCodes.has(code) && desc.length > 3 && !desc.startsWith('depuis')) {
      seenCodes.add(code);
      naces.push({ code, desc });
    }
  }
  
  // Also try pattern: just 5-digit NACE with surrounding text
  if (naces.length === 0) {
    const naceAlt = /(?:nace\.code=)(\d{5})[^>]*>[\s\S]*?<\/a>\s*([^<]+)/g;
    let m2;
    while ((m2 = naceAlt.exec(html)) !== null) {
      const code = m2[1].slice(0,2) + '.' + m2[1].slice(2);
      const desc = m2[2].trim();
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        naces.push({ code, desc });
      }
    }
  }

  if (naces.length > 0) {
    result.nace = naces.map(n => n.code);
    result.naceDetails = naces;
  }

  // ── Entity type as activity ──
  const typeMatch = html.match(/Type d.entit[ée]\s*:\s*([^<\n]+)/i);
  if (typeMatch) result.activity = typeMatch[1].trim();

  return result;
}

// ── Detect legal form ──
function detectForme(t) {
  const u = (t || '').toUpperCase();
  if (u.includes('SRL') || u.includes('SPRL') || u.includes('BVBA') || u.includes('BESLOTEN') || u.includes('RESPONSABILITE LIMITEE')) return 'sprl';
  if (u.match(/\bSA\b/) || u.match(/\bNV\b/) || u.includes('ANONYME') || u.includes('NAAMLOZE')) return 'sa';
  if (u.includes('ASBL') || u.includes('VZW')) return 'asbl';
  if (u.includes('SNC') || u.includes('VOF')) return 'snc';
  if (u.includes('SC ') || u.includes('CV ') || u.includes('COOP')) return 'sc';
  return 'sprl';
}
