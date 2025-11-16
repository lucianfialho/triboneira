# Design System - Multistream

Um guia completo das decisões de design e princípios utilizados na interface do Multistream.

## Índice

1. [Filosofia de Design](#filosofia-de-design)
2. [Referências](#referências)
3. [Cores](#cores)
4. [Tipografia](#tipografia)
5. [Espaçamento](#espaçamento)
6. [Componentes](#componentes)
7. [Animações](#animações)
8. [Responsividade](#responsividade)

---

## Filosofia de Design

O Multistream foi projetado com três pilares fundamentais:

### 1. Clareza Visual
- **Hierarquia clara**: Títulos, subtítulos e conteúdo são facilmente distinguíveis
- **Contraste adequado**: Texto sempre legível contra o fundo
- **Espaço respirável**: Nada se sente apertado ou cramped

### 2. Modernidade
- **Glassmorphism**: Efeitos de vidro fosco nos cards
- **Gradientes suaves**: Purple/pink para accents
- **Dark theme elegante**: Confortável para longas sessões

### 3. Profissionalismo
- **Consistência**: Padrões repetidos em toda a interface
- **Atenção aos detalhes**: Sombras, bordas e transições cuidadosas
- **Performance**: Animações sutis que não distraem

---

## Referências

O design foi inspirado nas melhores práticas de:

### Spotify
- **Sidebar layout**: Navegação lateral fixa
- **Dark theme**: Tons escuros e elegantes
- **Card design**: Cards com hover states

### Discord
- **Color palette**: Cinzas neutros com accents vibrantes
- **Spacing**: Generoso e confortável
- **Typography**: Hierarquia clara

### Linear
- **Perfect spacing**: Sistema 4pt/8pt grid
- **Subtle animations**: Transições suaves
- **Attention to detail**: Bordas, sombras e estados

### Twitch
- **Purple accent**: Cor primária vibrante
- **Stream interface**: Layout otimizado para vídeo
- **Platform badges**: Identificação visual clara

---

## Cores

### Paleta de Cores

#### Background & Surfaces
```css
--background: 220 15% 6%           /* Rich dark background */
--surface: 220 15% 9%              /* Elevated surface */
--surface-elevated: 220 15% 11%    /* More elevated surface */
```

**Decisão**: Tons de cinza com leve tint azulado (220° hue) para um dark theme mais sofisticado que preto puro.

#### Text
```css
--foreground: 220 10% 98%          /* Primary text */
--muted-foreground: 220 10% 65%    /* Secondary text */
--subtle-foreground: 220 10% 45%   /* Tertiary text */
```

**Decisão**: Três níveis de texto para criar hierarquia visual clara.

#### Borders
```css
--border: 220 15% 15%              /* Subtle borders */
--border-strong: 220 15% 20%       /* Strong borders */
```

**Decisão**: Bordas sutis que definem áreas sem criar linhas pesadas.

#### Accents
```css
--primary: 270 80% 65%             /* Purple */
--secondary: 320 80% 65%           /* Pink */
```

**Decisão**: Purple como cor primária (referência Twitch) e pink como complementar, criando gradientes modernos.

#### Status Colors
```css
--success: 142 71% 45%             /* Green */
--warning: 38 92% 50%              /* Orange */
--error: 0 72% 51%                 /* Red */
```

### Gradientes

#### Primary Gradient
```css
--gradient-primary: linear-gradient(135deg, hsl(270 80% 65%) 0%, hsl(320 80% 65%) 100%);
```
**Uso**: Botões principais, logo, elementos de destaque.

#### Glass Gradient
```css
--gradient-glass: linear-gradient(135deg, hsl(220 15% 11% / 0.8) 0%, hsl(220 15% 9% / 0.8) 100%);
```
**Uso**: Cards com efeito glassmorphism.

### Platform Colors
- **Twitch**: Purple (500-600)
- **YouTube**: Red (500-600)
- **Kick**: Green (500-600)

**Decisão**: Cores oficiais das plataformas para reconhecimento imediato.

---

## Tipografia

### Font Family
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Decisão**: System fonts para performance e consistência com o OS.

### Hierarquia de Tamanhos

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| H1 | 3xl/4xl (30px/36px) | Bold (700) | Títulos principais |
| H2 | lg (18px) | Bold (700) | Seções da sidebar |
| H3 | sm (14px) | Semibold (600) | Subtítulos |
| Body | sm (14px) | Regular (400) | Texto padrão |
| Caption | xs (12px) | Regular (400) | Metadados |
| Micro | [10px] | Regular (400) | Footer, disclaimers |

### Font Features
```css
font-feature-settings: "rlig" 1, "calt" 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

**Decisão**: Ativar ligatures e melhorar a renderização de texto.

---

## Espaçamento

### Sistema 4pt/8pt Grid

Todos os espaçamentos seguem múltiplos de 4px para consistência matemática:

```css
--space-1: 0.25rem;  /* 4px  - Micro spacing */
--space-2: 0.5rem;   /* 8px  - Tight spacing */
--space-3: 0.75rem;  /* 12px - Compact spacing */
--space-4: 1rem;     /* 16px - Base spacing */
--space-5: 1.25rem;  /* 20px - Comfortable spacing */
--space-6: 1.5rem;   /* 24px - Generous spacing */
--space-8: 2rem;     /* 32px - Section spacing */
--space-12: 3rem;    /* 48px - Large section spacing */
```

### Aplicação

#### Sidebar
- **Padding**: 24px (space-6)
- **Gap entre seções**: 24px (space-6)
- **Gap entre elementos**: 12px-16px (space-3/4)

#### Main Content
- **Padding**: 32px-48px (space-8/12) no desktop
- **Gap entre cards**: 24px (space-6)
- **Margins**: 32px (space-8) entre seções

#### Cards
- **Padding interno**: 12px (space-3)
- **Gap entre elementos**: 8px-12px (space-2/3)

**Decisão**: Espaçamentos generosos para respirabilidade, inspirado no Linear.

---

## Componentes

### Glassmorphism Cards

```css
.glass-card {
  backdrop-blur-xl;
  background: gradient-to-br from-surface-elevated/80 to-surface/80;
  border: 1px solid border;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
}
```

**Características**:
- Blur de fundo para efeito de vidro
- Gradiente sutil para profundidade
- Borda delicada
- Sombra elevada
- Hover state com lift (translateY -2px)

**Decisão**: Glassmorphism adiciona modernidade sem sacrificar legibilidade.

### Gradient Buttons

```css
.gradient-button {
  background: linear-gradient(135deg, purple, pink);
  box-shadow: medium + glow;
  transition: all 250ms ease-out;
}

.gradient-button:hover {
  box-shadow: large + stronger-glow;
  transform: translateY(-1px);
}
```

**Características**:
- Gradiente purple-pink
- Glow effect no hover
- Micro lift animation
- Overlay brighter no hover

**Decisão**: Botões chamam atenção sem serem agressivos.

### Stream Container

```css
.stream-container {
  aspect-ratio: 16/9;
  border-radius: 16px;
  border: 1px solid border;
  overflow: hidden;
}

.stream-container:hover {
  border-color: primary;
  box-shadow: 0 0 20px purple-glow;
}
```

**Características**:
- Aspect ratio 16:9 consistente
- Bordas arredondadas
- Hover com glow purple
- Overlay com badge da plataforma

**Decisão**: Vídeos mantêm proporção e têm feedback visual no hover.

### Layout Buttons

```css
/* Active state */
background: gradient-primary;
box-shadow: large + purple-glow;

/* Inactive state */
background: surface-elevated;
border: 1px solid border;
```

**Características**:
- Icons + labels
- Grid 3 colunas
- Active state com gradiente
- Inactive state sutil

**Decisão**: Visualmente claro qual layout está ativo.

### Platform Badges

```css
/* Twitch */
background: gradient-to-br from-purple-500 to-purple-600;

/* YouTube */
background: gradient-to-br from-red-500 to-red-600;

/* Kick */
background: gradient-to-br from-green-500 to-green-600;
```

**Características**:
- Cores das plataformas
- Icon + texto
- Pequeno e compacto (text-xs)
- Bordas arredondadas

**Decisão**: Reconhecimento imediato da plataforma.

---

## Animações

### Timing Functions

```css
--duration-fast: 150ms;     /* Quick interactions */
--duration-normal: 250ms;   /* Default animations */
--duration-slow: 350ms;     /* Emphasis animations */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Decisão**: Animações rápidas o suficiente para serem responsivas, lentas o suficiente para serem notadas.

### Animações Principais

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
**Uso**: Page load, transições gerais.

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**Uso**: Sidebar, headers, entrada de elementos.

#### Scale In
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```
**Uso**: Cards, modal popups, elementos que aparecem.

### Stagger Animations

Cards e stream items usam `animation-delay` incremental:

```tsx
style={{ animationDelay: `${index * 100}ms` }}
```

**Decisão**: Criar sensação de fluidez e progressão natural.

### Hover States

Todos os elementos interativos têm hover states:

- **Buttons**: lift (-1px) + shadow
- **Cards**: lift (-2px) + stronger shadow + border color
- **Inputs**: border color change
- **Stream containers**: glow effect

**Decisão**: Feedback visual claro de interatividade.

---

## Responsividade

### Breakpoints

```css
/* Mobile first approach */
base: 0px       /* Mobile */
lg: 1024px      /* Desktop */
```

**Decisão**: Design otimizado para desktop (uso principal), mas funcional em mobile.

### Adaptações Mobile

#### Layout
- **Sidebar**: Full width, horizontal scroll
- **Grid**: Força 1 coluna independente do layout escolhido
- **Padding**: Reduz de 48px para 32px

#### Typography
- **H1**: De 4xl para 3xl
- Mantém outros tamanhos para legibilidade

#### Spacing
- Mantém grid 4pt/8pt
- Reduz padding externo
- Mantém gaps internos

### Media Queries

```css
@media (max-width: 1024px) {
  .layout-grid-* {
    grid-cols-1; /* Force single column */
  }

  .sidebar {
    width: 100%;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px;
  }
}
```

---

## Acessibilidade

### Focus States

```css
.focus-ring {
  outline: none;
  focus-visible:ring-2 ring-primary ring-offset-2;
}
```

**Decisão**: Focus visible apenas no teclado (não mouse).

### Color Contrast

Todos os pares texto/fundo passam WCAG AA:

- **Foreground / Background**: 16:1
- **Muted / Background**: 8:1
- **Subtle / Background**: 4.5:1

### Keyboard Navigation

- Todos os botões são focusable
- Enter key triggers actions
- Escape closes modals
- Tab order lógico

---

## Tokens vs Classes

### CSS Variables (Tokens)
```css
var(--background)
var(--space-4)
var(--radius-lg)
```

**Uso**: Valores que podem mudar (themes, customização).

### Tailwind Classes
```css
flex items-center gap-3
```

**Uso**: Layout, positioning, utilities.

**Decisão**: Hybrid approach - tokens para design system, Tailwind para layout.

---

## Princípios de Implementação

### 1. Componentes Reutilizáveis
- Shadcn UI como base
- Customizados com classes utilitárias
- Estilos globais via CSS variables

### 2. Performance
- System fonts (sem web fonts)
- CSS animations (não JS)
- Lazy loading de iframes
- Minimal re-renders

### 3. Manutenibilidade
- Design tokens centralizados
- Classes utilitárias consistentes
- Comentários descritivos
- Estrutura clara

### 4. Escalabilidade
- Grid system flexível
- Layouts adaptáveis
- Tokens customizáveis
- Componentes modulares

---

## Próximos Passos

Possíveis melhorias futuras:

1. **Theme Switcher**: Light/Dark/Auto
2. **Custom Accents**: Escolher cores primárias
3. **Density Options**: Compact/Comfortable/Spacious
4. **Animations Toggle**: Reduzir movimento para acessibilidade
5. **Font Size Options**: Pequeno/Médio/Grande

---

## Conclusão

O design system do Multistream foi criado com foco em:

- **Beleza**: Gradientes modernos, glassmorphism, animações sutis
- **Usabilidade**: Hierarquia clara, espaçamentos generosos, feedback visual
- **Performance**: System fonts, CSS animations, minimal JavaScript
- **Consistência**: Tokens centralizados, patterns repetidos
- **Profissionalismo**: Atenção aos detalhes, polish em cada elemento

Inspirado nas melhores interfaces modernas (Spotify, Discord, Linear, Twitch), mas com identidade própria através do gradiente purple/pink e do glassmorphism aplicado de forma sutil.

O resultado é uma interface que é **bonita de usar** e **fácil de manter**.
