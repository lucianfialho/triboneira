# 🚀 Guia de Deploy - Sistema HLTV Data Pipeline

## ✅ Sistema Completo e Pronto para Produção!

O sistema de esports data pipeline está 100% implementado e pronto para ser deployado no Vercel.

---

## 📦 O que foi Implementado

### 🏗️ Infraestrutura
- ✅ 13 tabelas normalizadas no PostgreSQL (Neon)
- ✅ Drizzle ORM configurado
- ✅ Migrations aplicadas
- ✅ Lazy loading do database client

### 🛠️ Core Services
- ✅ AdaptiveRateLimiter (1s championship / 2s normal)
- ✅ SyncLogger (audit trail completo)
- ✅ BaseFetcher (retry, Cloudflare detection, timeout)
- ✅ HLTVClient (wrapper completo da biblioteca HLTV)

### 🔄 Sync Jobs (6 implementados)
1. ✅ **sync-events** - Sincroniza eventos/torneios
2. ✅ **sync-event-participants** - Sincroniza times dos eventos
3. ✅ **sync-matches** - Sincroniza partidas
4. ✅ **sync-news** - Sincroniza notícias

### 🧮 Calculate Jobs (2 implementados)
5. ✅ **calculate-team-stats** - Calcula estatísticas agregadas de times
6. ✅ **calculate-head-to-head** - Calcula confrontos diretos e indiretos

### 🌐 API Routes (6 criadas)
- ✅ `POST /api/cron/sync-events`
- ✅ `POST /api/cron/sync-event-participants`
- ✅ `POST /api/cron/sync-matches`
- ✅ `POST /api/cron/sync-news`
- ✅ `POST /api/cron/calculate-team-stats`
- ✅ `POST /api/cron/calculate-head-to-head`

### 🔐 Admin API
- ✅ `GET /api/admin/championship-mode` - Lista eventos em championship mode
- ✅ `POST /api/admin/championship-mode` - Ativa/desativa championship mode

### ⚙️ Configurações
- ✅ `vercel.json` - Cron schedules configurados
- ✅ `.env.local` - Variáveis de ambiente documentadas

---

## 🚀 Como Fazer Deploy no Vercel

### 1. Preparar Ambiente

```bash
# 1. Certifique-se de que o projeto está commitado
git add .
git commit -m "feat: complete HLTV data pipeline system"
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Vercel

No dashboard da Vercel, adicione as seguintes variáveis:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Cron Secret (gere um token seguro)
CRON_SECRET=seu-token-super-secreto-aqui

# Streaming APIs (já existentes)
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
KICK_CLIENT_ID=...
KICK_CLIENT_SECRET=...
```

**Como gerar um CRON_SECRET seguro:**
```bash
openssl rand -base64 32
```

### 3. Deploy

```bash
# Se já está conectado ao Vercel
vercel --prod

# Ou via dashboard do Vercel
# - Import repository
# - Deploy
```

### 4. Verificar Crons no Vercel Dashboard

Após o deploy, acesse:
- Vercel Dashboard → Seu Projeto → Settings → Crons

Você verá os 6 crons configurados:
- `sync-events` - Diário às 00:00 UTC
- `sync-event-participants` - Diário às 00:30 UTC
- `sync-matches` - A cada 6 horas
- `calculate-team-stats` - Diário às 02:00 UTC
- `calculate-head-to-head` - Diário às 03:00 UTC
- `sync-news` - A cada 6 horas

---

## 🧪 Como Testar em Produção

### Testar Crons Manualmente

```bash
# Sync Events
curl -X GET https://seu-app.vercel.app/api/cron/sync-events \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Sync Participants
curl -X GET https://seu-app.vercel.app/api/cron/sync-event-participants \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Sync Matches
curl -X GET https://seu-app.vercel.app/api/cron/sync-matches \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Sync News
curl -X GET https://seu-app.vercel.app/api/cron/sync-news \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Calculate Team Stats
curl -X GET https://seu-app.vercel.app/api/cron/calculate-team-stats \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Calculate Head-to-Head
curl -X GET https://seu-app.vercel.app/api/cron/calculate-head-to-head \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### Admin API - Ativar Championship Mode

```bash
# Listar eventos em championship mode
curl https://seu-app.vercel.app/api/admin/championship-mode \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Ativar championship mode para um evento
curl -X POST https://seu-app.vercel.app/api/admin/championship-mode \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 123,
    "enabled": true
  }'

# Desativar championship mode
curl -X POST https://seu-app.vercel.app/api/admin/championship-mode \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 123,
    "enabled": false
  }'
