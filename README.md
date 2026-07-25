# Naipe

Site interno da organização Naipe: informação da org, diretório de staff, tarefas,
documentos, calendário, timeline, contactos e um painel de admin.

## Stack

- **Next.js 16** (App Router, TypeScript) — full-stack (páginas + Server Actions como backend)
- **Supabase** — Postgres, Auth e Storage
- **Tailwind CSS 4**
- **Cloudflare Workers** (via `@opennextjs/cloudflare`) — hosting

> Nota: no Next.js 16 o antigo `middleware.ts` passou a chamar-se `proxy.ts`
> (mesma função, nome novo). Este projeto já usa a convenção nova (`src/proxy.ts`).

## Configuração do Supabase

1. Cria um projeto em [supabase.com](https://supabase.com).
2. Vai a **SQL Editor** e corre o conteúdo completo de [`supabase/schema.sql`](./supabase/schema.sql).
   Isto cria as tabelas, RLS, funções auxiliares e os buckets de storage
   (`documents`, `task-attachments`).
3. Em **Project Settings > API**, copia:
   - **Project URL**
   - **anon / publishable key**
   - **service_role / secret key** (nunca expor no browser)
4. Copia `.env.local.example` para `.env.local` e preenche esses valores.

### Criar o primeiro admin

1. Regista-te normalmente pela app em `/login` (ou cria o utilizador em
   **Authentication > Users** no dashboard do Supabase).
2. No SQL Editor, corre (substitui o email):

   ```sql
   update public.profiles
   set role = 'admin', account_state = 'active'
   where email = 'o-teu-email@exemplo.com';
   ```

3. A partir daí, esse utilizador já vê o separador **Admin** e pode ativar/gerir
   os restantes (convidar utilizadores, mudar cargo/departamento/estado).

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sem `.env.local` preenchido a
app arranca mas o login/dados não vão funcionar.

## Modelo de permissões (resumo)

- **role**: `membro` (default) / `coordenador` / `admin`
- **department**: tabela gerida pelo admin (sem lista fixa)
- Tarefas, documentos e eventos podem ser **globais** (sem departamento) ou
  associados a um departamento específico.
- RLS no Postgres garante que cada utilizador só vê/edita o que lhe é permitido,
  mesmo que o código da app tenha bugs — ver `supabase/schema.sql` para o detalhe
  completo de cada policy.
- Mudar `role`/`department`/`account_state` de **outro** utilizador só é possível
  através do painel Admin (usa a `service_role` key no servidor, nunca no browser).

## Deploy no Cloudflare

```bash
npx wrangler login
npm run deploy
```

Antes do primeiro deploy, define os secrets/vars no Cloudflare (dashboard do
Workers, ou via `wrangler secret put NOME`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (como secret, não como var pública)
- `NEXT_PUBLIC_SITE_URL` (o domínio final, ex: `https://naipe.pt`)

`npm run preview` faz build + corre localmente sobre o runtime do Cloudflare
(`wrangler dev`), útil para testar antes de publicar.

## Estrutura

```
src/
  app/
    (auth)/            login, set-password
    (dashboard)/        páginas autenticadas (staff, tarefas, documentos, ...)
    actions/             Server Actions (mutações)
  components/            componentes de UI reutilizáveis
  services/               acesso a dados (Supabase queries), usados pelas páginas e actions
  utils/supabase/         clientes Supabase (browser/server/admin) + refresh de sessão
  proxy.ts                protege as rotas do dashboard (Next.js 16 "proxy")
supabase/schema.sql      schema completo (tabelas, RLS, storage)
```

## Notas

- `npm audit` reporta algumas vulnerabilidades "high" herdadas de dependências
  de build do próprio `create-next-app` (ESLint/PostCSS/sharp) — não afetam o
  runtime da app; não corrigidas aqui para não desviar das versões escolhidas
  pelo scaffold oficial do Next.js.
