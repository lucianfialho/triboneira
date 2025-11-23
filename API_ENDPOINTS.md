# API Endpoints - Documentação Completa

## Resumo dos Endpoints Disponíveis

```
GET /api/events                                      - Lista todos os eventos
GET /api/events/:externalId                          - Detalhes de um evento
GET /api/events/:externalId/matches                  - Partidas do evento
GET /api/events/:externalId/teams                    - Times do evento
GET /api/events/:externalId/news                     - Notícias do evento
GET /api/events/:externalId/bracket                  - Bracket/Playoffs do evento
GET /api/events/:externalId/standings                - Tabela de classificação
GET /api/events/:externalId/swiss                    - Swiss System (Majors)
GET /api/events/:externalId/stages                   - Stages do evento (Majors)
```

---

## 1. GET /api/events/:externalId/standings

**Descrição:** Retorna a tabela de classificação do evento com estatísticas calculadas automaticamente.

### Request

```bash
GET /api/events/8855/standings
```

### Response

```typescript
interface StandingsResponse {
  event: {
    id: number;
    name: string;
    status: string;  // "upcoming", "ongoing", "finished"
  };
  standings: TeamStanding[];
  totalTeams: number;
  completedMatches: number;
  ongoingMatches: number;
}

interface TeamStanding {
  position: number;                // Posição na tabela (1, 2, 3...)
  team: {
    id: number;
    name: string;
    logoUrl: string | null;
    country: string | null;
    seed: number | null;           // Seed inicial do time
  };
  stats: {
    played: number;                // Partidas jogadas
    wins: number;                  // Vitórias
    losses: number;                // Derrotas
    mapsWon: number;               // Mapas ganhos
    mapsLost: number;              // Mapas perdidos
    mapDiff: number;               // Diferença de mapas (+/-)
    points: number;                // Pontos (3 por vitória)
    winRate: number;               // Taxa de vitória (%)
  };
  placement: string | null;        // Colocação final ("1st", "2nd", "3-4th")
  recentForm: ('W' | 'L')[];      // Últimos 5 resultados (W=Win, L=Loss)
}
```

### Exemplo de Resposta

```json
{
  "event": {
    "id": 13,
    "name": "CCT Season 3 Oceania Series 3",
    "status": "ongoing"
  },
  "standings": [
    {
      "position": 1,
      "team": {
        "id": 158,
        "name": "Ground Zero",
        "logoUrl": "https://img-cdn.hltv.org/teamlogo/...",
        "country": "au",
        "seed": 1
      },
      "stats": {
        "played": 3,
        "wins": 2,
        "losses": 1,
        "mapsWon": 5,
        "mapsLost": 3,
        "mapDiff": 2,
        "points": 6,
        "winRate": 66.7
      },
      "placement": null,
      "recentForm": ["W", "L", "W"]
    }
  ],
  "totalTeams": 12,
  "completedMatches": 18,
  "ongoingMatches": 2
}
```

### Critérios de Ordenação

A tabela é ordenada por:
1. **Pontos** (3 por vitória)
2. **Diferença de mapas** (mapsWon - mapsLost)
3. **Mapas ganhos** (desempate final)

### Uso no Frontend

