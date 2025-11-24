# Visual Generator - Sistema de Geração de Imagens

Sistema completo de geração automática de imagens para redes sociais usando Playwright.

---

## ✨ Features

- ✅ **Geração Automática**: Integrado com Content Generator
- ✅ **Templates HTML/CSS**: Designs bonitos e modernos
- ✅ **Multi-formato**: Feed, Story, Reel, Tweet
- ✅ **Multi-plataforma**: Instagram, Twitter, TikTok
- ✅ **Alta Qualidade**: PNG com dimensões otimizadas
- ✅ **Playwright**: Usa browser headless para screenshots

---

## 🎨 Templates Disponíveis

### 1. Match Result (Resultado de Partida)

**Formatos:**
- Instagram Feed (1080x1080)
- Instagram Story (1080x1920)
- Twitter (1200x675)

**Features:**
- Times com logos e ranks
- Placar destacado (vencedor em verde)
- Lista de mapas com scores
- Badge do evento
- Coroa no vencedor

**Exemplo:**
```typescript
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
```

### 2. Upset (Zebra/Surpresa)

**Formatos:**
- Instagram Feed (1080x1080)
- Instagram Story (1080x1920)
- Twitter (1200x675)

**Features:**
- Background gradient baseado na intensidade
- Badge animado "MAJOR UPSET"
- Underdog com glow effect
- Diferença de ranks destacada
- 4 níveis de intensidade: minor, moderate, major, massive

**Exemplo:**
```typescript
const visual = await visualGenerator.generate(
  'instagram-upset-feed',
  {
    underdogName: 'MOUZ',
    underdogRank: 15,
    favoriteName: 'FaZe',
    favoriteRank: 3,
    rankDifference: 12,
    upsetLevel: 'major',
    score: '2-1',
  },
  'instagram',
  'feed'
);
```

---

## 🚀 Como Usar

### Opção 1: Integrado com Content Generator

```typescript
import { getContentGenerator, handleMatchFinished } from './lib/services/content-generation';

// Inicializar COM geração visual
const generator = getContentGenerator({ generateVisuals: true });

// Gerar conteúdo + imagens automaticamente
await handleMatchFinished(matchId, matchData);

// As imagens serão geradas automaticamente!
// Acesse via item.data.generated.visual.filePath
```

### Opção 2: Usar Diretamente

```typescript
import { getVisualGenerator } from './lib/services/content-generation';

const visualGenerator = getVisualGenerator();

// Gerar uma imagem
const visual = await visualGenerator.generate(
  'instagram-match-result-feed',
  data,
  'instagram',
  'feed'
);

console.log(`Imagem: ${visual.filePath}`);
console.log(`Tamanho: ${visual.width}x${visual.height}`);
console.log(`Arquivo: ${(visual.size / 1024).toFixed(2)} KB`);

// Cleanup
await visualGenerator.close();
```

### Opção 3: Gerar HTML Customizado

```typescript
const visualGenerator = getVisualGenerator();

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 1080px;
      height: 1080px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: white;
      font-size: 72px;
    }
  </style>
</head>
<body>
  <h1>Hello CS2!</h1>
</body>
</html>
`;

const visual = await visualGenerator.generateFromHTML(
  html,
  'instagram',
  'feed',
  'custom-post'
);
```

---

## 📐 Dimensões por Plataforma

```typescript
instagram: {
  feed: 1080x1080 (quadrado)
  story: 1080x1920 (vertical)
  reel: 1080x1920 (vertical)
}

twitter: {
  tweet: 1200x675 (16:9)
}

tiktok: {
  reel: 1080x1920 (vertical)
}
```

---

## 🎨 Customização

### Criar Novo Template HTML

Edite `visual-generator.ts` e adicione um novo método `render*Template()`:

```typescript
private renderMyCustomTemplate(data: any, width: number, height: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: ${width}px;
      height: ${height}px;
      /* Seus estilos aqui */
    }
  </style>
</head>
<body>
  <!-- Seu HTML aqui -->
  <h1>${data.title}</h1>
</body>
</html>
  `;
}
```

Depois adicione no método `renderTemplate()`:

```typescript
if (templateId.includes('my-custom')) {
  return this.renderMyCustomTemplate(data, width, height);
}
```

### Mudar Qualidade da Imagem

```typescript
const visualGenerator = getVisualGenerator({
  quality: 100, // 0-100 (default: 95)
});
```

### Mudar Diretório de Output

```typescript
const visualGenerator = getVisualGenerator({
  outputDir: '/custom/path/images',
});
```

### Debug Mode (ver browser)

```typescript
const visualGenerator = getVisualGenerator({
  debug: true, // Mostra browser enquanto gera
});
```

---

## 🧪 Testing

### Teste Rápido

```bash
# Testar geração visual
npx tsx lib/services/content-generation/examples/test-visual.ts

# Output:
# ✅ Generated visual: instagram_match_result_feed_123.png (1080x1080, 210.92 KB)
# ✅ Generated visual: instagram_upset_feed_123.png (1080x1080, 330.10 KB)
# ✅ Generated visual: instagram_match_result_story_123.png (1080x1920, 362.35 KB)
```

### Teste Completo com Workflow

```bash
# Sem geração visual
npx tsx lib/services/content-generation/examples/integration-example.ts

# COM geração visual
GENERATE_VISUALS=true npx tsx lib/services/content-generation/examples/integration-example.ts
```

