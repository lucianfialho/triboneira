# 📡 API Documentation - HLTV Data Pipeline

Documentação completa dos dados disponíveis no banco de dados PostgreSQL para integração com o frontend.

---

## 📊 Database Schema Overview

O banco possui **13 tabelas normalizadas**:

1. **games** - Jogos suportados (CS2, Valorant, etc.)
2. **events** - Torneios e campeonatos
3. **teams** - Times de esports
4. **players** - Jogadores profissionais
5. **team_rosters** - Composição atual dos times
6. **event_participants** - Times participando de eventos
7. **matches** - Partidas entre times
8. **match_maps** - Mapas jogados em cada partida
9. **player_match_stats** - Estatísticas individuais por partida
10. **team_stats** - Estatísticas agregadas de times
11. **head_to_head** - Confrontos diretos entre times
12. **news** - Notícias do HLTV
13. **sync_logs** - Logs de sincronização (auditoria)

---

## 🔍 Queries SQL Prontas para Usar

### 1. Listar Eventos Ativos (Ongoing)

```sql
SELECT
  e.id,
  e.external_id,
  e.name,
  e.date_start,
  e.date_end,
  e.prize_pool,
  e.location,
  e.status,
  e.championship_mode,
  COUNT(DISTINCT ep.team_id) as total_teams
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.status = 'ongoing'
GROUP BY e.id
ORDER BY e.date_start DESC;
```

**Campos retornados:**
- `id` - ID interno do banco
- `external_id` - ID do HLTV (usar para links: `https://www.hltv.org/events/{external_id}/...`)
- `name` - Nome do evento
- `date_start` - Data de início
- `date_end` - Data de término
- `prize_pool` - Premiação (string, ex: "$1,000,000")
- `location` - Localização (ex: "Rio de Janeiro, Brazil")
- `status` - Status: `ongoing`, `upcoming`, `finished`
- `championship_mode` - Boolean - se é um Major ou evento grande
- `total_teams` - Quantidade de times participantes

---

### 2. Próximos Eventos (Upcoming)

```sql
SELECT
  e.id,
  e.external_id,
  e.name,
  e.date_start,
  e.date_end,
  e.prize_pool,
  e.location,
  COUNT(DISTINCT ep.team_id) as total_teams
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.status = 'upcoming'
  AND e.date_start >= NOW()
  AND e.date_start <= NOW() + INTERVAL '30 days'
GROUP BY e.id
ORDER BY e.date_start ASC
LIMIT 20;
```

**Nota:** Filtra eventos que começam nos próximos 30 dias.

---

### 3. Top 30 Times por Ranking

```sql
SELECT
  id,
  external_id,
  name,
  rank,
  country,
  logo_url
FROM teams
WHERE rank IS NOT NULL
  AND rank <= 30
ORDER BY rank ASC;
```

**Campos retornados:**
- `external_id` - ID do HLTV (usar para links: `https://www.hltv.org/team/{external_id}/...`)
- `rank` - Posição no ranking mundial
- `country` - Código do país (ex: "BR", "US")
- `logo_url` - URL do logo do time

---

### 4. Últimas Notícias

```sql
SELECT
  id,
  external_id,
  title,
  description,
  link,
  published_at,
  country
FROM news
ORDER BY published_at DESC
LIMIT 50;
```

**Campos retornados:**
- `external_id` - ID da notícia no HLTV
- `title` - Título da notícia
- `description` - Descrição/preview
- `link` - URL completa da notícia
- `published_at` - Data de publicação
- `country` - Código do país relacionado (opcional)

---

### 5. Partidas de um Evento

```sql
SELECT
  m.id,
  m.external_id,
  m.date,
  m.format,
  m.status,
  m.score_team1,
  m.score_team2,
  t1.id as team1_id,
  t1.name as team1_name,
  t1.logo_url as team1_logo,
  t2.id as team2_id,
  t2.name as team2_name,
  t2.logo_url as team2_logo,
  winner.id as winner_id,
  winner.name as winner_name
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN teams winner ON m.winner_id = winner.id
WHERE m.event_id = :event_id
ORDER BY m.date ASC;
```

**Parâmetros:**
- `:event_id` - ID interno do evento

**Campos retornados:**
- `external_id` - ID da partida no HLTV
- `format` - Formato da partida (ex: "bo3", "bo5")
- `status` - Status: `scheduled`, `live`, `finished`, `cancelled`
- `score_team1` / `score_team2` - Placar final
- Dados dos times 1 e 2 (id, name, logo)
- Dados do vencedor (se houver)

---

### 6. Partidas Live

```sql
SELECT
  m.id,
  m.external_id,
  m.date,
  m.format,
  m.score_team1,
  m.score_team2,
  e.id as event_id,
  e.name as event_name,
  t1.id as team1_id,
  t1.name as team1_name,
  t1.logo_url as team1_logo,
  t2.id as team2_id,
  t2.name as team2_name,
  t2.logo_url as team2_logo
FROM matches m
JOIN events e ON m.event_id = e.id
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE m.status = 'live'
ORDER BY m.date DESC;
```

