-- Additive Kaporta 360 pilot. Existing task ownership and final-report gates are not changed.
create schema if not exists kaporta_private;
revoke all on schema kaporta_private from public, anon;
grant usage on schema kaporta_private to authenticated, service_role;

create table public.k360_sessions (
 id uuid primary key default gen_random_uuid(), case_id uuid not null unique references public.expertise_cases(id),
 task_id uuid not null references public.inspection_tasks(id), profile text not null check(profile in ('hatchback3','sedan4','hatchback5','suv5')),
 status text not null default 'draft' check(status in ('draft','review','approved','returned')),
 revision int not null default 1, findings jsonb not null default '{}', photo_slots jsonb not null default '{}',
 editors uuid[] not null default '{}', return_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.k360_photos (
 id uuid primary key, session_id uuid not null references public.k360_sessions(id), slot text not null,
 kind text not null check(kind in ('ring','upper','detail')), path text not null unique, sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 mime text not null check(mime in ('image/jpeg','image/png','image/webp')), size int not null check(size between 1000 and 20971520),
 width int not null check(width>=720), height int not null check(height>=720),
 captured_at timestamptz not null, uploaded_at timestamptz not null default now(), captured_by uuid not null references public.app_users(id),
 unique(session_id,sha256),check(width::bigint*height<=60000000)
);
create table public.k360_reports (
 id uuid primary key default gen_random_uuid(),session_id uuid not null references public.k360_sessions(id),
 case_revision int not null,session_revision int not null,snapshot jsonb not null,approved_by uuid not null references public.app_users(id),approved_at timestamptz not null default now()
);
create table public.k360_shares (
 id uuid primary key default gen_random_uuid(),report_id uuid not null references public.k360_reports(id),token_hash text not null unique,
 expires_at timestamptz not null,revoked boolean not null default false,created_by uuid not null references public.app_users(id),created_at timestamptz not null default now()
);
create table public.k360_events (
 id bigint generated always as identity primary key,session_id uuid not null references public.k360_sessions(id),actor_id uuid not null references public.app_users(id),
 action text not null,revision int not null,created_at timestamptz not null default now(),detail jsonb not null default '{}'
);
create index on public.k360_photos(session_id);
create index on public.k360_reports(session_id,approved_at desc);
create index on public.k360_shares(report_id);
create index on public.k360_events(session_id);
create index on public.k360_sessions(task_id);
create index on public.k360_photos(captured_by);
create index on public.k360_reports(approved_by);
create index on public.k360_shares(created_by);
create index on public.k360_events(actor_id);
alter table public.k360_sessions enable row level security;
alter table public.k360_photos enable row level security;
alter table public.k360_reports enable row level security;
alter table public.k360_shares enable row level security;
alter table public.k360_events enable row level security;
revoke all on public.k360_sessions,public.k360_photos,public.k360_reports,public.k360_shares,public.k360_events from public,anon,authenticated;
grant select on public.k360_sessions,public.k360_photos to authenticated;

create function kaporta_private.actor() returns public.app_users language sql stable security definer set search_path='' as $$
 select a from public.app_users a where a.auth_user_id=auth.uid() and a.is_active limit 1
$$;
create function kaporta_private.access_case(target uuid,operation text default 'read') returns boolean language plpgsql stable security definer set search_path='' as $$
declare a public.app_users; c public.expertise_cases; t public.inspection_tasks;
begin
 a:=kaporta_private.actor();select * into c from public.expertise_cases where id=target;
 if a.id is null or c.id is null then return false;end if;
 if operation='review' then return coalesce((a.role in ('CEO','GENERAL_MANAGER') or (a.branch_id=c.branch_id and a.role in ('BRANCH_MANAGER','TECHNICAL_SUPERVISOR'))),false);end if;
 if operation='write' then
  if c.is_locked or c.status not in ('TECHNICAL_ENTRY_OPEN','REVISION_REQUESTED') or a.branch_id is distinct from c.branch_id then return false;end if;
  return exists(select 1 from public.inspection_tasks x where x.expertise_case_id=c.id and x.task_key='BODY_PAINT_CHECKUP' and x.owner_user_id=a.id and x.status='OPEN');
 end if;
 return coalesce(kaporta_private.access_case(target,'review') or (a.branch_id=c.branch_id and (a.role='QUALITY_AUDITOR' or c.assigned_technician_id=a.id or exists(select 1 from public.inspection_tasks x where x.expertise_case_id=c.id and x.task_key='BODY_PAINT_CHECKUP' and (x.owner_user_id=a.id or x.assigned_user_id=a.id)))),false);
end $$;
create function kaporta_private.access_session(target uuid,operation text default 'read') returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select kaporta_private.access_case(s.case_id,operation) and (operation<>'write' or s.status in ('draft','returned')) from public.k360_sessions s where s.id=target),false)
$$;
revoke all on all functions in schema kaporta_private from public,anon,authenticated;
grant execute on function kaporta_private.access_case(uuid,text),kaporta_private.access_session(uuid,text) to authenticated;
create policy k360_session_read on public.k360_sessions for select to authenticated using(kaporta_private.access_case(case_id,'read'));
create policy k360_photo_read on public.k360_photos for select to authenticated using(kaporta_private.access_session(session_id,'read'));

