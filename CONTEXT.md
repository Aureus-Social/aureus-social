# CONTEXT.md — Aureus Social Pro
# À lire en début de chaque session Claude. Toujours à jour.
# Dernière mise à jour : Mars 2026

## Identité projet
- **Produit** : Aureus Social Pro — secrétariat social digital belge
- **URL** : https://app.aureussocial.be
- **Repo** : Aureus-Social/aureus-social (PROD)
- **Vercel** : aureus-social-thyl
- **Supabase** : qcunxnadjxggizdksvay (Frankfurt)

## Stack
- Next.js 15 App Router
- Supabase (auth + DB + storage)
- Vercel (déploiement auto sur push main)
- Backblaze B2 (backups nightly)

## Architecture clé
```
app/
├── (dashboard)/
│   ├── layout-client.js     ← routing + state global (~890 lignes)
│   └── layout.js            ← layout serveur
├── api/                     ← API routes Next.js
├── lib/
│   ├── menu-config.js       ← 205 items, 7 groupes — NE PAS TOUCHER sans ce fichier
│   ├── lois-belges.js       ← TOUTES les constantes légales belges — source unique
│   ├── payroll-engine.js    ← moteur paie v3
│   └── helpers.js           ← barrel export
├── modules/                 ← composants dashboard
└── pages/
    └── _registry.js         ← switch/case routing
```

## Règles absolues
1. `'use client'` toujours ligne 1 absolue avant tout import
2. Jamais hardcoder un taux — toujours `import { LB } from '@/lib/lois-belges'`
3. Arrondi systématique : `Math.round(calcul * 100) / 100`
4. Tout nouvel item menu = 3 fichiers : menu-config.js + _registry.js + modules/NomModule.js
5. Repo `aureus-social-v18` = dev local uniquement, jamais connecté à Vercel

## État actuel — ce qui est fait
- ✅ Moteur paie v3 (zéro hardcode depuis commit `0426f8c`)
- ✅ 57 primes belges, 43 procédures RH
- ✅ Veille légale auto (8 sources, cron 6h00 CET)
- ✅ Sécurité : AES-256-GCM, RLS 10 tables, 2FA TOTP
- ✅ Backups B2 nightly
- ✅ Multi-portail Admin/Client/Employé
- ✅ Exports WinBooks, BOB, Exact Online, Octopus
- ✅ Belcotax 281.10 XML, DmfA XML, SEPA pain.001
- ✅ Règlement de travail FR/NL

## Pending — priorité ordre décroissant
1. 🔴 Listing annuel TVA 2025 Intervat (EN RETARD — légal urgent)
2. 🔴 Token `aureus-deploy` expiré 15/03/2026 — régénérer
3. 🟡 Connecter `payroll_history` au flow paie
4. 🟡 pgcrypto NISS/IBAN chiffrement
5. 🟡 Email transactionnel fiches de paie (Resend)
6. 🟡 Wizard onboarding client 5 étapes
7. 🟢 Belcotax certification ONSS officielle
8. 🟢 41 Simulateurs Pro complets

## Tokens & Accès
```
GitHub PROD  : [voir GitHub Settings → Developer settings → Personal access tokens]
Vercel token : [voir Vercel Dashboard → Settings → Tokens]
Supabase ID  : qcunxnadjxggizdksvay
```

## Démarrage session (copier-coller)
```bash
git clone https://TOKEN@github.com/Aureus-Social/aureus-social.git /tmp/repo
cd /tmp/repo
git config user.email "info@aureus-ia.com"
git config user.name "Aureus IA"
npm install --legacy-peer-deps 2>&1 | tail -3
```

## Conventions commits
- `feat:` nouvelle fonctionnalité
- `fix:` correction bug
- `refactor:` restructuration
- `security:` sécurité
- `chore:` maintenance

## Comment mettre à jour ce fichier
Après chaque sprint, mettre à jour :
1. La section "État actuel" (cocher ✅ ce qui est fait)
2. La section "Pending" (retirer ce qui est fait, ajouter de nouvelles tâches)
3. La date en haut du fichier
