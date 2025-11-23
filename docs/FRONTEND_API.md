# 🎯 API Documentation - Frontend Integration

Documentação completa dos endpoints de matches e bracket para integração no frontend.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Endpoint: Matches](#endpoint-matches)
- [Endpoint: Swiss Bracket](#endpoint-swiss-bracket)
- [TBD Matches](#tbd-matches)
- [Exemplos de Integração React](#exemplos-de-integração-react)

---

## 🎯 Visão Geral

O sistema agora suporta **matches TBD** (To Be Decided) - partidas onde os times ainda não foram definidos. Isso é comum em brackets de torneios onde os times são determinados após partidas anteriores.

**Base URL**: `http://localhost:3000/api`

**Event External ID**: `8504` (StarLadder Budapest Major 2025 Stage 1)

---

## 📊 Endpoint: Matches

Retorna matches de um evento com filtros opcionais.

### URL
```
GET /api/events/{externalId}/matches
```

### Query Parameters

| Parâmetro | Tipo | Descrição | Obrigatório | Exemplo |
|-----------|------|-----------|-------------|---------|
| `status` | string | Filtrar por status | Não | `scheduled`, `live`, `finished` |

### Response Structure

```typescript
{
  "live": Match[],      // Matches ao vivo (máx 10)
  "scheduled": Match[], // Matches agendados (máx 5)
  "finished": Match[]   // Matches finalizados (máx 5)
}

// Ou, se usar ?status=scheduled:
{
  "scheduled": Match[]
}

interface Match {
  id: number;
  externalId: string;
  date: string | null;
  format: string;           // "bo1", "bo3", "bo5"
  status: string;           // "scheduled", "live", "finished"
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  team1: Team;
  team2: Team;
  winner: {
    id: number | null;
    name: string | null;
  } | null;
}

interface Team {
  id: number | null;        // NULL para TBD teams
  externalId: string | null;
  name: string;             // "TBD" quando time não definido
  logoUrl: string | null;
  rank: number | null;
  country: string | null;
}
```

### Exemplos

#### Buscar todos os matches
```bash
curl "http://localhost:3000/api/events/8504/matches"
```

#### Buscar apenas matches agendados
```bash
curl "http://localhost:3000/api/events/8504/matches?status=scheduled"
```

#### Buscar matches ao vivo
```bash
curl "http://localhost:3000/api/events/8504/matches?status=live"
```

### Response Example

```json
{
  "scheduled": [
    {
      "id": 103,
      "externalId": "2388057",
      "date": "2025-11-27T19:00:00.000Z",
      "format": "bo3",
      "status": "scheduled",
      "scoreTeam1": null,
      "scoreTeam2": null,
      "team1": {
        "id": null,
        "externalId": null,
        "name": "TBD",
        "logoUrl": null,
        "rank": null,
        "country": null
      },
      "team2": {
        "id": null,
        "externalId": null,
        "name": "TBD",
        "logoUrl": null,
        "rank": null,
        "country": null
      },
      "winner": null
    },
    {
      "id": 98,
      "externalId": "2388020",
      "date": "2025-11-24T17:00:00.000Z",
      "format": "bo3",
      "status": "scheduled",
      "scoreTeam1": null,
      "scoreTeam2": null,
      "team1": {
        "id": 45,
        "externalId": "11595",
        "name": "B8",
        "logoUrl": "https://img-cdn.hltv.org/teamlogo/...",
        "rank": 12,
        "country": "Kazakhstan"
      },
      "team2": {
        "id": 89,
        "externalId": "11351",
        "name": "M80",
        "logoUrl": "https://img-cdn.hltv.org/teamlogo/...",
        "rank": 15,
        "country": "United States"
      },
      "winner": null
    }
  ]
}
```

---

## 🏆 Endpoint: Swiss Bracket

Retorna a estrutura completa do bracket Swiss System com rounds, buckets e records.

### URL
```
GET /api/events/{externalId}/swiss
```

### Response Structure

```typescript
interface SwissResponse {
  event: {
    id: number;
    name: string;
  };
  rounds: SwissRound[];
  qualified: QualifiedTeam[];    // Times com 3 vitórias
  eliminated: EliminatedTeam[];  // Times com 3 derrotas
  currentRound: number;
  totalRounds: number;
}

interface SwissRound {
  roundNumber: number;
  buckets: SwissBucket[];
}

interface SwissBucket {
  bucket: string;  // "0:0", "1:0", "2:1", etc (wins:losses)
  matches: SwissMatch[];
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
  status: string;
  date: string | null;
  // Record ANTES desta partida
  team1Record: { wins: number; losses: number };
  team2Record: { wins: number; losses: number };
}

interface SwissTeam {
  id: number;           // Pode ser 0 ou -1 para TBD teams
  name: string;         // "TBD" quando não definido
  logoUrl: string | null;
  seed: number | null;
}

interface QualifiedTeam extends SwissTeam {
  finalRecord: string;  // "3-0", "3-1", "3-2"
  placement: number;    // 1-8
}

interface EliminatedTeam extends SwissTeam {
  finalRecord: string;  // "0-3", "1-3", "2-3"
}
```

### Exemplo

```bash
curl "http://localhost:3000/api/events/8504/swiss"
```

### Response Example

```json
{
  "event": {
    "id": 14,
    "name": "StarLadder Budapest Major 2025 Stage 1"
  },
  "currentRound": 1,
  "totalRounds": 1,
  "qualified": [],
  "eliminated": [],
  "rounds": [
    {
      "roundNumber": 1,
      "buckets": [
        {
          "bucket": "0:0",
          "matches": [
            {
              "id": 98,
              "team1": {
                "id": 45,
                "name": "B8",
                "logoUrl": "https://...",
                "seed": 1
              },
              "team2": {
                "id": 89,
                "name": "M80",
                "logoUrl": "https://...",
                "seed": 16
              },
              "winner": null,
              "score": {
                "team1": null,
                "team2": null
              },
              "status": "scheduled",
              "date": "2025-11-24T17:00:00.000Z",
              "team1Record": { "wins": 0, "losses": 0 },
              "team2Record": { "wins": 0, "losses": 0 }
            },
            {
              "id": 103,
              "team1": {
                "id": 0,
                "name": "TBD",
                "logoUrl": null,
                "seed": null
              },
              "team2": {
                "id": -1,
                "name": "TBD",
                "logoUrl": null,
                "seed": null
              },
              "winner": null,
              "score": {
                "team1": null,
                "team2": null
              },
              "status": "scheduled",
              "date": "2025-11-27T19:00:00.000Z",
              "team1Record": { "wins": 0, "losses": 0 },
              "team2Record": { "wins": 0, "losses": 0 }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔍 TBD Matches

### Como Identificar

Um match é TBD quando:
```typescript
match.team1.id === null || match.team1.name === "TBD"
match.team2.id === null || match.team2.name === "TBD"
```

### Como Exibir

```typescript
function getTeamDisplay(team: Team): string {
  if (!team.id || team.name === "TBD") {
    return "TBD";
  }
  return team.name;
}

function TeamLogo({ team }: { team: Team }) {
  if (!team.id || team.name === "TBD") {
    return <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
      <span className="text-xs">?</span>
    </div>;
  }

  return <img src={team.logoUrl} alt={team.name} className="w-8 h-8" />;
}
```

### Tratamento de Datas

```typescript
function MatchDate({ date }: { date: string | null }) {
  if (!date) {
    return <span className="text-gray-500">Data a definir</span>;
  }

  const matchDate = new Date(date);
  return <span>{matchDate.toLocaleString('pt-BR')}</span>;
}
```

---

## ⚛️ Exemplos de Integração React

### 1. Lista de Matches (Aba Matches)

```typescript
import { useEffect, useState } from 'react';

interface Match {
  id: number;
  team1: { id: number | null; name: string; logoUrl: string | null };
  team2: { id: number | null; name: string; logoUrl: string | null };
  date: string | null;
  format: string;
  status: string;
}

function MatchesList({ eventId }: { eventId: string }) {
  const [matches, setMatches] = useState<{
    live: Match[];
    scheduled: Match[];
    finished: Match[];
  }>({ live: [], scheduled: [], finished: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/events/${eventId}/matches`
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
    // Poll a cada 30 segundos para matches ao vivo
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8">
      {/* Matches Ao Vivo */}
      {matches.live.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">🔴 AO VIVO</h2>
          <div className="space-y-2">
            {matches.live.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Matches Agendados */}
      {matches.scheduled.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">📅 PRÓXIMOS JOGOS</h2>
          <div className="space-y-2">
            {matches.scheduled.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Matches Finalizados */}
      {matches.finished.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">✅ FINALIZADOS</h2>
          <div className="space-y-2">
            {matches.finished.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isTBD = !match.team1.id || !match.team2.id;

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <TeamDisplay team={match.team1} />
        <span className="text-gray-400">vs</span>
        <TeamDisplay team={match.team2} />
      </div>

      <div className="text-right">
        <div className="text-sm text-gray-400 uppercase">{match.format}</div>
        {match.date ? (
          <div className="text-xs text-gray-500">
            {new Date(match.date).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Data a definir</div>
        )}
      </div>
    </div>
  );
}

function TeamDisplay({ team }: { team: Match['team1'] }) {
  if (!team.id || team.name === 'TBD') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">?</span>
        </div>
        <span className="text-gray-400">TBD</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {team.logoUrl && (
        <img src={team.logoUrl} alt={team.name} className="w-8 h-8" />
      )}
      <span className="font-medium">{team.name}</span>
    </div>
  );
}
```

### 2. Bracket Swiss (Aba Bracket)

```typescript
import { useEffect, useState } from 'react';

interface SwissData {
  event: { id: number; name: string };
  rounds: Array<{
    roundNumber: number;
    buckets: Array<{
      bucket: string;
      matches: Array<{
        id: number;
        team1: { id: number; name: string; logoUrl: string | null };
        team2: { id: number; name: string; logoUrl: string | null };
        team1Record: { wins: number; losses: number };
        team2Record: { wins: number; losses: number };
        status: string;
        winner: { id: number } | null;
      }>;
    }>;
  }>;
  qualified: Array<{ name: string; finalRecord: string; placement: number }>;
  eliminated: Array<{ name: string; finalRecord: string }>;
}

function SwissBracket({ eventId }: { eventId: string }) {
  const [data, setData] = useState<SwissData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBracket() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/events/${eventId}/swiss`
        );
        const bracketData = await response.json();
        setData(bracketData);
      } catch (error) {
        console.error('Error fetching bracket:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBracket();
    // Poll a cada minuto
    const interval = setInterval(fetchBracket, 60000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) return <div>Carregando bracket...</div>;
  if (!data) return <div>Erro ao carregar bracket</div>;

  return (
    <div className="space-y-8">
      {/* Times Classificados */}
      {data.qualified.length > 0 && (
        <section className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            ✅ CLASSIFICADOS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.qualified.map(team => (
              <div key={team.placement} className="bg-gray-800 p-3 rounded">
                <div className="font-medium">{team.name}</div>
                <div className="text-sm text-green-400">{team.finalRecord}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Times Eliminados */}
      {data.eliminated.length > 0 && (
        <section className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            ❌ ELIMINADOS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.eliminated.map(team => (
              <div key={team.name} className="bg-gray-800 p-3 rounded">
                <div className="font-medium">{team.name}</div>
                <div className="text-sm text-red-400">{team.finalRecord}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rounds */}
      {data.rounds.map(round => (
        <section key={round.roundNumber}>
          <h2 className="text-xl font-bold mb-4">
            Round {round.roundNumber}
          </h2>

          <div className="space-y-6">
            {round.buckets.map(bucket => (
              <div key={bucket.bucket}>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Bracket {bucket.bucket} (W-L)
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {bucket.matches.map(match => (
                    <SwissMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SwissMatchCard({ match }: { match: SwissData['rounds'][0]['buckets'][0]['matches'][0] }) {
  const isTBD = match.team1.name === 'TBD' || match.team2.name === 'TBD';

  return (
    <div className={`
      bg-gray-800 p-4 rounded-lg
      ${match.status === 'live' ? 'border-2 border-red-500' : ''}
      ${isTBD ? 'opacity-60' : ''}
    `}>
      {/* Team 1 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {match.team1.logoUrl && !isTBD && (
            <img src={match.team1.logoUrl} alt={match.team1.name} className="w-6 h-6" />
          )}
          <span className={match.winner?.id === match.team1.id ? 'font-bold' : ''}>
            {match.team1.name}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {match.team1Record.wins}-{match.team1Record.losses}
        </span>
      </div>

      {/* Team 2 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.team2.logoUrl && !isTBD && (
            <img src={match.team2.logoUrl} alt={match.team2.name} className="w-6 h-6" />
          )}
          <span className={match.winner?.id === match.team2.id ? 'font-bold' : ''}>
            {match.team2.name}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {match.team2Record.wins}-{match.team2Record.losses}
        </span>
      </div>

      {/* Status */}
      {match.status === 'live' && (
        <div className="mt-2 text-xs text-red-500 font-bold">
          🔴 AO VIVO
        </div>
      )}
      {isTBD && (
        <div className="mt-2 text-xs text-gray-500">
          Times a definir
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Polling e Auto-Refresh

### Recomendações

- **Matches Ao Vivo**: Poll a cada 30 segundos
- **Matches Agendados**: Poll a cada 2-5 minutos
- **Swiss Bracket**: Poll a cada 1 minuto
- **Parar polling**: Quando o usuário sair da página

### Exemplo de Hook

```typescript
function useAutoRefresh<T>(
  fetcher: () => Promise<T>,
  interval: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    async function fetch() {
      try {
        const result = await fetcher();
        setData(result);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetch();
    const timer = setInterval(fetch, interval);
    return () => clearInterval(timer);
  }, [fetcher, interval, enabled]);

  return { data, loading };
}

// Uso:
const { data: matches, loading } = useAutoRefresh(
  () => fetch('/api/events/8504/matches').then(r => r.json()),
  30000 // 30 segundos
);
```

---

## 🎨 Estilos Sugeridos

### TBD Match
```css
.match-tbd {
  opacity: 0.6;
  border-style: dashed;
}
```

### Match Status
```css
.match-live {
  border: 2px solid #ef4444;
  animation: pulse 2s infinite;
}

.match-scheduled {
  border: 1px solid #6b7280;
}

.match-finished {
  opacity: 0.8;
}
```

---

## 📝 Notas Importantes

1. **TBD Teams sempre têm `id: null`** - use isso para identificar
2. **Swiss Bracket pode ter IDs fake (0, -1)** para TBD - sempre cheque o `name` também
3. **Datas podem ser `null`** para matches muito futuros
4. **Polling é essencial** para manter dados atualizados durante matches ao vivo
5. **Records no Swiss** são do ANTES da partida, não depois

---

## 🚀 Quick Start

```bash
# 1. Buscar matches do Major
curl "http://localhost:3000/api/events/8504/matches"

# 2. Buscar bracket Swiss do Major
curl "http://localhost:3000/api/events/8504/swiss"

# 3. Integrar no React
import { MatchesList, SwissBracket } from './components';

function EventPage() {
  return (
    <div>
      <MatchesList eventId="8504" />
      <SwissBracket eventId="8504" />
    </div>
  );
}
```

---

**Última atualização**: 2025-11-23
**Versão da API**: 2.0.0 (com suporte a TBD)
