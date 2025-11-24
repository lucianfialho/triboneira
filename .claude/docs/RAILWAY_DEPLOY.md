# Deploy do Cron Service no Railway

## Passo a Passo

### 1. Criar conta no Railway
- Acesse [railway.app](https://railway.app)
- Faça login com GitHub

### 2. Criar novo projeto
- Click em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha o repositório `triboneira` (ou o nome do seu repo)

### 3. Configurar o serviço
Após conectar o repositório:

1. **Root Directory**:
   - Click em "Settings"
   - Em "Root Directory", coloque: `cron-service`
   - Salve

2. **Build Command** (opcional, já está no package.json):
   - `npm run build`

3. **Start Command** (opcional, já está no package.json):
   - `npm start`

### 4. Adicionar variáveis de ambiente
No dashboard do Railway, vá em "Variables" e adicione:

```
DATABASE_URL=seu_database_url_do_neon
DISCORD_WEBHOOK_URL=sua_webhook_url_do_discord (opcional)
```

**Importante**: Use o mesmo `DATABASE_URL` que você usa no Vercel para compartilhar o banco de dados.

### 5. Deploy
- Railway vai automaticamente fazer o build e deploy
- Aguarde o deploy completar (você verá os logs em tempo real)

### 6. Verificar se está funcionando
Acesse a URL pública do Railway (algo como `https://seu-app.up.railway.app`) e você deverá ver:

```json
{
  "status": "ok",
  "service": "multistream-cron-service",
  "uptime": 123.45
}
```

### 7. Testar os triggers manuais
Você pode testar cada job manualmente fazendo POST requests:

```bash
curl -X POST https://seu-app.up.railway.app/trigger/sync-events
curl -X POST https://seu-app.up.railway.app/trigger/sync-participants
curl -X POST https://seu-app.up.railway.app/trigger/sync-matches
```

### 8. Monitorar logs
- No dashboard do Railway, click em "Deployments"
- Você verá os logs em tempo real
- Os crons vão aparecer nos logs com timestamps quando executarem

## Crons configurados

| Job | Schedule | Horário (UTC) |
|-----|----------|---------------|
| sync-events | `0 0 * * *` | Meia-noite |
| sync-event-participants | `30 0 * * *` | 00:30 |
| sync-matches | `0 */6 * * *` | 00:00, 06:00, 12:00, 18:00 |
| calculate-team-stats | `0 2 * * *` | 02:00 |
| calculate-head-to-head | `0 3 * * *` | 03:00 |
| sync-news | `0 */6 * * *` | 00:00, 06:00, 12:00, 18:00 |
| hourly-report | `0 * * * *` | A cada hora |
| fix-event-status | `0 */6 * * *` | 00:00, 06:00, 12:00, 18:00 |

## Troubleshooting

### Build falhou
- Verifique se o "Root Directory" está configurado como `cron-service`
- Veja os logs de build no Railway

### Crons não estão rodando
- Verifique os logs para ver se há erros
- Teste os triggers manuais para debug
- Verifique se as variáveis de ambiente estão corretas

### Banco de dados não conecta
- Verifique se `DATABASE_URL` está correta
- Use o mesmo valor que funciona no Vercel

## Arquitetura final

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Vercel         │         │  Railway         │
│  (Next.js)      │         │  (Cron Service)  │
│                 │         │                  │
│  - Frontend     │         │  - Sync jobs     │
│  - API routes   │         │  - node-cron     │
│  - Queries      │         │  - HLTV lib      │
│                 │         │                  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │      ┌──────────┐         │
         └──────│  Neon    │─────────┘
                │  PostgreSQL
                └──────────┘
```
