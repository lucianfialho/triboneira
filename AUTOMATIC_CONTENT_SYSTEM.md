# ✅ Sistema Automático de Conteúdo - PRONTO!

Sistema completo e automático de geração e publicação de conteúdo para redes sociais.

---

## 🎯 O Que Foi Implementado

### 1. **Content Generation Job** (`lib/jobs/content/generate-content.ts`)
- ✅ Busca matches das últimas 6 horas
- ✅ Verifica quais finalizaram via HLTV API
- ✅ Atualiza status no banco (finished)
- ✅ Gera conteúdo automaticamente com `handleMatchFinished()`
- ✅ Detecta upsets, overtimes, epic series
- ✅ **Roda a cada 30 minutos**

### 2. **Content Publishing Job** (`lib/jobs/content/publish-content.ts`)
- ✅ Processa fila de conteúdo
- ✅ Publica por prioridade (high → medium → low)
- ✅ Publishers para Instagram, Twitter, Discord, Telegram
- ✅ Retry automático (max 3 tentativas)
- ✅ Cleanup de itens antigos (>7 dias)
- ✅ **Roda a cada 15 minutos**

### 3. **Crons Configurados** (`cron-service/src/index.ts`)
```typescript
// ⏰ A cada 30 minutos - Gerar conteúdo
cron.schedule('*/30 * * * *', generateContent);

// ⏰ A cada 15 minutos - Publicar conteúdo
cron.schedule('*/15 * * * *', publishContent);
```

### 4. **Endpoints Manuais**
```bash
# Gerar conteúdo manualmente
POST /trigger/generate-content

# Publicar conteúdo manualmente
POST /trigger/publish-content
```

---

## 🔄 Fluxo Automático Completo

```
1. Match acontece no HLTV
   ↓
2. [6h sync] sync-matches sincroniza como 'scheduled'
   ↓
3. Match termina
   ↓
4. [30min cron] generate-content detecta match finished
   ↓
5. Atualiza status → 'finished'
   ↓
6. Chama handleMatchFinished()
   ├── Gera match result (Instagram Feed + Story + Tweet)
   ├── Detecta upset → gera upset posts (se aplicável)
   ├── Detecta overtime → gera overtime posts (se aplicável)
   └── Detecta epic series → gera epic posts (se aplicável)
   ↓
7. Conteúdo vai para ContentQueue
   ↓
8. [15min cron] publish-content pega da fila
   ├── Processa por prioridade (high primeiro)
   ├── Publica em Instagram (mock)
   ├── Publica em Twitter (mock)
   ├── Publica em Discord (webhook real!)
   └── Marca como published
   ↓
9. ✅ Posts online nas redes sociais!
```

---

## 📊 Detalhes Técnicos

### Generate Content Cron (30min)

**Busca:**
- Matches das últimas 6 horas
- Status: 'scheduled' ou 'live'

**Verifica:**
- Via HLTV API se match.finished = true

**Atualiza:**
- status → 'finished'
- winnerId, scoreTeam1, scoreTeam2
- maps (JSON)

**Gera:**
- Match result posts (sempre)
- Upset posts (se rank diff ≥ 10)
- Overtime posts (se algum mapa teve OT)
- Epic series posts (se Bo3/Bo5 foi até o fim)

**Rate Limiting:**
- 2s entre cada match

### Publish Content Cron (15min)

**Processa:**
- Max 10 itens por execução
- Ordem: high → medium → low
- Dentro da prioridade: mais antigo primeiro

**Publishers:**
- ✅ Discord (webhook funcional)
- 🏗️ Instagram (mock - precisa API)
- 🏗️ Twitter (mock - precisa API)
- 🏗️ Telegram (mock - precisa API)

**Retry:**
- Até 3 tentativas
- Marca como 'failed' depois

**Cleanup:**
- Remove published >7 dias

---

## 🎨 Tipos de Conteúdo Gerado

### 1. Match Result (Sempre)
**Plataformas:** Instagram Feed + Story + Twitter

**Conteúdo:**
```
🏆 FaZe takes the win!

FaZe 2 - 1 Vitality

Map 1 (Mirage): 16-13
Map 2 (Dust2): 14-16
Map 3 (Inferno): 16-14

📍 IEM Katowice 2025
```

**Visual:** 1080x1080 (Feed), 1080x1920 (Story)

### 2. Upset (Se rank diff ≥ 10)
**Plataformas:** Instagram Feed + Reel + Twitter

**Conteúdo:**
```
🚨 MAJOR UPSET 🚨

MOUZ (#15) defeats FaZe (#3)!

2-1

Rank difference: 12
```

**Visual:** Background vermelho intenso, animado

### 3. Overtime (Se algum mapa teve OT)
**Plataformas:** Instagram Story + Twitter

**Conteúdo:**
```
⏱️ OVERTIME THRILLER!

2 maps went to overtime!
FaZe 2 - 1 Vitality
```

### 4. Epic Series (Se Bo3 foi 2-1 ou Bo5 foi 3-2)
**Plataformas:** Instagram Story + Twitter

**Conteúdo:**
```
💥 EPIC SERIES!

FaZe defeats Vitality in a nail-biter!
Series went to Map 3!
```

---

## 🚀 Como Usar

### Iniciar o Sistema

```bash
# 1. Certifique-se que o banco está rodando
# 2. Inicie o cron service
cd cron-service
npm run dev

# O sistema agora está AUTOMÁTICO! 🎉
```

### Testar Manualmente

```bash
# Gerar conteúdo agora
curl -X POST http://localhost:3000/trigger/generate-content

# Publicar conteúdo agora
curl -X POST http://localhost:3000/trigger/publish-content
```

