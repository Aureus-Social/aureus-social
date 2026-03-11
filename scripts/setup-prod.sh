#!/bin/bash
# =========================================================
# Aureus Social Pro — Setup Production
# Actions à exécuter UNE SEULE FOIS après déploiement
# =========================================================
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${GREEN}=== Aureus Social Pro — Setup Production ===${NC}"

# 1. Vercel env vars
echo -e "\n${YELLOW}[1/4] Variables Vercel...${NC}"
if [ -n "$VERCEL_TOKEN" ]; then
  for kv in "RMMMG_CURRENT:2070.48" "RMMMG_YEAR:2026"; do
    KEY="${kv%%:*}"; VAL="${kv##*:}"
    RES=$(curl -s -X POST "https://api.vercel.com/v10/projects/aureus-social/env" \
      -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
      -d "{\"key\":\"${KEY}\",\"value\":\"${VAL}\",\"type\":\"plain\",\"target\":[\"production\",\"preview\"]}")
    echo "$RES" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  ✅ '+'${KEY}' if d.get('key') else '  ❌ '+'${KEY}'+': '+str(d))"
  done
else
  echo -e "${RED}  → https://vercel.com/aureus-social/aureus-social/settings/environment-variables${NC}"
  echo "  Ajouter: RMMMG_CURRENT=2070.48 et RMMMG_YEAR=2026"
fi

# 2. Migration SQL Supabase
echo -e "\n${YELLOW}[2/4] Migration Supabase...${NC}"
echo -e "${RED}  → https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/sql${NC}"
echo "  Copier/coller : supabase/migrations/*_onboarding_clients.sql"

# 3. Token rotation + UptimeRobot (manuels)
echo -e "\n${YELLOW}[3/4] Token rotation Supabase...${NC}"
echo "  → Settings > API > JWT Settings > Enable automatic refresh token rotation"

echo -e "\n${YELLOW}[4/4] UptimeRobot monitors...${NC}"
echo "  → https://uptimerobot.com/dashboard"
echo "  → Monitor 1 : https://app.aureussocial.be/api/health (5min)"
echo "  → Monitor 2 : https://aureussocial.be (5min)"

echo -e "\n${GREEN}=== Setup terminé ===${NC}"
