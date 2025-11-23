# 📊 Tutorial de Monitoramento - Multistream Cron Service

Guia completo para monitorar e gerenciar os jobs de sincronização do HLTV.

## 📋 Índice

1. [Verificar Status do PM2](#verificar-status-do-pm2)
2. [Monitorar Logs](#monitorar-logs)
3. [Testar Endpoints](#testar-endpoints)
4. [Verificar Banco de Dados](#verificar-banco-de-dados)
5. [Configurar Championship Mode](#configurar-championship-mode)
6. [Troubleshooting](#troubleshooting)

---

## 🔍 Verificar Status do PM2

### Ver todos os processos
```bash
pm2 list
```

### Ver status detalhado do cron service
```bash
pm2 show hltv-cron
```

### Restart do serviço
```bash
pm2 restart hltv-cron
```

### Stop/Start
```bash
pm2 stop hltv-cron
pm2 start hltv-cron
```

---

## 📝 Monitorar Logs

### Logs em tempo real
```bash
pm2 logs hltv-cron
```

### Últimas 50 linhas
```bash
pm2 logs hltv-cron --lines 50 --nostream
```

### Apenas erros
```bash
pm2 logs hltv-cron --err --lines 20 --nostream
```

### Buscar por palavra-chave
```bash
pm2 logs hltv-cron --lines 100 --nostream | grep "championship"
pm2 logs hltv-cron --lines 100 --nostream | grep "ERROR"
pm2 logs hltv-cron --lines 100 --nostream | grep "Success"
```

### Verificar sync específico
```bash
# Procurar por sync de matches
pm2 logs hltv-cron --lines 50 --nostream | grep -A 10 "sync-matches"

# Procurar por sync de championship
pm2 logs hltv-cron --lines 50 --nostream | grep -A 10 "championship"
```

---

## 🧪 Testar Endpoints

### Cron Service (porta 3100)

#### Health Check
```bash
curl http://localhost:3100/
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "multistream-cron-service",
  "uptime": 12345
}
```

#### Trigger Manual - Sync Events
```bash
curl -X POST http://localhost:3100/trigger/sync-events
```

#### Trigger Manual - Sync Matches (Evento Específico)
```bash
# Sync apenas do evento ID 14 (Major Stage 1)
curl -X POST "http://localhost:3100/trigger/sync-matches?eventId=14"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Matches synced successfully",
  "matchesSynced": 33,
  "championshipMode": false,
  "eventId": 14
}
```

#### Trigger Manual - Championship Mode
```bash
curl -X POST "http://localhost:3100/trigger/sync-matches?championship=true"
```

#### Trigger Manual - Sync Normal
```bash
curl -X POST http://localhost:3100/trigger/sync-matches
```

### API Frontend (porta 3000)

#### Listar todos os matches
```bash
curl "http://localhost:3000/api/matches"
```

#### Matches de um evento específico
```bash
curl "http://localhost:3000/api/matches?eventId=14"
```

#### Matches de championship mode
```bash
curl "http://localhost:3000/api/matches?championshipMode=true"
```

#### Formatar resposta com jq
```bash
# Ver apenas contagem
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '{success, count}'

# Ver primeiro match
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '.data[0]'

# Ver apenas teams dos matches
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '.data[] | {team1: .team1.name, team2: .team2.name, date}'
```

---

## 🗄️ Verificar Banco de Dados

### Usar Drizzle Studio
```bash
# Na pasta raiz do projeto
npx drizzle-kit studio --port 4984
```

Acesse: http://localhost:4984

### Queries SQL úteis

#### Ver eventos em championship mode
```sql
SELECT id, name, status, "championshipMode"
FROM events
WHERE "championshipMode" = true;
```

#### Contar matches por evento
```sql
SELECT
  e.name as event_name,
  COUNT(m.id) as total_matches,
  COUNT(CASE WHEN m."team1Id" IS NULL THEN 1 END) as tbd_matches
FROM matches m
JOIN events e ON m."eventId" = e.id
WHERE e.id = 14
GROUP BY e.name;
```

#### Ver matches com TBD
```sql
SELECT
  m.id,
  m."externalId",
  m.date,
  m.metadata
FROM matches m
WHERE m."eventId" = 14
  AND (m."team1Id" IS NULL OR m."team2Id" IS NULL)
ORDER BY m.date;
```

---

## ⚙️ Configurar Championship Mode

### Ver configuração atual
```bash
cat cron-service/.env | grep CHAMPIONSHIP
```

### Alterar evento monitorado
```bash
# Editar o arquivo .env
nano cron-service/.env

# Mudar a linha:
CHAMPIONSHIP_EVENT_ID=14

# Salvar e reiniciar
pm2 restart hltv-cron
```

### Verificar se mudou
```bash
# Aguardar alguns segundos e verificar logs
pm2 logs hltv-cron --lines 10 --nostream | grep "Event ID"
```

### Listar eventos disponíveis
```bash
cd ..
npx tsx scripts/find-major-events.ts
```

---

## 🔧 Troubleshooting

### Cron não está rodando

**Verificar status:**
```bash
pm2 list
```

**Se aparecer "stopped" ou "errored":**
```bash
pm2 restart hltv-cron
pm2 logs hltv-cron --err --lines 20
```

### Playwright/Browser não fecha

**Verificar processos do Chrome:**
```bash
ps aux | grep chrome
ps aux | grep playwright
```

**Matar processos pendentes:**
```bash
pkill -f chrome
pkill -f playwright
```

### Erro de conexão com banco de dados

**Verificar variável de ambiente:**
```bash
cat cron-service/.env | grep DATABASE_URL
```

**Testar conexão:**
```bash
cd ..
npx tsx scripts/check-championship-events.ts
```

### Matches não aparecem no frontend

**1. Verificar se foram sincronizados:**
```bash
curl -s "http://localhost:3100/trigger/sync-matches?eventId=14" | jq .
```

**2. Verificar API do frontend:**
```bash
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '.count'
```

**3. Verificar logs do banco:**
```bash
# Abrir Drizzle Studio
npx drizzle-kit studio --port 4984
```

### Cron não está rodando a cada 10 minutos

**Verificar se o schedule está correto:**
```bash
cat cron-service/src/index.ts | grep "*/10"
```

**Verificar se CHAMPIONSHIP_EVENT_ID está configurado:**
```bash
cat cron-service/.env | grep CHAMPIONSHIP_EVENT_ID
```

**Ver próxima execução (indiretamente via logs):**
```bash
pm2 logs hltv-cron --lines 5 --nostream
# Esperar 10 minutos e verificar novamente
```

---

## 📊 Scripts de Monitoramento Úteis

### Script para ver resumo de sincronização
```bash
#!/bin/bash
echo "=== RESUMO DE SINCRONIZAÇÃO ==="
echo ""
echo "Evento configurado:"
cat cron-service/.env | grep CHAMPIONSHIP_EVENT_ID
echo ""
echo "Matches no banco:"
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '{total: .count, primeiro_match: .data[0].team1.name}'
echo ""
echo "Últimos logs:"
pm2 logs hltv-cron --lines 5 --nostream
```

Salve como `scripts/check-sync-status.sh` e execute:
```bash
chmod +x scripts/check-sync-status.sh
./scripts/check-sync-status.sh
```

### Script para forçar sincronização completa
```bash
#!/bin/bash
echo "Forçando sincronização..."
curl -X POST "http://localhost:3100/trigger/sync-matches?eventId=14"
echo ""
echo "Aguarde 20 segundos..."
sleep 20
echo ""
echo "Resultado:"
curl -s "http://localhost:3000/api/matches?eventId=14" | jq '{total: .count}'
```

---

## 📈 Dashboard de Monitoramento

### PM2 Dashboard (opcional)
```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-logrotate

# Ver dashboard no terminal
pm2 monit
```

### Ver uso de recursos
```bash
pm2 describe hltv-cron | grep -A 10 "Metrics"
```

---

## 🚨 Alertas e Notificações

### Verificar webhook do Discord
```bash
cat cron-service/.env | grep DISCORD_WEBHOOK_URL
```

### Testar notificação (se implementado)
```bash
curl -X POST "http://localhost:3100/trigger/hourly-report"
```

---

## 📅 Schedule de Cron Jobs

| Job | Frequência | Descrição |
|-----|-----------|-----------|
| `sync-events` | Daily 00:00 UTC | Sincroniza eventos do HLTV |
| `sync-event-participants` | Daily 00:30 UTC | Sincroniza participantes |
| `sync-matches` | Every 6 hours | Sincroniza matches gerais |
| `sync-championship-matches` | **Every 10 minutes** | Sincroniza evento específico (CHAMPIONSHIP_EVENT_ID) |
| `sync-news` | Every 6 hours | Sincroniza notícias |
| `calculate-team-stats` | Daily 02:00 UTC | Calcula estatísticas |
| `calculate-head-to-head` | Daily 03:00 UTC | Calcula confrontos diretos |
| `fix-event-status` | Every 6 hours | Corrige status de eventos |
| `hourly-report` | Every hour | Gera relatório |

---

## 🎯 Checklist de Monitoramento Diário

- [ ] Verificar status do PM2: `pm2 list`
- [ ] Ver últimos logs: `pm2 logs hltv-cron --lines 20 --nostream`
- [ ] Testar endpoint: `curl http://localhost:3100/`
- [ ] Verificar matches: `curl "http://localhost:3000/api/matches?championshipMode=true"`
- [ ] Conferir se há erros: `pm2 logs hltv-cron --err --lines 10 --nostream`
- [ ] Validar próxima execução do championship (verificar logs em 10min)

---

## 📞 Contatos e Links Úteis

- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/monitoring/
- **Drizzle Studio**: http://localhost:4984
- **Cron Service Health**: http://localhost:3100
- **API Matches**: http://localhost:3000/api/matches

---

**Última atualização**: 2025-11-23
**Versão**: 1.0
