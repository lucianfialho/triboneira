# Multistream Cron Service

Serviço separado para executar jobs de sincronização de dados do HLTV.

## Por que um serviço separado?

A biblioteca `hltv` usa dependências (`header-generator`, `adm-zip`) que não funcionam em ambientes serverless como Vercel. Este serviço roda em um ambiente Node.js completo no Railway.

## Estrutura

- **Express server**: Para health checks e triggers manuais
- **node-cron**: Para agendar jobs recorrentes
- **Código compartilhado**: Usa symlinks para `lib/db`, `lib/jobs`, `lib/services`

## Cron Schedule

| Job | Schedule | Descrição |
|-----|----------|-----------|
| sync-events | `0 0 * * *` | Diariamente à meia-noite |
| sync-event-participants | `30 0 * * *` | Diariamente às 00:30 |
| sync-matches | `0 */6 * * *` | A cada 6 horas |
| calculate-team-stats | `0 2 * * *` | Diariamente às 02:00 |
| calculate-head-to-head | `0 3 * * *` | Diariamente às 03:00 |
| sync-news | `0 */6 * * *` | A cada 6 horas |
| hourly-report | `0 * * * *` | A cada hora |
| fix-event-status | `0 */6 * * *` | A cada 6 horas |

## Desenvolvimento Local

```bash
cd cron-service
npm install
npm run dev
```

## Triggers Manuais

```bash
# Sync events
curl -X POST http://localhost:3000/trigger/sync-events

# Sync participants
curl -X POST http://localhost:3000/trigger/sync-participants

# Sync matches
curl -X POST http://localhost:3000/trigger/sync-matches

# E assim por diante...
```

## Deploy no Railway

1. Crie uma conta no [Railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Configure o **Root Directory** como `cron-service`
4. Adicione as variáveis de ambiente:
   - `DATABASE_URL`
   - `DISCORD_WEBHOOK_URL` (opcional)
5. Deploy!

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
PORT=3000
```

## Health Check

O serviço expõe um endpoint de health check em `/`:

```json
{
  "status": "ok",
  "service": "multistream-cron-service",
  "uptime": 123.45
}
```