```tsx
function StandingsTable({ eventId }: { eventId: string }) {
  const [standings, setStandings] = useState<StandingsResponse | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/standings`)
      .then(res => res.json())
      .then(data => setStandings(data));
  }, [eventId]);

  if (!standings) return <Loading />;

  return (
    <div>
      <h2>{standings.event.name} - Classificação</h2>
      <p>
        {standings.completedMatches} partidas completadas •
        {standings.ongoingMatches} ao vivo
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>P</th>
            <th>J</th>
            <th>V</th>
            <th>D</th>
            <th>MD</th>
            <th>Forma</th>
          </tr>
        </thead>
        <tbody>
          {standings.standings.map(team => (
            <tr key={team.team.id}>
              <td>{team.position}</td>
              <td>
                <img src={team.team.logoUrl} width="20" />
                {team.team.name}
              </td>
              <td><strong>{team.stats.points}</strong></td>
              <td>{team.stats.played}</td>
              <td>{team.stats.wins}</td>
              <td>{team.stats.losses}</td>
              <td className={team.stats.mapDiff > 0 ? 'positive' : 'negative'}>
                {team.stats.mapDiff > 0 ? '+' : ''}{team.stats.mapDiff}
              </td>
              <td>
                {team.recentForm.map((result, i) => (
                  <span key={i} className={result === 'W' ? 'win' : 'loss'}>
                    {result}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Componentes de UI

#### Badge de Forma Recente

```tsx
function RecentFormBadge({ form }: { form: ('W' | 'L')[] }) {
  return (
    <div className="recent-form">
      {form.map((result, index) => (
        <span
          key={index}
          className={`form-badge ${result === 'W' ? 'win' : 'loss'}`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

// CSS
.form-badge.win {
  background: #10b981;
  color: white;
}

.form-badge.loss {
  background: #ef4444;
  color: white;
}
```

#### Indicador de Posição

```tsx
function PositionIndicator({ position }: { position: number }) {
  const getPositionClass = (pos: number) => {
    if (pos === 1) return 'gold';
    if (pos === 2) return 'silver';
    if (pos === 3) return 'bronze';
    if (pos <= 8) return 'qualified';  // Exemplo: top 8 se classifica
    return 'eliminated';
  };

  return (
    <div className={`position ${getPositionClass(position)}`}>
      {position}
    </div>
  );
}
```

#### Estatísticas Detalhadas

```tsx
function TeamStats({ stats }: { stats: TeamStanding['stats'] }) {
  return (
    <div className="team-stats">
      <div className="stat">
        <label>Win Rate</label>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${stats.winRate}%` }}
          />
        </div>
        <span>{stats.winRate}%</span>
      </div>

      <div className="stat">
        <label>Map Difference</label>
        <span className={stats.mapDiff > 0 ? 'positive' : 'negative'}>
          {stats.mapDiff > 0 ? '+' : ''}{stats.mapDiff}
        </span>
        <small>{stats.mapsWon}W - {stats.mapsLost}L</small>
      </div>

      <div className="stat">
        <label>Points</label>
        <span className="points">{stats.points}</span>
        <small>{stats.wins} wins</small>
      </div>
    </div>
  );
}
```

---

## 2. GET /api/events/:externalId/bracket

**Descrição:** Retorna o bracket/playoffs organizado automaticamente.

[Documentação completa em BRACKET_API_FRONTEND.md]

### Quick Summary

```typescript
interface BracketResponse {
  currentStage: 'opening' | 'elimination' | 'playoffs';
  stageInfo: {
    format: string;
    description: string;
    totalRounds: number;
  };
  bracket: BracketRound[];
}
```

---

## 3. GET /api/events/:externalId/matches

**Descrição:** Lista todas as partidas do evento, organizadas por status.

### Request

```bash
GET /api/events/8855/matches
GET /api/events/8855/matches?status=live    # Filtrar por status
```

### Response

```json
{
  "live": [
    {
      "id": 123,
      "team1": { "name": "FaZe", "logoUrl": "..." },
      "team2": { "name": "NAVI", "logoUrl": "..." },
      "score": { "team1": 1, "team2": 0 },
      "date": "2025-11-23T18:00:00.000Z",
      "format": "bo3",
      "status": "live"
    }
  ],
  "scheduled": [...],
  "finished": [...]
}
```

---

## 4. GET /api/events/:externalId/teams

**Descrição:** Lista todos os times participantes do evento.

### Response

```json
{
  "teams": [
    {
      "id": 158,
      "name": "Ground Zero",
      "rank": 25,
      "logoUrl": "https://...",
      "country": "au",
      "seed": 1,
      "placement": null
    }
  ]
}
```

---

## 5. GET /api/events/:externalId

**Descrição:** Detalhes completos de um evento.

### Response

```json
{
  "id": 13,
  "externalId": "8855",
  "name": "CCT Season 3 Oceania Series 3",
  "dateStart": "2025-11-20T00:00:00.000Z",
  "dateEnd": "2025-11-25T00:00:00.000Z",
  "prizePool": "$10,000",
  "location": "Online",
  "status": "ongoing",
  "totalTeams": 12
}
```

---

## Casos de Uso Combinados

### Dashboard Completo do Evento

```tsx
function EventDashboard({ eventId }: { eventId: string }) {
  const event = useFetch(`/api/events/${eventId}`);
  const standings = useFetch(`/api/events/${eventId}/standings`);
  const matches = useFetch(`/api/events/${eventId}/matches`);
  const bracket = useFetch(`/api/events/${eventId}/bracket`);

  return (
    <div className="event-dashboard">
      {/* Header */}
      <EventHeader event={event} />

      {/* Tabs */}
      <Tabs>
        <Tab label="Visão Geral">
          <UpcomingMatches matches={matches?.scheduled} />
          <LiveMatches matches={matches?.live} />
        </Tab>

        <Tab label="Classificação">
          <StandingsTable standings={standings} />
        </Tab>

        <Tab label="Bracket">
          <BracketView bracket={bracket} />
        </Tab>

        <Tab label="Partidas">
          <MatchesHistory matches={matches?.finished} />
        </Tab>

        <Tab label="Times">
          <TeamsList eventId={eventId} />
        </Tab>
      </Tabs>
    </div>
  );
}
```

### Widget de Próxima Partida + Classificação

```tsx
function EventWidget({ eventId }: { eventId: string }) {
  const standings = useFetch(`/api/events/${eventId}/standings`);
  const matches = useFetch(`/api/events/${eventId}/matches`);

  const nextMatch = matches?.scheduled[0];
  const topTeams = standings?.standings.slice(0, 5);

  return (
    <div className="event-widget">
      {/* Next Match */}
      {nextMatch && (
        <div className="next-match">
          <h4>Próxima Partida</h4>
          <MatchCard match={nextMatch} />
        </div>
      )}

      {/* Top 5 */}
      <div className="top-teams">
        <h4>Top 5</h4>
        {topTeams?.map(team => (
          <div key={team.team.id} className="team-row">
            <span className="position">{team.position}</span>
            <img src={team.team.logoUrl} />
            <span>{team.team.name}</span>
            <span className="points">{team.stats.points}pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Live Updates com Polling

```tsx
function useLiveEventData(eventId: string) {
  const [data, setData] = useState<{
    standings: StandingsResponse | null;
    matches: any | null;
  }>({ standings: null, matches: null });

  useEffect(() => {
    const fetchData = async () => {
      const [standings, matches] = await Promise.all([
        fetch(`/api/events/${eventId}/standings`).then(r => r.json()),
        fetch(`/api/events/${eventId}/matches`).then(r => r.json()),
      ]);

      setData({ standings, matches });
    };

    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  return data;
}
```

---

## Notas Importantes

### Caching e Performance

1. **Polling**: Use intervalos de 30s para dados ao vivo
2. **Dados estáticos**: Cache dados do evento que não mudam
3. **Conditional requests**: Use ETags se disponível

### Tratamento de Erros

```typescript
async function fetchEventData(eventId: string, endpoint: string) {
  try {
    const res = await fetch(`/api/events/${eventId}/${endpoint}`);

    if (res.status === 404) {
      throw new Error('Evento não encontrado');
    }

    if (!res.ok) {
      throw new Error('Erro ao carregar dados');
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}
```

### Estados de Loading

```tsx
function DataWrapper({ children, loading, error }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return children;
}
```

---

## 6. GET /api/events/:externalId/swiss

**Descrição:** Retorna dados do Swiss System organizado por rounds e buckets.

[Documentação completa em SWISS_API_FRONTEND.md]

### Quick Summary

```bash
GET /api/events/8504/swiss
```

```typescript
interface SwissResponse {
  event: {
    id: number;
    name: string;
  };
  rounds: SwissRound[];        // Rounds organizados
  qualified: QualifiedTeam[];  // Times com 3 vitórias
  eliminated: EliminatedTeam[]; // Times com 3 derrotas
  currentRound: number;
  totalRounds: number;
}
```

**Uso:**
- Mostrar bracket Swiss System estilo CS2 Major
- Visualizar rounds e buckets (0:0, 1:0, 2:1, etc.)
- Destacar times classificados (verde) e eliminados (vermelho)

---

## 7. GET /api/events/:externalId/stages

**Descrição:** Lista todos os stages de um evento multi-stage (ex: CS2 Majors).

[Documentação completa em STAGES_API_FRONTEND.md]

### Quick Summary

```bash
GET /api/events/8042/stages
```

```typescript
interface StagesResponse {
  event: {
    id: number;
    externalId: string;
    name: string;
    status: string;
  };
  hasStages: boolean;
  stages: StageInfo[];  // Stage 1, Stage 2, Playoffs
}

interface StageInfo {
  id: number;
  externalId: string;
  name: string;
  shortName: string;        // "Stage 1", "Stage 2", "Playoffs"
  type: 'swiss' | 'bracket' | 'qualifier' | 'other';
  status: string;
  dateStart: string | null;
  dateEnd: string | null;
  numberOfTeams: number | null;
}
```

**Uso:**
- Criar tabs de navegação (Stage 1 / Stage 2 / Playoffs)
- Timeline do evento
- Seletor de stage dropdown
- Detecção automática de tipo (swiss vs bracket)

### Exemplo Completo

```tsx
function MajorEventPage({ eventId }: { eventId: string }) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('');

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => {
        setStagesData(data);
        if (data.stages.length > 0) {
          setCurrentStage(data.stages[0].externalId);
        }
      });
  }, [eventId]);

  if (!stagesData?.hasStages) {
    return <SingleStageView eventId={eventId} />;
  }

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        {stagesData.stages.map(stage => (
          <button
            key={stage.externalId}
            onClick={() => setCurrentStage(stage.externalId)}
            className={currentStage === stage.externalId ? 'active' : ''}
          >
            {stage.shortName}
          </button>
        ))}
      </div>

      {/* Content */}
      {stagesData.stages.map(stage => (
        <div key={stage.externalId} style={{ display: currentStage === stage.externalId ? 'block' : 'none' }}>
          {stage.type === 'swiss' ? (
            <SwissView eventId={stage.externalId} />
          ) : (
            <BracketView eventId={stage.externalId} />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Roadmap

### Próximos Endpoints Planejados

- [ ] `GET /api/events/:id/stats` - Estatísticas agregadas do evento
- [ ] `GET /api/matches/:id` - Detalhes completos de uma partida
- [ ] `GET /api/teams/:id` - Perfil completo do time
- [ ] `GET /api/teams/:id/matches` - Histórico de partidas do time
- [ ] `GET /api/players/:id` - Perfil do jogador

### Features Futuras

- WebSocket para updates em tempo real
- GraphQL endpoint para queries customizadas
- Paginação para listas grandes
- Filtros avançados (por data, time, formato)
