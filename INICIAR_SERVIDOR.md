# Como Iniciar o Servidor Backend

## Problema
Se você está recebendo o erro `ERR_CONNECTION_REFUSED` ou `Network Error`, significa que o servidor backend não está rodando.

## Solução Rápida

### Opção 1: Usar o Script Automático (Recomendado)
Execute o arquivo `start_project.bat` na raiz do projeto:
```bash
.\start_project.bat
```

### Opção 2: Iniciar Manualmente

1. **Navegue até a pasta backend:**
   ```bash
   cd backend
   ```

2. **Ative o ambiente virtual (se estiver usando):**
   ```bash
   ..\.venv\Scripts\activate
   ```
   Ou se não tiver ambiente virtual:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. **Instale as dependências (se ainda não instalou):**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   GEMINI_API_KEY=sua_chave_do_gemini
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Inicie o servidor:**
   ```bash
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

## Verificar se o Servidor Está Rodando

Abra seu navegador e acesse:
- http://localhost:8000/health - Deve retornar um JSON com status "healthy"
- http://localhost:8000/docs - Documentação da API (Swagger)

## Problemas Comuns

### Erro: "GEMINI_API_KEY é obrigatória"
- Verifique se o arquivo `.env` existe na pasta `backend`
- Verifique se a variável `GEMINI_API_KEY` está definida no `.env`

### Erro: "Missing critical environment variables"
- Verifique se todas as variáveis necessárias estão no arquivo `.env`:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `GEMINI_API_KEY`

### Erro: "Module not found"
- Instale as dependências: `pip install -r requirements.txt`

### Porta 8000 já está em uso
- Pare o processo que está usando a porta 8000, ou
- Use outra porta: `python -m uvicorn server:app --reload --port 8001`
- E atualize o `REACT_APP_BACKEND_URL` no frontend
