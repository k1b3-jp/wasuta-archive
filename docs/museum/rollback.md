# 展示室・非公開収集のロールバック

対象は `20261108000000_event_exhibit.sql` と `20261108001000_private_source_collection.sql`。どちらも新しい表・関数・ポリシーの追加だけで、既存の events / members / sources / songs / costumes の列や既存行は変更しない。

main への merge は `.github/workflows/supabase-deploy.yml` が本番に `supabase db push --yes --remote` する。戻すときはアプリの改修を戻すことと、本番で次の SQL を実行することを分ける。このファイルは migration ではない。`supabase/migrations/` に置かない。

## 消えるもの

- `public.event_exhibit_cards` と、その RLS・index
- `public.save_event_exhibit_draft`、`public.transition_event_exhibit`、`public.review_event_exhibit_evidence`
- `archive_research` スキーマ全体（アカウント、原資料、版、本文、観測、編集案、取得カーソル、監査）
- この機能が足した `event_sources.fact_kind = 'exhibit'` の行と、`archive_audit_log.entity_type = 'event_exhibit'` の行

`archive_research` に投入済みの収集本文は schema ごと消える。残す場合は実行前にその schema だけを退避する。migration 適用直後で投入がなければ、退避する行はない。

既存の公演、人物、楽曲、衣装、公開中の sources、exhibit 以外の event_sources、ほかの監査行は削除しない。

## 手順

1. アプリを先に戻す場合は、この PR の commit を含まない revision をデプロイする。展示ページは表がなくてもエラー文言を出して 200 になり、編集プレビューは production では 404 のままにする。
2. 収集データを残すなら `archive_research` を退避する。
3. 本番で次を実行する。

```sql
begin;

drop function if exists public.review_event_exhibit_evidence(bigint, text);
drop function if exists public.transition_event_exhibit(bigint, text, text);
drop function if exists public.save_event_exhibit_draft(jsonb);

-- fact_kind 'exhibit' はこれらの migration より前には使っていない。
delete from public.event_sources where fact_kind = 'exhibit';
delete from public.archive_audit_log where entity_type = 'event_exhibit';

drop table if exists public.event_exhibit_cards;
drop schema if exists archive_research cascade;

commit;
```

4. migration ファイルをリポジトリから外す。外したあとに次の `db push` が空の表を作り直さないよう、適用済み記録も外す。ファイルを残したまま記録だけ消すと、次の push が同じ migration を再適用する。

```sql
delete from supabase_migrations.schema_migrations
where version in ('20261108000000', '20261108001000');
```

表を空のまま作り直す場合は、記録の削除だけを行い、migration ファイルは残す。次の `db push` が再作成する。
