# 🔍 Troubleshooting - Erro 500 na Vercel

## Passo 1: Verificar Variáveis de Ambiente

Acesse: `https://assistanthub-eight.vercel.app/api/test-env`

Deve retornar:
```json
{
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true,
  "hasGeminiKey": true,
  "nodeEnv": "production"
}
```

**Se algum for `false`:**
1. Acesse seu projeto na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione as variáveis faltantes:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY`
4. **IMPORTANTE**: Marque para **Production**, **Preview** e **Development**
5. Faça redeploy: `vercel --prod` ou aguarde deploy automático

## Passo 2: Verificar Logs da Função

1. Acesse seu projeto na Vercel
2. Vá na aba **Functions**
3. Clique em `api/analyze-error`
4. Veja os logs de erro

Os logs agora mostram:
- ✅ Se as variáveis de ambiente estão presentes
- ✅ Se a autenticação funcionou
- ✅ Se o Gemini foi inicializado
- ✅ Erros detalhados em cada etapa

## Passo 3: Testar Health Check

Acesse: `https://assistanthub-eight.vercel.app/api/health`

Deve retornar: `{"status":"healthy"}`

Se não funcionar, há problema na estrutura das funções.

## Passo 4: Verificar Estrutura

Certifique-se de que os arquivos estão assim:
```
api/
├── _helpers.js
├── analyze-error.js
├── design-lab/
│   └── create.js
├── dashboard/
│   ├── metrics.js
│   ├── user.js
│   └── tools.js
└── health.js
```

## Passo 5: Verificar Dependências

Certifique-se de que `api/package.json` existe e tem:
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@supabase/supabase-ai": "^2.91.0",
    "uuid": "^13.0.0"
  }
}
```

## Erros Comuns

### "Missing environment variables"
- **Solução**: Configure as variáveis na Vercel (Passo 1)

### "Authentication failed"
- **Solução**: Verifique se está enviando o token de autorização no header
- O frontend deve estar enviando: `Authorization: Bearer <token>`

### "Erro ao criar modelo Gemini"
- **Solução**: Verifique se `GEMINI_API_KEY` está correta
- Teste a chave localmente primeiro

### "Function not found"
- **Solução**: Verifique se os arquivos estão em `api/`
- Verifique se fez commit e push das mudanças

## Próximos Passos

1. **Teste o endpoint de teste de env**: `/api/test-env`
2. **Veja os logs na Vercel** para identificar o erro exato
3. **Compartilhe os logs** se precisar de ajuda

## Logs Úteis

Agora os logs mostram:
- `[Analyze Error] Request method: POST`
- `[Analyze Error] Body recebido: {...}`
- `[getSupabase] SUPABASE_URL presente: true`
- `[getGeminiModel] GEMINI_API_KEY presente: true`
- `[Analyze Error] Usuário autenticado: <user-id>`
- `[Analyze Error] Chamando Gemini API...`

Se algum desses logs não aparecer, você saberá exatamente onde está o problema!
