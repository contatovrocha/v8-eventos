-- Clube do ROI — schema Supabase
-- Rode no SQL Editor do projeto. Depois preencha config.js com a URL e a chave publishable/anon.
-- Isolamento: cada membro só lê/escreve a própria jornada, diagnósticos, plano, notificações e pedidos.

create extension if not exists pgcrypto;

-- ---------- papéis ----------
create type public.app_role as enum ('admin', 'mentor');

create table public.user_roles (
  user_id uuid primary key references auth.users on delete cascade,
  role public.app_role not null
);

create or replace function public.has_role(_uid uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _uid and role = _role)
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- ---------- perfis (público para membros logados) ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  headline text default '', company text default '', segment text default '', city text default '',
  revenue text default '', employees text default '', goals text default '', avatar text default '',
  phone text default '',
  member_since int default extract(year from now())::int,
  created_at timestamptz default now()
);

-- cria perfil + notificação de boas-vindas quando alguém se cadastra
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  insert into public.notifications (user_id, title, body, link)
    values (new.id, 'Bem-vindo ao Clube do ROI', 'Sua jornada de entrada começou. Comece pelas boas-vindas.', '#/jornada');
  return new;
end $$;

-- ---------- jornada ----------
create table public.journey_steps (
  id text primary key default gen_random_uuid()::text,
  ord int not null, key text unique, title text not null, description text default '',
  minutes int default 10, route text default '#/jornada', label text default 'Continuar'
);
create table public.member_steps (
  user_id uuid references auth.users on delete cascade,
  step_id text references public.journey_steps on delete cascade,
  status text not null default 'concluida', completed_at timestamptz default now(),
  primary key (user_id, step_id)
);

-- ---------- agenda ----------
create table public.events (
  id text primary key default gen_random_uuid()::text,
  title text not null, kind text default 'Encontro', starts_at timestamptz not null,
  place text default '', mode text default '', seats int, link text default '', cover text default '',
  description text default '', created_at timestamptz default now()
);
create table public.rsvps (
  event_id text references public.events on delete cascade,
  user_id uuid references auth.users on delete cascade default auth.uid(),
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- ---------- conteúdo ----------
create table public.materials (
  id text primary key default gen_random_uuid()::text,
  title text not null, kind text default 'PDF', size text default '', category text default 'Geral',
  url text default '', cover text default '', published_at timestamptz default now()
);
create table public.mentors (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete set null,
  name text not null, specialty text default '', bio text default '', avatar text default ''
);
create table public.mentor_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  mentor_id text references public.mentors on delete cascade,
  note text default '', status text default 'pendente', created_at timestamptz default now()
);

-- ---------- comunidade ----------
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users on delete cascade default auth.uid(),
  addressee uuid not null references auth.users on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'aceita')),
  created_at timestamptz default now(),
  unique (requester, addressee), check (requester <> addressee)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users on delete cascade default auth.uid(),
  receiver uuid not null references auth.users on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz default now()
);
create or replace function public.are_connected(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.connections where status = 'aceita'
    and ((requester = a and addressee = b) or (requester = b and addressee = a)))
$$;

-- ---------- privados ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null, body text default '', link text default '#/', read boolean default false,
  created_at timestamptz default now()
);
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  answers jsonb not null, scores jsonb not null, total int not null,
  created_at timestamptz default now()
);
create table public.plans (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  focus text default '', goals jsonb default '[]', updated_at timestamptz default now()
);

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- gatilhos de notificação ----------
create or replace function public.notify_connection() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pendente' then
    insert into public.notifications (user_id, title, body, link)
    select new.addressee, 'Novo pedido de conexão', coalesce(p.name, 'Um membro') || ' quer se conectar com você.', '#/comunidade/pedidos'
    from public.profiles p where p.id = new.requester;
  end if;
  return new;
end $$;
create trigger on_connection after insert on public.connections for each row execute function public.notify_connection();

create or replace function public.notify_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select id, 'Novo evento na agenda', new.title, '#/evento/' || new.id from public.profiles;
  return new;
end $$;
create trigger on_event after insert on public.events for each row execute function public.notify_event();

-- ---------- RLS ----------
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.journey_steps enable row level security;
alter table public.member_steps enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.materials enable row level security;
alter table public.mentors enable row level security;
alter table public.mentor_requests enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.diagnostics enable row level security;
alter table public.plans enable row level security;

