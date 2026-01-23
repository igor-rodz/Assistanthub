# Assistant Hub

Sistema unificado de análise de erros, geração de designs e biblioteca de scripts com IA.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm run install:all
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase

# Gemini AI
GEMINI_API_KEY=sua_chave_do_gemini

# CORS (opcional)
CORS_ORIGINS=http://localhost:3000

# Porta do servidor (opcional)
PORT=8000
```

### 3. Iniciar o Projeto

**Opção 1: Iniciar tudo junto (recomendado)**
```bash
npm run dev
```

**Opção 2: Iniciar separadamente**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## 📁 Estrutura do Projeto

```
assistant-hub/
├── server.js              # Servidor Express (Backend)
├── package.json           # Dependências do backend
├── .env                   # Variáveis de ambiente
├── frontend/              # Aplicação React
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Endpoints da API

- `GET /health` - Health check
- `POST /api/analyze-error` - Análise de erros com IA
- `POST /api/design-lab/create` - Criação de designs
- `GET /api/credits/balance` - Saldo de créditos

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **IA**: Google Gemini AI
- **Banco**: Supabase
- **Autenticação**: Supabase Auth

## 📝 Notas

- O backend Python foi migrado para Node.js para simplificar o desenvolvimento
- Tudo roda na mesma linguagem (JavaScript)
- Não precisa mais de ambiente virtual Python
- Estrutura mais simples e fácil de manter
