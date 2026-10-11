import { readFile, writeFile } from "node:fs/promises";

const input = "data/research/official-costumes.json";
const output = "supabase/migrations/20261011000000_seed_official_costume_images.sql";
const artifact = JSON.parse(await readFile(input, "utf8"));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const costumes = artifact.costumes.filter((costume) => costume.imageUrl);
if (costumes.length !== artifact.costumes.length) {
	throw new Error(
		`Missing public thumbnail URL for ${artifact.costumes.length - costumes.length} costume(s)`,
	);
}

const values = costumes
	.map(
		(costume) =>
			`  (${quote(costume.name)}, ${quote(costume.sourceUrl)}, ${quote(costume.imageUrl)})`,
	)
	.join(",\n");

const sql = `-- Generated from ${input}.
-- Stores official public thumbnail URLs only. Image files are not copied.

create temporary table official_costume_image_seed (
  costume_name text not null,
  source_url text not null,
  image_url text not null
) on commit drop;

insert into official_costume_image_seed (costume_name, source_url, image_url)
values
${values};

do $$
begin
  if exists (
    select 1
    from official_costume_image_seed seed
    left join public.costumes costume
      on lower(btrim(costume.name)) = lower(btrim(seed.costume_name))
    where costume.costume_id is null
  ) then
    raise exception 'Costume image seed does not match the existing costume data';
  end if;
end $$;

update public.costumes costume
set image_url = seed.image_url
from official_costume_image_seed seed
where lower(btrim(costume.name)) = lower(btrim(seed.costume_name));

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select costume.costume_id, source.title, seed.source_url, current_date,
       source.source_id, 'image', 'verified', now(),
       '公式サイトの公開一覧に表示されるサムネイル画像URL。画像ファイルは複製していません。'
from official_costume_image_seed seed
join public.costumes costume
  on lower(btrim(costume.name)) = lower(btrim(seed.costume_name))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'image'
);
`;

await writeFile(output, sql);
console.log(JSON.stringify({ output, costumes: costumes.length }));
