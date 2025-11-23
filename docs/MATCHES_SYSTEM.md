# 🎮 Sistema de Matches - HLTV Integration

Documentação completa do sistema de sincronização e exibição de matches do HLTV com suporte a TBD (To Be Decided).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Database Schema](#database-schema)
- [Sync Jobs](#sync-jobs)
- [API Endpoints](#api-endpoints)
- [Scripts de Monitoramento](#scripts-de-monitoramento)
- [Quick Start](#quick-start)

---

## 🎯 Visão Geral

Sistema completo para sincronizar e exibir matches de CS2 do HLTV, com:

- ✅ Suporte a **matches TBD** (times ainda não definidos)
- ✅ **Championship Mode** - cobertura dedicada a eventos específicos
- ✅ **Scraping com Playwright** - bypassa proteção Cloudflare
- ✅ **Sync automático** via cron jobs
- ✅ **API REST** para o frontend
- ✅ **Nullable team IDs** no banco de dados

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    HLTV.org (Source)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Playwright Scraper
                     │ (bypassa Cloudflare)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Cron Service (PM2 - Port 3100)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Championship Sync (Every 10 min)                   │   │
│  │  → Evento específico (CHAMPIONSHIP_EVENT_ID)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Normal Sync (Every 6 hours)                        │   │
│  │  → Ongoing/Upcoming events                          │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Insere/Atualiza
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Neon Database)                     │
│                                                              │
│  Tables: events, matches, teams                            │
│  - Nullable team_1_id, team_2_id (para TBD)               │
│  - Metadata JSON com team names                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Query
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Next.js API (Port 3000)                           │
│                                                              │
│  GET /api/matches                                           │
│  - ?eventId=14                                              │
│  - ?championshipMode=true                                   │
│  - ?status=scheduled                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ JSON Response
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend React                            │
│                                                              │
│  Exibe matches com TBD e times confirmados                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tabela: `matches`

```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  external_id VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'hltv',

  -- NULLABLE para suportar TBD
  team_1_id INTEGER REFERENCES teams(id),
  team_2_id INTEGER REFERENCES teams(id),

  date TIMESTAMP,
  format VARCHAR(10),  -- 'bo1', 'bo3', 'bo5'
  status VARCHAR(50) DEFAULT 'scheduled',

  winner_id INTEGER REFERENCES teams(id),
  score_team_1 INTEGER,
  score_team_2 INTEGER,
  maps JSONB,

  -- Metadata para guardar nomes quando TBD
  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(external_id, source)
);
```

### Metadata Structure (TBD Matches)

```json
{
  "team1Name": "TBD",
  "team2Name": "TBD",
  "event": "StarLadder Budapest Major 2025 Stage 1"
}
```

### Migration Applied

```bash
# Arquivo: migrations/0001_daily_junta.sql
ALTER TABLE "matches" ALTER COLUMN "team_1_id" DROP NOT NULL;
ALTER TABLE "matches" ALTER COLUMN "team_2_id" DROP NOT NULL;
```

---

## ⚙️ Sync Jobs

### 1. Championship Sync (Every 10 minutes)

**Arquivo**: `/cron-service/src/index.ts:181-208`

```typescript
// Sincroniza APENAS o evento configurado em CHAMPIONSHIP_EVENT_ID
cron.schedule('*/10 * * * *', async () => {
  const championshipEventId = process.env.CHAMPIONSHIP_EVENT_ID;
  await syncMatches(logger, false, championshipEventId);
});
```

**Configuração**: `cron-service/.env`
```bash
CHAMPIONSHIP_EVENT_ID=14  # StarLadder Budapest Major 2025 Stage 1
```

### 2. Normal Sync (Every 6 hours)

```typescript
// Sincroniza todos os eventos ongoing/upcoming
cron.schedule('0 */6 * * *', async () => {
  await syncMatches(logger, false);
});
```

### 3. Sync Logic

**Arquivo**: `/lib/jobs/sync/sync-matches.ts`

```typescript
export async function syncMatches(
  logger: SyncLogger,
  championshipMode: boolean = false,
  eventId?: number
) {
  // 3 modos:
  // 1. eventId específico
  // 2. championshipMode = true (todos eventos com flag)
  // 3. Normal (ongoing/upcoming)

  // Para cada match:
  // - Se team não é "TBD", tenta encontrar no banco
  // - Se não encontrar, team_id = null
  // - Salva nome do team no metadata

  await db.insert(matches).values({
    team1Id: team1 ? team1.id : null,  // Nullable!
    team2Id: team2 ? team2.id : null,
    metadata: {
      team1Name: scrapedMatch.team1.name,  // "TBD" ou nome real
      team2Name: scrapedMatch.team2.name,
    }
  });
}
```

---

## 🌐 API Endpoints

### GET `/api/matches`

Retorna matches com filtros opcionais.

**Base URL**: `http://localhost:3000/api/matches`

#### Query Parameters

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `eventId` | number | Filtrar por ID do evento | `?eventId=14` |
| `championshipMode` | boolean | Apenas eventos em championship | `?championshipMode=true` |
| `status` | string | Filtrar por status | `?status=scheduled` |

#### Exemplos

```bash
# Todos os matches
curl "http://localhost:3000/api/matches"

# Matches do Major Stage 1
curl "http://localhost:3000/api/matches?eventId=14"

# Matches de eventos em championship mode
curl "http://localhost:3000/api/matches?championshipMode=true"

# Matches agendados do Major
curl "http://localhost:3000/api/matches?eventId=14&status=scheduled"
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 103,
      "externalId": "2388057",
      "eventId": 14,
      "date": "2025-11-27T19:00:00.000Z",
      "format": "bo3",
      "status": "scheduled",
      "winnerId": null,
      "scoreTeam1": null,
      "scoreTeam2": null,
      "maps": null,
      "team1": {
        "id": null,
        "name": "TBD",
        "logo": null
      },
      "team2": {
        "id": null,
        "name": "TBD",
        "logo": null
      },
      "event": {
        "id": 14,
        "name": "StarLadder Budapest Major 2025 Stage 1",
        "championshipMode": true,
        ...
      },
      "createdAt": "2025-11-23T12:04:16.753Z",
      "updatedAt": "2025-11-23T12:08:54.971Z"
    }
  ],
  "count": 33
}
```

---

## 📊 Scripts de Monitoramento

### 1. Check Sync Status

```bash
./scripts/check-sync-status.sh
```

**Output**:
```
╔════════════════════════════════════════════════════════╗
║     RESUMO DE SINCRONIZAÇÃO - MULTISTREAM CRON        ║
╚════════════════════════════════════════════════════════╝

📅 Sun Nov 23 09:29:13 -03 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  CONFIGURAÇÃO DO CHAMPIONSHIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAMPIONSHIP_EVENT_ID=14

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STATUS DO PM2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
online | 8m uptime

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 MATCHES NO BANCO DE DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Championship Mode: Total: 33 matches
```

### 2. Force Sync

```bash
# Sync do evento padrão (ID 14)
./scripts/force-sync.sh

# Sync de outro evento
./scripts/force-sync.sh 15
```

**Output**:
```
╔════════════════════════════════════════════════════════╗
║        FORÇAR SINCRONIZAÇÃO - EVENTO 14               ║
╚════════════════════════════════════════════════════════╝

⏳ Iniciando sincronização...

📊 Resposta do servidor:
{
  "success": true,
  "matchesSynced": 33,
  "championshipMode": false,
  "eventId": 14
}

✅ Sincronização concluída: 33 matches sincronizados
```

### 3. Find Major Events

```bash
npx tsx scripts/find-major-events.ts
```

**Output**:
```
📊 Major Events:

ID: 14
External ID: 8504
Name: StarLadder Budapest Major 2025 Stage 1
Status: upcoming
Championship Mode: true
```

---

## 🚀 Quick Start

### 1. Setup Inicial

```bash
# Instalar dependências
npm install

# Aplicar migrations
npx drizzle-kit push

# Configurar evento de championship
echo "CHAMPIONSHIP_EVENT_ID=14" >> cron-service/.env

# Iniciar PM2
cd cron-service
pm2 start ecosystem.config.js
```

### 2. Primeira Sincronização

```bash
# Marcar evento como championship
npx tsx scripts/set-championship-mode.ts

# Forçar sync inicial
./scripts/force-sync.sh 14
```

### 3. Verificar

```bash
# Ver status
./scripts/check-sync-status.sh

# Ver logs
pm2 logs hltv-cron

# Testar API
curl "http://localhost:3000/api/matches?eventId=14" | jq
```

---

## 📁 Estrutura de Arquivos

```
multistream/
├── lib/
│   ├── db/
│   │   └── schema.ts           # Schema com nullable team IDs
│   ├── jobs/
│   │   └── sync/
│   │       └── sync-matches.ts # Lógica de sync
│   └── services/
│       └── hltv/
│           └── playwright-scraper.ts  # Scraper
│
├── cron-service/
│   ├── src/
│   │   └── index.ts            # Cron jobs
│   └── .env                    # CHAMPIONSHIP_EVENT_ID
│
├── app/
│   └── api/
│       └── matches/
│           └── route.ts        # API endpoint
│
├── scripts/
│   ├── check-sync-status.sh   # Status monitor
│   ├── force-sync.sh           # Force sync
│   ├── find-major-events.ts    # Find events
│   └── set-championship-mode.ts # Set event flag
│
├── migrations/
│   └── 0001_daily_junta.sql   # Nullable teams migration
│
└── docs/
    ├── MONITORING.md           # Guia de monitoramento
    └── MATCHES_SYSTEM.md       # Este arquivo
```

---

## 🔄 Fluxo de Dados (TBD Match)

```
1. HLTV.org
   ↓
   Match: "TBD vs TBD" (bo3)

2. Playwright Scraper
   ↓
   Extrai: { team1: {name: "TBD"}, team2: {name: "TBD"} }

3. Sync Job
   ↓
   Busca no banco: SELECT * FROM teams WHERE name = 'TBD'
   ↓
   Não encontra (TBD não é um time real)
   ↓
   INSERT matches (
     team_1_id: NULL,  ← Nullable!
     team_2_id: NULL,
     metadata: {
       team1Name: "TBD",
       team2Name: "TBD"
     }
   )

4. API Endpoint
   ↓
   SELECT matches
   LEFT JOIN teams
   ↓
   Se team_id = NULL:
     Retorna { name: metadata.team1Name }
   Senão:
     Retorna team completo

5. Frontend
   ↓
   Exibe: "TBD vs TBD - BO3 - 27/11/2025"
```

---

## 🛠️ Troubleshooting

### Matches não aparecem

```bash
# 1. Verificar sync
pm2 logs hltv-cron --lines 50

# 2. Testar endpoint
curl "http://localhost:3100/trigger/sync-matches?eventId=14"

# 3. Verificar banco
npx drizzle-kit studio --port 4984
```

### Cron não roda a cada 10min

```bash
# Verificar configuração
cat cron-service/.env | grep CHAMPIONSHIP_EVENT_ID

# Verificar PM2
pm2 restart hltv-cron

# Aguardar 10min e verificar logs
pm2 logs hltv-cron --lines 20
```

### Playwright não fecha

```bash
# Matar processos
pkill -f chrome
pkill -f playwright

# Restart
pm2 restart hltv-cron
```

---

## 📈 Métricas

- **Sync Time**: ~15-20 segundos para 33 matches
- **API Response**: ~100-200ms
- **Database Size**: ~10KB por 100 matches
- **Cron Frequency**: 10 minutos (championship) | 6 horas (normal)

---

## 🔗 Links Úteis

- **Cron Service**: http://localhost:3100
- **API Matches**: http://localhost:3000/api/matches
- **Drizzle Studio**: http://localhost:4984
- **PM2 Logs**: `pm2 logs hltv-cron`

---

**Última atualização**: 2025-11-23
**Versão**: 1.0.0
