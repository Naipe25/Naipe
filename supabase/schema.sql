-- =============================================================================
-- Naipe — schema Supabase (Postgres + Auth + Storage)
-- Corre este ficheiro completo no SQL Editor do teu projeto Supabase
-- (Project > SQL Editor > New query > cola isto > Run).
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- TABELAS
-- =============================================================================

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'membro' check (role in ('membro', 'coordenador', 'admin')),
  department_id uuid references public.departments (id) on delete set null,
  account_state text not null default 'pending' check (account_state in ('pending', 'active', 'inactive')),
  avatar_color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pendente' check (status in ('pendente', 'em_progresso', 'concluida')),
  department_id uuid references public.departments (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  assigned_to uuid references public.profiles (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'geral',
  department_id uuid references public.departments (id) on delete set null,
  storage_path text not null,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  location text,
  department_id uuid references public.departments (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.contact_entities (id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.org_page (
  id boolean primary key default true,
  title text not null default 'Sobre a Naipe',
  body text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  constraint org_page_singleton check (id)
);

insert into public.org_page (id, title, body)
values (true, 'Sobre a Naipe', 'Bem-vindo ao site interno da Naipe. Edita esta página no separador Admin.')
on conflict (id) do nothing;

-- =============================================================================
-- FUNÇÕES AUXILIARES (usadas nas policies RLS)
-- =============================================================================

create or replace function public.is_active_user(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and account_state = 'active'
  );
$$;

create or replace function public.get_user_role(uid uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = uid), 'membro');
$$;

create or replace function public.get_user_department(uid uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select department_id from public.profiles where id = uid;
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_user_role(uid) = 'admin';
$$;

-- Cria automaticamente um profile quando um novo utilizador se regista no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.documents enable row level security;
alter table public.events enable row level security;
alter table public.contact_entities enable row level security;
alter table public.contacts enable row level security;
alter table public.org_page enable row level security;

-- departments: qualquer utilizador ativo lê; só admin gere.
create policy "departments_select" on public.departments
  for select using (public.is_active_user(auth.uid()));
create policy "departments_all_admin" on public.departments
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- profiles: qualquer utilizador ativo vê todos os perfis ativos; cada um só edita o próprio (campos não sensíveis
-- ficam à responsabilidade da UI/Server Action; role/department_id/account_state só mudam via service_role).
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_active_user(auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- tasks: global (department_id is null) ou do próprio departamento ou admin ou criador/responsável.
create policy "tasks_select" on public.tasks
  for select using (
    public.is_active_user(auth.uid()) and (
      department_id is null
      or department_id = public.get_user_department(auth.uid())
      or public.is_admin(auth.uid())
      or created_by = auth.uid()
      or assigned_to = auth.uid()
    )
  );
create policy "tasks_insert" on public.tasks
  for insert with check (public.is_active_user(auth.uid()) and created_by = auth.uid());
create policy "tasks_update" on public.tasks
  for update using (
    public.is_admin(auth.uid())
    or created_by = auth.uid()
    or assigned_to = auth.uid()
    or (department_id = public.get_user_department(auth.uid()) and public.get_user_role(auth.uid()) = 'coordenador')
  );
create policy "tasks_delete" on public.tasks
  for delete using (
    public.is_admin(auth.uid())
    or created_by = auth.uid()
    or (department_id = public.get_user_department(auth.uid()) and public.get_user_role(auth.uid()) = 'coordenador')
  );

-- task_comments: visível/gerível por quem vê a tarefa; apagar só admin ou autor.
create policy "task_comments_select" on public.task_comments
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.is_active_user(auth.uid())
        and (
          t.department_id is null
          or t.department_id = public.get_user_department(auth.uid())
          or public.is_admin(auth.uid())
          or t.created_by = auth.uid()
          or t.assigned_to = auth.uid()
        )
    )
  );
create policy "task_comments_insert" on public.task_comments
  for insert with check (public.is_active_user(auth.uid()) and author_id = auth.uid());
create policy "task_comments_delete" on public.task_comments
  for delete using (public.is_admin(auth.uid()) or author_id = auth.uid());

-- task_attachments: mesma visibilidade que a tarefa; apagar admin, quem fez upload, ou criador da tarefa.
create policy "task_attachments_select" on public.task_attachments
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.is_active_user(auth.uid())
        and (
          t.department_id is null
          or t.department_id = public.get_user_department(auth.uid())
          or public.is_admin(auth.uid())
          or t.created_by = auth.uid()
          or t.assigned_to = auth.uid()
        )
    )
  );
create policy "task_attachments_insert" on public.task_attachments
  for insert with check (public.is_active_user(auth.uid()) and uploaded_by = auth.uid());
create policy "task_attachments_delete" on public.task_attachments
  for delete using (
    public.is_admin(auth.uid())
    or uploaded_by = auth.uid()
    or exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
  );

-- documents: global ou do próprio departamento ou admin; upload por qualquer ativo; apagar admin/uploader.
create policy "documents_select" on public.documents
  for select using (
    public.is_active_user(auth.uid()) and (
      department_id is null
      or department_id = public.get_user_department(auth.uid())
      or public.is_admin(auth.uid())
    )
  );
create policy "documents_insert" on public.documents
  for insert with check (public.is_active_user(auth.uid()) and uploaded_by = auth.uid());
create policy "documents_delete" on public.documents
  for delete using (public.is_admin(auth.uid()) or uploaded_by = auth.uid());

-- events: mesma lógica de departamento que tasks/documents; escrita por admin/coordenador do departamento.
create policy "events_select" on public.events
  for select using (
    public.is_active_user(auth.uid()) and (
      department_id is null
      or department_id = public.get_user_department(auth.uid())
      or public.is_admin(auth.uid())
      or created_by = auth.uid()
    )
  );
create policy "events_insert" on public.events
  for insert with check (
    public.is_active_user(auth.uid()) and created_by = auth.uid() and (
      public.is_admin(auth.uid())
      or (public.get_user_role(auth.uid()) = 'coordenador' and (department_id is null or department_id = public.get_user_department(auth.uid())))
    )
  );
create policy "events_update" on public.events
  for update using (
    public.is_admin(auth.uid())
    or created_by = auth.uid()
    or (department_id = public.get_user_department(auth.uid()) and public.get_user_role(auth.uid()) = 'coordenador')
  );
create policy "events_delete" on public.events
  for delete using (
    public.is_admin(auth.uid())
    or created_by = auth.uid()
    or (department_id = public.get_user_department(auth.uid()) and public.get_user_role(auth.uid()) = 'coordenador')
  );

-- contact_entities / contacts: diretório partilhado, qualquer utilizador ativo faz CRUD.
create policy "contact_entities_all" on public.contact_entities
  for all using (public.is_active_user(auth.uid())) with check (public.is_active_user(auth.uid()));
create policy "contacts_all" on public.contacts
  for all using (public.is_active_user(auth.uid())) with check (public.is_active_user(auth.uid()));

-- org_page: qualquer utilizador ativo lê; só admin edita.
create policy "org_page_select" on public.org_page
  for select using (public.is_active_user(auth.uid()));
create policy "org_page_update_admin" on public.org_page
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- =============================================================================
-- STORAGE (buckets + policies)
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

-- documents bucket: path = "{department_id|global}/{doc_id}-{filename}"
create policy "documents_bucket_select" on storage.objects
  for select using (
    bucket_id = 'documents' and public.is_active_user(auth.uid()) and (
      public.is_admin(auth.uid())
      or (storage.foldername(name))[1] = 'global'
      or (storage.foldername(name))[1] = coalesce(public.get_user_department(auth.uid())::text, '')
    )
  );
create policy "documents_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and public.is_active_user(auth.uid()));
create policy "documents_bucket_delete" on storage.objects
  for delete using (
    bucket_id = 'documents' and (public.is_admin(auth.uid()) or owner = auth.uid())
  );

-- task-attachments bucket: path = "{task_id}/{filename}"; visibilidade segue a tarefa.
create policy "task_attachments_bucket_select" on storage.objects
  for select using (
    bucket_id = 'task-attachments' and public.is_active_user(auth.uid()) and exists (
      select 1 from public.tasks t
      where t.id::text = (storage.foldername(name))[1]
        and (
          t.department_id is null
          or t.department_id = public.get_user_department(auth.uid())
          or public.is_admin(auth.uid())
          or t.created_by = auth.uid()
          or t.assigned_to = auth.uid()
        )
    )
  );
create policy "task_attachments_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'task-attachments' and public.is_active_user(auth.uid()));
create policy "task_attachments_bucket_delete" on storage.objects
  for delete using (
    bucket_id = 'task-attachments' and (public.is_admin(auth.uid()) or owner = auth.uid())
  );

-- =============================================================================
-- Fim do schema.
-- Próximo passo: cria o teu primeiro utilizador admin.
-- 1. Regista-te normalmente pela app (Auth > Sign up), ou cria o utilizador em
--    Authentication > Users no dashboard do Supabase.
-- 2. Depois corre (substitui o email):
--    update public.profiles set role = 'admin', account_state = 'active'
--    where email = 'o-teu-email@exemplo.com';
-- =============================================================================