create function kaporta_private.parts(profile text) returns table(id text,metal boolean) language sql immutable set search_path='' as $$
 select p.id,p.metal from (values
 ('hood',true),('roof',true),('trunk',true),('left_front_fender',true),('left_front_door',true),('left_rear_door',true),('left_rear_fender',true),('left_sill',true),('left_a_pillar',true),('left_b_pillar',true),('left_c_pillar',true),('left_mirror',false),
 ('right_front_fender',true),('right_front_door',true),('right_rear_door',true),('right_rear_fender',true),('right_sill',true),('right_a_pillar',true),('right_b_pillar',true),('right_c_pillar',true),('right_mirror',false),('front_bumper',false),('rear_bumper',false),('windshield',false),('rear_glass',false)
 )p(id,metal) where $1<>'hatchback3' or p.id not in ('left_rear_door','right_rear_door')
$$;
create function kaporta_private.validate_finding(sid uuid,part text,f jsonb) returns void language plpgsql set search_path='' as $$
declare s public.k360_sessions; metal boolean; value jsonb; mark jsonb; evidence_id text;
begin
 select * into s from public.k360_sessions where id=sid;
 select p.metal into metal from kaporta_private.parts(s.profile)p where p.id=part;
 if not found or jsonb_typeof(f)<>'object' or length(f::text)>18000 then raise exception 'Geçersiz parça kaydı.';end if;
 if coalesce(f->>'outcome','') not in ('unchecked','inspected','inaccessible','not_applicable') or coalesce(f->>'process','') not in ('none','original','painted','local','replaced','removed','repaired') then raise exception 'Geçersiz inceleme durumu.';end if;
 if jsonb_typeof(f->'defects') is distinct from 'array' or jsonb_typeof(f->'measurements') is distinct from 'array' or jsonb_typeof(f->'evidenceIds') is distinct from 'array' or jsonb_typeof(f->'annotations') is distinct from 'array' or jsonb_typeof(f->'note') is distinct from 'string' then raise exception 'Parça alanları eksik.';end if;
 if length(f->>'note')>2000 or jsonb_array_length(f->'measurements')>12 or jsonb_array_length(f->'evidenceIds')>20 or jsonb_array_length(f->'annotations')>30 or jsonb_array_length(f->'defects')>6 then raise exception 'Parça alanı sınırı aşıldı.';end if;
 for value in select * from jsonb_array_elements(f->'defects') loop if trim(both '"' from value::text) not in ('scratch','dent','crack','corrosion','stone','wear') then raise exception 'Geçersiz yüzey bulgusu.';end if;end loop;
 for value in select * from jsonb_array_elements(f->'measurements') loop if jsonb_typeof(value)<>'number' or (value::text)::numeric<=0 or (value::text)::numeric>5000 or not metal then raise exception 'Ölçüm yüzeye uygun değil.';end if;end loop;
 if f->>'outcome'<>'inspected' and (f->>'process'<>'none' or jsonb_array_length(f->'measurements')>0 or jsonb_array_length(f->'defects')>0) then raise exception 'İncelenmeyen parçaya sonuç atanamaz.';end if;
 for evidence_id in select * from jsonb_array_elements_text(f->'evidenceIds') loop
  if not exists(select 1 from public.k360_photos p where p.session_id=sid and p.id::text=evidence_id) then raise exception 'Kanıt bu iş emrine ait değil.';end if;
 end loop;
 for mark in select * from jsonb_array_elements(f->'annotations') loop
  if not (f->'evidenceIds' ? coalesce(mark->>'photoId','')) then raise exception 'İşaret kanıtı seçilmemiş.';end if;
  foreach part in array array['x','y','w','h'] loop
   if jsonb_typeof(mark->part) is distinct from 'number' or (mark->>part)::numeric<0 or (mark->>part)::numeric>1 then raise exception 'İşaret sınır dışında.';end if;
  end loop;
  if (mark->>'x')::numeric+(mark->>'w')::numeric>1.001 or (mark->>'y')::numeric+(mark->>'h')::numeric>1.001 then raise exception 'İşaret sınır dışında.';end if;
 end loop;
