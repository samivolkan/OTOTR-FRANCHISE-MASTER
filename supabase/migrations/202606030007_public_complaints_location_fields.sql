alter table public.public_complaints
  add column if not exists province text,
  add column if not exists district text;

update public.public_complaints
set
  province = coalesce(province, ''),
  district = coalesce(district, '')
where province is null or district is null;

alter table public.public_complaints
  alter column province set not null,
  alter column district set not null;