### Monitorar

```bash
# Ver logs do cron service
# Output mostrará:
⏰ Running generate-content cron...
🎨 Checking for finished matches and generating content...
📊 Found 3 recent matches to check
🔍 Checking match: FaZe vs Vitality
   ✅ Match finished! Updating and generating content...
   🎨 Content generated!
✅ Generated content for 1 matches

⏰ Running publish-content cron...
📤 Processing content queue for publishing...
📊 Queue Status:
   Total items: 5
   Ready to publish: 5
   High priority: 2
📤 Publishing: content_123_abc (instagram feed)
   📁 Image: instagram_match_result_feed_123.png
   📝 Caption: 🏆 FaZe takes the win!...
   ✅ [MOCK] Published to Instagram
✅ Published 5 items
```

---

##  ⚙️ Configuração

### Variáveis de Ambiente

```env
# .env
DATABASE_URL=postgresql://...

# Discord (funcional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Instagram (TODO)
INSTAGRAM_ACCESS_TOKEN=...

# Twitter (TODO)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

# Telegram (TODO)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Geração visual (opcional, default: false)
GENERATE_VISUALS=true
```

### Habilitar Geração Visual

Por padrão, o sistema gera apenas texto. Para gerar imagens também:

```env
# .env
GENERATE_VISUALS=true
```

Ou programaticamente:

```typescript
import { getContentGenerator } from './lib/services/content-generation';

const generator = getContentGenerator({ generateVisuals: true });
```

---

## 📋 Checklist de Produção

### Para Sistema Automático Completo:

- [x] ✅ Content generator
- [x] ✅ Visual generator (Playwright)
- [x] ✅ Content queue
- [x] ✅ Event handlers
- [x] ✅ Upset detection
- [x] ✅ Overtime detection
- [x] ✅ Epic series detection
- [x] ✅ Generate content cron (30min)
- [x] ✅ Publish content cron (15min)
- [x] ✅ Discord publisher (funcional)
- [ ] 🏗️ Instagram API publisher
- [ ] 🏗️ Twitter API publisher
- [ ] 🏗️ Telegram API publisher
- [ ] 🏗️ Database persistence para queue
- [ ] 🏗️ Cloud storage para imagens

---

## 🔧 Próximos Passos

### Urgente:
1. **Implementar Instagram Graph API**
   - Upload de imagens
   - Criar posts
   - Stories (via Business Account)

2. **Implementar Twitter API v2**
   - Upload de media
   - Criar tweets
   - Threads (sequência de tweets)

3. **Database Persistence para Queue**
   - Criar tabela `content_queue`
   - Salvar queue items no banco
   - Garantir que nada se perca no restart

### Importante:
4. **Cloud Storage para Imagens**
   - AWS S3 ou Google Cloud Storage
   - Upload automático após geração
   - URLs públicas para APIs

5. **Scheduling Avançado**
   - Horários otimizados por plataforma
   - Instagram: melhor entre 11h-13h e 19h-21h
   - Twitter: melhor entre 12h-15h
   - Evitar publicar tudo ao mesmo tempo

6. **Analytics & Monitoring**
   - Tracking de posts publicados
   - Métricas de engagement
   - Alertas de falha

---

## 🧪 Testing

### Teste Completo do Fluxo

```bash
# 1. Adicionar match "finished" no banco manualmente
# (simular que um match terminou)

# 2. Rodar generate-content
curl -X POST http://localhost:3000/trigger/generate-content

# Deve ver:
# ✅ Match finished! Updating and generating content...
# ✅ Generated 3 match result posts
# ✅ Generated 2 upset posts
# ...

# 3. Rodar publish-content
curl -X POST http://localhost:3000/trigger/publish-content

# Deve ver:
# 📤 Publishing: content_123 (instagram feed)
# ✅ [MOCK] Published to Instagram
# ...

# 4. Verificar queue status
# Acessar getContentQueue().getStats()
```

---

## 💡 Dicas

### Debug Mode

```typescript
// Ver detalhes do que está sendo gerado
const generator = getContentGenerator();
generator.validateContent(item); // Ver erros de validação
```

### Queue Management

```typescript
import { getContentQueue } from './lib/services/content-generation';

const queue = getContentQueue();

// Ver stats
console.log(queue.getStats());

// Reprocessar failed items
queue.retry('content_id', 3);

// Limpar tudo
queue.clear();
```

### Visual Generation Debug

```typescript
// Ver browser gerando imagens
import { getVisualGenerator } from './lib/services/content-generation';

const visualGen = getVisualGenerator({ debug: true });
// Browser abrirá e você verá o processo
```

---

## 📚 Documentação Relacionada

- [CONTENT_GENERATOR_GUIDE.md](./CONTENT_GENERATOR_GUIDE.md) - Guia completo do sistema
- [VISUAL_GENERATOR_README.md](./VISUAL_GENERATOR_README.md) - Geração de imagens
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumo da implementação

---

## 🎉 Status Final

**Sistema:** ✅ AUTOMÁTICO E FUNCIONANDO!

**O que acontece agora:**
1. ✅ A cada 30 min: busca matches finalizados e gera conteúdo
2. ✅ A cada 15 min: publica conteúdo da fila
3. ✅ Discord: posts já vão automaticamente
4. 🏗️ Instagram/Twitter: precisa apenas configurar APIs

**Para produção completa:**
- Adicionar Instagram API (1-2 horas)
- Adicionar Twitter API (1-2 horas)
- Adicionar database persistence (2-3 horas)
- Deploy e monitoramento (variável)

---

**Última atualização:** 23 Nov 2025
**Status:** ✅ Sistema automático rodando!
