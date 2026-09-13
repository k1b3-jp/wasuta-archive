import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const input = "data/research/official-costumes.json";
const output = "supabase/migrations/20260913002000_seed_official_costumes.sql";
const artifact = JSON.parse(await readFile(input, "utf8"));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const slug = (name) =>
	`costume-${createHash("sha256").update(name.normalize("NFKC")).digest("hex").slice(0, 16)}`;

const values = artifact.costumes
	.map(
		(costume) =>
			`  (${quote(slug(costume.name))}, ${quote(costume.name)}, ${quote(costume.publishedOn)}, ${quote(costume.sourceUrl)})`,
	)
	.join(",\n");

const sql = `-- Generated from ${input}. Re-run \`yarn research:costumes-migration\` after refreshing the artifact.
-- Article publication dates are source metadata and must not be used as costume debut dates.

create temporary table official_costume_seed (
  slug text not null,
  name text not null,
  source_published_on date not null,
  source_url text not null
) on commit drop;

insert into official_costume_seed (slug, name, source_published_on, source_url)
values
${values};

insert into public.sources (url, title, publisher, published_on, source_kind, availability_status, accessed_at)
select source_url, 'わーすた衣装博物館「' || name || '」', 'わーすた',
       source_published_on, 'official', 'available', now()
from official_costume_seed
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.costumes (slug, name, status)
select seed.slug, seed.name, 'published'
from official_costume_seed seed
where not exists (
  select 1 from public.costumes costume
  where lower(btrim(costume.name)) = lower(btrim(seed.name))
);

update public.costumes costume
set slug = coalesce(costume.slug, seed.slug)
from official_costume_seed seed
where lower(btrim(costume.name)) = lower(btrim(seed.name));

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at,
  note
)
select costume.costume_id, source.title, seed.source_url, current_date, source.source_id,
       'name', 'verified', now(),
       '公開一覧で衣装名を確認。記事本文と画像は会員限定のため取得していません。'
from official_costume_seed seed
join public.costumes costume on lower(btrim(costume.name)) = lower(btrim(seed.name))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1 from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'name'
);
`;

await writeFile(output, sql);
console.log(JSON.stringify({ output, costumes: artifact.costumes.length }));
