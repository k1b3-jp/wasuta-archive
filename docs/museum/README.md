# デジタルミュージアム：一公演の展示室

状態：展示プレビュー（編集未承認）。2026-11-08。非公式ファンアーカイブ。

わーすたの歴史を、メンバーそれぞれの言葉とともに旅する。既存の年表とイベント詳細を入口に、資料を発信された時点・発信者・該当箇所から読み直す。歴史を変更するゲーム、生成会話、架空の感情や因果関係は作らない。

## 今後のデータモデル方針

表示に依存しない[資料・史実モデル](content-model.md)を今後の設計方針とする。原資料・該当箇所・根拠付き記述・編集文章・展示構成を分離する。現状の公演直結カードは縦切りの最小実装であり、最終の正本モデルにはしない。[原資料の収集・非公開保存](collection.md)はローカルに実装した。史実・編集文章・展示構成の全体移行、Xの全履歴取得は未実施。ログイン済みブラウザで奈々聖の5投稿を部分観測し、非公開DBへ保存した。取得範囲と制約は収集運用を参照。

## 正本と優先順位

[統合追補](briefs/04_wasuta-archive統合方針.md)を[企画書](briefs/01_企画書.md)・[収集指示](briefs/02_AIデータ収集指示書.md)・[開発指示](briefs/03_AI開発指示書.md)の独立アプリ前提より優先する。4文書は受領時点の原本として保持し、運用上の差分はここに集約する。既存の[全体設計](../archive-major-update-design.md)と[2015年調査](../data-research-2015.md)を置き換えない。

- 公開の正本は既存Supabase。JSONL/CSVは調査・交換用であり、公開データではない。
- `pending` はDBの `draft`、人の `approved` は公開の必要条件の一部に相当する。`review` → 型別出典の確認 → 本文の公開操作を別々に実行する。自動承認しない。
- 新規イベント・人物・楽曲は作成しない。対象は既存event_id=167。人物は1〜4、曲は71・110・130を照合済み。坂元葉月は既存DBに人物IDがなく、文字列の発信者として調査中。人物への正式関連付けは編集者が歴代台帳と照合してから行う。
- 本文転載、引用、メディア埋め込みは今回実装しない。本人の言葉は出典で読め、展示本文は明示した編集要約のみ。`link_only` 固定。

## 実環境の棚卸し

開始時main、未追跡 `scripts/gas/`。適用対象の既存AGENTS.mdは開始時にはなし。専用ブランチ `codex/digital-museum` で作業。Next devがルートに生成するAGENTS.md/CLAUDE.mdはアプリの自動生成物。

ローカルSupabaseを起動して実測した値：既存イベント917件、人物4件、出典2件（追加移行適用前）。167/168/189のID・開催登録日・会場を実DBとseedで照合。Docker起動前はDBに接続できなかったため、過去ノートの件数を流用しなかった。本番は未照会・未変更。

再利用できるもの：

- `/timeline` はイベント・楽曲・衣装・動画・節目を既存取得関数から構成する実装。イベント詳細へ遷移する。
- `/events/[id]` はSSRで既存イベントと動画を読む。167の詳細に展示へのリンクだけを追加。
- `/members/[slug]`、`/songs/[id]`、`/costumes/[id]`、`/movies` は実ページと取得関数が存在。楽曲・衣装URLは設計初案のslugではなく実装の数値IDを使用。
- `sources` と `event_sources` 等の型別出典、`has_role_at_least`、`archive_audit_log`、監査付き管理RPCと直接書き込み禁止を再利用。
- `scripts/fetch-official-{discography,costumes}.mjs` と各migration生成器は公式作品・衣装向け。`data/research` はJSON、`data/import` は開始時にファイルなし。SNS全履歴の収集器ではない。今回は既存収集を再実行して上書きしない。

不足：出典本体のpublished_onは日付だけで、発信者・時刻精度・本文位置・回想・資料本文の個別承認が表現できなかった。追加テーブル `event_exhibit_cards` を既存event/source/memberのFKで接続した。イベント本体にはstatus列がなく、旧設計のpublished_legacy移行は実DBでは未実装。既存タイムラインも旧イベントのdescriptionを読むため、全面的な公開保証まで今回達成したとは扱わない。

`sources` は既存RLSで匿名から全書誌情報を読める。未承認の調査出典をここへ投入すると書誌情報を露出するため、今回の6件はDBへ投入していない。新規公開画面は展示カードのpublished/verifiedと型別出典を要求する。既存公開経路を強化する全体改修は別課題。

## プレビュー

Nodeはリポジトリの指定版を利用。DockerとローカルSupabaseを起動した後：

```bash
supabase start
npm run test:supabase
node scripts/preview-museum.mjs
```

`http://127.0.0.1:3000/archive/exhibit-preview/167` が実資料を使った編集確認画面。`http://127.0.0.1:3000/events/167/exhibit` は通常の公開用読み取りで、承認済みカードが0件のため資料不足を表示する。既存入口は `/timeline` → `/events/167` → 展示室。

編集プレビューは development、明示環境変数、ループバックDB、ループバック接続元をすべて満たす場合だけ開く。0.0.0.0へバインドしない。productionと条件不成立時は404。no-store/noindex。未承認の実調査ファイルと画面写真はGitの対象外。資料がないチェックアウトでは編集プレビューも空表示となる。調査ファイルはpublicへコピーせず、ブラウザbundleへimportせず、配布トレースから除外する。通常ページには研究用JSONLの読み込み経路を設けない。

## 編集・取り込み

```bash
npm run test:museum
node scripts/prepare-museum-import.mjs
```

前者は合成データによる参照・日付・公開境界の検査と、外部通信しない収集テスト。公開CIへ実調査データを渡さない。後者はローカルの調査ファイルが存在する環境で `data/import/museum/event-167-draft-plan.json` に6件の下書きRPC要求案を生成する。DB書き込み、資料の承認、公開は行わない。stable research_keyが重複排除キー。既存公開カードは取り下げ前に上書きできない。

人による原資料と該当箇所の確認後、既存の出典管理でcanonical sourceを確定し、案のsource_idと必要なmember_idを埋める。書誌情報自体の公開もこの時点で人が確認する。ログイン済みeditorのクライアントから `save_event_exhibit_draft(payload)` でdraftを保存する。認証情報をファイルやコマンド引数に書かない。

`transition_event_exhibit(card_id,'review',reason)` → reviewerが `review_event_exhibit_evidence(card_id,reason)` → reviewerが別操作で `transition_event_exhibit(card_id,'published',reason)`。出典確認と要約の承認を混同しない。既存rank、型別event_sources、監査ログを使い、authenticatedの直接INSERT/UPDATE/DELETEは許可しない。取り下げは `transition_event_exhibit(card_id,'withdrawn',reason)`。訂正は取り下げ→下書き修正→再レビュー。AIはこれらの承認・公開を実行しない。

公開列は `src/lib/museum/load.ts` で明示。研究メモ、reviewer情報、原文、素材URLは返さない。画像・動画がない状態が標準で、外部埋め込み失敗に依存しない。

## 続き

[調査範囲と台帳](research.md)、[データ辞書](data-dictionary.md)、[確認待ち](editorial-review.md)、[検証記録](verification.md)、[ロールバック](rollback.md)を参照。今回の成果は公開候補ではなく編集プレビュー。このブランチだけでは本番DBを変更していない。mainへのmergeは `.github/workflows/supabase-deploy.yml` が `supabase db push --yes --remote` を実行し、追加した2本のmigrationを本番へ適用する。外部連絡と契約は行っていない。
