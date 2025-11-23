# 🎯 Swiss Bracket - Bucket Inference System

## 📝 Problema Resolvido

No sistema Swiss, matches futuros (scheduled/TBD) precisam mostrar os buckets corretos mesmo sem terem sido jogados. O sistema anterior mostrava todos como "0:0" porque o `TeamRecordTracker` só atualiza records de matches finalizados.

## ✅ Solução Implementada

Sistema de **duas passadas** (two-pass) que processa os matches:

### 1️⃣ Primeira Passada - Detecção de Rounds
```typescript
// Detecta rounds baseado em:
// - Record changes (wins + losses aumenta)
// - Time gaps (>12 horas entre matches)
validMatches.forEach((match) => {
  // Calcula se é um novo round
  // Adiciona match com roundNumber
  matchesWithRounds.push({ ...match, roundNumber });
});
```

### 2️⃣ Segunda Passada - Inferência de Buckets

**Para matches finalizados:**
```typescript
if (match.status === 'finished' && !isTBDMatch) {
  // Usa tracker real (records atualizados)
  team1Record = tracker.getRecord(match.team1Id);
  team2Record = tracker.getRecord(match.team2Id);
  bucketKey = `${team1Record.wins}:${team1Record.losses}`;
}
```

**Para matches scheduled/TBD:**
```typescript
else {
  // Infere bucket do round number
  const roundNumber = match.roundNumber;

  // Calcula buckets possíveis do round
  // Round 1: [0:0]
  // Round 2: [1:0, 0:1]
  // Round 3: [2:0, 1:1, 0:2]
  // Round 4: [3:0, 2:1, 1:2, 0:3]
  const possibleBuckets: string[] = [];
  for (let wins = 0; wins < 3; wins++) {
    const losses = roundNumber - 1 - wins;
    if (losses >= 0 && losses < 3) {
      possibleBuckets.push(`${wins}:${losses}`);
    }
  }

  // Distribui matches pelos buckets baseado na posição
  const matchesInRound = matchesWithRounds.filter(m => m.roundNumber === match.roundNumber);
  const matchIndex = matchesInRound.findIndex(m => m.id === match.id);
  const matchesPerBucket = Math.ceil(totalMatchesInRound / bucketsCount);
  const bucketIndex = Math.floor(matchIndex / matchesPerBucket);

  bucketKey = possibleBuckets[bucketIndex];
}
```

---

## 📊 Resultado

### Exemplo: StarLadder Budapest Major 2025 Stage 1 (Event ID: 8504)

```json
{
  "totalRounds": 4,
  "rounds": [
    {
      "roundNumber": 1,
      "buckets": [
        {
          "bucket": "0:0",
          "matches": [...] // 16 matches
        }
      ]
    },
    {
      "roundNumber": 2,
      "buckets": [
        {
          "bucket": "1:0",
          "matches": [...] // 4 matches (winners)
        },
        {
          "bucket": "0:1",
          "matches": [...] // 4 matches (losers)
        }
      ]
    },
    {
      "roundNumber": 3,
      "buckets": [
        {
          "bucket": "2:0",
          "matches": [...] // 2 matches
        },
        {
          "bucket": "1:1",
          "matches": [...] // 2 matches
        },
        {
          "bucket": "0:2",
          "matches": [...] // 2 matches
        }
      ]
    },
    {
      "roundNumber": 4,
      "buckets": [
        {
          "bucket": "2:1",
          "matches": [...] // 1 match
        },
        {
          "bucket": "1:2",
          "matches": [...] // 2 matches
        }
      ]
    }
  ]
}
```

---

## 🔄 Fluxo de Dados

```
1. Fetch matches do banco (incluindo TBD)
   ↓
2. Primeira Passada:
   - Detecta rounds baseado em record + time gap
   - Cria array matchesWithRounds[]
   ↓
3. Segunda Passada:
   - Para finished: Usa tracker real
   - Para scheduled: Infere bucket do roundNumber
   ↓
4. Organiza em estrutura de rounds/buckets
   ↓
5. Retorna JSON para frontend
```

---

## 🎨 Layout no Frontend

