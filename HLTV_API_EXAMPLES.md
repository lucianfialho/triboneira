# 📡 HLTV Data API - Exemplos de Consulta

Exemplos de como consultar os dados do sistema HLTV diretamente no banco ou criar APIs de consulta.

---

## 🔍 Queries SQL Úteis

### 1. Eventos Ativos (Ongoing)

```sql
SELECT
  e.id,
  e.name,
  e.prize_pool,
  e.location,
  e.date_start,
  e.date_end,
  e.championship_mode,
  COUNT(DISTINCT ep.team_id) as total_teams
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.status = 'ongoing'
GROUP BY e.id
ORDER BY e.date_start DESC;
```

### 2. Próximos Eventos (Com Times)

```sql
SELECT
  e.id,
  e.name,
  e.prize_pool,
  e.date_start,
  json_agg(json_build_object(
    'id', t.id,
    'name', t.name,
    'rank', t.rank,
    'country', t.country
  )) as teams
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN teams t ON ep.team_id = t.id
WHERE e.status = 'upcoming'
  AND e.date_start >= NOW()
  AND e.date_start <= NOW() + INTERVAL '7 days'
GROUP BY e.id
ORDER BY e.date_start ASC
LIMIT 10;
```

### 3. Top 10 Times por Ranking

```sql
SELECT
  id,
  name,
  rank,
  country,
  logo_url
FROM teams
WHERE rank IS NOT NULL
  AND active = true
ORDER BY rank ASC
LIMIT 10;
```

### 4. Últimas Notícias

```sql
SELECT
  id,
  title,
  description,
  link,
  published_at,
  country
FROM news
ORDER BY published_at DESC
LIMIT 20;
```

### 5. Partidas de um Evento

```sql
SELECT
  m.id,
  m.date,
  m.format,
  m.status,
  t1.name as team1_name,
  t1.logo_url as team1_logo,
  t2.name as team2_name,
  t2.logo_url as team2_logo,
  m.score_team1,
  m.score_team2,
  winner.name as winner_name
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN teams winner ON m.winner_id = winner.id
WHERE m.event_id = :event_id
ORDER BY m.date ASC;
```

### 6. Estatísticas de um Time (Últimos 30 dias)

```sql
SELECT
  t.name as team_name,
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

### 7. Head-to-Head Entre Dois Times

```sql
SELECT
  t1.name as team1_name,
  t2.name as team2_name,
  h.matches_played,
  h.team1_wins,
  h.team2_wins,
  h.last_match_date,
  h.metadata->>'commonOpponents' as common_opponents
FROM head_to_head h
JOIN teams t1 ON h.team1_id = t1.id
JOIN teams t2 ON h.team2_id = t2.id
WHERE (h.team1_id = :team1_id AND h.team2_id = :team2_id)
   OR (h.team1_id = :team2_id AND h.team2_id = :team1_id)
  AND h.event_id IS NULL
LIMIT 1;
```

### 8. Partidas Live

```sql
SELECT
  m.id,
  e.name as event_name,
  t1.name as team1,
  t2.name as team2,
  m.score_team1,
  m.score_team2,
  m.format
FROM matches m
JOIN events e ON m.event_id = e.id
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE m.status = 'live'
ORDER BY m.date DESC;
```

### 9. Histórico de Syncs

```sql
SELECT
  job_name,
  status,
  items_synced,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds
FROM sync_logs
WHERE status = 'success'
ORDER BY started_at DESC
LIMIT 20;
```

### 10. Eventos em Championship Mode

```sql
SELECT
  id,
  name,
  status,
  date_start,
  date_end,
  prize_pool