-- papéis: cada um vê o próprio; admin gerencia
create policy roles_read on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy roles_admin on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- perfis: membros logados veem perfis públicos; cada um edita o seu
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_own on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- conteúdo do clube: todos leem, admin escreve
create policy steps_read on public.journey_steps for select to authenticated using (true);
create policy steps_admin on public.journey_steps for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy events_read on public.events for select to authenticated using (true);
create policy events_admin on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy materials_read on public.materials for select to authenticated using (true);
create policy materials_admin on public.materials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy mentors_read on public.mentors for select to authenticated using (true);
create policy mentors_admin on public.mentors for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- RSVPs: todos veem quem vai; cada um confirma/cancela a própria presença
create policy rsvps_read on public.rsvps for select to authenticated using (true);
create policy rsvps_own on public.rsvps for insert to authenticated with check (user_id = auth.uid());
create policy rsvps_upd on public.rsvps for update to authenticated using (user_id = auth.uid());
create policy rsvps_del on public.rsvps for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- privados: só o dono (e admin)
create policy ms_own on public.member_steps for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy diag_own on public.diagnostics for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy plans_own on public.plans for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy mreq_own on public.mentor_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy mreq_ins on public.mentor_requests for insert to authenticated with check (user_id = auth.uid());
create policy mreq_admin on public.mentor_requests for update to authenticated using (public.is_admin());
create policy notif_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notif_upd on public.notifications for update to authenticated using (user_id = auth.uid());
create policy notif_ins on public.notifications for insert to authenticated with check (user_id = auth.uid());

-- conexões: só os envolvidos
create policy conn_read on public.connections for select to authenticated using (requester = auth.uid() or addressee = auth.uid() or public.is_admin());
create policy conn_ins on public.connections for insert to authenticated with check (requester = auth.uid() and status = 'pendente');
create policy conn_accept on public.connections for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid());
create policy conn_del on public.connections for delete to authenticated using (requester = auth.uid() or addressee = auth.uid());

-- mensagens: só remetente/destinatário; enviar só para conexões aceitas
create policy msg_read on public.messages for select to authenticated using (sender = auth.uid() or receiver = auth.uid());
create policy msg_ins on public.messages for insert to authenticated with check (sender = auth.uid() and public.are_connected(sender, receiver));

-- ---------- conteúdo inicial ----------
insert into public.journey_steps (id, ord, key, title, description, minutes, route, label) values
 ('s1',1,'boas-vindas','Boas-vindas ao Clube','Entenda como o Clube do ROI funciona, os pilares do ecossistema e o que esperar dos próximos 90 dias.',5,'#/jornada','Ver boas-vindas'),
 ('s2',2,'perfil','Conhecendo você','Compartilhe mais sobre sua trajetória, empresa e objetivos.',15,'#/perfil','Completar perfil'),
 ('s3',3,'encontro','Seu primeiro encontro','Confirme presença em um encontro da agenda e conheça os membros pessoalmente.',5,'#/agenda','Abrir agenda'),
 ('s4',4,'conexoes','Conexões iniciais','Conecte-se com pelo menos 3 membros alinhados ao seu momento.',10,'#/comunidade','Explorar membros'),
 ('s5',5,'biblioteca','Base de conhecimento','Acesse o Guia Estratégico de Crescimento na biblioteca.',20,'#/biblioteca','Abrir biblioteca'),
 ('s6',6,'diagnostico','Diagnóstico Empresarial','Avalie 8 áreas da sua empresa e descubra onde estão as maiores alavancas de crescimento.',25,'#/diagnosticos','Fazer diagnóstico'),
 ('s7',7,'plano','Plano de Crescimento','Transforme o diagnóstico em metas claras para os próximos 90 dias.',30,'#/plano','Montar plano');

insert into public.materials (title, kind, size, category, cover) values
 ('Guia Estratégico de Crescimento','PDF','12 MB','Estratégia','img/mat-guia.jpg'),
 ('Estratégias de Expansão Global','Vídeo','28 min','Expansão','img/mat-video.jpg');

-- Para tornar alguém administrador (depois que a pessoa criar a conta):
-- insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'SEU-EMAIL@dominio.com';