### Ver Imagens Geradas

```bash
ls -lh generated-content/

# Output:
# -rw-r--r--  211K instagram_match_result_feed_123.png
# -rw-r--r--  362K instagram_match_result_story_123.png
# -rw-r--r--  330K instagram_upset_feed_123.png
```

---

## 🎯 Exemplos de Uso

### Exemplo 1: Gerar posts de match automaticamente

```typescript
import { getContentGenerator, getContentQueue } from './lib/services/content-generation';

const generator = getContentGenerator({ generateVisuals: true });
const queue = getContentQueue();

// Quando um match terminar
const matchData = {
  team1: { name: 'FaZe', rank: 3 },
  team2: { name: 'Vitality', rank: 2 },
  winner: { name: 'FaZe' },
  score: { team1: 2, team2: 1 },
  maps: [/* ... */],
};

const trigger = {
  event: 'match.finished',
  data: matchData,
  timestamp: new Date(),
};

// Gera 3 posts automaticamente (Feed + Story + Tweet)
const content = await generator.generateFromTrigger(trigger);
queue.enqueueBatch(content);

// Cada item tem:
// - item.data.generated.visual.filePath
// - item.data.generated.visual.dimensions
// - item.data.generated.text.caption
```

### Exemplo 2: Gerar upset alert

```typescript
const upsetData = {
  underdog: { name: 'MOUZ', rank: 15 },
  favorite: { name: 'FaZe', rank: 3 },
  rankDifference: 12,
  upsetLevel: 'major',
  score: { team1: 2, team2: 1 },
};

const trigger = {
  event: 'upset.detected',
  data: upsetData,
  timestamp: new Date(),
  priority: 'high',
};

const content = await generator.generateFromTrigger(trigger);
// Gera posts com visual dramático em vermelho!
```

### Exemplo 3: Batch generation

```typescript
const visualGenerator = getVisualGenerator();

const matches = [
  { team1: 'FaZe', team2: 'Vitality', score: '2-1' },
  { team1: 'NAVI', team2: 'G2', score: '2-0' },
  { team1: 'Liquid', team2: 'Heroic', score: '1-2' },
];

for (const match of matches) {
  await visualGenerator.generate(
    'instagram-match-result-feed',
    match,
    'instagram',
    'feed'
  );
}

await visualGenerator.close();
```

---

## 🔧 Troubleshooting

### Erro: "Failed to launch browser"

**Solução**: Instalar dependências do Playwright:

```bash
npx playwright install chromium
```

### Erro: "Permission denied"

**Solução**: Verificar permissões da pasta `generated-content/`:

```bash
mkdir -p generated-content
chmod 755 generated-content
```

### Imagens não estão sendo geradas

**Verificar**:

1. `generateVisuals` está como `true`?
2. Playwright está instalado?
3. Pasta `generated-content/` existe?

### Imagens ficam em branco

**Verificar**:

1. Template tem dados corretos?
2. Aumentar `waitForTimeout` em `visual-generator.ts` (linha ~100)

---

## 📊 Performance

**Tempos médios de geração:**

- Match Result Feed (1080x1080): ~1.5s
- Upset Feed (1080x1080): ~1.6s
- Story (1080x1920): ~1.7s

**Tamanhos de arquivo:**

- Feed Posts: ~200-350 KB
- Story Posts: ~350-400 KB

**Otimizações:**

- Browser reusado entre gerações (não reinicia)
- Timeout de 1s para garantir fontes carregadas
- PNG com qualidade 95 (balanceado)

---

## 🚀 Produção

### Salvar em Cloud Storage

```typescript
import { uploadToS3 } from './utils/storage';

const visual = await visualGenerator.generate(/*...*/);

// Upload para S3/GCS/etc
const url = await uploadToS3(visual.filePath);

// Usar URL no post
item.data.generated.visual.url = url;
```

### Cleanup Automático

```typescript
// Limpar imagens antigas (> 7 dias)
import * as fs from 'fs';
import * as path from 'path';

const cleanOldImages = (days: number = 7) => {
  const dir = 'generated-content';
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
    }
  });
};
```

---

## 📚 Arquitetura

```
VisualGenerator
├── Browser (Playwright Chromium)
│   └── Page
│       └── setContent(HTML)
│       └── screenshot()
│
├── Templates HTML/CSS
│   ├── renderMatchResultTemplate()
│   ├── renderUpsetTemplate()
│   └── renderPlayerHighlightTemplate()
│
└── Output
    └── generated-content/*.png
```

**Fluxo:**

1. Template ID + Data → `generate()`
2. Determinar dimensões (platform + format)
3. Render HTML template com data
4. Criar página no browser
5. Load HTML + wait 1s
6. Screenshot → PNG
7. Retornar file path + metadata

---

## ✅ Status

**Implementado:**
- ✅ Visual Generator service
- ✅ Match result template (Feed, Story, Tweet)
- ✅ Upset template (Feed, Story, Tweet)
- ✅ Integração com Content Generator
- ✅ Testes e exemplos
- ✅ Multi-formato (1080x1080, 1080x1920, 1200x675)

**TODO:**
- [ ] Player highlight template
- [ ] Daily recap carousel template
- [ ] Video generation (Reels)
- [ ] Logos de times reais (fetch from API)
- [ ] Animações (GIF/WebP)

---

**Última atualização**: 23 Nov 2025
**Status**: ✅ Produção Ready