end $$;
create function kaporta_private.issues(sid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare s public.k360_sessions; p record; f jsonb; v_slot text; issues jsonb:='[]'; i int;
begin
 select * into s from public.k360_sessions where id=sid;
 for i in 1..28 loop
  v_slot:=case when i<=24 then 'ring-'||lpad(i::text,2,'0') else 'upper-'||(i-24)::text end;
  if not exists(select 1 from public.k360_photos x where x.session_id=sid and x.id::text=s.photo_slots->>v_slot and x.slot=v_slot) then issues:=issues||jsonb_build_array(jsonb_build_object('type','photo','id',v_slot,'message','Eksik çekim: '||v_slot));end if;
 end loop;
 for p in select * from kaporta_private.parts(s.profile) loop
  f:=s.findings->p.id;
  if f is null or f->>'outcome'='unchecked' then issues:=issues||jsonb_build_array(jsonb_build_object('type','part','id',p.id,'message','İnceleme eksik: '||p.id));
  elsif f->>'outcome'='inspected' then
   if f->>'process'='none' or (p.metal and jsonb_array_length(f->'measurements')<3) then issues:=issues||jsonb_build_array(jsonb_build_object('type','part','id',p.id,'message','İşlem durumu veya 3 ölçüm eksik: '||p.id));end if;
   if (f->>'process'<>'original' or jsonb_array_length(f->'defects')>0) and (length(trim(f->>'note'))<5 or not exists(select 1 from public.k360_photos x where x.session_id=sid and x.kind='detail' and f->'evidenceIds' ? x.id::text)) then issues:=issues||jsonb_build_array(jsonb_build_object('type','part','id',p.id,'message','Bulgu açıklaması ve yakın plan gerekli: '||p.id));end if;
  elsif length(trim(f->>'note'))<5 then issues:=issues||jsonb_build_array(jsonb_build_object('type','part','id',p.id,'message','Kapsam gerekçesi gerekli: '||p.id));end if;
 end loop;
 return issues;
end $$;

create function public.k360_identity() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.app_users;begin a:=kaporta_private.actor();if a.id is null then raise exception 'Aktif ERP kullanıcısı bulunamadı.';end if;return jsonb_build_object('id',a.id,'auth_id',auth.uid(),'name',a.full_name,'role',a.role);end $$;
create function public.k360_jobs() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(row_to_json(j)),'[]') from (select c.id,c.work_order_no,c.is_locked,c.status,v.plate,v.brand,v.model,v.body_type,
  t.id task_id,t.owner_user_id,t.status task_status,s.id session_id,s.status session_status
  from public.expertise_cases c join public.vehicles v on v.id=c.vehicle_id
  join public.inspection_tasks t on t.expertise_case_id=c.id and t.task_key='BODY_PAINT_CHECKUP'
  left join public.k360_sessions s on s.case_id=c.id
  where kaporta_private.access_case(c.id,'read') and c.status<>'CANCELLED' order by c.opened_at desc limit 50)j
