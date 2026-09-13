import { readFile, writeFile } from "node:fs/promises";

const input = "data/research/official-costume-appearances.json";
const output = "supabase/migrations/20260913003000_seed_official_costume_appearances.sql";
const artifact = JSON.parse(await readFile(input, "utf8"));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const values = artifact.appearances
	.map(
		(item) =>
			`  (${quote(item.costumeName)}, ${quote(item.appearanceDate)}, ${item.eventId}, ${quote(item.sourceTitle)}, ${quote(item.sourceUrl)})`,
	)
	.join(",\n");

const sql = `-- Generated from ${input}.
-- These dates are confirmed appearances, not claimed costume debut dates.

create temporary table official_costume_appearance_seed (
  costume_name text not null,
  appearance_date date not null,
  event_id integer not null,
  source_title text not null,
  source_url text not null
) on commit drop;

insert into official_costume_appearance_seed (
  costume_name, appearance_date, event_id, source_title, source_url
)
values
${values};

do $$
begin
  if exists (
    select 1
    from official_costume_appearance_seed seed
    left join public.costumes costume on costume.name = seed.costume_name
    left join public.events event on event.event_id = seed.event_id
      and event.date = seed.appearance_date
    where costume.costume_id is null or event.event_id is null
  ) then
    raise exception 'Costume appearance seed does not match the existing costume/event data';
  end if;
end $$;

insert into public.sources (
  url, title, publisher, published_on, source_kind,
  availability_status, accessed_at
)
select source_url, source_title, 'わーすた', null, 'official',
       'available', now()
from official_costume_appearance_seed
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select costume.costume_id, seed.source_title, seed.source_url, current_date,
       source.source_id, 'appearance', 'verified', now(),
       seed.appearance_date || 'の着用を公式告知で確認。初登場日の根拠ではありません。'
from official_costume_appearance_seed seed
join public.costumes costume on costume.name = seed.costume_name
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'appearance'
);

insert into public.costume_events (costume_id, event_id, relation_type)
select costume.costume_id, seed.event_id, 'worn_at'
from official_costume_appearance_seed seed
join public.costumes costume on costume.name = seed.costume_name
join public.events event on event.event_id = seed.event_id
  and event.date = seed.appearance_date
on conflict (costume_id, event_id, relation_type) do nothing;
`;

await writeFile(output, sql);
console.log(JSON.stringify({ output, appearances: artifact.appearances.length }));
