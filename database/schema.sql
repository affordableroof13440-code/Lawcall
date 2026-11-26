create extension if not exists "pgcrypto";

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  external_call_id text unique,
  caller_name text,
  caller_phone text,
  caller_email text,
  case_type text check (case_type in ('personal_injury', 'workplace_harassment', 'unknown')),
  injury_subtype text,
  status text not null default 'new' check (status in ('new','in_progress','needs_callback','qualified','not_a_case','closed')),
  severity_score integer not null default 0 check (severity_score between 0 and 100),
  urgency text not null default 'routine' check (urgency in ('immediate','same_day','routine','screened_out')),
  summary text,
  description text,
  transcript text,
  recording_url text,
  recording_duration_seconds integer,
  incident_location text,
  incident_date timestamptz,
  police_came boolean,
  ambulance_came boolean,
  went_to_hospital boolean,
  medical_reports_available boolean,
  at_fault_party text,
  insurance_information text,
  witness_names text,
  workplace text,
  employer_name text,
  harassment_type text,
  reporter_retaliation_risk text,
  crm_external_id text,
  consent_to_record boolean not null default false,
  consent_to_contact boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists call_notes (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references calls(id) on delete cascade,
  author text not null default 'system',
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists call_events (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references calls(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists crm_syncs (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references calls(id) on delete cascade,
  provider text not null,
  external_id text,
  status text not null default 'pending',
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calls_created_at_idx on calls(created_at desc);
create index if not exists calls_status_idx on calls(status);
create index if not exists calls_case_type_idx on calls(case_type);
create index if not exists calls_severity_idx on calls(severity_score desc);
