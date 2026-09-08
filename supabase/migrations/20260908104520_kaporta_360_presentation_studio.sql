-- Additive authored-photo presentation plans. Original evidence and approval ownership remain authoritative.
alter table public.k360_sessions add column studio jsonb not null default '{}';

create function kaporta_private.studio_keys(v jsonb, keys text[]) returns boolean language sql immutable set search_path='' as $$
 select case when jsonb_typeof(v)='object' then not exists(select 1 from jsonb_object_keys(v) k where not k=any(keys)) else false end
$$;
create function kaporta_private.studio_cross(a jsonb,b jsonb,c jsonb) returns numeric language sql immutable set search_path='' as $$
 select ((b->>0)::numeric-(a->>0)::numeric)*((c->>1)::numeric-(a->>1)::numeric)-((b->>1)::numeric-(a->>1)::numeric)*((c->>0)::numeric-(a->>0)::numeric)
$$;
create function kaporta_private.studio_on_segment(a jsonb,b jsonb,c jsonb) returns boolean language sql immutable set search_path='' as $$
 select abs(kaporta_private.studio_cross(a,b,c))<0.000000001
 and (c->>0)::numeric between least((a->>0)::numeric,(b->>0)::numeric)-0.000000001 and greatest((a->>0)::numeric,(b->>0)::numeric)+0.000000001
 and (c->>1)::numeric between least((a->>1)::numeric,(b->>1)::numeric)-0.000000001 and greatest((a->>1)::numeric,(b->>1)::numeric)+0.000000001
