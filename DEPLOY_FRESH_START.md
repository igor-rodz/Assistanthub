# Guia de Deploy Limpo (Fresh Start) na Vercel

Siga este guia para excluir o projeto atual na Vercel e subir um novo do zero, garantindo que tudo funcione perfeitamente.

## 1. Preparação (Nós já fizemos isso!)
O código já está atualizado no GitHub com as correções críticas:
- ✅ Dependências da API sendo instaladas corretamente.
- ✅ Runtime 'edge' configurado para evitar erro 504.
- ✅ Configuração de CORS aberta (`*`) para evitar bloqueios iniciais.

## 2. Excluir Projeto Antigo (Opcional, mas recomendado)
1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Encontre o projeto `assistanthub` (ou o nome atual).
3. Vá em **Settings** > **General**.
4. Role até o final e clique em **Delete Project**.
5. Confirme a exclusão.

## 3. Criar Novo Projeto
1. No dashboard, clique em **Add New...** > **Project**.
2. Selecione o repositório **"Assistanthub"** (Import).
3. **Configure o Projeto:**
   - **Framework Preset:** Create React App (deve detectar automático).
   - **Root Directory:** Deixe **VAZIO** (ou `./`). **NÃO** coloque `frontend`!
   - **Build Command:** Deixe o padrão (ele vai pegar do nosso `vercel.json`).

## 4. Variáveis de Ambiente (CRÍTICO) ⚠️
Antes de clicar em "Deploy", abra a seção **Environment Variables** e adicione as seguintes chaves exatamente como estão aqui. (Pegue os valores do seu arquivo `.env` local).

| Nome da Variável | Descrição |
|------------------|-----------|
| `SUPABASE_URL` | URL do seu projeto Supabase. |
| `SUPABASE_KEY` | Sua chave `anon` ou `service_role` do Supabase. |
| `GEMINI_API_KEY` | Sua chave da API do Google Gemini. |

> **Nota sobre CORS:** Não precisamos definir `CORS_ORIGINS` agora. O código foi ajustado para aceitar conexões do seu novo domínio automaticamente (`*`), facilitando essa primeira subida.

## 5. Fazer o Deploy
1. Clique em **Deploy**.
2. Aguarde o processo. A Vercel vai:
   - Instalar dependências da raiz.
   - Instalar dependências da API (Graças à nossa correção!).
   - Construir o Frontend.
3. Se tudo der certo, você verá a tela de sucesso com confetes! 🎉

## 6. Verificação Final
Após o site estar no ar, teste se o backend está vivo:
1. Abra seu navegador e acesse: `https://SEU-NOVO-DOMINIO.vercel.app/api/health`
2. Você deve receber um JSON: `{"status": "healthy", ...}`

---
**Pronto!** Seu projeto estará rodando limpo e sem erros antigos.