**Uso:** Ideal para exibir partidas ao vivo em tempo real.

---

### 7. Estatísticas de um Time

```sql
SELECT
  t.id,
  t.name,
  t.rank,
  ts.matches_played,
  ts.wins,
  ts.losses,
  ts.win_rate,
  ts.maps_played,
  ts.maps_won,
  ts.rounds_won,
  ts.rounds_lost,
  ts.avg_round_diff
FROM team_stats ts
JOIN teams t ON ts.team_id = t.id
WHERE t.id = :team_id
  AND ts.event_id IS NULL
ORDER BY ts.period_end DESC
LIMIT 1;
```

**Parâmetros:**
- `:team_id` - ID interno do time

**Nota:** `event_id IS NULL` retorna estatísticas gerais (não específicas de um evento).

**Campos calculados:**
- `win_rate` - Taxa de vitória (0-100)
- `avg_round_diff` - Diferença média de rounds

---

### 8. Head-to-Head Entre Dois Times

```sql
SELECT
  t1.id as team1_id,
  t1.name as team1_name,
  t1.logo_url as team1_logo,
  t2.id as team2_id,
  t2.name as team2_name,
  t2.logo_url as team2_logo,
  h.matches_played,
  h.team1_wins,
  h.team2_wins,
  h.last_match_date,
  h.metadata
FROM head_to_head h
JOIN teams t1 ON h.team1_id = t1.id
JOIN teams t2 ON h.team2_id = t2.id
WHERE (h.team1_id = :team1_id AND h.team2_id = :team2_id)
   OR (h.team1_id = :team2_id AND h.team2_id = :team1_id)
  AND h.event_id IS NULL
LIMIT 1;
```

**Parâmetros:**
- `:team1_id`, `:team2_id` - IDs internos dos times

**Campo metadata (JSONB):**
```json
{
  "commonOpponents": [123, 456, 789],
  "mapStats": {...}
}
```

---

### 9. Roster de um Time (Jogadores)

```sql
SELECT
  p.id,
  p.external_id,
  p.name,
  p.country,
  p.age,
  tr.role
FROM team_rosters tr
JOIN players p ON tr.player_id = p.id
WHERE tr.team_id = :team_id
  AND tr.active = true
ORDER BY
  CASE tr.role
    WHEN 'Captain' THEN 1
    WHEN 'Entry Fragger' THEN 2
    WHEN 'AWPer' THEN 3
    WHEN 'Support' THEN 4
    WHEN 'Coach' THEN 5
    ELSE 6
  END;
```

**Parâmetros:**
- `:team_id` - ID interno do time

**Campos retornados:**
- `external_id` - ID do jogador no HLTV
- `role` - Função no time (Captain, AWPer, Entry Fragger, etc.)

---

### 10. Times Participando de um Evento

```sql
SELECT
  t.id,
  t.external_id,
  t.name,
  t.rank,
  t.logo_url,
  t.country,
  ep.seed,
  ep.placement
FROM event_participants ep
JOIN teams t ON ep.team_id = t.id
WHERE ep.event_id = :event_id
ORDER BY COALESCE(ep.placement, 999), COALESCE(ep.seed, 999);
```

**Parâmetros:**
- `:event_id` - ID interno do evento

**Campos retornados:**
- `seed` - Seed/cabeça de chave (pode ser null)
- `placement` - Colocação final (1º, 2º, 3º, etc.) - null se ainda não terminou

---

### 11. Eventos em Championship Mode

```sql
SELECT
  id,
  external_id,
  name,
  status,
  date_start,
  date_end,
  prize_pool,
  location
FROM events
WHERE championship_mode = true
  AND status = 'ongoing'
ORDER BY date_start DESC;
```

**Uso:** Eventos grandes (Majors) que estão acontecendo agora e tem sync mais frequente.

---

### 12. Histórico de Syncs (Para Admin)

```sql
SELECT
  job_name,
  status,
  items_synced,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
  errors
FROM sync_logs
ORDER BY started_at DESC
LIMIT 50;
```

**Uso:** Monitoramento e debug do sistema de sincronização.

---

## 🎯 Exemplos de Casos de Uso Frontend

### Dashboard Principal

```sql
-- Widget: Eventos Ativos
SELECT COUNT(*) FROM events WHERE status = 'ongoing';

-- Widget: Partidas Live
SELECT COUNT(*) FROM matches WHERE status = 'live';

-- Widget: Últimas Notícias
SELECT * FROM news ORDER BY published_at DESC LIMIT 10;

-- Widget: Top 5 Times
SELECT * FROM teams WHERE rank <= 5 ORDER BY rank;
```

---

### Página de Evento

