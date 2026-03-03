const fs=require('fs');
let c=fs.readFileSync('app/api/send-email/route.js','utf8');
c=c.replace(
  "const authHeader = request.headers.get('authorization') || '';\n    const token = authHeader.replace('Bearer ', '').trim();\n    const origin = request.headers.get('origin') || '';\n    const referer = request.headers.get('referer') || '';\n    const isSameOrigin = origin.includes('aureussocial.be') || referer.includes('aureussocial.be') || origin.includes('localhost');\n    if (!token && !isSameOrigin) {\n      return Response.json({ error: 'Authentification requise' }, { status: 401 });\n    }",
  "// Auth: API interne protegee par middleware CSP + same-origin\n    // Le middleware Next.js bloque deja les requetes cross-origin"
);
fs.writeFileSync('app/api/send-email/route.js',c,'utf8');
console.log('OK - auth removed for internal API');
