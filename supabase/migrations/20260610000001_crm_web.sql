-- ============================================================================
-- CRM Web Sigmetría — esquema normalizado (3FN)
-- Proyecto Supabase: lslzhgmoaxgkcjeweqaz (COMPARTIDO con la app)
--
-- 100% ADITIVO E IDEMPOTENTE: solo crea tablas nuevas y agrega columnas con
-- IF NOT EXISTS. No modifica, renombra ni borra nada existente → seguro sobre
-- la base de producción de la app.
--
-- Diseño (3FN): cada hecho vive en una sola tabla.
--   leads               → la PERSONA (1 fila por contacto, identificada por email)
--   lead_magnets        → el CATÁLOGO de recursos (e-books, plantillas, checklists)
--   lead_magnet_descargas → cada DESCARGA (qué recurso, desde qué página, cuándo)  [N:N]
--   consentimientos     → cada CONSENTIMIENTO otorgado (privacidad/cookies/email)   [log legal]
--
-- Aplicar: Supabase → SQL Editor → pegar → Run.
-- ============================================================================

-- 1) CATÁLOGO de lead magnets / e-books --------------------------------------
create table if not exists public.lead_magnets (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,          -- 'ebook-digitalizar', 'plantilla-recorrida', ...
  titulo       text not null,
  tipo         text not null check (tipo in ('ebook','plantilla','checklist','calculadora','guia')),
  descripcion  text,
  storage_path text,                            -- archivo en el bucket 'lead-magnets' (ej: 'ebook-digitalizar.pdf')
  persona      text,                            -- 'BP1' | 'BP2' | 'BP3' | 'ALL'
  funnel       text check (funnel in ('tofu','mofu','bofu')),
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 2) Enriquecer LEADS (la persona) — aditivo ---------------------------------
alter table public.leads add column if not exists tipo_contacto          text    default 'suscriptor'; -- 'suscriptor' | 'lead' | 'cliente'
alter table public.leads add column if not exists es_usuario_app         boolean default false;        -- ¿se registró en la app?
alter table public.leads add column if not exists app_user_id            uuid;                          -- id del usuario en la app (si aplica)
alter table public.leads add column if not exists contrato_servicio      boolean default false;
alter table public.leads add column if not exists servicio_contratado    text;
alter table public.leads add column if not exists acepta_privacidad      boolean default false;         -- obligatorio para enviar el formulario
alter table public.leads add column if not exists acepta_email_marketing boolean default false;         -- opt-in para mailing
alter table public.leads add column if not exists acepta_cookies         boolean default false;
alter table public.leads add column if not exists ultima_actividad_at    timestamptz default now();
alter table public.leads add column if not exists notas_crm              text;

-- 3) DESCARGAS de lead magnets (relación N:N persona ↔ recurso) ---------------
create table if not exists public.lead_magnet_descargas (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid references public.leads(id) on delete set null,
  lead_magnet_key  text not null references public.lead_magnets(key),
  origen_pagina    text,                          -- URL completa de la publicación
  origen_slug      text,                          -- slug del blog/landing de origen
  canal            text default 'web',
  etapa_funnel     text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_lmd_lead on public.lead_magnet_descargas(lead_id);
create index if not exists idx_lmd_key  on public.lead_magnet_descargas(lead_magnet_key);

-- 4) CONSENTIMIENTOS (prueba legal — Ley 25.326) -----------------------------
create table if not exists public.consentimientos (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references public.leads(id) on delete cascade,
  tipo          text not null check (tipo in ('privacidad','cookies','email_marketing')),
  otorgado      boolean not null default true,
  texto_version text,                            -- versión del texto aceptado (ej: 'pp-2026-06')
  pagina        text,
  user_agent    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_consent_lead on public.consentimientos(lead_id);

-- ============================================================================
-- RLS: la web inserta con la ANON key → solo INSERT anónimo.
-- La lectura del CRM queda para service_role / panel autenticado (NO anon).
-- ============================================================================
alter table public.lead_magnets          enable row level security;
alter table public.lead_magnet_descargas enable row level security;
alter table public.consentimientos       enable row level security;

do $$ begin
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

-- 5) SEED del catálogo de lead magnets ---------------------------------------
insert into public.lead_magnets (key, titulo, tipo, descripcion, storage_path, persona, funnel) values
  ('ebook-digitalizar',   'Digitalizá tu gestión de Higiene y Seguridad',  'ebook',     'Las 5 cosas que perdés gestionando HyS en Excel y cómo ordenar tu cartera.', 'ebook-digitalizar.pdf',   'BP1', 'tofu'),
  ('plantilla-recorrida', 'Plantilla profesional de recorrida de seguridad','plantilla','Plantilla A4 editable para estandarizar tus recorridas.',                  'plantilla-recorrida.pdf', 'BP1', 'tofu'),
  ('plantilla-iper',      'Plantilla de Matriz IPER',                       'plantilla','Matriz IPER con metodología y ejemplos.',                                   'plantilla-iper.pdf',      'BP1', 'tofu'),
  ('plan-capacitacion',   'Plan Anual de Capacitación en Seguridad',        'plantilla','Plantilla + cronograma de capacitación anual.',                             'plan-capacitacion.pdf',   'BP2', 'tofu'),
  ('checklist-iso-45001', 'Checklist de Autoevaluación ISO 45001',          'checklist','Medí cuánto de ISO 45001 ya cumplís hoy.',                                  'checklist-iso-45001.pdf', 'BP2', 'tofu')
on conflict (key) do nothing;
