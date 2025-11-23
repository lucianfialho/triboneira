# Swiss System API - Guia Frontend

## Visão Geral

O endpoint Swiss System fornece dados completamente processados de torneios no formato Swiss (como CS2 Majors). Todo o processamento é feito no backend - o frontend apenas consome e renderiza.

**Endpoint:** `GET /api/events/[externalId]/swiss`

**Importante:** No HLTV, cada stage do Major é um evento separado:
- Stage 1 (Opening): `/api/events/8504/swiss`
- Stage 2 (Legends): `/api/events/8505/swiss`
- Playoffs: `/api/events/8042/bracket` (usa endpoint de bracket)

## Tipos TypeScript

```typescript
interface SwissTeam {
  id: number;
  name: string;
  logoUrl: string | null;
  seed: number | null;
}

interface SwissMatch {
  id: number;
  team1: SwissTeam;
  team2: SwissTeam;
  winner: SwissTeam | null;
  score: {
    team1: number | null;
    team2: number | null;
  };
  status: string;           // "scheduled", "live", "finished"
  date: string | null;      // ISO 8601
  team1Record: {            // Record ANTES desta partida
    wins: number;
    losses: number;
  };
  team2Record: {
    wins: number;
    losses: number;
  };
}

interface SwissBucket {
  bucket: string;           // "0:0", "1:0", "2:1", etc.
  matches: SwissMatch[];
}

interface SwissRound {
  roundNumber: number;      // 1, 2, 3, 4, 5
  buckets: SwissBucket[];   // Agrupados por record
}

interface QualifiedTeam extends SwissTeam {
  finalRecord: string;      // "3-0", "3-1", "3-2"
  placement: number;        // 1-8
}

interface EliminatedTeam extends SwissTeam {
  finalRecord: string;      // "0-3", "1-3", "2-3"
}

interface SwissResponse {
  event: {
    id: number;
    name: string;
  };
  rounds: SwissRound[];
  qualified: QualifiedTeam[];    // Times com 3 vitórias (verde)
  eliminated: EliminatedTeam[];  // Times com 3 derrotas (vermelho)
  currentRound: number;
  totalRounds: number;
}
```

## Estrutura da Resposta

```json
{
  "event": {
    "id": 14,
    "name": "StarLadder Budapest Major 2025 Stage 1"
  },
  "currentRound": 1,
  "totalRounds": 1,
  "rounds": [
    {
      "roundNumber": 1,
      "buckets": [
        {
          "bucket": "0:0",
          "matches": [
            {
              "id": 26,
              "team1": {
                "id": 172,
                "name": "B8",
                "logoUrl": "https://...",
                "seed": null
              },
              "team2": {
                "id": 174,
                "name": "M80",
                "logoUrl": "https://...",
                "seed": null
              },
              "winner": null,
              "score": { "team1": null, "team2": null },
              "status": "scheduled",
              "date": "2025-11-24T12:00:00.000Z",
              "team1Record": { "wins": 0, "losses": 0 },
              "team2Record": { "wins": 0, "losses": 0 }
            }
          ]
        },
        {
          "bucket": "1:0",
          "matches": [...]
        }
      ]
    }
  ],
  "qualified": [],
  "eliminated": []
}
```

## Como Renderizar

### 1. Layout Principal - Estilo CS2 Major

O Swiss System deve ser renderizado em colunas verticais, uma para cada round:

