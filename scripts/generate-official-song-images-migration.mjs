import { readFile, writeFile } from "node:fs/promises";

const input = "data/research/official-discography.json";
const output =
	"supabase/migrations/20261011002000_repair_official_song_image_sources.sql";
const artifact = JSON.parse(await readFile(input, "utf8"));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const releasesByUrl = new Map(
	artifact.releases.map((release) => [release.sourceUrl, release]),
);

const songs = artifact.songs.filter(
	(song) => song.imageUrl && song.imageSourceUrl,
);
if (songs.length !== artifact.songs.length) {
	throw new Error(
		`Missing official jacket data for ${artifact.songs.length - songs.length} song(s)`,
	);
}

const values = songs
	.map((song) => {
		const release = releasesByUrl.get(song.imageSourceUrl);
		if (!release)
			throw new Error(`Image source release not found for ${song.title}`);
		return `  (${quote(song.title)}, ${quote(release.title)}, ${quote(release.releaseDate)}, ${quote(song.imageSourceUrl)}, ${quote(song.imageUrl)})`;
	})
	.join(",\n");

const sql = `-- Generated from ${input}.
-- Stores official public jacket URLs only. Image files are not copied.

create temporary table official_song_image_seed (
  song_title text not null,
  source_title text not null,
  source_published_on date not null,
  source_url text not null,
  image_url text not null
) on commit drop;

insert into official_song_image_seed (
  song_title, source_title, source_published_on, source_url, image_url
)
values
${values};

do $$
begin
  if exists (
    select 1
    from official_song_image_seed seed
    left join public.songs song
      on lower(btrim(song.title)) = lower(btrim(seed.song_title))
    where song.song_id is null
  ) then
    raise exception 'Song image seed does not match the existing song data';
  end if;
end $$;

insert into public.sources (
  url, title, publisher, published_on, source_kind,
  availability_status, accessed_at
)
select distinct on (source_url)
       source_url, source_title, 'わーすた', source_published_on,
       'official', 'available', now()
from official_song_image_seed
order by source_url, source_published_on
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

update public.songs song
set image_url = seed.image_url
from official_song_image_seed seed
where lower(btrim(song.title)) = lower(btrim(seed.song_title));

insert into public.song_sources (
  song_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select song.song_id, source.title, seed.source_url, current_date,
       source.source_id, 'image', 'verified', now(),
       '公式ディスコグラフィーで公開されている、初収録リリースの代表ジャケット画像URL。画像ファイルは複製していません。'
from official_song_image_seed seed
join public.songs song
  on lower(btrim(song.title)) = lower(btrim(seed.song_title))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.song_sources existing
  where existing.song_id = song.song_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'image'
);
`;

await writeFile(output, sql);
console.log(JSON.stringify({ output, songs: songs.length }));
