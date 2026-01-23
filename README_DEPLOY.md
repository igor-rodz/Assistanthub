# 🚀 Deploy na Vercel - Guia Rápido

## ✅ O que foi configurado

1. ✅ Estrutura de Serverless Functions na pasta `api/`
2. ✅ Configuração do `vercel.json`
3. ✅ Helpers compartilhados para Supabase e Gemini
4. ✅ Todas as rotas convertidas para serverless functions
5. ✅ Configuração automática de CORS
6. ✅ Timeout de 60s para operações com IA

## 📝 Passos para Deploy

### 1. Instalar Vercel CLI (opcional, mas recomendado)
```bash
npm i -g vercel
```

### 2. Fazer Login na Vercel
```bash
vercel login
```

### 3. Deploy do Projeto
```bash
# Na raiz do projeto
vercel
```

Siga as instruções:
- **Link to existing project?** → N (primeira vez)
- **Project name** → assistant-hub (ou o nome que preferir)
- **Directory** → `./frontend`
- **Override settings?** → N

### 4. Configurar Variáveis de Ambiente

Após o primeiro deploy, configure as variáveis:

**Opção A: Via Dashboard Vercel**
1. Acesse seu projeto na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione:
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_KEY` = sua chave anon do Supabase
   - `GEMINI_API_KEY` = sua chave do Gemini
   - Marque para **Production**, **Preview** e **Development**

**Opção B: Via CLI**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add GEMINI_API_KEY
```

### 5. Redeploy após configurar variáveis
```bash
vercel --prod
```

## 🔍 Verificar Deploy

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **API Health**: `https://seu-projeto.vercel.app/api/health`
- **API Metrics**: `https://seu-projeto.vercel.app/api/dashboard/metrics`

## 🎯 Estrutura das APIs

Todas as rotas estão em `api/`:
- `/api/health` → Health check
- `/api/dashboard/metrics` → Métricas do dashboard
- `/api/dashboard/user` → Dados do usuário
- `/api/dashboard/tools` → Lista de ferramentas
- `/api/analyze-error` → Análise de erros (POST)
- `/api/design-lab/create` → Criar design (POST)

## ⚠️ Importante

1. **Primeira requisição pode demorar** (cold start das serverless functions)
2. **Timeout de 60 segundos** para operações com IA
3. **CORS já está configurado** automaticamente
4. **Variáveis de ambiente** devem estar configuradas antes do deploy

## 🐛 Problemas Comuns

### "Function not found"
- Verifique se os arquivos estão em `api/`
- Verifique se `vercel.json` está na raiz

### "Environment variables not found"
- Configure as variáveis na Vercel antes do deploy
- Faça redeploy após configurar

### Build falha
- Verifique os logs na Vercel
- Certifique-se de que `frontend/package.json` tem o script `vercel-build`

## 📚 Documentação Completa

Veja `DEPLOY.md` para documentação detalhada.
