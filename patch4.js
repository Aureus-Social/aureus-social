const fs=require('fs');
let c=fs.readFileSync('public/sw.js','utf8');
c=c.replace("const CACHE_NAME = 'aureus-v20.6';","const CACHE_NAME = 'aureus-v21.0';");
c=c.replace("const STATIC_CACHE = 'aureus-static-v20.6';","const STATIC_CACHE = 'aureus-static-v21.0';");
c=c.replace("const DATA_CACHE = 'aureus-data-v20.6';","const DATA_CACHE = 'aureus-data-v21.0';");
c=c.replace("// Supabase ? Network only (real-time data)\n  if (url.hostname.includes('supabase')) return;","// External domains ? let browser handle directly (no SW interception)\n  if (url.hostname !== location.hostname) return;\n\n  // Supabase ? Network only (real-time data)\n  if (url.hostname.includes('supabase')) return;");
fs.writeFileSync('public/sw.js',c,'utf8');
console.log('OK - SW updated v21.0');
