# Correções Aplicadas

## ✅ Problemas Resolvidos

### 1. Botão de Remover Streams Restaurado
- **O que foi feito:** Adicionada seção "Streams Ativas" na sidebar
- **Funcionalidade:** Cada stream agora tem um botão X (visível ao passar o mouse) para remover
- **Localização:** Entre o contador de viewers e o botão "Adicionar Stream"

### 2. API Routes Corrigidas  
- **Problema:** Routes buscavam apenas por `externalId`, mas passamos ID interno `15`
- **Solução:** Routes agora aceitam tanto ID interno quanto `externalId`
- **Rotas atualizadas:**
  - `/api/events/[externalId]/matches`
  - `/api/events/[externalId]/bracket`
  - `/api/events/[externalId]/standings`
  - `/api/events/[externalId]/route` (info)

### 3. Dados Fictícios Removidos
- Removidas as partidas falsas (MIBR vs Liquid "live", etc)

## ⚠️ Problemas Pendentes

### Falta de Dados Reais
- **Status:** Evento ID 15 existe mas sem partidas no banco
- **Causa provável:** Scraper/sync não rodou para Stage 2
- **Aguardando:** Informação do usuário sobre como popular dados

### Swiss System  
- **Status:** Usuário reportou que mudou
- **Aguardando:** Print/exemplo de como era antes vs agora

### Times Brasileiros
- **Status:** Usuário disse que não aparecem
- **Aguardando:** Lista de quais times deveriam estar

## 🚀 Como Testar

1. Reinicie o servidor dev (`npm run dev`)
2. Acesse `/major/budapest-2025`
3. Verifique:
   - Sidebar mostra "Streams Ativas" com botão X ✓
   - Botão X remove a stream ao clicar ✓
   - Build passa sem erros ✓
