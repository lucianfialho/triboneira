# Multistream API Documentation

**Base URL:** `https://entreganewba.com.br/api`  
**Version:** 1.0  
**Last Updated:** 2025-01-24

## Overview

API RESTful para dados de esports CS2, incluindo matches, events, teams, players e estatísticas detalhadas.

**Características:**
- ✅ Real-time data (sem cache)
- ✅ Map vetoes completos (pick/ban process)
- ✅ Player statistics (quando disponível)
- ✅ Head-to-head records
- ✅ 175+ teams com rankings
- ✅ Paginação em todas as listas

---

## Authentication

Atualmente a API é pública (sem autenticação). Implemente rate limiting no seu cliente.

---

## Endpoints

### Matches

#### `GET /api/matches`

Lista matches com filtros opcionais.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | integer | No | Filter by event ID |
| `status` | string | No | Filter by status: `scheduled`, `live`, `finished` |
| `limit` | integer | No | Results per page (default: 20, max: 100) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://api.example.com/api/matches?eventId=14&status=finished&limit=10"
```

**Example Response:**
```json
{
  "matches": [
    {
      "id": 243,
      "externalId": "2387854",
      "event": {
        "id": 14,
        "name": "StarLadder Budapest Major 2025 Stage 1"
      },
      "team1": {
        "id": 194,
        "name": "FaZe",
        "logoUrl": "https://...",
        "rank": 1
      },
      "team2": {
        "id": 173,
        "name": "Lynn Vision",
        "logoUrl": "https://...",
        "rank": 23
      },
      "date": "2025-01-24T10:00:00.000Z",
      "format": "bo1",
      "status": "finished",
      "winnerId": 194,
      "scoreTeam1": 1,
      "scoreTeam2": 0,
      "significance": "Swiss round 1",
      "hasStats": true
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 10
  }
}
```

---

#### `GET /api/matches/:id`

Detalhes completos de um match, incluindo vetoes, maps e player stats.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Match ID |

**Example Request:**
```bash
curl "https://api.example.com/api/matches/243"
```

**Example Response:**
```json
{
  "id": 243,
  "externalId": "2387854",
  "source": "hltv",
  "event": {
    "id": 14,
    "name": "StarLadder Budapest Major 2025 Stage 1"
  },
  "team1": {
    "id": 194,
    "name": "FaZe",
    "logoUrl": "https://...",
    "rank": 1,
    "country": "EU"
  },
  "team2": {
    "id": 173,
    "name": "Lynn Vision",
    "logoUrl": "https://...",
    "rank": 23,
    "country": "CN"
  },
  "date": "2025-01-24T10:00:00.000Z",
  "format": "bo1",
  "status": "finished",
  "winnerId": 194,
  "scoreTeam1": 1,
  "scoreTeam2": 0,
  "significance": "Swiss round 1",
  "hasStats": true,
  "statsLastSyncedAt": "2025-01-24T11:30:00.000Z",
  "winner": {
    "id": 194,
    "name": "FaZe",
    "logoUrl": "https://..."
  },
  "playerOfTheMatch": {
    "id": 789,
    "nickname": "rain",
    "photoUrl": "https://...",
    "country": "NO"
  },
  "vetoes": [
    {
      "order": 1,
      "type": "removed",
      "map": "de_mirage",
      "team": {
        "id": 173,
        "name": "Lynn Vision"
      }
    },
    {
      "order": 2,
      "type": "removed",
      "map": "de_ancient",
      "team": {
        "id": 173,
        "name": "Lynn Vision"
      }
    },
    {
      "order": 3,
      "type": "removed",
      "map": "de_dust2",
      "team": {
        "id": 194,
        "name": "FaZe"
      }
    },
    {
      "order": 7,
      "type": "leftover",
      "map": "de_vertigo",
      "team": null
    }
  ],
  "maps": [
    {
      "mapNumber": 1,
      "mapName": "de_vertigo",
      "team1Score": 13,
      "team2Score": 8,
      "winnerTeamId": 194,
      "halfTeam1Score": 5,
      "halfTeam2Score": 7,
      "overtimeRounds": 0,
      "statsId": 214396
    }
  ],
  "playerStats": [
    {
      "player": {
        "id": 789,
        "nickname": "rain",
        "photoUrl": "https://...",
        "country": "NO"
      },
      "team": {
        "id": 194,
        "name": "FaZe"
      },
      "kills": 25,
      "deaths": 13,
      "assists": 5,
      "adr": 102.3,
      "rating": 1.70,
      "kast": 82.6,
      "hsPercentage": 62.3,
      "flashAssists": 3,
      "impact": 1.45,
      "firstKillsDiff": 5,
      "isPlayerOfTheMatch": true
    }
  ]
}
```

**Notes:**
- `vetoes`: Always 7 items for competitive matches (pick/ban process)
- `maps`: Number of maps = best of X (bo1 = 1 map, bo3 = up to 3 maps)
- `playerStats`: `null` if `hasStats = false`
- `veto.team`: `null` for leftover maps (last map not picked)

---

### Events

#### `GET /api/events`

Lista eventos com filtros.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `ongoing`, `upcoming`, `finished`, `all`, `active` (default: `ongoing`) |
| `limit` | integer | No | Results per page (default: 10) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://api.example.com/api/events?status=ongoing&limit=5"
```

**Example Response:**
```json
{
  "events": [
    {
      "id": 14,
      "externalId": "8504",
      "name": "StarLadder Budapest Major 2025 Stage 1",
      "game": {
        "id": 1,
        "slug": "cs2",
        "name": "Counter-Strike 2"
      },
      "dateStart": "2025-01-20T00:00:00.000Z",
      "dateEnd": "2025-01-27T23:59:59.000Z",
      "prizePool": "$1,250,000",
      "location": "Budapest, Hungary",
      "status": "ongoing",
      "championshipMode": true
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 5
  }
}
```

---

#### `GET /api/events/:externalId`

Detalhes completos de um evento.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `externalId` | string | Yes | Event external ID (ex: "8504") |

**Example Request:**
```bash
curl "https://api.example.com/api/events/8504"
```

**Example Response:**
```json
{
  "id": 14,
  "externalId": "8504",
  "name": "StarLadder Budapest Major 2025 Stage 1",
  "game": {
    "id": 1,
    "slug": "cs2",
    "name": "Counter-Strike 2"
  },
  "dateStart": "2025-01-20T00:00:00.000Z",
  "dateEnd": "2025-01-27T23:59:59.000Z",
  "prizePool": "$1,250,000",
  "location": "Budapest, Hungary",
  "status": "ongoing",
  "championshipMode": true,
  "metadata": {
    "swissData": {
      "standings": {...}
    }
  },
  "participants": [
    {
      "seed": 1,
      "placement": null,
      "prizeMoney": null,
      "team": {
        "id": 194,
        "name": "FaZe",
        "logoUrl": "https://...",
        "rank": 1,
        "country": "EU"
      }
    }
  ],
  "matches": [
    {
      "id": 243,
      "externalId": "2387854",
      "team1": {...},
      "team2": {...},
      "date": "2025-01-24T10:00:00.000Z",
      "format": "bo1",
      "status": "finished",
      "winnerId": 194,
      "scoreTeam1": 1,
      "scoreTeam2": 0,
      "significance": "Swiss round 1"
    }
  ]
}
```

---

#### `GET /api/events/:externalId/swiss`

Sistema Swiss completo (para Major tournaments).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `externalId` | string | Yes | Event external ID |

**Example Request:**
```bash
curl "https://api.example.com/api/events/8504/swiss"
```

**Example Response:**
```json
{
  "event": {
    "id": 14,
    "name": "StarLadder Budapest Major 2025 Stage 1"
  },
  "currentRound": 1,
  "rounds": [
    {
      "roundNumber": 1,
      "buckets": [
        {
          "bucket": "0:0",
          "matches": [
            {
              "id": 243,
              "team1": {...},
              "team2": {...},
              "winner": {...},
              "score": {
                "team1": 1,
                "team2": 0
              },
              "status": "finished",
              "date": "2025-01-24T10:00:00.000Z",
              "team1Record": {"wins": 0, "losses": 0},
              "team2Record": {"wins": 0, "losses": 0}
            }
          ]
        }
      ]
    }
  ],
  "qualified": [],
  "eliminated": []
}
```

---

### Teams

#### `GET /api/teams`

Lista times com rankings.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | boolean | No | Filter active teams (default: true) |
| `withRank` | boolean | No | Only ranked teams (default: false) |
| `limit` | integer | No | Results per page (default: 50) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://api.example.com/api/teams?withRank=true&limit=10"
```

**Example Response:**
```json
{
  "teams": [
    {
      "id": 194,
      "externalId": "6667",
      "name": "FURIA",
      "country": null,
      "logoUrl": "https://...",
      "rank": 1,
      "active": true,
      "game": {
        "id": 1,
        "slug": "cs2",
        "name": "Counter-Strike 2"
      }
    },
    {
      "id": 195,
      "externalId": "10514",
      "name": "Falcons",
      "country": "SA",
      "logoUrl": "https://...",
      "rank": 2,
      "active": true,
      "game": {...}
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 10
  }
}
```

---

#### `GET /api/teams/:id`

Detalhes completos do time com roster, stats e matches recentes.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Team ID |

**Example Request:**
```bash
curl "https://api.example.com/api/teams/194"
```

**Example Response:**
```json
{
  "id": 194,
  "externalId": "6667",
  "name": "FURIA",
  "country": null,
  "logoUrl": "https://...",
  "rank": 1,
  "active": true,
  "game": {
    "id": 1,
    "slug": "cs2",
    "name": "Counter-Strike 2"
  },
  "roster": [
    {
      "role": "awper",
      "joinedAt": "2024-01-15T00:00:00.000Z",
      "player": {
        "id": 456,
        "nickname": "KSCERATO",
        "realName": "Kaike Cerato",
        "country": "BR",
        "photoUrl": "https://..."
      }
    }
  ],
  "stats": {
    "matchesPlayed": 45,
    "wins": 30,
    "losses": 13,
    "draws": 2,
    "winRate": 66.67,
    "mapsPlayed": 112,
    "mapsWon": 68,
    "roundsWon": 1523,
    "roundsLost": 1398,
    "avgRoundDiff": 2.34
  },
  "recentMatches": [
    {
      "id": 243,
      "event": {...},
      "team1": {...},
      "team2": {...},
      "date": "2025-01-24T10:00:00.000Z",
      "status": "finished",
      "winnerId": 194,
      "scoreTeam1": 1,
      "scoreTeam2": 0,
      "result": "win"
    }
  ]
}
```

**Notes:**
- `roster`: Current active roster
- `stats`: All-time statistics (null if not calculated yet)
- `recentMatches`: Last 10 matches
- `result`: `"win"`, `"loss"`, or `"draw"` from this team's perspective

---

#### `GET /api/teams/:id/matches`

Todos os matches de um time com filtros.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Team ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | integer | No | Filter by event |
| `status` | string | No | Filter by status |
| `limit` | integer | No | Results per page (default: 20) |
| `offset` | integer | No | Pagination offset |

**Example Request:**
```bash
curl "https://api.example.com/api/teams/194/matches?status=finished&limit=10"
```

**Example Response:**
```json
{
  "matches": [
    {
      "id": 243,
      "externalId": "2387854",
      "event": {...},
      "team1": {...},
      "team2": {...},
      "date": "2025-01-24T10:00:00.000Z",
      "format": "bo1",
      "status": "finished",
      "winnerId": 194,
      "scoreTeam1": 1,
      "scoreTeam2": 0,
      "significance": "Swiss round 1",
      "result": "win"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 10
  }
}
```

---

#### `GET /api/teams/:id/h2h/:teamId`

Head-to-head record entre dois times.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Team 1 ID |
| `teamId` | integer | Yes | Team 2 ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | integer | No | Filter by specific event (omit for all-time) |

**Example Request:**
```bash
curl "https://api.example.com/api/teams/194/h2h/173"
```

**Example Response:**
```json
{
  "team1Id": 194,
  "team2Id": 173,
  "record": {
    "matchesPlayed": 12,
    "team1Wins": 7,
    "team2Wins": 5,
    "lastMatchDate": "2025-01-24T10:00:00.000Z"
  },
  "recentMatches": [
    {
      "id": 243,
      "event": {...},
      "team1": {...},
      "team2": {...},
      "date": "2025-01-24T10:00:00.000Z",
      "status": "finished",
      "winnerId": 194,
      "scoreTeam1": 1,
      "scoreTeam2": 0
    }
  ]
}
```

---

### Players

> ⚠️ **Note:** Player endpoints estão implementados mas atualmente sem dados devido ao Cloudflare blocking no serviço de sync.

#### `GET /api/players` (Coming Soon)
#### `GET /api/players/:id` (Coming Soon)
#### `GET /api/players/:id/stats` (Coming Soon)

---

## Data Models

### Match Status Values
- `scheduled` - Match agendado, ainda não começou
- `live` - Match em andamento
- `finished` - Match finalizado
- `cancelled` - Match cancelado

### Veto Types
- `removed` - Map banido por um time
- `picked` - Map escolhido por um time
- `leftover` - Map restante (último mapa, não escolhido)

### Event Status Values
- `upcoming` - Evento futuro
- `ongoing` - Evento em andamento
- `finished` - Evento concluído

### Match Format Values
- `bo1` - Best of 1
- `bo3` - Best of 3
- `bo5` - Best of 5

---

## Error Responses

Todas as rotas retornam erros no formato:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

⚠️ **Importante:** Implemente rate limiting no seu cliente para evitar sobrecarga.

**Recomendações:**
- Máximo 100 requests/minuto
- Use caching quando apropriado
- Evite polling agressivo (use intervalos de 30s+)

---

## Examples

### Fetch ongoing Major matches
```javascript
const response = await fetch(
  'https://api.example.com/api/matches?eventId=14&status=live'
);
const data = await response.json();
console.log(data.matches);
```

### Get team's recent performance
```javascript
const teamId = 194;
const team = await fetch(`https://api.example.com/api/teams/${teamId}`).then(r => r.json());
const winRate = team.stats?.winRate || 0;
console.log(`${team.name} win rate: ${winRate}%`);
```

### Check head-to-head before a match
```javascript
const h2h = await fetch(
  'https://api.example.com/api/teams/194/h2h/173'
).then(r => r.json());
console.log(`Record: ${h2h.record.team1Wins}-${h2h.record.team2Wins}`);
```

---

## Support

Para reportar issues ou sugerir melhorias, entre em contato.

**Last Updated:** 2025-01-24
