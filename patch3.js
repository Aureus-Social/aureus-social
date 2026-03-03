const fs=require('fs');
let c=fs.readFileSync('middleware.js','utf8');
c=c.replace(
  "connect-src 'self' https://" + " wss:// https://api.anthropic.com https://api.resend.com",
  "connect-src 'self' https://" + " wss:// https://api.anthropic.com https://api.resend.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com"
);
fs.writeFileSync('middleware.js',c,'utf8');
console.log('OK - CSP updated');
