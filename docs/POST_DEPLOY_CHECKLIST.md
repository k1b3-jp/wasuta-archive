# デプロイ後対応チェックリスト

本リリースで行った変更に伴う、デプロイ後の確認・対応事項です。必要な作業を順序立てて実施してください。

## 1. 環境変数の確認
- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が本番環境に設定されていることを確認する（`src/lib/supabaseClient.ts:3-13`）。
- 誤ってローカルのストレージURL（`http://127.0.0.1:54321/...`）を参照していないことを確認する。

## 2. セキュリティヘッダー（CSP）の確認
- 本番環境のレスポンスヘッダーに `Content-Security-Policy` が設定されていることを確認する（`next.config.js:24-51`）。
  - 本番CSP概要：
    - `default-src 'self'`
    - `script-src 'self' 'unsafe-inline' https:`
    - `style-src 'self' 'unsafe-inline' https:`
    - `img-src 'self' data: https:`
    - `font-src 'self' data: https:`
    - `connect-src 'self' https://*.supabase.co`
    - `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com`
    - `frame-ancestors 'self'`
- 画像が外部 `https` オリジンから正常に読み込めることを確認する（`img-src https:` により許可）。
- YouTube 埋め込みが正常に表示されることを確認する（`frame-src` 設定）。

## 3. 動作確認（ログイン有無）
- 未ログインとログイン状態の両方で、YouTube動画が再生できることを確認する。
- 既知のブラウザコンソール通知：`Permissions policy violation: compute-pressure` は外部プレイヤー起因の通知であり、再生に影響しない想定。

## 4. UI動作の回帰確認
- ポップオーバー内ボタンのクリック動作を確認する（`src/components/events/HistoryItem.tsx:98-101, 123-131`）。
  - `Popover.Button` を `as="div"` 化して `button` の入れ子を解消済み。
  - クローズボタンに不要な `onClick={close}` を削除済み。

## 5. ビルド・品質チェック
- リリース前後で以下を実行し、エラーがないことを確認する。
  - `yarn build`
  - `yarn lint`
  - `yarn check`

## 6. 追加の調整が必要な場合
- 画像の取得元が `https` 以外（例：独自CDNの `http`）に変わる場合、`next.config.js` の本番 `CSP` に対象オリジンを追加する（`img-src`）。
- `next/image` を用いて外部ドメインから取得する場合は、必要に応じて `images.domains` を更新する（`next.config.js:17-20`）。

## 7. ログ監視
- デプロイ直後は、以下を重点監視する：
  - ネットワークエラー（画像取得、Supabase API への接続）
  - フレーム埋め込みエラー（YouTube）
  - CSP 違反レポート（必要に応じて Report-Only の導入を検討）

