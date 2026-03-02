#!/usr/bin/env node
// Crée .env.local à partir de .env.example si .env.local n'existe pas (pour éviter l'erreur Supabase)
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const envLocal = path.join(root, '.env.local')
const envExample = path.join(root, '.env.example')

if (!fs.existsSync(envLocal) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envLocal)
  console.log('[setup] .env.local créé à partir de .env.example — éditez-le avec vos clés Supabase (Settings → API dans le dashboard Supabase).')
} else if (!fs.existsSync(envLocal)) {
  const content = `# Aureus Social Pro — variables d'environnement
# Obtenez les clés : Supabase Dashboard → votre projet → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_cle_anon
`
  fs.writeFileSync(envLocal, content, 'utf8')
  console.log('[setup] .env.local créé — éditez-le avec vos clés Supabase.')
}
