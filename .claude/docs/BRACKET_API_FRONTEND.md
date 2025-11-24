# Bracket API - Guia Frontend

## Visão Geral

O Bracket API fornece dados completamente processados de brackets/playoffs de eventos CS2. Todo o processamento é feito no backend - o frontend apenas consome e renderiza.

**Endpoint:** `GET /api/events/[externalId]/bracket`

## Como Usar

### 1. Fazer a Requisição

```typescript
// Exemplo básico
const response = await fetch('/api/events/8855/bracket');
const bracketData = await response.json();
```

### 2. Tipos TypeScript

```typescript
interface BracketTeam {
  id: number;
  name: string;
  logoUrl: string | null;
  seed: number | null;
  isTBA: boolean;  // true se o time ainda não foi definido
}

interface BracketMatch {
  id: number;
  team1: BracketTeam;
  team2: BracketTeam;
  winner: BracketTeam | null;  // null se ainda não terminou
  score: {
    team1: number | null;
    team2: number | null;
  };
  format: string | null;  // "bo1", "bo3", "bo5"
  date: string | null;    // ISO 8601 format
  status: string;         // "scheduled", "live", "finished"
  feeds: {
    team1From?: number;   // ID da partida que alimenta team1
    team2From?: number;   // ID da partida que alimenta team2
    feedsTo?: number;     // ID da partida que esta partida alimenta
  };
}

interface BracketRound {
  name: string;  // "Quarter-Finals", "Semi-Finals", "Grand Final"
  matches: BracketMatch[];
}

interface BracketResponse {
  currentStage: 'opening' | 'elimination' | 'playoffs';
  stageInfo: {
    format: string;           // "Single Elimination", "Playoffs"
    description: string;      // Descrição em português
    totalRounds: number;
  };
  bracket: BracketRound[];
}
```

### 3. Estrutura da Resposta

```json
{
  "currentStage": "playoffs",
  "stageInfo": {
    "format": "Playoffs",
    "description": "Bracket de eliminação simples com as melhores equipes",
    "totalRounds": 2
  },
  "bracket": [
    {
      "name": "Quarter-Finals",
      "matches": [
        {
          "id": 1,
          "team1": {
            "id": 157,
            "name": "Rooster",
            "logoUrl": "https://img-cdn.hltv.org/teamlogo/...",
            "seed": null,
            "isTBA": false
          },
          "team2": {
            "id": 161,
            "name": "FURY",
            "logoUrl": "https://img-cdn.hltv.org/teamlogo/...",
            "seed": null,
            "isTBA": false
          },
          "winner": null,
          "score": {
            "team1": null,
            "team2": null
          },
          "format": "bo3",
          "date": "2025-11-23T08:00:00.000Z",
          "status": "scheduled",
          "feeds": {
            "feedsTo": 17
          }
        }
      ]
    },
    {
      "name": "Semi-Finals",
      "matches": [...]
    }
  ]
}
```

## Como Renderizar

### 1. Iterar pelos Rounds