```tsx
function SwissView({ eventId }: { eventId: string }) {
  const [swissData, setSwissData] = useState<SwissResponse | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/swiss`)
      .then(res => res.json())
      .then(data => setSwissData(data));
  }, [eventId]);

  if (!swissData) return <Loading />;

  return (
    <div className="swiss-container">
      {/* Header */}
      <div className="swiss-header">
        <h2>{swissData.event.name}</h2>
        <span>Round {swissData.currentRound} of {swissData.totalRounds}</span>
      </div>

      {/* Rounds Grid */}
      <div className="rounds-grid">
        {swissData.rounds.map((round, index) => (
          <div key={index} className="round-column">
            <h3>Round {round.roundNumber}</h3>

            {round.buckets.map(bucket => (
              <div key={bucket.bucket} className="bucket-section">
                <div className="bucket-header">{bucket.bucket}</div>

                {bucket.matches.map(match => (
                  <SwissMatchCard key={match.id} match={match} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Qualified & Eliminated */}
      <div className="teams-status">
        <QualifiedSection teams={swissData.qualified} />
        <EliminatedSection teams={swissData.eliminated} />
      </div>
    </div>
  );
}
```

### 2. Card de Partida Swiss

```tsx
function SwissMatchCard({ match }: { match: SwissMatch }) {
  return (
    <div className={`swiss-match ${match.status}`}>
      {/* Team 1 */}
      <div className={`team ${match.winner?.id === match.team1.id ? 'winner' : ''}`}>
        <div className="team-info">
          <img src={match.team1.logoUrl} alt={match.team1.name} />
          <span className="team-name">{match.team1.name}</span>
          <span className="record">
            ({match.team1Record.wins}-{match.team1Record.losses})
          </span>
        </div>
        <span className="score">{match.score.team1 ?? '-'}</span>
      </div>

      {/* Team 2 */}
      <div className={`team ${match.winner?.id === match.team2.id ? 'winner' : ''}`}>
        <div className="team-info">
          <img src={match.team2.logoUrl} alt={match.team2.name} />
          <span className="team-name">{match.team2.name}</span>
          <span className="record">
            ({match.team2Record.wins}-{match.team2Record.losses})
          </span>
        </div>
        <span className="score">{match.score.team2 ?? '-'}</span>
      </div>

      {/* Match Info */}
      {match.status === 'live' && (
        <div className="live-indicator">🔴 AO VIVO</div>
      )}
      {match.date && (
        <div className="match-time">
          {new Date(match.date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}
```

### 3. Times Classificados (Verde)

```tsx
function QualifiedSection({ teams }: { teams: QualifiedTeam[] }) {
  if (teams.length === 0) return null;

  return (
    <div className="qualified-section">
      <h3>✅ Classificados ({teams.length}/8)</h3>
      <div className="teams-grid">
        {teams.map(team => (
          <div key={team.id} className="team-card qualified">
            <span className="placement">#{team.placement}</span>
            <img src={team.logoUrl} alt={team.name} />
            <span className="team-name">{team.name}</span>
            <span className="record">{team.finalRecord}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Times Eliminados (Vermelho)

```tsx
function EliminatedSection({ teams }: { teams: EliminatedTeam[] }) {
  if (teams.length === 0) return null;

  return (
    <div className="eliminated-section">
      <h3>❌ Eliminados ({teams.length})</h3>
      <div className="teams-grid">
        {teams.map(team => (
          <div key={team.id} className="team-card eliminated">
            <img src={team.logoUrl} alt={team.name} />
            <span className="team-name">{team.name}</span>
            <span className="record">{team.finalRecord}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## CSS Layout Sugerido

```css
.swiss-container {
  padding: 20px;
  background: #0d1117;
  color: white;
}

.rounds-grid {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 20px 0;
}

.round-column {
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.round-column h3 {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  padding: 12px;
  background: #161b22;
  border-radius: 8px;
}

/* Bucket Section */
.bucket-section {
  background: #161b22;
  border-radius: 8px;
  padding: 12px;
}

.bucket-header {
  font-size: 14px;
  font-weight: bold;
  color: #8b949e;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #0d1117;
  border-radius: 4px;
  text-align: center;
}

/* Swiss Match Card */
.swiss-match {
  background: #21262d;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 2px solid transparent;
}

.swiss-match.live {
  border-color: #ff4444;
  box-shadow: 0 0 12px rgba(255, 68, 68, 0.3);
}

.swiss-match .team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 4px;
  margin: 4px 0;
}

.swiss-match .team.winner {
  background: #1a472a;
  font-weight: bold;
}

.swiss-match .team-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.swiss-match .team-info img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.swiss-match .team-name {
  font-weight: 500;
}

.swiss-match .record {
  font-size: 12px;
  color: #8b949e;
  margin-left: 4px;
}

.swiss-match .score {
  font-size: 20px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.live-indicator {
  text-align: center;
  font-size: 12px;
  color: #ff4444;
  font-weight: bold;
  margin-top: 4px;
}

.match-time {
  text-align: center;
  font-size: 12px;
  color: #8b949e;
  margin-top: 4px;
}

/* Qualified & Eliminated */
.teams-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 32px;
}

.qualified-section {
  background: #1a472a;
  border-radius: 8px;
  padding: 16px;
}

.eliminated-section {
  background: #4c1d1d;
  border-radius: 8px;
  padding: 16px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.team-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.team-card.qualified {
  border-left: 4px solid #3fb950;
}

.team-card.eliminated {
  border-left: 4px solid #f85149;
}

.team-card img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.team-card .placement {
  font-weight: bold;
  color: #ffd700;
}

.team-card .record {
  margin-left: auto;
  font-size: 12px;
  font-weight: bold;
}
```

## Casos de Uso

### 1. Filtrar Partidas por Status

```tsx
function LiveMatches({ rounds }: { rounds: SwissRound[] }) {
  const liveMatches = rounds
    .flatMap(round => round.buckets)
    .flatMap(bucket => bucket.matches)
    .filter(match => match.status === 'live');

  if (liveMatches.length === 0) {
    return <p>Nenhuma partida ao vivo</p>;
  }

  return (
    <div className="live-matches">
      <h3>🔴 Partidas ao Vivo</h3>
      {liveMatches.map(match => (
        <SwissMatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

### 2. Progresso do Torneio

```tsx
function SwissProgress({ data }: { data: SwissResponse }) {
  const totalTeams = data.qualified.length + data.eliminated.length +
    (16 - data.qualified.length - data.eliminated.length);

  const progress = {
    qualified: (data.qualified.length / 8) * 100,
    eliminated: (data.eliminated.length / 8) * 100,
    active: ((16 - data.qualified.length - data.eliminated.length) / 16) * 100
  };

  return (
    <div className="swiss-progress">
      <h4>Progresso do Torneio</h4>

      <div className="progress-stats">
        <div className="stat qualified">
          <span className="label">Classificados</span>
          <span className="value">{data.qualified.length}/8</span>
          <div className="bar">
            <div className="fill" style={{ width: `${progress.qualified}%` }} />
          </div>
        </div>

        <div className="stat eliminated">
          <span className="label">Eliminados</span>
          <span className="value">{data.eliminated.length}/8</span>
          <div className="bar">
            <div className="fill" style={{ width: `${progress.eliminated}%` }} />
          </div>
        </div>

        <div className="stat active">
          <span className="label">Ativos</span>
          <span className="value">
            {16 - data.qualified.length - data.eliminated.length}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### 3. Estatísticas por Bucket

```tsx
function BucketStats({ rounds }: { rounds: SwissRound[] }) {
  const bucketCounts = new Map<string, number>();

  rounds.forEach(round => {
    round.buckets.forEach(bucket => {
      const count = bucketCounts.get(bucket.bucket) || 0;
      bucketCounts.set(bucket.bucket, count + bucket.matches.length);
    });
  });

  return (
    <div className="bucket-stats">
      <h4>Distribuição por Record</h4>
      {Array.from(bucketCounts.entries())
        .sort((a, b) => {
          const [aWins, aLosses] = a[0].split(':').map(Number);
          const [bWins, bLosses] = b[0].split(':').map(Number);
          if (bWins !== aWins) return bWins - aWins;
          return aLosses - bLosses;
        })
        .map(([bucket, count]) => (
          <div key={bucket} className="bucket-stat">
            <span className="bucket">{bucket}</span>
            <span className="count">{count} partidas</span>
          </div>
        ))
      }
    </div>
  );
}
```

### 4. Próximas Partidas de um Time

```tsx
function TeamNextMatch({ teamId, rounds }: {
  teamId: number;
  rounds: SwissRound[]
}) {
  const nextMatch = rounds
    .flatMap(round => round.buckets)
    .flatMap(bucket => bucket.matches)
    .filter(m => m.status !== 'finished')
    .find(m => m.team1.id === teamId || m.team2.id === teamId);

  if (!nextMatch) {
    return <p>Nenhuma partida agendada</p>;
  }

  return (
    <div className="next-match">
      <h4>Próxima Partida</h4>
      <SwissMatchCard match={nextMatch} />
    </div>
  );
}
```

## Polling para Atualizações

```tsx
function useSwissPolling(eventId: string, intervalMs: number = 30000) {
  const [data, setData] = useState<SwissResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/events/${eventId}/swiss`);
      const json = await res.json();
      setData(json);
    };

    fetchData(); // Fetch inicial
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [eventId, intervalMs]);

  return data;
}

// Usar no componente
function LiveSwissView({ eventId }: { eventId: string }) {
  const swissData = useSwissPolling(eventId, 30000); // Atualiza a cada 30s

  if (!swissData) return <Loading />;
  return <SwissView data={swissData} />;
}
```

## Notas Importantes

1. **Records dos Times**: Sempre mostrados ANTES da partida começar
   - Team1Record e Team2Record indicam o histórico até aquele momento
   - Use para mostrar como badge ao lado do nome do time

2. **Buckets**: Agrupamento natural por record
   - "0:0" = todos começam aqui
   - "1:0" = times com 1 vitória
   - "2:1" = times com 2 vitórias e 1 derrota
   - etc.

3. **Qualified**: Times que alcançaram 3 vitórias
   - Renderize em verde
   - Mostre placement (1-8 baseado no record final: 3-0 > 3-1 > 3-2)

4. **Eliminated**: Times que alcançaram 3 derrotas
   - Renderize em vermelho
   - Mostre record final (0-3, 1-3, 2-3)

5. **Rounds**: Detectados automaticamente
   - Round muda quando os times começam a ter records diferentes
   - Swiss System típico tem 5 rounds para 16 teams

6. **Multi-Stage**: CS2 Majors têm 3 stages
   - Cada stage é um evento separado no HLTV
   - Use tabs ou seletor para alternar entre stages
   - Stage 1 + Stage 2 = Swiss System
   - Playoffs = Bracket (endpoint diferente)

## Exemplo Completo

```tsx
import { useState, useEffect } from 'react';

export function SwissMajorView({ stageId }: { stageId: string }) {
  const [data, setData] = useState<SwissResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSwiss = async () => {
      try {
        const res = await fetch(`/api/events/${stageId}/swiss`);
        if (!res.ok) throw new Error('Falha ao carregar Swiss');

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSwiss();
    const interval = setInterval(fetchSwiss, 30000);
    return () => clearInterval(interval);
  }, [stageId]);

  if (loading) return <div>Carregando Swiss System...</div>;
  if (!data) return <div>Swiss não disponível</div>;

  return (
    <div className="swiss-major-view">
      {/* Header */}
      <div className="header">
        <h1>{data.event.name}</h1>
        <SwissProgress data={data} />
      </div>

      {/* Live Matches */}
      <LiveMatches rounds={data.rounds} />

      {/* Rounds Grid */}
      <div className="rounds-grid">
        {data.rounds.map((round, index) => (
          <div key={index} className="round-column">
            <h3>Round {round.roundNumber}</h3>
            {round.buckets.map(bucket => (
              <div key={bucket.bucket} className="bucket-section">
                <div className="bucket-header">{bucket.bucket}</div>
                {bucket.matches.map(match => (
                  <SwissMatchCard key={match.id} match={match} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="teams-status">
        <QualifiedSection teams={data.qualified} />
        <EliminatedSection teams={data.eliminated} />
      </div>
    </div>
  );
}
```

---

## Suporte

Se encontrar problemas:
- Verifique se o `eventId` corresponde a um stage Swiss (8504, 8505)
- Para playoffs, use o endpoint `/bracket` ao invés de `/swiss`
- O endpoint retorna 404 se o evento não existir
- Confira os logs do servidor para erros 500