FROM events
WHERE championship_mode = true
ORDER BY date_start DESC;
```

---

## 🌐 Exemplos de API Routes (Para Criar)

### GET /api/events

```typescript
// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, eventParticipants, teams } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // ongoing, upcoming, finished
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = db.select().from(events);

  if (status) {
    query = query.where(eq(events.status, status));
  }

  const results = await query
    .orderBy(desc(events.dateStart))
    .limit(limit);

  return NextResponse.json({
    events: results,
    count: results.length,
  });
}
```

### GET /api/teams/:id

```typescript
// app/api/teams/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { teams, teamStats, teamRosters, players } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const teamId = parseInt(params.id);

  // Get team info
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId));

  if (!team) {
    return NextResponse.json(
      { error: 'Team not found' },
      { status: 404 }
    );
  }

  // Get roster
  const roster = await db
    .select({
      player: players,
      role: teamRosters.role,
    })
    .from(teamRosters)
    .innerJoin(players, eq(teamRosters.playerId, players.id))
    .where(eq(teamRosters.teamId, teamId));

  // Get stats
  const [stats] = await db
    .select()
    .from(teamStats)
    .where(eq(teamStats.teamId, teamId))
    .orderBy(desc(teamStats.periodEnd))
    .limit(1);

  return NextResponse.json({
    team,
    roster,
    stats,
  });
}
```

### GET /api/matches

```typescript
// app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches, teams, events } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // live, scheduled, finished
  const eventId = searchParams.get('eventId');
  const teamId = searchParams.get('teamId');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = db
    .select({
      match: matches,
      event: events,
      team1: teams,
      team2: teams,
    })
    .from(matches)
    .leftJoin(events, eq(matches.eventId, events.id))
    .leftJoin(teams, eq(matches.team1Id, teams.id))
    .leftJoin(teams, eq(matches.team2Id, teams.id));

  if (status) {
    query = query.where(eq(matches.status, status));
  }

  if (eventId) {
    query = query.where(eq(matches.eventId, parseInt(eventId)));
  }

  const results = await query
    .orderBy(desc(matches.date))
    .limit(limit);

  return NextResponse.json({
    matches: results,
    count: results.length,
  });
}
```

### GET /api/stats/head-to-head/:team1/:team2

```typescript
// app/api/stats/head-to-head/[team1]/[team2]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { headToHead, teams } from '@/lib/db/schema';
import { eq, or, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { team1: string; team2: string } }
) {
  const team1Id = parseInt(params.team1);
  const team2Id = parseInt(params.team2);

  // Get H2H data
  const [h2h] = await db
    .select()
    .from(headToHead)
    .where(
      and(
        or(
          and(
            eq(headToHead.team1Id, team1Id),
            eq(headToHead.team2Id, team2Id)
          ),
          and(
            eq(headToHead.team1Id, team2Id),
            eq(headToHead.team2Id, team1Id)
          )
        )
      )
    );

  if (!h2h) {
    return NextResponse.json({
      message: 'No head-to-head data found',
      team1Id,
      team2Id,
    });
  }

  // Get team names
  const [team1, team2] = await Promise.all([
    db.select().from(teams).where(eq(teams.id, team1Id)).then(r => r[0]),
    db.select().from(teams).where(eq(teams.id, team2Id)).then(r => r[0]),
  ]);

  return NextResponse.json({
    team1: { id: team1.id, name: team1.name },
    team2: { id: team2.id, name: team2.name },
    stats: h2h,
  });
}
```

### GET /api/news

```typescript
// app/api/news/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { news } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const results = await db
    .select()
    .from(news)
    .orderBy(desc(news.publishedAt))
    .limit(limit);

  return NextResponse.json({
    news: results,
    count: results.length,
  });
}
```

---

## 🎨 Exemplo de Frontend (React)

### Hook para buscar eventos

```typescript
// hooks/useEvents.ts
import { useState, useEffect } from 'react';

interface Event {
  id: number;
  name: string;
  dateStart: string;
  dateEnd: string;
  prizePool: string;
  status: string;
}

export function useEvents(status?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events${status ? `?status=${status}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);
        setLoading(false);
      });
  }, [status]);

  return { events, loading };
}
```

### Componente de lista de eventos

```tsx
// components/EventList.tsx
import { useEvents } from '@/hooks/useEvents';

export function EventList() {
  const { events, loading } = useEvents('ongoing');

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Eventos em Andamento</h2>
      {events.map(event => (
        <div key={event.id} className="border rounded p-4">
          <h3 className="font-bold">{event.name}</h3>
          <p className="text-sm text-gray-600">
            {event.prizePool} • {new Date(event.dateStart).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Dashboard Exemplo

Crie um dashboard que mostre:

1. **Eventos Ativos**
   - Nome, prize pool, times participantes
   - Link para detalhes

2. **Partidas Live**
   - Times, placar, evento
   - Atualização em tempo real (polling ou websocket)

3. **Próximas Partidas**
   - Calendário dos próximos jogos
   - Filtro por time favorito

4. **Top Times**
   - Ranking mundial
   - Win rate recente
   - Próximos jogos

5. **Últimas Notícias**
   - Feed de notícias do HLTV
   - Filtro por time/país

6. **Head-to-Head**
   - Comparador de times
   - Histórico de confrontos
   - Confrontos indiretos

---

**APIs prontas para consumo! Basta criar os endpoints conforme necessário. 🚀**