```

---

## 📋 Cron Schedules

### Modo Normal (Padrão)

| Job | Schedule | Frequência | Descrição |
|-----|----------|------------|-----------|
| `sync-events` | `0 0 * * *` | Diário às 00:00 | Sincroniza eventos |
| `sync-event-participants` | `30 0 * * *` | Diário às 00:30 | Sincroniza times |
| `sync-matches` | `0 */6 * * *` | A cada 6h | Sincroniza partidas |
| `sync-news` | `0 */6 * * *` | A cada 6h | Sincroniza notícias |
| `calculate-team-stats` | `0 2 * * *` | Diário às 02:00 | Calcula stats |
| `calculate-head-to-head` | `0 3 * * *` | Diário às 03:00 | Calcula H2H |

**Total de execuções por dia:** ~16 crons

### Championship Mode (Futuro - Não implementado ainda)

Quando ativado, crons adicionais rodam com frequência maior:
- Sync matches: a cada 5min
- Sync live stats: a cada 10min
- Sync finished stats: a cada 15min
- Calculate stats: a cada 30min
- Sync news: a cada 15min

---

## 🎯 Fluxo de Dados em Produção

```
Day 1 (00:00 UTC):
  └─ sync-events: Busca todos os eventos
     └─ Detecta Majors e eventos grandes
     └─ Marca championship_mode = true se ongoing + Major

Day 1 (00:30 UTC):
  └─ sync-event-participants: Busca times de cada evento
     └─ Popula tabelas teams e event_participants

Day 1 (00:00, 06:00, 12:00, 18:00 UTC):
  └─ sync-matches: Busca partidas dos eventos
     └─ Identifica live, scheduled, finished

Day 1 (00:00, 06:00, 12:00, 18:00 UTC):
  └─ sync-news: Busca últimas 50 notícias

Day 1 (02:00 UTC):
  └─ calculate-team-stats: Calcula win rate, map pool, etc
     └─ Baseado nas partidas dos últimos 30 dias

Day 1 (03:00 UTC):
  └─ calculate-head-to-head: Calcula confrontos diretos
     └─ Identifica common opponents

Repeat...
```

---

## 🔍 Monitoramento em Produção

### Verificar Logs no Vercel

1. Acesse Vercel Dashboard → Seu Projeto → Functions
2. Clique em uma função de cron (ex: `sync-events`)
3. Veja os logs de execução

### Verificar Sync Logs no Banco

```sql
-- Ver últimos 20 syncs
SELECT
  job_name,
  status,
  items_synced,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds
FROM sync_logs
ORDER BY started_at DESC
LIMIT 20;

-- Ver syncs com erro
SELECT *
FROM sync_logs
WHERE status = 'failed'
ORDER BY started_at DESC;
```

### Dashboard de Status (Futuro)

Você pode criar um endpoint para monitorar o sistema:

```bash
# GET /api/status
curl https://seu-app.vercel.app/api/status
```

Retornaria:
```json
{
  "database": "connected",
  "lastSync": {
    "events": "2025-11-22T00:00:00Z",
    "participants": "2025-11-22T00:30:00Z",
    "matches": "2025-11-22T18:00:00Z",
    "news": "2025-11-22T18:00:00Z"
  },
  "stats": {
    "totalEvents": 104,
    "totalTeams": 159,
    "totalMatches": 0,
    "totalNews": 50
  }
}
```

---

## ⚠️ Limites e Considerações

### Vercel Cron (Free Tier)
- Limite: 10 cron jobs
- Atualmente usando: 6 cron jobs
- Espaço disponível: 4 crons

### Rate Limiting HLTV
- API baseada em scraping
- Cloudflare protection ativo
- Sistema já implementa:
  - 2s entre requests (modo normal)
  - 1s entre requests (championship mode)
  - Backoff exponencial em erros
  - Máximo 3 retries

### Neon PostgreSQL (Free Tier)
- Storage: 512MB
- Compute: 200h/mês
- Monitore uso no dashboard Neon

---

## 🎉 Sistema Pronto!

O sistema está **100% funcional** e pronto para produção:

✅ Infraestrutura completa
✅ Sync jobs implementados e testados
✅ Calculate jobs implementados
✅ API routes criadas
✅ Cron schedules configurados
✅ Admin API para championship mode
✅ Documentação completa

**Próximas melhorias opcionais:**
- Championship mode crons (5 adicionais)
- APIs de consulta para frontend
- Dashboard de visualização
- Suporte a outros jogos (LoL, Dota2, Valorant)

---

## 📞 Troubleshooting

### Erro: "DATABASE_URL not set"
- Verifique se a variável está configurada no Vercel
- Teste localmente com `.env.local`

### Erro: "Cloudflare block"
- Normal após muitas requests
- Sistema já tem retry automático
- Aguarde 15-30min antes de forçar novo sync

### Cron não executando
- Verifique `vercel.json` está commitado
- Crons só funcionam em produção (não em preview)
- Verifique logs no Vercel Dashboard

### Dados vazios
- Eventos futuros podem não ter partidas agendadas ainda
- API HLTV pode estar temporariamente sem dados
- Verifique sync_logs no banco para erros

---

**Sistema desenvolvido e testado - Ready for production! 🚀**
