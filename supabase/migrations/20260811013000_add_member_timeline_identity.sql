-- Keep public timeline query keys stable while retaining canonical member slugs.

alter table public.members
  add column if not exists timeline_key text,
  add column if not exists short_name text;

alter table public.members
  add constraint members_timeline_key_format_check
  check (
    timeline_key is null
    or timeline_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  );

create unique index members_timeline_key_unique
  on public.members(timeline_key)
  where timeline_key is not null;

update public.members
set
  timeline_key = case slug
    when 'nanase-hirokawa' then 'nanase'
    when 'miri-matsuda' then 'miri'
    when 'ririka-kodama' then 'ririka'
    when 'ruka-mishina' then 'ruka'
    else timeline_key
  end,
  short_name = case slug
    when 'nanase-hirokawa' then '奈々聖'
    when 'miri-matsuda' then '美里'
    when 'ririka-kodama' then '梨々華'
    when 'ruka-mishina' then '瑠香'
    else short_name
  end,
  color = case slug
    when 'nanase-hirokawa' then '#8abf92'
    when 'miri-matsuda' then '#c6a4c6'
    when 'ririka-kodama' then '#7ec8d9'
    when 'ruka-mishina' then '#f2a2c8'
    else color
  end,
  updated_at = now()
where slug in (
  'nanase-hirokawa',
  'miri-matsuda',
  'ririka-kodama',
  'ruka-mishina'
);

alter table public.members
  add constraint members_timeline_identity_pair_check
  check (
    (timeline_key is null and short_name is null)
    or (timeline_key is not null and short_name is not null)
  );
