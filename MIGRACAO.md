# 🚀 Migração do Backend Python para Node.js

## O que mudou?

✅ **Backend migrado de Python/FastAPI para Node.js/Express**
- Mesma linguagem do frontend (JavaScript)
- Não precisa mais de ambiente virtual Python
- Estrutura mais simples
- Um único `package.json` na raiz

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
cd frontend && npm install && cd ..
```

Ou use o script automático:
```bash
npm run install:all
```

### 2. Configurar `.env`

Crie um arquivo `.env` na **raiz do projeto** (não mais em `backend/`):

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
GEMINI_API_KEY=sua_chave_do_gemini
CORS_ORIGINS=http://localhost:3000
PORT=8000
```

### 3. Iniciar o projeto

**Opção 1: Tudo junto (recomendado)**
```bash
npm run dev
```

**Opção 2: Scripts automáticos**
- Windows: `start.bat`
- PowerShell: `.\start.ps1`

**Opção 3: Separado**
```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

## 🗂️ Nova Estrutura

```
assistant-hub/
├── server.js              # ← Backend Node.js (novo!)
├── package.json            # ← Dependências do backend
├── .env                    # ← Variáveis de ambiente (raiz)
├── frontend/               # ← Frontend React (sem mudanças)
│   ├── src/
│   └── package.json
└── backend/                # ← Pode ser removido (opcional)
    └── ... (código Python antigo)
```

## ✅ Endpoints Migrados

- ✅ `POST /api/analyze-error` - Análise de erros
- ✅ `POST /api/design-lab/create` - Criação de designs
- ✅ `GET /api/credits/balance` - Saldo de créditos
- ✅ `GET /api/credits/usage` - Histórico de uso
- ✅ `GET /api/dashboard/metrics` - Métricas do dashboard
- ✅ `GET /api/dashboard/user` - Perfil do usuário
- ✅ `POST /api/status` - Status checks
- ✅ `GET /api/status` - Lista de status
- ✅ `GET /health` - Health check

## 🗑️ Removendo o Backend Python (Opcional)

Se quiser remover completamente o backend Python:

```bash
# Remover pasta backend (opcional)
rm -rf backend

# Remover ambiente virtual Python (opcional)
rm -rf .venv
rm -rf venv
```

**Nota:** Você pode manter o código Python como referência se quiser.

## 🔧 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port 8000 already in use"
Altere a porta no `.env`:
```env
PORT=8001
```

E atualize o frontend em `frontend/src/lib/api.js`:
```js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
```

### Erro: "Missing environment variables"
Verifique se o arquivo `.env` está na raiz do projeto e tem todas as variáveis necessárias.

## 📝 Próximos Passos

1. Teste os endpoints principais
2. Verifique se o frontend está conectando corretamente
3. Se tudo funcionar, pode remover a pasta `backend/` (opcional)

## 🎉 Vantagens da Nova Estrutura

- ✅ **Mais simples**: Uma linguagem (JavaScript) para tudo
- ✅ **Mais rápido**: Sem necessidade de ambiente virtual
- ✅ **Mais fácil**: Scripts de inicialização simplificados
- ✅ **Mais moderno**: Node.js é amplamente usado
- ✅ **Melhor DX**: Mesma stack do frontend
