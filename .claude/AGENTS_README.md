# Subagentes HLTV - Guia Completo

Este projeto inclui uma suíte especializada de subagentes Claude Code para trabalhar com a API HLTV de forma eficiente e organizada.

## 📚 Visão Geral

Os subagentes foram criados para dividir responsabilidades e especializar tarefas relacionadas ao consumo e análise de dados do HLTV (CS2/CS:GO). Cada subagente tem expertise específica e ferramentas dedicadas.

## 🤖 Subagentes Disponíveis

### 1. HLTV Data Fetcher
**Nome:** `hltv-data-fetcher`

**Especialidade:** Buscar dados da API HLTV

**Quando usar:**
- Buscar lista de eventos/torneios
- Consultar detalhes de eventos
- Listar partidas (com ou sem filtros)
- Obter informações de times
- Buscar estatísticas de jogadores
- Consultar rankings

**Exemplo de uso:**
```
> Use o hltv-data-fetcher para buscar todos os eventos do último mês
> Peça ao data-fetcher para encontrar o ranking atual dos times
```

**Ferramentas:** Bash, Read, Write, Grep, Glob

---

### 2. HLTV Scorebot Monitor
**Nome:** `hltv-scorebot-monitor`

**Especialidade:** Monitorar partidas ao vivo via scorebot

**Quando usar:**
- Conectar ao scorebot de partidas
- Monitorar partidas em tempo real
- Capturar eventos de jogo (kills, rounds, bomba)
- Criar dashboards ao vivo
- Gravar histórico de partidas
- Implementar alertas baseados em eventos

**Exemplo de uso:**
```
> Use o scorebot-monitor para acompanhar a partida 2388203
> Peça ao monitor para gravar todos os eventos da próxima partida da FURIA
```

**Recursos:**
- Processamento de ScoreboardUpdate
- Processamento de LogUpdate
- Sistema de alertas customizável
- Gravação de partidas
- Dashboards em tempo real

**Ferramentas:** Bash, Read, Write, Edit

---

### 3. HLTV Event Analyzer
**Nome:** `hltv-event-analyzer`

**Especialidade:** Análise estratégica de eventos e torneios

**Quando usar:**
- Analisar um evento/torneio específico
- Comparar múltiplos eventos
- Identificar padrões em campeonatos
- Gerar relatórios de eventos
- Analisar participação de times
- Identificar tendências em competições

**Exemplo de uso:**
```
> Use o event-analyzer para comparar os últimos 3 Majors
> Peça ao analyzer para identificar tendências nos prize pools
```

**Análises disponíveis:**
- Competitividade de eventos
- Prestígio e importância
- Distribuição regional de times
- Tendências temporais
- Participação histórica de times

**Ferramentas:** Bash, Read, Write, Grep, Glob

---

### 4. HLTV API Debugger
**Nome:** `hltv-api-debugger`

**Especialidade:** Debugging e troubleshooting da API

**Quando usar:**
- Erros ao buscar dados
- Problemas de conexão com scorebot
- Bloqueios do Cloudflare (403)
- Timeouts e problemas de rede
- Dados vazios ou inesperados
- Validação de IDs

**Exemplo de uso:**
```
> Use o debugger para investigar por que o match 2388203 não conecta
> Peça ao debugger para fazer um health check da API
```

**Recursos:**
- Catálogo completo de erros
- Health check da API
- Validação de IDs
- Request logger
- Diagnóstico sistemático

**Ferramentas:** Bash, Read, Write, Grep, Glob, Edit

---

### 5. HLTV Stats Processor
**Nome:** `hltv-stats-processor`

**Especialidade:** Análise estatística avançada

**Quando usar:**
- Calcular estatísticas de jogadores/times
- Processar dados de partidas
- Gerar rankings customizados
- Comparar performances
- Criar visualizações de dados
- Calcular tendências

**Exemplo de uso:**
```
> Use o stats-processor para calcular o rating dos jogadores do evento
> Peça ao processor para comparar a performance de s1mple vs ZywOo
```

**Métricas calculadas:**
- Rating HLTV 2.0
- KAST (Kill, Assist, Survive, Trade)
- ADR (Average Damage per Round)
- Headshot %
- Entry frag success rate
- Clutch statistics
- Win rates por mapa/lado

**Ferramentas:** Bash, Read, Write, Edit, Grep, Glob

---

## 🎯 Como Usar os Subagentes

### Invocação Automática
Claude Code automaticamente delega tarefas para o subagente apropriado baseado no contexto:

```
> Busque os eventos do próximo mês
[Claude invoca automaticamente o hltv-data-fetcher]

> Monitore a partida 2388203 e me avise quando houver um ACE
[Claude invoca automaticamente o hltv-scorebot-monitor]
```

### Invocação Explícita
Você também pode solicitar um subagente específico:

```
> Use o hltv-event-analyzer para analisar o IEM Cologne
> Peça ao hltv-stats-processor para calcular o rating médio dos jogadores
> Use o debugger para investigar este erro
```

