[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}

$restoreDatabase='ototr_finance_restore_verify'
$dependencyDumpPath='/tmp/ototr-finance-restore-dependencies.dump'
$financeDumpPath='/tmp/ototr-finance-restore-verify.dump'
if($restoreDatabase-ne'ototr_finance_restore_verify'-or$dependencyDumpPath-ne'/tmp/ototr-finance-restore-dependencies.dump'-or$financeDumpPath-ne'/tmp/ototr-finance-restore-verify.dump'){throw 'Unsafe restore target.'}

function Invoke-ContainerCommand([string[]]$Arguments,[string]$FailureMessage){
  $output=@(& $dockerPath exec $ContainerName @Arguments 2>&1)
  if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw $FailureMessage}
  return $output
}

try{
  [void](Invoke-ContainerCommand @('pg_dump','-U','postgres','-d','postgres','-Fc','--no-owner','--no-privileges','-t','public.app_users','-t','public.branches','-f',$dependencyDumpPath) 'Local ERP identity dependency backup creation failed.')
  [void](Invoke-ContainerCommand @('pg_dump','-U','postgres','-d','postgres','-Fc','--no-owner','--no-privileges','-n','finance','-n','finance_api','-n','finance_private','-f',$financeDumpPath) 'Local finance backup creation failed.')
  [void](Invoke-ContainerCommand @('dropdb','-U','postgres','--if-exists',$restoreDatabase) 'Restore verification database cleanup failed.')
  [void](Invoke-ContainerCommand @('createdb','-U','postgres',$restoreDatabase) 'Restore verification database creation failed.')
  [void](Invoke-ContainerCommand @('psql','-X','-U','postgres','-d',$restoreDatabase,'-v','ON_ERROR_STOP=1','-c',"create schema if not exists extensions; create extension if not exists pgcrypto with schema extensions; create schema if not exists auth; create or replace function auth.uid() returns uuid language sql stable as 'select null::uuid';") 'Restore target bootstrap failed.')
  [void](Invoke-ContainerCommand @('pg_restore','-U','postgres','-d',$restoreDatabase,'--section=pre-data','--exit-on-error','--no-owner','--no-privileges',$dependencyDumpPath) 'ERP identity dependency schema restore failed.')
  [void](Invoke-ContainerCommand @('pg_restore','-U','postgres','-d',$restoreDatabase,'--section=data','--exit-on-error','--no-owner','--no-privileges',$dependencyDumpPath) 'ERP identity dependency data restore failed.')
  [void](Invoke-ContainerCommand @('psql','-X','-U','postgres','-d',$restoreDatabase,'-v','ON_ERROR_STOP=1','-c',"alter table public.app_users add primary key(id), add unique(auth_user_id), add unique(email); alter table public.branches add primary key(id), add unique(code);") 'ERP identity dependency key restore failed.')
  [void](Invoke-ContainerCommand @('pg_restore','-U','postgres','-d',$restoreDatabase,'--exit-on-error','--no-owner','--no-privileges',$financeDumpPath) 'Local finance backup restore failed.')

  $source=@(Invoke-ContainerCommand @('psql','-X','-At','-U','postgres','-d','postgres','-c',"select count(*)||'|'||(select count(*) from information_schema.routines where routine_schema='finance_api') from information_schema.tables where table_schema='finance' and table_type='BASE TABLE';") 'Source catalog verification failed.')
  $restored=@(Invoke-ContainerCommand @('psql','-X','-At','-U','postgres','-d',$restoreDatabase,'-c',"select count(*)||'|'||(select count(*) from information_schema.routines where routine_schema='finance_api') from information_schema.tables where table_schema='finance' and table_type='BASE TABLE';") 'Restored catalog verification failed.')
  if($source.Count-ne 1-or$restored.Count-ne 1-or$source[0]-ne$restored[0]-or$source[0]-ne'48|161'){throw "Restored finance catalog mismatch: source=$($source-join',') restored=$($restored-join',')"}
  Write-Host 'FINANCE LOCAL BACKUP RESTORE: PASSED' -ForegroundColor Green
  Write-Host 'Separate restore target verified: 48 finance tables; 161 finance API functions; productionDataUsed: false.'
}finally{
  & $dockerPath exec $ContainerName dropdb -U postgres --if-exists $restoreDatabase 2>$null | Out-Null
  & $dockerPath exec $ContainerName rm -f $dependencyDumpPath $financeDumpPath 2>$null | Out-Null
}
