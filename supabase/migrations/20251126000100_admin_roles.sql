-- 管理者ロール定義と判定関数の追加
create table if not exists public.user_roles (
  user_id uuid primary key,
  role text not null check (role = 'admin')
);

-- RLS（本人のみ参照可能）
alter table public.user_roles enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'user_roles_select_self'
  ) then
    create policy "user_roles_select_self"
      on public.user_roles
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- 管理者判定関数
create or replace function public.is_admin(u uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.user_roles r where r.user_id = u and r.role = 'admin'
  );
$$;