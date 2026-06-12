-- ============================================================================
-- CRM Web Sigmetría — esquema normalizado (3FN) y MULTI-TENANT
-- Proyecto Supabase: lslzhgmoaxgkcjeweqaz (Sigmetria-app) — consolidado con la app.
--
-- Los leads/CRM viven en el MISMO proyecto que las consultoras, para que el
-- módulo CRM (integrado a la app) pueda cruzar datos y aplicar RLS por consultora.
-- 100% ADITIVO E IDEMPOTENTE (create/alter IF NOT EXISTS): seguro sobre prod.
--
-- 3FN:
--   leads                 → la PERSONA (1 fila por contacto)
--   lead_magnets          → CATÁLOGO de recursos por consultora
--   lead_magnet_descargas → cada DESCARGA (recurso × página × persona)   [N:N]
--   consentimientos       → cada CONSENTIMIENTO (privacidad/cookies/email) [log legal]
-- Todas con consultora_id (multi-tenant; hoy NULL = Sigmetría casa).
-- ============================================================================

-- 1) LEADS (la persona / contacto) -------------------------------------------
create table if not exists public.leads (
  id                     uuid primary key default gen_random_uuid(),
  consultora_id          uuid,                          -- tenant dueño del lead (NULL = Sigmetría)
  nombre                 text,
  email                  text,
  telefono               text,
  mensaje                text,
  servicios_interes      text[],
  fuente                 text default 'web',
  primer_canal           text,
  canales_visitados      text[],
  pagina_origen          text,
  etapa_funnel           text,                          -- 'tofu' | 'mofu' | 'bofu'
  lead_magnet            text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  -- CRM
  tipo_contacto          text default 'suscriptor',     -- 'suscriptor' | 'lead' | 'cliente'
  es_usuario_app         boolean default false,
  app_user_id            uuid,
  contrato_servicio      boolean default false,
  servicio_contratado    text,
  -- consentimientos (estado actual; el detalle/historial va en consentimientos)
  acepta_privacidad      boolean default false,
  acepta_email_marketing boolean default false,
  acepta_cookies         boolean default false,
  acepta_condiciones_at  timestamptz,
  ultima_actividad_at    timestamptz default now(),
  notas_crm              text,
  created_at             timestamptz not null default now()
);
-- Por si la tabla ya existiera con menos columnas (idempotente):
alter table public.leads add column if not exists consultora_id          uuid;
alter table public.leads add column if not exists tipo_contacto          text default 'suscriptor';
alter table public.leads add column if not exists es_usuario_app         boolean default false;
alter table public.leads add column if not exists app_user_id            uuid;
alter table public.leads add column if not exists contrato_servicio      boolean default false;
alter table public.leads add column if not exists servicio_contratado    text;
alter table public.leads add column if not exists acepta_privacidad      boolean default false;
alter table public.leads add column if not exists acepta_email_marketing boolean default false;
alter table public.leads add column if not exists acepta_cookies         boolean default false;
alter table public.leads add column if not exists ultima_actividad_at    timestamptz default now();
alter table public.leads add column if not exists notas_crm              text;
create index if not exists idx_leads_consultora on public.leads(consultora_id);
create index if not exists idx_leads_email       on public.leads(email);

-- 2) CATÁLOGO de lead magnets ------------------------------------------------
create table if not exists public.lead_magnets (
  id            uuid primary key default gen_random_uuid(),
  consultora_id uuid,
  key           text not null,
  titulo        text not null,
  tipo          text not null check (tipo in ('ebook','plantilla','checklist','calculadora','guia')),
  descripcion   text,
  storage_path  text,
  persona       text,
  funnel        text check (funnel in ('tofu','mofu','bofu')),
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);
create unique index if not exists uq_lead_magnets_tenant_key
  on public.lead_magnets (coalesce(consultora_id,'00000000-0000-0000-0000-000000000000'::uuid), key);

-- 3) DESCARGAS de lead magnets (N:N) -----------------------------------------
create table if not exists public.lead_magnet_descargas (
  id               uuid primary key default gen_random_uuid(),
  consultora_id    uuid,
  lead_id          uuid references public.leads(id) on delete set null,
  email            text,                          -- enlace por email (captura anónima sin leer lead_id)
  lead_magnet_key  text not null,
  origen_pagina    text,
  origen_slug      text,
  canal            text default 'web',
  etapa_funnel     text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_lmd_email       on public.lead_magnet_descargas(email);
create index if not exists idx_lmd_key         on public.lead_magnet_descargas(lead_magnet_key);
create index if not exists idx_lmd_consultora  on public.lead_magnet_descargas(consultora_id);

-- 4) CONSENTIMIENTOS (Ley 25.326) --------------------------------------------
create table if not exists public.consentimientos (
  id            uuid primary key default gen_random_uuid(),
  consultora_id uuid,
  lead_id       uuid references public.leads(id) on delete cascade,
  email         text,
  tipo          text not null check (tipo in ('privacidad','cookies','email_marketing')),
  otorgado      boolean not null default true,
  texto_version text,
  pagina        text,
  user_agent    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_consent_email     on public.consentimientos(email);
create index if not exists idx_consent_consultora on public.consentimientos(consultora_id);

-- ============================================================================
-- RLS: la web inserta con ANON key → solo INSERT anónimo. Lectura del CRM
-- (panel autenticado) por consultora_id se agrega al construir el módulo.
-- ============================================================================
alter table public.leads                  enable row level security;
alter table public.lead_magnets            enable row level security;
alter table public.lead_magnet_descargas   enable row level security;
alter table public.consentimientos         enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='leads' and policyname='anon insert leads') then
    create policy "anon insert leads" on public.leads for insert to anon with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lead_magnets' and policyname='catalogo lectura activo') then
    create policy "catalogo lectura activo" on public.lead_magnets for select to anon using (activo = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lead_magnet_descargas' and policyname='anon insert descargas') then
    create policy "anon insert descargas" on public.lead_magnet_descargas for insert to anon with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='consentimientos' and policyname='anon insert consent') then
    create policy "anon insert consent" on public.consentimientos for insert to anon with check (true);
  end if;
end $$;

-- 5) SEED del catálogo -------------------------------------------------------
insert into public.lead_magnets (key, titulo, tipo, descripcion, storage_path, persona, funnel) values
  ('ebook-digitalizar',   'Digitalizá tu gestión de Higiene y Seguridad',  'ebook',     'Las 5 cosas que perdés gestionando HyS en Excel y cómo ordenar tus clientes.', 'ebook-digitalizar.pdf',   'BP1', 'tofu'),
  ('plantilla-recorrida', 'Plantilla profesional de recorrida de seguridad','plantilla','Plantilla A4 editable para estandarizar tus recorridas.',                   'plantilla-recorrida.pdf', 'BP1', 'tofu'),
  ('plantilla-iper',      'Plantilla de Matriz IPER',                       'plantilla','Matriz IPER con metodología y ejemplos.',                                    'plantilla-iper.pdf',      'BP1', 'tofu'),
  ('plan-capacitacion',   'Plan Anual de Capacitación en Seguridad',        'plantilla','Plantilla + cronograma de capacitación anual.',                              'plan-capacitacion.pdf',   'BP2', 'tofu'),
  ('checklist-iso-45001', 'Checklist de Autoevaluación ISO 45001',          'checklist','Medí cuánto de ISO 45001 ya cumplís hoy.',                                   'checklist-iso-45001.pdf', 'BP2', 'tofu')
on conflict do nothing;
