# Guia de Deploy - Entrega Newba

## Deploy na Vercel

### 1. Preparação

✅ **Já feito:**
- Código commitado no GitHub
- Variáveis de ambiente documentadas em `.env.example`
- Build configurado no `package.json`
- SEO e meta tags configuradas
- Páginas legais criadas (Privacy, Terms, About)
- ads.txt e robots.txt prontos

### 2. Deploy via Vercel Dashboard

1. **Acesse:** https://vercel.com/
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Importe o repositório:** `lucianfialho/triboneira`
5. **Configure as variáveis de ambiente:**

```bash
# Twitch API
TWITCH_CLIENT_ID=dlpr96izow24qfp1qf5mlbu7ees7we
TWITCH_CLIENT_SECRET=4qrgcfyrjqo3fsetuw4kbsarxiykiv

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Kick API (OAuth 2.1)
KICK_CLIENT_ID=01KA713ZW22GBV2X0HTGNBZ07Y
KICK_CLIENT_SECRET=40bb8174de3382e8d0964c0fd705a9676c42c20f1f27c53c2ec37ccf73db9e8f

# Amplitude Analytics (opcional)
NEXT_PUBLIC_AMPLITUDE_API_KEY=seu_amplitude_key_aqui
```

6. **Clique em "Deploy"**
7. **Aguarde o build** (geralmente 2-3 minutos)

### 3. Configurar Domínio Customizado

Após o primeiro deploy:

1. Vá em **Settings → Domains**
2. Adicione o domínio: `entreganewba.com.br`
3. Siga as instruções para configurar DNS:

**No seu provedor de DNS (Registro.br):**

```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

4. Aguarde propagação DNS (até 48h, geralmente 1-2h)

### 4. Verificações Pós-Deploy

Após o deploy estar online:

✅ Testar páginas principais:
- [ ] `https://entreganewba.com.br/` - Home
- [ ] `https://entreganewba.com.br/about` - Sobre
- [ ] `https://entreganewba.com.br/privacy` - Privacidade
- [ ] `https://entreganewba.com.br/terms` - Termos
- [ ] `https://entreganewba.com.br/sitemap.xml` - Sitemap
- [ ] `https://entreganewba.com.br/robots.txt` - Robots
- [ ] `https://entreganewba.com.br/ads.txt` - AdSense

✅ Testar funcionalidades:
- [ ] Busca de streamers (Command Palette - Cmd+K)
- [ ] Top Lives carregando
- [ ] Adicionar stream por URL
- [ ] Seleção múltipla funciona
- [ ] Layouts funcionam
- [ ] Compartilhamento via URL
- [ ] Footer com links funciona

### 5. Google Search Console

1. Acesse: https://search.google.com/search-console
2. Adicione propriedade: `entreganewba.com.br`
3. Verifique propriedade (método DNS ou HTML tag)
4. Submeta sitemap: `https://entreganewba.com.br/sitemap.xml`

### 6. Google AdSense

**Aguarde o site estar no ar com tráfego mínimo (1-2 semanas)**

1. Acesse: https://www.google.com/adsense
2. Clique em "Começar"
3. Adicione URL: `entreganewba.com.br`
4. Cole o código de verificação no site (quando solicitado)
5. Aguarde aprovação (1-2 semanas)

**Após aprovação:**
- Configurar unidades de anúncio
- Adicionar scripts nos componentes
- Testar exibição

### 7. Analytics e Monitoramento

**Google Analytics (opcional):**
1. Crie propriedade em analytics.google.com
2. Adicione tracking ID nas variáveis de ambiente
3. Redeploy

**Amplitude já está configurado:**
- Eventos sendo rastreados
- Session replay ativo

### 8. Manutenção

**Atualizar site:**
```bash
git add .
git commit -m "Update: descrição"
git push
```
A Vercel fará deploy automático!

**Variáveis de ambiente:**
- Vercel Dashboard → Settings → Environment Variables

**Ver logs:**
- Vercel Dashboard → Deployments → [seu deploy] → Build Logs

## Comandos Úteis

```bash
# Build local
npm run build

# Preview build local
npm run start

# Desenvolvimento
npm run dev

# Lint
npm run lint
```

## Troubleshooting

**Build falha:**
- Verifique variáveis de ambiente
- Veja logs de build na Vercel
- Teste `npm run build` localmente

**APIs não funcionam:**
- Verifique se variáveis de ambiente estão setadas na Vercel
- Confirme que os valores estão corretos
- Veja logs de runtime na Vercel

**Domínio não funciona:**
- Aguarde propagação DNS (até 48h)
- Verifique configuração no provedor de DNS
- Teste com `dig entreganewba.com.br`

## Suporte

- **Vercel:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs
- **Issues:** https://github.com/lucianfialho/triboneira/issues
