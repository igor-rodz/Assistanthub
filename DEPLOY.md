# Guia de Deploy na Vercel

Este projeto está configurado para deploy na Vercel com frontend React e backend como Serverless Functions.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com)
3. Chave da API do [Google Gemini](https://ai.google.dev/)

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub, GitLab ou Bitbucket.

### 2. Conectar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório
4. Configure o projeto:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings > Environment Variables** e adicione:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_anon_do_supabase
GEMINI_API_KEY=sua_chave_do_gemini
REACT_APP_BACKEND_URL=https://seu-projeto.vercel.app
```

**Importante**: 
- `REACT_APP_BACKEND_URL` deve ser a URL do seu projeto Vercel (será preenchida após o primeiro deploy)
- Todas as variáveis devem estar configuradas para **Production**, **Preview** e **Development**

### 4. Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Após o primeiro deploy, atualize a variável `REACT_APP_BACKEND_URL` com a URL real do projeto

### 5. Verificar Deploy

Após o deploy, você terá:
- Frontend: `https://seu-projeto.vercel.app`
- API: `https://seu-projeto.vercel.app/api/*`

## 📁 Estrutura do Projeto

```
assistant-hub/
├── api/                    # Serverless Functions (Backend)
│   ├── _helpers.js        # Funções compartilhadas
│   ├── health.js          # Health check
│   ├── analyze-error.js   # Análise de erros
│   ├── design-lab/
│   │   └── create.js      # Criação de designs
│   └── dashboard/
│       ├── metrics.js     # Métricas do dashboard
│       ├── user.js        # Dados do usuário
│       └── tools.js       # Lista de ferramentas
├── frontend/              # Aplicação React
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json           # Configuração Vercel
└── .vercelignore         # Arquivos ignorados no deploy
```

## 🔧 Configuração Local para Testar

Para testar localmente antes do deploy:

```bash
# Instalar dependências
npm run install:all

# Instalar dependências da API
cd api && npm install

# Rodar backend local (opcional, para desenvolvimento)
cd backend && npm start

# Rodar frontend
cd frontend && npm start
```

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se os arquivos em `api/` estão com a estrutura correta
- Certifique-se de que `vercel.json` está na raiz do projeto

### Erro: "Environment variables not found"
- Verifique se todas as variáveis estão configuradas na Vercel
- Certifique-se de que estão marcadas para Production, Preview e Development

### Erro: "Build failed"
- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`

### API retorna 500
- Verifique os logs da função na Vercel (Functions tab)
- Certifique-se de que as variáveis de ambiente estão corretas

## 📝 Notas Importantes

1. **Timeout**: As funções têm timeout de 60 segundos (configurado em `vercel.json`)
2. **CORS**: Já está configurado nas funções serverless
3. **Autenticação**: Usa Supabase Auth, certifique-se de que está configurado corretamente
4. **Cold Start**: Primeira requisição pode demorar mais (cold start das serverless functions)

## 🔄 Deploy Automático

Após conectar o repositório, cada push para a branch principal fará deploy automático.

Para deploy manual:
```bash
vercel --prod
```

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