$$;
create function kaporta_private.studio_polygon(points jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare n int; i int; j int; b int; d int; p jsonb; v jsonb; area numeric:=0;
begin
 if jsonb_typeof(points) is distinct from 'array' then return false;end if;
 n:=jsonb_array_length(points);if n<3 or n>40 then return false;end if;
 for p in select * from jsonb_array_elements(points) loop
  if jsonb_typeof(p) is distinct from 'array' then return false;end if;
  if jsonb_array_length(p)<>2 then return false;end if;
  for v in select * from jsonb_array_elements(p) loop
   if jsonb_typeof(v) is distinct from 'number' then return false;end if;
   if v::text::numeric<0 or v::text::numeric>1 then return false;end if;
  end loop;
 end loop;
 for i in 0..n-1 loop
  b:=(i+1)%n;
  if power((points->i->>0)::numeric-(points->b->>0)::numeric,2)+power((points->i->>1)::numeric-(points->b->>1)::numeric,2)<0.0000000001 then return false;end if;
  area:=area+(points->i->>0)::numeric*(points->b->>1)::numeric-(points->b->>0)::numeric*(points->i->>1)::numeric;
  for j in i+1..n-1 loop
   d:=(j+1)%n;if j=b or d=i then continue;end if;
   if (kaporta_private.studio_cross(points->i,points->b,points->j)*kaporta_private.studio_cross(points->i,points->b,points->d)<0
     and kaporta_private.studio_cross(points->j,points->d,points->i)*kaporta_private.studio_cross(points->j,points->d,points->b)<0)
     or kaporta_private.studio_on_segment(points->i,points->b,points->j) or kaporta_private.studio_on_segment(points->i,points->b,points->d)
     or kaporta_private.studio_on_segment(points->j,points->d,points->i) or kaporta_private.studio_on_segment(points->j,points->d,points->b) then return false;end if;
  end loop;
 end loop;
 return abs(area)/2>=0.0001;
end $$;

create function kaporta_private.validate_studio(sid uuid,plan jsonb,complete boolean default false) returns void language plpgsql set search_path='' as $$
declare s public.k360_sessions; p public.k360_photos; item jsonb; pair record; f jsonb; k text; seen text[]:='{}'; v numeric; i int; v_slot text;
begin
 select * into s from public.k360_sessions where id=sid;
 if not kaporta_private.studio_keys(plan,array['version','enabled','modelKey','summary','equipment','checks','bindings','pins','tour'])
   or octet_length(plan::text)>180000 or plan->'version' is distinct from '1'::jsonb or jsonb_typeof(plan->'enabled') is distinct from 'boolean'
   or plan->>'modelKey' is distinct from 'generic:'||s.profile then raise exception 'Sunum hazırlığı sürümü veya model eşlemesi geçersiz.';end if;
 if jsonb_typeof(plan->'summary') is distinct from 'string' or jsonb_typeof(plan->'equipment') is distinct from 'string'
   or length(plan->>'summary')>600 or length(plan->>'equipment')>240 then raise exception 'Sunum açıklaması sınırı aşıldı.';end if;
 if jsonb_typeof(plan->'checks') is distinct from 'object' then raise exception 'Çekim kontrolü geçersiz.';end if;
 if (select count(*) from jsonb_object_keys(plan->'checks'))>150 then raise exception 'Çekim kontrolü sınırı aşıldı.';end if;
 for pair in select * from jsonb_each(plan->'checks') loop
  select * into p from public.k360_photos where session_id=sid and id::text=pair.key;
  if p.id is null or not kaporta_private.studio_keys(pair.value,array['sha256','identity','angle','quality']) or pair.value->>'sha256' is distinct from p.sha256 then raise exception 'Çekim kontrolü kaynak fotoğrafla eşleşmiyor.';end if;
  foreach k in array array['identity','angle','quality'] loop
   if jsonb_typeof(pair.value->k) is distinct from 'boolean' then raise exception 'Çekim kontrolü eksik.';end if;
  end loop;
 end loop;
 foreach k in array array['bindings','pins','tour'] loop
  if jsonb_typeof(plan->k) is distinct from 'array' then raise exception 'Sunum listeleri eksik.';end if;
 end loop;
 if jsonb_array_length(plan->'bindings')>50 or jsonb_array_length(plan->'pins')>100 or jsonb_array_length(plan->'tour')>12 then raise exception 'Sunum öğesi sınırı aşıldı.';end if;
 for item in select * from jsonb_array_elements(plan->'bindings') loop
  k:=coalesce(item->>'partId','')||':'||coalesce(item->>'photoId','');
  select * into p from public.k360_photos where session_id=sid and id::text=item->>'photoId';
  if not kaporta_private.studio_keys(item,array['partId','photoId','sha256','points','reviewed']) or p.id is null or k=any(seen)
    or not exists(select 1 from kaporta_private.parts(s.profile) x where x.id=item->>'partId') or item->>'sha256' is distinct from p.sha256
    or jsonb_typeof(item->'reviewed') is distinct from 'boolean' or not kaporta_private.studio_polygon(item->'points') then raise exception 'Parça sınırı veya kaynak fotoğraf geçersiz.';end if;
  if p.kind<>'detail' and s.photo_slots->>p.slot is distinct from p.id::text then raise exception 'Açı fotoğrafı yenilendi. Parça sınırını yeniden hazırlayın.';end if;
  if p.kind='detail' and not coalesce(s.findings->(item->>'partId')->'evidenceIds' ? p.id::text,false) then raise exception 'Detay fotoğrafı parçanın kanıtına bağlı değil.';end if;
  seen:=array_append(seen,k);
  if complete and plan->'enabled'='true'::jsonb and item->'reviewed'<>'true'::jsonb then raise exception 'Parça sınırları kontrol edilmemiş.';end if;
 end loop;
 seen:='{}';
 for item in select * from jsonb_array_elements(plan->'pins') loop
  f:=s.findings->(item->>'partId');k:=coalesce(item->>'partId','')||':'||coalesce(item->>'photoId','')||':'||coalesce(item->>'measurementIndex','');
  if not kaporta_private.studio_keys(item,array['partId','photoId','measurementIndex','value','x','y']) or k=any(seen)
   or not exists(select 1 from kaporta_private.parts(s.profile) x where x.id=item->>'partId')
   or not exists(select 1 from public.k360_photos x where x.session_id=sid and x.id::text=item->>'photoId')
   or not coalesce(f->'evidenceIds' ? (item->>'photoId'),false) then raise exception 'Ölçüm noktası bağlı kanıta ait olmalı.';end if;
  foreach k in array array['measurementIndex','value','x','y'] loop if jsonb_typeof(item->k) is distinct from 'number' then raise exception 'Ölçüm noktası geçersiz.';end if;end loop;
  v:=(item->>'measurementIndex')::numeric;
  if v<>trunc(v) or v<0 or v>=jsonb_array_length(f->'measurements') then raise exception 'Ölçüm sırası geçersiz.';end if;
  if item->'value' is distinct from f->'measurements'->(v::int) then raise exception 'İşaretli ölçüm değişti. Noktayı yeniden yerleştirin.';end if;
  if (item->>'x')::numeric not between 0 and 1 or (item->>'y')::numeric not between 0 and 1 then raise exception 'Ölçüm noktası sınır dışında.';end if;
  seen:=array_append(seen,(item->>'partId')||':'||(item->>'photoId')||':'||(item->>'measurementIndex'));
 end loop;
 seen:='{}';
 for item in select * from jsonb_array_elements(plan->'tour') loop
  f:=s.findings->(item->>'partId');
  if not kaporta_private.studio_keys(item,array['partId','photoId','seconds','view','caption']) or item->>'partId'=any(seen)
    or not exists(select 1 from kaporta_private.parts(s.profile) x where x.id=item->>'partId') or coalesce(f->>'outcome','unchecked')='unchecked'
    or not exists(select 1 from public.k360_photos x where x.session_id=sid and x.id::text=item->>'photoId')
    or not coalesce(f->'evidenceIds' ? (item->>'photoId'),false) then raise exception 'Anlatım durağı incelenmiş parçaya ve bağlı kanıta ait olmalı.';end if;
  if jsonb_typeof(item->'seconds') is distinct from 'number' or jsonb_typeof(item->'caption') is distinct from 'string' or coalesce(item->>'view','') not in ('photo','cutout','model') then raise exception 'Anlatım alanları geçersiz.';end if;
  v:=(item->>'seconds')::numeric;
  if v<>trunc(v) or v not between 5 and 20 or length(trim(item->>'caption')) not between 5 and 400 then raise exception 'Anlatım açıklaması veya süresi geçersiz.';end if;
  if item->>'view'='cutout' and not exists(select 1 from jsonb_array_elements(plan->'bindings') b where b->>'partId'=item->>'partId' and b->>'photoId'=item->>'photoId' and b->'reviewed'='true'::jsonb) then raise exception 'Anlatım için kontrol edilmiş fotoğraf kesiti gerekli.';end if;
  seen:=array_append(seen,item->>'partId');
 end loop;
 if complete and plan->'enabled'='true'::jsonb then
  if length(trim(plan->>'summary'))<10 or jsonb_array_length(plan->'tour')<1 then raise exception 'Sunum kapsamı ve en az bir anlatım durağı gerekli.';end if;
  for i in 1..28 loop
   v_slot:=case when i<=24 then 'ring-'||lpad(i::text,2,'0') else 'upper-'||(i-24)::text end;
   select * into p from public.k360_photos where session_id=sid and id::text=s.photo_slots->>v_slot and k360_photos.slot=v_slot;
   item:=plan->'checks'->(p.id::text);
   if p.id is null or item->>'sha256' is distinct from p.sha256 or item->'identity' is distinct from 'true'::jsonb or item->'angle' is distinct from 'true'::jsonb or item->'quality' is distinct from 'true'::jsonb then raise exception 'Çekim kontrolünü tamamlayın: %',v_slot;end if;
  end loop;
 end if;
end $$;

create function public.k360_save_studio(session_id uuid,expected_revision int,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.k360_sessions; a public.app_users;
begin
 select * into s from public.k360_sessions where id=$1 for update;a:=kaporta_private.actor();
 if a.id is null or s.id is null or not kaporta_private.access_case(s.case_id,'read') then raise exception 'Çekime erişim yok.';end if;
 if s.revision is distinct from expected_revision then raise exception 'Kayıt başka bir oturumda değişti. Yenileyip tekrar deneyin.';end if;
 perform 1 from public.expertise_cases where id=s.case_id for share;
 perform 1 from public.inspection_tasks where id=s.task_id for share;
 if not kaporta_private.access_session(s.id,'write') then raise exception 'Yazma yetkisi yok; görev sahibi veya inceleme durumu değişmiş olabilir.';end if;
 perform kaporta_private.validate_studio(s.id,payload,false);
 if not a.id=any(s.editors) then s.editors:=array_append(s.editors,a.id);end if;
 update public.k360_sessions set studio=payload,editors=s.editors,revision=s.revision+1,updated_at=now() where id=s.id;
 insert into public.k360_events(session_id,actor_id,action,revision,detail) values(s.id,a.id,'studio',s.revision+1,jsonb_build_object('bindings',jsonb_array_length(payload->'bindings'),'tourStops',jsonb_array_length(payload->'tour')));
 return public.k360_load(s.id);
end $$;
create function kaporta_private.studio_review_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status in ('review','approved') and old.status is distinct from new.status and new.studio<>'{}'::jsonb then
  perform kaporta_private.validate_studio(old.id,new.studio,true);
 end if;
 return new;
end $$;
create trigger k360_studio_review_guard before update on public.k360_sessions for each row execute function kaporta_private.studio_review_guard();
revoke all on function public.k360_save_studio(uuid,int,jsonb) from public,anon,authenticated;
grant execute on function public.k360_save_studio(uuid,int,jsonb) to authenticated;
revoke all on function kaporta_private.studio_keys(jsonb,text[]),kaporta_private.studio_cross(jsonb,jsonb,jsonb),kaporta_private.studio_on_segment(jsonb,jsonb,jsonb),kaporta_private.studio_polygon(jsonb),kaporta_private.validate_studio(uuid,jsonb,boolean),kaporta_private.studio_review_guard() from public,anon,authenticated;