```
┌────────────────────────────────────────────────────────────┐
│  ROUND 1 (0:0)        ROUND 2-4          QUALIFIED/ELIM    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  16 teams          ┌─ 1:0 (4 matches)   ┌─ 3:0 (Green)    │
│  ├─ Match 1        │                     │  ├─ Team A      │
│  ├─ Match 2        ├─ 0:1 (4 matches)   │  ├─ Team B      │
│  ├─ Match 3        │                     │                 │
│  ├─ ...            ├─ 2:0 (2 matches)   ├─ 3:1 (Green)    │
│  └─ Match 16       │                     │  ├─ Team C      │
│                    ├─ 1:1 (2 matches)   │                 │
│                    │                     ├─ 3:2 (Green)    │
│                    ├─ 0:2 (2 matches)   │  ├─ Team D      │
│                    │                     │                 │
│                    ├─ 2:1 (1 match)     └─ 0:3 (Red)      │
│                    │                        ├─ Team E      │
│                    └─ 1:2 (2 matches)      └─ ...         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Arquivos Modificados

### `/app/api/events/[externalId]/swiss/route.ts`

**Mudanças principais:**

1. **Linha 191**: `const tracker` → `let tracker` (permite reassign)

2. **Linhas 198-237**: Primeira passada - detecção de rounds
   ```typescript
   const matchesWithRounds: Array<typeof validMatches[0] & { roundNumber: number }> = [];
   validMatches.forEach((match) => {
     // Detecta rounds
     matchesWithRounds.push({ ...match, roundNumber: currentRoundNumber });
   });
   ```

3. **Linhas 240**: Reset tracker para segunda passada
   ```typescript
   tracker = new TeamRecordTracker();
   ```

4. **Linhas 242-332**: Segunda passada - inferência de buckets
   ```typescript
   matchesWithRounds.forEach((match) => {
     if (match.status === 'finished' && !isTBDMatch) {
       // Usa tracker real
     } else {
       // Infere bucket do roundNumber
     }
   });
   ```

---

## ✅ Testes

### Teste 1: Verificar buckets
```bash
curl -s "http://localhost:3000/api/events/8504/swiss" | jq '{
  totalRounds: .totalRounds,
  round1_buckets: .rounds[0].buckets | map(.bucket),
  round2_buckets: .rounds[1].buckets | map(.bucket),
  round3_buckets: .rounds[2].buckets | map(.bucket),
  round4_buckets: .rounds[3].buckets | map(.bucket)
}'
```

**Resultado esperado:**
```json
{
  "totalRounds": 4,
  "round1_buckets": ["0:0"],
  "round2_buckets": ["1:0", "0:1"],
  "round3_buckets": ["2:0", "1:1", "0:2"],
  "round4_buckets": ["2:1", "1:2"]
}
```

### Teste 2: Verificar records dos matches
```bash
curl -s "http://localhost:3000/api/events/8504/swiss" | jq '.rounds[1].buckets[] | {
  bucket: .bucket,
  matches: .matches | map({
    team1: .team1.name,
    team1Record: .team1Record,
    team2Record: .team2Record
  })
}' | head -20
```

**Resultado esperado:**
```json
{
  "bucket": "1:0",
  "matches": [
    {
      "team1": "TBD",
      "team1Record": {"wins": 1, "losses": 0},
      "team2Record": {"wins": 1, "losses": 0}
    }
  ]
}
```

---

## 🔍 Lógica de Inferência

### Como o sistema decide o bucket?

1. **Identifica o round**: Baseado em record changes + time gaps
2. **Calcula buckets possíveis**: Round N tem buckets onde `wins + losses = N - 1`
3. **Distribui matches**: Assume que matches são agrupados por bucket no HLTV
4. **Atribui bucket**: Baseado na posição do match dentro do round

### Exemplo prático:

```
Round 3 (16 matches scheduled):
- Possible buckets: [2:0, 1:1, 0:2]
- Total buckets: 3
- Matches per bucket: 16 / 3 ≈ 6

Distribuição:
- Matches 0-5:   bucket "2:0"
- Matches 6-11:  bucket "1:1"
- Matches 12-15: bucket "0:2"
```

---

## 📝 Limitações

1. **Assume ordem correta no HLTV**: Se o HLTV não agrupar matches por bucket, a inferência pode ficar incorreta
2. **Não funciona para estruturas não-padrão**: Assume formato Swiss clássico (3 wins = qualified, 3 losses = eliminated)
3. **Depende de time gaps**: Detecção de rounds usa gap de 12 horas, pode não funcionar para eventos com schedule diferente

---

## 🔄 Integração com Cron Service

O cron service (`/cron-service`) sincroniza matches a cada 10 minutos do HLTV:

```typescript
// cron-service/src/index.ts
cron.schedule('*/10 * * * *', async () => {
  const championshipEventId = process.env.CHAMPIONSHIP_EVENT_ID;
  await syncMatches(logger, false, championshipEventId);
});
```

**Configuração:**
```bash
# cron-service/.env
CHAMPIONSHIP_EVENT_ID=14  # StarLadder Budapest Major 2025 Stage 1
```

Quando novos matches são adicionados ou atualizados, o sistema:
1. Salva no banco com `team1Id`, `team2Id` nullable (para TBD)
2. Frontend consulta `/api/events/8504/swiss`
3. Endpoint aplica inferência de buckets
4. Frontend renderiza Swiss bracket completo

---

## 🎯 Benefícios

✅ **Buckets corretos**: Matches scheduled mostram bucket certo (1:0, 0:1, etc.)
✅ **Suporta TBD**: Times não definidos aparecem como "TBD" com bucket inferido
✅ **Performance**: Duas passadas eficientes, sem queries extras
✅ **Manutenível**: Lógica clara e separada (finished vs scheduled)
✅ **Testável**: Fácil validar buckets via API

---

## 📚 Referências

- [MATCHES_SYSTEM.md](./MATCHES_SYSTEM.md) - Documentação geral do sistema
- [FRONTEND_API.md](./FRONTEND_API.md) - API reference para frontend
- [MATCHES_ENDPOINT_IMPLEMENTATION.md](./MATCHES_ENDPOINT_IMPLEMENTATION.md) - Implementação do endpoint de matches

---

**Implementado em**: 2025-11-23
**Status**: ✅ Funcionando
**Versão**: 1.0.0
