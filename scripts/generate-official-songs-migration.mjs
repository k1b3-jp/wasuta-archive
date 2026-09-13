import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const input = "data/research/official-discography.json";
const output = "supabase/migrations/20260913001000_seed_official_songs.sql";
const artifact = JSON.parse(await readFile(input, "utf8"));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const slug = (title) =>
	`song-${createHash("sha256").update(title.normalize("NFKC")).digest("hex").slice(0, 16)}`;

const values = artifact.songs
	.map((song) => {
		const source = song.sources.find((item) => item.url) ?? song.sources[0];
		return `  (${quote(slug(song.title))}, ${quote(song.title)}, ${quote(song.releaseDate)}, ${quote(source.release)}, ${quote(source.url)})`;
	})
	.join(",\n");

const sql = `-- Generated from ${input}. Re-run \`yarn research:songs-migration\` after refreshing the artifact.
-- Official release dates are recorded independently from first-performance dates.

create temporary table official_song_seed (
  slug text not null,
  title text not null,
  release_date date not null,
  source_title text not null,
  source_url text not null
) on commit drop;

insert into official_song_seed (slug, title, release_date, source_title, source_url)
values
${values};

insert into public.sources (url, title, publisher, published_on, source_kind, availability_status, accessed_at)
select distinct on (source_url)
       source_url, source_title, 'わーすた', release_date, 'official', 'available', now()
from official_song_seed
order by source_url, release_date
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.songs (slug, title, release_date, status)
select seed.slug, seed.title, seed.release_date, 'published'
from official_song_seed seed
where not exists (
  select 1 from public.songs song
  where lower(btrim(song.title)) = lower(btrim(seed.title))
);

update public.songs song
set release_date = coalesce(song.release_date, seed.release_date),
    slug = coalesce(song.slug, seed.slug)
from official_song_seed seed
where lower(btrim(song.title)) = lower(btrim(seed.title));

insert into public.song_sources (
  song_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at
)
select song.song_id, seed.source_title, seed.source_url, current_date, source.source_id,
       fact.fact_kind, 'verified', now()
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
join public.sources source on source.url = seed.source_url
cross join (values ('title'), ('release_date')) as fact(fact_kind)
where not exists (
  select 1 from public.song_sources existing
  where existing.song_id = song.song_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = fact.fact_kind
);

insert into public.timeline_occurrences (
  occurrence_kind, occurred_on, date_precision, is_group_wide, status, song_id
)
select 'release', seed.release_date, 'day', true, 'published', song.song_id
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
where not exists (
  select 1 from public.timeline_occurrences occurrence
  where occurrence.song_id = song.song_id and occurrence.occurrence_kind = 'release'
);

insert into public.occurrence_sources (
  occurrence_id, source_id, fact_kind, verification_status, verified_at
)
select occurrence.occurrence_id, source.source_id, 'occurred_on', 'verified', now()
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
join public.timeline_occurrences occurrence
  on occurrence.song_id = song.song_id and occurrence.occurrence_kind = 'release'
join public.sources source on source.url = seed.source_url
on conflict do nothing;
`;

await writeFile(output, sql);
console.log(JSON.stringify({ output, songs: artifact.songs.length }));
