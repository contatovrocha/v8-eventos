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
  phone text default '', site text default '', instagram text default '',
  member_since int default extract(year from now())::int,
  created_at timestamptz default now()
);

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

-- ---------- onboarding (documento "Experiência do membro") ----------
-- Etapa 1: cadastro feito pela equipe logo após a compra no jantar
create table public.member_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  name text not null, phone text default '', email text not null, company text default '',
  owner text default '', acquired_at timestamptz default now(),
  status text not null default 'Compra confirmada', notes text default '',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create unique index member_intake_email on public.member_intake (lower(email));
-- Etapa 4: respostas do formulário (salvas automaticamente)
create table public.onboarding (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  answers jsonb not null default '{}', updated_at timestamptz default now()
);
-- Etapa 6: ficha estratégica (interna da equipe)
create table public.member_sheets (
  user_id uuid primary key references auth.users on delete cascade,
  perfil text default '', oportunidades text default '', conexoes text default '',
  especialistas jsonb default '[]', proximos text default '', updated_at timestamptz default now()
);
-- Etapas 7 e 8: reunião e plano de desenvolvimento (visível para o membro)
create table public.dev_plans (
  user_id uuid primary key references auth.users on delete cascade,
  objetivos text default '', prioridades text default '', oportunidades text default '',
  acoes jsonb default '[]', historico jsonb default '[]',
  meeting_at timestamptz, meeting_status text default 'Não agendada', updated_at timestamptz default now()
);
-- Etapa 5: acesso ao Grupo VIP
create table public.vip_access (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  status text not null default 'solicitado' check (status in ('solicitado', 'liberado')),
  requested_at timestamptz default now(), approved_at timestamptz
);
-- configurações do clube (link do grupo, responsáveis da equipe)
create table public.settings (key text primary key, value jsonb not null default '{}');

-- novo usuário: só convidados; cria perfil, vincula ao cadastro do jantar e envia boas-vindas
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare it public.member_intake;
begin
  select * into it from public.member_intake where lower(email) = lower(new.email) limit 1;
  -- clube privado: só entra quem a equipe cadastrou (o primeiro usuário, antes de existir admin, é liberado)
  if it.id is null and exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'Este e-mail ainda não foi liberado pela equipe do Clube do ROI.';
  end if;
  insert into public.profiles (id, name, company, phone)
    values (new.id, coalesce(it.name, new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), coalesce(it.company, ''), coalesce(it.phone, ''));
  if it.id is not null then
    update public.member_intake set user_id = new.id, updated_at = now(),
      status = case when status in ('Compra confirmada', 'Contato realizado') then 'Acesso enviado' else status end
    where id = it.id;
  end if;
  insert into public.notifications (user_id, title, body, link)
    values (new.id, 'Bem-vindo ao Clube do ROI', 'Sua jornada de entrada começou. Comece pelas boas-vindas.', '#/jornada');
  return new;
end $$;

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
alter table public.member_intake enable row level security;
alter table public.onboarding enable row level security;
alter table public.member_sheets enable row level security;
alter table public.dev_plans enable row level security;
alter table public.vip_access enable row level security;
alter table public.settings enable row level security;

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
create policy mreq_own on public.mentor_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy mreq_ins on public.mentor_requests for insert to authenticated with check (user_id = auth.uid());
create policy mreq_admin on public.mentor_requests for update to authenticated using (public.is_admin());
create policy notif_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notif_upd on public.notifications for update to authenticated using (user_id = auth.uid());
create policy notif_ins on public.notifications for insert to authenticated with check (user_id = auth.uid());

-- onboarding: o membro lê e grava as próprias respostas; a equipe lê todas
create policy onb_own on public.onboarding for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
-- cadastro do jantar e ficha estratégica: só a equipe
create policy intake_admin on public.member_intake for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy sheets_admin on public.member_sheets for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- plano: o membro lê o seu e marca ações; a equipe escreve
create policy plan_read on public.dev_plans for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy plan_member on public.dev_plans for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy plan_admin on public.dev_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Grupo VIP: o membro só pode solicitar; a equipe libera
create policy vip_read on public.vip_access for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy vip_req on public.vip_access for insert to authenticated with check (user_id = auth.uid() and status = 'solicitado');
create policy vip_req_upd on public.vip_access for update to authenticated using (user_id = auth.uid() and status = 'solicitado') with check (user_id = auth.uid() and status = 'solicitado');
create policy vip_admin on public.vip_access for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- configurações: todos leem (link do grupo só aparece na tela depois da liberação), equipe escreve
create policy settings_read on public.settings for select to authenticated using (true);
create policy settings_admin on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- a equipe pode criar notificações para os membros
create policy notif_admin on public.notifications for insert to authenticated with check (public.is_admin());

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
 ('s1',1,'boas-vindas','Boas-vindas ao Clube','Conheça o ecossistema, como funciona sua jornada de integração e o que esperar do clube.',5,'#/jornada/boas-vindas','Ver boas-vindas'),
 ('s2',2,'membro','Conhecendo o membro','Bloco 1 · Sua trajetória como empresário e o motivo de entrar no clube.',5,'#/onboarding/1','Responder bloco 1'),
 ('s3',3,'empresa','Conhecendo sua empresa','Bloco 2 · Segmento, modelo de negócio, porte e estrutura.',7,'#/onboarding/2','Responder bloco 2'),
 ('s4',4,'diagnostico','Diagnóstico empresarial','Bloco 3 · Desafios atuais e o que impede o crescimento.',6,'#/onboarding/3','Responder bloco 3'),
 ('s5',5,'futuro','Oportunidades e visão de futuro','Bloco 4 · Objetivos para os próximos 12 meses e o problema que você resolveria em 90 dias.',6,'#/onboarding/4','Responder bloco 4'),
 ('s6',6,'networking','Networking e conexões estratégicas','Bloco 5 · Que empresários você quer conhecer e o que pode oferecer ao ecossistema.',5,'#/onboarding/5','Responder bloco 5'),
 ('s7',7,'reuniao','Reunião estratégica individual','Depois de analisar suas respostas, a equipe agenda uma conversa de 45 a 60 minutos com você.',60,'#/plano','Ver detalhes');

insert into public.settings (key, value) values
 ('vip', '{"link": "", "approval": true, "rules": "Grupo exclusivo para membros do Clube do ROI.\n• Não compartilhe o link.\n• Apresente-se ao entrar: nome, empresa e o que você busca.\n• Compartilhe oportunidades e conteúdos relevantes; evite propaganda.\n• Respeito e sigilo sobre o que é conversado aqui."}'),
 ('team', '{}');

insert into public.materials (title, kind, size, category, cover) values
 ('Guia Estratégico de Crescimento','PDF','12 MB','Estratégia','img/mat-guia.jpg'),
 ('Estratégias de Expansão Global','Vídeo','28 min','Expansão','img/mat-video.jpg');

-- Para tornar alguém administrador (depois que a pessoa criar a conta):
-- insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'SEU-EMAIL@dominio.com';