$$;
create function public.k360_load(session_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare s public.k360_sessions; job jsonb; photos jsonb;begin
 select * into s from public.k360_sessions where id=$1;
 if s.id is null or not kaporta_private.access_case(s.case_id,'read') then raise exception 'Bu çekime erişim yok.';end if;
 select jsonb_build_object('id',c.id,'work_order_no',c.work_order_no,'plate',v.plate,'brand',v.brand,'model',v.model,'is_locked',c.is_locked,'status',c.status) into job from public.expertise_cases c join public.vehicles v on v.id=c.vehicle_id where c.id=s.case_id;
 select coalesce(jsonb_agg(to_jsonb(p) order by p.uploaded_at),'[]') into photos from public.k360_photos p where p.session_id=s.id;
 return jsonb_build_object('session',to_jsonb(s),'job',job,'photos',photos,'issues',kaporta_private.issues(s.id),'can_write',kaporta_private.access_session(s.id,'write'),'can_review',kaporta_private.access_case(s.case_id,'review'));
end $$;
create function public.k360_open(case_id uuid,body_profile text) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; tid uuid; a public.app_users;begin
 if not kaporta_private.access_case($1,'read') then raise exception 'İş emrine erişim yok.';end if;
 select id into sid from public.k360_sessions where k360_sessions.case_id=$1;
 if sid is null then
  if not kaporta_private.access_case($1,'write') then raise exception 'Önce atanmış kaporta görevini sahiplenin.';end if;
  if coalesce(body_profile,'') not in ('hatchback3','sedan4','hatchback5','suv5') then raise exception 'Araç parça düzenini seçin.';end if;
  a:=kaporta_private.actor();select id into tid from public.inspection_tasks where expertise_case_id=$1 and task_key='BODY_PAINT_CHECKUP' and owner_user_id=a.id;
  insert into public.k360_sessions(case_id,task_id,profile,editors) values($1,tid,body_profile,array[a.id]) on conflict on constraint k360_sessions_case_id_key do nothing returning id into sid;
  if sid is null then select id into sid from public.k360_sessions where k360_sessions.case_id=$1;end if;
 end if;
 return public.k360_load(sid);
end $$;

create function public.k360_command(session_id uuid,expected_revision int,action text,payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.k360_sessions; a public.app_users; c public.expertise_cases; pid uuid; slot text; photo_kind text; object_meta jsonb; rid uuid; token text; report_data jsonb; issues jsonb; report_record public.k360_reports;
begin
 select * into s from public.k360_sessions where id=$1 for update;
 a:=kaporta_private.actor();if a.id is null or s.id is null or not kaporta_private.access_case(s.case_id,'read') then raise exception 'Çekime erişim yok.';end if;
 if s.revision is distinct from expected_revision then raise exception 'Kayıt başka bir oturumda değişti. Yenileyip tekrar deneyin.';end if;
 select * into c from public.expertise_cases where id=s.case_id for share;
 perform 1 from public.inspection_tasks t where t.id=s.task_id for share;
 if action in ('finding','photo','submit') then
  if not kaporta_private.access_session(s.id,'write') then raise exception 'Yazma yetkisi yok; görev sahibi veya inceleme durumu değişmiş olabilir.';end if;
  if action='finding' then
   perform kaporta_private.validate_finding(s.id,payload->>'partId',payload->'finding');
   s.findings:=jsonb_set(s.findings,array[payload->>'partId'],payload->'finding');
  elsif action='photo' then
   pid:=(payload->>'id')::uuid;slot:=payload->>'slot';
   if slot ~ '^ring-(0[1-9]|1[0-9]|2[0-4])$' then photo_kind:='ring';elsif slot ~ '^upper-[1-4]$' then photo_kind:='upper';elsif slot='detail-'||pid::text then photo_kind:='detail';else raise exception 'Geçersiz fotoğraf pozu.';end if;
   if payload->>'path' is distinct from (s.id::text||'/'||pid::text||(case payload->>'mime' when 'image/jpeg' then '.jpg' when 'image/png' then '.png' when 'image/webp' then '.webp' else '' end)) then raise exception 'Fotoğraf yolu geçersiz.';end if;
   select o.metadata into object_meta from storage.objects o where o.bucket_id='kaporta-360' and o.name=payload->>'path';
   if object_meta is null or (object_meta->>'size')::bigint is distinct from (payload->>'size')::bigint or object_meta->>'mimetype' is distinct from payload->>'mime' then raise exception 'Fotoğraf aslı sunucuda doğrulanamadı.';end if;
   if exists(select 1 from public.k360_photos p where p.id=pid and p.session_id=s.id and p.sha256=payload->>'sha256') then return public.k360_load(s.id);end if;
   if (select count(*) from public.k360_photos p where p.session_id=s.id)>=150 then raise exception 'Çekim başına 150 fotoğraf sınırına ulaşıldı.';end if;
   insert into public.k360_photos(id,session_id,slot,kind,path,sha256,mime,size,width,height,captured_at,captured_by) values(pid,s.id,slot,photo_kind,payload->>'path',payload->>'sha256',payload->>'mime',(payload->>'size')::int,(payload->>'width')::int,(payload->>'height')::int,(payload->>'capturedAt')::timestamptz,a.id);
   s.photo_slots:=jsonb_set(s.photo_slots,array[slot],to_jsonb(pid::text));
  else
   issues:=kaporta_private.issues(s.id);if jsonb_array_length(issues)>0 then raise exception 'Eksik çekim veya parça kaydı var (%).',jsonb_array_length(issues);end if;
   s.status:='review';s.return_note:='';
  end if;
  if not a.id=any(s.editors) then s.editors:=array_append(s.editors,a.id);end if;
 elsif action in ('approve','return') then
  if not kaporta_private.access_case(s.case_id,'review') or c.is_locked or c.status='CANCELLED' then raise exception 'Teknik inceleme yetkisi yok veya nihai rapor kilitli.';end if;
  if action='return' then
   if s.status not in ('review','approved') or length(trim(coalesce(payload->>'note','')))<5 then raise exception 'Düzeltme gerekçesini yazın.';end if;
   s.status:='returned';s.return_note:=left(payload->>'note',2000);
   update public.k360_shares sh set revoked=true where sh.report_id in(select r.id from public.k360_reports r where r.session_id=s.id);
  else
   if s.status<>'review' or a.id=any(s.editors) then raise exception 'Onay, kaydı hazırlamayan yetkili teknik sorumlu tarafından verilmeli.';end if;
   if payload->'photosReviewed' is distinct from 'true'::jsonb then raise exception 'Fotoğraf netliği, araç kimliği ve kanıt bağlarını inceleyin.';end if;
   issues:=kaporta_private.issues(s.id);if jsonb_array_length(issues)>0 then raise exception 'Eksik kayıtlar nedeniyle onay verilemez.';end if;
   report_data:=public.k360_load(s.id);report_data:=jsonb_build_object('session',(report_data->'session')||jsonb_build_object('status','approved','revision',s.revision+1),'job',report_data->'job','photos',report_data->'photos','approvedBy',a.full_name,'approvedAt',now());
   insert into public.k360_reports(session_id,case_revision,session_revision,snapshot,approved_by) values(s.id,c.revision_no,s.revision+1,report_data,a.id);
   s.status:='approved';
  end if;
 elsif action='share' then
  if not kaporta_private.access_case(s.case_id,'review') then raise exception 'Müşteri paylaşım yetkisi yok.';end if;
  select * into report_record from public.k360_reports r where r.session_id=s.id order by r.approved_at desc limit 1;
  if s.status<>'approved' or report_record.id is null or not c.is_locked or c.status not in ('APPROVED','DELIVERED') or c.report_approved_at is null or report_record.case_revision<>c.revision_no or not exists(select 1 from public.final_reports fr where fr.expertise_case_id=c.id and fr.status='LOCKED' and fr.locked_at is not null and fr.revision_no=c.revision_no) then raise exception 'Müşteri paylaşımı için ERP nihai rapor onayı ve kilidi gerekli.';end if;
  token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.k360_shares(report_id,token_hash,expires_at,created_by) values(report_record.id,encode(extensions.digest(token,'sha256'),'hex'),now()+interval '7 days',a.id);
  insert into public.k360_events(session_id,actor_id,action,revision) values(s.id,a.id,'share',s.revision);
  return jsonb_build_object('token',token,'expiresAt',now()+interval '7 days');
 elsif action='revoke' then
  if not kaporta_private.access_case(s.case_id,'review') then raise exception 'Paylaşım yönetim yetkisi yok.';end if;
  update public.k360_shares sh set revoked=true where sh.report_id in(select r.id from public.k360_reports r where r.session_id=s.id);
 else raise exception 'Bilinmeyen işlem.';end if;
 update public.k360_sessions set findings=s.findings,photo_slots=s.photo_slots,status=s.status,editors=s.editors,return_note=s.return_note,revision=s.revision+1,updated_at=now() where id=s.id;
 insert into public.k360_events(session_id,actor_id,action,revision,detail) values(s.id,a.id,action,s.revision+1,case when action='finding' then jsonb_build_object('partId',payload->>'partId','finding',payload->'finding') when action='return' then jsonb_build_object('note',s.return_note) else '{}' end);
 return public.k360_load(s.id);
end $$;

-- Only the server function may resolve capability links. No anonymous table or RPC access.
create function public.k360_resolve_share(share_token text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r public.k360_reports; s public.k360_sessions; c public.expertise_cases;begin
 if length(coalesce(share_token,''))<>64 then raise exception 'Paylaşım bulunamadı veya süresi doldu.';end if;
 select rep.* into r from public.k360_reports rep join public.k360_shares sh on sh.report_id=rep.id where sh.token_hash=encode(extensions.digest(share_token,'sha256'),'hex') and not sh.revoked and sh.expires_at>now();
 select * into s from public.k360_sessions where id=r.session_id;select * into c from public.expertise_cases where id=s.case_id;
 if r.id is null or s.status<>'approved' or not c.is_locked or c.status not in ('APPROVED','DELIVERED') or c.report_approved_at is null or r.case_revision<>c.revision_no or not exists(select 1 from public.final_reports fr where fr.expertise_case_id=c.id and fr.status='LOCKED' and fr.revision_no=c.revision_no and fr.locked_at is not null) then raise exception 'Paylaşım bulunamadı veya süresi doldu.';end if;
 return r.snapshot||jsonb_build_object('reportId',r.id,'approvedAt',r.approved_at,'customerView',true);
end $$;
revoke all on all functions in schema kaporta_private from public,anon;
revoke all on function public.k360_identity(),public.k360_jobs(),public.k360_load(uuid),public.k360_open(uuid,text),public.k360_command(uuid,int,text,jsonb),public.k360_resolve_share(text) from public,anon,authenticated;
grant execute on function public.k360_identity(),public.k360_jobs(),public.k360_load(uuid),public.k360_open(uuid,text),public.k360_command(uuid,int,text,jsonb) to authenticated;
grant execute on function public.k360_resolve_share(text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('kaporta-360','kaporta-360',false,20971520,array['image/jpeg','image/png','image/webp']);
create function kaporta_private.storage_access(object_name text,operation text) returns boolean language plpgsql stable security definer set search_path='' as $$
declare sid uuid;begin
 if object_name !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp)$' then return false;end if;
 begin sid:=split_part(object_name,'/',1)::uuid;exception when invalid_text_representation then return false;end;
 return kaporta_private.access_session(sid,operation);
end $$;
revoke all on function kaporta_private.storage_access(text,text) from public,anon;
grant execute on function kaporta_private.storage_access(text,text) to authenticated;
create policy k360_storage_read on storage.objects for select to authenticated using(bucket_id='kaporta-360' and kaporta_private.storage_access(name,'read'));
create policy k360_storage_insert on storage.objects for insert to authenticated with check(bucket_id='kaporta-360' and kaporta_private.storage_access(name,'write'));
create policy k360_storage_read_guard on storage.objects as restrictive for select to authenticated using(bucket_id<>'kaporta-360' or kaporta_private.storage_access(name,'read'));
create policy k360_storage_insert_guard on storage.objects as restrictive for insert to authenticated with check(bucket_id<>'kaporta-360' or kaporta_private.storage_access(name,'write'));
create policy k360_storage_no_update on storage.objects as restrictive for update to authenticated using(bucket_id<>'kaporta-360') with check(bucket_id<>'kaporta-360');
create policy k360_storage_no_delete on storage.objects as restrictive for delete to authenticated using(bucket_id<>'kaporta-360');
create policy k360_storage_no_anon on storage.objects as restrictive for all to anon using(bucket_id<>'kaporta-360') with check(bucket_id<>'kaporta-360');
