# Content Generator Guide

Sistema completo de geração automática de conteúdo para redes sociais baseado em eventos de CS2.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Como Usar](#como-usar)
4. [Templates Disponíveis](#templates-disponíveis)
5. [Integração com Crons](#integração-com-crons)
6. [Customização](#customização)
7. [Deploy & Produção](#deploy--produção)

---

## 🎯 Visão Geral

O Content Generator é um sistema modular que:

1. **Detecta eventos** relevantes (matches, upsets, performances)
2. **Gera conteúdo** automaticamente usando templates
3. **Enfileira posts** por prioridade
4. **Publica** em múltiplas plataformas

### Fluxo Completo

```
[Evento CS2] → [Detector] → [Content Generator] → [Queue] → [Publisher] → [Redes Sociais]
```

---

## 🏗️ Arquitetura

### Componentes Principais

#### 1. **Content Generator** (`content-generator.ts`)
- Gerencia templates
- Gera conteúdo a partir de dados
- Valida output
- Suporta multi-plataforma

#### 2. **Content Queue** (`content-queue.ts`)
- Fila com prioridades (high/medium/low)
- Gerencia status (draft/ready/scheduled/published/failed)
- Retry logic
- Cleanup automático

#### 3. **Event Handlers** (`event-handlers.ts`)
- Processa eventos específicos
- Detecta situações especiais (upsets, overtimes)
- Coordena geração de múltiplos posts
- Integra detectors com generator

#### 4. **Templates** (`templates/`)
- Match results
- Upsets
- Player highlights
- Daily recaps
- Event announcements

#### 5. **Visual Generator** (`visual-generator.ts`)
- Usa Playwright para gerar imagens reais
- Templates HTML/CSS embutidos
- Suporta múltiplos formatos e dimensões
- Screenshots em alta qualidade (PNG)
- Dimensões corretas por plataforma:
  - Instagram Feed: 1080x1080
  - Instagram Story: 1080x1920
  - Twitter: 1200x675

### Tipos de Conteúdo

```typescript
Platform: 'instagram' | 'twitter' | 'tiktok' | 'discord' | 'telegram'
Format: 'feed' | 'story' | 'reel' | 'carousel' | 'tweet' | 'thread'
Priority: 'high' | 'medium' | 'low'
Status: 'draft' | 'ready' | 'scheduled' | 'published' | 'failed'
```

---

## 🚀 Como Usar

### Setup Básico

```typescript
import {
  getContentGenerator,
  getContentQueue,
  getVisualGenerator,
  handleMatchFinished,
} from './lib/services/content-generation';

// Inicializar sem geração visual
const generator = getContentGenerator();

// Inicializar COM geração visual
const generatorWithVisuals = getContentGenerator({ generateVisuals: true });

// Visual generator (se precisar usar diretamente)
const visualGenerator = getVisualGenerator();

const queue = getContentQueue();
```

### Exemplo 0: Gerar Imagens Diretamente

```typescript
import { getVisualGenerator } from './lib/services/content-generation';

const visualGenerator = getVisualGenerator();

// Gerar imagem de match result
const visual = await visualGenerator.generate(
  'instagram-match-result-feed',
  {
    team1Name: 'FaZe',
    team1Rank: 3,
    team1Score: 2,
    team2Name: 'Vitality',
    team2Rank: 2,
    team2Score: 1,
    winnerSide: 'left',
    eventName: 'IEM Katowice 2025',
    maps: [
      { name: 'Mirage', team1Score: 16, team2Score: 13 },
      { name: 'Dust2', team1Score: 14, team2Score: 16 },
      { name: 'Inferno', team1Score: 16, team2Score: 14 },
    ],
  },
  'instagram',
  'feed'
);

console.log(`Imagem gerada: ${visual.filePath}`);
// Imagem gerada: /path/to/generated-content/instagram_match_result_feed_123456.png

// Cleanup
await visualGenerator.close();
```

### Exemplo 1: Gerar Conteúdo de Match

```typescript
// Quando um match terminar
const matchData = {
  team1: {
    id: 4608,
    name: 'FaZe',
    logoUrl: 'https://...',
    rank: 3,
  },
  team2: {
    id: 5995,
    name: 'Vitality',
    logoUrl: 'https://...',
    rank: 2,
  },
  winner: { id: 4608, name: 'FaZe' },
  score: { team1: 2, team2: 1 },
  maps: [
    { mapName: 'Mirage', team1Score: 16, team2Score: 13 },
    { mapName: 'Dust2', team1Score: 14, team2Score: 16 },
    { mapName: 'Inferno', team1Score: 16, team2Score: 14 },
  ],
  format: 'bo3',
  event: { name: 'IEM Katowice 2025' },
  matchId: 2378954,
};

// Gera automaticamente: match result + detecta upset/overtime/epic
await handleMatchFinished(matchId, matchData);
```

### Exemplo 2: Daily Recap

```typescript
import { generateDailyRecap } from './lib/jobs/reports/daily-recap';
import { handleDailyRecap } from './lib/services/content-generation';

// Gerar recap
const recap = await generateDailyRecap();

// Gerar conteúdo
await handleDailyRecap(recap);

// Conteúdo está na fila, pronto para publicar
```

### Exemplo 3: Processar Fila

```typescript
import { processContentQueue } from './lib/services/content-generation';

// Função de publicação (você implementa)
const publishContent = async (content: any): Promise<boolean> => {
  switch (content.platform) {
    case 'instagram':
      return await publishToInstagram(content);
    case 'twitter':
      return await publishToTwitter(content);
    default:
      return false;
  }
};

// Processar fila (max 10 itens por vez)
await processContentQueue(publishContent);
```

### Exemplo 4: Gerenciar Fila

```typescript
const queue = getContentQueue();

// Ver estatísticas
const stats = queue.getStats();
console.log(`Total: ${stats.total}`);
console.log(`Ready: ${stats.byStatus.ready}`);
console.log(`High priority: ${stats.byPriority.high}`);

// Filtrar por plataforma
const instagramPosts = queue.getByPlatform('instagram');

// Cleanup itens antigos
queue.cleanup(7); // Remove publicados há mais de 7 dias
```

---

## 📝 Templates Disponíveis

### Match Result

**Plataformas**: Instagram (Feed, Story), Twitter

**Dados necessários**:
- `team1`, `team2` (name, logoUrl, rank)
- `score` (team1, team2)
- `winner`
- `event` (name)
- `matchId`

**Gera**:
- Feed: Match result card com placar e mapas
- Story: Quick update visual
- Tweet: Resultado conciso

### Upset

**Plataformas**: Instagram (Feed, Reel), Twitter

**Dados necessários**:
- `underdog`, `favorite` (name, rank, logoUrl)
- `rankDifference`
- `upsetLevel` (minor/moderate/major/massive)
- `score`
- `matchId`

**Gera**:
- Feed: Dramatic announcement com ranks
- Reel: Video script com buildup e reveal
- Tweet: Quick upset alert

### Player Highlight (TODO)

**Plataformas**: Instagram (Feed, Story), Twitter

**Dados necessários**:
- `player` (nickname, photoUrl)
- `team` (name, logoUrl)
- `stats` (rating, kills, deaths, adr)
- `matchId`

### Daily Recap (TODO)

**Plataformas**: Instagram (Carousel, Stories), Twitter (Thread)

**Dados necessários**:
- `summary` (totalMatches, upsets, etc)
- `topPerformances`
- `matches`

---

## 🔗 Integração com Crons

### Opção 1: No Final do Job

Adicione ao final dos jobs existentes:

```typescript
// Em sync-matches.ts
import { handleMatchFinished } from '../../services/content-generation';

export async function syncMatches(logger: SyncLogger) {
  // ... código existente ...

  // Após sincronizar um match finalizado
  if (match.status === 'finished') {
    await handleMatchFinished(match.id, {
      team1: matchTeam1Data,
      team2: matchTeam2Data,
      winner: winnerData,
      score: { team1: match.scoreTeam1, team2: match.scoreTeam2 },
      maps: mapsData,
      format: match.format,
      event: eventData,
      matchId: match.id,
    });
  }
}
```

### Opção 2: Job Dedicado

Criar novo job que roda periodicamente:

```typescript
// lib/jobs/content/generate-content.ts
import { db } from '../../db/client';
import { matches } from '../../db/schema';
import { handleMatchFinished } from '../../services/content-generation';

export async function generateContentForRecentMatches() {
  // Buscar matches finalizados recentes sem conteúdo gerado
  const recentMatches = await db.query.matches.findMany({
    where: (matches, { eq, and, gte }) => and(
      eq(matches.status, 'finished'),
      gte(matches.date, thirtyMinutesAgo)
    ),
    with: { team1: true, team2: true, event: true }
  });

  for (const match of recentMatches) {
    await handleMatchFinished(match.id, transformMatchData(match));
  }
}
```

Adicionar no `src/index.ts`:

```typescript
// Every 30 minutes - Generate content
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Running generate-content cron...');
  await generateContentForRecentMatches();
});
```

### Opção 3: Content Publishing Cron

Processar a fila regularmente:

```typescript
// Every 15 minutes - Publish content
cron.schedule('*/15 * * * *', async () => {
  console.log('⏰ Running publish-content cron...');
  await processContentQueue(publishToSocialMedia);
});
```

---

## 🎨 Customização

### Criar Novo Template

```typescript
import { ContentTemplate } from '../types';

export const myCustomTemplate: ContentTemplate = {
  id: 'instagram-custom-feed',
  category: 'match-result',
  platform: 'instagram',
  format: 'feed',
  name: 'My Custom Template',
  description: 'Custom match result format',

  requiredFields: ['team1', 'team2', 'score'],

  generate: (data) => {
    return {
      visual: {
        type: 'image',
        template: 'my-custom-design',
        data: {
          // Dados para gerar visual
        },
      },
      text: {
        caption: `Custom caption for ${data.team1.name} vs ${data.team2.name}`,
        hashtags: ['CS2', 'Custom'],
      },
    };
  },
};

// Registrar template
const generator = getContentGenerator();
generator.registerTemplate(myCustomTemplate);
```

### Adicionar Nova Plataforma

```typescript
// 1. Adicionar tipo
type Platform = 'instagram' | 'twitter' | 'tiktok' | 'youtube-shorts';

// 2. Criar templates para plataforma
export const youtubeShortTemplate: ContentTemplate = {
  id: 'youtube-short-upset',
  platform: 'youtube-shorts',
  format: 'reel', // Reutilizar formato reel
  // ... resto do template
};

// 3. Implementar publisher
async function publishToYouTubeShorts(content: any): Promise<boolean> {
  // Implementar upload para YouTube Shorts API
  return true;
}

// 4. Adicionar no processQueue
await processContentQueue(async (content) => {
  if (content.platform === 'youtube-shorts') {
    return await publishToYouTubeShorts(content);
  }
  // ... outras plataformas
});
```

### Customizar Prioridades

```typescript
// Em content-generator.ts, método determinePriority()

private determinePriority(template: ContentTemplate, data: Record<string, any>): ContentPriority {
  // Lógica customizada
  if (data.isChampionshipMatch) {
    return 'high';
  }

  if (data.upsetLevel === 'massive') {
    return 'high';
  }

  if (data.viewerCount > 50000) {
    return 'high';
  }

  return 'medium';
}
```

---

## 📊 Monitoramento

### Queue Stats

```typescript
const queue = getContentQueue();
const stats = queue.getStats();

console.log('Queue Status:');
console.log(`  Total: ${stats.total}`);
console.log(`  Ready: ${stats.byStatus.ready}`);
console.log(`  Published: ${stats.byStatus.published}`);
console.log(`  Failed: ${stats.byStatus.failed}`);
console.log(`  High Priority: ${stats.byPriority.high}`);
```

### Export Queue (Backup)

```typescript
// Exportar para backup
const queueData = queue.export();
fs.writeFileSync('queue-backup.json', JSON.stringify(queueData, null, 2));

// Restaurar de backup
const queueData = JSON.parse(fs.readFileSync('queue-backup.json', 'utf8'));
queue.import(queueData);
```

### Logging

Todos os serviços têm logging integrado:

```
✅ Enqueued content: content_1234_abc (instagram feed)
📝 Updated content_1234_abc status: published
🔄 Retrying content_5678_def (attempt 2/3)
🗑️ Cleaned up 15 old published items
```

---

## 🚀 Deploy & Produção

### Variáveis de Ambiente

```env
# .env
DATABASE_URL=postgresql://...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Social Media APIs
INSTAGRAM_ACCESS_TOKEN=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
```

### Persistence

**Opção 1: In-Memory (Desenvolvimento)**
- Queue vive na memória
- Perdida ao reiniciar
- Rápida e simples

**Opção 2: File-Based (Simples)**
```typescript
// Salvar periodicamente
setInterval(() => {
  const queue = getContentQueue();
  fs.writeFileSync('queue.json', JSON.stringify(queue.export()));
}, 60000); // Cada minuto

// Carregar na inicialização
const queueData = JSON.parse(fs.readFileSync('queue.json'));
queue.import(queueData);
```

**Opção 3: Database (Produção)**
Criar table `content_queue`:
```sql
CREATE TABLE content_queue (
  id VARCHAR PRIMARY KEY,
  platform VARCHAR NOT NULL,
  format VARCHAR NOT NULL,
  priority VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  template_id VARCHAR NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  error TEXT,
  metadata JSONB
);
```

### Escalabilidade

**Para alto volume**:

1. **Job Queue** (ex: Bull, BullMQ)
   - Processar conteúdo em background
   - Retry automático
   - Rate limiting

2. **Redis Cache**
   - Cache de templates compilados
   - Cache de dados de time/player

3. **Separate Publisher Service**
   - Microservice dedicado para publishing
   - Webhook-based trigger
   - Pode escalar independentemente

### Monitoring (Produção)

```typescript
// Adicionar métricas
import { metrics } from './monitoring';

metrics.increment('content.generated', { platform: 'instagram' });
metrics.increment('content.published', { platform: 'instagram', format: 'feed' });
metrics.increment('content.failed', { platform: 'instagram', error: 'api_error' });
metrics.gauge('queue.size', queue.size());
metrics.gauge('queue.high_priority', queue.getByPriority('high').length);
```

---

## 🧪 Testing

### Testar Template

```bash
# Rodar exemplo de integração (sem gerar imagens)
cd /path/to/multistream
npx tsx lib/services/content-generation/examples/integration-example.ts

# Rodar exemplo COM geração de imagens
GENERATE_VISUALS=true npx tsx lib/services/content-generation/examples/integration-example.ts

# Testar geração visual diretamente
npx tsx lib/services/content-generation/examples/test-visual.ts
```

**Output esperado:**
```
✅ Generated visual: instagram_match_result_feed_123.png (1080x1080, 210.92 KB)
✅ Generated visual: instagram_upset_feed_123.png (1080x1080, 330.10 KB)
✅ Generated visual: instagram_match_result_story_123.png (1080x1920, 362.35 KB)

📁 Check the generated-content/ directory for the images.
```

As imagens geradas ficam em: `generated-content/`

### Testar Endpoint Manual

```bash
# Trigger match finished event
curl -X POST http://localhost:3000/trigger/sync-matches

# Gerar daily recap
curl -X POST http://localhost:3000/trigger/daily-recap

# Ver queue stats
curl http://localhost:3000/api/content-queue/stats
```

### Unit Tests (TODO)

```typescript
describe('ContentGenerator', () => {
  it('should generate match result content', () => {
    const generator = new ContentGenerator();
    const content = generator.generate('instagram-match-result-feed', matchData);
    expect(content).toBeTruthy();
    expect(content.platform).toBe('instagram');
  });
});
```

---

## 📚 Próximos Passos

### Curto Prazo
- [ ] Implementar publishers reais (Instagram, Twitter APIs)
- [ ] Adicionar mais templates (player highlights, event previews)
- [x] Criar gerador de imagens (Playwright) ✅

### Médio Prazo
- [ ] Database persistence para queue
- [ ] Scheduling system (publicar em horários específicos)
- [ ] A/B testing de templates
- [ ] Analytics de performance de posts

### Longo Prazo
- [ ] AI-powered captions (GPT integration)
- [ ] Video generation para Reels/TikTok
- [ ] Multi-language support
- [ ] User-generated content moderation

---

## 🆘 Troubleshooting

### Conteúdo não sendo gerado

1. Verificar se evento está sendo triggerado
2. Check logs para erros
3. Verificar required fields no template
4. Validar formato dos dados

### Queue não processando

1. Verificar se há itens com status 'ready'
2. Check se publisher function está retornando true
3. Verificar rate limits das APIs
4. Check logs de erro

### Template não encontrado

```typescript
const generator = getContentGenerator();
console.log('Available templates:', Array.from(generator.templates.keys()));
```

---

## 📞 Suporte

- **Docs**: Este arquivo
- **Examples**: `lib/services/content-generation/examples/`
- **Types**: `lib/services/content-generation/types.ts`

---

## 📄 Documentação Adicional

- **[VISUAL_GENERATOR_README.md](./VISUAL_GENERATOR_README.md)** - Guia completo do sistema de geração de imagens

---

**Status**: ✅ Sistema pronto para uso (incluindo Visual Generator!)
**Última atualização**: 23 Nov 2025
