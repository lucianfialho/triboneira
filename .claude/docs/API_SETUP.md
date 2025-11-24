# Configuração das APIs de Streaming

Este documento explica como configurar as APIs necessárias para o funcionamento da busca de streamers em tempo real.

## 📋 Visão Geral

O multistream agora busca dados em tempo real das seguintes plataformas:
- **Twitch**: Status de live, viewers, título da stream
- **YouTube**: Canais ao vivo, viewers, título
- **Kick**: Status de live, viewers (API não oficial)

## 🔑 Configuração de API Keys

### 1. Twitch API

#### Passo a Passo:

1. Acesse [Twitch Developers Console](https://dev.twitch.tv/console/apps)
2. Faça login com sua conta Twitch
3. Clique em "Register Your Application"
4. Preencha:
   - **Name**: `Multistream Viewer` (ou qualquer nome)
   - **OAuth Redirect URLs**: `http://localhost:3000`
   - **Category**: `Website Integration`
5. Após criar, clique em "Manage" no app
6. Copie o **Client ID**
7. Clique em "New Secret" para gerar o **Client Secret**
8. Copie ambos para o arquivo `.env.local`

```bash
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
```

#### Documentação:
- [Twitch API Docs](https://dev.twitch.tv/docs/api/)
- [Authentication Guide](https://dev.twitch.tv/docs/authentication)

---

### 2. YouTube Data API v3

#### Passo a Passo:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Library"
4. Busque por "YouTube Data API v3"
5. Clique em "Enable"
6. Vá em "APIs & Services" > "Credentials"
7. Clique em "Create Credentials" > "API Key"
8. Copie a API Key gerada
9. (Opcional) Clique em "Restrict Key" para adicionar restrições de segurança
   - Em "API restrictions", selecione "Restrict key"
   - Marque apenas "YouTube Data API v3"
   - Em "Website restrictions", adicione seu domínio (produção) ou `localhost:*` (desenvolvimento)
10. Cole no arquivo `.env.local`

```bash
YOUTUBE_API_KEY=sua_api_key_aqui
```

#### Quotas e Limites:
- **Quota diária**: 10,000 unidades/dia (grátis)
- **Busca**: 100 unidades por request
- **Informações de vídeo**: 1 unidade por request

Para aumentar a quota, é necessário fazer upgrade para um plano pago.

#### Documentação:
- [YouTube Data API Docs](https://developers.google.com/youtube/v3/docs)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

---

### 3. Kick API

⚠️ **Importante**: Kick não possui uma API pública oficial.

O serviço atual usa endpoints não documentados que podem mudar a qualquer momento:
- `https://kick.com/api/v2/channels/{username}`

**Não é necessária API Key** para Kick, mas:
- A API pode ser instável
- Pode haver rate limiting não documentado
- Endpoints podem mudar sem aviso

#### Alternativas:
Se a API não oficial parar de funcionar, considere:
1. Web scraping com Puppeteer/Playwright
2. Aguardar API oficial do Kick
3. Desabilitar suporte ao Kick temporariamente

---

## ⚙️ Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# Twitch API
TWITCH_CLIENT_ID=seu_twitch_client_id_aqui
TWITCH_CLIENT_SECRET=seu_twitch_client_secret_aqui

# YouTube Data API v3
YOUTUBE_API_KEY=sua_youtube_api_key_aqui
```

**Importante**:
- ❌ **NÃO** commite o arquivo `.env.local` no git
- ✅ O arquivo `.env.example` já está configurado como template
- ✅ O `.gitignore` já está ignorando `.env.local`

---

## 🧪 Testando as APIs

Após configurar, reinicie o servidor:

```bash
npm run dev
```

Abra o Command Palette (Cmd+K ou Ctrl+K) e busque por um streamer conhecido:
- Digite "shroud" para Twitch
- Digite "LOUD" para Twitch/Kick
- Digite qualquer nome de canal do YouTube

### Verificando Erros:

Abra o **Console do Navegador** (F12) e a aba **Network** para ver as requisições.

Verifique também os logs do servidor no terminal onde você rodou `npm run dev`.

**Erros comuns**:
- `Twitch API credentials not configured`: Faltam as variáveis do Twitch
- `YouTube API key not configured`: Falta a variável do YouTube
- `401 Unauthorized`: Credenciais inválidas
- `403 Forbidden`: Quota excedida (YouTube) ou API key com restrições muito rígidas
- `429 Too Many Requests`: Rate limit atingido

---

## 📊 Cache e Performance

O sistema implementa:
- **Cache de token Twitch**: 1 hora (renovação automática)
- **Cache de resultados YouTube**: 5 minutos
- **Cache de resultados Kick**: 1 minuto
- **Debounce na busca**: 300ms

Isso reduz o número de requisições e melhora a performance.

---

## 🚀 Deploy em Produção

Ao fazer deploy (Vercel, Netlify, etc.), adicione as variáveis de ambiente no painel de configuração:

### Vercel:
1. Vá em "Settings" > "Environment Variables"
2. Adicione cada variável com seu valor
3. Selecione "Production", "Preview" e "Development"
4. Faça redeploy

### Outras Plataformas:
Consulte a documentação da plataforma para adicionar variáveis de ambiente.

---

## 🔒 Segurança

✅ **Boas práticas implementadas**:
- Variáveis de ambiente server-side (não expostas ao cliente)
- Cache de tokens para reduzir requests
- Tratamento de erros para não expor credenciais
- Rate limiting implícito via cache

❌ **NÃO faça**:
- Commitar `.env.local` no git
- Usar variáveis com `NEXT_PUBLIC_` para API secrets
- Compartilhar suas API keys publicamente
- Usar as mesmas keys em dev e produção (recomendado ter separadas)

---

## 📚 Recursos Adicionais

- [Twitch API Reference](https://dev.twitch.tv/docs/api/reference)
- [YouTube API Explorer](https://developers.google.com/youtube/v3/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🐛 Troubleshooting

### Busca não retorna resultados

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Confira os logs do servidor para erros de API
3. Teste as credenciais diretamente nas documentações das APIs
4. Verifique se não excedeu a quota do YouTube

### YouTube retorna 403

- Provavelmente quota excedida
- Aguarde até o próximo dia (reset às 00:00 PST)
- Considere upgrade do plano do Google Cloud

### Twitch retorna 401

- Client ID ou Client Secret incorretos
- Regenere as credenciais no console da Twitch
- Verifique se não há espaços extras nas variáveis

### Kick não funciona

- A API não oficial pode ter mudado
- Teste manualmente: `curl https://kick.com/api/v2/channels/username`
- Considere desabilitar Kick temporariamente
