# Configuração do Banco de Dados e Variáveis

Para que o Painel Admin funcione corretamente (incluindo gestão de scripts e listagem de usuários), você precisa realizar dois passos:

## 1. Rodar Script SQL

Vá no Painel do Supabase -> SQL Editor e execute o seguinte comando (copie do arquivo `create_premium_scripts.sql`):

```sql
-- Create premium_scripts table
create table if not exists public.premium_scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'Geral',
  script_content text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.premium_scripts enable row level security;

-- Create policies
create policy "Allow read for authenticated users" 
  on public.premium_scripts for select 
  to authenticated 
  using (true);
```

## 2. Configurar Variáveis de Ambiente no Vercel

Para que o Admin consiga listar todos os usuários e gerenciar scripts, ele precisa da **Service Role Key**.

1. Vá no Supabase -> Project Settings -> API.
2. Copie a chave `service_role` (secret).
3. Vá no Vercel -> Settings -> Environment Variables.
4. Adicione uma nova variável:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (Cole a chave service_role aqui)

**Sem essa chave no Vercel, o painel Admin não conseguirá listar usuários nem salvar scripts.**
