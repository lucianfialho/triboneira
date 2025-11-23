#!/bin/bash

EVENT_ID="${1:-14}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║        FORÇAR SINCRONIZAÇÃO - EVENTO $EVENT_ID        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "⏳ Iniciando sincronização..."
RESPONSE=$(curl -s -X POST "http://localhost:3100/trigger/sync-matches?eventId=$EVENT_ID")
echo ""

echo "📊 Resposta do servidor:"
echo "$RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    SYNCED=$(echo "$RESPONSE" | jq -r '.matchesSynced')
    echo "✅ Sincronização concluída: $SYNCED matches sincronizados"
else
    echo "❌ Erro na sincronização"
    echo "$RESPONSE" | jq -r '.error'
    exit 1
fi

echo ""
echo "⏳ Aguardando 5 segundos para verificar..."
sleep 5
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 MATCHES NO BANCO DE DADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

API_RESPONSE=$(curl -s "http://localhost:3000/api/matches?eventId=$EVENT_ID")
TOTAL=$(echo "$API_RESPONSE" | jq -r '.count')
echo "Total de matches: $TOTAL"
echo ""

echo "Últimos 5 matches:"
echo "$API_RESPONSE" | jq -r '.data[0:5][] | "  • \(.team1.name) vs \(.team2.name) - \(.date // "TBD")"'
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║                 SINCRONIZAÇÃO COMPLETA                ║"
echo "╚════════════════════════════════════════════════════════╝"