### Encadeamento de Subagentes
Para workflows complexos, você pode encadear subagentes:

```
> Primeiro use o data-fetcher para buscar o evento 8504,
  depois use o event-analyzer para analisar sua competitividade,
  e por fim use o stats-processor para rankear os times participantes
```

## 📊 Workflows Comuns

### Workflow 1: Análise Completa de Evento
```
1. Data Fetcher: Buscar detalhes do evento
2. Event Analyzer: Analisar competitividade e importância
3. Stats Processor: Processar estatísticas dos participantes
```

### Workflow 2: Monitoramento de Partida ao Vivo
```
1. Data Fetcher: Validar match ID
2. Scorebot Monitor: Conectar e monitorar
3. Stats Processor: Calcular métricas em tempo real
```

### Workflow 3: Troubleshooting
```
1. API Debugger: Diagnosticar problema
2. Data Fetcher: Tentar operação corrigida
3. API Debugger: Validar solução
```

## ⚙️ Configuração

Os subagentes estão localizados em `.claude/agents/` e são automaticamente disponibilizados quando você usa Claude Code neste projeto.

### Estrutura de Arquivos
```
.claude/
└── agents/
    ├── hltv-data-fetcher.md
    ├── hltv-scorebot-monitor.md
    ├── hltv-event-analyzer.md
    ├── hltv-api-debugger.md
    └── hltv-stats-processor.md
```

### Customização

Você pode editar os subagentes para:
- Adicionar novos comportamentos
- Modificar ferramentas disponíveis
- Ajustar prioridades
- Incluir novos casos de uso

Use o comando `/agents` no Claude Code para gerenciar:
```
/agents
```

## 🚀 Melhores Práticas

### 1. Use o Subagente Certo para o Trabalho
- **Data Fetcher** para LEITURA de dados
- **Scorebot Monitor** para dados AO VIVO
- **Event Analyzer** para ANÁLISES estratégicas
- **API Debugger** para RESOLVER problemas
- **Stats Processor** para CÁLCULOS e métricas

### 2. Combine Subagentes para Tarefas Complexas
Workflows complexos ficam mais organizados quando você divide entre subagentes especializados.

### 3. Deixe Claude Decidir
Na maioria dos casos, deixe Claude escolher automaticamente qual subagente usar - ele vai selecionar baseado no contexto.

### 4. Rate Limiting
Todos os subagentes estão configurados para respeitar rate limits e evitar bloqueios do Cloudflare.

## ⚠️ Avisos Importantes

1. **Cloudflare Protection**: A API HLTV está protegida. Abuse resultará em IP ban.

2. **Biblioteca Descontinuada**: A `gigobyte/HLTV` não é mais ativamente mantida.

3. **Dados podem estar vazios**: Eventos futuros podem não ter partidas agendadas ainda.

4. **Scorebot Limitado**: Nem todas partidas têm scorebot disponível.

## 📖 Exemplos Práticos

### Exemplo 1: Buscar e Analisar Major
```
> Busque o próximo Major e analise sua importância e competitividade
```

Claude irá:
1. Usar Data Fetcher para buscar eventos Major
2. Usar Event Analyzer para análise de competitividade
3. Usar Stats Processor para métricas adicionais

### Exemplo 2: Monitorar Partida com Alertas
```
> Monitore a partida 2388203 e me alerte sobre:
  - ACEs (5 kills)
  - Clutches 1v3+
  - Multi-kills (3+ kills)
```

Claude irá:
1. Validar match ID com API Debugger
2. Usar Scorebot Monitor com sistema de alertas
3. Usar Stats Processor para calcular métricas de eventos

### Exemplo 3: Troubleshooting Completo
```
> Estou tendo erro ao buscar partidas do evento 8831
```

Claude irá:
1. Usar API Debugger para diagnosticar
2. Usar Data Fetcher para validar evento
3. Sugerir soluções baseadas no diagnóstico

## 🔧 Troubleshooting dos Subagentes

### Subagente não está sendo invocado?
- Verifique que os arquivos estão em `.claude/agents/`
- Use `/agents` para verificar se estão listados
- Tente invocação explícita: "Use o [nome-do-agente]"

### Subagente retorna erro?
- Use o API Debugger para diagnosticar
- Verifique os logs no terminal
- Confirme que as dependências estão instaladas

## 📚 Recursos Adicionais

- [Documentação gigobyte/HLTV](https://github.com/gigobyte/HLTV)
- [HLTV.org](https://www.hltv.org)
- [Claude Code Subagents Documentation](https://docs.anthropic.com/en/docs/agents)

## 🤝 Contribuindo

Para adicionar novos subagentes ou melhorar os existentes:

1. Crie/edite arquivo em `.claude/agents/`
2. Siga o formato YAML frontmatter + Markdown
3. Teste com `/agents`
4. Documente casos de uso neste README

---

**Desenvolvido para otimizar o trabalho com a API HLTV usando Claude Code**

Última atualização: Novembro 2025