```sql
-- Informações do evento
SELECT * FROM events WHERE id = :event_id;

-- Times participantes
SELECT t.* FROM event_participants ep
JOIN teams t ON ep.team_id = t.id
WHERE ep.event_id = :event_id;

-- Partidas do evento
SELECT m.*, t1.name as team1_name, t2.name as team2_name
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE m.event_id = :event_id
ORDER BY m.date;
```

---

### Página de Time

```sql
-- Informações do time
SELECT * FROM teams WHERE id = :team_id;

-- Roster atual
SELECT p.*, tr.role FROM team_rosters tr
JOIN players p ON tr.player_id = p.id
WHERE tr.team_id = :team_id AND tr.active = true;

-- Estatísticas gerais
SELECT * FROM team_stats
WHERE team_id = :team_id AND event_id IS NULL
ORDER BY period_end DESC LIMIT 1;

-- Próximas partidas
SELECT m.*, e.name as event_name
FROM matches m
JOIN events e ON m.event_id = e.id
WHERE (m.team1_id = :team_id OR m.team2_id = :team_id)
  AND m.status = 'scheduled'
  AND m.date >= NOW()
ORDER BY m.date LIMIT 5;
```

---

### Comparador de Times (Head-to-Head)

```sql
-- Confronto direto
SELECT * FROM head_to_head
WHERE (team1_id = :team_a AND team2_id = :team_b)
   OR (team1_id = :team_b AND team2_id = :team_a)
   AND event_id IS NULL;

-- Últimas partidas entre os times
SELECT m.* FROM matches m
WHERE (
  (m.team1_id = :team_a AND m.team2_id = :team_b) OR
  (m.team1_id = :team_b AND m.team2_id = :team_a)
)
AND m.status = 'finished'
ORDER BY m.date DESC
LIMIT 10;
```

---

## 🔗 Links Úteis

### Construir URLs do HLTV:

```typescript
// Evento
const eventUrl = `https://www.hltv.org/events/${event.external_id}/${slug(event.name)}`;

// Time
const teamUrl = `https://www.hltv.org/team/${team.external_id}/${slug(team.name)}`;

// Partida
const matchUrl = `https://www.hltv.org/matches/${match.external_id}/${slug(match.name)}`;

// Jogador
const playerUrl = `https://www.hltv.org/player/${player.external_id}/${slug(player.name)}`;

// Notícia
const newsUrl = news.link; // já vem completo
```

**Função helper para slug:**
```typescript
function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

---

## 🕐 Frequência de Atualização dos Dados

| Tipo de Dado | Frequência | Cron |
|--------------|-----------|------|
| **Eventos** | Diária | 00:00 UTC |
| **Participantes de Eventos** | Diária | 00:30 UTC |
| **Partidas** | A cada 6h | 00:00, 06:00, 12:00, 18:00 UTC |
| **Notícias** | A cada 6h | 00:00, 06:00, 12:00, 18:00 UTC |
| **Estatísticas de Times** | Diária | 02:00 UTC |
| **Head-to-Head** | Diária | 03:00 UTC |
| **Fix de Status** | A cada 6h | 00:00, 06:00, 12:00, 18:00 UTC |

**Championship Mode:** Durante eventos Major, a frequência de sync de partidas aumenta para ~1-2 minutos.

---

## 📦 Exemplo de Integração com Drizzle ORM

Se o frontend usar Next.js com Drizzle:

```typescript
import { db } from '@/lib/db/client';
import { events, teams, matches } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Buscar eventos ongoing
export async function getOngoingEvents() {
  return await db
    .select()
    .from(events)
    .where(eq(events.status, 'ongoing'))
    .orderBy(desc(events.dateStart));
}

// Buscar top times
export async function getTopTeams(limit: number = 10) {
  return await db
    .select()
    .from(teams)
    .where(sql`rank IS NOT NULL`)
    .orderBy(teams.rank)
    .limit(limit);
}
```

---

## 🔐 Variáveis de Ambiente

O frontend precisa ter acesso ao banco:

```env
DATABASE_URL=postgresql://user:pass@host:5432/database?sslmode=require
```

---

## 📊 Webhook Discord (Admin)

O sistema envia relatórios a cada hora para o Discord com:
- Total de eventos, times, partidas no banco
- Eventos ativos e championship mode
- Resultado dos syncs da última hora
- Alertas de falhas

**Webhook URL está configurado em:** `.env.local`

---

## 🚀 Próximos Passos Sugeridos

1. **Criar API Routes** em `app/api/` para expor os dados via REST
2. **Implementar Cache** com Redis ou Next.js Cache
3. **WebSocket** para partidas live em tempo real
4. **Paginação** para listas grandes (eventos, notícias)
5. **Filtros** por país, data, tipo de evento

---

**Dúvidas? Consulte:** `HLTV_API_EXAMPLES.md` para mais exemplos SQL.
