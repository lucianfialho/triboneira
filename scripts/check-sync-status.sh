#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║     RESUMO DE SINCRONIZAÇÃO - MULTISTREAM CRON        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "📅 $(date)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  CONFIGURAÇÃO DO CHAMPIONSHIP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat cron-service/.env | grep CHAMPIONSHIP_EVENT_ID
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STATUS DO PM2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list | grep hltv-cron
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 MATCHES NO BANCO DE DADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Championship Mode:"
curl -s "http://localhost:3000/api/matches?championshipMode=true" | jq -r '"Total: \(.count) matches"'
echo ""
echo "Primeiro match:"
curl -s "http://localhost:3000/api/matches?championshipMode=true" | jq -r '.data[0] | "\(.team1.name) vs \(.team2.name) - \(.date)"'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 ÚLTIMOS LOGS (últimas 10 linhas)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs hltv-cron --lines 10 --nostream | tail -10
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Cron Service (3100):"
curl -s http://localhost:3100/ | jq -r '"Status: \(.status) | Uptime: \(.uptime)s"'
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║                    FIM DO RESUMO                      ║"
echo "╚════════════════════════════════════════════════════════╝"
