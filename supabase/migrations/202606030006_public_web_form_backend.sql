create table if not exists public.public_appointment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  source text not null default 'public_web',
  full_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  plate text,
  service text,
  brand_model text,
  model_year integer,
  mileage integer,
  preferred_date date,
  preferred_time text,
  note text,
  kvkk_consent boolean not null default false,
  contact_consent boolean not null default false,
  consent_version text,
  utm jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  request_meta jsonb not null default '{}'::jsonb
);

create table if not exists public.public_franchise_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  source text not null default 'public_web',
  full_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  application_type text,
  budget text,
  region text,
  has_location text,
  square_meters text,
  daily_target text,
  note text,
  kvkk_consent boolean not null default false,
  contact_consent boolean not null default false,
  consent_version text,
  utm jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  request_meta jsonb not null default '{}'::jsonb
);

create table if not exists public.public_complaints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  source text not null default 'public_web',
  full_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  report_no text not null,
  plate text,
  branch text,
  complaint_type text not null,
  description text not null,
  file_note text,
  kvkk_consent boolean not null default false,
  contact_consent boolean not null default false,
  consent_version text,
  utm jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  request_meta jsonb not null default '{}'::jsonb
);

create table if not exists public.public_branches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  province text not null,
  district text not null,
  address text,
  phone text,
  maps_url text,
  services text[] not null default array[]::text[],
  is_active boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.public_report_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  report_no text not null unique,
  plate text not null,
  verify_code text not null,
  report_date date,
  package_name text,
  branch text,
  vehicle text,
  finding text,
  categories text[] not null default array[]::text[],
  summary_url text,
  verification_status text not null default 'Doğrulandı',
  is_public boolean not null default true
);

alter table public.public_appointment_requests enable row level security;
alter table public.public_franchise_applications enable row level security;
alter table public.public_complaints enable row level security;
alter table public.public_branches enable row level security;
alter table public.public_report_records enable row level security;

revoke all on public.public_appointment_requests from anon, authenticated;
revoke all on public.public_franchise_applications from anon, authenticated;
revoke all on public.public_complaints from anon, authenticated;
revoke all on public.public_branches from anon, authenticated;
revoke all on public.public_report_records from anon, authenticated;

grant all on public.public_appointment_requests to service_role;
grant all on public.public_franchise_applications to service_role;
grant all on public.public_complaints to service_role;
grant all on public.public_branches to service_role;
grant all on public.public_report_records to service_role;

create index if not exists public_appointment_requests_created_at_idx on public.public_appointment_requests (created_at desc);
create index if not exists public_franchise_applications_created_at_idx on public.public_franchise_applications (created_at desc);
create index if not exists public_complaints_created_at_idx on public.public_complaints (created_at desc);
create index if not exists public_branches_location_idx on public.public_branches (province, district) where is_active;
create index if not exists public_report_records_lookup_idx on public.public_report_records (report_no, plate) where is_public;

insert into public.public_branches (name, province, district, address, phone, maps_url, services, sort_order)
values
  ('OTOTR Ataşehir', 'İstanbul', 'Ataşehir', 'Ataşehir, İstanbul', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Ata%C5%9Fehir', array['Mini', 'Standart', 'Plus', 'Premium'], 10),
  ('OTOTR Kadıköy', 'İstanbul', 'Kadıköy', 'Kadıköy, İstanbul', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Kad%C4%B1k%C3%B6y', array['Standart', 'Plus', 'Premium'], 20),
  ('OTOTR Çankaya', 'Ankara', 'Çankaya', 'Çankaya, Ankara', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20%C3%87ankaya', array['Mini', 'Standart', 'Plus'], 30),
  ('OTOTR Nilüfer', 'Bursa', 'Nilüfer', 'Nilüfer, Bursa', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Nil%C3%BCfer', array['Standart', 'Plus'], 40),
  ('OTOTR Bornova', 'İzmir', 'Bornova', 'Bornova, İzmir', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Bornova', array['Mini', 'Standart', 'Premium'], 50),
  ('OTOTR Kepez', 'Antalya', 'Kepez', 'Kepez, Antalya', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Kepez', array['Standart', 'Plus'], 60),
  ('OTOTR Seyhan', 'Adana', 'Seyhan', 'Seyhan, Adana', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Seyhan', array['Mini', 'Standart'], 70),
  ('OTOTR Ortahisar', 'Trabzon', 'Ortahisar', 'Ortahisar, Trabzon', '0555 888 0501', 'https://maps.google.com/?q=OTOTR%20Ortahisar', array['Standart', 'Plus'], 80)
on conflict do nothing;

insert into public.public_report_records (
  report_no,
  plate,
  verify_code,
  report_date,
  package_name,
  branch,
  vehicle,
  finding,
  categories,
  summary_url
)
values (
  'OTR-2026-1842',
  '34 OTR 360',
  '1842',
  '2026-05-22',
  'OTOTR Premium',
  'OTOTR Ataşehir',
  '2021 Renault Clio 1.0 TCe',
  'Sol ön çamurluk boyalı, motor ve şanzıman kontrolleri normal.',
  array['Kaporta', 'Mekanik', 'Elektronik', 'Fren'],
  '#'
)
on conflict (report_no) do update set
  plate = excluded.plate,
  verify_code = excluded.verify_code,
  report_date = excluded.report_date,
  package_name = excluded.package_name,
  branch = excluded.branch,
  vehicle = excluded.vehicle,
  finding = excluded.finding,
  categories = excluded.categories,
  summary_url = excluded.summary_url,
  is_public = true;
