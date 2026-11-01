-- ============================================================================
-- ComuniTarr · Migración 001 · Estructura real por barrio
-- Ejecutar UNA VEZ en Supabase → SQL Editor (es idempotente: se puede repetir).
-- ============================================================================

-- Barrios válidos (coinciden con pages/NeighborhoodSelection.tsx) + 'GENERAL' (toda la ciudad)
create table if not exists public.barrios (
  nombre   text primary key,
  lat      double precision,
  lng      double precision
);
insert into public.barrios (nombre, lat, lng) values
  ('Part Alta',              41.1190, 1.2575),
  ('Eixample',               41.1155, 1.2490),
  ('Nou Eixample',           41.1195, 1.2430),
  ('El Serrallo',            41.1085, 1.2530),
  ('Sant Pere i Sant Pau',   41.1255, 1.2420),
  ('Torreforta',             41.1380, 1.2630),
  ('Campclar',               41.1360, 1.2330),
  ('Bonavista',              41.1450, 1.2790),
  ('Sant Salvador',          41.1540, 1.2370),
  ('Llevant / La Móra',      41.1300, 1.2900),
  ('Vall de l''Arrabassada', 41.1260, 1.2800),
  ('GENERAL',                41.1189, 1.2445)
on conflict (nombre) do nothing;
alter table public.barrios enable row level security;
drop policy if exists "barrios_lectura" on public.barrios;
create policy "barrios_lectura" on public.barrios for select using (true);

-- ---------------------------------------------------------------------------
-- 1. EVENTOS  (calendario + mapa + talleres)
-- ---------------------------------------------------------------------------
create table if not exists public.eventos (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  descripcion       text,
  categoria         text default 'Cultura',
  barrio            text not null default 'GENERAL',
  fecha_actividad   date not null,
  fecha_fin         date,
  hora              text,
  ubicacion         text,
  direccion         text,
  lat               double precision,
  lng               double precision,
  telefono          text,
  email             text,
  url               text,
  gratuito          boolean,
  fuente            text not null default 'vecino',   -- 'vecino' | 'agenda_cultural' | ...
  id_externo        text unique,                      -- clave para upsert desde el robot
  verificado        boolean not null default false,
  creador_id        uuid references auth.users(id) on delete set null,
  fecha_publicacion date not null default current_date,
  created_at        timestamptz not null default now()
);
create index if not exists eventos_barrio_fecha_idx on public.eventos (barrio, fecha_actividad);

-- ---------------------------------------------------------------------------
-- 2. TRABAJOS  (empleo)
-- ---------------------------------------------------------------------------
create table if not exists public.trabajos (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  empresa           text,
  descripcion       text,
  barrio            text not null default 'GENERAL',
  ubicacion         text,
  lat               double precision,
  lng               double precision,
  telefono          text,
  email             text,
  url_inscripcion   text,                             -- enlace oficial de inscripción
  contrato          text,
  jornada           text,
  fuente            text not null default 'vecino',   -- 'vecino' | 'feina_activa' | ...
  id_externo        text unique,
  verificado        boolean not null default false,
  creador_id        uuid references auth.users(id) on delete set null,
  fecha_publicacion date not null default current_date,
  fecha_caducidad   date,
  created_at        timestamptz not null default now()
);
create index if not exists trabajos_barrio_fecha_idx on public.trabajos (barrio, fecha_publicacion desc);

-- ---------------------------------------------------------------------------
-- 3. VOLUNTARIADOS
-- ---------------------------------------------------------------------------
create table if not exists public.voluntariados (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  descripcion       text,
  entidad           text,
  barrio            text not null default 'GENERAL',
  ubicacion         text,
  lat               double precision,
  lng               double precision,
  telefono          text,
  email             text,
  url               text,
  fecha_actividad   date,
  hora              text,
  fuente            text not null default 'vecino',
  id_externo        text unique,
  verificado        boolean not null default false,
  creador_id        uuid references auth.users(id) on delete set null,
  fecha_publicacion date not null default current_date,
  created_at        timestamptz not null default now()
);
create index if not exists voluntariados_barrio_idx on public.voluntariados (barrio, fecha_actividad);

-- ---------------------------------------------------------------------------
-- 4. CENTROS CÍVICOS  (directorio real con teléfono y coordenadas)
-- ---------------------------------------------------------------------------
create table if not exists public.centros_civicos (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  descripcion       text,
  barrio            text not null default 'GENERAL',
  direccion         text,
  lat               double precision,
  lng               double precision,
  telefono          text,
  email             text,
  web               text,
  horario           text,
  fuente            text not null default 'manual',
  id_externo        text unique,
  verificado        boolean not null default false,
  fecha_publicacion date not null default current_date,
  created_at        timestamptz not null default now()
);
create index if not exists centros_barrio_idx on public.centros_civicos (barrio);

-- ---------------------------------------------------------------------------
-- RLS: lectura pública · los vecinos solo escriben lo suyo ('vecino') ·
--      el robot usa la service_role key y se salta RLS.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['eventos','trabajos','voluntariados']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%1$s_lectura" on public.%1$I', t);
    execute format('create policy "%1$s_lectura" on public.%1$I for select using (true)', t);
    execute format('drop policy if exists "%1$s_insertar_vecino" on public.%1$I', t);
    execute format($p$create policy "%1$s_insertar_vecino" on public.%1$I for insert to authenticated
                      with check (fuente = 'vecino' and creador_id = auth.uid())$p$, t);
    execute format('drop policy if exists "%1$s_editar_propio" on public.%1$I', t);
    execute format($p$create policy "%1$s_editar_propio" on public.%1$I for update to authenticated
                      using (fuente = 'vecino' and creador_id = auth.uid())$p$, t);
    execute format('drop policy if exists "%1$s_borrar_propio" on public.%1$I', t);
    execute format($p$create policy "%1$s_borrar_propio" on public.%1$I for delete to authenticated
                      using (fuente = 'vecino' and creador_id = auth.uid())$p$, t);
  end loop;
end $$;

alter table public.centros_civicos enable row level security;
drop policy if exists "centros_lectura" on public.centros_civicos;
create policy "centros_lectura" on public.centros_civicos for select using (true);

-- ---------------------------------------------------------------------------
-- Tiempo real (calendario y mapa se actualizan solos)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['eventos','trabajos','voluntariados','centros_civicos']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Columna `barrio` + `fecha_publicacion` en el RESTO de tablas existentes
--    (se rellena desde `neighborhood` y se mantiene sincronizada con un trigger)
-- ---------------------------------------------------------------------------
create or replace function public.sync_barrio() returns trigger language plpgsql as $$
begin
  if new.barrio is null then new.barrio := new.neighborhood; end if;
  if new.neighborhood is null then new.neighborhood := new.barrio; end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'events','volunteer_opportunities','clubs','challenges','marketplace_items','incidents',
    'support_circles','patrol_groups','vital_needs','polls','announcements','forum_messages',
    'stories','gallery','workshops'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I add column if not exists barrio text', t);
      execute format('alter table public.%I add column if not exists fecha_publicacion date default current_date', t);
      if exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name=t and column_name='neighborhood') then
        execute format('update public.%I set barrio = neighborhood where barrio is null', t);
        execute format('drop trigger if exists trg_sync_barrio on public.%I', t);
        execute format('create trigger trg_sync_barrio before insert or update on public.%I
                        for each row execute function public.sync_barrio()', t);
      end if;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Limpieza de datos de ejemplo antiguos (solo filas sin autor real)
-- ---------------------------------------------------------------------------
delete from public.events where creator_id is null;