```tsx
function BracketView({ eventId }: { eventId: string }) {
  const [bracketData, setBracketData] = useState<BracketResponse | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/bracket`)
      .then(res => res.json())
      .then(data => setBracketData(data));
  }, [eventId]);

  if (!bracketData) return <Loading />;

  return (
    <div className="bracket-container">
      <h2>{bracketData.stageInfo.description}</h2>

      <div className="rounds-grid">
        {bracketData.bracket.map((round, index) => (
          <div key={index} className="round">
            <h3>{round.name}</h3>

            {round.matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Renderizar uma Partida

```tsx
function MatchCard({ match }: { match: BracketMatch }) {
  return (
    <div className={`match ${match.status}`}>
      {/* Team 1 */}
      <div className={`team ${match.winner?.id === match.team1.id ? 'winner' : ''}`}>
        {match.team1.isTBA ? (
          <span className="tba">TBA</span>
        ) : (
          <>
            <img src={match.team1.logoUrl} alt={match.team1.name} />
            <span>{match.team1.name}</span>
            {match.team1.seed && <span className="seed">#{match.team1.seed}</span>}
          </>
        )}
        <span className="score">{match.score.team1 ?? '-'}</span>
      </div>

      {/* Team 2 */}
      <div className={`team ${match.winner?.id === match.team2.id ? 'winner' : ''}`}>
        {match.team2.isTBA ? (
          <span className="tba">TBA</span>
        ) : (
          <>
            <img src={match.team2.logoUrl} alt={match.team2.name} />
            <span>{match.team2.name}</span>
            {match.team2.seed && <span className="seed">#{match.team2.seed}</span>}
          </>
        )}
        <span className="score">{match.score.team2 ?? '-'}</span>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <span className="format">{match.format?.toUpperCase()}</span>
        {match.date && (
          <span className="date">
            {new Date(match.date).toLocaleString('pt-BR')}
          </span>
        )}
        <span className={`status ${match.status}`}>
          {match.status === 'live' ? '🔴 AO VIVO' :
           match.status === 'finished' ? '✅ Finalizado' :
           '📅 Agendado'}
        </span>
      </div>
    </div>
  );
}
```

### 3. Desenhar Conexões Entre Partidas

Use os campos `feeds` para desenhar linhas conectando partidas:

```tsx
function BracketConnections({ bracket }: { bracket: BracketRound[] }) {
  return (
    <svg className="bracket-connections">
      {bracket.map(round =>
        round.matches.map(match => {
          // Se esta partida alimenta outra, desenhe uma linha
          if (match.feeds.feedsTo) {
            return (
              <line
                key={`${match.id}-to-${match.feeds.feedsTo}`}
                x1={getMatchX(match.id)}
                y1={getMatchY(match.id)}
                x2={getMatchX(match.feeds.feedsTo)}
                y2={getMatchY(match.feeds.feedsTo)}
                stroke="#ccc"
                strokeWidth="2"
              />
            );
          }
          return null;
        })
      )}
    </svg>
  );
}
```

## Casos de Uso

### 1. Mostrar Badge de Stage

```tsx
function StageBadge({ stage }: { stage: string }) {
  const stageConfig = {
    opening: { label: 'Abertura', color: 'gray' },
    elimination: { label: 'Eliminatórias', color: 'blue' },
    playoffs: { label: 'Playoffs', color: 'gold' }
  };

  const config = stageConfig[stage];

  return (
    <div className={`badge ${config.color}`}>
      {config.label}
    </div>
  );
}
```

### 2. Filtrar Partidas por Status

```tsx
function FilteredMatches({ bracket, status }: {
  bracket: BracketRound[],
  status: 'live' | 'scheduled' | 'finished'
}) {
  const matches = bracket
    .flatMap(round => round.matches)
    .filter(match => match.status === status);

  return (
    <div>
      <h3>
        {status === 'live' && '🔴 Ao Vivo'}
        {status === 'scheduled' && '📅 Próximas'}
        {status === 'finished' && '✅ Finalizadas'}
      </h3>
      {matches.map(match => <MatchCard key={match.id} match={match} />)}
    </div>
  );
}
```

### 3. Mostrar Próxima Partida

```tsx
function NextMatch({ bracket }: { bracket: BracketRound[] }) {
  const allMatches = bracket.flatMap(round => round.matches);

  const nextMatch = allMatches
    .filter(m => m.status === 'scheduled' && m.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

  if (!nextMatch) return <p>Nenhuma partida agendada</p>;

  return (
    <div className="next-match-card">
      <h4>Próxima Partida</h4>
      <MatchCard match={nextMatch} />
    </div>
  );
}
```

### 4. Timeline de Rounds

```tsx
function RoundsTimeline({ bracket }: { bracket: BracketRound[] }) {
  return (
    <div className="timeline">
      {bracket.map((round, index) => {
        const finishedCount = round.matches.filter(m => m.status === 'finished').length;
        const progress = (finishedCount / round.matches.length) * 100;

        return (
          <div key={index} className="timeline-item">
            <h4>{round.name}</h4>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }} />
            </div>
            <span>{finishedCount}/{round.matches.length} completas</span>
          </div>
        );
      })}
    </div>
  );
}
```

## Layout Sugerido

```css
.bracket-container {
  overflow-x: auto;
  padding: 20px;
}

.rounds-grid {
  display: flex;
  gap: 40px;
  min-width: max-content;
}

.round {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
}

.round h3 {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.match {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.match.live {
  border-color: #ff4444;
  box-shadow: 0 0 8px rgba(255,68,68,0.3);
}

.team {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
}

.team.winner {
  background: #f0f9ff;
  font-weight: bold;
}

.team img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.team .score {
  margin-left: auto;
  font-size: 18px;
  font-weight: bold;
}

.tba {
  color: #999;
  font-style: italic;
}

.seed {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
```

## Notas Importantes

1. **Times TBA**: Sempre verifique `team.isTBA` antes de renderizar logos e nomes
2. **Winner null**: Partidas agendadas ou ao vivo não terão vencedor
3. **Feeds**: Use para desenhar conexões visuais entre rounds
4. **Seeds**: Podem ser `null` se não foram definidos no evento
5. **Datas**: Sempre estão em ISO 8601 UTC, converta para timezone local
6. **Status**:
   - `scheduled` = partida futura
   - `live` = acontecendo agora
   - `finished` = já terminou
   - `cancelled` = foi cancelada (não aparece no bracket por padrão)

## Polling para Atualizações

Para manter o bracket atualizado em tempo real:

```typescript
function useBracketPolling(eventId: string, intervalMs: number = 30000) {
  const [bracket, setBracket] = useState<BracketResponse | null>(null);

  useEffect(() => {
    const fetchBracket = async () => {
      const res = await fetch(`/api/events/${eventId}/bracket`);
      const data = await res.json();
      setBracket(data);
    };

    fetchBracket(); // Fetch inicial
    const interval = setInterval(fetchBracket, intervalMs);

    return () => clearInterval(interval);
  }, [eventId, intervalMs]);

  return bracket;
}

// Usar no componente
function LiveBracket({ eventId }: { eventId: string }) {
  const bracket = useBracketPolling(eventId, 30000); // Atualiza a cada 30s

  if (!bracket) return <Loading />;
  return <BracketView bracket={bracket} />;
}
```

## Exemplo Completo

```tsx
import { useState, useEffect } from 'react';

export function EventBracket({ eventId }: { eventId: string }) {
  const [bracketData, setBracketData] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/bracket`);

        if (!res.ok) {
          throw new Error('Falha ao carregar bracket');
        }

        const data = await res.json();
        setBracketData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchBracket();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchBracket, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) return <div>Carregando bracket...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!bracketData) return <div>Bracket não disponível</div>;

  return (
    <div className="event-bracket">
      {/* Header */}
      <div className="bracket-header">
        <h2>{bracketData.stageInfo.description}</h2>
        <StageBadge stage={bracketData.currentStage} />
        <span className="format">{bracketData.stageInfo.format}</span>
      </div>

      {/* Timeline */}
      <RoundsTimeline bracket={bracketData.bracket} />

      {/* Bracket Visual */}
      <div className="bracket-visual">
        <div className="rounds-grid">
          {bracketData.bracket.map((round, index) => (
            <div key={index} className="round">
              <h3>{round.name}</h3>
              <div className="matches">
                {round.matches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Matches */}
      <FilteredMatches bracket={bracketData.bracket} status="live" />

      {/* Next Match */}
      <NextMatch bracket={bracketData.bracket} />
    </div>
  );
}
```

---

## Suporte

Se encontrar problemas ou tiver dúvidas:
- Verifique o console do navegador para erros
- Confira se o `eventId` está correto
- O endpoint retorna 404 se o evento não existir no banco
- O endpoint retorna 500 se houver erro no servidor (verifique os logs)
