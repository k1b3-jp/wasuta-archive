# データ辞書とDB対応（1.0）

これは現状の最小実装の辞書。表示非依存の今後の設計は[資料・史実モデル](content-model.md)を正とする。[収集・非公開保存層](collection.md)をローカルへ追加済みだが、展示の読み取りはまだ1.0であり、全体の移行済みではない。

調査JSONLとCSVは `data/research/museum/`、レビュー要求案は `data/import/museum/`。public・src/dataへ置かない。各レコードはschema_version、安定id、created_at、updated_atを持つ。作業日メタデータは公演日や投稿日時を表さない。人物や媒体が不明な値はnull。

|形式・フィールド|意味|公開DBへの対応|
|---|---|---|
|people.member_id / existing_slug|実DBで照合した既存人物ID/slug。坂元はnull|members。今回は新規人物を投入しない|
|accounts.owner/platform/url|発信主体と媒体。候補URLはofficial_statusで区別|調査台帳。新DBテーブルの増設は後続判断|
|accounts.official_evidence_url/locator|公式性の根拠と本文位置|承認前の調査情報。自動昇格しない|
|accounts.handle_history/platform_user_id|旧名・旧URL・有効期間・不変ID|未確定期間はnull、空配列は未調査の意味|
|cards.id / event_id|主張・資料抜粋単位の安定キーと既存公演|event_exhibit_cards.research_key / events FK|
|cards.source.url/title/publisher|固定URL、資料名、発行者|人が確認してsourcesの既存IDへ対応。未承認資料はsourcesへ新設しない|
|cards.member_id / speaker|既存人物との関連、記事内の著者名|members FK / speaker。共有ブログの所有者と著者を混同しない|
|cards.phase|before/day/after/recollection|発信の編集区分。dayは当日の出来事の記録であって掲載日保証ではない|
|cards.relation_kind|announcement/performance_report/reflection|告知を実施確認へ変換しない|
|cards.summary / locator|一つの編集要約と根拠の該当箇所|個別カードの本文・本文位置。data-claim-idでカードから原資料へ辿る|
|cards.published_on / published_at|発信日と時刻。ISO、時刻ありはoffset必須|date / timestamptz。公演日とは別|
|cards.date_precision|day/instant/unknown|unknownは両日付null。dayに架空の時刻を付けない。instantはJSTの日付整合もDB検査|
|cards.original_date_label|本文中の日付と移転・不確実さの説明|原表示を保持。ここから公開日時を機械推定しない|
|cards.original_publication_confirmed|その日に実際に公開された根拠があるか|falseは「当時をたどる」から除外|
|cards.representation_type|今回はparaphrase固定|UIで編集要約と表示。引用・原文の列は作らない|
|cards.usage_status|今回はlink_only固定|公開素材URLやembed権限へ変換しない|
|cards.review_status / verification_status|pendingとsupportedは異なる|内容を資料が支えることと、人が承認したことを分ける|
|song_candidates.claim_id|曲の関係を支えるカードID|参照切れを検査。song_eventsへの自動投入はしない|
|coverage|調査期間、方法、既知総数、取得件数、制約|研究用のみ。総数不明から収集率を作らない|

今回の縦切りでは汎用claims/passages/relationsを一組ずつDBに新設せず、一つのcardsレコードを「1編集要約＋1該当箇所＋1原資料」に限定した。独立した主張へ分解する必要があるときは別カードに分ける。複数資料の賛否・矛盾グループを扱う次版では収集契約を改版する。未解決の矛盾をこの版の公開カードへ流し込まない。

DB状態はdraft/review/published/withdrawn。verified、reviewed_by、reviewed_at、型別event_sourcesの検証が揃わない公開は不可。statusをJSONLから直接コピーしない。公開は監査付きRPC。書誌自体が既存で公開されることと、カードが公開できることは別。

公開UIはlink_onlyの要約と書誌、該当箇所、日付、発信者だけを選択し、監査情報・取得メモ・原文・トークンを返さない。ローカル限定編集画面だけが未承認カードを読める。


## 非公開の収集契約（2.0）

収集用の `archive_research` は展示カード1.0と独立する。`source_records` が原資料の同一性、`source_versions` が取得内容の版、`source_observations` が取得時点・指標、`passages` が版ごとの該当箇所、`editorial_proposals` が未承認の編集案を保持する。該当箇所のキーは版を含み、編集案も版・要約内容が変われば別キーとなる。同じ投稿をAPIとブラウザで観測しても `x:<投稿ID>` が同一資料キーとなり、表現の違いは版として残す。

ブラウザ観測は `method=x_browser_visible`、`content_status=partial`、`representation=accessibility_post_summary`。画面要約は本人の原文と同一視しない。UIラベルの混在、非取得の画像・動画・隠れた本文をlocatorに明示する。表示日だけなら `published_on` のみ、時刻はnull、表示タイムゾーンは未確認、元公開日の確認はfalse。投稿IDから日時を推定しない。任意の入力項目や認証情報をそのまま保存せず、許可した項目だけを正規化する。

非公開保存は公開承認を意味しない。既存の公開DB・承認経路への接続は人の確認を必要とし、公開APIには収集表を追加しない。再実行・抑止・取得範囲は[収集運用](collection.md)を参照。
