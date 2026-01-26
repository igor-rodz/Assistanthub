# Assistant Hub

Sistema de análise de erros e geração de designs com IA.

## 🏗️ Arquitetura

```
assistant-hub/
├── api/                  # Serverless Functions (Vercel)
│   ├── _helpers.js       # Utilitários compartilhados
│   ├── health.js         # Health check
│   ├── analyze-error.js  # Análise de erros com IA
│   ├── design-lab/       
│   │   └── create.js     # Geração de designs
│   └── dashboard/
│       ├── metrics.js    # Métricas do usuário
│       ├── user.js       # Dados do usuário
│       └── tools.js      # Lista de ferramentas
├── frontend/             # React App
└── vercel.json           # Configuração Vercel
```

## 🚀 Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY`
3. Deploy automático a cada push

## 💻 Desenvolvimento Local

```bash
# Instalar tudo
npm run install:all

# Rodar frontend
npm run dev
```

## 🔧 API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/health` | GET | Health check |
| `/api/analyze-error` | POST | Análise de erros com IA |
| `/api/design-lab/create` | POST | Geração de designs |
| `/api/dashboard/metrics` | GET | Métricas do usuário |
| `/api/dashboard/user` | GET | Dados do usuário |
| `/api/dashboard/tools` | GET | Lista de ferramentas |

## 🛠️ Tecnologias

- **Frontend**: React + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **IA**: Google Gemini
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
